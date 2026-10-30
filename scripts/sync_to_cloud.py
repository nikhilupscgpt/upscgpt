import sys
import os
import json
import ssl
import urllib.parse
import pg8000.native

TABLE_ORDER = [
    "Subject",
    "Topic",
    "MicroTheme",
    "TaxonomyAlias",
    "Organization",
    "User",
    "Account",
    "OptionalSubject",
    "PlatformConfig",
    "SourceDocument",
    "IngestionRun",
    "NewsStreak",
    "MapEntry",
    "Issue",
    "NodeContent",
    "Article",
    "Editorial",
    "TimelineEvent",
    "Passage",
    "Question",
    "QuestionMicroTheme",
    "QuestionSource",
    "QuestionRevision",
    "TestPaper",
    "TestPaperQuestion",
    "Attempt",
    "AttemptAnswer",
    "QuestionBookmark",
    "FavoriteEntry",
    "UserNote",
    "Bookmark",
    "IssueProgress",
    "IssueFollow",
    "SubjectContent",
    "mapping_pyqs",
    "places_in_news"
]

def format_sql_val(v, dt, udt):
    if v is None:
        return "NULL"
    if dt == "ARRAY":
        if isinstance(v, str) and v.startswith("[") and v.endswith("]"):
            try:
                parsed_list = json.loads(v)
            except:
                parsed_list = [v]
        elif isinstance(v, list):
            parsed_list = v
        else:
            parsed_list = [v]
        # Format as ARRAY['a', 'b']
        escaped_items = ["'" + str(x).replace("'", "''") + "'" for x in parsed_list]
        return f"ARRAY[{', '.join(escaped_items)}]::text[]"
    elif dt in ("json", "jsonb") or udt in ("json", "jsonb"):
        if isinstance(v, (dict, list)):
            s = json.dumps(v)
        elif isinstance(v, str):
            try:
                json.loads(v)
                s = v
            except:
                s = json.dumps(v)
        else:
            s = json.dumps(v)
        return "'" + s.replace("'", "''") + "'::jsonb"
    elif dt in ("integer", "smallint", "bigint", "double precision", "numeric", "real"):
        return str(v)
    elif dt == "boolean":
        return "TRUE" if v else "FALSE"
    else:
        # text, varchar, timestamp, etc.
        s = str(v).replace("'", "''")
        return f"'{s}'"

def sync_to_cloud(cloud_db_url):
    print("="*60)
    print("UPSC ATLAS: FAST BATCH SYNC TO NEON")
    print("="*60)
    
    parsed = urllib.parse.urlparse(cloud_db_url)
    username = urllib.parse.unquote(parsed.username) if parsed.username else "postgres"
    password = urllib.parse.unquote(parsed.password) if parsed.password else None
    hostname = parsed.hostname
    port = parsed.port or 5432
    dbname = parsed.path.lstrip("/") or "postgres"

    print(f"Connecting to Neon: {hostname}:{port}/{dbname}...")
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    conn = pg8000.native.Connection(
        user=username,
        password=password,
        host=hostname,
        port=port,
        database=dbname,
        ssl_context=ssl_ctx
    )
    
    try:
        conn.run("CREATE EXTENSION IF NOT EXISTS vector;")
    except Exception as e:
        print(f"Notice: {e}")

    backup_dir = "/Users/nikhilwandhe/Desktop/UPSC_ATLAS_EMERGENCY_BACKUP_20260922/backups"
    backups = sorted([f for f in os.listdir(backup_dir) if f.endswith(".json")])
    if not backups:
        print("Error: No backup json found.")
        return
    
    latest_backup = os.path.join(backup_dir, backups[-1])
    print(f"Reading snapshot: {backups[-1]}...")
    with open(latest_backup, "r", encoding="utf-8") as f:
        data = json.load(f)

    tables_data = data["tables"]
    total_inserted = 0
    issue_parent_links = {}

    for table in TABLE_ORDER:
        if table not in tables_data:
            continue
        rows = tables_data[table]
        if not rows:
            continue

        exists = conn.run(f"SELECT to_regclass('public.\"{table}\"');")[0][0]
        if not exists:
            continue

        cols_meta = conn.run(f"""
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '{table}';
        """)
        type_map = {c[0]: (c[1], c[2]) for c in cols_meta}

        print(f"Syncing {table} ({len(rows)} rows in batches)...")
        conn.run(f'TRUNCATE TABLE "{table}" CASCADE;')
        
        # Batch insert in chunks of 100
        CHUNK_SIZE = 100
        for i in range(0, len(rows), CHUNK_SIZE):
            chunk = rows[i:i + CHUNK_SIZE]
            
            value_rows_sql = []
            valid_cols = None
            
            for row in chunk:
                if table == "Issue" and row.get("parentIssueId"):
                    issue_parent_links[row["id"]] = row["parentIssueId"]
                    row_copy = dict(row)
                    row_copy["parentIssueId"] = None
                else:
                    row_copy = row

                if valid_cols is None:
                    valid_cols = [c for c in row_copy.keys() if c in type_map]
                
                row_vals = []
                for c in valid_cols:
                    v = row_copy[c]
                    dt, udt = type_map[c]
                    row_vals.append(format_sql_val(v, dt, udt))
                
                value_rows_sql.append("(" + ", ".join(row_vals) + ")")

            cols_header = ", ".join([f'"{c}"' for c in valid_cols])
            all_values_sql = ",\n".join(value_rows_sql)
            insert_stmt = f'INSERT INTO "{table}" ({cols_header}) VALUES\n{all_values_sql};'
            
            conn.run(insert_stmt)
            total_inserted += len(chunk)

    if issue_parent_links:
        print(f"Linking {len(issue_parent_links)} parent-sub-issue relationships...")
        for issue_id, parent_id in issue_parent_links.items():
            conn.run(f'UPDATE "Issue" SET "parentIssueId" = \'{parent_id}\' WHERE "id" = \'{issue_id}\';')

    print("="*60)
    print(f"SUCCESS: {total_inserted} records pushed to Neon cloud database!")
    print("="*60)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/sync_to_cloud.py <DATABASE_URL>")
        sys.exit(1)
    sync_to_cloud(sys.argv[1])

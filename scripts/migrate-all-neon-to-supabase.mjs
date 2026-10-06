import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const neonUrl = "postgresql://neondb_owner:npg_9AHQ1IBphyFq@ep-floral-field-am53mgn5.c-5.us-east-1.aws.neon.tech/neondb";
const supabaseUrl = process.env.DIRECT_URL.replace(/[?&]sslmode=[^&]+/, "");

const tablesToMigrate = [
  "User",
  "Account",
  "Session",
  "VerificationToken",
  "PlatformConfig",
  "OptionalSubject",
  "Organization",
  "Issue",
  "MapEntry",
  "FavoriteEntry",
  "NewsStreak",
  "_NewsStreakIssues",
  "_IssueRelations",
  "Article",
  "Editorial",
  "TimelineEvent",
  "NodeContent",
  "SubjectContent",
  "PreviousYearQuestion",
  "PYQLink",
  "Question",
  "TestPack",
  "_TestPackQuestions",
  "QuizPack",
  "QuizAttempt",
  "UserNote",
  "Bookmark",
  "IssueProgress",
  "IssueFollow",
  "Subscription",
  "PaymentLog",
  "CommunicationLog",
  "ActionLog",
  "RegionInsightCache"
];

const JSONB_COLUMNS = new Set([
  'Editorial.structuredData',
  'Issue.metadata',
  'Issue.prelimsNote',
  'Issue.mainsNote',
  'Article.structuredData',
  'NodeContent.facts',
  'NodeContent.caseStudies',
  'NodeContent.recommendations',
  'User.preferences',
  'QuizAttempt.breakdown',
  'PreviousYearQuestion.metadata',
  'Question.options',
  'Question.options_hi',
  'Question.options_mr'
]);

const VECTOR_COLUMNS = new Set([
  'Issue.embedding',
  'SubjectContent.embedding',
  'PreviousYearQuestion.embedding'
]);

async function migrate() {
  console.log("Starting NeonDB -> Supabase Full Migration...");
  console.log("Source: NeonDB (production)");
  console.log("Destination: Supabase (nikhilupscgpt)");

  const neon = new Client({ connectionString: neonUrl, ssl: { rejectUnauthorized: false } });
  const supa = new Client({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });

  await neon.connect();
  await supa.connect();
  console.log("Connected to both databases successfully.");

  // Disable FK triggers during load
  await supa.query("SET session_replication_role = 'replica';");
  console.log("Disabled FK constraint triggers on Supabase.");

  // Truncate all tables in Supabase to start fresh with clean production data
  console.log("Cleaning existing Supabase tables...");
  for (const table of [...tablesToMigrate].reverse()) {
    try {
      await supa.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (e) {
      console.log(`Could not truncate ${table}: ${e.message}`);
    }
  }

  // Migrate table by table
  for (const table of tablesToMigrate) {
    const countRes = await neon.query(`SELECT count(*) FROM "${table}";`);
    const count = parseInt(countRes.rows[0].count, 10);
    if (count === 0) {
      console.log(`Table "${table}": 0 rows (skipped)`);
      continue;
    }

    console.log(`Migrating "${table}": fetching ${count} rows from NeonDB...`);
    const rowsRes = await neon.query(`SELECT * FROM "${table}";`);
    const rows = rowsRes.rows;

    if (rows.length === 0) continue;

    const cols = Object.keys(rows[0]);
    const colList = cols.map(c => `"${c}"`).join(", ");

    // Prepare placeholders
    const placeholderList = cols.map((c, idx) => {
      const key = `${table}.${c}`;
      if (VECTOR_COLUMNS.has(key)) return `$${idx + 1}::vector`;
      if (JSONB_COLUMNS.has(key)) return `$${idx + 1}::jsonb`;
      return `$${idx + 1}`;
    }).join(", ");

    const insertQuery = `INSERT INTO "${table}" (${colList}) VALUES (${placeholderList});`;

    let inserted = 0;
    for (const row of rows) {
      const values = cols.map(c => {
        const val = row[c];
        const key = `${table}.${c}`;
        if (val === null || val === undefined) return null;
        if (JSONB_COLUMNS.has(key)) {
          return JSON.stringify(val);
        }
        return val;
      });

      try {
        await supa.query(insertQuery, values);
        inserted++;
      } catch (err) {
        console.error(`Error inserting into "${table}" (row id ${row.id || 'N/A'}):`, err.message);
        throw err;
      }
    }

    console.log(`Table "${table}": migrated ${inserted}/${count} rows.`);
  }

  // Setup/ensure Admin user
  console.log("Setting up Admin user and admin privileges...");
  const adminCheck = await supa.query(`SELECT id FROM "User" WHERE username = 'admin';`);
  const adminPasswordHash = await bcrypt.hash('AdminPassword2026!', 10);

  if (adminCheck.rows.length === 0) {
    console.log("Creating dedicated 'admin' user with username credentials...");
    await supa.query(`
      INSERT INTO "User" (id, email, username, password, role, tier, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW());
    `, [
      'cmuv4hf790000egfkv3lp4hce',
      'admin@upscatlas.com',
      'admin',
      adminPasswordHash,
      'ADMIN',
      'PREMIUM'
    ]);
  } else {
    console.log("Updating existing 'admin' user password and role...");
    await supa.query(`
      UPDATE "User"
      SET password = $1, role = 'ADMIN', tier = 'PREMIUM'
      WHERE username = 'admin';
    `, [adminPasswordHash]);
  }

  // Also elevate nikhil@upscgpt.in to ADMIN
  const elevateRes = await supa.query(`
    UPDATE "User"
    SET role = 'ADMIN', tier = 'PRO'
    WHERE email = 'nikhil@upscgpt.in'
    RETURNING id, email, role;
  `);
  if (elevateRes.rows.length > 0) {
    console.log("Elevated nikhil@upscgpt.in to ADMIN:", elevateRes.rows[0]);
  }

  // Re-enable FK triggers
  await supa.query("SET session_replication_role = 'origin';");
  console.log("Re-enabled FK constraint triggers on Supabase.");

  // Verification
  console.log("\n================ MIGRATION AUDIT ================");
  console.log(String("Table Name").padEnd(30) + String("NeonDB").padEnd(15) + "Supabase");
  console.log("-------------------------------------------------");
  for (const table of tablesToMigrate) {
    const cN = await neon.query(`SELECT count(*) FROM "${table}";`);
    const cS = await supa.query(`SELECT count(*) FROM "${table}";`);
    console.log(String(table).padEnd(30) + String(cN.rows[0].count).padEnd(15) + cS.rows[0].count);
  }
  console.log("=================================================\n");

  await neon.end();
  await supa.end();
  console.log("Full Migration from NeonDB to Supabase COMPLETED SUCCESSFULLY!");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});

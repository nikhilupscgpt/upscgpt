#!/usr/bin/env python3
"""
UPSC Atlas — Similar PYQ Clustering & Curation CLI
Identifies, clusters, and clubs cross-year similar PYQ families.

Usage:
    python3 scripts/cluster_similar_pyqs.py --subject "Indian Polity" --limit 20
    python3 scripts/cluster_similar_pyqs.py --interactive
    python3 scripts/cluster_similar_pyqs.py --export clusters.json
    python3 scripts/cluster_similar_pyqs.py --merge --anchor <ID> --ids <ID1>,<ID2>,<ID3>
    python3 scripts/cluster_similar_pyqs.py --reject --cluster <CLUSTER_ID>
"""

import sys
import os
import json
import argparse
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

def run_node_engine(action, payload):
    """Bridge to src/lib/pyq-similar-engine.js using Node subprocess."""
    js_code = f"""
    import {{ generateSimilarPyqClusters, mergeClusterQuestions, rejectCluster }} from './src/lib/pyq-similar-engine.js';
    
    async function execute() {{
      const action = {json.dumps(action)};
      const payload = {json.dumps(payload)};
      
      if (action === 'generate') {{
        const res = await generateSimilarPyqClusters(payload);
        return res;
      }} else if (action === 'merge') {{
        const res = await mergeClusterQuestions(payload);
        return res;
      }} else if (action === 'reject') {{
        const res = await rejectCluster(payload);
        return res;
      }} else {{
        throw new Error('Unknown action: ' + action);
      }}
    }}
    
    execute()
      .then(res => {{
        console.log('__PYQ_RESULT_START__');
        console.log(JSON.stringify(res));
        console.log('__PYQ_RESULT_END__');
        process.exit(0);
      }})
      .catch(err => {{
        console.error(err);
        process.exit(1);
      }});
    """

    res = subprocess.run(
        ['node', '--input-type=module', '-e', js_code],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True
    )

    if res.returncode != 0:
        raise RuntimeError(f"Engine execution failed:\n{res.stderr}\n{res.stdout}")

    out = res.stdout
    start_tag = '__PYQ_RESULT_START__'
    end_tag = '__PYQ_RESULT_END__'
    if start_tag in out and end_tag in out:
        json_str = out.split(start_tag)[1].split(end_tag)[0].strip()
        return json.loads(json_str)
    else:
        raise ValueError(f"Could not parse engine output:\n{out}")

def interactive_curator(clusters):
    """Run an interactive checkbox-style review session in the terminal."""
    total = len(clusters)
    if total == 0:
        print("\n✨ No pending similar PYQ clusters found.")
        return

    print(f"\n================================================================================")
    print(f"  🔍 UPSC SIMILAR PYQ CURATION DESK — {total} Candidate Clusters Found")
    print(f"================================================================================\n")

    for idx, cluster in enumerate(clusters, 1):
        print(f"\n--------------------------------------------------------------------------------")
        print(f"[{idx}/{total}] CLUSTER: {cluster['theme']}")
        print(f"Subject: {cluster['subject']} | Confidence: {cluster['confidence']}% | Years: {', '.join(str(y) for y in cluster['years'])}")
        print(f"Key Concepts: {', '.join(cluster['sharedConcepts'])}")
        print(f"--------------------------------------------------------------------------------")

        questions = cluster['questions']
        # State: array of booleans whether question is selected
        selected_mask = [True] * len(questions)
        anchor_idx = 0

        while True:
            print("\nQuestions in this candidate group (Select which to club):")
            for q_idx, q in enumerate(questions):
                chk = "[X]" if selected_mask[q_idx] else "[ ]"
                anchor_star = " ⭐ (Anchor)" if q_idx == anchor_idx else ""
                stem_preview = q['stem'].replace('\n', ' ')
                if len(stem_preview) > 130:
                    stem_preview = stem_preview[:127] + "..."
                print(f"  {q_idx + 1}. {chk} UPSC {q['examYear']} Q#{q['questionNo']}{anchor_star}")
                print(f"     \"{stem_preview}\"")

            sel_count = sum(selected_mask)
            print(f"\nCurrently selected: {sel_count} of {len(questions)}")
            print("Commands:")
            print("  toggle <num>   : Check/uncheck a question (e.g. 'toggle 2')")
            print("  anchor <num>   : Set question as primary anchor (e.g. 'anchor 1')")
            print("  all / none     : Select all or unselect all")
            print("  m / merge      : MERGE selected questions into Similar PYQ Family")
            print("  r / reject     : REJECT / DISMISS cluster as false positive")
            print("  s / skip       : Skip to next cluster without action")
            print("  q / quit       : Exit curation session")

            try:
                cmd = input("\nAction > ").strip().lower()
            except (KeyboardInterrupt, EOFError):
                print("\nExiting curation.")
                return

            if not cmd:
                continue

            if cmd in ('q', 'quit'):
                print("Curation session ended.")
                return

            if cmd in ('s', 'skip'):
                print("Skipped cluster.")
                break

            if cmd == 'all':
                selected_mask = [True] * len(questions)
                continue

            if cmd == 'none':
                selected_mask = [False] * len(questions)
                continue

            if cmd.startswith('toggle'):
                parts = cmd.split()
                if len(parts) == 2 and parts[1].isdigit():
                    num = int(parts[1]) - 1
                    if 0 <= num < len(questions):
                        selected_mask[num] = not selected_mask[num]
                    else:
                        print("Invalid question number.")
                else:
                    print("Usage: toggle <number>")
                continue

            if cmd.startswith('anchor'):
                parts = cmd.split()
                if len(parts) == 2 and parts[1].isdigit():
                    num = int(parts[1]) - 1
                    if 0 <= num < len(questions):
                        anchor_idx = num
                        selected_mask[num] = True
                        print(f"Set question {num + 1} as anchor.")
                    else:
                        print("Invalid question number.")
                else:
                    print("Usage: anchor <number>")
                continue

            if cmd in ('m', 'merge'):
                selected_ids = [q['id'] for i, q in enumerate(questions) if selected_mask[i]]
                if len(selected_ids) < 2:
                    print("❌ Error: You must select at least 2 questions to form a similar family.")
                    continue

                anchor_id = questions[anchor_idx]['id']
                if anchor_id not in selected_ids:
                    anchor_id = selected_ids[0]

                takeaway_prompt = input(f"Key Takeaway [{cluster['defaultTakeaway']}]: ").strip()
                final_takeaway = takeaway_prompt if takeaway_prompt else cluster['defaultTakeaway']

                print(f"Merging {len(selected_ids)} questions under theme '{cluster['theme']}'...")
                res = run_node_engine('merge', {
                    'anchorId': anchor_id,
                    'selectedIds': selected_ids,
                    'keyTakeaway': final_takeaway,
                    'theme': cluster['theme']
                })
                print(f"✅ Success! Linked {res.get('count', len(selected_ids))} questions.")
                break

            if cmd in ('r', 'reject'):
                reason = input("Rejection reason [False positive / not similar]: ").strip()
                reason = reason or "False positive / not similar"
                res = run_node_engine('reject', {
                    'clusterId': cluster['id'],
                    'questionIds': [q['id'] for q in questions],
                    'reason': reason
                })
                print(f"🚫 Cluster rejected and dismissed from candidate queue.")
                break

            print("Unrecognized command.")

def main():
    parser = argparse.ArgumentParser(description="UPSC Similar PYQ Clustering and Curation Engine")
    parser.add_argument("--subject", type=str, default="ALL", help="Filter by subject (e.g. 'Indian Polity', 'Economy', 'Geography', 'ALL')")
    parser.add_argument("--status", type=str, default="unreviewed", choices=["unreviewed", "verified", "dismissed", "all"], help="Filter by cluster status")
    parser.add_argument("--limit", type=int, default=30, help="Maximum number of clusters to fetch")
    parser.add_argument("--interactive", action="store_true", help="Launch interactive CLI review session with checkboxes")
    parser.add_argument("--export", type=str, help="Export candidate clusters to JSON file")
    
    # Direct command actions
    parser.add_argument("--merge", action="store_true", help="Perform direct merge action")
    parser.add_argument("--anchor", type=str, help="Anchor question ID for merge")
    parser.add_argument("--ids", type=str, help="Comma-separated question IDs to merge")
    parser.add_argument("--takeaway", type=str, default="", help="Custom takeaway note for merge")
    
    parser.add_argument("--reject", action="store_true", help="Perform direct reject action")
    parser.add_argument("--cluster", type=str, help="Cluster ID to reject")
    parser.add_argument("--reason", type=str, default="Dismissed via CLI", help="Reason for rejection")

    args = parser.parse_args()

    # Direct merge action
    if args.merge:
        if not args.ids:
            print("Error: --ids <comma_separated_ids> required for merge.")
            sys.exit(1)
        selected_ids = [x.strip() for x in args.ids.split(',') if x.strip()]
        if len(selected_ids) < 2:
            print("Error: At least 2 question IDs required to merge.")
            sys.exit(1)
        anchor_id = args.anchor or selected_ids[0]
        res = run_node_engine('merge', {
            'anchorId': anchor_id,
            'selectedIds': selected_ids,
            'keyTakeaway': args.takeaway,
            'theme': 'Manual CLI Merge'
        })
        print(f"Successfully merged {res.get('count', len(selected_ids))} questions into similar family.")
        return

    # Direct reject action
    if args.reject:
        if not args.cluster:
            print("Error: --cluster <cluster_id> required for reject.")
            sys.exit(1)
        run_node_engine('reject', {
            'clusterId': args.cluster,
            'reason': args.reason
        })
        print(f"Successfully rejected cluster {args.cluster}.")
        return

    # Generate clusters
    print(f"Generating similar PYQ clusters for subject='{args.subject}', status='{args.status}', limit={args.limit}...")
    res = run_node_engine('generate', {
        'subject': args.subject,
        'status': args.status,
        'limit': args.limit
    })

    clusters = res.get('clusters', [])
    stats = res.get('stats', {})

    print(f"Found {len(clusters)} clusters (Total pool candidates: {stats.get('totalFound', 0)}).")

    if args.export:
        with open(args.export, 'w', encoding='utf-8') as f:
            json.dump(res, f, indent=2)
        print(f"Clusters successfully exported to '{args.export}'.")
        return

    if args.interactive:
        interactive_curator(clusters)
    else:
        # Summary display
        for idx, c in enumerate(clusters[:15], 1):
            print(f"{idx:2d}. [{c['confidence']}%] {c['theme']} (Years: {', '.join(str(y) for y in c['years'])}) — {len(c['questions'])} questions")
        print("\nTip: Run with --interactive to review, toggle checkboxes, and merge/reject clusters interactively.")

if __name__ == '__main__':
    main()

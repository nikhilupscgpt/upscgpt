import sys
sys.path.append('scripts')
from data_2026_part1 import part1
from data_2026_part2 import part2
from data_2026_part3 import part3
from data_2026_part4 import part4
import json
import os

questions = part1 + part2 + part3 + part4
assert len(questions) == 100

os.makedirs('pyq_data', exist_ok=True)
jsonl_path = 'pyq_data/upsc_cse_prelims_2026.jsonl'

with open(jsonl_path, 'w') as f:
    for q in questions:
        pad_no = str(q['questionNo']).zfill(2)
        qid = f"UPSC-2026-{pad_no}"
        embed_opts = "\n".join([f"({o['label']}) {o['text']}" for o in q['options']])
        ans_str = f"({q['correctLabel']})" if q['correctLabel'] else "(Dropped)"
        embed_text = f"{q['srcSubject']} | {q['srcTopic']} | UPSC CSE Pre 2026\nQuestion: {q['stem']}\n{embed_opts}\nAnswer: {ans_str}"
        
        row = {
            "id": qid,
            "questionNo": q['questionNo'],
            "examName": "UPSC CSE Pre",
            "examYear": 2026,
            "srcSubject": q['srcSubject'],
            "srcTopic": q['srcTopic'],
            "stem": q['stem'],
            "options": q['options'],
            "correctLabel": q['correctLabel'],
            "embedText": embed_text
        }
        f.write(json.dumps(row, ensure_ascii=False) + '\n')

print(f"Generated {jsonl_path} with 100 questions.")

# Now generate build_2026_pyq.mjs
mjs_content = "import fs from 'fs';\n\nconst questions = " + json.dumps(questions, indent=2, ensure_ascii=False) + ";\n\n"
mjs_content += """const outputFile = 'pyq_data/upsc_cse_prelims_2026.jsonl';
const stream = fs.createWriteStream(outputFile, { flags: 'w' });

for (const q of questions) {
  const padNo = String(q.questionNo).padStart(2, '0');
  const id = `UPSC-2026-${padNo}`;
  const embedText = `${q.srcSubject} | ${q.srcTopic} | UPSC CSE Pre 2026\\nQuestion: ${q.stem}\\n${q.options.map(o => `(${o.label}) ${o.text}`).join('\\n')}\\nAnswer: (${q.correctLabel || 'Dropped'})`;

  const jsonlRow = {
    id,
    questionNo: q.questionNo,
    examName: "UPSC CSE Pre",
    examYear: 2026,
    srcSubject: q.srcSubject,
    srcTopic: q.srcTopic,
    stem: q.stem,
    options: q.options,
    correctLabel: q.correctLabel,
    embedText
  };

  stream.write(JSON.stringify(jsonlRow) + '\\n');
}

stream.end();
console.log(`Successfully generated ${questions.length} questions in ${outputFile}`);
"""

with open('scripts/build_2026_pyq.mjs', 'w') as f:
    f.write(mjs_content)

print("Generated scripts/build_2026_pyq.mjs successfully!")


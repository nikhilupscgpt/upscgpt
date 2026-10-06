import re
import os

schema_path = "/Users/nikhilwandhe/.gemini/antigravity/scratch/upsc_atlas_portal/prisma/schema.prisma"

with open(schema_path, 'r') as f:
    content = f.read()

# Replace inline enums with proper block enums
enums = {
    "PaperType": "GS1\n  CSAT",
    "QuestionOrigin": "PYQ\n  PRACTICE\n  MOCK",
    "QuestionStatus": "DRAFT\n  PUBLISHED\n  ARCHIVED",
    "Difficulty": "EASY\n  MEDIUM\n  HARD",
    "DifficultySource": "SOURCE\n  AI\n  MANUAL\n  COMPUTED",
    "QuestionType": "SINGLE_CORRECT\n  MULTI_STATEMENT\n  MATCH_FOLLOWING\n  ASSERTION_REASON\n  PASSAGE_BASED\n  OTHER",
    "AnswerStatus": "UNVERIFIED\n  VERIFIED\n  CONFLICT",
    "DocKind": "QUESTION_PAPER\n  ANSWER_KEY\n  PRACTICE_SET\n  MIXED",
    "RunStatus": "QUEUED\n  RUNNING\n  DONE\n  FAILED",
    "DraftStatus": "PENDING\n  APPROVED\n  REJECTED\n  DUPLICATE\n  PUBLISHED",
    "TaxLevel": "SUBJECT\n  TOPIC\n  THEME",
    "AttemptMode": "PRACTICE\n  TEST"
}

for e_name, e_vals in enums.items():
    content = re.sub(rf'enum {e_name}\s+{{.*?}}', f'enum {e_name} {{\n  {e_vals}\n}}', content)

with open(schema_path, 'w') as f:
    f.write(content)

import re
import os

schema_path = "/Users/nikhilwandhe/.gemini/antigravity/scratch/upsc_atlas_portal/prisma/schema.prisma"

with open(schema_path, 'r') as f:
    content = f.read()

# 1. Update User relations
content = re.sub(r'\s*QuizAttempt\s+QuizAttempt\[\]', '', content)
content = content.replace('notes              UserNote[]', 'notes              UserNote[]\n  attempts           Attempt[]\n  questionBookmarks  QuestionBookmark[]')

# 2. Update Issue relations
content = re.sub(r'\s*pyqLinks\s+PYQLink\[\]', '', content)
content = re.sub(r'\s*testPacks\s+TestPack\[\]', '', content)
content = re.sub(r'\s*questions\s+Question\[\]', '', content)

# 3. Update OptionalSubject relations
content = re.sub(r'\s*pyqs\s+PreviousYearQuestion\[\]', '', content)

# 4. Remove Models
content = re.sub(r'/// Links Issues to Past Year Questions\..*?model PYQLink \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'model QuizPack \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'model Question \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'model TestPack \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'model QuizAttempt \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'model PreviousYearQuestion \{.*?\}\n', '', content, flags=re.DOTALL)

# 5. Append new PrelimsGPT models
new_models = """
enum PaperType      { GS1 CSAT }
enum QuestionOrigin { PYQ PRACTICE MOCK }
enum QuestionStatus { DRAFT PUBLISHED ARCHIVED }
enum Difficulty     { EASY MEDIUM HARD }
enum DifficultySource { SOURCE AI MANUAL COMPUTED }
enum QuestionType   { SINGLE_CORRECT MULTI_STATEMENT MATCH_FOLLOWING ASSERTION_REASON PASSAGE_BASED OTHER }
enum AnswerStatus   { UNVERIFIED VERIFIED CONFLICT }
enum DocKind        { QUESTION_PAPER ANSWER_KEY PRACTICE_SET MIXED }
enum RunStatus      { QUEUED RUNNING DONE FAILED }
enum DraftStatus    { PENDING APPROVED REJECTED DUPLICATE PUBLISHED }
enum TaxLevel       { SUBJECT TOPIC THEME }
enum AttemptMode    { PRACTICE TEST }

// ---------- Taxonomy (starts empty, fully editable) ----------
model Subject {
  id        String   @id @default(cuid())
  paper     PaperType
  name      String
  slug      String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  topics    Topic[]
  questions Question[]
  aliases   TaxonomyAlias[]
  @@unique([paper, slug])
}

model Topic {
  id        String   @id @default(cuid())
  subjectId String
  name      String
  slug      String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  subject   Subject  @relation(fields: [subjectId], references: [id])
  themes    MicroTheme[]
  questions Question[]
  aliases   TaxonomyAlias[]
  @@unique([subjectId, slug])
  @@index([subjectId])
}

model MicroTheme {
  id        String   @id @default(cuid())
  topicId   String
  name      String
  slug      String
  isActive  Boolean  @default(true)
  topic     Topic    @relation(fields: [topicId], references: [id])
  questions QuestionMicroTheme[]
  aliases   TaxonomyAlias[]
  @@unique([topicId, slug])
  @@index([topicId])
}

// Maps a publisher's label to a canonical item
model TaxonomyAlias {
  id         String    @id @default(cuid())
  level      TaxLevel
  label      String            // normalised source label
  publisher  String?
  subjectId  String?
  topicId    String?
  themeId    String?
  subject    Subject?    @relation(fields: [subjectId], references: [id])
  topic      Topic?      @relation(fields: [topicId], references: [id])
  theme      MicroTheme? @relation(fields: [themeId], references: [id])
  createdAt  DateTime  @default(now())
  @@unique([level, label, publisher])
}

// ---------- Sources and ingestion ----------
model SourceDocument {
  id         String   @id @default(cuid())
  fileName   String
  fileHash   String   @unique
  storageUrl String
  publisher  String?
  kind       DocKind
  yearHint   Int?
  paperHint  PaperType?
  pageCount  Int?
  uploadedBy String
  createdAt  DateTime @default(now())
  runs       IngestionRun[]
  drafts     QuestionDraft[]
  sources    QuestionSource[]
}

model IngestionRun {
  id          String    @id @default(cuid())
  documentId  String
  status      RunStatus @default(QUEUED)
  model       String?
  stats       Json?              // pages, parsed, flagged, failed
  errorLog    Json?
  startedAt   DateTime  @default(now())
  finishedAt  DateTime?
  document    SourceDocument @relation(fields: [documentId], references: [id])
  drafts      QuestionDraft[]
  @@index([documentId])
}

model QuestionDraft {
  id            String      @id @default(cuid())
  runId         String
  documentId    String
  pageNo        Int?
  rawText       String
  status        DraftStatus @default(PENDING)
  flags         String[]            // MISSING_ANSWER, FEW_OPTIONS, PARSE_ERROR, DUPLICATE...
  confidence    Float?

  examName      String?
  examYear      Int?
  paper         PaperType?
  setCode       String?
  questionNo    Int?
  stem          String
  options       Json                // [{label, text}]
  correctLabel  String?
  explanation   String?
  questionType  QuestionType?
  difficulty    Difficulty?

  srcSubject    String?             // labels exactly as printed in the source
  srcTopic      String?
  srcTheme      String?
  srcDifficulty String?

  subjectId     String?             // proposed or approved mapping
  topicId       String?
  themeIds      String[]
  passageText   String?
  assets        Json?

  dedupHash     String
  duplicateOfId String?
  publishedId   String?  @unique
  reviewedBy    String?
  reviewedAt    DateTime?
  createdAt     DateTime @default(now())

  run           IngestionRun   @relation(fields: [runId], references: [id])
  document      SourceDocument @relation(fields: [documentId], references: [id])
  @@index([runId, status])
  @@index([dedupHash])
}

// ---------- Published question bank ----------
model Passage {
  id        String   @id @default(cuid())
  text      String
  assets    Json?
  examYear  Int?
  paper     PaperType?
  questions Question[]
}

model Question {
  id               String         @id @default(cuid())
  origin           QuestionOrigin
  status           QuestionStatus @default(PUBLISHED)

  examName         String?        @default("UPSC")
  examYear         Int?
  paper            PaperType
  setCode          String?
  questionNo       Int?

  stem             String
  options          Json                  // [{label, text}]
  correctLabel     String
  answerStatus     AnswerStatus   @default(UNVERIFIED)
  explanation      String?
  analysis         Json?                 // concept, trap, elimination, reference
  questionType     QuestionType   @default(SINGLE_CORRECT)
  assets           Json?
  passageId        String?

  difficulty       Difficulty?
  difficultySource DifficultySource?
  subjectId        String?
  topicId          String?

  dedupHash        String         @unique
  version          Int            @default(1)
  createdBy        String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  // searchVector (tsvector) and embedding (vector(768)) added via SQL migration

  subject          Subject?       @relation(fields: [subjectId], references: [id])
  topic            Topic?         @relation(fields: [topicId], references: [id])
  passage          Passage?       @relation(fields: [passageId], references: [id])
  themes           QuestionMicroTheme[]
  sources          QuestionSource[]
  revisions        QuestionRevision[]
  testItems        TestPaperQuestion[]
  answers          AttemptAnswer[]
  bookmarks        QuestionBookmark[]

  @@unique([examName, examYear, paper, setCode, questionNo])
  @@index([paper, examYear])
  @@index([subjectId])
  @@index([topicId])
  @@index([difficulty])
  @@index([origin, status])
}

model QuestionMicroTheme {
  questionId String
  themeId    String
  question   Question   @relation(fields: [questionId], references: [id], onDelete: Cascade)
  theme      MicroTheme @relation(fields: [themeId], references: [id])
  @@id([questionId, themeId])
  @@index([themeId])
}

// Provenance: one question may come from several PDFs
model QuestionSource {
  id          String   @id @default(cuid())
  questionId  String
  documentId  String
  draftId     String?
  pageNo      Int?
  sourceLabels Json?             // subject/topic/theme/difficulty as printed
  question    Question       @relation(fields: [questionId], references: [id], onDelete: Cascade)
  document    SourceDocument @relation(fields: [documentId], references: [id])
  @@index([questionId])
  @@index([documentId])
}

model QuestionRevision {
  id         String   @id @default(cuid())
  questionId String
  version    Int
  snapshot   Json
  changedBy  String?
  note       String?
  createdAt  DateTime @default(now())
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@index([questionId])
}

// ---------- Tests, practice, attempts ----------
model TestPaper {
  id              String   @id @default(cuid())
  title           String
  description     String?
  durationMins    Int      @default(0)
  negativeMarking Float    @default(0.33)
  marksPerQuestion Float   @default(2.0)
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  questions       TestPaperQuestion[]
  attempts        Attempt[]
}

model TestPaperQuestion {
  testPaperId String
  questionId  String
  sortOrder   Int
  testPaper   TestPaper @relation(fields: [testPaperId], references: [id], onDelete: Cascade)
  question    Question  @relation(fields: [questionId], references: [id])
  @@id([testPaperId, questionId])
}

model Attempt {
  id          String      @id @default(cuid())
  userId      String
  mode        AttemptMode
  testPaperId String?
  filterSpec  Json?                 // snapshot of practice filters
  startedAt   DateTime    @default(now())
  submittedAt DateTime?
  score       Float?
  testPaper   TestPaper?  @relation(fields: [testPaperId], references: [id])
  answers     AttemptAnswer[]
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, startedAt])
}

model AttemptAnswer {
  id            String   @id @default(cuid())
  attemptId     String
  questionId    String
  selectedLabel String?
  isCorrect     Boolean?
  timeSpentSec  Int?
  flagged       Boolean  @default(false)
  attempt       Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question      Question @relation(fields: [questionId], references: [id])
  @@unique([attemptId, questionId])
  @@index([questionId])
}

model QuestionBookmark {
  userId     String
  questionId String
  note       String?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@id([userId, questionId])
}
"""

content += new_models

with open(schema_path, 'w') as f:
    f.write(content)

print("Schema updated successfully")

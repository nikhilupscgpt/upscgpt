import fs from 'fs';
const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');
schema = schema.replace(
  /enum IssueNodeType \{[\s\S]*?\}/,
  `enum IssueNodeType {
  NEWS
  CONCEPTUAL
  STATIC
  MAINS_QUESTION
}`
);
fs.writeFileSync(schemaPath, schema);

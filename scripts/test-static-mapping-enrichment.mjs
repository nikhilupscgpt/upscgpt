import fs from 'fs';
import path from 'path';

// Let's verify existing file can be read and parse
const dataPath = path.resolve('./src/lib/static-mapping-data.js');
const content = fs.readFileSync(dataPath, 'utf8');
console.log(`Original static-mapping-data.js length: ${content.length} characters`);

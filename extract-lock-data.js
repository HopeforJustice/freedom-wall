// Script to extract lock data from the existing lockData.js file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the lockData.js file
const lockDataPath = path.join(__dirname, 'src/modules/locks/lockData.js');
const content = fs.readFileSync(lockDataPath, 'utf8');

// Extract the lockData array using regex
const match = content.match(/export const lockData = (\[[\s\S]*?\]);/);
if (!match) {
  throw new Error('Could not find lockData array in the file');
}

// Parse the array (this is a bit hacky but works for the specific format)
const arrayString = match[1];
const lockData = eval('(' + arrayString + ')');

console.log(`Extracted ${lockData.length} locks from lockData.js`);
console.log(`Story locks: ${lockData.filter(lock => lock.story).length}`);

// Write to a JSON file for use in seeding
fs.writeFileSync(
  path.join(__dirname, 'extracted-lock-data.json'), 
  JSON.stringify(lockData, null, 2)
);

console.log('Lock data extracted to extracted-lock-data.json');

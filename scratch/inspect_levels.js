const fs = require('fs');

console.log('--- Checking test_rig.js ---');
const testRig = fs.readFileSync('test_rig.js', 'utf8');
const trLevelsMatch = testRig.match(/const LEVELS = (\[[\s\S]*?\]);/);
if (trLevelsMatch) {
  const levels = JSON.parse(trLevelsMatch[1]);
  console.log(`Found ${levels.length} levels in test_rig.js`);
  levels.forEach(l => console.log(`  Level ${l.id}: ${l.name} (Par ${l.par}, World ${l.world})`));
} else {
  console.log('Could not parse LEVELS from test_rig.js');
}

console.log('--- Checking index.html ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const ihLevelsMatch = indexHtml.match(/const LEVELS = (\[[\s\S]*?\]);/);
if (ihLevelsMatch) {
  const levels = JSON.parse(ihLevelsMatch[1]);
  console.log(`Found ${levels.length} levels in index.html`);
  levels.slice(0, 10).forEach(l => console.log(`  Level ${l.id}: ${l.name} (Par ${l.par}, World ${l.world})`));
} else {
  console.log('Could not parse LEVELS from index.html with regex 1, looking for other patterns...');
  const match2 = indexHtml.match(/LEVELS\s*=\s*(\[[\s\S]*?\n\s*\];)/);
  if (match2) {
    console.log('Found match2 in index.html');
  } else {
    // search for level definitions in index.html
    const idx = indexHtml.indexOf('const LEVELS');
    console.log('index of "const LEVELS":', idx);
    if (idx === -1) {
      // let's find where levels are defined in index.html
      const searchTerms = ['"The Open Arena"', 'The Open Arena', 'world: 1', 'id: 1'];
      for (const term of searchTerms) {
        console.log(`Search "${term}":`, indexHtml.indexOf(term));
      }
    }
  }
}

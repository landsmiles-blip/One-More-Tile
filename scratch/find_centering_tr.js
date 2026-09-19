const fs = require('fs');
const tr = fs.readFileSync('test_rig.js', 'utf8');

const lines = tr.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('originY') || l.includes('centering') || l.includes('Centering') || l.includes('Viewport')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});

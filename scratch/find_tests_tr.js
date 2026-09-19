const fs = require('fs');
const tr = fs.readFileSync('test_rig.js', 'utf8');

const lines = tr.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('Test 11') || l.includes('Test 12') || l.includes('Test 10') || l.includes('Deterministic Solvability')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});

const fs = require('fs');
const lvls = JSON.parse(fs.readFileSync('scratch/levels11_20_spec.json', 'utf8'));
const l11 = lvls[0];

console.log('Level 11:');
console.log('Grid:');
l11.grid.forEach((r, y) => console.log(`  ${y}: [${r.join(', ')}]`));
console.log('Trace length:', l11.trace.length);

// Let's step through up to step 14
const DIRS = {
  RIGHT: { dx: 1, dy: 0 },
  LEFT:  { dx: -1, dy: 0 },
  DOWN:  { dx: 0, dy: 1 },
  UP:    { dx: 0, dy: -1 }
};

let pos = { ...l11.spawn };
console.log(`Step 0: (${pos.x}, ${pos.y})`);
for (let s = 0; s < 15; s++) {
  const dir = l11.trace[s];
  pos.x += DIRS[dir].dx;
  pos.y += DIRS[dir].dy;
  console.log(`Step ${s + 1}: ${dir} -> (${pos.x}, ${pos.y})`);
}

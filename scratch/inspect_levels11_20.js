const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const startIdx = html.indexOf('const LEVELS = [');
const endIdx = html.indexOf('];', startIdx) + 2;
const levelsCode = html.substring(startIdx, endIdx);
const fn = new Function(levelsCode.replace('const LEVELS =', 'return'));
const lvls = fn();

const CELL_NAMES = {
  0: 'VOID',
  1: 'WALL',
  2: 'TILE',
  3: 'CONS',
  4: 'GOAL',
  5: 'C1',
  6: 'C2',
  7: 'CRUM',
  8: 'SWIT',
  9: 'G_RD',
  10: 'G_BL',
  11: 'CROS',
  12: 'ICE'
};

for (let i = 10; i < 20; i++) {
  const l = lvls[i];
  console.log(`\n======================================================`);
  console.log(`Level ${l.id}: "${l.name}" | Size: ${l.w}x${l.h} | Par: ${l.par} | World: ${l.world}`);
  console.log(`Spawn: (${l.spawn.x}, ${l.spawn.y}) | Goal: (${l.goal.x}, ${l.goal.y})`);
  console.log(`Checkpoints: ${JSON.stringify(l.checkpoints || [])}`);
  console.log(`Grid:`);
  for (let y = 0; y < l.h; y++) {
    const row = l.grid[y].map(c => (CELL_NAMES[c] || c).padStart(5, ' ')).join(' ');
    console.log(` y=${y}: ${row}`);
  }
}

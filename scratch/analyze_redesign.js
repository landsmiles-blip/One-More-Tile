const fs = require('fs');

const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;
const C_SWITCH = 8;
const C_GATE_RED = 9;
const C_GATE_BLUE = 10;
const C_CROSSROAD = 11;

const levels = JSON.parse(fs.readFileSync('scratch/levels11_20_spec.json', 'utf8'));

levels.forEach(lvl => {
  const cellCounts = {};
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const c = lvl.grid[y][x];
      cellCounts[c] = (cellCounts[c] || 0) + 1;
    }
  }
  console.log(`Level ${lvl.id} [World ${lvl.world}] "${lvl.name}":`);
  console.log(`  Size: ${lvl.w}x${lvl.h}, Par: ${lvl.par}, Budget: ${lvl.budget}, TraceLen: ${lvl.trace.length}`);
  console.log(`  Spawn: (${lvl.spawn.x},${lvl.spawn.y}), Goal: (${lvl.goal.x},${lvl.goal.y})`);
  console.log(`  Archetype: ${lvl.archetype}, InitialPhase: ${lvl.initialPhase}`);
  console.log(`  Cells: Crossroads=${cellCounts[C_CROSSROAD]||0}, Crumbling=${cellCounts[C_CRUMBLING]||0}, Switch=${cellCounts[C_SWITCH]||0}, GateRed=${cellCounts[C_GATE_RED]||0}, GateBlue=${cellCounts[C_GATE_BLUE]||0}, C1=${cellCounts[C_CHECKPOINT_1]||0}, C2=${cellCounts[C_CHECKPOINT_2]||0}, Walls=${cellCounts[C_WALL]||0}, Untouched=${cellCounts[C_UNTOUCHED]||0}`);
});

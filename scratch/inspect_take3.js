const fs = require('fs');
const levels = JSON.parse(fs.readFileSync('scratch/levels11_20_take3_spec.json', 'utf8'));

levels.forEach(lvl => {
  console.log(`\n=== Level ${lvl.id}: "${lvl.name}" (Par ${lvl.par}, ${lvl.w}x${lvl.h}) ===`);
  console.log("Spawn:", lvl.spawn, "Goal:", lvl.goal, "InitialPhase:", lvl.initialPhase || "RED");
  console.log("Checkpoints:", lvl.checkpoints);
  console.log("Grid:");
  lvl.grid.forEach((row, y) => {
    console.log(`  y=${y}: [${row.map(c => String(c).padStart(2, ' ')).join(',')}]`);
  });
  console.log("Full Trace (" + lvl.trace.length + "):", lvl.trace.join(' '));
});

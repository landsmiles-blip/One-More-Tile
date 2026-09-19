/**
 * Search for clean Level 5 layout
 */
const { RedesignSolver } = require('./redesign_solver.js');
const { C_CHECKPOINT_1, C_CHECKPOINT_2 } = require('./redesign_engine.js');

// Let's test a 5x4 or 5x5 layout
// In 5x4: 20 tiles.
// If 0 walls: 20 tiles. Even = 10, Odd = 10.
// Moves = 19 (odd). Spawn (0,0) [even], Goal must be odd.
// Let's test 5x4 with C1 and C2!
const l5_5x4 = {
  id: 5,
  name: "The Hamiltonian Crucible",
  w: 5, h: 4,
  budget: 0,
  par: 19,
  spawn: { x: 0, y: 0 }, // even
  goal: { x: 4, y: 3 },  // 4+3 = 7 (odd)
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 }, // (4,0)
    { id: 2, x: 0, y: 3, cellType: C_CHECKPOINT_2 }  // (0,3)
  ],
  grid: [
    [2, 2, 2, 2, 5],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [6, 2, 2, 2, 4]
  ]
};

console.log("Testing 5x4 open arena for L5...");
const s = new RedesignSolver(l5_5x4).solve(22);
console.log(`Solutions: ${s.length}`);
s.forEach((sol, i) => console.log(`Sol ${i}: ${sol.path.join(', ')}`));

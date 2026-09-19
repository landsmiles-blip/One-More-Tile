/**
 * Test Level 8 with balanced Crossroad parity
 */

const { RedesignSolver } = require('./redesign_solver.js');
const { C_CHECKPOINT_1, C_CROSSROAD } = require('./redesign_engine.js');

// 6x4 Grid
// Crossroad 1 at (1,1) [even: 1+1=2]
// Crossroad 2 at (3,2) [odd: 3+2=5]
// Spawn at (0,0) [even], Goal at (5,3) [odd: 5+3=8? Wait, 5+3=8 is EVEN!]
// Odd goal: (4,3) [4+3=7 (odd)] or (0,3) [0+3=3 (odd)]
// C1 at (5,0) [odd: 5+0=5]
const l8_cand = {
  id: 8,
  name: "The Trefoil Knot",
  w: 6, h: 4,
  budget: 0,
  par: 25,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 }, // 0+3 = 3 (odd)
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 2, 2, 2, 5],   // C1 at (5,0)
    [2, 11, 2, 2, 2, 2],  // Crossroad 1 at (1,1) [even]
    [2, 2, 2, 11, 2, 2],  // Crossroad 2 at (3,2) [odd]
    [4, 2, 2, 2, 2, 2]    // Goal at (0,3) [odd]
  ]
};

console.log("Testing L8 with balanced parity...");
const s8 = new RedesignSolver(l8_cand).solve(28);
console.log(`L8 solutions: ${s8.length}`);
if (s8[0]) {
  console.log(`Moves: ${s8[0].moves}`);
  console.log(`Trace: ${s8[0].path.join(', ')}`);
}

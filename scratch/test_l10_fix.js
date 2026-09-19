/**
 * Test L10 with mathematically correct parity
 */

const { RedesignSolver } = require('./redesign_solver.js');
const { C_CHECKPOINT_1, C_CHECKPOINT_2, C_CROSSROAD } = require('./redesign_engine.js');

// 6x5 = 30 cells.
// CR at (2,2) [even: 2+2=4] -> Even visits = 16, Odd visits = 15.
// Path must start on EVEN, end on EVEN.
// Spawn at (0,0) [even].
// Goal at (4,4) [even: 4+4=8] or (0,4) [even].
// C1 at (5,0) [odd: 5+0=5], C2 at (5,4) [odd: 5+4=9].
const l10_cand = {
  id: 10,
  name: "The Gordian Web",
  w: 6, h: 5,
  budget: 0,
  par: 30,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 }, // even
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 5, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2, 2, 5], // C1 at (5,0)
    [2, 2, 2, 2, 2, 2],
    [2, 2, 11, 2, 2, 2], // CR at (2,2) [even]
    [2, 2, 2, 2, 2, 2],
    [4, 2, 2, 2, 2, 6]  // Goal at (0,4), C2 at (5,4)
  ]
};

console.log("Testing L10 with even Crossroad...");
const s10 = new RedesignSolver(l10_cand).solve(32);
console.log(`L10 solutions: ${s10.length}`);
if (s10[0]) {
  console.log(`L10 moves: ${s10[0].moves}`);
  console.log(`L10 trace: ${s10[0].path.join(', ')}`);
}

/**
 * Test Level 5 variants
 */
const { RedesignSolver } = require('./redesign_solver.js');
const { C_CHECKPOINT_1, C_CHECKPOINT_2 } = require('./redesign_engine.js');

// What if Goal is at (2,4) [even: 2+4=6] and C2 is at (0,4) [even: 0+4=4]?
// Or Goal at (2,2) [even: 2+2=4] and C2 at (4,4)?
// Let's test a candidate:
const l5_cand = {
  id: 5,
  name: "The Hamiltonian Crucible",
  w: 5, h: 5,
  budget: 0,
  par: 22,
  spawn: { x: 0, y: 0 },
  goal: { x: 2, y: 4 }, // (2,4) even
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2, 5],
    [2, 1, 2, 1, 2],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [6, 2, 4, 2, 2]
  ]
};

const s5 = new RedesignSolver(l5_cand).solve(25);
console.log(`L5 cand solutions: ${s5.length}`);
if (s5[0]) {
  console.log(`Moves: ${s5[0].moves}`);
  console.log(`Trace: ${s5[0].path.join(', ')}`);
}

/**
 * Test Level 9 and Level 10 candidates
 */

const { RedesignSolver } = require('./redesign_solver.js');
const { C_CHECKPOINT_1, C_CHECKPOINT_2, C_CROSSROAD } = require('./redesign_engine.js');

// Level 9: "The Celtic Cross" (6x5)
// Crossroads at (2,2) [even: 2+2=4] and (3,1) [odd: 3+1=4? 3+1=4 is EVEN!]
// Odd positions for Crossroad: (3,2) [3+2=5 (odd)]
// So CR1 at (2,2) [even], CR2 at (3,2) [odd].
// C1 at (5,0) [odd], C2 at (0,4) [even].
// Spawn at (0,0) [even], Goal at (5,4) [odd: 5+4=9].
const l9 = {
  id: 9,
  name: "The Celtic Cross",
  w: 6, h: 5,
  budget: 0,
  par: 31,
  spawn: { x: 0, y: 0 },
  goal: { x: 5, y: 4 }, // odd
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2, 2, 5],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 11, 11, 2, 2], // CR at (2,2) [even], CR at (3,2) [odd]
    [2, 2, 2, 2, 2, 2],
    [6, 2, 2, 2, 2, 4]
  ]
};

// Level 10: "The Gordian Web" (6x5 or 6x6)
// Let's test 6x5 with 1 Crossroad and central pillars or 6x6
const l10 = {
  id: 10,
  name: "The Gordian Web",
  w: 6, h: 5,
  budget: 0,
  par: 30, // 30 tiles, 1 CR (+1 visit) = 31 visits -> 30 moves
  spawn: { x: 0, y: 0 },
  goal: { x: 2, y: 2 }, // center sink!
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2, 2, 5],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 4, 11, 2, 2], // Goal at (2,2) [even], CR at (3,2) [odd]
    [2, 2, 2, 2, 2, 2],
    [6, 2, 2, 2, 2, 2]
  ]
};

console.log("Testing L9...");
const s9 = new RedesignSolver(l9).solve(33);
console.log(`L9 solutions: ${s9.length}`);
if (s9[0]) console.log(`L9 moves: ${s9[0].moves}, trace: ${s9[0].path.join(', ')}`);

console.log("\nTesting L10...");
const s10 = new RedesignSolver(l10).solve(33);
console.log(`L10 solutions: ${s10.length}`);
if (s10[0]) console.log(`L10 moves: ${s10[0].moves}, trace: ${s10[0].path.join(', ')}`);

/**
 * Test Level 14 and Level 15 (World 3 Apex)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const { C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_ICE } = require('./redesign_engine.js');

// Level 14: "The Glacial Loom" (6x5)
// Checkpoints C1 at (5,0) and C2 at (5,4).
// Slide across north ice lane to C1.
// Descend eastern wall, slide west across central ice lane to create bumper.
// Ascend, slide down across bumper to collect C2 and reach Goal!
// Par = 10, Budget = 10.
const l14 = {
  id: 14,
  name: "The Glacial Loom",
  w: 6, h: 5,
  budget: 7,
  par: 7,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 5, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 12, 12, 12, 2, 5], // Slide R to (4,0), step R to (5,0)[C1]
    [1, 1, 1, 1, 1, 2],    // Step D to (5,1)
    [1, 1, 1, 1, 1, 2],    // Step D to (5,2)
    [1, 1, 1, 1, 1, 2],    // Step D to (5,3)
    [4, 12, 12, 12, 12, 6] // C2 at (5,4), slide L to (0,4)[Goal]!
  ]
};

// Level 15: "The Absolute Zero" (6x5 or 6x6)
// 6x5 multi-chute slide with dual checkpoints.
const l15 = {
  id: 15,
  name: "The Absolute Zero",
  w: 6, h: 5,
  budget: 7,
  par: 7,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 12, 12, 12, 2, 5],
    [1, 1, 1, 1, 1, 2],
    [6, 12, 12, 12, 12, 2],
    [2, 1, 1, 1, 1, 1],
    [4, 2, 2, 2, 2, 2]
  ]
};

console.log("Testing Level 14...");
const s14 = new RedesignSolver(l14).solve(16);
console.log(`L14 solutions: ${s14.length}`);
if (s14[0]) console.log(`L14 moves: ${s14[0].moves}, trace: ${s14[0].path.join(', ')}`);

console.log("\nTesting Level 15...");
const s15 = new RedesignSolver(l15).solve(16);
console.log(`L15 solutions: ${s15.length}`);
if (s15[0]) console.log(`L15 moves: ${s15[0].moves}, trace: ${s15[0].path.join(', ')}`);

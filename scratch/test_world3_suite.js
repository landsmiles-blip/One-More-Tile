/**
 * World 3 Complete Suite (Levels 11 to 15)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_ICE
} = require('./redesign_engine.js');

// Level 11: "Frictionless Vector" (5x4)
// Par = 7, Budget = 7.
const l11 = {
  id: 11,
  name: "Frictionless Vector",
  w: 5, h: 4,
  budget: 7,
  par: 7,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [],
  grid: [
    [2, 12, 12, 12, 1], // Ice chute row 0
    [2, 1, 1, 2, 2],
    [2, 1, 1, 2, 2],
    [4, 2, 2, 2, 2]
  ]
};

// Level 12: "The Trail Bumper" (5x5)
// Goal at (0,4).
// Row 1 has an Ice chute: (1,1), (2,1), (3,1) with Wall at (4,1).
// Column 2 has an Ice chute: (2,2), (2,3) with Wall at (2,4) or Goal?
// Let's create an interlocking Trail Bumper:
// Spawn at (0,0).
// Step RIGHT to (1,0), DOWN to (1,1)[Ice].
// Slide EAST: (1,1) -> (2,1) -> (3,1), stops at Wall(4,1)!
// This consumes (1,1) and (2,1) into C_CONSUMED!
// From (4,1), player moves DOWN to (4,2), (4,3), then steps onto (3,3)[Ice].
// Slide WEST: (3,3) -> (2,3) -> stops at Wall(0,3) or Consumed!
// Let's test a clean Trail Bumper design:
const l12 = {
  id: 12,
  name: "The Trail Bumper",
  w: 5, h: 5,
  budget: 9,
  par: 9,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [],
  grid: [
    [2, 2, 1, 2, 2],
    [1, 12, 12, 12, 1], // Horizontal ice chute
    [2, 2, 1, 2, 2],
    [1, 12, 12, 12, 1], // Horizontal ice chute 2
    [4, 2, 1, 2, 2]
  ]
};

// Level 13: "Permafrost Chutes" (6x5)
// Checkpoint 1 at (5,0).
// Dual ice chutes with C1.
// Spawn at (0,0), Goal at (0,4).
const l13 = {
  id: 13,
  name: "Permafrost Chutes",
  w: 6, h: 5,
  budget: 10,
  par: 10,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 12, 12, 12, 2, 5], // Slide across ice to C1!
    [1, 1, 1, 1, 2, 1],
    [2, 12, 12, 12, 2, 2], // Mid ice chute
    [2, 1, 1, 1, 1, 1],
    [4, 12, 12, 12, 2, 2]  // Bottom ice chute to Goal!
  ]
};

console.log("Testing World 3 candidates...");
[l11, l12, l13].forEach(lvl => {
  console.log(`\nTesting Level ${lvl.id}: ${lvl.name}...`);
  const s = new RedesignSolver(lvl).solve(16);
  console.log(`L${lvl.id}: ${s.length} solutions found. Optimal moves: ${s[0]?.moves} (Expected: ${lvl.par})`);
  if (s[0]) console.log(`L${lvl.id} Trace: ${s[0].path.join(', ')}`);
});

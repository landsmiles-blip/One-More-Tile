/**
 * World 1 Designer: Open Weaves & Parity Traps (Levels 1 to 5)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const { C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2 } = require('./redesign_engine.js');

// Level 1: "The Open Arena" (4x3)
// Completely open 4x3 arena (no interior walls!).
// 12 tiles total. Spawn at (0,0), Goal at (0,1).
// P at (0,0), G at (0,1).
// 10 untouched tiles + P + G = 12 tiles.
// Par = 11 moves.
const l1 = {
  id: 1,
  name: "The Open Arena",
  w: 4, h: 3,
  budget: 0,
  par: 11,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 1 },
  checkpoints: [],
  grid: [
    [2, 2, 2, 2],
    [4, 2, 2, 2],
    [2, 2, 2, 2]
  ]
};

// Level 2: "The Central Pillar" (4x4)
// 4x4 open arena with a 1x1 central pillar at (1,1).
// Spawn at (0,0), Goal at (0,2).
// 14 untouched tiles + P + G = 15 traversable tiles (1 wall).
// Par = 14 moves.
const l2 = {
  id: 2,
  name: "The Central Pillar",
  w: 4, h: 4,
  budget: 0,
  par: 14,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 2, 2],
    [2, 1, 2, 2],
    [4, 2, 2, 2],
    [2, 2, 2, 2]
  ]
};

// Level 3: "The Dual Pillars" (5x4)
// 5x4 arena with two central pillars at (1,1) and (3,2).
// Spawn at (0,0), Goal at (4,3).
// Par = 17 moves.
const l3 = {
  id: 3,
  name: "The Dual Pillars",
  w: 5, h: 4,
  budget: 0,
  par: 17,
  spawn: { x: 0, y: 0 },
  goal: { x: 4, y: 3 },
  checkpoints: [],
  grid: [
    [2, 2, 2, 2, 2],
    [2, 1, 2, 2, 2],
    [2, 2, 2, 1, 2],
    [2, 2, 2, 2, 4]
  ]
};

// Level 4: "The Parity Split" (5x5)
// 5x5 arena with Checkpoint 1 at (4,0) and central void/pillar.
// Spawn at (0,0), Goal at (0,4). C1 at (4,0).
// Par = 21 moves.
const l4 = {
  id: 4,
  name: "The Parity Split",
  w: 5, h: 5,
  budget: 0,
  par: 21,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 2, 2, 5],
    [2, 1, 2, 1, 2],
    [2, 2, 1, 2, 2],
    [2, 1, 2, 1, 2],
    [4, 2, 2, 2, 2]
  ]
};

// Level 5: "The Hamiltonian Crucible" (5x5)
// 5x5 arena with C1 at (4,0) and C2 at (0,4). Goal at (2,2) (center sink!).
// Par = 22 moves.
const l5 = {
  id: 5,
  name: "The Hamiltonian Crucible",
  w: 5, h: 5,
  budget: 0,
  par: 22,
  spawn: { x: 0, y: 0 },
  goal: { x: 2, y: 2 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2, 5],
    [2, 1, 2, 1, 2],
    [2, 2, 4, 2, 2],
    [2, 1, 2, 1, 2],
    [6, 2, 2, 2, 2]
  ]
};

console.log("=== SOLVING WORLD 1 CANDIDATES ===");
const w1 = [l1, l2, l3, l4, l5];
w1.forEach(lvl => {
  console.log(`\n--- Level ${lvl.id}: ${lvl.name} (${lvl.w}x${lvl.h}) ---`);
  const solver = new RedesignSolver(lvl);
  const sols = solver.solve(25);
  console.log(`Solutions found: ${sols.length}`);
  if (sols.length > 0) {
    console.log(`Optimal moves: ${sols[0].moves} (Expected par: ${lvl.par})`);
    console.log(`Trace: ${sols[0].path.join(', ')}`);
  }
});

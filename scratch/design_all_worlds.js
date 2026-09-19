/**
 * Comprehensive World 1-4 Level Designer & Verifier
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING,
  C_SWITCH, C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, C_ICE
} = require('./redesign_engine.js');

// ----------------------------------------------------------------------------
// WORLD 1: Open Weaves & Parity Traps (Levels 1 to 5)
// ----------------------------------------------------------------------------

// Level 1: "The Open Arena" (4x3)
// 12 tiles, open arena. P at (0,0), G at (0,1).
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
// 15 traversable tiles, Wall at (2,1). P at (0,0), G at (0,2).
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
    [2, 2, 1, 2],
    [4, 2, 2, 2],
    [2, 2, 2, 2]
  ]
};

// Level 3: "The Dual Pillars" (5x4)
// 20 tiles. Let's place 2 walls: one even, one odd.
// Even wall at (2,2) [4=even], Odd wall at (2,1) [3=odd].
// Total traversable: 18 tiles. Moves: 17 (odd).
// Spawn at (0,0) (even), Goal at (3,2) (odd: 3+2=5) or (4,3) (odd: 4+3=7).
const l3 = {
  id: 3,
  name: "The Dual Pillars",
  w: 5, h: 4,
  budget: 0,
  par: 17,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 }, // 0+3=3 (odd)
  checkpoints: [],
  grid: [
    [2, 2, 2, 2, 2],
    [2, 2, 1, 2, 2], // Wall at (2,1)
    [2, 2, 1, 2, 2], // Wall at (2,2)
    [4, 2, 2, 2, 2]  // Goal at (0,3)
  ]
};

// Level 4: "The Parity Split" (5x5)
// 25 tiles. Let's add C1 at (4,0).
// Walls to balance parity:
// 25 tiles = 13 even, 12 odd.
// If 1 wall at even (2,2), then 12 even, 12 odd.
// Moves: 23 (odd).
// Spawn at (0,0) (even). Goal at (0,4) (even)? Wait, if 12 even, 12 odd, path must start on even and end on odd!
// Or if Goal is at (1,4) (odd)?
const l4 = {
  id: 4,
  name: "The Parity Split",
  w: 5, h: 5,
  budget: 0,
  par: 23,
  spawn: { x: 0, y: 0 },
  goal: { x: 1, y: 4 }, // 1+4 = 5 (odd)
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 2, 2, 5],
    [2, 2, 2, 2, 2],
    [2, 2, 1, 2, 2], // Wall at (2,2) [even]
    [2, 2, 2, 2, 2],
    [2, 4, 2, 2, 2]  // Goal at (1,4)
  ]
};

// Level 5: "The Hamiltonian Crucible" (5x5)
// 5x5 arena with C1 at (4,0) and C2 at (4,4).
// Walls at (1,1) [even] and (3,1) [odd].
// 23 traversable tiles. Moves: 22 (even).
// Spawn at (0,0) (even), Goal at (0,4) (even).
const l5 = {
  id: 5,
  name: "The Hamiltonian Crucible",
  w: 5, h: 5,
  budget: 0,
  par: 22,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 4, y: 4, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2, 5],
    [2, 1, 2, 1, 2],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [4, 2, 2, 2, 6]
  ]
};

console.log("=== VERIFYING WORLD 1 (LEVELS 1-5) ===");
[l1, l2, l3, l4, l5].forEach(lvl => {
  console.log(`\nTesting Level ${lvl.id}: ${lvl.name}...`);
  const s = new RedesignSolver(lvl).solve(28);
  console.log(`L${lvl.id}: ${s.length} solutions found. Optimal: ${s[0]?.moves} (Expected: ${lvl.par})`);
  if (s[0]) console.log(`Trace ${lvl.id}: ${s[0].path.join(', ')}`);
});

/**
 * Dedicated World 3 Designer (Levels 11 to 15)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_ICE
} = require('./redesign_engine.js');

// Level 11: "Frictionless Vector" (5x4)
// Verified 7 moves, 1 solution.
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
    [2, 12, 12, 12, 1],
    [2, 1, 1, 2, 2],
    [2, 1, 1, 2, 2],
    [4, 2, 2, 2, 2]
  ]
};

// Level 12: "The Trail Bumper" (5x5)
// Player must slide horizontally across ice to create a bumper.
// Then slide vertically down, stopping against that bumper!
// Layout:
// Row 0: P(0,0)  . (1,0)  # (2,0)  # (3,0)  # (4,0)
// Row 1: # (0,1) Ice(1,1) Ice(2,1) Ice(3,1) # (4,1)
// Row 2: . (0,2) . (1,2)  Ice(2,2) . (3,2)  . (4,2)
// Row 3: # (0,3) Ice(1,3) Ice(2,3) Ice(3,3) # (4,3)
// Row 4: G(0,4)  . (1,4)  # (2,4)  . (3,4)  . (4,4)
const l12 = {
  id: 12,
  name: "The Trail Bumper",
  w: 5, h: 4,
  budget: 8,
  par: 8,
  spawn: { x: 0, y: 0 },
  goal: { x: 4, y: 3 },
  checkpoints: [],
  grid: [
    [2, 12, 12, 12, 1], // Slide R to (3,0) in front of Wall(4,0)
    [1, 1, 1, 2, 1],    // Step D to (3,1)
    [1, 12, 12, 12, 2], // Slide L from (3,2) across to (1,2)?
    [1, 2, 2, 2, 4]     // Goal at (4,3)
  ]
};

// Level 13: "Permafrost Chutes" (6x5)
const l13 = {
  id: 13,
  name: "Permafrost Chutes",
  w: 6, h: 5,
  budget: 7,
  par: 7,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 12, 12, 12, 2, 5], // Slide R to (4,0), step R to (5,0)[C1]
    [1, 1, 1, 1, 1, 2],    // Step D to (5,1)
    [2, 12, 12, 12, 12, 2],// Step D to (5,2), slide L across to (0,2)!
    [2, 1, 1, 1, 1, 1],    // Step D to (0,3)
    [4, 1, 1, 1, 1, 1]     // Step D to (0,4)[Goal]!
  ]
};

console.log("Testing World 3...");
[l11, l13].forEach(lvl => {
  console.log(`\nTesting Level ${lvl.id}: ${lvl.name}...`);
  const s = new RedesignSolver(lvl).solve(15);
  console.log(`L${lvl.id}: ${s.length} solutions found. Optimal moves: ${s[0]?.moves} (Expected: ${lvl.par})`);
  if (s[0]) console.log(`Trace: ${s[0].path.join(', ')}`);
});

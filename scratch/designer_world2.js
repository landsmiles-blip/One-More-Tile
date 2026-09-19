/**
 * World 2 Designer: Levels 6 to 10
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CROSSROAD
} = require('./redesign_engine.js');

// Level 6: "The Figure Eight" (5x3)
// 15 traversable tiles, 1 Crossroad at (2,1). Par = 15.
const l6 = {
  id: 6,
  name: "The Figure Eight",
  w: 5, h: 3,
  budget: 0,
  par: 15,
  spawn: { x: 0, y: 0 },
  goal: { x: 3, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 2, 2, 2],
    [2, 2, 11, 2, 2],
    [2, 2, 2, 4, 2]
  ]
};

// Level 7: "The Twin Hubs" (5x5)
// Two Crossroad tiles at (1,2) and (3,2).
// Walls at (2,0) and (2,4) separating lobes.
// Spawn at (0,0), Goal at (4,4).
// Let's test parity:
// 25 tiles. 2 walls: (2,0) [even], (2,4) [even].
// 2 Crossroads: (1,2) [odd: 1+2=3], (3,2) [odd: 3+2=5].
// Each Crossroad adds 1 visit to odd tiles!
// Total cells = 23.
// Normal 5x5: 13 even, 12 odd.
// Minus 2 even walls: 11 even, 12 odd.
// Add 2 odd crossroad visits: 11 even, 14 odd.
// Wait! Even = 11, Odd = 14: diff is 3! That violates parity!
// To fix diff:
// We need the Crossroads to be EVEN, or we need 2 more odd walls!
// If Crossroads are at EVEN positions, e.g. (2,2) [even] and (2,1) [odd]?
// Or add 2 odd walls, e.g. (2,1) [odd] and (2,3) [odd]!
// If walls at (2,1) [odd] and (2,3) [odd]:
// Odd cells: 12 - 2 = 10.
// Plus 2 odd crossroads: 10 + 2 = 12 odd visits!
// Even cells: 13 (minus 0 walls = 13 even).
// Even visits = 13, Odd visits = 12! Diff = 1!
// Path has 25 visits -> 24 moves (EVEN number of moves).
// Starts on EVEN (0,0), ends on EVEN (4,4)! Parity matches!
const l7 = {
  id: 7,
  name: "The Twin Hubs",
  w: 5, h: 5,
  budget: 0,
  par: 24,
  spawn: { x: 0, y: 0 }, // even
  goal: { x: 4, y: 4 },  // even
  checkpoints: [],
  grid: [
    [2, 2, 2, 2, 2],
    [2, 2, 1, 2, 2],  // Wall at (2,1) [odd]
    [2, 11, 2, 11, 2], // Crossroads at (1,2) and (3,2) [both odd]
    [2, 2, 1, 2, 2],  // Wall at (2,3) [odd]
    [2, 2, 2, 2, 4]   // Goal at (4,4) [even]
  ]
};

// Level 8: "The Trefoil Knot" (6x4)
// 6x4 = 24 cells.
// 2 Crossroads at (1,1) [even: 1+1=2] and (4,2) [even: 4+2=6].
// C1 at (5,0) [odd: 5+0=5].
// Spawn at (0,0) [even], Goal at (0,3) [odd: 0+3=3].
const l8 = {
  id: 8,
  name: "The Trefoil Knot",
  w: 6, h: 4,
  budget: 0,
  par: 25,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 2, 2, 2, 5], // C1 at (5,0)
    [2, 11, 2, 2, 2, 2], // Crossroad at (1,1)
    [2, 2, 2, 2, 11, 2], // Crossroad at (4,2)
    [4, 2, 2, 2, 2, 2]  // Goal at (0,3)
  ]
};

console.log("Testing World 2 levels...");
[l6, l7, l8].forEach(lvl => {
  console.log(`\n--- Level ${lvl.id}: ${lvl.name} (${lvl.w}x${lvl.h}) ---`);
  const s = new RedesignSolver(lvl).solve(28);
  console.log(`L${lvl.id}: ${s.length} solutions found. Optimal: ${s[0]?.moves}`);
  if (s[0]) console.log(`Trace: ${s[0].path.join(', ')}`);
});

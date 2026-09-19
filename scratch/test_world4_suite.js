/**
 * World 4 Complete Suite (Levels 16 to 20)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING,
  C_SWITCH, C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, C_ICE
} = require('./redesign_engine.js');

// Level 16: "The Polarity Slipstream" (6x5)
// Combines Ice Slide with Phase Switch & Gates.
// Initial phase: RED.
// Slide across ice into Switch at (4,0)!
// Inverts RED -> BLUE, opening Blue Gate at (4,2).
// Descends, traverses Blue Gate, reaches Goal at (0,4).
const l16 = {
  id: 16,
  name: "The Polarity Slipstream",
  w: 6, h: 5,
  initialPhase: 'RED',
  budget: 6,
  par: 6,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [],
  grid: [
    [2, 12, 12, 12, 8, 1], // Slide R to Switch at (4,0)!
    [1, 1, 1, 1, 2, 1],    // Step D to (4,1)
    [1, 1, 1, 1, 10, 1],   // Step D through Blue Gate at (4,2)!
    [1, 1, 1, 1, 2, 1],    // Step D to (4,3)
    [4, 12, 12, 12, 2, 1]  // Step D to (4,4), slide L to Goal at (0,4)!
  ]
};

// Level 17: "Crossroads on Ice" (6x6)
// Crossroad at (3,2) acts as a friction island in an ice chute!
// Slide across ice onto Crossroad (stops, visit 1).
// Loops through chamber, slides back onto Crossroad (visit 2), exits to Goal!
const l17 = {
  id: 17,
  name: "Crossroads on Ice",
  w: 6, h: 5,
  budget: 9,
  par: 9,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [],
  grid: [
    [2, 12, 12, 2, 2, 1],  // Slide R to (3,0)
    [1, 1, 1, 2, 1, 1],    // Step D to (3,1)
    [1, 1, 1, 11, 2, 2],   // Step D to Crossroad at (3,2) [visit 1]
    [1, 1, 1, 2, 1, 2],    // Loop east: (4,2)->(5,2)->(5,3)->(4,3)->(3,3)->(3,2)[visit 2]
    [4, 12, 12, 2, 1, 1]   // From Crossroad, step D to (3,4), slide L to Goal at (0,4)!
  ]
};

// Level 18: "The Entangled Circuit" (6x6)
// Crossroad + Switch + Red/Blue Gates + C1.
// Initial Phase: RED.
const l18 = {
  id: 18,
  name: "The Entangled Circuit",
  w: 6, h: 6,
  initialPhase: 'RED',
  budget: 13,
  par: 13,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 5 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 2, 9, 2, 5],   // Pass Red Gate at (3,0) to C1 at (5,0)
    [1, 1, 1, 1, 1, 8],   // Step D to Switch at (5,1)! [Inverts RED->BLUE, opening Blue Gate]
    [1, 1, 1, 1, 1, 2],   // Step D to (5,2)
    [1, 1, 1, 10, 11, 2], // Blue Gate at (3,3), Crossroad at (4,3), (5,3)
    [1, 1, 1, 2, 1, 1],   // Step D to (3,4)
    [4, 12, 12, 2, 1, 1]  // Step D to (3,5), slide L to Goal at (0,5)!
  ]
};

console.log("Testing World 4 candidates (Levels 16-18)...");
[l16, l17, l18].forEach(lvl => {
  console.log(`\nTesting Level ${lvl.id}: ${lvl.name}...`);
  const s = new RedesignSolver(lvl).solve(16);
  console.log(`L${lvl.id}: ${s.length} solutions found. Optimal moves: ${s[0]?.moves} (Expected: ${lvl.par})`);
  if (s[0]) console.log(`Trace: ${s[0].path.join(', ')}`);
});

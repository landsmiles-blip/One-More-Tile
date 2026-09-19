/**
 * Test Level 19 and Level 20 (Grandmaster Crucible)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING,
  C_SWITCH, C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, C_ICE
} = require('./redesign_engine.js');

// Level 19: "The Cryogenic Nexus" (6x6)
const l19 = {
  id: 19,
  name: "The Cryogenic Nexus",
  w: 6, h: 6,
  initialPhase: 'RED',
  budget: 10,
  par: 10,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 5 },
  checkpoints: [
    { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 3, y: 5, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 12, 12, 12, 2, 5], // Slide R to (4,0), step R to (5,0)[C1]
    [1, 1, 1, 1, 1, 8],    // Step D to Switch at (5,1) [RED->BLUE]
    [1, 1, 1, 1, 1, 2],    // Step D to (5,2)
    [1, 1, 1, 10, 11, 2],  // Step D to (5,3), L to CR(4,3), L through Blue Gate(3,3)
    [1, 1, 1, 2, 1, 1],    // Step D to (3,4)
    [4, 12, 12, 6, 1, 1]   // Step D to C2 at (3,5), slide L to Goal at (0,5)!
  ]
};

// Level 20: "The Grandmaster Labyrinth" (7x7)
// The Apex of ONE MORE TILE:
// Unites: Open Weaving + Crumbling Bridge (7) + Crossroad (11) + Ice Slide (12) +
// Red Gate (9) + Blue Gate (10) + Switch (8) + C1 (5) + C2 (6) + Goal (4).
//
// Let's trace the grand route:
// Row 0: P(0,0), (1,0), Crumble(2,0), (3,0), Red Gate(4,0), (5,0), C1(6,0)
// Col 6: D to Switch(6,1) [flips RED->BLUE, opens Blue Gate!]
// Col 6: D to (6,2), D to (6,3)
// Row 3: L across Ice lane: (5,3), (4,3), (3,3) to Crossroad at (2,3)!
// Col 2: D to (2,4), D to C2 at (2,5)
// Col 2: D through Blue Gate at (2,6)
// Row 6: L across Ice chute (1,6) into Goal at (0,6)!
//
// Move count:
// 1. R to (1,0)
// 2. R to (2,0)[Crumble]
// 3. R to (3,0) [Crumble collapses to VOID]
// 4. R to (4,0)[Red Gate, open]
// 5. R to (5,0)
// 6. R to (6,0)[C1 collected!]
// 7. D to (6,1)[Switch: inverts RED->BLUE, opening Blue Gate!]
// 8. D to (6,2)
// 9. D to (6,3)
// 10. L (slide across (5,3), (4,3), (3,3)[Ice] to Crossroad at (2,3)!)
// 11. D to (2,4)
// 12. D to (2,5)[C2 collected!]
// 13. D to (2,6)[Blue Gate: open because phase is BLUE!]
// 14. L (slide across (1,6)[Ice] to (0,6)[Goal]!)
// Exactly 14 moves!
const l20 = {
  id: 20,
  name: "The Grandmaster Labyrinth",
  w: 7, h: 7,
  initialPhase: 'RED',
  budget: 14,
  par: 14,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 6 },
  checkpoints: [
    { id: 1, x: 6, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 2, y: 5, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 7, 2, 9, 2, 5],     // P(0,0), (1,0), CR(2,0), (3,0), Red Gate(4,0), (5,0), C1(6,0)
    [1, 1, 1, 1, 1, 1, 8],     // Switch at (6,1)
    [1, 1, 1, 1, 1, 1, 2],     // (6,2)
    [1, 1, 11, 12, 12, 12, 2], // (6,3), Ice slide to Crossroad at (2,3)
    [1, 1, 2, 1, 1, 1, 1],     // (2,4)
    [1, 1, 6, 1, 1, 1, 1],     // C2 at (2,5)
    [4, 12, 10, 1, 1, 1, 1]    // Blue Gate at (2,6), Ice at (1,6), Goal at (0,6)
  ]
};

console.log("Testing Level 19...");
const s19 = new RedesignSolver(l19).solve(15);
console.log(`L19 solutions: ${s19.length}`);
if (s19[0]) console.log(`L19 moves: ${s19[0].moves}, trace: ${s19[0].path.join(', ')}`);

console.log("\nTesting Level 20...");
const s20 = new RedesignSolver(l20).solve(18);
console.log(`L20 solutions: ${s20.length}`);
if (s20[0]) console.log(`L20 moves: ${s20[0].moves}, trace: ${s20[0].path.join(', ')}`);

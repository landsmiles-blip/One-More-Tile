/**
 * World 3 Designer: The Frozen Labyrinth (Levels 11 to 15)
 */

const { RedesignSolver } = require('./redesign_solver.js');
const {
  RedesignEngine,
  C_VOID, C_WALL, C_UNTOUCHED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_ICE
} = require('./redesign_engine.js');

// Level 11: "Frictionless Vector" (5x4)
// Introduces Ice slide mechanics.
// Spawn at (0,0).
// Row 0 has ice chute: (1,0), (2,0), (3,0). Wall at (4,0).
// Slide RIGHT: (0,0) -> slides across ice, stops at (3,0) in front of Wall(4,0)! (1 move).
// (1,0) and (2,0) consume to C_CONSUMED.
// From (3,0), player moves DOWN: (3,1) -> (3,2) -> (3,3) -> LEFT across bottom row to Goal at (0,3).
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
    [2, 12, 12, 12, 1], // P(0,0), Ice, Ice, Ice, Wall(4,0)
    [2, 1, 1, 2, 2],    // Walls blocking middle
    [2, 1, 1, 2, 2],
    [4, 2, 2, 2, 2]     // Goal at (0,3)
  ]
};

console.log("Solving L11 with RedesignSolver...");
const s11 = new RedesignSolver(l11).solve(15);
console.log(`L11 solutions: ${s11.length}`);
if (s11[0]) {
  console.log(`L11 Optimal moves: ${s11[0].moves}`);
  console.log(`L11 Trace: ${s11[0].path.join(', ')}`);
}

/**
 * Test Level 12 Trail Bumper Layout
 */

const { RedesignSolver } = require('./redesign_solver.js');
const { RedesignEngine, C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_ICE } = require('./redesign_engine.js');

// 5x5 Grid
// Row 0: # (0,0)  # (1,0)  . (2,0)  . (3,0)  . (4,0) [Upper staging]
// Row 1: G(0,1)  . (1,1)  Ice(2,1) # (3,1)  . (4,1)
// Row 2: P(0,2)  Ice(1,2) Ice(2,2) Ice(3,2) . (4,2) [Horizontal slide lane]
// Row 3: # (0,3) # (1,3)  Ice(2,3) # (3,3)  # (4,3)
// Row 4: # (0,4) # (1,4)  # (2,4)  # (3,4)  # (4,4)
//
// Trace:
// Start at P(0,2).
// Move RIGHT: slides across (1,2)[Ice], (2,2)[Ice], (3,2)[Ice] -> lands on (4,2)!
// (1,2), (2,2), (3,2) mutate to C_CONSUMED!
// Move UP: to (4,1).
// Move UP: to (4,0).
// Move LEFT: to (3,0).
// Move LEFT: to (2,0).
// Now at (2,0):
// Move DOWN: steps onto (2,1)[Ice].
// Ahead is (2,2), which is C_CONSUMED (the trail bumper we laid on move 1)!
// Slide stops at (2,1)!
// Move LEFT: to (1,1).
// Move LEFT: to (0,1)[Goal]!
// Total moves: 8 moves!

const l12 = {
  id: 12,
  name: "The Trail Bumper",
  w: 5, h: 5,
  budget: 8,
  par: 8,
  spawn: { x: 0, y: 2 },
  goal: { x: 0, y: 1 },
  checkpoints: [],
  grid: [
    [1, 1, 2, 2, 2],
    [4, 2, 12, 1, 2],
    [2, 12, 12, 12, 2],
    [1, 1, 12, 1, 1],
    [1, 1, 1, 1, 1]
  ]
};

console.log("Testing Level 12 Trail Bumper...");
const eng = new RedesignEngine(l12);
console.log("Move R:", eng.move('RIGHT'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move U:", eng.move('UP'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move U:", eng.move('UP'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move L:", eng.move('LEFT'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move L:", eng.move('LEFT'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move D:", eng.move('DOWN'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move L:", eng.move('LEFT'), "pos:", eng.player, "budget:", eng.budget);
console.log("Move L:", eng.move('LEFT'), "pos:", eng.player, "budget:", eng.budget);
console.log("Complete?", eng.isComplete, "Deadlocked?", eng.isDeadlocked);

console.log("\nSolving L12 with RedesignSolver...");
const s12 = new RedesignSolver(l12).solve(15);
console.log(`L12 solutions: ${s12.length}`);
if (s12[0]) {
  console.log(`L12 Optimal moves: ${s12[0].moves}`);
  console.log(`L12 Trace: ${s12[0].path.join(', ')}`);
}

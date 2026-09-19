const { solveLevel } = require('./synthesize_levels.js');
const { verifyTrace, C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_CROSSROAD } = require('./design_tool.js');

// Level 11 design candidate
// 5x5 grid
// Let's place:
// Spawn at (0,0)
// Goal at (0,4)
// Crumbling at (2,0)
// Crossroad at (2,2)
// C1 at (4,0)
// Walls at (1,1), (3,1), (1,3)
const l11 = {
  id: 11,
  world: 3,
  name: "The Bifurcated Nexus",
  w: 5,
  h: 5,
  budget: 0,
  par: 22,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 4 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: 5 }
  ],
  grid: [
    [2, 2, 7, 2, 5],
    [2, 1, 2, 1, 2],
    [2, 2, 11, 2, 2],
    [2, 1, 2, 2, 2],
    [4, 2, 2, 2, 2]
  ]
};

console.log("Searching for solution for Level 11...");
const startT = Date.now();
const sol = solveLevel(l11);
console.log(`Time: ${Date.now() - startT}ms`);

if (sol) {
  console.log("Solution found! Length:", sol.length);
  console.log("Trace:", JSON.stringify(sol));
  l11.trace = sol;
  const ver = verifyTrace(l11);
  console.log("Verification:", ver);
} else {
  console.log("No solution found.");
}

/**
 * Parity and Grid Search Helper for World 1
 */

function analyzeParity(w, h, grid, spawn, goal) {
  let evenCount = 0;
  let oddCount = 0;
  let totalTraversable = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cell = grid[y][x];
      if (cell !== 1 && cell !== 0) { // not wall or void
        totalTraversable++;
        if ((x + y) % 2 === 0) {
          evenCount++;
        } else {
          oddCount++;
        }
      }
    }
  }

  const spawnParity = (spawn.x + spawn.y) % 2;
  const goalParity = (goal.x + goal.y) % 2;
  const moves = totalTraversable - 1;

  console.log(`Traversable: ${totalTraversable}, Moves: ${moves}`);
  console.log(`Even tiles: ${evenCount}, Odd tiles: ${oddCount}`);
  console.log(`Spawn: (${spawn.x},${spawn.y}) parity ${spawnParity}`);
  console.log(`Goal: (${goal.x},${goal.y}) parity ${goalParity}`);

  const validDiff = Math.abs(evenCount - oddCount) <= 1;
  const parityMatch = (moves % 2 === 0) ? (spawnParity === goalParity) : (spawnParity !== goalParity);
  console.log(`Valid diff? ${validDiff}, Parity match? ${parityMatch}`);
  return validDiff && parityMatch;
}

// Test Level 2 with wall at (1,1):
// w = 4, h = 4. 16 cells. 1 wall at (1,1) (parity 2 = even).
// Even total was 8, now 7. Odd total is 8.
// Since Odd = 8 and Even = 7, path MUST start on Odd and end on Odd!
// But Spawn (0,0) is Even! That's why it was mathematically impossible!
// To fix:
// Either wall at an odd tile (e.g. (2,1) or (1,2)), OR spawn at odd tile, OR 2 walls (one even, one odd)!
const grid2 = [
  [2, 2, 2, 2],
  [2, 2, 1, 2], // Wall at (2,1): x=2,y=1 => 3 (odd)
  [4, 2, 2, 2], // Goal at (0,2): even
  [2, 2, 2, 2]
];
// Spawn at (0,0): even. Total tiles: 15. Moves: 14 (even).
// Even tiles: 8. Odd tiles: 7.
// Since Even = Odd + 1, path MUST start on Even (0,0) and end on Even (0,2)!
// Parity theorem is satisfied!
console.log("\nAnalyzing Grid 2:");
analyzeParity(4, 4, grid2, {x:0, y:0}, {x:0, y:2});

const { RedesignSolver } = require('./redesign_solver.js');
const s2 = new RedesignSolver({
  id: 2, name: "The Central Pillar", w: 4, h: 4, budget: 0, par: 14,
  spawn: { x: 0, y: 0 }, goal: { x: 0, y: 2 }, checkpoints: [], grid: grid2
}).solve(18);
console.log(`Grid 2 solutions: ${s2.length}`);
if (s2[0]) console.log(`Trace 2: ${s2[0].path.join(', ')}`);

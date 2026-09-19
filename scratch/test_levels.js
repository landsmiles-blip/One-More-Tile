const fs = require('fs');

// Verify levels data and traces
const LEVELS = [
  { id: 1, name: "The Straightaway", w: 3, h: 1, grid: [[2, 2, 4]], spawn: {x:0, y:0}, goal: {x:2, y:0}, par: 2, trace: [{x:1, y:0}, {x:1, y:0}] },
  { id: 2, name: "The Corner", w: 3, h: 2, grid: [[2, 2, 2], [1, 1, 4]], spawn: {x:0, y:0}, goal: {x:2, y:1}, par: 3, trace: [{x:1, y:0}, {x:1, y:0}, {x:0, y:1}] },
  { id: 3, name: "The Mini-Loop", w: 2, h: 2, grid: [[2, 2], [4, 2]], spawn: {x:0, y:0}, goal: {x:0, y:1}, par: 3, trace: [{x:1, y:0}, {x:0, y:1}, {x:-1, y:0}] },
  { id: 4, name: "The True Fork", w: 3, h: 3, grid: [[2, 2, 1], [2, 2, 1], [4, 2, 1]], spawn: {x:1, y:0}, goal: {x:0, y:2}, par: 5, trace: [{x:-1, y:0}, {x:0, y:1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}] },
  { id: 5, name: "The Snake", w: 3, h: 2, grid: [[2, 2, 2], [4, 2, 2]], spawn: {x:0, y:0}, goal: {x:0, y:1}, par: 5, trace: [{x:1, y:0}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}, {x:-1, y:0}] }
];

console.log("=== SIMULATING LEVELS 1-5 PLAYTHROUGH ===");

LEVELS.forEach(lvl => {
  const grid = lvl.grid.map(row => [...row]);
  let player = { ...lvl.spawn };
  const goal = { ...lvl.goal };
  let moves = 0;

  lvl.trace.forEach((dir, step) => {
    const tx = player.x + dir.x;
    const ty = player.y + dir.y;

    // Check bounds
    if (tx < 0 || tx >= lvl.w || ty < 0 || ty >= lvl.h) {
      throw new Error(`Level ${lvl.id} step ${step}: Out of bounds!`);
    }

    // Check departure cell consumed
    grid[player.y][player.x] = 3; // CONSUMED

    player = { x: tx, y: ty };
    moves++;
  });

  // Check goal reached
  if (player.x !== goal.x || player.y !== goal.y) {
    throw new Error(`Level ${lvl.id}: Failed to reach goal! End at (${player.x}, ${player.y}), goal at (${goal.x}, ${goal.y})`);
  }

  // Check all untouched tiles consumed
  let untouched = 0;
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      if (grid[y][x] === 2 && !(x === goal.x && y === goal.y)) {
        untouched++;
      }
    }
  }

  if (untouched !== 0) {
    throw new Error(`Level ${lvl.id}: Left ${untouched} tiles unconsumed!`);
  }

  console.log(`Level ${lvl.id} (${lvl.name}): PASSED in ${moves} moves (Par: ${lvl.par})`);
});

console.log("ALL 5 LEVELS VERIFIED DETERMINISTICALLY SOLVABLE!");

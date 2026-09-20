const fs = require('fs');

const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CROSSROAD = 11;

const DIRS = [
  { name: 'UP', dx: 0, dy: -1 },
  { name: 'RIGHT', dx: 1, dy: 0 },
  { name: 'DOWN', dx: 0, dy: 1 },
  { name: 'LEFT', dx: -1, dy: 0 }
];

function solveLevel(lvl) {
  const w = lvl.w;
  const h = lvl.h;
  const spawn = lvl.spawn;
  const goal = lvl.goal;
  const hasC1 = lvl.checkpoints && lvl.checkpoints.some(c => c.id === 1);
  const hasC2 = lvl.checkpoints && lvl.checkpoints.some(c => c.id === 2);

  // Count total required visits
  let totalRequiredMoves = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === spawn.x && y === spawn.y) continue;
      const c = lvl.grid[y][x];
      if (c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2) {
        totalRequiredMoves += 1;
      } else if (c === C_CROSSROAD) {
        totalRequiredMoves += 2;
      } else if (c === C_GOAL) {
        totalRequiredMoves += 1;
      }
    }
  }

  // Initial state
  const initialCrossroads = new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (lvl.grid[y][x] === C_CROSSROAD) {
        initialCrossroads.set(`${x},${y}`, 2);
      }
    }
  }

  // DFS solver
  const visited = new Set();
  visited.add(`${spawn.x},${spawn.y}`);

  let solutionTrace = null;
  let exploredCount = 0;

  function dfs(x, y, moves, c1Done, c2Done, crossroadState, trace) {
    if (solutionTrace) return;
    exploredCount++;

    if (x === goal.x && y === goal.y) {
      if (moves === totalRequiredMoves && (!hasC1 || c1Done) && (!hasC2 || c2Done)) {
        solutionTrace = [...trace];
      }
      return;
    }

    // Heuristic prune: remaining moves
    const remainingMoves = totalRequiredMoves - moves;
    const manhattanToGoal = Math.abs(x - goal.x) + Math.abs(y - goal.y);
    if (manhattanToGoal > remainingMoves) return;

    for (const d of DIRS) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

      const cell = lvl.grid[ny][nx];
      if (cell === C_WALL || cell === C_VOID) continue;

      const nkey = `${nx},${ny}`;

      if (cell === C_GOAL) {
        // Can only step on goal if it is the VERY LAST move and all checkpoints done
        if (moves + 1 === totalRequiredMoves && (!hasC1 || c1Done) && (!hasC2 || c2Done)) {
          dfs(nx, ny, moves + 1, c1Done, c2Done, crossroadState, [...trace, d.name]);
        }
        continue;
      }

      if (cell === C_CHECKPOINT_1) {
        if (!visited.has(nkey)) {
          visited.add(nkey);
          dfs(nx, ny, moves + 1, true, c2Done, crossroadState, [...trace, d.name]);
          visited.delete(nkey);
        }
      } else if (cell === C_CHECKPOINT_2) {
        if (c1Done && !visited.has(nkey)) {
          visited.add(nkey);
          dfs(nx, ny, moves + 1, c1Done, true, crossroadState, [...trace, d.name]);
          visited.delete(nkey);
        }
      } else if (cell === C_CROSSROAD) {
        const currentVisits = crossroadState.get(nkey);
        if (currentVisits > 0) {
          // Crossroad cannot immediately turn back 180 degrees
          if (trace.length > 0) {
            const lastDir = trace[trace.length - 1];
            if ((d.dx === 1 && lastDir === 'LEFT') || (d.dx === -1 && lastDir === 'RIGHT') ||
                (d.dy === 1 && lastDir === 'UP') || (d.dy === -1 && lastDir === 'DOWN')) {
              continue;
            }
          }

          crossroadState.set(nkey, currentVisits - 1);
          dfs(nx, ny, moves + 1, c1Done, c2Done, crossroadState, [...trace, d.name]);
          crossroadState.set(nkey, currentVisits);
        }
      } else if (cell === C_UNTOUCHED) {
        if (!visited.has(nkey)) {
          visited.add(nkey);
          dfs(nx, ny, moves + 1, c1Done, c2Done, crossroadState, [...trace, d.name]);
          visited.delete(nkey);
        }
      }
    }
  }

  dfs(spawn.x, spawn.y, 0, !hasC1, !hasC2, initialCrossroads, []);
  return { trace: solutionTrace, totalMoves: totalRequiredMoves, exploredCount };
}

module.exports = { solveLevel, C_VOID, C_WALL, C_UNTOUCHED, C_CONSUMED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_CROSSROAD };

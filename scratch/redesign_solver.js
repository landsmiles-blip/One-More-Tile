/**
 * Redesign Solver
 * Finds all optimal and sub-optimal solutions using BFS/DFS
 */

const { RedesignEngine, DIRS, C_ICE, C_GOAL } = require('./redesign_engine.js');

class RedesignSolver {
  constructor(levelDef) {
    this.lvl = levelDef;
  }

  solve(maxDepth = 35) {
    const queue = [];
    const visited = new Map();

    const initialEng = new RedesignEngine(this.lvl);
    
    // State serialization for visited map
    const serialize = (eng) => {
      let gStr = '';
      for (let y = 0; y < eng.h; y++) {
        for (let x = 0; x < eng.w; x++) {
          gStr += eng.grid[y][x];
        }
      }
      let crStr = '';
      for (const [k, v] of eng.crossroads.entries()) {
        crStr += `${k}:${v},`;
      }
      return `${eng.player.x},${eng.player.y},${eng.phaseState ? 1 : 0},${eng.c1Collected ? 1 : 0},${eng.c2Collected ? 1 : 0},${crStr},${gStr}`;
    };

    queue.push({
      engine: initialEng,
      moves: 0,
      path: []
    });

    const solutions = [];

    while (queue.length > 0) {
      const { engine, moves, path } = queue.shift();

      if (moves > maxDepth) continue;

      const stateKey = serialize(engine);
      if (visited.has(stateKey) && visited.get(stateKey) <= moves) continue;
      visited.set(stateKey, moves);

      for (const d of DIRS) {
        // Clone engine by creating new one with same level and applying path + new move
        // Or using undo/clone. To ensure perfect simulation, clone state:
        const nextEng = new RedesignEngine(this.lvl);
        // replay path
        let validPath = true;
        for (const p of path) {
          const res = nextEng.move(p);
          if (!res.success) {
            validPath = false;
            break;
          }
        }
        if (!validPath) continue;

        // Apply new move
        const res = nextEng.move(d.name);
        if (!res.success) continue;

        const newPath = [...path, d.name];

        if (nextEng.isComplete) {
          solutions.push({
            moves: moves + 1,
            path: newPath
          });
          continue;
        }

        if (nextEng.isDeadlocked) continue;

        queue.push({
          engine: nextEng,
          moves: moves + 1,
          path: newPath
        });
      }
    }

    solutions.sort((a, b) => a.moves - b.moves);
    return solutions;
  }
}

module.exports = { RedesignSolver };

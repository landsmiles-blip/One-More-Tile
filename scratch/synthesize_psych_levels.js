const { PsychEngine, verifyPsychSolution, C_VOID, C_FLOOR_STONE, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH, C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, DIRS } = require('./psych_engine.js');

// Function to search a valid path on a W x H grid
function searchPsychPath({
  w, h, par, crCount = 0, spawn = [0, 0], goal = null,
  forbidden = []
}) {
  const totalSteps = par;
  const targetUnique = par + 1 - crCount;
  const forbSet = new Set(forbidden.map(p => `${p[0]},${p[1]}`));

  const dirs = [
    [1, 0, 'RIGHT'],
    [0, 1, 'DOWN'],
    [-1, 0, 'LEFT'],
    [0, -1, 'UP']
  ];

  const path = [spawn];
  const visitCounts = new Map();
  visitCounts.set(`${spawn[0]},${spawn[1]}`, 1);
  let uniqueCount = 1;

  let solution = null;

  function dfs(curr, crUsed) {
    if (solution) return;

    if (path.length === totalSteps + 1) {
      if (crUsed === crCount && uniqueCount === targetUnique) {
        const goalKey = `${curr[0]},${curr[1]}`;
        if (visitCounts.get(goalKey) === 1) {
          if (!goal || (curr[0] === goal[0] && curr[1] === goal[1])) {
            const crCoords = [];
            for (const [k, v] of visitCounts.entries()) {
              if (v === 2) {
                const [cx, cy] = k.split(',').map(Number);
                crCoords.push([cx, cy]);
              }
            }
            solution = {
              path: path.map(p => [...p]),
              crCoords
            };
          }
        }
      }
      return;
    }

    const stepsLeft = totalSteps + 1 - path.length;
    const crLeft = crCount - crUsed;
    const uniqueLeft = targetUnique - uniqueCount;
    if (stepsLeft < crLeft + uniqueLeft) return;

    for (const [dx, dy, dirName] of dirs) {
      const nx = curr[0] + dx;
      const ny = curr[1] + dy;

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const k = `${nx},${ny}`;
      if (forbSet.has(k)) continue;

      const vCount = visitCounts.get(k) || 0;

      if (vCount === 0) {
        if (uniqueCount < targetUnique) {
          uniqueCount++;
          visitCounts.set(k, 1);
          path.push([nx, ny]);
          dfs([nx, ny], crUsed);
          path.pop();
          visitCounts.set(k, 0);
          uniqueCount--;
        }
      } else if (vCount === 1 && crUsed < crCount) {
        if (nx === spawn[0] && ny === spawn[1]) continue;
        const prev = path[path.length - 2];
        if (prev && prev[0] === nx && prev[1] === ny) continue;
        if (path.length === totalSteps) continue;

        visitCounts.set(k, 2);
        path.push([nx, ny]);
        dfs([nx, ny], crUsed + 1);
        path.pop();
        visitCounts.set(k, 1);
      }
      if (solution) return;
    }
  }

  dfs(spawn, 0);
  return solution;
}

function buildPsychLevel({
  id, world, name, w, h, archetype, par,
  pathCoords, crCoords = [], crumbCoords = [],
  c1Coord = null, c2Coord = null,
  switchCoords = [], redGateCoords = [], blueGateCoords = [],
  initialPhase = "RED"
}) {
  const spawn = { x: pathCoords[0][0], y: pathCoords[0][1] };
  const goal = { x: pathCoords[pathCoords.length - 1][0], y: pathCoords[pathCoords.length - 1][1] };

  // Set of all used coordinates in path
  const inPath = new Set(pathCoords.map(p => `${p[0]},${p[1]}`));

  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      if (!inPath.has(`${x},${y}`)) {
        row.push(C_FLOOR_STONE); // 1
      } else {
        row.push(C_UNTOUCHED);   // 2
      }
    }
    grid.push(row);
  }

  // Goal
  grid[goal.y][goal.x] = C_GOAL; // 4

  // Crumbling
  for (const c of crumbCoords) {
    grid[c[1]][c[0]] = C_CRUMBLING; // 7
  }

  // Crossroads
  for (const c of crCoords) {
    grid[c[1]][c[0]] = C_CROSSROAD; // 11
  }

  // Checkpoints
  const checkpoints = [];
  if (c1Coord) {
    grid[c1Coord[1]][c1Coord[0]] = C_CHECKPOINT_1; // 5
    checkpoints.push({ id: 1, x: c1Coord[0], y: c1Coord[1], cellType: C_CHECKPOINT_1 });
  }
  if (c2Coord) {
    grid[c2Coord[1]][c2Coord[0]] = C_CHECKPOINT_2; // 6
    checkpoints.push({ id: 2, x: c2Coord[0], y: c2Coord[1], cellType: C_CHECKPOINT_2 });
  }

  // Switches and Gates
  for (const c of switchCoords) {
    grid[c[1]][c[0]] = C_SWITCH; // 8
  }
  for (const c of redGateCoords) {
    grid[c[1]][c[0]] = C_GATE_RED; // 9
  }
  for (const c of blueGateCoords) {
    grid[c[1]][c[0]] = C_GATE_BLUE; // 10
  }

  // Derive trace
  const trace = [];
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const curr = pathCoords[i];
    const next = pathCoords[i + 1];
    const dx = next[0] - curr[0];
    const dy = next[1] - curr[1];
    if (dx === 1) trace.push("RIGHT");
    else if (dx === -1) trace.push("LEFT");
    else if (dy === 1) trace.push("DOWN");
    else if (dy === -1) trace.push("UP");
  }

  const levelDef = {
    id,
    world,
    name,
    archetype,
    w,
    h,
    budget: 0,
    par,
    spawn,
    goal,
    checkpoints,
    grid,
    trace,
    initialPhase
  };

  const ver = verifyPsychSolution(levelDef);
  if (!ver.success) {
    throw new Error(`Verification failed for Level ${id} "${name}": ${ver.error}`);
  }

  return levelDef;
}

module.exports = { searchPsychPath, buildPsychLevel };

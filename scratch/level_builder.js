const { SimEngine, verifyTrace, C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH, C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, DIRS, DIR_LIST } = require('./design_tool.js');

// Function to generate a level from a concrete path on an open grid
function buildLevelFromPath({ id, world, name, w, h, archetype, pathCoords, crCoords = [], crumbCoords = [], c1Coord = null, c2Coord = null, switchCoords = [], redGateCoords = [], blueGateCoords = [], initialPhase = 'RED' }) {
  // pathCoords: array of [x, y], length = par + 1 (from spawn to goal)
  const spawn = { x: pathCoords[0][0], y: pathCoords[0][1] };
  const goal = { x: pathCoords[pathCoords.length - 1][0], y: pathCoords[pathCoords.length - 1][1] };
  const par = pathCoords.length - 1;

  // Build grid
  // Any cell not in pathCoords is C_WALL
  const grid = [];
  const inPath = new Set(pathCoords.map(p => `${p[0]},${p[1]}`));

  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      if (!inPath.has(`${x},${y}`)) {
        row.push(C_WALL);
      } else {
        row.push(C_UNTOUCHED);
      }
    }
    grid.push(row);
  }

  // Place goal
  grid[goal.y][goal.x] = C_GOAL;

  // Place crumbling
  for (const c of crumbCoords) {
    grid[c[1]][c[0]] = C_CRUMBLING;
  }

  // Place crossroads
  for (const c of crCoords) {
    grid[c[1]][c[0]] = C_CROSSROAD;
  }

  // Place checkpoints
  const checkpoints = [];
  if (c1Coord) {
    grid[c1Coord[1]][c1Coord[0]] = C_CHECKPOINT_1;
    checkpoints.push({ id: 1, x: c1Coord[0], y: c1Coord[1], cellType: C_CHECKPOINT_1 });
  }
  if (c2Coord) {
    grid[c2Coord[1]][c2Coord[0]] = C_CHECKPOINT_2;
    checkpoints.push({ id: 2, x: c2Coord[0], y: c2Coord[1], cellType: C_CHECKPOINT_2 });
  }

  // Place switches and gates
  for (const c of switchCoords) {
    grid[c[1]][c[0]] = C_SWITCH;
  }
  for (const c of redGateCoords) {
    grid[c[1]][c[0]] = C_GATE_RED;
  }
  for (const c of blueGateCoords) {
    grid[c[1]][c[0]] = C_GATE_BLUE;
  }

  // Derive trace from pathCoords
  const trace = [];
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const curr = pathCoords[i];
    const next = pathCoords[i + 1];
    const dx = next[0] - curr[0];
    const dy = next[1] - curr[1];
    let dirName = '';
    if (dx === 1) dirName = 'RIGHT';
    else if (dx === -1) dirName = 'LEFT';
    else if (dy === 1) dirName = 'DOWN';
    else if (dy === -1) dirName = 'UP';
    trace.push(dirName);
  }

  const levelDef = {
    id,
    world,
    name,
    w,
    h,
    budget: 0,
    par,
    spawn,
    goal,
    checkpoints,
    grid,
    trace,
    archetype,
    initialPhase
  };

  const ver = verifyTrace(levelDef);
  if (!ver.success) {
    throw new Error(`Verification failed for ${name}: ${ver.error}`);
  }
  levelDef.branching_factor = ver.avgBranching;
  return levelDef;
}

module.exports = { buildLevelFromPath };

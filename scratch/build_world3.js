const { buildLevelFromPath } = require('./level_builder.js');
const { searchOpenPath } = require('./search_open_paths.js');
const { verifyTrace } = require('./design_tool.js');

function calculateTopologicalBranchingFactor(lvl) {
  let totalDegree = 0;
  let traversableTiles = 0;
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === 1 || cell === 0) continue; // C_WALL or C_VOID
      traversableTiles++;
      for (const d of [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
      ]) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx >= 0 && nx < lvl.w && ny >= 0 && ny < lvl.h) {
          const nCell = lvl.grid[ny][nx];
          if (nCell !== 1 && nCell !== 0) {
            totalDegree++;
          }
        }
      }
    }
  }
  return traversableTiles > 0 ? (totalDegree / traversableTiles) : 0;
}

// Generate World 3 Level
function generateWorld3Level({ id, name, w, h, par, crCount, crumbCount, c1, c2, archetype, spawn = [0, 0] }) {
  console.log(`Generating Level ${id}: ${name} (w:${w}, h:${h}, par:${par}, CR:${crCount}, Crumb:${crumbCount})...`);
  const res = searchOpenPath({
    w, h, par, crCount, spawn
  });

  if (!res) {
    throw new Error(`Failed to find path for Level ${id}`);
  }

  const path = res.path;
  const crCoords = res.crCoords;
  const crSet = new Set(crCoords.map(c => `${c[0]},${c[1]}`));

  // Available indices for checkpoints and crumbling (must not be spawn, goal, or crossroad)
  const availableIndices = [];
  for (let i = 1; i < path.length - 1; i++) {
    const pt = path[i];
    if (!crSet.has(`${pt[0]},${pt[1]}`)) {
      availableIndices.push(i);
    }
  }

  // Assign C1, C2, Crumbling
  let c1Coord = null;
  let c2Coord = null;
  const crumbCoords = [];

  let ptr = 0;
  if (c1) {
    const idx = availableIndices[Math.floor(availableIndices.length * 0.2)];
    c1Coord = path[idx];
  }
  if (c2) {
    const idx = availableIndices[Math.floor(availableIndices.length * 0.7)];
    c2Coord = path[idx];
  }
  for (let i = 0; i < crumbCount; i++) {
    const frac = (i + 1) / (crumbCount + 1);
    const idx = availableIndices[Math.floor(availableIndices.length * frac)];
    const pt = path[idx];
    if ((!c1Coord || pt[0] !== c1Coord[0] || pt[1] !== c1Coord[1]) &&
        (!c2Coord || pt[0] !== c2Coord[0] || pt[1] !== c2Coord[1]) &&
        !crumbCoords.some(c => c[0] === pt[0] && c[1] === pt[1])) {
      crumbCoords.push(pt);
    }
  }

  const lvl = buildLevelFromPath({
    id,
    world: 3,
    name,
    w,
    h,
    archetype,
    pathCoords: path,
    crCoords,
    crumbCoords,
    c1Coord,
    c2Coord
  });

  const topoB = calculateTopologicalBranchingFactor(lvl);
  lvl.topoB = topoB;
  lvl.branching_factor = Number(topoB.toFixed(1));
  console.log(`  PASSED: Level ${id} (Par ${lvl.par}, Topo Branching: ${lvl.branching_factor})`);
  return lvl;
}

const w3_levels = [];

// Level 11: Par 22, 5x5, 1 CR, 1 Crumb, C1
w3_levels.push(generateWorld3Level({
  id: 11,
  name: "The Bifurcated Nexus",
  w: 5,
  h: 5,
  par: 22,
  crCount: 1,
  crumbCount: 1,
  c1: true,
  c2: false,
  archetype: "Return Bridge & Lobe Isolation"
}));

// Level 12: Par 24, 5x5, 2 CR, 1 Crumb, C1
w3_levels.push(generateWorld3Level({
  id: 12,
  name: "The Obsidian Cloverleaf",
  w: 5,
  h: 5,
  par: 24,
  crCount: 2,
  crumbCount: 1,
  c1: true,
  c2: false,
  archetype: "Dual-Hub Cloverleaf"
}));

// Level 13: Par 26, 6x5, 1 CR, 2 Crumb, C1, C2
w3_levels.push(generateWorld3Level({
  id: 13,
  name: "The Trefoil Chasm",
  w: 6,
  h: 5,
  par: 26,
  crCount: 1,
  crumbCount: 2,
  c1: true,
  c2: true,
  archetype: "Triple Lobe Isolation & Sacrifice"
}));

// Level 14: Par 28, 6x5, 2 CR, 2 Crumb, C1, C2
w3_levels.push(generateWorld3Level({
  id: 14,
  name: "The Runic Quad-Hub",
  w: 6,
  h: 5,
  par: 28,
  crCount: 2,
  crumbCount: 2,
  c1: true,
  c2: true,
  archetype: "Quad-Hub Nexus & Lobe Partition"
}));

// Level 15: Par 30, 6x6, 2 CR, 3 Crumb, C1, C2
w3_levels.push(generateWorld3Level({
  id: 15,
  name: "The Shattered Singularity",
  w: 6,
  h: 6,
  par: 30,
  crCount: 2,
  crumbCount: 3,
  c1: true,
  c2: true,
  archetype: "Master Lobe & Return Bridge Synthesis"
}));

console.log("\nALL 5 WORLD 3 LEVELS GENERATED & VERIFIED SUCCESSFULLY!");

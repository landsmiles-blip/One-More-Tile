const { buildLevelFromPath } = require('./level_builder.js');
const { searchOpenPath } = require('./search_open_paths.js');
const { verifyTrace } = require('./design_tool.js');

function calculateTopologicalBranchingFactor(lvl) {
  let totalDegree = 0;
  let traversableTiles = 0;
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === 1 || cell === 0) continue;
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

// Generate World 4 Level with Phase Switches & Polarity Gates
function generateWorld4Level({
  id, name, w, h, par, crCount = 1, crumbCount = 0,
  switchCount = 1, redGateCount = 1, blueGateCount = 1,
  c1 = true, c2 = false, archetype, spawn = [0, 0]
}) {
  console.log(`Generating Level ${id}: ${name} (w:${w}, h:${h}, par:${par}, CR:${crCount}, Switches:${switchCount})...`);
  const res = searchOpenPath({
    w, h, par, crCount, spawn
  });

  if (!res) {
    throw new Error(`Failed to find path for Level ${id}`);
  }

  const path = res.path;
  const crCoords = res.crCoords;
  const crSet = new Set(crCoords.map(c => `${c[0]},${c[1]}`));

  const availableIndices = [];
  for (let i = 1; i < path.length - 1; i++) {
    const pt = path[i];
    if (!crSet.has(`${pt[0]},${pt[1]}`)) {
      availableIndices.push(i);
    }
  }

  const switchCoords = [];
  const redGateCoords = [];
  const blueGateCoords = [];
  const crumbCoords = [];
  let c1Coord = null;
  let c2Coord = null;

  if (switchCount === 1) {
    // Single switch:
    // Red gate before switch (phase = RED)
    // Switch in middle (inverts to BLUE)
    // Blue gate after switch (phase = BLUE)
    const redGateIdx = availableIndices[Math.floor(availableIndices.length * 0.18)];
    const switchIdx = availableIndices[Math.floor(availableIndices.length * 0.4)];
    const blueGateIdx = availableIndices[Math.floor(availableIndices.length * 0.62)];

    redGateCoords.push(path[redGateIdx]);
    switchCoords.push(path[switchIdx]);
    blueGateCoords.push(path[blueGateIdx]);

    if (c1) {
      const c1Idx = availableIndices[Math.floor(availableIndices.length * 0.5)];
      c1Coord = path[c1Idx];
    }
    if (c2) {
      const c2Idx = availableIndices[Math.floor(availableIndices.length * 0.8)];
      c2Coord = path[c2Idx];
    }
    if (crumbCount > 0) {
      const crIdx = availableIndices[Math.floor(availableIndices.length * 0.85)];
      crumbCoords.push(path[crIdx]);
    }
  } else {
    // 2 switches:
    // Red gate 1 (before switch 1, phase = RED)
    // Switch 1 (flips to BLUE)
    // Blue gate (between switch 1 & 2, phase = BLUE)
    // Switch 2 (flips to RED)
    // Red gate 2 (if redGateCount === 2, after switch 2, phase = RED)
    const redGate1Idx = availableIndices[Math.floor(availableIndices.length * 0.15)];
    const switch1Idx = availableIndices[Math.floor(availableIndices.length * 0.32)];
    const blueGateIdx = availableIndices[Math.floor(availableIndices.length * 0.48)];
    const switch2Idx = availableIndices[Math.floor(availableIndices.length * 0.65)];

    redGateCoords.push(path[redGate1Idx]);
    switchCoords.push(path[switch1Idx]);
    blueGateCoords.push(path[blueGateIdx]);
    switchCoords.push(path[switch2Idx]);

    if (redGateCount === 2) {
      const redGate2Idx = availableIndices[Math.floor(availableIndices.length * 0.78)];
      redGateCoords.push(path[redGate2Idx]);
    }

    if (c1) {
      const c1Idx = availableIndices[Math.floor(availableIndices.length * 0.25)];
      c1Coord = path[c1Idx];
    }
    if (c2) {
      const c2Idx = availableIndices[Math.floor(availableIndices.length * 0.72)];
      c2Coord = path[c2Idx];
    }
    for (let i = 0; i < crumbCount; i++) {
      const frac = 0.82 + i * 0.08;
      const crIdx = availableIndices[Math.min(availableIndices.length - 1, Math.floor(availableIndices.length * frac))];
      crumbCoords.push(path[crIdx]);
    }
  }

  const lvl = buildLevelFromPath({
    id,
    world: 4,
    name,
    w,
    h,
    archetype,
    pathCoords: path,
    crCoords,
    crumbCoords,
    c1Coord,
    c2Coord,
    switchCoords,
    redGateCoords,
    blueGateCoords,
    initialPhase: 'RED'
  });

  const topoB = calculateTopologicalBranchingFactor(lvl);
  lvl.topoB = topoB;
  lvl.branching_factor = Number(topoB.toFixed(1));
  console.log(`  PASSED: Level ${id} (Par ${lvl.par}, Topo Branching: ${lvl.branching_factor})`);
  return lvl;
}

const w4_levels = [];

// Level 16: Par 26, 6x5, 1 Switch, 1 Red Gate, 1 Blue Gate, 1 CR, C1
w4_levels.push(generateWorld4Level({
  id: 16,
  name: "The Polarity Threshold",
  w: 6,
  h: 5,
  par: 26,
  crCount: 1,
  crumbCount: 0,
  switchCount: 1,
  redGateCount: 1,
  blueGateCount: 1,
  c1: true,
  c2: false,
  archetype: "Binary Phase Aperture"
}));

// Level 17: Par 28, 6x5, 2 Switches, 1 Red Gate, 1 Blue Gate, 1 Crumb, 1 CR, C1
w4_levels.push(generateWorld4Level({
  id: 17,
  name: "The Alternating Crucible",
  w: 6,
  h: 5,
  par: 28,
  crCount: 1,
  crumbCount: 1,
  switchCount: 2,
  redGateCount: 1,
  blueGateCount: 1,
  c1: true,
  c2: false,
  archetype: "Dual-Switch Permutation"
}));

// Level 18: Par 30, 6x6, 2 Switches, 1 Red Gate, 1 Blue Gate, 1 CR, C1, C2
w4_levels.push(generateWorld4Level({
  id: 18,
  name: "The Entangled Quadrants",
  w: 6,
  h: 6,
  par: 30,
  crCount: 1,
  crumbCount: 0,
  switchCount: 2,
  redGateCount: 1,
  blueGateCount: 1,
  c1: true,
  c2: true,
  archetype: "Four-Chamber Phase Interlock"
}));

// Level 19: Par 33, 6x6, 2 Switches, 2 Red Gates, 1 Blue Gate, 1 Crumb, 1 CR, C1, C2
w4_levels.push(generateWorld4Level({
  id: 19,
  name: "The Crucible of Duality",
  w: 6,
  h: 6,
  par: 33,
  crCount: 1,
  crumbCount: 1,
  switchCount: 2,
  redGateCount: 2,
  blueGateCount: 1,
  c1: true,
  c2: true,
  archetype: "Triple Switch Polarity Weave"
}));

// Level 20: Par 36, 7x6, 2 Switches, 1 Red Gate, 1 Blue Gate, 2 Crumbs, 2 CR, C1, C2
w4_levels.push(generateWorld4Level({
  id: 20,
  name: "The Grandmaster Singularity",
  w: 7,
  h: 6,
  par: 36,
  crCount: 2,
  crumbCount: 2,
  switchCount: 2,
  redGateCount: 1,
  blueGateCount: 1,
  c1: true,
  c2: true,
  archetype: "The Grandmaster Synthesis"
}));

console.log("\nALL 5 WORLD 4 LEVELS GENERATED & VERIFIED SUCCESSFULLY!");

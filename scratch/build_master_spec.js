const fs = require('fs');
const path = require('path');
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

function generateWorld3Level({ id, name, w, h, par, crCount, crumbCount, c1, c2, archetype, spawn = [0, 0] }) {
  const res = searchOpenPath({ w, h, par, crCount, spawn });
  if (!res) throw new Error(`Failed path for L${id}`);
  const pathCoords = res.path;
  const crCoords = res.crCoords;
  const crSet = new Set(crCoords.map(c => `${c[0]},${c[1]}`));

  const availableIndices = [];
  for (let i = 1; i < pathCoords.length - 1; i++) {
    const pt = pathCoords[i];
    if (!crSet.has(`${pt[0]},${pt[1]}`)) availableIndices.push(i);
  }

  let c1Coord = null;
  let c2Coord = null;
  const crumbCoords = [];

  if (c1) {
    const idx = availableIndices[Math.floor(availableIndices.length * 0.2)];
    c1Coord = pathCoords[idx];
  }
  if (c2) {
    const idx = availableIndices[Math.floor(availableIndices.length * 0.7)];
    c2Coord = pathCoords[idx];
  }
  for (let i = 0; i < crumbCount; i++) {
    const frac = (i + 1) / (crumbCount + 1);
    const idx = availableIndices[Math.floor(availableIndices.length * frac)];
    const pt = pathCoords[idx];
    if ((!c1Coord || pt[0] !== c1Coord[0] || pt[1] !== c1Coord[1]) &&
        (!c2Coord || pt[0] !== c2Coord[0] || pt[1] !== c2Coord[1]) &&
        !crumbCoords.some(c => c[0] === pt[0] && c[1] === pt[1])) {
      crumbCoords.push(pt);
    }
  }

  const lvl = buildLevelFromPath({
    id, world: 3, name, w, h, archetype,
    pathCoords, crCoords, crumbCoords, c1Coord, c2Coord
  });
  lvl.branching_factor = Number(calculateTopologicalBranchingFactor(lvl).toFixed(1));
  return lvl;
}

function generateWorld4Level({
  id, name, w, h, par, crCount = 1, crumbCount = 0,
  switchCount = 1, redGateCount = 1, blueGateCount = 1,
  c1 = true, c2 = false, archetype, spawn = [0, 0]
}) {
  const res = searchOpenPath({ w, h, par, crCount, spawn });
  if (!res) throw new Error(`Failed path for L${id}`);
  const pathCoords = res.path;
  const crCoords = res.crCoords;
  const crSet = new Set(crCoords.map(c => `${c[0]},${c[1]}`));

  const availableIndices = [];
  for (let i = 1; i < pathCoords.length - 1; i++) {
    const pt = pathCoords[i];
    if (!crSet.has(`${pt[0]},${pt[1]}`)) availableIndices.push(i);
  }

  const switchCoords = [];
  const redGateCoords = [];
  const blueGateCoords = [];
  const crumbCoords = [];
  let c1Coord = null;
  let c2Coord = null;

  if (switchCount === 1) {
    const redGateIdx = availableIndices[Math.floor(availableIndices.length * 0.18)];
    const switchIdx = availableIndices[Math.floor(availableIndices.length * 0.4)];
    const blueGateIdx = availableIndices[Math.floor(availableIndices.length * 0.62)];

    redGateCoords.push(pathCoords[redGateIdx]);
    switchCoords.push(pathCoords[switchIdx]);
    blueGateCoords.push(pathCoords[blueGateIdx]);

    if (c1) {
      const c1Idx = availableIndices[Math.floor(availableIndices.length * 0.5)];
      c1Coord = pathCoords[c1Idx];
    }
    if (c2) {
      const c2Idx = availableIndices[Math.floor(availableIndices.length * 0.8)];
      c2Coord = pathCoords[c2Idx];
    }
    if (crumbCount > 0) {
      const crIdx = availableIndices[Math.floor(availableIndices.length * 0.85)];
      crumbCoords.push(pathCoords[crIdx]);
    }
  } else {
    const redGate1Idx = availableIndices[Math.floor(availableIndices.length * 0.15)];
    const switch1Idx = availableIndices[Math.floor(availableIndices.length * 0.32)];
    const blueGateIdx = availableIndices[Math.floor(availableIndices.length * 0.48)];
    const switch2Idx = availableIndices[Math.floor(availableIndices.length * 0.65)];

    redGateCoords.push(pathCoords[redGate1Idx]);
    switchCoords.push(pathCoords[switch1Idx]);
    blueGateCoords.push(pathCoords[blueGateIdx]);
    switchCoords.push(pathCoords[switch2Idx]);

    if (redGateCount === 2) {
      const redGate2Idx = availableIndices[Math.floor(availableIndices.length * 0.78)];
      redGateCoords.push(pathCoords[redGate2Idx]);
    }

    if (c1) {
      const c1Idx = availableIndices[Math.floor(availableIndices.length * 0.25)];
      c1Coord = pathCoords[c1Idx];
    }
    if (c2) {
      const c2Idx = availableIndices[Math.floor(availableIndices.length * 0.72)];
      c2Coord = pathCoords[c2Idx];
    }
    for (let i = 0; i < crumbCount; i++) {
      const frac = 0.82 + i * 0.08;
      const crIdx = availableIndices[Math.min(availableIndices.length - 1, Math.floor(availableIndices.length * frac))];
      crumbCoords.push(pathCoords[crIdx]);
    }
  }

  const lvl = buildLevelFromPath({
    id, world: 4, name, w, h, archetype,
    pathCoords, crCoords, crumbCoords, c1Coord, c2Coord,
    switchCoords, redGateCoords, blueGateCoords,
    initialPhase: 'RED'
  });
  lvl.branching_factor = Number(calculateTopologicalBranchingFactor(lvl).toFixed(1));
  return lvl;
}

const levels = [
  generateWorld3Level({
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
  }),
  generateWorld3Level({
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
  }),
  generateWorld3Level({
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
  }),
  generateWorld3Level({
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
  }),
  generateWorld3Level({
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
  }),
  generateWorld4Level({
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
  }),
  generateWorld4Level({
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
  }),
  generateWorld4Level({
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
  }),
  generateWorld4Level({
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
  }),
  generateWorld4Level({
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
  })
];

// Clean JSON format: ensure exact fields
const cleanLevels = levels.map(l => ({
  id: l.id,
  world: l.world,
  name: l.name,
  w: l.w,
  h: l.h,
  budget: 0,
  par: l.par,
  spawn: l.spawn,
  goal: l.goal,
  checkpoints: l.checkpoints,
  grid: l.grid,
  trace: l.trace,
  branching_factor: l.branching_factor,
  archetype: l.archetype,
  ...(l.initialPhase ? { initialPhase: l.initialPhase } : {})
}));

const specPath = path.join(__dirname, 'levels11_20_spec.json');
fs.writeFileSync(specPath, JSON.stringify(cleanLevels, null, 2), 'utf8');
console.log(`Wrote 10 redesigned levels to ${specPath}`);

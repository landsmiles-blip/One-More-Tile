const { searchPath, buildLevel, verifySolution } = require('./build_take3_levels.js');

console.log("Testing World 4 Level generation...");

// Test Level 16: 6x5, Par 28, 1 CR, 1 Switch, 1 Red Gate, 1 Blue Gate, C1
console.log("Searching Level 16 (6x5, Par 28, 1 CR)...");
const res16 = searchPath({ w: 6, h: 5, par: 28, crCount: 1, spawn: [0, 0] });
if (!res16) throw new Error("Failed Level 16 path");

const crSet16 = new Set(res16.crCoords.map(c => `${c[0]},${c[1]}`));
const avail16 = [];
for (let i = 1; i < res16.path.length - 1; i++) {
  const pt = res16.path[i];
  if (!crSet16.has(`${pt[0]},${pt[1]}`)) avail16.push(i);
}

// Sequence:
// Blue gate (phase RED) -> C1 -> Switch 1 (flips to BLUE) -> Red gate (phase BLUE) -> Goal
const blueGate16 = res16.path[avail16[2]];
const c1_16 = res16.path[avail16[Math.floor(avail16.length * 0.35)]];
const sw16 = res16.path[avail16[Math.floor(avail16.length * 0.6)]];
const redGate16 = res16.path[avail16[avail16.length - 2]];

const l16 = buildLevel({
  id: 16, world: 4, name: "The Polarity Threshold",
  w: 6, h: 5, par: 28,
  pathCoords: res16.path,
  crCoords: res16.crCoords,
  switchCoords: [sw16],
  redGateCoords: [redGate16],
  blueGateCoords: [blueGate16],
  c1Coord: c1_16,
  initialPhase: "RED"
});
console.log("Level 16 PASSED! Par:", l16.par);

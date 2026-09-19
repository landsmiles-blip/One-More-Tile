const { searchPsychPath, buildPsychLevel } = require('./synthesize_psych_levels.js');

console.log("Searching for Level 20: The Grandmaster Singularity (w:7, h:6, par:30, 2 CR)...");
const res20 = searchPsychPath({
  w: 7, h: 6, par: 30, crCount: 2,
  spawn: [0, 0]
});

if (res20) {
  console.log("Found path for L20:", res20.path);
  console.log("Crossroads at:", res20.crCoords);

  // Identify cr visits
  const crSet = new Set(res20.crCoords.map(c => `${c[0]},${c[1]}`));
  const availableIndices = [];
  for (let i = 1; i < res20.path.length - 1; i++) {
    const pt = res20.path[i];
    if (!crSet.has(`${pt[0]},${pt[1]}`)) {
      availableIndices.push(i);
    }
  }

  // Sequence:
  // 1. Blue gate (open when RED)
  // 2. Crumbling bridge 1
  // 3. Checkpoint 1
  // 4. Switch 1 (flips to BLUE)
  // 5. Red gate (open when BLUE)
  // 6. Checkpoint 2
  // 7. Switch 2 (flips to RED)
  // 8. Crumbling bridge 2 (evacuation bridge before goal)
  // 9. Goal

  // Indices from available:
  const idxBlue = availableIndices[1];
  const idxCrumb1 = availableIndices[3];
  const idxC1 = availableIndices[6];
  const idxSw1 = availableIndices[9];
  const idxRed = availableIndices[12];
  const idxC2 = availableIndices[15];
  const idxSw2 = availableIndices[18];
  const idxCrumb2 = availableIndices[availableIndices.length - 1];

  const blueGate = res20.path[idxBlue];
  const crumb1 = res20.path[idxCrumb1];
  const c1 = res20.path[idxC1];
  const sw1 = res20.path[idxSw1];
  const redGate = res20.path[idxRed];
  const c2 = res20.path[idxC2];
  const sw2 = res20.path[idxSw2];
  const crumb2 = res20.path[idxCrumb2];

  const l20 = buildPsychLevel({
    id: 20,
    world: 4,
    name: "The Grandmaster Singularity",
    archetype: "The Supreme Masterpiece (Transcendence & Synthesis)",
    w: 7, h: 6, par: 30,
    pathCoords: res20.path,
    crCoords: res20.crCoords,
    crumbCoords: [crumb1, crumb2],
    switchCoords: [sw1, sw2],
    redGateCoords: [redGate],
    blueGateCoords: [blueGate],
    c1Coord: c1,
    c2Coord: c2,
    initialPhase: "RED"
  });
  console.log("Level 20 PASSED verification!");
  console.log("Grid:");
  console.log(l20.grid);
  console.log("Trace:", l20.trace);
} else {
  console.log("No path found for Level 20");
}

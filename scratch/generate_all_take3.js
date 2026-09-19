const fs = require('fs');
const path = require('path');
const { searchPath, buildLevel, verifySolution, C_WALL, C_VOID } = require('./build_take3_levels.js');

console.log("================================================================================");
console.log("   ONE MORE TILE — TAKE 3 MASTER GENERATOR (LEVELS 11-20, PARS 25-40)");
console.log("================================================================================\n");

const levels = [];

// Helper to filter non-crossroad indices
function getAvailableIndices(path, crCoords) {
  const crSet = new Set(crCoords.map(c => `${c[0]},${c[1]}`));
  const avail = [];
  for (let i = 1; i < path.length - 1; i++) {
    const pt = path[i];
    if (!crSet.has(`${pt[0]},${pt[1]}`)) avail.push(i);
  }
  return avail;
}

// ----------------------------------------------------------------------------
// Level 11: "The Basalt Crossing" (6x5, Par 25, 1 CR, 1 Crumb, C1)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 11: The Basalt Crossing (6x5, Par 25)...");
const res11 = searchPath({ w: 6, h: 5, par: 25, crCount: 1, spawn: [0, 0] });
if (!res11) throw new Error("Failed Level 11");
const avail11 = getAvailableIndices(res11.path, res11.crCoords);
const l11 = buildLevel({
  id: 11, world: 3, name: "The Basalt Crossing",
  w: 6, h: 5, par: 25,
  pathCoords: res11.path,
  crCoords: res11.crCoords,
  crumbCoords: [res11.path[avail11[3]]],
  c1Coord: res11.path[avail11[avail11.length - 3]]
});
levels.push(l11);
console.log("  Level 11 PASSED! Par:", l11.par);

// ----------------------------------------------------------------------------
// Level 12: "The Dual Chasm" (6x5, Par 27, 1 CR, 2 Crumbs, C1)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 12: The Dual Chasm (6x5, Par 27)...");
const res12 = searchPath({ w: 6, h: 5, par: 27, crCount: 1, spawn: [0, 0] });
if (!res12) throw new Error("Failed Level 12");
const avail12 = getAvailableIndices(res12.path, res12.crCoords);
const l12 = buildLevel({
  id: 12, world: 3, name: "The Dual Chasm",
  w: 6, h: 5, par: 27,
  pathCoords: res12.path,
  crCoords: res12.crCoords,
  crumbCoords: [res12.path[avail12[2]], res12.path[avail12[avail12.length - 2]]],
  c1Coord: res12.path[avail12[Math.floor(avail12.length * 0.5)]]
});
levels.push(l12);
console.log("  Level 12 PASSED! Par:", l12.par);

// ----------------------------------------------------------------------------
// Level 13: "The Cloverleaf Fracture" (6x6, Par 29, 2 CR, 1 Crumb, C1, C2)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 13: The Cloverleaf Fracture (6x6, Par 29)...");
const res13 = searchPath({ w: 6, h: 6, par: 29, crCount: 2, spawn: [0, 0] });
if (!res13) throw new Error("Failed Level 13");
const avail13 = getAvailableIndices(res13.path, res13.crCoords);
const l13 = buildLevel({
  id: 13, world: 3, name: "The Cloverleaf Fracture",
  w: 6, h: 6, par: 29,
  pathCoords: res13.path,
  crCoords: res13.crCoords,
  crumbCoords: [res13.path[avail13[Math.floor(avail13.length * 0.45)]]],
  c1Coord: res13.path[avail13[Math.floor(avail13.length * 0.2)]],
  c2Coord: res13.path[avail13[Math.floor(avail13.length * 0.75)]]
});
levels.push(l13);
console.log("  Level 13 PASSED! Par:", l13.par);

// ----------------------------------------------------------------------------
// Level 14: "The Tri-Chamber Citadel" (6x6, Par 31, 2 CR, 2 Crumbs, C1, C2)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 14: The Tri-Chamber Citadel (6x6, Par 31)...");
const res14 = searchPath({ w: 6, h: 6, par: 31, crCount: 2, spawn: [0, 0] });
if (!res14) throw new Error("Failed Level 14");
const avail14 = getAvailableIndices(res14.path, res14.crCoords);
const l14 = buildLevel({
  id: 14, world: 3, name: "The Tri-Chamber Citadel",
  w: 6, h: 6, par: 31,
  pathCoords: res14.path,
  crCoords: res14.crCoords,
  crumbCoords: [res14.path[avail14[2]], res14.path[avail14[avail14.length - 2]]],
  c1Coord: res14.path[avail14[Math.floor(avail14.length * 0.3)]],
  c2Coord: res14.path[avail14[Math.floor(avail14.length * 0.7)]]
});
levels.push(l14);
console.log("  Level 14 PASSED! Par:", l14.par);

// ----------------------------------------------------------------------------
// Level 15: "The Shattered Colosseum" (6x6, Par 33, 2 CR, 2 Crumbs, C1, C2)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 15: The Shattered Colosseum (6x6, Par 33)...");
const res15 = searchPath({ w: 6, h: 6, par: 33, crCount: 2, spawn: [0, 0] });
if (!res15) throw new Error("Failed Level 15");
const avail15 = getAvailableIndices(res15.path, res15.crCoords);
const l15 = buildLevel({
  id: 15, world: 3, name: "The Shattered Colosseum",
  w: 6, h: 6, par: 33,
  pathCoords: res15.path,
  crCoords: res15.crCoords,
  crumbCoords: [res15.path[avail15[3]], res15.path[avail15[avail15.length - 3]]],
  c1Coord: res15.path[avail15[Math.floor(avail15.length * 0.35)]],
  c2Coord: res15.path[avail15[Math.floor(avail15.length * 0.75)]]
});
levels.push(l15);
console.log("  Level 15 PASSED! Par:", l15.par);

// ----------------------------------------------------------------------------
// Level 16: "The Polarity Threshold" (6x5, Par 28, 1 CR, Switch, Red/Blue Gate, C1)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 16: The Polarity Threshold (6x5, Par 28)...");
const res16 = searchPath({ w: 6, h: 5, par: 28, crCount: 1, spawn: [0, 0] });
if (!res16) throw new Error("Failed Level 16");
const avail16 = getAvailableIndices(res16.path, res16.crCoords);
const blueGate16 = res16.path[avail16[2]]; // open when RED
const c1_16 = res16.path[avail16[Math.floor(avail16.length * 0.35)]];
const sw16 = res16.path[avail16[Math.floor(avail16.length * 0.6)]]; // flips to BLUE
const redGate16 = res16.path[avail16[avail16.length - 2]]; // open when BLUE
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
levels.push(l16);
console.log("  Level 16 PASSED! Par:", l16.par);

// ----------------------------------------------------------------------------
// Level 17: "The Alternating Vault" (6x6, Par 30, 1 CR, 1 Crumb, Switch, Red/Blue Gate, C1)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 17: The Alternating Vault (6x6, Par 30)...");
const res17 = searchPath({ w: 6, h: 6, par: 30, crCount: 1, spawn: [0, 0] });
if (!res17) throw new Error("Failed Level 17");
const avail17 = getAvailableIndices(res17.path, res17.crCoords);
const blueGate17 = res17.path[avail17[1]]; // open when RED
const crumb17 = res17.path[avail17[4]];
const c1_17 = res17.path[avail17[Math.floor(avail17.length * 0.4)]];
const sw17 = res17.path[avail17[Math.floor(avail17.length * 0.65)]]; // flips to BLUE
const redGate17 = res17.path[avail17[avail17.length - 2]]; // open when BLUE
const l17 = buildLevel({
  id: 17, world: 4, name: "The Alternating Vault",
  w: 6, h: 6, par: 30,
  pathCoords: res17.path,
  crCoords: res17.crCoords,
  crumbCoords: [crumb17],
  switchCoords: [sw17],
  redGateCoords: [redGate17],
  blueGateCoords: [blueGate17],
  c1Coord: c1_17,
  initialPhase: "RED"
});
levels.push(l17);
console.log("  Level 17 PASSED! Par:", l17.par);

// ----------------------------------------------------------------------------
// Level 18: "The Entangled Bastion" (6x6, Par 33, 2 CR, 2 Switches, Red/Blue Gate, C1, C2)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 18: The Entangled Bastion (6x6, Par 33)...");
const res18 = searchPath({ w: 6, h: 6, par: 33, crCount: 2, spawn: [0, 0] });
if (!res18) throw new Error("Failed Level 18");
const avail18 = getAvailableIndices(res18.path, res18.crCoords);
// Sequence:
// Blue gate (phase RED) -> C1 -> Switch 1 (flips to BLUE) -> Red gate (phase BLUE) -> C2 -> Switch 2 (flips to RED) -> Goal
const blueGate18 = res18.path[avail18[1]];
const c1_18 = res18.path[avail18[Math.floor(avail18.length * 0.25)]];
const sw18_1 = res18.path[avail18[Math.floor(avail18.length * 0.45)]];
const redGate18 = res18.path[avail18[Math.floor(avail18.length * 0.6)]];
const c2_18 = res18.path[avail18[Math.floor(avail18.length * 0.72)]];
const sw18_2 = res18.path[avail18[avail18.length - 2]];
const l18 = buildLevel({
  id: 18, world: 4, name: "The Entangled Bastion",
  w: 6, h: 6, par: 33,
  pathCoords: res18.path,
  crCoords: res18.crCoords,
  switchCoords: [sw18_1, sw18_2],
  redGateCoords: [redGate18],
  blueGateCoords: [blueGate18],
  c1Coord: c1_18,
  c2Coord: c2_18,
  initialPhase: "RED"
});
levels.push(l18);
console.log("  Level 18 PASSED! Par:", l18.par);

// ----------------------------------------------------------------------------
// Level 19: "The Crucible of Duality" (7x6, Par 36, 2 CR, 1 Crumb, 2 Switches, Red/Blue Gate, C1, C2)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 19: The Crucible of Duality (7x6, Par 36)...");
const res19 = searchPath({ w: 7, h: 6, par: 36, crCount: 2, spawn: [0, 0] });
if (!res19) throw new Error("Failed Level 19");
const avail19 = getAvailableIndices(res19.path, res19.crCoords);
const blueGate19 = res19.path[avail19[1]];
const crumb19 = res19.path[avail19[3]];
const c1_19 = res19.path[avail19[Math.floor(avail19.length * 0.3)]];
const sw19_1 = res19.path[avail19[Math.floor(avail19.length * 0.5)]];
const redGate19 = res19.path[avail19[Math.floor(avail19.length * 0.65)]];
const c2_19 = res19.path[avail19[Math.floor(avail19.length * 0.8)]];
const sw19_2 = res19.path[avail19[avail19.length - 2]];
const l19 = buildLevel({
  id: 19, world: 4, name: "The Crucible of Duality",
  w: 7, h: 6, par: 36,
  pathCoords: res19.path,
  crCoords: res19.crCoords,
  crumbCoords: [crumb19],
  switchCoords: [sw19_1, sw19_2],
  redGateCoords: [redGate19],
  blueGateCoords: [blueGate19],
  c1Coord: c1_19,
  c2Coord: c2_19,
  initialPhase: "RED"
});
levels.push(l19);
console.log("  Level 19 PASSED! Par:", l19.par);

// ----------------------------------------------------------------------------
// Level 20: "The Grandmaster Singularity" (7x6, Par 40, 2 CR, 2 Crumbs, 2 Switches, Dual Gates, C1, C2)
// ----------------------------------------------------------------------------
console.log("Synthesizing Level 20: The Grandmaster Singularity (7x6, Par 40)...");
const res20 = searchPath({ w: 7, h: 6, par: 40, crCount: 2, spawn: [0, 0] });
if (!res20) throw new Error("Failed Level 20");
const avail20 = getAvailableIndices(res20.path, res20.crCoords);
// Sequence:
// Blue gate 1 (phase RED) -> Crumb 1 -> C1 -> Switch 1 (flips to BLUE) -> Red gate 1 (phase BLUE) -> C2 -> Switch 2 (flips to RED) -> Crumb 2 (evacuation) -> Goal
const blueGate20 = res20.path[avail20[1]];
const crumb20_1 = res20.path[avail20[3]];
const c1_20 = res20.path[avail20[Math.floor(avail20.length * 0.28)]];
const sw20_1 = res20.path[avail20[Math.floor(avail20.length * 0.45)]];
const redGate20 = res20.path[avail20[Math.floor(avail20.length * 0.6)]];
const c2_20 = res20.path[avail20[Math.floor(avail20.length * 0.75)]];
const sw20_2 = res20.path[avail20[Math.floor(avail20.length * 0.88)]];
const crumb20_2 = res20.path[avail20[avail20.length - 2]];
const l20 = buildLevel({
  id: 20, world: 4, name: "The Grandmaster Singularity",
  w: 7, h: 6, par: 40,
  pathCoords: res20.path,
  crCoords: res20.crCoords,
  crumbCoords: [crumb20_1, crumb20_2],
  switchCoords: [sw20_1, sw20_2],
  redGateCoords: [redGate20],
  blueGateCoords: [blueGate20],
  c1Coord: c1_20,
  c2Coord: c2_20,
  initialPhase: "RED"
});
levels.push(l20);
console.log("  Level 20 PASSED! Par:", l20.par);

// Calculate topological branching factor for each level
function calculateTopologicalBranchingFactor(lvl) {
  let totalDegree = 0;
  let traversableTiles = 0;
  const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === C_WALL || cell === C_VOID) continue;
      traversableTiles++;
      for (const d of dirs) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx >= 0 && nx < lvl.w && ny >= 0 && ny < lvl.h) {
          const nCell = lvl.grid[ny][nx];
          if (nCell !== C_WALL && nCell !== C_VOID) {
            totalDegree++;
          }
        }
      }
    }
  }
  return traversableTiles > 0 ? (totalDegree / traversableTiles) : 0;
}

levels.forEach(lvl => {
  lvl.branching_factor = Number(calculateTopologicalBranchingFactor(lvl).toFixed(1));
});

// Output JSON file
const outPath = path.join(__dirname, 'levels11_20_take3_spec.json');
fs.writeFileSync(outPath, JSON.stringify(levels, null, 2), 'utf8');
console.log(`\nSuccessfully saved ${levels.length} Take 3 levels to ${outPath}`);

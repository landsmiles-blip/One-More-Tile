const { searchPath, buildLevel, verifySolution } = require('./build_take3_levels.js');

console.log("Testing generation of Take 3 Levels...");

// Test Level 11: 6x5, Par 25, 1 CR, 1 Crumb, C1
console.log("Searching Level 11 (6x5, Par 25, 1 CR)...");
const res11 = searchPath({ w: 6, h: 5, par: 25, crCount: 1, spawn: [0, 0] });
if (!res11) throw new Error("Failed Level 11 path");

const crSet11 = new Set(res11.crCoords.map(c => `${c[0]},${c[1]}`));
const avail11 = [];
for (let i = 1; i < res11.path.length - 1; i++) {
  const pt = res11.path[i];
  if (!crSet11.has(`${pt[0]},${pt[1]}`)) avail11.push(i);
}

const crumb11 = res11.path[avail11[4]];
const c1_11 = res11.path[avail11[avail11.length - 3]];

const l11 = buildLevel({
  id: 11, world: 3, name: "The Basalt Crossing",
  w: 6, h: 5, par: 25,
  pathCoords: res11.path,
  crCoords: res11.crCoords,
  crumbCoords: [crumb11],
  c1Coord: c1_11
});
console.log("Level 11 PASSED! Par:", l11.par);

// Test Level 12: 6x5, Par 27, 1 CR, 2 Crumbs, C1
console.log("Searching Level 12 (6x5, Par 27, 1 CR)...");
const res12 = searchPath({ w: 6, h: 5, par: 27, crCount: 1, spawn: [0, 0] });
if (!res12) throw new Error("Failed Level 12 path");

const crSet12 = new Set(res12.crCoords.map(c => `${c[0]},${c[1]}`));
const avail12 = [];
for (let i = 1; i < res12.path.length - 1; i++) {
  const pt = res12.path[i];
  if (!crSet12.has(`${pt[0]},${pt[1]}`)) avail12.push(i);
}

const crumb12_1 = res12.path[avail12[2]];
const c1_12 = res12.path[avail12[Math.floor(avail12.length * 0.5)]];
const crumb12_2 = res12.path[avail12[avail12.length - 2]];

const l12 = buildLevel({
  id: 12, world: 3, name: "The Dual Chasm",
  w: 6, h: 5, par: 27,
  pathCoords: res12.path,
  crCoords: res12.crCoords,
  crumbCoords: [crumb12_1, crumb12_2],
  c1Coord: c1_12
});
console.log("Level 12 PASSED! Par:", l12.par);

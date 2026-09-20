const fs = require('fs');
const { solveLevel, C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_CROSSROAD } = require('./generate_open_arena_levels');

function makeGrid(w, h, fill = C_UNTOUCHED) {
  const g = [];
  for (let y = 0; y < h; y++) {
    g[y] = [];
    for (let x = 0; x < w; x++) {
      g[y][x] = fill;
    }
  }
  return g;
}

const levels = [];

// =========================================================================
// LEVEL 11: "The Obsidian Weave" (World 3) - 6x4 Open Arena, Par 25
// =========================================================================
function makeLevel11() {
  const w = 6, h = 4;
  const g = makeGrid(w, h);
  g[1][1] = C_CROSSROAD;
  g[2][1] = C_CROSSROAD;
  g[0][5] = C_CHECKPOINT_1;
  g[1][0] = C_GOAL;

  const lvl = {
    id: 11, world: 3, name: "The Obsidian Weave",
    w, h, budget: 0, par: 25,
    spawn: { x: 0, y: 0 }, goal: { x: 0, y: 1 },
    checkpoints: [{ id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }],
    grid: g
  };
  const res = solveLevel(lvl);
  if (!res.trace) throw new Error("Level 11 failed to solve");
  lvl.trace = res.trace;
  return lvl;
}
levels.push(makeLevel11());
console.log("Level 11 certified: Par", levels[0].par);

// =========================================================================
// LEVEL 12: "The Double Helix" (World 3) - 6x5 Octagonal Arena, Par 27
// =========================================================================
function makeLevel12() {
  const w = 6, h = 5;
  const g = makeGrid(w, h);
  g[0][0] = C_VOID; g[0][5] = C_VOID;
  g[4][0] = C_VOID; g[4][5] = C_VOID;
  g[2][2] = C_CROSSROAD;
  g[2][3] = C_CROSSROAD;
  g[0][4] = C_CHECKPOINT_1;
  g[4][1] = C_CHECKPOINT_2;
  g[4][4] = C_GOAL;

  const lvl = {
    id: 12, world: 3, name: "The Double Helix",
    w, h, budget: 0, par: 27,
    spawn: { x: 1, y: 0 }, goal: { x: 4, y: 4 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 1, y: 4, cellType: C_CHECKPOINT_2 }
    ],
    grid: g
  };
  const res = solveLevel(lvl);
  if (!res.trace) throw new Error("Level 12 failed to solve");
  lvl.trace = res.trace;
  return lvl;
}
levels.push(makeLevel12());
console.log("Level 12 certified: Par", levels[1].par);

// =========================================================================
// LEVEL 13: "The Labyrinthine Cross" (World 3) - 6x5 Arena, Par 29
// =========================================================================
function findLevel13() {
  const w = 6, h = 5;
  for (let c1x = 1; c1x <= 4; c1x++) {
    for (let c1y = 1; c1y <= 3; c1y++) {
      for (let c2x = 1; c2x <= 4; c2x++) {
        for (let c2y = 1; c2y <= 3; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          const g = makeGrid(w, h);
          g[0][0] = C_VOID; g[4][5] = C_VOID;
          g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
          g[0][5] = C_CHECKPOINT_1; g[4][0] = C_CHECKPOINT_2;
          g[4][4] = C_GOAL;

          const lvl = {
            id: 13, world: 3, name: "The Labyrinthine Cross",
            w, h, budget: 0, par: 29,
            spawn: { x: 1, y: 0 }, goal: { x: 4, y: 4 },
            checkpoints: [
              { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
              { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
            ],
            grid: g
          };
          const res = solveLevel(lvl);
          if (res.trace && res.totalMoves === 29) {
            lvl.trace = res.trace;
            return lvl;
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 13");
}
levels.push(findLevel13());
console.log("Level 13 certified: Par", levels[2].par);

// =========================================================================
// LEVEL 14: "The Tri-Chamber Nexus" (World 3) - 6x5 Full Open Arena, Par 31
// =========================================================================
function findLevel14() {
  const w = 6, h = 5;
  const spawn = { x: 0, y: 0 };
  for (let c1x = 1; c1x <= 4; c1x++) {
    for (let c1y = 1; c1y <= 3; c1y++) {
      for (let c2x = 1; c2x <= 4; c2x++) {
        for (let c2y = 1; c2y <= 3; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          for (let gy = 1; gy <= 4; gy++) {
            for (let gx = 0; gx <= 5; gx++) {
              if ((gx + gy) % 2 === 0) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][5] = C_CHECKPOINT_1; g[4][0] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 14, world: 3, name: "The Tri-Chamber Nexus",
                w, h, budget: 0, par: 31,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 31) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 14");
}
levels.push(findLevel14());
console.log("Level 14 certified: Par", levels[3].par);

// =========================================================================
// LEVEL 15: "The Colosseum of Knots" (World 3 Graduation) - 6x6 Octagonal Arena, Par 33
// =========================================================================
function findLevel15() {
  const w = 6, h = 6;
  const spawn = { x: 1, y: 0 };
  for (let c1x = 1; c1x <= 4; c1x++) {
    for (let c1y = 1; c1y <= 4; c1y++) {
      for (let c2x = 1; c2x <= 4; c2x++) {
        for (let c2y = 1; c2y <= 4; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          for (let gy = 1; gy <= 4; gy++) {
            for (let gx = 1; gx <= 4; gx++) {
              if ((gx + gy) % 2 !== 0) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              g[0][0] = C_VOID; g[0][5] = C_VOID;
              g[5][0] = C_VOID; g[5][5] = C_VOID;
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][4] = C_CHECKPOINT_1; g[5][1] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 15, world: 3, name: "The Colosseum of Knots",
                w, h, budget: 0, par: 33,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 1, y: 5, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 33) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 15");
}
levels.push(findLevel15());
console.log("Level 15 certified: Par", levels[4].par);

// =========================================================================
// LEVEL 16: "The Polarity Nexus" (World 4 Initiation) - 6x6 Arena (2 central pillars), Par 35
// 36 - 2 pillars = 34 cells. 2 crossroads -> 33 + 2 = 35 moves!
// 100% open and playable! Zero gate lockouts!
// =========================================================================
function findLevel16() {
  const w = 6, h = 6;
  const spawn = { x: 0, y: 0 };
  const pillars = [{ x: 2, y: 2 }, { x: 3, y: 3 }];
  for (let c1x = 1; c1x <= 4; c1x++) {
    for (let c1y = 1; c1y <= 4; c1y++) {
      if (pillars.some(p => p.x === c1x && p.y === c1y)) continue;
      for (let c2x = 1; c2x <= 4; c2x++) {
        for (let c2y = 1; c2y <= 4; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          if (pillars.some(p => p.x === c2x && p.y === c2y)) continue;

          for (let gy = 1; gy <= 5; gy++) {
            for (let gx = 0; gx <= 5; gx++) {
              // 35 moves (odd) -> (gx+gy) odd
              if ((gx + gy) % 2 === 0) continue;
              if (pillars.some(p => p.x === gx && p.y === gy)) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              pillars.forEach(p => g[p.y][p.x] = C_WALL);
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][5] = C_CHECKPOINT_1; g[5][0] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 16, world: 4, name: "The Polarity Nexus",
                w, h, budget: 0, par: 35,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 0, y: 5, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 35) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 16");
}
levels.push(findLevel16());
console.log("Level 16 certified: Par", levels[5].par);

// =========================================================================
// LEVEL 17: "The Alternating Crucible" (World 4) - 6x6 Full Open Arena, Par 37
// 36 cells -> 35 moves + 2 crossroads = 37 moves!
// =========================================================================
function findLevel17() {
  const w = 6, h = 6;
  const spawn = { x: 0, y: 0 };
  for (let c1x = 1; c1x <= 4; c1x++) {
    for (let c1y = 1; c1y <= 4; c1y++) {
      for (let c2x = 1; c2x <= 4; c2x++) {
        for (let c2y = 1; c2y <= 4; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          for (let gy = 1; gy <= 5; gy++) {
            for (let gx = 0; gx <= 5; gx++) {
              if ((gx + gy) % 2 === 0) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][5] = C_CHECKPOINT_1; g[5][0] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 17, world: 4, name: "The Alternating Crucible",
                w, h, budget: 0, par: 37,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 0, y: 5, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 37) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 17");
}
levels.push(findLevel17());
console.log("Level 17 certified: Par", levels[6].par);

// =========================================================================
// LEVEL 18: "The Entangled Bastion" (World 4) - 7x6 Octagonal Arena (4 void corners), Par 39
// 42 - 4 voids = 38 cells. 2 crossroads -> 37 + 2 = 39 moves!
// =========================================================================
function findLevel18() {
  const w = 7, h = 6;
  const spawn = { x: 1, y: 0 };
  for (let c1x = 1; c1x <= 5; c1x++) {
    for (let c1y = 1; c1y <= 4; c1y++) {
      for (let c2x = 1; c2x <= 5; c2x++) {
        for (let c2y = 1; c2y <= 4; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          for (let gy = 1; gy <= 5; gy++) {
            for (let gx = 1; gx <= 5; gx++) {
              if ((gx + gy) % 2 !== 0) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              g[0][0] = C_VOID; g[0][6] = C_VOID;
              g[5][0] = C_VOID; g[5][6] = C_VOID;
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][5] = C_CHECKPOINT_1; g[5][1] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 18, world: 4, name: "The Entangled Bastion",
                w, h, budget: 0, par: 39,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 1, y: 5, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 39) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 18");
}
levels.push(findLevel18());
console.log("Level 18 certified: Par", levels[7].par);

// =========================================================================
// LEVEL 19: "The Crucible of Duality" (World 4) - 7x6 Arena (2 void corners), Par 41
// 42 - 2 voids = 40 cells. 2 crossroads -> 39 + 2 = 41 moves!
// =========================================================================
function findLevel19() {
  const w = 7, h = 6;
  const spawn = { x: 1, y: 0 };
  for (let c1x = 1; c1x <= 5; c1x++) {
    for (let c1y = 1; c1y <= 4; c1y++) {
      for (let c2x = 1; c2x <= 5; c2x++) {
        for (let c2y = 1; c2y <= 4; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          for (let gy = 1; gy <= 5; gy++) {
            for (let gx = 0; gx <= 6; gx++) {
              if ((gx + gy) % 2 !== 0) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              g[0][0] = C_VOID; g[5][6] = C_VOID;
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][6] = C_CHECKPOINT_1; g[5][0] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 19, world: 4, name: "The Crucible of Duality",
                w, h, budget: 0, par: 41,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 6, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 0, y: 5, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 41) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 19");
}
levels.push(findLevel19());
console.log("Level 19 certified: Par", levels[8].par);

// =========================================================================
// LEVEL 20: "The Grandmaster Singularity" (World 4 Climax) - 7x6 Full Arena, Par 43
// 42 cells -> 41 moves + 2 crossroads = 43 moves!
// =========================================================================
function findLevel20() {
  const w = 7, h = 6;
  const spawn = { x: 0, y: 0 };
  for (let c1x = 1; c1x <= 5; c1x++) {
    for (let c1y = 1; c1y <= 4; c1y++) {
      for (let c2x = 1; c2x <= 5; c2x++) {
        for (let c2y = 1; c2y <= 4; c2y++) {
          if (c1x === c2x && c1y === c2y) continue;
          for (let gy = 1; gy <= 5; gy++) {
            for (let gx = 0; gx <= 6; gx++) {
              if ((gx + gy) % 2 === 0) continue;
              if ((gx === c1x && gy === c1y) || (gx === c2x && gy === c2y)) continue;

              const g = makeGrid(w, h);
              g[c1y][c1x] = C_CROSSROAD; g[c2y][c2x] = C_CROSSROAD;
              g[0][6] = C_CHECKPOINT_1; g[5][0] = C_CHECKPOINT_2;
              g[gy][gx] = C_GOAL;

              const lvl = {
                id: 20, world: 4, name: "The Grandmaster Singularity",
                w, h, budget: 0, par: 43,
                spawn, goal: { x: gx, y: gy },
                checkpoints: [
                  { id: 1, x: 6, y: 0, cellType: C_CHECKPOINT_1 },
                  { id: 2, x: 0, y: 5, cellType: C_CHECKPOINT_2 }
                ],
                grid: g
              };
              const res = solveLevel(lvl);
              if (res.trace && res.totalMoves === 43) {
                lvl.trace = res.trace;
                return lvl;
              }
            }
          }
        }
      }
    }
  }
  throw new Error("Could not find Level 20");
}
levels.push(findLevel20());
console.log("Level 20 certified: Par", levels[9].par);

fs.writeFileSync('scratch/levels11_20_certified.json', JSON.stringify(levels, null, 2), 'utf8');
console.log("\nALL 10 LEVELS (11 TO 20) CERTIFIED AND SAVED TO scratch/levels11_20_certified.json!");

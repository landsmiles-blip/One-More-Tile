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

// -------------------------------------------------------------
// LEVEL 11: "The Obsidian Weave" (World 3)
// 6x4 Arena, 2 Crossroads, C1. Par: 25.
// -------------------------------------------------------------
function buildLevel11() {
  const w = 6, h = 4;
  const g = makeGrid(w, h);
  // Crossroads at (2,1) and (3,2)
  g[1][2] = C_CROSSROAD;
  g[2][3] = C_CROSSROAD;
  // C1 at (5,0)
  g[0][5] = C_CHECKPOINT_1;
  // Goal at (0,3)
  g[3][0] = C_GOAL;

  const lvl = {
    id: 11,
    world: 3,
    name: "The Obsidian Weave",
    w, h,
    budget: 0,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [{ id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }],
    grid: g
  };
  return lvl;
}

// -------------------------------------------------------------
// LEVEL 12: "The Double Helix" (World 3)
// 6x5 Arena with 4 void corners (octagonal arena), 2 Crossroads, C1, C2. Par: 27.
// Total cells = 30 - 4 voids = 26 cells.
// Par = (26 - 1) + 2 crossroads = 27 moves!
// -------------------------------------------------------------
function buildLevel12() {
  const w = 6, h = 5;
  const g = makeGrid(w, h);
  // Cut corners for open octagonal arena
  g[0][0] = C_VOID; // spawn at (1,0)
  g[0][5] = C_VOID;
  g[4][0] = C_VOID;
  g[4][5] = C_VOID;

  // Crossroads
  g[2][2] = C_CROSSROAD;
  g[2][3] = C_CROSSROAD;

  // C1 at (4,0), C2 at (1,4), Goal at (4,4)
  g[0][4] = C_CHECKPOINT_1;
  g[4][1] = C_CHECKPOINT_2;
  g[4][4] = C_GOAL;

  const lvl = {
    id: 12,
    world: 3,
    name: "The Double Helix",
    w, h,
    budget: 0,
    spawn: { x: 1, y: 0 },
    goal: { x: 4, y: 4 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 1, y: 4, cellType: C_CHECKPOINT_2 }
    ],
    grid: g
  };
  return lvl;
}

// -------------------------------------------------------------
// LEVEL 13: "The Labyrinthine Cross" (World 3)
// 6x5 Arena, 1 void, 2 Crossroads, C1, C2.
// 29 cells -> (28 - 1) + 2 = 29 moves!
// -------------------------------------------------------------
function buildLevel13() {
  const w = 6, h = 5;
  const g = makeGrid(w, h);
  // Center void at (2,2)
  g[2][2] = C_WALL;

  // Crossroads
  g[1][3] = C_CROSSROAD;
  g[3][2] = C_CROSSROAD;

  // C1 at (5,0), C2 at (0,4), Goal at (5,4)
  g[0][5] = C_CHECKPOINT_1;
  g[4][0] = C_CHECKPOINT_2;
  g[4][5] = C_GOAL;

  const lvl = {
    id: 13,
    world: 3,
    name: "The Labyrinthine Cross",
    w, h,
    budget: 0,
    spawn: { x: 0, y: 0 },
    goal: { x: 5, y: 4 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
    ],
    grid: g
  };
  return lvl;
}

console.log("Testing L11, L12, L13...");
[buildLevel11, buildLevel12, buildLevel13].forEach((fn, idx) => {
  const lvl = fn();
  console.log(`Solving Level ${lvl.id}: "${lvl.name}"...`);
  const t0 = Date.now();
  const res = solveLevel(lvl);
  const elapsed = Date.now() - t0;
  if (res.trace) {
    console.log(`  SOLVED! Moves: ${res.totalMoves} in ${elapsed}ms (${res.exploredCount} states explored)`);
    console.log(`  Trace: [${res.trace.slice(0, 5).join(', ')} ... (${res.trace.length} moves)]`);
  } else {
    console.log(`  FAILED to solve in ${elapsed}ms (${res.exploredCount} states explored)`);
  }
});

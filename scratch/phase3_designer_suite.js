/**
 * Comprehensive Level Designer & Tester for Phase 3 (Levels 11 - 15)
 */

const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;

class PuzzleTester {
  constructor(lvl) {
    this.lvl = lvl;
    this.w = lvl.w;
    this.h = lvl.h;
    this.grid = lvl.grid;
    this.spawn = lvl.spawn;
    this.goal = lvl.goal;
    this.checkpoints = lvl.checkpoints || [];
    this.hasC1 = this.checkpoints.some(c => c.id === 1);
    this.hasC2 = this.checkpoints.some(c => c.id === 2);
  }

  findOptimal() {
    const queue = [];
    const visited = new Map();

    queue.push({
      x: this.spawn.x,
      y: this.spawn.y,
      grid: this.grid.map(r => [...r]),
      c1: !this.hasC1,
      c2: !this.hasC2,
      moves: 0,
      path: []
    });

    const serialize = (s) => {
      let gStr = '';
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          gStr += s.grid[y][x];
        }
      }
      return `${s.x},${s.y},${s.c1 ? 1 : 0},${s.c2 ? 1 : 0},${gStr}`;
    };

    const solutions = [];

    while (queue.length > 0) {
      const curr = queue.shift();

      if (curr.moves > 22) continue; // safety limit

      const key = serialize(curr);
      if (visited.has(key) && visited.get(key) <= curr.moves) continue;
      visited.set(key, curr.moves);

      const dirs = [
        { dx: 1, dy: 0, name: 'RIGHT' },
        { dx: -1, dy: 0, name: 'LEFT' },
        { dx: 0, dy: 1, name: 'DOWN' },
        { dx: 0, dy: -1, name: 'UP' }
      ];

      for (const d of dirs) {
        const nx = curr.x + d.dx;
        const ny = curr.y + d.dy;

        if (nx < 0 || nx >= this.w || ny < 0 || ny >= this.h) continue;

        const cell = curr.grid[ny][nx];

        // Block impassable
        if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) continue;

        // C2 impassable while C1 active
        if (cell === C_CHECKPOINT_2 && !curr.c1) continue;

        // Goal reached?
        if (cell === C_GOAL) {
          if (curr.c1 && curr.c2) {
            solutions.push({
              moves: curr.moves + 1,
              path: [...curr.path, { dir: d, target: { x: nx, y: ny } }]
            });
          }
          continue;
        }

        // Advance
        const nextGrid = curr.grid.map(r => [...r]);
        const depCell = curr.grid[curr.y][curr.x];
        if (depCell === C_CRUMBLING) {
          nextGrid[curr.y][curr.x] = C_VOID; // Crumbling vanishes to VOID
        } else {
          nextGrid[curr.y][curr.x] = C_CONSUMED;
        }

        let nextC1 = curr.c1;
        let nextC2 = curr.c2;
        if (cell === C_CHECKPOINT_1) nextC1 = true;
        if (cell === C_CHECKPOINT_2) nextC2 = true;

        queue.push({
          x: nx,
          y: ny,
          grid: nextGrid,
          c1: nextC1,
          c2: nextC2,
          moves: curr.moves + 1,
          path: [...curr.path, { dir: d, target: { x: nx, y: ny } }]
        });
      }
    }

    solutions.sort((a, b) => a.moves - b.moves);
    return solutions;
  }
}

// ============================================================================
// DESIGN 11: The Greedy Snare (4x4)
// ============================================================================
// Concept: C1 is placed at (1,0), just 1 step away from P(0,0) or (1,1).
// Let's create a layout where stepping directly towards C1 consumes the choke point.
// Layout:
// P(0,0)  . (1,0)  C1(2,0) . (3,0)
// . (0,1) # (1,1)  # (2,1) . (3,1)
// . (0,2) # (1,2)  C2(2,2) . (3,2)
// . (0,3) . (1,3)  . (2,3) G (3,3)
const lvl11 = {
  id: 11,
  name: "The Greedy Snare",
  w: 4, h: 4,
  spawn: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
  checkpoints: [
    { id: 1, x: 2, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 2, y: 2, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 5, 2], // P at (0,0), C1 at (2,0)
    [2, 1, 1, 2], // walls at (1,1), (2,1)
    [2, 1, 6, 2], // wall at (1,2), C2 at (2,2)
    [2, 2, 2, 4]  // G at (3,3)
  ]
};

// ============================================================================
// DESIGN 12: The Double Cross (4x4)
// ============================================================================
// Concept: Intersecting path. A central crossroads tile (1,1) or (2,2).
// Crossing it early blocks the return.
// Layout:
// P(0,0)  . (1,0)  . (2,0)  . (3,0)
// . (0,1) . (1,1)  # (2,1)  C1(3,1)
// C2(0,2) # (1,2)  . (2,2)  . (3,2)
// . (0,3) . (1,3)  . (2,3)  G(3,3)
const lvl12 = {
  id: 12,
  name: "The Double Cross",
  w: 4, h: 4,
  spawn: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 1, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 2],
    [2, 2, 1, 5],
    [6, 1, 2, 2],
    [2, 2, 2, 4]
  ]
};

// ============================================================================
// DESIGN 13: The Fragile Span (5x3)
// ============================================================================
// Introduces C_CRUMBLING = 7 across a void chasm.
// Row 0: P(0,0)  . (1,0)  CR(2,0) . (3,0)  C1(4,0)
// Row 1: 0 (0,1) 1 (1,1)  0 (2,1) 1 (3,1)  . (4,1)
// Row 2: G(0,2)  . (1,2)  CR(2,2) . (3,2)  . (4,2)
const lvl13 = {
  id: 13,
  name: "The Fragile Span",
  w: 5, h: 3,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 7, 2, 5],
    [0, 1, 0, 1, 2],
    [4, 2, 7, 2, 2]
  ]
};

// ============================================================================
// DESIGN 14: The False Haven (4x4)
// ============================================================================
// Deceptive false haven perimeter with a crumbling bridge.
// C1 at (3,0), C2 at (3,3), G at (0,3). Crumbling tile at (2,1).
const lvl14 = {
  id: 14,
  name: "The False Haven",
  w: 4, h: 4,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 3, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 5],
    [2, 1, 7, 2], // crumbling tile at (2,1)
    [2, 0, 1, 2], // void at (1,2)
    [4, 2, 2, 6]
  ]
};

// ============================================================================
// DESIGN 15: The Gauntlet of Ruin (5x4)
// ============================================================================
// Master Exam: Multiple crumbling tiles (7), C1, C2, void chasms, tight parity.
const lvl15 = {
  id: 15,
  name: "The Gauntlet of Ruin",
  w: 5, h: 4,
  spawn: { x: 0, y: 0 },
  goal: { x: 2, y: 2 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 7, 2, 5], // P(0,0), Crumble(2,0), C1(4,0)
    [2, 0, 1, 0, 2], // Void at (1,1), Wall at (2,1), Void at (3,1)
    [2, 1, 4, 1, 7], // Wall(1,2), G(2,2) Center, Wall(3,2), Crumble(4,2)
    [6, 2, 2, 2, 2]  // C2(0,3)
  ]
};

console.log("Testing Lvl 11...");
const t11 = new PuzzleTester(lvl11);
const s11 = t11.findOptimal();
console.log(`L11: ${s11.length} solutions. Opt moves: ${s11[0]?.moves}`);
if (s11[0]) console.log("Trace 11:", s11[0].path.map(p => p.dir.name).join(', '));

console.log("Testing Lvl 12...");
const t12 = new PuzzleTester(lvl12);
const s12 = t12.findOptimal();
console.log(`L12: ${s12.length} solutions. Opt moves: ${s12[0]?.moves}`);
if (s12[0]) console.log("Trace 12:", s12[0].path.map(p => p.dir.name).join(', '));

console.log("Testing Lvl 13...");
const t13 = new PuzzleTester(lvl13);
const s13 = t13.findOptimal();
console.log(`L13: ${s13.length} solutions. Opt moves: ${s13[0]?.moves}`);
if (s13[0]) console.log("Trace 13:", s13[0].path.map(p => p.dir.name).join(', '));

console.log("Testing Lvl 14...");
const t14 = new PuzzleTester(lvl14);
const s14 = t14.findOptimal();
console.log(`L14: ${s14.length} solutions. Opt moves: ${s14[0]?.moves}`);
if (s14[0]) console.log("Trace 14:", s14[0].path.map(p => p.dir.name).join(', '));

console.log("Testing Lvl 15...");
const t15 = new PuzzleTester(lvl15);
const s15 = t15.findOptimal();
console.log(`L15: ${s15.length} solutions. Opt moves: ${s15[0]?.moves}`);
if (s15[0]) console.log("Trace 15:", s15[0].path.map(p => p.dir.name).join(', '));

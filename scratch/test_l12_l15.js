/**
 * Self-contained Level 12 & 15 Solver & Iterator
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

  findOptimal(maxDepth = 20) {
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

      if (curr.moves > maxDepth) continue;

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

// Level 12 Candidate v1
const l12_v1 = {
  id: 12,
  name: "The Double Cross",
  w: 4, h: 4,
  spawn: { x: 0, y: 1 },
  goal: { x: 3, y: 2 },
  checkpoints: [
    { id: 1, x: 1, y: 3, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 3, y: 0, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 6], // (3,0) is C2
    [2, 2, 1, 2], // P at (0,1), wall at (2,1)
    [2, 2, 2, 4], // (3,2) is G
    [1, 5, 2, 2]  // wall at (0,3), (1,3) is C1
  ]
};

const t12_1 = new PuzzleTester(l12_v1);
const s12_1 = t12_1.findOptimal(16);
console.log("L12 v1 solutions:", s12_1.length, "moves:", s12_1[0]?.moves);
if (s12_1[0]) console.log("Trace:", s12_1[0].path.map(p => p.dir.name).join(', '));

// Level 12 Candidate v2 (Classic Double Cross)
// P at (0,0), C1 at (3,0), C2 at (0,3), G at (3,3)
// Wall at (1,1) and (2,2)
const l12_v2 = {
  id: 12,
  name: "The Double Cross",
  w: 4, h: 4,
  spawn: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 0, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 5], // C1 at (3,0)
    [2, 2, 1, 2],
    [2, 1, 2, 2],
    [6, 2, 2, 4]  // C2 at (0,3), G at (3,3)
  ]
};

const t12_2 = new PuzzleTester(l12_v2);
const s12_2 = t12_2.findOptimal(16);
console.log("L12 v2 solutions:", s12_2.length, "moves:", s12_2[0]?.moves);
if (s12_2[0]) console.log("Trace:", s12_2[0].path.map(p => p.dir.name).join(', '));

// Level 12 Candidate v3:
// Let's create an actual intersecting + layout
// 4x3 or 4x4
const l12_v3 = {
  id: 12,
  name: "The Double Cross",
  w: 4, h: 3,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 3, y: 2, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 5], // P(0,0), C1(3,0)
    [1, 2, 2, 1], // Walls at (0,1), (3,1), crossing corridor at (1,1), (2,1)
    [4, 2, 2, 6]  // G(0,2), C2(3,2)
  ]
};

const t12_3 = new PuzzleTester(l12_v3);
const s12_3 = t12_3.findOptimal(14);
console.log("L12 v3 solutions:", s12_3.length, "moves:", s12_3[0]?.moves);
if (s12_3[0]) console.log("Trace L12 v3:", s12_3[0].path.map(p => p.dir.name).join(', '));

// Level 15 Candidate v2:
// Master Exam: Multiple crumbling tiles (C_CRUMBLING = 7)
// 5x4 grid
// P at (0,0), C1 at (4,0), C2 at (4,3), G at (0,3)
const l15_v2 = {
  id: 15,
  name: "The Gauntlet of Ruin",
  w: 5, h: 4,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 4, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 7, 2, 5], // P(0,0), Crumble(2,0), C1(4,0)
    [2, 1, 0, 1, 2], // Wall(1,1), Void(2,1), Wall(3,1)
    [2, 1, 0, 1, 2], // Wall(1,2), Void(2,2), Wall(3,2)
    [4, 2, 7, 2, 6]  // G(0,3), Crumble(2,3), C2(4,3)
  ]
};

const t15_2 = new PuzzleTester(l15_v2);
const s15_2 = t15_2.findOptimal(18);
console.log("L15 v2 solutions:", s15_2.length, "moves:", s15_2[0]?.moves);
if (s15_2[0]) console.log("Trace L15 v2:", s15_2[0].path.map(p => p.dir.name).join(', '));

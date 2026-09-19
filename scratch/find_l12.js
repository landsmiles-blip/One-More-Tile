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

        if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) continue;
        if (cell === C_CHECKPOINT_2 && !curr.c1) continue;

        if (cell === C_GOAL) {
          if (curr.c1 && curr.c2) {
            solutions.push({
              moves: curr.moves + 1,
              path: [...curr.path, { dir: d, target: { x: nx, y: ny } }]
            });
          }
          continue;
        }

        const nextGrid = curr.grid.map(r => [...r]);
        const depCell = curr.grid[curr.y][curr.x];
        if (depCell === C_CRUMBLING) {
          nextGrid[curr.y][curr.x] = C_VOID;
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

// Let's test a true intersection in 4x4 or 4x3:
// Consider:
// P(0,0)  . (1,0)  . (2,0)  . (3,0)
// . (0,1) . (1,1)  . (2,1)  C1(3,1)
// C2(0,2) . (1,2)  . (2,2)  . (3,2)
// . (0,3) . (1,3)  . (2,3)  G(3,3)
//
// With walls strategically placed so the path to C1 intersects the path from C2 to G!
// For instance:
// Path to C1: moves east across Row 1 or Column 1.
// Path from C2 to G: moves across the same intersection!

const candidates = [
  // Option A: 4x4
  {
    name: "A: 4x4 Intersection",
    w: 4, h: 4,
    spawn: { x: 0, y: 0 },
    goal: { x: 3, y: 3 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 3, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 5], // P(0,0), C1(3,0)
      [2, 1, 2, 2], // Wall at (1,1)
      [2, 2, 1, 2], // Wall at (2,2)
      [6, 2, 2, 4]  // C2(0,3), G(3,3)
    ]
  },
  // Option B: 4x3 Cross
  {
    name: "B: 4x3 Central Hub",
    w: 4, h: 3,
    spawn: { x: 1, y: 0 },
    goal: { x: 2, y: 2 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 5], // (1,0) is P, (3,0) is C1
      [2, 2, 2, 2], // Open middle corridor (1,1) & (2,1)
      [6, 2, 4, 2]  // (0,2) is C2, (2,2) is G
    ]
  },
  // Option C: 4x4 Figure-Eight / Cross
  {
    name: "C: 4x4 Figure-Eight Cross",
    w: 4, h: 4,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 3, y: 3, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 5], // P(0,0), C1(3,0)
      [2, 1, 1, 2], // Central wall block (1,1), (2,1)
      [2, 2, 2, 2], // Horizontal crossing lane
      [4, 1, 1, 6]  // G(0,3), C2(3,3)
    ]
  },
  // Option D: 4x4 Asymmetric Cross
  {
    name: "D: 4x4 Asymmetric Cross",
    w: 4, h: 4,
    spawn: { x: 1, y: 1 },
    goal: { x: 2, y: 2 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 3, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 5],
      [2, 2, 2, 2],
      [2, 2, 4, 2],
      [6, 2, 2, 2]
    ]
  }
];

candidates.forEach(cand => {
  const t = new PuzzleTester(cand);
  const s = t.findOptimal(16);
  console.log(`${cand.name}: ${s.length} solutions found.`);
  if (s.length > 0) {
    console.log(`  Opt moves: ${s[0].moves}`);
    console.log(`  Trace: ${s[0].path.map(p => p.dir.name).join(', ')}`);
  }
});

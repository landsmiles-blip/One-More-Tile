/**
 * Phase 4 Solver for Levels 18, 19, 20
 */

const { cand16, cand17 } = require('./phase4_designer.js');

const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;
const C_SWITCH = 8;
const C_GATE_RED = 9;
const C_GATE_BLUE = 10;

class Phase4Solver {
  constructor(lvl) {
    this.lvl = lvl;
    this.w = lvl.w;
    this.h = lvl.h;
    this.grid = lvl.grid;
    this.spawn = lvl.spawn;
    this.goal = lvl.goal;
    this.initialPhase = lvl.initialPhase !== undefined ? (lvl.initialPhase === 'RED') : true;
    this.checkpoints = lvl.checkpoints || [];
    this.hasC1 = this.checkpoints.some(c => c.id === 1);
    this.hasC2 = this.checkpoints.some(c => c.id === 2);
  }

  solve(maxDepth = 22) {
    const queue = [];
    const visited = new Map();

    queue.push({
      x: this.spawn.x,
      y: this.spawn.y,
      grid: this.grid.map(r => [...r]),
      phase: this.initialPhase,
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
      return `${s.x},${s.y},${s.phase ? 1 : 0},${s.c1 ? 1 : 0},${s.c2 ? 1 : 0},${gStr}`;
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

        // Gates: Red open if phase=true, Blue open if phase=false
        if (cell === C_GATE_RED && !curr.phase) continue;
        if (cell === C_GATE_BLUE && curr.phase) continue;

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

        let nextPhase = curr.phase;
        if (cell === C_SWITCH) {
          nextPhase = !curr.phase;
        }

        let nextC1 = curr.c1;
        let nextC2 = curr.c2;
        if (cell === C_CHECKPOINT_1) nextC1 = true;
        if (cell === C_CHECKPOINT_2) nextC2 = true;

        queue.push({
          x: nx,
          y: ny,
          grid: nextGrid,
          phase: nextPhase,
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

// ----------------------------------------------------------------------------
// Level 18 Fix: "The Fragile Polarity" (5x3)
// P at (0,0). Goal at (0,2).
// Initial Phase: RED.
// North path has Crumbling tile (2,0) leading to Switch at (4,0).
// South path has Blue Gate at (1,2). Blue Gate blocks Goal until Switch is flipped!
// ----------------------------------------------------------------------------
const l18 = {
  id: 18,
  name: "The Fragile Polarity",
  w: 5, h: 3,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 7, 2, 8],  // P(0,0), Crumble(2,0), Switch(4,0)
    [0, 1, 0, 1, 2],  // Void(0,1), Wall(1,1), Void(2,1), Wall(3,1), .(4,1)
    [4, 10, 2, 2, 2]  // Goal(0,2), Blue Gate(1,2), .(2,2), .(3,2), .(4,2)
  ]
};

console.log("Testing L18...");
const s18 = new Phase4Solver(l18).solve(14);
console.log(`L18: ${s18.length} solutions found. Optimal moves: ${s18[0]?.moves}`);
if (s18[0]) console.log("Trace 18:", s18[0].path.map(p => p.dir.name).join(', '));

// ----------------------------------------------------------------------------
// Level 19 Fix: "The Parity Lockout" (4x4)
// Dual switches with deceptive lures.
// Initial Phase: RED.
// We want an exact unique path where flipping the wrong switch locks the gate!
// ----------------------------------------------------------------------------
const l19 = {
  id: 19,
  name: "The Parity Lockout",
  w: 4, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 2, 5],  // P(0,0), C1(3,0)
    [2, 1, 8, 2],  // Switch 1 at (2,1)
    [2, 9, 1, 2],  // Red Gate at (1,2)
    [8, 10, 2, 4]  // Switch 2 at (0,3), Blue Gate at (1,3), Goal at (3,3)
  ]
};

console.log("\nTesting L19...");
const s19 = new Phase4Solver(l19).solve(16);
console.log(`L19: ${s19.length} solutions found. Optimal moves: ${s19[0]?.moves}`);
if (s19[0]) console.log("Trace 19:", s19[0].path.map(p => p.dir.name).join(', '));

// ----------------------------------------------------------------------------
// Level 20 Fix: "The Grandmaster Synthesis" (5x4)
// Apex Phase 4 puzzle:
// Uniting Checkpoints C1, C2 + Crumbling Bridges (7) +
// Red Gate (9) + Blue Gate (10) + Switch (8) + Goal (4).
//
// Initial Phase: RED.
// Row 0: P(0,0)  . (1,0)  CR(2,0) . (3,0)  C1(4,0)
// Row 1: . (0,1) 1 (1,1)  0 (2,1) 1 (3,1)  SW(4,1)
// Row 2: . (0,2) 1 (1,2)  0 (2,2) 1 (3,2)  Blue(4,2)
// Row 3: G(0,3)  Red(1,3) CR(2,3) . (3,3)  C2(4,3)
//
// Wait! Look:
// In Row 3: if (1,3) is Red, but phase was inverted at (4,1) to BLUE,
// then player can hit another switch at (3,3) or loop back?
// Let's test with Blue Gate at (4,2) and Blue Gate at (1,3):
// ----------------------------------------------------------------------------
const l20 = {
  id: 20,
  name: "The Grandmaster Synthesis",
  w: 5, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 4, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 7, 2, 5],  // P(0,0), Crumble(2,0), C1(4,0)
    [2, 1, 0, 1, 8],  // Switch at (4,1)
    [2, 1, 0, 1, 10], // Blue Gate at (4,2) [OPENS when Switch flipped!]
    [4, 10, 7, 2, 6]  // Goal(0,3), Blue Gate(1,3), Crumble(2,3), C2(4,3)
  ]
};

console.log("\nTesting L20...");
const s20 = new Phase4Solver(l20).solve(18);
console.log(`L20: ${s20.length} solutions found. Optimal moves: ${s20[0]?.moves}`);
if (s20[0]) console.log("Trace 20:", s20[0].path.map(p => p.dir.name).join(', '));

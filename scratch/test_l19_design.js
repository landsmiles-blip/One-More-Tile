/**
 * Test Level 19 layout where switches and gates are mandatory
 */

const { cand16 } = require('./phase4_designer.js');

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

// Design Level 19:
// 4x4 Grid.
// Initial Phase: RED.
// Row 0: P(0,0)   . (1,0)   Red(2,0)   SW1(3,0)
// Row 1: # (0,1)  # (1,1)   # (2,1)    . (3,1)
// Row 2: . (0,2)  SW2(1,2)  # (2,2)    Blue(3,2)
// Row 3: G(0,3)   Blue(1,3) . (2,3)    . (3,3)
//
// Let's trace:
// P at (0,0).
// East through Red Gate (2,0) to Switch 1 at (3,0).
// SW1 flips RED -> BLUE!
// Now Blue Gate at (3,2) OPENS!
// Move south: (3,0) -> (3,1) -> (3,2)[Blue] -> (3,3).
// Move west: (3,3) -> (2,3) -> (1,3)[Blue Gate].
// Wait! If player goes into Goal at (0,3):
// What if there is a decoy Switch 2 at (1,2)?
// If a player visits Switch 2 at (1,2), phase flips back to RED, locking Blue Gate (1,3) and trapping them!
// A true "Parity Lockout"!

const l19_cand1 = {
  id: 19,
  name: "The Parity Lockout",
  w: 4, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],   // P(0,0), (1,0), Red Gate(2,0), Switch 1(3,0)
    [1, 1, 1, 2],   // Walls
    [1, 8, 1, 10],  // Wall(0,2), Switch 2(1,2)[TRAP], Wall, Blue Gate(3,2)
    [4, 10, 2, 2]   // Goal(0,3), Blue Gate(1,3), (2,3), (3,3)
  ]
};

console.log("Testing L19 candidate 1...");
const s19_1 = new Phase4Solver(l19_cand1).solve(16);
console.log(`L19 cand 1: ${s19_1.length} solutions.`);
s19_1.forEach((s, idx) => {
  console.log(`Sol ${idx} (${s.moves} moves):`, s.path.map(p => `${p.dir.name}(${p.target.x},${p.target.y})`).join(' '));
});

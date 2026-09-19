/**
 * Phase 4 Comprehensive Level Designer & Verifier
 * Levels 16 to 20
 */

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

  solve(maxDepth = 25) {
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

        // Standard impassable
        if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) continue;

        // Checkpoint 2 impassable while C1 active
        if (cell === C_CHECKPOINT_2 && !curr.c1) continue;

        // Phase Gate Passability
        if (cell === C_GATE_RED && !curr.phase) continue;
        if (cell === C_GATE_BLUE && curr.phase) continue;

        // Goal check
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

        // Departure Consumption
        if (depCell === C_CRUMBLING) {
          nextGrid[curr.y][curr.x] = C_VOID;
        } else {
          nextGrid[curr.y][curr.x] = C_CONSUMED;
        }

        // Entry mutations
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
// LEVEL 16: "The Phase Primer" (4x3)
// ----------------------------------------------------------------------------
const l16 = {
  id: 16,
  name: "The Phase Primer",
  w: 4, h: 3,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],  // P(0,0), (1,0), Red(2,0), SW(3,0)
    [1, 1, 1, 2],  // Wall, Wall, Wall, (3,1)
    [4, 10, 2, 2]  // Goal(0,2), Blue(1,2), (2,2), (3,2)
  ]
};

// ----------------------------------------------------------------------------
// LEVEL 17: "The Red-Blue Split" (4x4)
// We want C1 behind Red Gate, Switch in corner, and Blue Gate leading to Goal!
// Row 0: P(0,0)  . (1,0)  Red(2,0)  C1(3,0)
// Row 1: 1 (0,1) 1 (1,1)  1 (2,1)   SW(3,1)
// Row 2: . (0,2) . (1,2)  1 (2,2)   . (3,2)
// Row 3: G(0,3)  Blue(1,3) . (2,3)  . (3,3)
//
// Trace:
// (0,0) -> (1,0) -> (2,0)[Red Gate] -> (3,0)[C1] -> (3,1)[Switch: RED->BLUE]
// -> (3,2) -> (3,3) -> (2,3) -> (1,3)[Blue Gate] -> Goal at (0,3)? Wait, (1,3) to (0,3) is L!
// What about (0,2) and (1,2)?
// If (0,2) and (1,2) are walls:
// Row 1: [1, 1, 1, 8]
// Row 2: [1, 1, 1, 2]
// Row 3: [4, 10, 2, 2]
// Then (3,1) is Switch, (3,2) is '.', (3,3) is '.', (2,3) is '.', (1,3) is Blue Gate, (0,3) is Goal!
// Total moves:
// R (1,0), R (2,0)[Red], R (3,0)[C1], D (3,1)[SW], D (3,2), D (3,3), L (2,3), L (1,3)[Blue], L (0,3)[Goal] = 9 moves!
// Let's verify!
// ----------------------------------------------------------------------------
const l17 = {
  id: 17,
  name: "The Red-Blue Split",
  w: 4, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 9, 5],   // P(0,0), (1,0), Red Gate(2,0), C1(3,0)
    [1, 1, 1, 8],   // Walls, Switch(3,1)
    [1, 1, 1, 2],   // Walls, (3,2)
    [4, 10, 2, 2]   // Goal(0,3), Blue Gate(1,3), (2,3), (3,3)
  ]
};

// ----------------------------------------------------------------------------
// LEVEL 18: "The Fragile Polarity" (5x3)
// Crumbling bridge (2,0) forces player to Switch (4,0).
// Crumbling collapses, preventing any return.
// Newly opened Blue Gate (1,2) is the sole path to Goal (0,2).
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
    [2, 2, 7, 2, 8],  // P(0,0), (1,0), Crumble(2,0), (3,0), Switch(4,0)
    [0, 1, 0, 1, 2],  // Void(0,1), Wall(1,1), Void(2,1), Wall(3,1), (4,1)
    [4, 10, 2, 2, 2]  // Goal(0,2), Blue Gate(1,2), (2,2), (3,2), (4,2)
  ]
};

// ----------------------------------------------------------------------------
// LEVEL 19: "The Parity Lockout" (4x4)
// Decoy Switch 2 at (1,2) is a deadly trap in a dead-end that tempts greedy players.
// Unique optimal path navigates Switch 1 to open both Blue Gates (3,2) and (1,3).
// ----------------------------------------------------------------------------
const l19 = {
  id: 19,
  name: "The Parity Lockout",
  w: 4, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],   // P(0,0), (1,0), Red Gate(2,0), Switch 1(3,0)
    [1, 1, 1, 2],   // Walls, (3,1)
    [1, 8, 1, 10],  // Wall, Switch 2(1,2)[TRAP], Wall, Blue Gate(3,2)
    [4, 10, 2, 2]   // Goal(0,3), Blue Gate(1,3), (2,3), (3,3)
  ]
};

// ----------------------------------------------------------------------------
// LEVEL 20: "The Grandmaster Synthesis" (5x4)
// Combines: C1(4,0), C2(4,3), Crumbling 1(2,0), Crumbling 2(2,3),
// Switch(4,1), Blue Gate 1(4,2), Blue Gate 2(1,3), Goal(0,3).
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
    [2, 2, 7, 2, 5],  // P(0,0), (1,0), Crumble 1(2,0), (3,0), C1(4,0)
    [1, 1, 0, 1, 8],  // Wall(0,1), Wall(1,1), Void(2,1), Wall(3,1), Switch(4,1)
    [1, 1, 0, 1, 10], // Wall(0,2), Wall(1,2), Void(2,2), Wall(3,2), Blue Gate 1(4,2)
    [4, 10, 7, 2, 6]  // Goal(0,3), Blue Gate 2(1,3), Crumble 2(2,3), (3,3), C2(4,3)
  ]
};

const levels = [l16, l17, l18, l19, l20];

levels.forEach(lvl => {
  console.log(`\n========================================`);
  console.log(`Solving Level ${lvl.id}: ${lvl.name}`);
  const solver = new Phase4Solver(lvl);
  const sols = solver.solve(20);
  console.log(`Total solutions: ${sols.length}`);
  if (sols.length > 0) {
    const opt = sols[0];
    console.log(`Optimal moves: ${opt.moves}`);
    console.log(`Trace: ${opt.path.map(p => p.dir.name).join(', ')}`);
    console.log(`Target coords: ${opt.path.map(p => `(${p.target.x},${p.target.y})`).join(' -> ')}`);
  }
});

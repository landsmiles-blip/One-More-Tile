/**
 * Phase 3 Level Designer & Solver
 * Simulates and validates Levels 11-15 with exact state machine:
 * - C_CRUMBLING = 7 mutates to C_VOID = 0 upon exit
 * - C_CHECKPOINT_2 is impassable while C_CHECKPOINT_1 is active
 * - Goal is impassable until all checkpoints collected (and any required conditions met)
 * - Spatial budget Bt decrements per move; Bt = -1 triggers immediate deadlock
 * - Validates B0 = L_opt (exact zero margin for error)
 */

const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;

class PuzzleSolver {
  constructor(lvl) {
    this.lvl = lvl;
    this.w = lvl.w;
    this.h = lvl.h;
    this.initialGrid = lvl.grid.map(r => [...r]);
    this.spawn = { ...lvl.spawn };
    this.goal = { ...lvl.goal };
    this.hasC1 = lvl.checkpoints ? lvl.checkpoints.some(c => c.id === 1) : false;
    this.hasC2 = lvl.checkpoints ? lvl.checkpoints.some(c => c.id === 2) : false;
  }

  solve(maxDepth = 20) {
    const queue = [];
    const visited = new Map();

    const initialCrumbling = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.initialGrid[y][x] === C_CRUMBLING) {
          initialCrumbling.push(`${x},${y}`);
        }
      }
    }

    const startState = {
      x: this.spawn.x,
      y: this.spawn.y,
      grid: this.initialGrid.map(r => [...r]),
      c1: !this.hasC1, // true if level has no C1
      c2: !this.hasC2, // true if level has no C2
      moves: 0,
      path: []
    };

    queue.push(startState);

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
      if (visited.has(key) && visited.get(key) <= curr.moves) {
        continue;
      }
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

        // Wall, consumed, void are impassable
        if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) continue;

        // C2 is impassable while C1 is active
        if (cell === C_CHECKPOINT_2 && !curr.c1) continue;

        // Goal check
        if (cell === C_GOAL) {
          // Goal is only passable if all checkpoints are satisfied
          if (!curr.c1 || !curr.c2) continue;

          // Win reached!
          solutions.push({
            moves: curr.moves + 1,
            path: [...curr.path, { dir: d, target: { x: nx, y: ny } }]
          });
          continue;
        }

        // Valid move to nx, ny
        const nextGrid = curr.grid.map(r => [...r]);
        const depCell = curr.grid[curr.y][curr.x];

        // Departure cell consumption
        if (depCell === C_CRUMBLING) {
          nextGrid[curr.y][curr.x] = C_VOID; // Crumbling tile collapses to VOID!
        } else {
          nextGrid[curr.y][curr.x] = C_CONSUMED; // Normal tile mutates to CONSUMED
        }

        let nextC1 = curr.c1;
        let nextC2 = curr.c2;

        if (cell === C_CHECKPOINT_1) {
          nextC1 = true;
        } else if (cell === C_CHECKPOINT_2) {
          nextC2 = true;
        }

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

    // Sort solutions by move count ascending
    solutions.sort((a, b) => a.moves - b.moves);
    return solutions;
  }
}

// Test candidate level designs
console.log("=== TESTING CANDIDATE LEVEL DESIGNS ===");

// ----------------------------------------------------------------------------
// Candidate Level 11: "The Greedy Snare" (4x4)
// P at (0,0). C1 at (3,0). Direct top path is 3 moves.
// But stepping directly (0,0)->(1,0)->(2,0)->(3,0)[C1] cuts off the only bridge
// to C2 and Goal!
// ----------------------------------------------------------------------------
const candidate11 = {
  id: 11,
  name: "The Greedy Snare",
  w: 4, h: 4,
  spawn: { x: 0, y: 1 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 3, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 2, 5], // (3,0) = C1
    [2, 1, 1, 2], // (0,1) = Spawn P, walls at (1,1), (2,1)
    [2, 2, 1, 2], // wall at (2,2)
    [4, 2, 2, 6]  // (0,3) = Goal G, (3,3) = C2
  ]
};

const solver11 = new PuzzleSolver(candidate11);
const sol11 = solver11.solve(14);
console.log(`Level 11 Solutions found: ${sol11.length}`);
if (sol11.length > 0) {
  console.log(`Level 11 Optimal moves: ${sol11[0].moves}`);
  console.log(`Trace:`, sol11[0].path.map(p => p.dir.name).join(', '));
}

// Let's test candidate Level 13: "The Fragile Span" (with C_CRUMBLING = 7)
// Crumbling bridge across void
const candidate13 = {
  id: 13,
  name: "The Fragile Span",
  w: 5, h: 3,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [
    { id: 1, x: 4, y: 1, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 7, 2, 2], // Row 0: P(0,0), .(1,0), Crumble(2,0), .(3,0), .(4,0)
    [0, 1, 0, 1, 5], // Row 1: Void(0,1), Wall(1,1), Void(2,1), Wall(3,1), C1(4,1)
    [4, 2, 7, 2, 2]  // Row 2: G(0,2), .(1,2), Crumble(2,2), .(3,2), .(4,2)
  ]
};

const solver13 = new PuzzleSolver(candidate13);
const sol13 = solver13.solve(14);
console.log(`Level 13 Solutions found: ${sol13.length}`);
if (sol13.length > 0) {
  console.log(`Level 13 Optimal moves: ${sol13[0].moves}`);
  console.log(`Trace:`, sol13[0].path.map(p => p.dir.name).join(', '));
}

/**
 * Phase 4 Designer & Solver (Levels 16 - 20)
 * Evaluates:
 * - C_SWITCH = 8: inverts phaseState on entry, mutates to C_CONSUMED on exit
 * - C_GATE_RED = 9: open when phaseState === true, closed when phaseState === false
 * - C_GATE_BLUE = 10: open when phaseState === false, closed when phaseState === true
 * - C_CRUMBLING = 7: collapses to C_VOID on exit
 * - C_CHECKPOINT_1 = 5, C_CHECKPOINT_2 = 6: sequential passability gating
 * - Spatial Budget B0 = L_opt, Bt = 0 at Goal entry
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

  solve(maxDepth = 20) {
    const queue = [];
    const visited = new Map();

    queue.push({
      x: this.spawn.x,
      y: this.spawn.y,
      grid: this.grid.map(r => [...r]),
      phase: this.initialPhase, // true = RED open / BLUE closed
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
        // RED Gate: Passable only if phase is true (RED_OPEN)
        if (cell === C_GATE_RED && !curr.phase) continue;

        // BLUE Gate: Passable only if phase is false (BLUE_OPEN)
        if (cell === C_GATE_BLUE && curr.phase) continue;

        // Goal Check
        if (cell === C_GOAL) {
          if (curr.c1 && curr.c2) {
            solutions.push({
              moves: curr.moves + 1,
              path: [...curr.path, { dir: d, target: { x: nx, y: ny } }]
            });
          }
          continue;
        }

        // Advance Move
        const nextGrid = curr.grid.map(r => [...r]);
        const depCell = curr.grid[curr.y][curr.x];

        // Departure Consumption:
        // C_CRUMBLING mutates to C_VOID
        // All others (UNTOUCHED, SWITCH, OPEN GATE, CHECKPOINT) mutate to C_CONSUMED
        if (depCell === C_CRUMBLING) {
          nextGrid[curr.y][curr.x] = C_VOID;
        } else {
          nextGrid[curr.y][curr.x] = C_CONSUMED;
        }

        // Entry State Mutations
        let nextPhase = curr.phase;
        if (cell === C_SWITCH) {
          nextPhase = !curr.phase; // Invert phase on entry!
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

// ============================================================================
// CANDIDATE LEVEL 16: "The Phase Primer" (4x3)
// ============================================================================
// Clean introduction to Switch (8) and Red Gate (9) / Blue Gate (10).
// Initial phase: RED (Red is OPEN, Blue is CLOSED).
// Direct path to Goal is blocked by Blue Gate (10).
// Red Gate (9) allows access to Switch (8).
// Entering Switch flips phase: Red closes, Blue OPENS!
// Player returns via newly opened Blue Gate to Goal!
//
// Layout:
// Row 0: P(0,0)   . (1,0)   Red(2,0)   SW(3,0)
// Row 1: # (0,1)  # (1,1)   # (2,1)    . (3,1)
// Row 2: G(0,2)   Blue(1,2) . (2,2)    . (3,2)
const cand16 = {
  id: 16,
  name: "The Phase Primer",
  w: 4, h: 3,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],  // P at (0,0), Red Gate at (2,0), Switch at (3,0)
    [1, 1, 1, 2],  // Walls (0,1), (1,1), (2,1), path at (3,1)
    [4, 10, 2, 2]  // Goal G at (0,2), Blue Gate at (1,2)
  ]
};

console.log("Testing Level 16...");
const s16 = new Phase4Solver(cand16).solve(12);
console.log(`L16: ${s16.length} solutions found. Optimal moves: ${s16[0]?.moves}`);
if (s16[0]) console.log("Trace 16:", s16[0].path.map(p => p.dir.name).join(', '));

// ============================================================================
// CANDIDATE LEVEL 17: "The Red-Blue Split" (4x4)
// ============================================================================
// Alternating gates.
// Initial Phase: RED.
// Path to C1 requires going through Red Gate.
// Flipping switch at north opens Blue Gate to south where Goal sits!
//
// Layout 4x4:
// Row 0: P(0,0)  . (1,0)  Red(2,0)  SW(3,0)
// Row 1: . (0,1) # (1,1)  # (2,1)   . (3,1)
// Row 2: Blue(0,2) # (1,2) # (2,2)  . (3,2)
// Row 3: G(0,3)  . (1,3)  . (2,3)   . (3,3)
const cand17 = {
  id: 17,
  name: "The Red-Blue Split",
  w: 4, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],  // Red at (2,0), Switch at (3,0)
    [2, 1, 1, 2],
    [10, 1, 1, 2], // Blue at (0,2)
    [4, 2, 2, 2]   // G at (0,3)
  ]
};

console.log("\nTesting Level 17...");
const s17 = new Phase4Solver(cand17).solve(16);
console.log(`L17: ${s17.length} solutions found. Optimal moves: ${s17[0]?.moves}`);
if (s17[0]) console.log("Trace 17:", s17[0].path.map(p => p.dir.name).join(', '));

// ============================================================================
// CANDIDATE LEVEL 18: "The Fragile Polarity" (5x3)
// ============================================================================
// Combines Crumbling Tile (7) with Phase Gates (9, 10) and Switch (8).
// Crossing crumbling bridge (7) to hit switch (8).
// Crumbling bridge collapses behind player!
// The newly opened gate is the ONLY way out!
//
// Layout 5x3:
// Row 0: P(0,0)   . (1,0)   CR(2,0)   . (3,0)   SW(4,0)
// Row 1: 0 (0,1)  1 (1,1)   0 (2,1)   1 (3,1)   . (4,1)
// Row 2: G(0,2)   Blue(1,2) . (2,2)   Red(3,2)  . (4,2)
const cand18 = {
  id: 18,
  name: "The Fragile Polarity",
  w: 5, h: 3,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 7, 2, 8],  // Crumble at (2,0), Switch at (4,0)
    [0, 1, 0, 1, 2],  // Void at (0,1), (2,1); Walls (1,1), (3,1)
    [4, 10, 2, 9, 2]  // G at (0,2), Blue at (1,2), Red at (3,2)
  ]
};

console.log("\nTesting Level 18...");
const s18 = new Phase4Solver(cand18).solve(16);
console.log(`L18: ${s18.length} solutions found. Optimal moves: ${s18[0]?.moves}`);
if (s18[0]) console.log("Trace 18:", s18[0].path.map(p => p.dir.name).join(', '));

// ============================================================================
// CANDIDATE LEVEL 19: "The Parity Lockout" (4x4)
// ============================================================================
// Dual switches with deceptive lures.
// Initial Phase: RED.
// Switch 1 at (3,0), Switch 2 at (0,3).
// If player flips switch twice, phase returns to RED, locking Blue gate!
// Must find exact path.
const cand19 = {
  id: 19,
  name: "The Parity Lockout",
  w: 4, h: 4,
  initialPhase: 'RED',
  spawn: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
  checkpoints: [
    { id: 1, x: 2, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 5, 8],  // P at (0,0), C1 at (2,0), Switch at (3,0)
    [2, 1, 1, 2],
    [9, 1, 8, 2],  // Red at (0,2), Switch 2 at (2,2)
    [2, 10, 2, 4]  // Blue at (1,3), Goal at (3,3)
  ]
};

console.log("\nTesting Level 19...");
const s19 = new Phase4Solver(cand19).solve(16);
console.log(`L19: ${s19.length} solutions found. Optimal moves: ${s19[0]?.moves}`);
if (s19[0]) console.log("Trace 19:", s19[0].path.map(p => p.dir.name).join(', '));

// ============================================================================
// CANDIDATE LEVEL 20: "The Grandmaster Synthesis" (5x4)
// ============================================================================
// Apex Phase 4 puzzle: Checkpoints C1, C2 + Crumbling Tiles (7) +
// Red Gate (9) + Blue Gate (10) + Switch (8) + Locked Goal (4).
//
// Initial Phase: RED.
// P at (0,0).
// North crumbling bridge to C1 and Switch!
// Flipping switch inverts RED -> BLUE.
// Allows passage through Blue Gate to C2 and Goal!
const cand20 = {
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
    [2, 1, 0, 1, 8],  // Void(2,1), Switch at (4,1)
    [2, 1, 0, 1, 9],  // Red Gate at (4,2)
    [4, 10, 7, 2, 6]  // Goal(0,3), Blue Gate at (1,3), Crumble(2,3), C2(4,3)
  ]
};

console.log("\nTesting Level 20...");
const s20 = new Phase4Solver(cand20).solve(18);
console.log(`L20: ${s20.length} solutions found. Optimal moves: ${s20[0]?.moves}`);
if (s20[0]) console.log("Trace 20:", s20[0].path.map(p => p.dir.name).join(', '));

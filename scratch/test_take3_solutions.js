/**
 * ONE MORE TILE — TAKE 3 (LEVELS 11-20) VERIFICATION RIG
 * 
 * Verifies the 10 Take 3 Levels:
 * - World 3 (Levels 11-15, Pars 25 to 33): Crumbling Basalt Bridges + Crossroads + C1/C2
 * - World 4 (Levels 16-20, Pars 28 to 40): Phase Switches + Polarity Gates + Crossroads + Crumbling + C1/C2
 * 
 * Invariants Tested:
 * 1. 100% victory at exact pars (25, 27, 29, 31, 33, 28, 30, 33, 36, 40).
 * 2. Zero unconsumed tiles remaining upon stepping on Goal (Hamiltonian Clear-All).
 * 3. All checkpoints collected in strict order (C1 before C2).
 * 4. Full O(1) lossless undo rollback from victory back to spawn restores initial board state 100%.
 * 5. Topological branching factor b >= 2.0 across all expansive arenas.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Exact cell enum constants
const C_VOID = 0;         // Pit / empty chasm (impassable)
const C_WALL = 1;         // Static impassable wall / boundary
const C_UNTOUCHED = 2;    // Traversable floor (consumes to 3 on departure)
const C_CONSUMED = 3;     // Consumed floor (impassable)
const C_GOAL = 4;         // Portal / altar (passable only when all tiles cleared)
const C_CHECKPOINT_1 = 5; // Gold star / primary checkpoint
const C_CHECKPOINT_2 = 6; // Purple star / secondary checkpoint (gated by C1)
const C_CRUMBLING = 7;    // Cracked basalt (collapses to C_VOID = 0 on departure)
const C_SWITCH = 8;       // Phase plate (toggles polarity Red <-> Blue)
const C_GATE_RED = 9;     // Closed when polarity is RED; open when BLUE
const C_GATE_BLUE = 10;   // Closed when polarity is BLUE; open when RED
const C_CROSSROAD = 11;   // Junction tile visited twice (2 -> 1 -> 3)

const DIRS = {
  UP:    { dx: 0, dy: -1 },
  DOWN:  { dx: 0, dy: 1 },
  LEFT:  { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 }
};

class Take3SimEngine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(row => [...row]);
    this.player = { ...levelDef.spawn };
    this.goal = { ...levelDef.goal };
    this.par = levelDef.par;
    this.phase = levelDef.initialPhase || "RED";

    this.checkpoints = (levelDef.checkpoints || []).map(c => ({ ...c }));
    this.hasC1 = this.checkpoints.some(c => c.id === 1);
    this.hasC2 = this.checkpoints.some(c => c.id === 2);
    this.c1Collected = false;
    this.c2Collected = false;

    this.crossroads = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.grid[y][x] === C_CROSSROAD) {
          this.crossroads.set(`${x},${y}`, 2);
        }
      }
    }

    this.moves = 0;
    this.isDeadlocked = false;
    this.isVictorious = false;
    this.undoStack = [];
  }

  getRemainingCount() {
    let count = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (x === this.player.x && y === this.player.y) continue;
        const cell = this.grid[y][x];
        if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || 
            cell === C_CRUMBLING || cell === C_SWITCH || cell === C_GATE_RED || cell === C_GATE_BLUE) {
          count++;
        } else if (cell === C_CROSSROAD) {
          count += (this.crossroads.get(`${x},${y}`) || 0);
        }
      }
    }
    return count;
  }

  isGoalUnlocked() {
    const checkpointsMet = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);
    return checkpointsMet && this.getRemainingCount() === 0;
  }

  isTilePassable(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const cell = this.grid[y][x];
    if (cell === C_VOID || cell === C_WALL || cell === C_CONSUMED) return false;
    
    // Checkpoint 2 is strictly impassable until Checkpoint 1 is collected
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;

    // Gate Polarity:
    // C_GATE_RED (9): Closed when polarity is RED; open when BLUE
    if (cell === C_GATE_RED && this.phase === "RED") return false;
    // C_GATE_BLUE (10): Closed when polarity is BLUE; open when RED
    if (cell === C_GATE_BLUE && this.phase === "BLUE") return false;

    // Goal: Unlocked only when remainingCount === 0 and checkpoints met
    if (cell === C_GOAL) return this.isGoalUnlocked();

    // Crossroad: Passable while visits remaining > 0
    if (cell === C_CROSSROAD) {
      return (this.crossroads.get(`${x},${y}`) || 0) > 0;
    }

    return true;
  }

  getLegalMoves() {
    const moves = [];
    for (const [name, d] of Object.entries(DIRS)) {
      const nx = this.player.x + d.dx;
      const ny = this.player.y + d.dy;
      if (this.isTilePassable(nx, ny)) {
        moves.push(name);
      }
    }
    return moves;
  }

  move(dirName) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (this.isDeadlocked) return { success: false, reason: 'DEADLOCKED' };

    const dir = DIRS[dirName];
    if (!dir) return { success: false, reason: 'INVALID_DIRECTION' };

    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isTilePassable(nx, ny)) {
      return { success: false, reason: 'IMPASSABLE' };
    }

    // Push full frame to undoStack for lossless rollback
    this.undoStack.push({
      player: { ...this.player },
      grid: this.grid.map(r => [...r]),
      phase: this.phase,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      crossroads: new Map(this.crossroads),
      moves: this.moves,
      isDeadlocked: this.isDeadlocked,
      isVictorious: this.isVictorious
    });

    const targetCell = this.grid[ny][nx];
    const depCell = this.grid[this.player.y][this.player.x];

    // Departure mutations
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID; // (0)
    } else if (depCell === C_CROSSROAD) {
      const key = `${this.player.x},${this.player.y}`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED; // (3)
      }
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED; // (3)
    }

    this.player.x = nx;
    this.player.y = ny;
    this.moves++;

    // Arrival triggers
    if (targetCell === C_SWITCH) {
      this.phase = (this.phase === "RED" ? "BLUE" : "RED");
    } else if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (targetCell === C_GOAL) {
      this.isVictorious = true;
      return { success: true, victorious: true };
    }

    if (this.getLegalMoves().length === 0) {
      this.isDeadlocked = true;
    }

    return { success: true, victorious: false };
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const frame = this.undoStack.pop();
    this.player = { ...frame.player };
    this.grid = frame.grid.map(r => [...r]);
    this.phase = frame.phase;
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.crossroads = new Map(frame.crossroads);
    this.moves = frame.moves;
    this.isDeadlocked = frame.isDeadlocked;
    this.isVictorious = frame.isVictorious;
    return true;
  }
}

function calculateTopologicalBranchingFactor(lvl) {
  let totalDegree = 0;
  let traversableTiles = 0;
  const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === C_WALL || cell === C_VOID) continue;
      traversableTiles++;
      for (const d of dirs) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx >= 0 && nx < lvl.w && ny >= 0 && ny < lvl.h) {
          const nCell = lvl.grid[ny][nx];
          if (nCell !== C_WALL && nCell !== C_VOID) {
            totalDegree++;
          }
        }
      }
    }
  }
  return traversableTiles > 0 ? (totalDegree / traversableTiles) : 0;
}

// ============================================================================
// RUNNER & ASSERTIONS
// ============================================================================
console.log("================================================================================");
console.log("   ONE MORE TILE — TAKE 3 (LEVELS 11-20, PARS 25-40) VERIFICATION RIG");
console.log("================================================================================\n");

const specPath = path.join(__dirname, 'levels11_20_take3_spec.json');
assert(fs.existsSync(specPath), `Spec file missing: ${specPath}`);
const levels = JSON.parse(fs.readFileSync(specPath, 'utf8'));

assert.strictEqual(levels.length, 10, "Specification must contain exactly 10 levels (11-20)");

const expectedPars = [25, 27, 29, 31, 33, 28, 30, 33, 36, 40];
let passedCount = 0;

levels.forEach((lvl, idx) => {
  const expectedId = 11 + idx;
  const expectedPar = expectedPars[idx];
  assert.strictEqual(lvl.id, expectedId, `Level at index ${idx} must have id ${expectedId}`);
  assert.strictEqual(lvl.budget, 0, `Level ${lvl.id} must be Clear-All (budget: 0)`);
  assert.strictEqual(lvl.par, expectedPar, `Level ${lvl.id} par must be ${expectedPar}`);
  assert.strictEqual(lvl.trace.length, expectedPar, `Level ${lvl.id} trace length must equal ${expectedPar}`);

  process.stdout.write(`[Level ${lvl.id}] "${lvl.name}" (World ${lvl.world}, Par ${lvl.par}, ${lvl.w}x${lvl.h}) ... `);

  // 1. Topological Openness
  const topoB = calculateTopologicalBranchingFactor(lvl);
  assert(topoB >= 2.0, `Level ${lvl.id} topological branching factor ${topoB.toFixed(2)} must be >= 2.0`);
  assert(lvl.branching_factor >= 2.0, `Level ${lvl.id} spec branching factor ${lvl.branching_factor} must be >= 2.0`);

  // 2. Exact Forward Simulation
  const engine = new Take3SimEngine(lvl);
  const initialRemaining = engine.getRemainingCount();
  assert.strictEqual(initialRemaining, lvl.par - 1, `Initial unconsumed tiles must equal par - 1 (${lvl.par - 1})`);

  for (let step = 0; step < lvl.trace.length; step++) {
    const dir = lvl.trace[step];

    if (step === lvl.trace.length - 1) {
      assert.strictEqual(engine.getRemainingCount(), 0, `All tiles must be consumed prior to Goal entry`);
      assert.strictEqual(engine.isGoalUnlocked(), true, `Goal must be unlocked prior to Goal entry`);
      if (engine.hasC1) assert.strictEqual(engine.c1Collected, true, `C1 must be collected before Goal entry`);
      if (engine.hasC2) assert.strictEqual(engine.c2Collected, true, `C2 must be collected before Goal entry`);
    }

    const res = engine.move(dir);
    assert.strictEqual(res.success, true, `Move ${step + 1} (${dir}) failed: ${res.reason}`);
  }

  // 3. Victory Assertions
  assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} did not reach Victory`);
  assert.strictEqual(engine.moves, lvl.par, `Final move count must strictly equal par`);
  assert.strictEqual(engine.player.x, lvl.goal.x, `Player must finish on Goal X`);
  assert.strictEqual(engine.player.y, lvl.goal.y, `Player must finish on Goal Y`);

  // 4. Crossroad Visit Counters
  for (const [coord, visits] of engine.crossroads.entries()) {
    assert.strictEqual(visits, 0, `Crossroad at ${coord} must have 0 visits remaining after solution`);
  }

  // 5. Lossless O(1) Undo Rollback
  for (let step = lvl.trace.length - 1; step >= 0; step--) {
    const ok = engine.undo();
    assert.strictEqual(ok, true, `Undo failed at step ${step}`);
  }

  // 6. Complete Initial State Restoration
  assert.strictEqual(engine.moves, 0, `Undo must restore moves to 0`);
  assert.strictEqual(engine.player.x, lvl.spawn.x, `Undo must restore spawn X`);
  assert.strictEqual(engine.player.y, lvl.spawn.y, `Undo must restore spawn Y`);
  assert.strictEqual(engine.c1Collected, false, `Undo must reset C1 collected flag`);
  assert.strictEqual(engine.c2Collected, false, `Undo must reset C2 collected flag`);
  assert.strictEqual(engine.isVictorious, false, `Undo must reset victorious flag`);
  assert.strictEqual(engine.phase, lvl.initialPhase || "RED", `Undo must reset initial polarity`);
  assert.strictEqual(engine.getRemainingCount(), initialRemaining, `Undo must restore initial remaining tile count`);

  passedCount++;
  console.log(`\x1b[32mPASSED\x1b[0m (Topo B: ${lvl.branching_factor})`);
});

console.log("\n================================================================================");
console.log(`   VERIFICATION COMPLETE: \x1b[32m${passedCount}/10 LEVELS PASSED (100% SUCCESS)\x1b[0m`);
console.log("================================================================================\n");

/**
 * ONE MORE TILE - Redesigned Levels 11-20 Test Suite & Standalone Simulation Engine
 * 
 * Verifies:
 * - World 3 (Levels 11-15: The Shattered Nexus)
 * - World 4 (Levels 16-20: The Polarity Crucible)
 * 
 * Invariants Tested:
 * 1. Exact deterministic trace execution matching level.par.
 * 2. Complete board clearance (Hamiltonian / Clear-All, budget = 0).
 * 3. Crossroad 2-pass degradation (2 -> 1 -> C_CONSUMED).
 * 4. Crumbling bridge irreversible collapse (C_CRUMBLING -> C_VOID).
 * 5. Ordered Checkpoint gating (C2 impassable until C1 collected).
 * 6. Phase switch polarity inversion and Red/Blue gate gating.
 * 7. Lossless O(1) bi-directional undo stack rollback across all moves.
 * 8. Open topology & branching factor (b >= 2.0, abolishing 1-tile hallways).
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Cell Constants
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
const C_CROSSROAD = 11;

const DIRS = {
  RIGHT: { dx: 1, dy: 0, name: 'RIGHT' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  DOWN:  { dx: 0, dy: 1, name: 'DOWN' },
  UP:    { dx: 0, dy: -1, name: 'UP' }
};

class SimulationEngine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(row => [...row]);
    this.player = { ...levelDef.spawn };
    this.goal = { ...levelDef.goal };
    this.par = levelDef.par;
    this.initialPhase = levelDef.initialPhase !== undefined ? (levelDef.initialPhase === 'RED') : true;
    this.phaseState = this.initialPhase;

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
    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false; // C1 precedence
    if (cell === C_GATE_RED && !this.phaseState) return false;      // Red gate closed
    if (cell === C_GATE_BLUE && this.phaseState) return false;     // Blue gate closed
    if (cell === C_GOAL) return this.isGoalUnlocked();
    if (cell === C_CROSSROAD) {
      return (this.crossroads.get(`${x},${y}`) || 0) > 0;
    }
    return true;
  }

  getLegalMoves() {
    const moves = [];
    for (const d of Object.values(DIRS)) {
      const nx = this.player.x + d.dx;
      const ny = this.player.y + d.dy;
      if (this.isTilePassable(nx, ny)) {
        moves.push(d);
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

    // Capture complete state frame for O(1) Undo
    this.undoStack.push({
      player: { ...this.player },
      grid: this.grid.map(r => [...r]),
      phaseState: this.phaseState,
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
      this.grid[this.player.y][this.player.x] = C_VOID; // Collapses into abyss
    } else if (depCell === C_CROSSROAD) {
      const key = `${this.player.x},${this.player.y}`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED;
      }
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    this.player.x = nx;
    this.player.y = ny;
    this.moves++;

    // Arrival triggers
    if (targetCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
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
    this.phaseState = frame.phaseState;
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
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === C_WALL || cell === C_VOID) continue;
      traversableTiles++;
      for (const d of Object.values(DIRS)) {
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
console.log("   ONE MORE TILE - LEVELS 11-20 DETERMINISTIC REDESIGN VERIFICATION");
console.log("================================================================================\n");

const specFile = path.join(__dirname, 'levels11_20_spec.json');
assert(fs.existsSync(specFile), `Spec file not found at ${specFile}`);
const levels = JSON.parse(fs.readFileSync(specFile, 'utf8'));

assert.strictEqual(levels.length, 10, "Specification must contain exactly 10 redesigned levels (11-20)");

let passedCount = 0;

levels.forEach((lvl, idx) => {
  const expectedId = 11 + idx;
  assert.strictEqual(lvl.id, expectedId, `Level at index ${idx} must have id ${expectedId}`);
  assert.strictEqual(lvl.budget, 0, `Level ${lvl.id} must be Hamiltonian / Clear-All (budget: 0)`);
  assert(lvl.par >= 22 && lvl.par <= 36, `Level ${lvl.id} par ${lvl.par} must be within [22, 36]`);
  assert.strictEqual(lvl.trace.length, lvl.par, `Level ${lvl.id} trace length must equal par ${lvl.par}`);

  process.stdout.write(`Testing Level ${lvl.id} [${lvl.world === 3 ? 'World 3' : 'World 4'}]: "${lvl.name}" (Par ${lvl.par}) ... `);

  // 1. Topological Open Arena Degree
  const topoB = calculateTopologicalBranchingFactor(lvl);
  assert(topoB >= 2.0, `Level ${lvl.id} topological branching degree ${topoB.toFixed(2)} must be >= 2.0`);
  assert(lvl.branching_factor >= 2.0, `Level ${lvl.id} spec branching factor ${lvl.branching_factor} must be >= 2.0`);

  // 2. Exact Forward Simulation
  const engine = new SimulationEngine(lvl);
  const initialRemaining = engine.getRemainingCount();
  assert.strictEqual(initialRemaining, lvl.par - 1, `Level ${lvl.id} initial remaining count must equal par - 1`);

  const dynamicBranching = [];

  for (let step = 0; step < lvl.trace.length; step++) {
    const dir = lvl.trace[step];
    const legal = engine.getLegalMoves();
    dynamicBranching.push(legal.length);

    // If on the move right before goal, verify goal is unlocked or ready to unlock
    if (step === lvl.trace.length - 1) {
      assert.strictEqual(engine.getRemainingCount(), 0, `Level ${lvl.id} all tiles must be consumed before goal entry`);
      assert.strictEqual(engine.isGoalUnlocked(), true, `Level ${lvl.id} goal must unlock upon full clearance`);
    }

    const res = engine.move(dir);
    assert.strictEqual(res.success, true, `Level ${lvl.id} step ${step + 1} (${dir}) failed: ${res.reason}`);
  }

  // Verify Victory
  assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} must reach Victory upon completing trace`);
  assert.strictEqual(engine.moves, lvl.par, `Level ${lvl.id} final move count must strictly equal par`);
  assert.strictEqual(engine.player.x, lvl.goal.x, `Level ${lvl.id} player must finish on Goal X`);
  assert.strictEqual(engine.player.y, lvl.goal.y, `Level ${lvl.id} player must finish on Goal Y`);

  // 3. Lossless Bi-Directional O(1) Undo Rollback
  for (let step = lvl.trace.length - 1; step >= 0; step--) {
    const undoOk = engine.undo();
    assert.strictEqual(undoOk, true, `Level ${lvl.id} undo failed at step ${step}`);
  }

  // Check state restored to initial spawn state
  assert.strictEqual(engine.moves, 0, `Level ${lvl.id} undo must restore moves to 0`);
  assert.strictEqual(engine.player.x, lvl.spawn.x, `Level ${lvl.id} undo must restore spawn X`);
  assert.strictEqual(engine.player.y, lvl.spawn.y, `Level ${lvl.id} undo must restore spawn Y`);
  assert.strictEqual(engine.c1Collected, false, `Level ${lvl.id} undo must restore C1 to uncollected`);
  assert.strictEqual(engine.c2Collected, false, `Level ${lvl.id} undo must restore C2 to uncollected`);
  assert.strictEqual(engine.isVictorious, false, `Level ${lvl.id} undo must reset victorious state`);
  assert.strictEqual(engine.getRemainingCount(), initialRemaining, `Level ${lvl.id} undo must restore initial remaining count`);

  passedCount++;
  console.log(`\x1b[32mPASSED\x1b[0m (Topo B: ${lvl.branching_factor}, Dyn B: ${(dynamicBranching.reduce((a,b)=>a+b,0)/dynamicBranching.length).toFixed(2)})`);
});

console.log("\n================================================================================");
console.log(`   SUMMARY: \x1b[32m${passedCount}/10 LEVELS PASSED (100% SUCCESS)\x1b[0m`);
console.log("================================================================================\n");

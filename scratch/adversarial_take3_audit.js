/**
 * ADVERSARIAL RED TEAM QA AUDIT SUITE: TAKE 3 (LEVELS 11-20)
 * 
 * Target: ONE MORE TILE (YouTube Playables)
 * Architecture: Take 3 (Levels 11-20, Pars 25 to 40)
 * Spec: scratch/levels11_20_take3_spec.json
 * 
 * Test Suites:
 * 1. ADVERSARIAL TRAP AUDIT (The "Think for a Minute" Consequence Proof)
 *    - Simulates greedy / autopilot mistakes across all 10 levels.
 *    - Asserts 100% trap efficacy (deadlock, locked gate, goal lockout, or stranded tiles).
 * 2. PAR SOLVABILITY & SEQUENTIAL INVARIANCE
 *    - Executes all 10 deterministic winning traces.
 *    - Asserts exact pars (25, 27, 29, 31, 33, 28, 30, 33, 36, 40).
 *    - Asserts zero unconsumed tiles remaining on Goal step.
 *    - Asserts strict sequential checkpoint order (C1 before C2).
 * 3. TOPOLOGICAL BRANCHING AUDIT
 *    - Calculates static topological degree b >= 2.2 across all 10 levels.
 *    - Calculates dynamic branching factor along solution traces.
 * 4. MECHANICS STATE MACHINE INVARIANTS
 *    - Crumbling Basalt (7 -> 0) collapse and reverse-step rejection.
 *    - Crossroads (11 -> 2 -> 1 -> 3) lifecycle and re-entry rejection.
 *    - Phase Switch (8) polarity toggle and Gate polarity synchronization.
 * 5. BI-DIRECTIONAL LOSSLESS UNDO ROLLBACK
 *    - Victory to Spawn 100% bit-for-bit state restoration.
 *    - Oscillating churn stress testing (Forward 5 -> Undo 3 -> Forward 7 -> Undo 9).
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
  UP:    { dx: 0, dy: -1 },
  DOWN:  { dx: 0, dy: 1 },
  LEFT:  { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 }
};

class AdversarialEngine {
  constructor(lvl) {
    this.lvl = lvl;
    this.w = lvl.w;
    this.h = lvl.h;
    this.grid = lvl.grid.map(r => [...r]);
    this.initialGrid = lvl.grid.map(r => [...r]);
    this.player = { ...lvl.spawn };
    this.goal = { ...lvl.goal };
    this.par = lvl.par;
    this.phase = lvl.initialPhase || "RED";
    this.initialPhase = this.phase;

    this.checkpoints = (lvl.checkpoints || []).map(c => ({ ...c }));
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
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
    if (cell === C_GATE_RED && this.phase === "RED") return false;
    if (cell === C_GATE_BLUE && this.phase === "BLUE") return false;
    if (cell === C_GOAL) return this.isGoalUnlocked();
    if (cell === C_CROSSROAD) return (this.crossroads.get(`${x},${y}`) || 0) > 0;
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
      const cell = (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h) ? this.grid[ny][nx] : -1;
      if (cell === C_GOAL && !this.isGoalUnlocked()) return { success: false, reason: 'GOAL_LOCKED' };
      if (cell === C_CHECKPOINT_2 && !this.c1Collected) return { success: false, reason: 'C2_LOCKED' };
      if (cell === C_GATE_RED && this.phase === "RED") return { success: false, reason: 'RED_GATE_CLOSED' };
      if (cell === C_GATE_BLUE && this.phase === "BLUE") return { success: false, reason: 'BLUE_GATE_CLOSED' };
      if (cell === C_CONSUMED) return { success: false, reason: 'CONSUMED_IMPASSABLE' };
      if (cell === C_VOID) return { success: false, reason: 'VOID_IMPASSABLE' };
      return { success: false, reason: 'IMPASSABLE' };
    }

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

    // Departure logic
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

function calculateTopologicalDegree(lvl) {
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

// Load specification
const specPath = path.join(__dirname, 'levels11_20_take3_spec.json');
assert(fs.existsSync(specPath), `Spec file missing: ${specPath}`);
const levels = JSON.parse(fs.readFileSync(specPath, 'utf8'));

console.log("================================================================================");
console.log("   ADVERSARIAL RED TEAM QA CERTIFICATION: TAKE 3 (LEVELS 11-20)");
console.log("================================================================================\n");

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  process.stdout.write(`[TEST ${String(totalTests).padStart(2, '0')}] ${name} ... `);
  try {
    fn();
    passedTests++;
    console.log(`\x1b[32mPASS\x1b[0m`);
  } catch (err) {
    console.log(`\x1b[31mFAIL\x1b[0m: ${err.message}`);
  }
}

// ============================================================================
// SUITE 1: ADVERSARIAL TRAP AUDIT (The "Think for a Minute" Consequence Proof)
// ============================================================================
console.log("\n--- SUITE 1: ADVERSARIAL TRAP AUDIT (The 'Think for a Minute' Consequence Proof) ---");

const trapDefinitions = [
  {
    id: 11,
    name: "Level 11: Basalt Snatch Cul-de-sac Trap",
    description: "Greedy turn DOWN from Basalt (4,0) to snatch C1 (4,1), stranding (5,0) into a dead-end with 0 exits",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN", "RIGHT", "UP"],
    expectedFailure: { deadlocked: true, minRemaining: 15 }
  },
  {
    id: 12,
    name: "Level 12: Instant Goal Rush Trap",
    description: "Premature move DOWN from spawn directly into adjacent locked Goal altar (0,1)",
    moves: ["DOWN"],
    expectedFailure: { reason: "GOAL_LOCKED", step: 1, minRemaining: 25 }
  },
  {
    id: 13,
    name: "Level 13: Premature C2 Shortcut (Crossroad Starvation)",
    description: "Turning UP from (4,4) directly to C2 (4,3), starving crossroad second visits and deadlocking at Goal",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "UP", "LEFT", "LEFT", "LEFT", "LEFT", "UP", "RIGHT"
    ],
    expectedFailure: { deadlocked: true, minRemaining: 2 }
  },
  {
    id: 14,
    name: "Level 14: C1 Bypass & C2 Lockout Impasse",
    description: "Cutting LEFT at (5,4) to bypass C1 (5,5), causing C2 (4,3) to remain strictly impassable",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "UP"
    ],
    expectedFailure: { reason: "C2_LOCKED", step: 11, minRemaining: 18 }
  },
  {
    id: 15,
    name: "Level 15: Premature Altar Plunge at Basalt Crossing",
    description: "Turning DOWN from Basalt (4,0) directly into Goal (4,1) with 32 unconsumed tiles",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN"],
    expectedFailure: { reason: "GOAL_LOCKED", step: 5, minRemaining: 28 }
  },
  {
    id: 16,
    name: "Level 16: Direct Charge into Locked Red Gate",
    description: "Attempting to rush south through closed Red Gate at (0,2) while initial polarity is RED",
    moves: ["DOWN", "DOWN"],
    expectedFailure: { deadlocked: true, minRemaining: 25 }
  },
  {
    id: 17,
    name: "Level 17: Polarity Switch Bypass & Red Gate Collision",
    description: "Skipping Switch at (2,4), keeping polarity RED, and crashing into closed Red Gate at (2,1)",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT", "UP", "RIGHT", "UP", "UP"
    ],
    expectedFailure: { reason: "RED_GATE_CLOSED", step: 21, minRemaining: 8 }
  },
  {
    id: 18,
    name: "Level 18: Switch 2 Bypass & Red Gate Collision",
    description: "Skipping Switch 2 at (0,5), leaving polarity RED, and crashing into closed Red Gate at (3,4)",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT", "RIGHT"
    ],
    expectedFailure: { reason: "RED_GATE_CLOSED", step: 17, minRemaining: 15 }
  },
  {
    id: 19,
    name: "Level 19: Out-of-Order C2 Intrusion before C1",
    description: "Entering Checkpoint 2 at (2,3) before collecting Checkpoint 1 at (5,5)",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT"
    ],
    expectedFailure: { reason: "C2_LOCKED", step: 13, minRemaining: 20 }
  },
  {
    id: 20,
    name: "Level 20: Basalt Collapse into Premature Goal Ambush",
    description: "Turning DOWN from Basalt (4,0) to (4,1) and trying to enter Goal (3,1) with 34 unconsumed tiles",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "LEFT"
    ],
    expectedFailure: { reason: "GOAL_LOCKED", step: 6, minRemaining: 30 }
  }
];

trapDefinitions.forEach(trap => {
  runTest(`Trap Certification: ${trap.name}`, () => {
    const lvl = levels.find(l => l.id === trap.id);
    assert(lvl, `Level ${trap.id} must exist in spec`);
    const engine = new AdversarialEngine(lvl);

    let failed = false;
    let failReason = null;
    let failStep = -1;

    for (let i = 0; i < trap.moves.length; i++) {
      const dir = trap.moves[i];
      const res = engine.move(dir);
      if (!res.success) {
        failed = true;
        failReason = res.reason;
        failStep = i + 1;
        break;
      }
    }

    // Must either produce an explicit rejection or result in deadlock
    if (trap.expectedFailure.reason) {
      assert.strictEqual(failed, true, `Trap should have triggered move rejection`);
      assert.strictEqual(failReason, trap.expectedFailure.reason, `Expected failure reason ${trap.expectedFailure.reason}`);
      assert.strictEqual(failStep, trap.expectedFailure.step, `Expected failure at step ${trap.expectedFailure.step}`);
    } else if (trap.expectedFailure.deadlocked) {
      assert(engine.isDeadlocked || failed, `Trap must lead to deadlock or move failure`);
    }

    assert(engine.getRemainingCount() >= trap.expectedFailure.minRemaining, 
      `Trap must strand unconsumed tiles (got ${engine.getRemainingCount()}, expected >= ${trap.expectedFailure.minRemaining})`);
  });
});

// ============================================================================
// SUITE 2: PAR SOLVABILITY & SEQUENTIAL INVARIANCE
// ============================================================================
console.log("\n--- SUITE 2: PAR SOLVABILITY & SEQUENTIAL INVARIANCE ---");

const expectedPars = [25, 27, 29, 31, 33, 28, 30, 33, 36, 40];

levels.forEach((lvl, idx) => {
  const expectedPar = expectedPars[idx];
  runTest(`Level ${lvl.id} ("${lvl.name}") Par ${lvl.par} Clear-All Victory`, () => {
    assert.strictEqual(lvl.par, expectedPar, `Par must be ${expectedPar}`);
    assert.strictEqual(lvl.trace.length, expectedPar, `Trace length must be ${expectedPar}`);
    assert.strictEqual(lvl.budget, 0, `Budget must be 0 (Clear-All)`);

    const engine = new AdversarialEngine(lvl);
    assert.strictEqual(engine.getRemainingCount(), lvl.par - 1, `Initial remaining count must be Par - 1`);

    let c1Step = -1;
    let c2Step = -1;

    for (let step = 0; step < lvl.trace.length; step++) {
      const dir = lvl.trace[step];

      // Prior to the final move onto Goal, assert preconditions
      if (step === lvl.trace.length - 1) {
        assert.strictEqual(engine.getRemainingCount(), 0, `All tiles must be consumed prior to Goal entry`);
        assert.strictEqual(engine.isGoalUnlocked(), true, `Goal must be unlocked prior to Goal entry`);
        if (engine.hasC1) assert.strictEqual(engine.c1Collected, true, `C1 must be collected before Goal entry`);
        if (engine.hasC2) assert.strictEqual(engine.c2Collected, true, `C2 must be collected before Goal entry`);
      }

      const res = engine.move(dir);
      assert.strictEqual(res.success, true, `Move ${step + 1} (${dir}) failed: ${res.reason}`);

      if (engine.c1Collected && c1Step === -1) c1Step = step;
      if (engine.c2Collected && c2Step === -1) c2Step = step;
    }

    assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} did not reach Victory`);
    assert.strictEqual(engine.moves, lvl.par, `Final moves must strictly equal par`);
    assert.strictEqual(engine.player.x, lvl.goal.x, `Player must finish on Goal X`);
    assert.strictEqual(engine.player.y, lvl.goal.y, `Player must finish on Goal Y`);

    // Checkpoint sequential invariance
    if (engine.hasC1 && engine.hasC2) {
      assert(c1Step !== -1 && c2Step !== -1, `Both C1 and C2 must be collected`);
      assert(c1Step < c2Step, `C1 (step ${c1Step}) must be collected strictly before C2 (step ${c2Step})`);
    }
  });
});

// ============================================================================
// SUITE 3: TOPOLOGICAL BRANCHING AUDIT
// ============================================================================
console.log("\n--- SUITE 3: TOPOLOGICAL BRANCHING AUDIT (b >= 2.2) ---");

levels.forEach(lvl => {
  runTest(`Level ${lvl.id} Topological Openness & Decision Density`, () => {
    const topoB = calculateTopologicalDegree(lvl);
    assert(topoB >= 2.2, `Topological branching factor ${topoB.toFixed(2)} must be >= 2.2`);
    assert(lvl.branching_factor >= 2.2, `Spec branching factor ${lvl.branching_factor} must be >= 2.2`);

    // Dynamic decision branching along solution trace
    const engine = new AdversarialEngine(lvl);
    let totalChoices = 0;
    for (let step = 0; step < lvl.trace.length; step++) {
      const legal = engine.getLegalMoves();
      totalChoices += legal.length;
      engine.move(lvl.trace[step]);
    }
    const avgDynamicChoices = totalChoices / lvl.trace.length;
    assert(avgDynamicChoices > 1.0, `Average dynamic choices ${avgDynamicChoices.toFixed(2)} must be > 1.0`);
  });
});

// ============================================================================
// SUITE 4: MECHANICS STATE MACHINE INVARIANTS
// ============================================================================
console.log("\n--- SUITE 4: MECHANICS STATE MACHINE INVARIANTS ---");

runTest("Crumbling Basalt Collapse to C_VOID & Reverse Step Rejection", () => {
  // Level 11 features Crumbling Basalt at (4,0)
  const lvl11 = levels.find(l => l.id === 11);
  const engine = new AdversarialEngine(lvl11);

  // Move to (4,0): RIGHT 4 times
  for (let i = 0; i < 4; i++) engine.move("RIGHT");
  assert.strictEqual(engine.player.x, 4);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.grid[0][4], C_CRUMBLING);

  // Step RIGHT to (5,0). (4,0) must collapse to C_VOID (0)
  engine.move("RIGHT");
  assert.strictEqual(engine.player.x, 5);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.grid[0][4], C_VOID, "Crumbling basalt must mutate to C_VOID (0) on departure");

  // Attempt reverse step LEFT back onto (4,0)
  const revRes = engine.move("LEFT");
  assert.strictEqual(revRes.success, false, "Reverse step onto collapsed basalt must be rejected");
  assert.strictEqual(revRes.reason, 'VOID_IMPASSABLE', "Failure reason must be VOID_IMPASSABLE");
  assert.strictEqual(engine.player.x, 5, "Player position must not change");
});

runTest("Crossroad 2-Pass Lifecycle (2 -> 1 -> C_CONSUMED) & Depletion Rejection", () => {
  // Level 11 features Crossroad at (3,2)
  const lvl11 = levels.find(l => l.id === 11);
  const engine = new AdversarialEngine(lvl11);
  const key = "3,2";

  assert.strictEqual(engine.crossroads.get(key), 2, "Crossroad must initialize with 2 visits");
  assert.strictEqual(engine.grid[2][3], C_CROSSROAD);

  // Trace moves until first arrival onto (3,2) (Move 19)
  for (let i = 0; i < 19; i++) engine.move(lvl11.trace[i]);
  assert.strictEqual(engine.player.x, 3);
  assert.strictEqual(engine.player.y, 2);

  // First departure: move RIGHT to (4,2) (Move 20)
  engine.move(lvl11.trace[19]);
  assert.strictEqual(engine.crossroads.get(key), 1, "Crossroad must have 1 visit after first departure");
  assert.strictEqual(engine.grid[2][3], C_CROSSROAD, "Crossroad cell must remain C_CROSSROAD (11) while visits > 0");

  // Follow trace through (4,1) -> (3,1) -> back to (3,2) on Move 23
  engine.move(lvl11.trace[20]); // UP to (4,1) [C1]
  engine.move(lvl11.trace[21]); // LEFT to (3,1)
  engine.move(lvl11.trace[22]); // DOWN to (3,2) [2nd visit]
  assert.strictEqual(engine.player.x, 3);
  assert.strictEqual(engine.player.y, 2);

  // Second departure: move LEFT to (2,2) (Move 24)
  engine.move(lvl11.trace[23]);
  assert.strictEqual(engine.crossroads.get(key), 0, "Crossroad visits must reach 0");
  assert.strictEqual(engine.grid[2][3], C_CONSUMED, "Crossroad must mutate to C_CONSUMED (3) upon second departure");

  // Attempt re-entry into depleted crossroad (move RIGHT back into 3,2)
  const reEntryRes = engine.move("RIGHT");
  assert.strictEqual(reEntryRes.success, false, "Re-entry into depleted crossroad must be rejected");
  assert.strictEqual(reEntryRes.reason, 'CONSUMED_IMPASSABLE');
});

runTest("Phase Switch Inversion & Gate Synchronization (Red vs Blue)", () => {
  // Level 16: Red Gate (0,2), Blue Gate (3,0), Switch (1,3)
  const lvl16 = levels.find(l => l.id === 16);
  const engine = new AdversarialEngine(lvl16);

  assert.strictEqual(engine.phase, "RED", "Initial phase must be RED");
  // In RED phase: Red Gate is closed, Blue Gate is open
  assert.strictEqual(engine.isTilePassable(0, 2), false, "Red gate (0,2) must be closed during RED phase");
  assert.strictEqual(engine.isTilePassable(3, 0), true, "Blue gate (3,0) must be open during RED phase");

  // Follow trace until stepping onto Switch at (1,3) (Move 16)
  for (let i = 0; i < 16; i++) engine.move(lvl16.trace[i]);
  assert.strictEqual(engine.player.x, 1);
  assert.strictEqual(engine.player.y, 3);
  assert.strictEqual(engine.phase, "BLUE", "Entering Switch must invert phase to BLUE");

  // In BLUE phase: Red Gate is open, Blue Gate is closed
  assert.strictEqual(engine.isTilePassable(0, 2), true, "Red gate (0,2) must be open during BLUE phase");
  assert.strictEqual(engine.isTilePassable(3, 0), false, "Blue gate (3,0) must be closed during BLUE phase");

  // Depart switch: move RIGHT to (2,3)
  engine.move("RIGHT");
  assert.strictEqual(engine.grid[3][1], C_CONSUMED, "Switch tile must mutate to C_CONSUMED (3) on departure");
});

runTest("Out-of-Order Checkpoint 2 Hard Invariant", () => {
  // Level 13: C1 at (5,0), C2 at (4,3)
  const lvl13 = levels.find(l => l.id === 13);
  const engine = new AdversarialEngine(lvl13);

  assert.strictEqual(engine.c1Collected, false);
  assert.strictEqual(engine.isTilePassable(4, 3), false, "C2 must be strictly impassable while C1 is uncollected");
});

// ============================================================================
// SUITE 5: BI-DIRECTIONAL LOSSLESS UNDO ROLLBACK
// ============================================================================
console.log("\n--- SUITE 5: BI-DIRECTIONAL LOSSLESS UNDO ROLLBACK ---");

levels.forEach(lvl => {
  runTest(`Level ${lvl.id} Complete Rollback from Victory to Spawn (Move 0)`, () => {
    const engine = new AdversarialEngine(lvl);
    const initialRemaining = engine.getRemainingCount();

    // 1. Solve to Victory
    for (let step = 0; step < lvl.trace.length; step++) {
      engine.move(lvl.trace[step]);
    }
    assert.strictEqual(engine.isVictorious, true);

    // 2. Full Undo Rollback
    for (let step = lvl.trace.length - 1; step >= 0; step--) {
      const ok = engine.undo();
      assert.strictEqual(ok, true, `Undo failed at step ${step}`);
    }

    // 3. Bit-for-Bit State Invariance Assertions
    assert.strictEqual(engine.moves, 0, `Moves must be 0`);
    assert.strictEqual(engine.player.x, lvl.spawn.x, `Player X must match spawn`);
    assert.strictEqual(engine.player.y, lvl.spawn.y, `Player Y must match spawn`);
    assert.strictEqual(engine.c1Collected, false, `C1 collected must reset`);
    assert.strictEqual(engine.c2Collected, false, `C2 collected must reset`);
    assert.strictEqual(engine.isVictorious, false, `Victory flag must reset`);
    assert.strictEqual(engine.isDeadlocked, false, `Deadlock flag must reset`);
    assert.strictEqual(engine.phase, lvl.initialPhase || "RED", `Phase polarity must restore`);
    assert.strictEqual(engine.getRemainingCount(), initialRemaining, `Remaining tiles must restore`);

    // Crossroad restore
    for (const [coord, visits] of engine.crossroads.entries()) {
      assert.strictEqual(visits, 2, `Crossroad at ${coord} must restore 2 visits`);
    }

    // Grid cell-for-cell restore
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        assert.strictEqual(engine.grid[y][x], engine.initialGrid[y][x], 
          `Grid cell (${x},${y}) mismatch after undo: got ${engine.grid[y][x]}, expected ${engine.initialGrid[y][x]}`);
      }
    }
  });
});

runTest("High-Churn Oscillating Undo Stress Test (Forward 5 -> Undo 3 -> Forward 7 -> Undo 9)", () => {
  const lvl20 = levels.find(l => l.id === 20);
  const engine = new AdversarialEngine(lvl20);
  const initialRemaining = engine.getRemainingCount();

  // Forward 5
  for (let i = 0; i < 5; i++) engine.move(lvl20.trace[i]);
  assert.strictEqual(engine.moves, 5);

  // Undo 3
  for (let i = 0; i < 3; i++) engine.undo();
  assert.strictEqual(engine.moves, 2);

  // Forward 7 (steps 2 to 8)
  for (let i = 2; i < 9; i++) engine.move(lvl20.trace[i]);
  assert.strictEqual(engine.moves, 9);

  // Undo 9 back to Spawn (Move 0)
  for (let i = 0; i < 9; i++) engine.undo();
  assert.strictEqual(engine.moves, 0);
  assert.strictEqual(engine.player.x, lvl20.spawn.x);
  assert.strictEqual(engine.player.y, lvl20.spawn.y);
  assert.strictEqual(engine.getRemainingCount(), initialRemaining);
  assert.strictEqual(engine.phase, "RED");
});

console.log("\n================================================================================");
console.log(`   AUDIT COMPLETE: \x1b[32m${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)\x1b[0m`);
console.log("================================================================================\n");

assert.strictEqual(passedTests, totalTests, "All adversarial tests must pass!");

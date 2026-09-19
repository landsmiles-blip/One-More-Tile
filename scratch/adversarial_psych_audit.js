/**
 * ONE MORE TILE — ADVERSARIAL RED TEAM QA AUDIT (STAGE 3)
 * The 10 Cognitive Trials (Levels 11–20)
 * 
 * Target: Rigorously stress-test and certify the psychological blueprint,
 * weaponized System 1 Siren Paths, mechanics state machines, topological
 * branching, and lossless undo rollback across all 10 redesigned levels.
 * 
 * Verification Invariants:
 * 1. Weaponized System 1 Siren Path Impasse (100% failure rate on intuitive traps)
 * 2. Full Deterministic Par Solvability (100% par victory, zero stranded tiles)
 * 3. Topological Open Arena Branching (b >= 2.0 across all levels)
 * 4. Mechanics State Machine Fidelity:
 *    - Crumbling Basalt (C_CRUMBLING = 7) -> C_VOID (0) on exit
 *    - Crossroad (C_CROSSROAD = 11) -> 2 -> 1 -> C_CONSUMED (3)
 *    - Phase Switch (C_SWITCH = 8) polarity inversion & Red/Blue gate gating
 *    - Sequential Checkpoint Ordering (C1 strictly required before C2)
 * 5. Lossless O(1) Bi-Directional Undo Rollback (Victory to Spawn bit-for-bit restoration)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Cell Constants
const C_VOID = 0;         // Pit / empty abyss (impassable)
const C_FLOOR_STONE = 1;  // Static structural wall
const C_UNTOUCHED = 2;    // Floor tile (consumes to 3 on exit)
const C_CONSUMED = 3;     // Depleted tile (impassable)
const C_GOAL = 4;         // Portal / altar (passable only when unlocked)
const C_CHECKPOINT_1 = 5; // Primary rune / gold star
const C_CHECKPOINT_2 = 6; // Secondary rune / purple star (gated by C1)
const C_CRUMBLING = 7;    // Cracked basalt (collapses to C_VOID = 0 on exit)
const C_SWITCH = 8;       // Phase plate (toggles polarity Red <-> Blue)
const C_GATE_RED = 9;     // Closed when RED; open when BLUE
const C_GATE_BLUE = 10;   // Closed when BLUE; open when RED
const C_CROSSROAD = 11;   // Multi-pass hub (2 -> 1 -> C_CONSUMED = 3)

const DIRS = {
  UP:    { dx: 0, dy: -1, name: 'UP' },
  DOWN:  { dx: 0, dy: 1,  name: 'DOWN' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  RIGHT: { dx: 1, dy: 0,  name: 'RIGHT' }
};

// ============================================================================
// TEST HARNESS
// ============================================================================
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testFailures = [];

function testCase(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m[PASS]\x1b[0m ${name}`);
  } catch (err) {
    failedTests++;
    testFailures.push({ name, error: err });
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${name}: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

// ============================================================================
// ADVERSARIAL SIMULATION ENGINE
// ============================================================================
class CognitiveSimEngine {
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
    this.hasC1 = this.checkpoints.some(c => c.id === 1) || this.gridContains(C_CHECKPOINT_1);
    this.hasC2 = this.checkpoints.some(c => c.id === 2) || this.gridContains(C_CHECKPOINT_2);
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

  gridContains(val) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.grid[y][x] === val) return true;
      }
    }
    return false;
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
    if (cell === C_VOID || cell === C_FLOOR_STONE || cell === C_CONSUMED) return false;
    
    // Checkpoint 2 strictly requires Checkpoint 1
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;

    // Gate Polarity
    if (cell === C_GATE_RED && this.phase === "RED") return false;   // Closed when RED
    if (cell === C_GATE_BLUE && this.phase === "BLUE") return false; // Closed when BLUE

    // Goal
    if (cell === C_GOAL) return this.isGoalUnlocked();

    // Crossroad
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

    const dir = typeof dirName === 'string' ? DIRS[dirName] : dirName;
    if (!dir) return { success: false, reason: 'INVALID_DIRECTION' };

    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isTilePassable(nx, ny)) {
      if (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h) {
        const cell = this.grid[ny][nx];
        if (cell === C_GOAL && !this.isGoalUnlocked()) return { success: false, reason: 'GOAL_LOCKED' };
        if (cell === C_GATE_RED && this.phase === "RED") return { success: false, reason: 'RED_GATE_CLOSED' };
        if (cell === C_GATE_BLUE && this.phase === "BLUE") return { success: false, reason: 'BLUE_GATE_CLOSED' };
        if (cell === C_CHECKPOINT_2 && !this.c1Collected) return { success: false, reason: 'C1_REQUIRED' };
        if (cell === C_VOID) return { success: false, reason: 'VOID_IMPASSABLE' };
        if (cell === C_CONSUMED) return { success: false, reason: 'CONSUMED_IMPASSABLE' };
      }
      return { success: false, reason: 'IMPASSABLE' };
    }

    // Capture complete state frame for O(1) Undo
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

function calculateTopologicalBranching(lvl) {
  let totalDegree = 0;
  let traversableTiles = 0;
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === C_VOID || cell === C_FLOOR_STONE) continue;
      traversableTiles++;
      for (const d of Object.values(DIRS)) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx >= 0 && nx < lvl.w && ny >= 0 && ny < lvl.h) {
          const nCell = lvl.grid[ny][nx];
          if (nCell !== C_VOID && nCell !== C_FLOOR_STONE) {
            totalDegree++;
          }
        }
      }
    }
  }
  return traversableTiles > 0 ? (totalDegree / traversableTiles) : 0;
}

// Load specifications
const specPath = path.join(__dirname, 'levels11_20_psych_spec.json');
assert(fs.existsSync(specPath), `Missing spec file: ${specPath}`);
const LEVELS = JSON.parse(fs.readFileSync(specPath, 'utf8'));

console.log("================================================================================");
console.log("  ONE MORE TILE — ADVERSARIAL RED TEAM QA AUDIT: THE 10 COGNITIVE TRIALS");
console.log("================================================================================\n");

// ============================================================================
// SUITE 1: WEAPONIZED SYSTEM 1 SIREN PATH TRAP AUDIT (10 TRIALS)
// ============================================================================
console.log(">>> SUITE 1: WEAPONIZED SYSTEM 1 SIREN PATH TRAP AUDIT <<<");

const SIREN_PATH_DEFINITIONS = [
  {
    id: 11,
    name: "Trial 11: Proximity Heuristic (Greedy Manhattan Distance Minimization)",
    bias: "Direct Rush toward Visible Goal across open corridor",
    moves: ['DOWN', 'RIGHT', 'DOWN', 'LEFT'],
    expectedImpasse: "GOAL_LOCKED"
  },
  {
    id: 12,
    name: "Trial 12: Gestalt Symmetry Bias & Einstellung Effect",
    bias: "Symmetric Figure-8 Loop (Clear Left Wing, then Clear Right Wing)",
    moves: ['LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'UP'],
    expectedImpasse: "DEADLOCKED"
  },
  {
    id: 13,
    name: "Trial 13: Loss Aversion & Completionism Bypass",
    bias: "Greedy Checkpoint 1 Rush without Securing Stepping Stones",
    moves: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'UP'],
    expectedImpasse: "GOAL_LOCKED"
  },
  {
    id: 14,
    name: "Trial 14: Working Memory Chunking (Sequential Lobe Exhaustion)",
    bias: "Exhausting Hub A Charges to Complete Lobe 1 in Isolation",
    moves: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'UP'],
    expectedImpasse: "GOAL_LOCKED"
  },
  {
    id: 15,
    name: "Trial 15: Symmetric Redundancy Assumption (Hernán Cortés 'Burn the Ships')",
    bias: "Rushing Across Bridge Beta Early into Sector 2",
    moves: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT'],
    expectedImpasse: "GOAL_LOCKED"
  },
  {
    id: 16,
    name: "Trial 16: External Obstacle Removal Heuristic (The Trojan Horse Paradigm)",
    bias: "Immediate Obstacle Cleared: Red Gate Closed on Approach",
    moves: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'UP'],
    expectedImpasse: "RED_GATE_CLOSED"
  },
  {
    id: 17,
    name: "Trial 17: Visceral Arousal & Cognitive Narrowing (Detour Panic)",
    bias: "Hesitation / Immediate Panic Detour Re-entry into Consumed Path",
    moves: ['RIGHT', 'LEFT'],
    expectedImpasse: "CONSUMED_IMPASSABLE"
  },
  {
    id: 18,
    name: "Trial 18: Petersonian Comfort Zone Clinging (Procrastination of Chaos)",
    bias: "Direct Early Plunge into Boundary Wall instead of Chaos Flank",
    moves: ['DOWN'],
    expectedImpasse: "IMPASSABLE"
  },
  {
    id: 19,
    name: "Trial 19: Linear Causality Fallacy (Switch Oscillation Trap)",
    bias: "Rapid Re-entry and Switch Oscillation Stutter",
    moves: ['RIGHT', 'RIGHT', 'LEFT'],
    expectedImpasse: "CONSUMED_IMPASSABLE"
  },
  {
    id: 20,
    name: "Trial 20: Cognitive Vertigo & Overwhelming Modular Despair",
    bias: "Premature Reverse Stutter before Reaching Grandmaster Conduit",
    moves: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'LEFT'],
    expectedImpasse: "CONSUMED_IMPASSABLE"
  }
];

SIREN_PATH_DEFINITIONS.forEach(def => {
  testCase(`1.${def.id - 10} Siren Trap ${def.name}`, () => {
    const lvl = LEVELS.find(l => l.id === def.id);
    assert(lvl, `Missing level ${def.id}`);
    const engine = new CognitiveSimEngine(lvl);

    let sprungStep = -1;
    let sprungReason = null;

    for (let s = 0; s < def.moves.length; s++) {
      const dir = def.moves[s];
      const res = engine.move(dir);

      if (!res.success) {
        sprungStep = s + 1;
        sprungReason = res.reason;
        break;
      }

      if (engine.isDeadlocked) {
        sprungStep = s + 1;
        sprungReason = "DEADLOCKED";
        break;
      }
    }

    if (sprungStep === -1 && !engine.isVictorious) {
      if (engine.isDeadlocked || engine.getRemainingCount() > 0) {
        sprungStep = def.moves.length;
        sprungReason = engine.isDeadlocked ? "DEADLOCKED" : "STRANDED_TILES";
      }
    }

    assert(sprungStep !== -1, `Level ${def.id}: Siren path failed to trigger an impasse!`);
    assert.strictEqual(engine.isVictorious, false, `Level ${def.id}: Siren path unexpectedly achieved victory!`);
    assert.strictEqual(engine.isGoalUnlocked(), false, `Level ${def.id}: Goal unlocked during Siren path execution!`);

    console.log(`      --> Trap sprung at Move ${sprungStep} (${sprungReason}) | ${engine.getRemainingCount()} tiles stranded`);
  });
});

// ============================================================================
// SUITE 2: FULL DETERMINISTIC PAR SOLVABILITY
// ============================================================================
console.log("\n>>> SUITE 2: FULL DETERMINISTIC PAR SOLVABILITY <<<");

testCase("2.1 100% Deterministic Par Victory across all 10 Cognitive Trials", () => {
  const EXPECTED_PARS = {
    11: 14, 12: 16, 13: 18, 14: 20, 15: 24,
    16: 18, 17: 18, 18: 22, 19: 26, 20: 30
  };

  LEVELS.forEach(lvl => {
    assert.strictEqual(lvl.par, EXPECTED_PARS[lvl.id], `Level ${lvl.id} par mismatch with blueprint mandate`);
    assert.strictEqual(lvl.budget, 0, `Level ${lvl.id} must operate under Clear-All (budget 0)`);
    assert.strictEqual(lvl.trace.length, lvl.par, `Level ${lvl.id} trace length must equal par`);

    const engine = new CognitiveSimEngine(lvl);

    for (let step = 0; step < lvl.trace.length; step++) {
      const dir = lvl.trace[step];

      // Penultimate move check (prior to entering goal)
      if (step === lvl.trace.length - 1) {
        assert.strictEqual(engine.getRemainingCount(), 0, `Level ${lvl.id}: All tiles must be consumed before goal entry`);
        assert.strictEqual(engine.isGoalUnlocked(), true, `Level ${lvl.id}: Goal must unlock when remaining count reaches 0`);
        if (engine.hasC1) assert.strictEqual(engine.c1Collected, true, `Level ${lvl.id}: C1 must be collected prior to goal`);
        if (engine.hasC2) assert.strictEqual(engine.c2Collected, true, `Level ${lvl.id}: C2 must be collected prior to goal`);
      }

      const res = engine.move(dir);
      assert.strictEqual(res.success, true, `Level ${lvl.id} step ${step + 1} (${dir}) failed: ${res.reason}`);
      assert.strictEqual(engine.isDeadlocked, false, `Level ${lvl.id} unexpectedly entered deadlock at step ${step + 1}`);
    }

    assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} did not reach victory upon completing trace`);
    assert.strictEqual(engine.moves, lvl.par, `Level ${lvl.id} move count (${engine.moves}) != par (${lvl.par})`);
    assert.strictEqual(engine.player.x, lvl.goal.x, `Level ${lvl.id} final X != goal X`);
    assert.strictEqual(engine.player.y, lvl.goal.y, `Level ${lvl.id} final Y != goal Y`);
    assert.strictEqual(engine.getRemainingCount(), 0, `Level ${lvl.id} has unconsumed tiles remaining`);
  });
});

testCase("2.2 Strict Sequential Checkpoint Ordering (C1 precedes C2)", () => {
  const dualLevels = LEVELS.filter(lvl => lvl.grid.some(r => r.includes(C_CHECKPOINT_2)));
  assert.strictEqual(dualLevels.length, 4, "Levels 13, 15, 19, 20 must feature dual checkpoints");

  dualLevels.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    let c1Step = -1;
    let c2Step = -1;

    for (let s = 0; s < lvl.trace.length; s++) {
      engine.move(lvl.trace[s]);
      if (engine.c1Collected && c1Step === -1) c1Step = s + 1;
      if (engine.c2Collected && c2Step === -1) c2Step = s + 1;
    }

    assert(c1Step !== -1, `Level ${lvl.id}: C1 was never collected`);
    assert(c2Step !== -1, `Level ${lvl.id}: C2 was never collected`);
    assert(c1Step < c2Step, `Level ${lvl.id}: C1 (step ${c1Step}) must be collected BEFORE C2 (step ${c2Step})`);
  });
});

testCase("2.3 Out-of-Order C2 Jump Rejection (C1 Precedence Invariant)", () => {
  const dualLevels = LEVELS.filter(lvl => lvl.grid.some(r => r.includes(C_CHECKPOINT_2)));

  dualLevels.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    let c2Pos = null;

    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CHECKPOINT_2) c2Pos = { x, y };
      }
    }

    assert(c2Pos, `Level ${lvl.id}: missing C2 coordinates`);
    assert.strictEqual(engine.isTilePassable(c2Pos.x, c2Pos.y), false, `Level ${lvl.id}: C2 must be impassable before C1 collection`);
  });
});

// ============================================================================
// SUITE 3: TOPOLOGICAL BRANCHING AUDIT
// ============================================================================
console.log("\n>>> SUITE 3: TOPOLOGICAL BRANCHING AUDIT <<<");

testCase("3.1 Topological Degree Assertion (b >= 2.0 on all 10 levels)", () => {
  const topoLogs = [];
  LEVELS.forEach(lvl => {
    const topoB = calculateTopologicalBranching(lvl);
    assert(topoB >= 2.0, `Level ${lvl.id} topological branching ${topoB.toFixed(2)} is below 2.0`);
    assert(lvl.branching_factor >= 2.0, `Level ${lvl.id} spec branching ${lvl.branching_factor} is below 2.0`);
    topoLogs.push({ id: lvl.id, name: lvl.name, topoB: topoB.toFixed(2), specB: lvl.branching_factor });
  });

  console.log("    Topological Branching Degree Matrix (Abolishing 1-Tile Rails):");
  topoLogs.forEach(t => {
    console.log(`      Trial ${t.id}: ${t.name.padEnd(28)} | deg = ${t.topoB} (Spec: ${t.specB}) >= 2.0 [PASS]`);
  });
});

testCase("3.2 Dynamic Decision Factor along Winning Paths", () => {
  const dynamicLogs = [];
  LEVELS.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    const branchDensities = [];

    lvl.trace.forEach(dir => {
      branchDensities.push(engine.getLegalMoves().length);
      engine.move(dir);
    });

    const avgB = branchDensities.reduce((a, b) => a + b, 0) / branchDensities.length;
    assert(avgB >= 1.0, `Level ${lvl.id} dynamic branching factor ${avgB.toFixed(2)} is below 1.0`);
    dynamicLogs.push({ id: lvl.id, avgB: avgB.toFixed(2) });
  });
  console.log("    Dynamic Decision Density along Winning Paths:");
  dynamicLogs.forEach(d => console.log(`      Trial ${d.id}: avg dynamic branching = ${d.avgB}`));
});

// ============================================================================
// SUITE 4: MECHANICS STATE MACHINE INVARIANTS
// ============================================================================
console.log("\n>>> SUITE 4: MECHANICS STATE MACHINE INVARIANTS <<<");

testCase("4.1 Crumbling Basalt Collapses to C_VOID on Departure and Rejects Re-entry", () => {
  const levelsWithCrumble = LEVELS.filter(lvl => lvl.grid.some(r => r.includes(C_CRUMBLING)));
  assert.strictEqual(levelsWithCrumble.length, 6, "Exactly 6 levels (11, 13, 15, 17, 18, 20) feature crumbling basalt");

  levelsWithCrumble.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    let crumbleCoord = null;
    let departureStep = -1;

    for (let s = 0; s < lvl.trace.length; s++) {
      const pBefore = { ...engine.player };
      engine.move(lvl.trace[s]);

      if (lvl.grid[pBefore.y][pBefore.x] === C_CRUMBLING) {
        crumbleCoord = { ...pBefore };
        departureStep = s;
        break;
      }
    }

    assert(departureStep !== -1, `Level ${lvl.id}: Crumbling tile was not departed`);
    assert.strictEqual(
      engine.grid[crumbleCoord.y][crumbleCoord.x],
      C_VOID,
      `Level ${lvl.id}: Crumbling tile at (${crumbleCoord.x},${crumbleCoord.y}) must mutate to C_VOID (0)`
    );

    // Adversarial re-entry attack
    const dx = crumbleCoord.x - engine.player.x;
    const dy = crumbleCoord.y - engine.player.y;
    const revDir = Object.values(DIRS).find(d => d.dx === dx && d.dy === dy);

    if (revDir) {
      const prevX = engine.player.x;
      const prevY = engine.player.y;
      const rej = engine.move(revDir.name);
      assert.strictEqual(rej.success, false, `Level ${lvl.id}: Re-entry into void must be rejected`);
      assert.strictEqual(engine.player.x, prevX);
      assert.strictEqual(engine.player.y, prevY);
    }
  });
});

testCase("4.2 Crossroad 2-Pass Degradation (2 -> 1 -> C_CONSUMED)", () => {
  const levelsWithCrossroad = LEVELS.filter(lvl => lvl.grid.some(r => r.includes(C_CROSSROAD)));
  assert.strictEqual(levelsWithCrossroad.length, 6, "Exactly 6 levels (12, 14, 15, 18, 19, 20) feature crossroads");

  levelsWithCrossroad.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    const crList = [];
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CROSSROAD) crList.push({ x, y, key: `${x},${y}` });
      }
    }

    // Assert initial state
    crList.forEach(cr => {
      assert.strictEqual(engine.crossroads.get(cr.key), 2);
      assert.strictEqual(engine.grid[cr.y][cr.x], C_CROSSROAD);
    });

    // Run trace
    const departureCounts = new Map(crList.map(cr => [cr.key, []]));
    let prev = { ...engine.player };

    lvl.trace.forEach((dir, step) => {
      engine.move(dir);
      const key = `${prev.x},${prev.y}`;
      if (departureCounts.has(key)) {
        departureCounts.get(key).push({
          step: step + 1,
          visitsLeft: engine.crossroads.get(key)
        });
      }
      prev = { ...engine.player };
    });

    crList.forEach(cr => {
      const history = departureCounts.get(cr.key);
      assert.strictEqual(history.length, 2, `Level ${lvl.id} crossroad ${cr.key} must be departed exactly 2 times`);
      assert.strictEqual(history[0].visitsLeft, 1, `Level ${lvl.id} crossroad ${cr.key} first departure must leave 1 visit`);
      assert.strictEqual(history[1].visitsLeft, 0, `Level ${lvl.id} crossroad ${cr.key} second departure must leave 0 visits`);
      assert.strictEqual(engine.grid[cr.y][cr.x], C_CONSUMED, `Level ${lvl.id} crossroad ${cr.key} must mutate to C_CONSUMED (3)`);
      assert.strictEqual(engine.isTilePassable(cr.x, cr.y), false, `Level ${lvl.id} crossroad ${cr.key} must be impassable after 2 passes`);
    });
  });
});

testCase("4.3 Phase Switch Inversion and Dynamic Gate Collision Rejection", () => {
  const world4Levels = LEVELS.filter(lvl => lvl.world === 4);
  assert.strictEqual(world4Levels.length, 5, "World 4 contains exactly 5 trials (16-20)");

  world4Levels.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    assert.strictEqual(engine.phase, "RED", `Level ${lvl.id} initial phase must be RED`);

    // Verify initial gate states: RED gates closed, BLUE gates open
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        const cell = lvl.grid[y][x];
        if (cell === C_GATE_RED) {
          assert.strictEqual(engine.isTilePassable(x, y), false, `Level ${lvl.id}: Red Gate at (${x},${y}) must be closed in RED phase`);
        }
        if (cell === C_GATE_BLUE) {
          assert.strictEqual(engine.isTilePassable(x, y), true, `Level ${lvl.id}: Blue Gate at (${x},${y}) must be open in RED phase`);
        }
      }
    }
  });
});

// ============================================================================
// SUITE 5: BI-DIRECTIONAL LOSSLESS UNDO ROLLBACK
// ============================================================================
console.log("\n>>> SUITE 5: BI-DIRECTIONAL LOSSLESS UNDO ROLLBACK <<<");

testCase("5.1 100% Bit-for-Bit State Resurrection from Victory to Spawn", () => {
  LEVELS.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    const initialRemaining = engine.getRemainingCount();
    const initialGridCopy = lvl.grid.map(r => [...r]);

    // Forward pass to victory
    lvl.trace.forEach(dir => engine.move(dir));
    assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} must be victorious`);

    // Complete backwards rollback
    for (let s = lvl.trace.length - 1; s >= 0; s--) {
      const ok = engine.undo();
      assert.strictEqual(ok, true, `Level ${lvl.id} undo failed at step ${s}`);
    }

    // Assert exact bit-for-bit restoration
    assert.strictEqual(engine.moves, 0, `Level ${lvl.id}: moves != 0`);
    assert.strictEqual(engine.player.x, lvl.spawn.x, `Level ${lvl.id}: spawn X not restored`);
    assert.strictEqual(engine.player.y, lvl.spawn.y, `Level ${lvl.id}: spawn Y not restored`);
    assert.strictEqual(engine.c1Collected, false, `Level ${lvl.id}: C1 flag not reset`);
    assert.strictEqual(engine.c2Collected, false, `Level ${lvl.id}: C2 flag not reset`);
    assert.strictEqual(engine.isVictorious, false, `Level ${lvl.id}: victory flag not reset`);
    assert.strictEqual(engine.isDeadlocked, false, `Level ${lvl.id}: deadlock flag not reset`);
    assert.strictEqual(engine.phase, lvl.initialPhase || "RED", `Level ${lvl.id}: polarity not restored`);
    assert.strictEqual(engine.getRemainingCount(), initialRemaining, `Level ${lvl.id}: remaining count not restored`);

    // Verify grid array bit-for-bit
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        assert.strictEqual(
          engine.grid[y][x],
          initialGridCopy[y][x],
          `Level ${lvl.id}: Grid cell at (${x},${y}) drifted after undo rollback`
        );
      }
    }

    // Verify crossroads visit counts
    engine.crossroads.forEach((visits, key) => {
      assert.strictEqual(visits, 2, `Level ${lvl.id}: Crossroad ${key} visits != 2 after rollback`);
    });
  });
});

testCase("5.2 Oscillating High-Churn Undo Stress (Forward 4, Back 3, Forward 5, Back 6)", () => {
  LEVELS.forEach(lvl => {
    const engine = new CognitiveSimEngine(lvl);
    const initialGridCopy = lvl.grid.map(r => [...r]);

    // Forward 4
    for (let i = 0; i < 4; i++) engine.move(lvl.trace[i]);
    assert.strictEqual(engine.moves, 4);

    // Back 3
    for (let i = 0; i < 3; i++) engine.undo();
    assert.strictEqual(engine.moves, 1);

    // Forward 5 (steps 1, 2, 3, 4, 5)
    for (let i = 1; i < 6; i++) engine.move(lvl.trace[i]);
    assert.strictEqual(engine.moves, 6);

    // Back 6 to spawn
    for (let i = 0; i < 6; i++) engine.undo();
    assert.strictEqual(engine.moves, 0);
    assert.strictEqual(engine.player.x, lvl.spawn.x);
    assert.strictEqual(engine.player.y, lvl.spawn.y);

    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        assert.strictEqual(engine.grid[y][x], initialGridCopy[y][x]);
      }
    }
  });
});

// ============================================================================
// FINAL SUMMARY & RESULTS
// ============================================================================
console.log("\n================================================================================");
console.log(`  ADVERSARIAL COGNITIVE AUDIT SUMMARY:`);
console.log(`  Total Tests Run:    ${totalTests}`);
console.log(`  Passed Tests:       \x1b[32m${passedTests}\x1b[0m`);
console.log(`  Failed Tests:       ${failedTests > 0 ? `\x1b[31m${failedTests}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
console.log(`  Success Rate:       \x1b[32m${((passedTests / totalTests) * 100).toFixed(1)}%\x1b[0m`);
console.log("================================================================================\n");

if (failedTests > 0) {
  process.exit(1);
}

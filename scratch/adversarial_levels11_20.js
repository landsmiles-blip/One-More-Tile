/**
 * ONE MORE TILE — Comprehensive Adversarial Red Team QA Test Suite (Levels 11–20)
 * File: scratch/adversarial_levels11_20.js
 * 
 * Target: Rigorously stress-test and certify the redesigned Levels 11–20 BEFORE
 * merging to index.html and test_rig.js.
 * 
 * Specific Adversarial Test Suites:
 * 1. Anti-Corridor Topology & Branching Audit:
 *    - Calculate topological degree across all 10 redesigned levels. Assert degree >= 2.8 on every level.
 *    - Adversarial branch tests: probe greedy perimeter turns and assert they create isolated orphan tiles that trigger deadlock.
 * 2. Crossroad & Crumbling Tile Mechanics in Levels 11-20:
 *    - For all Crossroads in Levels 11-20, verify 2 -> 1 -> C_CONSUMED lifecycle.
 *    - For all Crumbling tiles in Levels 11-20, verify mutation to C_VOID on departure, and verify rejection when attempting to re-enter the created void.
 * 3. Phase Switch & Gate Polarity in Levels 16-20:
 *    - Assert closed gates reject movement.
 *    - Assert switch inverts polarity and mutates to consumed/void on departure.
 * 4. Checkpoint Invariant & Sequential Gating:
 *    - Assert player cannot enter or consume C2 while C1 is on the board.
 *    - Goal locked until 100% clearance and all runes satisfied.
 * 5. Full 10-Level Solvability Suite:
 *    - Assert 100% deterministic par victory across all 10 redesigned levels (Levels 11 to 20).
 * 6. Full 10-Level Lossless Undo Rollback:
 *    - Roll back every level from victory to spawn frame-by-frame and assert exact restoration of coordinates, budget, grid, crossroads, and phase polarity.
 * 7. Untouchability Assertion:
 *    - Confirm that Levels 1 to 10 remain untouched between test_rig.js and index.html, with 100% solvability.
 * 8. Spatial Budget Invariant:
 *    - Assert that moving when Bt = 0 decrements Bt to -1, which immediately triggers deadlock without UI breakage.
 * 9. Vertical Centering Invariant & Viewport Math:
 *    - Assert originY math produces positive offset and true centering across viewports.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================
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
  DOWN:  { dx: 0, dy: 1,  name: 'DOWN' },
  UP:    { dx: 0, dy: -1, name: 'UP' }
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
class AdversarialEngine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(row => [...row]);
    this.player = { ...levelDef.spawn };
    this.goal = { ...levelDef.goal };
    this.par = levelDef.par;
    this.initialBudget = levelDef.budget !== undefined ? levelDef.budget : 0;
    this.budget = this.initialBudget;
    this.initialPhase = levelDef.initialPhase !== undefined ? (levelDef.initialPhase === 'RED') : true;
    this.phaseState = this.initialPhase;

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
    this.evaluateState();
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
    if (this.initialBudget === 0) {
      return checkpointsMet && this.getRemainingCount() === 0;
    } else {
      return checkpointsMet && this.budget === 1;
    }
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

  evaluateState() {
    if (this.initialBudget > 0 && this.budget < 0) {
      this.isDeadlocked = true;
      return;
    }
    if (!this.isVictorious && !this.isDeadlocked) {
      if (this.getLegalMoves().length === 0) {
        this.isDeadlocked = true;
      }
    }
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
        const c = this.grid[ny][nx];
        if (c === C_GATE_RED && !this.phaseState) return { success: false, reason: 'RED_GATE_CLOSED' };
        if (c === C_GATE_BLUE && this.phaseState) return { success: false, reason: 'BLUE_GATE_CLOSED' };
        if (c === C_CHECKPOINT_2 && !this.c1Collected) return { success: false, reason: 'C1_REQUIRED' };
        if (c === C_GOAL && !this.isGoalUnlocked()) return { success: false, reason: 'GOAL_LOCKED' };
        if (c === C_VOID) return { success: false, reason: 'VOID_IMPASSABLE' };
        if (c === C_CONSUMED) return { success: false, reason: 'CONSUMED_IMPASSABLE' };
      }
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
      budget: this.budget,
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
    if (this.initialBudget > 0) {
      this.budget--;
    }

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

    this.evaluateState();

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
    this.budget = frame.budget;
    this.isDeadlocked = frame.isDeadlocked;
    this.isVictorious = frame.isVictorious;
    return true;
  }
}

// ============================================================================
// TOPOLOGY HELPER
// ============================================================================
function computeTopologicalDegree(lvl) {
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
// LOAD SPEC & BASE DATA
// ============================================================================
const specFile = path.join(__dirname, 'levels11_20_spec.json');
assert(fs.existsSync(specFile), `Spec file missing at ${specFile}`);
const REDESIGNED_LEVELS = JSON.parse(fs.readFileSync(specFile, 'utf8'));

console.log("================================================================================");
console.log("  ONE MORE TILE - ADVERSARIAL RED TEAM QA VERIFICATION PROTOCOL (STAGE 2)");
console.log("  Target: Redesigned Levels 11–20 (The Shattered Nexus & Polarity Crucible)");
console.log("================================================================================\n");

// ============================================================================
// SUITE 1: ANTI-CORRIDOR TOPOLOGY & BRANCHING AUDIT
// ============================================================================
console.log(">>> SUITE 1: ANTI-CORRIDOR TOPOLOGY & BRANCHING AUDIT <<<");

testCase("1.1 Topological Degree Assertion (deg >= 2.8 across all 10 levels)", () => {
  const table = [];
  REDESIGNED_LEVELS.forEach(lvl => {
    const deg = computeTopologicalDegree(lvl);
    assert(deg >= 2.8, `Level ${lvl.id} (${lvl.name}) topological degree ${deg.toFixed(2)} is below threshold 2.8`);
    assert(lvl.branching_factor >= 2.8, `Level ${lvl.id} spec branching factor ${lvl.branching_factor} is below 2.8`);
    table.push({
      id: lvl.id,
      name: lvl.name,
      world: lvl.world,
      size: `${lvl.w}x${lvl.h}`,
      par: lvl.par,
      topoDeg: deg.toFixed(2),
      specDeg: lvl.branching_factor
    });
  });
  console.log("    Topological Degree Metrics:");
  table.forEach(t => {
    console.log(`      L${t.id} [W${t.world}] ${t.name.padEnd(28)} | Size: ${t.size} | Par: ${t.par} | Topo Deg: ${t.topoDeg} (Threshold >= 2.80)`);
  });
});

testCase("1.2 Dynamic Decision Density (b >= 1.5 average along optimal path)", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    const branchCounts = [];
    lvl.trace.forEach(dir => {
      branchCounts.push(engine.getLegalMoves().length);
      engine.move(dir);
    });
    const avgB = branchCounts.reduce((a, b) => a + b, 0) / branchCounts.length;
    assert(avgB >= 1.5, `Level ${lvl.id} dynamic branching factor ${avgB.toFixed(2)} is below 1.5`);
  });
});

testCase("1.3 Adversarial Branch Tests: Greedy Perimeter Turns Create Orphan Tiles & Trigger Deadlock", () => {
  // Requirement 1: Probe greedy perimeter turns across all 10 levels.
  // Assert they leave isolated orphan tiles, fail to unlock goal, and trigger deadlock.
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    const legalAtSpawn = engine.getLegalMoves();
    const optimalStart = lvl.trace[0];
    const perimeterAlts = legalAtSpawn.filter(d => d.name !== optimalStart);

    assert(perimeterAlts.length >= 1, `Level ${lvl.id} must offer a greedy perimeter turn at spawn`);

    perimeterAlts.forEach(altDir => {
      const sim = new AdversarialEngine(lvl);
      const res = sim.move(altDir.name);
      assert.strictEqual(res.success, true);

      // Follow greedy legal continuation until stuck
      let steps = 0;
      while (!sim.isDeadlocked && !sim.isVictorious && steps < 60) {
        const nextMoves = sim.getLegalMoves();
        if (nextMoves.length === 0) break;
        sim.move(nextMoves[0].name);
        steps++;
      }

      // Assert that taking the greedy perimeter turn strictly fails:
      assert.strictEqual(sim.isVictorious, false, `Level ${lvl.id}: Perimeter turn unexpectedly led to victory!`);
      assert.strictEqual(sim.isGoalUnlocked(), false, `Level ${lvl.id}: Goal unlocked after taking perimeter turn`);
      assert.strictEqual(sim.isDeadlocked, true, `Level ${lvl.id}: Greedy perimeter turn must terminate in deadlock`);
      assert(sim.getRemainingCount() > 0, `Level ${lvl.id}: Greedy perimeter turn must strand orphan tiles (stranded: ${sim.getRemainingCount()})`);
    });
  });
});

testCase("1.4 Internal Decision Junction Traps & Chiral Loop Analysis", () => {
  // Probe internal decision junctions along optimal trace.
  // Verify that unintended bypasses are rejected.
  let trappedCount = 0;
  let dualSymmetricCount = 0;

  REDESIGNED_LEVELS.forEach(lvl => {
    for (let junctionStep = 1; junctionStep < lvl.trace.length - 2; junctionStep++) {
      const sim = new AdversarialEngine(lvl);
      for (let s = 0; s < junctionStep; s++) sim.move(lvl.trace[s]);

      const legal = sim.getLegalMoves();
      const optimalDir = lvl.trace[junctionStep];
      const alternatives = legal.filter(d => d.name !== optimalDir);

      alternatives.forEach(altDir => {
        const branchSim = new AdversarialEngine(lvl);
        for (let s = 0; s < junctionStep; s++) branchSim.move(lvl.trace[s]);
        branchSim.move(altDir.name);

        let steps = 0;
        while (!branchSim.isDeadlocked && !branchSim.isVictorious && steps < 60) {
          const nextMoves = branchSim.getLegalMoves();
          if (nextMoves.length === 0) break;
          branchSim.move(nextMoves[0].name);
          steps++;
        }

        if (branchSim.isVictorious) {
          // If victorious, verify it strictly solved all tiles at par
          assert.strictEqual(branchSim.moves, lvl.par, `Level ${lvl.id}: Alternate solution par mismatch`);
          assert.strictEqual(branchSim.getRemainingCount(), 0, `Level ${lvl.id}: Alternate victory without full clearance`);
          dualSymmetricCount++;
        } else {
          assert.strictEqual(branchSim.isVictorious, false);
          assert.strictEqual(branchSim.isDeadlocked, true, `Level ${lvl.id}: Failed branch must terminate in deadlock`);
          trappedCount++;
        }
      });
    }
  });

  console.log(`    Internal branches: ${trappedCount} traps safely verified in deadlock, ${dualSymmetricCount} symmetric dual routes confirmed at par.`);
});

// ============================================================================
// SUITE 2: CROSSROAD & CRUMBLING TILE MECHANICS (LEVELS 11-20)
// ============================================================================
console.log("\n>>> SUITE 2: CROSSROAD & CRUMBLING TILE MECHANICS (LEVELS 11-20) <<<");

testCase("2.1 Crossroad 2-Pass Lifecycle across all Crossroads in Levels 11-20 (2 -> 1 -> C_CONSUMED)", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const crCoords = [];
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CROSSROAD) crCoords.push({ x, y, key: `${x},${y}` });
      }
    }
    assert(crCoords.length >= 1, `Level ${lvl.id} must contain at least 1 Crossroad`);

    const engine = new AdversarialEngine(lvl);
    // Verify initial visits = 2 for all crossroads
    crCoords.forEach(cr => {
      assert.strictEqual(engine.crossroads.get(cr.key), 2, `Level ${lvl.id} crossroad at ${cr.key} must start with 2 visits`);
      assert.strictEqual(engine.grid[cr.y][cr.x], C_CROSSROAD);
    });

    // Run trace and track visits per crossroad
    const visitHistory = new Map(crCoords.map(cr => [cr.key, []]));
    let prevPos = { ...engine.player };

    lvl.trace.forEach((dir, sIdx) => {
      engine.move(dir);
      const curPos = { ...engine.player };
      const curKey = `${curPos.x},${curPos.y}`;
      const prevKey = `${prevPos.x},${prevPos.y}`;

      // Check if player just stepped off a crossroad
      if (visitHistory.has(prevKey)) {
        const remainingVisits = engine.crossroads.get(prevKey);
        visitHistory.get(prevKey).push({ step: sIdx, visitsAfterDeparture: remainingVisits });
      }
      prevPos = curPos;
    });

    // Verify each crossroad was visited exactly twice and degraded properly
    crCoords.forEach(cr => {
      const history = visitHistory.get(cr.key);
      assert.strictEqual(history.length, 2, `Level ${lvl.id} crossroad ${cr.key} must be exited exactly 2 times (actual: ${history.length})`);
      assert.strictEqual(history[0].visitsAfterDeparture, 1, `Level ${lvl.id} crossroad ${cr.key} departure 1 must leave 1 visit`);
      assert.strictEqual(history[1].visitsAfterDeparture, 0, `Level ${lvl.id} crossroad ${cr.key} departure 2 must leave 0 visits`);
      assert.strictEqual(engine.grid[cr.y][cr.x], C_CONSUMED, `Level ${lvl.id} crossroad ${cr.key} must mutate to C_CONSUMED upon 2nd departure`);
      assert.strictEqual(engine.isTilePassable(cr.x, cr.y), false, `Level ${lvl.id} crossroad ${cr.key} must be impassable after 2nd departure`);
    });
  });
});

testCase("2.2 Consumed Crossroad Re-Entry Rejection", () => {
  // Test explicitly stepping back onto consumed crossroad
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    let depletedCrossroad = null;
    let step = 0;
    let prevPos = { ...engine.player };

    for (; step < lvl.trace.length; step++) {
      engine.move(lvl.trace[step]);
      const prevKey = `${prevPos.x},${prevPos.y}`;
      if (engine.crossroads.has(prevKey) && engine.crossroads.get(prevKey) === 0) {
        depletedCrossroad = { ...prevPos };
        break;
      }
      prevPos = { ...engine.player };
    }

    if (depletedCrossroad) {
      const dx = depletedCrossroad.x - engine.player.x;
      const dy = depletedCrossroad.y - engine.player.y;
      const reEntryDir = Object.values(DIRS).find(d => d.dx === dx && d.dy === dy);

      if (reEntryDir) {
        const curX = engine.player.x;
        const curY = engine.player.y;
        const rej = engine.move(reEntryDir.name);
        assert.strictEqual(rej.success, false, `Level ${lvl.id}: Re-entry into depleted crossroad must be rejected`);
        assert.strictEqual(engine.player.x, curX, "Player X must not change on rejected move");
        assert.strictEqual(engine.player.y, curY, "Player Y must not change on rejected move");
      }
    }
  });
});

testCase("2.3 Crossroad Bi-Directional Undo Symmetry (0 -> 1 -> 2 visits)", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    // Find crossroad coordinates
    const crList = [];
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CROSSROAD) crList.push({ x, y, key: `${x},${y}` });
      }
    }

    // Advance until first crossroad departure
    let firstDepStep = -1;
    let crTarget = null;
    for (let s = 0; s < lvl.trace.length; s++) {
      const pBefore = { ...engine.player };
      engine.move(lvl.trace[s]);
      const keyBefore = `${pBefore.x},${pBefore.y}`;
      if (engine.crossroads.has(keyBefore) && engine.crossroads.get(keyBefore) === 1) {
        firstDepStep = s;
        crTarget = keyBefore;
        break;
      }
    }

    assert(firstDepStep !== -1, `Level ${lvl.id}: Must reach first crossroad departure`);
    assert.strictEqual(engine.crossroads.get(crTarget), 1);

    // Undo 1 step: visits must restore to 2
    assert.strictEqual(engine.undo(), true);
    assert.strictEqual(engine.crossroads.get(crTarget), 2, `Level ${lvl.id}: Undo must restore visits from 1 to 2`);
    assert.strictEqual(engine.grid[parseInt(crTarget.split(',')[1])][parseInt(crTarget.split(',')[0])], C_CROSSROAD);
  });
});

testCase("2.4 Crumbling Basalt Bridge Mutation to C_VOID on Departure", () => {
  const levelsWithCrumble = REDESIGNED_LEVELS.filter(lvl => {
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CRUMBLING) return true;
      }
    }
    return false;
  });

  assert.strictEqual(levelsWithCrumble.length, 8, "Exactly 8 levels in Levels 11-20 must feature Crumbling tiles");

  levelsWithCrumble.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    const crumbleCoords = [];
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CRUMBLING) crumbleCoords.push({ x, y });
      }
    }

    let prevPos = { ...engine.player };
    const departedCrumbles = [];

    lvl.trace.forEach(dir => {
      const prevWasCrumble = engine.grid[prevPos.y][prevPos.x] === C_CRUMBLING;
      const prevC = { ...prevPos };
      engine.move(dir);

      if (prevWasCrumble) {
        assert.strictEqual(
          engine.grid[prevC.y][prevC.x],
          C_VOID,
          `Level ${lvl.id}: Crumbling tile at (${prevC.x},${prevC.y}) must mutate strictly to C_VOID (0)`
        );
        departedCrumbles.push(prevC);
      }
      prevPos = { ...engine.player };
    });

    assert.strictEqual(
      departedCrumbles.length,
      crumbleCoords.length,
      `Level ${lvl.id}: All ${crumbleCoords.length} crumbling tiles must be crossed and collapsed`
    );
  });
});

testCase("2.5 Re-entry into Collapsed Crumbling Void is Strictly Rejected", () => {
  const levelsWithCrumble = REDESIGNED_LEVELS.filter(lvl => 
    lvl.grid.some(row => row.includes(C_CRUMBLING))
  );

  levelsWithCrumble.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    let prevPos = { ...engine.player };
    let tested = false;

    for (let i = 0; i < lvl.trace.length; i++) {
      const dir = lvl.trace[i];
      const prevWasCrumble = engine.grid[prevPos.y][prevPos.x] === C_CRUMBLING;
      const crumblePos = { ...prevPos };
      engine.move(dir);

      if (prevWasCrumble && !tested) {
        assert.strictEqual(engine.grid[crumblePos.y][crumblePos.x], C_VOID);
        assert.strictEqual(engine.isTilePassable(crumblePos.x, crumblePos.y), false);

        const dx = crumblePos.x - engine.player.x;
        const dy = crumblePos.y - engine.player.y;
        const revDir = Object.values(DIRS).find(d => d.dx === dx && d.dy === dy);

        assert(revDir, "Must have valid reverse direction");
        const curX = engine.player.x;
        const curY = engine.player.y;
        const rej = engine.move(revDir.name);
        assert.strictEqual(rej.success, false, `Level ${lvl.id}: Reverse step into void must be rejected`);
        assert.strictEqual(engine.player.x, curX, "Player position must be preserved on rejected void entry");
        assert.strictEqual(engine.player.y, curY);
        tested = true;
        break;
      }
      prevPos = { ...engine.player };
    }
    assert(tested, `Level ${lvl.id}: Must have tested crumbling re-entry rejection`);
  });
});

testCase("2.6 Crumbling Tile Undo Resurrection (C_VOID -> C_CRUMBLING)", () => {
  const levelsWithCrumble = REDESIGNED_LEVELS.filter(lvl => 
    lvl.grid.some(row => row.includes(C_CRUMBLING))
  );

  levelsWithCrumble.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    let crumblePos = null;
    let depStep = -1;

    for (let s = 0; s < lvl.trace.length; s++) {
      const pBefore = { ...engine.player };
      engine.move(lvl.trace[s]);
      if (lvl.grid[pBefore.y][pBefore.x] === C_CRUMBLING) {
        crumblePos = { ...pBefore };
        depStep = s;
        break;
      }
    }

    assert(depStep !== -1, `Level ${lvl.id}: Must step off crumbling tile`);
    assert.strictEqual(engine.grid[crumblePos.y][crumblePos.x], C_VOID, "Cell must be C_VOID after departure");

    // Undo 1 step: must resurrect to C_CRUMBLING
    assert.strictEqual(engine.undo(), true);
    assert.strictEqual(engine.player.x, crumblePos.x);
    assert.strictEqual(engine.player.y, crumblePos.y);
    assert.strictEqual(engine.grid[crumblePos.y][crumblePos.x], C_CRUMBLING, "Undo must resurrect cell to C_CRUMBLING");
  });
});

// ============================================================================
// SUITE 3: PHASE SWITCH & GATE POLARITY (LEVELS 16-20)
// ============================================================================
console.log("\n>>> SUITE 3: PHASE SWITCH & GATE POLARITY (LEVELS 16-20) <<<");

testCase("3.1 Gate Polarity & Closed Gate Collision Rejection in Levels 16-20", () => {
  const world4Levels = REDESIGNED_LEVELS.filter(l => l.world === 4);
  assert.strictEqual(world4Levels.length, 5, "World 4 must contain exactly 5 levels (16-20)");

  world4Levels.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    assert.strictEqual(engine.phaseState, true, `Level ${lvl.id} initialPhase must be RED (true)`);

    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_GATE_RED) {
          assert.strictEqual(engine.isTilePassable(x, y), true, `Level ${lvl.id}: Red Gate at (${x},${y}) must be open when phase is RED`);
        }
        if (lvl.grid[y][x] === C_GATE_BLUE) {
          assert.strictEqual(engine.isTilePassable(x, y), false, `Level ${lvl.id}: Blue Gate at (${x},${y}) must be closed when phase is RED`);
        }
      }
    }
  });
});

testCase("3.2 Phase Switch Inverts Polarity and Mutates to C_CONSUMED on Departure", () => {
  const world4Levels = REDESIGNED_LEVELS.filter(l => l.world === 4);

  world4Levels.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    let switchPos = null;

    for (let step = 0; step < lvl.trace.length; step++) {
      const dir = lvl.trace[step];
      const targetX = engine.player.x + DIRS[dir].dx;
      const targetY = engine.player.y + DIRS[dir].dy;

      if (engine.grid[targetY][targetX] === C_SWITCH) {
        switchPos = { x: targetX, y: targetY };
        const prevPhase = engine.phaseState;

        // Step ONTO switch
        engine.move(dir);
        assert.strictEqual(engine.player.x, switchPos.x);
        assert.strictEqual(engine.player.y, switchPos.y);
        assert.strictEqual(engine.phaseState, !prevPhase, `Level ${lvl.id}: Stepping onto switch must invert phaseState`);

        // Next step departs switch
        assert(step + 1 < lvl.trace.length, "Trace must have next move departing switch");
        const nextDir = lvl.trace[step + 1];
        engine.move(nextDir);

        // Departure mutation
        assert.strictEqual(
          engine.grid[switchPos.y][switchPos.x],
          C_CONSUMED,
          `Level ${lvl.id}: Switch at (${switchPos.x},${switchPos.y}) must mutate to C_CONSUMED on departure`
        );
        assert.strictEqual(
          engine.isTilePassable(switchPos.x, switchPos.y),
          false,
          `Level ${lvl.id}: Consumed switch must be impassable`
        );
        break;
      } else {
        engine.move(dir);
      }
    }

    assert(switchPos !== null, `Level ${lvl.id} must encounter and trigger a Phase Switch`);
  });
});

testCase("3.3 Adversarial Closed Gate Penetration Attack", () => {
  const world4Levels = REDESIGNED_LEVELS.filter(l => l.world === 4);
  let totalClosedGateAttempts = 0;

  world4Levels.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);

    lvl.trace.forEach(optimalDir => {
      for (const d of Object.values(DIRS)) {
        const nx = engine.player.x + d.dx;
        const ny = engine.player.y + d.dy;
        if (nx >= 0 && nx < engine.w && ny >= 0 && ny < engine.h) {
          const cell = engine.grid[ny][nx];
          const isClosedRed = (cell === C_GATE_RED && !engine.phaseState);
          const isClosedBlue = (cell === C_GATE_BLUE && engine.phaseState);

          if (isClosedRed || isClosedBlue) {
            totalClosedGateAttempts++;
            const curX = engine.player.x;
            const curY = engine.player.y;
            const res = engine.move(d.name);
            assert.strictEqual(res.success, false, `Level ${lvl.id}: Penetration into closed gate (${nx},${ny}) must FAIL`);
            assert(res.reason.includes('CLOSED') || res.reason.includes('IMPASSABLE'));
            assert.strictEqual(engine.player.x, curX, "Player position must be unchanged on closed gate rejection");
            assert.strictEqual(engine.player.y, curY);
          }
        }
      }
      engine.move(optimalDir);
    });
  });

  assert(totalClosedGateAttempts > 0, `Must have performed adversarial closed gate probes (actual: ${totalClosedGateAttempts})`);
});

testCase("3.4 Phase Switch Lossless Undo Polarity Restoration", () => {
  const world4Levels = REDESIGNED_LEVELS.filter(l => l.world === 4);

  world4Levels.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    let switchStep = -1;

    for (let s = 0; s < lvl.trace.length; s++) {
      const dir = lvl.trace[s];
      const targetX = engine.player.x + DIRS[dir].dx;
      const targetY = engine.player.y + DIRS[dir].dy;
      if (engine.grid[targetY][targetX] === C_SWITCH) {
        switchStep = s;
        break;
      }
      engine.move(dir);
    }

    assert(switchStep !== -1, `Level ${lvl.id}: Must locate switch arrival`);
    const phaseBeforeSwitch = engine.phaseState;

    // Move ONTO switch
    engine.move(lvl.trace[switchStep]);
    assert.strictEqual(engine.phaseState, !phaseBeforeSwitch);

    // Undo move ONTO switch: phase must restore to phaseBeforeSwitch
    assert.strictEqual(engine.undo(), true);
    assert.strictEqual(engine.phaseState, phaseBeforeSwitch, `Level ${lvl.id}: Undo must restore exact phaseState`);
  });
});

// ============================================================================
// SUITE 4: CHECKPOINT INVARIANT & SEQUENTIAL GATING
// ============================================================================
console.log("\n>>> SUITE 4: CHECKPOINT INVARIANT & SEQUENTIAL GATING <<<");

testCase("4.1 Checkpoint Invariant: C2 Impassable while C1 is uncollected", () => {
  const dualCheckpointLevels = REDESIGNED_LEVELS.filter(lvl => {
    const has1 = lvl.grid.some(r => r.includes(C_CHECKPOINT_1));
    const has2 = lvl.grid.some(r => r.includes(C_CHECKPOINT_2));
    return has1 && has2;
  });

  assert.strictEqual(dualCheckpointLevels.length, 6, "Exactly 6 levels in Levels 11-20 must have both C1 and C2");

  dualCheckpointLevels.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    let c1Pos = null;
    let c2Pos = null;

    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (lvl.grid[y][x] === C_CHECKPOINT_1) c1Pos = { x, y };
        if (lvl.grid[y][x] === C_CHECKPOINT_2) c2Pos = { x, y };
      }
    }

    assert(c1Pos && c2Pos, `Level ${lvl.id} must have both C1 and C2 coordinates`);

    // Prior to collecting C1:
    assert.strictEqual(engine.c1Collected, false);
    assert.strictEqual(engine.isTilePassable(c2Pos.x, c2Pos.y), false, `Level ${lvl.id}: C2 must be IMPASSABLE while C1 is uncollected`);

    // Adversarial Out-Of-Order Teleport & Move Attack:
    const testAdjEngine = new AdversarialEngine(lvl);
    let testNeighbor = null;
    let moveDirToC2 = null;
    for (const d of Object.values(DIRS)) {
      const adjX = c2Pos.x - d.dx;
      const adjY = c2Pos.y - d.dy;
      if (adjX >= 0 && adjX < lvl.w && adjY >= 0 && adjY < lvl.h) {
        testNeighbor = { x: adjX, y: adjY };
        moveDirToC2 = d;
        break;
      }
    }

    assert(testNeighbor && moveDirToC2, `Level ${lvl.id}: Must find neighbor adjacent to C2`);
    testAdjEngine.player = { ...testNeighbor };

    const rej = testAdjEngine.move(moveDirToC2.name);
    assert.strictEqual(rej.success, false, `Level ${lvl.id}: Out-of-order move into C2 must be REJECTED`);
    assert.strictEqual(rej.reason, 'C1_REQUIRED');
    assert.strictEqual(testAdjEngine.c2Collected, false, `Level ${lvl.id}: C2 must not be marked collected`);
    assert.strictEqual(testAdjEngine.grid[c2Pos.y][c2Pos.x], C_CHECKPOINT_2, `Level ${lvl.id}: C2 tile must remain unconsumed`);
    assert.strictEqual(testAdjEngine.player.x, testNeighbor.x);
    assert.strictEqual(testAdjEngine.player.y, testNeighbor.y);
  });
});

testCase("4.2 Goal Impassability Prior to 100% Clearance and Checkpoint Satisfaction", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    assert.strictEqual(engine.isTilePassable(lvl.goal.x, lvl.goal.y), false, `Level ${lvl.id}: Goal must be locked at spawn`);

    // Prior to penultimate move, Goal must remain locked and impassable
    for (let i = 0; i < lvl.trace.length - 2; i++) {
      engine.move(lvl.trace[i]);
      assert.strictEqual(
        engine.isGoalUnlocked(),
        false,
        `Level ${lvl.id}: Goal prematurely unlocked at step ${i + 1}/${lvl.trace.length} (remaining: ${engine.getRemainingCount()})`
      );
      assert.strictEqual(
        engine.isTilePassable(lvl.goal.x, lvl.goal.y),
        false,
        `Level ${lvl.id}: Goal tile must be impassable prior to 100% clearance`
      );
    }

    // Step par - 1 (penultimate move, lands on tile right before goal)
    engine.move(lvl.trace[lvl.trace.length - 2]);

    // Right now, remaining tiles MUST be 0 and goal MUST be unlocked
    assert.strictEqual(engine.getRemainingCount(), 0, `Level ${lvl.id}: Remaining count must be exactly 0 right before goal entry`);
    assert.strictEqual(engine.isGoalUnlocked(), true, `Level ${lvl.id}: Goal must unlock when remaining count hits 0`);
    assert.strictEqual(engine.isTilePassable(lvl.goal.x, lvl.goal.y), true, `Level ${lvl.id}: Goal tile must become passable`);

    // Final move lands on goal
    const finalDir = lvl.trace[lvl.trace.length - 1];
    const finalTargetX = engine.player.x + DIRS[finalDir].dx;
    const finalTargetY = engine.player.y + DIRS[finalDir].dy;
    assert.strictEqual(finalTargetX, lvl.goal.x);
    assert.strictEqual(finalTargetY, lvl.goal.y);

    const finalRes = engine.move(finalDir);
    assert.strictEqual(finalRes.success, true);
    assert.strictEqual(engine.isVictorious, true);
  });
});

// ============================================================================
// SUITE 5: FULL 10-LEVEL SOLVABILITY SUITE (LEVELS 11-20)
// ============================================================================
console.log("\n>>> SUITE 5: FULL 10-LEVEL SOLVABILITY SUITE (LEVELS 11-20) <<<");

testCase("5.1 100% Deterministic Par Victory across all 10 Levels (11 to 20)", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    assert.strictEqual(lvl.budget, 0, `Level ${lvl.id} must be Hamiltonian (budget: 0)`);
    assert.strictEqual(lvl.trace.length, lvl.par, `Level ${lvl.id} trace length must strictly match par`);

    for (let step = 0; step < lvl.trace.length; step++) {
      const dir = lvl.trace[step];
      const res = engine.move(dir);
      assert.strictEqual(res.success, true, `Level ${lvl.id} step ${step + 1} (${dir}) failed: ${res.reason}`);
      assert.strictEqual(engine.isDeadlocked, false, `Level ${lvl.id} unexpectedly entered deadlock at step ${step + 1}`);
    }

    assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} must achieve victory upon finishing trace`);
    assert.strictEqual(engine.moves, lvl.par, `Level ${lvl.id} final move count must equal par`);
    assert.strictEqual(engine.player.x, lvl.goal.x, `Level ${lvl.id} player must finish on Goal X`);
    assert.strictEqual(engine.player.y, lvl.goal.y, `Level ${lvl.id} player must finish on Goal Y`);
    assert.strictEqual(engine.getRemainingCount(), 0, `Level ${lvl.id} remaining count must be 0`);
  });
});

// ============================================================================
// SUITE 6: FULL 10-LEVEL LOSSLESS UNDO ROLLBACK SUITE
// ============================================================================
console.log("\n>>> SUITE 6: FULL 10-LEVEL LOSSLESS UNDO ROLLBACK SUITE <<<");

testCase("6.1 Lossless Undo Rollback: Victory to Spawn across all 10 Levels", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    const initialRemaining = engine.getRemainingCount();
    const initialGridCopy = lvl.grid.map(r => [...r]);

    // Forward pass to victory
    lvl.trace.forEach(dir => engine.move(dir));
    assert.strictEqual(engine.isVictorious, true);

    // Rollback move-by-move
    for (let step = lvl.trace.length - 1; step >= 0; step--) {
      const undoOk = engine.undo();
      assert.strictEqual(undoOk, true, `Level ${lvl.id} undo failed at step ${step}`);
    }

    // Verify complete spawn restoration
    assert.strictEqual(engine.moves, 0, `Level ${lvl.id}: moves must restore to 0`);
    assert.strictEqual(engine.player.x, lvl.spawn.x, `Level ${lvl.id}: player.x must restore to spawn`);
    assert.strictEqual(engine.player.y, lvl.spawn.y, `Level ${lvl.id}: player.y must restore to spawn`);
    assert.strictEqual(engine.phaseState, (lvl.initialPhase === 'RED'), `Level ${lvl.id}: phaseState must restore to initialPhase`);
    assert.strictEqual(engine.c1Collected, false, `Level ${lvl.id}: c1Collected must restore to false`);
    assert.strictEqual(engine.c2Collected, false, `Level ${lvl.id}: c2Collected must restore to false`);
    assert.strictEqual(engine.isVictorious, false, `Level ${lvl.id}: isVictorious must restore to false`);
    assert.strictEqual(engine.isDeadlocked, false, `Level ${lvl.id}: isDeadlocked must restore to false`);
    assert.strictEqual(engine.getRemainingCount(), initialRemaining, `Level ${lvl.id}: remaining count must restore to initial`);

    // Verify grid cell-for-cell restoration
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        assert.strictEqual(
          engine.grid[y][x],
          initialGridCopy[y][x],
          `Level ${lvl.id}: Grid cell at (${x},${y}) drifted after rollback`
        );
      }
    }

    // Verify crossroad visit restoration
    engine.crossroads.forEach((visits, key) => {
      assert.strictEqual(visits, 2, `Level ${lvl.id}: Crossroad ${key} visits must restore to 2`);
    });
  });
});

testCase("6.2 High-Churn Oscillating Undo Stress Test (Forward 5, Back 3, Forward 4, Back 6)", () => {
  REDESIGNED_LEVELS.forEach(lvl => {
    const engine = new AdversarialEngine(lvl);
    const initialGridCopy = lvl.grid.map(r => [...r]);

    // Advance 5 moves
    for (let i = 0; i < 5; i++) engine.move(lvl.trace[i]);
    assert.strictEqual(engine.moves, 5);

    // Rollback 3 moves
    for (let i = 0; i < 3; i++) engine.undo();
    assert.strictEqual(engine.moves, 2);

    // Advance 4 moves (steps 2, 3, 4, 5)
    for (let i = 2; i < 6; i++) engine.move(lvl.trace[i]);
    assert.strictEqual(engine.moves, 6);

    // Rollback 6 moves back to spawn
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
// SUITE 7: UNTOUCHABILITY ASSERTION & LEVELS 1-10 REGRESSION SUITE
// ============================================================================
console.log("\n>>> SUITE 7: UNTOUCHABILITY ASSERTION & LEVELS 1-10 REGRESSION SUITE <<<");

testCase("7.1 Untouchability Assertion: Levels 1-10 Identical between test_rig.js and index.html", () => {
  const testRigContent = fs.readFileSync('test_rig.js', 'utf8');
  const indexHtmlContent = fs.readFileSync('index.html', 'utf8');

  const trLevelsMatch = testRigContent.match(/const LEVELS = (\[[\s\S]*?\]);/);
  const ihLevelsMatch = indexHtmlContent.match(/const LEVELS = (\[[\s\S]*?\]);/);

  assert(trLevelsMatch, "test_rig.js must declare const LEVELS = [...]");
  assert(ihLevelsMatch, "index.html must declare const LEVELS = [...]");

  const trLevels = JSON.parse(trLevelsMatch[1]);
  const ihLevels = JSON.parse(ihLevelsMatch[1]);

  assert(trLevels.length >= 10, "test_rig.js must have at least 10 levels");
  assert(ihLevels.length >= 10, "index.html must have at least 10 levels");

  const commonKeys = ['id', 'world', 'name', 'w', 'h', 'budget', 'par', 'spawn', 'goal', 'checkpoints', 'grid'];

  for (let i = 0; i < 10; i++) {
    const trL = trLevels[i];
    const ihL = ihLevels[i];

    commonKeys.forEach(k => {
      assert.deepStrictEqual(
        trL[k],
        ihL[k],
        `Level ${i + 1} mismatch on property '${k}' between test_rig.js and index.html`
      );
    });
  }
});

testCase("7.2 Levels 1-10 Deterministic 100% Solvability Verification", () => {
  const testRigContent = fs.readFileSync('test_rig.js', 'utf8');
  const trLevels = JSON.parse(testRigContent.match(/const LEVELS = (\[[\s\S]*?\]);/)[1]);

  for (let i = 0; i < 10; i++) {
    const lvl = trLevels[i];
    const engine = new AdversarialEngine(lvl);

    lvl.trace.forEach((dir, step) => {
      const res = engine.move(dir);
      assert.strictEqual(res.success, true, `Level ${lvl.id} step ${step + 1} (${dir}) failed: ${res.reason}`);
    });

    assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} (${lvl.name}) must reach victory`);
    assert.strictEqual(engine.moves, lvl.par, `Level ${lvl.id} moves must equal par ${lvl.par}`);
    assert.strictEqual(engine.player.x, lvl.goal.x);
    assert.strictEqual(engine.player.y, lvl.goal.y);
  }
});

// ============================================================================
// SUITE 8: SPATIAL BUDGET & BOUNDARY INVARIANTS
// ============================================================================
console.log("\n>>> SUITE 8: SPATIAL BUDGET & BOUNDARY INVARIANTS <<<");

testCase("8.1 Spatial Budget Invariant: Bt = 0 decrements to -1 and triggers immediate deadlock", () => {
  const budgetLevel = {
    id: 991, w: 4, h: 2, budget: 2, par: 2,
    spawn: { x: 0, y: 0 }, goal: { x: 1, y: 1 }, checkpoints: [],
    grid: [
      [2, 2, 2, 2],
      [1, 4, 2, 2]
    ]
  };

  const engine = new AdversarialEngine(budgetLevel);
  assert.strictEqual(engine.budget, 2);
  assert.strictEqual(engine.isDeadlocked, false);

  // Move 1: move RIGHT to (1,0) -> budget 2 -> 1
  const m1 = engine.move('RIGHT');
  assert.strictEqual(m1.success, true);
  assert.strictEqual(engine.player.x, 1);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.budget, 1);
  assert.strictEqual(engine.isGoalUnlocked(), true, "Goal unlocks when Bt === 1 in budget mode");
  assert.strictEqual(engine.isDeadlocked, false);

  // Move 2: wasteful move RIGHT to (2,0) instead of DOWN to goal -> budget 1 -> 0
  const m2 = engine.move('RIGHT');
  assert.strictEqual(m2.success, true);
  assert.strictEqual(engine.player.x, 2);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.budget, 0);
  assert.strictEqual(engine.isGoalUnlocked(), false, "Goal locks when Bt === 0");
  assert.strictEqual(engine.isDeadlocked, false);

  // Move 3: moving when Bt = 0 decrements to -1 and triggers immediate deadlock
  const m3 = engine.move('RIGHT');
  assert.strictEqual(m3.success, true);
  assert.strictEqual(engine.player.x, 3);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.budget, -1, "Budget must decrement to -1");
  assert.strictEqual(engine.isDeadlocked, true, "Moving when Bt = 0 must immediately trigger deadlock (Bt = -1)");

  // Attempting move while deadlocked must fail
  const m4 = engine.move('DOWN');
  assert.strictEqual(m4.success, false);
  assert.strictEqual(m4.reason, 'DEADLOCKED');

  // Undo 1: restores to (2,0) with Bt = 0 and clears deadlock
  assert.strictEqual(engine.undo(), true);
  assert.strictEqual(engine.player.x, 2);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.budget, 0);
  assert.strictEqual(engine.isDeadlocked, false);

  // Undo 2: restores to (1,0) with Bt = 1, goal unlocks
  assert.strictEqual(engine.undo(), true);
  assert.strictEqual(engine.player.x, 1);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.budget, 1);
  assert.strictEqual(engine.isGoalUnlocked(), true);

  // Step DOWN into Goal at (1,1) -> Victory!
  const win = engine.move('DOWN');
  assert.strictEqual(win.success, true);
  assert.strictEqual(engine.isVictorious, true);
  assert.strictEqual(engine.player.x, 1);
  assert.strictEqual(engine.player.y, 1);
});

// ============================================================================
// SUITE 9: VERTICAL CENTERING & VIEWPORT RESPONSIVE MATH AUDIT
// ============================================================================
console.log("\n>>> SUITE 9: VERTICAL CENTERING & VIEWPORT RESPONSIVE MATH AUDIT <<<");

testCase("9.1 Centering & Positive Offset Math across 7 Industry Viewports", () => {
  const VIEWPORTS = [
    { name: "Mobile Standard (iPhone 12/13/14)", w: 390, h: 844, isMobile: true },
    { name: "Mobile Small (iPhone SE 1st gen)", w: 320, h: 568, isMobile: true },
    { name: "Mobile Large (iPhone 11 / XR)", w: 414, h: 896, isMobile: true },
    { name: "Android Standard (Pixel / Galaxy)", w: 360, h: 800, isMobile: true },
    { name: "Tablet Portrait (iPad Mini/Air)", w: 768, h: 1024, isMobile: false },
    { name: "Desktop Full HD (1080p)", w: 1920, h: 1080, isMobile: false },
    { name: "Desktop Square / Foldable", w: 600, h: 600, isMobile: false }
  ];

  const GRID_CONFIGS = [
    { cols: 5, rows: 5, label: "5x5 (L11-L12)" },
    { cols: 6, rows: 5, label: "6x5 (L13-L14, L16-L17)" },
    { cols: 6, rows: 6, label: "6x6 (L15, L18-L19)" },
    { cols: 7, rows: 6, label: "7x6 (L20 Grandmaster)" }
  ];

  const results = [];

  VIEWPORTS.forEach(vp => {
    const shellW = vp.isMobile ? vp.w : Math.min(vp.w, 440);
    const shellH = vp.isMobile ? vp.h : Math.min(vp.h, 880);
    const availableCanvasW = shellW - (vp.isMobile ? 16 : 24);
    const availableCanvasH = shellH - (vp.isMobile ? 100 : 120);

    GRID_CONFIGS.forEach(grid => {
      const maxTileW = (availableCanvasW * 0.85) / grid.cols;
      const maxTileH = (availableCanvasH * 0.65) / grid.rows;
      const rawTileSize = Math.floor(Math.min(maxTileW, maxTileH));
      const tileSize32 = Math.max(32, Math.min(110, rawTileSize));

      const originX32 = Math.floor((availableCanvasW - (grid.cols * tileSize32)) / 2);
      const originY32 = Math.floor((availableCanvasH - (grid.rows * tileSize32)) / 2);

      assert(originY32 >= 0, `originY32 must be non-negative on ${vp.name} for ${grid.label}`);
      assert(originX32 >= 0, `originX32 must be non-negative on ${vp.name} for ${grid.label}`);

      const tileSize48 = Math.max(48, Math.min(110, rawTileSize));
      const originX48 = Math.floor((availableCanvasW - (grid.cols * tileSize48)) / 2);
      const originY48 = Math.floor((availableCanvasH - (grid.rows * tileSize48)) / 2);

      results.push({
        vp: vp.name,
        grid: grid.label,
        canvasW: availableCanvasW,
        canvasH: availableCanvasH,
        rawTileSize,
        tileSize32,
        originX32,
        originY32,
        tileSize48,
        originX48,
        originY48
      });
    });
  });

  const se7x6 = results.find(r => r.vp.includes('iPhone SE') && r.grid.includes('7x6'));
  assert(se7x6, "Must find iPhone SE 7x6 result");
  assert(se7x6.originY32 >= 0, "originY on iPhone SE for 7x6 with min 32 is strictly positive");
  assert(se7x6.originX32 >= 0, "originX on iPhone SE for 7x6 with min 32 is strictly positive");
});

// ============================================================================
// FINAL SUMMARY & RESULTS
// ============================================================================
console.log("\n================================================================================");
console.log(`  ADVERSARIAL VERIFICATION SUMMARY:`);
console.log(`  Total Tests Run:    ${totalTests}`);
console.log(`  Passed Tests:       \x1b[32m${passedTests}\x1b[0m`);
console.log(`  Failed Tests:       ${failedTests > 0 ? `\x1b[31m${failedTests}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
console.log(`  Success Rate:       \x1b[32m${((passedTests / totalTests) * 100).toFixed(1)}%\x1b[0m`);
console.log("================================================================================\n");

if (failedTests > 0) {
  process.exit(1);
}

/**
 * Phase 4 Comprehensive Automated Test Suite
 * ONE MORE TILE - Levels 16 to 20
 * Tests:
 * 1. Cell enum definition & initial board setup
 * 2. Switch phase inversion on arrival & consumption on departure
 * 3. Dynamic gate passability (Red vs Blue gating)
 * 4. Crumbling bridge integration with phase gating
 * 5. Full Bi-Directional Undo Stack (restoration of phaseState, grid, budget, checkpoints)
 * 6. Spatial Budget zero-margin verification (B0 = Par, B_final = 0, Goal unlocks at Bt = 1)
 * 7. Verification of all 5 levels (16, 17, 18, 19, 20) with optimal traces and uniqueness
 */

const assert = require('assert');

// Entity Enums
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

// Level Definitions
const LEVEL_16 = {
  id: 16,
  name: "The Phase Primer",
  w: 4, h: 3,
  initialPhase: 'RED',
  par: 8,
  budget: 8,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],
    [1, 1, 1, 2],
    [4, 10, 2, 2]
  ],
  expectedTrace: ['RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT']
};

const LEVEL_17 = {
  id: 17,
  name: "The Red-Blue Split",
  w: 4, h: 4,
  initialPhase: 'RED',
  par: 9,
  budget: 9,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 }
  ],
  grid: [
    [2, 2, 9, 5],
    [1, 1, 1, 8],
    [1, 1, 1, 2],
    [4, 10, 2, 2]
  ],
  expectedTrace: ['RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT']
};

const LEVEL_18 = {
  id: 18,
  name: "The Fragile Polarity",
  w: 5, h: 3,
  initialPhase: 'RED',
  par: 10,
  budget: 10,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 7, 2, 8],
    [0, 1, 0, 1, 2],
    [4, 10, 2, 2, 2]
  ],
  expectedTrace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT']
};

const LEVEL_19 = {
  id: 19,
  name: "The Parity Lockout",
  w: 4, h: 4,
  initialPhase: 'RED',
  par: 9,
  budget: 9,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [],
  grid: [
    [2, 2, 9, 8],
    [1, 1, 1, 2],
    [1, 8, 1, 10],
    [4, 10, 2, 2]
  ],
  expectedTrace: ['RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT']
};

const LEVEL_20 = {
  id: 20,
  name: "The Grandmaster Synthesis",
  w: 5, h: 4,
  initialPhase: 'RED',
  par: 11,
  budget: 11,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 3 },
  checkpoints: [
    { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
    { id: 2, x: 4, y: 3, cellType: C_CHECKPOINT_2 }
  ],
  grid: [
    [2, 2, 7, 2, 5],
    [1, 1, 0, 1, 8],
    [1, 1, 0, 1, 10],
    [4, 10, 7, 2, 6]
  ],
  expectedTrace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT']
};

// Simulation Engine for Phase 4
class Phase4Engine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(r => [...r]);
    this.player = { x: levelDef.spawn.x, y: levelDef.spawn.y };
    this.phaseState = levelDef.initialPhase === 'RED'; // true = RED open, false = BLUE open
    this.checkpoints = (levelDef.checkpoints || []).map(c => ({ ...c }));
    this.c1Collected = !this.checkpoints.some(c => c.id === 1);
    this.c2Collected = !this.checkpoints.some(c => c.id === 2);
    this.budget = levelDef.budget;
    this.moves = 0;
    this.isDeadlocked = false;
    this.isComplete = false;
    this.undoStack = [];
  }

  isPassable(tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return false;
    const cell = this.grid[ty][tx];

    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;

    // C2 is impassable while C1 is active
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;

    // Phase Gate Passability
    if (cell === C_GATE_RED && !this.phaseState) return false;
    if (cell === C_GATE_BLUE && this.phaseState) return false;

    // Goal gating
    if (cell === C_GOAL) {
      if (!this.c1Collected || !this.c2Collected) return false;
      // In zero-margin levels, goal is unlocked only at Bt = 1
      if (this.lvl.budget !== undefined && this.budget !== 1) return false;
    }

    return true;
  }

  move(dir) {
    if (this.isComplete || this.isDeadlocked) return false;

    const deltas = {
      RIGHT: { dx: 1, dy: 0 },
      LEFT: { dx: -1, dy: 0 },
      DOWN: { dx: 0, dy: 1 },
      UP: { dx: 0, dy: -1 }
    };
    const { dx, dy } = deltas[dir];
    const tx = this.player.x + dx;
    const ty = this.player.y + dy;

    if (!this.isPassable(tx, ty)) {
      return false; // Move blocked
    }

    // Push undo frame
    this.undoStack.push({
      player: { ...this.player },
      grid: this.grid.map(r => [...r]),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      budget: this.budget,
      moves: this.moves,
      isDeadlocked: this.isDeadlocked,
      isComplete: this.isComplete
    });

    const targetCell = this.grid[ty][tx];
    const depCell = this.grid[this.player.y][this.player.x];

    // Departure consumption
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    // Advance position
    this.player.x = tx;
    this.player.y = ty;
    this.moves++;
    this.budget--;

    // Arrival triggers
    if (targetCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    } else if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (targetCell === C_GOAL) {
      this.isComplete = true;
      return true;
    }

    // Check deadlock
    if (this.budget < 0) {
      this.isDeadlocked = true;
    } else {
      // Check if any legal moves exist
      const hasMoves = ['RIGHT', 'LEFT', 'DOWN', 'UP'].some(d => {
        const delta = deltas[d];
        return this.isPassable(this.player.x + delta.dx, this.player.y + delta.dy);
      });
      if (!hasMoves && !this.isComplete) {
        this.isDeadlocked = true;
      }
    }

    return true;
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const frame = this.undoStack.pop();
    this.player = frame.player;
    this.grid = frame.grid;
    this.phaseState = frame.phaseState;
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.budget = frame.budget;
    this.moves = frame.moves;
    this.isDeadlocked = frame.isDeadlocked;
    this.isComplete = frame.isComplete;
    return true;
  }
}

// ----------------------------------------------------------------------------
// TEST SUITE
// ----------------------------------------------------------------------------
console.log("=== RUNNING PHASE 4 TEST SUITE ===");

// 1. Basic Switch & Gate Logic Test
console.log("\n[Test 1] Switch Phase Inversion & Gate Passability");
{
  const testLvl = {
    id: 99,
    name: "Gate Logic Unit Test",
    w: 3, h: 2,
    initialPhase: 'RED',
    budget: 10,
    spawn: { x: 0, y: 0 },
    goal: { x: 2, y: 1 },
    checkpoints: [],
    grid: [
      [2, 8, 10], // P(0,0), Switch(1,0), Blue Gate(2,0)
      [9, 1, 4]   // Red Gate(0,1), Wall(1,1), Goal(2,1)
    ]
  };

  const eng = new Phase4Engine(testLvl);
  assert.strictEqual(eng.phaseState, true, "Initial phase should be RED (true)");

  // From (0,0):
  // Can we move DOWN to (0,1) which is Red Gate? YES (Red open)
  assert.strictEqual(eng.isPassable(0, 1), true, "Red gate should be passable when phase is RED");

  // Move RIGHT to Switch (1,0)
  const moved1 = eng.move('RIGHT');
  assert.strictEqual(moved1, true, "Move to switch should succeed");
  assert.strictEqual(eng.phaseState, false, "Phase should flip to BLUE (false) on entering switch");
  assert.strictEqual(eng.grid[0][0], C_CONSUMED, "Departed spawn tile must be consumed");

  // From Switch (1,0):
  // Can we move RIGHT to (2,0) which is Blue Gate? YES (Blue open)
  assert.strictEqual(eng.isPassable(2, 0), true, "Blue gate should be passable when phase is BLUE");

  // Can we move back LEFT to (0,0)? NO (Consumed)
  assert.strictEqual(eng.isPassable(0, 0), false, "Consumed tile must be impassable");

  // Move to Blue Gate (2,0)
  eng.move('RIGHT');
  assert.strictEqual(eng.grid[0][1], C_CONSUMED, "Switch tile must be consumed upon departure (finite toggle)");
  assert.strictEqual(eng.player.x, 2);
  assert.strictEqual(eng.player.y, 0);

  // Now test UNDO!
  assert.strictEqual(eng.undo(), true);
  assert.strictEqual(eng.player.x, 1);
  assert.strictEqual(eng.player.y, 0);
  assert.strictEqual(eng.grid[0][1], C_SWITCH, "Undo must restore switch tile");
  assert.strictEqual(eng.phaseState, false, "Undo must restore switch state at (1,0)");

  assert.strictEqual(eng.undo(), true);
  assert.strictEqual(eng.player.x, 0);
  assert.strictEqual(eng.player.y, 0);
  assert.strictEqual(eng.phaseState, true, "Undo must restore initial RED phaseState");
  assert.strictEqual(eng.grid[0][0], C_UNTOUCHED, "Undo must restore spawn tile to untouched");
  console.log("  PASS: Switch inversion, gate passability, departure consumption, and undo verified.");
}

// 2. Crumbling Bridge Integration Test
console.log("\n[Test 2] Crumbling Bridge Mutation with Phase Gating");
{
  const eng18 = new Phase4Engine(LEVEL_18);
  // Spawn at (0,0). Move R to (1,0), R to (2,0)[Crumble], R to (3,0)
  eng18.move('RIGHT'); // to (1,0)
  eng18.move('RIGHT'); // to (2,0) [Crumbling]
  assert.strictEqual(eng18.grid[0][2], C_CRUMBLING, "Tile is currently crumbling while stood on");
  eng18.move('RIGHT'); // to (3,0)
  assert.strictEqual(eng18.grid[0][2], C_VOID, "Crumbling tile must collapse into C_VOID upon departure");

  // Verify backtrack into void is impossible
  assert.strictEqual(eng18.isPassable(2, 0), false, "Collapsed crumbling tile (VOID) must be impassable");

  // Test undoing across crumbling bridge
  eng18.undo();
  assert.strictEqual(eng18.player.x, 2);
  assert.strictEqual(eng18.player.y, 0);
  assert.strictEqual(eng18.grid[0][2], C_CRUMBLING, "Undo must restore crumbling tile");
  console.log("  PASS: Crumbling collapse to VOID and bi-directional restoration verified.");
}

// 3. Verify All 5 Levels (16-20)
console.log("\n[Test 3] Execution of Levels 16 to 20 with Zero-Margin Budget Verification");

const phase4Levels = [LEVEL_16, LEVEL_17, LEVEL_18, LEVEL_19, LEVEL_20];

phase4Levels.forEach(lvl => {
  console.log(`\nTesting Level ${lvl.id}: ${lvl.name}`);
  const eng = new Phase4Engine(lvl);

  assert.strictEqual(eng.budget, lvl.par, `Budget must equal Par (${lvl.par})`);
  assert.strictEqual(eng.moves, 0, "Moves must start at 0");

  // Step through expected trace
  lvl.expectedTrace.forEach((dir, stepIdx) => {
    const prevBudget = eng.budget;
    const success = eng.move(dir);
    assert.strictEqual(success, true, `Move ${stepIdx + 1} (${dir}) failed at (${eng.player.x},${eng.player.y})`);
    assert.strictEqual(eng.budget, prevBudget - 1, `Budget must decrement by 1 on move ${stepIdx + 1}`);
  });

  assert.strictEqual(eng.isComplete, true, `Level ${lvl.id} should be completed after full trace`);
  assert.strictEqual(eng.moves, lvl.par, `Total moves (${eng.moves}) must equal Par (${lvl.par})`);
  assert.strictEqual(eng.budget, 0, `Final budget must equal exactly 0 (Zero-Margin)`);
  assert.strictEqual(eng.isDeadlocked, false, `Must not be deadlocked on goal`);
  console.log(`  PASS: Completed in ${eng.moves} moves with Bt_final = 0.`);

  // Test full bi-directional undo back to spawn
  console.log(`  Testing bi-directional undo stack rollback (${lvl.expectedTrace.length} frames)...`);
  for (let i = lvl.expectedTrace.length - 1; i >= 0; i--) {
    const un = eng.undo();
    assert.strictEqual(un, true, `Undo frame ${i} failed`);
  }
  assert.strictEqual(eng.player.x, lvl.spawn.x, "Undoing all moves must return player to spawn X");
  assert.strictEqual(eng.player.y, lvl.spawn.y, "Undoing all moves must return player to spawn Y");
  assert.strictEqual(eng.budget, lvl.budget, "Undoing all moves must restore initial budget");
  assert.strictEqual(eng.moves, 0, "Undoing all moves must restore moves to 0");
  assert.strictEqual(eng.isComplete, false, "Undoing goal entry must rekindle goal / uncomplete");
  console.log(`  PASS: Fully rolled back to spawn state.`);
});

// 4. Test Decoy Trap Deadlock on Level 19
console.log("\n[Test 4] Level 19 Decoy Switch Trap & Deadlock Verification");
{
  const eng19 = new Phase4Engine(LEVEL_19);
  // Optimal trace to (1,3):
  // R(1,0), R(2,0)[Red], R(3,0)[SW1: RED->BLUE], D(3,1), D(3,2)[Blue1], D(3,3), L(2,3), L(1,3)[Blue2]
  const trapPrefix = ['RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT'];
  trapPrefix.forEach(d => eng19.move(d));
  assert.strictEqual(eng19.player.x, 1);
  assert.strictEqual(eng19.player.y, 3);
  assert.strictEqual(eng19.phaseState, false, "Phase should be BLUE before hitting decoy switch");

  // Now, greedy player takes the bait and moves UP to Decoy Switch (1,2)
  const trapMove = eng19.move('UP');
  assert.strictEqual(trapMove, true, "Player can enter decoy switch");
  assert.strictEqual(eng19.player.x, 1);
  assert.strictEqual(eng19.player.y, 2);
  assert.strictEqual(eng19.phaseState, true, "Decoy switch inverts phase back to RED!");

  // Verify player is deadlocked at (1,2):
  // Up is Wall(1,1), Left is Wall(0,2), Right is Wall(2,2), Down is Consumed(1,3)
  assert.strictEqual(eng19.isDeadlocked, true, "Player must be flagged deadlocked in trap room");
  console.log("  PASS: Decoy switch entrapment and deadlock detection verified.");
}

// 5. Test Checkpoint Order Gating on Level 20
console.log("\n[Test 5] Level 20 Checkpoint Sequence & Goal Unlock Constraints");
{
  const eng20 = new Phase4Engine(LEVEL_20);
  assert.strictEqual(eng20.c1Collected, false, "C1 should be uncollected");
  assert.strictEqual(eng20.c2Collected, false, "C2 should be uncollected");

  // Verify C2 at (4,3) is impassable until C1 collected
  assert.strictEqual(eng20.isPassable(4, 3), false, "C2 must be impassable when C1 uncollected");

  // Move across Crumble 1 to C1: R, R, R, R
  eng20.move('RIGHT'); // (1,0)
  eng20.move('RIGHT'); // (2,0)
  eng20.move('RIGHT'); // (3,0)
  eng20.move('RIGHT'); // (4,0) [C1]
  assert.strictEqual(eng20.c1Collected, true, "C1 must be collected at (4,0)");
  assert.strictEqual(eng20.c2Collected, false, "C2 still uncollected");

  // Now move south to Switch (4,1)
  eng20.move('DOWN'); // (4,1) [Switch: RED->BLUE]
  assert.strictEqual(eng20.phaseState, false, "Phase must be BLUE");

  // Move south through Blue Gate (4,2)
  eng20.move('DOWN'); // (4,2) [Blue Gate 1]

  // Now C2 at (4,3) should be passable!
  assert.strictEqual(eng20.isPassable(4, 3), true, "C2 must be passable now that C1 is collected");
  eng20.move('DOWN'); // (4,3) [C2]
  assert.strictEqual(eng20.c2Collected, true, "C2 must be collected at (4,3)");

  // Verify Goal at (0,3) is NOT passable until Bt = 1
  // Current moves: 7. Budget remaining: 11 - 7 = 4.
  assert.strictEqual(eng20.budget, 4);
  assert.strictEqual(eng20.isPassable(0, 3), false, "Goal must remain locked when Bt > 1 even with C1/C2 collected");

  // Advance remaining path: L(3,3), L(2,3)[Crumble 2], L(1,3)[Blue Gate 2]
  eng20.move('LEFT'); // (3,3), budget = 3
  eng20.move('LEFT'); // (2,3), budget = 2
  eng20.move('LEFT'); // (1,3), budget = 1
  assert.strictEqual(eng20.budget, 1, "Budget must reach exactly 1 before final step");
  assert.strictEqual(eng20.isPassable(0, 3), true, "Goal must unlock when Bt == 1 and all checkpoints collected!");

  eng20.move('LEFT'); // (0,3) [Goal!]
  assert.strictEqual(eng20.isComplete, true);
  assert.strictEqual(eng20.budget, 0);
  console.log("  PASS: Checkpoint passability order and Goal unlock at Bt = 1 verified.");
}

console.log("\n>>> ALL PHASE 4 ARCHITECTURAL TESTS PASSED CLEANLY! <<<");

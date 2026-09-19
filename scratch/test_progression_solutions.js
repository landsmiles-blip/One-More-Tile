/**
 * Unit Test Script: Progression, Premature Goal Entry Prevention, and Auto-Reset
 */

const assert = require('assert');

// Cell Enums
const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;

// Mock Storage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();

class ProgressionEngine {
  constructor(lvl, storage = mockStorage) {
    this.storage = storage;
    this.lvl = lvl;
    this.w = lvl.w;
    this.h = lvl.h;
    this.grid = lvl.grid.map(r => [...r]);
    this.player = { ...lvl.spawn };
    this.goal = { ...lvl.goal };
    this.budget = lvl.budget;
    this.initialBudget = lvl.budget;
    this.moveCount = 0;
    this.isVictorious = false;
    this.isDeadlocked = false;
    this.hasUndone = false;

    this.checkpoints = lvl.checkpoints || [];
    this.hasC1 = this.checkpoints.some(c => c.id === 1);
    this.hasC2 = this.checkpoints.some(c => c.id === 2);
    this.c1Collected = false;
    this.c2Collected = false;

    this.goalUnlocked = false;
    this.goalExtinguished = false;
    this.autoResetTimer = null;
    this.resetTriggered = false;

    this.history = [];
    this.evaluateState();
  }

  evaluateState() {
    const checkpointsSatisfied = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);

    if (this.initialBudget === 0) {
      // Clear-All mode: untouched count must be 0 and checkpoints met
      let untouchedCount = 0;
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const c = this.grid[y][x];
          if ((c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 || c === C_CRUMBLING) &&
              !(x === this.player.x && y === this.player.y)) {
            untouchedCount++;
          }
        }
      }
      this.goalUnlocked = (untouchedCount === 0 && checkpointsSatisfied);
      this.goalExtinguished = false;
    } else {
      // Spatial Budget mode:
      // ARCHITECTURAL RULE: Goal ONLY unlocks when checkpoints are satisfied AND budget === 1 (final move)
      if (checkpointsSatisfied && this.budget === 1) {
        this.goalUnlocked = true;
        this.goalExtinguished = false;
      } else if (this.budget < 0) {
        this.goalUnlocked = false;
        this.goalExtinguished = true;
        this.triggerDeadlock();
      } else {
        // While budget > 1 or checkpoints uncollected, Goal remains PHYSICALLY LOCKED!
        this.goalUnlocked = false;
        this.goalExtinguished = false;
      }
    }
  }

  isPassable(tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return false;
    const cell = this.grid[ty][tx];
    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;

    // Locked Goal cannot be entered under any circumstances
    if (cell === C_GOAL && !this.goalUnlocked) return false;

    // Gated C2
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;

    return true;
  }

  move(dx, dy) {
    if (this.isVictorious || this.isDeadlocked) return false;

    const tx = this.player.x + dx;
    const ty = this.player.y + dy;

    if (!this.isPassable(tx, ty)) {
      return false; // Wall bump / Goal locked rejection
    }

    const targetCell = this.grid[ty][tx];
    const depCell = this.grid[this.player.y][this.player.x];

    // Push undo frame
    this.history.push({
      player: { ...this.player },
      target: { x: tx, y: ty },
      dir: { dx, dy },
      prevCellState: depCell,
      targetCellPrevState: targetCell,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      goalUnlocked: this.goalUnlocked,
      goalExtinguished: this.goalExtinguished,
      budget: this.budget,
      moveCount: this.moveCount,
      hasUndone: this.hasUndone,
      isDeadlocked: this.isDeadlocked
    });

    // Departure consumption
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    this.player = { x: tx, y: ty };
    this.moveCount++;
    this.budget--;

    if (targetCell === C_CHECKPOINT_1) this.c1Collected = true;
    if (targetCell === C_CHECKPOINT_2) this.c2Collected = true;

    // Terminal Entry Check
    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.goalUnlocked) {
      this.triggerVictory();
      return true;
    }

    this.evaluateState();

    // Check entrapment
    if (!this.isVictorious && !this.isDeadlocked) {
      const neighbors = [
        { x: this.player.x + 1, y: this.player.y },
        { x: this.player.x - 1, y: this.player.y },
        { x: this.player.x, y: this.player.y + 1 },
        { x: this.player.x, y: this.player.y - 1 }
      ];
      const hasMoves = neighbors.some(n => this.isPassable(n.x, n.y));
      if (!hasMoves) {
        this.triggerDeadlock();
      }
    }

    return true;
  }

  triggerDeadlock() {
    if (this.isVictorious) return;
    this.isDeadlocked = true;
    // Arm 750ms auto-reset timer
    this.autoResetTimer = setTimeout(() => {
      this.restart();
    }, 750);
  }

  triggerVictory() {
    this.isVictorious = true;
    this.isDeadlocked = false;
    this.clearAutoResetTimer();

    // Save progression
    const saveRaw = this.storage.getItem('one_more_tile_save_v1');
    let save = saveRaw ? JSON.parse(saveRaw) : { version: 1, unlockedLevel: 1, currentLevel: 0 };
    save.unlockedLevel = Math.max(save.unlockedLevel, this.lvl.id + 1);
    save.currentLevel = this.lvl.id; // Next level index (0-indexed)
    this.storage.setItem('one_more_tile_save_v1', JSON.stringify(save));
  }

  restart() {
    this.clearAutoResetTimer();
    this.resetTriggered = true;
    // Reload state
    this.grid = this.lvl.grid.map(r => [...r]);
    this.player = { ...this.lvl.spawn };
    this.budget = this.lvl.budget;
    this.moveCount = 0;
    this.isVictorious = false;
    this.isDeadlocked = false;
    this.c1Collected = false;
    this.c2Collected = false;
    this.history = [];
    this.evaluateState();
  }

  clearAutoResetTimer() {
    if (this.autoResetTimer) {
      clearTimeout(this.autoResetTimer);
      this.autoResetTimer = null;
    }
  }

  undo() {
    if (this.history.length === 0 || this.isVictorious) return false;

    // Multi-tap rapid undo cancels auto-reset timer
    this.clearAutoResetTimer();

    const frame = this.history.pop();
    this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
    this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
    this.player = { ...frame.player };
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.goalUnlocked = frame.goalUnlocked;
    this.goalExtinguished = frame.goalExtinguished;
    this.budget = frame.budget;
    this.moveCount = frame.moveCount;
    this.isDeadlocked = frame.isDeadlocked;
    this.hasUndone = true;

    this.evaluateState();
    return true;
  }
}

// ============================================================================
// TEST 1: LEVEL 9 PREMATURE GOAL ENTRY PREVENTION
// ============================================================================
console.log("=== TEST 1: PREMATURE GOAL ENTRY PREVENTION ON LEVEL 9 ===");
const lvl9 = {
  id: 9,
  name: "The True Sacrifice",
  w: 3, h: 3,
  budget: 6,
  par: 6,
  spawn: { x: 0, y: 0 },
  goal: { x: 0, y: 2 },
  checkpoints: [],
  grid: [
    [2, 2, 2],
    [1, 2, 2],
    [4, 2, 2]
  ]
};

const e9 = new ProgressionEngine(lvl9);
assert.strictEqual(e9.budget, 6, "Initial budget is 6");
assert.strictEqual(e9.goalUnlocked, false, "Goal MUST be LOCKED initially (budget = 6 > 1)!");

// Step 1: RIGHT to (1,0), budget drops to 5
assert.strictEqual(e9.move(1, 0), true);
assert.strictEqual(e9.budget, 5);
assert.strictEqual(e9.goalUnlocked, false, "Goal remains LOCKED at budget = 5");

// Step 2: DOWN to (1,1), budget drops to 4
assert.strictEqual(e9.move(0, 1), true);
assert.strictEqual(e9.budget, 4);
assert.strictEqual(e9.player.x, 1);
assert.strictEqual(e9.player.y, 1);

// ATTEMPT PREMATURE GOAL ENTRY: Move LEFT to (0,1) is wall; move DOWN to (1,2) is valid.
// At (1,1), player attempts to enter Goal at (0,2)? (0,2) is not adjacent to (1,1), but let's move to (1,2):
assert.strictEqual(e9.move(0, 1), true); // Move 3: to (1,2), budget drops to 3
assert.strictEqual(e9.budget, 3);
assert.strictEqual(e9.player.x, 1);
assert.strictEqual(e9.player.y, 2);

// NOW AT (1,2): Adjacent to Goal at (0,2)!
// Attempt to take shortcut into Goal with budget = 3 > 1:
assert.strictEqual(e9.goalUnlocked, false, "Goal at (0,2) MUST STILL BE LOCKED because budget = 3 > 1!");
const shortcutAttempt = e9.move(-1, 0); // Attempt to enter Goal
assert.strictEqual(shortcutAttempt, false, "PREMATURE ENTRY INTO GOAL MUST BE STRICTLY REJECTED!");
assert.strictEqual(e9.player.x, 1, "Player must remain at (1,2)");
assert.strictEqual(e9.player.y, 2);
assert.strictEqual(e9.isVictorious, false, "Cannot win prematurely!");
console.log("[PASS] Premature goal shortcut rejected at budget = 3!");

// Now test full legitimate Level 9 trace:
e9.restart();
assert.strictEqual(e9.budget, 6);
const trace9 = [
  { dx: 1, dy: 0 }, // to (1,0), budget 5
  { dx: 1, dy: 0 }, // to (2,0), budget 4
  { dx: 0, dy: 1 }, // to (2,1), budget 3
  { dx: 0, dy: 1 }, // to (2,2), budget 2
  { dx: -1, dy: 0 } // to (1,2), budget 1
];

trace9.forEach((t, i) => {
  assert.strictEqual(e9.move(t.dx, t.dy), true, `Trace move ${i+1}`);
});
assert.strictEqual(e9.budget, 1, "Player is at (1,2) with budget === 1 (FINAL MOVE)");
assert.strictEqual(e9.goalUnlocked, true, "Goal MUST UNLOCK when budget === 1!");

// Take final move into unlocked goal:
assert.strictEqual(e9.move(-1, 0), true, "Final move into unlocked Goal succeeds!");
assert.strictEqual(e9.isVictorious, true, "Victory achieved on final move!");
assert.strictEqual(e9.budget, 0, "Final budget is EXACTLY 0 (Zero Margin for Error)!");
console.log("[PASS] Level 9 legitimate trace finishes with Bt = 0.");

// ============================================================================
// TEST 2: LEVEL 7 CALIBRATION (BUDGET = 2, PAR = 2)
// ============================================================================
console.log("\n=== TEST 2: LEVEL 7 CALIBRATION (B0 = 2, PAR = 2) ===");
const lvl7 = {
  id: 7,
  name: "The Spatial Budget",
  w: 4, h: 2,
  budget: 2,
  par: 2,
  spawn: { x: 0, y: 0 },
  goal: { x: 1, y: 1 },
  checkpoints: [],
  grid: [
    [2, 2, 2, 2],
    [1, 4, 2, 2]
  ]
};

const e7 = new ProgressionEngine(lvl7);
assert.strictEqual(e7.budget, 2);
assert.strictEqual(e7.goalUnlocked, false, "Goal locked initially at budget = 2");

// Move 1: RIGHT to (1,0), budget drops to 1
assert.strictEqual(e7.move(1, 0), true);
assert.strictEqual(e7.budget, 1);
assert.strictEqual(e7.goalUnlocked, true, "At budget = 1, Goal at (1,1) UNLOCKS!");

// Move 2: DOWN into Goal at (1,1)
assert.strictEqual(e7.move(0, 1), true);
assert.strictEqual(e7.isVictorious, true);
assert.strictEqual(e7.budget, 0, "Final budget = 0 at Goal entry!");
console.log("[PASS] Level 7 calibrated to B0 = 2, solves in exactly 2 moves with Bt = 0.");

// ============================================================================
// TEST 3: AUTO-RESET AFTER 750MS ON HARD DEADLOCK
// ============================================================================
console.log("\n=== TEST 3: AUTO-RESET ON HARD DEADLOCK ===");
const eTrap = new ProgressionEngine(lvl7);
// Move RIGHT to (1,0) (budget = 1)
eTrap.move(1, 0);
// Move RIGHT to (2,0) instead of Goal: budget drops to 0 ("LAST MOVE")
eTrap.move(1, 0);
assert.strictEqual(eTrap.budget, 0);
assert.strictEqual(eTrap.isDeadlocked, false);

// Move RIGHT to (3,0): budget drops to -1 -> CRITICAL DEADLOCK!
eTrap.move(1, 0);
assert.strictEqual(eTrap.budget, -1);
assert.strictEqual(eTrap.isDeadlocked, true, "Deadlock triggered at Bt = -1");
assert.notStrictEqual(eTrap.autoResetTimer, null, "750ms auto-reset timer armed!");

// Wait 800ms for timer to trigger
setTimeout(() => {
  assert.strictEqual(eTrap.resetTriggered, true, "Engine MUST auto-reset after 750ms!");
  assert.strictEqual(eTrap.budget, 2, "Budget reset to initial level budget");
  assert.strictEqual(eTrap.player.x, 0, "Player reset to spawn");
  assert.strictEqual(eTrap.isDeadlocked, false, "Deadlock cleared on auto-reset");
  console.log("[PASS] Auto-reset fires after 750ms on hard deadlock.");

  // Test Undo Cancelling Auto-Reset
  runUndoTest();
}, 800);

function runUndoTest() {
  console.log("\n=== TEST 4: UNDO CANCELS AUTO-RESET TIMER ===");
  const eUndo = new ProgressionEngine(lvl7);
  eUndo.move(1, 0); // budget = 1
  eUndo.move(1, 0); // budget = 0
  eUndo.move(1, 0); // budget = -1 -> Deadlock!
  assert.strictEqual(eUndo.isDeadlocked, true);
  assert.notStrictEqual(eUndo.autoResetTimer, null, "Auto-reset timer armed");

  // Player hits Undo immediately
  eUndo.undo();
  assert.strictEqual(eUndo.autoResetTimer, null, "Undo MUST immediately cancel auto-reset timer!");
  assert.strictEqual(eUndo.budget, 0, "Budget restored to 0");
  assert.strictEqual(eUndo.isDeadlocked, false, "Deadlock cleared by undo");
  console.log("[PASS] Undo successfully aborts auto-reset timer.");

  runProgressionLockTest();
}

function runProgressionLockTest() {
  console.log("\n=== TEST 5: PROGRESSION LOCK & LOCALSTORAGE PERSISTENCE ===");
  mockStorage.clear();

  // Initially: save is empty, start at Level 1
  let saveRaw = mockStorage.getItem('one_more_tile_save_v1');
  assert.strictEqual(saveRaw, null);

  // Complete Level 1
  const lvl1 = { id: 1, w: 3, h: 1, budget: 0, spawn: {x:0, y:0}, goal: {x:2, y:0}, grid: [[2, 2, 4]] };
  const e1 = new ProgressionEngine(lvl1);
  e1.move(1, 0);
  e1.move(1, 0);
  assert.strictEqual(e1.isVictorious, true);

  // Check saved state
  saveRaw = mockStorage.getItem('one_more_tile_save_v1');
  assert.notStrictEqual(saveRaw, null);
  let save = JSON.parse(saveRaw);
  assert.strictEqual(save.unlockedLevel, 2, "Level 2 is now unlocked");
  assert.strictEqual(save.currentLevel, 1, "Current level advanced to 1 (Level 2 index)");

  // Complete Level 2
  const lvl2 = { id: 2, w: 3, h: 2, budget: 0, spawn: {x:0, y:0}, goal: {x:2, y:1}, grid: [[2, 2, 2], [1, 1, 4]] };
  const e2 = new ProgressionEngine(lvl2);
  e2.move(1, 0);
  e2.move(1, 0);
  e2.move(0, 1);
  assert.strictEqual(e2.isVictorious, true);

  save = JSON.parse(mockStorage.getItem('one_more_tile_save_v1'));
  assert.strictEqual(save.unlockedLevel, 3, "Level 3 unlocked");
  assert.strictEqual(save.currentLevel, 2, "Current level is 2 (Level 3 index)");

  // Attempt to skip to Level 15 directly
  const attemptSkip = (requestedLevelId) => {
    const currentSave = JSON.parse(mockStorage.getItem('one_more_tile_save_v1'));
    if (requestedLevelId > currentSave.unlockedLevel) {
      return false; // Forbidden! Progression locked!
    }
    return true;
  };

  assert.strictEqual(attemptSkip(15), false, "Skipping to Level 15 MUST BE BLOCKED!");
  assert.strictEqual(attemptSkip(4), false, "Skipping to Level 4 MUST BE BLOCKED!");
  assert.strictEqual(attemptSkip(3), true, "Level 3 is accessible (unlocked)");
  assert.strictEqual(attemptSkip(1), true, "Level 1 is accessible (replaying previous level)");
  console.log("[PASS] Progression locked strictly to conquered levels.");

  console.log("\n>>> ALL PROGRESSION, PERSISTENCE & AUTO-RESET TESTS PASSED! <<<");
}

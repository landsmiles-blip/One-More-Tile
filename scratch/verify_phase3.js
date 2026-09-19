/**
 * Phase 3 Architecture Complete Verification Script (Levels 11 - 15)
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

// Level Definitions 11 - 15
const LEVELS_PHASE_3 = [
  // Level 11: The Greedy Snare (4x4)
  {
    id: 11,
    name: "The Greedy Snare",
    w: 4, h: 4,
    budget: 8,
    par: 8,
    spawn: { x: 0, y: 0 },
    goal: { x: 3, y: 3 },
    checkpoints: [
      { id: 1, x: 2, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 2, y: 2, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 5, 2],
      [2, 1, 1, 2],
      [2, 1, 6, 2],
      [2, 2, 2, 4]
    ],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0) [C1]
      { x: 1, y: 0 }, // to (3,0)
      { x: 0, y: 1 }, // to (3,1)
      { x: 0, y: 1 }, // to (3,2)
      { x: -1, y: 0 }, // to (2,2) [C2]
      { x: 0, y: 1 }, // to (2,3)
      { x: 1, y: 0 }  // to (3,3) [G]
    ]
  },
  // Level 12: The Double Cross (4x3)
  {
    id: 12,
    name: "The Double Cross",
    w: 4, h: 3,
    budget: 9,
    par: 9,
    spawn: { x: 1, y: 0 },
    goal: { x: 2, y: 2 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 5],
      [2, 2, 2, 2],
      [6, 2, 4, 2]
    ],
    trace: [
      { x: 1, y: 0 }, // to (2,0)
      { x: 1, y: 0 }, // to (3,0) [C1]
      { x: 0, y: 1 }, // to (3,1)
      { x: -1, y: 0 }, // to (2,1) [Central Hub]
      { x: -1, y: 0 }, // to (1,1)
      { x: -1, y: 0 }, // to (0,1)
      { x: 0, y: 1 }, // to (0,2) [C2]
      { x: 1, y: 0 }, // to (1,2)
      { x: 1, y: 0 }  // to (2,2) [G]
    ]
  },
  // Level 13: The Fragile Span (5x3)
  {
    id: 13,
    name: "The Fragile Span",
    w: 5, h: 3,
    budget: 10,
    par: 10,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 2 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 }
    ],
    grid: [
      [2, 2, 7, 2, 5],
      [0, 1, 0, 1, 2],
      [4, 2, 7, 2, 2]
    ],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0) [Crumbling Span 1]
      { x: 1, y: 0 }, // to (3,0) [(2,0) collapses to VOID]
      { x: 1, y: 0 }, // to (4,0) [C1]
      { x: 0, y: 1 }, // to (4,1)
      { x: 0, y: 1 }, // to (4,2)
      { x: -1, y: 0 }, // to (3,2)
      { x: -1, y: 0 }, // to (2,2) [Crumbling Span 2]
      { x: -1, y: 0 }, // to (1,2) [(2,2) collapses to VOID]
      { x: -1, y: 0 }  // to (0,2) [G]
    ]
  },
  // Level 14: The False Haven (4x4)
  {
    id: 14,
    name: "The False Haven",
    w: 4, h: 4,
    budget: 9,
    par: 9,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 3, y: 3, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 5],
      [2, 1, 7, 2],
      [2, 0, 1, 2],
      [4, 2, 2, 6]
    ],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0)
      { x: 1, y: 0 }, // to (3,0) [C1]
      { x: 0, y: 1 }, // to (3,1)
      { x: 0, y: 1 }, // to (3,2)
      { x: 0, y: 1 }, // to (3,3) [C2]
      { x: -1, y: 0 }, // to (2,3)
      { x: -1, y: 0 }, // to (1,3)
      { x: -1, y: 0 }  // to (0,3) [G]
    ]
  },
  // Level 15: The Gauntlet of Ruin (5x4)
  {
    id: 15,
    name: "The Gauntlet of Ruin",
    w: 5, h: 4,
    budget: 11,
    par: 11,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 4, y: 3, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 7, 2, 5],
      [2, 1, 0, 1, 2],
      [2, 1, 0, 1, 2],
      [4, 2, 7, 2, 6]
    ],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0) [Crumbling Span 1]
      { x: 1, y: 0 }, // to (3,0) [(2,0) collapses to VOID]
      { x: 1, y: 0 }, // to (4,0) [C1]
      { x: 0, y: 1 }, // to (4,1)
      { x: 0, y: 1 }, // to (4,2)
      { x: 0, y: 1 }, // to (4,3) [C2]
      { x: -1, y: 0 }, // to (3,3)
      { x: -1, y: 0 }, // to (2,3) [Crumbling Span 2]
      { x: -1, y: 0 }, // to (1,3) [(2,3) collapses to VOID]
      { x: -1, y: 0 }  // to (0,3) [G]
    ]
  }
];

// 1. Stage Centering Math Verification for Phase 3 Grids (up to 5x4)
console.log("=== 1. VALIDATING STAGE CENTERING FOR PHASE 3 (5x4) ===");
const viewports = [
  { name: "Mobile Portrait (390x844)", w: 390, h: 844, hudH: 56, padY: 24, padX: 16 },
  { name: "Desktop 1080p (1920x1080)", w: 1920, h: 1080, hudH: 56, padY: 32, padX: 24, maxShellW: 440, maxShellH: 880 },
  { name: "Foldable Square (600x600)", w: 600, h: 600, hudH: 56, padY: 32, padX: 24, maxShellW: 440, maxShellH: 600 }
];

viewports.forEach(vp => {
  const shellW = vp.maxShellW ? Math.min(vp.w, vp.maxShellW) : vp.w;
  const shellH = vp.maxShellH ? Math.min(vp.h, vp.maxShellH) : vp.h;
  const rectW = shellW - vp.padX;
  const rectH = shellH - vp.padY - vp.hudH;

  LEVELS_PHASE_3.forEach(lvl => {
    const cols = lvl.w;
    const rows = lvl.h;
    const propW = (rectW * 0.85) / cols;
    const propH = (rectH * 0.65) / rows;
    const tileSize = Math.max(48, Math.min(110, Math.floor(Math.min(propW, propH))));
    const originX = Math.floor((rectW - (cols * tileSize)) / 2);
    const originY = Math.floor((rectH - (rows * tileSize)) / 2);

    assert.ok(originY > 0, `${vp.name} Level ${lvl.id}: originY (${originY}) must be > 0`);
    assert.ok(originX >= 0, `${vp.name} Level ${lvl.id}: originX (${originX}) must be >= 0`);
  });
  console.log(`[PASS] ${vp.name}: originY > 0 across all Phase 3 levels.`);
});

// 2. Engine Simulation with Crumbling Tiles, Checkpoint Gating & Bt Zero Margin
class Phase3Engine {
  constructor(lvl) {
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

    this.history = [];
    this.evaluateState();
  }

  evaluateState() {
    const checkpointsSatisfied = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);

    if (this.budget >= 0 && checkpointsSatisfied) {
      this.goalUnlocked = true;
      this.goalExtinguished = false;
    } else if (this.budget < 0) {
      this.goalUnlocked = false;
      this.goalExtinguished = true;
      this.isDeadlocked = true;
    } else {
      this.goalUnlocked = false;
    }
  }

  isPassable(tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return false;
    const c = this.grid[ty][tx];
    if (c === C_WALL || c === C_CONSUMED || c === C_VOID) return false;
    if (c === C_GOAL && !this.goalUnlocked) return false;
    if (c === C_CHECKPOINT_2 && !this.c1Collected) return false;
    return true;
  }

  move(dx, dy) {
    if (this.isVictorious || this.isDeadlocked) return false;

    const tx = this.player.x + dx;
    const ty = this.player.y + dy;

    if (!this.isPassable(tx, ty)) return false;

    const targetCell = this.grid[ty][tx];
    const depCell = this.grid[this.player.y][this.player.x];

    // Push state frame
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

    // Departure cell consumption:
    // C_CRUMBLING mutates directly to C_VOID!
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

    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.goalUnlocked) {
      this.isVictorious = true;
      return true;
    }

    this.evaluateState();
    return true;
  }

  undo() {
    if (this.history.length === 0 || this.isVictorious) return false;

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

    if (!this.hasUndone) {
      this.hasUndone = true;
    }

    this.evaluateState();
    return true;
  }
}

// 3. Verify Deterministic Traces for Levels 11 - 15
console.log("\n=== 2. VERIFYING LEVELS 11-15 DETERMINISTIC TRACES ===");
LEVELS_PHASE_3.forEach(lvl => {
  const engine = new Phase3Engine(lvl);

  lvl.trace.forEach((d, idx) => {
    const success = engine.move(d.x, d.y);
    assert.strictEqual(success, true, `Level ${lvl.id} step ${idx + 1}: Move must succeed`);
  });

  assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} (${lvl.name}): Victory must be achieved`);
  assert.strictEqual(engine.moveCount, lvl.par, `Level ${lvl.id}: Move count must equal par (${lvl.par})`);
  assert.strictEqual(engine.budget, 0, `Level ${lvl.id}: Remaining budget must be EXACTLY 0 at Goal entry (zero margin for error)!`);
  assert.strictEqual(engine.isDeadlocked, false, `Level ${lvl.id}: Deadlock must be false`);
  console.log(`[PASS] Level ${lvl.id} (${lvl.name}): Solved in ${engine.moveCount} moves with Bt = 0!`);
});

// 4. Verify Crumbling Tile Collapse to Void & One-Way Behavior
console.log("\n=== 3. VERIFYING CRUMBLING TILE COLLAPSE (C_CRUMBLING -> C_VOID) ===");
const lvl13Engine = new Phase3Engine(LEVELS_PHASE_3[2]); // Level 13
assert.strictEqual(lvl13Engine.grid[0][2], C_CRUMBLING, "Initial tile at (2,0) is C_CRUMBLING");

lvl13Engine.move(1, 0); // (1,0)
lvl13Engine.move(1, 0); // steps onto (2,0) [Crumbling tile]
assert.strictEqual(lvl13Engine.player.x, 2);
assert.strictEqual(lvl13Engine.player.y, 0);

lvl13Engine.move(1, 0); // steps off (2,0) onto (3,0)
assert.strictEqual(lvl13Engine.grid[0][2], C_VOID, "Upon exit, tile at (2,0) MUST MUTATE TO C_VOID (chasm)!");

// Attempting to step back to (2,0) must fail
const stepBack = lvl13Engine.move(-1, 0);
assert.strictEqual(stepBack, false, "Stepping back into C_VOID must be strictly REJECTED!");
console.log("[PASS] Crumbling tile correctly collapses to C_VOID and blocks return.");

// 5. Verify Bi-directional Undo on Crumbling Tile
console.log("\n=== 4. VERIFYING BI-DIRECTIONAL UNDO RESTORING C_CRUMBLING ===");
assert.strictEqual(lvl13Engine.undo(), true, "Undo step off crumbling tile");
assert.strictEqual(lvl13Engine.player.x, 2, "Player snaps back onto crumbling tile (2,0)");
assert.strictEqual(lvl13Engine.grid[0][2], C_CRUMBLING, "Crumbling tile restored bit-for-bit upon undo!");

assert.strictEqual(lvl13Engine.undo(), true, "Undo step onto crumbling tile");
assert.strictEqual(lvl13Engine.player.x, 1);
assert.strictEqual(lvl13Engine.grid[0][2], C_CRUMBLING, "Crumbling tile remains intact ahead");
console.log("[PASS] Bi-directional undo perfectly restores C_CRUMBLING.");

// 6. Verify Zero Margin for Error (Detour at Bt = 0 triggers Deadlock at Bt = -1)
console.log("\n=== 5. VERIFYING ZERO MARGIN FOR ERROR (DEADLOCK AT Bt = -1) ===");
const lvl11Engine = new Phase3Engine(LEVELS_PHASE_3[0]); // Level 11, B0 = 8
// Execute 7 moves of trace
for (let i = 0; i < 7; i++) {
  lvl11Engine.move(LEVELS_PHASE_3[0].trace[i].x, LEVELS_PHASE_3[0].trace[i].y);
}
assert.strictEqual(lvl11Engine.budget, 1, "Budget is 1 at step 7");
assert.strictEqual(lvl11Engine.player.x, 2);
assert.strictEqual(lvl11Engine.player.y, 3);

// Take a detour LEFT to (1,3) instead of RIGHT to Goal (3,3)
lvl11Engine.move(-1, 0); // step 8 to (1,3), budget reaches 0
assert.strictEqual(lvl11Engine.budget, 0, "Budget is 0 at step 8");
assert.strictEqual(lvl11Engine.isDeadlocked, false, "Not deadlocked yet at Bt = 0");

// Now take another step to (0,3): budget drops to -1 -> DEADLOCK!
lvl11Engine.move(-1, 0); // step 9 to (0,3)
assert.strictEqual(lvl11Engine.budget, -1, "Budget is now -1");
assert.strictEqual(lvl11Engine.isDeadlocked, true, "MUST trigger DEADLOCK when Bt = -1!");
assert.strictEqual(lvl11Engine.goalExtinguished, true, "Goal MUST be extinguished at Bt = -1!");
console.log("[PASS] Zero margin for error verified: any detour triggers deadlock at Bt = -1.");

console.log("\n>>> ALL PHASE 3 ARCHITECTURE TESTS PASSED WITH 100% PRECISION! <<<");

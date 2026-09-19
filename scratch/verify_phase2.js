/**
 * Phase 2 Architecture Verification Script
 * Validates:
 * 1. Centering Math across viewports (originY > 0)
 * 2. Levels 6-10 data structures and deterministic solution traces
 * 3. Checkpoint C1/C2 passability gating and sequence resolution
 * 4. Spatial Budget Bt live countdown, warning, deadlock at Bt = -1
 * 5. Bi-directional undo state rollback and goal rekindling
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

// Level Definitions 6 - 10
const LEVELS_PHASE_2 = [
  // Level 6: The Return Corridor (4x3, Return Bridge)
  {
    id: 6,
    name: "The Return Corridor",
    w: 4, h: 3,
    budget: 0,
    par: 8,
    grid: [
      [2, 2, 2, 2],
      [1, 1, 1, 2],
      [4, 2, 2, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 2 },
    checkpoints: [],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0)
      { x: 1, y: 0 }, // to (3,0)
      { x: 0, y: 1 }, // to (3,1)
      { x: 0, y: 1 }, // to (3,2)
      { x: -1, y: 0 }, // to (2,2)
      { x: -1, y: 0 }, // to (1,2)
      { x: -1, y: 0 }  // to (0,2) [G]
    ]
  },
  // Level 7: The Spatial Budget (4x2, Budget Bt = 3)
  {
    id: 7,
    name: "The Spatial Budget",
    w: 4, h: 2,
    budget: 3,
    par: 2,
    grid: [
      [2, 2, 2, 2],
      [1, 4, 2, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 1, y: 1 },
    checkpoints: [],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 0, y: 1 }  // to (1,1) [G]
    ]
  },
  // Level 8: Checkpoint Sequence (3x3, C1 at (2,0), C2 at (0,2), G at (2,2))
  {
    id: 8,
    name: "Checkpoint Sequence",
    w: 3, h: 3,
    budget: 0,
    par: 8,
    grid: [
      [2, 2, 5],
      [2, 2, 2],
      [6, 2, 4]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 2, y: 2 },
    checkpoints: [
      { id: 1, x: 2, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
    ],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0) [C1]
      { x: 0, y: 1 }, // to (2,1)
      { x: -1, y: 0 }, // to (1,1)
      { x: -1, y: 0 }, // to (0,1)
      { x: 0, y: 1 }, // to (0,2) [C2]
      { x: 1, y: 0 }, // to (1,2)
      { x: 1, y: 0 }  // to (2,2) [G]
    ]
  },
  // Level 9: The True Sacrifice (3x3, Parity Sacrifice, Bt = 6, 1 spare tile)
  {
    id: 9,
    name: "The True Sacrifice",
    w: 3, h: 3,
    budget: 6,
    par: 6,
    grid: [
      [2, 2, 2],
      [1, 2, 2],
      [4, 2, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 2 },
    checkpoints: [],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0)
      { x: 0, y: 1 }, // to (2,1)
      { x: 0, y: 1 }, // to (2,2)
      { x: -1, y: 0 }, // to (1,2)
      { x: -1, y: 0 }  // to (0,2) [G]
    ]
  },
  // Level 10: The Graduation Exam (3x3, Center Sink G at (1,1), C1 at (2,0), C2 at (0,2))
  {
    id: 10,
    name: "The Graduation Exam",
    w: 3, h: 3,
    budget: 0,
    par: 8,
    grid: [
      [2, 2, 5],
      [2, 4, 2],
      [6, 2, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 1, y: 1 },
    checkpoints: [
      { id: 1, x: 2, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
    ],
    trace: [
      { x: 1, y: 0 }, // to (1,0)
      { x: 1, y: 0 }, // to (2,0) [C1]
      { x: 0, y: 1 }, // to (2,1)
      { x: 0, y: 1 }, // to (2,2)
      { x: -1, y: 0 }, // to (1,2)
      { x: -1, y: 0 }, // to (0,2) [C2]
      { x: 0, y: -1 }, // to (0,1)
      { x: 1, y: 0 }  // to (1,1) [G]
    ]
  }
];

// 1. Centering Math Validation
console.log("=== 1. VALIDATING VERTICAL CENTERING MATH ===");
const viewports = [
  { name: "Mobile Portrait", w: 390, h: 844, hudH: 56, padY: 24, padX: 16 },
  { name: "Desktop 1080p", w: 1920, h: 1080, hudH: 56, padY: 32, padX: 24, maxShellW: 440, maxShellH: 880 },
  { name: "Foldable Square", w: 600, h: 600, hudH: 56, padY: 32, padX: 24, maxShellW: 440, maxShellH: 600 }
];

viewports.forEach(vp => {
  const shellW = vp.maxShellW ? Math.min(vp.w, vp.maxShellW) : vp.w;
  const shellH = vp.maxShellH ? Math.min(vp.h, vp.maxShellH) : vp.h;
  const rectW = shellW - vp.padX;
  const rectH = shellH - vp.padY - vp.hudH;

  LEVELS_PHASE_2.forEach(lvl => {
    const cols = lvl.w;
    const rows = lvl.h;
    const propW = (rectW * 0.85) / cols;
    const propH = (rectH * 0.65) / rows;
    const tileSize = Math.max(48, Math.min(110, Math.floor(Math.min(propW, propH))));
    const originX = Math.floor((rectW - (cols * tileSize)) / 2);
    const originY = Math.floor((rectH - (rows * tileSize)) / 2);

    assert.ok(originY > 0, `${vp.name} Level ${lvl.id}: originY (${originY}) must be strictly > 0`);
    assert.ok(originX >= 0, `${vp.name} Level ${lvl.id}: originX (${originX}) must be >= 0`);
    assert.ok(cols * tileSize <= rectW, `${vp.name} Level ${lvl.id}: Grid fits horizontally`);
    assert.ok(rows * tileSize <= rectH, `${vp.name} Level ${lvl.id}: Grid fits vertically`);
  });
  console.log(`[PASS] ${vp.name}: Canvas rect ${rectW}x${rectH} -> All levels originY > 0`);
});

// 2. State Machine Engine with Checkpoints, Budget & Bi-directional Undo
class Phase2Engine {
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
    this.star3Shattered = false;

    // Checkpoint states
    this.c1Collected = false;
    this.c2Collected = false;
    this.hasC1 = lvl.checkpoints.some(c => c.id === 1);
    this.hasC2 = lvl.checkpoints.some(c => c.id === 2);

    this.goalUnlocked = false;
    this.goalExtinguished = false;

    this.history = [];
    this.evaluateState();
  }

  evaluateState() {
    // Untouched count (excluding goal and current player pos)
    let untouchedCount = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.grid[y][x];
        if ((c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2) && !(x === this.player.x && y === this.player.y)) {
          untouchedCount++;
        }
      }
    }

    // Checkpoints prerequisite
    const checkpointsSatisfied = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);

    // Goal unlock condition:
    if (this.initialBudget === 0) {
      // Hamiltonian Clear-All: all tiles must be consumed and all checkpoints collected
      this.goalUnlocked = (untouchedCount === 0 && checkpointsSatisfied);
    } else {
      // Budget Level: Goal is unlocked while budget >= 0 and checkpoints satisfied
      if (this.budget >= 0 && checkpointsSatisfied) {
        this.goalUnlocked = true;
        this.goalExtinguished = false;
      } else if (this.budget < 0) {
        this.goalUnlocked = false;
        this.goalExtinguished = true;
        this.isDeadlocked = true;
      }
    }
  }

  isPassable(tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return false;
    const c = this.grid[ty][tx];
    if (c === C_WALL || c === C_CONSUMED || c === C_VOID) return false;
    if (c === C_GOAL && !this.goalUnlocked) return false;

    // Checkpoint gating: C2 is impassable while C1 is active!
    if (c === C_CHECKPOINT_2 && !this.c1Collected) return false;

    return true;
  }

  move(dx, dy) {
    if (this.isVictorious || this.isDeadlocked) return false;

    const tx = this.player.x + dx;
    const ty = this.player.y + dy;

    if (!this.isPassable(tx, ty)) return false;

    const targetCell = this.grid[ty][tx];

    // Push undo frame
    this.history.push({
      player: { ...this.player },
      target: { x: tx, y: ty },
      dir: { dx, dy },
      prevCellState: this.grid[this.player.y][this.player.x],
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

    // Consume departure cell
    this.grid[this.player.y][this.player.x] = C_CONSUMED;

    // Move player
    this.player = { x: tx, y: ty };
    this.moveCount++;

    // Decrement budget if budget level
    if (this.initialBudget > 0) {
      this.budget--;
    }

    // Checkpoint interaction
    if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    }

    // Check goal entry
    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.goalUnlocked) {
      this.isVictorious = true;
      return true;
    }

    // Evaluate state
    this.evaluateState();

    // Check local entrapment
    if (!this.isVictorious && !this.isDeadlocked) {
      const neighbors = [
        { x: this.player.x + 1, y: this.player.y },
        { x: this.player.x - 1, y: this.player.y },
        { x: this.player.x, y: this.player.y + 1 },
        { x: this.player.x, y: this.player.y - 1 }
      ];
      const valid = neighbors.some(n => this.isPassable(n.x, n.y));
      if (!valid) {
        this.isDeadlocked = true;
      }
    }

    return true;
  }

  undo() {
    if (this.history.length === 0 || this.isVictorious) return false;

    const frame = this.history.pop();

    // Restore departure cell
    this.grid[frame.player.y][frame.player.x] = frame.prevCellState;

    // Restore target cell
    this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;

    // Restore positions & states
    this.player = { ...frame.player };
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.goalUnlocked = frame.goalUnlocked;
    this.goalExtinguished = frame.goalExtinguished;
    this.budget = frame.budget;
    this.moveCount = frame.moveCount;
    this.isDeadlocked = frame.isDeadlocked;

    // Star 3 shatter penalty on first undo
    if (!this.hasUndone) {
      this.hasUndone = true;
      this.star3Shattered = true;
    }

    this.evaluateState();
    return true;
  }
}

// 3. Verify Deterministic Traces for Levels 6 - 10
console.log("\n=== 2. VERIFYING LEVELS 6-10 TRACES ===");
LEVELS_PHASE_2.forEach(lvl => {
  const engine = new Phase2Engine(lvl);

  lvl.trace.forEach((d, idx) => {
    const success = engine.move(d.x, d.y);
    assert.strictEqual(success, true, `Level ${lvl.id} step ${idx + 1}: Move must succeed`);
  });

  assert.strictEqual(engine.isVictorious, true, `Level ${lvl.id} (${lvl.name}): Must achieve Victory`);
  assert.strictEqual(engine.moveCount, lvl.par, `Level ${lvl.id}: Moves (${engine.moveCount}) must match par (${lvl.par})`);
  assert.strictEqual(engine.isDeadlocked, false, `Level ${lvl.id}: Deadlock must be false`);
  console.log(`[PASS] Level ${lvl.id} (${lvl.name}): Solved in ${engine.moveCount} moves (Par: ${lvl.par})`);
});

// 4. Verify Checkpoint Passability Gating (C2 impassable while C1 active)
console.log("\n=== 3. VERIFYING CHECKPOINT C2 PASSABILITY GATING ===");
const lvl8Engine = new Phase2Engine(LEVELS_PHASE_2[2]); // Level 8
// Spawn at (0,0). Attempt to move DOWN to (0,1) then DOWN to (0,2) [C2] before visiting C1
assert.strictEqual(lvl8Engine.move(0, 1), true, "Move DOWN to (0,1) valid");
assert.strictEqual(lvl8Engine.isPassable(0, 2), false, "C2 at (0,2) MUST BE IMPASSABLE while C1 active");
assert.strictEqual(lvl8Engine.move(0, 1), false, "Move into C2 must be rejected!");
console.log("[PASS] Checkpoint C2 is impassable while C1 is active.");

// 5. Verify Spatial Budget Failure at Bt = -1
console.log("\n=== 4. VERIFYING SPATIAL BUDGET FAILURE AT Bt = -1 ===");
const lvl7Engine = new Phase2Engine(LEVELS_PHASE_2[1]); // Level 7, Bt = 3
assert.strictEqual(lvl7Engine.budget, 3);
lvl7Engine.move(1, 0); // step 1: (1,0), Bt = 2
lvl7Engine.move(1, 0); // step 2: (2,0), Bt = 1
lvl7Engine.move(1, 0); // step 3: (3,0), Bt = 0 (Warning state)
assert.strictEqual(lvl7Engine.budget, 0, "Budget must reach 0 (warning state)");
assert.strictEqual(lvl7Engine.isDeadlocked, false, "Not deadlocked yet at Bt = 0");
lvl7Engine.move(0, 1); // step 4: (3,1), Bt = -1 -> DEADLOCK!
assert.strictEqual(lvl7Engine.budget, -1, "Budget must be -1");
assert.strictEqual(lvl7Engine.isDeadlocked, true, "MUST trigger DEADLOCK when Bt reaches -1!");
assert.strictEqual(lvl7Engine.goalExtinguished, true, "Goal must be EXTINGUISHED when Bt = -1!");
console.log("[PASS] Spatial Budget triggers immediate deadlock and extinguishes goal at Bt = -1.");

// 6. Verify Bi-directional Undo & Goal Rekindling
console.log("\n=== 5. VERIFYING BI-DIRECTIONAL UNDO & GOAL REKINDLING ===");
// Undo the fatal step that caused Bt = -1
assert.strictEqual(lvl7Engine.undo(), true, "Undo must succeed");
assert.strictEqual(lvl7Engine.budget, 0, "Budget restored to 0");
assert.strictEqual(lvl7Engine.isDeadlocked, false, "Deadlock cleared on undo");
assert.strictEqual(lvl7Engine.goalExtinguished, false, "Goal rekindled on undo");
assert.strictEqual(lvl7Engine.hasUndone, true, "hasUndone marked true");
assert.strictEqual(lvl7Engine.star3Shattered, true, "Star 3 shattered on first undo");

// Continue to goal from (3,0)
lvl7Engine.move(-1, 0); // to (2,0)
// Can undo all the way back to spawn
while (lvl7Engine.moveCount > 0) {
  lvl7Engine.undo();
}
assert.strictEqual(lvl7Engine.player.x, 0);
assert.strictEqual(lvl7Engine.player.y, 0);
assert.strictEqual(lvl7Engine.budget, 3);
console.log("[PASS] Full bi-directional rollback to spawn successful.");

console.log("\n>>> ALL PHASE 2 ARCHITECTURE CHECKS PASSED DETERMINISTICALLY! <<<");

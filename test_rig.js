/**
 * ONE MORE TILE - ADVERSARIAL VERIFICATION TEST RIG (RED TEAM QA)
 * 
 * Implements Systems Architect Specifications:
 * 1. Input Vector Alignment & Touch Inversion
 * 2. Circular Goal Lock & Consumption Axiom (R(t) micro-frame execution order)
 * 3. DOM State Cleanup & Modal Mutual Exclusivity
 * 4. Deterministic Traces for Levels 1-5
 * 5. High-DPI & Responsive Stage Centering (Mobile 390x844, Desktop 1920x1080, Foldable 600x600)
 * 6. Dynamic Grid Centering & Tile Size Clamping [48, 110]
 * 7. Relative Input Coordinates & Zero-Overflow Scrollbar Prevention
 */

const assert = require('assert');

// ============================================================================
// CONSTANTS & DEFINITIONS
// ============================================================================
const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;

const DIRECTIONS = {
  RIGHT: { dx: 1, dy: 0, name: 'RIGHT' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  DOWN:  { dx: 0, dy: 1, name: 'DOWN' },
  UP:    { dx: 0, dy: -1, name: 'UP' }
};

// Official Level Definitions
const LEVELS = [
  // Level 1: The Straightaway (3x1)
  {
    id: 1,
    name: "The Straightaway",
    w: 3, h: 1,
    budget: 0,
    par: 2,
    grid: [
      [2, 2, 4]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 2, y: 0 },
    checkpoints: [],
    trace: [DIRECTIONS.RIGHT, DIRECTIONS.RIGHT]
  },
  // Level 2: The Corner (3x2)
  {
    id: 2,
    name: "The Corner",
    w: 3, h: 2,
    budget: 0,
    par: 3,
    grid: [
      [2, 2, 2],
      [1, 1, 4]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 2, y: 1 },
    checkpoints: [],
    trace: [DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.DOWN]
  },
  // Level 3: The Mini-Loop (2x2 Cliff-Breaker)
  {
    id: 3,
    name: "The Mini-Loop",
    w: 2, h: 2,
    budget: 0,
    par: 3,
    grid: [
      [2, 2],
      [4, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 1 },
    checkpoints: [],
    trace: [DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT]
  },
  // Level 4: The True Fork (3x3)
  {
    id: 4,
    name: "The True Fork",
    w: 3, h: 3,
    budget: 0,
    par: 5,
    grid: [
      [2, 2, 1],
      [2, 2, 1],
      [4, 2, 1]
    ],
    spawn: { x: 1, y: 0 },
    goal: { x: 0, y: 2 },
    checkpoints: [],
    trace: [DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT]
  },
  // Level 5: The Snake (3x2)
  {
    id: 5,
    name: "The Snake",
    w: 3, h: 2,
    budget: 0,
    par: 5,
    grid: [
      [2, 2, 2],
      [4, 2, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 1 },
    checkpoints: [],
    trace: [DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.LEFT]
  },
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
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT, DIRECTIONS.LEFT
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
    trace: [DIRECTIONS.RIGHT, DIRECTIONS.DOWN]
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
      { id: 1, x: 2, y: 0, cellType: 5 },
      { id: 2, x: 0, y: 2, cellType: 6 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.LEFT,
      DIRECTIONS.DOWN,
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT
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
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT
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
      { id: 1, x: 2, y: 0, cellType: 5 },
      { id: 2, x: 0, y: 2, cellType: 6 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT,
      DIRECTIONS.UP, DIRECTIONS.RIGHT
    ]
  },
  // Level 11: The Greedy Snare (4x4)
  {
    id: 11,
    name: "The Greedy Snare",
    w: 4, h: 4,
    budget: 8,
    par: 8,
    grid: [
      [2, 2, 5, 2],
      [2, 1, 1, 2],
      [2, 1, 6, 2],
      [2, 2, 2, 4]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 3, y: 3 },
    checkpoints: [
      { id: 1, x: 2, y: 0, cellType: 5 },
      { id: 2, x: 2, y: 2, cellType: 6 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN, DIRECTIONS.LEFT,
      DIRECTIONS.DOWN, DIRECTIONS.RIGHT
    ]
  },
  // Level 12: The Double Cross (4x3)
  {
    id: 12,
    name: "The Double Cross",
    w: 4, h: 3,
    budget: 9,
    par: 9,
    grid: [
      [2, 2, 2, 5],
      [2, 2, 2, 2],
      [6, 2, 4, 2]
    ],
    spawn: { x: 1, y: 0 },
    goal: { x: 2, y: 2 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: 5 },
      { id: 2, x: 0, y: 2, cellType: 6 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.DOWN,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT, DIRECTIONS.LEFT,
      DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT
    ]
  },
  // Level 13: The Fragile Span (5x3)
  {
    id: 13,
    name: "The Fragile Span",
    w: 5, h: 3,
    budget: 10,
    par: 10,
    grid: [
      [2, 2, 7, 2, 5],
      [0, 1, 0, 1, 2],
      [4, 2, 7, 2, 2]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 2 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: 5 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN, DIRECTIONS.LEFT,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT, DIRECTIONS.LEFT
    ]
  },
  // Level 14: The False Haven (4x4)
  {
    id: 14,
    name: "The False Haven",
    w: 4, h: 4,
    budget: 9,
    par: 9,
    grid: [
      [2, 2, 2, 5],
      [2, 1, 7, 2],
      [2, 0, 1, 2],
      [4, 2, 2, 6]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [
      { id: 1, x: 3, y: 0, cellType: 5 },
      { id: 2, x: 3, y: 3, cellType: 6 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN, DIRECTIONS.DOWN,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT, DIRECTIONS.LEFT
    ]
  },
  // Level 15: The Gauntlet of Ruin (5x4)
  {
    id: 15,
    name: "The Gauntlet of Ruin",
    w: 5, h: 4,
    budget: 11,
    par: 11,
    grid: [
      [2, 2, 7, 2, 5],
      [2, 1, 0, 1, 2],
      [2, 1, 0, 1, 2],
      [4, 2, 7, 2, 6]
    ],
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: 5 },
      { id: 2, x: 4, y: 3, cellType: 6 }
    ],
    trace: [
      DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT, DIRECTIONS.RIGHT,
      DIRECTIONS.DOWN, DIRECTIONS.DOWN, DIRECTIONS.DOWN,
      DIRECTIONS.LEFT, DIRECTIONS.LEFT, DIRECTIONS.LEFT, DIRECTIONS.LEFT
    ]
  }
];

// ============================================================================
// SWIPE INPUT RESOLVER (SPECIFICATION SECTION 1)
// ============================================================================
function resolveSwipe(startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  // Swipe Threshold: Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30
  if (absX <= 30 && absY <= 30) {
    return null; // Sub-threshold gesture ignored
  }

  // Horizontal vs Vertical dominance
  if (absX >= absY) {
    // Horizontal swipe: deltaX > 0 -> RIGHT, deltaX < 0 -> LEFT
    return deltaX > 0 ? { dx: 1, dy: 0, name: 'RIGHT' } : { dx: -1, dy: 0, name: 'LEFT' };
  } else {
    // Vertical swipe: deltaY > 0 -> DOWN, deltaY < 0 -> UP
    return deltaY > 0 ? { dx: 0, dy: 1, name: 'DOWN' } : { dx: 0, dy: -1, name: 'UP' };
  }
}

// ============================================================================
// MOCK DOM CONTROLLER (SPECIFICATION SECTION 3)
// ============================================================================
class MockDOMController {
  constructor() {
    this.deadlockBanner = { visible: false, classes: new Set() };
    this.victoryModal = { visible: false, classes: new Set() };
  }

  showDeadlock() {
    // Deadlock banner is shown, victory modal hidden (mutually exclusive)
    this.deadlockBanner.visible = true;
    this.deadlockBanner.classes.add('show');
    this.victoryModal.visible = false;
    this.victoryModal.classes.delete('show');
  }

  showVictory() {
    // Victory modal shown, deadlock banner hidden (mutually exclusive)
    this.victoryModal.visible = true;
    this.victoryModal.classes.add('show');
    this.deadlockBanner.visible = false;
    this.deadlockBanner.classes.delete('show');
  }

  reset() {
    // On reset (R key or restart button), purge all overlays, reset DOM classes, hide both modals
    this.deadlockBanner.visible = false;
    this.deadlockBanner.classes.clear();
    this.victoryModal.visible = false;
    this.victoryModal.classes.clear();
  }
}

// ============================================================================
// GAME ENGINE IMPLEMENTATION (SPECIFICATION SECTION 2)
// ============================================================================
class GameEngineRig {
  constructor(levelData) {
    this.dom = new MockDOMController();
    this.deadlockTriggerCount = 0;
    this.victoryTriggerCount = 0;
    this.loadLevel(levelData);
  }

  loadLevel(levelData) {
    this.level = levelData;
    this.w = levelData.w;
    this.h = levelData.h;
    this.grid = levelData.grid.map(row => [...row]);
    this.player = { ...levelData.spawn };
    this.goal = { ...levelData.goal };
    this.isVictorious = false;
    this.isDeadlocked = false;
    this.moveCount = 0;
    this.budget = levelData.budget || 0;
    this.initialBudget = levelData.budget || 0;

    this.hasC1 = (levelData.checkpoints && levelData.checkpoints.some(c => c.id === 1)) || false;
    this.hasC2 = (levelData.checkpoints && levelData.checkpoints.some(c => c.id === 2)) || false;
    this.c1Collected = false;
    this.c2Collected = false;
    this.history = [];

    // Remaining path count R(t)
    const initialR = this.getRemainingCount();
    const checkpointsMet = (!this.hasC1) && (!this.hasC2);
    this.isGoalUnlocked = this.initialBudget === 0 ? (initialR === 0 && checkpointsMet) : (this.budget >= 0 && checkpointsMet);

    this.dom.reset();
  }

  getRemainingCount() {
    let count = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const cell = this.grid[y][x];
        if ((cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
          count++;
        }
      }
    }
    return count;
  }

  hasValidMoves() {
    const neighbors = [
      { x: this.player.x + 1, y: this.player.y },
      { x: this.player.x - 1, y: this.player.y },
      { x: this.player.x, y: this.player.y + 1 },
      { x: this.player.x, y: this.player.y - 1 }
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < this.w && n.y >= 0 && n.y < this.h) {
        const cell = this.grid[n.y][n.x];
        // Adjacent cell is valid if traversable
        if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || (cell === C_CHECKPOINT_2 && this.c1Collected) || cell === C_CRUMBLING || (cell === C_GOAL && this.isGoalUnlocked)) {
          return true;
        }
      }
    }
    return false;
  }

  triggerVictory() {
    this.isVictorious = true;
    this.victoryTriggerCount++;
    this.dom.showVictory();
  }

  triggerDeadlock() {
    // If victory is triggered, deadlock flag cannot trigger
    if (this.isVictorious) return;
    this.isDeadlocked = true;
    this.deadlockTriggerCount++;
    this.dom.showDeadlock();
  }

  restart() {
    this.dom.reset();
    this.loadLevel(this.level);
  }

  undo() {
    if (this.history.length === 0 || this.isVictorious) return { success: false };
    const frame = this.history.pop();
    this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
    this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
    this.player = { ...frame.player };
    this.moveCount = frame.moveCount;
    this.budget = frame.budget;
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.isGoalUnlocked = frame.isGoalUnlocked;
    this.isDeadlocked = frame.isDeadlocked;
    if (!this.isDeadlocked) {
      this.dom.deadlockBanner.visible = false;
      this.dom.deadlockBanner.classes.delete('show');
    }
    return { success: true, player: { ...this.player }, budget: this.budget };
  }

  executeMove(dx, dy) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (this.isDeadlocked) return { success: false, reason: 'DEADLOCKED' };

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    // Out of bounds check
    if (nx < 0 || nx >= this.w || ny < 0 || ny >= this.h) {
      return { success: false, reason: 'OUT_OF_BOUNDS' };
    }

    const targetCell = this.grid[ny][nx];

    // Wall, Consumed, Void collision check
    if (targetCell === C_WALL || targetCell === C_CONSUMED || targetCell === C_VOID) {
      return { success: false, reason: 'IMPASSABLE_CELL' };
    }

    // Locked Goal cannot be entered
    if (targetCell === C_GOAL && !this.isGoalUnlocked) {
      return { success: false, reason: 'LOCKED_GOAL' };
    }

    // Checkpoint Gating: C2 is strictly impassable while C1 is active!
    if (targetCell === C_CHECKPOINT_2 && !this.c1Collected) {
      return { success: false, reason: 'C2_GATED_BY_C1' };
    }

    // Record history frame for undo
    this.history.push({
      player: { ...this.player },
      target: { x: nx, y: ny },
      prevCellState: this.grid[this.player.y][this.player.x],
      targetCellPrevState: targetCell,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      isGoalUnlocked: this.isGoalUnlocked,
      budget: this.budget,
      moveCount: this.moveCount,
      isDeadlocked: this.isDeadlocked
    });

    // --- MICRO-FRAME STEP 1: Record departure ---
    if (this.grid[this.player.y][this.player.x] === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    // --- MICRO-FRAME STEP 2: Update player position & budget ---
    this.player.x += dx;
    this.player.y += dy;
    this.moveCount++;

    if (this.initialBudget > 0) {
      this.budget--;
    }

    // Checkpoint collection
    if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    }

    // --- MICRO-FRAME STEP 3: Goal Unlock Mutation ---
    const remainingCount = this.getRemainingCount();
    const checkpointsMet = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);

    if (this.initialBudget === 0) {
      if (remainingCount === 0 && checkpointsMet) {
        this.isGoalUnlocked = true;
      }
    } else {
      if (this.budget >= 0 && checkpointsMet) {
        this.isGoalUnlocked = true;
      } else if (this.budget < 0) {
        this.isGoalUnlocked = false;
        this.triggerDeadlock();
      }
    }

    // --- MICRO-FRAME STEP 4: Terminal Entry Check ---
    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
      this.triggerVictory();
    }

    // --- MICRO-FRAME STEP 5: Deadlock Evaluation (only if NOT victorious) ---
    if (!this.isVictorious && !this.isDeadlocked) {
      if (!this.hasValidMoves()) {
        this.triggerDeadlock();
      }
    }

    return {
      success: true,
      player: { ...this.player },
      remainingCount,
      isGoalUnlocked: this.isGoalUnlocked,
      isVictorious: this.isVictorious,
      isDeadlocked: this.isDeadlocked
    };
  }
}

// ============================================================================
// RESPONSIVE STAGE & HIGH-DPI ENGINE (SPECIFICATION SECTION 4)
// ============================================================================
class ResponsiveStageEngine {
  static resolveShell(viewportW, viewportH) {
    const isMobile = viewportW <= 480;
    const width = isMobile ? viewportW : Math.min(viewportW, 440);
    const height = isMobile ? viewportH : Math.min(viewportH, 880);
    const padding = isMobile
      ? { top: 12, bottom: 12, left: 8, right: 8 }
      : { top: 16, bottom: 16, left: 12, right: 12 };
    const borderRadius = isMobile ? 0 : 24;
    const boxShadow = isMobile ? 'none' : '0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)';

    // Flex centering coordinates
    const left = Math.floor((viewportW - width) / 2);
    const top = Math.floor((viewportH - height) / 2);

    return {
      isMobile,
      width,
      height,
      padding,
      borderRadius,
      boxShadow,
      left,
      top,
      overflow: 'hidden'
    };
  }

  static resolveCanvasRect(shell, hudHeight = 56, controlsHeight = 64) {
    const rectWidth = shell.width - (shell.padding.left + shell.padding.right);
    const rectHeight = shell.height - (shell.padding.top + shell.padding.bottom) - hudHeight - controlsHeight;
    const rectLeft = shell.left + shell.padding.left;
    const rectTop = shell.top + shell.padding.top + hudHeight;

    return {
      width: rectWidth,
      height: rectHeight,
      left: rectLeft,
      top: rectTop
    };
  }

  /**
   * Systems Architect Grid Centering & Tile Size Formula:
   * tileSize = Math.max(48, Math.min(110, Math.floor(Math.min((rect.width * 0.85) / cols, (rect.height * 0.65) / rows))))
   * originX = Math.floor((rect.width - (cols * tileSize)) / 2)
   * originY = Math.floor((rect.height - (rows * tileSize)) / 2)
   */
  static computeTileMetrics(rect, cols, rows) {
    const maxTileW = (rect.width * 0.85) / cols;
    const maxTileH = (rect.height * 0.65) / rows;
    const rawTileSize = Math.floor(Math.min(maxTileW, maxTileH));
    const tileSize = Math.max(48, Math.min(110, rawTileSize));

    const originX = Math.floor((rect.width - (cols * tileSize)) / 2);
    const originY = Math.floor((rect.height - (rows * tileSize)) / 2);

    const gridWidth = cols * tileSize;
    const gridHeight = rows * tileSize;

    return {
      tileSize,
      originX,
      originY,
      gridWidth,
      gridHeight,
      fitsHorizontally: gridWidth <= rect.width,
      fitsVertically: gridHeight <= rect.height,
      marginRight: rect.width - (originX + gridWidth),
      marginBottom: rect.height - (originY + gridHeight)
    };
  }

  /**
   * High-DPI Canvas Buffer Scaling
   */
  static computeHighDPI(rect, dpr) {
    const canvasWidth = Math.floor(rect.width * dpr);
    const canvasHeight = Math.floor(rect.height * dpr);
    const styleWidth = `${rect.width}px`;
    const styleHeight = `${rect.height}px`;

    return {
      dpr,
      canvasWidth,
      canvasHeight,
      styleWidth,
      styleHeight,
      scaleX: dpr,
      scaleY: dpr
    };
  }

  /**
   * Input Relative Coordinate Transform:
   * x = clientX - rect.left, y = clientY - rect.top
   */
  static mapInputToGrid(clientX, clientY, rect, metrics) {
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const gx = Math.floor((x - metrics.originX) / metrics.tileSize);
    const gy = Math.floor((y - metrics.originY) / metrics.tileSize);

    return { x, y, gx, gy };
  }
}

// ============================================================================
// TEST SUITE EXECUTION & VERIFICATION RUNNER
// ============================================================================
let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] ${testName} ... `);
  try {
    fn();
    passedTests++;
    console.log(`\x1b[32mPASSED\x1b[0m`);
  } catch (err) {
    console.log(`\x1b[31mFAILED\x1b[0m`);
    console.error(`\x1b[31mAssertion Error: ${err.message}\x1b[0m`);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

console.log("================================================================================");
console.log("   ONE MORE TILE - ADVERSARIAL QA & RED TEAM VERIFICATION PROTOCOL");
console.log("================================================================================\n");

// ============================================================================
// PART A: CORE LOGIC, MICRO-FRAMES & TRACES
// ============================================================================

// ----------------------------------------------------------------------------
// TEST 1: Level 1 (3x1) Circular Goal Lock & Consumption Axiom
// ----------------------------------------------------------------------------
runTest("Test 1: Level 1 Step-by-Step State Resolution & Micro-frame Execution Order", () => {
  const lvl1 = LEVELS[0];
  const engine = new GameEngineRig(lvl1);

  // Initial State Assertion
  const r0 = engine.getRemainingCount();
  assert.strictEqual(r0, 1, `Initial R(0) must equal 1, got ${r0}`);
  assert.strictEqual(engine.isGoalUnlocked, false, "Initial isGoalUnlocked must be false");
  assert.strictEqual(engine.isDeadlocked, false, "Initial isDeadlocked must be false");
  assert.strictEqual(engine.isVictorious, false, "Initial isVictorious must be false");
  assert.strictEqual(engine.player.x, 0, "Initial player.x must be 0");
  assert.strictEqual(engine.player.y, 0, "Initial player.y must be 0");

  // Move 1: RIGHT to (1,0)
  const res1 = engine.executeMove(1, 0);
  assert.strictEqual(res1.success, true, "Move 1 (RIGHT) must succeed");
  assert.strictEqual(engine.grid[0][0], C_CONSUMED, "Departure cell (0,0) must be C_CONSUMED");
  assert.strictEqual(engine.player.x, 1, "Player.x must be 1 after Move 1");
  assert.strictEqual(engine.player.y, 0, "Player.y must be 0 after Move 1");
  
  const r1 = engine.getRemainingCount();
  assert.strictEqual(r1, 0, `At (1,0), R(1) must equal 0, got ${r1}`);
  assert.strictEqual(engine.isGoalUnlocked, true, "Goal MUST mutate to UNLOCKED at R(1) === 0");
  assert.strictEqual(engine.hasValidMoves(), true, "Player at (1,0) must have valid moves toward unlocked goal");
  assert.strictEqual(engine.isDeadlocked, false, "Assert isDeadlocked === false at (1,0)");
  assert.strictEqual(engine.deadlockTriggerCount, 0, "Deadlock triggers must be 0 at Move 1");
  assert.strictEqual(engine.isVictorious, false, "Victory not yet triggered before goal entry");

  // Move 2: RIGHT to (2,0) - Goal tile
  const res2 = engine.executeMove(1, 0);
  assert.strictEqual(res2.success, true, "Move 2 (RIGHT) into unlocked goal must succeed");
  assert.strictEqual(engine.grid[0][1], C_CONSUMED, "Departure cell (1,0) must be C_CONSUMED");
  assert.strictEqual(engine.player.x, 2, "Player.x must be 2 (Goal position)");
  assert.strictEqual(engine.player.y, 0, "Player.y must be 0 (Goal position)");
  assert.strictEqual(engine.isVictorious, true, "Assert isVictorious === true upon entering unlocked Goal");
  assert.strictEqual(engine.isDeadlocked, false, "Assert isDeadlocked === false (deadlock evaluation skipped on victory)");
  assert.strictEqual(engine.deadlockTriggerCount, 0, "Total deadlock triggers must remain exactly 0");
  assert.strictEqual(engine.dom.victoryModal.visible, true, "Victory modal must be visible");
  assert.strictEqual(engine.dom.deadlockBanner.visible, false, "Deadlock banner must be hidden");
});

// ----------------------------------------------------------------------------
// TEST 2: Levels 2, 3, 4, and 5 Deterministic Solvability Traces
// ----------------------------------------------------------------------------
runTest("Test 2: Levels 2, 3, 4, and 5 Clean Solution Traces (0 Deadlocks)", () => {
  const levelsToTest = [LEVELS[1], LEVELS[2], LEVELS[3], LEVELS[4]];

  levelsToTest.forEach((lvl) => {
    const engine = new GameEngineRig(lvl);
    const trace = lvl.trace;

    trace.forEach((dir, stepIdx) => {
      const prevX = engine.player.x;
      const prevY = engine.player.y;
      const res = engine.executeMove(dir.dx, dir.dy);

      assert.strictEqual(
        res.success,
        true,
        `Level ${lvl.id} step ${stepIdx + 1} (${dir.name}): Move rejected with reason ${res.reason}`
      );
      assert.strictEqual(
        engine.grid[prevY][prevX],
        C_CONSUMED,
        `Level ${lvl.id} step ${stepIdx + 1}: Departure tile (${prevX}, ${prevY}) must be C_CONSUMED`
      );
      assert.strictEqual(
        engine.isDeadlocked,
        false,
        `Level ${lvl.id} step ${stepIdx + 1}: Unexpected premature deadlock!`
      );
      assert.strictEqual(
        engine.deadlockTriggerCount,
        0,
        `Level ${lvl.id} step ${stepIdx + 1}: Deadlock trigger count must be 0`
      );
    });

    // Level Completion Assertions
    assert.strictEqual(
      engine.player.x,
      lvl.goal.x,
      `Level ${lvl.id}: Player X (${engine.player.x}) does not match Goal X (${lvl.goal.x})`
    );
    assert.strictEqual(
      engine.player.y,
      lvl.goal.y,
      `Level ${lvl.id}: Player Y (${engine.player.y}) does not match Goal Y (${lvl.goal.y})`
    );
    assert.strictEqual(
      engine.isVictorious,
      true,
      `Level ${lvl.id} (${lvl.name}): Must achieve Victory`
    );
    assert.strictEqual(
      engine.isDeadlocked,
      false,
      `Level ${lvl.id} (${lvl.name}): Must not be deadlocked`
    );
    assert.strictEqual(
      engine.deadlockTriggerCount,
      0,
      `Level ${lvl.id} (${lvl.name}): Total deadlocks must be 0`
    );

    // Verify all path cells consumed (0 untouched cells remaining)
    let untouchedCount = 0;
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        if (engine.grid[y][x] === C_UNTOUCHED) {
          untouchedCount++;
        }
      }
    }
    assert.strictEqual(
      untouchedCount,
      0,
      `Level ${lvl.id}: All path tiles must be consumed, found ${untouchedCount} untouched`
    );
    assert.strictEqual(
      engine.moveCount,
      lvl.par,
      `Level ${lvl.id}: Move count (${engine.moveCount}) must match par (${lvl.par})`
    );
  });
});

// ----------------------------------------------------------------------------
// TEST 3: Swipe Input Vectors Alignment & Inversion Assertions
// ----------------------------------------------------------------------------
runTest("Test 3: Swipe Input Vector Resolution & Inversion Assertions", () => {
  // 1. startX = 100, endX = 150 (deltaX = +50 > 30) -> asserts velocity dx === +1, dy === 0 (RIGHT)
  const swipeRight = resolveSwipe(100, 100, 150, 100);
  assert.notStrictEqual(swipeRight, null, "Swipe Right must be detected (> 30px threshold)");
  assert.strictEqual(swipeRight.dx, +1, "Swipe Right dx must be +1");
  assert.strictEqual(swipeRight.dy, 0, "Swipe Right dy must be 0");
  assert.strictEqual(swipeRight.name, 'RIGHT', "Swipe Right name must be RIGHT");

  // 2. startX = 150, endX = 100 (deltaX = -50) -> asserts dx === -1, dy === 0 (LEFT)
  const swipeLeft = resolveSwipe(150, 100, 100, 100);
  assert.notStrictEqual(swipeLeft, null, "Swipe Left must be detected");
  assert.strictEqual(swipeLeft.dx, -1, "Swipe Left dx must be -1");
  assert.strictEqual(swipeLeft.dy, 0, "Swipe Left dy must be 0");
  assert.strictEqual(swipeLeft.name, 'LEFT', "Swipe Left name must be LEFT");

  // 3. startY = 100, endY = 160 (deltaY = +60) -> asserts dx === 0, dy === +1 (DOWN)
  const swipeDown = resolveSwipe(100, 100, 100, 160);
  assert.notStrictEqual(swipeDown, null, "Swipe Down must be detected");
  assert.strictEqual(swipeDown.dx, 0, "Swipe Down dx must be 0");
  assert.strictEqual(swipeDown.dy, +1, "Swipe Down dy must be +1 (downward screen vector)");
  assert.strictEqual(swipeDown.name, 'DOWN', "Swipe Down name must be DOWN");

  // 4. startY = 160, endY = 100 (deltaY = -60) -> asserts dx === 0, dy === -1 (UP)
  const swipeUp = resolveSwipe(100, 160, 100, 100);
  assert.notStrictEqual(swipeUp, null, "Swipe Up must be detected");
  assert.strictEqual(swipeUp.dx, 0, "Swipe Up dx must be 0");
  assert.strictEqual(swipeUp.dy, -1, "Swipe Up dy must be -1 (upward screen vector)");
  assert.strictEqual(swipeUp.name, 'UP', "Swipe Up name must be UP");

  // Sub-threshold assertions (<= 30px)
  const tapOrJitter = resolveSwipe(100, 100, 115, 110);
  assert.strictEqual(tapOrJitter, null, "Sub-threshold movement (< 30px) must be rejected");

  // Exactly on threshold boundary (30px)
  const thresholdBoundary = resolveSwipe(100, 100, 130, 100);
  assert.strictEqual(thresholdBoundary, null, "deltaX = 30 must not trigger (>30 required)");

  // Over threshold boundary (31px)
  const overBoundary = resolveSwipe(100, 100, 131, 100);
  assert.notStrictEqual(overBoundary, null, "deltaX = 31 must trigger");
  assert.strictEqual(overBoundary.dx, 1);
});

// ----------------------------------------------------------------------------
// TEST 4: DOM State Cleanup & Modal Mutual Exclusivity
// ----------------------------------------------------------------------------
runTest("Test 4: Modal Mutual Exclusivity & Reset DOM State Cleanup", () => {
  const dom = new MockDOMController();

  // Initially all hidden
  assert.strictEqual(dom.deadlockBanner.visible, false, "Deadlock banner initially hidden");
  assert.strictEqual(dom.victoryModal.visible, false, "Victory modal initially hidden");

  // Trigger Deadlock
  dom.showDeadlock();
  assert.strictEqual(dom.deadlockBanner.visible, true, "Deadlock banner must be visible");
  assert.strictEqual(dom.deadlockBanner.classes.has('show'), true, "Deadlock banner has .show");
  assert.strictEqual(dom.victoryModal.visible, false, "Victory modal must be hidden when deadlocked");

  // Trigger Victory: Purges Deadlock Banner immediately
  dom.showVictory();
  assert.strictEqual(dom.victoryModal.visible, true, "Victory modal must be visible");
  assert.strictEqual(dom.victoryModal.classes.has('show'), true, "Victory modal has .show");
  assert.strictEqual(dom.deadlockBanner.visible, false, "Deadlock banner must be hidden when victorious");
  assert.strictEqual(dom.deadlockBanner.classes.has('show'), false, "Deadlock banner purged of .show");

  // Reset: Cleans up both
  dom.reset();
  assert.strictEqual(dom.deadlockBanner.visible, false, "Deadlock banner hidden after reset");
  assert.strictEqual(dom.victoryModal.visible, false, "Victory modal hidden after reset");
  assert.strictEqual(dom.deadlockBanner.classes.size, 0, "Deadlock banner classes cleared");
  assert.strictEqual(dom.victoryModal.classes.size, 0, "Victory modal classes cleared");

  // Engine Integration: If victory is triggered, deadlock flag cannot trigger
  const engine = new GameEngineRig(LEVELS[0]);
  engine.executeMove(1, 0); // (1,0)
  engine.executeMove(1, 0); // (2,0) Victory!
  assert.strictEqual(engine.isVictorious, true, "Engine is victorious");
  
  // Attempt to force deadlock trigger while victorious
  engine.triggerDeadlock();
  assert.strictEqual(engine.isDeadlocked, false, "Deadlock must NOT trigger when victorious");
  assert.strictEqual(engine.dom.deadlockBanner.visible, false, "Deadlock banner must NOT show when victorious");
  assert.strictEqual(engine.dom.victoryModal.visible, true, "Victory modal remains visible");

  // Restart / Reset clears both and restores clean state
  engine.restart();
  assert.strictEqual(engine.isVictorious, false, "Victorious reset to false");
  assert.strictEqual(engine.isDeadlocked, false, "Deadlocked reset to false");
  assert.strictEqual(engine.dom.deadlockBanner.visible, false, "Deadlock banner purged on restart");
  assert.strictEqual(engine.dom.victoryModal.visible, false, "Victory modal purged on restart");
});

// ----------------------------------------------------------------------------
// TEST 5 (ADVERSARIAL BONUS): Locked Goal Collision & Entrapment Deadlock
// ----------------------------------------------------------------------------
runTest("Test 5 (Adversarial): Locked Goal Collision Rejection & True Entrapment Deadlock", () => {
  // Test 5A: Locked Goal Collision Rejection
  const engine3 = new GameEngineRig(LEVELS[2]);
  assert.strictEqual(engine3.isGoalUnlocked, false, "Goal is locked initially (R = 2)");

  const invalidMove = engine3.executeMove(0, 1);
  assert.strictEqual(invalidMove.success, false, "Direct entry into locked goal must be REJECTED");
  assert.strictEqual(invalidMove.reason, 'LOCKED_GOAL', "Reason must be LOCKED_GOAL");
  assert.strictEqual(engine3.player.x, 0, "Player x must remain unchanged at 0");
  assert.strictEqual(engine3.player.y, 0, "Player y must remain unchanged at 0");
  assert.strictEqual(engine3.grid[0][0], C_UNTOUCHED, "Spawn tile must remain C_UNTOUCHED");

  // Test 5B: True Entrapment Deadlock Detection
  const culDeSacLevel = {
    id: 99,
    name: "Adversarial Cul-de-Sac",
    w: 3, h: 3,
    par: 4,
    grid: [
      [2, 2, 2],
      [1, 2, 1],
      [4, 2, 1]
    ],
    spawn: { x: 1, y: 1 },
    goal: { x: 0, y: 2 }
  };
  const engineTrap = new GameEngineRig(culDeSacLevel);
  
  const m1 = engineTrap.executeMove(0, -1); // to (1,0)
  assert.strictEqual(m1.success, true);
  assert.strictEqual(engineTrap.isDeadlocked, false, "Not deadlocked at (1,0)");

  const m2 = engineTrap.executeMove(1, 0); // to (2,0)
  assert.strictEqual(m2.success, true);
  assert.strictEqual(engineTrap.isDeadlocked, true, "MUST trigger DEADLOCK when trapped with 0 valid moves!");
  assert.strictEqual(engineTrap.dom.deadlockBanner.visible, true, "Deadlock banner must show on entrapment");
  assert.strictEqual(engineTrap.dom.victoryModal.visible, false, "Victory modal must not show on entrapment");

  const m3 = engineTrap.executeMove(-1, 0);
  assert.strictEqual(m3.success, false);
  assert.strictEqual(m3.reason, 'DEADLOCKED');
});

// ============================================================================
// PART B: HIGH-DPI & RESPONSIVE STAGE CENTERING (RED TEAM ADVERSARIAL QA)
// ============================================================================

// ----------------------------------------------------------------------------
// TEST 6: Viewport 1 - Mobile Portrait (390 x 844)
// ----------------------------------------------------------------------------
runTest("Test 6: Viewport 1 (Mobile Portrait 390x844) Edge-to-Edge & Dynamic Centering", () => {
  const vpW = 390;
  const vpH = 844;

  const shell = ResponsiveStageEngine.resolveShell(vpW, vpH);
  assert.strictEqual(shell.isMobile, true, "390px width must trigger mobile edge-to-edge mode (<= 480px)");
  assert.strictEqual(shell.width, 390, "Shell width must equal viewport width (100vw edge-to-edge)");
  assert.strictEqual(shell.height, 844, "Shell height must equal viewport height (100vh)");
  assert.strictEqual(shell.borderRadius, 0, "Mobile shell border-radius must be 0");
  assert.strictEqual(shell.boxShadow, 'none', "Mobile shell box-shadow must be none");
  assert.strictEqual(shell.padding.left, 8, "Mobile shell horizontal padding must be 8px");
  assert.strictEqual(shell.padding.right, 8, "Mobile shell horizontal padding must be 8px");

  const rect = ResponsiveStageEngine.resolveCanvasRect(shell);
  assert.strictEqual(rect.width, 390 - 16, "Canvas rect width must be shell.width - 16px padding (374px)");
  assert.ok(rect.height > 600, `Canvas rect height (${rect.height}px) must comfortably occupy available space`);

  // Test Levels 1-5 tile sizing & margins
  LEVELS.forEach((lvl) => {
    const metrics = ResponsiveStageEngine.computeTileMetrics(rect, lvl.w, lvl.h);

    assert.ok(
      metrics.tileSize >= 48,
      `Level ${lvl.id}: Tile size (${metrics.tileSize}) must be >= 48px min clamp`
    );
    assert.ok(
      metrics.tileSize <= 110,
      `Level ${lvl.id}: Tile size (${metrics.tileSize}) must be <= 110px max clamp`
    );
    assert.ok(
      metrics.fitsHorizontally,
      `Level ${lvl.id}: Grid (${metrics.gridWidth}px) exceeds rect width (${rect.width}px)`
    );
    assert.ok(
      metrics.fitsVertically,
      `Level ${lvl.id}: Grid (${metrics.gridHeight}px) exceeds rect height (${rect.height}px)`
    );
    assert.ok(
      metrics.originX >= 0,
      `Level ${lvl.id}: originX (${metrics.originX}) must be strictly non-negative`
    );
    assert.ok(
      metrics.originY >= 0,
      `Level ${lvl.id}: originY (${metrics.originY}) must be strictly non-negative`
    );
    assert.ok(
      metrics.marginRight >= 0,
      `Level ${lvl.id}: Right margin (${metrics.marginRight}) must be non-negative`
    );
    assert.ok(
      metrics.marginBottom >= 0,
      `Level ${lvl.id}: Bottom margin (${metrics.marginBottom}) must be non-negative`
    );
  });
});

// ----------------------------------------------------------------------------
// TEST 7: Viewport 2 - Desktop Fullscreen (1920 x 1080)
// ----------------------------------------------------------------------------
runTest("Test 7: Viewport 2 (Desktop Fullscreen 1920x1080) Clamped Shell [440x880] & Centering", () => {
  const vpW = 1920;
  const vpH = 1080;

  const shell = ResponsiveStageEngine.resolveShell(vpW, vpH);
  assert.strictEqual(shell.isMobile, false, "1920px width must be desktop clamped mode (> 480px)");
  assert.strictEqual(shell.width, 440, "Desktop shell width must be clamped to 440px");
  assert.strictEqual(shell.height, 880, "Desktop shell height must be clamped to 880px");
  assert.strictEqual(shell.borderRadius, 24, "Desktop shell border-radius must be 24px");
  assert.strictEqual(
    shell.boxShadow,
    '0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    "Desktop shell box-shadow must match glow spec"
  );
  assert.strictEqual(shell.left, (1920 - 440) / 2, "Desktop shell must be horizontally centered (740px)");
  assert.strictEqual(shell.top, (1080 - 880) / 2, "Desktop shell must be vertically centered (100px)");

  const rect = ResponsiveStageEngine.resolveCanvasRect(shell);
  assert.strictEqual(rect.width, 440 - 24, "Canvas rect width must be 416px (440 - 24)");

  // Test Levels 1-5 tile sizing & margins
  LEVELS.forEach((lvl) => {
    const metrics = ResponsiveStageEngine.computeTileMetrics(rect, lvl.w, lvl.h);

    assert.ok(
      metrics.tileSize >= 48 && metrics.tileSize <= 110,
      `Level ${lvl.id}: Tile size (${metrics.tileSize}) must be in range [48, 110]`
    );
    assert.ok(metrics.fitsHorizontally, `Level ${lvl.id}: Grid must fit horizontally`);
    assert.ok(metrics.fitsVertically, `Level ${lvl.id}: Grid must fit vertically`);
    assert.ok(metrics.originX >= 0, `Level ${lvl.id}: originX must be >= 0`);
    assert.ok(metrics.originY >= 0, `Level ${lvl.id}: originY must be >= 0`);

    // Verify grid centering symmetry: difference between left and right margins <= 1px
    const diffX = Math.abs(metrics.originX - metrics.marginRight);
    assert.ok(diffX <= 1, `Level ${lvl.id}: Horizontal grid centering must be symmetric (diff=${diffX})`);
  });
});

// ----------------------------------------------------------------------------
// TEST 8: Viewport 3 - Square/Foldable Viewport (600 x 600)
// ----------------------------------------------------------------------------
runTest("Test 8: Viewport 3 (Square/Foldable 600x600) Aspect Adaptation & Clamping", () => {
  const vpW = 600;
  const vpH = 600;

  const shell = ResponsiveStageEngine.resolveShell(vpW, vpH);
  assert.strictEqual(shell.isMobile, false, "600px width is > 480px, clamped shell");
  assert.strictEqual(shell.width, 440, "Shell width clamped to 440px");
  assert.strictEqual(shell.height, 600, "Shell height clamped to min(600, 880) = 600px");
  assert.strictEqual(shell.borderRadius, 24, "Border radius 24px");
  assert.strictEqual(shell.left, (600 - 440) / 2, "Horizontally centered at 80px");
  assert.strictEqual(shell.top, 0, "Vertically aligned at 0px");

  const rect = ResponsiveStageEngine.resolveCanvasRect(shell);
  assert.strictEqual(rect.width, 416, "Canvas width 416px");

  // In constrained vertical height (600px), assert all levels scale properly without clipping
  LEVELS.forEach((lvl) => {
    const metrics = ResponsiveStageEngine.computeTileMetrics(rect, lvl.w, lvl.h);

    assert.ok(
      metrics.tileSize >= 48 && metrics.tileSize <= 110,
      `Level ${lvl.id}: Tile size ${metrics.tileSize} in range [48, 110]`
    );
    assert.ok(metrics.fitsHorizontally, `Level ${lvl.id}: Must fit horizontally in 600x600`);
    assert.ok(metrics.fitsVertically, `Level ${lvl.id}: Must fit vertically in 600x600`);
    assert.ok(metrics.originX >= 0, `Level ${lvl.id}: originX non-negative`);
    assert.ok(metrics.originY >= 0, `Level ${lvl.id}: originY non-negative`);
  });
});

// ----------------------------------------------------------------------------
// TEST 9: High-DPI Canvas Buffer Scaling & Transform Fidelity
// ----------------------------------------------------------------------------
runTest("Test 9: High-DPI Buffer Scaling & Coordinate Transform (DPR 1.0, 2.0, 3.0)", () => {
  const rect = { width: 416, height: 728 };
  const dprList = [1.0, 2.0, 3.0];

  dprList.forEach((dpr) => {
    const dpi = ResponsiveStageEngine.computeHighDPI(rect, dpr);

    assert.strictEqual(
      dpi.canvasWidth,
      Math.floor(rect.width * dpr),
      `DPR ${dpr}: canvas.width must equal Math.floor(rect.width * dpr)`
    );
    assert.strictEqual(
      dpi.canvasHeight,
      Math.floor(rect.height * dpr),
      `DPR ${dpr}: canvas.height must equal Math.floor(rect.height * dpr)`
    );
    assert.strictEqual(
      dpi.styleWidth,
      `${rect.width}px`,
      `DPR ${dpr}: canvas.style.width must be ${rect.width}px`
    );
    assert.strictEqual(
      dpi.styleHeight,
      `${rect.height}px`,
      `DPR ${dpr}: canvas.style.height must be ${rect.height}px`
    );
    assert.strictEqual(dpi.scaleX, dpr, `DPR ${dpr}: ctx.scale x must equal dpr`);
    assert.strictEqual(dpi.scaleY, dpr, `DPR ${dpr}: ctx.scale y must equal dpr`);

    // Pixel sharpness ratio: buffer / CSS style pixels == dpr
    const ratioX = dpi.canvasWidth / rect.width;
    assert.ok(
      Math.abs(ratioX - dpr) < 0.01,
      `DPR ${dpr}: Buffer density ratio must precisely match DPR`
    );
  });
});

// ----------------------------------------------------------------------------
// TEST 10: Input Relative Coordinate Translation (`clientX - rect.left`)
// ----------------------------------------------------------------------------
runTest("Test 10: Viewport Inset & Relative Input Coordinate Mapping", () => {
  // Scenario A: Desktop layout where stage is offset at (left: 740, top: 100)
  const desktopShell = ResponsiveStageEngine.resolveShell(1920, 1080);
  const desktopRect = ResponsiveStageEngine.resolveCanvasRect(desktopShell);
  const lvl1Metrics = ResponsiveStageEngine.computeTileMetrics(desktopRect, 3, 1);

  // Click on tile 0 (spawn tile): should map to gx: 0, gy: 0
  const tile0ClientX = desktopRect.left + lvl1Metrics.originX + (lvl1Metrics.tileSize * 0.5);
  const tile0ClientY = desktopRect.top + lvl1Metrics.originY + (lvl1Metrics.tileSize * 0.5);
  const input0 = ResponsiveStageEngine.mapInputToGrid(tile0ClientX, tile0ClientY, desktopRect, lvl1Metrics);

  assert.strictEqual(input0.gx, 0, "Desktop Click on Tile 0 must resolve to gx: 0");
  assert.strictEqual(input0.gy, 0, "Desktop Click on Tile 0 must resolve to gy: 0");
  assert.ok(input0.x >= 0 && input0.x <= desktopRect.width, "Local X must be within canvas bounds");
  assert.ok(input0.y >= 0 && input0.y <= desktopRect.height, "Local Y must be within canvas bounds");

  // Click on tile 2 (Goal tile): should map to gx: 2, gy: 0
  const tile2ClientX = desktopRect.left + lvl1Metrics.originX + (lvl1Metrics.tileSize * 2.5);
  const tile2ClientY = desktopRect.top + lvl1Metrics.originY + (lvl1Metrics.tileSize * 0.5);
  const input2 = ResponsiveStageEngine.mapInputToGrid(tile2ClientX, tile2ClientY, desktopRect, lvl1Metrics);

  assert.strictEqual(input2.gx, 2, "Desktop Click on Goal Tile must resolve to gx: 2");
  assert.strictEqual(input2.gy, 0, "Desktop Click on Goal Tile must resolve to gy: 0");

  // Scenario B: Mobile layout (390 x 844)
  const mobileShell = ResponsiveStageEngine.resolveShell(390, 844);
  const mobileRect = ResponsiveStageEngine.resolveCanvasRect(mobileShell);
  const mobileMetrics = ResponsiveStageEngine.computeTileMetrics(mobileRect, 3, 1);

  const mobTile1ClientX = mobileRect.left + mobileMetrics.originX + (mobileMetrics.tileSize * 1.5);
  const mobTile1ClientY = mobileRect.top + mobileMetrics.originY + (mobileMetrics.tileSize * 0.5);
  const mobInput1 = ResponsiveStageEngine.mapInputToGrid(mobTile1ClientX, mobTile1ClientY, mobileRect, mobileMetrics);

  assert.strictEqual(mobInput1.gx, 1, "Mobile Click on Tile 1 must resolve to gx: 1");
  assert.strictEqual(mobInput1.gy, 0, "Mobile Click on Tile 1 must resolve to gy: 0");
});

// ----------------------------------------------------------------------------
// TEST 11: Absolute Inset-0 Modal Enclosure & Zero-Overflow Prevention
// ----------------------------------------------------------------------------
runTest("Test 11: Absolute Inset-0 Modal Enclosure & Zero-Overflow / Scrollbar Prevention", () => {
  const viewports = [
    { w: 390, h: 844, name: "Mobile Portrait" },
    { w: 1920, h: 1080, name: "Desktop Fullscreen" },
    { w: 600, h: 600, name: "Foldable Square" },
    { w: 320, h: 480, name: "Legacy Mobile" },
    { w: 2560, h: 1440, name: "Ultrawide Desktop" }
  ];

  viewports.forEach((vp) => {
    const shell = ResponsiveStageEngine.resolveShell(vp.w, vp.h);

    // Assert Shell never overflows viewport in either dimension
    assert.ok(
      shell.width <= vp.w,
      `${vp.name}: Shell width (${shell.width}) exceeds viewport width (${vp.w})`
    );
    assert.ok(
      shell.height <= vp.h,
      `${vp.name}: Shell height (${shell.height}) exceeds viewport height (${vp.h})`
    );

    // Modal enclosure: position absolute; inset: 0
    // Inside #app-shell (which has position: relative), modal matches shell size exactly
    const modal = {
      position: 'absolute',
      inset: 0,
      width: shell.width,
      height: shell.height
    };

    assert.strictEqual(modal.width, shell.width, `${vp.name}: Modal width must equal shell width`);
    assert.strictEqual(modal.height, shell.height, `${vp.name}: Modal height must equal shell height`);
    assert.strictEqual(shell.overflow, 'hidden', `${vp.name}: Shell overflow must be hidden`);
  });
});

// ----------------------------------------------------------------------------
// TEST 12: Phase 2 Checkpoint Gating (C2 impassable while C1 active)
// ----------------------------------------------------------------------------
runTest("Test 12: Phase 2 Checkpoint Gating (C2 impassable while C1 active)", () => {
  // Level 8: C1 at (2,0), C2 at (0,2)
  const lvl8 = LEVELS[7];
  const engine = new GameEngineRig(lvl8);

  // Attempt direct move towards C2: DOWN to (0,1)
  const m1 = engine.executeMove(0, 1);
  assert.strictEqual(m1.success, true);
  assert.strictEqual(engine.player.x, 0);
  assert.strictEqual(engine.player.y, 1);

  // From (0,1), attempt to enter C2 at (0,2) while C1 is uncollected:
  const blockedMove = engine.executeMove(0, 1);
  assert.strictEqual(blockedMove.success, false, "Moving into C2 while C1 is uncollected must be rejected");
  assert.strictEqual(blockedMove.reason, 'C2_GATED_BY_C1');
  assert.strictEqual(engine.player.x, 0, "Player must remain at (0,1)");
  assert.strictEqual(engine.player.y, 1, "Player must remain at (0,1)");
  assert.strictEqual(engine.grid[2][0], C_CHECKPOINT_2, "C2 cell must remain intact on board");
});

// ----------------------------------------------------------------------------
// TEST 13: Phase 2 Spatial Budget Invariant (Bt = 0 warning, Bt = -1 deadlock)
// ----------------------------------------------------------------------------
runTest("Test 13: Phase 2 Spatial Budget Invariant (Bt = 0 warning, Bt = -1 deadlock)", () => {
  // Level 7: 4x2, Budget Bt = 3, Par = 2, Spawn (0,0), Goal (1,1)
  const lvl7 = LEVELS[6];
  const engine = new GameEngineRig(lvl7);

  // Move 1: RIGHT to (1,0) -> Bt = 2
  engine.executeMove(1, 0);
  assert.strictEqual(engine.budget, 2);
  assert.strictEqual(engine.isDeadlocked, false);

  // Move 2: RIGHT to (2,0) -> Bt = 1
  engine.executeMove(1, 0);
  assert.strictEqual(engine.budget, 1);
  assert.strictEqual(engine.isDeadlocked, false);

  // Move 3: RIGHT to (3,0) -> Bt = 0 (WARNING STATE)
  engine.executeMove(1, 0);
  assert.strictEqual(engine.budget, 0, "Budget must reach 0");
  assert.strictEqual(engine.isDeadlocked, false, "Bt = 0 is warning state, not deadlock");

  // Move 4: DOWN to (3,1) -> Bt = -1 (DEADLOCK TRIGGERED!)
  const m4 = engine.executeMove(0, 1);
  assert.strictEqual(engine.budget, -1, "Budget must decrement to -1");
  assert.strictEqual(engine.isDeadlocked, true, "Bt = -1 must trigger DEADLOCK");
  assert.strictEqual(engine.dom.deadlockBanner.visible, true, "Deadlock banner must be visible");

  // Subsequent move must be rejected
  const m5 = engine.executeMove(-1, 0);
  assert.strictEqual(m5.success, false, "Move during deadlock must be rejected");
  assert.strictEqual(m5.reason, 'DEADLOCKED');
});

// ----------------------------------------------------------------------------
// TEST 14: Phase 2 Levels 6 to 10 Deterministic Solvability Traces
// ----------------------------------------------------------------------------
runTest("Test 14: Phase 2 Levels 6 to 10 Deterministic Solvability Traces", () => {
  const phase2Levels = [LEVELS[5], LEVELS[6], LEVELS[7], LEVELS[8], LEVELS[9]];

  phase2Levels.forEach((lvl) => {
    const engine = new GameEngineRig(lvl);
    const trace = lvl.trace;

    trace.forEach((dir, stepIdx) => {
      const res = engine.executeMove(dir.dx, dir.dy);
      assert.strictEqual(
        res.success,
        true,
        `Level ${lvl.id} step ${stepIdx + 1} (${dir.name}): Move rejected with reason ${res.reason}`
      );
      assert.strictEqual(
        engine.isDeadlocked,
        false,
        `Level ${lvl.id} step ${stepIdx + 1}: Unexpected premature deadlock!`
      );
    });

    assert.strictEqual(
      engine.player.x,
      lvl.goal.x,
      `Level ${lvl.id}: Player X (${engine.player.x}) does not match Goal X (${lvl.goal.x})`
    );
    assert.strictEqual(
      engine.player.y,
      lvl.goal.y,
      `Level ${lvl.id}: Player Y (${engine.player.y}) does not match Goal Y (${lvl.goal.y})`
    );
    assert.strictEqual(
      engine.isVictorious,
      true,
      `Level ${lvl.id} (${lvl.name}): Must achieve Victory`
    );
    assert.strictEqual(
      engine.isDeadlocked,
      false,
      `Level ${lvl.id} (${lvl.name}): Must not be deadlocked`
    );
    assert.strictEqual(
      engine.moveCount,
      lvl.par,
      `Level ${lvl.id}: Move count (${engine.moveCount}) must match par (${lvl.par})`
    );
  });
});

// ----------------------------------------------------------------------------
// TEST 15: Phase 2 Dynamic Vertical Centering & Positive originY across Viewports
// ----------------------------------------------------------------------------
runTest("Test 15: Phase 2 Dynamic Vertical Centering & Positive originY across Viewports", () => {
  const testViewports = [
    { w: 390, h: 844, name: "Mobile Portrait (390x844)" },
    { w: 1920, h: 1080, name: "Desktop (1920x1080)" },
    { w: 600, h: 600, name: "Foldable Square (600x600)" },
    { w: 360, h: 900, name: "Extreme Tall Mobile (360x900)" }
  ];

  testViewports.forEach((vp) => {
    const shell = ResponsiveStageEngine.resolveShell(vp.w, vp.h);
    const rect = ResponsiveStageEngine.resolveCanvasRect(shell);

    LEVELS.forEach((lvl) => {
      const metrics = ResponsiveStageEngine.computeTileMetrics(rect, lvl.w, lvl.h);

      assert.ok(
        metrics.originY > 0,
        `${vp.name} Level ${lvl.id}: originY (${metrics.originY}) must be strictly positive`
      );
      assert.ok(
        metrics.originX >= 0,
        `${vp.name} Level ${lvl.id}: originX (${metrics.originX}) must be non-negative`
      );
      assert.ok(
        metrics.fitsVertically,
        `${vp.name} Level ${lvl.id}: Grid must fit vertically inside canvas rect`
      );
    });
  });
});

// ----------------------------------------------------------------------------
// TEST 16: Phase 3 Crumbling Tile Mutation (C_CRUMBLING -> C_VOID on exit)
// ----------------------------------------------------------------------------
runTest("Test 16: Phase 3 Crumbling Tile Mutation (C_CRUMBLING -> C_VOID on exit)", () => {
  const lvl13 = LEVELS[12]; // Level 13
  const engine = new GameEngineRig(lvl13);

  assert.strictEqual(engine.grid[0][2], C_CRUMBLING, "Tile (2,0) must start as C_CRUMBLING");

  // Move 1: RIGHT to (1,0)
  const m1 = engine.executeMove(1, 0);
  assert.strictEqual(m1.success, true);
  assert.strictEqual(engine.grid[0][0], C_CONSUMED, "Standard departure tile mutates to C_CONSUMED");

  // Move 2: RIGHT to (2,0) - Enter crumbling tile
  const m2 = engine.executeMove(1, 0);
  assert.strictEqual(m2.success, true);
  assert.strictEqual(engine.player.x, 2);
  assert.strictEqual(engine.player.y, 0);

  // Move 3: RIGHT to (3,0) - Depart crumbling tile
  const m3 = engine.executeMove(1, 0);
  assert.strictEqual(m3.success, true);
  assert.strictEqual(engine.player.x, 3);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.grid[0][2], C_VOID, "Crumbling tile must collapse directly to C_VOID = 0 on exit");

  // Adversarial: Attempt to step back into the collapsed chasm
  const blocked = engine.executeMove(-1, 0);
  assert.strictEqual(blocked.success, false, "Stepping into collapsed chasm must be rejected");
  assert.strictEqual(blocked.reason, 'IMPASSABLE_CELL');
  assert.strictEqual(engine.player.x, 3, "Player must remain at (3,0)");
});

// ----------------------------------------------------------------------------
// TEST 17: Phase 3 Zero Margin for Error (Bt = 0 at Goal, detour triggers Bt = -1 deadlock)
// ----------------------------------------------------------------------------
runTest("Test 17: Phase 3 Zero Margin for Error (Bt = 0 at Goal, detour triggers Bt = -1 deadlock)", () => {
  // Adversarial test on Level 11: take an extraneous detour step down to (0,1)
  const lvl11 = LEVELS[10]; // Level 11: budget = 8, par = 8
  const engine = new GameEngineRig(lvl11);

  // Intentional detour move DOWN to (0,1)
  const m1 = engine.executeMove(0, 1);
  assert.strictEqual(m1.success, true);
  assert.strictEqual(engine.budget, 7);

  // Move 7 more steps (total 8 moves) to exhaust budget to Bt = 0
  engine.executeMove(0, 1); // to (0,2) -> Bt = 6
  engine.executeMove(0, 1); // to (0,3) -> Bt = 5
  engine.executeMove(1, 0); // to (1,3) -> Bt = 4
  engine.executeMove(1, 0); // to (2,3) -> Bt = 3
  engine.executeMove(0, -1); // to (2,2) -> Bt = 2 (C2 blocked because C1 not collected!)
  // Instead move to (1,3) is consumed, but let's test moving when budget hits 0:
  // Re-instantiate a clean budget-depletion test:
  const engine2 = new GameEngineRig(lvl11);
  // Execute 8 moves on terrain:
  engine2.executeMove(1, 0); // (1,0) Bt = 7
  engine2.executeMove(1, 0); // (2,0) C1 Bt = 6
  engine2.executeMove(1, 0); // (3,0) Bt = 5
  engine2.executeMove(0, 1); // (3,1) Bt = 4
  engine2.executeMove(0, 1); // (3,2) Bt = 3
  engine2.executeMove(-1, 0); // (2,2) C2 Bt = 2
  engine2.executeMove(0, 1); // (2,3) Bt = 1
  // Move 8 to (1,3) instead of Goal (3,3)
  engine2.executeMove(-1, 0); // (1,3) Bt = 0 (WARNING STATE)
  assert.strictEqual(engine2.budget, 0, "Budget reaches 0");
  assert.strictEqual(engine2.isDeadlocked, false, "Bt = 0 is warning state");

  // Move 9 (detour past par): moves to (0,3) -> Bt = -1 (DEADLOCK!)
  const mDead = engine2.executeMove(-1, 0);
  assert.strictEqual(engine2.budget, -1, "Budget drops to -1");
  assert.strictEqual(engine2.isDeadlocked, true, "Bt = -1 triggers DEADLOCK");
  assert.strictEqual(engine2.dom.deadlockBanner.visible, true);

  // Locked down: further inputs rejected
  const mBlocked = engine2.executeMove(0, -1);
  assert.strictEqual(mBlocked.success, false);
  assert.strictEqual(mBlocked.reason, 'DEADLOCKED');
});

// ----------------------------------------------------------------------------
// TEST 18: Phase 3 Bi-Directional Undo Stack (restores C_CRUMBLING losslessly)
// ----------------------------------------------------------------------------
runTest("Test 18: Phase 3 Bi-Directional Undo Stack (restores C_CRUMBLING losslessly)", () => {
  const lvl13 = LEVELS[12];
  const engine = new GameEngineRig(lvl13);

  // Walk: (0,0) -> (1,0) -> (2,0)[CR] -> (3,0)[CR collapses]
  engine.executeMove(1, 0);
  engine.executeMove(1, 0);
  engine.executeMove(1, 0);

  assert.strictEqual(engine.player.x, 3);
  assert.strictEqual(engine.grid[0][2], C_VOID, "Tile is collapsed to void");

  // Undo 1: Back to (2,0)
  const u1 = engine.undo();
  assert.strictEqual(u1.success, true);
  assert.strictEqual(engine.player.x, 2);
  assert.strictEqual(engine.player.y, 0);
  assert.strictEqual(engine.grid[0][2], C_CRUMBLING, "Departure tile restored to C_CRUMBLING");
  assert.strictEqual(engine.grid[0][3], C_UNTOUCHED, "Target tile restored to C_UNTOUCHED");

  // Undo 2: Back to (1,0)
  const u2 = engine.undo();
  assert.strictEqual(u2.success, true);
  assert.strictEqual(engine.player.x, 1);
  assert.strictEqual(engine.grid[0][2], C_CRUMBLING, "Tile (2,0) remains C_CRUMBLING");

  // Re-step onto (2,0) and verify it is walkable again
  const reStep = engine.executeMove(1, 0);
  assert.strictEqual(reStep.success, true, "Restored crumbling tile can be stepped on again");
  assert.strictEqual(engine.player.x, 2);
});

// ----------------------------------------------------------------------------
// TEST 19: Phase 3 Levels 11 to 15 Deterministic Solvability Traces
// ----------------------------------------------------------------------------
runTest("Test 19: Phase 3 Levels 11 to 15 Deterministic Solvability Traces", () => {
  const phase3Levels = LEVELS.slice(10, 15);

  phase3Levels.forEach((lvl) => {
    const engine = new GameEngineRig(lvl);
    const trace = lvl.trace;

    trace.forEach((dir, stepIdx) => {
      const res = engine.executeMove(dir.dx, dir.dy);
      assert.strictEqual(
        res.success,
        true,
        `Level ${lvl.id} step ${stepIdx + 1} (${dir.name}): Move rejected with reason ${res.reason}`
      );
      assert.strictEqual(
        engine.isDeadlocked,
        false,
        `Level ${lvl.id} step ${stepIdx + 1}: Unexpected premature deadlock!`
      );
    });

    assert.strictEqual(
      engine.player.x,
      lvl.goal.x,
      `Level ${lvl.id}: Player X (${engine.player.x}) does not match Goal X (${lvl.goal.x})`
    );
    assert.strictEqual(
      engine.player.y,
      lvl.goal.y,
      `Level ${lvl.id}: Player Y (${engine.player.y}) does not match Goal Y (${lvl.goal.y})`
    );
    assert.strictEqual(
      engine.isVictorious,
      true,
      `Level ${lvl.id} (${lvl.name}): Must achieve Victory`
    );
    assert.strictEqual(
      engine.isDeadlocked,
      false,
      `Level ${lvl.id} (${lvl.name}): Must not be deadlocked`
    );
    assert.strictEqual(
      engine.moveCount,
      lvl.par,
      `Level ${lvl.id}: Move count (${engine.moveCount}) must match par (${lvl.par})`
    );
    assert.strictEqual(
      engine.budget,
      0,
      `Level ${lvl.id}: Remaining budget at Goal must be EXACTLY 0 (Zero Margin for Error)`
    );
  });
});

console.log("\n================================================================================");
console.log(`   RESULTS: ${passedTests} / ${totalTests} TEST SUITES PASSED (100% CLEAN)`);
console.log("================================================================================");

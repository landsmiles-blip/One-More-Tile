/**
 * ONE MORE TILE - Redesign Simulation Engine & Solver
 * Supports:
 * - C_VOID = 0
 * - C_WALL = 1
 * - C_UNTOUCHED = 2
 * - C_CONSUMED = 3
 * - C_GOAL = 4
 * - C_CHECKPOINT_1 = 5
 * - C_CHECKPOINT_2 = 6
 * - C_CRUMBLING = 7
 * - C_SWITCH = 8
 * - C_GATE_RED = 9
 * - C_GATE_BLUE = 10
 * - C_CROSSROAD = 11 (2 visits remaining -> 1 -> C_CONSUMED)
 * - C_ICE = 12 (Frictionless slide; traversed ice tiles mutate to C_CONSUMED)
 */

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
const C_ICE = 12;

const DIRS = [
  { dx: 1, dy: 0, name: 'RIGHT' },
  { dx: -1, dy: 0, name: 'LEFT' },
  { dx: 0, dy: 1, name: 'DOWN' },
  { dx: 0, dy: -1, name: 'UP' }
];

class RedesignEngine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(r => [...r]);
    this.player = { ...levelDef.spawn };
    this.goal = { ...levelDef.goal };
    this.budget = levelDef.budget || 0;
    this.initialBudget = this.budget;
    this.initialPhase = levelDef.initialPhase !== undefined ? (levelDef.initialPhase === 'RED') : true;
    this.phaseState = this.initialPhase;
    this.checkpoints = (levelDef.checkpoints || []).map(c => ({ ...c }));
    this.hasC1 = this.checkpoints.some(c => c.id === 1);
    this.hasC2 = this.checkpoints.some(c => c.id === 2);
    this.c1Collected = !this.hasC1;
    this.c2Collected = !this.hasC2;

    // Crossroads visits tracking: Map key `${x},${y}` -> visitsRemaining (starts at 2)
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
    this.isComplete = false;
    this.undoStack = [];
  }

  // Count unconsumed tiles required for coverage
  getRemainingCount() {
    let count = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (x === this.player.x && y === this.player.y) continue;
        const cell = this.grid[y][x];
        if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) {
          count++;
        } else if (cell === C_CROSSROAD) {
          count += (this.crossroads.get(`${x},${y}`) || 0);
        }
      }
    }
    return count;
  }

  isGoalUnlocked() {
    if (!this.c1Collected || !this.c2Collected) return false;
    if (this.initialBudget === 0) {
      return this.getRemainingCount() === 0;
    } else {
      return this.budget === 1;
    }
  }

  isTilePassable(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const cell = this.grid[y][x];
    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
    if (cell === C_GATE_RED && !this.phaseState) return false;
    if (cell === C_GATE_BLUE && this.phaseState) return false;
    if (cell === C_GOAL) return this.isGoalUnlocked();
    if (cell === C_CROSSROAD) {
      const visits = this.crossroads.get(`${x},${y}`) || 0;
      return visits > 0;
    }
    return true;
  }

  // Execute move in dirName ('RIGHT', 'LEFT', 'DOWN', 'UP')
  // Returns { success: boolean, reason?: string }
  move(dirName) {
    if (this.isComplete || this.isDeadlocked) return { success: false, reason: 'FINISHED_OR_DEADLOCKED' };

    const dir = DIRS.find(d => d.name === dirName);
    if (!dir) return { success: false, reason: 'INVALID_DIRECTION' };

    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isTilePassable(nx, ny)) {
      return { success: false, reason: 'IMPASSABLE' };
    }

    // Save state for undo
    this.undoStack.push({
      player: { ...this.player },
      grid: this.grid.map(r => [...r]),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      crossroads: new Map(this.crossroads),
      budget: this.budget,
      moves: this.moves,
      isDeadlocked: this.isDeadlocked,
      isComplete: this.isComplete
    });

    const targetCell = this.grid[ny][nx];

    // Check if targetCell is ICE: initiates slide!
    if (targetCell === C_ICE) {
      return this.executeSlide(dir, nx, ny);
    }

    // Standard non-ice single step:
    return this.executeStep(dir, nx, ny);
  }

  executeStep(dir, nx, ny) {
    const targetCell = this.grid[ny][nx];
    const depCell = this.grid[this.player.y][this.player.x];

    // Departure consumption
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
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

    // Advance player
    this.player.x = nx;
    this.player.y = ny;
    this.moves++;
    if (this.budget > 0) this.budget--;

    // Arrival triggers
    if (targetCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    } else if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (targetCell === C_GOAL) {
      this.isComplete = true;
      return { success: true, complete: true };
    }

    this.checkDeadlock();
    return { success: true };
  }

  // Momentum sliding logic for C_ICE
  executeSlide(dir, startX, startY) {
    // Departure from the current tile
    const depCell = this.grid[this.player.y][this.player.x];
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
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

    let cx = startX;
    let cy = startY;

    // Slide loop
    while (true) {
      // We are at (cx, cy) which is C_ICE
      const aheadX = cx + dir.dx;
      const aheadY = cy + dir.dy;

      // Check what is ahead
      const isAheadPassable = this.isTilePassable(aheadX, aheadY);

      if (!isAheadPassable) {
        // Cannot proceed ahead. Slide stops AT (cx, cy)!
        // (cx, cy) remains the current standing tile (ice).
        // It will be consumed when the player departs on their next move.
        break;
      }

      const aheadCell = this.grid[aheadY][aheadX];

      if (aheadCell === C_ICE) {
        // Ahead is also ICE!
        // We traverse (cx, cy), so (cx, cy) mutates to C_CONSUMED (Trail-Bumper axiom)
        this.grid[cy][cx] = C_CONSUMED;
        cx = aheadX;
        cy = aheadY;
      } else {
        // Ahead is a NON-ICE traversable tile (e.g. UNTOUCHED, CROSSROAD, GOAL, etc.)
        // We traverse (cx, cy), so (cx, cy) mutates to C_CONSUMED
        this.grid[cy][cx] = C_CONSUMED;
        cx = aheadX;
        cy = aheadY;
        // Friction grips! Slide stops on this non-ice tile!
        break;
      }
    }

    // Player comes to rest at (cx, cy)
    this.player.x = cx;
    this.player.y = cy;
    this.moves++;
    if (this.budget > 0) this.budget--;

    // Arrival triggers for final rest tile
    const finalCell = this.grid[cy][cx];
    if (finalCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    } else if (finalCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (finalCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (finalCell === C_GOAL) {
      this.isComplete = true;
      return { success: true, complete: true };
    }

    this.checkDeadlock();
    return { success: true };
  }

  checkDeadlock() {
    if (this.isComplete) return;
    if (this.budget < 0) {
      this.isDeadlocked = true;
      return;
    }
    // Check if any legal move exists from player position
    const hasMove = DIRS.some(d => this.isTilePassable(this.player.x + d.dx, this.player.y + d.dy));
    if (!hasMove) {
      this.isDeadlocked = true;
    }
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const frame = this.undoStack.pop();
    this.player = frame.player;
    this.grid = frame.grid;
    this.phaseState = frame.phaseState;
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.crossroads = frame.crossroads;
    this.budget = frame.budget;
    this.moves = frame.moves;
    this.isDeadlocked = frame.isDeadlocked;
    this.isComplete = frame.isComplete;
    return true;
  }
}

module.exports = {
  RedesignEngine,
  C_VOID, C_WALL, C_UNTOUCHED, C_CONSUMED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH,
  C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, C_ICE,
  DIRS
};

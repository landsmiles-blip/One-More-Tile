/**
 * ONE MORE TILE - Level Designer & Verification Engine
 * For Levels 11 - 20 Redesign
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

const DIRS = {
  RIGHT: { dx: 1, dy: 0, name: 'RIGHT' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  DOWN:  { dx: 0, dy: 1, name: 'DOWN' },
  UP:    { dx: 0, dy: -1, name: 'UP' }
};

const DIR_LIST = [DIRS.RIGHT, DIRS.LEFT, DIRS.DOWN, DIRS.UP];

class SimEngine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(r => [...r]);
    this.player = { ...levelDef.spawn };
    this.goal = { ...levelDef.goal };
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
    this.isComplete = false;
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
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
    if (cell === C_GATE_RED && !this.phaseState) return false;
    if (cell === C_GATE_BLUE && this.phaseState) return false;
    if (cell === C_GOAL) return this.isGoalUnlocked();
    if (cell === C_CROSSROAD) {
      return (this.crossroads.get(`${x},${y}`) || 0) > 0;
    }
    return true;
  }

  getLegalMoves() {
    const moves = [];
    for (const d of DIR_LIST) {
      const nx = this.player.x + d.dx;
      const ny = this.player.y + d.dy;
      if (this.isTilePassable(nx, ny)) {
        moves.push(d);
      }
    }
    return moves;
  }

  move(dirName) {
    if (this.isComplete || this.isDeadlocked) return { success: false, reason: 'FINISHED_OR_DEADLOCKED' };

    const dir = DIRS[dirName];
    if (!dir) return { success: false, reason: 'INVALID_DIRECTION' };

    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isTilePassable(nx, ny)) {
      return { success: false, reason: 'IMPASSABLE' };
    }

    // Save frame for Undo
    this.undoStack.push({
      player: { ...this.player },
      grid: this.grid.map(r => [...r]),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      crossroads: new Map(this.crossroads),
      moves: this.moves,
      isDeadlocked: this.isDeadlocked,
      isComplete: this.isComplete
    });

    const targetCell = this.grid[ny][nx];
    const depCell = this.grid[this.player.y][this.player.x];

    // Departure mutation
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
      this.isComplete = true;
      return { success: true, complete: true };
    }

    // Deadlock check
    if (this.getLegalMoves().length === 0) {
      this.isDeadlocked = true;
    }

    return { success: true, complete: false };
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
    this.isComplete = frame.isComplete;
    return true;
  }
}

function verifyTrace(levelDef) {
  const engine = new SimEngine(levelDef);
  const branchingCounts = [];

  for (let i = 0; i < levelDef.trace.length; i++) {
    const dir = levelDef.trace[i];
    const legal = engine.getLegalMoves();
    branchingCounts.push(legal.length);

    const res = engine.move(dir);
    if (!res.success) {
      return {
        success: false,
        error: `Move ${i + 1} (${dir}) failed: ${res.reason}`,
        step: i + 1,
        player: engine.player
      };
    }
  }

  if (!engine.isComplete) {
    return {
      success: false,
      error: 'Trace ended without completing the level',
      remaining: engine.getRemainingCount(),
      goalUnlocked: engine.isGoalUnlocked()
    };
  }

  const avgBranching = branchingCounts.reduce((a, b) => a + b, 0) / branchingCounts.length;

  // Test Undo stack rollback: undo all moves
  for (let i = levelDef.trace.length - 1; i >= 0; i--) {
    const ok = engine.undo();
    if (!ok) {
      return { success: false, error: `Undo failed at move ${i}` };
    }
  }

  // Check state restored to spawn
  if (engine.player.x !== levelDef.spawn.x || engine.player.y !== levelDef.spawn.y) {
    return { success: false, error: 'Undo did not restore spawn position' };
  }
  if (engine.moves !== 0) {
    return { success: false, error: 'Undo did not restore move count to 0' };
  }

  return {
    success: true,
    moves: levelDef.trace.length,
    par: levelDef.par,
    avgBranching: Number(avgBranching.toFixed(2))
  };
}

module.exports = {
  C_VOID, C_WALL, C_UNTOUCHED, C_CONSUMED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH,
  C_GATE_RED, C_GATE_BLUE, C_CROSSROAD,
  DIRS, DIR_LIST, SimEngine, verifyTrace
};

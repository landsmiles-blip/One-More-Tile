/**
 * ONE MORE TILE - Cognitive Trials Simulation & Verification Engine
 * Implements exact mechanics for Levels 11-20 Stage 2 Synthesis
 */

const C_VOID = 0;         // Pit / empty chasm (impassable)
const C_FLOOR_STONE = 1;  // Static impassable wall / boundary
const C_UNTOUCHED = 2;    // Traversable floor (consumes on departure -> 3)
const C_CONSUMED = 3;     // Consumed floor (impassable)
const C_GOAL = 4;         // Portal / altar (passable when unlocked)
const C_CHECKPOINT_1 = 5; // Gold star / primary checkpoint
const C_CHECKPOINT_2 = 6; // Purple star / secondary checkpoint (gated by C1)
const C_CRUMBLING = 7;    // Cracked basalt (collapses to C_VOID = 0 on departure)
const C_SWITCH = 8;       // Phase plate (toggles polarity Red <-> Blue)
const C_GATE_RED = 9;     // Closed when RED; open when BLUE
const C_GATE_BLUE = 10;   // Closed when BLUE; open when RED
const C_CROSSROAD = 11;   // Junction tile visited twice (2 -> 1 -> 3)

const DIRS = {
  UP:    { dx: 0, dy: -1, name: 'UP' },
  DOWN:  { dx: 0, dy: 1,  name: 'DOWN' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  RIGHT: { dx: 1, dy: 0,  name: 'RIGHT' }
};

class PsychEngine {
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
    if (cell === C_VOID || cell === C_FLOOR_STONE || cell === C_CONSUMED) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false; // C2 gated by C1
    // Gate Polarity:
    // C_GATE_RED is closed when polarity is RED; open when BLUE
    if (cell === C_GATE_RED && this.phase === "RED") return false;
    // C_GATE_BLUE is closed when polarity is BLUE; open when RED
    if (cell === C_GATE_BLUE && this.phase === "BLUE") return false;

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

  move(dirName) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (this.isDeadlocked) return { success: false, reason: 'DEADLOCKED' };

    const dir = DIRS[dirName];
    if (!dir) return { success: false, reason: 'INVALID_DIRECTION' };

    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isTilePassable(nx, ny)) {
      return { success: false, reason: 'IMPASSABLE' };
    }

    // Save complete snapshot for lossless Undo
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
      this.grid[this.player.y][this.player.x] = C_VOID; // Collapses into chasm
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

function verifyPsychSolution(levelDef) {
  const engine = new PsychEngine(levelDef);
  const initialRemaining = engine.getRemainingCount();

  if (levelDef.trace.length !== levelDef.par) {
    return { success: false, error: `Trace length ${levelDef.trace.length} does not match par ${levelDef.par}` };
  }

  for (let i = 0; i < levelDef.trace.length; i++) {
    const dir = levelDef.trace[i];
    if (i === levelDef.trace.length - 1) {
      // Prior to final step into goal, remaining must be 0 and goal unlocked
      if (engine.getRemainingCount() !== 0) {
        return { success: false, error: `Step ${i}: ${engine.getRemainingCount()} tiles unconsumed prior to goal entry` };
      }
      if (!engine.isGoalUnlocked()) {
        return { success: false, error: `Step ${i}: Goal not unlocked prior to goal entry` };
      }
    }

    const res = engine.move(dir);
    if (!res.success) {
      return { success: false, error: `Step ${i + 1} (${dir}) failed: ${res.reason}`, at: engine.player };
    }
  }

  if (!engine.isVictorious) {
    return { success: false, error: "Trace finished but victory was not achieved" };
  }

  // Verify full Undo rollback
  for (let i = levelDef.trace.length - 1; i >= 0; i--) {
    const ok = engine.undo();
    if (!ok) return { success: false, error: `Undo failed at step ${i}` };
  }

  if (engine.player.x !== levelDef.spawn.x || engine.player.y !== levelDef.spawn.y) {
    return { success: false, error: "Undo did not restore spawn position" };
  }
  if (engine.moves !== 0) {
    return { success: false, error: "Undo did not restore moves to 0" };
  }
  if (engine.getRemainingCount() !== initialRemaining) {
    return { success: false, error: "Undo did not restore initial remaining count" };
  }
  if (engine.isVictorious) {
    return { success: false, error: "Undo did not reset victory" };
  }

  return { success: true };
}

module.exports = {
  C_VOID, C_FLOOR_STONE, C_UNTOUCHED, C_CONSUMED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH,
  C_GATE_RED, C_GATE_BLUE, C_CROSSROAD,
  DIRS, PsychEngine, verifyPsychSolution
};

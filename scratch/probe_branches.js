const fs = require('fs');
const levels = JSON.parse(fs.readFileSync('scratch/levels11_20_take3_spec.json', 'utf8'));

// Exact cell enum constants
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
  UP:    { dx: 0, dy: -1 },
  DOWN:  { dx: 0, dy: 1 },
  LEFT:  { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 }
};

class SimEngine {
  constructor(lvl) {
    this.lvl = lvl;
    this.w = lvl.w;
    this.h = lvl.h;
    this.grid = lvl.grid.map(r => [...r]);
    this.player = { ...lvl.spawn };
    this.goal = { ...lvl.goal };
    this.phase = lvl.initialPhase || "RED";
    this.checkpoints = (lvl.checkpoints || []).map(c => ({ ...c }));
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
    if (cell === C_VOID || cell === C_WALL || cell === C_CONSUMED) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
    if (cell === C_GATE_RED && this.phase === "RED") return false;
    if (cell === C_GATE_BLUE && this.phase === "BLUE") return false;
    if (cell === C_GOAL) return this.isGoalUnlocked();
    if (cell === C_CROSSROAD) return (this.crossroads.get(`${x},${y}`) || 0) > 0;
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

    const dir = DIRS[dirName];
    if (!dir) return { success: false, reason: 'INVALID_DIRECTION' };

    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isTilePassable(nx, ny)) {
      const cell = (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h) ? this.grid[ny][nx] : -1;
      if (cell === C_GOAL && !this.isGoalUnlocked()) return { success: false, reason: 'GOAL_LOCKED' };
      if (cell === C_CHECKPOINT_2 && !this.c1Collected) return { success: false, reason: 'C2_LOCKED' };
      if (cell === C_GATE_RED && this.phase === "RED") return { success: false, reason: 'RED_GATE_CLOSED' };
      if (cell === C_GATE_BLUE && this.phase === "BLUE") return { success: false, reason: 'BLUE_GATE_CLOSED' };
      if (cell === C_CONSUMED) return { success: false, reason: 'CONSUMED_IMPASSABLE' };
      if (cell === C_VOID) return { success: false, reason: 'VOID_IMPASSABLE' };
      return { success: false, reason: 'IMPASSABLE' };
    }

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

// Let us test branches along the winning path for each level
levels.forEach(lvl => {
  console.log(`\n=== Probing Branch Points for Level ${lvl.id}: "${lvl.name}" ===`);
  const engine = new SimEngine(lvl);
  for (let step = 0; step < lvl.trace.length; step++) {
    const intendedDir = lvl.trace[step];
    const legalMoves = engine.getLegalMoves();
    const altMoves = legalMoves.filter(m => m !== intendedDir);
    if (altMoves.length > 0) {
      console.log(`  Step ${step} at (${engine.player.x}, ${engine.player.y}) cell=${lvl.grid[engine.player.y][engine.player.x]}: Intended ${intendedDir}, Alternatives: [${altMoves.join(', ')}]`);
    }
    const res = engine.move(intendedDir);
    if (!res.success) {
      console.log(`  Failed at step ${step}: ${res.reason}`);
      break;
    }
  }
});

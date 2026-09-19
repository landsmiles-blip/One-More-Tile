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
}

// 10 Refined Traps:
const refinedTraps = [
  {
    id: 11,
    name: "Basalt Snatch & Dead-End Cul-de-sac",
    description: "At Crumbling Basalt (4,0), player turns DOWN to snatch C1 at (4,1), then loops to (5,1) and UP to (5,0), hitting a 0-move dead end because (4,0) collapsed to VOID.",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN", "RIGHT", "UP"]
  },
  {
    id: 12,
    name: "Instant Goal Rush from Spawn",
    description: "Player immediately attempts to step DOWN from spawn (0,0) directly into adjacent Goal at (0,1) with 26 tiles remaining.",
    moves: ["DOWN"]
  },
  {
    id: 13,
    name: "Premature C2 Shortcut & Unconsumed Crossroads",
    description: "At (4,4), player turns UP directly to C2 at (4,3) bypassing the 2nd visit to crossroads (5,4)/(5,3), deadlocking at Goal.",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "UP", "LEFT", "LEFT", "LEFT", "LEFT", "UP", "RIGHT"
    ]
  },
  {
    id: 14,
    name: "C1 Bypass & C2 Lockout Impasse",
    description: "At (5,4), player cuts LEFT to (4,4) before collecting C1 at (5,5), attempting to enter C2 at (4,3) which is strictly locked.",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "UP"
    ]
  },
  {
    id: 15,
    name: "Premature Altar Plunge at Basalt Crossing",
    description: "At Crumbling Basalt (4,0), player turns DOWN into (4,1) (Goal) with 32 tiles remaining and C1/C2 uncollected.",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN"]
  },
  {
    id: 16,
    name: "Direct Charge into Locked Red Gate",
    description: "From spawn (0,0), player moves DOWN to (0,1), then attempts to step DOWN into closed Red Gate at (0,2).",
    moves: ["DOWN", "DOWN"]
  },
  {
    id: 17,
    name: "Polarity Switch Bypass & Red Gate Collision",
    description: "Player follows perimeter but skips the Switch at (2,4) by turning UP at (1,4), leaving phase RED and crashing into Red Gate at (2,1).",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", // at (0,4)
      "RIGHT", // at (1,4)
      "UP", // skips switch at (2,4) by turning UP into (1,3)
      "RIGHT", "UP", "UP" // moves toward Red Gate at (2,1)
    ]
  },
  {
    id: 18,
    name: "Switch 2 Bypass & Red Gate Collision",
    description: "Player skips Switch 2 at (0,5), leaving polarity RED, and collides with closed Red Gate at (3,4).",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT", "RIGHT"
    ]
  },
  {
    id: 19,
    name: "Out-of-Order C2 Intrusion before C1",
    description: "Player traverses north corridor and attempts to enter Checkpoint 2 at (2,3) before Checkpoint 1 at (5,5) is collected.",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT"
    ]
  },
  {
    id: 20,
    name: "Basalt Collapse into Premature Goal Ambush",
    description: "At Crumbling Basalt (4,0), player turns DOWN to (4,1) and tries to step LEFT into Goal at (3,1) with 38 tiles remaining.",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", // At (4,0) Crumbling, steps DOWN to (4,1)
      "LEFT"  // Tries to step LEFT into Goal (3,1)
    ]
  }
];

refinedTraps.forEach(trap => {
  const lvl = levels.find(l => l.id === trap.id);
  const engine = new SimEngine(lvl);
  let failed = false;
  let failReason = null;
  let failStep = -1;

  for (let i = 0; i < trap.moves.length; i++) {
    const dir = trap.moves[i];
    const res = engine.move(dir);
    if (!res.success) {
      failed = true;
      failReason = res.reason;
      failStep = i + 1;
      break;
    }
  }

  const remaining = engine.getRemainingCount();
  const deadlocked = engine.isDeadlocked;
  console.log(`[Level ${trap.id}] Trap: "${trap.name}"`);
  console.log(`  Description: ${trap.description}`);
  console.log(`  Failed: ${failed}, Reason: ${failReason} at step ${failStep}, Deadlocked: ${deadlocked}, Remaining: ${remaining}`);
});

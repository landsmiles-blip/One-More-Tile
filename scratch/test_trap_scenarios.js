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

// Define the 10 adversarial trap tests
const trapDefinitions = [
  {
    id: 11,
    name: "Premature Basalt Exit & Star Snatch",
    description: "At Crumbling Basalt (4,0), player greedily turns DOWN to snatch Checkpoint 1 at (4,1) instead of traversing across to (5,0).",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN"] // at step 4 (4,0), turns DOWN to (4,1)
  },
  {
    id: 12,
    name: "Premature Chasm Plunge & East Lobe Stranding",
    description: "At Crumbling Basalt (3,0), player turns DOWN into (3,1) instead of traversing across to (4,0)/(5,0).",
    moves: ["RIGHT", "RIGHT", "RIGHT", "DOWN"] // at (3,0), turns DOWN to (3,1)
  },
  {
    id: 13,
    name: "Premature C2 Shortcut (Crossroad Starvation)",
    description: "At (4,4), player turns UP directly to C2 at (4,3) bypassing the second visit to crossroad hubs (5,4) and (5,3).",
    // winning trace moves 0..20 get to (4,4), then turns UP to (4,3), then tries to reach goal at (1,2)
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "UP", // At (4,4), turns UP to (4,3)[C2]
      "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", "RIGHT" // Steps toward Goal at (1,2)
    ]
  },
  {
    id: 14,
    name: "Premature Lobe Bypass (Uncollected C1 & C2 Gate Lock)",
    description: "At (5,4), player greedily cuts LEFT to (4,4) before collecting Checkpoint 1 at (5,5), causing C2 at (4,3) to be locked.",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", // At (5,4), turns LEFT to (4,4) instead of DOWN to (5,5)[C1]
      "UP"   // Tries to step UP into C2 at (4,3)
    ]
  },
  {
    id: 15,
    name: "Premature Altar Rush into Locked Goal",
    description: "At step 4 on Crumbling Basalt (4,0), player greedily turns DOWN into (4,1) which is the Goal altar.",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN"] // At (4,0), steps DOWN to (4,1) [Goal]
  },
  {
    id: 16,
    name: "Direct Charge into Closed Red Gate",
    description: "From spawn, player tries to move directly toward Goal and hits the Red Gate at (0,2) while phase is RED.",
    moves: ["DOWN"] // from (0,0) tries to go DOWN, wait: (0,1) is floor, then (0,2) is Red Gate!
  },
  {
    id: 17,
    name: "Greedy Dead-End Plunge",
    description: "At (1,0), player turns DOWN into (1,1) (dead end chamber) instead of passing through open Blue Gate at (2,0).",
    moves: ["RIGHT", "DOWN"] // from (1,0) steps DOWN into (1,1)
  },
  {
    id: 18,
    name: "Phase Switch Skip & Red Gate Collision",
    description: "Player skirts around Switch 2 at (0,5), leaving polarity RED, and collides with closed Red Gate at (3,4).",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT",
      "UP", // At (1,5), turns UP to (1,4) skipping Switch at (0,5)!
      "RIGHT", "RIGHT" // Moves across row 4 to (3,4) [Red Gate]
    ]
  },
  {
    id: 19,
    name: "Premature C2 Grab before C1 Collection",
    description: "Player traverses north corridor and attempts to enter Checkpoint 2 at (2,3) before Checkpoint 1 at (5,5) is collected.",
    moves: [
      "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT",
      "DOWN", "DOWN", "DOWN",
      "LEFT", "LEFT", "LEFT", "LEFT" // At (6,3), moves LEFT to (2,3) [C2]
    ]
  },
  {
    id: 20,
    name: "Crumbling Basalt Premature Collapse & East Stranding",
    description: "At Crumbling Basalt (4,0), player turns DOWN into (4,1) instead of crossing to (5,0), stranding the entire East sector.",
    moves: ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN"]
  }
];

console.log("================================================================================");
console.log("   TESTING 10 ADVERSARIAL TRAP SCENARIOS");
console.log("================================================================================\n");

trapDefinitions.forEach(trap => {
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
  console.log(`  Result: failed=${failed} (Reason: ${failReason} at move ${failStep}), deadlocked=${deadlocked}, remainingTiles=${remaining}`);
  console.log("");
});

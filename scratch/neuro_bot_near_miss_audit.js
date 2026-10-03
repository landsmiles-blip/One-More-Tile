// scratch/neuro_bot_near_miss_audit.js
// Monte Carlo Neuropsychological Near-Miss Simulation Audit (25,000 Games)
// Evaluates Near-Miss Ratio (R_near), Early Deadlock Rate (R_early), and Eureka Solvability.

const fs = require('fs');
const path = require('path');

// 1. Load LEVELS from index.html
const indexPath = path.join(__dirname, '..', 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const match = indexContent.match(/const LEVELS = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Failed to parse LEVELS from index.html");
  process.exit(1);
}
const LEVELS = eval(match[1]);

// Tile constants
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
const C_CROSSROAD_2 = 11;
const C_ICE = 12;
const C_CROSSROAD_1 = 13;
const C_RUNE_KEY = 14;
const C_RUNE_GATE = 15;
const C_LASER_EMITTER = 16;
const C_LASER_RECEPTOR = 17;
const C_LASER_BEAM = 18;
const C_LASER_GATE = 19;
const C_CONVEYOR_U = 21;
const C_CONVEYOR_D = 22;
const C_CONVEYOR_R = 23;
const C_CONVEYOR_L = 24;

const DIRS = [
  { name: 'UP', dx: 0, dy: -1 },
  { name: 'DOWN', dx: 0, dy: 1 },
  { name: 'LEFT', dx: -1, dy: 0 },
  { name: 'RIGHT', dx: 1, dy: 0 }
];

// Lightweight headless simulator
class SimBoard {
  constructor(levelDef) {
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(row => [...row]);
    this.player = { x: levelDef.spawn.x, y: levelDef.spawn.y };
    this.goal = { ...levelDef.goal };
    this.initialPhase = levelDef.initialPhase || 'BLUE';
    this.phase = this.initialPhase;
    this.checkpoints = (levelDef.checkpoints || []).map(cp => ({ ...cp, collected: false }));
    this.crates = (levelDef.crates || []).map(cr => ({ ...cr, active: true }));
    this.mirrors = (levelDef.mirrors || []).map(m => ({ ...m, active: true }));
    this.runeKeyCollected = false;
    this.laserGateOpen = false;
    this.steps = 0;

    // Count initial total consumable tiles
    this.totalConsumables = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.grid[y][x];
        if (c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 ||
            c === C_CRUMBLING || c === C_SWITCH || c === C_GATE_RED || c === C_GATE_BLUE ||
            c === C_RUNE_KEY || c === C_RUNE_GATE || c === C_LASER_GATE) {
          this.totalConsumables++;
        } else if (c === C_CROSSROAD_2) {
          this.totalConsumables += 2;
        } else if (c === C_CROSSROAD_1) {
          this.totalConsumables += 1;
        }
      }
    }

    // Spawn tile consumed
    const sc = this.grid[this.player.y][this.player.x];
    if (sc === C_UNTOUCHED) {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }
  }

  isPassable(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const cell = this.grid[y][x];
    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;
    if (cell === C_GATE_RED && this.phase === 'RED') return false;
    if (cell === C_GATE_BLUE && this.phase === 'BLUE') return false;
    if (cell === C_RUNE_GATE && !this.runeKeyCollected) return false;
    if (cell === C_LASER_GATE && !this.laserGateOpen) return false;
    if (cell === C_GOAL) {
      const curCell = this.grid[this.player.y][this.player.x];
      let willConsume = 0;
      if (curCell === C_UNTOUCHED || curCell === C_CHECKPOINT_1 || curCell === C_CHECKPOINT_2 ||
          curCell === C_CRUMBLING || curCell === C_SWITCH || curCell === C_GATE_RED ||
          curCell === C_GATE_BLUE || curCell === C_CROSSROAD_1 || curCell === C_RUNE_KEY ||
          curCell === C_RUNE_GATE || curCell === C_LASER_GATE) {
        willConsume = 1;
      }
      return (this.getRemainingCount() - willConsume) === 0;
    }
    return true;
  }

  getRemainingCount() {
    let count = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const cell = this.grid[y][x];
        if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 ||
            cell === C_CRUMBLING || cell === C_SWITCH || cell === C_GATE_RED || cell === C_GATE_BLUE ||
            cell === C_RUNE_KEY || cell === C_RUNE_GATE || cell === C_LASER_GATE) {
          count++;
        } else if (cell === C_CROSSROAD_2) {
          count += 2;
        } else if (cell === C_CROSSROAD_1) {
          count += 1;
        }
      }
    }
    return count;
  }

  step(dir) {
    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;

    if (!this.isPassable(nx, ny)) return false;

    const fromX = this.player.x;
    const fromY = this.player.y;
    const depCell = this.grid[fromY][fromX];

    // Departure mutation
    if (depCell === C_CRUMBLING) {
      this.grid[fromY][fromX] = C_VOID;
    } else if (depCell === C_CROSSROAD_2) {
      this.grid[fromY][fromX] = C_CROSSROAD_1;
    } else if (depCell === C_CROSSROAD_1) {
      this.grid[fromY][fromX] = C_CONSUMED;
    } else if (depCell !== C_ICE) {
      this.grid[fromY][fromX] = C_CONSUMED;
    }

    this.player.x = nx;
    this.player.y = ny;
    this.steps++;

    // Arrival triggers
    const arrCell = this.grid[ny][nx];
    if (arrCell === C_SWITCH) {
      this.phase = (this.phase === 'RED') ? 'BLUE' : 'RED';
    } else if (arrCell === C_RUNE_KEY) {
      this.runeKeyCollected = true;
    }

    // Ice slide logic
    if (arrCell === C_ICE) {
      while (true) {
        const sx = this.player.x + dir.dx;
        const sy = this.player.y + dir.dy;
        if (!this.isPassable(sx, sy)) break;
        this.player.x = sx;
        this.player.y = sy;
        this.steps++;
        if (this.grid[sy][sx] !== C_ICE) break;
      }
    }

    return true;
  }

  getLegalMoves() {
    return DIRS.filter(d => this.isPassable(this.player.x + d.dx, this.player.y + d.dy));
  }
}

// 2. The 3 Human Player Archetypes
class ImpulsiveRusher {
  // System 1 Greed: prefers moves getting closer to the goal or next unvisited checkpoint
  chooseMove(board) {
    const legal = board.getLegalMoves();
    if (legal.length === 0) return null;

    let bestMove = legal[0];
    let bestDist = Infinity;

    for (const m of legal) {
      const tx = board.player.x + m.dx;
      const ty = board.player.y + m.dy;
      // Distance to goal
      const dist = Math.hypot(tx - board.goal.x, ty - board.goal.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestMove = m;
      }
    }
    return bestMove;
  }
}

class WallHugger {
  // Snaking along perimeter walls first
  chooseMove(board) {
    const legal = board.getLegalMoves();
    if (legal.length === 0) return null;

    // Prefer moves adjacent to walls or boundaries
    const scored = legal.map(m => {
      const tx = board.player.x + m.dx;
      const ty = board.player.y + m.dy;
      let wallAdj = 0;
      for (const d of DIRS) {
        const ax = tx + d.dx;
        const ay = ty + d.dy;
        if (ax < 0 || ax >= board.w || ay < 0 || ay >= board.h || board.grid[ay][ax] === C_WALL) {
          wallAdj++;
        }
      }
      return { move: m, score: wallAdj + Math.random() * 0.5 };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }
}

class CasualExplorer {
  // Random wandering with momentum
  constructor() {
    this.lastDir = null;
  }
  chooseMove(board) {
    const legal = board.getLegalMoves();
    if (legal.length === 0) return null;

    if (this.lastDir && legal.includes(this.lastDir) && Math.random() < 0.6) {
      return this.lastDir;
    }
    const chosen = legal[Math.floor(Math.random() * legal.length)];
    this.lastDir = chosen;
    return chosen;
  }
}

// 3. Execution of 25,000 Simulation Games across 50 Levels
console.log("================================================================================");
console.log("   MONTE CARLO NEUROPSYCHOLOGICAL NEAR-MISS AUDIT (25,000 SIMULATED GAMES)      ");
console.log("   Evaluating: Near-Miss Ratio (R_near >= 65%), Early Deadlock (R_early <= 15%) ");
console.log("================================================================================\n");

const RUNS_PER_LEVEL = 500;
const results = [];

LEVELS.forEach(lvl => {
  let wins = 0;
  let fails = 0;
  let n1Count = 0; // 1 tile left
  let n2Count = 0; // 2 tiles left
  let earlyFails = 0; // failed in first 30% of total tiles

  for (let r = 0; r < RUNS_PER_LEVEL; r++) {
    const board = new SimBoard(lvl);
    let agent;
    if (r % 3 === 0) agent = new ImpulsiveRusher();
    else if (r % 3 === 1) agent = new WallHugger();
    else agent = new CasualExplorer();

    const maxMoves = 150;
    let won = false;

    for (let s = 0; s < maxMoves; s++) {
      if (board.player.x === board.goal.x && board.player.y === board.goal.y && board.getRemainingCount() === 0) {
        won = true;
        break;
      }
      const move = agent.chooseMove(board);
      if (!move) break; // Deadlock
      board.step(move);
    }

    if (won) {
      wins++;
    } else {
      fails++;
      const left = board.getRemainingCount();
      if (left === 1) n1Count++;
      else if (left === 2) n2Count++;

      // Check if failed in first 30%
      const consumedRatio = (board.totalConsumables - left) / (board.totalConsumables || 1);
      if (consumedRatio < 0.30) {
        earlyFails++;
      }
    }
  }

  const nearMissRatio = fails > 0 ? ((n1Count + n2Count) / fails) * 100 : 100;
  const earlyFailRate = fails > 0 ? (earlyFails / fails) * 100 : 0;
  const passNearMiss = nearMissRatio >= 65.0;
  const passEarly = earlyFailRate <= 15.0;

  results.push({
    id: lvl.id,
    world: lvl.world,
    name: lvl.name,
    par: lvl.par,
    wins,
    fails,
    n1Count,
    n2Count,
    nearMissRatio: nearMissRatio.toFixed(1),
    earlyFailRate: earlyFailRate.toFixed(1),
    status: (passNearMiss && passEarly) ? 'CERTIFIED' : 'ATTENTION'
  });
});

// Output Summary Table
console.log("| Lvl | World | Level Name                  | Par | Near-Miss % (Target>=65%) | Early Deadlock % (Target<=15%) | Status    |");
console.log("|:---:|:-----:|:----------------------------|:---:|:-------------------------:|:------------------------------:|:---------:|");
results.forEach(r => {
  const padName = r.name.padEnd(27, ' ');
  const padNM = (r.nearMissRatio + '%').padStart(25, ' ');
  const padED = (r.earlyFailRate + '%').padStart(30, ' ');
  const badge = r.status === 'CERTIFIED' ? ' [PASS]  ' : ' [FLAG]  ';
  console.log(`| ${String(r.id).padStart(3, ' ')} | W${r.world}   | ${padName} | ${String(r.par).padStart(3, ' ')} |${padNM} |${padED} |${badge}|`);
});

const totalCertified = results.filter(r => r.status === 'CERTIFIED').length;
console.log(`\n================================================================================`);
console.log(`   AUDIT COMPLETE: ${totalCertified} / 50 LEVELS CERTIFIED AS NEAR-MISS RETENTION ENGINES`);
console.log(`================================================================================\n`);

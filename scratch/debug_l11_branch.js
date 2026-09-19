const fs = require('fs');
const lvls = JSON.parse(fs.readFileSync('scratch/levels11_20_spec.json', 'utf8'));
const l11 = lvls[0];

const C_VOID = 0, C_WALL = 1, C_UNTOUCHED = 2, C_CONSUMED = 3, C_GOAL = 4, C_CHECKPOINT_1 = 5, C_CHECKPOINT_2 = 6, C_CRUMBLING = 7, C_SWITCH = 8, C_GATE_RED = 9, C_GATE_BLUE = 10, C_CROSSROAD = 11;
const DIRS = {
  RIGHT: { dx: 1, dy: 0, name: 'RIGHT' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  DOWN:  { dx: 0, dy: 1,  name: 'DOWN' },
  UP:    { dx: 0, dy: -1, name: 'UP' }
};

// Simulation from scratch/adversarial_levels11_20.js
class AdversarialEngine {
  constructor(levelDef) {
    this.lvl = levelDef;
    this.w = levelDef.w;
    this.h = levelDef.h;
    this.grid = levelDef.grid.map(row => [...row]);
    this.player = { ...levelDef.spawn };
    this.goal = { ...levelDef.goal };
    this.par = levelDef.par;
    this.initialBudget = levelDef.budget !== undefined ? levelDef.budget : 0;
    this.budget = this.initialBudget;
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
        if (this.grid[y][x] === C_CROSSROAD) this.crossroads.set(`${x},${y}`, 2);
      }
    }
    this.moves = 0;
    this.isDeadlocked = false;
    this.isVictorious = false;
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
    if (cell === C_CROSSROAD) return (this.crossroads.get(`${x},${y}`) || 0) > 0;
    return true;
  }
  getLegalMoves() {
    const moves = [];
    for (const d of Object.values(DIRS)) {
      const nx = this.player.x + d.dx;
      const ny = this.player.y + d.dy;
      if (this.isTilePassable(nx, ny)) moves.push(d);
    }
    return moves;
  }
  move(dirName) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (this.isDeadlocked) return { success: false, reason: 'DEADLOCKED' };
    const dir = typeof dirName === 'string' ? DIRS[dirName] : dirName;
    const nx = this.player.x + dir.dx;
    const ny = this.player.y + dir.dy;
    if (!this.isTilePassable(nx, ny)) return { success: false, reason: 'IMPASSABLE' };

    const targetCell = this.grid[ny][nx];
    const depCell = this.grid[this.player.y][this.player.x];
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else if (depCell === C_CROSSROAD) {
      const key = `${this.player.x},${this.player.y}`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) this.grid[this.player.y][this.player.x] = C_CONSUMED;
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    this.player.x = nx;
    this.player.y = ny;
    this.moves++;
    if (targetCell === C_SWITCH) this.phaseState = !this.phaseState;
    else if (targetCell === C_CHECKPOINT_1) this.c1Collected = true;
    else if (targetCell === C_CHECKPOINT_2) this.c2Collected = true;
    else if (targetCell === C_GOAL) {
      this.isVictorious = true;
      return { success: true, victorious: true };
    }
    if (this.getLegalMoves().length === 0) this.isDeadlocked = true;
    return { success: true, victorious: false };
  }
}

const engine = new AdversarialEngine(l11);
// Follow trace up to step 14
for (let i = 0; i < 14; i++) {
  engine.move(l11.trace[i]);
}
console.log('Player after step 14:', engine.player);
console.log('Optimal step 14 (idx 14):', l11.trace[14]);
console.log('Legal moves at step 14:', engine.getLegalMoves().map(d => d.name));

// Now move DOWN instead of RIGHT
console.log('Moving DOWN instead of RIGHT:');
const devRes = engine.move('DOWN');
console.log('devRes:', devRes, 'Player now:', engine.player);

const pathTaken = ['DOWN'];
let steps = 0;
while (!engine.isDeadlocked && !engine.isVictorious && steps < 30) {
  const legal = engine.getLegalMoves();
  console.log(`Step ${steps + 1}: legal moves =`, legal.map(d => d.name));
  if (legal.length === 0) break;
  pathTaken.push(legal[0].name);
  engine.move(legal[0].name);
  console.log(`  Moved ${legal[0].name} to (${engine.player.x}, ${engine.player.y}), remaining: ${engine.getRemainingCount()}, vict: ${engine.isVictorious}`);
  steps++;
}

console.log('Total path from deviation:', pathTaken);
console.log('isVictorious:', engine.isVictorious, 'moves:', engine.moves, 'par:', engine.par);

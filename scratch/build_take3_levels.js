/**
 * ONE MORE TILE — TAKE 3 SYNTHESIZER
 * Generates Levels 11 through 20 (Pars 25 to 40)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Cell enums
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
  UP:    { dx: 0, dy: -1, name: 'UP' },
  DOWN:  { dx: 0, dy: 1,  name: 'DOWN' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  RIGHT: { dx: 1, dy: 0,  name: 'RIGHT' }
};

// Simulation engine for verification
class Take3SimEngine {
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
    if (cell === C_VOID || cell === C_WALL || cell === C_CONSUMED) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;

    // Gate polarity:
    // C_GATE_RED (9): closed when RED, open when BLUE
    if (cell === C_GATE_RED && this.phase === "RED") return false;
    // C_GATE_BLUE (10): closed when BLUE, open when RED
    if (cell === C_GATE_BLUE && this.phase === "BLUE") return false;

    if (cell === C_GOAL) return this.isGoalUnlocked();
    if (cell === C_CROSSROAD) {
      return (this.crossroads.get(`${x},${y}`) || 0) > 0;
    }
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

    // Departure mutations
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID; // (0)
    } else if (depCell === C_CROSSROAD) {
      const key = `${this.player.x},${this.player.y}`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED; // (3)
      }
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED; // (3)
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

function verifySolution(levelDef) {
  const engine = new Take3SimEngine(levelDef);
  const initialRemaining = engine.getRemainingCount();

  if (levelDef.trace.length !== levelDef.par) {
    return { success: false, error: `Trace length ${levelDef.trace.length} != par ${levelDef.par}` };
  }

  for (let i = 0; i < levelDef.trace.length; i++) {
    const dir = levelDef.trace[i];
    if (i === levelDef.trace.length - 1) {
      if (engine.getRemainingCount() !== 0) {
        return { success: false, error: `Step ${i}: ${engine.getRemainingCount()} tiles unconsumed before Goal` };
      }
      if (!engine.isGoalUnlocked()) {
        return { success: false, error: `Step ${i}: Goal not unlocked before final move` };
      }
    }

    const res = engine.move(dir);
    if (!res.success) {
      return { success: false, error: `Step ${i + 1} (${dir}) failed: ${res.reason}`, at: engine.player };
    }
  }

  if (!engine.isVictorious) {
    return { success: false, error: "Goal reached but not victorious" };
  }

  // Verify Undo
  for (let i = levelDef.trace.length - 1; i >= 0; i--) {
    const ok = engine.undo();
    if (!ok) return { success: false, error: `Undo failed at step ${i}` };
  }

  if (engine.moves !== 0 || engine.player.x !== levelDef.spawn.x || engine.player.y !== levelDef.spawn.y) {
    return { success: false, error: "Undo did not restore initial state" };
  }
  if (engine.getRemainingCount() !== initialRemaining) {
    return { success: false, error: "Undo did not restore initial remaining tiles" };
  }

  return { success: true };
}

// Backtracking path searcher with parity guarantee
function searchPath({ w, h, par, crCount = 1, spawn = [0, 0], maxNodes = 500000 }) {
  const totalSteps = par;
  const targetUnique = par + 1 - crCount;
  const spawnParity = (spawn[0] + spawn[1]) % 2;
  const expectedGoalParity = (spawnParity + par) % 2;

  const dirs = [
    [1, 0, 'RIGHT'],
    [0, 1, 'DOWN'],
    [-1, 0, 'LEFT'],
    [0, -1, 'UP']
  ];

  const path = [spawn];
  const visitCounts = new Map();
  visitCounts.set(`${spawn[0]},${spawn[1]}`, 1);
  let uniqueCount = 1;
  let nodes = 0;
  let solution = null;

  function dfs(curr, crUsed) {
    if (solution) return;
    nodes++;
    if (nodes > maxNodes) return;

    if (path.length === totalSteps + 1) {
      if (crUsed === crCount && uniqueCount === targetUnique) {
        const goalKey = `${curr[0]},${curr[1]}`;
        // Goal must not be a crossroad
        if (visitCounts.get(goalKey) === 1) {
          const crCoords = [];
          for (const [k, v] of visitCounts.entries()) {
            if (v === 2) {
              const [cx, cy] = k.split(',').map(Number);
              crCoords.push([cx, cy]);
            }
          }
          solution = {
            path: path.map(p => [...p]),
            crCoords
          };
        }
      }
      return;
    }

    const stepsLeft = totalSteps + 1 - path.length;
    const crLeft = crCount - crUsed;
    const uniqueLeft = targetUnique - uniqueCount;
    if (stepsLeft < crLeft + uniqueLeft) return;

    for (const [dx, dy] of dirs) {
      const nx = curr[0] + dx;
      const ny = curr[1] + dy;

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const k = `${nx},${ny}`;
      const vc = visitCounts.get(k) || 0;

      if (vc === 0) {
        if (uniqueCount < targetUnique) {
          uniqueCount++;
          visitCounts.set(k, 1);
          path.push([nx, ny]);
          dfs([nx, ny], crUsed);
          path.pop();
          visitCounts.set(k, 0);
          uniqueCount--;
        }
      } else if (vc === 1 && crUsed < crCount) {
        if (nx === spawn[0] && ny === spawn[1]) continue;
        const prev = path[path.length - 2];
        if (prev && prev[0] === nx && prev[1] === ny) continue;
        if (path.length === totalSteps) continue; // goal cannot be crossroad

        visitCounts.set(k, 2);
        path.push([nx, ny]);
        dfs([nx, ny], crUsed + 1);
        path.pop();
        visitCounts.set(k, 1);
      }
      if (solution) return;
    }
  }

  dfs(spawn, 0);
  return solution;
}

function buildLevel({
  id, world, name, w, h, par,
  pathCoords, crCoords = [], crumbCoords = [],
  c1Coord = null, c2Coord = null,
  switchCoords = [], redGateCoords = [], blueGateCoords = [],
  initialPhase = "RED"
}) {
  const spawn = { x: pathCoords[0][0], y: pathCoords[0][1] };
  const goal = { x: pathCoords[pathCoords.length - 1][0], y: pathCoords[pathCoords.length - 1][1] };
  const inPath = new Set(pathCoords.map(p => `${p[0]},${p[1]}`));

  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      if (!inPath.has(`${x},${y}`)) {
        row.push(C_WALL);       // 1
      } else {
        row.push(C_UNTOUCHED);  // 2
      }
    }
    grid.push(row);
  }

  grid[goal.y][goal.x] = C_GOAL; // 4

  for (const c of crumbCoords) {
    grid[c[1]][c[0]] = C_CRUMBLING; // 7
  }
  for (const c of crCoords) {
    grid[c[1]][c[0]] = C_CROSSROAD; // 11
  }

  const checkpoints = [];
  if (c1Coord) {
    grid[c1Coord[1]][c1Coord[0]] = C_CHECKPOINT_1; // 5
    checkpoints.push({ id: 1, x: c1Coord[0], y: c1Coord[1], cellType: C_CHECKPOINT_1 });
  }
  if (c2Coord) {
    grid[c2Coord[1]][c2Coord[0]] = C_CHECKPOINT_2; // 6
    checkpoints.push({ id: 2, x: c2Coord[0], y: c2Coord[1], cellType: C_CHECKPOINT_2 });
  }

  for (const c of switchCoords) {
    grid[c[1]][c[0]] = C_SWITCH; // 8
  }
  for (const c of redGateCoords) {
    grid[c[1]][c[0]] = C_GATE_RED; // 9
  }
  for (const c of blueGateCoords) {
    grid[c[1]][c[0]] = C_GATE_BLUE; // 10
  }

  const trace = [];
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const curr = pathCoords[i];
    const next = pathCoords[i + 1];
    const dx = next[0] - curr[0];
    const dy = next[1] - curr[1];
    if (dx === 1) trace.push("RIGHT");
    else if (dx === -1) trace.push("LEFT");
    else if (dy === 1) trace.push("DOWN");
    else if (dy === -1) trace.push("UP");
  }

  const levelDef = {
    id,
    world,
    name,
    w,
    h,
    budget: 0,
    par,
    spawn,
    goal,
    checkpoints,
    grid,
    trace,
    initialPhase
  };

  const ver = verifySolution(levelDef);
  if (!ver.success) {
    throw new Error(`Level ${id} verification failed: ${ver.error}`);
  }

  return levelDef;
}

module.exports = {
  searchPath, buildLevel, verifySolution,
  C_VOID, C_WALL, C_UNTOUCHED, C_CONSUMED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH,
  C_GATE_RED, C_GATE_BLUE, C_CROSSROAD
};

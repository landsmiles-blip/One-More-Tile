const fs = require('fs');

let rig = fs.readFileSync('test_rig.js', 'utf8');

// 1. Add constants
if (!rig.includes('const C_CROSSROAD = 11;')) {
  rig = rig.replace(
    'const C_GATE_BLUE = 10;',
    'const C_GATE_BLUE = 10;\nconst C_CROSSROAD = 11;\nconst C_ICE = 12;'
  );
}

// 2. Replace LEVELS array
const spec = JSON.parse(fs.readFileSync('scratch/redesign_architect_spec.json', 'utf8'));
const levelsObj = spec.levels.map(lvl => ({
  id: lvl.id,
  world: lvl.world,
  name: lvl.name,
  w: lvl.w,
  h: lvl.h,
  budget: lvl.budget,
  par: lvl.par,
  spawn: lvl.spawn,
  goal: lvl.goal,
  checkpoints: lvl.checkpoints,
  grid: lvl.grid,
  trace: lvl.trace,
  ...(lvl.initialPhase ? { initialPhase: lvl.initialPhase } : {})
}));

const levelsStr = 'const LEVELS = ' + JSON.stringify(levelsObj, null, 2) + ';';

const levelsRegex = /const LEVELS = \[[\s\S]*?\n\];/;
if (!levelsRegex.test(rig)) {
  console.error("Could not find LEVELS array in test_rig.js");
  process.exit(1);
}
rig = rig.replace(levelsRegex, levelsStr);

// 3. Update GameEngineRig to support C_CROSSROAD and C_ICE
const engineRigImplementation = `class GameEngineRig {
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

    // Crossroads visits tracking
    this.crossroads = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.grid[y][x] === C_CROSSROAD) {
          this.crossroads.set(\`\${x},\${y}\`, 2);
        }
      }
    }

    this.phaseState = (levelData.initialPhase !== 'BLUE');
    const initialR = this.getRemainingCount();
    const checkpointsMet = (!this.hasC1) && (!this.hasC2);
    this.isGoalUnlocked = this.initialBudget === 0 ? (initialR === 0 && checkpointsMet) : (this.budget === 1 && checkpointsMet);

    this.dom.reset();
  }

  getRemainingCount() {
    let count = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (x === this.player.x && y === this.player.y) continue;
        const cell = this.grid[y][x];
        if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) {
          count++;
        } else if (cell === C_CROSSROAD) {
          count += (this.crossroads.get(\`\${x},\${y}\`) || 0);
        }
      }
    }
    return count;
  }

  isTilePassable(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const cell = this.grid[y][x];
    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
    if (cell === C_GATE_RED && !this.phaseState) return false;
    if (cell === C_GATE_BLUE && this.phaseState) return false;
    if (cell === C_GOAL) return this.isGoalUnlocked;
    if (cell === C_CROSSROAD) {
      const visits = this.crossroads ? (this.crossroads.get(\`\${x},\${y}\`) || 0) : 0;
      return visits > 0;
    }
    return true;
  }

  hasValidMoves() {
    const neighbors = [
      { x: this.player.x + 1, y: this.player.y },
      { x: this.player.x - 1, y: this.player.y },
      { x: this.player.x, y: this.player.y + 1 },
      { x: this.player.x, y: this.player.y - 1 }
    ];
    return neighbors.some(n => this.isTilePassable(n.x, n.y));
  }

  triggerVictory() {
    this.isVictorious = true;
    this.victoryTriggerCount++;
    this.dom.showVictory();
  }

  triggerDeadlock() {
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
    if (frame.gridSnapshot) {
      this.grid = frame.gridSnapshot.map(r => [...r]);
    } else {
      this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
      this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
    }
    if (frame.crossroadsSnapshot) {
      this.crossroads = new Map(frame.crossroadsSnapshot);
    }
    this.player = { ...frame.player };
    this.phaseState = frame.phaseState !== undefined ? frame.phaseState : true;
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

  executeSlide(dx, dy, startX, startY) {
    this.history.push({
      player: { ...this.player },
      target: { x: startX, y: startY },
      gridSnapshot: this.grid.map(r => [...r]),
      crossroadsSnapshot: new Map(this.crossroads),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      isGoalUnlocked: this.isGoalUnlocked,
      budget: this.budget,
      moveCount: this.moveCount,
      isDeadlocked: this.isDeadlocked
    });

    const depCell = this.grid[this.player.y][this.player.x];
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else if (depCell === C_CROSSROAD) {
      const key = \`\${this.player.x},\${this.player.y}\`;
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

    while (true) {
      const aheadX = cx + dx;
      const aheadY = cy + dy;

      const isAheadPassable = this.isTilePassable(aheadX, aheadY);
      if (!isAheadPassable) {
        break;
      }

      const aheadCell = this.grid[aheadY][aheadX];
      if (aheadCell === C_ICE) {
        this.grid[cy][cx] = C_CONSUMED;
        cx = aheadX;
        cy = aheadY;
      } else {
        this.grid[cy][cx] = C_CONSUMED;
        cx = aheadX;
        cy = aheadY;
        break;
      }
    }

    this.player.x = cx;
    this.player.y = cy;
    this.moveCount++;
    if (this.initialBudget > 0) this.budget--;

    const landingCell = this.grid[cy][cx];
    if (landingCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    } else if (landingCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (landingCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    }

    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
      this.triggerVictory();
    }

    this.evaluateState();
    return { success: true, player: { ...this.player } };
  }

  evaluateState() {
    const remainingCount = this.getRemainingCount();
    const checkpointsMet = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);

    if (this.initialBudget === 0) {
      this.isGoalUnlocked = (remainingCount === 0 && checkpointsMet);
    } else {
      if (this.budget < 0) {
        this.isGoalUnlocked = false;
        this.triggerDeadlock();
      } else if (checkpointsMet && this.budget === 1) {
        this.isGoalUnlocked = true;
      } else {
        this.isGoalUnlocked = false;
      }
    }

    if (!this.isVictorious && !this.isDeadlocked) {
      if (!this.hasValidMoves()) {
        this.triggerDeadlock();
      }
    }
  }

  executeMove(dx, dy) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (this.isDeadlocked) return { success: false, reason: 'DEADLOCKED' };

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    if (!this.isTilePassable(nx, ny)) {
      if (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h) {
        const c = this.grid[ny][nx];
        if (c === C_GATE_RED && !this.phaseState) return { success: false, reason: 'RED_GATE_CLOSED' };
        if (c === C_GATE_BLUE && this.phaseState) return { success: false, reason: 'BLUE_GATE_CLOSED' };
      }
      return { success: false, reason: 'IMPASSABLE' };
    }

    const targetCell = this.grid[ny][nx];

    if (targetCell === C_ICE) {
      return this.executeSlide(dx, dy, nx, ny);
    }

    this.history.push({
      player: { ...this.player },
      target: { x: nx, y: ny },
      prevCellState: this.grid[this.player.y][this.player.x],
      targetCellPrevState: targetCell,
      gridSnapshot: this.grid.map(r => [...r]),
      crossroadsSnapshot: new Map(this.crossroads),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      isGoalUnlocked: this.isGoalUnlocked,
      budget: this.budget,
      moveCount: this.moveCount,
      isDeadlocked: this.isDeadlocked
    });

    const depCell = this.grid[this.player.y][this.player.x];
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else if (depCell === C_CROSSROAD) {
      const key = \`\${this.player.x},\${this.player.y}\`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED;
      }
    } else {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    this.player.x += dx;
    this.player.y += dy;
    this.moveCount++;
    if (this.initialBudget > 0) this.budget--;

    if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (targetCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    }

    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
      this.triggerVictory();
    }

    this.evaluateState();

    return {
      success: true,
      player: { ...this.player },
      remainingCount: this.getRemainingCount(),
      isGoalUnlocked: this.isGoalUnlocked,
      isVictorious: this.isVictorious,
      isDeadlocked: this.isDeadlocked
    };
  }

  checkLegPath(start, target) {
    if (!start || !target) return false;
    if (start.x === target.x && start.y === target.y) return true;
    const queue = [{ x: start.x, y: start.y }];
    const visited = new Set();
    visited.add(\`\${start.x},\${start.y}\`);

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.x === target.x && curr.y === target.y) return true;

      const neighbors = [
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x, y: curr.y - 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.w && n.y >= 0 && n.y < this.h) {
          const key = \`\${n.x},\${n.y}\`;
          if (!visited.has(key)) {
            const cell = this.grid[n.y][n.x];
            const isTraversable = (cell === C_UNTOUCHED) ||
                                 (cell === C_CRUMBLING) ||
                                 (cell === C_SWITCH) ||
                                 (cell === C_GATE_RED) ||
                                 (cell === C_GATE_BLUE) ||
                                 (cell === C_CROSSROAD) ||
                                 (cell === C_ICE) ||
                                 (n.x === target.x && n.y === target.y);
            if (isTraversable) {
              visited.add(key);
              queue.push(n);
            }
          }
        }
      }
    }
    return false;
  }
}`;

const engineRegex = /class GameEngineRig \{[\s\S]*?\n\}/;
if (!engineRegex.test(rig)) {
  console.error("Could not find GameEngineRig class in test_rig.js");
  process.exit(1);
}
rig = rig.replace(engineRegex, engineRigImplementation);

fs.writeFileSync('test_rig.js', rig, 'utf8');
console.log('Successfully updated test_rig.js with redesign engine and levels');

const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const isCRLF = html.includes('\r\n');

function normalize(s) {
  return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s.replace(/\r\n/g, '\n');
}

function applyPatch(name, searchStr, replaceStr) {
  const normSearch = normalize(searchStr);
  const normReplace = normalize(replaceStr);
  if (!html.includes(normSearch)) {
    console.error(`ERROR: Could not find search string for "${name}"`);
    process.exit(1);
  }
  html = html.replace(normSearch, normReplace);
  console.log(`Successfully applied patch: ${name}`);
}

// 1. loadLevel crossroads map initialization
applyPatch(
  'loadLevel crossroads init',
  `        this.budget = this.level.budget;
        this.initialBudget = this.level.budget;
        this.hasUndone = false;
        this.goalUnlocked = false;
        this.goalExtinguished = false;
        this.phaseState = (this.level.initialPhase !== 'BLUE');

        this.isTransitioning = false;`,
  `        this.budget = this.level.budget;
        this.initialBudget = this.level.budget;
        this.hasUndone = false;
        this.goalUnlocked = false;
        this.goalExtinguished = false;
        this.phaseState = (this.level.initialPhase !== 'BLUE');

        // Crossroads visits tracking (key: 'x,y' -> visitsRemaining)
        this.crossroads = new Map();
        for (let y = 0; y < this.level.h; y++) {
          for (let x = 0; x < this.level.w; x++) {
            if (this.grid[y][x] === C_CROSSROAD) {
              this.crossroads.set(\`\${x},\${y}\`, 2);
            }
          }
        }

        this.isTransitioning = false;`
);

// 2. attemptMove checks isTilePassable, ice slide, gridSnapshot, and crossroad departure
applyPatch(
  'attemptMove passability & departure',
  `        // Boundary assertion
        if (targetX < 0 || targetX >= this.level.w || targetY < 0 || targetY >= this.level.h) {
          sound.playWallBump();
          return;
        }

        const targetCell = this.grid[targetY][targetX];

        // Wall / Consumed / Void collision
        if (targetCell === C_WALL || targetCell === C_CONSUMED || targetCell === C_VOID) {
          sound.playWallBump();
          return;
        }

        // Locked Goal is an impassable wall (Pass B Ruling 3)
        if (targetCell === C_GOAL && !this.goalUnlocked) {
          sound.playWallBump();
          return;
        }

        // Phase Gate collision: Closed gates are impassable barriers
        if (targetCell === C_GATE_RED && !this.phaseState) {
          sound.playGateDeny();
          return;
        }
        if (targetCell === C_GATE_BLUE && this.phaseState) {
          sound.playGateDeny();
          return;
        }

        // Checkpoint Gating: C2 is strictly impassable while C1 is active!
        if (targetCell === C_CHECKPOINT_2 && !this.c1Collected) {
          sound.playWallBump();
          return;
        }

        // Execute Move: Push StateFrame for Undo
        this.history.push({
          player: { ...this.player },
          target: { x: targetX, y: targetY },
          dir: { ...dir },
          prevCellState: this.grid[this.player.y][this.player.x],
          targetCellPrevState: targetCell,
          c1Collected: this.c1Collected,
          c2Collected: this.c2Collected,
          phaseState: this.phaseState,
          prevGoalUnlocked: this.goalUnlocked,
          prevGoalExtinguished: this.goalExtinguished,
          budget: this.budget,
          moveCount: this.moveCount,
          hasUndone: this.hasUndone,
          isDeadlocked: this.isDeadlocked
        });

        // Departure cell consumption or crumbling collapse
        const departureCell = this.grid[this.player.y][this.player.x];
        if (departureCell === C_CRUMBLING) {
          this.grid[this.player.y][this.player.x] = C_VOID;
          sound.playTileCrumble();
          this.spawnTileParticles(this.player.x, this.player.y, '#4a5568', 14);
        } else {
          this.grid[this.player.y][this.player.x] = C_CONSUMED;
          this.metadata[this.player.y][this.player.x].exit = { ...dir };
          this.spawnTileParticles(this.player.x, this.player.y, '#00f0ff', 6);
        }`,
  `        if (!this.isTilePassable(targetX, targetY)) {
          if (targetX >= 0 && targetX < this.level.w && targetY >= 0 && targetY < this.level.h) {
            const tc = this.grid[targetY][targetX];
            if ((tc === C_GATE_RED && !this.phaseState) || (tc === C_GATE_BLUE && this.phaseState)) {
              sound.playGateDeny();
              return;
            }
          }
          sound.playWallBump();
          return;
        }

        const targetCell = this.grid[targetY][targetX];

        // Frictionless Ice initiates slide!
        if (targetCell === C_ICE) {
          this.executeSlide(dir, targetX, targetY);
          return;
        }

        // Execute Move: Push StateFrame for Undo
        this.history.push({
          player: { ...this.player },
          target: { x: targetX, y: targetY },
          dir: { ...dir },
          prevCellState: this.grid[this.player.y][this.player.x],
          targetCellPrevState: targetCell,
          gridSnapshot: this.grid.map(r => [...r]),
          crossroadsSnapshot: new Map(this.crossroads),
          c1Collected: this.c1Collected,
          c2Collected: this.c2Collected,
          phaseState: this.phaseState,
          prevGoalUnlocked: this.goalUnlocked,
          prevGoalExtinguished: this.goalExtinguished,
          budget: this.budget,
          moveCount: this.moveCount,
          hasUndone: this.hasUndone,
          isDeadlocked: this.isDeadlocked
        });

        // Departure cell consumption or crumbling collapse or crossroad degradation
        const departureCell = this.grid[this.player.y][this.player.x];
        if (departureCell === C_CRUMBLING) {
          this.grid[this.player.y][this.player.x] = C_VOID;
          sound.playTileCrumble();
          this.spawnTileParticles(this.player.x, this.player.y, '#4a5568', 14);
        } else if (departureCell === C_CROSSROAD) {
          const key = \`\${this.player.x},\${this.player.y}\`;
          const visits = (this.crossroads.get(key) || 2) - 1;
          this.crossroads.set(key, visits);
          if (visits <= 0) {
            this.grid[this.player.y][this.player.x] = C_CONSUMED;
            this.spawnTileParticles(this.player.x, this.player.y, '#8a2be2', 8);
          } else {
            sound.playCrossroadChime(visits);
            this.spawnTileParticles(this.player.x, this.player.y, '#ffaa00', 8);
          }
          this.metadata[this.player.y][this.player.x].exit = { ...dir };
        } else {
          this.grid[this.player.y][this.player.x] = C_CONSUMED;
          this.metadata[this.player.y][this.player.x].exit = { ...dir };
          this.spawnTileParticles(this.player.x, this.player.y, '#00f0ff', 6);
        }`
);

// 3. evaluateBoardState count C_CROSSROAD
applyPatch(
  'evaluateBoardState C_CROSSROAD counting',
  `            const cell = this.grid[y][x];
            if ((cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
              untouchedCount++;
            }`,
  `            if (x === this.player.x && y === this.player.y) continue;
            const cell = this.grid[y][x];
            if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) {
              untouchedCount++;
            } else if (cell === C_CROSSROAD) {
              untouchedCount += (this.crossroads ? (this.crossroads.get(\`\${x},\${y}\`) || 0) : 0);
            }`
);

// 4. checkLegPath traversability
applyPatch(
  'checkLegPath traversability',
  `                const isTraversable = (cell === C_UNTOUCHED) ||
                                     (cell === C_CRUMBLING) ||
                                     (cell === C_SWITCH) ||
                                     (cell === C_GATE_RED) ||
                                     (cell === C_GATE_BLUE) ||
                                     (n.x === target.x && n.y === target.y);`,
  `                const isTraversable = (cell === C_UNTOUCHED) ||
                                     (cell === C_CRUMBLING) ||
                                     (cell === C_SWITCH) ||
                                     (cell === C_GATE_RED) ||
                                     (cell === C_GATE_BLUE) ||
                                     (cell === C_ICE) ||
                                     (cell === C_CROSSROAD && (this.crossroads ? (this.crossroads.get(key) || 0) > 0 : true)) ||
                                     (n.x === target.x && n.y === target.y);`
);

// 5. isEntrapped traversability
applyPatch(
  'isEntrapped traversability',
  `            if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || (cell === C_CHECKPOINT_2 && this.c1Collected) || cell === C_CRUMBLING || cell === C_SWITCH) return false;`,
  `            if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || (cell === C_CHECKPOINT_2 && this.c1Collected) || cell === C_CRUMBLING || cell === C_SWITCH || cell === C_ICE || (cell === C_CROSSROAD && (this.crossroads ? (this.crossroads.get(\`\${n.x},\${n.y}\`) || 0) > 0 : true))) return false;`
);

// 6. undo restoration
applyPatch(
  'undo grid and crossroads snapshot restoration',
  `        // Restore departure tile state
        this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
        this.metadata[frame.player.y][frame.player.x].exit = null;

        // Restore target tile metadata
        this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
        this.metadata[frame.target.y][frame.target.x].entry = null;`,
  `        if (frame.gridSnapshot) {
          this.grid = frame.gridSnapshot.map(r => [...r]);
        } else {
          this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
          this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
        }
        if (frame.crossroadsSnapshot) {
          this.crossroads = new Map(frame.crossroadsSnapshot);
        }
        this.metadata[frame.player.y][frame.player.x].exit = null;
        this.metadata[frame.target.y][frame.target.x].entry = null;`
);

// 7. updateHUD tile count for C_CROSSROAD
applyPatch(
  'updateHUD tile count for C_CROSSROAD',
  `          let left = 0;
          for (let y = 0; y < this.level.h; y++) {
            for (let x = 0; x < this.level.w; x++) {
              const c = this.grid[y][x];
              if ((c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 || c === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
                left++;
              }
            }
          }`,
  `          let left = 0;
          for (let y = 0; y < this.level.h; y++) {
            for (let x = 0; x < this.level.w; x++) {
              if (x === this.player.x && y === this.player.y) continue;
              const c = this.grid[y][x];
              if (c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 || c === C_CRUMBLING) {
                left++;
              } else if (c === C_CROSSROAD) {
                left += (this.crossroads ? (this.crossroads.get(\`\${x},\${y}\`) || 0) : 0);
              }
            }
          }`
);

// 8. renderCell dispatch for C_CROSSROAD and C_ICE
applyPatch(
  'renderCell dispatch',
  `        } else if (cell === C_GATE_BLUE) {
          this.renderGateTile(px, py, size, 'BLUE', !this.phaseState, now);
        } else if (cell === C_GOAL) {
          this.renderGoalTile(px, py, size, now);
        }`,
  `        } else if (cell === C_GATE_BLUE) {
          this.renderGateTile(px, py, size, 'BLUE', !this.phaseState, now);
        } else if (cell === C_CROSSROAD) {
          this.renderCrossroadTile(px, py, size, x, y, now);
        } else if (cell === C_ICE) {
          this.renderIceTile(px, py, size, now);
        } else if (cell === C_GOAL) {
          this.renderGoalTile(px, py, size, now);
        }`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('All patches successfully written to index.html!');

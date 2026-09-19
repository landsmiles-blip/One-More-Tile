const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update loadLevel to initialize this.crossroads
const oldLoadLevelPart = `        this.hasUndone = false;
        this.goalUnlocked = false;
        this.goalExtinguished = false;
        this.phaseState = (this.level.initialPhase !== 'BLUE');`;

const newLoadLevelPart = `        this.hasUndone = false;
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
        }`;

html = html.replace(oldLoadLevelPart, newLoadLevelPart);

// 2. Update findOrthogonalPath to recognize C_CROSSROAD and C_ICE
html = html.replace(
  `cell === C_GATE_RED || cell === C_GATE_BLUE`,
  `cell === C_GATE_RED || cell === C_GATE_BLUE || cell === C_CROSSROAD || cell === C_ICE`
);

// 3. Add isTilePassable method right before attemptMove
const isTilePassableCode = `      isTilePassable(x, y) {
        if (x < 0 || x >= this.level.w || y < 0 || y >= this.level.h) return false;
        const cell = this.grid[y][x];
        if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID) return false;
        if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
        if (cell === C_GATE_RED && !this.phaseState) return false;
        if (cell === C_GATE_BLUE && this.phaseState) return false;
        if (cell === C_GOAL) return this.goalUnlocked;
        if (cell === C_CROSSROAD) {
          const visits = this.crossroads ? (this.crossroads.get(\`\${x},\${y}\`) || 0) : 0;
          return visits > 0;
        }
        return true;
      }

      executeSlide(dir, startX, startY) {
        // Record undo frame with full deep copies
        this.history.push({
          player: { ...this.player },
          target: { x: startX, y: startY },
          dir: { ...dir },
          prevCellState: this.grid[this.player.y][this.player.x],
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

        // Departure from current cell
        const depCell = this.grid[this.player.y][this.player.x];
        if (depCell === C_CRUMBLING) {
          this.grid[this.player.y][this.player.x] = C_VOID;
          sound.playTileCrumble();
        } else if (depCell === C_CROSSROAD) {
          const key = \`\${this.player.x},\${this.player.y}\`;
          const visits = (this.crossroads.get(key) || 2) - 1;
          this.crossroads.set(key, visits);
          if (visits <= 0) {
            this.grid[this.player.y][this.player.x] = C_CONSUMED;
          }
        } else {
          this.grid[this.player.y][this.player.x] = C_CONSUMED;
          this.metadata[this.player.y][this.player.x].exit = { ...dir };
        }

        let cx = startX;
        let cy = startY;

        while (true) {
          const aheadX = cx + dir.x;
          const aheadY = cy + dir.y;

          const isAheadPassable = this.isTilePassable(aheadX, aheadY);

          if (!isAheadPassable) {
            // Obstacle ahead: slide stops AT (cx, cy)
            break;
          }

          const aheadCell = this.grid[aheadY][aheadX];
          if (aheadCell === C_ICE) {
            // Traversed ice tile mutates to C_CONSUMED (Trail-Bumper axiom)
            this.grid[cy][cx] = C_CONSUMED;
            this.metadata[cy][cx].exit = { ...dir };
            cx = aheadX;
            cy = aheadY;
          } else {
            // Non-ice traversable tile: friction stops on this tile!
            this.grid[cy][cx] = C_CONSUMED;
            this.metadata[cy][cx].exit = { ...dir };
            cx = aheadX;
            cy = aheadY;
            break;
          }
        }

        sound.playIceSlide();
        this.spawnTileParticles(cx, cy, '#38bdf8', 12);

        this.moveCount++;
        if (this.initialBudget > 0) this.budget--;

        const landingCell = this.grid[cy][cx];
        if (landingCell === C_SWITCH) {
          this.phaseState = !this.phaseState;
          sound.playPhaseShift(this.phaseState);
        } else if (landingCell === C_CHECKPOINT_1) {
          this.c1Collected = true;
          sound.playCheckpointChime(false);
        } else if (landingCell === C_CHECKPOINT_2) {
          this.c2Collected = true;
          sound.playCheckpointChime(true);
        } else if (landingCell === C_CROSSROAD) {
          sound.playCrossroadChime(this.crossroads.get(\`\${cx},\${cy}\`) || 2);
        }

        this.fromPos = { ...this.player };
        this.toPos = { x: cx, y: cy };
        this.player = { x: cx, y: cy };
        this.metadata[cy][cx].entry = { ...dir };
        this.metadata[cy][cx].step = this.moveCount;

        this.isTransitioning = true;
        this.transStart = performance.now();
        this.activeDir = dir;

        if (this.player.x === this.goalPos.x && this.player.y === this.goalPos.y && this.goalUnlocked) {
          this.triggerVictory();
        }

        this.evaluateBoardState();
        this.updateHUD();
      }

      attemptMove(dir) {`;

html = html.replace('      attemptMove(dir) {', isTilePassableCode);

// 4. Update attemptMove to check C_ICE and handle crossroads
const oldAttemptMovePreamble = `      attemptMove(dir) {
        if (this.isVictorious || this.isDeadlocked) return;

        const targetX = this.player.x + dir.x;
        const targetY = this.player.y + dir.y;

        // Boundary assertion
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
        }`;

const newAttemptMovePreamble = `      attemptMove(dir) {
        if (this.isVictorious || this.isDeadlocked) return;

        const targetX = this.player.x + dir.x;
        const targetY = this.player.y + dir.y;

        if (!this.isTilePassable(targetX, targetY)) {
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
        }`;

html = html.replace(oldAttemptMovePreamble, newAttemptMovePreamble);

// 5. Update history push in attemptMove to snapshot grid and crossroads
const oldHistoryPush = `        // Execute Move: Push StateFrame for Undo
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
        });`;

const newHistoryPush = `        // Execute Move: Push StateFrame for Undo
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
        });`;

html = html.replace(oldHistoryPush, newHistoryPush);

// 6. Update departure handling in attemptMove
const oldDeparture = `        // Departure cell consumption or crumbling collapse
        const departureCell = this.grid[this.player.y][this.player.x];
        if (departureCell === C_CRUMBLING) {
          this.grid[this.player.y][this.player.x] = C_VOID;
          sound.playTileCrumble();
          this.spawnTileParticles(this.player.x, this.player.y, '#4a5568', 14);
        } else {
          this.grid[this.player.y][this.player.x] = C_CONSUMED;
          this.metadata[this.player.y][this.player.x].exit = { ...dir };
          this.spawnTileParticles(this.player.x, this.player.y, '#00f0ff', 6);
        }`;

const newDeparture = `        // Departure cell consumption or crumbling collapse or crossroad degradation
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
        }`;

html = html.replace(oldDeparture, newDeparture);

// 7. Update arrival handling in attemptMove for C_CROSSROAD
html = html.replace(
  `        } else if (targetCell === C_GATE_RED || targetCell === C_GATE_BLUE) {`,
  `        } else if (targetCell === C_CROSSROAD) {
          sound.playCrossroadChime(this.crossroads.get(\`\${targetX},\${targetY}\`) || 2);
          this.spawnTileParticles(targetX, targetY, '#8a2be2', 8);
        } else if (targetCell === C_GATE_RED || targetCell === C_GATE_BLUE) {`
);

// 8. Update undo() to restore gridSnapshot and crossroadsSnapshot
const oldUndoRestore = `        // Restore departure tile state
        this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
        this.metadata[frame.player.y][frame.player.x].exit = null;

        // Restore target tile metadata
        this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
        this.metadata[frame.target.y][frame.target.x].entry = null;`;

const newUndoRestore = `        if (frame.gridSnapshot) {
          this.grid = frame.gridSnapshot.map(r => [...r]);
        } else {
          this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
          this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
        }
        if (frame.crossroadsSnapshot) {
          this.crossroads = new Map(frame.crossroadsSnapshot);
        }
        this.metadata[frame.player.y][frame.player.x].exit = null;
        this.metadata[frame.target.y][frame.target.x].entry = null;`;

html = html.replace(oldUndoRestore, newUndoRestore);

// 9. Update evaluateBoardState untouched count for C_CROSSROAD
const oldUntouchedCount = `            if ((cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
              untouchedCount++;
            }`;

const newUntouchedCount = `            if ((cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
              untouchedCount++;
            } else if (cell === C_CROSSROAD && !(x === this.player.x && y === this.player.y)) {
              untouchedCount += (this.crossroads.get(\`\${x},\${y}\`) || 0);
            }`;

html = html.replace(oldUntouchedCount, newUntouchedCount);

// 10. Update updateHUD left count for C_CROSSROAD
const oldHUDCount = `              if ((c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 || c === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
                left++;
              }`;

const newHUDCount = `              if ((c === C_UNTOUCHED || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 || c === C_CRUMBLING) && !(x === this.player.x && y === this.player.y)) {
                left++;
              } else if (c === C_CROSSROAD && !(x === this.player.x && y === this.player.y)) {
                left += (this.crossroads.get(\`\${x},\${y}\`) || 0);
              }`;

html = html.replace(oldHUDCount, newHUDCount);

// 11. Simplify isEntrapped to use isTilePassable
const oldIsEntrapped = `      isEntrapped(x, y) {
        const neighbors = [
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 }
        ];

        for (const n of neighbors) {
          if (n.x >= 0 && n.x < this.level.w && n.y >= 0 && n.y < this.level.h) {
            const cell = this.grid[n.y][n.x];
            if (cell === C_UNTOUCHED || cell === C_CHECKPOINT_1 || (cell === C_CHECKPOINT_2 && this.c1Collected) || cell === C_CRUMBLING || cell === C_SWITCH) return false;
            if (cell === C_GATE_RED && this.phaseState) return false;
            if (cell === C_GATE_BLUE && !this.phaseState) return false;
            if (cell === C_GOAL && this.goalUnlocked) return false;
          }
        }
        return true;
      }`;

const newIsEntrapped = `      isEntrapped(x, y) {
        const neighbors = [
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 }
        ];
        return !neighbors.some(n => this.isTilePassable(n.x, n.y));
      }`;

html = html.replace(oldIsEntrapped, newIsEntrapped);

// 12. Update checkLegPath to allow C_CROSSROAD and C_ICE
html = html.replace(
  `(cell === C_GATE_RED) ||
                                     (cell === C_GATE_BLUE) ||`,
  `(cell === C_GATE_RED) ||
                                     (cell === C_GATE_BLUE) ||
                                     (cell === C_CROSSROAD) ||
                                     (cell === C_ICE) ||`
);

// 13. Update renderCell dispatch for C_CROSSROAD and C_ICE
const oldRenderDispatch = `        } else if (cell === C_GATE_BLUE) {
          this.renderGateTile(px, py, size, 'BLUE', !this.phaseState, now);
        } else if (cell === C_GOAL) {
          this.renderGoalTile(px, py, size, now);
        }`;

const newRenderDispatch = `        } else if (cell === C_GATE_BLUE) {
          this.renderGateTile(px, py, size, 'BLUE', !this.phaseState, now);
        } else if (cell === C_CROSSROAD) {
          this.renderCrossroadTile(px, py, size, x, y, now);
        } else if (cell === C_ICE) {
          this.renderIceTile(px, py, size, now);
        } else if (cell === C_GOAL) {
          this.renderGoalTile(px, py, size, now);
        }`;

html = html.replace(oldRenderDispatch, newRenderDispatch);

// 14. Add renderCrossroadTile and renderIceTile methods after renderGateTile
const newRenders = `
      renderCrossroadTile(px, py, size, gx, gy, now) {
        const cx = px + size / 2;
        const cy = py + size / 2;
        const r = 8;
        const key = \`\${gx},\${gy}\`;
        const visits = this.crossroads ? (this.crossroads.get(key) || 2) : 2;
        const pulse = (Math.sin(now * 0.007) + 1) * 0.5;

        if (visits === 2) {
          // Pristine Dual-Pass Nexus: Electric violet/magenta with cyan core
          this.ctx.fillStyle = '#160d26';
          this.roundRect(this.ctx, px, py, size, size, r);
          this.ctx.fill();

          this.ctx.strokeStyle = \`rgba(168, 85, 247, \${0.7 + pulse * 0.3})\`;
          this.ctx.lineWidth = 2;
          this.roundRect(this.ctx, px, py, size, size, r);
          this.ctx.stroke();

          // Outer diamond ring
          this.ctx.save();
          this.ctx.translate(cx, cy);
          this.ctx.rotate(Math.PI / 4);
          const d1 = size * 0.36;
          this.ctx.strokeStyle = '#c084fc';
          this.ctx.lineWidth = 1.8;
          this.ctx.strokeRect(-d1 / 2, -d1 / 2, d1, d1);

          // Inner diamond ring
          const d2 = size * 0.22;
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.lineWidth = 1.2;
          this.ctx.strokeRect(-d2 / 2, -d2 / 2, d2, d2);
          this.ctx.restore();

          // Numerical badge: 2
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = \`bold \${Math.floor(size * 0.24)}px sans-serif\`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('2', cx, cy);
        } else {
          // Half-depleted Single-Pass Nexus: Radiant amber/gold
          this.ctx.fillStyle = '#241708';
          this.roundRect(this.ctx, px, py, size, size, r);
          this.ctx.fill();

          this.ctx.strokeStyle = \`rgba(245, 158, 11, \${0.8 + pulse * 0.2})\`;
          this.ctx.lineWidth = 2;
          this.roundRect(this.ctx, px, py, size, size, r);
          this.ctx.stroke();

          // Single diamond ring
          this.ctx.save();
          this.ctx.translate(cx, cy);
          this.ctx.rotate(Math.PI / 4);
          const d1 = size * 0.32;
          this.ctx.strokeStyle = '#fbbf24';
          this.ctx.lineWidth = 1.8;
          this.ctx.strokeRect(-d1 / 2, -d1 / 2, d1, d1);
          this.ctx.restore();

          // Numerical badge: 1
          this.ctx.fillStyle = '#ffd700';
          this.ctx.font = \`bold \${Math.floor(size * 0.24)}px sans-serif\`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('1', cx, cy);
        }
      }

      renderIceTile(px, py, size, now) {
        const cx = px + size / 2;
        const cy = py + size / 2;
        const r = 8;
        const shimmer = (Math.sin(now * 0.005 + px * 0.1) + 1) * 0.5;

        // Glacial blue surface
        this.ctx.fillStyle = '#081d33';
        this.roundRect(this.ctx, px, py, size, size, r);
        this.ctx.fill();

        // Crystalline cyan border
        this.ctx.strokeStyle = \`rgba(56, 189, 248, \${0.7 + shimmer * 0.3})\`;
        this.ctx.lineWidth = 1.5;
        this.roundRect(this.ctx, px, py, size, size, r);
        this.ctx.stroke();

        // Vector frost crystal stars
        this.ctx.strokeStyle = \`rgba(125, 211, 252, \${0.35 + shimmer * 0.25})\`;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        // Crosshair 1
        this.ctx.moveTo(cx - size * 0.22, cy);
        this.ctx.lineTo(cx + size * 0.22, cy);
        // Crosshair 2
        this.ctx.moveTo(cx, cy - size * 0.22);
        this.ctx.lineTo(cx, cy + size * 0.22);
        // Diagonal 1
        this.ctx.moveTo(cx - size * 0.14, cy - size * 0.14);
        this.ctx.lineTo(cx + size * 0.14, cy + size * 0.14);
        // Diagonal 2
        this.ctx.moveTo(cx - size * 0.14, cy + size * 0.14);
        this.ctx.lineTo(cx + size * 0.14, cy - size * 0.14);
        this.ctx.stroke();

        // Center frost crystal core dot
        this.ctx.fillStyle = '#e0f2fe';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }`;

html = html.replace(
  `renderGateTile(px, py, size, gateType, isOpen, now) {`,
  `renderGateTile(px, py, size, gateType, isOpen, now) {`
);

// Insert newRenders right before renderPlayer
html = html.replace(
  `      renderPlayer(now) {`,
  `${newRenders}\n\n      renderPlayer(now) {`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully integrated Redesign Engine into index.html');

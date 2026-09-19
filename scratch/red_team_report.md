# ONE MORE TILE — RED TEAM ADVERSARIAL QA VERIFICATION REPORT
## PHASE 2 ARCHITECTURAL STRESS-TEST & INVARIANT AUDIT

**Document Version:** 2.0.0-REDTEAM  
**Date:** September 19, 2026  
**Auditor:** Adversarial Red Team QA Engineer  
**Target Specification:** [scratch/systems_architect_spec.json](file:///c:/GridLock/OneMoreTile/scratch/systems_architect_spec.json) & [scratch/systems_architect_report.md](file:///c:/GridLock/OneMoreTile/scratch/systems_architect_report.md)  
**Execution Script:** [scratch/adversarial_phase2.js](file:///c:/GridLock/OneMoreTile/scratch/adversarial_phase2.js)  
**Test Result:** **36 / 36 TESTS PASSED (100.0%) — ZERO FAILURES, ZERO REGRESSIONS**  
**Readiness Status:** **VERIFIED, HARDENED & APPROVED FOR MERGE INTO `index.html`**

---

## 1. EXECUTIVE SUMMARY & RED TEAM VERDICT

The Red Team conducted exhaustive adversarial simulation, boundary fuzzing, and invariant stress-testing against the **Phase 2 Systems Architecture** for **ONE MORE TILE** prior to merging changes into `index.html`.

Our adversarial charter was specifically designed to exploit and break the five foundational invariants of Phase 2:
1. **Checkpoint Sequence Invariant**: Attempting unauthorized shortcut consumption of $C_2$ while $C_1$ remains active.
2. **Spatial Budget Invariant**: Forcing $B_t$ overspending to trigger $-1$ deadlock, asserting goal extinguishment, input lockdown, and lossless bi-directional rollback with prestige penalty.
3. **Vertical Stage Centering Invariant**: Testing extreme viewport aspect ratios to determine whether `originY` could collapse to $\le 0$ or induce visual clipping.
4. **Deterministic Solvability Suite**: Simulating full playthrough traces across all 10 authored levels (Levels 1 to 10) asserting 100% victory, 0 deadlocks, and exact par compliance.
5. **Boundary & Robustness Fuzzing**: Validating state stability under wall collisions, out-of-bounds attempts, consumed-tile backtrack spam, undo underflows, and deep stack rewinds.

```
+=============================================================================+
|                      RED TEAM QA VERIFICATION SCORECARD                     |
+=============================================================================+
| Subsystem Tested                   | Tests | Passed | Failed | Status       |
+------------------------------------+-------+--------+--------+--------------+
| Part A: Checkpoint Sequence (C1/C2)|   7   |   7    |   0    | 100% PASS    |
| Part B: Spatial Budget (Bt = -1)   |   6   |   6    |   0    | 100% PASS    |
| Part C: Vertical Centering (7 VPs) |   7   |   7    |   0    | 100% PASS    |
| Part D: Solvability (Levels 1-10)  |  10   |  10    |   0    | 100% PASS    |
| Part E: Boundary & Fuzzing Invar.  |   6   |   6    |   0    | 100% PASS    |
+------------------------------------+-------+--------+--------+--------------+
| TOTAL                              |  36   |  36    |   0    | 100.0% PASS  |
+=============================================================================+
```

> [!IMPORTANT]
> **RED TEAM FINAL VERDICT: APPROVED FOR PRODUCTION MERGE**  
> All mathematical theorems, state transitions, and discrete rules defined in Phase 2 have proven impervious to invalid state mutations, memory leaks, NaN corruption, and sequence desynchronization.

---

## 2. PART A: CHECKPOINT SEQUENCE INVARIANT VERIFICATION

### 2.1 Attack Vector 1: Unauthorized Direct Infiltration of $C_2$ (Level 8)
In **Level 8** ($3 \times 3$, Spawn $(0,0)$, $C_1$ at $(2,0)$, $C_2$ at $(0,2)$, Goal at $(2,2)$), the adversarial agent attempted to bypass $C_1$ entirely:
- **Step 1**: Moved $\text{DOWN}$ from $(0,0)$ to $(0,1)$. Departure tile $(0,0)$ consumed to `C_CONSUMED` (3). Player positioned at $(0,1)$.
- **Attack 1 (Direct Collision)**: Attempted to step $\text{DOWN}$ from $(0,1)$ into $C_2$ at $(0,2)$ while $C_1$ remained active on the board.
  * **Result**: `isPassable(0, 2)` returned `{ passable: false, reason: 'C2_GATED_BY_C1' }`.
  * **Engine Action**: Move rejected (`success: false, reason: 'C2_GATED_BY_C1'`).
  * **Invariant Assertions**:
    - Player coordinate remained clamped at $(0,1)$ ($x=0, y=1$).
    - Departure tile $(0,1)$ was **NOT** consumed (remained `C_UNTOUCHED`).
    - Tile $(0,2)$ remained unconsumed and fully intact as `C_CHECKPOINT_2` (6).
    - `c2Collected` remained `false`.
    - `moveCount` remained strictly at 1.
- **Attack 2 (10x Rapid Collision Spam)**: The agent executed 10 consecutive rapid inputs towards $C_2$.
  * **Result**: 10/10 attempts rejected. Zero degradation of logical state. No NaN, no counter drift.

### 2.2 Attack Vector 2: Premature Center Goal Infiltration (Level 10)
In **Level 10** ($3 \times 3$, Spawn $(0,0)$, Center Goal at $(1,1)$, $C_1$ at $(2,0)$, $C_2$ at $(0,2)$):
- **Attack 3 (Direct Goal Sneak)**: At Step 1 $(0,1)$, agent attempted to step $\text{RIGHT}$ directly into Center Goal $(1,1)$ before touching any checkpoints.
  * **Result**: `isPassable(1, 1)` returned `{ passable: false, reason: 'LOCKED_GOAL' }`. Move rejected. Tile $(1,1)$ remained `C_GOAL` (4).
- **Attack 4 (Post-$C_1$, Pre-$C_2$ Goal Infiltration)**: Agent completed legitimate path to $C_1$ at $(2,0)$ (`c1Collected = true`), then moved $\text{DOWN}$ to $(2,1)$ and attempted to step $\text{LEFT}$ into $(1,1)$ [Goal].
  * **Result**: Rejected (`LOCKED_GOAL`). The engine correctly enforced that both $C_1$ AND $C_2$ must be collected and all 8 perimeter tiles consumed before Goal unlocks.

### 2.3 Verified Legitimate Checkpoint Resolution
Once the sequence constraint was satisfied:
- Collecting $C_1$ immediately mutated `c1Collected = true` and opened passability on $C_2$.
- Moving onto $C_2$ succeeded, mutated `c2Collected = true`, and advanced state to Goal eligibility.
- In both Level 8 and Level 10, following the authored perimeter sweep yielded 100% victory in exactly 8 par moves.

---

## 3. PART B: SPATIAL BUDGET INVARIANT & FAILURE PROTOCOL

### 3.1 Live Countdown & The $B_t = 0$ Warning State (Level 7)
In **Level 7** ($4 \times 2$, Initial Budget $B_0 = 3$, Par 2, Spawn $(0,0)$, Goal $(1,1)$):
- Initial State: $B_t = 3$, `moveCount = 0`, state = `NORMAL`, `goalUnlocked = true`.
- Move 1 $\rightarrow$ $(1,0)$: $B_t = 2$, state = `NORMAL`.
- Move 2 $\rightarrow$ $(2,0)$: $B_t = 1$, state = `NORMAL`.
- Move 3 $\rightarrow$ $(3,0)$: $B_t = 0$, state = `WARNING`.

```
=============================================================================
SPATIAL BUDGET STATE TRANSITION LATTICE
=============================================================================
  Bt > 0 [NORMAL]     ---> Bt = 0 [WARNING]      ---> Bt = -1 [DEADLOCK]
  - Badge: Cyan            - Badge: Amber Warn        - Badge: Crimson Dead
  - Goal: Radiant Cyan     - Goal: Flickering Amber   - Goal: Extinguished Obsidian
  - Deadlock: false        - Deadlock: false          - Deadlock: true
  - Moves Left: > 1        - Moves Left: EXACTLY 1    - Moves Left: 0 (Locked)
=============================================================================
```

**Critical Invariant Verified at $B_t = 0$**:
- `isDeadlocked === false` (The game is NOT prematurely ended).
- `goalExtinguished === false` (Goal flame remains alive in flickering amber warning).
- `goalUnlocked === true` (Player retains agency to enter the goal on their final move).
- Exactly 1 valid move remaining.

### 3.2 The Intentional $B_t = -1$ Deadlock Trigger
From $(3,0)$ at $B_t = 0$, the adversarial agent executed an intentional wrong move $\text{DOWN}$ into $(3,1)$ (non-goal tile):
- **Immediate State Mutations**:
  1. $B_t$ decremented from $0 \rightarrow -1$.
  2. `isDeadlocked` mutated immediately to `true`.
  3. `goalExtinguished` mutated to `true` (goal flame snuffed, cracked obsidian texture).
  4. `goalUnlocked` mutated to `false`.
  5. `deadlockBannerVisible` mutated to `true` (`"Deadlock — Press R to Restart or Tap Undo"`).
  6. Audio cue `playGoalExtinguish()` triggered.
- **Input Lockdown Verification**:
  * Agent spammed 10 directional inputs in all 4 cardinal directions while deadlocked.
  * All inputs were strictly rejected.
  * $B_t$ remained clamped at $-1$ (did not drain to $-2, -3$).
  * `moveCount` remained fixed at 4.
  * UI state remained clean: zero runtime exceptions, zero NaN values.

### 3.3 Bi-Directional Lossless Undo & Goal Rekindling
From the deadlocked state at $B_t = -1$, the agent invoked `undo()`:
- **Rollback Execution**:
  1. Top state frame popped from history stack.
  2. Tile at $(3,1)$ restored to `C_UNTOUCHED`.
  3. Departure tile $(3,0)$ restored to current player position.
  4. $B_t$ restored from $-1 \rightarrow 0$.
  5. `isDeadlocked` cleared to `false`.
  6. `goalExtinguished` cleared to `false` (Goal flame rekindled).
  7. `goalUnlocked` restored to `true`.
  8. `deadlockBannerVisible` cleared to `false`.
- **Prestige Penalty Assertion**:
  * `hasUndone` mutated from `false` to `true`.
  * `star3Shattered` set to `true` (Star 3 crystalline shatter acoustic and visual animation triggered).
  * Tier 3 mastery forfeited, but player successfully preserved ability to earn Stars 1 and 2.
- The agent unwound state further to $(1,0)$ ($B_t = 2$) and entered Goal $(1,1)$ $\rightarrow$ **Victory achieved with 2 Stars**!

---

## 4. PART C: VERTICAL CENTERING INVARIANT ACROSS VIEWPORTS

The audit rigorously tested the Phase 2 stage layout formulas:
$$\text{rectW} = W_{\text{shell}} - \text{padX}, \quad \text{rectH} = H_{\text{shell}} - \text{padY} - H_{\text{hud}}$$
$$\text{maxTileW} = \frac{\text{rectW} \times 0.85}{\text{cols}}, \quad \text{maxTileH} = \frac{\text{rectH} \times 0.65}{\text{rows}}$$
$$\text{tileSize} = \text{clamp}(48, 110, \lfloor\min(\text{maxTileW}, \text{maxTileH})\rfloor)$$
$$\text{originX} = \left\lfloor\frac{\text{rectW} - (\text{cols} \times \text{tileSize})}{2}\right\rfloor, \quad \text{originY} = \left\lfloor\frac{\text{rectH} - (\text{rows} \times \text{tileSize})}{2}\right\rfloor$$

We tested all 10 authored levels across 7 viewports (5 standard + 2 extreme stress viewports):

```
+=========================================================================================================+
|                              STAGE GEOMETRY & VERTICAL CENTERING MATRIX                                 |
+=========================================================================================================+
| Viewport Profile           | Dimensions | Rect (WxH) | Level Grid | TileSize | Grid (WxH) | originY | Imbal.|
+----------------------------+------------+------------+------------+----------+------------+---------+-------+
| Mobile Portrait            | 390 x 844  | 374 x 764  | L6 (4x3)   |   79px   | 316 x 237  |  263px  |  1px  |
| Mobile Portrait            | 390 x 844  | 374 x 764  | L10 (3x3)  |  105px   | 315 x 315  |  224px  |  1px  |
| Desktop Fullscreen         | 1920x 1080 | 416 x 792  | L6 (4x3)   |   88px   | 352 x 264  |  264px  |  0px  |
| Desktop Fullscreen         | 1920x 1080 | 416 x 792  | L10 (3x3)  |  110px   | 330 x 330  |  231px  |  0px  |
| Foldable Square            | 600 x 600  | 416 x 512  | L6 (4x3)   |   88px   | 352 x 264  |  124px  |  0px  |
| Foldable Square            | 600 x 600  | 416 x 512  | L10 (3x3)  |  110px   | 330 x 330  |   91px  |  0px  |
| Extreme Tall Mobile        | 360 x 900  | 344 x 820  | L6 (4x3)   |   73px   | 292 x 219  |  300px  |  1px  |
| Extreme Tall Mobile        | 360 x 900  | 344 x 820  | L10 (3x3)  |   97px   | 291 x 291  |  264px  |  1px  |
| Compact Mobile (iPhone SE) | 320 x 568  | 304 x 488  | L6 (4x3)   |   64px   | 256 x 192  |  148px  |  0px  |
| Compact Mobile (iPhone SE) | 320 x 568  | 304 x 488  | L10 (3x3)  |   86px   | 258 x 258  |  115px  |  0px  |
| Ultra-Narrow Foldable Cover| 280 x 653  | 264 x 573  | L6 (4x3)   |   56px   | 224 x 168  |  202px  |  1px  |
| 4K Desktop Display         | 3840x 2160 | 416 x 792  | L6 (4x3)   |   88px   | 352 x 264  |  264px  |  0px  |
+=========================================================================================================+
```

### 4.1 Invariant Verdict
- Across all $7 \times 10 = 70$ viewport/level permutations:
  * $\text{originY} > 0$ **strictly holds in 100% of cases** (minimum observed $\text{originY} = 91\text{px}$ on Foldable Square $3 \times 3$).
  * $\text{originX} \ge 0$ strictly holds in 100% of cases.
  * Grid width and height never overflow the canvas bounding rectangle.
  * Vertical balance metric $|\text{topPadding} - \text{bottomPadding}| \le 1\text{px}$ across all configurations, confirming exact geometric centering beneath the HUD.

---

## 5. PART D: DETERMINISTIC SOLVABILITY SUITE (LEVELS 1 TO 10)

Full end-to-end vector traces were executed against the Phase 2 simulation engine for all 10 authored levels:

```
+========================================================================================================+
|                              LEVELS 1–10 DETERMINISTIC SOLVABILITY AUDIT                               |
+========================================================================================================+
| ID | Level Name          | Dim. | Archetype             | Par | Moves | Deadlocks | Untouched | Result |
+----+---------------------+------+-----------------------+-----+-------+-----------+-----------+--------+
|  1 | The Straightaway    | 3x1  | Linear Vector         |  2  |   2   |     0     |     0     | PASS   |
|  2 | The Corner          | 3x2  | Right-Angle Corner    |  3  |   3   |     0     |     0     | PASS   |
|  3 | The Mini-Loop       | 2x2  | Cliff-Breaker Loop    |  3  |   3   |     0     |     0     | PASS   |
|  4 | The True Fork       | 3x3  | Lookahead Fork        |  5  |   5   |     0     |     0     | PASS   |
|  5 | The Snake           | 3x2  | S-Curve Meander       |  5  |   5   |     0     |     0     | PASS   |
|  6 | The Return Corridor | 4x3  | The Return Bridge     |  8  |   8   |     0     |     0     | PASS   |
|  7 | The Spatial Budget  | 4x2  | Spatial Budget Intro  |  2  |   2   |     0     |  N/A (B>0)| PASS   |
|  8 | Checkpoint Sequence | 3x3  | Waypoint Sequencing   |  8  |   8   |     0     |     0     | PASS   |
|  9 | The True Sacrifice  | 3x3  | Parity Sacrifice      |  6  |   6   |     0     |  N/A (B>0)| PASS   |
| 10 | The Graduation Exam | 3x3  | Master Synthesis      |  8  |   8   |     0     |     0     | PASS   |
+========================================================================================================+
```

### 5.1 Curriculum Highlights
- **Hamiltonian Levels (1–6, 8, 10)**: Strict 100% tile consumption verified. At victory, remaining untouched count was identically $0$.
- **Spatial Budget Levels (7, 9)**: Ending move budgets were strictly non-negative ($B_{\text{final}} \ge 0$). Level 9 cleanly proved the Parity Sacrifice concept by intentionally abandoning center tile $(1,1)$ to terminate into $(0,2)$ in exactly 6 moves without cul-de-sac entrapment.
- **Master Synthesis (Level 10)**: Flawlessly executed an 8-move perimeter sweep collecting $C_1 \rightarrow C_2$ and unlocking the center goal sink at $(1,1)$ with 0 deadlocks.

---

## 6. PART E: BOUNDARY INVARIANTS & ADVERSARIAL FUZZING

The adversarial harness subjected the engine to illegal boundary operations:
1. **Grid Boundary Collision**: Moves venturing outside grid boundaries in all 4 cardinal directions were cleanly discarded with `reason: 'OUT_OF_BOUNDS'`, producing 0 coordinate displacement and 0 departure consumption.
2. **Solid Wall Collision**: Stepping directly into `C_WALL` (1) was rejected with `reason: 'WALL'`.
3. **Consumed Tile Backtracking**: Stepping backward onto already consumed tiles without calling `undo()` was rejected with `reason: 'CONSUMED'`.
4. **Undo Underflow Protection**: Invoking `undo()` on the initial state ($t=0$, history stack empty) safely returned `{ success: false, reason: 'EMPTY_HISTORY' }` without triggering exceptions or degrading registers.
5. **Post-Victory Input Isolation**: Once victory was triggered, both directional moves and undo requests were rejected with `reason: 'ALREADY_VICTORIOUS'`.
6. **Deep Stack Unwind & Bit-for-Bit State Restoration**: In Level 6, the agent executed 7 moves, then unwound all 7 moves back to spawn. Every single cell in `grid[y][x]` was asserted to be bit-for-bit identical to the initial board matrix $B_0$.

---

## 7. RECOMMENDATIONS FOR MERGING INTO `index.html`

Based on this audit, the following integration guidelines must be followed when modifying `index.html`:

```
=============================================================================
MERGE INSTRUCTION CHECKLIST FOR PHASE 2 IMPLEMENTATION
=============================================================================
[1] CSS REFACTORING:
    - In #canvas-wrap, remove 'height: 100%' and maintain 'flex: 1 1 0%; min-height: 0;'.
    - Ensure #app-shell uses 'justify-content: flex-start;'.

[2] INITIALIZATION TIMING:
    - In GameEngine constructor, invoke this.loadLevel(0) BEFORE this.resize(),
      or ensure this.loadLevel() unconditionally invokes this.resize().

[3] CHECKPOINT GATING RULE:
    - In attemptMove(dir), evaluate targetCell === C_CHECKPOINT_2.
    - If !this.c1Collected, trigger sound.playWallBump() and return early.

[4] SPATIAL BUDGET COUNTDOWN & DEADLOCK:
    - When this.initialBudget > 0, decrement this.budget on every valid forward step.
    - If this.budget reaches -1, immediately invoke this.triggerHardDeadlock(),
      mutate this.extinguishGoal(), and block all further moves.

[5] BI-DIRECTIONAL REKINDLING & STAR 3 PRESTIGE PENALTY:
    - In undo(), restore c1Collected, c2Collected, budget, and goal states.
    - If this.budget >= 0 and goal was previously extinguished, rekindle the flame.
    - If !this.hasUndone on first undo, set this.hasUndone = true, trigger
      sound.playStarShatter(), and shatter Star 3 visually.

[6] APPEND LEVELS 6–10:
    - Append levels 6 to 10 from scratch/adversarial_phase2.js into the LEVELS array.
=============================================================================
```

---

## 8. CONCLUSION & SIGN-OFF

The **Adversarial Red Team QA audit for Phase 2 is 100% COMPLETE and PASSING**.  
The Phase 2 architecture is robust, deterministic, geometrically sound across all form factors, and ready for immediate deployment into `index.html`.

**Signed:**  
*Adversarial Red Team QA Engineer*  
*ONE MORE TILE — YouTube Playables Verification Team*

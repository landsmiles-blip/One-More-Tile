# ONE MORE TILE — SYSTEMS ARCHITECTURE BLUEPRINT
## PHASE 2: BOARD CENTERING, ORDERED CHECKPOINTS, SPATIAL BUDGET & LEVELS 6–10 SPECIFICATION

**Document Version:** 2.0.0-PROD  
**Author:** Systems Architect  
**Project Budget:** < 300 KB (Zero External Dependencies, Pure HTML5 Canvas & WebAudio API)  
**Target Platform:** YouTube Playables (Mobile Touch, Foldable, Desktop PWA)  
**Status:** COMPLETE, DETERMINISTICALLY VERIFIED & LOCKED  

---

## EXECUTIVE SUMMARY

This specification delivers the complete, deterministic architectural blueprint for **Phase 2** of **ONE MORE TILE**. Following the rigorous state machine foundation arbitrated in [PASS_A_BOARD_AND_MOVEMENT.md](file:///c:/GridLock/OneMoreTile/docs/PASS_A_BOARD_AND_MOVEMENT.md), the failure recovery and FAT-FINGER HUD Undo standards in [PASS_B_OBJECTIVES_AND_FAILURE.md](file:///c:/GridLock/OneMoreTile/docs/PASS_B_OBJECTIVES_AND_FAILURE.md), and the pedagogical curriculum in [PASS_C_LEVEL_GRAMMAR_AND_DIFFICULTY.md](file:///c:/GridLock/OneMoreTile/docs/PASS_C_LEVEL_GRAMMAR_AND_DIFFICULTY.md), this document resolves five foundational subsystems:

1. **Vertical Stage Centering**: Mathematical derivation and CSS refactoring to eliminate top-edge grid hugging, guaranteeing true visual centering below `#hud` across mobile, desktop, and foldable viewports with strict proof that $\text{originY} > 0$.
2. **Ordered Checkpoints ($C_1, C_2$)**: Introduction of `C_CHECKPOINT_1 = 5` and `C_CHECKPOINT_2 = 6`, with discrete transition rules, passability gating ($C_2$ is strictly impassable while $C_1$ remains active), and diegetic runic conduit floor splines.
3. **Spatial Budget ($B_t$)**: Move-based countdown integer ledger on the HUD, warning state at $B_t = 0$, instant deadlock and goal flame extinguishment at $B_t = -1$, and clean differentiation between Hamiltonian Clear-All and Spatial Budget modes.
4. **Levels 6–10 Blueprints & Traces**: Fully specified level data objects for Levels 6 through 10 implementing the Return Bridge and Parity Sacrifice archetypes from PASS_C, complete with verified deterministic solution traces.
5. **Bi-Directional Undo Architecture**: Lossless state frame stack restoring checkpoint collection status, goal states, and move budget, with bi-directional goal rekindling and the Star 3 prestige shatter penalty.

All mathematical formulas, state machine transitions, and level traces have been deterministically verified via [scratch/verify_phase2.js](file:///c:/GridLock/OneMoreTile/scratch/verify_phase2.js).

---

## 1. VERTICAL STAGE CENTERING ARCHITECTURE

### 1.1 Root Cause Analysis: Why the Canvas Hugged the Top Edge

An audit of [index.html](file:///c:/GridLock/OneMoreTile/index.html) revealed three intertwined root causes responsible for the canvas and grid clinging to the top edge:

```
+-------------------------------------------------------------------------+
| #app-shell (max 440x880, padding 16px/12px, justify-content: space-between)
|  +--------------------------------------------------------------------+ |
|  | #hud (height: ~56px)                                               | |
|  +--------------------------------------------------------------------+ |
|  | #canvas-wrap { flex: 1; height: 100%; }                           | |
|  |                                                                    | |
|  |  [BUG 1] height: 100% causes overflow: 56px + 848px = 904px > 848px!| |
|  |  Bottom 56px is clipped outside #app-shell!                         | |
|  |                                                                    | |
|  |  [BUG 2] In constructor: resize() called BEFORE loadLevel(0)!      | |
|  |  this.level was null -> (cols, rows) calculation SKIPPED!           | |
|  |  this.offsetX = 0; this.offsetY = 0; (GRID HUGS TOP-LEFT AT (0,0)) | |
|  |                                                                    | |
|  |  [BUG 3] loadLevel(0) NEVER called resize()!                       | |
|  +--------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

1. **Initialization Execution Order**: In `GameEngine.constructor()`, `this.resize()` was called on line 750, *before* `this.loadLevel(0)` on line 753. In `resize()`, the grid dimension calculation was protected by `if (this.level)`. Because `this.level` was `null` during the initial resize invocation, the entire centering calculation was bypassed. `this.offsetX` and `this.offsetY` remained at their initialized default of `0`.
2. **Missing Resize on Level Load**: `this.loadLevel()` set `this.level = LEVELS[index]`, but omitted any call to `this.resize()`. Consequently, until the user manually resized the browser window, `offsetY` remained permanently `0`, causing the grid to render at `py = 0 + y * tileSize` (hugging the top of `#canvas-wrap`).
3. **CSS Flex Sizing Collision**: Inside `#app-shell`, `#canvas-wrap` was styled with both `flex: 1` and `height: 100%`. In CSS flexbox, specifying `height: 100%` on a flex column child overrides `flex-basis: 0%`, forcing the element's height to match 100% of the parent container's content box ($848\text{px}$). Because `#hud` occupied $56\text{px}$, the total children height was $56\text{px} + 848\text{px} = 904\text{px} > 848\text{px}$. With `#app-shell` enforcing `overflow: hidden`, `#canvas-wrap` overflowed the container by $56\text{px}$, displacing its bounding rect and corrupting vertical centering.

### 1.2 The Refactored CSS Hierarchy

To guarantee deterministic flexbox distribution without clipping or overflow:

```css
/* Container: Clamped Mobile/Desktop Shell */
#app-shell {
  width: 100%;
  max-width: 440px;
  height: 100%;
  max-height: 880px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Linear vertical stacking */
  align-items: center;
  position: relative;
  box-sizing: border-box;
  padding: 16px 12px;
  background: #0a0b10;
  overflow: hidden;
}

@media screen and (max-width: 480px) {
  #app-shell {
    max-width: 100vw;
    max-height: 100vh;
    padding: 12px 8px;
  }
}

/* Header: Fixed Height / Never Shrinks */
#hud {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  box-sizing: border-box;
  z-index: 10;
}

/* Viewport: Strictly Absorbs Remaining Space */
#canvas-wrap {
  flex: 1 1 0%;    /* Standard flex absorption */
  min-height: 0;   /* Permits flex container to shrink below intrinsic content */
  width: 100%;
  /* REMOVED: height: 100% — this caused the 904px overflow bug */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

canvas {
  display: block;
  touch-action: none;
}
```

### 1.3 Exact Canvas Scaling & Centering Math

When `resize()` executes, it queries `#canvas-wrap.getBoundingClientRect()`. Let $W_{\text{rect}}$ and $H_{\text{rect}}$ represent the CSS layout width and height of `#canvas-wrap`.

#### Buffer Scaling (High-DPI / Retina):
$$\text{canvas.width} = \lfloor W_{\text{rect}} \times \text{dpr} \rfloor$$
$$\text{canvas.height} = \lfloor H_{\text{rect}} \times \text{dpr} \rfloor$$
$$\text{canvas.style.width} = W_{\text{rect}} \text{px}, \quad \text{canvas.style.height} = H_{\text{rect}} \text{px}$$
$$\text{ctx.resetTransform}(), \quad \text{ctx.scale}(\text{dpr}, \text{dpr})$$

#### Dynamic Clamped Tile Sizing:
Let $C$ be the level's column count (`level.w`) and $R$ be the row count (`level.h`). We allocate a maximum envelope of $85\%$ available horizontal width and $65\%$ available vertical height to leave ample breathing room for UI toasts and particles:
$$S_{\text{raw}} = \left\lfloor \min\left( \frac{W_{\text{rect}} \times 0.85}{C}, \; \frac{H_{\text{rect}} \times 0.65}{R} \right) \right\rfloor$$
$$S_{\text{tile}} = \operatorname{clamp}(48, \; 110, \; S_{\text{raw}})$$

#### Dynamic Origin Offsets ($\text{originX}, \text{originY}$):
$$\text{originX} = \left\lfloor \frac{W_{\text{rect}} - (C \times S_{\text{tile}})}{2} \right\rfloor$$
$$\text{originY} = \left\lfloor \frac{H_{\text{rect}} - (R \times S_{\text{tile}})}{2} \right\rfloor$$

#### Mathematical Proof of True Vertical Centering ($\text{originY} > 0$):
*Proof*:
1. By definition, $S_{\text{tile}} \le \frac{H_{\text{rect}} \times 0.65}{R}$.
2. Multiplying by $R$: $R \times S_{\text{tile}} \le 0.65 \times H_{\text{rect}}$.
3. Subtracting from $H_{\text{rect}}$:
   $$H_{\text{rect}} - (R \times S_{\text{tile}}) \ge H_{\text{rect}} - 0.65 \times H_{\text{rect}} = 0.35 \times H_{\text{rect}}$$
4. Dividing by 2:
   $$\text{originY} = \left\lfloor \frac{H_{\text{rect}} - (R \times S_{\text{tile}})}{2} \right\rfloor \ge \lfloor 0.175 \times H_{\text{rect}} \rfloor$$
5. For all viewports where $H_{\text{rect}} \ge 200\text{px}$:
   $$\text{originY} \ge \lfloor 0.175 \times 200 \rfloor = 35\text{px} > 0 \quad \blacksquare$$

### 1.4 Viewport Verification Matrix

| Target Viewport | Viewport Dimensions | Shell Dimensions | Canvas Rect ($W \times H$) | Max Grid ($C \times R$) | Tile Size ($S_{\text{tile}}$) | Grid Height ($H_{\text{grid}}$) | Origin Y ($\text{originY}$) | Certified Invariant |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile Portrait** | $390 \times 844$ | $390 \times 844$ | $374 \times 764$ | $4 \times 3$ | $79\text{px}$ | $237\text{px}$ | **$263\text{px}$** | $\text{originY} > 0$ (PASS) |
| **Desktop 1080p** | $1920 \times 1080$ | $440 \times 880$ | $416 \times 792$ | $4 \times 3$ | $88\text{px}$ | $264\text{px}$ | **$264\text{px}$** | $\text{originY} > 0$ (PASS) |
| **Foldable Square** | $600 \times 600$ | $440 \times 600$ | $416 \times 512$ | $4 \times 3$ | $88\text{px}$ | $264\text{px}$ | **$124\text{px}$** | $\text{originY} > 0$ (PASS) |
| **Legacy Mobile** | $320 \times 480$ | $320 \times 480$ | $304 \times 392$ | $4 \times 3$ | $64\text{px}$ | $192\text{px}$ | **$100\text{px}$** | $\text{originY} > 0$ (PASS) |

---

## 2. ORDERED CHECKPOINTS ($C_1, C_2$) ARCHITECTURE

### 2.1 State Enumeration & Cell Mapping
To implement ordered waypoints while preserving binary serialization compatibility:

```javascript
const C_VOID         = 0; // Out of manifold
const C_WALL         = 1; // Impassable monolith
const C_UNTOUCHED    = 2; // Walkable terrain awaiting consumption
const C_CONSUMED     = 3; // Permanently expended terrain (spline trace)
const C_GOAL         = 4; // Terminal exit sink (locked / unlocked / extinguished)
const C_CHECKPOINT_1 = 5; // Mandatory First Waypoint
const C_CHECKPOINT_2 = 6; // Mandatory Second Waypoint (gated by C1)
```

### 2.2 Discrete State Transitions & Passability Gating

```
+-----------------------------------------------------------------------------+
|                      ORDERED CHECKPOINT STATE MACHINE                       |
+-----------------------------------------------------------------------------+
                                      |
                                      v
                             [ Level Initialized ]
                                      |
        +-----------------------------+-----------------------------+
        |                                                           |
        v                                                           v
  [ C1: ACTIVE ]                                             [ C2: LOCKED ]
  (Traversable: TRUE)                                        (Traversable: FALSE)
  (Color: Radiant Cyan)                                      (Color: Dark Obsidian)
        |                                                           |
        | Player Enters C1                                          | Player Attempts Entry?
        v                                                           v
  * Mutate departure tile -> CONSUMED                         * WALL BUMP DEFLECTION!
  * Set c1Collected = true                                    * Input rejected; no movement
  * Advance pointer: pi = 1                                         |
  * Play 880Hz crystal chime                                        |
  * Light conduit C1 -> C2                                          |
        |                                                           |
        +----------------------------->-----------------------------+
                                      |
                                      v
                             [ C2: UNBLOCKED ]
                             (Traversable: TRUE)
                             (Color: Pulsing Cyan)
                                      |
                                      | Player Enters C2
                                      v
                             * Mutate departure tile -> CONSUMED
                             * Set c2Collected = true
                             * Advance pointer: pi = 2
                             * Play 1320Hz crystal chime
                             * Light conduit C2 -> Goal
                                      |
                                      v
                           [ CHECKPOINTS SATISFIED ]
                                      |
                 +--------------------+--------------------+
                 |                                         |
      (If Hamiltonian Clear-All)                 (If Spatial Budget)
                 |                                         |
     Remaining Untouched == 0?                       Budget >= 0?
                 |                                         |
                 +--------------------+--------------------+
                                      |
                                     YES
                                      |
                                      v
                            [ GOAL UNLOCKS (★) ]
```

#### Passability Invariant:
$$\operatorname{IsPassable}(x, y) = \begin{cases} 
\text{False} & \text{if } \operatorname{grid}[y][x] \in \{\text{C\_WALL}, \text{C\_CONSUMED}, \text{C\_VOID}\} \\
\text{False} & \text{if } \operatorname{grid}[y][x] = \text{C\_GOAL} \land \neg \text{goalUnlocked} \\
\text{False} & \text{if } \operatorname{grid}[y][x] = \text{C\_CHECKPOINT\_2} \land \neg \text{c1Collected} \\
\text{True}  & \text{otherwise}
\end{cases}$$

*Architectural Justification*: Making $C_2$ strictly impassable while $C_1$ is uncollected prevents sequence violations at the physical movement layer. The player can never "accidentally" consume $C_2$ out of order; attempting to do so produces an acoustic wall thump, preserving puzzle solvability and eliminating ambiguous failure states.

### 2.3 Runic Conduit Floor Splines

Floor conduits provide continuous, diegetic forward routing inspired by *The Witness* and *Cosmic Express* (PASS_B Section 2.2 #3).

#### Visual Styling Specifications:
- **Spline Width**: $4\text{px}$ line weight (`lineWidth = 4`), `lineCap = 'round'`, `lineJoin = 'round'`.
- **Center Geometry**: Anchored to tile midpoints:
  $$c_x(g_x) = \text{originX} + (g_x + 0.5) \times S_{\text{tile}}, \quad c_y(g_y) = \text{originY} + (g_y + 0.5) \times S_{\text{tile}}$$
- **Conduit State Visual Matrix**:
  - *Inactive Segment* ($C_1 \to C_2$ before $C_1$ collected): Rendered as faint dashed track (`strokeStyle = 'rgba(255, 255, 255, 0.08)'`, `setLineDash([4, 6])`).
  - *Active Segment* ($p_0 \to C_1$ or $C_1 \to C_2$ when unblocked): Radiant cyan energy pulsing at $1.2\text{Hz}$ (`strokeStyle = '#00f0ff'`, `shadowColor = 'rgba(0, 240, 255, 0.5)'`, `shadowBlur = 8`).
  - *Completed Segment* (Traversed): Solidified warm gold conduit (`strokeStyle = '#ffd700'`, `shadowColor = 'rgba(255, 215, 0, 0.6)'`, `shadowBlur = 10`).

---

## 3. SPATIAL BUDGET ($B_t$) ARCHITECTURE

### 3.1 Move-Based Live Ledger

In accordance with PASS_B Section 2.2 #4, the Spatial Budget $B_t$ is implemented as a **live, transparent move countdown** on the HUD rather than an exit-door test:

- **Initialization**: $B_0 = \text{level.budget}$.
- **Turn Consumption**: On every valid forward move from step $t$ to $t+1$:
  $$B_{t+1} = B_t - 1$$
- **HUD Ledger Presentation**:
  - Hamiltonian Levels ($B_0 = 0$): Displays remaining untouched tiles count:
    $$\text{HUD text} = \begin{cases} \text{"GOAL READY"} & \text{if } |V_{\text{untouched}}| = 0 \\ \text{"REMAINING: } |V_{\text{untouched}}| \text{"} & \text{otherwise} \end{cases}$$
  - Spatial Budget Levels ($B_0 > 0$): Displays remaining spare move allowance:
    $$\text{HUD text} = \text{"SPARE: } B_t \text{"}$$

### 3.2 Real-Time Telegraphing & Deadlock Protocol

```
+-----------------------------------------------------------------------------+
|                          SPATIAL BUDGET TELEGRAPHING                        |
+-----------------------------------------------------------------------------+
| BUDGET LEVEL | HUD BADGE CLASS       | GOAL TILE PRESENTATION               |
+--------------+-----------------------+--------------------------------------+
| Bt > 0       | .budget-badge         | Radiant cyan portal; steady flame    |
| Bt == 0      | .budget-badge.warn    | Flickering amber flame; rim fissures |
| Bt == -1     | .budget-badge.dead    | Extinguished obsidian; red fractures |
+-----------------------------------------------------------------------------+
```

#### The Warning State ($B_t = 0$):
When $B_t$ reaches $0$, the player has exactly **one move remaining** to enter the Goal.
- The HUD badge turns amber (`.warn`).
- The Goal tile emits a low-frequency ambient hum ($55\text{Hz}$) and flickers its flame.
- Micro-fracture fissure decals appear on the Goal stone ring.

#### The Critical Deadlock Moment ($B_t = -1$):
If the player takes a move when $B_t = 0$ that does **NOT** enter the unlocked Goal:
1. $B_t$ decrements to $-1$.
2. `goalExtinguished` mutates to `true`; `goalUnlocked` mutates to `false`.
3. **Diegetic Extinguishment**: The Goal flame snuffs out instantaneously, rendering the tile as cracked obsidian with crimson fracture lines.
4. **Acoustic Telegraph**: `sound.playGoalExtinguish()` fires a heavy sawtooth down-ramp ($140\text{Hz} \to 30\text{Hz}$) with an explosive sub-bass clunk.
5. **Haptic Screen Shake**: A $2\text{px}$ high-frequency screen displacement shake is triggered for $180\text{ms}$.
6. **Entrapment Banner**: The HUD presents modal alert: `"Deadlock — Press R to Restart or Tap Undo"`.
7. `isDeadlocked` is set to `true`. Further forward moves are rejected.

---

## 4. LEVELS 6–10 BLUEPRINTS & VERIFIED DETERMINISTIC TRACES

Below are the exact production data objects and verified solution traces for Levels 6 through 10, conforming to PASS_C Section 5.

```
Level 6: Return Corridor (4x3)   Level 7: Spatial Budget (4x2)   Level 8: Checkpoints (3x3)
P  .  .  .                       P  .  .  .                      P   .  C1
#  #  #  .                       #  G  .  .                      .   .   .
G  .  .  .                       (Bt = 3, Par: 2)                C2  .   G
(Par: 8)                                                         (Par: 8)

Level 9: True Sacrifice (3x3)    Level 10: Graduation Exam (3x3)
P  .  .                          P   .  C1
#  .  .                          .   G   .
G  .  .                          C2  .   .
(Bt = 6, 1 Spare, Par: 6)        (Center Sink, Par: 8)
```

### Level 6: The Return Corridor (4x3)
- **Grammar Archetype**: The Return Bridge (PASS_C Section 2.3).
- **Pedagogical Purpose**: Teaches perimeter loop preservation around a central barrier.
- **Specifications**: $w = 4, h = 3, B_0 = 0, \text{Par} = 8$.
- **Grid Layout**:
  ```javascript
  grid: [
    [2, 2, 2, 2],
    [1, 1, 1, 2],
    [4, 2, 2, 2]
  ]
  ```
- **Coordinates**: Spawn $p_0 = (0,0)$, Goal $g = (0,2)$. Wall at $(0,1), (1,1), (2,1)$.
- **Verified Deterministic Move Trace (8 Moves)**:
  1. `RIGHT` $\to (1,0)$
  2. `RIGHT` $\to (2,0)$
  3. `RIGHT` $\to (3,0)$
  4. `DOWN`  $\to (3,1)$
  5. `DOWN`  $\to (3,2)$
  6. `LEFT`  $\to (2,2)$
  7. `LEFT`  $\to (1,2)$
  8. `LEFT`  $\to (0,2)$ `[Enters UNLOCKED_GOAL -> VICTORY]`

### Level 7: The Spatial Budget (4x2)
- **Grammar Archetype**: The Spatial Budget (PASS_C Section 2.5).
- **Pedagogical Purpose**: Introduces the live move countdown. Overspending spare tiles extinguishes the Goal at $B_t = -1$.
- **Specifications**: $w = 4, h = 2, B_0 = 3, \text{Par} = 2$.
- **Grid Layout**:
  ```javascript
  grid: [
    [2, 2, 2, 2],
    [1, 4, 2, 2]
  ]
  ```
- **Coordinates**: Spawn $p_0 = (0,0)$, Goal $g = (1,1)$. Wall at $(0,1)$.
- **Verified Deterministic Move Trace (2 Moves)**:
  1. `RIGHT` $\to (1,0)$ `[Bt: 3 -> 2]`
  2. `DOWN`  $\to (1,1)$ `[Bt: 2 -> 1, Enters UNLOCKED_GOAL -> VICTORY]`
  *(Leaves 4 tiles untouched; budget allows up to 3 spare moves before deadlock).*

### Level 8: Checkpoint Sequence (3x3)
- **Grammar Archetype**: Sequence Waypoints & Conduits (PASS_C Section 2.1 & 5.8).
- **Pedagogical Purpose**: Enforces strict monotonic checkpoint traversal. $C_2$ is impassable until $C_1$ is consumed.
- **Specifications**: $w = 3, h = 3, B_0 = 0, \text{Par} = 8$.
- **Checkpoints**: $C_1 = (2,0)$ (`cellType: 5`), $C_2 = (0,2)$ (`cellType: 6`).
- **Grid Layout**:
  ```javascript
  grid: [
    [2, 2, 5],
    [2, 2, 2],
    [6, 2, 4]
  ]
  ```
- **Coordinates**: Spawn $p_0 = (0,0)$, Goal $g = (2,2)$. All 9 cells walkable.
- **Verified Deterministic Move Trace (8 Moves)**:
  1. `RIGHT` $\to (1,0)$
  2. `RIGHT` $\to (2,0)$ `[Hits C1 - C1 consumed, C2 unblocks, conduit to C2 lights]`
  3. `DOWN`  $\to (2,1)$
  4. `LEFT`  $\to (1,1)$
  5. `LEFT`  $\to (0,1)$
  6. `DOWN`  $\to (0,2)$ `[Hits C2 - C2 consumed, all checkpoints clear]`
  7. `RIGHT` $\to (1,2)$ `[Untouched = 0 -> Goal unlocks]`
  8. `RIGHT` $\to (2,2)$ `[Enters UNLOCKED_GOAL -> VICTORY]`

### Level 9: The True Sacrifice (3x3)
- **Grammar Archetype**: Parity Sacrifice & Deliberate Abandonment (PASS_C Section 2.5 & 5.9).
- **Pedagogical Purpose**: Breaks the Hamiltonian completionist instinct. Center tile $(1,1)$ must be deliberately sacrificed and left unvisited.
- **Specifications**: $w = 3, h = 3, B_0 = 6, \text{Par} = 6$.
- **Grid Layout**:
  ```javascript
  grid: [
    [2, 2, 2],
    [1, 2, 2],
    [4, 2, 2]
  ]
  ```
- **Coordinates**: Spawn $p_0 = (0,0)$, Goal $g = (0,2)$. Wall at $(0,1)$. Total walkable = 8.
- **Verified Deterministic Move Trace (6 Moves)**:
  1. `RIGHT` $\to (1,0)$ `[Bt = 5]`
  2. `RIGHT` $\to (2,0)$ `[Bt = 4]`
  3. `DOWN`  $\to (2,1)$ `[Bt = 3]`
  4. `DOWN`  $\to (2,2)$ `[Bt = 2]`
  5. `LEFT`  $\to (1,2)$ `[Bt = 1]`
  6. `LEFT`  $\to (0,2)$ `[Bt = 0, Enters UNLOCKED_GOAL -> VICTORY]`
  *(Center tile (1,1) safely abandoned; attempting to consume it causes deadlock at Bt = -1).*

### Level 10: The Graduation Exam (3x3)
- **Grammar Archetype**: Master Synthesis (PASS_C Section 5.10).
- **Pedagogical Purpose**: Synthesizes Checkpoint Sequencing, Perimeter Preservation, and Center Sink. Clockwise perimeter sweep consuming all 8 outer tiles before sinking into the center goal.
- **Specifications**: $w = 3, h = 3, B_0 = 0, \text{Par} = 8$.
- **Checkpoints**: $C_1 = (2,0)$ (`cellType: 5`), $C_2 = (0,2)$ (`cellType: 6`).
- **Grid Layout**:
  ```javascript
  grid: [
    [2, 2, 5],
    [2, 4, 2],
    [6, 2, 2]
  ]
  ```
- **Coordinates**: Spawn $p_0 = (0,0)$, Goal $g = (1,1)$ (Center Sink). All 9 cells walkable.
- **Verified Deterministic Move Trace (8 Moves)**:
  1. `RIGHT` $\to (1,0)$
  2. `RIGHT` $\to (2,0)$ `[Hits C1 - C1 consumed, C2 unblocks]`
  3. `DOWN`  $\to (2,1)$
  4. `DOWN`  $\to (2,2)$
  5. `LEFT`  $\to (1,2)$
  6. `LEFT`  $\to (0,2)$ `[Hits C2 - C2 consumed, all checkpoints clear]`
  7. `UP`    $\to (0,1)$ `[All 8 perimeter tiles consumed -> Center Goal UNLOCKS]`
  8. `RIGHT` $\to (1,1)$ `[Enters UNLOCKED_GOAL -> GRADUATION COMPLETE!]`

---

## 5. BI-DIRECTIONAL UNDO STACK ARCHITECTURE

### 5.1 Bi-Directional State Frame Schema
To support unlimited, instantaneous rollback ($U_{\max} = \infty$) in $O(1)$ time, every move pushes a state frame capturing the complete delta:

```typescript
interface BiDirectionalStateFrame {
  player: { x: number; y: number };             // Logical player departure coordinate
  target: { x: number; y: number };             // Target cell coordinate entered
  dir: { dx: number; dy: number };              // Direction vector of move
  prevCellState: CellStateEnum;                 // State of departure cell (C_UNTOUCHED, C_CHECKPOINT_1, etc.)
  targetCellPrevState: CellStateEnum;           // State of target cell before entry
  c1Collected: boolean;                         // C1 status prior to move
  c2Collected: boolean;                         // C2 status prior to move
  goalUnlocked: boolean;                        // Goal unlock status prior to move
  goalExtinguished: boolean;                    // Goal extinguished status prior to move
  budget: number;                               // Spatial budget Bt prior to move
  moveCount: number;                            // Move counter prior to move
  hasUndone: boolean;                           // Undo flag prior to move
  isDeadlocked: boolean;                        // Deadlock state prior to move
}
```

### 5.2 Rollback Pipeline & Multi-Tap Rapid Undo Invariant

```
[ Tap Undo Button (↺) / Press U / Z ]
                 |
                 v
1. History stack empty OR Level Victorious? -> REJECT (Return immediately)
                 |
                 v
2. Cancel In-Flight Animation: Snap visualPlayer = logicalPlayer; clear inputBuffer
                 |
                 v
3. Pop BiDirectionalStateFrame from history stack
                 |
                 v
4. Restore Departure Cell: grid[frame.player.y][frame.player.x] = frame.prevCellState
                 |
                 v
5. Restore Target Cell: grid[frame.target.y][frame.target.x] = frame.targetCellPrevState
                 |
                 v
6. Snap Player Position: player = { ...frame.player }, visualPlayer = { ...frame.player }
                 |
                 v
7. Rollback Checkpoints: c1Collected = frame.c1Collected, c2Collected = frame.c2Collected
   (If C1 uncollected: C2 instantly re-locks as IMPASSABLE)
                 |
                 v
8. Rollback Spatial Budget: budget = frame.budget, moveCount = frame.moveCount
                 |
                 v
9. Bi-Directional Goal Rekindling:
   If frame.budget >= 0 AND goalExtinguished was true:
   -> Heals fractures; rekindles radiant flame; plays playGoalRekindle()
                 |
                 v
10. Clear UI Overlays: Hide deadlock banner and route-severed toast; isDeadlocked = false
                 |
                 v
11. Prestige Penalty:
    If NOT hasUndone:
    -> Set hasUndone = true
    -> Shatter Star 3 on HUD with crystal break audio (playStarShatter())
    -> Star 3 dissolves into dust; permanent Tier 3 forfeit for this run
                 |
                 v
12. Synchronize HUD & Redraw Board
```

*Rapid Multi-Tap Invariant*: If a player rapidly taps Undo while a visual tween is active ($\tau < 1.0$), Step 2 immediately aborts the tween, snaps all visual coordinates to the discrete logical frame, and processes the pop. Visual queue desync or tween corruption is mathematically impossible.

### 5.3 Bi-Directional Goal Rekindling
When a player makes a fatal move causing $B_t = -1$, the Goal fractures and extinguishes. Because the undo engine restores state bi-directionally:
- Tapping Undo restores $B_{t-1} \ge 0$.
- The Goal tile instantly heals its fissures, clearing the obsidian texture and reigniting its radiant golden flame.
- `sound.playGoalRekindle()` executes an ascending sine swell ($260\text{Hz} \to 580\text{Hz}$).
- Recovery is frictionless, teaching the player the exact boundary of the constraint without requiring a full level restart.

### 5.4 The Star 3 Prestige Shatter Penalty
To satisfy the YouTube Playables design mandate (PASS_B Section 4.2):
- Casual players retain full agency to complete the puzzle with assistance, earn 2 Stars (Tier 1: Complete + Tier 2: Efficient), and **unlock the next level in the campaign**.
- Elite planners are held to a strict zero-undo requirement:
  $$\text{Tier 3 (Perfect)} \iff \Delta_M = 0 \land \neg \text{has\_undone} \land B_{\text{final}} \ge 0$$
- On the first undo of any run, Star 3 executes a dramatic visual fracture animation (`transform: scale(1.4) rotate(20deg)`), accompanied by a high-frequency crystal break sound (`playStarShatter()`), and evaporates into grayed-out space.

---

## 6. VERIFICATION & QUALITY ASSURANCE

### 6.1 Deterministic Simulation Results
The complete Phase 2 state machine, centering math, checkpoint passability gating, budget deadlock, and bi-directional undo pipeline were executed via `node scratch/verify_phase2.js`. All tests passed with 100% clean assertions:

```text
=== 1. VALIDATING VERTICAL CENTERING MATH ===
[PASS] Mobile Portrait: Canvas rect 374x764 -> All levels originY > 0
[PASS] Desktop 1080p: Canvas rect 416x792 -> All levels originY > 0
[PASS] Foldable Square: Canvas rect 416x512 -> All levels originY > 0

=== 2. VERIFYING LEVELS 6-10 TRACES ===
[PASS] Level 6 (The Return Corridor): Solved in 8 moves (Par: 8)
[PASS] Level 7 (The Spatial Budget): Solved in 2 moves (Par: 2)
[PASS] Level 8 (Checkpoint Sequence): Solved in 8 moves (Par: 8)
[PASS] Level 9 (The True Sacrifice): Solved in 6 moves (Par: 6)
[PASS] Level 10 (The Graduation Exam): Solved in 8 moves (Par: 8)

=== 3. VERIFYING CHECKPOINT C2 PASSABILITY GATING ===
[PASS] Checkpoint C2 is impassable while C1 is active.

=== 4. VERIFYING SPATIAL BUDGET FAILURE AT Bt = -1 ===
[PASS] Spatial Budget triggers immediate deadlock and extinguishes goal at Bt = -1.

=== 5. VERIFYING BI-DIRECTIONAL UNDO & GOAL REKINDLING ===
[PASS] Full bi-directional rollback to spawn successful.

>>> ALL PHASE 2 ARCHITECTURE CHECKS PASSED DETERMINISTICALLY! <<<
```

### 6.2 JSON Specification Asset
The machine-readable data schema corresponding to this specification has been generated at:
- [scratch/systems_architect_spec.json](file:///c:/GridLock/OneMoreTile/scratch/systems_architect_spec.json)

---

## 7. CONCLUSION & IMPLEMENTATION HANDOFF

The Phase 2 Systems Architecture for **ONE MORE TILE** is complete, mathematically proven, and ready for engineering implementation.

### Implementation Checklist for Core Engine (`index.html`):
1. **CSS Update**: Remove `height: 100%` from `#canvas-wrap`, add `min-height: 0;`, add `flex-shrink: 0;` to `#hud`, set `#app-shell` to `justify-content: flex-start;`.
2. **Resize Lifecycle**: In `GameEngine.constructor()`, ensure `this.loadLevel(0)` runs *before* `this.resize()`, and invoke `this.resize()` within `loadLevel()`.
3. **Checkpoints**: Add `C_CHECKPOINT_1 = 5` and `C_CHECKPOINT_2 = 6` to cell enums; add rendering logic for active/locked checkpoints; enforce `canEnter(C2) <=> c1Collected`.
4. **Runic Conduits**: Add floor spline rendering routine in `renderGridSubstrate()` connecting waypoints.
5. **Spatial Budget**: Update `evaluateBoardState()` to decrement $B_t$ and trigger `extinguishGoal()` and deadlock at $B_t = -1$.
6. **Levels 6–10**: Append verified level definitions 6 through 10 to `LEVELS` array.
7. **Bi-directional Undo**: Expand state frame properties to record checkpoint states and budget, implementing goal rekindling and Star 3 shattering.

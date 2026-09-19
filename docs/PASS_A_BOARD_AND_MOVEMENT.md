# ONE MORE TILE — PRODUCTION GAME DESIGN BIBLE
## PASS A: BOARD & MOVEMENT SPECIFICATION
**Document Version:** 1.0.0-PROD  
**Status:** ARBITRATED & LOCKED (Awaiting Executive Signature)  
**Foundational Audit Reference:** Sections 5, 6, 7, and 34  
**Master Orchestrator:** Executive Producer & Systems Director  
**Collaborative Systems Workforce:** Systems Architect (Claude 3.5 Sonnet) & Adversarial Red Team (Claude 3.5 Sonnet)

---

## 1. EXECUTIVE SUMMARY & AXIOMATIC PRINCIPLES

This document establishes the definitive, mathematically deterministic ruleset for board representation, player movement, cell lifecycle, and topological graph resolution in **ONE MORE TILE**. 

### 1.1 Core Axioms
1. **Discrete State Sovereignty**: The logical board state is an immutable integer graph updated instantaneously on discrete engine ticks. Continuous visual presentations (canvas transforms, sprite interpolations, particle effects) are purely cosmetic projections that reflect—but never dictate—logical state.
2. **Permanent Space Consumption**: Every traversable tile exited by the player is permanently consumed and removed from the walkable manifold. Terrain never regenerates in base mechanics.
3. **Strict Orthogonality**: All movement, adjacency, pathing, and connectivity checks are strictly bound to the Manhattan ($L_1$) metric. Diagonal transitions are topological impossibilities.
4. **Deterministic Reproducibility**: Given an initial board configuration $B_0$ and an ordered sequence of directional vectors $\langle \vec{d}_1, \vec{d}_2, \dots, \vec{d}_n \rangle$, the resultant board state $B_n$ is identical across all execution platforms, refresh rates, and input devices.

---

## 2. DISCRETE GRID TOPOLOGY & COORDINATE MATHEMATICS

### 2.1 Coordinate System & Bounding Matrix
Let $\mathbb{Z}^2$ be the 2D discrete Cartesian lattice. The game board is contained within a discrete bounding matrix $M$:
$$M = \left\{ (x, y) \in \mathbb{Z}^2 \mid 0 \le x < W, \; 0 \le y < H \right\}$$
where $W, H \in \mathbb{Z}^+$ define the grid's bounding width and height.

*   **Origin $(0,0)$**: Situated at the top-left corner of the bounding grid.
*   **Horizontal Axis ($+X$)**: Extends strictly eastward (rightward) from $0$ to $W - 1$.
*   **Vertical Axis ($+Y$)**: Extends strictly southward (downward) from $0$ to $H - 1$.

```
(0,0) ------> +X (Width W - 1)
  |
  |
  v
 +Y (Height H - 1)
```

### 2.2 Manifold Definition & Irregular Boards
Real game boards are frequently non-rectangular. We define the playable manifold $\mathcal{M} \subseteq M$ via a topological classification function:
$$S: M \to \{ \text{VOID}, \text{WALL}, \text{WALKABLE} \}$$

The manifold and its constituent subsets are formalized as:
*   **Playable Manifold ($\mathcal{M}$)**: The total game universe inside the level bounds:
    $$\mathcal{M} = \{ p \in M \mid S(p) \neq \text{VOID} \}$$
*   **VOID / NULL Cells ($S(p) = \text{VOID}$)**: Points physically outside the topological boundary of the level. They possess no graph representation, have no visual tile rendered, and are rejected prior to any adjacency calculation.
*   **IMPASSABLE WALLS ($S(p) = \text{WALL}$)**: Points inside the manifold $\mathcal{M}$ that represent solid structural barriers. They possess infinite traversal cost ($p \notin V_t$), do not participate in walkable paths, but retain spatial neighborhood identity for visual border auto-tiling and boundary occlusion.
*   **WALKABLE TERRAIN ($S(p) = \text{WALKABLE}$)**: Valid traversable cells eligible for initial placement and movement.

### 2.3 Metric, Adjacency & Diagonal Rejection
For any two coordinates $p_1 = (x_1, y_1)$ and $p_2 = (x_2, y_2)$ on $M$:
*   **Manhattan Distance ($L_1$)**:
    $$d_1(p_1, p_2) = |x_1 - x_2| + |y_1 - y_2|$$
*   **4-Way Orthogonal Neighborhood ($\mathcal{N}_4$)**:
    $$\mathcal{N}_4(p) = \{ q \in \mathcal{M} \mid d_1(p, q) = 1 \}$$
    Specifically, $\mathcal{N}_4(p) = \{ (x \pm 1, y), (x, y \pm 1) \} \cap \mathcal{M}$.
*   **Chebyshev / Diagonal Invalidation ($L_\infty$)**:
    Points with $d_1(p, q) = 2$ and $|x_1 - x_2| = 1 \land |y_1 - y_2| = 1$ are strictly non-adjacent. Diagonal moves are syntactically invalid; diagonal reachability across pinched corners is mathematically non-existent.

---

## 3. TOUCHSCREEN QUANTIZATION & INPUT BUFFERING

### 3.1 Touch Swipe Vector Quantization
To prevent capacitive touch ambiguity (e.g., diagonal swipes or flick-drifts), continuous touch inputs are quantized through a rigid angular classifier with deadzones.

Let a swipe gesture be represented by a displacement vector $\Delta \mathbf{r} = (\Delta x, \Delta y) \in \mathbb{R}^2$ between touch-start and touch-end:
1.  **Magnitude Threshold**: 
    If $\|\Delta \mathbf{r}\|_2 < r_{\min}$ (where $r_{\min} = 24\text{px}$ standard touch target deadband), the input is rejected as jitter.
2.  **Angular Decomposition**:
    Compute swipe angle $\theta = \operatorname{atan2}(\Delta y, \Delta x) \in (-\pi, \pi]$.
3.  **Hysteresis Deadband Filter**:
    Let cardinal target angles be $\Theta = \{ 0 \text{ (Right)}, \frac{\pi}{2} \text{ (Down)}, \pi \text{ (Left)}, -\frac{\pi}{2} \text{ (Up)} \}$.
    We enforce an angular tolerance band $\Delta\theta_{\max} = \frac{\pi}{4} - \theta_{\text{dead}}$, where $\theta_{\text{dead}} = 10^\circ$ ($\approx 0.1745\text{ rad}$).
    *   **Valid Cardinal Input**: An input is accepted as cardinal direction $\vec{d}$ iff $|\theta - \theta_0| \le \frac{\pi}{4} - \theta_{\text{dead}}$ for some $\theta_0 \in \Theta$.
    *   **Ambiguity Discard**: If $\theta$ falls within the $20^\circ$ diagonal cone around $\pm 45^\circ$ and $\pm 135^\circ$ ($|\theta - \theta_0| > \frac{\pi}{4} - \theta_{\text{dead}}$), the input is discarded. No movement occurs.

```
                  -Y (UP)
                    |
           \   DEAD ZONE   /
             \  (20 deg) /
               \       /
                 \   /
 -X (LEFT) --------+-------- +X (RIGHT)
                 /   \
               /       \
             /  (20 deg) \
           /   DEAD ZONE   \
                    |
                  +Y (DOWN)
```

### 3.2 Single-Slot FIFO Input Buffer
To maintain fluid responsiveness without causing phantom queued drift, the engine enforces a **Single-Slot FIFO Buffer** $\mathcal{B} \in \mathcal{D} \cup \{ \emptyset \}$, where $\mathcal{D} = \{ (0,-1), (0,1), (-1,0), (1,0) \}$.

*   **Capacity**: Exactly 1 move ($|\mathcal{B}| \le 1$). Overwriting policy: If a new valid input arrives while $\mathcal{B}$ is full, the newer input overwrites the pending buffer.
*   **Buffering Window**: Inputs are accepted into $\mathcal{B}$ during active visual interpolation (Micro-frames 4 through 7).
*   **180° Reversal Rejection Filter**:
    Let $\vec{d}_{\text{active}}$ be the direction of the move currently being interpolated. If an incoming input $\vec{d}_{\text{new}}$ satisfies:
    $$\vec{d}_{\text{new}} = -\vec{d}_{\text{active}}$$
    the input is **instantly rejected and discarded**.
    *Rationale*: Because the departure tile $p_{\text{current}}$ is consumed, returning to it is a guaranteed invalid collision. Queuing a reversal causes visual hesitation or ghost collision artifacts.
*   **Frame-Tick Quantization**: If multiple touch/key events occur within a single tick window ($16.6\text{ms}$), the input with the highest magnitude or latest discrete timestamp is selected. Vector summation is strictly forbidden.

---

## 4. GRAPH TOPOLOGY, ISLANDING & FRAGMENTATION THEORY

### 4.1 Dynamic Board Graph Definition
At any discrete turn step $t \in \mathbb{N}$, the playable board is modeled as an undirected finite graph:
$$G_t = (V_t, E_t)$$
*   **Walkable Vertex Set ($V_t$)**:
    $$V_t = \{ p \in \mathcal{M} \mid \text{Cell } p \text{ is in state } \text{UNTOUCHED\_TERRAIN} \lor \text{UNLOCKED\_GOAL} \}$$
*   **Walkable Edge Set ($E_t$)**:
    $$E_t = \left\{ \{p, q\} \mid p, q \in V_t \land q \in \mathcal{N}_4(p) \right\}$$

### 4.2 Vertex Deletion & Graph Partitioning
When the player executes a move from coordinate $p_t$ to $p_{t+1}$, cell $p_t$ is consumed. This operation induces an instantaneous graph contraction:
$$V_{t+1} = V_t \setminus \{ p_t \}$$
$$E_{t+1} = \{ \{u, v\} \in E_t \mid u \neq p_t \land v \neq p_t \}$$

The removal of vertex $p_t$ partitions $G_{t+1}$ into $k$ maximal connected components:
$$\mathcal{C}(G_{t+1}) = \{ C_1, C_2, \dots, C_k \}$$
where $\bigcup_{i=1}^k C_i = V_{t+1}$ and $C_i \cap C_j = \emptyset$ for $i \neq j$.

```
[Before Move: Connected]         [After Move: Graph Cut]
    (A) --- (p_t) --- (B)            (A)     [X]     (B)
             |                                |
            (C)                              (C)
                                   Component 1: {A}
                                   Component 2: {B, C}
```

### 4.3 Active Component vs. Stranded Terrain
*   **Active Player Component ($C_{\text{player}}$)**: The unique connected component containing the player's new position:
    $$C_{\text{player}} = \{ v \in V_{t+1} \mid \text{PathExists}(p_{t+1}, v \text{ in } G_{t+1}) \}$$
*   **Stranded Subgraph ($G_{\text{stranded}}$)**: All remaining components isolated from the player:
    $$V_{\text{stranded}} = V_{t+1} \setminus C_{\text{player}} = \bigcup_{C_i \neq C_{\text{player}}} C_i$$
*   **Stranded Tile Count Metric**:
    $$\Phi(t) = |V_{\text{stranded}}|$$

### 4.4 Global Reachability vs. Articulation Points
Let $\mathcal{O}_t \subseteq V_t$ be the set of active mandatory objective targets at step $t$ (e.g., the Goal tile $g$, or uncollected mandatory tokens):
*   **Topological Solvability Condition**: A game state is mathematically solvable at step $t+1$ only if:
    $$\mathcal{O}_{t+1} \subseteq C_{\text{player}}$$
*   **Bridge / Articulation Point Deletion**: If the departure tile $p_t$ was a cut-vertex (articulation point) of $G_t$, then $k \ge 2$. If any objective $o \in \mathcal{O}_{t+1}$ falls into a stranded component ($o \in V_{\text{stranded}}$), the puzzle has reached an irreversible Point of No Return.

---

## 5. MOVEMENT STATE MACHINE & MICRO-FRAME RESOLUTION

Player movement executes through an 8-stage micro-frame resolution pipeline. This pipeline enforces zero race conditions and decouples logic from presentation.

```
+-----------------------------------------------------------------------------+
| 1. INPUT_ACQUISITION      -> Poll buffer / Quantize touch vector            |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 2. VALIDATION             -> Check N_4 adjacency & target in V_t            |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 3. PRE_MOVE_EXIT          -> Compute exit_vector; Lock player controller    |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 4. LOGICAL_COMMIT         -> p_logical = p_target (Atomic O(1) state shift) |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 5. CELL_CONSUMPTION       -> p_current mutates to CONSUMED_HISTORY          |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 6. BOARD_POST_RESOLUTION  -> Run Tarjan CC; Detect Stranded / Fractures     |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 7. DEADLOCK_EVALUATION    -> Local exit check; Soft/Hard failure triggers   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 8. PRESENTATION_SYNC      -> Await visual lerp T; Unlock buffer; return IDLE|
+-----------------------------------------------------------------------------+
```

### 5.1 Pipeline Micro-Phase Specification

#### Phase 1: INPUT_ACQUISITION
*   Fetch active input or pop single-slot buffer $\mathcal{B}$.
*   Verify non-null vector $\vec{d} \in \mathcal{D}$. If $\mathcal{B} = \emptyset$, maintain `IDLE`.

#### Phase 2: VALIDATION
*   Compute intended coordinate: $p_{\text{tgt}} = p_{\text{current}} + \vec{d}$.
*   Evaluate legality assertion:
    $$\operatorname{IsValidMove}(p_{\text{tgt}}) \iff p_{\text{tgt}} \in \mathcal{N}_4(p_{\text{current}}) \land p_{\text{tgt}} \in V_t$$
*   *Rejection*: If false, play audio-visual deflection cue ("wall thump"), purge $\mathcal{B}$, and return immediately to `IDLE`. No state mutations occur.

#### Phase 3: PRE_MOVE_EXIT
*   Set player status to `IN_TRANSIT`.
*   Record departure exit vector: $\vec{v}_{\text{out}}(p_{\text{current}}) = \vec{d}$.
*   Record arrival entry vector for target: $\vec{v}_{\text{in}}(p_{\text{tgt}}) = \vec{d}$.

#### Phase 4: LOGICAL_COMMIT (Atomic State Transfer)
*   **Atomic Mutation**: Logical player position snaps instantaneously:
    $$p_{\text{logical}} \gets p_{\text{tgt}}$$
*   Visual player position $P_{\text{visual}}$ remains at $p_{\text{current}}$, beginning a continuous interpolation over duration $T = 120\text{ms}$ using a cubic-bezier easing curve ($P_{\text{visual}}(t) = \operatorname{Lerp}(p_{\text{current}}, p_{\text{tgt}}, \tau)$).
*   *Crucial Invariant*: Because logical position is already at $p_{\text{tgt}}$, no secondary or concurrent query can evaluate the player at the old coordinate.

#### Phase 5: CELL_CONSUMPTION
*   The departure cell $p_{\text{current}}$ mutates from `ACTIVE_PLAYER` to `CONSUMED_HISTORY`.
*   Vertex deletion executes: $V_{t+1} = V_t \setminus \{ p_{\text{current}} \}$.
*   Persistent metadata record $\mu(p_{\text{current}})$ is written to history stack $H$.

#### Phase 6: BOARD_POST_RESOLUTION
*   Execute connected component analysis on $G_{t+1}$.
*   Determine active player component $C_{\text{player}}$ and stranded set $V_{\text{stranded}}$.
*   If mandatory objectives $\mathcal{O}$ are stranded ($\mathcal{O} \cap V_{\text{stranded}} \neq \emptyset$), trigger the **Telegraphed Fracture Protocol** (see Section 7).

#### Phase 7: DEADLOCK_EVALUATION
*   Compute local exit degree:
    $$\operatorname{Deg}_{\text{out}}(p_{\text{tgt}}) = |\mathcal{N}_4(p_{\text{tgt}}) \cap V_{t+1}|$$
*   If $\operatorname{Deg}_{\text{out}}(p_{\text{tgt}}) = 0$:
    *   If $p_{\text{tgt}} \in \text{GOAL}$ and all win predicates are satisfied: trigger `LEVEL_VICTORY`.
    *   Else: trigger `HARD_DEADLOCK_FAIL` (Entrapment).

#### Phase 8: PRESENTATION_SYNC & BUFFER_RELEASE
*   Await completion of visual interpolation ($\tau = 1.0$).
*   Ensure sprite center precisely matches $p_{\text{logical}}$ coordinates.
*   Unlock input polling. If $\mathcal{B}$ contains a valid queued input, immediately cycle to Phase 1; otherwise, transition to `IDLE`.

---

## 6. CELL LIFECYCLE & PERSISTENT METADATA SCHEMA

### 6.1 State Enumeration
Every cell $p \in M$ occupies exactly one discrete state:

| State Identifier | Traversal Cost | Visual Representation | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `VOID` | $\infty$ (Out of Manifold) | Transparent / Canvas Background | Null boundary outside irregular boards. |
| `WALL` | $\infty$ (In Manifold) | Solid Obstacle Texture | Structural barriers creating maze topology. |
| `UNTOUCHED_TERRAIN` | $1$ (Traversable) | Pristine Solid Surface | Valid walkable path awaiting consumption. |
| `ACTIVE_PLAYER` | $\infty$ (Occupied) | Hero Sprite / Focus Glow | Current logical occupancy point of player. |
| `CONSUMED_HISTORY` | $\infty$ (Non-Traversable)| Recessed / Broken Path Tile | Permanently expended tile; retains trace vectors. |
| `LOCKED_GOAL` | $\infty$ (Barrier) | Inactive Goal Gate / Seal | Exit destination locked until objectives met. |
| `UNLOCKED_GOAL` | $1$ (Traversable) | Radiant Portal / Open Gate | Active exit sink; triggers level completion. |
| `FRACTURED_COLLAPSED`| $\infty$ (Non-Traversable)| Shattered / Void Abyss | Stranded terrain collapsed after graph cut. |

### 6.2 Formal State Transition Matrix

```
                      +-------------------+
                      |       VOID        | (Immutable)
                      +-------------------+

                      +-------------------+
                      |       WALL        | (Immutable)
                      +-------------------+

+-------------------+   Player Enters   +-------------------+   Player Exits   +--------------------+
| UNTOUCHED_TERRAIN | ----------------> |   ACTIVE_PLAYER   | ---------------> |  CONSUMED_HISTORY  |
+-------------------+                   +-------------------+                  +--------------------+
          |                                                                               |
          | Graph Partition                                                               | (Terminal)
          v (Stranded)                                                                    v
+-------------------+                                                                   (End)
|FRACTURED_COLLAPSED|
+-------------------+
          |
          v (Terminal)

+-------------------+   Objectives Met  +-------------------+   Player Enters  +--------------------+
|    LOCKED_GOAL    | ----------------> |   UNLOCKED_GOAL   | ---------------> |   LEVEL_VICTORY    |
+-------------------+                   +-------------------+                  +--------------------+
                                                                                          |
                                                                                          v (Terminal)
```

*Transitions are strictly non-reversible during standard gameplay.*

### 6.3 Persistent Metadata Schema (Consumed History)
For every cell mutating to `CONSUMED_HISTORY`, an immutable record $\mu(p)$ is pushed to the global history stack $H$:

```typescript
interface ConsumedCellMetadata {
  coordinate: [number, number];       // [x, y] on grid
  sequence_index: number;             // Monotonic turn index t (0, 1, 2, ...)
  entry_vector: [number, number] | null; // Direction arrived from: [dx, dy]
  exit_vector: [number, number] | null;  // Direction departed toward: [dx, dy]
  timestamp_tick: number;             // Engine frame tick at commit
  traversal_id: string;               // Unique GUID for audit logging
}
```

#### Metadata Utility & Architectural Justification
1.  **Topological Spline Rendering**: By storing `entry_vector` and `exit_vector`, the rendering engine draws continuous, rounded pipe/trench lines through consumed tiles without querying adjacent tiles or incurring $O(N)$ redraw costs.
2.  **Lossless Undo / Time-Travel Reversibility**: If limited or rewarded undo is enabled, popping $H$ provides exact coordinate restoration, reversing $V_t$ deletions in $O(1)$ time and perfectly restoring graph topology.
3.  **Audit & Anti-Cheat Validation**: Complete replay sequences can be verified by re-running $\mu(p)$ records against the level seed without storing heavy frame data.

### 6.4 Spawn Point ($p_0$) Initialization
At level start ($t = 0$):
*   Player coordinate $p_0$ is set to `ACTIVE_PLAYER`.
*   Cell $p_0$ stores `entry_vector = null`.
*   On the first move ($t = 1$), $p_0$ mutates to `CONSUMED_HISTORY` with `exit_vector = (p_1 - p_0)`.
*   *Level Grammar Rule*: Authoring tools must verify that $p_0$ is not a bridge isolating necessary tiles unless the level explicitly teaches one-way drop mechanics.

---

## 7. MASTER ARBITRATION RULINGS (THE CRUCIBLE DEBATE)

During the Phase 1–3 sprint, the Systems Architect and Adversarial Red Team reached fundamental impasses on three core systems. The Master Orchestrator issues the following binding architectural rulings.

---

### ARBITRATION RULING 1: DEADLOCK RESOLUTION POLICY
**The Dilemma**: 
*   *Adversarial Critique*: If the game declares loss the instant an objective is severed ($\mathcal{O} \cap V_{\text{stranded}} \neq \emptyset$), the player is abruptly killed while standing on open, untouched ground with 3 valid exits. This feels punitive, jarring, and unfair. Conversely, if the game delays failure until the player runs out of local moves ($\operatorname{Deg}_{\text{out}} = 0$), the player is trapped in a "Zombie State," wasting 10–15 moves on a mathematically doomed board.
*   *Systems Architect Proposal*: Preemptive instant termination with immediate UI freeze and board fracture.

#### The Executive Ruling: "Telegraphed Soft-Deadlock with Visual Shatter"
We reject both abrupt instant death and silent zombie wandering. The engine implements a two-tier failure model:
1.  **Tier 1: Global Invalidation (Soft Deadlock)**:
    *   When Phase 6 detects that mandatory objectives $\mathcal{O}$ are unreachable from $C_{\text{player}}$, the board does **NOT** throw an abrupt Game Over screen.
    *   Instead, all stranded tiles in $V_{\text{stranded}}$ instantly enter state `FRACTURED_COLLAPSED`. Visually, the stranded landmass shatters, turns dark obsidian, or sinks into the void.
    *   Any stranded goal tile undergoes an `EXTINGUISH` animation, displaying a broken padlock glyph.
    *   The UI displays a persistent, non-intrusive **"Route Severed — Tap to Retry"** banner.
    *   The player is **permitted to spend their remaining local moves** inside $C_{\text{player}}$ to visually and physically experience the walls closing in, or tap the instant retry button.
2.  **Tier 2: Local Entrapment (Hard Deadlock)**:
    *   When the player exhausts all remaining local exits ($\operatorname{Deg}_{\text{out}} = 0$), the hero sprite collapses into dust, and the final **"Deadlock — Restart"** prompt takes modal focus.

*Why this is locked*: The player's cognitive loop demands seeing *why* they failed. Collapsing the stranded region provides instantaneous visual proof of the mistake while respecting player agency.

---

### ARBITRATION RULING 2: INPUT BUFFERING & 180° REVERSAL
**The Dilemma**:
*   *Adversarial Critique*: Players who swipe quickly across multiple tiles will experience dropped inputs if buffering is locked during visual interpolation. However, if a FIFO buffer accepts inputs indiscriminately, a player who swipes Right and immediately realizes their error and swipes Left will queue an illegal reversal back into the tile they are currently consuming, causing a jarring ghost collision.

#### The Executive Ruling: "Strict Single-Slot Buffer with Hard Reversal Suppression"
1.  **Single-Slot Depth ($N=1$)**: Only the single most recent input received during visual interpolation is retained. Previous pending inputs are overwritten.
2.  **Opposite-Vector Suppression**: The buffer strictly rejects any input vector $\vec{d}_{\text{buffered}}$ where:
    $$\vec{d}_{\text{buffered}} \cdot \vec{d}_{\text{active}} = -1$$
    Reversing direction into a consumed tile is physically invalid; dropping it prevents visual stutter and preserves intentional forward momentum.
3.  **Piecewise Manhattan Interpolation**: Visual interpolation $P_{\text{visual}}$ is locked to cardinal segments. In a buffered 90° turn (e.g., Right then Down), the sprite must reach the exact center coordinate $(x_{\text{target}}, y_{\text{target}})$ before changing its velocity vector toward $(x_{\text{target}}, y_{\text{target}} + 1)$. Diagonal corner-cutting through inner walls or consumed voids is structurally prevented.

---

### ARBITRATION RULING 3: THE GOAL TILE PARADOX
**The Dilemma**:
*   *Adversarial Critique*: Subagent 1's transition rule `GOAL -> ACTIVE_PLAYER` creates an existential loop hole. In levels requiring 100% tile consumption, can a player step onto the Goal before clearing the board? If yes, what does the Goal become when they leave? If it becomes `CONSUMED_HISTORY`, the exit is destroyed and the level is unwinnable. If it stays `GOAL`, it functions as an infinite, reusable stepping stone, completely shattering the game's core consumption invariant.

#### The Executive Ruling: "The Goal as a Conditional Topological Sink"
The Goal tile is never a stepping stone. It is engineered as a two-phase topological entity:
1.  **State 1: `LOCKED_GOAL` (Topological Wall)**:
    *   While global prerequisites (e.g., $100\%$ tile consumption or required token collection) are incomplete, the Goal tile is classified as **Impassable Wall** ($p \notin V_t$).
    *   Attempting to move onto a `LOCKED_GOAL` triggers the standard wall deflection ("solid seal thump"). The player cannot enter it, bounce on it, or pass through it.
2.  **State 2: `UNLOCKED_GOAL` (Terminal Sink)**:
    *   The microsecond the final required tile is consumed, Phase 6 converts `LOCKED_GOAL` to `UNLOCKED_GOAL` ($g \in V_t$).
    *   Moving onto `UNLOCKED_GOAL` initiates an immediate, uninterruptible transition:
        $$\text{UNLOCKED\_GOAL} \to \text{LEVEL\_VICTORY}$$
    *   The player **can never exit a goal tile**. Stepping onto the unlocked goal is the terminal closing action of the puzzle.

*Why this is locked*: This preserves the purity of the consumption axiom. Terrain is always consumed upon exit; because the Goal cannot be exited, it never needs to violate consumption rules.

---

## 8. SUMMARY SPECIFICATION CHECKSHEET

| Subsystem | Specification Standard | Mathematical Invariant |
| :--- | :--- | :--- |
| **Coordinate Space** | Discrete Cartesian $\mathbb{Z}^2$ | Origin $(0,0)$ Top-Left; $+X$ East, $+Y$ South |
| **Grid Adjacency** | Manhattan Metric ($L_1$) | $\mathcal{N}_4(p) = \{ q \in \mathcal{M} \mid d_1(p, q) = 1 \}$ |
| **Diagonals** | Chebyshev ($L_\infty$) Prohibited | $d_1(p, q) > 1 \implies \text{Illegal}$ |
| **Touch Quantization** | 4 Cardinal Quadrants w/ Deadzone | $|\theta - \theta_0| \le 35^\circ$; $20^\circ$ diagonal deadband discarded |
| **Input Buffer** | Single-Slot FIFO ($N=1$) | Reversals ($\vec{d}_{\text{in}} = -\vec{d}_{\text{active}}$) dropped |
| **Visual Tweening** | Piecewise Manhattan Lerp ($120\text{ms}$)| Zero corner-cutting across $N_8 \setminus N_4$ |
| **Logical Position** | Instantaneous Snap at Phase 4 | $p_{\text{logical}} \gets p_{\text{target}}$ prior to visual completion |
| **Tile Consumption** | Mutates to `CONSUMED_HISTORY` | Deletion from vertex set: $V_{t+1} = V_t \setminus \{ p_{\text{current}} \}$ |
| **Metadata Record** | Immutable History Stack Entry | Stores $\mu(p) = \langle \text{coord}, t, \vec{v}_{\text{in}}, \vec{v}_{\text{out}}, \text{tick}, \text{id} \rangle$ |
| **Deadlock Policy** | Two-Tier Telegraphed Soft-Failure | Visual fracture on stranded terrain + local exit check |
| **Goal Mechanics** | Conditional Terminal Sink | Impassable Wall until unlocked; terminal upon entry |

---

## 9. DOCUMENT SIGN-OFF GATE

This chapter defines the bedrock foundation for all subsequent design passes (**PASS B: OBJECTIVES & FAILURE**, **PASS C: LEVEL GRAMMAR & DIFFICULTY**). Code generation remains FROZEN until the Executive Sign-Off Gate is satisfied.

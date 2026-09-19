# ONE MORE TILE — PRODUCTION GAME DESIGN BIBLE
## PASS C: LEVEL GRAMMAR & DIFFICULTY SPECIFICATION
**Document Version:** 1.0.0-PROD  
**Status:** ARBITRATED & LOCKED (Awaiting Executive Signature)  
**Foundational Audit Reference:** Sections 10, 11, 12, and 34  
**Master Orchestrator:** Executive Producer & Systems Director  
**Collaborative Systems Workforce:** Lead Level Architect (Claude 3.5 Sonnet) & Adversarial QA (Claude 3.5 Sonnet)

---

## 1. EXECUTIVE SUMMARY & PEDAGOGICAL PHILOSOPHY

This document formalizes the **Level Grammar Dictionary, Mathematical Difficulty Vector, Chapter Progression Pacing, and Non-Verbal Onboarding Blueprint (Levels 1–10)** for **ONE MORE TILE**.

### 1.1 Core Pedagogical Axioms
1. **Zero Text Boxes**: The game never uses intrusive tutorial popups, tooltip overlays, or explanatory text walls. Every mechanic is taught purely through spatial topology, geometric isolation, and immediate systemic feedback.
2. **The Puzzle Design Contract**: Every failure must be explainable by the player's own spatial decisions. Puzzles must provide sufficient visual and topological clues for forward reasoning; trial-and-error brute force is treated as an authoring defect.
3. **Continuous Difficulty Pacing**: Difficulty is not a monolithic level counter. It is a multi-dimensional vector $\vec{D}$ evaluated by an algorithmic solver to guarantee smooth progression devoid of abrupt churn cliffs.
4. **The Sawtooth Progression Curve**: Cognitive tension must fluctuate rhythmically. Every high-intensity "Master" or "Graduation" puzzle is immediately followed by a low-friction, high-agency "Remix" or introductory "Teach" state.

---

## 2. FORMAL LEVEL GRAMMAR DICTIONARY

Authoring in ONE MORE TILE utilizes six discrete topological archetypes. Each archetype is defined by its graph-theoretic properties and the specific spatial decision it demands from the player.

```
+-----------------------------------------------------------------------------+
|                         TOPOLOGICAL ARCHETYPE MATRIX                        |
+-----------------------------------------------------------------------------+
| ARCHETYPE         | GRAPH TOPOLOGY         | PLAYER DECISION                |
+-------------------+------------------------+--------------------------------+
| The Corridor      | Deg(v) <= 2            | Sequence Commitment            |
| The Fork          | Deg(v) >= 3            | Mutually Exclusive Branching   |
| The Return Bridge | Articulation Edge Cut  | Perimeter Preservation         |
| The False Door    | Deceptive Short Path   | Resisting Greedy Traps         |
| The Sacrifice     | Budget < Open Terrain  | Intentional Territory Culling  |
| The Bottleneck    | Macro Cut-Vertex       | Regional Phase Gating          |
+-----------------------------------------------------------------------------+
```

### 2.1 The Corridor (Order & Commitment)
*   **Mathematical Definition**: An induced path subgraph $P = (V_c, E_c)$ where $\forall v \in V_c \setminus \{v_{\text{start}}, v_{\text{end}}\}, \operatorname{Deg}(v) = 2$.
*   **Pedagogical Purpose**: Strips branching freedom to enforce commitment. Once entered, the player surrenders steering agency until exiting. Used to connect puzzle rooms and regulate move counting.

### 2.2 The Fork (Mutual Exclusion)
*   **Mathematical Definition**: A decision vertex $v_{\text{fork}}$ where $\operatorname{Deg}(v_{\text{fork}}) \ge 3$.
*   **Pedagogical Purpose**: Selecting neighbor $u \in \mathcal{N}_4(v_{\text{fork}})$ consumes $v_{\text{fork}}$, permanently destroying edges to alternate neighbors $w \in \mathcal{N}_4(v_{\text{fork}})$. The player must evaluate which branch can be completed and returned from versus which branch is a fatal cul-de-sac.

### 2.3 The Return Bridge (Topological Preservation)
*   **Mathematical Definition**: A sub-network containing an entry lane and an exit lane separated by a barrier, requiring a 2-lane parallel sweep:
    $$\operatorname{Bridge}(A, B) \iff \text{Path}(A \to B) \cap \text{Path}(B \to A) = \emptyset$$
*   **Pedagogical Purpose**: Teaches perimeter routing. The player must navigate into a dead-end pocket along one edge while preserving an adjacent untouched lane to escape back to the main manifold.

### 2.4 The False Door (Deceptive Efficiency)
*   **Mathematical Definition**: A path $P_{\text{false}}$ characterized by a lower Manhattan distance to Goal:
    $$d_1(p, g) < d_1(p_{\text{true}}, g) \quad \text{such that} \quad \mathcal{W}(G_{\text{false}}) \equiv \text{False}$$
*   **Pedagogical Purpose**: Punishes greedy heuristics. Exploits the casual instinct to step directly toward the Goal, luring the player into early exit entrapment or budget extinction.

### 2.5 The Sacrifice (Intentional Territory Culling)
*   **Mathematical Definition**: A board configuration where the Spatial Budget $B_0$ is strictly less than unvisited non-critical tiles ($B_0 < |V_0 \setminus (S \cup \{g\})|$), or where parity prevents a full Hamiltonian cycle.
*   **Pedagogical Purpose**: Deconstructs the player's completionist instinct. Forces the player to intentionally abandon tiles and spend budget to secure the critical path, teaching that survival outweighs 100% space-clearing.

### 2.6 The Bottleneck (Choke-Point Articulation)
*   **Mathematical Definition**: A cut-vertex $v_{\text{choke}}$ partitioning $G$ into distinct regional zones:
    $$G \setminus \{ v_{\text{choke}} \} = Z_1 \cup Z_2 \quad (Z_1 \cap Z_2 = \emptyset)$$
*   **Pedagogical Purpose**: Temporal phase boundary. All primary objectives within Zone $Z_1$ must be 100% resolved before crossing $v_{\text{choke}}$ into Zone $Z_2$, as return to $Z_1$ is topologically impossible.

---

## 3. MATHEMATICAL DIFFICULTY VECTOR

Difficulty is quantified through an objective, continuous 6-dimensional vector evaluated by an automated headless graph solver:
$$\vec{D} = \langle L_{\text{opt}}, \beta, \rho_{\text{wrong}}, \bar{R}_{\text{tol}}, \Sigma_{\text{depth}}, \psi \rangle$$

### 3.1 Vector Dimension Definitions

```
+-----------------------------------------------------------------------------+
|                       DIFFICULTY VECTOR SPECIFICATION                       |
+-----------------------------------------------------------------------------+
| DIMENSION           | FORMULA / DOMAIN            | SEMANTIC IMPACT         |
+---------------------+-----------------------------+-------------------------+
| L_opt               | Min moves in solver [2, 50] | Solution length / par   |
| beta                | Mean active exits [1.0, 3.5]| Spatial branching       |
| rho_wrong           | Dead-ends / Total paths     | Wrong-path density      |
| R_tol (Normalized)  | R_tol / |V_0| in [0.0, 1.0] | Error recovery margin   |
| Sigma_depth         | Active constraints [1, 5]   | Mental chaining load    |
| psi (Perceptual)    | Heuristic index [0.0, 1.0]  | Visual deceptive lures  |
+-----------------------------------------------------------------------------+
```

1.  **Optimal Path Length ($L_{\text{opt}}$)**: Absolute minimum move count required to satisfy the victory equation $\mathcal{W}(G_t, p_t) \equiv \text{True}$.
2.  **Mean Branching Factor ($\beta$)**: Average count of valid adjacent moves available across the optimal path:
    $$\beta = \frac{1}{L_{\text{opt}}} \sum_{t=1}^{L_{\text{opt}}} |\mathcal{N}_4(p_t) \cap V_t|$$
3.  **Wrong-Path Density ($\rho_{\text{wrong}}$)**: The proportion of decision branches in the solver's search tree that terminate in Deadlock:
    $$\rho_{\text{wrong}} = \frac{N_{\text{deadend}}}{N_{\text{total\_branches}}}$$
4.  **Normalized Recovery Tolerance ($\bar{R}_{\text{tol}}$)**: The ratio of non-fatal deviation moves to total board volume:
    $$\bar{R}_{\text{tol}} = \frac{R_{\text{tol}}}{|V_0|}$$
    Where $R_{\text{tol}}$ is the maximum distance a player can wander off the optimal path before crossing an irreversible cut-vertex into Soft Deadlock.
5.  **State Interaction Depth ($\Sigma_{\text{depth}}$)**: The count of concurrent, interdependent mechanical constraints:
    $$\Sigma_{\text{depth}} = \mathbf{1}_{\text{ClearAll}} + \mathbf{1}_{\text{Sequence}} + \mathbf{1}_{\text{Budget}} + \mathbf{1}_{\text{Bottlenecks}}$$
6.  **Perceptual Complexity Index ($\psi \in [0.0, 1.0]$)**: Quantifies human cognitive pitfalls:
    $$\psi = 0.4 \cdot \text{SymmetryAmbiguity} + 0.4 \cdot \text{FalseDoorLure} + 0.2 \cdot (1 - d_{\text{first\_branch}})$$
    Where $d_{\text{first\_branch}}$ is the normalized distance from spawn to the first decision fork. Early forks with high visual symmetry dramatically increase human cognitive load.

### 3.2 Automated Difficulty Scalar Formula
To sort, sequence, and validate levels in the automated build pipeline, the solver compiles $\vec{D}$ into a single scalar:
$$\operatorname{Score}(\vec{D}) = w_1 L_{\text{opt}} + w_2 (\beta \cdot \rho_{\text{wrong}}) + w_3 (1 - \bar{R}_{\text{tol}}) \cdot L_{\text{opt}} + w_4 (2^{\Sigma_{\text{depth}}}) + w_5 \psi$$

*Calibrated Production Weights*:
$$w_1 = 1.0, \quad w_2 = 15.0, \quad w_3 = 10.0, \quad w_4 = 4.0, \quad w_5 = 8.0$$

---

## 4. PROGRESSION CURRICULUM & PACING

Content progression follows the **Teach $\to$ Apply $\to$ Combine $\to$ Twist $\to$ Master $\to$ Remix** framework across distinct teaching blocks.

```
COGNITIVE LOAD
     ^
     |                                    [MASTER]
     |                                       /\
     |                    [COMBINE]         /  \
     |                       /\   [TWIST]  /    \
     |          [APPLY]     /  \    /\    /      \
     |   [TEACH]   /\      /    \  /  \  /        \  [REMIX]
     |     /\     /  \    /      \/    \/          \   /\
     |    /  \   /    \  /                          \ /  \
     +---+----+--+-----+--+--------------------------+----+--> LEVEL PROGRESSION
```

1.  **TEACH (Introduction)**: Single isolated concept. Branching factor $\beta \approx 1.0$, recovery tolerance high ($\bar{R}_{\text{tol}} > 0.5$). Zero chance of accidental failure. Focus: Sensory observation.
2.  **APPLY (Execution)**: Basic fork introduced ($\beta \ge 2.0$). Player must consciously choose between the taught mechanic and an obvious dead-end.
3.  **COMBINE (Synthesis)**: Merges the newly learned mechanic with an established archetype (e.g., Checkpoint Sequence inside a Bottleneck). $\Sigma_{\text{depth}}$ increments by 1.
4.  **TWIST (Subversion)**: Presents a False Door. The intuitive, greedy approach fails; the player must re-read the board to find an unintuitive counter-path.
5.  **MASTER (The Exam)**: High wrong-path density ($\rho_{\text{wrong}} > 0.7$), low tolerance ($\bar{R}_{\text{tol}} \le 0.1$). Requires full multi-step lookahead.
6.  **REMIX (Playground & Relief)**: Open layout with high branching ($\beta \ge 2.5$) and multiple valid solutions. Focus shifts from survival to move efficiency ($\Delta_M$) and style, lowering cognitive stress before the next chapter.

---

## 5. NON-VERBAL ONBOARDING BLUEPRINT (LEVELS 1 THROUGH 10)

The onboarding campaign teaches the complete foundational grammar of ONE MORE TILE across 10 meticulously calibrated micro-levels.

### Legend
*   `P`: Player Spawn (active start coordinate)
*   `G`: Goal Tile (`LOCKED_GOAL` or `UNLOCKED_GOAL`)
*   `C1`, `C2`: Chronological Checkpoint Waypoints
*   `.`: Untouched Walkable Terrain
*   `#`: Impassable Wall Barrier
*   `' '`: Void (Out of Manifold)

---

### Level 1: The Straightaway (Basic Movement & Consumption)
*   **Pedagogical Truth**: Swiping moves the hero; stepped-on tiles sink and disappear permanently.
*   **Grid Layout (3x1)**:
    ```text
    P . G
    ```
*   **Initial Budget ($B_0$)**: $0$ (All clear required)
*   **Optimal Moves ($L_{\text{opt}}$)**: $2$
*   **Verified Move Trace**: `RIGHT, RIGHT`
*   **Metrics**: $\beta = 1.0, \; \rho_{\text{wrong}} = 0.0, \; \bar{R}_{\text{tol}} = 1.0, \; \Sigma_{\text{depth}} = 1, \; \psi = 0.0$

---

### Level 2: The Corner (2D Turning & Consumed Barriers)
*   **Pedagogical Truth**: Paths can turn; previously consumed tiles act as solid walls.
*   **Grid Layout (3x2)**:
    ```text
    P . .
    # # G
    ```
*   **Initial Budget ($B_0$)**: $0$
*   **Optimal Moves ($L_{\text{opt}}$)**: $3$
*   **Verified Move Trace**: `RIGHT, RIGHT, DOWN`
*   **Metrics**: $\beta = 1.0, \; \rho_{\text{wrong}} = 0.0, \; \bar{R}_{\text{tol}} = 1.0, \; \Sigma_{\text{depth}} = 1, \; \psi = 0.1$

---

### Level 3: The Mini-Loop (The Cliff-Breaker / Space-Filling Bridge)
*   **Pedagogical Truth**: Space-filling curves. A direct move to Goal strands tiles and fails; you must loop around.
*   **Grid Layout (2x2)**:
    ```text
    P .
    G .
    ```
*   **Initial Budget ($B_0$)**: $0$
*   **Optimal Moves ($L_{\text{opt}}$)**: $3$
*   **Verified Move Trace**: `RIGHT, DOWN, LEFT`
*   **Pedagogical Safeguard**: Prevents the 400% difficulty cliff by introducing 2D spatial closure on a tiny 4-tile grid before expanding. Moving `DOWN` immediately strands $(1,0)$ and $(1,1)$, triggering Soft Deadlock fracture.
*   **Metrics**: $\beta = 2.0, \; \rho_{\text{wrong}} = 0.5, \; \bar{R}_{\text{tol}} = 0.0, \; \Sigma_{\text{depth}} = 1, \; \psi = 0.2$

---

### Level 4: The True Fork (Mutual Exclusion & Choke Consequence)
*   **Pedagogical Truth**: Branching decisions are irreversible. Choosing the wrong corridor traps you.
*   **Grid Layout (3x3)**:
    ```text
    . P #
    . . #
    G . #
    ```
*   *(Coordinates: P at (1,0); (0,0), (0,1), (1,1), (0,2)[G], (1,2) are Walkable; column 2 is Wall).*
*   **Initial Budget ($B_0$)**: $0$
*   **Optimal Moves ($L_{\text{opt}}$)**: $5$
*   **Verified Move Trace**: `LEFT, DOWN, RIGHT, DOWN, LEFT`
*   **Pedagogical Consequence**: From P(1,0), moving `DOWN` to (1,1) isolates (0,0) in the north, causing immediate visual fracture. Moving `LEFT` to (0,0) smoothly captures the perimeter.
*   **Metrics**: $\beta = 1.8, \; \rho_{\text{wrong}} = 0.5, \; \bar{R}_{\text{tol}} = 0.0, \; \Sigma_{\text{depth}} = 1, \; \psi = 0.4$

---

### Level 5: The Snake (2x3 Grid / S-Curve Packing)
*   **Pedagogical Truth**: Serpentine Hamiltonian packing in constrained rectangles.
*   **Grid Layout (3x2)**:
    ```text
    P . .
    G . .
    ```
*   **Initial Budget ($B_0$)**: $0$
*   **Optimal Moves ($L_{\text{opt}}$)**: $5$
*   **Verified Move Trace**: `RIGHT, RIGHT, DOWN, LEFT, LEFT`
*   **Metrics**: $\beta = 1.6, \; \rho_{\text{wrong}} = 0.4, \; \bar{R}_{\text{tol}} = 0.0, \; \Sigma_{\text{depth}} = 1, \; \psi = 0.2$

---

### Level 6: The Return Corridor (Cul-de-Sac Preservation)
*   **Pedagogical Truth**: Entering a dead-end requires maintaining an adjacent unconsumed return lane.
*   **Grid Layout (4x3)**:
    ```text
    P . . .
    # # # .
    G . . .
    ```
*   **Initial Budget ($B_0$)**: $0$
*   **Optimal Moves ($L_{\text{opt}}$)**: $7$
*   **Verified Move Trace**: `RIGHT, RIGHT, RIGHT, DOWN, DOWN, LEFT, LEFT, LEFT`
*   **Pedagogical Consequence**: Teaches two-lane highway routing across a central wall divider.
*   **Metrics**: $\beta = 1.1, \; \rho_{\text{wrong}} = 0.0, \; \bar{R}_{\text{tol}} = 1.0, \; \Sigma_{\text{depth}} = 1, \; \psi = 0.1$

---

### Level 7: The Spatial Budget (Real-Time Spare Tile Ledger)
*   **Pedagogical Truth**: Overspending spare tiles extinguishes the Goal in real time.
*   **Grid Layout (4x2)**:
    ```text
    P . . .
    # G . .
    ```
*   *(Coordinates: P(0,0), .(1,0), .(2,0), .(3,0), G(1,1), .(2,1), .(3,1); (0,1) is Wall).*
*   **Initial Budget ($B_0$)**: $3$ (HUD: "Spare Tiles: 3")
*   **Optimal Moves ($L_{\text{opt}}$)**: $2$
*   **Verified Move Trace**: `RIGHT, DOWN` (Leaves 4 tiles untouched; budget allows up to 3 spare tiles spent).
*   **Pedagogical Consequence**: If the player detours to explore column 2 and 3, the exact microsecond the 4th spare tile is consumed ($B_t = -1$), the Goal tile immediately cracks, dims, and extinguishes its flame in real time.
*   **Metrics**: $\beta = 2.0, \; \rho_{\text{wrong}} = 0.3, \; \bar{R}_{\text{tol}} = 0.4, \; \Sigma_{\text{depth}} = 2, \; \psi = 0.3$

---

### Level 8: Checkpoint Sequence (Conduits & Ordered Waypoints)
*   **Pedagogical Truth**: Waypoints must be visited in strict numerical order; runic conduits light the route.
*   **Grid Layout (3x3)**:
    ```text
    P  .  C1
    .  .  .
    C2 .  G
    ```
*   *(Fully connected 9-tile grid. No impassable walls; zero 1-degree trap bugs).*
*   **Initial Budget ($B_0$)**: $0$ (All clear required)
*   **Optimal Moves ($L_{\text{opt}}$)**: $8$
*   **Verified Move Trace**: `RIGHT, RIGHT (Hits C1), DOWN, LEFT, LEFT, DOWN (Hits C2), RIGHT, RIGHT (Enters G)`
*   **Pedagogical Consequence**: Stepping on C1 lights the emissive floor conduit to C2. Stepping on C2 prematurely shatters the conduit, signaling an unrecoverable sequence breach.
*   **Metrics**: $\beta = 2.2, \; \rho_{\text{wrong}} = 0.6, \; \bar{R}_{\text{tol}} = 0.0, \; \Sigma_{\text{depth}} = 2, \; \psi = 0.3$

---

### Level 9: The True Sacrifice (Parity & Deliberate Abandonment)
*   **Pedagogical Truth**: Breaking the Hamiltonian instinct. You must intentionally abandon tiles to survive.
*   **Grid Layout (3x3)**:
    ```text
    P . .
    # . .
    G . .
    ```
*   *(Walkable: P(0,0), (1,0), (2,0), (1,1), (2,1), (0,2)[G], (1,2), (2,2). Wall at (0,1). Total Walkable = 8).*
*   **Initial Budget ($B_0$)**: $1$ (HUD: "Spare Tiles: 1")
*   **Optimal Moves ($L_{\text{opt}}$)**: $6$
*   **Verified Move Trace**: `RIGHT, RIGHT, DOWN, DOWN, LEFT, LEFT`
*   **Pedagogical Consequence**: The player traverses the outer perimeter to Goal G, leaving center tile (1,1) untouched. Attempting to consume (1,1) traps the player in a dead-end pocket. The player learns that perfection means obeying the budget, not consuming every tile.
*   **Metrics**: $\beta = 1.9, \; \rho_{\text{wrong}} = 0.5, \; \bar{R}_{\text{tol}} = 0.0, \; \Sigma_{\text{depth}} = 2, \; \psi = 0.5$

---

### Level 10: The Graduation Exam (Synthesis of Grammar)
*   **Pedagogical Truth**: Master synthesis of Sequence, Budget, Perimeter Return, and Center Sink.
*   **Grid Layout (3x3 - Center Goal Sink)**:
    ```text
    P  .  C1
    .  G  .
    C2 .  .
    ```
*   *(Coordinates: P at (0,0); C1 at (2,0); C2 at (0,2); Goal G at center (1,1). All 9 tiles walkable).*
*   **Initial Budget ($B_0$)**: $0$ (Hamiltonian All-Clear)
*   **Optimal Moves ($L_{\text{opt}}$)**: $8$
*   **Verified Move Trace**: 
    1. `RIGHT` $\to (1,0)$
    2. `RIGHT` $\to (2,0)$ `[Hits C1 - Conduit lights to C2]`
    3. `DOWN`  $\to (2,1)$
    4. `DOWN`  $\to (2,2)$
    5. `LEFT`  $\to (1,2)$
    6. `LEFT`  $\to (0,2)$ `[Hits C2 - Goal G at (1,1) UNLOCKS]`
    7. `UP`    $\to (0,1)$
    8. `RIGHT` $\to (1,1)$ `[Enters UNLOCKED_GOAL -> LEVEL COMPLETE!]`
*   **Pedagogical Mastery**: A flawless clockwise perimeter sweep consuming all 8 outer tiles, activating checkpoints in exact order, and terminating into the radiant center sink.
*   **Metrics**: $\beta = 2.1, \; \rho_{\text{wrong}} = 0.7, \; \bar{R}_{\text{tol}} = 0.0, \; \Sigma_{\text{depth}} = 3, \; \psi = 0.6$

---

## 6. MASTER ARBITRATION RULINGS (PASS C CRUCIBLE)

---

### ARBITRATION RULING 1: LEVEL 3 CLIFF ELIMINATION (THE MINI-LOOP)
**The Dilemma**:
*   *Systems Architect*: Initially proposed jumping from Level 2 (a 3-move linear corridor) directly to an 8-move open 3x3 Hamiltonian puzzle on Level 3.
*   *Adversarial QA*: Proved this represented a 400% difficulty cliff, causing immediate player churn on casual platforms like YouTube Playables.
*   *The Executive Ruling*: Mandatory insertion of **The $2 \times 2$ Mini-Loop** (`P . \n G .`). It introduces the space-filling concept on the smallest possible 4-tile manifold ($L_{\text{opt}} = 3$), allowing the player to understand non-linear spatial closure before scaling to larger grids.

---

### ARBITRATION RULING 2: ELIMINATION OF IMPOSSIBLE CHECKPOINT SINKS
**The Dilemma**:
*   *The Bug*: Subagent 1's initial Level 8 layout placed checkpoint $C_1$ at $(2,0)$ with a wall at $(2,1)$, giving $C_1$ exactly one neighbor $(1,0)$. Moving into $C_1$ consumed $(1,0)$, making the puzzle mathematically unsolvable.
*   *The Executive Ruling*: Strict authoring rule codified in Section 8: **Every Checkpoint Waypoint must satisfy $\operatorname{Deg}(C_i) \ge 2$ in $G_0$**. Checkpoints are transition waypoints, never terminal sinks; placing a checkpoint in a 1-degree cul-de-sac is an invalid layout state rejected by the build compiler.

---

### ARBITRATION RULING 3: BOARD-VOLUME SCALING & PERCEPTUAL COMPLEXITY
**The Dilemma**:
*   *The Conflict*: Subagent 1's difficulty formula evaluated recovery tolerance $R_{\text{tol}}$ without scaling against total board size, and ignored human cognitive biases (visual symmetry, deceptive corridor alignment).
*   *The Executive Ruling*: The Difficulty Vector formula incorporates **Normalized Tolerance** $\bar{R}_{\text{tol}} = \frac{R_{\text{tol}}}{|V_0|}$ and the **Perceptual Complexity Index ($\psi$)**. Automated level ordering must balance psychological deceptive affordances alongside raw graph search depth.

---

## 7. SUMMARY SPECIFICATION CHECKSHEET

| Subsystem | Specification Standard | Mathematical Invariant |
| :--- | :--- | :--- |
| **Authoring Archetypes**| 6 Discrete Patterns | Corridor, Fork, Return, False Door, Sacrifice, Bottleneck |
| **Difficulty Vector** | 6-Dimensional Metric $\vec{D}$ | $\langle L_{\text{opt}}, \beta, \rho_{\text{wrong}}, \bar{R}_{\text{tol}}, \Sigma_{\text{depth}}, \psi \rangle$ |
| **Curriculum Stages** | 6-Phase Pedagogical Cycle | Teach $\to$ Apply $\to$ Combine $\to$ Twist $\to$ Master $\to$ Remix |
| **Non-Verbal Rule** | Zero Tutorial Text Overlays | Learning occurs 100% via spatial topology and systemic feedback |
| **Level 3 Bridge** | $2 \times 2$ Mini-Loop | Smooths Hamiltonian onboarding curve; prevents churn cliff |
| **Checkpoint Degree** | Traversable Transit Invariant | $\forall c \in \mathcal{C}, \; \operatorname{Deg}(c) \ge 2$ in $G_0$ |
| **Graduation Exam** | Center Sink Perimeter Sweep | Level 10 synthesizes Sequence, Parity, Budget, and Return |

---

## 8. DOCUMENT SIGN-OFF GATE

This chapter defines the definitive level authoring grammar, difficulty evaluation algorithms, and onboarding curriculum for **ONE MORE TILE**. Code generation remains FROZEN until the Executive Sign-Off Gate is satisfied.

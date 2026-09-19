# ONE MORE TILE — PRODUCTION GAME DESIGN BIBLE
## PASS B: OBJECTIVES & FAILURE SPECIFICATION (AMENDED)
**Document Version:** 1.1.0-PROD  
**Status:** ARBITRATED & AMENDED (Awaiting Executive Signature)  
**Foundational Audit Reference:** Sections 8, 9, 15, 16, and 34  
**Master Orchestrator:** Executive Producer & Systems Director  
**Collaborative Systems Workforce:** Systems Architect (Claude 3.5 Sonnet) & Adversarial Red Team (Claude 3.5 Sonnet)

---

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL CONTINUITY

This document establishes the definitive, production-ready mathematical specifications for **Objectives, Failure States, HUD Undo Architecture, and Mastery Evaluation** in **ONE MORE TILE**, calibrated specifically for the mobile touchscreen environment of **YouTube Playables**.

### 1.1 Core Axiomatic Foundations
1. **Respect the Player's Time**: Eliminate punitive game-design purism that triggers rage-quits. Mobile touchscreens produce accidental slips; recovery must be instant, frictionless, and tactile.
2. **Transparent Real-Time Constraints**: Eradicate all "Gotcha at the Door" failure traps. Constraints are exposed as live, visible ledgers. The exact microsecond a player invalidates a rule, the board communicates it diegetically.
3. **Reachability Precedence**: Topological reachability strictly dominates objective satisfaction. An objective cannot be completed if the act of doing so severs the exit sink from the playable manifold.
4. **Bifurcated Mastery (Prestige vs. Progression)**: Casual players must never be blocked by high-friction perfectionism; elite planners must retain an uncompromised, verifiable ceiling of pure foresight.

---

## 2. OBJECTIVE GRAMMAR & FORMAL WIN PREDICATES

### 2.1 The Master Victory Equation
At any discrete step $t$, the board is represented by graph $G_t = (V_t, E_t)$, player position $p_t$, and history stack $\mathcal{S}_t$.
The terminal victory predicate $\mathcal{W}(G_t, p_t)$ evaluates to `True` if and only if:
$$\mathcal{W}(G_t, p_t) \iff (p_t = g) \land \left( \text{State}(g) = \text{UNLOCKED\_GOAL} \right) \land (B_t \ge 0)$$

Where:
*   $g \in M$ is the designated Goal coordinate.
*   $\text{State}(g)$ is the discrete lifecycle state of the Goal tile.
*   $B_t$ is the Real-Time Spatial Budget.

```
[Level Execution]
       |
       v
  Phase 6: Check Active Objectives & Reachability
       |
       +---> Primary Objectives Met AND g in C_player AND B_t >= 0?
                 |
                YES ---> g Mutates: LOCKED_GOAL -> UNLOCKED_GOAL (Radiant Flame)
                 |
                 NO  ---> g Remains LOCKED_GOAL (If B_t < 0: FRACTURED_COLLAPSED)
       |
       v
  Phase 7: Player Enters UNLOCKED_GOAL?
       |
       +---> Trigger LEVEL_VICTORY (Mastery Calculated; Next Level Unlocked)
```

### 2.2 Formal Objective Taxonomy

#### 1. CLEAR_ALL (The Canonical Baseline)
All initially walkable tiles $V_0$ must be consumed prior to entering the Goal.
$$P_{\text{clear}}(G_t) \iff V_t = \{ g \}$$
*Trigger*: The Goal $g$ mutates to `UNLOCKED_GOAL` the exact step where $|V_t| = 1$ and $p_t \in \mathcal{N}_4(g)$.

#### 2. CONSUME(S) (Targeted Depletion)
A designated subset of marked target tiles $S \subset V_0 \setminus \{g\}$ must be completely traversed and consumed.
$$P_{\text{consume}}(G_t) \iff S \cap V_t = \emptyset \iff S \subseteq H_t$$
*Visual Feedback*: Target tiles emit an active prismatic beacon. Upon consumption, they emit a resonant crystalline pop and collapse into the history trail.

#### 3. SEQUENCE($\mathcal{C}$) (Chronological Waypoints & Runic Conduits)
An ordered tuple of checkpoint coordinates $\mathcal{C} = \langle c_1, c_2, \dots, c_m \rangle$ must be visited in strict monotonic sequence.
*   Let $\pi(t) \in \{0, 1, \dots, m\}$ denote the sequence pointer at step $t$ ($\pi(0) = 0$).
*   The pointer advances if and only if the player enters the exact next expected checkpoint:
    $$\pi(t+1) = \begin{cases} \pi(t) + 1 & \text{if } p_{t+1} = c_{\pi(t)+1} \\ \pi(t) & \text{otherwise} \end{cases}$$
*   **Diegetic Runic Conduits**: Emissive floor tracks ($>4\text{px}$ bold lines, inspired by *The Witness* and *Cosmic Express*) visually connect $p_0 \to c_1 \to c_2 \dots \to g$.
    *   *Active Segment*: Pulses with bright cyan energy toward $c_{\pi(t)+1}$.
    *   *Completed Segment*: Solidifies into a warm golden path.
    *   *Invalidated Segment*: If the player consumes an unvisited checkpoint out of sequence ($c_j$ where $j > \pi(t) + 1$), the conduit instantly snaps with an electrical short-circuit visual, and the board enters Soft Deadlock.

#### 4. PRESERVE(K) INVERTED: THE REAL-TIME SPATIAL BUDGET
*(Amended per Executive Directive — eradicating the "Gotcha at the Door").*

Rather than testing preservation at the exit, preservation is mathematically inverted into a live, transparent **Spare Tile Budget** ($B_t$):
*   **Initial Budget**:
    $$B_0 = |V_0 \setminus \{g\}| - K$$
*   **HUD Display**: Rendered prominently in the top HUD: **"Spare Tiles: $B_t$"**.
*   **Dynamic Ledger**: Let $S_{\text{mandatory}}$ be the minimum set of tiles required for primary objectives. Consuming an optional tile decrements the budget:
    $$B_{t+1} = B_t - 1 \quad (\text{if } p_t \notin S_{\text{mandatory}})$$
*   **Immediate Real-Time Telegraphing**:
    *   $B_t > 1$: Goal beacon burns with a radiant cyan flame.
    *   $B_t = 0$: Warning State. Goal flame flickers amber; micro-fracture lines appear on the Goal's stone rim; low ambient warning hum.
    *   **The Critical Moment ($B_t = -1$)**: The exact microsecond the player steps onto a tile that causes $B_t < 0$, the Goal tile **instantly fractures, dims, and snuffs out its flame in real time**, accompanied by a heavy resonant bass clunk and a subtle $2\text{px}$ screen shake. The player is notified of their mistake on the exact move it happens, completely eliminating exit-door frustration.

---

## 3. REACHABILITY DOMINANCE (LOCKED INVARIANT)

### 3.1 The Rule Reaffirmed
Topological Reachability **strictly dominates** Objective Completion:
$$\text{Reachability}(g \in C_{\text{player}}) \succ \text{Objective Satisfaction}(U(G_t))$$

### 3.2 Suicide Completion Resolution
If the player consumes an articulation point (bridge) $s_{\text{last}} \in S$ that satisfies an objective but simultaneously partitions the board such that $g \notin C_{\text{player}}$:
1.  Goal Unlocking is **immediately aborted**.
2.  The Goal tile, along with all stranded terrain $V_{\text{stranded}}$, mutates instantly to `FRACTURED_COLLAPSED` (visual shattering into the abyss).
3.  The HUD projects a persistent, non-intrusive banner: **"Route Severed — Tap to Undo or Retry"**.
4.  No state superposition or false victory fanfare can ever occur.

---

## 4. THE "FAT-FINGER GRACE" HUD UNDO ARCHITECTURE

*(Amended per Executive Directive — eliminating academic purism for mobile play).*

```
+-----------------------------------------------------------------------------+
|                            TOP HUD STATUS BAR                               |
|  [ Level 14 ]            [ Spare Tiles: 2 ]            [ ★ ★ ★ ] [ UNDO ↺ ] |
+-----------------------------------------------------------------------------+
                                                                  |
                                      +---------------------------+
                                      | Tap Undo
                                      v
+-----------------------------------------------------------------------------+
| 1. Pop Delta-Frame delta_t from History Stack S (O(1) state restoration)     |
| 2. Re-insert coordinate into V_t; Revert player position to p_{t-1}         |
| 3. If B_t was -1, restore B_{t-1} = 0 -> REKINDLE GOAL FLAME (Bi-directional)|
| 4. Assert: has_undone = true                                                |
| 5. THE PRESTIGE PENALTY: 3rd Mastery Star ("Perfect") instantly SHATTERS     |
|    with a crisp glass-break audio crack and evaporates from the HUD.        |
| 6. Player retains full agency to finish run and earn 2 Stars + unlock next! |
+-----------------------------------------------------------------------------+
```

### 4.1 HUD Button & Stack Architecture
*   **Accessibility**: A dedicated, prominent **UNDO button** is permanently anchored on the primary gameplay HUD (top-right corner, touch target $\ge 48\text{px} \times 48\text{px}$).
*   **Stack Policy**: The level history stack $\mathcal{S}$ supports **unlimited step rollback** ($U_{\max} = \infty$) within the active level attempt.
*   **Bi-Directional State Frame ($\Delta_t$)**:
    ```typescript
    interface BiDirectionalStateFrame {
      coordinate: [number, number];          // [x, y] of consumed tile
      step_index: number;                    // Move step t
      entry_vector: [number, number] | null;
      exit_vector: [number, number] | null;
      previous_cell_state: CellState;
      sequence_pointer: number;              // Restores pi(t)
      consumed_subset_delta: number | null;  // Restores S \cap H_t
      budget_delta: number;                  // Restores B_t
    }
    ```
*   **Multi-Tap Rapid Undo Invariant**: If a player rapidly taps Undo during an active visual transition, the engine **instantly snaps** $P_{\text{visual}}$ to the target position ($O(1)$ pop) and cancels in-flight tweens, preventing visual desync or queue corruption.

### 4.2 The Prestige Penalty: The Star Shatter
To maintain elite spatial planning tension without punishing casual players:
1.  **First Undo Execution**: The exact frame Undo is pressed, the engine sets:
    $$\text{has\_undone} \gets \text{True}$$
2.  **Visual & Acoustic Juice**:
    *   The 3rd Mastery Star ("Perfect" keystone) on the HUD visually fractures with sharp fissure decals.
    *   A crisp, high-frequency crystal snap / glass-break sound effect plays.
    *   The star dissolves into glittering dust, replaced by a greyed-out padlock glyph.
3.  **Progression Preserved**: The player is fully permitted to complete the puzzle, earn 2 Stars (Complete + Efficient), and **unlock the next level in the campaign**. Casual mobile players are never stonewalled by a single fat-finger error.

### 4.3 Bi-Directional Goal Rekindling
Because the state machine is strictly bi-directional:
*   If a player overspends their budget ($B_t = -1$), causing the Goal to fracture and extinguish, **tapping Undo pops $\Delta_t$ and restores $B_{t-1} \ge 0$**.
*   The Goal tile immediately **heals its fractures and rekindles its radiant flame** with a warm, rising harmonic audio swell. Recovery is total, tactile, and zero-friction.

---

## 5. DEADLOCK & FAILURE ARCHITECTURE

### 5.1 Two-Tier Failure Taxonomy

#### Tier 1: Soft Deadlock (Global Route Invalidation)
*   **Trigger**: Mandatory targets fall outside the active component ($\mathcal{O}_{t+1} \setminus C_{\text{player}} \neq \emptyset$) OR Spatial Budget exhausted ($B_{t+1} < 0$).
*   **Presentation**:
    1.  Stranded terrain / extinguished goal mutates to `FRACTURED_COLLAPSED`.
    2.  Non-intrusive HUD alert: **"Route Severed — Tap Undo or Retry"**.
    3.  **Full Agency Preserved**: Input is never frozen. The player may undo the fatal step, test their local movement, or hit restart.

#### Tier 2: Hard Deadlock (Terminal Physical Entrapment)
*   **Trigger**: Local exit degree reaches zero ($\operatorname{Deg}_{\text{out}}(p_t) = 0 \land p_t \neq \text{UNLOCKED\_GOAL}$).
*   **Presentation**: Hero collapses into dust; modal focus transfers to instant retry ($R$) or Undo.

### 5.2 Instant Restart Performance Mandate
*   **Target Latency**: $\le 16\text{ms}$ (single display frame tick).
*   **Memory Optimization**: Re-initializes from static level matrix $B_0$ cached in memory; zero heap re-allocation.

---

## 6. MASTERY METRIC FORMULATION & SCORING BANDS

### 6.1 Move Efficiency Delta
Let $M_{\text{actual}}$ be the count of forward moves executed. Let $M_{\text{optimal}}$ be the solver-verified optimal move count.
$$\Delta_M = M_{\text{actual}} - M_{\text{optimal}} \quad (\Delta_M \ge 0)$$

### 6.2 The Three-Star Performance System

```
+-----------------------------------------------------------------------------+
|                           MASTERY PERFORMANCE BANDS                         |
+-----------------------------------------------------------------------------+
| ★☆☆ [TIER 1: COMPLETE]  : Goal reached; Delta_M > k_eff                     |
|                           Unlocks the next level; proves basic solution.    |
|                                                                             |
| ★★☆ [TIER 2: EFFICIENT] : Goal reached; (Delta_M <= k_eff) OR (has_undone)  |
|                           Strong spatial routing; assisted by HUD undo.     |
|                                                                             |
| ★★★ [TIER 3: PERFECT]   : Goal reached; Delta_M = 0 AND NOT has_undone      |
|                           AND B_final >= 0. Flawless unassisted foresight.  |
+-----------------------------------------------------------------------------+
```

*   **Move Counter Purity**: $M_{\text{actual}}$ is never penalized with artificial math (e.g. $+2$ penalties are banned). Move count measures true spatial path length.
*   **Run Isolation**: Restarts completely reset `has_undone` to `false` and restore the 3rd Star to the HUD.

---

## 7. CROSS-GENRE INSPIRATION MATRIX & TACTILE JUICE

To make ONE MORE TILE stand out on YouTube Playables, core mechanics incorporate tactile feedback loops inspired by peer and contrasting genres:

| Game Reference | Design Pillar Borrowed | Implementation in ONE MORE TILE |
| :--- | :--- | :--- |
| **Baba Is You** | Discrete State Rigor & Rhythmic Thud | Deep acoustic "thwomp" on tile step; grid state updates with strict mathematical certainty. |
| **Cosmic Express** | Transparent Constraint Feedback | Live Spatial Budget ($B_t$) on HUD; goal extinguishes the exact moment overspending occurs. |
| **Into the Breach** | High-Stakes Tactical Undo | Single-tap HUD Undo that allows puzzle salvage while cleanly forfeiting elite perfection prestige. |
| **Stephen's Sausage Roll** | Visible Physical Strain | Progressive stress fractures on Goal rim as $B_t \to 0$, giving tactile visual warning before failure. |
| **The Witness** | Runic Path Conduits | Glowing floor tracks ($>4\text{px}$) that pulse light along active checkpoint paths and snap on sequence break. |
| **Superhot** | "Time Moves When You Move" Cadence | Engine is strictly turn-quantized; ambient audio loops subtly rise in pitch during unbroken movement combos. |

---

## 8. SUMMARY SPECIFICATION CHECKSHEET

| Subsystem | Specification Standard | Mathematical Invariant |
| :--- | :--- | :--- |
| **HUD Undo** | Primary HUD Button; Unlimited Rollback | $U_{\max} = \infty$; pops $\Delta_t$ in $O(1)$; cancels mid-animation lerps |
| **Undo Penalty** | 3rd Star Shatters (Glass-Break Audio) | `has_undone = true`; permanently caps attempt at Tier 2 |
| **Spatial Budget** | Live Countdown Ledger on HUD | $B_0 = |V_0| - K$; decrements on non-mandatory tile consumption |
| **Goal Extinction** | Immediate Real-Time Fracture | $B_t = -1 \implies \text{Goal Extinguishes Immediately}$; heals on Undo |
| **Reachability** | Reachability Dominates Objectives | $\text{Reachability}(g \in C_{\text{player}}) \succ U(G_t)$ |
| **Sequence Conduits**| Emissive Floor Lines ($>4\text{px}$) | Pulses toward $c_{\pi+1}$; short-circuits on sequence break |
| **Deadlock Agency** | Soft Deadlock Preserves Movement | No input freeze; visual shatter + non-intrusive HUD alert |
| **Restart Speed** | Single Frame Tick ($<16\text{ms}$) | Restores cached $B_0$; resets $\mathcal{S}$ and `has_undone` |

---

## 9. DOCUMENT SIGN-OFF GATE

This amended chapter represents the production-ready standard for **PASS B: OBJECTIVES & FAILURE**. Code generation remains FROZEN until the Executive Sign-Off Gate is satisfied.

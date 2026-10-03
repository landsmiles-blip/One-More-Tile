---
description: Algorithmic game design, psychological detour trickery, and deterministic solvability invariants for YouTube/viral puzzle gameplay.
globs: ["**/*.html", "**/*.js", "scratch/**"]
---

# YouTube Puzzle Psychology & Route Trickery Invariants

## 1. The Core Solvability-Trickery Duality
- Every level MUST have a 100% verified deterministic victory path.
- The path to the goal MUST NOT be linear or trivial. Obstacles and spatial constraints must force the player to commit to a specific loop or prerequisite obstacle clearance before heading to the goal.

## 2. Psychological Engagement Pillars
- **Siren Trap**: Design layout affordances that tempt intuitive fast moves (System 1) into deadlocks, leaving exactly 1 or 2 tiles stranded.
- **Forced Loop Hurdle**: Players must earn access to the exit by executing a multi-step sequence (switch toggle, crate placement, key acquisition, mirror alignment) that permanently alters the board.
- **Narrow Escape Satisfaction**: When the player solves the detour loop, the path home delivers the cognitive "Aha!" dopamine eureka moment.

## 3. Scope & Non-Regression Guardrails
- Levels 1 to 20 are certified and must remain untouched.
- Difficulty re-engineering and psychological route trickery focus strictly on Levels 21 through 50 across Worlds 5 to 10.

## 4. The Level 36 Golden Benchmark Standard
- **The Empirical Thresholds**:
  - Near-Miss Ratio: $R_{\text{near}} = \frac{N_1 + N_2}{N_{\text{total fails}}} \ge 65.0\%$.
  - Early Deadlock Rate: $R_{\text{early}} = \frac{N_{\text{steps} < 0.30 \times V}}{N_{\text{total fails}}} \le 15.0\%$.
- **The Three-Step Retrograde Engineering Protocol**:
  1. **Anchor & Spine**: Trace the single continuous Hamiltonian path backwards from the Goal Altar to Spawn.
  2. **Terminal Obstacle Placement**: Position the world obstacle (ice slide bank-shot, crate void bridge, rune gate, laser mirror) so that taking the intuitive route without the detour leaves the player stranded directly in front of the altar ($N \le 2$).
  3. **Monte Carlo Certification**: Run 500 simulated games across the 3 human archetypes (Impulsive Rusher, Wall Hugger, Casual Explorer) to certify $R_{\text{near}} \ge 65\%$ and $R_{\text{early}} \le 15\%$ before deployment.

## 5. Formal Mathematical Difficulty Ordering ($D$)
Every level must strictly escalate in difficulty along an ascending staircase:
$$D = \alpha \cdot \log_2(B^L) + \beta \cdot (1 - R_{\text{near}}) + \gamma \cdot C_{\text{mechanics}} + \delta \cdot \Phi_{\text{counter}}$$
Where $B \ge 2.0$ (effective branching), $L$ is par length, $R_{\text{near}} \ge 65\%$ (near-miss retention ratio), and $C_{\text{mechanics}}$ weights interactive cognitive complexity (Ice: 1.2, Crates: 1.5, Polarity: 1.8, Lasers: 2.2, Conveyors: 2.5).


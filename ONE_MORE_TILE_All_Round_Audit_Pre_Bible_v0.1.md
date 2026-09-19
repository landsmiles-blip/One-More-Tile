# ONE MORE TILE — All-Round Game Audit & Pre-Bible Review v0.1

## Purpose

This document is a pre-production audit of ONE MORE TILE before the final detailed Game Design Bible is written. It is not the final game bible and does not attempt to lock unresolved design decisions prematurely.

The purpose is to answer one question:

> **Have we actually thought through the whole game, or are there important systems, risks, or contradictions still hiding underneath the concept?**

The audit separates:
- locked decisions;
- strong recommendations;
- hypotheses that require prototype evidence;
- unresolved questions;
- decisions that should deliberately remain out of scope.

The game's master guideposts are the locked YouTube Playables Portfolio Strategy and the supplied YouTube HTML5 Game Genre Analysis, supplemented by independent research into successful puzzle/system games and current Google Playables documentation.

---

# 1. Executive Verdict

## Current verdict: CONDITIONAL GREENLIGHT

ONE MORE TILE is strong enough to proceed to a real prototype and full systems design, but it is **not yet safe to call a finished game design**.

The concept has a credible strategic position inside the portfolio:

- BRO, YOU'RE COOKED. tests physics, improvisation, spectacle and rescue.
- ONE MORE TILE tests spatial reasoning, planning, irreversible consequence and mastery.

That distinction is strategically useful because the portfolio strategy is explicitly about building reusable mechanical families rather than a pile of unrelated games.

The supplied research favors low-friction mechanics, immediate interaction, spatial consequence, visual clarity, long-session potential and replayability. Its benchmark data reports spatial/merge puzzle at a smaller share than action/physics or arcade, but reports strong session-depth performance for puzzle on comparison platforms. These figures are **signals, not guarantees**.

The independent comparison set reinforces a more important lesson: durable puzzle games often get longevity from a compact ruleset whose interactions generate many situations, rather than from a huge library of unrelated mechanics. Flow Free currently advertises 2,500+ puzzles and multiple modes while maintaining a highly legible core rule; Baba Is You reports 200+ levels built around interacting rules; 2048 demonstrates a tiny state machine can support continued play after the nominal target. 

Therefore the central strategic thesis for ONE MORE TILE is:

> **Keep the input model tiny. Increase the richness of board-state consequences.**

The principal risk remains unchanged:

> **The base mechanic may turn out to be only intellectually neat rather than genuinely compelling.**

That cannot be solved in prose. It must be tested.

---

# 2. Strategic Fit Audit

## 2.1 Portfolio strategy fit — PASS

The locked portfolio strategy requires:

- simple controls;
- difficult decisions rather than complex controls;
- delayed complexity;
- interesting failure;
- visible feedback;
- visible progression;
- genuine rewarded-ad value exchanges;
- reusable production systems;
- originality through combination and execution;
- prototype → measure → kill/deepen.

ONE MORE TILE fits this exceptionally well at the concept level.

## 2.2 Research alignment — PASS, with caution

The supplied research reports:

- low-friction mechanics as favorable;
- strong examples across action/physics, arcade/.io, sports/skill, simulation/tycoon and spatial/merge puzzle;
- strong immediate-feedback behavior among cited titles;
- spatial puzzle session-depth signals on comparison platforms;
- poor fit for deep inventory/strategy-heavy onboarding.

We should use those signals as guideposts, not instructions to copy category winners.

## 2.3 Major strategic concern

The research is much stronger on **platform and genre-level signals** than on evidence that this exact mechanic has product-market fit.

Therefore:

> **Research supports the territory. Prototype data must validate the game.**

---

# 3. Product Identity Audit

## 3.1 Current product definition

**ONE MORE TILE** is a spatial/systemic puzzle game in which the player moves through a tiled environment and permanently consumes the ordinary terrain they use. Every move therefore changes the future state of the board.

The game asks:

> **Where should I move now, knowing that this space will no longer be available later?**

## 3.2 Core fantasy

The player is not primarily escaping enemies, collecting resources or moving through a maze.

The player is:

> **Manipulating a small spatial machine by spending its available space.**

## 3.3 Signature verb

**CONSUME**

Move → consume space → board changes → new decision.

This should remain the conceptual center of the product.

## 3.4 Product differentiation

The current intended differentiation is not “special tiles.” It is the combination:

- directional movement;
- consumable terrain;
- irreversible local state change;
- future-route restriction;
- self-created deadlocks;
- mastery through route efficiency;
- systemic combination later.

This is stronger than a generic “tile maze.”

---

# 4. Core Loop Audit

## Current loop

**Observe → choose direction → move → consume tile → resolve board effects → inspect new state → continue / deadlock → restart or complete.**

## What is strong

- One action is enough to understand the basic interaction.
- Consequences are immediate.
- Failure can be explained by the player's own route.
- Restart can be nearly instantaneous.
- The loop naturally supports mastery.

## What remains unproven

We do not yet know whether the loop produces a strong emotional reaction.

The critical behavioral target is:

> **Failure → understanding → immediate voluntary retry.**

If players fail and simply leave, additional mechanics will not save the concept.

---

# 5. Board Model Audit — MAJOR GAP

This is the most important unresolved system.

The final design must specify:

- rectangular vs irregular boards;
- orthogonal vs diagonal movement;
- adjacency definition;
- walls and voids;
- starting cells;
- goal cells;
- whether consumed cells become absolute void or a distinct state;
- whether pre-existing holes are allowed;
- whether the board can disconnect;
- whether board geometry can dynamically change;
- camera bounds;
- minimum and maximum supported board dimensions.

## Recommendation

Start with **orthogonal movement on a discrete grid**.

Do not add diagonal movement to the core game.

The grid should be explicit and readable.

The first prototype should use mostly rectangular boards with authored irregularity introduced through absent cells/walls, not freeform geometry.

Reason: we want spatial reasoning, not imprecise movement or visual ambiguity.

---

# 6. Movement Model Audit — MAJOR GAP

Recommended atomic model:

> **One valid directional input = one completed move.**

State transition:

`Input → Validate → Move → Consume → Resolve all consequences → Update presentation → Accept next input`

This produces deterministic sequencing and makes the game mentally legible.

## Recommended behavior

- no acceleration;
- no analog movement;
- no simultaneous queued movement in the initial version;
- no timing skill in core mode;
- no action while the board is resolving;
- movement should be visually quick but not instantaneous to the eye.

## Why

The strategic product is planning, not twitch execution.

Adding timing too early would mix skill domains and muddy the identity.

---

# 7. Consumption Model Audit — MAJOR GAP

Strong recommendation:

> An ordinary tile becomes permanently non-traversable after the player completes a move onto it.

Visually, it should leave a subtle state/history imprint rather than becoming visually identical to empty background.

This gives the player a memory of the path they created while preserving the core constraint.

## Critical design distinction

We should not allow ordinary consumed terrain to regenerate in the base game.

Reversibility can become a later system, but it should be earned because it changes the fundamental meaning of “consume.”

---

# 8. Objectives Audit — MAJOR GAP

“Clear the board” is useful as an introduction but should not remain the sole objective forever.

Recommended objective families should be narrow and system-derived:

1. **Reach** — reach the destination under board-state constraints.
2. **Consume** — consume a required region or required cells.
3. **Preserve** — leave specific cells/states intact.
4. **Activate** — trigger a board-state condition before exiting.
5. **Sequence** — perform state changes in an intended order.
6. **Mastery** — solve under a move or structural constraint.

Do not add objective types simply for variety.

Every objective must deepen the central question:

> **How should I spend space?**

---

# 9. Deadlock & Failure Audit — MAJOR

Deadlock is not automatically a problem in this game. It can be the main feedback mechanism.

## Fair deadlock

The player can look back and understand:

> “I spent that space too early.”

## Unfair deadlock

The player could not reasonably know the consequence or the rule was unclear.

## Design rule

Failure must satisfy the puzzle-design contract: the game must give enough information for the player to reason toward the solution rather than merely guessing. This is consistent with broader puzzle-design literature emphasizing a clear goal and sufficient information as part of perceived fairness. citeturn488483search12

## Failure UX

- extremely short failure recognition;
- no punitive waiting;
- immediate retry;
- visually explain the decisive mistake where possible;
- never hide the reason behind a UI wall.

---

# 10. Difficulty Model Audit — MAJOR GAP

Difficulty cannot be “bigger grid = harder.”

We should measure difficulty using multiple variables:

### Solution length
How many moves are required in an optimal solution?

### Branching factor
How many plausible choices exist at decision points?

### Wrong-path density
How many apparently viable paths lead to deadlock?

### Recovery tolerance
Can a mistake be recovered from, or is the puzzle immediately dead?

### State interaction depth
How many consequences must the player mentally chain?

### Information density
How much rule/state information is visible at once?

### Solution multiplicity
How many valid solutions exist?

### Optimality gap
How different is the easiest-to-discover solution from the optimal one?

The final game should use a difficulty vector, not a single level number.

---

# 11. Level Grammar Audit — MAJOR GAP

We need a formal authoring vocabulary.

Initial archetypes:

- **Corridor** — order and route.
- **Fork** — mutually exclusive route decisions.
- **Return** — preserve access for a later return.
- **Sacrifice** — deliberately consume an area to make another route possible.
- **False Door** — tempting route that creates future failure.
- **Trigger** — one move alters another region.
- **Collapse** — removal changes structural topology.
- **Chain** — several state transitions must happen in sequence.
- **Efficiency** — several solutions exist; mastery rewards economy.
- **Constraint** — a familiar puzzle with one additional condition.

The important point is that a level should be tagged by the **decision it trains**, not merely by the objects it contains.

---

# 12. Content Progression Audit

Recommended progression grammar:

**Teach → Apply → Combine → Twist → Master → Remix**

Avoid introducing a new mechanic every world simply because the player expects “something new.”

A mechanic can stay interesting by changing its relationship to other mechanics.

This matches successful systemic puzzle patterns: Baba Is You explicitly describes 200+ levels built by experimenting with a compact set of mechanics and interactions. citeturn889349search7

Flow Free provides the clearest commercial example of a compact core rule producing very large content volume: the current Google Play listing advertises 2,500+ puzzles, multiple play modes, clean colorful presentation, and 100M+ downloads. citeturn889349search3

---

# 13. Campaign Structure Audit — MAJOR GAP

Still unresolved:

- linear progression vs map;
- regional hubs vs simple sequence;
- unlock conditions;
- how mastery affects progression;
- how many puzzles belong in each teaching block;
- when advanced rules are introduced;
- when the campaign stops teaching and becomes mastery.

Recommendation for first release:

> **Simple linear progression first.**

A richer world-map structure can be layered on only when content volume justifies it.

Do not build a complicated progression wrapper around an unproven puzzle system.

---

# 14. Session Architecture Audit — MAJOR GAP

The game needs a natural session rhythm.

Recommended structure:

`Launch → immediate play → short teaching set → growing challenge → meaningful completion break → optional continue`

The game should support long sessions without requiring the player to commit to one giant uninterrupted run.

This aligns with the supplied research's puzzle-session depth signal, but we should treat the benchmark as a design target rather than a guarantee. The research reports roughly 21-minute average puzzle sessions on the cited CrazyGames data. fileciteturn5file2L289-L296

---

# 15. Mastery & Scoring Audit — MAJOR GAP

Recommendation:

## Primary mastery metric: moves

Not time in the core game.

Why:

- reinforces planning;
- gives a clean measure of efficiency;
- does not punish thoughtful players for thinking;
- works with deterministic puzzle solving;
- can be used by the solver.

Potential result bands:

- **Complete** — solved.
- **Efficient** — within a defined move band.
- **Perfect** — meets optimal or special condition.

Avoid visible overcomplicated numerical scoring in the early experience.

---

# 16. Undo Audit — UNRESOLVED / HIGH IMPACT

Undo fundamentally changes the meaning of irreversible movement.

### No undo
Maximum consequence, higher frustration.

### Unlimited undo
Lower frustration, but weaker planning tension.

### Limited undo
Potential compromise.

### Rewarded undo
Potential monetization value exchange.

Recommendation:

> **Do not put unlimited undo in the core prototype.**

First prove the game without it.

Then test limited and rewarded rescue versions against the behavioral data.

---

# 17. Procedural Generation Audit — MAJOR FUTURE SYSTEM

Procedural content should be treated as a **content-generation pipeline**, not a randomizer.

Required stages:

`Generate → Solve → Score → Reject weak boards → Human review → Package`

The solver should calculate:

- solvability;
- optimal move count;
- solution count;
- deadlock density;
- path characteristics;
- intended difficulty.

Procedural generation should not ship until authored puzzles reveal a stable design grammar that can be formalized.

---

# 18. Endless Mode Audit

Endless mode is strategically attractive but should be later.

Good precedent exists for the idea of continuing beyond a nominal target: 2048 can continue after reaching 2048 rather than treating the nominal win as the final state. citeturn488483search1

However, ONE MORE TILE should not simply turn campaign levels into an endless list.

Potential endless structure:

- generated board;
- increasing systemic difficulty;
- run score / max depth;
- instant retry;
- no long meta-game.

This can become an excellent retention layer if the base system proves elastic.

---

# 19. Visual System Audit — PASS

The visual system is sufficiently developed for the bible.

Core visual thesis:

> **Calm enough to think; responsive enough to feel.**

Principles:

- cool restrained base;
- stronger accent only when information deserves attention;
- gold for reward/mastery;
- red for rare warnings/critical states;
- pattern and shape as redundant information channels;
- motion as state/causal information;
- consumed tiles leave visual history;
- board is the protagonist;
- no rainbow overload.

The visual system should serve cognition first and beauty second—not because beauty is unimportant, but because in a spatial puzzle the visual language is part of the interface.

---

# 20. Accessibility Audit

Current principle:

> **No important state should depend on color alone.**

Use combinations of:

- hue;
- lightness;
- pattern;
- shape;
- movement;
- symbols.

Google currently recommends a best effort toward WCAG AA and supports accessibility tags for Playables discovery; tags must accurately represent functionality. citeturn439223search1

Final bible must include:

- color-independent state encoding;
- contrast targets;
- touch target standards;
- readable text;
- reduced-motion consideration;
- audio-independent gameplay.

---

# 21. UX Audit — MAJOR GAP

The complete player journey is not yet specified.

Need to define:

### Launch
What appears before interaction?

### First interaction
What does the player learn without a tutorial wall?

### First completion
What feedback is delivered?

### Retry
How fast is restart?

### Progression
What appears between puzzles?

### Returning player
Where does save state return them?

### Pause/resize
Does the game preserve the board exactly?

This needs to be written as a flow, not scattered rules.

---

# 22. Technical Architecture Audit

Strong architectural direction:

- HTML5/Canvas/WebGL;
- deterministic state machine;
- data-driven puzzle definitions;
- compact content schema;
- minimal asset dependency;
- reusable puzzle renderer;
- solver as a separate tool/system;
- Playables SDK integration layer.

Current Google Playables stability guidance says the initial bundle MUST be under 30 MiB and SHOULD be under 15 MiB; total bundle is normally under 250 MiB; individual files should be under 30 MiB and ideally under 512 KiB; saved game state must stay under 3 MiB and is recommended under 500 KiB; games should become interactive in under about 5 seconds. citeturn439223search2

This strongly supports the data-driven approach.

---

# 23. Save / Progress Audit

Need to define saved state for:

- unlocked progress;
- completion status;
- mastery/best moves;
- challenge completion;
- endless records;
- settings.

Current Playables requirements make save architecture a real product concern, not a later convenience.

The save schema should remain compact and versioned.

---

# 24. Monetization Audit

Core principle:

> **Monetization must not interrupt thought.**

Potential rewarded value:

- hint;
- limited undo;
- reveal useful information;
- controlled rescue.

Interstitials should only occur at natural breaks and must never become the primary pacing mechanism.

Google currently allows YouTube-provided in-game advertising capabilities but prohibits external monetization services; the exact current platform monetization setup must be implemented from the official SDK/portal requirements rather than assumed from generic mobile-game practice. citeturn889349search12

Do not build the product assuming universal revenue-sharing access.

---

# 25. Audio Audit — UNDERDESIGNED

Need a formal audio language.

Recommended concept:

> **tactile, intelligent, minimal, mechanical.**

Key events:

- movement;
- tile consumption;
- state activation;
- danger;
- goal;
- completion;
- mastery.

Sound should reinforce visual state without becoming dependent on audio.

---

# 26. Discovery / Packaging Audit — UNDERDESIGNED

We need later:

- title treatment;
- icon/thumbnail logic;
- first-frame composition;
- short description;
- screenshot language;
- visual hook.

This is strategically important because a good core loop still needs a strong click/entry proposition.

Current Playables requirements also prohibit misleading thumbnails or metadata. citeturn439223search0

---

# 27. Originality Audit

Current Playables policy explicitly prohibits duplicate or substantially identical Playables and requires original/authorized/licensed content. This policy was added to the revision history on August 25, 2026. citeturn439223search4turn439223search0

Our originality claim currently rests on:

> consumable terrain + directional planning + board-state transformation + self-created constraints + mastery.

Before release we should perform a final comparable-game similarity check.

Do not use this exact combination of terminology, visual identity or content packaging to suggest that we are merely cloning a known puzzle.

---

# 28. QA Audit — MAJOR GAP

We need five QA layers:

### Functional
Does the game work?

### Puzzle
Is every intended puzzle solvable?

### Fairness
Does the player have the information needed?

### Difficulty
Does the puzzle belong at its intended progression point?

### Platform
Does the game satisfy Playables behaviour and certification requirements?

The game should eventually have automated regression tests around the state machine and solver.

---

# 29. Product Metrics Audit — MAJOR GAP

Metrics should answer behavioral questions, not generate dashboard vanity.

Core measures:

- time-to-first-input;
- first-puzzle completion;
- failure-to-retry rate;
- puzzle-to-puzzle continuation;
- early abandonment;
- average puzzles per session;
- best-move pursuit / mastery rate;
- hint usage;
- progression drop-off;
- return behavior where platform measurement makes it available.

The primary prototype question is:

> **Do failures create another attempt?**

If not, stop.

---

# 30. Playables Certification Audit

Current requirements relevant to this product include:

- suitable general audience 13+;
- no kids-specific targeting;
- original/cleared assets and content;
- no substantially identical Playable;
- accessibility best effort;
- responsive design;
- correct pause/mute behavior;
- stable interaction;
- package-size constraints;
- SDK integration;
- appropriate monetization integration.

The current Google revision history confirms that duplicate-content policy and accessibility discovery tags were updated in August 2026. citeturn439223search4

---

# 31. Portfolio Reuse Audit

ONE MORE TILE should produce reusable infrastructure, not just one title.

Potential reusable technology family:

## Spatial System Engine

- grid state;
- movement resolver;
- tile state machine;
- objective system;
- level schema;
- solver;
- hint system;
- mastery evaluator;
- procedural generation pipeline;
- compact save format;
- Playables wrapper.

This could later power other spatial games.

The production-machine goal is therefore strengthened.

---

# 32. What We Should NOT Add Yet

Do not add without evidence:

- combat;
- character stats;
- inventory;
- crafting;
- currency systems;
- complicated story;
- enemies with AI;
- multiplayer;
- giant upgrade trees;
- elaborate roguelite progression;
- daily events;
- cosmetic economies;
- twenty special tile types.

These are not forbidden forever. They are forbidden from entering the core before the core earns them.

---

# 33. Pre-Bible Decision Matrix

## LOCK NOW

- Core premise: consume the space you use.
- Primary skill: spatial planning.
- Directional discrete movement.
- Permanent consequence in the core loop.
- Deterministic resolution.
- Instant retry.
- Small ruleset / deep interactions.
- Visual hierarchy and semantic color/pattern system.
- Lightweight data-driven architecture.
- Campaign + eventual mastery/challenge + eventual endless architecture.
- Playables-first constraints.

## STRONGLY RECOMMENDED BUT PROTOTYPE-VALIDATE

- no diagonal movement;
- one atomic move per input;
- consumed tile becomes impassable;
- moves as primary mastery metric;
- no timing pressure in core mode;
- limited/rewarded undo rather than unlimited undo;
- linear first campaign;
- abstract player marker;
- board-reactive systems as the major source of later complexity.

## OPEN DESIGN WORK

1. Exact board model.
2. Exact movement/transition semantics.
3. Objective grammar.
4. Difficulty model.
5. Level grammar.
6. Campaign structure.
7. Session structure.
8. Mastery/scoring details.
9. Undo rules.
10. Procedural-generation architecture.
11. Full UX flow.
12. Audio language.
13. Final technical/save schema.
14. QA methodology.
15. Product metric instrumentation/available platform measurement.
16. Discovery packaging.

---

# 34. Recommended Next Design Sequence

The final Game Design Bible should be written only after the following sequence is completed:

### PASS A — BOARD & MOVEMENT

Define the state machine and physical/logical board model.

### PASS B — OBJECTIVES & FAILURE

Define exactly what constitutes success, failure, deadlock and recovery.

### PASS C — LEVEL GRAMMAR & DIFFICULTY

Define how good puzzles are authored and evaluated.

### PASS D — PROGRESSION & SESSION

Define campaign structure, mastery, challenges and long-term continuation.

### PASS E — CONTENT ENGINE

Define data schema, solver, generator and human-curation pipeline.

### PASS F — UX / ART / AUDIO / MONETIZATION

Combine already-established visual design with the finalized game system.

### PASS G — PLATFORM / TECH / QA

Specify implementation, save, SDK, performance, accessibility, certification and testing.

### PASS H — FINAL ADVERSARIAL REVIEW

Attempt to break the entire design before committing it to the final bible.

---

# 35. Final Audit Conclusion

The game is not ready for the final detailed Markdown yet.

That is not a failure. It is exactly what the audit was supposed to find.

We have already solved the highest-level questions of:

- strategic role;
- core identity;
- portfolio differentiation;
- visual identity;
- central design philosophy;
- retention philosophy;
- long-term content philosophy;
- Playables fit.

We have **not** yet solved the engine-level questions that determine whether those ideas produce a great puzzle game:

> **What exactly is a move?**

> **What exactly is the board?**

> **What exactly can change?**

> **What exactly counts as a good puzzle?**

> **How does difficulty rise?**

> **How does the player progress for 100s of puzzles without feeling they are doing chores?**

Those are the decisions we need next.

The correct next step is therefore **not another broad brainstorm**.

It is a rigorous systems-design pass starting with **BOARD + MOVEMENT**, followed by OBJECTIVES + FAILURE, then LEVEL GRAMMAR + DIFFICULTY.

Only after those are stable should the full Game Design Bible be written.

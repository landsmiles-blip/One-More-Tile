---
description: Cultural symbol rendering philosophy, ambient bioluminescent aesthetic principles, and strict non-regression engineering rules.
globs: ["**/*.html", "**/*.css", "**/*.js"]
---

# Cultural Rendering, Bioluminescent Aesthetics & Non-Regression Invariants

## 1. Aesthetic Compensation Principle ("Do Not Force Art or Precision")
- **Core Philosophy**: "Do not force the art, do not force the precision. All we want is the shapes and arts of the different cultures and civilizations represented in the different worlds in the game. What coding cannot achieve, compensate with colors, shapes, and design of the whole game layout."
- **Execution Standards**:
  - Render recognizable iconic silhouettes and geometric motifs of each civilization (Mayan stelae, Egyptian Ankh/Scarab, Babylonian Ishtar star, Roman Aquila/Wreath, Japanese Mon/Torii, Viking Vegvisir/Valknut, Aztec Sun Stone, Persian Faravahar/Muqarnas, Greek Meander/Parthenon).
  - Use HTML5 Canvas vector primitives (`arc`, `bezierCurveTo`, `quadraticCurveTo`, `lineTo`) with dynamic bioluminescent glow (`ctx.shadowBlur = 12..18`, breathing sine-wave pulse `rgba(..., pulse)`).
  - Keep motifs translucent, ambient, and non-intrusive (alpha 0.15–0.45) so they float majestically in the empty canvas margins without competing with puzzle readability.

## 2. Zero-Regression Core & Strict Scope Guardrail
- **Absolute Preservation Rule**: Never mutate, delete, or scramble verified gameplay systems:
  - All 50 level topologies, Hamiltonian clear-all constraints, and BFS spatial budgets.
  - The 3-Block minimal HUD layout (`.hud-block-left`, `.hud-block-center`, `.hud-block-right`).
  - The 5-Life economy, 3-Undo limit, ad-reward modals, and 60FPS Web Audio synthesis.
- Any change that has NOT been explicitly requested by the user must remain 100% untouched.

## 3. UI Layout & Viewport Containment Hygiene
- All modal overlays MUST use `.modal-overlay` with `position: absolute; inset: 0; opacity: 0; pointer-events: none; z-index: 120;`.
- On desktop viewports (`min-width: 481px`), body padding MUST be at least `16px` and `#app-shell` height clamped to `min(94vh, 860px)` to prevent top edge clipping.
- In-game tutorial bubbles MUST be floating, non-blocking, and dismiss on first touch or swipe.

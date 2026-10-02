---
description: Universal CSS modal overlay positioning, desktop viewport containment, and strict feature scope preservation.
globs: ["**/*.html", "**/*.css", "**/*.js"]
---

# UI Layout, Modal Hygiene & Scope Preservation Invariants

## 1. Universal Class-Based Modal Overlays
- Every modal overlay MUST use the class `.modal-overlay`.
- In CSS, `.modal-overlay` MUST unconditionally define:
  ```css
  .modal-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 11, 16, 0.88);
    backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 120;
  }
  .modal-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
  ```
- NEVER use ID-only selectors (e.g. `#modal-overlay`) to define overlay layout.
- Every modal transition into gameplay (`loadLevel()`, `resetDOMState()`) MUST dismiss all modal overlays.

## 2. Desktop Shell Viewport Containment
- Mobile shells (`#app-shell`) on desktop viewports (`min-width: 481px`) MUST:
  1. Have an explicit outer viewport buffer: `body { padding: 16px; }`.
  2. Use clamped viewport height: `height: min(94vh, 860px); max-height: 860px;`.
  3. NEVER use unpadded `height: 100%` on desktop to prevent clipping rounded borders and glows against browser toolbars.

## 3. Strict Scope Preservation
- Unless explicitly requested by the user, all previously certified levels, mechanics, economies, and UI components must remain 100% untouched.

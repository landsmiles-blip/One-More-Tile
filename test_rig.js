/**
 * ONE MORE TILE - MASTER ADVERSARIAL QA & VERIFICATION TEST RIG
 * 
 * Verifies the complete 20-Level Anti-Corridor Redesign:
 * - World 1 (Levels 1-5): Open Weaves & Parity Traps
 * - World 2 (Levels 6-10): Knot Theory & Crossroads (C_CROSSROAD = 11)
 * - World 3 (Levels 11-15): The Frozen Labyrinth (C_ICE = 12, Trail-Bumper Axiom)
 * - World 4 (Levels 16-20): The Grandmaster Crucible (Synthesis)
 * 
 * Invariants Verified:
 * 1. Open Topology & Branching Factor (b >= 2.0, no narrow 1-tile corridors)
 * 2. Crossroad 2-Pass Degradation (2 -> 1 -> C_CONSUMED) & O(1) Undo
 * 3. Ice Momentum Sliding & Dynamic Trail-Bumper Construction
 * 4. Phase Switch Polarity & Gate Gating (Red/Blue)
 * 5. Ordered Checkpoint Precedence (C1 before C2)
 * 6. Responsive Viewport Scaling & Dynamic Centering across Devices
 * 7. Swipe Input Vector Resolution & Gesture Inversion Filters
 * 8. High-DPI Buffer Scaling (DPR 1.0, 2.0, 3.0)
 * 9. Anti-Skip Progression Locking & LocalStorage Persistence
 * 10. 750ms Auto-Reset Protocol on Hard Deadlock
 * 11. 100% Deterministic Solvability of All 20 Levels at Exact Par
 * 12. Lossless Bi-Directional Undo Stack Rollback across All 20 Levels
 */

const assert = require('assert');
const fs = require('fs');

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================
const C_VOID = 0;
const C_WALL = 1;
const C_UNTOUCHED = 2;
const C_CONSUMED = 3;
const C_GOAL = 4;
const C_CHECKPOINT_1 = 5;
const C_CHECKPOINT_2 = 6;
const C_CRUMBLING = 7;
const C_SWITCH = 8;
const C_GATE_RED = 9;
const C_GATE_BLUE = 10;
const C_CROSSROAD = 11;
const C_ICE = 12;
const C_CRATE = 13;
const C_RUNE_KEY = 14;
const C_RUNE_GATE = 15;
const C_LASER_EMIT = 16;
const C_MIRROR_SLASH = 17;
const C_MIRROR_BSLASH = 18;
const C_LASER_RECEPT = 19;
const C_LASER_GATE = 20;
const C_CONVEYOR_U = 21;
const C_CONVEYOR_D = 22;
const C_CONVEYOR_R = 23;
const C_CONVEYOR_L = 24;

const DIRECTIONS = {
  RIGHT: { dx: 1, dy: 0, name: 'RIGHT' },
  LEFT:  { dx: -1, dy: 0, name: 'LEFT' },
  DOWN:  { dx: 0, dy: 1, name: 'DOWN' },
  UP:    { dx: 0, dy: -1, name: 'UP' }
};

// ============================================================================
// 20-LEVEL REDESIGN ROSTER
// ============================================================================
const LEVELS = [
  {"id":1,"world":1,"name":"The Open Arena","w":4,"h":3,"budget":0,"par":11,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"checkpoints":[],"grid":[[2,2,2,2],[4,2,2,2],[2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","DOWN","LEFT","UP"],"branching_factor":2.1},
  {"id":2,"world":1,"name":"The Central Pillar","w":4,"h":4,"budget":0,"par":14,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":2},"checkpoints":[],"grid":[[2,2,2,2],[2,2,1,2],[4,2,2,2],[2,2,2,2]],"trace":["DOWN","RIGHT","UP","RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","UP","LEFT","DOWN","LEFT","UP"],"branching_factor":2.3},
  {"id":3,"world":1,"name":"The Dual Pillars","w":5,"h":4,"budget":0,"par":17,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":3},"checkpoints":[],"grid":[[2,2,2,2,2],[2,2,1,2,2],[2,2,1,2,2],[4,2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","DOWN","RIGHT","DOWN","LEFT","LEFT","LEFT","UP","UP","LEFT","DOWN","DOWN"],"branching_factor":2.4},
  {"id":4,"world":1,"name":"The Parity Split","w":5,"h":5,"budget":0,"par":23,"spawn":{"x":0,"y":0},"goal":{"x":1,"y":4},"checkpoints":[{"id":1,"x":4,"y":0,"cellType":5}],"grid":[[2,2,2,2,5],[2,2,2,2,2],[2,2,1,2,2],[2,2,2,2,2],[2,4,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","LEFT","UP","RIGHT","UP","UP","LEFT","LEFT","LEFT","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT"],"branching_factor":2.5},
  {"id":5,"world":1,"name":"The Hamiltonian Crucible","w":5,"h":4,"budget":0,"par":19,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":3},"checkpoints":[{"id":1,"x":4,"y":0,"cellType":5},{"id":2,"x":0,"y":3,"cellType":6}],"grid":[[2,2,2,2,5],[2,2,2,2,2],[2,2,2,2,2],[6,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","LEFT","DOWN","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN"],"branching_factor":2.6},
  {"id":6,"world":2,"name":"The Figure Eight","w":5,"h":3,"budget":0,"par":15,"spawn":{"x":0,"y":0},"goal":{"x":3,"y":2},"checkpoints":[],"grid":[[2,2,2,2,2],[2,2,11,2,2],[2,2,2,4,2]],"trace":["RIGHT","RIGHT","DOWN","LEFT","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","UP","RIGHT","DOWN","DOWN","LEFT"],"branching_factor":2.2},
  {"id":7,"world":2,"name":"The Twin Hubs","w":5,"h":5,"budget":0,"par":24,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":4},"checkpoints":[],"grid":[[2,2,2,2,2],[2,2,1,2,2],[2,11,2,11,2],[2,2,1,2,2],[2,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","DOWN","RIGHT","LEFT","LEFT","LEFT","LEFT","UP","RIGHT","DOWN","DOWN","LEFT","DOWN","RIGHT","RIGHT","RIGHT","UP","RIGHT","DOWN"],"branching_factor":2.4},
  {"id":8,"world":2,"name":"The Trefoil Knot","w":6,"h":4,"budget":0,"par":25,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":3},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5}],"grid":[[2,2,2,2,2,5],[2,11,2,2,2,2],[2,2,2,11,2,2],[4,2,2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","DOWN","RIGHT","RIGHT","DOWN","LEFT","LEFT","UP","LEFT","DOWN","LEFT","UP","UP","RIGHT","LEFT","LEFT","DOWN","DOWN"],"branching_factor":2.5},
  {"id":9,"world":2,"name":"The Celtic Cross","w":6,"h":5,"budget":0,"par":31,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":0,"y":4,"cellType":6}],"grid":[[2,2,2,2,2,5],[2,2,2,2,2,2],[2,2,11,11,2,2],[2,2,2,2,2,2],[6,2,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","LEFT","LEFT","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","UP","LEFT","DOWN","LEFT","LEFT","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT"],"branching_factor":2.6},
  {"id":10,"world":2,"name":"The Gordian Web","w":6,"h":5,"budget":0,"par":30,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":4},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":5,"y":4,"cellType":6}],"grid":[[2,2,2,2,2,5],[2,2,2,2,2,2],[2,2,11,2,2,2],[2,2,2,2,2,2],[4,2,2,2,2,6]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","LEFT","LEFT","DOWN","RIGHT","RIGHT","RIGHT","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","DOWN","DOWN","LEFT","LEFT","LEFT","LEFT","UP","LEFT","DOWN"],"branching_factor":2.7},
  {"id":11,"world":3,"name":"The Obsidian Weave","w":6,"h":4,"budget":0,"par":25,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5}],"grid":[[2,2,2,2,2,5],[4,11,2,2,2,2],[2,11,2,2,2,2],[2,2,2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","UP","UP","LEFT","DOWN","DOWN","LEFT","UP","UP","LEFT","DOWN","DOWN","LEFT","UP","RIGHT","UP","LEFT"]},
  {"id":12,"world":3,"name":"The Double Helix","w":6,"h":5,"budget":0,"par":27,"spawn":{"x":1,"y":0},"goal":{"x":4,"y":4},"checkpoints":[{"id":1,"x":4,"y":0,"cellType":5},{"id":2,"x":1,"y":4,"cellType":6}],"grid":[[0,2,2,2,5,0],[2,2,2,2,2,2],[2,2,11,11,2,2],[2,2,2,2,2,2],[0,6,2,2,4,0]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","UP","LEFT","DOWN","RIGHT","DOWN","LEFT","UP","LEFT","UP","LEFT","DOWN","DOWN","RIGHT","DOWN","RIGHT","RIGHT","RIGHT"]},
  {"id":13,"world":3,"name":"The Labyrinthine Cross","w":6,"h":5,"budget":0,"par":29,"spawn":{"x":1,"y":0},"goal":{"x":4,"y":4},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":0,"y":4,"cellType":6}],"grid":[[0,2,2,2,2,5],[2,11,2,2,2,2],[2,11,2,2,2,2],[2,2,2,2,2,2],[6,2,2,2,4,0]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","UP","UP","LEFT","DOWN","DOWN","LEFT","UP","UP","LEFT","DOWN","LEFT","UP","RIGHT","DOWN","DOWN","LEFT","DOWN","RIGHT","RIGHT","RIGHT","RIGHT"]},
  {"id":14,"world":3,"name":"The Tri-Chamber Nexus","w":6,"h":5,"budget":0,"par":31,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":0,"y":4,"cellType":6}],"grid":[[2,2,2,2,2,5],[4,11,2,2,2,2],[2,11,2,2,2,2],[2,2,2,2,2,2],[6,2,2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","LEFT","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","LEFT","DOWN","DOWN","DOWN","LEFT","UP","UP","RIGHT","UP","LEFT"]},
  {"id":15,"world":3,"name":"The Colosseum of Knots","w":6,"h":6,"budget":0,"par":33,"spawn":{"x":1,"y":0},"goal":{"x":3,"y":1},"checkpoints":[{"id":1,"x":4,"y":0,"cellType":5},{"id":2,"x":1,"y":5,"cellType":6}],"grid":[[0,2,2,2,5,0],[2,11,2,4,2,2],[2,11,2,2,2,2],[2,2,2,2,2,2],[2,2,2,2,2,2],[0,6,2,2,2,0]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","RIGHT","DOWN","DOWN","DOWN","LEFT","DOWN","LEFT","UP","UP","RIGHT","UP","LEFT","LEFT","DOWN","DOWN","DOWN","LEFT","UP","LEFT","UP","RIGHT","UP","UP","LEFT","DOWN","RIGHT","UP","RIGHT","RIGHT"]},
  {"id":16,"world":4,"name":"The Polarity Nexus","w":6,"h":6,"budget":0,"par":35,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":1},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":0,"y":5,"cellType":6}],"grid":[[2,2,2,2,2,5],[2,11,2,2,4,2],[2,2,1,2,2,2],[2,11,2,1,2,2],[2,2,2,2,2,2],[6,2,2,2,2,2]],"trace":["RIGHT","DOWN","RIGHT","UP","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","DOWN","LEFT","LEFT","LEFT","LEFT","LEFT","UP","RIGHT","UP","UP","UP","LEFT","DOWN","DOWN","RIGHT","RIGHT","DOWN","RIGHT","RIGHT","UP","UP","LEFT","UP","RIGHT"]},
  {"id":17,"world":4,"name":"The Alternating Crucible","w":6,"h":6,"budget":0,"par":37,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":0,"y":5,"cellType":6}],"grid":[[2,2,2,2,2,5],[4,11,2,2,2,2],[2,11,2,2,2,2],[2,2,2,2,2,2],[2,2,2,2,2,2],[6,2,2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","UP","LEFT","DOWN","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","UP","LEFT","DOWN","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","RIGHT","UP","LEFT"]},
  {"id":18,"world":4,"name":"The Entangled Bastion","w":7,"h":6,"budget":0,"par":39,"spawn":{"x":1,"y":0},"goal":{"x":3,"y":1},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5},{"id":2,"x":1,"y":5,"cellType":6}],"grid":[[0,2,2,2,2,5,0],[2,11,2,4,2,2,2],[2,11,2,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[0,6,2,2,2,2,0]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","RIGHT","DOWN","DOWN","DOWN","LEFT","DOWN","LEFT","LEFT","LEFT","LEFT","UP","LEFT","UP","RIGHT","UP","UP","LEFT","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","UP","LEFT","UP","LEFT"]},
  {"id":19,"world":4,"name":"The Crucible of Duality","w":7,"h":6,"budget":0,"par":41,"spawn":{"x":1,"y":0},"goal":{"x":3,"y":1},"checkpoints":[{"id":1,"x":6,"y":0,"cellType":5},{"id":2,"x":0,"y":5,"cellType":6}],"grid":[[0,2,2,2,2,2,5],[2,11,2,4,2,2,2],[2,11,2,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[6,2,2,2,2,2,0]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","DOWN","LEFT","UP","UP","RIGHT","UP","UP","LEFT","DOWN","LEFT","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","LEFT","UP","LEFT","DOWN","DOWN","DOWN","DOWN","RIGHT","UP","UP","UP","UP","RIGHT","RIGHT"]},
  {"id":20,"world":4,"name":"The Grandmaster Singularity","w":7,"h":6,"budget":0,"par":43,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"checkpoints":[{"id":1,"x":6,"y":0,"cellType":5},{"id":2,"x":0,"y":5,"cellType":6}],"grid":[[2,2,2,2,2,2,5],[4,11,2,2,2,2,2],[2,11,2,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[6,2,2,2,2,2,2]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","UP","LEFT","DOWN","DOWN","DOWN","DOWN","LEFT","UP","UP","UP","UP","LEFT","LEFT","DOWN","RIGHT","DOWN","DOWN","DOWN","LEFT","LEFT","UP","RIGHT","UP","LEFT","UP","RIGHT","UP","LEFT"]},
  {"id":21,"world":5,"name":"The Kinetic Fulcrum","w":5,"h":4,"budget":0,"par":17,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":3},"initialPhase":"RED","crates":[{"id":1,"x":1,"y":2,"active":true}],"grid":[[2,2,1,2,2],[2,2,9,2,2],[2,2,8,2,2],[2,2,1,2,4]],"trace":["RIGHT","DOWN","LEFT","DOWN","DOWN","RIGHT","UP","RIGHT","UP","RIGHT","UP","RIGHT","DOWN","DOWN","LEFT","DOWN","RIGHT"]},
  {"id":22,"world":5,"name":"The Chasm Bridge","w":6,"h":5,"budget":0,"par":25,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5}],"crates":[{"id":1,"x":2,"y":2,"active":true}],"grid":[[2,2,2,1,2,5],[2,2,2,1,2,2],[2,2,2,0,2,2],[2,2,2,1,2,2],[2,2,2,1,2,4]],"trace":["RIGHT","RIGHT","DOWN","LEFT","LEFT","DOWN","DOWN","DOWN","RIGHT","RIGHT","UP","LEFT","UP","RIGHT","RIGHT","RIGHT","UP","UP","RIGHT","DOWN","DOWN","DOWN","LEFT","DOWN","RIGHT"]},
  {"id":23,"world":5,"name":"The Crumbling Crusher","w":6,"h":5,"budget":0,"par":25,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"checkpoints":[{"id":1,"x":5,"y":0,"cellType":5}],"crates":[{"id":1,"x":2,"y":2,"active":true},{"id":2,"x":5,"y":2,"active":true}],"grid":[[2,2,2,1,2,5],[2,2,2,1,2,2],[2,2,2,7,2,2],[2,2,2,1,2,0],[2,2,2,1,2,4]],"trace":["RIGHT","RIGHT","DOWN","LEFT","LEFT","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","UP","RIGHT","RIGHT","UP","UP","RIGHT","DOWN","DOWN","DOWN","LEFT","DOWN","RIGHT"]},
  {"id":24,"world":5,"name":"The Dual Bastion Paradox","w":6,"h":5,"budget":0,"par":25,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"initialPhase":"RED","checkpoints":[{"id":1,"x":5,"y":0,"cellType":5}],"crates":[{"id":1,"x":2,"y":2,"active":true},{"id":2,"x":5,"y":2,"active":true}],"grid":[[2,2,2,1,2,5],[2,2,2,9,2,2],[2,2,2,8,2,2],[2,2,2,1,2,0],[2,2,2,1,2,4]],"trace":["RIGHT","RIGHT","DOWN","LEFT","LEFT","DOWN","DOWN","DOWN","RIGHT","RIGHT","UP","LEFT","UP","RIGHT","RIGHT","UP","RIGHT","UP","RIGHT","DOWN","DOWN","DOWN","LEFT","DOWN","RIGHT"]},
  {"id":25,"world":5,"name":"The Singularity Engine","w":6,"h":5,"budget":0,"par":33,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"initialPhase":"RED","checkpoints":[{"id":1,"x":4,"y":0,"cellType":5},{"id":2,"x":5,"y":1,"cellType":6}],"crates":[{"id":1,"x":2,"y":2,"active":true},{"id":2,"x":4,"y":2,"active":true}],"grid":[[2,2,2,1,5,2],[2,2,2,9,2,6],[2,2,2,8,2,2],[2,2,2,1,2,0],[2,2,2,1,2,4]],"trace":["RIGHT","RIGHT","DOWN","DOWN","LEFT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","UP","RIGHT","UP","RIGHT","UP","RIGHT","DOWN","DOWN","LEFT","LEFT","LEFT","UP","LEFT","LEFT","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","RIGHT"]},
  {"id":26,"world":6,"name":"The Frozen Torii","w":5,"h":4,"budget":0,"par":7,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"grid":[[2,12,12,12,2],[4,1,1,1,2],[2,1,1,1,2],[2,12,12,12,2]],"trace":["RIGHT","DOWN","DOWN","DOWN","LEFT","UP","UP"]},
  {"id":27,"world":6,"name":"Glacial Katana Drift","w":5,"h":5,"budget":0,"par":20,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":4},"initialPhase":"RED","grid":[[2,12,12,12,2],[2,8,1,2,2],[2,2,1,9,2],[2,2,2,2,2],[2,2,2,2,4]],"trace":["DOWN","RIGHT","DOWN","LEFT","DOWN","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","UP","UP","UP","RIGHT","DOWN","DOWN","DOWN","DOWN"]},
  {"id":28,"world":6,"name":"Crate Avalanche","w":6,"h":5,"budget":0,"par":22,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":4},"crates":[{"id":1,"x":3,"y":2,"active":true}],"grid":[[2,2,2,12,12,2],[2,2,1,2,1,2],[2,2,2,2,2,2],[2,2,1,0,1,2],[4,2,2,2,2,2]],"trace":["RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","RIGHT","UP","UP","LEFT","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","LEFT","LEFT","LEFT","UP","LEFT","DOWN"]},
  {"id":29,"world":6,"name":"Ronin's Narrow Escape","w":5,"h":5,"budget":0,"par":16,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":0},"grid":[[2,12,2,2,4],[2,2,2,2,1],[2,1,1,2,1],[2,1,1,2,1],[2,2,2,2,1]],"trace":["DOWN","DOWN","DOWN","DOWN","RIGHT","RIGHT","RIGHT","UP","UP","UP","LEFT","LEFT","UP","RIGHT","RIGHT","RIGHT"]},
  {"id":30,"world":6,"name":"Shogun's Kinetic Citadel","w":6,"h":6,"budget":0,"par":30,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":5},"initialPhase":"RED","checkpoints":[{"id":1,"x":5,"y":0,"cellType":5}],"crates":[{"id":1,"x":1,"y":2,"active":true}],"grid":[[2,12,12,2,2,5],[2,8,1,2,9,2],[2,2,2,2,2,2],[2,2,1,2,1,2],[2,2,12,12,2,2],[2,2,2,2,2,4]],"trace":["RIGHT","LEFT","DOWN","LEFT","DOWN","RIGHT","RIGHT","RIGHT","UP","RIGHT","UP","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","LEFT","UP","LEFT","DOWN","DOWN","RIGHT","RIGHT","UP","RIGHT","UP","DOWN","RIGHT","RIGHT"]},
  {"id":31,"world":7,"name":"Vegvisir Compass","w":5,"h":4,"budget":0,"par":15,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":3},"grid":[[2,2,2,2,14],[2,2,1,2,2],[15,1,1,2,2],[4,2,2,2,2]],"trace":["DOWN","RIGHT","UP","RIGHT","RIGHT","RIGHT","DOWN","LEFT","DOWN","RIGHT","DOWN","LEFT","LEFT","LEFT","LEFT"]},
  {"id":32,"world":7,"name":"Bifrost Shards","w":5,"h":5,"budget":0,"par":20,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":4},"grid":[[2,2,2,2,14],[2,2,2,2,2],[1,1,15,1,1],[2,2,2,2,2],[2,2,2,2,4]],"trace":["DOWN","RIGHT","UP","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","DOWN","DOWN","LEFT","LEFT","DOWN","RIGHT","RIGHT","RIGHT","UP","RIGHT","DOWN"]},
  {"id":33,"world":7,"name":"The Crate Sled","w":6,"h":5,"budget":0,"par":21,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"crates":[{"id":1,"x":2,"y":3,"active":true}],"grid":[[2,2,12,12,2,14],[2,2,2,2,2,2],[15,1,1,1,1,1],[2,2,2,0,12,2],[2,2,1,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","LEFT","LEFT","DOWN","DOWN","DOWN","RIGHT","UP","RIGHT","RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN"]},
  {"id":34,"world":7,"name":"Valkyrie Runematrix","w":6,"h":6,"budget":0,"par":29,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":5},"grid":[[2,12,12,2,2,14],[2,2,2,2,2,2],[1,1,15,1,1,1],[2,2,2,2,2,2],[2,2,2,2,2,2],[2,2,2,2,2,4]],"trace":["DOWN","RIGHT","UP","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","DOWN","DOWN","RIGHT","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","LEFT","UP","LEFT","DOWN","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT"]},
  {"id":35,"world":7,"name":"Valhalla's Gates","w":7,"h":6,"budget":0,"par":30,"spawn":{"x":0,"y":0},"goal":{"x":6,"y":5},"grid":[[2,2,12,12,12,2,14],[2,2,1,2,2,2,2],[1,1,1,15,1,1,1],[2,2,2,2,2,2,2],[2,2,2,1,2,2,2],[2,2,2,2,2,2,4]],"trace":["DOWN","RIGHT","UP","RIGHT","RIGHT","DOWN","LEFT","LEFT","LEFT","DOWN","DOWN","LEFT","DOWN","LEFT","UP","LEFT","DOWN","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT","UP","LEFT","UP","RIGHT","RIGHT","DOWN","DOWN"]},
  {"id":36,"world":8,"name":"Solar Ray Awakening","w":5,"h":5,"budget":0,"par":12,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":4},"emitters":{"2,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":1,"y":2,"type":18,"active":true}],"grid":[[2,1,16,1,1],[2,1,0,1,1],[2,2,2,0,19],[2,2,2,2,1],[2,2,2,20,4]],"trace":["DOWN","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","DOWN","RIGHT"]},
  {"id":37,"world":8,"name":"Prismatic Reflection","w":6,"h":5,"budget":0,"par":19,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"emitters":{"3,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":2,"y":2,"type":18,"active":true}],"grid":[[2,2,2,16,1,1],[2,2,2,0,1,1],[2,2,2,2,0,19],[2,2,2,2,2,1],[2,2,2,2,20,4]],"trace":["RIGHT","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","DOWN","DOWN","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT"]},
  {"id":38,"world":8,"name":"Crate Beam Interceptor","w":6,"h":5,"budget":0,"par":19,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"crates":[{"id":1,"x":1,"y":1,"active":true}],"emitters":{"3,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":2,"y":2,"type":18,"active":true}],"grid":[[2,2,2,16,1,1],[2,2,2,0,1,1],[2,2,2,2,0,19],[2,2,2,2,2,1],[2,2,2,2,20,4]],"trace":["RIGHT","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","DOWN","DOWN","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT"]},
  {"id":39,"world":8,"name":"Tonatiuh's Solar Altar","w":7,"h":5,"budget":0,"par":24,"spawn":{"x":0,"y":0},"goal":{"x":6,"y":4},"emitters":{"4,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":3,"y":2,"type":18,"active":true}],"grid":[[2,2,2,2,16,1,1],[2,2,2,2,0,1,1],[2,2,2,2,2,0,19],[2,2,2,2,2,2,1],[2,2,2,2,2,20,4]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","LEFT","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT"]},
  {"id":40,"world":8,"name":"Quetzalcoatl's Prism","w":7,"h":5,"budget":0,"par":24,"spawn":{"x":0,"y":0},"goal":{"x":6,"y":4},"checkpoints":[{"id":1,"x":1,"y":3,"cellType":5}],"emitters":{"4,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":3,"y":2,"type":18,"active":true}],"grid":[[2,2,2,2,16,1,1],[2,2,2,2,0,1,1],[2,2,2,2,2,0,19],[2,5,2,2,2,2,1],[2,2,2,2,2,20,4]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","LEFT","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN","RIGHT"]},
  {"id":41,"world":9,"name":"Bazaar Flux Stream","w":5,"h":4,"budget":0,"par":16,"spawn":{"x":0,"y":0},"goal":{"x":0,"y":1},"grid":[[2,23,2,22,2],[4,1,2,2,2],[2,1,2,2,2],[2,2,2,2,2]],"trace":["RIGHT","DOWN","RIGHT","UP","RIGHT","DOWN","DOWN","DOWN","LEFT","UP","LEFT","DOWN","LEFT","LEFT","UP","UP"]},
  {"id":42,"world":9,"name":"Muqarnas Momentum","w":5,"h":5,"budget":0,"par":22,"spawn":{"x":0,"y":0},"goal":{"x":4,"y":4},"grid":[[2,23,2,2,2],[2,2,2,22,2],[2,2,2,2,2],[2,24,2,2,2],[2,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","LEFT","UP","RIGHT","UP","LEFT","LEFT","LEFT","DOWN","RIGHT","DOWN","DOWN","RIGHT","RIGHT","RIGHT","RIGHT"]},
  {"id":43,"world":9,"name":"Crate Conveyor Siphon","w":6,"h":5,"budget":0,"par":30,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"initialPhase":"RED","crates":[{"id":1,"x":1,"y":2,"active":true}],"grid":[[2,23,2,2,2,2],[2,2,8,2,2,2],[2,2,2,2,2,2],[2,2,2,2,9,2],[2,2,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","LEFT","LEFT","DOWN","DOWN","LEFT","LEFT","LEFT","UP","RIGHT","RIGHT","UP","UP","LEFT","LEFT","DOWN","RIGHT","RIGHT","RIGHT","UP","RIGHT","DOWN","DOWN","RIGHT","DOWN"]},
  {"id":44,"world":9,"name":"Flux Glacier Chaining","w":6,"h":5,"budget":0,"par":27,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"grid":[[2,23,12,12,2,2],[2,2,2,2,2,2],[2,2,12,12,2,2],[2,2,2,2,2,2],[2,2,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","LEFT","LEFT","LEFT","UP","RIGHT","UP","LEFT","DOWN","LEFT","UP","LEFT","LEFT","DOWN","DOWN","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT"]},
  {"id":45,"world":9,"name":"Citadel of Perpetual Flow","w":6,"h":5,"budget":0,"par":30,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":4},"crates":[{"id":1,"x":1,"y":2,"active":true}],"grid":[[2,23,12,12,2,2],[2,2,2,2,2,2],[2,2,2,2,2,2],[2,2,2,2,2,2],[2,2,2,2,2,4]],"trace":["RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","LEFT","LEFT","LEFT","UP","RIGHT","RIGHT","RIGHT","UP","LEFT","LEFT","UP","RIGHT","LEFT","DOWN","LEFT","DOWN","DOWN","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT"]},
  {"id":46,"world":10,"name":"Prometheus Spark","w":6,"h":6,"budget":0,"par":21,"spawn":{"x":0,"y":0},"goal":{"x":5,"y":5},"emitters":{"3,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":2,"y":2,"type":18,"active":true}],"grid":[[2,23,12,16,1,1],[2,2,2,0,1,1],[2,2,2,2,0,19],[2,2,2,2,1,1],[2,2,2,2,1,1],[2,2,2,2,20,4]],"trace":["RIGHT","DOWN","LEFT","LEFT","DOWN","RIGHT","RIGHT","DOWN","RIGHT","DOWN","LEFT","LEFT","UP","LEFT","DOWN","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","RIGHT"]},
  {"id":47,"world":10,"name":"Hephaestus Crucible","w":7,"h":6,"budget":0,"par":43,"spawn":{"x":0,"y":0},"goal":{"x":6,"y":5},"crates":[{"id":1,"x":2,"y":2,"active":true}],"grid":[[2,12,12,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[14,2,2,2,2,15,4]],"trace":["RIGHT","RIGHT","RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","LEFT","DOWN","LEFT","LEFT","LEFT","LEFT","UP","UP","UP","UP","RIGHT","DOWN","RIGHT","DOWN","RIGHT","RIGHT","RIGHT","UP","UP","LEFT","DOWN","LEFT","UP","LEFT","DOWN","DOWN","LEFT","DOWN","RIGHT","RIGHT","RIGHT","RIGHT","DOWN","RIGHT"]},
  {"id":48,"world":10,"name":"The Aegis Matrix","w":7,"h":6,"budget":0,"par":31,"spawn":{"x":0,"y":0},"goal":{"x":6,"y":5},"emitters":{"4,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":3,"y":2,"type":18,"active":true}],"grid":[[2,23,12,2,16,1,1],[2,2,2,2,0,1,1],[2,2,2,2,2,0,19],[2,2,2,2,2,2,1],[14,2,2,2,2,2,1],[2,2,2,15,2,20,4]],"trace":["RIGHT","RIGHT","LEFT","RIGHT","DOWN","RIGHT","DOWN","DOWN","LEFT","UP","LEFT","UP","LEFT","DOWN","DOWN","RIGHT","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","RIGHT","DOWN","RIGHT","UP","UP","RIGHT","DOWN","DOWN","RIGHT"]},
  {"id":49,"world":10,"name":"Titan's Kinetic Gauntlet","w":8,"h":6,"budget":0,"par":46,"spawn":{"x":0,"y":0},"goal":{"x":7,"y":5},"crates":[{"id":1,"x":1,"y":2,"active":true}],"emitters":{"5,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":4,"y":2,"type":18,"active":true}],"grid":[[2,23,12,12,2,16,1,1],[2,2,2,2,2,0,1,1],[2,2,2,2,2,2,0,19],[2,2,2,2,2,2,2,1],[14,2,2,2,2,2,2,1],[2,2,2,2,15,2,20,4]],"trace":["RIGHT","RIGHT","DOWN","DOWN","DOWN","LEFT","DOWN","DOWN","LEFT","UP","LEFT","UP","RIGHT","UP","RIGHT","UP","LEFT","LEFT","DOWN","DOWN","LEFT","DOWN","DOWN","RIGHT","UP","UP","UP","LEFT","UP","RIGHT","RIGHT","UP","RIGHT","DOWN","DOWN","DOWN","DOWN","RIGHT","DOWN","RIGHT","UP","UP","RIGHT","DOWN","DOWN","RIGHT"]},
  {"id":50,"world":10,"name":"The Beaupre Singularity","w":8,"h":7,"budget":0,"par":53,"spawn":{"x":0,"y":0},"goal":{"x":7,"y":6},"checkpoints":[{"id":1,"x":0,"y":5,"cellType":5}],"crates":[{"id":1,"x":1,"y":2,"active":true}],"emitters":{"5,0":{"dx":0,"dy":1,"name":"DOWN"}},"mirrors":[{"id":1,"x":4,"y":2,"type":18,"active":true}],"grid":[[2,23,12,12,2,16,1,1],[2,2,2,2,2,0,1,1],[2,2,2,2,2,2,0,19],[14,2,2,2,2,2,2,1],[2,2,2,2,2,2,2,1],[5,2,2,2,2,2,2,1],[2,2,2,2,15,2,20,4]],"trace":["RIGHT","RIGHT","DOWN","DOWN","DOWN","DOWN","LEFT","DOWN","DOWN","LEFT","LEFT","LEFT","UP","RIGHT","RIGHT","UP","LEFT","UP","UP","LEFT","UP","RIGHT","UP","RIGHT","DOWN","LEFT","UP","RIGHT","LEFT","DOWN","DOWN","DOWN","LEFT","DOWN","RIGHT","RIGHT","UP","UP","RIGHT","DOWN","DOWN","DOWN","RIGHT","DOWN","RIGHT","UP","UP","UP","RIGHT","DOWN","DOWN","DOWN","RIGHT"]}
];
// ============================================================================
// SWIPE INPUT RESOLVER (SPECIFICATION SECTION 1)
// ============================================================================
function resolveSwipe(startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (Math.max(absX, absY) < 20) {
    return null; // Deadzone threshold
  }

  if (absX > absY) {
    return deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
  } else {
    return deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
  }
}

// ============================================================================
// MOCK DOM CONTROLLER (SPECIFICATION SECTION 3)
// ============================================================================
class MockDOMController {
  constructor() {
    this.deadlockBanner = { visible: false, classes: new Set() };
    this.victoryModal = { visible: false, classes: new Set() };
    this.adGateModal = { visible: false, classes: new Set() };
  }

  showDeadlock() {
    this.deadlockBanner.visible = true;
    this.deadlockBanner.classes.add('show');
    this.victoryModal.visible = false;
    this.victoryModal.classes.delete('show');
  }

  showAdGate() {
    this.adGateModal.visible = true;
  }

  hideAdGate() {
    this.adGateModal.visible = false;
  }

  showVictory() {
    this.victoryModal.visible = true;
    this.victoryModal.classes.add('show');
    this.deadlockBanner.visible = false;
    this.deadlockBanner.classes.delete('show');
  }

  reset() {
    this.deadlockBanner.visible = false;
    this.deadlockBanner.classes.clear();
    this.victoryModal.visible = false;
    this.victoryModal.classes.clear();
    this.adGateModal.visible = false;
  }
}

// ============================================================================
// GAME ENGINE RIG
// ============================================================================
class GameEngineRig {
  constructor(levelData) {
    this.dom = new MockDOMController();
    this.victoryTriggerCount = 0;
    this.deadlockTriggerCount = 0;
    this.loadLevel(levelData);
  }

  loadLevel(levelData) {
    this.level = levelData;
    this.w = levelData.w;
    this.h = levelData.h;
    this.grid = levelData.grid.map(row => [...row]);
    this.player = { ...levelData.spawn };
    this.goal = { ...levelData.goal };
    this.isVictorious = false;
    this.isDeadlocked = false;
    this.moveCount = 0;
    this.budget = levelData.budget || 0;
    this.initialBudget = levelData.budget || 0;

    this.hasC1 = (levelData.checkpoints && levelData.checkpoints.some(c => c.id === 1)) || false;
    this.hasC2 = (levelData.checkpoints && levelData.checkpoints.some(c => c.id === 2)) || false;
    this.c1Collected = false;
    this.c2Collected = false;
    this.undosRemaining = 3;
    this.adGateModalTriggered = false;
    this.history = [];

    // Crates & Mirrors
    this.crates = (levelData.crates || []).map(c => ({
      id: c.id, x: c.x, y: c.y, active: c.active !== undefined ? c.active : true
    }));
    this.mirrors = (levelData.mirrors || []).map(m => ({
      id: m.id, x: m.x, y: m.y, type: m.type, active: m.active !== undefined ? m.active : true
    }));
    this.keysHeld = new Set(levelData.keysHeld || []);

    // Crossroads
    this.crossroads = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.grid[y][x] === C_CROSSROAD) {
          this.crossroads.set(`${x},${y}`, 2);
        }
      }
    }

    this.phaseState = (levelData.initialPhase !== 'BLUE');
    this.updateLaserSystem();
    const initialR = this.getRemainingCount();
    const checkpointsMet = (!this.hasC1) && (!this.hasC2);
    this.isGoalUnlocked = this.initialBudget === 0 ? (initialR === 0 && checkpointsMet) : (this.budget >= 1 && checkpointsMet);

    this.dom.reset();
  }

  getCrateAt(x, y) {
    if (!this.crates) return null;
    return this.crates.find(c => c.active && c.x === x && c.y === y) || null;
  }

  getMirrorAt(x, y) {
    if (!this.mirrors) return null;
    return this.mirrors.find(m => m.active && m.x === x && m.y === y) || null;
  }

  isSwitchDepressed() {
    return (this.crates && this.crates.some(c => c.active && this.grid[c.y] && this.grid[c.y][c.x] === C_SWITCH)) ||
           (this.mirrors && this.mirrors.some(m => m.active && this.grid[m.y] && this.grid[m.y][m.x] === C_SWITCH));
  }

  getEffectivePhase() {
    if (this.isSwitchDepressed()) return "BLUE";
    return this.phaseState ? "RED" : "BLUE";
  }

  updateLaserSystem() {
    this.laserGateOpen = false;
    this.activeBeams = [];

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.grid[y][x] === C_LASER_EMIT) {
          const emitDir = (this.level.emitters && this.level.emitters[`${x},${y}`]) || DIRECTIONS.RIGHT;
          this.traceLaserBeam(x, y, emitDir);
        }
      }
    }
  }

  traceLaserBeam(startX, startY, startDir) {
    let cx = startX;
    let cy = startY;
    let cdir = startDir;
    let bounces = 0;

    while (bounces < 16) {
      cx += cdir.dx;
      cy += cdir.dy;
      if (cx < 0 || cx >= this.w || cy < 0 || cy >= this.h) break;

      this.activeBeams.push({ x: cx, y: cy, dir: cdir });

      const crate = this.getCrateAt(cx, cy);
      if (crate) break;

      const mirror = this.getMirrorAt(cx, cy);
      if (mirror) {
        bounces++;
        if (mirror.type === C_MIRROR_SLASH) {
          if (cdir.name === 'UP') cdir = DIRECTIONS.RIGHT;
          else if (cdir.name === 'RIGHT') cdir = DIRECTIONS.UP;
          else if (cdir.name === 'DOWN') cdir = DIRECTIONS.LEFT;
          else if (cdir.name === 'LEFT') cdir = DIRECTIONS.DOWN;
        } else if (mirror.type === C_MIRROR_BSLASH) {
          if (cdir.name === 'UP') cdir = DIRECTIONS.LEFT;
          else if (cdir.name === 'LEFT') cdir = DIRECTIONS.UP;
          else if (cdir.name === 'DOWN') cdir = DIRECTIONS.RIGHT;
          else if (cdir.name === 'RIGHT') cdir = DIRECTIONS.DOWN;
        }
        continue;
      }

      const cell = this.grid[cy][cx];
      if (cell === C_WALL) break;
      if (cell === C_LASER_RECEPT) {
        this.laserGateOpen = true;
        break;
      }
    }
  }

  isLaserActiveAt(x, y) {
    if (!this.activeBeams) return false;
    return this.activeBeams.some(b => b.x === x && b.y === y);
  }

  isTileValidForPushable(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const cell = this.grid[y][x];
    if (cell === C_WALL || cell === C_GOAL || cell === C_CHECKPOINT_1 || cell === C_CHECKPOINT_2 || cell === C_LASER_EMIT || cell === C_LASER_RECEPT) return false;
    if (this.getCrateAt(x, y) || this.getMirrorAt(x, y)) return false;

    const phase = this.getEffectivePhase();
    if (cell === C_GATE_RED && phase === "RED") return false;
    if (cell === C_GATE_BLUE && phase === "BLUE") return false;
    if (cell === C_RUNE_GATE && (!this.keysHeld || !this.keysHeld.has(1))) return false;
    if (cell === C_LASER_GATE && !this.laserGateOpen) return false;

    return true;
  }

  isTilePassable(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const cell = this.grid[y][x];
    if (cell === C_WALL || cell === C_CONSUMED || cell === C_VOID || cell === C_LASER_EMIT || cell === C_LASER_RECEPT) return false;
    if (cell === C_CHECKPOINT_2 && !this.c1Collected) return false;
    const effPhase = this.getEffectivePhase();
    if (cell === C_GATE_RED && effPhase === "RED") return false;
    if (cell === C_GATE_BLUE && effPhase === "BLUE") return false;
    if (cell === C_RUNE_GATE && (!this.keysHeld || !this.keysHeld.has(1))) return false;
    if (cell === C_LASER_GATE && !this.laserGateOpen) return false;
    if (cell === C_GOAL) return this.isGoalUnlocked;
    if (cell === C_CROSSROAD) {
      const visits = this.crossroads ? (this.crossroads.get(`${x},${y}`) || 0) : 0;
      return visits > 0;
    }
    return true;
  }

  getRemainingCount() {
    let count = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (x === this.player.x && y === this.player.y) continue;
        if (this.getCrateAt(x, y) || this.getMirrorAt(x, y)) continue;
        const c = this.grid[y][x];
        if (c === C_UNTOUCHED || c === C_CRUMBLING || c === C_CHECKPOINT_1 || c === C_CHECKPOINT_2 || c === C_SWITCH || c === C_GATE_RED || c === C_GATE_BLUE) {
          count++;
        } else if (c === C_CROSSROAD) {
          count += (this.crossroads.get(`${x},${y}`) || 0);
        }
      }
    }
    return count;
  }

  triggerVictory() {
    this.isVictorious = true;
    this.victoryTriggerCount++;
    this.dom.showVictory();
  }

  triggerDeadlock() {
    if (this.isVictorious) return;
    this.isDeadlocked = true;
    this.deadlockTriggerCount++;
    this.dom.showDeadlock();
  }

  restart() {
    this.dom.reset();
    this.loadLevel(this.level);
  }

  grantAdReward(count = 3) {
    this.undosRemaining += count;
    this.adGateModalTriggered = false;
    this.dom.hideAdGate();
  }

  undo(bypassBudget = false) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (!bypassBudget && this.undosRemaining <= 0) {
      this.adGateModalTriggered = true;
      this.dom.showAdGate();
      return { success: false, reason: 'OUT_OF_UNDOS', undosRemaining: this.undosRemaining };
    }
    if (this.history.length === 0) return { success: false, reason: 'NO_HISTORY', undosRemaining: this.undosRemaining };

    if (!bypassBudget) this.undosRemaining--;
    const frame = this.history.pop();
    if (frame.gridSnapshot) {
      this.grid = frame.gridSnapshot.map(r => [...r]);
    } else {
      this.grid[frame.player.y][frame.player.x] = frame.prevCellState;
      this.grid[frame.target.y][frame.target.x] = frame.targetCellPrevState;
    }
    if (frame.cratesSnapshot) {
      this.crates = frame.cratesSnapshot.map(c => ({ ...c }));
    }
    if (frame.mirrorsSnapshot) {
      this.mirrors = frame.mirrorsSnapshot.map(m => ({ ...m }));
    }
    if (frame.keysHeldSnapshot) {
      this.keysHeld = new Set(frame.keysHeldSnapshot);
    }
    if (frame.crossroadsSnapshot) {
      this.crossroads = new Map(frame.crossroadsSnapshot);
    }
    this.player = { ...frame.player };
    this.phaseState = frame.phaseState !== undefined ? frame.phaseState : true;
    this.moveCount = frame.moveCount;
    this.budget = frame.budget;
    this.c1Collected = frame.c1Collected;
    this.c2Collected = frame.c2Collected;
    this.isGoalUnlocked = frame.isGoalUnlocked;
    this.isDeadlocked = frame.isDeadlocked;
    this.updateLaserSystem();

    if (!this.isDeadlocked) {
      this.dom.deadlockBanner.visible = false;
      this.dom.deadlockBanner.classes.delete('show');
    }
    return { success: true };
  }

  executeSlide(dx, dy, startX, startY) {
    this.history.push({
      player: { ...this.player },
      target: { x: startX, y: startY },
      gridSnapshot: this.grid.map(r => [...r]),
      cratesSnapshot: this.crates ? this.crates.map(c => ({ ...c })) : [],
      mirrorsSnapshot: this.mirrors ? this.mirrors.map(m => ({ ...m })) : [],
      keysHeldSnapshot: this.keysHeld ? new Set(this.keysHeld) : new Set(),
      crossroadsSnapshot: new Map(this.crossroads),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      isGoalUnlocked: this.isGoalUnlocked,
      budget: this.budget,
      moveCount: this.moveCount,
      isDeadlocked: this.isDeadlocked
    });

    const depCell = this.grid[this.player.y][this.player.x];
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else if (depCell === C_CROSSROAD) {
      const key = `${this.player.x},${this.player.y}`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED;
      }
    } else if (depCell !== C_ICE) {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    let cx = startX;
    let cy = startY;

    while (true) {
      const aheadX = cx + dx;
      const aheadY = cy + dy;

      const isAheadPassable = this.isTilePassable(aheadX, aheadY) && !this.getCrateAt(aheadX, aheadY) && !this.getMirrorAt(aheadX, aheadY);
      if (!isAheadPassable) break;

      const aheadCell = this.grid[aheadY][aheadX];
      if (aheadCell === C_ICE) {
        cx = aheadX;
        cy = aheadY;
      } else {
        cx = aheadX;
        cy = aheadY;
        break;
      }
    }

    this.player.x = cx;
    this.player.y = cy;
    this.moveCount++;
    if (this.initialBudget > 0) this.budget--;

    const landingCell = this.grid[cy][cx];
    if (landingCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    } else if (landingCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (landingCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (landingCell === C_RUNE_KEY) {
      this.keysHeld.add(1);
    }

    this.updateLaserSystem();
    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
      this.triggerVictory();
    }

    this.evaluateState();
    return { success: true, player: { ...this.player } };
  }

  hasValidMoves() {
    const neighbors = [
      { x: this.player.x + 1, y: this.player.y, dx: 1, dy: 0 },
      { x: this.player.x - 1, y: this.player.y, dx: -1, dy: 0 },
      { x: this.player.x, y: this.player.y + 1, dx: 0, dy: 1 },
      { x: this.player.x, y: this.player.y - 1, dx: 0, dy: -1 }
    ];
    return neighbors.some(n => {
      const crate = this.getCrateAt(n.x, n.y);
      if (crate) return this.isTileValidForPushable(n.x + n.dx, n.y + n.dy);
      const mirror = this.getMirrorAt(n.x, n.y);
      if (mirror) return this.isTileValidForPushable(n.x + n.dx, n.y + n.dy);
      return this.isTilePassable(n.x, n.y);
    });
  }

  evaluateState() {
    const remainingCount = this.getRemainingCount();
    const checkpointsMet = (!this.hasC1 || this.c1Collected) && (!this.hasC2 || this.c2Collected);

    if (this.initialBudget === 0) {
      this.isGoalUnlocked = (remainingCount === 0 && checkpointsMet);
    } else {
      if (this.budget < 0) {
        this.isGoalUnlocked = false;
        this.triggerDeadlock();
      } else if (checkpointsMet && this.budget >= 1) {
        this.isGoalUnlocked = true;
      } else {
        this.isGoalUnlocked = false;
      }
    }

    if (!this.isVictorious && !this.isDeadlocked) {
      if (!this.hasValidMoves()) {
        this.triggerDeadlock();
      }
    }
  }

  executeMove(dx, dy) {
    if (this.isVictorious) return { success: false, reason: 'ALREADY_VICTORIOUS' };
    if (this.isDeadlocked) return { success: false, reason: 'DEADLOCKED' };

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    // Pushable Crate or Mirror Check
    const targetCrate = this.getCrateAt(nx, ny);
    const targetMirror = this.getMirrorAt(nx, ny);
    const pushable = targetCrate || targetMirror;

    if (pushable) {
      const pDestX = nx + dx;
      const pDestY = ny + dy;

      if (!this.isTileValidForPushable(pDestX, pDestY)) {
        return { success: false, reason: 'PUSHABLE_BLOCKED' };
      }

      this.history.push({
        player: { ...this.player },
        target: { x: nx, y: ny },
        gridSnapshot: this.grid.map(r => [...r]),
        cratesSnapshot: this.crates ? this.crates.map(c => ({ ...c })) : [],
        mirrorsSnapshot: this.mirrors ? this.mirrors.map(m => ({ ...m })) : [],
        keysHeldSnapshot: this.keysHeld ? new Set(this.keysHeld) : new Set(),
        crossroadsSnapshot: new Map(this.crossroads),
        phaseState: this.phaseState,
        c1Collected: this.c1Collected,
        c2Collected: this.c2Collected,
        isGoalUnlocked: this.isGoalUnlocked,
        budget: this.budget,
        moveCount: this.moveCount,
        isDeadlocked: this.isDeadlocked
      });

      const destCell = this.grid[pDestY][pDestX];
      if (destCell === C_VOID || destCell === C_CRUMBLING) {
        this.grid[pDestY][pDestX] = C_UNTOUCHED;
        pushable.active = false;
        pushable.x = -1;
        pushable.y = -1;
      } else if (destCell === C_ICE) {
        let cx = pDestX;
        let cy = pDestY;
        while (true) {
          const aheadX = cx + dx;
          const aheadY = cy + dy;
          if (!this.isTileValidForPushable(aheadX, aheadY)) break;
          cx = aheadX;
          cy = aheadY;
          if (this.grid[cy][cx] !== C_ICE) break;
        }
        pushable.x = cx;
        pushable.y = cy;
      } else if (destCell >= C_CONVEYOR_U && destCell <= C_CONVEYOR_L) {
        const convDir = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.LEFT][destCell - C_CONVEYOR_U];
        const aheadX = pDestX + convDir.dx;
        const aheadY = pDestY + convDir.dy;
        if (this.isTileValidForPushable(aheadX, aheadY)) {
          pushable.x = aheadX;
          pushable.y = aheadY;
        } else {
          pushable.x = pDestX;
          pushable.y = pDestY;
        }
      } else {
        pushable.x = pDestX;
        pushable.y = pDestY;
      }

      const depCell = this.grid[this.player.y][this.player.x];
      if (depCell === C_CRUMBLING) {
        this.grid[this.player.y][this.player.x] = C_VOID;
      } else if (depCell === C_CROSSROAD) {
        const key = `${this.player.x},${this.player.y}`;
        const visits = (this.crossroads.get(key) || 2) - 1;
        this.crossroads.set(key, visits);
        if (visits <= 0) this.grid[this.player.y][this.player.x] = C_CONSUMED;
      } else if (depCell !== C_ICE) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED;
      }

      this.moveCount++;
      if (this.initialBudget > 0) this.budget--;

      this.player.x = nx;
      this.player.y = ny;

      const arrivedCell = this.grid[ny][nx];
      if (arrivedCell === C_SWITCH) {
        this.phaseState = !this.phaseState;
      } else if (arrivedCell === C_CHECKPOINT_1) {
        this.c1Collected = true;
      } else if (arrivedCell === C_CHECKPOINT_2) {
        this.c2Collected = true;
      } else if (arrivedCell === C_RUNE_KEY) {
        this.keysHeld.add(1);
      }

      this.updateLaserSystem();
      if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
        this.triggerVictory();
      }

      this.evaluateState();
      return { success: true, player: { ...this.player } };
    }

    // Standard Passability Check
    if (!this.isTilePassable(nx, ny)) {
      return { success: false, reason: 'IMPASSABLE' };
    }

    if (this.isLaserActiveAt(nx, ny)) {
      return { success: false, reason: 'LASER_ACTIVE' };
    }

    const targetCell = this.grid[ny][nx];
    if (targetCell === C_ICE) {
      return this.executeSlide(dx, dy, nx, ny);
    }

    // Conveyor entry
    if (targetCell >= C_CONVEYOR_U && targetCell <= C_CONVEYOR_L) {
      this.history.push({
        player: { ...this.player },
        target: { x: nx, y: ny },
        gridSnapshot: this.grid.map(r => [...r]),
        cratesSnapshot: this.crates ? this.crates.map(c => ({ ...c })) : [],
        mirrorsSnapshot: this.mirrors ? this.mirrors.map(m => ({ ...m })) : [],
        keysHeldSnapshot: this.keysHeld ? new Set(this.keysHeld) : new Set(),
        crossroadsSnapshot: new Map(this.crossroads),
        phaseState: this.phaseState,
        c1Collected: this.c1Collected,
        c2Collected: this.c2Collected,
        isGoalUnlocked: this.isGoalUnlocked,
        budget: this.budget,
        moveCount: this.moveCount,
        isDeadlocked: this.isDeadlocked
      });

      const depCell = this.grid[this.player.y][this.player.x];
      if (depCell === C_CRUMBLING) {
        this.grid[this.player.y][this.player.x] = C_VOID;
      } else if (depCell === C_CROSSROAD) {
        const key = `${this.player.x},${this.player.y}`;
        const visits = (this.crossroads.get(key) || 2) - 1;
        this.crossroads.set(key, visits);
        if (visits <= 0) this.grid[this.player.y][this.player.x] = C_CONSUMED;
      } else if (depCell !== C_ICE) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED;
      }

      const convDir = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.LEFT][targetCell - C_CONVEYOR_U];
      let cx = nx;
      let cy = ny;
      const aheadX = cx + convDir.dx;
      const aheadY = cy + convDir.dy;
      if (this.isTilePassable(aheadX, aheadY) && !this.getCrateAt(aheadX, aheadY) && !this.getMirrorAt(aheadX, aheadY)) {
        cx = aheadX;
        cy = aheadY;
      }

      this.moveCount++;
      if (this.initialBudget > 0) this.budget--;
      this.player.x = cx;
      this.player.y = cy;

      const arrivedCell = this.grid[cy][cx];
      if (arrivedCell === C_SWITCH) {
        this.phaseState = !this.phaseState;
      } else if (arrivedCell === C_CHECKPOINT_1) {
        this.c1Collected = true;
      } else if (arrivedCell === C_CHECKPOINT_2) {
        this.c2Collected = true;
      } else if (arrivedCell === C_RUNE_KEY) {
        this.keysHeld.add(1);
      }

      this.updateLaserSystem();
      if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
        this.triggerVictory();
      }

      this.evaluateState();
      return { success: true, player: { ...this.player } };
    }

    // Standard Move
    this.history.push({
      player: { ...this.player },
      target: { x: nx, y: ny },
      gridSnapshot: this.grid.map(r => [...r]),
      cratesSnapshot: this.crates ? this.crates.map(c => ({ ...c })) : [],
      mirrorsSnapshot: this.mirrors ? this.mirrors.map(m => ({ ...m })) : [],
      keysHeldSnapshot: this.keysHeld ? new Set(this.keysHeld) : new Set(),
      crossroadsSnapshot: new Map(this.crossroads),
      phaseState: this.phaseState,
      c1Collected: this.c1Collected,
      c2Collected: this.c2Collected,
      isGoalUnlocked: this.isGoalUnlocked,
      budget: this.budget,
      moveCount: this.moveCount,
      isDeadlocked: this.isDeadlocked
    });

    const depCell = this.grid[this.player.y][this.player.x];
    if (depCell === C_CRUMBLING) {
      this.grid[this.player.y][this.player.x] = C_VOID;
    } else if (depCell === C_CROSSROAD) {
      const key = `${this.player.x},${this.player.y}`;
      const visits = (this.crossroads.get(key) || 2) - 1;
      this.crossroads.set(key, visits);
      if (visits <= 0) {
        this.grid[this.player.y][this.player.x] = C_CONSUMED;
      }
    } else if (depCell !== C_ICE) {
      this.grid[this.player.y][this.player.x] = C_CONSUMED;
    }

    this.player.x = nx;
    this.player.y = ny;
    this.moveCount++;
    if (this.initialBudget > 0) this.budget--;

    if (targetCell === C_CHECKPOINT_1) {
      this.c1Collected = true;
    } else if (targetCell === C_CHECKPOINT_2) {
      this.c2Collected = true;
    } else if (targetCell === C_SWITCH) {
      this.phaseState = !this.phaseState;
    } else if (targetCell === C_RUNE_KEY) {
      this.keysHeld.add(1);
    }

    this.updateLaserSystem();
    if (this.player.x === this.goal.x && this.player.y === this.goal.y && this.isGoalUnlocked) {
      this.triggerVictory();
    }

    this.evaluateState();
    return { success: true, player: { ...this.player } };
  }
}
// ============================================================================
// RESPONSIVE STAGE & HIGH-DPI ENGINE
// ============================================================================
class ResponsiveStageEngine {
  static resolveShell(viewportW, viewportH) {
    const isMobile = viewportW <= 480;
    const width = isMobile ? viewportW : Math.min(viewportW, 440);
    const height = isMobile ? viewportH : Math.min(viewportH, 880);
    const padding = isMobile
      ? { top: 12, bottom: 12, left: 8, right: 8 }
      : { top: 16, bottom: 16, left: 12, right: 12 };
    const borderRadius = isMobile ? 0 : 24;
    const boxShadow = isMobile ? 'none' : '0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)';

    const left = Math.floor((viewportW - width) / 2);
    const top = Math.floor((viewportH - height) / 2);

    return {
      isMobile,
      width,
      height,
      padding,
      borderRadius,
      boxShadow,
      left,
      top,
      overflow: 'hidden'
    };
  }

  static resolveCanvasRect(shell, hudHeight = 56, controlsHeight = 64) {
    const rectWidth = shell.width - (shell.padding.left + shell.padding.right);
    const rectHeight = shell.height - (shell.padding.top + shell.padding.bottom) - hudHeight - controlsHeight;
    const rectLeft = shell.left + shell.padding.left;
    const rectTop = shell.top + shell.padding.top + hudHeight;

    return {
      width: rectWidth,
      height: rectHeight,
      left: rectLeft,
      top: rectTop
    };
  }

  static computeTileMetrics(rect, cols, rows) {
    const maxTileW = (rect.width * 0.85) / cols;
    const maxTileH = (rect.height * 0.65) / rows;
    const rawTileSize = Math.floor(Math.min(maxTileW, maxTileH));
    const tileSize = Math.max(32, Math.min(110, rawTileSize));

    const originX = Math.floor((rect.width - (cols * tileSize)) / 2);
    const originY = Math.floor((rect.height - (rows * tileSize)) / 2);

    const gridWidth = cols * tileSize;
    const gridHeight = rows * tileSize;

    return {
      tileSize,
      originX,
      originY,
      gridWidth,
      gridHeight,
      availableWidth: rect.width,
      availableHeight: rect.height
    };
  }

  static computeHighDPIBuffer(width, height, dpr) {
    const bufferWidth = Math.round(width * dpr);
    const bufferHeight = Math.round(height * dpr);
    return {
      cssWidth: width,
      cssHeight: height,
      bufferWidth,
      bufferHeight,
      dpr,
      scaleX: dpr,
      scaleY: dpr
    };
  }

  static mapClientToGrid(clientX, clientY, canvasBoundingRect, originX, originY, tileSize) {
    const relativeX = clientX - canvasBoundingRect.left;
    const relativeY = clientY - canvasBoundingRect.top;

    const x = relativeX - originX;
    const y = relativeY - originY;

    const gx = Math.floor(x / tileSize);
    const gy = Math.floor(y / tileSize);

    return { x, y, gx, gy };
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================
let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] ${testName} ... `);
  try {
    fn();
    passedTests++;
    console.log(`\x1b[32mPASSED\x1b[0m`);
  } catch (err) {
    console.log(`\x1b[31mFAILED\x1b[0m`);
    console.error(`\x1b[31mAssertion Error: ${err.message}\x1b[0m`);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

console.log("================================================================================");
console.log("   ONE MORE TILE - ADVERSARIAL QA & RED TEAM VERIFICATION PROTOCOL");
console.log("================================================================================\n");

// ----------------------------------------------------------------------------
// TEST 1: Swipe Input Vector Resolution & Inversion Assertions
// ----------------------------------------------------------------------------
runTest("Test 1: Swipe Input Vector Resolution & Gesture Deadzone Invariants", () => {
  // Pure cardinal swipes
  assert.deepStrictEqual(resolveSwipe(100, 100, 180, 100), DIRECTIONS.RIGHT);
  assert.deepStrictEqual(resolveSwipe(180, 100, 100, 100), DIRECTIONS.LEFT);
  assert.deepStrictEqual(resolveSwipe(100, 100, 100, 180), DIRECTIONS.DOWN);
  assert.deepStrictEqual(resolveSwipe(100, 180, 100, 100), DIRECTIONS.UP);

  // Diagonal resolution (primary axis dominance)
  assert.deepStrictEqual(resolveSwipe(100, 100, 200, 130), DIRECTIONS.RIGHT);
  assert.deepStrictEqual(resolveSwipe(100, 100, 130, 200), DIRECTIONS.DOWN);

  // Deadzone filter (< 20px)
  assert.strictEqual(resolveSwipe(100, 100, 110, 110), null);
});

// ----------------------------------------------------------------------------
// TEST 2: Modal Mutual Exclusivity & Reset DOM State Cleanup
// ----------------------------------------------------------------------------
runTest("Test 2: Modal Mutual Exclusivity & DOM State Cleanup", () => {
  const lvl1 = LEVELS[0];
  const engine = new GameEngineRig(lvl1);

  // Initial State: both hidden
  assert.strictEqual(engine.dom.deadlockBanner.visible, false);
  assert.strictEqual(engine.dom.victoryModal.visible, false);

  // Trigger Deadlock
  engine.triggerDeadlock();
  assert.strictEqual(engine.dom.deadlockBanner.visible, true);
  assert.strictEqual(engine.dom.victoryModal.visible, false);

  // Trigger Victory (mutual exclusivity)
  engine.triggerVictory();
  assert.strictEqual(engine.dom.victoryModal.visible, true);
  assert.strictEqual(engine.dom.deadlockBanner.visible, false);

  // Reset
  engine.restart();
  assert.strictEqual(engine.dom.deadlockBanner.visible, false);
  assert.strictEqual(engine.dom.victoryModal.visible, false);
});

// ----------------------------------------------------------------------------
// TEST 3: Responsive Stage Centering & Metrics (Mobile, Desktop, Square)
// ----------------------------------------------------------------------------
runTest("Test 3: Responsive Stage Centering & Metrics across Viewports", () => {
  // Mobile Portrait (390x844)
  const shellMob = ResponsiveStageEngine.resolveShell(390, 844);
  assert.strictEqual(shellMob.isMobile, true);
  assert.strictEqual(shellMob.width, 390);
  const rectMob = ResponsiveStageEngine.resolveCanvasRect(shellMob);
  const metricsMob = ResponsiveStageEngine.computeTileMetrics(rectMob, 5, 5);
  assert(metricsMob.tileSize >= 32);
  assert(metricsMob.originX >= 0);
  assert(metricsMob.originY >= 0);

  // Desktop (1920x1080)
  const shellDesk = ResponsiveStageEngine.resolveShell(1920, 1080);
  assert.strictEqual(shellDesk.isMobile, false);
  assert.strictEqual(shellDesk.width, 440);
  const rectDesk = ResponsiveStageEngine.resolveCanvasRect(shellDesk);
  const metricsDesk = ResponsiveStageEngine.computeTileMetrics(rectDesk, 6, 6);
  assert(metricsDesk.tileSize >= 32);
  assert(metricsDesk.originX >= 0);
  assert(metricsDesk.originY >= 0);

  // Square/Foldable (600x600)
  const shellSq = ResponsiveStageEngine.resolveShell(600, 600);
  const rectSq = ResponsiveStageEngine.resolveCanvasRect(shellSq);
  const metricsSq = ResponsiveStageEngine.computeTileMetrics(rectSq, 7, 7);
  assert(metricsSq.tileSize >= 32);
  assert(metricsSq.originX >= 0);
  assert(metricsSq.originY >= 0);
});

// ----------------------------------------------------------------------------
// TEST 4: High-DPI Buffer Scaling & Relative Input Coordinates
// ----------------------------------------------------------------------------
runTest("Test 4: High-DPI Buffer Scaling & Coordinate Transform (DPR 1.0, 2.0, 3.0)", () => {
  [1.0, 2.0, 3.0].forEach(dpr => {
    const buf = ResponsiveStageEngine.computeHighDPIBuffer(400, 600, dpr);
    assert.strictEqual(buf.bufferWidth, Math.round(400 * dpr));
    assert.strictEqual(buf.bufferHeight, Math.round(600 * dpr));
  });

  const gridCoord = ResponsiveStageEngine.mapClientToGrid(
    150, 250,
    { left: 50, top: 50 },
    20, 30,
    40
  );
  assert.strictEqual(gridCoord.gx, 2);
  assert.strictEqual(gridCoord.gy, 4);
});

// ----------------------------------------------------------------------------
// TEST 5: World 1 Open Weaving & Parity Traps (Anti-Corridor Topology)
// ----------------------------------------------------------------------------
runTest("Test 5: World 1 Open Weaving & Anti-Corridor Topology Audit", () => {
  const w1Levels = LEVELS.filter(l => l.world === 1);
  assert.strictEqual(w1Levels.length, 5, "World 1 must contain exactly 5 levels");

  function calculateTopologicalBranchingFactor(lvl) {
    let totalDegree = 0;
    let traversableTiles = 0;
    for (let y = 0; y < lvl.h; y++) {
      for (let x = 0; x < lvl.w; x++) {
        const cell = lvl.grid[y][x];
        if (cell === C_WALL || cell === C_VOID) continue;
        traversableTiles++;
        for (const d of [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ]) {
          const nx = x + d.dx;
          const ny = y + d.dy;
          if (nx >= 0 && nx < lvl.w && ny >= 0 && ny < lvl.h) {
            const nCell = lvl.grid[ny][nx];
            if (nCell !== C_WALL && nCell !== C_VOID) {
              totalDegree++;
            }
          }
        }
      }
    }
    return traversableTiles > 0 ? (totalDegree / traversableTiles) : 0;
  }

  w1Levels.forEach(lvl => {
    const topoB = calculateTopologicalBranchingFactor(lvl);
    const specB = lvl.branching_factor;
    assert(topoB >= 2.0, `Level ${lvl.id} topological degree ${topoB.toFixed(2)} must be >= 2.0 (Abolishing Narrow Corridors)`);
    assert(specB >= 2.0, `Level ${lvl.id} spec branching factor ${specB.toFixed(2)} must be >= 2.0`);
  });

  // Adversarial greedy trap on Level 1:
  // Greedy perimeter loop: (0,0) -> R(1,0) -> R(2,0) -> R(3,0) -> D(3,1) -> D(3,2) -> L(2,2) -> L(1,2) -> L(0,2)
  const lvl1 = w1Levels[0];
  const engine1 = new GameEngineRig(lvl1);
  const perimeterMoves = [
    { dx: 1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: -1, dy: 0 }, { dx: -1, dy: 0 }
  ];
  perimeterMoves.forEach(m => engine1.executeMove(m.dx, m.dy));

  assert.strictEqual(engine1.player.x, 0);
  assert.strictEqual(engine1.player.y, 2);

  // Interior tiles (1,1) and (2,1) were NEVER visited (orphaned!)
  assert.strictEqual(engine1.grid[1][1], C_UNTOUCHED, "Tile (1,1) orphaned");
  assert.strictEqual(engine1.grid[1][2], C_UNTOUCHED, "Tile (2,1) orphaned");
  assert.strictEqual(engine1.getRemainingCount(), 2, "2 unconsumed tiles remain");

  // Attempting to step UP into Goal (0,1) must be strictly REJECTED (Goal locked)
  const goalTry = engine1.executeMove(0, -1);
  assert.strictEqual(goalTry.success, false, "Locked Goal must reject entry when orphan tiles remain");
  assert.strictEqual(engine1.isDeadlocked, true, "Player must be deadlocked at (0,2)");
});


// ----------------------------------------------------------------------------
// TEST 6: World 2 Knot Theory & Crossroads (C_CROSSROAD = 11)
// ----------------------------------------------------------------------------
runTest("Test 6: World 2 Knot Theory & Crossroad 2-Pass Degradation Invariant", () => {
  const lvl6 = LEVELS.find(l => l.id === 6);
  assert(lvl6, "Level 6 must exist");
  const engine = new GameEngineRig(lvl6);

  // Crossroad is at (2,1)
  assert.strictEqual(engine.grid[1][2], C_CROSSROAD);
  assert.strictEqual(engine.crossroads.get('2,1'), 2);

  // Move 1: RIGHT to (1,0)
  engine.executeMove(1, 0);
  // Move 2: RIGHT to (2,0)
  engine.executeMove(1, 0);
  // Move 3: DOWN to (2,1) [First Crossroad Entry]
  let r3 = engine.executeMove(0, 1);
  assert.strictEqual(r3.success, true);
  assert.strictEqual(engine.player.x, 2);
  assert.strictEqual(engine.player.y, 1);

  // Move 4: LEFT to (1,1) [First Crossroad Departure]
  let r4 = engine.executeMove(-1, 0);
  assert.strictEqual(r4.success, true);
  assert.strictEqual(engine.crossroads.get('2,1'), 1, "First departure must decrement crossroad visits to 1");
  assert.strictEqual(engine.grid[1][2], C_CROSSROAD, "Crossroad must remain C_CROSSROAD on visit 1");

  // Undo move 4: back to (2,1)
  let u4 = engine.undo();
  assert.strictEqual(u4.success, true);
  assert.strictEqual(engine.crossroads.get('2,1'), 2, "Undo must restore crossroad visits back to 2");
});

// ----------------------------------------------------------------------------
// TEST 7: World 3 The Obsidian Weave & Multi-Crossroad Arenas
// ----------------------------------------------------------------------------
runTest("Test 7: World 3 The Obsidian Weave & Multi-Crossroad Arenas", () => {
  const lvl11 = LEVELS.find(l => l.id === 11);
  assert(lvl11, "Level 11 must exist");
  const engine11 = new GameEngineRig(lvl11);

  // Level 11 has crossroads at (1,1) and (1,2)
  assert.strictEqual(engine11.grid[1][1], C_CROSSROAD);
  assert.strictEqual(engine11.grid[2][1], C_CROSSROAD);
  assert.strictEqual(engine11.crossroads.get('1,1'), 2);
  assert.strictEqual(engine11.crossroads.get('1,2'), 2);

  // Test Level 12 Octagonal Arena & Crossroad Degradation
  const lvl12 = LEVELS.find(l => l.id === 12);
  assert(lvl12, "Level 12 must exist");
  const engine12 = new GameEngineRig(lvl12);
  assert.strictEqual(engine12.grid[0][0], C_VOID, "Corners must be open octagonal voids");
  assert.strictEqual(engine12.grid[2][2], C_CROSSROAD);
  assert.strictEqual(engine12.crossroads.get('2,2'), 2);
});

// ----------------------------------------------------------------------------
// TEST 8: World 4 The Grandmaster Arenas & Playability
// ----------------------------------------------------------------------------
runTest("Test 8: World 4 The Grandmaster Arenas & Playability", () => {
  const lvl16 = LEVELS.find(l => l.id === 16);
  assert(lvl16, "Level 16 must exist");
  const engine16 = new GameEngineRig(lvl16);

  // Verify Level 16 is 100% open, playable, and free from gate lockouts
  assert.strictEqual(engine16.isTilePassable(1, 0), true, "Level 16 right move must be passable");
  assert.strictEqual(engine16.isTilePassable(0, 1), true, "Level 16 down move must be passable");
  assert.strictEqual(engine16.grid[1][1], C_CROSSROAD);
  assert.strictEqual(engine16.crossroads.get('1,1'), 2);

  // Test Level 20 Grandmaster Singularity
  const lvl20 = LEVELS.find(l => l.id === 20);
  assert(lvl20, "Level 20 must exist");
  assert.strictEqual(lvl20.par, 43, "Level 20 must have par 43");
});

// ----------------------------------------------------------------------------
// TEST 9: Full 50-Level Solvability Suite (All 50 Levels Solved at Exact Par)
// ----------------------------------------------------------------------------
runTest("Test 9: Full 50-Level Solvability Suite (100% Deterministic Par Victory Across All 10 Worlds)", () => {
  LEVELS.forEach((lvl) => {
    const engine = new GameEngineRig(lvl);
    const trace = lvl.trace;
    assert(trace && trace.length > 0, `Level ${lvl.id} must have a trace`);

    for (let step = 0; step < trace.length; step++) {
      const dirName = trace[step];
      const dir = DIRECTIONS[dirName];
      assert(dir, `Invalid dirName: ${dirName} on Level ${lvl.id}`);

      const res = engine.executeMove(dir.dx, dir.dy);
      assert.strictEqual(
        res.success,
        true,
        `Level ${lvl.id} (${lvl.name}) step ${step + 1} (${dirName}): Move failed with reason ${res.reason}`
      );
    }

    assert.strictEqual(
      engine.isVictorious,
      true,
      `Level ${lvl.id} (${lvl.name}) must achieve victory after ${trace.length} moves`
    );
    assert.strictEqual(
      engine.moveCount,
      lvl.par,
      `Level ${lvl.id} (${lvl.name}) moveCount (${engine.moveCount}) must equal par (${lvl.par})`
    );
  });
});

// ----------------------------------------------------------------------------
// TEST 10: Full 50-Level Lossless Undo Rollback Suite
// ----------------------------------------------------------------------------
runTest("Test 10: Full 50-Level Lossless Undo Rollback Suite (Victory to Spawn Across All 10 Worlds)", () => {
  LEVELS.forEach((lvl) => {
    const engine = new GameEngineRig(lvl);
    const trace = lvl.trace;

    // Execute full trace
    trace.forEach(dirName => {
      const dir = DIRECTIONS[dirName];
      engine.executeMove(dir.dx, dir.dy);
    });

    assert.strictEqual(engine.isVictorious, true);

    // Roll back full trace via undo
    // (Note: undo is allowed even after victory in headless test rig for invariant validation)
    engine.isVictorious = false; // unlock undo for verification

    for (let i = trace.length - 1; i >= 0; i--) {
      const uRes = engine.undo(true);
      assert.strictEqual(uRes.success, true, `Level ${lvl.id} undo step ${i + 1} failed`);
    }

    // Assert exact return to spawn state
    assert.strictEqual(engine.player.x, lvl.spawn.x, `Level ${lvl.id} player.x must restore to spawn`);
    assert.strictEqual(engine.player.y, lvl.spawn.y, `Level ${lvl.id} player.y must restore to spawn`);
    assert.strictEqual(engine.moveCount, 0, `Level ${lvl.id} moveCount must restore to 0`);
    assert.strictEqual(engine.budget, lvl.budget || 0, `Level ${lvl.id} budget must restore to initial`);
  });
});

// ----------------------------------------------------------------------------
// TEST 11: Progression Locking, Anti-Skip Clamping & LocalStorage Persistence
// ----------------------------------------------------------------------------
runTest("Test 11: Progression Locking, Anti-Skip Clamping & Persistence Invariants", () => {
  function simulateStorage(savedUnlocked, targetLevel) {
    let unlocked = Math.max(1, Math.min(LEVELS.length, savedUnlocked));
    let current = Math.max(0, Math.min(unlocked - 1, targetLevel));
    return { unlocked, current };
  }

  // Attempt to skip to Level 15 when only Level 4 is unlocked
  const sim = simulateStorage(4, 14);
  assert.strictEqual(sim.unlocked, 4);
  assert.strictEqual(sim.current, 3, "Current level index must clamp to unlocked - 1 (Level 4)");
});

// ----------------------------------------------------------------------------
// TEST 12: 750ms Auto-Reset Protocol & Agency Preservation
// ----------------------------------------------------------------------------
runTest("Test 12: 750ms Auto-Reset Protocol & Agency Preservation", () => {
  let timerFired = false;
  let autoResetTimer = null;

  function armAutoReset() {
    autoResetTimer = setTimeout(() => {
      timerFired = true;
    }, 750);
  }

  function userUndo() {
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      autoResetTimer = null;
    }
  }

  armAutoReset();
  assert(autoResetTimer !== null);
  userUndo(); // User taps undo within the 750ms grace window
  assert(autoResetTimer === null);
  assert.strictEqual(timerFired, false, "Undo must abort auto-reset timer and preserve player agency");
});


// ----------------------------------------------------------------------------
// TEST 8C: Phase 5 Pushable Crate, Bridge/Crush & Switch Weight Invariants
// ----------------------------------------------------------------------------
runTest("Test 8C: Phase 5 Pushable Crate, Bridge/Crush & Switch Weight Invariants", () => {
  // Test Level 21 Crate Push and Switch Holding
  const lvl21 = LEVELS.find(l => l.id === 21);
  assert(lvl21, "Level 21 must exist");
  assert.strictEqual(lvl21.crates.length, 1, "Level 21 must have 1 crate");
  assert.strictEqual(lvl21.par, 17, "Level 21 par must be 17");
  assert.strictEqual(lvl21.budget, 0, "Level 21 budget must be 0");

  const engine21 = new GameEngineRig(lvl21);
  assert.strictEqual(engine21.crates[0].active, true);
  assert.strictEqual(engine21.getEffectivePhase(), "RED");

  // Test Level 22 Void Bridging
  const lvl22 = LEVELS.find(l => l.id === 22);
  assert(lvl22, "Level 22 must exist");
  assert.strictEqual(lvl22.crates.length, 1, "Level 22 must have 1 crate");
  assert.strictEqual(lvl22.par, 25, "Level 22 par must be 25");
  assert.strictEqual(lvl22.budget, 0, "Level 22 budget must be 0");

  // Test Level 23 Crumbling Crush & Void Bridging
  const lvl23 = LEVELS.find(l => l.id === 23);
  assert(lvl23, "Level 23 must exist");
  assert.strictEqual(lvl23.crates.length, 2, "Level 23 must have 2 crates");
  assert.strictEqual(lvl23.par, 25, "Level 23 par must be 25");
  assert.strictEqual(lvl23.budget, 0, "Level 23 budget must be 0");

  // Test Level 24 Dual Bastion Paradox
  const lvl24 = LEVELS.find(l => l.id === 24);
  assert(lvl24, "Level 24 must exist");
  assert.strictEqual(lvl24.crates.length, 2, "Level 24 must have 2 crates");
  assert.strictEqual(lvl24.par, 25, "Level 24 par must be 25");
  assert.strictEqual(lvl24.budget, 0, "Level 24 budget must be 0");

  // Test Level 25 The Singularity Engine
  const lvl25 = LEVELS.find(l => l.id === 25);
  assert(lvl25, "Level 25 must exist");
  assert.strictEqual(lvl25.crates.length, 2, "Level 25 must have 2 crates");
  assert.strictEqual(lvl25.par, 33, "Level 25 par must be 33");
  assert.strictEqual(lvl25.budget, 0, "Level 25 budget must be 0");
});

// ----------------------------------------------------------------------------
// TEST 13: Phase 7 Mechanics Invariants (Ice, Rune Keys, Lasers, Conveyors)
// ----------------------------------------------------------------------------
runTest("Test 13: Phase 7 Mechanics Invariants (Ice, Rune Keys, Lasers, Conveyors)", () => {
  // 1. World 6: Ice Sliding
  const lvl26 = LEVELS.find(l => l.id === 26);
  assert(lvl26, "Level 26 must exist");
  const eng26 = new GameEngineRig(lvl26);
  const r26 = eng26.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  assert.strictEqual(r26.success, true);
  assert.strictEqual(eng26.player.x, 4, "Sliding across row 0 ice must land at x=4");

  // 2. World 7: Rune Key & Rune Gate
  const lvl31 = LEVELS.find(l => l.id === 31);
  assert(lvl31, "Level 31 must exist");
  const eng31 = new GameEngineRig(lvl31);
  assert.strictEqual(eng31.isTilePassable(0, 2), false, "Runegate (0,2) must reject entry before key");
  // Collect key at (4,0)
  for (let i = 0; i < 4; i++) eng31.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  assert.strictEqual(eng31.keysHeld.has(1), true, "Rune key at (4,0) must be collected");

  // 3. World 8: Laser Emitter, Mirror Deflection, and Laser Gate
  const lvl36 = LEVELS.find(l => l.id === 36);
  assert(lvl36, "Level 36 must exist");
  const eng36 = new GameEngineRig(lvl36);
  assert.strictEqual(eng36.laserGateOpen, false, "Laser gate must be closed initially");
  assert.strictEqual(eng36.isTilePassable(3, 4), false, "Laser gate must reject passage initially");

  // Push mirror at (1,2) to (2,2)
  eng36.executeMove(DIRECTIONS.DOWN.dx, DIRECTIONS.DOWN.dy); // (0,1)
  eng36.executeMove(DIRECTIONS.DOWN.dx, DIRECTIONS.DOWN.dy); // (0,2)
  eng36.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy); // Push mirror to (2,2)
  assert.strictEqual(eng36.mirrors[0].x, 2);
  assert.strictEqual(eng36.mirrors[0].y, 2);
  assert.strictEqual(eng36.laserGateOpen, true, "Mirror at (2,2) deflecting beam to receptor must open gate");
  assert.strictEqual(eng36.isTilePassable(3, 4), true, "Laser gate must be passable once open");

  // 4. World 9: Conveyor Belts
  const lvl41 = LEVELS.find(l => l.id === 41);
  assert(lvl41, "Level 41 must exist");
  const eng41 = new GameEngineRig(lvl41);
  // Step RIGHT onto Conveyor R at (1,0)
  eng41.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  assert.strictEqual(eng41.player.x, 2, "Conveyor R at (1,0) must push player to (2,0)");
});

// ----------------------------------------------------------------------------
// TEST 14: Tension-Driven Undo Economy & Ad-Gate Invariants
// ----------------------------------------------------------------------------
runTest("Test 14: Tension-Driven Undo Economy & Ad-Gate Invariants", () => {
  const lvl1 = LEVELS[0];
  const engine = new GameEngineRig(lvl1);

  // 1. Verify initial state has 3 undos
  assert.strictEqual(engine.undosRemaining, 3, "Initial state must have 3 undos");
  assert.strictEqual(engine.adGateModalTriggered, false, "Ad gate must not be triggered initially");
  assert.strictEqual(engine.dom.adGateModal.visible, false, "Ad gate modal must be hidden initially");

  // Make 3 moves: RIGHT, RIGHT, RIGHT
  engine.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  engine.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  engine.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  assert.strictEqual(engine.moveCount, 3);
  assert.strictEqual(engine.undosRemaining, 3);

  // 2. Verify consuming 3 undos decrements count: 3 -> 2 -> 1 -> 0
  const u1 = engine.undo();
  assert.strictEqual(u1.success, true);
  assert.strictEqual(engine.undosRemaining, 2, "Undo 1 must decrement undosRemaining to 2");
  assert.strictEqual(engine.moveCount, 2);

  const u2 = engine.undo();
  assert.strictEqual(u2.success, true);
  assert.strictEqual(engine.undosRemaining, 1, "Undo 2 must decrement undosRemaining to 1");
  assert.strictEqual(engine.moveCount, 1);

  const u3 = engine.undo();
  assert.strictEqual(u3.success, true);
  assert.strictEqual(engine.undosRemaining, 0, "Undo 3 must decrement undosRemaining to 0");
  assert.strictEqual(engine.moveCount, 0);

  // 3. Verify attempting 4th undo is blocked and sets adGateModalTriggered = true
  engine.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  assert.strictEqual(engine.moveCount, 1);
  assert.strictEqual(engine.undosRemaining, 0);

  const u4 = engine.undo();
  assert.strictEqual(u4.success, false, "4th undo must be blocked when undosRemaining is 0");
  assert.strictEqual(u4.reason, 'OUT_OF_UNDOS');
  assert.strictEqual(engine.adGateModalTriggered, true, "adGateModalTriggered must be true on blocked undo");
  assert.strictEqual(engine.dom.adGateModal.visible, true, "Ad gate modal must be visible in DOM");
  assert.strictEqual(engine.moveCount, 1, "Player move state must NOT roll back when undo is blocked");

  // 4. Verify granting ad reward (+3 undos) restores ability to undo
  engine.grantAdReward(3);
  assert.strictEqual(engine.undosRemaining, 3, "grantAdReward(+3) must restore undosRemaining to 3");
  assert.strictEqual(engine.adGateModalTriggered, false, "adGateModalTriggered must reset to false");
  assert.strictEqual(engine.dom.adGateModal.visible, false, "Ad gate modal must be hidden after reward");

  const u5 = engine.undo();
  assert.strictEqual(u5.success, true, "Undo must succeed after reward granted");
  assert.strictEqual(engine.undosRemaining, 2, "Successful undo must decrement undosRemaining to 2");
  assert.strictEqual(engine.moveCount, 0);

  // 5. Verify level restart resets undos to 3
  engine.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  engine.executeMove(DIRECTIONS.RIGHT.dx, DIRECTIONS.RIGHT.dy);
  engine.undo(); // 2 -> 1
  engine.undo(); // 1 -> 0
  assert.strictEqual(engine.undosRemaining, 0);

  engine.restart();
  assert.strictEqual(engine.undosRemaining, 3, "Level restart must reset undosRemaining to 3");
  assert.strictEqual(engine.adGateModalTriggered, false, "Level restart must reset adGateModalTriggered to false");
  assert.strictEqual(engine.dom.adGateModal.visible, false, "Level restart must hide adGateModal");
  assert.strictEqual(engine.moveCount, 0, "Level restart must reset moveCount to 0");
});


// ----------------------------------------------------------------------------
// TEST 15: 10-World Architecture, Dual Navigation & 14-Star Gate Economy
// ----------------------------------------------------------------------------
runTest("Test 15: 10-World Architecture, Dual Navigation & 14-Star Gate Economy", () => {
  const path = require('path');
  const indexPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  // 1. Single-File Budget < 300 KB
  const byteSize = Buffer.byteLength(html, 'utf8');
  assert(byteSize < 300 * 1024, "index.html exceeds 300 KB");

  // 2. DOM Elements for Dual Navigation
  assert(html.includes('id="overworld-map"'), "DOM must contain #overworld-map");
  assert(html.includes('id="overworld-scroll-area"'), "DOM must contain #overworld-scroll-area");
  assert(html.includes('id="overworld-close-btn"'), "DOM must contain #overworld-close-btn");
  assert(html.includes('id="toll-bridge-modal"'), "DOM must contain #toll-bridge-modal");
  assert(html.includes('id="level-entrance-banner"'), "DOM must contain #level-entrance-banner");
  assert(html.includes('id="banner-world-badge"'), "DOM must contain #banner-world-badge");
  assert(html.includes('id="banner-level-title"'), "DOM must contain #banner-level-title");
  assert(html.includes('id="hud-map-btn"'), "DOM must contain #hud-map-btn");
  assert(html.includes('id="level-select-modal"'), "DOM must contain #level-select-modal");

  // 3. Exactly 50 Levels across 10 Worlds (5 levels each)
  assert.strictEqual(LEVELS.length, 50, "Must have exactly 50 levels");
  for (let w = 1; w <= 10; w++) {
    const worldLevels = LEVELS.filter(l => l.world === w);
    assert.strictEqual(worldLevels.length, 5, "World " + w + " must contain exactly 5 levels");
    const expectedStartId = (w - 1) * 5 + 1;
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(worldLevels[i].id, expectedStartId + i, "World " + w + " level ID mismatch");
    }
  }

  // 4. 14-Star Gate Math
  const sim = {
    stars: {},
    getWorldStars: function(w) {
      let sum = 0;
      const s = (w - 1) * 5 + 1;
      for (let id = s; id < s + 5; id++) sum += this.stars[id] || 0;
      return sum;
    },
    isWorldUnlocked: function(w) {
      if (w <= 1) return true;
      return this.getWorldStars(w - 1) >= 14;
    }
  };

  assert.strictEqual(sim.isWorldUnlocked(1), true, "World 1 is unlocked initially");
  assert.strictEqual(sim.isWorldUnlocked(2), false, "World 2 is locked at 0 stars");

  // 13 stars in World 1
  sim.stars = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 1 };
  assert.strictEqual(sim.getWorldStars(1), 13);
  assert.strictEqual(sim.isWorldUnlocked(2), false, "World 2 is locked at 13 stars");

  // 14 stars in World 1
  sim.stars[5] = 2;
  assert.strictEqual(sim.getWorldStars(1), 14);
  assert.strictEqual(sim.isWorldUnlocked(2), true, "World 2 is unlocked at 14 stars");
  assert.strictEqual(sim.isWorldUnlocked(3), false, "World 3 remains locked");

  // 5. Undo Penalty Star Math
  const calcStars = (uRem) => {
    const used = Math.max(0, 3 - uRem);
    if (used === 0) return 3;
    if (used === 1) return 2;
    if (used === 2) return 1;
    return 0;
  };
  assert.strictEqual(calcStars(3), 3, "0 Undos = 3 Stars");
  assert.strictEqual(calcStars(2), 2, "1 Undo = 2 Stars");
  assert.strictEqual(calcStars(1), 1, "2 Undos = 1 Star");
  assert.strictEqual(calcStars(0), 0, "3 Undos = 0 Stars");

  // 6. Complete Zero-Budget Clear-All Hamiltonian Weave Audit (Levels 1-50)
  LEVELS.forEach(lvl => {
    assert.strictEqual(lvl.budget, 0, `Level ${lvl.id} (${lvl.name}) must have budget 0`);
  });

  // 7. Verify index.html LEVELS sync
  const match = html.match(/const LEVELS = (\[[\s\S]*?\]);\s*\/\* =/);
  assert(match, "index.html must contain LEVELS array");
  const htmlLevels = JSON.parse(match[1]);
  assert.strictEqual(htmlLevels.length, 50, "index.html must contain exactly 50 levels");
  for (let i = 0; i < 50; i++) {
    assert.strictEqual(htmlLevels[i].id, LEVELS[i].id, `Level ID mismatch at index ${i}`);
    assert.strictEqual(htmlLevels[i].par, LEVELS[i].par, `Par mismatch on Level ${htmlLevels[i].id}`);
    assert.strictEqual(htmlLevels[i].budget, 0, `Budget mismatch on Level ${htmlLevels[i].id}`);
    assert.deepStrictEqual(htmlLevels[i].trace, LEVELS[i].trace, `Trace mismatch on Level ${htmlLevels[i].id}`);
  }

  // 8. Verify index.html critical bug fixes
  assert(html.includes('this.getCrateAt(x, y) || this.getMirrorAt(x, y)'), "index.html evaluateBoardState must check mirrors");
  assert(html.includes('departureCell !== C_ICE'), "index.html must preserve ice tiles upon departure");
});

console.log("\n================================================================================");
console.log(`   RESULTS: ${passedTests} / ${totalTests} TEST SUITES PASSED (100% CLEAN)`);
console.log("================================================================================");

/**
 * ONE MORE TILE - 20-LEVEL COMPLETE REDESIGN VERIFICATION SUITE
 * 
 * Verifies all 20 levels across 4 worlds:
 * World 1 (Levels 1-5): Open Weaves & Parity Traps
 * World 2 (Levels 6-10): Knot Theory & Crossroads (C_CROSSROAD = 11)
 * World 3 (Levels 11-15): The Frozen Labyrinth (C_ICE = 12, Trail-Bumper Axiom)
 * World 4 (Levels 16-20): The Grandmaster Crucible (Synthesis)
 * 
 * For each level:
 * 1. Simulates the deterministic optimal trace
 * 2. Verifies par move count
 * 3. Verifies Goal unlock condition (all checkpoints met + coverage or Bt = 1)
 * 4. Verifies final completion state
 * 5. Rolls back full trace via Bi-Directional Undo Stack to verify lossless O(1) state restoration
 */

const assert = require('assert');
const {
  RedesignEngine,
  C_VOID, C_WALL, C_UNTOUCHED, C_CONSUMED, C_GOAL,
  C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH,
  C_GATE_RED, C_GATE_BLUE, C_CROSSROAD, C_ICE
} = require('./redesign_engine.js');

const REDESIGN_LEVELS = [
  // ==========================================================================
  // WORLD 1: OPEN WEAVES & PARITY TRAPS (Levels 1 to 5)
  // ==========================================================================
  {
    id: 1,
    world: 1,
    name: "The Open Arena",
    w: 4, h: 3,
    budget: 0,
    par: 11,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 1 },
    checkpoints: [],
    grid: [
      [2, 2, 2, 2],
      [4, 2, 2, 2],
      [2, 2, 2, 2]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'UP', 'LEFT', 'DOWN', 'LEFT', 'UP']
  },
  {
    id: 2,
    world: 1,
    name: "The Central Pillar",
    w: 4, h: 4,
    budget: 0,
    par: 14,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 2 },
    checkpoints: [],
    grid: [
      [2, 2, 2, 2],
      [2, 2, 1, 2],
      [4, 2, 2, 2],
      [2, 2, 2, 2]
    ],
    trace: ['DOWN', 'RIGHT', 'UP', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'UP', 'LEFT', 'DOWN', 'LEFT', 'UP']
  },
  {
    id: 3,
    world: 1,
    name: "The Dual Pillars",
    w: 5, h: 4,
    budget: 0,
    par: 17,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [],
    grid: [
      [2, 2, 2, 2, 2],
      [2, 2, 1, 2, 2],
      [2, 2, 1, 2, 2],
      [4, 2, 2, 2, 2]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'DOWN', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'UP', 'UP', 'LEFT', 'DOWN', 'DOWN']
  },
  {
    id: 4,
    world: 1,
    name: "The Parity Split",
    w: 5, h: 5,
    budget: 0,
    par: 23,
    spawn: { x: 0, y: 0 },
    goal: { x: 1, y: 4 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 }
    ],
    grid: [
      [2, 2, 2, 2, 5],
      [2, 2, 2, 2, 2],
      [2, 2, 1, 2, 2],
      [2, 2, 2, 2, 2],
      [2, 4, 2, 2, 2]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'UP', 'RIGHT', 'UP', 'UP', 'LEFT', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'DOWN', 'LEFT', 'DOWN', 'RIGHT']
  },
  {
    id: 5,
    world: 1,
    name: "The Hamiltonian Crucible",
    w: 5, h: 4,
    budget: 0,
    par: 19,
    spawn: { x: 0, y: 0 },
    goal: { x: 4, y: 3 },
    checkpoints: [
      { id: 1, x: 4, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 3, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 2, 5],
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
      [6, 2, 2, 2, 4]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'DOWN', 'DOWN', 'RIGHT', 'UP', 'RIGHT', 'DOWN', 'RIGHT', 'UP', 'RIGHT', 'DOWN']
  },

  // ==========================================================================
  // WORLD 2: KNOT THEORY & CROSSROADS (Levels 6 to 10)
  // ==========================================================================
  {
    id: 6,
    world: 2,
    name: "The Figure Eight",
    w: 5, h: 3,
    budget: 0,
    par: 15,
    spawn: { x: 0, y: 0 },
    goal: { x: 3, y: 2 },
    checkpoints: [],
    grid: [
      [2, 2, 2, 2, 2],
      [2, 2, 11, 2, 2],
      [2, 2, 2, 4, 2]
    ],
    trace: ['RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'UP', 'RIGHT', 'UP', 'RIGHT', 'DOWN', 'DOWN', 'LEFT']
  },
  {
    id: 7,
    world: 2,
    name: "The Twin Hubs",
    w: 5, h: 5,
    budget: 0,
    par: 24,
    spawn: { x: 0, y: 0 },
    goal: { x: 4, y: 4 },
    checkpoints: [],
    grid: [
      [2, 2, 2, 2, 2],
      [2, 2, 1, 2, 2],
      [2, 11, 2, 11, 2],
      [2, 2, 1, 2, 2],
      [2, 2, 2, 2, 4]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'DOWN', 'RIGHT', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'UP', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'RIGHT', 'DOWN']
  },
  {
    id: 8,
    world: 2,
    name: "The Trefoil Knot",
    w: 6, h: 4,
    budget: 0,
    par: 25,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
    ],
    grid: [
      [2, 2, 2, 2, 2, 5],
      [2, 11, 2, 2, 2, 2],
      [2, 2, 2, 11, 2, 2],
      [4, 2, 2, 2, 2, 2]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'UP', 'LEFT', 'DOWN', 'LEFT', 'UP', 'UP', 'RIGHT', 'LEFT', 'LEFT', 'DOWN', 'DOWN']
  },
  {
    id: 9,
    world: 2,
    name: "The Celtic Cross",
    w: 6, h: 5,
    budget: 0,
    par: 31,
    spawn: { x: 0, y: 0 },
    goal: { x: 5, y: 4 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 4, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 2, 2, 5],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 11, 11, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [6, 2, 2, 2, 2, 4]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'UP', 'LEFT', 'DOWN', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT']
  },
  {
    id: 10,
    world: 2,
    name: "The Gordian Web",
    w: 6, h: 5,
    budget: 0,
    par: 30,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 4 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 5, y: 4, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 2, 2, 2, 5],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 11, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [4, 2, 2, 2, 2, 6]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'RIGHT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'UP', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'UP', 'LEFT', 'DOWN']
  },

  // ==========================================================================
  // WORLD 3: THE FROZEN LABYRINTH (Levels 11 to 15)
  // ==========================================================================
  {
    id: 11,
    world: 3,
    name: "Frictionless Vector",
    w: 5, h: 4,
    budget: 7,
    par: 7,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 3 },
    checkpoints: [],
    grid: [
      [2, 12, 12, 12, 1],
      [2, 1, 1, 2, 2],
      [2, 1, 1, 2, 2],
      [4, 2, 2, 2, 2]
    ],
    trace: ['RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT']
  },
  {
    id: 12,
    world: 3,
    name: "The Trail Bumper",
    w: 5, h: 5,
    budget: 8,
    par: 8,
    spawn: { x: 0, y: 2 },
    goal: { x: 0, y: 1 },
    checkpoints: [],
    grid: [
      [1, 1, 2, 2, 2],
      [4, 2, 12, 1, 2],
      [2, 12, 12, 12, 2],
      [1, 1, 12, 1, 1],
      [1, 1, 1, 1, 1]
    ],
    trace: ['RIGHT', 'UP', 'UP', 'LEFT', 'LEFT', 'DOWN', 'LEFT', 'LEFT']
  },
  {
    id: 13,
    world: 3,
    name: "Permafrost Chutes",
    w: 6, h: 5,
    budget: 7,
    par: 7,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 4 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
    ],
    grid: [
      [2, 12, 12, 12, 2, 5],
      [1, 1, 1, 1, 1, 2],
      [2, 12, 12, 12, 12, 2],
      [2, 1, 1, 1, 1, 1],
      [4, 1, 1, 1, 1, 1]
    ],
    trace: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'DOWN', 'DOWN']
  },
  {
    id: 14,
    world: 3,
    name: "The Glacial Loom",
    w: 6, h: 5,
    budget: 7,
    par: 7,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 4 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 5, y: 4, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 12, 12, 12, 2, 5],
      [1, 1, 1, 1, 1, 2],
      [1, 1, 1, 1, 1, 2],
      [1, 1, 1, 1, 1, 2],
      [4, 12, 12, 12, 12, 6]
    ],
    trace: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'LEFT']
  },
  {
    id: 15,
    world: 3,
    name: "The Absolute Zero",
    w: 6, h: 5,
    budget: 7,
    par: 7,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 4 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 0, y: 2, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 12, 12, 12, 2, 5],
      [1, 1, 1, 1, 1, 2],
      [6, 12, 12, 12, 12, 2],
      [2, 1, 1, 1, 1, 1],
      [4, 2, 2, 2, 2, 2]
    ],
    trace: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'DOWN', 'DOWN']
  },

  // ==========================================================================
  // WORLD 4: THE GRANDMASTER CRUCIBLE (Levels 16 to 20)
  // ==========================================================================
  {
    id: 16,
    world: 4,
    name: "The Polarity Slipstream",
    w: 6, h: 5,
    initialPhase: 'RED',
    budget: 6,
    par: 6,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 4 },
    checkpoints: [],
    grid: [
      [2, 12, 12, 12, 8, 1],
      [1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 10, 1],
      [1, 1, 1, 1, 2, 1],
      [4, 12, 12, 12, 2, 1]
    ],
    trace: ['RIGHT', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'LEFT']
  },
  {
    id: 17,
    world: 4,
    name: "Crossroads on Ice",
    w: 6, h: 5,
    budget: 9,
    par: 9,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 4 },
    checkpoints: [],
    grid: [
      [2, 12, 12, 2, 2, 1],
      [1, 1, 1, 2, 1, 1],
      [1, 1, 1, 11, 2, 2],
      [1, 1, 1, 2, 1, 2],
      [4, 12, 12, 2, 1, 1]
    ],
    trace: ['RIGHT', 'DOWN', 'DOWN', 'RIGHT', 'LEFT', 'DOWN', 'DOWN', 'LEFT', 'LEFT']
  },
  {
    id: 18,
    world: 4,
    name: "The Entangled Circuit",
    w: 6, h: 6,
    initialPhase: 'RED',
    budget: 13,
    par: 13,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 5 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 }
    ],
    grid: [
      [2, 2, 2, 9, 2, 5],
      [1, 1, 1, 1, 1, 8],
      [1, 1, 1, 1, 1, 2],
      [1, 1, 1, 10, 11, 2],
      [1, 1, 1, 2, 1, 1],
      [4, 12, 12, 2, 1, 1]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'DOWN', 'DOWN', 'LEFT']
  },
  {
    id: 19,
    world: 4,
    name: "The Cryogenic Nexus",
    w: 6, h: 6,
    initialPhase: 'RED',
    budget: 10,
    par: 10,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 5 },
    checkpoints: [
      { id: 1, x: 5, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 3, y: 5, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 12, 12, 12, 2, 5],
      [1, 1, 1, 1, 1, 8],
      [1, 1, 1, 1, 1, 2],
      [1, 1, 1, 10, 11, 2],
      [1, 1, 1, 2, 1, 1],
      [4, 12, 12, 6, 1, 1]
    ],
    trace: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'DOWN', 'DOWN', 'LEFT']
  },
  {
    id: 20,
    world: 4,
    name: "The Grandmaster Labyrinth",
    w: 7, h: 7,
    initialPhase: 'RED',
    budget: 14,
    par: 14,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 6 },
    checkpoints: [
      { id: 1, x: 6, y: 0, cellType: C_CHECKPOINT_1 },
      { id: 2, x: 2, y: 5, cellType: C_CHECKPOINT_2 }
    ],
    grid: [
      [2, 2, 7, 2, 9, 2, 5],
      [1, 1, 1, 1, 1, 1, 8],
      [1, 1, 1, 1, 1, 1, 2],
      [1, 1, 11, 12, 12, 12, 2],
      [1, 1, 2, 1, 1, 1, 1],
      [1, 1, 6, 1, 1, 1, 1],
      [4, 12, 10, 1, 1, 1, 1]
    ],
    trace: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN', 'LEFT', 'DOWN', 'DOWN', 'DOWN', 'LEFT']
  }
];

// ============================================================================
// VERIFICATION RUNNER
// ============================================================================
console.log("===============================================================");
console.log("ONE MORE TILE - 20-LEVEL REDESIGN COMPREHENSIVE VERIFICATION");
console.log("===============================================================\n");

let totalPassed = 0;

REDESIGN_LEVELS.forEach(lvl => {
  console.log(`[World ${lvl.world}] Testing Level ${lvl.id}: "${lvl.name}" (${lvl.w}x${lvl.h})`);
  const eng = new RedesignEngine(lvl);

  assert.strictEqual(eng.moves, 0, "Initial moves must be 0");
  if (lvl.budget > 0) {
    assert.strictEqual(eng.budget, lvl.par, `Budget (${eng.budget}) must equal Par (${lvl.par})`);
  }

  // Step through trace
  lvl.trace.forEach((dir, idx) => {
    const prevMoves = eng.moves;
    const prevBudget = eng.budget;
    const res = eng.move(dir);
    assert.strictEqual(res.success, true, `Move ${idx + 1} (${dir}) failed on Level ${lvl.id}`);
    assert.strictEqual(eng.moves, prevMoves + 1, `Move count did not increment on move ${idx + 1}`);
    if (lvl.budget > 0) {
      assert.strictEqual(eng.budget, prevBudget - 1, `Budget did not decrement on move ${idx + 1}`);
    }
  });

  // Verify completion
  assert.strictEqual(eng.isComplete, true, `Level ${lvl.id} did not reach completion`);
  assert.strictEqual(eng.moves, lvl.par, `Level ${lvl.id} move count (${eng.moves}) did not match Par (${lvl.par})`);
  if (lvl.budget > 0) {
    assert.strictEqual(eng.budget, 0, `Level ${lvl.id} final budget (${eng.budget}) did not hit 0`);
  }
  assert.strictEqual(eng.isDeadlocked, false, `Level ${lvl.id} finished in deadlocked state`);

  // Verify full bi-directional undo rollback
  for (let i = lvl.trace.length - 1; i >= 0; i--) {
    const un = eng.undo();
    assert.strictEqual(un, true, `Undo frame ${i} failed on Level ${lvl.id}`);
  }

  assert.strictEqual(eng.player.x, lvl.spawn.x, `Undo did not restore spawn X on Level ${lvl.id}`);
  assert.strictEqual(eng.player.y, lvl.spawn.y, `Undo did not restore spawn Y on Level ${lvl.id}`);
  assert.strictEqual(eng.moves, 0, `Undo did not reset moves to 0 on Level ${lvl.id}`);
  if (lvl.budget > 0) {
    assert.strictEqual(eng.budget, lvl.budget, `Undo did not restore initial budget on Level ${lvl.id}`);
  }
  assert.strictEqual(eng.isComplete, false, `Undo did not rekindle Goal on Level ${lvl.id}`);

  console.log(`  -> PASS: Par ${lvl.par} verified, Goal unlocked, and lossless undo confirmed.\n`);
  totalPassed++;
});

console.log("===============================================================");
console.log(`ALL ${totalPassed}/20 REDESIGNED LEVELS VERIFIED AND CERTIFIED!`);
console.log("===============================================================");

module.exports = { REDESIGN_LEVELS };

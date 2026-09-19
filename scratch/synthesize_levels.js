const { verifyTrace, SimEngine, C_VOID, C_WALL, C_UNTOUCHED, C_GOAL, C_CHECKPOINT_1, C_CHECKPOINT_2, C_CRUMBLING, C_SWITCH, C_GATE_RED, C_GATE_BLUE, C_CROSSROAD } = require('./design_tool.js');

function solveLevel(levelDef) {
  const engine = new SimEngine(levelDef);
  const targetMoves = levelDef.par;
  let solution = null;

  function dfs(eng, path) {
    if (solution) return;
    if (eng.isComplete) {
      if (eng.moves === targetMoves && eng.getRemainingCount() === 0) {
        solution = [...path];
      }
      return;
    }
    if (eng.moves >= targetMoves) return;

    // Pruning: if remainingCount > (targetMoves - eng.moves), impossible
    const rem = eng.getRemainingCount();
    // Each move consumes at most 1 remaining (or 1 crossroad visit). Final move enters goal.
    // So rem must be <= (targetMoves - eng.moves - 1) before entering goal
    if (rem > (targetMoves - eng.moves)) return;

    const legal = eng.getLegalMoves();
    if (legal.length === 0) return;

    for (const m of legal) {
      eng.move(m.name);
      path.push(m.name);
      dfs(eng, path);
      path.pop();
      eng.undo();
      if (solution) return;
    }
  }

  dfs(engine, []);
  return solution;
}

module.exports = { solveLevel };

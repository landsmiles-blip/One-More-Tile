// Robust open-grid path searcher
function searchOpenPath({
  w, h, par, crCount = 1, spawn = [0, 0], goal = null, forbidden = []
}) {
  const totalSteps = par;
  const targetUnique = par + 1 - crCount;
  const forbSet = new Set(forbidden.map(p => `${p[0]},${p[1]}`));

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];

  const path = [spawn];
  const visitCounts = new Map();
  visitCounts.set(`${spawn[0]},${spawn[1]}`, 1);
  let uniqueCount = 1;

  let solution = null;

  function dfs(curr, crUsed) {
    if (solution) return;

    if (path.length === totalSteps + 1) {
      if (crUsed === crCount && uniqueCount === targetUnique) {
        // Ensure goal is not a crossroad (visitCount must be 1)
        const goalKey = `${curr[0]},${curr[1]}`;
        if (visitCounts.get(goalKey) === 1) {
          if (!goal || (curr[0] === goal[0] && curr[1] === goal[1])) {
            const crCoords = [];
            for (const [k, v] of visitCounts.entries()) {
              if (v === 2) {
                const [cx, cy] = k.split(',').map(Number);
                crCoords.push([cx, cy]);
              }
            }
            solution = {
              path: path.map(p => [...p]),
              crCoords
            };
          }
        }
      }
      return;
    }

    const stepsLeft = totalSteps + 1 - path.length;
    const crLeft = crCount - crUsed;
    const uniqueLeft = targetUnique - uniqueCount;
    if (stepsLeft < crLeft + uniqueLeft) return;

    for (const [dx, dy] of dirs) {
      const nx = curr[0] + dx;
      const ny = curr[1] + dy;

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const k = `${nx},${ny}`;
      if (forbSet.has(k)) continue;

      const vCount = visitCounts.get(k) || 0;

      if (vCount === 0) {
        if (uniqueCount < targetUnique) {
          uniqueCount++;
          visitCounts.set(k, 1);
          path.push([nx, ny]);
          dfs([nx, ny], crUsed);
          path.pop();
          visitCounts.set(k, 0);
          uniqueCount--;
        }
      } else if (vCount === 1 && crUsed < crCount) {
        // Second visit: crossroad!
        // Constraint: cannot be spawn
        if (nx === spawn[0] && ny === spawn[1]) continue;
        // Constraint: cannot be immediate previous cell
        const prev = path[path.length - 2];
        if (prev && prev[0] === nx && prev[1] === ny) continue;
        // Constraint: cannot be the final step (goal cannot be a crossroad)
        if (path.length === totalSteps) continue;

        visitCounts.set(k, 2);
        path.push([nx, ny]);
        dfs([nx, ny], crUsed + 1);
        path.pop();
        visitCounts.set(k, 1);
      }
      if (solution) return;
    }
  }

  dfs(spawn, 0);
  return solution;
}

module.exports = { searchOpenPath };

const { searchOpenPath } = require('./search_open_paths.js');
const { buildLevelFromPath } = require('./level_builder.js');

// Multi-path searcher that finds paths with branching factor >= 2.0
function findHighBranchingLevel({
  id, world, name, w, h, par, crCount = 1, crumbCount = 1,
  c1 = true, c2 = false, archetype, initialPhase = 'RED',
  minBranching = 2.0, maxAttempts = 500
}) {
  console.log(`[Level ${id}] Searching for ${name} (w:${w}, h:${h}, par:${par}, CR:${crCount})...`);

  // We can randomize direction order or spawn to explore diverse paths
  const dirsBase = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
  ];

  let bestLevel = null;
  let bestB = 0;

  // Search across different spawn locations
  const spawns = [
    [0, 0], [w - 1, 0], [0, h - 1], [Math.floor(w / 2), 0], [0, Math.floor(h / 2)]
  ];

  for (const spawn of spawns) {
    // Parity check: if par is even, goal must have same parity as spawn
    const targetUnique = par + 1 - crCount;
    const totalSteps = par;

    // Search
    let attempts = 0;
    const path = [spawn];
    const visitCounts = new Map();
    visitCounts.set(`${spawn[0]},${spawn[1]}`, 1);
    let uniqueCount = 1;

    function dfs(curr, crUsed) {
      if (bestLevel && bestB >= minBranching) return;
      attempts++;
      if (attempts > 300000) return; // budget per spawn

      if (path.length === totalSteps + 1) {
        if (crUsed === crCount && uniqueCount === targetUnique) {
          const goalKey = `${curr[0]},${curr[1]}`;
          if (visitCounts.get(goalKey) === 1) {
            const crCoords = [];
            for (const [k, v] of visitCounts.entries()) {
              if (v === 2) {
                const [cx, cy] = k.split(',').map(Number);
                crCoords.push([cx, cy]);
              }
            }

            // Pick checkpoints and crumbling bridges
            // If c2 is needed, ensure c1 step < c2 step
            // Crumb bridge should be between steps
            const candidate = evaluateCandidate(path, crCoords);
            if (candidate && candidate.branching_factor > bestB) {
              bestB = candidate.branching_factor;
              bestLevel = candidate;
              console.log(`  Found candidate with b = ${bestB}`);
            }
          }
        }
        return;
      }

      const stepsLeft = totalSteps + 1 - path.length;
      const crLeft = crCount - crUsed;
      const uniqueLeft = targetUnique - uniqueCount;
      if (stepsLeft < crLeft + uniqueLeft) return;

      for (const [dx, dy] of dirsBase) {
        const nx = curr[0] + dx;
        const ny = curr[1] + dy;

        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const k = `${nx},${ny}`;

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
          if (nx === spawn[0] && ny === spawn[1]) continue;
          const prev = path[path.length - 2];
          if (prev && prev[0] === nx && prev[1] === ny) continue;
          if (path.length === totalSteps) continue;

          visitCounts.set(k, 2);
          path.push([nx, ny]);
          dfs([nx, ny], crUsed + 1);
          path.pop();
          visitCounts.set(k, 1);
        }
        if (bestLevel && bestB >= minBranching) return;
      }
    }

    function evaluateCandidate(p, crs) {
      try {
        // Select distinct indices for c1, c2, crumbling
        const crSet = new Set(crs.map(c => `${c[0]},${c[1]}`));
        const availableIndices = [];
        for (let i = 1; i < p.length - 1; i++) {
          const pt = p[i];
          if (!crSet.has(`${pt[0]},${pt[1]}`)) {
            availableIndices.push(i);
          }
        }

        if (availableIndices.length < (crumbCount + (c1 ? 1 : 0) + (c2 ? 1 : 0))) {
          return null;
        }

        // Space them out
        let idx = 0;
        let c1Coord = null;
        let c2Coord = null;
        const crumbCoords = [];

        if (c1) {
          const c1Idx = availableIndices[Math.floor(availableIndices.length * 0.25)];
          c1Coord = p[c1Idx];
        }
        if (c2) {
          const c2Idx = availableIndices[Math.floor(availableIndices.length * 0.65)];
          c2Coord = p[c2Idx];
        }
        for (let i = 0; i < crumbCount; i++) {
          const frac = (i + 1) / (crumbCount + 1);
          const crIdx = availableIndices[Math.floor(availableIndices.length * frac)];
          // Ensure distinct
          if (!crumbCoords.some(c => c[0] === p[crIdx][0] && c[1] === p[crIdx][1]) &&
              (!c1Coord || p[crIdx][0] !== c1Coord[0] || p[crIdx][1] !== c1Coord[1]) &&
              (!c2Coord || p[crIdx][0] !== c2Coord[0] || p[crIdx][1] !== c2Coord[1])) {
            crumbCoords.push(p[crIdx]);
          }
        }

        const lvl = buildLevelFromPath({
          id, world, name, w, h, archetype,
          pathCoords: p,
          crCoords: crs,
          crumbCoords,
          c1Coord,
          c2Coord,
          initialPhase
        });

        return lvl;
      } catch (e) {
        return null;
      }
    }

    dfs(spawn, 0);
    if (bestLevel && bestB >= minBranching) break;
  }

  return bestLevel;
}

const l11 = findHighBranchingLevel({
  id: 11,
  world: 3,
  name: "The Bifurcated Nexus",
  w: 5,
  h: 5,
  par: 22,
  crCount: 1,
  crumbCount: 1,
  c1: true,
  c2: false,
  archetype: "Return Bridge & Lobe Isolation",
  minBranching: 2.0
});

if (l11) {
  console.log(`Successfully found Level 11! Branching: ${l11.branching_factor}`);
} else {
  console.log("Failed to find Level 11 with b >= 2.0");
}

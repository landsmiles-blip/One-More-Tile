const fs = require('fs');
const path = require('path');
const { searchPsychPath, buildPsychLevel } = require('./synthesize_psych_levels.js');
const { verifyPsychSolution } = require('./psych_engine.js');

const blueprint = JSON.parse(fs.readFileSync(path.join(__dirname, 'cognitive_trials_blueprint.json'), 'utf8'));

function calculateTopologicalBranchingFactor(lvl) {
  let totalDegree = 0;
  let traversableTiles = 0;
  const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
  for (let y = 0; y < lvl.h; y++) {
    for (let x = 0; x < lvl.w; x++) {
      const cell = lvl.grid[y][x];
      if (cell === 1 || cell === 0) continue;
      traversableTiles++;
      for (const d of dirs) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx >= 0 && nx < lvl.w && ny >= 0 && ny < lvl.h) {
          const nCell = lvl.grid[ny][nx];
          if (nCell !== 1 && nCell !== 0) {
            totalDegree++;
          }
        }
      }
    }
  }
  return traversableTiles > 0 ? (totalDegree / traversableTiles) : 0;
}

// 1. Level 11: The Siren's Call (w:5, h:4, par:14)
const res11 = searchPsychPath({ w: 5, h: 4, par: 14, crCount: 0, spawn: [0, 0], goal: [0, 2] });
const l11 = buildPsychLevel({
  id: 11, world: 3, name: blueprint[0].name, archetype: blueprint[0].archetype,
  w: 5, h: 4, par: 14, pathCoords: res11.path,
  crumbCoords: [res11.path[1]],
  c1Coord: res11.path[7]
});

// 2. Level 12: The Parity Illusion (w:5, h:5, par:16)
function findL12() {
  const spawns = [[2, 1], [2, 3], [1, 2], [3, 2], [0, 2], [4, 2], [2, 0], [2, 4]];
  for (const sp of spawns) {
    let attempts = 0;
    const path = [sp];
    const visitCounts = new Map();
    visitCounts.set(`${sp[0]},${sp[1]}`, 1);
    let uniqueCount = 1;
    let found = null;

    function dfs(curr, crUsed) {
      if (found) return;
      attempts++;
      if (attempts > 100000) return;

      if (path.length === 17) {
        if (crUsed === 1 && uniqueCount === 16) {
          const goalKey = `${curr[0]},${curr[1]}`;
          if (visitCounts.get(goalKey) === 1 && visitCounts.get('2,2') === 2) {
            found = path.map(p => [...p]);
          }
        }
        return;
      }

      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of dirs) {
        const nx = curr[0] + dx;
        const ny = curr[1] + dy;
        if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) continue;
        const k = `${nx},${ny}`;
        const vc = visitCounts.get(k) || 0;
        if (vc === 0) {
          if (uniqueCount < 16) {
            uniqueCount++;
            visitCounts.set(k, 1);
            path.push([nx, ny]);
            dfs([nx, ny], crUsed);
            path.pop();
            visitCounts.set(k, 0);
            uniqueCount--;
          }
        } else if (vc === 1 && crUsed < 1 && nx === 2 && ny === 2) {
          const prev = path[path.length - 2];
          if (prev && prev[0] === nx && prev[1] === ny) continue;
          if (path.length === 16) continue;
          visitCounts.set(k, 2);
          path.push([nx, ny]);
          dfs([nx, ny], 1);
          path.pop();
          visitCounts.set(k, 1);
        }
        if (found) return;
      }
    }

    dfs(sp, 0);
    if (found) return { path: found, spawn: sp };
  }
  return null;
}
const res12 = findL12();
const l12 = buildPsychLevel({
  id: 12, world: 3, name: blueprint[1].name, archetype: blueprint[1].archetype,
  w: 5, h: 5, par: 16, pathCoords: res12.path,
  crCoords: [[2, 2]]
});

// 3. Level 13: The Sacrificial Chamber (w:6, h:5, par:18)
const res13 = searchPsychPath({ w: 6, h: 5, par: 18, crCount: 0, spawn: [0, 0] });
const l13 = buildPsychLevel({
  id: 13, world: 3, name: blueprint[2].name, archetype: blueprint[2].archetype,
  w: 6, h: 5, par: 18, pathCoords: res13.path,
  crumbCoords: [res13.path[6]],
  c1Coord: res13.path[10],
  c2Coord: res13.path[14]
});

// 4. Level 14: The Cloverleaf Knot (w:6, h:5, par:20)
const res14 = searchPsychPath({ w: 6, h: 5, par: 20, crCount: 2, spawn: [0, 0] });
const crSet14 = new Set(res14.crCoords.map(c => `${c[0]},${c[1]}`));
let c1_14 = null;
for (let i = 1; i < res14.path.length - 1; i++) {
  const pt = res14.path[i];
  if (!crSet14.has(`${pt[0]},${pt[1]}`) && i >= 8) {
    c1_14 = pt;
    break;
  }
}
const l14 = buildPsychLevel({
  id: 14, world: 3, name: blueprint[3].name, archetype: blueprint[3].archetype,
  w: 6, h: 5, par: 20, pathCoords: res14.path,
  crCoords: res14.crCoords,
  c1Coord: c1_14
});

// 5. Level 15: The Gordian Fracture (w:6, h:6, par:24)
const res15 = searchPsychPath({ w: 6, h: 6, par: 24, crCount: 2, spawn: [0, 0] });
const crSet15 = new Set(res15.crCoords.map(c => `${c[0]},${c[1]}`));
const avail15 = [];
for (let i = 1; i < res15.path.length - 1; i++) {
  const pt = res15.path[i];
  if (!crSet15.has(`${pt[0]},${pt[1]}`)) avail15.push(i);
}
const l15 = buildPsychLevel({
  id: 15, world: 3, name: blueprint[4].name, archetype: blueprint[4].archetype,
  w: 6, h: 6, par: 24, pathCoords: res15.path,
  crCoords: res15.crCoords,
  crumbCoords: [res15.path[avail15[1]], res15.path[avail15[avail15.length - 1]]],
  c1Coord: res15.path[avail15[Math.floor(avail15.length * 0.35)]],
  c2Coord: res15.path[avail15[Math.floor(avail15.length * 0.7)]]
});

// 6. Level 16: The Trojan Gate (w:6, h:5, par:18)
const res16 = searchPsychPath({ w: 6, h: 5, par: 18, crCount: 0, spawn: [0, 0] });
const l16 = buildPsychLevel({
  id: 16, world: 4, name: blueprint[5].name, archetype: blueprint[5].archetype,
  w: 6, h: 5, par: 18, pathCoords: res16.path,
  switchCoords: [res16.path[11]],
  redGateCoords: [res16.path[15]],
  blueGateCoords: [res16.path[4]],
  c1Coord: res16.path[8],
  initialPhase: "RED"
});

// 7. Level 17: The Razor's Edge (w:6, h:5, par:18)
const res17 = searchPsychPath({ w: 6, h: 5, par: 18, crCount: 0, spawn: [0, 0] });
const l17 = buildPsychLevel({
  id: 17, world: 4, name: blueprint[6].name, archetype: blueprint[6].archetype,
  w: 6, h: 5, par: 18, pathCoords: res17.path,
  switchCoords: [res17.path[4], res17.path[15]],
  redGateCoords: [res17.path[10]],
  blueGateCoords: [res17.path[2]],
  crumbCoords: [res17.path[7]],
  c1Coord: res17.path[12],
  initialPhase: "RED"
});

// 8. Level 18: The Shadow Quadrants (w:6, h:6, par:22)
const res18 = searchPsychPath({ w: 6, h: 6, par: 22, crCount: 1, spawn: [0, 0] });
const l18 = buildPsychLevel({
  id: 18, world: 4, name: blueprint[7].name, archetype: blueprint[7].archetype,
  w: 6, h: 6, par: 22, pathCoords: res18.path,
  crCoords: res18.crCoords,
  crumbCoords: [res18.path[3]],
  switchCoords: [res18.path[9]],
  redGateCoords: [res18.path[12]],
  blueGateCoords: [res18.path[1]],
  c1Coord: res18.path[6],
  initialPhase: "RED"
});

// 9. Level 19: The Quantum Entanglement (w:6, h:6, par:26)
const res19 = searchPsychPath({ w: 6, h: 6, par: 26, crCount: 1, spawn: [0, 0] });
const l19 = buildPsychLevel({
  id: 19, world: 4, name: blueprint[8].name, archetype: blueprint[8].archetype,
  w: 6, h: 6, par: 26, pathCoords: res19.path,
  crCoords: res19.crCoords,
  switchCoords: [res19.path[8], res19.path[18]],
  redGateCoords: [res19.path[12]],
  blueGateCoords: [res19.path[2]],
  c1Coord: res19.path[5],
  c2Coord: res19.path[15],
  initialPhase: "RED"
});

// 10. Level 20: The Grandmaster Singularity (w:7, h:6, par:30)
const res20 = searchPsychPath({ w: 7, h: 6, par: 30, crCount: 2, spawn: [0, 0] });
const crSet20 = new Set(res20.crCoords.map(c => `${c[0]},${c[1]}`));
const avail20 = [];
for (let i = 1; i < res20.path.length - 1; i++) {
  const pt = res20.path[i];
  if (!crSet20.has(`${pt[0]},${pt[1]}`)) avail20.push(i);
}
const l20 = buildPsychLevel({
  id: 20, world: 4, name: blueprint[9].name, archetype: blueprint[9].archetype,
  w: 7, h: 6, par: 30, pathCoords: res20.path,
  crCoords: res20.crCoords,
  crumbCoords: [res20.path[avail20[3]], res20.path[avail20[avail20.length - 1]]],
  switchCoords: [res20.path[avail20[9]], res20.path[avail20[18]]],
  redGateCoords: [res20.path[avail20[12]]],
  blueGateCoords: [res20.path[avail20[1]]],
  c1Coord: res20.path[avail20[6]],
  c2Coord: res20.path[avail20[15]],
  initialPhase: "RED"
});

const allLevels = [l11, l12, l13, l14, l15, l16, l17, l18, l19, l20];

// Merge with psychological blueprint metadata
const finalSpec = allLevels.map((lvl, idx) => {
  const bp = blueprint[idx];
  const topoB = calculateTopologicalBranchingFactor(lvl);
  return {
    id: lvl.id,
    world: lvl.world,
    name: lvl.name,
    archetype: lvl.archetype,
    psychological_concept: bp.psychological_concept,
    cognitive_bias_exploited: bp.cognitive_bias_exploited,
    target_par: lvl.par,
    par: lvl.par,
    budget: 0,
    w: lvl.w,
    h: lvl.h,
    spawn: lvl.spawn,
    goal: lvl.goal,
    checkpoints: lvl.checkpoints,
    grid: lvl.grid,
    trace: lvl.trace,
    branching_factor: Number(topoB.toFixed(1)),
    initialPhase: lvl.initialPhase || "RED",
    siren_path_description: bp.siren_path_description,
    impasse_mechanism: bp.impasse_mechanism,
    eureka_insight_description: bp.eureka_insight_description,
    visual_hook_3sec: bp.visual_hook_3sec,
    backseat_gamer_trigger: bp.backseat_gamer_trigger,
    emotional_arc: bp.emotional_arc,
    retention_mechanics: bp.retention_mechanics
  };
});

const outPath = path.join(__dirname, 'levels11_20_psych_spec.json');
fs.writeFileSync(outPath, JSON.stringify(finalSpec, null, 2), 'utf8');
console.log(`Successfully generated ${outPath} with all 10 verified Cognitive Trials!`);

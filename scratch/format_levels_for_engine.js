const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('scratch/redesign_architect_spec.json', 'utf8'));

// Format levels for index.html (without trace, with all level fields)
const htmlLevelsCode = '    const LEVELS = ' + JSON.stringify(spec.levels.map(lvl => ({
  id: lvl.id,
  name: lvl.name,
  w: lvl.w,
  h: lvl.h,
  budget: lvl.budget,
  par: lvl.par,
  spawn: lvl.spawn,
  goal: lvl.goal,
  checkpoints: lvl.checkpoints,
  grid: lvl.grid,
  ...(lvl.initialPhase ? { initialPhase: lvl.initialPhase } : {})
})), null, 2).replace(/\n/g, '\n    ') + ';';

fs.writeFileSync('scratch/html_levels_snippet.js', htmlLevelsCode);
console.log('Successfully wrote scratch/html_levels_snippet.js');

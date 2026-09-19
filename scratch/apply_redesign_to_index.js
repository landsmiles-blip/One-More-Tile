const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Check constants
if (!html.includes('const C_CROSSROAD = 11;')) {
  html = html.replace(
    'const C_GATE_BLUE = 10;',
    'const C_GATE_BLUE = 10;\n    const C_CROSSROAD = 11;\n    const C_ICE = 12;'
  );
}

// 2. Replace LEVELS array
const spec = JSON.parse(fs.readFileSync('scratch/redesign_architect_spec.json', 'utf8'));
const levelsObj = spec.levels.map(lvl => ({
  id: lvl.id,
  world: lvl.world,
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
}));

const levelsStr = '    const LEVELS = ' + JSON.stringify(levelsObj, null, 2).replace(/\n/g, '\n    ') + ';';

const levelsRegex = /    const LEVELS = \[[\s\S]*?\n    \];/;
if (!levelsRegex.test(html)) {
  console.error("Could not find LEVELS array in index.html");
  process.exit(1);
}
html = html.replace(levelsRegex, levelsStr);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully replaced LEVELS in index.html');

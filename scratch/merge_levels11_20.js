const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Extract current LEVELS array from index.html
const m = html.match(/const LEVELS = (\[[\s\S]*?\n    \];)/);
if (!m) {
  console.error("Could not match LEVELS array in index.html");
  process.exit(1);
}

const currentLevels = eval(m[1]);
if (currentLevels.length !== 20) {
  console.error("Expected 20 levels in index.html, found: " + currentLevels.length);
  process.exit(1);
}

// 2. Keep Levels 1 to 10 STRICTLY UNTOUCHED
const levels1_10 = currentLevels.slice(0, 10);

// 3. Load new Levels 11 to 20 spec
const newSpec = JSON.parse(fs.readFileSync('scratch/levels11_20_spec.json', 'utf8'));
if (newSpec.length !== 10) {
  console.error("Expected 10 levels in levels11_20_spec.json, found: " + newSpec.length);
  process.exit(1);
}

const levels11_20 = newSpec.map(lvl => ({
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

// Combine: 1..10 untouched + 11..20 redesigned
const combinedLevels = [...levels1_10, ...levels11_20];

// Format replacement string with indentation
const replacementLevelsStr = 'const LEVELS = ' + JSON.stringify(combinedLevels, null, 2).replace(/\n/g, '\n    ') + ';';

html = html.replace(m[0], replacementLevelsStr);

// 4. Update line 3209 clamp: Math.max(48 -> Math.max(32 for ultra-small mobile viewports (e.g. Level 20 7-col on 320px)
if (html.includes('this.tileSize = Math.max(48, Math.min(110, proposedSize));')) {
  html = html.replace(
    'this.tileSize = Math.max(48, Math.min(110, proposedSize));',
    'this.tileSize = Math.max(32, Math.min(110, proposedSize));'
  );
  console.log("Updated tileSize clamp from 48 to 32 in index.html");
}

fs.writeFileSync('index.html', html, 'utf8');
console.log("Successfully merged redesigned Levels 11-20 into index.html!");

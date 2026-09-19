const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const spec = JSON.parse(fs.readFileSync('scratch/levels11_20_take3_spec.json', 'utf8'));

// Format levels 11-20 cleanly for index.html
const formattedLevels = spec.map(lvl => {
  const cleanLvl = {
    id: lvl.id,
    world: lvl.world,
    name: lvl.name,
    w: lvl.w,
    h: lvl.h,
    budget: lvl.budget || 0,
    par: lvl.par,
    spawn: lvl.spawn,
    goal: lvl.goal,
    checkpoints: lvl.checkpoints || [],
    grid: lvl.grid
  };
  if (lvl.initialPhase) {
    cleanLvl.initialPhase = lvl.initialPhase;
  }
  return cleanLvl;
});

// Locate boundaries
const l10Marker = '"id": 10,';
const l10Pos = indexHtml.indexOf(l10Marker);
if (l10Pos === -1) throw new Error('Could not find Level 10 marker');

const l11Start = indexHtml.indexOf('      {\r\n        "id": 11,', l10Pos) !== -1
  ? indexHtml.indexOf('      {\r\n        "id": 11,', l10Pos)
  : indexHtml.indexOf('      {\n        "id": 11,', l10Pos);

if (l11Start === -1) throw new Error('Could not find Level 11 start');

const endOfLevelsMarker = '\r\n    ];';
const endOfLevelsMarkerAlt = '\n    ];';
let levelsEnd = indexHtml.indexOf(endOfLevelsMarker, l11Start);
let markerUsed = endOfLevelsMarker;
if (levelsEnd === -1) {
  levelsEnd = indexHtml.indexOf(endOfLevelsMarkerAlt, l11Start);
  markerUsed = endOfLevelsMarkerAlt;
}
if (levelsEnd === -1) throw new Error('Could not find end of LEVELS array');

console.log('Level 11 start offset:', l11Start);
console.log('Levels end offset:', levelsEnd);

const isCRLF = indexHtml.includes('\r\n');
const newline = isCRLF ? '\r\n' : '\n';

// Convert formattedLevels to pretty JSON with 6-space indent
const jsonStrings = formattedLevels.map(lvl => {
  const jsonStr = JSON.stringify(lvl, null, 2);
  const indented = jsonStr.split('\n').map((line) => {
    return '      ' + line;
  }).join(newline);
  return indented;
});

const replacementBlock = jsonStrings.join(',' + newline);

const newIndexHtml = indexHtml.slice(0, l11Start) + replacementBlock + indexHtml.slice(levelsEnd);

fs.writeFileSync('index.html', newIndexHtml, 'utf8');
console.log('Successfully merged Take 3 (Levels 11-20) into index.html');

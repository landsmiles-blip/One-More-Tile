const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

const startIdx = html.indexOf('const LEVELS = [');
const endIdx = html.indexOf('];', startIdx) + 2;
const levelsCode = html.substring(startIdx, endIdx);

const fn = new Function(levelsCode.replace('const LEVELS =', 'return'));
const lvls = fn();

console.log('Total levels in index.html:', lvls.length);
assert.strictEqual(lvls.length, 20);

// Verify Levels 1 to 10
const expected1_10 = [
  { id: 1, name: "The Open Arena", par: 11, w: 4, h: 3 },
  { id: 2, name: "The Central Pillar", par: 14, w: 4, h: 4 },
  { id: 3, name: "The Dual Pillars", par: 17, w: 5, h: 4 },
  { id: 4, name: "The Parity Split", par: 23, w: 5, h: 5 },
  { id: 5, name: "The Hamiltonian Crucible", par: 19, w: 5, h: 4 },
  { id: 6, name: "The Figure Eight", par: 15, w: 5, h: 3 },
  { id: 7, name: "The Twin Hubs", par: 24, w: 5, h: 5 },
  { id: 8, name: "The Trefoil Knot", par: 25, w: 6, h: 4 },
  { id: 9, name: "The Celtic Cross", par: 31, w: 6, h: 5 },
  { id: 10, name: "The Gordian Web", par: 30, w: 6, h: 5 }
];

expected1_10.forEach((exp, idx) => {
  const actual = lvls[idx];
  assert.strictEqual(actual.id, exp.id, `Level ${exp.id} id mismatch`);
  assert.strictEqual(actual.name, exp.name, `Level ${exp.id} name mismatch`);
  assert.strictEqual(actual.par, exp.par, `Level ${exp.id} par mismatch`);
  assert.strictEqual(actual.w, exp.w, `Level ${exp.id} w mismatch`);
  assert.strictEqual(actual.h, exp.h, `Level ${exp.id} h mismatch`);
  console.log(`[PASS] Level ${exp.id}: "${exp.name}" 100% verified`);
});

console.log("\nALL LEVELS 1 TO 10 STRICTLY PRESERVED AND UNTOUCHED!");

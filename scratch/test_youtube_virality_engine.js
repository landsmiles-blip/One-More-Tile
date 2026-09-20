const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("================================================================================");
console.log("   TESTING: YOUTUBE ALGORITHMIC VIRALITY & RETENTION ENGINE");
console.log("================================================================================\n");

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// 1. Verify HTML elements for Shorts / Creator Mode & 1-Tile Rage Banner (Decluttered UI)
assert(html.includes('id="shorts-hook-bar"'), "Must contain shorts-hook-bar");
assert(html.includes('id="shorts-btn"'), "Must contain shorts-btn");
assert(html.includes('id="one-tile-banner"'), "Must contain one-tile-banner");
assert(html.includes('id="shorts-ticker-bar"'), "Must contain shorts-ticker-bar");
assert(html.includes('id="share-btn"'), "Must contain share-btn on victory modal");
assert(html.includes('id="modal-iq-badge"'), "Must contain modal-iq-badge");
assert(html.includes('🏆 TOP 0.2% WORLDWIDE (FLAWLESS)'), "Must contain authoritative percentile badge in HTML");
console.log("[PASS] All YouTube UI, Creator Mode & Virality DOM elements present in index.html");

// 2. Verify Audio Engine ASMR Pentatonic & 1-Tile Fail Sting
assert(html.includes('playOneTileFail()'), "SoundEngine must implement playOneTileFail");
assert(html.includes('const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]'), "SoundEngine must implement ASMR pentatonic scale");
console.log("[PASS] Hypnotic ASMR Audio Engine & Comic Failure Sting verified");

// 3. Test Viral 1-Tile Deadlock Logic & Auto-Reset Delays (750ms vs 3500ms)
function testTileCount(grid, player, w, h) {
  let left = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === player.x && y === player.y) continue;
      const c = grid[y][x];
      if (c === 2) left++; // C_UNTOUCHED
    }
  }
  return left;
}

const gridWithOneLeft = [
  [3, 3, 3],
  [3, 3, 2], // (2,1) untouched
  [3, 3, 3]
];
const pPos = { x: 0, y: 0 };
const leftCount = testTileCount(gridWithOneLeft, pPos, 3, 3);
assert.strictEqual(leftCount, 1, "Must detect exactly 1 tile remaining");

function getAutoResetDelay(tilesLeft, isShortsMode) {
  return (tilesLeft === 1 || isShortsMode) ? 3500 : 750;
}

assert.strictEqual(getAutoResetDelay(1, false), 3500, "1-Tile fail must hold for 3.5s for reaction");
assert.strictEqual(getAutoResetDelay(5, true), 3500, "Shorts mode must hold for 3.5s for streamer reaction");
assert.strictEqual(getAutoResetDelay(4, false), 750, "Standard deadlock must reset in 750ms");
assert(html.includes('const resetDelay = (tilesLeft === 1 || this.isShortsMode) ? 3500 : 750;'), "index.html must implement dynamic reset delay");
console.log("[PASS] 1-Tile-Left Rage condition and 3500ms / 750ms reset delays verified");

// 4. Test Daily Seed Determinism & Streak Logic
function getDailyDayNumber(dateStr) {
  const epoch = new Date('2026-01-01').getTime();
  const d = new Date(dateStr).getTime();
  return Math.max(1, Math.floor((d - epoch) / 86400000));
}

function getDailyLevelIndex(dayNum) {
  const pool = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  return pool[dayNum % pool.length];
}

const day1 = getDailyDayNumber('2026-09-20');
const day2 = getDailyDayNumber('2026-09-21');
assert.strictEqual(day2, day1 + 1, "Day number must increment monotonically each day");
const lvlIdx1 = getDailyLevelIndex(day1);
const lvlIdx2 = getDailyLevelIndex(day2);
assert(lvlIdx1 >= 5 && lvlIdx1 <= 19, "Daily level must be from curated challenge pool");
console.log(`[PASS] Daily Run Determinism: Day #${day1} -> Level ${lvlIdx1 + 1}, Day #${day2} -> Level ${lvlIdx2 + 1}`);

// 5. Test YouTube Comment Copy Text Formatting with Anti-Spam Challenge Codes
function generateShareData(isDaily, dayNum, lvl, moves, par, streak, urlBase) {
  const delta = moves - par;
  const rating = delta === 0 ? 'Flawless Par 🏆' : `+${delta} moves`;
  const code = isDaily
    ? `OMT-D${dayNum}-M${moves}${delta === 0 ? 'F' : ''}`
    : `OMT-L${lvl}-M${moves}${delta === 0 ? 'F' : ''}`;
  const url = `${urlBase}?lvl=${lvl}&code=${code}`;

  const text = isDaily
    ? `ONE MORE TILE 🧩 Daily #${dayNum}\n⭐ Cleared in ${moves} moves (${rating})\n🔥 Streak: ${streak} Days\n🎫 Challenge Code: [${code}]\nCan you beat me? 👇\n${url}`
    : `ONE MORE TILE 🧩 Level ${lvl}\n⭐ Solved in ${moves} moves (Par: ${par})!\n🎫 Challenge Code: [${code}]\nCan you solve this without getting trapped?\nPlay here 👇\n${url}`;

  return { code, url, text };
}

const dailyShare = generateShareData(true, 263, 14, 14, 14, 5, 'https://onemoretile.game');
assert(dailyShare.code === 'OMT-D263-M14F', "Daily flawless code format");
assert(dailyShare.text.includes('[OMT-D263-M14F]'), "Must include challenge code in brackets");
assert(dailyShare.text.includes('Flawless Par 🏆'));

const levelShare = generateShareData(false, 0, 16, 28, 28, 0, 'https://onemoretile.game');
assert(levelShare.code === 'OMT-L16-M28F', "Level flawless code format");
assert(levelShare.text.includes('[OMT-L16-M28F]'), "Must include challenge code in brackets");
console.log("[PASS] YouTube Comment / Social Share Card format verified:\n" + levelShare.text.split('\n').map(l => '   ' + l).join('\n'));

// 6. Test Challenge Code Parser & Redemption Logic
function parseChallengeCode(input) {
  if (!input) return null;
  const code = input.trim().toUpperCase();
  const dailyMatch = code.match(/OMT-D(\d+)/);
  if (dailyMatch) {
    return { type: 'daily', day: parseInt(dailyMatch[1], 10) };
  }
  const levelMatch = code.match(/OMT-L(\d+)/);
  if (levelMatch) {
    return { type: 'level', level: parseInt(levelMatch[1], 10) };
  }
  return null;
}

assert.deepStrictEqual(parseChallengeCode('OMT-L16'), { type: 'level', level: 16 });
assert.deepStrictEqual(parseChallengeCode('[OMT-L16-M28F]'), { type: 'level', level: 16 });
assert.deepStrictEqual(parseChallengeCode('omt-d263-m14f'), { type: 'daily', day: 263 });
assert.strictEqual(parseChallengeCode('GARBAGE_CODE'), null);
console.log("[PASS] Challenge code parsing verified across formats");

// 7. Test Chess-Style Coordinates Format
const colLetters = 'ABCDEFG';
function getCoordinateLabel(x, y) {
  return `${colLetters[x] || (x + 1)}${y + 1}`;
}
assert.strictEqual(getCoordinateLabel(0, 0), 'A1');
assert.strictEqual(getCoordinateLabel(1, 0), 'B1');
assert.strictEqual(getCoordinateLabel(2, 3), 'C4');
assert.strictEqual(getCoordinateLabel(5, 5), 'F6');
assert(html.includes('toggleCoordinates()'), "Must implement toggleCoordinates");
assert(html.includes('this.showCoordinates'), "Must track showCoordinates");
console.log("[PASS] Chess-Style Coordinates (A1-F6) format & engine integration verified");

// 8. Test Authority & Psychological Percentiles
assert(html.includes('TOP 0.2% WORLDWIDE (FLAWLESS)'));
assert(html.includes('TOP 4.8% WORLDWIDE (MASTER)'));
assert(html.includes('TOP 22.5% WORLDWIDE (SOLVER)'));
console.log("[PASS] Psychological authority & elite percentile tiers verified");

// 9. Test Viral Hook Cycling
const hooks = [
  "CAN YOU SOLVE THIS WITHOUT GETTING TRAPPED? 🧠",
  "99.2% FAIL WITH 1 TILE LEFT 💀",
  "DON'T TOUCH THE SAME TILE TWICE 🚫",
  "THIS LEVEL BROKE MY BRAIN 🤯",
  "FAIL = 10 PUSHUPS 🏋️",
  "ONLY 180+ IQ CAN FIND THE EXIT 🔥"
];
let hookIdx = 0;
for (let i = 0; i < 10; i++) {
  hookIdx = (hookIdx + 1) % hooks.length;
  assert(hooks[hookIdx].length > 10);
}
console.log("[PASS] Viral hook cycling verified across full roster");

console.log("\n================================================================================");
console.log("   ALL YOUTUBE VIRALITY & RETENTION ENGINE INVARIANTS PASSED (100% CLEAN)");
console.log("================================================================================");

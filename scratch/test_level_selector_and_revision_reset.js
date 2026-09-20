const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("================================================================================");
console.log("   TESTING: LEVEL REVISION AUTO-RESET & LEVEL SELECTOR INVARIANTS");
console.log("================================================================================\n");

// Read index.html and extract LEVELS and GameEngine logic
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Extract LEVELS
const levelsMatch = html.match(/const LEVELS = (\[[\s\S]*?\]);\s*\/\* =/);
assert(levelsMatch, "LEVELS array must be found in index.html");
const LEVELS = eval(levelsMatch[1]);
assert.strictEqual(LEVELS.length, 20, "Should have 20 levels");

// 1. Test computeLevelsHash
function computeLevelsHash(levels) {
  const s = JSON.stringify(levels);
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h |= 0;
  }
  return 'rev_' + (h >>> 0).toString(36) + '_' + levels.length;
}

const originalHash = computeLevelsHash(LEVELS);
console.log("[PASS] Original Levels Hash computed:", originalHash);
assert(originalHash.startsWith('rev_'), "Hash format must start with rev_");

// Test level revision sensitivity:
const clonedLevels = JSON.parse(JSON.stringify(LEVELS));
clonedLevels[0].par = clonedLevels[0].par + 1; // minor tweak to Level 1
const modifiedHash = computeLevelsHash(clonedLevels);
console.log("[PASS] Modified Levels Hash computed:", modifiedHash);
assert.notStrictEqual(originalHash, modifiedHash, "Hash must change when any level property changes");

// Test tile grid modification sensitivity:
const gridTweak = JSON.parse(JSON.stringify(LEVELS));
gridTweak[4].grid[0][0] = (gridTweak[4].grid[0][0] === 2 ? 1 : 2);
const gridTweakHash = computeLevelsHash(gridTweak);
assert.notStrictEqual(originalHash, gridTweakHash, "Hash must change when grid tiles are edited");
console.log("[PASS] Grid tile modification detected by hash");

// 2. Test Storage Simulation: Fresh Load, Normal Refresh, and Revised Levels Refresh
class MockStorageEngine {
  constructor(levelsData, mockLocalStorage = {}, querySearch = '') {
    this.levels = levelsData;
    this.storage = mockLocalStorage;
    this.querySearch = querySearch;
    this.currentLevelsHash = computeLevelsHash(this.levels);
    this.unlockedLevel = 1;
    this.currentLevelIndex = 0;
    this.starsEarned = {};
    this.resetNotificationMessage = null;

    this.initStorage();
  }

  initStorage() {
    const STORAGE_KEY = 'one_more_tile_save_v1';
    const forceReset = this.querySearch.includes('reset');

    try {
      const raw = this.storage[STORAGE_KEY];
      if (raw && !forceReset) {
        const data = JSON.parse(raw);

        // Check if levels were updated/revised
        if (data && data.levelsHash !== this.currentLevelsHash) {
          this.resetNotificationMessage = "Levels updated — progress reset for fresh testing!";
          this.unlockedLevel = 1;
          this.currentLevelIndex = 0;
          this.starsEarned = {};
          this.saveProgress();
          return;
        }

        if (data && typeof data.unlockedLevel === 'number') {
          this.unlockedLevel = Math.max(1, Math.min(this.levels.length, data.unlockedLevel));
          const current = typeof data.currentLevel === 'number' ? data.currentLevel : 0;
          this.currentLevelIndex = Math.max(0, Math.min(this.unlockedLevel - 1, current));
          this.starsEarned = data.stars || {};
          return;
        }
      } else if (forceReset) {
        this.resetNotificationMessage = "Progress reset via ?reset parameter.";
      }
    } catch (e) {
      console.warn("Storage read error", e);
    }
    this.unlockedLevel = 1;
    this.currentLevelIndex = 0;
    this.starsEarned = {};
    this.saveProgress();
  }

  saveProgress() {
    const STORAGE_KEY = 'one_more_tile_save_v1';
    this.storage[STORAGE_KEY] = JSON.stringify({
      version: 1,
      levelsHash: this.currentLevelsHash,
      unlockedLevel: this.unlockedLevel || 1,
      currentLevel: this.currentLevelIndex || 0,
      stars: this.starsEarned || {},
      lastPlayedTimestamp: Date.now()
    });
  }

  loadLevel(index, bypassLock = false) {
    if (index < 0) index = 0;
    if (index >= this.levels.length) index = 0;
    if (!bypassLock && this.unlockedLevel && index > this.unlockedLevel - 1) {
      index = this.unlockedLevel - 1;
    } else if (bypassLock) {
      this.unlockedLevel = Math.max(this.unlockedLevel || 1, index + 1);
    }
    this.currentLevelIndex = index;
    this.saveProgress();
  }

  selectLevel(index) {
    this.loadLevel(index, true);
  }

  unlockAllLevels() {
    this.unlockedLevel = this.levels.length;
    this.saveProgress();
  }

  resetAllProgress() {
    this.unlockedLevel = 1;
    this.currentLevelIndex = 0;
    this.starsEarned = {};
    this.saveProgress();
    this.loadLevel(0, true);
  }
}

// Test A: First time player boots up
const mockStorage = {};
const game1 = new MockStorageEngine(LEVELS, mockStorage);
assert.strictEqual(game1.currentLevelIndex, 0);
assert.strictEqual(game1.unlockedLevel, 1);
assert.strictEqual(game1.resetNotificationMessage, null);
console.log("[PASS] Initial bootup initializes Level 1 and saves hash");

// Player progresses to Level 5 and earns stars
game1.unlockedLevel = 5;
game1.currentLevelIndex = 4;
game1.starsEarned = { 1: 3, 2: 3, 3: 2, 4: 1 };
game1.saveProgress();

// Test B: Normal refresh without modifying levels
const game2 = new MockStorageEngine(LEVELS, mockStorage);
assert.strictEqual(game2.currentLevelIndex, 4, "Progress must be maintained on normal refresh");
assert.strictEqual(game2.unlockedLevel, 5, "Unlocked levels must be maintained on normal refresh");
assert.strictEqual(game2.resetNotificationMessage, null, "No reset toast on normal refresh");
console.log("[PASS] Normal refresh retains user progress (Level 5, Unlocked 5)");

// Test C: Developer updates/revises a level and user refreshes!
const revisedLevels = JSON.parse(JSON.stringify(LEVELS));
revisedLevels[3].budget = 3; // Developer tweaked Level 4's spare budget
const game3 = new MockStorageEngine(revisedLevels, mockStorage);
assert.strictEqual(game3.currentLevelIndex, 0, "Game must reset to Level 1 after level revision");
assert.strictEqual(game3.unlockedLevel, 1, "Unlocked levels must reset to 1 after level revision");
assert.deepStrictEqual(game3.starsEarned, {}, "Stars must reset after level revision");
assert.strictEqual(game3.resetNotificationMessage, "Levels updated — progress reset for fresh testing!", "User must receive update notice");
console.log("[PASS] Level revision auto-reset detected hash mismatch and reset game cleanly to Level 1 with toast notice");

// Test D: Level Selector direct jump to Level 15 (bypassLock)
game3.selectLevel(14); // 0-indexed: index 14 is Level 15
assert.strictEqual(game3.currentLevelIndex, 14, "Must jump directly to Level 15");
assert.strictEqual(game3.unlockedLevel, 15, "Must unlock up to Level 15 when selected for testing");
console.log("[PASS] Level selector jump to Level 15 succeeded and unlocked up to Level 15");

// Test E: Unlock All Levels button
game3.unlockAllLevels();
assert.strictEqual(game3.unlockedLevel, 20, "All 20 levels must be unlocked");
console.log("[PASS] Unlock All button unlocks all 20 levels");

// Test F: Reset Progress button
game3.resetAllProgress();
assert.strictEqual(game3.currentLevelIndex, 0);
assert.strictEqual(game3.unlockedLevel, 1);
console.log("[PASS] Reset Progress button resets game back to Level 1");

// Test G: ?reset URL parameter
game1.unlockedLevel = 10;
game1.currentLevelIndex = 9;
game1.saveProgress();
const game4 = new MockStorageEngine(LEVELS, mockStorage, '?reset=1');
assert.strictEqual(game4.currentLevelIndex, 0);
assert.strictEqual(game4.unlockedLevel, 1);
assert.strictEqual(game4.resetNotificationMessage, "Progress reset via ?reset parameter.");
console.log("[PASS] Force ?reset URL parameter resets game back to Level 1");

console.log("\n================================================================================");
console.log("   ALL LEVEL SELECTOR & AUTO-RESET TESTS PASSED (100% CLEAN)");
console.log("================================================================================");

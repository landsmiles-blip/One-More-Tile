const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch[1];

let domContentLoadedHandler = null;
let lastHUDText = '';
global.requestAnimationFrame = () => {};
global.window = {
  innerWidth: 400,
  innerHeight: 800,
  devicePixelRatio: 1,
  addEventListener: (evt, handler) => { if (evt === 'DOMContentLoaded') domContentLoadedHandler = handler; },
  removeEventListener: () => {}
};
global.document = {
  getElementById: (id) => ({
    getContext: () => ({
      save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {},
      beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
      fill: () => {}, fillRect: () => {}, strokeRect: () => {}, clearRect: () => {},
      arc: () => {}, roundRect: () => {}, fillText: () => {}, resetTransform: () => {},
      scale: () => {}
    }),
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 800 }),
    set textContent(t) { if (id === 'hud-remaining') lastHUDText = t; }
  }),
  addEventListener: () => {}
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.AudioContext = class {
  createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
  createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
};
global.performance = { now: () => Date.now() };

eval(script);

domContentLoadedHandler();
const game = window.game;
game.unlockedLevel = 20; // Unlock levels for headless testing
console.log('Testing Level 6 directly in index.html GameEngine...');
game.loadLevel(5); // Level 6 is index 5
console.log('Initial HUD text:', lastHUDText);
console.log('Initial Crossroads Map:', game.crossroads);

const trace = ['RIGHT', 'RIGHT', 'DOWN', 'LEFT', 'LEFT', 'DOWN', 'RIGHT', 'RIGHT', 'UP', 'RIGHT', 'UP', 'RIGHT', 'DOWN', 'DOWN', 'LEFT'];
const DIRS = {
  RIGHT: { x: 1, y: 0 },
  LEFT: { x: -1, y: 0 },
  DOWN: { x: 0, y: 1 },
  UP: { x: 0, y: -1 }
};

for (let i = 0; i < trace.length; i++) {
  const dirName = trace[i];
  const d = DIRS[dirName];
  game.isTransitioning = false; // complete transition
  game.attemptMove(d);
  console.log(`Step ${i+1} (${dirName}): player=(${game.player.x},${game.player.y}), goalUnlocked=${game.goalUnlocked}, HUD='${lastHUDText}', crossroad(2,1)=${game.crossroads.get('2,1')}, isVictorious=${game.isVictorious}`);
}

console.log('\n--- VERIFICATION RESULT ---');
console.log('Final isVictorious:', game.isVictorious);
console.log('Final moveCount:', game.moveCount);
console.log('Par:', game.level.par);

if (!game.isVictorious || game.moveCount !== game.level.par) {
  console.error('FAILED: Level 6 was not solved at par!');
  process.exit(1);
}

console.log('>>> LEVEL 6 VERIFIED 100% SOLVABLE IN INDEX.HTML! <<<');

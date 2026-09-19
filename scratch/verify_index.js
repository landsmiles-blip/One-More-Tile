const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('No script tag found in index.html');

console.log('Script tag extracted successfully. Length:', scriptMatch[1].length);

// Verify required IDs
const requiredIds = ['deadlock-banner', 'victory-modal', 'toast', 'game-canvas', 'level-num'];
requiredIds.forEach(id => {
  if (!html.includes('id="' + id + '"')) {
    throw new Error('Missing ID in index.html: ' + id);
  }
});
console.log('All required DOM IDs verified present in index.html: ' + requiredIds.join(', '));

// Syntax validation
try {
  new Function(scriptMatch[1]);
  console.log('index.html script syntax is 100% valid!');
} catch (e) {
  console.error('Syntax error in index.html script:', e);
  process.exit(1);
}

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
const popup = fs.readFileSync('extension/popup.html', 'utf8');

assert.strictEqual(manifest.manifest_version, 3);
assert.deepStrictEqual(manifest.permissions, ['activeTab', 'scripting']);
assert.ok(!manifest.host_permissions, 'Defrost must not request persistent host access');
assert.ok(!manifest.background, 'Defrost should run only after a user click');
assert.strictEqual(manifest.action.default_popup, 'popup.html');
assert.match(popup, /<html lang="en">/);
assert.match(popup, /name="viewport"/);
assert.match(popup, /<title>[^<]+<\/title>/);
assert.ok(!/<button\b(?![^>]*\btype=)/i.test(popup), 'all buttons need an explicit type');

for (const iconPath of new Set([
  ...Object.values(manifest.icons || {}),
  ...Object.values((manifest.action && manifest.action.default_icon) || {}),
])) {
  assert.ok(fs.existsSync(path.join('extension', iconPath)), 'manifest icon is missing: ' + iconPath);
}

console.log('ok, Defrost package checks passed');

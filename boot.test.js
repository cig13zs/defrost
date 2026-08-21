// node boot.test.js
var assert = require('assert');
var fs = require('fs');
var path = require('path');

// 1. Verify manifest.json
var manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'extension', 'manifest.json'), 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'manifest is MV3');
assert.ok(manifest.permissions.indexOf('activeTab') >= 0, 'declares activeTab');
assert.ok(manifest.permissions.indexOf('scripting') >= 0, 'declares scripting');

// 2. Verify core.js sync
var srcCore = fs.readFileSync(path.join(__dirname, 'src', 'core.js'), 'utf8');
var extCore = fs.readFileSync(path.join(__dirname, 'extension', 'core.js'), 'utf8');
assert.strictEqual(srcCore, extCore, 'src/core.js and extension/core.js are in sync');

// 3. Verify zero remote servers in extension
assert.strictEqual(extCore.indexOf('http://'), -1, 'zero remote http urls in core');
assert.strictEqual(extCore.indexOf('https://'), -1, 'zero remote https urls in core');

console.log('ok, boot.test.js passed all assertions');

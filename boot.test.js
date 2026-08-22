// node boot.test.js
var assert = require('assert');
var fs = require('fs');
var path = require('path');

// 1. Verify manifest.json
var manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'extension', 'manifest.json'), 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'manifest is MV3');
assert.ok(manifest.permissions.indexOf('activeTab') >= 0, 'declares activeTab');
assert.ok(manifest.permissions.indexOf('scripting') >= 0, 'declares scripting');
assert.strictEqual(manifest.permissions.indexOf('sidePanel'), -1, 'does not request unused sidePanel access');

// 2. Verify core.js sync
var srcCore = fs.readFileSync(path.join(__dirname, 'src', 'core.js'), 'utf8');
var extCore = fs.readFileSync(path.join(__dirname, 'extension', 'core.js'), 'utf8');
assert.strictEqual(srcCore, extCore, 'src/core.js and extension/core.js are in sync');
var srcPopup = fs.readFileSync(path.join(__dirname, 'src', 'popup.js'), 'utf8');
var extPopup = fs.readFileSync(path.join(__dirname, 'extension', 'popup.js'), 'utf8');
assert.strictEqual(srcPopup, extPopup, 'src/popup.js and extension/popup.js are in sync');
var srcPopupHtml = fs.readFileSync(path.join(__dirname, 'src', 'popup.html'), 'utf8');
var extPopupHtml = fs.readFileSync(path.join(__dirname, 'extension', 'popup.html'), 'utf8');
assert.strictEqual(srcPopupHtml, extPopupHtml, 'src/popup.html and extension/popup.html are in sync');
assert.doesNotThrow(function () { new Function(srcPopup); }, 'popup.js parses');

// 3. Verify zero remote servers in extension
assert.strictEqual(extCore.indexOf('http://'), -1, 'zero remote http urls in core');
assert.strictEqual(extCore.indexOf('https://'), -1, 'zero remote https urls in core');
assert.strictEqual(extCore.indexOf('filter: none'), -1, 'does not reveal filtered content');
assert.strictEqual(extCore.indexOf("setProperty('display', 'none'"), -1, 'does not hide overlays');

console.log('ok, boot.test.js passed all assertions');

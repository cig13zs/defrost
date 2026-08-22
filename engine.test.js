// node engine.test.js
var assert = require('assert');
var Defrost = require('./src/core.js');

// Mock a hostile DOM environment
var mockDoc = {
  head: {
    children: [],
    appendChild: function (el) { this.children.push(el); }
  },
  getElementById: function (id) {
    return this.head.children.find(function (c) { return c.id === id; }) || null;
  },
  createElement: function (tag) {
    return { tagName: tag.toUpperCase(), id: '', textContent: '' };
  },
  documentElement: {
    oncontextmenu: function () { return false; },
    oncopy: function () { return false; }
  },
  body: {
    onselectstart: function () { return false; },
    ondragstart: function () { return false; }
  },
  querySelectorAll: function (selector) {
    if (selector.indexOf('[on') === 0) {
      return [
        {
          tagName: 'DIV',
          oncopy: function () { return false; },
          removeAttribute: function (attr) { delete this[attr]; }
        }
      ];
    }
    return [];
  },
  addEventListener: function (evt, handler, capture) {
    this.listeners = this.listeners || [];
    this.listeners.push({ evt: evt, handler: handler, capture: capture });
  }
};

var mockWin = {
  oncontextmenu: function () { return false; },
  addEventListener: function (evt, handler, capture) {
    this.listeners = this.listeners || [];
    this.listeners.push({ evt: evt, handler: handler, capture: capture });
  }
};

// 1. Test style injection
var styleRes = Defrost.injectStyles(mockDoc);
assert.strictEqual(styleRes, true, 'injects unbreak styles into document head');
assert.strictEqual(mockDoc.head.children.length, 1, 'head contains unbreak stylesheet');
assert.ok(mockDoc.head.children[0].textContent.indexOf('user-select: auto !important') >= 0, 'forces user-select');
assert.strictEqual(mockDoc.head.children[0].textContent.indexOf('filter: none'), -1, 'does not reveal blurred or filtered content');

// 2. Test inline handler clearing
var cleared = Defrost.clearInlineHandlers(mockDoc, mockWin);
assert.ok(cleared >= 4, 'cleared hostile inline handlers on window, doc, and elements');
assert.strictEqual(mockDoc.documentElement.oncontextmenu, null, 'doc contextmenu cleared');
assert.strictEqual(mockDoc.body.onselectstart, null, 'body selectstart cleared');

// 3. Test listener attachment
var armed = Defrost.stopHostileListeners(mockDoc, mockWin);
assert.strictEqual(armed, true, 'arms capturing event listeners');
assert.ok(mockWin.listeners.length >= 4, 'listeners attached for contextmenu, copy, cut, selectstart');

// 4. Test unbreak bundle execution
var res = Defrost.unbreak(mockDoc, mockWin);
assert.strictEqual(res.success, true, 'unbreak executes cleanly');
assert.strictEqual(typeof res.timestamp, 'number');
assert.strictEqual(Object.prototype.hasOwnProperty.call(res, 'modalsDismissed'), false, 'does not hide overlays');
assert.strictEqual(typeof Defrost.dismissOverlays, 'undefined', 'overlay removal is not exposed');

console.log('ok, engine.test.js passed all assertions');

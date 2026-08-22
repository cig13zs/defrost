// Defrost core engine for restoring native browser behavior.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Defrost = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var UNBREAK_STYLE_ID = 'defrost-unbreak-css';
  var HOSTILE_EVENTS = [
    'contextmenu', 'copy', 'cut', 'selectstart'
  ];

  function createUnbreakCSS() {
    return [
      '/* Defrost: restore native text selection and page scrolling */',
      '*, *::before, *::after {',
      '  user-select: auto !important;',
      '  -webkit-user-select: auto !important;',
      '  -moz-user-select: auto !important;',
      '  -ms-user-select: auto !important;',
      '}',
      'html, body {',
      '  overflow: auto !important;',
      '  overflow-y: auto !important;',
      '  position: static !important;',
      '  height: auto !important;',
      '  max-height: none !important;',
      '}'
    ].join('\n');
  }

  function injectStyles(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.head) return false;
    var existing = doc.getElementById(UNBREAK_STYLE_ID);
    if (existing) return true;
    var style = doc.createElement('style');
    style.id = UNBREAK_STYLE_ID;
    style.textContent = createUnbreakCSS();
    doc.head.appendChild(style);
    return true;
  }

  function clearInlineHandlers(doc, win) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    win = win || (typeof window !== 'undefined' ? window : null);
    if (!doc) return 0;
    var cleared = 0;
    var targets = [win, doc, doc.documentElement, doc.body].filter(Boolean);
    
    HOSTILE_EVENTS.forEach(function (evt) {
      var prop = 'on' + evt;
      targets.forEach(function (el) {
        if (el && el[prop] !== null && el[prop] !== undefined) {
          try { el[prop] = null; cleared++; } catch (e) {}
        }
      });
      
      if (doc.querySelectorAll) {
        var inlineEls = doc.querySelectorAll('[' + prop + ']');
        for (var i = 0; i < inlineEls.length; i++) {
          try {
            inlineEls[i].removeAttribute(prop);
            inlineEls[i][prop] = null;
            cleared++;
          } catch (e) {}
        }
      }
    });

    return cleared;
  }

  function stopHostileListeners(doc, win) {
    win = win || (typeof window !== 'undefined' ? window : null);
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!win || !win.addEventListener) return false;

    function captureUnblock(e) {
      if (e.type === 'contextmenu' || e.type === 'copy' || e.type === 'cut' || e.type === 'selectstart') {
        e.stopImmediatePropagation ? e.stopImmediatePropagation() : (e.stopPropagation && e.stopPropagation());
      }
    }

    try {
      ['contextmenu', 'copy', 'cut', 'selectstart'].forEach(function (evt) {
        win.addEventListener(evt, captureUnblock, true);
        if (doc) doc.addEventListener(evt, captureUnblock, true);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function unbreak(doc, win) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    win = win || (typeof window !== 'undefined' ? window : null);
    
    var styleInjected = injectStyles(doc);
    var handlersCleared = clearInlineHandlers(doc, win);
    var listenersArmed = stopHostileListeners(doc, win);

    return {
      success: true,
      styleInjected: styleInjected,
      handlersCleared: handlersCleared,
      listenersArmed: listenersArmed,
      timestamp: Date.now()
    };
  }

  return {
    unbreak: unbreak,
    injectStyles: injectStyles,
    clearInlineHandlers: clearInlineHandlers,
    stopHostileListeners: stopHostileListeners,
    createUnbreakCSS: createUnbreakCSS
  };
}));

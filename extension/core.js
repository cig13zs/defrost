// defrost core engine — unbreak hostile web restrictions offline
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
    'contextmenu', 'copy', 'cut', 'paste', 'selectstart',
    'dragstart', 'mousedown', 'mouseup', 'keydown', 'keyup'
  ];

  function createUnbreakCSS() {
    return [
      '/* Defrost: Force native text selection, scroll, and clear filters */',
      '*, *::before, *::after {',
      '  user-select: auto !important;',
      '  -webkit-user-select: auto !important;',
      '  -moz-user-select: auto !important;',
      '  -ms-user-select: auto !important;',
      '  pointer-events: auto !important;',
      '}',
      'html, body {',
      '  overflow: auto !important;',
      '  overflow-y: auto !important;',
      '  position: static !important;',
      '  height: auto !important;',
      '  max-height: none !important;',
      '}',
      'article, main, p, div, span, section, code, pre {',
      '  filter: none !important;',
      '  -webkit-filter: none !important;',
      '  backdrop-filter: none !important;',
      '  -webkit-backdrop-filter: none !important;',
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
    
    // Also scan all inline elements with hostile attributes
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

    // Capture phase listener that halts preventDefault on copy and contextmenu
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

  function dismissOverlays(doc, win) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    win = win || (typeof window !== 'undefined' ? window : null);
    if (!doc || !doc.querySelectorAll) return 0;
    
    var dismissed = 0;
    var winW = (win && win.innerWidth) || 1024;
    var winH = (win && win.innerHeight) || 768;
    var elements = doc.querySelectorAll('div, section, aside');

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.id === UNBREAK_STYLE_ID) continue;
      try {
        var style = (win && win.getComputedStyle) ? win.getComputedStyle(el) : el.style;
        if (!style) continue;
        var pos = style.position;
        var zIndex = parseInt(style.zIndex, 10) || 0;
        
        if ((pos === 'fixed' || pos === 'absolute') && zIndex >= 99) {
          var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
          if (rect && rect.width >= winW * 0.7 && rect.height >= winH * 0.7) {
            // Confirm it is an overlay / backdrop rather than the main app container
            var hasBackdrop = style.backgroundColor.indexOf('rgba') >= 0 || style.opacity !== '1' || style.backdropFilter !== 'none';
            if (hasBackdrop || zIndex >= 999) {
              el.style.setProperty('display', 'none', 'important');
              dismissed++;
            }
          }
        }
      } catch (e) {}
    }

    return dismissed;
  }

  function unbreak(doc, win) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    win = win || (typeof window !== 'undefined' ? window : null);
    
    var styleInjected = injectStyles(doc);
    var handlersCleared = clearInlineHandlers(doc, win);
    var listenersArmed = stopHostileListeners(doc, win);
    var modalsDismissed = dismissOverlays(doc, win);

    return {
      success: true,
      styleInjected: styleInjected,
      handlersCleared: handlersCleared,
      listenersArmed: listenersArmed,
      modalsDismissed: modalsDismissed,
      timestamp: Date.now()
    };
  }

  return {
    unbreak: unbreak,
    injectStyles: injectStyles,
    clearInlineHandlers: clearInlineHandlers,
    stopHostileListeners: stopHostileListeners,
    dismissOverlays: dismissOverlays,
    createUnbreakCSS: createUnbreakCSS
  };
}));

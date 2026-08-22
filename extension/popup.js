(function () {
  var btn = document.getElementById('defrost-btn');
  var resultBox = document.getElementById('result');
  var chipsBox = document.getElementById('chips');

  function fail(message) {
    btn.disabled = false;
    btn.textContent = 'Try again';
    resultBox.style.display = 'block';
    resultBox.querySelector('.verdict').textContent = message;
    chipsBox.replaceChildren();
  }

  function addChip(label, value) {
    var chip = document.createElement('span');
    chip.className = 'chip';
    var number = document.createElement('b');
    number.textContent = String(value);
    chip.append(number, ' ' + label);
    chipsBox.appendChild(chip);
  }

  btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Restoring...';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (chrome.runtime.lastError) {
        fail('Could not inspect this tab');
        return;
      }
      if (!tabs || !tabs[0] || !tabs[0].id) {
        fail('No active tab found');
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['core.js']
      }, function () {
        if (chrome.runtime.lastError) {
          fail('Chrome blocked access to this page');
          return;
        }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: function () {
            return window.Defrost ? window.Defrost.unbreak() : null;
          }
        }, function (results) {
          if (chrome.runtime.lastError) {
            fail('Could not restore this page');
            return;
          }
          btn.disabled = false;
          btn.textContent = 'Restore again';
          resultBox.style.display = 'block';
          resultBox.querySelector('.verdict').textContent = 'Browser controls restored';

          var res = (results && results[0] && results[0].result) || {};
          chipsBox.replaceChildren();
          addChip('selection and scroll rules applied', res.styleInjected ? 1 : 0);
          addChip('inline traps cleared', res.handlersCleared || 0);
          addChip('copy and right-click guards armed', res.listenersArmed ? 1 : 0);
        });
      });
    });
  });
})();

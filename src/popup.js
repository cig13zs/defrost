(function () {
  var btn = document.getElementById('defrost-btn');
  var resultBox = document.getElementById('result');
  var chipsBox = document.getElementById('chips');

  btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Defrosting…';

    chrome.tabs.query({ active: true, currentWindow
      : true }, function (tabs) {
      if (!tabs || !tabs[0] || !tabs[0].id) {
        btn.textContent = 'Error: No active tab';
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['core.js']
      }, function () {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: function () {
            return window.Defrost ? window.Defrost.unbreak() : null;
          }
        }, function (results) {
          btn.disabled = false;
          btn.textContent = '❄️ Defrost Again';
          resultBox.style.display = 'block';

          var res = (results && results[0] && results[0].result) || {};
          chipsBox.innerHTML = '';

          var items = [
            '<b>Text Selection</b> Unlocked',
            '<b>Scroll</b> Restored',
            '<b>' + (res.handlersCleared || 0) + '</b> Traps Cleared',
            '<b>' + (res.modalsDismissed || 0) + '</b> Modals Removed'
          ];

          items.forEach(function (html) {
            var chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = html;
            chipsBox.appendChild(chip);
          });
        });
      });
    });
  });
();

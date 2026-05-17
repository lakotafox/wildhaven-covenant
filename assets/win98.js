/* Wildhaven Covenant — shared Win98 behavior */
(function () {
  'use strict';

  // ---- Taskbar clock ----
  function tick() {
    var el = document.getElementById('clock');
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit'
    });
  }
  tick();
  setInterval(tick, 10000);

  // ---- Start menu toggle ----
  var startBtn = document.querySelector('.start-button');
  var startMenu = document.querySelector('.start-menu');
  if (startBtn && startMenu) {
    startBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      startMenu.classList.toggle('active');
    });
  }
  document.addEventListener('click', function (e) {
    if (!startMenu) return;
    if (!e.target.closest('.start-button') && !e.target.closest('.start-menu')) {
      startMenu.classList.remove('active');
    }
  });

  // ---- Window controls: X = "minimize" to taskbar feel ----
  document.querySelectorAll('[data-win-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var w = document.querySelector('.window');
      if (!w) return;
      w.style.transition = 'opacity .15s, transform .15s';
      w.style.opacity = '0';
      w.style.transform = 'translateX(-50%) scale(.96)';
      setTimeout(function () {
        w.style.opacity = '1';
        w.style.transform = 'translateX(-50%) scale(1)';
        var c = w.querySelector('.window-content');
        if (c) c.scrollTop = 0;
      }, 450);
    });
  });

  // ---- Tabs ----
  document.querySelectorAll('.tabs').forEach(function (group) {
    var tabs = group.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var scope = group.parentElement;
        scope.querySelectorAll('.tab-pane').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-pane') === target);
        });
      });
    });
  });

  // ---- Modals ----
  window.openModal = function (id) {
    var m = document.getElementById(id);
    if (m) m.classList.add('active');
  };
  window.closeModal = function (id) {
    var m = document.getElementById(id);
    if (m) m.classList.remove('active');
  };
  document.querySelectorAll('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m) m.classList.remove('active');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(function (m) {
        m.classList.remove('active');
      });
      if (startMenu) startMenu.classList.remove('active');
    }
  });

  // Visitor counter removed — a fabricated count is mock data, and this site
  // reports honest numbers only.

  // ---- Fill progress bars. Set width DIRECTLY (no rAF — it's throttled in
  //      background/automated tabs and would leave the bar stuck at 0%).
  //      The CSS `transition` still animates the fill on a visible tab. ----
  function fillBars() {
    document.querySelectorAll('.progress-inner[data-pct]').forEach(function (bar) {
      if (bar.dataset.filled) return;
      bar.dataset.filled = '1';
      bar.style.width = bar.getAttribute('data-pct') + '%';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillBars);
  } else {
    fillBars();
  }
  // Belt-and-suspenders: also fill on load in case the script was deferred
  // past DOMContentLoaded for any reason.
  window.addEventListener('load', fillBars);

  // ---- Guestbook (localStorage, client-side only) ----
  var gbForm = document.getElementById('guestbook-form');
  if (gbForm) {
    var listEl = document.getElementById('guestbook-list');
    var GB_KEY = 'wildhaven_guestbook';
    // No seeded entries — an empty wall is honestly empty.
    function render() {
      var saved = JSON.parse(localStorage.getItem(GB_KEY) || '[]');
      if (!saved.length) {
        listEl.innerHTML = '<div class="guestbook-entry" style="color:#666;">' +
          'No signatures yet. If you sign, yours is the first &mdash; ' +
          'and it stays only in your browser until the organization is formed.</div>';
        return;
      }
      listEl.innerHTML = saved.map(function (e) {
        return '<div class="guestbook-entry"><span class="who">' +
          esc(e.who) + '</span> <em>(' + esc(e.where || 'visitor') + ')</em><br>' +
          esc(e.msg) + '</div>';
      }).join('');
    }
    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    gbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var who = gbForm.querySelector('[name=who]').value.trim() || 'Anonymous';
      var where = gbForm.querySelector('[name=where]').value.trim();
      var msg = gbForm.querySelector('[name=msg]').value.trim();
      if (!msg) return;
      var saved = JSON.parse(localStorage.getItem(GB_KEY) || '[]');
      saved.unshift({ who: who, where: where, msg: msg });
      localStorage.setItem(GB_KEY, JSON.stringify(saved.slice(0, 30)));
      gbForm.reset();
      render();
    });
    render();
  }
})();

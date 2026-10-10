/* The light and dark button. The page follows the phone or computer until the
   reader picks one, and the pick is kept for the next visit. Loaded in the
   head, so a saved dark page never flashes light first. */
(function () {
  var KEY = 'okayupsc-theme', root = document.documentElement;
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) { /* private mode: follow the system */ }

  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function label(btn) {
    var dark = isDark();
    btn.innerHTML = dark ? '&#9788;' : '&#9789;';
    btn.setAttribute('aria-label', dark ? 'Switch to light' : 'Switch to dark');
    btn.title = dark ? 'Light' : 'Dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    label(btn);
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      label(btn);
    });
  });
})();

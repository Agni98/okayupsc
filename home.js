/* The home page: the counts, the article and the thinker of the day, and the
   search box that suggests pages on both sites. The data comes from data.js,
   which tools/make-data.js builds from the two sites. */
(function () {
  'use strict';

  var COI = 'https://constitution.okayupsc.com/';
  var THK = 'https://thinkers.okayupsc.com/';
  var D = window.OK;
  if (!D) return;

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(d, cls) {
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  }
  var I = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    again: '<path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.6"/><path d="M20 3.5v5.1h-5.1"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/>',
    quote: '<path d="M7 8h4v4c0 3-1.5 4.5-4 5M14 8h4v4c0 3-1.5 4.5-4 5"/>'
  };

  /* ---------- counts ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-stat]'), function (el) {
    var v = D.stats[el.getAttribute('data-stat')];
    if (v != null) el.textContent = Number(v).toLocaleString('en-IN');
  });

  /* ---------- the article and the thinker of the day ----------
     The day is counted in Indian time, so everyone sees the same pair until
     midnight IST. A step that shares no factor with the list's length walks
     through every entry before any repeats. */
  var day = Math.floor((Date.now() + 330 * 60000) / 864e5);
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function nth(list, k, step) {
    var n = list.length;
    while (gcd(n, step) !== 1) step++;
    return list[((k * step) % n + n) % n];
  }
  var shift = { art: 0, thk: 0 };

  var dateEl = $('#today-date');
  if (dateEl) {
    try {
      dateEl.textContent = new Date().toLocaleDateString('en-IN',
        { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
    } catch (e) { /* an old browser without time zones: leave the date out */ }
  }

  var TIER = { 1: 'Asked almost every cycle', 2: 'Comes back across cycles' };

  function renderArt() {
    var p = nth(D.picks, day + shift.art, 53);
    var label = p[0], title = p[1], text = p[2], tier = p[3], href = COI + p[4];
    $('#t-art').innerHTML =
      '<div class="tc-top"><span class="tc-kick">' + icon(I.book) + 'Article of the day</span>' +
      '<button class="tc-next" type="button" data-next="art">' + icon(I.again) + 'Another</button></div>' +
      '<div class="tc-label"><b>' + esc(label) + '</b><span class="tier">' + esc(TIER[tier] || '') + '</span></div>' +
      '<p class="tc-title"><a href="' + esc(href) + '">' + esc(title) + '</a></p>' +
      '<p class="tc-text">' + esc(text) + '</p>' +
      '<div class="tc-acts"><a class="btn pri" href="' + esc(href) + '">Read it ' + icon(I.arrow) + '</a>' +
      (p[5] ? '<a class="btn" href="' + esc(href + '/mcq') + '">' + icon(I.check) + 'Practice its MCQs</a>' : '') +
      '</div>';
  }

  function initials(name) {
    var w = name.replace(/[^A-Za-zÀ-ɏ .'-]/g, '').split(/[\s.]+/).filter(Boolean);
    return ((w[0] || '?').charAt(0) + (w.length > 1 ? w[w.length - 1].charAt(0) : '')).toUpperCase();
  }

  function renderThk() {
    var t = nth(D.thinkers, day + shift.thk, 29);
    var id = t[0], name = t[1], years = t[2], school = t[3], quote = t[4], img = t[5];
    var href = THK + '#' + id;
    var short = name.split(' ').slice(-1)[0];
    $('#t-thk').innerHTML =
      '<div class="tc-top"><span class="tc-kick">' + icon(I.user) + 'Thinker of the day</span>' +
      '<button class="tc-next" type="button" data-next="thk">' + icon(I.again) + 'Another</button></div>' +
      '<a class="tk-head" href="' + esc(href) + '"><span class="tk-face">' + esc(initials(name)) +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '') + '</span>' +
      '<span class="tk-name"><b>' + esc(name) + '</b><small>' + esc([years, school].filter(Boolean).join(' · ')) +
      '</small></span></a>' +
      (quote ? '<blockquote class="tk-q">&ldquo;' + esc(quote) + '&rdquo;</blockquote>' : '') +
      '<div class="tc-acts"><a class="btn pri" href="' + esc(href) + '">Read about ' + esc(short) + ' ' + icon(I.arrow) + '</a>' +
      '<a class="btn" href="' + THK + '#/quotes">' + icon(I.quote) + 'More quotations</a></div>';
    // A portrait that fails to load leaves the initials showing.
    var im = $('#t-thk .tk-face img');
    if (im) im.addEventListener('error', function () { im.remove(); });
  }

  renderArt();
  renderThk();
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-next]');
    if (!b) return;
    var k = b.getAttribute('data-next');
    shift[k]++;
    if (k === 'art') renderArt(); else renderThk();
    var again = document.querySelector('[data-next="' + k + '"]');
    if (again) again.focus();
  });

  /* ---------- search ----------
     Suggestions come from both sites: an article by its number or its
     heading, a judgment by its name, a thinker by name. The last two rows
     always search each site for the words typed. */
  var form = $('#search'), input = $('#q'), box = $('#sugg');
  var rows = [], cur = -1;

  function norm(s) {
    return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  var ARTS = D.arts.map(function (a) { return { num: a[0], n: a[0].toLowerCase(), h: a[1], hn: norm(a[1]) }; });
  var CASES = D.cases.map(function (c) { return { id: c[0], name: c[1], year: c[2], nn: norm(c[1]) }; });
  var PEOPLE = D.thinkers.map(function (t) { return { id: t[0], name: t[1], school: t[3], nn: norm(t[1]) }; });

  function wordHit(text, q) {
    // every word typed starts a word in the text
    var words = text.split(' ');
    return q.split(' ').every(function (w) {
      return words.some(function (x) { return x.indexOf(w) === 0; });
    });
  }

  function suggest(raw) {
    var q = norm(raw), out = [];
    if (!q) return out;
    var m = q.match(/^(?:art(?:icle)?s? ?)?(\d{1,3}[a-z]{0,2})$/);
    if (m) {
      ARTS.filter(function (a) { return a.n === m[1]; })
        .concat(ARTS.filter(function (a) { return a.n !== m[1] && a.n.indexOf(m[1]) === 0 && /^\d+[a-z]*$/.test(a.n); }))
        .slice(0, 4).forEach(function (a) {
          out.push({ k: 'c', tag: 'Article', t: 'Article ' + a.num, s: a.h, href: COI + '#/article/' + a.num });
        });
    }
    if (q === 'preamble' || 'preamble'.indexOf(q) === 0 && q.length >= 4) {
      out.push({ k: 'c', tag: 'Text', t: 'The Preamble', s: 'We, the people of India', href: COI + '#/preamble' });
    }
    if (q.length >= 3 && !m) {
      PEOPLE.filter(function (p) { return wordHit(p.nn, q); }).slice(0, 3).forEach(function (p) {
        out.push({ k: 't', tag: 'Thinker', t: p.name, s: p.school, href: THK + '#' + p.id });
      });
      CASES.filter(function (c) { return wordHit(c.nn, q); }).slice(0, 3).forEach(function (c) {
        out.push({ k: 'c', tag: 'Case', t: c.name, s: 'Judgment of ' + c.year, href: COI + '#/judgment/' + c.id });
      });
      ARTS.filter(function (a) { return wordHit(a.hn, q); }).slice(0, 3).forEach(function (a) {
        out.push({ k: 'c', tag: 'Article', t: 'Article ' + a.num, s: a.h, href: COI + '#/article/' + a.num });
      });
    }
    out = out.slice(0, 7);
    var words = raw.trim();
    out.push({ sep: true });
    out.push({ k: 'c', tag: 'Search', t: 'Search the Constitution', s: '“' + words + '”',
      href: COI + '#/search/' + encodeURIComponent(words) });
    out.push({ k: 't', tag: 'Search', t: 'Search Thinkers', s: '“' + words + '”',
      href: THK + '#/search?q=' + encodeURIComponent(words) });
    return out;
  }

  function show() {
    rows = suggest(input.value);
    cur = rows.length ? 0 : -1;
    if (!rows.length) { hide(); return; }
    var i = 0;
    box.innerHTML = rows.map(function (r) {
      if (r.sep) return '<div class="sg-sep" role="presentation"></div>';
      r.i = i++;
      return '<a class="sg" id="sg-' + r.i + '" role="option" href="' + esc(r.href) + '">' +
        '<span class="sg-k k-' + r.k + '">' + esc(r.tag) + '</span>' +
        '<span class="sg-t"><b>' + esc(r.t) + '</b>' + (r.s ? '<small>' + esc(r.s) + '</small>' : '') + '</span></a>';
    }).join('');
    rows = rows.filter(function (r) { return !r.sep; });
    box.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    mark();
  }
  function hide() {
    box.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    cur = -1;
  }
  function mark() {
    Array.prototype.forEach.call(box.querySelectorAll('.sg'), function (el, i) {
      el.classList.toggle('on', i === cur);
      el.setAttribute('aria-selected', i === cur ? 'true' : 'false');
    });
    if (cur >= 0) {
      input.setAttribute('aria-activedescendant', 'sg-' + cur);
      var el = document.getElementById('sg-' + cur);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }
  }

  input.addEventListener('input', show);
  input.addEventListener('focus', function () { if (input.value.trim()) show(); });
  input.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'ArrowDown') { cur = (cur + 1) % rows.length; mark(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { cur = (cur - 1 + rows.length) % rows.length; mark(); e.preventDefault(); }
    else if (e.key === 'Escape') { hide(); }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value.trim()) { input.focus(); return; }
    if (box.hidden) show();
    var r = rows[cur >= 0 ? cur : 0];
    if (r) location.href = r.href;
  });
  document.addEventListener('click', function (e) {
    if (!form.contains(e.target)) hide();
  });
  // "/" jumps to the search box, as on the two sites.
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    input.focus();
  });
})();

/* Builds data.js for the home page from the two sites' own data files.

   Run it from this repo after either site changes:
     node tools/make-data.js

   It expects the two sites next to this repo, as they are on the user's
   computer: ../constitution/site and ../upsc-thinkers. The home page needs
   the counts, the article headings and thinker names for its search box,
   and the entries it shows as the article and the thinker of the day. */

const fs = require('fs'), path = require('path'), vm = require('vm');

const here = path.join(__dirname, '..');
const COI = path.join(here, '..', 'constitution', 'site', 'data');
const THK = path.join(here, '..', 'upsc-thinkers');

// The Constitution's data files assign to window.COI_*.
const cw = {};
cw.window = cw;
vm.createContext(cw);
fs.readdirSync(COI).filter(f => /^(constitution|schedules|amendments|exam-\d+|mcq-\d+|cases-\d+)\.js$/.test(f))
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(COI, f), 'utf8'), cw, { filename: f }));

const arts = cw.COI.articles.filter(a => !a.omitted);
const byNum = {};
arts.forEach(a => { byNum[a.num] = a; });
const schedules = cw.COI_SCHEDULES;
const exam = cw.COI_EXAM;
const mcq = cw.COI_MCQ;

// The same id the Constitution site gives a case, so a link opens its page.
const caseId = c => (String(c.case).replace(/\s*\(\d{4}\)\s*$/, '') + ' ' + c.year).toLowerCase()
  .replace(/&/g, ' and ').replace(/['’.]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const cases = {};
Object.keys(cw.COI_CASES).forEach(k => cw.COI_CASES[k].forEach(c => {
  const id = caseId(c);
  if (!cases[id]) cases[id] = [id, String(c.case).replace(/\s*\(\d{4}\)\s*$/, ''), c.year];
}));

const firstPara = s => String(s).split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
const sentenceCase = s => s.charAt(0).toUpperCase() + s.slice(1);

// The article of the day comes from the provisions asked most (tiers 1 and 2).
const picks = Object.keys(exam).filter(k => exam[k].tier <= 2).map(k => {
  let label, title, href;
  if (k === 'preamble') { label = 'The Preamble'; title = 'We, the people of India'; href = '#/preamble'; }
  else if (k.indexOf('sch') === 0) {
    const s = schedules.find(x => x.id === k.slice(3));
    label = s ? s.name : k; title = s ? s.title : ''; href = '#/schedule/' + k.slice(3);
  } else {
    const a = byNum[k];
    if (!a) return null;
    label = 'Article ' + a.num; title = a.heading; href = '#/article/' + a.num;
  }
  return [label, sentenceCase(title), firstPara(exam[k].why), exam[k].tier, href, mcq[k] ? 1 : 0];
}).filter(Boolean);

// The Thinkers site declares its data with const, so hand the names back out.
const tw = {};
vm.createContext(tw);
const thkSrc = ['data.js', 'portraits.js', 'gs4pyq.js', 'essays.js', 'pyq.js', 'atlas.js']
  .map(f => fs.readFileSync(path.join(THK, f), 'utf8')).join('\n;\n');
vm.runInContext(thkSrc + '\n;this.out = { THINKERS, PORTRAITS, GS4_PYQ, ESSAYS, PYQ_PAPERS, ATLAS };', tw);
const T = tw.out;

const shortQuote = qs => qs.find(q => q.length <= 140) ||
  qs.slice().sort((a, b) => a.length - b.length)[0] || '';
const thinkers = T.THINKERS.map(t => [
  t.id, t.name, t.years || '', (t.school || '').split(' · ')[0], shortQuote(t.quotes || []),
  t.img || T.PORTRAITS[t.wiki] || ''
]);

const stats = {
  articles: arts.length,
  mcqs: Object.keys(mcq).reduce((n, k) => n + mcq[k].length, 0),
  judgments: Object.keys(cases).length,
  // Some amendments changed no text and are not in the list, so count to the latest.
  amendments: Math.max.apply(null, cw.COI_AMENDMENTS.map(a => a.num)),
  important: Object.keys(exam).length,
  thinkers: T.THINKERS.length,
  quotes: T.THINKERS.reduce((n, t) => n + (t.quotes || []).length, 0),
  gsq: T.GS4_PYQ.length,
  caseStudies: T.GS4_PYQ.filter(q => q.sec === 'B').length,
  essays: Object.keys(T.ESSAYS).length,
  topics: T.PYQ_PAPERS.reduce((n, p) => n + p.a.length + p.b.length, 0),
  stories: T.ATLAS.length
};

const data = {
  stats,
  arts: arts.map(a => [a.num, a.heading]),
  cases: Object.keys(cases).map(k => cases[k]),
  picks,
  thinkers
};

const out = '/* Made by tools/make-data.js from the two sites. Run it again after they change. */\n' +
  'window.OK = ' + JSON.stringify(data) + ';\n';
fs.writeFileSync(path.join(here, 'data.js'), out);
console.log('data.js', (out.length / 1024).toFixed(1) + ' KB', JSON.stringify(stats));
console.log(picks.length + ' picks, ' + thinkers.length + ' thinkers, ' + data.cases.length + ' cases');

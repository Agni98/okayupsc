/* Copies okay-ui.css, the look the three sites share, from this repo into the
   other two. Run it from this repo after editing okay-ui.css:

     node tools/sync-ui.js

   It expects the two sites next to this repo, as they are on the user's
   computer: ../constitution/site and ../upsc-thinkers. It also checks that
   each site's page carries the suite bar and loads the file.

   Browsers keep a CSS file for up to four hours. The two sites ask for it
   with a fresh timestamp, but this page asks for okay-ui.css?v=<hash>, so the
   script sets the hash here from the file's contents. */

const fs = require('fs'), path = require('path'), crypto = require('crypto');

const here = path.join(__dirname, '..');
const src = path.join(here, 'okay-ui.css');
const sites = [
  { name: 'Constitution', dir: path.join(here, '..', 'constitution', 'site') },
  { name: 'Thinkers', dir: path.join(here, '..', 'upsc-thinkers') }
];

const css = fs.readFileSync(src, 'utf8');
let ok = true;

const home = path.join(here, 'index.html');
const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10);
const page = fs.readFileSync(home, 'utf8');
const next = page.replace(/okay-ui\.css(\?v=[0-9a-f]*)?"/g, 'okay-ui.css?v=' + hash + '"');
if (next.indexOf('okay-ui.css?v=' + hash) < 0) { ok = false; console.log('Home: index.html does not load okay-ui.css'); }
else if (next !== page) { fs.writeFileSync(home, next); console.log('Home: link set to v=' + hash); }
else console.log('Home: already current');
for (const s of sites) {
  const dest = path.join(s.dir, 'okay-ui.css');
  const before = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  if (before !== css) fs.writeFileSync(dest, css);
  const page = fs.readFileSync(path.join(s.dir, 'index.html'), 'utf8');
  const loads = page.indexOf('okay-ui.css') >= 0, bar = page.indexOf('class="ok-suite"') >= 0;
  if (!loads || !bar) ok = false;
  console.log(s.name + ': ' + (before === css ? 'already current' : 'copied') +
    (loads ? '' : ', but index.html does not load okay-ui.css') +
    (bar ? '' : ', but index.html has no suite bar'));
}
process.exit(ok ? 0 : 1);

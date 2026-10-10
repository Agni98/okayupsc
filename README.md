# OkayUPSC

The home page for okayupsc.com. It leads into the two study sites:

- The Constitution of India for Exams, at constitution.okayupsc.com, from the `constitution-for-exams` repo.
- Thinkers for UPSC, at thinkers.okayupsc.com, from the `upsc-thinkers` repo.

The page has a search box that suggests articles, judgments and thinkers from both sites, an article and a thinker for each day, and links into each site by paper, in the order the exam is sat: Prelims, then Essay, GS-II and GS-IV in Mains.

## Files

- `index.html` holds the page and its styles.
- `okay-ui.css` is the look the three pages share: the colours in light and dark, the two typefaces, the corner sizes and shadows, and the navy OkayUPSC bar across the top of every page. This copy is the master. After editing it, copy it into the two sites:

  ```bash
  node tools/sync-ui.js
  ```

  The script also copies the font files in `fonts/` and checks that each site's page loads the file and carries the bar.
- `fonts/` holds Roboto Slab, the serif for headings and reading, as two variable woff2 files (Latin, and Latin Extended for marks such as ā and ṣ) with its Apache 2.0 licence. Each site serves its own copy, so nothing comes from Google and the Android app has the font offline. Each site maps its own colour names onto the shared ones, so a colour changed here changes on all three pages.
- `theme.js` runs the light and dark button, and keeps the choice for the next visit.
- `home.js` runs the search box and the two daily cards.
- `data.js` holds the counts, the article headings, the judgment and thinker names, and the daily entries. `tools/make-data.js` builds it from the two sites' own data, so run it again after either site changes:

  ```bash
  node tools/make-data.js
  ```

  It expects the two sites next to this repo, at `../constitution/site` and `../upsc-thinkers`.
- `_headers` sets the security headers. If the page starts loading anything from a new outside address, add that address to its Content-Security-Policy.

There is no build step on the server. Cloudflare Pages publishes the repo root on every push to `main`.

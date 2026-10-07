# OkayUPSC

The home page for okayupsc.com. It leads into the two study sites:

- The Constitution of India for Exams, at constitution.okayupsc.com, from the `constitution-for-exams` repo.
- Thinkers for UPSC, at thinkers.okayupsc.com, from the `upsc-thinkers` repo.

The page has a search box that suggests articles, judgments and thinkers from both sites, an article and a thinker for each day, and links into each site by paper: Prelims, GS-II, GS-IV and Essay.

## Files

- `index.html` holds the page and its styles.
- `home.js` runs the search box and the two daily cards.
- `data.js` holds the counts, the article headings, the judgment and thinker names, and the daily entries. `tools/make-data.js` builds it from the two sites' own data, so run it again after either site changes:

  ```bash
  node tools/make-data.js
  ```

  It expects the two sites next to this repo, at `../constitution/site` and `../upsc-thinkers`.
- `_headers` sets the security headers. If the page starts loading anything from a new outside address, add that address to its Content-Security-Policy.

There is no build step on the server. Cloudflare Pages publishes the repo root on every push to `main`.

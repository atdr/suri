# AGENTS.md

Short link site for **https://atdr.eu**. A static site built with
[Suri](https://github.com/surishortlink/suri) (`@surishortlink/suri`, a
devDependency) and deployed to GitHub Pages automatically on every push to
`main`. Each entry in `src/links.json` becomes a page at `https://atdr.eu/<key>`
that redirects to its URL via an instant `<meta>` refresh.

## Adding a link

All links live in `src/links.json` as a flat `"key": "URL"` map.

1. Pick a key:
   - Memorable links get a named key, e.g. `"github"`, `"cvpdf"`.
   - Ad-hoc links get a random 5 character alphanumeric key (mixed case), e.g.
     `"ZlTbO"`. Generate one yourself; any `[A-Za-z0-9]{5}` string is fine.
2. Confirm the key doesn't already exist in the file (keys are case sensitive,
   but avoid keys differing only by case).
3. Insert the entry in alphabetical order (case insensitive). The first two
   entries, `"/"` and `"new-key"`, are special and stay at the top.
4. Verify: `npm run lint && npm run build`, then check `build/<key>/index.html`
   contains the right URL.
5. Commit as `feat: add <key> link` (one commit per logical change) and push to
   `main`. Deployment is automatic; confirm with
   `curl -s https://atdr.eu/<key>/` after the
   [Deploy workflow](.github/workflows/deploy.yml) finishes.

## Removing or changing a link

Edit or delete the entry in `src/links.json`, then the same verify, commit
(`fix:`/`chore:`), and push flow. Note that short links may be printed or
bookmarked; prefer updating a key's URL over deleting the key.

## Repo rules

- Never edit `build/` (generated) or `package-lock.json` by hand.
- `suri.config.json` controls redirect behavior; don't change it for link work.
- Formatting is enforced by Prettier (`npm run lint:fix` to fix).

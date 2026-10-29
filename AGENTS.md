# MAE 3293 interactive lessons

Instructions for people and AI agents (Claude Code, Codex) editing this repository.

## What this is
- A static site on GitHub Pages, served from the `master` branch (repository root):
  https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/. `.nojekyll` makes Pages serve files as they are.
- `index.html` (course home) and `lessons/<slug>.html` are **built files**. Edit `src/`, run `npm run build`, and
  commit the sources and the built pages together.
- Each lesson must stay a single self-contained file: no network requests (fonts embedded, equations pre-rendered to
  SVG by the build). Students download lessons from Canvas and use them offline.

## Workflow
1. `npm install` once.
2. Edit `src/`. Use `npm run dev` for quick previews (loads MathJax and fonts from CDNs).
3. `npm run build`, then `npm run check`: both must pass (the build fails on any TeX error; the checks fail on
   any table mismatch, duplicate id, unlabeled input, NaN in a figure, heading skip, horizontal overflow at 390 px,
   network request, script error, or link to a missing course page or asset).
4. After a change to a figure used in a preview, or a title, run `npm run previews`.
5. Work on a branch and open a pull request; merging to `master` publishes.

## Adding a chapter
1. Add an entry to `src/course.json` in chapter order: `slug` (file name, words joined by hyphens, describing the
   topic, not the chapter number), `chapter`, `title` (Title Case), `scripts` (shared scripts it needs, in order),
   `summary` (course home), `description` (search and link previews), and `image_alt`.
2. Create `src/lessons/<slug>/body.html` (lede, contents nav `#toc`, sections) and `modules.js` (interactives). Copy
   the structure of an existing lesson: sections are `<section class="sec" id=… aria-labelledby=…>` with a `.sechead`
   eyebrow naming the textbook section, and every interactive registers a draw function in `renderers` so the
   γ input redraws it.
3. Reuse `src/shared/kit.js` (plot frames, curves, drag-to-set, known-quantity inversion, example tabs and
   example tables) for new interactives. Put gas-dynamics functions used by more than one lesson in `src/shared/` and give
   them a check in `tools/check-tables.js` against Anderson's appendix tables.
4. Worked examples: `exTable(id, rows, def)` shows one **Result** column. Each row is
   `[quantity, relation used, result, hand value, highlight, differs]`; the hand value is the solution from the notes
   (Appendix tables, γ = 1.4). It stays hidden until the reader turns on the switch "Compare with the hand solution
   (Appendix tables)", which `src/shared/lesson.js` adds above every table with a hand column; pass `def` true only for
   the original inputs. Set `differs` on rows where the notes and the result disagree, and explain why in the
   `.exnote` under the table (the row then carries a †).
5. Add a card to `CARDS` in `tools/preview-images.js` (the link-preview image), and draw the course-home thumbnail
   `src/thumbs/<slug>.svg`: one simple sketch of the chapter's central idea, `viewBox="0 0 400 210"`, no title text,
   colors from the figure tokens, `aria-hidden="true"`, and marker ids unique on the page. Then
   `npm run build && npm run previews && npm run check`.
6. The previous and next links, the course home list, and the canonical and Open Graph URLs come from the manifest.

## Content
- Facts, worked examples, and numbering follow Kursat Kara’s lecture notes and J. D. Anderson, *Fundamentals of
  Aerodynamics*. Verify every worked number by computation; when the notes and a computed value disagree, show the
  computed value and say so neutrally in the note under the example (and mark the row as differing).
- Precise terminology, as in a paper: name the flow, the method, and the quantity. Text in the third person or
  "we" for derivations; no marketing phrasing.
- Footer credit: “Based on Kursat Kara’s lecture notes, following J. D. Anderson, *Fundamentals of Aerodynamics*.”

## Style (shared with the calculator)
- Fonts: Source Serif 4 (headings, numbers) and Source Sans 3 (body). Square corners. Accent is OSU orange.
- Figure colors are tokens in `:root`, repeated in both dark-mode blocks (`@media (prefers-color-scheme: dark)` and
  `:root[data-theme="dark"]`): red `--comp` for compression and shocks, blue `--exp` for expansion, gray `--mach` for
  Mach waves. Add new colors as tokens, never hard-coded.
- Theme and text size use the calculator's `localStorage` keys (`theme`, `font-size`), so the choice carries over.
- Accessibility (WCAG 2.1 AA): every figure is an `svg role="img"` with an `aria-label` that describes it, every
  input has a label, headings go h1 → h2 → h3, and pages work at 390 px without horizontal scrolling.

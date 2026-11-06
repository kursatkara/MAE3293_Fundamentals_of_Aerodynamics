# MAE 3293 Fundamentals of Aerodynamics

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23858924.svg)](https://doi.org/10.5281/zenodo.23858924)

Interactive lessons for MAE 3293 Fundamentals of Aerodynamics at Oklahoma State University, by Kursat Kara.

**Live site:** https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/

Each lesson pairs the derivations with figures computed live from the exact relations for a calorically perfect gas, and follows Kursat Kara’s lecture notes and J. D. Anderson, *Fundamentals of Aerodynamics*. Every lesson is a single self-contained page (fonts and equations embedded, no network requests), so it also works offline, for example when downloaded from Canvas.

| Chapter | Lesson |
|---|---|
| 7 | [Compressible Flow: Preliminary Aspects](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/compressible-flow-preliminaries.html): perfect-gas thermodynamics, the first and second laws, entropy and the isentropic relations, compressibility, the governing equations for inviscid compressible flow, and total conditions |
| 8 | [Normal Shock Waves](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/normal-shock-waves.html): the speed of sound, total and sonic conditions, the characteristic Mach number, the normal-shock relations, entropy and total-pressure loss across a shock, and the Pitot tube in subsonic and supersonic flow |
| 9 | [Oblique Shock and Expansion Waves](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/oblique-shock-expansion-waves.html): Mach waves, the θ–β–M relation, shock reflection and intersection, Prandtl–Meyer expansion and isentropic compression, and shock-expansion theory for flat-plate, wedge, and diamond airfoils |
| 10 | [Nozzles, Diffusers, and Wind Tunnels](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/nozzles-diffusers-wind-tunnels.html): quasi-one-dimensional flow, the area–velocity and area–Mach relations, choked flow, converging-diverging nozzles with normal shocks inside or at the exit, rocket thrust, diffusers, and supersonic wind-tunnel start-up |

The [calculators](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/#calculators) on the same site evaluate the isentropic, normal-shock and Prandtl–Meyer relations that Anderson tabulates in Appendices A–C, solve the oblique-shock θ–β–M relation that the textbook gives as a chart, and apply shock-expansion theory to supersonic airfoils: [isentropic flow](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/isentropic-flow.html), [normal shock](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/normal-shock.html), [oblique shock](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/oblique-shock.html), [Prandtl–Meyer expansion](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/prandtl-meyer-expansion.html), and [supersonic airfoils](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/supersonic-airfoils.html). They replace the earlier Compressible Aerodynamics Calculator site, whose pages now forward here.

## Using the lessons in a course

Students need only a web browser: no programming, installation, or account.

- **Link** to the lessons and calculators on the live site.
- **Download** any page (in the browser, *Save Page As…*, or from `lessons/` and `calculators/` in this repository). Each page is one HTML file with its fonts and equations embedded, so it works offline and can be uploaded as a file to a learning management system such as Canvas.
- **Cite or archive a fixed version** by its Zenodo DOI (see *How to cite*).

The lessons follow J. D. Anderson, *Fundamentals of Aerodynamics*, Chapters 7–10, and keep its section and example numbering, so they can be used alongside that textbook. Each page states the models it uses (calorically perfect gas, inviscid two-dimensional waves, quasi-one-dimensional duct flow) and labels features that are drawn schematically.

To change the content or add a chapter, fork the repository and follow *Building* below and [AGENTS.md](AGENTS.md).

## Repository layout

```
index.html, lessons/*.html     built pages (committed; GitHub Pages serves them from master)
assets/                        link-preview images (1200 x 630)
src/course.json                course manifest: base URL and the ordered list of lessons
src/templates/                 page head, header, footer, course home
src/shared/                    style.css, theme.js, lesson.js, helpers.js (controls and SVG
                               helpers), core.js (oblique shocks, Prandtl-Meyer), quasi1d.js
                               (isentropic quasi-1D flow, normal shocks, Pitot formula,
                               nozzle regimes), atmosphere.js (standard atmosphere, App. D),
                               kit.js (plot frames, known-quantity inversion, example tabs)
src/lessons/<slug>/            body.html (the lesson text) and modules.js (its interactives)
tools/                         build, numerical checks, browser audit, preview images
```

## Building

Requires Node.js 18 or later; the audit and preview scripts also need Playwright with Chromium.

```
npm install            # MathJax and the two font packages
npm install --no-save playwright@1.63.0   # for the browser audit and previews
npx playwright install --with-deps chromium
npm run build          # writes index.html and lessons/*.html
npm run check          # table and conservation checks, then the browser audit
npm run previews       # regenerates assets/*-preview.png
npm run dev            # quick build that loads MathJax and fonts from CDNs
```

Edit the files in `src/`, never the built pages, then run the build and commit both.

## What the checks cover

`npm run check` runs two scripts; both exit with an error on any failure. Since November 2026 they also run on every pull request (`.github/workflows/checks.yml`), together with a test that the committed pages match the sources.

- **`tools/check-tables.js`** (numerical checks of `src/shared/`):
  - 41 reference values for γ = 1.4 from Anderson's Appendices A–D (isentropic flow, normal shocks, Prandtl–Meyer function, standard atmosphere) and from worked examples in Chapters 8 and 10, each within a tolerance close to the printed precision;
  - the oblique-shock solver against classical values for air: θ_max = 22.97° at β = 64.67° for M₁ = 2, θ_max → 45.58° as M₁ → ∞, and β → μ (weak) and β → 90° (strong) as θ → 0;
  - the numerical (bisection) oblique-shock solution against the closed-form solution of vonEggers Rudd and Lewis (1998) on both branches, for γ = 1.1, 1.3, 1.4, 1.67, M₁ = 1.05–11 in steps of 0.05, and θ = 0.05–0.9999 θ_max: 11,200 solutions, tolerance 10⁻⁶°, with a round trip θ(β) to 10⁻⁹°;
  - mass and momentum (Anderson Eq. 10.5) balances on the Chapter 10 nozzle solutions for four exit-area ratios and seven back pressures: mass-flow spread below 10⁻⁶ and momentum residual below 10⁻⁴, relative.
- **`tools/audit-pages.js`** (browser audit with Playwright): loads every page at its default inputs, at 1300 px in the light theme and 390 px in the dark theme, and fails on script errors, network requests, duplicate ids, unlabeled inputs, `NaN` in a figure, heading skips, horizontal overflow, and links to missing course pages or assets.

These checks show agreement with published values and between two solution methods over the sampled conditions. They do not validate the physical models themselves, test inputs other than the defaults in the browser, or check explanatory text, which is reviewed by the instructor. See [AGENTS.md](AGENTS.md) for conventions and for adding a chapter.

## Contributing, reporting problems, and getting help

- **Report a problem or ask a question:** open an [issue](https://github.com/kursatkara/MAE3293_Fundamentals_of_Aerodynamics/issues). For an error in a lesson or calculator, give the page, the inputs, what you expected, and what you saw (a screenshot helps).
- **Contribute a correction or a new chapter:** fork the repository, make the change in `src/` following [AGENTS.md](AGENTS.md), run `npm run build` and `npm run check`, and open a pull request. The same checks run automatically on every pull request.
- **Adapt it for your own course:** see *Using the lessons in a course* above; questions about adapting it are welcome as issues.

## License

- **Code** (HTML, CSS, JavaScript): [MIT License](LICENSE).
- **Content** (explanatory text, worked solutions, figures and diagrams): [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Worked examples** follow the example problems of J. D. Anderson, *Fundamentals of Aerodynamics*, the textbook used in MAE 3293, and keep its numbering. Their problem statements are written in our own words; the textbook's text is not reproduced.
- Embedded fonts: Source Serif 4 and Source Sans 3 (SIL Open Font License 1.1). Equations typeset with MathJax (Apache 2.0).

## How to cite

Kara, K. (2026). *MAE 3293 Fundamentals of Aerodynamics: Interactive Lessons.* Zenodo. https://doi.org/10.5281/zenodo.23858924

That DOI always resolves to the latest archived version. To cite an exact version, use the DOI of its release on Zenodo; for example, v1.0.0 is https://doi.org/10.5281/zenodo.23858925. GitHub's **Cite this repository** button (from `CITATION.cff`) gives the same citation in other formats.

## Acknowledgment

Developed with assistance from ChatGPT, Gemini, and Claude.

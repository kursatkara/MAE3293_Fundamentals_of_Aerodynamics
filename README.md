# MAE 3293 Fundamentals of Aerodynamics

Interactive lessons for MAE 3293 Fundamentals of Aerodynamics at Oklahoma State University, by Kursat Kara.

**Live site:** https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/

Each lesson pairs the derivations with figures computed live from the exact relations for a calorically perfect gas, and follows Kursat Kara’s lecture notes and J. D. Anderson, *Fundamentals of Aerodynamics*. Every lesson is a single self-contained page (fonts and equations embedded, no network requests), so it also works offline, for example when downloaded from Canvas.

| Chapter | Lesson |
|---|---|
| 7 | [Compressible Flow: Preliminary Aspects](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/compressible-flow-preliminaries.html): perfect-gas thermodynamics, the first and second laws, entropy and the isentropic relations, compressibility, the governing equations for inviscid compressible flow, and total conditions |
| 8 | [Normal Shock Waves](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/normal-shock-waves.html): the speed of sound, total and sonic conditions, the characteristic Mach number, the normal-shock relations, entropy and total-pressure loss across a shock, and the Pitot tube in subsonic and supersonic flow |
| 9 | [Oblique Shock and Expansion Waves](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/oblique-shock-expansion-waves.html): Mach waves, the θ–β–M relation, shock reflection and intersection, Prandtl–Meyer expansion and isentropic compression, and shock-expansion theory for flat-plate, wedge, and diamond airfoils |
| 10 | [Nozzles, Diffusers, and Wind Tunnels](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/lessons/nozzles-diffusers-wind-tunnels.html): quasi-one-dimensional flow, the area–velocity and area–Mach relations, choked flow, converging-diverging nozzles with normal shocks inside or at the exit, rocket thrust, diffusers, and supersonic wind-tunnel start-up |

The [calculators](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/#calculators) on the same site replace the tables in Anderson’s appendices: [isentropic flow](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/isentropic-flow.html), [normal shock](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/normal-shock.html), [oblique shock](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/oblique-shock.html), [Prandtl–Meyer expansion](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/prandtl-meyer-expansion.html), and [supersonic airfoils](https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/calculators/supersonic-airfoils.html). They replace the earlier Compressible Aerodynamics Calculator site, whose pages now forward here.

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
npm run build          # writes index.html and lessons/*.html
npm run check          # table and conservation checks, then the browser audit
npm run previews       # regenerates assets/*-preview.png
npm run dev            # quick build that loads MathJax and fonts from CDNs
```

Edit the files in `src/`, never the built pages, then run the build and commit both. See [AGENTS.md](AGENTS.md) for conventions and for adding a chapter.

## License

- **Code** (HTML, CSS, JavaScript): [MIT License](LICENSE).
- **Content** (explanatory text, worked solutions, figures and diagrams): [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- Embedded fonts: Source Serif 4 and Source Sans 3 (SIL Open Font License 1.1). Equations typeset with MathJax (Apache 2.0).

## Suggested attribution

Kara, K. *MAE 3293 Fundamentals of Aerodynamics: Interactive Lessons.* Oklahoma State University, 2025–2026. https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/, licensed under CC BY 4.0.

## Acknowledgment

Developed with assistance from ChatGPT, Gemini, and Claude.

#!/usr/bin/env node
/*
  Build the course site from src/.

    npm install        # once: MathJax and the two font packages
    npm run build      # writes index.html and lessons/*.html

  Each lesson is assembled from the shared templates, styles and scripts plus
  its own body.html and modules.js, then made self-contained: the fonts are
  embedded as data URIs and every \( … \) and \[ … \] is pre-rendered by
  MathJax to inline SVG. The published pages make no network requests, so they
  keep working offline once loaded.

  `node tools/build.js --dev` skips the embedding and loads MathJax and the
  fonts from their CDNs instead (fast rebuilds while editing).
*/
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const DEV = process.argv.includes('--dev');
const course = JSON.parse(rd('src/course.json'));
const fill = (t, o) => t.replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in o)) throw new Error('template key not set: ' + k); return o[k]; });
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const STYLE = rd('src/shared/style.css').trimEnd();
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(rd('src/shared/favicon.svg').trim()).replace(/%20/g, ' ');
const head = o => fill(rd('src/templates/head.html'), {
  title: o.title, description: esc(o.description), url: o.url, image: o.image,
  image_alt: esc(o.image_alt), favicon: FAVICON, style: STYLE });
const header = o => fill(rd('src/templates/header.html'), {
  calculator: course.calculator, gamma: '', home_label: 'Course home', ...o });
const footer = () => fill(rd('src/templates/footer.html'), { repo: course.repo });
const stripNode = js => js.split('\n').filter(l => !/module\.exports/.test(l)).join('\n');
const GAMMA = '<div class="gamma-box"><label for="gamma">γ</label><input type="number" id="gamma" value="1.4" min="1.05" max="1.67" step="0.01" aria-describedby="gammaHelp"><span id="gammaHelp" class="note">all figures</span></div>\n      ';
const CDN = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap">
`;
const MJ_CDN = `<script>
window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]},svg:{fontCache:'global'},options:{enableMenu:false}};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js" async></script>
`;
const pageScript = js => {
  const code = `(function(){\n"use strict";\n${js}\n})();`;
  new vm.Script(code, { filename: 'page-script.js' });          // syntax check
  return `<script>\n${code}\n</script>\n</body>\n</html>\n`;
};

/* ---------- lessons ---------- */
function lessonPage(L, i) {
  const url = course.base + 'lessons/' + L.slug + '.html';
  const prev = course.lessons[i - 1], next = course.lessons[i + 1];
  const link = (M, cls, k) => M ? `<a class="${cls}" href="${course.base}lessons/${M.slug}.html"><span class="k">${k.replace('#', M.chapter)}</span><span class="t">${M.title}</span></a>` : '<span></span>';
  const pager = `  <nav class="pager" aria-label="Lessons">
    ${link(prev, 'prev', '← Chapter #')}
    <a class="home" href="${course.base}">All lessons</a>
    ${next ? link(next, 'next', 'Chapter # →') : ''}
  </nav>
`;
  const dir = 'src/lessons/' + L.slug + '/';
  let html = head({ title: `${L.title} · MAE 3293`, description: L.description, url,
                    image: course.base + 'assets/' + L.slug + '-preview.png', image_alt: L.image_alt });
  html += header({ eyebrow: `MAE 3293 · Fundamentals of Aerodynamics · Chapter ${L.chapter}`, h1: L.title,
                   gamma: GAMMA, home: course.base });
  html += rd(dir + 'body.html') + pager + footer();
  const js = L.scripts.map(s => stripNode(rd('src/shared/' + s))).join('\n')
    + '\n' + rd(dir + 'modules.js') + '\n' + rd('src/shared/theme.js') + '\n' + rd('src/shared/lesson.js');
  return html + pageScript(js);
}

/* ---------- course home ---------- */
function homePage() {
  const chapters = course.lessons.map(L => fill(rd('src/templates/chapter.html'), L).trimEnd()).join('\n');
  let html = head({ title: 'MAE 3293 Fundamentals of Aerodynamics · Interactive Lessons',
    description: 'Interactive lessons for MAE 3293, Fundamentals of Aerodynamics, at Oklahoma State University: oblique shock and expansion waves, supersonic airfoils, and quasi-one-dimensional nozzle, diffuser, and wind-tunnel flows, with every figure computed live. By Kursat Kara.',
    url: course.base, image: course.base + 'assets/course-preview.png',
    image_alt: 'Course home for MAE 3293 Fundamentals of Aerodynamics with previews of the interactive lessons' });
  html += header({ eyebrow: 'MAE 3293 · Oklahoma State University', h1: 'Fundamentals of Aerodynamics',
                   home: 'https://www.kursatkara.com/#teaching', home_label: 'Course instructor' });
  html += fill(rd('src/templates/home.html'), { chapters, calculator: course.calculator, repo: course.repo }) + footer();
  return html + pageScript(rd('src/shared/theme.js'));
}

/* ---------- self-contained output: fonts and pre-rendered math ---------- */
function fontFaces() {
  const FD = path.join(ROOT, 'node_modules/@fontsource-variable/');
  const ranges = {};
  for (const fam of ['source-serif-4', 'source-sans-3']) for (const css of ['wght.css', 'wght-italic.css']) {
    const t = fs.readFileSync(FD + fam + '/' + css, 'utf8');
    for (const m of t.matchAll(/url\(\.\/files\/([^)]+)\)[\s\S]*?unicode-range:\s*([^;]+);/g)) ranges[m[1]] = m[2];
  }
  const faces = [];
  const add = (fam, dir, file, style) => {
    const b = fs.readFileSync(FD + dir + '/files/' + file).toString('base64');
    faces.push(`@font-face{font-family:'${fam}';font-style:${style};font-display:swap;font-weight:200 900;src:url(data:font/woff2;base64,${b}) format('woff2');unicode-range:${ranges[file]}}`);
  };
  for (const s of ['latin', 'latin-ext', 'greek']) {
    add('Source Serif 4', 'source-serif-4', `source-serif-4-${s}-wght-normal.woff2`, 'normal');
    add('Source Sans 3', 'source-sans-3', `source-sans-3-${s}-wght-normal.woff2`, 'normal');
  }
  add('Source Serif 4', 'source-serif-4', 'source-serif-4-latin-wght-italic.woff2', 'italic');
  add('Source Sans 3', 'source-sans-3', 'source-sans-3-latin-wght-italic.woff2', 'italic');
  return `/* embedded fonts (SIL OFL 1.1: Adobe Source Serif 4 and Source Sans 3) */\n${faces.join('\n')}`;
}

async function main() {
  const pages = [['index.html', homePage(), false]];
  course.lessons.forEach((L, i) => pages.push(['lessons/' + L.slug + '.html', lessonPage(L, i), true]));
  fs.mkdirSync(path.join(ROOT, 'lessons'), { recursive: true });
  if (DEV) {
    for (const [out, html, math] of pages) {
      fs.writeFileSync(path.join(ROOT, out), html.replace('<style>', CDN + (math ? MJ_CDN : '') + '<style>'));
      console.log('dev ', out);
    }
    return;
  }
  const FACES = fontFaces();
  const MJ = await require('mathjax').init({ loader: { load: ['input/tex', 'output/svg'] },
    tex: { packages: { '[+]': ['ams'] } }, svg: { fontCache: 'local' } });
  const A = MJ.startup.adaptor;
  const MJCSS = A.textContent(MJ.svgStylesheet());
  let failed = 0;
  for (let [out, html, math] of pages) {
    let n = 0; const errs = [];
    const conv = (tex, display) => {
      const src = tex.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      let s = A.outerHTML(MJ.tex2svg(src, { display }));
      const lab = tex.trim().replace(/\s+/g, ' ').replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      s = s.replace('<svg ', '<svg aria-label="' + lab + '" ');
      if (/data-mjx-error|merror/.test(s)) errs.push(tex);
      n++; return s;
    };
    if (math) {   // only inside <body>, before the page script
      const i = html.indexOf('<body>'), j = html.lastIndexOf('<script>');
      const body = html.slice(i, j).replace(/\\\[([\s\S]*?)\\\]/g, (m, t) => conv(t, true))
                                   .replace(/\\\(([\s\S]*?)\\\)/g, (m, t) => conv(t, false));
      html = html.slice(0, i) + body + html.slice(j);
    }
    html = html.replace('</style>', `\n${FACES}\n` + (math ? `/* MathJax SVG output (pre-rendered) */\n${MJCSS}\nmjx-container[display="true"]{margin:.4em 0!important}\n` : '') + '</style>');
    fs.writeFileSync(path.join(ROOT, out), html);
    if (errs.length) failed++;
    console.log(out.padEnd(48), (html.length / 1024).toFixed(0).padStart(5) + ' KB', math ? `${n} equations` : '', errs.length ? 'TeX ERRORS: ' + errs.slice(0, 3).join(' | ') : '');
  }
  if (failed) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });

#!/usr/bin/env node
/*
  Link-preview images (1200 x 630, Open Graph / Twitter) rendered from the built pages
  with Playwright:  assets/<slug>-preview.png for each lesson, and assets/course-preview.png
  for the course home (made from the lesson previews, so run it after them).
  Run after `npm run build`:  node tools/preview-images.js [slug ...]
  A new lesson needs an entry in CARDS: the figure to show and how to set it up.
*/
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const course = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/course.json'), 'utf8'));

const CARDS = {
  'oblique-shock-expansion-waves': {
    blurb: 'Mach waves, θ–β–M, Prandtl–Meyer fans, and shock-expansion theory for supersonic airfoils, computed live.',
    cols: '430px 1fr',
    setup: async p => { await p.click('#af_pre button:has-text("Diamond ε = 5°")'); },
    figure: () => { const s = document.getElementById('af_fig').cloneNode(true);
      s.setAttribute('viewBox', '196 60 584 350'); [...s.querySelectorAll('text')].forEach(t => { if (t.textContent.startsWith('slip')) t.remove(); }); return s.outerHTML; }
  },
  'nozzles-diffusers-wind-tunnels': {
    blurb: 'Area–Mach relation, choked flow, and normal shocks in a converging-diverging nozzle, computed live.',
    cols: '400px 1fr',
    setup: async p => { await p.click('#nz_pre button:nth-child(4)'); },
    figure: () => document.getElementById('nz_fig').outerHTML + document.getElementById('nz_p').outerHTML
  }
};

async function card(b, L) {
  const C = CARDS[L.slug]; if (!C) { console.log('no CARDS entry for', L.slug); return; }
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.emulateMedia({ colorScheme: 'light' });
  await p.goto('file://' + path.join(ROOT, 'lessons', L.slug + '.html')); await p.waitForTimeout(800);
  await p.evaluate(() => { try { localStorage.removeItem('theme'); } catch (e) {} document.documentElement.setAttribute('data-theme', 'light'); });
  await C.setup(p); await p.waitForTimeout(400);
  const fig = await p.evaluate(C.figure);
  await p.evaluate(([L, C, fig]) => {
    document.body.innerHTML = `<div style="width:1200px;height:630px;box-sizing:border-box;padding:40px 52px;display:grid;grid-template-columns:${C.cols};gap:28px;align-items:center;background:var(--bg);border-top:10px solid var(--accent)">
      <div style="display:flex;flex-direction:column;gap:18px">
        <p class="eyebrow" style="font-size:17px">MAE 3293 · Interactive lesson</p>
        <h1 style="font-size:52px;line-height:1.05">${L.title}</h1>
        <p style="font-size:21px;color:var(--muted);line-height:1.4">${C.blurb}</p>
        <p style="font-size:16px;color:var(--muted)">Kursat Kara · Oklahoma State University</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">${fig}</div></div>`;
    document.querySelectorAll('svg').forEach(s => { s.style.width = '100%'; s.style.height = 'auto'; s.style.minWidth = '0'; });
    document.body.style.padding = '0'; document.body.style.margin = '0';
  }, [{ title: L.title }, { cols: C.cols, blurb: C.blurb }, fig]);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(ROOT, 'assets', L.slug + '-preview.png') });
  console.log('assets/' + L.slug + '-preview.png'); await p.close();
}

async function home(b) {
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.emulateMedia({ colorScheme: 'light' });
  await p.goto('file://' + path.join(ROOT, 'index.html')); await p.waitForTimeout(600);
  await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  const imgs = course.lessons.slice(-2).map(L => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets', L.slug + '-preview.png')).toString('base64'));
  await p.evaluate(([imgs, n]) => {
    document.body.innerHTML = `<div style="width:1200px;height:630px;box-sizing:border-box;padding:40px 52px;display:grid;grid-template-columns:520px 520px;gap:56px;align-items:center;background:var(--bg);border-top:10px solid var(--accent)">
      <div style="display:flex;flex-direction:column;gap:18px">
        <p class="eyebrow" style="font-size:17px">MAE 3293 · Oklahoma State University</p>
        <h1 style="font-size:58px;line-height:1.05">Fundamentals of Aerodynamics</h1>
        <p style="font-size:22px;color:var(--muted);line-height:1.4">Interactive lessons in which every figure is computed live from the exact gas-dynamic relations.</p>
        <p style="font-size:16px;color:var(--muted)">Kursat Kara</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">${imgs.map(s => `<img src="${s}" style="width:100%;height:auto;border:1px solid var(--line);display:block">`).join('')}</div></div>`;
    document.body.style.padding = '0'; document.body.style.margin = '0';
  }, [imgs, course.lessons.length]);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(ROOT, 'assets/course-preview.png') });
  console.log('assets/course-preview.png'); await p.close();
}

(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch();
  for (const L of course.lessons) if (!only.length || only.includes(L.slug)) await card(b, L);
  await home(b);
  await b.close();
})();

#!/usr/bin/env node
/*
  Browser audit of the built pages (index.html and lessons/*.html) with Playwright,
  at desktop width in the light theme and at phone width in the dark theme:
  duplicate ids, unlabeled inputs, NaN/undefined in figures and readouts, heading
  skips, unlabeled SVG figures, broken in-page anchors, horizontal overflow,
  network requests (the pages must be self-contained), script errors, and links
  to course pages or assets that do not exist in this repository.
  Run after `npm run build`:  node tools/audit-pages.js   (exit code 1 on any problem)
*/
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const course = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/course.json'), 'utf8'));
const pages = ['index.html', ...course.lessons.map(L => 'lessons/' + L.slug + '.html')];

(async () => {
  const b = await chromium.launch(); let problems = 0;
  for (const page of pages) for (const [w, scheme] of [[1300, 'light'], [390, 'dark']]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.emulateMedia({ colorScheme: scheme });
    const ext = []; await p.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:')) r.continue(); else { ext.push(u); r.abort(); } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
    await p.goto('file://' + path.join(ROOT, page)); await p.waitForTimeout(1200);
    const r = await p.evaluate(base => {
      const ids = {}; document.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; });
      const dup = Object.keys(ids).filter(k => ids[k] > 1);
      const unlabeled = [...document.querySelectorAll('input,select,textarea')].filter(i => !(i.labels && i.labels.length) && !i.getAttribute('aria-label')).map(i => i.id || i.name);
      const nan = [...document.querySelectorAll('svg,.readout,table')].filter(e => /NaN|undefined|Infinity/.test(e.innerHTML)).map(e => e.id || e.className.baseVal || e.className);
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map(h => +h.tagName[1]); let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) skips++;
      const svgNoLabel = [...document.querySelectorAll('svg[role=img]')].filter(s => !s.getAttribute('aria-label')).length;
      const imgNoAlt = [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length;
      const wide = [...document.querySelectorAll('body *')].filter(e => { const q = e.getBoundingClientRect(); return q.right > document.documentElement.clientWidth + 1 && !e.closest('.fig,.tblwrap,.eq,.tabs,.toc,mjx-container'); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className);
      const anchors = [...document.querySelectorAll('a[href^="#"]')].filter(a => a.getAttribute('href').length > 1 && !document.querySelector(a.getAttribute('href'))).map(a => a.getAttribute('href'));
      const local = [...document.querySelectorAll('a[href],img[src]')].map(e => e.getAttribute('href') || e.getAttribute('src'))
        .filter(u => u.startsWith(base) || !/^(https?:|data:|#|mailto:)/.test(u))
        .map(u => u.startsWith(base) ? u.slice(base.length) || 'index.html' : u);
      return { dup, unlabeled, nan, skips, svgNoLabel, imgNoAlt, wide, anchors, local, scrollW: document.documentElement.scrollWidth, viewW: document.documentElement.clientWidth };
    }, course.base);
    const dir = path.dirname(path.join(ROOT, page));
    const missing = r.local.filter(u => { const f = u.split('#')[0]; if (!f) return false;
      return !fs.existsSync(path.join(ROOT, f)) && !fs.existsSync(path.join(dir, f)); });
    const bad = { dup: r.dup, unlabeled: r.unlabeled, nan: r.nan, skips: r.skips, svgNoLabel: r.svgNoLabel, imgNoAlt: r.imgNoAlt, wide: r.wide, anchors: r.anchors, missing, overflow: r.scrollW > r.viewW ? r.scrollW : 0, external: ext, errors: errs };
    const found = Object.entries(bad).filter(([k, v]) => Array.isArray(v) ? v.length : v);
    problems += found.length;
    console.log((found.length ? 'FAIL ' : 'ok   ') + page.padEnd(46) + String(w).padStart(5) + ' ' + scheme.padEnd(6), found.length ? JSON.stringify(Object.fromEntries(found)) : '');
    await p.close();
  }
  await b.close();
  console.log(problems ? problems + ' problem(s)' : 'all pages pass');
  process.exit(problems ? 1 : 0);
})();

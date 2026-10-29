#!/usr/bin/env node
/*
  Course-home sketches: one text-free figure per lesson, cut from the lesson's own
  interactive figure and saved as src/thumbs/<slug>.svg. The build inlines them into
  index.html, so they follow the light and dark themes (they use the page's colour tokens).
  Run after `npm run build`, then build again:  node tools/thumbnails.js [slug ...]
  A new lesson needs an entry in THUMBS: the figure, how to set it up, and what to keep.
*/
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const course = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/course.json'), 'utf8'));

const THUMBS = {
  'compressible-flow-preliminaries': {   // T-s diagram: isentropic and nonisentropic expansion (Ex 7.5)
    setup: async p => { await p.click('#tsx_pre button:nth-child(2)'); },
    svg: 'tsx_fig', viewBox: '0 4 775 306', stroke: 1.8, keepText: t => /^(1|2|2s)$/.test(t.trim()),
    extra: '<line x1="66" y1="276" x2="66" y2="20" class="thaxis" marker-end="url(#tsx-ink)"/><line x1="66" y1="276" x2="742" y2="276" class="thaxis" marker-end="url(#tsx-ink)"/><text x="26" y="46" class="thlab">T</text><text x="750" y="292" class="thlab">s</text>'
  },
  'normal-shock-waves': {                // Pitot tube behind a detached bow shock at Mach 3
    setup: async p => { await p.evaluate(() => { const e = document.getElementById('pt_M'); e.value = 3; e.dispatchEvent(new Event('input')); }); },
    svg: 'pt_sch', viewBox: '150 0 610 190', stroke: 1.6, keepText: () => false
  },
  'oblique-shock-expansion-waves': {     // diamond airfoil at angle of attack in supersonic flow
    setup: async p => { await p.click('#af_pre button:has-text("Diamond ε = 5°")'); },
    svg: 'af_fig', viewBox: '150 40 640 360', keepText: () => false, dropBoxes: true
  },
  'nozzles-diffusers-wind-tunnels': {    // converging-diverging nozzle with a normal shock in the diverging section
    setup: async p => { await p.click('#nz_pre button:nth-child(4)'); },
    svg: 'nz_fig', viewBox: '0 20 760 210', keepText: () => false, dropBoxes: true
  }
};

(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch();
  for (const L of course.lessons) {
    const T = THUMBS[L.slug]; if (!T || (only.length && !only.includes(L.slug))) continue;
    const p = await b.newPage({ viewport: { width: 1300, height: 900 } });
    await p.emulateMedia({ colorScheme: 'light' });
    await p.goto('file://' + path.join(ROOT, 'lessons', L.slug + '.html')); await p.waitForTimeout(800);
    await T.setup(p); await p.waitForTimeout(400);
    const inner = await p.evaluate(([id, keep, drop, k]) => {
      const s = document.getElementById(id).cloneNode(true);
      const keepText = new Function('t', 'return (' + keep + ')(t)');
      s.querySelectorAll('text').forEach(t => { if (!keepText(t.textContent)) t.remove(); });
      s.querySelectorAll('.gridl,.tick,.axlab,rect.axis').forEach(e => e.remove());
      s.querySelectorAll('circle').forEach(c => { if (/--panel/.test(c.getAttribute('style') || '')) c.remove(); });   // numbered region badges
      if (k !== 1) s.querySelectorAll('[stroke-width]').forEach(e => e.setAttribute('stroke-width', (+e.getAttribute('stroke-width') * k).toFixed(2)));
      if (drop) s.querySelectorAll('rect').forEach(r => { const st = r.getAttribute('style') || '', fl = r.getAttribute('fill') || ''; if (/--panel|--bg/.test(st + fl) || (+r.getAttribute('height') < 14 && +r.getAttribute('width') < 200)) r.remove(); });
      return s.innerHTML;
    }, [T.svg, T.keepText.toString(), !!T.dropBoxes, T.stroke || 1]);
    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${T.viewBox}">${inner}${T.extra || ''}</svg>\n`;
    fs.writeFileSync(path.join(ROOT, 'src/thumbs', L.slug + '.svg'), out);
    console.log('src/thumbs/' + L.slug + '.svg', (out.length / 1024).toFixed(1) + ' KB');
    await p.close();
  }
  await b.close();
})();

/* =====================================================================
   Prandtl–Meyer calculator: expansion around a convex corner (two of M1, theta,
   M2), and an Appendix C lookup (M <-> nu <-> mu). Uses nu, numax, Mofnu and T0T
   (core.js); nu is checked against Anderson's Appendix C in tools/check-tables.js.
   ===================================================================== */
(function(){
  const MMAX=50, box={M1:$('pm_M1'),th:$('pm_th'),M2:$('pm_M2')};
  const mode=()=>$('pm_mode').value;
  let st=null;
  const go=sched(render);
  function lock(){const m=mode();['M1','th','M2'].forEach(k=>{const e=box[k];e.readOnly=k===m;e.classList.toggle('solved',k===m);e.setAttribute('aria-readonly',k===m?'true':'false');});
    $('pm_note').textContent=m==='M2'?'M₂ is solved from M₁ and θ.':'θ is solved from M₁ and M₂.';}
  function ratios(M1,M2,th){const T21=T0T(M1,G)/T0T(M2,G);
    return {M1,M2,th,nu1:nu(M1,G),nu2:nu(M2,G),mu1:Math.asin(1/M1),mu2:Math.asin(1/M2),T21,p21:Math.pow(T21,G/(G-1)),r21:Math.pow(T21,1/(G-1))};}
  function solve(){
    const m=mode(),M1=parseFloat(box.M1.value),th=parseFloat(box.th.value)*D,M2=parseFloat(box.M2.value);
    const E=(t,d)=>({err:t,d:d||''});
    if(!(M1>=1&&M1<=MMAX))return E('Enter M₁ between 1 and 50.','A Prandtl–Meyer expansion starts from sonic or supersonic flow.');
    const n1=nu(M1,G),room=numax(G)-n1;
    if(m==='M2'){
      if(!(th>=0))return E('Enter θ ≥ 0°.','A negative θ turns the flow into itself: that is a compression (an oblique shock, or an isentropic compression), not an expansion.');
      if(th>=room)return E(`θ = ${f(th*R,2)}° is at or beyond the largest possible turn, ν<sub>max</sub> − ν(M₁) = ${f(room*R,2)}°.`,'The flow would expand to zero pressure (M₂ → ∞) before turning that far.');
      return ratios(M1,Mofnu(n1+th,G),th);}
    if(!(M2>=M1&&M2<=1e4))return E('Enter M₂ ≥ M₁.','An expansion accelerates the flow; a lower M₂ needs a compression.');
    return ratios(M1,M2,nu(M2,G)-n1);}
  function update(){st=solve();const m=mode(),e=box[m];
    if(st.err)e.value='';else e.value=m==='M2'?+st.M2.toFixed(4):+(st.th*R).toFixed(4);go();}
  Object.values(box).forEach(e=>e.addEventListener('input',update));
  $('pm_mode').addEventListener('change',()=>{lock();update();});
  function preset(m,v){$('pm_mode').value=m;lock();box.M1.value=v.M1??'';box.th.value=v.th??'';box.M2.value=v.M2??'';update();}
  [['<i>M</i><sub>1</sub> = 2, θ = 10°','M2',{M1:2,th:10}],['<i>M</i><sub>1</sub> = 1.5, θ = 20°','M2',{M1:1.5,th:20}],['Sonic corner: <i>M</i><sub>1</sub> = 1, θ = 20°','M2',{M1:1,th:20}],['<i>M</i><sub>1</sub> = 3, θ = 30°','M2',{M1:3,th:30}],
   ['Turn to reach <i>M</i><sub>2</sub> = 3 from <i>M</i><sub>1</sub> = 2','th',{M1:2,M2:3}],['Too far: <i>M</i><sub>1</sub> = 2, θ = 110°','M2',{M1:2,th:110}]].forEach(([t,m,v])=>{
    const b=document.createElement('button');b.type='button';b.innerHTML=t;b.onclick=()=>preset(m,v);$('pm_pre').appendChild(b);});
  renderers.push(update);
  lock();update();

  function render(){
    const r=st,ok=!r.err,m=mode(),deg=x=>ok?f(x*R,4)+'°':'—',V=x=>ok?x:NaN;
    $('pm_short').textContent=`γ = ${f(G,3)}`;
    $('pm_msg').innerHTML=ok?(r.th<1e-9?banner('warn','θ = 0: no turn, no expansion.','The Mach line at μ₁ is the whole wave and every ratio is 1.'):''):banner('bad',r.err,r.d);
    /* to-scale convex corner and centered fan */
    const pf='pms',C=[300,118];let s=markers(pf)+`<defs><clipPath id="pmclip"><rect x="0" y="0" width="760" height="270"/></clipPath></defs><g clip-path="url(#pmclip)">`;
    if(ok){const th=r.th,end=ray(C,-th,600),a0=r.mu1,a1=r.mu2-th;
      s+=`<path d="M0,${C[1]} L${C[0]},${C[1]} L${fx(end[0])},${fx(end[1])} L760,${fx(Math.max(end[1],270))} L760,270 L0,270 Z" style="fill:var(--soft)"/>`;
      s+=wall([[0,C[1]],C,end],1)+ln(C,[C[0]+190,C[1]],'mach',1.2,'stroke-dasharray="5 4"');
      const n=th>1e-9?9:1;for(let k=0;k<n;k++){const a=n>1?a0+(a1-a0)*k/(n-1):a0;s+=ln(C,ray(C,a,520),'exp',k===0||k===n-1?1.8:1.1);}
      /* one streamline through the fan: straight until the first Mach line, turned a little at each ray */
      let p=[0,C[1]-62],dir=0;const pts=[p];
      for(let k=0;k<n;k++){const a=n>1?a0+(a1-a0)*k/(n-1):a0,e=[Math.cos(a),-Math.sin(a)],d=[Math.cos(dir),-Math.sin(dir)];
        const den=d[0]*e[1]-d[1]*e[0];if(Math.abs(den)<1e-9)break;const t=((C[0]-p[0])*e[1]-(C[1]-p[1])*e[0])/den;p=[p[0]+t*d[0],p[1]+t*d[1]];pts.push(p);dir=-th*(k+1)/n;}
      pts.push(ray(p,-th,700));s+=pl(pts,'stream',1.6);
      s+=arc(C,70,0,-th,'muted',1.2);
      const mid=r.mu2/2-th,P=ray(C,mid,Math.min(300,130/Math.max(0.15,Math.sin(r.mu2/2)))),u=[36*Math.cos(th),36*Math.sin(th)];
      s+=arrow([40,84],[150,84],'ink',pf,2.2)+(th>1e-9?arrow([P[0]-u[0],P[1]-u[1]],[P[0]+u[0],P[1]+u[1]],'ink',pf,2.2):'');
      s+=tx([40,72],`M₁ = ${f(r.M1,3)}`,'flab')+(th>1e-9?tx([P[0]+u[0]+8,P[1]+u[1]+16],`M₂ = ${f(r.M2,3)}`,'flab'):'');
      const L0=ray(C,a0,Math.min(200,95/Math.sin(a0))),L1=ray(C,a1,300);
      s+=tx([L0[0]-10,L0[1]+4],`μ₁ = ${f(a0*R,1)}°`,'axlab','text-anchor="end"')+(th>1e-9?tx([L1[0]+6,L1[1]+4],`μ₂ = ${f(r.mu2*R,1)}° to the turned flow`,'axlab'):'');
      s+=tx([C[0]+194,C[1]+5],`θ = ${f(th*R,1)}°`,'axlab');}
    else s+=tx([380,135],'Enter valid values to draw the expansion fan.','axlab','text-anchor="middle"');
    $('pm_sch').innerHTML=s+'</g>';
    const kn=k=>k!==m;
    const rows=[['M<sub>1</sub>','known',ok?f(r.M1,4):'—',''],
      ['θ',kn('th')?'known':'ν(M<sub>2</sub>) − ν(M<sub>1</sub>)',deg(r.th),kn('th')?'':'hl'],
      ['M<sub>2</sub>',kn('M2')?'known':'invert ν(M<sub>2</sub>) = ν(M<sub>1</sub>) + θ',ok?f(r.M2,4):'—',kn('M2')?'':'hl'],
      ['ν(M<sub>1</sub>)','Prandtl–Meyer function',deg(r.nu1),''],
      ['μ<sub>1</sub>','sin<sup>−1</sup>(1/M<sub>1</sub>)',deg(r.mu1),''],
      ['ν(M<sub>2</sub>)','ν(M<sub>1</sub>) + θ',deg(r.nu2),''],
      ['μ<sub>2</sub>','sin<sup>−1</sup>(1/M<sub>2</sub>)',deg(r.mu2),''],
      ['p<sub>2</sub>/p<sub>1</sub>','isentropic',f(V(r.p21),4),''],
      ['ρ<sub>2</sub>/ρ<sub>1</sub>','isentropic',f(V(r.r21),4),''],
      ['T<sub>2</sub>/T<sub>1</sub>','isentropic',f(V(r.T21),4),'']];
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Value</th></tr></thead><tbody>`;
    rows.forEach(x=>{h+=`<tr><td class="l">${x[0]}</td><td class="rel">${x[1]}</td><td class="${x[3]}">${x[2]}</td></tr>`;});
    const M1v=parseFloat(box.M1.value),n1=M1v>=1?nu(M1v,G):NaN;
    h+=`<tr><td class="l" colspan="3" style="padding-top:12px;color:var(--ink);font-weight:600">Also</td></tr>`;
    h+=`<tr><td class="l">p<sub>0,2</sub>/p<sub>0,1</sub>, T<sub>0,2</sub>/T<sub>0,1</sub></td><td class="rel">isentropic: total conditions unchanged</td><td>${ok?f(1,4):'—'}</td></tr>`;
    h+=`<tr><td class="l">ν<sub>max</sub></td><td class="rel">ν as M → ∞</td><td>${f(numax(G)*R,4)}°</td></tr>`;
    h+=`<tr><td class="l">Largest turn from M<sub>1</sub></td><td class="rel">ν<sub>max</sub> − ν(M<sub>1</sub>)</td><td>${isFinite(n1)&&M1v<=MMAX?f((numax(G)-n1)*R,4)+'°':'—'}</td></tr>`;
    $('pm_tab').innerHTML=h+'</tbody>';
  }

  /* ---------- Appendix C: one of M, nu, mu -> the other two ---------- */
  const sel=$('ac_sel'),val=$('ac_val'),note=$('ac_note');
  const AC={M:{inv:v=>v>=1&&v<=1e4?v:NaN,hint:'M ≥ 1'},nu:{inv:v=>v>=0&&v*D<numax(G)?Mofnu(v*D,G):NaN,hint:()=>`0 ≤ ν < ${f(numax(G)*R,2)}° (the limit as M → ∞)`},mu:{inv:v=>v>0&&v<=90?1/Math.sin(v*D):NaN,hint:'0° < μ ≤ 90°'}};
  const goC=sched(renderC);
  sel.addEventListener('change',()=>{const M=AC[lastK].inv(parseFloat(val.value));lastK=sel.value;if(isFinite(M))val.value=+(sel.value==='M'?M:sel.value==='nu'?nu(M,G)*R:Math.asin(1/M)*R).toFixed(4);goC();});
  let lastK='M';
  val.addEventListener('input',goC);renderers.push(goC);
  function renderC(){const k=sel.value,M=AC[k].inv(parseFloat(val.value)),okC=isFinite(M),hint=typeof AC[k].hint==='function'?AC[k].hint():AC[k].hint;
    note.textContent=(okC?'':val.value===''?'Enter a value. ':'Out of range. ')+hint;note.style.color=okC?'':'var(--bad)';
    const rows=[['M','',okC?f(M,4):'—','M'],['ν','Prandtl–Meyer function',okC?f(nu(M,G)*R,4)+'°':'—','nu'],['μ','sin<sup>−1</sup>(1/M)',okC?f(Math.asin(1/M)*R,4)+'°':'—','mu']];
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Value</th></tr></thead><tbody>`;
    rows.forEach(x=>{h+=`<tr><td class="l">${x[0]}</td><td class="rel">${x[3]===k?'known':x[1]||'from ν or μ'}</td><td class="${x[3]===k?'hl':''}">${x[2]}</td></tr>`;});
    $('ac_tab').innerHTML=h+'</tbody>';}
})();

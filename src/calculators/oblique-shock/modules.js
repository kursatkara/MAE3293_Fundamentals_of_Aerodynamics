/* =====================================================================
   Oblique-shock calculator: any two of M1, theta, beta -> the third, then the
   normal-shock relations on Mn1 = M1 sin(beta). Uses thetaOf, betaMax, oblique and
   shockFromBeta (core.js), checked in tools/check-tables.js; obliqueClosed gives the
   closed-form solution shown in the methods section.
   ===================================================================== */
(function(){
  const MMAX=50, F=['M','th','b'], box={M:$('ob_M'),th:$('ob_th'),b:$('ob_b')};
  const mode=()=>$('ob_mode').value, key=()=>({b:'b',t:'th',M:'M'})[mode()], strong=()=>$('ob_br').value==='strong';
  let st=null;   /* the last solution, or {err} */
  const go=sched(render);
  function lock(){const m=key();F.forEach(k=>{const e=box[k];e.readOnly=k===m;e.classList.toggle('solved',k===m);e.setAttribute('aria-readonly',k===m?'true':'false');});
    $('ob_brbox').hidden=m!=='b';
    $('ob_note').textContent={b:'β is solved from M₁ and θ.',th:'θ is solved from M₁ and β.',M:'M₁ is solved from θ and β.'}[m];}
  function solve(){
    const m=mode(),M=parseFloat(box.M.value),th=parseFloat(box.th.value)*D,b=parseFloat(box.b.value)*D;
    const E=(t,d)=>({err:t,d});
    if(m==='b'){
      if(!(M>1&&M<=MMAX))return E('Enter M₁ between 1 and 50.','The upstream flow must be supersonic for a shock.');
      if(!(th>=0&&th<Math.PI/2))return E('Enter θ ≥ 0°.','A negative θ turns the flow away from itself: that is an expansion, not a shock.');
      const r=oblique(M,th,G,strong());
      if(r.type==='detached')return E(`θ = ${f(th*R,2)}° exceeds θ<sub>max</sub> = ${f(r.thmax*R,2)}° for M₁ = ${f(M,3)}.`,'No attached oblique shock exists: the shock detaches and stands ahead of the corner as a curved bow shock.');
      return r;}
    if(m==='t'){
      if(!(M>1&&M<=MMAX))return E('Enter M₁ between 1 and 50.','The upstream flow must be supersonic for a shock.');
      const mu=Math.asin(1/M);
      if(!(b>=mu&&b<=Math.PI/2+1e-12))return E(`Enter β between μ = ${f(mu*R,2)}° and 90°.`,'Below the Mach angle there is no wave; 90° is the normal shock.');
      const r=shockFromBeta(M,b,G);r.thmax=thetaMax(M,G);r.betamax=betaMax(M,G);return r;}
    /* m === 'M': theta and beta given */
    if(!(th>=0))return E('Enter θ ≥ 0°.','');
    if(!(b>th&&b<=Math.PI/2+1e-12))return E('Enter β with θ < β ≤ 90°.','The wave angle must exceed the deflection angle.');
    const Mx=inv(m=>thetaOf(m,b,G),th,1/Math.sin(b),MMAX);
    if(!isFinite(Mx))return E(`No M₁ ≤ 50 gives θ = ${f(th*R,2)}° at β = ${f(b*R,2)}°.`,'For this β, θ cannot be reached: lower θ or raise β.');
    const r=shockFromBeta(Mx,b,G);r.theta=th;r.thmax=thetaMax(Mx,G);r.betamax=betaMax(Mx,G);return r;}
  function update(){st=solve();
    /* write the solved quantity back into its (read-only) box */
    const m=mode(),e=box[key()];
    if(st.err)e.value='';else e.value=m==='M'?+st.M1.toFixed(4):+((m==='b'?st.beta:st.theta)*R).toFixed(4);
    go();}
  F.forEach(k=>box[k].addEventListener('input',update));
  $('ob_mode').addEventListener('change',()=>{lock();update();});
  $('ob_br').addEventListener('change',update);
  function preset(m,v){$('ob_mode').value=m;lock();box.M.value=v.M??'';box.th.value=v.th??'';box.b.value=v.b??'';$('ob_br').value=v.strong?'strong':'weak';update();}
  [['<i>M</i><sub>1</sub> = 2, θ = 10°','b',{M:2,th:10}],['<i>M</i><sub>1</sub> = 3, θ = 20°, weak','b',{M:3,th:20}],['<i>M</i><sub>1</sub> = 3, θ = 20°, strong','b',{M:3,th:20,strong:1}],['<i>M</i><sub>1</sub> = 5, θ = 15°','b',{M:5,th:15}],
   ['Detached: <i>M</i><sub>1</sub> = 2, θ = 25°','b',{M:2,th:25}],['<i>M</i><sub>1</sub> = 3, β = 40°','t',{M:3,b:40}],['θ = 10°, β = 40°','M',{th:10,b:40}]].forEach(([t,m,v])=>{
    const b=document.createElement('button');b.type='button';b.innerHTML=t;b.onclick=()=>preset(m,v);$('ob_pre').appendChild(b);});
  renderers.push(update);
  lock();update();

  /* three ways to find beta from M1 and theta: chart, bisection, closed form */
  function methods(r,ok,m){
    const hide=t=>{$('ob_mnote').textContent=t;['ob_mcmp','ob_m2','ob_m3'].forEach(id=>$(id).innerHTML='');$('ob_m1').textContent='';$('ob_m2n').textContent='';};
    if(m!=='b'){hide('This comparison applies when β is solved from M₁ and θ: choose “β, from M₁ and θ” above.');return;}
    if(!ok){hide('Enter M₁ and an attached-shock deflection θ above.');return;}
    const M=r.M1,th=r.theta,bm=betaMax(M,G),mu=Math.asin(1/M);
    if(th<1e-9){hide('At θ = 0 the weak solution is the Mach wave (β = μ) and the strong one the normal shock (β = 90°). The closed form is undefined there, because a = 0.');return;}
    $('ob_mnote').textContent='';
    const bw=oblique(M,th,G,false).beta,bs=oblique(M,th,G,true).beta,cf=obliqueClosed(M,th,G),d4=x=>isFinite(x)?f(x*R,6)+'°':'—';
    const half=x=>(Math.round(x*R*2)/2).toFixed(1)+'°';
    /* comparison */
    let h=`<thead><tr><th class="l">Method</th><th>Weak β</th><th>Strong β</th></tr></thead><tbody>`;
    h+=`<tr><td class="l">1. Chart, read to 0.5°</td><td>${half(bw)}</td><td>${half(bs)}</td></tr>`;
    h+=`<tr><td class="l">2. Bisection</td><td class="hl">${d4(bw)}</td><td class="hl">${d4(bs)}</td></tr>`;
    h+=`<tr><td class="l">3. Closed form</td><td>${d4(cf.weak)}</td><td>${d4(cf.strong)}</td></tr>`;
    h+=`<tr><td class="l">Difference, 3 − 2</td><td>${isFinite(cf.weak)?sci((cf.weak-bw)*R,2)+'°':'—'}</td><td>${isFinite(cf.strong)?sci((cf.strong-bs)*R,2)+'°':'—'}</td></tr></tbody>`;
    $('ob_mcmp').innerHTML=h;
    /* 1: chart */
    $('ob_m1').innerHTML=`On the chart above, the vertical line θ = ${f(th*R,2)}° crosses the curve for M<sub>1</sub> = ${f(M,3)} twice: once on the solid weak branch, near β ≈ ${half(bw)}, and once on the dashed strong branch, near β ≈ ${half(bs)}. A printed chart such as the one in the textbook can be read to about half a degree, which is why hand solutions of oblique-shock problems differ in the second significant figure.`;
    /* 2: bisection steps, weak branch */
    let lo=mu,hi=bm,rows='';
    for(let k=1;k<=6;k++){const mid=(lo+hi)/2,tm=thetaOf(M,mid,G);rows+=`<tr><td>${k}</td><td>${f(lo*R,4)}°</td><td>${f(hi*R,4)}°</td><td>${f(mid*R,4)}°</td><td>${f(tm*R,4)}°</td><td class="l">${tm<th?'θ too small: β is above the midpoint':'θ too large: β is below the midpoint'}</td></tr>`;if(tm<th)lo=mid;else hi=mid;}
    $('ob_m2').innerHTML=`<thead><tr><th>Step</th><th>Lower β</th><th>Upper β</th><th>Midpoint β</th><th>θ at midpoint</th><th class="l">Result</th></tr></thead><tbody>${rows}</tbody>`;
    const steps=Math.ceil(Math.log2((bm-mu)*R/1e-10));
    $('ob_m2n').textContent=`The first six steps for the weak solution are shown. Each step halves the interval, so about ${steps} steps bring it below 10⁻¹⁰ degrees; the strong solution is found the same way between ${f(bm*R,2)}° and 90°.`;
    /* 3: closed form values */
    let t=`<thead><tr><th class="l">Quantity</th><th>Value</th></tr></thead><tbody>`;
    [['c = tan²μ',cf.c],['a',cf.a],['b',cf.b],['k',27*cf.a*cf.a*cf.c+9*cf.a*cf.b-2],['d',cf.d]].forEach(([q,v])=>{t+=`<tr><td class="l">${q}</td><td>${f(v,6)}</td></tr>`;});
    cf.roots.forEach(z=>{const lab=z.physical?(Math.abs(z.beta-cf.weak)<1e-12?'weak solution':'strong solution'):'not physical (β outside μ to 90°)';
      t+=`<tr><td class="l">n = ${z.n}: tan β = ${f(z.tanb,6)}</td><td>β = ${f(z.beta*R,4)}°, ${lab}</td></tr>`;});
    $('ob_m3').innerHTML=t+'</tbody>';
  }
  function render(){
    const r=st,ok=!r.err,m=mode(),kk=key(),V=x=>ok?x:NaN,deg=x=>ok?f(x*R,4)+'°':'—';
    $('ob_short').textContent=`γ = ${f(G,3)}`;
    $('ob_msg').innerHTML=ok&&r.theta<1e-9?banner('warn',r.beta>r.betamax?'θ = 0, strong solution: a normal shock (β = 90°).':'θ = 0, weak solution: a Mach wave (β = μ).',r.beta>r.betamax?'':'The wave is infinitely weak, so every ratio across it is 1.'):ok?(r.M2<1?banner('warn',`M₂ = ${f(r.M2,4)}: the flow behind the shock is subsonic.`,r.beta>r.betamax?'This is the strong solution.':'The deflection is close to θ<sub>max</sub>; the weak solution is subsonic only in this narrow band.'):''):banner('bad',r.err,r.d);
    /* to-scale corner */
    const pf='obs',C=[290,205];let s=markers(pf)+`<defs><clipPath id="obclip"><rect x="0" y="0" width="760" height="250"/></clipPath></defs><g clip-path="url(#obclip)">`;
    if(ok){const th=r.theta,b=r.beta,end=ray(C,th,560);
      s+=`<path d="M0,${C[1]} L${fx(C[0])},${C[1]} L${fx(end[0])},${fx(end[1])} L760,${fx(end[1])} L760,250 L0,250 Z" style="fill:var(--soft)"/>`;
      s+=wall([[0,C[1]],C,end],1);
      s+=ln(C,[C[0]+175,C[1]],'mach',1.2,'stroke-dasharray="5 4"');
      s+=arc(C,74,0,th,'muted',1.2)+arc(C,128,0,b,'muted',1.2);
      s+=ln(C,ray(C,b,520),'comp',3);
      const mid=(th+b)/2,dd=Math.min(310,150/Math.max(0.2,Math.sin(mid))),P=ray(C,mid,dd),a2=[P[0]-36*Math.cos(th),P[1]+36*Math.sin(th)],b2=[P[0]+36*Math.cos(th),P[1]-36*Math.sin(th)];
      s+=arrow([36,150],[150,150],'ink',pf,2.2)+arrow(a2,b2,'ink',pf,2.2);
      s+=tx([36,134],`M₁ = ${f(r.M1,3)}`,'flab')+tx([b2[0]+8,b2[1]-4],`M₂ = ${f(r.M2,3)}`,'flab');
      const lb=ray(C,Math.max(b*0.62,th+0.08),144);
      s+=tx([C[0]+184,C[1]+5],`θ = ${f(th*R,1)}°`,'axlab')+tx([lb[0],lb[1]+5],`β = ${f(b*R,1)}°`,'axlab');}
    else s+=tx([380,125],'Enter two valid values to draw the shock.','axlab','text-anchor="middle"');
    $('ob_sch').innerHTML=s+'</g>';
    /* results */
    const known=k=>k!==kk;
    const rows=[
      ['M<sub>1</sub>',known('M')?'known':'(9.23), solved',ok?f(r.M1,4):'—','M'],
      ['θ',known('th')?'known':'(9.23)',deg(r.theta),'th'],
      ['β',known('b')?'known':`(9.23), ${ok&&r.beta>r.betamax?'strong':'weak'} solution`,deg(r.beta),'b'],
      ['μ = sin<sup>−1</sup>(1/M<sub>1</sub>)','Mach angle',ok?deg(Math.asin(1/r.M1)):'—'],
      ['M<sub>n,1</sub>','(9.13)',f(V(r.Mn1),4)],
      ['M<sub>n,2</sub>','(9.14)',f(V(r.Mn2),4)],
      ['M<sub>2</sub>','(9.18)',f(V(r.M2),4)],
      ['p<sub>2</sub>/p<sub>1</sub>','(9.16)',f(V(r.p21),4)],
      ['ρ<sub>2</sub>/ρ<sub>1</sub>','(9.15)',f(V(r.r21),4)],
      ['T<sub>2</sub>/T<sub>1</sub>','(9.17)',f(V(r.T21),4)],
      ['p<sub>0,2</sub>/p<sub>0,1</sub>','normal shock at M<sub>n,1</sub>',f(V(r.p0r),4)]];
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Value</th></tr></thead><tbody>`;
    rows.forEach(x=>{const hi=x[3]&&!known(x[3]);h+=`<tr><td class="l">${x[0]}</td><td class="rel">${x[1]}</td><td class="${hi?'hl':''}">${x[2]}</td></tr>`;});
    h+=`<tr><td class="l" colspan="3" style="padding-top:12px;color:var(--ink);font-weight:600">Limits for this M<sub>1</sub></td></tr>`;
    h+=`<tr><td class="l">θ<sub>max</sub></td><td class="rel">maximum of (9.23)</td><td>${ok?deg(r.thmax):'—'}</td></tr><tr><td class="l">β at θ<sub>max</sub></td><td class="rel">weak and strong branches meet</td><td>${ok?deg(r.betamax):'—'}</td></tr>`;
    $('ob_tab').innerHTML=h+'</tbody>';
    methods(r,ok,m);
    /* theta-beta curve for this M1 */
    let M1=ok?r.M1:NaN;if(!ok&&m!=='M'){const v=parseFloat(box.M.value);if(v>1&&v<=MMAX)M1=v;}
    if(!isFinite(M1)){$('ob_fig').innerHTML=tx([380,165],'Enter M₁ to draw the θ–β curve.','axlab','text-anchor="middle"');return;}
    const tm=thetaMax(M1,G)*R,bm=betaMax(M1,G),mu=Math.asin(1/M1),xmax=Math.max(10,Math.ceil((tm+3)/5)*5);
    const xt=[];for(let v=0;v<=xmax;v+=xmax>30?10:5)xt.push(v);
    const P={x0:58,y0:12,w:684,h:262};
    const Fr=frame({...P,xmin:0,xmax,ymin:0,ymax:90,xt,yt:[0,15,30,45,60,75,90],xlab:'Deflection angle θ (deg)',ylab:'Wave angle β (deg)',clip:'obc'});
    const pts=(b0,b1)=>{let d='';for(let i=0;i<=200;i++){const b=b0+(b1-b0)*i/200;d+=(i?'L':'M')+fx(Fr.X(thetaOf(M1,b,G)*R))+','+fx(Fr.Y(b*R));}return d;};
    let g=`<defs>${Fr.clipDef}</defs>`+Fr.svg+`<g clip-path="url(#obc)">`;
    g+=ln([Fr.X(tm),P.y0],[Fr.X(tm),P.y0+P.h],'mach',1.2,'stroke-dasharray="6 4"');
    g+=path(pts(mu,bm),'comp',2.2)+path(pts(bm,Math.PI/2),'comp',2.2,'stroke-dasharray="7 5"')+'</g>';
    g+=tx([Fr.X(tm)+6,P.y0+P.h-10],`θ<tspan dy="3" font-size="11">max</tspan><tspan dy="-3"> = ${f(tm,2)}°</tspan>`,'axlab')+tx([Fr.X(0)+6,Fr.Y(mu*R)-8],`μ = ${f(mu*R,2)}°`,'axlab');
    g+=tx([Fr.X(0)+6,Fr.Y(90)+16],`M₁ = ${f(M1,3)}`,'flab');
    if(ok&&r.theta*R<=xmax)g+=dot([Fr.X(r.theta*R),Fr.Y(r.beta*R)],'accent',6);
    $('ob_fig').innerHTML=g;
  }
})();

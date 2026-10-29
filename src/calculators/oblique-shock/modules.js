/* =====================================================================
   Oblique-shock calculator: any two of M1, theta, beta -> the third, then the
   normal-shock relations on Mn1 = M1 sin(beta). Uses thetaOf, betaMax, oblique and
   shockFromBeta (core.js), checked in tools/check-tables.js.
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

/* =====================================================================
   Interactive 1 · Corner explorer
   ===================================================================== */
(function(){
  const W=760,H=360,C=[330,268];
  const go=sched(render);
  const S=controls('cn_ctl',[
    {k:'M',id:'cn_M',label:'Upstream Mach, M<sub>1</sub>',min:1.1,max:5,step:0.01,v:2,nmin:1.01,nmax:30,aria:'Upstream Mach slider'},
    {k:'th',id:'cn_th',label:'Wall turning angle, θ',unit:'deg',min:-35,max:35,step:0.5,v:15,nmin:-80,nmax:60,dec:1,aria:'Turning angle slider'}],go);
  presets('cn_pre',[['Concave 15°',{M:2,th:15}],['Convex 15°',{M:2,th:-15}],['θ = 0',{M:2,th:0}],['Detached: M<sub>1</sub> 2, θ 25°',{M:2,th:25}],['M<sub>1</sub> 5, θ 20°',{M:5,th:20}]],S);
  renderers.push(go);
  function render(){
    const M=S.M, th=S.th*D, pf='cnm';
    let s=markers(pf)+`<defs>${clip('cnclip',W,H)}</defs><g clip-path="url(#cnclip)">`;
    let ban='', rows=[];
    if(!(M>1)){$('cn_ban').innerHTML=banner('bad','M₁ must be greater than 1.','Oblique waves exist only in supersonic flow.');return;}
    const wEnd=ray(C,th,560);
    const heights=[34,74,114,154,194];
    // reference + angle arcs
    s+=ln(C,[C[0]+230,C[1]],'mach',1,'stroke-dasharray="3 4"');
    if(Math.abs(th)>0.2*D){s+=arc(C,58,0,th,'accent',1.3)+tx(ray(C,th/2,72),'θ','flab','style="fill:var(--accent)" text-anchor="middle" dominant-baseline="middle"');}
    let w;
    if(th>1e-9){
      w=oblique(M,th,G);
      if(w.type==='shock'){
        s+=ln(C,ray(C,w.beta,520),'comp',2.6);
        s+=arc(C,104,0,w.beta,'comp',1.1)+tx(ray(C,w.beta*0.55,118),'β','flab','style="fill:var(--comp)" text-anchor="middle"');
        heights.forEach(h=>{const P=[C[0]+h/Math.tan(w.beta),C[1]-h];s+=pl([[0,C[1]-h],P,ray(P,th,700)],'stream',1.5);});
        s+=circ(ray(C,(th+w.beta)/2,250),'2');
        s+=tx(ray(C,w.beta,300),'oblique shock','axlab','style="fill:var(--comp)" dx="8"');
      } else {
        const S0=[C[0]-46,C[1]], E=ray(C,Math.asin(1/M),430);
        s+=`<path d="M${fx(S0[0])},${fx(S0[1])} C${fx(S0[0])},${fx(C[1]-110)} ${fx(S0[0]+70)},${fx(C[1]-190)} ${fx(E[0])},${fx(E[1])}" fill="none" style="stroke:var(--comp)" stroke-width="2.6"/>`;
        const bz=t=>{const u=1-t,c1=[S0[0],C[1]-110],c2=[S0[0]+70,C[1]-190];return [u*u*u*S0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*E[0],u*u*u*S0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*E[1]];};
        const bzx=y=>{let best=null;for(let i=0;i<=200;i++){const p=bz(i/200);if(!best||Math.abs(p[1]-y)<Math.abs(best[1]-y))best=p;}return best[0];};
        heights.forEach(h=>{const xs=bzx(C[1]-h),d=h*0.85*Math.cos(th),sp=(xs+190-C[0]+d*Math.sin(th))/Math.cos(th),Q=[C[0]+sp*Math.cos(th)-d*Math.sin(th),C[1]-sp*Math.sin(th)-d*Math.cos(th)];
          s+=`<path d="M0,${fx(C[1]-h)} L${fx(xs)},${fx(C[1]-h)} Q${fx(xs+90)},${fx(C[1]-h)} ${fx(Q[0])},${fx(Q[1])} L${fx(Q[0]+700*Math.cos(th))},${fx(Q[1]-700*Math.sin(th))}" fill="none" style="stroke:var(--stream)" stroke-width="1.5"/>`;});
        s+=tx([S0[0]-150,C[1]-58],'detached bow shock','axlab','style="fill:var(--comp)"');
        s+=tx([C[0]+60,C[1]-40],'subsonic pocket','axlab');
        ban=banner('bad',`Shock detached: θ = ${f(S.th,1)}° exceeds θ<sub>max</sub> = ${dg(w.thmax)} for M<sub>1</sub> = ${f(M,2)}.`,'No straight oblique shock can turn the flow this far. Nature places a curved shock ahead of the corner, with subsonic flow behind its near-normal part. The sketch is schematic.');
      }
    } else if(th<-1e-9){
      w=pm(M,-th,G);
      if(w.type==='exp'){
        const l1=w.mu1, l2=w.mu2+th;
        for(let k=0;k<7;k++){const a=l1+(l2-l1)*k/6;s+=ln(C,ray(C,a,520),'exp',k===0||k===6?1.8:0.9);}
        s+=arc(C,96,0,l1,'exp',1.1)+tx(ray(C,l1*0.5,112),'μ<tspan font-size="10" dy="3">1</tspan>','flab','style="fill:var(--exp)" text-anchor="middle"');
        heights.forEach(h=>{const p=fanStream(C,M,-th,h,G,W+50);if(p)s+=pl(p,'stream',1.5);});
        s+=circ(ray(C,(l2+th)/2,250),'2');
        s+=tx(ray(C,l1,330),'forward Mach line','axlab','style="fill:var(--exp)" dx="6"');
      } else ban=banner('bad','Expansion limit reached.',`ν(M<sub>2</sub>) would exceed ν<sub>max</sub> = ${dg(numax(G))}: the flow reaches vacuum before turning this far.`);
    } else {
      w=turn(M,0,G);
      s+=ln(C,ray(C,w.mu1,520),'mach',1.4,'stroke-dasharray="7 5"');
      heights.forEach(h=>{s+=ln([0,C[1]-h],[W,C[1]-h],'stream',1.5);});
      s+=circ([C[0]+300,C[1]-60],'2');
      s+=tx(ray(C,w.mu1,330),'Mach wave, μ = '+dg(w.mu1,1),'axlab','dx="6"');
    }
    s+=wall([[0,C[1]],C,wEnd],1);
    s+=tx([C[0]-8,C[1]+24],'A','flab');
    s+=circ([200,C[1]-174],'1');
    s+=`<g>${arrow([22,40],[92,40],'muted',pf)}${tx([100,45],'M<tspan font-size="10" dy="3">1</tspan><tspan dy="-3"> = '+f(M,2)+'</tspan>','axlab','style="font-family:var(--f-num)"')}</g>`;
    s+='</g>';
    $('cn_fig').innerHTML=s; $('cn_ban').innerHTML=ban;
    if(w&&valid(w)){
      const kind=w.type==='shock'?'<span class="chip shock">oblique shock</span>':w.type==='exp'?'<span class="chip exp">expansion fan</span>':'<span class="chip none">Mach wave</span>';
      rows.push(['Wave',kind]);
      if(w.type==='shock'){rows.push(['Shock angle β (weak)',dg(w.beta)]);rows.push(['θ<sub>max</sub> at this M<sub>1</sub>',dg(w.thmax)]);}
      if(w.type==='exp'){rows.push(['Fan edges μ<sub>1</sub>, μ<sub>2</sub> − |θ|',`${dg(w.mu1)}, ${dg(w.mu2+th)}`]);}
      rows.push(['M<sub>2</sub>',w.type==='none'?f(M,4):(w.M2>M?`${f(w.M2,4)} <span class="up">↑</span>`:`${f(w.M2,4)} <span class="dn">↓</span>`),'hl']);
      rows.push(['p<sub>2</sub>/p<sub>1</sub>',trend(w.p21)]);
      rows.push(['ρ<sub>2</sub>/ρ<sub>1</sub>',trend(w.r21)]);
      rows.push(['T<sub>2</sub>/T<sub>1</sub>',trend(w.T21)]);
      rows.push(['p<sub>0,2</sub>/p<sub>0,1</sub>',w.type==='shock'?`${f(w.p0r,4)} <em class="muted">entropy rises</em>`:'1 <em class="muted">isentropic</em>']);
    } else if(w&&w.type==='detached'){rows.push(['Wave','<span class="chip shock">detached shock</span>']);rows.push(['θ<sub>max</sub> at this M<sub>1</sub>',dg(w.thmax)]);}
    $('cn_out').innerHTML=readout(rows);
  }
})();

/* =====================================================================
   Interactive 2 · The beeper (Mach waves)
   ===================================================================== */
(function(){
  const W=760,H=330,yc=165,x0=715,a=72,Tp=0.24;
  let t=reduceMotion?2.2:0, playing=!reduceMotion, last=null, visible=true;
  const go=sched(draw);
  const S=controls('mw_ctl',[{k:'M',id:'mw_M',label:'Source Mach number, M = V/a',min:0.3,max:4,step:0.01,v:2,nmin:0.1,nmax:6,aria:'Source Mach slider'}],()=>{if(x0-S.M*a*t<20)t=0;go();});
  $('mw_play').textContent=playing?'Pause':'Play';
  $('mw_play').onclick=()=>{playing=!playing;$('mw_play').textContent=playing?'Pause':'Play';last=null;if(playing)requestAnimationFrame(loop);};
  $('mw_restart').onclick=()=>{t=0;last=null;go();};
  $('mw_geo').onchange=go;
  function loop(ts){
    if(!playing) return;
    if(visible){
      if(last!==null){t+=Math.min(0.05,(ts-last)/1000);}
      last=ts;
      if(x0-S.M*a*t<16||t>14) t=0;
      draw();
    } else last=null;
    requestAnimationFrame(loop);
  }
  if('IntersectionObserver' in window){new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:0}).observe($('mw_fig'));}
  function draw(){
    const M=S.M, V=M*a, B=[x0-V*t,yc], pf='mwm';
    let s=markers(pf)+`<defs>${clip('mwclip',W,H)}</defs><g clip-path="url(#mwclip)">`;
    s+=ln([0,yc],[W,yc],'line',1,'stroke-dasharray="2 4"');
    const n=Math.floor(t/Tp);
    for(let k=Math.max(0,n-90);k<=n;k++){const tk=k*Tp,c=x0-V*tk,r=a*(t-tk);if(r>0.5)s+=`<circle cx="${fx(c)}" cy="${yc}" r="${fx(r)}" fill="none" style="stroke:var(--mach)" stroke-width="1" opacity="${k===0&&$('mw_geo').checked?1:0.75}"/>`;}
    const mu=M>1?Math.asin(1/M):NaN;
    if(M>1){const L=Math.max(60,V*t*Math.cos(mu)+40);s+=ln(B,ray(B,mu,L),'comp',2.2)+ln(B,ray(B,-mu,L),'comp',2.2);}
    if($('mw_geo').checked&&t>0.3){
      const A=[x0,yc], r=a*t;
      s+=ln(B,A,'accent',1.6)+tx([(A[0]+B[0])/2,yc+20],'Vt','flab','text-anchor="middle" style="fill:var(--accent)"');
      s+=`<circle cx="${fx(A[0])}" cy="${yc}" r="3" style="fill:var(--ink)"/>`+tx([A[0]+6,yc+16],'A','flab');
      if(M>1){
        const Cp=ray(B,mu,V*t*Math.cos(mu));
        s+=ln(A,Cp,'comp',1.6)+tx([(A[0]+Cp[0])/2+8,(A[1]+Cp[1])/2],'at','flab','style="fill:var(--comp)"');
        const u=dirv(mu),v=[A[0]-Cp[0],A[1]-Cp[1]],vl=Math.hypot(v[0],v[1]),vn=[v[0]/vl,v[1]/vl],q=10;
        s+=pl([add(Cp,[-u[0]*q,-u[1]*q]),add(add(Cp,[-u[0]*q,-u[1]*q]),[vn[0]*q,vn[1]*q]),add(Cp,[vn[0]*q,vn[1]*q])],'ink',1);
        s+=`<circle cx="${fx(Cp[0])}" cy="${fx(Cp[1])}" r="3" style="fill:var(--ink)"/>`+tx([Cp[0]-4,Cp[1]-10],'C','flab');
        s+=arc(B,70,0,mu,'ink',1.2)+tx(ray(B,mu/2,84),'μ','flab','text-anchor="middle" dominant-baseline="middle"');
      } else {
        s+=ln(A,[A[0],yc-r],'comp',1.6)+tx([A[0]+6,yc-r/2],'at','flab','style="fill:var(--comp)"');
      }
    }
    s+=`<circle cx="${fx(B[0])}" cy="${yc}" r="6" style="fill:var(--accent)"/>`+tx([B[0]-6,yc-12],'B','flab','text-anchor="end"');
    s+=arrow([B[0]-14,yc+30],[B[0]-64,yc+30],'accent',pf,1.6);
    s+='</g>';
    $('mw_fig').innerHTML=s;
    $('mw_state').textContent=M<1?'Subsonic: the source stays inside its waves.':M===1?'Sonic':'Supersonic: the waves pile up on the Mach cone.';
    $('mw_out').innerHTML=readout([['V/a',f(M,2)],['sin μ = at/Vt = 1/M',M>1?f(1/M,4):'— (M < 1)'],['Mach angle μ',M>1?dg(mu):'none','hl']]);
  }
  renderers.push(go);
  draw(); if(playing) requestAnimationFrame(loop);
})();

/* Example 9.1 · sonic boom */
(function(){
  const go=sched(render);
  ['sb_M','sb_z'].forEach(id=>$(id).addEventListener('input',go));
  function render(){
    const M=parseFloat($('sb_M').value), z=parseFloat($('sb_z').value), pf='sbm';
    if(!(M>1)||!(z>0)){$('sb_out').innerHTML=readout([['Input','M must exceed 1 and z must be positive']]);return;}
    const mu=Math.asin(1/M), d=z/Math.tan(mu);
    let zp=140, dp=zp/Math.tan(mu); if(dp>370){const k=370/dp;dp*=k;zp*=k;}
    const g=168, P=[36,g-zp], By=[36+dp,g];
    let s=markers(pf);
    s+=wall([[8,g],[432,g]],1);
    s+=ln(P,By,'comp',2.2)+ln([P[0],P[1]],[P[0],g],'mach',1,'stroke-dasharray="4 4"');
    s+=`<path d="M${fx(P[0]-10)},${fx(P[1]+4)} L${fx(P[0]+18)},${fx(P[1])} L${fx(P[0]-10)},${fx(P[1]-4)} Z" style="fill:var(--ink)"/>`;
    s+=arrow([P[0]-14,P[1]-14],[P[0]-34,P[1]-14],'ink',pf,1.4);
    s+=`<circle cx="${fx(By[0])}" cy="${fx(g-16)}" r="4" fill="none" style="stroke:var(--ink)" stroke-width="1.4"/>`+ln([By[0],g-12],[By[0],g-2],'ink',1.4);
    s+=arc(By,40,Math.PI,Math.PI-mu,'ink',1.2)+tx(ray(By,Math.PI-mu/2,54),'μ','flab','text-anchor="middle" dominant-baseline="middle"');
    s+=arrow([(P[0]+By[0])/2,g+12],[P[0],g+12],'accent',pf,1.2)+arrow([(P[0]+By[0])/2,g+12],[By[0],g+12],'accent',pf,1.2);
    s+=tx([P[0]+6,(P[1]+g)/2],'z','flab','style="fill:var(--accent)"');
    s+=tx([(P[0]+By[0])/2,g+32],'d','flab','text-anchor="middle" style="fill:var(--accent)"');
    $('sb_fig').innerHTML=s;
    const isDef=Math.abs(M-2)<1e-9&&Math.abs(z-16)<1e-9&&Math.abs(G-1.4)<1e-9;
    $('sb_out').innerHTML=readout([
      ['μ = sin<sup>−1</sup>(1/M)',dg(mu)+(isDef?' <em class="muted handi">tables: 30°</em>':'')],
      ['tan μ = z/d',f(Math.tan(mu),4)],
      ['d = z / tan μ',`${f(d,2)} km`+(isDef?' <em class="muted handi">tables: 27.71 km</em>':''),'hl']]);
  }
  renderers.push(go); render();
})();

/* =====================================================================
   Interactive 3 · Velocity components across the shock
   ===================================================================== */
(function(){
  const W=760,H=380,O=[392,200],K=250;
  let mode='theta';
  const go=sched(render);
  const S=controls('vc_ctl',[
    {k:'M',id:'vc_M',label:'Upstream Mach, M<sub>1</sub>',min:1.2,max:6,step:0.01,v:2,nmin:1.01,nmax:20,aria:'Mach slider'},
    {k:'th',id:'vc_th',label:'Wall (deflection) angle, θ',unit:'deg',min:0,max:40,step:0.1,v:20,nmin:0,nmax:45,dec:2,aria:'Deflection slider'},
    {k:'b',id:'vc_b',label:'Shock angle, β',unit:'deg',min:20,max:90,step:0.1,v:53.42,nmin:1,nmax:90,dec:2,aria:'Shock angle slider'}],()=>{if(mode==='beta')S.range('b',(Math.asin(1/S.M)*R+0.01).toFixed(2),90);go();});
  function setMode(m){
    mode=m;$('vc_mt').setAttribute('aria-pressed',m==='theta');$('vc_mb').setAttribute('aria-pressed',m==='beta');
    $('vc_th_box').hidden=m!=='theta';$('vc_b_box').hidden=m!=='beta';
    $('vc_note').innerHTML=m==='theta'
      ?'A given wedge fixes θ. Raise M<sub>1</sub> and watch the shock lean over: β falls, yet the normal component M<sub>n,1</sub> = M<sub>1</sub> sin β grows, so the shock gets stronger and u<sub>2</sub> shrinks further relative to u<sub>1</sub>. The tangential component w never changes.'
      :'Sweep β from the Mach angle μ<sub>1</sub> (θ = 0, a Mach wave) to 90° (θ = 0, a normal shock). In between the flow is deflected, and θ peaks at θ<sub>max</sub>.';
    if(m==='beta'){S.range('b',(Math.asin(1/S.M)*R+0.01).toFixed(2),90);}
    go();}
  $('vc_mt').onclick=()=>{if(mode==='theta')return;const s=shockFromBeta(S.M,Math.max(S.b*D,Math.asin(1/S.M)+1e-6),G);S.th=Math.max(0,s.theta*R);if(S.b*D>betaMax(S.M,G))S.th=Math.max(0,s.theta*R);S.set({th:+S.th.toFixed(2)});setMode('theta');};
  $('vc_mb').onclick=()=>{if(mode==='beta')return;const w=oblique(S.M,S.th*D,G);if(w.type==='shock')S.set({b:+(w.beta*R).toFixed(2)});setMode('beta');};
  presets('vc_pre',[['θ 20°: M<sub>1</sub> 2',{M:2,th:20}],['θ 20°: M<sub>1</sub> 5',{M:5,th:20}],['θ 10°: M<sub>1</sub> 3',{M:3,th:10}]],S,()=>{if(mode!=='theta')setMode('theta');});
  renderers.push(go);
  function render(){
    const M=S.M, mu=Math.asin(1/M), pf='vcm';
    let b, sh, ban='';
    if(mode==='theta'){
      const w=oblique(M,S.th*D,G);
      if(w.type!=='shock'){
        $('vc_ban').innerHTML=banner('bad',`No attached shock: θ = ${f(S.th,2)}° exceeds θ<sub>max</sub> = ${dg(w.thmax)} at M<sub>1</sub> = ${f(M,2)}.`,'Raise M₁ or reduce θ. The shock detaches and the velocity triangle no longer applies.');
        $('vc_fig').innerHTML='';$('vc_out').innerHTML='';return;}
      b=w.beta; sh=w;
    } else {
      b=Math.min(Math.max(S.b*D,mu+1e-6),Math.PI/2); sh=shockFromBeta(M,b,G);
    }
    $('vc_ban').innerHTML=ban;
    const th=sh.theta, t=[Math.cos(b),Math.sin(b)], n=[Math.sin(b),-Math.cos(b)];
    const P=v=>[O[0]+v[0],O[1]-v[1]];
    // fractions of V1 (drawn length K); u2 = u1·ρ1/ρ2, w2 = w1
    const w=Math.cos(b), u1=Math.sin(b), u2=u1/sh.r21, V2=Math.hypot(w,u2);
    const T1=[-K,0], P1=[T1[0]+w*K*t[0],T1[1]+w*K*t[1]];
    const P2=[w*K*t[0],w*K*t[1]], E2=[P2[0]+u2*K*n[0],P2[1]+u2*K*n[1]];
    let s=markers(pf)+`<defs>${clip('vcclip',W,H)}</defs><g clip-path="url(#vcclip)">`;
    s+=ln(P([-420*t[0],-420*t[1]]),P([420*t[0],420*t[1]]),'comp',5,'opacity=".25"')+ln(P([-420*t[0],-420*t[1]]),P([420*t[0],420*t[1]]),'comp',1.6);
    s+=ln(O,[O[0]+330,O[1]],'mach',1,'stroke-dasharray="3 4"');
    s+=arc(O,58,0,b,'comp',1.2)+tx(ray(O,b/2,72),'β','flab','text-anchor="middle" dominant-baseline="middle" style="fill:var(--comp)"');
    if(th>0.3*D) s+=arc(O,150,0,th,'ink',1.2)+tx(ray(O,th/2,164),'θ','flab','dominant-baseline="middle"');
    s+=arrow(P(T1),P(P1),'accent',pf,2.2)+arrow(P(P1),O,'exp',pf,2.4);
    s+=arrow(P(T1),O,'ink',pf,2.8);
    s+=arrow(O,P(P2),'accent',pf,2.2)+arrow(P(P2),P(E2),'exp',pf,2.4);
    s+=arrow(O,P(E2),'ink',pf,2.8);
    const rt=(c,a,bv)=>{const q=9;return pl([[c[0]+a[0]*q,c[1]-a[1]*q],[c[0]+a[0]*q+bv[0]*q,c[1]-a[1]*q-bv[1]*q],[c[0]+bv[0]*q,c[1]-bv[1]*q]],'ink',1);};
    s+=rt(P(P1),[-t[0],-t[1]],n)+rt(P(P2),[-t[0],-t[1]],n);
    const mid=(a,c)=>[(a[0]+c[0])/2,(a[1]+c[1])/2], sub=x=>`<tspan font-size="10" dy="3">${x}</tspan><tspan dy="-3">`;
    s+=tx(add(P(mid(T1,P1)),[-12,-8]),`w${sub(1)} = ${f(w,2)} V</tspan>${sub(1)}</tspan>`,'flab','text-anchor="end" style="fill:var(--accent)"');
    s+=tx(add(P(mid(P1,[0,0])),[-8,18]),`u${sub(1)} = ${f(u1,2)} V</tspan>${sub(1)}</tspan>`,'flab','text-anchor="end" style="fill:var(--exp)"');
    s+=tx(add(P(P2),[-12,-6]),`w${sub(2)} = w</tspan>${sub(1)}</tspan>`,'flab','text-anchor="end" style="fill:var(--accent)"');
    s+=tx(add(P(mid(P2,E2)),[10,2]),`u${sub(2)} = ${f(u2/u1,2)} u</tspan>${sub(1)}</tspan>`,'flab','style="fill:var(--exp)"');
    s+=tx(add(P(mid(T1,[0,0])),[0,24]),`V${sub(1)}, M</tspan>${sub(1)} = ${f(M,2)}</tspan>`,'flab','text-anchor="middle"');
    s+=tx(add(P(E2),[10,16]),`V${sub(2)} = ${f(V2,2)} V</tspan>${sub(1)}, M</tspan>${sub(2)} = ${f(sh.M2,2)}</tspan>`,'flab');
    s+=tx(add(P([300*t[0],300*t[1]]),[10,0]),'oblique shock','axlab','style="fill:var(--comp)"');
    s+='</g>';
    $('vc_fig').innerHTML=s;
    const bm=betaMax(M,G);
    $('vc_out').innerHTML=readout([
      [mode==='theta'?'Shock angle β (weak solution of 9.23)':'Deflection θ from (9.23)',mode==='theta'?dg(b):dg(th),'hl'],
      ['Branch',Math.abs(b-Math.PI/2)<1e-6?'normal shock (θ = 0)':b<bm?'weak (β &lt; β<sub>max</sub> = '+dg(bm)+')':'strong (β &gt; β<sub>max</sub> = '+dg(bm)+')'],
      ['M<sub>n,1</sub> = M<sub>1</sub> sin β = u<sub>1</sub>/a<sub>1</sub>',f(sh.Mn1,4),'hl'],
      ['w<sub>2</sub>/w<sub>1</sub>','1 <em class="muted">tangential momentum</em>'],
      ['u<sub>2</sub>/u<sub>1</sub> = ρ<sub>1</sub>/ρ<sub>2</sub>',f(1/sh.r21,4)],
      ['M<sub>n,2</sub>',f(sh.Mn2,4)],
      ['M<sub>2</sub> = M<sub>n,2</sub>/sin(β − θ)',f(sh.M2,4)],
      ['p<sub>2</sub>/p<sub>1</sub>',f(sh.p21,4)],
      ['T<sub>2</sub>/T<sub>1</sub>',f(sh.T21,4)]]);
  }
  setMode('theta');
})();

/* =====================================================================
   Interactive 4 · θ–β–M diagram
   ===================================================================== */
(function(){
  const W=760,H=460,m={l:58,r:22,t:16,b:50},pw=W-m.l-m.r,ph=H-m.t-m.b,TH=50;
  const X=th=>m.l+th/TH*pw, Y=b=>m.t+(90-b)/90*ph;
  const go=sched(render);
  const S=controls('tb_ctl',[
    {k:'M',id:'tb_M',label:'Upstream Mach, M<sub>1</sub>',min:1.05,max:10,step:0.01,v:2,nmin:1.01,nmax:100,aria:'Mach slider'},
    {k:'th',id:'tb_th',label:'Deflection angle, θ',unit:'deg',min:0,max:46,step:0.1,v:20,nmin:0,nmax:60,dec:2,aria:'Deflection slider'}],go);
  presets('tb_pre',[
    ['1 · θ &gt; θ<sub>max</sub>: M<sub>1</sub> = 2, θ = 25°',{M:2,th:25}],
    ['2 · Two solutions: M<sub>1</sub> = 2, θ = 15°',{M:2,th:15}],
    ['3 · θ = 0: Mach wave or normal shock',{M:2,th:0}],
    ['4a · M<sub>1</sub> = 2, θ = 20°',{M:2,th:20}],
    ['4b · M<sub>1</sub> = 5, θ = 20° (stronger)',{M:5,th:20}],
    ['5a · M<sub>1</sub> = 2, θ = 10°',{M:2,th:10}],
    ['5b · M<sub>1</sub> = 2, θ = 20° (stronger)',{M:2,th:20}]],S);
  renderers.push(go);
  let bg=null,bgG=null;
  function background(){
    let s='';
    for(let th=0;th<=TH;th+=5){s+=`<line x1="${fx(X(th))}" x2="${fx(X(th))}" y1="${m.t}" y2="${H-m.b}" class="gridl"/><text x="${fx(X(th))}" y="${H-m.b+18}" text-anchor="middle" class="tick">${th}</text>`;}
    for(let b=0;b<=90;b+=10){s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(b))}" y2="${fx(Y(b))}" class="gridl"/><text x="${m.l-8}" y="${fx(Y(b)+4)}" text-anchor="end" class="tick">${b}</text>`;}
    s+=`<line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${H-m.b}" class="axis"/><line x1="${m.l}" x2="${W-m.r}" y1="${H-m.b}" y2="${H-m.b}" class="axis"/>`;
    s+=`<text x="${m.l+pw/2}" y="${H-10}" text-anchor="middle" class="axlab">deflection angle θ (deg)</text><text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">shock wave angle β (deg)</text>`;
    [1.2,1.5,2,2.5,3,4,6,10,1e4].forEach(M=>{s+=curve(M,'mach',1.1);const bm=betaMax(M,G),tm=thetaOf(M,bm,G);s+=`<text x="${fx(X(tm*R)+4)}" y="${fx(Y(bm*R)-5)}" class="tick">${M>1e3?'∞':M}</text>`;});
    let d1='',d2='';
    for(let i=0;i<=220;i++){const M=1.0005*Math.pow(1e4/1.0005,i/220),bm=betaMax(M,G),tm=thetaOf(M,bm,G);d1+=(i?'L':'M')+fx(X(tm*R))+','+fx(Y(bm*R));
      const bs=betaSonic(M,G),ts=thetaOf(M,bs,G);d2+=(i?'L':'M')+fx(X(ts*R))+','+fx(Y(bs*R));}
    s+=`<path d="${d1}" fill="none" style="stroke:var(--comp)" stroke-width="1.4" stroke-dasharray="7 5"/><path d="${d2}" fill="none" style="stroke:var(--exp)" stroke-width="1.6" stroke-dasharray="2 3"/>`;
    s+=`<text x="${fx(X(36))}" y="${fx(Y(86))}" class="axlab">strong shocks, M<tspan font-size="9" dy="3">2</tspan><tspan dy="-3"> &lt; 1</tspan></text><text x="${fx(X(31))}" y="${fx(Y(12))}" class="axlab">weak shocks, M<tspan font-size="9" dy="3">2</tspan><tspan dy="-3"> &gt; 1</tspan></text>`;
    return s;}
  function curve(M,c,w){let d='';const mu=Math.asin(1/M);for(let i=0;i<=240;i++){const b=mu+(Math.PI/2-mu)*i/240;const t=thetaOf(M,b,G);d+=(i?'L':'M')+fx(X(Math.max(0,t)*R))+','+fx(Y(b*R));}return `<path d="${d}" fill="none" style="stroke:${col(c)}" stroke-width="${w}"/>`;}
  function render(){
    if(bgG!==G){bg=background();bgG=G;}
    const M=S.M, th=S.th*D;
    let s=bg+curve(M,'accent',2.6);
    const tm=thetaMax(M,G), bm=betaMax(M,G);
    s+=`<line x1="${fx(X(S.th))}" x2="${fx(X(S.th))}" y1="${m.t}" y2="${H-m.b}" style="stroke:var(--accent)" stroke-width="1" stroke-dasharray="4 4"/>`;
    const wk=oblique(M,th,G,false), st=oblique(M,th,G,true);
    let ban='';
    if(!(M>1)) ban=banner('bad','M₁ must be greater than 1.');
    else if(wk.type==='detached'){
      s+=`<circle cx="${fx(X(tm*R))}" cy="${fx(Y(bm*R))}" r="6" style="fill:var(--comp)"/>`;
      ban=banner('bad',`No attached shock: θ = ${f(S.th,2)}° exceeds θ<sub>max</sub> = ${dg(tm)} at M<sub>1</sub> = ${f(M,2)}.`,'The vertical line misses the curve. The shock detaches and stands off the corner or nose as a curved bow shock.');
    } else {
      s+=`<circle cx="${fx(X(S.th))}" cy="${fx(Y(st.beta*R))}" r="6" style="fill:var(--panel);stroke:var(--accent)" stroke-width="2.2"/>`;
      s+=`<circle cx="${fx(X(S.th))}" cy="${fx(Y(wk.beta*R))}" r="6" style="fill:var(--accent);stroke:var(--panel)" stroke-width="2"/>`;
      s+=`<text x="${fx(X(S.th)+10)}" y="${fx(Y(wk.beta*R)+16)}" class="tick" style="fill:var(--ink)">weak β = ${f(wk.beta*R,2)}°</text><text x="${fx(X(S.th)+10)}" y="${fx(Y(st.beta*R)-8)}" class="tick" style="fill:var(--ink)">strong β = ${f(st.beta*R,2)}°</text>`;
      if(wk.M2<1) ban=banner('warn','Weak shock with subsonic M₂.',`θ lies between the M<sub>2</sub> = 1 line and θ<sub>max</sub>: even the weak solution leaves M<sub>2</sub> = ${f(wk.M2,3)}.`);
    }
    $('tb_fig').innerHTML=s; $('tb_ban').innerHTML=ban;
    const ok=wk.type==='shock';
    const row=(lab,a,b,d=4)=>`<tr><td class="l">${lab}</td><td${ok?' class="hl"':''}>${ok?a:'—'}</td><td>${ok?b:'—'}</td></tr>`;
    $('tb_tab').innerHTML=`<thead><tr><th class="l">M<sub>1</sub> = ${f(M,3)}, θ = ${f(S.th,2)}°</th><th>Weak solution</th><th>Strong solution</th></tr></thead><tbody>`+
      row('Shock angle β',ok?dg(wk.beta):'',ok?dg(st.beta):'')+
      row('M<sub>n,1</sub> = M<sub>1</sub> sin β',ok?f(wk.Mn1):'',ok?f(st.Mn1):'')+
      row('M<sub>2</sub>',ok?f(wk.M2):'',ok?f(st.M2):'')+
      row('p<sub>2</sub>/p<sub>1</sub>',ok?f(wk.p21):'',ok?f(st.p21):'')+
      row('ρ<sub>2</sub>/ρ<sub>1</sub>',ok?f(wk.r21):'',ok?f(st.r21):'')+
      row('T<sub>2</sub>/T<sub>1</sub>',ok?f(wk.T21):'',ok?f(st.T21):'')+
      row('p<sub>0,2</sub>/p<sub>0,1</sub>',ok?f(wk.p0r):'',ok?f(st.p0r):'')+'</tbody>';
    $('tb_obs').innerHTML=`For M<sub>1</sub> = ${f(M,3)}: θ<sub>max</sub> = ${dg(tm)} at β = ${dg(bm)}; Mach angle μ<sub>1</sub> = ${dg(Math.asin(1/M))}; M<sub>2</sub> = 1 at β = ${dg(betaSonic(M,G))}.`;
  }
  // click / drag on chart to set θ
  const svg=$('tb_fig'); let drag=false;
  const setFrom=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const p=pt.matrixTransform(ctm.inverse());const th=Math.round(Math.min(TH,Math.max(0,(p.x-m.l)/pw*TH))*10)/10;S.set({th});};
  svg.addEventListener('pointerdown',e=>{drag=true;try{svg.setPointerCapture(e.pointerId);}catch(_){}setFrom(e);});
  svg.addEventListener('pointermove',e=>{if(drag)setFrom(e);});
  ['pointerup','pointercancel'].forEach(ev=>svg.addEventListener(ev,()=>{drag=false;}));
})();


/* =====================================================================
   Worked examples 9.2–9.5
   ===================================================================== */
(function(){
  const tabs=document.querySelectorAll('#ex_tabs button');
  tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));document.querySelectorAll('[data-expanel]').forEach(p=>p.hidden=p.dataset.expanel!==b.dataset.ex);});
  const num=id=>parseFloat($(id).value), near=(a,b)=>Math.abs(a-b)<1e-9;
  function table(id,rows,def){
    def=def&&Math.abs(G-1.4)<1e-9;  // the notes are hand solutions for gamma = 1.4
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Result</th><th class="hand">Tables, γ = 1.4</th></tr></thead><tbody>`;
    rows.forEach(r=>{if(r.sect){h+=`<tr><td class="l" colspan="4" style="padding-top:14px;color:var(--ink);font-weight:600">${r.sect}</td></tr>`;return;}
      h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[1]}</td><td class="${r[4]?'hl':''}">${r[2]}</td>${handCell(def&&r[3]!=null?r[3]:'—',def&&r[5])}</tr>`;});
    $(id).innerHTML=h+'</tbody>';}
  function e2(){
    const M=num('e2_M'),p1=num('e2_p'),T1=num('e2_T'),thd=num('e2_th'),th=thd*D;
    const def=near(M,2)&&near(p1,1)&&near(T1,288)&&near(thd,20);
    if(!(M>1)||!(p1>0)||!(T1>0)||!(thd>=0)){$('e2_ban').innerHTML=banner('bad','Check the inputs.','M₁ must exceed 1; p₁, T₁ must be positive; θ ≥ 0.');$('e2_tab').innerHTML='';return;}
    const w=oblique(M,th,G);
    if(w.type!=='shock'){$('e2_ban').innerHTML=banner('bad',`Shock detached: θ exceeds θ<sub>max</sub> = ${dg(w.thmax)} for M<sub>1</sub> = ${f(M,3)}.`,'No straight oblique shock exists.');$('e2_tab').innerHTML='';return;}
    $('e2_ban').innerHTML='';
    const p01=p0p(M,G),T01=T0T(M,G);
    table('e2_tab',[
      ['Shock angle β','θ–β–M (9.23), weak solution',dg(w.beta),'53.4°'],
      ['M<sub>n,1</sub>','M<sub>1</sub> sin β (9.13)',f(w.Mn1),'1.606'],
      ['p<sub>2</sub>/p<sub>1</sub>','(9.16); App. B at M<sub>n,1</sub>',f(w.p21),'2.82'],
      ['T<sub>2</sub>/T<sub>1</sub>','(9.17)',f(w.T21),'1.388'],
      ['M<sub>n,2</sub>','(9.14)',f(w.Mn2),'0.6684'],
      ['p<sub>0,2</sub>/p<sub>0,1</sub>','normal shock at M<sub>n,1</sub>',f(w.p0r),'0.8952'],
      ['M<sub>2</sub>','M<sub>n,2</sub>/sin(β − θ) (9.18)',f(w.M2),'1.21',1],
      ['p<sub>2</sub> (atm)','(p<sub>2</sub>/p<sub>1</sub>) p<sub>1</sub>',f(w.p21*p1,3),'2.82',1],
      ['T<sub>2</sub> (K)','(T<sub>2</sub>/T<sub>1</sub>) T<sub>1</sub>',f(w.T21*T1,1),'399.7',1],
      ['p<sub>0,1</sub>/p<sub>1</sub>','isentropic, App. A at M<sub>1</sub>',f(p01),'7.824'],
      ['p<sub>0,2</sub> (atm)','(p<sub>0,2</sub>/p<sub>0,1</sub>)(p<sub>0,1</sub>/p<sub>1</sub>) p<sub>1</sub>',f(w.p0r*p01*p1,3),'7',1],
      ['T<sub>0,2</sub> = T<sub>0,1</sub> (K)','(T<sub>0,1</sub>/T<sub>1</sub>) T<sub>1</sub>; T<sub>0</sub> constant',f(T01*T1,1),'518.4',1]],def);
  }
  function e3(){
    const bd=num('e3_b'),b=bd*D,M=num('e3_M'),def=near(M,2.4)&&near(bd,30);
    if(!(M>1)){$('e3_ban').innerHTML=banner('bad','M₁ must exceed 1.');$('e3_tab').innerHTML='';return;}
    const mu=Math.asin(1/M);
    if(!(b>mu&&b<=Math.PI/2)){$('e3_ban').innerHTML=banner('bad',`β must lie between the Mach angle μ<sub>1</sub> = ${dg(mu)} and 90°.`);$('e3_tab').innerHTML='';return;}
    const s=shockFromBeta(M,b,G);
    $('e3_ban').innerHTML=b>betaMax(M,G)?banner('warn','This β lies on the strong branch.',`β exceeds β<sub>max</sub> = ${dg(betaMax(M,G))}; M<sub>2</sub> is subsonic.`):'';
    table('e3_tab',[
      ['Deflection θ','θ–β–M (9.23)',dg(s.theta),'6.5°',1,1],
      ['M<sub>n,1</sub>','M<sub>1</sub> sin β',f(s.Mn1),'1.2'],
      ['p<sub>2</sub>/p<sub>1</sub>','(9.16); App. B',f(s.p21),'1.513',1],
      ['T<sub>2</sub>/T<sub>1</sub>','(9.17); App. B',f(s.T21),'1.128',1],
      ['M<sub>n,2</sub>','(9.14); App. B',f(s.Mn2),'0.8422'],
      ['M<sub>2</sub>','M<sub>n,2</sub>/sin(β − θ)',f(s.M2),'2.11',1,1]],def);
  }
  function e4(){
    const bd=num('e4_b'),b=bd*D,pr=num('e4_p'),def=near(bd,35)&&near(pr,3);
    if(!(pr>1)||!(b>0&&b<=Math.PI/2)){$('e4_ban').innerHTML=banner('bad','Need p₂/p₁ > 1 and 0 < β ≤ 90°.');$('e4_tab').innerHTML='';return;}
    $('e4_ban').innerHTML='';
    const Mn=Math.sqrt(1+(G+1)/(2*G)*(pr-1)),M=Mn/Math.sin(b),s=shockFromBeta(M,b,G);
    table('e4_tab',[
      ['M<sub>n,1</sub>','invert (9.16); App. B',f(Mn),'1.65 <em class="muted">(1.64 nearest, averaged)</em>'],
      ['M<sub>1</sub>','M<sub>n,1</sub>/sin β',f(M),'2.877',1],
      ['Deflection θ','θ–β–M (9.23)',dg(s.theta),null],
      ['M<sub>2</sub>','M<sub>n,2</sub>/sin(β − θ)',f(s.M2),null]],def);
  }
  function e5(){
    const M=num('e5_M'),bd=num('e5_b'),b=bd*D,def=near(M,3)&&near(bd,40);
    if(!(M>1)){$('e5_ban').innerHTML=banner('bad','M₁ must exceed 1.');$('e5_tab').innerHTML='';return;}
    const mu=Math.asin(1/M);
    if(!(b>mu&&b<=Math.PI/2)){$('e5_ban').innerHTML=banner('bad',`β must lie between μ<sub>1</sub> = ${dg(mu)} and 90°.`);$('e5_tab').innerHTML='';return;}
    const n1=nsFromMn(M,G), s=shockFromBeta(M,b,G);
    if(!(s.M2>1)){$('e5_ban').innerHTML=banner('bad',`The flow behind the oblique shock is already subsonic (M<sub>2</sub> = ${f(s.M2,3)}).`,'Choose a smaller β so a second, normal shock can exist.');$('e5_tab').innerHTML='';return;}
    $('e5_ban').innerHTML='';
    const n2=nsFromMn(s.M2,G), tot=s.p0r*n2.p0r;
    table('e5_tab',[
      {sect:'Case 1 · single normal shock'},
      ['p<sub>0,2</sub>/p<sub>0,1</sub>','normal shock at M<sub>1</sub>; App. B',f(n1.p0r),'0.3283',1],
      {sect:'Case 2 · oblique shock, then normal shock'},
      ['M<sub>n,1</sub>','M<sub>1</sub> sin β',f(s.Mn1),'1.93'],
      ['p<sub>0,2</sub>/p<sub>0,1</sub>','normal shock at M<sub>n,1</sub>',f(s.p0r),'0.7535'],
      ['Deflection θ','θ–β–M (9.23)',dg(s.theta),'22°'],
      ['M<sub>n,2</sub>','(9.14)',f(s.Mn2),'0.5899'],
      ['M<sub>2</sub>','M<sub>n,2</sub>/sin(β − θ)',f(s.M2),'1.90'],
      ['p<sub>0,3</sub>/p<sub>0,2</sub>','normal shock at M<sub>2</sub>',f(n2.p0r),'0.7674'],
      ['p<sub>0,3</sub>/p<sub>0,1</sub>','product of the two',f(tot),'0.5782',1],
      {sect:'Comparison'},
      ['(p<sub>0,3</sub>/p<sub>0,1</sub>) / (p<sub>0,2</sub>/p<sub>0,1</sub>)<sub>normal</sub>','case 2 ÷ case 1',`${f(tot/n1.p0r,3)} <em class="muted">${f((tot/n1.p0r-1)*100,0)}% more total pressure</em>`,'1.76',1]],def);
  }
  const go2=sched(e2),go3=sched(e3),go4=sched(e4),go5=sched(e5);
  ['e2_M','e2_p','e2_T','e2_th'].forEach(id=>$(id).addEventListener('input',go2));
  ['e3_b','e3_M'].forEach(id=>$(id).addEventListener('input',go3));
  ['e4_b','e4_p'].forEach(id=>$(id).addEventListener('input',go4));
  ['e5_M','e5_b'].forEach(id=>$(id).addEventListener('input',go5));
  renderers.push(go2,go3,go4,go5);
  e2();e3();e4();e5();
  // inlet sketch (static)
  (function(){
    const pf='inm'; let s=markers(pf);
    s+=tx([20,22],'Normal-shock inlet','flab')+tx([240,22],'Oblique-shock inlet','flab');
    s+=wall([[70,64],[190,64]],-1)+wall([[70,136],[190,136]],1);
    s+=`<path d="M58,40 Q46,100 58,160" fill="none" style="stroke:var(--comp)" stroke-width="2.6"/>`+tx([20,186],'strong normal shock','axlab','style="fill:var(--comp)"');
    s+=arrow([10,100],[40,100],'muted',pf);
    s+=wall([[318,64],[430,64]],-1)+wall([[318,136],[430,136]],1);
    s+=`<polygon points="252,100 330,86 430,90 430,110 330,114" style="fill:var(--body);stroke:var(--body)" fill-opacity=".15" stroke-width="1.6"/>`;
    s+=ln([252,100],[318,64],'comp',2.2)+ln([252,100],[318,136],'comp',2.2);
    s+=ln([319,65],[321,87],'comp',2)+ln([319,135],[321,113],'comp',2);
    s+=tx([232,186],'oblique shocks + weak normal shocks at the lip','axlab','style="fill:var(--comp)"');
    s+=arrow([222,100],[246,100],'muted',pf);
    $('e5_fig').innerHTML=s;
  })();
})();

/* =====================================================================
   Interactive 5 · Regular / Mach reflection
   ===================================================================== */
(function(){
  const W=760,H=330,top=36;
  const ixt=document.querySelectorAll('#ix_tabs button');
  ixt.forEach(b=>b.onclick=()=>{ixt.forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));document.querySelectorAll('[data-ixpanel]').forEach(p=>p.hidden=p.dataset.ixpanel!==b.dataset.ix);});
  const go=sched(render);
  const S=controls('rf_ctl',[
    {k:'M',id:'rf_M',label:'Upstream Mach, M<sub>1</sub>',min:1.3,max:5,step:0.01,v:2.8,nmin:1.05,nmax:20,aria:'Mach slider'},
    {k:'th',id:'rf_th',label:'Ramp angle, θ',unit:'deg',min:1,max:30,step:0.5,v:16,nmin:0.1,nmax:45,dec:1,aria:'Ramp angle slider'}],go);
  presets('rf_pre',[['M<sub>1</sub> 2, θ 10°',{M:2,th:10}],['M<sub>1</sub> 2.8, θ 16°',{M:2.8,th:16}],['M<sub>1</sub> 4, θ 12°',{M:4,th:12}],['Mach reflection: M<sub>1</sub> 2, θ 15°',{M:2,th:15}]],S);
  renderers.push(go);
  function render(){
    const M=S.M,th=S.th*D,pf='rfm';
    let s=markers(pf)+`<defs>${clip('rfclip',W,H)}</defs><g clip-path="url(#rfclip)">`,ban='',rows=[];
    const i1=oblique(M,th,G);
    if(i1.type!=='shock'){
      $('rf_ban').innerHTML=banner('bad',`The incident shock itself detaches: θ exceeds θ<sub>max</sub> = ${dg(i1.thmax)} for M<sub>1</sub> = ${f(M,2)}.`);
      $('rf_fig').innerHTML=s+wall([[0,top],[W,top]],-1)+wall([[0,290],[120,290],ray([120,290],th,800)],1)+'</g>';$('rf_out').innerHTML='';return;}
    const b1=i1.beta, h=Math.min(250,(W-300)*Math.tan(b1)), yb=top+h, A=[130,yb], B=[A[0]+h/Math.tan(b1),top];
    const r=oblique(i1.M2,th,G), rampD=[Math.cos(th),-Math.sin(th)];
    s+=wall([[0,top],[W,top]],-1)+wall([[0,yb],A,ray(A,th,900)],1);
    s+=ln(A,[A[0]+120,A[1]],'mach',1,'stroke-dasharray="3 4"');
    s+=arc(A,52,0,th,'ink',1.2)+tx(ray(A,th/2,64),'θ','flab','dominant-baseline="middle"');
    s+=arc(A,90,0,b1,'comp',1.1)+tx(ray(A,b1*0.6,104),'β<tspan font-size="10" dy="3">1</tspan>','flab','style="fill:var(--comp)"');
    const ys=top+0.55*h, P1=[A[0]+(yb-ys)/Math.tan(b1),ys];
    if(r.type==='shock'){
      const Phi=r.beta-th, d=[Math.cos(Phi),Math.sin(Phi)];
      const sr=lineX(B,d,A,rampD), end=sr>0?[B[0]+sr*d[0],B[1]+sr*d[1]]:[B[0]+900*d[0],B[1]+900*d[1]];
      s+=ln(A,B,'comp',2.6)+ln(B,end,'comp',2.6);
      s+=arc(B,64,0,-Phi,'comp',1.1)+tx(ray(B,-Phi*0.5,80),'Φ','flab','style="fill:var(--comp)" dominant-baseline="middle"');
      const s2=lineX(P1,rampD,B,d), P2=[P1[0]+s2*rampD[0],P1[1]+s2*rampD[1]];
      s+=pl([[0,ys],P1,P2,[W+10,P2[1]]],'stream',1.6);
      s+=circ([70,top+50],'1')+circ([(A[0]+B[0]+end[0])/3,(A[1]+B[1]+end[1])/3],'2')+circ([Math.min(W-30,B[0]+140),top+Math.max(22,0.45*140*Math.tan(Phi))],'3');
      s+=tx([B[0]-6,top+18],'B','flab','text-anchor="end"')+tx([A[0]-6,A[1]+22],'A','flab');
      s+=tx(add(B,[-60,40]),'incident','axlab','style="fill:var(--comp)" text-anchor="end"')+tx(add(B,[50,24+60*Math.tan(Phi)]),'reflected','axlab','style="fill:var(--comp)"');
      const weaker=r.p21<i1.p21;
      rows=[['Incident shock angle β<sub>1</sub>',dg(b1)],['p<sub>2</sub>/p<sub>1</sub>',f(i1.p21,4)],['M<sub>2</sub>',f(i1.M2,4)],
        ['θ<sub>max</sub>(M<sub>2</sub>)',`${dg(r.thmax)} <em class="muted">&gt; θ, regular reflection</em>`],
        ['Reflected β<sub>2</sub> (from region-2 flow)',dg(r.beta)],['Φ = β<sub>2</sub> − θ (from the wall)',dg(Phi),'hl'],
        ['p<sub>3</sub>/p<sub>2</sub>',`${f(r.p21,4)} <em class="muted">${weaker?'weaker than incident':'stronger than incident'}</em>`],
        ['p<sub>3</sub>/p<sub>1</sub>',f(i1.p21*r.p21,4),'hl'],['M<sub>3</sub>',f(r.M2,4)]];
    } else {
      const yT=top+0.36*h, T=[A[0]+(yb-yT)/Math.tan(b1),yT];
      s+=ln(A,T,'comp',2.6);
      s+=`<path d="M${fx(T[0])},${fx(T[1])} Q${fx(T[0]+10)},${fx((T[1]+top)/2)} ${fx(T[0]+6)},${top}" fill="none" style="stroke:var(--comp)" stroke-width="2.8"/>`;
      const d=[Math.cos(32*D),Math.sin(32*D)], sr=lineX(T,d,A,rampD), end=sr>0?[T[0]+sr*d[0],T[1]+sr*d[1]]:[T[0]+600*d[0],T[1]+600*d[1]];
      s+=ln(T,end,'comp',2.2)+ln(T,ray(T,-4*D,700),'mach',1.3,'stroke-dasharray="7 5"');
      s+=`<circle cx="${fx(T[0])}" cy="${fx(T[1])}" r="3.5" style="fill:var(--ink)"/>`;
      s+=tx(add(T,[14,-26]),'Mach stem (normal shock)','axlab','style="fill:var(--comp)"')+tx(add(T,[-12,14]),'triple point','axlab','text-anchor="end"')+tx(add(T,[140,-2]),'slip line','axlab');
      s+=circ([70,top+50],'1');
      ban=banner('warn',`Mach reflection: θ = ${f(S.th,1)}° exceeds θ<sub>max</sub>(M<sub>2</sub> = ${f(i1.M2,3)}) = ${dg(r.thmax)}.`,'M₁ is only slightly above the minimum needed for a straight attached shock at this θ. A straight reflected shock cannot turn the flow back, so a Mach stem forms at the wall. The pattern is schematic; computing it requires numerical techniques.');
      rows=[['Incident shock angle β<sub>1</sub>',dg(b1)],['p<sub>2</sub>/p<sub>1</sub>',f(i1.p21,4)],['M<sub>2</sub>',f(i1.M2,4)],['θ<sub>max</sub>(M<sub>2</sub>)',`${dg(r.thmax)} <em class="muted">&lt; θ</em>`,'hl']];
    }
    s+='</g>';
    $('rf_fig').innerHTML=s;$('rf_ban').innerHTML=ban;$('rf_out').innerHTML=readout(rows);
  }
})();

/* =====================================================================
   Interactive 6 · Intersection of right- and left-running shocks
   ===================================================================== */
(function(){
  const W=760,H=350,topY=30;
  const go=sched(render);
  const S=controls('ix_ctl',[
    {k:'M',id:'ix_M',label:'Upstream Mach, M<sub>1</sub>',min:1.5,max:5,step:0.01,v:2.5,nmin:1.05,nmax:20,aria:'Mach slider'},
    {k:'t1',id:'ix_t1',label:'Lower wall turn, θ<sub>1</sub>',unit:'deg',min:1,max:25,step:0.5,v:12,nmin:0.1,nmax:40,dec:1,aria:'Lower turn slider'},
    {k:'t2',id:'ix_t2',label:'Upper wall turn, θ<sub>2</sub>',unit:'deg',min:1,max:25,step:0.5,v:7,nmin:0.1,nmax:40,dec:1,aria:'Upper turn slider'}],go);
  renderers.push(go);
  function render(){
    const M=S.M,t1=S.t1*D,t2=S.t2*D;
    let s=`<defs>${clip('ixclip',W,H)}</defs><g clip-path="url(#ixclip)">`,ban='';
    const wA=oblique(M,t1,G), wB=oblique(M,t2,G);
    if(wA.type!=='shock'||wB.type!=='shock'){
      $('ix_ban').innerHTML=banner('bad','A wall shock detaches.',`θ<sub>max</sub> = ${dg(thetaMax(M,G))} at M<sub>1</sub> = ${f(M,2)}.`);$('ix_fig').innerHTML='';$('ix_tab').innerHTML='';return;}
    const tA=Math.tan(wA.beta),tB=Math.tan(wB.beta),h=Math.min(290,330*(tA+tB)),botY=topY+h;
    const Gc=[150,botY],Hc=[150,topY],ex=Gc[0]+h/(tA+tB),E=[ex,botY-(ex-Gc[0])*tA];
    const sl=slip(wB.M2,wB.p21,-t2,wA.M2,wA.p21,t1,G);
    s+=wall([[0,topY],Hc,ray(Hc,-t2,900)],-1)+wall([[0,botY],Gc,ray(Gc,t1,900)],1);
    s+=ln(Gc,E,'comp',2.6)+ln(Hc,E,'comp',2.6);
    s+=tx(add(Gc,[-6,22]),'G','flab','text-anchor="end"')+tx(add(Hc,[-6,-8]),'H','flab','text-anchor="end"')+tx(add(E,[-22,4]),'E','flab');
    s+=tx(add(Gc,[60,-(h*0.18)-14]),'A','axlab','style="fill:var(--comp)"')+tx(add(Hc,[60,h*0.18+20]),'B','axlab','style="fill:var(--comp)"');
    let rows=[];
    if(!sl||!valid(sl.wU)||!valid(sl.wL)){ban=banner('bad','No regular intersection.','A refracted shock would have to turn its flow beyond θ<sub>max</sub>. The intersection becomes irregular (Mach-type).');}
    else{
      const angD=sl.wU.type==='shock'?-t2+sl.wU.beta:-t2+sl.wU.mu1, angC=sl.wL.type==='shock'?t1-sl.wL.beta:t1-sl.wL.mu1;
      let LD=lineX(E,dirv(angD),Hc,dirv(-t2)); if(!(LD>0))LD=600;
      let LC=lineX(E,dirv(angC),Gc,dirv(t1)); if(!(LC>0))LC=600;
      s+=waveSVG(E,-t2,sl.wU,1,LD)+waveSVG(E,t1,sl.wL,-1,LC);
      s+=ln(E,ray(E,sl.phi,700),'mach',1.4,'stroke-dasharray="8 5"');
      s+=tx(ray(E,angD,Math.min(LD,240)*0.7),'D','axlab','dx="8" style="fill:var(--comp)"')+tx(ray(E,angC,Math.min(LC,240)*0.7),'C','axlab','dx="8" style="fill:var(--comp)"');
      s+=tx(ray(E,sl.phi,330),'slip line','axlab','dy="-6"');
      // streamlines (piecewise straight between waves)
      const yu=topY+0.45*(E[1]-topY), yl=botY-0.45*(botY-E[1]);
      const sU1=lineX([0,yu],[1,0],Hc,dirv(-wB.beta)), PU1=[sU1,yu];
      const sU2=lineX(PU1,dirv(-t2),E,dirv(angD)), PU2=add(PU1,[sU2*Math.cos(t2),sU2*Math.sin(t2)]);
      const sL1=lineX([0,yl],[1,0],Gc,dirv(wA.beta)), PL1=[sL1,yl];
      const sL2=lineX(PL1,dirv(t1),E,dirv(angC)), PL2=add(PL1,[sL2*Math.cos(t1),-sL2*Math.sin(t1)]);
      if(sU2>0) s+=pl([[0,yu],PU1,PU2,ray(PU2,sl.phi,700)],'stream',1.5);
      if(sL2>0) s+=pl([[0,yl],PL1,PL2,ray(PL2,sl.phi,700)],'stream',1.5);
      const mA=[(Gc[0]+E[0])/2,(Gc[1]+E[1])/2], mB=[(Hc[0]+E[0])/2,(Hc[1]+E[1])/2];
      s+=circ([70,(topY+botY)/2],'1')+circ(add(mA,[54,6]),'2')+circ(add(mB,[54,-6]),'3');
      const p4=ray(E,sl.phi,150);
      s+=circ(add(p4,[0,-24]),'4')+circ(add(p4,[0,24]),'4′');
      const T4=wB.T21*sl.wU.T21, T4p=wA.T21*sl.wL.T21;
      const r=(lab,Mv,p,T,ang,p0)=>`<tr><td class="l">${lab}</td><td>${f(Mv,4)}</td><td>${f(p,4)}</td><td>${f(p/T,4)}</td><td>${f(Mv*Math.sqrt(T),4)}</td><td>${f(ang*R,2)}°</td><td>${f(p0,4)}</td></tr>`;
      $('ix_tab').innerHTML=`<thead><tr><th class="l">Region</th><th>M</th><th>p/p<sub>1</sub></th><th>ρ/ρ<sub>1</sub></th><th>V/a<sub>1</sub></th><th>flow angle</th><th>p<sub>0</sub>/p<sub>0,1</sub></th></tr></thead><tbody>`+
        r('1 · freestream',M,1,1,0,1)+r('2 · behind A',wA.M2,wA.p21,wA.T21,t1,wA.p0r)+r('3 · behind B',wB.M2,wB.p21,wB.T21,-t2,wB.p0r)+
        r('4 · behind B, then D',sl.wU.M2,sl.p,T4,sl.phi,wB.p0r*sl.wU.p0r)+r('4′ · behind A, then C',sl.wL.M2,sl.p,T4p,sl.phi,wA.p0r*sl.wL.p0r)+
        `</tbody><tfoot><tr><td class="l" colspan="7" style="font-family:var(--f-body);font-weight:400;color:var(--muted)">Across the slip line: equal p and flow angle; ρ, V and entropy (p<sub>0</sub>) jump. Positive flow angles point up.</td></tr></tfoot>`;
    }
    s+='</g>';
    $('ix_fig').innerHTML=s;$('ix_ban').innerHTML=ban;if(ban)$('ix_tab').innerHTML='';
  }
})();

/* =====================================================================
   Interactive 7 · Prandtl–Meyer expansion fan
   ===================================================================== */
(function(){
  const W=760,H=380,C=[300,190];
  const go=sched(render);
  const S=controls('pm_ctl',[
    {k:'M',id:'pm_M',label:'Upstream Mach, M<sub>1</sub>',min:1,max:5,step:0.01,v:1.5,nmin:1,nmax:30,aria:'Mach slider'},
    {k:'th',id:'pm_th',label:'Expansion angle, θ',unit:'deg',min:0,max:60,step:0.5,v:15,nmin:0,nmax:130,dec:1,aria:'Expansion angle slider'}],go);
  renderers.push(go);
  function render(){
    const M=S.M,th=S.th*D,pf='pmm',nmx=numax(G);
    $('pm_numax').innerHTML=`ν<sub>max</sub> = ${dg(nmx)} at γ = ${f(G,2)}`;
    let s=markers(pf)+`<defs>${clip('pmclip',W,H)}</defs><g clip-path="url(#pmclip)">`,ban='',rows=[];
    if(!(M>=1)){$('pm_ban').innerHTML=banner('bad','M₁ must be at least 1.');return;}
    const n1=nu(M,G);
    s+=ln(C,[C[0]+260,C[1]],'mach',1,'stroke-dasharray="3 4"');
    let w=null;
    if(th<1e-6){
      if(M>1){s+=ln(C,ray(C,Math.asin(1/M),560),'mach',1.4,'stroke-dasharray="7 5"');}
      [28,62,96,130,164].forEach(h=>s+=ln([0,C[1]-h],[W,C[1]-h],'stream',1.5));
    } else {
      w=pm(M,th,G);
      if(w.type!=='exp'){ban=banner('bad','The flow cannot turn this far.',`From M<sub>1</sub> = ${f(M,3)} the maximum turning is ν<sub>max</sub> − ν(M<sub>1</sub>) = ${dg(nmx-n1)}; there M<sub>2</sub> → ∞ and p<sub>2</sub> → 0.`);}
      else{
        const l1=w.mu1,l2=w.mu2-th;
        for(let k=0;k<9;k++){const a=l1+(l2-l1)*k/8;s+=ln(C,ray(C,a,560),'exp',k===0||k===8?1.9:0.85);}
        [28,62,96,130,164].forEach(h=>{const p=fanStream(C,M,th,h,G,W+50);if(p)s+=pl(p,'stream',1.5);});
        s+=arc(C,72,0,l1,'exp',1.2)+tx(ray(C,l1/2,88),'μ<tspan font-size="10" dy="3">1</tspan>','flab','style="fill:var(--exp)" text-anchor="middle" dominant-baseline="middle"');
        s+=arc(C,150,-th,l2,'exp',1.2)+tx(ray(C,(l2-th)/2,166),'μ<tspan font-size="10" dy="3">2</tspan>','flab','style="fill:var(--exp)" dominant-baseline="middle"');
        s+=arc(C,52,0,-th,'ink',1.2)+tx(ray(C,-th/2,66),'θ','flab','dominant-baseline="middle"');
        s+=ln(C,ray(C,-th,240),'mach',1,'stroke-dasharray="3 4"');
        s+=tx(ray(C,l1,250),'forward Mach line','axlab','dx="8" style="fill:var(--exp)"')+tx(ray(C,l2,300),'rearward Mach line','axlab','dx="4" dy="-6" style="fill:var(--exp)"');
        s+=circ(ray(C,(l2-th)/2,300),'2');
        rows=[['ν(M<sub>1</sub>)',dg(w.nu1)],['ν(M<sub>2</sub>) = ν(M<sub>1</sub>) + θ',dg(w.nu2)],['M<sub>2</sub>',f(w.M2,4),'hl'],
          ['μ<sub>1</sub> (forward line)',dg(w.mu1)],['μ<sub>2</sub>',dg(w.mu2)],['Rearward line from upstream, μ<sub>2</sub> − θ',dg(l2)],
          ['p<sub>2</sub>/p<sub>1</sub>',trend(w.p21)],['T<sub>2</sub>/T<sub>1</sub>',trend(w.T21)],['ρ<sub>2</sub>/ρ<sub>1</sub>',trend(w.r21)],['p<sub>0,2</sub>/p<sub>0,1</sub>','1 <em class="muted">isentropic</em>']];
      }
    }
    s+=wall([[0,C[1]],C,ray(C,-th,800)],1)+circ([70,C[1]-150],'1')+tx([C[0]-6,C[1]+24],'A','flab','text-anchor="end"');
    s+='</g>';
    $('pm_fig').innerHTML=s;$('pm_ban').innerHTML=ban;$('pm_out').innerHTML=readout(rows.length?rows:[['ν(M<sub>1</sub>)',dg(n1)],['μ<sub>1</sub>',M>1?dg(Math.asin(1/M)):'90°']]);
    // ν(M) chart
    const M2=w&&w.type==='exp'?w.M2:M, Mx=Math.min(12,Math.max(3,Math.ceil(Math.max(M,M2)+0.5))), cw=760,chh=230,mg={l:58,r:20,t:14,b:42},pw=cw-mg.l-mg.r,ph=chh-mg.t-mg.b;
    const vmax=Math.ceil(nu(Mx,G)*R/10)*10, Xc=m=>mg.l+(m-1)/(Mx-1)*pw, Yc=v=>mg.t+(vmax-v)/vmax*ph;
    let c='';
    const xs=Mx<=6?1:2;for(let m=1;m<=Mx;m+=xs)c+=`<line x1="${fx(Xc(m))}" x2="${fx(Xc(m))}" y1="${mg.t}" y2="${chh-mg.b}" class="gridl"/><text x="${fx(Xc(m))}" y="${chh-mg.b+17}" text-anchor="middle" class="tick">${m}</text>`;
    const ys=vmax>80?20:10;for(let v=0;v<=vmax;v+=ys)c+=`<line x1="${mg.l}" x2="${cw-mg.r}" y1="${fx(Yc(v))}" y2="${fx(Yc(v))}" class="gridl"/><text x="${mg.l-8}" y="${fx(Yc(v)+4)}" text-anchor="end" class="tick">${v}</text>`;
    let d='';for(let i=0;i<=200;i++){const m=1+(Mx-1)*i/200;d+=(i?'L':'M')+fx(Xc(m))+','+fx(Yc(nu(m,G)*R));}
    c+=`<path d="${d}" fill="none" style="stroke:var(--exp)" stroke-width="2.2"/>`;
    c+=`<text x="${mg.l+pw/2}" y="${chh-6}" text-anchor="middle" class="axlab">Mach number M</text><text transform="translate(16 ${mg.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">ν (deg)</text>`;
    const pt=(m,lab)=>{const x=Xc(m),y=Yc(nu(m,G)*R);return `<line x1="${fx(x)}" x2="${fx(x)}" y1="${fx(y)}" y2="${chh-mg.b}" style="stroke:var(--accent)" stroke-dasharray="3 3"/><line x1="${mg.l}" x2="${fx(x)}" y1="${fx(y)}" y2="${fx(y)}" style="stroke:var(--accent)" stroke-dasharray="3 3"/><circle cx="${fx(x)}" cy="${fx(y)}" r="5" style="fill:var(--accent)"/><text x="${fx(x+8)}" y="${fx(y+16)}" class="tick" style="fill:var(--ink)">${lab}</text>`;};
    c+=pt(M,'M₁');
    if(w&&w.type==='exp'){c+=pt(w.M2,'M₂');const y1=Yc(w.nu1*R),y2=Yc(w.nu2*R);c+=`<line x1="${mg.l+12}" x2="${mg.l+12}" y1="${fx(y1)}" y2="${fx(y2)}" style="stroke:var(--ink)" stroke-width="2.2"/><text x="${mg.l+18}" y="${fx((y1+y2)/2+4)}" class="flab">θ</text>`;}
    $('pm_chart').innerHTML=c;
  }
})();

/* Example 9.9 */
(function(){
  const go=sched(render), num=id=>parseFloat($(id).value), near=(a,b)=>Math.abs(a-b)<1e-9;
  ['e9_M','e9_p','e9_T','e9_th'].forEach(id=>$(id).addEventListener('input',go));
  renderers.push(go);
  function render(){
    const M=num('e9_M'),p1=num('e9_p'),T1=num('e9_T'),thd=num('e9_th'),th=thd*D,def=near(M,1.5)&&near(p1,1)&&near(T1,288)&&near(thd,15)&&Math.abs(G-1.4)<1e-9;
    if(!(M>=1)||!(p1>0)||!(T1>0)||!(thd>0)){$('e9_ban').innerHTML=banner('bad','Check the inputs.','M₁ ≥ 1, θ > 0, and positive p₁, T₁.');$('e9_tab').innerHTML='';return;}
    const w=pm(M,th,G);
    if(w.type!=='exp'){$('e9_ban').innerHTML=banner('bad','The flow cannot turn this far.',`Maximum turning from M<sub>1</sub> is ${dg(numax(G)-nu(M,G))}.`);$('e9_tab').innerHTML='';return;}
    $('e9_ban').innerHTML='';
    const p01=p0p(M,G),p02=p0p(w.M2,G),T01=T0T(M,G),T02=T0T(w.M2,G);
    const rows=[
      ['ν(M<sub>1</sub>)','App. C',dg(w.nu1),'11.91°'],['ν(M<sub>2</sub>)','ν(M<sub>1</sub>) + θ',dg(w.nu2),'26.91°'],['M<sub>2</sub>','invert ν; App. C',f(w.M2),'2.0',1],
      ['p<sub>0,1</sub>/p<sub>1</sub>','App. A at M<sub>1</sub>',f(p01),'3.671'],['p<sub>0,2</sub>/p<sub>2</sub>','App. A at M<sub>2</sub>',f(p02),'7.824'],
      ['p<sub>2</sub> (atm)','(p<sub>2</sub>/p<sub>0,2</sub>)(p<sub>0,1</sub>/p<sub>1</sub>) p<sub>1</sub>, p<sub>0,2</sub> = p<sub>0,1</sub>',f(p1*p01/p02,4),'0.469',1],
      ['T<sub>0,1</sub>/T<sub>1</sub>','App. A at M<sub>1</sub>',f(T01),'1.45'],['T<sub>0,2</sub>/T<sub>2</sub>','App. A at M<sub>2</sub>',f(T02),'1.8'],
      ['T<sub>2</sub> (K)','(T<sub>2</sub>/T<sub>0,2</sub>)(T<sub>0,1</sub>/T<sub>1</sub>) T<sub>1</sub>',f(T1*T01/T02,1),'232',1],
      ['p<sub>0,2</sub> = p<sub>0,1</sub> (atm)','isentropic',f(p01*p1,4),'3.671',1],['T<sub>0,2</sub> = T<sub>0,1</sub> (K)','isentropic',f(T01*T1,1),'417.6',1,1],
      ['Forward Mach line, μ<sub>1</sub>','sin<sup>−1</sup>(1/M<sub>1</sub>)',dg(w.mu1),'41.81°',1],['μ<sub>2</sub>','sin<sup>−1</sup>(1/M<sub>2</sub>)',dg(w.mu2),'30°'],
      ['Rearward Mach line, μ<sub>2</sub> − θ','from upstream direction',dg(w.mu2-th),'15°',1]];
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Result</th><th class="hand">Tables, γ = 1.4</th></tr></thead><tbody>`;
    rows.forEach(r=>h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[1]}</td><td class="${r[4]?'hl':''}">${r[2]}</td>${handCell(def?r[3]:'—',def&&r[5])}</tr>`);
    $('e9_tab').innerHTML=h+'</tbody>';
  }
  render();
})();

/* =====================================================================
   Interactive 8 · Isentropic compression vs. oblique shock
   ===================================================================== */
(function(){
  const W=760,H=300,wy=262,half=372;
  const go=sched(render);
  const S=controls('cp_ctl',[
    {k:'M',id:'cp_M',label:'Upstream Mach, M<sub>1</sub>',min:1.5,max:12,step:0.01,v:3,nmin:1.05,nmax:40,aria:'Mach slider'},
    {k:'th',id:'cp_th',label:'Total turning angle, θ',unit:'deg',min:1,max:35,step:0.5,v:15,nmin:0.1,nmax:60,dec:1,aria:'Turning slider'}],go);
  presets('cp_pre',[['Ex 9.10 / 9.11: M<sub>1</sub> 10, θ 15°',{M:10,th:15}],['M<sub>1</sub> 3, θ 15°',{M:3,th:15}],['M<sub>1</sub> 2, θ 20°',{M:2,th:20}]],S);
  renderers.push(go);
  function render(){
    const M=S.M,th=S.th*D,n1=nu(M,G);
    const iso=pm(M,-th,G), sh=oblique(M,th,G);
    let ban='';
    if(iso.type!=='isen') ban+=banner('bad','Isentropic compression cannot turn this far.',`Compressing through θ ≥ ν(M<sub>1</sub>) = ${dg(n1)} would bring the flow to M = 1.`);
    if(sh.type!=='shock') ban+=banner('bad','The sharp-corner shock detaches.',`θ exceeds θ<sub>max</sub> = ${dg(sh.thmax)}.`);
    $('cp_ban').innerHTML=ban;
    let s=`<defs>${clip('cpL',half,H)}<clipPath id="cpR"><rect x="${half+16}" y="0" width="${W-half-16}" height="${H}"/></clipPath></defs>`;
    s+=`<line x1="${half+8}" x2="${half+8}" y1="8" y2="${H-8}" style="stroke:var(--line)"/>`;
    s+=tx([10,20],'Smooth turn: isentropic compression','flab')+tx([half+24,20],'Sharp corner: oblique shock','flab');
    // left panel
    s+='<g clip-path="url(#cpL)">';
    const xs=70,La=150,Ra=La/th,wallPts=[[0,wy],[xs,wy]];
    for(let i=1;i<=40;i++){const p=th*i/40;wallPts.push([xs+Ra*Math.sin(p),wy-Ra*(1-Math.cos(p))]);}
    const we=wallPts[wallPts.length-1]; wallPts.push(ray(we,th,400));
    if(iso.type==='isen'){
      const N=11,lines=[];
      for(let i=0;i<N;i++){const p=th*i/(N-1),Mi=Mofnu(n1-p,G),a=p+Math.asin(1/Mi),P=[xs+Ra*Math.sin(p),wy-Ra*(1-Math.cos(p))];lines.push({P,a,p});s+=ln(P,ray(P,a,700),'comp',1,'opacity=".85"');}
      let best=null;
      for(let i=0;i<N-1;i++){const L1=lines[i],L2=lines[i+1],t=lineX(L1.P,dirv(L1.a),L2.P,dirv(L2.a));if(t>0&&(!best||t<best.t))best={t,P:ray(L1.P,L1.a,t),a:L1.a};}
      if(best){s+=`<circle cx="${fx(best.P[0])}" cy="${fx(best.P[1])}" r="5" style="fill:var(--comp)"/>`+tx(add(best.P,[-8,-10]),'waves coalesce into a shock','axlab','text-anchor="end" style="fill:var(--comp)"');
        if(sh.type==='shock') s+=ln(best.P,ray(best.P,sh.beta,500),'comp',2.4,'stroke-dasharray="9 5"');}
      const hc=best?Math.max(12,wy-best.P[1]):40;
      [0.3*hc,0.65*hc].forEach(h=>{let pos=[0,wy-h],dir=0;const pts=[pos];
        for(const L of lines){const t=lineX(pos,dirv(dir),L.P,dirv(L.a));if(!(t>0))break;pos=ray(pos,dir,t);pts.push(pos);dir=L.p;}
        pts.push(ray(pos,dir,500));s+=pl(pts,'stream',1.5);});
    }
    s+=wall(wallPts,1)+'</g>';
    // right panel
    s+='<g clip-path="url(#cpR)">';
    const Cr=[half+120,wy];
    s+=ln(Cr,[Cr[0]+200,Cr[1]],'mach',1,'stroke-dasharray="3 4"');
    if(sh.type==='shock'){s+=ln(Cr,ray(Cr,sh.beta,600),'comp',2.6);[24,52,90].forEach(h=>{const P=[Cr[0]+h/Math.tan(sh.beta),wy-h];s+=pl([[half+10,wy-h],P,ray(P,th,600)],'stream',1.5);});
      s+=arc(Cr,70,0,sh.beta,'comp',1.1)+tx(ray(Cr,sh.beta*0.55,84),'β','flab','style="fill:var(--comp)"');}
    s+=wall([[half+10,wy],Cr,ray(Cr,th,600)],1)+arc(Cr,46,0,th,'ink',1.2)+tx(ray(Cr,th/2,58),'θ','flab','dominant-baseline="middle"');
    s+='</g>';
    $('cp_fig').innerHTML=s;
    const def=Math.abs(M-10)<1e-9&&Math.abs(S.th-15)<1e-9&&Math.abs(G-1.4)<1e-9;
    const ok1=iso.type==='isen',ok2=sh.type==='shock';
    const r=(lab,a,b,n1v,n2v)=>`<tr><td class="l">${lab}</td><td class="hl">${ok1?a:'—'}</td><td>${ok2?b:'—'}</td>${handCell(def&&n1v?n1v:'—')}${handCell(def&&n2v?n2v:'—')}</tr>`;
    $('cp_tab').innerHTML=`<thead><tr><th class="l">M<sub>1</sub> = ${f(M,2)}, θ = ${f(S.th,1)}°</th><th>Isentropic compression</th><th>Oblique shock</th><th class="hand">Tables, Ex 9.10</th><th class="hand">Tables, Ex 9.11</th></tr></thead><tbody>`+
      r('Wave relation',ok1?`ν(M<sub>2</sub>) = ${dg(n1)} − θ = ${dg(iso.nu2)}`:'',ok2?`β = ${dg(sh.beta)}, M<sub>n,1</sub> = ${f(sh.Mn1,3)}`:'','ν<sub>2</sub> = 87.3°','β = 20°, M<sub>n,1</sub> = 3.42')+
      r('M<sub>2</sub>',ok1?f(iso.M2):'',ok2?f(sh.M2):'','6.4','5.22')+
      r('p<sub>2</sub>/p<sub>1</sub>',ok1?f(iso.p21):'',ok2?f(sh.p21):'','18.02','13.32')+
      r('T<sub>2</sub>/T<sub>1</sub>',ok1?f(iso.T21):'',ok2?f(sh.T21):'',null,null)+
      r('p<sub>0,2</sub>/p<sub>0,1</sub>',ok1?'1':'',ok2?f(sh.p0r):'','1','0.2322')+
      r('Δs/R = −ln(p<sub>0,2</sub>/p<sub>0,1</sub>)',ok1?'0':'',ok2?f(-Math.log(sh.p0r)):'',null,null)+'</tbody>';
    $('cp_note').innerHTML=ok1&&ok2?`For the same ${f(S.th,1)}° turn, the isentropic compression reaches p<sub>2</sub>/p<sub>1</sub> = ${f(iso.p21,3)} and keeps all of its total pressure. The shock reaches only p<sub>2</sub>/p<sub>1</sub> = ${f(sh.p21,3)} and keeps ${f(sh.p0r*100,1)}% of p<sub>0</sub>. The isentropic compression is the more efficient process; the gap widens as M<sub>1</sub> grows.`:'';
  }
})();

/* =====================================================================
   Interactive 9 · Shock-expansion theory for supersonic airfoils
   Region numbering follows the notes: 1 freestream; flat plate and wedge
   2 = upper face, 3 = lower face; diamond 2, 3 = upper front, rear and
   2′, 3′ = lower front, rear; b = wedge base (p_b = p_1).
   ===================================================================== */
(function(){
  const W=780,H=420,ox=215,oy=205,ch=330;
  let cs='flat';
  const go=sched(render);
  const S=controls('af_ctl',[
    {k:'M',id:'af_M',label:'Freestream Mach, M<sub>1</sub>',min:1.1,max:8,step:0.01,v:3,nmin:1.01,nmax:30,aria:'Mach slider'},
    {k:'al',id:'af_al',label:'Angle of attack, α',unit:'deg',min:-15,max:25,step:0.1,v:5,nmin:-40,nmax:40,dec:2,aria:'Angle of attack slider'},
    {k:'e',id:'af_e',label:'Half-angle',unit:'deg',min:0.5,max:25,step:0.1,v:5,nmin:0.1,nmax:40,dec:2,aria:'Half-angle slider'}],go);
  const geo={wedge:5,diamond:10};
  const caseTabs=document.querySelectorAll('#af_cases .case');
  function setCase(c,keep){
    if(cs!=='flat') geo[cs]=S.e;
    cs=c; caseTabs.forEach(b=>b.setAttribute('aria-selected',b.dataset.case===c?'true':'false'));
    document.querySelectorAll('[data-afcase]').forEach(el=>el.hidden=el.dataset.afcase!==c);
    $('af_e_box').hidden=c==='flat';
    $('af_e_lab').innerHTML=(c==='wedge'?'Wedge half-angle, δ':'Diamond half-angle, ε')+' <small>deg</small>';
    $('af_geonote').innerHTML={flat:'A flat plate has zero thickness; α is the only geometric input.',wedge:'Chord c from the nose to the base; base height t = 2c tan δ; base pressure p<sub>b</sub> = p<sub>1</sub>.',diamond:'Symmetric diamond: maximum thickness at mid-chord, t/c = tan ε.'}[c];
    if(!keep&&c!=='flat') S.set({e:geo[c]}); else go();
  }
  caseTabs.forEach(b=>b.onclick=()=>setCase(b.dataset.case));
  const pres=[
    ['Ex 9.12 · Flat plate, M<sub>1</sub> = 3, α = 5°','flat',{M:3,al:5}],
    ['Ex 9.13A · Flat plate, M<sub>1</sub> = 7, α = 10°','flat',{M:7,al:10}],
    ['Ex 9.6 · Wedge δ = 15°, M<sub>1</sub> = 5, α = 0','wedge',{M:5,al:0,e:15}],
    ['Ex 9.13B · X-15 tail: wedge δ = 5°, M<sub>1</sub> = 7, α = 10°','wedge',{M:7,al:10,e:5}],
    ['Diamond ε = 10°, M<sub>1</sub> = 3, α = 0','diamond',{M:3,al:0,e:10}],
    ['Diamond ε = 5°, M<sub>1</sub> = 2.5, α = 4°','diamond',{M:2.5,al:4,e:5}]];
  $('af_pre').innerHTML=pres.map((p,i)=>`<button type="button" data-i="${i}">${p[0]}</button>`).join('');
  $('af_pre').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=pres[+b.dataset.i];if(p[1]!==cs){if(cs!=='flat')geo[cs]=S.e;cs=p[1];setCase(p[1],true);}S.set(Object.assign({e:S.e},p[2]));});
  renderers.push(go);

  function solve(){
    const M=S.M,a=S.al*D,e=(cs==='flat'?0:S.e)*D,g=G;
    const out={ok:true,issues:[],warns:[],faces:[],a,e,M};
    const t=cs==='wedge'?2*Math.tan(e):cs==='diamond'?Math.tan(e):0;
    out.t=t;
    const LE=[0,0];
    const mk=(id,name,side,A,B,phi,from,turnAng)=>({id,name,side,A,B,phi,from,turnAng});
    let F=[];
    if(cs==='flat') F=[mk('2','upper surface','up',LE,[1,0],-a,'1',-a),mk('3','lower surface','low',LE,[1,0],-a,'1',a)];
    if(cs==='wedge') F=[mk('2','upper face','up',LE,[1,t/2],e-a,'1',e-a),mk('3','lower face','low',LE,[1,-t/2],-e-a,'1',e+a)];
    if(cs==='diamond') F=[mk('2','upper front','up',LE,[0.5,t/2],e-a,'1',e-a),mk('3','upper rear','up',[0.5,t/2],[1,0],-e-a,'2',-2*e),
                          mk('2′','lower front','low',LE,[0.5,-t/2],-e-a,'1',e+a),mk('3′','lower rear','low',[0.5,-t/2],[1,0],e-a,'2′',-2*e)];
    const by={'1':{M,P:1,p0:1}};
    for(const fc of F){
      const up=by[fc.from];
      if(!up){fc.skip=true;continue;}
      const w=turn(up.M,fc.turnAng,g); fc.w=w;
      if(w.type==='detached'){out.ok=false;out.issues.push(banner('bad',`Shock detached on the ${fc.name}.`,`The required turn ${f(fc.turnAng*R,2)}° exceeds θ<sub>max</sub> = ${dg(w.thmax)} at M = ${f(up.M,3)}. A bow shock stands off the nose, and shock-expansion theory no longer applies. Reduce α or the thickness, or raise M<sub>1</sub>.`));continue;}
      if(w.type==='vacuum'){out.ok=false;out.issues.push(banner('bad',`Expansion limit on the ${fc.name}.`));continue;}
      if(w.type==='shock'&&w.M2<1){
        if(cs==='diamond'&&fc.from==='1'){out.ok=false;out.issues.push(banner('bad',`Flow on the ${fc.name} is subsonic (M = ${f(w.M2,3)}).`,'The shoulder turn is no longer a Prandtl–Meyer expansion, so the rear-face pressure cannot be found this way.'));continue;}
        out.warns.push(banner('warn',`Flow on the ${fc.name} is subsonic (M = ${f(w.M2,3)}).`,'The shock is attached but close to detachment; the uniform-pressure result is approximate.'));}
      fc.M=w.M2; fc.P=up.P*w.p21; fc.p0=up.p0*w.p0r; by[fc.id]={M:fc.M,P:fc.P,p0:fc.p0};
    }
    out.faces=F;
    if(!out.ok) return out;
    if(cs==='wedge') F.push({id:'b',name:'base',side:'base',A:[1,t/2],B:[1,-t/2],P:1,M:NaN,w:{type:'base'}});
    // forces from gauge pressure (p − p1), per p1 c; wind axes, x downstream, y up
    const ca=Math.cos(a),sa=Math.sin(a),toW=(x,y)=>[x*ca+y*sa,-x*sa+y*ca];
    let Lp=0,Dp=0,Np=0,Ap=0,mLE=0;
    F.forEach(fc=>{
      const dx=fc.B[0]-fc.A[0],dy=fc.B[1]-fc.A[1],l=Math.hypot(dx,dy);let n=[-dy/l,dx/l];
      if((fc.side==='up'&&n[1]<0)||(fc.side==='low'&&n[1]>0)||(fc.side==='base'&&n[0]<0)) n=[-n[0],-n[1]];
      const gx=-(fc.P-1)*l*n[0], gy=-(fc.P-1)*l*n[1];
      fc.l=l; fc.n=n; Np+=gy; Ap+=gx;
      const mx=(fc.A[0]+fc.B[0])/2,my=(fc.A[1]+fc.B[1])/2; mLE+=-(mx*gy-my*gx);
    });
    Lp=Np*ca-Ap*sa; Dp=Np*sa+Ap*ca;
    const q=g/2*M*M;
    Object.assign(out,{q,Np,Ap,Lp,Dp,cl:Lp/q,cd:Dp/q,cn:Np/q,xcp:Math.abs(Np)>1e-12?-mLE/Np:NaN,toW});
    // trailing edge: match pressure and direction of the last upper and lower streams
    if(cs!=='wedge'){
      const U=F.filter(x=>x.side==='up').pop(), Lw=F.filter(x=>x.side==='low').pop();
      out.te=slip(U.M,U.P,U.phi,Lw.M,Lw.P,Lw.phi,g); out.teU=U; out.teL=Lw;
    }
    return out;
  }

  function render(){
    const sol=solve(), pf='afm';
    let ban=sol.issues.concat(sol.warns).join('');
    if(sol.ok){const near=sol.faces.some(fc=>fc.w&&fc.w.type==='shock'&&fc.w.theta>0.92*fc.w.thmax);if(near)ban+=banner('warn','Close to shock detachment.','A leading-edge turn is within 8% of θ<sub>max</sub>; small changes will detach the shock.');}
    $('af_ban').innerHTML=ban;
    // ---------- figure ----------
    const a=sol.a, ca=Math.cos(a), sa=Math.sin(a);
    const P=(x,y)=>[ox+(x*ca+y*sa)*ch, oy-(-x*sa+y*ca)*ch];
    let s=markers(pf)+`<defs>${clip('afclip',W,H)}</defs><g clip-path="url(#afclip)">`;
    for(const y of [60,130,280,350]) s+=arrow([18,y],[100,y],'muted',pf,1.4);
    s+=tx([18,oy+5],'M<tspan font-size="10" dy="3">1</tspan><tspan dy="-3"> = '+f(sol.M,2)+'</tspan>','axlab','style="font-family:var(--f-num)"');
    const LE=P(0,0);
    s+=ln(LE,[LE[0]+130,LE[1]],'mach',1,'stroke-dasharray="3 4"');
    if(Math.abs(a)>0.3*D) s+=arc(LE,96,0,-a,'accent',1.2)+tx(ray(LE,-a/2,110),'α','flab','style="fill:var(--accent)" dominant-baseline="middle"');
    const L=300;
    sol.faces.forEach(fc=>{
      if(!fc.w||fc.side==='base'||fc.skip) return;
      if(!(valid(fc.w))&&fc.w.type!=='detached') return;
      if(fc.w.type==='detached') return;
      const inPhi=fc.from==='1'?0:sol.faces.find(x=>x.id===fc.from).phi;
      s+=waveSVG(P(fc.A[0],fc.A[1]),inPhi,fc.w,fc.side==='up'?1:-1,L,{n:6});
    });
    if(!sol.ok&&sol.faces.some(fc=>fc.w&&fc.w.type==='detached'))
      s+=`<path d="M${fx(LE[0]-12)},${fx(LE[1]-180)} Q${fx(LE[0]-50)},${fx(LE[1])} ${fx(LE[0]-12)},${fx(LE[1]+180)}" fill="none" style="stroke:var(--comp)" stroke-width="2.6" stroke-dasharray="10 6"/>`+tx([LE[0]-170,LE[1]-160],'detached bow shock','axlab','style="fill:var(--comp)"');
    if(sol.ok&&sol.te){
      const TE=P(1,0);
      s+=waveSVG(TE,sol.teU.phi,sol.te.wU,1,L,{n:5})+waveSVG(TE,sol.teL.phi,sol.te.wL,-1,L,{n:5});
      s+=ln(TE,ray(TE,sol.te.phi,260),'mach',1.4,'stroke-dasharray="8 5"');
      s+=tx(ray(TE,sol.te.phi,250),'slip line','axlab','dy="-6" text-anchor="end"');
    }
    // body
    const t=sol.t;
    if(cs==='flat') s+=ln(LE,P(1,0),'body',4,'stroke-linecap="round"');
    else{
      const pts=cs==='wedge'?[P(0,0),P(1,t/2),P(1,-t/2)]:[P(0,0),P(0.5,t/2),P(1,0),P(0.5,-t/2)];
      if(cs==='wedge'){const b1=P(1,t/2),b2=P(1,-t/2),tip=P(1.28,0),c1=P(1.16,t*0.45),c2=P(1.16,-t*0.45);
        s+=`<path d="M${fx(b1[0])},${fx(b1[1])} Q${fx(c1[0])},${fx(c1[1])} ${fx(tip[0])},${fx(tip[1])} Q${fx(c2[0])},${fx(c2[1])} ${fx(b2[0])},${fx(b2[1])}" style="fill:var(--mach);stroke:var(--mach)" fill-opacity=".1" stroke-width="1" stroke-dasharray="4 4"/>`;}
      s+=`<polygon points="${pts.map(p=>fx(p[0])+','+fx(p[1])).join(' ')}" style="fill:var(--body);stroke:var(--body)" fill-opacity=".14" stroke-width="2" stroke-linejoin="round"/>`;
      if(cs==='diamond') s+=ln(LE,P(1,0),'body',0.8,'stroke-dasharray="2 3"');
    }
    // pressure arrows and labels
    if(sol.ok){
      const pmax=Math.max(...sol.faces.map(fc=>fc.P),1e-6),k=58/pmax;let labs='';
      sol.faces.forEach(fc=>{
        const A=P(fc.A[0],fc.A[1]),B=P(fc.B[0],fc.B[1]),nW=sol.toW(fc.n[0],fc.n[1]),ns=[nW[0],-nW[1]];
        const len=Math.max(fc.P*k,9),gap=3,c=fc.P>1+1e-6?'comp':fc.P<1-1e-6?'exp':'mach';
        const ts=fc.side==='base'?[0.3,0.7]:[0.25,0.5,0.75];
        ts.forEach(tt=>{const b=[A[0]+(B[0]-A[0])*tt,A[1]+(B[1]-A[1])*tt];s+=arrow([b[0]+ns[0]*(len+gap),b[1]+ns[1]*(len+gap)],[b[0]+ns[0]*gap,b[1]+ns[1]*gap],c,pf,1.5);});
        const mid=[(A[0]+B[0])/2,(A[1]+B[1])/2],d=len+(fc.side==='base'?62:40),lx=mid[0]+ns[0]*d,ly=mid[1]+ns[1]*d;
        const lab=fc.side==='base'?'b: p/p₁ = 1':`${fc.id}: p/p₁ = ${f(fc.P,3)}`, l2=fc.side==='base'?'prescribed':`M = ${f(fc.M,3)}`;
        labs+=`<g><rect x="${fx(lx-60)}" y="${fx(ly-17)}" width="120" height="33" style="fill:var(--panel);stroke:var(--line)" fill-opacity=".92"/><text x="${fx(lx)}" y="${fx(ly-3)}" text-anchor="middle" style="fill:var(--ink);font:600 12.5px var(--f-num)">${lab}</text><text x="${fx(lx)}" y="${fx(ly+11)}" text-anchor="middle" style="fill:var(--muted);font:12px var(--f-num)">${l2}</text></g>`;
      });
      if(isFinite(sol.xcp)&&Math.hypot(sol.cl,sol.cd)>1e-6){
        const mag=Math.hypot(sol.cl,sol.cd),sc=85/Math.max(mag,0.05),xc=Math.min(Math.max(sol.xcp,-0.2),1.2),base=P(xc,0),tip=[base[0]+sol.cd*sc,base[1]-sol.cl*sc];
        s+=arrow(base,tip,'accent',pf,2.6)+tx(add(tip,[8,4]),'R′','flab','style="fill:var(--accent)"');
      }
      s+=labs;
    }
    s+=circ([150,52],'1');
    s+='</g>';
    $('af_fig').innerHTML=s;
    // ---------- tiles ----------
    const T=(k,v,sub)=>`<div class="tile"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${sub}</span></div>`;
    $('af_tiles').innerHTML=sol.ok?T('Lift coefficient, c<sub>l</sub>',f(sol.cl,4),'L′/(q<sub>1</sub>c)')+T('Wave-drag coefficient, c<sub>d</sub>',f(sol.cd,4),'D′/(q<sub>1</sub>c)')+T('Lift-to-drag, L/D',Math.abs(sol.cd)>1e-12?f(sol.cl/sol.cd,3):'—',cs==='flat'?'= 1/tan α':'inviscid')+T('Center of pressure, x<sub>cp</sub>/c',f(sol.xcp,3),'from the leading edge')
      :T('Lift coefficient, c<sub>l</sub>','—','no valid solution')+T('Wave-drag coefficient, c<sub>d</sub>','—','')+T('Lift-to-drag, L/D','—','')+T('Center of pressure','—','');
    // ---------- region table ----------
    const chip=w=>!w?'':w.type==='shock'?'<span class="chip shock">oblique shock</span>':w.type==='exp'?'<span class="chip exp">expansion</span>':w.type==='none'?'<span class="chip none">Mach wave</span>':w.type==='base'?'<span class="chip none">p<sub>b</sub> = p<sub>1</sub></span>':'<span class="chip shock">'+w.type+'</span>';
    let h=`<thead><tr><th class="l">Region</th><th class="l">Wave</th><th>turn</th><th>β or ν<sub>2</sub></th><th>M</th><th>p/p<sub>1</sub></th></tr></thead><tbody><tr><td class="l">1 · freestream</td><td class="l"></td><td>—</td><td>—</td><td>${f(sol.M,4)}</td><td>1</td></tr>`;
    sol.faces.forEach(fc=>{if(fc.skip)return;const w=fc.w;const ang=w&&w.type==='shock'?`β ${dg(w.beta)}`:w&&w.type==='exp'?`ν ${dg(w.nu2)}`:'—';
      h+=`<tr><td class="l">${fc.id} · ${fc.name}</td><td class="l">${chip(w)}</td><td>${fc.turnAng!==undefined?f(fc.turnAng*R,2)+'°':'—'}</td><td>${valid(w)?ang:'—'}</td><td>${isFinite(fc.M)&&valid(w)?f(fc.M,4):'—'}</td><td>${isFinite(fc.P)?f(fc.P,4):'—'}</td></tr>`;});
    $('af_tab').innerHTML=h+'</tbody>';
    if(sol.ok){
      const q=sol.q;
      const rows=[['q<sub>1</sub>/p<sub>1</sub> = γM<sub>1</sub><sup>2</sup>/2',f(q,4)],
        ['N′/(p<sub>1</sub>c), normal to chord',f(sol.Np,4)],['A′/(p<sub>1</sub>c), along chord',f(sol.Ap,4)],
        ['L′/(p<sub>1</sub>c) = N′cos α − A′sin α',f(sol.Lp,4)],['D′/(p<sub>1</sub>c) = N′sin α + A′cos α',f(sol.Dp,4)],
        ['c<sub>l</sub>',f(sol.cl,4),'hl'],['c<sub>d</sub>',f(sol.cd,4),'hl']];
      if(cs==='flat') rows.push(['c<sub>d</sub>/c<sub>l</sub> = tan α',f(Math.tan(sol.a),4)]);
      $('af_force').innerHTML=readout(rows);
    } else $('af_force').innerHTML='';
    // ---------- comparison with the notes ----------
    const nr=(x,y)=>Math.abs(x-y)<1e-9, M=S.M, al=S.al, e=S.e;
    let ex='';
    const g14=Math.abs(G-1.4)<1e-9;
    const cmp=(title,rows,txt)=>`<h3 style="margin:6px 0 8px">${title}</h3>${handSwitchHTML()}<div class="tblwrap"><table><thead><tr><th class="l">Quantity</th><th>Result</th><th class="hand">Tables, γ = 1.4</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="l">${r[0]}</td><td class="hl">${r[1]}</td>${handCell(g14?r[2]:'—',g14&&r[3])}</tr>`).join('')}</tbody></table></div>${txt?`<p class="exnote" style="margin-top:8px">${txt}</p>`:''}`;
    const fa=id=>sol.faces.find(x=>x.id===id);
    if(sol.ok&&cs==='flat'&&nr(M,3)&&nr(al,5)) ex=cmp('Example 9.12 · Flat plate at α = 5° in Mach 3 flow',[
      ['ν(M<sub>2</sub>) = ν(M<sub>1</sub>) + α',dg(fa('2').w.nu2),'54.76°'],['M<sub>2</sub>',f(fa('2').M,3),'3.27'],['p<sub>2</sub>/p<sub>1</sub> (expansion)',f(fa('2').P,4),'0.668'],
      ['β (lower shock)',dg(fa('3').w.beta),'23.1°'],['M<sub>n,1</sub>',f(fa('3').w.Mn1,4),'1.177'],['p<sub>3</sub>/p<sub>1</sub> (shock)',f(fa('3').P,4),'1.458'],
      ['c<sub>l</sub>',f(sol.cl,4),'0.125'],['c<sub>d</sub>',f(sol.cd,4),'0.011']],'The notes read p<sub>3</sub>/p<sub>1</sub> at the nearest Appendix B entry; c<sub>d</sub> = c<sub>l</sub> tan α in both.');
    if(sol.ok&&cs==='flat'&&nr(M,7)&&nr(al,10)) ex=cmp('Example 9.13A · Flat plate at α = 10° in Mach 7 flow',[
      ['ν(M<sub>2</sub>)',dg(fa('2').w.nu2),'100.97°'],['M<sub>2</sub>',f(fa('2').M,3),'9.5'],['p<sub>2</sub>/p<sub>1</sub>',f(fa('2').P,4),'0.13'],
      ['β (lower shock)',dg(fa('3').w.beta),'16.5° (book)'],['M<sub>n,1</sub>',f(fa('3').w.Mn1,4),'1.99 ≈ 2'],['p<sub>3</sub>/p<sub>1</sub>',f(fa('3').P,4),'4.5',1],['c<sub>l</sub>',f(sol.cl,4),'0.1274',1]],
      'Rounding M<sub>n,1</sub> = 1.99 up to 2 in Appendix B raises p<sub>3</sub>/p<sub>1</sub> from 4.38 to 4.5, which accounts for most of the 4% difference in c<sub>l</sub>.');
    if(sol.ok&&cs==='wedge'&&nr(M,5)&&nr(al,0)&&nr(e,15)) ex=cmp('Example 9.6 · 15° half-angle wedge in Mach 5 flow',[
      ['β',dg(fa('2').w.beta),'24.3°'],['M<sub>n,1</sub>',f(fa('2').w.Mn1,4),'2.0576'],['p<sub>2</sub>/p<sub>1</sub>',f(fa('2').P,4),'4.736 (App. B at 2.05)'],['c<sub>d,w</sub> = 4 tan δ (p<sub>2</sub>/p<sub>1</sub> − 1)/(γM<sub>1</sub><sup>2</sup>)',f(sol.cd,4),'0.1144']],
      'Example 9.6 takes c as the base-to-nose chord (c = ℓ cos δ) and the base pressure equal to p<sub>1</sub>, exactly as here.');
    if(sol.ok&&cs==='wedge'&&nr(M,7)&&nr(al,10)&&nr(e,5)){
      const p2=fa('2'),p3=fa('3'),l=1/Math.cos(sol.e),Lnb=l*(p3.P*Math.cos(sol.e+sol.a)-p2.P*Math.cos(sol.e-sol.a));
      ex=cmp('Example 9.13B · X-15 wedge tail, δ = 5°, α = 10°, Mach 7',[
        ['Upper face: expansion of α − δ',dg(sol.a-sol.e),'5°'],['M<sub>2</sub>',f(p2.M,3),'≈ 8'],['p<sub>2</sub>/p<sub>1</sub>',f(p2.P,4),'0.424'],
        ['Lower face: shock, θ = δ + α',dg(sol.e+sol.a),'15°'],['β',dg(p3.w.beta),'23.5°',1],['M<sub>n,1</sub>',f(p3.w.Mn1,4),'2.79',1],['p<sub>3</sub>/p<sub>1</sub>',f(p3.P,4),'8.98',1],
        ['L′/(p<sub>1</sub>c) from the two faces only',f(Lnb,4),'8.283'],['c<sub>l</sub>, faces only (as in the notes)',f(Lnb/sol.q,4),'0.2415',1],['c<sub>l</sub> with the base at p<sub>b</sub> = p<sub>1</sub>',f(sol.cl,4),'—']],
        'For M<sub>1</sub> = 7 and θ = 15°, Eq. (9.23) gives β = 21.60°, not the 23.5° read from the chart in the notes; that reading raises M<sub>n,1</sub> to 2.79 and p<sub>3</sub>/p<sub>1</sub> to 8.98. With β = 21.60°, p<sub>3</sub>/p<sub>1</sub> = 7.58 and c<sub>l</sub> = 0.203. The notes also sum only the two inclined faces; the base pressure p<sub>1</sub> acting on the base of height t adds p<sub>1</sub>t sin α to L′, a 0.4% increase. The wedge still produces about 1.7 times the lift of the flat plate at the same α and M<sub>1</sub>.');
    }
    if(sol.ok&&cs==='diamond'&&nr(al,0)) ex=cmp(`Diamond at α = 0: check the closed-form result`,[
      ['c<sub>d</sub> = 2(p<sub>2</sub>/p<sub>1</sub> − p<sub>3</sub>/p<sub>1</sub>) tan ε/(γM<sub>1</sub><sup>2</sup>)',f(2*(fa('2').P-fa('3').P)*Math.tan(sol.e)/(G*sol.M*sol.M),4),'—'],['c<sub>d</sub> from the force sum',f(sol.cd,4),'—'],['c<sub>l</sub>',f(sol.cl,4),'0 (symmetry)']],
      'Both routes agree: D′ = (p<sub>2</sub> − p<sub>3</sub>)t.');
    $('af_exnote').innerHTML=ex;
  }
  setCase('flat',true);
})();

/* =====================================================================
   Self-check quiz
   ===================================================================== */
(function(){
  const Q=[
    ['A uniform Mach 2 flow meets a concave corner of 10°. What forms at the corner?',['A centered expansion fan','An attached oblique shock','A detached bow shock','A Mach wave only'],1,'The wall turns the flow into itself, and 10° is below θ<sub>max</sub> = 22.97° at M<sub>1</sub> = 2, so a straight attached oblique shock forms (β = 39.3°).'],
    ['Across an oblique shock, which velocity component is unchanged?',['The component normal to the shock','The component tangential to the shock','The total velocity','None of them'],1,'Tangential momentum gives w<sub>1</sub> = w<sub>2</sub> (Eq. 9.5). Only the normal component jumps, which is why the normal-shock relations apply with M<sub>n,1</sub>.'],
    ['What is the Mach angle for M = 2?',['60°','45°','30°','26.6°'],2,'μ = sin<sup>−1</sup>(1/2) = 30°.'],
    ['For M<sub>1</sub> = 2, the wall turns the flow through 25°. What happens?',['A weak attached shock with β ≈ 64°','A strong attached shock','The shock detaches from the corner','An expansion fan forms'],2,'θ<sub>max</sub>(M<sub>1</sub> = 2) = 22.97°. No straight oblique shock can turn the flow 25°, so a curved shock stands off the corner.'],
    ['Hold θ = 20° and raise M<sub>1</sub> from 2 to 5. The shock…',['moves to a larger β and weakens','moves to a smaller β and strengthens','keeps the same β','detaches'],1,'β drops from 53.4° to 29.8°, but M<sub>n,1</sub> rises from 1.61 to 2.49, so p<sub>2</sub>/p<sub>1</sub> rises from 2.84 to 7.04.'],
    ['Which quantity stays constant through a Prandtl–Meyer expansion fan?',['Static pressure','Mach number','Total pressure p<sub>0</sub>','Density'],2,'The fan is a continuous succession of Mach waves with ds = 0, so it is isentropic: p<sub>0</sub> and T<sub>0</sub> stay constant while p, ρ and T fall and M rises.'],
    ['A Mach 1.5 flow expands around a 15° convex corner. Which relation gives M<sub>2</sub>?',['tan θ = 2 cot β (…)','θ = ν(M<sub>2</sub>) − ν(M<sub>1</sub>)','M<sub>2</sub> = M<sub>n,2</sub>/sin(β − θ)','sin μ = 1/M'],1,'ν(1.5) = 11.91°, so ν(M<sub>2</sub>) = 26.91° and M<sub>2</sub> = 2.02.'],
    ['For the same total turn θ, why is a smooth isentropic compression better than a single oblique shock?',['It reaches a lower final pressure','It loses no total pressure','It turns the flow faster','It produces a weaker expansion'],1,'Example 9.10 vs. 9.11: the isentropic compression keeps p<sub>0</sub> (and reaches a higher p<sub>2</sub>), while the shock at M<sub>1</sub> = 10, θ = 15° keeps only 23% of p<sub>0</sub>.'],
    ['A flat plate sits at α = 5° in an inviscid Mach 3 flow. Its drag is…',['zero, by d’Alembert’s paradox','wave drag, with c<sub>d</sub> = c<sub>l</sub> tan α','skin friction only','equal to its lift'],1,'The net pressure force acts normal to the plate, so D′ = L′ tan α. Shock waves make the drag finite even without viscosity: c<sub>l</sub> = 0.124, c<sub>d</sub> = 0.011.'],
    ['A symmetric diamond airfoil sits at α = 0. Which statement is correct?',['L′ = 0 and D′ = (p<sub>2</sub> − p<sub>3</sub>)t','L′ = 0 and D′ = 0','L′ > 0 because the shoulders expand the flow','D′ = (p<sub>3</sub> − p<sub>2</sub>)t'],0,'The front faces carry the high shock pressure p<sub>2</sub>, pushing back; the rear faces carry the lower expanded pressure p<sub>3</sub>. Symmetry cancels lift.']];
  const box=$('quiz'),ans={};
  box.innerHTML=Q.map((q,i)=>`<div class="qitem" role="group" aria-labelledby="qt${i}"><p class="qt" id="qt${i}"><span class="qn">${i+1}</span>${q[0]}</p><div class="opts">${q[1].map((o,j)=>`<label id="ql${i}_${j}"><input type="radio" name="q${i}" value="${j}"> <span>${o}</span></label>`).join('')}</div><p class="fb" id="qf${i}" hidden></p></div>`).join('');
  const score=()=>{const n=Object.keys(ans).length,c=Object.values(ans).filter(Boolean).length;$('q_score').textContent=n?`Score: ${c} / ${n} answered (${Q.length} total)`:'';};
  Q.forEach((q,i)=>{box.querySelectorAll(`input[name="q${i}"]`).forEach(inp=>inp.addEventListener('change',()=>{
    const j=+inp.value,ok=j===q[2];ans[i]=ok;
    q[1].forEach((_,k)=>{const l=$(`ql${i}_${k}`);l.classList.remove('right','wrong');if(k===q[2])l.classList.add('right');else if(k===j)l.classList.add('wrong');});
    const fb=$('qf'+i);fb.hidden=false;fb.className='fb '+(ok?'ok':'no');fb.innerHTML=`<b>${ok?'Correct.':'Not quite.'}</b> ${q[3]}`;score();}));});
})();



/* cross-module links (examples can drive the explorers) */
const hooks={};

/* =====================================================================
   Interactive 1 · Area–velocity relation
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('av_ctl',[{k:'M',id:'av_M',label:'Mach number, M',min:0.05,max:3,step:0.01,v:0.5,nmin:0.01,nmax:10,aria:'Mach slider'}],go);
  renderers.push(go);
  function duct(x0,conv,M){
    const W=330,y0=120,h1=conv?62:44,h2=conv?44:62,pf='avm';
    let s='';
    const top=[[x0,y0-h1],[x0+W,y0-h2]],bot=[[x0,y0+h1],[x0+W,y0+h2]];
    s+=wall(top,-1)+wall(bot,1);
    s+=tx([x0+W/2,24],conv?'Converging duct, dA/A = −5%':'Diverging duct, dA/A = +5%','flab','text-anchor="middle"');
    const dA=conv?-0.05:0.05, near=Math.abs(M-1)<0.02;
    const du=near?NaN:dA/(M*M-1), dp=-G*M*M*du, dr=-M*M*du;
    // velocity arrows: inlet fixed, outlet scaled
    const L0=70, L1=near?NaN:Math.max(8,Math.min(150,L0*(1+du*6)));
    s+=arrow([x0+20,y0],[x0+20+L0,y0],'ink',pf,2.4)+tx([x0+20,y0-8],'u','flab');
    if(near) s+=tx([x0+W-20,y0+5],'M ≈ 1: no finite solution','axlab','text-anchor="end" style="fill:var(--comp)"');
    else s+=arrow([x0+W-20-L1,y0],[x0+W-20,y0],'accent',pf,2.8)+tx([x0+W-20,y0-10],du>0?'u increases':'u decreases','flab','text-anchor="end" style="fill:var(--accent)"');
    // bars
    const by=205, sc=600, bar=(i,lab,v)=>{const y=by+i*24, w=Math.max(-150,Math.min(150,v*sc)), cx=x0+W/2+40, c=i===0?'accent':v>=0?'comp':'exp';
      return tx([x0,y+5],lab,'axlab')+`<line x1="${cx}" x2="${cx}" y1="${y-9}" y2="${y+9}" style="stroke:var(--line)"/>`+(isFinite(v)?`<rect x="${fx(Math.min(cx,cx+w))}" y="${y-6}" width="${fx(Math.abs(w))}" height="12" style="fill:var(--${c})" opacity=".85"/>`+tx([cx+(w>=0?w+6:w-6),y+5],(v>=0?'+':'−')+f(Math.abs(v*100),1)+'%'+(Math.abs(v*sc)>150?' (off scale)':''),'tick',`text-anchor="${w>=0?'start':'end'}" style="fill:var(--ink)"`):'');};
    s+=bar(0,'du/u',du)+bar(1,'dp/p',dp)+bar(2,'dρ/ρ',dr);
    return s;}
  function render(){
    const M=S.M,pf='avm';
    let s=markers(pf)+duct(10,true,M)+duct(410,false,M);
    $('av_fig').innerHTML=s;
    const near=Math.abs(M-1)<0.02;
    $('av_out').innerHTML=readout([['Regime',M<1-0.02?'subsonic':M>1+0.02?'supersonic':'sonic'],['M² − 1',f(M*M-1,3)],['du/u per 1% area increase',near?'unbounded':f(0.01/(M*M-1)*100,2)+'%','hl']]);
  }
})();

/* =====================================================================
   Interactive 2 · Area–Mach relation
   ===================================================================== */
(function(){
  const W=760,H=330,m={l:58,r:20,t:14,b:46},pw=W-m.l-m.r,ph=H-m.t-m.b,MX=5,AY=12;
  const X=M=>m.l+M/MX*pw, Y=a=>m.t+(AY-a)/(AY-0)*ph;
  const go=sched(render);
  const S=controls('am_ctl',[{k:'A',id:'am_A',label:'Area ratio, A/A*',min:1,max:12,step:0.01,v:2,nmin:1,nmax:1000,aria:'Area ratio slider'}],go);
  renderers.push(go);
  function render(){
    const a=S.A;
    let s='';
    for(let M=0;M<=MX;M++)s+=`<line x1="${fx(X(M))}" x2="${fx(X(M))}" y1="${m.t}" y2="${H-m.b}" class="gridl"/><text x="${fx(X(M))}" y="${H-m.b+18}" text-anchor="middle" class="tick">${M}</text>`;
    for(let A=0;A<=AY;A+=2)s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(A))}" y2="${fx(Y(A))}" class="gridl"/><text x="${m.l-8}" y="${fx(Y(A)+4)}" text-anchor="end" class="tick">${A}</text>`;
    s+=`<text x="${m.l+pw/2}" y="${H-8}" text-anchor="middle" class="axlab">Mach number M</text><text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">A/A*</text>`;
    let d='';for(let i=0;i<=400;i++){const M=0.02+(MX-0.02)*i/400,A=AoAs(M,G);if(A<=AY+0.5)d+=(d?'L':'M')+fx(X(M))+','+fx(Y(Math.min(A,AY+0.5)));}
    s+=`<defs>${clip('amclip',W,H)}</defs><g clip-path="url(#amclip)"><rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="none"/><path d="${d}" fill="none" style="stroke:var(--ink)" stroke-width="2.2"/></g>`;
    s+=`<line x1="${fx(X(1))}" x2="${fx(X(1))}" y1="${m.t}" y2="${H-m.b}" style="stroke:var(--mach)" stroke-dasharray="4 4"/>`+tx([X(1)+6,m.t+14],'M = 1, A = A*','axlab');
    s+=tx([X(0.25),m.t+14],'subsonic','axlab')+tx([X(3.6),m.t+14],'supersonic','axlab');
    const ms=Mfromarea(a,G,false), mp=Mfromarea(a,G,true);
    if(a<=AY){s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(a))}" y2="${fx(Y(a))}" style="stroke:var(--accent)" stroke-dasharray="5 4"/>`;}
    [[ms,'exp'],[mp,'comp']].forEach(([M,c])=>{if(M<=MX&&a<=AY){s+=`<line x1="${fx(X(M))}" x2="${fx(X(M))}" y1="${fx(Y(a))}" y2="${H-m.b}" style="stroke:var(--${c})" stroke-dasharray="3 3"/><circle cx="${fx(X(M))}" cy="${fx(Y(a))}" r="6" style="fill:var(--${c})"/>`+tx([X(M)+8,Y(a)+18],'M = '+f(M,3),'tick','style="fill:var(--ink)"');}});
    $('am_fig').innerHTML=s;
    const row=(lab,fn,d=4)=>`<tr><td class="l">${lab}</td><td>${f(fn(ms),d)}</td><td>${f(fn(mp),d)}</td></tr>`;
    $('am_tab').innerHTML=`<thead><tr><th class="l">A/A* = ${f(a,3)}</th><th>Subsonic root</th><th>Supersonic root</th></tr></thead><tbody>`+
      row('M',M=>M)+row('p/p<sub>0</sub>',M=>pp0(M,G))+row('T/T<sub>0</sub>',M=>TT0(M,G))+row('ρ/ρ<sub>0</sub>',M=>rr0(M,G))+'</tbody>';
  }
  const svg=$('am_fig');let drag=false;
  const setFrom=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const c=svg.getScreenCTM();if(!c)return;const p=pt.matrixTransform(c.inverse());const A=Math.round(Math.min(AY,Math.max(1,AY-(p.y-m.t)/ph*AY))*100)/100;S.set({A});};
  svg.addEventListener('pointerdown',e=>{drag=true;try{svg.setPointerCapture(e.pointerId);}catch(_){}setFrom(e);});
  svg.addEventListener('pointermove',e=>{if(drag)setFrom(e);});
  ['pointerup','pointercancel'].forEach(ev=>svg.addEventListener(ev,()=>{drag=false;}));
})();

/* =====================================================================
   Interactive 3 · Converging-diverging nozzle explorer
   ===================================================================== */
(function(){
  let XT=0.3; const AI=3, N=241;
  const go=sched(render);
  const S=controls('nz_ctl',[
    {k:'Ae',id:'nz_Ae',label:'Exit-to-throat area ratio, A<sub>e</sub>/A<sub>t</sub>',min:1,max:6,step:0.01,v:2,nmin:1,nmax:50,aria:'Area ratio slider'},
    {k:'pb',id:'nz_pb',label:'Back pressure, p<sub>B</sub>/p<sub>0</sub>',min:0,max:1,step:0.001,v:0.7,nmin:0,nmax:1,dec:4,aria:'Back pressure slider'}],go);
  const regs=[
    ['1 · No flow, p<sub>B</sub> = p<sub>0</sub>',c=>1],
    ['2 · Subsonic, not choked',c=>(1+c.p1)/2],
    ['3 · Choked, subsonic exit (p<sub>e1</sub>)',c=>c.p1],
    ['4 · Normal shock in the nozzle',c=>(c.p1+c.p5)/2],
    ['5 · Normal shock at the exit (p<sub>e5</sub>)',c=>c.p5],
    ['6 · Overexpanded, oblique shocks at exit',c=>(c.p5+c.p6)/2],
    ['7 · Design: perfectly expanded (p<sub>e6</sub>)',c=>c.p6],
    ['8 · Underexpanded, expansion fans at exit',c=>c.p6*0.45],
    ['9 · Converging nozzle only (A<sub>e</sub> = A<sub>t</sub>), underexpanded',c=>({Ae:1,pb:0.3})]];
  $('nz_pre').innerHTML=regs.map((r,i)=>`<button type="button" data-i="${i}">${r[0]}</button>`).join('');
  $('nz_pre').querySelectorAll('button').forEach(b=>b.onclick=()=>{const c=critical(S.Ae,G),v=regs[+b.dataset.i][1](c);S.set(typeof v==='object'?v:{pb:v});});
  ['nz_p0','nz_T0','nz_At','nz_R'].forEach(id=>$(id).addEventListener('input',go));
  renderers.push(go);
  let shape='contoured', cq='T', auto=null;
  const Ax=(x,Ae)=>x<=XT?1+(AI-1)*(1-Math.cos(Math.PI*(XT-x)/XT))/2:(shape==='conical'?Math.pow(1+(Math.sqrt(Ae)-1)*(x-XT)/(1-XT),2):1+(Ae-1)*(1-Math.cos(Math.PI*(x-XT)/(1-XT)))/2);
  const xOfA=(A,Ae)=>shape==='conical'?XT+(1-XT)*(Math.sqrt(A)-1)/(Math.sqrt(Ae)-1):XT+(1-XT)*Math.acos(Math.max(-1,Math.min(1,1-2*(A-1)/(Ae-1))))/Math.PI;
  const setShape=v=>{shape=v;$('nz_shape_c').setAttribute('aria-pressed',v==='contoured');$('nz_shape_k').setAttribute('aria-pressed',v==='conical');go();};
  $('nz_shape_c').onclick=()=>setShape('contoured');$('nz_shape_k').onclick=()=>setShape('conical');
  document.querySelectorAll('[data-cq]').forEach(b=>b.onclick=()=>{cq=b.dataset.cq;document.querySelectorAll('[data-cq]').forEach(x=>x.setAttribute('aria-pressed',x===b));go();});
  // Auto run: sweep the back pressure down to 0.01 p0 and back up, like a slow valve
  function stopAuto(){if(auto){cancelAnimationFrame(auto.id);auto=null;$('nz_auto').textContent='Auto run';}}
  $('nz_auto').onclick=()=>{if(auto){stopAuto();return;}
    auto={t0:null,id:0};$('nz_auto').textContent='Stop';
    const T=14000,step=ts=>{if(!auto)return;if(auto.t0===null)auto.t0=ts;const ph=((ts-auto.t0)%T)/T,u=ph<0.5?ph*2:2-ph*2;
      S.set({pb:1-0.99*(1-Math.cos(Math.PI*u))/2});auto.id=requestAnimationFrame(step);};
    auto.id=requestAnimationFrame(step);};
  ['nz_pb','nz_pb_r','nz_Ae','nz_Ae_r'].forEach(id=>$(id).addEventListener('input',stopAuto));
  $('nz_pre').addEventListener('click',stopAuto,true);
  // Export: CSV of the current solution
  let lastCSV='';
  $('nz_csv').onclick=()=>{
    const msg=$('nz_csv_msg'),ta=$('nz_csv_txt');msg.hidden=false;
    const done=ok=>{msg.textContent=ok?'Copied '+(lastCSV.split('\n').length-5)+' rows to the clipboard. Paste into Excel, MATLAB or Python.':'Copy is blocked here. Select the text below and copy it.';ta.hidden=ok;if(!ok){ta.value=lastCSV;ta.select();}};
    try{navigator.clipboard.writeText(lastCSV).then(()=>done(true),()=>done(false));}catch(e){done(false);}};
  hooks.nozzle=(Ae,pb)=>{stopAuto();S.set({Ae,pb});$('nozzle').scrollIntoView({behavior:reduceMotion?'auto':'smooth'});};
  function profile(st,Ae){
    const out=[];
    for(let i=0;i<N;i++){const x=i/(N-1),A=Ax(x,Ae);let M,p;
      if(st.regime==='none'){M=0;p=1;}
      else if(st.regime==='subsonic'){M=Mfromarea(A/st.Astar,G,false);p=pp0(M,G);}
      else if(x<=XT||st.regime==='choked-subsonic'||st.regime==='choked-sonic'){M=Mfromarea(A,G,x>XT&&false?true:false);if(x<=XT){M=Mfromarea(A,G,false);}p=pp0(M,G);}
      else if(st.regime==='shock-inside'){if(A<st.As){M=Mfromarea(A,G,true);p=pp0(M,G);}else{M=Mfromarea(A/st.A2s,G,false);p=st.p02*pp0(M,G);}}
      else {M=Mfromarea(A,G,true);p=pp0(M,G);}
      if(x===XT||Math.abs(x-XT)<1e-9){if(st.regime!=='subsonic'&&st.regime!=='none'){M=1;p=pp0(1,G);}}
      out.push({x,A,M,p,T:TT0(M,G)});}
    return out;}
  const names={'choked-sonic':'Choked, sonic exit (converging nozzle)',none:'No flow',subsonic:'Subsonic throughout, not choked','choked-subsonic':'Choked, subsonic exit','shock-inside':'Normal shock inside the nozzle','shock-exit':'Normal shock at the exit',overexpanded:'Overexpanded',design:'Design condition: perfectly expanded',underexpanded:'Underexpanded'};
  const msg={
    none:'With p<sub>B</sub> = p<sub>0</sub> there is no pressure difference and no flow.',
    'choked-sonic':'With no diverging section the flow can reach at most M = 1, at the exit. The nozzle is choked and the exit pressure stays at p*; any lower back pressure is matched by expansion waves outside the exit. This is the situation in most jet-engine nozzles and in the converging nozzles of Figure 10.13.',
    subsonic:'The flow accelerates in the converging section, reaches its highest Mach number (below 1) at the throat, and decelerates in the diverging section; the nozzle acts as a venturi. p<sub>e</sub> = p<sub>B</sub>, and the mass flow rises as p<sub>B</sub> falls (Figure 10.13, curves 1–2).',
    'choked-subsonic':'The throat has just reached M = 1, so the mass flow has reached its maximum: the nozzle is choked. The flow decelerates subsonically in the diverging section (Figure 10.13, curve 3). Lowering p<sub>B</sub> further cannot increase the mass flow.',
    'shock-inside':'The flow is supersonic downstream of the throat until a normal shock stands in the diverging section, where the pressure jumps. Behind the shock the flow is subsonic and decelerates to the exit, where p<sub>e</sub> = p<sub>B</sub> (Figure 10.15). Lowering p<sub>B</sub> pushes the shock toward the exit. In a real nozzle the shock interacts with the wall boundary layer and forms a lambda pattern (Section 10.6).',
    'shock-exit':'The normal shock sits exactly at the exit plane (Figure 10.16a–c). The flow inside the whole diverging section is now the supersonic isentropic solution.',
    overexpanded:'The flow inside the nozzle no longer changes. The exit pressure p<sub>e6</sub> is below p<sub>B</sub>, so oblique shocks at the exit lips compress the jet up to p<sub>B</sub> (Figure 10.16d).',
    design:'The exit pressure equals the back pressure, p<sub>e6</sub> = p<sub>B</sub>. The jet leaves without any waves at the exit (Figure 10.16e). This is the design point of the nozzle.',
    underexpanded:'The exit pressure p<sub>e6</sub> is above p<sub>B</sub>, so Prandtl–Meyer expansion fans at the exit lips expand the jet down to p<sub>B</sub> (Figure 10.16f). The flow inside the nozzle is unchanged.'};
  // geometry of the drawings
  const x0=70,x1=560,xpl=740;
  const PX=x=>x0+x*(x1-x0);
  function render(){
    const Ae=S.Ae, pb=Math.min(1,Math.max(0,S.pb)), c=critical(Ae,G);
    XT=Ae<1+1e-6?0.97:0.3; // a converging-only nozzle ends at its throat
    let st=nozzle(Ae,pb,G);
    if(st.regime!=='none'&&st.regime!=='subsonic'&&Math.abs(pb-c.p5)<2e-5) st=Object.assign(st,{regime:'shock-exit',Me:c.Msup,pe:c.p6});
    if(st.regime==='overexpanded'&&Math.abs(pb-c.p6)<2e-5) st.regime='design';
    if(Ae<1+1e-6&&['shock-exit','design','overexpanded','choked-subsonic'].includes(st.regime)){st.regime='choked-sonic';st.Me=1;st.pe=c.p6;}
    const prof=profile(st,Ae);
    $('nz_regime_short').textContent=names[st.regime];
    $('nz_msg').innerHTML=`<div class="banner info"><b>${names[st.regime]}</b><span>${msg[st.regime]}</span></div>`;
    ladder(c,pb);
    drawNozzle(st,c,Ae,prof);
    lastCSV=['# MAE 3293 nozzle explorer: quasi-one-dimensional flow, calorically perfect gas',`# gamma = ${G}, Ae/At = ${f(Ae,4)}, pB/p0 = ${f(pb,5)}, diverging section = ${shape}`,`# regime: ${names[st.regime]}`,'# x is distance from inlet (0) to exit (1); throat at x = '+XT+'; rho/rho0 uses reservoir density',
      'x,A_over_At,M,p_over_p0,T_over_T0,rho_over_rho0'].concat(prof.map(P=>[P.x,P.A,P.M,P.p,P.T,P.p/P.T].map(v=>(+v).toPrecision(6)).join(','))).join('\n');
    chart('nz_p',prof,st,c,Ae,'p');
    chart('nz_M',prof,st,c,Ae,'M');
    mdotChart(Ae,pb,c);
    const rows=[['p<sub>e1</sub>/p<sub>0</sub> (choking)',f(c.p1,4)],['p<sub>e5</sub>/p<sub>0</sub> (shock at exit)',f(c.p5,4)],['p<sub>e6</sub>/p<sub>0</sub> (design)',f(c.p6,4)]];
    if(st.regime!=='none'){
      const Mt=st.regime==='subsonic'?st.Mt:1, Me=st.Me;
      rows.push(['Throat Mach number',f(Mt,4)],['Exit Mach number, M<sub>e</sub>',f(Me,4)],['Exit pressure, p<sub>e</sub>/p<sub>0</sub>',f(st.pe,4)]);
      rows.push(['Mass flow, ṁ/ṁ<sub>choked</sub>',f(st.mdot,4)]);
      if(st.regime==='shock-inside') rows.push(['Shock location, A<sub>s</sub>/A<sub>t</sub>',f(st.As,4)],['Mach number ahead of the shock',f(st.Ms,4)],['p<sub>0,2</sub>/p<sub>0,1</sub> = A<sub>1</sub>*/A<sub>2</sub>*',f(st.p02,4)]);
      if(st.regime==='shock-exit'){const n=NS(c.Msup,G);rows.push(['Mach number behind the exit shock',f(n.M2,4)],['p<sub>0,2</sub>/p<sub>0,1</sub>',f(n.p0r,4)]);}
      if(st.regime==='overexpanded') rows.push(['p<sub>B</sub>/p<sub>e</sub> across the lip shocks',f(st.ob.pr,4)],['Lip shock angle β',dg(st.ob.beta)+(st.ob.beta>betaMax(c.Msup,G)?' <em class="muted">strong: Mach disk forms</em>':'')],['Jet boundary turns inward by',dg(st.ob.theta)]);
      if(st.regime==='underexpanded') rows.push(['Jet Mach number after the fans',f(st.ex.Mj,4)],['Jet boundary turns outward by Δν',dg(st.ex.dnu)]);
      // thrust coefficient and its split (Eq. 10.5: the wall pressure integral)
      const Gam=Math.sqrt(G*Math.pow(2/(G+1),(G+1)/(G-1))), CFmom=Gam*st.mdot*Me*Math.sqrt(G*TT0(Me,G)), CF=CFmom+(st.pe-pb)*Ae;
      let CFdiv=0;for(let i=1;i<prof.length;i++){const P=prof[i-1],Q=prof[i];if(P.x>=XT-1e-9)CFdiv+=((P.p+Q.p)/2-pb)*(Q.A-P.A);}
      const p0=parseFloat($('nz_p0').value)*1e3,T0=parseFloat($('nz_T0').value),At=parseFloat($('nz_At').value)*1e-4,Rg=parseFloat($('nz_R').value);
      const dimOK=p0>0&&T0>0&&At>0&&Rg>0, mdot=dimOK?st.mdot*p0*At*Gam/Math.sqrt(Rg*T0):NaN, ue=dimOK?Me*Math.sqrt(G*Rg*T0*TT0(Me,G)):NaN;
      rows.push(['Thrust coefficient, C<sub>F</sub> = F/(p<sub>0</sub>A<sub>t</sub>)',f(CF,4),'hl'],
        ['  from the diverging wall, ∫(p − p<sub>B</sub>) dA/(p<sub>0</sub>A<sub>t</sub>)',f(CFdiv,4)],
        ['  from the chamber and converging wall',f(CF-CFdiv,4)]);
      if(dimOK) rows.push(['Mass flow, ṁ',`${f(mdot,mdot<10?4:2)} kg/s`],['Exit velocity, u<sub>e</sub>',`${f(ue,1)} m/s`],['Thrust, F = C<sub>F</sub>p<sub>0</sub>A<sub>t</sub>',`${f(CF*p0*At,1)} N`]);
    }
    $('nz_out').innerHTML=readout(rows);
  }
  function ladder(c,pb){
    const W=760,y=48,L=40,R=720,X=p=>L+p*(R-L);
    let s=`<rect x="${L}" y="${y-10}" width="${R-L}" height="20" style="fill:var(--soft);stroke:var(--line)"/>`;
    const seg=(a,b,col,op)=>`<rect x="${fx(X(a))}" y="${y-10}" width="${fx(Math.max(0,X(b)-X(a)))}" height="20" style="fill:var(--${col})" opacity="${op}"/>`;
    s+=seg(0,c.p6,'exp',.25)+seg(c.p6,c.p5,'comp',.15)+seg(c.p5,c.p1,'comp',.32)+seg(c.p1,1,'mach',.18);
    const mk=(p,lab,up)=>`<line x1="${fx(X(p))}" x2="${fx(X(p))}" y1="${y-14}" y2="${y+14}" style="stroke:var(--ink)" stroke-width="1.4"/>`+tx([X(p),up?y-19:y+28],lab,'tick',`text-anchor="middle" style="fill:var(--ink)"`);
    s+=mk(c.p6,'p<tspan font-size="9" dy="3">e6</tspan>',true)+mk(c.p5,'p<tspan font-size="9" dy="3">e5</tspan>',true)+mk(c.p1,'p<tspan font-size="9" dy="3">e1</tspan>',true);
    s+=tx([L,y+28],'0','tick','text-anchor="middle"')+tx([R,y+28],'1','tick','text-anchor="middle"')+tx([(L+R)/2,y+44],'back pressure p<tspan font-size="9" dy="3">B</tspan><tspan dy="-3">/p</tspan><tspan font-size="9" dy="3">0</tspan><tspan dy="-3"> (click to set)</tspan>','axlab','text-anchor="middle"');
    const lab=(a,b,t)=>{const w=X(b)-X(a);return w>52?tx([(X(a)+X(b))/2,y+4],t,'axlab','text-anchor="middle" style="fill:var(--ink);font-size:11.5px"'):'';};
    s+=lab(0,c.p6,'underexpanded')+lab(c.p6,c.p5,'overexpanded')+lab(c.p5,c.p1,'shock in nozzle')+lab(c.p1,1,'subsonic');
    s+=`<path d="M${fx(X(pb))},${y-12} l-7,-12 h14 z" style="fill:var(--accent)"/><line x1="${fx(X(pb))}" x2="${fx(X(pb))}" y1="${y-12}" y2="${y+12}" style="stroke:var(--accent)" stroke-width="2.4"/>`;
    $('nz_ladder').innerHTML=s;
  }
  (function(){const svg=$('nz_ladder');let drag=false;const L=40,R=720;
    const setFrom=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const cm=svg.getScreenCTM();if(!cm)return;const p=pt.matrixTransform(cm.inverse());S.set({pb:Math.round(Math.min(1,Math.max(0,(p.x-L)/(R-L)))*1000)/1000});};
    svg.style.cursor='pointer';svg.style.touchAction='none';
    svg.addEventListener('pointerdown',e=>{drag=true;try{svg.setPointerCapture(e.pointerId);}catch(_){}setFrom(e);});
    svg.addEventListener('pointermove',e=>{if(drag)setFrom(e);});
    ['pointerup','pointercancel'].forEach(ev=>svg.addEventListener(ev,()=>{drag=false;}));})();
  function drawNozzle(st,c,Ae,prof){
    const W=760,H=250,yc=125,rt=100/Math.sqrt(Math.max(AI,Ae)),R=x=>rt*Math.sqrt(Ax(x,Ae)),pf='nzm';
    const top=[],bot=[];for(let i=0;i<=120;i++){const x=i/120;top.push([PX(x),yc-R(x)]);bot.push([PX(x),yc+R(x)]);}
    const val=P=>cq==='T'?P.T:cq==='p'?P.p:P.M;
    let vmin=Infinity,vmax=-Infinity;prof.forEach(P=>{const v=val(P);if(v<vmin)vmin=v;if(v>vmax)vmax=v;});
    if(cq==='M')vmin=0; if(vmax-vmin<1e-6){vmax=vmin+1e-6;}
    let cmap='';
    if(cq!=='off'&&st.regime!=='none'){
      const stops=prof.map(P=>`<stop offset="${(P.x*100).toFixed(2)}%" style="stop-color:color-mix(in srgb, var(--comp) ${fx(100*(val(P)-vmin)/(vmax-vmin))}%, var(--exp))"/>`).join('');
      const poly=top.concat(bot.slice().reverse()).map(p=>fx(p[0])+','+fx(p[1])).join(' ');
      cmap=`<defs><linearGradient id="nzgrad" gradientUnits="userSpaceOnUse" x1="${PX(0)}" y1="0" x2="${PX(1)}" y2="0">${stops}</linearGradient></defs><polygon points="${poly}" style="fill:url(#nzgrad)" opacity=".5"/>`;
    }
    let s=markers(pf)+`<defs>${clip('nzclip',W,H)}</defs><g clip-path="url(#nzclip)">`+cmap;
    s+=`<rect x="8" y="${fx(yc-R(0)-14)}" width="${PX(0)-8}" height="${fx(2*R(0)+28)}" style="fill:var(--soft);stroke:var(--line)"/>`+tx([(8+PX(0))/2,yc-4],'p<tspan font-size="9" dy="3">0</tspan>','flab','text-anchor="middle"')+tx([(8+PX(0))/2,yc+14],'T<tspan font-size="9" dy="3">0</tspan>','flab','text-anchor="middle"');
    s+=ln([PX(0),yc],[xpl,yc],'mach',1,'stroke-dasharray="2 4"');
    s+=ln([PX(XT),yc-R(XT)-14],[PX(XT),yc+R(XT)+14],'mach',1,'stroke-dasharray="4 4"')+(XT<0.9?tx([PX(XT),yc+R(XT)+28],'throat, A<tspan font-size="9" dy="3">t</tspan>','axlab','text-anchor="middle"'):'');
    const re=R(1), E=[PX(1),yc], lipU=[PX(1),yc-re], lipL=[PX(1),yc+re], L=xpl-PX(1)+20;
    // flow arrows
    if(st.regime!=='none') s+=arrow([PX(0.04),yc],[PX(0.16),yc],'muted',pf,1.6);
    // exit plume
    const jet=(angU,angL,len=L,c2='mach')=>ln(lipU,ray(lipU,angU,len),c2,1.3,'stroke-dasharray="7 5"')+ln(lipL,ray(lipL,angL,len),c2,1.3,'stroke-dasharray="7 5"');
    if(['subsonic','choked-subsonic','choked-sonic','shock-inside','design','shock-exit'].includes(st.regime)) s+=jet(0,0);
    if(st.regime==='shock-exit') s+=ln(lipU,lipL,'comp',3);
    if(st.regime==='overexpanded'){
      const b=st.ob.beta,th=st.ob.theta,strong=b>betaMax(c.Msup,G);
      s+=jet(-th,th,Math.min(70,0.6*re/Math.max(Math.sin(th),0.05)));
      if(!strong){const len=2*re/Math.sin(b);s+=ln(lipU,ray(lipU,-b,len),'comp',2.4)+ln(lipL,ray(lipL,b,len),'comp',2.4);}
      else{const tp=0.45*re,lx=(re-tp)/Math.tan(b),T1=[lipU[0]+lx,yc-tp],T2=[lipL[0]+lx,yc+tp];
        s+=ln(lipU,T1,'comp',2.4)+ln(lipL,T2,'comp',2.4)+ln(T1,T2,'comp',3)+tx([T1[0]+6,yc-tp-6],'Mach disk','axlab','style="fill:var(--comp)"');}
    }
    if(st.regime==='underexpanded'){
      const w={type:'exp',theta:-st.ex.dnu,mu1:st.ex.mu1,mu2:st.ex.mu2};
      s+=waveSVG(lipU,0,w,-1,re*1.6,{n:5})+waveSVG(lipL,0,w,1,re*1.6,{n:5})+jet(st.ex.dnu,-st.ex.dnu,90);
    }
    if(st.regime!=='none') s+=arrow([PX(1)+10,yc],[PX(1)+70,yc],st.regime==='subsonic'||st.regime==='choked-subsonic'||st.regime==='shock-inside'?'muted':'accent',pf,1.8);
    // internal shock
    if(st.regime==='shock-inside'){const xs=xOfA(st.As,Ae);s+=ln([PX(xs),yc-R(xs)],[PX(xs),yc+R(xs)],'comp',3.2)+tx([PX(xs),yc-R(xs)-10],'normal shock','axlab','text-anchor="middle" style="fill:var(--comp)"');}
    // walls
    s+=wall(top,-1)+wall(bot,1);
    if(cq!=='off'&&st.regime!=='none'){const lx=170,ly=H-6,lw=150;let gr='';for(let i=0;i<30;i++){gr+=`<rect x="${fx(lx+i*lw/30)}" y="${ly-8}" width="${fx(lw/30+0.5)}" height="8" style="fill:color-mix(in srgb, var(--comp) ${fx(100*i/29)}%, var(--exp))" opacity=".6"/>`;}
      const lab={T:'T/T₀',p:'p/p₀',M:'M'}[cq];s+=gr+tx([lx-40,ly],lab,'tick','text-anchor="end" style="fill:var(--ink)"')+tx([lx-6,ly],f(vmin,2),'tick','text-anchor="end"')+tx([lx+lw+6,ly],f(vmax,2),'tick');}
    s+=tx([PX(1),yc+re+28],'exit, A<tspan font-size="9" dy="3">e</tspan>','axlab','text-anchor="middle"');
    s+=tx([W-14,22],'p<tspan font-size="9" dy="3">B</tspan><tspan dy="-3"> = '+f(S.pb,3)+' p</tspan><tspan font-size="9" dy="3">0</tspan>','flab','text-anchor="end"');
    s+='</g>';
    $('nz_fig').innerHTML=s;
  }
  function chart(id,prof,st,c,Ae,q){
    const W=760,H=id==='nz_p'?250:220,m={l:58,r:20,t:14,b:36},ph=H-m.t-m.b;
    const ymax=q==='p'?1.05:Math.max(2.5,Math.ceil(c.Msup*2)/2+0.25);
    const Y=v=>m.t+(ymax-v)/ymax*ph;
    let s=`<defs>${clip(id+'clip',W,H)}</defs>`;
    const step=q==='p'?0.2:(ymax>4?1:0.5);
    for(let v=0;v<=ymax+1e-9;v+=step)s+=`<line x1="${m.l}" x2="${xpl}" y1="${fx(Y(v))}" y2="${fx(Y(v))}" class="gridl"/><text x="${m.l-8}" y="${fx(Y(v)+4)}" text-anchor="end" class="tick">${f(v,q==='p'?1:1)}</text>`;
    s+=`<line x1="${fx(PX(XT))}" x2="${fx(PX(XT))}" y1="${m.t}" y2="${H-m.b}" style="stroke:var(--mach)" stroke-dasharray="4 4"/><line x1="${fx(PX(1))}" x2="${fx(PX(1))}" y1="${m.t}" y2="${H-m.b}" style="stroke:var(--mach)" stroke-dasharray="4 4"/>`;
    s+=(XT<0.9?tx([PX(XT),H-m.b+16],'throat','axlab','text-anchor="middle"'):'')+tx([PX(1),H-m.b+16],'exit','axlab','text-anchor="middle"')+tx([PX(0),H-m.b+16],'inlet','axlab','text-anchor="middle"');
    s+=`<text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">${q==='p'?'p/p₀':'M'}</text>`;
    const path=(pts,fy)=>pts.map((P,i)=>(i?'L':'M')+fx(PX(P.x))+','+fx(Y(fy(P)))).join('');
    // reference curves
    const des=[],sub=[];for(let i=0;i<N;i++){const x=i/(N-1),A=Ax(x,Ae),Ms=x<=XT?Mfromarea(A,G,false):Mfromarea(A,G,true),Mb=Mfromarea(A,G,false);des.push({x,M:x===0?Ms:Ms,p:pp0(Ms,G)});sub.push({x,M:Mb,p:pp0(Mb,G)});}
    const fy=q==='p'?(P=>P.p):(P=>P.M);
    s+=`<path d="${path(des,fy)}" fill="none" style="stroke:var(--exp)" stroke-width="1.4" stroke-dasharray="6 4"/><path d="${path(sub,fy)}" fill="none" style="stroke:var(--mach)" stroke-width="1.4" stroke-dasharray="6 4"/>`;
    if(q==='M') s+=`<line x1="${m.l}" x2="${xpl}" y1="${fx(Y(1))}" y2="${fx(Y(1))}" style="stroke:var(--ink)" stroke-width="1" stroke-dasharray="2 3"/>`+tx([m.l+4,Y(1)-5],'M = 1','tick','style="fill:var(--ink)"');
    if(q==='p') s+=tx([PX(XT)-8,Y(pp0(1,G))+4],'p*/p₀ = '+f(pp0(1,G),3),'tick','text-anchor="end" style="fill:var(--ink)"');
    // current
    let d='';
    if(st.regime==='shock-inside'){const xs=xOfA(st.As,Ae);let pre=prof.filter(P=>P.x<xs),post=prof.filter(P=>P.x>=xs);
      const n=st.ns,Ms=st.Ms,pa=pp0(Ms,G),pb2=pa*n.p21,M2=n.M2;
      pre=pre.concat([{x:xs,M:Ms,p:pa}]);post=[{x:xs,M:M2,p:pb2}].concat(post);
      d=path(pre,fy)+path(post,fy).replace(/^M/,'L');}
    else d=path(prof,fy);
    s+=`<g clip-path="url(#${id}clip)"><path d="${d}" fill="none" style="stroke:var(--accent)" stroke-width="2.8" stroke-linejoin="round"/>`;
    if(st.regime==='shock-inside'){const xs=xOfA(st.As,Ae);s+=tx([PX(xs)+6,m.t+12],'shock','axlab','style="fill:var(--comp)"');}
    // outside the exit: back pressure and exit adjustment
    if(q==='p'&&st.regime!=='none'){
      const pe=st.regime==='shock-exit'?c.p6:st.pe;
      s+=`<line x1="${fx(PX(1))}" x2="${xpl}" y1="${fx(Y(S.pb))}" y2="${fx(Y(S.pb))}" style="stroke:var(--ink)" stroke-width="2"/>`+tx([xpl-4,Y(S.pb)-6],'p<tspan font-size="9" dy="3">B</tspan>','flab','text-anchor="end"');
      if(Math.abs(pe-S.pb)>1e-4) s+=`<line x1="${fx(PX(1)+14)}" x2="${fx(PX(1)+14)}" y1="${fx(Y(pe))}" y2="${fx(Y(S.pb))}" style="stroke:var(--${pe<S.pb?'comp':'exp'})" stroke-width="2.2"/>`+tx([PX(1)+20,(Y(pe)+Y(S.pb))/2+4],pe<S.pb?(st.regime==='shock-exit'?'normal shock at exit':'oblique shocks'):'expansion fans','tick',`style="fill:var(--${pe<S.pb?'comp':'exp'})"`);
    }
    if(q==='M'&&st.regime==='shock-exit'){const n=NS(c.Msup,G);s+=`<line x1="${fx(PX(1))}" x2="${fx(PX(1))}" y1="${fx(Y(c.Msup))}" y2="${fx(Y(n.M2))}" style="stroke:var(--comp)" stroke-width="2.4"/>`;}
    s+='</g>';
    $(id).innerHTML=s;
  }
  function mdotChart(Ae,pb,c){
    const W=380,H=240,m={l:52,r:14,t:16,b:44},pw=W-m.l-m.r,ph=H-m.t-m.b,X=p=>m.l+p*pw,Y=v=>m.t+(1.1-v)/1.1*ph;
    let s='';
    for(let p=0;p<=1.0001;p+=0.2)s+=`<line x1="${fx(X(p))}" x2="${fx(X(p))}" y1="${m.t}" y2="${H-m.b}" class="gridl"/><text x="${fx(X(p))}" y="${H-m.b+16}" text-anchor="middle" class="tick">${f(p,1)}</text>`;
    for(let v=0;v<=1.0001;v+=0.25)s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(v))}" y2="${fx(Y(v))}" class="gridl"/><text x="${m.l-6}" y="${fx(Y(v)+4)}" text-anchor="end" class="tick">${f(v,2)}</text>`;
    s+=`<text x="${m.l+pw/2}" y="${H-8}" text-anchor="middle" class="axlab">p<tspan font-size="9" dy="3">B</tspan><tspan dy="-3">/p</tspan><tspan font-size="9" dy="3">0</tspan></text><text transform="translate(14 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">ṁ/ṁ choked</text>`;
    let d='';for(let i=0;i<=200;i++){const p=i/200,st=nozzle(Ae,Math.min(p,0.99999),G);d+=(i?'L':'M')+fx(X(p))+','+fx(Y(i===200?0:st.mdot));}
    s+=`<path d="${d}" fill="none" style="stroke:var(--ink)" stroke-width="2"/>`;
    s+=`<line x1="${fx(X(c.p1))}" x2="${fx(X(c.p1))}" y1="${m.t}" y2="${H-m.b}" style="stroke:var(--mach)" stroke-dasharray="4 4"/>`+tx([X(c.p1)-4,m.t+12],'p<tspan font-size="9" dy="3">e1</tspan>','tick','text-anchor="end" style="fill:var(--ink)"')+tx([X(c.p1/2),Y(1)-8],'choked','axlab','text-anchor="middle"');
    const st=nozzle(Ae,Math.min(pb,0.99999),G),v=pb>=1?0:st.mdot;
    s+=`<circle cx="${fx(X(pb))}" cy="${fx(Y(v))}" r="6" style="fill:var(--accent);stroke:var(--panel)" stroke-width="2"/>`;
    $('nz_mdot').innerHTML=s;
  }
})();

/* =====================================================================
   Worked examples 10.1–10.3
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
  function e1(){
    const A=num('e1_A'),p0=num('e1_p'),T0=num('e1_T'),def=near(A,10.25)&&near(p0,5)&&near(T0,333);
    if(!(A>1)||!(p0>0)||!(T0>0)){$('e1_ban').innerHTML=banner('bad','Check the inputs.','A_e/A_t must exceed 1; p₀ and T₀ must be positive.');$('e1_tab').innerHTML='';return;}
    $('e1_ban').innerHTML='';
    const M=Mfromarea(A,G,true);
    table('e1_tab',[['M<sub>e</sub>','supersonic root of (10.32), A<sub>e</sub>/A* = A<sub>e</sub>/A<sub>t</sub>',f(M),'3.95',1],
      ['p<sub>0</sub>/p<sub>e</sub>','isentropic, App. A',f(1/pp0(M,G),2),'142'],['T<sub>0</sub>/T<sub>e</sub>','isentropic, App. A',f(1/TT0(M,G)),'4.12'],
      ['p<sub>e</sub> (atm)','(p<sub>e</sub>/p<sub>0</sub>) p<sub>0</sub>',f(p0*pp0(M,G),5),'0.0352',1],['T<sub>e</sub> (K)','(T<sub>e</sub>/T<sub>0</sub>) T<sub>0</sub>',f(T0*TT0(M,G),2),'80.825',1]],def);
  }
  function e2(){
    const A=num('e2_A'),p0=num('e2_p'),T0=num('e2_T'),def=near(A,2)&&near(p0,1)&&near(T0,288);
    if(!(A>1)||!(p0>0)||!(T0>0)){$('e2_tab').innerHTML='';return;}
    const Mp=Mfromarea(A,G,true),Mb=Mfromarea(A,G,false);
    table('e2_tab',[{sect:'Throat (both cases): M<sub>t</sub> = 1'},
      ['p<sub>t</sub> = p* (atm)','(p*/p<sub>0</sub>) p<sub>0</sub>',f(p0*pp0(1,G),4),'0.528 (1/1.893)'],['T<sub>t</sub> = T* (K)','(T*/T<sub>0</sub>) T<sub>0</sub>',f(T0*TT0(1,G),2),'240'],
      {sect:'(a) Supersonic at the exit'},
      ['M<sub>e</sub>','supersonic root of (10.32)',f(Mp),'2.2 (closest entry)',1],['p<sub>0</sub>/p<sub>e</sub>','App. A',f(1/pp0(Mp,G),3),'10.69'],['p<sub>e</sub> (atm)','(p<sub>e</sub>/p<sub>0</sub>) p<sub>0</sub>',f(p0*pp0(Mp,G),4),'0.0935 (written “10.69 atm”)',1,1],
      ['T<sub>0</sub>/T<sub>e</sub>','App. A',f(1/TT0(Mp,G)),'1.968'],['T<sub>e</sub> (K)','(T<sub>e</sub>/T<sub>0</sub>) T<sub>0</sub>',f(T0*TT0(Mp,G),2),'146.34',1],
      {sect:'(b) Subsonic everywhere except the throat'},
      ['M<sub>e</sub>','subsonic root of (10.32)',f(Mb),'0.3',1],['p<sub>0</sub>/p<sub>e</sub>','App. A',f(1/pp0(Mb,G)),'1.064'],['p<sub>e</sub> (atm)','(p<sub>e</sub>/p<sub>0</sub>) p<sub>0</sub>',f(p0*pp0(Mb,G),4),'0.9398',1],
      ['T<sub>0</sub>/T<sub>e</sub>','App. A',f(1/TT0(Mb,G)),'1.018'],['T<sub>e</sub> (K)','(T<sub>e</sub>/T<sub>0</sub>) T<sub>0</sub>',f(T0*TT0(Mb,G),2),'282.9',1]],def);
  }
  function e3(){
    const A=num('e3_A'),p0=num('e3_p0'),pe=num('e3_pe'),def=near(A,2)&&near(p0,1)&&near(pe,0.973);
    if(!(A>1)||!(p0>0)||!(pe>0)||pe>=p0){$('e3_ban').innerHTML=banner('bad','Check the inputs.','Need A_e/A_t > 1 and 0 < p_e < p₀.');$('e3_tab').innerHTML='';return;}
    const c=critical(A,G);
    if(pe/p0<=c.p1){$('e3_ban').innerHTML=banner('warn',`p<sub>e</sub>/p<sub>0</sub> = ${f(pe/p0,4)} is at or below p<sub>e1</sub>/p<sub>0</sub> = ${f(c.p1,4)}.`,'The throat is sonic, so this example’s unchoked method does not apply. Use the nozzle explorer above to see the flow.');$('e3_tab').innerHTML='';return;}
    $('e3_ban').innerHTML='';
    const Me=Mfromp(pe/p0,G),AeAs=AoAs(Me,G),AtAs=AeAs/A,Mt=Mfromarea(AtAs,G,false);
    table('e3_tab',[['p<sub>e1</sub> (atm)','exit pressure when the throat is just sonic',f(p0*c.p1,4),'0.94'],
      ['p<sub>0</sub>/p<sub>e</sub>','given',f(p0/pe,4),'1.028'],['M<sub>e</sub>','isentropic, from p<sub>0</sub>/p<sub>e</sub>',f(Me),'0.2',1,1],['A<sub>e</sub>/A*','(10.32) at M<sub>e</sub>',f(AeAs),'2.964'],
      ['A<sub>t</sub>/A*','(A<sub>t</sub>/A<sub>e</sub>)(A<sub>e</sub>/A*)',f(AtAs),'1.482'],['M<sub>t</sub>','subsonic root of (10.32)',f(Mt),'0.44',1,1]],def);
  }
  function e5(){
    const A=num('e5_A'),p0=num('e5_p0'),pe=num('e5_pe');
    const clear=()=>{$('e5_tab').innerHTML='';$('e5_go').hidden=true;};
    if(!(A>1)||!(p0>0)||!(pe>0)){$('e5_ban').innerHTML=banner('bad','Check the inputs.','Need A_e/A_t > 1 and positive pressures.');clear();return;}
    const c=critical(A,G),r=pe/p0;
    if(!(r<c.p1&&r>c.p5)){$('e5_ban').innerHTML=banner('warn',`No shock inside: p<sub>e</sub>/p<sub>0</sub> = ${f(r,4)} must lie between p<sub>e5</sub>/p<sub>0</sub> = ${f(c.p5,4)} and p<sub>e1</sub>/p<sub>0</sub> = ${f(c.p1,4)} for this nozzle.`,'Above p<sub>e1</sub> the nozzle is not choked; below p<sub>e5</sub> the shock has left the nozzle.');clear();return;}
    $('e5_ban').innerHTML='';$('e5_go').hidden=false;
    const K=r*A, C2=Math.pow(2/(G+1),(G+1)/(G-1)), Me=Math.sqrt(-1/(G-1)+Math.sqrt(1/((G-1)*(G-1))+2/(G-1)*C2/(K*K)));
    const p0r=r/pp0(Me,G);
    let lo=1,hi=50;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(NS(m,G).p0r>p0r)lo=m;else hi=m;}
    const Ms=(lo+hi)/2, As=AoAs(Ms,G), chk=nozzle(A,r,G);
    const rows=[['p<sub>e</sub>A<sub>e</sub>/(p<sub>0,1</sub>A<sub>t</sub>)','given',f(K,4)],
      ['M<sub>e</sub>','closed form above (subsonic exit)',f(Me,4)],
      ['p<sub>e</sub>/p<sub>0,2</sub>','isentropic at M<sub>e</sub>',f(pp0(Me,G),4)],
      ['p<sub>0,2</sub>/p<sub>0,1</sub>','(p<sub>e</sub>/p<sub>0,1</sub>)/(p<sub>e</sub>/p<sub>0,2</sub>)',f(p0r,4)],
      ['M<sub>1</sub>, ahead of the shock','invert the normal-shock p<sub>0,2</sub>/p<sub>0,1</sub> (App. B)',f(Ms,4)],
      ['A<sub>s</sub>/A<sub>t</sub>, shock location','supersonic root of (10.32), A<sub>1</sub>* = A<sub>t</sub>',f(As,4),1],
      ['M<sub>2</sub>, behind the shock','normal shock',f(NS(Ms,G).M2,4)],
      ['A<sub>2</sub>*/A<sub>t</sub> = p<sub>0,1</sub>/p<sub>0,2</sub>','check: A<sub>e</sub>/A<sub>2</sub>* = (A/A*)(M<sub>e</sub>)',`${f(1/p0r,4)}; ${f(A*p0r,4)} = ${f(AoAs(Me,G),4)}`],
      ['Nozzle explorer (independent iteration)','shock area found by bisection',f(chk.As,4)]];
    $('e5_tab').innerHTML=`<thead><tr><th class="l">Step</th><th class="l">Relation used</th><th>Value</th></tr></thead><tbody>`+rows.map(x=>`<tr><td class="l">${x[0]}</td><td class="rel">${x[1]}</td><td class="${x[3]?'hl':''}">${x[2]}</td></tr>`).join('')+'</tbody>';
  }
  $('e5_go').onclick=()=>{if(hooks.nozzle)hooks.nozzle(num('e5_A'),num('e5_pe')/num('e5_p0'));};
  const g5=sched(e5);['e5_A','e5_p0','e5_pe'].forEach(id=>$(id).addEventListener('input',g5));renderers.push(g5);
  const g1=sched(e1),g2=sched(e2),g3=sched(e3);
  ['e1_A','e1_p','e1_T'].forEach(id=>$(id).addEventListener('input',g1));
  ['e2_A','e2_p','e2_T'].forEach(id=>$(id).addEventListener('input',g2));
  ['e3_A','e3_p0','e3_pe'].forEach(id=>$(id).addEventListener('input',g3));
  renderers.push(g1,g2,g3);
})();

/* =====================================================================
   Example 10.4 · Rocket thrust (own γ and R)
   ===================================================================== */
(function(){
  const go=sched(render),num=id=>parseFloat($(id).value);
  ['rk_p0','rk_T0','rk_At','rk_pinf','rk_g','rk_R'].forEach(id=>$(id).addEventListener('input',go));
  $('rk_show').onclick=()=>{const sol=$('rk_sol'),open=sol.hidden;sol.hidden=!open;$('rk_show').textContent=open?'Hide the solution':'Show the solution';$('rk_show').setAttribute('aria-expanded',open);if(open)render();};
  function render(){
    if($('rk_sol').hidden) return;
    const p0=num('rk_p0')*101325,T0=num('rk_T0'),At=num('rk_At'),pinf=num('rk_pinf'),g=num('rk_g'),Rg=num('rk_R');
    if(!(p0>0&&T0>0&&At>0&&pinf>0&&g>1.01&&g<1.8&&Rg>0)||pinf>=p0){$('rk_ban').innerHTML=banner('bad','Check the inputs.','All values must be positive, 1 < γ < 1.8, and p∞ below the chamber pressure.');$('rk_tab').innerHTML='';$('rk_fig').innerHTML='';return;}
    $('rk_ban').innerHTML='';
    const K=Math.sqrt(g/Rg*Math.pow(2/(g+1),(g+1)/(g-1))), mdot=p0*At/Math.sqrt(T0)*K;
    const Me=Mfromp(pinf/p0,g), Te=T0*TT0(Me,g), ae=Math.sqrt(g*Rg*Te), ue=Me*ae, Ae=At*AoAs(Me,g), T=mdot*ue;
    const e=x=>x.toLocaleString('en-US',{maximumFractionDigits:0});
    const rows=[{sect:'(a) Thrust'},
      ['Mass flow, ṁ','choked:  p<sub>0</sub>A<sub>t</sub>/√T<sub>0</sub> · √[γ/R (2/(γ+1))<sup>(γ+1)/(γ−1)</sup>]',`${f(mdot,1)} kg/s`],
      ['p<sub>0</sub>/p<sub>e</sub>','p<sub>e</sub> = p<sub>∞</sub> (design)',f(p0/pinf,1)],
      ['M<sub>e</sub>','isentropic, from p<sub>0</sub>/p<sub>e</sub>',f(Me,4)],
      ['T<sub>e</sub>','T<sub>0</sub>(1 + (γ−1)M<sub>e</sub><sup>2</sup>/2)<sup>−1</sup>',`${f(Te,1)} K`],
      ['u<sub>e</sub> = M<sub>e</sub>√(γRT<sub>e</sub>)','',`${f(ue,1)} m/s`],
      ['Thrust, T = ṁu<sub>e</sub> + (p<sub>e</sub> − p<sub>∞</sub>)A<sub>e</sub>','pressure term is zero at design',`${e(T)} N = ${f(T/1e6,3)} MN`,1],
      {sect:'(b) Exit area'},
      ['A<sub>e</sub>/A<sub>t</sub>','(10.32) at M<sub>e</sub>',f(Ae/At,3)],
      ['A<sub>e</sub>','',`${f(Ae,3)} m²`,1]];
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Result</th></tr></thead><tbody>`;
    rows.forEach(r=>{if(r.sect){h+=`<tr><td class="l" colspan="3" style="padding-top:14px;color:var(--ink);font-weight:600">${r.sect}</td></tr>`;return;}h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[1]}</td><td class="${r[3]?'hl':''}">${r[2]}</td></tr>`;});
    $('rk_tab').innerHTML=h+'</tbody>';
    // thrust vs ambient pressure for the fixed nozzle
    const W=640,H=230,m={l:70,r:16,t:14,b:42},pw=W-m.l-m.r,ph=H-m.t-m.b,pmax=101325,Tf=pa=>T+(pinf-pa)*Ae;
    const tmax=Tf(0),tmin=Math.min(Tf(pmax),T*0.5),lo=Math.max(0,Math.floor(tmin/5e5)*5e5-5e5),hi=Math.ceil(tmax/5e5)*5e5;
    const X=p=>m.l+p/pmax*pw,Y=v=>m.t+(hi-v)/(hi-lo)*ph;
    let s='';
    for(let p=0;p<=pmax;p+=20000)s+=`<line x1="${fx(X(p))}" x2="${fx(X(p))}" y1="${m.t}" y2="${H-m.b}" class="gridl"/><text x="${fx(X(p))}" y="${H-m.b+16}" text-anchor="middle" class="tick">${p/1000}</text>`;
    for(let v=lo;v<=hi+1;v+=5e5)s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(v))}" y2="${fx(Y(v))}" class="gridl"/><text x="${m.l-6}" y="${fx(Y(v)+4)}" text-anchor="end" class="tick">${f(v/1e6,1)}</text>`;
    s+=`<text x="${m.l+pw/2}" y="${H-6}" text-anchor="middle" class="axlab">ambient pressure p∞ (kPa)</text><text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">thrust (MN)</text>`;
    s+=`<line x1="${fx(X(0))}" y1="${fx(Y(Tf(0)))}" x2="${fx(X(pmax))}" y2="${fx(Y(Tf(pmax)))}" style="stroke:var(--ink)" stroke-width="2"/>`;
    s+=`<circle cx="${fx(X(pinf))}" cy="${fx(Y(T))}" r="6" style="fill:var(--accent);stroke:var(--panel)" stroke-width="2"/>`+tx([X(pinf)+10,Y(T)-8],'design, 20 km','tick','style="fill:var(--ink)"');
    s+=tx([X(0)+8,Y(Tf(0))+34],'vacuum: '+f(Tf(0)/1e6,2)+' MN','tick','style="fill:var(--ink)"')+tx([X(pmax)-6,Y(Tf(pmax))+18],'sea level: '+f(Tf(pmax)/1e6,2)+' MN','tick','text-anchor="end" style="fill:var(--ink)"');
    $('rk_fig').innerHTML=s;
  }
})();

/* =====================================================================
   Interactive 4 · Supersonic wind tunnel
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('wt_ctl',[
    {k:'M',id:'wt_M',label:'Test-section Mach number, M<sub>e</sub>',min:1.2,max:5,step:0.01,v:2.5,nmin:1.01,nmax:10,aria:'Test-section Mach slider'},
    {k:'pB',id:'wt_pB',label:'Back pressure, p<sub>B</sub>',unit:'atm',min:0.1,max:2,step:0.01,v:1,nmin:0.001,nmax:100,aria:'Back pressure slider'}],go);
  presets('wt_pre',[['M<sub>e</sub> 2.5 (Figs 10.18–10.19)',{M:2.5,pB:1}],['M<sub>e</sub> 1.5',{M:1.5,pB:1}],['M<sub>e</sub> 4',{M:4,pB:1}]],S);
  renderers.push(go);
  function req(M){const ns=NS(M,G),a=1/pp0(M,G),b=a/ns.p21,ratio=1/ns.p0r,Mt2=Mfromarea(ratio,G,true),c=1/NS(Mt2,G).p0r;return {a,b,ratio,Mt2,c,ns};}
  function render(){
    const M=S.M,pB=S.pB,r=req(M);
    $('wt_tab').innerHTML=`<thead><tr><th class="l">Layout (back pressure p<sub>B</sub> = ${f(pB,3)} atm)</th><th>p<sub>0</sub> required (atm)</th><th>p<sub>0</sub>/p<sub>B</sub></th><th class="l">Notes</th></tr></thead><tbody>`+
      `<tr><td class="l">Nozzle exhausting directly to p<sub>B</sub> (Fig. 10.18)</td><td>${f(r.a*pB,3)}</td><td>${f(r.a,3)}</td><td class="rel">A<sub>e</sub>/A* = ${f(AoAs(M,G),3)}; design exit, p<sub>e</sub> = p<sub>B</sub></td></tr>`+
      `<tr><td class="l">Constant-area duct, normal shock at its exit (Fig. 10.19)</td><td>${f(r.b*pB,3)}</td><td>${f(r.b,3)}</td><td class="rel">p<sub>2</sub>/p<sub>1</sub> = ${f(r.ns.p21,3)} across the shock; p<sub>e</sub> = ${f(pB/r.ns.p21,4)} atm</td></tr>`+
      `<tr><td class="l">Diffuser with second throat, shock at the second throat after start-up (Fig. 10.20)</td><td class="hl">${f(r.c*pB,3)}</td><td class="hl">${f(r.c,3)}</td><td class="rel">A<sub>t,2</sub>/A<sub>t,1</sub> = p<sub>0,1</sub>/p<sub>0,2</sub> = ${f(r.ratio,3)}; M = ${f(r.Mt2,3)} at the second throat</td></tr>`+
      `<tr><td class="l">Ideal isentropic diffuser (limit, not achievable)</td><td>${f(pB,3)}</td><td>1</td><td class="rel">p<sub>0,2</sub> = p<sub>0,1</sub></td></tr></tbody>`;
    $('wt_note').innerHTML=`The second throat must be at least ${f(r.ratio,3)} times the nozzle throat so that it can pass the mass flow at the reduced total pressure behind the start-up normal shock. Once started, the shock moves into the diffuser. In this fixed-geometry estimate it settles at the second throat, where M = ${f(r.Mt2,3)} instead of ${f(M,2)}, and the subsonic flow behind it diffuses to rest. A variable-geometry diffuser can close the second throat after start-up and push the shock loss lower still.`;
    drawTunnel(M,r); chart(M);
  }
  function drawTunnel(M,r){
    const W=760,yc=105,pf='wtm',A1=26,ae=Math.min(80,A1*AoAs(M,G)),scale=ae>78?78/(A1*AoAs(M,G)):1,at1=A1*scale,ate=at1*AoAs(M,G),at2=at1*r.ratio;
    const xs=[20,110,250,420,560,640,740];
    const top=[[xs[0],yc-ate*0.9],[xs[1],yc-at1],[xs[2],yc-ate],[xs[3],yc-ate],[xs[4],yc-at2],[xs[5],yc-at2],[xs[6],yc-Math.min(95,at2*1.6)]];
    const sm=pts=>{let d='M'+fx(pts[0][0])+','+fx(pts[0][1]);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a[0]+b[0])/2;d+=` C${fx(mx)},${fx(a[1])} ${fx(mx)},${fx(b[1])} ${fx(b[0])},${fx(b[1])}`;}return d;};
    const bot=top.map(p=>[p[0],2*yc-p[1]]);
    let s=markers(pf)+`<path d="${sm(top)}" fill="none" style="stroke:var(--body)" stroke-width="2.4"/><path d="${sm(bot)}" fill="none" style="stroke:var(--body)" stroke-width="2.4"/>`;
    s+=ln([xs[1],yc-at1-8],[xs[1],yc+at1+8],'mach',1,'stroke-dasharray="3 3"')+ln([xs[4]+40,yc-at2-8],[xs[4]+40,yc+at2+8],'mach',1,'stroke-dasharray="3 3"');
    s+=tx([xs[1],yc+at1+24],'A<tspan font-size="9" dy="3">t,1</tspan>','axlab','text-anchor="middle"')+tx([xs[4]+40,yc+at2+24],'A<tspan font-size="9" dy="3">t,2</tspan><tspan dy="-3"> = '+f(r.ratio,2)+' A</tspan><tspan font-size="9" dy="3">t,1</tspan>','axlab','text-anchor="middle"');
    s+=tx([(xs[2]+xs[3])/2,16],'test section, M = '+f(M,2),'flab','text-anchor="middle"')+tx([60,16],'nozzle','flab','text-anchor="middle"')+tx([620,16],'diffuser','flab','text-anchor="middle"');
    s+=`<path d="M${xs[2]+120},${yc-6} l-40,6 l40,6 z" style="fill:var(--body)" opacity=".5"/>`+tx([xs[2]+100,yc+28],'model','axlab','text-anchor="middle"');
    s+=ln([xs[2]+30,yc-ate],[xs[2]+30,yc+ate],'comp',2,'stroke-dasharray="6 4"')+tx([xs[2]+30,yc+ate+16],'start-up shock','tick','text-anchor="middle" style="fill:var(--comp)"');
    s+=ln([xs[4]+40,yc-at2],[xs[4]+40,yc+at2],'comp',2.6)+tx([xs[4]+40,yc-at2-14],'running shock','tick','text-anchor="middle" style="fill:var(--comp)"');
    s+=tx([10,yc+4],'p₀','flab')+tx([730,yc+4],'p<tspan font-size="9" dy="3">B</tspan>','flab','text-anchor="end"');
    $('wt_fig').innerHTML=s;
  }
  function chart(Mc){
    const W=760,H=280,m={l:60,r:20,t:14,b:44},pw=W-m.l-m.r,ph=H-m.t-m.b,Mlo=1,Mhi=5,ylo=0,yhi=3; // log10 axis 1..1000
    const X=M=>m.l+(M-Mlo)/(Mhi-Mlo)*pw,Y=v=>m.t+(yhi-Math.log10(v))/(yhi-ylo)*ph;
    let s=`<defs>${clip('wtclip',W,H)}</defs>`;
    for(let M=1;M<=5;M++)s+=`<line x1="${fx(X(M))}" x2="${fx(X(M))}" y1="${m.t}" y2="${H-m.b}" class="gridl"/><text x="${fx(X(M))}" y="${H-m.b+16}" text-anchor="middle" class="tick">${M}</text>`;
    [1,10,100,1000].forEach(v=>{s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(v))}" y2="${fx(Y(v))}" class="gridl"/><text x="${m.l-6}" y="${fx(Y(v)+4)}" text-anchor="end" class="tick">${v}</text>`;});
    s+=`<text x="${m.l+pw/2}" y="${H-8}" text-anchor="middle" class="axlab">test-section Mach number M<tspan font-size="9" dy="3">e</tspan></text><text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">p₀/p<tspan font-size="9" dy="3">B</tspan><tspan dy="-3"> (log scale)</tspan></text>`;
    const keys=[['a','ink','direct exhaust'],['b','muted','shock at duct exit'],['c','accent','second-throat diffuser']];
    s+='<g clip-path="url(#wtclip)">';
    keys.forEach(([k,c,lab])=>{let d='';for(let i=0;i<=160;i++){const M=1.01+(Mhi-1.01)*i/160;d+=(i?'L':'M')+fx(X(M))+','+fx(Y(req(M)[k]));}s+=`<path d="${d}" fill="none" style="stroke:var(--${c})" stroke-width="${k==='c'?2.6:1.8}" ${k==='b'?'stroke-dasharray="6 4"':''}/>`;
      const v=req(4.6)[k];s+=tx([X(4.6),Y(v)+(k==='c'?18:-8)],lab,'tick',`text-anchor="end" style="fill:var(--${c==='muted'?'ink':c})"`);});
    s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${fx(Y(1))}" y2="${fx(Y(1))}" style="stroke:var(--mach)" stroke-dasharray="2 3"/>`+tx([X(4.6),Y(1)-6],'ideal diffuser','tick','text-anchor="end" style="fill:var(--ink)"');
    const r=req(Mc);[['a','ink'],['b','muted'],['c','accent']].forEach(([k,c])=>{s+=`<circle cx="${fx(X(Mc))}" cy="${fx(Y(r[k]))}" r="5" style="fill:var(--${c});stroke:var(--panel)" stroke-width="2"/>`;});
    s+=`<line x1="${fx(X(Mc))}" x2="${fx(X(Mc))}" y1="${m.t}" y2="${H-m.b}" style="stroke:var(--accent)" stroke-dasharray="4 4"/></g>`;
    $('wt_chart').innerHTML=s;
  }
})();

/* =====================================================================
   Interactive 5 · Wind-tunnel start-up (nozzle, test section, diffuser with second throat)
   Areas are normalized by the nozzle throat A_t,1. Quasi-one-dimensional, inviscid.
   ===================================================================== */
(function(){
  const go=sched(render);
  let started=false, anim=null;
  const S=controls('ts_ctl',[
    {k:'M',id:'ts_M',label:'Test-section Mach number, M<sub>e</sub>',min:1.5,max:4,step:0.01,v:2.5,nmin:1.2,nmax:6,aria:'Test-section Mach slider'},
    {k:'r2',id:'ts_r2',label:'Second throat, A<sub>t,2</sub>/A<sub>t,1</sub>',min:1,max:2.6,step:0.001,v:2.1,nmin:1,nmax:40,dec:3,aria:'Second throat slider'},
    {k:'P',id:'ts_P',label:'Reservoir to back pressure, p<sub>0</sub>/p<sub>B</sub>',min:1,max:12,step:0.01,v:1.6,nmin:1,nmax:60,aria:'Pressure ratio slider'}],()=>{fixRange();go();});
  function fixRange(){const Ae=AoAs(S.M,G);S.range('r2',1,(Ae*0.98).toFixed(3));if(S.r2>Ae*0.98)S.r2=Ae*0.98;S.range('P',1,Math.max(12,Math.ceil(solveAll(S.M,Math.max(S.r2,1)).Ps*1.4)));}
  ['ts_M','ts_M_r'].forEach(id=>$(id).addEventListener('input',()=>{started=false;}));
  const Msub=a=>Mfromarea(a,G,false), Msup=a=>Mfromarea(a,G,true);
  // geometry: x in [0,1]
  const X=[0,0.10,0.32,0.55,0.68,1.0];
  const cosA=(t,a,b)=>a+(b-a)*(1-Math.cos(Math.PI*t))/2, cosInv=(A,a,b)=>Math.acos(Math.max(-1,Math.min(1,1-2*(A-a)/(b-a))))/Math.PI;
  function area(x,Ae,r2){const Ai=Math.max(2,0.9*Ae);
    if(x<X[1])return cosA(x/X[1],Ai,1);
    if(x<X[2])return cosA((x-X[1])/(X[2]-X[1]),1,Ae);
    if(x<X[3])return Ae;
    if(x<X[4])return cosA((x-X[3])/(X[4]-X[3]),Ae,r2);
    return cosA((x-X[4])/(X[5]-X[4]),r2,AD*Ae);}
  const AD=1.5; // diffuser exit area / test-section area
  const xNoz=(A,Ae)=>X[1]+(X[2]-X[1])*cosInv(A,1,Ae), xDif=(A,Ae,r2)=>X[4]+(X[5]-X[4])*cosInv(A,r2,AD*Ae);
  // exit pressure (p_exit/p0) with a normal shock of upstream Mach Ms and subsonic flow to the exit area Ad
  const after=(Ms,Ad,Astar1)=>{const n=NS(Ms,G),A2=Astar1/n.p0r;return {q:n.p0r*pp0(Msub(Ad/A2),G),A2,n};};
  function bis(f,lo,hi,target,dec){for(let i=0;i<90;i++){const m=(lo+hi)/2,v=f(m);if((v>target)===dec)lo=m;else hi=m;}return (lo+hi)/2;}
  // characteristic pressure ratios for this tunnel
  function solveAll(Me,r2){
    const Ae=AoAs(Me,G),Ad=AD*Ae,req=1/NS(Me,G).p0r,swallow=r2>=req-1e-9;
    const Pchoke=1/pp0(Msub(Ad),G);
    const Mcap=swallow?Me:bis(m=>NS(m,G).p0r,1,Me,1/r2,true); // second throat chokes when A2* = r2
    const Pcap=1/after(Mcap,Ad,1).q;          // start (swallow) or the point where the second throat chokes
    const Prun=1/after(Msup(r2),Ad,1).q;      // started, shock at the second throat
    const Pexit=1/after(Msup(Ad),Ad,1).q;     // started, shock at the diffuser exit
    return {Ae,Ad,req,swallow,Pchoke,Mcap,Ps:Pcap,Prun,Pexit};}
  function solve(Me,r2,P){
    const k=solveAll(Me,r2),q=1/P,st=Object.assign({},k);
    if(started&&P<k.Prun-1e-9) started=false;
    if(!started&&k.swallow&&P>=k.Ps) started=true;
    if(started){
      if(P<=k.Pexit){const s=bis(a=>after(Msup(a),k.Ad,1).q,r2,k.Ad,q,true);st.state='started';st.s2=s;st.Ms2=Msup(s);st.n2=NS(st.Ms2,G);st.A3=1/st.n2.p0r;}
      else st.state='started-supersonic';
      return st;}
    if(P<=k.Pchoke){st.state='subsonic';st.Astar=k.Ad/AoAs(Mfromp(q,G),G);return st;}
    if(P<=k.Ps){const Ms=bis(m=>after(m,k.Ad,1).q,1,k.Mcap,q,true);st.state=Ms>Me-1e-6?'shock-test':'shock-nozzle';st.Ms=Ms;st.n=NS(Ms,G);st.A2=1/st.n.p0r;return st;}
    // unstarted: second throat choked, first shock frozen at Mcap
    st.state='unstarted';st.Ms=k.Mcap;st.n=NS(k.Mcap,G);st.A2=r2;
    const q2=q/st.n.p0r, qsub=pp0(Msub(k.Ad/r2),G), qex=(()=>{const n2=NS(Msup(k.Ad/r2),G);return n2.p0r*pp0(Msub(k.Ad/(r2/n2.p0r)),G);})();
    if(q2<qsub&&q2>qex){const s=bis(a=>{const n2=NS(Msup(a/r2),G);return n2.p0r*pp0(Msub(k.Ad/(r2/n2.p0r)),G);},r2,k.Ad,q2,true);st.s2=s;st.Ms2=Msup(s/r2);st.n2=NS(st.Ms2,G);st.A3=r2/st.n2.p0r;}
    else if(q2<=qex) st.exitSup=true;
    return st;}
  function Mx(st,x,Ae,r2){
    const A=area(x,Ae,r2),thr=X[1],d2=X[4];
    if(st.state==='subsonic') return Msub(A/st.Astar);
    if(x<=thr) return Msub(A);
    if(st.state==='started'||st.state==='started-supersonic'){
      if(st.state==='started'&&x>d2&&A>=st.s2) return Msub(A/st.A3);
      return Msup(A);}
    // shock in nozzle / test section / unstarted
    const xs=st.Ms>=S.M-1e-6?(X[2]+X[3])/2:xNoz(AoAs(st.Ms,G),Ae);
    if(x<xs) return Msup(A);
    if(st.state!=='unstarted') return Msub(A/st.A2);
    if(x<=d2) return Msub(A/r2);
    if(st.s2&&A>=st.s2) return Msub(A/st.A3);
    return Msup(A/r2);}
  const names={subsonic:'Subsonic throughout: nozzle throat not choked','shock-nozzle':'Starting: normal shock moving through the nozzle','shock-test':'Starting: normal shock in the test section',unstarted:'Unstarted: second throat too small, shock stuck in the nozzle',started:'Started: supersonic test section, shock in the diffuser','started-supersonic':'Started: shock blown out of the diffuser exit'};
  const msgs={subsonic:'p<sub>0</sub>/p<sub>B</sub> is too low to choke the nozzle throat. The tunnel behaves like a venturi.',
    'shock-nozzle':'The nozzle throat is choked. A normal shock stands in the nozzle and moves downstream as p<sub>0</sub>/p<sub>B</sub> rises. The test section is subsonic.',
    'shock-test':'The shock has reached the test section at its full strength, M = M<sub>e</sub>. This is the largest total-pressure loss of the start-up; the second throat is just passing the flow behind it.',
    unstarted:'The second throat choked before the shock reached the test section. Its area fixes p<sub>0,2</sub>/p<sub>0,1</sub> = A<sub>t,1</sub>/A<sub>t,2</sub>, so the shock stays at the same Mach number in the nozzle no matter how high p<sub>0</sub>/p<sub>B</sub> goes. Enlarge the second throat to start the tunnel.',
    started:'The shock was swallowed: it jumped through the second throat into the diverging diffuser. The test section runs at M<sub>e</sub>. Lower p<sub>0</sub>/p<sub>B</sub> and the tunnel keeps running down to the running minimum, below the starting value. With the tunnel started you can also close the second throat to lower the running pressure, as a variable-geometry diffuser does.',
    'started-supersonic':'p<sub>0</sub>/p<sub>B</sub> is high enough that the diffuser flow leaves supersonic; the shock has moved out of the exit. The tunnel runs, but the reservoir pressure is wasted.'};
  // presets
  presets('ts_pre',[['M<sub>e</sub> 2.5, second throat large enough',{M:2.5,r2:2.1,P:1}],['M<sub>e</sub> 2.5, second throat too small',{M:2.5,r2:1.8,P:1}],['M<sub>e</sub> 3.5, minimum second throat',{M:3.5,r2:+(1/NS(3.5,1.4).p0r).toFixed(3),P:1}]],S,()=>{started=false;stop();});
  function stop(){if(anim){cancelAnimationFrame(anim.id);anim=null;$('ts_run').textContent='Run start-up, then shut down';}}
  $('ts_reset').onclick=()=>{stop();started=false;S.set({P:1});};
  $('ts_run').onclick=()=>{if(anim){stop();return;}
    started=false;const k=solveAll(S.M,S.r2),top=Math.min(+$('ts_P_r').max,Math.max(k.Ps,k.Pchoke)*1.25),T=16000;anim={t0:null,id:0};$('ts_run').textContent='Stop';
    const step=ts=>{if(!anim)return;if(anim.t0===null)anim.t0=ts;const u=Math.min(1,(ts-anim.t0)/T),v=u<0.5?u*2:2-u*2;
      S.set({P:1+(top-1)*(1-Math.cos(Math.PI*v))/2});if(u<1)anim.id=requestAnimationFrame(step);else stop();};
    anim.id=requestAnimationFrame(step);};
  ['ts_P','ts_P_r','ts_r2','ts_r2_r','ts_M','ts_M_r'].forEach(id=>$(id).addEventListener('input',stop));
  renderers.push(go);
  function render(){
    const Me=S.M,r2=Math.max(1,S.r2),P=Math.max(1,S.P),Ae=AoAs(Me,G),st=solve(Me,r2,P);
    $('ts_state_short').textContent=started?'started':'not started';
    $('ts_msg').innerHTML=P<=1+1e-6?'<div class="banner info"><b>No flow</b><span>With p<sub>0</sub> = p<sub>B</sub> there is no pressure difference to drive the tunnel. Raise p<sub>0</sub>/p<sub>B</sub> or press Run.</span></div>':`<div class="banner ${st.state==='unstarted'?'warn':'info'}"><b>${names[st.state]}</b><span>${msgs[st.state]}</span></div>`;
    // tunnel drawing, colored by Mach number
    const W=760,H=230,yc=112,x0=40,x1=720,PX=x=>x0+x*(x1-x0),hh=A=>84*Math.sqrt(A/(AD*Ae)),N=241;
    const pts=[];for(let i=0;i<N;i++){const x=i/(N-1);pts.push({x,A:area(x,Ae,r2),M:Mx(st,x,Ae,r2)});}
    const Mmax=Math.max(Me,1.2);
    const top=pts.map(p=>[PX(p.x),yc-hh(p.A)]),bot=pts.map(p=>[PX(p.x),yc+hh(p.A)]);
    const stops=pts.map(p=>`<stop offset="${(p.x*100).toFixed(2)}%" style="stop-color:color-mix(in srgb, var(--comp) ${fx(100*Math.min(1,p.M/Mmax))}%, var(--exp))"/>`).join('');
    let s=`<defs><linearGradient id="tsgrad" gradientUnits="userSpaceOnUse" x1="${PX(0)}" y1="0" x2="${PX(1)}" y2="0">${stops}</linearGradient></defs>`;
    s+=`<polygon points="${top.concat(bot.slice().reverse()).map(p=>fx(p[0])+','+fx(p[1])).join(' ')}" style="fill:url(#tsgrad)" opacity=".5"/>`;
    s+=wall(top,-1)+wall(bot,1);
    const lab=(x,t)=>tx([PX(x),18],t,'axlab','text-anchor="middle"');
    s+=lab((X[0]+X[2])/2,'nozzle')+lab((X[2]+X[3])/2,'test section')+lab((X[3]+X[5])/2,'diffuser');
    s+=tx([PX(X[1]),yc+hh(1)+24],'A<tspan font-size="9" dy="3">t,1</tspan>','axlab','text-anchor="middle"')+tx([PX(X[4]),yc+hh(r2)+24],'A<tspan font-size="9" dy="3">t,2</tspan>','axlab','text-anchor="middle"');
    s+=`<path d="M${fx(PX(0.47))},${yc-5} l-28,5 l28,5 z" style="fill:var(--body)" opacity=".6"/>`;
    const shock=(x,A,label)=>ln([PX(x),yc-hh(A)],[PX(x),yc+hh(A)],'comp',3)+tx([PX(x),yc+hh(A)+16],label,'tick','text-anchor="middle" style="fill:var(--comp)"');
    if(['shock-nozzle','shock-test','unstarted'].includes(st.state)){
      const xs=st.Ms>=Me-1e-6?(X[2]+X[3])/2:xNoz(AoAs(st.Ms,G),Ae);s+=shock(xs,area(xs,Ae,r2),'M = '+f(st.Ms,2));}
    if(st.s2){const xs=xDif(st.s2,Ae,r2);s+=shock(xs,st.s2,'M = '+f(st.Ms2,2));}
    s+=tx([12,yc+4],'p₀','flab')+tx([W-6,yc+4],'p<tspan font-size="9" dy="3">B</tspan>','flab','text-anchor="end"');
    $('ts_fig').innerHTML=s;
    // Mach chart
    const Hc=220,m={l:58,r:40,t:12,b:34},ph=Hc-m.t-m.b,ymax=Math.ceil(Mmax*2)/2+0.5,Y=v=>m.t+(ymax-v)/ymax*ph;
    let c='';
    for(let v=0;v<=ymax+1e-9;v+=0.5)c+=`<line x1="${m.l}" x2="${x1}" y1="${fx(Y(v))}" y2="${fx(Y(v))}" class="gridl"/><text x="${m.l-8}" y="${fx(Y(v)+4)}" text-anchor="end" class="tick">${f(v,1)}</text>`;
    [X[1],X[2],X[3],X[4]].forEach(x=>c+=`<line x1="${fx(PX(x))}" x2="${fx(PX(x))}" y1="${m.t}" y2="${Hc-m.b}" style="stroke:var(--mach)" stroke-dasharray="3 4"/>`);
    c+=`<line x1="${m.l}" x2="${x1}" y1="${fx(Y(1))}" y2="${fx(Y(1))}" style="stroke:var(--ink)" stroke-dasharray="2 3"/>`+tx([x1+4,Y(1)+4],'M = 1','tick','style="fill:var(--ink)"');
    c+=`<text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">M</text>`;
    let d='';pts.forEach((p,i)=>{const prev=pts[i-1];const jump=prev&&Math.abs(p.M-prev.M)>0.15;d+=(i&&!jump?'L':(i?'L':'M'))+fx(PX(p.x))+','+fx(Y(p.M));});
    c+=`<path d="${d}" fill="none" style="stroke:var(--accent)" stroke-width="2.6" stroke-linejoin="round"/>`;
    $('ts_Mx').innerHTML=c;
    const k=st;
    $('ts_out').innerHTML=readout([
      ['Nozzle area ratio, A<sub>e</sub>/A<sub>t,1</sub>',f(Ae,3)],
      ['Second throat needed to start, p<sub>0,1</sub>/p<sub>0,2</sub> at M<sub>e</sub>',`${f(k.req,3)} <em class="muted">${k.swallow?'yours is large enough':'yours is too small'}</em>`,'hl'],
      ['p<sub>0</sub>/p<sub>B</sub> to choke the nozzle throat',f(k.Pchoke,3)],
      [k.swallow?'p<sub>0</sub>/p<sub>B</sub> to start (swallow the shock)':'p<sub>0</sub>/p<sub>B</sub> at which the second throat chokes',f(k.Ps,3)],
      ['Minimum running p<sub>0</sub>/p<sub>B</sub> once started (shock at the second throat)',`${f(k.Prun,3)} <em class="muted">M = ${f(Msup(r2),3)} there</em>`],
      ['Current p<sub>0</sub>/p<sub>B</sub>',f(P,3)]]);
  }
  fixRange();
})();

/* =====================================================================
   Section 10.6 · Lambda-shock schematic (static)
   ===================================================================== */
(function(){
  const W=380,H=300,pf='vsm';
  let s=markers(pf);
  // upper wall of a diverging nozzle (sloping up to the right); flow left to right; centerline at the bottom
  const wallY=x=>70-0.06*x, cl=270;
  const wpts=[];for(let x=0;x<=380;x+=10)wpts.push([x,wallY(x)]);
  s+=wall(wpts,-1)+ln([0,cl],[380,cl],'mach',1,'stroke-dasharray="2 4"')+tx([6,cl-6],'centerline','tick');
  // boundary layer: thin, thickening ahead of the shock, separated bubble behind S
  const S=150, bl=x=>x<S-40?10:x<S?10+(x-(S-40))*0.25:x<300?20+30*Math.sin(Math.PI*Math.min(1,(x-S)/170)):30;
  let blp='M0,'+fx(wallY(0)+10);for(let x=0;x<=380;x+=5)blp+=` L${x},${fx(wallY(x)+bl(x))}`;
  s+=`<path d="${blp}" fill="none" style="stroke:var(--stream)" stroke-width="1.4" stroke-dasharray="5 3"/>`;
  let bub=`M${S},${fx(wallY(S)+bl(S)*0.2)}`;for(let x=S;x<=320;x+=5)bub+=` L${x},${fx(wallY(x)+bl(x))}`;bub+=` L320,${fx(wallY(320))} L${S},${fx(wallY(S))} Z`;
  s+=`<path d="${bub}" style="fill:var(--mach)" opacity=".18"/>`+tx([235,wallY(235)+22],'separated','tick','text-anchor="middle"');
  // lambda shock: front oblique leg from separation point, rear leg, triple point, normal stem to the centerline
  const Sp=[S,wallY(S)+bl(S)], T=[S+70,135], R=[S+105,wallY(S+105)+bl(S+105)];
  s+=ln(Sp,T,'comp',2.4)+ln(R,T,'comp',2.4)+ln(T,[T[0]+8,cl],'comp',3);
  s+=`<circle cx="${fx(T[0])}" cy="${fx(T[1])}" r="3.5" style="fill:var(--ink)"/>`+tx([T[0]+10,T[1]+16],'triple point','tick','style="fill:var(--ink)"');
  s+=tx([S-6,Sp[1]+14],'S','flab','text-anchor="end"')+tx([T[0]+14,210],'normal shock','tick','style="fill:var(--comp)"')+tx([S-30,118],'λ shock','flab','style="fill:var(--comp)"');
  s+=arrow([20,180],[90,180],'muted',pf,1.6)+tx([20,170],'M > 1','tick','style="fill:var(--ink)"')+arrow([280,248],[340,250],'muted',pf,1.6)+tx([282,240],'M < 1','tick','style="fill:var(--ink)"');
  s+=tx([20,wallY(20)+28],'boundary layer','tick','style="fill:var(--stream)"');
  $('vs_fig').innerHTML=s;
})();

/* =====================================================================
   Self-check quiz
   ===================================================================== */
(function(){
  const Q=[
    ['Subsonic flow enters a converging duct. Its velocity…',['decreases','increases','stays the same','becomes sonic immediately'],1,'For M &lt; 1, M² − 1 &lt; 0, so dA &lt; 0 gives du &gt; 0 (Eq. 10.25). A converging duct accelerates subsonic flow.'],
    ['Supersonic flow enters a converging duct. Its velocity…',['increases','decreases','stays the same','jumps through a shock'],1,'For M &gt; 1, dA and du have the same sign, so a converging duct decelerates supersonic flow. This is how a supersonic diffuser works.'],
    ['In isentropic quasi-one-dimensional flow, where can M = 1 occur?',['Anywhere the area changes','Only at the exit','Only at a minimum area (the throat)','Only at a maximum area'],2,'With M = 1, Eq. (10.25) forces dA = 0. Physically this is a minimum of area: the flow cannot accelerate through M = 1 at an area maximum.'],
    ['Which Mach numbers satisfy A/A* = 2 for γ = 1.4?',['0.306 and 2.197','0.5 and 2.0','1.0 only','0.2 and 2.96'],0,'Equation (10.32) has a subsonic root and a supersonic root for every A/A* &gt; 1: M = 0.306 and M = 2.197.'],
    ['The nozzle is choked. You lower the back pressure further. The mass flow…',['increases','decreases','stays the same','drops to zero'],2,'Once the throat is sonic, pressure signals from downstream cannot travel upstream through it. The mass flow stays at ṁ = ρ*u*A<sub>t</sub> (Figure 10.14).'],
    ['The back pressure lies between p<sub>e5</sub> and p<sub>e1</sub>. What does the flow do?',['Subsonic everywhere, not choked','A normal shock stands inside the diverging section','Oblique shocks at the exit','Expansion fans at the exit'],1,'Between the shock-at-exit pressure and the critical subsonic pressure, a normal shock stands in the diverging section and the subsonic flow behind it exits at p<sub>e</sub> = p<sub>B</sub>.'],
    ['A nozzle is overexpanded (p<sub>e6</sub> &lt; p<sub>B</sub> &lt; p<sub>e5</sub>). What waves form at the exit?',['Expansion fans','A normal shock inside','Oblique shocks','No waves'],2,'The jet leaves below the back pressure, so oblique shocks at the lips compress it up to p<sub>B</sub> (Figure 10.16d).'],
    ['A normal shock stands in the diverging section. Compared with the sonic area upstream, the sonic area A* downstream of the shock is…',['smaller','the same','larger','zero'],2,'Mass flow and T<sub>0</sub> are unchanged but p<sub>0</sub> drops, so p<sub>0,1</sub>A<sub>1</sub>* = p<sub>0,2</sub>A<sub>2</sub>* gives A<sub>2</sub>* &gt; A<sub>1</sub>*.'],
    ['In Example 10.3, p<sub>e</sub> = 0.973 atm with p<sub>0</sub> = 1 atm and A<sub>e</sub>/A<sub>t</sub> = 2. The throat Mach number is…',['exactly 1','about 0.43','about 2.2','about 0.2'],1,'p<sub>e</sub> is above p<sub>e1</sub> = 0.937 atm, so the throat is not sonic. A* is smaller than A<sub>t</sub>, A<sub>t</sub>/A* = 1.50, and M<sub>t</sub> = 0.43.'],
    ['The second throat of a wind tunnel is smaller than p<sub>0,1</sub>/p<sub>0,2</sub> evaluated at M<sub>e</sub>. What happens as the operator keeps raising p<sub>0</sub>/p<sub>B</sub>?',['The tunnel eventually starts','The second throat chokes and the shock stays at the same place in the nozzle','The test section becomes supersonic but the diffuser stays subsonic','The mass flow keeps increasing without limit'],1,'Once the second throat is sonic, its area fixes p<sub>0,2</sub>/p<sub>0,1</sub> = A<sub>t,1</sub>/A<sub>t,2</sub>, which fixes the shock Mach number and so its position. The tunnel is unstarted; only a larger second throat (or a variable-geometry diffuser) can start it.'],
    ['Why can a started tunnel run at a lower p<sub>0</sub>/p<sub>B</sub> than it needed to start?',['The nozzle throat grows after start-up','After start-up the shock sits in the diffuser at a lower Mach number, so its total-pressure loss is smaller','Viscous losses disappear once the flow is supersonic','The back pressure rises after start-up'],1,'During start-up the shock passes through the test section at M<sub>e</sub>, its strongest. Once swallowed it settles near the second throat, where the Mach number is lower, so less reservoir pressure is lost.'],
    ['Why must the second throat of a supersonic wind tunnel be larger than the first?',['To accelerate the flow again','To pass the same mass flow at the lower total pressure behind the start-up shock','To reduce the test-section Mach number','To create an expansion fan'],1,'During start-up a normal shock passes through the test section. With lower p<sub>0</sub>, the same mass flow needs a larger sonic area: A<sub>t,2</sub>/A<sub>t,1</sub> = p<sub>0,1</sub>/p<sub>0,2</sub>.']];
  const box=$('quiz'),ans={};
  box.innerHTML=Q.map((q,i)=>`<div class="qitem" role="group" aria-labelledby="qt${i}"><p class="qt" id="qt${i}"><span class="qn">${i+1}</span>${q[0]}</p><div class="opts">${q[1].map((o,j)=>`<label id="ql${i}_${j}"><input type="radio" name="q${i}" value="${j}"> <span>${o}</span></label>`).join('')}</div><p class="fb" id="qf${i}" hidden></p></div>`).join('');
  const score=()=>{const n=Object.keys(ans).length,c=Object.values(ans).filter(Boolean).length;$('q_score').textContent=n?`Score: ${c} / ${n} answered (${Q.length} total)`:'';};
  Q.forEach((q,i)=>{box.querySelectorAll(`input[name="q${i}"]`).forEach(inp=>inp.addEventListener('change',()=>{
    const j=+inp.value,ok=j===q[2];ans[i]=ok;
    q[1].forEach((_,k)=>{const l=$(`ql${i}_${k}`);l.classList.remove('right','wrong');if(k===q[2])l.classList.add('right');else if(k===j)l.classList.add('wrong');});
    const fb=$('qf'+i);fb.hidden=false;fb.className='fb '+(ok?'ok':'no');fb.innerHTML=`<b>${ok?'Correct.':'Not quite.'}</b> ${q[3]}`;score();}));});
})();

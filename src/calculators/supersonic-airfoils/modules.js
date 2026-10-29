/* =====================================================================
   Supersonic airfoils: shock-expansion theory for a flat plate, a wedge and a
   diamond airfoil, compared with linear (Ackeret) theory. Carried over from the
   calculator site; the oblique-shock and Prandtl–Meyer functions now come from
   the shared core.js.
   ===================================================================== */
(function(){
"use strict";
const D=Math.PI/180, R=180/Math.PI, $=id=>document.getElementById(id);

/* ---------------- gas dynamics ----------------
   Shared, table-checked functions from core.js: turn(M, theta, g) gives an oblique shock
   (weak solution) for theta > 0 and a Prandtl–Meyer expansion for theta < 0; numax(g). */
const GAM=()=>G;   /* gamma from the top bar (helpers.js / lesson.js) */

/* ---------------- geometry ---------------- */
function geom(cs,P){
  if(cs==='flat') return {tc:0,e1:0,e2:0,xm:1};
  if(cs==='wedge'){const d=P.mode==='ang'?P.ang*D:Math.atan(P.tc/2);return {tc:2*Math.tan(d),e1:d,e2:0,xm:1,pb:P.pb};}
  const xm=P.xm; let tc,e1;
  if(P.mode==='ang'){e1=P.ang*D; tc=2*xm*Math.tan(e1);} else {tc=P.tc; e1=Math.atan(tc/2/xm);}
  return {tc,xm,e1,e2:Math.atan(tc/2/(1-xm))};
}
/* mean square surface slope per surface (for Ackeret thickness drag) */
function slopeSq(cs,G){
  if(cs==='flat') return 0;
  if(cs==='wedge') return Math.pow(G.tc/2,2);
  return G.tc*G.tc/4*(1/G.xm+1/(1-G.xm));
}

/* ---------------- full solution ---------------- */
// face: {id,name,wave,from,P,M,A,B,side,draw:{pt,phiIn,phiOut,dir}}
function solve(cs,P,alphaDeg,M,g){
  const a=alphaDeg*D, G=geom(cs,P);
  const out={cs,G,a,ok:true,issues:[],warns:[],faces:[]};
  const fail=(w,name)=>{
    if(w.type==='detached'){out.ok=false;out.issues.push({k:'bad',t:`Shock detached on the ${name}.`,d:`Required turning θ = ${f(w.theta*R,2)}° exceeds θ<sub>max</sub> = ${f(w.thmax*R,2)}° for M = ${f(w.M1,3)}. A bow shock stands off the leading edge and shock-expansion theory does not apply. Reduce α or the thickness, or raise M<sub>∞</sub>.`});return true;}
    if(w.type==='vacuum'){out.ok=false;out.issues.push({k:'bad',t:`Expansion limit reached on the ${name}.`,d:`ν would exceed ν<sub>max</sub> = ${f(numax(g)*R,2)}°; the flow cannot turn this far.`});return true;}
    return false;};
  const LE=[0,0];
  if(cs==='flat'){
    const wu=turn(M,-a,g), wl=turn(M,a,g);
    out.faces=[
      {id:'1',name:'Upper surface',wave:wu,from:'∞',A:LE,B:[1,0],side:'up',draw:{pt:LE,phiIn:0,phiOut:-a,dir:1}},
      {id:'2',name:'Lower surface',wave:wl,from:'∞',A:LE,B:[1,0],side:'low',draw:{pt:LE,phiIn:0,phiOut:-a,dir:-1}}];
    if(fail(wu,'upper surface')|fail(wl,'lower surface')) return out;
  } else if(cs==='wedge'){
    const wu=turn(M,G.e1-a,g), wl=turn(M,G.e1+a,g), h=G.tc/2;
    out.faces=[
      {id:'1',name:'Upper surface',wave:wu,from:'∞',A:LE,B:[1,h],side:'up',draw:{pt:LE,phiIn:0,phiOut:G.e1-a,dir:1}},
      {id:'2',name:'Lower surface',wave:wl,from:'∞',A:LE,B:[1,-h],side:'low',draw:{pt:LE,phiIn:0,phiOut:-(G.e1+a),dir:-1}},
      {id:'b',name:'Base',wave:{type:'base'},from:'—',A:[1,h],B:[1,-h],side:'base'}];
    if(fail(wu,'upper surface')|fail(wl,'lower surface')) return out;
  } else {
    const w1=turn(M,G.e1-a,g), w3=turn(M,G.e1+a,g), h=G.tc/2, US=[G.xm,h], LS=[G.xm,-h], TE=[1,0];
    const f1={id:'1',name:'Upper front',wave:w1,from:'∞',A:LE,B:US,side:'up',draw:{pt:LE,phiIn:0,phiOut:G.e1-a,dir:1}};
    const f3={id:'3',name:'Lower front',wave:w3,from:'∞',A:LE,B:LS,side:'low',draw:{pt:LE,phiIn:0,phiOut:-(G.e1+a),dir:-1}};
    out.faces=[f1,null,f3,null];
    if(fail(w1,'upper front face')|fail(w3,'lower front face')){out.faces=[f1,f3];return out;}
    [['upper',w1],['lower',w3]].forEach(([n,w])=>{if(w.M2<=1){out.ok=false;out.issues.push({k:'bad',t:`Flow behind the ${n} leading-edge shock is subsonic (M = ${f(w.M2,3)}).`,d:'This is the strong-shock neighborhood just below detachment. The shoulder turn is no longer a Prandtl–Meyer fan, so the rear-face pressure cannot be found this way.'});}});
    if(!out.ok){out.faces=[f1,f3];return out;}
    const w2=turn(w1.M2,-(G.e1+G.e2),g), w4=turn(w3.M2,-(G.e1+G.e2),g);
    out.faces=[f1,{id:'2',name:'Upper rear',wave:w2,from:'1',A:US,B:TE,side:'up',draw:{pt:US,phiIn:G.e1-a,phiOut:-G.e2-a,dir:1}},
               f3,{id:'4',name:'Lower rear',wave:w4,from:'3',A:LS,B:TE,side:'low',draw:{pt:LS,phiIn:-(G.e1+a),phiOut:G.e2-a,dir:-1}}];
    if(fail(w2,'upper shoulder')|fail(w4,'lower shoulder')) return out;
  }
  // subsonic behind a front shock on flat plate / wedge: warn only
  if(cs!=='diamond') out.faces.forEach(F=>{if(F.wave.type==='shock'&&F.wave.M2<1) out.warns.push({k:'warn',t:`Flow on the ${F.name.toLowerCase()} is subsonic (M = ${f(F.wave.M2,3)}).`,d:'The shock is still attached, but the trailing edge can now influence the surface flow, so the uniform-pressure result is approximate.'});});
  // pressures
  const byId={};
  out.faces.forEach(F=>{
    if(F.side==='base'){F.P=G.pb;F.M=NaN;}
    else{const up=F.from==='∞'?1:byId[F.from].P;F.P=up*F.wave.p21;F.M=F.wave.M2;}
    byId[F.id]=F;});
  const q=g/2*M*M, ca=Math.cos(a), sa=Math.sin(a);
  let Np=0,Ap=0,cm=0;
  out.faces.forEach(F=>{
    const dx=F.B[0]-F.A[0],dy=F.B[1]-F.A[1],l=Math.hypot(dx,dy),tx=dx/l,ty=dy/l;
    let n=[-ty,tx];
    if((F.side==='up'&&n[1]<0)||(F.side==='low'&&n[1]>0)||(F.side==='base'&&n[0]<0)) n=[-n[0],-n[1]];
    const Fx=-F.P*l*n[0], Fy=-F.P*l*n[1];
    const gx=-(F.P-1)*l*n[0], gy=-(F.P-1)*l*n[1];
    const mx=(F.A[0]+F.B[0])/2, my=(F.A[1]+F.B[1])/2;
    Object.assign(F,{l,n,F:F.P*l,Nc:Fy,Ac:Fx,Lc:-Fx*sa+Fy*ca,Dc:Fx*ca+Fy*sa,Cp:(F.P-1)/q});
    Np+=Fy; Ap+=Fx; cm+=-(mx*gy-my*gx);
  });
  const Lp=Np*ca-Ap*sa, Dp=Np*sa+Ap*ca, cn=Np/q, cA=Ap/q, cmLE=cm/q;
  Object.assign(out,{q,Np,Ap,Lp,Dp,cl:Lp/q,cd:Dp/q,cn,cA,cmLE,cmc4:cmLE+0.25*cn,xcp:Math.abs(cn)>1e-12?-cmLE/cn:NaN});
  return out;
}
function linear(cs,P,alphaDeg,M,g){
  const B=Math.sqrt(M*M-1), a=alphaDeg*D, G=geom(cs,P), S=slopeSq(cs,G);
  let cl=4*a/B, cd=4/B*(a*a+S);
  if(cs==='wedge'){const cab=-((G.pb-1)/(g/2*M*M))*G.tc; cl-=cab*Math.sin(a); cd+=cab*Math.cos(a);}
  return {cl,cd,ld:cl/cd,cmc4:-a/B};
}

/* ---------------- formatting ---------------- */
function f(x,d=4){if(!isFinite(x))return '—';const v=Math.abs(x)<0.5*Math.pow(10,-d)?0:x;return v.toFixed(d).replace('-','−');}
function eng(x){if(!isFinite(x))return '—';const a=Math.abs(x);const d=a>=1000?0:a>=10?1:a>=1?2:3;
  return x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).replace('-','−');}
const deg=r=>f(r*R,2)+'°';

/* ---------------- state + controls ---------------- */
const S={cs:'flat',M:3,alpha:15,pinf:101325,chord:1,
  wedge:{mode:'ang',ang:5,tc:0.175,pb:1},
  diamond:{mode:'ang',ang:10,tc:0.1763,xm:0.5}};
const caseNames={flat:'Flat plate',wedge:'Wedge',diamond:'Diamond'};
const hashOf={flat:'flat-plate',wedge:'wedge',diamond:'diamond'};
const caseOfHash={'flat-plate':'flat',wedge:'wedge',diamond:'diamond'};
let chartVar='cl';
try{const v=localStorage.getItem('airfoil-chart');if(v)chartVar=v;}catch(e){}
const GP=()=>S.cs==='flat'?null:S[S.cs];

function syncInputs(){
  ['M','alpha'].forEach(k=>{$(k).value=+(+S[k]).toFixed(k==='alpha'?1:2);$(k+'_r').value=S[k];});
  $('pinf').value=S.pinf; $('chord').value=S.chord;
  const cs=S.cs, P=GP();
  document.querySelectorAll('.case').forEach(b=>b.setAttribute('aria-selected',b.dataset.case===cs));
  document.querySelectorAll('[data-case]:not(.case)').forEach(el=>el.hidden=el.dataset.case!==cs);
  $('flatNote').hidden=cs!=='flat'; $('geomBox').hidden=cs==='flat';
  if(P){
    $('mode_ang').setAttribute('aria-pressed',P.mode==='ang');$('mode_tc').setAttribute('aria-pressed',P.mode==='tc');
    $('box_ang').hidden=P.mode!=='ang'; $('box_tc').hidden=P.mode!=='tc';
    $('angLabel').innerHTML=cs==='wedge'?'Wedge half-angle, δ <small>deg</small>':'Leading-edge half-angle, ε<sub>1</sub> <small>deg</small>';
    $('mode_ang').textContent=cs==='wedge'?'Half-angle δ':'Half-angle ε';
    $('ang').value=+P.ang.toFixed(2); $('ang_r').value=P.ang;
    $('tc').value=+P.tc.toFixed(4); $('tc_r').value=P.tc;
    $('box_xm').hidden=cs!=='diamond'; if(cs==='diamond'){$('xm').value=+P.xm.toFixed(2);$('xm_r').value=P.xm;}
    $('baseBox').hidden=cs!=='wedge'; if(cs==='wedge'){$('pb').value=+P.pb.toFixed(2);$('pb_r').value=P.pb;}
  }
  renderPresets();
}
function bindPair(k,get,set){
  $(k+'_r').addEventListener('input',e=>{set(+e.target.value);$(k).value=e.target.value;schedule();});
  $(k).addEventListener('input',e=>{const v=parseFloat(e.target.value);if(isFinite(v)){set(v);$(k+'_r').value=v;schedule();}});
}
['M','alpha'].forEach(k=>bindPair(k,()=>S[k],v=>S[k]=v));
['ang','tc','xm','pb'].forEach(k=>bindPair(k,()=>GP()[k],v=>{const P=GP();if(P)P[k]=v;}));
['pinf','chord'].forEach(k=>$(k).addEventListener('input',e=>{const v=parseFloat(e.target.value);if(isFinite(v)&&v>0){S[k]=v;schedule();}}));
$('pbReset').onclick=()=>{S.wedge.pb=1;syncInputs();schedule();};
function setMode(m){const P=GP();if(!P||m===P.mode)return;const G=geom(S.cs,P);
  if(m==='tc') P.tc=+G.tc.toFixed(4); else P.ang=+(G.e1*R).toFixed(2);
  P.mode=m; syncInputs(); schedule();}
$('mode_ang').onclick=()=>setMode('ang'); $('mode_tc').onclick=()=>setMode('tc');

function setCase(cs,updateHash=true){
  if(!caseNames[cs]) return;
  S.cs=cs; syncInputs(); render();
  if(updateHash){try{history.replaceState(null,'','#'+hashOf[cs]);}catch(e){location.hash=hashOf[cs];}}
}
document.querySelectorAll('.case').forEach(b=>b.onclick=()=>setCase(b.dataset.case));
window.addEventListener('hashchange',()=>{const c=caseOfHash[location.hash.slice(1)];if(c&&c!==S.cs)setCase(c,false);});

const presets={
  flat:[['M 3, α 15°',{M:3,alpha:15}],['M 2, α 5°',{M:2,alpha:5}],['α = 0 (no force)',{M:2.5,alpha:0}],['Detached shock',{M:1.5,alpha:15}]],
  wedge:[['M 3, δ 5°, α 15°',{M:3,alpha:15,g:{mode:'ang',ang:5,pb:1}}],['α = 0 (pure wave drag)',{M:2.5,alpha:0,g:{mode:'ang',ang:5,pb:1}}],['Base drag, p_b = 0.5 p∞',{M:2,alpha:0,g:{mode:'ang',ang:8,pb:0.5}}],['Detached shock',{M:2,alpha:10,g:{mode:'ang',ang:15,pb:1}}]],
  diamond:[['M 3, ε 10°, α 15°',{M:3,alpha:15,g:{mode:'ang',ang:10,xm:0.5}}],['α = 0 (pure wave drag)',{M:2.5,alpha:0,g:{mode:'ang',ang:5,xm:0.5}}],['Thin, M 2, α 4°',{M:2,alpha:4,g:{mode:'tc',tc:0.05,xm:0.5}}],['Detached shock',{M:2,alpha:15,g:{mode:'ang',ang:10,xm:0.5}}]]};
function renderPresets(){
  $('presets').innerHTML=presets[S.cs].map((p,i)=>`<button type="button" data-i="${i}">${p[0].replace('p_b','p<sub>b</sub>')}</button>`).join('');
  $('presets').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=presets[S.cs][+b.dataset.i][1];S.M=p.M;S.alpha=p.alpha;if(p.g)Object.assign(S[S.cs],p.g);syncInputs();schedule();});
}
document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{chartVar=b.dataset.c;try{localStorage.setItem('airfoil-chart',chartVar);}catch(e){}renderChart();});

let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;render();});}

/* ---------------- rendering ---------------- */
function geomText(cs,G){
  if(cs==='flat') return 't/c = 0';
  if(cs==='wedge') return `δ = ${deg(G.e1)}, t/c = ${f(G.tc,3)}${Math.abs(G.pb-1)>1e-9?`, p<sub>b</sub>/p<sub>∞</sub> = ${f(G.pb,2)}`:''}`;
  return `ε<sub>1</sub> = ${deg(G.e1)}, t/c = ${f(G.tc,3)}, x<sub>m</sub>/c = ${f(G.xm,2)}`;
}
function render(){
  if(!(S.M>1)){ $('banners').innerHTML=`<div class="banner bad"><b>M<sub>∞</sub> must be greater than 1.</b><span>Shock-expansion theory needs supersonic freestream flow.</span></div>`; return; }
  const cs=S.cs, P=GP(), G=geom(cs,P);
  if(cs==='wedge') $('geomDerived').innerHTML=`<span>Half-angle δ</span><b>${deg(G.e1)}</b><span>t/c (base height)</span><b>${f(G.tc,4)}</b><span>Base pressure p<sub>b</sub>/p<sub>∞</sub></span><b>${f(G.pb,3)}</b>`;
  if(cs==='diamond') $('geomDerived').innerHTML=`<span>t/c</span><b>${f(G.tc,4)}</b><span>ε<sub>1</sub> (front)</span><b>${deg(G.e1)}</b><span>ε<sub>2</sub> (rear)</span><b>${deg(G.e2)}</b><span>Shoulder turn ε<sub>1</sub>+ε<sub>2</sub></span><b>${deg(G.e1+G.e2)}</b>`;
  const sol=solve(cs,P,S.alpha,S.M,GAM()), lin=linear(cs,P,S.alpha,S.M,GAM());
  let bn=sol.issues.concat(sol.warns).map(i=>`<div class="banner ${i.k}"><b>${i.t}</b><span>${i.d}</span></div>`).join('');
  if(sol.ok){const near=sol.faces.some(F=>F.wave.type==='shock'&&F.wave.theta>0.92*F.wave.thmax);
    if(near) bn+=`<div class="banner warn"><b>Close to shock detachment.</b><span>A leading-edge deflection is within 8% of θ<sub>max</sub>. Results are valid, but small changes will detach the shock.</span></div>`;}
  $('banners').innerHTML=bn;
  drawFigure(sol);
  renderTiles(sol,lin);
  renderCompare();
  renderTable(sol);
  renderSteps(sol);
  renderForces(sol);
  renderChart();
}

function renderTiles(sol,lin){
  const t=(k,v,lv,d=4)=>{
    let diff='';
    if(sol.ok&&isFinite(lv)&&Math.abs(lv)>1e-9&&isFinite(v)) diff=` (${(v/lv-1)>=0?'+':'−'}${Math.abs((v/lv-1)*100).toFixed(1)}%)`;
    return `<div class="tile"><span class="k">${k}</span><span class="v">${sol.ok&&isFinite(v)?f(v,d):'—'}</span><span class="s">linear ${f(lv,d)}${diff}</span></div>`;};
  $('tiles').innerHTML=t('Lift coefficient, c<sub>l</sub>',sol.cl,lin.cl)+t('Drag coefficient, c<sub>d</sub>',sol.cd,lin.cd)+t('Lift-to-drag, L/D',sol.cl/sol.cd,lin.ld,3)+t('Moment, c<sub>m,c/4</sub>',sol.cmc4,lin.cmc4);
}
function renderCompare(){
  let h=`<thead><tr><th class="l">Case</th><th class="l">Geometry</th><th>c<sub>l</sub></th><th>c<sub>d</sub></th><th>L/D</th><th>c<sub>m,c/4</sub></th><th>x<sub>cp</sub>/c</th></tr></thead><tbody>`;
  ['flat','wedge','diamond'].forEach(cs=>{const P=cs==='flat'?null:S[cs], so=solve(cs,P,S.alpha,S.M,GAM());
    const v=x=>so.ok?x:NaN;
    h+=`<tr class="pick${cs===S.cs?' cur':''}" data-go="${cs}" tabindex="0"><td>${caseNames[cs]}</td><td class="l">${geomText(cs,geom(cs,P))}</td><td>${f(v(so.cl),4)}</td><td>${f(v(so.cd),4)}</td><td>${f(v(so.cl/so.cd),3)}</td><td>${f(v(so.cmc4),4)}</td><td>${f(v(so.xcp),3)}</td></tr>`;});
  $('cmpTable').innerHTML=h+'</tbody>';
  $('cmpTable').querySelectorAll('tr[data-go]').forEach(r=>{r.onclick=()=>setCase(r.dataset.go);r.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setCase(r.dataset.go);}};});
}

function chip(w){return w.type==='shock'?'<span class="chip shock">shock</span>':w.type==='exp'?'<span class="chip exp">expansion</span>':w.type==='none'?'<span class="chip none">Mach wave</span>':w.type==='base'?'<span class="chip base">prescribed</span>':'<span class="chip shock">'+w.type+'</span>';}
function renderTable(sol){
  const c=S.chord, pi=S.pinf;
  let h=`<thead><tr><th class="l">Face</th><th class="l">Wave onto face</th><th>θ (deg)</th><th>M<sub>i</sub></th><th>p<sub>i</sub>/p<sub>∞</sub></th><th>C<sub>p,i</sub></th><th>ℓ<sub>i</sub> (m)</th><th>F<sub>i</sub> (N/m)</th><th>ΔL′ (N/m)</th><th>ΔD′ (N/m)</th></tr></thead>`;
  if(!sol.ok){$('surfTable').innerHTML=h+`<tbody><tr><td colspan="10" style="color:var(--muted)">No valid solution for these inputs. See the message above.</td></tr></tbody>`;return;}
  let b='<tbody>';
  sol.faces.forEach(F=>{
    b+=`<tr><td>${F.id} · ${F.name}</td><td class="l">${chip(F.wave)}</td><td>${F.side==='base'?'—':f(F.wave.theta*R,2)}</td><td>${f(F.M,4)}</td><td>${f(F.P,4)}</td><td>${f(F.Cp,4)}</td><td>${f(F.l*c,4)}</td><td>${eng(F.F*pi*c)}</td><td>${eng(F.Lc*pi*c)}</td><td>${eng(F.Dc*pi*c)}</td></tr>`;});
  b+=`</tbody><tfoot><tr><td colspan="8">Sum over the faces</td><td>L′ = ${eng(sol.Lp*pi*c)}</td><td>D′ = ${eng(sol.Dp*pi*c)}</td></tr></tfoot>`;
  $('surfTable').innerHTML=h+b;
}

function waveLines(w,M1lbl,M2lbl,upLbl,downLbl){
  const r=[];
  if(w.type==='shock'){
    r.push(['Turning angle θ',`${deg(w.theta)} <em>toward the flow → compression → oblique shock</em>`]);
    r.push(['θ<sub>max</sub> at '+M1lbl,`${deg(w.thmax)} <em>θ &lt; θ<sub>max</sub>, shock attached</em>`]);
    r.push(['Shock angle β',`<span class="hl">${deg(w.beta)}</span> <em>weak solution of θ–β–M</em>`]);
    r.push(['M<sub>n,1</sub> = '+M1lbl+' sin β',f(w.Mn1,4)]);
    r.push([`p<sub>${downLbl}</sub>/p<sub>${upLbl}</sub>`,`<span class="hl">${f(w.p21,4)}</span>`]);
    r.push(['M<sub>n,2</sub>',f(w.Mn2,4)]);
    r.push([M2lbl+' = M<sub>n,2</sub>/sin(β−θ)',f(w.M2,4)]);
    r.push(['p<sub>0,2</sub>/p<sub>0,1</sub>',`${f(w.p0r,4)} <em>total-pressure loss across the shock</em>`]);
  } else if(w.type==='exp'){
    r.push(['Turning angle θ',`${deg(w.theta)} <em>away from the flow → Prandtl–Meyer expansion of ${deg(w.dth)}</em>`]);
    r.push(['ν('+M1lbl+')',deg(w.nu1)]);
    r.push(['ν('+M2lbl+') = ν('+M1lbl+') + |θ|',deg(w.nu2)]);
    r.push([M2lbl+' <em>(invert ν)</em>',f(w.M2,4)]);
    r.push(['Fan edges μ<sub>1</sub>, μ<sub>2</sub>',`${deg(w.mu1)}, ${deg(w.mu2)}`]);
    r.push([`p<sub>${downLbl}</sub>/p<sub>${upLbl}</sub>`,`<span class="hl">${f(w.p21,4)}</span> <em>isentropic, p<sub>0</sub> unchanged</em>`]);
  } else if(w.type==='none'){
    r.push(['Turning angle θ','0° <em>face aligned with the flow; only a Mach wave at μ = '+deg(w.mu1)+'</em>']);
    r.push([`p<sub>${downLbl}</sub>/p<sub>${upLbl}</sub>`,'1']);
  }
  return r;
}
const calcHTML=rows=>'<div class="calc">'+rows.map(([q,a])=>`<span class="q">${q}</span><span class="a">${a}</span>`).join('')+'</div>';
function whyText(cs,F,G){
  const al=f(S.alpha,2)+'°';
  if(cs==='flat') return F.id==='1'
    ? `The upper surface lies along the chord, at α = ${al} to the freestream. The flow must turn θ<sub>1</sub> = −α: away from itself (expansion) for α &gt; 0, toward itself (shock) for α &lt; 0.`
    : `The lower surface also lies along the chord, but the flow approaches it from below. The flow must turn θ<sub>2</sub> = +α: a compression for α &gt; 0.`;
  if(cs==='wedge') return F.id==='1'
    ? `The upper face is inclined δ = ${deg(G.e1)} to the chord, with the chord at α = ${al}. The flow must turn θ<sub>1</sub> = δ − α.`
    : F.id==='2' ? `The lower face is inclined δ the other way, so the flow must turn θ<sub>2</sub> = δ + α. Positive α makes this compression stronger.`
    : `The base faces downstream into separated flow. Shock-expansion theory cannot predict its pressure, so it is prescribed (change it under Advanced: base pressure).`;
  return {'1':`The freestream meets a face inclined ε<sub>1</sub> = ${deg(G.e1)} to the chord, with the chord at α = ${al}. The flow must turn θ<sub>1</sub> = ε<sub>1</sub> − α.`,
    '2':`Flow on face 1 (M<sub>1</sub>) turns around the upper shoulder by ε<sub>1</sub> + ε<sub>2</sub> = ${deg(G.e1+G.e2)}, always away from itself, so this is always an expansion. Then p<sub>2</sub>/p<sub>∞</sub> = (p<sub>2</sub>/p<sub>1</sub>)(p<sub>1</sub>/p<sub>∞</sub>).`,
    '3':`The lower front face is inclined ε<sub>1</sub> the other way, so the flow must turn θ<sub>3</sub> = ε<sub>1</sub> + α. Positive α makes this compression stronger.`,
    '4':`Flow on face 3 (M<sub>3</sub>) expands around the lower shoulder by ε<sub>1</sub> + ε<sub>2</sub> = ${deg(G.e1+G.e2)} (rear half-angle ε<sub>2</sub> = ${deg(G.e2)}). Then p<sub>4</sub>/p<sub>∞</sub> = (p<sub>4</sub>/p<sub>3</sub>)(p<sub>3</sub>/p<sub>∞</sub>).`}[F.id];
}
function renderSteps(sol){
  const cs=sol.cs, G=sol.G;
  $('stepsIntro').innerHTML={
    flat:'Each surface is flat, so the pressure on it is uniform. For α &gt; 0 the upper surface sees a Prandtl–Meyer expansion at the leading edge and the lower surface sees an oblique shock. The pressure difference between them is the lift.',
    wedge:'Each face is flat, so the pressure on it is uniform. Both faces see the freestream directly. The base pressure is prescribed rather than computed.',
    diamond:'Each face is flat, so the pressure on it is uniform. Find the wave that turns the flow onto the face, then apply the shock or Prandtl–Meyer relations. The front faces see the freestream; each rear face sees the flow leaving the front face above or below it.'}[cs];
  // list of faces to show, including uncomputed ones on failure
  const ids=cs==='flat'?['1','2']:cs==='wedge'?['1','2','b']:['1','2','3','4'];
  const names={flat:{1:'Upper surface',2:'Lower surface'},wedge:{1:'Upper surface',2:'Lower surface',b:'Base'},diamond:{1:'Upper front',2:'Upper rear',3:'Lower front',4:'Lower rear'}}[cs];
  let n=0;
  const cards=ids.map(id=>{
    n++;
    const F=sol.faces.find(x=>x&&x.id===id);
    const valid=F&&(F.side==='base'||['shock','exp','none'].includes(F.wave.type));
    const why=whyText(cs,F||{id},G);
    let body;
    if(!valid||(!sol.ok&&!F)) body='<p class="why" style="color:var(--bad)">Not computed: see the message above.</p>';
    else if(F.side==='base'){
      body=calcHTML([['p<sub>b</sub>/p<sub>∞</sub>',`<span class="hl">${f(G.pb,4)}</span> <em>${Math.abs(G.pb-1)<1e-9?'default: base adds no force':'user-prescribed'}</em>`],['Base height t',`${f(G.tc*S.chord,4)} m`],['C<sub>p,b</sub>',sol.ok?f(F.Cp,4):'—']]);
    } else {
      const up=F.from, down=F.id;
      const rows=waveLines(F.wave,'M<sub>'+up+'</sub>','M<sub>'+down+'</sub>',up,down);
      if(sol.ok){
        if(up!=='∞') rows.push([`p<sub>${down}</sub>/p<sub>∞</sub>`,`<span class="hl">${f(F.P,4)}</span>`]);
        rows.push([`C<sub>p,${down}</sub> = 2(p<sub>${down}</sub>/p<sub>∞</sub> − 1)/(γM<sub>∞</sub><sup>2</sup>)`,f(F.Cp,4)]);
      }
      body=calcHTML(rows);
    }
    return `<div class="step"><div class="hd"><h3>Step ${n}: Face ${id}, ${names[id].toLowerCase()}</h3>${valid?chip(F.wave):''}</div><p class="why">${why}</p>${body}</div>`;
  });
  $('steps').innerHTML=cards.join('');
}
function renderForces(sol){
  if(!sol.ok){$('forceCalc').innerHTML='<span class="q">No valid solution</span><span class="a">—</span>';return;}
  const pi=S.pinf,c=S.chord,G=sol.G,qd=sol.q*pi,cs=sol.cs;
  const geo=cs==='flat'?`c = ${f(c,4)} m`:cs==='wedge'?`c = ${f(c,4)} m, t/2 = ${f(G.tc/2*c,4)} m, t = ${f(G.tc*c,4)} m`:`x<sub>m</sub> = ${f(G.xm*c,4)} m, c − x<sub>m</sub> = ${f((1-G.xm)*c,4)} m, t/2 = ${f(G.tc/2*c,4)} m`;
  const rows=[
    ['Geometry',geo],
    [sol.faces.map(F=>`p<sub>${F.id}</sub>`).join(', ')+' (Pa)',sol.faces.map(F=>eng(F.P*pi)).join(', ')],
    ['N′ normal force',`${eng(sol.Np*pi*c)} N/m`],
    ['A′ axial force',`${eng(sol.Ap*pi*c)} N/m`],
    ['L′ = N′cos α − A′sin α',`<span class="hl">${eng(sol.Lp*pi*c)} N/m</span>`],
    ['D′ = N′sin α + A′cos α',`<span class="hl">${eng(sol.Dp*pi*c)} N/m</span>`],
    ['q<sub>∞</sub> = (γ/2) p<sub>∞</sub> M<sub>∞</sub><sup>2</sup>',`${eng(qd)} Pa`],
    ['c<sub>n</sub>, c<sub>a</sub> (body axes)',`${f(sol.cn,4)}, ${f(sol.cA,4)}`],
    ['c<sub>l</sub> = L′/(q<sub>∞</sub>c)',`<span class="hl">${f(sol.cl,4)}</span>`],
    ['c<sub>d</sub> = D′/(q<sub>∞</sub>c)',`<span class="hl">${f(sol.cd,4)}</span>`],
    ['L/D',f(sol.cl/sol.cd,3)],
    ['c<sub>m,LE</sub> <em>(nose-up +)</em>',`${f(sol.cmLE,4)} <em>each face force acts at its midpoint</em>`],
    ['c<sub>m,c/4</sub> = c<sub>m,LE</sub> + c<sub>n</sub>/4',f(sol.cmc4,4)],
    ['x<sub>cp</sub>/c = −c<sub>m,LE</sub>/c<sub>n</sub>',`${f(sol.xcp,4)} <em>${cs==='flat'?'uniform pressure on each side: exactly 0.5':'linear theory: 0.5'}</em>`]
  ];
  $('forceCalc').innerHTML=calcHTML(rows).replace(/^<div class="calc">|<\/div>$/g,'');
}

/* ---------------- figure ---------------- */
function drawFigure(sol){
  const G=sol.G,a=sol.a,W=820,H=430,ch=360,ox=230,oy=215,cs=sol.cs;
  const toW=(x,y)=>[x*Math.cos(a)+y*Math.sin(a),-x*Math.sin(a)+y*Math.cos(a)];
  const P=(x,y)=>{const w=toW(x,y);return [ox+w[0]*ch,oy-w[1]*ch];};
  const ray=(p,ang,len)=>[p[0]+len*Math.cos(ang),p[1]-len*Math.sin(ang)];
  const ln=(p,q,attrs,extra='')=>`<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" ${attrs} ${extra}/>`;
  const mk=(id,col)=>`<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${col}"/></marker>`;
  let s=`<defs><clipPath id="clipF"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>${mk('arF','var(--muted)')}${mk('arC','var(--comp)')}${mk('arE','var(--exp)')}${mk('arN','var(--mach)')}${mk('arK','var(--accent)')}</defs><g clip-path="url(#clipF)">`;
  for(const y of [70,150,280,360]) s+=ln([20,y],[120,y],'stroke="var(--muted)" stroke-width="1.5"','marker-end="url(#arF)"');
  s+=`<text x="20" y="${oy+5}" class="axlab" style="font-family:var(--f-num)">M∞ = ${f(S.M,2)}</text>`;
  const LE=P(0,0);
  s+=ln(LE,[LE[0]+120,LE[1]],'stroke="var(--mach)" stroke-width="1" stroke-dasharray="3 4"');
  if(Math.abs(a)>0.3*D){const r=90,e=ray(LE,-a,r);s+=`<path d="M${LE[0]+r},${LE[1]} A${r},${r} 0 0 ${a>0?1:0} ${e[0].toFixed(1)},${e[1].toFixed(1)}" fill="none" stroke="var(--accent)" stroke-width="1.2"/><text x="${LE[0]+r+6}" y="${LE[1]+(a>0?16:-6)}" class="axlab" style="fill:var(--accent)">α</text>`;}
  const L=270;
  const drawWave=(w,d)=>{
    if(!w||!d) return '';
    const p=P(d.pt[0],d.pt[1]);
    if(w.type==='shock') return ln(p,ray(p,d.phiIn+d.dir*w.beta,L),'stroke="var(--comp)" stroke-width="2.4"');
    if(w.type==='exp'){let o='';const a1=d.phiIn+d.dir*w.mu1,a2=d.phiOut+d.dir*w.mu2;for(let k=0;k<6;k++){const t=k/5;o+=ln(p,ray(p,a1+(a2-a1)*t,L*0.9),'stroke="var(--exp)" stroke-width="'+(k===0||k===5?1.6:0.9)+'"');}return o;}
    if(w.type==='none') return ln(p,ray(p,d.phiIn+d.dir*w.mu1,L),'stroke="var(--mach)" stroke-width="1.2" stroke-dasharray="6 5"');
    return '';};
  sol.faces.forEach(F=>{if(F&&F.wave&&F.wave.type!=='detached'&&F.draw&&(sol.ok||F.from==='∞')) s+=drawWave(F.wave,F.draw);});
  if(!sol.ok&&sol.faces.some(F=>F&&F.wave&&F.wave.type==='detached'))
    s+=`<path d="M${LE[0]-10},${LE[1]-170} Q${LE[0]-46},${LE[1]} ${LE[0]-10},${LE[1]+170}" fill="none" stroke="var(--comp)" stroke-width="2.4" stroke-dasharray="10 6"/><text x="${LE[0]-150}" y="${LE[1]-150}" class="axlab" style="fill:var(--comp)">detached bow shock</text>`;
  // body
  const h=G.tc/2;
  if(cs==='flat'){const TE=P(1,0);s+=ln(LE,TE,'stroke="var(--body)" stroke-width="3.5" stroke-linecap="round"');}
  else{
    const pts=cs==='wedge'?[P(0,0),P(1,h),P(1,-h)]:[P(0,0),P(G.xm,h),P(1,0),P(G.xm,-h)];
    if(cs==='wedge'){ // separated base wake (schematic)
      const b1=P(1,h),b2=P(1,-h),tip=P(1+0.32,0);
      s+=`<path d="M${b1[0].toFixed(1)},${b1[1].toFixed(1)} Q${P(1.18,h*0.9)[0].toFixed(1)},${P(1.18,h*0.9)[1].toFixed(1)} ${tip[0].toFixed(1)},${tip[1].toFixed(1)} Q${P(1.18,-h*0.9)[0].toFixed(1)},${P(1.18,-h*0.9)[1].toFixed(1)} ${b2[0].toFixed(1)},${b2[1].toFixed(1)}" fill="var(--mach)" fill-opacity=".08" stroke="var(--mach)" stroke-width="1" stroke-dasharray="4 4"/>`;
      const wl=P(1.12,-h);s+=`<text x="${wl[0].toFixed(1)}" y="${(wl[1]+30).toFixed(1)}" class="axlab" font-size="12">separated base flow</text>`;
    }
    s+=`<polygon points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="var(--body)" fill-opacity=".14" stroke="var(--body)" stroke-width="2" stroke-linejoin="round"/>`;
    if(cs==='diamond') s+=ln(LE,P(1,0),'stroke="var(--body)" stroke-width="0.8" stroke-dasharray="2 3"');
  }
  // pressure arrows: always pointing into the face, length ∝ p/p_inf
  if(sol.ok){
    const pmax=Math.max(...sol.faces.map(F=>F.P),1e-6), k=62/pmax;
    sol.faces.forEach(F=>{
      const A=P(F.A[0],F.A[1]), B=P(F.B[0],F.B[1]);
      const nW=toW(F.n[0],F.n[1]), ns=[nW[0],-nW[1]];
      const len=F.P>1e-9?Math.max(F.P*k,9):0, gap=3;
      const col=F.P>1+1e-6?'var(--comp)':F.P<1-1e-6?'var(--exp)':'var(--mach)', m=F.P>1+1e-6?'arC':F.P<1-1e-6?'arE':'arN';
      const ts=F.side==='base'?[0.3,0.7]:[0.25,0.5,0.75];
      if(len>=3) ts.forEach(t=>{
        const b=[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t];
        s+=ln([b[0]+ns[0]*(len+gap),b[1]+ns[1]*(len+gap)],[b[0]+ns[0]*gap,b[1]+ns[1]*gap],`stroke="${col}" stroke-width="1.6"`,`marker-end="url(#${m})"`);});
      const mid=[(A[0]+B[0])/2,(A[1]+B[1])/2], d=len+(F.side==='base'?66:38);
      const lx=mid[0]+ns[0]*d, ly=mid[1]+ns[1]*d;
      const l2=F.side==='base'?'base (prescribed)':'M '+f(F.M,3);
      s+=`<g style="font-family:var(--f-num)" font-size="12.5"><rect x="${(lx-56).toFixed(1)}" y="${(ly-17).toFixed(1)}" width="112" height="32" rx="0" fill="var(--panel)" fill-opacity=".9" stroke="var(--line)"/><text x="${lx.toFixed(1)}" y="${(ly-3).toFixed(1)}" text-anchor="middle" fill="var(--ink)" font-weight="600">${F.id}: p/p∞ ${f(F.P,3)}</text><text x="${lx.toFixed(1)}" y="${(ly+11).toFixed(1)}" text-anchor="middle" fill="var(--muted)">${l2}</text></g>`;
    });
    if(isFinite(sol.xcp)&&Math.hypot(sol.cl,sol.cd)>1e-6){
      const mag=Math.hypot(sol.cl,sol.cd), sc=90/Math.max(mag,0.05);
      const xc=Math.min(Math.max(sol.xcp,-0.2),1.2), base=P(xc,0);
      const tip=[base[0]+sol.cd*sc,base[1]-sol.cl*sc];
      s+=ln(base,tip,'stroke="var(--accent)" stroke-width="2.6"','marker-end="url(#arK)"');
      s+=ln(base,[base[0],base[1]-sol.cl*sc],'stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3"');
      s+=ln(base,[base[0]+sol.cd*sc,base[1]],'stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3"');
      s+=`<text x="${(tip[0]+8).toFixed(1)}" y="${(tip[1]+4).toFixed(1)}" style="font-family:var(--f-body)" font-size="13" font-weight="600" fill="var(--accent)">R′</text>`;
    }
  }
  s+='</g>';
  $('fig').innerHTML=s;
}

/* ---------------- chart ---------------- */
let lastSweepKey=null, sweepCache=null;
function renderChart(){
  const P=GP();
  const key=[S.cs,S.M,GAM(),JSON.stringify(P)].join('|');
  if(key!==lastSweepKey){
    const arr=[];for(let al=-20;al<=25.0001;al+=0.25){const so=solve(S.cs,P,al,S.M,GAM()),li=linear(S.cs,P,al,S.M,GAM());
      arr.push({al,se:so.ok?{cl:so.cl,cd:so.cd,ld:so.cl/so.cd,cm:so.cmc4}:null,li:{cl:li.cl,cd:li.cd,ld:li.ld,cm:li.cmc4}});}
    sweepCache=arr; lastSweepKey=key;
  }
  document.querySelectorAll('[data-c]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===chartVar));
  const v=chartVar, W=820,H=340,m={l:64,r:20,t:16,b:44}, pw=W-m.l-m.r, ph=H-m.t-m.b;
  let ys=[];sweepCache.forEach(p=>{if(p.se&&isFinite(p.se[v]))ys.push(p.se[v]);if(isFinite(p.li[v]))ys.push(p.li[v]);});
  if(v==='ld'){const se=sweepCache.filter(p=>p.se&&isFinite(p.se.ld)).map(p=>Math.abs(p.se.ld));const ext=Math.max(...se,1)*1.3;ys=ys.map(y=>Math.max(-ext,Math.min(ext,y)));}
  let lo=Math.min(...ys),hi=Math.max(...ys);
  if(!isFinite(lo)||hi-lo<1e-9){lo=-1;hi=1;}
  const step=niceStep((hi-lo)/6); lo=Math.floor(lo/step)*step; hi=Math.ceil(hi/step)*step;
  const X=al=>m.l+(al+20)/45*pw, Y=y=>m.t+(hi-Math.min(Math.max(y,lo),hi))/(hi-lo)*ph;
  let s='';
  // invalid shading first
  let start=null;sweepCache.forEach((p,i)=>{const bad=!p.se;if(bad&&start===null)start=p.al;if((!bad||i===sweepCache.length-1)&&start!==null){const end=bad?p.al:p.al-0.25;s+=`<rect x="${X(start)}" y="${m.t}" width="${Math.max(2,X(end)-X(start))}" height="${ph}" fill="var(--bad)" fill-opacity=".08"/>`;start=null;}});
  for(let y=lo;y<=hi+step/2;y+=step){const yy=Y(y);s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${yy}" y2="${yy}" class="gridl"/><text x="${m.l-8}" y="${yy+4}" text-anchor="end" class="tick">${f(y,step<0.01?3:step<0.1?2:step<1?1:0)}</text>`;}
  for(let al=-20;al<=25;al+=5){const xx=X(al);s+=`<line x1="${xx}" x2="${xx}" y1="${m.t}" y2="${H-m.b}" class="gridl"/><text x="${xx}" y="${H-m.b+18}" text-anchor="middle" class="tick">${al}</text>`;}
  if(lo<0&&hi>0) s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(0)}" y2="${Y(0)}" class="axis"/>`;
  s+=`<line x1="${X(0)}" x2="${X(0)}" y1="${m.t}" y2="${H-m.b}" class="axis"/>`;
  s+=`<text x="${m.l+pw/2}" y="${H-6}" text-anchor="middle" class="axlab">angle of attack α (deg)</text>`;
  s+=`<text transform="translate(16 ${m.t+ph/2}) rotate(-90)" text-anchor="middle" class="axlab">${{cl:'c_l',cd:'c_d',ld:'L/D',cm:'c_m,c/4'}[v]} · ${caseNames[S.cs].toLowerCase()}</text>`;
  const path=get=>{let d='',pen=false;sweepCache.forEach(p=>{const y=get(p);if(isFinite(y)){d+=(pen?'L':'M')+X(p.al).toFixed(1)+','+Y(y).toFixed(1);pen=true;}else pen=false;});return d;};
  s+=`<path d="${path(p=>p.li[v])}" fill="none" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  s+=`<path d="${path(p=>p.se?p.se[v]:NaN)}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round"/>`;
  const cur=solve(S.cs,P,S.alpha,S.M,GAM());
  if(cur.ok&&S.alpha>=-20&&S.alpha<=25){const yv={cl:cur.cl,cd:cur.cd,ld:cur.cl/cur.cd,cm:cur.cmc4}[v];
    if(isFinite(yv)) s+=`<circle cx="${X(S.alpha)}" cy="${Y(yv)}" r="6" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/><text x="${X(S.alpha)+10}" y="${Y(yv)-10}" class="tick" style="fill:var(--ink)">α = ${f(S.alpha,1)}°, ${f(yv,3)}</text>`;}
  $('chart').innerHTML=s;
}
function niceStep(x){const p=Math.pow(10,Math.floor(Math.log10(x)));const n=x/p;return (n<1.5?1:n<3?2:n<7?5:10)*p;}

const initial=caseOfHash[location.hash.slice(1)]||'flat';
S.cs=initial; syncInputs(); render();
renderers.push(schedule);
})();

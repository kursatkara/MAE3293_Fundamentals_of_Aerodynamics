
/* =====================================================================
   Helpers shared by every interactive
   ===================================================================== */
const $=id=>document.getElementById(id);
function f(x,d=4){if(x===Infinity)return '∞';if(!isFinite(x))return '—';const v=Math.abs(x)<0.5*Math.pow(10,-d)?0:x;return v.toFixed(d).replace('-','−');}
const dg=(r,d=2)=>f(r*R,d)+'°';
let G=1.4;
const renderers=[];
function sched(fn){let p=false;return ()=>{if(p)return;p=true;requestAnimationFrame(()=>{p=false;fn();});};}
const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* slider + number pairs */
function controls(boxId,specs,onChange){
  const box=$(boxId), S={};
  box.innerHTML=specs.map(s=>`<div class="ctl" id="${s.id}_box"><label for="${s.id}" id="${s.id}_lab">${s.label}${s.unit?` <small>${s.unit}</small>`:''}</label><div class="row"><input type="range" id="${s.id}_r" min="${s.min}" max="${s.max}" step="${s.step}" aria-label="${s.aria||'slider'}"><input type="number" id="${s.id}" min="${s.nmin??s.min}" max="${s.nmax??s.max}" step="${s.step}"></div></div>`).join('');
  const show=(s,v)=>{$(s.id+'_r').value=v;$(s.id).value=+(+v).toFixed(s.dec??2);};
  specs.forEach(s=>{
    S[s.k]=s.v; show(s,s.v);
    const r=$(s.id+'_r'), n=$(s.id);
    r.addEventListener('input',()=>{S[s.k]=+r.value;n.value=+(+r.value).toFixed(s.dec??2);onChange();});
    n.addEventListener('input',()=>{const v=parseFloat(n.value);const lo=s.nmin??s.min,hi=s.nmax??s.max;if(isFinite(v)&&v>=lo&&v<=hi){S[s.k]=v;r.value=v;onChange();}});
  });
  Object.defineProperty(S,'set',{enumerable:false,value:o=>{for(const k in o){S[k]=o[k];const s=specs.find(x=>x.k===k);if(s)show(s,o[k]);}onChange();}});
  Object.defineProperty(S,'range',{enumerable:false,value:(k,min,max)=>{const s=specs.find(x=>x.k===k);const r=$(s.id+'_r');r.min=min;r.max=max;}});
  return S;
}
function presets(boxId,list,S,extra){
  const box=$(boxId);
  box.innerHTML=list.map((p,i)=>`<button type="button" data-i="${i}">${p[0]}</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=list[+b.dataset.i];if(extra)extra(p[1]);S.set(p[1]);});
}
const readout=rows=>rows.map(([q,a,c])=>`<span class="q">${q}</span><span class="a ${c||''}">${a}</span>`).join('');
const banner=(k,t,d)=>`<div class="banner ${k}"><b>${t}</b>${d?`<span>${d}</span>`:''}</div>`;
const trend=(v,d=4)=>!isFinite(v)?'—':v>1+1e-9?`${f(v,d)} <span class="up">↑</span>`:v<1-1e-9?`${f(v,d)} <span class="dn">↓</span>`:f(v,d);

/* SVG helpers (angles in radians, counter-clockwise from +x; screen y points down) */
const fx=v=>(+v).toFixed(1);
const col=c=>`var(--${c})`;
const ln=(a,b,c,w=1.6,extra='')=>`<line x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(b[0])}" y2="${fx(b[1])}" style="stroke:${col(c)}" stroke-width="${w}" ${extra}/>`;
const pl=(pts,c,w=1.6,extra='')=>`<polyline points="${pts.map(p=>fx(p[0])+','+fx(p[1])).join(' ')}" fill="none" style="stroke:${col(c)}" stroke-width="${w}" stroke-linejoin="round" ${extra}/>`;
const tx=(p,s,cls='flab',extra='')=>`<text x="${fx(p[0])}" y="${fx(p[1])}" class="${cls}" ${extra}>${s}</text>`;
const ray=(p,ang,len)=>[p[0]+len*Math.cos(ang),p[1]-len*Math.sin(ang)];
const add=(p,v)=>[p[0]+v[0],p[1]+v[1]];
function arc(c,r,a0,a1,color,w=1.2,extra=''){
  const p0=ray(c,a0,r),p1=ray(c,a1,r),large=Math.abs(a1-a0)>Math.PI?1:0,sweep=a1>a0?0:1;
  return `<path d="M${fx(p0[0])},${fx(p0[1])} A${r},${r} 0 ${large} ${sweep} ${fx(p1[0])},${fx(p1[1])}" fill="none" style="stroke:${col(color)}" stroke-width="${w}" ${extra}/>`;}
function markers(pf){return '<defs>'+['muted','comp','exp','mach','accent','stream','ink','body'].map(c=>`<marker id="${pf}-${c}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${col(c)}"/></marker>`).join('')+'</defs>';}
const arrow=(a,b,c,pf,w=1.8)=>ln(a,b,c,w,`marker-end="url(#${pf}-${c})"`);
function wall(pts,side=1){ // hatched wall; side=+1 hatches below/right of travel direction
  let s=pl(pts,'body',2.4);
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;
    const d=[(b[0]-a[0])/L,(b[1]-a[1])/L], n=[-d[1]*side,d[0]*side];
    for(let t=6;t<L;t+=13){const p=[a[0]+d[0]*t,a[1]+d[1]*t];s+=ln(p,[p[0]+n[0]*8-d[0]*5,p[1]+n[1]*8-d[1]*5],'mach',1);}
  }
  return s;}
const circ=(p,label,c='ink')=>`<g><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="12" style="fill:var(--panel);stroke:${col(c)}" stroke-width="1.4"/><text x="${fx(p[0])}" y="${fx(p[1]+4.5)}" text-anchor="middle" style="fill:${col(c)};font:600 13px var(--f-num)">${label}</text></g>`;
const clip=(id,W,H)=>`<clipPath id="${id}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>`;
function lineX(p,d,q,e){ // intersection of p+s*d and q+t*e ; returns s (or NaN)
  const den=d[0]*e[1]-d[1]*e[0]; if(Math.abs(den)<1e-12) return NaN;
  return ((q[0]-p[0])*e[1]-(q[1]-p[1])*e[0])/den;}
const dirv=a=>[Math.cos(a),-Math.sin(a)];
/* wave drawn from point p on a flow with incoming direction phiIn.
   dir=+1: wave lies above the flow (left-running); dir=-1: below (right-running). */
function waveSVG(p,phiIn,w,dir,L,opt={}){
  if(!w) return '';
  if(w.type==='shock') return ln(p,ray(p,phiIn+dir*w.beta,L),'comp',opt.w||2.4);
  if(w.type==='exp'||w.type==='isen'){
    const th=w.theta??-w.dth, phiOut=phiIn+dir*th, a1=phiIn+dir*w.mu1, a2=phiOut+dir*w.mu2, n=opt.n||6; let o='';
    for(let k=0;k<n;k++){const t=k/(n-1);o+=ln(p,ray(p,a1+(a2-a1)*t,L*0.92),w.type==='exp'?'exp':'comp',k===0||k===n-1?1.7:0.9);}
    return o;}
  if(w.type==='none') return ln(p,ray(p,phiIn+dir*w.mu1,L),'mach',1.3,'stroke-dasharray="6 5"');
  return '';}
/* streamline through a centered Prandtl–Meyer fan at corner C (screen), wall turning down by dTh, start height h above upstream wall */
function fanStream(C,M1,dTh,h,g,xmax){
  const n1=nu(M1,g), mu1=Math.asin(1/M1), w=pm(M1,dTh,g);
  if(w.type!=='exp') return null;
  const lam2=w.mu2-dTh; let x=h/Math.tan(mu1), y=h;
  const pts=[[0,C[1]-h],[C[0]+x,C[1]-y]];
  for(let it=0;it<6000;it++){
    const r=Math.hypot(x,y), lam=Math.atan2(y,x);
    if(lam<=lam2+1e-7) break;
    let lo=M1,hi=w.M2;
    for(let i=0;i<46;i++){const m=(lo+hi)/2;if(Math.asin(1/m)-(nu(m,g)-n1)>lam)lo=m;else hi=m;}
    const phi=-(nu((lo+hi)/2,g)-n1), ds=Math.max(0.5,r*0.012);
    x+=ds*Math.cos(phi); y+=ds*Math.sin(phi);
    if(it%3===0) pts.push([C[0]+x,C[1]-y]);
    if(C[0]+x>xmax) return pts;
  }
  pts.push([C[0]+x,C[1]-y]); pts.push([C[0]+x+900*Math.cos(dTh),C[1]-y+900*Math.sin(dTh)]);
  return pts;}


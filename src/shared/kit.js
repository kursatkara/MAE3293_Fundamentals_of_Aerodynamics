/* ---------- lesson kit: plots, known-quantity inversion, example tabs and tables (needs helpers.js) ---------- */
/* monotone inverse of fn on [lo,hi]; NaN when t is outside the range */
function inv(fn,t,lo,hi){const a=fn(lo),b=fn(hi);if(!isFinite(t)||(t-a)*(t-b)>0)return NaN;const up=b>a;for(let i=0;i<120;i++){const m=(lo+hi)/2;if((fn(m)<t)===up)lo=m;else hi=m;}return (lo+hi)/2;}
function sci(x,d=4){if(!isFinite(x))return '—';if(x===0)return '0';const e=Math.floor(Math.log10(Math.abs(x)));const m=x/Math.pow(10,e);return `${f(m,d-1)} × 10<sup>${e<0?'−'+(-e):e}</sup>`;}

/* plotting helpers */
function frame(o){ // o: x0,y0,w,h,xmin,xmax,ymin,ymax,log,xt,yt,xlab,ylab,fx,fy,noy
  const lx=o.log?Math.log10(o.ymin):0, hx=o.log?Math.log10(o.ymax):0;
  const X=v=>o.x0+(v-o.xmin)/(o.xmax-o.xmin)*o.w;
  const Y=o.log?v=>o.y0+o.h-(Math.log10(v)-lx)/(hx-lx)*o.h:v=>o.y0+o.h-(v-o.ymin)/(o.ymax-o.ymin)*o.h;
  let s='';
  (o.xt||[]).forEach(v=>{s+=`<line x1="${fx(X(v))}" x2="${fx(X(v))}" y1="${o.y0}" y2="${o.y0+o.h}" class="gridl"/>`;if(!o.nox)s+=`<text x="${fx(X(v))}" y="${o.y0+o.h+17}" text-anchor="middle" class="tick">${o.fx?o.fx(v):v}</text>`;});
  (o.yt||[]).forEach(v=>{s+=`<line x1="${o.x0}" x2="${o.x0+o.w}" y1="${fx(Y(v))}" y2="${fx(Y(v))}" class="gridl"/>`;if(!o.noy)s+=`<text x="${o.x0-7}" y="${fx(Y(v)+4)}" text-anchor="end" class="tick">${o.fy?o.fy(v):v}</text>`;});
  s+=`<rect x="${o.x0}" y="${o.y0}" width="${o.w}" height="${o.h}" fill="none" class="axis"/>`;
  if(o.xlab)s+=`<text x="${fx(o.x0+o.w/2)}" y="${o.y0+o.h+36}" text-anchor="middle" class="axlab">${o.xlab}</text>`;
  if(o.ylab)s+=`<text transform="translate(${fx(o.x0-(o.ylabdx||40))} ${fx(o.y0+o.h/2)}) rotate(-90)" text-anchor="middle" class="axlab">${o.ylab}</text>`;
  return {X,Y,svg:s,clipId:o.clip,clipDef:o.clip?`<clipPath id="${o.clip}"><rect x="${o.x0}" y="${o.y0}" width="${o.w}" height="${o.h}"/></clipPath>`:''};}
function curve(F,a,b,X,Y,n=240,ok){let d='',pen=false;for(let i=0;i<=n;i++){const x=a+(b-a)*i/n,y=F(x);if(!isFinite(y)||(ok&&!ok(y))){pen=false;continue;}d+=(pen?'L':'M')+fx(X(x))+','+fx(Y(y));pen=true;}return d;}
const path=(d,c,w=2,extra='')=>`<path d="${d}" fill="none" style="stroke:var(--${c})" stroke-width="${w}" stroke-linejoin="round" ${extra}/>`;
const dot=(p,c,r=5.5,hollow)=>`<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="${r}" style="${hollow?`fill:var(--panel);stroke:var(--${c})`:`fill:var(--${c})`}" stroke-width="2"/>`;
/* drag along x of a plot region to set a value */
function dragX(svgId,o,cb){
  const svg=$(svgId);let on=false;
  const set=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const c=svg.getScreenCTM();if(!c)return;const p=pt.matrixTransform(c.inverse());if(p.y<o.y0-10||p.y>o.y1+10)return;cb(Math.min(o.xmax,Math.max(o.xmin,o.xmin+(p.x-o.x0)/o.w*(o.xmax-o.xmin))));};
  svg.addEventListener('pointerdown',e=>{on=true;try{svg.setPointerCapture(e.pointerId);}catch(_){}set(e);});
  svg.addEventListener('pointermove',e=>{if(on)set(e);});
  ['pointerup','pointercancel'].forEach(ev=>svg.addEventListener(ev,()=>{on=false;}));}
/* "Known quantity": pick a tabulated ratio, type its value, the Mach number is found by inversion */
function known(boxId,list,getM,setM){
  const box=$(boxId),sid=boxId+'_sel',vid=boxId+'_val',nid=boxId+'_note';
  box.innerHTML=`<div class="ctl"><label for="${sid}">Known quantity</label><select id="${sid}">${list.map((q,i)=>`<option value="${i}">${q.label}</option>`).join('')}</select></div>`+
    `<div class="ctl"><label for="${vid}">Its value</label><div class="row"><input type="number" id="${vid}" step="any" style="width:100%"></div></div><p class="note" id="${nid}"></p>`;
  const sel=$(sid),val=$(vid),note=$(nid);
  const q=()=>list[+sel.value];
  const sync=()=>{if(document.activeElement!==val){const v=q().f(getM());val.value=isFinite(v)?+v.toFixed(4):'';}};
  const hint=()=>{note.textContent=q().hint||'';note.style.color='';};
  sel.addEventListener('change',()=>{hint();sync();});
  val.addEventListener('input',()=>{const v=parseFloat(val.value),M=q().inv(v);if(isFinite(M)){hint();setM(M);}else{note.textContent='Out of range. '+(q().hint||'');note.style.color='var(--bad)';}});
  hint();
  return {sync,set:(k,v)=>{const i=list.findIndex(x=>x.k===k);if(i<0)return;sel.value=i;val.value=v;hint();const M=list[i].inv(v);if(isFinite(M))setM(M);}};}
function tabset(id){const c=$(id),tabs=c.querySelectorAll('.tabs button');tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));c.querySelectorAll('[data-expanel]').forEach(p=>p.hidden=p.dataset.expanel!==b.dataset.ex);});}
/* worked-example table: Quantity | Relation used | Result | Tables (hand solution, hidden unless the switch is on).
   Row: [quantity, relation, result, hand value, highlight?, differs?] */
function exTable(id,rows,def,src){
  def=def&&Math.abs(G-1.4)<1e-9;  // the notes are hand solutions for gamma = 1.4
  let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Result</th><th class="hand">Tables, γ = 1.4</th></tr></thead><tbody>`;
  rows.forEach(r=>{if(r.sect){h+=`<tr><td class="l" colspan="4" style="padding-top:14px;color:var(--ink);font-weight:600">${r.sect}</td></tr>`;return;}
    h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[1]}</td><td class="${r[4]?'hl':''}">${r[2]}</td>${handCell(def&&r[3]!=null?r[3]:'—',def&&r[5])}</tr>`;});
  $(id).innerHTML=h+'</tbody>';}
const num=id=>parseFloat($(id).value), near=(a,b)=>Math.abs(a-b)<1e-9;
function watch(ids,fn){const g=sched(fn);ids.forEach(id=>$(id).addEventListener('input',g));renderers.push(g);}


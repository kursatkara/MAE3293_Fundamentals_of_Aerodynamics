/* =====================================================================
   Isentropic-flow calculator (Appendix A): one known quantity -> M -> all ratios
   Uses T0T and p0p (core.js) and AoAs, Mfromarea, Mfromp (quasi1d.js), all
   checked against Anderson's Appendix A in tools/check-tables.js.
   ===================================================================== */
(function(){
  const r0r=(M,g)=>Math.pow(T0T(M,g),1/(g-1));
  const MMAX=50;
  /* known quantities: value from M, and M from value (NaN when out of range) */
  const Q=[
    {k:'M',      label:'Mach number, M',            f:M=>M,              inv:v=>v>=0&&v<=MMAX?v:NaN, hint:'0 ≤ M ≤ 50'},
    {k:'T0T',    label:'T₀/T',                      f:M=>T0T(M,G),       inv:v=>v>=1?Math.sqrt(2/(G-1)*(v-1)):NaN, hint:'T₀/T ≥ 1'},
    {k:'p0p',    label:'p₀/p',                      f:M=>p0p(M,G),       inv:v=>v>=1?Mfromp(1/v,G):NaN, hint:'p₀/p ≥ 1'},
    {k:'r0r',    label:'ρ₀/ρ',                      f:M=>r0r(M,G),       inv:v=>v>=1?Math.sqrt(2/(G-1)*(Math.pow(v,G-1)-1)):NaN, hint:'ρ₀/ρ ≥ 1'},
    {k:'Asub',   label:'A/A*, subsonic branch',     f:M=>AoAs(M,G),      inv:v=>v>=1?Mfromarea(v,G,false):NaN, hint:'A/A* ≥ 1; gives M ≤ 1', sub:true},
    {k:'Asup',   label:'A/A*, supersonic branch',   f:M=>AoAs(M,G),      inv:v=>v>=1?Mfromarea(v,G,true):NaN, hint:'A/A* ≥ 1; gives M ≥ 1', sup:true}];
  const sel=$('is_sel'),val=$('is_val'),note=$('is_note');
  sel.innerHTML=Q.map((q,i)=>`<option value="${i}">${q.label}</option>`).join('');
  const q=()=>Q[+sel.value];
  let M=2,bad=false;   /* bad: the input is out of range, so the table shows dashes, not a stale result */
  const go=sched(render);
  function solve(){const v=parseFloat(val.value),m=q().inv(v);
    if(isFinite(m)&&m<=MMAX){M=m;bad=false;note.textContent=q().hint;note.style.color='';return true;}
    bad=true;note.textContent=(val.value===''?'Enter a value. ':'Out of range. ')+q().hint;note.style.color='var(--bad)';return false;}
  /* switching the known quantity keeps the current state: the box shows that quantity at the current M */
  sel.addEventListener('change',()=>{let m=M;const k=q();if(k.sub&&m>1)m=1;if(k.sup&&m<1)m=1;M=m;val.value=+k.f(M).toFixed(6);solve();go();});
  val.addEventListener('input',()=>{solve();go();});
  function setKnown(k,v){const i=Q.findIndex(x=>x.k===k);sel.value=i;val.value=v;solve();go();}
  [['<i>M</i> = 0.3, compressibility threshold','M',0.3],['<i>M</i> = 1, sonic conditions','M',1],['<i>M</i> = 2','M',2],['<i>p</i><sub>0</sub>/<i>p</i> = 3','p0p',3],['<i>A</i>/<i>A</i>* = 2, subsonic','Asub',2],['<i>A</i>/<i>A</i>* = 2, supersonic','Asup',2]].forEach(([t,k,v])=>{
    const b=document.createElement('button');b.type='button';b.innerHTML=t;b.onclick=()=>setKnown(k,v);$('is_pre').appendChild(b);});
  renderers.push(()=>{solve();go();});   /* γ changed: same known value, new M */
  const P={x0:58,y0:14,w:684,h:256};
  dragX('is_fig',{x0:P.x0,w:P.w,xmin:0,xmax:5,y0:P.y0,y1:P.y0+P.h},m=>setKnown('M',Math.round(m*100)/100));
  solve();

  function render(){
    const k=q(),V=x=>bad?NaN:x,A=AoAs(M,G),regime=M<1e-12?'fluid at rest':M<1-1e-9?'subsonic':M>1+1e-9?'supersonic':'sonic';
    $('is_short').textContent=`γ = ${f(G,3)}`;
    $('is_msg').innerHTML=bad||M>1e-12?'':banner('warn','M = 0: the fluid is at rest.','Every total-to-static ratio is 1, and A/A* is unbounded.');
    const rows=[
      ['M','Mach number',V(M),'M'],
      ['p<sub>0</sub>/p','(8.42)',V(p0p(M,G)),'p0p'],
      ['ρ<sub>0</sub>/ρ','(8.43)',V(r0r(M,G)),'r0r'],
      ['T<sub>0</sub>/T','(8.40)',V(T0T(M,G)),'T0T'],
      ['A/A*','(10.32)',V(A),'A']];
    const known=k.k==='Asub'||k.k==='Asup'?'A':k.k;
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Value</th></tr></thead><tbody>`;
    rows.forEach(r=>{h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[3]===known?'known':r[1]}</td><td class="${r[3]===known?'hl':''}">${f(r[2],4)}</td></tr>`;});
    h+=`<tr><td class="l" colspan="3" style="padding-top:12px;color:var(--ink);font-weight:600">Static-to-total ratios</td></tr>`;
    [['p/p<sub>0</sub>','1/(p<sub>0</sub>/p)',V(1/p0p(M,G))],['ρ/ρ<sub>0</sub>','1/(ρ<sub>0</sub>/ρ)',V(1/r0r(M,G))],['T/T<sub>0</sub>','1/(T<sub>0</sub>/T)',V(1/T0T(M,G))]].forEach(r=>{h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[1]}</td><td>${f(r[2],4)}</td></tr>`;});
    $('is_tab').innerHTML=(bad?'':`<caption style="caption-side:bottom;text-align:left;padding-top:8px;color:var(--muted)">The flow is ${regime}.</caption>`)+h+'</tbody>';
    /* figure: Anderson-style property curves on 0 <= M <= 5 */
    const F=frame({...P,xmin:0,xmax:5,ymin:0,ymax:1,xt:[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5],yt:[0,0.2,0.4,0.6,0.8,1],xlab:'Mach number M',ylab:'Ratio',fy:v=>v.toFixed(1),clip:'isc'});
    let g=`<defs>${F.clipDef}</defs>`+F.svg+`<g clip-path="url(#isc)">`;
    g+=ln([F.X(1),P.y0],[F.X(1),P.y0+P.h],'mach',1.2,'stroke-dasharray="6 4"');
    g+=path(curve(m=>1/p0p(m,G),0,5,F.X,F.Y),'comp',2.2)+path(curve(m=>1/r0r(m,G),0,5,F.X,F.Y),'stream',2.2)+path(curve(m=>1/T0T(m,G),0,5,F.X,F.Y),'warn',2.2)+path(curve(m=>m<=0?0:1/AoAs(m,G),0,5,F.X,F.Y),'exp',2.2)+'</g>';
    g+=tx([F.X(1)+6,P.y0+P.h-8],'M = 1','axlab');
    g+=tx([F.X(4.95),F.Y(1/T0T(4.95,G))-7],'T/T₀','flab','text-anchor="end" style="fill:var(--warn)"')+tx([F.X(3.05),F.Y(1/AoAs(3.05,G))-8],'A*/A','flab','style="fill:var(--exp)"')
      +tx([F.X(1.55),F.Y(1/p0p(1.55,G))+16],'p/p₀','flab','style="fill:var(--comp)"')+tx([F.X(1.62)+4,F.Y(1/r0r(1.62,G))-8],'ρ/ρ₀','flab','style="fill:var(--stream)"');
    if(bad){}
    else if(M<=5){g+=ln([F.X(M),P.y0],[F.X(M),P.y0+P.h],'accent',1.6);
      g+=dot([F.X(M),F.Y(1/p0p(M,G))],'comp',5)+dot([F.X(M),F.Y(1/r0r(M,G))],'stream',5)+dot([F.X(M),F.Y(1/T0T(M,G))],'warn',5)+(M>0?dot([F.X(M),F.Y(1/A)],'exp',5):'');}
    else g+=tx([P.x0+P.w-8,P.y0+18],`M = ${f(M,2)} is beyond the plotted range`,'axlab','text-anchor="end"');
    $('is_fig').innerHTML=g;
  }
})();

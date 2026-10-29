/* =====================================================================
   Normal-shock calculator (Appendix B): one known quantity -> M1 -> all ratios
   Uses NS and pitot (quasi1d.js, built on nsFromMn in core.js), checked against
   Anderson's Appendix B in tools/check-tables.js.
   ===================================================================== */
(function(){
  const H=50,ok=v=>v>=1&&v<=H;
  const Q=[
    {k:'M1', label:'M₁, upstream Mach number',   f:M=>M,              inv:v=>ok(v)?v:NaN,                           hint:'1 ≤ M₁ ≤ 50'},
    {k:'M2', label:'M₂, downstream Mach number', f:M=>NS(M,G).M2,     inv:v=>inv(M=>NS(M,G).M2,v,1,H),              hint:'√((γ−1)/(2γ)) < M₂ ≤ 1'},
    {k:'p21',label:'p₂/p₁',                      f:M=>NS(M,G).p21,    inv:v=>inv(M=>NS(M,G).p21,v,1,H),             hint:'p₂/p₁ ≥ 1'},
    {k:'r21',label:'ρ₂/ρ₁ = u₁/u₂',              f:M=>NS(M,G).r21,    inv:v=>inv(M=>NS(M,G).r21,v,1,H),             hint:'1 ≤ ρ₂/ρ₁ < (γ+1)/(γ−1)'},
    {k:'T21',label:'T₂/T₁',                      f:M=>NS(M,G).T21,    inv:v=>inv(M=>NS(M,G).T21,v,1,H),             hint:'T₂/T₁ ≥ 1'},
    {k:'p0r',label:'p₀,₂/p₀,₁',                  f:M=>NS(M,G).p0r,    inv:v=>inv(M=>NS(M,G).p0r,v,1,H),             hint:'0 < p₀,₂/p₀,₁ ≤ 1'},
    {k:'pit',label:'p₀,₂/p₁, Pitot ratio',       f:M=>pitot(M,G),     inv:v=>inv(M=>pitot(M,G),v,1,H),              hint:'p₀,₂/p₁ ≥ p₀/p at M = 1 (1.893 for γ = 1.4)'}];
  const sel=$('ns_sel'),val=$('ns_val'),note=$('ns_note');
  sel.innerHTML=Q.map((q,i)=>`<option value="${i}">${q.label}</option>`).join('');
  const q=()=>Q[+sel.value];
  let M=2,bad=false;   /* bad: the input is out of range, so the table shows dashes, not a stale result */
  const go=sched(render);
  function solve(){const v=parseFloat(val.value),m=q().inv(v);
    if(isFinite(m)){M=m;bad=false;note.textContent=q().hint;note.style.color='';return true;}
    bad=true;note.textContent=(val.value===''?'Enter a value. ':'Out of range. ')+q().hint;note.style.color='var(--bad)';return false;}
  sel.addEventListener('change',()=>{val.value=+q().f(M).toFixed(6);solve();go();});
  val.addEventListener('input',()=>{solve();go();});
  function setKnown(k,v){sel.value=Q.findIndex(x=>x.k===k);val.value=v;solve();go();}
  [['Ex 8.11, 8.12(a): <i>M</i><sub>1</sub> = 2','M1',2],['Ex 8.12(b): <i>M</i><sub>1</sub> = 4','M1',4],['Weak shock: <i>M</i><sub>1</sub> = 1.1','M1',1.1],['Ex 8.15: <i>p</i><sub>2</sub>/<i>p</i><sub>1</sub> = 4.5','p21',4.5],['Ex 8.16: <i>T</i><sub>2</sub>/<i>T</i><sub>1</sub> = 5.8','T21',5.8],['Ex 8.17: <i>M</i><sub>2</sub> = 0.4752','M2',0.4752]].forEach(([t,k,v])=>{
    const b=document.createElement('button');b.type='button';b.innerHTML=t;b.onclick=()=>setKnown(k,v);$('ns_pre').appendChild(b);});
  renderers.push(()=>{solve();go();});
  solve();

  function render(){
    const n=NS(M,G),pt=pitot(M,G),k=q().k,ds=-Math.log(n.p0r),V=x=>bad?NaN:x;
    $('ns_short').textContent=`γ = ${f(G,3)}`;
    /* schematic: arrow lengths proportional to u1 and u2 = u1 (rho1/rho2) */
    const pf='nsc';let s=markers(pf);
    s+=ln([380,22],[380,150],'comp',4);
    s+=circ([30,30],'1')+circ([730,30],'2');
    const L1=200,L2=L1/n.r21;
    [62,92,122].forEach(y=>{s+=arrow([150,y],[150+L1,y],'ink',pf,2.2)+arrow([410,y],[410+Math.max(L2,12),y],'ink',pf,2.2);});
    s+=tx([56,35],`M₁ = ${f(M,4)}`,'flab')+tx([704,35],`M₂ = ${f(n.M2,4)}`,'flab','text-anchor="end"');
    s+=tx([150,166],'u₁','axlab')+tx([410,166],`u₂ = u₁/${f(n.r21,3)}`,'axlab');
    s+=tx([370,166],'normal shock','axlab','text-anchor="end" style="fill:var(--comp)"');
    $('ns_sch').innerHTML=bad?tx([380,92],'Enter a value in range to draw the shock.','axlab','text-anchor="middle"'):s;
    const rows=[
      ['M<sub>1</sub>','upstream Mach number',V(M),'M1'],
      ['M<sub>2</sub>','(8.59)',V(n.M2),'M2'],
      ['p<sub>2</sub>/p<sub>1</sub>','(8.65)',V(n.p21),'p21'],
      ['ρ<sub>2</sub>/ρ<sub>1</sub> = u<sub>1</sub>/u<sub>2</sub>','(8.61)',V(n.r21),'r21'],
      ['T<sub>2</sub>/T<sub>1</sub>','(8.67)',V(n.T21),'T21'],
      ['p<sub>0,2</sub>/p<sub>0,1</sub>','e<sup>−(s<sub>2</sub>−s<sub>1</sub>)/R</sup>',V(n.p0r),'p0r'],
      ['p<sub>0,2</sub>/p<sub>1</sub>','Rayleigh Pitot formula (8.80)',V(pt),'pit']];
    let h=`<thead><tr><th class="l">Quantity</th><th class="l">Relation used</th><th>Value</th></tr></thead><tbody>`;
    rows.forEach(r=>{h+=`<tr><td class="l">${r[0]}</td><td class="rel">${r[3]===k?'known':r[1]}</td><td class="${r[3]===k?'hl':''}">${f(r[2],4)}</td></tr>`;});
    h+=`<tr><td class="l" colspan="3" style="padding-top:12px;color:var(--ink);font-weight:600">Also across the shock</td></tr>`;
    h+=`<tr><td class="l">T<sub>0,2</sub>/T<sub>0,1</sub></td><td class="rel">adiabatic: h<sub>0</sub> constant</td><td>${f(V(1),4)}</td></tr>`;
    h+=`<tr><td class="l">(s<sub>2</sub> − s<sub>1</sub>)/R</td><td class="rel">−ln(p<sub>0,2</sub>/p<sub>0,1</sub>)</td><td>${f(V(ds),4)}</td></tr>`;
    $('ns_tab').innerHTML=(!bad&&M<1+1e-9?`<caption style="caption-side:bottom;text-align:left;padding-top:8px;color:var(--muted)">At M₁ = 1 the shock reduces to a Mach wave: every ratio is 1.</caption>`:'')+h+'</tbody>';
  }
})();

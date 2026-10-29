/* Chapter 8 · Normal shock waves. Uses core.js (nsFromMn), quasi1d.js (pp0, TT0, rr0, AoAs, Mfromp, NS) and helpers.js. */
const hooks={};
const RAIR=287, ATM=101325;
const regime=M=>M<0.8?'subsonic':M<1.2?'transonic':M<5?'supersonic':'hypersonic';
const dsR=(M,g)=>{const n=NS(M,g);return g/(g-1)*Math.log(n.T21)-Math.log(n.p21);};  // (s2 - s1)/R, Eq. (8.68)
/* =====================================================================
   Static figures: control volume (8.2) and stationary sound wave (8.3)
   ===================================================================== */
(function(){
  const pf='be';let s=markers(pf);
  s+=ln([150,60],[270,60],'muted',1.3,'stroke-dasharray="6 4"')+ln([270,60],[270,232],'muted',1.3,'stroke-dasharray="6 4"')+ln([270,232],[150,232],'muted',1.3,'stroke-dasharray="6 4"')+ln([150,232],[150,60],'muted',1.3,'stroke-dasharray="6 4"');
  s+=ln([206,34],[206,256],'comp',2.6)+ln([214,34],[214,256],'comp',2.6);
  s+=tx([140,52],'b','flab','text-anchor="end"')+tx([280,52],'c','flab')+tx([140,248],'a','flab','text-anchor="end"')+tx([280,248],'d','flab');
  s+=circ([178,205],'1')+circ([242,205],'2');
  s+=arrow([14,160],[138,160],'ink',pf)+arrow([282,160],[404,160],'ink',pf)+tx([70,152],'u₁','flab','text-anchor="middle"')+tx([346,152],'u₂','flab','text-anchor="middle"');
  const L=['p₁, ρ₁, T₁','M₁, u₁','p₀,₁, h₀,₁, s₁'],Rr=['p₂, ρ₂, T₂','M₂, u₂','p₀,₂, h₀,₂, s₂'];
  s+=tx([12,72],'given','axlab')+L.map((t,i)=>tx([12,92+i*19],t,'flab','style="font-weight:500"')).join('');
  s+=tx([408,72],'unknown','axlab','text-anchor="end"')+Rr.map((t,i)=>tx([408,92+i*19],t,'flab','text-anchor="end" style="font-weight:500"')).join('');
  s+=tx([210,24],'normal shock','axlab','text-anchor="middle"')+tx([210,284],'faces ab and cd: area A, uniform flow','axlab','text-anchor="middle"');
  $('be_fig').innerHTML=s;
  const p2='sw';let w=markers(p2);
  w+=ln([210,24],[210,170],'mach',3);
  w+=arrow([30,112],[180,112],'ink',p2)+arrow([240,112],[392,112],'ink',p2);
  w+=tx([105,102],'a','flab','text-anchor="middle"')+tx([316,102],'a + da','flab','text-anchor="middle"');
  w+=['p','T','ρ'].map((t,i)=>tx([60+i*42,62],t,'flab','text-anchor="middle" style="font-weight:500"')).join('');
  w+=['p + dp','T + dT','ρ + dρ'].map((t,i)=>tx([266+i*58,62],t,'flab','text-anchor="middle" style="font-weight:500"')).join('');
  w+=tx([210,196],'sound wave held stationary; gas enters it at speed a','axlab','text-anchor="middle"');
  $('sw_fig').innerHTML=w;
})();

/* =====================================================================
   Interactive 1 · Speed of sound and Mach number in the standard atmosphere
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('sa_ctl',[
    {k:'z',id:'sa_z',label:'Altitude, z',unit:'km',min:0,max:30,step:0.1,v:0,nmax:30,aria:'Altitude slider'},
    {k:'V',id:'sa_V',label:'Flight speed, V',unit:'m/s',min:0,max:1500,step:1,v:250,nmax:3000,dec:1,aria:'Flight speed slider'}],go);
  presets('sa_pre',[['Ex 8.1(a): 250 m/s at sea level',{z:0,V:250}],['Ex 8.1(b): 250 m/s at 5 km',{z:5,V:250}],['Ex 8.1(c): 250 m/s at 10 km',{z:10,V:250}],['Airliner cruise: 250 m/s at 11 km',{z:11,V:250}],['SR-71, Ex 8.24: 1003 m/s at 25 km',{z:25,V:1003}]],S);
  renderers.push(go);
  function render(){
    const W=760,t=14,ph=262,x0=54,gap=48,pw=(W-x0-14-2*gap)/3;
    const z=S.z,V=S.V,A=atm(z*1000),a=Math.sqrt(G*RAIR*A.T),M=V/a;
    const amin=Math.floor(Math.sqrt(G*RAIR*205)/10)*10,amax=Math.ceil(Math.sqrt(G*RAIR*295)/10)*10;
    const Mtop=Math.max(1.2,Math.ceil(V/Math.sqrt(G*RAIR*216.66)*1.15*10)/10);
    const step=v=>v<=1.5?0.25:v<=3?0.5:1;
    const mt=[];for(let v=0;v<=Mtop+1e-9;v+=step(Mtop))mt.push(+v.toFixed(2));
    const at=[];for(let v=Math.ceil(amin/20)*20;v<=amax;v+=20)at.push(v);
    const zt=[0,5,10,15,20,25,30];
    const P=[
      frame({x0,y0:t,w:pw,h:ph,xmin:200,xmax:300,ymin:0,ymax:30,xt:[200,225,250,275,300],yt:zt,xlab:'Temperature T (K)',ylab:'Altitude z (km)',ylabdx:38}),
      frame({x0:x0+pw+gap,y0:t,w:pw,h:ph,xmin:amin,xmax:amax,ymin:0,ymax:30,xt:at,yt:zt,noy:true,xlab:'Speed of sound a (m/s)'}),
      frame({x0:x0+2*(pw+gap),y0:t,w:pw,h:ph,xmin:0,xmax:Mtop,ymin:0,ymax:30,xt:mt,yt:zt,noy:true,xlab:`Mach number at V = ${f(V,0)} m/s`})];
    let s='';P.forEach(p=>s+=p.svg);
    const zs=[];for(let i=0;i<=300;i++)zs.push(i*0.1);
    const prof=(p,fn,c)=>{let d='';zs.forEach((zz,i)=>{d+=(i?'L':'M')+fx(p.X(fn(atm(zz*1000))))+','+fx(p.Y(zz));});return path(d,c,2.2);};
    s+=prof(P[0],q=>q.T,'warn')+prof(P[1],q=>Math.sqrt(G*RAIR*q.T),'exp')+prof(P[2],q=>Math.min(Mtop,V/Math.sqrt(G*RAIR*q.T)),'ink');
    if(Mtop>1)s+=ln([P[2].X(1),t],[P[2].X(1),t+ph],'mach',1.3,'stroke-dasharray="4 4"')+tx([P[2].X(1)+4,t+12],'M = 1','axlab');
    s+=tx([P[0].X(296),P[0].Y(11)-5],'tropopause, 11 km','axlab','text-anchor="end"')+ln([P[0].x0||x0,P[0].Y(11)],[x0+pw,P[0].Y(11)],'mach',1,'stroke-dasharray="2 4"');
    const yz=P[0].Y(z);
    s+=ln([x0,yz],[W-14,yz],'accent',1.4,'stroke-dasharray="5 4"');
    s+=dot([P[0].X(A.T),yz],'warn')+dot([P[1].X(a),yz],'exp')+dot([P[2].X(Math.min(M,Mtop)),yz],'ink');
    $('sa_fig').innerHTML=s;
    const ke=G*(G-1)/2*M*M;
    $('sa_tiles').innerHTML=[['T∞',f(A.T,2)+' K','standard atmosphere'],['a∞ = √(γRT∞)',f(a,1)+' m/s','temperature only'],['M∞ = V/a∞',f(M,4),regime(M)],['Kinetic / internal energy',f(ke,3),'γ(γ − 1)M²/2']].map(([k,v,d])=>`<div class="tile"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${d}</span></div>`).join('');
    $('sa_out').innerHTML=readout([['Pressure p∞',`${f(A.p,0)} N/m² (${f(A.p/ATM,4)} atm)`],['Density ρ∞',f(A.rho,4)+' kg/m³'],['Isentropic compressibility τ<sub>s</sub> = 1/(γp)',sci(1/(G*A.p))+' m²/N'],['Check: a = 1/√(ρτ<sub>s</sub>)',f(1/Math.sqrt(A.rho/(G*A.p)),1)+' m/s']]);
    $('sa_short').textContent=`M∞ = ${f(M,3)}, ${regime(M)}`;
  }
})();

/* =====================================================================
   Worked examples 8.1–8.6
   ===================================================================== */
(function(){
  tabset('exA');
  watch(['a1_V'],()=>{const V=num('a1_V'),def=near(V,250);const N={0:['288','340','0.7353'],5:['255.69','320.52','0.78'],10:['223.26','299.5','0.835']};
    const rows=[];[0,5,10].forEach(z=>{const T=atm(z*1000).T,a=Math.sqrt(G*RAIR*T);rows.push({sect:z?`(${z===5?'b':'c'}) z = ${z} km`:'(a) Sea level'},['T∞ (K)','Appendix D',f(T,2),N[z][0]],['a∞ (m/s)','√(γRT∞)',f(a,2),N[z][1]],['M∞','V/a∞',f(V/a,4),N[z][2],1]);});
    exTable('a1_tab',rows,def,'Appendix D');});
  watch(['a2_T','a2_V'],()=>{const T=num('a2_T'),V=num('a2_V'),def=near(T,320)&&near(V,1000),a=Math.sqrt(G*RAIR*T);
    exTable('a2_tab',[['a (m/s)','√(γRT)',f(a,2),'358.6'],['M','V/a',f(V/a,4),'2.79',1]],def);});
  watch(['a3_Ma','a3_Mb'],()=>{const A=num('a3_Ma'),B=num('a3_Mb'),def=near(A,2)&&near(B,20),k=M=>G*(G-1)/2*M*M;
    exTable('a3_tab',[['(a) KE/IE','γ(γ − 1)M²/2',f(k(A),4),'1.12',1],['(b) KE/IE','γ(γ − 1)M²/2',f(k(B),4),'112',1]],def);});
  watch(['a4_p','a4_r'],()=>{const pa=num('a4_p'),r=num('a4_r'),def=near(pa,0.7)&&near(r,0.79),p=pa*ATM,ts=1/(G*p),T=p/(r*RAIR);
    exTable('a4_tab',[['p (N/m²)','1 atm = 101 325 N/m²',f(p,0),'0.707 × 10<sup>5</sup>'],['τ<sub>s</sub> (m²/N)','1/(γp)',sci(ts,5),'1.0103 × 10<sup>−5</sup>',1],['a (m/s)','√(1/(ρτ<sub>s</sub>)) (8.27)',f(1/Math.sqrt(r*ts),2),'354.2',1],
      {sect:'Check'},['T (K)','p/(ρR)',f(T,2),'312.2'],['a (m/s)','√(γRT)',f(Math.sqrt(G*RAIR*T),2),'354.18']],def);});
  watch(['a6_L','a6_T'],()=>{const L=num('a6_L'),T=num('a6_T'),def=near(L,300)&&near(T,320),aA=Math.sqrt(G*RAIR*T),aH=Math.sqrt(1.67*2078.5*T);
    exTable('a6_tab',[{sect:'(a) Air'},['a (m/s)','√(γRT), R = 287',f(aA,2),'358.6'],['t (s)','ℓ/a',f(L/aA,4),'0.837',1],{sect:'(b) Helium'},['a (m/s)','√(γRT), γ = 1.67, R = 2078.5',f(aH,2),'1053.92'],['t (s)','ℓ/a',f(L/aH,4),'0.2846',1],['t<sub>air</sub>/t<sub>He</sub>','a<sub>He</sub>/a<sub>air</sub>',f(aH/aA,3),'2.94']],def);});
})();

/* =====================================================================
   Interactive 2 · Total-to-static ratios and M*
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('ir_ctl',[{k:'M',id:'ir_M',label:'Mach number, M',min:0,max:5,step:0.01,v:0.6,nmax:50,aria:'Mach number slider'}],go);
  const K=known('ir_known',[
    {k:'M',label:'M',f:M=>M,inv:v=>v>=0&&v<=50?v:NaN,hint:'0 ≤ M ≤ 50'},
    {k:'p0p',label:'p₀/p',f:M=>1/pp0(M,G),inv:v=>inv(M=>1/pp0(M,G),v,0,50),hint:'p₀/p ≥ 1'},
    {k:'r0r',label:'ρ₀/ρ',f:M=>1/rr0(M,G),inv:v=>inv(M=>1/rr0(M,G),v,0,50),hint:'ρ₀/ρ ≥ 1'},
    {k:'T0T',label:'T₀/T',f:M=>1/TT0(M,G),inv:v=>inv(M=>1/TT0(M,G),v,0,50),hint:'T₀/T ≥ 1'},
    {k:'Ms',label:'M*',f:M=>Mstar(M,G),inv:v=>inv(M=>Mstar(M,G),v,0,50),hint:'0 ≤ M* < √((γ+1)/(γ−1))'}],()=>S.M,M=>S.set({M}));
  hooks.ir=K.set;
  presets('ir_pre',[['Ex 8.8: M = 3.5',{M:3.5}],['Ex 8.9: freestream, M = 0.6',{M:0.6}],['Sonic point: M = 1',{M:1}],['5% density change: M = 0.32',{M:0.32}],['Ex 8.14: M = 10',{M:10}]],S);
  renderers.push(go);
  const L={x0:58,y0:14,w:420,h:262},Rp={x0:548,y0:14,w:196,h:262};
  dragX('ir_fig',{x0:L.x0,w:L.w,xmin:0,xmax:5,y0:L.y0,y1:L.y0+L.h},M=>S.set({M:Math.round(M*100)/100}));
  function render(){
    const M=S.M,Mp=Math.min(M,5),lim=Math.sqrt((G+1)/(G-1)),ymax=Math.max(2.6,Math.ceil(lim*1.1*2)/2);
    const A=frame({...L,xmin:0,xmax:5,ymin:1,ymax:1000,log:true,xt:[0,1,2,3,4,5],yt:[1,10,100,1000],xlab:'Mach number M',ylab:'Total / static',clip:'irc1'});
    const yt=[];for(let v=0;v<=ymax+1e-9;v+=0.5)yt.push(v);
    const B=frame({...Rp,xmin:0,xmax:5,ymin:0,ymax,xt:[0,1,2,3,4,5],yt,xlab:'Mach number M',ylab:'M*',ylabdx:34,fy:v=>v.toFixed(1),clip:'irc2'});
    let s=`<defs>${A.clipDef}${B.clipDef}</defs>`+A.svg+B.svg;
    s+=`<g clip-path="url(#irc1)">`+path(curve(m=>1/pp0(m,G),0,5,A.X,A.Y),'comp',2.2)+path(curve(m=>1/rr0(m,G),0,5,A.X,A.Y),'stream',2.2)+path(curve(m=>1/TT0(m,G),0,5,A.X,A.Y),'warn',2.2)+'</g>';
    s+=`<g clip-path="url(#irc2)">`+ln([B.X(0),B.Y(lim)],[B.X(5),B.Y(lim)],'mach',1.3,'stroke-dasharray="6 4"')+path(curve(m=>Mstar(m,G),0,5,B.X,B.Y),'exp',2.2)+ln([B.X(0),B.Y(0)],[B.X(5),B.Y(5)],'mach',1,'stroke-dasharray="2 4"')+'</g>';
    s+=tx([B.X(0.15),B.Y(lim)-6],`M* → ${f(lim,3)}`,'axlab')+tx([B.X(Math.min(5,ymax))+4,B.Y(Math.min(5,ymax))+12],'M* = M','axlab');
    s+=ln([A.X(1),L.y0],[A.X(1),L.y0+L.h],'mach',1.2,'stroke-dasharray="4 4"')+ln([B.X(1),Rp.y0],[B.X(1),Rp.y0+Rp.h],'mach',1.2,'stroke-dasharray="4 4"');
    if(M<=5){s+=ln([A.X(M),L.y0],[A.X(M),L.y0+L.h],'accent',1.6)+ln([B.X(M),Rp.y0],[B.X(M),Rp.y0+Rp.h],'accent',1.6);
      [[1/pp0(M,G),'comp'],[1/rr0(M,G),'stream'],[1/TT0(M,G),'warn']].forEach(([v,c])=>{if(v<=1000)s+=dot([A.X(M),A.Y(v)],c,5);});
      s+=dot([B.X(M),B.Y(Mstar(M,G))],'exp',5);}
    else s+=tx([L.x0+L.w-6,L.y0+16],`M = ${f(M,2)} is beyond the plotted range`,'axlab','text-anchor="end"');
    $('ir_fig').innerHTML=s;
    const row=(lab,m)=>`<tr><td class="l">${lab}</td><td>${f(m,4)}</td><td>${f(1/pp0(m,G),4)}</td><td>${f(1/rr0(m,G),4)}</td><td>${f(1/TT0(m,G),4)}</td><td>${m>0?f(AoAs(m,G),4):'∞'}</td><td>${f(Mstar(m,G),4)}</td></tr>`;
    $('ir_tab').innerHTML=`<thead><tr><th class="l"></th><th>M</th><th>p<sub>0</sub>/p</th><th>ρ<sub>0</sub>/ρ</th><th>T<sub>0</sub>/T</th><th>A/A*</th><th>M*</th></tr></thead><tbody>`+row('Your M',M)+row('Sonic, M = 1',1)+`</tbody>`;
    const dr=(1-rr0(M,G))*100;
    $('ir_comp').innerHTML=`At M = ${f(M,3)} the density is ${f(dr,2)}% below its stagnation value, ρ/ρ<sub>0</sub> = ${f(rr0(M,G),4)}. Section 8.5 uses this to treat flows below M ≈ 0.3 as incompressible: the density changes by about 5% at M = 0.32 and less below. Sonic ratios for this γ: T*/T<sub>0</sub> = ${f(2/(G+1),4)}, p*/p<sub>0</sub> = ${f(pp0(1,G),4)}, ρ*/ρ<sub>0</sub> = ${f(rr0(1,G),4)}.`;
    $('ir_short').textContent=`p₀/p = ${f(1/pp0(M,G),4)}, M* = ${f(Mstar(M,G),4)}`;
    K.sync();
  }
})();

/* =====================================================================
   Worked examples 8.8–8.10
   ===================================================================== */
(function(){
  tabset('exB');
  watch(['b8_M','b8_p','b8_T'],()=>{const M=num('b8_M'),p=num('b8_p'),T=num('b8_T'),def=near(M,3.5)&&near(p,0.3)&&near(T,180);
    if(!(M>0&&p>0&&T>0)){$('b8_tab').innerHTML='';return;}
    const T0=T/TT0(M,G),Ts=T0*2/(G+1),as=Math.sqrt(G*RAIR*Ts),a=Math.sqrt(G*RAIR*T),V=M*a;
    exTable('b8_tab',[['p<sub>0</sub>/p','(8.42), Appendix A',f(1/pp0(M,G),3),'76.27'],['p<sub>0</sub> (atm)','(p<sub>0</sub>/p) p',f(p/pp0(M,G),3),'22.881',1],['T<sub>0</sub>/T','(8.40)',f(1/TT0(M,G),4),'3.45'],['T<sub>0</sub> (K)','(T<sub>0</sub>/T) T',f(T0,2),'621',1],
      ['T* (K)','T<sub>0</sub>·2/(γ + 1) (8.44)',f(Ts,2),'517.5',1],['a* (m/s)','√(γRT*)',f(as,1),'456',1],['a (m/s)','√(γRT)',f(a,1),'268.9'],['V (m/s)','Ma',f(V,1),'941'],['M*','V/a*, or (8.48)',f(V/as,4),'2.06',1]],def,'Appendix A');});
  watch(['b9_M','b9_p','b9_T','b9_p1'],()=>{const M=num('b9_M'),p=num('b9_p'),T=num('b9_T'),p1=num('b9_p1'),def=near(M,0.6)&&near(p,1)&&near(T,288)&&near(p1,0.7545);
    const p0=p/pp0(M,G);
    if(!(M>0&&p>0&&T>0&&p1>0)||p1>=p0){$('b9_ban').innerHTML=banner('bad','Check the inputs.','p₁ must be positive and below the total pressure p₀,∞.');$('b9_tab').innerHTML='';return;}
    const M1=Mfromp(p1/p0,G),T1=T*Math.pow(p1/p,(G-1)/G),a1=Math.sqrt(G*RAIR*T1);
    $('b9_ban').innerHTML=M1>1?banner('warn',`M₁ = ${f(M1,3)}: the flow at point 1 is supersonic.`,'The isentropic relations still hold as long as no shock lies between the freestream and point 1.'):'';
    exTable('b9_tab',[{sect:'Example 8.9'},['p<sub>0</sub>/p<sub>∞</sub>','(8.42) at M<sub>∞</sub>',f(1/pp0(M,G),4),'1.276'],['p<sub>0,∞</sub> = p<sub>0,1</sub> (atm)','isentropic flow: p<sub>0</sub> constant',f(p0,4),'1.276'],['p<sub>0,1</sub>/p<sub>1</sub>','',f(p0/p1,4),'1.6912'],['M<sub>1</sub>','invert (8.42), Appendix A',f(M1,4),'0.9',1],
      {sect:'Example 8.10'},['T<sub>1</sub> (K)','T<sub>∞</sub>(p<sub>1</sub>/p<sub>∞</sub>)<sup>(γ−1)/γ</sup>',f(T1,2),'265.73'],['a<sub>1</sub> (m/s)','√(γRT<sub>1</sub>)',f(a1,2),'326.75'],['V<sub>1</sub> (m/s)','M<sub>1</sub>a<sub>1</sub>',f(M1*a1,1),'294',1]],def,'Appendix A');});
})();

/* =====================================================================
   Interactive 3 · Normal-shock explorer
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('ns_ctl',[{k:'M',id:'ns_M',label:'Upstream Mach number, M₁',min:1,max:5,step:0.01,v:2,nmax:50,aria:'Upstream Mach number slider'}],go);
  const H=50,ok=v=>v>=1&&v<=H;
  const Q=[
    {k:'M1',label:'M₁',f:M=>M,inv:v=>ok(v)?v:NaN,hint:'1 ≤ M₁ ≤ 50'},
    {k:'M2',label:'M₂',f:M=>NS(M,G).M2,inv:v=>inv(M=>NS(M,G).M2,v,1,H),hint:'√((γ−1)/(2γ)) < M₂ ≤ 1'},
    {k:'p21',label:'p₂/p₁',f:M=>NS(M,G).p21,inv:v=>inv(M=>NS(M,G).p21,v,1,H),hint:'p₂/p₁ ≥ 1'},
    {k:'r21',label:'ρ₂/ρ₁',f:M=>NS(M,G).r21,inv:v=>inv(M=>NS(M,G).r21,v,1,H),hint:'1 ≤ ρ₂/ρ₁ < (γ+1)/(γ−1)'},
    {k:'T21',label:'T₂/T₁',f:M=>NS(M,G).T21,inv:v=>inv(M=>NS(M,G).T21,v,1,H),hint:'T₂/T₁ ≥ 1'},
    {k:'p0r',label:'p₀,₂/p₀,₁',f:M=>NS(M,G).p0r,inv:v=>inv(M=>NS(M,G).p0r,v,1,H),hint:'0 < p₀,₂/p₀,₁ ≤ 1'},
    {k:'pit',label:'p₀,₂/p₁ (Pitot)',f:M=>pitot(M,G),inv:v=>inv(M=>pitot(M,G),v,1,H),hint:'p₀,₂/p₁ ≥ p₀/p at M = 1 (1.893 for air)'}];
  const K=known('ns_known',Q,()=>S.M,M=>S.set({M}));
  hooks.ns=(k,v)=>{K.set(k,v);$('ns').scrollIntoView({behavior:reduceMotion?'auto':'smooth'});};
  document.querySelectorAll('[data-ns]').forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.ns.split(':');hooks.ns(k,parseFloat(v));});
  presets('ns_pre',[['Ex 8.11, 8.12(a): M₁ = 2',{M:2}],['Ex 8.12(b): M₁ = 4',{M:4}],['Weak shock: M₁ = 1.1',{M:1.1}],['Ex 8.14: M₁ = 10',{M:10}]],S);
  const box=$('ns_pre');[['Ex 8.15: p₂/p₁ = 4.5','p21',4.5],['Ex 8.16: T₂/T₁ = 5.8','T21',5.8],['Ex 8.17: M₂ = 0.4752','M2',0.4752]].forEach(([t,k,v])=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>K.set(k,v);box.appendChild(b);});
  renderers.push(go);
  const T={x0:58,y0:12,w:684,h:200},B={x0:58,y0:236,w:684,h:136};
  dragX('ns_fig',{x0:T.x0,w:T.w,xmin:1,xmax:5,y0:T.y0,y1:B.y0+B.h},M=>S.set({M:Math.round(M*100)/100}));
  function render(){
    const M=S.M,n=NS(M,G),pt=pitot(M,G),xt=[1,1.5,2,2.5,3,3.5,4,4.5,5];
    /* schematic */
    const pf='nss';let s=markers(pf);
    s+=ln([380,10],[380,140],'comp',4);
    s+=circ([40,30],'1')+circ([720,30],'2');
    const L1=170,L2=L1/n.r21;
    s+=arrow([150,78],[150+L1,78],'ink',pf,2.4)+arrow([420,78],[420+L2,78],'ink',pf,2.4);
    s+=tx([150,64],'u₁','flab')+tx([420,64],`u₂ = u₁/${f(n.r21,3)}`,'flab');
    s+=tx([66,35],`M₁ = ${f(M,3)}`,'flab')+tx([66,112],'p₁, ρ₁, T₁','axlab')+tx([66,130],'p₀,₁, T₀,₁, s₁','axlab');
    s+=tx([694,35],`M₂ = ${f(n.M2,4)}`,'flab','text-anchor="end"')+tx([694,112],`p₂ = ${f(n.p21,3)} p₁, T₂ = ${f(n.T21,3)} T₁`,'axlab','text-anchor="end"')+tx([694,130],`p₀,₂ = ${f(n.p0r,4)} p₀,₁, T₀,₂ = T₀,₁`,'axlab','text-anchor="end"');
    $('ns_sch').innerHTML=s;
    /* Figure 8.8 */
    const A=frame({...T,xmin:1,xmax:5,ymin:1,ymax:40,log:true,xt,yt:[1,2,5,10,20,40],nox:true,ylab:'Ratio across the shock',clip:'nsc1'});
    const C=frame({...B,xmin:1,xmax:5,ymin:0,ymax:1,xt,yt:[0,0.2,0.4,0.6,0.8,1],xlab:'Upstream Mach number M₁',fy:v=>v.toFixed(1),clip:'nsc2'});
    let g=`<defs>${A.clipDef}${C.clipDef}</defs>`+A.svg+C.svg;
    const rl=(G+1)/(G-1),m2l=Math.sqrt((G-1)/(2*G));
    g+=`<g clip-path="url(#nsc1)">`+(rl<=40?ln([A.X(1),A.Y(rl)],[A.X(5),A.Y(rl)],'mach',1.2,'stroke-dasharray="6 4"'):'')+path(curve(m=>NS(m,G).p21,1,5,A.X,A.Y),'comp',2.2)+path(curve(m=>NS(m,G).T21,1,5,A.X,A.Y),'warn',2.2)+path(curve(m=>NS(m,G).r21,1,5,A.X,A.Y),'stream',2.2)+'</g>';
    if(rl<=40)g+=tx([A.X(1.05),A.Y(rl)-5],`ρ₂/ρ₁ → (γ+1)/(γ−1) = ${f(rl,2)}`,'axlab');
    g+=`<g clip-path="url(#nsc2)">`+ln([C.X(1),C.Y(m2l)],[C.X(5),C.Y(m2l)],'mach',1.2,'stroke-dasharray="6 4"')+path(curve(m=>NS(m,G).M2,1,5,C.X,C.Y),'exp',2.2)+path(curve(m=>NS(m,G).p0r,1,5,C.X,C.Y),'ink',2.2)+'</g>';
    g+=tx([C.X(4.95),C.Y(m2l)+15],`M₂ → ${f(m2l,3)}`,'axlab','text-anchor="end"');
    g+=tx([A.X(4.95),A.Y(NS(5,G).p21)+(NS(5,G).p21<36?-6:14)],'p₂/p₁','flab','text-anchor="end" style="fill:var(--comp)"')+tx([A.X(4.95),A.Y(NS(5,G).T21)-6],'T₂/T₁','flab','text-anchor="end" style="fill:var(--warn)"')+tx([A.X(4.95),A.Y(NS(5,G).r21)+16],'ρ₂/ρ₁','flab','text-anchor="end" style="fill:var(--stream)"');
    g+=tx([C.X(1.6),C.Y(NS(1.6,G).M2)-8],'M₂','flab','style="fill:var(--exp)"')+tx([C.X(3.4),C.Y(NS(3.4,G).p0r)-8],'p₀,₂/p₀,₁','flab','style="fill:var(--ink)"');
    if(M<=5){g+=ln([A.X(M),T.y0],[A.X(M),B.y0+B.h],'accent',1.6);
      [[n.p21,'comp'],[n.T21,'warn'],[n.r21,'stream']].forEach(([v,c])=>{if(v<=40)g+=dot([A.X(M),A.Y(v)],c,5);});
      g+=dot([C.X(M),C.Y(n.M2)],'exp',5)+dot([C.X(M),C.Y(n.p0r)],'ink',5);}
    else g+=tx([T.x0+T.w-8,T.y0+18],`M₁ = ${f(M,2)} is beyond the plotted range`,'axlab','text-anchor="end"');
    $('ns_fig').innerHTML=g;
    const ds=dsR(M,G);
    $('ns_tab').innerHTML=`<thead><tr><th>M<sub>1</sub></th><th>p<sub>2</sub>/p<sub>1</sub></th><th>ρ<sub>2</sub>/ρ<sub>1</sub></th><th>T<sub>2</sub>/T<sub>1</sub></th><th>p<sub>0,2</sub>/p<sub>0,1</sub></th><th>p<sub>0,2</sub>/p<sub>1</sub></th><th>M<sub>2</sub></th><th>(s<sub>2</sub> − s<sub>1</sub>)/R</th></tr></thead><tbody><tr><td class="hl">${f(M,4)}</td><td>${f(n.p21,4)}</td><td>${f(n.r21,4)}</td><td>${f(n.T21,4)}</td><td>${f(n.p0r,4)}</td><td>${f(pt,4)}</td><td>${f(n.M2,4)}</td><td>${f(ds,4)}</td></tr></tbody>`;
    $('ns_msg').innerHTML=M<1.0005?banner('info','M₁ = 1: a normal shock of vanishing strength.','Every ratio equals 1 and M₂ = 1. This is a Mach wave.'):'';
    $('ns_short').textContent=`M₂ = ${f(n.M2,4)}, p₂/p₁ = ${f(n.p21,3)}`;
    K.sync();
  }
})();

/* =====================================================================
   Interactive 4 · T–s diagram and the second law
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('tsd_ctl',[{k:'M',id:'tsd_M',label:'Upstream Mach number, M₁',min:0.5,max:4,step:0.01,v:2,nmin:0.5,nmax:4,aria:'Upstream Mach number slider'}],go);
  presets('tsd_pre',[['Ex 8.12(a): M₁ = 2',{M:2}],['Ex 8.12(b): M₁ = 4',{M:4}],['Weak shock: M₁ = 1.2',{M:1.2}],['Expansion “shock”: M₁ = 0.8',{M:0.8}]],S);
  renderers.push(go);
  const L={x0:60,y0:14,w:420,h:270},Rp={x0:548,y0:14,w:196,h:270};
  function render(){
    const M=S.M,n=NS(M,G),ds=dsR(M,G),k=(G-1)/G,T0=1/TT0(M,G),T2=n.T21,p01=1/pp0(M,G),p02=p01*n.p0r;
    const dmin=dsR(0.5,G),dmax=dsR(4,G),xmin=Math.floor((dmin-0.15)*5)/5,xmax=Math.ceil((dmax+0.35)*5)/5;
    const ylo=Math.max(0,Math.min(1,T2)*0.82),yhi=T0*1.14+0.05;
    const st=(lo,hi,n)=>{const r=hi-lo,raw=r/n,p=Math.pow(10,Math.floor(Math.log10(raw))),c=[1,2,2.5,5,10].map(x=>x*p).find(x=>x>=raw);const a=[];for(let v=Math.ceil(lo/c)*c;v<=hi+1e-9;v+=c)a.push(+v.toFixed(6));return a;};
    const A=frame({...L,xmin,xmax,ymin:ylo,ymax:yhi,xt:st(xmin,xmax,6),yt:st(ylo,yhi,5),xlab:'Entropy (s − s₁)/R',ylab:'Temperature T/T₁',fy:v=>+v.toFixed(2),clip:'tsc1'});
    const B=frame({...Rp,xmin:0.5,xmax:4,ymin:xmin,ymax:xmax,xt:[0.5,1,2,3,4],yt:st(xmin,xmax,6),xlab:'Upstream Mach number M₁',ylab:'(s₂ − s₁)/R',ylabdx:38,clip:'tsc2'});
    let s=`<defs>${A.clipDef}${B.clipDef}</defs>`+A.svg+B.svg;
    const iso=P=>sv=>P**k*Math.exp(k*sv);   // T/T1 on the isobar p/p1 = P
    s+=`<g clip-path="url(#tsc1)">`;
    [[1,'exp','p₁'],[p01,'exp','p₀,₁'],[n.p21,'comp','p₂'],[p02,'comp','p₀,₂']].forEach(([P,c,lab],i)=>{s+=path(curve(iso(P),xmin,xmax,A.X,A.Y,120),c,1.4,i%2?'':'stroke-dasharray="1 0"');});
    s+=ln([A.X(0),A.Y(1)],[A.X(0),A.Y(T0)],'mach',1.6,'stroke-dasharray="5 4"')+ln([A.X(ds),A.Y(T2)],[A.X(ds),A.Y(T0)],'mach',1.6,'stroke-dasharray="5 4"');
    s+=ln([A.X(Math.min(0,ds)),A.Y(T0)],[A.X(Math.max(0,ds)),A.Y(T0)],'muted',1.2,'stroke-dasharray="2 3"');
    s+=`<path d="M${fx(A.X(0))},${fx(A.Y(1))} Q${fx(A.X(ds/2)+12)},${fx(A.Y((1+T2)/2)+10)} ${fx(A.X(ds))},${fx(A.Y(T2))}" fill="none" style="stroke:var(--${ds<0?'bad':'ink'})" stroke-width="2.2"/>`;
    s+='</g>';
    // isobar labels where each isobar enters the plot (left edge or bottom edge)
    const lab=[[1,'exp','p₁'],[p01,'exp','p₀,₁'],[n.p21,'comp','p₂'],[p02,'comp','p₀,₂']].map(([P,c,t])=>{const yl=iso(P)(xmin);
      if(yl>ylo&&yl<yhi)return {x:L.x0+5,y:A.Y(yl)-5,c,t,a:'start'};const sb=Math.log(ylo/Math.pow(P,k))/k;return {x:A.X(sb)+6,y:L.y0+L.h-6,c,t,a:'start'};}).filter(o=>o.x<L.x0+L.w-20);
    lab.sort((u,v)=>u.y-v.y);for(let i=1;i<lab.length;i++)if(Math.abs(lab[i].x-lab[i-1].x)<40&&lab[i].y-lab[i-1].y<16)lab[i].y=lab[i-1].y+16;
    lab.forEach(o=>{s+=tx([o.x,o.y],o.t,'flab',`text-anchor="${o.a}" style="fill:var(--${o.c})"`);});
    const pts=[[0,1,'1',-8,16,'end'],[0,T0,'0,1',-8,4,'end'],[ds,T2,'2',8,14,'start'],[ds,T0,'0,2',8,4,'start']];
    if(ds<0){pts[0][3]=8;pts[0][5]='start';pts[1][3]=8;pts[1][5]='start';pts[2][3]=-8;pts[2][5]='end';pts[3][3]=-8;pts[3][5]='end';}
    pts.forEach(([x,y,t,dx,dy,an],i)=>{s+=dot([A.X(x),A.Y(y)],i<2?'exp':'comp',4.5)+tx([A.X(x)+dx,A.Y(y)+dy],t,'flab',`text-anchor="${an}"`);});
    s+=tx([A.X((0+ds)/2),A.Y(T0)-12],'T₀ = const','axlab','text-anchor="middle"');
    // right panel: entropy change vs M1
    s+=`<g clip-path="url(#tsc2)"><rect x="${B.X(0.5)}" y="${fx(B.Y(0))}" width="${fx(B.X(4)-B.X(0.5))}" height="${fx(B.Y(xmin)-B.Y(0))}" style="fill:var(--bad)" opacity="0.10"/>`+ln([B.X(0.5),B.Y(0)],[B.X(4),B.Y(0)],'muted',1)+path(curve(m=>dsR(m,G),0.5,4,B.X,B.Y),'ink',2.2)+'</g>';
    s+=tx([B.X(3.1),B.Y(xmin)-10],'s₂ < s₁: forbidden','axlab','text-anchor="middle" style="fill:var(--bad)"');
    s+=ln([B.X(M),Rp.y0],[B.X(M),Rp.y0+Rp.h],'accent',1.4)+dot([B.X(M),B.Y(ds)],ds<0?'bad':'ink',5);
    $('tsd_fig').innerHTML=s;
    $('tsd_msg').innerHTML=M<1-1e-9?banner('bad','The second law rules this out.',`With M₁ = ${f(M,2)} the conservation laws give an expansion “shock” (p₂/p₁ = ${f(n.p21,3)}) with s₂ − s₁ = ${f(ds*RAIR,1)} J/(kg·K) < 0. No such wave exists.`):Math.abs(M-1)<1e-9?banner('info','M₁ = 1: no entropy change.','The wave is a Mach wave and the process is isentropic.'):'';
    $('tsd_out').innerHTML=readout([['M₂',f(n.M2,4)],['p₂/p₁, T₂/T₁',`${f(n.p21,4)}, ${f(n.T21,4)}`],['T₀,₂/T₀,₁','1 (adiabatic)'],['p₀,₂/p₀,₁ = e<sup>−Δs/R</sup>',f(n.p0r,4),M>1?'hl':''],['(s₂ − s₁)/R',f(ds,4),'hl'],['s₂ − s₁ for air, R = 287 J/(kg·K)',f(ds*RAIR,2)+' J/(kg·K)']]);
    $('tsd_short').textContent=ds<-1e-12?'s₂ < s₁: impossible':`p₀ loss ${f((1-n.p0r)*100,1)}%`;
  }
})();

/* =====================================================================
   Worked examples 8.11–8.21
   ===================================================================== */
(function(){
  tabset('exC');
  watch(['c11_u','c11_T','c11_p'],()=>{const u=num('c11_u'),T=num('c11_T'),p=num('c11_p'),def=near(u,680)&&near(T,288)&&near(p,1),a1=Math.sqrt(G*RAIR*T),M=u/a1;
    if(!(M>1)||!(p>0)){$('c11_ban').innerHTML=banner('bad',`M₁ = ${isFinite(M)?f(M,3):'—'} is not supersonic.`,'A normal shock needs M₁ > 1. Raise u₁ or lower T₁.');$('c11_tab').innerHTML='';return;}
    $('c11_ban').innerHTML='';const n=NS(M,G),T2=T*n.T21,a2=Math.sqrt(G*RAIR*T2);
    exTable('c11_tab',[['a<sub>1</sub> (m/s)','√(γRT<sub>1</sub>)',f(a1,2),'340.17'],['M<sub>1</sub>','u<sub>1</sub>/a<sub>1</sub>',f(M,4),'2'],['p<sub>2</sub>/p<sub>1</sub>','(8.65)',f(n.p21,4),'4.5'],['T<sub>2</sub>/T<sub>1</sub>','(8.67)',f(n.T21,4),'1.687'],['M<sub>2</sub>','(8.59)',f(n.M2,4),'0.5774'],
      ['p<sub>2</sub> (atm)','(p<sub>2</sub>/p<sub>1</sub>) p<sub>1</sub>',f(p*n.p21,4),'4.5',1],['T<sub>2</sub> (K)','(T<sub>2</sub>/T<sub>1</sub>) T<sub>1</sub>',f(T2,2),'485.86',1],['a<sub>2</sub> (m/s)','√(γRT<sub>2</sub>)',f(a2,2),'441.84'],['u<sub>2</sub> (m/s)','M<sub>2</sub>a<sub>2</sub>',f(n.M2*a2,2),'255.1',1],['u<sub>2</sub> (m/s), check','u<sub>1</sub>/(ρ<sub>2</sub>/ρ<sub>1</sub>), continuity',f(u/n.r21,2),null]],def,'Appendix B');});
  watch(['c12_p','c12_Ma','c12_Mb'],()=>{const p=num('c12_p'),A=num('c12_Ma'),Bm=num('c12_Mb'),def=near(p,1)&&near(A,2)&&near(Bm,4);
    if(!(p>0&&A>=1&&Bm>=1)){$('c12_tab').innerHTML='';$('c12_note').innerHTML='';return;}
    const part=(M,lab,N)=>{const p01=p/pp0(M,G),r=NS(M,G).p0r;return [{sect:`(${lab}) M<sub>1</sub> = ${f(M,2)}`},['p<sub>0,1</sub> (atm)','(p<sub>0</sub>/p)<sub>M₁</sub> p<sub>1</sub>, Appendix A',f(p01,3),N[0]],['p<sub>0,2</sub>/p<sub>0,1</sub>','Appendix B',f(r,4),N[1]],['p<sub>0,2</sub> (atm)','(p<sub>0,2</sub>/p<sub>0,1</sub>) p<sub>0,1</sub>',f(p01*r,3),N[2],0,N[4]],['p<sub>0,1</sub> − p<sub>0,2</sub> (atm)','loss of total pressure',f(p01*(1-r),3),N[3],1]];};
    const la=p/pp0(A,G)*(1-NS(A,G).p0r),lb=p/pp0(Bm,G)*(1-NS(Bm,G).p0r);
    exTable('c12_tab',[...part(A,'a',['7.824','0.7209','5.64','2.184',0]),...part(Bm,'b',['151.8','0.1388','21.7','130.7',1])],def,'Appendices A and B');
    $('c12_note').innerHTML=`Raising M<sub>1</sub> from ${f(A,2)} to ${f(Bm,2)} multiplies the loss of total pressure by ${f(lb/la,1)}. If a normal shock must occur in a flow, everything else being equal, it should occur at the lowest possible upstream Mach number.`+(def?' The notes write p<sub>0,2</sub> = 21.7 atm in (b); 0.1388 × 151.8 = 21.07 atm, the value their loss of 130.7 atm uses.':'');});
  const set13=(M)=>{$('c13_M').value=M;$('c13_M').dispatchEvent(new Event('input'));};
  $('c13_m2').onclick=()=>set13(2);$('c13_m10').onclick=()=>set13(10);
  watch(['c13_M','c13_p','c13_T','c13_M2'],()=>{const M=num('c13_M'),p=num('c13_p'),T=num('c13_T'),M2=num('c13_M2');
    const base=near(p,26500)&&near(T,223.3)&&near(M2,0.2),d2=base&&near(M,2),d10=base&&near(M,10),def=d2||d10;
    if(!(M>1&&p>0&&T>0&&M2>0&&M2<1)){$('c13_tab').innerHTML='';return;}
    const N=d10?['0.4244 × 10<sup>5</sup>','1.125 × 10<sup>9</sup>','21','4690','0.3045 × 10<sup>−2</sup>','3.43 × 10<sup>6</sup>','1.028','3.34 × 10<sup>6</sup> ≈ 33 atm','1.008','4653']:['7.824','2.07 × 10<sup>5</sup>','1.8','401.9','0.7209','1.49 × 10<sup>5</sup>','1.028','1.45 × 10<sup>5</sup> = 1.435 atm','1.008','399 (125.8 °C)'];
    const p0=p/pp0(M,G),T0=T/TT0(M,G),r=NS(M,G).p0r,p01=p0*r,p2=p01*pp0(M2,G),T2=T0*TT0(M2,G);
    exTable('c13_tab',[{sect:'Freestream'},['p<sub>0</sub>/p<sub>∞</sub>','Appendix A at M<sub>∞</sub>',M>8?sci(1/pp0(M,G)):f(1/pp0(M,G),3),N[0]],['p<sub>0,∞</sub> (N/m²)','',sci(p0),N[1]],['T<sub>0</sub>/T<sub>∞</sub>','Appendix A',f(1/TT0(M,G),3),N[2]],['T<sub>0,∞</sub> (K)','',f(T0,1),N[3]],
      {sect:'Point 1, behind the normal shock'},['p<sub>0,1</sub>/p<sub>0,∞</sub>','Appendix B at M<sub>∞</sub>',r<0.01?sci(r):f(r,4),N[4]],['p<sub>0,1</sub> (N/m²)','',sci(p01),N[5]],['T<sub>0,1</sub> (K)','T<sub>0</sub> constant across the shock',f(T0,1),N[3]],
      {sect:'Point 2, combustor entrance (isentropic from 1)'},['p<sub>0,2</sub>/p<sub>2</sub>','Appendix A at M<sub>2</sub>',f(1/pp0(M2,G),4),N[6]],['p<sub>2</sub> (N/m²)','p<sub>0,1</sub>/(p<sub>0</sub>/p)<sub>M₂</sub>',`${sci(p2)} = ${f(p2/ATM,3)} atm`,N[7],1],['T<sub>0</sub>/T<sub>2</sub>','Appendix A at M<sub>2</sub>',f(1/TT0(M2,G),4),N[8]],['T<sub>2</sub> (K)','T<sub>0</sub>/(T<sub>0</sub>/T)<sub>M₂</sub>',`${f(T2,1)} (${f(T2-273.15,1)} °C)`,N[9],1]],def,'Appendices A and B');});
  /* 8.15–8.17 */
  watch([],()=>{const C=[['8.15','p<sub>2</sub>/p<sub>1</sub> = 4.5',inv(M=>NS(M,G).p21,4.5,1,50),['2','0.5774','2.667','4.5 (given)','1.687']],
      ['8.16','T<sub>2</sub>/T<sub>1</sub> = 5.8',inv(M=>NS(M,G).T21,5.8,1,50),['5','0.4152','5','29','5.8 (given)']],
      ['8.17','M<sub>2</sub> = 0.4752',inv(M=>NS(M,G).M2,0.4752,1,50),['3','0.4752 (given)','3.857','10.33','2.679']]];
    let h=`<thead><tr><th class="l">Example</th><th class="l">Given</th><th>M<sub>1</sub></th><th>M<sub>2</sub></th><th>ρ<sub>2</sub>/ρ<sub>1</sub></th><th>p<sub>2</sub>/p<sub>1</sub></th><th>T<sub>2</sub>/T<sub>1</sub></th></tr></thead><tbody>`;
    const g14=Math.abs(G-1.4)<1e-9,hv=x=>`<span class="handv">tables: ${g14?x:'—'}</span>`;
    C.forEach(([e,g,M,N])=>{const n=NS(M,G);h+=`<tr><td class="l">${e}</td><td class="l">${g}</td><td class="hl">${isFinite(M)?f(M,4):'—'}${hv(N[0])}</td><td>${f(n.M2,4)}${hv(N[1])}</td><td>${f(n.r21,4)}${hv(N[2])}</td><td>${f(n.p21,4)}${hv(N[3])}</td><td>${f(n.T21,4)}${hv(N[4])}</td></tr>`;});
    $('c15_tab').innerHTML=h+'</tbody>';});
  /* 8.18–8.20 */
  const ent=M=>Math.round(M*20)/20;  // Appendix B step of 0.05 for 2 < M1 < 5
  watch(['c18_u','c18_T','c19_u','c19_T'],()=>{const u1=num('c18_u'),T1=num('c18_T'),u2=num('c19_u'),T2=num('c19_T');
    const def=near(u1,1215)&&near(T1,300)&&near(u2,329)&&near(T2,1500);
    const a1=Math.sqrt(G*RAIR*T1),M1=u1/a1,a2=Math.sqrt(G*RAIR*T2),M2=u2/a2;
    const bad=[];if(!(M1>1))bad.push('8.18 needs u₁/a₁ > 1');const m2min=Math.sqrt((G-1)/(2*G));if(!(M2<1&&M2>m2min))bad.push(`8.19 needs ${f(m2min,3)} < u₂/a₂ < 1`);
    $('c18_ban').innerHTML=bad.length?banner('bad','Check the inputs.',bad.join('; ')+'.'):'';
    if(bad.length){$('c18_tab').innerHTML='';return;}
    const n=NS(M1,G),T2b=T1*n.T21,a2b=Math.sqrt(G*RAIR*T2b);
    const M1x=inv(M=>NS(M,G).M2,M2,1,50),nx=NS(M1x,G),T1x=T2/nx.T21,a1x=Math.sqrt(G*RAIR*T1x);
    let Me=ent(M1x);const ne=NS(Me,G),T21e=+ne.T21.toFixed(3),T1e=T2/T21e,a1e=Math.sqrt(G*RAIR*T1e),u1e=Me*a1e;
    exTable('c18_tab',[{sect:'Example 8.18: u₁ and T₁ given'},['a<sub>1</sub> (m/s)','√(γRT<sub>1</sub>)',f(a1,2),'347.2'],['M<sub>1</sub>','u<sub>1</sub>/a<sub>1</sub>',f(M1,4),'3.5'],['M<sub>2</sub>','(8.59)',f(n.M2,4),'0.4512'],['T<sub>2</sub>/T<sub>1</sub>','(8.67)',f(n.T21,4),'3.315'],['T<sub>2</sub> (K)','',f(T2b,2),'994.5'],['a<sub>2</sub> (m/s)','√(γRT<sub>2</sub>)',f(a2b,2),'632.1'],['u<sub>2</sub> (m/s)','M<sub>2</sub>a<sub>2</sub>',f(n.M2*a2b,2),'285.2',1],
      {sect:'Example 8.19: u₂ and T₂ given'},['a<sub>2</sub> (m/s)','√(γRT<sub>2</sub>)',f(a2,2),'776.3'],['M<sub>2</sub>','u<sub>2</sub>/a<sub>2</sub>',f(M2,4),'0.4238'],['M<sub>1</sub>','invert (8.59); notes interpolate App. B',f(M1x,4),'4.4898'],['T<sub>2</sub>/T<sub>1</sub>','(8.67)',f(nx.T21,4),'4.856'],['T<sub>1</sub> (K)','',f(T1x,2),'308.9'],['a<sub>1</sub> (m/s)','√(γRT<sub>1</sub>)',f(a1x,2),'352.3'],['u<sub>1</sub> (m/s)','M<sub>1</sub>a<sub>1</sub>',f(M1x*a1x,1),'1581',1],
      {sect:'Example 8.20: nearest Appendix B entry instead'},['M<sub>1</sub> (nearest entry)','',f(Me,2),'4.50'],['T<sub>2</sub>/T<sub>1</sub> (table, 3 decimals)','',f(T21e,3),'4.875'],['T<sub>1</sub> (K)','',f(T1e,2),'307.7'],['a<sub>1</sub> (m/s)','',f(a1e,2),'351.6'],['u<sub>1</sub> (m/s)','',f(u1e,1),'1582',1],['Difference from exact','',f((u1e/(M1x*a1x)-1)*100,3)+' %','0.06 %']],def,'Appendix B');});
  /* 8.21 */
  watch(['c21_M'],()=>{const M=num('c21_M'),def=near(M,3.53);
    if(!(M>=2&&M<=5)){$('c21_tab').innerHTML='<tbody><tr><td class="l">Enter M₁ between 2 and 5.</td></tr></tbody>';return;}
    const tab=m=>+NS(m,G).M2.toFixed(4),lo=Math.min(4.95,Math.floor(M*20+1e-9)/20),hi=lo+0.05,ne=ent(M),ex=NS(M,G).M2,ip=tab(lo)+(M-lo)/(hi-lo)*(tab(hi)-tab(lo));
    const err=v=>f((v/ex-1)*100,3)+' %';
    exTable('c21_tab',[['(a) M<sub>2</sub>, nearest entry',`entry M<sub>1</sub> = ${f(ne,2)}`,f(tab(ne),4),'0.4492 (M₁ = 3.55)'],['(b) M<sub>2</sub>, interpolated',`between ${f(lo,2)} (${f(tab(lo),4)}) and ${f(hi,2)} (${f(tab(hi),4)})`,f(ip,4),'0.45'],['(c) M<sub>2</sub>, exact','(8.59)',f(ex,5),'0.45 (M₂² = 0.2025)',1],
      {sect:'Error relative to the exact value'},['(a) nearest entry','',err(tab(ne)),null],['(b) interpolation','',err(ip),null]],def,'Appendix B');});
})();

/* =====================================================================
   Interactive 5 · Pitot tube
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('pt_ctl',[{k:'M',id:'pt_M',label:'Freestream Mach number, M₁',min:0.05,max:5,step:0.01,v:0.6,nmin:0.01,nmax:30,aria:'Freestream Mach number slider'},
    {k:'T',id:'pt_T',label:'Freestream temperature, T₁',unit:'K',min:150,max:350,step:0.1,v:288,nmin:1,nmax:3000,dec:2,aria:'Freestream temperature slider'}],go);
  const K=known('pt_known',[
    {k:'M',label:'M₁',f:M=>M,inv:v=>v>0&&v<=30?v:NaN,hint:'0 < M₁ ≤ 30'},
    {k:'r',label:'Pitot reading / p₁',f:M=>pitot(M,G),inv:v=>v<=1/pp0(1,G)?inv(M=>1/pp0(M,G),v,1e-6,1):inv(M=>pitot(M,G),v,1,30),hint:'Reading ≥ 1; above p₀/p at M = 1 (1.893 for air) the flow is supersonic.'}],()=>S.M,M=>S.set({M}));
  const box=$('pt_pre');
  [['Ex 8.22(a): reading 1.276 p₁',1.276,288],['Ex 8.22(b): reading 2.714 p₁',2.714,288],['Ex 8.22(c): reading 12.06 p₁',12.06,288],['Ex 8.24, SR-71: 3.88 × 10⁴ / 2527.3',38800/2527.3,216.66]].forEach(([t,r,T])=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{S.set({T});K.set('r',+r.toFixed(4));};box.appendChild(b);});
  const b8=document.createElement('button');b8.type='button';b8.textContent='Ex 8.23: missile at M₁ = 8';b8.onclick=()=>S.set({M:8});box.appendChild(b8);
  renderers.push(go);
  const P={x0:58,y0:12,w:684,h:256};
  dragX('pt_fig',{x0:P.x0,w:P.w,xmin:0,xmax:5,y0:P.y0,y1:P.y0+P.h},M=>S.set({M:Math.max(0.05,Math.round(M*100)/100)}));
  function render(){
    const M=S.M,sup=M>1,r=pitot(M,G),thr=1/pp0(1,G),Mwrong=Mfromp(1/r,G),a1=Math.sqrt(G*RAIR*S.T);
    /* schematic */
    const pf='pts',yc=95,mouth=470,R=26;let s=markers(pf);
    s+=`<path d="M${mouth},${yc-R} L752,${yc-R} M${mouth},${yc+R} L752,${yc+R}" style="stroke:var(--body)" stroke-width="3" fill="none"/>`+`<path d="M${mouth},${yc-R} Q${mouth-6},${yc} ${mouth},${yc+R}" style="stroke:var(--body)" stroke-width="1.5" fill="none" stroke-dasharray="3 3"/>`;
    s+=tx([620,yc+4],'Pitot tube','axlab','text-anchor="middle"');
    if(sup){
      const mu=Math.asin(1/M),Rb=R*3,del=Math.max(22,Rb*0.143*Math.exp(3.24/(M*M))),Rc=Rb*1.143*Math.exp(0.54/Math.pow(Math.max(M-1,0.05),1.2)),c2=1/Math.pow(Math.tan(mu),2),xs=mouth-del;
      const xsh=y=>xs+Rc*c2*(Math.sqrt(1+y*y*Math.tan(mu)*Math.tan(mu)/(Rc*Rc))-1);
      let d='';for(let y=-90;y<=90;y+=3){const x=xsh(y);d+=(d?'L':'M')+fx(Math.min(x,760))+','+fx(yc+y);}
      s+=`<path d="${d}" fill="none" style="stroke:var(--comp)" stroke-width="2.6"/>`;
      [-62,-36,36,62].forEach(y0=>{const x1=xsh(y0);s+=pl([[10,yc+y0],[x1,yc+y0],[mouth+40,yc+y0+Math.sign(y0)*(Math.abs(y0)<50?R+12-Math.abs(y0)+Math.abs(y0)*0.5:10)],[750,yc+y0+Math.sign(y0)*(Math.abs(y0)<50?R+12-Math.abs(y0)+Math.abs(y0)*0.5:10)]],'stream',1.2);});
      s+=arrow([10,yc],[mouth-8,yc],'ink',pf,1.8);
      s+=tx([40,yc-8],'c','flab')+dot([xs+2,yc],'comp',4)+tx([xs-4,yc-10],'d','flab','text-anchor="end"')+dot([mouth-3,yc],'ink',4)+tx([mouth-6,yc+18],'e','flab','text-anchor="end"');
      s+=tx([xsh(-84)-8,yc-76],'bow shock','axlab','text-anchor="end" style="fill:var(--comp)"');
      s+=tx([14,22],`M₁ = ${f(M,2)} > 1: the tube reads p₀,₂ = ${f(NS(M,G).p0r,4)} p₀,₁`,'flab');
    } else {
      const bend=(x,y0)=>y0+Math.sign(y0)*(Math.abs(y0)<50?(R+10-Math.abs(y0)*0.6):10)/(1+Math.exp(-(x-(mouth-30))/26));
      [-62,-36,36,62].forEach(y0=>{const p=[];for(let x=10;x<=750;x+=10)p.push([x,yc+bend(x,y0)]);s+=pl(p,'stream',1.2);});
      s+=arrow([10,yc],[mouth-8,yc],'ink',pf,1.8)+tx([40,yc-8],'a','flab')+dot([mouth-3,yc],'ink',4)+tx([mouth-6,yc+18],'b','flab','text-anchor="end"');
      s+=tx([14,22],`M₁ = ${f(M,2)} < 1: the tube reads the freestream total pressure p₀,₁`,'flab');
    }
    $('pt_sch').innerHTML=s;
    /* chart */
    const A=frame({...P,xmin:0,xmax:5,ymin:1,ymax:40,log:true,xt:[0,1,2,3,4,5],yt:[1,2,5,10,20,40],xlab:'Freestream Mach number M₁',ylab:'Pitot pressure / p₁',clip:'ptc'});
    let g=`<defs>${A.clipDef}</defs>`+A.svg+`<g clip-path="url(#ptc)">`;
    g+=path(curve(m=>1/pp0(m,G),0,1,A.X,A.Y,120),'exp',2.2)+path(curve(m=>1/pp0(m,G),1,5,A.X,A.Y,200),'exp',1.6,'stroke-dasharray="6 5"')+path(curve(m=>pitot(m,G),1,5,A.X,A.Y,200),'comp',2.4);
    if(r<=40)g+=ln([A.X(0),A.Y(r)],[A.X(5),A.Y(r)],'accent',1.4,'stroke-dasharray="5 4"');
    g+='</g>';
    g+=ln([A.X(1),P.y0],[A.X(1),P.y0+P.h],'mach',1.2,'stroke-dasharray="4 4"')+dot([A.X(1),A.Y(thr)],'ink',3.5)+tx([A.X(1)+6,A.Y(thr)+16],`${f(thr,3)} at M₁ = 1`,'axlab');
    g+=tx([A.X(2.75)-6,A.Y(32)],'isentropic p₀,₁/p₁, not read when M₁ > 1','axlab','text-anchor="end"')+tx([A.X(4.95),A.Y(pitot(4.95,G))+18],'Rayleigh Pitot formula (8.80)','axlab','text-anchor="end" style="fill:var(--comp)"');
    if(M<=5&&r<=40){g+=dot([A.X(M),A.Y(r)],sup?'comp':'exp',6);
      if(sup&&Mwrong<=5)g+=dot([A.X(Mwrong),A.Y(r)],'exp',5.5,true)+tx([A.X(Mwrong)-8,A.Y(r)-10],`isentropic formula: M = ${f(Mwrong,3)}`,'axlab','text-anchor="end"');}
    else g+=tx([P.x0+P.w-8,P.y0+18],`M₁ = ${f(M,2)} is beyond the plotted range`,'axlab','text-anchor="end"');
    $('pt_fig').innerHTML=g;
    const rows=[['Regime',sup?'supersonic: reading > '+f(thr,3)+' p₁':'subsonic: reading ≤ '+f(thr,3)+' p₁'],['Pitot reading p<sub>Pitot</sub>/p<sub>1</sub>',f(r,4),'hl'],['Formula',sup?'Rayleigh Pitot formula (8.80)':'isentropic, (8.74)'],['M<sub>1</sub>',f(M,4),'hl']];
    if(sup)rows.push(['p<sub>0,2</sub>/p<sub>0,1</sub> (what the shock costs)',f(NS(M,G).p0r,4)],['M from the isentropic formula (wrong here)',`${f(Mwrong,4)} (${f((Mwrong/M-1)*100,1)} %)`]);
    rows.push(['a<sub>1</sub> = √(γRT<sub>1</sub>)',f(a1,2)+' m/s'],['u<sub>1</sub> = M<sub>1</sub>a<sub>1</sub>',f(M*a1,1)+' m/s','hl']);
    $('pt_out').innerHTML=readout(rows);
    $('pt_short').textContent=`${sup?'supersonic':'subsonic'}, u₁ = ${f(M*a1,0)} m/s`;
    K.sync();
  }
})();

/* =====================================================================
   Worked examples 8.22–8.24
   ===================================================================== */
(function(){
  tabset('exD');
  const Mof=r=>r<=1/pp0(1,G)?Mfromp(1/r,G):inv(M=>pitot(M,G),r,1,50);
  watch(['d22_p','d22_a','d22_b','d22_c'],()=>{const p=num('d22_p'),R=[num('d22_a'),num('d22_b'),num('d22_c')],def=near(p,1)&&near(R[0],1.276)&&near(R[1],2.714)&&near(R[2],12.06)&&Math.abs(G-1.4)<1e-9,thr=1/pp0(1,G),N=['0.6','1.3','3'];
    let h=`<thead><tr><th class="l">Reading</th><th>p<sub>Pitot</sub>/p<sub>1</sub></th><th class="l">Regime and formula</th><th>M<sub>1</sub></th><th class="hand">Tables, γ = 1.4</th><th>Isentropic formula</th></tr></thead><tbody>`;
    R.forEach((x,i)=>{const r=x/p,ok=r>=1,sup=r>thr,M=ok?Mof(r):NaN,Mw=ok?Mfromp(1/r,G):NaN;
      h+=`<tr><td class="l">(${'abc'[i]}) ${f(x,3)} atm</td><td>${f(r,4)}</td><td class="rel">${!ok?'reading below p₁: impossible':sup?'supersonic: Rayleigh Pitot formula (App. B)':'subsonic: isentropic (App. A)'}</td><td class="hl">${f(M,4)}</td>${handCell(def?N[i]:'—')}<td>${sup?`${f(Mw,4)} (wrong)`:f(Mw,4)}</td></tr>`;});
    $('d22_tab').innerHTML=h+`</tbody><tfoot><tr><td class="l" colspan="6" style="font-weight:400;font-family:var(--f-body)">Threshold: at M<sub>1</sub> = 1 the tube reads ${f(thr,4)} p<sub>1</sub> = ${f(thr*p,4)} atm.</td></tr></tfoot>`;});
  watch(['d23_M','d23_p'],()=>{const M=num('d23_M'),p=num('d23_p'),def=near(M,8)&&near(p,46620);
    if(!(M>1&&p>0)){$('d23_tab').innerHTML='';return;}
    const r=pitot(M,G);
    exTable('d23_tab',[['p<sub>0,2</sub>/p<sub>1</sub>','Rayleigh Pitot formula (8.80), App. B',f(r,3),'82.87'],['p<sub>0,2</sub> (N/m²)','stagnation-point pressure',sci(r*p),'3.863 × 10<sup>6</sup>',1],['p<sub>0,2</sub> (atm)','1 atm = 101 325 N/m²',f(r*p/ATM,2),'38.2'],
      {sect:'For comparison'},['p<sub>0,1</sub> (N/m²)','freestream total pressure, isentropic',sci(p/pp0(M,G)),null],['p<sub>0,2</sub>/p<sub>0,1</sub>','the bow shock keeps this fraction',f(NS(M,G).p0r,4),null]],def,'Appendix B');});
  watch(['d24_T','d24_p','d24_pp'],()=>{const T=num('d24_T'),p=num('d24_p'),pp=num('d24_pp'),def=near(T,216.66)&&near(p,2527.3)&&near(pp,38800),r=pp/p,thr=1/pp0(1,G);
    if(!(T>0&&p>0&&r>thr)){$('d24_ban').innerHTML=banner('bad','Check the inputs.',`This example needs a supersonic reading, p_Pitot/p₁ > ${f(thr,3)}.`);$('d24_tab').innerHTML='';return;}
    $('d24_ban').innerHTML='';const M=inv(m=>pitot(m,G),r,1,50),a=Math.sqrt(G*RAIR*T);
    exTable('d24_tab',[['p<sub>0,2</sub>/p<sub>1</sub>','measured / static',f(r,3),'15.35'],['M<sub>1</sub>','invert (8.80), App. B',f(M,4),'3.4',1],['a<sub>1</sub> (m/s)','√(γRT<sub>1</sub>)',f(a,2),'295'],['u<sub>1</sub> (m/s)','M<sub>1</sub>a<sub>1</sub>',f(M*a,1),'1003',1]],def,'Appendices B and D');});
})();

/* =====================================================================
   Self-check quiz
   ===================================================================== */
(function(){
  const Q=[
    ['Which quantity is the same on both sides of a stationary normal shock in a calorically perfect gas?',['Total pressure p<sub>0</sub>','Total temperature T<sub>0</sub>','Entropy s','Mach number'],1,'The flow through the shock is adiabatic, so h<sub>0</sub> and, for a calorically perfect gas, T<sub>0</sub> are unchanged (8.69). Total pressure falls and entropy rises.'],
    ['The flow behind a normal shock is always…',['supersonic','sonic','subsonic','hypersonic'],2,'For M<sub>1</sub> &gt; 1, Eq. (8.59) gives M<sub>2</sub> &lt; 1. As M<sub>1</sub> → ∞, M<sub>2</sub> tends to 0.378 for air.'],
    ['As M<sub>1</sub> → ∞ in air, the density ratio ρ<sub>2</sub>/ρ<sub>1</sub> across a normal shock tends to…',['∞','1','6','0.378'],2,'ρ<sub>2</sub>/ρ<sub>1</sub> → (γ + 1)/(γ − 1) = 6, while p<sub>2</sub>/p<sub>1</sub> and T<sub>2</sub>/T<sub>1</sub> grow without bound.'],
    ['Why can a normal shock not form in a subsonic flow?',['The momentum equation has no solution for M<sub>1</sub> &lt; 1','The entropy would decrease, which the second law forbids','The total temperature would change','The speed of sound would become imaginary'],1,'The conservation laws do have a solution for M<sub>1</sub> &lt; 1, an expansion “shock”, but Eq. (8.68) gives s<sub>2</sub> − s<sub>1</sub> &lt; 0 for it. Try M<sub>1</sub> = 0.8 in Interactive 4.'],
    ['What physically produces the entropy rise across a shock?',['Heat added from outside the flow','Friction and heat conduction inside the thin shock layer, where the gradients are large','The body force of gravity','Chemical reactions'],1,'The shock is only about 10<sup>−5</sup> cm thick, so the velocity and temperature gradients inside it are very large; viscous dissipation and heat conduction there are irreversible.'],
    ['The speed of sound in a calorically perfect gas depends on…',['pressure only','density only','temperature only','pressure and density separately'],2,'a = √(γRT): for a given gas the speed of sound is a function of temperature only.'],
    ['At the same temperature, sound travels about how much faster in helium than in air?',['The same speed','About 1.4 times','About 2.9 times','About 7 times'],2,'a<sub>He</sub>/a<sub>air</sub> = √((1.67 × 2078.5)/(1.4 × 287)) = 2.94 (Example 8.6).'],
    ['As M → ∞, the characteristic Mach number M* = u/a* of air tends to…',['∞','1','2.449','0.378'],2,'M*² = (γ + 1)M²/[2 + (γ − 1)M²] → (γ + 1)/(γ − 1) = 6, so M* → 2.449.'],
    ['A Pitot tube in a supersonic stream reads…',['the freestream total pressure p<sub>0,1</sub>','the freestream static pressure p<sub>1</sub>','the total pressure behind the normal part of the bow shock, p<sub>0,2</sub>','the static pressure behind the shock, p<sub>2</sub>'],2,'The gas on the stagnation streamline crosses the normal part of the bow shock, then is brought to rest isentropically at the mouth, so the tube reads p<sub>0,2</sub> &lt; p<sub>0,1</sub>.'],
    ['A Pitot tube reads 12.06 atm where the static pressure is 1 atm. Applying the isentropic formula (8.74) would give M = 2.28. The correct Mach number is…',['2.28','3.00','1.89','12.06'],1,'The reading exceeds 1.893 p<sub>1</sub>, so the flow is supersonic and the Rayleigh Pitot formula applies: M<sub>1</sub> = 3.00 (Example 8.22c). Ignoring the bow shock underestimates the Mach number by 24%.'],
    ['Which single piece of information does NOT determine the strength of a normal shock?',['p<sub>2</sub>/p<sub>1</sub>','T<sub>2</sub>/T<sub>1</sub>','M<sub>2</sub>','the upstream velocity u<sub>1</sub>'],3,'Any one property ratio, or M<sub>2</sub>, fixes M<sub>1</sub> (Examples 8.15–8.17). A velocity alone does not: the temperature is also needed to form a Mach number (Example 8.18).'],
    ['With p<sub>1</sub> = 1 atm, raising M<sub>1</sub> from 2 to 4 multiplies the loss of total pressure across a normal shock by about…',['2','8','16','60'],3,'The loss grows from 2.18 atm to 130.8 atm, about 60 times (Example 8.12). If a shock must occur, it is best at the lowest possible Mach number.']];
  const box=$('quiz'),ans={};
  box.innerHTML=Q.map((q,i)=>`<div class="qitem" role="group" aria-labelledby="qt${i}"><p class="qt" id="qt${i}"><span class="qn">${i+1}</span>${q[0]}</p><div class="opts">${q[1].map((o,j)=>`<label id="ql${i}_${j}"><input type="radio" name="q${i}" value="${j}"> <span>${o}</span></label>`).join('')}</div><p class="fb" id="qf${i}" hidden></p></div>`).join('');
  const score=()=>{const n=Object.keys(ans).length,c=Object.values(ans).filter(Boolean).length;$('q_score').textContent=n?`Score: ${c} / ${n} answered (${Q.length} total)`:'';};
  Q.forEach((q,i)=>{box.querySelectorAll(`input[name="q${i}"]`).forEach(inp=>inp.addEventListener('change',()=>{
    const j=+inp.value,ok=j===q[2];ans[i]=ok;
    q[1].forEach((_,k)=>{const l=$(`ql${i}_${k}`);l.classList.remove('right','wrong');if(k===q[2])l.classList.add('right');else if(k===j)l.classList.add('wrong');});
    const fb=$('qf'+i);fb.hidden=false;fb.className='fb '+(ok?'ok':'no');fb.innerHTML=`<b>${ok?'Correct.':'Not quite.'}</b> ${q[3]}`;score();}));});
})();

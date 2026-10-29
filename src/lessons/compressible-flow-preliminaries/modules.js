/* Chapter 7 · Compressible flow: preliminary aspects. Uses quasi1d.js (pp0, TT0, rr0), atmosphere.js, helpers.js and kit.js. */
const hooks={};
const RAIR=287, ATM=101325;
const cpG=()=>G*RAIR/(G-1), cvG=()=>RAIR/(G-1);

/* =====================================================================
   Static figures: thermodynamic system, compressibility, total conditions, shocks
   ===================================================================== */
(function(){
  let pf='sys',s=markers(pf);
  s+=`<ellipse cx="210" cy="122" rx="122" ry="68" fill="none" style="stroke:var(--body)" stroke-width="2.2"/>`;
  s+=tx([210,116],'System','flab','text-anchor="middle"')+tx([210,136],'fixed mass, internal energy e','axlab','text-anchor="middle"');
  s+=arrow([372,30],[306,78],'comp',pf,2)+tx([376,26],'δq: heat added','flab','text-anchor="end" style="fill:var(--comp)"');
  s+=arrow([44,212],[118,170],'exp',pf,2)+tx([40,226],'δw: work done on the system','flab','style="fill:var(--exp)"');
  s+=tx([54,40],'boundary','axlab')+ln([86,46],[120,72],'mach',1)+tx([412,214],'surroundings','axlab','text-anchor="end"');
  $('sys_fig').innerHTML=s;
  pf='cmp';s=markers(pf);
  const box=(x,y,w,lab,pl,n)=>{let o=`<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="none" style="stroke:var(--body)" stroke-width="2"/>`+tx([x+w/2,y+w/2+5],lab,'flab','text-anchor="middle"');
    const L=n;for(const k of [0.3,0.7]){const cx=x+w*k,cy=y+w*k;o+=arrow([cx,y-L],[cx,y-3],'muted',pf,1.4)+arrow([cx,y+w+L],[cx,y+w+3],'muted',pf,1.4)+arrow([x-L,cy],[x-3,cy],'muted',pf,1.4)+arrow([x+w+L,cy],[x+w+3,cy],'muted',pf,1.4);}
    return o+tx([x-L-4,y+w*0.3-6],pl,'flab','text-anchor="end"');};
  s+=box(70,40,92,'v','p',22)+box(292,52,68,'v + dv','p + dp',30);
  s+=tx([210,160],'dv < 0 when dp > 0','axlab','text-anchor="middle"');
  $('cmp_fig').innerHTML=s;
  pf='tot';s=markers(pf);
  const panel=(x0,title,l1,l2,c)=>{let o=tx([x0+100,18],title,'flab','text-anchor="middle"');
    o+=`<path d="M${x0+10},120 C${x0+70},80 ${x0+130},70 ${x0+196},96" fill="none" style="stroke:var(--stream)" stroke-width="2" marker-end="url(#${pf}-stream)"/>`;
    o+=dot([x0+48,98],'ink',4.5)+tx([x0+44,88],'1','flab','text-anchor="end"')+dot([x0+150,79],'ink',4.5)+tx([x0+154,70],'2','flab');
    o+=tx([x0+100,150],l1,'axlab','text-anchor="middle"'+(c?` style="fill:var(--${c})"`:''))+tx([x0+100,170],l2,'axlab','text-anchor="middle"');return o;};
  s+=panel(4,'Isentropic flow','p₀,₁ = p₀,₂,  ρ₀,₁ = ρ₀,₂','T₀,₁ = T₀,₂,  h₀,₁ = h₀,₂')+panel(214,'Adiabatic, nonisentropic','p₀,₁ ≠ p₀,₂,  ρ₀,₁ ≠ ρ₀,₂','T₀,₁ = T₀,₂,  h₀,₁ = h₀,₂','comp');
  s+=tx([210,200],'Non-adiabatic flow: T₀ and h₀ change as well.','axlab','text-anchor="middle"');
  $('tot_fig').innerHTML=s;
  pf='shk';s=markers(pf);
  s+=ln([70,214],[150,34],'comp',3)+arrow([8,150],[96,150],'ink',pf,2)+arrow([112,146],[196,112],'ink',pf,2)+tx([12,140],'M₁ > 1','flab')+tx([196,104],'M₂ < M₁','flab','text-anchor="end"')+tx([110,232],'oblique shock','axlab','text-anchor="middle"');
  s+=ln([320,30],[320,214],'comp',3)+arrow([232,122],[314,122],'ink',pf,2)+arrow([326,122],[372,122],'ink',pf,2)+tx([236,112],'M₁ > 1','flab')+tx([412,112],'M₂ < 1','flab','text-anchor="end"')+tx([320,232],'normal shock','axlab','text-anchor="middle"');
  s+=tx([210,20],'p, ρ, T, s rise;  M, V, p₀ fall;  h₀ and T₀ unchanged','axlab','text-anchor="middle"');
  $('sh_fig').innerHTML=s;
})();
(function(){const go=()=>{$('pg_cp').innerHTML=`For γ = ${f(G,3)} and R = 287 J/(kg·K): c<sub>p</sub> = ${f(cpG(),1)} J/(kg·K), c<sub>v</sub> = ${f(cvG(),1)} J/(kg·K).`;};renderers.push(go);})();

/* =====================================================================
   Worked examples 7.1–7.3
   ===================================================================== */
(function(){
  tabset('exA');
  watch(['a1_L','a1_W','a1_H','a1_p','a1_T'],()=>{const L=num('a1_L'),W=num('a1_W'),H=num('a1_H'),pa=num('a1_p'),Tc=num('a1_T'),def=near(L,5)&&near(W,7)&&near(H,3.3)&&near(pa,1)&&near(Tc,25);
    const T=Tc+273.15,p=pa*ATM;if(!(L>0&&W>0&&H>0&&p>0&&T>0)){$('a1_tab').innerHTML='';return;}
    const rho=p/(RAIR*T),V=L*W*H,m=rho*V,e=cvG()*T,h=cpG()*T;
    exTable('a1_tab',[{sect:'(a) Internal energy'},['c<sub>v</sub> (J/(kg·K))','R/(γ − 1) (7.10)',f(cvG(),1),'717.5'],['e (J/kg)','c<sub>v</sub>T',f(e,0),'213 815'],['ρ (kg/m³)','p/(RT)',f(rho,4),'1.181'],['Volume (m³)','',f(V,2),'115.5'],['m (kg)','ρV',f(m,2),'136.4'],['E (J)','me',sci(m*e),'2.917 × 10<sup>7</sup>',1],
      {sect:'(b) Enthalpy'},['c<sub>p</sub> (J/(kg·K))','γR/(γ − 1) (7.9)',f(cpG(),1),'1004.5'],['h (J/kg)','c<sub>p</sub>T',f(h,0),'299 341'],['H (J)','mh',sci(m*h),'4.083 × 10<sup>7</sup>',1],['Check: H/E','c<sub>p</sub>/c<sub>v</sub> = γ',f(h/e,4),'1.4']],def);});
  watch(['a2_V','a2_m','a2_T','a2_p1','a2_p2'],()=>{const V=num('a2_V'),md=num('a2_m'),T=num('a2_T'),p1=num('a2_p1'),p2=num('a2_p2'),def=near(V,30)&&near(md,1)&&near(T,300)&&near(p1,10)&&near(p2,20);
    if(!(V>0&&md>0&&T>0)){$('a2_tab').innerHTML='';return;}
    const dp=RAIR*T/V*md;
    exTable('a2_tab',[{sect:'Example 7.2'},['dρ/dt (kg/(m³·s))','(1/V) dM/dt',f(md/V,4),'0.0333'],['dp/dt (N/(m²·s))','(RT/V) dM/dt',f(dp,2),'2867.13',1,1],
      {sect:'Example 7.3'},['Δp (N/m²)','(p<sub>2</sub> − p<sub>1</sub>), 1 atm = 101 325 N/m²',f((p2-p1)*ATM,0),'10 × 1.01 × 10<sup>5</sup>'],['Δt (s)','Δp/(dp/dt)',f((p2-p1)*ATM/dp,1),'352.3',1,1]],def);});
})();

/* =====================================================================
   Interactive 1 · Isentropic and nonisentropic changes of state (T–s)
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('tsx_ctl',[
    {k:'p1',id:'tsx_p1',label:'Initial pressure, p₁',unit:'atm',min:0.5,max:40,step:0.1,v:20,nmin:0.001,nmax:1000,aria:'Initial pressure slider'},
    {k:'T1',id:'tsx_T1',label:'Initial temperature, T₁',unit:'K',min:150,max:800,step:1,v:300,nmin:1,nmax:5000,dec:1,aria:'Initial temperature slider'},
    {k:'p2',id:'tsx_p2',label:'Final pressure, p₂',unit:'atm',min:0.1,max:40,step:0.1,v:1,nmin:0.001,nmax:1000,aria:'Final pressure slider'},
    {k:'ds',id:'tsx_ds',label:'Entropy change, s₂ − s₁',unit:'J/(kg·K)',min:-300,max:800,step:5,v:0,nmin:-2000,nmax:3000,dec:1,aria:'Entropy change slider'}],go);
  presets('tsx_pre',[['Ex 7.5(a): isentropic, 20 → 1 atm',{p1:20,T1:300,p2:1,ds:0}],['Ex 7.5(b): Δs = 320 J/(kg·K)',{p1:20,T1:300,p2:1,ds:320}],['Isentropic compression, 1 → 10 atm',{p1:1,T1:300,p2:10,ds:0}],['Heat removed: Δs = −150 J/(kg·K)',{p1:20,T1:300,p2:1,ds:-150}]],S);
  hooks.tsx=o=>{S.set(o);$('tsx').scrollIntoView({behavior:reduceMotion?'auto':'smooth'});};
  renderers.push(go);
  const P={x0:66,y0:14,w:676,h:262};
  function render(){
    const cp=cpG(),cv=cvG(),k=(G-1)/G,{p1,T1,p2,ds}=S;
    const T2s=T1*Math.pow(p2/p1,k),T2=T2s*Math.exp(ds/cp),r21=(p2/T2)/(p1/T1);
    const xmin=-400,xmax=900,Tmax=Math.max(T1,T2,T2s),Tmin=Math.min(T1,T2,T2s);
    const ymin=Math.max(0,Math.floor(Tmin*0.6/50)*50),ymax=Math.ceil(Tmax*1.25/50)*50;
    const yt=[];const st=ymax-ymin>600?200:ymax-ymin>300?100:50;for(let v=ymin;v<=ymax;v+=st)yt.push(v);
    const A=frame({...P,xmin,xmax,ymin,ymax,xt:[-400,-200,0,200,400,600,800],yt,xlab:'Entropy change s − s₁ (J/(kg·K))',ylab:'Temperature T (K)',ylabdx:48,clip:'tsxc'});
    const iso=pr=>sv=>T1*Math.pow(pr,k)*Math.exp(sv/cp);
    let s=`<defs>${A.clipDef}${markers('tsx')}</defs>`+A.svg+`<g clip-path="url(#tsxc)">`+path(curve(iso(1),xmin,xmax,A.X,A.Y,160),'exp',1.8)+path(curve(iso(p2/p1),xmin,xmax,A.X,A.Y,160),'comp',1.8)+'</g>';
    const lab=(pr,t,c)=>{const sx=cp*Math.log(ymax/(T1*Math.pow(pr,k)));const x=Math.min(xmax,sx),y=iso(pr)(x);return tx([A.X(x)-6,Math.max(A.Y(y),P.y0)+(sx<xmax?14:-6)],t,'flab',`text-anchor="end" style="fill:var(--${c})"`);};
    s+=lab(1,`p₁ = ${f(p1,2)} atm`,'exp')+lab(p2/p1,`p₂ = ${f(p2,2)} atm`,'comp');
    s+=ln([A.X(0),A.Y(T1)],[A.X(0),A.Y(T2s)],'mach',1.8,'stroke-dasharray="6 4"');
    if(Math.abs(ds)>1e-9||Math.abs(T2-T1)>1e-9)s+=arrow([A.X(0),A.Y(T1)],[A.X(ds),A.Y(T2)],ds<0?'warn':'ink','tsx',2.2);
    s+=dot([A.X(0),A.Y(T1)],'exp',5)+tx([A.X(0)-8,A.Y(T1)-8],'1','flab','text-anchor="end"');
    if(Math.abs(ds)>1)s+=dot([A.X(0),A.Y(T2s)],'mach',5)+tx([A.X(0)-8,A.Y(T2s)+4],'2s','flab','text-anchor="end"');
    s+=dot([A.X(ds),A.Y(T2)],'comp',5)+tx([A.X(ds)+8,A.Y(T2)+4],'2','flab');
    $('tsx_fig').innerHTML=s;
    $('tsx_tiles').innerHTML=[['T₂s, isentropic (K)',f(T2s,2),'T₁(p₂/p₁)<sup>(γ−1)/γ</sup>, (7.28)'],['T₂, actual (K)',f(T2,2),'T₂s exp(Δs/c<sub>p</sub>), from (7.25)'],['ρ₂/ρ₁',f(r21,4),'(p₂/p₁)(T₁/T₂)'],['h₂ − h₁ (kJ/kg)',f(cp*(T2-T1)/1000,2),'c<sub>p</sub>(T₂ − T₁)']].map(([a,b,c])=>`<div class="tile"><span class="k">${a}</span><span class="v">${b}</span><span class="s">${c}</span></div>`).join('');
    $('tsx_out').innerHTML=readout([['T₂ − T₂s (heat left in the gas by dissipation)',f(T2-T2s,2)+' K'],['e₂ − e₁ = c<sub>v</sub>(T₂ − T₁)',f(cv*(T2-T1)/1000,2)+' kJ/kg'],['v₂/v₁ = ρ₁/ρ₂',f(1/r21,4)],['Check (7.26): c<sub>v</sub> ln(T₂/T₁) + R ln(v₂/v₁)',f(cv*Math.log(T2/T1)+RAIR*Math.log(1/r21),2)+' J/(kg·K)'],['(ρ₂/ρ₁)<sup>γ</sup> vs p₂/p₁ (equal only if Δs = 0)',`${f(Math.pow(r21,G),4)} vs ${f(p2/p1,4)}`]]);
    $('tsx_msg').innerHTML=ds<-1e-9?banner('warn','Entropy decreases.','Only possible if heat is removed (δq < 0): by (7.16), ds ≥ δq/T. An adiabatic process requires ds ≥ 0 (7.17).'):'';
    $('tsx_short').textContent=`T₂ = ${f(T2,1)} K${Math.abs(ds)<1e-9?' (isentropic)':''}`;
  }
})();

/* =====================================================================
   Worked examples 7.4–7.5
   ===================================================================== */
(function(){
  tabset('exB');
  watch(['b4_pi','b4_Ti','b4_p'],()=>{const pi=num('b4_pi'),Ti=num('b4_Ti'),p=num('b4_p'),def=near(pi,23422)&&near(Ti,218.08)&&near(p,19160);
    if(!(pi>0&&Ti>0&&p>0)){$('b4_tab').innerHTML='';return;}
    const r=Math.pow(p/pi,(G-1)/G),A=atm(10800);
    exTable('b4_tab',[['p/p<sub>∞</sub>','',f(p/pi,5),'1.914/2.3422',0,1],['(p/p<sub>∞</sub>)<sup>(γ−1)/γ</sup>','(7.32)',f(r,5),null],['T (K)','T<sub>∞</sub>(p/p<sub>∞</sub>)<sup>(γ−1)/γ</sup>',f(Ti*r,2),'207.3',1,1],
      {sect:'Standard atmosphere at 10.8 km (this site’s model of Appendix D)'},['T<sub>∞</sub> (K), p<sub>∞</sub> (N/m²)','',`${f(A.T,2)}, ${f(A.p,0)}`,null]],def,'Appendix D');});
  watch(['b5_p1','b5_T1','b5_p2','b5_ds'],()=>{const p1=num('b5_p1'),T1=num('b5_T1'),p2=num('b5_p2'),ds=num('b5_ds'),def=near(p1,20)&&near(T1,300)&&near(p2,1)&&near(ds,320);
    if(!(p1>0&&T1>0&&p2>0&&isFinite(ds))){$('b5_tab').innerHTML='';return;}
    const cp=cpG(),T2s=T1*Math.pow(p2/p1,(G-1)/G),l=(ds+RAIR*Math.log(p2/p1))/cp;
    exTable('b5_tab',[{sect:'(a) Isentropic expansion'},['T<sub>2</sub> (K)','T<sub>1</sub>(p<sub>2</sub>/p<sub>1</sub>)<sup>(γ−1)/γ</sup> (7.32)',f(T2s,2),'127.5',1],
      {sect:'(b) Nonisentropic expansion'},['c<sub>p</sub> (J/(kg·K))','γR/(γ − 1)',f(cp,1),'1004.5'],['ln(T<sub>2</sub>/T<sub>1</sub>)','[s<sub>2</sub> − s<sub>1</sub> + R ln(p<sub>2</sub>/p<sub>1</sub>)]/c<sub>p</sub>, from (7.25)',f(l,4),'−0.5374'],['T<sub>2</sub> (K)','T<sub>1</sub> e<sup>ln(T₂/T₁)</sup>',f(T1*Math.exp(l),2),'175.3',1]],def);});
  $('b5_go').onclick=()=>{if(hooks.tsx)hooks.tsx({p1:num('b5_p1'),T1:num('b5_T1'),p2:num('b5_p2'),ds:num('b5_ds')});};
})();

/* =====================================================================
   Interactive 2 · When does a flow become compressible?
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('cv_ctl',[{k:'V',id:'cv_V',label:'Flow speed, V',unit:'m/s',min:1,max:400,step:1,v:102,nmin:0.1,nmax:400,dec:1,aria:'Flow speed slider'}],go);
  presets('cv_pre',[['Car at highway speed: 30 m/s',{V:30}],['Light aircraft: 60 m/s',{V:60}],['M = 0.3: 102 m/s',{V:102}],['M = 0.8: 272 m/s',{V:272}]],S);
  renderers.push(go);
  const P={x0:66,y0:14,w:676,h:256},TW=4.6e-10,RW=998,p=ATM,T=288.16,rho=p/(RAIR*T);
  dragX('cv_fig',{x0:P.x0,w:P.w,xmin:0,xmax:400,y0:P.y0,y1:P.y0+P.h},V=>S.set({V:Math.max(1,Math.round(V))}));
  function render(){
    const a=Math.sqrt(G*RAIR*T),V=S.V,M=V/a;
    const air=v=>{const m=v/a;return (1/rr0(m,G)-1)*100;},est=v=>(v/a)*(v/a)/2*100,wat=v=>TW*0.5*RW*v*v*100;
    const A=frame({...P,xmin:0,xmax:400,ymin:1e-5,ymax:100,log:true,xt:[0,50,100,150,200,250,300,350,400],yt:[1e-5,1e-4,1e-3,1e-2,0.1,1,10,100],fy:v=>v>=1?v+'%':v>=0.01?v+'%':`10<tspan dy="-6" font-size="9">${Math.round(Math.log10(v))}</tspan><tspan dy="6">%</tspan>`,xlab:'Flow speed V (m/s), sea level',ylab:'Density change Δρ/ρ',ylabdx:52,clip:'cvc'});
    let s=`<defs>${A.clipDef}</defs>`+A.svg+`<g clip-path="url(#cvc)">`+path(curve(air,0.5,400,A.X,A.Y,300),'comp',2.4)+path(curve(est,0.5,400,A.X,A.Y,300),'comp',1.6,'stroke-dasharray="6 5"')+path(curve(wat,0.5,400,A.X,A.Y,300),'exp',2.4)+'</g>';
    s+=ln([A.X(0),A.Y(5)],[A.X(400),A.Y(5)],'mach',1.3,'stroke-dasharray="6 4"')+tx([A.X(4),A.Y(5)-6],'5%','axlab');
    [[0.3,'M = 0.3',P.y0+14],[1,'M = 1',P.y0+P.h-8]].forEach(([m,t,yy])=>{const x=m*a;if(x<=400)s+=ln([A.X(x),P.y0],[A.X(x),P.y0+P.h],'mach',1.2,'stroke-dasharray="4 4"')+tx([A.X(x)+4,yy],t,'axlab');});
    s+=tx([A.X(380),A.Y(air(380))+18],'air','flab','text-anchor="end" style="fill:var(--comp)"')+tx([A.X(380),A.Y(wat(380))-8],'water','flab','text-anchor="end" style="fill:var(--exp)"');
    s+=ln([A.X(V),P.y0],[A.X(V),P.y0+P.h],'accent',1.6)+dot([A.X(V),A.Y(air(V))],'comp',5.5)+dot([A.X(V),A.Y(wat(V))],'exp',5.5);
    $('cv_fig').innerHTML=s;
    const q=0.5*rho*V*V;
    $('cv_tiles').innerHTML=[['Mach number in air',f(M,3),regimeTxt(M)],['Dynamic pressure ½ρV², air',f(q/1000,2)+' kPa',`water: ${f(0.5*RW*V*V/1000,1)} kPa`],['Δρ/ρ, air',f(air(V),3)+' %',`estimate M²/2: ${f(est(V),3)} %`],['Δρ/ρ, water',f(wat(V),5)+' %',`${f(air(V)/wat(V),0)}× smaller than in air`]].map(([k,v,d])=>`<div class="tile"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${d}</span></div>`).join('');
    $('cv_short').textContent=`M = ${f(M,2)}, Δρ/ρ = ${f(air(V),2)}% in air`;
  }
  function regimeTxt(M){return M<0.3?'incompressible is a good model':M<0.8?'compressible, subsonic':M<1.2?'transonic':'supersonic';}
})();

/* =====================================================================
   Interactive 3 · Total conditions and Bernoulli
   ===================================================================== */
(function(){
  const go=sched(render);
  const S=controls('tc_ctl',[
    {k:'p',id:'tc_p',label:'Static pressure, p',unit:'atm',min:0.05,max:10,step:0.01,v:1,nmin:0.0001,nmax:1000,aria:'Static pressure slider'},
    {k:'T',id:'tc_T',label:'Static temperature, T',unit:'K',min:150,max:1000,step:1,v:320,nmin:1,nmax:5000,dec:2,aria:'Static temperature slider'},
    {k:'V',id:'tc_V',label:'Velocity, V',unit:'m/s',min:0,max:2500,step:1,v:1000,nmin:0,nmax:10000,dec:1,aria:'Velocity slider'}],go);
  presets('tc_pre',[['Ex 7.6: 1 atm, 320 K, 1000 m/s',{p:1,T:320,V:1000}],['Ex 7.7: 3 km, 261 m/s',{p:70121/ATM,T:268.67,V:261.1}],['Low speed: 50 m/s at sea level',{p:1,T:288.16,V:50}],['High altitude, 2500 m/s',{p:0.05,T:220,V:2500}]],S);
  renderers.push(go);
  const L={x0:66,y0:14,w:470,h:256},B={x0:610,y0:30,w:60,h:240};
  dragX('tc_fig',{x0:L.x0,w:L.w,xmin:0,xmax:3,y0:L.y0,y1:L.y0+L.h},M=>S.set({V:Math.round(M*Math.sqrt(G*RAIR*S.T))}));
  function render(){
    const cp=cpG(),{p,T,V}=S,a=Math.sqrt(G*RAIR*T),M=V/a,T0=T+V*V/(2*cp),p0=p*Math.pow(T0/T,G/(G-1)),rho=p*ATM/(RAIR*T),rho0=rho*Math.pow(T0/T,1/(G-1));
    const Ts=T0*2/(G+1),as=Math.sqrt(G*RAIR*Ts),pB=p+0.5*rho*V*V/ATM,h=cp*T,ke=V*V/2;
    const A=frame({...L,xmin:0,xmax:3,ymin:1,ymax:40,log:true,xt:[0,0.5,1,1.5,2,2.5,3],yt:[1,2,5,10,20,40],xlab:'Mach number M',ylab:'Total / static pressure',ylabdx:44,clip:'tcc'});
    let s=`<defs>${A.clipDef}</defs>`+A.svg+`<g clip-path="url(#tcc)">`+path(curve(m=>1/pp0(m,G),0,3,A.X,A.Y),'comp',2.4)+path(curve(m=>1+G*m*m/2,0,3,A.X,A.Y),'exp',2,'stroke-dasharray="6 5"')+'</g>';
    s+=ln([A.X(0.3),L.y0],[A.X(0.3),L.y0+L.h],'mach',1.2,'stroke-dasharray="4 4"')+tx([A.X(0.3)+4,L.y0+14],'M = 0.3','axlab');
    s+=tx([A.X(1.9)-6,A.Y(1/pp0(1.9,G))-8],'isentropic','flab','text-anchor="end" style="fill:var(--comp)"')+tx([A.X(1.9)+6,A.Y(1+G*1.9*1.9/2)+18],'Bernoulli','flab','style="fill:var(--exp)"');
    if(M<=3){s+=ln([A.X(M),L.y0],[A.X(M),L.y0+L.h],'accent',1.6)+dot([A.X(M),A.Y(p0/p)],'comp',5.5)+dot([A.X(M),A.Y(pB/p)],'exp',5.5,true);}
    else s+=tx([L.x0+L.w-6,L.y0+16],`M = ${f(M,2)} is beyond the plotted range`,'axlab','text-anchor="end"');
    /* energy bar */
    const h0=h+ke,sc=B.h/h0,yh=B.y0+B.h-h*sc;
    s+=`<rect x="${B.x0}" y="${fx(yh)}" width="${B.w}" height="${fx(h*sc)}" style="fill:var(--warn)" opacity="0.85"/><rect x="${B.x0}" y="${B.y0}" width="${B.w}" height="${fx(ke*sc)}" style="fill:var(--stream)" opacity="0.85"/>`;
    s+=tx([B.x0+B.w/2,B.y0-10],`h₀ = ${f(h0/1000,1)} kJ/kg`,'flab','text-anchor="middle"');
    s+=tx([B.x0+B.w+8,B.y0+Math.max(14,ke*sc/2+4)],`V²/2 (${f(ke/h0*100,0)}%)`,'axlab')+tx([B.x0+B.w+8,Math.min(B.y0+B.h-4,yh+h*sc/2+4)],`h (${f(h/h0*100,0)}%)`,'axlab');
    s+=tx([B.x0+B.w/2,B.y0+B.h+18],'energy per unit mass','axlab','text-anchor="middle"');
    $('tc_fig').innerHTML=s;
    $('tc_tiles').innerHTML=[['M = V/√(γRT)',f(M,4),M<0.3?'nearly incompressible':M<1?'subsonic':'supersonic'],['T₀ (K)',f(T0,2),'T + V²/(2c<sub>p</sub>), adiabatic'],['p₀ (atm)',f(p0,4),'isentropic deceleration'],['ρ₀ (kg/m³)',f(rho0,4),`ρ = ${f(rho,4)} kg/m³`]].map(([k,v,d])=>`<div class="tile"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${d}</span></div>`).join('');
    $('tc_out').innerHTML=readout([['h = c<sub>p</sub>T, V²/2, h<sub>0</sub>',`${f(h/1000,2)}, ${f(ke/1000,2)}, ${f(h0/1000,2)} kJ/kg`],['T* = 2T<sub>0</sub>/(γ + 1), a* = √(γRT*)',`${f(Ts,2)} K, ${f(as,1)} m/s`],['p + ½ρV² (Bernoulli’s “total pressure”)',f(pB,4)+' atm'],['Bernoulli error in p<sub>0</sub>',f((pB/p0-1)*100,2)+' %','hl']]);
    $('tc_short').textContent=`T₀ = ${f(T0,1)} K, p₀ = ${f(p0,3)} atm`;
  }
})();

/* =====================================================================
   Worked examples 7.6–7.7
   ===================================================================== */
(function(){
  tabset('exC');
  watch(['c6_p','c6_T','c6_V'],()=>{const p=num('c6_p'),T=num('c6_T'),V=num('c6_V'),def=near(p,1)&&near(T,320)&&near(V,1000);
    if(!(p>0&&T>0&&V>=0)){$('c6_tab').innerHTML='';return;}
    const cp=cpG(),T0=T+V*V/(2*cp),p0=p*Math.pow(T0/T,G/(G-1)),rho=p*ATM/(RAIR*T);
    exTable('c6_tab',[['c<sub>p</sub> (J/(kg·K))','γR/(γ − 1)',f(cp,1),'1004.5'],['T<sub>0</sub> (K)','T + V²/(2c<sub>p</sub>) (7.54)',f(T0,2),'817.8',1],['p<sub>0</sub> (atm)','p(T<sub>0</sub>/T)<sup>γ/(γ−1)</sup> (7.32)',f(p0,3),'26.7',1],
      {sect:'For comparison'},['M','V/√(γRT)',f(V/Math.sqrt(G*RAIR*T),4),null],['p + ½ρV² (atm)','Bernoulli, ρ = p/(RT)',f(p+0.5*rho*V*V/ATM,3),null]],def);});
  watch(['c7_T','c7_p','c7_p0'],()=>{const T=num('c7_T'),p=num('c7_p'),p0=num('c7_p0'),def=near(T,268.67)&&near(p,70121)&&near(p0,106338);
    if(!(T>0&&p>0&&p0>p)){$('c7_ban').innerHTML=banner('bad','Check the inputs.','The Pitot pressure must exceed the static pressure.');$('c7_tab').innerHTML='';return;}
    $('c7_ban').innerHTML='';
    const cp=cpG(),a=Math.sqrt(G*RAIR*T),T0=T*Math.pow(p0/p,(G-1)/G),V=Math.sqrt(2*cp*(T0-T)),rho=p/(RAIR*T),VB=Math.sqrt(2*(p0-p)/rho),A3=atm(3000);
    exTable('c7_tab',[['480 km/h (m/s)','',f(480/3.6,2),'133.34'],['a<sub>∞</sub> (m/s)','√(γRT<sub>∞</sub>)',f(a,2),'328.56'],['M at 480 km/h','> 0.3: compressible',f(480/3.6/a,3),'0.4'],
      ['T<sub>0</sub> (K)','T<sub>∞</sub>(p<sub>0</sub>/p<sub>∞</sub>)<sup>(γ−1)/γ</sup> (7.32)',f(T0,2),'302.6'],['V<sub>∞</sub> (m/s)','√(2c<sub>p</sub>(T<sub>0</sub> − T<sub>∞</sub>)) (7.54)',f(V,1),'261',1],['M<sub>∞</sub>','V<sub>∞</sub>/a<sub>∞</sub>',f(V/a,3),'0.8'],
      {sect:'If Bernoulli were (wrongly) used'},['V (m/s)','√(2(p<sub>0</sub> − p<sub>∞</sub>)/ρ<sub>∞</sub>)',f(VB,1),null],['Error','',f((VB/V-1)*100,1)+' %',null],
      {sect:'Standard atmosphere at 3 km (this site’s model of Appendix D)'},['T<sub>∞</sub> (K), p<sub>∞</sub> (N/m²)','',`${f(A3.T,2)}, ${f(A3.p,0)}`,null]],def,'Appendix D');});
})();

/* =====================================================================
   Self-check quiz
   ===================================================================== */
(function(){
  const Q=[
    ['A calorically perfect gas is a perfect gas whose…',['molecules occupy no volume','specific heats c<sub>p</sub> and c<sub>v</sub> are constant','entropy is constant','pressure is constant'],1,'With constant specific heats, e = c<sub>v</sub>T and h = c<sub>p</sub>T (7.6). Air is close to calorically perfect below about 1000 K.'],
    ['For a perfect gas, the internal energy e and enthalpy h depend on…',['pressure only','temperature only','the process','pressure and temperature'],1,'For a perfect gas e = e(T) and h = h(T) (7.4). They are state variables, independent of the process.'],
    ['For air (γ = 1.4, R = 287 J/(kg·K)), c<sub>p</sub> is…',['717.5 J/(kg·K)','287 J/(kg·K)','1004.5 J/(kg·K)','1.4 J/(kg·K)'],2,'c<sub>p</sub> = γR/(γ − 1) = 1.4 × 287/0.4 = 1004.5 J/(kg·K); c<sub>v</sub> = R/(γ − 1) = 717.5 J/(kg·K).'],
    ['An isentropic process is…',['adiabatic only','reversible only','both adiabatic and reversible','one at constant temperature'],2,'Isentropic means δq = 0 (adiabatic) and ds<sub>irrev</sub> = 0 (reversible), so ds = 0.'],
    ['For an adiabatic process, the second law requires…',['ds = 0','ds ≥ 0','ds ≤ 0','dT = 0'],1,'With δq = 0, ds = ds<sub>irrev</sub> ≥ 0 (7.17). The equality holds only when the process is also reversible.'],
    ['The entropy change s<sub>2</sub> − s<sub>1</sub> between two states of a calorically perfect gas depends on…',['the path between the states','only the end states','the heat added along the path','the work done along the path'],1,'Entropy is a state variable: (7.25) and (7.26) use only T, p or v at the two ends.'],
    ['Air at 20 atm and 300 K expands isentropically to 1 atm. Its temperature becomes about…',['300 K','175 K','127 K','15 K'],2,'T<sub>2</sub> = 300 (1/20)<sup>0.2857</sup> = 127.5 K (Example 7.5a). With an entropy increase of 320 J/(kg·K) it would be 175.3 K instead.'],
    ['At 1 atm, air is roughly how much more compressible than water?',['About 2 times','About 200 times','About 20 000 times','They are equal'],2,'τ<sub>T</sub> = 1/p ≈ 10<sup>−5</sup> m²/N for air against about 5 × 10<sup>−10</sup> m²/N for water.'],
    ['Why does Bernoulli’s equation fail in compressible flow?',['It ignores viscosity','It assumes constant density','It assumes constant temperature','It applies only to supersonic flow'],1,'Bernoulli’s equation is derived for constant density, which compressible flow violates. The energy equation h + V²/2 = h<sub>0</sub> replaces it.'],
    ['In a steady, adiabatic, inviscid flow from a uniform freestream, which quantity is the same everywhere?',['Static temperature','Total temperature','Static pressure','Mach number'],1,'h<sub>0</sub>, and so T<sub>0</sub> for a calorically perfect gas, is constant throughout the flow (7.55–7.56).'],
    ['Between two points of an adiabatic but nonisentropic flow (for example across a shock)…',['p<sub>0</sub> and T<sub>0</sub> are both unchanged','T<sub>0</sub> is unchanged but p<sub>0</sub> changes','p<sub>0</sub> is unchanged but T<sub>0</sub> changes','both change'],1,'T<sub>0</sub> needs only an adiabatic deceleration, so it is unchanged. p<sub>0</sub> is defined by an isentropic deceleration and falls when entropy rises.'],
    ['In Example 7.7 (M<sub>∞</sub> ≈ 0.8), using Bernoulli’s equation with the Pitot reading would give a velocity that is…',['about 8% too high','exact','about 8% too low','twice as large'],0,'Bernoulli gives 282 m/s against the correct 261 m/s: at M ≈ 0.8 the density rises by about 35% as the air comes to rest in the tube, which Bernoulli ignores.']];
  const box=$('quiz'),ans={};
  box.innerHTML=Q.map((q,i)=>`<div class="qitem" role="group" aria-labelledby="qt${i}"><p class="qt" id="qt${i}"><span class="qn">${i+1}</span>${q[0]}</p><div class="opts">${q[1].map((o,j)=>`<label id="ql${i}_${j}"><input type="radio" name="q${i}" value="${j}"> <span>${o}</span></label>`).join('')}</div><p class="fb" id="qf${i}" hidden></p></div>`).join('');
  const score=()=>{const n=Object.keys(ans).length,c=Object.values(ans).filter(Boolean).length;$('q_score').textContent=n?`Score: ${c} / ${n} answered (${Q.length} total)`:'';};
  Q.forEach((q,i)=>{box.querySelectorAll(`input[name="q${i}"]`).forEach(inp=>inp.addEventListener('change',()=>{
    const j=+inp.value,ok=j===q[2];ans[i]=ok;
    q[1].forEach((_,k)=>{const l=$(`ql${i}_${k}`);l.classList.remove('right','wrong');if(k===q[2])l.classList.add('right');else if(k===j)l.classList.add('wrong');});
    const fb=$('qf'+i);fb.hidden=false;fb.className='fb '+(ok?'ok':'no');fb.innerHTML=`<b>${ok?'Correct.':'Not quite.'}</b> ${q[3]}`;score();}));});
})();

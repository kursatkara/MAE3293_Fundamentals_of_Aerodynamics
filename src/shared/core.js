/* ---------- gas dynamics core (calorically perfect gas) ---------- */
const D=Math.PI/180, R=180/Math.PI;
function thetaOf(M,b,g){const s=Math.sin(b);return Math.atan(2/Math.tan(b)*(M*M*s*s-1)/(M*M*(g+Math.cos(2*b))+2));}
function betaMax(M,g){const m2=M*M;const s2=((g+1)*m2/4-1+Math.sqrt((g+1)*((g+1)*m2*m2/16+(g-1)*m2/2+1)))/(g*m2);return Math.asin(Math.min(1,Math.sqrt(s2)));}
function thetaMax(M,g){return thetaOf(M,betaMax(M,g),g);}
function betaSonic(M,g){ // beta where M2 = 1 (between mu and betaMax)
  let lo=Math.asin(1/M), hi=Math.PI/2;
  for(let i=0;i<80;i++){const m=(lo+hi)/2; const r=nsFromMn(M*Math.sin(m),g); const M2=r.Mn2/Math.sin(m-thetaOf(M,m,g)); if(M2>1) lo=m; else hi=m;}
  return (lo+hi)/2;}
function nsFromMn(Mn1,g){
  const s=Mn1*Mn1;
  const p21=1+2*g/(g+1)*(s-1);
  const r21=(g+1)*s/(2+(g-1)*s);
  const T21=p21/r21;
  const Mn2=Math.sqrt((1+(g-1)/2*s)/(g*s-(g-1)/2));
  const p0r=Math.pow(r21,g/(g-1))*Math.pow((g+1)/(2*g*s-(g-1)),1/(g-1));
  return {Mn1,Mn2,p21,r21,T21,p0r};
}
function shockFromBeta(M,b,g){const th=thetaOf(M,b,g);const n=nsFromMn(M*Math.sin(b),g);return Object.assign({type:'shock',M1:M,beta:b,theta:th,M2:n.Mn2/Math.sin(b-th)},n);}
function oblique(M,th,g,strong){
  const bm=betaMax(M,g), tm=thetaOf(M,bm,g);
  if(th>tm+1e-12) return {type:'detached',M1:M,theta:th,thmax:tm,betamax:bm};
  let lo,hi;
  if(!strong){lo=Math.asin(1/M);hi=bm;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(thetaOf(M,m,g)<th)lo=m;else hi=m;}}
  else{lo=bm;hi=Math.PI/2;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(thetaOf(M,m,g)>th)lo=m;else hi=m;}}
  const r=shockFromBeta(M,(lo+hi)/2,g); r.thmax=tm; r.betamax=bm; r.theta=th; r.M2=r.Mn2/Math.sin(r.beta-th); return r;
}
const T0T=(M,g)=>1+(g-1)/2*M*M;
const p0p=(M,g)=>Math.pow(T0T(M,g),g/(g-1));
const Ag=g=>Math.sqrt((g+1)/(g-1));
function nu(M,g){if(M<=1)return 0;const a=Ag(g);return a*Math.atan(Math.sqrt((M*M-1)/(a*a)))-Math.atan(Math.sqrt(M*M-1));}
const numax=g=>Math.PI/2*(Ag(g)-1);
function Mofnu(v,g){if(v<=0)return 1;let lo=1,hi=2;while(nu(hi,g)<v&&hi<1e8)hi*=2;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(nu(m,g)<v)lo=m;else hi=m;}return (lo+hi)/2;}
function pm(M,dth,g){ // isentropic turn: dth>0 expansion, dth<0 isentropic compression
  const n1=nu(M,g), n2=n1+dth;
  if(n2>=numax(g)*0.99999) return {type:'vacuum',M1:M,dth};
  if(n2<=0) return {type:'sonic',M1:M,dth};
  const M2=Mofnu(n2,g);
  const T21=T0T(M,g)/T0T(M2,g), p21=Math.pow(T21,g/(g-1)), r21=Math.pow(T21,1/(g-1));
  return {type:dth>=0?'exp':'isen',M1:M,M2,dth,nu1:n1,nu2:n2,mu1:Math.asin(1/M),mu2:Math.asin(1/M2),T21,p21,r21,p0r:1};
}
/* signed turn: th>0 compression (shock), th<0 expansion */
function turn(M,th,g){
  if(Math.abs(th)<1e-10) return {type:'none',M1:M,M2:M,theta:0,p21:1,T21:1,r21:1,p0r:1,mu1:Math.asin(1/M)};
  if(th>0) return oblique(M,th,g,false);
  const e=pm(M,-th,g); e.theta=th; return e;
}
const valid=w=>w&&(w.type==='shock'||w.type==='exp'||w.type==='none'||w.type==='isen');
/* two adjacent streams (upper stream direction phiU, lower phiL, radians, ccw+) meeting downstream:
   find common direction phi with equal pressure. Upper stream turned by phi-phiU (ccw => compression),
   lower stream turned by phiL-phi (cw => compression). Pressures relative to common reference. */
function slip(MU,pU,phiU,ML,pL,phiL,g){
  const pu=phi=>{const w=turn(MU,phi-phiU,g);return valid(w)?pU*w.p21:NaN;};
  const pl=phi=>{const w=turn(ML,phiL-phi,g);return valid(w)?pL*w.p21:NaN;};
  // bracket: search phi in a range around
  let lo=Math.min(phiU,phiL)-60*D, hi=Math.max(phiU,phiL)+60*D;
  const F=phi=>pu(phi)-pl(phi);
  // shrink to valid region: scan
  const N=600;let prev=null,pphi=null,root=null;
  for(let i=0;i<=N;i++){const phi=lo+(hi-lo)*i/N;const v=F(phi);if(isFinite(v)){if(prev!==null&&prev<=0&&v>=0){root=[pphi,phi];break;}prev=v;pphi=phi;}else{prev=null;}}
  if(!root) return null;
  let [a,b]=root;for(let i=0;i<80;i++){const m=(a+b)/2;if(F(m)<0)a=m;else b=m;}
  const phi=(a+b)/2;
  return {phi,wU:turn(MU,phi-phiU,g),wL:turn(ML,phiL-phi,g),p:pu(phi)};
}
/* node: */ if(typeof module!=='undefined') module.exports={thetaOf,betaMax,thetaMax,betaSonic,nsFromMn,shockFromBeta,oblique,T0T,p0p,nu,numax,Mofnu,pm,turn,slip,D,R};

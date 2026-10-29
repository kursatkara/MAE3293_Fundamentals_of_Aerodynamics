/* ---------- quasi-one-dimensional isentropic flow and nozzle solver ---------- */
const AoAs=(M,g)=>Math.pow(2/(g+1)*(1+(g-1)/2*M*M),(g+1)/(2*(g-1)))/M;
function Mfromarea(ar,g,sup){ // ar=A/A* >=1
  if(ar<=1) return 1;
  let lo,hi;
  if(sup){lo=1;hi=2;while(AoAs(hi,g)<ar)hi*=2;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(AoAs(m,g)<ar)lo=m;else hi=m;}}
  else{lo=1e-9;hi=1;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(AoAs(m,g)>ar)lo=m;else hi=m;}}
  return (lo+hi)/2;}
const pp0=(M,g)=>Math.pow(1+(g-1)/2*M*M,-g/(g-1));
const TT0=(M,g)=>1/(1+(g-1)/2*M*M);
const rr0=(M,g)=>Math.pow(1+(g-1)/2*M*M,-1/(g-1));
const Mfromp=(r,g)=>Math.sqrt(Math.max(0,2/(g-1)*(Math.pow(r,-(g-1)/g)-1))); // r=p/p0
/* normal shock at Mach M */
function NS(M,g){const n=nsFromMn(M,g);return {M2:n.Mn2,p21:n.p21,T21:n.T21,r21:n.r21,p0r:n.p0r};}
/* Pitot reading p_Pitot/p1: isentropic below M = 1, Rayleigh Pitot formula (Anderson Eq. 8.80) above */
function pitot(M,g){if(M<=1)return 1/pp0(M,g);const s=M*M;return Math.pow((g+1)*(g+1)*s/(4*g*s-2*(g-1)),g/(g-1))*(1-g+2*g*s)/(g+1);}
const Mstar=(M,g)=>Math.sqrt((g+1)*M*M/(2+(g-1)*M*M));
/* critical back pressures for a CD nozzle with exit/throat area ratio Ae (A_t = A*) */
function critical(Ae,g){
  const Msub=Mfromarea(Ae,g,false), Msup=Mfromarea(Ae,g,true);
  const p1=pp0(Msub,g), p6=pp0(Msup,g), p5=p6*NS(Msup,g).p21;
  return {Msub,Msup,p1,p6,p5};}
/* full nozzle state for back pressure pb (=pb/p0), exit area ratio Ae=Ae/At.
   Returns regime and a function M(A, branch) along the nozzle. */
function nozzle(Ae,pb,g){
  const c=critical(Ae,g), r={Ae,pb,c};
  if(pb>=1){r.regime='none';return r;}
  if(pb>c.p1+1e-12){ // subsonic, not choked
    r.regime='subsonic'; const Me=Mfromp(pb,g); r.Me=Me; r.Astar=Ae/AoAs(Me,g); // A*/At <1? no: A* < At
    r.Mt=Mfromarea(1/r.Astar,g,false); r.mdot=r.Astar; // mdot relative to choked value (A*/At)
    r.pe=pb; return r;}
  r.mdot=1;
  if(pb>c.p5+1e-12){ // shock inside diverging section (or choked subsonic if pb==p1)
    // find shock area As in (1,Ae): exit pressure with shock increases as As decreases
    const pexit=As=>{const Ms=Mfromarea(As,g,true),n=NS(Ms,g),A2s=1/n.p0r,Me=Mfromarea(Ae/A2s,g,false);return n.p0r*pp0(Me,g);};
    let lo=1+1e-9,hi=Ae;
    for(let i=0;i<100;i++){const m=(lo+hi)/2;if(pexit(m)>pb)lo=m;else hi=m;}
    const As=(lo+hi)/2, Ms=Mfromarea(As,g,true), n=NS(Ms,g), A2s=1/n.p0r, Me=Mfromarea(Ae/A2s,g,false);
    Object.assign(r,{regime:As<1+1e-6?'choked-subsonic':'shock-inside',As,Ms,ns:n,A2s,Me,pe:pb,p02:n.p0r});
    return r;}
  r.Me=c.Msup; r.pe=c.p6;
  if(Math.abs(pb-c.p5)<=1e-12){r.regime='shock-exit';return r;}
  if(pb>c.p6+1e-9){ // overexpanded: oblique shocks at the lips
    r.regime='overexpanded';
    const pr=pb/c.p6, Mn=Math.sqrt(1+(g+1)/(2*g)*(pr-1)), b=Math.asin(Math.min(1,Mn/c.Msup));
    r.ob={beta:b,theta:thetaOf(c.Msup,b,g),Mn,pr}; return r;}
  if(pb>=c.p6-1e-9){r.regime='design';return r;}
  r.regime='underexpanded';
  const Mj=Mfromp(pb,g); r.ex={Mj,dnu:nu(Mj,g)-nu(c.Msup,g),mu1:Math.asin(1/c.Msup),mu2:Math.asin(1/Mj)}; return r;
}
if(typeof module!=='undefined') module.exports={AoAs,Mfromarea,pp0,TT0,rr0,Mfromp,NS,critical,nozzle,pitot,Mstar};

#!/usr/bin/env node
/*
  Independent numerical checks of the shared gas-dynamics code (src/shared/core.js
  and src/shared/quasi1d.js) against Anderson's tables (App. A, B, C; gamma = 1.4),
  plus mass and momentum (Eq. 10.5) balances on the nozzle solutions used by the
  Chapter 10 explorer.  Run: npm run check  (exit code 1 on any failure)
*/
const C=require('../src/shared/core.js');global.nsFromMn=C.nsFromMn;global.thetaOf=C.thetaOf;global.nu=C.nu;global.betaMax=C.betaMax;
const N=require('../src/shared/quasi1d.js');const g=1.4;let bad=0;
const chk=(name,v,ref,tol)=>{const ok=Math.abs(v-ref)<=tol;if(!ok)bad++;console.log((ok?'ok  ':'BAD ')+name.padEnd(34),v.toFixed(5),'ref',ref);};
// App A
chk('M=2 p0/p',1/N.pp0(2,g),7.824,0.001);chk('M=2 T0/T',1/N.TT0(2,g),1.8,1e-6);chk('M=2 rho0/rho',1/N.rr0(2,g),4.347,0.001);chk('M=2 A/A*',N.AoAs(2,g),1.688,0.001);
chk('M=0.5 A/A*',N.AoAs(0.5,g),1.340,0.001);chk('M=3 A/A*',N.AoAs(3,g),4.235,0.001);chk('M=1 p*/p0',N.pp0(1,g),0.5283,0.0001);
chk('A/A*=1.688 sup root',N.Mfromarea(1.688,g,true),2.0,0.002);chk('A/A*=1.340 sub root',N.Mfromarea(1.340,g,false),0.5,0.002);
chk('Mfromp(1/7.824)',N.Mfromp(1/7.824,g),2.0,0.001);
// App B normal shock M=2
const s=N.NS(2,g);chk('NS M=2 p2/p1',s.p21,4.5,1e-6);chk('NS M=2 M2',s.M2,0.5774,0.0001);chk('NS M=2 p02/p01',s.p0r,0.7209,0.0001);chk('NS M=2 T2/T1',s.T21,1.687,0.001);chk('NS M=2 rho2/rho1',s.r21,2.667,0.001);
chk('NS M=3 p02/p01',N.NS(3,g).p0r,0.3283,0.0001);
// App C
chk('nu(2) deg',C.nu(2,g)*180/Math.PI,26.38,0.01);chk('nu(1.5) deg',C.nu(1.5,g)*180/Math.PI,11.91,0.01);chk('nu(10) deg',C.nu(10,g)*180/Math.PI,102.3,0.05);
// choked mass flow constant for air: mdot sqrt(T0)/(p0 A*) = 0.0404 (SI, R=287)
chk('mdot const air',Math.sqrt(1.4/287*Math.pow(2/2.4,2.4/0.4)),0.04042,0.00005);
// Fig 10.18/10.19
chk('Me=2.5 Ae/A*',N.AoAs(2.5,g),2.637,0.001);chk('Me=2.5 p0/pe',1/N.pp0(2.5,g),17.09,0.01);chk('Me=2.5 p2/p1',N.NS(2.5,g).p21,7.125,0.001);
chk('Fig 10.19 p0 (atm)',1/N.pp0(2.5,g)/N.NS(2.5,g).p21,2.40,0.005);
console.log(bad?bad+' table checks FAILED':'all table checks pass');
// Momentum (Eq. 10.5) balance on nozzle profiles: mdot u_e + p_e A_e - mdot u_i - p_i A_i = int p dA
function Ax(x,Ae){const XT=0.3,AI=3;return x<=XT?1+(AI-1)*(1-Math.cos(Math.PI*(XT-x)/XT))/2:1+(Ae-1)*(1-Math.cos(Math.PI*(x-XT)/(1-XT)))/2;}
let worst=0;
for(const Ae of [1.5,2,3,5]) for(const pb of [0.98,0.9,0.8,0.6,0.4,0.2,0.05]){
  const st=N.nozzle(Ae,pb,g);if(st.regime==='none')continue;
  const pts=[];const n=4001;
  for(let i=0;i<n;i++){const x=i/(n-1),A=Ax(x,Ae);let M,p;
    if(st.regime==='subsonic'){M=N.Mfromarea(A/st.Astar,g,false);p=N.pp0(M,g);}
    else if(x<=0.3||st.regime==='choked-subsonic'){M=N.Mfromarea(A,g,false);p=N.pp0(M,g);}
    else if(st.regime==='shock-inside'){if(A<st.As){M=N.Mfromarea(A,g,true);p=N.pp0(M,g);}else{M=N.Mfromarea(A/st.A2s,g,false);p=st.p02*N.pp0(M,g);}}
    else {M=N.Mfromarea(A,g,true);p=N.pp0(M,g);}
    pts.push({A,M,p,T:N.TT0(M,g)});}
  // nondimensional: p/p0, rho u^2 = gamma p M^2
  const imp=P=>(P.p*(1+g*P.M*P.M))*P.A;  // (p + rho u^2) A
  let I=0;for(let i=1;i<n;i++)I+=(pts[i].p+pts[i-1].p)/2*(pts[i].A-pts[i-1].A);
  const lhs=imp(pts[n-1])-imp(pts[0]);const err=Math.abs(lhs-I)/Math.max(1e-9,Math.abs(imp(pts[0])));
  worst=Math.max(worst,err);
  // mass: rho u A / (rho0 a0 At) = (p/p0)/(T/T0)*M*sqrt(T/T0)*A, constant
  const mf=P=>P.p/P.T*P.M*Math.sqrt(P.T)*P.A;const mspread=Math.abs(mf(pts[n-1])-mf(pts[0]))/mf(pts[0]);
  if(err>1e-4||mspread>1e-6){bad++;console.log('BALANCE',Ae,pb,st.regime,err.toExponential(2),mspread.toExponential(2));}
  // exit pressure match for subsonic exits
  if(['subsonic','shock-inside'].includes(st.regime)&&Math.abs(pts[n-1].p-pb)>1e-6){bad++;console.log('EXIT p mismatch',Ae,pb,pts[n-1].p);}
}
console.log('worst momentum residual (Eq. 10.5), relative:',worst.toExponential(2));
process.exit(bad?1:0);

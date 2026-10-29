/* ---------- standard atmosphere (Anderson, Fundamentals of Aerodynamics, Appendix D) ---------- */
/* geometric altitude z (m) -> T (K), p (N/m^2), rho (kg/m^3); geopotential layers: -6.5 K/km to 11 km, isothermal to 25 km, +3 K/km above */
function atm(z){
  const h=6.356766e6*z/(6.356766e6+z), g0=9.80, R=287, T11=216.66, p11=101325*Math.pow(T11/288.16,g0/(0.0065*R)), p25=p11*Math.exp(-g0*14000/(R*T11));
  let T,p;
  if(h<=11000){T=288.16-0.0065*h;p=101325*Math.pow(T/288.16,g0/(0.0065*R));}
  else if(h<=25000){T=T11;p=p11*Math.exp(-g0*(h-11000)/(R*T11));}
  else{T=T11+0.003*(h-25000);p=p25*Math.pow(T/T11,-g0/(0.003*R));}
  return {T,p,rho:p/(R*T)};}
if(typeof module!=='undefined') module.exports={atm};

/* =====================================================================
   Theme and font size (same localStorage keys and scale as the calculator)
   ===================================================================== */
(function(){
  const $=id=>document.getElementById(id);
  const tg=$('theme-toggle-checkbox'),root=document.documentElement;
  const sysLight=()=>window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches;
  const cur=()=>root.getAttribute('data-theme')||(sysLight()?'light':'dark');
  tg.checked=cur()==='light';
  tg.addEventListener('change',()=>{const t=tg.checked?'light':'dark';root.setAttribute('data-theme',t);try{localStorage.setItem('theme',t);}catch(e){}});
  // font size (same keys and scale as the calculator)
  const sizes=['xs','sm','md','lg','xl'],scale={xs:0.875,sm:0.9375,md:1,lg:1.125,xl:1.25};
  let i=2;try{const v=sizes.indexOf(localStorage.getItem('font-size'));if(v>=0)i=v;}catch(e){}
  const wrap=document.querySelector('.wrap');
  const apply=k=>{i=Math.max(0,Math.min(sizes.length-1,k));wrap.style.zoom=scale[sizes[i]];try{localStorage.setItem('font-size',sizes[i]);}catch(e){}};
  $('font-increase').onclick=()=>apply(i+1);$('font-decrease').onclick=()=>apply(i-1);
  apply(i);
})();

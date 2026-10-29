/* =====================================================================
   γ input and contents highlight
   ===================================================================== */
(function(){
  const gi=$('gamma');
  gi.addEventListener('input',()=>{const v=parseFloat(gi.value);if(isFinite(v)&&v>1.01&&v<=1.8){G=v;renderers.forEach(r=>r());}});
  // contents: highlight the section in view
  const links=[...document.querySelectorAll('#toc a')], secs=links.map(a=>document.querySelector(a.getAttribute('href')));
  const onScroll=sched(()=>{let cur=0;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<160)cur=i;});links.forEach((a,i)=>a.classList.toggle('on',i===cur));});
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
})();


/* first paint of every interactive */
renderers.forEach(r=>r());

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

/* tabs: tabpanel roles and arrow-key navigation (WAI-ARIA tabs pattern) */
document.querySelectorAll('[data-expanel]').forEach(p=>p.setAttribute('role','tabpanel'));
document.querySelectorAll('[role=tablist]').forEach(tl=>{
  const tabs=[...tl.querySelectorAll('[role=tab]')];
  const sync=()=>tabs.forEach(t=>t.tabIndex=t.getAttribute('aria-selected')==='true'?0:-1);
  tabs.forEach((t,i)=>{
    t.addEventListener('click',()=>setTimeout(sync));
    t.addEventListener('keydown',e=>{const k={ArrowRight:1,ArrowLeft:-1,Home:-i,End:tabs.length-1-i}[e.key];if(k===undefined)return;e.preventDefault();const n=tabs[(i+k+tabs.length)%tabs.length];n.click();n.focus();});
  });
  sync();
});

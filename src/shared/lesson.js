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

/* =====================================================================
   Hand-solution comparison. Example tables show one Result column; the
   hand solution from the Appendix tables (gamma = 1.4) is a hidden column
   that a switch above each table reveals. All switches on the page share
   one state, remembered in localStorage ('hand-solutions').
   ===================================================================== */
function handCell(v,diff){return `<td class="hand${diff?' diff':''}">${v}${diff?'<span class="mk" title="Differs from the result; see the note below the table"> †</span>':''}</td>`;}
function handSwitchHTML(){const on=document.documentElement.classList.contains('show-hand');
  return `<div class="handbar"><label class="handswitch"><input type="checkbox" class="hand-toggle"${on?' checked':''}> Compare with the hand solution (Appendix tables)</label><span class="handnote">Shown for the original values with γ = 1.4; † marks a value that differs from the result, explained in the note below.</span></div>`;}
(function(){
  const root=document.documentElement;
  let on=false;try{on=localStorage.getItem('hand-solutions')==='1';}catch(e){}
  const set=v=>{root.classList.toggle('show-hand',v);document.querySelectorAll('.hand-toggle').forEach(c=>{c.checked=v;});try{localStorage.setItem('hand-solutions',v?'1':'0');}catch(e){}};
  document.addEventListener('change',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('hand-toggle'))set(t.checked);});
  root.classList.toggle('show-hand',on);
  requestAnimationFrame(()=>{   // after the first paint of the tables
    document.querySelectorAll('table').forEach(t=>{if(!t.querySelector('th.hand,.handv'))return;(t.closest('.tblwrap')||t).insertAdjacentHTML('beforebegin',handSwitchHTML());});
    document.querySelectorAll('.readout').forEach(r=>{if(r.querySelector('.handi'))r.insertAdjacentHTML('beforebegin',handSwitchHTML());});
    set(on);
  });
})();

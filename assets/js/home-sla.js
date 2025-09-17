// === SLA popover init ===
(function(){
  function makeEl(tag, cls, text){
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function closeAllExcept(ex){
    document.querySelectorAll('.hover-card.is-open').forEach(c=>{ if (c !== ex) c.classList.remove('is-open'); });
  }
  function initSlaCard(card){
    if (card.__slaInit) return;
    const text = card.getAttribute('data-sla');
    if (!text) return;
    const rib = makeEl('div', 'sla-ribbon', 'SLA');
    const pop = makeEl('div', 'sla-pop', text);
    card.appendChild(rib); card.appendChild(pop);
    const focusable = card.matches('a,button,[tabindex]') || card.querySelector('a,button,[tabindex]');
    if (!focusable) card.setAttribute('tabindex', '0');
    card.addEventListener('click', function(ev){
      const interactive = ev.target.closest('a, button, [role="button"]');
      if (interactive) return;
      if (!card.classList.contains('is-open')){ closeAllExcept(card); card.classList.add('is-open'); }
      else { card.classList.remove('is-open'); }
    });
    card.addEventListener('mouseleave', ()=> card.classList.remove('is-open'));
    card.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape'){ card.classList.remove('is-open'); card.blur(); }
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); card.classList.toggle('is-open'); }
    });
    card.__slaInit = true;
  }
  function initAll(){ document.querySelectorAll('.hover-card[data-sla]').forEach(initSlaCard); }
  document.addEventListener('click', (e)=>{ if (!e.target.closest('.hover-card')) closeAllExcept(null); });
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', initAll); } else { initAll(); }
})();
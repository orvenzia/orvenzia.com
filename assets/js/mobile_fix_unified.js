
(function(){
  function ready(fn){ if(document.readyState!=='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)} }
  ready(function(){
    try{
      if (window.innerWidth > 860) return;
      var header = document.querySelector('header, .site-header') || document.body;
      var panel = document.getElementById('mobile-menu') || document.getElementById('m-panel');
      if(!panel){
        panel = document.createElement('nav');
        panel.id = 'mobile-menu';
        panel.setAttribute('aria-hidden','true');
        panel.hidden = true;
        panel.innerHTML = [
          '<a href="services.html">Services</a>',
          '<a href="cases.html">Cases</a>',
          '<a href="about.html">About</a>',
          '<a class="cta" href="screening.html">Start Screening →</a>'
        ].join('');
        document.body.appendChild(panel);
      }
      var btn = document.querySelector('.mobile-nav-toggle, .m-burger');
      if(!btn){
        btn = document.createElement('button');
        btn.className = 'mobile-nav-toggle';
        btn.setAttribute('aria-expanded','false');
        btn.setAttribute('aria-controls', panel.id);
        btn.setAttribute('aria-label','Toggle menu');
        btn.innerHTML = '<span class="burger"></span>';
        header.appendChild(btn);
      }
      function openMenu(){ if(panel.id==='mobile-menu'){ panel.classList.add('is-open'); panel.hidden = false; } else { panel.classList.add('open'); } panel.setAttribute('aria-hidden','false'); btn.setAttribute('aria-expanded','true'); }
      function closeMenu(){ panel.classList.remove('is-open'); panel.classList.remove('open'); panel.hidden = true; panel.setAttribute('aria-hidden','true'); btn.setAttribute('aria-expanded','false'); }
      btn.addEventListener('click', function(ev){ ev.preventDefault(); var isOpen = panel.classList.contains('is-open') || panel.classList.contains('open'); if(panel.hidden || !isOpen){ openMenu(); } else { closeMenu(); } });
      document.addEventListener('click', function(ev){ var isOpen = panel.classList.contains('is-open') || panel.classList.contains('open'); if(!isOpen) return; if(!panel.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)){ closeMenu(); } }, true);
      document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenu(); } });
      panel.addEventListener('click', function(ev){ var a = ev.target.closest('a'); if(a){ closeMenu(); } });
      var headerEl = document.querySelector('header, .site-header'); var pad = (headerEl ? headerEl.offsetHeight : 64) + 'px';
      if(parseInt((getComputedStyle(document.body).paddingTop||'0')) < parseInt(pad)){ document.body.style.paddingTop = pad; }
      panel.style.zIndex = panel.style.zIndex || '10001'; btn.style.zIndex = btn.style.zIndex || '10002';
    }catch(e){ console.warn('mobile_fix_unified.js error:', e); }
  });
})();


(function(){
  function ready(fn){ if(document.readyState!=='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)} }
  ready(function(){
    try{
      if (window.innerWidth > 860) return; // Desktop untouched

      // Find or create header
      var header = document.querySelector('header, .site-header') || document.body;

      // Find or create mobile panel (prefer existing #mobile-menu / #m-panel)
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

      // Find or create burger toggle
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

      function openMenu(){
        if(panel.id==='mobile-menu'){ panel.classList.add('is-open'); panel.hidden = false; }
        else { panel.classList.add('open'); }
        panel.setAttribute('aria-hidden','false');
        btn.setAttribute('aria-expanded','true');
      }
      function closeMenu(){
        panel.classList.remove('is-open'); panel.classList.remove('open');
        panel.hidden = true;
        panel.setAttribute('aria-hidden','true');
        btn.setAttribute('aria-expanded','false');
      }

      btn.addEventListener('click', function(ev){
        ev.preventDefault();
        var isOpen = panel.classList.contains('is-open') || panel.classList.contains('open');
        if(panel.hidden || !isOpen){ openMenu(); } else { closeMenu(); }
      });

      // Close on outside click / ESC / link click
      document.addEventListener('click', function(ev){
        var isOpen = panel.classList.contains('is-open') || panel.classList.contains('open');
        if(!isOpen) return;
        if(!panel.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)){ closeMenu(); }
      }, true);
      document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenu(); } });
      panel.addEventListener('click', function(ev){ var a = ev.target.closest('a'); if(a){ closeMenu(); } });

      // Ensure header is fixed and above content on mobile
      var hs = getComputedStyle(header);
      if(hs.position !== 'fixed'){
        header.style.position = 'fixed';
        header.style.top = '0'; header.style.left = '0'; header.style.right = '0';
        header.style.zIndex = '10000';
        // Offset body to avoid overlap
        var pad = (header.offsetHeight || 64) + 'px';
        if(parseInt((getComputedStyle(document.body).paddingTop||'0')) < parseInt(pad)){
          document.body.style.paddingTop = pad;
        }
      }

      // Avoid interaction traps under overlays
      panel.style.zIndex = panel.style.zIndex || '10001';
      btn.style.zIndex = btn.style.zIndex || '10002';
    }catch(e){
      console.warn('mobile_fix_unified.js error:', e);
    }
  });
})();

// MOBILE: Remove stray "Orvenzia" title-strip on About/Privacy (mobile only)
(function removeDuplicateBrandStrip(){
  try{
    if (window.innerWidth > 860) return;
    var isPaper = document.body.classList.contains('bg-paper');
    if(!isPaper) return;

    var main = document.querySelector('main') || document.body;
    var hero = document.querySelector('.hero');
    var candidates = [];
    if (main) candidates = candidates.concat(Array.prototype.slice.call(main.querySelectorAll('.section, section')));
    if (hero && hero.nextElementSibling) candidates.unshift(hero.nextElementSibling);

    for (var i = 0; i < Math.min(candidates.length, 4); i++){
      var el = candidates[i];
      if (!el || !(el instanceof HTMLElement)) continue;
      var h = el.querySelector('h1,h2'); if (!h) continue;
      var text = (h.textContent || '').trim().toLowerCase();
      var onlyText = (el.textContent || '').trim();
      var words = onlyText.split(/\s+/).filter(Boolean);
      if ((text === 'orvenzia' || text === 'about orvenzia') && words.length <= 3){
        el.style.display = 'none';
        break;
      }
    }
  }catch(e){}
})();

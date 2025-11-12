
(function(){
  function ready(fn){ if(document.readyState!='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)} }
  ready(function(){
    if (window.matchMedia && !window.matchMedia('(max-width: 860px)').matches) return;

    /* Body offset equals header height */
    var header = document.querySelector('header');
    function setH(){ var h = header ? Math.max(header.offsetHeight, 56) : 56;
      document.documentElement.style.setProperty('--m-header-h', h + 'px'); }
    setH(); window.addEventListener('resize', setH);

    /* Ensure burger + panel exist */
    var burger = document.querySelector('.m-burger');
    var panel  = document.querySelector('#m-panel');
    if(!burger){
      burger = document.createElement('button');
      burger.className = 'm-burger';
      burger.setAttribute('aria-label','Menu');
      burger.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
      document.body.appendChild(burger);
    }
    if(!panel){
      panel = document.createElement('nav'); panel.id = 'm-panel'; document.body.appendChild(panel);
      var links = Array.prototype.slice.call(document.querySelectorAll('header nav a, header .nav a, header .menu a'));
      if(links.length){
        links.forEach(function(a){
          var c = document.createElement('a');
          c.textContent = (a.textContent||'').trim();
          c.href = a.getAttribute('href') || '#';
          panel.appendChild(c);
        });
      }
    }

    /* Inject/rename CTA at bottom */
    (function ensureCTA(){
      var cta = panel.querySelector('a.cta');
      if(!cta){
        cta = document.createElement('a'); cta.className = 'cta'; cta.href = '/screening.html'; cta.textContent = 'Start Screening ->';
        panel.appendChild(cta);
      }else{
        cta.textContent = 'Start Screening ->'; if(!cta.getAttribute('href')) cta.href = '/screening.html';
      }
    })();

    /* Capture-phase click to suppress conflicting handlers and ensure consistent toggle */
    function openPanel(){ panel.classList.add('open'); }
    function closePanel(){ panel.classList.remove('open'); }
    function togglePanel(){ panel.classList.toggle('open'); }

    function onBurgerCapture(ev){
      ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
      togglePanel();
    }
    if(!burger.dataset.wired){
      burger.dataset.wired = '1';
      burger.addEventListener('click', onBurgerCapture, true); /* capture */
    }

    /* Close on outside click / ESC / link select */
    if(!panel.dataset.wired){
      panel.dataset.wired = '1';
      document.addEventListener('click', function(ev){
        if(!panel.classList.contains('open')) return;
        if(!panel.contains(ev.target) && ev.target !== burger){ closePanel(); }
      }, true); /* capture to beat other handlers */
      document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closePanel(); } });
      panel.addEventListener('click', function(ev){ var a = ev.target.closest('a'); if(a){ closePanel(); } });
    }
  });
})();

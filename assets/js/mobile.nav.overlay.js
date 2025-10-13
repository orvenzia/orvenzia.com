
(function(){
  function ready(fn){ if(document.readyState!='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)} }
  ready(function(){
    try{
      if (window.innerWidth > 860) return; // desktop untouched
      if (document.getElementById('mobile-nav-panel')) return; // already injected

      var toggle = document.createElement('button');
      toggle.className = 'mobile-nav-toggle';
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-controls','mobile-nav-panel');
      toggle.setAttribute('aria-label','Toggle menu');
      toggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
      document.body.appendChild(toggle);

      var panel = document.createElement('nav');
      panel.id = 'mobile-nav-panel';
      panel.innerHTML = [
        '<a href="services.html">Services</a>',
        '<a href="cases.html">Cases</a>',
        '<a href="about.html">About</a>',
        '<a class="cta" href="screening.html">Free Screening</a>'
      ].join('');
      document.body.appendChild(panel);

      function open(){ panel.classList.add('open'); toggle.setAttribute('aria-expanded','true'); }
      function close(){ panel.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }

      toggle.addEventListener('click', function(e){ e.stopPropagation(); if(panel.classList.contains('open')) close(); else open(); });
      document.addEventListener('click', function(e){ if(!panel.contains(e.target) && !toggle.contains(e.target)) close(); });
      window.addEventListener('resize', function(){ if(window.innerWidth>860) close(); });

    }catch(e){ /* no-op */ }
  });
})();


(function(){
  function ready(fn){ if(document.readyState!='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)} }
  ready(function(){
    try{
      if (window.innerWidth > 860) return;
      if (document.getElementById('m-panel')) return;

      var burger=document.createElement('button');
      burger.className='m-burger';
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-controls','m-panel');
      burger.setAttribute('aria-label','Toggle menu');
      burger.innerHTML='<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
      document.body.appendChild(burger);

      var panel=document.createElement('nav');
      panel.id='m-panel';
      panel.innerHTML=[
        '<a href="services.html">Services</a>',
        '<a href="cases.html">Cases</a>',
        '<a href="about.html">About</a>',
        '<a class="cta" href="screening.html">Free Screening</a>'
      ].join('');
      document.body.appendChild(panel);

      function open(){ panel.classList.add('open'); burger.setAttribute('aria-expanded','true'); }
      function close(){ panel.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }

      burger.addEventListener('click', function(e){ e.stopPropagation(); panel.classList.contains('open')?close():open(); });
      document.addEventListener('click', function(e){ if(!panel.contains(e.target) && !burger.contains(e.target)) close(); });
      window.addEventListener('resize', function(){ if(window.innerWidth>860) close(); });
    }catch(e){}
  });
})();

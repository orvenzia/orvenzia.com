
(function(){
  function ready(fn){ if(document.readyState!=='loading'){fn()} else {document.addEventListener('DOMContentLoaded', fn)} }
  ready(function(){
    if (window.innerWidth > 860) return;                 // desktop untouched
    if (document.getElementById('m-panel')) return;      // already injected

    // Burger
    var b=document.createElement('button');
    b.className='m-burger';
    b.setAttribute('aria-expanded','false');
    b.setAttribute('aria-controls','m-panel');
    b.setAttribute('aria-label','Toggle menu');
    b.innerHTML='<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
    document.body.appendChild(b);

    // Panel
    var p=document.createElement('nav');
    p.id='m-panel';
    p.innerHTML=[
      '<a href="services.html">Services</a>',
      '<a href="cases.html">Cases</a>',
      '<a href="about.html">About</a>',
      '<a class="cta" href="screening.html">Free Screening</a>'
    ].join('');
    document.body.appendChild(p);

    function open(){ p.classList.add('open'); b.setAttribute('aria-expanded','true'); }
    function close(){ p.classList.remove('open'); b.setAttribute('aria-expanded','false'); }

    b.addEventListener('click', function(e){ e.stopPropagation(); p.classList.contains('open')?close():open(); });
    document.addEventListener('click', function(e){ if(!p.contains(e.target) && !b.contains(e.target)) close(); });
    window.addEventListener('resize', function(){ if(window.innerWidth>860) close(); });
  });
})();

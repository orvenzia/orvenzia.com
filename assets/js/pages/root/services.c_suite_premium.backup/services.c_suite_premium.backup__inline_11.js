
// === MOBILE V22: build header row + CTA + burger menu (Services/Cases/About) ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  var header = $('header');
  if (!header) return;

  // Create mobile header row
  var row = header.querySelector('.m-header-row');
  if (!row){ row = document.createElement('div'); row.className = 'm-header-row'; header.insertBefore(row, header.firstChild); }

  // Brand on the left
  var brand = header.querySelector('.m-brand, .site-brand, .brand, .logo, a[href="index.html"]');
  if (!brand){
    $all('a', header).some(function(a){
      var t=(a.textContent||'').trim().toLowerCase();
      if (t.indexOf('orvenzia')!==-1){ brand=a; return true; } return false;
    });
  }
  if (!brand){ brand=document.createElement('a'); brand.href='index.html'; brand.textContent='Orvenzia'; }
  brand.classList.add('m-brand');

  // CTA "Free Screening" (use first on-page CTA's href if present)
  var ctaHref='#free-screening';
  var pageCta=$all('a,button').find(function(el){ var t=(el.textContent||'').trim().toLowerCase(); return t.indexOf('start free screening')!==-1||t==='free screening'; });
  if (pageCta && pageCta.getAttribute && pageCta.getAttribute('href')) ctaHref = pageCta.getAttribute('href');
  var cta = header.querySelector('.cta-free'); if(!cta){ cta=document.createElement('a'); cta.className='cta-free'; }
  cta.href=ctaHref; cta.textContent='Free Screening';

  // Burger on the right
  var burger = header.querySelector('.mobile-nav-toggle') || document.getElementById('mobile-nav-toggle');
  if (!burger){ burger=document.createElement('button'); burger.className='mobile-nav-toggle'; burger.id='mobile-nav-toggle'; }
  if (!burger.querySelector('.burger')){ var span=document.createElement('span'); span.className='burger'; burger.appendChild(span); }

  // Mount into row
  row.innerHTML=''; row.appendChild(brand); row.appendChild(cta); row.appendChild(burger);

  // Build #mobile-menu with exactly Services/Cases/About
  var services='services.html', cases='cases.html', about='about.html';
  $all('header a').forEach(function(a){ var t=(a.textContent||'').trim().toLowerCase();
    if(t==='services' && a.getAttribute('href')) services=a.getAttribute('href');
    if(t==='cases' && a.getAttribute('href')) cases=a.getAttribute('href');
    if(t==='about' && a.getAttribute('href')) about=a.getAttribute('href'); });
  var menu = $('#mobile-menu');
  if (!menu){ menu=document.createElement('div'); menu.id='mobile-menu'; header.parentNode.insertBefore(menu, header.nextSibling); }
  menu.innerHTML='';
  [['Services',services],['Cases',cases],['About',about]].forEach(function(pair){
    var a=document.createElement('a'); a.className='mm-item'; a.textContent=pair[0]; a.href=pair[1]; menu.appendChild(a);
  });

  // Robust toggle
  function hide(){ menu.classList.remove('is-open'); menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); }
  function show(){ menu.classList.add('is-open'); menu.removeAttribute('hidden'); menu.setAttribute('aria-hidden','false'); }
  hide();
  function toggle(e){ e.preventDefault(); e.stopPropagation(); if(menu.classList.contains('is-open')) hide(); else show(); }
  burger.addEventListener('click', toggle, {passive:false});
  burger.addEventListener('touchstart', toggle, {passive:false});
  document.addEventListener('click', function(e){ if(!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')) hide(); });
})();

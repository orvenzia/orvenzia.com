
// === MOBILE V25: robust burger, header rebuild, CTA -> screening.html ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  var header = $('header'); if(!header) return;

  // Build mobile row
  var row = header.querySelector('.m-header-row');
  if (!row){ row = document.createElement('div'); row.className = 'm-header-row'; header.insertBefore(row, header.firstChild); }

  // Brand left
  var brand = header.querySelector('.m-brand, .site-brand, .brand, .logo, a[href="index.html"]');
  if (!brand){
    $all('a', header).some(function(a){
      var t=(a.textContent||'').trim().toLowerCase(); if(t.indexOf('orvenzia')!==-1){ brand=a; return true; } return false;
    });
  }
  if (!brand){ brand=document.createElement('a'); brand.href='index.html'; brand.textContent='Orvenzia'; }
  brand.classList.add('m-brand');

  // CTA (white text) -> screening.html
  var cta = header.querySelector('.cta-free'); if(!cta){ cta=document.createElement('a'); cta.className='cta-free'; }
  cta.href = 'screening.html'; cta.textContent = 'Free Screening';

  // Burger right
  var burger = header.querySelector('.mobile-nav-toggle') || document.getElementById('mobile-nav-toggle');
  if (!burger){ burger=document.createElement('button'); burger.className='mobile-nav-toggle'; burger.id='mobile-nav-toggle'; }
  if (!burger.querySelector('.burger')){ var s=document.createElement('span'); s.className='burger'; burger.appendChild(s); }

  // Mount
  row.innerHTML=''; row.appendChild(brand); row.appendChild(cta); row.appendChild(burger);

  // Create #mobile-menu if missing
  var menu = $('#mobile-menu');
  if (!menu){ menu=document.createElement('div'); menu.id='mobile-menu'; menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); header.parentNode.insertBefore(menu, header.nextSibling); }

  // Fill exact items
  function hrefFor(label, fallback){
    var found = fallback;
    $all('header a').forEach(function(a){
      var t=(a.textContent||'').trim().toLowerCase();
      if (t===label) found = a.getAttribute('href') || found;
    });
    return found;
  }
  var services = hrefFor('services','services.html');
  var cases    = hrefFor('cases','cases.html');
  var about    = hrefFor('about','about.html');
  if (!menu.querySelector('.mm-item')){
    [['Services',services],['Cases',cases],['About',about]].forEach(function(p){
      var a=document.createElement('a'); a.className='mm-item'; a.textContent=p[0]; a.href=p[1]; menu.appendChild(a);
    });
  }

  // Robust toggle — handle click + pointerdown, set aria-expanded, and ensure states
  function hide(){
    menu.classList.remove('is-open'); menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true');
    burger.setAttribute('aria-expanded','false');
  }
  function show(){
    menu.classList.add('is-open'); menu.removeAttribute('hidden'); menu.setAttribute('aria-hidden','false');
    burger.setAttribute('aria-expanded','true');
  }
  hide();

  var toggling = false;
  function toggle(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if (toggling) return; toggling = true;
    var willOpen = !menu.classList.contains('is-open');
    if (willOpen) show(); else hide();
    setTimeout(function(){ toggling=false; }, 50);
  }

  ['click','pointerdown','touchstart'].forEach(function(evt){
    burger.addEventListener(evt, toggle, {passive:false});
  });

  // Close on outside tap or when navigating
  document.addEventListener('click', function(e){
    if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')) hide();
  });
  menu.addEventListener('click', function(e){
    var link = e.target.closest('a'); if (link){ hide(); }
  });

  // Mark body for screening page for CSS tweaks
  if (location.pathname.toLowerCase().indexOf('screening') !== -1){
    document.body.classList.add('screening');
  }
})(); 

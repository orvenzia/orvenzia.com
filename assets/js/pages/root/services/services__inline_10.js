
// === MOBILE V20: robust burger toggle + CTA white ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  var header = $('header');
  if (!header) return;

  // Ensure mobile row exists (v19 behavior)
  var row = header.querySelector('.m-header-row');
  if (!row){
    row = document.createElement('div'); row.className = 'm-header-row';
    header.insertBefore(row, header.firstChild);
  }

  // Brand
  var brand = header.querySelector('.m-brand, .site-brand, .brand, .logo, a[href="index.html"]');
  if (!brand){
    $all('a', header).some(function(a){
      var t = (a.textContent||'').trim().toLowerCase();
      if (t.indexOf('orvenzia') !== -1){ brand = a; return true; }
      return false;
    });
  }
  if (!brand){ brand = document.createElement('a'); brand.href='index.html'; brand.textContent='Orvenzia'; }
  brand.classList.add('m-brand');

  // CTA
  var cta = header.querySelector('.cta-free');
  if (!cta){
    cta = document.createElement('a'); cta.className = 'cta-free'; cta.href = '#free-screening'; cta.textContent = 'Free Screening';
  }
  // try to sync href from first CTA button on page
  var found = $all('a,button').find(function(el){
    var t = (el.textContent||'').trim().toLowerCase();
    return t.indexOf('start free screening') !== -1 || t === 'free screening';
  });
  if (found && found.getAttribute && found.getAttribute('href')) cta.href = found.getAttribute('href');

  // Burger
  var burger = header.querySelector('.mobile-nav-toggle') || document.getElementById('mobile-nav-toggle');
  if (!burger){ burger = document.createElement('button'); burger.className='mobile-nav-toggle'; burger.id='mobile-nav-toggle'; }
  if (!burger.querySelector('.burger')){ var b = document.createElement('span'); b.className='burger'; burger.appendChild(b); }

  // Mount
  row.innerHTML = ''; row.appendChild(brand); row.appendChild(cta); row.appendChild(burger);

  // Build menu items if needed (Services / Cases / About)
  var menu = $('#mobile-menu');
  if (!menu){ menu = document.createElement('div'); menu.id='mobile-menu'; menu.setAttribute('hidden',''); header.parentNode.insertBefore(menu, header.nextSibling); }
  // Fill menu once if empty
  if (!menu.querySelector('.mm-item')){
    function linkFor(label, fallback){
      var href = fallback;
      $all('header a').forEach(function(a){
        var t = (a.textContent||'').trim().toLowerCase();
        if (t === label) href = a.getAttribute('href') || href;
      });
      return href;
    }
    var services = linkFor('services','services.html');
    var cases    = linkFor('cases','cases.html');
    var about    = linkFor('about','about.html');
    ['Services', services], ['Cases', cases], ['About', about];
    [['Services',services],['Cases',cases],['About',about]].forEach(function(pair){
      var a = document.createElement('a'); a.className='mm-item'; a.textContent = pair[0]; a.href = pair[1]; menu.appendChild(a);
    });
  }

  // Default hidden + resilient toggle
  menu.classList.remove('hidden','md:hidden','sm:hidden','sr-only');
  menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); menu.classList.remove('is-open');

  function toggleMenu(e){
    e.preventDefault(); e.stopPropagation();
    var open = menu.classList.toggle('is-open');
    if (open){ menu.removeAttribute('hidden'); menu.setAttribute('aria-hidden','false'); }
    else { menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); }
  }

  burger.addEventListener('click', toggleMenu, {passive:false});
  burger.addEventListener('touchstart', function(e){ toggleMenu(e); }, {passive:false});

  document.addEventListener('click', function(e){
    if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')){
      menu.classList.remove('is-open'); menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true');
    }
  });
})();

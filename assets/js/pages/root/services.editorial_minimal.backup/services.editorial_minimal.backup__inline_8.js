
// === MOBILE V19: Header CTA + Exact burger menu items ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  var header = $('header');
  if (!header) return;

  // 1) Ensure mobile header row exists
  var row = header.querySelector('.m-header-row');
  if (!row){
    row = document.createElement('div');
    row.className = 'm-header-row';
    header.insertBefore(row, header.firstChild);
  }

  // 2) Brand (Orvenzia) on the left
  var brand = header.querySelector('.m-brand, .site-brand, .brand, .logo, a[href="index.html"]');
  if (!brand){
    $all('a', header).some(function(a){
      var t = (a.textContent||'').trim().toLowerCase();
      if (t.indexOf('orvenzia') !== -1){ brand = a; return true; }
      return false;
    });
  }
  if (!brand){
    brand = document.createElement('a'); brand.href = 'index.html'; brand.textContent = 'Orvenzia';
  }
  brand.classList.add('m-brand');

  // 3) CTA "Free Screening" (pull target from the first "Start Free Screening" link on the page; fallback '#free-screening')
  var ctaHref = '#free-screening';
  var firstCta = $all('a, button').find(function(el){
    var t = (el.textContent||'').trim().toLowerCase();
    return t.indexOf('start free screening') !== -1 || t === 'free screening';
  });
  if (firstCta && firstCta.getAttribute('href')) ctaHref = firstCta.getAttribute('href');
  var cta = header.querySelector('.cta-free');
  if (!cta){
    cta = document.createElement('a');
    cta.className = 'cta-free';
    cta.href = ctaHref;
    cta.textContent = 'Free Screening';
  } else {
    cta.href = ctaHref;
  }

  // 4) Burger on the right (resilient)
  var burger = header.querySelector('.mobile-nav-toggle') || document.getElementById('mobile-nav-toggle');
  if (!burger){
    burger = document.createElement('button'); burger.className = 'mobile-nav-toggle'; burger.id = 'mobile-nav-toggle';
  }
  if (!burger.querySelector('.burger')){
    var span = document.createElement('span'); span.className = 'burger'; burger.appendChild(span);
  }

  // Mount trio into the row: brand | CTA | burger
  row.innerHTML = '';
  row.appendChild(brand);
  row.appendChild(cta);
  row.appendChild(burger);

  // Hide original desktop nav row on mobile
  var desktopRow = header.querySelector('.max-w-7xl');
  if (desktopRow) desktopRow.style.display = 'none';

  // 5) Build burger menu items EXACTLY: Services, Cases, About
  var servicesHref = 'services.html', casesHref = 'cases.html', aboutHref = 'about.html';
  // Try to harvest hrefs from any desktop nav links
  $all('header a').forEach(function(a){
    var t = (a.textContent||'').trim().toLowerCase();
    if (t === 'services') servicesHref = a.getAttribute('href') || servicesHref;
    if (t === 'cases')    casesHref    = a.getAttribute('href') || casesHref;
    if (t === 'about')    aboutHref    = a.getAttribute('href') || aboutHref;
  });

  var menu = $('#mobile-menu');
  if (!menu){
    // Create if missing
    menu = document.createElement('div'); menu.id = 'mobile-menu'; menu.setAttribute('hidden','');
    header.parentNode.insertBefore(menu, header.nextSibling);
  }
  // Rebuild items
  menu.innerHTML = '';
  function addItem(text, href){
    var a = document.createElement('a');
    a.className = 'mm-item'; a.href = href; a.textContent = text;
    menu.appendChild(a);
  }
  addItem('Services', servicesHref);
  addItem('Cases', casesHref);
  addItem('About', aboutHref);

  // 6) Resilient toggle (like v18)
  menu.classList.remove('hidden', 'md:hidden', 'sm:hidden', 'sr-only');
  menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); menu.classList.remove('is-open');

  burger.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    var open = menu.classList.toggle('is-open');
    if (open){ menu.removeAttribute('hidden'); menu.setAttribute('aria-hidden','false'); }
    else { menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); }
  }, {passive:false});

  document.addEventListener('click', function(e){
    if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')){
      menu.classList.remove('is-open'); menu.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true');
    }
  });
})();

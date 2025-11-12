
// === MOBILE V17: rebuild header row brand-left / burger-right ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  var header = $('header');
  if (!header) return;

  // Build row if not there
  var row = header.querySelector('.m-header-row');
  if (!row){
    row = document.createElement('div');
    row.className = 'm-header-row';
    header.insertBefore(row, header.firstChild);
  }

  // Find brand: text containing "Orvenzia" preferred
  var brand = header.querySelector('.m-brand, .site-brand, .brand, .logo, a[href="index.html"]');
  if (!brand){
    $all('a', header).some(function(a){
      var t = (a.textContent||'').trim().toLowerCase();
      if (t.indexOf('orvenzia') !== -1){ brand = a; return true; }
      return false;
    });
  }
  if (!brand) brand = document.createElement('a'), brand.href='index.html', brand.textContent='Orvenzia';
  brand.classList.add('m-brand');

  // Ensure burger exists
  var burger = header.querySelector('.mobile-nav-toggle') || document.getElementById('mobile-nav-toggle');
  if (!burger){
    burger = document.createElement('button');
    burger.className = 'mobile-nav-toggle';
    burger.id = 'mobile-nav-toggle';
  }
  if (!burger.querySelector('.burger')){
    var span = document.createElement('span');
    span.className = 'burger';
    burger.appendChild(span);
  }

  // Mount into the rebuilt row
  row.innerHTML = ''; // clear row content
  row.appendChild(brand);
  row.appendChild(burger);

  // Hide the original big container (desktop row)
  var desktopRow = header.querySelector('.max-w-7xl');
  if (desktopRow) desktopRow.style.display = 'none';

  // Hide specific header links on mobile
  $all('a, button', header).forEach(function(el){
    var t = (el.textContent||'').trim().toLowerCase();
    if (t === 'services' || t === 'cases' || t === 'about'){
      el.style.display = 'none';
    }
  });

  // Bind burger toggle
  var menu = $('#mobile-menu');
  if (menu){
    if (menu.hasAttribute('hidden') === false) menu.setAttribute('hidden','');
    burger.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if (menu.hasAttribute('hidden')) menu.removeAttribute('hidden'); else menu.setAttribute('hidden','');
    }, {passive:false});
    document.addEventListener('click', function(e){
      if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')){
        menu.setAttribute('hidden','');
      }
    });
  }
})();

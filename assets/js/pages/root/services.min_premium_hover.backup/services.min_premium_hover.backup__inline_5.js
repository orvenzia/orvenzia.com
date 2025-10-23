
// === MOBILE V15: force burger only in header; hide Services/Cases/About; toggle mobile menu ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  var header = $('header');
  if(!header) return;

  // 1) Ensure burger is visible and looks right
  var burger = header.querySelector('.mobile-nav-toggle');
  if (burger){
    burger.style.display = 'inline-flex';
    // ensure icon markup exists
    if (!burger.querySelector('.burger')){
      var span = document.createElement('span');
      span.className = 'burger';
      burger.appendChild(span);
    }
  }

  // 2) Hide "Services / Cases / About" links anywhere in header
  $all('a,button', header).forEach(function(el){
    var t = (el.textContent || '').trim().toLowerCase();
    if (t === 'services' || t === 'cases' || t === 'about'){
      el.style.display = 'none';
    }
  });

  // 3) Hide typical desktop nav containers on mobile
  $all('nav, .desktop-nav, .menu, .menu-list, .nav-links, .header-links', header).forEach(function(el){
    if (!el.closest('#mobile-menu')) el.style.display = 'none';
  });

  // 4) If there is a black square CTA as last child, hide it (keep burger)
  var last = header.lastElementChild;
  if (last && last !== burger && !last.closest('#mobile-menu')){
    last.style.display = 'none';
  }

  // 5) Hook burger -> #mobile-menu toggle (attribute hidden)
  var menu = document.getElementById('mobile-menu');
  if (burger && menu){
    if (menu.hasAttribute('hidden') === false) menu.setAttribute('hidden', '');
    burger.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if (menu.hasAttribute('hidden')) menu.removeAttribute('hidden');
      else menu.setAttribute('hidden', '');
    }, {passive:false});
  }

  // 6) Close mobile menu on outside tap
  document.addEventListener('click', function(e){
    if (!menu || !menu.parentNode) return;
    if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')){
      menu.setAttribute('hidden', '');
    }
  });
})();

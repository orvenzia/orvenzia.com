
// === MOBILE V12: force nav visible + dropdown tap ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function $one(sel, root){ return (root||document).querySelector(sel); }
  function closeAll(){ $all('header nav .has-dd.open').forEach(function(it){ it.classList.remove('open'); }); }

  var header = $one('header');
  if(!header) return;

  // Try to find nav; if multiple, prefer the first with links
  var nav = $one('header nav') || $one('.desktop-nav') || $one('nav');
  if(!nav) return;

  // Mark items with submenu as has-dd
  $all('li, .nav-item, .menu-item', nav).forEach(function(item){
    var submenu = item.querySelector(':scope > .nav-dd, :scope > .dropdown, :scope > .submenu, :scope > [role="menu"], :scope > ul');
    if(!submenu) return;
    item.classList.add('has-dd');
    var trigger = item.querySelector(':scope > a, :scope > button');
    if(!trigger) return;
    trigger.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var isOpen = item.classList.contains('open');
      closeAll();
      if(!isOpen){ item.classList.add('open'); }
    }, {passive:false});
  });

  // Close on outside tap or ESC
  document.addEventListener('click', function(e){ if(!e.target.closest('header nav .has-dd')) closeAll(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAll(); });
})();

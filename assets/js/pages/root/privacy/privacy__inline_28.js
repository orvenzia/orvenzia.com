
// === MOBILE V11: dropdown autodetect (tap to open/close) ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function $one(sel, root){ return (root||document).querySelector(sel); }
  function closeAll(){ $all('header nav .has-dd.open').forEach(function(it){ it.classList.remove('open'); }); }

  // Ensure desktop nav is present
  var nav = $one('header nav') || $one('.desktop-nav');
  if(!nav) return;

  // Mark items that have a direct submenu (ul/.dropdown/.submenu/[role=menu])
  $all('header nav li, header nav .nav-item, header nav .menu-item, .desktop-nav li, .desktop-nav .nav-item, .desktop-nav .menu-item', nav)
    .forEach(function(item){
      var menu = item.querySelector(':scope > .nav-dd, :scope > .dropdown, :scope > .submenu, :scope > [role="menu"], :scope > ul');
      if(!menu) return;
      item.classList.add('has-dd');
      var trigger = item.querySelector(':scope > a, :scope > button');
      if(!trigger) return;

      trigger.addEventListener('click', function(e){
        // If trigger is a link with href AND no menu: allow navigate
        if(!item.classList.contains('has-dd')) return;
        e.preventDefault(); e.stopPropagation();
        var isOpen = item.classList.contains('open');
        closeAll();
        if(!isOpen){ item.classList.add('open'); }
      }, {passive:false});
    });

  // Close on outside tap / ESC
  document.addEventListener('click', function(e){ if(!e.target.closest('header nav .has-dd')) closeAll(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAll(); });

  // Prevent scroll bleed inside dropdown panel
  $all('header nav .dropdown, header nav .submenu, header nav [role="menu"], header nav ul').forEach(function(panel){
    panel.addEventListener('touchmove', function(e){ e.stopPropagation(); }, {passive:false});
  });
})();

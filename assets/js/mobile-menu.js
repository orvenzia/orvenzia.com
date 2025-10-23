
(function(){
  var btn = document.getElementById('mobile-nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if(!btn || !menu) return;
  function closeMenu(){ menu.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); }
  function openMenu(){ menu.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); }
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var isOpen = btn.getAttribute('aria-expanded') === 'true';
    if(isOpen){ closeMenu(); } else { openMenu(); }
  });
  // Close when clicking a link or outside
  menu.addEventListener('click', function(e){
    if(e.target.matches('a')) closeMenu();
  });
  document.addEventListener('click', function(e){
    if(!menu.contains(e.target) && e.target !== btn) closeMenu();
  });
  // Escape key
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });
})();

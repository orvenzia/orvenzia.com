
// === MOBILE V18: resilient burger toggle ===
(function(){
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : null;
  if (!mq || !mq.matches) return;
  var header = document.querySelector('header');
  if (!header) return;
  var burger = header.querySelector('.mobile-nav-toggle') || document.getElementById('mobile-nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  // Ensure default hidden
  menu.classList.remove('hidden', 'md:hidden', 'sm:hidden', 'sr-only');
  menu.setAttribute('hidden','');
  menu.setAttribute('aria-hidden','true');
  menu.classList.remove('is-open');

  burger.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    var open = menu.classList.toggle('is-open');
    if (open){
      menu.removeAttribute('hidden');
      menu.setAttribute('aria-hidden','false');
    } else {
      menu.setAttribute('hidden','');
      menu.setAttribute('aria-hidden','true');
    }
  }, {passive:false});

  // Close on outside tap
  document.addEventListener('click', function(e){
    if (!e.target.closest('#mobile-menu') && !e.target.closest('.mobile-nav-toggle')){
      menu.classList.remove('is-open');
      menu.setAttribute('hidden','');
      menu.setAttribute('aria-hidden','true');
    }
  });
})();


(function(){
  try {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('site-menu') || document.querySelector('header nav ul, .site-header nav ul');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function(e){ e.stopPropagation(); menu.classList.toggle('open'); });
    document.addEventListener('click', function(e){
      if (!menu.contains(e.target) && !toggle.contains(e.target)) menu.classList.remove('open');
    });
    window.addEventListener('resize', function(){ if (window.innerWidth > 860) menu.classList.remove('open'); });
  } catch(e){}
})();

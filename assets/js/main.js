
document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  toggle?.addEventListener('click', ()=> nav.classList.toggle('show'));
});

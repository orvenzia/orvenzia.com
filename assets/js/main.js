
document.addEventListener('DOMContentLoaded', function(){
  const t = document.getElementById('navToggle');
  const n = document.getElementById('nav');
  t?.addEventListener('click', ()=> n.classList.toggle('show'));
});

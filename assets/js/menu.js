document.addEventListener("DOMContentLoaded", function() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if(toggle && nav){
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      toggle.classList.toggle("active");
    });

    // Luk menu ved klik på link
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        toggle.classList.remove("active");
      });
    });
  }
});
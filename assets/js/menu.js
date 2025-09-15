document.addEventListener("DOMContentLoaded", function() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if(toggle && nav){
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      toggle.classList.toggle("active");
      document.body.classList.toggle("menu-open", nav.classList.contains("active"));
    });

    // Close menu on link click
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        toggle.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });
  }
});
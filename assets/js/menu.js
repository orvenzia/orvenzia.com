document.addEventListener("DOMContentLoaded", function() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if(toggle && nav){
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      toggle.classList.toggle("active");
      // lock body scroll when menu open on mobile
      if (nav.classList.contains("active")) {
        document.body.classList.add("menu-open");
      } else {
        document.body.classList.remove("menu-open");
      }
    });
  }
});
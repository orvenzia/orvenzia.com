
(function(){
  try{
    var mq = window.matchMedia && window.matchMedia('(max-width: 767.98px)');
    if(!mq || !mq.matches) return;

    function $(sel, root){ return (root||document).querySelector(sel); }
    function $$all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

    var body = document.body; if(!body) return;

    // Build topbar
    var topbar = document.createElement('div');
    topbar.className = 'topbar';
    topbar.setAttribute('role','banner');
    topbar.setAttribute('aria-label','Site header');

    // Brand: clone from header if possible, else fallback
    var brandSrc = $('header .m-brand, header .logo, header a[href="index.html"], header a[rel~="home"]');
    var brand = null;
    if(brandSrc){
      brand = brandSrc.cloneNode(true);
      if(brand.tagName.toLowerCase() !== 'a'){
        var a = document.createElement('a');
        a.href = 'index.html';
        a.className = (brand.className||'').trim() + ' m-brand';
        a.textContent = brand.textContent || 'Orvenzia';
        brand = a;
      }
    }else{
      brand = document.createElement('a');
      brand.href = 'index.html';
      brand.className = 'm-brand';
      brand.textContent = 'Orvenzia';
    }
    topbar.appendChild(brand);

    // CTA: try to clone a relevant CTA (optional)
    var ctaSrc = $$all('header a, a, button').find(function(el){
      var t = (el.textContent||'').trim().toLowerCase();
      return t.indexOf('start free screening') !== -1 || t === 'free screening' || t.indexOf('screening') !== -1;
    });
    if(ctaSrc){
      var cta = ctaSrc.cloneNode(true);
      cta.className = ((cta.className||'') + ' topbar-cta').trim();
      topbar.appendChild(cta);
    }

    // Burger: move into topbar if exists in body
    var burger = $('.m-burger') || $('#mobile-nav-toggle');
    if(burger){ topbar.appendChild(burger); }

    // Insert topbar at the top of body
    body.insertBefore(topbar, body.firstChild);
  }catch(e){}
})();

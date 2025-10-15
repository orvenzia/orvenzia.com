// Orvenzia Mobile Header Injector v5 (desktop-safe + About fix)
(function() {
  const MAX_MOBILE = 768;
  const isMobile = () => window.matchMedia('(max-width: ' + MAX_MOBILE + 'px)').matches;

  function normalizeHref(href) {
    try {
      const u = new URL(href, document.baseURI || location.href);
      return u.pathname + u.search + u.hash;
    } catch (e) { return href || '#'; }
  }

  function selectExistingNavLinks() {
    const containers = Array.from(document.querySelectorAll('header nav, header .nav, nav[role="navigation"], nav'));
    for (const c of containers) {
      const links = Array.from(c.querySelectorAll('a')).filter(a => (a.textContent || '').trim());
      if (links.length) return links;
    }
    return null;
  }

  function buildMenuList() {
    const links = selectExistingNavLinks();
    if (links) {
      const items = links.map(a => ({ text: (a.textContent || '').trim(), href: normalizeHref(a.getAttribute('href') || '#') }))
        .filter(it => it.text && it.href && it.href !== '#');
      const seen = new Set(), out = [];
      for (const it of items) { const k = it.text + "|" + it.href; if (!seen.has(k)) { seen.add(k); out.push(it); } }
      if (out.length) return out;
    }
    return [
      { text: 'Services', href: normalizeHref('services.html') },
      { text: 'Cases', href: normalizeHref('cases.html') },
      { text: 'About', href: normalizeHref('about.html') },
    ];
  }

  function findLogoSrc() {
    const h = document.querySelector('header') || document.querySelector('nav');
    if (!h) return null;
    const img = h.querySelector('img[src*="logo"], img[alt*="logo" i], img[alt*="Orvenzia" i]');
    if (img && img.getAttribute('src')) return normalizeHref(img.getAttribute('src'));
    return null;
  }

  function setHeaderHeightVar(headerEl) {
    const h = headerEl.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--orv-header-h', h + 'px');
  }

  function hideLegacyHeaders() {
    document.querySelectorAll('header, .site-header, .topbar, .preheader, .announcement, .header-spacer')
      .forEach(el => el.style.setProperty('display', 'none', 'important'));
  }

  function inject() {
    if (!isMobile()) return;
    if (document.getElementById('orv-mobile-header')) return;

    hideLegacyHeaders();

    const body = document.body;
    const logoSrc = findLogoSrc();
    const menuItems = buildMenuList();

    const headerEl = document.createElement('div');
    headerEl.id = 'orv-mobile-header';
    headerEl.className = 'orv-mob-header';

    const logoLink = document.createElement('a');
    logoLink.href = normalizeHref('index.html');
    logoLink.className = 'orv-mob-logo';
    if (logoSrc) {
      const img = document.createElement('img');
      img.src = logoSrc;
      img.alt = 'Orvenzia';
      logoLink.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.textContent = 'Orvenzia';
      logoLink.appendChild(span);
    }

    const burger = document.createElement('button');
    burger.className = 'orv-mob-burger';
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'orv-mob-menu');
    burger.setAttribute('aria-label', 'Open menu');
    burger.innerHTML = '<span></span><span></span><span></span>';

    headerEl.appendChild(logoLink);
    headerEl.appendChild(burger);

    const menu = document.createElement('nav');
    menu.id = 'orv-mob-menu';
    menu.setAttribute('hidden', 'hidden');

    const ul = document.createElement('ul');
    menuItems.forEach(it => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.text;
      li.appendChild(a);
      ul.appendChild(li);
    });
    menu.appendChild(ul);

    const cta = document.createElement('a');
    cta.className = 'orv-mob-cta';
    cta.href = normalizeHref('screening.html');
    cta.textContent = 'Start screening';
    menu.appendChild(cta);

    const overlay = document.createElement('div');
    overlay.id = 'orv-mob-overlay';
    overlay.setAttribute('hidden', 'hidden');

    body.insertBefore(overlay, body.firstChild);
    body.insertBefore(menu, body.firstChild);
    body.insertBefore(headerEl, body.firstChild);

    const setVars = () => setHeaderHeightVar(headerEl);
    setVars();
    window.addEventListener('resize', setVars);
    window.addEventListener('orientationchange', setVars);

    function openNav() {
      document.documentElement.classList.add('orv-lock');
      document.body.classList.add('orv-lock');
      document.body.classList.add('orv-nav-open');
      menu.classList.add('open');
      overlay.classList.add('open');
      menu.removeAttribute('hidden');
      overlay.removeAttribute('hidden');
      burger.setAttribute('aria-expanded', 'true');
    }
    function closeNav() {
      document.documentElement.classList.remove('orv-lock');
      document.body.classList.remove('orv-lock');
      document.body.classList.remove('orv-nav-open');
      menu.classList.remove('open');
      overlay.classList.remove('open');
      menu.setAttribute('hidden', 'hidden');
      overlay.setAttribute('hidden', 'hidden');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function(e) { e.stopPropagation(); (burger.getAttribute('aria-expanded')==='true') ? closeNav() : openNav(); });
    overlay.addEventListener('click', function(e) { e.stopPropagation(); closeNav(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

    window.addEventListener('resize', () => { if (!isMobile()) closeNav(); });

    // About fix
    (function __orvFixAboutPage(){
      try {
        const isAbout = /(?:^|\/)about(?:\.html)?(?:$|\?|\#)/i.test(location.pathname);
        if (!isAbout) return;
        document.body.classList.add('orv-about');
        const selectors = ['.page-title','.page-header','.title-bar','.section-title','.banner--title','.breadcrumb','.breadcrumbs','.header-spacer','.topbar'];
        selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.setProperty('display','none','important')));
        const candidates = Array.from(document.querySelectorAll('h1, h2, .title, .heading')).slice(0, 6);
        const isLight = (rgb) => {
          const m = rgb && rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
          if (!m) return false;
          const [r,g,b] = [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10)];
          const luma = 0.2126*r + 0.7152*g + 0.0722*b;
          return luma > 200;
        };
        for (const el of candidates) {
          const txt = (el.textContent || '').trim();
          const rect = el.getBoundingClientRect();
          const bg = getComputedStyle(el).backgroundColor;
          if (txt === 'Orvenzia' && rect.top < 220 && isLight(bg)) {
            const container = el.closest('section, header, div') || el;
            container.style.setProperty('display','none','important');
            break;
          }
        }
      } catch(e) {}
    })();
  }

  function ensure(){ if (isMobile()) inject(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure);
  else ensure();
})();

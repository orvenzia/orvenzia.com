// Orvenzia Mobile Header Injection (namespaced, desktop-safe)
(function() {
  const MAX_MOBILE = 768;

  function isMobile() { return window.matchMedia('(max-width: ' + MAX_MOBILE + 'px)').matches; }

  function findLogoSrc() {
    // Try to reuse existing header logo if present
    const header = document.querySelector('header') || document.querySelector('nav');
    if (header) {
      const img = header.querySelector('img[src*="logo"], img[alt*="logo" i], img[alt*="Orvenzia" i]');
      if (img && img.getAttribute('src')) return img.getAttribute('src');
    }
    // Fallback to detected site asset (from build step) or text
    return null;
  }

  function absolutePath(path) {
    if (!path) return null;
    try {
      const u = new URL(path, window.location.origin);
      return u.pathname + u.search + u.hash;
    } catch(e) {
      return path;
    }
  }

  function inject() {
    if (!isMobile()) return;

    // Mark first header as hidden on mobile to avoid duplicates
    const firstHeader = document.querySelector('header');
    if (firstHeader) firstHeader.classList.add('orv-hidden-mobile');

    // If we already injected, skip
    if (document.getElementById('orv-mobile-header')) return;

    const body = document.body;

    const logoSrc = absolutePath(findLogoSrc());

    const headerEl = document.createElement('div');
    headerEl.id = 'orv-mobile-header';
    headerEl.className = 'orv-mob-header';

    const logoLink = document.createElement('a');
    logoLink.href = '/index.html';
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
    menu.innerHTML = `
      <ul>
        <li><a href="/services.html">Services</a></li>
        <li><a href="/cases.html">Cases</a></li>
        <li><a href="/about.html">About</a></li>
      </ul>
      <a class="orv-mob-cta" href="/screening.html">Start screening</a>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'orv-mob-overlay';
    overlay.setAttribute('hidden', 'hidden');

    body.insertBefore(overlay, body.firstChild);
    body.insertBefore(menu, body.firstChild);
    body.insertBefore(headerEl, body.firstChild);

    function openNav() {
      document.body.classList.add('orv-nav-open');
      menu.classList.add('open');
      overlay.classList.add('open');
      menu.removeAttribute('hidden');
      overlay.removeAttribute('hidden');
      burger.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      document.body.classList.remove('orv-nav-open');
      menu.classList.remove('open');
      overlay.classList.remove('open');
      menu.setAttribute('hidden', 'hidden');
      overlay.setAttribute('hidden', 'hidden');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function() {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      if (expanded) closeNav(); else openNav();
    });

    overlay.addEventListener('click', closeNav);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

    // Close on any nav link click
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

    // Safety: close on resize to desktop
    window.addEventListener('resize', () => { if (!isMobile()) closeNav(); });
  }

  function ensure() {
    if (isMobile()) inject();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensure);
  } else {
    ensure();
  }
})();

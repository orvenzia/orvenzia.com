(function () {
  const MQ = window.matchMedia('(max-width: 768px)');
  const host = document.querySelector('header') || document.body;
  if (!host || document.querySelector('.mobile-header')) return;

  const bar = document.createElement('div');
  bar.className = 'mobile-header';

  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.textContent = 'Orvenzia';
  brand.href = 'index.html';

  const btn = document.createElement('button');
  btn.className = 'mobile-nav-toggle';
  btn.setAttribute('aria-controls', 'mobile-menu');
  btn.setAttribute('aria-expanded', 'false');

  const icon = document.createElement('span');
  icon.className = 'burger';
  btn.appendChild(icon);

  bar.appendChild(brand);
  bar.appendChild(btn);

  if (MQ.matches) {
    host.prepend(bar);
    document.body.classList.add('has-mobile-header');
  }

  // Ét mobilpanel
  let panel = document.getElementById('mobile-menu');
  if (!panel) {
    panel = document.createElement('nav');
    panel.id = 'mobile-menu';
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    Object.assign(panel.style, {
      position: 'fixed', left: '0', right: '0', top: '48px',
      background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)',
      zIndex: '999', padding: '12px 16px'
    });
    const desktopNav = document.querySelector('header nav ul') || document.querySelector('nav ul');
    if (desktopNav) {
      const ul = desktopNav.cloneNode(true);
      ul.classList.remove('hidden');
      panel.appendChild(ul);
    }
    document.body.appendChild(panel);
  }

  function openMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  btn.addEventListener('click', () => openMenu(btn.getAttribute('aria-expanded') !== 'true'));
  window.addEventListener('resize', () => { if (!MQ.matches) openMenu(false); });

  // Ryd kun på about: fjern m-burger/m-panel i DOM hvis de findes
  document.querySelectorAll('.m-burger').forEach(el => el.remove());
  const legacyPanel = document.getElementById('m-panel');
  if (legacyPanel) legacyPanel.remove();
})();

(() => {
  // Robust, idempotent patch:
  // 1) Finder hvert case-kort
  // 2) Sætter titel = underoverskriftens tekst
  // 3) Fjerner "X-day ... screening / no data pull" afsnit
  // 4) Kører igen hvis indhold loades dynamisk (MutationObserver)
  const CARD_SELECTORS = [
    ".cases .card",
    ".case-card",
    ".card.case",
    ".cases-card",
    '[data-card="case"]'
  ];
  const TITLE_SELECTORS = [
    ".card-title",
    ".case-title",
    ".cases-title",
    "h1","h2","h3","h4","h5","h6",
    "strong"
  ];
  const SUBTITLE_SELECTORS = [
    ".card-subtitle",
    ".subtitle",
    ".case-subtitle",
    ".cases-subtitle",
    ".meta",
    "small"
  ];

  // "10-day", "12 days", også med – eller — som bindestreg
  const DAYS_RE = /(^|\\W)\\d+\\s*(?:-|–|—)?\\s*day(s)?\\b/i;
  const DAYS_CONTEXT_RE = /(readiness|screening|data\\s*pull)/i;

  function normalize(t){ return (t||"").replace(/\\s+/g," ").trim(); }

  function findFirst(el, selectors) {
    for (const sel of selectors) {
      const n = el.querySelector(sel);
      if (n && normalize(n.textContent).length) return n;
    }
    return null;
  }

  function findDaysParagraph(card) {
    const ps = card.querySelectorAll("p");
    for (const p of ps) {
      const txt = normalize(p.textContent);
      if (!txt) continue;
      if (DAYS_RE.test(txt) || (DAYS_CONTEXT_RE.test(txt) && /\\bday/i.test(txt))) {
        return p;
      }
    }
    return null;
  }

  function processCard(card) {
    if (!(card instanceof Element)) return false;
    if (card.dataset.ccFixed === "1") return false;

    const title = findFirst(card, TITLE_SELECTORS);
    const subtitle = findFirst(card, SUBTITLE_SELECTORS);
    let changed = false;

    // 1) Titel = underoverskriftens tekst
    if (title && subtitle) {
      const newTitle = normalize(subtitle.textContent);
      if (newTitle && normalize(title.textContent) !== newTitle) {
        title.textContent = newTitle;   // beholder h-tag/klasser (stil er uændret)
        subtitle.remove();              // fjern gamle underoverskrift
        changed = true;
      }
    }

    // 2) Fjern "X-day ..." afsnit
    const daysP = findDaysParagraph(card);
    if (daysP) { daysP.remove(); changed = true; }

    if (changed) card.dataset.ccFixed = "1";
    return changed;
  }

  function runOnce(root=document) {
    const set = new Set();
    for (const sel of CARD_SELECTORS) {
      root.querySelectorAll(sel).forEach(el => set.add(el));
    }
    set.forEach(processCard);
  }

  function run() {
    runOnce(document);

    // Håndter dynamisk indhold (idempotent)
    const observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type !== "childList") continue;
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          // Hvis noden selv er et kort eller indeholder kort
          const suspects = new Set();
          if ([...(node.classList||[])].some(c => /case|card/i.test(c))) suspects.add(node);
          const sels = CARD_SELECTORS;
          for (let i=0;i<sels.length;i++) {
            node.querySelectorAll(sels[i]).forEach(el => suspects.add(el));
          }
          suspects.forEach(processCard);
        });
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
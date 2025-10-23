
(function(){
  const isMobile = () => matchMedia('(max-width: 768px)').matches;
  function cssPxToNum(v){ if(!v) return 0; const m=v.match(/-?\d+(?:\.\d+)?/); return m?parseFloat(m[0]):0; }
  function readVarPx(name){ const v = getComputedStyle(document.documentElement).getPropertyValue(name); return cssPxToNum(v) || 0; }
  function isLightColor(rgb){
    if(!rgb) return false;
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if(!m) return false;
    const r = +m[1], g = +m[2], b = +m[3];
    const luma = 0.2126*r + 0.7152*g + 0.0722*b;
    return luma > 200;
  }
  function removeTopWhiteBar(){
    const topBlocks = Array.from(document.body.children).slice(0, 10);
    for(const el of topBlocks){
      if(!(el instanceof HTMLElement)) continue;
      if(/^(SCRIPT|STYLE|LINK|META|NOSCRIPT)$/.test(el.tagName)) continue;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const text = (el.textContent || '').trim();
      if(rect.height < 220 && rect.top < 260 && isLightColor(style.backgroundColor)){
        if (text === 'Orvenzia' || /^Orvenzia\s*$/i.test(text)) {
          el.classList.add('orv-about-hide');
          return rect.height;
        }
      }
    }
    return 0;
  }
  function pullUpFirstContent(){
    const candidates = document.querySelectorAll('main .hero, .hero, main > section, main > div, .section');
    const el = candidates[0];
    if(!el) return;
    const headerH = readVarPx('--orv-header-h') || 56;
    const rect = el.getBoundingClientRect();
    const desiredTop = Math.max(headerH, 0);
    const gap = Math.round(rect.top - desiredTop);
    if(gap > 8){
      const mt = cssPxToNum(getComputedStyle(el).marginTop);
      el.style.marginTop = (mt - gap) + 'px';
    }
  }
  function fix(){
    if(!isMobile()) return;
    removeTopWhiteBar();
    pullUpFirstContent();
    setTimeout(pullUpFirstContent, 150);
    setTimeout(pullUpFirstContent, 350);
  }
  function onReady(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);} else { fn(); } }
  onReady(fix);
  addEventListener('resize', fix);
  addEventListener('orientationchange', fix);
})();

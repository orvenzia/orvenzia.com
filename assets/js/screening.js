// screening.js — Orvenzia Screening v6.3 (final med ny /exec URL)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('screening-form');
  const resultWrap = document.getElementById('result-wrap');
  const resultCard = document.getElementById('result-card');
  const companyEl = document.getElementById('company');
  const emailEl = document.getElementById('email');
  const mailStatus = document.getElementById('mail-status');
  const errorBanner = document.getElementById('error-banner');

  // Vægte 1:1 fra Excel
  const weights = [
    {yes:4.0,no:0.0}, {yes:4.0,no:0.0}, {yes:7.0,planned:3.5,no:0.0},
    {yes:3.0,planned:1.5,no:0.0}, {yes:12.0,no:0.0}, {yes:8.0,no:0.0},
    {yes:2.0,planned:1.0,no:0.0}, {yes:4.0,no:0.0}, {yes:6.0,planned:3.0,no:0.0},
    {yes:12.0,no:0.0}, {yes:12.0,planned:6.0,no:0.0},
    {yes:11.0,planned:5.5,no:0.0}, {yes:15.0,planned:7.5,no:0.0}
  ];
  const totalQuestions = weights.length;
  const maxScore = weights.reduce((s,w)=> s + (w.yes||0), 0);

  function showError(msg){
    if(!errorBanner) return;
    errorBanner.textContent = msg;
    errorBanner.style.display='block';
  }

  function levelFor(pct){
    if (pct >= 99) return 'GREEN';
    if (pct >= 80) return 'LIGHT_GREEN';
    if (pct >= 60) return 'YELLOW';
    if (pct >= 40) return 'ORANGE';
    return 'RED';
  }

  // Farvet gauge med korrekt vinkel (−90° → +90°)
function gaugeSVG(score) {
  // Map score til zone (farve + label)
  const zones = [
    { min: 0,   max: 39,  color: "#e53935" }, // Red
    { min: 40,  max: 59,  color: "#fb8c00" }, // Orange
    { min: 60,  max: 79,  color: "#fdd835" }, // Yellow
    { min: 80,  max: 98,  color: "#8bc34a" }, // Light Green
    { min: 99,  max: 100, color: "#43a047" }  // Green
  ];

  // Find zone for score
  const zone = zones.find(z => score >= z.min && score <= z.max) || zones[0];

  // Beregn vinkel (−90° til +90°)
  const angle = -90 + (score / 100) * 180;

  // SVG (glat baggrund, tydelig nål, zone-markering)
  return `
    <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Baggrundsbuens farvezoner -->
      <path d="M30,180 A150,150 0 0,1 330,180"
            stroke="url(#grad)" stroke-width="20" fill="none" />
      <defs>
        <linearGradient id="grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#e53935"/>
          <stop offset="25%"  stop-color="#fb8c00"/>
          <stop offset="50%"  stop-color="#fdd835"/>
          <stop offset="75%"  stop-color="#8bc34a"/>
          <stop offset="100%" stop-color="#43a047"/>
        </linearGradient>
      </defs>

      <!-- Nålen -->
      <g transform="translate(180,180) rotate(${angle})">
        <line x1="0" y1="0" x2="0" y2="-110" stroke="#222" stroke-width="4" />
        <circle cx="0" cy="0" r="8" fill="#222" />
        <circle cx="0" cy="0" r="6" fill="${zone.color}" />
      </g>
    </svg>`;
}


  async function computeAndRender(e){
    e && e.preventDefault();
    if(errorBanner) errorBanner.style.display='none';

    const company = (companyEl?.value || '').trim();
    const email   = (emailEl?.value || '').trim();
    if(!company || !email){ alert('Please enter company and work email.'); return; }

    // Beregn score
    let raw = 0;
    const answers = [];
    weights.forEach((w,idx)=>{
      const sel = form.querySelector(`[name=q${idx+1}]:checked`);
      if(!sel) return;
      const pts = parseFloat(sel.dataset.points || '0');
      raw += pts;
      answers.push({ q:`q${idx+1}`, answer: sel.value, points: pts });
    });
    if (answers.length < totalQuestions){ alert('Please answer all questions.'); return; }

    const pct = Math.round((raw / maxScore) * 100);
    const level = levelFor(pct);
    const T = (window.reportTexts && window.reportTexts[level]) || {title: level,status:'',recommendation:'',outcome:''};
    const dateStr = new Date().toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});

    // Vis resultat
    resultCard.innerHTML = `
      <div class="report-head">
        <div class="brand-row"><span class="logo-mark">O</span><span class="logo-type">Orvenzia</span></div>
        <h2 class="report-title">ESG Readiness Screening Score</h2>
        <div class="meta-grid"><div><strong>Company:</strong> ${company}</div><div><strong>Date:</strong> ${dateStr}</div></div>
      </div>
      <div class="score-row">
        <div class="gauge-wrap">${gaugeSVG(pct)}</div>
        <div class="score-text">
          <div class="big-score">${pct}<span class="u">/100</span></div>
          <div class="level-title">${T.title}</div>
        </div>
      </div>
      <div class="report-body">
        <p class="status"><strong>Status:</strong> ${T.status}</p>
        <p class="rec"><strong>Recommendation:</strong><br>${(T.recommendation||'').replaceAll('\\n','<br>')}</p>
        <p class="outcome"><strong>Outcome:</strong> ${T.outcome}</p>
      </div>
      <div class="report-cta"><a class="btn" href="pricing.html">See pricing</a><a class="btn btn-outline" href="contact.html">Contact</a></div>
    `;
    resultWrap.classList.add('show');
    resultWrap.scrollIntoView({ behavior:'smooth' });

    // PDF til mail
    const pdfHtml = `
      <html><head><meta charset="utf-8"><title>Orvenzia Screening Report</title></head><body>
        <h1>ESG Readiness Screening Score</h1>
        <div>Company: ${company} — Date: ${dateStr}</div>
        <div>${pct}/100 (${T.title})</div>
        ${gaugeSVG(pct)}
        <p><strong>Status:</strong> ${T.status}</p>
        <p><strong>Recommendation:</strong><br>${T.recommendation}</p>
        <p><strong>Outcome:</strong> ${T.outcome}</p>
      </body></html>`;

    // Send til backend
    try {
      const backendUrl = "https://script.google.com/macros/s/AKfycbyjJPhK1krK-hXzdkQivpWl2Waj3YY7MFzDxLRkSy3iT9Kh5yi0YZHByikgDYjxfD8Q/exec";
      mailStatus.textContent = 'Sending your report...';

      await fetch(backendUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ company, email, score:pct, level, answers, reportHtml: pdfHtml })
      });

      mailStatus.textContent = 'Report sent. Check your inbox.';
    } catch (err) {
      console.error(err);
      mailStatus.textContent = 'Network error while sending email.';
      showError(err.message || 'Unexpected error');
    }
  }

  form.setAttribute('novalidate','novalidate');
  form.addEventListener('submit', (e)=>{ e.preventDefault(); computeAndRender(e); });
  document.getElementById('see-result')?.addEventListener('click', (e)=>{ e.preventDefault(); computeAndRender(e); });
});

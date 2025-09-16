// screening.js — Orvenzia Screening v6.2 med din Web App URL

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('screening-form');
  const resultWrap = document.getElementById('result-wrap');
  const resultCard = document.getElementById('result-card');
  const companyEl = document.getElementById('company');
  const emailEl = document.getElementById('email');
  const mailStatus = document.getElementById('mail-status');
  const errorBanner = document.getElementById('error-banner');

  // Vægte 1:1 med Excel (Yes / Planned / No kun hvor relevant)
  const weights = [
    {yes:4.0,no:0.0},                         // Q1
    {yes:4.0,no:0.0},                         // Q2
    {yes:7.0,planned:3.5,no:0.0},             // Q3
    {yes:3.0,planned:1.5,no:0.0},             // Q4
    {yes:12.0,no:0.0},                        // Q5
    {yes:8.0,no:0.0},                         // Q6
    {yes:2.0,planned:1.0,no:0.0},             // Q7
    {yes:4.0,no:0.0},                         // Q8
    {yes:6.0,planned:3.0,no:0.0},             // Q9
    {yes:12.0,no:0.0},                        // Q10
    {yes:12.0,planned:6.0,no:0.0},            // Q11
    {yes:11.0,planned:5.5,no:0.0},            // Q12
    {yes:15.0,planned:7.5,no:0.0},            // Q13
  ];

  const totalQuestions = weights.length;
  const maxScore = weights.reduce((sum,w)=> sum + (w.yes||0), 0);

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

  // FARVET SVG gauge
  function gaugeSVG(pct){
    const angle = (pct/100)*180;
    return `
      <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,180 A150,150 0 0,1 102,60" stroke="#e53935" stroke-width="18" fill="none" />
        <path d="M102,60 A150,150 0 0,1 180,30" stroke="#fb8c00" stroke-width="18" fill="none" />
        <path d="M180,30 A150,150 0 0,1 258,60" stroke="#fdd835" stroke-width="18" fill="none" />
        <path d="M258,60 A150,150 0 0,1 330,180" stroke="#8bc34a" stroke-width="18" fill="none" />
        <path d="M328,176 A150,150 0 0,1 330,180" stroke="#43a047" stroke-width="18" fill="none" />
        <g transform="translate(180,180) rotate(${angle})">
          <rect x="-2" y="-130" width="4" height="130" fill="#111"/>
          <circle cx="0" cy="0" r="6" fill="#111"/>
        </g>
      </svg>`;
  }

  async function computeAndRender(e){
    e && e.preventDefault();
    if(errorBanner) errorBanner.style.display='none';

    const company = (companyEl?.value || '').trim();
    const email   = (emailEl?.value || '').trim();
    if(!company || !email){
      alert('Please enter company and work email.');
      return;
    }

    // Beregn score
    let raw = 0;
    const answers = [];
    weights.forEach((w,idx)=>{
      const name = `q${idx+1}`;
      const sel = form.querySelector(`[name=${name}]:checked`);
      if(!sel) return;
      const pts = parseFloat(sel.dataset.points || '0');
      raw += pts;
      answers.push({ q: name, answer: sel.value, points: pts });
    });
    if (answers.length < totalQuestions){
      alert('Please answer all questions.');
      return;
    }

    const pct = Math.round((raw / maxScore) * 100);
    const level = levelFor(pct);
    const T = (window.reportTexts && window.reportTexts[level]) || { title: level, status:'', recommendation:'', outcome:'' };
    const dateStr = new Date().toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});

    // VIS RESULTATET (med farvet gauge)
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

    // SEND til Apps Script backend
    try {
      const backendUrl = "https://script.google.com/macros/s/AKfycbxXWz4hUIr0aDvvQhXDdV_E5tsGdX8SXIctPVaRUaaYDH3TV-OnOSE9Sc6zExz6zX-u/exec";
      mailStatus.textContent = 'Sending your report...';

      await fetch(backendUrl, {
        method: 'POST',
        mode: 'no-cors',  // undgår CORS fejl
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ company, email, score: pct, level, answers, reportHtml: pdfHtml })
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

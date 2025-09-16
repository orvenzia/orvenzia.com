// screening.js — Orvenzia Screening v7.0 (final)
// Sender data med POST til Google Apps Script backend (Code.gs)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('screening-form');
  const resultWrap = document.getElementById('result-wrap');
  const resultCard = document.getElementById('result-card');
  const companyEl = document.getElementById('company');
  const emailEl = document.getElementById('email');
  const mailStatus = document.getElementById('mail-status');
  const errorBanner = document.getElementById('error-banner');

  // Vægte 1:1
  const weights = [
    {yes:4.0,no:0.0}, {yes:4.0,no:0.0}, {yes:7.0,planned:3.5,no:0.0},
    {yes:3.0,planned:1.5,no:0.0}, {yes:12.0,no:0.0}, {yes:8.0,no:0.0},
    {yes:2.0,planned:1.0,no:0.0}, {yes:4.0,no:0.0}, {yes:6.0,planned:3.0,no:0.0},
    {yes:12.0,no:0.0}, {yes:12.0,planned:6.0,no:0.0},
    {yes:11.0,planned:5.5,no:0.0}, {yes:15.0,planned:7.5,no:0.0}
  ];
  const maxScore = weights.reduce((s,w)=> s + (w.yes||0), 0);

  function levelFor(pct){
    if (pct >= 99) return 'GREEN';
    if (pct >= 80) return 'LIGHT_GREEN';
    if (pct >= 60) return 'YELLOW';
    if (pct >= 40) return 'ORANGE';
    return 'RED';
  }

  // Gauge SVG
  function gaugeSVG(score) {
    const zones = [
      { min: 0,   max: 39,  color: "#e53935" }, // Red
      { min: 40,  max: 59,  color: "#fb8c00" }, // Orange
      { min: 60,  max: 79,  color: "#fdd835" }, // Yellow
      { min: 80,  max: 98,  color: "#8bc34a" }, // Light Green
      { min: 99,  max: 100, color: "#43a047" }  // Green
    ];
    const zone = zones.find(z => score >= z.min && score <= z.max) || zones[0];
    const angle = -90 + (score / 100) * 180;

    return `
      <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#e53935"/>
            <stop offset="25%"  stop-color="#fb8c00"/>
            <stop offset="50%"  stop-color="#fdd835"/>
            <stop offset="75%"  stop-color="#8bc34a"/>
            <stop offset="100%" stop-color="#43a047"/>
          </linearGradient>
        </defs>
        <path d="M30,180 A150,150 0 0,1 330,180" stroke="url(#grad)" stroke-width="20" fill="none" />
        <g transform="translate(180,180) rotate(${angle})">
          <line x1="0" y1="0" x2="0" y2="-110" stroke="#222" stroke-width="4" />
          <circle cx="0" cy="0" r="8" fill="#222" />
          <circle cx="0" cy="0" r="6" fill="${zone.color}" />
        </g>
      </svg>`;
  }

  async function computeAndRender(e){
    e.preventDefault();

    const company = (companyEl?.value || '').trim();
    const email   = (emailEl?.value || '').trim();
    if(!company || !email){ alert('Please enter company and work email.'); return; }

    // Beregn score
    let raw = 0;
    const answers = {};
    weights.forEach((w,idx)=>{
      const sel = form.querySelector(`[name=q${idx+1}]:checked`);
      if(!sel) return;
      const pts = parseFloat(sel.dataset.points || '0');
      raw += pts;
      answers[`q${idx+1}`] = sel.value;
    });
    const pct = Math.round((raw / maxScore) * 100);
    const level = levelFor(pct);
    const dateStr = new Date().toLocaleDateString();

    // Vis resultat
    resultCard.innerHTML = `
      <h2>ESG Readiness Screening Score</h2>
      <div><strong>Company:</strong> ${company} — <strong>Date:</strong> ${dateStr}</div>
      <div class="score-row">
        <div class="gauge-wrap">${gaugeSVG(pct)}</div>
        <div class="big-score">${pct}/100 (${level})</div>
      </div>`;
    resultWrap.classList.add('show');

    // Send til backend
    try {
      mailStatus.textContent = 'Sending report...';
      const response = await fetch("https://script.google.com/macros/s/AKfycbx97ufOko6lNELzTN6trPYcwaWEVm2ZxMgLaO6fMPfMrCCLlQPSo8jB7zQLoBzn34zglg/exec", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: {company, email}, answers })
      });
      const json = await response.json();
      console.log("Backend response:", json);
      mailStatus.textContent = 'Report sent.';
    } catch (err) {
      console.error(err);
      mailStatus.textContent = 'Error sending report.';
    }
  }

  form.addEventListener('submit', computeAndRender);
});

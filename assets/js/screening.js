// screening.js — Orvenzia ESG Screening (final)

document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('screening-form');
  const companyEl  = document.getElementById('company');
  const emailEl    = document.getElementById('email');
  const resultWrap = document.getElementById('result-wrap');
  const resultCard = document.getElementById('result-card');
  const mailStatus = document.getElementById('mail-status');

  // <<< Sæt din Apps Script /exec URL her >>>
  const BACKEND_URL = "https://script.google.com/macros/s/AKfycbynfMFDqy9NvI6yzHN4C8yB7Dd7UXU9ZovX6kHfWZcrtjl4dPw3Bo7MtcdpcjAbdh1Zxg/exec";

  // YES-vægte (planned = 50% af yes)
  const WEIGHTS = {
    q1: 4,  q2: 4,  q3: 7,  q4: 3,  q5: 12,
    q6: 8,  q7: 2,  q8: 4,  q9: 6,  q10: 12,
    q11: 12, q12: 11, q13: 15
  };

  // Tekster (vises til kunden i UI)
  const TEXTS = {
    GREEN: {
      title: "GREEN – Leading",
      status: "Best-in-class alignment. Robust policies, controls and audit evidence.",
      recommendation: "Maintain current controls. Schedule periodic reviews and monitoring.",
      outcome: "Buyer Ready – strong ESG profile and low audit risk."
    },
    LIGHT_GREEN: {
      title: "LIGHT GREEN – Strong",
      status: "Meets buyer expectations with only minor gaps typically identified in audits.",
      recommendation: "Baseline Report (€379; <10 days) to document alignment and address minor improvements.",
      outcome: "Audit-ready proof and prevention against slipping into Not Buyer Ready."
    },
    YELLOW: {
      title: "YELLOW – Lagging / Not Buyer Ready",
      status: "Baseline exists but key policies and documentation are missing. Buyers see this as risk.",
      recommendation: "Baseline Report (€379; <10 days) for quick documentation fixes. Core Report (€1,329; 30–60 days) for deeper policy gaps.",
      outcome: "Clear gap list and a rapid path to buyer readiness."
    },
    ORANGE: {
      title: "ORANGE – At Risk",
      status: "High buyer risk. Material documentation gaps and weak controls.",
      recommendation: "Core Report (€1,329) to close gaps and implement controls. Prioritise high-impact buyer requirements.",
      outcome: "Reduced risk and visible progress. Moves towards Not Buyer Ready → Buyer Ready."
    },
    RED: {
      title: "RED – Critical",
      status: "Not buyer ready. Lacks key policies, controls and evidence.",
      recommendation: "Core Report (€1,329) to establish baseline policies and controls. Governance quick-wins in first 2–3 weeks.",
      outcome: "Foundational readiness and clear plan to pass ESG due diligence."
    }
  };

  function computeLocal(answersObj) {
    let total = 0, max = 0;
    Object.keys(WEIGHTS).forEach(q => {
      const yesW = WEIGHTS[q]; max += yesW;
      const a = (answersObj[q] || "").toLowerCase();
      if (a === "yes") total += yesW;
      else if (a === "planned") total += yesW * 0.5;
    });
    const score = Math.round((total / max) * 100);
    let level = "RED";
    if (score >= 99) level = "GREEN";
    else if (score >= 80) level = "LIGHT_GREEN";
    else if (score >= 60) level = "YELLOW";
    else if (score >= 40) level = "ORANGE";
    return { score, level };
  }

  // Gauge med rene farvezoner
  function gaugeSVG(score) {
    const angle = -90 + (score / 100) * 180;
    const zones = [
      { min: 0,   max: 39,  color: "#e53935" },
      { min: 40,  max: 59,  color: "#fb8c00" },
      { min: 60,  max: 79,  color: "#fdd835" },
      { min: 80,  max: 98,  color: "#8bc34a" },
      { min: 99,  max: 100, color: "#43a047" }
    ];
    const arcFor = (min, max) => {
      const start = -90 + (min/100)*180;
      const end   = -90 + (max/100)*180;
      const r=150, cx=180, cy=180;
      const x1 = cx + r*Math.cos(start*Math.PI/180);
      const y1 = cy + r*Math.sin(start*Math.PI/180);
      const x2 = cx + r*Math.cos(end*Math.PI/180);
      const y2 = cy + r*Math.sin(end*Math.PI/180);
      const large = (end-start)>180?1:0;
      return `<path d="M${x1},${y1} A150,150 0 ${large},1 ${x2},${y2}" stroke-width="20" stroke="CURRENT" fill="none"/>`
        .replace("CURRENT",""+zones.find(z=>z.min===min&&z.max===max).color);
    };
    return `
      <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
        ${zones.map(z=>arcFor(z.min,z.max)).join("")}
        <g transform="translate(180,180) rotate(${angle})">
          <line x1="0" y1="0" x2="0" y2="-120" stroke="#111" stroke-width="4"/>
          <circle cx="0" cy="0" r="8" fill="#111"/>
          <circle cx="0" cy="0" r="6" fill="#fff"/>
        </g>
      </svg>`;
  }

  async function onSubmit(e) {
    e.preventDefault();

    const company = (companyEl?.value || "").trim();
    const email   = (emailEl?.value || "").trim();
    if (!company || !email) { alert("Please enter company and work email."); return; }

    // Saml svar som {q1:"yes",...}
    const answers = {};
    const names = Object.keys(WEIGHTS);
    for (const q of names) {
      const checked = form.querySelector(`input[name="${q}"]:checked`);
      if (!checked) { alert("Please answer all questions."); return; }
      answers[q] = checked.value;
    }

    // Lokal beregning → vis hurtigt resultat i UI
    const local = computeLocal(answers);
    const TT = TEXTS[local.level];

    resultCard.innerHTML = `
      <div class="report-head">
        <div class="brand-row"><span class="logo-mark">O</span><span class="logo-type">Orvenzia</span></div>
        <h2 class="report-title">ESG Readiness Screening Score</h2>
        <div class="meta-grid"><div><strong>Company:</strong> ${company}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div></div>
      </div>
      <div class="score-row">
        <div class="gauge-wrap">${gaugeSVG(local.score)}</div>
        <div class="score-text">
          <div class="big-score">${local.score}<span class="u">/100</span></div>
          <div class="level-title">${TT.title}</div>
        </div>
      </div>
      <div class="report-body">
        <p class="status"><strong>Status:</strong> ${TT.status}</p>
        <p class="rec"><strong>Recommendation:</strong><br>${TT.recommendation}</p>
        <p class="outcome"><strong>Outcome:</strong> ${TT.outcome}</p>
      </div>
      <div class="report-cta">
        <a class="btn" href="pricing.html">See pricing</a>
        <a class="btn btn-outline" href="contact.html">Contact</a>
      </div>`;
    resultWrap.classList.add('show');
    mailStatus.textContent = "Generating baseline report...";

    // Send til backend (for rapport + mail)
    try {
      const resp = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: { company, email }, answers })
      });
      const json = await resp.json();

      if (json && json.ok) {
        // hvis backend har en lidt anden vurdering → opdatér UI til serverens facit
        const T2 = TEXTS[json.level] || TT;
        if (json.score !== local.score || json.level !== local.level) {
          resultCard.querySelector('.gauge-wrap').innerHTML = gaugeSVG(json.score);
          resultCard.querySelector('.big-score').innerHTML = `${json.score}<span class="u">/100</span>`;
          resultCard.querySelector('.level-title').textContent = T2.title;
          resultCard.querySelector('.status').innerHTML = `<strong>Status:</strong> ${json.statusText}`;
          resultCard.querySelector('.rec').innerHTML    = `<strong>Recommendation:</strong><br>${json.recommendation}`;
          resultCard.querySelector('.outcome').innerHTML= `<strong>Outcome:</strong> ${json.outcome}`;
        }
        mailStatus.textContent = "Baseline report sent to Orvenzia.";
      } else {
        mailStatus.textContent = "Could not generate report (server error).";
      }
    } catch (err) {
      console.error(err);
      mailStatus.textContent = "Network error while sending data.";
    }
  }

  form.addEventListener('submit', onSubmit);
});

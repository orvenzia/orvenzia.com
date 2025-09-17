// screening.js — Orvenzia Screening (clean + stable)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('screening-form');
  const resultWrap = document.getElementById('result-wrap');
  const resultCard = document.getElementById('result-card');
  const companyEl = document.getElementById('company');
  const emailEl = document.getElementById('email');
  const mailStatus = document.getElementById('mail-status');
  const errorBanner = document.getElementById('error-banner');

  // Vægte (yes/planned/no) – holdes i sync med backend
  const weights = {
    q1: {yes:4,  planned:0,   no:0},
    q2: {yes:4,  planned:0,   no:0},
    q3: {yes:7,  planned:3.5, no:0},
    q4: {yes:3,  planned:1.5, no:0},
    q5: {yes:12, planned:0,   no:0},
    q6: {yes:8,  planned:0,   no:0},
    q7: {yes:2,  planned:1,   no:0},
    q8: {yes:4,  planned:0,   no:0},
    q9: {yes:6,  planned:3,   no:0},
    q10:{yes:10, planned:0,   no:0},
    q11:{yes:12, planned:0,   no:0},
    q12:{yes:18, planned:9,   no:0},
    q13:{yes:10, planned:0,   no:0},
  };

  const questions = {
    q1: "Waste management policy/procedure",
    q2: "Energy consumption mapped",
    q3: "Reduction targets (CO₂ / energy)",
    q4: "Monitor environmental KPIs",
    q5: "Health & safety policy",
    q6: "Incidents / near-misses tracked",
    q7: "Employee code of conduct",
    q8: "Supplier screening (ESG/ethics)",
    q9: "Scope 3 mapped / plan",
    q10:"Whistleblower channel",
    q11:"Anti-corruption/anti-bribery policy",
    q12:"Data privacy policy & access controls",
    q13:"Publishes ESG information"
  };

  function showError(msg){
    errorBanner.textContent = msg || 'An unexpected error occurred.';
    errorBanner.classList.remove('hidden');
    setTimeout(()=> errorBanner.classList.add('hidden'), 7000);
  }

  function computeScore(ans){
    // max = sum of max points (take "yes")
    const max = Object.values(weights).reduce((s,w)=>s+Math.max(w.yes||0,w.planned||0,w.no||0),0);
    const sum = Object.entries(ans).reduce((acc,[k,v])=>{
      const w = weights[k]||{};
      return acc + (w[v]||0);
    },0);
    const pct = Math.round((sum/(max||1))*100);
    return {sum, max, pct};
  }

  function levelFromPct(pct){
    if (pct >= 99) return 'LEADING';
    if (pct >= 80) return 'STRONG';
    if (pct >= 60) return 'YELLOW';
    if (pct >= 40) return 'ORANGE';
    return 'RED';
  }

  function levelText(level){
    const map = {
      LEADING: {
        title: "Green (99–100) – Leading",
        status: "Fully aligned with buyer requirements.",
        rec: "Light Update Subscription (alerts + periodic check-ins).",
        outcome: "Maintain green status without extra workload."
      },
      STRONG: {
        title: "Light Green (80–98) – Strong",
        status: "Meets buyer expectations with minor improvements.",
        rec: "Baseline Report (1–2 pages, €379; <10 days).",
        outcome: "Audit-ready proof; prevents slipping to “Not Buyer Ready”."
      },
      YELLOW: {
        title: "Yellow (60–79) – Lagging / Not Buyer Ready",
        status: "Core elements exist, but missing documentation creates risk.",
        rec: "Baseline (€379; <10 days) or Core (2–8 pages, €1,329; 30–60 days).",
        outcome: "Clear gap list → rapid path to buyer readiness."
      },
      ORANGE: {
        title: "Orange (40–59) – At Risk",
        status: "Significant gaps likely to affect tenders.",
        rec: "Core Report (€1,329; 30–60 days).",
        outcome: "Prioritized plan to reach buyer-ready status."
      },
      RED: {
        title: "Red (0–39) – Critical",
        status: "Foundational ESG controls are missing.",
        rec: "Enterprise engagement with on-site support.",
        outcome: "Stabilize compliance and build essentials fast."
      }
    };
    return map[level];
  }

  function gaugeSVG(pct){
    const angle = -90 + (pct/100)*180;
    return `
      <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" aria-label="Score gauge ${pct}%">
        <path d="M30,180 A150,150 0 0,1 102,60" stroke="#e53935" stroke-width="18" fill="none" />
        <path d="M102,60 A150,150 0 0,1 180,30" stroke="#fb8c00" stroke-width="18" fill="none" />
        <path d="M180,30 A150,150 0 0,1 258,60" stroke="#fdd835" stroke-width="18" fill="none" />
        <path d="M258,60 A150,150 0 0,1 330,180" stroke="#8bc34a" stroke-width="18" fill="none" />
        <line x1="180" y1="180" x2="${180 + 140*Math.cos(angle*Math.PI/180)}" y2="${180 + 140*Math.sin(angle*Math.PI/180)}" stroke="#111" stroke-width="6" stroke-linecap="round"/>
        <circle cx="180" cy="180" r="9" fill="#111"/>
        <text x="180" y="190" text-anchor="middle" font-size="12" fill="#333">0</text>
        <text x="35" y="185" font-size="12" fill="#333">0</text>
        <text x="325" y="185" font-size="12" fill="#333">100</text>
      </svg>`;
  }

  function computeAndRender(){
    const company = companyEl.value.trim();
    const email = emailEl.value.trim();
    if (!company || !email) {
      showError('Please enter company and a valid email.');
      return;
    }

    // collect answers
    const ans = {};
    for (let i=1;i<=13;i++){
      const name = `q${i}`;
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      if(!checked){ showError('Please answer all 13 questions.'); return; }
      ans[name] = checked.value.toLowerCase();
    }

    const {pct} = computeScore(ans);
    const lvl = levelFromPct(pct);
    const T = levelText(lvl);

    const html = `
      <div class="score-wrap">
        <div class="gauge">${gaugeSVG(pct)}</div>
        <div class="score"><div class="big">${pct}%</div><div class="lbl">${lvl}</div></div>
      </div>
      <h3>${T.title}</h3>
      <p><strong>Status:</strong> ${T.status}</p>
      <p><strong>Recommended next step:</strong> ${T.rec}</p>
      <p><strong>Outcome:</strong> ${T.outcome}</p>
    `;
    resultCard.innerHTML = html;
    resultWrap.classList.remove('hidden');

    return {company, email, answers: ans, scorePct: pct, level: lvl};
  }

  async function submitToBackend(payload){
    const backendUrl = (window.SCREENING_BACKEND_URL||"").trim();
    if(!backendUrl){
      throw new Error('Backend URL missing. Set window.SCREENING_BACKEND_URL.');
    }
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
    });
    // Backend returnerer JSON
    const json = await res.json().catch(()=>({ok:false,error:'Invalid JSON'}));
    if(!res.ok || !json.ok){
      throw new Error(json.error || `HTTP ${res.status}`);
    }
    return json;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      const base = computeAndRender();
      if(!base) return;
      mailStatus.textContent = 'Sending your report...';
      const payload = {
        lead: { company: base.company, email: base.email },
        answers: base.answers,
        meta: { source:'screening.html', ts: new Date().toISOString() }
      };
      const json = await submitToBackend(payload);
      mailStatus.textContent = 'Report sent. Check your inbox.';
    }catch(err){
      console.error(err);
      mailStatus.textContent = 'Failed to send. Try again.';
      showError(err.message);
    }
  });

  document.getElementById('see-result')?.addEventListener('click', (e)=>{
    e.preventDefault();
    computeAndRender();
  });
});

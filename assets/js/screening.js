// === Orvenzia ESG Screening frontend ===

const W = {
  q1:{yes:4,planned:0,no:0},   q2:{yes:4,planned:0,no:0},
  q3:{yes:7,planned:3.5,no:0}, q4:{yes:3,planned:1.5,no:0},
  q5:{yes:12,planned:0,no:0},  q6:{yes:8,planned:0,no:0},
  q7:{yes:2,planned:1,no:0},   q8:{yes:4,planned:0,no:0},
  q9:{yes:6,planned:3,no:0},   q10:{yes:10,planned:0,no:0},
  q11:{yes:12,planned:0,no:0}, q12:{yes:18,planned:9,no:0},
  q13:{yes:10,planned:0,no:0}
};

const REPORT_TEXTS = {
  GREEN: {
    title: "🟢 Leading",
    status: "Fully aligned with buyer requirements; no immediate action required.",
    recommendation: "Consider Subscription (regulatory alerts + periodic check-ins).",
    outcome: "Maintain leading status without extra workload."
  },
  LIGHT_GREEN: {
    title: "🟢 Strong",
    status: "Meets buyer expectations with minor improvements, typically found in audits.",
    recommendation: "Baseline Report (1–2 pages, €379; delivery <10 days) to document alignment and pinpoint fixes.",
    outcome: "Audit-ready proof; prevents slipping to “Not Buyer Ready”."
  },
  YELLOW: {
    title: "🟡 Not Buyer Ready",
    status: "Core elements exist, but missing policies/documentation create buyer risk.",
    recommendation: "Start with Baseline Report (€379; <10 days). Alternatively, Core Report (2–8 pages, €1,729; 30–60 days).",
    outcome: "Clear gap list → rapid path to buyer readiness."
  },
  ORANGE: {
    title: "🟠 At Risk",
    status: "Significant gaps, likely to affect tenders and buyer reviews.",
    recommendation: "Core Report (€1,729; 30–60 days) with prioritized gap analysis, templates, and roadmap.",
    outcome: "Fast risk reduction and restored buyer eligibility."
  },
  RED: {
    title: "🔴 Critical",
    status: "Current posture blocks buyer eligibility and escalates commercial risk.",
    recommendation: "Minimum: Core Report (€1,729; 30–60 days). Best: Enterprise Report (6–15 pages, €2,439–4,989; 60–120 days).",
    outcome: "Controlled turnaround to buyer-acceptable status quickly."
  }
};

function showError(msg){
  const b=document.getElementById('error-banner');
  b.textContent=msg||'Unexpected error.'; 
  b.style.display='block';
  setTimeout(()=> b.style.display='none',6000);
}

function collectAnswers(){
  const a={}; 
  for(let i=1;i<=13;i++){
    const el=document.querySelector(`input[name="q${i}"]:checked`);
    if(!el) return null; 
    a["q"+i]=el.value.toLowerCase();
  } 
  return a;
}

function computeScore(ans){
  let sum=0,max=0;
  Object.keys(W).forEach(k=>{
    const w=W[k]; 
    max+=Math.max(w.yes||0,w.planned||0,w.no||0); 
    sum+=(w[ans[k]]||0);
  });
  return Math.round((sum/(max||1))*100);
}

function levelFromPct(pct){
  if (pct>=99) return "GREEN";
  if (pct>=80) return "LIGHT_GREEN";
  if (pct>=60) return "YELLOW";
  if (pct>=40) return "ORANGE";
  return "RED";
}

// -------- Gauge med animation --------
function gaugeSVG(pct){
  const angle=-90+(pct/100)*180;
  const cx=180, cy=180, r=150;
  const x2=cx+(r-25)*Math.cos(angle*Math.PI/180);
  const y2=cy+(r-25)*Math.sin(angle*Math.PI/180);

  return `
  <svg width="340" height="200" viewBox="0 0 360 200" class="gauge-svg">
    <!-- Baggrund -->
    <path d="M30,180 A150,150 0 0,1 330,180" 
          stroke="#f3f3f3" stroke-width="26" fill="none"/>

    <!-- Farvezoner med gradient -->
    <path d="M30,180 A150,150 0 0,1 110,60" stroke="url(#gradRed)" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M110,60 A150,150 0 0,1 180,30" stroke="url(#gradOrange)" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M180,30 A150,150 0 0,1 250,60" stroke="url(#gradYellow)" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M250,60 A150,150 0 0,1 330,180" stroke="url(#gradGreen)" stroke-width="26" fill="none" stroke-linecap="round"/>

    <!-- Gradients -->
    <defs>
      <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b71c1c"/>
        <stop offset="100%" stop-color="#f44336"/>
      </linearGradient>
      <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#e65100"/>
        <stop offset="100%" stop-color="#ff9800"/>
      </linearGradient>
      <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fbc02d"/>
        <stop offset="100%" stop-color="#fff59d"/>
      </linearGradient>
      <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2e7d32"/>
        <stop offset="100%" stop-color="#81c784"/>
      </linearGradient>
    </defs>

    <!-- Nålen -->
    <polygon id="needle" points="${cx-6},${cy} ${x2},${y2} ${cx+6},${cy}" class="gauge-needle"/>
    <circle cx="${cx}" cy="${cy}" r="10" class="gauge-center"/>

    <!-- Labels -->
    <text x="40" y="195" font-size="13" fill="#666">0</text>
    <text x="310" y="195" font-size="13" fill="#666">100</text>
  </svg>`;
}

// -------- Resultatkort --------
function renderResult(pct, company){
  const level = levelFromPct(pct);
  const t = REPORT_TEXTS[level];
  const today = new Date().toLocaleDateString("en-GB");

  document.getElementById('result-card').innerHTML = `
    <div class="report-card-inner">
      <h2 class="report-title">${t.title}</h2>
      <p class="report-meta"><strong>Company:</strong> ${company||"-"} 
         <span class="report-date"><strong>Date:</strong> ${today}</span></p>
      <div class="report-flex">
        <div class="gauge">${gaugeSVG(pct)}</div>
        <div class="score-block">
          <div class="score-value">${pct}%</div>
          <div class="score-label">Readiness</div>
        </div>
      </div>
      <div class="report-text">
        <p><strong>Status:</strong> ${t.status}</p>
        <p><strong>Recommendation:</strong> ${t.recommendation}</p>
        <p><strong>Outcome:</strong> ${t.outcome}</p>
      </div>
      <div class="report-cta">
        <a href="pricing.html" class="btn">See pricing</a>
        <a href="contact.html" class="btn btn-outline">Contact us</a>
      </div>
    </div>`;
  document.getElementById('result-wrap').style.display = 'block';

  // Animation på nålen
  const needle = document.querySelector('#needle');
  if (needle){
    needle.style.transform = "rotate(-90deg)";
    setTimeout(()=> needle.style.transform = `rotate(${ -90+(pct/100)*180 }deg)`, 50);
  }
}

// -------- Event handlers --------
document.getElementById('see-result').addEventListener('click',()=>{
  const lead={company:company.value.trim(), email:email.value.trim()};
  if(!lead.company||!lead.email){showError("Fill out company + email"); return;}
  const ans=collectAnswers(); 
  if(!ans){showError("Answer all 13 questions"); return;}
  const pct=computeScore(ans); 
  renderResult(pct, lead.company);
  document.getElementById('screening-form').submit();
});

document.getElementById('screening-form').addEventListener('reset',()=>{
  document.getElementById('result-wrap').style.display='none';
});

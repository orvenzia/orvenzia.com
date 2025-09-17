// === Orvenzia ESG Screening frontend logic ===

// Samme vægte som backend
const W = {
  q1:{yes:4,planned:0,no:0},   q2:{yes:4,planned:0,no:0},
  q3:{yes:7,planned:3.5,no:0}, q4:{yes:3,planned:1.5,no:0},
  q5:{yes:12,planned:0,no:0},  q6:{yes:8,planned:0,no:0},
  q7:{yes:2,planned:1,no:0},   q8:{yes:4,planned:0,no:0},
  q9:{yes:6,planned:3,no:0},   q10:{yes:10,planned:0,no:0},
  q11:{yes:12,planned:0,no:0}, q12:{yes:18,planned:9,no:0},
  q13:{yes:10,planned:0,no:0}
};

// Tekster for de 5 readiness-levels
const REPORT_TEXTS = {
  GREEN: {
    title: "🟢 Leading",
    status: "Fully aligned with buyer requirements; no immediate action required.",
    recommendation: "Consider Subscription (regulatory alerts + periodic check-ins).",
    outcome: "Maintain green status without extra workload."
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
  setTimeout(()=> b.style.display='none',7000);
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

function gaugeSVG(pct){
  const angle=-90+(pct/100)*180;
  return `<svg width="260" height="150" viewBox="0 0 360 200">
    <path d="M30,180 A150,150 0 0,1 330,180" stroke="#ddd" stroke-width="18" fill="none"/>
    <line x1="180" y1="180" x2="${180+140*Math.cos(angle*Math.PI/180)}" y2="${180+140*Math.sin(angle*Math.PI/180)}" stroke="#111" stroke-width="6" stroke-linecap="round"/>
    <circle cx="180" cy="180" r="9" fill="#111"/>
    <text x="35" y="185" font-size="12">0</text>
    <text x="325" y="185" font-size="12">100</text>
  </svg>`;
}

function renderResult(pct, company){
  const level = levelFromPct(pct);
  const t = REPORT_TEXTS[level];
  document.getElementById('result-card').innerHTML = `
    <div class="report-card-inner" style="font-family:Montserrat,Arial,sans-serif;padding:20px;border-radius:12px;border:1px solid #eee;box-shadow:0 2px 6px rgba(0,0,0,0.08)">
      <h2 style="margin:0 0 10px;font-size:20px">${t.title}</h2>
      <p style="margin:0 0 5px;color:#555"><strong>Company:</strong> ${company||"-"}</p>
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin:20px 0">
        <div class="gauge">${gaugeSVG(pct)}</div>
        <div style="text-align:center">
          <div style="font-size:2.2em;font-weight:700">${pct}%</div>
          <div style="font-size:1.1em;color:#444">Readiness</div>
        </div>
      </div>
      <div style="margin-top:15px">
        <p><strong>Status:</strong> ${t.status}</p>
        <p><strong>Recommendation:</strong> ${t.recommendation}</p>
        <p><strong>Outcome:</strong> ${t.outcome}</p>
      </div>
      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="pricing.html" class="btn">See pricing</a>
        <a href="contact.html" class="btn btn-outline">Contact us</a>
      </div>
    </div>`;
  document.getElementById('result-wrap').style.display = 'block';
}

// Event handlers
document.getElementById('see-result').addEventListener('click',()=>{
  const lead={company:company.value.trim(), email:email.value.trim()};
  if(!lead.company||!lead.email){showError("Fill out company + email"); return;}
  const ans=collectAnswers(); 
  if(!ans){showError("Answer all 13 questions"); return;}
  const pct=computeScore(ans); 
  renderResult(pct, lead.company);
  document.getElementById('screening-form').submit(); // send til backend (Apps Script)
});

document.getElementById('screening-form').addEventListener('reset',()=>{
  document.getElementById('result-wrap').style.display='none';
});

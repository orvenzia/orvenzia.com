// === Orvenzia ESG Screening — premium frontend ===

// 1) Scoring-vægte (matcher backend)
const W = {
  // Environmental (47)
  q1:  { yes: 8,  planned: 4, no: 0 }, 
  q2:  { yes: 10, planned: 5, no: 0 },
  q3:  { yes: 6,  planned: 3, no: 0 },
  q4:  { yes: 8,  planned: 4, no: 0 },
  q5:  { yes: 6,  planned: 3, no: 0 },
  q6:  { yes: 11, planned: 5, no: 0 },

  // Social (20)
  q7:  { yes: 8,  planned: 4, no: 0 },
  q8:  { yes: 5,  planned: 2, no: 0 },
  q9:  { yes: 6,  planned: 3, no: 0 },

  // Governance (33)
  q10: { yes: 10, planned: 5, no: 0 },
  q11: { yes: 8,  planned: 4, no: 0 },
  q12: { yes: 8,  planned: 4, no: 0 },
  q13: { yes: 7,  planned: 3, no: 0 }
};

// 2) Tekster (mini-rapport)
const REPORT_TEXTS = {
  GREEN: {
    title: "Leading",
    status: "Fully aligned with buyer requirements; no immediate action required.",
    recommendation: "Consider Subscription (regulatory alerts + periodic check-ins).",
    outcome: "Maintain leading status without extra workload."
  },
  LIGHT_GREEN: {
    title: "Strong",
    status: "Meets buyer expectations with minor improvements, typically found in audits.",
    recommendation: "Baseline Report (1–2 pages, €379; delivery <10 days) to document alignment and pinpoint fixes.",
    outcome: "Audit-ready proof; prevents slipping to “Not Buyer Ready”."
  },
  YELLOW: {
    title: "Not Buyer Ready",
    status: "Core elements exist, but missing policies/documentation create buyer risk.",
    recommendation: "Start with Baseline Report (€379; <10 days). Alternatively, Core Report (2–8 pages, €1,729; 30–60 days).",
    outcome: "Clear gap list → rapid path to buyer readiness."
  },
  ORANGE: {
    title: "At Risk",
    status: "Significant gaps, likely to affect tenders and buyer reviews.",
    recommendation: "Core Report (€1,729; 30–60 days) with prioritized gap analysis, templates, and roadmap.",
    outcome: "Fast risk reduction and restored buyer eligibility."
  },
  RED: {
    title: "Critical",
    status: "Current posture blocks buyer eligibility and escalates commercial risk.",
    recommendation: "Minimum: Core Report (€1,729; 30–60 days). Best: Enterprise Report (6–15 pages, €2,439–4,989; 60–120 days).",
    outcome: "Controlled turnaround to buyer-acceptable status quickly."
  }
};

// 3) Farver/præsentation per level
const LEVEL_META = {
  GREEN:       { chip: "🟢", color: "#2e7d32" },
  LIGHT_GREEN: { chip: "🟢", color: "#7cb342" },
  YELLOW:      { chip: "🟡", color: "#f9a825" },
  ORANGE:      { chip: "🟠", color: "#ef6c00" },
  RED:         { chip: "🔴", color: "#d32f2f" }
};

// ---------- Helpers ----------
function showError(msg){
  const b = document.getElementById('error-banner');
  b.textContent = msg || 'Unexpected error.';
  b.style.display = 'block';
  setTimeout(()=> b.style.display='none', 6000);
}

function collectAnswers(){
  const a = {};
  for (let i=1;i<=13;i++){
    const el = document.querySelector(`input[name="q${i}"]:checked`);
    if(!el) return null;
    a["q"+i] = el.value.toLowerCase();
  }
  return a;
}

function computeScore(ans){
  let sum=0, max=0;
  Object.keys(W).forEach(k=>{
    const w=W[k];
    max += Math.max(w.yes||0,w.planned||0,w.no||0);
    sum += (w[ans[k]]||0);
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

// ---------- Gauge utils ----------
const DEG = Math.PI/180;
function arcPath(cx,cy,r,startDeg,endDeg){
  const x1 = cx + r * Math.cos(startDeg*DEG);
  const y1 = cy + r * Math.sin(startDeg*DEG);
  const x2 = cx + r * Math.cos(endDeg*DEG);
  const y2 = cy + r * Math.sin(endDeg*DEG);
  const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

// ---------- Gauge (5 zoner + animation) ----------
function gaugeSVG(){
  const cx=180, cy=180, r=150, w=26;
  const seg = 36; // 180° / 5
  const start = -90;

  const parts = [
    { from: start + 0*seg, to: start + 1*seg, stroke: "url(#gRed)"   },
    { from: start + 1*seg, to: start + 2*seg, stroke: "url(#gOrange)"},
    { from: start + 2*seg, to: start + 3*seg, stroke: "url(#gYellow)"},
    { from: start + 3*seg, to: start + 4*seg, stroke: "url(#gLGreen)"},
    { from: start + 4*seg, to: start + 5*seg, stroke: "url(#gGreen)" }
  ];

  const DEG = Math.PI/180;
  const arcPath = (cx,cy,r,a1,a2)=>{
    const x1 = cx + r*Math.cos(a1*DEG), y1 = cy + r*Math.sin(a1*DEG);
    const x2 = cx + r*Math.cos(a2*DEG), y2 = cy + r*Math.sin(a2*DEG);
    const largeArc = (a2-a1)>180 ? 1 : 0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };

  return `
  <svg width="360" height="210" viewBox="0 0 360 210" class="gauge-svg" aria-hidden="true">
    <defs>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
      <linearGradient id="gRed"    x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#b71c1c"/><stop offset="100%" stop-color="#f44336"/></linearGradient>
      <linearGradient id="gOrange" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#e65100"/><stop offset="100%" stop-color="#ff9800"/></linearGradient>
      <linearGradient id="gYellow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fbc02d"/><stop offset="100%" stop-color="#fff59d"/></linearGradient>
      <linearGradient id="gLGreen" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#66bb6a"/><stop offset="100%" stop-color="#a5d6a7"/></linearGradient>
      <linearGradient id="gGreen"  x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#2e7d32"/><stop offset="100%" stop-color="#66bb6a"/></linearGradient>
      <linearGradient id="bgGrad"  x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffffcc"/><stop offset="100%" stop-color="#ffffffee"/></linearGradient>
    </defs>

    <!-- ALT roteres 90° mod venstre her -->
    <g transform="rotate(-90 180 180)">
      <!-- glasagtig baggrund -->
      <path d="${arcPath(cx,cy,r,-90,90)}" stroke="url(#bgGrad)" stroke-width="${w}" fill="none" filter="url(#softShadow)" opacity="0.85"/>

      <!-- farvezoner -->
      ${parts.map(p=>`<path d="${arcPath(cx,cy,r,p.from,p.to)}" stroke="${p.stroke}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`).join('')}

      <!-- ticks -->
      ${[0,25,50,75,100].map(pct=>{
        const ang=-90+pct*1.8, x1=cx+(r-8)*Math.cos(ang*DEG), y1=cy+(r-8)*Math.sin(ang*DEG),
              x2=cx+(r-18)*Math.cos(ang*DEG), y2=cy+(r-18)*Math.sin(ang*DEG);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#bbb" stroke-width="2"/>`;
      }).join('')}

      <!-- nålen (drejes via CSS/JS) -->
      <g id="needle" class="gauge-needle">
        <polygon points="${cx-12},${cy-6} ${cx+r-24},${cy} ${cx-12},${cy+6}" />
        <circle cx="${cx}" cy="${cy}" r="9" class="gauge-center"/>
      </g>
    </g>

    <!-- End-labels (bliver IKKE roteret) -->
    <text x="38"  y="202" font-size="12" fill="#666">0</text>
    <text x="306" y="202" font-size="12" fill="#666">100</text>
  </svg>`;
}


// Animate procenttal (0 → pct)
function animatePercent(el, end, ms){
  const start = 0, t0 = performance.now(), dur = ms||900;
  function tick(ts){
    const p = Math.min((ts - t0)/dur, 1);
    el.textContent = Math.round(start + (end-start)*p) + "%";
    if (p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------- Render resultat ----------
function renderResult(pct, company){
  const level = levelFromPct(pct);
  const meta = LEVEL_META[level];
  const t = REPORT_TEXTS[level];
  const today = new Date().toLocaleDateString("en-GB");

  // Indsæt kortet
  const card = `
    <div class="report-card-inner" style="--level-color:${meta.color}">
      <div class="report-head">
        <div class="level-chip">
          <span class="dot" aria-hidden="true"></span>
          <strong>${t.title}</strong>
        </div>
        <div class="report-date"><strong>Date:</strong> ${today}</div>
      </div>

      <p class="report-meta"><strong>Company:</strong> ${company || "-"}</p>

      <div class="report-flex">
        <div class="gauge">${gaugeSVG()}</div>
        <div class="score-block">
          <div id="scoreVal" class="score-value">${pct}%</div>
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
    </div>
  `;
  const wrap = document.getElementById('result-card');
  wrap.innerHTML = card;
  document.getElementById('result-wrap').style.display = 'block';

  // 1) Farv tal + animation
  const scoreEl = document.getElementById('scoreVal');
  scoreEl.style.color = meta.color;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    animatePercent(scoreEl, pct, 900);
  } else {
    scoreEl.textContent = pct + "%";
  }

  // 2) Drej nålen smooth til pct
  const needle = document.getElementById('needle');
  const target = -90 + pct*1.8; // 0–100 → -90..+90
  if (needle){
    // Startposition (hold hvis første rendering)
    needle.style.transform = `rotate(-90deg)`;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      // kick animation i næste frame
      requestAnimationFrame(()=> { needle.style.transform = `rotate(${target}deg)`;});
    } else {
      needle.style.transform = `rotate(${target}deg)`;
    }
  }
}

// ---------- Event handlers ----------
document.getElementById('see-result').addEventListener('click', ()=>{
  const lead = { company: company.value.trim(), email: email.value.trim() };
  if(!lead.company || !lead.email){ showError("Fill out company + email"); return; }

  const ans = collectAnswers();
  if(!ans){ showError("Answer all 13 questions"); return; }

  const pct = computeScore(ans);
  renderResult(pct, lead.company);

  // Send til Apps Script uden at reloade (form/iframe)
  document.getElementById('screening-form').submit();
});

document.getElementById('screening-form').addEventListener('reset', ()=>{
  document.getElementById('result-wrap').style.display='none';
});

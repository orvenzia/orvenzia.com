/**
 * Orvenzia ESG Screening — resilient mailer v2
 * - Robust parsing, logging, and guaranteed owner notifications on errors.
 * - Accepts form POST (x-www-form-urlencoded) and JSON (application/json or text/plain).
 * - Sends premium mini-report to customer + owner. Owner gets answers appendix.
 */

const OWNER_EMAIL = "support@orvenzia.com";  // <- ret hvis nødvendigt
const APP_VERSION = "v2.1";

// ---------- Healthcheck ----------
function doGet(e) {
  console.log("doGet", { version: APP_VERSION, query: e && e.parameter });
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, version: APP_VERSION, now: new Date() })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Entry ----------
function doPost(e) {
  const startedAt = new Date();
  try {
    if (!e) return json_({ ok:false, error:"No event" }, 400);

    const result = safeHandlePost_(e);
    console.log("doPost complete", { ...result.meta, ms: (new Date()-startedAt) });
    return json_({ ok:true, scorePct: result.calc.pct, level: result.level }, 200);

  } catch (err) {
    const msg = String(err && err.stack || err);
    console.error("doPost fatal", msg);
    // Send fejl-notifikation til owner (uden at blokere svaret)
    tryNotifyOwner_("Screening ERROR (fatal)", `
      <p><strong>Fatal error in doPost</strong></p>
      <pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml_(msg)}</pre>
    `);
    return json_({ ok:false, error: msg }, 500);
  }
}

// ---------- Core handler ----------
function safeHandlePost_(e) {
  const ct = (e.postData && e.postData.type || "").toLowerCase();
  console.log("Incoming content-type:", ct);

  // Parse input
  let lead = {}, answers = {};
  try {
    if (ct.includes("application/json") || ct.includes("text/plain")) {
      const raw = (e.postData && e.postData.contents) || "";
      console.log("Raw length:", raw.length);
      const data = raw ? JSON.parse(raw) : {};
      lead    = normalizeLead_(data.lead || {});
      answers = normalizeAnswers_(data.answers || {});
    } else {
      const p = e.parameter || {};
      console.log("Form params keys:", Object.keys(p));
      lead = normalizeLead_({ company: p.company || "", email: p.email || "" });
      const a = {};
      for (let i=1;i<=13;i++) a["q"+i] = (p["q"+i] || "").toLowerCase();
      answers = normalizeAnswers_(a);
    }
  } catch (parseErr) {
    const emsg = "Parse error: " + String(parseErr && parseErr.stack || parseErr);
    console.error(emsg);
    tryNotifyOwner_("Screening ERROR (parse)", `
      <p><strong>Failed to parse request</strong></p>
      <p>Content-Type: ${escapeHtml_(ct)}</p>
      <pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml_(emsg)}</pre>
    `);
    throw parseErr;
  }

  // Compute score and copy
  const calc  = computeScore_(answers);
  const level = levelFromPct_(calc.pct);
  const meta  = LEVEL_META[level];
  const copy  = REPORT_TEXTS[level];

  // Build email HTML (inline)
  const htmlReport = buildEmailHtml_({
    company: lead.company || "",
    pct: calc.pct,
    level,
    levelTitle: copy.title,
    color: meta.color,
    status: copy.status,
    recommendation: copy.recommendation,
    outcome: copy.outcome
  });

  const subjCustomer = `ESG Readiness Screening – ${calc.pct}% (${copy.title.replace(/^[^\s]+\s*/, '').trim()})${lead.company ? " – " + lead.company : ""}`;
  const subjOwner    = `New Screening: ${lead.company || "Unknown"} – ${calc.pct}% (${level})`;

  // Send emails (robust + logged)
  const sendLog = [];

  if (lead.email) {
    const ok = trySendEmail_({
      to: lead.email,
      subject: subjCustomer,
      htmlBody: htmlReport,
      name: "Orvenzia"
    });
    sendLog.push({ to: lead.email, ok });
    if (!ok) {
      // fallback info til owner
      tryNotifyOwner_("Screening ERROR (customer send fail)", `
        <p>Could not send customer email.</p>
        <p><strong>Recipient:</strong> ${escapeHtml_(lead.email)}</p>
      `);
    }
  } else {
    sendLog.push({ to: "(no-customer-email)", ok: false });
  }

  const answersList = buildAnswersListHtml_(answers);
  const ownerOk = trySendEmail_({
    to: OWNER_EMAIL,
    subject: subjOwner,
    htmlBody: htmlReport + answersList,
    name: "Orvenzia"
  });
  sendLog.push({ to: OWNER_EMAIL, ok: ownerOk });

  console.log("sendLog", sendLog);

  return { calc, level, meta, copy, lead, answers, metaSend: sendLog, meta: { company: lead.company, email: lead.email, pct: calc.pct, level } };
}

// ---------- Email builders ----------
function buildEmailHtml_(o){
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
  const gauge = gaugeSvgEmail_(o.pct); // inline SVG (venstredrejet)
  const esc = escapeHtml_;

  return `
  <div style="background:#f5f7f9;padding:20px 12px;font-family:Montserrat,Segoe UI,Arial,sans-serif;color:#222;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e9ecf0;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
      <div style="padding:22px 24px 10px;border-bottom:1px solid #f0f2f4;display:flex;align-items:center;justify-content:space-between;">
        <div style="font-weight:800;font-size:20px;display:flex;align-items:center;gap:10px;color:#1b1b1b">
          <span style="display:inline-block;width:12px;height:12px;border-radius:99px;background:${o.color};"></span>
          ${esc(o.levelTitle)}
        </div>
        <div style="font-size:13px;color:#444;"><strong>Date:</strong> ${today}</div>
      </div>

      <div style="padding:22px 24px;">
        <p style="margin:0 0 10px;font-size:14px;color:#444;"><strong>Company:</strong> ${esc(o.company) || "-"}</p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 8px;">
          <tr>
            <td style="width:340px;vertical-align:top;padding:0 16px 0 0;">${gauge}</td>
            <td style="vertical-align:middle;">
              <div style="font-weight:800;font-size:48px;line-height:1;color:${o.color}">${o.pct}%</div>
              <div style="font-size:16px;color:#555;margin-top:6px">Readiness</div>
            </td>
          </tr>
        </table>

        <div style="font-size:15px;line-height:1.6;color:#222;">
          <p style="margin:10px 0;"><strong>Status:</strong> ${esc(o.status)}</p>
          <p style="margin:10px 0;"><strong>Recommendation:</strong> ${esc(o.recommendation)}</p>
          <p style="margin:10px 0;"><strong>Outcome:</strong> ${esc(o.outcome)}</p>
        </div>

        <div style="margin-top:18px;">
          <a href="https://www.orvenzia.com/pricing.html" style="display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;margin-right:10px;">See pricing</a>
          <a href="https://www.orvenzia.com/contact.html" style="display:inline-block;background:#f5f7f9;color:#1b1b1b;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;border:1px solid #e0e5ea;">Contact us</a>
        </div>
      </div>
    </div>
  </div>`;
}

// Email-safe inline gauge — VENSTREDREJET (-180..0) for match med webgauge
function gaugeSvgEmail_(pct){
  const cx=180, cy=180, r=150, w=22;
  const seg = 36, start = -90;
  const parts = [
    { from: start+0*seg, to: start+1*seg, color:"#d32f2f" }, // red
    { from: start+1*seg, to: start+2*seg, color:"#ef6c00" }, // orange
    { from: start+2*seg, to: start+3*seg, color:"#fbc02d" }, // yellow
    { from: start+3*seg, to: start+4*seg, color:"#8bc34a" }, // light green
    { from: start+4*seg, to: start+5*seg, color:"#2e7d32" }  // green
  ];

  // venstredrejet orientering: 0% = -180°, 100% = 0°
  const angle = -180 + (pct/100)*180;
  const DEG = Math.PI/180;

  function arcPath(a1,a2){
    const x1 = cx + r*Math.cos(a1*DEG), y1 = cy + r*Math.sin(a1*DEG);
    const x2 = cx + r*Math.cos(a2*DEG), y2 = cy + r*Math.sin(a2*DEG);
    const largeArc = (a2-a1) > 180 ? 1 : 0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  }

  // nål uden CSS transforms (bedre email-kompatibilitet)
  const baseL = rotatePoint_(cx-10, cy-5, cx, cy, angle);
  const tip   = rotatePoint_(cx+r-28, cy,   cx, cy, angle);
  const baseR = rotatePoint_(cx-10, cy+5, cx, cy, angle);

  return `
  <svg width="340" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="${arcPath(-90,90)}" stroke="#efefef" stroke-width="${w}" fill="none"/>
    ${parts.map(p=>`<path d="${arcPath(p.from,p.to)}" stroke="${p.color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`).join("")}
    <polygon points="${baseL.x.toFixed(1)},${baseL.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${baseR.x.toFixed(1)},${baseR.y.toFixed(1)}" fill="#111"/>
    <circle cx="${cx}" cy="${cy}" r="8" fill="#111"/>
    <text x="40" y="195" font-size="12" fill="#666">0</text>
    <text x="310" y="195" font-size="12" fill="#666">100</text>
  </svg>`;
}

function rotatePoint_(x,y,cx,cy,deg){
  const r = Math.PI/180*deg;
  const cos = Math.cos(r), sin = Math.sin(r);
  return { x: cx + (x-cx)*cos - (y-cy)*sin, y: cy + (x-cx)*sin + (y-cy)*cos };
}

// ---------- Texts / scoring ----------
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

const LEVEL_META = {
  GREEN:       { color:"#2e7d32" },
  LIGHT_GREEN: { color:"#7cb342" },
  YELLOW:      { color:"#f9a825" },
  ORANGE:      { color:"#ef6c00" },
  RED:         { color:"#d32f2f" }
};

function normalizeLead_(lead){
  return {
    company: (lead.company || "").trim(),
    email:   (lead.email   || "").trim().toLowerCase()
  };
}
function normalizeAnswers_(a){
  const out = {};
  for (let i=1;i<=13;i++){
    let k="q"+i, v=(a[k]||"").toLowerCase();
    if (!["yes","planned","no"].includes(v)) v="no";
    out[k]=v;
  }
  return out;
}
function computeScore_(ans){
  const W = {
    q1:{yes:4,planned:0,no:0},   q2:{yes:4,planned:0,no:0},
    q3:{yes:7,planned:3.5,no:0}, q4:{yes:3,planned:1.5,no:0},
    q5:{yes:12,planned:0,no:0},  q6:{yes:8,planned:0,no:0},
    q7:{yes:2,planned:1,no:0},   q8:{yes:4,planned:0,no:0},
    q9:{yes:6,planned:3,no:0},   q10:{yes:10,planned:0,no:0},
    q11:{yes:12,planned:0,no:0}, q12:{yes:18,planned:9,no:0},
    q13:{yes:10,planned:0,no:0}
  };
  let sum=0, max=0;
  Object.keys(W).forEach(k=>{
    const w=W[k];
    max += Math.max(w.yes||0,w.planned||0,w.no||0);
    sum += (w[ans[k]]||0);
  });
  const pct = Math.round((sum/(max||1))*100);
  return {sum, max, pct};
}
function levelFromPct_(pct){
  if (pct>=99) return "GREEN";
  if (pct>=80) return "LIGHT_GREEN";
  if (pct>=60) return "YELLOW";
  if (pct>=40) return "ORANGE";
  return "RED";
}

// Owner appendix: svarliste
function buildAnswersListHtml_(answers){
  const rows = Object.entries(answers)
    .map(([k,v])=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${k.toUpperCase()}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${escapeHtml_(v)}</td></tr>`)
    .join("");
  return `
  <div style="max-width:760px;margin:18px auto 0;background:#fff;border:1px solid #e9ecf0;border-radius:12px">
    <div style="padding:12px 16px;border-bottom:1px solid #eef2f5;font-weight:700">Submitted answers (internal)</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;font-family:Montserrat,Arial,sans-serif;color:#222;font-size:14px">${rows}</table>
  </div>`;
}

// ---------- Send helpers ----------
function trySendEmail_(opts){
  try {
    MailApp.sendEmail({ to: opts.to, subject: opts.subject, htmlBody: opts.htmlBody, name: opts.name || "Orvenzia" });
    return true;
  } catch (err1) {
    console.error("MailApp failed", String(err1));
    try {
      GmailApp.sendEmail(opts.to, opts.subject, "", { htmlBody: opts.htmlBody, name: opts.name || "Orvenzia" });
      return true;
    } catch (err2) {
      console.error("GmailApp failed", String(err2));
      return false;
    }
  }
}

function tryNotifyOwner_(subject, html){
  trySendEmail_({ to: OWNER_EMAIL, subject, htmlBody: html, name: "Orvenzia" });
}

// ---------- Utils ----------
function json_(obj, _code){
  // Apps Script Web App ignores explicit status; respond with JSON.
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function escapeHtml_(s){
  return String(s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/**
 * Orvenzia ESG Screening Backend – Stable
 * Sender rapport til kunde og kopi til ejer (inkl. svar).
 */

const OWNER_EMAIL = "support@orvenzia.com"; // <- din email

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: "No data" }, 400);
    }
    const data = JSON.parse(e.postData.contents);
    const lead = normalizeLead_(data.lead || {});
    const answers = normalizeAnswers_(data.answers || {});

    // Scoreberegning
    const calc = computeScore_(answers);
    const level = levelFromPct_(calc.pct);

    // Mail til kunden
    if (lead.email) {
      MailApp.sendEmail({
        to: lead.email,
        subject: `Your ESG Screening Score – ${calc.pct}% (${level})`,
        htmlBody: `<p>Hej ${lead.company},</p>
                   <p>Your ESG screening score is <strong>${calc.pct}% (${level})</strong>.</p>
                   <p>We’ll contact you with recommended next steps.</p>`
      });
    }

    // Mail til dig (med kundens svar)
    let answersHtml = Object.entries(answers)
      .map(([k, v]) => `<li>${k.toUpperCase()}: ${v}</li>`).join("");
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: `New Screening: ${lead.company} – ${calc.pct}% (${level})`,
      htmlBody: `<p><strong>Company:</strong> ${lead.company}<br/>
                 <strong>Email:</strong> ${lead.email}<br/>
                 <strong>Score:</strong> ${calc.pct}% (${level})</p>
                 <ul>${answersHtml}</ul>`
    });

    return json_({ ok: true, scorePct: calc.pct, level }, 200);

  } catch (err) {
    return json_({ ok: false, error: String(err) }, 500);
  }
}

function doOptions() {
  return json_({ ok: true }, 200);
}

// ---------- Hjælpere ----------
function json_(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeLead_(lead) {
  return {
    company: (lead.company || "").trim(),
    email: (lead.email || "").trim().toLowerCase()
  };
}

function normalizeAnswers_(a) {
  const out = {};
  for (let i = 1; i <= 13; i++) {
    let k = "q" + i;
    let v = (a[k] || "").toLowerCase();
    if (!["yes", "planned", "no"].includes(v)) v = "no";
    out[k] = v;
  }
  return out;
}

function computeScore_(ans) {
  const W = {
    q1:{yes:4,planned:0,no:0}, q2:{yes:4,planned:0,no:0},
    q3:{yes:7,planned:3.5,no:0}, q4:{yes:3,planned:1.5,no:0},
    q5:{yes:12,planned:0,no:0}, q6:{yes:8,planned:0,no:0},
    q7:{yes:2,planned:1,no:0}, q8:{yes:4,planned:0,no:0},
    q9:{yes:6,planned:3,no:0}, q10:{yes:10,planned:0,no:0},
    q11:{yes:12,planned:0,no:0}, q12:{yes:18,planned:9,no:0},
    q13:{yes:10,planned:0,no:0}
  };
  let max = 0, sum = 0;
  for (const k in W) {
    max += Math.max(W[k].yes, W[k].planned, W[k].no);
    sum += W[k][ans[k]] || 0;
  }
  const pct = Math.round((sum / (max || 1)) * 100);
  return { sum, max, pct };
}

function levelFromPct_(pct) {
  if (pct >= 99) return "LEADING";
  if (pct >= 80) return "STRONG";
  if (pct >= 60) return "YELLOW";
  if (pct >= 40) return "ORANGE";
  return "RED";
}

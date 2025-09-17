/** === CONFIG === */
const OWNER_EMAIL = "support@orvenzia.com";   // <- DIN mail
const BRAND_NAME = "Orvenzia ESG";

const WEIGHT_YES = 1.0;
const WEIGHT_PLANNED = 0.5;
const WEIGHT_NO = 0.0;

const EXPECTED_QUESTION_KEYS = [
  "q1","q2","q3","q4","q5","q6",
  "q7","q8","q9","q10","q11","q12","q13"
];

const LEVELS = [
  { min: 99, max: 100, key: "green",       headline: "Leading (99–100)" },
  { min: 80, max: 98,  key: "light_green", headline: "Strong (80–98)" },
  { min: 60, max: 79,  key: "yellow",      headline: "Lagging / Not Ready (60–79)" },
  { min: 40, max: 59,  key: "orange",      headline: "At Risk (40–59)" },
  { min: 0,  max: 39,  key: "red",         headline: "Critical (0–39)" },
];

const RECOMMENDATIONS = {
  green: `
<b>Status:</b> Fully aligned with buyer requirements.<br>
<b>Recommendation:</b> Light Update Subscription (alerts + check-ins).<br>
<b>Outcome:</b> Maintain green status without extra workload.
  `,
  light_green: `
<b>Status:</b> Meets buyer expectations with minor improvements.<br>
<b>Recommendation:</b> Baseline Report (1–2 pages, €379; &lt;10 days).<br>
<b>Outcome:</b> Audit-ready proof; prevents slipping.
  `,
  yellow: `
<b>Status:</b> Core elements exist, but gaps create buyer risk.<br>
<b>Recommendation:</b> Baseline Report (€379) or Core Report (€1,329).<br>
<b>Outcome:</b> Clear roadmap to readiness.
  `,
  orange: `
<b>Status:</b> Significant gaps likely to affect tenders.<br>
<b>Recommendation:</b> Core Report (€1,329; 30–60 days).<br>
<b>Outcome:</b> Full action plan needed.
  `,
  red: `
<b>Status:</b> Critical gaps.<br>
<b>Recommendation:</b> Enterprise Report (full plan + training).<br>
<b>Outcome:</b> Urgent intervention required.
  `
};

/** === MAIN ENTRY === */
function doPost(e) {
  try {
    const raw = e.postData.contents;
    const data = JSON.parse(raw);

    const lead = data.lead || {};
    const answers = data.answers || {};

    const result = calculateScore(answers);

    // Send til kunden (kun score + anbefaling)
    sendCustomerMail(lead, result);

    // Send til dig (fulde svar + score)
    sendOwnerMail(lead, answers, result);

    return ContentService
      .createTextOutput(JSON.stringify({status:"ok", score: result}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Fejl i doPost: " + err);
    return ContentService
      .createTextOutput(JSON.stringify({status:"error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** === SCORING === */
function calculateScore(answers) {
  let total = 0;
  let max = EXPECTED_QUESTION_KEYS.length;

  EXPECTED_QUESTION_KEYS.forEach(q => {
    const val = (answers[q] || "").toLowerCase();
    if (val === "yes") total += WEIGHT_YES;
    else if (val === "planned") total += WEIGHT_PLANNED;
    else total += WEIGHT_NO;
  });

  const pct = Math.round((total / max) * 100);

  let level = LEVELS.find(l => pct >= l.min && pct <= l.max);
  if (!level) level = LEVELS[LEVELS.length-1];

  return {
    percent: pct,
    key: level.key,
    headline: level.headline,
    recommendation: RECOMMENDATIONS[level.key]
  };
}

/** === MAILS === */
function sendCustomerMail(lead, result) {
  const email = lead.email;
  if (!email) return;

  const subject = `${BRAND_NAME} – Screening Result (${result.headline})`;
  const body = `
  <p>Dear ${lead.company || "participant"},</p>
  <p>Thank you for completing the ${BRAND_NAME} screening.</p>
  <p><b>Your ESG Readiness Score:</b> ${result.percent}%</p>
  <p><b>Level:</b> ${result.headline}</p>
  <p>${result.recommendation}</p>
  <p>Best regards,<br>${BRAND_NAME} Team</p>
  `;

  GmailApp.sendEmail(email, subject, "", {
    htmlBody: body,
    replyTo: OWNER_EMAIL
  });
}

function sendOwnerMail(lead, answers, result) {
  const subject = `SCREENING LOG – ${lead.company || "Unknown"} (${result.headline})`;

  let answerList = "";
  EXPECTED_QUESTION_KEYS.forEach(q => {
    answerList += `<li>${q}: ${answers[q] || "-"}</li>`;
  });

  const body = `
  <p><b>Company:</b> ${lead.company || "-"}<br>
  <b>Email:</b> ${lead.email || "-"}</p>
  <p><b>Score:</b> ${result.percent}% (${result.headline})</p>
  <p><b>Answers:</b></p>
  <ul>${answerList}</ul>
  `;

  GmailApp.sendEmail(OWNER_EMAIL, subject, "", {
    htmlBody: body,
    replyTo: lead.email || OWNER_EMAIL
  });
}

/**
 * Orvenzia ESG Screening Backend – Benchmark Style
 * - doPost: Modtager data fra screening.js og sender Word-rapport
 * - doGet: Simpel debug-besked hvis du åbner URL i browser
 */

const OWNER_EMAIL = "support@orvenzia.com";

// === GET til browser-test ===
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "Backend is running. Use POST to submit data." })
  ).setMimeType(ContentService.MimeType.JSON);
}

// === POST fra frontend ===
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const lead = data.lead || {};
    const answers = data.answers || {};

    // 1. Beregn score
    const { scorePercent, status, color, answerTable } = calculateScore(answers);

    // 2. Opret Word-rapport i benchmark-stil
    const wordFile = createBenchmarkReport(lead, answers, scorePercent, status, color, answerTable);

    // 3. Send rapport til dig
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: `New ESG Baseline Report – ${lead.company || "Client"} (${status})`,
      body: "Attached is the automatically generated Baseline ESG Readiness Analysis (Word).",
      attachments: [wordFile.getAs(MimeType.MICROSOFT_WORD)]
    });

    // 4. Svar til frontend
    return ContentService.createTextOutput(
      JSON.stringify({ score: scorePercent, status: status })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// === Beregning ===
function calculateScore(answers) {
  let totalScore = 0, maxScore = 0;
  const weights = {
    q1: 4, q2: 4, q3: 3.5, q4: 1.5, q5: 4,
    q6: 4, q7: 4, q8: 4, q9: 4, q10: 4,
    q11: 4, q12: 4, q13: 4
  };

  const tableData = [];

  Object.keys(weights).forEach(q => {
    maxScore += weights[q];
    const ans = (answers[q] || "").toLowerCase();
    let points = 0;
    if (ans === "yes") points = weights[q];
    if (ans === "planned") points = weights[q] * 0.5;
    totalScore += points;

    tableData.push([q, ans || "n/a", points.toFixed(1) + " / " + weights[q]]);
  });

  const scorePercent = Math.round((totalScore / maxScore) * 100);
  let status = "", color = "#FF0000";
  if (scorePercent >= 99) { status = "GREEN (Leading)"; color = "#008000"; }
  else if (scorePercent >= 80) { status = "LIGHT GREEN (Strong)"; color = "#00B050"; }
  else if (scorePercent >= 60) { status = "YELLOW (Lagging)"; color = "#FFD966"; }
  else if (scorePercent >= 40) { status = "ORANGE (At Risk)"; color = "#ED7D31"; }
  else { status = "RED (Critical)"; color = "#FF0000"; }

  return { scorePercent, status, color, answerTable: tableData };
}

// === Rapport med Benchmark layout ===
function createBenchmarkReport(lead, answers, score, status, color, tableData) {
  const doc = DocumentApp.create(`Baseline_Report_${lead.company || "Client"}`);
  const body = doc.getBody();

  // Titel
  body.appendParagraph("Baseline ESG Readiness Analysis")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);

  // Kundeinfo
  body.appendParagraph(`Company: ${lead.company || "Unknown"}`);
  body.appendParagraph(`Contact: ${lead.name || ""} – ${lead.email || ""}`);

  // Statusboks
  const statusBox = body.appendParagraph(`Readiness Score: ${score}/100 → ${status}`);
  statusBox.setBackgroundColor(color).setBold(true).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // Barometer
  const gaugeImg = generateGauge(score);
  body.appendImage(gaugeImg).setWidth(400).setHeight(200);

  // Benchmark
  body.appendParagraph("Benchmark").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(
    "Peers in your industry typically score 70–75 at baseline. " +
    `Your score of ${score} is ${score < 70 ? "below" : "above"} average.`
  );

  // Tabel med svar
  body.appendParagraph("Screening Answers").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  const table = body.appendTable([["Question", "Answer", "Points"]]);
  table.setBorderWidth(1);
  tableData.forEach(row => { table.appendTableRow(row); });

  // Strengths / Weaknesses / Planned
  body.appendParagraph("Readiness Overview").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  addSection(body, "Strengths", answers, "yes", "✔️ Implemented");
  addSection(body, "Weaknesses", answers, "no", "❌ Missing");
  addSection(body, "In Progress", answers, "planned", "⚠️ Planned");

  // Buyer Lens
  body.appendParagraph("Buyer Lens & Risk Assessment").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (score >= 80) {
    body.appendParagraph("Low buyer risk. Likely to pass ESG audits with only minor improvements needed.");
  } else if (score >= 60) {
    body.appendParagraph("Moderate buyer risk. Buyer may request documented improvements before approval.");
  } else {
    body.appendParagraph("High buyer risk. ESG weaknesses could block tenders or partnerships.");
  }

  // Quick Wins
  body.appendParagraph("Quick Wins & Next Steps").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendListItem("Draft Waste Management Policy");
  body.appendListItem("Define CO₂ reduction targets");
  body.appendListItem("Introduce Diversity & Equality guidelines");
  body.appendListItem("Request a Baseline Report (€379) for documentation");
  body.appendListItem("Move towards Core Report (€1,329) for action planning");

  doc.saveAndClose();
  return DriveApp.getFileById(doc.getId());
}

// === Hjælpefunktioner ===
function addSection(body, title, answers, match, label) {
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING3);
  Object.entries(answers).forEach(([q, ans]) => {
    if (ans.toLowerCase() === match) {
      body.appendListItem(`${q}: ${label}`);
    }
  });
}

function generateGauge(score) {
  const angle = -90 + (score / 100) * 180;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
    <path d="M20 180 A160 160 0 0 1 380 180" fill="none" stroke="#FF0000" stroke-width="30"/>
    <path d="M20 180 A160 160 0 0 1 140 20" fill="none" stroke="#ED7D31" stroke-width="30"/>
    <path d="M140 20 A160 160 0 0 1 260 20" fill="none" stroke="#FFD966" stroke-width="30"/>
    <path d="M260 20 A160 160 0 0 1 380 180" fill="none" stroke="#00B050" stroke-width="30"/>
    <line x1="200" y1="180" x2="${200 + 120 * Math.cos(angle * Math.PI/180)}" y2="${180 + -120 * Math.sin(angle * Math.PI/180)}"
          stroke="#000000" stroke-width="5"/>
    <circle cx="200" cy="180" r="8" fill="#000000"/>
  </svg>`;
  return Utilities.newBlob(svg, "image/svg+xml", "gauge.svg").getAs("image/png");
}

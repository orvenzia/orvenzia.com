/** Orvenzia Screening Backend – Full Auto Report with 5 Barometers
 * Deploy as Web App: Execute as Me; Who has access: Anyone
 */

// ========== KONFIGURATION ==========
const OWNER_EMAIL = "support@orvenzia.com"; 
const TEMPLATE_ID = "DIN_SKABELON_FILE_ID"; // <-- INDSÆT Google Docs skabelon-ID

// Barometer-billeder (INDSÆT dine 5 Drive file IDs)
const BAROMETER = {
  GREEN:      "FILE_ID_GREEN",       // 99–100
  LIGHTGREEN: "FILE_ID_LIGHTGREEN",  // 80–98
  YELLOW:     "FILE_ID_YELLOW",      // 60–79
  ORANGE:     "FILE_ID_ORANGE",      // 40–59
  RED:        "FILE_ID_RED"          // 0–39
};

// ========== HOVEDFUNKTION ==========
function doPost(e) {
  try {
    if (!e || !e.postData) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "No data" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var lead = data.lead || {};
    var answers = data.answers || {};
    var meta = data.meta || {};

    // 1) Score & level
    var score = computeScore(answers);
    var level = getLevel(score);
    var benchmark = getBenchmarkText(score);

    // (valgfrit) log til Sheet
    logToSheet(lead, score, level, answers, meta);

    // 2) Generér rapport (Word)
    var wordFile = generateReport(lead, score, level, benchmark, answers);

    // 3) Mail til ejer (med rapport)
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: "New ESG Screening: " + (lead.company || "Unknown"),
      htmlBody: "<p>Ny screening er gennemført.</p>"
              + "<p><b>Company:</b> " + (lead.company || "(n/a)") + "<br>"
              + "<b>Email:</b> " + (lead.email || "(n/a)") + "<br>"
              + "<b>Score:</b> " + score + " (" + level + ")</p>"
              + "<p>Se vedhæftet rapport.</p>",
      attachments: [wordFile]
    });

    // 4) Mail til kunden (kort kvittering)
    if (lead.email) {
      MailApp.sendEmail({
        to: lead.email,
        subject: "Your ESG Screening Result",
        htmlBody: "<p>Tak for at gennemføre ESG-screeningen.</p>"
                + "<p>Din score: <b>" + score + "/100</b> – " + level + ".</p>"
                + "<p>Vi kontakter dig med næste skridt.</p>"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true, score: score, level: level }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== HJÆLPEFUNKTIONER ==========

// (valgfrit) Log til Google Sheet
function logToSheet(lead, score, level, answers, meta){
  try{
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName('Screening') || ss.insertSheet('Screening');
    if (sh.getLastRow() === 0){
      sh.appendRow(['Timestamp','Company','Email','Score','Level','Answers(JSON)','UserAgent']);
    }
    sh.appendRow([new Date(), lead.company||'', lead.email||'', score, level, JSON.stringify(answers), (meta.ua||'')]);
  } catch(e) {
    // fail silently
  }
}

// Scoring (YES=2, PLANNED=1, NO=0 → normaliseret 0..100)
function computeScore(a) {
  var WEIGHTS = { q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2, q7: 2, q8: 2, q9: 2, q10: 2, q11: 2, q12: 2, q13: 2 };
  var sum = 0, max = 0;
  for (var k in WEIGHTS) {
    var v = (a[k] || "").toLowerCase();
    var w = WEIGHTS[k];
    max += w * 2;
    if (v === "yes") sum += w * 2;
    else if (v === "planned") sum += w * 1;
  }
  return Math.round((sum / (max || 1)) * 100);
}

// Score → Level
function getLevel(score) {
  if (score >= 99) return "Leading";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Lagging / Not Buyer Ready";
  if (score >= 40) return "At Risk";
  return "Critical";
}

// Dynamisk benchmark tekst (du kan finjustere formuleringerne frit)
function getBenchmarkText(score) {
  if (score >= 99) {
    return "Your company is fully aligned with buyer requirements. Focus on maintaining compliance.";
  } else if (score >= 80) {
    return "You are close to buyer alignment. Minor improvements are recommended to stay audit-ready.";
  } else if (score >= 60) {
    return "Gaps remain in your ESG readiness. Address missing policies and documentation to improve buyer acceptance.";
  } else if (score >= 40) {
    return "Significant gaps exist. Buyer acceptance is unlikely without targeted improvements.";
  } else {
    return "Critical gaps in ESG readiness. Immediate action is required to reach buyer compliance.";
  }
}

// Individuelle detaljer (✅ ⚠️ ❌)
function buildDetails(answers) {
  var questions = {
    q1: "Documented ESG policy",
    q2: "Energy consumption tracking",
    q3: "Waste management procedure",
    q4: "Supplier code of conduct",
    q5: "Scope 1–2 emissions tracking",
    q6: "Scope 3 emissions tracking",
    q7: "Health & safety policy",
    q8: "Diversity & inclusion policy",
    q9: "Anti-corruption/whistleblowing",
    q10: "Data protection (GDPR)",
    q11: "Water use tracking",
    q12: "Waste & recycling rates",
    q13: "Sharing ESG KPIs with buyers"
  };

  var details = "";
  for (var key in questions) {
    var ans = (answers[key] || "").toLowerCase();
    var status = "❌ No";
    if (ans === "yes") status = "✅ Yes";
    else if (ans === "planned") status = "⚠️ Planned";
    details += questions[key] + ": " + status + "\\n";
  }
  return details;
}

// Vælg barometer ud fra score
function getBarometerFileId(score) {
  if (score >= 99) return BAROMETER.GREEN;
  if (score >= 80) return BAROMETER.LIGHTGREEN;
  if (score >= 60) return BAROMETER.YELLOW;
  if (score >= 40) return BAROMETER.ORANGE;
  return BAROMETER.RED;
}

// Generér Word-rapport
function generateReport(lead, score, level, benchmark, answers) {
  var file = DriveApp.getFileById(TEMPLATE_ID).makeCopy("ESG Report - " + (lead.company || "Company"));
  var docId = file.getId();
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();

  // 1) Erstat tekst-placeholders 1:1
  body.replaceText("{{COMPANY}}", lead.company || "");
  body.replaceText("{{EMAIL}}", lead.email || "");
  body.replaceText("{{SCORE}}", score.toString());
  body.replaceText("{{LEVEL}}", level);
  body.replaceText("{{BENCHMARK}}", benchmark);
  body.replaceText("{{DETAILS}}", buildDetails(answers));

  // 2) Indsæt barometerbillede dér hvor {{BAROMETER}} står
  var barometerId = getBarometerFileId(score);
  var barometerImg = DriveApp.getFileById(barometerId).getBlob();

  // Find paragraf med {{BAROMETER}} og indsæt billedet på den placering
  var found = body.findText("\\{\\{BAROMETER\\}\\}");
  if (found) {
    var el = found.getElement();
    el.asText().setText(""); // ryd placeholder
    // Indsæt billedet ved at indsætte en ny paragraf efter elementets paragraf
    var parent = el.getParent();
    var p = parent.insertParagraph(parent.getChildIndex(el) + 1, "");
    p.appendInlineImage(barometerImg).setWidth(400);
  } else {
    // fallback: bare append i bunden (sker sjældent)
    body.appendImage(barometerImg).setWidth(400);
  }

  doc.saveAndClose();
  // Konverter til .docx og returnér
  return DriveApp.getFileById(docId).getAs(MimeType.MICROSOFT_WORD);
}

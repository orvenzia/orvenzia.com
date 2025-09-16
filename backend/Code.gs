/** Orvenzia ESG Screening Backend – Baseline Report (no barometer)
 * Deploy as Web App: Execute as Me; Who has access: Anyone
 */

// ========== KONFIG ==========
const OWNER_EMAIL = "support@orvenzia.com";
const TEMPLATE_ID = "https://docs.google.com/document/d/1Sj4t15edHcOhQ1K-_un6oiA261yaEEAejF0AACyJHqE/edit?tab=t.0"; // <-- indsæt Google Docs skabelon-ID

// ========== ENDPOINT ==========
function doPost(e) {
  try {
    if (!e || !e.postData) {
      return jsonOut({ ok: false, error: "No data" });
    }
    var data = JSON.parse(e.postData.contents);
    var lead = data.lead || {};
    var answers = data.answers || {};

    // Score + level
    var score = computeScore(answers);
    var level = getLevel(score);

    // Generér baseline-rapport
    var docxBlob = generateReport(lead, score, level, answers);

    // Mail til ejer (rapport vedhæftet)
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: "New ESG Screening: " + (lead.company || "Unknown"),
      htmlBody:
        "<p>Ny screening gennemført.</p>" +
        "<p><b>Company:</b> " + (lead.company || "(n/a)") + "<br>" +
        "<b>Email:</b> " + (lead.email || "(n/a)") + "<br>" +
        "<b>Score:</b> " + score + " (" + level + ")</p>",
      attachments: [docxBlob]
    });

    // Mail til kunden (kort kvittering)
    if (lead.email) {
      MailApp.sendEmail({
        to: lead.email,
        subject: "Your ESG Screening Result",
        htmlBody:
          "<p>Tak for at gennemføre ESG-screeningen.</p>" +
          "<p>Din score: <b>" + score + "/100</b> – " + level + ".</p>"
      });
    }

    return jsonOut({ ok: true, score: score, level: level });

  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

// ========== HJÆLPEFUNKT. ==========
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function computeScore(a) {
  var W = { q1:2,q2:2,q3:2,q4:2,q5:2,q6:2,q7:2,q8:2,q9:2,q10:2,q11:2,q12:2,q13:2 };
  var sum=0,max=0;
  for (var k in W) {
    var v=(a[k]||"").toLowerCase(), w=W[k];
    max += w*2;
    if (v==="yes") sum += w*2;
    else if (v==="planned") sum += w*1;
  }
  return Math.round((sum/(max||1))*100);
}

function getLevel(score){
  if(score>=99) return "Leading";
  if(score>=80) return "Strong";
  if(score>=60) return "Lagging / Not Buyer Ready";
  if(score>=40) return "At Risk";
  return "Critical";
}

function buildDetailsRows(answers){
  var Q = {
    q1:"Documented ESG policy", q2:"Energy consumption tracking", q3:"Waste management procedure",
    q4:"Supplier code of conduct", q5:"Scope 1–2 emissions tracking", q6:"Scope 3 emissions tracking",
    q7:"Health & safety policy", q8:"Diversity & inclusion policy", q9:"Anti-corruption/whistleblowing",
    q10:"Data protection (GDPR)", q11:"Water use tracking", q12:"Waste & recycling rates", q13:"Sharing ESG KPIs with buyers"
  };
  var rows = [["Question","Status"]]; // header
  for (var k in Q) {
    var v = (answers[k]||"").toLowerCase();
    var status = "❌ No";
    if (v==="yes") status = "✅ Yes";
    else if (v==="planned") status = "⚠️ Planned";
    rows.push([Q[k], status]);
  }
  return rows;
}

// Luksus søjlediagram
function makeChart(title, value, max){
  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Label")
    .addColumn(Charts.ColumnType.NUMBER, "Value")
    .addRow([title, value])
    .build();

  var chart = Charts.newColumnChart()
    .setDataTable(data)
    .setOption("legend", "none")
    .setOption("title", title)
    .setOption("titleTextStyle", {color:"#228B22", fontSize:16, bold:true})
    .setOption("backgroundColor", "#FFFFFF")
    .setOption("vAxis", {
      viewWindow: {min:0, max:max},
      gridlines: {count: 0},
      baselineColor: "#CCCCCC",
      textStyle: {color:"#666666"}
    })
    .setOption("hAxis", {
      textStyle: {color:"#666666"}
    })
    .setOption("bar", {groupWidth:"50%"})
    .setOption("colors", ["#228B22"])
    .setDimensions(400, 300)
    .build();

  return chart.getAs("image/png");
}

function insertImageAtPlaceholder(body, placeholder, blob, widthPx){
  var found = body.findText("\\{\\{"+placeholder+"\\}\\}");
  if (!found) return false;
  var el = found.getElement().asText();
  el.setText("");
  var p = el.getParent().asParagraph();
  p.appendInlineImage(blob).setWidth(widthPx);
  return true;
}

function insertTableAtPlaceholder(body, placeholder, rows){
  var found = body.findText("\\{\\{"+placeholder+"\\}\\}");
  if (!found) return false;
  var el = found.getElement().asText();
  el.setText("");
  var p = el.getParent().asParagraph();
  var tbl = p.getParent().insertTable(p.getParent().getChildIndex(p)+1, rows);
  tbl.getRow(0).editAsText().setBold(true).setForegroundColor("#228B22");
  return true;
}

// ========== DOKUMENT ==========
function generateReport(lead, score, level, answers){
  var file = DriveApp.getFileById(TEMPLATE_ID).makeCopy("Baseline ESG Report - " + (lead.company||"Company"));
  var docId = file.getId();
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();

  body.replaceText("\\{\\{COMPANY\\}\\}", lead.company||"");
  body.replaceText("\\{\\{EMAIL\\}\\}", lead.email||"");
  body.replaceText("\\{\\{SCORE\\}\\}", String(score));
  body.replaceText("\\{\\{LEVEL\\}\\}", level);

  // Detaljer
  insertTableAtPlaceholder(body, "DETAILS_TABLE", buildDetailsRows(answers));

  // Benchmark chart
  var benchBlob = makeChart("Benchmark", score, 100);
  insertImageAtPlaceholder(body, "CHART_BENCHMARK", benchBlob, 320);

  // Score chart
  var scoreBlob = makeChart("Score", score, 100);
  insertImageAtPlaceholder(body, "CHART_SCORE", scoreBlob, 320);

  doc.saveAndClose();
  return DriveApp.getFileById(docId).getAs(MimeType.MICROSOFT_WORD);
}

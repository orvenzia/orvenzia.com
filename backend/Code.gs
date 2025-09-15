// === Orvenzia Screening Backend (Google Apps Script) ===
// File: Code.gs
//
// Setup steps:
// 1) Create a Google Sheet named "Orvenzia Screening Leads" and get its Spreadsheet ID (from the URL).
// 2) Open Extensions → Apps Script, paste this file content, replace SPREADSHEET_ID and OWNER_EMAIL.
// 3) Deploy → Manage deployments → New deployment → type: Web app → Execute as: Me → Who has access: Anyone.
// 4) Copy the Web app URL and paste it into screening.html replacing %%REPLACE_WITH_YOUR_APPS_SCRIPT_WEBAPP_URL%%
//
// NOTE: This script will store each submission in the Google Sheet and send the PDF report
// to the user and to the OWNER_EMAIL simultaneously.

const SPREADSHEET_ID = "PUT_YOUR_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Leads";
const OWNER_EMAIL = "support@orvenzia.com";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp","Company","Email","Score","Level","Answers JSON"]);
    }

    sheet.appendRow([
      new Date(),
      data.company || "",
      data.email || "",
      data.score || "",
      data.level || "",
      JSON.stringify(data.answers || [])
    ]);

    // Build PDF from provided HTML
    const htmlBlob = Utilities.newBlob(data.reportHtml || "<html><body>No report HTML</body></html>", "text/html", "report.html");
    const tempPdf = DriveApp.createFile(htmlBlob).getAs("application/pdf").setName("Orvenzia_Screening_Report.pdf");

    // Send to user
    GmailApp.sendEmail(data.email, "Your ESG Screening Report",
      "Attached is your ESG Readiness Screening Report from Orvenzia.",
      {{ attachments: [tempPdf] }}
    );

    // Send copy to owner
    GmailApp.sendEmail(OWNER_EMAIL, "New ESG Screening Lead",
      "Company: " + (data.company||"-") + "\n" +
      "Email: " + (data.email||"-") + "\n" +
      "Score: " + (data.score||"-") + "\n" +
      "Level: " + (data.level||"-"),
      {{ attachments: [tempPdf] }}
    );

    // Clean up file to avoid Drive clutter
    tempPdf.setTrashed(true);

    return ContentService.createTextOutput(JSON.stringify({{status:"ok"}})).setMimeType(ContentService.MimeType.JSON);
  }} catch (err) {{
    return ContentService.createTextOutput(JSON.stringify({{status:"error", message: String(err)}})).setMimeType(ContentService.MimeType.JSON);
  }}
}

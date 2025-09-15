// Orvenzia ESG Screening Backend (Google Apps Script)
const SPREADSHEET_ID = 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID';
const OWNER_EMAIL = 'support@orvenzia.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const company = data.company || '';
    const email = data.email || '';
    const score = data.score || 0;
    const level = data.level || '';
    const answers = data.answers || [];
    const reportHtml = data.reportHtml || '';

    const blob = Utilities.newBlob(reportHtml, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf').setName(`Orvenzia_ESG_Report_${company}.pdf`);

    MailApp.sendEmail({
      to: email,
      replyTo: OWNER_EMAIL,
      name: 'Orvenzia Support',
      subject: `Your ESG Screening Report (${score}/100)`,
      htmlBody: `<p>Dear ${company},</p>
                 <p>Your ESG screening score is <strong>${score}/100</strong> (${level}).</p>
                 <p>Your full report is attached as PDF.</p>
                 <p>Best regards,<br>Orvenzia Support</p>`,
      attachments: [pdf]
    });

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      replyTo: OWNER_EMAIL,
      name: 'Orvenzia System',
      subject: `New ESG Lead: ${company} (${score}/100)`,
      htmlBody: `<p>Company: ${company}<br>Email: ${email}<br>Score: ${score}/100 (${level})</p>
                 <p>Answers:<br><pre>${JSON.stringify(answers, null, 2)}</pre></p>`,
      attachments: [pdf]
    });

    if (SPREADSHEET_ID && SPREADSHEET_ID !== 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID') {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
      sheet.appendRow([new Date(), company, email, score, level, JSON.stringify(answers)]);
    }

    return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', message:String(err)}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

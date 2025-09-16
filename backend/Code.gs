/**
 * Orvenzia ESG Screening Backend (Google Apps Script)
 * - Modtager data fra screening-formen
 * - Laver PDF af HTML-rapporten
 * - Sender mail til kunden (+ bcc til support@orvenzia.com)
 * - Sender separat admin-mail til support@orvenzia.com med svar + PDF
 * - (Valgfrit) logger i Google Sheet
 */

const SPREADSHEET_ID = 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID'; // <- tom eller indsæt dit Sheet-ID
const OWNER_EMAIL = 'support@orvenzia.com';                  // <- din lead-indbakke

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return _json({ status: 'error', message: 'No POST body' });
    }

    // Frontend sender i no-cors med Content-Type: text/plain
    const data = JSON.parse(e.postData.contents);

    // --- Inputs ---
    const company    = (data.company || '').trim();
    const email      = (data.email || '').trim();
    const score      = Number(data.score || 0);
    const level      = String(data.level || '');
    const answers    = Array.isArray(data.answers) ? data.answers : [];
    const reportHtml = String(data.reportHtml || '');

    if (!company || !email || !reportHtml) {
      return _json({ status: 'error', message: 'Missing required fields (company/email/reportHtml)' });
    }

    // --- Lav PDF ud fra HTML ---
    const pdf = Utilities
      .newBlob(reportHtml, 'text/html', 'report.html')
      .getAs('application/pdf')
      .setName(`Orvenzia_ESG_Report_${safeName(company)}.pdf`);

    // --- Mail til kunden (med bcc til dig) ---
    const customerSubject = `Your ESG Screening Report (${score}/100)`;
    const customerBody = `
      <p>Dear ${escapeHtml(company)},</p>
      <p>Thank you for completing the ESG screening.</p>
      <p>Your score: <strong>${score}/100</strong> (${escapeHtml(level)})</p>
      <p>Your full report is attached as PDF.</p>
      <p>Best regards,<br>Orvenzia Support</p>
    `;

    MailApp.sendEmail({
      to: email,
      bcc: OWNER_EMAIL, // ← altid en kopi til dig
      replyTo: OWNER_EMAIL,
      name: 'Orvenzia Support',
      subject: customerSubject,
      htmlBody: customerBody,
      attachments: [pdf]
    });

    // --- Admin-mail (lead + svar) til dig ---
    const adminSubject = `New ESG Lead: ${company} (${score}/100)`;
    const adminBody = `
      <p><strong>Company:</strong> ${escapeHtml(company)}<br>
      <strong>Email:</strong> ${escapeHtml(email)}<br>
      <strong>Score:</strong> ${score}/100 (${escapeHtml(level)})</p>
      <p><strong>Answers:</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;">${escapeHtml(JSON.stringify(answers, null, 2))}</pre>
    `;

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      replyTo: OWNER_EMAIL,
      name: 'Orvenzia System',
      subject: adminSubject,
      htmlBody: adminBody,
      attachments: [pdf]
    });

    // --- (Valgfrit) Log i Google Sheet ---
    if (SPREADSHEET_ID && SPREADSHEET_ID !== 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID') {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
      sheet.appendRow([new Date(), company, email, score, level, JSON.stringify(answers)]);
    }

    return _json({ status: 'ok' });

  } catch (err) {
    // Se detaljer i Executions-loggen
    console.error('doPost error:', err);
    return _json({ status: 'error', message: String(err) });
  }
}

/* ===================== Helpers ===================== */

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeName(str) {
  return String(str).replace(/[^\w\-\.\s]/g, '_').slice(0, 80);
}

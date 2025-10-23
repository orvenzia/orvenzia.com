# Orvenzia — One‑file Setup (Updated 2025-10-10)
This site is pre‑wired to capture **every lead** (Request PDF / Call / Screening submit) and email you details.

## What you do (two clicks)
1) **Create the Webhook** (Google Apps Script Web App)
   - Open the file `apps_script_webhook.js` (included in this zip) and paste it into a new Apps Script project.
   - In Script Properties, optionally set `SHEET_ID` to log to Google Sheets. (Skip if you only want emails.)
   - Deploy → New deployment → *Web app* → Execute as *Me*, Who has access *Anyone* → Copy the **Web App URL**.

2) **Paste your URL in ONE place**
   - Open `lead-config.js` and replace the placeholder after `window.LEAD_WEBHOOK_URL =` with your Web App URL.
   - Upload all files to your hosting (e.g., GitHub Pages). Done.

## What happens next
- Every **PDF click**, **Call click**, and **Screening submit** sends a JSON payload to your webhook.
- The server script sends you an **email** with:
  - Company, Name, Title, Phone, Email
  - **Score %** + answered/possible
  - A full **per‑question breakdown** (q1..q13) with labels and answers
- (Optional) If you set `SHEET_ID`, everything is also appended to a `Leads` sheet.

## Odoo integration (optional)
- Easiest: set an **email alias** in Odoo CRM (e.g. `leads@yourdomain`) that creates leads from emails.
- In `apps_script_webhook.js`, change `MailApp.sendEmail("support@orvenzia.com", ...)` to your **Odoo alias** or add it as BCC.

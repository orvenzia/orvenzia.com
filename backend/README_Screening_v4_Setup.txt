# Orvenzia Screening v4 — Setup Guide (Email + Lead + PDF)

## What you have
- `screening.html` — premium form with company + email required, 13 weighted questions, instant on-page report, and POST to backend
- `assets/js/screening.js` — scoring, report rendering, and sending JSON payload to the backend
- `backend/Code.gs` — Google Apps Script backend (Web App) that logs leads in Sheets and emails the PDF to the user + you

## 1) Create a Google Sheet
- Name: **Orvenzia Screening Leads**
- Copy its **Spreadsheet ID** from the URL.

## 2) Apps Script
- Open the Sheet → **Extensions → Apps Script**
- Create file `Code.gs`, paste the content from `backend/Code.gs`
- Replace:
  - `SPREADSHEET_ID = "PUT_YOUR_SPREADSHEET_ID_HERE"` with your ID
  - `OWNER_EMAIL = "support@orvenzia.com"` if you use a different inbox
- Click **Deploy → Manage deployments → New deployment**
  - Type: **Web app**
  - Execute as: **Me**
  - Who has access: **Anyone**
- Copy the **Web App URL**

## 3) Frontend endpoint
- In `screening.html`, find:
  `window.SCREENING_BACKEND_URL = "%%REPLACE_WITH_YOUR_APPS_SCRIPT_WEBAPP_URL%%";`
- Paste your Web App URL there and save.

## 4) Upload the site
- Upload all files to your hosting (overwrite existing).
- Test the flow:
  1) Fill company + email
  2) Answer the 13 questions
  3) Submit → on-page report shows → email arrives to user + to you
  4) Check the Google Sheet — the lead is logged

Tip: If emails end up in spam, consider using a custom domain email on Google Workspace or later switch to SendGrid/Postmark.

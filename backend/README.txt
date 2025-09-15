Orvenzia Screening v6.2 — Quick Setup

1) Upload all files in this folder structure to your GitHub website (keep paths).
2) Create Google Apps Script:
   - https://script.google.com/ → New Project → paste backend/Code.gs → Deploy → Web app
   - Execute as: Me • Who has access: Anyone
   - Copy the Web App URL.
3) Open screening.html and replace:
   window.SCREENING_BACKEND_URL = "%%REPLACE_WITH_YOUR_APPS_SCRIPT_WEBAPP_URL%%";
   with your Web App URL.
4) (Optional) Put a Google Sheet ID in Code.gs to log leads.
5) Commit & push to GitHub → open /screening.html → test.

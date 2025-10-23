
# Orvenzia — Request Call Email Hook

This patch ensures the **Request Call (after screening)** form sends an email to **support@orvenzia.com** with the right data.

## What changed
1. Added **assets/js/request_call_email.js** — attaches to any form marked with `data-request-call`, class `request-call`, or id `request-call-form`.
   - Forces `action="https://formsubmit.co/support@orvenzia.com"` and `method="POST"`.
   - Adds hidden fields: `_template=table`, `_captcha=false`, `_subject="Orvenzia | Request Call after Screening"`.
   - Pulls screening results from `localStorage.orvenzia_screening_data` and includes Score, Summary, Timestamp and each answer as separate fields.
2. Added **assets/js/screening_store.js** — exposes `window.saveOrvenziaScreening(data)` so your screening page can store results.
3. Injected those scripts on pages that mention "screening" or "request call".

## How to provide screening data
When you compute the screening result, call:
```js
saveOrvenziaScreening({
  score: 72,
  summary: "Good S, gaps on E & G for DE-C29, ~120 FTE",
  answers: {"Q1":"Yes","Q2":"No","Q3":"Planned"}
});
```
This stores a JSON payload in `localStorage`. When the user submits the **Request Call** form, the data is automatically included in the email.

## How to mark the Request Call form
Make sure your Request Call form has **one** of these:
```html
<form data-request-call>
<!-- or -->
<form class="request-call">
<!-- or -->
<form id="request-call-form">
```
Also ensure fields have names (`name`, `email`, `phone`, `company`, `message`) so the email shows labeled values.

## Notes
- This uses **FormSubmit** to send emails to `support@orvenzia.com`. The first submission may require you to confirm/whitelist via a link sent by FormSubmit.
- If you have a dedicated thank-you page, add `data-thankyou="/thank-you.html"` to the form, or set `_next` manually.
- No layout or desktop/mobile UI was altered.

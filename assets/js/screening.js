/* ESG Screening – robust backend integration v7.1 */
(function () {
  const form = document.getElementById('screening-form');
  const mailStatus = document.getElementById('mail-status');
  const errorBanner = document.getElementById('error-banner');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return console.warn('screening.js: #screening-form not found');

  function getAnswer(name) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return '';
    if (el instanceof HTMLSelectElement) return el.value || '';
    const radios = form.querySelectorAll(`input[name="${name}"]`);
    if (radios && radios.length) {
      const checked = Array.from(radios).find(r => r.checked);
      return checked ? checked.value : '';
    }
    return '';
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Basic scoring: yes=2, planned=1, no=0 -> normalize to 0..100
  function computeScore(answers) {
    const keys = Object.keys(answers);
    let sum = 0;
    keys.forEach(k => {
      const v = (answers[k] || '').toLowerCase();
      if (v === 'yes') sum += 2;
      else if (v === 'planned') sum += 1;
      else sum += 0;
    });
    const max = keys.length * 2;
    const score = Math.round((sum / max) * 100);
    return score;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner && errorBanner.classList.remove('show');
    if (errorBanner) errorBanner.textContent = '';
    if (mailStatus) mailStatus.textContent = '';

    const company = (form.querySelector('#company')?.value || '').trim();
    const email = (form.querySelector('#email')?.value || '').trim();
    if (!company || !validEmail(email)) {
      alert('Please enter a company and a valid work email.');
      return;
    }

    const answers = {};
    for (let i = 1; i <= 13; i++) {
      answers['q' + i] = getAnswer('q' + i);
      if (!answers['q' + i]) {
        alert('Please answer question ' + i);
        return;
      }
    }

    const score = computeScore(answers);
    try { localStorage.setItem('esg_last_score', String(score)); } catch(_) {}

    form.classList.add('submitting');
    if (submitBtn) submitBtn.disabled = true;
    if (mailStatus) mailStatus.textContent = 'Sending report...';

    const payload = { 
      lead: { company, email }, 
      answers, 
      meta: { score, ts: new Date().toISOString(), ua: navigator.userAgent } 
    };

    try {
      const ENDPOINT = (window && window.SCREENING_BACKEND_URL)
        ? window.SCREENING_BACKEND_URL
        : 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).catch(err => { throw new Error('Network error: ' + err.message); });
      clearTimeout(t);

      const ct = resp.headers.get('content-type') || '';
      let data, isJSON = false;
      if (ct.includes('application/json')) {
        data = await resp.json(); isJSON = true;
      } else {
        const text = await resp.text();
        try { data = JSON.parse(text); isJSON = true; }
        catch { data = { ok: resp.ok, status: resp.status, text }; }
      }

      if (!resp.ok || (isJSON && data && data.ok === false)) {
        const msg = isJSON ? JSON.stringify(data) : (data.text || 'Unknown server error');
        throw new Error('HTTP ' + resp.status + ' — ' + msg);
      }

      console.log('Backend response:', data);
      if (mailStatus) mailStatus.textContent = 'Report sent.';
      setTimeout(() => {
        alert('Thanks! Your readiness score is ' + score + '. We emailed your summary.');
      }, 200);

    } catch (err) {
      console.error(err);
      if (mailStatus) mailStatus.textContent = 'Error sending report.';
      if (errorBanner) {
        errorBanner.textContent = String(err && err.message ? err.message : err);
        errorBanner.classList.add('show');
      } else {
        alert('Failed to send: ' + (err && err.message ? err.message : err));
      }
    } finally {
      form.classList.remove('submitting');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
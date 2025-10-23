
/**
 * Request Call email hook
 * - Finds a form with [data-request-call] attribute.
 * - Ensures action posts to FormSubmit -> support@orvenzia.com
 * - Adds hidden fields for subject, template, etc.
 * - If screening data exists in localStorage (set by screening page), include it.
 */
(function() {
  function ensureHiddenInput(form, name, value) {
    var el = form.querySelector('input[name="'+name+'"]');
    if (!el) {
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.appendChild(el);
    }
    if (value !== undefined) el.value = value;
    return el;
  }

  function attach(form) {
    // Force POST to FormSubmit
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://formsubmit.co/support@orvenzia.com');

    // Nice HTML table email
    ensureHiddenInput(form, '_template', 'table');
    // No CAPTCHA
    ensureHiddenInput(form, '_captcha', 'false');
    // Subject
    ensureHiddenInput(form, '_subject', 'Orvenzia | Request Call after Screening');
    // Redirect (optional): stay on page by default or use a thank-you page if present
    var thankYou = form.getAttribute('data-thankyou') || '';
    if (thankYou) ensureHiddenInput(form, '_next', thankYou);

    // Pull screening data if present
    try {
      var sc = localStorage.getItem('orvenzia_screening_data');
      if (sc) {
        var data = JSON.parse(sc);
        ensureHiddenInput(form, 'Screening Score', data.score != null ? String(data.score) : '');
        ensureHiddenInput(form, 'Screening Summary', data.summary || '');
        ensureHiddenInput(form, 'Screening Timestamp', data.timestamp || '');
        // Also include answers if present
        if (data.answers) {
          // Flatten answers object to hidden inputs
          Object.keys(data.answers).forEach(function(k) {
            // Limit name length and sanitize
            var key = 'Q_' + k.replace(/[^a-z0-9_\- ]/gi,'').slice(0,60);
            ensureHiddenInput(form, key, String(data.answers[k]));
          });
        }
      }
    } catch(e) {
      console.warn('Could not read screening data:', e);
    }

    form.addEventListener('submit', function(ev) {
      // Ensure user-visible fields have proper names so FormSubmit forwards them
      ['name','email','phone','company','message'].forEach(function(n) {
        var field = form.querySelector('[name="'+n+'"], #'+n);
        if (field && !field.name) field.name = n;
      });
    }, { once: true });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-request-call], form.request-call, #request-call-form, #requestForm');
    if (!forms.length) return;
    forms.forEach(attach);
  }

  // Initialize now and on DOMReady just in case
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

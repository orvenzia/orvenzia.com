
/* Orvenzia universal lead tracker (2025-10-10) */
(function(){
  'use strict';

  // TODO: REPLACE with your Google Apps Script Web App URL (doPost) or server endpoint
  var LEAD_WEBHOOK_URL = window.LEAD_WEBHOOK_URL || 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_WEBHOOK/exec';

  function hasWebhook(){ return /^https?:\/\//.test(LEAD_WEBHOOK_URL) && LEAD_WEBHOOK_URL.indexOf('REPLACE') === -1; }

  function params(){
    var u = new URL(location.href);
    var o = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(function(k){
      var v = u.searchParams.get(k);
      if(v) o[k] = v;
    });
    return o;
  }

  function payloadBase(){
    return {
      ts: new Date().toISOString(),
      page: location.pathname + location.search,
      ref: document.referrer || '',
      ua: navigator.userAgent || '',
      locale: navigator.language || ''
    };
  }

  function sendLead(eventType, extra){
    try{
      var data = Object.assign({}, payloadBase(), {event: eventType, utm: params()}, extra||{});
      var blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
      if(hasWebhook() && navigator.sendBeacon){
        navigator.sendBeacon(LEAD_WEBHOOK_URL, blob);
      }else if(hasWebhook()){
        fetch(LEAD_WEBHOOK_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data), keepalive:true})
          .catch(function(){});
      }else{
        // no endpoint configured: no-op (or console)
        /*console.warn*/ ('[Orvenzia Lead]', data);
      }
    }catch(e){}
  }

  // Click tracking for tel:, mailto:, pdf/request
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
    if(!a) return;
    var href = (a.getAttribute('href')||'').trim();
    var text = (a.textContent||'').trim();
    if(!href) return;

    if(/^tel:/i.test(href)){
      sendLead('call', {href: href, text: text});
    }else if(/^mailto:/i.test(href)){
      sendLead('email_click', {href: href, text: text});
    }else if(/\.pdf($|\?)/i.test(href) || (a.dataset && a.dataset.lead === 'request-pdf')){
      sendLead('request_pdf', {href: href, text: text});
    }else if(a.id === 'ctaStartScreening' || /start screening/i.test(text)){
      sendLead('start_screening', {href: href, text: text});
    }
  }, true);

  // Screening form submit tracking
  document.addEventListener('DOMContentLoaded', function(){
    var form = document.getElementById('screening-form');
    if(!form) return;
    try{ if(window.LEAD_WEBHOOK_URL && window.LEAD_WEBHOOK_URL.indexOf('REPLACE') === -1) { form.setAttribute('action', window.LEAD_WEBHOOK_URL); form.setAttribute('method','post'); } }catch(e){}

    form.addEventListener('submit', function(){
      try{
        var get = function(sel){ var el = form.querySelector(sel); return el && el.value ? el.value.trim() : ''; };
        var payload = {
          company: get('#company, input[name*="company" i]'),
          email:   get('#email, input[type="email"]'),
          name:    get('#full_name'),
          title:   get('#title'),
          phone:   get('#phone')
        };
        // Try to include score if rendered by screening.safe.js
        var scoreEl = document.getElementById('result-card');
        if(scoreEl){
          var pct = scoreEl.getAttribute('data-pct') || '';
          if(pct) payload.score_pct = pct;
        }
        
        // Capture per-question answers
        try{
          var groups = {};
          form.querySelectorAll('input[type="radio"][name^="q"]').forEach(function(i){ groups[i.name]=true; });
          var names = Object.keys(groups).sort(function(a,b){
            var na = parseInt(a.replace(/\D/g,''))||0;
            var nb = parseInt(b.replace(/\D/g,''))||0;
            return na-nb;
          });
          var answers = [];
          names.forEach(function(n){
            var chosen = form.querySelector('input[type="radio"][name="'+n+'"]:checked');
            if(!chosen) return;
            var container = chosen.closest('.rounded-2xl') || chosen.closest('div');
            var qTextEl = container ? container.querySelector('.font-medium') : null;
            var qText = (qTextEl && qTextEl.textContent || '').trim();
            var val = (chosen.value||'').trim();
            answers.push({id:n, question:qText, answer:val});
          });
          payload.answers = answers;
          // Pretty text for email
          payload.answers_text = answers.map(function(a){ return a.id + ': ' + (a.answer||'') + (a.question?(' — '+a.question):''); }).join('\\n');
        }catch(e){}

        sendLead('submit_screening', payload);
      }catch(e){}
    }, true);
  });

  // Expose for other scripts
  window.sendLead = sendLead;
})();

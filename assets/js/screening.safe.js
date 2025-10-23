
/* Orvenzia – Screening auto score (guarded, buyer-alignment recommendation + cases modal CTA) */
(function(){
  'use strict';
  var form = document.getElementById('screening-form');
  if(!form) return;

  var errorBanner = document.getElementById('error-banner');
  var resultWrap  = document.getElementById('result-wrap');
  var resultCard  = document.getElementById('result-card');

  function q(sel){ return form.querySelector(sel); }
  function qq(sel){ return form.querySelectorAll(sel); }

  function valOf(v){
    if(v === 'yes') return 1;
    if(v === 'planned') return 0.5;
    return 0;
  }

  // Buyer-alignment tiers per spec
  function classify(pct){
    if(pct >= 99) return {tier:'Leading', status:'Fully aligned with buyer requirements; no immediate action required.', rec:'Consider Subscription (regulatory alerts + periodic check-ins).', outcome:'Maintain green status without extra workload.'};
    if(pct >= 80) return {tier:'Buyer Ready', status:'Meets buyer expectations with minor improvements, typically found in audits.', rec:'Baseline Assessment (3 pages, delivery <10 days) to document alignment and pinpoint fixes.', outcome:'Audit-ready proof; prevents slipping to “Not Buyer Ready”.'};
    if(pct >= 60) return {tier:'Lagging', status:'Core elements exist, but missing policies/documentation create buyer risk.', rec:'Start with Baseline Assessment (3 pages <10 days). Alternatively, Core Analysis (10 pages 30–60 days).', outcome:'Clear gap list → rapid path to buyer readiness.'};
    if(pct >= 40) return {tier:'At Risk', status:'Significant gaps, likely to affect tenders and buyer reviews.', rec:'Core analysis with prioritized gap analysis, templates, and roadmap.', outcome:'Fast risk reduction and restored buyer eligibility.'};
    return {tier:'Critical', status:'Current posture blocks buyer eligibility and escalates commercial risk.', rec:'Minimum: Core Analysis (30–60 days). Best: Enterprise Analysis (15 pages, 60–90 days).', outcome:'Controlled turnaround to buyer-acceptable status quickly.'};
  }

  function computeScore() {
    var groups = {};
    qq('input[type="radio"][name^="q"]').forEach(function(i){ groups[i.name]=true; });
    var names = Object.keys(groups).sort(function(a,b){
      var na = parseInt(a.replace(/\D/g,''))||0;
      var nb = parseInt(b.replace(/\D/g,''))||0;
      return na-nb;
    });
    var answered = 0, total = 0;
    names.forEach(function(n){
      var chosen = q('input[type="radio"][name="'+n+'"]:checked');
      if(chosen){ answered++; total += valOf(chosen.value); }
    });
    var pct = names.length? Math.round((total / names.length)*100): 0;
    return {answered:answered, possible:names.length, raw:total, pct:pct};
  }

  function render(res){
    var card = document.getElementById('result-card');
    if(card){
      try{
        card.setAttribute('data-pct', String(Math.round(res.pct||0)));
        card.setAttribute('data-answered', String(res.answered||0));
        card.setAttribute('data-possible', String(res.possible||0));
      }catch(e){}
    }

    var cls = classify(res.pct);
    var companyEl = q('#company, input[name*="company" i]') || { value: 'Your company' };
    var company = (companyEl.value || 'Your company').trim() || 'Your company';

    var recHTML =
      '<div class="report-rec">' +
        '<h4>Recommendation</h4>' +
        '<ul>' +
          '<li><b>Status:</b> '+cls.status+'</li>' +
          '<li><b>Recommendation:</b> '+cls.rec+'</li>' +
          '<li><b>Outcome:</b> '+cls.outcome+'</li>' +
        '</ul>' +
      '</div>';

    resultCard.innerHTML =
      '<h3>'+company+' — Screening result</h3>' +
      '<div class="report-meter"><span style="width:'+res.pct+'%"></span></div>' +
      '<div class="report-kpis">' +
        '<div class="kpi"><b>Score:</b> '+res.pct+'%</div>' +
        '<div class="kpi"><b>Tier:</b> '+cls.tier+'</div>' +
        '<div class="kpi"><b>Answered:</b> '+res.answered+'/'+res.possible+'</div>' +
      '</div>' +
      recHTML +
      '<div class="report-actions">' +
        '<button type="button" class="ecta js-request" data-case="Screening — '+company+'">Request a call</button>' +
      '</div>';
    try {
      var answersObj = {};
      qq('input[type="radio"][name^="q"]').forEach(function(i){
        if(i.checked){ answersObj[i.name] = i.value; }
      });
      var summaryLine = [
        'Name: ' + (form.name && form.name.value ? form.name.value.trim() : ''),
        'Company: ' + (form.company && form.company.value ? form.company.value.trim() : ''),
        'Email: ' + (getEmailEl() ? getEmailEl().value.trim() : ''),
        'Score: ' + (res.pct + '%'),
        'Answered: ' + (res.answered + '/' + res.possible)
      ].join(' | ');
      if (window.saveOrvenziaScreening) {
        window.saveOrvenziaScreening({
          score: res.pct,
          summary: summaryLine,
          answers: answersObj
        });
      }
      // If request call form exists, also prefill hidden fields there
      var rf = document.getElementById('requestForm') || document.getElementById('request-call-form');
      if (rf) {
        var ensure = function(name, value){
          var el = rf.querySelector('input[name="'+name+'"]');
          if(!el){ el = document.createElement('input'); el.type='hidden'; el.name=name; rf.appendChild(el); }
          el.value = value;
        };
        ensure('Screening Score', String(res.pct));
        ensure('Screening Summary', summaryLine);
      }
    } catch(e) { console.warn('saveOrvenziaScreening failed', e); }


    resultWrap.style.display = 'block';
    try{ resultWrap.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){}
  }

  function showError(msg){
    if(!errorBanner) return;
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';
    setTimeout(function(){ errorBanner.style.display='none'; }, 4000);
  }

  function getEmailEl(){
    return q('#email, input[type="email"], input[name*="email" i]');
  }

  function isValidEmail(el){
    if(!el) return false;
    var v = (el.value || '').trim();
    if(!v) return false;
    if (typeof el.checkValidity === 'function' && el.type === 'email') {
      return el.checkValidity();
    }
    return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}$/.test(v);
  }

  form.addEventListener('submit', function(ev){
    ev.preventDefault();

    var companyEl = q('#company, input[name*="company" i]');
    if(!companyEl || !companyEl.value || !companyEl.value.trim()){
      showError('Please enter your company name.');
      return;
    }

    var emailEl = getEmailEl();
    if(!isValidEmail(emailEl)){
      showError('Please enter a valid work email.');
      try{ emailEl && emailEl.focus(); }catch(e){}
      return;
    }

    var nameEl = q('#full_name');
    if(!nameEl || !nameEl.value || !nameEl.value.trim()){
      showError('Please enter your full name.');
      try{ nameEl && nameEl.focus(); }catch(e){}
      return;
    }

    var titleEl = q('#title');
    if(!titleEl || !titleEl.value || !titleEl.value.trim()){
      showError('Please enter your job title.');
      try{ titleEl && titleEl.focus(); }catch(e){}
      return;
    }

    var phoneEl = q('#phone');
    var phoneVal = (phoneEl && phoneEl.value || '').trim();
    if(!phoneVal || !/^\+?[0-9\s\-()]{6,20}$/.test(phoneVal)){
      showError('Please enter a valid phone number (e.g., +45 20 00 00 00).');
      try{ phoneEl && phoneEl.focus(); }catch(e){}
      return;
    }

    var res = computeScore();
    if(res.answered !== res.possible){
      showError('Please answer all questions before submitting.');
      return;
    }

    render(res);


    try{
      var summary = [
        'Name: ' + (nameEl ? nameEl.value.trim() : ''),
        'Title: ' + (titleEl ? titleEl.value.trim() : ''),
        'Phone: ' + phoneVal,
        'Company: ' + (companyEl ? companyEl.value.trim() : ''),
        'Email: ' + (emailEl ? emailEl.value.trim() : '')
      ].join(' | ');
      var cs = q('#contact_summary');
      if(cs){ cs.value = summary; }
    }catch(e){}

    try{
      if((form.getAttribute('action')||'about:blank') !== 'about:blank'){
        form.submit();
      }
    }catch(e){}
  }, false);
})();

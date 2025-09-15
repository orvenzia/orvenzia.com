
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('screening-form');
  const resultWrap = document.getElementById('result-wrap');
  const resultCard = document.getElementById('result-card');
  const companyEl = document.getElementById('company');
  const emailEl = document.getElementById('email');
  const mailStatus = document.getElementById('mail-status');
  const errorBanner = document.getElementById('error-banner');

  const weights = [{"yes": 4.0, "no": 0.0}, {"yes": 4.0, "no": 0.0}, {"yes": 7.0, "planned": 3.5, "no": 0.0}, {"yes": 3.0, "planned": 1.5, "no": 0.0}, {"yes": 12.0, "no": 0.0}, {"yes": 8.0, "no": 0.0}, {"yes": 2.0, "planned": 1.0, "no": 0.0}, {"yes": 4.0, "no": 0.0}, {"yes": 6.0, "planned": 3.0, "no": 0.0}, {"yes": 12.0, "no": 0.0}, {"yes": 12.0, "planned": 6.0, "no": 0.0}, {"yes": 11.0, "planned": 5.5, "no": 0.0}, {"yes": 15.0, "planned": 7.5, "no": 0.0}];
  const totalQuestions = weights.length;
  const maxScore = weights.reduce((sum,w)=> sum + (w.yes||0), 0);

  function showError(msg){ if(!errorBanner) return; errorBanner.textContent = msg; errorBanner.style.display='block'; }

  function updateProgress() {
    const answered = [...form.querySelectorAll('input[type=radio]:checked')].length;
    const pct = Math.round((answered/totalQuestions)*100);
    const pg = document.getElementById('progress');
    if(pg){
      pg.style.setProperty('--pct', pct + '%');
      const txt = pg.querySelector('.progress-text'); if (txt) txt.textContent = pct + '%';
    }
  }
  form.addEventListener('change', updateProgress);

  function levelFor(pct){
    if (pct >= 99) return 'GREEN';
    if (pct >= 80) return 'LIGHT_GREEN';
    if (pct >= 60) return 'YELLOW';
    if (pct >= 40) return 'ORANGE';
    return 'RED';
  }

  function gaugeSVG(pct){
    const angle = (pct/100)*180;
    return `
    <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
      <!-- RED 0-39 -->
      <path d="M30,180 A150,150 0 0,1 102,60" stroke="#e53935" stroke-width="18" fill="none" />
      <!-- ORANGE 40-59 -->
      <path d="M102,60 A150,150 0 0,1 180,30" stroke="#fb8c00" stroke-width="18" fill="none" />
      <!-- YELLOW 60-79 -->
      <path d="M180,30 A150,150 0 0,1 258,60" stroke="#fdd835" stroke-width="18" fill="none" />
      <!-- LIGHT GREEN 80-98 -->
      <path d="M258,60 A150,150 0 0,1 330,180" stroke="#8bc34a" stroke-width="18" fill="none" />
      <!-- GREEN 99-100 thin cap -->
      <path d="M328,176 A150,150 0 0,1 330,180" stroke="#43a047" stroke-width="18" fill="none" />
      <!-- needle -->
      <g transform="translate(180,180) rotate(${angle})">
        <rect x="-2" y="-130" width="4" height="130" fill="#111"/><circle cx="0" cy="0" r="6" fill="#111"/>
      </g>
    </svg>`;
  }

  async function computeAndRender(e){
    e && e.preventDefault();
    if(errorBanner) errorBanner.style.display='none';
    const company = companyEl.value.trim();
    const email = emailEl.value.trim();
    if(!company || !email){ alert('Please enter company and work email.'); return; }

    // compute score + answers
    let scoreRaw = 0;
    const answers = [];
    weights.forEach((w,idx)=>{
      const qname = `q${idx+1}`;
      const checked = form.querySelector(`[name=${qname}]:checked`);
      if(!checked){ return; }
      const pts = parseFloat(checked.dataset.points||0);
      answers.push({ q: qname, answer: checked.value, points: pts });
      scoreRaw += pts;
    });
    if(answers.length < totalQuestions){ alert('Please answer all questions.'); return; }

    const pct = Math.round((scoreRaw / maxScore) * 100);
    const levelKey = levelFor(pct);
    const map = window.reportTexts || {};
    const data = map[levelKey] || { title: levelKey, status:'', recommendation:'', outcome:'' };
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

    // render on-page
    resultCard.innerHTML = `
      <div class="report-head">
        <div class="brand-row"><span class="logo-mark">O</span><span class="logo-type">Orvenzia</span></div>
        <h2 class="report-title">ESG Readiness Screening Score</h2>
        <div class="meta-grid"><div><strong>Company:</strong> ${company}</div><div><strong>Date:</strong> ${dateStr}</div></div>
      </div>
      <div class="score-row">
        <div class="gauge"><div class="gauge-needle" style="--val:${pct}"></div></div>
        <div class="score-text"><div class="big-score">${pct}<span class="u">/100</span></div><div class="level-title">${data.title}</div></div>
      </div>
      <div class="report-body">
        <p class="status"><strong>Status:</strong> ${data.status}</p>
        <p class="rec"><strong>Recommendation:</strong><br>${(data.recommendation||'').replaceAll('\\n','<br>')}</p>
        <p class="outcome"><strong>Outcome:</strong> ${data.outcome}</p>
      </div>
      <div class="report-cta"><a class="btn" href="pricing.html">See pricing</a><a class="btn btn-outline" href="contact.html">Contact</a></div>
    `;
    resultWrap.classList.add('show');
    resultWrap.scrollIntoView({behavior:'smooth'});

    // Build PDF HTML
    const pdfHtml = `
      <html><head><meta charset="utf-8"><title>Orvenzia Screening Report</title>
      <style>
        body {{ font-family: Arial, sans-serif; color:#111; }}
        .brand {{ display:flex; align-items:center; gap:8px; font-size:20px; }}
        .logo-mark {{ display:inline-block; width:28px; height:28px; border-radius:50%; background:#004d40; color:#fff; text-align:center; line-height:28px; font-weight:700; }}
        h1 {{ font-size:22px; margin:8px 0 2px; }}
        .meta {{ font-size:12px; color:#555; margin-bottom:10px; }}
        .score {{ font-size:28px; font-weight:800; margin:8px 0; }}
        .level {{ font-weight:700; margin-bottom:10px; }}
        .section p {{ margin:6px 0; }}
        .gauge-wrap{{ display:flex; justify-content:center; margin:8px 0; }}
      </style></head><body>
        <div class="brand"><span class="logo-mark">O</span><strong>Orvenzia</strong></div>
        <h1>ESG Readiness Screening Score</h1>
        <div class="meta">Company: ${company} &nbsp;•&nbsp; Date: ${dateStr}</div>
        <div class="score">${pct} / 100</div>
        <div class="gauge-wrap">${gaugeSVG(pct)}</div>
        <div class="level">${data.title}</div>
        <div class="section"><p><strong>Status:</strong> ${data.status}</p></div>
        <div class="section"><p><strong>Recommendation:</strong><br>${(data.recommendation||'').replaceAll('\\n','<br>')}</p></div>
        <div class="section"><p><strong>Outcome:</strong> ${data.outcome}</p></div>
      </body></html>
    `;

    // Send email via backend if configured
    try{
      if(!window.SCREENING_BACKEND_URL || String(window.SCREENING_BACKEND_URL).includes('REPLACE')){
        throw new Error('Backend URL not configured');
      }
      mailStatus.textContent = 'Sending your report...';
      const resp = await fetch(window.SCREENING_BACKEND_URL, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ company, email, score:pct, level:levelKey, answers, reportHtml: pdfHtml })
      });
      const json = await resp.json().catch(()=>({}));
      mailStatus.textContent = (json.status==='ok') ? 'Report sent. Check your inbox.' : 'Could not send email. Please contact support@orvenzia.com.';
      if(json.status!=='ok') showError('Email backend error. See console.');
    } catch(err){
      console.error(err); mailStatus.textContent = 'Network error while sending email.'; showError(err.message||'Unexpected error');
    }
  }

  // Listeners
  form.setAttribute('novalidate','novalidate');
  form.addEventListener('submit', (e)=>{ e.preventDefault(); computeAndRender(e); });
  document.getElementById('see-result')?.addEventListener('click', (e)=>{ e.preventDefault(); computeAndRender(e); });

  updateProgress();
});

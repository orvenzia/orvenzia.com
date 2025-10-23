
(function(){
  const modal = document.getElementById('requestModal');
  const form = document.getElementById('requestForm');
  const inputCase = document.getElementById('req_case');
  const msg = document.getElementById('req_msg');
  function openModal(caseName){
    inputCase.value = caseName || '';
    msg.textContent='';
    modal.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('no-scroll');
    setTimeout(()=>{ document.getElementById('req_name').focus(); }, 40);
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('no-scroll');
    form.reset();
  }
  document.addEventListener('click', function(e){
    const btn = e.target.closest('.js-request');
    if(btn){ e.preventDefault(); openModal(btn.getAttribute('data-case') || ''); }
    if(e.target.closest('.js-close')){ e.preventDefault(); closeModal(); }
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    msg.textContent='';
    const name = form.name.value.trim();
    const company = form.company.value.trim();
    const role = form.role.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const casename = inputCase.value.trim();
    if(!name || !company || !role || !email || !document.getElementById('req_consent').checked){
      msg.textContent = 'Please complete the required fields and accept the consent.';
      return;
    }
    const subject = 'Request Full Report — ' + (casename || '');
    const body = 'Case: ' + (casename||'') + '%0D%0A' +
                 'Name: ' + encodeURIComponent(name) + '%0D%0A' +
                 'Company: ' + encodeURIComponent(company) + '%0D%0A' +
                 'Title: ' + encodeURIComponent(role) + '%0D%0A' +
                 'Phone: ' + encodeURIComponent(phone) + '%0D%0A' +
                 'Email: ' + encodeURIComponent(email) + '%0D%0A';
    window.location.href = 'mailto:support@orvenzia.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
    setTimeout(closeModal, 600);
  });
})();

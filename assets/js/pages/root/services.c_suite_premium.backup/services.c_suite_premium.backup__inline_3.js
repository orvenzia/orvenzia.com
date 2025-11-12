
  document.addEventListener('click', (e)=>{
    const btn=e.target.closest('[data-evt]'); if(btn){ /*console.log*/ ('event:', btn.dataset.evt); }
  });


(function(){
  var form = document.getElementById('requestForm');
  if(!form) return;
  form.addEventListener('submit', function(){
    var from = document.getElementById('rqPreferredFrom');
    var to   = document.getElementById('rqPreferredTo');
    var msg  = document.getElementById('rqMsg');
    var a = from && from.value ? from.value : '';
    var b = to && to.value ? to.value : '';
    var line = '';
    if(a || b){
      line = 'Preferred time: ' + (a||'') + (b ? '–' + b : '');
    }
    if(msg && line && !/Preferred time:/i.test(msg.value||'')){
      msg.value = line + '\n' + (msg.value || '');
    }
  });
})();

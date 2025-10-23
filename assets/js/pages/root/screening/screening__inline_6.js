
(function(){
  function fmt(mins){var s=mins>=0?'+':'-';mins=Math.abs(mins);var h=String(Math.floor(mins/60)).padStart(2,'0');var m=String(mins%60).padStart(2,'0');return 'UTC'+s+h+':'+m;}
  function offNow(tz){
    try{
      var p=new Intl.DateTimeFormat('en-GB',{timeZone:tz,timeZoneName:'shortOffset',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date());
      var z=p.find(x=>x.type==='timeZoneName'); if(z&&/UTC[+-]\d{2}:\d{2}/.test(z.value)) return z.value.replace('UTC','').trim();
    }catch(e){}
    try{
      var local=new Date();
      var fmt=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false});
      var [hh,mm]=fmt.format(local).split(':').map(Number);
      var total=(hh*60+mm)-(local.getUTCHours()*60+local.getUTCMinutes());
      var s=total>=0?'+':'-'; total=Math.abs(total);
      return s+String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
    }catch(e){}
    return '+00:00';
  }
  function upd(){
    var sel=document.getElementById('rqTz'), note=document.getElementById('rqTzNote'); if(!sel||!note)return;
    var tz=sel.value, off=offNow(tz); note.textContent='Current offset: UTC'+off+' — '+tz;
  }
  document.addEventListener('change', function(e){ if(e.target && e.target.id==='rqTz') upd(); }, false);
  document.addEventListener('DOMContentLoaded', upd);
  var form=document.getElementById('requestForm');
  if(form){
    form.addEventListener('submit', function(){
      var sel=document.getElementById('rqTz'), msg=document.getElementById('rqMsg');
      if(sel && msg){
        var off=offNow(sel.value);
        var line='Timezone: '+sel.value+' (UTC'+off+')';
        if(!/\bTimezone:/i.test(msg.value||'')){ msg.value=line+'\n'+(msg.value||''); }
      }
    });
  }
})();

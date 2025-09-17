// === Orvenzia ESG Screening frontend logic ===

// Samme vægte som backend
const W = {
  q1:{yes:4,planned:0,no:0},   q2:{yes:4,planned:0,no:0},
  q3:{yes:7,planned:3.5,no:0}, q4:{yes:3,planned:1.5,no:0},
  q5:{yes:12,planned:0,no:0},  q6:{yes:8,planned:0,no:0},
  q7:{yes:2,planned:1,no:0},   q8:{yes:4,planned:0,no:0},
  q9:{yes:6,planned:3,no:0},   q10:{yes:10,planned:0,no:0},
  q11:{yes:12,planned:0,no:0}, q12:{yes:18,planned:9,no:0},
  q13:{yes:10,planned:0,no:0}
};

function showError(msg){
  const b=document.getElementById('error-banner');
  b.textContent=msg||'Unexpected error.'; 
  b.style.display='block';
  setTimeout(()=> b.style.display='none',7000);
}

function collectAnswers(){
  const a={}; 
  for(let i=1;i<=13;i++){
    const el=document.querySelector(`input[name="q${i}"]:checked`);
    if(!el) return null; 
    a["q"+i]=el.value.toLowerCase();
  } 
  return a;
}

function computeScore(ans){
  let sum=0,max=0;
  Object.keys(W).forEach(k=>{
    const w=W[k]; 
    max+=Math.max(w.yes||0,w.planned||0,w.no||0); 
    sum+=(w[ans[k]]||0);
  });
  return Math.round((sum/(max||1))*100);
}

function gaugeSVG(pct){
  const angle=-90+(pct/100)*180;
  return `<svg width="300" height="160" viewBox="0 0 360 200">
    <path d="M30,180 A150,150 0 0,1 330,180" stroke="#eee" stroke-width="18" fill="none"/>
    <line x1="180" y1="180" x2="${180+140*Math.cos(angle*Math.PI/180)}" y2="${180+140*Math.sin(angle*Math.PI/180)}" stroke="#111" stroke-width="6" stroke-linecap="round"/>
    <circle cx="180" cy="180" r="9" fill="#111"/>
    <text x="35" y="185" font-size="12">0</text>
    <text x="325" y="185" font-size="12">100</text>
  </svg>`;
}

function renderResult(pct){
  document.getElementById('result-card').innerHTML=
    `<div class="score-wrap"><div class="gauge">${gaugeSVG(pct)}</div>
     <div class="score"><div class="big">${pct}%</div><div class="lbl">Readiness</div></div></div>`;
  document.getElementById('result-wrap').style.display='block';
}

// Event handlers
document.getElementById('see-result').addEventListener('click',()=>{
  const lead={company:company.value.trim(), email:email.value.trim()};
  if(!lead.company||!lead.email){showError("Fill out company + email"); return;}
  const ans=collectAnswers(); 
  if(!ans){showError("Answer all 13 questions"); return;}
  const pct=computeScore(ans); 
  renderResult(pct);
  document.getElementById('screening-form').submit(); // send til backend (Apps Script)
});

document.getElementById('screening-form').addEventListener('reset',()=>{
  document.getElementById('result-wrap').style.display='none';
});

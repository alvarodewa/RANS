const CORRECT_PIN = '123';
const AUTO_FULLSCREEN = true;
const VIBRATE_ON_WRONG = true;
const VIBRATE_PATTERN = [180, 90, 180, 90, 300];

document.getElementById('pinHint').textContent = CORRECT_PIN;

const logEl = document.getElementById('log');
const progEl = document.getElementById('progress');
const pctEl = document.getElementById('percent');
const statusEl = document.getElementById('status');
const lockedEl = document.getElementById('locked');
const flash = document.getElementById('neonFlash');

const lines = [
  '[..] BOOTCHAIN INIT',
  '[..] RUNNING NETWORK SWEEP',
  '[..] DISCOVERED 8 HOSTS',
  '[..] DEPLOYING AGENT',
  '[..] AGENT ONLINE',
  '[..] STREAMING METADATA',
  '[..] CHECKSUMS OK',
  '[..] EXFILTRATION COMPLETE'
];

let pct = 0;
let attempts = 0;

function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function typeLine(text){
  return new Promise(res=>{
    let i=0;
    const interval=setInterval(()=>{
      logEl.textContent += text[i]||'';
      i++;
      if(i>text.length){clearInterval(interval);logEl.textContent+='\n';res();}
    },15);
  });
}

async function runSequence(){
  for(let i=0;i<lines.length;i++){
    await typeLine(lines[i]);
    pct+=15; if(pct>98)pct=98;
    progEl.style.width=pct+'%';
    pctEl.textContent=pct+'%';
    statusEl.textContent=lines[i];
    if(Math.random()>0.6) triggerFlash(100,0.15);
    await wait(300);
  }
  progEl.style.width='100%';
  pctEl.textContent='100%';
  statusEl.textContent='complete';
  setTimeout(showLockedScreen,500);
}

function triggerFlash(dur=100,op=0.14){
  flash.style.opacity=String(op);
  setTimeout(()=>flash.style.opacity='0',dur);
}

function showLockedScreen(){
  lockedEl.style.display='block';
  if(AUTO_FULLSCREEN&&document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen().catch(()=>{});
  }
  try{playNeonAlarm();}catch(e){}
}

let audioCtx;
function ensureAudio(){
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}

function playNeonAlarm(){
  const ctx=ensureAudio();
  const now=ctx.currentTime;
  const master=ctx.createGain();
  master.gain.setValueAtTime(0.3,now);
  master.connect(ctx.destination);

  const osc=ctx.createOscillator();
  osc.type='sawtooth';
  osc.frequency.setValueAtTime(200,now);
  const gain=ctx.createGain();
  gain.gain.setValueAtTime(0.2,now);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now+2);
}

const unlockBtn=document.getElementById('unlockBtn');
const modal=document.getElementById('modal');
const pinInput=document.getElementById('pinInput');
const okBtn=document.getElementById('okBtn');
const cancelBtn=document.getElementById('cancelBtn');
const errEl=document.getElementById('err');

unlockBtn.addEventListener('click',openModal);
cancelBtn.addEventListener('click',closeModal);
okBtn.addEventListener('click',submitPin);

function openModal(){
  pinInput.value='';
  errEl.textContent='';
  modal.style.display='flex';
  setTimeout(()=>pinInput.focus(),150);
}

function closeModal(){ modal.style.display='none'; }

function submitPin(){
  if(pinInput.value.trim()===CORRECT_PIN){
    onSuccess();
  }else{
    attempts++;
    if(VIBRATE_ON_WRONG&&navigator.vibrate)navigator.vibrate(VIBRATE_PATTERN);
    errEl.textContent='PIN salah';
    document.getElementById('dialog').classList.add('shake');
    setTimeout(()=>document.getElementById('dialog').classList.remove('shake'),400);
  }
}

function onSuccess(){
  closeModal();
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  lockedEl.innerHTML=`
    <div style="padding:18px;text-align:center">
      <h2 style="color:var(--neon-2);margin:0">✓ SYSTEM UNLOCKED</h2>
      <p style="color:var(--muted);margin-top:8px">Semua file dipulihkan. Ini hanya simulasi — tidak ada yang dirusak.</p>
      <div style="margin-top:14px"><button onclick="location.reload()" class="btn-unlock">Tutup</button></div>
    </div>
  `;
}

runSequence();

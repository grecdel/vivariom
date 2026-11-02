// ---------- panneau de contrôle du matériel, à côté du vivarium ----------
// CTRL : 'aucun' (réglages seulement en touchant les appareils en 3/4),
//        'panneau' (panneau à droite sur grand écran, tiroir du bas sur téléphone),
//        'barre' (colonne d'icônes avec l'état de chaque appareil ; un clic ouvre ses réglages).
let CTRL='aucun';
const CTRL_IDS=['thermo','spot','neon','mist','pump','heat','vent'];
const CTRL_NOM={thermo:['🌡','Thermo-hygromètre'],spot:['💡','Spot LED'],neon:['▬','Néon T5'],mist:['💨','Brumisateur'],pump:['🚰','Réservoir'],heat:['🔥','Tapis chauffant'],vent:['🌀','Ventilation']};
const fr1=v=>v.toFixed(1).replace('.',',');
function ctrlEtat(id){if(devLocked(id))return '🔒';
  if(id==='thermo')return `${fr1(temp())} °C · ${Math.round(surfWet()*100)} %`;
  if(id==='spot')return DEV.spot.on?`${DEV.spot.int} %`:'éteint';
  if(id==='neon')return DEV.neon.on?`${DEV.neon.int} %`:'éteint';
  if(id==='mist'){const broken=lvl.showers===false||!has('prog');return broken?'manuel':DEV.mist.auto?`auto · ${Math.max(0,Math.ceil(showerT))} s`:'manuel'}
  if(id==='pump')return `${Math.round(DEV.pump.level)} %`;
  if(id==='heat')return DEV.heat.on?`→ ${DEV.heat.target} °C`:'éteint';
  if(id==='vent')return DEV.vent.open?'ouverte':'fermée';return ''}
const ctrlOn=()=>CTRL!=='aucun'&&state==='play';
const ctrlWide=()=>window.innerWidth>=1000&&!LAND;
let ctrlOpen=false,ctrlBusy=0;
(()=>{const p=document.createElement('div');p.id='ctrl';document.body.appendChild(p);
  const b=document.createElement('button');b.id='ctrlbtn';b.textContent='🎛 Matériel';document.body.appendChild(b);b.onclick=()=>{ctrlOpen=!ctrlOpen;ctrlDraw()};
  const r=document.createElement('div');r.id='ctrlbar';document.body.appendChild(r);
  p.addEventListener('pointerdown',()=>{ctrlBusy=performance.now()+1e5});addEventListener('pointerup',()=>{if(ctrlBusy)ctrlBusy=performance.now()+400})})();
function ctrlSection(id){const [ic,nom]=CTRL_NOM[id];
  let body=devLocked(id)?`<p class="dim">${lockTxt(DEV_KEY[id])}</p>`:devHTML(id).replace(/<h2>[^<]*<\/h2>/,'');
  // thermomètre : dans le panneau, seulement les chiffres (le cadran et la courbe restent dans sa fenêtre)
  if(id==='thermo')body=body.replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<img [^>]*>/g,'').replace(/<p class="dim">La dernière minute\.<\/p>/,'');
  return `<section class="cs" data-id="${id}"><h3>${ic} ${nom}<span class="cst">${ctrlEtat(id)}</span></h3><div class="csb">${body}</div></section>`}
function ctrlDraw(){const p=$('ctrl'),b=$('ctrlbtn'),r=$('ctrlbar');if(!p)return;
  const panel=ctrlOn()&&CTRL==='panneau',bar=ctrlOn()&&CTRL==='barre';
  document.body.classList.toggle('ctrlw',panel&&ctrlWide());
  b.style.display=panel&&!ctrlWide()?'block':'none';
  p.style.display=panel&&(ctrlWide()||ctrlOpen)?'block':'none';
  r.style.display=bar?'flex':'none';
  if(p.style.display==='block'){p.classList.toggle('sheet',!ctrlWide());
    p.innerHTML=`<div class="chead"><b>🎛 Matériel</b><span class="dim">${isDay()?'☀ jour':'☾ nuit'} · métabolisme ×${fr1(metabF())}</span>${ctrlWide()?'':'<button class="cx">✕</button>'}</div>`+CTRL_IDS.map(ctrlSection).join('');
    for(const s of p.querySelectorAll('.cs'))wireDev(s,s.dataset.id,ctrlDraw,ctrlDraw);
    const x=p.querySelector('.cx');if(x)x.onclick=()=>{ctrlOpen=false;ctrlDraw()}}
  if(bar){r.innerHTML=CTRL_IDS.map(id=>`<button data-id="${id}" class="${devLocked(id)?'lock':''}" title="${CTRL_NOM[id][1]}"><span class="ci">${CTRL_NOM[id][0]}</span><span class="cs2">${id==='thermo'&&!devLocked(id)?fr1(temp())+'°':ctrlEtat(id).replace('auto · ','⏱ ')}</span></button>`).join('');
    r.querySelectorAll('button').forEach(bt=>bt.onclick=()=>openDev(bt.dataset.id))}}
// mise à jour de l'état chaque seconde (sauf pendant qu'on manipule un réglage)
setInterval(()=>{if(CTRL==='aucun')return;if(performance.now()<ctrlBusy){const p=$('ctrl');if(p)for(const s of p.querySelectorAll('.cs'))s.querySelector('.cst').textContent=ctrlEtat(s.dataset.id);return}ctrlDraw()},1000);
// le panneau large prend de la place à droite : la zone de jeu se réduit d'autant
const resize1=resize;resize=function(){resize1();if(CTRL==='panneau'&&ctrlOn()&&ctrlWide()){CVR+=318;W=window.innerWidth-CVL-CVR;cv.width=W*DPR;cv.style.width=W+'px';if(COLS)camFit()}};
let ctrlLast='';setInterval(()=>{const k=CTRL+'|'+ctrlOn()+'|'+ctrlWide();if(k!==ctrlLast){ctrlLast=k;resize();ctrlDraw()}},300);

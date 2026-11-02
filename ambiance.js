// ================= FINITIONS : AMBIANCE SONORE, MUSIQUE DU MENU, PHOTO, TUBES ANIMÉS, GAUCHER, SAISONS =================
if(OPT.amb===undefined)OPT.amb=true;if(OPT.left===undefined)OPT.left=false;if(OPT.seasons===undefined)OPT.seasons=false;
// ---------- styles (mode gaucher, aperçu photo) ----------
(()=>{const st=document.createElement('style');st.textContent=`
body.left #zoomui{right:auto;left:8px}body.left #vnav{left:auto;right:8px;flex-direction:row-reverse}
#photop{z-index:9}#photop img{width:100%;display:block;border-radius:6px;border:1px solid #333;margin:8px 0}#photop a.btn{display:block;text-align:center;text-decoration:none;box-sizing:border-box}
.sais{color:#cfe8a8}`;document.head.appendChild(st)})();
function applyOpt(){const ch=document.body.classList.contains('left')!==!!OPT.left;document.body.classList.toggle('left',!!OPT.left);if(ch&&LAND)window.dispatchEvent(new Event('resize'))}
applyOpt();
const saveOpt1=saveOpt;saveOpt=function(){saveOpt1();applyOpt()};

// ---------- options : Ambiance (Son), Gaucher (Affichage), Saisons (Jeu) ----------
const openOpts1=openOpts;openOpts=function(){openOpts1();const O=$('opts');
  const add=(h3txt,html)=>{const h=[...O.querySelectorAll('h3')].find(e=>e.textContent===h3txt);if(!h)return;let n=h.nextElementSibling;while(n&&n.classList.contains('orow')&&n.nextElementSibling&&n.nextElementSibling.classList.contains('orow'))n=n.nextElementSibling;n.insertAdjacentHTML('afterend',html)};
  add('Son',optRow('🎶 Ambiance et musique',seg('amb',[[true,'Oui'],[false,'Non']])));
  add('Jeu',optRow('🍂 Saisons (bac à sable)',seg('seasons',[[true,'Oui'],[false,'Non']])));
  add('Affichage',optRow('✋ Mode gaucher',seg('left',[[true,'Oui'],[false,'Non']])));
  O.querySelectorAll('[data-o="amb"],[data-o="seasons"],[data-o="left"]').forEach(b=>b.onclick=()=>{OPT[b.dataset.o]=b.dataset.v==='true';if(b.dataset.o==='amb'&&OPT.amb)initAudio();saveOpt();openOpts()})};
$('topt').onclick=openOpts;

// ================= SON D'AMBIANCE =================
// l'audio ne démarre qu'après un geste : on profite du premier toucher
document.addEventListener('pointerdown',()=>{if(soundOn&&OPT.amb&&(!AC||AC.state!=='running'))initAudio()},true);
const AMB={on:false,bus:null,pad:null,padG:null,buzzG:null,buzz:null,mus:null,musDelay:null,nextCri:0,nextNote:0,step:0,deg:3,day:null,lastN:{},nT:0};
function ambBuild(){if(AMB.bus||!AC||!master)return;const t=AC.currentTime;
  AMB.bus=AC.createGain();AMB.bus.gain.value=0;AMB.bus.connect(master);
  // nappe : trois notes tenues, filtrées, qui respirent lentement
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;lp.Q.value=0.3;
  AMB.padG=AC.createGain();AMB.padG.gain.value=0.05;lp.connect(AMB.padG);AMB.padG.connect(AMB.bus);
  const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=0.07;lg.gain.value=0.018;lfo.connect(lg);lg.connect(AMB.padG.gain);lfo.start(t);
  AMB.pad=[0,1,2].map(i=>{const o=AC.createOscillator();o.type=i?'sine':'triangle';o.frequency.value=[130.81,196,293.66][i];o.detune.value=(i-1)*4;const g=AC.createGain();g.gain.value=[0.5,0.35,0.22][i];o.connect(g);g.connect(lp);o.start(t);return o});
  // bourdonnement léger (abeilles, mouches)
  const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=420;bp.Q.value=1.2;AMB.buzzG=AC.createGain();AMB.buzzG.gain.value=0;bp.connect(AMB.buzzG);AMB.buzzG.connect(AMB.bus);
  AMB.buzz=[182,191].map(f=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(bp);o.start(t);return o});
  const vib=AC.createOscillator(),vg=AC.createGain();vib.frequency.value=3.3;vg.gain.value=6;vib.connect(vg);AMB.buzz.forEach(o=>vg.connect(o.frequency));vib.start(t);
  // musique du menu : son propre bus avec un petit écho
  AMB.mus=AC.createGain();AMB.mus.gain.value=0;AMB.mus.connect(master);
  const d=AC.createDelay(1);d.delayTime.value=0.42;const fb=AC.createGain();fb.gain.value=0.33;const dl=AC.createBiquadFilter();dl.type='lowpass';dl.frequency.value=1800;
  AMB.mus.connect(d);d.connect(dl);dl.connect(fb);fb.connect(d);const wet=AC.createGain();wet.gain.value=0.5;dl.connect(wet);wet.connect(master);AMB.musDelay=d}
function panTo(node,p){if(!AC.createStereoPanner){node.connect(AMB.bus);return}const pn=AC.createStereoPanner();pn.pan.value=p;node.connect(pn);pn.connect(AMB.bus)}
function cricket(t){const p=rnd(-0.8,0.8),f=rnd(4100,4700),n=2+(Math.random()*3|0);
  for(let k=0;k<n;k++){const o=AC.createOscillator(),g=AC.createGain(),s=t+k*0.055;o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(0.011,s+0.006);g.gain.exponentialRampToValueAtTime(0.0001,s+0.04);o.connect(g);panTo(g,p);o.start(s);o.stop(s+0.05)}}
function drop(t,x){const o=AC.createOscillator(),g=AC.createGain(),f=rnd(900,1700);o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*0.35,t+0.06);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.02,t+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);o.connect(g);panTo(g,clamp(x,-0.9,0.9));o.start(t);o.stop(t+0.08)}
const SCALE=[130.81,146.83,164.81,196,220,261.63,293.66,329.63,392,440,523.25,587.33];
const BASS=[[65.41,98],[87.31,130.81],[55,82.41],[73.42,110]];
function note(t,f,v,dur,type){const o=AC.createOscillator(),g=AC.createGain();o.type=type||'triangle';o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(AMB.mus);o.start(t);o.stop(t+dur+0.05)}
function musicTick(now){
  while(AMB.nextNote<now+0.4){const t=Math.max(AMB.nextNote,now+0.02);
    if(AMB.step%8===0){const b=BASS[(AMB.step/8|0)%BASS.length];note(t,b[0],0.05,3.6,'sine');note(t+0.02,b[1],0.025,3.4,'sine')}
    if(Math.random()<0.72){AMB.deg=clamp(AMB.deg+[-2,-1,-1,1,1,2,0][Math.random()*7|0],3,SCALE.length-1);note(t,SCALE[AMB.deg],0.045,1.9);if(Math.random()<0.15)note(t+0.45,SCALE[clamp(AMB.deg+2,0,SCALE.length-1)],0.025,1.6)}
    AMB.step++;AMB.nextNote=t+0.62}}
function ambTick(){
  if(!AC||AC.state!=='running')return;ambBuild();if(!AMB.bus)return;const now=AC.currentTime;
  const titleOn=$('title').style.display==='flex',sound=soundOn&&OPT.amb;
  const play=sound&&!titleOn&&state==='play'&&!paused&&lvl;
  AMB.bus.gain.setTargetAtTime(play?1:0,now,0.6);
  // musique du menu
  const mus=sound&&titleOn;AMB.mus.gain.setTargetAtTime(mus?1:0,now,mus?0.8:0.25);
  if(mus){if(AMB.nextNote<now)AMB.nextNote=now+0.1;musicTick(now)}
  if(!play)return;
  const day=isDay();
  if(day!==AMB.day){AMB.day=day;const F=day?[130.81,196,329.63]:[110,164.81,261.63];AMB.pad.forEach((o,i)=>o.frequency.setTargetAtTime(F[i],now,2.5));AMB.padG.gain.setTargetAtTime(day?0.05:0.035,now,2)}
  // grillons la nuit
  if(!day){if(AMB.nextCri<now)AMB.nextCri=now+rnd(0.1,0.6);while(AMB.nextCri<now+0.3){cricket(AMB.nextCri);AMB.nextCri+=rnd(0.35,1.5)}}
  // gouttes quand le brumisateur marche
  if(clouds.length){const n=Math.min(3,clouds.length+1);for(let k=0;k<n;k++)if(Math.random()<0.6){const cl=clouds[k%clouds.length];drop(now+rnd(0.02,0.2),(cl.x/WW)*2-1+rnd(-0.2,0.2))}}
  // bourdonnement selon les abeilles et les mouches (compté 2 fois par seconde)
  AMB.nT-=0.12;if(AMB.nT<=0){AMB.nT=0.5;AMB.lastN=counts()}
  const fly=(AMB.lastN.abeille||0)+(AMB.lastN.mouche||0);
  AMB.buzzG.gain.setTargetAtTime(fly?0.006+0.01*Math.min(1,fly/8):0,now,0.8)}
setInterval(ambTick,120);

// ================= PHOTO DU VIVARIUM =================
(()=>{const b=document.createElement('button');b.id='vnphoto';b.textContent='📷';b.title='Photo';$('vnav').appendChild(b);b.onclick=takePhoto})();
function photoName(){if(lvl&&lvl.sandbox)return lvl.nom||'Bac à sable';return lvl?`Niv. ${lvlIdx+1} · ${lvl.nom}`:'Vivarium'}
function takePhoto(){
  const src=cv,w=src.width,h=src.height;let x0=0,y0=0,x1=w,y1=h;
  // recadre : on enlève les bords noirs autour du vivarium
  try{const d=mainCtx.getImageData(0,0,w,h).data,lit=(x,y)=>{const i=(y*w+x)*4;return d[i]+d[i+1]+d[i+2]>40};
    const rowLit=y=>{for(let x=0;x<w;x+=3)if(lit(x,y))return true;return false},colLit=x=>{for(let y=y0;y<y1;y+=3)if(lit(x,y))return true;return false};
    while(y0<h-10&&!rowLit(y0))y0+=2;while(y1>y0+10&&!rowLit(y1-1))y1-=2;while(x0<w-10&&!colLit(x0))x0+=2;while(x1>x0+10&&!colLit(x1-1))x1-=2;
    const m=Math.round(8*DPR);x0=Math.max(0,x0-m);y0=Math.max(0,y0-m);x1=Math.min(w,x1+m);y1=Math.min(h,y1+m);if(x1-x0<w*0.3||y1-y0<h*0.2){x0=0;y0=0;x1=w;y1=h}}catch(e){}
  const cw=x1-x0,ch=y1-y0,P=Math.round(14*DPR),TB=Math.round(46*DPR),out=document.createElement('canvas');out.width=cw+P*2;out.height=ch+P*2+TB;
  const g=out.getContext('2d');g.fillStyle='#14110d';g.fillRect(0,0,out.width,out.height);
  g.strokeStyle='#6a4a2c';g.lineWidth=P*0.5;g.strokeRect(P*0.25,P*0.25,out.width-P*0.5,out.height-P*0.5);
  g.fillStyle='#000';g.fillRect(P,P,cw,ch);g.drawImage(src,x0,y0,cw,ch,P,P,cw,ch);g.strokeStyle='#ffe94d55';g.lineWidth=DPR;g.strokeRect(P-DPR,P-DPR,cw+DPR*2,ch+DPR*2);
  const dt=new Date(),date=dt.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' · '+dt.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  g.textBaseline='middle';g.fillStyle='#e8ffd8';g.font=`700 ${Math.round(15*DPR)}px Georgia,serif`;const ty=P+ch+TB/2+P*0.3;
  const txt=`Vivariom — ${photoName()} — ${date}`;let fs=15;while(fs>8&&g.measureText(txt).width>out.width-P*2){fs--;g.font=`700 ${Math.round(fs*DPR)}px Georgia,serif`}
  g.textAlign='center';g.fillText(txt,out.width/2,ty);
  const url=out.toDataURL('image/png'),pad=n=>String(n).padStart(2,'0'),file=`vivariom-${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}-${pad(dt.getHours())}${pad(dt.getMinutes())}.png`;
  let O=$('photop');if(!O){O=document.createElement('div');O.id='photop';O.className='ov';document.body.appendChild(O)}
  O.innerHTML=`<div class="box"><div class="mhead"><h1>📷 Photo</h1><button class="back" id="phclose">Fermer</button></div><img src="${url}" alt="Photo du vivarium"><button class="btn" id="phdl">⬇ Enregistrer (PNG)</button><p class="dim" id="phmsg">Tu peux aussi garder le doigt appuyé sur l'image pour l'enregistrer.</p></div>`;
  O.style.display='flex';$('phclose').onclick=()=>{O.style.display='none'};flashCam();
  $('phdl').onclick=async()=>{const m=$('phmsg');try{const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;
      if(!dl){const A=document.createElement('a');A.href=url;A.download=file;document.body.appendChild(A);A.click();A.remove();m.textContent="✔ Photo téléchargée (sinon, garde le doigt appuyé sur l'image).";return}
      const blob=await new Promise(r=>out.toBlob(r,'image/png'));const res=await dl.save({filename:file,data:blob});m.textContent=res.status==='saved'?'✔ Photo enregistrée':'✔ Photo envoyée'}
    catch(e){m.textContent=e&&e.code==='declined'?'Enregistrement annulé.':"L'enregistrement n'a pas marché : garde le doigt appuyé sur l'image."}}}
function flashCam(){const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;background:#fff;z-index:30;pointer-events:none;opacity:.8;transition:opacity .35s';document.body.appendChild(f);requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.opacity=0}));setTimeout(()=>f.remove(),450)}

// ================= BÊTES DANS LES TUBES (grande salle) =================
const TUBEFX=[];
const migrateTick1=migrateTick;migrateTick=function(dt){
  if(!(lvl&&lvl.sandbox&&curViv)||migT+dt<1){migrateTick1(dt);return}
  const L=linksOf(curViv),before=L.map(id=>LS.get('biome_transit_'+id,[]).length);migrateTick1(dt);
  L.forEach((id,i)=>{const n=LS.get('biome_transit_'+id,[]).length-before[i];if(n>0){const tr=LS.get('biome_transit_'+id,[]),last=tr[tr.length-1];
    for(let q=0;q<Math.min(n,3)&&TUBEFX.length<6;q++)TUBEFX.push({from:curViv.id,to:id,ic:last&&FICHES[baseOf(last.sp)]?FICHES[baseOf(last.sp)].ic:''})}})};
const drawRoom1=drawRoom;drawRoom=function(){drawRoom1();if(roomMode!=='salle'||!TUBEFX.length)return;const R=$('roomin');let h='';
  // l'animation dure quelques secondes ; elle survit aux redessins de la salle pendant ce temps
  const now=Date.now();for(let i=TUBEFX.length-1;i>=0;i--){if(TUBEFX[i].until==null)TUBEFX[i].until=now+6500;else if(TUBEFX[i].until<now)TUBEFX.splice(i,1)}
  TUBEFX.forEach((f,q)=>{const A=ROOM.list.find(o=>o.id===f.from),B=ROOM.list.find(o=>o.id===f.to);if(!A||!B||!linksOf(A).includes(B.id))return;
    // même tracé que le tube : du premier bac de la liste vers l'autre
    const ia=ROOM.list.indexOf(A),ib=ROOM.list.indexOf(B),v=ia<ib?A:B,o=v===A?B:A,a=slotOf(v),b=slotOf(o);if(!a||!b)return;
    const x1=a.x+G.VW*0.75,y1=a.y+6,x2=b.x+G.VW*0.25,y2=b.y+6,mx=(x1+x2)/2,my=Math.min(y1,y2)-40,rev=v!==A,beg=(0.3+q*0.9).toFixed(2);
    const mo=`<animateMotion dur="1.8s" begin="${beg}s" repeatCount="3" fill="remove" path="M${x1},${y1} Q${mx},${my} ${x2},${y2}"${rev?' keyPoints="1;0" keyTimes="0;1" calcMode="linear"':''}/>`;
    h+=`<svg class="tubesvg tubefx" style="left:0;top:0" width="${RW}" height="${RH}"><defs><radialGradient id="tg${q}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffe94d"/><stop offset="1" stop-color="#ffe94d" stop-opacity="0"/></radialGradient></defs>
      <g opacity="0"><circle r="9" fill="url(#tg${q})"/><circle r="2.6" fill="#fff"/>${mo}<set attributeName="opacity" to="1" begin="${beg}s" dur="5.4s"/></g></svg>`});
  if(h){R.insertAdjacentHTML('beforeend',h);setTimeout(()=>R.querySelectorAll('.tubefx').forEach(e=>e.remove()),9000)}};

// ================= SAISONS DOUCES (bac à sable) =================
const SEASONS=[{nom:'Printemps',ic:'🌸',light:1.0,t:0,col:[1,1.04,1]},{nom:'Été',ic:'☀',light:1.12,t:2,col:[1.06,1.02,0.92]},{nom:'Automne',ic:'🍂',light:0.9,t:-1,col:[1.06,0.96,0.86]},{nom:'Hiver',ic:'❄',light:0.78,t:-3,col:[0.9,0.97,1.08]}];
const SEAS_LEN=300; // 4 × 5 min = 20 min réelles
function seasonOn(){return !!(OPT.seasons&&lvl&&lvl.sandbox&&state!=='menu')}
function season(){const s=(Date.now()/1000)%(SEAS_LEN*4);return {S:SEASONS[Math.floor(s/SEAS_LEN)],left:SEAS_LEN-(s%SEAS_LEN)}}
const lightAmt1=lightAmt;lightAmt=function(){const v=lightAmt1();return seasonOn()?v*season().S.light:v};
const temp1=temp;temp=function(){const v=temp1();return seasonOn()?v+season().S.t:v};
const lightRGB1=lightRGB;lightRGB=function(){const L=lightRGB1();if(!L||!seasonOn())return L;const S=season().S;return [Math.min(255,L[0]*S.col[0])|0,Math.min(255,L[1]*S.col[1])|0,Math.min(255,L[2]*S.col[2])|0,L[3]*(0.85+0.15*S.light)]};
// floraison : plus vite au printemps, plus d'abondance l'été, les fleurs se ferment peu à peu en hiver
setInterval(()=>{if(!seasonOn()||paused)return;const nm=season().S.nom;
  for(const p of plants){if(!p.alive)continue;const f=p.fl;
    if(nm==='Printemps'&&f.t>0)f.t=Math.max(0,f.t-0.5*speed);
    else if(nm==='Été'&&f.open)f.nectar=Math.min(3,f.nectar+0.05*speed);
    else if(nm==='Hiver'&&f.open&&!f.poll&&Math.random()<0.015*speed){f.open=false;f.t=25}
    else if(nm==='Automne'&&f.open&&!f.poll&&Math.random()<0.004*speed){f.open=false;f.t=20}}},1000);
const hud1=hud;hud=function(){hud1();if(!seasonOn())return;const r=hudEl.querySelector('.row');if(!r)return;const {S,left}=season();
  r.insertAdjacentHTML('beforeend',`<span class="sais">${S.ic} ${S.nom} <span class="dim">· encore ${Math.ceil(left/60)} min</span></span>`)};
window.__amb=()=>({ac:AC?AC.state:null,bus:!!AMB.bus,step:AMB.step,day:AMB.day,cri:AMB.nextCri>0,buzz:AMB.buzzG?AMB.buzzG.gain.value:0,mus:AMB.mus?AMB.mus.gain.value:0,amb:AMB.bus?AMB.bus.gain.value:0});

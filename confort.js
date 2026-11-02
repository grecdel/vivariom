// ================= INTERFACE ET CONFORT (lot 5) =================
// tutoriel plus court avec une main qui montre où toucher, annuler la dernière pose, suivre une bête,
// loupe animée, accessibilité (texte, contraste, daltonisme), sons plus riches, vibrations.

// ---------- 34. tutoriel : plus court, une main qui tapote la cible ----------
{const i=TSTEPS.findIndex(s=>s.h==='Les vues');if(i>=0)TSTEPS.splice(i,1)}
tuEl.insertAdjacentHTML('beforeend','<div class="thand">👆</div>');
const tuHand=tuEl.querySelector('.thand');
{const tp=tuPlace;tuPlace=function(r,free){tp(r,free);const S=TSTEPS[TU.i];if(!r||!S||!S.todo){tuHand.style.display='none';return}
  tuHand.style.display='block';tuHand.style.left=Math.round(r.x+r.w/2-14)+'px';tuHand.style.top=Math.round(r.y+r.h/2-4)+'px'}}

// ---------- 41. vibrations ----------
const vib=p=>{if(OPT.vib&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};
{const w=win;win=function(){w();vib([40,60,40,60,160])}}
{const l=lose;lose=function(m){l(m);vib([220])}}
{const a=ach;ach=function(k){const had=ACH[k];a(k);if(!had&&ACH[k])vib([30,40,30])}}
let vibNaissT=0;
{const bv=born;born=function(id,x,y,o){const b=bv(id,x,y,o);if(state==='play'&&performance.now()-vibNaissT>8000&&b&&b.sp&&b.sp.id!=='puceron'&&b.sp.id!=='mouche'&&b.sp.id!=='fourmi'){vibNaissT=performance.now();vib(18)}return b}}
{const d=die;die=function(c,by){const was=c.dead;d(c,by);if(!was&&c.dead&&state==='play'){if(c===selC||c===FOLLOW)vib([60,40,60]);
  if(c===FOLLOW){FOLLOW=null;suivreUI()}}}}

// ---------- 35. annuler la dernière pose ----------
let ANNUL=null;
document.body.insertAdjacentHTML('beforeend','<button id="undo" title="Annuler la dernière pose">↶<span> Annuler</span></button>');
{const ta=tapAction;tapAction=function(x,y){const c0=new Set(creatures),p0=new Set(plants),i0=new Set(items),s0=Object.assign({},stock),t=tool;ta(x,y);
  const C=creatures.filter(c=>!c0.has(c)),P=plants.filter(p=>!p0.has(p)),I=items.filter(it=>!i0.has(it)&&it.type==='litiere');
  if(C.length||P.length||I.length){ANNUL={C,P,I,stock:s0,t:performance.now(),nom:t};majUndo()}}}
function majUndo(){const b=$('undo');try{const r=$('viewsw').getBoundingClientRect();if(r.bottom>0)b.style.top=Math.round(r.bottom+6)+'px'}catch(e){}const ok=ANNUL&&state==='play'&&performance.now()-ANNUL.t<20000;b.style.display=ok&&!document.body.classList.contains('obs')?'block':'none'}
setInterval(majUndo,1000);
$('undo').onclick=()=>{if(!ANNUL)return;const A=ANNUL;ANNUL=null;
  for(const c of A.C){c.dead=true;if(c.col&&c.sp.id==='reine'&&c.col.queen!==c&&!creatures.some(o=>!o.dead&&o.col===c.col&&o!==c)){c.col.dead=true}}
  creatures=creatures.filter(c=>!c.dead);
  for(const p of A.P){p.alive=false;for(let r=0;r<p.h;r++){const k=K(p.col,p.base-r);if(k>=0&&STEM[k]>0)STEM[k]--}}plants=plants.filter(p=>p.alive);
  for(const it of A.I)it.dead=true;items=items.filter(it=>!it.dead);
  if(!lvl.sandbox&&A.nom&&stock[A.nom]!=null)stock[A.nom]+=1;refreshPalette();say('↶ Dernière pose annulée');majUndo()};

// ---------- 36. suivre une bête (appui long) ; 37. loupe ----------
let FOLLOW=null,lpT=0;
document.body.insertAdjacentHTML('beforeend','<div id="suivi"><span id="suivn"></span><button id="sloupe">🔍 Loupe</button><button id="sstop">✕</button></div>');
function suivreUI(){const S=$('suivi');if(!FOLLOW||FOLLOW.dead||state!=='play'){S.style.display='none';return}
  S.style.display='flex';$('suivn').textContent=`🎥 ${FICHES[FOLLOW.sp.id]?FICHES[FOLLOW.sp.id].ic:''} ${FOLLOW.sp.vnom||(FICHES[FOLLOW.sp.id]||{}).nom||''}`}
function suivre(c){FOLLOW=c;selC=c;if(view==='side'&&camZ<fitZ*3){camZ=Math.min(18,fitZ*3.2)}suivreUI();vib(25);say('🎥 Tu suis cette bête · fais glisser l\'écran pour arrêter')}
function beteSous(sx,sy){const [wx,wy]=s2w(sx,sy);let b=null,bd=Math.max(8,22/camZ);for(const c of creatures){if(c.dead)continue;const d=Math.hypot(c.x-wx,c.y-wy);if(d<bd){bd=d;b=c}}return b}
cv.addEventListener('pointerdown',e=>{clearTimeout(lpT);if(view!=='side')return;const x=e.clientX-CVL,y=e.clientY;
  lpT=setTimeout(()=>{if(!gest||gest.pinch||gest.moved||pts.size!==1)return;const c=beteSous(x,y);if(!c)return;gest=null;suivre(c)},550)});
cv.addEventListener('pointermove',e=>{if(gest&&gest.moved){clearTimeout(lpT);if(FOLLOW){FOLLOW=null;suivreUI()}}});
cv.addEventListener('pointerup',()=>clearTimeout(lpT));
$('sstop').onclick=()=>{FOLLOW=null;suivreUI()};
{const d0=draw;draw=function(){if(FOLLOW&&!FOLLOW.dead&&view==='side'&&state==='play'){camX+=(FOLLOW.x-camX)*0.12;camY+=(FOLLOW.y-camY)*0.12;camClamp()}d0()}}
{const sl=startLevel;startLevel=function(i){FOLLOW=null;ANNUL=null;sl(i);suivreUI()}}
{const ev=enterViv;enterViv=function(v){FOLLOW=null;ANNUL=null;ev(v);ANNUL=null;majUndo();suivreUI()}}
let LOUPE=null;
function ouvrirLoupe(c){if(!c)return;const O=ovl('loupep'),F=FICHES[c.sp.id]||{},R=REAL[c.sp.id];
  O.innerHTML=`<div class="box"><div class="mhead"><h1>🔍 ${F.ic||''} ${c.sp.vnom||F.nom||''}</h1><button class="back" id="lclose">Fermer</button></div>
   <canvas id="lcv" width="600" height="340"></canvas><p class="dim" id="lmis"></p>
   ${R?`<p>📏 Taille réelle : environ <b>${R[0]>=10?(R[0]/10).toString().replace('.',',')+' cm':R[0]+' mm'}</b></p>`:''}${F.mange?`<p>🍽 ${F.mange}</p>`:''}${F.comp?`<p class="dim">${F.comp}</p>`:''}</div>`;
  $('lclose').onclick=()=>{O.style.display='none';LOUPE=null};LOUPE=c;const lc=$('lcv').getContext('2d');
  const loop=()=>{if(LOUPE!==c||O.style.display==='none')return;if(c.dead){$('lmis').textContent='✝ Cette bête est morte.';return}
    lc.setTransform(1,0,0,1,0,0);lc.fillStyle='#0b120b';lc.fillRect(0,0,600,340);const L=Math.max(3,realLen(c)),k=Math.min(28,400/L);
    const keep=ctx;ctx=lc;try{lc.setTransform(k,0,0,k,300-c.x*k,200-c.y*k);if(drawChrysalis(c)){}else drawProfile(c,1,false)}catch(e){}ctx=keep;
    try{$('lmis').textContent=mission(c)}catch(e){}requestAnimationFrame(loop)};loop()}
$('sloupe').onclick=()=>ouvrirLoupe(FOLLOW);

// ---------- 38. accessibilité ----------
if(OPT.texte===undefined)OPT.texte='normal';if(OPT.contraste===undefined)OPT.contraste=false;if(OPT.dalto===undefined)OPT.dalto='non';
document.body.insertAdjacentHTML('beforeend',`<svg width="0" height="0" style="position:absolute"><filter id="fdeut"><feColorMatrix type="matrix" values="0.8 0.2 0 0 0  0.26 0.74 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/><feColorMatrix type="matrix" values="1 0 0 0 0  0.7 0.3 0 0 0  0.7 0 0.3 0 0  0 0 0 1 0"/></filter>
 <filter id="fprot"><feColorMatrix type="matrix" values="0.6 0.4 0 0 0  0.6 0.4 0 0 0  0 0.2 0.8 0 0  0 0 0 1 0"/><feColorMatrix type="matrix" values="1 0 0 0 0  0.5 0.5 0.3 0 0  0.4 0 0.8 0 0  0 0 0 1 0"/></filter></svg>`);
function appliquerAcces(){const B=document.body.classList;B.toggle('grand',OPT.texte==='grand');B.toggle('tgrand',OPT.texte==='tgrand');B.toggle('contraste',!!OPT.contraste);
  B.toggle('dalto-d',OPT.dalto==='deut');B.toggle('dalto-p',OPT.dalto==='prot')}
appliquerAcces();
{const oo=openOpts;openOpts=function(){oo();const h=[...document.querySelectorAll('#opts h3')].find(e=>e.textContent==='Affichage');if(!h)return;
  const seg2=(k,vals)=>`<span class="oseg">${vals.map(([v,l])=>`<button data-acc="${k}" data-v="${v}" class="${String(OPT[k])===String(v)?'on':''}">${l}</button>`).join('')}</span>`;
  const div=document.createElement('div');div.innerHTML=`<div class="orow"><span>🔠 Taille des textes</span>${seg2('texte',[['normal','Normale'],['grand','Grande'],['tgrand','Très grande']])}</div>
   <div class="orow"><span>◐ Contraste fort</span>${seg2('contraste',[[true,'Oui'],[false,'Non']])}</div>
   <div class="orow"><span>🎨 Couleurs (daltonisme)</span>${seg2('dalto',[['non','Normales'],['deut','Vert-rouge'],['prot','Rouge']])}</div>`;
  h.after(...div.children);
  document.querySelectorAll('#opts [data-acc]').forEach(b=>b.onclick=()=>{const k=b.dataset.acc,v=b.dataset.v;OPT[k]=k==='contraste'?v==='true':v;saveOpt();appliquerAcces();resize();openOpts()})}}
// les états « en danger » ne reposent pas que sur la couleur : un symbole en plus
{const h0=hud;hud=function(){h0();if(OPT.dalto!=='non'||OPT.contraste)hudEl.querySelectorAll('.ko').forEach(e=>{if(!e.dataset.sym){e.dataset.sym=1;e.insertAdjacentText('afterbegin','⚠')}})}}

// ---------- 40. sons plus riches : bourdonnements, pluie sur la vitre, pas ----------
let sonT=0;
function bzz(t,f,dur,vol,p){const o=AC.createOscillator(),g=AC.createGain(),lf=AC.createOscillator(),lg=AC.createGain();o.type='sawtooth';o.frequency.value=f;lf.frequency.value=rnd(18,30);lg.gain.value=f*0.04;lf.connect(lg);lg.connect(o.frequency);
  const fl=AC.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f*2;fl.Q.value=1.5;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*0.3);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(fl);fl.connect(g);panTo(g,p);o.start(t);lf.start(t);o.stop(t+dur+0.05);lf.stop(t+dur+0.05)}
function pas(t,p){for(let k=0;k<3;k++){const s=t+k*0.07,n=AC.createBufferSource(),b=AC.createBuffer(1,Math.floor(AC.sampleRate*0.02),AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
  n.buffer=b;const g=AC.createGain(),fl=AC.createBiquadFilter();fl.type='highpass';fl.frequency.value=2500;g.gain.value=0.006;n.connect(fl);fl.connect(g);panTo(g,p);n.start(s)}}
{const up=update;update=function(dt){up(dt);if(typeof AC==='undefined'||!AC||AC.state!=='running'||!soundOn||!OPT.amb||state!=='play'||paused||!AMB.bus)return;sonT-=dt;if(sonT>0)return;sonT=0.5;const t=AC.currentTime+0.02;
  const pan=c=>clamp((c.x/WW)*2-1,-0.9,0.9);
  const vol=creatures.filter(c=>!c.dead&&c.fly&&(c.sp.id==='abeille'||c.sp.id==='mouche'));if(vol.length&&Math.random()<0.35){const c=vol[Math.floor(Math.random()*vol.length)];bzz(t,c.sp.id==='abeille'?rnd(190,230):rnd(280,340),rnd(0.5,1.1),0.004,pan(c))}
  const lourds=creatures.filter(c=>!c.dead&&!c.fly&&c.v>3&&(c.sp.id==='scorpion'||c.sp.id==='rhinoceros'||c.sp.id==='bousier'||c.sp.id==='scolopendre'));if(lourds.length&&Math.random()<0.25)pas(t,pan(lourds[0]));
  if(drops.length>20&&typeof drop==='function')for(let q=0;q<3;q++)drop(t+Math.random()*0.4,rnd(-0.7,0.7))}}
setInterval(suivreUI,500);
if(window.__sim){window.__sim.suivre=()=>{const c=creatures.find(c=>!c.dead&&c.sp.id!=='plante');if(c)suivre(c);return !!FOLLOW};window.__sim.loupe=()=>ouvrirLoupe(FOLLOW||creatures[0]);window.__sim.annul=()=>!!ANNUL;window.__sim.undo=()=>$('undo').click()}

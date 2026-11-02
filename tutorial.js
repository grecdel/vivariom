// ================= TUTORIEL GUIDÉ (premier lancement du niveau 1) =================
// Bulles qui pointent les vrais éléments (halo + flèche). On avance avec « Suivant »
// ou en faisant l'action demandée. 'biome_tuto' en mémoire = déjà vu.
const TU={on:false,i:0,key:'',force:false,mark:null,lastTap:null,raf:0};
const tuEl=$('tuto'),tuHalo=tuEl.querySelector('.thalo'),tuArrow=tuEl.querySelector('.tarrow'),tuBub=tuEl.querySelector('.tbub');
const isShown=el=>!!el&&el.getClientRects().length>0&&el.getBoundingClientRect().width>0;
const elRect=sel=>{const el=document.querySelector(sel);if(!isShown(el))return null;const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}};
const inSide=()=>curView()==='side'&&!anim;
// bande à l'écran entre deux hauteurs du monde, sur toute la largeur du vivarium
function band(y0,y1,minH){const a=w2s(0,y0),b=w2s(WW,y1);let y=a[1],h=b[1]-a[1];if(h<minH){y-= (minH-h)/2;h=minH}
  const x=Math.max(4,a[0]),x2=Math.min(W-4,b[0]);return {x,y,w:x2-x,h}}
const soilBand=()=>{const i=COLS>>1,sy=surfY(i);return band(sy-6,sy+8,34)};
const nozBand=()=>band(Y0-2,Y0+8,30);
const backToSide={r:()=>elRect('#viewsw button[data-v="side"]'),t:'Reviens d\'abord en vue <b>▭ Coupe</b> (en haut à droite).'};
const plantOK=()=>String(tool||'').startsWith('plante');
const TSTEPS=[
 {h:'Ton vivarium',p:'Voici ton vivarium vu <b>en coupe</b>, comme une tranche de gâteau : l\'air en haut, la terre en bas. La ligne qui brille, c\'est la <b>surface du sol</b> : c\'est là que poussent les plantes.',
  r:()=>inSide()?soilBand():null,alt:()=>inSide()?null:backToSide},
 {h:'Le tiroir Jardin',r:()=>{if(plantOK())return null;if(drawer==='jardin')return elRect('#drawer .chip[data-id="plante"]');return elRect('#pal .cat[data-cat="jardin"]')},
  p:()=>drawer==='jardin'?'Le tiroir est ouvert. Prends l\'outil <b>🌱 Planter</b>.':'Tes outils sont rangés dans des tiroirs, en bas de l\'écran. Ouvre le tiroir <b>🌱 Jardin</b>.',
  todo:()=>drawer==='jardin'?'Touche 🌱 Planter':'Touche 🌱 Jardin',need:1,done:plantOK},
 {h:'Planter une pousse',p:'Touche le sol, juste sur la ligne qui brille, pour planter une petite pousse. Laisse un peu de place entre deux plantes.',todo:()=>'Touche la surface du sol',
  r:()=>inSide()?soilBand():null,alt:()=>!inSide()?backToSide:!plantOK()?{r:()=>elRect('#pal .chip[data-id="plante"]')||elRect('#pal .cat[data-cat="jardin"]'),t:'Reprends d\'abord l\'outil <b>🌱 Planter</b>.'}:null,
  need:1,enter:()=>{TU.mark=stock.plante},done:()=>stock.plante<TU.mark},
 {h:'La brume',p:'Les plantes ont soif. Prends <b>💨 Brume</b>, puis touche une des <b>buses</b> grises tout en haut du vivarium : il va pleuvoir un peu. Pas trop : un sol noyé fait pourrir les racines.',
  todo:()=>tool==='pluie'?'Touche une buse en haut':'Touche 💨 Brume',
  r:()=>tool!=='pluie'?(elRect('#pal .chip[data-id="pluie"]')||elRect('#drawer .chip[data-id="pluie"]')||elRect('#pal .cat[data-cat="jardin"]')):inSide()?nozBand():null,
  need:1,alt:()=>tool==='pluie'&&!inSide()?backToSide:null,enter:()=>{TU.lastTap=null},done:()=>TU.lastTap==='pluie'},
 {h:'Ton objectif',p:'En haut : le <b>niveau</b>, la <b>barre de progression</b> et le <b>chrono</b>. Le chrono n\'avance que si toutes les espèces vont bien. Ici : au moins 5 plantes pendant 1 minute.',r:()=>{const r=elRect('#hud');return r&&{x:r.x+4,y:r.y+2,w:r.w-8,h:Math.min(r.h,62)}}},
 {h:'Les vues',p:'Ces boutons changent la façon de regarder : <b>▭ Coupe</b> (la tranche), <b>◪ 3/4</b> (en relief) et <b>◉ Dessus</b> (vu d\'en haut). Tu pourras les essayer plus tard.',r:()=>elRect('#viewsw')},
 {h:'La main libre',p:'Avec <b>✋ Main</b>, tu ne poses rien : tu <b>touches une bête</b> pour la choisir, puis un endroit pour l\'y <b>guider</b>. Ici il n\'y a que des plantes, mais ça servira dès le niveau suivant !',
  todo:()=>'Touche ✋ Main (ou « Suivant »)',r:()=>elRect('#pal [data-hand]'),enter:()=>{TU.mark=tool},done:()=>!!TU.mark&&!tool},
 {h:'Le journal',p:'Le <b>📓 journal</b> raconte tout ce qui se passe : naissances, disparitions, pluies… Ouvre-le quand tu te demandes ce qui est arrivé. Bon jeu !',
  todo:()=>'Touche 📓 ou « Terminer »',r:()=>elRect('#vnjournal'),done:()=>isShown($('journal')),last:true}];
function tuPlace(r,free){const bh=tuBub.offsetHeight||150;
  if(!r){tuHalo.style.display='none';tuArrow.style.display='none';tuBub.style.top=Math.round((H-bh)/2)+'px';return}
  const pad=6;tuHalo.style.display='block';tuHalo.classList.toggle('free',!!free);
  Object.assign(tuHalo.style,{left:(r.x-pad)+'px',top:(r.y-pad)+'px',width:(r.w+pad*2)+'px',height:(r.h+pad*2)+'px'});
  const cx=r.x+r.w/2,below=r.y+r.h/2<H*0.45;let top;
  tuArrow.style.display='block';tuArrow.className='tarrow '+(below?'up':'dn');
  if(below){tuArrow.style.top=(r.y+r.h+pad+4)+'px';top=r.y+r.h+pad+24}else{tuArrow.style.top=(r.y-pad-20)+'px';top=r.y-pad-24-bh}
  tuArrow.style.left=(CVL+clamp(cx,16,W-16)-12)+'px';
  tuBub.style.top=Math.round(clamp(top,8,H-bh-8))+'px'}
function tuRender(S,alt){const txt=alt?alt.t:(typeof S.p==='function'?S.p():S.p),todo=alt?'':S.todo?S.todo():'';
  const key=TU.i+'|'+txt+'|'+todo;if(key===TU.key)return;TU.key=key;
  tuBub.innerHTML=`<h3>${S.h}</h3><p>${txt}</p>${todo?`<p class="tdo">👉 ${todo}</p>`:''}<div class="tbtns2"><span class="tstep">${TU.i+1} / ${TSTEPS.length}</span><button class="tskip">Passer le tutoriel</button>${S.need?'':`<button class="tnext">${S.last?'Terminer':'Suivant ›'}</button>`}</div>`;
  tuBub.querySelector('.tskip').onclick=()=>endTuto(true);const nx=tuBub.querySelector('.tnext');if(nx)nx.onclick=()=>tuNext()}
function tuGo(i){TU.i=i;TU.key='';const S=TSTEPS[i];if(S.enter)S.enter()}
function tuNext(){if(TU.i>=TSTEPS.length-1){endTuto(true);return}tuGo(TU.i+1)}
function tuLoop(){if(!TU.on)return;
  if(state==='end'){endTuto(true);return}
  if(state!=='play'||lvlIdx!==0||lvl.sandbox){endTuto(false);return}
  const S=TSTEPS[TU.i];
  if(S.done&&S.done()){if(S.last){endTuto(true);return}tuNext();TU.raf=requestAnimationFrame(tuLoop);return}
  const busy=isShown($('fiches'))||isShown($('devp'));tuEl.style.display=busy?'none':'block';
  const alt=S.alt&&S.alt();tuRender(S,alt);tuPlace(alt?alt.r():S.r(),false);
  TU.raf=requestAnimationFrame(tuLoop)}
function startTuto(){TU.on=true;TU.force=false;tool=null;closeDrawer();renderBar();tuGo(0);tuEl.style.display='block';cancelAnimationFrame(TU.raf);TU.raf=requestAnimationFrame(tuLoop)}
function endTuto(seen){if(seen)LS.set('biome_tuto',1);const was=TU.on;TU.on=false;cancelAnimationFrame(TU.raf);tuEl.style.display='none';
  if(was&&seen&&state==='play')say('🎓 Tutoriel terminé ! Tu peux le revoir depuis l\'écran titre.',true)}
// repérer l'outil utilisé à chaque toucher
const tapAction0=tapAction;tapAction=function(x,y){const t=tool;tapAction0(x,y);if(TU.on)TU.lastTap=t};
// déclenchement : « Commencer » du niveau 1, la première fois (ou via « Revoir le tutoriel »)
$('bgo').addEventListener('click',()=>{if(lvlIdx===0&&lvl&&!lvl.sandbox&&(TU.force||!LS.get('biome_tuto',null)))setTimeout(startTuto,60)});
const startLevelT=startLevel;startLevel=function(i){if(TU.on)endTuto(false);TUTO_NOSAVE=false;TU.force=false;startLevelT(i)};
$('ttuto').onclick=()=>{startLevel(0);TUTO_NOSAVE=true;TU.force=true;$('bgo').click()};
window.__tuto={get on(){return TU.on},get step(){return TU.i},next:()=>tuNext(),skip:()=>endTuto(true)};

// ================= SOINS : expliquer et endiguer maladies et moisissures =================
// Quand un champignon rend une bête malade ou que des moisissures apparaissent :
// - en Facile (et en mode enfant, et la première fois dans un bac) : une carte d'aide pas à pas,
//   avec un bouton « Le faire pour moi » ; la guérison est aussi plus rapide ;
// - en Normal / Expert : un message court et un compteur 🍄 dans le HUD (toucher = l'aide).
const aideForte=()=>!!(OPT.enfant||(lvl&&!lvl.sandbox&&DIFF==='facile'));
let soinVu={},soinAuto=0;
document.body.insertAdjacentHTML('beforeend','<div id="soin"></div>');
function malades(){return creatures.filter(c=>!c.dead&&c.malade)}
function moisi(){if(!MOI||MOI.length!==COLS)return 0;let n=0;for(let i=0;i<COLS;i++)if(MOI[i]>0.4)n++;return n}
function soinCarte(type){const S=$('soin'),enf=!!OPT.enfant,m=malades().length,mo=moisi();
  const titre=type==='moisi'?'🧫 Des moisissures sur le sol':`🍄 ${m>1?m+' bêtes sont malades':'Une bête est malade'}`;
  const pourquoi=enf?'Le sol est trop mouillé : un petit champignon pousse.':'Un champignon pousse quand le sol reste détrempé trop longtemps. Il affaiblit les bêtes et peut passer de l\'une à l\'autre.';
  const etapes=enf?['💨 Arrête la pluie un moment.','🌀 Ouvre la fenêtre du bac (ventilation).','💡 Laisse la lumière allumée : elle sèche le sol.','✋ Éloigne la bête malade de ses amies.']
    :['💨 Arrête de brumiser : coupe le programmateur du brumisateur un moment.',`🌀 Ouvre la ventilation${devLocked('vent')?' (pas encore débloquée ici)':''} pour sécher l'air.`,'💡 Garde la lumière allumée : elle chauffe et sèche le sol.',type==='moisi'?'🍂 Les moisissures mangent la litière et abîment les plantes : elles partent quand le sol sèche.':'✋ Isole la bête malade : prends ✋ Main, touche-la, puis touche un coin sec, loin des autres.'];
  S.innerHTML=`<button class="sx" id="soinx">✕</button><b>${titre}</b><p>${pourquoi}</p><p><u>${enf?'Pour l\'aider':'Pour l\'endiguer'}</u></p><ol>${etapes.map(e=>`<li>${e}</li>`).join('')}</ol>
   <p class="dim">${enf?'Quand le sol est sec, la bête guérit toute seule.':'La bête guérit quand le sol redevient sec (humidité du sol sous 45 %). '+(mo?`Moisissures sur ${mo} endroit${mo>1?'s':''}.`:'')}</p>
   <div class="sbtn">${aideForte()||lvl.sandbox?'<button class="btn" id="soinauto">🪄 Le faire pour moi</button>':''}<button class="btn2" id="soinok">J'ai compris</button></div>`;
  S.style.display='block';$('soinx').onclick=$('soinok').onclick=()=>{S.style.display='none'};
  const a=$('soinauto');if(a)a.onclick=()=>{soigner();S.style.display='none'}}
function soigner(){const avant=DEV.mist.auto;DEV.mist.auto=false;if(!devLocked('vent'))DEV.vent.open=true;DEV.spot.on=true;soinAuto=60;soinAuto0=avant;
  // les bêtes malades sont écartées vers l'endroit le plus sec
  let best=0,bw=9;for(let i=4;i<COLS-4;i+=2){const w=WET[K(i,Math.min(ROWS-1,SURF[i]))];if(w<bw){bw=w;best=i}}
  for(const c of malades())if(!c.fly&&c.sp.id!=='reine'){c.path=null;goTo(c,k=>Math.abs((k%COLS)-best)<=3,9000)}
  say('🪄 Brumisateur en pause 1 min, ventilation ouverte, lumière allumée : le sol va sécher.');try{openDev(null)}catch(e){}}
let soinAuto0=true,soinT=0;
{const up=update;update=function(dt){up(dt);if(state!=='play')return;
  if(soinAuto>0){soinAuto-=dt;if(soinAuto<=0&&soinAuto0&&lvl.showers!==false){DEV.mist.auto=true;say('💨 Le programmateur du brumisateur se remet en marche.')}}
  soinT-=dt;if(soinT>0)return;soinT=1;const M=malades();
  // en aide forte : guérison plus rapide dès que le sol sèche, contagion freinée
  if(aideForte())for(const c of M){const i=clamp(Math.floor(c.x/CS),0,COLS-1),j=clamp(Math.floor((c.y-Y0)/CS)+1,0,ROWS-1);if((WET[K(i,j)]||0)<0.6&&Math.random()<0.12){c.malade=false;c.malT=0;c.humT=0;jlog('💚',`${nm(c)} est guéri(e)`)}}
  const cle=(lvl.sandbox?'s'+(curViv&&curViv.id):'n'+lvlIdx);
  if(M.length&&!soinVu[cle+'m']){soinVu[cle+'m']=1;if(aideForte()||(lvl.sandbox&&!LS.get('biome_soin_vu',0))){LS.set('biome_soin_vu',1);soinCarte('malade')}else say('🍄 Une bête est malade : le sol est trop humide. Touche 🍄 en haut pour savoir quoi faire.')}
  if(moisi()>4&&!soinVu[cle+'o']){soinVu[cle+'o']=1;if(aideForte())soinCarte('moisi')}}}
// compteur dans le HUD : touche-le pour l'aide
{const h0=hud;hud=function(){h0();if(state!=='play')return;const m=malades().length,mo=moisi();if(!m&&mo<=4)return;
  const r=hudEl.querySelector('.row:nth-child(2)')||hudEl.firstElementChild;if(!r)return;
  r.insertAdjacentHTML('beforeend',`<span class="soinchip" data-soin="1">${m?'🍄'+m:''}${mo>4?' 🧫':''} <u>soigner</u></span>`)}}
hudEl.addEventListener('click',e=>{if(e.target.closest('[data-soin]'))soinCarte(malades().length?'malade':'moisi')});
{const sl=startLevel;startLevel=function(i){soinVu={};soinAuto=0;$('soin').style.display='none';sl(i)}}
{const ev=enterViv;enterViv=function(v){soinVu={};soinAuto=0;$('soin').style.display='none';ev(v)}}
// la mission de la bête malade dit quoi faire
{const m0=mission;mission=function(c){const s=m0(c);return c&&c.malade?s+' — fais sécher le sol pour qu\'elle guérisse':s}}
// une fiche « Maladies et moisissures » dans l'encyclopédie
{const of=openFiches;openFiches=function(){of();const G=$('fgrid');if(!G||G.querySelector('.card.sante'))return;
  G.insertAdjacentHTML('afterbegin',`<div class="card sante"><b>🍄 Maladies et moisissures</b><span class="badge">Santé du vivarium</span>
   <p><u>D'où ça vient</u> Un sol détrempé trop longtemps : un champignon blanc pousse sur les bêtes (elles s'affaiblissent et peuvent contaminer leurs voisines de la même espèce) et des moisissures couvrent le sol (elles abîment les plantes).</p>
   <p><u>Qui ne craint rien</u> Les amis de l'humidité : lombrics, escargots, cloportes, vers luisants.</p>
   <p><u>Comment l'endiguer</u> Brumiser moins, ouvrir la ventilation, garder la lumière, écarter la bête malade des autres. Elle guérit quand le sol redevient sec.</p>
   <p class="anec">💡 Dans la nature aussi, l'humidité confinée favorise les champignons : c'est pour ça que les éleveurs aèrent leurs terrariums.</p></div>`)}}
if(window.__sim){window.__sim.soin=t=>soinCarte(t||'malade');window.__sim.rendreMalade=()=>{const c=creatures.find(c=>!c.dead&&!c.fly&&!['lombric','escargot','cloporte','luciole'].includes(c.sp.id));if(c){c.malade=true;c.malT=0}return !!c}}

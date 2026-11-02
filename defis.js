// ---------- défi de la campagne : difficulté, objectif de naissances, coups durs, étoiles ----------
// Facile : comme avant. Normal / Expert : réserves réduites, des naissances à obtenir avant que le chrono avance,
// et des coups durs annoncés (canicule, nuit froide, panne du programmateur, invasion de pucerons, intrus).
const DIFFS={
  facile:{nom:'Facile',ic:'🌱',txt:'On découvre les espèces tranquillement : il suffit de les garder en vie.',stock:1,naiss:0,coups:0},
  normal:{nom:'Normal',ic:'🌿',txt:'Réserves plus justes, des naissances à obtenir, quelques coups durs.',stock:0.75,naiss:1,coups:1},
  expert:{nom:'Expert',ic:'🔥',txt:'Réserves de moitié, deux fois plus de naissances, coups durs fréquents.',stock:0.5,naiss:2,coups:2}};
let DIFF=LS.get('biome_diff','normal');if(!DIFFS[DIFF])DIFF='normal';
const enDefi=()=>lvl&&!lvl.sandbox&&lvlIdx>=0;
let NAISS=0,NAISSP={},EVT=null,EVTnext=0,EVTpasses=0,EVTperdus=0,EVTlog=[];
// objectif de naissances : au moins une naissance (deux en Expert) pour chaque espèce animale du niveau.
// Pas pour les pucerons et les mouches (ils pullulent tout seuls), ni pour les espèces très lentes à se reproduire
// (scorpion, rhinocéros, bousier, scolopendre, araignée : cocon long à éclore et énergie très élevée pour pondre).
const NAISS_EXCLUES=['plante','puceron','mouche','scorpion','rhinoceros','bousier','scolopendre','araignee'];
const espNaiss=id=>({reine:'fourmi',chenille:'papillon',verfarine:'tenebrion',verblanc:'rhinoceros'})[id]||id;
function especesNaiss(){if(!enDefi()||lvlIdx<2||!DIFFS[DIFF].naiss)return [];return lvl.goal.alive.filter(id=>!NAISS_EXCLUES.includes(id))}
function objNaiss(){return especesNaiss().length*DIFFS[DIFF].naiss}
function naissOk(){const k=DIFFS[DIFF].naiss;return especesNaiss().every(id=>(NAISSP[id]||0)>=k)}
// les naissances comptent pendant la partie (pas les bêtes posées par le joueur)
const born1=born;born=function(id,x,y,o){const b=born1(id,x,y,o);if(state==='play'&&enDefi()&&b&&b.sp&&!b.intrus){const e=espNaiss(b.sp.id);NAISSP[e]=(NAISSP[e]||0)+1;if(e!=='plante')NAISS++}return b};

// reprise d'une partie : on garde la difficulté, les naissances et les coups durs passés
function resumeExtra(){return {diff:DIFF,NAISSP,NAISS,EVTlog,EVTpasses,EVTperdus}}
function resumeApply(X){if(!X)return;if(DIFFS[X.diff])DIFF=X.diff;NAISSP=X.NAISSP||{};NAISS=X.NAISS||0;EVTlog=X.EVTlog||[];EVTpasses=X.EVTpasses||0;EVTperdus=X.EVTperdus||0}
// ----- départ d'un niveau : réserves selon la difficulté, compteurs à zéro -----
const startLevel1=startLevel;startLevel=function(i){startLevel1(i);NAISS=0;NAISSP={};EVT=null;EVTpasses=0;EVTperdus=0;EVTlog=[];
  const D=DIFFS[DIFF];EVTnext=D.coups?rnd(45,70):1e9;
  if(D.stock<1){for(const k in lvl.stock){if(k==='compost')continue;stock[k]=Math.max(1,Math.round(lvl.stock[k]*(k==='pluie'?Math.max(0.75,D.stock):D.stock)))}
    stock0=Object.keys(lvl.stock).reduce((a,k)=>a+(stock[k]||0),0);refreshPalette()}
  const no=objNaiss(),L=$('lvltxt');
  if(L)L.insertAdjacentHTML('beforeend',`<p class="dim">${D.ic} Difficulté <b>${D.nom}</b>${D.stock<1?` · réserves ×${String(D.stock).replace('.',',')}`:''}${no?` · le chrono n'avance qu'après <b>${DIFFS[DIFF].naiss>1?'deux naissances':'une naissance'} de chaque espèce</b> (${especesNaiss().map(id=>FICHES[id].ic).join(' ')})`:''}${D.coups?' · attention aux <b>coups durs</b> : ils sont annoncés quelques secondes avant':''}.</p>`)};

// ----- objectif : le chrono attend les naissances -----
checkGoal=function(dt){const n=counts(),g=lvl.goal;
  for(const id of g.alive){if(!(n[id]>0)&&!((stock[id]||0)>0)&&everSeen[id]){lose(`Extinction : ${FICHES[id].nom} a disparu et il n'en reste plus en réserve.`);return}if(n[id]>0)everSeen[id]=true}
  let ok=g.alive.every(id=>n[id]>0);
  if(ok&&g.min)for(const id in g.min)if((n[id]||0)<g.min[id])ok=false;
  if(ok&&!naissOk())ok=false;
  if(ok){goalT+=dt;if(goalT>=g.t)win()}else goalT=Math.max(0,goalT-dt*2);
  const missing=g.alive.filter(id=>!(n[id]>0));if(missing.length&&g.alive.every(id=>everSeen[id]))lvlMissed=true;extinctMsg=missing.length?missing.map(id=>FICHES[id].ic).join(' '):''};

// ----- coups durs -----
const COUPS={
  canicule:{ic:'🔥',nom:'Canicule',dur:35,txt:'Il fait très chaud : le sol sèche vite. Brumise et coupe le spot !',ok:()=>true,debut(){},fin(){}},
  froid:{ic:'❄',nom:'Nuit froide',dur:35,txt:'Il fait froid : les bêtes ralentissent. Le tapis chauffant aide.',ok:()=>true,debut(){},fin(){}},
  panne:{ic:'⚡',nom:'Panne du programmateur',dur:45,txt:'Le brumisateur ne se déclenche plus tout seul : brumise à la main.',ok:()=>DEV.mist.auto&&lvl.showers!==false,
    debut(e){e.avant=DEV.mist.auto;DEV.mist.auto=false},fin(e){DEV.mist.auto=e.avant}},
  pucerons:{ic:'🟢',nom:'Invasion de pucerons',dur:30,txt:'Des pucerons arrivent sur les plantes ! Coccinelles ou fourmis peuvent aider.',ok:()=>plants.some(p=>p.alive),
    debut(){const P=plants.filter(p=>p.alive);for(let q=0;q<7&&P.length;q++){const p=P[Math.floor(Math.random()*P.length)],x=p.col*CS+CS/2,y=Y0+(p.base-Math.floor(rnd(2,Math.max(3,p.h))))*CS;const b=born1('puceron',x,y,{energy:20,z:p.z});b.k=findWalk(x,y)}},fin(){}},
  intrus:{ic:'🦂',nom:'Un intrus',dur:40,txt:'Une scolopendre s\'est glissée dans le bac ! Elle repartira bientôt.',ok:()=>creatures.some(c=>!c.dead&&['cloporte','lombric','fourmi','escargot','tenebrion','chenille'].includes(c.sp.id)),
    debut(e){const i=Math.floor(rnd(COLS*0.2,COLS*0.8)),x=i*CS+CS/2,y=surfY(i)-2;const b=born1('scolopendre',x,y,{energy:70});b.k=findWalk(x,y);b.intrus=true;e.bete=b},
    fin(e){if(e.bete&&!e.bete.dead){e.bete.dead=true;jlog('🦂','La scolopendre est repartie')}}}};
const tempCoup=()=>EVT&&EVT.actif?(EVT.id==='canicule'?6:EVT.id==='froid'?-7:0):0;
const tempDefi0=temp;temp=function(){return tempDefi0()+tempCoup()};
function coupsTick(dt){if(!enDefi()||state!=='play'||paused)return;const D=DIFFS[DIFF];if(!D.coups)return;
  if(!EVT){EVTnext-=dt;if(EVTnext>0)return;
    const choix=Object.keys(COUPS).filter(k=>COUPS[k].ok());if(!choix.length){EVTnext=20;return}
    const id=choix[Math.floor(Math.random()*choix.length)];EVT={id,t:6,actif:false,ext0:extinctMsg};
    say(`⚠ Dans quelques secondes : ${COUPS[id].ic} ${COUPS[id].nom} !`);if(OPT.vib&&navigator.vibrate)navigator.vibrate([60,60,60]);return}
  EVT.t-=dt;
  if(!EVT.actif&&EVT.t<=0){EVT.actif=true;EVT.t=COUPS[EVT.id].dur;EVT.perte=false;COUPS[EVT.id].debut(EVT);jlog(COUPS[EVT.id].ic,`Coup dur : ${COUPS[EVT.id].nom}`);say(`${COUPS[EVT.id].ic} ${COUPS[EVT.id].nom} : ${COUPS[EVT.id].txt}`)}
  else if(EVT.actif){if(extinctMsg)EVT.perte=true;
    if(EVT.t<=0){COUPS[EVT.id].fin(EVT);if(EVT.perte)EVTperdus++;else EVTpasses++;EVTlog.push((EVT.perte?'✗ ':'✓ ')+COUPS[EVT.id].nom);
      say(EVT.perte?`${COUPS[EVT.id].ic} Fin du coup dur… une espèce en a souffert.`:`${COUPS[EVT.id].ic} Coup dur surmonté !`);EVT=null;EVTnext=D.coups>1?rnd(40,70):rnd(70,110)}}}
const update2=update;update=function(dt){update2(dt);coupsTick(dt)};

// ----- affichage : naissances et coup dur en cours, sous le HUD -----
const hudDefi0=hud;hud=function(){hudDefi0();if(state!=='play'||!enDefi())return;const no=objNaiss();let h='';
  // le message « le chrono avance » serait faux tant que les naissances manquent
  if(no&&!naissOk()){const r=hudEl.lastElementChild;if(r&&/Cohabitation réussie/.test(r.textContent))r.innerHTML='<span style="color:#ffb43a">● Tout le monde est là — il manque des naissances pour lancer le chrono</span>'}
  if(no){const k=DIFFS[DIFF].naiss,fini=naissOk();h+=`<span style="color:${fini?'#8bff6a':'#ffb43a'}">🐣 ${especesNaiss().map(id=>`${FICHES[id].ic}${Math.min(NAISSP[id]||0,k)}/${k}`).join(' ')}${fini?' ✓':' — le chrono attend des naissances'}</span>`}
  if(EVT)h+=`<span style="color:#ff8a6a;margin-left:10px">${COUPS[EVT.id].ic} ${EVT.actif?`${COUPS[EVT.id].nom} : encore ${Math.ceil(EVT.t)} s`:`${COUPS[EVT.id].nom} dans ${Math.ceil(EVT.t)} s`}</span>`;
  if(h)hudEl.insertAdjacentHTML('beforeend',`<div class="row">${h}</div>`)};

// ----- étoiles (utilisé par la victoire, menu.js) -----
function etoiles(used){if(DIFF==='facile')return {st:1+(lvlMissed?0:1)+(!lvlMissed&&used<=stock0/2?1:0),legende:'★ réussi · ★★ sans jamais perdre une espèce · ★★★ en plus, avec moins de la moitié des réserves'};
  const no=objNaiss(),k=DIFFS[DIFF].naiss,fort=no?especesNaiss().every(id=>(NAISSP[id]||0)>=k*2):true;
  return {st:1+(lvlMissed?0:1)+(!lvlMissed&&fort?1:0),legende:`★ réussi · ★★ sans jamais perdre une espèce · ★★★ en plus, ${no?`deux fois plus de naissances que demandé, pour chaque espèce`:'sans perte'}${EVTlog.length?` · coups durs : ${EVTlog.join(', ')}`:''}`}}

// ----- choix de la difficulté, en haut de l'écran de la campagne -----
const showMenuD=showMenu;showMenu=function(){showMenuD();const head=document.querySelector('#menu .mhead');if(!head)return;
  head.insertAdjacentHTML('afterend',`<div class="diffs">${Object.entries(DIFFS).map(([k,D])=>`<button class="diff ${k===DIFF?'on':''}" data-d="${k}"><b>${D.ic} ${D.nom}</b><small>${D.txt}</small></button>`).join('')}</div>`);
  document.querySelectorAll('#menu .diff').forEach(b=>b.onclick=()=>{DIFF=b.dataset.d;LS.set('biome_diff',DIFF);showMenu()})};
if(window.__sim){window.__sim.startLevel=i=>startLevel(i);window.__sim.setDiff=d=>{DIFF=d};
  Object.defineProperty(window.__sim,'naiss',{get:()=>especesNaiss().map(id=>id.slice(0,4)+(NAISSP[id]||0)).join(' ')+(naissOk()?' ok':' …')});Object.defineProperty(window.__sim,'coup',{get:()=>EVT?EVT.id+(EVT.actif?'*':''):''});Object.defineProperty(window.__sim,'coupsVus',{get:()=>EVTlog.join(',')})}

// ================= MODES DE CAMPAGNE EN PLUS =================
// ⚔ défi de chapitre (après chaque chapitre terminé), ☀ défi du jour (le même pour tout le monde ce jour-là),
// ⏳ survie (tenir le plus longtemps possible), 📊 bilan de fin de niveau, succès difficiles.
// Un mode spécial part d'un niveau existant (même terrain, mêmes espèces) dont on change les règles.
let SPECIAL=null;// {type:'defi'|'jour'|'survie', ...}
const DIFF_USER=()=>{const d=LS.get('biome_diff','normal');return DIFFS[d]?d:'normal'};
function seedRng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const jourCle=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()};
// ----- le défi du jour : tiré au sort avec la date comme graine -----
const MODIFS=[
  {k:'reserves',ic:'📦',txt:'Réserves de moitié',app(L){for(const k in L.stock)if(k!=='compost')L.stock[k]=Math.max(1,Math.round(L.stock[k]/2))}},
  {k:'long',ic:'⏱',txt:'Chrono une fois et demie plus long',app(L){L.goal.t=Math.round(L.goal.t*1.5)}},
  {k:'panne',ic:'⚡',txt:'Programmateur du brumisateur en panne',app(L){L.showers=false}},
  {k:'foule',ic:'👥',txt:'Population minimale plus haute',app(L){const m=Object.assign({},L.goal.min||{});for(const id of L.goal.alive)if(id!=='plante'&&!NAISS_EXCLUES.includes(id)&&(L.stock[id]||0)>=3)m[id]=Math.max(m[id]||0,3);L.goal.min=m}},
  {k:'sec',ic:'☀',txt:'Évaporation plus forte',app(L){L.evap=(L.evap||1)*1.5}}];
function defiJour(){const r=seedRng(jourCle()),pool=[];for(let i=2;i<LEVELS.length;i++)pool.push(i);
  const i=pool[Math.floor(r()*pool.length)],m1=Math.floor(r()*MODIFS.length);let m2=Math.floor(r()*(MODIFS.length-1));if(m2>=m1)m2++;
  return {i,mods:[MODIFS[m1],MODIFS[m2]]}}
const copieNiv=L=>JSON.parse(JSON.stringify(L));
// ----- démarrer un mode spécial -----
let startingSpecial=false;
function startSpecial(S){const base=LEVELS[S.i],L=copieNiv(base);L.special=S.type;
  if(S.type==='defi'){L.nom='Défi : '+CHAPTERS[S.ch].nom;L.goal.t=Math.round(L.goal.t*1.4);
    L.txt=`Le dernier niveau du chapitre, en plus dur : règles Expert, réserves réduites, chrono plus long. ${base.txt}`}
  if(S.type==='jour'){const J=defiJour();for(const m of J.mods)m.app(L);L.nom='Défi du jour : '+base.nom;
    L.txt=`Le même défi pour tout le monde aujourd'hui. Règles : ${J.mods.map(m=>m.ic+' '+m.txt).join(', ')}. ${base.txt}`}
  if(S.type==='survie'){L.nom='Survie';L.goal={alive:base.goal.alive.slice(),t:1e9};
    L.txt="Toutes les espèces ensemble, et des coups durs de plus en plus rapprochés. Tiens le plus longtemps possible : la partie s'arrête quand une espèce disparaît sans réserve."}
  SPECIAL=S;startingSpecial=true;DIFF=S.type==='defi'?'expert':S.type==='survie'?'normal':DIFF_USER();
  const keep=LEVELS[S.i];LEVELS[S.i]=L;try{startLevel(S.i)}finally{LEVELS[S.i]=keep;startingSpecial=false}
  const t=$('lvltxt'),h=t&&t.querySelector('h1');if(h)h.textContent=({defi:'⚔ ',jour:'☀ ',survie:'⏳ '})[S.type]+L.nom;
  if(S.type==='survie'){const rec=LS.get('biome_survie',0);t.insertAdjacentHTML('beforeend',`<p class="dim">⏳ Record : <b>${fmt(rec)}</b></p>`);EVTnext=40}
  SURV_T=0}
let SURV_T=0;
{const en=especesNaiss;especesNaiss=function(){return lvl&&lvl.special==='survie'?[]:en()}}
// un niveau normal efface le mode spécial et reprend la difficulté choisie
{const sl=startLevel;startLevel=function(i){if(!startingSpecial){SPECIAL=null;DIFF=DIFF_USER()}sl(i)}}
{const st=showTitle;showTitle=function(){st();SPECIAL=null;DIFF=DIFF_USER()}}
{const ev=enterViv;enterViv=function(v){SPECIAL=null;DIFF=DIFF_USER();ev(v)}}
{const sr=saveResume;saveResume=function(){if(SPECIAL||(lvl&&lvl.special))return;sr()}}
// survie : coups durs de plus en plus rapprochés, chrono de survie
{const up=update;update=function(dt){up(dt);if(state!=='play')return;
  if(lvl.special==='survie'){SURV_T+=dt;const cap=Math.max(15,55-SURV_T/60*7);if(!EVT&&EVTnext>cap)EVTnext=cap;goalT=0}}}
{const h0=hud;hud=function(){h0();if(state!=='play'||lvl.special!=='survie')return;const r=hudEl.firstElementChild;
  if(r)r.innerHTML=`<b>⏳ Survie</b><span>tenu <b>${fmt(SURV_T)}</b></span><span class="dim">record ${fmt(LS.get('biome_survie',0))}</span>`}}
// survie : le chrono ne fait jamais gagner
{const cg=checkGoal;checkGoal=function(dt){if(lvl.special==='survie'){goalT=0;const n=counts();
  for(const id of lvl.goal.alive){if(!(n[id]>0)&&!((stock[id]||0)>0)&&everSeen[id]){lose(`${FICHES[id].ic} ${FICHES[id].nom} a disparu.`);return}if(n[id]>0)everSeen[id]=true}
  const missing=lvl.goal.alive.filter(id=>!(n[id]>0));extinctMsg=missing.length?missing.map(id=>FICHES[id].ic).join(' '):'';return}cg(dt)}}

// ================= BILAN DE FIN DE NIVEAU =================
let BILH=[],histT=0,MORTS={},MORTS_CAUSE={};
{const sl=startLevel;startLevel=function(i){sl(i);BILH=[];histT=0;MORTS={};MORTS_CAUSE={}}}
{const up=update;update=function(dt){up(dt);if(state!=='play'||lvl.sandbox)return;histT-=dt;if(histT<=0){histT=5;BILH.push({t:simT,n:counts()});if(BILH.length>400)BILH=BILH.filter((_,j)=>j%2===0)}}}
{const d0=die;die=function(c,by){const was=c.dead;d0(c,by);if(!was&&c.dead&&state==='play'&&!lvl.sandbox&&!c.intrus&&by!=='meta'){const id=espNaiss(c.sp.id);MORTS[id]=(MORTS[id]||0)+1;
  const cause=by&&by.sp?'mangé':c.energy<=0?'faim':'vieillesse';MORTS_CAUSE[cause]=(MORTS_CAUSE[cause]||0)+1}}}
const COLS_B=['#8bff6a','#ffb43a','#6ad0ff','#ff6a8a','#d9a0ff','#ffe94d','#a0ffd9','#ff9a5a','#9aa0ff','#e0e0e0','#c8ff5a'];
function bilanHTML(){if(BILH.length<2)return '';const sp=lvl.sp,Wd=300,Hd=90,t0=BILH[0].t,t1=BILH[BILH.length-1].t||1;
  let mx=1;for(const h of BILH)for(const id of sp)mx=Math.max(mx,h.n[id]||0);
  const X=t=>((t-t0)/Math.max(1,t1-t0)*Wd).toFixed(1),Y=v=>(Hd-2-(v/mx)*(Hd-6)).toFixed(1);
  const lines=sp.map((id,j)=>`<polyline fill="none" stroke="${COLS_B[j%COLS_B.length]}" stroke-width="1.6" points="${BILH.map(h=>X(h.t)+','+Y(h.n[id]||0)).join(' ')}"/>`).join('');
  const leg=sp.map((id,j)=>`<span style="color:${COLS_B[j%COLS_B.length]}">${FICHES[id].ic} ${BILH[BILH.length-1].n[id]||0}</span>`).join(' ');
  const morts=Object.values(MORTS).reduce((a,b)=>a+b,0),causes=Object.entries(MORTS_CAUSE).map(([k,v])=>`${v} ${k==='mangé'?'mangées':k==='faim'?'de faim':'de vieillesse'}`).join(', ');
  const pire=Object.entries(MORTS).sort((a,b)=>b[1]-a[1])[0];
  const coinc=lvl.goal.alive.filter(id=>{const v=BILH.map(h=>h.n[id]||0),j=v.findIndex(x=>x>0);return j>=0&&v.slice(j).some(x=>x===0)}).map(id=>FICHES[id].ic+' '+FICHES[id].nom.toLowerCase());
  return `<div class="bilan"><b>📊 Bilan</b><svg viewBox="0 0 ${Wd} ${Hd}" preserveAspectRatio="none"><rect width="${Wd}" height="${Hd}" fill="#0b120b"/>${lines}</svg><div class="bleg">${leg}</div>
   <p>🐣 Naissances : <b>${NAISS}</b> · ✝ Morts : <b>${morts}</b>${causes?` (${causes})`:''}${pire?` · le plus touché : ${FICHES[pire[0]]?FICHES[pire[0]].ic:''} ${pire[1]}`:''}</p>
   ${coinc.length?`<p>⚠ A failli disparaître : ${coinc.join(', ')}</p>`:''}${EVTlog.length?`<p>Coups durs : ${EVTlog.join(', ')}</p>`:''}</div>`}

// ================= FIN D'UN MODE SPÉCIAL, SUCCÈS =================
ACH_LIST.push(
 {k:'defi1',ic:'⚔',nom:'Défi relevé',txt:"Un défi de chapitre réussi."},
 {k:'defiAll',ic:'🗡',nom:'Maître des défis',txt:"Tous les défis de chapitre réussis."},
 {k:'jour',ic:'☀',nom:'Défi du jour',txt:"Le défi du jour réussi."},
 {k:'jour7',ic:'📅',nom:'Fidèle au poste',txt:"7 défis du jour réussis."},
 {k:'survie5',ic:'⏳',nom:'Tenace',txt:"5 minutes en mode survie."},
 {k:'survie15',ic:'🛡',nom:'Inébranlable',txt:"15 minutes en mode survie."},
 {k:'expertCamp',ic:'🔥',nom:'Expert',txt:"Toute la campagne réussie en Expert."},
 {k:'expert3',ic:'💎',nom:'Perfection',txt:"3 étoiles sur tous les niveaux en Expert."},
 {k:'coups10',ic:'🌪',nom:'Tempêtes surmontées',txt:"10 coups durs surmontés sans perte."});
function etoilesSpe(){const left=Object.keys(lvl.stock).reduce((a,k)=>a+(stock[k]||0),0);return etoiles(stock0-left).st}
{const w0=win;win=function(){
  if(lvl&&lvl.special){state='end';paused=true;clearResume();const st=etoilesSpe();let h='';
    if(lvl.special==='defi'){const D=LS.get('biome_defis',{});D[SPECIAL.ch]=Math.max(D[SPECIAL.ch]||0,st);LS.set('biome_defis',D);ach('defi1');
      if(CHAPTERS.every((C,ci)=>C.soon||D[ci]))ach('defiAll');h=`<h1 class="ok">⚔ Défi réussi !</h1><p>${CHAPTERS[SPECIAL.ch].nom} : le chapitre est dompté, même en Expert.</p>`}
    if(lvl.special==='jour'){const J=LS.get('biome_jours',{});J[jourCle()]=Math.max(J[jourCle()]||0,st);LS.set('biome_jours',J);ach('jour');if(Object.keys(J).length>=7)ach('jour7');
      h=`<h1 class="ok">☀ Défi du jour réussi !</h1><p>Reviens demain pour un nouveau défi.</p>`}
    $('end').style.display='flex';$('endtxt').innerHTML=h+`<div class="stars">${'★'.repeat(st)}<span>${'★'.repeat(3-st)}</span></div>`+bilanHTML();$('bnext').style.display='none';finCoups();return}
  w0();
  if(DIFF==='expert'){const X=LS.get('biome_stars_x',{}),st=etoilesSpe();X[lvlIdx]=Math.max(X[lvlIdx]||0,st);LS.set('biome_stars_x',X);
    if(LEVELS.every((_,i)=>X[i]))ach('expertCamp');if(LEVELS.every((_,i)=>X[i]===3))ach('expert3')}
  $('endtxt').insertAdjacentHTML('beforeend',bilanHTML());finCoups()}}
{const l0=lose;lose=function(m){
  if(lvl&&lvl.special==='survie'){l0(m);const rec=LS.get('biome_survie',0),nouv=SURV_T>rec;if(nouv)LS.set('biome_survie',Math.floor(SURV_T));
    if(SURV_T>=300)ach('survie5');if(SURV_T>=900)ach('survie15');
    $('endtxt').innerHTML=`<h1 class="${nouv?'ok':'ko'}">⏳ Fin de la survie</h1><p>${m}</p><p>Tu as tenu <b>${fmt(SURV_T)}</b>${nouv?' : <b>nouveau record !</b>':` (record : ${fmt(rec)})`}</p>`+bilanHTML();finCoups();return}
  l0(m);$('endtxt').insertAdjacentHTML('beforeend',bilanHTML());finCoups()}}
function finCoups(){if(EVTpasses){const n=LS.get('biome_coups',0)+EVTpasses;LS.set('biome_coups',n);if(n>=10)ach('coups10')}EVTpasses=0}
// rejouer : relance le même mode spécial
{const b=$('bretry'),r0=b.onclick;b.onclick=()=>SPECIAL&&lvl&&lvl.special?startSpecial(SPECIAL):r0()}
{const b=$('brestart'),r0=b.onclick;b.onclick=()=>SPECIAL&&lvl&&lvl.special?startSpecial(SPECIAL):r0()}

// ================= ENTRÉES DANS L'ÉCRAN DE LA CAMPAGNE =================
{const sm=showMenu;showMenu=function(){SPECIAL=null;DIFF=DIFF_USER();sm();const M=$('menu'),dv=M.querySelector('.diffs');if(!dv)return;
  const J=defiJour(),JD=LS.get('biome_jours',{})[jourCle()],rec=LS.get('biome_survie',0),nd=done.size,D=LS.get('biome_defis',{});
  dv.insertAdjacentHTML('afterend',`<div class="modes">
    <button class="mode" id="mjour"><b>☀ Défi du jour</b><small>${LEVELS[J.i].nom} · ${J.mods.map(m=>m.ic+' '+m.txt).join(' · ')}${JD?` · fait ${'★'.repeat(JD)}`:''}</small></button>
    <button class="mode ${nd>=3?'':'lock'}" id="msurv"><b>⏳ Survie</b><small>${nd>=3?`Tenir le plus longtemps possible · record ${fmt(rec)}`:'🔒 Réussis 3 niveaux pour le débloquer'}</small></button></div>`);
  $('mjour').onclick=()=>startSpecial({type:'jour',i:J.i});
  $('msurv').onclick=()=>{if(nd>=3)startSpecial({type:'survie',i:11})};
  M.querySelectorAll('.chap').forEach((el,ci)=>{const C=CHAPTERS[ci];if(!C||C.soon)return;const fini=C.lv.every(i=>done.has(i));
    el.querySelector('.lvs').insertAdjacentHTML('beforeend',`<button class="lv defi ${fini?'':'lock'}" data-ch="${ci}"><b>⚔</b><span>Défi du chapitre</span><small>${fini?'Règles Expert, chrono plus long':'🔒 Termine le chapitre'}</small>${D[ci]?`<em>${'★'.repeat(D[ci])}${'☆'.repeat(3-D[ci])}</em>`:''}</button>`)});
  M.querySelectorAll('.lv.defi').forEach(b=>b.onclick=e=>{e.stopPropagation();const ci=+b.dataset.ch,C=CHAPTERS[ci];if(!C.lv.every(i=>done.has(i)))return;startSpecial({type:'defi',ch:ci,i:C.lv[C.lv.length-1]})})}}
if(window.__sim){window.__sim.special=S=>startSpecial(S);window.__sim.defiJour=defiJour;window.__sim.bilan=()=>bilanHTML();
  Object.defineProperty(window.__sim,'survT',{get:()=>SURV_T});Object.defineProperty(window.__sim,'hist',{get:()=>BILH.length})}

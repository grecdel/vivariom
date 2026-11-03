// ================= MODE HISTOIRE : LE CARNET DE CAMILLE (idée 1, style « carnet de terrain » choisi) =================
// Camille, naturaliste, tient un carnet de terrain. À chaque niveau de campagne :
// - une page d'introduction (jour = numéro du niveau),
// - des missions d'observation tirées des espèces du niveau (« À observer : … »),
// - des commentaires quand il se passe quelque chose (éclosion, chasse, champignon, coup dur…).
// Les pages vues sont rangées dans le « Carnet de Camille » (bouton 📔 dans l'écran de campagne).
if(OPT.camille===undefined)OPT.camille=true;
const camilleOn=()=>OPT.camille!==false&&state==='play'&&lvl;
let CARNET=LS.get('biome_carnet',[]);// pages gardées : {d,jour,titre,txt}
let CAM={t:0,der:0,missions:[],fait:{}};
// ---------- croquis à l'encre (petits dessins du carnet) ----------
const CROQUIS={
  bete:'<g fill="none" stroke="#5a3a14" stroke-width="1.4"><ellipse cx="35" cy="32" rx="16" ry="12"/><line x1="35" y1="20" x2="35" y2="44"/><circle cx="35" cy="16" r="5"/><path d="M31 12 L25 5 M39 12 L45 5"/><path d="M19 28 L9 24 M19 34 L8 36 M51 28 L61 24 M51 34 L62 36 M21 40 L13 46 M49 40 L57 46"/></g>',
  plante:'<g fill="none" stroke="#3a5a14" stroke-width="1.4"><path d="M35 52 Q33 36 36 14"/><path d="M35 40 Q24 34 18 38 Q26 44 35 40"/><path d="M35 30 Q46 22 53 26 Q45 34 35 30"/><circle cx="36" cy="12" r="4"/><path d="M30 8 L42 16 M42 8 L30 16"/></g>',
  oeuf:'<g fill="none" stroke="#5a3a14" stroke-width="1.4"><ellipse cx="26" cy="36" rx="6" ry="8"/><ellipse cx="40" cy="38" rx="6" ry="8"/><ellipse cx="33" cy="24" rx="6" ry="8"/><path d="M14 48 Q35 54 56 48"/></g>',
  loupe:'<g fill="none" stroke="#5a3a14" stroke-width="1.6"><circle cx="30" cy="28" r="13"/><line x1="40" y1="38" x2="54" y2="52" stroke-width="3"/><path d="M24 24 Q28 20 33 22"/></g>',
  goutte:'<g fill="none" stroke="#2a4a6a" stroke-width="1.4"><path d="M35 10 Q22 30 26 40 Q35 52 44 40 Q48 30 35 10"/><path d="M14 50 Q25 46 35 50 Q45 54 56 50"/></g>'};
// ---------- les pages d'introduction, par chapitre ----------
const INTRO=["Premier jour de terrain. Un vivarium vide, de la terre, de l'eau… Tout commence par une petite pousse. Je note tout ici.",
 "Les fourmis ! Une reine seule va fonder une cité entière. Je vais la regarder creuser.",
 "Les araignées tissent des pièges d'une précision folle. Il faudra les nourrir sans vider le ciel.",
 "Sous terre, une autre vie : scolopendres, cloportes, lombrics. Tout ce qu'on ne voit pas d'habitude.",
 "Les phasmes ressemblent à des brindilles. Je ne les vois que lorsqu'ils bougent !",
 "La mante attend, immobile. Patience… je vais faire comme elle.",
 "Œuf, chenille, chrysalide, papillon : la plus belle des transformations.",
 "Le désert : chaud le jour, froid la nuit. Le scorpion brille sous la lampe UV, paraît-il.",
 "Les grands coléoptères : bousiers et scarabées rhinocéros. Des costauds du recyclage."];
const chapDe=i=>Math.max(0,CHAPTERS.findIndex(C=>C.lv.includes(i)));
// ---------- les missions d'observation, selon les espèces du niveau ----------
const MISSIONS={
  plante:{txt:'une graine qui germe toute seule',re:/graine a germé|graine de cactus a germé/,cro:'plante'},
  fourmi:{txt:'les premières ouvrières nées dans le nid',test:()=>typeof NAISSP!=='undefined'&&(NAISSP.fourmi||0)>0,cro:'bete'},
  coccinelle:{txt:'une ponte de coccinelle près des pucerons',re:/coccinelle pond/,cro:'oeuf'},
  abeille:{txt:'une abeille qui pond au pied des fleurs',re:/abeille pond/,cro:'oeuf'},
  araignee:{txt:'une bête prise dans une toile',re:/pris\(e\) dans une toile/,cro:'bete'},
  mouche:{txt:'des asticots qui deviennent mouches',re:/asticot|pupe de mouche devient/,cro:'bete'},
  scolopendre:{txt:'la scolopendre qui attrape une proie',re:/Scolopendre a mangé/,cro:'bete'},
  phasme:{txt:'des œufs de phasme qui éclosent',re:/Éclosion : .*hasme/,cro:'oeuf'},
  mante:{txt:'une oothèque de mante qui éclot',re:/Éclosion : .*ante/,cro:'oeuf'},
  papillon:{txt:'une chrysalide qui devient papillon',re:/chrysalide devient papillon/,cro:'bete'},
  escargot:{txt:'des petits escargots qui éclosent',re:/Éclosion : .*scargot/,cro:'oeuf'},
  scorpion:{txt:'le scorpion qui brille sous la lampe UV',test:()=>creatures.some(c=>!c.dead&&c.sp.id==='scorpion')&&typeof uvOn==='function'&&uvOn(),cro:'loupe'},
  tenebrion:{txt:'un ver de farine qui devient ténébrion',re:/devient ténébrion/,cro:'bete'},
  bousier:{txt:'un bousier qui enterre sa boule',re:/enterre sa boule/,cro:'bete'},
  rhinoceros:{txt:'un scarabée rhinocéros qui sort de terre',re:/rhinocéros sort de terre/,cro:'bete'},
  cloporte:{txt:'des petits cloportes qui naissent',test:()=>typeof NAISSP!=='undefined'&&(NAISSP.cloporte||0)>0,cro:'bete'},
  lombric:{txt:'un lombric qui se reproduit',test:()=>typeof NAISSP!=='undefined'&&(NAISSP.lombric||0)>0,cro:'bete'}};
function missionsNiveau(L){const ids=L.sp.slice().reverse().filter(id=>MISSIONS[id]);return ids.slice(0,2).map(id=>({id,...MISSIONS[id],ok:false}))}
// ---------- commentaires sur les événements ----------
const COMMENTS=[
  {re:/^Éclosion/,txt:'Des petits viennent d\'éclore ! Minuscules… ils vont grandir à vue d\'œil.',cro:'oeuf'},
  {re:/ a mangé : /,txt:'Une chasse ! Chaque prédateur garde les autres en équilibre. C\'est dur, mais c\'est la nature.',cro:'bete'},
  {re:/^Plus aucun/,txt:'Aïe… une espèce manque à l\'appel. S\'il en reste en réserve, il faut en reposer vite.',cro:'loupe'},
  {re:/champignon attaque/,txt:'Un champignon blanc sur une bête : le sol est trop mouillé. J\'aère et je brumise moins.',cro:'goutte'},
  {re:/moisissures/,txt:'Des moisissures sur le sol. Trop d\'eau ! Un vivarium doit respirer.',cro:'goutte'},
  {re:/^Coup dur/,txt:'Coup dur en vue. Je garde l\'œil sur le thermomètre et le brumisateur.',cro:'loupe'},
  {re:/virus/,txt:'Les feuilles jaunissent en mosaïque : un virus apporté par les pucerons. Des coccinelles m\'aideraient.',cro:'plante'},
  {re:/essaim/i,txt:'Un essaim ! Les abeilles se serrent en grappe avant de partir fonder une nouvelle colonie.',cro:'bete'},
  {re:/pucerons ailés/,txt:'Des pucerons avec des ailes : leur plante est surpeuplée, alors ils partent ailleurs.',cro:'bete'}];
// ---------- affichage du carnet ----------
document.body.insertAdjacentHTML('beforeend','<div id="carnet"></div>');
function page(titre,txt,cro,mis,garder){const C=$('carnet');if(typeof $==='function'&&$('soin')&&$('soin').style.display==='block')return;
  C.innerHTML=`<svg class="sk" width="70" height="56" viewBox="0 0 70 56">${CROQUIS[cro]||CROQUIS.loupe}</svg><h4>${titre}</h4><div class="tx">${txt}</div>${mis?`<div class="mis">${mis}</div>`:''}<button class="cx" aria-label="Fermer">✕</button>`;
  C.style.display='block';C.classList.remove('vu');void C.offsetWidth;C.classList.add('vu');C.querySelector('.cx').onclick=e=>{e.stopPropagation();C.style.display='none'};
  CAM.t=garder?14:9;CAM.der=simT;if(garder){CARNET.push({d:Date.now(),titre,txt:String(txt).replace(/<[^>]*>/g,'')});if(CARNET.length>120)CARNET.shift();LS.set('biome_carnet',CARNET)}}
const jourTitre=()=>lvl.sandbox?`Carnet de Camille — ${lvl.nom}`:`Carnet de Camille — jour ${lvlIdx+1}`;
const misTxt=()=>CAM.missions.length?CAM.missions.map(m=>`${m.ok?'✔':'✎'} À observer : ${m.txt} ${m.ok?'(vu !)':'(0/1)'}`).join('<br>'):'';
// ---------- départ d'un niveau : page d'introduction ----------
{const sl=startLevel;startLevel=function(i){sl(i);CAM={t:0,der:-99,missions:[],fait:{}};$('carnet').style.display='none';
  if(OPT.camille===false||!lvl||lvl.sandbox||lvl.special==='survie')return;CAM.missions=missionsNiveau(lvl);
  const L=$('lvltxt');if(L)L.insertAdjacentHTML('beforeend',`<div class="carnetbrief"><b>📔 Carnet de Camille — jour ${i+1}</b><span>${INTRO[chapDe(i)]||''}</span>${CAM.missions.length?`<i>${CAM.missions.map(m=>'✎ À observer : '+m.txt).join('<br>')}</i>`:''}</div>`);
  CAM.intro=true}}
{const go=$('bgo'),g0=go.onclick;go.onclick=e=>{g0&&g0(e);if(CAM.intro&&OPT.camille!==false){CAM.intro=false;setTimeout(()=>{if(state==='play')page(jourTitre(),INTRO[chapDe(lvlIdx)]||'',lvlIdx===0?'plante':'bete',misTxt(),true)},600)}}}
// ---------- événements : missions réussies et commentaires ----------
{const jl=jlog;jlog=function(ic,txt){jl(ic,txt);if(!camilleOn())return;const s=String(txt);
  for(const m of CAM.missions)if(!m.ok&&m.re&&m.re.test(s)){m.ok=true;missionFaite(m);return}
  if(simT-CAM.der<25)return;for(const C of COMMENTS)if(C.re.test(s)&&!CAM.fait[C.re]){CAM.fait[C.re]=1;page(jourTitre(),C.txt,C.cro,misTxt(),false);return}}}
function missionFaite(m){page(jourTitre(),`Ça y est, j'ai vu ${m.txt} ! Je l'ajoute à mon carnet.`,m.cro,misTxt(),true);const d=LS.get('biome_camille',{}),k=lvlIdx;d[k]=Math.max(d[k]||0,CAM.missions.filter(x=>x.ok).length);LS.set('biome_camille',d);
  if(typeof vib==='function')vib([20,30,20]);if(CAM.missions.every(x=>x.ok))setTimeout(()=>toast('📔 Toutes les observations du jour sont dans le carnet de Camille !'),1500)}
{const up=update;update=function(dt){up(dt);if(!camilleOn())return;
  if(CAM.t>0){CAM.t-=dt;if(CAM.t<=0)$('carnet').style.display='none'}
  for(const m of CAM.missions)if(!m.ok&&m.test&&m.test()){m.ok=true;missionFaite(m)}}}
// ---------- fin de niveau : bilan des observations ----------
{const w=win;win=function(){w();if(OPT.camille===false||!CAM.missions.length)return;const n=CAM.missions.filter(m=>m.ok).length;$('carnet').style.display='none';
  $('endtxt').insertAdjacentHTML('beforeend',`<div class="carnetbrief"><b>📔 Carnet de Camille</b><span>${n===CAM.missions.length?'Toutes mes observations sont faites. Quelle journée !':n?'Encore une observation à faire… on la verra la prochaine fois.':'Je n\'ai rien pu observer de spécial aujourd\'hui. Rejouer pour voir ?'}</span><i>${CAM.missions.map(m=>(m.ok?'✔ ':'✎ ')+m.txt).join('<br>')}</i></div>`)}}
{const l=lose;lose=function(m){l(m);$('carnet').style.display='none'}}
{const ev=enterViv;enterViv=function(v){ev(v);CAM={t:0,der:-99,missions:[],fait:{}};$('carnet').style.display='none'}}
// ---------- le livre : toutes les pages gardées ----------
function ouvrirCarnet(){const O=ovl('carnetp'),L=CARNET.slice().reverse(),D=LS.get('biome_camille',{}),nObs=Object.values(D).reduce((a,b)=>a+b,0);
  O.innerHTML=`<div class="box"><div class="mhead"><h1>📔 Carnet de Camille</h1><button class="back" id="ccl">Fermer</button></div><p class="dim">${nObs} observation${nObs>1?'s':''} réussie${nObs>1?'s':''} · ${L.length} page${L.length>1?'s':''}</p>
   <div class="livre">${L.length?L.map(p=>`<div class="lp"><h4>${p.titre}</h4><p>${p.txt}</p><small>${new Date(p.d).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</small></div>`).join(''):'<p class="dim">Le carnet est encore vide : lance un niveau de la campagne.</p>'}</div></div>`;
  $('ccl').onclick=()=>{O.style.display='none'}}
{const sm=showMenu;showMenu=function(){sm();const h=document.querySelector('#menu .mhead');if(h&&OPT.camille!==false)h.insertAdjacentHTML('beforeend','<button class="back" id="mcarnet" title="Carnet de Camille">📔</button>');const b=$('mcarnet');if(b)b.onclick=ouvrirCarnet}}
// ---------- option ----------
{const oo=openOpts;openOpts=function(){oo();const h=[...document.querySelectorAll('#opts h3')].find(e=>e.textContent==='Jeu');if(!h)return;
  const row=document.createElement('div');row.className='orow';row.innerHTML=`<span>📔 Carnet de Camille (mode histoire)</span><span class="oseg"><button data-cam="1" class="${OPT.camille!==false?'on':''}">Oui</button><button data-cam="0" class="${OPT.camille===false?'on':''}">Non</button></span>`;
  h.after(row);row.querySelectorAll('button').forEach(b=>b.onclick=()=>{OPT.camille=b.dataset.cam==='1';saveOpt();openOpts()})}}
if(window.__sim){window.__sim.camille=()=>({missions:CAM.missions.map(m=>m.id+(m.ok?'✔':'')).join(','),carnet:$('carnet').style.display,pages:CARNET.length})}

// ---------- bac à sable : fiche d'aide quand on prend une bête (nourriture, prédateurs, besoins) ----------
// Pour équilibrer le bac : ce que la bête mange (et s'il y en a), qui la mange (et s'il y en a), où la poser.
// Ressources : 'plante','fleurs','litiere','graine','cadavre','miellat' ; sinon un id d'espèce.
const RES={plante:{ic:'🌱',nom:'Plantes'},fleurs:{ic:'🌸',nom:'Fleurs ouvertes'},litiere:{ic:'🍂',nom:'Litière'},graine:{ic:'🌾',nom:'Graines'},cadavre:{ic:'💀',nom:'Cadavres'},miellat:{ic:'🍯',nom:'Miellat (pucerons)'}};
const CHASSE_SOL=['cloporte','lombric','fourmi','phasme','escargot','papillon','tenebrion','coccinelle'];
const REL={
  fourmi:{mange:['miellat','puceron','graine','cadavre'],par:['scolopendre','scorpion','araignee:sol']},
  puceron:{mange:['plante'],par:['coccinelle','mante']},
  coccinelle:{mange:['puceron'],par:['araignee','scolopendre','mante']},
  cloporte:{mange:['litiere','cadavre'],par:['scolopendre','scorpion','araignee:sol']},
  lombric:{mange:['litiere'],par:['scolopendre','araignee:sol']},
  scolopendre:{mange:['cloporte','lombric','fourmi','coccinelle','rhinoceros'],par:[]},
  araignee:{mange:['abeille','mouche','coccinelle','papillon'],par:['mante']},
  'araignee:sol':{mange:[...CHASSE_SOL,'mouche'],par:[]},
  'araignee:saut':{mange:['mouche','papillon','puceron','abeille','chenille'],par:['mante','araignee']},
  abeille:{mange:['fleurs'],par:['araignee','mante']},
  mouche:{mange:['cadavre'],par:['araignee','mante']},
  phasme:{mange:['plante'],par:['araignee:sol']},
  mante:{mange:['mouche','abeille','papillon','puceron'],par:['mante']},
  escargot:{mange:['litiere','plante'],par:['scolopendre','araignee:sol']},
  papillon:{mange:['fleurs','plante'],par:['araignee','mante','araignee:sol']},
  scorpion:{mange:['tenebrion','cloporte','bousier','fourmi'],par:[]},
  tenebrion:{mange:['litiere','graine','cadavre'],par:['scorpion']},
  bousier:{mange:['litiere','cadavre'],par:['scorpion']},
  rhinoceros:{mange:['litiere','plante'],par:['scolopendre']}};
// les araignées chasseuses (loup, sauteuse, mygales) ne tissent pas : elles chassent au sol
const relKey=id=>{const g=grpOf(id);if(g==='araignee'&&VSP[id]&&VSP[id].beh)return VSP[id].beh==='sauteuse'?'araignee:saut':'araignee:sol';return g};
function present(r){const n=counts();
  if(r==='plante')return plants.filter(p=>p.alive).length;
  if(r==='fleurs')return plants.filter(p=>p.alive&&p.fl&&p.fl.open).length;
  if(RES[r])return items.filter(it=>it.type===r&&!it.dead&&!it.carried).length;
  if(r==='araignee:sol')return creatures.filter(c=>!c.dead&&c.sp.id==='araignee'&&c.sp.beh).length;
  if(r==='araignee')return creatures.filter(c=>!c.dead&&c.sp.id==='araignee'&&!c.sp.beh).length;
  return n[r]||0}
function relLabel(r){if(RES[r])return RES[r];if(r==='araignee:sol')return {ic:'🕷',nom:'Araignées chasseuses'};if(r==='araignee')return {ic:'🕸',nom:'Araignées à toile'};const g=grpOf(r);return {ic:FICHES[g]?FICHES[g].ic:'',nom:grpNom(g)}}
let aideId=null,aideOff=false;
function aideHTML(id){const k=relKey(id),R=REL[k];if(!R)return '';const g=grpOf(id),F=FICHES[baseOf(id)]||FICHES[g]||{};
  const pill=(r,kind)=>{const L=relLabel(r),n=present(r),cls=kind==='mange'?(n?'ok':'manque'):(n?'danger':'calme');return `<span class="apill ${cls}">${L.ic} ${L.nom} <b>${n||'—'}</b></span>`};
  const mangeOk=R.mange.some(r=>present(r)>0),parN=R.par.reduce((a,r)=>a+present(r),0);
  const bilan=!mangeOk?'⚠ Rien à manger dans ce bac pour l\'instant':parN?`⚠ ${parN} prédateur${parN>1?'s':''} dans le bac : garde assez de ${(w=>/[sx]$/.test(w)?w:w+'s')(grpNom(g).toLowerCase())}`:'✔ De quoi manger, aucun prédateur';
  return `<div class="ahead"><b>${F.ic||''} ${spName(id)}</b><span class="abilan ${!mangeOk||parN?'warn':''}">${bilan}</span><button class="ax" title="Masquer l'aide">✕</button></div>
   <div class="arow"><span class="alab">Mange</span>${R.mange.map(r=>pill(r,'mange')).join('')}</div>
   <div class="arow"><span class="alab">Mangé par</span>${R.par.length?R.par.map(r=>pill(r,'par')).join(''):'<span class="apill calme">personne ici</span>'}</div>
   ${F.besoin?`<div class="arow"><span class="alab">Besoin</span><span class="atxt">${F.besoin}</span></div>`:''}`}
function aideShow(){const el=$('aide');if(!el)return;const on=lvl&&lvl.sandbox&&state==='play'&&tool&&!aideOff&&!drawer&&OPT.tips!==false&&REL[relKey(tool)];
  if(!on){el.style.display='none';aideId=null;return}
  el.innerHTML=aideHTML(tool);el.style.display='block';aideId=tool;el.querySelector('.ax').onclick=()=>{aideOff=true;aideShow()}}
(()=>{const el=document.createElement('div');el.id='aide';document.body.appendChild(el)})();
const pickTool1=pickTool;pickTool=function(id,fromDrawer){const r=pickTool1(id,fromDrawer);if(id!==aideId)aideOff=false;aideShow();return r};
const closeDrawer1=closeDrawer;closeDrawer=function(){closeDrawer1();aideShow()};
const openDrawer1=openDrawer;openDrawer=function(c){openDrawer1(c);aideShow()};
// mise à jour des nombres pendant le jeu
setInterval(()=>{if(aideId&&state==='play')aideShow();else if($('aide')&&$('aide').style.display!=='none')aideShow()},1000);
if(window.__sim)window.__sim.aide=()=>{const el=$('aide');return el&&el.style.display!=='none'?el.innerText.replace(/\s+/g,' '):''};

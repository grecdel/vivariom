// ================= DÉBLOCAGES DE LA CAMPAGNE =================
// chaque niveau réussi offre un élément de matériel, disponible à partir du niveau suivant.
// le bac à sable, lui, a tout dès le départ.
const REWARDS=[
 {key:'prog',ic:'⏱',nom:'Programmateur du brumisateur',txt:"Le brumisateur se déclenche tout seul, à l'intervalle que tu choisis."},
 {key:'pierre+mousse',ic:'🪨',nom:'Pierre plate et mousse',txt:"Des abris humides pour les décomposeurs."},
 {key:'neon',ic:'▬',nom:'Néon T5',txt:"Une lumière douce sur toute la largeur, qui chauffe peu."},
 {key:'pot',ic:'🏺',nom:'Pot cassé',txt:"L'abri préféré des cloportes."},
 {key:'thermo',ic:'🌡',nom:'Thermo-hygromètre',txt:"Mesure la température et l'humidité, avec l'historique."},
 {key:'branche',ic:'🪵',nom:'Bois flotté',txt:"Les bêtes grimpent dessus, la mousse s'y installe."},
 {key:'tronc',ic:'🌳',nom:'Tronc creux',txt:"Grand support vertical et abri."},
 {key:'vent',ic:'🌀',nom:'Ventilation réglable',txt:"Ouvre ou ferme la grille pour garder ou chasser l'humidité."},
 {key:'mare',ic:'💧',nom:'Petite mare',txt:"Un point d'eau qui humidifie le sol en continu."},
 {key:'heat',ic:'🔥',nom:'Tapis chauffant',txt:"La chaleur accélère tout le vivarium."},
 {key:'tubes',ic:'🌈',nom:'Tubes néon horticole et UV',txt:"Croissance ×1,45 ou ambiance ultraviolette."},
 {key:'trophee',ic:'🏆',nom:'Trophée du grand équilibre',txt:"Tu maîtrises tout le vivarium. Place aux espèces vedettes !"},
 {key:'liege',ic:'🟫',nom:'Écorce de liège',txt:"Arche d'écorce : abri et escalade."},
 {key:'coquille',ic:'🐚',nom:"Coquille d'escargot",txt:"Minuscule abri, et du calcaire."},
 {key:'volcan',ic:'🌑',nom:'Roche volcanique',txt:"Garde la chaleur et l'humidité."},
 {key:'champi',ic:'🍄',nom:'Champignons',txt:"Se décomposent en litière."},
 {key:'trophee2',ic:'🌿',nom:'Trophée du jardin humide',txt:"Les escargots te remercient."},
 {key:'trophee3',ic:'🦋',nom:'Trophée de la métamorphose',txt:"Le jardin humide est terminé. Cap sur le désert !"},
 {key:'trophee4',ic:'🌵',nom:'Trophée du désert',txt:"Tes cactus et tes ténébrions tiennent bon au sec."},
 {key:'trophee5',ic:'🦂',nom:'Trophée de la lumière noire',txt:"Le scorpion brille sous tes UV. Place aux coléoptères !"},
 {key:'trophee6',ic:'🪲',nom:'Trophée du bousier',txt:"Boule après boule, ton sol s'est enrichi."},
 {key:'trophee7',ic:'🦏',nom:'Trophée du scarabée rhinocéros',txt:"Tous les chapitres de la campagne sont terminés !"},
];
// clé → index du niveau qui la donne
const UNLOCK_AT={};REWARDS.forEach((r,i)=>r.key.split('+').forEach(k=>UNLOCK_AT[k]=i));
function has(key){if(!lvl||lvl.sandbox)return true;const i=UNLOCK_AT[key];return i==null||i<lvlIdx}
function lockTxt(key){const i=UNLOCK_AT[key];return i==null?'':`🔒 Se débloque en réussissant le niveau ${i+1} « ${LEVELS[i].nom} ».`}
// applique les verrous au matériel quand un niveau démarre
function applyLocks(){
  if(!has('neon'))DEV.neon.on=false;
  if(!has('tubes'))DEV.neon.type='blanc';
  if(!has('prog'))DEV.mist.auto=false;
  if(!has('vent'))DEV.vent.open=true;
  if(!has('heat'))DEV.heat.on=false;
}
const DEV_KEY={neon:'neon',vent:'vent',heat:'heat',thermo:'thermo'};
function devLocked(id){const k=DEV_KEY[id];return k?!has(k):false}

// ================= PERSONNALISATION =================
const STYLE_OPTS={
  mur:{brun:['Taupe','linear-gradient(#2b2722,#3a342c 70%,#2e2923)'],sauge:['Sauge','linear-gradient(#1f2a22,#2c3a2e 70%,#223026)'],nuit:['Bleu nuit','linear-gradient(#1b2230,#2a3444 70%,#202838)'],
    papier:['Papier peint','repeating-linear-gradient(90deg,#3a3229 0 22px,#352d24 22px 24px,#3a3229 24px 44px),linear-gradient(#0000,#0003)'],brique:['Brique','repeating-linear-gradient(0deg,#3a2a22 0 16px,#241a14 16px 18px)']},
  sol:{chene:['Chêne','repeating-linear-gradient(90deg,#6a4a2c 0 78px,#3c2816 78px 80px)'],noyer:['Noyer','repeating-linear-gradient(90deg,#3e2616 0 78px,#22140a 78px 80px)'],
    carreau:['Carrelage','repeating-conic-gradient(#8a8680 0 25%,#5a5650 0 50%) 0 0/80px 80px'],beton:['Béton','linear-gradient(#5a5a58,#4a4a48)']},
  cadre:{noir:['Noir',['#0a0b0d','#3b4048','#1a1d22']],alu:['Aluminium',['#4a4f56','#d0d5dc','#80878f']],bois:['Bois',['#2e1b0e','#9a6a40','#5a3a20']],blanc:['Blanc',['#8a9096','#f4f6f8','#c4c9ce']]},
};
let STYLE=Object.assign({mur:'brun',sol:'chene',cadre:'noir'},(()=>{try{return JSON.parse(localStorage.getItem('biome_style')||'{}')}catch(e){return {}}})());
const OPT=Object.assign({vol:70,speed:1,hq:true,vib:true,labels:true,tips:true},(()=>{try{return JSON.parse(localStorage.getItem('biome_opts')||'{}')}catch(e){return {}}})());
function saveOpt(){try{localStorage.setItem('biome_opts',JSON.stringify(OPT))}catch(e){}}
function frameCols(){return (STYLE_OPTS.cadre[STYLE.cadre]||STYLE_OPTS.cadre.noir)[1]}

// ================= JOURNAL DE BORD =================
let JOURNAL=[];const nm=c=>c.sp.vnom||(FICHES[c.sp.id]?FICHES[c.sp.id].nom:c.sp.id),icn=c=>FICHES[c.sp.id]?FICHES[c.sp.id].ic:'•';
function jlog(ic,txt){const t=simT,L=JOURNAL[JOURNAL.length-1];if(L&&L.txt===txt&&t-L.t<25){L.n++;L.t=t;return}JOURNAL.push({t,ic,txt,n:1});if(JOURNAL.length>150)JOURNAL.shift()}
// ================= SUCCÈS =================
const ACH_LIST=[
 {k:'germe',ic:'🌱',nom:'Main verte',txt:"Une graine a germé toute seule."},
 {k:'colonie',ic:'🐜',nom:'Première colonie',txt:"Une reine a fondé sa colonie."},
 {k:'fourmi50',ic:'🏰',nom:'Fourmilière géante',txt:"50 fourmis dans un même vivarium."},
 {k:'toile',ic:'🕸',nom:'Pris au piège',txt:"Une bête s'est prise dans une toile."},
 {k:'meta',ic:'🦋',nom:'Métamorphose',txt:"Une chrysalide est devenue papillon."},
 {k:'ooth',ic:'🦗',nom:'Petites mantes',txt:"Une oothèque a éclos."},
 {k:'phasme',ic:'🌿',nom:'Toutes seules',txt:"Des œufs de phasme ont éclos."},
 {k:'mousse',ic:'🟩',nom:'Tapis de mousse',txt:"Un objet entièrement couvert de mousse."},
 {k:'jardin',ic:'🌳',nom:'Jardin luxuriant',txt:"30 plantes en même temps."},
 {k:'mygale',ic:'🕷',nom:'Huit pattes et des poils',txt:"Une mygale vit dans ton vivarium."},
 {k:'biodiv',ic:'🌍',nom:'Biodiversité',txt:"8 espèces vivantes en même temps."},
 {k:'rack',ic:'🗄',nom:'Éleveur',txt:"5 vivariums dans la grande salle."},
 {k:'tube',ic:'🔗',nom:'Tous reliés',txt:"Premier tube entre deux vivariums."},
 {k:'migr',ic:'🚇',nom:'Grand voyage',txt:"Une bête est passée par un tube."},
 {k:'couve',ic:'🥚',nom:'Nurserie',txt:"Un œuf a éclos dans la couveuse."},
 {k:'star3',ic:'⭐',nom:'Perfectionniste',txt:"3 étoiles sur un niveau."},
 {k:'stars30',ic:'🌟',nom:'Collectionneur',txt:"30 étoiles dans la campagne."},
 {k:'camp',ic:'🏆',nom:'Campagne terminée',txt:"Tous les niveaux réussis."},
];
let ACH=(()=>{try{return JSON.parse(localStorage.getItem('biome_ach')||'{}')}catch(e){return {}}})();
function ach(k){if(ACH[k])return;const a=ACH_LIST.find(a=>a.k===k);if(!a)return;ACH[k]=Date.now();try{localStorage.setItem('biome_ach',JSON.stringify(ACH))}catch(e){}
  jlog('🏆','Succès : '+a.nom);toast(`${a.ic} Succès débloqué : <b>${a.nom}</b><br><small>${a.txt}</small>`)}
function toast(html){const t=document.getElementById('toast');if(!t)return;t.innerHTML=html;t.classList.remove('show');void t.offsetWidth;t.classList.add('show')}
let achT=0,prevCounts={};
function achTick(dt){achT+=dt;if(achT<2)return;achT=0;const n=counts();
  for(const id in prevCounts)if(prevCounts[id]>0&&!(n[id]>0)&&FICHES[id])jlog('⚠',`Plus aucun ${FICHES[id].nom.toLowerCase()} dans le vivarium`);prevCounts=n;
  if((n.fourmi||0)>=50)ach('fourmi50');if(plants.length>=30)ach('jardin');if(Object.keys(n).filter(k=>n[k]>0).length>=8)ach('biodiv');
  if(creatures.some(c=>!c.dead&&c.sp.vid&&c.sp.vid.includes('mygale')))ach('mygale');if(decos.some(d=>(d.moss||0)>=0.95))ach('mousse')}

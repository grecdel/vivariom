// ================= VARIANTES D'ESPÈCES =================
// chaque variante garde le comportement de son type (ou en emprunte un autre avec « beh »),
// mais change de taille, de couleurs, de vitesse et de durée de vie.
const VARS={
  fourmi:[
    {v:'noire',nom:'Fourmi noire des jardins',la:'Lasius niger',h:255,s:14,l:22,size:0.65,spd:0.95,trait:"Petite et très nombreuse, grande éleveuse de pucerons."},
    {v:'moissonneuse',nom:'Fourmi moissonneuse',la:'Messor barbarus',h:6,s:55,l:26,size:1.3,spd:0.8,trait:"Grosse tête rouge sombre : récolte et stocke les graines."}],
  puceron:[{v:'vert',nom:'Puceron vert du pois',la:'Acyrthosiphon pisum',h:110,s:70,l:45,size:1.3,trait:"Plus gros, se multiplie un peu moins vite."}],
  coccinelle:[
    {v:'2pts',nom:'Coccinelle à 2 points',la:'Adalia bipunctata',h:352,s:85,l:40,size:0.75,trait:"Petite, se contente de peu de pucerons."},
    {v:'asiatique',nom:'Coccinelle asiatique',la:'Harmonia axyridis',h:28,s:92,l:48,size:1.15,spd:1.2,decay:1.3,trait:"Orange et vorace : peut vider un vivarium de ses pucerons."}],
  cloporte:[
    {v:'boule',nom:'Cloporte-boule',la:'Armadillidium vulgare',h:220,s:10,l:30,size:0.9,trait:"Se roule en boule quand on l'inquiète."},
    {v:'mousse',nom:'Cloporte des mousses',la:'Philoscia muscorum',h:30,s:45,l:40,size:0.7,spd:1.3,trait:"Rapide, vit dans la mousse humide."}],
  lombric:[{v:'compost',nom:'Ver de compost',la:'Eisenia fetida',h:355,s:65,l:40,size:0.6,spd:1.2,trait:"Rouge et vif, adore la litière en surface."}],
  scolopendre:[
    {v:'lithobie',nom:'Lithobie',la:'Lithobius forficatus',h:25,s:55,l:32,size:0.4,spd:1.1,trait:"Petite chasseuse brune, moins dangereuse."},
    {v:'iule',nom:'Iule',la:'Ommatoiulus sabulosus',h:220,s:8,l:24,size:0.6,spd:0.35,beh:'cloporte',trait:"Mille-pattes végétarien : mange la litière comme un cloporte."}],
  araignee:[
    {v:'loup',nom:'Araignée-loup',la:'Pardosa amentata',h:30,s:35,l:30,size:1.0,spd:1.5,beh:'scolopendre',trait:"Ne tisse pas : chasse au sol, à la course."},
    {v:'sauteuse',nom:'Araignée sauteuse',la:'Salticus scenicus',h:0,s:0,l:72,size:0.45,spd:1.8,beh:'scolopendre',trait:"Minuscule et zébrée, bondit sur ses proies."},
    {v:'mygale',nom:'Mygale à genoux rouges',la:'Brachypelma hamorii',h:14,s:60,l:20,size:4.5,spd:0.45,beh:'scolopendre',decay:0.35,age:4,trait:"Énorme et lente, vit très longtemps. Chasse à l'affût au sol."},
    {v:'mygale_bleue',nom:'Mygale bleue',la:'Chromatopelma cyaneopubescens',h:200,s:70,l:38,size:3.6,spd:0.6,beh:'scolopendre',decay:0.35,age:4,trait:"Bleu métallique et pattes orange : la plus spectaculaire."}],
  abeille:[
    {v:'bourdon',nom:'Bourdon terrestre',la:'Bombus terrestris',h:45,s:70,l:30,size:1.5,spd:0.8,trait:"Gros et velu, butine même quand il fait frais."},
    {v:'syrphe',nom:'Syrphe ceinturé',la:'Episyrphus balteatus',h:48,s:95,l:52,size:0.8,spd:1.25,trait:"Imite la guêpe, pollinise en vol stationnaire."}],
  mouche:[{v:'drosophile',nom:'Drosophile',la:'Drosophila melanogaster',h:35,s:60,l:55,size:0.35,spd:0.7,trait:"Minuscule mouche des fruits, pullule vite."}],
};
const SHORT={'fourmi:noire':'F. noire','fourmi:moissonneuse':'Moissonneuse','puceron:vert':'P. vert','coccinelle:2pts':'2 points','coccinelle:asiatique':'Asiatique','cloporte:boule':'Boule','cloporte:mousse':'Mousses','lombric:compost':'Compost','scolopendre:lithobie':'Lithobie','scolopendre:iule':'Iule','araignee:loup':'Loup','araignee:sauteuse':'Sauteuse','araignee:mygale':'Mygale','araignee:mygale_bleue':'Myg. bleue','abeille:bourdon':'Bourdon','abeille:syrphe':'Syrphe','mouche:drosophile':'Drosophile'};
const VSP={};
for(const [id,list] of Object.entries(VARS))for(const V of list){const b=SPI[id];
  const sp=Object.assign({},b,{vid:id+':'+V.v,vnom:V.nom,vla:V.la,vtrait:V.trait,h:V.h??b.h,s:V.s??b.s,l:V.l??b.l,sf:b.sf*(V.size||1),spd:b.spd*(V.spd||1),beh:V.beh,vsize:V.size||1});
  if(b.fspd)sp.fspd=b.fspd*(V.spd||1);if(V.decay)sp.decay=b.decay*V.decay;if(V.age)sp.age=b.age*V.age;VSP[sp.vid]=sp;
  // la reine prend les couleurs de ses ouvrières
  if(id==='fourmi'){const r=SPI.reine;VSP['reine:'+V.v]=Object.assign({},r,{vid:'reine:'+V.v,vnom:'Reine '+V.nom.toLowerCase(),h:sp.h,s:sp.s,l:sp.l,sf:r.sf*(V.size||1)})}}
const baseOf=t=>t?String(t).split(':')[0]:t;
function spOf(t){return VSP[t]||SPI[baseOf(t)]}
// liste des outils « bêtes » : chaque type suivi de ses variantes
function allBeasts(base){const r=[];for(const id of base){r.push(id);if(VARS[id])for(const V of VARS[id])r.push(id+':'+V.v)}return r}
function spName(t){const sp=spOf(t);return sp&&sp.vnom?sp.vnom:FICHES[baseOf(t)]?FICHES[baseOf(t)].nom:t}
const realLen=c=>(REAL[c.sp.id]?REAL[c.sp.id][0]:6)*(c.sp.vsize||1);

// ================= VÉGÉTAUX =================
const PLANTS={
  fleur:{nom:'Fleur sauvage',ic:'🌸',h:[36,88],flower:true,txt:"Fleurit, nourrit les abeilles, porte les pucerons."},
  fougere:{nom:'Fougère',ic:'🌿',h:[22,42],flower:false,txt:"Pas de fleurs : se propage par spores. Aime l'ombre et l'humidité."},
  gramin:{nom:'Graminée',ic:'🌾',h:[40,72],flower:false,txt:"Fines tiges, graines portées par l'air : se ressème vite."},
  trefle:{nom:'Trèfle',ic:'☘',h:[8,14],flower:true,txt:"Couvre-sol bas qui enrichit la terre en azote."},
  ronce:{nom:'Ronce',ic:'🫐',h:[30,60],flower:true,txt:"Feuilles épaisses et mûres : le garde-manger des futurs phasmes."},
  cactus:{nom:'Cactus cierge',ic:'🌵',h:[14,40],flower:true,dry:true,txt:"Pousse dans le sable sec et chaud ; dans un sol trop humide, il pourrit."},
};
const kindOf=t=>{const k=String(t).split(':')[1];return PLANTS[k]?k:'fleur'};

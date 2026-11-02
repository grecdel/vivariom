// ================= ESPÈCES DU BIOME =================
const ROLES={mangeur:{start:45},chasseur:{start:90},tisseur:{start:80},reparateur:{start:60},decomposeur:{start:50},plante:{start:5}};
function legsFrom(seg,n,spread,L,Lk){const a=[];for(let k=0;k<n;k++){const off=n>1?spread-k*2*spread/(n-1):0,m=Lk?Lk[k]:1;for(const sd of[-1,1])a.push([seg,sd,off,k,L[0]*m,L[1]*m])}return a}
const INS=o=>({dims:[o.hd,o.th,...(o.mid||[]),o.ab],legs:legsFrom(o.ls??1,o.n||3,o.sp??45,o.L||[8,10],o.Lk)});
const ARA=o=>({dims:[o.ce,o.ab],legs:legsFrom(0,4,o.sp??60,o.L||[16,20])});
const MYR=o=>({dims:[o.hd,...Array.from({length:o.n},()=>o.sg.slice()),...(o.tl?[o.tl]:[])],legs:[],chain:{n:o.n,sg:o.sg,per:o.per??1,L:o.L||[1,1],tl:o.tl}});
const BSP=[
{id:'fourmi',nom:'Fourmi rousse',la:'Formica rufa',role:'mangeur',h:12,s:75,l:36,spd:24,hz:2.8,ant:7,f:['mandibules'],start:45,decay:0.14,age:300,...INS({hd:[4,4,'o'],th:[5,3.5,'o'],mid:[[2,2,'o']],ab:[6,5.5,'o'],L:[5,6]})},
{id:'reine',nom:'Reine fourmi',la:'Formica rufa ♀',role:'mangeur',h:5,s:80,l:40,spd:9,hz:1.2,ant:7,f:['mandibules'],start:110,decay:0.12,age:1400,...INS({hd:[5,5,'o'],th:[7,5,'o'],mid:[[2.5,2.5,'o']],ab:[13,9,'o'],L:[6,7]})},
{id:'puceron',nom:'Puceron',la:'Aphis fabae',role:'mangeur',h:100,s:70,l:55,spd:4,hz:3,ant:4,start:22,decay:0.35,age:160,...INS({hd:[2.5,2.5,'o'],th:[2.5,3.5,'o'],ab:[5,5,'o'],L:[3,3.5]})},
{id:'coccinelle',nom:'Coccinelle',la:'Coccinella septempunctata',role:'chasseur',h:2,s:85,l:45,spd:12,fspd:38,hz:1.8,ant:3,f:['points','elytres'],w:{n:2,len:10,wid:4.5,hz:22},start:65,decay:0.55,age:360,...INS({hd:[3,4,'o'],th:[2.5,6,'o'],ab:[9,9,'o'],L:[5,5.5]})},
{id:'cloporte',nom:'Cloporte',la:'Armadillidium vulgare',role:'decomposeur',h:220,s:12,l:48,spd:9,hz:1.2,ant:5,start:50,decay:0.3,age:400,...MYR({hd:[3,7,'o'],n:6,sg:[3,10,'o'],L:[3.5,3.5],tl:[2.5,6,'o']})},
{id:'lombric',nom:'Lombric',la:'Lumbricus terrestris',role:'decomposeur',h:345,s:45,l:55,spd:7,hz:0.8,start:60,decay:0.25,age:500,...MYR({hd:[3.5,4,'o'],n:13,sg:[3.5,4,'o'],per:0})},
{id:'scolopendre',nom:'Scolopendre',la:'Scolopendra cingulata',role:'chasseur',h:75,s:85,l:48,spd:20,hz:1.2,ant:8,start:100,decay:0.32,age:900,...MYR({hd:[6,7,'r'],n:9,sg:[4,7,'r'],L:[5,5.5]})},
{id:'araignee',nom:'Épeire diadème',la:'Araneus diadematus',role:'tisseur',h:28,s:85,l:42,spd:14,hz:0.8,f:['croix'],start:80,decay:0.4,age:900,...ARA({ce:[8,7,'o'],ab:[12,11,'o'],L:[12,15]})},
{id:'abeille',nom:'Abeille',la:'Apis mellifera',role:'reparateur',h:42,s:90,l:50,spd:36,fspd:36,hz:2.6,ant:5,f:['rayures'],ray:3,w:{n:2,len:9,wid:3.5,hz:26},start:60,decay:0.45,age:320,...INS({hd:[4,5,'o'],th:[5,6,'o'],ab:[8,7,'o'],L:[5,6]})},
{id:'mouche',nom:'Mouche verte',la:'Lucilia sericata',role:'decomposeur',h:150,s:80,l:45,spd:42,fspd:42,hz:2.8,ant:3,f:['yeux'],w:{n:2,len:8,wid:3.5,hz:30},start:45,decay:0.5,age:260,...INS({hd:[4,5,'o'],th:[5,6,'o'],ab:[7,6,'o'],L:[4,5]})},
];
const SC=0.95,SPI={};
const REAL={fourmi:[7,25],reine:[12,8],puceron:[2.5,2],coccinelle:[7,10,60],cloporte:[14,10],lombric:[90,6],scolopendre:[80,30],araignee:[14,20],abeille:[13,30,90],mouche:[9,35,110]};
for(const sp of BSP){
  sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;
  sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);
  sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  if(sp.chain){sp.chain.sg=[sp.chain.sg[0]*SC,sp.chain.sg[1]*SC,sp.chain.sg[2]];sp.chain.L=sp.chain.L.map(v=>v*SC);if(sp.chain.tl)sp.chain.tl=[sp.chain.tl[0]*SC,sp.chain.tl[1]*SC,sp.chain.tl[2]]}
  if(sp.w)sp.w=Object.assign({},sp.w,{len:sp.w.len*SC,wid:sp.w.wid*SC});
  sp.ant=(sp.ant||0)*SC;sp.f=sp.f||[];
  const L=sp.chain?sp.chain.L:[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);
  const dl=sp.dims.reduce((m,d)=>m+d[0],0)+(sp.chain?sp.chain.n*sp.chain.sg[0]:0);const R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];if(R[2])sp.fspd=R[2];
  SPI[sp.id]=sp;
}
// sons : chaque espèce a son timbre, sa gamme et son enveloppe
const SND={
 fourmi:{w:'noise',f:5200,q:9,d:0.012,v:0.35,sc:[0,3,7,10],sl:1},
 reine:{w:'noise',f:2400,q:5,d:0.025,v:0.45,sc:[0,5,7],sl:0.9},
 puceron:{w:'sine',f:6200,d:0.008,v:0.04,sc:[0,2,4],sl:1.05},
 coccinelle:{w:'triangle',f:1700,d:0.035,v:0.22,sc:[0,4,7,11],sl:1.35},
 cloporte:{w:'noise',f:850,q:2.5,d:0.035,v:0.45,sc:[0,1,2,3,4,5,6],sl:0.8},
 scolopendre:{w:'square',f:900,d:0.011,v:0.06,sc:[0,1,2,3,4,5,6,7,8,9,10,11,12],sl:0.95,desc:true},
 araignee:{w:'triangle',f:290,d:0.09,v:0.45,sc:[0,3,5,7,10,12,15,17],sl:0.6},
 abeille:{w:'sine',f:2500,d:0.025,v:0.16,sc:[0,2,4,7,9],sl:1.2,buzz:220},
 mouche:{w:'sawtooth',f:1300,d:0.012,v:0.05,sc:[0,6],sl:1,buzz:180},
};
SND.coccinelle.buzz=140;

// ================= FICHES =================
const FICHES={
 plante:{nom:'Plante à fleurs',ic:'🌱',role:'Producteur',mange:"L'eau et les nutriments du sol (surtout l'humus) autour de ses racines.",par:"Les pucerons sucent sa sève.",aide:"Nourrit les pucerons ; ses fleurs nourrissent les abeilles ; ses graines nourrissent les fourmis ; en mourant, elle laisse de la litière.",besoin:"Humidité du sol entre 20 % et 90 %, un sol riche. Trop sec : elle flétrit. Noyée : elle pourrit.",comp:"Pousse, fleurit, puis donne 2 graines si une abeille la pollinise (rarement seule). Une graine germe sur un sol riche et humide, loin des autres plantes."},
 fourmi:{nom:'Fourmi rousse',ic:'🐜',role:'Bâtisseuse, éleveuse',mange:"Le miellat des pucerons, les graines, les petits cadavres. Elle rapporte tout à la colonie.",par:"La scolopendre.",aide:"Protège les pucerons des coccinelles (elle les chasse). Creuse des galeries qui aèrent le sol.",besoin:"Un sol creusable (humus, terre, sable ; l'argile est très lente, la roche impossible). Une chambre trop humide noie les œufs.",comp:"La première fourmi relâchée est une reine : elle creuse un puits et une chambre, puis pond. Les ouvrières se partagent le travail : récolte, creusement (les grains forment un monticule), garde des pucerons.",com:"Pistes de phéromones vers la nourriture."},
 puceron:{nom:'Puceron',ic:'🟢',role:'Herbivore',mange:"La sève des plantes (il affaiblit la plante).",par:"Les coccinelles.",aide:"Produit du miellat, la nourriture préférée des fourmis.",besoin:"Des plantes vivantes. Il ne vole pas : il marche d'une plante à l'autre.",comp:"Se clone très vite quand il mange bien. Trop nombreux, ils tuent leur plante."},
 coccinelle:{nom:'Coccinelle',ic:'🐞',role:'Prédatrice de pucerons',mange:"Uniquement des pucerons.",par:"Peut se prendre dans la toile de l'araignée quand elle vole ; la scolopendre l'attrape au sol.",aide:"Empêche les pucerons de tuer toutes les plantes.",besoin:"Des pucerons. Les fourmis gardiennes la chassent et la fatiguent.",comp:"Vole de plante en plante, se pose, mange les pucerons un par un."},
 cloporte:{nom:'Cloporte',ic:'🪨',role:'Décomposeur',mange:"La litière (feuilles mortes) et les cadavres.",par:"La scolopendre.",aide:"Transforme la litière en humus : le sol devient riche et les plantes poussent mieux.",besoin:"Un sol humide (plus de 25 %). Au sec, il s'épuise vite.",comp:"Erre en surface et dans les galeries, à la recherche de débris."},
 lombric:{nom:'Lombric',ic:'🪱',role:'Laboureur',mange:"La litière, qu'il tire sous terre.",par:"La scolopendre, quand il passe près d'une galerie.",aide:"Enrichit le sol partout où il passe (nutriments) et recycle la litière.",besoin:"Un sol humide (plus de 30 %). Il évite la roche.",comp:"Se déplace dans la terre elle-même, sans creuser de galerie durable."},
 scolopendre:{nom:'Scolopendre',ic:'🦂',role:'Grand prédateur',mange:"Cloportes, lombrics, fourmis, coccinelles au sol.",par:"Personne… mais une troupe de fourmis la blesse.",aide:"Empêche les décomposeurs et les fourmis de proliférer.",besoin:"Des proies. Elle se reproduit lentement.",comp:"Patrouille en surface et dans les galeries, file droit sur ses proies."},
 araignee:{nom:'Épeire',ic:'🕷',role:'Tisseuse',mange:"Ce qui se colle dans sa toile : abeilles, mouches, coccinelles en vol.",par:"Personne ici.",aide:"Régule les insectes volants.",besoin:"Des plantes pour accrocher ses fils. Si la plante meurt, le fil casse.",comp:"Tend des fils entre les tiges, attend, puis court vers la proie qui vibre.",com:"Vibrations dans la toile."},
 abeille:{nom:'Abeille',ic:'🐝',role:'Pollinisatrice',mange:"Le nectar des fleurs.",par:"L'araignée (toile).",aide:"Pollinise les fleurs : chaque fleur visitée donne des graines, donc de nouvelles plantes.",besoin:"Des fleurs ouvertes. Les plantes ne fleurissent qu'une fois adultes.",comp:"Vole de fleur en fleur et fait du surplace pour butiner.",com:"Danse frétillante."},
 mouche:{nom:'Mouche verte',ic:'🪰',role:'Nettoyeuse',mange:"Les cadavres.",par:"L'araignée (toile).",aide:"Fait disparaître les cadavres et rend leurs nutriments au sol.",besoin:"Des cadavres (sinon elle meurt vite).",comp:"Arrive très vite sur un cadavre et se reproduit beaucoup quand il y en a."},
};

// ================= NIVEAUX =================
// chapitres de la campagne : chacun tourne autour d'une espèce centrale
const CHAPTERS=[
 {ic:'🌱',nom:'Le jardin',txt:"Eau, sol, recyclage et pollinisation : les bases de tout vivarium.",lv:[0,1,2]},
 {ic:'🐜',nom:'Les fourmis',txt:"Fonder une colonie, élever des pucerons, résister aux coccinelles.",lv:[3,4,5]},
 {ic:'🕷',nom:'Les araignées',txt:"Toiles, pièges et proies volantes : nourrir la tisseuse sans vider le ciel.",lv:[6,7,8]},
 {ic:'🌍',nom:'Les profondeurs',txt:"Chasseurs souterrains, sécheresse, puis toutes les espèces ensemble.",lv:[9,10,11]},
 {ic:'🌿',nom:'Les phasmes',txt:"Des brindilles vivantes qui broutent la ronce et pondent seules.",lv:[12,13]},
 {ic:'🦗',nom:'La mante religieuse',txt:"Une chasseuse à l'affût, son oothèque et ses petits cannibales.",lv:[14,15]},

 {ic:'🐌',nom:'Le jardin humide',txt:"Escargots au sol, papillons en l'air : humidité et métamorphoses.",lv:[16,17]},
 {ic:'🦂',nom:'Le désert',txt:"Scorpions, ténébrions et cactus : un vivarium sec et chaud, à éclairer la nuit aux UV.",lv:[18,19]},
 {ic:'🪲',nom:'Les coléoptères',txt:"Bousiers qui roulent leurs boules, scarabées rhinocéros et leurs larves dans le bois mort.",lv:[20,21]},
];
const LEVELS=[
 {nom:'Premières pousses',txt:"Fais pousser un petit jardin. Les plantes ont besoin d'eau : choisis 💨 Brume et touche une buse du brumisateur, en haut du vivarium. Attention, un sol noyé les fait pourrir.",sp:['plante'],stock:{plante:7},start:{plante:2},goal:{alive:['plante'],min:{plante:5},t:60},evap:1},
 {nom:'Le recyclage',txt:"Les plantes épuisent le sol. Les cloportes et les lombrics transforment la litière (🍂) en humus et le rendent riche.",sp:['plante','cloporte','lombric'],stock:{plante:5,cloporte:5,lombric:4,compost:6},start:{plante:4},goal:{alive:['plante','cloporte','lombric'],min:{plante:4},t:90},evap:1},
 {nom:'Pollinisation',txt:"Les plantes vieillissent et meurent. Sans abeilles, presque pas de graines. Garde un jardin vivant et fleuri.",sp:['plante','abeille','cloporte','lombric'],stock:{plante:4,abeille:5,cloporte:4,lombric:3,compost:4},start:{plante:6},goal:{alive:['plante','abeille','cloporte','lombric'],min:{plante:7},t:150},evap:1.2},
 {nom:'La fourmilière',txt:"Relâche une reine : elle creuse sa chambre et pond. Ses ouvrières récoltent les graines et creusent des galeries.",sp:['plante','fourmi'],stock:{plante:5,fourmi:5},start:{plante:6},goal:{alive:['plante','fourmi'],min:{fourmi:8},t:90},evap:1},
 {nom:"L'élevage",txt:"Les fourmis élèvent les pucerons pour leur miellat. Mais trop de pucerons tuent les plantes…",sp:['plante','puceron','fourmi'],stock:{plante:6,puceron:8,fourmi:4},start:{plante:6},goal:{alive:['plante','puceron','fourmi'],min:{plante:3},t:120},evap:1},
 {nom:'Les coccinelles',txt:"Les coccinelles mangent les pucerons, les fourmis les chassent. Trouve le bon dosage pour que personne ne disparaisse.",sp:['plante','puceron','fourmi','coccinelle'],stock:{plante:6,puceron:10,fourmi:4,coccinelle:4},start:{plante:7},goal:{alive:['plante','puceron','fourmi','coccinelle'],t:120},evap:1},
 {nom:'La toile',txt:"L'araignée tend ses fils entre les tiges. Elle attrape abeilles et mouches. Les mouches nettoient les cadavres.",sp:['plante','abeille','mouche','araignee','cloporte'],stock:{plante:6,abeille:6,mouche:6,araignee:2,cloporte:4,compost:4},start:{plante:7},goal:{alive:['plante','abeille','mouche','araignee','cloporte'],t:150},evap:1.1},
 {nom:'La tisseuse',txt:"Une araignée et des mouches. L'araignée a besoin de tiges hautes pour tendre ses fils : fais pousser le jardin et garde assez de mouches pour la nourrir. Les cloportes nettoient les restes.",sp:['plante','mouche','araignee','cloporte'],stock:{plante:6,mouche:7,araignee:2,cloporte:4,compost:4},start:{plante:8},goal:{alive:['plante','mouche','araignee'],t:120},evap:1},
 {nom:'Garde-manger',txt:"L'araignée attrape tout ce qui vole, même les abeilles dont les fleurs ont besoin. Astuce : sans outil, touche une abeille puis un endroit pour l'éloigner des toiles.",sp:['plante','abeille','mouche','araignee','cloporte','lombric'],stock:{plante:6,abeille:8,mouche:6,araignee:2,cloporte:4,lombric:3,compost:4},start:{plante:8},goal:{alive:['plante','abeille','mouche','araignee'],min:{abeille:3},t:150},evap:1},
 {nom:'Sous terre',txt:"La scolopendre chasse dans les galeries. Les fourmis se défendent en groupe. Protège les décomposeurs !",sp:['plante','fourmi','cloporte','lombric','scolopendre'],stock:{plante:5,fourmi:5,cloporte:6,lombric:5,scolopendre:2,compost:5},start:{plante:6},goal:{alive:['plante','fourmi','cloporte','lombric','scolopendre'],t:150},evap:1},
 {nom:'Saison sèche',txt:"La lampe chauffe : le sol sèche deux fois plus vite, le programmateur du brumisateur est en panne et les brumisations manuelles sont rationnées. Les cloportes et lombrics souffrent du sec.",sp:['plante','puceron','fourmi','coccinelle','cloporte','lombric','abeille'],stock:{plante:6,puceron:8,fourmi:4,coccinelle:3,cloporte:5,lombric:4,abeille:4,compost:4,pluie:8},start:{plante:7},goal:{alive:['plante','puceron','fourmi','coccinelle','cloporte','lombric','abeille'],t:180},evap:2.2,showers:false},
 {nom:'Le grand équilibre',txt:"Toutes les espèces ensemble. Aucune ne doit disparaître pendant 4 minutes.",sp:['plante','puceron','fourmi','coccinelle','cloporte','lombric','scolopendre','araignee','abeille','mouche'],stock:{plante:8,puceron:10,fourmi:5,coccinelle:4,cloporte:6,lombric:5,scolopendre:2,araignee:2,abeille:6,mouche:6,compost:6},start:{plante:8},goal:{alive:['plante','puceron','fourmi','coccinelle','cloporte','lombric','scolopendre','araignee','abeille','mouche'],t:240},evap:1.1},
 {nom:'Brindilles vivantes',repro:2,txt:"Les phasmes broutent les feuilles, surtout celles de la ronce. Les femelles pondent seules des œufs qui ressemblent à des graines : laisse-les éclore. Mais s'ils dévorent tout, les plantes meurent…",sp:['plante','phasme','cloporte'],kinds:['ronce','fleur'],stock:{plante:7,phasme:4,cloporte:4,compost:3},start:{plante:8},goal:{alive:['plante','phasme'],min:{phasme:6},t:150},evap:1},
 {nom:'Le roncier',txt:"Phasmes et chenilles se disputent les mêmes ronces. Les chenilles deviennent des papillons qui pondent à leur tour. Garde assez de feuillage pour tout le monde.",sp:['plante','phasme','papillon','cloporte'],kinds:['ronce','fleur'],stock:{plante:8,phasme:3,papillon:3,cloporte:4,compost:3},start:{plante:9},goal:{alive:['plante','phasme','papillon'],t:180},evap:1},
 {nom:"À l'affût",txt:"La mante se poste en haut d'une tige et attend. Mouches et pucerons passent à portée… Garde-lui des proies sans qu'elle vide le vivarium.",sp:['plante','mante','mouche','puceron','cloporte'],stock:{plante:6,mante:2,mouche:8,puceron:8,cloporte:4,compost:4},start:{plante:8},goal:{alive:['plante','mante','mouche','puceron'],t:150},evap:1},
 {nom:"L'oothèque",repro:2,txt:"Une mante bien nourrie pond une oothèque d'où sortent plusieurs petites. Attention : affamées, les mantes se mangent entre elles.",sp:['plante','mante','mouche','abeille','puceron'],stock:{plante:7,mante:2,mouche:10,abeille:6,puceron:8},start:{plante:9},goal:{alive:['plante','mante','mouche','abeille'],min:{mante:4},t:180},evap:1},
 {nom:'Après la pluie',txt:"Les escargots adorent l'humidité : au sec, ils rentrent dans leur coquille et attendent. Ils broutent les jeunes pousses et la litière.",sp:['plante','escargot','cloporte','lombric'],kinds:['fleur','trefle'],stock:{plante:7,escargot:4,cloporte:4,lombric:3,compost:5},start:{plante:8},goal:{alive:['plante','escargot','cloporte'],min:{plante:5},t:150},evap:1},
 {nom:'Métamorphose',repro:2,txt:"Œuf, chenille, chrysalide, papillon. Les chenilles dévorent, les papillons pollinisent les fleurs. Obtiens au moins 4 papillons.",sp:['plante','papillon','abeille','cloporte'],kinds:['fleur','ronce'],stock:{plante:8,papillon:3,abeille:4,cloporte:4,compost:4},start:{plante:9},goal:{alive:['plante','papillon','abeille'],min:{papillon:4},t:210},evap:1},
 {nom:'Le désert',txt:"Un vivarium de sable chaud : l'eau s'évapore très vite, le brumisateur automatique est coupé et la brume rationnée. Les cactus aiment le sec mais pourrissent dans un sol détrempé. Les ténébrions grignotent la litière et les graines ; leurs larves, les vers de farine, deviennent adultes après une nymphe. Une brume légère, de temps en temps, aide les graines de cactus à germer.",sp:['plante','tenebrion'],kinds:['cactus'],sable:true,stock:{plante:6,tenebrion:5,compost:5,pluie:6},start:{plante:6},goal:{alive:['plante','tenebrion'],min:{plante:9,tenebrion:10},t:150},evap:2.6,showers:false},
 {nom:'Lumière noire',txt:"La nuit, le scorpion sort chasser les ténébrions ; le jour, il se cache sous une pierre. Passe le néon en UV : sa carapace brille en bleu-vert ! Garde assez de ténébrions pour le nourrir.",sp:['plante','scorpion','tenebrion'],kinds:['cactus'],sable:true,stock:{plante:6,scorpion:2,tenebrion:8,compost:6,pluie:6},start:{plante:6},goal:{alive:['plante','scorpion','tenebrion'],min:{tenebrion:6},t:180},evap:2.6,showers:false},
 {nom:'Rouler sa boule',txt:"Le bousier façonne une boule de litière, la roule à reculons jusqu'à son terrier et l'enterre : le sol s'enrichit et les plantes poussent mieux. Donne-lui de la litière, sans oublier les cloportes qui la convoitent aussi.",sp:['plante','bousier','cloporte'],kinds:['fleur','gramin'],stock:{plante:7,bousier:6,cloporte:3,compost:9},start:{plante:8},goal:{alive:['plante','bousier','cloporte'],min:{plante:7,bousier:4},t:150},evap:1},
 {nom:'Le bois mort',txt:"Le scarabée rhinocéros pond dans le terreau riche, près du bois mort (pose un tronc !). Ses larves, les vers blancs, vivent sous terre et mangent l'humus, puis se changent en adultes cornus. Les bousiers enrichissent le sol pour elles.",sp:['plante','rhinoceros','bousier','cloporte'],kinds:['fleur','ronce'],stock:{plante:7,rhinoceros:3,bousier:3,cloporte:3,compost:7},start:{plante:8},goal:{alive:['plante','rhinoceros','bousier'],min:{rhinoceros:5},t:240},evap:1},
];

// ================= MONDE =================
let CS=2.5,COLS=200,ROWS=160,Y0=0,N,T,NUT,WET,DUG,STEM,SURF,WW=500,WH=400;
// Paysage sur téléphone : outils en colonne d'un côté, vues et zoom de l'autre ; la zone de jeu (W) est entre les deux.
// CVL/CVR = largeur des colonnes gauche/droite ; recalculés dans resize().
let LAND=false,CVL=0,CVR=0,BOT=128;
const TYPES=[null,{nom:'humus',h:28,s:45,l:16,hard:0.6,perm:0.6},{nom:'terre',h:22,s:50,l:15,hard:1.0,perm:0.4},{nom:'sable',h:42,s:60,l:25,hard:0.5,perm:1},{nom:'argile',h:10,s:55,l:18,hard:2.6,perm:0.1},{nom:'roche',h:220,s:8,l:22,hard:99,perm:0},{nom:'gravier',h:30,s:9,l:34,hard:3.2,perm:1}];
const K=(i,j)=>j*COLS+i;
let prevA,seenA,QA,stamp=0;
// formats de bac (bac à sable) : largeur × hauteur × profondeur en mm ; la campagne reste en Standard
const FORMATS={std:{nom:'Standard',ic:'▭',w:500,h:400,d:300,txt:'50 × 40 × 30 cm'},fourmi:{nom:'Fourmilière étroite',ic:'▯',w:300,h:400,d:60,txt:'30 × 40 × 6 cm · idéale pour voir les galeries'},grand:{nom:'Grand bac',ic:'▬',w:900,h:450,d:450,txt:'90 × 45 × 45 cm'},cube:{nom:'Cube',ic:'◻',w:300,h:300,d:300,txt:'30 × 30 × 30 cm'}};
const SOILS={foret:{nom:'Forêt',ic:'🌳',txt:'humus et terre'},desert:{nom:'Désert',ic:'🏜',txt:'sable profond et roche'},marais:{nom:'Marais',ic:'🐸',txt:'argile et terre très humide'}};
let FMT='std',SOIL0='foret';
// valeurs de départ d'une case selon le type : nutriments, humidité
const NUT0=[0,0.55,0.22,0.05,0.12,0,0.02],WET0=[0,0.45,0.42,0.3,0.55,0,0.2];
function genWorld(fmt,soil){
  FMT=FORMATS[fmt]?fmt:'std';SOIL0=SOILS[soil]?soil:'foret';const F=FORMATS[FMT];
  CS=2.5;COLS=Math.round(F.w/CS);ROWS=Math.round(F.h/CS);WW=COLS*CS;WH=ROWS*CS;N=COLS*ROWS;ZD=F.d;
  if(typeof TH==='object')TH.x=WW-26;
  T=new Uint8Array(N);NUT=new Float32Array(N);WET=new Float32Array(N);DUG=new Uint8Array(N);STEM=new Uint8Array(N);SURF=new Int16Array(COLS);
  prevA=new Int32Array(N);seenA=new Uint32Array(N);QA=new Int32Array(N);
  const base=Math.round(ROWS*0.36),p1=rnd(0,9),p2=rnd(0,9),p3=rnd(0,9),S=SOIL0;
  for(let i=0;i<COLS;i++){
    const s=base+Math.round(Math.sin(i*0.04+p1)*4+Math.sin(i*0.015+p2)*6),nh=Math.sin(i*0.07+p3)*4;
    for(let j=s;j<ROWS;j++){const d=j-s,k=K(i,j);let t;
      if(S==='desert'){if(d<ROWS*0.5+nh*2+Math.sin(i*0.03+p1)*6)t=3;else t=5}
      else if(S==='marais'){if(d<ROWS*0.12+nh)t=2;else if(d<ROWS*0.55+Math.sin(i*0.025+p2)*8)t=4;else t=5}
      else if(d<12+nh)t=1;else if(d<ROWS*0.2+nh*2)t=2;else if(d<ROWS*0.32+Math.sin(i*0.03+p1)*8)t=3;else if(d<ROWS*0.52+Math.sin(i*0.025+p2)*8)t=4;else t=5;
      T[k]=t;NUT[k]=NUT0[t]*(0.8+Math.random()*0.4);WET[k]=WET0[t];
      if(S==='desert')WET[k]*=0.45;else if(S==='marais'){WET[k]=t===5?0:0.66+Math.random()*0.12;if(t===2)NUT[k]=0.3}}
  }
  const nr=Math.round((S==='desert'?9:5)*COLS/200);
  for(let r=0;r<nr;r++){const ci=rnd(0,COLS),cj=rnd(base+(S==='desert'?14:30),ROWS),R=rnd(5,11);for(let i=Math.max(0,Math.floor(ci-R-1));i<Math.min(COLS,ci+R+1);i++)for(let j=0;j<ROWS;j++)if(Math.hypot(i-ci,(j-cj)*1.3)<R&&T[K(i,j)]){T[K(i,j)]=5;WET[K(i,j)]=0;NUT[K(i,j)]=0}}
  for(let i=0;i<COLS;i++)surfCol(i);
  decoReset();soilDirty=true;
}
function surfCol(i){let j=0;while(j<ROWS&&!T[K(i,j)])j++;SURF[i]=j}
// pinceau de substrat (bac à sable) : dépose ou retire une couche à la surface autour de x (mm)
const SUBS={humus:1,terre:2,sable:3,argile:4,gravier:6};
function soilBrush(kind,x){const i0=clamp(Math.floor(x/CS),0,COLS-1),add=kind!=='creuser',t=SUBS[kind]||2,minTop=Math.max(14,Math.round(ROWS*0.12));let n=0;
  const lo=Math.max(0,i0-12),hi=Math.min(COLS-1,i0+12),old={},lock=i=>colonies.some(c=>!c.dead&&Math.abs(c.i-i)<=1);// on ne bouche pas l'entrée d'une fourmilière
  const top=i=>{let j=0;while(j<ROWS&&!T[K(i,j)]&&!DUG[K(i,j)])j++;return j};
  for(let i=lo;i<=hi;i++)old[i]=SURF[i];
  for(let i=Math.max(0,i0-2);i<=Math.min(COLS-1,i0+2);i++){if(lock(i))continue;
    const jt=top(i),th=Math.abs(i-i0)<=1?2:1;let ch=0;
    if(add){for(let q=0;q<th;q++){const j=jt-1-q;if(j<minTop)break;const k=K(i,j);T[k]=t;DUG[k]=0;NUT[k]=NUT0[t]*(0.9+Math.random()*0.2);WET[k]=WET0[t];ch++}}
    else{for(let j=jt;j<Math.min(ROWS-4,jt+8)&&ch<th;j++){const k=K(i,j);if(!T[k])continue;T[k]=0;DUG[k]=0;NUT[k]=0;WET[k]=0;ch++}}
    n+=ch}
  if(!n)return 0;
  // talus : un tas trop raide s'éboule sur les côtés (pente de 2 cases au plus)
  if(add)for(let it=0;it<30;it++){let mv=0;
    for(let i=lo;i<=hi;i++){if(lock(i))continue;const jt=top(i);if(jt>=ROWS)continue;const k=K(i,jt);if(T[k]!==t)continue;
      for(const d of (it&1?[1,-1]:[-1,1])){const ni=i+d;if(ni<lo||ni>hi||lock(ni))continue;const nt=top(ni);if(nt-jt>2){const nk=K(ni,nt-1);T[nk]=T[k];NUT[nk]=NUT[k];WET[nk]=WET[k];DUG[nk]=0;T[k]=0;NUT[k]=0;WET[k]=0;mv++;break}}}
    if(!mv)break}
  const cols=[];
  for(let i=lo;i<=hi;i++){surfCol(i);if(SURF[i]===old[i])continue;cols.push(i);
    // les plantes de la colonne suivent la nouvelle surface
    for(const p of plants)if(p.alive&&p.col===i&&p.base===old[i]-1){
      for(let r=0;r<p.h;r++){const k=K(i,p.base-r);if(k>=0&&STEM[k])STEM[k]--}
      p.base=SURF[i]-1;p.h=Math.max(1,Math.min(p.h,p.base-4));for(let r=0;r<p.h;r++)STEM[K(i,p.base-r)]++}}
  const c0=cols.length?Math.min(...cols):i0,c1=cols.length?Math.max(...cols):i0;
  for(const it of items)if(!it.dead&&!it.carried&&!it.p&&it.i>=c0&&it.i<=c1)settleItem(it);
  for(const c of creatures){if(c.dead||c.fly||baseOf(c.sp.id)==='lombric')continue;const ii=Math.floor(c.x/CS);if(ii<c0-1||ii>c1+1)continue;
    if(Math.abs((c.y-surfY(ii))/CS)>10)continue;const k=cellOf(c.x,c.y);if(T[k]||!walkK(k)){c.k=findWalk(c.x,surfY(ii)-1);const [a,b]=cxy(c.k);c.x=a;c.y=b;c.path=null}}
  decoSettle();soilDirty=true;if(typeof gTopT==='number')gTopT=-9;return n}
function sol(i,j){if(i<0||i>=COLS||j>=ROWS)return true;if(j<0)return false;return T[K(i,j)]>0}
function walk(i,j){if(i<0||i>=COLS||j<0||j>=ROWS)return false;const k=K(i,j);if(T[k])return false;if(STEM[k]||(SUP&&SUP[k]))return true;return sol(i,j+1)||sol(i-1,j)||sol(i+1,j)||sol(i,j-1)}
const walkK=k=>walk(k%COLS,(k/COLS)|0);
function cellOf(x,y){return K(clamp(Math.floor(x/CS),0,COLS-1),clamp(Math.floor((y-Y0)/CS),0,ROWS-1))}
function cxy(k){const i=k%COLS,j=(k-i)/COLS;return [i*CS+CS/2,Y0+j*CS+CS/2]}
function surfY(i){return Y0+SURF[clamp(i,0,COLS-1)]*CS}
const DI=[1,-1,0,0,1,1,-1,-1],DJ=[0,0,1,-1,1,-1,1,-1];
function bfs(sk,goal,maxN=14000){
  if(sk==null)return null;if(goal(sk))return [];
  stamp++;let h=0,t=0;QA[t++]=sk;seenA[sk]=stamp;prevA[sk]=-1;
  while(h<t&&t<maxN){const k=QA[h++];const i=k%COLS,j=(k-i)/COLS;
    for(let d=0;d<8;d++){const ni=i+DI[d],nj=j+DJ[d];if(ni<0||nj<0||ni>=COLS||nj>=ROWS)continue;const nk=nj*COLS+ni;if(seenA[nk]===stamp||!walk(ni,nj))continue;if(d>3&&sol(ni,j)&&sol(i,nj))continue;
      seenA[nk]=stamp;prevA[nk]=k;if(goal(nk)){const p=[nk];let x=k;while(x!==sk){p.push(x);x=prevA[x]}return p.reverse()}QA[t++]=nk}}
  return null;
}
function findWalk(x,y){const k0=cellOf(x,y),i0=k0%COLS,j0=(k0-i0)/COLS;
  for(let r=0;r<5;r++)for(let di=-r;di<=r;di++)for(let dj=-r;dj<=r;dj++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(walk(i0+di,j0+dj))return K(i0+di,j0+dj)}
  return K(i0,Math.max(0,SURF[i0]-1));
}
// ================= PLANTES & OBJETS =================
let plants=[],items=[],pid=0,colonies=[],drops=[],clouds=[];
// profondeur du terrarium (mm) : tout ce qui vit en surface occupe aussi la profondeur z
let ZD=300;let CURC=null;
const dist3=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
function newPlant(i,force,z,kind){kind=PLANTS[kind]?kind:'fleur';const PK=PLANTS[kind];if(z==null)z=rnd(8,ZD-30);z=clamp(z,4,ZD-20);
  i=clamp(i,2,COLS-3);const j=SURF[i]-1;if(j<12)return null;
  if(!force&&plants.some(p=>p.alive&&Math.hypot((p.col-i)*CS,p.z-z)<25))return null;
  const p={id:pid++,col:i,z,kind,base:j,h:1,maxH:Math.floor(rnd(PK.h[0],PK.h[1])),e:3,age:0,maxAge:rnd(200,320),fl:{open:false,nectar:0,poll:false,t:0,seedT:0},alive:true,hue:rnd(95,140),aph:0,wet:0.4};
  STEM[K(i,j)]++;plants.push(p);return p;
}
function plantAtK(k,z){if(k==null||!STEM[k])return null;const i=k%COLS,j=(k-i)/COLS;let b=null,bd=1e9;for(const p of plants)if(p.alive&&p.col===i&&j<=p.base&&j>p.base-p.h){if(z==null)return p;const d=Math.abs(p.z-z);if(d<bd){bd=d;b=p}}return b}
function killPlant(p){if(!p.alive)return;jlog('🥀',`${(PLANTS[p.kind||'fleur']||{}).nom||'Une plante'} est morte`);p.alive=false;for(let r=0;r<p.h;r++){const k=K(p.col,p.base-r);if(STEM[k])STEM[k]--}
  const n=2+Math.floor(p.h/14);for(let q=0;q<n;q++)groundItem('litiere',p.col+Math.round(rnd(-10,10)),{val:2,z:p.z+rnd(-14,14)});
  for(const st of strands)if(st.a.p===p||st.b.p===p)st.life=0;
}
function groundItem(type,i,o={}){i=clamp(i,0,COLS-1);const it=Object.assign({type,i,age:0,val:1},o);it.z=clamp(it.z??rnd(5,ZD-20),2,ZD-8);it.x=i*CS+CS/2+rnd(-1.5,1.5);it.y=surfY(i)-2;it.k=K(i,Math.max(0,SURF[i]-1));items.push(it);return it}
function settleItem(it){if(it.p)return;const i=it.i;it.y=surfY(i)-2;it.k=K(i,Math.max(0,SURF[i]-1))}
function updPlant(p,dt){
  p.age+=dt;const i=p.col;
  // racines : eau et nutriments
  let w=0,n=0,cnt=0;
  for(let di=-2;di<=2;di++)for(let dj=1;dj<=18;dj+=1){const ii=i+di,jj=p.base+dj;if(ii<0||ii>=COLS||jj>=ROWS)continue;const k=K(ii,jj);if(!T[k]||T[k]===5)continue;cnt++;w+=WET[k];
    const take=Math.min(NUT[k],0.0015*dt);NUT[k]-=take;n+=take;WET[k]=Math.max(0,WET[k]-0.0008*dt)}
  w=cnt?w/cnt:0;p.wet=w;
  const water=w<0.15?-1:w>0.9?-0.6:1;
  const lf=lightF();p.e+=(dt*(water>0?0.12:0)+n*7)*lf;
  p.e-=dt*(0.0025*p.h+(water<0?(w<0.15?0.25:0.12):0)+p.aph*0.09);
  if(p.e>1.2&&p.h<p.maxH){const j=p.base-p.h;if(j>4&&!T[K(i,j)]){p.e-=0.3;STEM[K(i,j)]++;p.h++}}
  const f=p.fl;
  const PK=PLANTS[p.kind||'fleur'];
  if(p.kind==='trefle'&&Math.random()<dt*0.5)addNut(i,p.base+2,0.02);
  if(!PK.flower&&p.h>=p.maxH&&p.e>0&&Math.random()<dt*(p.kind==='gramin'?0.012:0.006)){groundItem('graine',i+Math.round(rnd(4,45))*(Math.random()<0.5?-1:1),{val:3,z:p.z+rnd(-50,50),kind:p.kind});p.e-=0.3}
  if(PK.flower&&p.h>=p.maxH){if(f.t>0)f.t-=dt;else if(!f.open&&p.e>0){f.open=true;f.nectar=1;dbg('open')}
    if(f.open){f.nectar=Math.min(3,f.nectar+0.18*dt);
      if(f.poll){f.seedT+=dt;if(f.seedT>8){dbg('seedPoll');for(let s=0;s<2;s++)groundItem('graine',i+Math.round(rnd(4,40))*(Math.random()<0.5?-1:1),{val:3,z:p.z+rnd(-45,45),kind:p.kind});f.open=false;f.poll=false;f.seedT=0;f.t=22;p.e-=0.5}}
      else if(Math.random()<dt*0.01){groundItem('graine',i+Math.round(rnd(4,35))*(Math.random()<0.5?-1:1),{val:3,z:p.z+rnd(-40,40),kind:p.kind});f.t=20;f.open=false}}}
  if(p.e<-3||p.age>p.maxAge){dbg(p.e<-3?'pStarve':'pOld');killPlant(p)}
}
function updItems(dt){
  for(const it of items){it.age+=dt;
    if(it.type==='graine'){if(it.age>18&&!it.carried){const i=it.i,k=K(i,SURF[i]);
        if(SURF[i]<ROWS&&NUT[k]>0.08&&WET[k]>0.18&&WET[k]<0.9&&plants.filter(p=>p.alive).length<Math.round((lvl.cap||18)*1.5)&&Math.random()<dt*0.3){if(newPlant(i,false,it.z,it.kind)){jlog('🌱','Une graine a germé');ach('germe');dbg('germ');it.dead=true;continue}else dbg('germFail')}}
      if(it.age>70){dbg('seedRot');it.dead=true;addNut(it.i,SURF[it.i],0.2)}}
    else if(it.type==='litiere'){if(it.age>120){it.dead=true;addNut(it.i,SURF[it.i],0.25)}}
    else if(it.type==='cadavre'){if(it.age>45){it.dead=true;addNut(it.i,SURF[it.i],0.35)}}
    else if(it.type==='miellat'){if(!it.p||!it.p.alive||it.age>25){it.dead=true}}
  }
  hatchEggs(dt);
  if(items.some(it=>it.dead))items=items.filter(it=>!it.dead);
}
function addNut(i,j,amt){for(let di=-3;di<=3;di++)for(let dj=0;dj<6;dj++){const ii=i+di,jj=j+dj;if(ii<0||ii>=COLS||jj<0||jj>=ROWS)continue;const k=K(ii,jj);if(T[k]&&T[k]!==5){NUT[k]=Math.min(1,NUT[k]+amt/12)}}soilDirty=true}
// ================= EAU =================
let hydroT=0;
function hydro(dt){
  const ev=lvl.evap*0.0028*dt*evapF();
  for(let i=0;i<COLS;i++){const j=SURF[i];if(j>=ROWS)continue;for(let d=0;d<2;d++){const k=K(i,j+d);if(T[k])WET[k]=Math.max(0,WET[k]-ev*EVF[i]*(1-d*0.5))}}
  for(let j=ROWS-2;j>=0;j--)for(let i=0;i<COLS;i++){const k=j*COLS+i,t=T[k];if(!t||t===5)continue;const kb=k+COLS,tb=T[kb];
    if(tb&&tb!==5){const pm=Math.min(TYPES[t].perm,TYPES[tb].perm),df=WET[k]-WET[kb];const d=df>0?df*0.2*pm*dt:df*0.04*Math.max(0.3,pm)*dt;if(WET[kb]+d<=1){WET[k]-=d;WET[kb]+=d}}
    if(i<COLS-1){const kr=k+1,tr=T[kr];if(tr&&tr!==5){const d=(WET[k]-WET[kr])*0.08*dt*2;WET[k]-=d;WET[kr]+=d}}}
  decoHydro(dt);soilDirty=true;
}
function nozzles(){const n=Math.max(3,Math.round(WW/72)),a=[];for(let q=0;q<n;q++)a.push((q+0.5)*WW/n);return a}
function rainAt(x,dur){const nz=nozzles();let best=nz[0];for(const v of nz)if(Math.abs(v-x)<Math.abs(best-x))best=v;const ex=clouds.find(c=>c.x===best);if(ex)ex.t=Math.max(ex.t,dur);else clouds.push({x:best,t:dur})}

// ================= CRÉATURES =================
let creatures=[],strands=[],tags=[],rings=[],waves=[],phero=[],newborns=[];
function spacing(c,i){return (c.dims[i-1][0]+c.dims[i][0])/2+0.8}
function mk(sp,x,y,o={}){
  if(typeof sp==='string')sp=SPI[sp];
  const c={sp,role:sp.role,x,y,z:o.z??0,tz:o.z??0,ang:o.ang??(Math.random()<0.5?0:Math.PI),v:0,energy:o.energy??sp.start,age:0,dead:false,state:'idle',t:rnd(0,1),path:null,k:null,
    segs:[],legs:[],alt:0,fly:false,phase:Math.random(),beatT:9,beats:0,flap:rnd(0,TAU),swell:1,load:null};
  c.hue=sp.h+rnd(-6,6);c.sat=sp.s;c.lig=sp.l;
  c.dims=sp.chain?[sp.dims[0].slice(),...Array.from({length:sp.chain.n},()=>sp.chain.sg.slice()),...(sp.chain.tl?[sp.chain.tl.slice()]:[])]:sp.dims.map(d=>d.slice());
  let px=x/sp.sf,py=y/sp.sf;
  for(let i=0;i<c.dims.length;i++){if(i){const s=spacing(c,i);px-=Math.cos(c.ang)*s;py-=Math.sin(c.ang)*s}c.segs.push({x:px,y:py,a:c.ang})}
  if(sp.chain){const last=sp.chain.tl?c.dims.length-1:c.dims.length;for(let i=1;i<last;i++)addChainLegs(c,i)}
  else sp.legs.forEach(l=>addLeg(c,...l));
  colors(c);
  return c;
}
function addLeg(c,seg,side,off,p,L1,L2){const l={seg,side,off,p,L1,L2,step:0,fx:0,fy:0,hx:0,hy:0,sx:0,sy:0,tx:0,ty:0};const r=restPos(c,l);l.fx=r[2];l.fy=r[3];l.hx=r[0];l.hy=r[1];c.legs.push(l)}
function addChainLegs(c,i){const ch=c.sp.chain;for(let j=0;j<ch.per;j++){const o=(i%2?8:-8)-j*14;addLeg(c,i,-1,o,i*ch.per+j,ch.L[0],ch.L[1]);addLeg(c,i,1,-o,i*ch.per+j,ch.L[0],ch.L[1])}}
function moveBody(c,dt){
  const sp=c.sp;if(sp.w)c.flap+=dt*sp.w.hz*TAU*(c.fly?1:0.02);
  const F=sp.sf,vd=c.v/F;c.walkPh=(c.walkPh||0)+vd*dt/Math.max(1.5,sp.thresh*1.6)*TAU*0.5;
  const s0=c.segs[0];s0.x=c.x/F;s0.y=c.y/F;s0.a=c.ang;
  for(let i=1;i<c.segs.length;i++){const p=c.segs[i-1],g=c.segs[i];const a=Math.atan2(p.y-g.y,p.x-g.x),s=spacing(c,i);g.x=p.x-Math.cos(a)*s;g.y=p.y-Math.sin(a)*s;g.a=a}
  const th=sp.thresh,moving=vd>1;
  for(const l of c.legs){
    const r=restPos(c,l);l.hx=r[0];l.hy=r[1];
    if(c.fly){l.step=0;l.fx=l.hx+(r[2]-l.hx)*0.35;l.fy=l.hy+(r[3]-l.hy)*0.35;continue}
    if(l.step>0){l.step+=dt/0.11;const t=Math.min(1,l.step),e=t*t*(3-2*t);l.fx=l.sx+(l.tx-l.sx)*e;l.fy=l.sy+(l.ty-l.sy)*e;if(t>=1){l.step=0;beep(c,l)}}
    else{const d=dist(l.fx,l.fy,r[2],r[3]);
      if(d>th*(moving?1:1.8)){const blocked=d<th*2.6&&c.legs.some(o=>o!==l&&o.step>0&&((o.side===l.side&&Math.abs(o.p-l.p)===1)||(o.side!==l.side&&o.p===l.p)));
        if(!blocked){l.step=1e-4;l.sx=l.fx;l.sy=l.fy;const lead=moving?th*0.55:0;l.tx=r[2]+Math.cos(c.ang)*lead;l.ty=r[3]+Math.sin(c.ang)*lead}}}
  }
  if(sp.w&&c.fly){const n=Math.floor(c.flap/TAU);if(n!==c.flapN){c.flapN=n;if(n%4===0)beep(c,null)}}
}
// --- déplacements ---
function goTo(c,goal,maxN){if(c.k==null)c.k=findWalk(c.x,c.y);const p=bfs(c.k,goal,maxN);c.path=p;return !!p}
function stepPath(c,dt,mul=1){
  if(!c.path||!c.path.length){c.v=0;return true}
  const k=c.path[0];if(!walkK(k)&&!c.digging){c.path=null;c.v=0;return true}
  const [tx,ty]=cxy(k),dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy),sp=c.sp.spd*mul;
  if(d>0.01){const a=Math.atan2(dy,dx);c.ang+=clamp(angDiff(c.ang,a),-9*dt,9*dt)}
  if(d<=sp*dt){c.x=tx;c.y=ty;c.k=k;c.path.shift()}else{c.x+=dx/d*sp*dt;c.y+=dy/d*sp*dt}
  c.v=sp;return false;
}
function randomWalk(c,n=12){goTo(c,k=>Math.random()<1/(n*3),900)}
function gravity(c,dt){ // marcheur dont le support a disparu
  if(c.fly||c.sp.id==='lombric'||c.sp.id==='araignee')return false;
  const k=cellOf(c.x,c.y),i=k%COLS,j=(k-i)/COLS;
  if(walk(i,j)||c.digging)return false;
  if(T[k]){c.y-=CS;c.k=null;c.path=null;return true}
  c.y+=80*dt;c.k=null;c.path=null;c.v=0;return true;
}
function flyTo(c,tx,ty,dt,mul=1){const a=Math.atan2(ty-c.y,tx-c.x);c.ang+=clamp(angDiff(c.ang,a),-5*dt,5*dt);const sp=(c.sp.fspd||c.sp.spd)*mul;
  c.x+=Math.cos(c.ang)*sp*dt;c.y+=Math.sin(c.ang)*sp*dt+Math.sin(c.age*7+c.phase*9)*6*dt;c.v=sp;airClamp(c)}
function flyWander(c,dt){c.wa=(c.wa||0)+rnd(-4,4)*dt;c.wa=clamp(c.wa*0.98,-1.5,1.5);c.ang+=c.wa*dt;const sp=(c.sp.fspd||c.sp.spd)*0.55;c.x+=Math.cos(c.ang)*sp*dt;c.y+=Math.sin(c.ang)*sp*dt;c.v=sp;
  if(c.x<15||c.x>WW-15||c.y<Y0+20||c.y>surfY(Math.floor(c.x/CS))-15){c.ang+=angDiff(c.ang,Math.atan2(Y0+(surfY(COLS>>1)-Y0)*0.5-c.y,WW/2-c.x))*dt*3}airClamp(c)}
function airClamp(c){c.x=clamp(c.x,4,WW-4);const sy=surfY(Math.floor(c.x/CS))-2;c.y=clamp(c.y,Y0+10,sy);const k=cellOf(c.x,c.y);if(T[k])c.y-=CS}
function land(c){c.fly=false;c.k=findWalk(c.x,c.y);const [x,y]=cxy(c.k);c.x=x;c.y=y;c.path=null}
function takeOff(c){c.fly=true;c.path=null;c.k=null}
function nearest(c,list,maxd=1e9){let b=null,bd=maxd;for(const o of list){if(o.dead)continue;const d=dist3(c,o);if(d<bd){bd=d;b=o}}return b}
function byId(id){return creatures.filter(o=>!o.dead&&o.sp.id===id)}
let pop={};
function die(c,by){
  if(c.dead)return;c.dead=true;if(by&&by!=='meta'&&by.sp)jlog(icn(by),`${nm(by)} a mangé : ${nm(c)}`);else if(!by)jlog('💀',`${nm(c)} est mort${c.energy<=0?' de faim':' de vieillesse'}`);if(c.strand)c.strand.life=0;
  if(c.load&&c.load.it)c.load.it.carried=false;
  if(by)return;
  const i=clamp(Math.floor(c.x/CS),0,COLS-1);
  if(c.sp.id==='lombric'){addNut(i,Math.floor((c.y-Y0)/CS),0.6);return}
  const it={type:'cadavre',i,age:0,val:c.sp.mass>4?3:1,c,x:c.x,y:c.y,z:c.z||0,k:findWalk(c.x,c.y)};items.push(it);
}
function canRepro(id,cap){return (pop[id]||0)<cap&&creatures.length+newborns.length<170}
function born(id,x,y,o){if(typeof id==='string'&&CURC&&CURC.sp.vid&&(id===CURC.sp.id||id===CURC.sp.beh))id=CURC.sp;const b=mk(id,x,y,o);id=b.sp.id;b.z=b.tz=clamp(o&&o.z!=null?o.z:(CURC?(CURC.z||0)+rnd(-8,8):0),0,ZD-10);newborns.push(b);pop[id]=(pop[id]||0)+1;return b}

// ----- PUCERON -----
function uPuceron(c,dt){
  if(gravity(c,dt))return;
  const p=plantAtK(c.k);
  if(p){c.energy+=1.6*dt;c.honey=(c.honey||0)+dt;
    if(c.honey>6){c.honey=0;if(items.filter(it=>it.type==='miellat'&&it.p===p).length<5)items.push({type:'miellat',x:c.x+rnd(-2,2),y:c.y+3,z:p.z+rnd(-1.5,1.5),k:c.k,p,val:2,age:0})}
    if(!c.path||!c.path.length){if(Math.random()<dt*0.15)goTo(c,k=>plantAtK(k)===p&&Math.random()<0.08,500)}
  }else if(!c.path||!c.path.length){c.t-=dt;if(c.t<=0){c.t=2;if(!goTo(c,k=>{const q=plantAtK(k);return q&&q.aph<8},2500))randomWalk(c)}}
  stepPath(c,dt);
  if(c.energy>34&&canRepro('puceron',34)){c.energy-=14;const b=born('puceron',c.x,c.y,{energy:16});b.k=c.k}
}
// ----- COCCINELLE -----
function uCoccinelle(c,dt){
  c.cd=(c.cd||0)-dt;
  if(!c.fly){for(const a of creatures)if(!a.dead&&a.sp.id==='fourmi'&&dist3(a,c)<9){c.energy-=7;takeOff(c);c.cd=3;puff(a,'#ff6a3a',8,18,1.2);break}}
  if(c.fly){
    // refuge : quand il reste très peu de pucerons, elle ne les trouve plus
    const hungry=c.energy<90&&c.cd<=0&&(pop.puceron||0)>3;const pr=hungry?nearest(c,byId('puceron')):null;
    if(pr){c.prey=pr;flyTo(c,pr.x,pr.y-3,dt);if(dist3(c,pr)<6){land(c);c.prey=pr}}else flyWander(c,dt);
  }else{
    if(gravity(c,dt))return;
    let pr=c.prey;if(!pr||pr.dead||dist3(c,pr)>30){pr=nearest(c,byId('puceron'),30);c.prey=pr;c.path=null}
    if(!pr){takeOff(c);return}
    if(dist3(c,pr)<3.5){die(pr,c);c.energy+=16;c.path=null;c.cd=11;takeOff(c);wave({x:c.x,y:c.y,max:16,sp:50,col:c.cLine,a:0.6})}
    else{if(!c.path||!c.path.length)goTo(c,k=>k===pr.k,1500);if(!c.path){takeOff(c);return}stepPath(c,dt)}
  }
  // ponte sur une plante où il y a des pucerons (la nourriture des petits)
  if(c.energy>96&&canRepro('coccinelle',6-eggsOf('coccinelle'))){c.energy-=45;const p=plants.find(q=>q.alive&&q.aph>0)||plants.find(q=>q.alive);groundItem('oeuf',p?p.col:Math.floor(c.x/CS),{val:1,sp:c.sp.vid||'coccinelle',z:p?p.z:c.z,hatch:20,n:2});jlog('🐞','Une coccinelle pond près des pucerons')}
}
// ----- FOURMIS -----
function newColony(i){jlog('🐜','Une reine fonde une colonie');ach('colonie');i=clamp(i,10,COLS-11);const col={i,entr:K(i,SURF[i]-1),food:9,eggs:[],cells:[],chamber:new Set(),queen:null,dead:false,home:null};colonies.push(col);return col}
function digCell(k,col){const t=T[k];T[k]=0;DUG[k]=1;soilDirty=true;const i=k%COLS;surfCol(i);if(col)col.cells.push(k);return t}
function uReine(c,dt){
  const col=c.col;
  if(c.state==='found'){
    if(c.path&&c.path.length){stepPath(c,dt,2.5);return}
    const k=c.plan[0];if(k==null){c.state='nest';col.queen=c;col.home=c.k;return}
    if(!T[k]){c.plan.shift();if(c.plan.length&&c.plan[0]!=null){c.path=[k]}return}
    if(T[k]===5){c.plan=[];return}
    c.t+=dt;c.v=0;if(c.t>=TYPES[T[k]].hard*0.14*(1+WET[k])){c.t=0;digCell(k,col);if(c.chamberStart&&c.planIdx>=c.chamberStart)col.chamber.add(k);c.planIdx=(c.planIdx||0)+1;c.plan.shift();c.path=[k];c.digging=true}
    return;
  }
  c.digging=false;
  if(c.path&&c.path.length){stepPath(c,dt,0.6);return}
  if(Math.random()<dt*0.2&&col.chamber.size)goTo(c,k=>col.chamber.has(k)&&Math.random()<0.3,200);
  c.t+=dt;
  if(c.t>5){c.t=0;
    const workers=creatures.filter(o=>!o.dead&&o.col===col&&o.sp.id==='fourmi').length;
    if(col.food>=3&&workers+col.eggs.length<35){col.food-=3;col.eggs.push({t:0,k:[...col.chamber][Math.floor(Math.random()*col.chamber.size)]||c.k})}
    else if(workers<6&&col.eggs.length<2&&c.energy>45){c.energy-=12;col.eggs.push({t:0,k:c.k})}} // fondation : la reine pond sur ses réserves
  if(c.energy<90&&col.food>=1&&Math.random()<dt*0.5){col.food-=1;c.energy+=10}
}
// galeries : quelques « têtes » qui avancent en ligne (horizontale ou en pente), se ramifient,
// et s'élargissent en petite chambre de temps en temps
function antDigTarget(col){col.heads=col.heads||[];col.heads=col.heads.filter(h=>!h.dead&&h.n<60);
  const ok=(i,j)=>i>=1&&i<COLS-1&&j<ROWS-2&&j>SURF[i]+3&&T[K(i,j)]&&T[K(i,j)]!==5&&WET[K(i,j)]<=0.9;
  if(col.heads.length<2+Math.floor(col.cells.length/80)&&(Math.random()<0.25||!col.heads.length)){
    const src=Math.random()<0.5&&col.chamber.size?[...col.chamber]:col.cells;const from=src[Math.floor(Math.random()*src.length)];
    if(from!=null)col.heads.push({k:from,di:Math.random()<0.5?-1:1,dj:Math.random()<0.45?1:0,n:0,fail:0})}
  for(let tries=0;tries<4&&col.heads.length;tries++){const h=col.heads[Math.floor(Math.random()*col.heads.length)];
    const i=h.k%COLS,j=(h.k-i)/COLS;
    // petite chambre tous les 9 pas : on creuse au-dessus / en dessous de la galerie
    if(h.n>0&&h.n%9===0&&!h.room){h.room=1;for(const dj of [-1,1,2]){if(ok(i,j+dj))return {k:K(i,j+dj),from:h.k,h:null}}}
    if(h.n%9!==0)h.room=0;
    if(Math.random()<0.18)h.dj=h.dj?0:1;if(Math.random()<0.05)h.di=-h.di;
    let ti=i+h.di,tj=j+h.dj;if(!ok(ti,tj)){tj=j;if(!ok(ti,tj)){h.di=-h.di;ti=i+h.di;if(!ok(ti,tj)){h.dead=true;continue}}}
    return {k:K(ti,tj),from:h.k,h}}
  return null}
function updColony(col,dt){
  if(col.dead)return;
  for(const e of col.eggs){e.t+=dt;if(WET[e.k]>0.85)e.dead=true;else if(e.t>10){e.dead=true;const [x,y]=cxy(e.k);const b=born(col.wsp||'fourmi',x,y,{energy:40});b.col=col;b.k=e.k}}
  col.eggs=col.eggs.filter(e=>!e.dead);
  if(col.queen&&col.queen.dead){col.queen=null}
  if(!col.queen&&!creatures.some(o=>!o.dead&&o.col===col)){col.dead=true}
}
let foodMap=new Map();const DBG={};const dbg=k=>DBG[k]=(DBG[k]||0)+1;
function uFourmi(c,dt){
  const col=c.col;
  if(gravity(c,dt))return;
  if(!col||col.dead){if(!c.path||!c.path.length)randomWalk(c,20);stepPath(c,dt);return}
  c.digging=false;
  if(c.path&&c.path.length){
    if(c.state==='return'&&(c.tr=(c.tr||0)-dt)<=0){c.tr=0.25;phero.push({x:c.x,y:c.y,z:c.z,vx:0,vy:0,life:8,max:8,col:c.cLine,sp:c.sp,food:true})}
    if(c.state==='go'&&c.goal&&(c.goal.dead||c.goal.carried)){c.path=null;c.state='idle';return}
    stepPath(c,dt);return}
  switch(c.state){
    case 'idle':{
      c.t-=dt;if(c.t>0)return;c.t=rnd(0.3,1);
      const workers=pop.fourmi||1;
      if(c.energy<22&&col.food>=1){c.state='eat';if(!goTo(c,k=>col.chamber.has(k),20000))c.state='idle';break}
      // répartition du travail : creuser même quand la colonie a faim (sinon les galeries ne s'étendent jamais)
      const r=Math.random(),hungry=col.food<10+workers*1.2,canDig=col.cells.length<150+workers*30,pDig=canDig?(!foodMap.size?0.65:hungry?0.3:0.45):0; // rien à ramasser : autant creuser
      if(r<pDig){c.state='dig';const tgt=antDigTarget(col);if(!tgt){c.state='idle';break}
        c.dig=tgt.k;c.digFrom=tgt.from;c.head=tgt.h;if(!goTo(c,k=>k===tgt.from,20000)){if(tgt.h&&++tgt.h.fail>3)tgt.h.dead=true;c.state='idle'}else c.state='dig2';break}
      if(hungry||r<pDig+0.35){ // récolte
        let best=null,bd=1e9;for(const it of foodMap.values()){if(it.carried)continue;const d=dist3(c,it);if(d<bd){bd=d;best=it}}
        if(best&&goTo(c,k=>foodMap.get(k)===best,22000)){c.goal=best;c.state='go'}
        else{c.state='explore';const ti=clamp(col.i+Math.round(rnd(-70,70)),0,COLS-1);goTo(c,k=>k===K(ti,SURF[ti]-1),20000)||randomWalk(c)}
      }else if(false){c.state='dig';
        const from=Math.random()<0.3&&col.chamber.size?[...col.chamber][Math.floor(Math.random()*col.chamber.size)]:col.cells[Math.floor(Math.random()*col.cells.length)];
        if(from==null){c.state='idle';break}
        const i=from%COLS,j=(from-i)/COLS;const dirs=[[0,1],[1,0],[-1,0],[1,1],[-1,1]];const [di,dj]=dirs[Math.floor(Math.random()*dirs.length)];
        const ti=i+di,tj=j+dj;if(ti<1||ti>=COLS-1||tj>=ROWS-2||tj<=SURF[ti]+3){c.state='idle';break}
        const tk=K(ti,tj);if(!T[tk]||T[tk]===5||WET[tk]>0.9){c.state='idle';break}
        c.dig=tk;c.digFrom=from;if(!goTo(c,k=>k===from,20000))c.state='idle';else c.state='dig2';
      }else{c.state='guard';const ok=goTo(c,k=>{const p=plantAtK(k);return p&&p.aph>0},20000);if(!ok)c.state='idle';c.t=0}
      break}
    case 'go':{const it=c.goal;c.goal=null;if(it&&!it.dead&&!it.carried&&dist3(c,it)<CS*1.8){it.carried=true;c.load={val:it.val,it,type:it.type};it.dead=true;c.state='return';
        if(!goTo(c,k=>col.chamber.has(k)||k===col.home,24000)){c.state='idle';c.load=null}}else c.state='idle';break}
    case 'return':if(c.load){col.food+=c.load.val;c.load=null}if(c.energy<45&&col.food>=1){col.food-=1;c.energy+=25}c.state='idle';break;
    case 'eat':if(col.food>=1){col.food-=1;c.energy+=28}c.state='idle';break;
    case 'explore':c.state='idle';break;
    case 'dig2':{const tk=c.dig;if(!T[tk]||T[tk]===5){c.state='idle';break}
      const [tx,ty]=cxy(tk);c.ang+=angDiff(c.ang,Math.atan2(ty-c.y,tx-c.x))*0.2;c.v=0;
      c.t+=dt;if(c.t>=TYPES[T[tk]].hard*0.22*(1+WET[tk]*1.5)){c.t=0;const typ=digCell(tk,col);if(c.head){c.head.k=tk;c.head.n++;c.head=null}
        if(col.chamber.has(c.digFrom)&&col.chamber.size<36+(pop.fourmi||0)*1.5)col.chamber.add(tk);
        c.load={type:'grain',t:typ};c.state='haul';if(!goTo(c,k=>{const i=k%COLS,j=(k-i)/COLS;return Math.abs(i-col.i)<=1&&j<=SURF[i]-1&&j>=SURF[i]-2},24000)){c.load=null;c.state='idle'}}
      break}
    case 'haul':{if(c.load&&c.load.type==='grain'){const ic=clamp(col.i+Math.round(rnd(3,12))*(Math.random()<0.5?-1:1),1,COLS-2),j=SURF[ic]-1;
        if(j>4&&!STEM[K(ic,j)]&&!STEM[K(ic,j-1)]){T[K(ic,j)]=c.load.t===1?1:3;NUT[K(ic,j)]=0.08;WET[K(ic,j)]=0.2;surfCol(ic);soilDirty=true;for(const it of items)if(it.i===ic)settleItem(it)}}
      c.load=null;c.state='idle';break}
    case 'guard':c.state='guarding';c.t=8;break;
    case 'guarding':{c.t-=dt;c.v=0;
      const m=items.find(it=>it.type==='miellat'&&!it.carried&&dist3(c,it)<10);
      if(m){m.carried=true;m.dead=true;c.load={val:m.val,type:'miellat'};c.state='return';if(!goTo(c,k=>col.chamber.has(k)||k===col.home,24000)){c.state='idle';col.food+=m.val;c.load=null}break}
      if(c.t<=0)c.state='idle';break}
    default:c.state='idle';
  }
}
// ----- CLOPORTE -----
function uCloporte(c,dt){
  if(gravity(c,dt))return;
  const k=c.k??cellOf(c.x,c.y),i=k%COLS,j=(k-i)/COLS;const kb=K(i,Math.min(ROWS-1,j+1));
  if(WET[kb]<0.25)c.energy-=0.45*dt;
  if(c.state==='eat'){c.v=0;c.t-=dt;if(c.t<=0){const it=c.goal;if(it&&!it.dead){it.val-=1;c.energy+=22;addNut(it.i,SURF[it.i],0.5);if(it.val<=0)it.dead=true}c.state='idle'}return}
  if(c.path&&c.path.length){if(c.goal&&c.goal.dead){c.path=null;c.state='idle'}else{stepPath(c,dt);return}}
  if(c.state==='go'){const it=c.goal;if(it&&!it.dead&&dist3(c,it)<CS*2){c.state='eat';c.t=2.5;return}c.state='idle'}
  c.t-=dt;if(c.t>0)return;c.t=1.5;
  if(c.energy<75){const list=items.filter(it=>(it.type==='litiere'||it.type==='cadavre')&&!it.carried);let best=null,bd=1e9;for(const it of list){const d=dist3(c,it);if(d<bd){bd=d;best=it}}
    if(best&&goTo(c,kk=>Math.abs((kk%COLS)-best.i)<=2&&Math.abs(((kk/COLS)|0)-(best.k/COLS|0))<=2,16000)){c.goal=best;c.state='go';return}}
  // va s'abriter sous une pierre, un pot ou un tronc
  if(c.energy>=55&&Math.random()<0.5){const s=nearestShelter(c);if(s&&!shelterAt(c)&&goTo(c,kk=>{const ii=kk%COLS;return Math.abs(ii-s.i)<=Math.max(2,s.w/2-1)&&((kk/COLS)|0)>=SURF[ii]-2},9000)){c.state='abri';return}}
  if(shelterAt(c)&&c.energy>=40&&Math.random()<0.7)return;
  // cherche l'humidité
  goTo(c,kk=>{const ii=kk%COLS,jj=(kk-ii)/COLS;return Math.random()<0.02&&WET[K(ii,Math.min(ROWS-1,jj+1))]>0.3},1500)||randomWalk(c);
  if(c.energy>80&&canRepro('cloporte',18)){c.energy-=35;const b=born('cloporte',c.x,c.y,{energy:35});b.k=c.k}
}
// ----- LOMBRIC -----
function soilOk(x,y){const k=cellOf(x,y),i=k%COLS,j=(k-i)/COLS;return (T[k]&&T[k]!==5)||(DUG[k]&&!T[k])}
function uLombric(c,dt){
  const k=cellOf(c.x,c.y);if(k>=0&&T[k]&&T[k]!==5){NUT[k]=Math.min(1,NUT[k]+0.004*dt);if(WET[k]<0.3)c.energy-=0.4*dt}
  if(!soilOk(c.x,c.y)){c.y+=40*dt;c.v=10}
  if(!c.tg||dist(c.x,c.y,c.tg.x,c.tg.y)<4||(c.tt=(c.tt||0)-dt)<0){
    if(c.tg&&c.tg.it&&!c.tg.it.dead&&dist(c.x,c.y,c.tg.x,c.tg.y)<5){const it=c.tg.it;it.val-=1;c.energy+=25;addNut(it.i,SURF[it.i],0.6);if(it.val<=0)it.dead=true;wave({x:c.x,y:c.y,max:14,sp:40,col:c.cLine,a:0.5})}
    c.tt=8;let it=null;
    if(c.energy<80){let bd=150;for(const q of items){if(q.type!=='litiere'&&q.type!=='cadavre')continue;const d=Math.abs(q.x-c.x);if(d<bd){bd=d;it=q}}}
    if(it)c.tg={x:it.x,y:surfY(it.i)+CS*0.6,it};
    else{const i=clamp(Math.floor(c.x/CS)+Math.round(rnd(-40,40)),1,COLS-2);let best=null,bw=-1;for(let q=0;q<5;q++){const j=SURF[i]+Math.floor(rnd(3,55));if(j>=ROWS)continue;const kk=K(i,j);if(T[kk]&&T[kk]!==5&&WET[kk]>bw){bw=WET[kk];best=[i,j]}}
      if(best)c.tg={x:best[0]*CS+CS/2,y:Y0+best[1]*CS+CS/2};else c.tg={x:c.x,y:c.y+CS}}
  }
  const a=Math.atan2(c.tg.y-c.y,c.tg.x-c.x);c.ang+=clamp(angDiff(c.ang,a),-2.5*dt,2.5*dt);
  const nx=c.x+Math.cos(c.ang)*c.sp.spd*dt,ny=c.y+Math.sin(c.ang)*c.sp.spd*dt;
  if(soilOk(nx,ny)||ny<c.y&&soilOk(nx,ny+CS)){c.x=nx;c.y=ny;c.v=c.sp.spd}else{c.ang+=rnd(1,2);c.v=0}
  c.x=clamp(c.x,3,WW-3);
  if(c.energy>90&&canRepro('lombric',12)){c.energy-=40;born('lombric',c.x,c.y,{energy:40,ang:c.ang+Math.PI})}
}
// ----- SCOLOPENDRE -----
function uScolo(c,dt){
  if(gravity(c,dt))return;
  const ants=creatures.filter(a=>!a.dead&&a.sp.id==='fourmi'&&dist3(a,c)<16).length;
  if(ants>=3){c.energy-=5*dt;if(Math.random()<dt*2)wave({x:c.x,y:c.y,max:20,sp:60,col:'#ff6a3a',a:0.6})}
  const preys=creatures.filter(o=>!o.dead&&o!==c&&(o.sp.id==='escargot'||o.sp.id==='chenille'||o.sp.id==='cloporte'||o.sp.id==='fourmi'||(o.sp.id==='coccinelle'&&!o.fly)||o.sp.id==='lombric')&&(pop[o.sp.id]||0)>2); // refuge : les 2 dernières proies d'une espèce se cachent
  c.digT=(c.digT||0)-dt; // digestion : plus de chasse pendant un moment (très long pour les mygales)
  let catchIt=null;for(const o of preys)if(dist3(o,c)<5){catchIt=o;break}
  if(catchIt&&c.energy<100&&c.digT<=0){const v={cloporte:30,fourmi:14,coccinelle:22,lombric:38,escargot:34,chenille:20}[catchIt.sp.id]||20;die(catchIt,c);c.energy+=v;c.digT=14+24*Math.max(0,(c.sp.vsize||1)-1);c.path=null;wave({x:c.x,y:c.y,max:22,sp:60,col:c.cLine,a:0.7})}
  c.t-=dt;
  if(c.t<=0||!c.path||!c.path.length){c.t=1.2;
    if(c.energy<95&&c.digT<=0&&preys.length){const pc=new Set();for(const o of preys){if(o.sp.id==='lombric'){const k=cellOf(o.x,o.y),i=k%COLS,j=(k-i)/COLS;for(let d=0;d<4;d++){const ni=i+DI[d],nj=j+DJ[d];if(walk(ni,nj))pc.add(K(ni,nj))}}else if(o.k!=null)pc.add(o.k)}
      c.state='hunt';if(!goTo(c,k=>pc.has(k),16000)){c.state='idle';randomWalk(c,25)}}
    else{c.state='idle';randomWalk(c,25)}}
  if(c.state==='hunt'&&c.beatT===0)antTips(c).forEach(t=>wave({x:t[0],y:t[1],arc:c.ang,spr:0.4,max:40,sp:90,col:c.cLine,dash:true,a:0.5,w:0.4}));
  stepPath(c,dt,c.state==='hunt'?0.95:0.6);
  if(c.energy>118&&c.age>90&&canRepro(c.sp.id,3)&&Math.random()<dt*0.02){if(c.sp.id==='araignee'){if(!sacOf(c)){c.energy-=60;spiderLay(c)}}else{c.energy-=60;const b=born('scolopendre',c.x,c.y,{energy:80});b.k=c.k}}
}
// ----- ARAIGNÉE -----
function anchorOn(p){const r=Math.floor(rnd(2,Math.max(3,p.h)));const k=K(p.col,p.base-r+1);const [x,y]=cxy(k);return {x,y,z:p.z,p,r}}
function uAraignee(c,dt){
  const alive=plants.filter(p=>p.alive&&p.h>3);
  if(c.state==='caught'){c.state='idle'}
  let prey=null;for(const o of creatures)if(!o.dead&&o.state==='caught'&&o.strand&&o.strand.owner===c){prey=o;break}
  if(prey){const d=dist(c.x,c.y,prey.x,prey.y);if(d>7){spiderMove(c,prey.x,prey.y,dt,2.2)}else{c.v=0;c.t+=dt;if(c.t>1.4){c.t=0;die(prey,c);c.energy+=40;wave({x:c.x,y:c.y,max:20,sp:50,col:c.cLine,a:0.6})}}return}
  if(!alive.length){c.v=0;if(c.y<surfY(Math.floor(c.x/CS))-4)c.y+=20*dt;return}
  if(!c.tg||(c.tg.p&&!c.tg.p.alive)){const near=alive.filter(p=>Math.abs(p.col*CS-(c.home??c.x))<90);const p=(near.length?near:alive)[Math.floor(Math.random()*(near.length||alive.length))];c.tg=anchorOn(p);if(c.home==null)c.home=c.x}
  const d=dist(c.x,c.y,c.tg.x,c.tg.y);
  if(d>4)spiderMove(c,c.tg.x,c.tg.y,dt,1);
  else{c.v=0;c.t+=dt;if(c.t>0.6){c.t=0;
    if(c.anchor&&c.anchor.p.alive&&c.anchor.p!==c.tg.p&&dist3(c.anchor,c.tg)<110){strands.push({a:c.anchor,b:c.tg,owner:c,life:rnd(60,90),hits:0,glow:0,vib:0});const mine=strands.filter(q=>q.owner===c&&q.life>0);if(mine.length>6)mine[0].life=0}
    c.anchor=c.tg;c.tg=null}}
  if(c.energy>175&&canRepro('araignee',4)&&!sacOf(c)){c.energy-=95;spiderLay(c)}
}
function spiderMove(c,tx,ty,dt,mul){const a=Math.atan2(ty-c.y,tx-c.x);c.ang+=clamp(angDiff(c.ang,a),-6*dt,6*dt);const sp=c.sp.spd*mul;c.x+=Math.cos(c.ang)*sp*dt;c.y+=Math.sin(c.ang)*sp*dt;c.v=sp;airClamp(c)}
// ----- ABEILLE -----
function uAbeille(c,dt){
  c.fly=true;
  if(c.state==='sip'){c.v=0;c.t-=dt;c.ang+=Math.sin(c.age*30)*0.1;const f=c.fl;if(c.t<=0){if(f&&f.alive&&f.fl.open&&f.fl.nectar>=1){f.fl.nectar-=1;f.fl.poll=true;c.energy+=17;wave({x:c.x,y:c.y,max:14,sp:40,col:'#ffd84d',a:0.6})}c.state='idle';c.cd=2}return}
  c.cd=(c.cd||0)-dt;
  if(c.energy<115&&c.cd<=0){let best=null,bd=1e9;for(const p of plants){if(!p.alive||!p.fl.open||p.fl.nectar<1)continue;const [x,y]=flowerPos(p);const d=Math.hypot(c.x-x,c.y-y,(c.z||0)-p.z);if(d<bd){bd=d;best=p}}
    if(best){c.fl=best;const [x,y]=flowerPos(best);flyTo(c,x,y-4,dt);if(Math.hypot(c.x-x,c.y-y+4,(c.z||0)-best.z)<4){c.state='sip';c.t=1.1;c.fl=best}return}}
  flyWander(c,dt);
  // ponte dans un petit nid creusé dans le sol, près des fleurs (abeille sauvage)
  if(c.energy>105&&canRepro('abeille',12-eggsOf('abeille'))){c.energy-=48;const p=plants.find(q=>q.alive&&q.fl.open)||plants.find(q=>q.alive);groundItem('oeuf',p?p.col+Math.round(rnd(-6,6)):Math.floor(c.x/CS),{val:1,sp:c.sp.vid||'abeille',z:p?p.z:c.z,hatch:30,n:1});jlog('🐝','Une abeille pond dans son nid, au pied des fleurs')}
}
function flowerPos(p){return [p.col*CS+CS/2,Y0+(p.base-p.h+1)*CS-2]}
// ----- MOUCHE -----
function uMouche(c,dt){
  c.fly=true;
  if(c.state==='eat'){c.v=0;c.t-=dt;if(c.t<=0){const it=c.goal;if(it&&!it.dead){it.val-=1;c.energy+=it.type==='cadavre'?20:9;if(it.val<=0){it.dead=true;addNut(it.i,SURF[it.i],0.3)}}c.state='idle';c.cd=1.5}return}
  c.cd=(c.cd||0)-dt;
  if(c.energy<85&&c.cd<=0){const list=items.filter(it=>(it.type==='cadavre'||it.type==='miellat'||(it.type==='litiere'&&it.age<60))&&!it.carried);let best=null,bd=1e9;for(const it of list){const d=dist3(c,it);if(d<bd){bd=d;best=it}}
    if(best){c.goal=best;flyTo(c,best.x,best.y-3,dt);if(Math.hypot(c.x-best.x,c.y-best.y+3,(c.z||0)-best.z)<4){c.state='eat';c.t=2;c.goal=best}return}}
  flyWander(c,dt);
  // ponte sur un cadavre ou de la litière qui pourrit (les asticots s'y développent)
  if(c.energy>70&&canRepro('mouche',14-eggsOf('mouche'))){const it=items.find(o=>!o.dead&&!o.carried&&(o.type==='cadavre'||o.type==='litiere'));if(it){c.energy-=32;groundItem('oeuf',it.i,{val:1,sp:c.sp.vid||'mouche',z:it.z,hatch:18,n:3})}}
}
// ----- profondeur : chaque bête glisse vers la profondeur de ce qu'elle vise -----
function goalOf(c){const g=(c.prey&&!c.prey.dead&&c.prey)||(c.goal&&!c.goal.dead&&c.goal)||(c.fl&&c.fl.alive&&c.fl)||(c.tg&&(c.tg.p||c.tg.it))||null;return g&&g.z!=null?g:null}
function decoCover(x,z){let b=null,bd=1e9;for(const d of decos){if(Math.abs(x-(d.cx??d.i*CS))>d.w*CS/2+2)continue;const dz=Math.abs(z-(d.dz||0)-d.w*CS*0.3);if(dz<bd){bd=dz;b=d}}return b}
function postZ(c,dt){if(c.dead)return;const i=clamp(Math.floor(c.x/CS),0,COLS-1),sy=surfY(i);let tz;
  if(c.y>sy+1.5&&!c.fly)tz=0;
  else if(c.lure)tz=c.lure.z;                                   // dans le sol : galeries contre la vitre
  else if(c.sp.id==='reine'||c.sp.id==='fourmi'&&(c.state==='return'||c.state==='haul'||c.state==='eat'||c.state==='dig2'))tz=0; // l'entrée du nid est contre la vitre
  else{const p=!c.fly&&c.k!=null&&c.y<sy-1.5?plantAtK(c.k,c.z):null;
    if(p)tz=p.z;
    else if(!c.fly&&c.k!=null&&SUP&&SUP[c.k]){const d=decoCover(c.x,c.z||0);tz=d?(d.dz||0)+d.w*CS*0.3:c.z}
    else{const g=goalOf(c);if(g)tz=g.z;
      else if(c.state==='abri'){const s=nearestShelter(c);tz=s?(s.dz||0)+s.w*CS*0.3:c.z}
      else{c.zt=(c.zt||0)-dt;if(c.zt<=0){c.zt=rnd(3,8);c.tz=clamp((c.z||0)+rnd(-90,90),0,ZD-15)}tz=c.tz}}}
  tz=clamp(tz,0,ZD-10);const sp=c.fly?(c.sp.fspd||c.sp.spd):c.sp.spd,tleft=(c.path?c.path.length*CS:0)/Math.max(1,sp);
  const dz=tz-(c.z||0),vz=Math.min(Math.max(sp*0.8,Math.abs(dz)/Math.max(0.25,tleft)),sp*3);c.z=(c.z||0)+clamp(dz,-vz*dt,vz*dt)}
const UPD={puceron:uPuceron,coccinelle:uCoccinelle,fourmi:uFourmi,reine:uReine,cloporte:uCloporte,lombric:uLombric,scolopendre:uScolo,araignee:uAraignee,abeille:uAbeille,mouche:uMouche};

// toiles : capture des volants
function webCheck(c){
  if(!c.fly||c.state==='caught'||(c.webCd=(c.webCd||0))>0)return;
  for(const st of strands){if(st.life<=0)continue;
    const ax=st.b.x-st.a.x,ay=st.b.y-st.a.y,tt=clamp(((c.x-st.a.x)*ax+(c.y-st.a.y)*ay)/(ax*ax+ay*ay||1),0,1),zs=(st.a.z||0)+((st.b.z||0)-(st.a.z||0))*tt;
    if(segDist(c.x,c.y,st.a.x,st.a.y,st.b.x,st.b.y)<1.6&&Math.abs((c.z||0)-zs)<5){if(Math.random()<0.4){c.state='caught';jlog('🕸',`${nm(c)} pris(e) dans une toile`);ach('toile');c.t=rnd(8,12);c.strand=st;st.vib=2.5;st.hits++;wave({x:c.x,y:c.y,max:24,sp:60,col:'#ff7a5c',a:0.6})}else c.webCd=1;break}}
}
function updCaught(c,dt){c.v=0;c.t-=dt;for(const l of c.legs)if(Math.random()<dt*6){l.fx+=rnd(-1.5,1.5);l.fy+=rnd(-1.5,1.5)}if(c.t<=0){c.state='idle';c.webCd=2;if(c.strand){c.strand.life=0;c.strand=null}}}
function puff(c,col,n,spd,life){for(let k=0;k<n;k++){if(phero.length>600)phero.shift();const a=rnd(0,TAU),v=rnd(0.3,1)*spd;phero.push({x:c.x,y:c.y,z:c.z,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,max:life,col,sp:c.sp})}}
function wave(o){if(waves.length<100)waves.push(Object.assign({r:2,sp:100,max:60,a:0.5,w:1,z:CURC?CURC.z||0:0},o))}
function antTips(c){const F=c.sp.sf,h=c.segs[0],hd=c.dims[0],L=Math.max(c.sp.ant,4),r=[];for(const sd of[-1,1]){const [fx,fy]=local(h,hd[0]*0.45,sd*hd[1]*0.2),a2=h.a+sd*0.75;r.push([(fx+Math.cos(a2)*L)*F,(fy+Math.sin(a2)*L)*F])}return r}

// ================= SON =================
let AC=null,master=null,soundOn=true,noiseBuf=null;const bucket={};let gBucket=10;
function initAudio(){try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=0.22*OPT.vol/100;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*0.2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  if(AC.state!=='running')AC.resume()}catch(e){AC=null}}
function beep(c,l){
  if(!AC||!soundOn||paused||c.mute||AC.state!=='running')return;
  const id=c.sp.id;const b=bucket[id]??2;if(b<1||gBucket<1)return;bucket[id]=b-1;gBucket--;
  const P=SND[id];if(!P)return;
  const t=AC.currentTime,g=AC.createGain();let src,dur=P.d,vol=P.v,f;
  if(!l){if(!P.buzz)return;src=AC.createOscillator();src.type='sawtooth';f=P.buzz*(1+rnd(-0.05,0.05));src.frequency.setValueAtTime(f,t);src.frequency.linearRampToValueAtTime(f*1.08,t+0.05);dur=0.05;vol=0.035}
  else{const sc=P.sc,idx=P.desc?Math.min(sc.length-1,l.seg):((l.p*2+(l.side>0?1:0))%sc.length);f=P.f*Math.pow(2,(P.desc?-sc[idx]:sc[idx])/12);
    if(P.w==='noise'){src=AC.createBufferSource();src.buffer=noiseBuf;src.playbackRate.value=rnd(0.8,1.2);const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=P.q;src.connect(bp);src=Object.assign(src,{_out:bp})}
    else{src=AC.createOscillator();src.type=P.w;src.frequency.setValueAtTime(f,t);src.frequency.exponentialRampToValueAtTime(Math.max(30,f*P.sl),t+dur)}}
  const under=c.y>surfY(Math.floor(c.x/CS))+2;
  let out=src._out||src;
  if(under){const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;out.connect(lp);out=lp;vol*=0.7}
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.002);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  out.connect(g);let o2=g;if(AC.createStereoPanner){const pn=AC.createStereoPanner();pn.pan.value=clamp(c.x/WW*2-1,-1,1)*0.8;g.connect(pn);o2=pn}
  o2.connect(master);src.start(t);src.stop(t+dur+0.03);
}

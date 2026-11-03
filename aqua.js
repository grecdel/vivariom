// ================= NOUVELLES ESPÈCES ET VRAIE MARE (idées 7 et 8) =================
// La mare (décor « mare ») devient une vraie zone d'eau : têtards, larves de libellule et de moustique y nagent,
// les gerris glissent à la surface. Sur terre : perce-oreille, gendarme, grenouille ; dans l'air : libellule, moustique.
// Cycles : têtard → grenouille, larve de libellule → libellule, larve de moustique → moustique.

// ---------- l'eau : géométrie de chaque mare (vue de côté) ----------
DECOS.mare.w=30;DECOS.mare.txt="Une vraie petite mare : têtards, larves et gerris y vivent ; elle humidifie le sol autour.";
const PROF_MARE=22;// creux du dessin (le fond est à ~PROF_MARE/2 mm sous la surface, au centre)
function mares(){const L=[];for(const d of decos){if(d.type!=='mare')continue;const x=d.cx??(d.i*CS+CS/2),W2=d.w*CS/2,sy=d.by??surfY(d.i);L.push({d,x,W2,sy,z:d.dz||0})}return L}
const profMare=(m,px)=>{const u=clamp((px-m.x)/m.W2,-1,1);return 0.5+PROF_MARE/2*(1-u*u)};
function mareProche(x,z){let b=null,bd=1e9;for(const m of mares()){const d=Math.abs(m.x-x)+Math.abs(m.z-(z||0))*0.5;if(d<bd){bd=d;b=m}}return b}
function dansMare(c,m){const p=profMare(m,c.x);c.x=clamp(c.x,m.x-m.W2*0.85,m.x+m.W2*0.85);c.y=clamp(c.y,m.sy+1,m.sy+Math.max(1.2,profMare(m,c.x)-1));c.z=c.tz=m.z+m.d.w*CS*0.25}
// le dessin de la mare, en coupe, est plus creux pour que l'on voie ce qui y vit
{const dd=drawDeco;drawDeco=function(d,back,bf){if(d.type!=='mare'||OXY[0]){dd(d,back,bf);return}
  const x=d.cx??(d.i*CS+CS/2),W2=d.w*CS/2,sy=d.by??surfY(d.i);ctx.save();
  const g=ctx.createLinearGradient(0,sy,0,sy+PROF_MARE/2);g.addColorStop(0,'rgba(70,150,215,0.82)');g.addColorStop(1,'rgba(10,40,80,0.92)');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(x-W2,sy+0.5);ctx.quadraticCurveTo(x,sy+PROF_MARE,x+W2,sy+0.5);ctx.closePath();ctx.fill();
  // herbes aquatiques au fond
  ctx.strokeStyle='rgba(90,160,90,0.7)';ctx.lineWidth=0.5;for(let q=0;q<6;q++){const px=x-W2*0.7+q*W2*0.28,b=sy+profMare({x,W2,sy},px)-0.5;ctx.beginPath();ctx.moveTo(px,b);ctx.quadraticCurveTo(px+Math.sin(simT+q)*1.5,b-3,px+Math.sin(simT*0.8+q)*2,b-5-(q%3));ctx.stroke()}
  ctx.strokeStyle='rgba(200,235,255,0.9)';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x-W2,sy+0.5);ctx.lineTo(x+W2,sy+0.5);ctx.stroke();
  for(const r0 of RONDS)if(r0.d===d){const a=1-r0.t;ctx.globalAlpha=a;ctx.beginPath();ctx.ellipse(r0.x,sy+0.5,1+r0.t*6,0.3+r0.t*0.6,0,0,TAU);ctx.stroke()}
  ctx.globalAlpha=1;ctx.restore()}}
let RONDS=[];
function rond(m,x){if(RONDS.length<40)RONDS.push({d:m.d,x,t:0})}

// ---------- les espèces ----------
const BSP5=[
{id:'perce',nom:'Perce-oreille',la:'Forficula auricularia',role:'decomposeur',h:18,s:55,l:22,spd:18,hz:1.6,ant:6,start:55,decay:0.08,age:600,...INS({hd:[3,3,'o'],th:[3.5,3.6,'o'],ab:[9,4,'o'],L:[3.5,4]})},
{id:'gendarme',nom:'Gendarme',la:'Pyrrhocoris apterus',role:'mangeur',h:6,s:85,l:42,spd:14,hz:1.5,ant:5,start:55,decay:0.07,age:600,...INS({hd:[2.5,3,'o'],th:[3.5,6,'o'],ab:[6,6.5,'o'],L:[3.5,4]})},
{id:'libellule',nom:'Libellule déprimée',la:'Libellula depressa',role:'chasseur',h:205,s:45,l:45,spd:20,fspd:80,hz:1.8,ant:1,f:['yeux'],w:{n:2,len:20,wid:4,hz:22},start:80,decay:0.35,age:420,...INS({hd:[4,5.5,'o'],th:[6,6,'o'],ab:[22,4.5,'o'],L:[4,5]})},
{id:'larvelib',nom:'Larve de libellule',la:'Libellula (larve)',role:'chasseur',h:35,s:35,l:22,spd:6,hz:1,ant:2,start:60,decay:0.06,age:900,...INS({hd:[3.5,4.5,'o'],th:[4.5,5,'o'],ab:[9,6,'o'],L:[4,5]})},
{id:'moustique',nom:'Moustique',la:'Culex pipiens',role:'decomposeur',h:30,s:20,l:40,spd:20,fspd:20,hz:3,ant:3,w:{n:2,len:5,wid:1.4,hz:40},start:40,decay:0.4,age:200,...INS({hd:[1.5,1.6,'o'],th:[2.4,2.2,'o'],ab:[4.5,1.4,'o'],L:[5,6]})},
{id:'larvemou',nom:'Larve de moustique',la:'Culex (larve)',role:'decomposeur',h:40,s:15,l:35,spd:5,hz:2,ant:0,start:30,decay:0.08,age:300,...MYR({hd:[1.6,1.8,'o'],n:6,sg:[1,1.1,'o'],per:0,L:[0.5,0.5]})},
{id:'gerris',nom:'Gerris',la:'Gerris lacustris',role:'chasseur',h:30,s:25,l:22,spd:30,hz:2,ant:4,start:50,decay:0.08,age:500,...INS({hd:[2,1.6,'o'],th:[3,2,'o'],ab:[6,1.8,'o'],sp:70,L:[5,6]})},
{id:'tetard',nom:'Têtard',la:'Rana temporaria (larve)',role:'decomposeur',h:30,s:25,l:18,spd:10,hz:3,ant:0,start:40,decay:0.06,age:500,...INS({hd:[5,5,'o'],th:[2,3,'o'],ab:[8,2,'o'],L:[0.4,0.4]})},
{id:'grenouille',nom:'Grenouille rousse',la:'Rana temporaria',role:'chasseur',h:28,s:45,l:30,spd:30,hz:1,ant:0,start:90,decay:0.12,age:1200,...INS({hd:[8,10,'o'],th:[10,12,'o'],ab:[10,11,'o'],L:[8,10]})},
];
Object.assign(REAL,{perce:[15,20],gendarme:[10,14],libellule:[45,22,90],larvelib:[22,6],moustique:[7,10,30],larvemou:[7,5],gerris:[14,30],tetard:[18,10],grenouille:[22,26]});
for(const sp of BSP5){
  sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  if(sp.chain){sp.chain.sg=[sp.chain.sg[0]*SC,sp.chain.sg[1]*SC,sp.chain.sg[2]];sp.chain.L=sp.chain.L.map(v=>v*SC)}
  if(sp.w)sp.w=Object.assign({},sp.w,{len:sp.w.len*SC,wid:sp.w.wid*SC});
  sp.ant=(sp.ant||0)*SC;sp.f=sp.f||[];const L=sp.chain?sp.chain.L:[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);
  const dl=sp.dims.reduce((m,d)=>m+d[0],0)+(sp.chain?sp.chain.n*sp.chain.sg[0]:0),R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];if(R[2])sp.fspd=R[2];SPI[sp.id]=sp}
const AQUA=['larvelib','larvemou','tetard','gerris'];
Object.assign(FICHES,{
  perce:{nom:'Perce-oreille',ic:'🪲',role:'Omnivore nocturne',mange:"Les pucerons, la litière, les fruits tombés, les cadavres.",par:"Le scorpion, la grenouille, les araignées chasseuses.",aide:"Mange beaucoup de pucerons et nettoie la litière.",besoin:"Une cachette sombre et un peu humide pour la journée.",comp:"Malgré son nom, il ne perce pas les oreilles ! Ses pinces au bout du ventre servent à se défendre et à replier ses ailes. La mère garde ses œufs et lèche ses petits."},
  gendarme:{nom:'Gendarme',ic:'🐞',role:'Mangeur de graines',mange:"Les graines tombées et les fruits.",par:"Presque personne : ses couleurs rouges disent « je ne suis pas bon ».",aide:"Grignote les graines en trop.",besoin:"Du soleil et des graines au sol. Il aime vivre en groupe.",comp:"Rouge et noir comme un uniforme. Les gendarmes se rassemblent au pied des plantes au soleil, parfois par dizaines."},
  libellule:{nom:'Libellule',ic:'🪽',role:'Chasseuse en vol',mange:"Mouches, moustiques, pucerons ailés : tout ce qui vole et qui est petit.",par:"La grenouille, quand elle se pose trop près.",aide:"Limite les mouches et les moustiques.",besoin:"Une mare pour pondre : ses larves vivent dans l'eau.",comp:"Chasseuse redoutable, elle attrape ses proies en plein vol avec ses pattes. Sa larve vit longtemps dans l'eau avant de grimper sur une tige et de se transformer."},
  larvelib:{nom:'Larve de libellule',ic:'🦐',role:'Chasseuse aquatique',mange:"Les têtards et les larves de moustique.",par:"La grenouille.",aide:"Deviendra une libellule.",besoin:"Une mare.",comp:"Elle chasse au fond de l'eau avec un « masque », une lèvre qui se déplie d'un coup pour saisir la proie."},
  moustique:{nom:'Moustique',ic:'🦟',role:'Petit volant',mange:"Le nectar des fleurs (ici, pas de piqûre !).",par:"La libellule, la grenouille, les toiles d'araignée.",aide:"Nourrit beaucoup de chasseurs.",besoin:"De l'eau calme pour pondre.",comp:"Seule la femelle pique, dans la nature, pour nourrir ses œufs. Les larves vivent la tête en bas sous la surface et respirent par un petit tuba."},
  larvemou:{nom:'Larve de moustique',ic:'〰',role:'Larve aquatique',mange:"Les petites particules dans l'eau.",par:"La larve de libellule, le gerris.",aide:"Deviendra moustique.",besoin:"Une mare.",comp:"Elle pend sous la surface et se tortille pour descendre quand on s'approche."},
  gerris:{nom:'Gerris',ic:'⛸',role:'Patineur de surface',mange:"Les insectes tombés à l'eau, les larves qui remontent respirer.",par:"La grenouille.",aide:"Nettoie la surface de la mare.",besoin:"Une mare.",comp:"Il marche sur l'eau ! Ses longues pattes poilues reposent sur la surface sans la percer."},
  tetard:{nom:'Têtard',ic:'🫧',role:'Larve de grenouille',mange:"Les algues et les débris au fond de l'eau.",par:"La larve de libellule.",aide:"Deviendra grenouille.",besoin:"Une mare.",comp:"Il respire par des branchies. Ses pattes arrière poussent d'abord, puis les avant ; la queue fond, et il sort de l'eau."},
  grenouille:{nom:'Grenouille',ic:'🐸',role:'Grande chasseuse',mange:"Mouches, moustiques, grillons, perce-oreilles, libellules… d'un coup de langue.",par:"Personne ici.",aide:"Garde l'équilibre en mangeant les insectes en trop.",besoin:"Une mare pour pondre, de l'humidité. Elle vit près de l'eau.",comp:"Elle attend sans bouger, puis projette sa langue collante en un éclair. Elle pond ses œufs (le frai) dans la mare."}});
Object.assign(PLUS,{
  perce:{ou:"Sous les écorces, dans les fleurs fanées, les pots et les fruits tombés.",anec:"C'est un des rares insectes où la mère s'occupe de ses petits : elle nettoie ses œufs un par un pour éviter les moisissures."},
  gendarme:{ou:"Au pied des tilleuls et des mauves, au soleil, partout en Europe.",anec:"Presque tous les gendarmes n'ont pas d'ailes pour voler : seuls quelques-uns naissent avec de vraies ailes."},
  libellule:{ou:"Près des mares et des étangs ensoleillés.",anec:"Elle réussit plus de 9 chasses sur 10 : c'est l'un des prédateurs les plus efficaces du monde animal."},
  larvelib:{ou:"Au fond des mares, dans la vase et les plantes.",anec:"Pour aller vite, elle se propulse en expulsant de l'eau par l'arrière, comme une petite fusée."},
  moustique:{ou:"Près de toute eau calme, même une soucoupe ou un pneu.",anec:"Un moustique bat des ailes environ 500 fois par seconde : c'est ce qui fait son bourdonnement aigu."},
  larvemou:{ou:"Dans les eaux calmes, juste sous la surface.",anec:"Elle respire par un siphon au bout du ventre, comme un plongeur avec son tuba."},
  gerris:{ou:"À la surface des mares et des ruisseaux calmes.",anec:"Il sent les vibrations de l'eau avec ses pattes pour repérer un insecte qui se débat."},
  tetard:{ou:"Dans les mares, au printemps.",anec:"Une seule grenouille rousse pond jusqu'à 2 000 œufs en une fois."},
  grenouille:{ou:"Prairies humides et bords de mares.",anec:"Elle ferme les yeux pour avaler : ses yeux s'enfoncent et aident à pousser la nourriture dans la gorge !"}});
Object.assign(LARVE_DE,{larvelib:'libellule',larvemou:'moustique',tetard:'grenouille'});GROUPE_NOM.perce='Perce-oreille';
if(typeof REL!=='undefined'){Object.assign(REL,{perce:{mange:['puceron','litiere','cadavre'],par:['scorpion','grenouille','araignee:sol']},gendarme:{mange:['graine'],par:['scorpion']},
  libellule:{mange:['mouche','moustique','puceron'],par:['grenouille']},larvelib:{mange:['tetard','larvemou'],par:['grenouille']},moustique:{mange:['fleurs'],par:['libellule','grenouille','araignee']},
  larvemou:{mange:[],par:['larvelib','gerris']},gerris:{mange:['larvemou','cadavre'],par:['grenouille']},tetard:{mange:['litiere'],par:['larvelib']},grenouille:{mange:['mouche','moustique','grillon','perce','libellule','cloporte'],par:[]}})}
SCORP_PREY.perce=18;SCORP_PREY.gendarme=12;PROIES_SAUT.perce=16;PROIES_SAUT.moustique=6;PROIES_MYGALE.perce=20;MANTE_PREY.push('moustique','libellule');
{const ss=sandboxSpecies;sandboxSpecies=function(){const s=ss();for(const id of ['perce','gendarme','libellule','larvelib','moustique','larvemou','gerris','tetard','grenouille'])if(!s.includes(id))s.push(id);return s}}

// ---------- naissance d'une bête d'eau : on la met dans la mare la plus proche ----------
{const bv=born;born=function(id,x,y,o){const b=bv(id,x,y,o);if(b&&b.sp&&AQUA.includes(b.sp.id))mettreALeau(b);return b}}
function mettreALeau(c){const m=mareProche(c.x,c.z);if(!m){c.horsEau=true;return false}c.fly=true;c.k=null;c.path=null;c.mare=m.d;
  if(Math.abs(c.x-m.x)>m.W2)c.x=m.x+rnd(-m.W2*0.6,m.W2*0.6);c.y=c.sp.id==='gerris'?m.sy+0.3:m.sy+profMare(m,c.x)*rnd(0.3,0.8);dansMare(c,m);return true}
// posée à la main : même règle (sans mare, elle ne survit pas)
{const ta=tapAction;tapAction=function(x,y){const n0=creatures.length;ta(x,y);for(let q=n0;q<creatures.length;q++){const c=creatures[q];if(c&&AQUA.includes(c.sp.id)&&!mettreALeau(c)){c.dead=true;say(`${FICHES[c.sp.id].ic} Il faut une mare 💧 pour ${FICHES[c.sp.id].nom.toLowerCase()} (tiroir Décor)`);if(stock[tool]!=null&&!lvl.sandbox)stock[tool]++}}creatures=creatures.filter(c=>!c.dead)}}
const mareDe=c=>{const L=mares();return L.find(m=>m.d===c.mare)||null};
function nage(c,dt,vit,surface){const m=mareDe(c);if(!m){c.energy-=dt*5;return null}
  c.wa=(c.wa||0)+rnd(-3,3)*dt;c.wa=clamp(c.wa*0.97,-1.4,1.4);c.ang+=c.wa*dt;const s=vit*(0.5+0.5*Math.abs(Math.sin(simT*2+c.phase*7)));
  c.x+=Math.cos(c.ang)*s*dt;c.y+=surface?0:Math.sin(c.ang)*s*dt*0.6;if(surface)c.y=m.sy+0.3;c.v=s;
  const ox=c.x;dansMare(c,m);if(c.x!==ox)c.ang=Math.PI-c.ang;return m}
function metamorphose(c,id,m,txt){const b=bv0(id,clamp(c.x,m.x-m.W2-2,m.x+m.W2+2),m.sy-2,{energy:60,z:c.z});if(SPI[id].w){b.fly=true;b.y=m.sy-12}else{b.k=findWalk(m.x+(Math.random()<0.5?-1:1)*(m.W2+3),m.sy-2);const [x,y]=cxy(b.k);b.x=x;b.y=y}
  die(c,'meta');jlog(FICHES[id].ic,txt);wave({x:c.x,y:m.sy,max:14,sp:40,col:'#bfe8ff',a:0.6});rond(m,c.x);return b}
const bv0=(id,x,y,o)=>born(id,x,y,o);

// ---------- comportements ----------
function chasse(c,ids,portee,gain,cd){if((c.cd=(c.cd||0)-0)>0)return null;for(const o of creatures){if(o.dead||o===c||!ids.includes(o.sp.id)||(pop[o.sp.id]||0)<2)continue;if(dist3(o,c)<portee){die(o,c);c.energy+=gain;c.cd=cd;return o}}return null}
function uPerce(c,dt){if(grignote(c,dt))return;c.cd=(c.cd||0)-dt;
  if(c.cd<=0&&c.energy<90&&chasse(c,['puceron'],5,9,6))return;
  c.t-=dt;if(c.t>0)return;c.t=1.5;
  if(c.energy<85){const it=nearItem(c,['litiere','fruit','cadavre'],240);if(it&&goToItem(c,it)){c.goal=it;c.state='go';return}
    const pr=(pop.puceron||0)>2?nearest(c,byId('puceron'),120):null;if(pr&&pr.k!=null){goTo(c,k=>k===pr.k,6000);return}}
  if(c.energy>88&&c.age>60&&canRepro('perce',10-eggsOf('perce'))&&Math.random()<0.25){c.energy-=35;layEggs(c,c.sp.vid||'perce',{hatch:35,n:3});jlog('🪲','Une mère perce-oreille pond et garde ses œufs')}
  if(isDay()&&Math.random()<0.6){if(toShelter(c)){c.state='abri';return}if(shelterAt(c))return}randomWalk(c,14)}
function uGendarme(c,dt){if(grignote(c,dt))return;c.t-=dt;if(c.t>0)return;c.t=1.6;
  if(c.energy<85){const it=nearItem(c,['graine','fruit'],240);if(it&&goToItem(c,it)){c.goal=it;c.state='go';return}}
  if(c.energy>88&&c.age>60&&canRepro('gendarme',14-eggsOf('gendarme'))&&Math.random()<0.25){c.energy-=32;layEggs(c,c.sp.vid||'gendarme',{hatch:30,n:4})}
  // grégaire : rejoint les autres au pied d'une plante
  const o=nearest(c,byId('gendarme').filter(g=>g!==c),200);if(o&&dist3(o,c)>12&&o.k!=null&&Math.random()<0.6){goTo(c,k=>Math.abs((k%COLS)-(o.k%COLS))<=2&&Math.abs(((k/COLS)|0)-((o.k/COLS)|0))<=2,6000);return}
  if(Math.random()<0.4)return;randomWalk(c,10)}
function uLibellule(c,dt){c.fly=true;c.cd=(c.cd||0)-dt;
  const proie=c.cd<=0&&c.energy<110?nearest(c,creatures.filter(o=>!o.dead&&(o.fly||o.vol)&&['mouche','moustique','puceron','papillon'].includes(o.sp.id)&&(pop[o.sp.id]||0)>1),90):null;
  if(proie){flyTo(c,proie.x,proie.y,dt,1.2);if(dist3(c,proie)<5){die(proie,c);c.energy+=proie.sp.id==='papillon'?30:16;c.cd=5}return}
  if(c.energy>95&&c.age>60&&canRepro('libellule',6)&&Math.random()<dt*0.05){const m=mareProche(c.x,c.z);if(m){flyTo(c,m.x,m.sy-4,dt);if(Math.abs(c.x-m.x)<m.W2&&Math.abs(c.y-m.sy)<8){c.energy-=45;rond(m,c.x);const b=[];for(let q=0;q<2;q++)bv0('larvelib',c.x,m.sy+3,{energy:40,z:m.z});jlog('🪽','Une libellule pond dans la mare')}return}}
  flyWander(c,dt)}
function uLarvelib(c,dt){const m=nage(c,dt,4);if(!m)return;c.cd=(c.cd||0)-dt;
  if(c.cd<=0&&c.energy<110){const pr=nearest(c,creatures.filter(o=>!o.dead&&o.mare===c.mare&&(o.sp.id==='tetard'||o.sp.id==='larvemou')&&(pop[o.sp.id]||0)>1),18);if(pr){c.ang=Math.atan2(pr.y-c.y,pr.x-c.x);if(dist3(c,pr)<4){die(pr,c);c.energy+=18;c.cd=8;c.frappe=0.3;c.fx=pr.x;c.fy=pr.y}}}
  if(c.age>110&&c.energy>55)metamorphose(c,'libellule',m,'🪽 Une larve de libellule sort de l\'eau et devient adulte')}
function uMoustique(c,dt){c.fly=true;const m=c.energy>60&&c.age>30&&canRepro('moustique',14)&&Math.random()<dt*0.04?mareProche(c.x,c.z):null;
  if(m){c.energy-=25;rond(m,c.x);for(let q=0;q<3;q++)bv0('larvemou',m.x+rnd(-m.W2*0.6,m.W2*0.6),m.sy+1,{energy:25,z:m.z});return}
  // il boit le nectar des fleurs
  if(c.energy<60){const p=plants.find(q=>q.alive&&q.fl&&q.fl.open);if(p){const [x,y]=flowerPos(p);flyTo(c,x,y-3,dt,0.6);if(Math.hypot(c.x-x,c.y-y+3)<4)c.energy+=dt*12;return}}
  flyWander(c,dt)}
function uLarvemou(c,dt){const m=nage(c,dt,2);if(!m)return;// remonte respirer près de la surface
  if(Math.random()<dt*0.5)c.y=m.sy+rnd(1,3);c.energy+=dt*0.12;if(c.age>40)metamorphose(c,'moustique',m,'🦟 Un moustique sort de sa nymphe à la surface')}
function uGerris(c,dt){const m=nage(c,dt,12,true);if(!m)return;c.cd=(c.cd||0)-dt;
  if(c.cd<=0&&c.energy<100){const pr=creatures.find(o=>!o.dead&&o.mare===c.mare&&o.sp.id==='larvemou'&&Math.abs(o.y-m.sy)<3&&Math.abs(o.x-c.x)<4&&(pop.larvemou||0)>1);if(pr){die(pr,c);c.energy+=12;c.cd=6;rond(m,c.x)}}
  for(const it of items)if(it.type==='cadavre'&&!it.dead&&Math.abs(it.x-c.x)<m.W2&&c.energy<90&&Math.abs(it.i*CS-m.x)<m.W2){c.energy+=dt*4;break}
  if(c.energy>90&&c.age>60&&canRepro('gerris',8)&&Math.random()<dt*0.03){c.energy-=35;bv0('gerris',c.x,m.sy,{energy:35,z:m.z})}
  if(Math.random()<dt*0.6)rond(m,c.x)}
function uTetard(c,dt){const m=nage(c,dt,6);if(!m)return;c.energy+=dt*0.15;for(const it of items)if(it.type==='litiere'&&!it.dead&&Math.abs(it.i*CS-m.x)<m.W2+4){c.energy+=dt*0.3;break}
  c.patte=clamp((c.age-35)/55,0,1);if(c.age>90&&c.energy>30)metamorphose(c,'grenouille',m,'🐸 Un têtard sort de l\'eau : c\'est une petite grenouille !')}
function uGrenouille(c,dt){if(gravity(c,dt))return;c.cd=(c.cd||0)-dt;if(c.langue)c.langue.t-=dt;
  if(c.path&&c.path.length){stepPath(c,dt,1.4);return}
  if(c.cd<=0&&c.energy<120){for(const o of creatures){if(o.dead||o===c||(pop[o.sp.id]||0)<2||!['mouche','moustique','grillon','perce','libellule','cloporte','papillon','gerris','larvelib'].includes(o.sp.id))continue;
    if(dist3(o,c)<16&&o.y>c.y-22){c.langue={x:o.x,y:o.y,t:0.3};die(o,c);c.energy+=o.sp.id==='grillon'||o.sp.id==='libellule'?30:14;c.cd=14;c.ang=o.x>=c.x?0:Math.PI;return}}}
  const m=mareProche(c.x,c.z);
  if(m&&c.energy>110&&c.age>90&&canRepro('grenouille',4)&&(pop.tetard||0)<12&&Math.random()<dt*0.03){c.energy-=55;rond(m,m.x);for(let q=0;q<5;q++)bv0('tetard',m.x+rnd(-m.W2*0.5,m.W2*0.5),m.sy+3,{energy:30,z:m.z});jlog('🐸','Une grenouille pond son frai dans la mare');return}
  c.t=(c.t||0)-dt;if(c.t>0){c.v=0;return}c.t=rnd(3,7);
  if(m&&Math.abs(c.x-m.x)>m.W2+30){goTo(c,k=>Math.abs((k%COLS)*CS-m.x)<m.W2+12,9000);return}
  if(Math.random()<0.5)randomWalk(c,8)}
Object.assign(UPD,{perce:uPerce,gendarme:uGendarme,libellule:uLibellule,larvelib:uLarvelib,moustique:uMoustique,larvemou:uLarvemou,gerris:uGerris,tetard:uTetard,grenouille:uGrenouille});
// les bêtes d'eau ne tombent pas, et les insectes qui tombent à l'eau font des ronds
{const up=update;update=function(dt){up(dt);for(const r of RONDS)r.t+=dt*0.9;if(RONDS.length)RONDS=RONDS.filter(r=>r.t<1)}}
{const gw=genWorld;genWorld=function(...a){RONDS=[];return gw(...a)}}

// ---------- dessin : grenouille, têtard, pinces du perce-oreille, taches du gendarme ----------
function dessinGrenouille(g,x,y,dir,s,c){g.save();g.translate(x,y);g.scale(dir*s,s);const vert=c&&c.vieux?'#7a8a5a':'#6a8a3a',ventre='#c8c890';
  g.fillStyle='#4a6a28';g.beginPath();g.ellipse(-4,-1.6,4.6,2.2,0.25,0,TAU);g.fill();// cuisse
  g.beginPath();g.ellipse(-6,-0.4,3.5,0.9,0,0,TAU);g.fill();// pied
  g.fillStyle=vert;g.beginPath();g.ellipse(0,-4,7,4.2,-0.18,0,TAU);g.fill();
  g.fillStyle=ventre;g.beginPath();g.ellipse(1,-2.2,5,1.6,-0.1,0,Math.PI);g.fill();
  g.fillStyle=vert;g.beginPath();g.ellipse(5.5,-6,3.5,2.8,0,0,TAU);g.fill();// tête
  g.fillStyle='#3a2a18';g.beginPath();g.ellipse(-1,-5.5,1.4,0.7,0.3,0,TAU);g.fill();g.beginPath();g.ellipse(2.5,-6.5,1,0.6,0,0,TAU);g.fill();// taches
  g.fillStyle='#e8d070';g.beginPath();g.arc(6,-8.2,1.4,0,TAU);g.fill();g.fillStyle='#111';g.beginPath();g.arc(6.3,-8.2,0.7,0,TAU);g.fill();// œil
  g.strokeStyle='#4a6a28';g.lineWidth=1;g.beginPath();g.moveTo(4,-3);g.lineTo(5,0);g.lineTo(6.5,0);g.stroke();// patte avant
  g.restore()}
function dessinTetard(g,x,y,ang,s,c){g.save();g.translate(x,y);g.rotate(ang);g.scale(s,s);const w=Math.sin(simT*14+(c?c.phase*9:0))*0.6;
  g.strokeStyle='#3a3020';g.fillStyle='#4a3e2a';g.lineWidth=0.5;g.beginPath();g.moveTo(-2.5,0);g.quadraticCurveTo(-6,w*2,-9,w*3.5);g.quadraticCurveTo(-6,w*2+0.8,-2.5,1);g.fill();
  g.fillStyle='#2e2618';g.beginPath();g.ellipse(0,0.3,3.2,2.4,0,0,TAU);g.fill();g.fillStyle='#d8c890';g.beginPath();g.arc(1.8,-0.8,0.5,0,TAU);g.fill();
  if(c&&c.patte>0.2){g.strokeStyle='#4a3e2a';g.lineWidth=0.6;g.beginPath();g.moveTo(-2,1.5);g.lineTo(-3.5,1.5+2*c.patte);g.stroke()}g.restore()}
{const dp=drawProfile;drawProfile=function(c,alpha,gray){const id=c.sp.id,dir=Math.cos(c.ang)>=0?1:-1;
  if(id==='grenouille'&&!gray){const s=REAL.grenouille[0]/16*(c.bebe?0.7:1);dessinGrenouille(ctx,c.x,c.y,dir,s,c);
    if(c.langue&&c.langue.t>0){ctx.strokeStyle='#e87a8a';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(c.x+dir*7*s,c.y-6*s);ctx.lineTo(c.langue.x,c.langue.y);ctx.stroke()}return}
  if(id==='tetard'&&!gray){dessinTetard(ctx,c.x,c.y,Math.cos(c.ang)>=0?Math.sin(c.ang)*0.3:Math.PI-Math.sin(c.ang)*0.3,REAL.tetard[0]/12,c);return}
  dp(c,alpha,gray);if(gray)return;
  if(id==='perce'){const L=realLen(c),bx=c.x-dir*L*0.5,by=c.y-L*0.12;ctx.strokeStyle='#5a2a14';ctx.lineWidth=0.5;for(const s2 of [-1,1]){ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx-dir*L*0.2,by+s2*0.4,bx-dir*L*0.25,by+s2*1.2-0.6);ctx.stroke()}}
  if(id==='gendarme'){const L=realLen(c),bx=c.x-dir*L*0.25,by=c.y-L*0.2;ctx.fillStyle='#111';for(const ox of [0,0.22]){ctx.beginPath();ctx.arc(bx+dir*L*ox,by,L*0.07,0,TAU);ctx.fill()}}}}
{const dt0=drawTiny;drawTiny=function(c){if(c.sp.id==='grenouille'||c.sp.id==='tetard'){drawProfile(c,1,false);return}dt0(c)}}
{const dcr=drawCreature;drawCreature=function(c,alpha,gray,preview){const id=c.sp.id;if(gray||(id!=='grenouille'&&id!=='tetard')){dcr(c,alpha,gray,preview);return}
  const h=c.segs[0],u=1/c.sp.sf;if(!h){dcr(c,alpha,gray,preview);return}ctx.save();ctx.translate(h.x,h.y);ctx.rotate(c.ang);
  if(id==='tetard'){dessinTetard(ctx,0,0,0,u*1.5,c)}else{const s=u*2.2;ctx.fillStyle='#4a6a28';for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(-6*s,sd*5*s,4*s,2*s,sd*0.6,0,TAU);ctx.fill()}
    ctx.fillStyle='#6a8a3a';ctx.beginPath();ctx.ellipse(0,0,7*s,5*s,0,0,TAU);ctx.fill();ctx.fillStyle='#e8d070';for(const sd of [-1,1]){ctx.beginPath();ctx.arc(5*s,sd*3*s,1.3*s,0,TAU);ctx.fill()}}
  ctx.restore()}}
{const m0=mission;mission=function(c){if(!c||c.dead)return m0(c);const id=c.sp.id;
  if(id==='grenouille')return c.langue&&c.langue.t>0?'👅 Coup de langue !':'🐸 Attend sans bouger qu\'un insecte passe à portée';
  if(id==='tetard')return c.patte>0.2?'🦵 Ses pattes poussent : bientôt grenouille':'🫧 Nage et grignote les algues';
  if(id==='larvelib')return '🦐 Chasse au fond de la mare';if(id==='larvemou')return '〰 Pend sous la surface pour respirer';if(id==='gerris')return '⛸ Patine sur l\'eau';
  if(id==='gendarme')return '☀ Se chauffe en groupe au soleil';return m0(c)}}
NAISS_EXCLUES.push('grenouille','libellule','gerris','tetard','larvelib','larvemou','moustique');
if(window.__sim)window.__sim.aqua=()=>({mares:mares().length,eau:creatures.filter(c=>!c.dead&&c.mare).map(c=>c.sp.id).join(','),terre:creatures.filter(c=>!c.dead&&['perce','gendarme','grenouille','libellule','moustique'].includes(c.sp.id)).map(c=>c.sp.id).join(',')});

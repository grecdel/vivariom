// ================= NOUVELLES ESPÈCES VEDETTES =================
// phasme, mante religieuse, escargot, papillon (et sa chenille)
const BSP2=[
{id:'phasme',nom:'Phasme bâton',la:'Carausius morosus',role:'mangeur',h:85,s:45,l:34,spd:3,hz:0.6,ant:12,start:40,decay:0.16,age:700,...INS({hd:[4,2.6,'o'],th:[20,2.4,'o'],mid:[[13,2.4,'o']],ab:[26,2.2,'o'],sp:70,L:[9,11],Lk:[1.15,0.9,1.05]})},
{id:'mante',nom:'Mante religieuse',la:'Mantis religiosa',role:'chasseur',h:95,s:60,l:42,spd:8,hz:0.7,ant:6,f:['yeux'],start:90,decay:0.24,age:900,...INS({hd:[5,6,'o'],th:[16,3.4,'o'],ab:[20,7,'o'],sp:55,L:[10,12],Lk:[0.75,1.1,1.2]})},
{id:'escargot',nom:'Escargot petit-gris',la:'Cornu aspersum',role:'decomposeur',h:32,s:40,l:42,spd:1.5,hz:0.4,ant:6,start:55,decay:0.12,age:1100,...MYR({hd:[5,4.5,'o'],n:3,sg:[5,5,'o'],per:0,tl:[12,12,'o']})},
{id:'chenille',nom:'Chenille',la:'Aglais urticae (larve)',role:'mangeur',h:95,s:55,l:40,spd:2.5,hz:0.9,ant:2,start:30,decay:0.2,age:400,...MYR({hd:[3.2,3.2,'o'],n:8,sg:[3,3.4,'o'],L:[1.2,1.2]})},
{id:'papillon',nom:'Petite tortue',la:'Aglais urticae',role:'reparateur',h:22,s:90,l:50,spd:20,fspd:22,hz:1.4,ant:6,w:{n:2,len:16,wid:12,hz:9,a:0.55},start:60,decay:0.4,age:380,...INS({hd:[3,3,'o'],th:[4,4,'o'],ab:[9,3,'o'],L:[5,6]})},
];
Object.assign(REAL,{phasme:[80,4],mante:[60,9],escargot:[30,1.5],chenille:[25,3],papillon:[25,20,55]});
for(const sp of BSP2){
  sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  if(sp.chain){sp.chain.sg=[sp.chain.sg[0]*SC,sp.chain.sg[1]*SC,sp.chain.sg[2]];sp.chain.L=sp.chain.L.map(v=>v*SC);if(sp.chain.tl)sp.chain.tl=[sp.chain.tl[0]*SC,sp.chain.tl[1]*SC,sp.chain.tl[2]]}
  if(sp.w)sp.w=Object.assign({},sp.w,{len:sp.w.len*SC,wid:sp.w.wid*SC});sp.ant=(sp.ant||0)*SC;sp.f=sp.f||[];
  const L=sp.chain?sp.chain.L:[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);
  const dl=sp.dims.reduce((m,d)=>m+d[0],0)+(sp.chain?sp.chain.n*sp.chain.sg[0]:0);const R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];if(R[2])sp.fspd=R[2];SPI[sp.id]=sp}
Object.assign(FICHES,{
  phasme:{nom:'Phasme bâton',ic:'🌿',role:'Herbivore discret',mange:"Les feuilles, surtout celles de la ronce.",par:"Presque personne : il ressemble à une brindille. Les mygales, parfois.",aide:"Ses crottes enrichissent le sol.",besoin:"Des plantes hautes et feuillues, de l'humidité.",comp:"Immobile le jour, il se balance comme une branche au vent. Les femelles pondent seules des œufs qui ressemblent à des graines (parthénogenèse)."},
  mante:{nom:'Mante religieuse',ic:'🦗',role:"Chasseuse à l'affût",mange:"Tout ce qui passe à portée de ses pattes ravisseuses : mouches, abeilles, papillons, pucerons…",par:"Rien dans le vivarium… sauf une autre mante affamée.",aide:"Régule les insectes volants.",besoin:"Des tiges hautes pour se poster, de la chaleur.",comp:"Reste immobile, puis frappe en un éclair. Pond une oothèque d'où sortent plusieurs petites mantes. Cannibale quand elle a faim."},
  escargot:{nom:'Escargot petit-gris',ic:'🐌',role:'Décomposeur, brouteur',mange:"La litière, les jeunes plantes, les champignons.",par:"Les scolopendres et les mygales.",aide:"Recycle la matière, aère la surface.",besoin:"Beaucoup d'humidité : au sec, il rentre dans sa coquille et attend.",comp:"Avance très lentement en laissant une trace de bave. Pond ses œufs blancs dans la terre humide."},
  chenille:{nom:'Chenille',ic:'🐛',role:'Herbivore vorace',mange:"Les feuilles, très vite.",par:"Les mantes, les araignées-loups.",aide:"Deviendra un papillon pollinisateur.",besoin:"Des plantes à dévorer.",comp:"Mange sans arrêt, puis se fige en chrysalide et en sort papillon."},
  papillon:{nom:'Papillon petite tortue',ic:'🦋',role:'Pollinisateur',mange:"Le nectar des fleurs.",par:"Les araignées (toiles) et les mantes.",aide:"Pollinise les fleurs, comme l'abeille.",besoin:"Des fleurs ouvertes et des plantes où pondre.",comp:"Œuf → chenille → chrysalide → papillon. Il pond sur les feuilles."},
});
Object.assign(SND,{phasme:SND.puceron,mante:SND.coccinelle,escargot:SND.lombric,chenille:SND.lombric,papillon:SND.abeille});
// ----- comportements -----
function onPlant(c){const p=c.k!=null?plantAtK(c.k,c.z):null;return p&&c.y<surfY(Math.floor(c.x/CS))-2?p:null}
function seekPlant(c,pred,maxN=5000){return goTo(c,k=>{const q=plantAtK(k);return q&&((k/COLS)|0)<q.base-3&&pred(q,k)},maxN)}
// petits à naître (œufs non éclos) : comptent dans les plafonds de population
function eggsOf(id){let n=0;for(const it of items)if(it.type==='oeuf'&&!it.dead&&baseOf(it.sp)===id)n+=it.n||1;return n}
// RF : accélère la reproduction dans certains niveaux de campagne (champ repro du niveau) ; vaut 1 ailleurs.
function RF(){return (typeof lvl!=='undefined'&&lvl&&lvl.repro)||1}
function layEggs(c,sp,o){groundItem('oeuf',clamp(Math.floor(c.x/CS),1,COLS-2),Object.assign({val:1,sp,z:(c.z||0)+rnd(-3,3)},o))}
function uPhasme(c,dt){
  if(gravity(c,dt))return;const p=onPlant(c);
  if(p){const r=p.kind==='ronce'?1.5:1;p.e-=0.03*dt*r;c.energy+=1.0*dt*r;c.sway=Math.sin(c.age*1.3)*0.15;
    if(!c.path||!c.path.length){if(Math.random()<dt*0.05)goTo(c,k=>plantAtK(k,c.z)===p&&Math.random()<0.1,600)}}
  else if(!c.path||!c.path.length){c.t-=dt;if(c.t<=0){c.t=2;if(!seekPlant(c,q=>q.h>8&&(q.kind==='ronce'||Math.random()<0.6)))randomWalk(c)}}
  stepPath(c,dt,0.8);
  if(c.energy>62&&canRepro('phasme',12-eggsOf('phasme'))&&Math.random()<dt*0.05*RF()){c.energy-=24;layEggs(c,c.sp.vid||'phasme',{hatch:30/RF(),n:1})}
}
const MANTE_PREY=['mouche','abeille','puceron','fourmi','papillon','coccinelle','chenille'];
function uMante(c,dt){
  if(gravity(c,dt))return;c.cd=(c.cd||0)-dt;const p=onPlant(c);
  if(!p){if(!c.path||!c.path.length){c.t-=dt;if(c.t<=0){c.t=2;if(!seekPlant(c,(q,k)=>q.h>12&&((k/COLS)|0)<q.base-5))randomWalk(c)}}stepPath(c,dt);return}
  if(c.path&&c.path.length){stepPath(c,dt,0.6);return}
  c.v=0;
  if(c.cd<=0&&c.energy<135){const prey=creatures.find(o=>!o.dead&&o!==c&&MANTE_PREY.includes(o.sp.id)&&(pop[o.sp.id]||0)>2&&dist3(o,c)<18);
    if(prey){die(prey,c);c.energy+=prey.sp.id==='puceron'?8:prey.sp.id==='fourmi'?12:26;c.cd=5;wave({x:c.x,y:c.y,max:20,sp:70,col:c.cLine,a:0.7})}}
  if(c.energy<15){const o=creatures.find(o=>!o.dead&&o!==c&&o.sp.id==='mante'&&dist3(o,c)<18);if(o){die(o,c);c.energy+=45;wave({x:c.x,y:c.y,max:24,sp:60,col:'#ff4d5a',a:0.7})}}
  if(Math.random()<dt*0.02)goTo(c,k=>plantAtK(k,c.z)===p&&Math.random()<0.1,800);
  if(c.energy>100&&c.age>40/RF()&&canRepro('mante',8-eggsOf('mante'))&&Math.random()<dt*0.04*RF()){c.energy-=50;layEggs(c,c.sp.vid||'mante',{hatch:40/RF(),n:4,ooth:true})}
}
function uEscargot(c,dt){
  if(gravity(c,dt))return;const k=c.k??cellOf(c.x,c.y),i=k%COLS,j=(k-i)/COLS,wb=WET[K(i,Math.min(ROWS-1,Math.max(j+1,SURF[i])))]; // sur une tige : humidité du sol au pied
  if(wb<0.2){c.state='retire';c.v=0;c.energy-=0.05*dt;return}
  if(c.state==='retire')c.state='idle';
  if(Math.random()<dt*2)phero.push({x:c.x,y:c.y+1,z:c.z,vx:0,vy:0,life:6,max:6,col:'#cfe8ff',sp:c.sp});
  if(c.energy>78&&canRepro('escargot',10)&&Math.random()<dt*0.03){c.energy-=35;c.state='idle';layEggs(c,c.sp.vid||'escargot',{hatch:40,n:3,snail:true})}
  if(c.state==='eat'){c.v=0;c.t-=dt;const g=c.goal;if(g&&g.type&&!g.dead){g.val-=0.15*dt;c.energy+=0.7*dt;if(g.val<=0)g.dead=true}else if(g&&g.alive){g.e-=0.025*dt;c.energy+=0.6*dt}if(c.t<=0)c.state='idle';return}
  if(c.path&&c.path.length){stepPath(c,dt);return}
  if(c.energy<90&&c.goal&&!(c.goal.dead||c.goal.alive===false)&&Math.abs((c.goal.x??c.goal.col*CS)-c.x)<6){c.state='eat';c.t=6;return}
  c.t-=dt;if(c.t>0)return;c.t=3;
  if(c.energy<90){let best=null,bd=220;for(const it of items){if((it.type!=='litiere'&&it.type!=='cadavre')||it.carried)continue;const d=dist3(c,it);if(d<bd){bd=d;best=it}}
    for(const p of plants){if(!p.alive||p.h>30)continue;const d=Math.hypot(p.col*CS-c.x,p.z-(c.z||0));if(d<bd){bd=d;best=p}}
    if(best){const ti=best.type?best.i:best.col;c.goal=best;if(goTo(c,kk=>Math.abs((kk%COLS)-ti)<=2&&((kk/COLS)|0)>=SURF[kk%COLS]-2,9000))return}}
  randomWalk(c,15);
}
function uChenille(c,dt){
  if(c.state==='chrysalide'){c.v=0;c.t-=dt;if(c.t<=0){const b=born('papillon',c.x,c.y-4,{energy:70,z:c.z});b.fly=true;die(c,'meta');jlog('🦋','Une chrysalide devient papillon');ach('meta');wave({x:c.x,y:c.y,max:26,sp:50,col:'#ffd84d',a:0.8})}return}
  if(gravity(c,dt))return;const p=onPlant(c);
  if(p){p.e-=0.06*dt;c.energy+=1.8*dt;if(!c.path||!c.path.length){if(Math.random()<dt*0.1)goTo(c,k=>plantAtK(k,c.z)===p&&Math.random()<0.1,600)}}
  else if(!c.path||!c.path.length){c.t-=dt;if(c.t<=0){c.t=2;if(!seekPlant(c,q=>q.h>6))randomWalk(c)}}
  stepPath(c,dt);
  if(c.energy>85&&c.age>45/RF()){c.state='chrysalide';c.t=22/RF();c.path=null;jlog('🐛','Une chenille se fige en chrysalide');say('Une chenille se transforme en chrysalide…')}
}
function uPapillon(c,dt){
  c.fly=true;
  if(c.state==='sip'){c.v=0;c.t-=dt;const f=c.fl;if(c.t<=0){if(f&&f.alive&&f.fl.open&&f.fl.nectar>=1){f.fl.nectar-=1;f.fl.poll=true;c.energy+=20}c.state='idle';c.cd=3}return}
  c.cd=(c.cd||0)-dt;
  if(c.energy<110&&c.cd<=0){let best=null,bd=1e9;for(const p of plants){if(!p.alive||!p.fl.open||p.fl.nectar<1)continue;const [x,y]=flowerPos(p);const d=Math.hypot(c.x-x,c.y-y,(c.z||0)-p.z);if(d<bd){bd=d;best=p}}
    if(best){c.fl=best;const [x,y]=flowerPos(best);flyTo(c,x,y-4,dt,0.8);if(Math.hypot(c.x-x,c.y-y+4,(c.z||0)-best.z)<5){c.state='sip';c.t=2;c.fl=best}return}}
  flyWander(c,dt);
  if(c.energy>82&&canRepro('chenille',10-eggsOf('chenille'))&&(pop.papillon||0)<10&&Math.random()<dt*0.05*RF()){const Lp=plants.filter(q=>q.alive&&q.h>10),p=Lp[Math.floor(Math.random()*Lp.length)];if(p){c.energy-=40;groundItem('oeuf',p.col,{val:1,sp:'chenille',z:p.z,hatch:25/RF(),n:2})}}
}
Object.assign(UPD,{phasme:uPhasme,mante:uMante,escargot:uEscargot,chenille:uChenille,papillon:uPapillon});
// œufs : éclosion
function hatchEggs(dt){for(const it of items){if(it.type!=='oeuf'||it.dead)continue;if(it.age>=it.hatch){it.dead=true;const sp=spOf(it.sp);if(!sp)continue;
  for(let q=0;q<(it.n||1);q++){const b=born(sp,it.x+rnd(-2,2),it.y-1,{energy:30,z:(it.z||0)+rnd(-3,3)});if(sp.w)b.fly=true}
  jlog('🥚',`Éclosion : ${it.n||1} × ${sp.vnom||FICHES[sp.id].nom}`);if(it.ooth)ach('ooth');if(sp.id==='phasme')ach('phasme');
  if((it.n||1)>1)say(`${FICHES[sp.id].ic} ${it.n} petits sont nés !`)}}}
function drawEgg(it,g){g=g||ctx;const x=it.x,y=it.y;
  if(it.ooth){g.fillStyle='#d9c69a';g.beginPath();g.ellipse(x,y-1,3.2,2.2,0,0,TAU);g.fill();g.strokeStyle='#8a7550';g.lineWidth=0.3;for(let q=-2;q<=2;q++){g.beginPath();g.moveTo(x+q,y-3);g.lineTo(x+q,y+0.8);g.stroke()}}
  else if(it.snail){g.fillStyle='#f4f0e6';for(let q=0;q<5;q++){g.beginPath();g.arc(x+(q%3)-1,y-((q/3)|0),0.7,0,TAU);g.fill()}}
  else{g.fillStyle='#5a4a2c';g.beginPath();g.ellipse(x,y,1.3,0.9,0.3,0,TAU);g.fill();g.fillStyle='#c8b080';g.fillRect(x+0.6,y-0.6,0.5,0.5)}}
// chenille en chrysalide : petit cocon accroché
function drawChrysalis(c){if(c.sp.id!=='chenille'||c.state!=='chrysalide')return false;ctx.save();zT(c.z);const g=ctx.createLinearGradient(c.x-2,0,c.x+2,0);g.addColorStop(0,'#6a8a3a');g.addColorStop(1,'#c8d070');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(c.x,c.y-3,2,4,0,0,TAU);ctx.fill();ctx.fillStyle='#ffd84d';ctx.fillRect(c.x-0.4,c.y-4,0.8,0.8);ctx.restore();return true}
// intérêts (guidage à la main)
Object.assign(INTEREST,{
  phasme:{r:24,txt:'une plante à brouter',f:c=>plants.find(p=>p.alive&&p.h>8&&Math.hypot(p.col*CS-c.x,p.z-c.z)<24)},
  mante:{r:24,txt:'un poste de chasse',f:c=>plants.find(p=>p.alive&&p.h>12&&Math.hypot(p.col*CS-c.x,p.z-c.z)<20)},
  escargot:{r:20,txt:'de quoi brouter',f:c=>items.find(it=>it.type==='litiere'&&dist3(it,c)<20)},
  chenille:{r:20,txt:'des feuilles',f:c=>plants.find(p=>p.alive&&Math.hypot(p.col*CS-c.x,p.z-c.z)<20)},
  papillon:{r:34,txt:'une fleur',f:c=>plants.find(p=>p.alive&&p.fl.open&&(()=>{const [x,y]=flowerPos(p);return Math.hypot(x-c.x,y-c.y,p.z-c.z)<34})())},
});

// ================= DÉSERT ET COLÉOPTÈRES =================
// scorpion, ténébrion (et ver de farine), bousier, scarabée rhinocéros (et ver blanc), cactus
const BSP3=[
{id:'scorpion',nom:'Scorpion languedocien',la:'Buthus occitanus',role:'chasseur',h:48,s:62,l:50,spd:30,hz:0.7,ant:0,start:90,decay:0.11,age:1500,...INS({hd:[8,7,'o'],th:[14,8.5,'o'],mid:[[4,3,'o'],[4,2.8,'o'],[4,2.7,'o'],[4,2.6,'o'],[4.5,2.6,'o']],ab:[5,3.2,'o'],n:4,sp:62,L:[6.5,8],Lk:[0.9,1,1.05,1.15]})},
{id:'tenebrion',nom:'Ténébrion meunier',la:'Tenebrio molitor',role:'decomposeur',h:15,s:35,l:16,spd:12,hz:1.3,ant:4,f:['elytres'],start:50,decay:0.07,age:700,...INS({hd:[3,3.2,'o'],th:[4,4.6,'o'],ab:[9,5.2,'o'],L:[4,4.5]})},
{id:'verfarine',nom:'Ver de farine',la:'Tenebrio molitor (larve)',role:'decomposeur',h:40,s:70,l:50,spd:5,hz:1,ant:0,start:35,decay:0.08,age:420,...MYR({hd:[2,2.4,'o'],n:11,sg:[2.1,2.6,'o'],per:0,L:[0.8,0.8]})},
{id:'bousier',nom:'Bousier sacré',la:'Scarabaeus sacer',role:'decomposeur',h:230,s:12,l:14,spd:15,hz:1.2,ant:3,f:['elytres'],start:60,decay:0.12,age:700,...INS({hd:[4,7.5,'o'],th:[7,10,'o'],ab:[11,10.5,'o'],sp:50,L:[6,7],Lk:[0.9,1,1.3]})},
{id:'rhinoceros',nom:'Scarabée rhinocéros',la:'Oryctes nasicornis',role:'mangeur',h:16,s:65,l:24,spd:10,hz:0.8,ant:2,f:['elytres'],start:70,decay:0.14,age:320,...INS({hd:[5,6,'o'],th:[9,11,'o'],ab:[17,13,'o'],sp:50,L:[7,8]})},
{id:'verblanc',nom:'Ver blanc',la:'Oryctes nasicornis (larve)',role:'decomposeur',h:45,s:35,l:78,spd:3,hz:0.5,ant:0,start:45,decay:0.1,age:600,...MYR({hd:[5,6,'o'],n:9,sg:[5,8,'o'],per:0,L:[1,1]})},
];
Object.assign(REAL,{scorpion:[70,30],tenebrion:[15,12],verfarine:[25,5],bousier:[28,15],rhinoceros:[35,10],verblanc:[90,3]});
for(const sp of BSP3){
  sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  if(sp.chain){sp.chain.sg=[sp.chain.sg[0]*SC,sp.chain.sg[1]*SC,sp.chain.sg[2]];sp.chain.L=sp.chain.L.map(v=>v*SC);if(sp.chain.tl)sp.chain.tl=[sp.chain.tl[0]*SC,sp.chain.tl[1]*SC,sp.chain.tl[2]]}
  sp.ant=(sp.ant||0)*SC;sp.f=sp.f||[];
  const L=sp.chain?sp.chain.L:[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);
  const dl=sp.dims.reduce((m,d)=>m+d[0],0)+(sp.chain?sp.chain.n*sp.chain.sg[0]:0);const R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];if(R[2])sp.fspd=R[2];SPI[sp.id]=sp}
Object.assign(FICHES,{
  scorpion:{nom:'Scorpion languedocien',ic:'🦂',role:'Chasseur nocturne',mange:"Ténébrions, vers de farine, cloportes, bousiers, fourmis : tout ce qui marche à sa portée.",par:"Personne ici. Dans la nature : chouettes, genettes, lézards.",aide:"Empêche les ténébrions de pulluler.",besoin:"Du sec, de la chaleur, une pierre ou une écorce pour se cacher le jour. Il peut jeûner très longtemps.",comp:"Caché le jour, il sort la nuit et attrape ses proies avec ses pinces ; la queue recourbée porte l'aiguillon. Sous une lampe UV, sa carapace brille en bleu-vert. La femelle met bas des petits vivants qui montent sur son dos."},
  tenebrion:{nom:'Ténébrion meunier',ic:'🪲',role:'Détritivore du désert',mange:"La litière sèche, les graines, les cadavres.",par:"Le scorpion.",aide:"Recycle les débris en nutriments, même au sec.",besoin:"Presque pas d'eau : il tire l'eau de sa nourriture. Il n'aime pas un sol détrempé.",comp:"Coléoptère noir et discret. Il pond dans le substrat : ses larves, les vers de farine, grandissent puis deviennent nymphes, et enfin adultes."},
  verfarine:{nom:'Ver de farine',ic:'🐛',role:'Larve détritivore',mange:"La litière et les graines.",par:"Le scorpion.",aide:"Deviendra un ténébrion adulte.",besoin:"Un substrat sec et de quoi grignoter.",comp:"Larve dorée et luisante du ténébrion. Bien nourrie, elle se fige en nymphe blanche, puis en sort adulte."},
  bousier:{nom:'Bousier sacré',ic:'🪲',role:'Recycleur, laboureur',mange:"Les crottes et la litière, qu'il roule en boule.",par:"Le scorpion, au désert.",aide:"Enterre les boules : le sol s'enrichit en nutriments et les plantes poussent mieux.",besoin:"De la litière ou des cadavres à rouler, un sol où creuser.",comp:"Façonne une boule plus grosse que lui, la roule à reculons avec ses pattes arrière jusqu'à son terrier, puis l'enterre. Il y pond parfois un œuf. Les Égyptiens le vénéraient sous le nom de Khépri."},
  rhinoceros:{nom:'Scarabée rhinocéros',ic:'🦏',role:'Géant du bois mort',mange:"Adulte : la sève des plantes, presque rien.",par:"Personne ici, il est trop gros et trop dur.",aide:"Ses larves recyclent le bois mort et l'humus.",besoin:"Un sol très riche (humus, litière, bois mort) pour pondre.",comp:"Le mâle porte une grande corne recourbée, la femelle une petite bosse. L'adulte vit peu de temps : il pond dans le terreau, près du bois mort. Ses larves, les vers blancs, y grandissent longtemps avant de se transformer."},
  verblanc:{nom:'Ver blanc',ic:'🐛',role:'Larve, mangeuse d\'humus',mange:"L'humus du sol et la litière enfouie.",par:"La scolopendre, sous terre.",aide:"Brasse la terre ; deviendra un scarabée rhinocéros.",besoin:"Un sol riche et un peu humide.",comp:"Grosse larve blanche en forme de C, tête orange. Elle vit sous terre et mange l'humus pendant des mois, puis se construit une loge et devient nymphe, d'où sort l'adulte cornu."},
});
Object.assign(SND,{scorpion:{w:'noise',f:3200,q:6,d:0.018,v:0.28,sc:[0,2,5,7],sl:1},tenebrion:{w:'noise',f:4300,q:8,d:0.01,v:0.22,sc:[0,3,5],sl:1},verfarine:{w:'sine',f:900,d:0.02,v:0.03,sc:[0],sl:1},
  bousier:{w:'triangle',f:620,d:0.04,v:0.28,sc:[0,5,7,12],sl:0.85},rhinoceros:{w:'square',f:220,d:0.05,v:0.07,sc:[0,3,7],sl:0.7},verblanc:{w:'sine',f:300,d:0.03,v:0.03,sc:[0],sl:1}});
ACH_LIST.push({k:'uvscorp',ic:'🦂',nom:'Lumière noire',txt:"Un scorpion brille sous les UV."},{k:'farine',ic:'🐛',nom:'Ver de farine',txt:"Une nymphe est devenue ténébrion."},{k:'boule',ic:'🪲',nom:'Rouler sa bosse',txt:"Un bousier a enterré sa boule."},{k:'rhino',ic:'🦏',nom:'Le grand réveil',txt:"Un ver blanc est devenu scarabée rhinocéros."});

// ----- outils communs -----
function nearItem(c,types,maxd){let b=null,bd=maxd;for(const it of items){if(it.dead||it.carried||!types.includes(it.type))continue;const d=dist3(c,it);if(d<bd){bd=d;b=it}}return b}
function goToItem(c,it,r=2){const ti=it.i??Math.floor(it.x/CS),tj=it.k!=null?(it.k/COLS|0):SURF[ti]-1;return goTo(c,kk=>Math.abs((kk%COLS)-ti)<=r&&Math.abs(((kk/COLS)|0)-tj)<=2,16000)}
function toShelter(c){const s=nearestShelter(c,220);if(!s||shelterAt(c))return false;return goTo(c,kk=>{const ii=kk%COLS;return Math.abs(ii-s.i)<=Math.max(2,s.w/2-1)&&((kk/COLS)|0)>=SURF[ii]-2},9000)}
// détritivores qui grignotent : renvoie true si le tour est occupé
function grignote(c,dt,mul=1){
  if(gravity(c,dt))return true;
  const k=c.k??cellOf(c.x,c.y),i=k%COLS,j=(k-i)/COLS;if(WET[K(i,Math.min(ROWS-1,j+1))]>0.75)c.energy-=0.15*dt; // trop humide : moisissures
  if(c.state==='eat'){c.v=0;c.t-=dt;if(c.t<=0){const it=c.goal;if(it&&!it.dead&&dist3(c,it)<CS*3){it.val-=1;c.energy+=it.type==='graine'?14:it.type==='cadavre'?20:16;addNut(it.i,SURF[it.i],0.15);if(it.val<=0)it.dead=true}c.state='idle';c.goal=null}return true}
  if(c.path&&c.path.length){if(c.goal&&(c.goal.dead||c.goal.carried)){c.path=null;c.state='idle'}else{stepPath(c,dt,mul);return true}}
  if(c.state==='go'){const it=c.goal;if(it&&!it.dead&&dist3(c,it)<CS*2.5){c.state='eat';c.t=2;return true}c.state='idle'}
  return false}
// ----- TÉNÉBRION et VER DE FARINE -----
function uTenebrion(c,dt){
  if(grignote(c,dt))return;
  c.t-=dt;if(c.t>0)return;c.t=1.5;
  if(c.energy<85){const it=nearItem(c,['litiere','cadavre'],260)||(c.energy<50&&nearItem(c,['graine'],200));if(it&&goToItem(c,it)){c.goal=it;c.state='go';return}}
  if(c.energy>80&&c.age>40&&(pop.tenebrion||0)+(pop.verfarine||0)<26&&canRepro('tenebrion',20)&&Math.random()<0.5){c.energy-=30;layEggs(c,'verfarine',{hatch:25,n:3})}
  if(isDay()&&Math.random()<0.5){if(toShelter(c)){c.state='abri';return}if(shelterAt(c))return}
  randomWalk(c,14);
}
function uVerfarine(c,dt){
  if(c.state==='nymphe'){c.v=0;c.t-=dt;if(c.t<=0){const b=born(SPI.tenebrion,c.x,c.y,{energy:55,z:c.z});b.k=c.k;die(c,'meta');jlog('🪲','Une nymphe devient ténébrion');ach('farine');wave({x:c.x,y:c.y,max:16,sp:40,col:'#e8d8a0',a:0.6})}return}
  if(grignote(c,dt,1))return;
  if(c.energy>60&&c.age>45){c.state='nymphe';c.t=20;c.path=null;c.v=0;jlog('🐛','Un ver de farine se fige en nymphe');return}
  c.t-=dt;if(c.t>0)return;c.t=1.5;
  if(c.energy<100){const it=nearItem(c,['litiere','cadavre'],200)||(c.energy<40&&nearItem(c,['graine'],150));if(it&&goToItem(c,it)){c.goal=it;c.state='go';return}}
  randomWalk(c,8);
}
// ----- SCORPION -----
const SCORP_PREY={tenebrion:26,verfarine:22,cloporte:28,fourmi:12,bousier:30,mouche:14,puceron:5,chenille:20,phasme:24};
const uvOn=()=>!!(DEV&&DEV.neon&&DEV.neon.on&&DEV.neon.type==='uv');
function uScorpion(c,dt){
  if(gravity(c,dt))return;c.cd=(c.cd||0)-dt;if(c.strike>0)c.strike-=dt;
  if(uvOn())ach('uvscorp');
  if(c.cd>3){c.v=0;return} // mange sa proie
  const night=!isDay(),hungry=c.energy<(night?85:40);
  if(c.cd<=0&&c.energy<110){for(const o of creatures){if(o.dead||o===c||!SCORP_PREY[o.sp.id]||o.fly)continue;if(dist3(o,c)<5.5){die(o,c);c.energy+=SCORP_PREY[o.sp.id];c.cd=6;c.strike=0.5;c.path=null;c.prey=null;wave({x:c.x,y:c.y,max:22,sp:60,col:c.cLine,a:0.7});return}}}
  if(!hungry){c.prey=null;
    if(c.path&&c.path.length){stepPath(c,dt,0.5);return}
    if(c.state!=='abri'&&c.state!=='repos'){if(toShelter(c)){c.state='abri';return}c.state='repos'}
    c.v=0;
  }else{
    if(c.state==='abri'||c.state==='repos'){c.state='rode';c.path=null}
    c.t-=dt;
    if(c.t<=0||!c.path||!c.path.length){c.t=1.5;let pr=null,bd=220;
      for(const o of creatures){if(o.dead||o===c||!SCORP_PREY[o.sp.id]||o.fly||o.k==null)continue;if(o.y>surfY(Math.floor(o.x/CS))+2)continue;const d=dist3(o,c);if(d<bd){bd=d;pr=o}}
      c.prey=pr;if(pr&&goTo(c,k=>k===pr.k,16000))c.state='hunt';else{c.state='rode';c.prey=null;randomWalk(c,20)}}
    stepPath(c,dt,c.state==='hunt'?0.8:0.4);
  }
  if(c.energy>100&&c.age>100&&canRepro('scorpion',4)&&Math.random()<dt*0.004){c.energy-=50;for(let q=0;q<2;q++){const b=born('scorpion',c.x,c.y,{energy:45});b.k=c.k}
    jlog('🦂','Une femelle scorpion met bas : 2 petits sur son dos');say('🦂 Des bébés scorpions sont nés !')}
}
// ----- BOUSIER -----
function uBousier(c,dt){
  if(gravity(c,dt))return;
  if(c.state==='bury'){c.v=0;c.t-=dt;if(Math.random()<dt*4)puff(c,'#c8a060',1,10,0.8);
    if(c.t<=0){const i=clamp(Math.floor(c.x/CS),1,COLS-2),v=c.ball?c.ball.val:1;addNut(i,SURF[i]+1,0.4+v*0.3);addNut(i,SURF[i]+5,0.25*v);c.energy+=12+v*6;
      if(c.energy>75&&canRepro('bousier',10)&&Math.random()<0.6){c.energy-=28;groundItem('oeuf',i,{val:1,sp:'bousier',z:c.z,hatch:50,n:1})}
      c.ball=null;c.state='idle';jlog('🪲','Un bousier enterre sa boule : le sol s\'enrichit');ach('boule');wave({x:c.x,y:c.y,max:18,sp:40,col:'#c8a060',a:0.6})}return}
  if(c.state==='roll'){if(c.path&&c.path.length){stepPath(c,dt,0.55);if(c.ball)c.ball.rot+=c.v*dt/Math.max(1,c.ball.r);return}c.state='bury';c.t=4;return}
  if(c.path&&c.path.length){if(c.goal&&(c.goal.dead||c.goal.carried)){c.path=null;c.state='idle'}else{stepPath(c,dt);return}}
  if(c.state==='go'){const it=c.goal;
    if(it&&!it.dead&&!it.carried&&dist3(c,it)<CS*2.5){ // façonne la boule avec ce qui traîne autour
      let v=it.val;it.dead=true;for(const o of items)if(!o.dead&&!o.carried&&(o.type==='litiere'||o.type==='cadavre')&&dist3(o,it)<8&&v<6){v+=o.val;o.dead=true}
      c.ball={val:v,r:Math.min(8,2.5+v*0.8),rot:0};c.goal=null;
      const ti=clamp(Math.floor(c.x/CS)+(Math.random()<0.5?-1:1)*Math.round(rnd(15,50)),3,COLS-4);
      if(goTo(c,kk=>Math.abs((kk%COLS)-ti)<=1&&((kk/COLS)|0)>=SURF[kk%COLS]-2,20000))c.state='roll';else{c.state='bury';c.t=4}
      return}
    c.state='idle'}
  c.t-=dt;if(c.t>0)return;c.t=1.5;
  if(c.energy<115){const it=nearItem(c,['litiere','cadavre'],300);if(it&&goToItem(c,it)){c.goal=it;c.state='go';return}}
  randomWalk(c,16);
}
// ----- SCARABÉE RHINOCÉROS et VER BLANC -----
let rhinoN=0;
function nestSite(c){let best=null,bs=-1;
  for(let q=0;q<24;q++){const i=clamp(Math.floor(c.x/CS)+Math.round(rnd(-70,70)),3,COLS-4);if(SURF[i]>=ROWS-6)continue;let s=0;for(let d=1;d<6;d++){const k=K(i,SURF[i]+d);if(T[k]&&T[k]<5)s+=NUT[k]}
    let z=null;for(const d of decos)if((d.type==='tronc'||d.type==='branche'||d.type==='liege')&&Math.abs(d.i-i)<d.w/2+4){s+=2;z=(d.dz||0)+d.w*CS*0.3}
    for(const it of items)if(it.type==='litiere'&&Math.abs(it.i-i)<5)s+=0.3;
    if(s>bs){bs=s;best={i,z}}}
  return best}
function uRhinoceros(c,dt){
  if(gravity(c,dt))return;if(c.male==null)c.male=(rhinoN++)%2===0;c.cd=(c.cd||0)-dt;
  if(c.state==='ponte'){if(c.path&&c.path.length){stepPath(c,dt,0.7);return}const i=clamp(Math.floor(c.x/CS),1,COLS-2);c.energy-=30;c.goal=null;
    groundItem('oeuf',i,{val:1,sp:'verblanc',z:c.z,hatch:35,n:2});jlog('🥚','Un scarabée rhinocéros pond dans le terreau');c.state='idle';c.cd=30;return}
  const p=onPlant(c);
  if(p&&c.energy<130){p.e-=0.02*dt;c.energy+=0.7*dt;c.v=0;if((!c.path||!c.path.length)&&Math.random()<dt*0.03)goTo(c,k=>plantAtK(k,c.z)===p&&Math.random()<0.1,600)}
  if(c.path&&c.path.length){stepPath(c,dt,0.8);return}
  c.t-=dt;if(c.t>0)return;c.t=2;
  if(!c.male&&c.energy>55&&c.age>15&&c.cd<=0&&canRepro('verblanc',10)){const s=nestSite(c);if(s&&goTo(c,kk=>Math.abs((kk%COLS)-s.i)<=1&&((kk/COLS)|0)>=SURF[kk%COLS]-2,20000)){c.state='ponte';c.goal={z:s.z??c.z,dead:false};return}}
  if(p&&c.energy<130)return;
  if(c.energy<110){if(!seekPlant(c,q=>q.h>6))randomWalk(c,15)}else randomWalk(c,15);
}
function uVerblanc(c,dt){
  if(c.state==='nymphe'){c.v=0;c.t-=dt;if(c.t<=0){const i=clamp(Math.floor(c.x/CS),1,COLS-2);const b=born(SPI.rhinoceros,c.x,surfY(i)-2,{energy:75,z:c.z});b.k=findWalk(b.x,b.y);const [x,y]=cxy(b.k);b.x=x;b.y=y;
      die(c,'meta');jlog('🦏','Un scarabée rhinocéros sort de terre');ach('rhino');say('🦏 Un ver blanc est devenu scarabée rhinocéros !');wave({x:b.x,y:b.y,max:26,sp:50,col:'#ffb060',a:0.8})}return}
  const k=cellOf(c.x,c.y);
  if(T[k]&&T[k]!==5){const n=NUT[k];if(n>0.12){const take=Math.min(n-0.1,0.006*dt);NUT[k]-=take;c.energy+=take*45;soilDirty=true}if(WET[k]<0.12)c.energy-=0.15*dt}
  if(!soilOk(c.x,c.y)){c.y+=30*dt;c.v=8}
  if(c.age>80&&c.energy>65){c.state='nymphe';c.t=25;c.v=0;jlog('🐛','Un ver blanc se construit une loge de nymphose');return}
  if(!c.tg||dist(c.x,c.y,c.tg.x,c.tg.y)<4||(c.tt=(c.tt||0)-dt)<0){
    if(c.tg&&c.tg.it&&!c.tg.it.dead&&dist(c.x,c.y,c.tg.x,c.tg.y)<5){const it=c.tg.it;it.val-=1;c.energy+=18;addNut(it.i,SURF[it.i],0.3);if(it.val<=0)it.dead=true}
    c.tt=10;let it=null;
    if(c.energy<80){let bd=90;for(const q of items){if(q.type!=='litiere')continue;const d=Math.abs(q.x-c.x);if(d<bd){bd=d;it=q}}}
    if(it)c.tg={x:it.x,y:surfY(it.i)+CS*1.5,it};
    else{let best=null,bn=-1;for(let q=0;q<8;q++){const i=clamp(Math.floor(c.x/CS)+Math.round(rnd(-30,30)),1,COLS-2),j=SURF[i]+Math.floor(rnd(3,35));if(j>=ROWS)continue;const kk=K(i,j);if(T[kk]&&T[kk]!==5&&NUT[kk]>bn){bn=NUT[kk];best=[i,j]}}
      c.tg=best?{x:best[0]*CS+CS/2,y:Y0+best[1]*CS+CS/2}:{x:c.x,y:c.y+CS}}}
  const a=Math.atan2(c.tg.y-c.y,c.tg.x-c.x);c.ang+=clamp(angDiff(c.ang,a),-2*dt,2*dt);
  const nx=c.x+Math.cos(c.ang)*c.sp.spd*dt,ny=c.y+Math.sin(c.ang)*c.sp.spd*dt;
  if(soilOk(nx,ny)||ny<c.y&&soilOk(nx,ny+CS)){c.x=nx;c.y=ny;c.v=c.sp.spd}else{c.ang+=rnd(1,2);c.v=0}
  c.x=clamp(c.x,3,WW-3);
}
Object.assign(UPD,{scorpion:uScorpion,tenebrion:uTenebrion,verfarine:uVerfarine,bousier:uBousier,rhinoceros:uRhinoceros,verblanc:uVerblanc});
Object.assign(INTEREST,{
  scorpion:{r:26,txt:'une proie',f:c=>creatures.find(o=>!o.dead&&o!==c&&SCORP_PREY[o.sp.id]&&!o.fly&&dist3(o,c)<26)},
  tenebrion:{r:24,txt:'de quoi grignoter',f:c=>items.find(it=>!it.carried&&!it.dead&&(it.type==='litiere'||it.type==='graine'||it.type==='cadavre')&&dist3(it,c)<24)},
  verfarine:{r:20,txt:'de quoi grignoter',f:c=>items.find(it=>!it.carried&&!it.dead&&(it.type==='litiere'||it.type==='graine')&&dist3(it,c)<20)},
  bousier:{r:26,txt:'de quoi faire une boule',f:c=>items.find(it=>!it.carried&&!it.dead&&(it.type==='litiere'||it.type==='cadavre')&&dist3(it,c)<26)},
  rhinoceros:{r:24,txt:'une plante à téter',f:c=>plants.find(p=>p.alive&&p.h>6&&Math.hypot(p.col*CS-c.x,p.z-c.z)<24)},
});

// ----- CACTUS : pousse au sec, pourrit au mouillé -----
function updCactus(p,dt){
  p.age+=dt;const i=p.col;if(!p.cx){p.cx=1;p.maxAge*=2.5}
  let w=0,n=0,cnt=0;
  for(let di=-2;di<=2;di++)for(let dj=1;dj<=14;dj++){const ii=i+di,jj=p.base+dj;if(ii<0||ii>=COLS||jj>=ROWS)continue;const k=K(ii,jj);if(!T[k]||T[k]===5)continue;cnt++;w+=WET[k];
    const take=Math.min(NUT[k],0.0006*dt);NUT[k]-=take;n+=take;WET[k]=Math.max(0,WET[k]-0.0005*dt)}
  w=cnt?w/cnt:0;p.wet=w;p.rot=w>0.42;
  const lf=lightF();if(!p.rot)p.e+=(dt*0.07+n*3)*lf;
  p.e-=dt*(0.0012*p.h+(p.rot?0.12+(w-0.42)*1.2:0)+p.aph*0.09);
  if(p.e>1.5&&p.h<p.maxH){const j=p.base-p.h;if(j>4&&!T[K(i,j)]){p.e-=0.35;STEM[K(i,j)]++;p.h++}}
  const f=p.fl;
  if(p.h>=p.maxH){if(f.t>0)f.t-=dt;else if(!f.open&&p.e>0&&!p.rot){f.open=true;f.nectar=1}
    if(f.open){f.nectar=Math.min(3,f.nectar+0.12*dt);
      if(f.poll){f.seedT+=dt;if(f.seedT>8){for(let s=0;s<2;s++)groundItem('graine',i+Math.round(rnd(4,30))*(Math.random()<0.5?-1:1),{val:3,z:p.z+rnd(-40,40),kind:'cactus'});f.open=false;f.poll=false;f.seedT=0;f.t=25;p.e-=0.5}}
      else if(Math.random()<dt*0.015){groundItem('graine',i+Math.round(rnd(4,30))*(Math.random()<0.5?-1:1),{val:3,z:p.z+rnd(-40,40),kind:'cactus'});f.t=25;f.open=false}}}
  if(p.e<-3||p.age>p.maxAge)killPlant(p);
}
{const _up=updPlant;updPlant=function(p,dt){if(p.kind==='cactus')updCactus(p,dt);else _up(p,dt)}}
// graines de cactus : germent dans le sable sec, jamais dans un sol détrempé
{const _ui=updItems;updItems=function(dt){const hold=[];
  for(const it of items){if(it.type!=='graine'||it.kind!=='cactus'||it.carried||it.dead)continue;const i=it.i,k=K(i,Math.min(ROWS-1,SURF[i])),wd=Math.max(WET[k],WET[K(i,Math.min(ROWS-1,SURF[i]+3))]);
    if(it.age>10&&SURF[i]<ROWS&&T[k]&&NUT[k]>0.02&&wd>0.08&&WET[k]<0.4&&plants.filter(p=>p.alive).length<Math.round((lvl.cap||18)*1.5)&&Math.random()<dt*0.3){if(newPlant(i,false,it.z,'cactus')){jlog('🌵','Une graine de cactus a germé');ach('germe');it.dead=true;continue}}
    if(WET[k]>=0.4){it.carried=true;hold.push(it)}}
  _ui(dt);for(const it of hold)it.carried=false}}
// sol du désert : la couche d'humus devient du sable pauvre et sec
{const _gw=genWorld;genWorld=function(...a){_gw(...a);let L=null;try{L=lvl}catch(e){}if(!L||!L.sable||L.sandbox)return;
  for(let i=0;i<COLS;i++)for(let j=SURF[i];j<ROWS;j++){const k=K(i,j);if(T[k]===1){T[k]=3;NUT[k]=rnd(0.04,0.09);WET[k]=0.14}else if(T[k]===2&&j<SURF[i]+30){WET[k]=Math.min(WET[k],0.25)}}
  soilDirty=true}}
function cactusCols(p){const rot=p.rot,vig=clamp(p.e/3,0.25,1),hue=rot?42:138;return {hue,line:hsl(hue+8,rot?45:60,34+vig*22),fill:hsl(hue,rot?40:55,12+vig*9,0.88),sp:hsl(52,60,80)}}
function drawCactusSide(p,x,yb,H,vig,sw){const C=cactusCols(p),w=3+Math.min(1,p.h/16)*4,top=yb-H;ctx.lineWidth=0.6;
  const col=(cx,by,ty,ww)=>{ctx.beginPath();ctx.moveTo(cx-ww/2,by);ctx.lineTo(cx-ww/2,ty+ww/2);ctx.arc(cx,ty+ww/2,ww/2,Math.PI,0);ctx.lineTo(cx+ww/2,by);ctx.closePath();ctx.fillStyle=C.fill;ctx.fill();ctx.strokeStyle=C.line;ctx.stroke();
    ctx.globalAlpha=0.45;ctx.beginPath();for(const r of[-0.22,0.22]){ctx.moveTo(cx+r*ww,by);ctx.lineTo(cx+r*ww,ty+ww*0.45)}ctx.stroke();ctx.globalAlpha=1;
    ctx.strokeStyle=C.sp;ctx.lineWidth=0.3;ctx.beginPath();for(let y=by-2;y>ty+ww*0.4;y-=2.6)for(const s of[-1,1]){ctx.moveTo(cx+s*ww/2,y);ctx.lineTo(cx+s*(ww/2+1.1),y-0.6)}ctx.stroke();ctx.lineWidth=0.6};
  // bras
  const sd=p.id%2?1:-1;
  if(H>22){const ay=yb-H*0.42,ax=x+sd*(w/2+3.5),aw=w*0.7;ctx.fillStyle=C.fill;ctx.strokeStyle=C.line;ctx.beginPath();ctx.ellipse(x+sd*(w/2+1.5),ay,2.6,aw/2,0,0,TAU);ctx.fill();ctx.stroke();col(ax,ay+aw*0.3,ay-H*0.3,aw)}
  if(H>45){const ay=yb-H*0.6,ax=x-sd*(w/2+3),aw=w*0.6;ctx.fillStyle=C.fill;ctx.strokeStyle=C.line;ctx.beginPath();ctx.ellipse(x-sd*(w/2+1.3),ay,2.2,aw/2,0,0,TAU);ctx.fill();ctx.stroke();col(ax,ay+aw*0.3,ay-H*0.22,aw)}
  col(x,yb,top,w);
  if(p.h>=p.maxH){const f=p.fl,fx=x,fy=top-0.5;
    if(f.open){const R=3.6;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.25+f.nectar/3*0.4;const spr=glowSprite(320);ctx.drawImage(spr,fx-R*2.2,fy-R*2.2,R*4.4,R*4.4);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      ctx.fillStyle=hsl(325,75,22,0.9);ctx.strokeStyle=hsl(f.poll?50:325,90,72);ctx.beginPath();for(let q=0;q<7;q++){const a=Math.PI+q/6*Math.PI;ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(a-0.18)*R,fy+Math.sin(a-0.18)*R*1.2);ctx.lineTo(fx+Math.cos(a+0.18)*R,fy+Math.sin(a+0.18)*R*1.2);ctx.closePath()}ctx.fill();ctx.stroke();ctx.fillStyle=hsl(55,100,65);ctx.fillRect(fx-0.7,fy-1.4,1.4,1.4)}
    else{ctx.strokeStyle=hsl(325,50,55);ctx.beginPath();ctx.arc(fx,fy-1,1.2,0,TAU);ctx.stroke()}}
}
function drawCactusTop(g,p){const C=cactusCols(p),x=p.col*CS+CS/2,y=-zOfPlant(p),r=1.5+Math.min(1,p.h/16)*2,sd=p.id%2?1:-1;
  const disc=(cx,cy,rr)=>{g.fillStyle=C.fill;g.strokeStyle=C.line;g.lineWidth=0.5;g.beginPath();g.arc(cx,cy,rr,0,TAU);g.fill();g.stroke();
    g.globalAlpha=0.5;g.beginPath();for(let q=0;q<8;q++){const a=q/8*TAU;g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}g.stroke();g.globalAlpha=1;
    g.fillStyle=C.sp;for(let q=0;q<8;q++){const a=q/8*TAU+0.2;g.fillRect(cx+Math.cos(a)*(rr+0.6)-0.25,cy+Math.sin(a)*(rr+0.6)-0.25,0.5,0.5)}};
  if(p.h*CS>22)disc(x+sd*(r+3.5),y,r*0.7);if(p.h*CS>45)disc(x-sd*(r+3),y+1,r*0.6);
  disc(x,y,r);
  if(p.h>=p.maxH&&p.fl.open){g.fillStyle=hsl(325,75,40);g.strokeStyle=hsl(p.fl.poll?50:325,90,72);g.lineWidth=0.4;g.beginPath();for(let q=0;q<8;q++){const a=q/8*TAU;g.moveTo(x,y);g.ellipse(x+Math.cos(a)*2,y+Math.sin(a)*2,1.6,0.8,a,0,TAU)}g.fill();g.stroke();g.fillStyle=hsl(55,100,65);g.fillRect(x-0.6,y-0.6,1.2,1.2)}}

// ----- DESSIN : pinces et queue du scorpion, corne, boule du bousier, nymphes -----
function pframe(c,i){const sp=c.sp,G=profGeom(c),g=c.segs[i],d=c.dims[i],hh=d[1]*(sp.chain?0.6:0.75),ground=CS*0.5/sp.sf,m=Math.cos(c.ang)>=0?1:-1;
  ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.a);ctx.scale(1,m);return {len:d[0],hh,by:ground-G.legH-hh*0.5,ground}}
function uvDot(x,y,R,a){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(glowSprite(178),x-R,y-R,R*2,R*2);ctx.restore()}
function scorpClaw(c,alpha,far){const f=pframe(c,0),uv=uvOn(),open=0.25+0.2*Math.sin(simT*3+c.x),dx=far?-0.8:0;
  const hx=f.len*0.3+dx,hy=f.by+f.hh*0.15,ex=f.len*0.5+4.5+dx,ey=f.by+f.hh*0.45,cx=ex+3.5,cy=ey-0.8;
  ctx.globalAlpha=alpha*(far?0.35:1);ctx.strokeStyle=uv?'#8ffff0':c.segL[0];ctx.lineWidth=far?0.8:1.1;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(ex,ey);ctx.lineTo(cx-1.5,cy);ctx.stroke();
  ctx.beginPath();ctx.ellipse(cx,cy,3.2,1.7,-0.15,0,TAU);ctx.fillStyle='#000';ctx.fill();ctx.fillStyle=uv?'rgba(90,255,230,0.45)':c.segT[0];ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+2.8,cy-0.6);ctx.lineTo(cx+6,cy-0.9-open*2);ctx.moveTo(cx+2.8,cy+0.6);ctx.lineTo(cx+6,cy+0.4+open);ctx.stroke();
  if(uv&&!far)uvDot(cx,cy,7,alpha*0.5);ctx.restore()}
function scorpTail(c,alpha){const f=pframe(c,1),uv=uvOn(),hunt=c.state==='hunt'||c.strike>0;
  const inc=(hunt?0.5:0.44)+Math.sin(simT*1.5+c.x)*0.02-(c.strike>0?0.3*Math.sin(c.strike/0.5*Math.PI):0);
  let px=-f.len/2+0.8,py=f.by-f.hh*0.15,phi=Math.PI+0.3;ctx.lineCap='round';
  for(let i=2;i<c.dims.length;i++){const d=c.dims[i],L=d[0]*1.05,last=i===c.dims.length-1,cx=px+Math.cos(phi)*L/2,cy=py+Math.sin(phi)*L/2;
    ctx.beginPath();ctx.ellipse(cx,cy,L/2+0.3,d[1]*(last?0.55:0.42),phi,0,TAU);ctx.globalAlpha=alpha;ctx.fillStyle='#000';ctx.fill();ctx.fillStyle=uv?'rgba(90,255,230,0.45)':c.segT[i];ctx.fill();
    ctx.strokeStyle=uv?'#8ffff0':c.segL[i];ctx.lineWidth=0.9;ctx.stroke();if(uv)uvDot(cx,cy,6,alpha*0.45);
    if(last){const ex=px+Math.cos(phi)*L,ey=py+Math.sin(phi)*L,a2=phi+1;ctx.beginPath();ctx.moveTo(ex-Math.cos(phi)*0.6,ey-Math.sin(phi)*0.6);ctx.quadraticCurveTo(ex+Math.cos(phi)*2.2,ey+Math.sin(phi)*2.2,ex+Math.cos(a2)*3.2,ey+Math.sin(a2)*3.2);ctx.lineWidth=0.8;ctx.stroke()}
    px+=Math.cos(phi)*L;py+=Math.sin(phi)*L;phi+=inc}
  ctx.restore()}
function uvBody(c,alpha,n){for(let i=0;i<n;i++){const f=pframe(c,i);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha*0.4;ctx.fillStyle='rgb(70,255,225)';ctx.beginPath();ctx.ellipse(0,f.by,f.len/2+0.4,f.hh/2,0,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';uvDot(0,f.by,f.len*0.9+6,alpha*0.5);ctx.restore()}}
function beetleShine(c,alpha){const n=c.dims.length-1,f=pframe(c,n);ctx.globalAlpha=alpha*0.55;ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(0,f.by,f.len*0.36,f.hh*0.36,0,Math.PI*1.15,Math.PI*1.7);ctx.stroke();ctx.restore()}
function rhinoHorn(c,alpha){const f=pframe(c,0),L=c.male===false?1.6:7.5;ctx.globalAlpha=alpha;ctx.lineCap='round';
  const x0=f.len*0.35,y0=f.by-f.hh*0.3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(f.len*0.55+L*0.25,f.by-f.hh*0.5-L*0.7,x0-L*0.2,f.by-f.hh*0.5-L);
  ctx.strokeStyle='#000';ctx.lineWidth=2.4;ctx.stroke();ctx.strokeStyle=c.segL[0];ctx.lineWidth=1.3;ctx.stroke();ctx.restore()}
function dungBall(c,alpha){const b=c.ball;if(!b)return;const n=c.dims.length-1,f=pframe(c,n),F=c.sp.sf,shr=c.state==='bury'?clamp(c.t/4,0.15,1):1,r=b.r/F*shr;
  const bx=-f.len/2-r*0.9,by=f.ground-r;ctx.globalAlpha=alpha;ctx.fillStyle='#3a2410';ctx.beginPath();ctx.arc(bx,by,r,0,TAU);ctx.fill();ctx.strokeStyle='#a0703a';ctx.lineWidth=0.6;ctx.stroke();
  ctx.save();ctx.clip();ctx.strokeStyle='rgba(200,150,90,0.6)';ctx.lineWidth=0.4;for(let q=0;q<4;q++){const a=b.rot*(Math.cos(c.ang)>=0?1:-1)+q*Math.PI/2;ctx.beginPath();ctx.arc(bx+Math.cos(a)*r*0.5,by+Math.sin(a)*r*0.5,r*0.35,0,TAU);ctx.stroke()}ctx.restore();ctx.restore()}
{const _p0=drawProfile0;drawProfile0=function(c,alpha,gray){const id=c.sp.id;
  if(gray||!(id==='scorpion'||id==='bousier'||id==='rhinoceros'||id==='tenebrion')){_p0(c,alpha,gray);return}
  if(id==='scorpion'){scorpClaw(c,alpha,true);const cc=Object.create(c);cc.segs=c.segs.slice(0,2);cc.dims=c.dims.slice(0,2);_p0(cc,alpha,false);if(uvOn())uvBody(c,alpha,2);scorpTail(c,alpha);scorpClaw(c,alpha,false);return}
  _p0(c,alpha,false);beetleShine(c,alpha);if(id==='rhinoceros')rhinoHorn(c,alpha);if(id==='bousier')dungBall(c,alpha)}}
// le bousier roule sa boule à reculons : on le dessine tête vers l'arrière
{const _dp=drawProfile;drawProfile=function(c,alpha,gray){if(!gray&&c.sp.id==='bousier'&&c.ball&&c.state==='roll'){c.ang+=Math.PI;_dp(c,alpha,gray);c.ang-=Math.PI}else _dp(c,alpha,gray)}}
// vue du dessus et vignettes
{const _dc=drawCreature;drawCreature=function(c,alpha,gray,preview){_dc(c,alpha,gray,preview);if(gray)return;const id=c.sp.id;
  if(id==='scorpion'){const h=c.segs[0],len=c.dims[0][0],w=c.dims[0][1],uv=!preview&&uvOn();ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=uv?'#8ffff0':c.cLine;ctx.lineWidth=1;ctx.lineCap='round';
    for(const sd of[-1,1]){const [x0,y0]=local(h,len*0.3,sd*w*0.35),[x1,y1]=local(h,len*0.5+2,sd*(w*0.5+4)),[x2,y2]=local(h,len*0.5+6,sd*(w*0.5+2.5)),[cx,cy]=local(h,len*0.5+8,sd*(w*0.5+2));
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,3.2,1.8,h.a,0,TAU);ctx.fillStyle=c.segT?c.segT[0]:'#333';ctx.fill();ctx.stroke();
      const [f1x,f1y]=local(h,len*0.5+12,sd*(w*0.5+1)),[f2x,f2y]=local(h,len*0.5+12,sd*(w*0.5+3));ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(f1x,f1y);ctx.moveTo(cx,cy);ctx.lineTo(f2x,f2y);ctx.stroke()}
    if(uv){ctx.globalCompositeOperation='lighter';const spr=glowSprite(178);for(let i=0;i<c.segs.length;i++){const g=c.segs[i],R=c.dims[i][1]*2+7;ctx.globalAlpha=alpha*0.55;ctx.drawImage(spr,g.x-R,g.y-R,R*2,R*2)}}
    ctx.restore()}
  else if(id==='rhinoceros'){const h=c.segs[0],len=c.dims[0][0];const [x0,y0]=local(h,len*0.4,0),[x1,y1]=local(h,len*0.4+(c.male===false?1.5:6),0);ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=c.cLine;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore()}
  else if(id==='bousier'&&!preview&&c.state==='roll'){const h=c.segs[0],r=5/c.sp.sf,[bx,by]=local(h,c.dims[0][0]*0.5+r,0);ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#3a2410';ctx.strokeStyle='#a0703a';ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(bx,by,r,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}}}
// nymphes : ver de farine (en surface) et ver blanc (loge sous terre)
{const _ch=drawChrysalis;drawChrysalis=function(c){if(c.state!=='nymphe'||(c.sp.id!=='verfarine'&&c.sp.id!=='verblanc'))return _ch(c);ctx.save();zT(c.z);
  if(c.sp.id==='verfarine'){ctx.fillStyle='#efe6c8';ctx.strokeStyle='#b8a878';ctx.lineWidth=0.3;ctx.beginPath();ctx.ellipse(c.x,c.y,3.2,1.5,0,0,TAU);ctx.fill();ctx.stroke();for(let q=-2;q<=2;q++){ctx.beginPath();ctx.moveTo(c.x+q*1.1,c.y-1.4);ctx.lineTo(c.x+q*1.1,c.y+1.4);ctx.stroke()}}
  else{ctx.fillStyle='#1a0f06';ctx.strokeStyle='#6a4a28';ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(c.x,c.y,13,8,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e8d6b0';ctx.strokeStyle='#a08050';ctx.lineWidth=0.4;ctx.beginPath();ctx.ellipse(c.x,c.y+0.5,9,5,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(c.x+6,c.y-2);ctx.quadraticCurveTo(c.x+8,c.y-6,c.x+4,c.y-6.5);ctx.stroke();
    ctx.globalAlpha=0.5;for(let q=-2;q<=2;q++){ctx.beginPath();ctx.moveTo(c.x+q*2.4,c.y-4);ctx.lineTo(c.x+q*2.4,c.y+5);ctx.stroke()}}
  ctx.restore();return true}}

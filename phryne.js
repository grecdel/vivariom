// ================= LA PHRYNE (amblypyge) =================
// Arachnide tropical tout plat, ni araignée ni scorpion : la première paire de pattes est devenue deux longs fouets
// qui tâtent devant elle, et ses pédipalpes épineux replient les proies comme une mante. Chasse la nuit, à l'affût,
// le jour elle se cache sous l'écorce ou un tronc. Sans venin, inoffensive.

const BSP7=[{id:'phryne',nom:'Phryne',la:'Damon diadema',role:'chasseur',h:25,s:35,l:30,spd:35,hz:2,ant:0,start:70,decay:0.09,age:1100,...INS({hd:[8,10,'o'],th:[4,8,'o'],ab:[14,11,'o'],sp:70,L:[10,12]})}];
Object.assign(REAL,{phryne:[30,40]});
for(const sp of BSP7){sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  sp.ant=0;sp.f=[];const L=[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);const dl=sp.dims.reduce((m,d)=>m+d[0],0),R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];SPI[sp.id]=sp}
FICHES.phryne={nom:'Phryne',ic:'🦀',role:'Chasseuse de nuit, à l\'affût',mange:"Grillons, cloportes, mouches, perce-oreilles, ténébrions : tout ce qui passe à portée de ses fouets.",par:"Personne ici. Dans la nature : grenouilles, lézards, scolopendres.",aide:"Calme les grillons et les cloportes trop nombreux.",besoin:"Chaud et humide (climat tropical), un tronc, de l'écorce ou une pierre pour se cacher le jour. Elle chasse la nuit.",comp:"Toute plate, elle marche de côté comme un crabe. Ses deux premières pattes sont devenues de longs fouets fins, plus longs que tout son corps, qu'elle agite pour tâter le noir. Quand une proie les touche, ses pédipalpes hérissés d'épines se déplient d'un coup et la referment comme un piège. Pas de venin, pas de soie : elle est inoffensive."};
if(typeof PLUS!=='undefined')PLUS.phryne={ou:"Forêts tropicales d'Afrique, d'Amérique et d'Asie : sous les écorces, dans les grottes et les troncs creux.",anec:"Les mères portent leurs petits sur le dos, et des chercheurs ont vu des petits phrynes rester près de leur mère et se toucher avec leurs fouets : un des rares arachnides qui vivent en famille."};
if(typeof REL!=='undefined'){REL.phryne={mange:['grillon','cloporte','mouche','perce','tenebrion'],par:[]};for(const id of REL.phryne.mange)if(REL[id]&&REL[id].par&&!REL[id].par.includes('phryne'))REL[id].par.push('phryne')}
if(typeof SCORP_PREY!=='undefined')SCORP_PREY.phryne=26;
if(typeof GRANDES!=='undefined')GRANDES.phryne='le standard ou le grand bac, avec un tronc ou de l\'écorce';
const PROIES_PHR={grillon:28,cloporte:18,mouche:12,moustique:8,perce:16,tenebrion:20,verfarine:16,gendarme:14,termite:10,blatte:20};
function uPhryne(c,dt){if(gravity(c,dt))return;c.cd=(c.cd||0)-dt;c.frappe=Math.max(0,(c.frappe||0)-dt);if(c.cd>0){c.v=0;return}
  const nuit=!isDay();
  // à portée de fouet : les pédipalpes se déplient
  if(c.energy<115){for(const o of creatures){if(o.dead||o===c||!PROIES_PHR[o.sp.id]||(pop[o.sp.id]||0)<2)continue;if(o.fly&&!(nuit&&Math.random()<0.3))continue;
    if(dist3(o,c)<(nuit?13:7)){die(o,c);c.energy+=PROIES_PHR[o.sp.id];c.cd=6;c.frappe=0.5;c.path=null;wave({x:c.x,y:c.y,max:16,sp:50,col:'#c9a070',a:0.5});return}}}
  if(c.path&&c.path.length){stepPath(c,dt,nuit?0.9:0.6);return}
  c.t=(c.t||0)-dt;if(c.t>0){c.v=0;return}c.t=nuit?rnd(1.5,4):rnd(3,7);
  if(!nuit){if(toShelter(c))return;if(shelterAt(c)){c.v=0;return}}
  if(nuit&&c.energy<90&&Math.random()<0.5){const L=creatures.filter(o=>!o.dead&&!o.fly&&PROIES_PHR[o.sp.id]&&(pop[o.sp.id]||0)>=2);const p=nearest(c,L,140);
    if(p&&p.k!=null){goTo(c,k=>Math.abs((k%COLS)-(p.k%COLS))<=2&&Math.abs(((k/COLS)|0)-((p.k/COLS)|0))<=2,9000);return}}
  if(c.energy>100&&c.age>120&&canRepro('phryne',3-eggsOf('phryne'))&&Math.random()<0.1){c.energy-=45;layEggs(c,'phryne',{hatch:70,n:3});jlog('🦀','Une phryne porte ses œufs sous le ventre')}
  if(nuit&&Math.random()<0.6){c.v=0;return}// surtout à l'affût
  randomWalk(c,nuit?10:5)}
UPD.phryne=uPhryne;
{const ss=sandboxSpecies;sandboxSpecies=function(){const s=ss();if(!s.includes('phryne'))s.push('phryne');return s}}
if(typeof GRANDIT!=='undefined')GRANDIT.push('phryne');
if(typeof NAISS_EXCLUES!=='undefined')NAISS_EXCLUES.push('phryne');

// ---------- dessin vu de côté ----------
function phryneCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,ph=c.walkPh||0,mv=(c.v||0)>0.5,yG=c.y+CS*0.5,hb=u*1.1;
  const brun=hsl(25,35,26),clair=hsl(38,45,55),fonce=hsl(20,30,14),cx=c.x+m*u*1.2,ax=c.x-m*u*2.6;
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  // trois paires de pattes de marche, très longues, genoux hauts, rayées
  const pattes=loin=>{const P=[[0.8,4.4,3.2],[0.0,0.8,3.4],[-0.8,-3.6,3.0]];for(let i=0;i<3;i++){const [at,pd,lv]=P[i],p=ph*TAU*0.5+i*TAUP+(loin?TAUP/2:0),ps=mv?Math.sin(p)*0.8:0,lift=mv?Math.max(0,Math.cos(p))*u*0.6:0;
      const x0=c.x+m*u*at,y0=yG-hb,fx=c.x+m*u*(pd+ps)+(loin?-m*u*0.4:0),fy=yG-lift,kx=x0+(fx-x0)*0.45,ky=Math.min(y0,fy)-u*lv;ctx.globalAlpha=alpha*(loin?0.5:1);
      const col=loin?fonce:brun;segPatte(x0,y0,kx,ky,u*0.35,u*0.28,col);segPatte(kx,ky,fx,fy,u*0.28,u*0.12,col);
      if(!loin){ctx.strokeStyle=clair;ctx.lineWidth=u*0.3;ctx.beginPath();for(const t of [0.3,0.65]){const bx=kx+(fx-kx)*t,by=ky+(fy-ky)*t;ctx.moveTo(bx-u*0.12,by-u*0.12);ctx.lineTo(bx+u*0.12,by+u*0.12)}ctx.stroke()}}ctx.globalAlpha=alpha};
  pattes(true);
  // abdomen plat et segmenté
  ctx.fillStyle=hsl(25,30,22);ctx.beginPath();ctx.ellipse(ax,yG-hb,u*3.4,u*0.85,0,0,TAU);ctx.fill();ctx.strokeStyle=fonce;ctx.lineWidth=u*0.1;ctx.beginPath();
  for(let q=-3;q<=3;q++){const x=ax+q*u*0.9,hh=u*0.8*Math.sqrt(Math.max(0,1-(q/3.8)**2));ctx.moveTo(x,yG-hb-hh);ctx.lineTo(x,yG-hb+hh)}ctx.stroke();
  // céphalothorax en galette, yeux sur le dessus
  ctx.fillStyle=brun;ctx.beginPath();ctx.ellipse(cx,yG-hb-u*0.1,u*2.2,u*0.8,0,0,TAU);ctx.fill();ctx.strokeStyle=fonce;ctx.lineWidth=u*0.1;ctx.stroke();
  ctx.fillStyle='#e8d090';ctx.beginPath();ctx.arc(cx+m*u*1.4,yG-hb-u*0.75,u*0.18,0,TAU);ctx.fill();
  pattes(false);
  // pédipalpes ravisseurs épineux : repliés, ou dépliés quand elle frappe
  const fr=(c.frappe||0)>0?1:0;for(const loin of [true,false]){ctx.globalAlpha=alpha*(loin?0.55:1);const col=loin?fonce:hsl(28,40,32);
    const x0=cx+m*u*1.9,y0=yG-hb,kx=x0+m*u*(1.4+fr*1.6),ky=y0-u*(2.2-fr*1.2),fx=kx+m*u*(fr?2.6:-0.6)+(loin?-m*u*0.3:0),fy=ky+u*(fr?0.8:1.6);
    segPatte(x0,y0,kx,ky,u*0.55,u*0.45,col);segPatte(kx,ky,fx,fy,u*0.45,u*0.25,col);
    if(!loin){ctx.strokeStyle='#e0c890';ctx.lineWidth=u*0.1;ctx.beginPath();for(const [ax0,ay0,bx,by] of [[x0,y0,kx,ky],[kx,ky,fx,fy]])for(let q=1;q<=4;q++){const t=q/5,x=ax0+(bx-ax0)*t,y=ay0+(by-ay0)*t,a=Math.atan2(by-ay0,bx-ax0)-TAUP/2*m;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*u*0.6,y+Math.sin(a)*u*0.6)}ctx.stroke()}}
  // les deux fouets : très longs, fins, qui balaient le noir
  for(const loin of [true,false]){ctx.globalAlpha=alpha*(loin?0.4:0.9);ctx.strokeStyle=loin?fonce:clair;ctx.lineWidth=Math.max(0.15,u*0.09);ctx.beginPath();
    let x=cx+m*u*1.2,y=yG-hb-u*0.2;ctx.moveTo(x,y);const n=16,bal=Math.sin(simT*(1.6+(loin?0.4:0))+c.phase*4+(loin?1.3:0));
    for(let q=1;q<=n;q++){const t=q/n,a=-0.5+t*0.9+bal*0.5*t;x+=m*Math.cos(a)*u*1.3;y+=Math.sin(a)*u*0.9;ctx.lineTo(x,Math.min(y,yG-u*0.1))}ctx.stroke()}
  ctx.globalAlpha=alpha;ctx.restore()}

// ---------- dessin vu de dessus ----------
function phryneDessus(c,alpha){const h=c.segs[0];const u=realLen(c)/c.sp.sf/10*(typeof ech==='function'?ech(c):1);
  const brun=hsl(25,35,26),clair=hsl(38,45,55),fonce=hsl(20,30,14);ctx.save();ctx.globalAlpha=alpha;ctx.translate(h.x,h.y);ctx.rotate(typeof DAXE==='function'?DAXE(c):c.ang);ctx.lineCap='round';
  // pattes de marche écartées comme un crabe
  const ph=(c.walkPh||0)*TAU*0.5+(c.phase||0);[[-0.6,0.9],[-1.6,0.1],[-2.5,-0.9]].forEach(([x,f],i)=>{for(const sd of [-1,1]){const sw=Math.sin(ph+i*TAUP+(sd>0?TAUP:0))*0.15,t1=sd*(TAUP/2-f*0.5)+sw,t2=sd*(TAUP/2-f*0.9)+sw;
    const x0=x*u,y0=sd*1.4*u,kx=x0+Math.cos(t1)*4.2*u,ky=y0+Math.sin(t1)*4.2*u,fx=kx+Math.cos(t2)*5*u,fy=ky+Math.sin(t2)*5*u;segPatte(x0,y0,kx,ky,0.4*u,0.32*u,brun);segPatte(kx,ky,fx,fy,0.3*u,0.12*u,brun);
    ctx.strokeStyle=clair;ctx.lineWidth=0.35*u;ctx.beginPath();for(const t of [0.35,0.7]){const bx=kx+(fx-kx)*t,by=ky+(fy-ky)*t;ctx.moveTo(bx,by);ctx.lineTo(bx+0.01,by)}ctx.stroke()}});
  // abdomen plat segmenté puis céphalothorax en haricot
  ctx.fillStyle=hsl(25,30,22);ctx.beginPath();ctx.ellipse(-5.6*u,0,u*3.6,u*2.4,0,0,TAU);ctx.fill();ctx.strokeStyle=fonce;ctx.lineWidth=u*0.12;ctx.beginPath();
  for(let q=-3;q<=3;q++){const x=-5.6*u+q*u*0.95,hh=u*2.3*Math.sqrt(Math.max(0,1-(q/3.8)**2));ctx.moveTo(x,-hh);ctx.lineTo(x,hh)}ctx.stroke();
  ctx.fillStyle=brun;ctx.beginPath();ctx.ellipse(-1.2*u,0,u*1.9,u*2.7,0,0,TAU);ctx.fill();ctx.strokeStyle=fonce;ctx.stroke();ctx.fillStyle=clair;ctx.beginPath();ctx.ellipse(-1.2*u,0,u*0.5,u*1.2,0,0,TAU);ctx.fill();
  ctx.fillStyle='#e8d090';ctx.beginPath();ctx.arc(0.4*u,0,u*0.25,0,TAU);ctx.fill();
  // pédipalpes épineux repliés devant (dépliés pendant la frappe)
  const fr=(c.frappe||0)>0?1:0;for(const sd of [-1,1]){const x0=0.4*u,y0=sd*0.8*u,kx=(2.2+fr*2)*u,ky=sd*(2.6-fr*1.4)*u,fx=fr?6*u:0.9*u,fy=sd*(fr?0.8:0.6)*u;
    segPatte(x0,y0,kx,ky,0.7*u,0.6*u,hsl(28,40,32));segPatte(kx,ky,fx,fy,0.55*u,0.3*u,hsl(28,40,32));
    ctx.strokeStyle='#e0c890';ctx.lineWidth=u*0.12;ctx.beginPath();for(let q=1;q<=4;q++){const t=q/5,x=kx+(fx-kx)*t,y=ky+(fy-ky)*t;ctx.moveTo(x,y);ctx.lineTo(x+0.5*u,y-sd*0.5*u)}ctx.stroke()}
  // les fouets
  for(const sd of [-1,1]){ctx.strokeStyle=clair;ctx.lineWidth=Math.max(0.2,u*0.12);ctx.beginPath();let x=0,y=sd*1.6*u;ctx.moveTo(x,y);const bal=Math.sin(simT*1.7+c.phase*4+(sd>0?1.4:0));
    for(let q=1;q<=18;q++){const t=q/18,a=sd*(0.75-t*0.55+bal*0.35*t);x+=Math.cos(a)*1.2*u;y+=Math.sin(a)*1.2*u;ctx.lineTo(x,y)}ctx.stroke()}
  ctx.restore()}

// ---------- branchements ----------
{const dp=drawProfile;drawProfile=function(c,alpha,gray){if(!gray&&c.sp.id==='phryne'){phryneCote(c,alpha);return}dp(c,alpha,gray)}}
{const dt0=drawTiny;drawTiny=function(c){if(c.sp.id==='phryne'&&realLen(c)*camZ>=2.2){drawProfile(c,1,false);return}dt0(c)}}
{const dcr=drawCreature;drawCreature=function(c,alpha,gray,preview){if(!gray&&c.sp.id==='phryne'&&c.segs&&c.segs[0]){try{phryneDessus(c,alpha);return}catch(e){}}dcr(c,alpha,gray,preview)}}
{const m0=mission;mission=function(c){if(c&&!c.dead&&c.sp.id==='phryne'){if((c.frappe||0)>0||c.cd>0)return '🦀 Replie sa proie dans ses pédipalpes épineux';return isDay()?'☀ Cachée sous l\'écorce jusqu\'à la nuit':'🌙 À l\'affût, elle tâte le noir avec ses fouets'}return m0(c)}}

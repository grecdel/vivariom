// ================= ANATOMIE PLUS RECONNAISSABLE : ARAIGNÉES ET SOLIFUGE =================
// Vue de côté (coupe, 3/4) : les araignées ont 8 pattes articulées en arceau au-dessus du corps, des chélicères
// (crochets) sous le céphalothorax, des pédipalpes devant, des yeux sur le dessus (deux gros yeux de face pour la sauteuse),
// des filières au bout de l'abdomen ; motifs propres à chaque espèce (croix de l'épeire, rayures de la loup,
// zébrures de la sauteuse, poils et genoux colorés des mygales). Dans sa toile, l'épeire est vue de face, pattes en étoile.
// Vue du dessus : chélicères et pédipalpes ajoutés. Nouvelle espèce : la solifuge (désert, chasseuse de nuit très rapide).
let ANAT=false;// nouveau dessin des araignées : en attente de l'avis de l'utilisateur (la solifuge, elle, a toujours son dessin)
const TAUP=Math.PI;
function pattePoils(x0,y0,x1,y1,n,len,col){ctx.strokeStyle=col;ctx.lineWidth=Math.max(0.12,len*0.12);ctx.beginPath();for(let q=1;q<=n;q++){const t=q/(n+1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,a=Math.atan2(y1-y0,x1-x0)+TAUP/2;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a+0.5)*len,y+Math.sin(a+0.5)*len)}ctx.stroke()}
function segPatte(x0,y0,x1,y1,w0,w1,col){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);ctx.fillStyle=col;ctx.beginPath();
  ctx.moveTo(x0+nx*w0/2,y0+ny*w0/2);ctx.lineTo(x1+nx*w1/2,y1+ny*w1/2);ctx.lineTo(x1-nx*w1/2,y1-ny*w1/2);ctx.lineTo(x0-nx*w0/2,y0-ny*w0/2);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(x1,y1,w1*0.55,0,TAU);ctx.fill()}
// couleurs d'une araignée selon l'espèce / la variante
function couleursAra(c){const v=c.sp.vid||'',h=c.sp.h,s=c.sp.s,l=c.sp.l;
  if(v.includes('mygale_bleue'))return {corps:hsl(150,25,28),abdo:hsl(28,75,42),patte:hsl(215,75,42),genou:hsl(215,80,60),fonce:hsl(220,40,14),poils:hsl(215,60,70)};
  if(v.includes('mygale'))return {corps:hsl(20,30,16),abdo:hsl(15,25,14),patte:hsl(20,25,15),genou:hsl(18,85,48),fonce:'#0d0805',poils:hsl(25,40,55)};
  if(v.includes('sauteuse'))return {corps:'#1a1a1a',abdo:'#1c1c1c',patte:'#2a2a2a',genou:'#4a4a4a',fonce:'#000',raie:'#e8e8e0',poils:'#bbb'};
  if(v.includes('loup'))return {corps:hsl(30,35,26),abdo:hsl(30,30,22),patte:hsl(32,30,30),genou:hsl(32,30,38),fonce:hsl(30,40,10),raie:hsl(40,35,55),poils:hsl(35,30,55)};
  return {corps:hsl(h,s*0.6,26),abdo:hsl(h,s*0.65,34),patte:hsl(h,s*0.5,30),genou:hsl(h,s*0.5,40),fonce:hsl(h,40,12),croix:'#f4ead8',poils:hsl(h,30,60)}}
const estMygale=c=>(c.sp.vid||'').includes('mygale'),estSauteuse=c=>(c.sp.vid||'').includes('sauteuse'),estLoup=c=>(c.sp.vid||'').includes('loup');
// ---------- l'araignée vue de côté ----------
function araigneeCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,K=couleursAra(c),myg=estMygale(c),sau=estSauteuse(c);
  const yG=c.y+CS*0.5,hb=u*(myg?2.4:sau?2.1:2.8),cx=c.x+m*u*1.7,cy=yG-hb,ab=c.sp.vid?1:1.25,ax=c.x-m*u*(2.1+ab*0.5),ay=yG-hb-u*0.5*ab,ph=c.walkPh||0,mv=(c.v||0)>0.5;
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';
  // 8 pattes : 4 de chaque côté ; celles du côté opposé, plus sombres, derrière le corps
  const ATT=[0.9,0.35,-0.25,-0.85],PIED=[9.0,4.8,-2.6,-7.4],LEVE=[5.0,4.4,4.0,4.6];
  const dessinePattes=loin=>{for(let i=0;i<4;i++){const sd=loin?1:0,p=ph*TAU*0.5+i*TAUP/2+sd*TAUP,ps=mv?Math.sin(p):0,lift=mv?Math.max(0,Math.cos(p))*u*0.7:0;
    const x0=cx+m*u*ATT[i]*(myg?1.1:1),y0=cy+u*0.35,fx=c.x+m*u*(PIED[i]*(myg?0.9:1)+ps*0.9)+(loin?-m*u*0.4:0),fy=yG-lift,kx=(x0+fx)/2+m*u*(i<2?0.6:-0.6),ky=Math.min(y0,fy)-u*LEVE[i]*(sau?0.8:1);
    const mx=kx+(fx-kx)*0.55+m*u*(i<2?0.5:-0.5),my=ky+(fy-ky)*0.45-u*0.2,w=u*(myg?0.85:0.5),col=loin?K.fonce:K.patte;
    ctx.globalAlpha=alpha*(loin?0.55:1);segPatte(x0,y0,kx,ky,w,w*0.85,col);segPatte(kx,ky,mx,my,w*0.8,w*0.6,loin?col:K.genou);segPatte(mx,my,fx,fy,w*0.55,w*0.3,col);
    if(!loin&&(myg||estLoup(c)))pattePoils(kx,ky,mx,my,myg?6:3,u*(myg?0.7:0.4),K.poils)}ctx.globalAlpha=alpha};
  dessinePattes(true);dessinePattes(false);
  // pédoncule, abdomen (filières au bout), céphalothorax
  ctx.fillStyle=K.fonce;ctx.beginPath();ctx.ellipse(c.x-m*u*0.2,cy+u*0.1,u*0.6,u*0.45,0,0,TAU);ctx.fill();
  const arx=u*(2.6*ab+(myg?0.3:0)),ary=u*(2.0*ab+(myg?0.2:0));ctx.fillStyle=K.abdo;ctx.beginPath();ctx.ellipse(ax,ay,arx,ary,-m*0.12,0,TAU);ctx.fill();ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.15;ctx.stroke();
  ctx.fillStyle=K.fonce;ctx.beginPath();ctx.moveTo(ax-m*arx*0.9,ay+ary*0.25);ctx.lineTo(ax-m*arx*1.18,ay+ary*0.45);ctx.lineTo(ax-m*arx*0.85,ay+ary*0.6);ctx.fill();
  // motifs de l'abdomen
  if(K.croix){ctx.fillStyle=K.croix;for(const [dx,dy] of [[0,-0.55],[0,-0.2],[0,0.15],[0,0.5],[-0.35,-0.2],[0.35,-0.2]]){ctx.beginPath();ctx.arc(ax+m*dx*arx,ay+dy*ary*0.8-ary*0.1,u*0.28,0,TAU);ctx.fill()}}
  if(K.raie&&sau){ctx.strokeStyle=K.raie;ctx.lineWidth=u*0.35;for(let q=-1;q<=1;q++){ctx.beginPath();ctx.ellipse(ax,ay,arx*(0.55+q*0.2),ary*0.95,0,-1.2,1.2);ctx.stroke()}}
  if(K.raie&&estLoup(c)){ctx.fillStyle=K.raie;ctx.beginPath();ctx.ellipse(ax,ay-ary*0.45,arx*0.6,ary*0.18,0,0,TAU);ctx.fill()}
  if(myg){ctx.strokeStyle=K.poils;ctx.lineWidth=u*0.12;ctx.globalAlpha=alpha*0.6;ctx.beginPath();for(let q=0;q<26;q++){const a=q/26*TAU,r1=1.0,r2=1.13;ctx.moveTo(ax+Math.cos(a)*arx*r1,ay+Math.sin(a)*ary*r1);ctx.lineTo(ax+Math.cos(a+0.08)*arx*r2,ay+Math.sin(a+0.08)*ary*r2)}ctx.stroke();ctx.globalAlpha=alpha}
  ctx.fillStyle=K.corps;ctx.beginPath();ctx.ellipse(cx,cy,u*(myg?2.3:2.0),u*(sau?1.55:1.3),m*0.08,0,TAU);ctx.fill();ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.15;ctx.stroke();
  if(estLoup(c)){ctx.fillStyle=K.raie;ctx.beginPath();ctx.ellipse(cx,cy-u*0.7,u*1.5,u*0.28,0,0,TAU);ctx.fill()}
  // chélicères (crochets) et pédipalpes devant
  const hx=cx+m*u*1.7,hy=cy+u*0.5;ctx.fillStyle=myg?K.fonce:K.corps;ctx.beginPath();ctx.ellipse(hx,hy,u*0.55,u*0.85,m*0.3,0,TAU);ctx.fill();
  ctx.strokeStyle='#0a0705';ctx.lineWidth=u*0.28;ctx.beginPath();ctx.moveTo(hx+m*u*0.2,hy+u*0.6);ctx.quadraticCurveTo(hx+m*u*0.55,hy+u*1.3,hx-m*u*0.15,hy+u*1.45);ctx.stroke();
  const pa=Math.sin(simT*3+c.phase*7)*0.2;ctx.globalAlpha=alpha;segPatte(cx+m*u*1.6,cy+u*0.1,cx+m*u*(2.7+pa*0.5),cy-u*0.5,u*0.35,u*0.3,K.patte);segPatte(cx+m*u*(2.7+pa*0.5),cy-u*0.5,cx+m*u*3.3,yG-u*0.6,u*0.3,u*(estLoup(c)||sau?0.45:0.3),K.genou);
  // yeux
  if(sau){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx+m*u*1.55,cy-u*0.35,u*0.55,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.85)';ctx.beginPath();ctx.arc(cx+m*u*1.65,cy-u*0.55,u*0.17,0,TAU);ctx.fill();
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx+m*u*0.6,cy-u*1.25,u*0.25,0,TAU);ctx.fill()}
  else{ctx.fillStyle='#050505';for(const [dx,dy,r] of [[1.25,-1.0,0.24],[0.9,-1.15,0.2],[1.5,-0.7,0.18]]){ctx.beginPath();ctx.arc(cx+m*u*dx,cy+u*dy,u*r,0,TAU);ctx.fill()}ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.arc(cx+m*u*1.3,cy-u*1.08,u*0.07,0,TAU);ctx.fill()}
  ctx.restore()}
// l'épeire dans sa toile : vue de face, pattes en étoile, la croix bien visible
function epeireToile(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,K=couleursAra(c);ctx.save();ctx.globalAlpha=alpha;ctx.translate(c.x,c.y);ctx.lineCap='round';
  const ANG=[-2.5,-2.05,-1.25,-0.75,0.75,1.25,2.05,2.5],lg=[6.5,5.5,5,6.2];
  for(let i=0;i<8;i++){const a=ANG[i]+Math.sin(simT*0.7+i)*0.03,k=i<4?i:7-i,Lp=u*lg[k],kx=Math.cos(a)*Lp*0.5,ky=Math.sin(a)*Lp*0.5-u*0.8,fx=Math.cos(a)*Lp,fy=Math.sin(a)*Lp+(i===0||i===7?-u*0.5:u*0.4);
    segPatte(Math.cos(a)*u*0.8,Math.sin(a)*u*0.6-u*1.5,kx,ky,u*0.45,u*0.38,K.patte);segPatte(kx,ky,fx,fy,u*0.38,u*0.2,K.genou)}
  ctx.fillStyle=K.corps;ctx.beginPath();ctx.ellipse(0,-u*1.6,u*1.3,u*1.5,0,0,TAU);ctx.fill();
  ctx.fillStyle=K.abdo;ctx.beginPath();ctx.ellipse(0,u*1.6,u*2.4,u*2.9,0,0,TAU);ctx.fill();ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.15;ctx.stroke();
  ctx.fillStyle=K.croix||'#eee';for(const [dx,dy] of [[0,0.4],[0,1.1],[0,1.8],[0,2.6],[-0.8,1.1],[0.8,1.1]]){ctx.beginPath();ctx.arc(dx*u,dy*u,u*0.3,0,TAU);ctx.fill()}
  ctx.fillStyle='#0a0705';for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(sd*u*0.4,-u*3.1,u*0.3,u*0.45,0,0,TAU);ctx.fill()}
  ctx.restore()}
const dansToile=c=>{if(c.sp.beh||c.sp.id!=='araignee'||typeof orbs==='undefined')return false;const o=orbs.find(o=>o.owner===c&&o.world===T);return !!(o&&o.prog>0.5&&Math.hypot(c.x-o.x,c.y-o.y)<o.r*0.5)};

// ---------- la solifuge ----------
const BSP6=[{id:'solifuge',nom:'Solifuge',la:'Galeodes araneoides',role:'chasseur',h:35,s:45,l:52,spd:45,hz:2,ant:0,start:70,decay:0.12,age:800,...INS({hd:[9,8,'o'],th:[5,6,'o'],ab:[16,9,'o'],sp:60,L:[9,11]})}];
Object.assign(REAL,{solifuge:[45,70]});
for(const sp of BSP6){sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  sp.ant=0;sp.f=[];const L=[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);const dl=sp.dims.reduce((m,d)=>m+d[0],0),R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];SPI[sp.id]=sp}
FICHES.solifuge={nom:'Solifuge',ic:'🦂',role:'Chasseuse du désert, très rapide',mange:"Ténébrions, vers de farine, grillons, cloportes, fourmis, perce-oreilles : tout ce qu'elle rattrape.",par:"Personne ici. Dans la nature : scorpions, lézards, oiseaux.",aide:"Garde les petits coléoptères du désert en équilibre.",besoin:"Du sable sec et chaud, un abri pour la journée. Elle chasse la nuit.",comp:"Ni araignée ni scorpion : un arachnide à part. D'énormes chélicères en pinces (jusqu'au tiers de son corps), des pédipalpes longs comme des pattes qu'elle tient devant elle pour tâter, et une course fulgurante. Pas de venin : elle broie ses proies."};
if(typeof PLUS!=='undefined')PLUS.solifuge={ou:"Déserts et steppes chaudes : Afrique du Nord, Moyen-Orient, sud de l'Espagne.",anec:"On l'appelle « araignée-chameau », et des légendes disent qu'elle mange les chameaux : c'est faux, elle ne fait que quelques centimètres et ne mange que des petites bêtes."};
if(typeof REL!=='undefined'){REL.solifuge={mange:['tenebrion','grillon','cloporte','fourmi','perce'],par:[]};if(REL.tenebrion)REL.tenebrion.par.push('solifuge')}
SCORP_PREY.solifuge=24;
const PROIES_SOLI={tenebrion:24,verfarine:20,grillon:26,cloporte:22,fourmi:10,perce:18,gendarme:14,bousier:24,termite:12};
function uSolifuge(c,dt){if(gravity(c,dt))return;c.cd=(c.cd||0)-dt;if(c.cd>0){c.v=0;c.mord=(c.mord||0)+dt;return}
  const nuit=!isDay();
  if(c.cd<=0&&c.energy<110){for(const o of creatures){if(o.dead||o===c||o.fly||!PROIES_SOLI[o.sp.id]||(pop[o.sp.id]||0)<2)continue;if(dist3(o,c)<6){die(o,c);c.energy+=PROIES_SOLI[o.sp.id];c.cd=5;c.path=null;wave({x:c.x,y:c.y,max:18,sp:60,col:'#e8c070',a:0.6});return}}}
  if(c.path&&c.path.length){stepPath(c,dt,nuit?1.4:0.8);return}
  c.t=(c.t||0)-dt;if(c.t>0){c.v=0;return}c.t=nuit?rnd(0.3,1):rnd(1.5,4);
  if(!nuit&&Math.random()<0.7){if(toShelter(c))return;if(shelterAt(c))return}
  if(c.energy<95){const L=creatures.filter(o=>!o.dead&&!o.fly&&PROIES_SOLI[o.sp.id]&&(pop[o.sp.id]||0)>=2);const p=nearest(c,L,180);if(p&&p.k!=null){goTo(c,k=>Math.abs((k%COLS)-(p.k%COLS))<=1&&Math.abs(((k/COLS)|0)-((p.k/COLS)|0))<=1,9000);return}}
  if(c.energy>95&&c.age>80&&canRepro('solifuge',4-eggsOf('solifuge'))&&Math.random()<0.15){c.energy-=45;layEggs(c,'solifuge',{hatch:45,n:2});jlog('🦂','Une solifuge pond dans un terrier de sable')}
  randomWalk(c,nuit?22:10)}
UPD.solifuge=uSolifuge;
{const ss=sandboxSpecies;sandboxSpecies=function(){const s=ss();if(!s.includes('solifuge'))s.push('solifuge');return s}}
if(typeof GRANDIT!=='undefined')GRANDIT.push('solifuge');
NAISS_EXCLUES.push('solifuge');
function solifugeCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,ph=c.walkPh||0,mv=(c.v||0)>0.5,yG=c.y+CS*0.5,hb=u*1.5;
  const sable=hsl(38,45,58),fonce=hsl(30,40,30),poil=hsl(40,40,78),hx=c.x+m*u*1.6,hy=yG-hb-u*0.3,axc=c.x-m*u*2.6,ayc=yG-hb;
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  const pattes=loin=>{const P=[[0.6,3.4,2.4],[-0.2,0.8,2.2],[-0.8,-1.8,2.1],[-1.3,-4.6,2.4]];for(let i=0;i<4;i++){const [at,pd,lv]=P[i],p=ph*TAU*0.6+i*TAUP/2+(loin?TAUP:0),ps=mv?Math.sin(p):0,lift=mv?Math.max(0,Math.cos(p))*u*0.8:0;
      const x0=c.x+m*u*at,y0=yG-hb+u*0.4,fx=c.x+m*u*(pd+ps)+(loin?-m*u*0.3:0),fy=i===0?yG-u*2.6:yG-lift,kx=(x0+fx)/2,ky=Math.min(y0,fy)-u*lv,col=loin?fonce:sable;
      ctx.globalAlpha=alpha*(loin?0.5:1);segPatte(x0,y0,kx,ky,u*0.42,u*0.35,col);segPatte(kx,ky,fx,fy,u*0.35,u*0.18,col);if(!loin)pattePoils(kx,ky,fx,fy,4,u*0.45,poil)}ctx.globalAlpha=alpha};
  pattes(true);pattes(false);
  // abdomen allongé et segmenté
  ctx.fillStyle=hsl(30,35,42);ctx.beginPath();ctx.ellipse(axc,ayc,u*3.4,u*1.5,-m*0.05,0,TAU);ctx.fill();ctx.strokeStyle=fonce;ctx.lineWidth=u*0.12;ctx.beginPath();for(let q=-3;q<=3;q++){const x=axc+q*u*0.9;ctx.moveTo(x,ayc-u*1.3*Math.sqrt(1-(q/3.8)**2));ctx.lineTo(x,ayc+u*1.3*Math.sqrt(1-(q/3.8)**2))}ctx.stroke();
  ctx.fillStyle=sable;ctx.beginPath();ctx.ellipse(c.x+m*u*0.1,yG-hb,u*1.2,u*1.1,0,0,TAU);ctx.fill();
  // grosse tête (propeltidium) et chélicères en pinces qui s'ouvrent
  ctx.fillStyle=sable;ctx.beginPath();ctx.ellipse(hx,hy,u*1.8,u*1.6,0,0,TAU);ctx.fill();ctx.strokeStyle=fonce;ctx.lineWidth=u*0.12;ctx.stroke();
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(hx+m*u*0.6,hy-u*1.3,u*0.28,0,TAU);ctx.fill();
  const ouv=0.25+0.25*Math.sin(simT*(c.mord>0?14:2.5)+c.phase*5);for(const sd of [-1,1]){const a=sd*ouv;ctx.fillStyle=sd<0?hsl(18,55,30):hsl(22,60,42);ctx.strokeStyle='#1a0e06';ctx.beginPath();
    const bx=hx+m*u*1.0,by=hy+u*0.1+sd*u*0.45,tx=bx+m*u*3.6*Math.cos(a),ty=by+u*3.6*Math.sin(a)+u*0.3;ctx.moveTo(bx,by-u*0.55);ctx.quadraticCurveTo(bx+m*u*1.8,by-u*0.8+sd*u*0.2,tx,ty);ctx.quadraticCurveTo(bx+m*u*1.5,by+u*0.5,bx,by+u*0.55);ctx.fill();ctx.lineWidth=u*0.12;ctx.stroke();
    ctx.strokeStyle='#2a1a0a';ctx.lineWidth=u*0.12;ctx.beginPath();for(let q=1;q<4;q++){const t=q/4;ctx.moveTo(bx+m*u*3*t,by+(ty-by)*t);ctx.lineTo(bx+m*u*3*t,by+(ty-by)*t-sd*u*0.25)}ctx.stroke()}
  // pédipalpes : longs comme des pattes, tenus devant pour tâter, bout arrondi
  const pp=Math.sin(simT*4+c.phase*3)*0.3;for(const loin of [true,false]){ctx.globalAlpha=alpha*(loin?0.55:1);const x0=hx+m*u*0.8,y0=hy+u*0.8,kx=x0+m*u*2.2,ky=hy-u*1.6+pp*u,fx=x0+m*u*(5.2+pp)+(loin?-m*u*0.4:0),fy=yG-u*1.2;
    segPatte(x0,y0,kx,ky,u*0.5,u*0.45,loin?fonce:sable);segPatte(kx,ky,fx,fy,u*0.45,u*0.4,loin?fonce:sable);ctx.fillStyle=loin?fonce:hsl(40,50,80);ctx.beginPath();ctx.arc(fx,fy,u*0.38,0,TAU);ctx.fill();if(!loin)pattePoils(kx,ky,fx,fy,5,u*0.5,poil)}
  ctx.globalAlpha=alpha;ctx.restore()}

// ---------- branchement dans le dessin ----------
{const dp=drawProfile;drawProfile=function(c,alpha,gray){if(gray){dp(c,alpha,gray);return}
  if(c.sp.id==='solifuge'){solifugeCote(c,alpha);return}
  if(!ANAT){dp(c,alpha,gray);return}
  if(c.sp.id==='araignee'&&c.state!=='caught'&&!(c.leap||c.saut)){if(dansToile(c))epeireToile(c,alpha);else araigneeCote(c,alpha);if(c.malade&&typeof dessinPlus==='function')dessinPlus(c,ctx);return}
  dp(c,alpha,gray)}}
{const dt0=drawTiny;drawTiny=function(c){if((c.sp.id==='solifuge'||ANAT&&c.sp.id==='araignee')&&realLen(c)*camZ>=2.2){drawProfile(c,1,false);return}dt0(c)}}
// vue du dessus : chélicères et pédipalpes devant la tête ; solifuge dessinée à part
{const dcr=drawCreature;drawCreature=function(c,alpha,gray,preview){dcr(c,alpha,gray,preview);if(gray)return;const id=c.sp.id;if(id!=='solifuge'&&!(ANAT&&id==='araignee'))return;
  const h=c.segs[0];if(!h)return;const len=c.dims[0][0],w=c.dims[0][1];ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.a??c.ang);ctx.globalAlpha=alpha;
  if(id==='solifuge'){ctx.fillStyle=hsl(35,45,55);for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(len*0.75,sd*w*0.18,len*0.45,w*0.14,sd*0.1,0,TAU);ctx.fill()}
    ctx.strokeStyle=hsl(38,45,58);ctx.lineWidth=w*0.12;for(const sd of [-1,1]){ctx.beginPath();ctx.moveTo(len*0.3,sd*w*0.4);ctx.quadraticCurveTo(len*0.9,sd*w*1.1,len*1.5,sd*w*0.9);ctx.stroke()}}
  else{ctx.fillStyle='#0a0705';for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(len*0.55,sd*w*0.16,len*0.16,w*0.12,0,0,TAU);ctx.fill()}
    ctx.strokeStyle=couleursAra(c).genou;ctx.lineWidth=Math.max(0.3,w*0.08);for(const sd of [-1,1]){ctx.beginPath();ctx.moveTo(len*0.4,sd*w*0.3);ctx.quadraticCurveTo(len*0.75,sd*w*0.6,len*0.85,sd*w*0.38);ctx.stroke()}}
  ctx.restore()}}
{const m0=mission;mission=function(c){if(c&&!c.dead&&c.sp.id==='solifuge'){if(c.cd>0)return '🦂 Broie sa proie avec ses chélicères';return isDay()?'☀ Se cache du soleil':'🌙 Chasse à toute vitesse dans le noir'}return m0(c)}}
// galerie pour comparer les dessins (essais)
if(window.__sim)window.__sim.anat=v=>{ANAT=!!v};
if(window.__sim)window.__sim.galerie=(ids,anat,taille=260)=>{const keep=ANAT;ANAT=anat;const out=[];const keepCtx=ctx;
  for(const id of ids){const sp=spOf(id);if(!sp)continue;const cvs=document.createElement('canvas');cvs.width=taille*2;cvs.height=taille;const g=cvs.getContext('2d');g.fillStyle='#14110d';g.fillRect(0,0,cvs.width,cvs.height);
    const c=mk(sp,0,0);c.ang=0;c.v=2;c.walkPh=0.3;c.energy=sp.start;const L=realLen(c),k=taille*0.9/Math.max(8,L*2.0);
    ctx=g;g.setTransform(k,0,0,k,taille*0.55,taille*0.72);g.fillStyle='#3a2a18';g.fillRect(-taille,CS*0.5,taille*2,taille);try{drawProfile(c,1,false)}catch(e){out.push('ERR '+e.message)}
    g.setTransform(1,0,0,1,0,0);g.fillStyle='#ccc';g.font='14px sans-serif';g.fillText(sp.vnom||FICHES[sp.id].nom,8,18);
    try{g.save();g.translate(taille*1.5,taille*0.5);const s=taille*0.5/Math.max(8,L*1.5)*sp.sf;g.scale(s,s);ctx=g;c.segs.forEach((sg,i)=>{sg.x=-i*4;sg.y=0;sg.a=0});drawCreature(c,1,false,true);g.restore()}catch(e){out.push('ERR top '+e.message)}
    out.push(cvs.toDataURL())}
  ctx=keepCtx;ANAT=keep;return out};

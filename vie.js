// ================= VIE DES BÊTES (lot 2) =================
// pucerons ailés, petits scorpions sur le dos de leur mère, frappe de la mante, guerre entre colonies de fourmis,
// maladie (champignon) quand c'est trop humide, larves et nymphes (coccinelle, mouche), ver luisant, grillon,
// bébés qui grandissent, bêtes âgées plus lentes et plus pâles.

// ---------- deux nouvelles espèces : grillon champêtre et ver luisant ----------
const BSP4=[
{id:'grillon',nom:'Grillon champêtre',la:'Gryllus campestris',role:'decomposeur',h:25,s:35,l:13,spd:20,hz:1.4,ant:10,start:60,decay:0.09,age:650,...INS({hd:[4,4.6,'o'],th:[4.5,5.2,'o'],ab:[11,5.6,'o'],sp:55,L:[5,6],Lk:[0.9,1,1.7]})},
{id:'luciole',nom:'Ver luisant',la:'Lampyris noctiluca',role:'chasseur',h:38,s:25,l:20,spd:7,hz:1.1,ant:1.5,start:60,decay:0.08,age:700,...INS({hd:[2,2.4,'o'],th:[3,3.8,'o'],ab:[12,4.4,'o'],L:[2.5,2.6]})},
];
Object.assign(REAL,{grillon:[22,30],luciole:[18,6]});
for(const sp of BSP4){
  sp.mass=sp.dims.reduce((m,d)=>m+d[0]*d[1],0)/40;sp.dims=sp.dims.map(d=>[d[0]*SC,d[1]*SC,d[2]]);sp.legs=sp.legs.map(l=>[l[0],l[1],l[2],l[3],l[4]*SC,l[5]*SC]);
  sp.ant=(sp.ant||0)*SC;sp.f=sp.f||[];const L=[sp.legs[0][4],sp.legs[0][5]];sp.thresh=Math.max(2,(L[0]+L[1])*0.4);
  const dl=sp.dims.reduce((m,d)=>m+d[0],0),R=REAL[sp.id];sp.sf=R[0]/dl;sp.spd=R[1];SPI[sp.id]=sp}
Object.assign(FICHES,{
  grillon:{nom:'Grillon champêtre',ic:'🎶',role:'Chanteur, détritivore',mange:"La litière, les graines, les cadavres et les fruits tombés.",par:"Le scorpion, la mante, les araignées chasseuses, la scolopendre.",aide:"Recycle les débris ; son chant anime les nuits du vivarium.",besoin:"Un abri pour la journée (pierre, écorce), un sol sec en surface.",comp:"Caché le jour, il sort la nuit. Le mâle chante en frottant ses ailes l'une contre l'autre. La femelle pond dans le sol avec sa longue tarière ; les petits ressemblent aux adultes, sans ailes."},
  luciole:{nom:'Ver luisant',ic:'✨',role:'Chasseur d\'escargots, lumineux',mange:"Les escargots surtout ; à défaut, les cadavres.",par:"Le scorpion, la scolopendre.",aide:"Empêche les escargots de tout dévorer.",besoin:"De l'humidité, des escargots, un coin sombre.",comp:"C'est un coléoptère : la femelle, sans ailes, ressemble à une larve. La nuit, le bout de son ventre s'allume d'une lumière vert-jaune froide pour attirer les mâles. Sa larve paralyse les escargots d'une morsure."}});
SCORP_PREY.grillon=26;PROIES_SAUT.grillon=18;PROIES_MYGALE.grillon=24;PROIES_MYGALE.luciole=20;SCORP_PREY.luciole=18;MANTE_PREY.push('grillon');
GROUPE_NOM.luciole='Ver luisant';
if(typeof REL!=='undefined'){REL.grillon={mange:['litiere','graine','cadavre'],par:['scorpion','mante','scolopendre','araignee:sol']};REL.luciole={mange:['escargot','cadavre'],par:['scorpion','scolopendre']};
  if(REL.escargot&&REL.escargot.par&&!REL.escargot.par.includes('luciole'))REL.escargot.par.push('luciole');if(REL.scorpion&&REL.scorpion.mange)REL.scorpion.mange.push('grillon')}
function uGrillon(c,dt){
  if(grignote(c,dt))return;const nuit=!isDay();
  c.t-=dt;if(c.t>0)return;c.t=1.5;
  if(c.energy<85){const it=nearItem(c,['litiere','cadavre','graine'],260);if(it&&goToItem(c,it)){c.goal=it;c.state='go';c.chante=false;return}}
  if(c.energy>85&&c.age>50&&canRepro('grillon',12-eggsOf('grillon'))&&Math.random()<0.3){c.energy-=35;layEggs(c,c.sp.vid||'grillon',{hatch:35,n:3});jlog('🎶','Une femelle grillon pond dans le sol')}
  if(!nuit){c.chante=false;if(Math.random()<0.6){if(toShelter(c)){c.state='abri';return}if(shelterAt(c))return}}
  c.chante=nuit&&!c.bebe&&Math.random()<0.6;if(c.chante){c.v=0;return}
  randomWalk(c,18)}
function uLuciole(c,dt){
  if(gravity(c,dt))return;c.cd=(c.cd||0)-dt;
  if(c.cd>0){c.v=0;return}// mange
  if(c.path&&c.path.length){if(c.prey&&!c.prey.dead&&dist3(c,c.prey)<4){die(c.prey,c);c.energy+=55;c.cd=8;c.prey=null;c.path=null;jlog('✨','Un ver luisant a eu un escargot');return}stepPath(c,dt);return}
  if(c.energy<80){const s=nearest(c,byId('escargot').filter(o=>(pop.escargot||0)>1),90);if(s){c.prey=s;goTo(c,k=>Math.abs((k%COLS)-Math.floor(s.x/CS))<=1&&Math.abs(((k/COLS)|0)-Math.floor((s.y-Y0)/CS))<=2,9000);return}
    if(grignote(c,dt))return;const it=nearItem(c,['cadavre'],160);if(it&&goToItem(c,it)){c.goal=it;c.state='go';return}}
  if(c.energy>90&&c.age>60&&canRepro('luciole',8-eggsOf('luciole'))&&Math.random()<dt*0.05){c.energy-=40;layEggs(c,c.sp.vid||'luciole',{hatch:40,n:2})}
  c.t=(c.t||0)-dt;if(c.t<=0){c.t=2;if(isDay()&&toShelter(c))return;randomWalk(c,10)}}
Object.assign(UPD,{grillon:uGrillon,luciole:uLuciole});
{const ss=sandboxSpecies;sandboxSpecies=function(){const s=ss();for(const id of ['grillon','luciole'])if(!s.includes(id))s.push(id);return s}}

// ---------- bébés qui grandissent, bêtes âgées ----------
const GRANDIT=['puceron','phasme','mante','araignee','scorpion','cloporte','scolopendre','escargot','lombric','grillon','luciole'];
const ech=c=>c.ech!=null?c.ech:c.bebe?0.5+0.5*clamp(c.age/(c.sp.age*0.12),0,1):1;
let HATCHING=false,HATCHED=[];
{const bv=born;born=function(id,x,y,o){const b=bv(id,x,y,o);if(b&&b.sp){if(GRANDIT.includes(b.sp.id))b.bebe=1;if(HATCHING)HATCHED.push(b);
  // petits scorpions : ils montent sur le dos de leur mère
  if(b.sp.id==='scorpion'&&CURC&&CURC.sp.id==='scorpion'){b.dos=CURC;b.dosT=rnd(40,60)}}return b}}

// ---------- larves et nymphes : coccinelle et mouche ----------
const CYCLE={coccinelle:{larve:45,nymphe:22,nl:'Une larve de coccinelle',nn:'Une nymphe de coccinelle'},mouche:{larve:25,nymphe:18,nl:'Un asticot',nn:'Une pupe de mouche'}};
{const he=hatchEggs;hatchEggs=function(dt){HATCHING=true;HATCHED=[];try{he(dt)}finally{HATCHING=false}
  for(const b of HATCHED){const C=CYCLE[b.sp.id];if(!C)continue;b.stade='larve';b.stT=C.larve*rnd(0.85,1.15);b.fly=false;b.k=findWalk(b.x,b.y);const [x,y]=cxy(b.k);b.x=x;b.y=y;b.energy=Math.max(b.energy,40)}
  HATCHED=[]}}
function uStade(c,dt){const C=CYCLE[c.sp.id];c.stT-=dt;
  if(c.stade==='nymphe'){c.v=0;c.path=null;c.energy=Math.max(c.energy,40);if(c.stT<=0){c.stade=null;jlog(FICHES[c.sp.id].ic,`${C.nn} devient adulte`);wave({x:c.x,y:c.y,max:14,sp:40,col:c.cLine,a:0.6});if(c.sp.id==='mouche')takeOff(c)}return}
  if(gravity(c,dt))return;
  if(c.stT<=0){c.stade='nymphe';c.stT=C.nymphe;c.v=0;c.path=null;jlog(FICHES[c.sp.id].ic,`${C.nl} se change en nymphe`);return}
  if(c.sp.id==='mouche'){c.energy+=dt*1.2;if(c.path&&c.path.length){stepPath(c,dt,0.4);return}if(Math.random()<dt*0.3)goTo(c,k=>Math.random()<0.1,200);c.v=0;return}
  // larve de coccinelle : vorace, elle mange des pucerons sur les plantes
  if(c.path&&c.path.length){stepPath(c,dt,0.7);if(c.prey&&!c.prey.dead&&dist3(c,c.prey)<4){die(c.prey,c);c.energy+=10;c.prey=null;c.path=null}return}
  const pr=(pop.puceron||0)>2?nearest(c,byId('puceron'),70):null;
  if(pr){if(dist3(c,pr)<4){die(pr,c);c.energy+=10;return}c.prey=pr;if(pr.k!=null)goTo(c,k=>k===pr.k||Math.abs((k%COLS)-(pr.k%COLS))+Math.abs(((k/COLS)|0)-((pr.k/COLS)|0))<=1,4000);return}
  c.t=(c.t||0)-dt;if(c.t<=0){c.t=2;randomWalk(c,10)}}

// ---------- pucerons ailés : une plante surpeuplée, certains s'envolent vers une autre ----------
const posPlante=q=>[q.col*CS+CS/2,Y0+(q.base-Math.max(2,Math.floor(q.h*0.6)))*CS];
function uAile(c,dt){const q=c.vol;if(!q||!q.alive){c.vol=null;land(c);return}const [tx,ty]=posPlante(q);
  flyTo(c,tx,ty,dt,3);c.z+=(q.z-(c.z||0))*Math.min(1,dt*2);c.tz=c.z;if(Math.hypot(c.x-tx,c.y-ty)<5){c.vol=null;land(c)}}
let ailesLog=0;
// ---------- frappe de la mante, petits sur le dos ----------
{const d0=die;die=function(c,by){if(by&&by.sp&&by.sp.id==='mante'&&!c.dead){by.frappe=0.45;by.fx=c.x;by.fy=c.y}d0(c,by)}}

// ---------- maladie : un champignon blanc quand le sol reste détrempé ----------
const AIME_HUMIDE=['lombric','escargot','cloporte','luciole','plante'];
let malT=0,guerreT=0;
function maladieTick(dt){malT-=dt;if(malT>0)return;malT=2;
  for(const c of creatures){if(c.dead||c.fly||AIME_HUMIDE.includes(c.sp.id))continue;const i=clamp(Math.floor(c.x/CS),0,COLS-1),j=clamp(Math.floor((c.y-Y0)/CS)+1,0,ROWS-1),w=WET[K(i,j)]||0;
    if(c.malade){c.malT=(c.malT||0)+2;if(w<0.45&&c.malT>30&&Math.random()<0.15){c.malade=false;c.malT=0}
      if(Math.random()<0.08)for(const o of creatures)if(!o.dead&&!o.malade&&o!==c&&o.sp.id===c.sp.id&&dist3(o,c)<6){o.malade=true;o.malT=0;break}continue}
    c.humT=w>0.8?(c.humT||0)+2:Math.max(0,(c.humT||0)-4);
    if(c.humT>40&&Math.random()<0.04){c.malade=true;c.malT=0;jlog('🍄',`Un champignon attaque : ${nm(c)} (sol trop humide)`);if(selC===c||Math.random()<0.3)say('🍄 Le sol reste détrempé : un champignon rend une bête malade. Aère ou laisse sécher.')}}}
// ---------- guerre entre colonies de fourmis ----------
function guerreTick(dt){guerreT-=dt;if(guerreT>0)return;guerreT=0.5;if(colonies.filter(o=>!o.dead).length<2)return;
  const F=creatures.filter(c=>!c.dead&&(c.sp.id==='fourmi')&&c.col);
  for(let a=0;a<F.length;a++){const A=F[a];if(A.dead)continue;for(let b=a+1;b<F.length;b++){const B=F[b];if(B.dead||B.col===A.col)continue;if(dist3(A,B)<4){
    A.energy-=8;B.energy-=8;A.combat=B.combat=1;puff(A,'#ff6a3a',6,14,1);if(Math.random()<0.35){const [m,v]=Math.random()<0.5?[A,B]:[B,A];die(m,v);v.energy+=6;if(Math.random()<0.2)jlog('⚔','Bataille entre deux colonies de fourmis')}break}}}}

// ---------- mise à jour : un passage par bête avant son comportement habituel ----------
for(const k of Object.keys(UPD)){const f=UPD[k];UPD[k]=function(c,dt){
  if(c.bebe&&c.age>c.sp.age*0.12)c.bebe=0;
  if(!c.vieux&&c.age>c.sp.age*0.8)c.vieux=true;
  const d=c.vieux?dt*0.7:c.bebe?dt*0.85:dt;
  if(c.frappe>0)c.frappe-=dt;
  if(c.malade)c.energy-=0.6*dt;
  if(c.dos){const m=c.dos;if(m.dead||(c.dosT-=dt)<=0){c.dos=null;c.k=m.dead?findWalk(c.x,c.y):m.k}else{c.x=m.x+Math.cos(c.phase*TAU)*1.5;c.y=m.y-3.5;c.z=c.tz=m.z;c.ang=m.ang;c.v=0;c.energy=Math.max(c.energy,30);return}}
  if(c.stade){uStade(c,d);return}
  if(c.vol){uAile(c,d);return}
  if(c.sp.id==='puceron'&&!c.bebe&&!c.fly&&Math.random()<dt*0.03){const p=plantAtK(c.k);if(p&&p.aph>=8){const L=plants.filter(q=>q.alive&&q!==p&&q.aph<4&&q.h>4);
    if(L.length){c.vol=L[Math.floor(Math.random()*L.length)];c.ailes=true;takeOff(c);if(simT-ailesLog>40){ailesLog=simT;jlog('🟢','Plante surpeuplée : des pucerons ailés s\'envolent')}return}}}
  f(c,d)}}
{const up=update;update=function(dt){up(dt);if(state==='menu')return;maladieTick(dt);guerreTick(dt);
  // chant des grillons la nuit
  if(typeof AC!=='undefined'&&AC&&soundOn&&OPT.amb!==false&&state==='play'&&!paused&&!isDay()){const n=creatures.filter(c=>!c.dead&&c.sp.id==='grillon'&&c.chante).length;if(n&&Math.random()<dt*0.6*Math.min(3,n))try{cricket(AC.currentTime+0.02)}catch(e){}}}}

// ---------- dessin ----------
const FILTRE=('filter' in mainCtx);
function dessinPlus(c,g){// en coordonnées du monde (vue de côté et 3/4)
  if(c.ailes&&c.sp.id==='puceron'){const fl=c.fly?Math.abs(Math.sin(simT*40+c.phase*9)):0.6;g.save();g.globalAlpha=0.35+0.3*fl;g.fillStyle='#e8fff0';g.strokeStyle='#bfe';g.lineWidth=0.15;
    for(const s of [-1,1]){g.beginPath();g.ellipse(c.x-s*0.4,c.y-2.6-fl,1.9,0.7,s*(0.5+fl*0.4),0,TAU);g.fill();g.stroke()}g.restore()}
  if(c.malade){g.save();g.fillStyle='#f4f4ee';g.globalAlpha=0.85;const L=Math.max(2,realLen(c));for(let q=0;q<6;q++){const a=q*1.7+c.phase,r=L*0.35;g.beginPath();g.arc(c.x+Math.cos(a)*r*0.8,c.y-L*0.25+Math.sin(a)*r*0.3,0.45,0,TAU);g.fill()}g.restore()}
  if(c.sp.id==='luciole'&&!isDay()){const L=realLen(c),t=c.x-Math.cos(c.ang)*L*0.4,R=(5+1.5*Math.sin(simT*1.7+c.phase*6))*Math.max(1,2.5/camZ);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=0.9;g.drawImage(glowSprite(48),t-R,c.y-1.5-R,R*2,R*2);g.fillStyle='#eaff7a';g.beginPath();g.arc(t,c.y-1.2,0.9,0,TAU);g.fill();g.restore()}
  if(c.sp.id==='grillon'&&c.chante&&!isDay()){g.save();g.strokeStyle='#ffe9a0';g.lineWidth=0.25;g.globalAlpha=0.35+0.35*Math.abs(Math.sin(simT*9));for(const r of [3,5]){g.beginPath();g.arc(c.x,c.y-3,r,-2.4,-0.7);g.stroke()}g.restore()}
  if(c.frappe>0&&c.fx!=null){const k=Math.sin(Math.max(0,c.frappe)/0.45*Math.PI),mx=c.x+(c.fx-c.x)*0.5,my=Math.min(c.y,c.fy)-4;g.save();g.strokeStyle=c.cLine||'#9c6';g.lineWidth=0.9;g.globalAlpha=k;g.lineCap='round';
    for(const s of [-0.8,0.8]){g.beginPath();g.moveTo(c.x,c.y-2+s);g.lineTo(mx,my+s);g.lineTo(c.x+(c.fx-c.x)*k,c.y+(c.fy-c.y)*k+s);g.stroke()}g.restore()}}
function dessinStade(c,g,x,y,u){// larve ou nymphe ; u = taille d'un mm à l'échelle de ce dessin
  const co=c.sp.id==='coccinelle';g.save();
  if(c.stade==='larve'){const L=(co?6:5)*u,ww=(co?2:1.6)*u,a=Math.cos(c.ang)>=0?0:Math.PI,wig=Math.sin(simT*6+c.phase*9)*0.15;g.translate(x,y);g.rotate(a+wig);
    g.fillStyle=co?'#2c3440':'#efe6cf';g.strokeStyle=co?'#11151b':'#b8ab88';g.lineWidth=0.25*u;g.beginPath();g.ellipse(0,0,L/2,ww/2,0,0,TAU);g.fill();g.stroke();
    for(let q=-2;q<=2;q++){g.beginPath();g.moveTo(q*L/6,-ww/2);g.lineTo(q*L/6,ww/2);g.stroke()}
    if(co){g.fillStyle='#ff8a2a';for(const q of [-1,1]){g.beginPath();g.arc(-L*0.08,q*ww*0.25,0.45*u,0,TAU);g.fill()}}}
  else{const r=(co?2.2:1.8)*u;g.fillStyle=co?'#e07a2a':'#6a3a1c';g.strokeStyle=co?'#5a2a0a':'#2a1408';g.lineWidth=0.25*u;g.beginPath();g.ellipse(x,y,r*1.2,r,0,0,TAU);g.fill();g.stroke();
    if(co){g.fillStyle='#2a1408';g.beginPath();g.arc(x-r*0.3,y,0.4*u,0,TAU);g.arc(x+r*0.4,y-r*0.2,0.4*u,0,TAU);g.fill()}}
  g.restore()}
{const dc=drawChrysalis;drawChrysalis=function(c){if(c.stade){ctx.save();zT(c.z);dessinStade(c,ctx,c.x,c.y-1.2,1);ctx.restore();return true}return dc(c)}}
{const dp=drawProfile;drawProfile=function(c,alpha,gray){if(gray){dp(c,alpha,gray);return}const e=ech(c),old=c.vieux&&FILTRE;
  if(old){ctx.save();ctx.filter='saturate(0.35) brightness(0.88)'}
  if(e<1){ctx.save();ctx.translate(c.x,c.y);ctx.scale(e,e);ctx.translate(-c.x,-c.y);dp(c,alpha,gray);ctx.restore()}else dp(c,alpha,gray);
  if(old)ctx.restore();dessinPlus(c,ctx)}}
{const dt0=drawTiny;drawTiny=function(c){const e=ech(c);if(e<1){ctx.save();ctx.translate(c.x,c.y);ctx.scale(e,e);ctx.translate(-c.x,-c.y);dt0(c);ctx.restore()}else dt0(c);
  if(c.sp.id==='luciole'||c.ailes||c.malade)dessinPlus(c,ctx)}}
// vue du dessus et vignettes : coordonnées locales (segments à l'échelle de l'espèce)
{const dcr=drawCreature;drawCreature=function(c,alpha,gray,preview){if(gray||preview){dcr(c,alpha,gray,preview);return}
  const h=c.segs[0],e=ech(c);
  if(c.stade&&h){dessinStade(c,ctx,h.x,h.y,1/c.sp.sf);return}
  const old=c.vieux&&FILTRE;if(old){ctx.save();ctx.filter='saturate(0.35) brightness(0.88)'}
  if(e<1&&h){ctx.save();ctx.translate(h.x,h.y);ctx.scale(e,e);ctx.translate(-h.x,-h.y);dcr(c,alpha,gray,preview);ctx.restore()}else dcr(c,alpha,gray,preview);
  if(old)ctx.restore();
  if(c.sp.id==='luciole'&&!isDay()&&h){const n=c.segs[c.segs.length-1],R=12/c.sp.sf;ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(glowSprite(48),n.x-R,n.y-R,R*2,R*2);ctx.restore()}
  if(c.malade&&h){ctx.save();ctx.fillStyle='#f4f4ee';for(let q=0;q<5;q++){const a=q*1.9;ctx.beginPath();ctx.arc(h.x+Math.cos(a)*3/c.sp.sf*2,h.y+Math.sin(a)*3/c.sp.sf*2,0.6/c.sp.sf*2,0,TAU);ctx.fill()}ctx.restore()}}}
{const up=updProxies;updProxies=function(dt){up(dt);for(const [c,p] of prox){p.ech=ech(c);p.vieux=c.vieux;p.stade=c.stade;p.malade=c.malade;p.ang=p.stade?c.ang:p.ang}}}
// ce que fait la bête sélectionnée
{const m0=mission;mission=function(c){if(!c||c.dead)return m0(c);
  if(c.dos)return '🦂 Petit scorpion, sur le dos de sa mère';
  if(c.stade==='larve')return c.sp.id==='coccinelle'?'🐛 Larve : dévore les pucerons, puis se fixera en nymphe':'🐛 Asticot : se nourrit, puis deviendra une pupe';
  if(c.stade==='nymphe')return '⏳ Nymphe immobile : se transforme en adulte';
  if(c.vol)return '🪽 Puceron ailé : part fonder une colonie sur une autre plante';
  if(c.malade)return '🍄 Malade : un champignon l\'affaiblit (sol trop humide)';
  if(c.sp.id==='grillon'&&c.chante)return '🎶 Chante pour attirer une femelle';
  if(c.sp.id==='luciole'&&!isDay())return '✨ S\'allume pour attirer un partenaire';
  if(c.sp.id==='luciole'&&c.prey)return '🐌 Traque un escargot';
  const m=m0(c);return (c.bebe?'🍼 Jeune, il grandit · ':c.vieux?'👴 Âgé, plus lent · ':'')+m}}
// les nouvelles espèces dans les règles d'objectif de naissances (lentes, comme le scorpion)
NAISS_EXCLUES.push('luciole');
if(window.__sim){window.__sim.vie=()=>({bebe:creatures.filter(c=>c.bebe).length,vieux:creatures.filter(c=>c.vieux).length,stade:creatures.filter(c=>c.stade).map(c=>c.sp.id+':'+c.stade).join(','),malade:creatures.filter(c=>c.malade).length,ailes:creatures.filter(c=>c.vol).length,dos:creatures.filter(c=>c.dos).length})}

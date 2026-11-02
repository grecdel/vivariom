// ================= PETITE PHYSIQUE DES ÉLÉMENTS NATURELS =================
// Pas de gros moteur : des ressorts amortis, simples et rapides (comme une tige qu'on pousse du doigt).
// - plantes : chaque tige a une flexion (p.bx) et une vitesse (p.bv). Le poids d'une bête qui grimpe la fait ployer,
//   un insecte qui se pose ou repart lui donne un petit coup, puis elle revient en oscillant ;
// - bêtes sur une tige : dessinées sur la tige qui ondule et ploie (elles restent collées à la plante) ;
// - toiles : onde qui part du point touché, creux sous le poids d'une proie qui se débat ;
// - sable : des grains sautent sous les pattes ; litière : les feuilles mortes bougent un peu au passage.
const RES_K=16,RES_AMORT=2.6;
function plantePortee(c){if(c.fly||c.k==null||c.dead)return null;return plantAtK(c.k,c.z)}
let physT=0;
function physiqueTick(dt){if(VEG==='actuel')return;
  // charges des bêtes sur les tiges
  for(const p of plants){p.charge=0;p.pousse=0}
  for(const c of creatures){const p=plantePortee(c);
    if(p){const H=Math.max(1,p.h*CS),t=clamp((Y0+(p.base+1)*CS-c.y)/H,0,1),m=clamp(c.sp.mass||1,0.3,12);p.charge+=m*t*t*(p.lean||(p.lean=rh(p,7)<0.5?-1:1));p.pousse+=(c.v||0)*0.02*m*t*Math.sin(simT*9+c.phase*6)}
    // atterrissage / décollage : petit coup sur la tige
    const p2=c.fly?null:p;if(c._pl!==p2){const q=p2||c._pl;if(q&&q.alive){q.bv=(q.bv||0)+(p2?1:-1)*(c.lean||1)*clamp((c.sp.mass||1)*2.2,1,10)*(rh(q,8)<0.5?-1:1)}c._pl=p2}}
  for(const p of plants){const H=Math.max(4,p.h*CS),soup=8/Math.sqrt(H/20),cible=clamp(p.charge*soup*0.9,-H*0.18,H*0.18);
    const f=-RES_K*((p.bx||0)-cible)-RES_AMORT*(p.bv||0)+p.pousse*12;p.bv=(p.bv||0)+f*dt;p.bx=clamp((p.bx||0)+p.bv*dt,-H*0.25,H*0.25)}
  // toiles : une proie prise se débat, le poids creuse la toile
  for(const o of orbs){if(o.world!==T)continue;o.charge=Math.max(0,(o.charge||0)-dt*0.3);
    for(const c of creatures)if(!c.dead&&c.state==='caught'&&Math.abs((c.z||0)-o.z)<6&&Math.hypot(c.x-o.x,c.y-o.y)<o.r){o.charge=Math.min(1,(o.charge||0)+dt*2);if(Math.random()<dt*2){o.vib=Math.max(o.vib,0.7);o.hx=c.x-o.x;o.hy=c.y-o.y}}
    // l'araignée qui marche sur sa toile la fait frémir
    const w=o.owner;if(w&&!w.dead&&(w.v||0)>1&&Math.hypot(w.x-o.x,w.y-o.y)<o.r){o.vib=Math.max(o.vib,0.25);o.hx=w.x-o.x;o.hy=w.y-o.y}}
  // sable et litière (moins souvent)
  physT-=dt;if(physT>0)return;physT=0.1;
  for(const c of creatures){if(c.dead||c.fly||(c.v||0)<2)continue;const i=clamp(Math.floor(c.x/CS),0,COLS-1),sy=surfY(i);if(Math.abs(c.y-sy)>CS*1.5)continue;
    if(T[K(i,Math.min(ROWS-1,SURF[i]))]===3&&Math.random()<0.25+c.v*0.01){const n=1+(Math.random()*2|0);for(let q=0;q<n;q++){if(GRAINS.length>160)GRAINS.shift();GRAINS.push({x:c.x+rnd(-1,1),y:sy-0.5,z:c.z||0,vx:-Math.cos(c.ang)*rnd(4,14)+rnd(-4,4),vy:-rnd(6,16),t:0})}}
    for(const it of items)if(it.type==='litiere'&&!it.carried&&Math.abs(it.x-c.x)<2.2&&Math.abs((it.z||0)-(c.z||0))<4){it.x+=Math.cos(c.ang)*0.25;it.x=clamp(it.x,it.i*CS-1,it.i*CS+CS+1);it.rot=(it.rot||0)+rnd(-0.1,0.1)}}}
let GRAINS=[];
function grainsTick(dt){for(const g of GRAINS){g.t+=dt;g.vy+=60*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;const i=clamp(Math.floor(g.x/CS),0,COLS-1);if(g.t>0.08&&g.y>=surfY(i))g.dead=true;if(g.t>1.5)g.dead=true}
  if(GRAINS.length)GRAINS=GRAINS.filter(g=>!g.dead)}
{const up=update;update=function(dt){up(dt);physiqueTick(dt);grainsTick(dt)}}
{const gw=genWorld;genWorld=function(...a){GRAINS=[];return gw(...a)}}
{const di=drawItems;drawItems=function(){di();if(!GRAINS.length)return;ctx.save();ctx.fillStyle=hsl(42,55,62);for(const g of GRAINS){ctx.save();zT(g.z);ctx.globalAlpha=1-g.t/1.5;ctx.fillRect(g.x-0.3,g.y-0.3,0.6,0.6);ctx.restore()}ctx.restore()}}

// ---------- les tiges ploient : prise en compte dans le dessin des plantes ----------
{const tx=tigeXY;tigeXY=function(p,x,yb,H,sway,t){const r=tx(p,x,yb,H,sway,t);r[0]+=(p.bx||0)*t*t;return r}}
{const ao=autreOrga;autreOrga=function(p){const b=p.bx||0;if(!b){ao(p);return}const x=p.col*CS+CS/2,yb=Y0+(p.base+1)*CS;
  // flexion d'ensemble : on incline le dessin depuis le pied
  ctx.save();ctx.translate(x,yb);ctx.transform(1,0,-b/Math.max(4,p.h*CS),1,0,0);ctx.translate(-x,-yb);ao(p);ctx.restore()}}
// les bêtes posées sur une tige suivent sa forme (ondulation + flexion)
function decalTige(c){if(VEG==='actuel')return 0;const p=plantePortee(c);if(!p)return 0;const x=p.col*CS+CS/2,yb=Y0+(p.base+1)*CS,H=(p.h-1)*CS;if(H<=0)return 0;
  const t=clamp((yb-c.y)/H,0,1),k=p.kind||'fleur';
  if(k==='fleur')return tigeXY(p,x,yb,H,Math.sin(simT*1.3+p.col)*3,t)[0]-x;
  return (p.bx||0)*t}
{const dp=drawProfile;drawProfile=function(c,alpha,gray){const dx=gray?0:decalTige(c);if(!dx){dp(c,alpha,gray);return}ctx.save();ctx.translate(dx,0);dp(c,alpha,gray);ctx.restore()}}
{const dt0=drawTiny;drawTiny=function(c){const dx=decalTige(c);if(!dx){dt0(c);return}ctx.save();ctx.translate(dx,0);dt0(c);ctx.restore()}}
if(window.__sim)window.__sim.phys=()=>({flexion:plants.map(p=>(p.bx||0).toFixed(2)).join(' '),grains:GRAINS.length,toiles:orbs.filter(o=>o.world===T).map(o=>(o.charge||0).toFixed(2)).join(' ')});

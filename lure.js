// ================= GUIDER LES BÊTES =================
// sans outil : toucher une bête la sélectionne, toucher ailleurs l'attire vers ce point.
// dès qu'elle repère ce qui l'intéresse, elle abandonne le guidage et reprend sa mission.
let selC=null;
const INTEREST={
  puceron:{r:22,txt:'une plante à sucer',f:c=>plants.find(p=>p.alive&&Math.hypot(p.col*CS-c.x,p.z-c.z)<22)},
  coccinelle:{r:30,txt:'un puceron',f:c=>creatures.find(o=>!o.dead&&o.sp.id==='puceron'&&dist3(o,c)<30)},
  fourmi:{r:26,txt:'de la nourriture',f:c=>items.find(it=>!it.carried&&!it.dead&&(it.type==='miellat'||it.type==='cadavre'||it.type==='graine')&&dist3(it,c)<26)||creatures.find(o=>!o.dead&&o.sp.id==='puceron'&&dist3(o,c)<20)},
  cloporte:{r:26,txt:'de la litière',f:c=>items.find(it=>!it.carried&&!it.dead&&(it.type==='litiere'||it.type==='cadavre')&&dist3(it,c)<26)||(c.energy>50&&shelterAt(c))},
  scolopendre:{r:26,txt:'une proie',f:c=>creatures.find(o=>!o.dead&&o!==c&&(o.sp.id==='cloporte'||o.sp.id==='fourmi'||o.sp.id==='lombric')&&dist3(o,c)<26)},
  araignee:{r:30,txt:'une plante où tisser',f:c=>plants.find(p=>p.alive&&p.h>8&&Math.hypot(p.col*CS-c.x,p.z-c.z)<30)},
  abeille:{r:34,txt:'une fleur',f:c=>plants.find(p=>p.alive&&p.fl.open&&p.fl.nectar>=1&&(()=>{const [x,y]=flowerPos(p);return Math.hypot(x-c.x,y-c.y,p.z-c.z)<34})())},
  mouche:{r:34,txt:'quelque chose à manger',f:c=>items.find(it=>!it.carried&&!it.dead&&(it.type==='cadavre'||it.type==='miellat'||it.type==='litiere')&&dist3(it,c)<34)},
};
function lureStep(c,dt){const L=c.lure,I=INTEREST[c.sp.beh||c.sp.id];
  if(I){const hit=I.f(c);if(hit){c.lure=null;c.path=null;c.state='idle';c.t=0;wave({x:c.x,y:c.y,z:c.z,max:18,sp:50,col:'#ffe94d',a:0.8});if(c===selC)say(`${FICHES[c.sp.id].ic} a repéré ${I.txt} : il reprend sa mission`);return false}}
  c.lureT-=dt;if(c.lureT<=0){c.lure=null;return false}
  if(c.fly||c.sp.id==='araignee'){const ty=Math.min(L.y,surfY(Math.floor(L.x/CS))-(c.fly?8:3));
    if(c.sp.id==='araignee')spiderMove(c,L.x,ty,dt,1.4);else flyTo(c,L.x,ty,dt,1.1);
    if(Math.hypot(c.x-L.x,c.y-ty,(c.z||0)-L.z)<5)c.lure=null;return true}
  if(gravity(c,dt))return true;
  if(!c.path||!c.path.length){const tk=findWalk(L.x,Math.min(L.y,surfY(Math.floor(L.x/CS))-1));
    if(Math.abs(cxy(tk)[0]-c.x)<3&&Math.abs((c.z||0)-L.z)<4){c.lure=null;return false}
    if(!goTo(c,k=>k===tk,20000)){c.lure=null;if(c===selC)say('Elle ne trouve pas de chemin jusque-là');return false}}
  stepPath(c,dt,1.1);return true}
// position à l'écran d'une bête selon la vue
function scrOf(c){if(view==='ens'){const R=ensRect(ensE),z=R.w/WW;return [R.x+c.x*z+R.dx*(c.z||0)/ZD,R.y+c.y*z+R.dy*(c.z||0)/ZD]}
  if(view==='top'){const p=prox.get(c);if(!p)return null;return [(p.x-zx0)*ZM,TYB+(p.y+zz0)*ZM]}
  return w2s(c.x,c.y)}
// point visé à l'écran → position monde (x, y, z)
function scrToWorld(sx,sy,c){if(view==='ens'){const pk=pickVolume(sx,sy);if(!pk)return null;return {x:pk.x,y:surfY(Math.floor(pk.x/CS))-1,z:pk.dz}}
  if(view==='top'){const x=zx0+sx/ZM,tz=(TYB-sy)/ZM+zz0;return {x,y:surfY(Math.floor(x/CS))-1,z:clamp(tz,0,ZD-10)}}
  const [x,y]=s2w(sx,sy);return {x,y,z:c?c.z||0:0}}
function pickCreature(sx,sy){let b=null,bd=26;for(const c of creatures){if(c.dead)continue;const p=scrOf(c);if(!p)continue;const d=Math.hypot(p[0]-sx,p[1]-sy);if(d<bd){bd=d;b=c}}return b}
function handFree(sx,sy){
  const c=pickCreature(sx,sy);
  if(c&&c===selC){selC=null;say('Bête relâchée');return}
  if(c){selC=c;const I=INTEREST[c.sp.beh||c.sp.id];say(I?`${FICHES[c.sp.id].ic} ${FICHES[c.sp.id].nom} sélectionné(e) : touche un endroit pour l'y guider (il/elle cherche ${I.txt})`:`${FICHES[c.sp.id].ic} ${FICHES[c.sp.id].nom} ne se laisse pas guider`);return}
  if(!selC||selC.dead){selC=null;say('Touche une bête pour la sélectionner');return}
  if(!INTEREST[selC.sp.beh||selC.sp.id]){say('Celle-ci ne se laisse pas guider');return}
  const w=scrToWorld(sx,sy,selC);if(!w)return;selC.lure=w;selC.lureT=25;selC.path=null;rings.push({x:w.x,y:w.y,z:w.z,r:6,t:0,col:'#ffe94d'})}
// marqueurs : bête sélectionnée et point d'appât
function drawSel(){if(selC&&selC.dead)selC=null;if(!selC)return;const c=selC,a=0.6+0.4*Math.sin(simT*6);
  ctx.save();zT(c.z);ctx.strokeStyle=`rgba(255,233,77,${a})`;ctx.lineWidth=1.2/camZ;ctx.beginPath();ctx.arc(c.x,c.y-1,(REAL[c.sp.id]?REAL[c.sp.id][0]*0.7:6)+3,0,TAU);ctx.stroke();ctx.restore();
  if(c.lure){const L=c.lure;ctx.save();zT(L.z);ctx.strokeStyle='#ffe94d';ctx.lineWidth=1/camZ;ctx.setLineDash([2/camZ,2/camZ]);ctx.beginPath();ctx.arc(L.x,L.y,3+Math.sin(simT*5),0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore()}}
function drawSelTop(g){if(!selC||selC.dead)return;const p=prox.get(selC);if(!p)return;g.strokeStyle='rgba(255,233,77,0.9)';g.lineWidth=0.5;g.beginPath();g.arc(p.x,p.y,(REAL[selC.sp.id]?REAL[selC.sp.id][0]*0.7:6)+2,0,TAU);g.stroke();
  if(selC.lure){const L=selC.lure;g.setLineDash([1.5,1.5]);g.beginPath();g.arc(L.x,-tZ(L.z),3,0,TAU);g.stroke();g.setLineDash([])}}

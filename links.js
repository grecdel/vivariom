// ================= LIENS DE SYNERGIE / RÉGULATION =================
const LINKS={
  mutu:{col:'#5dff7a',nom:'Mutualisme (élevage)'},
  preda:{col:'#ff4d5a',nom:'Prédation'},
  polli:{col:'#ffd84d',nom:'Pollinisation'},
  herbi:{col:'#ff9a3a',nom:'Herbivorie'},
  recy:{col:'#c08a50',nom:'Recyclage'},
  eau:{col:'#4ab0ff',nom:'Eau'},
  abri:{col:'#b48cff',nom:'Abri'},
};
let showLinks=false;
function link(type,x0,y0,x1,y1,w=1){
  const L=LINKS[type];const mx=(x0+x1)/2,my=Math.min(y0,y1)-Math.max(6,Math.abs(x1-x0)*0.25);
  ctx.strokeStyle=L.col;ctx.globalAlpha=0.85;ctx.lineWidth=1.4*w/camZ;ctx.setLineDash([5/camZ,4/camZ]);ctx.lineDashOffset=-simT*24/camZ;
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=L.col;ctx.beginPath();ctx.arc(x1,y1,2/camZ+0.6,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x0,y0,1.2/camZ+0.3,0,TAU);ctx.fill();
}
function linkO(t,a,b,w){const A=zP(a.x,a.y,a.z),B=zP(b.x,b.y,b.z);link(t,A[0],A[1],B[0],B[1],w)}
function drawLinks(){
  ctx.save();
  const cr=creatures.filter(c=>!c.dead);
  const by=id=>cr.filter(c=>c.sp.id===id);
  const aph=by('puceron'),ants=by('fourmi');
  // mutualisme : fourmis gardiennes / récolteuses <-> pucerons
  for(const a of ants){let b=null,bd=28;for(const p of aph){const d=dist(a.x,a.y,p.x,p.y);if(d<bd){bd=d;b=p}}if(b)linkO('mutu',a,b)}
  // herbivorie : pucerons -> leur plante
  for(const p of aph){const pl=plantAtK(p.k,p.z);if(pl){const x=pl.col*CS+CS/2;linkO('herbi',p,{x:x+(p.x<x?-2:2),y:p.y+6,z:pl.z},0.7)}}
  // prédation
  for(const c of cr){if(c.prey&&!c.prey.dead&&(c.sp.id==='coccinelle'||c.state==='hunt'))linkO('preda',c,c.prey,1.2)}
  for(const s of by('scolopendre')){let b=null,bd=90;for(const o of cr){if(o.sp.id!=='cloporte'&&o.sp.id!=='fourmi'&&o.sp.id!=='lombric')continue;const d=dist(s.x,s.y,o.x,o.y);if(d<bd){bd=d;b=o}}if(b)linkO('preda',s,b,1.2)}
  for(const c of cr)if(c.state==='caught'&&c.strand)linkO('preda',c.strand.owner,c,1.2);
  // pollinisation : abeilles -> fleurs ouvertes proches
  for(const b of by('abeille')){let best=null,bd=110;for(const p of plants){if(!p.fl.open)continue;const [x,y]=flowerPos(p);const d=Math.hypot(b.x-x,b.y-y,(b.z||0)-p.z);if(d<bd){bd=d;best={x,y,z:p.z}}}if(best)linkO('polli',b,best)}
  // recyclage : décomposeurs -> litière / cadavres ; litière -> sol
  for(const c of cr){if((c.sp.id==='cloporte'||c.sp.id==='mouche')&&c.goal&&!c.goal.dead)linkO('recy',c,c.goal);
    if(c.sp.id==='lombric'&&c.tg&&c.tg.it&&!c.tg.it.dead)linkO('recy',c,c.tg.it)}
  ctx.strokeStyle=LINKS.recy.col;ctx.globalAlpha=0.5;ctx.lineWidth=1/camZ;ctx.setLineDash([2/camZ,3/camZ]);ctx.lineDashOffset=-simT*10/camZ;
  for(const it of items){if(it.type!=='litiere'&&it.type!=='cadavre')continue;ctx.beginPath();ctx.moveTo(it.x,it.y);ctx.lineTo(it.x,it.y+10);ctx.stroke()}ctx.setLineDash([]);
  // eau : buses actives et mares -> sol ; mares -> plantes proches
  for(const cl of clouds){link('eau',cl.x,Y0+6,cl.x,surfY(Math.floor(cl.x/CS))-1,1.2)}
  for(const d of decos){const x=d.i*CS+CS/2,y=surfY(d.i);
    if(d.type==='mare'){for(const p of plants){const px=p.col*CS+CS/2;if(Math.abs(px-x)<60)linkO('eau',{x,y,z:shZ(d)},{x:px,y:surfY(p.col)+2,z:p.z},0.8)}}
    // abri : bêtes à l'abri
    if(d.type==='pierre'||d.type==='pot'||d.type==='tronc'){for(const c of cr){if((c.sp.id==='cloporte'||c.sp.id==='scolopendre')&&shelterAt(c)===d)linkO('abri',c,{x,y:y-4,z:shZ(d)},0.8)}}}
  // plantes -> sol humide (racines qui boivent) quand le sol est humide
  for(const p of plants){if(p.wet>0.25){const x=p.col*CS+CS/2,y=Y0+(p.base+1)*CS;ctx.strokeStyle=LINKS.eau.col;ctx.globalAlpha=0.35;ctx.lineWidth=1/camZ;ctx.beginPath();ctx.moveTo(x,y+30);ctx.lineTo(x,y);ctx.stroke()}}
  ctx.restore();ctx.globalAlpha=1;
}
function linksLegend(){const el=document.getElementById('legend');if(!showLinks){el.style.display='none';return}
  el.innerHTML=Object.values(LINKS).map(l=>`<span><i style="background:${l.col}"></i>${l.nom}</span>`).join('');el.style.display='flex'}
document.getElementById('zlink').onclick=e=>{showLinks=!showLinks;e.currentTarget.classList.toggle('on',showLinks);linksLegend()};

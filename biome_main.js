// ================= BOUCLE =================
let showerT=60,simT=0,lvl=LEVELS[0],lvlIdx=0,stock={},goalT=0,state='menu',soilDirty=true,soilT=0,extinctMsg='';
function update(dt){
  simT+=dt;dayClock+=dt;devTick(dt);
  pop={};for(const c of creatures)if(!c.dead)pop[c.sp.id]=(pop[c.sp.id]||0)+1;
  for(const p of plants)p.aph=0;
  for(const c of creatures)if(!c.dead&&c.sp.id==='puceron'){const p=plantAtK(c.k);if(p)p.aph++}
  foodMap=new Map();for(const it of items)if(!it.carried&&(it.type==='miellat'||(it.type==='graine'&&it.age>8)||(it.type==='cadavre'&&it.val<=1))&&it.k!=null)foodMap.set(it.k,it);
  for(const p of plants)if(p.alive)updPlant(p,dt);
  plants=plants.filter(p=>p.alive);
  for(const col of colonies)updColony(col,dt);
  for(const c of creatures){
    if(c.dead)continue;c.age+=dt;
    c.energy-=c.sp.decay*dt*metabF()*((c.sp.id==='cloporte'||c.sp.id==='scolopendre')&&shelterAt(c)?0.5:1);
    if(c.energy<=0||c.age>c.sp.age*(0.85+((c.phase*7)%0.3))){die(c);continue}
    CURC=c;if(c.state==='caught')updCaught(c,dt);else if(!(c.lure&&lureStep(c,dt)))UPD[c.sp.beh||c.sp.id](c,dt);CURC=null;
    if(c.dead)continue;postZ(c,dt);
    moveBody(c,dt);webCheck(c);
    c.phase+=dt*c.sp.hz*(c.state==='hunt'||c.state==='caught'?1.9:1);c.beatT+=dt;
    if(c.phase>=1){c.phase-=1;c.beatT=0;c.beats++}
  }
  if(newborns.length){creatures.push(...newborns);newborns=[]}
  creatures=creatures.filter(c=>!c.dead);
  updItems(dt);
  for(const st of strands){st.life-=dt*(st.owner.dead?4:1);st.glow=Math.max(0,st.glow-dt);st.vib=Math.max(0,st.vib-dt);if(!st.a.p.alive||!st.b.p.alive||st.a.r>st.a.p.h||st.b.r>st.b.p.h)st.life=0;
    if(st.owner.beatT===0)st.glow=1}
  strands=strands.filter(s=>s.life>0);
  for(const w of waves)w.r+=w.sp*dt;waves=waves.filter(w=>w.r<w.max);
  for(const q of phero){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.95;q.vy*=0.95}
  if(phero.length&&phero[0].life<=0)phero=phero.filter(q=>q.life>0);
  // pluie
  for(const cl of clouds){cl.t-=dt;if(DEV.pump.level<=0){cl.t=0;continue}DEV.pump.level=Math.max(0,DEV.pump.level-dt*0.55*DEV.pump.flow);for(let n=0;n<Math.ceil(dt*90*DEV.pump.flow);n++)drops.push({x:cl.x+rnd(-2,2),y:Y0+7,vx:rnd(-55,55),vy:rnd(10,45)})}
  clouds=clouds.filter(c=>c.t>0);
  for(const d of drops){d.vx*=Math.pow(0.4,dt);d.vy+=(38-d.vy)*dt*1.5;d.x+=d.vx*dt+Math.sin(simT*3+d.y*0.05)*4*dt;d.y+=d.vy*dt;d.x=clamp(d.x,1,WW-1);const i=clamp(Math.floor(d.x/CS),0,COLS-1);if(d.y>=surfY(i)){d.dead=true;const k=K(i,SURF[i]);if(SURF[i]<ROWS&&T[k]){WET[k]=Math.min(1,WET[k]+0.03);if(i>0)WET[k-1]=Math.min(1,WET[k-1]+0.012);if(i<COLS-1)WET[k+1]=Math.min(1,WET[k+1]+0.012)}soilDirty=true;if(view!=='side'&&Math.random()<0.3)ripples.push({x:d.x,y:-ZD*Math.random(),t:0})}}
  for(const r of ripples)r.t+=dt*0.8;if(ripples.length)ripples=ripples.filter(r=>r.t<1);
  if(drops.length)drops=drops.filter(d=>!d.dead);
  hydroT+=dt;if(hydroT>0.5){hydro(hydroT);hydroT=0}
  if(lvl.showers!==false&&DEV.mist.auto){showerT-=dt;if(showerT<=0){showerT=DEV.mist.every;if(DEV.pump.level>0){for(const x of nozzles())rainAt(x,DEV.mist.dur);say('Programmateur : le brumisateur se déclenche')}else say('Réservoir vide : le brumisateur ne peut plus brumiser')}}
  if(state==='play'&&!lvl.sandbox)checkGoal(dt);
  if(state==='play'){achTick(dt);migrateTick(dt)}
}
function counts(){const n={plante:plants.length};for(const c of creatures)if(!c.dead){const id=c.sp.id==='reine'?'fourmi':c.sp.id==='chenille'?'papillon':c.sp.id==='verblanc'?'rhinoceros':c.sp.id==='verfarine'?'tenebrion':c.sp.id;n[id]=(n[id]||0)+1}return n}
function checkGoal(dt){
  const n=counts(),g=lvl.goal;
  for(const id of g.alive){if(!(n[id]>0)&&!((stock[id]||0)>0)&&everSeen[id]){lose(`Extinction : ${FICHES[id].nom} a disparu et il n'en reste plus en réserve.`);return}if(n[id]>0)everSeen[id]=true}
  let ok=g.alive.every(id=>n[id]>0);
  if(ok&&g.min)for(const id in g.min)if((n[id]||0)<g.min[id])ok=false;
  if(ok){goalT+=dt;if(goalT>=g.t)win()}else goalT=Math.max(0,goalT-dt*2);
  const missing=g.alive.filter(id=>!(n[id]>0));if(missing.length&&g.alive.every(id=>everSeen[id]))lvlMissed=true;extinctMsg=missing.length?missing.map(id=>FICHES[id].ic).join(' '):'';
}
let everSeen={},lvlMissed=false,stock0=0;

// ================= RENDU =================
const soilCv=document.createElement('canvas'),sctx=soilCv.getContext('2d');
function renderSoil(){
  const SPX=4;soilCv.width=COLS*SPX;soilCv.height=ROWS*SPX;sctx.setTransform(SPX/CS,0,0,SPX/CS,0,0);sctx.clearRect(0,0,WW,WH);
  const g=CS*0.12;
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){const k=j*COLS+i,t=T[k],x=i*CS,y=j*CS;
    if(!t){if(DUG[k]){sctx.fillStyle='#030303';sctx.fillRect(x,y,CS,CS);
        const e2=CS*0.22;sctx.fillStyle='rgba(255,190,120,0.4)';if(sol(i,j+1))sctx.fillRect(x,y+CS-e2,CS,e2);if(sol(i-1,j))sctx.fillRect(x,y,e2,CS);if(sol(i+1,j))sctx.fillRect(x+CS-e2,y,e2,CS);if(sol(i,j-1))sctx.fillRect(x,y,CS,e2)}
      continue}
    const ty=TYPES[t],w=WET[k],n=NUT[k];
    const hue=ty.h+(205-ty.h)*w*0.1,l=ty.l*(1-w*0.38)+(t<=2?n*9:0);
    sctx.fillStyle=hsl(hue,ty.s*(1-w*0.2),l);sctx.fillRect(x,y,CS-g,CS-g);
    // grain numérique
    const r=((i*73856093)^(j*19349663))>>>0;
    if(t===6){sctx.fillStyle=hsl(hue+((r>>4)&15),ty.s+6,l+((r>>2)&3)*7-6);sctx.beginPath();sctx.arc(x+CS*0.5,y+CS*0.5,CS*(0.32+((r>>8)&3)*0.05),0,TAU);sctx.fill()}
    else if((r&3)===0){sctx.fillStyle=hsl(hue,ty.s,l+10+(t===3?8:0));sctx.fillRect(x+CS*0.3,y+CS*0.3,CS*0.3,CS*0.3)}
    if(w>0.82&&(r&1)){sctx.fillStyle='rgba(90,170,255,0.7)';sctx.fillRect(x+CS*0.5,y+CS*0.2,CS*0.3,CS*0.3)}
    if(j===SURF[i]){sctx.fillStyle=t===1?hsl(95,60,30+n*25):hsl(ty.h,ty.s,ty.l+22);sctx.fillRect(x,y,CS,CS*0.35)}
  }
}
// autres végétaux : fougère, graminée, trèfle, ronce
function drawPlantKind(p){const i=p.col,x=i*CS+CS/2,yb=Y0+(p.base+1)*CS,H=p.h*CS,vig=clamp(p.e/3,0.25,1),dry=p.wet<0.15,sw=Math.sin(simT*1.3+i)*2,k=p.kind;
  const hue=dry?45:k==='fougere'?120:k==='gramin'?75:k==='trefle'?110:105;
  if(!(OXY[0]||OXY[1])||p.z<12){ctx.strokeStyle=hsl(35,40,45);ctx.lineWidth=0.5;ctx.globalAlpha=0.45;ctx.beginPath();for(let r=-2;r<=2;r++){ctx.moveTo(x,yb);ctx.quadraticCurveTo(x+r*5,yb+10,x+r*7,yb+18+Math.abs(r)*6)}ctx.stroke();ctx.globalAlpha=1}
  const line=hsl(hue+8,65,36+vig*22),fill=hsl(hue,55,13+vig*10,0.85);ctx.lineWidth=0.6;
  if(k==='fougere'){const n=5;for(let f=0;f<n;f++){const a=-Math.PI/2+(f-(n-1)/2)*0.38,L=H*(0.7+0.3*((f*7+p.id)%3)/2),tx=clamp(x+Math.cos(a)*L*0.55+sw*(f%2?1:-1),8,WW-8),ty=yb-Math.abs(Math.sin(a))*L*0.75,cx=x+Math.cos(a)*L*0.15,cy=yb-L*0.6;
      ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(x,yb);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
      for(let q=1;q<11;q++){const t=q/11,u=1-t,px=u*u*x+2*u*t*cx+t*t*tx,py=u*u*yb+2*u*t*cy+t*t*ty,dx=2*u*(cx-x)+2*t*(tx-cx),dy=2*u*(cy-yb)+2*t*(ty-cy),l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,s=(1-t)*4+1;
        ctx.fillStyle=fill;ctx.strokeStyle=line;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+nx*s*sd+dx/l*s*0.4,py+ny*s*sd+dy/l*s*0.4);ctx.lineTo(px+dx/l*s*0.5,py+dy/l*s*0.5);ctx.closePath();ctx.fill();ctx.stroke()}}}}
  else if(k==='gramin'){const n=7;for(let f=0;f<n;f++){const L=H*(0.55+0.45*((f*5+p.id)%4)/3),dir=(f-(n-1)/2)*0.16,tx=x+dir*L*0.6+sw*(1+f*0.2),ty=yb-L;
      ctx.strokeStyle=line;ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(x+(f-3)*0.4,yb);ctx.quadraticCurveTo(x+dir*L*0.1,yb-L*0.6,tx,ty);ctx.stroke();
      if(f%2===0&&p.h>=p.maxH*0.8){ctx.fillStyle=hsl(45,60,55);for(let q=0;q<5;q++){ctx.beginPath();ctx.ellipse(tx-dir*q*1.2,ty+q*1.6,0.7,1.4,dir,0,TAU);ctx.fill()}}}}
  else if(k==='trefle'){for(let f=0;f<5;f++){const bx=x+(f-2)*3.2,L=H*(0.6+0.4*((f*3+p.id)%3)/2),tx=bx+sw*0.4,ty=yb-L;
      ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(bx,yb);ctx.lineTo(tx,ty);ctx.stroke();
      ctx.fillStyle=fill;for(let q=0;q<3;q++){const a=-Math.PI/2+(q-1)*1.2;ctx.beginPath();ctx.arc(tx+Math.cos(a)*1.6,ty+Math.sin(a)*1.6,1.5,0,TAU);ctx.fill();ctx.stroke()}
      if(f===2&&p.h>=p.maxH&&p.fl.open){ctx.fillStyle=hsl(320,60,80);ctx.beginPath();ctx.arc(tx,ty-3.5,1.8,0,TAU);ctx.fill()}}}
  else if(k==='cactus')drawCactusSide(p,x,yb,H,vig,sw);
  else if(k==='ronce'){for(let f=0;f<3;f++){const dir=f-1,L=H,tx=clamp(x+dir*L*0.45+sw,8,WW-8),ty=yb-L*(f===1?1:0.65),cx=x+dir*L*0.1,cy=yb-L*1.05;
      ctx.strokeStyle=hsl(340,35,32);ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x,yb);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();ctx.lineWidth=0.6;
      for(let q=1;q<7;q++){const t=q/7,u=1-t,px=u*u*x+2*u*t*cx+t*t*tx,py=u*u*yb+2*u*t*cy+t*t*ty;
        ctx.strokeStyle=hsl(340,30,45);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+1.2,py-1);ctx.stroke();
        if(q%2){ctx.fillStyle=fill;ctx.strokeStyle=line;ctx.beginPath();ctx.ellipse(px+(q%4?3:-3),py-1,3.2,2,q%4?0.5:-0.5,0,TAU);ctx.fill();ctx.stroke()}
        else if(p.h>=p.maxH&&p.fl.open){ctx.fillStyle=hsl(280,60,22);for(const [ox,oy] of [[0,0],[1,0.8],[-0.8,0.9],[0.2,1.6]]){ctx.beginPath();ctx.arc(px+ox,py+2+oy,0.8,0,TAU);ctx.fill()}}}}}
}
function drawPlant(p){if(p.kind&&p.kind!=='fleur'){drawPlantKind(p);return}
  const i=p.col,x=i*CS+CS/2,yb=Y0+(p.base+1)*CS,yt=Y0+(p.base-p.h+1)*CS;
  const vig=clamp(p.e/3,0.25,1),dry=p.wet<0.15,hue=dry?45:p.hue;
  // racines
  if(!(OXY[0]||OXY[1])||p.z<12){ctx.strokeStyle=hsl(35,40,45);ctx.lineWidth=0.5;ctx.globalAlpha=0.45;ctx.beginPath();
  for(let r=-2;r<=2;r++){ctx.moveTo(x,yb);ctx.quadraticCurveTo(x+r*6,yb+12,x+r*9,yb+26+Math.abs(r)*8)}ctx.stroke()}
  // tige
  ctx.globalAlpha=1;const sway=Math.sin(simT*1.3+i)*3;
  ctx.strokeStyle=hsl(hue,60,30+vig*25);ctx.lineWidth=2.5;ctx.globalAlpha=0.25;ctx.beginPath();ctx.moveTo(x,yb);ctx.quadraticCurveTo(x,yt+(yb-yt)/2,x+sway,yt);ctx.stroke();
  ctx.globalAlpha=0.95;ctx.lineWidth=0.9;ctx.stroke();
  // feuilles
  for(let r=6;r<p.h;r+=7){const y=yb-r*CS,sd=(Math.floor(r/7)%2?1:-1),L=7+vig*6+(1-r/p.h)*5;const sx=x+sway*(r/p.h);
    ctx.fillStyle=hsl(hue,55,14+vig*10,0.8);ctx.strokeStyle=hsl(hue+10,70,40+vig*20);ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(sx+sd*L*0.5,y-L*0.35);ctx.lineTo(sx+sd*L,y-L*0.1);ctx.lineTo(sx+sd*L*0.45,y+L*0.18);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(sx+sd*L*0.9,y-L*0.12);ctx.globalAlpha=0.5;ctx.stroke();ctx.globalAlpha=0.95}
  // nœuds
  ctx.fillStyle=hsl(hue,70,55);for(let r=0;r<p.h;r+=7)ctx.fillRect(x-0.6+sway*(r/p.h),yb-r*CS-CS*0.5-0.6,1.2,1.2);
  // fleur
  if(p.h>=p.maxH){const fx=x+sway,fy=yt-2,f=p.fl;
    if(f.open){const R=5,glow=f.nectar/3;ctx.globalCompositeOperation='lighter';const spr=glowSprite(330);ctx.globalAlpha=0.25+glow*0.4;ctx.drawImage(spr,fx-R*2.2,fy-R*2.2,R*4.4,R*4.4);ctx.globalCompositeOperation='source-over';
      ctx.strokeStyle=hsl(f.poll?50:330,90,70);ctx.fillStyle=hsl(330,70,18,0.8);ctx.lineWidth=0.6;ctx.globalAlpha=1;
      ctx.beginPath();for(let q=0;q<5;q++){const a=q/5*TAU+simT*0.2,a2=a+TAU/10;ctx.lineTo(fx+Math.cos(a)*R,fy+Math.sin(a)*R);ctx.lineTo(fx+Math.cos(a2)*R*0.45,fy+Math.sin(a2)*R*0.45)}ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=hsl(50,100,60+glow*20);ctx.fillRect(fx-1,fy-1,2,2)}
    else{ctx.strokeStyle=hsl(hue,60,50);ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(fx,fy,2,0,TAU);ctx.stroke()}}
  ctx.globalAlpha=1;
}
function drawItems(){
  for(const it of items.slice().sort((a,b)=>(b.z||0)-(a.z||0))){if(it.carried)continue;ctx.save();zT(it.z);
    if(it.type==='graine'){ctx.strokeStyle='#ffd27a';ctx.fillStyle='#3a2a08';ctx.lineWidth=0.4;ctx.beginPath();ctx.ellipse(it.x,it.y,1.4,0.9,0.4,0,TAU);ctx.fill();ctx.stroke()}
    else if(it.type==='litiere'){const a=Math.min(1,(120-it.age)/20);ctx.globalAlpha=a;ctx.strokeStyle=hsl(28,70,48);ctx.fillStyle=hsl(25,60,12);ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(it.x-4,it.y);ctx.lineTo(it.x,it.y-2);ctx.lineTo(it.x+4,it.y);ctx.lineTo(it.x,it.y+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=1}
    else if(it.type==='miellat'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.8;ctx.fillStyle='#ffb43a';ctx.beginPath();ctx.arc(it.x,it.y,0.8,0,TAU);ctx.fill();ctx.globalAlpha=0.25;ctx.beginPath();ctx.arc(it.x,it.y,2.2,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
    else if(it.type==='oeuf'){drawEgg(it)}
    else if(it.type==='cadavre'&&it.c){drawProfile(it.c,Math.max(0.15,0.6-it.age/80),true)}
  ctx.restore()}
}
function drawColonies(){
  for(const col of colonies){if(col.dead)continue;
    ctx.fillStyle='#f4efe0';for(const e of col.eggs){const [x,y]=cxy(e.k);ctx.globalAlpha=0.9;ctx.beginPath();ctx.ellipse(x,y+0.4,0.9,0.6,0,0,TAU);ctx.fill()}
    const ch=[...col.chamber];ctx.fillStyle='#ffb43a';ctx.globalAlpha=0.85;for(let q=0;q<Math.min(Math.floor(col.food),24);q++){const k=ch[q%Math.max(1,ch.length)];if(k==null)break;const [x,y]=cxy(k);ctx.fillRect(x-CS/2+0.3+(q>>2)%3*0.8,y+CS/2-0.9-((q>>4)*0.8),0.6,1.3)}
    ctx.globalAlpha=1;
  }
}
function drawStrands(){
  for(const s of strands){const gl=s.glow,vb=s.vib;const a=Math.min(1,s.life/8)*(0.35+0.5*gl+0.3*Math.min(1,vb));
    ctx.globalAlpha=a;ctx.strokeStyle=vb>0?'#ffd0b8':s.owner.cLine;ctx.lineWidth=(0.7+gl*0.5)/camZ;ctx.beginPath();
    if(vb>0){const n=8,dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;const A=zP(s.a.x,s.a.y,s.a.z),B=zP(s.b.x,s.b.y,s.b.z);ctx.moveTo(A[0],A[1]);for(let k=1;k<=n;k++){const f=k/n,o=k<n?Math.sin(simT*45+k*2)*Math.min(1,vb)*2:0;ctx.lineTo(A[0]+(B[0]-A[0])*f+nx*o,A[1]+(B[1]-A[1])*f+ny*o)}}
    else{const A=zP(s.a.x,s.a.y,s.a.z),B=zP(s.b.x,s.b.y,s.b.z);ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1])}ctx.stroke()}
  ctx.globalAlpha=1;
}
function draw(){
  ctx=mainCtx;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  let saveCam=null;if(view==='ens'){saveCam=[camZ,camX,camY];const C=ensCam(ensRect(ensE));camZ=C.z;camX=C.x;camY=C.y}
  ctx.setTransform(DPR*camZ,0,0,DPR*camZ,DPR*(W/2-camX*camZ),DPR*(H/2-camY*camZ));
  // ciel : grille discrète
  ctx.strokeStyle='#0d0d14';ctx.lineWidth=1/camZ;ctx.beginPath();for(let y=Y0;y<Y0+ROWS*CS;y+=10){ctx.moveTo(0,y);ctx.lineTo(WW,y)}ctx.stroke();
  if(soilDirty&&simT-soilT>0.9||soilT===0){renderSoil();soilDirty=false;soilT=simT||0.001}
  if(view==='ens'){drawEnsBack();}
  ctx.imageSmoothingEnabled=false;ctx.drawImage(soilCv,0,Y0,WW,WH);ctx.imageSmoothingEnabled=true;
  // pluie
  // circuit de brumisation
  if(view!=='ens'){ctx.strokeStyle='#3a4a5a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,Y0+2);ctx.lineTo(WW,Y0+2);ctx.stroke();ctx.strokeStyle='#7a9ab5';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(0,Y0+1.2);ctx.lineTo(WW,Y0+1.2);ctx.stroke();
  for(const x of nozzles()){const on=clouds.some(c=>c.x===x);ctx.fillStyle=on?'#bfe6ff':'#5a7a95';ctx.beginPath();ctx.moveTo(x-3,Y0+2);ctx.lineTo(x+3,Y0+2);ctx.lineTo(x+1.5,Y0+6);ctx.lineTo(x-1.5,Y0+6);ctx.closePath();ctx.fill();
    if(on){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.35;const spr=glowSprite(200);ctx.drawImage(spr,x-22,Y0-6,44,44);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}}}
  ctx.fillStyle='rgba(190,225,255,0.55)';ctx.beginPath();for(const d of drops)ctx.rect(d.x-0.5,d.y-0.5,1,1);ctx.fill();
  drawColonies();drawShadows();drawDecos();drawPort();
  // du fond vers la vitre : plantes, objets au sol, bêtes
  const back=(a,b)=>(b.z||0)-(a.z||0);
  for(const p of plants.slice().sort(back)){ctx.save();zT(p.z);drawPlant(p);ctx.restore()}
  drawStrands();drawItems();
  ctx.save();const ws=waves;waves=[];for(const w of ws){waves=[w];ctx.save();zT(w.z);drawWaves();ctx.restore()}waves=ws;ctx.restore();
  const order={lombric:0,cloporte:1,fourmi:2,reine:3,scolopendre:4,puceron:5,coccinelle:6,araignee:7,abeille:8,mouche:9};
  for(const c of creatures.slice().sort((a,b)=>back(a,b)||order[a.sp.id]-order[b.sp.id])){if(drawChrysalis(c))continue;ctx.save();zT(c.z);if(realLen(c)*camZ<4.5)drawTiny(c);else drawProfile(c,1,false);if(c.load){const F=c.sp.sf,h=c.segs[0];ctx.fillStyle=c.load.type==='grain'?(c.load.t===1?'#8a6a3a':'#d8b060'):'#ffb43a';ctx.fillRect(h.x*F+Math.cos(h.a)*5-1.5,h.y*F+Math.sin(h.a)*5-1.5,3,3)}ctx.restore()}
  if(showLinks)drawLinks();
  drawSel();
  for(const r of rings){const a=1-r.t/0.6;ctx.save();zT(r.z);ctx.globalAlpha=a;ctx.strokeStyle=r.col;ctx.lineWidth=1/camZ;ctx.beginPath();ctx.arc(r.x,r.y,r.r*(0.6+0.4*r.t/0.6),0,TAU);ctx.stroke();ctx.restore()}
  ctx.globalAlpha=1;
  drawFrameSide();
  if(saveCam){[camZ,camX,camY]=saveCam;drawEnsFront()}
}

// ================= INTERFACE =================
const fmt=s=>{s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const hudEl=document.getElementById('hud');
let flashMsg='',flashT=0;function say(t,force){if(!OPT.tips&&!force)return;flashMsg=t;flashT=2.2}
function hud(){
  if(state==='menu'){hudEl.innerHTML='';return}
  if(lvl.sandbox){const n=counts();for(const k in stock)stock[k]=99;let h=`<div class="row"><b>🏠 ${lvl.nom}</b><span class="dim">bac à sable</span></div><div class="row">`;for(const id in n)if(n[id]>0&&FICHES[id])h+=`<span>${FICHES[id].ic}${n[id]}</span>`;h+='</div>';hudEl.innerHTML=h+`<div class="row">${flashT>0?`<span style="color:#ffe94d">${flashMsg}</span>`:'<span class="dim">Réserves illimitées · touche un outil pour le reprendre, retouche-le pour le lâcher</span>'}</div>`;return}
  const n=counts(),g=lvl.goal;
  const pct=Math.min(1,goalT/g.t);
  let h=`<div class="row"><b>Niv. ${lvlIdx+1} · ${lvl.nom}</b><span class="bar"><i style="width:${pct*100}%"></i></span><span>${fmt(goalT)} / ${fmt(g.t)}</span></div><div class="row">`;
  for(const id of lvl.sp){const v=n[id]||0,need=g.min&&g.min[id];const bad=!v||(need&&v<need);
    h+=`<span class="${bad?'ko':''}">${FICHES[id].ic}${v}${need?`<span class="dim">/${need}</span>`:''}</span>`}
  h+='</div>';
  let m;
  if(flashT>0)m=`<span style="color:#ffe94d">${flashMsg}</span>`;
  else if(extinctMsg)m=`<span class="ko">Il manque : ${extinctMsg} — le chrono recule</span>`;
  else if(g.min&&Object.keys(g.min).some(id=>(n[id]||0)<g.min[id]))m=`<span style="color:#ffb43a">Objectif : ${Object.entries(g.min).map(([id,v])=>`${v} ${FICHES[id].ic}`).join(', ')} minimum</span>`;
  else m='<span class="ok">● Cohabitation réussie — le chrono avance</span>';
  hudEl.innerHTML=h+`<div class="row">${m}</div>`;
}
let tool='pluie',speed=1,paused=true;
const pal=document.getElementById('pal');
const TOOLS0={loupe:{ic:'🔍',nom:'Loupe'},pluie:{ic:'💨',nom:'Brume'},compost:{ic:'🍂',nom:'Litière'},plante:{ic:'🌱',nom:'Planter'}};
const TOOLS=Object.assign({},TOOLS0,{'sol:humus':{ic:'🟫',nom:'Humus'},'sol:terre':{ic:'🟤',nom:'Terre'},'sol:sable':{ic:'🟨',nom:'Sable'},'sol:argile':{ic:'🧱',nom:'Argile'},'sol:gravier':{ic:'⚪',nom:'Gravier'},'sol:creuser':{ic:'⛏',nom:'Retirer'}},...Object.entries(DECOS).map(([k,v])=>({[k]:{ic:v.ic,nom:{mare:'Mare',liege:'Liège',volcan:'Volcan',coquille:'Coquille',champi:'Champis'}[k]||v.nom.split(' ')[0]}})));
// ----- inventaire : main libre + 3 outils récents + trois tiroirs (bêtes, jardin, décor) -----
const CATS={betes:{ic:'🐜',nom:'Bêtes'},jardin:{ic:'🌱',nom:'Jardin'},decor:{ic:'🪨',nom:'Décor'}};
let recent=[],drawer=null;
function catItems(c){if(c==='betes'){const b=lvl.sp.filter(id=>id!=='plante');return lvl.sandbox?allBeasts(b):b}
  if(c==='jardin'){const a=['pluie'];if(lvl.stock.compost||lvl.sandbox)a.push('compost');if(lvl.sp.includes('plante')){if(lvl.kinds&&!lvl.sandbox){for(const k of lvl.kinds)a.push(k==='fleur'?'plante':'plante:'+k)}else a.push('plante')}if(lvl.sandbox)for(const k in PLANTS)if(k!=='fleur')a.push('plante:'+k);if(lvl.sandbox)a.push('sol:humus','sol:terre','sol:sable','sol:argile','sol:gravier','sol:creuser');return a}
  return Object.keys(DECOS).filter(k=>has(k))}
const allItems=()=>[...catItems('betes'),...catItems('jardin'),...catItems('decor')];
function nameOf(id){const t=TOOLS[id];if(VSP[id])return SHORT[id]||VSP[id].vnom.split(' ')[0];if(String(id).startsWith('plante:'))return PLANTS[kindOf(id)].nom.split(' ')[0];return SPI[id]?FICHES[id].nom.split(' ')[0]:t?t.nom:id}
function chipHTML(id){const isSp=!!(SPI[id]||VSP[id]),ic=String(id).startsWith('plante:')?PLANTS[kindOf(id)].ic:TOOLS[id]&&TOOLS[id].ic;return `<button class="chip ${VSP[id]?'var':''}" data-id="${id}">${isSp?'<canvas></canvas>':`<span class="big">${ic}</span>`}<span class="nm">${nameOf(id)}</span><span class="st"></span></button>`}
function wireChips(root){root.querySelectorAll('.chip[data-id]').forEach(b=>{const id=b.dataset.id;const cv2=b.querySelector('canvas');if(cv2)previewSp(spOf(id),cv2);b.onclick=()=>pickTool(id,!!b.closest('#drawer'))})}
function pickTool(id,fromDrawer){
  if(tool===id&&fromDrawer){closeDrawer();renderBar();return}
  if(tool===id){tool=null;closeDrawer();renderBar();say('Main libre : touche une bête pour la sélectionner, puis un endroit pour la guider');return}
  tool=id;selC=null;recent=[id,...recent.filter(r=>r!==id)].slice(0,3);closeDrawer();renderBar();
  say(id==='sol:creuser'?'Retirer : touche le sol pour enlever une couche':baseOf(id)==='sol'?`${nameOf(id)} : touche le sol pour ajouter une couche — ${{humus:'très riche, garde l\'eau',terre:'riche et solide',sable:'pauvre, sèche vite, facile à creuser',argile:'garde l\'eau, très dure à creuser',gravier:'laisse filer l\'eau, rien n\'y pousse'}[id.split(':')[1]]}`:id==='pluie'?'Brume : touche près d\'une buse pour brumiser':baseOf(id)==='plante'?`${PLANTS[kindOf(id)].ic} ${PLANTS[kindOf(id)].nom} : touche le sol — ${PLANTS[kindOf(id)].txt}`:VSP[id]?`${VSP[id].vnom} (${VSP[id].vla}) : ${VSP[id].vtrait||''}`:`${nameOf(id)} : touche le vivarium pour poser`)}
function renderBar(){
  let h=`<button class="chip hand ${tool?'':'on'}" data-hand><span class="big">✋</span><span class="nm">Main</span></button>`;
  for(const id of recent)h+=chipHTML(id);
  for(let i=recent.length;i<3;i++)h+=`<span class="chip ghostc"></span>`;
  h+='<span class="sep"></span>';
  for(const [c,C] of Object.entries(CATS)){const n=catItems(c).length;if(!n)continue;h+=`<button class="cat ${drawer===c?'open':''}" data-cat="${c}"><span class="big">${C.ic}</span><span class="nm">${C.nom} ${drawer===c?'▾':'▴'}</span><span class="cnt">${n}</span></button>`}
  pal.innerHTML=h;wireChips(pal);
  pal.querySelector('[data-hand]').onclick=()=>{tool=null;closeDrawer();renderBar();say('Main libre : touche une bête pour la sélectionner, puis un endroit pour la guider')};
  pal.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{drawer===b.dataset.cat?closeDrawer():openDrawer(b.dataset.cat);renderBar()});
  refreshPalette()}
function openDrawer(c){drawer=c;const d=document.getElementById('drawer');
  d.innerHTML=`<div class="dhead"><b>${CATS[c].ic} ${CATS[c].nom}</b><span class="dim">touche pour prendre · retouche pour lâcher</span><button class="dx">✕</button></div><div class="dgrid">${catItems(c).map(chipHTML).join('')}</div>`;
  d.style.display='block';wireChips(d);d.querySelector('.dx').onclick=()=>{closeDrawer();renderBar()};refreshPalette()}
function closeDrawer(){drawer=null;const d=document.getElementById('drawer');if(d)d.style.display='none'}
function buildPalette(){const items=allItems();recent=recent.filter(id=>items.includes(id));if(tool&&items.includes(tool)&&!recent.includes(tool))recent.unshift(tool);
  if(!recent.length)recent=[catItems('betes')[0],'pluie'].filter(Boolean);recent=recent.slice(0,3);closeDrawer();renderBar()}
function refreshPalette(){document.querySelectorAll('#pal .chip[data-id],#drawer .chip[data-id]').forEach(b=>{const id=b.dataset.id;b.classList.toggle('on',id===tool);const s=b.querySelector('.st');
  const v=lvl.sandbox?'∞':id==='pluie'?(lvl.stock.pluie!=null?stock.pluie:'∞'):stock[id];s.textContent=v==null?'':(v==='∞'?'∞':'×'+v);b.classList.toggle('empty',v===0)});
  const hd=pal.querySelector('[data-hand]');if(hd)hd.classList.toggle('on',!tool)}
function previewSp(sp,cvs){
  const w=cvs.clientWidth||52,h=cvs.clientHeight||34,d=2;cvs.width=w*d;cvs.height=h*d;
  const pc=cvs.getContext('2d');const c=mk(sp,0,0,{ang:-Math.PI/2+0.0001});c.beatT=0.05;
  for(const l of c.legs){const r=restPos(c,l);l.hx=r[0];l.hy=r[1];l.fx=r[2];l.fy=r[3]}
  let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;const pts=[...c.segs.map(g=>[g.x,g.y]),...c.legs.map(l=>[l.fx,l.fy])];
  if(sp.w){const th=c.segs[1]||c.segs[0];pts.push([th.x+sp.w.len,th.y],[th.x-sp.w.len,th.y])}
  for(const [x,y] of pts){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}
  const pad=Math.min(10,h*0.12),s=Math.min(3,(w-pad*2)/((maxx-minx)||1),(h-pad*2)/((maxy-miny)||1));
  pc.setTransform(d*s,0,0,d*s,d*(w/2-(minx+maxx)/2*s),d*(h/2-(miny+maxy)/2*s));
  const keep=ctx;ctx=pc;drawCreature(c,1,false,true);ctx=keep;
}
function drawPlantIcon(cvs){const w=cvs.clientWidth||120,h=cvs.clientHeight||80,d=2;cvs.width=w*d;cvs.height=h*d;const pc=cvs.getContext('2d');pc.setTransform(d,0,0,d,0,0);
  const keep=ctx;ctx=pc;const sY=Y0,sCS=CS;Y0=0;CS=Math.max(4,h/14);const p={col:0,base:11,h:9,maxH:9,e:3,fl:{open:true,nectar:2,poll:false},hue:120,wet:0.5};
  ctx.translate(w/2-CS/2,0);drawPlant(p);ctx=keep;Y0=sY;CS=sCS}
// --- fiches ---
const fichesEl=document.getElementById('fiches');
function openFiches(){paused=true;fichesEl.style.display='block';
  const ids=state==='menu'?[...new Set(LEVELS.flatMap(L=>L.sp))]:lvl.sp;
  document.getElementById('fgrid').innerHTML=ids.map(id=>{const f=FICHES[id];return `<div class="card"><canvas data-id="${id}"></canvas><b>${f.ic} ${f.nom}</b><span class="badge">${f.role}</span>
    <p><u>Mange</u> ${f.mange}</p><p><u>Mangé par</u> ${f.par}</p><p><u>Aide</u> ${f.aide}</p><p><u>Besoins</u> ${f.besoin}</p><p><u>Comportement</u> ${f.comp}</p>${f.com?`<p><u>Communication</u> ${f.com}</p>`:''}${VARS[id]?`<p><u>Variantes</u> ${VARS[id].map(V=>`<b>${V.nom}</b> <i>(${V.la})</i> — ${V.trait||''}`).join(' · ')}</p>`:''}${id==='plante'?`<p><u>Autres végétaux</u> ${Object.values(PLANTS).map(P=>`${P.ic} <b>${P.nom}</b> — ${P.txt}`).join(' · ')}</p>`:''}</div>`}).join('');
  document.querySelectorAll('#fgrid canvas').forEach(cv2=>{const id=cv2.dataset.id;if(id==='plante')drawPlantIcon(cv2);else previewSp(SPI[id==='fourmi'?'reine':id],cv2)});
}
document.getElementById('ffermer').onclick=()=>{fichesEl.style.display='none';if(fichesFromBrief){fichesFromBrief=false;document.getElementById('brief').style.display='flex';return}paused=state!=='play';last=performance.now()};
document.getElementById('bfiche').onclick=openFiches;
// --- niveaux ---
let unlocked=1;try{unlocked=Math.max(1,+localStorage.getItem('biome_unlocked')||1)}catch(e){}
const menuEl=document.getElementById('menu'),endEl=document.getElementById('end');
function showMenu(){state='menu';paused=true;menuEl.style.display='flex';endEl.style.display='none';
  document.getElementById('levels').innerHTML=LEVELS.map((L,i)=>`<button class="lv ${i<unlocked?'':'lock'}" data-i="${i}"><b>${i+1}</b><span>${L.nom}</span><small>${L.sp.map(id=>FICHES[id].ic).join('')}</small>${i<unlocked-1?'<em>✓</em>':''}</button>`).join('');
  document.querySelectorAll('.lv').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(i<unlocked)startLevel(i)});
}
function startLevel(i){
  speed=OPT.speed;document.getElementById('spd').firstChild.textContent='×'+speed;hideAll();curViv=null;selC=null;pendingView=null;topFromEns=false;$('blv').innerHTML='🗺 Niveaux<small>campagne</small>';$('brestart').innerHTML='↺ Rejouer<small>niveau</small>';
  view='side';anim=null;prox.clear();ripples=[];document.getElementById('bback').style.display='none';
  lvlIdx=i;lvl=LEVELS[i];stock=Object.assign({},lvl.stock);lvlMissed=false;stock0=Object.values(lvl.stock).reduce((a,b)=>a+b,0);JOURNAL=[];prevCounts={};for(const k in DECOS)if(stock[k]==null)stock[k]=has(k)?3:0;goalT=0;everSeen={};
  creatures=[];items=[];plants=[];colonies=[];strands=[];waves=[];phero=[];drops=[];clouds=[];newborns=[];
  genWorld();camFit();ensE=0;ensDir=0;openDev(null);resetDev();applyLocks();dayClock=0;
  const n=lvl.start.plante||0;for(let q=0;q<n;q++){const i2=Math.round((q+0.5)/n*COLS+rnd(-4,4));const p=newPlant(i2,true,null,lvl.kinds?lvl.kinds[q%lvl.kinds.length]:'fleur');if(p){p.h=Math.max(1,Math.min(Math.floor(rnd(12,p.maxH)),p.base-4));for(let r=1;r<p.h;r++)STEM[K(p.col,p.base-r)]++;p.age=rnd(0,80)}}
  for(const id of lvl.goal.alive)if(id==='plante')everSeen.plante=n>0;
  tool=lvl.sp.find(id=>id!=='plante')||'plante';syncViewSw();view='side';
  buildPalette();menuEl.style.display='none';endEl.style.display='none';
  const nouv=i>0?REWARDS[i-1]:null,_=0,mat=REWARDS.slice(0,i).filter(r=>r.key!=='trophee').map(r=>r.ic).join(' ');
  document.getElementById('lvltxt').innerHTML=`<h1>Niveau ${i+1} — ${lvl.nom}</h1><p>${lvl.txt}</p>${nouv&&!nouv.key.startsWith('trophee')?`<p class="newit">✨ Nouveau : ${nouv.ic} <b>${nouv.nom}</b> — ${nouv.txt}</p>`:''}${mat?`<p class="dim">Matériel disponible : 💡 ${mat}</p>`:'<p class="dim">Matériel disponible : 💡 spot et 💨 brumisation à la main.</p>'}<p class="dim">Garde ${lvl.goal.alive.map(id=>FICHES[id].ic+' '+FICHES[id].nom).join(', ')} vivants ensemble pendant <b>${fmt(lvl.goal.t)}</b>${lvl.goal.min?` (minimum : ${Object.entries(lvl.goal.min).map(([id,v])=>v+' '+FICHES[id].nom).join(', ')})`:''}. Les réserves sont limitées : si une espèce disparaît sans réserve, c'est perdu.</p>`;
  document.getElementById('brief').style.display='flex';state='brief';paused=true;
}
document.getElementById('bgo').onclick=()=>{initAudio();document.getElementById('brief').style.display='none';state='play';paused=false;last=performance.now()};
let fichesFromBrief=false;document.getElementById('bfiche2').onclick=()=>{document.getElementById('brief').style.display='none';fichesFromBrief=true;openFiches()};
function win(){state='end';paused=true;if(lvlIdx+2>unlocked){unlocked=Math.min(LEVELS.length,lvlIdx+2);try{localStorage.setItem('biome_unlocked',String(unlocked))}catch(e){}}
  endEl.style.display='flex';document.getElementById('endtxt').innerHTML=`<h1 class="ok">Niveau réussi !</h1><p>${lvl.nom} : toutes les espèces ont cohabité pendant ${fmt(lvl.goal.t)}.</p>`;
  document.getElementById('bnext').style.display=lvlIdx<LEVELS.length-1?'block':'none'}
function lose(msg){state='end';paused=true;endEl.style.display='flex';document.getElementById('endtxt').innerHTML=`<h1 class="ko">Écosystème rompu</h1><p>${msg}</p>`;document.getElementById('bnext').style.display='none'}
document.getElementById('bretry').onclick=()=>startLevel(lvlIdx);
document.getElementById('bnext').onclick=()=>startLevel(lvlIdx+1);
document.getElementById('bmenu').onclick=showMenu;
document.getElementById('blv').onclick=showMenu;
document.getElementById('spd').onclick=e=>{speed=speed===1?3:speed===3?6:1;e.currentTarget.firstChild.textContent='×'+speed};
document.getElementById('snd').onclick=e=>{soundOn=!soundOn;initAudio();e.currentTarget.firstChild.textContent=soundOn?'🔊':'🔇'};
document.getElementById('brestart').onclick=()=>startLevel(lvlIdx);
// --- toucher ---
function tapAction(x,y){const Z0=PLACE_DZ>=0?PLACE_DZ:rnd(5,ZD*0.75),base=baseOf(tool),vsp=spOf(tool);
  if(baseOf(tool)==='sol'){const kd=tool.split(':')[1],n=soilBrush(kd,x),ii=clamp(Math.floor(x/CS),0,COLS-1);
    if(n){rings.push({x:ii*CS+CS/2,y:surfY(ii),r:10,t:0,col:kd==='creuser'?'#f96':'#dcb'})}else say(kd==='creuser'?'Rien à retirer ici':'Impossible : trop haut, ou trop près d\'une fourmilière');return}
  if(tool==='pluie'){if(lvl.stock.pluie!=null){if(stock.pluie<=0){say('Plus de brumisation en réserve');return}stock.pluie--}rainAt(x,3);refreshPalette();return}
  if(DECOS[tool]){if(!(stock[tool]>0)){say('Plus de cet élément de décor');return}const ii=clamp(Math.floor(x/CS),1,COLS-2);if(placeDeco(tool,ii)){stock[tool]--;refreshPalette();rings.push({x:ii*CS+CS/2,y:surfY(ii),r:12,t:0,col:'#cfa'});say(DECOS[tool].nom+' : '+DECOS[tool].txt)}return}
  if(!(stock[tool]>0)){say('Réserve épuisée pour cette espèce');return}
  const i=clamp(Math.floor(x/CS),1,COLS-2);
  if(tool==='compost'){for(let q=0;q<4;q++)groundItem('litiere',i+Math.round(rnd(-5,5)),{val:2,z:Z0+rnd(-10,10)});stock.compost--;refreshPalette();rings.push({x,y:surfY(i),r:10,t:0,col:'#d08040'});return}
  if(base==='plante'){const near=plants.find(p=>p.alive&&Math.hypot((p.col-i)*CS,p.z-Z0)<15);if(near){say('Trop près d\'une autre plante (1,5 cm minimum)');rings.push({x,y:surfY(i),r:8,t:0,col:'#f66'});return}const p=newPlant(i,true,Z0,kindOf(tool));if(!p){say('Impossible de planter ici');return}p.e=2.5;stock.plante--;refreshPalette();rings.push({x:i*CS+CS/2,y:surfY(i),r:8,t:0,col:'#8f8'});say('Pousse plantée — garde le sol humide');return}
  let c;
  if(base==='fourmi'){
    const near=colonies.find(col=>!col.dead&&(col.wsp||SPI.fourmi)===vsp&&Math.abs(col.i-i)<60);
    if(near){const [ex,ey]=cxy(near.entr);c=mk(vsp,ex,ey,{energy:45});c.col=near;c.k=findWalk(ex,ey)}
    else{const col=newColony(i);col.wsp=vsp===SPI.fourmi?null:vsp;const [ex,ey]=cxy(col.entr);c=mk(vsp.vid?VSP['reine:'+vsp.vid.split(':')[1]]:'reine',ex,ey);c.col=col;c.state='found';c.k=col.entr;
      const plan=[];let j=SURF[col.i];for(let d=0;d<26&&j+d<ROWS-3;d++){const k=K(col.i,j+d);if(T[k]===5)break;plan.push(k)}
      const bj=(plan.length?(plan[plan.length-1]/COLS|0):j);c.chamberStart=plan.length;
      for(const dj of [0,-1,-2])for(const di of [-1,1,-2,2,-3,3,-4,4,-5,5]){const ii=col.i+di,jj=bj+dj;if(ii>0&&ii<COLS-1&&jj>SURF[ii]+6&&T[K(ii,jj)]&&T[K(ii,jj)]!==5)plan.push(K(ii,jj))}
      plan.push(null);c.plan=plan;c.t=0;col.chamber.add(plan[Math.max(0,c.chamberStart-1)]);say('Une reine fonde sa colonie')}
  }else if(base==='lombric'){const sy=surfY(i);c=mk(vsp,x,Math.max(y,sy+CS*3))}
  else{c=mk(vsp,x,y);const web=base==='araignee'&&!vsp.beh;if(vsp.w||web){c.fly=!web;c.y=clamp(y,Y0+12,surfY(i)-15);if(web)c.home=x}else{c.k=findWalk(x,Math.min(y,surfY(i)-2));const [cx2,cy2]=cxy(c.k);c.x=cx2;c.y=cy2}}
  if(c.sp.id!=='reine'&&c.sp.id!=='lombric'&&!(c.sp.id==='fourmi'&&c.col)&&c.y<surfY(i)+1){c.z=c.tz=Z0}
  creatures.push(c);stock[tool]--;refreshPalette();rings.push({x:c.x,y:c.y,z:c.z,r:10,t:0,col:c.cLine});
}
function resize(){DPR=Math.min(OPT.hq?2:1,window.devicePixelRatio||1);LAND=window.innerHeight<520&&window.innerWidth>window.innerHeight;const lf=!!OPT.left;CVL=LAND?(lf?60:178):0;CVR=LAND?(lf?178:60):0;BOT=LAND?6:128;BAND_T=LAND?48:92;document.body.classList.toggle('land',LAND);
  W=window.innerWidth-CVL-CVR;H=window.innerHeight;cv.style.left=CVL+'px';cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';soilDirty=true;if(COLS)camFit()}
window.addEventListener('resize',()=>{resize();if(view==='top'){TYB=H-BOT;TY0=BAND_T;topClamp()}});
resize();genWorld();
let last=performance.now(),hudT=0,pendingView=null;
function frame(now){
  const real=Math.min(0.1,(now-last)/1000);last=now;
  if(!paused){let sim=real*speed;while(sim>0){const d=Math.min(1/30,sim);update(d);sim-=d}
    for(const r of rings)r.t+=real;rings=rings.filter(r=>r.t<0.6);flashT-=real;
    for(const k in bucket)bucket[k]=Math.min(2,bucket[k]+6*real);gBucket=Math.min(10,gBucket+30*real)}
  if(view==='anim'){anim.t+=real/1.3;const t=Math.min(1,anim.t),e=t*t*(3-2*t);renderTransition(anim.dir>0?e:1-e);if(anim.t>=1){view=anim.dir>0?'top':(anim.back||'side');if(view==='ens'){ensE=1;ensDir=0}anim=null;if(view==='side'&&pendingView==='ens'){pendingView=null;enterEns()}}}
  else if(view==='top'){if(!paused)updProxies(Math.min(real*speed,0.1));drawTop(mainCtx)}
  else{if(ensDir){ensE=clamp(ensE+ensDir*real/0.6,0,1);if(ensE<=0&&ensDir<0){ensDir=0;view='side';camFit();if(pendingView==='top'){pendingView=null;enterTop(WW/2);say('Vue du dessus : glisse le doigt pour te déplacer')}}if(ensE>=1&&ensDir>0)ensDir=0}draw()}
  hudT-=real;if(hudT<=0){hud();hudT=0.25}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__sim={DBG,dbgk(id){return creatures.filter(c=>!c.dead&&c.sp.id===id).map(c=>{const k=c.k;return [k,k!=null?walkK(k):"-",Math.floor(c.x/CS),SURF[Math.floor(c.x/CS)],(c.y-Y0)/CS|0,c.t.toFixed(1)].join(",")}).join(" ; ")},dbgc(id){return creatures.filter(c=>!c.dead&&c.sp.id===id).map(c=>[Math.round(c.x),Math.round(c.y),Math.round(c.energy),c.state,!!onPlant(c),c.path?c.path.length:-1].join(",")).join(" ; ")+" eggs:"+items.filter(i=>i.type==="oeuf").length},win(){win()},pal(){return [...document.querySelectorAll("#pal .chip")].map(b=>b.dataset.id).join(",")},get dev(){return JSON.stringify({n:DEV.neon.on,a:DEV.mist.auto})},get sel(){return selC?{id:selC.sp.id,x:Math.round(selC.x),z:Math.round(selC.z),lure:selC.lure}:null},scr(id){const c=creatures.find(o=>!o.dead&&o.sp.id===id);return c?scrOf(c):null},moss(v){for(const d of decos)d.moss=v},bench(n=30){let t=performance.now();for(let i=0;i<n;i++)draw();const d=(performance.now()-t)/n;t=performance.now();for(let i=0;i<n;i++)update(1/60);return [d.toFixed(2),((performance.now()-t)/n).toFixed(2)]},crs(){return creatures.filter(c=>!c.dead).map(c=>c.sp.id+":"+Math.round(c.x)+","+Math.round(c.y)+","+Math.round(c.z)+(c.fly?"F":"")).join(" ")},itemsDbg(){return items.filter(it=>it.type==='graine').map(it=>{const s=w2s(it.x,it.y);return Math.round(s[0])+','+Math.round(s[1])}).join(' ')},enterTop,exitTop,get view(){return view},seedInfo(){return items.filter(it=>it.type==='graine').map(it=>{const k=K(it.i,SURF[it.i]);return [it.i,Math.round(it.age),T[k],NUT[k].toFixed(2),WET[k].toFixed(2)].join(':')}).join(' ')},soilAvg(){let n=0,w=0,c=0;for(let i=0;i<COLS;i++){const k=K(i,SURF[i]);if(SURF[i]<ROWS&&T[k]){n+=NUT[k];w+=WET[k];c++}}return (n/c).toFixed(2)+'/'+(w/c).toFixed(2)},dbgPath(){const a=creatures.find(c=>c.sp.id==='fourmi');if(!a)return 'none';const k=a.k;const i=k%COLS,j=(k-i)/COLS;const toSurf=bfs(k,kk=>{const ii=kk%COLS,jj=(kk-ii)/COLS;return jj<SURF[ii]-0&&!DUG[kk]},8000);const toStem=bfs(k,kk=>STEM[kk]>0,8000);const m=items.filter(it=>it.type==='miellat').slice(0,3).map(it=>[it.k%COLS,(it.k/COLS|0),walkK(it.k),STEM[it.k]]);return JSON.stringify({i,j,walk:walkK(k),T:T[k],DUG:DUG[k],surf:SURF[i],toSurf:toSurf&&toSurf.length,toStem:toStem&&toStem.length,m,ROWS,COLS})},run(sec){for(let t=0;t<sec;t+=1/30)update(1/30)},startLevel,get creatures(){return creatures},get plants(){return plants},get colonies(){return colonies},counts,get goalT(){return goalT},get state(){return state},
  tap(tool_,x,y){tool=tool_;tapAction(x,y)},enterEns,exitEns,openDev,get camZ(){return camZ},get ensE(){return ensE},get DEV(){return DEV},go(){document.getElementById('bgo').click()}};

// ----- sélecteur de vue : Coupe / 3/4 / Dessus -----
const vsw=document.getElementById('viewsw');let vswLast='';
function curView(){return view==='top'||view==='anim'&&anim&&anim.dir>0?'top':view==='ens'?'ens':'side'}
function syncViewSw(){const v=curView();if(v===vswLast)return;vswLast=v;vsw.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v))}
function bareSide(){if(view==='top'||view==='anim'){anim=null;view='side'}if(view==='ens'){view='side';ensE=0;ensDir=0}document.getElementById('bback').style.display='none';camFit()}
vsw.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(state!=='play')return;initAudio();const v=b.dataset.v,cur=curView();if(v===cur||view==='anim')return;
  if(v==='side'){if(cur==='top'){topFromEns=false;exitTop()}else exitEns()}
  if(v==='ens'){if(cur==='top'){if(topFromEns)exitTop();else{pendingView='ens';exitTop()}}else enterEns()}
  if(v==='top'){if(cur==='ens')enterTopFromEns(WW/2);else enterTop(camX);say('Vue du dessus : glisse le doigt pour te déplacer')}
  syncViewSw()});
setInterval(syncViewSw,200);

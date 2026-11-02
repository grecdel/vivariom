// ================= VUE DE DESSUS (LOUPE) =================
let anim0={z:1,x:0,y:0},view='side',anim=null,ZM=4,zx0=0,zz0=0,zCol=0,TY0=96,TYB=0,TD=300;
const sideSnap=document.createElement('canvas'),topSnap=document.createElement('canvas');
const prox=new Map();let ripples=[];
// caméra du dessus : même échelle en largeur et en profondeur (mm), comme le vrai bac
function topFit(){return Math.min(W/(WW+24),(TYB-TY0)/(ZD+24))}
function topClamp(){const band=TYB-TY0;ZM=clamp(ZM,topFit(),8);const vw=W/ZM,vd=band/ZM;
  zx0=vw>=WW?-(vw-WW)/2:clamp(zx0,-6,WW-vw+6);zz0=vd>=ZD?-(vd-ZD)/2:clamp(zz0,-6,ZD-vd+6);zCol=clamp(Math.floor((zx0+vw/2)/CS),0,COLS-1)}
function zoneSetup(tapX,fit){
  TYB=H-BOT;TY0=BAND_T;TD=ZD;
  if(fit){ZM=topFit();zx0=0;zz0=0}else{ZM=4;zx0=tapX-W/(2*ZM);zz0=0}
  topClamp();if(!fit)zCol=clamp(Math.floor(tapX/CS),0,COLS-1);
}
function topZoom(sx,sy,f){const wx=zx0+sx/ZM,wz=(TYB-sy)/ZM+zz0;ZM=clamp(ZM*f,topFit(),8);zx0=wx-sx/ZM;zz0=wz-(TYB-sy)/ZM;topClamp()}
const hz=(n)=>{n=Math.sin(n*127.1)*43758.5453;return n-Math.floor(n)};
// profondeur réelle (mm) → profondeur de la loupe
const tZ=z=>clamp(z||0,1,ZD-1);
function zOfPlant(p){return tZ(p.z)}
function zOfItem(it){return tZ(it.z)}
function zOfCol(col){return 4}
function topVisible(c){
  if(c.dead||c.sp.id==='lombric')return false;
  if(c.fly||c.sp.id==='araignee')return true;
  const i=clamp(Math.floor(c.x/CS),0,COLS-1);return c.y<=surfY(i)+CS*0.6;
}
// où se trouve la bête dans la profondeur du terrarium
function topTarget(c){
  if(c.seed==null)c.seed=Math.random()*TAU;
  const p=c.k!=null&&!c.fly?plantAtK(c.k,c.z):null;let ox=0,oz=0;
  if(p){const L=(6+p.h*0.3)*0.55;ox=Math.cos(c.seed)*L;oz=Math.sin(c.seed)*L}
  return [c.x+ox,tZ(c.z)+oz];
}
function updProxies(dt){
  for(const [c,p] of prox)if(c.dead||!topVisible(c))prox.delete(c);
  for(const c of creatures){
    if(!topVisible(c))continue;
    const [tx,tz]=topTarget(c);
    let p=prox.get(c);
    if(!p){p=mk(c.sp,tx,-tz,{ang:rnd(0,TAU)});p.mute=true;p.hue=c.hue;colors(p);prox.set(c,p);
      for(const l of p.legs){const r=restPos(p,l);l.fx=r[2];l.fy=r[3]}}
    // position identique à la vraie bête : seule l'orientation est déduite du déplacement
    const dx=tx-p.x,dy=-tz-p.y,d=Math.hypot(dx,dy);
    if(d>0.05){p.ang+=clamp(angDiff(p.ang,Math.atan2(dy,dx)),-9*dt,9*dt);p.v=d/Math.max(dt,1e-3)}else{p.v*=0.5;if(c.state==='sip'||c.state==='caught')p.ang+=Math.sin(c.age*20)*0.05}
    p.x=tx;p.y=-tz;
    p.fly=c.fly;p.beatT=c.beatT;p.beats=c.beats;p.energy=c.energy;p.state=c.state;p.load=c.load;p.age=c.age;p.flap=c.flap;p.phase=c.phase;
    moveBody(p,dt);
  }
}
const gTop=document.createElement('canvas');let gTopT=-9;
function drawGroundTop(g){
  const rows=Math.ceil(ZD/CS);
  if(simT-gTopT>1||gTop.width!==COLS||gTop.height!==rows){gTopT=simT;gTop.width=COLS;gTop.height=rows;const q=gTop.getContext('2d'),im=q.createImageData(COLS,rows),D=im.data;
    for(let i=0;i<COLS;i++){const j=SURF[i];const k=K(i,Math.min(ROWS-1,j));const t=j<ROWS?T[k]:5,w=WET[k],n=NUT[k],ty=TYPES[t||1];
      for(let r=0;r<rows;r++){const v=hz(i*31.7+r*7.3),hue=ty.h+(205-ty.h)*w*0.1,l=ty.l*(1-w*0.38)+(t<=2?n*9:0)+(v-0.5)*5;
        let [R,G,B]=hslRGB(hue,ty.s,l);if(t===1&&v<n*0.35){R*=0.85;G=G*1.12+12;B*=0.8}if(w>0.8&&v<(w-0.8)*4){R=R*0.6+30;G=G*0.6+60;B=B*0.6+110}
        const o=((rows-1-r)*COLS+i)*4;D[o]=R;D[o+1]=G;D[o+2]=B;D[o+3]=255}}q.putImageData(im,0,0)}
  g.imageSmoothingEnabled=false;g.drawImage(gTop,0,-rows*CS,COLS*CS,rows*CS);g.imageSmoothingEnabled=true;
}
function hslRGB(h,s,l){s/=100;l=clamp(l,0,100)/100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return [f(0)*255,f(8)*255,f(4)*255]}
// le bac vu d'en haut : table autour, cadre en aluminium, vitres
function drawBoxTop(g){g.fillStyle='#1a120b';g.fillRect(-400,-ZD-400,WW+800,ZD+800);
  g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(4,-ZD+4,WW+4,ZD+4)}
function drawBoxTopFrame(g){g.strokeStyle='#5a5f66';g.lineWidth=4;g.strokeRect(-2,-ZD-2,WW+4,ZD+4);g.strokeStyle='rgba(200,225,255,0.35)';g.lineWidth=0.8;g.strokeRect(0.4,-ZD+0.4,WW-0.8,ZD-0.8);
  g.fillStyle='#8a9098';for(const [x,y] of [[-2,-ZD-2],[WW+2,-ZD-2],[-2,2],[WW+2,2]]){g.fillRect(x-3,y-3,6,6)}
  g.fillStyle='rgba(200,225,255,0.5)';g.font='5px sans-serif';g.textAlign='center';g.fillText('vitre avant',WW/2,8);g.textAlign='left'}
function drawPlantTop(g,p){
  const k=p.kind||'fleur';if(k==='cactus'){drawCactusTop(g,p);return}if(k==='gramin'||k==='fougere'||k==='trefle'){const x=p.col*CS+CS/2,y=-zOfPlant(p),n=k==='trefle'?6:9,L=k==='trefle'?5:6+p.h*0.25,hue=k==='fougere'?120:k==='gramin'?75:110;
    g.lineWidth=k==='gramin'?0.5:0.4;g.strokeStyle=hsl(hue,65,45);g.fillStyle=hsl(hue,55,20,0.85);
    for(let q=0;q<n;q++){const a=q*2.39996+p.id,ll=L*(0.6+0.4*((q*7)%5)/4),tx=x+Math.cos(a)*ll,ty=y+Math.sin(a)*ll;
      if(k==='trefle'){for(let r=0;r<3;r++){const b=a+(r-1)*1.1;g.beginPath();g.arc(tx+Math.cos(b)*1.3,ty+Math.sin(b)*1.3,1.2,0,TAU);g.fill();g.stroke()}}
      else{g.beginPath();g.moveTo(x,y);g.lineTo(tx,ty);g.stroke();if(k==='fougere')for(let r=1;r<6;r++){const px=x+(tx-x)*r/6,py=y+(ty-y)*r/6,nx=-(ty-y)/ll*1.8*(1-r/7),ny=(tx-x)/ll*1.8*(1-r/7);g.beginPath();g.moveTo(px-nx,py-ny);g.lineTo(px+nx,py+ny);g.stroke()}}}return}
  const x=p.col*CS+CS/2,y=-zOfPlant(p),n=Math.min(11,2+Math.floor(p.h/7)),L=6+p.h*0.3;
  const vig=clamp(p.e/3,0.25,1),hue=p.wet<0.15?45:p.hue,sw=Math.sin(simT*1.3+p.col)*0.05;
  g.lineWidth=0.5;
  for(let k=0;k<n;k++){const a=k*2.39996+p.id+sw,ll=L*(0.55+0.45*((k*7)%5)/4);
    const tx=x+Math.cos(a)*ll,ty=y+Math.sin(a)*ll,px=-Math.sin(a)*ll*0.22,py=Math.cos(a)*ll*0.22;
    g.fillStyle=hsl(hue,55,12+vig*9,0.85);g.strokeStyle=hsl(hue+10,70,38+vig*20);
    g.beginPath();g.moveTo(x,y);g.lineTo(x+(tx-x)*0.5+px,y+(ty-y)*0.5+py);g.lineTo(tx,ty);g.lineTo(x+(tx-x)*0.5-px,y+(ty-y)*0.5-py);g.closePath();g.fill();g.stroke();
    g.globalAlpha=0.5;g.beginPath();g.moveTo(x,y);g.lineTo(tx,ty);g.stroke();g.globalAlpha=1}
  g.fillStyle=hsl(hue,70,55);g.fillRect(x-1,y-1,2,2);
  if(p.h>=p.maxH&&p.fl.open){const R=4,f=p.fl;g.globalCompositeOperation='lighter';const spr=glowSprite(330);g.globalAlpha=0.3+f.nectar/3*0.4;g.drawImage(spr,x-R*2.5,y-R*2.5,R*5,R*5);g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.strokeStyle=hsl(f.poll?50:330,90,70);g.fillStyle=hsl(330,70,18,0.85);g.lineWidth=0.6;g.beginPath();
    for(let q=0;q<5;q++){const a=q/5*TAU+simT*0.2,a2=a+TAU/10;g.lineTo(x+Math.cos(a)*R,y+Math.sin(a)*R);g.lineTo(x+Math.cos(a2)*R*0.45,y+Math.sin(a2)*R*0.45)}g.closePath();g.fill();g.stroke();
    g.fillStyle=hsl(50,100,65);g.fillRect(x-0.8,y-0.8,1.6,1.6)}
}
function drawTop(g){
  const keep=ctx;ctx=g;
  g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#000';g.fillRect(0,0,W,H);
  g.save();g.beginPath();g.rect(0,TY0,W,TYB-TY0);g.clip();
  g.setTransform(DPR*ZM,0,0,DPR*ZM,-zx0*ZM*DPR,(TYB+zz0*ZM)*DPR);
  drawBoxTop(g);
  drawGroundTop(g);
  // entrées de fourmilière
  for(const col of colonies){if(col.dead)continue;const x=col.i*CS+CS/2,y=-zOfCol(col);
    g.fillStyle=hsl(42,50,30);g.beginPath();g.arc(x,y,5,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();
    g.strokeStyle='rgba(255,190,120,0.5)';g.lineWidth=0.4;g.stroke()}
  drawDecosTop(g);
  // objets au sol
  for(const it of items){if(it.carried)continue;const x=it.x,y=-zOfItem(it);
    if(it.type==='graine'){g.strokeStyle='#ffd27a';g.fillStyle='#3a2a08';g.lineWidth=0.4;g.beginPath();g.ellipse(x,y,1.4,0.9,hz(x)*3,0,TAU);g.fill();g.stroke()}
    else if(it.type==='litiere'){g.strokeStyle=hsl(28,70,48);g.fillStyle=hsl(25,60,12);g.lineWidth=0.4;const a=hz(x+y)*TAU;g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(-3,0);g.lineTo(0,-1.6);g.lineTo(3,0);g.lineTo(0,1.6);g.closePath();g.fill();g.stroke();g.restore()}
    else if(it.type==='miellat'){g.fillStyle='#ffb43a';g.globalAlpha=0.85;g.beginPath();g.arc(x,y,0.9,0,TAU);g.fill();g.globalAlpha=1}
    else if(it.type==='oeuf'){g.fillStyle=it.ooth?'#d9c69a':it.snail?'#f4f0e6':'#5a4a2c';g.beginPath();g.arc(x,y,it.ooth?2.6:1.2,0,TAU);g.fill()}
    else if(it.type==='cadavre'){g.fillStyle='rgba(150,150,150,0.5)';g.fillRect(x-2,y-1,4,2)}}
  // pistes de phéromones
  for(const q of phero){if(q.z==null)continue;g.globalAlpha=(q.life/q.max)*0.6;g.fillStyle=q.col;g.fillRect(q.x-0.5,-tZ(q.z)-0.5,1,1)}g.globalAlpha=1;
  for(const p of plants)drawPlantTop(g,p);
  // toiles vues du dessus
  for(const s of strands){const ax=s.a.p.col*CS+CS/2,ay=-zOfPlant(s.a.p)+(s.a.r-s.a.p.h/2)*0.6,bx=s.b.p.col*CS+CS/2,by=-zOfPlant(s.b.p)+(s.b.r-s.b.p.h/2)*0.6;
    g.globalAlpha=0.4+0.4*s.glow;g.strokeStyle=s.vib>0?'#ffd0b8':s.owner.cLine;g.lineWidth=0.35;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke()}
  g.globalAlpha=1;
  // ondes de pluie
  for(const r of ripples){g.globalAlpha=1-r.t;g.strokeStyle='rgba(140,190,255,0.8)';g.lineWidth=0.4;g.beginPath();g.arc(r.x,r.y,1+r.t*5,0,TAU);g.stroke()}g.globalAlpha=1;
  // bêtes : au sol puis volants avec leur ombre
  const ground=[],air=[];for(const [c,p] of prox)(c.fly?air:ground).push(p);
  ground.sort((a,b)=>b.sp.mass-a.sp.mass);
  const dc=(p,fn)=>{g.save();g.scale(p.sp.sf,p.sp.sf);fn();g.restore()};
  for(const p of ground)dc(p,()=>{drawCreature(p,1,false);if(p.load){const h=p.segs[0];g.fillStyle=p.load.type==='grain'?'#d8b060':'#ffb43a';g.fillRect(h.x+Math.cos(h.a)*4-1.5,h.y+Math.sin(h.a)*4-1.5,3,3)}});
  for(const p of air)dc(p,()=>{g.globalAlpha=0.35;g.fillStyle='#000';for(const s of p.segs){g.beginPath();g.ellipse(s.x+8,s.y+12,4,3,0,0,TAU);g.fill()}g.globalAlpha=1});
  for(const p of air)dc(p,()=>drawCreature(p,1,false));
  drawSelTop(g);
  drawBoxTopFrame(g);
  g.restore();
  // cadre
  g.setTransform(DPR,0,0,DPR,0,0);g.strokeStyle='#333';g.lineWidth=1;g.strokeRect(0.5,TY0+0.5,W-1,TYB-TY0-1);
  ctx=keep;
}
// ----- rotation -----
function snapSide(){draw();sideSnap.width=cv.width;sideSnap.height=cv.height;sideSnap.getContext('2d').drawImage(cv,0,0)}
function snapTop(){topSnap.width=cv.width;topSnap.height=cv.height;drawTop(topSnap.getContext('2d'))}
function enterTop(tapX){
  zoneSetup(tapX);anim0={z:camZ,x:camX,y:camY};prox.clear();for(const c of creatures){c.ztop=null}
  for(let q=0;q<40;q++)updProxies(0.05);
  snapSide();snapTop();anim={t:0,dir:1,ys:w2s(0,surfY(zCol))[1],wsurf:surfY(zCol)};view='anim';document.getElementById('bback').style.display='none';
}
function exitTop(){snapTop();if(topFromEns){exitTopToEns();return}view='side';snapSide();anim0={z:camZ,x:camX,y:camY};anim={t:0,dir:-1,ys:w2s(0,surfY(zCol))[1],wsurf:surfY(zCol)};view='anim';document.getElementById('bback').style.display='none'}
// passage direct 3/4 <-> dessus : une seule rotation, autour de la ligne du sol de la vitre avant
let topFromEns=false;
function ensSnapCam(){const R=ensRect(1),C=ensCam(R);return {C,ys:R.y+surfY(zCol)*C.z}}
function enterTopFromEns(tapX){zoneSetup(tapX,true);prox.clear();for(const c of creatures){c.ztop=null}for(let q=0;q<40;q++)updProxies(0.05);
  ensE=1;ensDir=0;view='ens';draw();sideSnap.width=cv.width;sideSnap.height=cv.height;sideSnap.getContext('2d').drawImage(cv,0,0);
  const {C,ys}=ensSnapCam();anim0={z:C.z,x:C.x,y:C.y};snapTop();topFromEns=true;anim={t:0,dir:1,ys,wsurf:surfY(zCol),back:'ens'};view='anim'}
function exitTopToEns(){view='ens';ensE=1;ensDir=0;draw();sideSnap.width=cv.width;sideSnap.height=cv.height;sideSnap.getContext('2d').drawImage(cv,0,0);
  const {C,ys}=ensSnapCam();anim0={z:C.z,x:C.x,y:C.y};topFromEns=false;anim={t:0,dir:-1,ys,wsurf:surfY(zCol),back:'ens'};view='anim'}
function renderTransition(e){
  const g=mainCtx;g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);
  const z0=anim0.z,th=e*Math.PI/2,ct=Math.cos(th),st=Math.sin(th),Zt=z0+(ZM-z0)*e,zcx=anim0.x+((zx0+W/(2*ZM))-anim0.x)*e,hy=anim.ys+(TYB+zz0*ZM-anim.ys)*e,d=900;
  const P=(wy,wz)=>{const yp=wy*ct-wz*st,zp=wy*st+wz*ct;const s=d/Math.max(60,d+zp*Zt);return [hy+yp*Zt*s,s]};
  const S=3,R=DPR;
  // plan vertical (la coupe) : il bascule vers le fond
  if(ct>0.02){g.globalAlpha=Math.min(1,ct*1.3);
    const wl=anim0.x-W/(2*z0);for(let sy=0;sy<H;sy+=S){const [y0,s0]=P((sy-anim.ys)/z0,0),[y1,s1]=P((sy+S-anim.ys)/z0,0),s=(s0+s1)/2;if(Math.abs(y1-y0)<0.05)continue;
      const X0=W/2+(wl-zcx)*Zt*s;g.drawImage(sideSnap,0,sy*R,W*R,S*R,X0*R,Math.min(y0,y1)*R,(W/z0)*Zt*s*R,(Math.abs(y1-y0)+0.6)*R)}}
  // plan horizontal (le dessus) : il se redresse face à nous
  if(st>0.02){g.globalAlpha=Math.min(1,st*1.3);
    for(let r=TYB;r>TY0;r-=S){const z0=(TYB-r)/ZM+zz0,z1=(TYB-(r-S))/ZM+zz0;const [y0,s0]=P(0,z0),[y1,s1]=P(0,z1),s=(s0+s1)/2;if(Math.abs(y1-y0)<0.05)continue;
      const X0=W/2+(zx0-zcx)*Zt*s;g.drawImage(topSnap,0,(r-S)*R,W*R,S*R,X0*R,Math.min(y0,y1)*R,(W/ZM)*Zt*s*R,(Math.abs(y1-y0)+0.6)*R)}}
  g.globalAlpha=1;
  // ligne de charnière (la surface)
  g.strokeStyle='rgba(255,233,77,'+(0.6*Math.sin(e*Math.PI))+')';g.lineWidth=R;g.beginPath();g.moveTo(0,hy*R);g.lineTo(W*R,hy*R);g.stroke();
}

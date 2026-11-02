// style de dessin des bêtes : 'actuel' (néon, articulations en points), 'fin' (sans points, pattes effilées), 'nature' (corps pleins, couleurs naturelles)
let DESSIN='actuel';
const FIN=()=>DESSIN!=='actuel',NAT=()=>DESSIN==='nature';
const natFill=c=>hsl(c.sp.h,c.sp.s*0.5,14+c.sp.l*0.22),natLine=c=>hsl(c.sp.h,c.sp.s*0.6,30+c.sp.l*0.35);
// ================= VUE DE PROFIL (coupe) =================
function ik2(hx,hy,fx,fy,L1,L2,up){let d=Math.hypot(fx-hx,fy-hy);d=clamp(d,0.01,L1+L2-0.01);
  const a=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1)),b=Math.atan2(fy-hy,fx-hx);
  const k1=[hx+Math.cos(b+a)*L1,hy+Math.sin(b+a)*L1],k2=[hx+Math.cos(b-a)*L1,hy+Math.sin(b-a)*L1];return (k1[1]<k2[1])===up?k1:k2}
function profGeom(c){
  const sp=c.sp;
  if(sp.id==='lombric')return {legH:0,bodyY:0};
  const L=sp.chain?sp.chain.L:[sp.legs[0][4],sp.legs[0][5]];
  const legH=c.fly?0:(L[0]+L[1])*(sp.chain?0.45:0.42);
  return {legH,L};
}
// bêtes très allongées (phasme, mante) sur une tige : corps vertical le long de la tige, pattes repliées contre elle
function onStem(c){if(c.fly||c.sp.chain||c.k==null)return false;const id=c.sp.id;
  if(id!=='phasme'&&id!=='mante'){let L=0,w=0;for(const d of c.dims){L+=d[0];w=Math.max(w,d[1])}if(L<w*9)return false}
  const i=Math.floor(c.x/CS);return c.y<surfY(i)-2&&!!plantAtK(c.k,c.z)}
function drawOnStem(c,alpha){
  const sp=c.sp,id=sp.id,F=sp.sf,n=c.segs.length;let hx=c.x/F,hy=c.y/F;
  const up=Math.sin(c.ang)<=0.2,sway=id==='phasme'?Math.sin(simT*1.1+c.x*0.37)*0.06:0,a=(up?-Math.PI/2:Math.PI/2)+sway,ax=Math.cos(a),ay=Math.sin(a),px=-ay,py=ax;
  let tot=0;for(let i=1;i<n;i++)tot+=spacing(c,i);
  const surf=surfY(Math.floor(c.x/CS))/F-1,low=up?hy-ay*(tot+c.dims[n-1][0]/2):hy+c.dims[0][0]/2+sp.ant*0.9;if(low>surf)hy-=low-surf; // ne s'enfonce pas dans le sol
  ctx.save();ctx.scale(F,F);
  const saved=c.segs.map(g=>({x:g.x,y:g.y,a:g.a}));let x=hx,y=hy;
  for(let i=0;i<n;i++){if(i){const s=spacing(c,i);x-=ax*s;y-=ay*s}c.segs[i].x=x;c.segs[i].y=y;c.segs[i].a=a}
  const en=clamp(c.energy/(ROLES[c.role].start),0.2,1.3),bright=0.5+0.5*Math.min(1,en);
  mainCtxGlow(c,alpha,bright);ctx.lineCap='round';ctx.lineJoin='round';
  const col=c.state==='caught'&&Math.sin(simT*30)>0?'#ffffff':c.cLine,moving=(c.v||0)>0.5,ph=c.walkPh||0;
  // pattes : cuisse qui s'écarte un peu de la tige, tibia rabattu contre elle
  const legs=sp.legs.slice().sort((p,q)=>(q[1]>0)-(p[1]>0));let fr=Infinity;for(const l of sp.legs)fr=Math.min(fr,l[0]);
  const drawLeg=(l,far)=>{const [seg,side,off,p,L1,L2]=l,g=c.segs[seg],s=side>0?1:-1,fwd=off/90,len=c.dims[seg][0];
    const hx0=g.x+ax*fwd*len*0.35,hy0=g.y+ay*fwd*len*0.35;let dirA=fwd>0.2?1:-1;
    const rap=id==='mante'&&seg===fr&&fwd>0.2,grip=moving?Math.sin(ph+p*Math.PI+(s>0?0:Math.PI))*0.8:0;
    let kx,ky,fx,fy;
    if(rap){kx=hx0+ax*L1*0.75+px*s*2.2;ky=hy0+ay*L1*0.75+py*s*2.2;fx=kx-ax*L2*0.7+px*s*0.6;fy=ky-ay*L2*0.7+py*s*0.6}
    else{const sp1=1.3+(far?0:0.3);kx=hx0+ax*dirA*L1*0.8+px*s*sp1+ax*grip;ky=hy0+ay*dirA*L1*0.8+py*s*sp1+ay*grip;fx=kx+ax*dirA*L2*0.85-px*s*(sp1-0.35)+ax*grip;fy=ky+ay*dirA*L2*0.85-py*s*(sp1-0.35)+ay*grip}
    ctx.globalAlpha=alpha*(far?0.35:0.9)*(0.5+0.5*bright);ctx.strokeStyle=col;ctx.lineWidth=far?0.6:0.9;
    ctx.beginPath();ctx.moveTo(hx0,hy0);ctx.lineTo(kx,ky);ctx.lineTo(fx,fy);ctx.stroke();
    if(!far&&!FIN()){ctx.fillStyle=c.segL[seg];ctx.fillRect(kx-0.8,ky-0.8,1.6,1.6)}};
  // la tige, derrière la bête, côté opposé
  for(const l of legs)if(l[1]<0)drawLeg(l,true);
  for(let i=n-1;i>=0;i--){const g=c.segs[i],len=c.dims[i][0],hh=c.dims[i][1]*0.72,p=pulseAt(c,i);
    ctx.save();ctx.translate(g.x,g.y);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,len/2+0.4,hh/2,0,0,TAU);
    ctx.globalAlpha=alpha;ctx.fillStyle='#000';ctx.fill();ctx.fillStyle=c.segT[i];ctx.globalAlpha=alpha*(0.5+0.5*p);ctx.fill();
    ctx.strokeStyle=c.segL[i];ctx.globalAlpha=alpha*bright*(0.15+0.45*p);ctx.lineWidth=2.2;ctx.stroke();ctx.globalAlpha=alpha*(0.6+0.4*bright);ctx.lineWidth=0.8;ctx.stroke();
    if(len>8){ctx.globalAlpha=alpha*0.4;ctx.lineWidth=0.4;ctx.beginPath();for(let q=1;q<3;q++){const xx=-len/2+len*q/3;ctx.moveTo(xx,-hh/2);ctx.lineTo(xx,hh/2)}ctx.stroke()}
    if(i===0){ctx.globalAlpha=alpha;ctx.fillStyle=c.cCore;const er=sp.f.includes('yeux')?Math.max(1.2,hh*0.3):0.8;ctx.beginPath();ctx.arc(len*0.15,-hh*0.2,er,0,TAU);ctx.fill();
      if(sp.ant>0){const A=sp.ant,wig=Math.sin(simT*5+c.x*0.1)*0.12;ctx.strokeStyle=c.segL[0];ctx.lineWidth=0.7;
        for(const k of [-1,1]){ctx.globalAlpha=alpha*(k>0?0.9:0.4);const a1=k*(0.18+wig),sx=len*0.45;ctx.beginPath();ctx.moveTo(sx,0);ctx.quadraticCurveTo(sx+Math.cos(a1*0.5)*A*0.6,Math.sin(a1*0.5)*A*0.6,sx+Math.cos(a1)*A,Math.sin(a1)*A);ctx.stroke()}}}
    ctx.restore()}
  for(const l of legs)if(l[1]>0)drawLeg(l,false);
  saved.forEach((g,i)=>Object.assign(c.segs[i],g));ctx.globalAlpha=1;ctx.lineCap='butt';ctx.lineJoin='miter';ctx.restore()}
function drawProfile(c,alpha,gray){
  if(!gray&&onStem(c)){drawOnStem(c,alpha);return}
  const F=c.sp.sf,hx=c.x/F,hy=c.y/F;ctx.save();ctx.scale(F,F);
  let saved=null,sa=c.ang;
  if(c.fly||(!c.sp.chain&&!gray)){ // corps rigide : axe proche de l'horizontale pour les volants, axe de la tête pour les insectes
    saved=c.segs.map(g=>({x:g.x,y:g.y,a:g.a}));const dir=Math.cos(c.ang)>=0?0:Math.PI;
    const a=c.fly?dir+clamp(Math.sin(c.ang),-1,1)*0.3*(dir?-1:1):c.ang;c.ang=a;
    let px=hx,py=hy;for(let i=0;i<c.segs.length;i++){if(i){const s=spacing(c,i);px-=Math.cos(a)*s;py-=Math.sin(a)*s}c.segs[i].x=px;c.segs[i].y=py;c.segs[i].a=a}}
  drawProfile0(c,alpha,gray);
  if(saved){saved.forEach((g,i)=>Object.assign(c.segs[i],g));c.ang=sa}
  ctx.restore();
}
function drawProfile0(c,alpha,gray){
  const sp=c.sp,id=sp.id,dead=gray;
  const h=c.segs[0],m=dead?-1:(Math.cos(c.ang)>=0?1:-1);
  const col=gray?'#777':(c.state==='caught'&&Math.sin(simT*30)>0?'#ffffff':c.cLine);
  const en=gray?0.5:clamp(c.energy/(ROLES[c.role].start),0.2,1.3);
  let bright=0.5+0.5*Math.min(1,en);if(!gray&&en<0.35&&Math.random()<0.18)bright*=0.25;
  const G=profGeom(c),ground=CS*0.5/sp.sf,ph=c.walkPh||0;
  // hauteur des segments vus de côté
  const segH=i=>{const d=c.dims[i];let hh=d[1]*(sp.chain?0.6:0.75);if(id==='cloporte')hh=d[1]*0.42;if(i===c.segs.length-1&&c.swell>1)hh*=c.swell;return hh};
  const bodyY=i=>dead?-segH(i)/2+ground:(id==='lombric'?0:ground-G.legH-segH(i)*0.5);
  // halo pulsé
  if(!gray){mainCtxGlow(c,alpha,bright)}
  ctx.lineCap='round';
  // ----- pattes -----
  const legs=[];
  if(sp.chain){if(sp.chain.per>0)for(let i=1;i<c.segs.length-(sp.chain.tl?1:0);i++)for(let side=0;side<2;side++)legs.push({seg:i,hipX:0,baseX:(id==='scolopendre'?-0.3:0)*c.dims[i][0],L1:G.L[0],L2:G.L[1],phase:-i*0.7+side*Math.PI,far:side===1})}
  else for(const l of sp.legs){const [seg,side,off,p,L1,L2]=l;const fwd=off/90;
    legs.push({seg,hipX:fwd*c.dims[seg][0]*0.35,baseX:fwd*(L1+L2)*0.55,L1,L2,phase:(p%2?Math.PI:0)+(side>0?0:Math.PI),far:side<0})}
  const drawLegs=(far)=>{
    ctx.strokeStyle=col;
    for(const l of legs){if(l.far!==far)continue;const g=c.segs[l.seg];
      ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.a);ctx.scale(1,m);
      const hy=bodyY(l.seg)+segH(l.seg)*0.25,hx=l.hipX;
      let fx,fy;
      if(dead){const w=Math.sin(simT*2+l.phase)*0.15;fx=hx+l.baseX*0.4;fy=hy-(l.L1+l.L2)*(0.6+w)}
      else if(c.fly){fx=hx+l.baseX*0.3-2;fy=hy+(l.L1+l.L2)*0.5}
      else{const stride=(l.L1+l.L2)*0.32,u=(((ph+l.phase)/TAU)%1+1)%1;
        if(u<0.62){fx=hx+l.baseX+stride*(0.5-u/0.62);fy=ground}else{const s=(u-0.62)/0.38;fx=hx+l.baseX+stride*(-0.5+s);fy=ground-Math.sin(s*Math.PI)*Math.min(4,l.L2*0.4)}}
      const k=ik2(hx,hy,fx,fy,l.L1,l.L2,true);
      ctx.globalAlpha=alpha*(far?0.3:0.9)*(0.5+0.5*bright);
      if(FIN()){if(NAT()&&!gray)ctx.strokeStyle=natLine(c);ctx.lineWidth=far?0.5:0.8;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(k[0],k[1]);ctx.stroke();ctx.lineWidth=far?0.35:0.5;ctx.beginPath();ctx.moveTo(k[0],k[1]);ctx.lineTo(fx,fy);ctx.stroke()}
      else{ctx.lineWidth=far?0.7:1;
      ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(k[0],k[1]);ctx.lineTo(fx,fy);ctx.stroke();
      if(!far){ctx.fillStyle=gray?col:c.segL[l.seg];ctx.fillRect(k[0]-1,k[1]-1,2,2);ctx.beginPath();ctx.arc(fx,fy,1.1,0,TAU);ctx.fill()}}
      ctx.restore()}
  };
  drawLegs(true);
  // ----- ailes (derrière le corps quand repliées) -----
  const th=c.segs[1]||c.segs[0];
  const drawWingsP=()=>{if(!sp.w||gray)return;const w=sp.w;
    ctx.save();ctx.translate(th.x,th.y);ctx.rotate(th.a);ctx.scale(1,m);
    const by=bodyY(1)-segH(1)*0.45;
    for(let k=0;k<(w.n===4?2:1);k++){
      const flap=c.fly?Math.sin(c.flap+k*0.8):0;
      const a=c.fly?(-Math.PI*0.62+flap*0.75):(-Math.PI+0.12+k*0.06);
      ctx.save();ctx.translate(-1,by);ctx.rotate(a);
      const L=w.len*(k?0.85:1),Wd=w.wid*0.8;
      ctx.globalAlpha=alpha*0.12;ctx.fillStyle=c.segL[1]||col;ctx.beginPath();ctx.ellipse(L/2,0,L/2,Wd/2,0,0,TAU);ctx.fill();
      ctx.globalAlpha=alpha*0.8;ctx.strokeStyle=c.segL[1]||col;ctx.lineWidth=0.7;ctx.stroke();
      ctx.globalAlpha=alpha*0.35;ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(L-1,0);ctx.moveTo(L*0.35,0);ctx.lineTo(L*0.7,-Wd*0.3);ctx.stroke();
      ctx.restore()}
    ctx.restore()};
  if(!c.fly)drawWingsP();
  // ----- corps -----
  for(let i=c.segs.length-1;i>=0;i--){
    const g=c.segs[i],len=c.dims[i][0]*(id==='lombric'?1+0.15*Math.sin(ph*1.3-i*0.8):1),hh=segH(i),by=bodyY(i);
    const p=gray?0:pulseAt(c,i),lc=gray?'#777':(col===c.cLine?c.segL[i]:col);
    ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.a);ctx.scale(1,m);
    ctx.beginPath();
    if(id==='cloporte'||(id==='coccinelle'&&i===2)){ctx.ellipse(0,by+hh*0.5,len/2+0.6,hh*1.1,0,Math.PI,TAU);ctx.closePath()}
    else ctx.ellipse(0,by,len/2+0.4,hh/2,0,0,TAU);
    ctx.globalAlpha=alpha;ctx.fillStyle='#000';ctx.fill();
    if(!gray){if(NAT()){ctx.fillStyle=natFill(c);ctx.globalAlpha=alpha;ctx.fill()}else{ctx.fillStyle=c.segT[i];ctx.globalAlpha=alpha*(0.5+0.5*p);ctx.fill()}}
    ctx.save();ctx.clip();
    const gx=clamp(Math.round(len/5),1,4),cw=len/gx;
    if(!gray&&!NAT()){ctx.fillStyle=lc;const kf=FIN()?0.4:1;for(let a=0;a<gx;a++){const lit=((a*7+i*5+c.beats)%3)===0;ctx.globalAlpha=alpha*bright*kf*(lit?0.15+0.6*p:0.03+0.12*p);ctx.fillRect(-len/2+a*cw+0.6,by-hh,cw-1.2,hh*2)}}
    ctx.globalAlpha=alpha*(FIN()?0.25:0.45);ctx.strokeStyle=NAT()&&!gray?natLine(c):lc;ctx.lineWidth=FIN()?0.3:0.5;ctx.beginPath();for(let a=1;a<gx;a++){const x=-len/2+a*cw;ctx.moveTo(x,by-hh);ctx.lineTo(x,by+hh)}ctx.stroke();
    // motifs
    if(!gray){const big=i>0&&c.dims[i][0]*c.dims[i][1]>=Math.max(...c.dims.slice(1).map(d=>d[0]*d[1]))*0.99;
      if(big&&sp.f.includes('rayures')){ctx.strokeStyle=lc;ctx.globalAlpha=alpha*0.9;ctx.lineWidth=0.9;ctx.beginPath();for(let k=0;k<(sp.ray||2);k++){const x=-len/2+len*(k+0.7)/((sp.ray||2)+0.6);ctx.moveTo(x,by-hh);ctx.lineTo(x,by+hh)}ctx.stroke()}
      if(big&&sp.f.includes('points')){ctx.fillStyle='#000';ctx.strokeStyle=c.cCore;ctx.globalAlpha=alpha;for(const q of [-0.25,0.05,0.3]){const r=hh*0.16;ctx.fillRect(q*len-r,by-r,r*2,r*2);ctx.strokeRect(q*len-r,by-r,r*2,r*2)}}
      if(big&&sp.f.includes('croix')){ctx.fillStyle='#fff';ctx.globalAlpha=alpha*0.9;for(const q of [-0.2,0,0.2])ctx.fillRect(q*len-0.8,by-hh*0.25-0.8,1.6,1.6)}}
    ctx.restore();
    ctx.strokeStyle=NAT()&&!gray?natLine(c):lc;if(!NAT()){ctx.globalAlpha=alpha*bright*(0.15+0.45*p)*(FIN()?0.5:1);ctx.lineWidth=FIN()?1.4:2.6;ctx.stroke()}
    ctx.globalAlpha=alpha*(0.6+0.4*bright);ctx.lineWidth=FIN()?0.55:0.9;ctx.stroke();
    // coeur
    if(!gray&&!FIN()&&len*hh>14){ctx.fillStyle=c.cCore;ctx.globalAlpha=alpha*Math.min(1,bright*(0.2+0.85*p));const r=(0.8+1.2*p)*Math.min(1.5,Math.sqrt(len*hh)/7);ctx.fillRect(-r,by-r,r*2,r*2)}
    // tête : œil, antennes, mandibules
    if(i===0&&id!=='lombric'){ctx.globalAlpha=alpha;ctx.fillStyle=gray?col:c.cCore;
      const ex=len*0.18,ey=by-hh*0.15,er=(sp.f.includes('yeux')?Math.max(1.3,hh*0.3):0.9)*(FIN()?0.55:1);if(NAT()&&!gray)ctx.fillStyle='#0a0a0a';ctx.beginPath();ctx.arc(ex,ey,er,0,TAU);ctx.fill();if(NAT()&&!gray){ctx.fillStyle='#fff';ctx.globalAlpha=alpha*0.7;ctx.beginPath();ctx.arc(ex+er*0.3,ey-er*0.3,er*0.3,0,TAU);ctx.fill();ctx.globalAlpha=alpha}
      if(sp.ant>0){const wig=Math.sin(simT*6+c.x*0.1)*0.15,A=sp.ant;ctx.strokeStyle=lc;ctx.lineWidth=0.8;
        for(const k of [0,1]){ctx.globalAlpha=alpha*(k?0.35:0.9);const a1=-0.5-k*0.25+wig,a2=-0.2-k*0.3+wig;const sx=len*0.4,sy=by-hh*0.3;
          ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx+Math.cos(a1)*A*0.6,sy+Math.sin(a1)*A*0.6,sx+Math.cos(a2)*A,sy+Math.sin(a2)*A);ctx.stroke()}}
      if(sp.f.includes('mandibules')){ctx.globalAlpha=alpha;ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(len*0.45,by+hh*0.2);ctx.quadraticCurveTo(len*0.75,by+hh*0.35,len*0.6,by+hh*0.6);ctx.stroke()}
      if(id==='araignee'){ctx.globalAlpha=alpha;ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(len*0.45,by+hh*0.1);ctx.lineTo(len*0.7,by+hh*0.5);ctx.stroke()}
      if(id==='scolopendre'){ctx.globalAlpha=alpha;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(len*0.4,by+hh*0.3);ctx.quadraticCurveTo(len*0.9,by+hh*0.4,len*0.7,by-hh*0.1);ctx.stroke()}}
    ctx.restore();
  }
  drawLegs(false);
  if(c.fly)drawWingsP();
  // dard de la scolopendre (pattes terminales)
  if(id==='scolopendre'&&!gray){const g=c.segs[c.segs.length-1];ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.a);ctx.scale(1,m);ctx.strokeStyle=c.segL[c.segs.length-1];ctx.globalAlpha=alpha*0.8;ctx.lineWidth=0.9;
    const by=bodyY(c.segs.length-1);ctx.beginPath();ctx.moveTo(-c.dims[c.segs.length-1][0]/2,by);ctx.lineTo(-c.dims[c.segs.length-1][0]/2-7,by+3);ctx.stroke();ctx.restore()}
  ctx.globalAlpha=1;ctx.lineCap='butt';
}
function mainCtxGlow(c,alpha,bright){if(NAT())return;if(FIN())alpha*=0.45;
  ctx.globalCompositeOperation='lighter';const spr=glowSprite(c.hue);const stepI=c.segs.length>8?2:1;
  for(let i=0;i<c.segs.length;i+=stepI){const g=c.segs[i],p=pulseAt(c,i);const R=(c.dims[i][1]*1.1+7)*(0.75+p*0.7);
    ctx.globalAlpha=alpha*bright*(0.06+0.32*p);ctx.drawImage(spr,g.x-R,g.y-R-2,R*2,R*2)}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=alpha;
}

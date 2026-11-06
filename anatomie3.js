// ================= ANATOMIE (suite) : phasmes et leurs variantes, papillon, chenille, escargot, scorpion, cloporte,
// perce-oreille, gendarme, libellule, moustique, gerris, larve de libellule — vue de côté =================

// ---------- nouvelles variantes de phasme ----------
const PHASMES=[
  {v:'feuille',nom:'Phyllie (phasme-feuille)',la:'Phyllium philippinicum',h:95,s:55,l:42,size:0.9,spd:0.8,trait:"Plat et vert comme une feuille, avec de fausses nervures et des « morsures » sur les bords. Il se balance comme une feuille dans le vent."},
  {v:'epineux',nom:'Phasme épineux',la:'Extatosoma tiaratum',h:35,s:40,l:38,size:1.4,spd:0.7,trait:"Couvert d'épines, la queue recourbée au-dessus du dos comme un scorpion : il imite une touffe de feuilles mortes."},
  {v:'peruvien',nom:'Phasme péruvien',la:'Peruphasma schultei',h:0,s:0,l:12,size:0.65,spd:1.1,trait:"Noir velours, yeux jaunes et ailes rouge vif : il prévient qu'il n'est pas bon à manger."},
  {v:'geant',nom:'Nymphe de la jungle',la:'Heteropteryx dilatata',h:100,s:55,l:36,size:1.7,spd:0.6,trait:"L'un des plus lourds insectes du monde : vert pomme, trapu et épineux. La femelle peut peser 50 g."}];
VARS.phasme=VARS.phasme||[];
for(const V of PHASMES){VARS.phasme.push(V);const b=SPI.phasme,sp=Object.assign({},b,{vid:'phasme:'+V.v,vnom:V.nom,vla:V.la,vtrait:V.trait,h:V.h,s:V.s,l:V.l,sf:b.sf*V.size,spd:b.spd*V.spd,vsize:V.size});VSP[sp.vid]=sp}
Object.assign(SHORT,{'phasme:feuille':'Phyllie','phasme:epineux':'Épineux','phasme:peruvien':'Péruvien','phasme:geant':'Nymphe jungle'});

// ---------- dessins ----------
function phasmeCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,v=c.sp.vid||'',yG=c.y+CS*0.5;
  const feu=v.includes('feuille'),epi=v.includes('epineux'),per=v.includes('peruvien'),gea=v.includes('geant');
  const corps=per?'#141414':gea?hsl(100,55,36):feu?hsl(95,55,40):epi?hsl(35,40,38):hsl(c.sp.h,c.sp.s*0.6,Math.max(20,c.sp.l*0.7)),fonce=per?'#000':feu||gea?hsl(100,50,20):hsl(30,35,18),clair=feu||gea?hsl(90,55,60):hsl(40,35,55);
  const ep=u*(gea?0.75:epi?0.55:per?0.4:0.28),hb=u*(gea?1.1:1.4),y=yG-hb;
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  const P=[[2.2,4.4,0.9],[0.6,0.6,1.2],[-0.6,-3.0,1.3,1]],lo=feu||gea?0.18:0.12;
  pattes6(c,u,m,yG,c.x,y,P.map(p=>[p[0],p[1],p[2],lo*1.3,p[3]]),fonce,fonce,true);
  if(feu){// corps plat en feuille avec nervures, lobes sur les pattes
    ctx.fillStyle=corps;ctx.beginPath();ctx.moveTo(c.x-m*u*5,y);ctx.quadraticCurveTo(c.x-m*u*2.5,y-u*1.8,c.x+m*u*0.5,y-u*0.4);ctx.quadraticCurveTo(c.x-m*u*2.5,y+u*1.2,c.x-m*u*5,y);ctx.fill();
    ctx.strokeStyle=clair;ctx.lineWidth=u*0.08;ctx.beginPath();ctx.moveTo(c.x-m*u*4.8,y);ctx.lineTo(c.x+m*u*0.3,y-u*0.4);for(let q=1;q<5;q++){const x=c.x-m*u*(4.6-q*0.95);ctx.moveTo(x,y-u*0.2);ctx.lineTo(x+m*u*0.5,y-u*1.0)}ctx.stroke();
    ctx.fillStyle=hsl(40,35,40);ctx.beginPath();ctx.arc(c.x-m*u*3.2,y-u*1.15,u*0.18,0,TAU);ctx.fill()}
  else if(epi){// queue recourbée au-dessus du dos
    ctx.strokeStyle=corps;ctx.lineWidth=ep*2;ctx.beginPath();ctx.moveTo(c.x+m*u*1.8,y);ctx.lineTo(c.x-m*u*1.2,y);ctx.quadraticCurveTo(c.x-m*u*4.2,y-u*0.2,c.x-m*u*3.4,y-u*2.6);ctx.quadraticCurveTo(c.x-m*u*2.4,y-u*3.6,c.x-m*u*1.6,y-u*2.4);ctx.stroke();
    ctx.strokeStyle=fonce;ctx.lineWidth=u*0.1;ctx.beginPath();for(let q=0;q<9;q++){const t=q/9,x=c.x+m*u*(1.6-t*3.2),yy=y;ctx.moveTo(x,yy-ep);ctx.lineTo(x-m*u*0.2,yy-ep-u*0.35)}ctx.stroke();
    ctx.fillStyle=hsl(35,35,45);ctx.beginPath();ctx.ellipse(c.x-m*u*0.4,y-u*0.7,u*1.2,u*0.4,-m*0.3,0,TAU);ctx.fill()}
  else{// bâton : long et fin (plus épais pour la nymphe de la jungle et le péruvien)
    segPatte(c.x-m*u*5.2,y+u*0.1,c.x+m*u*2.0,y,ep*1.6,ep*2.2,corps);
    ctx.strokeStyle=fonce;ctx.lineWidth=u*0.06;ctx.beginPath();for(let q=1;q<8;q++){const x=c.x-m*u*(5-q*0.9);ctx.moveTo(x,y-ep);ctx.lineTo(x,y+ep)}ctx.stroke();
    if(gea){ctx.strokeStyle=hsl(100,40,22);ctx.lineWidth=u*0.12;ctx.beginPath();for(let q=0;q<8;q++){const x=c.x-m*u*(4.4-q*0.8);ctx.moveTo(x,y-ep);ctx.lineTo(x-m*u*0.15,y-ep-u*0.45)}ctx.stroke();ell(c.x-m*u*0.5,y-ep*0.9,u*1.1,u*0.35,0,hsl(100,45,48))}
    if(per){ell(c.x+m*u*0.6,y-ep*0.6,u*0.6,u*0.3,0,'#d42a1c')}}
  pattes6(c,u,m,yG,c.x,y,P.map(p=>[p[0],p[1],p[2],lo*1.5,p[3]]),feu?corps:per?'#1a1a1a':corps,fonce,false);
  if(feu){ctx.fillStyle=corps;for(const [a,b] of [[1.4,0.3],[-1.0,0.4]]){ctx.beginPath();ctx.ellipse(c.x+m*u*a,y+u*b,u*0.6,u*0.25,0,0,TAU);ctx.fill()}}
  const hx=c.x+m*u*2.5,hy=y-u*0.1;ell(hx,hy,u*0.55,u*0.4,0,corps);ell(hx+m*u*0.2,hy-u*0.15,u*0.16,u*0.16,0,per?'#f0d020':'#2a1a0a');
  antennes(c,u,m,hx+m*u*0.4,hy-u*0.2,'fil',fonce,feu?1:2.6);ctx.restore()}
function papillonCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,yG=c.y+CS*0.5,vol=c.fly,y=vol?c.y:yG-u*1.4;
  const ORANGE=hsl(20,85,52),NOIR='#1a1410',BLEU=hsl(215,75,58),DESSOUS=hsl(25,30,24);ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  const bat=vol?Math.sin(simT*18+c.phase*7):0,ouv=vol?0.5+0.5*bat:(Math.sin(simT*0.7+c.phase*5)>0.6?1:0);
  if(!vol)pattes6(c,u,m,yG,c.x,y+u*0.3,[[0.8,1.6,0.6,0.1],[0.2,0.2,0.7,0.1],[-0.3,-1.3,0.7,0.1]],NOIR,NOIR,false);
  // ailes : fermées au repos (on voit le dessous, brun) ; ouvertes = dessus orange à taches noires et lunules bleues
  const ailes=(haut)=>{const visible=ouv>0.5,lev=vol?haut:0;ctx.save();ctx.translate(c.x,y-u*0.2);ctx.scale(m,1);ctx.rotate(lev*0.5);
    // aile antérieure : voile arrondi au bord festonné ; aile postérieure : lobe arrondi derrière
    const f=new Path2D();f.moveTo(0,0);f.quadraticCurveTo(u*1.4,-u*3.2,u*0.6,-u*5.6);f.quadraticCurveTo(-u*1.6,-u*5.4,-u*2.6,-u*2.6);f.quadraticCurveTo(-u*1.2,-u*1.0,0,0);
    const h=new Path2D();h.moveTo(0,0);h.quadraticCurveTo(-u*3.4,-u*1.8,-u*3.0,u*0.2);h.quadraticCurveTo(-u*1.4,u*0.9,0,0);
    ctx.fillStyle=visible?ORANGE:hsl(25,25,30);ctx.fill(h);ctx.fillStyle=visible?ORANGE:DESSOUS;ctx.fill(f);
    if(visible){ctx.fillStyle=NOIR;for(const [dx,dy,r] of [[-0.3,-3.2,0.45],[-1.2,-3.6,0.35],[0.1,-4.6,0.5]]){ctx.beginPath();ctx.arc(u*dx,u*dy,u*r,0,TAU);ctx.fill()}
      ctx.fillStyle=BLEU;for(let q=0;q<5;q++){ctx.beginPath();ctx.arc(-u*(0.6+q*0.45),-u*(2.2+q*0.6)+u*0.4,u*0.15,0,TAU);ctx.fill()}}
    else{ctx.strokeStyle='rgba(255,240,220,0.35)';ctx.lineWidth=u*0.08;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-u*0.4,-u*5);ctx.moveTo(-u*0.2,-u*1);ctx.lineTo(-u*2.2,-u*2.6);ctx.stroke();ctx.fillStyle='rgba(240,230,210,0.5)';ctx.beginPath();ctx.arc(-u*0.9,-u*3.0,u*0.25,0,TAU);ctx.fill()}
    ctx.strokeStyle=NOIR;ctx.lineWidth=u*0.1;ctx.stroke(f);ctx.restore()};
  ailes(vol?bat:0);
  segPatte(c.x-m*u*2.0,y+u*0.1,c.x+m*u*0.9,y-u*0.1,u*0.55,u*0.75,'#2a2018');ell(c.x+m*u*1.3,y-u*0.2,u*0.5,u*0.45,0,'#2a2018');
  ell(c.x+m*u*1.45,y-u*0.3,u*0.2,u*0.2,0,'#0a0a0a');
  ctx.strokeStyle=NOIR;ctx.lineWidth=u*0.08;for(const d of [0,0.25]){ctx.beginPath();ctx.moveTo(c.x+m*u*1.6,y-u*0.5);ctx.quadraticCurveTo(c.x+m*u*2.6,y-u*(2.2+d),c.x+m*u*3.0,y-u*(2.6-d));ctx.stroke();ell(c.x+m*u*3.0,y-u*(2.6-d),u*0.16,u*0.16,0,NOIR)}
  ctx.restore()}
function chenilleCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,yG=c.y+CS*0.5,ph=(c.walkPh||0)*TAU,n=10;
  ctx.save();ctx.globalAlpha=alpha;for(let i=n-1;i>=0;i--){const t=i/(n-1),x=c.x+m*u*(4.2-t*8.4),bosse=Math.max(0,Math.sin(ph-t*5))*u*0.9*((c.v||0)>0.3?1:0),y=yG-u*0.8-bosse,r=u*(i===0?0.75:0.85);
    ell(x,y,r,r,0,i===0?'#1a1410':'#24201c');if(i>0){ctx.fillStyle=hsl(48,80,55);ctx.beginPath();ctx.ellipse(x,y+r*0.35,r*0.55,r*0.14,0,0,TAU);ctx.fill()}
    if(i>0&&i<n){ctx.strokeStyle='#3a3226';ctx.lineWidth=u*0.08;ctx.beginPath();for(const a of [-2.2,-1.6,-1.0]){ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*r*1.7,y+Math.sin(a)*r*1.7)}ctx.stroke()}
    if(i>=1&&i<=3||i>=6&&i<=8||i===n-1){ctx.fillStyle='#2a221a';ctx.fillRect(x-u*0.2,y+r*0.7,u*0.4,yG-(y+r*0.7))}}
  ell(c.x+m*u*4.5,yG-u*0.9,u*0.12,u*0.12,0,'#ddd');ctx.restore()}
function escargotCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,yG=c.y+CS*0.5,ret=c.state==='retire';
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  if(!ret){const gris=hsl(30,15,45),clair=hsl(30,15,58);ctx.fillStyle=gris;ctx.beginPath();ctx.moveTo(c.x-m*u*4.2,yG);ctx.quadraticCurveTo(c.x-m*u*1,yG-u*1.6,c.x+m*u*3.0,yG-u*1.9);ctx.quadraticCurveTo(c.x+m*u*4.4,yG-u*1.4,c.x+m*u*4.2,yG);ctx.closePath();ctx.fill();
    ctx.strokeStyle=clair;ctx.lineWidth=u*0.08;ctx.beginPath();for(let q=0;q<7;q++){const x=c.x-m*u*(3-q*0.9);ctx.moveTo(x,yG-u*0.2);ctx.lineTo(x+m*u*0.3,yG-u*0.9)}ctx.stroke();
    const w=Math.sin(simT*1.5+c.phase*6)*0.12;for(const [ox,len,oy] of [[3.3,2.6,1.6],[3.7,1.0,1.3]]){const bx=c.x+m*u*ox,by=yG-u*oy,tx=bx+m*u*len*Math.sin(0.5+w),ty=by-u*len*Math.cos(0.5+w);trait([[bx,by],[tx,ty]],gris,u*0.28);if(len>2)ell(tx,ty,u*0.22,u*0.22,0,'#1a1a1a')}}
  // coquille en spirale, à bandes brunes
  const sx=c.x-m*u*(ret?0:0.6),sy=yG-u*(ret?2.6:3.2),R=u*2.7;ctx.fillStyle=hsl(32,45,42);ctx.beginPath();ctx.arc(sx,sy,R,0,TAU);ctx.fill();
  ctx.strokeStyle=hsl(28,40,22);ctx.lineWidth=u*0.35;ctx.beginPath();for(let q=0;q<=60;q++){const a=q/60*TAU*2.4,r=R*(1-q/68);ctx.lineTo(sx+m*Math.cos(a+1)*r,sy+Math.sin(a+1)*r)}ctx.stroke();
  ctx.strokeStyle=hsl(40,45,60);ctx.lineWidth=u*0.12;ctx.beginPath();ctx.arc(sx,sy,R*0.82,-2.4,-0.6);ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.18)';ctx.beginPath();ctx.ellipse(sx-u*0.8,sy-u*1.2,u*0.9,u*0.4,-0.5,0,TAU);ctx.fill();
  ctx.restore()}
function scorpionCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,yG=c.y+CS*0.5,uv=typeof uvOn==='function'&&uvOn();
  const coul=uv?'#7dffe8':hsl(48,55,58),fonce=uv?'#2ad8c0':hsl(40,45,32),y=yG-u*1.0;ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  if(uv){ctx.shadowColor='#4dfff0';ctx.shadowBlur=u*3}
  const P4=[[0.8,2.6,1.0],[0.3,0.9,1.1],[-0.3,-0.9,1.1],[-0.8,-2.6,1.0]];for(const loin of [true,false])for(let i=0;i<4;i++){const [at,pd,kh]=P4[i],p=(c.walkPh||0)*TAU*0.5+i*TAUP/2+(loin?TAUP:0),mv=(c.v||0)>0.5,ps=mv?Math.sin(p):0;
    const x0=c.x+m*u*at,fx=c.x+m*u*(pd+ps*0.5)+(loin?-m*u*0.3:0),kx=(x0+fx)/2,ky=y-u*kh;ctx.globalAlpha=alpha*(loin?0.5:1);segPatte(x0,y,kx,ky,u*0.3,u*0.25,loin?fonce:coul);segPatte(kx,ky,fx,yG,u*0.25,u*0.12,loin?fonce:coul)}ctx.globalAlpha=alpha;
  ell(c.x,y,u*2.6,u*0.75,0,coul,fonce,u*0.1);ctx.strokeStyle=fonce;ctx.lineWidth=u*0.08;ctx.beginPath();for(let q=-2;q<=2;q++){ctx.moveTo(c.x+q*u*0.8,y-u*0.7);ctx.lineTo(c.x+q*u*0.8,y+u*0.6)}ctx.stroke();
  // queue (métasome) : 5 anneaux recourbés au-dessus du dos, aiguillon au bout
  const st=c.strike>0?Math.sin(c.strike/0.5*TAUP):0;let px=c.x-m*u*2.4,py=y-u*0.2,th=Math.PI+0.5;
  for(let q=0;q<5;q++){const len=u*1.05,nx=px+m*Math.cos(th)*len,ny=py+Math.sin(th)*len;segPatte(px,py,nx,ny,u*(0.75-q*0.07),u*(0.7-q*0.07),coul);px=nx;py=ny;th+=0.42+st*0.12}
  const tx=px+m*Math.cos(th)*u*0.5,ty=py+Math.sin(th)*u*0.5;ell(tx,ty,u*0.5,u*0.38,0,coul,fonce,u*0.08);trait([[tx+m*Math.cos(th)*u*0.4,ty+Math.sin(th)*u*0.4],[tx+m*Math.cos(th+0.9)*u*0.9,ty+Math.sin(th+0.9)*u*0.9]],'#3a2010',u*0.18);
  // pédipalpes en pinces
  const bx=c.x+m*u*2.4,by=y;const kx=bx+m*u*1.4,ky=y-u*0.9;segPatte(bx,by,kx,ky,u*0.35,u*0.35,coul);ell(kx+m*u*1.0,ky+u*0.1,u*1.1,u*0.55,m*0.2,coul,fonce,u*0.08);
  const o=0.25+0.15*Math.sin(simT*2+c.phase*5);trait([[kx+m*u*1.8,ky],[kx+m*u*2.6,ky-u*0.3]],fonce,u*0.22);trait([[kx+m*u*1.8,ky+u*0.25],[kx+m*u*2.5,ky+u*(0.25+o)]],fonce,u*0.18);
  ell(c.x+m*u*2.1,y-u*0.6,u*0.16,u*0.16,0,'#111');ctx.restore()}
function cloporteCote(c,alpha){const L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,yG=c.y+CS*0.5,v=c.sp.vid||'';
  const coul=v.includes('mousse')?hsl(30,40,40):v.includes('boule')?hsl(220,8,32):hsl(220,10,42),fonce=hsl(220,10,18),clair=hsl(220,10,62);ctx.save();ctx.globalAlpha=alpha;
  const ph=(c.walkPh||0)*TAU;ctx.strokeStyle=fonce;ctx.lineWidth=u*0.18;ctx.beginPath();for(let q=0;q<7;q++){const x=c.x+m*u*(2.4-q*0.8)+Math.sin(ph+q)*u*0.25*((c.v||0)>0.3?1:0);ctx.moveTo(x,yG-u*0.6);ctx.lineTo(x+m*u*0.25,yG)}ctx.stroke();
  ctx.fillStyle=coul;ctx.beginPath();ctx.ellipse(c.x,yG-u*0.6,u*4.0,u*2.2,0,TAUP,TAU);ctx.closePath();ctx.fill();
  ctx.strokeStyle=fonce;ctx.lineWidth=u*0.12;for(let q=1;q<8;q++){const x=c.x+m*u*(3.0-q*0.82);ctx.beginPath();ctx.moveTo(x,yG-u*0.6);ctx.quadraticCurveTo(x+m*u*0.3,yG-u*2.4*Math.sqrt(Math.max(0,1-((x-c.x)/(u*4.1))**2)),x+m*u*0.1,yG-u*0.6-u*2.2*Math.sqrt(Math.max(0,1-((x-c.x)/(u*4.0))**2)));ctx.stroke()}
  ctx.fillStyle=clair;ctx.globalAlpha=alpha*0.35;ctx.beginPath();ctx.ellipse(c.x-m*u*0.5,yG-u*2.0,u*2.0,u*0.35,0,0,TAU);ctx.fill();ctx.globalAlpha=alpha;
  ell(c.x+m*u*3.9,yG-u*0.9,u*0.6,u*0.5,0,coul);trait([[c.x+m*u*4.3,yG-u*1.1],[c.x+m*u*5.0,yG-u*1.9],[c.x+m*u*5.9,yG-u*1.5]],fonce,u*0.15);
  trait([[c.x-m*u*4.0,yG-u*0.7],[c.x-m*u*4.6,yG-u*0.5]],fonce,u*0.18);ctx.restore()}
function aquaCote(c,alpha){const id=c.sp.id,L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,yG=c.y+CS*0.5;ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
  if(id==='perce'){const y=yG-u*1.2,co=hsl(15,50,25),cl=hsl(25,45,45);pattes6(c,u,m,yG,c.x+m*u*0.8,y+u*0.3,[[0.8,2.4,0.8,0.22],[0.2,0.4,0.9,0.22],[-0.4,-1.6,0.9,0.22]],cl,co,true);
    segPatte(c.x-m*u*3.6,y,c.x+m*u*0.5,y,u*1.0,u*1.0,co);ctx.strokeStyle='rgba(0,0,0,0.4)';ctx.lineWidth=u*0.06;ctx.beginPath();for(let q=0;q<6;q++){const x=c.x-m*u*(3.2-q*0.6);ctx.moveTo(x,y-u*0.45);ctx.lineTo(x,y+u*0.45)}ctx.stroke();
    ell(c.x+m*u*0.8,y-u*0.1,u*1.0,u*0.55,0,cl);ell(c.x+m*u*2.3,y,u*0.65,u*0.55,0,co);
    for(const sd of [-1,1]){ctx.strokeStyle=sd<0?hsl(25,45,30):cl;ctx.lineWidth=u*0.28;ctx.beginPath();ctx.moveTo(c.x-m*u*3.6,y);ctx.quadraticCurveTo(c.x-m*u*5.0,y+sd*u*0.6,c.x-m*u*5.2,y+sd*u*0.1);ctx.stroke()}
    pattes6(c,u,m,yG,c.x+m*u*0.8,y+u*0.3,[[0.8,2.4,0.8,0.22],[0.2,0.4,0.9,0.22],[-0.4,-1.6,0.9,0.22]],cl,co,false);antennes(c,u,m,c.x+m*u*2.8,y-u*0.2,'fil',cl,2.4)}
  else if(id==='gendarme'){const y=yG-u*1.3;pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*0.4,[[0.8,2.6,0.8,0.25],[0.1,0.4,0.9,0.25],[-0.5,-2.2,1.0,0.25]],'#141414','#000',true);
    ctx.fillStyle=hsl(4,80,45);ctx.beginPath();ctx.ellipse(c.x-m*u*1.0,y,u*3.2,u*1.1,0,TAUP,TAU);ctx.lineTo(c.x+m*u*2.2,y+u*0.5);ctx.lineTo(c.x-m*u*4.2,y+u*0.5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#111';for(const [dx,dy,r] of [[-2.2,-0.5,0.45],[-0.4,-0.6,0.3],[0.8,-0.3,0.35],[-3.6,0.1,0.35]]){ctx.beginPath();ctx.arc(c.x+m*u*dx,y+u*dy,u*r,0,TAU);ctx.fill()}
    ell(c.x+m*u*2.6,y+u*0.1,u*0.7,u*0.55,0,'#111');pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*0.4,[[0.8,2.6,0.8,0.25],[0.1,0.4,0.9,0.25],[-0.5,-2.2,1.0,0.25]],'#1a1a1a','#000',false);antennes(c,u,m,c.x+m*u*3.1,y-u*0.1,'fil','#111',2)}
  else if(id==='libellule'||id==='moustique'){const lib=id==='libellule',y=c.fly?c.y:yG-u*(lib?1.6:2.4),co=lib?hsl(205,40,55):hsl(30,15,40),fo=lib?hsl(210,30,25):hsl(30,15,20);
    if(!c.fly)pattes6(c,u,m,yG,c.x+m*u*(lib?2:0.5),y+u*0.3,lib?[[0.4,1.8,0.6,0.1],[0,0.6,0.7,0.1],[-0.4,-0.5,0.7,0.1]]:[[0.4,3.4,2.4,0.06],[0,0.4,2.6,0.06],[-0.3,-3.4,2.8,0.06,1]],fo,fo,false);
    segPatte(c.x-m*u*5,y+u*0.1,c.x+m*u*(lib?1.3:0.6),y,u*(lib?0.6:0.3),u*(lib?0.9:0.5),co);
    if(lib){ctx.strokeStyle=fo;ctx.lineWidth=u*0.07;ctx.beginPath();for(let q=1;q<8;q++){const x=c.x-m*u*(4.7-q*0.75);ctx.moveTo(x,y-u*0.4);ctx.lineTo(x,y+u*0.5)}ctx.stroke()}
    ell(c.x+m*u*(lib?2.0:1.0),y-u*0.1,u*(lib?1.0:0.65),u*(lib?0.9:0.6),0,lib?hsl(80,25,35):co);
    const b=c.fly?Math.sin(simT*(lib?26:50)+c.phase*7):0;for(let w=0;w<(lib?2:1);w++){ctx.save();ctx.translate(c.x+m*u*(lib?1.8+w*0.4:0.9),y-u*0.6);ctx.rotate(-m*(0.15+b*0.6+w*0.15));ctx.fillStyle='rgba(225,235,250,0.38)';ctx.beginPath();ctx.ellipse(-m*u*(lib?4:2.6),0,u*(lib?4:2.6),u*(lib?0.55:0.5),0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(60,70,90,0.45)';ctx.lineWidth=u*0.05;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-m*u*(lib?7.8:5),0);if(lib){ctx.fillStyle='#2a2a2a';ctx.fillRect(-m*u*7.2-u*0.2,-u*0.2,u*0.4,u*0.25)}ctx.stroke();ctx.restore()}
    const hx=c.x+m*u*(lib?3.1:1.6),hy=y-u*0.1;ell(hx,hy,u*(lib?0.85:0.45),u*(lib?0.85:0.45),0,lib?hsl(200,40,30):fo);if(lib){ell(hx+m*u*0.2,hy-u*0.2,u*0.7,u*0.7,0,hsl(200,45,40));ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(hx+m*u*0.4,hy-u*0.5,u*0.2,0,TAU);ctx.fill()}
    else{trait([[hx+m*u*0.3,hy+u*0.2],[hx+m*u*2.0,hy+u*0.9]],fo,u*0.1);antennes(c,u,m,hx+m*u*0.3,hy-u*0.2,'lame',fo,1)}}
  else if(id==='gerris'){const y=c.y-u*0.4,co=hsl(30,15,22);ctx.strokeStyle=co;ctx.lineWidth=u*0.12;
    for(const [ax,fx] of [[0.6,5.2],[-0.2,-5.6]]){for(const loin of [0,1]){ctx.globalAlpha=alpha*(loin?0.5:1);ctx.beginPath();ctx.moveTo(c.x+m*u*ax,y);ctx.quadraticCurveTo(c.x+m*u*(ax+fx*0.4),y-u*1.4,c.x+m*u*fx*(loin?0.8:1),c.y);ctx.stroke()}}
    ctx.globalAlpha=alpha;for(const [ax,fx] of [[0.6,5.2],[-0.2,-5.6]]){ctx.strokeStyle='rgba(200,230,255,0.6)';ctx.lineWidth=u*0.06;ctx.beginPath();ctx.ellipse(c.x+m*u*fx,c.y,u*0.6,u*0.12,0,0,TAU);ctx.stroke()}
    segPatte(c.x-m*u*2.8,y,c.x+m*u*1.8,y-u*0.1,u*0.6,u*0.6,co);ell(c.x+m*u*2.2,y-u*0.1,u*0.45,u*0.4,0,co);trait([[c.x+m*u*1.6,y],[c.x+m*u*2.6,y+u*0.5]],co,u*0.12);antennes(c,u,m,c.x+m*u*2.5,y-u*0.2,'fil',co,1.6)}
  else if(id==='larvelib'){const y=c.y,co=hsl(35,35,28),fo=hsl(35,30,15);pattes6(c,u,m,y+u*1.2,c.x+m*u*0.8,y+u*0.3,[[0.6,2.2,0.6,0.22],[0.1,0.3,0.7,0.22],[-0.4,-2.2,0.7,0.22]],fo,fo,true);
    ell(c.x-m*u*1.6,y,u*3.0,u*1.4,0,co,fo,u*0.1);ctx.strokeStyle=fo;ctx.lineWidth=u*0.08;ctx.beginPath();for(let q=0;q<5;q++){const x=c.x-m*u*(3.6-q*0.8);ctx.moveTo(x,y-u*1.1);ctx.lineTo(x,y+u*1.1)}ctx.stroke();
    ell(c.x+m*u*0.6,y-u*0.7,u*1.2,u*0.4,-m*0.2,hsl(35,30,38));ell(c.x+m*u*1.3,y,u*1.1,u*0.9,0,co);ell(c.x+m*u*2.5,y-u*0.1,u*0.8,u*0.75,0,co);ell(c.x+m*u*2.8,y-u*0.4,u*0.3,u*0.3,0,'#151008');
    const mq=c.frappe>0?1:0;trait([[c.x+m*u*2.4,y+u*0.6],[c.x+m*u*(2.6+mq*2.4),y+u*(0.9-mq*0.3)]],fo,u*0.3);pattes6(c,u,m,y+u*1.2,c.x+m*u*0.8,y+u*0.3,[[0.6,2.2,0.6,0.22],[0.1,0.3,0.7,0.22],[-0.4,-2.2,0.7,0.22]],co,fo,false)}
  ctx.restore()}
const DESSINS3={phasme:phasmeCote,papillon:papillonCote,chenille:chenilleCote,escargot:escargotCote,scorpion:scorpionCote,cloporte:cloporteCote,perce:aquaCote,gendarme:aquaCote,libellule:aquaCote,moustique:aquaCote,gerris:aquaCote,larvelib:aquaCote};
{const dp=drawProfile;drawProfile=function(c,alpha,gray){const f=DESSINS3[c.sp.id];if(gray||!ANAT||!f||c.state==='caught'||c.state==='chrysalide'){dp(c,alpha,gray);return}
  if(typeof onStem==='function'&&onStem(c)&&(c.sp.id==='phasme'||c.sp.id==='chenille'||c.sp.id==='papillon')){const P=Object.create(c);P.x=0;P.y=-CS*0.5;P.ang=0;P.v=0;P.fly=false;const up=Math.sin(c.ang)<=0.2;
    const Lb=realLen(c)*(typeof ech==='function'?ech(c):1)*0.6,sol=surfY(clamp(Math.floor(c.x/CS),0,COLS-1))-1,dy=Math.min(0,sol-(c.y+Lb));ctx.save();ctx.translate(c.x,c.y+dy);ctx.rotate(up?-Math.PI/2:Math.PI/2);f(P,alpha);ctx.restore();return}
  f(c,alpha);if(c.malade&&typeof dessinPlus==='function')dessinPlus(c,ctx)}}
{const dt0=drawTiny;drawTiny=function(c){if(ANAT&&(DESSINS3[c.sp.id]||INSECTES_DESSINES.includes(c.sp.id))&&realLen(c)*camZ>=2.6){drawProfile(c,1,false);return}dt0(c)}}
if(typeof PLUS!=='undefined'){PLUS.phasme=PLUS.phasme||{};}

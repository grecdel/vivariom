// ================= ANATOMIE DES INSECTES (vue de côté) =================
// Même esprit que les araignées : corps en trois parties (tête, thorax, abdomen), 6 pattes articulées qui marchent
// en trépied, antennes propres à chaque groupe, et les détails qui font reconnaître l'espèce :
// fourmi (antennes coudées, mandibules, pétiole), coccinelle (élytres en dôme à points), mouche (gros yeux rouges, ailes
// nervurées), abeille (poils, rayures, corbeille à pollen), mante (prothorax dressé, tête triangulaire, pattes ravisseuses),
// coléoptères (élytres striés ; pelle du bousier, corne du rhinocéros), grillon (grandes pattes sauteuses, cerques).
const INSECTES_DESSINES=['fourmi','reine','coccinelle','mouche','abeille','mante','tenebrion','bousier','rhinoceros','grillon'];
function ell(x,y,rx,ry,rot,fill,trait,lw){ctx.beginPath();ctx.ellipse(x,y,Math.max(0.01,rx),Math.max(0.01,ry),rot||0,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(trait){ctx.strokeStyle=trait;ctx.lineWidth=lw;ctx.stroke()}}
function trait(pts,col,w){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}
// palette par espèce (variantes comprises)
function couleursIns(c){const id=c.sp.id,v=c.sp.vid||'',h=c.sp.h,s=c.sp.s,l=c.sp.l,base=hsl(h,s*0.75,Math.max(10,l*0.8)),fonce=hsl(h,s*0.6,Math.max(6,l*0.35));
  if(id==='fourmi'||id==='reine'){if(v.includes('noire'))return {tete:'#1d1a18',thorax:'#24201d',abdo:'#141210',patte:'#2a2522',fonce:'#000'};
    if(v.includes('moissonneuse'))return {tete:hsl(6,55,26),thorax:'#231816',abdo:'#161010',patte:'#2a1c18',fonce:'#000'};
    if(v.includes('atta'))return {tete:hsl(18,60,32),thorax:hsl(18,55,30),abdo:hsl(18,45,24),patte:hsl(18,45,30),fonce:hsl(18,50,12)};
    return {tete:hsl(12,60,32),thorax:hsl(12,60,34),abdo:'#2a1a14',patte:hsl(12,45,30),fonce:'#120a06'}}
  if(id==='coccinelle')return {elytre:hsl(h,s,l),point:'#111',pronotum:'#141414',blanc:'#f0ece0',patte:'#1a1a1a',fonce:'#000'};
  if(id==='mouche'){if(v.includes('drosophile'))return {corps:hsl(35,45,48),oeil:'#c42b1c',patte:'#3a2a1a',aile:'rgba(220,235,255,0.45)',fonce:'#2a1a0a'};return {corps:hsl(150,55,32),reflet:hsl(160,70,55),oeil:'#a8281c',patte:'#1a1a1a',aile:'rgba(220,235,255,0.45)',fonce:'#0a1a12'}}
  if(id==='abeille'){if(v.includes('bourdon'))return {thorax:'#1a1612',poil:'#e8c040',bandes:['#e8c040','#141210','#141210','#f4f0e8'],patte:'#141210',aile:'rgba(220,230,250,0.4)',fonce:'#000'};
    if(v.includes('syrphe'))return {thorax:hsl(40,40,22),poil:null,bandes:['#e8b830','#141210','#e8b830','#141210'],patte:'#5a4a20',aile:'rgba(220,230,250,0.4)',fonce:'#000'};
    return {thorax:hsl(35,40,30),poil:hsl(40,55,62),bandes:[hsl(40,75,48),'#1e1610',hsl(40,75,48),'#1e1610'],patte:'#2a1e14',aile:'rgba(220,230,250,0.4)',fonce:'#0a0602'}}
  if(id==='mante')return {corps:hsl(h,s*0.8,l),clair:hsl(h,s*0.7,Math.min(80,l+18)),fonce:hsl(h,s*0.8,Math.max(8,l-20)),oeil:hsl(h,40,70)};
  if(id==='grillon')return {corps:'#141210',aile:hsl(40,55,40),patte:'#1e1a16',fonce:'#000'};
  return {elytre:base,pronotum:fonce,patte:fonce,fonce:'#050403',reflet:hsl(h,s*0.4,Math.min(70,l+25))}}
// 6 pattes en trépied : 3 du côté visible, 3 de l'autre côté (plus sombres)
function pattes6(c,u,m,yG,ax,ay,P,col,colLoin,loin){const ph=(c.walkPh||0),mv=(c.v||0)>0.5&&!c.fly;
  for(let i=0;i<3;i++){const [at,pd,kh,w,arr]=P[i],p=ph*TAU*0.5+i*TAUP+(loin?TAUP:0),ps=mv?Math.sin(p):0,lift=mv?Math.max(0,Math.cos(p))*u*0.5:0;
    const x0=ax+m*u*at,y0=ay,fx=c.x+m*u*(pd+ps*0.7)+(loin?-m*u*0.3:0),fy=c.fly?ay+u*2.2:yG-lift,kx=x0+(fx-x0)*0.45+m*u*(arr?-0.6:0.4),ky=Math.min(y0,fy)-u*kh;
    const cc=loin?colLoin:col;ctx.globalAlpha*=loin?0.55:1;segPatte(x0,y0,kx,ky,u*w,u*w*0.85,cc);segPatte(kx,ky,fx,fy,u*w*0.75,u*w*0.35,cc);ctx.globalAlpha/=loin?0.55:1}}
function antennes(c,u,m,hx,hy,type,col,len){const wg=Math.sin(simT*5+c.phase*7)*0.15;ctx.lineCap='round';
  for(const loin of [true,false]){ctx.globalAlpha*=loin?0.5:1;const o=loin?-u*0.2:0;
    if(type==='coude'){const sx=hx+m*u*len*0.45,sy=hy-u*len*0.35+o;trait([[hx,hy+o],[sx,sy],[sx+m*u*len*0.55,sy+u*len*(0.1+wg)]],col,u*0.22)}
    else if(type==='massue'){const tx=hx+m*u*len*0.8,ty=hy-u*len*0.4+o;trait([[hx,hy+o],[tx,ty]],col,u*0.18);ell(tx,ty,u*0.35,u*0.25,0,col)}
    else if(type==='lame'){for(let q=0;q<3;q++)trait([[hx+m*u*0.6,hy-u*0.3+o+q*u*0.3],[hx+m*u*1.6,hy-u*0.8+o+q*u*0.45]],col,u*0.18)}
    else{ctx.beginPath();ctx.moveTo(hx,hy+o);ctx.quadraticCurveTo(hx+m*u*len*0.4,hy-u*len*(0.55+wg),hx+m*u*len,hy-u*len*(0.2+wg)+o);ctx.strokeStyle=col;ctx.lineWidth=u*0.16;ctx.stroke()}
    ctx.globalAlpha/=loin?0.5:1}}
function aile(x0,y0,x1,y1,larg,col,nerv,battre){ctx.save();const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);ctx.translate(x0,y0);ctx.rotate(a+(battre?Math.sin(simT*60)*0.6-0.4:0));
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(L/2,0,L/2,larg,0,0,TAU);ctx.fill();if(nerv){ctx.strokeStyle='rgba(60,50,40,0.5)';ctx.lineWidth=larg*0.08;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(L*0.95,-larg*0.2);ctx.moveTo(L*0.2,0);ctx.lineTo(L*0.7,larg*0.6);ctx.moveTo(L*0.35,-larg*0.1);ctx.lineTo(L*0.8,-larg*0.7);ctx.stroke()}ctx.restore()}

function insecteCote(c,alpha){const id=c.sp.id,L=realLen(c)*(typeof ech==='function'?ech(c):1),u=L/10,m=Math.cos(c.ang)>=0?1:-1,K=couleursIns(c),yG=c.y+CS*0.5;
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';
  if(id==='fourmi'||id==='reine'){const R=id==='reine',hb=u*1.8,y=yG-hb;
    pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*0.3,[[0.9,3.2,1.6,0.32],[0.2,0.4,1.8,0.32],[-0.4,-2.6,1.9,0.32,1]],K.patte,K.fonce,true);
    ell(c.x-m*u*3.4,y-u*0.2,u*(R?2.9:2.3),u*(R?2.0:1.6),-m*0.2,K.abdo,K.fonce,u*0.1);// gastre
    ell(c.x-m*u*1.3,y-u*0.1,u*0.45,u*0.65,0,K.thorax);// pétiole (nœud)
    ell(c.x+m*u*0.6,y,u*(R?2.1:1.6),u*(R?1.1:0.8),m*0.15,K.thorax,K.fonce,u*0.1);// thorax
    if(R){ctx.globalAlpha=alpha*0.4;aile(c.x+m*u*0.4,y-u*0.6,c.x-m*u*5,y-u*1.4,u*0.9,'rgba(230,230,240,0.6)',true);ctx.globalAlpha=alpha}
    const hx=c.x+m*u*2.9,hy=y-u*0.3;ell(hx,hy,u*1.2,u*1.0,0,K.tete,K.fonce,u*0.1);ell(hx+m*u*0.4,hy-u*0.3,u*0.28,u*0.22,0,'#050505');
    trait([[hx+m*u*1.0,hy+u*0.4],[hx+m*u*1.7,hy+u*0.6],[hx+m*u*1.4,hy+u*0.95]],K.fonce,u*0.3);// mandibule
    pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*0.3,[[0.9,3.2,1.6,0.32],[0.2,0.4,1.8,0.32],[-0.4,-2.6,1.9,0.32,1]],K.patte,K.fonce,false);
    antennes(c,u,m,hx+m*u*0.5,hy-u*0.6,'coude',K.patte,3.2)}
  else if(id==='coccinelle'){const hb=u*2.2,y=yG-hb;pattes6(c,u,m,yG,c.x,y+u*1.2,[[0.9,2.4,0.5,0.35],[0,0.2,0.6,0.35],[-0.9,-2,0.6,0.35]],K.patte,K.fonce,true);
    pattes6(c,u,m,yG,c.x,y+u*1.2,[[0.9,2.4,0.5,0.35],[0,0.2,0.6,0.35],[-0.9,-2,0.6,0.35]],K.patte,K.fonce,false);
    if(c.fly){aile(c.x,y-u*1.2,c.x-m*u*5,y-u*3.5,u*1.3,'rgba(220,225,235,0.5)',true,true);ctx.save();ctx.translate(c.x,y);ctx.rotate(-m*0.6);ctx.translate(-c.x,-y)}
    ctx.fillStyle=K.elytre;ctx.beginPath();ctx.ellipse(c.x-m*u*0.4,y+u*1.2,u*3.6,u*3.1,0,TAUP,TAU);ctx.closePath();ctx.fill();ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.12;ctx.stroke();
    const pts=(c.sp.vid||'').includes('2pts')?[[-0.4,-1.8]]:(c.sp.vid||'').includes('asiatique')?[[-2,-0.8],[-0.9,-2.1],[0.5,-1.4],[1.6,-0.6],[-0.4,-0.6],[-2.5,0.4]]:[[-2.1,-0.9],[-0.6,-2.2],[1.0,-1.2],[-0.8,-0.7]];
    for(const [dx,dy] of pts)ell(c.x-m*u*0.4+m*dx*u,y+u*1.2+dy*u,u*0.62,u*0.55,0,K.point);
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.ellipse(c.x-m*u*0.6,y-u*1.2,u*1.6,u*0.5,-m*0.2,0,TAU);ctx.fill();
    if(c.fly)ctx.restore();
    const px=c.x+m*u*3.0,py=y+u*0.7;ell(px,py,u*0.9,u*0.9,0,K.pronotum);ell(px+m*u*0.1,py-u*0.2,u*0.35,u*0.25,0,K.blanc);ell(px+m*u*0.9,py+u*0.3,u*0.6,u*0.55,0,K.pronotum);ell(px+m*u*1.15,py+u*0.1,u*0.2,u*0.2,0,K.blanc);
    antennes(c,u,m,px+m*u*1.2,py,'massue',K.patte,1.4)}
  else if(id==='mouche'){const hb=c.fly?u*2:u*2.4,y=yG-hb;pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*0.8,[[1,2.6,1.2,0.25],[0.4,0.4,1.3,0.25],[-0.2,-2.2,1.4,0.25,1]],K.patte,K.fonce,true);
    ell(c.x-m*u*2.4,y+u*0.2,u*2.4,u*1.6,-m*0.1,K.corps,K.fonce,u*0.1);if(K.reflet){ctx.globalAlpha=alpha*0.5;ell(c.x-m*u*2.5,y-u*0.6,u*1.3,u*0.4,0,K.reflet);ctx.globalAlpha=alpha}
    ell(c.x+m*u*0.6,y-u*0.2,u*1.8,u*1.6,0,K.corps,K.fonce,u*0.1);
    ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.1;ctx.beginPath();for(let q=0;q<7;q++){const a=-2.6+q*0.35,x=c.x+m*u*0.6+Math.cos(a)*u*1.6*m,yy=y-u*0.2+Math.sin(a)*u*1.6;ctx.moveTo(x,yy);ctx.lineTo(x+Math.cos(a)*u*0.6*m,yy+Math.sin(a)*u*0.6)}ctx.stroke();
    aile(c.x+m*u*0.3,y-u*1.2,c.x-m*u*(c.fly?3.5:5.2),y-u*(c.fly?3.5:1.6),u*1.3,K.aile,true,c.fly);
    const hx=c.x+m*u*2.8,hy=y-u*0.1;ell(hx,hy,u*1.25,u*1.35,0,K.fonce);ell(hx+m*u*0.15,hy-u*0.1,u*1.0,u*1.15,0,K.oeil);ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(hx+m*u*0.4,hy-u*0.6,u*0.25,0,TAU);ctx.fill();
    trait([[hx+m*u*0.6,hy+u*1.0],[hx+m*u*0.9,hy+u*1.9]],K.fonce,u*0.3);
    pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*0.8,[[1,2.6,1.2,0.25],[0.4,0.4,1.3,0.25],[-0.2,-2.2,1.4,0.25,1]],K.patte,K.fonce,false);
    antennes(c,u,m,hx+m*u*1.0,hy-u*0.6,'lame',K.fonce,1)}
  else if(id==='abeille'){const hb=c.fly?u*2:u*2.6,y=yG-hb;pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*1.0,[[1,2.8,1.1,0.28],[0.3,0.4,1.3,0.28],[-0.3,-2.6,1.4,0.34,1]],K.patte,K.fonce,true);
    const ax=c.x-m*u*2.6,ay=y+u*0.4;ell(ax,ay,u*2.6,u*1.9,-m*0.15,K.bandes[0],K.fonce,u*0.1);ctx.save();ctx.beginPath();ctx.ellipse(ax,ay,u*2.6,u*1.9,-m*0.15,0,TAU);ctx.clip();
    for(let q=0;q<4;q++){ctx.fillStyle=K.bandes[q%K.bandes.length];ctx.fillRect(ax-m*u*(-1.6+q*1.1)-u*0.55,ay-u*2.2,u*1.1,u*4.4)}ctx.restore();
    ell(c.x+m*u*0.4,y-u*0.1,u*1.7,u*1.6,0,K.thorax,K.fonce,u*0.1);
    if(K.poil){ctx.strokeStyle=K.poil;ctx.lineWidth=u*0.14;ctx.beginPath();for(let q=0;q<14;q++){const a=q/14*TAU,x=c.x+m*u*0.4+Math.cos(a)*u*1.6,yy=y-u*0.1+Math.sin(a)*u*1.5;ctx.moveTo(x,yy);ctx.lineTo(x+Math.cos(a)*u*0.5,yy+Math.sin(a)*u*0.5)}ctx.stroke()}
    aile(c.x+m*u*0.2,y-u*1.3,c.x-m*u*(c.fly?3.2:4.8),y-u*(c.fly?3.6:1.4),u*1.1,K.aile,true,c.fly);
    const hx=c.x+m*u*2.5,hy=y+u*0.1;ell(hx,hy,u*1.0,u*1.2,0,K.fonce);ell(hx+m*u*0.2,hy-u*0.3,u*0.45,u*0.75,0,'#1a1410');
    if(!(c.sp.vid||'').includes('syrphe')){ell(c.x-m*u*1.4,yG-u*1.4,u*0.55,u*0.45,0,'#f0b830')}// corbeille à pollen
    pattes6(c,u,m,yG,c.x+m*u*0.6,y+u*1.0,[[1,2.8,1.1,0.28],[0.3,0.4,1.3,0.28],[-0.3,-2.6,1.4,0.34,1]],K.patte,K.fonce,false);
    antennes(c,u,m,hx+m*u*0.7,hy-u*0.7,(c.sp.vid||'').includes('syrphe')?'lame':'coude',K.fonce,2.2)}
  else if(id==='mante'){const hb=u*1.4,y=yG-hb;// longue : unité plus petite
    pattes6(c,u,m,yG,c.x-m*u*0.8,y+u*0.3,[[0,0,0,0.01],[0,-0.6,1.6,0.16],[-0.6,-3.4,1.9,0.16,1]],K.fonce,K.fonce,true);
    ctx.fillStyle=K.clair;ctx.beginPath();ctx.ellipse(c.x-m*u*3.2,y-u*0.1,u*3.4,u*0.75,-m*0.05,0,TAU);ctx.fill();// abdomen
    ctx.fillStyle=K.corps;ctx.beginPath();ctx.ellipse(c.x-m*u*3.0,y-u*0.55,u*3.6,u*0.45,-m*0.05,0,TAU);ctx.fill();// ailes repliées
    pattes6(c,u,m,yG,c.x-m*u*0.8,y+u*0.3,[[0,0,0,0.01],[0,-0.6,1.6,0.16],[-0.6,-3.4,1.9,0.16,1]],K.corps,K.fonce,false);
    const t0x=c.x-m*u*0.4,t0y=y,t1x=c.x+m*u*1.8,t1y=y-u*2.4;trait([[t0x,t0y],[t1x,t1y]],K.corps,u*0.55);// prothorax dressé
    const hx=t1x+m*u*0.5,hy=t1y-u*0.4;ctx.fillStyle=K.corps;ctx.beginPath();ctx.moveTo(hx-m*u*0.5,hy-u*0.6);ctx.lineTo(hx+m*u*0.9,hy-u*0.4);ctx.lineTo(hx+m*u*0.5,hy+u*0.7);ctx.closePath();ctx.fill();
    ell(hx,hy-u*0.4,u*0.35,u*0.32,0,K.oeil);ell(hx+m*u*0.05,hy-u*0.4,u*0.1,u*0.1,0,'#222');
    // pattes ravisseuses repliées (fémur à épines, tibia replié), qui se déplient pour frapper
    const fr=c.frappe>0?Math.sin(Math.max(0,c.frappe)/0.45*TAUP):0,bx=t1x-m*u*0.2,by=t1y+u*0.4,kx=bx+m*u*(1.0+fr*1.6),ky=by+u*(1.4-fr*1.4),tx=kx-m*u*(0.9-fr*2.4),ty=ky-u*(1.2-fr*0.6);
    segPatte(bx,by,kx,ky,u*0.42,u*0.38,K.corps);segPatte(kx,ky,tx,ty,u*0.28,u*0.18,K.clair);ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.08;ctx.beginPath();for(let q=1;q<5;q++){const t=q/5,x=bx+(kx-bx)*t,yy=by+(ky-by)*t;ctx.moveTo(x,yy);ctx.lineTo(x+m*u*0.15,yy-u*0.25)}ctx.stroke();
    antennes(c,u,m,hx+m*u*0.6,hy-u*0.6,'fil',K.fonce,2.4)}
  else if(id==='grillon'){const hb=u*1.7,y=yG-hb;
    const saut=(sd)=>{const x0=c.x-m*u*1.2,y0=y+u*0.3,kx=c.x-m*u*3.6,ky=y-u*1.8,fx=c.x-m*u*4.6+sd*m*u*0.4,fy=yG;ctx.globalAlpha=alpha*(sd?0.5:1);segPatte(x0,y0,kx,ky,u*0.9,u*0.5,K.patte);segPatte(kx,ky,fx,fy,u*0.35,u*0.2,K.patte);ctx.globalAlpha=alpha};
    saut(1);pattes6(c,u,m,yG,c.x+m*u*0.8,y+u*0.5,[[0.6,2.2,0.9,0.28],[0,0.6,1.0,0.28],[-0.1,0.5,0,0.01]],K.patte,K.fonce,true);
    ell(c.x-m*u*2.0,y,u*3.0,u*1.4,-m*0.05,K.corps,'#4a443c',u*0.12);ctx.fillStyle=K.aile;ctx.beginPath();ctx.ellipse(c.x-m*u*1.6,y-u*0.7,u*2.6,u*0.6,-m*0.05,0,TAU);ctx.fill();
    trait([[c.x-m*u*4.8,y-u*0.2],[c.x-m*u*6.4,y-u*0.8]],K.fonce,u*0.18);trait([[c.x-m*u*4.8,y+u*0.2],[c.x-m*u*6.4,y+u*0.4]],K.fonce,u*0.18);// cerques
    ell(c.x+m*u*1.4,y-u*0.2,u*1.4,u*1.3,0,K.corps);const hx=c.x+m*u*2.9,hy=y-u*0.1;ell(hx,hy,u*1.1,u*1.15,0,K.corps);ell(hx+m*u*0.3,hy-u*0.4,u*0.3,u*0.3,0,'#3a3020');
    saut(0);pattes6(c,u,m,yG,c.x+m*u*0.8,y+u*0.5,[[0.6,2.2,0.9,0.28],[0,0.6,1.0,0.28],[-0.1,0.5,0,0.01]],K.patte,K.fonce,false);
    ctx.beginPath();ctx.moveTo(hx+m*u*0.8,hy-u*0.6);ctx.quadraticCurveTo(hx+m*u*4,hy-u*5,hx+m*u*6.5,hy-u*2+Math.sin(simT*4)*u*0.5);ctx.strokeStyle=K.fonce;ctx.lineWidth=u*0.1;ctx.stroke()}
  else{// coléoptères : ténébrion, bousier, rhinocéros
    const bous=id==='bousier',rhi=id==='rhinoceros',hb=u*(bous?1.8:1.6),y=yG-hb;
    const P=[[1.4,3.2,0.9,bous?0.5:0.3],[0.2,0.4,1.0,0.3],[-0.8,-2.6,1.1,0.3,1]];pattes6(c,u,m,yG,c.x,y+u*0.6,P,K.patte,K.fonce,true);
    ctx.fillStyle=K.elytre;ctx.beginPath();ctx.ellipse(c.x-m*u*1.2,y,u*3.4,u*(bous?2.3:1.8),0,TAUP,TAU);ctx.lineTo(c.x+m*u*2.2,y+u*0.6);ctx.lineTo(c.x-m*u*4.6,y+u*0.6);ctx.closePath();ctx.fill();ctx.strokeStyle=K.reflet;ctx.globalAlpha=alpha*0.7;ctx.lineWidth=u*0.14;ctx.stroke();ctx.globalAlpha=alpha;
    ctx.strokeStyle='rgba(0,0,0,0.45)';ctx.lineWidth=u*0.08;for(let q=1;q<4;q++){ctx.beginPath();ctx.ellipse(c.x-m*u*1.2,y,u*3.4*(1-q*0.18),u*(bous?2.3:1.8)*(1-q*0.18),0,TAUP+0.3,TAU-0.3);ctx.stroke()}// stries
    ctx.globalAlpha=alpha*0.4;ell(c.x-m*u*1.6,y-u*1.2,u*1.6,u*0.35,0,K.reflet);ctx.globalAlpha=alpha;
    const px=c.x+m*u*2.6,py=y-u*0.1;ell(px,py,u*1.3,u*(rhi?1.5:1.1),0,K.pronotum,K.reflet,u*0.1);
    const hx=px+m*u*1.4,hy=py+u*0.3;ell(hx,hy,u*0.8,u*0.7,0,K.pronotum);
    if(bous){ctx.fillStyle=K.pronotum;ctx.beginPath();ctx.moveTo(hx,hy-u*0.6);ctx.lineTo(hx+m*u*1.4,hy-u*0.2);ctx.lineTo(hx+m*u*1.2,hy+u*0.5);ctx.lineTo(hx,hy+u*0.6);ctx.fill();for(let q=0;q<4;q++)trait([[hx+m*u*1.3,hy-u*0.2+q*u*0.2],[hx+m*u*1.6,hy-u*0.25+q*u*0.2]],K.pronotum,u*0.12)}
    if(rhi){ctx.fillStyle=K.pronotum;ctx.beginPath();ctx.moveTo(hx+m*u*0.2,hy-u*0.5);ctx.quadraticCurveTo(hx+m*u*1.4,hy-u*1.2,hx+m*u*0.9,hy-u*3.0);ctx.quadraticCurveTo(hx+m*u*0.6,hy-u*1.4,hx-m*u*0.3,hy-u*0.4);ctx.fill();ctx.strokeStyle=K.reflet;ctx.lineWidth=u*0.1;ctx.stroke()}
    pattes6(c,u,m,yG,c.x,y+u*0.6,P,K.patte,K.fonce,false);
    antennes(c,u,m,hx+m*u*0.5,hy-u*0.2,id==='tenebrion'?'fil':'massue',K.patte,id==='tenebrion'?1.8:1.0)}
  ctx.restore()}
{const dp=drawProfile;drawProfile=function(c,alpha,gray){if(gray||!ANAT||!INSECTES_DESSINES.includes(c.sp.id)||c.stade||c.state==='caught'){dp(c,alpha,gray);return}
  // sur une tige (mante) : même dessin, tourné le long de la tige, tête vers le haut ou vers le bas
  if(typeof onStem==='function'&&onStem(c)){if(c.sp.id!=='mante'){dp(c,alpha,gray);return}const P=Object.create(c);P.x=0;P.y=-CS*0.5;P.ang=0;P.v=0;const up=Math.sin(c.ang)<=0.2;
    const Lb=realLen(c)*(typeof ech==='function'?ech(c):1)*0.6,sol=surfY(clamp(Math.floor(c.x/CS),0,COLS-1))-1,dy=Math.min(0,sol-(c.y+Lb));ctx.save();ctx.translate(c.x,c.y+dy);ctx.rotate(up?-Math.PI/2:Math.PI/2);insecteCote(P,alpha);ctx.restore();return}
  if(c.sp.id==='bousier'&&c.ball&&c.state==='roll'){dp(c,alpha,gray);return}
  insecteCote(c,alpha);if(c.malade&&typeof dessinPlus==='function')dessinPlus(c,ctx)}}

// ---------- échelles : décors et plantes à la bonne taille par rapport aux bêtes ----------
// (une pierre plate de 3,5 cm était plus petite qu'une mygale) : tailles réelles en mm, CS = 2,5 mm par case.
Object.assign(DECOS.pierre,{w:24});Object.assign(DECOS.pot,{w:24});Object.assign(DECOS.liege,{w:36});Object.assign(DECOS.volcan,{w:22});Object.assign(DECOS.branche,{w:44});Object.assign(DECOS.tronc,{w:16});
PLANTS.fougere.h=[40,80];PLANTS.gramin.h=[50,90];
{const pd=placeDeco;placeDeco=function(type,i){const r=pd(type,i);if(r&&type==='tronc'){const d=decos[decos.length-1];if(d&&d.type==='tronc'){d.h=rnd(100,140);decoSettle()}}return r}}
// les grandes bêtes dans un petit bac : un conseil
const GRANDES={mygale:'un grand bac (90 cm) ou le standard',solifuge:'le standard ou le grand bac',scorpion:'le standard ou le grand bac',grenouille:'le standard avec une mare',rhinoceros:'le standard ou le grand bac'};
{const ta=tapAction;let dit={};tapAction=function(x,y){ta(x,y);if(!lvl||!lvl.sandbox||!(FMT==='cube'||FMT==='fourmi'))return;const v=String(tool||''),k=v.includes('mygale')?'mygale':baseOf(v);
  if(GRANDES[k]&&!dit[k]){dit[k]=1;say(`📏 Une ${k==='mygale'?'mygale':FICHES[k]?FICHES[k].nom.toLowerCase():k} est grande pour ce petit bac : choisis plutôt ${GRANDES[k]}.`)}}}

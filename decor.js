// ================= DÉCORATIONS =================
// chaque élément a un effet : abri, humidité retenue, support d'escalade, point d'eau
const DECOS={
  pierre:{ic:'🪨',nom:'Pierre plate',w:14,txt:"Abri pour cloportes et scolopendres ; le sol dessous reste humide."},
  branche:{ic:'🪵',nom:'Bois flotté',w:28,txt:"Support d'escalade : les bêtes grimpent dessus."},
  tronc:{ic:'🌳',nom:'Tronc creux',w:10,txt:"Grand support vertical et abri."},
  mousse:{ic:'🌿',nom:'Mousse',w:20,txt:"Garde l'humidité du sol et le nourrit un peu."},
  pot:{ic:'🏺',nom:'Pot cassé',w:16,txt:"L'abri préféré des cloportes."},
  mare:{ic:'💧',nom:'Petite mare',w:22,txt:"Point d'eau : humidifie le sol autour en continu."},
  liege:{ic:'🟫',nom:'Écorce de liège',w:24,txt:"Arche d'écorce : abri dessous, escalade dessus. Garde l'humidité."},
  volcan:{ic:'🌑',nom:'Roche volcanique',w:16,txt:"Pierre noire poreuse : garde la chaleur et l'humidité, abri."},
  coquille:{ic:'🐚',nom:"Coquille d'escargot",w:8,txt:"Minuscule abri, et du calcaire pour le sol."},
  champi:{ic:'🍄',nom:'Champignons',w:10,txt:"Poussent sur le sol humide et se décomposent en litière."},
};
let decos=[],SUP=null,EVF=null,PLACE_DZ=-1;
function decoReset(){DEPTH_MM=ZD;decos=[];SUP=new Uint8Array(N);EVF=new Float32Array(COLS).fill(1)}
function supLine(x0,y0,x1,y1,th){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/(CS*0.5));for(let s=0;s<=n;s++){const x=x0+(x1-x0)*s/n,y=y0+(y1-y0)*s/n;for(let t=-th;t<=th;t+=CS*0.5){const k=cellOf(x,y+t);if(!T[k])SUP[k]=1}}}
function placeDeco(type,i){
  const D=DECOS[type],half=Math.round(D.w/2);i=clamp(i,half+1,COLS-half-2);
  const dz=Math.min(PLACE_DZ>=0?PLACE_DZ:rnd(0,ZD*0.6),Math.max(0,ZD-D.w*CS*0.6));
  if(decos.some(d=>d.type!=='branche'&&type!=='branche'&&Math.abs(d.i-i)<(DECOS[d.type].w+D.w)/2*0.8&&Math.abs((d.dz||0)-dz)<(DECOS[d.type].w+D.w)*CS*0.35)){say('Trop près d\'un autre élément de décor',true);return false}
  const d={type,i,dz,w:D.w,seed:Math.random(),dir:Math.random()<0.5?-1:1};
  if(type==='tronc')d.h=rnd(55,75);
  decos.push(d);
  if(type==='pierre'||type==='pot'||type==='mousse'||type==='liege'||type==='volcan'){for(let q=i-half;q<=i+half;q++)EVF[q]=Math.min(EVF[q],type==='mousse'?0.45:0.3);if(type==='mousse')addNut(i,SURF[i],0.4)}
  decoSettle();soilDirty=true;return true;
}
// ----- physique : chaque objet repose sur ce qu'il y a dessous -----
// hauteur du dessus d'un objet posé (pierre, pot, tronc) à l'abscisse x, ou null
function decoTop(d,x){const W2=d.w*CS/2,dx=x-d.cx;if(Math.abs(dx)>W2)return null;
  if(d.type==='pierre'||d.type==='volcan'||d.type==='coquille'||d.type==='liege')return d.by-d.hh*Math.sqrt(Math.max(0,1-(dx/W2)**2));
  if(d.type==='pot')return d.by-d.hh*Math.min(1,1.6*Math.sqrt(Math.max(0,1-(dx/W2)**2)));
  if(d.type==='tronc')return d.by-d.h;return null}
function groundAt(x,skip){const z0=skip?skip.dz||0:0;let y=surfY(Math.floor(x/CS));for(const o of decos)if(o!==skip&&o.type!=='branche'&&o.by!=null&&Math.abs((o.dz||0)-z0)<o.w*CS*0.5){const t=decoTop(o,x);if(t!=null)y=Math.min(y,t)}return y}
function settleBody(d){const W2=d.w*CS/2,x=d.i*CS+CS/2;d.cx=x;
  // posé sur le sol : il s'enfonce un peu et prend la pente du terrain
  const yl=surfY(Math.floor((x-W2*0.8)/CS)),yr=surfY(Math.floor((x+W2*0.8)/CS)),ym=surfY(d.i);
  d.by=Math.max(Math.min(yl,yr,ym)+(d.type==='tronc'?2:1.2),(yl+yr+ym)/3);d.ang=clamp(Math.atan2(yr-yl,W2*1.6),-0.35,0.35);
  d.hh=d.type==='pierre'?d.w*CS*(0.26+d.seed*0.1):d.type==='volcan'?d.w*CS*(0.4+d.seed*0.1):d.type==='liege'?d.w*CS*0.42:d.type==='coquille'?d.w*CS*0.55:d.type==='pot'?d.w*CS*0.4:0}
function settleBranch(d){const L=d.w*CS,R=3.2,xc=d.i*CS+CS/2;let ang=0;
  for(let it=0;it<3;it++){const half=L/2*Math.cos(ang),x0=Math.max(1,xc-half),x1=Math.min(WW-1,xc+half);
    // enveloppe convexe des points d'appui (sol + objets) sous la branche
    const P=[];for(let x=x0;x<=x1+0.01;x+=CS/2)P.push([x,groundAt(x,d)]);
    const H=[];for(const p of P){while(H.length>=2){const a=H[H.length-2],b=H[H.length-1];if((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])<=0)H.pop();else break}H.push(p)}
    let e=0;while(e<H.length-2&&H[e+1][0]<xc)e++;const A=H[e],B=H[Math.min(e+1,H.length-1)];
    ang=B[0]>A[0]?Math.atan2(B[1]-A[1],B[0]-A[0]):0;ang=clamp(ang,-0.9,0.9);
    const yc=A[1]+(B[0]>A[0]?(xc-A[0])/(B[0]-A[0])*(B[1]-A[1]):0);d.x0=xc-Math.cos(ang)*L/2;d.x1=xc+Math.cos(ang)*L/2;d.y0=yc-Math.sin(ang)*L/2-R;d.y1=yc+Math.sin(ang)*L/2-R}
  d.ang=ang;d.R=R}
function decoSettle(){if(!SUP)return;for(const d of decos)if(d.type!=='branche')settleBody(d);for(const d of decos)if(d.type==='branche')settleBranch(d);
  SUP.fill(0);
  for(const d of decos){const W2=d.w*CS/2;
    if(d.type==='branche')supLine(d.x0,d.y0-d.R,d.x1,d.y1-d.R,1);
    if(d.type==='pierre'||d.type==='pot'||d.type==='volcan'||d.type==='liege'){let px=d.cx-W2,py=decoTop(d,px)??d.by;for(let x=d.cx-W2+CS/2;x<=d.cx+W2;x+=CS/2){const y=decoTop(d,x)??d.by;supLine(px,py-1,x,y-1,0.5);px=x;py=y}}
    if(d.type==='tronc'){supLine(d.cx-W2-1,d.by,d.cx-W2-1,d.by-d.h,0.5);supLine(d.cx+W2+1,d.by,d.cx+W2+1,d.by-d.h,0.5);supLine(d.cx-W2,d.by-d.h-1,d.cx+W2,d.by-d.h-1,0.5)}}}
let decoClock=0;
function decoHydro(dt){for(const d of decos)if(d.type==='champi'){d.age=(d.age||0)+dt;d.lt=(d.lt||0)+dt;if(d.lt>35){d.lt=0;const k=K(d.i,Math.min(ROWS-1,SURF[d.i]));if(WET[k]>0.3)groundItem('litiere',d.i+Math.round(rnd(-3,3)),{val:1,z:(d.dz||0)+rnd(0,8)})}}decoClock+=dt;if(decoClock>1){decoClock=0;decoSettle();mossTick(1)}for(const d of decos)if(d.type==='mare'){const half=Math.round(d.w/2);for(let q=d.i-half-4;q<=d.i+half+4;q++){if(q<0||q>=COLS)continue;for(let r=0;r<10;r++){const k=K(q,SURF[q]+r);if(T[k]&&T[k]!==5)WET[k]=Math.min(0.88,WET[k]+0.02*dt*(1-r/10))}}}}
const shZ=d=>(d.dz||0)+d.w*CS*0.3;
function shelterAt(c){const i=Math.floor(c.x/CS);for(const d of decos)if((d.type==='pierre'||d.type==='pot'||d.type==='tronc'||d.type==='liege'||d.type==='volcan'||d.type==='coquille')&&Math.abs(d.i-i)<=d.w/2+1&&Math.abs((c.z||0)-shZ(d))<d.w*CS*0.5&&c.y>surfY(i)-CS*3)return d;return null}
function nearestShelter(c,max=150){let b=null,bd=max;for(const d of decos){if(!['pierre','pot','tronc','liege','volcan','coquille'].includes(d.type))continue;const dd=Math.hypot(d.i*CS-c.x,shZ(d)-(c.z||0));if(dd<bd){bd=dd;b=d}}return b}
// ----- rendu en coupe (coordonnées monde, mm), en volume, éclairé d'en haut à gauche -----
function rough(n,seed,amp){const a=[];for(let q=0;q<n;q++)a.push(1+amp*Math.sin(q*2.7+seed*31)*Math.cos(q*1.3+seed*17));return a}
let SHB=null;function shadowBlob(){if(!SHB){SHB=document.createElement('canvas');SHB.width=SHB.height=64;const g=SHB.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}return SHB}
function contactShadow(x,y,rx,a=0.4){if(DECO_BACK)return;const ry=Math.max(1.5,rx*0.14),ga=ctx.globalAlpha;ctx.globalAlpha=ga*a;ctx.drawImage(shadowBlob(),x-rx,y-ry,rx*2,ry*2);ctx.globalAlpha=ga}
// en vue 3/4, chaque objet a une profondeur : on l'extrude du fond vers la vitre
let DEPTH_MM=ZD;let DECO_BACK=false,OXY=[0,0];
function setOXY(){let ox=0,oy=0;if(view==='ens'&&ensE>0.05){const R=ensRect(ensE),z=R.w/WW;ox=R.dx/z;oy=R.dy/z}OXY=[ox,oy]}
// décale le dessin selon la profondeur z (uniquement en vue 3/4)
function zT(z){if(z&&(OXY[0]||OXY[1])){const f=z/DEPTH_MM;ctx.translate(OXY[0]*f,OXY[1]*f)}}
function zP(x,y,z){const f=(z||0)/DEPTH_MM;return [x+OXY[0]*f,y+OXY[1]*f]}
// en 3/4 : chaque objet est dessiné une seule fois dans un tampon, puis répété pour donner l'épaisseur
const SPR=new Map(),SPX_D=4;
function decoBox(d){const W2=d.w*CS/2,x=d.cx??(d.i*CS+CS/2),y=d.by??surfY(d.i);
  if(d.type==='branche'){const R=d.R||3.2,gy=groundAt((d.x0+d.x1)/2,d);return [Math.min(d.x0,d.x1)-14,Math.min(d.y0,d.y1)-R*4-8,Math.max(d.x0,d.x1)+14,Math.max(d.y0,d.y1,gy)+R+8]}
  if(d.type==='tronc')return [x-W2*1.7-4,y-d.h-W2*0.5-6,x+W2*1.7+6,y+W2*0.5+6];
  if(d.type==='mousse'||d.type==='champi')return [x-W2-6,y-16,x+W2+6,y+5];
  const hh=d.hh||W2;return [x-W2*1.25-6,y-hh*1.4-6,x+W2*1.25+8,y+6]}
function decoSprite(d){const key=[d.type,d.ang,d.by,d.x0,d.y0,d.x1,d.y1,d.hh,d.h,Math.round((d.moss||0)*8),d.type==='champi'?Math.round(Math.min(1,(d.age||40)/40)*5):0].map(v=>v==null?'':(+v).toFixed?(+v).toFixed(1):v).join('|');
  let e=SPR.get(d);if(e&&e.key===key)return e;
  const b=decoBox(d),w=Math.ceil((b[2]-b[0])*SPX_D),h=Math.ceil((b[3]-b[1])*SPX_D);
  const mk=(back)=>{const cv=document.createElement('canvas');cv.width=Math.max(1,w);cv.height=Math.max(1,h);const g=cv.getContext('2d');g.setTransform(SPX_D,0,0,SPX_D,-b[0]*SPX_D,-b[1]*SPX_D);
    const keep=ctx,ox=OXY;ctx=g;OXY=[0,0];try{drawDeco(d,back,0)}finally{ctx=keep;OXY=ox}
    if(back){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(0,0,0,0.28)';g.fillRect(0,0,w,h)}return cv};
  const front=mk(false),back=mk(true);
  const shade=document.createElement('canvas');shade.width=back.width;shade.height=back.height;const sg=shade.getContext('2d');sg.drawImage(back,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle='#000';sg.fillRect(0,0,w,h);
  e={key,b,front,back,shade};SPR.set(d,e);return e}
function drawDecos(){
  const ox=OXY[0],oy=OXY[1],ens=!!(ox||oy);
  if(SPR.size>decos.length+4)for(const k of SPR.keys())if(!decos.includes(k))SPR.delete(k);
  const list=ens?decos.slice().sort((a,b)=>(b.dz||0)-(a.dz||0)):decos;
  for(const d of list){if(d.by==null&&d.type!=='branche')settleBody(d);if(d.type==='branche'&&d.x0==null)settleBranch(d);
    if(!ens||d.type==='mare'){ctx.save();if(ens)zT(d.dz);drawDeco(d,false,0);ctx.restore();continue}
    const f0=(d.dz||0)/DEPTH_MM,e=decoSprite(d),[x0,y0,x1,y1]=e.b,bw=x1-x0,bh=y1-y0;
    const dep={pierre:d.w*CS*0.7,pot:d.hh,mousse:d.w*CS*0.8,branche:7,tronc:0,liege:d.w*CS*0.6,volcan:d.w*CS*0.7,coquille:d.w*CS*0.5,champi:6}[d.type]||0,n=Math.min(8,Math.ceil(dep/3));
    for(let q=n;q>=1;q--){const f=Math.min(1,f0+q/n*dep/DEPTH_MM),jx=d.type==='mousse'?Math.sin(q*2.3+d.seed*9)*4:0;ctx.drawImage(e.back,x0+ox*f+jx,y0+oy*f,bw,bh)}
    ctx.drawImage(e.front,x0+ox*f0,y0+oy*f0,bw,bh);
    if(f0>0.03){ctx.globalAlpha=0.4*f0;ctx.drawImage(e.shade,x0+ox*f0,y0+oy*f0,bw,bh);ctx.globalAlpha=1}}
}
function mossBlob(x,y,r,sd){ctx.fillStyle=hsl(100+(sd*37%25),48,20+(sd*13%10));ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle=hsl(95,60,38);ctx.beginPath();ctx.arc(x-r*0.3,y-r*0.35,r*0.45,0,TAU);ctx.fill()}
function drawDeco(d,back,bf){DECO_BACK=back;const mq=Math.round((d.moss||0)*8)/8;{
    const D=DECOS[d.type],x=d.cx??(d.i*CS+CS/2),w=D.w*CS,W2=w/2,sy=d.by??surfY(d.i);
    ctx.save();
    if(d.type==='pierre'){const hh=d.hh;contactShadow(x+2,sy,W2*1.15,0.5);ctx.translate(x,sy);ctx.rotate(d.ang||0);
      const rr=rough(14,d.seed,0.08);ctx.beginPath();for(let q=0;q<=14;q++){const t=Math.PI+q/14*Math.PI,r=rr[q%14];ctx.lineTo(Math.cos(t)*W2*r,Math.sin(t)*hh*r)}ctx.lineTo(W2,2);ctx.lineTo(-W2,2);ctx.closePath();
      const g=ctx.createRadialGradient(-W2*0.35,-hh*0.8,1,0,-hh*0.2,W2*1.2);g.addColorStop(0,'#c9ccd0');g.addColorStop(0.45,'#7d838a');g.addColorStop(1,'#2e3236');ctx.fillStyle=g;ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=0.4;ctx.stroke();ctx.clip();
      ctx.fillStyle='rgba(255,255,255,0.12)';for(let q=0;q<18;q++){const px=((q*7.1+d.seed*40)%(w))-W2,py=-((q*3.3)%hh);ctx.fillRect(px,py,0.6,0.6)}
      ctx.fillStyle='rgba(0,0,0,0.15)';for(let q=0;q<10;q++){const px=((q*5.3+d.seed*20)%(w))-W2,py=-((q*4.1)%hh);ctx.fillRect(px,py,0.8,0.5)}
      ctx.fillStyle=lin2(0,-hh*0.3,0,2,[[0,'rgba(0,0,0,0)'],[1,'rgba(30,20,10,0.45)']]);ctx.fillRect(-W2,-hh,w,hh+3);
      for(let q=0;q<Math.round(mq*16);q++){const t=Math.PI*(1.08+0.84*((q*0.618+d.seed)%1));mossBlob(Math.cos(t)*W2*0.88,Math.sin(t)*hh*0.92+1,1.3+((q*7)%3)*0.5,q+d.seed*9)}}
    if(d.type==='pot'){const R=d.hh/1.85;contactShadow(x+2,sy,W2*1.1,0.5);ctx.translate(x,sy-R*0.85);ctx.rotate(d.ang||0);const s=d.dir;
      // pot couché : corps conique, ouverture tournée sur le côté
      ctx.beginPath();ctx.moveTo(-s*W2,-R*0.7);ctx.lineTo(s*W2*0.75,-R);ctx.lineTo(s*W2*0.75,R);ctx.lineTo(-s*W2,R*0.7);ctx.closePath();
      ctx.fillStyle=lin2(0,-R,0,R,[[0,'#d98a5c'],[0.35,'#b05a32'],[1,'#4a2010']]);ctx.fill();
      ctx.strokeStyle='rgba(255,200,160,0.35)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(-s*W2,-R*0.55);ctx.lineTo(s*W2*0.75,-R*0.8);ctx.stroke();
      // ouverture (ellipse sombre) avec bord cassé
      ctx.fillStyle='#2a1208';ctx.beginPath();ctx.ellipse(s*W2*0.75,0,R*0.32,R,0,0,TAU);ctx.fill();
      ctx.fillStyle='#120804';ctx.beginPath();ctx.ellipse(s*W2*0.78,R*0.1,R*0.22,R*0.8,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#e09a6a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(s*W2*0.75,0,R*0.32,R,0,Math.PI*0.5,Math.PI*1.4);ctx.stroke();
      ctx.fillStyle='#0c0a09';ctx.beginPath();ctx.moveTo(s*W2*0.4,-R*0.95);ctx.lineTo(s*W2*0.55,-R*0.55);ctx.lineTo(s*W2*0.62,-R*0.75);ctx.lineTo(s*W2*0.78,-R*0.4);ctx.lineTo(s*W2*0.9,-R*1.1);ctx.closePath();ctx.globalCompositeOperation='destination-out';ctx.fill();ctx.globalCompositeOperation='source-over';
      for(let q=0;q<Math.round(mq*10);q++){const f=((q*0.618+d.seed)%1)*1.5-0.75;mossBlob(-s*W2*0.1+f*W2,-R*(0.85-0.15*f*s),1.4,q+d.seed*5)}}
    if(d.type==='mousse'){contactShadow(x,sy,W2,0.3);const rr=rough(9,d.seed,0.35);
      for(let q=0;q<9;q++){const bx=x-W2+w*(q+0.5)/9,r=2.2*rr[q]+1;const g=ctx.createRadialGradient(bx-r*0.4,sy-r*0.9,0.2,bx,sy-r*0.3,r*1.2);g.addColorStop(0,hsl(95,60,48));g.addColorStop(0.6,hsl(108,55,26));g.addColorStop(1,hsl(120,50,12));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(bx,sy+0.5,r*1.1,r,0,Math.PI,TAU);ctx.fill()}
      ctx.strokeStyle=hsl(60,55,45);ctx.lineWidth=0.25;for(let q=0;q<10;q++){const bx=x-W2+((q*7.3+d.seed*13)%w),hh=3+(q%3);ctx.beginPath();ctx.moveTo(bx,sy-2);ctx.lineTo(bx+0.4,sy-2-hh);ctx.stroke();ctx.fillStyle='#8a5a2a';ctx.fillRect(bx,sy-2.6-hh,0.9,1.2)}}
    if(d.type==='mare'&&OXY[0]){const f=W2*0.9/DEPTH_MM,cx=x+OXY[0]*f,cy=sy+OXY[1]*f,ry=Math.abs(OXY[1])*W2*0.85/DEPTH_MM;
      const g=ctx.createRadialGradient(cx-W2*0.3,cy-ry*0.3,1,cx,cy,W2);g.addColorStop(0,'rgba(120,190,245,0.9)');g.addColorStop(1,'rgba(20,60,120,0.95)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,W2,ry,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(220,240,255,0.7)';ctx.lineWidth=0.5;const r=(simT*6+d.seed*20)%10;ctx.globalAlpha=1-r/10;ctx.beginPath();ctx.ellipse(cx+W2*0.2,cy,r*1.2,r*1.2*ry/W2,0,0,TAU);ctx.stroke();ctx.globalAlpha=1;
      for(let q=0;q<14;q++){const a=q/14*TAU,px=cx+Math.cos(a)*(W2+1.8),py=cy+Math.sin(a)*(ry+1.2),g2=ctx.createRadialGradient(px-0.8,py-1.5,0.2,px,py-0.5,2.4);g2.addColorStop(0,'#c0c4c8');g2.addColorStop(1,'#3a3e42');ctx.fillStyle=g2;ctx.beginPath();ctx.ellipse(px,py,2.2+(q%3)*0.4,1.6,0,0,TAU);ctx.fill()}}
    else if(d.type==='mare'){const g=ctx.createLinearGradient(0,sy,0,sy+6);g.addColorStop(0,'rgba(80,160,230,0.85)');g.addColorStop(1,'rgba(10,40,90,0.9)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-W2,sy+0.5);ctx.quadraticCurveTo(x,sy+12,x+W2,sy+0.5);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(200,235,255,0.9)';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x-W2,sy+0.5);ctx.lineTo(x+W2,sy+0.5);ctx.stroke();
      const r=(simT*6+d.seed*20)%10;ctx.globalAlpha=1-r/10;ctx.beginPath();ctx.ellipse(x+W2*0.3,sy+0.5,r*0.8,r*0.12,0,0,TAU);ctx.stroke();ctx.globalAlpha=1;
      for(const s of [-1,1]){const px=x+s*(W2+1.5),g2=ctx.createRadialGradient(px-1,sy-2.2,0.2,px,sy-1,3.2);g2.addColorStop(0,'#c0c4c8');g2.addColorStop(1,'#3a3e42');ctx.fillStyle=g2;ctx.beginPath();ctx.ellipse(px,sy+0.5,3.2,2.6,0,Math.PI,TAU);ctx.fill()}}
    if(d.type==='branche'){const L=Math.hypot(d.x1-d.x0,d.y1-d.y0),R=d.R||3.2,mx=(d.x0+d.x1)/2,my=(d.y0+d.y1)/2,th=d.dir;
      contactShadow(mx+2,groundAt(mx,d)+0.5,L*0.5,0.45);
      ctx.translate(mx,my);ctx.rotate(Math.atan2(d.y1-d.y0,d.x1-d.x0));
      const rad=t=>R*(th>0?(1.15-0.45*t):(0.7+0.45*t))*(1+0.12*Math.sin(t*11+d.seed*9));
      // corps torsadé du bois flotté
      ctx.beginPath();for(let q=0;q<=24;q++){const t=q/24;ctx.lineTo(-L/2+t*L,-rad(t))}for(let q=24;q>=0;q--){const t=q/24;ctx.lineTo(-L/2+t*L,rad(t))}ctx.closePath();
      ctx.fillStyle=lin2(0,-R*1.2,0,R*1.2,[[0,'#e2d6c2'],[0.3,'#b3a48c'],[0.75,'#6e604e'],[1,'#3a3128']]);ctx.fill();
      ctx.strokeStyle='rgba(60,45,30,0.55)';ctx.lineWidth=0.3;for(let k=-2;k<=2;k++){ctx.beginPath();for(let q=0;q<=24;q++){const t=q/24;ctx.lineTo(-L/2+t*L,rad(t)*(k*0.35+0.12*Math.sin(t*14+k+d.seed*5)))}ctx.stroke()}
      // nœud et départ de branche
      const kt=0.62,kx=-L/2+kt*L;ctx.fillStyle=lin2(0,-R*3,0,0,[[0,'#cfc2ac'],[1,'#5e5142']]);ctx.beginPath();ctx.moveTo(kx-1.6,-rad(kt)*0.7);ctx.lineTo(kx+th*5,-R*3.6);ctx.lineTo(kx+th*5+1.4,-R*3.4);ctx.lineTo(kx+1.6,-rad(kt)*0.7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3a2e22';ctx.beginPath();ctx.ellipse(-L/2+0.3*L,-rad(0.3)*0.1,1.4,0.9,0,0,TAU);ctx.fill();
      // bout scié : cernes
      const ex=th>0?-L/2:L/2,er=rad(th>0?0:1);ctx.fillStyle='#cdb894';ctx.beginPath();ctx.ellipse(ex,0,er*0.32,er,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(110,80,50,0.7)';ctx.lineWidth=0.25;for(const f of [0.35,0.65,0.9]){ctx.beginPath();ctx.ellipse(ex,0,er*0.32*f,er*f,0,0,TAU);ctx.stroke()}
      for(let q=0;q<Math.round(mq*14);q++){const t=(q*0.618+d.seed)%1;mossBlob(-L/2+t*L,-rad(t)*0.8,1.2+((q*5)%3)*0.4,q+d.seed*3)}}
    if(d.type==='volcan'){const hh=d.hh;contactShadow(x+2,sy,W2*1.15,0.5);ctx.translate(x,sy);ctx.rotate(d.ang||0);
      const rr=rough(16,d.seed,0.14);ctx.beginPath();for(let q=0;q<=16;q++){const t=Math.PI+q/16*Math.PI,r=rr[q%16];ctx.lineTo(Math.cos(t)*W2*r,Math.sin(t)*hh*r)}ctx.lineTo(W2,2);ctx.lineTo(-W2,2);ctx.closePath();
      const g=ctx.createRadialGradient(-W2*0.3,-hh*0.8,1,0,-hh*0.2,W2*1.2);g.addColorStop(0,'#6a625c');g.addColorStop(0.5,'#2c2826');g.addColorStop(1,'#0e0c0b');ctx.fillStyle=g;ctx.fill();ctx.save();ctx.clip();
      for(let q=0;q<26;q++){const px=((q*7.7+d.seed*50)%w)-W2,py=-((q*3.1+d.seed*9)%hh);ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.arc(px,py,0.5+(q%3)*0.35,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,150,90,0.12)';ctx.fillRect(px-0.4,py-0.9,0.8,0.4)}
      for(let q=0;q<Math.round(mq*12);q++){const t=Math.PI*(1.1+0.8*((q*0.618+d.seed)%1));mossBlob(Math.cos(t)*W2*0.85,Math.sin(t)*hh*0.9+1,1.2,q)}ctx.restore()}
    if(d.type==='liege'){const hh=d.hh;contactShadow(x+2,sy,W2*1.1,0.45);ctx.translate(x,sy);ctx.rotate(d.ang||0);
      ctx.beginPath();ctx.ellipse(0,0,W2,hh,0,Math.PI,TAU);ctx.ellipse(0,0,W2*0.78,hh*0.7,0,TAU,Math.PI,true);ctx.closePath();
      ctx.fillStyle=lin2(0,-hh,0,0,[[0,'#8a6440'],[0.5,'#5a3c22'],[1,'#2a1a0e']]);ctx.fill();
      ctx.fillStyle='#0b0704';ctx.beginPath();ctx.ellipse(0,0,W2*0.78,hh*0.7,0,Math.PI,TAU);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(20,12,6,0.8)';ctx.lineWidth=0.6;for(let q=0;q<9;q++){const t=Math.PI*(1.08+q*0.1);ctx.beginPath();ctx.moveTo(Math.cos(t)*W2*0.8,Math.sin(t)*hh*0.72);ctx.lineTo(Math.cos(t+0.05)*W2,Math.sin(t+0.05)*hh);ctx.stroke()}
      ctx.strokeStyle='rgba(220,180,130,0.35)';ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(0,0,W2,hh,0,Math.PI*1.15,Math.PI*1.6);ctx.stroke();
      for(let q=0;q<Math.round(mq*14);q++){const t=Math.PI*(1.05+0.9*((q*0.618+d.seed)%1));mossBlob(Math.cos(t)*W2*0.95,Math.sin(t)*hh*0.95,1.3,q)}}
    if(d.type==='coquille'){const R=d.hh/2;contactShadow(x+1,sy,W2*1.1,0.4);ctx.translate(x,sy-R*0.9);
      const g=ctx.createRadialGradient(-R*0.3,-R*0.4,0.2,0,0,R*1.1);g.addColorStop(0,'#f2dfb8');g.addColorStop(0.6,'#b98d55');g.addColorStop(1,'#5e4024');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();
      ctx.strokeStyle='#4a3018';ctx.lineWidth=0.6;ctx.beginPath();for(let a=0;a<TAU*2.6;a+=0.2){const r=R*(1-a/(TAU*2.9));ctx.lineTo(Math.cos(a)*r*0.95,Math.sin(a)*r*0.95)}ctx.stroke();
      ctx.fillStyle='#120a04';ctx.beginPath();ctx.ellipse(R*0.75*d.dir,R*0.55,R*0.45,R*0.35,0,0,TAU);ctx.fill()}
    if(d.type==='champi'){const n=3+Math.round(d.seed*3),gr=clamp((d.age||40)/40,0.3,1);contactShadow(x,sy,W2,0.3);
      for(let q=0;q<n;q++){const bx=x-W2*0.7+q*(W2*1.4/Math.max(1,n-1)),hh=(4+((q*7+d.seed*10)%5))*gr,r=(2.2+((q*3)%3)*0.8)*gr;
        ctx.fillStyle='#e9e0cf';ctx.fillRect(bx-0.5,sy-hh,1,hh);
        const g=ctx.createRadialGradient(bx-r*0.3,sy-hh-r*0.5,0.2,bx,sy-hh,r*1.2);g.addColorStop(0,'#f0b07a');g.addColorStop(1,'#7a3a1a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(bx,sy-hh,r,r*0.7,0,Math.PI,TAU);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,240,220,0.7)';ctx.fillRect(bx-r*0.4,sy-hh-r*0.45,0.6,0.6);ctx.fillRect(bx+r*0.2,sy-hh-r*0.3,0.5,0.5)}}
    if(d.type==='tronc'){const h=d.h;contactShadow(x+3,sy,W2*1.5,0.5);ctx.translate(x,sy);ctx.rotate((d.ang||0)*0.3);const ry=W2*0.28;
      // fût cylindrique
      ctx.beginPath();ctx.moveTo(-W2,-h);ctx.lineTo(-W2-0.6,0);ctx.ellipse(0,0,W2+0.6,ry,0,Math.PI,0,true);ctx.lineTo(W2,-h);ctx.closePath();
      ctx.fillStyle=lin2(-W2,0,W2,0,[[0,'#1a120b'],[0.3,'#6a4a30'],[0.45,'#7a573a'],[0.8,'#2e2014'],[1,'#120c07']]);ctx.fill();
      ctx.save();ctx.clip();ctx.strokeStyle='rgba(15,10,5,0.7)';ctx.lineWidth=0.5;for(let q=0;q<9;q++){const bx=-W2+w*(q+0.5)/9;ctx.beginPath();ctx.moveTo(bx,-h);for(let y=-h;y<=0;y+=4)ctx.lineTo(bx+Math.sin(y*0.3+q+d.seed*7)*0.8,y);ctx.stroke()}
      ctx.strokeStyle='rgba(200,170,130,0.18)';ctx.lineWidth=0.3;for(let q=0;q<6;q++){const by=-h+((q*13+d.seed*30)%h);ctx.beginPath();ctx.moveTo(-W2*0.4,by);ctx.lineTo(-W2*0.1,by+1);ctx.stroke()}ctx.restore();
      // cavité
      const cy=-h*0.32;ctx.fillStyle='#2a1c10';ctx.beginPath();ctx.ellipse(0,cy,W2*0.36,h*0.14,0,0,TAU);ctx.fill();ctx.fillStyle='#070402';ctx.beginPath();ctx.ellipse(0.6,cy+0.8,W2*0.27,h*0.11,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(200,160,110,0.4)';ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(0,cy,W2*0.36,h*0.14,0,Math.PI*1.05,Math.PI*1.75);ctx.stroke();
      // dessus creux, mousse sur le bord
      ctx.fillStyle='#8a6a48';ctx.beginPath();ctx.ellipse(0,-h,W2,ry,0,0,TAU);ctx.fill();ctx.fillStyle='#0b0704';ctx.beginPath();ctx.ellipse(0,-h+0.3,W2*0.65,ry*0.62,0,0,TAU);ctx.fill();
      {const n=3+Math.round(mq*12);for(let q=0;q<n;q++){const a=Math.PI+q/Math.max(1,n-1)*Math.PI;mossBlob(Math.cos(a)*W2*0.92,-h+Math.sin(a)*ry*0.9,1.5,q)}
       for(let q=0;q<Math.round(mq*14);q++){const px=(((q*0.618+d.seed)%1)-0.5)*W2*1.7,py=-h+ry+((q*0.37)%1)*h*0.7*mq;mossBlob(px,py,1.3+((q*3)%3)*0.4,q+7)}}}
    ctx.restore()}
}
function lin2(x0,y0,x1,y1,st){const g=ctx.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
// ----- rendu vue de dessus -----
function drawDecosTop(g){for(const d of decos){const D=DECOS[d.type],x=d.i*CS+CS/2,w=D.w*CS;const y=-((d.dz||0)+d.w*CS*0.4);
  if(d.type==='pierre'){g.fillStyle='#6f757c';g.beginPath();g.ellipse(x,y,w/2,w*0.35,d.seed,0,TAU);g.fill();g.strokeStyle='#b8c0c8';g.lineWidth=0.4;g.stroke()}
  if(d.type==='pot'){g.strokeStyle='#d87a48';g.lineWidth=1.6;g.beginPath();g.arc(x,y,w*0.4,d.seed*3,d.seed*3+Math.PI*1.3);g.stroke()}
  if(d.type==='mousse'){for(let q=0;q<16;q++){g.fillStyle=hsl(100+q*2,55,22+(q%3)*5);g.beginPath();g.arc(x+Math.cos(q*2.4)*w*0.35*((q%4+1)/4),y+Math.sin(q*2.4)*w*0.25*((q%4+1)/4),2.2,0,TAU);g.fill()}}
  if(d.type==='mare'){g.fillStyle='rgba(40,110,200,0.8)';g.beginPath();g.ellipse(x,y,w/2,w*0.32,0,0,TAU);g.fill();g.strokeStyle='rgba(170,220,255,0.7)';g.lineWidth=0.4;const r=(simT*6+d.seed*20)%10;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke()}
  if(d.type==='branche'){g.strokeStyle='#5a4030';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(x-w/2,y+w*0.1*d.dir);g.lineTo(x+w/2,y-w*0.1*d.dir);g.stroke();g.lineCap='butt'}
  if(d.type==='volcan'){g.fillStyle='#2a2624';g.beginPath();g.ellipse(x,y,w/2,w*0.4,d.seed,0,TAU);g.fill()}
  if(d.type==='liege'){g.strokeStyle='#6a4a2c';g.lineWidth=w*0.12;g.beginPath();g.ellipse(x,y,w/2,w*0.3,0,0,TAU);g.stroke()}
  if(d.type==='coquille'){g.fillStyle='#c9a06a';g.beginPath();g.arc(x,y,w*0.35,0,TAU);g.fill();g.strokeStyle='#4a3018';g.lineWidth=0.4;g.beginPath();for(let a=0;a<TAU*2.5;a+=0.3){const r=w*0.33*(1-a/(TAU*2.8));g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.stroke()}
  if(d.type==='champi'){for(let q=0;q<4;q++){g.fillStyle='#a5532a';g.beginPath();g.arc(x+(q-1.5)*3,y+((q*7)%3)-1,1.8,0,TAU);g.fill()}}
  if(d.type==='tronc'){g.fillStyle='#3b2a1c';g.beginPath();g.arc(x,y,w/2,0,TAU);g.fill();g.fillStyle='#120c08';g.beginPath();g.arc(x,y,w*0.28,0,TAU);g.fill();g.strokeStyle='#8a6a4a';g.lineWidth=0.4;g.beginPath();g.arc(x,y,w/2,0,TAU);g.stroke()}
}}
// ombres de contact : plantes et bêtes posées ou volant au-dessus du sol
function drawShadows(){setOXY();
  for(const p of plants){const x=p.col*CS+CS/2;ctx.save();zT(p.z);contactShadow(x+1,surfY(p.col)+0.3,3+Math.min(10,p.h*0.12),0.35);ctx.restore()}
  for(const c of creatures){const R=[realLen(c)];const gy=groundAt(c.x,{dz:c.z||0}),hg=gy-c.y;if(hg<-1.5||hg>90)continue;
    ctx.save();zT(c.z);contactShadow(c.x+hg*0.08,gy+0.3,R[0]*0.5*(1+hg/45),0.42*(1-hg/90));ctx.restore()}
}

// la mousse colonise peu à peu les objets quand l'air reste humide, et sèche sinon
function mossTick(dt){const lf=Math.min(1,lightF()*1.4);
  for(const d of decos){if(d.type==='mousse'||d.type==='mare')continue;const half=Math.round(d.w/2);let w=0,n=0;
    for(let q=Math.max(0,d.i-half);q<=Math.min(COLS-1,d.i+half);q+=2){const k=K(q,Math.min(ROWS-1,SURF[q]));if(T[k]){w+=WET[k];n++}}
    w=n?w/n:0;const near=decos.some(o=>o.type==='mare'&&Math.abs(o.i-d.i)<o.w/2+half+6)?0.15:0;
    const g=(w+near>0.38?0.012*(w+near)*(0.4+lf):-0.006*(1-w));d.moss=clamp((d.moss||0)+g*dt*(d.type==='tronc'||d.type==='branche'?1.3:1),0,1);
    if(d.moss>0.3)for(let q=Math.max(0,d.i-half);q<=Math.min(COLS-1,d.i+half);q++)EVF[q]=Math.min(EVF[q],1-0.35*d.moss)}}

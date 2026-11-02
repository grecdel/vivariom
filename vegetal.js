// ================= VÉGÉTAUX PLUS ORGANIQUES (vue de côté et 3/4) =================
// Tiges qui ondulent doucement et s'affinent vers le haut, feuilles en amande nervurées qui ploient au vent,
// pétales arrondis. Les bêtes grimpent toujours sur la colonne de la plante : l'ondulation reste faible (≈ 1 case).
// VEG : 'actuel' (ancien dessin), 'ondule' (proto B), 'organique' (proto C, plus marqué)
let VEG='organique';
const VEGA=()=>VEG==='organique'?2.2:1;// intensité
const rh=(p,k)=>{const v=Math.sin((p.id+1)*12.9898+k*78.233)*43758.5453;return v-Math.floor(v)};// hasard stable par plante
// point de la tige à la hauteur t (0 = pied, 1 = sommet)
function tigeXY(p,x,yb,H,sway,t){const A=(1.1+rh(p,1)*0.8)*VEGA(),k=1.3+rh(p,2)*1.2,ph=rh(p,3)*TAU,b=Math.sin(simT*0.9+p.id)*0.4;
  return [x+Math.sin(t*Math.PI*k+ph)*A*Math.min(1,t*3)+sway*t*t+b*t,yb-t*H]}
function tigeTrace(p,x,yb,H,sway,w0,col,line){const n=Math.max(6,Math.min(18,Math.round(H/4))),L=[],R=[];
  for(let q=0;q<=n;q++){const t=q/n,[px,py]=tigeXY(p,x,yb,H,sway,t),[qx,qy]=tigeXY(p,x,yb,H,sway,Math.min(1,t+0.02)),dx=qx-px,dy=qy-py,l=Math.hypot(dx,dy)||1,w=w0*(1-t*0.72)/2;
    L.push([px-dy/l*w,py+dx/l*w]);R.push([px+dy/l*w,py-dx/l*w])}
  ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);for(let q=1;q<L.length;q++){const a=L[q-1],c=L[q];ctx.quadraticCurveTo(a[0],a[1],(a[0]+c[0])/2,(a[1]+c[1])/2)}
  for(let q=R.length-1;q>=0;q--)ctx.lineTo(R[q][0],R[q][1]);ctx.closePath();ctx.fillStyle=col;ctx.fill();if(line){ctx.strokeStyle=line;ctx.lineWidth=0.3;ctx.stroke()}}
// feuille en amande : base (x,y), angle, longueur, largeur
function feuille(x,y,a,L,W,fill,line,nerv){const c=Math.cos(a),s=Math.sin(a),P=(u,v)=>[x+c*u-s*v,y+s*u+c*v];
  const tip=P(L,0),b1=P(L*0.3,W*0.62),b2=P(L*0.75,W*0.42),b3=P(L*0.3,-W*0.62),b4=P(L*0.75,-W*0.42);
  ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(b1[0],b1[1],b2[0],b2[1],tip[0],tip[1]);ctx.bezierCurveTo(b4[0],b4[1],b3[0],b3[1],x,y);ctx.fillStyle=fill;ctx.fill();
  ctx.strokeStyle=line;ctx.lineWidth=0.35;ctx.stroke();
  if(nerv){const m=P(L*0.5,W*0.06),e=P(L*0.92,0);ctx.globalAlpha*=0.55;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(m[0],m[1],e[0],e[1]);
    if(VEG==='organique')for(const u of [0.35,0.6]){const o=P(L*u,0);for(const sd of [1,-1]){const f=P(L*(u+0.14),W*0.32*sd);ctx.moveTo(o[0],o[1]);ctx.lineTo(f[0],f[1])}}
    ctx.lineWidth=0.25;ctx.stroke();ctx.globalAlpha/=0.55}}
function racines(x,yb,p){if(!(OXY[0]||OXY[1])||p.z<12){ctx.strokeStyle=hsl(35,40,45);ctx.lineWidth=0.5;ctx.globalAlpha=0.45;ctx.beginPath();
  for(let r=-2;r<=2;r++){const w=(rh(p,r+9)-0.5)*6;ctx.moveTo(x,yb);ctx.bezierCurveTo(x+r*3+w,yb+8,x+r*8-w,yb+16,x+r*9+w,yb+26+Math.abs(r)*8)}ctx.stroke();ctx.globalAlpha=1}}

// ---------- fleur sauvage ----------
function fleurOrga(p){const i=p.col,x=i*CS+CS/2,yb=Y0+(p.base+1)*CS,H=(p.h-1)*CS,vig=clamp(p.e/3,0.25,1),dry=p.wet<0.15,hue=dry?45:p.hue,sway=Math.sin(simT*1.3+i)*3;
  racines(x,yb,p);ctx.globalAlpha=1;
  tigeTrace(p,x,yb,H,sway,1.7+vig*0.6,hsl(hue,55,22+vig*14),hsl(hue,60,38+vig*18));
  const fill=hsl(hue,52,16+vig*12,0.9),line=hsl(hue+10,65,38+vig*20);
  for(let r=5;r<p.h-1;r+=6){const t=r/p.h,[sx,sy]=tigeXY(p,x,yb,H,sway,t),sd=(Math.floor(r/6)%2?1:-1),L=(6+vig*5+(1-t)*4)*(0.85+rh(p,r)*0.3),
      droop=(1-vig)*0.9+(dry?0.5:0),wind=Math.sin(simT*1.6+r+i)*0.08,a=sd>0?-0.55+droop+wind:Math.PI+0.55-droop+wind;
    const fj=VEG==='organique'?hsl(hue+(rh(p,r+40)-0.5)*22,52,15+vig*12+rh(p,r+41)*6,0.9):fill;feuille(sx,sy,a,L,L*(VEG==='organique'?0.36+rh(p,r+42)*0.14:0.42),fj,line,true)}
  if(p.h>=p.maxH){const [fx,fy0]=tigeXY(p,x,yb,H,sway,1),fy=fy0-2,f=p.fl;
    if(f.open){const R=5,glow=f.nectar/3;ctx.globalCompositeOperation='lighter';const spr=glowSprite(330);ctx.globalAlpha=0.22+glow*0.35;ctx.drawImage(spr,fx-R*2.2,fy-R*2.2,R*4.4,R*4.4);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      const ph=hsl(f.poll?48:(330+rh(p,5)*30)%360,75,62),pl=hsl(f.poll?48:330,80,78);
      for(let q=0;q<5;q++){const a=q/5*TAU+simT*0.15+rh(p,6);ctx.save();ctx.translate(fx,fy);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(R*0.35,-R*0.55,R*1.05,-R*0.45,R*1.05,0);ctx.bezierCurveTo(R*1.05,R*0.45,R*0.35,R*0.55,0,0);
        ctx.fillStyle=ph;ctx.globalAlpha=0.85;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=pl;ctx.lineWidth=0.35;ctx.stroke();ctx.restore()}
      ctx.fillStyle=hsl(48,100,58+glow*20);ctx.beginPath();ctx.arc(fx,fy,1.4,0,TAU);ctx.fill();ctx.fillStyle=hsl(30,80,35);for(let q=0;q<5;q++){const a=q*1.26;ctx.fillRect(fx+Math.cos(a)*0.7-0.2,fy+Math.sin(a)*0.7-0.2,0.4,0.4)}}
    else{ctx.fillStyle=hsl(hue,50,30);ctx.strokeStyle=hsl(hue,60,50);ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(fx,fy+2);ctx.bezierCurveTo(fx-2.4,fy,fx-1.2,fy-3,fx,fy-3.6);ctx.bezierCurveTo(fx+1.2,fy-3,fx+2.4,fy,fx,fy+2);ctx.fill();ctx.stroke();
      ctx.fillStyle=hsl(330,60,55);ctx.beginPath();ctx.ellipse(fx,fy-2.6,0.6,1,0,0,TAU);ctx.fill()}}
  ctx.globalAlpha=1}

// ---------- autres végétaux : graminée, fougère, trèfle, ronce ----------
function brin(x,yb,L,dir,sway,w,fill){// brin d'herbe effilé et courbé
  const tx=x+dir*L*0.55+sway,ty=yb-L*(1-Math.abs(dir)*0.25),cx=x+dir*L*0.08,cy=yb-L*0.7;
  ctx.beginPath();ctx.moveTo(x-w,yb);ctx.quadraticCurveTo(cx-w*0.6,cy,tx,ty);ctx.quadraticCurveTo(cx+w*0.6,cy,x+w,yb);ctx.closePath();ctx.fillStyle=fill;ctx.fill();return [tx,ty]}
function autreOrga(p){const k=p.kind,i=p.col,x=i*CS+CS/2,yb=Y0+(p.base+1)*CS,H=p.h*CS,vig=clamp(p.e/3,0.25,1),dry=p.wet<0.15,sw=Math.sin(simT*1.3+i)*2;
  const hue=dry?45:k==='fougere'?120:k==='gramin'?78:k==='trefle'?112:105,line=hsl(hue+8,62,36+vig*22),fill=hsl(hue,52,15+vig*11,0.9);
  racines(x,yb,p);ctx.globalAlpha=1;
  if(k==='gramin'){const n=8;for(let f=0;f<n;f++){const L=H*(0.5+0.5*rh(p,f)),dir=(f-(n-1)/2)*0.14+(rh(p,f+20)-0.5)*0.1,s=sw*(0.8+f*0.08)+Math.sin(simT*2.1+f)*0.6;
      const [tx,ty]=brin(x+(f-3.5)*0.5,yb,L,dir,s,0.55,f%2?fill:hsl(hue,50,22+vig*12,0.9));
      if(f%3===0&&p.h>=p.maxH*0.8){ctx.fillStyle=hsl(44,58,58);for(let q=0;q<6;q++){const u=q/6;ctx.beginPath();ctx.ellipse(tx-dir*q*1.1+Math.sin(q+simT)*0.2,ty+q*1.5,0.6,1.3,dir+0.3*Math.sin(q),0,TAU);ctx.fill()}}}return}
  if(k==='fougere'){const n=5;for(let f=0;f<n;f++){const a=-Math.PI/2+(f-(n-1)/2)*0.4,L=H*(0.72+0.28*rh(p,f)),tx=clamp(x+Math.cos(a)*L*0.6+sw*(f%2?1:-1),8,WW-8),ty=yb-Math.abs(Math.sin(a))*L*0.72,cx=x+Math.cos(a)*L*0.12,cy=yb-L*0.65;
      ctx.strokeStyle=line;ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x,yb);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
      for(let q=1;q<12;q++){const t=q/12,u=1-t,px=u*u*x+2*u*t*cx+t*t*tx,py=u*u*yb+2*u*t*cy+t*t*ty,dx=2*u*(cx-x)+2*t*(tx-cx),dy=2*u*(cy-yb)+2*t*(ty-cy),an=Math.atan2(dy,dx),s=(1-t)*4.2+0.9;
        for(const sd of [-1,1])feuille(px,py,an+sd*(1.1-t*0.3),s,s*0.5,fill,line,false)}
      // crosse enroulée au bout de la plus jeune fronde
      if(f===2&&VEG==='organique'){ctx.beginPath();for(let q=0;q<14;q++){const a2=q*0.5,r=2.2*(1-q/16);ctx.lineTo(tx+Math.cos(a2)*r,ty-1.5+Math.sin(a2)*r)}ctx.stroke()}}return}
  if(k==='trefle'){for(let f=0;f<5;f++){const bx=x+(f-2)*3.2,L=H*(0.6+0.4*rh(p,f)),[tx,ty]=[bx+sw*0.4+Math.sin(f*2+p.id)*1.2,yb-L];
      ctx.strokeStyle=line;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(bx,yb);ctx.bezierCurveTo(bx+1.5,yb-L*0.4,tx-1.5,yb-L*0.7,tx,ty);ctx.stroke();
      for(let q=0;q<3;q++){const a=-Math.PI/2+(q-1)*1.25+Math.sin(simT*1.5+f)*0.05;feuille(tx,ty,a,3.4,3.2,fill,line,true)}
      if(f===2&&p.h>=p.maxH&&p.fl.open){ctx.fillStyle=hsl(320,55,82);for(let q=0;q<9;q++){const a=q/9*TAU;ctx.beginPath();ctx.ellipse(tx+Math.cos(a)*1.1,ty-4+Math.sin(a)*1.4,0.6,1.1,a,0,TAU);ctx.fill()}}}return}
  if(k==='ronce'){for(let f=0;f<3;f++){const dir=f-1,L=H,tx=clamp(x+dir*L*0.45+sw,8,WW-8),ty=yb-L*(f===1?1:0.65),c1x=x+dir*L*0.05,c1y=yb-L*0.75,c2x=x+dir*L*0.3,c2y=yb-L*1.1;
      ctx.strokeStyle=hsl(340,35,30);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,yb);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,tx,ty);ctx.stroke();ctx.lineWidth=0.6;
      for(let q=1;q<8;q++){const t=q/8,u=1-t,px=u*u*u*x+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*tx,py=u*u*u*yb+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*ty;
        ctx.strokeStyle=hsl(340,30,45);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+1.1,py-1.1);ctx.stroke();
        if(q%2){const sd=q%4?1:-1;feuille(px,py,sd>0?-0.35+Math.sin(simT*1.4+q)*0.06:Math.PI+0.35,4.4,2.6,fill,line,true)}
        else if(p.h>=p.maxH&&p.fl.open){for(const [ox,oy] of [[0,0],[1,0.8],[-0.8,0.9],[0.2,1.6],[0.9,-0.1]]){ctx.fillStyle=hsl(285,55,20);ctx.beginPath();ctx.arc(px+ox,py+2+oy,0.8,0,TAU);ctx.fill();ctx.fillStyle='#fff3';ctx.fillRect(px+ox-0.4,py+1.6+oy,0.3,0.3)}}}}return}
}
{const dp=drawPlant;drawPlant=function(p){if(VEG==='actuel'){dp(p);return}const k=p.kind||'fleur';
  if(k==='fleur'){fleurOrga(p);return}
  if(k==='gramin'||k==='fougere'||k==='trefle'||k==='ronce'){autreOrga(p);return}dp(p)}}
if(window.__sim)window.__sim.veg=v=>{VEG=v};

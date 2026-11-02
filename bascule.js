// ---------- bascule 3/4 <-> dessus : un vrai bac en volume qui se redresse ----------
// Le bac est un pavé : face avant = la coupe (vue de côté du bac entier), dessus = la vue du dessus,
// côté droit = une paroi sombre. Projection « cavalière » de la vue 3/4 (profondeur décalée en haut à droite)
// qui tourne jusqu'à la vue de dessus ; légère perspective au milieu du mouvement ; fondu avec les vraies vues
// au début et à la fin.
function texSide(){const sv=[view,ensE,ensDir,camZ,camX,camY];view='side';ensE=0;ensDir=0;camFit();draw();
  const [x0,y0]=w2s(0,0),[x1,y1]=w2s(WW,WH),c=document.createElement('canvas');
  c.width=Math.max(2,Math.round((x1-x0)*DPR));c.height=Math.max(2,Math.round((y1-y0)*DPR));
  c.getContext('2d').drawImage(cv,Math.round(x0*DPR),Math.round(y0*DPR),c.width,c.height,0,0,c.width,c.height);
  [view,ensE,ensDir,camZ,camX,camY]=sv;return c}
function texTop(){const sv=[ZM,zx0,zz0,zCol];ZM=topFit();zx0=0;zz0=0;topClamp();
  const fit={ZM,zx0,zz0},big=document.createElement('canvas');big.width=cv.width;big.height=cv.height;drawTop(big.getContext('2d'));
  const x0=(0-zx0)*ZM,y0=TYB-(ZD-zz0)*ZM,c=document.createElement('canvas');
  c.width=Math.max(2,Math.round(WW*ZM*DPR));c.height=Math.max(2,Math.round(ZD*ZM*DPR));
  c.getContext('2d').drawImage(big,Math.round(x0*DPR),Math.round(y0*DPR),c.width,c.height,0,0,c.width,c.height);
  [ZM,zx0,zz0,zCol]=sv;topClamp();return {c,fit}}
function buildTex(){const R=ensRect(1),T=texTop();return {front:texSide(),top:T.c,fit:T.fit,R,k0:R.w/WW}}
const enterTopFromEns0=enterTopFromEns;enterTopFromEns=function(x){enterTopFromEns0(x);if(anim)anim.tex=buildTex()};
const exitTopToEns0=exitTopToEns;exitTopToEns=function(){exitTopToEns0();if(anim)anim.tex=buildTex()};

const renderTransition0=renderTransition;
renderTransition=function(u){if(!anim||anim.back!=='ens'||!anim.tex)return renderTransition0(u);bac3D(u)};
function bac3D(u){const g=mainCtx,T=anim.tex,R=T.R,k0=T.k0,F=T.fit,P=DPR;
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);
  // paramètres de projection : X = x + a·z ; Y = c·y + b·z (profondeur z vers le haut quand b<0)
  const a0=R.dx/(k0*ZD),b0=R.dy/(k0*ZD),ph0=Math.asin(clamp(-b0,0.05,0.95)),ph=ph0+(Math.PI/2-ph0)*u;
  const a=a0*(1-u),c=Math.max(0,Math.cos(ph)/Math.cos(ph0)),b=-Math.sin(ph);
  // échelle et position : de la vue 3/4 (k0, coin R) à la vue de dessus cadrée (ZM, zx0, zz0)
  const k=k0*Math.pow(F.ZM/k0,u),Ox=R.x+(-F.zx0*F.ZM-R.x)*u,Oy=R.y+((TYB+F.zz0*F.ZM)-R.y)*u;
  // perspective : nulle aux deux bouts, la plus forte au milieu ; les points proches de la caméra grossissent
  const pr=0.45*Math.sin(Math.PI*u),L=Math.max(WW,WH,ZD),dv=(y,z)=>(z*Math.cos(ph)-(WH-y)*Math.sin(ph))/L,dvc=dv(WH/2,ZD/2);
  const cx=Ox+k*(WW/2+a*ZD/2),cy=Oy+k*(c*WH/2+b*ZD/2);
  const pt=(x,y,z)=>{const X=Ox+k*(x+a*z),Y=Oy+k*(c*y+b*z),s=1/(1+pr*(dv(y,z)-dvc));return [cx+(X-cx)*s,cy+(Y-cy)*s]};
  // une bande de texture -> trapèze projeté (exact : la perspective ne varie pas le long d'une bande)
  const strip=(img,j0,j1,A,B,C)=>{const tw=img.width,h=j1-j0;
    g.setTransform((B[0]-A[0])*P/tw,(B[1]-A[1])*P/tw,(C[0]-A[0])*P/h,(C[1]-A[1])*P/h,A[0]*P-(C[0]-A[0])*P/h*j0,A[1]*P-(C[1]-A[1])*P/h*j0);
    g.drawImage(img,0,j0,tw,Math.min(img.height-j0,h+1),0,j0,tw,Math.min(img.height-j0,h+1))};
  const poly=(pts,fill)=>{g.setTransform(P,0,0,P,0,0);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill()};
  g.globalAlpha=1;
  // côté droit (paroi sombre), visible tant que la profondeur part vers la droite
  if(a>0.01){const q=[pt(WW,0,0),pt(WW,0,ZD),pt(WW,WH,ZD),pt(WW,WH,0)];g.setTransform(P,0,0,P,0,0);const gr=g.createLinearGradient(q[0][0],q[0][1],q[1][0],q[1][1]);gr.addColorStop(0,'#3a4350');gr.addColorStop(1,'#1c2229');poly(q,gr)}
  // dessus : bandes de la vue de dessus, de l'arrière (haut de l'image) vers l'avant
  const TT=T.top,ST=6;if(-b>0.02)for(let j=0;j<TT.height;j+=ST){const z0=ZD*(1-j/TT.height),z1=ZD*(1-Math.min(TT.height,j+ST)/TT.height);strip(TT,j,Math.min(TT.height,j+ST),pt(0,0,z0),pt(WW,0,z0),pt(0,0,z1))}
  poly([pt(0,0,0),pt(WW,0,0),pt(WW,0,ZD),pt(0,0,ZD)],`rgba(0,0,0,${(0.55*(1-Math.sin(ph))).toFixed(3)})`);
  // face avant : bandes de la coupe, de haut en bas
  const TF=T.front;if(c>0.01){for(let j=0;j<TF.height;j+=ST){const y0=WH*j/TF.height,y1=WH*Math.min(TF.height,j+ST)/TF.height;strip(TF,j,Math.min(TF.height,j+ST),pt(0,y0,0),pt(WW,y0,0),pt(0,y1,0))}
    poly([pt(0,0,0),pt(WW,0,0),pt(WW,WH,0),pt(0,WH,0)],`rgba(0,0,0,${(0.6*(1-c)).toFixed(3)})`)}
  // arêtes de verre
  g.setTransform(P,0,0,P,0,0);g.strokeStyle='rgba(200,220,235,0.55)';g.lineWidth=1;g.beginPath();
  const E=[[[0,0,0],[WW,0,0]],[[WW,0,0],[WW,0,ZD]],[[WW,0,ZD],[0,0,ZD]],[[0,0,ZD],[0,0,0]]];
  if(c>0.01)E.push([[0,0,0],[0,WH,0]],[[WW,0,0],[WW,WH,0]],[[0,WH,0],[WW,WH,0]]);if(a>0.01)E.push([[WW,0,ZD],[WW,WH,ZD]],[[WW,WH,0],[WW,WH,ZD]]);
  for(const [p,q] of E){const A=pt(...p),B=pt(...q);g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1])}g.stroke();
  // fondu avec les vraies vues (3/4 au début, dessus à la fin)
  g.setTransform(1,0,0,1,0,0);
  if(u<0.18){g.globalAlpha=1-u/0.18;g.drawImage(sideSnap,0,0)}
  else if(u>0.82){g.globalAlpha=(u-0.82)/0.18;g.drawImage(topSnap,0,0)}
  g.globalAlpha=1}

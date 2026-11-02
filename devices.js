// ================= APPAREILS DU VIVARIUM =================
const NEON={blanc:{nom:'Blanc froid',rgb:[215,232,255],grow:1.0},horti:{nom:'Horticole',rgb:[255,110,215],grow:1.45},uv:{nom:'UV-B',rgb:[150,95,255],grow:0.55}};
let DEV;
function resetDev(){let au=true;try{au=lvl.showers!==false}catch(_){}DEV={spot:{on:true,int:65},neon:{on:true,int:60,type:'blanc'},time:{day:70},mist:{auto:au,every:100,dur:2.5},pump:{level:100,flow:1},heat:{on:false,target:25},vent:{open:true}}}
resetDev();
const DAYLEN=120;let dayClock=0;
function isDay(){return (DEV.spot.on||DEV.neon.on)&&((dayClock%DAYLEN)/DAYLEN)<DEV.time.day/100}
function lightAmt(){if(!isDay())return 0;return (DEV.spot.on?DEV.spot.int*0.8:0)/100+(DEV.neon.on?DEV.neon.int*NEON[DEV.neon.type].grow:0)/100}
function lightF(){return 0.05+0.75*Math.min(1.3,lightAmt())}
function heatLamps(){return isDay()?(DEV.spot.on?DEV.spot.int/100*3.5:0)+(DEV.neon.on?DEV.neon.int/100*0.8:0):0}
function temp(){return 19+(DEV.heat.on?(DEV.heat.target-19)*0.85:0)+heatLamps()-(DEV.vent.open?0.8:0)}
function evapF(){return (0.45+0.7*Math.min(1.3,lightAmt()))*(DEV.vent.open?1.3:0.7)*(1+(temp()-22)*0.05)}
function metabF(){return clamp(1+(temp()-22)*0.035,0.6,1.6)}
// couleur de la lumière ambiante (mélange des lampes allumées)
function lightRGB(){if(!isDay())return null;let r=0,g=0,b=0,w=0;
  if(DEV.spot.on){const k=DEV.spot.int;r+=255*k;g+=210*k;b+=145*k;w+=k}
  if(DEV.neon.on){const k=DEV.neon.int,c=NEON[DEV.neon.type].rgb;r+=c[0]*k;g+=c[1]*k;b+=c[2]*k;w+=k}
  if(!w)return null;return [r/w|0,g/w|0,b/w|0,Math.min(1,w/130)]}
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
function surfWet(){let w=0,n=0;for(let i=0;i<COLS;i+=4){const k=K(i,Math.min(ROWS-1,SURF[i]));if(T[k]){w+=WET[k];n++}}return n?w/n:0}
function deepWet(){let w=0,n=0;for(let i=0;i<COLS;i+=4)for(let d=10;d<40;d+=6){const j=SURF[i]+d;if(j>=ROWS)continue;const k=K(i,j);if(T[k]&&T[k]!==5){w+=WET[k];n++}}return n?w/n:0}

// ================= CAMÉRA =================
let camZ=1,camX=250,camY=200,fitZ=1;
let BAND_T=92;const bandB=()=>H-BOT;
function fitZoom(){return Math.min((W-16)/(WW+12),(bandB()-BAND_T-10)/(WH+26))}
function camClamp(){camZ=clamp(camZ,fitZ*0.999,18);const wl=-8,wr=WW+8,wt=-16,wb=WH+12,bT=BAND_T,bB=bandB();
  let lo=wl+(W/2)/camZ,hi=wr-(W/2)/camZ;camX=lo>hi?(lo+hi)/2:clamp(camX,lo,hi);
  lo=wt+(H/2-bT)/camZ;hi=wb-(bB-H/2)/camZ;camY=lo>hi?(lo+hi)/2:clamp(camY,lo,hi)}
function camFit(){fitZ=fitZoom();camZ=fitZ;camX=WW/2;camY=WH/2;camClamp()}
const s2w=(sx,sy)=>[camX+(sx-W/2)/camZ,camY+(sy-H/2)/camZ];
const w2s=(wx,wy)=>[(wx-camX)*camZ+W/2,(wy-camY)*camZ+H/2];
function zoomAt(sx,sy,f){
  if(view==='top'){topZoom(sx,sy,f);return}
  if(view==='ens'){if(f>1)exitEns();return}
  if(view!=='side')return;
  if(camZ<=fitZ*1.001&&f<1){enterEns();return}
  const [wx,wy]=s2w(sx,sy);camZ=clamp(camZ*f,fitZ,18);camX=wx-(sx-W/2)/camZ;camY=wy-(sy-H/2)/camZ;camClamp();
}

// ================= LUMIÈRE (coordonnées monde) : seulement l'air et la surface =================
function skyPath(){ctx.beginPath();ctx.moveTo(0,Y0);ctx.lineTo(WW,Y0);for(let i=COLS-1;i>=0;i--)ctx.lineTo(i*CS+(i===COLS-1?CS:CS/2),surfY(i)+0.6);ctx.lineTo(0,surfY(0)+0.6);ctx.closePath()}
function drawLightOverlay(){
  const L=lightRGB();
  if(!L){ctx.fillStyle='rgba(6,10,32,0.5)';ctx.fillRect(0,Y0,WW,WH);return}
  ctx.save();skyPath();ctx.clip();ctx.globalCompositeOperation='lighter';
  const g=ctx.createLinearGradient(0,Y0,0,Y0+WH*0.45);g.addColorStop(0,rgba(L,0.16*L[3]));g.addColorStop(1,rgba(L,0.03*L[3]));
  ctx.fillStyle=g;ctx.fillRect(0,Y0,WW,WH);
  if(DEV.spot.on){const sx=WW*0.3,gg=ctx.createRadialGradient(sx,Y0,4,sx,Y0+WH*0.3,WH*0.45);gg.addColorStop(0,`rgba(255,215,150,${0.22*DEV.spot.int/100})`);gg.addColorStop(1,'rgba(255,215,150,0)');ctx.fillStyle=gg;ctx.fillRect(0,Y0,WW,WH)}
  ctx.restore();
  // la surface du sol accroche la lumière sur 2–3 mm, le sous-sol reste sombre
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(L,0.35*L[3]);ctx.lineWidth=2.5;ctx.beginPath();
  for(let i=0;i<COLS;i++){const x=i*CS+CS/2,y=surfY(i)+1.2;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.restore();
  if(DEV.neon.on&&DEV.neon.type==='uv'){ctx.save();skyPath();ctx.clip();ctx.fillStyle='rgba(40,10,70,0.18)';ctx.fillRect(0,Y0,WW,WH);ctx.restore()}
}
// ----- cadran thermo-hygromètre (dessiné dans n'importe quel repère) -----
const GC={cv:null,t:-1,r:0,key:''};
function drawGaugeCached(g,cx,cy,r,tC,hum){const key=tC.toFixed(1)+'|'+Math.round(hum*100),S=Math.ceil(r*2*3);
  if(!GC.cv||GC.key!==key||GC.r!==S){if(!GC.cv)GC.cv=document.createElement('canvas');GC.cv.width=GC.cv.height=S;const gg=GC.cv.getContext('2d');gg.clearRect(0,0,S,S);drawGauge(gg,S/2,S/2,S/2,tC,hum);GC.key=key;GC.r=S}
  g.drawImage(GC.cv,cx-r,cy-r,r*2,r*2)}
function drawGauge(g,cx,cy,r,tC,hum){
  g.save();
  const bz=g.createLinearGradient(cx-r,cy-r,cx+r,cy+r);bz.addColorStop(0,'#e8ecf0');bz.addColorStop(0.45,'#7c848e');bz.addColorStop(0.55,'#5b636d');bz.addColorStop(1,'#cfd5dc');
  g.fillStyle=bz;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
  const fc=g.createRadialGradient(cx-r*0.3,cy-r*0.3,r*0.1,cx,cy,r*0.86);fc.addColorStop(0,'#fbf8ef');fc.addColorStop(1,'#d9d3c3');g.fillStyle=fc;g.beginPath();g.arc(cx,cy,r*0.84,0,TAU);g.fill();
  // échelles : température à gauche (10→40 °C), humidité à droite (0→100 %)
  const A0=Math.PI*0.62,A1=Math.PI*1.38,B0=Math.PI*1.62,B1=Math.PI*2.38;
  const tg=g.createLinearGradient(cx-r,cy+r,cx-r,cy-r);tg.addColorStop(0,'#3a7bd5');tg.addColorStop(0.5,'#4caf50');tg.addColorStop(1,'#e53935');
  g.lineWidth=r*0.12;g.strokeStyle=tg;g.beginPath();g.arc(cx,cy,r*0.68,A0,A1);g.stroke();
  const hg=g.createLinearGradient(cx+r,cy+r,cx+r,cy-r);hg.addColorStop(0,'#e0a040');hg.addColorStop(0.5,'#4caf50');hg.addColorStop(1,'#1e88e5');
  g.strokeStyle=hg;g.beginPath();g.arc(cx,cy,r*0.68,B1,B0,true);g.stroke();
  g.strokeStyle='#333';g.lineWidth=r*0.03;
  for(let q=0;q<=6;q++){for(const [a0,a1] of [[A0,A1],[B0,B1]]){const a=a0+(a1-a0)*q/6;g.beginPath();g.moveTo(cx+Math.cos(a)*r*0.58,cy+Math.sin(a)*r*0.58);g.lineTo(cx+Math.cos(a)*r*0.76,cy+Math.sin(a)*r*0.76);g.stroke()}}
  g.fillStyle='#555';g.font=`700 ${r*0.17}px -apple-system,Roboto,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  g.fillText('°C',cx-r*0.36,cy-r*0.3);g.fillText('%HR',cx+r*0.34,cy-r*0.3);
  // fenêtre de lecture numérique en bas du cadran
  g.fillStyle='#1b2a22';g.beginPath();g.roundRect?g.roundRect(cx-r*0.52,cy+r*0.3,r*1.04,r*0.3,r*0.06):g.rect(cx-r*0.52,cy+r*0.3,r*1.04,r*0.3);g.fill();
  g.font=`700 ${r*0.16}px ui-monospace,monospace`;g.fillStyle='#ff8a80';g.fillText(tC.toFixed(1)+'°',cx-r*0.24,cy+r*0.455);g.fillStyle='#82c4ff';g.fillText(Math.round(hum*100)+'%',cx+r*0.23,cy+r*0.455);
  const needle=(a,col)=>{g.strokeStyle=col;g.lineWidth=r*0.06;g.lineCap='round';g.beginPath();g.moveTo(cx-Math.cos(a)*r*0.12,cy-Math.sin(a)*r*0.12);g.lineTo(cx+Math.cos(a)*r*0.64,cy+Math.sin(a)*r*0.64);g.stroke()};
  // plus il fait chaud / humide, plus l'aiguille monte
  needle(A0+(A1-A0)*clamp((tC-10)/30,0,1),'#c62828');needle(B1-(B1-B0)*clamp(hum,0,1),'#1565c0');
  g.fillStyle='#222';g.beginPath();g.arc(cx,cy,r*0.09,0,TAU);g.fill();
  g.globalAlpha=0.35;g.fillStyle='#fff';g.beginPath();g.ellipse(cx-r*0.25,cy-r*0.45,r*0.45,r*0.18,-0.5,0,TAU);g.fill();
  g.restore();
}
const SPD=0.32;const TH={x:WW-26,y:26,r:20};// même place en coupe et en 3/4
// cadre visible en vue de côté
function drawFrameSide(){
  drawLightOverlay();if(view==='ens')return;
  ctx.strokeStyle='rgba(180,215,255,0.55)';ctx.lineWidth=1.2/camZ;ctx.strokeRect(0,Y0,WW,WH);
  ctx.fillStyle='#121417';ctx.fillRect(-5,WH,WW+10,9);ctx.fillStyle='#1e2228';ctx.fillRect(-5,Y0-7,WW+10,6);
  ctx.save();skyPath();ctx.clip();ctx.strokeStyle='rgba(255,255,255,0.03)';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(WW*0.12,WH);ctx.lineTo(WW*0.4,0);ctx.stroke();ctx.restore();
  if(has('thermo'))drawGaugeCached(ctx,TH.x,Y0+TH.y,TH.r,temp(),surfWet());
}
// ================= VUE D'ENSEMBLE 3/4 =================
let ensE=0,ensDir=0,hot=[];
function enterEns(){if(view!=='side')return;view='ens';ensDir=1;openDev(null)}
function exitEns(){if(view!=='ens')return;ensDir=-1;openDev(null)}
function ensRect(e){
  const fz=fitZoom(),fw0=WW*fz,fh0=WH*fz,fx0=W/2-fw0/2,fy0=(BAND_T+bandB())/2-fh0/2;
  // profondeur proportionnelle au format du bac (Standard : 30 cm pour 50 cm de large)
  const kd=FMT==='std'?1:(ZD/WW)/0.6,fw1=Math.min(W*0.64,(bandB()-BAND_T-(LAND?22:96))/(WH/WW+0.23*kd)),fh1=fw1*WH/WW,dx1=fw1*0.13*kd,dy1=-fw1*0.23*kd,top=BAND_T+Math.max(LAND?10:46,(bandB()-BAND_T-(fh1-dy1+40))/2),fx1=Math.max(W*0.05,(W-(fw1+dx1+100))/2),fy1=top-dy1;
  const L=(a,b)=>a+(b-a)*e;return {x:L(fx0,fx1),y:L(fy0,fy1),w:L(fw0,fw1),h:L(fh0,fh1),dx:dx1*e,dy:dy1*e};
}
function ensCam(R){const z=R.w/WW;return {z,x:WW/2+(W/2-(R.x+R.w/2))/z,y:WH/2+(H/2-(R.y+R.h/2))/z}}
function poly(pts,fill,stroke,lw=1){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function lin(x0,y0,x1,y1,stops){const g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g}
// boîte en volume : face avant + dessus + côté, dans la même perspective que le vivarium
function box3(x,y,w,h,d,R,cf,ct,cs,stroke){const ux=R.dx/R.w*d*2.2,uy=R.dy/R.w*d*2.2;
  poly([[x+w,y],[x+w+ux,y+uy],[x+w+ux,y+h+uy],[x+w,y+h]],cs,stroke,0.6);poly([[x,y],[x+ux,y+uy],[x+w+ux,y+uy],[x+w,y]],ct,stroke,0.6);poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],cf,stroke,0.6)}
function drawEnsBack(){
  const e=ensE;if(e<=0.01)return;const R=ensRect(e),z=R.w/WW,{x,y,w,h,dx,dy}=R,L=lightRGB();
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=Math.min(1,e*1.4);
  ctx.fillStyle=lin(0,BAND_T,0,y+h,[[0,'#06070a'],[1,'#0f1116']]);ctx.fillRect(0,BAND_T-20,W,y+h+16-BAND_T+20);
  // table en perspective : lattes qui fuient vers un point de fuite
  const ty=y+h+16,vpx=x+w*0.5+dx*6,vpy=y+dy*6-h*0.3;
  ctx.fillStyle=lin(0,ty,0,bandB(),[[0,'#21190f'],[1,'#0b0806']]);ctx.fillRect(0,ty,W,bandB()-ty+40);
  ctx.strokeStyle='rgba(255,220,180,0.06)';ctx.lineWidth=1;ctx.beginPath();for(let q=-6;q<=12;q++){const bx=x+q*w/6;const t=(ty-vpy)/(bandB()+40-vpy);ctx.moveTo(vpx+(bx-vpx)*t,ty);ctx.lineTo(bx,bandB()+40)}ctx.stroke();
  ctx.strokeStyle='rgba(255,220,180,0.1)';ctx.beginPath();ctx.moveTo(0,ty+0.5);ctx.lineTo(W,ty+0.5);ctx.stroke();
  // ombre portée et flaque de lumière
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.moveTo(x-6,ty);ctx.lineTo(x+w+dx+10,ty+dy*0.2);ctx.lineTo(x+w+dx+30,ty+14);ctx.lineTo(x-10,ty+20);ctx.closePath();ctx.fill();
  if(L){const pg=ctx.createRadialGradient(x+w/2,ty+24,4,x+w/2,ty+24,w*0.75);pg.addColorStop(0,rgba(L,0.2*L[3]));pg.addColorStop(1,rgba(L,0));ctx.fillStyle=pg;ctx.fillRect(0,ty,W,bandB()-ty)}
  // vitre du fond
  poly([[x+dx,y+dy],[x+w+dx,y+dy],[x+w+dx,y+h+dy],[x+dx,y+h+dy]],'rgba(20,30,60,0.12)','rgba(170,210,255,0.2)',1);
  // surface du sol qui fuit vers le fond, éclairée par les lampes
  const sx=i=>x+(i*CS+CS/2)*z,sy=i=>y+(Y0+SURF[i]*CS)*z;
  for(let i=0;i<COLS;i+=2){const k=K(i,Math.min(ROWS-1,SURF[i]));const t=T[k]||1,ty2=TYPES[t],wt=WET[k],n=NUT[k];
    const l=ty2.l*(1-wt*0.38)+(t<=2?n*9:0)+(L?8*L[3]:2);ctx.fillStyle=hsl(ty2.h,ty2.s,l);
    const x0=sx(i)-CS*z,x1=sx(Math.min(COLS-1,i+2))-CS*z+0.6,y0=sy(i),y1=sy(Math.min(COLS-1,i+2));
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.lineTo(x1+dx,y1+dy);ctx.lineTo(x0+dx,y0+dy);ctx.closePath();ctx.fill()}
  // dégradé de profondeur sur la surface (plus sombre au fond)
  ctx.save();ctx.beginPath();ctx.moveTo(sx(0),sy(0));for(let i=0;i<COLS;i+=4)ctx.lineTo(sx(i),sy(i));for(let i=COLS-1;i>=0;i-=4)ctx.lineTo(sx(i)+dx,sy(i)+dy);ctx.closePath();
  ctx.fillStyle=lin(0,y+h*0.4,0,y+h*0.4+dy,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.35)']]);ctx.fill();ctx.restore();
  // flaque de lumière du spot, posée en perspective sur la surface
  if(L&&DEV.spot.on){const ic=Math.round(0.3*COLS),gx=sx(ic)+dx*SPD,gy=sy(ic)+dy*SPD;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(gx,gy);ctx.scale(w*0.22,Math.abs(dy)*0.36);
    const pg=ctx.createRadialGradient(0,0,0,0,0,1);pg.addColorStop(0,`rgba(255,215,150,${0.5*DEV.spot.int/100})`);pg.addColorStop(1,'rgba(255,215,150,0)');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();ctx.restore()}
  ctx.restore();
}
function drawEnsFront(){
  const e=ensE;hot=[];if(e<=0.01)return;const R=ensRect(e),z=R.w/WW,{x,y,w,h,dx,dy}=R,L=lightRGB(),day=isDay();
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=Math.min(1,e*1.4);
  const sx=i=>x+(i*CS+CS/2)*z,sy=i=>y+(Y0+SURF[i]*CS)*z;
  // ---- face droite : coupe du sol vue de biais ----
  const iL=COLS-1,yOf=jj=>y+(Y0+jj*CS)*z;let j=SURF[iL];
  while(j<ROWS){const t=T[K(iL,j)];let j2=j;while(j2<ROWS&&T[K(iL,j2)]===t)j2++;const ty=TYPES[t||2];
    poly([[x+w,yOf(j)],[x+w+dx,yOf(j)+dy],[x+w+dx,yOf(j2)+dy],[x+w,yOf(j2)]],hsl(ty.h,ty.s,ty.l*0.6),null);j=j2}
  poly([[x+w,y],[x+w+dx,y+dy],[x+w+dx,y+h+dy],[x+w,y+h]],lin(x+w,0,x+w+dx,0,[[0,'rgba(255,255,255,0.08)'],[1,'rgba(255,255,255,0.01)']]),null);
  // ---- lumière dans la boîte : uniquement dans l'air, au-dessus du sol ----
  const skyClip=()=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+w+dx,y+dy);ctx.lineTo(x+w+dx,sy(COLS-1)+dy);for(let i=COLS-1;i>=0;i-=3)ctx.lineTo(sx(i)+dx*0.0,sy(i));ctx.lineTo(x,sy(0));ctx.closePath()};
  const P=(fx,fz)=>[x+w*fx+dx*fz,y+dy*fz];
  const ic=Math.round(0.3*COLS),SP=P(0.3,SPD),GX=sx(ic)+dx*SPD,GY=sy(ic)+dy*SPD;
  ctx.save();skyClip();ctx.clip();ctx.globalCompositeOperation='lighter';
  // néon : rideau de lumière sur toute la profondeur
  if(day&&DEV.neon.on){const c=NEON[DEV.neon.type].rgb,a=0.16*DEV.neon.int/100;ctx.fillStyle=lin(0,y+dy,0,y+h*0.62,[[0,rgba(c,a)],[1,rgba(c,a*0.2)]]);ctx.fillRect(x,y+dy,w+dx,h)}
  // spot : cône qui part du centre du couvercle et tombe au milieu de la surface
  if(day&&DEV.spot.on){const a=0.26*DEV.spot.int/100,rx=w*0.2;ctx.fillStyle=lin(0,SP[1],0,GY,[[0,`rgba(255,215,150,${a})`],[1,`rgba(255,215,150,${a*0.3})`]]);
    ctx.beginPath();ctx.moveTo(SP[0]-6,SP[1]);ctx.lineTo(SP[0]+6,SP[1]);ctx.lineTo(GX+rx,GY);ctx.lineTo(GX-rx,GY);ctx.closePath();ctx.fill()}
  // brume : nappes sur toute la profondeur, sous chaque buse (buses cachées sous le couvercle)
  for(const cl of clouds){const k=Math.min(1,cl.t),col=clamp(Math.round(cl.x/CS),0,COLS-1);
    for(const f of [0.12,0.35,0.58,0.82]){const bx=x+cl.x*z+dx*f,by=y+(Y0+2)*z+dy*f,gy=sy(col)+dy*f;
      ctx.fillStyle=lin(0,by,0,gy,[[0,`rgba(215,238,255,${0.16*k})`],[1,`rgba(215,238,255,${0.03*k})`]]);ctx.beginPath();ctx.moveTo(bx-3,by);ctx.lineTo(bx+3,by);ctx.lineTo(bx+16,gy);ctx.lineTo(bx-16,gy);ctx.closePath();ctx.fill()}}
  ctx.fillStyle='rgba(200,230,255,0.5)';
  ctx.beginPath();for(let q=0;q<drops.length;q+=3){const d=drops[q];for(let m=0;m<2;m++){const f=((q*0.618+m*0.5)%1)*0.9+0.05,jx=((q*37+m*11)%9)-4;ctx.rect(x+d.x*z+dx*f+jx,y+d.y*z+dy*f,1,1.6)}}ctx.fill();
  ctx.restore();
  // ---- couvercle grillagé ----
  poly([[x,y],[x+dx,y+dy],[x+w+dx,y+dy],[x+w,y]],'rgba(18,22,30,0.55)',null);
  ctx.strokeStyle='rgba(150,170,190,0.2)';ctx.lineWidth=0.5;ctx.beginPath();
  for(let q=1;q<30;q++){const f=q/30;ctx.moveTo(x+w*f,y);ctx.lineTo(x+w*f+dx,y+dy)}for(let q=1;q<8;q++){const f=q/8;ctx.moveTo(x+dx*f,y+dy*f);ctx.lineTo(x+w+dx*f,y+dy*f)}ctx.stroke();
  // ---- rampe néon : boîtier en volume + tube cylindrique ----
  {const [ax,ay]=P(0.1,0.8),[bx,by]=P(0.9,0.8),on=day&&DEV.neon.on,c=NEON[DEV.neon.type].rgb;
    const ux=dx*0.08,uy=dy*0.08;
    poly([[ax-3,ay-9],[bx+3,by-9],[bx+3+ux,by-9+uy],[ax-3+ux,ay-9+uy]],'#30343c',null);
    poly([[ax-3,ay-9],[bx+3,by-9],[bx+3,by-4],[ax-3,ay-4]],lin(0,ay-9,0,ay-4,[[0,'#3a3f48'],[1,'#15181d']]),'#555c66',0.5);
    if(on){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(c,0.35);ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ax+2,ay-2);ctx.lineTo(bx-2,by-2);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.lineCap='round';ctx.strokeStyle=on?rgba(c,1):'#2e3138';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(ax+2,ay-2);ctx.lineTo(bx-2,by-2);ctx.stroke();
    ctx.strokeStyle=on?'rgba(255,255,255,0.9)':'#4a4e56';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(ax+2,ay-2.8);ctx.lineTo(bx-2,by-2.8);ctx.stroke();ctx.lineCap='butt';
    ctx.fillStyle='#22252b';ctx.fillRect(ax-3,ay-5,4,5);ctx.fillRect(bx-1,by-5,4,5);
    hot.push({id:'neon',x:Math.min(ax,bx)-4,y:Math.min(ay,by)-16,w:Math.abs(bx-ax)+10,h:18,label:'Néon'})}
  // ---- spot LED : posé sur le grillage du couvercle (rien ne pend à l'intérieur) ----
  {const [cx,cy]=SP,on=day&&DEV.spot.on,R=13;
    if(on){ctx.save();ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(cx,cy,2,cx,cy,R*2.4);gg.addColorStop(0,`rgba(255,220,160,${0.5*DEV.spot.int/100})`);gg.addColorStop(1,'rgba(255,220,160,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.ellipse(cx,cy,R*2.4,R*0.9,0,0,TAU);ctx.fill();ctx.restore()}
    ctx.fillStyle='rgba(0,0,0,0.45)';ctx.beginPath();ctx.ellipse(cx+3,cy+1,R*1.05,R*0.38,0,0,TAU);ctx.fill();
    // corps cylindrique + dôme vu d'en haut
    ctx.fillStyle=lin(cx-R,0,cx+R,0,[[0,'#16181c'],[0.35,'#5d636c'],[0.6,'#2c3037'],[1,'#0e1013']]);ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx-R*0.8,cy-R*0.9);ctx.lineTo(cx+R*0.8,cy-R*0.9);ctx.lineTo(cx+R,cy);ctx.ellipse(cx,cy,R,R*0.36,0,0,Math.PI);ctx.closePath();ctx.fill();
    ctx.fillStyle=lin(cx-R,cy-R,cx+R,cy-R,[[0,'#3a3f47'],[0.4,'#9aa1ab'],[1,'#2a2e34']]);ctx.beginPath();ctx.ellipse(cx,cy-R*0.9,R*0.8,R*0.29,0,0,TAU);ctx.fill();
    ctx.fillStyle='#1b1e22';ctx.beginPath();ctx.ellipse(cx,cy-R*0.9,R*0.25,R*0.09,0,0,TAU);ctx.fill();
    ctx.strokeStyle='#1b1e22';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx,cy-R*0.9);ctx.quadraticCurveTo(cx-R*0.6,cy-R*2.2,cx-R*2.5,cy-R*2.4);ctx.stroke();
    ctx.fillStyle=on?'#ffe9a8':'#333';ctx.beginPath();ctx.arc(cx+R*0.55,cy-R*0.25,1.4,0,TAU);ctx.fill();
    hot.push({id:'spot',x:cx-R-6,y:cy-R*1.6,w:R*2+12,h:R*2.2,label:'Spot LED'})}
  // ---- boîtier du brumisateur (inchangé, en volume) ----
  const mx=x+w+dx+8,my=y+dy+6;
  box3(mx,my,34,26,8,R,lin(mx,my,mx,my+26,[[0,'#1c2530'],[1,'#10161d']]),'#2a3542','#0c1117','#6aa8d8');
  ctx.fillStyle='#08130e';ctx.fillRect(mx+3,my+3,28,10);ctx.fillStyle=clouds.length?'#7fe6ff':'#7f7';ctx.font='7px ui-monospace,monospace';
  ctx.fillText(DEV.mist.auto?(clouds.length?'≋ ON':Math.max(0,Math.ceil(showerT))+'s'):'OFF',mx+5,my+10.5);
  ctx.fillStyle=DEV.mist.auto?'#3c8':'#a33';ctx.beginPath();ctx.arc(mx+8,my+19,2,0,TAU);ctx.fill();ctx.fillStyle='#456';ctx.fillRect(mx+14,my+17,16,4);
  const tube=(pts)=>{ctx.lineCap='round';ctx.strokeStyle='#3d5468';ctx.lineWidth=2.6;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.strokeStyle='#8fb2cf';ctx.lineWidth=0.8;ctx.stroke();ctx.lineCap='butt'};
  tube([[mx,my+8],[x+w+dx*0.75,y+dy*0.95-5],[x+w*0.95+dx*0.8,y+dy*0.8]]);
  hot.push({id:'mist',x:mx-3,y:my-6,w:44,h:36,label:'Brumisateur'});
  // ---- réservoir cylindrique ----
  {const rw=Math.max(26,Math.min(38,W-mx-12)),cx=mx+2+rw/2,rh=h*0.42,top=y+h-rh+dy*0.25-4,bot=top+rh,ry=rw*0.22,lv=DEV.pump.level/100,wl=bot-(rh-4)*lv*0.95;
    // fond et paroi arrière
    ctx.fillStyle='rgba(120,170,220,0.06)';ctx.beginPath();ctx.ellipse(cx,bot,rw/2,ry,0,0,TAU);ctx.fill();
    // eau : cylindre + surface elliptique
    if(lv>0.01){ctx.save();ctx.beginPath();ctx.moveTo(cx-rw/2+1,wl);ctx.lineTo(cx-rw/2+1,bot);ctx.ellipse(cx,bot,rw/2-1,ry-0.5,0,Math.PI,0,true);ctx.lineTo(cx+rw/2-1,wl);ctx.ellipse(cx,wl,rw/2-1,ry-0.5,0,0,Math.PI);ctx.closePath();
      ctx.fillStyle=lin(cx-rw/2,0,cx+rw/2,0,[[0,'rgba(30,80,170,0.75)'],[0.35,'rgba(70,150,240,0.6)'],[0.6,'rgba(110,180,255,0.45)'],[1,'rgba(25,70,160,0.8)']]);ctx.fill();ctx.clip();
      if(clouds.length){ctx.fillStyle='rgba(220,240,255,0.75)';for(let q=0;q<7;q++){const bx=cx-rw/2+4+((q*37)%(rw-8)),by=bot-4-((simT*28+q*17)%Math.max(4,bot-wl));ctx.beginPath();ctx.arc(bx,by,1+((q*13)%3)*0.3,0,TAU);ctx.fill()}}ctx.restore();
      ctx.fillStyle='rgba(150,205,255,0.55)';ctx.beginPath();ctx.ellipse(cx,wl,rw/2-1,ry-0.5,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(220,240,255,0.6)';ctx.lineWidth=0.5;ctx.stroke()}
    // paroi de verre : contours + reflets
    ctx.strokeStyle='rgba(190,225,255,0.8)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(cx-rw/2,top);ctx.lineTo(cx-rw/2,bot);ctx.ellipse(cx,bot,rw/2,ry,0,Math.PI,0,true);ctx.lineTo(cx+rw/2,top);ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx,top,rw/2,ry,0,0,TAU);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(cx-rw/2+3,top+3,2.5,rh-6);ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(cx+rw/2-6,top+5,1.5,rh-10);
    // bouchon cylindrique
    const cw=rw*0.42,ch=6;ctx.fillStyle=lin(cx-cw/2,0,cx+cw/2,0,[[0,'#1b1e23'],[0.4,'#4a505a'],[1,'#16191d']]);ctx.fillRect(cx-cw/2,top-ry*0.6-ch,cw,ch);
    ctx.fillStyle='#5a616b';ctx.beginPath();ctx.ellipse(cx,top-ry*0.6-ch,cw/2,ry*0.4,0,0,TAU);ctx.fill();
    // pompe au pied
    box3(cx-rw/2-2,bot+2,rw+4,9,5,R,lin(0,bot+2,0,bot+11,[[0,'#26303a'],[1,'#141a20']]),'#323e4a','#0d1216','#4f6273');
    ctx.fillStyle=clouds.length?'#7fe6ff':'#4a6';ctx.beginPath();ctx.arc(cx-rw/2+4,bot+6.5,1.4,0,TAU);ctx.fill();
    tube([[cx,top-ry*0.6-ch],[cx,my+30],[mx+17,my+26]]);
    ctx.fillStyle='#bfe3ff';ctx.font='600 8px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(Math.round(DEV.pump.level)+'%',cx,top+rh*0.35);ctx.textAlign='left';
    hot.push({id:'pump',x:cx-rw/2-4,y:top-14,w:rw+8,h:rh+28,label:'Réservoir'})}
  // ---- vitres avant : reflets ----
  ctx.save();skyClip();ctx.clip();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.fillStyle=lin(x,y,x+w,y+h,[[0,'rgba(255,255,255,0.09)'],[0.3,'rgba(255,255,255,0.015)'],[0.31,'rgba(255,255,255,0.05)'],[0.42,'rgba(255,255,255,0)'],[1,'rgba(255,255,255,0.035)']]);ctx.fillRect(x,y,w,h);
  const shf=(simT*0.02)%1;ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x+w*(0.05+shf*0.1),y+h);ctx.lineTo(x+w*(0.3+shf*0.1),y);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w*(0.16+shf*0.1),y+h);ctx.lineTo(x+w*(0.41+shf*0.1),y);ctx.stroke();
  ctx.restore();
  // ---- montants en aluminium (volume) ----
  const FC=frameCols();const post=(px,py,ph,wd)=>{ctx.fillStyle=lin(px-wd/2,0,px+wd/2,0,[[0,FC[0]],[0.45,FC[1]],[0.6,FC[2]],[1,FC[0]]]);ctx.fillRect(px-wd/2,py,wd,ph)};
  post(x+w+dx,y+dy,h,2.4);
  ctx.strokeStyle='#14171b';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x+w,y);ctx.lineTo(x+w+dx,y+dy);ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+w+dx,y+dy);ctx.stroke();
  ctx.strokeStyle='rgba(200,215,230,0.35)';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+w,y-1);ctx.lineTo(x+w+dx,y+dy-1);ctx.moveTo(x,y-1);ctx.lineTo(x+dx,y+dy-1);ctx.lineTo(x+w+dx,y+dy-1);ctx.stroke();
  post(x,y,h,4);post(x+w,y,h,4);
  ctx.fillStyle=lin(0,y-3,0,y+2,[[0,FC[1]],[1,FC[0]]]);ctx.fillRect(x-2,y-2.5,w+4,4.5);
  post(x+w/2,y,h*0.86,2.6);
  ctx.fillStyle=lin(0,y+h*0.42,0,y+h*0.42+12,[[0,'#c9ced6'],[1,'#6c727c']]);ctx.fillRect(x+w/2-6,y+h*0.42,2,12);ctx.fillRect(x+w/2+4,y+h*0.42,2,12);
  // ventilation en façade
  const vy=y+h*0.86;ctx.fillStyle=DEV.vent.open?'#07080a':'#1b1f25';ctx.fillRect(x+2,vy,w-4,h*0.14-1.5);
  ctx.strokeStyle='#5a626c';ctx.lineWidth=0.6;ctx.beginPath();for(let q=1;q<34;q++){const xx=x+w*q/34;ctx.moveTo(xx,vy+2);ctx.lineTo(xx+(DEV.vent.open?1.5:0.2),vy+h*0.14-4)}ctx.stroke();
  hot.push({id:'vent',x:x+w*0.55,y:vy,w:w*0.42,h:h*0.14,label:'Ventilation'});
  // ---- thermo-hygromètre à cadran, collé à la vitre ----
  {const r=TH.r*z,gx=x+TH.x*z,gy=y+(Y0+TH.y)*z,n=Math.hypot(dx,dy)||1,ux=dx/n*r*0.16,uy=dy/n*r*0.16;
    // ombre portée sur la vitre, puis ventouse
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.ellipse(gx+ux*1.4+2,gy+uy*1.4+3,r*1.02,r*0.98,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(200,230,255,0.18)';ctx.beginPath();ctx.ellipse(gx+ux,gy+uy,r*0.55,r*0.5,0,0,TAU);ctx.fill();
    // épaisseur du boîtier : cylindre métallique vu de biais
    for(let q=8;q>=1;q--){const f=q/8;ctx.fillStyle=q===8?'#2a2e34':`hsl(215,6%,${18+q*3}%)`;ctx.beginPath();ctx.arc(gx+ux*f,gy+uy*f,r,0,TAU);ctx.fill()}
    ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(gx+ux*0.5,gy+uy*0.5,r,-Math.PI*0.95,-Math.PI*0.35);ctx.stroke();
    if(has('thermo'))drawGaugeCached(ctx,gx,gy,r,temp(),surfWet());else{ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.setLineDash([2,2]);ctx.beginPath();ctx.arc(gx,gy,r,0,TAU);ctx.stroke();ctx.setLineDash([])}
    // verre bombé : reflet de la lampe
    ctx.save();ctx.globalCompositeOperation='lighter';const rg=ctx.createRadialGradient(gx-r*0.35,gy-r*0.4,0,gx-r*0.35,gy-r*0.4,r*0.7);rg.addColorStop(0,'rgba(255,255,255,0.35)');rg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(gx,gy,r*0.84,0,TAU);ctx.fill();ctx.restore();
    hot.push({id:'thermo',x:gx-r-3,y:gy-r-3,w:r*2+6,h:r*2+6,label:'Thermo'})}
  // ---- socle en volume + tapis chauffant ----
  const bh=12,ux=dx,uy=dy;
  poly([[x-4,y+h],[x+w+4,y+h],[x+w+4,y+h+bh],[x-4,y+h+bh]],lin(0,y+h,0,y+h+bh,[[0,'#24282e'],[0.15,'#16191d'],[1,'#0b0c0e']]),null);
  poly([[x+w+4,y+h],[x+w+ux+4,y+h+uy],[x+w+ux+4,y+h+uy+bh],[x+w+4,y+h+bh]],'#0a0b0d',null);
  ctx.strokeStyle='rgba(200,215,230,0.3)';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x-4,y+h+0.5);ctx.lineTo(x+w+4,y+h+0.5);ctx.lineTo(x+w+ux+4,y+h+uy+0.5);ctx.stroke();
  const hm=DEV.heat.on;
  if(hm){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,100,30,${0.25+0.1*Math.sin(simT*2)})`;ctx.fillRect(x+w*0.08,y+h+2,w*0.6,bh-4);ctx.globalCompositeOperation='source-over'}
  ctx.strokeStyle=hm?'#ff8a40':'#3a2a24';ctx.lineWidth=1;ctx.beginPath();for(let q=0;q<10;q++){const xx=x+w*0.1+q*w*0.056;ctx.moveTo(xx,y+h+3);ctx.lineTo(xx+w*0.028,y+h+bh-3)}ctx.stroke();
  hot.push({id:'heat',x:x+w*0.06,y:y+h,w:w*0.64,h:bh+2,label:'Tapis chauffant'});
  // ---- étiquettes ----
  if(e>0.95&&OPT.labels){ctx.font='600 9px -apple-system,Roboto,sans-serif';ctx.textAlign='center';
    const ic={spot:'💡',neon:'▬',mist:'💨',pump:'🚰',vent:'🌀',thermo:'🌡',heat:'🔥'};
    for(const hs of hot){const lk=devLocked(hs.id),t=(lk?'🔒 ':'')+ic[hs.id]+' '+hs.label,tw=ctx.measureText(t).width+8;let lx=clamp(hs.x+hs.w/2,tw/2+2,W-tw/2-2),ly=hs.id==='heat'?hs.y+hs.h+13:hs.id==='thermo'?hs.y+hs.h+12:hs.y-3;
      ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(lx-tw/2,ly-9,tw,12);ctx.strokeStyle='rgba(255,233,77,0.4)';ctx.lineWidth=0.6;ctx.strokeRect(lx-tw/2,ly-9,tw,12);ctx.fillStyle=lk?'#999':'#ffe94d';ctx.fillText(t,lx,ly)}
    ctx.textAlign='left'}
  ctx.restore();
}
// ----- historique pour le thermo-hygromètre -----
const HIST={t:[],h:[],acc:0};
function devTick(dt){HIST.acc+=dt;if(HIST.acc>=2){HIST.acc=0;HIST.t.push(temp());HIST.h.push(surfWet());if(HIST.t.length>90){HIST.t.shift();HIST.h.shift()}}}
function gaugeSVG(){const c=document.createElement('canvas');c.width=360;c.height=360;const g=c.getContext('2d');drawGauge(g,180,180,170,temp(),surfWet());return `<img src="${c.toDataURL()}" style="width:150px;height:150px;display:block;margin:6px auto">`}
function histSVG(){const n=HIST.t.length;if(n<2)return '<p class="dim">Historique : quelques secondes de patience…</p>';
  const W2=300,H2=70,px=i=>i/(n-1)*W2,pt=v=>H2-clamp((v-15)/20,0,1)*H2,ph=v=>H2-clamp(v,0,1)*H2;
  const lt=HIST.t.map((v,i)=>`${px(i).toFixed(1)},${pt(v).toFixed(1)}`).join(' '),lh=HIST.h.map((v,i)=>`${px(i).toFixed(1)},${ph(v).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W2} ${H2+14}" style="width:100%;height:auto;background:#0b0d10;border:1px solid #2a2f36;border-radius:8px;margin-top:4px">
   <rect x="0" y="${ph(0.9)}" width="${W2}" height="${ph(0.2)-ph(0.9)}" fill="#4caf5022"/>
   <polyline points="${lt}" fill="none" stroke="#e53935" stroke-width="2"/><polyline points="${lh}" fill="none" stroke="#1e88e5" stroke-width="2"/>
   <text x="4" y="${H2+11}" fill="#e57373" font-size="10">Température (15–35 °C)</text><text x="${W2-4}" y="${H2+11}" fill="#64b5f6" font-size="10" text-anchor="end">Humidité (zone verte : 20–90 %)</text></svg>
   <p class="dim">${n*2/60<1.5?'La dernière minute.':`Les ${Math.round(n*2/60)} dernières minutes.`}</p>`}
// ================= PANNEAU DE RÉGLAGE =================
const devp=document.getElementById('devp');
function row(label,inner){return `<div class="drow"><span>${label}</span>${inner}</div>`}
function dayRow(){return row(`Durée du jour <b>${DEV.time.day}%</b>`,`<input type="range" min="20" max="100" value="${DEV.time.day}" data-k="time.day">`)+`<p class="dim">${isDay()?'☀ Il fait jour':'☾ Il fait nuit'} · cycle de ${DAYLEN} s, partagé par les deux lampes</p>`}
function openDev(id){
  if(!id){devp.style.display='none';return}
  let h='';
  if(devLocked(id)){const T={neon:'▬ Néon T5',vent:'🌀 Ventilation',heat:'🔥 Tapis chauffant',thermo:'🌡 Thermo-hygromètre'}[id];
    devp.innerHTML=`<div class="dbox"><h2>${T}</h2><p>${lockTxt(DEV_KEY[id])}</p><button class="btn2" data-act="close">Fermer</button></div>`;devp.style.display='flex';
    devp.querySelector('[data-act]').onclick=()=>openDev(null);return}
  if(id==='spot')h=`<h2>💡 Spot LED</h2><p>Lumière chaude et concentrée. Elle fait pousser les plantes, mais elle <b>chauffe</b> (jusqu'à +3,5 °C) et assèche le sol.</p>`+row('Allumé',`<input type="checkbox" data-k="spot.on" ${DEV.spot.on?'checked':''}>`)+row(`Intensité <b>${DEV.spot.int}%</b>`,`<input type="range" min="10" max="100" value="${DEV.spot.int}" data-k="spot.int">`)+dayRow();
  if(id==='neon')h=`<h2>▬ Néon T5</h2><p>Lumière diffuse sur toute la largeur, qui chauffe peu. Le type de tube change la croissance et l'ambiance du vivarium.</p>`+row('Allumé',`<input type="checkbox" data-k="neon.on" ${DEV.neon.on?'checked':''}>`)+row(`Intensité <b>${DEV.neon.int}%</b>`,`<input type="range" min="10" max="100" value="${DEV.neon.int}" data-k="neon.int">`)
    +`<div class="drow"><span>Tube</span><span class="seg">${Object.entries(NEON).map(([k,v])=>`<button data-neon="${k}" class="${DEV.neon.type===k?'on':''}" style="--c:rgb(${v.rgb})" ${k!=='blanc'&&!has('tubes')?'disabled':''}>${k!=='blanc'&&!has('tubes')?'🔒 ':''}${v.nom}</button>`).join('')}</span></div>`
    +`<p class="dim">Blanc froid : croissance normale · Horticole : croissance ×1,45, lumière rose · UV-B : croissance faible, ambiance violette.</p>`+dayRow();
  if(id==='mist'){const broken=lvl.showers===false||!has('prog');h=`<h2>💨 Brumisateur</h2><p>Les buses humidifient la surface. Il puise l'eau dans le réservoir.</p>`+row(!has('prog')?'Programmateur <b class="ko">🔒</b>':broken?'Programmateur <b class="ko">en panne</b>':'Programmateur',`<input type="checkbox" data-k="mist.auto" ${DEV.mist.auto&&!broken?'checked':''} ${broken?'disabled':''}>`)+row(`Toutes les <b>${DEV.mist.every} s</b>`,`<input type="range" min="40" max="240" step="10" value="${DEV.mist.every}" data-k="mist.every">`)+row(`Durée <b>${DEV.mist.dur} s</b>`,`<input type="range" min="1" max="6" step="0.5" value="${DEV.mist.dur}" data-k="mist.dur">`)+`<button class="btn" data-act="mistnow">Brumiser maintenant</button>`}
  if(id==='pump')h=`<h2>🚰 Réservoir et pompe</h2><p>Chaque brumisation vide un peu le réservoir. Vide, plus rien ne sort.</p>`+row(`Niveau <b>${Math.round(DEV.pump.level)}%</b>`,`<span class="lvl"><i style="width:${DEV.pump.level}%"></i></span>`)+row(`Débit de la pompe <b>×${DEV.pump.flow}</b>`,`<input type="range" min="0.5" max="2" step="0.25" value="${DEV.pump.flow}" data-k="pump.flow">`)+`<button class="btn" data-act="refill">Remplir le réservoir</button>`;
  if(id==='heat')h=`<h2>🔥 Tapis chauffant</h2><p>La chaleur accélère tout le monde : les bêtes mangent plus et se reproduisent plus vite… et le sol sèche plus vite.</p>`+row('Allumé',`<input type="checkbox" data-k="heat.on" ${DEV.heat.on?'checked':''}>`)+row(`Température visée <b>${DEV.heat.target}°C</b>`,`<input type="range" min="18" max="32" value="${DEV.heat.target}" data-k="heat.target">`);
  if(id==='vent')h=`<h2>🌀 Ventilation</h2><p>Ouverte : l'air se renouvelle et le sol sèche plus vite. Fermée : l'humidité reste.</p>`+row('Grille ouverte',`<input type="checkbox" data-k="vent.open" ${DEV.vent.open?'checked':''}>`);
  if(id==='thermo')h=`<h2>🌡 Thermo-hygromètre</h2>`+gaugeSVG()+histSVG()+row('Température',`<b>${temp().toFixed(1).replace('.',',')} °C</b>`)+row('Humidité de surface',`<b>${Math.round(surfWet()*100)} %</b>`)+row('Humidité en profondeur',`<b>${Math.round(deepWet()*100)} %</b>`)+row('Lumière',`<b>${isDay()?'jour':'nuit'} · ×${lightF().toFixed(2).replace('.',',')}</b>`)+row('Métabolisme des bêtes',`<b>×${metabF().toFixed(2).replace('.',',')}</b>`)+`<p class="dim">Plantes : 20–90 % d'humidité. Cloportes et lombrics : plus de 25–30 %.</p>`;
  devp.innerHTML=`<div class="dbox">${h}<button class="btn2" data-act="close">Fermer</button></div>`;devp.style.display='flex';
  devp.querySelectorAll('[data-k]').forEach(inp=>inp.oninput=inp.onchange=()=>{const [a,b]=inp.dataset.k.split('.');DEV[a][b]=inp.type==='checkbox'?inp.checked:+inp.value;openDev(id)});
  devp.querySelectorAll('[data-neon]').forEach(bt=>bt.onclick=()=>{DEV.neon.type=bt.dataset.neon;openDev(id)});
  devp.querySelectorAll('[data-act]').forEach(bt=>bt.onclick=()=>{const a=bt.dataset.act;if(a==='close')openDev(null);
    if(a==='refill'){DEV.pump.level=100;openDev(id)}
    if(a==='mistnow'){if(lvl.stock.pluie!=null){if(stock.pluie<=0){say('Plus de brumisation en réserve');return}stock.pluie--;refreshPalette()}for(const x of nozzles())rainAt(x,DEV.mist.dur);openDev(null)}});
}
devp.addEventListener('click',e=>{if(e.target===devp)openDev(null)});
// ================= GESTES =================
const pts=new Map();let gest=null;
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}
  pts.set(e.pointerId,{x:(e.clientX-CVL),y:e.clientY});
  if(pts.size===2){const [a,b]=[...pts.values()];const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;gest={pinch:true,d0:Math.max(10,dist(a.x,a.y,b.x,b.y)),z0:camZ,w:s2w(mx,my),done:false,tm:ZM,tw:[zx0+mx/ZM,(TYB-my)/ZM+zz0]}}
  else gest={pinch:false,moved:false,x0:(e.clientX-CVL),y0:e.clientY,cx:camX,cy:camY,zx:zx0,zz:zz0};
});
cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p||!gest)return;p.x=(e.clientX-CVL);p.y=e.clientY;
  if(gest.pinch&&pts.size>=2){const [a,b]=[...pts.values()];const d=dist(a.x,a.y,b.x,b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,f=d/gest.d0;
    if(view==='ens'){if(f>1.25&&!gest.done){gest.done=true;exitEns()}return}
    if(view==='top'){ZM=clamp(gest.tm*f,topFit(),8);zx0=gest.tw[0]-mx/ZM;zz0=gest.tw[1]-(TYB-my)/ZM;topClamp();return}
    if(view!=='side')return;
    if(gest.z0*f<fitZ*0.85&&!gest.done){gest.done=true;enterEns();return}
    camZ=clamp(gest.z0*f,fitZ,18);camX=gest.w[0]-(mx-W/2)/camZ;camY=gest.w[1]-(my-H/2)/camZ;camClamp();return}
  if(!gest.pinch){const dx=(e.clientX-CVL)-gest.x0,dy=e.clientY-gest.y0;if(!gest.moved&&Math.hypot(dx,dy)>9)gest.moved=true;
    if(gest.moved&&view==='side'){camX=gest.cx-dx/camZ;camY=gest.cy-dy/camZ;camClamp()}
    if(gest.moved&&view==='top'){zx0=gest.zx-dx/ZM;zz0=gest.zz+dy/ZM;topClamp()}}
});
const endPtr=e=>{const had=pts.has(e.pointerId);pts.delete(e.pointerId);if(!had||!gest)return;
  if(!gest.pinch&&!gest.moved&&pts.size===0)tapScreen((e.clientX-CVL),e.clientY);
  if(pts.size===0)gest=null};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);if(!pts.size)gest=null});
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt((e.clientX-CVL),e.clientY,e.deltaY<0?1.18:1/1.18)},{passive:false});
// point du sol visé en vue 3/4 : abscisse (mm) et profondeur depuis la vitre (mm)
function pickVolume(sx,sy){const R=ensRect(ensE),z=R.w/WW;let best=null,bd=1e9;
  for(let i=0;i<COLS;i++){const fy=R.y+surfY(i)*z;let f=R.dy?(sy-fy)/R.dy:0;if(f<-0.03||f>1.02)continue;f=clamp(f,0,0.96);
    const X=R.x+(i*CS+CS/2)*z+R.dx*f,dd=Math.abs(X-sx);if(dd<bd){bd=dd;best={x:i*CS+CS/2,dz:f*DEPTH_MM}}}
  if(best&&bd<10)return best;
  // sous la ligne du sol, sur la face avant : on pose contre la vitre
  if(sx>R.x&&sx<R.x+R.w&&sy>R.y&&sy<R.y+R.h)return {x:(sx-R.x)/z,dz:0};return null}
function tapScreen(sx,sy){
  if(state!=='play'||paused)return;initAudio();
  if(!tool){if(view==='ens'){for(const hs of hot)if(sx>=hs.x&&sx<=hs.x+hs.w&&sy>=hs.y&&sy<=hs.y+hs.h){openDev(hs.id);return}}if(view!=='anim')handFree(sx,sy);return}
  if(view==='ens'){for(const hs of hot)if(sx>=hs.x&&sx<=hs.x+hs.w&&sy>=hs.y&&sy<=hs.y+hs.h){openDev(hs.id);return}
    if(tool==='pluie'){const pk=pickVolume(sx,sy);if(pk)tapAction(pk.x,Y0+5);else say('Touche le vivarium pour brumiser');return}
    if(tool!=='loupe'&&tool!=='pluie'){const pk=pickVolume(sx,sy);if(pk){PLACE_DZ=pk.dz;const fl=SPI[tool]&&(SPI[tool].w||tool==='araignee');tapAction(pk.x,surfY(Math.floor(pk.x/CS))-(fl?40:1));PLACE_DZ=-1}else say('Touche le sol du vivarium pour poser');return}
    const R=ensRect(1);if(sx>R.x&&sx<R.x+R.w&&sy>R.y&&sy<R.y+R.h)exitEns();return}
  if(view==='anim')return;
  if(view==='top'){const wx=zx0+sx/ZM,wz=(TYB-sy)/ZM+zz0;if(wx<0||wx>WW||wz<0||wz>ZD){say('Touche à l\'intérieur du vivarium');return}PLACE_DZ=clamp(wz,0,ZD-10);const ii=clamp(Math.floor(wx/CS),0,COLS-1);setTimeout(()=>PLACE_DZ=-1,0);tapAction(wx,SPI[tool]&&(SPI[tool].w||tool==='araignee')?surfY(ii)-40:surfY(ii)-1);return}
  const [wx,wy]=s2w(sx,sy);
  if(tool==='loupe'){enterTop(wx);return}
  tapAction(wx,wy);
}
document.getElementById('zin').onclick=()=>zoomAt(W/2,(BAND_T+bandB())/2,1.5);
document.getElementById('zout').onclick=()=>zoomAt(W/2,(BAND_T+bandB())/2,1/1.5);
document.getElementById('zens').onclick=()=>{if(view==='top'){ZM=topFit();topClamp();return}if(view==='ens')exitEns();else if(view==='side'){camFit();enterEns()}};

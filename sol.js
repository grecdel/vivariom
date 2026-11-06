// ================= TERRE : NOUVELLE TEXTURE, SELON LE BIOME =================
// Chaque matière (humus, terre, sable, argile, roche, gravier) a une texture continue (motif qui se répète, sans grille),
// des couleurs qui changent selon le biome du bac (tempéré, tropical, désert, marais), et des détails semés une fois pour
// toutes : cailloux, racines, filaments de champignon, coquilles, fissures, taches de rouille, litière en surface.
// SOLSTYLE : 'nature' (fin, réaliste), 'illustre' (aplats et formes simples), 'actuel' (l'ancien rendu en cases).
let SOLSTYLE='nature';
const SPX2=6;// pixels par case dans l'image du sol
const SOLPAL={// [teinte, saturation, luminosité] par matière : 1 humus, 2 terre, 3 sable, 4 argile, 5 roche, 6 gravier
  tempere:[null,[26,38,12],[24,38,19],[40,42,40],[14,42,25],[30,6,32],[32,9,38]],
  tropical:[null,[18,40,11],[11,52,23],[34,38,38],[8,55,27],[20,14,27],[24,14,35]],
  desert:[null,[30,30,15],[28,36,27],[38,46,40],[20,48,32],[14,40,29],[30,16,40]],
  marais:[null,[28,28,8],[34,16,13],[44,20,33],[205,16,29],[90,6,17],[200,7,33]]};
function solBiome(){const C=typeof climat==='function'?climat():null,cl=C&&typeof curViv!=='undefined'&&curViv?curViv.climat:null;
  if(SOIL0==='marais')return 'marais';if(SOIL0==='desert'||cl==='desert')return 'desert';if(cl==='tropical')return 'tropical';
  if(typeof lvl!=='undefined'&&lvl&&!lvl.sandbox&&lvl.goal&&lvl.goal.alive&&lvl.goal.alive.some(id=>id==='scorpion'||id==='tenebrion'))return 'desert';
  return 'tempere'}
const hsh=(a,b,c=0)=>{let h=(a*374761393+b*668265263+c*1274126177)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};
// bruit de valeur qui se raccorde sur les bords du motif
function bruitTuile(x,y,per,seed){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,s=t=>t*t*(3-2*t),P=v=>((v%per)+per)%per;
  const a=hsh(P(xi),P(yi),seed),b=hsh(P(xi+1),P(yi),seed),c=hsh(P(xi),P(yi+1),seed),d=hsh(P(xi+1),P(yi+1),seed);return a+(b-a)*s(fx)+(c-a)*s(fy)+(a-b-c+d)*s(fx)*s(fy)}
const TUILES={};const TS=128;
function tuile(bio,t,style){const key=bio+t+style;if(TUILES[key])return TUILES[key];
  const cv=document.createElement('canvas');cv.width=cv.height=TS;const q=cv.getContext('2d'),im=q.createImageData(TS,TS),D=im.data,[h,s,l]=SOLPAL[bio][t];
  const ill=style==='illustre',amp=ill?0.35:1;
  for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){let v=bruitTuile(x/16,y/16,TS/16,t)*0.6+bruitTuile(x/6,y/6,Math.round(TS/6),t+9)*0.4;
    if(t===4)v=v*0.5+0.5*bruitTuile(x/40,y/5,Math.max(1,Math.round(TS/40)),t+3);// argile : fines couches
    if(t===3&&!ill)v=v*0.6+0.4*bruitTuile(x/20,(y+x*0.35)/3,Math.max(1,Math.round(TS/20)),7);// sable : litage oblique
    let L=l+(v-0.5)*(t===5?16:9)*amp,H=h,S=s;
    if(!ill){const g=hsh(x,y,t*7+1);if(g<(t===3?0.22:t===2?0.08:t===1?0.06:0.03)){L+=(hsh(x,y,5)-0.5)*(t===3?26:16)}}
    const [R,G,B]=hslRGB(H,S,L),o=(y*TS+x)*4;D[o]=R;D[o+1]=G;D[o+2]=B;D[o+3]=255}
  q.putImageData(im,0,0);const r=(a)=>hsh(a,t,bio.length*13);
  // éléments dessinés par-dessus le grain
  if(t===1){// humus : fibres, débris de feuilles
    for(let n=0;n<(ill?10:40);n++){const x=r(n)*TS,y=r(n+50)*TS,a=r(n+100)*TAU,L=3+r(n+150)*(ill?10:7);q.strokeStyle=hsl(h+(r(n+7)<0.5?10:-6),s,l+(r(n+9)<0.5?9:-5),ill?0.6:0.7);q.lineWidth=ill?1.6:0.9;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+Math.cos(a+0.6)*L*0.5,y+Math.sin(a+0.6)*L*0.5,x+Math.cos(a)*L,y+Math.sin(a)*L);q.stroke()}
    if(bio==='tempere'||bio==='tropical')for(let n=0;n<(ill?2:6);n++){const x=r(n+300)*TS,y=r(n+330)*TS;q.fillStyle=hsl(r(n+360)<0.5?35:90,35,l+8,0.8);q.beginPath();q.ellipse(x,y,ill?4:2.5,ill?2:1.2,r(n+390)*3,0,TAU);q.fill()}}
  if(t===2||t===6){// cailloux
    const nb=t===6?(ill?14:28):t===3?3:(ill?3:7);for(let n=0;n<nb;n++){const x=r(n+400)*TS,y=r(n+430)*TS,R=(t===6?3:1.5)+r(n+460)*(t===6?5:3)*(ill?1.4:1),cl=t===6?l+8+r(n+490)*14:l+14+r(n+490)*10;
      for(const [dx,dy] of [[0,0],[TS,0],[-TS,0],[0,TS],[0,-TS]]){q.fillStyle=hsl(t===6?h:30,t===6?s:8,cl-12,0.9);q.beginPath();q.ellipse(x+dx+0.6,y+dy+0.8,R,R*0.75,r(n+520),0,TAU);q.fill();
        q.fillStyle=hsl(t===6?h:30,t===6?s+4:10,cl);q.beginPath();q.ellipse(x+dx,y+dy,R,R*0.75,r(n+520),0,TAU);q.fill();if(!ill){q.fillStyle='rgba(255,255,255,0.18)';q.beginPath();q.ellipse(x+dx-R*0.3,y+dy-R*0.3,R*0.35,R*0.22,0,0,TAU);q.fill()}else{q.strokeStyle='rgba(0,0,0,0.35)';q.lineWidth=0.8;q.stroke()}}}}
  if(t===3&&!ill){q.fillStyle='rgba(255,250,220,0.5)';for(let n=0;n<25;n++)q.fillRect(r(n+600)*TS,r(n+640)*TS,1,1)}// grains qui brillent
  if(t===4){// argile : fissures au sec, taches de rouille au marais
    if(bio==='marais'||bio==='tropical'){for(let n=0;n<(ill?4:10);n++){q.fillStyle=hsl(25,70,bio==='marais'?32:30,0.5);q.beginPath();q.ellipse(r(n+700)*TS,r(n+730)*TS,2+r(n+760)*4,1.5+r(n+790)*3,0,0,TAU);q.fill()}}
    else{q.strokeStyle=hsl(h,s,l-8,0.8);q.lineWidth=ill?1.2:0.7;for(let n=0;n<(ill?3:6);n++){let x=r(n+800)*TS,y=r(n+830)*TS;q.beginPath();q.moveTo(x,y);for(let k=0;k<4;k++){x+=(r(n*5+k+860)-0.5)*14;y+=4+r(n*5+k+900)*6;q.lineTo(x,y)}q.stroke()}}}
  if(t===5){// roche : fractures et facettes
    q.strokeStyle=hsl(h,s,l-10,0.9);q.lineWidth=ill?1.4:0.8;for(let n=0;n<(ill?4:8);n++){let x=r(n+1000)*TS,y=r(n+1030)*TS;q.beginPath();q.moveTo(x,y);for(let k=0;k<3;k++){x+=(r(n*4+k+1060)-0.5)*30;y+=(r(n*4+k+1100)-0.5)*20;q.lineTo(x,y)}q.stroke()}
    if(bio==='desert'){q.strokeStyle=hsl(h+8,s,l+6,0.5);q.lineWidth=1;for(let y=8;y<TS;y+=11+((y*7)%5)){q.beginPath();q.moveTo(0,y);for(let x=0;x<=TS;x+=16)q.lineTo(x,y+Math.sin(x/TS*TAU*2)*1.5);q.stroke()}}}
  if(t===3&&bio==='marais')for(let n=0;n<(ill?3:6);n++){const x=r(n+1200)*TS,y=r(n+1230)*TS;q.fillStyle='rgba(235,230,210,0.85)';q.beginPath();q.arc(x,y,ill?2.5:1.6,Math.PI,TAU);q.fill()}// coquilles
  return TUILES[key]=q.createPattern(cv,'repeat')}
// éléments semés sur toute la coupe : racines, filaments, gros cailloux (tirés une fois par bac)
function semis(bio){const out=[];const n=Math.round(COLS/9);
  for(let q=0;q<n;q++){const i=Math.floor(hsh(q,1,SOIL0.length)*COLS);if(bio!=='desert'&&hsh(q,2)<0.75)out.push({k:'racine',i,L:8+hsh(q,3)*(bio==='tropical'?34:24),s:q});
    if(bio==='tempere'&&hsh(q,4)<0.4)out.push({k:'myce',i:Math.floor(hsh(q,5)*COLS),j:hsh(q,6),s:q});
    if(hsh(q,7)<0.5)out.push({k:'galet',i:Math.floor(hsh(q,8)*COLS),j:hsh(q,9),R:1.2+hsh(q,10)*2.2,s:q})}
  return out}
const renderSoilAncien=renderSoil;
renderSoil=function(){if(SOLSTYLE==='actuel'){renderSoilAncien();return}
  const bio=solBiome(),ill=SOLSTYLE==='illustre',P=SPX2;soilCv.width=COLS*P;soilCv.height=ROWS*P;const q=sctx;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,soilCv.width,soilCv.height);
  // 1) matières, par bandes horizontales de même matière et même humidité
  for(let j=0;j<ROWS;j++){let i=0;while(i<COLS){const k=j*COLS+i,t=T[k];if(!t){i++;continue}const wb=Math.min(5,Math.floor(WET[k]*6));let e=i+1;
      while(e<COLS){const k2=j*COLS+e;if(T[k2]!==t||Math.min(5,Math.floor(WET[k2]*6))!==wb)break;e++}
      q.fillStyle=tuile(bio,t,SOLSTYLE);q.fillRect(i*P,j*P,(e-i)*P,P);
      const w=wb/5;if(w>0.15){q.fillStyle=`rgba(10,14,22,${(w*(t===3?0.45:0.32)).toFixed(3)})`;q.fillRect(i*P,j*P,(e-i)*P,P)}
      i=e}}
  // 1b) bords arrondis entre deux matières (fini l'escalier de cases)
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){const k=j*COLS+i,t=T[k];if(!t)continue;
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||ii>=COLS||jj<0||jj>=ROWS)continue;const t2=T[jj*COLS+ii];if(!t2||t2===t||t2<t)continue;
      q.fillStyle=tuile(bio,t,SOLSTYLE);q.beginPath();q.arc((i+0.5+di*0.35)*P,(j+0.5+dj*0.35)*P,P*(0.55+hsh(i,j,3)*0.3),0,TAU);q.fill();break}}
  // 2) passages d'une matière à l'autre : quelques grains mêlés (nature) ou un trait sombre (illustré)
  for(let j=0;j<ROWS-1;j++)for(let i=0;i<COLS;i++){const k=j*COLS+i,t=T[k],tb=T[k+COLS];if(!t||!tb||t===tb)continue;
    if(ill){q.fillStyle='rgba(0,0,0,0.28)';q.fillRect(i*P,(j+1)*P-1,P,2)}
    else{q.fillStyle=tuile(bio,tb,SOLSTYLE);for(let g=0;g<3;g++){const h=hsh(i,j,g);q.fillRect(i*P+h*P,j*P+P*(0.3+hsh(j,i,g)*0.6),1.5,1.5)}}}
  // 3) détails semés : racines, filaments blancs, gros galets
  const ok=(x,y)=>{const i=Math.floor(x/P),j=Math.floor(y/P);return i>=0&&i<COLS&&j>=0&&j<ROWS&&T[j*COLS+i]>0&&T[j*COLS+i]!==5};
  for(const s of semis(bio)){
    if(s.k==='racine'&&SURF[s.i]<ROWS){let x=(s.i+0.5)*P,y=(SURF[s.i]+1)*P;const col=bio==='marais'?hsl(35,30,30):hsl(30,30,ill?42:36);q.strokeStyle=col;q.lineCap='round';
      const pas=(L,w,d)=>{for(let n=0;n<L;n++){const a=Math.PI/2+Math.sin(n*0.5+s.s+d)*0.6+d*0.3,nx=x+Math.cos(a)*P*0.8,ny=y+Math.sin(a)*P*0.8;if(!ok(nx,ny))break;q.lineWidth=Math.max(0.6,w*(1-n/L));q.beginPath();q.moveTo(x,y);q.lineTo(nx,ny);q.stroke();x=nx;y=ny;
        if(!ill&&n%5===3&&w>1){const sx=x,sy=y;pas(L*0.35|0,w*0.5,d+(n%2?1.4:-1.4));x=sx;y=sy}}};pas(s.L|0,ill?2.4:1.8,0)}
    if(s.k==='myce'&&!ill){const j=Math.floor(SURF[s.i]+3+s.j*14);if(j<ROWS&&(T[j*COLS+s.i]===1||T[j*COLS+s.i]===2)){q.strokeStyle='rgba(235,230,215,0.45)';q.lineWidth=0.5;const x0=(s.i+0.5)*P,y0=(j+0.5)*P;
      for(let b=0;b<6;b++){let x=x0,y=y0;q.beginPath();q.moveTo(x,y);for(let n=0;n<5;n++){x+=(hsh(s.s,b,n)-0.5)*P*1.6;y+=(hsh(b,s.s,n)-0.5)*P*1.2;if(!ok(x,y))break;q.lineTo(x,y)}q.stroke()}}}
    if(s.k==='galet'){const j=Math.floor(SURF[s.i]+6+s.j*(ROWS-SURF[s.i]-8)),x=(s.i+0.5)*P,y=(j+0.5)*P,R=s.R*P;if(j>=ROWS||!ok(x,y)||!ok(x-R,y)||!ok(x+R,y))continue;
      q.fillStyle='rgba(0,0,0,0.35)';q.beginPath();q.ellipse(x+1,y+1.5,R,R*0.7,s.s,0,TAU);q.fill();const c=bio==='desert'?hsl(20,35,46):bio==='marais'?hsl(200,8,38):hsl(30,8,44);
      q.fillStyle=c;q.beginPath();q.ellipse(x,y,R,R*0.7,s.s,0,TAU);q.fill();if(ill){q.strokeStyle='rgba(0,0,0,0.45)';q.lineWidth=1;q.stroke()}else{q.fillStyle='rgba(255,255,255,0.16)';q.beginPath();q.ellipse(x-R*0.3,y-R*0.25,R*0.45,R*0.25,s.s,0,TAU);q.fill()}}}
  // 4) galeries : creux sombre, plafond dans l'ombre, sol tassé un peu plus clair
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){const k=j*COLS+i;if(T[k]||!DUG[k])continue;const x=i*P,y=j*P;
    q.fillStyle=bio==='desert'?'#1a120a':'#0a0705';q.fillRect(x,y,P,P);
    if(sol(i,j-1)){q.fillStyle='rgba(0,0,0,0.55)';q.fillRect(x,y,P,P*0.35)}
    if(sol(i,j+1)){q.fillStyle=bio==='desert'?'rgba(230,190,120,0.35)':'rgba(200,150,100,0.28)';q.fillRect(x,y+P*0.7,P,P*0.3)}
    if(sol(i-1,j)){q.fillStyle='rgba(0,0,0,0.3)';q.fillRect(x,y,P*0.25,P)}if(sol(i+1,j)){q.fillStyle='rgba(0,0,0,0.3)';q.fillRect(x+P*0.75,y,P*0.25,P)}}
  // 5) surface : litière, croûte, algues ; mouillé = luisant
  for(let i=0;i<COLS;i++){const j=SURF[i];if(j>=ROWS)continue;const k=j*COLS+i,t=T[k],x=i*P,y=j*P,w=WET[k],r=hsh(i,77);
    if(bio==='desert'||t===3){q.fillStyle=hsl(...(SOLPAL[bio][t]||SOLPAL[bio][3]).map((v,n)=>n===2?v+12:v));q.fillRect(x,y,P,P*0.3)}
    else if(bio==='marais'){q.fillStyle=hsl(95,40,18+r*8);q.fillRect(x,y,P,P*0.35+r*P*0.25)}
    else{q.fillStyle=hsl(t===1?60:40,25,12+r*6);q.fillRect(x,y,P,P*0.3);
      if(r<0.45){const lc=bio==='tropical'?[hsl(95,40,25),hsl(25,55,30),hsl(40,50,35)]:[hsl(30,55,30),hsl(40,60,38),hsl(15,45,25)];q.fillStyle=lc[Math.floor(hsh(i,78)*3)];
        q.beginPath();q.ellipse(x+P*0.5,y-P*0.05,P*(ill?0.9:0.75),P*0.28,hsh(i,79)-0.5,0,TAU);q.fill()}}
    if(w>0.75&&!ill&&r<0.5){q.fillStyle='rgba(170,210,255,0.35)';q.fillRect(x+r*P,y+P*0.1,P*0.4,1)}}
};
if(window.__sim)window.__sim.solStyle=s=>{SOLSTYLE=s;soilDirty=true;soilT=0};

// ---------- décors vus de dessus : objets dessinés en volume (lumière en haut à gauche, ombre portée) ----------
// Remplace drawDecosTop (decor.js). Chaque décor a sa forme propre, stable grâce à un tirage au sort lié à sa graine.
function decoRng(d){let s=Math.floor(((d.seed||0.37)*1e6+d.i*977))%2147483646+1;return ()=>(s=(s*16807)%2147483647)/2147483647}
function blobPath(g,x,y,rx,ry,rot,R,n=11,irr=0.18){const pts=[];for(let q=0;q<n;q++){const a=q/n*TAU,k=1-irr+R()*irr*2;pts.push([Math.cos(a)*rx*k,Math.sin(a)*ry*k])}
  const c=Math.cos(rot),s=Math.sin(rot),P=([u,v])=>[x+u*c-v*s,y+u*s+v*c];g.beginPath();
  for(let q=0;q<=n;q++){const a=P(pts[q%n]),b=P(pts[(q+1)%n]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];q?g.quadraticCurveTo(a[0],a[1],m[0],m[1]):g.moveTo(m[0],m[1])}g.closePath()}
function decoShadow(g,x,y,rx,ry,rot,a=0.35){g.save();g.fillStyle=`rgba(0,0,0,${a})`;g.beginPath();g.ellipse(x+rx*0.12+0.8,y+ry*0.18+1.2,rx*1.02,ry*1.05,rot,0,TAU);g.fill();g.restore()}
const radial=(g,x,y,r,stops)=>{const gr=g.createRadialGradient(x-r*0.35,y-r*0.4,r*0.05,x,y,r*1.1);stops.forEach(([o,c])=>gr.addColorStop(o,c));return gr};

drawDecosTop=function(g){for(const d of decos){const D=DECOS[d.type];if(!D)continue;const x=d.i*CS+CS/2,w=D.w*CS,y=-((d.dz||0)+d.w*CS*0.4),R=decoRng(d),rot=(d.seed||0)*TAU;g.save();
  if(d.type==='pierre'){const rx=w/2,ry=w*0.38;decoShadow(g,x,y,rx,ry,rot);blobPath(g,x,y,rx,ry,rot,R);{const P=couleurPierre();g.fillStyle=radial(g,x,y,rx,[[0,P[0]],[0.55,P[1]],[1,P[2]]])}g.fill();
    g.save();g.clip();for(let q=0;q<26;q++){g.fillStyle=`rgba(${R()<0.5?'40,42,46':'210,214,218'},${(0.15+R()*0.25).toFixed(2)})`;g.beginPath();g.arc(x+(R()-0.5)*rx*1.8,y+(R()-0.5)*ry*1.8,0.25+R()*0.5,0,TAU);g.fill()}
    g.strokeStyle='rgba(30,32,35,0.55)';g.lineWidth=0.25;g.beginPath();let cx=x-rx*0.4,cy=y-ry*0.2;g.moveTo(cx,cy);for(let q=0;q<4;q++){cx+=rx*0.22;cy+=(R()-0.4)*ry*0.3;g.lineTo(cx,cy)}g.stroke();g.restore();
    blobPath(g,x,y,rx,ry,rot,decoRng(d));g.strokeStyle='rgba(255,255,255,0.18)';g.lineWidth=0.35;g.stroke()}
  else if(d.type==='volcan'){const rx=w/2,ry=w*0.4;decoShadow(g,x,y,rx,ry,rot,0.45);blobPath(g,x,y,rx,ry,rot,R,13,0.22);g.fillStyle=radial(g,x,y,rx,[[0,'#5a5350'],[0.6,'#2e2927'],[1,'#151211']]);g.fill();
    g.save();g.clip();for(let q=0;q<38;q++){const px=x+(R()-0.5)*rx*1.9,py=y+(R()-0.5)*ry*1.9,r=0.25+R()*0.7;g.fillStyle='#080606';g.beginPath();g.arc(px,py,r,0,TAU);g.fill();g.strokeStyle='rgba(150,110,90,0.35)';g.lineWidth=0.15;g.beginPath();g.arc(px-0.1,py-0.1,r,Math.PI,Math.PI*1.6);g.stroke()}g.restore()}
  else if(d.type==='tronc'){const r=w/2;decoShadow(g,x,y,r,r,0,0.45);blobPath(g,x,y,r,r,rot,R,16,0.08);g.fillStyle='#3e2c1d';g.fill();
    g.save();g.clip();g.strokeStyle='rgba(20,12,6,0.6)';g.lineWidth=0.35;for(let q=0;q<30;q++){const a=q/30*TAU+R()*0.1;g.beginPath();g.moveTo(x+Math.cos(a)*r*0.82,y+Math.sin(a)*r*0.82);g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);g.stroke()}g.restore();
    g.fillStyle=radial(g,x,y,r*0.8,[[0,'#b08a5c'],[1,'#7a5a38']]);g.beginPath();g.arc(x,y,r*0.8,0,TAU);g.fill();
    g.strokeStyle='rgba(70,45,22,0.55)';g.lineWidth=0.2;for(let q=1;q<5;q++){g.beginPath();g.arc(x,y,r*(0.42+q*0.09),0,TAU);g.stroke()}
    g.fillStyle=radial(g,x,y,r*0.42,[[0,'#2a1b10'],[0.7,'#120b06'],[1,'#050302']]);g.beginPath();g.arc(x+r*0.04,y+r*0.05,r*0.42,0,TAU);g.fill();
    for(let q=0;q<10;q++){const a=2.2+R()*1.6,rr=r*(0.85+R()*0.18);g.fillStyle=hsl(95+R()*25,50,22+R()*14);g.beginPath();g.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,0.5+R()*0.7,0,TAU);g.fill()}}
  else if(d.type==='branche'){const L=w/2,dir=d.dir||1,pts=[];for(let q=0;q<=8;q++){const t=q/8;pts.push([x-L+t*2*L,y+(0.1*dir*(1-2*t)+Math.sin(t*Math.PI*1.3+rot)*0.06)*w])}
    g.lineCap='round';g.lineJoin='round';
    const stroke=(col,wm)=>{for(let q=0;q<8;q++){g.strokeStyle=col;g.lineWidth=(3.6-q*0.22)*wm;g.beginPath();g.moveTo(pts[q][0],pts[q][1]);g.lineTo(pts[q+1][0],pts[q+1][1]);g.stroke()}};
    g.save();g.translate(1,1.4);stroke('rgba(0,0,0,0.35)',1.1);g.restore();
    stroke('#6a5c4c',1.05);stroke('#a4977f',0.8);stroke('#cfc3ab',0.25);
    const k=pts[3];g.strokeStyle='#8f826c';g.lineWidth=1.2;g.beginPath();g.moveTo(k[0],k[1]);g.lineTo(k[0]+w*0.12,k[1]-w*0.16*dir);g.stroke();
    for(const q of [2,5,6]){g.fillStyle='#5a4c3c';g.beginPath();g.ellipse(pts[q][0],pts[q][1],0.7,0.45,0,0,TAU);g.fill()}}
  else if(d.type==='pot'){const r1=w*0.3,r2=w*0.42,a0=rot*3,a1=a0+Math.PI*1.25;decoShadow(g,x,y,r2,r2*0.9,0,0.3);
    g.fillStyle='rgba(20,12,6,0.35)';g.beginPath();g.arc(x,y,r1,a0,a1);g.fill();
    g.beginPath();g.arc(x,y,r2,a0,a1);const e=[x+Math.cos(a1)*r1,y+Math.sin(a1)*r1];g.lineTo(x+Math.cos(a1)*(r1+r2)/2+1,y+Math.sin(a1)*(r1+r2)/2-0.6);g.lineTo(e[0],e[1]);g.arc(x,y,r1,a1,a0,true);g.lineTo(x+Math.cos(a0)*(r1+r2)/2-0.8,y+Math.sin(a0)*(r1+r2)/2+0.8);g.closePath();
    g.fillStyle=radial(g,x,y,r2,[[0,'#d9875a'],[0.6,'#b8603a'],[1,'#86401f']]);g.fill();g.strokeStyle='#e9a57c';g.lineWidth=0.35;g.beginPath();g.arc(x,y,r2-0.2,a0+0.1,a1-0.1);g.stroke();
    g.strokeStyle='#5e2a12';g.lineWidth=0.5;g.beginPath();g.arc(x,y,r1+0.25,a0+0.05,a1-0.05);g.stroke()}
  else if(d.type==='mousse'){const rx=w/2,ry=w*0.36;g.fillStyle='rgba(10,25,8,0.35)';blobPath(g,x+0.6,y+0.9,rx,ry,rot,decoRng(d),12,0.25);g.fill();
    for(let q=0;q<90;q++){const a=R()*TAU,rr=Math.sqrt(R());const px=x+Math.cos(a)*rx*rr,py=y+Math.sin(a)*ry*rr,r=0.6+R()*1.1;g.fillStyle=hsl(88+R()*30,45+R()*20,16+R()*16+(1-rr)*8);g.beginPath();g.arc(px,py,r,0,TAU);g.fill()}
    for(let q=0;q<26;q++){const a=R()*TAU,rr=Math.sqrt(R())*0.9;g.fillStyle=hsl(80+R()*20,60,48+R()*12,0.7);g.beginPath();g.arc(x+Math.cos(a)*rx*rr-0.3,y+Math.sin(a)*ry*rr-0.3,0.3,0,TAU);g.fill()}}
  else if(d.type==='mare'){const rx=w/2,ry=w*0.34;g.fillStyle='rgba(30,20,12,0.75)';blobPath(g,x,y,rx*1.18,ry*1.22,0,R,14,0.12);g.fill();
    for(let q=0;q<9;q++){const a=R()*TAU;g.fillStyle=`hsl(30,6%,${40+R()*25}%)`;g.beginPath();g.ellipse(x+Math.cos(a)*rx*1.08,y+Math.sin(a)*ry*1.1,0.8+R()*0.9,0.6+R()*0.6,a,0,TAU);g.fill()}
    blobPath(g,x,y,rx,ry,0,decoRng(d),14,0.1);const gr=g.createRadialGradient(x,y,0,x,y,rx);gr.addColorStop(0,'#0e2f52');gr.addColorStop(0.7,'#1d5a8e');gr.addColorStop(1,'#3d84ba');g.fillStyle=gr;g.fill();
    g.save();g.clip();g.fillStyle='rgba(255,255,255,0.22)';g.beginPath();g.ellipse(x-rx*0.35,y-ry*0.4,rx*0.35,ry*0.18,-0.3,0,TAU);g.fill();
    g.strokeStyle='rgba(180,225,255,0.55)';g.lineWidth=0.25;for(let q=0;q<2;q++){const rr=((simT*5+d.seed*20+q*6)%12);g.globalAlpha=1-rr/12;g.beginPath();g.ellipse(x+rx*0.15,y+ry*0.1,rr,rr*0.7,0,0,TAU);g.stroke()}g.restore()}
  else if(d.type==='liege'){const L=w/2,th=w*0.17,dir=d.dir||1,N=14,pts=[],rough=[];
    for(let q=0;q<=N;q++){const t=q/N;pts.push([x-L+t*2*L,y+Math.sin(t*Math.PI)*w*0.2*dir]);rough.push([0.8+R()*0.4,0.8+R()*0.4])}
    const half=t=>th*(0.35+0.65*Math.pow(Math.sin(t*Math.PI),0.6));
    const outline=()=>{g.beginPath();pts.forEach((p,q)=>{const n=half(q/N)*rough[q][0];q?g.lineTo(p[0],p[1]-n):g.moveTo(p[0],p[1]-n)});for(let q=N;q>=0;q--){const n=half(q/N)*rough[q][1];g.lineTo(pts[q][0],pts[q][1]+n)}g.closePath()};
    g.save();g.translate(0.9,1.3);g.fillStyle='rgba(0,0,0,0.4)';outline();g.fill();g.restore();
    outline();const gr=g.createLinearGradient(x,y-th*1.4,x,y+th*1.4);gr.addColorStop(0,'#a87c50');gr.addColorStop(0.45,'#7a5432');gr.addColorStop(1,'#46301a');g.fillStyle=gr;g.fill();
    g.save();outline();g.clip();
    // craquelures dans le sens de la longueur, comme une vraie écorce de chêne-liège
    for(let k=0;k<6;k++){const off=(k/5-0.5)*1.6;g.strokeStyle=k%2?'rgba(40,24,10,0.65)':'rgba(30,18,6,0.5)';g.lineWidth=0.25+R()*0.25;g.beginPath();
      let st=Math.floor(R()*4);for(let q=st;q<=Math.min(N,st+6+Math.floor(R()*6));q++){const t=q/N,p=pts[q],yy=p[1]+off*half(t)+(R()-0.5)*0.6;q===st?g.moveTo(p[0],yy):g.lineTo(p[0],yy)}g.stroke()}
    for(let q=0;q<22;q++){const p=pts[Math.floor(R()*N)],t=R();g.fillStyle=`rgba(${R()<0.5?'205,165,115':'60,38,18'},0.45)`;g.beginPath();g.ellipse(p[0]+(R()-0.5)*3,p[1]+(t-0.5)*th*1.6,0.6+R()*0.6,0.25,0,0,TAU);g.fill()}
    g.restore();outline();g.strokeStyle='rgba(25,15,6,0.6)';g.lineWidth=0.3;g.stroke()}
  else if(d.type==='coquille'){const r=w*0.36;decoShadow(g,x,y,r,r,0,0.4);g.fillStyle=radial(g,x,y,r,[[0,'#f0d6a4'],[0.6,'#c9a06a'],[1,'#8e6a40']]);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
    g.strokeStyle='#6a4520';g.lineWidth=0.45;g.beginPath();for(let a=0;a<TAU*2.6;a+=0.15){const rr=r*0.95*(1-a/(TAU*2.9));g.lineTo(x+Math.cos(a+rot)*rr,y+Math.sin(a+rot)*rr)}g.stroke();
    g.fillStyle='#2a1a0c';g.beginPath();g.ellipse(x+Math.cos(rot+0.3)*r*0.75,y+Math.sin(rot+0.3)*r*0.75,r*0.3,r*0.18,rot+1.8,0,TAU);g.fill()}
  else if(d.type==='champi'){const n=3+Math.floor(R()*3);for(let q=0;q<n;q++){const px=x+(q-(n-1)/2)*2.8+(R()-0.5),py=y+(R()-0.5)*2.4,r=1.4+R()*1.2;
      decoShadow(g,px,py,r,r,0,0.35);g.fillStyle=radial(g,px,py,r,[[0,'#f2e2c4'],[0.55,'#c98a52'],[1,'#7a4220']]);g.beginPath();g.arc(px,py,r,0,TAU);g.fill();
      if(R()<0.5){g.fillStyle='rgba(255,250,235,0.85)';for(let s=0;s<3;s++){g.beginPath();g.arc(px+(R()-0.5)*r,py+(R()-0.5)*r,0.22,0,TAU);g.fill()}}}}
  g.restore()}};

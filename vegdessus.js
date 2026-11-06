// ================= PLANTES VUES DU DESSUS, STYLE ORGANIQUE =================
// Même dessin que la vue de côté (feuilles en amande nervurées, teintes variées, pétales arrondis), vu d'en haut :
// rosettes, frondes, touffes, avec une ombre portée douce (lumière en haut à gauche, comme les décors).
const VD=(p,k)=>rh(p,k+200);
function ombrePlante(g,x,y,r){g.save();g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(x+r*0.12+1,y+r*0.16+1.4,r*0.85,r*0.75,0,0,TAU);g.fill();g.restore()}
function teinte(p,k,dry){return dry?45+(VD(p,k)-0.5)*10:p.hue!=null?p.hue+(VD(p,k)-0.5)*22:105+(VD(p,k)-0.5)*22}
function fleurDessus(g,x,y,R,f,p){if(!f||!f.open)return;const glow=(f.nectar||0)/3;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=0.18+glow*0.3;const spr=glowSprite(330);g.drawImage(spr,x-R*2.2,y-R*2.2,R*4.4,R*4.4);g.restore();
  const ph=hsl(f.poll?48:(330+rh(p,5)*30)%360,75,62),pl=hsl(f.poll?48:330,80,78);
  for(let q=0;q<5;q++){const a=q/5*TAU+rh(p,6)*TAU;g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(R*0.35,-R*0.55,R*1.05,-R*0.45,R*1.05,0);g.bezierCurveTo(R*1.05,R*0.45,R*0.35,R*0.55,0,0);
    g.fillStyle=ph;g.globalAlpha=0.9;g.fill();g.globalAlpha=1;g.strokeStyle=pl;g.lineWidth=0.35;g.stroke();g.restore()}
  g.fillStyle=hsl(48,100,58+glow*20);g.beginPath();g.arc(x,y,R*0.28,0,TAU);g.fill();g.fillStyle=hsl(30,80,35);for(let q=0;q<6;q++){const a=q*1.05;g.fillRect(x+Math.cos(a)*R*0.15-0.2,y+Math.sin(a)*R*0.15-0.2,0.4,0.4)}}
// fronde de fougère : rachis courbe et folioles alternées
function fronde(x,y,a,L,hue,vig,courbe){const n=Math.max(5,Math.round(L/2.2));let px=x,py=y;ctx.lineCap='round';
  for(let q=1;q<=n;q++){const t=q/n,aa=a+courbe*t,nx=x+Math.cos(a+courbe*t*0.5)*L*t,ny=y+Math.sin(a+courbe*t*0.5)*L*t,lw=(1-t)*L*0.22+0.6;
    for(const sd of [-1,1]){feuille(nx,ny,aa+sd*(1.05-t*0.3),lw*1.3,lw*0.55,hsl(hue+(sd>0?6:-4),55,16+vig*12+t*6,0.92),hsl(hue+10,55,34+vig*14),false)}
    ctx.strokeStyle=hsl(hue,40,24+vig*10);ctx.lineWidth=Math.max(0.3,(1-t)*0.8);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();px=nx;py=ny}}
const drawPlantTopNeon=drawPlantTop;
drawPlantTop=function(g,p){if(typeof VEG!=='undefined'&&VEG!=='organique'){drawPlantTopNeon(g,p);return}
  const k=p.kind||'fleur';if(k==='lierre'){drawPlantTopNeon(g,p);return}
  const x=p.col*CS+CS/2,y=-zOfPlant(p),vig=clamp((p.e??3)/3,0.25,1),dry=p.wet!=null&&p.wet<0.15,sw=Math.sin(simT*1.3+p.col)*0.04,keep=ctx;ctx=g;g.save();
  try{
  if(k==='fleur'){const S=6+p.h*0.3,n=Math.min(12,3+Math.floor(p.h/7));ombrePlante(g,x,y,S);
    for(let q=0;q<n;q++){const t=q/n,a=q*2.39996+p.id+sw,L=S*(1-t*0.55)*(0.85+VD(p,q)*0.3)*(dry?0.8:1);
      feuille(x,y,a,L,L*(0.36+VD(p,q+20)*0.14),hsl(teinte(p,q,dry),52,15+vig*12+VD(p,q+40)*6+t*6,0.93),hsl(teinte(p,q,dry)+10,60,36+vig*16),true)}
    g.fillStyle=hsl(teinte(p,0,dry),50,30);g.beginPath();g.arc(x,y,0.9,0,TAU);g.fill();if(p.h>=p.maxH&&p.fl)fleurDessus(g,x,y,5,p.fl,p)}
  else if(k==='fougere'){const S=8+p.h*0.35,n=7;ombrePlante(g,x,y,S*0.8);for(let q=0;q<n;q++){const a=q/n*TAU+p.id+sw;fronde(x,y,a,S*(0.75+VD(p,q)*0.3),dry?45:120+(VD(p,q+9)-0.5)*14,vig,(VD(p,q+3)-0.5)*0.8)}
    g.fillStyle=hsl(30,35,22);g.beginPath();g.arc(x,y,1.2,0,TAU);g.fill()}
  else if(k==='gramin'){const S=7+p.h*0.28,n=14;ombrePlante(g,x,y,S*0.6);ctx.lineCap='round';
    for(let q=0;q<n;q++){const a=q*2.39996+p.id+sw*2,L=S*(0.6+VD(p,q)*0.5),c=(VD(p,q+30)-0.5)*1.2,ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L,mx=x+Math.cos(a+c*0.5)*L*0.55,my=y+Math.sin(a+c*0.5)*L*0.55;
      g.strokeStyle=hsl(dry?48:75+(VD(p,q+50)-0.5)*20,50,26+vig*14+VD(p,q+60)*8);g.lineWidth=0.9;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();
      if(p.h>=p.maxH&&q%3===0){g.fillStyle=hsl(42,45,55);g.beginPath();g.ellipse(ex,ey,1.6,0.6,a,0,TAU);g.fill()}}}
  else if(k==='trefle'){const S=4+p.h*0.5,n=6;ombrePlante(g,x,y,S);for(let q=0;q<n;q++){const a=q*2.39996+p.id,d=S*(0.45+VD(p,q)*0.5),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d;
      g.strokeStyle=hsl(100,40,28);g.lineWidth=0.35;g.beginPath();g.moveTo(x,y);g.lineTo(cx,cy);g.stroke();
      for(let r=0;r<3;r++){const b=a+r*TAU/3+VD(p,q+9);feuille(cx,cy,b,2.4,2.2,hsl(dry?50:108+(VD(p,q+r)-0.5)*10,45,22+vig*12),hsl(110,45,40),false);g.strokeStyle='rgba(230,240,220,0.4)';g.lineWidth=0.25;g.beginPath();g.arc(cx+Math.cos(b)*1.1,cy+Math.sin(b)*1.1,0.6,b+2,b+4.3);g.stroke()}}
    if(p.h>=p.maxH&&p.fl&&p.fl.open){const a=p.id;g.fillStyle=hsl(330,30,88);for(let q=0;q<10;q++){g.beginPath();g.arc(x+Math.cos(a)*S*0.5+Math.cos(q)*1,y+Math.sin(a)*S*0.5+Math.sin(q)*1,0.6,0,TAU);g.fill()}}}
  else if(k==='ronce'){const S=8+p.h*0.3,n=5;ombrePlante(g,x,y,S);for(let q=0;q<n;q++){const a=q/n*TAU+p.id+sw,L=S*(0.8+VD(p,q)*0.3),cx=x+Math.cos(a)*L,cy=y+Math.sin(a)*L,mx=x+Math.cos(a+0.4)*L*0.6,my=y+Math.sin(a+0.4)*L*0.6;
      g.strokeStyle=hsl(345,35,28);g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(mx,my,cx,cy);g.stroke();g.fillStyle=hsl(30,40,70);for(let r=1;r<5;r++){const t=r/5;g.fillRect(x+(cx-x)*t+0.3,y+(cy-y)*t-0.3,0.35,0.35)}
      for(let r=0;r<3;r++){const b=a+(r-1)*0.9;feuille(x+(cx-x)*0.7,y+(cy-y)*0.7,b,4.2,2.2,hsl(dry?45:112+(VD(p,q*3+r)-0.5)*14,42,14+vig*10),hsl(115,40,32),true)}
      if(p.h>=p.maxH&&q%2===0){for(let r=0;r<5;r++){g.fillStyle=r<2?hsl(340,45,32):hsl(280,35,14);g.beginPath();g.arc(cx+Math.cos(r*1.3)*0.8,cy+Math.sin(r*1.3)*0.8,0.7,0,TAU);g.fill()}}}}
  else if(k==='cactus'){const C=typeof cactusCols==='function'?cactusCols(p):{fill:hsl(120,40,30)},r=2+Math.min(1,p.h/16)*2.6,sd=p.id%2?1:-1;
    const disc=(cx,cy,rr,fl)=>{ombrePlante(g,cx,cy,rr*1.1);const gr=g.createRadialGradient(cx-rr*0.35,cy-rr*0.4,rr*0.1,cx,cy,rr*1.05);gr.addColorStop(0,hsl(dry?60:110,40,42));gr.addColorStop(1,hsl(dry?55:125,45,17));g.fillStyle=gr;g.beginPath();g.arc(cx,cy,rr,0,TAU);g.fill();
      g.strokeStyle='rgba(0,30,0,0.45)';g.lineWidth=0.3;g.beginPath();for(let q=0;q<10;q++){const a=q/10*TAU;g.moveTo(cx+Math.cos(a)*rr*0.2,cy+Math.sin(a)*rr*0.2);g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}g.stroke();
      g.strokeStyle='rgba(250,245,225,0.75)';g.lineWidth=0.18;for(let q=0;q<10;q++)for(const t of [0.55,0.9]){const a=q/10*TAU+0.31,ax=cx+Math.cos(a)*rr*t,ay=cy+Math.sin(a)*rr*t;g.beginPath();for(let s=0;s<4;s++){const b=s*1.57+q;g.moveTo(ax,ay);g.lineTo(ax+Math.cos(b)*0.7,ay+Math.sin(b)*0.7)}g.stroke()}
      if(fl)fleurDessus(g,cx,cy,rr*0.6,fl,p)};
    if(p.h*CS>22)disc(x+sd*(r+3.5),y,r*0.7);if(p.h*CS>45)disc(x-sd*(r+3),y+1,r*0.6);disc(x,y,r,p.h>=p.maxH?p.fl:null)}
  else if(k==='arbo'){const S=14+p.h*0.2,n=9;ombrePlante(g,x,y,S);for(let q=0;q<n;q++){const a=q/n*TAU+p.id+sw;fronde(x,y,a,S*(0.8+VD(p,q)*0.25),dry?45:118+(VD(p,q+9)-0.5)*12,vig,(VD(p,q+3)-0.5)*0.6)}
    g.fillStyle=hsl(25,35,20);g.beginPath();g.arc(x,y,2.2,0,TAU);g.fill();g.strokeStyle=hsl(90,40,40);g.lineWidth=0.5;for(let q=0;q<3;q++){const a=q*2.1+p.id;g.beginPath();g.arc(x+Math.cos(a)*1.2,y+Math.sin(a)*1.2,0.8,0,4.5);g.stroke()}}
  else if(k==='dionee'){const n=6,S=4.5;ombrePlante(g,x,y,S);for(let q=0;q<n;q++){const a=q/n*TAU+p.id,tx=x+Math.cos(a)*S*0.55,ty=y+Math.sin(a)*S*0.55;
      feuille(x,y,a,S*0.55,1.2,hsl(100,50,30),hsl(100,50,40),false);const ferme=(p.snap||0)>0&&q%2===0;
      for(const s of [-1,1]){g.save();g.translate(tx,ty);g.rotate(a);g.fillStyle=hsl(355,60,ferme?30:40);g.beginPath();g.ellipse(1.2,s*(ferme?0.3:0.75),1.3,ferme?0.45:0.8,0,0,TAU);g.fill();
        g.strokeStyle=hsl(95,50,55);g.lineWidth=0.15;g.beginPath();for(let c=0;c<6;c++){const u=c/5*2.4;g.moveTo(u,s*(ferme?0.6:1.4));g.lineTo(u+0.1,s*(ferme?0.9:2.0))}g.stroke();g.restore()}}}
  else if(k==='champignon'){const n=1+p.id%3;for(let f=0;f<n;f++){const cx=x+(f-(n-1)/2)*3,cy=y+(f%2)*1.2,r=1.4+p.h*0.13*(1-f*0.2),rouge=p.id%2===0;ombrePlante(g,cx,cy,r);
      const gr=g.createRadialGradient(cx-r*0.35,cy-r*0.4,r*0.1,cx,cy,r);gr.addColorStop(0,rouge?hsl(8,75,58):hsl(30,45,58));gr.addColorStop(1,rouge?hsl(5,70,30):hsl(25,45,28));g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
      if(rouge){g.fillStyle='rgba(250,245,235,0.9)';for(let q=0;q<6;q++){const a=q*1.7+f,d=r*(0.3+((q*37)%10)/16);g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,r*0.12,0,TAU);g.fill()}}
      else{g.strokeStyle='rgba(60,35,15,0.35)';g.lineWidth=0.2;g.beginPath();for(let q=0;q<16;q++){const a=q/16*TAU;g.moveTo(cx+Math.cos(a)*r*0.3,cy+Math.sin(a)*r*0.3);g.lineTo(cx+Math.cos(a)*r*0.95,cy+Math.sin(a)*r*0.95)}g.stroke()}}}
  else drawPlantTopNeon(g,p);
  }finally{g.restore();ctx=keep}};

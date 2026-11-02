// Vivariom — Bestioles : petites bêtes qui vivent sur l'écran (bonus). © 2026 grecdel — tous droits réservés.
// Moteur commun aux applis Android, Windows et Linux : une page transparente plein écran.
// Hôtes :
//   - navigateur / Windows / Linux : menu HTML intégré au clic ; window.bestiolesHote.interactif(bool) (si présent) est
//     appelé quand la souris passe sur une bête ou le menu (pour laisser passer les clics ailleurs) ;
//   - Android : window.AndroidBestioles (pont Java) reçoit positions() et touche(id) ; il appelle Bestioles.action(...).
(()=>{'use strict';
const TAU=Math.PI*2,rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,hyp=Math.hypot;
const angD=(a,b)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
const hsl=(h,s,l,a=1)=>`hsla(${h},${s}%,${l}%,${a})`;
const cv=document.createElement('canvas');cv.id='bestioles';document.body.appendChild(cv);
const g=cv.getContext('2d');let W=0,H=0,DPR=1;
function taille(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px'}
addEventListener('resize',taille);taille();

// ---------- espèces ----------
// L : longueur du corps (px écran). col : teinte naturelle. vole : peut voler. proies : ce qu'elle mange.
const ECH=1.5; // agrandissement pour bien voir les bêtes sur un écran de téléphone
const ESP={
  fourmi:{nom:'Fourmi',ic:'🐜',L:13,h:12,s:55,l:30,vit:42,pattes:6,ant:7,corps:[[0.26,0.22],[0.24,0.16],[0.42,0.3]]},
  puceron:{nom:'Puceron',ic:'🟢',L:6,h:95,s:45,l:48,vit:5,pattes:6,ant:3,corps:[[0.25,0.45],[0.75,0.62]]},
  coccinelle:{nom:'Coccinelle',ic:'🐞',L:14,h:2,s:75,l:42,vit:22,pattes:6,ant:3,vole:true,proies:['puceron'],corps:[[0.24,0.4],[0.76,0.86]]},
  mouche:{nom:'Mouche',ic:'🪰',L:11,h:200,s:15,l:25,vit:26,vole:true,vitVol:190,pattes:6,ant:2,corps:[[0.26,0.42],[0.3,0.45],[0.44,0.42]]},
  araignee:{nom:'Araignée sauteuse',ic:'🕷',L:12,h:30,s:10,l:30,vit:30,pattes:8,ant:0,proies:['mouche','puceron'],corps:[[0.42,0.5],[0.58,0.52]]},
  papillon:{nom:'Papillon',ic:'🦋',L:16,h:20,s:70,l:50,vit:12,vole:true,vitVol:70,pattes:6,ant:9,corps:[[0.2,0.18],[0.8,0.14]]},
  mante:{nom:'Mante',ic:'🦗',L:34,h:95,s:45,l:38,vit:10,pattes:6,ant:6,proies:['mouche','papillon','coccinelle','fourmi'],corps:[[0.14,0.18],[0.4,0.1],[0.46,0.2]]},
};
for(const k in ESP)ESP[k].L*=ECH;
const PREDS={};for(const k in ESP)for(const p of ESP[k].proies||[])(PREDS[p]=PREDS[p]||[]).push(k);
const DEPART={fourmi:5,puceron:6,coccinelle:1,mouche:2,araignee:1,papillon:1};
const MAX={fourmi:9,puceron:14,coccinelle:2,mouche:4,araignee:2,papillon:2,mante:1};

let betes=[],miettes=[],nid=null,id0=1,actif=false,tPrec=0,simT=0;
function bord(){const c=Math.floor(rnd(0,4));return c===0?[rnd(0,W),-20]:c===1?[W+20,rnd(0,H)]:c===2?[rnd(0,W),H+20]:[-20,rnd(0,H)]}
function nouvelle(esp,x,y){const E=ESP[esp];if(x==null)[x,y]=bord();
  const b={id:id0++,esp,E,x,y,a:rnd(0,TAU),v:0,ph:rnd(0,TAU),etat:'marche',t:rnd(1,4),calme:false,vol:false,alt:0,faim:rnd(0.2,0.6),cible:null,porte:null,aile:0};
  if(E.vole&&(esp==='mouche'||esp==='papillon')){b.vol=true;b.alt=1}betes.push(b);return b}
function peupler(){betes=[];miettes=[];nid=[rnd(W*0.15,W*0.85),H+30];for(const k in DEPART)for(let q=0;q<DEPART[k];q++)nouvelle(k,rnd(40,W-40),rnd(60,H-60))}
const vivantes=esp=>betes.filter(b=>b.esp===esp&&!b.mort);
const pres=(b,liste,R)=>{let best=null,bd=R;for(const o of liste){if(o===b||o.mort)continue;const d=hyp(o.x-b.x,o.y-b.y);if(d<bd){bd=d;best=o}}return best};

// ---------- comportements ----------
function tourneVers(b,x,y,k,dt){b.a+=clamp(angD(b.a,Math.atan2(y-b.y,x-b.x)),-k*dt,k*dt)}
function avance(b,v,dt){b.v=v;b.x+=Math.cos(b.a)*v*dt;b.y+=Math.sin(b.a)*v*dt;b.ph+=v*dt*0.55}
function errer(b,dt,v){b.t-=dt;if(b.t<=0){b.t=rnd(1.5,4);b.cap=b.a+rnd(-1.2,1.2)}
  b.a+=clamp(angD(b.a,b.cap??b.a),-1.5*dt,1.5*dt);
  // rester dans l'écran (marge)
  const m=30;if(b.x<m||b.x>W-m||b.y<m||b.y>H-m){b.a+=clamp(angD(b.a,Math.atan2(H/2-b.y,W/2-b.x)),-3*dt,3*dt)}
  avance(b,v,dt)}
function fuir(b,dt){const pr=(PREDS[b.esp]||[]).flatMap(vivantes);const p=pres(b,pr,70);if(!p)return false;
  if(b.E.vole&&!b.vol){b.vol=true;b.etat='envol';return true}
  b.a+=clamp(angD(b.a,Math.atan2(b.y-p.y,b.x-p.x)),-6*dt,6*dt);avance(b,(b.E.vitVol&&b.vol?b.E.vitVol:b.E.vit*1.6),dt);b.etat='fuit';return true}
function voler(b,dt){b.alt=Math.min(1,b.alt+dt*3);b.aile+=dt*(b.esp==='papillon'?9:60);
  b.t-=dt;if(b.t<=0){b.t=rnd(0.3,1.2);b.cap=b.a+rnd(-1.8,1.8)}
  b.a+=clamp(angD(b.a,b.cap??b.a),-4*dt,4*dt);const m=20;if(b.x<m||b.x>W-m||b.y<m||b.y>H-m)tourneVers(b,W/2,H/2,5,dt);
  b.v=b.E.vitVol||80;b.x+=Math.cos(b.a)*b.v*dt+Math.sin(simT*7+b.id)*12*dt;b.y+=Math.sin(b.a)*b.v*dt+Math.cos(simT*6+b.id)*10*dt;
  b.posee=(b.posee||0)-dt;if(b.posee<=-rnd(4,10)){b.vol=false;b.etat='posee';b.t=rnd(3,8);b.posee=0}}
function mange(b,o,gain){o.mort=true;b.faim=Math.max(0,b.faim-gain);b.etat='mange';b.t=rnd(2,4);b.v=0}
const IA={
  fourmi(b,dt){if(fuir(b,dt))return;
    if(b.porte){tourneVers(b,nid[0],nid[1],4,dt);avance(b,b.E.vit,dt);if(hyp(nid[0]-b.x,nid[1]-b.y)<25){b.porte=null;b.x=nid[0]+rnd(-10,10);b.y=H+5;b.a=-Math.PI/2+rnd(-0.6,0.6)}b.etat='rapporte';return}
    const m=pres(b,miettes,220);if(m){tourneVers(b,m.x,m.y,5,dt);avance(b,b.E.vit,dt);b.etat='va chercher une miette';if(hyp(m.x-b.x,m.y-b.y)<5){m.val-=1;if(m.val<=0)m.mort=true;b.porte=m.col}return}
    // file : suivre une autre fourmi qui va quelque part
    const chef=betes.find(o=>o!==b&&o.esp==='fourmi'&&!o.mort&&(o.porte||o.etat==='va chercher une miette')&&hyp(o.x-b.x,o.y-b.y)<160);
    if(chef&&Math.random()<0.98){const lx=chef.x-Math.cos(chef.a)*14,ly=chef.y-Math.sin(chef.a)*14;tourneVers(b,lx,ly,5,dt);avance(b,b.E.vit*(hyp(lx-b.x,ly-b.y)>8?1.1:0.4),dt);b.etat='suit une autre fourmi';return}
    errer(b,dt,b.E.vit*0.8);b.etat='explore'},
  puceron(b,dt){b.t-=dt;if(b.t<=0){b.t=rnd(3,8);b.marche=Math.random()<0.4;b.cap=b.a+rnd(-2,2)}
    if(b.marche){const autres=vivantes('puceron');const o=pres(b,autres,80);if(o&&hyp(o.x-b.x,o.y-b.y)>12)tourneVers(b,o.x,o.y,2,dt);errer(b,dt,b.E.vit)}else{b.v=0}
    b.etat='suce la sève';if(Math.random()<dt*0.012&&vivantes('puceron').length<MAX.puceron){nouvelle('puceron',b.x+rnd(-6,6),b.y+rnd(-6,6)).a=b.a}},
  coccinelle(b,dt){if(b.vol){voler(b,dt);b.etat='vole';if(Math.random()<dt*0.2){b.vol=false;b.t=2}return}
    const p=pres(b,vivantes('puceron'),b.faim>0.3?260:60);if(p){tourneVers(b,p.x,p.y,4,dt);avance(b,b.E.vit,dt);b.etat='chasse un puceron';if(hyp(p.x-b.x,p.y-b.y)<6)mange(b,p,0.25);return}
    if(Math.random()<dt*0.04){b.vol=true;b.t=0;return}errer(b,dt,b.E.vit*0.7);b.etat='se promène'},
  mouche(b,dt){if(b.vol){voler(b,dt);b.etat='vole';return}
    if(fuir(b,dt))return;b.v=0;b.t-=dt;b.etat=b.toil?'se frotte les pattes':'se pose';if(Math.random()<dt*0.5)b.toil=!b.toil;
    if(b.t<=0){b.vol=true;b.t=0.5}},
  araignee(b,dt){const proies=['mouche','puceron'].flatMap(vivantes).filter(o=>!o.vol);
    if(b.saut){const S=b.saut;S.t+=dt/0.3;const u=Math.min(1,S.t);b.x=S.x0+(S.x1-S.x0)*u;b.y=S.y0+(S.y1-S.y0)*u;b.alt=Math.sin(u*Math.PI)*0.6;
      if(u>=1){b.saut=null;b.alt=0;const o=S.proie;if(o&&!o.mort&&!o.vol&&hyp(o.x-b.x,o.y-b.y)<9&&Math.random()<0.8){mange(b,o,0.5);b.etat='mange'}}return}
    const p=b.faim>0.25?pres(b,proies,300):null;
    if(p){const d=hyp(p.x-b.x,p.y-b.y);tourneVers(b,p.x,p.y,6,dt);
      if(d<45){b.v=0;b.guette=(b.guette||0)+dt;b.etat='guette sa proie';if(b.guette>0.7){b.guette=0;b.saut={x0:b.x,y0:b.y,x1:p.x,y1:p.y,t:0,proie:p};b.etat='bondit'}return}
      b.guette=0;avance(b,b.E.vit*(d<90?0.5:1),dt);b.etat='s\'approche d\'une proie';return}
    b.t-=dt;if(b.pause>0){b.pause-=dt;b.v=0;b.etat='attend';return}if(Math.random()<dt*0.3)b.pause=rnd(1,3);errer(b,dt,b.E.vit);b.etat='explore'},
  papillon(b,dt){if(b.vol){voler(b,dt);b.etat='volette';return}if(fuir(b,dt))return;b.v=0;b.aile+=dt*1.2;b.etat='se repose, ailes ouvertes';b.t-=dt;if(b.t<=0){b.vol=true}},
  mante(b,dt){if(b.frappe>0){b.frappe-=dt;b.v=0;b.etat='frappe';return}
    const p=pres(b,['mouche','papillon','coccinelle','fourmi'].flatMap(vivantes),b.faim>0.2?34:0);
    if(p){tourneVers(b,p.x,p.y,8,dt);if(hyp(p.x-b.x,p.y-b.y)<30){b.frappe=0.25;mange(b,p,0.4)}return}
    b.t-=dt;if(b.t<=0){b.t=rnd(4,12);b.bouge=Math.random()<0.35}
    if(b.bouge){errer(b,dt,b.E.vit);b.etat='avance lentement'}else{b.v=0;b.ph+=dt*0.6;b.etat='à l\'affût, immobile'}},
};
function vivre(dt){simT+=dt;
  for(const b of betes){if(b.mort)continue;b.faim=Math.min(1,b.faim+dt*0.01);
    if(b.calme){b.v=0;b.etat='calme';b.alt=Math.max(0,b.alt-dt*2);b.vol=false;continue}
    if(b.etat==='mange'&&b.t>0&&!b.saut){b.t-=dt;b.v=0;continue}
    IA[b.esp](b,dt)}
  betes=betes.filter(b=>!b.mort);miettes=miettes.filter(m=>!m.mort);
  // de temps en temps une miette tombe ; si une espèce a disparu, une nouvelle arrive par un bord
  if(Math.random()<dt*0.04&&miettes.length<3)miettes.push({x:rnd(40,W-40),y:rnd(60,H-80),val:3,col:['#d8b46a','#e8d2a0','#b07a40'][Math.floor(rnd(0,3))],r:rnd(2,3.5)});
  for(const k in DEPART)if(!vivantes(k).length&&Math.random()<dt*0.05)nouvelle(k);
  if(!vivantes('puceron').length&&Math.random()<dt*0.2)for(let q=0;q<3;q++)nouvelle('puceron',rnd(40,W-40),rnd(60,H-60))}

// ---------- dessin (vu de dessus, style naturel) ----------
function patte(x0,y0,ang,L1,L2,pli,lw){const kx=x0+Math.cos(ang)*L1,ky=y0+Math.sin(ang)*L1,a2=ang+pli;g.lineWidth=lw;g.beginPath();g.moveTo(x0,y0);g.lineTo(kx,ky);g.lineTo(kx+Math.cos(a2)*L2,ky+Math.sin(a2)*L2);g.stroke()}
function dessine(b){const E=b.E,L=E.L,fond=hsl(E.h,E.s,E.l),bord2=hsl(E.h,E.s*0.8,Math.max(8,E.l-18)),clair=hsl(E.h,E.s*0.7,Math.min(90,E.l+22));
  g.save();g.translate(b.x,b.y);
  // ombre (plus décalée quand elle vole ou saute)
  const al=b.alt||0;g.save();g.translate(3+al*10,4+al*14);g.rotate(b.a);g.fillStyle=`rgba(0,0,0,${(0.22-al*0.08).toFixed(2)})`;g.beginPath();g.ellipse(0,0,L*0.55,L*(b.esp==='papillon'?0.5:0.26),0,0,TAU);g.fill();g.restore();
  g.rotate(b.a);const sc=1+al*0.12;g.scale(sc,sc);
  const marche=Math.sin(b.ph*2.2);g.strokeStyle=bord2;g.lineCap='round';
  // pattes (avant = +x)
  if(!(b.vol&&E.vole)){const n=E.pattes/2;for(let q=0;q<n;q++){const off=(q/(n-1||1)-0.5)*L*(E.pattes===8?0.42:0.38),sw=(q%2?1:-1)*marche*0.35*(b.v>0?1:0);
      for(const sd of [-1,1]){const base=sd*(Math.PI/2)+(q-(n-1)/2)*0.45*-sd*-1,ang=sd*Math.PI/2+(q-(n-1)/2)*-0.5+sw*sd;
        const Lp=L*(b.esp==='araignee'?0.42:b.esp==='mante'?0.3:0.34);patte(off*0.8,sd*L*0.08,ang+(q<n/2?-0.25*sd:0.25*sd),Lp*0.55,Lp*0.6,sd*(q<(n-1)/2?0.7:-0.7),Math.max(0.8,L*0.045));void base}}
    if(b.esp==='mante'){g.lineWidth=Math.max(1.2,L*0.05);for(const sd of [-1,1]){const fr=b.frappe>0?0.6:0;g.beginPath();g.moveTo(L*0.32,sd*L*0.03);g.lineTo(L*(0.46+fr*0.3),sd*L*(0.12-fr*0.08));g.lineTo(L*(0.38+fr*0.4),sd*L*0.05);g.stroke()}}}
  // ailes (volants) : battement vu de dessus
  if(E.vole){const op=b.vol?Math.abs(Math.sin(b.aile)):(b.esp==='papillon'?0.75+0.25*Math.sin(b.aile):0);
    if(b.esp==='papillon'){for(const sd of [-1,1]){g.save();g.scale(1,sd*(0.25+0.75*op));g.fillStyle=hsl(E.h,E.s,E.l);g.strokeStyle=hsl(E.h,E.s,22);g.lineWidth=0.8;
      g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*0.5,L*0.15,L*0.6,L*0.95,L*0.05,L*0.9);g.bezierCurveTo(-L*0.2,L*0.85,-L*0.6,L*0.7,0,0);g.fill();g.stroke();
      g.fillStyle=hsl(40,80,60);g.beginPath();g.arc(L*0.25,L*0.55,L*0.09,0,TAU);g.fill();g.fillStyle='#1a1410';g.beginPath();g.arc(-L*0.15,L*0.55,L*0.07,0,TAU);g.fill();g.restore()}}
    else if(b.esp==='coccinelle'){if(b.vol){g.fillStyle='rgba(220,230,240,0.45)';for(const sd of [-1,1]){g.beginPath();g.ellipse(-L*0.1,sd*L*(0.35+0.2*op),L*0.45,L*0.2,sd*0.5,0,TAU);g.fill()}}}
    else{g.fillStyle='rgba(215,228,240,0.5)';g.strokeStyle='rgba(120,140,160,0.6)';g.lineWidth=0.5;const ouv=b.vol?0.5+op*0.6:0.18;for(const sd of [-1,1]){g.beginPath();g.ellipse(-L*0.2,sd*L*0.22*ouv*1.6,L*0.42,L*0.15,sd*(0.25+ouv*0.4),0,TAU);g.fill();g.stroke()}}}
  // corps : segments de la tête (avant) vers l'abdomen
  const C=E.corps;let x=L*0.5;
  for(let i=0;i<C.length;i++){const [lg,lr]=C[i],len=L*lg,r=L*lr/2;x-=len/2;
    if(b.esp==='papillon'&&i===1){x-=0;}
    const gr=g.createRadialGradient(x-len*0.15,-r*0.4,r*0.1,x,0,Math.max(len,r*2)*0.6);gr.addColorStop(0,clair);gr.addColorStop(0.55,fond);gr.addColorStop(1,bord2);
    g.fillStyle=gr;g.beginPath();g.ellipse(x,0,len/2,r,0,0,TAU);g.fill();g.strokeStyle=bord2;g.lineWidth=0.6;g.stroke();
    if(b.esp==='coccinelle'&&i===1){g.strokeStyle='#1a0e0a';g.lineWidth=0.8;g.beginPath();g.moveTo(x+len/2,0);g.lineTo(x-len/2,0);g.stroke();g.fillStyle='#140a08';for(const [px,py] of [[0.15,0.4],[-0.2,0.45],[0.05,-0.4],[-0.25,-0.45],[0.32,0]]){g.beginPath();g.arc(x+px*len,py*r,L*0.07,0,TAU);g.fill()}
      g.fillStyle='#120a08';g.beginPath();g.ellipse(x+len/2+L*0.08,0,L*0.12,L*0.17,0,0,TAU);g.fill()}
    if(b.esp==='fourmi'&&i===2){g.strokeStyle=hsl(E.h,E.s,E.l+10,0.5);g.lineWidth=0.5;for(let q=1;q<3;q++){g.beginPath();g.moveTo(x-len*0.5+len*q/3,-r*0.9);g.lineTo(x-len*0.5+len*q/3,r*0.9);g.stroke()}}
    x-=len/2}
  // tête : yeux et antennes
  if(E.ant){g.strokeStyle=bord2;g.lineWidth=Math.max(0.6,L*0.035);const wig=Math.sin(simT*6+b.id)*0.15;for(const sd of [-1,1]){g.beginPath();g.moveTo(L*0.45,sd*L*0.04);g.quadraticCurveTo(L*0.45+E.ant*0.5,sd*(E.ant*0.25+wig*E.ant),L*0.45+E.ant*0.85,sd*(E.ant*0.55+wig*E.ant));g.stroke()}}
  g.fillStyle='#0b0908';const ey=b.esp==='mouche'?L*0.13:b.esp==='araignee'?L*0.08:L*0.06,er=b.esp==='mouche'?L*0.1:b.esp==='araignee'?L*0.07:L*0.045;for(const sd of [-1,1]){g.beginPath();g.arc(L*(b.esp==='araignee'?0.42:0.44),sd*ey,er,0,TAU);g.fill()}
  if(b.esp==='araignee'){g.fillStyle='#0b0908';g.beginPath();g.arc(L*0.47,0,L*0.06,0,TAU);g.fill();g.strokeStyle='rgba(230,230,230,0.55)';g.lineWidth=0.7;for(let q=0;q<3;q++){g.beginPath();g.moveTo(-L*0.15-q*L*0.1,-L*0.2);g.lineTo(-L*0.15-q*L*0.1,L*0.2);g.stroke()}}
  if(b.porte){g.fillStyle=b.porte;g.beginPath();g.arc(L*0.62,0,L*0.16,0,TAU);g.fill()}
  g.restore();
  if(b.calme){g.save();g.fillStyle='rgba(255,255,255,0.85)';g.font=`600 ${Math.max(9,L*0.6)}px sans-serif`;const k=(simT*0.6+b.id)%1;g.globalAlpha=1-k;g.fillText('z',b.x+L*0.4+k*6,b.y-L*0.5-k*10);g.restore()}
  if(selId===b.id){g.save();g.strokeStyle='rgba(255,233,77,0.9)';g.lineWidth=1.5;g.setLineDash([3,3]);g.beginPath();g.arc(b.x,b.y,Math.max(16,L*0.9),0,TAU);g.stroke();g.restore()}}
function dessiner(){g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  for(const m of miettes){g.fillStyle=m.col;g.beginPath();g.arc(m.x,m.y,m.r*(0.6+m.val*0.15),0,TAU);g.fill()}
  for(const b of betes)if(!b.vol)dessine(b);for(const b of betes)if(b.vol)dessine(b)}

// ---------- boucle ----------
function boucle(t){if(!actif)return;const dt=Math.min(0.05,(t-(tPrec||t))/1000);tPrec=t;vivre(dt);dessiner();
  if(window.AndroidBestioles&&(t-(boucle.envoi||0))>60){boucle.envoi=t;try{AndroidBestioles.positions(JSON.stringify(cibles()))}catch(e){}}
  requestAnimationFrame(boucle)}
function cibles(){return betes.map(b=>({id:b.id,x:Math.round(b.x),y:Math.round(b.y),r:Math.round(Math.max(22,b.E.L*0.9)),esp:b.esp,nom:b.E.nom,ic:b.E.ic,calme:b.calme?1:0,etat:b.calme?'calme':b.etat}))}
function toucher(x,y){let best=null,bd=1e9;for(const b of betes){const d=hyp(b.x-x,b.y-y),R=Math.max(22,b.E.L*0.9);if(d<R&&d<bd){bd=d;best=b}}return best}

// ---------- menu (navigateur, Windows, Linux) ----------
let selId=null;const menu=document.createElement('div');menu.id='bmenu';menu.hidden=true;document.body.appendChild(menu);
function ouvrirMenu(b){selId=b.id;const E=b.E;
  menu.innerHTML=`<div class="mt">${E.ic} <b>${E.nom}</b><span>${b.calme?'calme':b.etat}</span></div>
   <button data-a="${b.calme?'reveiller':'calmer'}">${b.calme?'🏃 La réveiller':'😌 La calmer'}</button>
   <button data-a="retirer">👋 La faire disparaître</button>
   <button data-a="ajouter">➕ Ajouter une bête…</button>
   <div class="ajout" hidden>${Object.entries(ESP).map(([k,e])=>`<button data-esp="${k}">${e.ic} ${e.nom}</button>`).join('')}</div>
   <button data-a="eteindre" class="off">⏻ Tout éteindre</button>`;
  menu.hidden=false;const mw=220,mh=menu.offsetHeight||220;menu.style.left=clamp(b.x+20,8,W-mw-8)+'px';menu.style.top=clamp(b.y-mh/2,8,H-mh-8)+'px';
  menu.querySelectorAll('[data-a]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();const a=bt.dataset.a;if(a==='ajouter'){menu.querySelector('.ajout').hidden=false;return}action(b.id,a);fermerMenu()});
  menu.querySelectorAll('[data-esp]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();ajouter(bt.dataset.esp,b.x+rnd(-40,40),b.y+rnd(-40,40));fermerMenu()});
  hoteInteractif(true)}
function fermerMenu(){menu.hidden=true;selId=null}
function hoteInteractif(v){if(window.bestiolesHote&&hoteInteractif.v!==v){hoteInteractif.v=v;window.bestiolesHote.interactif(v)}}
addEventListener('pointerdown',e=>{if(!menu.hidden&&menu.contains(e.target))return;const b=toucher(e.clientX,e.clientY);
  if(b){if(window.AndroidBestioles){try{AndroidBestioles.touche(b.id,b.esp,b.E.nom,b.calme?1:0)}catch(_){}}else ouvrirMenu(b)}else fermerMenu()});
// souris (ordinateur) : les clics traversent sauf sur une bête ou sur le menu
addEventListener('mousemove',e=>{hoteInteractif(!!toucher(e.clientX,e.clientY)||(!menu.hidden&&menu.contains(e.target)))});

// ---------- commandes (aussi utilisées par les hôtes) ----------
function action(id,a){const b=betes.find(o=>o.id===id);if(a==='eteindre'){Bestioles.arreter();if(window.bestiolesHote&&window.bestiolesHote.eteindre)window.bestiolesHote.eteindre();return}
  if(!b)return;if(a==='calmer')b.calme=true;if(a==='reveiller')b.calme=false;if(a==='retirer')b.mort=true}
function ajouter(esp,x,y){if(!ESP[esp])return;if(vivantes(esp).length>=(MAX[esp]||3)+2)return;nouvelle(esp,x??undefined,y??undefined)}
const Bestioles=window.Bestioles={
  demarrer(){if(actif)return;if(!betes.length)peupler();actif=true;cv.hidden=false;tPrec=0;requestAnimationFrame(boucle)},
  arreter(){actif=false;cv.hidden=true;fermerMenu();hoteInteractif(false)},
  action(id,a){action(+id,a)},ajouter,especes:()=>Object.entries(ESP).map(([k,e])=>({id:k,nom:e.nom,ic:e.ic})),
  etat:()=>({actif,betes:betes.length,parEspece:Object.fromEntries(Object.keys(ESP).map(k=>[k,vivantes(k).length]))}),
  _avancer(s){for(let t=0;t<s;t+=1/30)vivre(1/30);dessiner()}};
if(!window.BESTIOLES_ATTENDRE)Bestioles.demarrer();
})();

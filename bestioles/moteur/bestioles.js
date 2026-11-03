// Vivariom — Bestioles : petites bêtes qui vivent sur l'écran (bonus). © 2026 grecdel — tous droits réservés.
// Moteur commun aux applis Android, Windows et Linux : une page transparente plein écran.
// Hôtes :
//   - navigateur / Windows / Linux : menu HTML intégré au clic ; window.bestiolesHote.interactif(bool) (si présent) est
//     appelé quand la souris passe sur une bête ou le menu (pour laisser passer les clics ailleurs) ;
//   - Android : window.AndroidBestioles (pont Java) reçoit positions() et touche(id) ; il appelle Bestioles.action(...).
//     Il peut aussi garder les réglages : lireReglages() / ecrireReglages(json).
// Réglages (espèces et nombre), nourriture (miette, goutte de miel), réaction au pointeur (fuite, « tenir une miette »),
// jour / nuit selon l'heure réelle (papillons le jour, vers luisants la nuit ; l'écran reste transparent).
(()=>{'use strict';
const TAU=Math.PI*2,rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,hyp=Math.hypot;
const angD=(a,b)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
const hsl=(h,s,l,a=1)=>`hsla(${h},${s}%,${l}%,${a})`;
const maintenant=()=>performance.now();
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
  verluisant:{nom:'Ver luisant',ic:'✨',L:17,h:30,s:22,l:24,vit:9,pattes:6,ant:3,corps:[[0.12,0.16],[0.15,0.24],[0.16,0.27],[0.16,0.27],[0.16,0.24],[0.13,0.2],[0.12,0.15]]},
};
for(const k in ESP)ESP[k].L*=ECH;
const PREDS={};for(const k in ESP)for(const p of ESP[k].proies||[])(PREDS[p]=PREDS[p]||[]).push(k);
// réglages par défaut (nombre de bêtes de chaque espèce) et maximum proposé dans les réglages
const DEFAUT={fourmi:5,puceron:6,coccinelle:1,mouche:2,araignee:1,papillon:1,mante:0,verluisant:2};
const NMAX={fourmi:15,puceron:14,coccinelle:4,mouche:6,araignee:3,papillon:4,mante:2,verluisant:5};
const MAX={fourmi:9,puceron:14,coccinelle:2,mouche:4,araignee:2,papillon:2,mante:1,verluisant:3};
const CLE='bestioles_reglages';

// ---------- réglages (gardés dans le navigateur, et chez l'appli Android si elle sait le faire) ----------
let REG={...DEFAUT};
function nettoyer(o){const r={};for(const k in ESP){const n=o&&o[k];r[k]=Number.isFinite(+n)&&n!==null&&n!==''?clamp(Math.round(+n),0,NMAX[k]):DEFAUT[k]}return r}
function chargerReglages(){let txt=null;
  try{txt=localStorage.getItem(CLE)}catch(e){}
  if(!txt&&window.AndroidBestioles&&AndroidBestioles.lireReglages){try{txt=AndroidBestioles.lireReglages()}catch(e){}}
  if(txt){try{REG=nettoyer(JSON.parse(txt))}catch(e){REG={...DEFAUT}}}}
function sauverReglages(){const txt=JSON.stringify(REG);try{localStorage.setItem(CLE,txt)}catch(e){}
  if(window.AndroidBestioles&&AndroidBestioles.ecrireReglages){try{AndroidBestioles.ecrireReglages(txt)}catch(e){}}}
chargerReglages();

// ---------- jour / nuit (heure réelle de l'appareil) ----------
// lever et coucher approximatifs selon la saison (France) : été ≈ 6 h – 22 h, hiver ≈ 8 h 30 – 17 h.
let heureForcee=null,nuitCache=null,nuitT=-1e9;
function heureNuit(){const d=new Date();const h=heureForcee!=null?heureForcee:d.getHours()+d.getMinutes()/60;
  const j=(d-new Date(d.getFullYear(),0,0))/864e5,c=Math.cos(TAU*(j-172)/365);
  const lever=7.25-1.25*c,coucher=19.5+2.5*c;return h<lever||h>=coucher}
function estNuit(){const t=maintenant();if(nuitCache===null||t-nuitT>5000){nuitT=t;nuitCache=heureNuit()}return nuitCache}
// combien on en veut maintenant : les papillons dorment ailleurs la nuit, les vers luisants ne sortent que la nuit
function cible(k){const n=REG[k]||0;if(k==='papillon'&&estNuit())return 0;if(k==='verluisant'&&!estNuit())return 0;return n}
const plafond=k=>Math.max(REG[k]||0,MAX[k]||3)+2;

let betes=[],miettes=[],nid=null,id0=1,actif=false,tPrec=0,simT=0,renfort=0,phase=null;
function bord(){const c=Math.floor(rnd(0,4));return c===0?[rnd(0,W),-20]:c===1?[W+20,rnd(0,H)]:c===2?[rnd(0,W),H+20]:[-20,rnd(0,H)]}
function nouvelle(esp,x,y){const E=ESP[esp];let dedans=x!=null;
  if(x==null){if(esp==='verluisant'){x=rnd(40,W-40);y=rnd(60,H-60)}else[x,y]=bord()} // le ver luisant sort de l'herbe sur place
  const b={id:id0++,esp,E,x,y,a:rnd(0,TAU),v:0,ph:rnd(0,TAU),etat:'marche',t:rnd(1,4),calme:false,vol:false,alt:0,faim:rnd(0.2,0.6),cible:null,porte:null,aile:0,
    age:0,apparait:esp==='verluisant'&&!dedans?1.5:0,peur:0,lueur:0};
  if(E.vole&&(esp==='mouche'||esp==='papillon')&&!(esp==='papillon'&&estNuit())){b.vol=true;b.alt=1}betes.push(b);return b}
function peupler(){betes=[];miettes=[];nid=[rnd(W*0.15,W*0.85),H+30];phase=estNuit();
  for(const k in ESP)for(let q=0;q<cible(k);q++){const b=nouvelle(k,rnd(40,W-40),rnd(60,H-60));b.apparait=0}}
const vivantes=esp=>betes.filter(b=>b.esp===esp&&!b.mort);
const presentes=esp=>betes.filter(b=>b.esp===esp&&!b.mort&&!b.part);
const pres=(b,liste,R)=>{let best=null,bd=R;for(const o of liste){if(o===b||o.mort)continue;const d=hyp(o.x-b.x,o.y-b.y);if(d<bd){bd=d;best=o}}return best};
// faire partir des bêtes (réglage baissé, ou changement jour / nuit) : elles s'éloignent en s'effaçant
function fairePartir(k,n){const l=presentes(k).sort((a,c)=>(a.calme?1:0)-(c.calme?1:0));for(let q=0;q<n&&q<l.length;q++){const b=l[q];b.part=1;b.calme=false}}

// ---------- nourriture : miettes et gouttes de miel ----------
const COLM=['#d8b46a','#e8d2a0','#b07a40'];
function poserNourriture(type,x,y,auto){if(x==null){x=rnd(W*0.3,W*0.7);y=rnd(H*0.3,H*0.7)}
  x=clamp(x,16,W-16);y=clamp(y,16,H-16);
  const m=type==='miel'?{type:'miel',x,y,val:8,val0:8,col:'#e8a92a',r:5,age:0,vie:150,attire:450}
    :{type:'miette',x,y,val:auto?3:6,val0:auto?3:6,col:COLM[Math.floor(rnd(0,3))],r:auto?rnd(2,3.5):rnd(3,4.2),age:0,vie:auto?70:120,attire:auto?220:420};
  miettes.push(m);return m}
const nourritureProche=(b,types,R)=>{let best=null,bd=R;for(const m of miettes){if(m.mort||!types.includes(m.type))continue;const d=hyp(m.x-b.x,m.y-b.y);if(d<Math.min(bd,m.attire)){bd=d;best=m}}return best};

// ---------- pointeur (souris, ou doigt dans un navigateur) ----------
// ptr.vit : vitesse en px/s. Un passage rapide tout près fait fuir les bêtes ; « tenir une miette » les fait suivre.
const ptr={x:-1e4,y:-1e4,t:0,tv:0,vit:0,dedans:false};let tenir=false;
function majPointeur(x,y){const t=maintenant(),dt=t-ptr.t;
  const dedans=x>=0&&y>=0&&x<=W&&y<=H;
  if(ptr.dedans&&dedans&&dt>5&&dt<400){const d=hyp(x-ptr.x,y-ptr.y);if(d>0.5){ptr.vit=d/(dt/1000);ptr.tv=t}else ptr.vit*=0.5}else ptr.vit=0;
  ptr.x=x;ptr.y=y;ptr.t=t;ptr.dedans=dedans}
const tientMiette=()=>tenir&&ptr.dedans;
const GOURMANDS=['fourmi','mouche','papillon'];

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
function battre(b,dt){b.alt=Math.min(1,b.alt+dt*3);b.aile+=dt*(b.esp==='papillon'?9:60)}
function voler(b,dt){battre(b,dt);
  b.t-=dt;if(b.t<=0){b.t=rnd(0.3,1.2);b.cap=b.a+rnd(-1.8,1.8)}
  b.a+=clamp(angD(b.a,b.cap??b.a),-4*dt,4*dt);const m=20;if(b.x<m||b.x>W-m||b.y<m||b.y>H-m)tourneVers(b,W/2,H/2,5,dt);
  b.v=b.E.vitVol||80;b.x+=Math.cos(b.a)*b.v*dt+Math.sin(simT*7+b.id)*12*dt;b.y+=Math.sin(b.a)*b.v*dt+Math.cos(simT*6+b.id)*10*dt;
  b.posee=(b.posee||0)-dt;if(b.posee<=-rnd(4,10)){b.vol=false;b.etat='posee';b.t=rnd(3,8);b.posee=0}}
// voler vers un point précis (nourriture, miette tenue) ; renvoie la distance restante
function volerVers(b,x,y,dt,k=0.75){battre(b,dt);b.vol=true;const d=hyp(x-b.x,y-b.y);tourneVers(b,x,y,7,dt);
  b.v=(b.E.vitVol||80)*k*(d<60?0.5:1);const w=d<40?0.3:1;
  b.x+=Math.cos(b.a)*b.v*dt+Math.sin(simT*7+b.id)*12*dt*w;b.y+=Math.sin(b.a)*b.v*dt+Math.cos(simT*6+b.id)*10*dt*w;return d}
function poser(b){b.vol=false;b.v=0}
function mange(b,o,gain){o.mort=true;b.faim=Math.max(0,b.faim-gain);b.etat='mange';b.t=rnd(2,4);b.v=0}
// mouche, papillon : aller se poser sur la nourriture et s'en régaler. Renvoie true si la bête s'en occupe.
function repas(b,dt,types,mots){
  if(b.repu>0){b.repu-=dt;return false}
  if(b.repas){const m=b.repas;if(m.mort||b.t<=0){b.repas=null;b.repu=rnd(8,16);b.vol=true;b.t=0.5;return false}
    b.t-=dt;b.v=0;b.alt=Math.max(0,b.alt-dt*3);b.aile+=dt*0.8;m.val-=dt*(b.esp==='mouche'?0.12:0.08);if(m.val<=0)m.mort=true;b.faim=Math.max(0,b.faim-dt*0.05);
    b.etat=m.type==='miel'?mots.miel:mots.miette;return true}
  const m=nourritureProche(b,types,b.faim>0.15?600:200);if(!m)return false;
  const tx=m.x-Math.cos(b.a)*b.E.L*0.3,ty=m.y-Math.sin(b.a)*b.E.L*0.3;
  if(volerVers(b,tx,ty,dt)<8){poser(b);b.repas=m;b.t=rnd(4,8)}b.etat=m.type==='miel'?'vole vers le miel':'vole vers la miette';return true}
// suivre la miette tenue au bout du pointeur
function suitMiette(b,dt){if(!tientMiette()||!GOURMANDS.includes(b.esp)||b.porte)return false;
  if(b.esp==='papillon'&&estNuit())return false;
  const d0=hyp(ptr.x-b.x,ptr.y-b.y);if(d0>700)return false;
  const an=b.id*2.4+simT*0.15,R=16+b.E.L*0.6,tx=ptr.x+8+Math.cos(an)*R,ty=ptr.y+12+Math.sin(an)*R,d=hyp(tx-b.x,ty-b.y);
  if(b.E.vole){if(b.vol||d>30){if(volerVers(b,tx,ty,dt,1)<6&&d0<80)poser(b);b.etat='vole après ta miette'}else{b.v=0;b.alt=Math.max(0,b.alt-dt*3);tourneVers(b,ptr.x+8,ptr.y+12,4,dt);b.etat='goûte ta miette'}return true}
  if(d>6){tourneVers(b,tx,ty,7,dt);avance(b,b.E.vit*(d>40?1.3:0.6),dt);b.etat='suit ta miette';b.grignote=0}
  else{b.v=0;tourneVers(b,ptr.x+8,ptr.y+12,5,dt);b.grignote=(b.grignote||0)+dt;b.etat='grignote ta miette';
    if(b.esp==='fourmi'&&b.grignote>2.5){b.grignote=0;b.porte=COLM[b.id%3]}}
  return true}
// fuir le pointeur qui arrive vite
function fuitPointeur(b,dt){const ax=b.x-b.peurX,ay=b.y-b.peurY,an=Math.atan2(ay,ax);
  if(b.esp==='mante'){tourneVers(b,b.peurX,b.peurY,6,dt);b.v=0;b.frappe=0;b.etat='te fixe, pattes levées';return}
  if(b.esp==='verluisant'){b.v=0;b.etat='s\'éteint, inquiet';return}
  if(b.E.vole&&b.esp!=='puceron'){volerVers(b,b.x+Math.cos(an)*200,b.y+Math.sin(an)*200,dt,1);b.repas=null;b.etat='s\'envole, effrayée'}
  else{b.a+=clamp(angD(b.a,an),-9*dt,9*dt);avance(b,b.E.vit*(b.esp==='puceron'?4:2.4),dt);b.etat='s\'enfuit'}
  b.x=clamp(b.x,6,W-6);b.y=clamp(b.y,6,H-6)}
// partir (réglage baissé, ou c'est le jour / la nuit) : s'éloigner en s'effaçant
function partir(b,dt){b.part=Math.max(0,b.part-dt/3);if(b.part<=0){b.mort=true;return}
  if(b.esp==='verluisant'){b.v=0;b.etat='rentre dans l\'herbe';return}
  if(b.esp==='papillon'||b.esp==='mouche'){const c=[[b.x,-40],[b.x,H+40],[-40,b.y],[W+40,b.y]].sort((p,q)=>hyp(p[0]-b.x,p[1]-b.y)-hyp(q[0]-b.x,q[1]-b.y))[0];volerVers(b,c[0],c[1],dt,1);b.etat='s\'en va';return}
  errer(b,dt,b.E.vit*1.2);b.etat='s\'en va'}
const IA={
  fourmi(b,dt){if(fuir(b,dt))return;
    if(b.porte){tourneVers(b,nid[0],nid[1],4,dt);avance(b,b.E.vit,dt);if(hyp(nid[0]-b.x,nid[1]-b.y)<25){b.porte=null;b.x=nid[0]+rnd(-10,10);b.y=H+5;b.a=-Math.PI/2+rnd(-0.6,0.6)}b.etat='rapporte';return}
    if(suitMiette(b,dt))return;
    const m=nourritureProche(b,['miette','miel'],1e9);if(m){tourneVers(b,m.x,m.y,5,dt);avance(b,b.E.vit,dt);b.etat=m.type==='miel'?'va boire le miel':'va chercher une miette';
      if(hyp(m.x-b.x,m.y-b.y)<m.r+4){m.val-=1;if(m.val<=0)m.mort=true;b.porte=m.col;b.faim=Math.max(0,b.faim-0.1)}return}
    // file : suivre une autre fourmi qui va quelque part
    const chef=betes.find(o=>o!==b&&o.esp==='fourmi'&&!o.mort&&!o.part&&(o.porte||/^va |ta miette/.test(o.etat))&&hyp(o.x-b.x,o.y-b.y)<160);
    if(chef&&Math.random()<0.98){const lx=chef.x-Math.cos(chef.a)*14,ly=chef.y-Math.sin(chef.a)*14;tourneVers(b,lx,ly,5,dt);avance(b,b.E.vit*(hyp(lx-b.x,ly-b.y)>8?1.1:0.4),dt);b.etat='suit une autre fourmi';return}
    errer(b,dt,b.E.vit*0.8);b.etat='explore'},
  puceron(b,dt){b.t-=dt;if(b.t<=0){b.t=rnd(3,8);b.marche=Math.random()<0.4;b.cap=b.a+rnd(-2,2)}
    if(b.marche){const autres=vivantes('puceron');const o=pres(b,autres,80);if(o&&hyp(o.x-b.x,o.y-b.y)>12)tourneVers(b,o.x,o.y,2,dt);errer(b,dt,b.E.vit)}else{b.v=0}
    b.etat='suce la sève';if(REG.puceron>0&&Math.random()<dt*0.012&&presentes('puceron').length<Math.max(MAX.puceron,REG.puceron)){nouvelle('puceron',b.x+rnd(-6,6),b.y+rnd(-6,6)).a=b.a}},
  coccinelle(b,dt){if(b.vol){voler(b,dt);b.etat='vole';if(Math.random()<dt*0.2){b.vol=false;b.t=2}return}
    const p=pres(b,vivantes('puceron'),b.faim>0.3?260:60);if(p){tourneVers(b,p.x,p.y,4,dt);avance(b,b.E.vit,dt);b.etat='chasse un puceron';if(hyp(p.x-b.x,p.y-b.y)<6)mange(b,p,0.25);return}
    if(Math.random()<dt*0.04){b.vol=true;b.t=0;return}errer(b,dt,b.E.vit*0.7);b.etat='se promène'},
  mouche(b,dt){if(!b.repas&&suitMiette(b,dt))return;
    if(repas(b,dt,['miette','miel'],{miel:'lèche le miel',miette:'goûte la miette'}))return;
    if(b.vol){voler(b,dt);b.etat='vole';return}
    if(fuir(b,dt))return;b.v=0;b.t-=dt;b.etat=b.toil?'se frotte les pattes':'se pose';if(Math.random()<dt*0.5)b.toil=!b.toil;
    if(b.t<=0){b.vol=true;b.t=0.5}},
  araignee(b,dt){const proies=['mouche','puceron'].flatMap(vivantes).filter(o=>!o.vol&&!o.part);
    if(b.saut){const S=b.saut;S.t+=dt/0.3;const u=Math.min(1,S.t);b.x=S.x0+(S.x1-S.x0)*u;b.y=S.y0+(S.y1-S.y0)*u;b.alt=Math.sin(u*Math.PI)*0.6;
      if(u>=1){b.saut=null;b.alt=0;const o=S.proie;if(o&&!o.mort&&!o.vol&&hyp(o.x-b.x,o.y-b.y)<9&&Math.random()<0.8){mange(b,o,0.5);b.etat='mange'}}return}
    const p=b.faim>0.25?pres(b,proies,300):null;
    if(p){const d=hyp(p.x-b.x,p.y-b.y);tourneVers(b,p.x,p.y,6,dt);
      if(d<45){b.v=0;b.guette=(b.guette||0)+dt;b.etat='guette sa proie';if(b.guette>0.7){b.guette=0;b.saut={x0:b.x,y0:b.y,x1:p.x,y1:p.y,t:0,proie:p};b.etat='bondit'}return}
      b.guette=0;avance(b,b.E.vit*(d<90?0.5:1),dt);b.etat='s\'approche d\'une proie';return}
    b.t-=dt;if(b.pause>0){b.pause-=dt;b.v=0;b.etat='attend';return}if(Math.random()<dt*0.3)b.pause=rnd(1,3);errer(b,dt,b.E.vit);b.etat='explore'},
  papillon(b,dt){
    if(estNuit()){b.repas=null;if(b.vol){b.alt=Math.max(0,b.alt-dt*2);if(b.alt<=0.05)poser(b);else{voler(b,dt);b.vol=true}}b.v=0;b.etat='dort, ailes repliées';return}
    if(!b.repas&&suitMiette(b,dt))return;
    if(repas(b,dt,['miel'],{miel:'boit le miel avec sa trompe',miette:''}))return;
    if(b.vol){voler(b,dt);b.etat='volette';return}if(fuir(b,dt))return;b.v=0;b.aile+=dt*1.2;b.etat='se repose, ailes ouvertes';b.t-=dt;if(b.t<=0){b.vol=true}},
  mante(b,dt){if(b.frappe>0){b.frappe-=dt;b.v=0;b.etat='frappe';return}
    const p=pres(b,['mouche','papillon','coccinelle','fourmi'].flatMap(vivantes),b.faim>0.2?34:0);
    if(p){tourneVers(b,p.x,p.y,8,dt);if(hyp(p.x-b.x,p.y-b.y)<30){b.frappe=0.25;mange(b,p,0.4)}return}
    b.t-=dt;if(b.t<=0){b.t=rnd(4,12);b.bouge=Math.random()<0.35}
    if(b.bouge){errer(b,dt,b.E.vit);b.etat='avance lentement'}else{b.v=0;b.ph+=dt*0.6;b.etat='à l\'affût, immobile'}},
  verluisant(b,dt){
    if(!estNuit()){b.v=0;b.etat='se cache (il brille la nuit)';return}
    b.t-=dt;if(b.t<=0){b.t=rnd(3,9);b.bouge=Math.random()<0.45}
    if(b.bouge){errer(b,dt,b.E.vit);b.etat='avance doucement dans le noir'}else{b.v=0;b.etat='brille pour appeler'}},
};
function vivre(dt){simT+=dt;if(SOUCHE)SOUCHE.t+=dt;
  // changement jour / nuit : les papillons s'en vont le soir, les vers luisants rentrent le matin
  const nuit=estNuit();if(phase!==null&&nuit!==phase){fairePartir(nuit?'papillon':'verluisant',99);renfort=simT+10}phase=nuit;
  // pointeur rapide tout près : peur
  const vite=!tientMiette()&&ptr.dedans&&maintenant()-ptr.tv<250&&ptr.vit>450;
  for(const b of betes){if(b.mort)continue;b.age+=dt;if(b.apparait>0)b.apparait=Math.max(0,b.apparait-dt);b.faim=Math.min(1,b.faim+dt*0.01);
    // le ver luisant s'allume la nuit, s'éteint s'il a peur
    const brille=b.esp==='verluisant'&&nuit&&!(b.peur>0)&&!b.part;b.lueur+=clamp((brille?1:0)-b.lueur,-dt*1.5,dt*0.6);
    if(b.bulle){b.bulle.t-=dt;if(b.bulle.t<=0)b.bulle=null}
    if(b.part){partir(b,dt);continue}
    if(b.cache){seCacher(b,dt);continue}
    if(b.tourne>0){b.tourne-=dt;b.a+=dt*14;b.v=0;continue}
    if(b.virevolte){const V=b.virevolte;V.t-=dt;if(V.t<=0)b.virevolte=null;else{const an=simT*3+b.id;volerVers(b,V.x+Math.cos(an)*45,V.y+Math.sin(an)*30,dt,1);continue}}
    if(vite&&!b.calme&&!b.saut&&hyp(b.x-ptr.x,b.y-ptr.y)<120+b.E.L){b.peur=rnd(1,1.8);b.peurX=ptr.x;b.peurY=ptr.y}
    if(b.peur>0){b.peur-=dt;fuitPointeur(b,dt);continue}
    if(b.calme){b.v=0;b.etat='calme';b.alt=Math.max(0,b.alt-dt*2);b.vol=false;continue}
    if(b.etat==='mange'&&b.t>0&&!b.saut){b.t-=dt;b.v=0;continue}
    if(relations(b,dt))continue;
    IA[b.esp](b,dt)}
  betes=betes.filter(b=>!b.mort);
  for(const m of miettes){m.age+=dt;if(m.age>m.vie)m.mort=true}miettes=miettes.filter(m=>!m.mort);
  // de temps en temps une miette tombe
  if(Math.random()<dt*0.04&&miettes.filter(m=>m.vie<100).length<3)poserNourriture('miette',rnd(40,W-40),rnd(60,H-80),true);
  // garder le nombre choisi dans les réglages : les manquantes arrivent par un bord (vite après un changement, lentement sinon)
  const vit=simT<renfort?0.8:0.05;
  for(const k in ESP){const c=cible(k);if(!c)continue;const n=presentes(k).length;if(n<c&&Math.random()<dt*vit*(k==='puceron'&&!n?4:1)){
    if(k==='puceron'&&!n){const x=rnd(40,W-40),y=rnd(60,H-60);for(let q=0;q<Math.min(3,c);q++)nouvelle('puceron',x+rnd(-15,15),y+rnd(-15,15))}else nouvelle(k)}}}

// ---------- dessin (vu de dessus, style naturel) ----------
function patte(x0,y0,ang,L1,L2,pli,lw){const kx=x0+Math.cos(ang)*L1,ky=y0+Math.sin(ang)*L1,a2=ang+pli;g.lineWidth=lw;g.beginPath();g.moveTo(x0,y0);g.lineTo(kx,ky);g.lineTo(kx+Math.cos(a2)*L2,ky+Math.sin(a2)*L2);g.stroke()}
function dessine(b){const E=b.E,L=E.L,fond=hsl(E.h,E.s,E.l),bord2=hsl(E.h,E.s*0.8,Math.max(8,E.l-18)),clair=hsl(E.h,E.s*0.7,Math.min(90,E.l+22));
  g.save();g.translate(b.x,b.y);
  // ombre (plus décalée quand elle vole ou saute)
  const al=b.alt||0;g.save();g.translate(3+al*10,4+al*14);g.rotate(b.a);g.fillStyle=`rgba(0,0,0,${(0.22-al*0.08).toFixed(2)})`;g.beginPath();g.ellipse(0,0,L*0.55,L*(b.esp==='papillon'?0.5:0.26),0,0,TAU);g.fill();g.restore();
  g.rotate(b.a);const sc=1+al*0.12;g.scale(sc,sc);
  // ver luisant : halo vert-jaune au bout de l'abdomen (la nuit), qui pulse doucement
  if(b.esp==='verluisant'&&b.lueur>0.01){const k=b.lueur*(0.75+0.25*Math.sin(simT*1.7+b.id)),R=L*1.3,cx=-L*0.36;
    const gr=g.createRadialGradient(cx,0,0,cx,0,R);gr.addColorStop(0,`rgba(215,255,120,${(0.75*k).toFixed(3)})`);gr.addColorStop(0.35,`rgba(170,240,90,${(0.32*k).toFixed(3)})`);gr.addColorStop(1,'rgba(150,230,80,0)');
    g.fillStyle=gr;g.beginPath();g.arc(cx,0,R,0,TAU);g.fill()}
  const marche=Math.sin(b.ph*2.2);g.strokeStyle=bord2;g.lineCap='round';
  // pattes (avant = +x)
  if(!(b.vol&&E.vole)){const n=E.pattes/2;for(let q=0;q<n;q++){const off=(q/(n-1||1)-0.5)*L*(E.pattes===8?0.42:b.esp==='verluisant'?0.2:0.38)+(b.esp==='verluisant'?L*0.22:0),sw=(q%2?1:-1)*marche*0.35*(b.v>0?1:0);
      for(const sd of [-1,1]){const ang=sd*Math.PI/2+(q-(n-1)/2)*-0.5+sw*sd;
        const Lp=L*(b.esp==='araignee'?0.42:b.esp==='mante'?0.3:b.esp==='verluisant'?0.2:0.34);patte(off*0.8,sd*L*0.08,ang+(q<n/2?-0.25*sd:0.25*sd),Lp*0.55,Lp*0.6,sd*(q<(n-1)/2?0.7:-0.7),Math.max(0.8,L*0.045))}}
    if(b.esp==='mante'){g.lineWidth=Math.max(1.2,L*0.05);for(const sd of [-1,1]){const fr=b.frappe>0||b.peur>0?0.6:0;g.beginPath();g.moveTo(L*0.32,sd*L*0.03);g.lineTo(L*(0.46+fr*0.3),sd*L*(0.12-fr*0.08));g.lineTo(L*(0.38+fr*0.4),sd*L*0.05);g.stroke()}}}
  // ailes (volants) : battement vu de dessus
  if(E.vole){const op=b.vol?Math.abs(Math.sin(b.aile)):(b.esp==='papillon'?(b.etat.startsWith('dort')?0:0.75+0.25*Math.sin(b.aile)):0);
    if(b.esp==='papillon'){for(const sd of [-1,1]){g.save();g.scale(1,sd*(0.25+0.75*op));g.fillStyle=hsl(E.h,E.s,E.l);g.strokeStyle=hsl(E.h,E.s,22);g.lineWidth=0.8;
      g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*0.5,L*0.15,L*0.6,L*0.95,L*0.05,L*0.9);g.bezierCurveTo(-L*0.2,L*0.85,-L*0.6,L*0.7,0,0);g.fill();g.stroke();
      g.fillStyle=hsl(40,80,60);g.beginPath();g.arc(L*0.25,L*0.55,L*0.09,0,TAU);g.fill();g.fillStyle='#1a1410';g.beginPath();g.arc(-L*0.15,L*0.55,L*0.07,0,TAU);g.fill();g.restore()}}
    else if(b.esp==='coccinelle'){if(b.vol){g.fillStyle='rgba(220,230,240,0.45)';for(const sd of [-1,1]){g.beginPath();g.ellipse(-L*0.1,sd*L*(0.35+0.2*op),L*0.45,L*0.2,sd*0.5,0,TAU);g.fill()}}}
    else{g.fillStyle='rgba(215,228,240,0.5)';g.strokeStyle='rgba(120,140,160,0.6)';g.lineWidth=0.5;const ouv=b.vol?0.5+op*0.6:0.18;for(const sd of [-1,1]){g.beginPath();g.ellipse(-L*0.2,sd*L*0.22*ouv*1.6,L*0.42,L*0.15,sd*(0.25+ouv*0.4),0,TAU);g.fill();g.stroke()}}}
  // corps : segments de la tête (avant) vers l'abdomen
  const C=E.corps;let x=L*0.5;
  for(let i=0;i<C.length;i++){const [lg,lr]=C[i],len=L*lg,r=L*lr/2;x-=len/2;
    let cl=clair,fd=fond,bd=bord2;
    // ver luisant : les deux derniers anneaux sont pâles et s'allument la nuit
    if(b.esp==='verluisant'&&i>=C.length-2){const k=b.lueur;cl=hsl(70,60+35*k,72+18*k);fd=hsl(65,40+50*k,52+20*k);bd=hsl(60,30,30+20*k)}
    const gr=g.createRadialGradient(x-len*0.15,-r*0.4,r*0.1,x,0,Math.max(len,r*2)*0.6);gr.addColorStop(0,cl);gr.addColorStop(0.55,fd);gr.addColorStop(1,bd);
    g.fillStyle=gr;g.beginPath();g.ellipse(x,0,len/2,r,0,0,TAU);g.fill();g.strokeStyle=bd;g.lineWidth=0.6;g.stroke();
    if(b.esp==='verluisant'&&i>0&&i<C.length-2){g.fillStyle='rgba(235,200,150,0.55)';for(const sd of [-1,1]){g.beginPath();g.arc(x,sd*r*0.7,L*0.025,0,TAU);g.fill()}}
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
  if(b.bulle){const k=b.bulle.t,a=clamp(k/0.4,0,1),up=(1.6-k)*14;g.save();g.globalAlpha*=a;g.font=`${Math.max(16,L*0.9)}px sans-serif`;g.textAlign='center';g.fillText(b.bulle.txt,b.x,b.y-L*0.9-up);g.restore()}
  if(b.calme){g.save();g.fillStyle='rgba(255,255,255,0.85)';g.font=`600 ${Math.max(9,L*0.6)}px sans-serif`;const k=(simT*0.6+b.id)%1;g.globalAlpha*=1-k;g.fillText('z',b.x+L*0.4+k*6,b.y-L*0.5-k*10);g.restore()}
  if(selId===b.id){g.save();g.strokeStyle='rgba(255,233,77,0.9)';g.lineWidth=1.5;g.setLineDash([3,3]);g.beginPath();g.arc(b.x,b.y,Math.max(16,L*0.9),0,TAU);g.stroke();g.restore()}}
function opacite(b){let a=1;if(b.part!=null&&b.part!==false)a=Math.min(a,b.part);if(b.apparait>0)a=Math.min(a,1-b.apparait/1.5);
  if(b.esp==='verluisant'&&!estNuit()&&!b.part)a=Math.min(a,0.8);return clamp(a,0,1)}
function dessineMiette(m,x,y,a){g.save();g.globalAlpha=a;
  if(m.type==='miel'){const r=m.r*(0.55+0.45*m.val/m.val0);const gr=g.createRadialGradient(x-r*0.35,y-r*0.4,r*0.1,x,y,r*1.1);gr.addColorStop(0,'#fff1b8');gr.addColorStop(0.35,'#f2b636');gr.addColorStop(1,'#a8620c');
    g.fillStyle='rgba(0,0,0,0.18)';g.beginPath();g.ellipse(x+1.5,y+2,r*1.05,r*0.85,0,0,TAU);g.fill();g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r*1.1,r*0.9,0,0,TAU);g.fill()}
  else{g.fillStyle=m.col;g.beginPath();g.arc(x,y,m.r*(0.6+m.val/m.val0*0.45),0,TAU);g.fill();g.fillStyle='rgba(255,255,255,0.25)';g.beginPath();g.arc(x-m.r*0.25,y-m.r*0.3,m.r*0.3,0,TAU);g.fill()}
  g.restore()}
function dessiner(){g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  for(const m of miettes)dessineMiette(m,m.x,m.y,clamp((m.vie-m.age)/5,0,1));
  for(const b of betes)if(!b.vol&&!b.dehors){g.globalAlpha=opacite(b);dessine(b)}for(const b of betes)if(b.vol&&!b.dehors){g.globalAlpha=opacite(b);dessine(b)}g.globalAlpha=1;
  if(SOUCHE&&SOUCHE.t>0.9)SOUCHE=null;
  if(tientMiette())dessineMiette({type:'miette',col:'#d8b46a',r:4.5,val:1,val0:1},ptr.x+8,ptr.y+12,1)}

// ---------- boucle ----------
function boucle(t){if(!actif)return;const dt=Math.min(0.05,(t-(tPrec||t))/1000);tPrec=t;vivre(dt);dessiner();
  if(window.AndroidBestioles&&(t-(boucle.envoi||0))>60){boucle.envoi=t;try{AndroidBestioles.positions(JSON.stringify(cibles()))}catch(e){}}
  requestAnimationFrame(boucle)}
function cibles(){return betes.filter(b=>!b.part&&!b.dehors).map(b=>({id:b.id,x:Math.round(b.x),y:Math.round(b.y),r:Math.round(Math.max(30,b.E.L*1.1)),esp:b.esp,nom:b.E.nom,ic:b.E.ic,calme:b.calme?1:0,etat:b.calme?'calme':b.etat}))}
function toucher(x,y){let best=null,bd=1e9;for(const b of betes){if(b.part||b.dehors)continue;const d=hyp(b.x-x,b.y-y),R=Math.max(30,b.E.L*1.1);if(d<R&&d<bd){bd=d;best=b}}return best}

// ---------- menu (navigateur, Windows, Linux) ----------
let selId=null,menuB=null;const clicT={t:0,id:-1};addEventListener('contextmenu',e=>{if(toucher(e.clientX,e.clientY))e.preventDefault()});const menu=document.createElement('div');menu.id='bmenu';menu.hidden=true;document.body.appendChild(menu);
function placerMenu(){if(menu.hidden||!menuB)return;const mw=menu.offsetWidth||220,mh=menu.offsetHeight||220,b=menuB;
  menu.style.left=clamp(b.x+20,8,Math.max(8,W-mw-8))+'px';menu.style.top=clamp(b.y-mh/2,8,Math.max(8,H-mh-8))+'px'}
function lignesReglages(){return Object.entries(ESP).map(([k,e])=>`<div class="rg" data-k="${k}"><span>${e.ic} ${e.nom}</span><button data-m="-1" aria-label="moins">−</button><b>${REG[k]}</b><button data-m="1" aria-label="plus">＋</button></div>`).join('')}
function ouvrirMenu(b){if(!b){ouvrirOptions();return}selId=b.id;menuB=b;const E=b.E;
  menu.innerHTML=`<div class="mt">${E.ic} <b>${E.nom}</b><span>${b.calme?'calme':b.etat}</span></div>
   <button data-a="${b.calme?'reveiller':'calmer'}">${b.calme?'🏃 La réveiller':'😌 La calmer'}</button>
   <div class="duo"><button data-a="miette">🍞 Poser une miette</button><button data-a="miel">🍯 Goutte de miel</button></div>
   <button data-a="tenir">${tenir?'✋ Lâcher la miette':'🫳 Tenir une miette'}</button>
   <button data-a="retirer">👋 La faire disparaître</button>
   <button data-a="ajouter">➕ Ajouter une bête…</button>
   <div class="ajout" hidden>${Object.entries(ESP).map(([k,e])=>`<button data-esp="${k}">${e.ic} ${e.nom}</button>`).join('')}</div>
   <button data-a="reglages">⚙️ Réglages : quelles bêtes, combien</button>
   <div class="regl" hidden><p>${estNuit()?'🌙 C\'est la nuit : les papillons dorment ailleurs, les vers luisants brillent.':'☀️ C\'est le jour : les vers luisants sortiront à la nuit tombée.'}</p>${lignesReglages()}<button data-a="defaut" class="petit">↺ Revenir aux réglages de départ</button></div>
   <button data-a="eteindre" class="off">⏻ Tout éteindre</button>`;
  menu.hidden=false;placerMenu();
  menu.querySelectorAll('[data-a]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();const a=bt.dataset.a;
    if(a==='ajouter'||a==='reglages'){const z=menu.querySelector(a==='ajouter'?'.ajout':'.regl');z.hidden=!z.hidden;placerMenu();return}
    if(a==='defaut'){Bestioles.configurer({...DEFAUT});majReglages();return}
    action(b.id,a);fermerMenu()});
  menu.querySelectorAll('[data-esp]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();ajouter(bt.dataset.esp,b.x+rnd(-40,40),b.y+rnd(-40,40));fermerMenu()});
  menu.querySelectorAll('.rg [data-m]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();const k=bt.parentNode.dataset.k;Bestioles.configurer({[k]:REG[k]+(+bt.dataset.m)});majReglages()});
  hoteInteractif(true)}
function ouvrirOptions(){selId=null;menuB={x:W/2-130,y:H/2};
  menu.innerHTML=`<div class="mt">🐞 <b>Bestioles</b><span>touche une bête : elle réagit</span></div>
   <div class="duo"><button data-a="miette">🍞 Poser une miette</button><button data-a="miel">🍯 Goutte de miel</button></div>
   <button data-a="tenir">${tenir?'✋ Lâcher la miette':'🫳 Tenir une miette'}</button>
   <button data-a="ajouter">➕ Ajouter une bête…</button>
   <div class="ajout" hidden>${Object.entries(ESP).map(([k,e])=>`<button data-esp="${k}">${e.ic} ${e.nom}</button>`).join('')}</div>
   <button data-a="reglages">⚙️ Réglages : quelles bêtes, combien</button>
   <div class="regl" hidden><p>${estNuit()?'🌙 C\'est la nuit : les papillons dorment ailleurs, les vers luisants brillent.':'☀️ C\'est le jour : les vers luisants sortiront à la nuit tombée.'}</p>${lignesReglages()}<button data-a="defaut" class="petit">↺ Revenir aux réglages de départ</button></div>
   <button data-a="jeu">🎮 Jouer à Vivariom</button>
   <button data-a="fermer">Fermer</button>
   <button data-a="eteindre" class="off">⏻ Tout éteindre</button>`;
  menu.hidden=false;placerMenu();
  menu.querySelectorAll('[data-a]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();const a=bt.dataset.a;
    if(a==='ajouter'||a==='reglages'){const z=menu.querySelector(a==='ajouter'?'.ajout':'.regl');z.hidden=!z.hidden;placerMenu();return}
    if(a==='defaut'){Bestioles.configurer({...DEFAUT});majReglages();return}
    if(a==='fermer'){fermerMenu();hoteInteractif(false);return}
    if(a==='jeu'){const u='https://grecdel.github.io/vivariom/';if(window.bestiolesHote&&window.bestiolesHote.jeu)window.bestiolesHote.jeu(u);else window.open(u,'_blank');fermerMenu();hoteInteractif(false);return}
    action(-1,a);fermerMenu();hoteInteractif(false)});
  menu.querySelectorAll('[data-esp]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();ajouter(bt.dataset.esp,W/2+rnd(-80,80),H/2+rnd(-80,80));fermerMenu();hoteInteractif(false)});
  menu.querySelectorAll('.rg [data-m]').forEach(bt=>bt.onclick=e=>{e.stopPropagation();const k=bt.parentNode.dataset.k;Bestioles.configurer({[k]:REG[k]+(+bt.dataset.m)});majReglages()});
  hoteInteractif(true)}
function majReglages(){menu.querySelectorAll('.rg').forEach(r=>{r.querySelector('b').textContent=REG[r.dataset.k]})}
function fermerMenu(){menu.hidden=true;selId=null;menuB=null}
function hoteInteractif(v){if(window.bestiolesHote&&hoteInteractif.v!==v){hoteInteractif.v=v;window.bestiolesHote.interactif(v)}}
addEventListener('pointerdown',e=>{if(!menu.hidden&&menu.contains(e.target))return;majPointeur(e.clientX,e.clientY);const b=toucher(e.clientX,e.clientY);
  if(b)reagir(b,e.clientX,e.clientY)
  else{const ouvert=!menu.hidden;fermerMenu();if(!ouvert&&tenir)poserNourriture('miette',e.clientX+8,e.clientY+12)}}); // en tenant une miette : un clic dans le vide la pose là
// souris (ordinateur) : les clics traversent sauf sur une bête ou sur le menu
addEventListener('pointermove',e=>{majPointeur(e.clientX,e.clientY);hoteInteractif(!!toucher(e.clientX,e.clientY)||(!menu.hidden&&menu.contains(e.target)))});
document.addEventListener('pointerleave',()=>{ptr.dedans=false});addEventListener('blur',()=>{ptr.dedans=false});
document.documentElement.addEventListener('mouseleave',()=>{ptr.dedans=false});

// ---------- relations entre les bêtes ----------
// fourmis : gardent leurs pucerons (chassent les coccinelles qui s'en approchent), les « traient », se saluent,
// et s'unissent contre l'araignée ; coccinelles : évitent les fourmis ; araignée et mante : reculent devant un groupe de fourmis ;
// papillons : petite danse à deux.
const proches=(b,esp,r)=>betes.filter(o=>o!==b&&!o.mort&&!o.part&&!o.dehors&&!o.cache&&o.esp===esp&&hyp(o.x-b.x,o.y-b.y)<r);
function bulle(b,txt,p=1){if(!b.bulle&&Math.random()<p)b.bulle={txt,t:1.4}}
function relations(b,dt){if(b.repas||b.saut||b.etat==='mange')return false;
  if(b.esp==='fourmi'){
    if(b.pause>0){b.pause-=dt;b.v=0;return true}
    // une coccinelle s'approche des pucerons : on la chasse
    const coc=proches(b,'coccinelle',140).find(c=>!c.vol&&proches(c,'puceron',90).length);
    if(coc){const d=hyp(coc.x-b.x,coc.y-b.y);tourneVers(b,coc.x,coc.y,8,dt);avance(b,b.E.vit*1.6,dt);b.etat='défend ses pucerons';bulle(b,'💢',dt*2);
      if(d<12){coc.peur=1.4;coc.peurX=b.x;coc.peurY=b.y;coc.vol=true;coc.t=0;bulle(coc,'😣');b.etat='chasse la coccinelle'}return true}
    // à plusieurs contre l'araignée
    const ara=proches(b,'araignee',90)[0];if(ara&&proches(ara,'fourmi',70).length>=3){tourneVers(b,ara.x,ara.y,8,dt);avance(b,b.E.vit*1.4,dt);b.etat='attaque l\'araignée en groupe';bulle(b,'⚔',dt*1.5);return true}
    // traire un puceron (miellat) avant de rentrer au nid
    if(!b.porte){if(b.traire){const p=b.traire;if(p.mort||p.part){b.traire=null;return false}const d=hyp(p.x-b.x,p.y-b.y);
        if(d>9){tourneVers(b,p.x,p.y,7,dt);avance(b,b.E.vit,dt);b.etat='va traire un puceron';return true}
        b.v=0;b.traitT=(b.traitT||0)+dt;b.etat='trait un puceron';tourneVers(b,p.x,p.y,5,dt);if(b.traitT>1.6){b.traitT=0;b.traire=null;b.porte='#ffb43a';bulle(b,'🍯');bulle(p,'💧')}return true}
      if(Math.random()<dt*0.06){const p=proches(b,'puceron',110)[0];if(p){b.traire=p;return true}}}
    // deux fourmis se croisent : elles se touchent les antennes
    if(Math.random()<dt*0.8){const f=proches(b,'fourmi',11)[0];if(f&&!(f.pause>0)){b.pause=f.pause=0.5;b.etat=f.etat='se salue (antennes)'}}
    return false}
  if(b.esp==='coccinelle'&&!b.vol){const f=proches(b,'fourmi',32);if(f.length){b.vol=true;b.t=0;b.etat='fuit les fourmis';bulle(b,'💨',dt*3);return true}}
  if(b.esp==='araignee'||b.esp==='mante'){const f=proches(b,'fourmi',55);if(f.length>=3){const cx=f.reduce((a,o)=>a+o.x,0)/f.length,cy=f.reduce((a,o)=>a+o.y,0)/f.length;
      if(b.esp==='araignee'&&!b.saut){const an=Math.atan2(b.y-cy,b.x-cx),d=rnd(50,80);b.saut={x0:b.x,y0:b.y,x1:clamp(b.x+Math.cos(an)*d,10,W-10),y1:clamp(b.y+Math.sin(an)*d,10,H-10),t:0,proie:null};bulle(b,'😱');b.etat='saute loin des fourmis';return true}
      if(b.esp==='mante'){b.a+=clamp(angD(b.a,Math.atan2(b.y-cy,b.x-cx)),-5*dt,5*dt);avance(b,b.E.vit*2,dt);b.etat='recule devant les fourmis';bulle(b,'😬',dt);return true}}}
  if(b.esp==='papillon'&&b.vol){if(b.danse>0){b.danse-=dt;const o=b.partenaire;if(!o||o.mort){b.danse=0;return false}const an=simT*4+(b.id%2?Math.PI:0);
      volerVers(b,(b.x+o.x)/2+Math.cos(an)*25,(b.y+o.y)/2+Math.sin(an)*18,dt,0.9);b.etat='danse avec un autre papillon';return true}
    if(Math.random()<dt*0.05){const o=proches(b,'papillon',160).find(o=>o.vol&&!(o.danse>0));if(o){b.danse=o.danse=4;b.partenaire=o;o.partenaire=b;bulle(b,'💕')}}}
  if(b.esp==='mouche'&&!b.vol){const a=proches(b,'araignee',60)[0]||proches(b,'mante',60)[0];if(a){b.vol=true;b.t=0;b.etat='s\'envole, une araignée la guette';return true}}
  return false}
// ---------- écran d'accueil / appli ouverte (Android) ----------
// dans une appli : la plupart des bêtes se cachent au bord de l'écran, une ou deux restent ;
// retour à l'accueil : elles réapparaissent toutes d'un coup et détalent, comme sous une souche qu'on soulève.
let MODE='accueil',SOUCHE=null;
function changerMode(m){m=m==='appli'?'appli':'accueil';if(m===MODE)return MODE;MODE=m;const vis=betes.filter(b=>!b.part&&!b.mort);
  if(m==='appli'){const restent=vis.slice().sort((a,b)=>(a.esp==='fourmi'||a.esp==='coccinelle'?-1:0)-(b.esp==='fourmi'||b.esp==='coccinelle'?-1:0)||Math.random()-0.5).slice(0,vis.length>6?2:1);
    for(const b of vis)if(!restent.includes(b)){const bords=[[b.x,-30],[b.x,H+30],[-30,b.y],[W+30,b.y]].sort((p,q)=>hyp(p[0]-b.x,p[1]-b.y)-hyp(q[0]-b.x,q[1]-b.y));b.cache={x:bords[0][0],y:bords[0][1]}}}
  else{const sx=rnd(W*0.25,W*0.75),sy=rnd(H*0.45,H*0.75);SOUCHE={x:sx,y:sy,t:0};
    for(const b of vis){if(!b.cache)continue;b.cache=null;b.dehors=false;b.x=clamp(sx+rnd(-60,60),10,W-10);b.y=clamp(sy+rnd(-30,30),10,H-10);b.apparait=0;b.peur=rnd(1.2,2.2);b.peurX=sx;b.peurY=sy;b.calme=false;if(b.E.vole){b.vol=true;b.t=0}}}
  return MODE}
function seCacher(b,dt){const c=b.cache;if(b.dehors){b.v=0;return}if(b.E.vole)volerVers(b,c.x,c.y,dt,1);else{tourneVers(b,c.x,c.y,8,dt);avance(b,b.E.vit*2,dt)}
  b.etat='se cache';if(b.x<-15||b.x>W+15||b.y<-15||b.y>H+15)b.dehors=true}
{const n0=nouvelle;nouvelle=function(...a){const b=n0(...a);if(MODE==='appli'&&b&&betes.filter(o=>!o.cache&&!o.part&&o!==b).length>=2){b.cache={x:-30,y:b.y};b.dehors=true}return b}}
// navigateur seul (sans appli autour) : un petit bouton ⚙ pour les options
setTimeout(()=>{if(window.AndroidBestioles||window.bestiolesHote)return;const o=document.createElement('button');o.id='bopt';o.textContent='⚙';o.title='Options des bestioles';
  o.style.cssText='position:fixed;right:10px;bottom:10px;z-index:5;width:40px;height:40px;border-radius:50%;border:1px solid #2f3f2a;background:#161c15ee;color:#e8eee4;font-size:20px;cursor:pointer';
  o.onclick=e=>{e.stopPropagation();menu.hidden?ouvrirOptions():fermerMenu()};document.body.appendChild(o)},300);
// ---------- commandes (aussi utilisées par les hôtes) ----------
function presDe(b){if(!b)return[undefined,undefined];const cote=b.x>W-120?-1:b.x<120?1:(Math.random()<0.5?-1:1),an=(cote<0?Math.PI:0)+rnd(-0.7,0.7),d=rnd(45,70);
  return[b.x+Math.cos(an)*d,b.y+Math.sin(an)*d]}
// ---------- toucher une bête : elle réagit (chacune à sa façon) ----------
const REACTIONS={
  fourmi:{bulle:'❗',etat:'détale !'},puceron:{bulle:'💧',etat:'lâche une goutte de miellat'},coccinelle:{bulle:'❤️',etat:'ouvre ses ailes et s\'envole'},
  mouche:{bulle:'💨',etat:'file en bourdonnant'},araignee:{bulle:'❓',etat:'saute de côté'},papillon:{bulle:'✨',etat:'virevolte autour de ton doigt'},
  mante:{bulle:'👀',etat:'te regarde, pattes levées'},verluisant:{bulle:'💡',etat:'s\'allume très fort'}};
function reagir(b,x,y){if(!b||b.part)return;const R=REACTIONS[b.esp]||{bulle:'❗',etat:'sursaute'};x=x??b.x;y=y??b.y;
  const t=maintenant();b.touches=(t-(b.dernTouche||0)<1500?(b.touches||0)+1:1);b.dernTouche=t;b.calme=false;
  if(b.touches>=3){b.bulle={txt:'😆',t:1.8};b.tourne=1.2;b.etat='a des chatouilles !';b.touches=0;return}
  b.bulle={txt:R.bulle,t:1.6};b.etat=R.etat;
  if(b.esp==='coccinelle'||b.esp==='mouche'||b.esp==='papillon'){b.vol=true;b.t=0;b.repas=null;b.peur=b.esp==='papillon'?0:1.2;b.peurX=x;b.peurY=y;if(b.esp==='papillon'){b.virevolte={x,y,t:2.5}}}
  else if(b.esp==='araignee'){const an=rnd(0,TAU),d=rnd(40,70);b.saut={x0:b.x,y0:b.y,x1:clamp(b.x+Math.cos(an)*d,10,W-10),y1:clamp(b.y+Math.sin(an)*d,10,H-10),t:0,proie:null}}
  else if(b.esp==='mante'){b.peur=1.5;b.peurX=x;b.peurY=y}
  else if(b.esp==='verluisant'){b.lueur=1.6}
  else if(b.esp==='puceron'){poserNourriture('miel',b.x+rnd(-6,6),b.y+rnd(-6,6));const m=miettes[miettes.length-1];if(m){m.r=Math.max(2.5,m.r*0.35);m.val=m.val0=Math.min(m.val0,0.6)}b.peur=0.5;b.peurX=x;b.peurY=y}
  else{if(b.porte){poserNourriture('miette',b.x,b.y);b.porte=null}b.peur=1.4;b.peurX=x;b.peurY=y}}
function action(id,a){const b=betes.find(o=>o.id===id);if(a==='toucher'){reagir(b);return}if(a==='eteindre'){Bestioles.arreter();if(window.bestiolesHote&&window.bestiolesHote.eteindre)window.bestiolesHote.eteindre();return}
  if(a==='miette'||a==='miel'){const[x,y]=presDe(b);poserNourriture(a,x,y);return}
  if(a==='tenir'){tenir=!tenir;return}
  if(!b)return;if(a==='calmer')b.calme=true;if(a==='reveiller')b.calme=false;if(a==='retirer')b.mort=true}
function ajouter(esp,x,y){if(!ESP[esp])return;if(presentes(esp).length>=plafond(esp))return;const b=nouvelle(esp,x??undefined,y??undefined);if(x!=null)b.apparait=0;return b}
const Bestioles=window.Bestioles={
  demarrer(){if(actif)return;if(!betes.length)peupler();actif=true;cv.hidden=false;tPrec=0;requestAnimationFrame(boucle)},
  arreter(){actif=false;cv.hidden=true;fermerMenu();hoteInteractif(false)},
  action(id,a){action(+id,a)},ajouter,mode:changerMode,options:()=>ouvrirOptions(),reagir:id=>reagir(betes.find(o=>o.id===+id)),
  // ordinateur : position de la souris donnée par l'appli (sur Linux, la fenêtre ne reçoit rien tant qu'elle laisse passer les clics)
  survol(x,y){majPointeur(x,y);const sur=!!toucher(x,y);hoteInteractif(sur||!menu.hidden);return sur},
  especes:()=>Object.entries(ESP).map(([k,e])=>({id:k,nom:e.nom,ic:e.ic,n:REG[k],max:NMAX[k]})),
  // réglages : {espece:nombre}. configurer({fourmi:8,mante:0}) : enregistre et applique tout de suite.
  reglages:()=>({...REG}),
  configurer(o){if(!o||typeof o!=='object')return{...REG};for(const k in o){if(!ESP[k])continue;const n=clamp(Math.round(+o[k]||0),0,NMAX[k]);REG[k]=n;
      const trop=presentes(k).length-cible(k);if(trop>0)fairePartir(k,trop)}
    sauverReglages();renfort=simT+8;return{...REG}},
  // nourriture : type 'miette' ou 'miel', à l'endroit donné (sinon vers le milieu de l'écran)
  nourrir(type,x,y){poserNourriture(type==='miel'?'miel':'miette',x,y);return miettes.length},
  // « tenir une miette » au bout de la souris : les gourmands suivent le pointeur
  tenir(v){tenir=v==null?!tenir:!!v;return tenir},
  // essais : forcer l'heure (0-24), null = heure réelle
  heure(h){heureForcee=h==null?null:+h;nuitCache=null;return estNuit()},
  etat:()=>({actif,betes:betes.filter(b=>!b.part).length,parEspece:Object.fromEntries(Object.keys(ESP).map(k=>[k,presentes(k).length])),
    nuit:estNuit(),tenir,nourriture:miettes.map(m=>({type:m.type,x:Math.round(m.x),y:Math.round(m.y),reste:+m.val.toFixed(2)})),reglages:{...REG},
    etats:betes.filter(b=>!b.part).map(b=>({id:b.id,esp:b.esp,etat:b.etat,x:Math.round(b.x),y:Math.round(b.y),lueur:+b.lueur.toFixed(2)}))}),
  _avancer(s){for(let t=0;t<s;t+=1/30)vivre(1/30);dessiner()}};
if(!window.BESTIOLES_ATTENDRE)Bestioles.demarrer();
})();

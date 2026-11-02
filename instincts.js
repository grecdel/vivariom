// ---------- instincts : comportements propres à certaines espèces, et « mission » visible de la bête sélectionnée ----------
// Araignée sauteuse : guette, s'approche, puis bondit sur sa proie (même un insecte qui vole bas) ;
//   tente de soie au pied d'une plante pour la nuit et pour son cocon.
// Mygale : affût à l'entrée du terrier, bondit sur ce qui passe ; ne s'éloigne que si elle a très faim.
// Araignée-loup : court au sol ; bondit aussi sur les insectes posés près d'elle.
const PROIES_SAUT={mouche:22,papillon:28,puceron:8,abeille:24,chenille:20,coccinelle:16,cloporte:22,fourmi:12,tenebrion:20};
const PROIES_MYGALE={cloporte:30,fourmi:14,chenille:20,escargot:34,tenebrion:26,bousier:26,phasme:30,lombric:38,coccinelle:18};
const isSauteuse=c=>c.sp.beh==='sauteuse';
// bond : arc de cercle jusqu'à la proie ; réussite si la proie est encore là à l'arrivée
function spiderLeap(c,o,dur){c.leap={x0:c.x,y0:c.y,z0:c.z||0,x1:o.x,y1:o.y,z1:o.z||0,t:0,dur,h:4+dist(c.x,c.y,o.x,o.y)*0.35,prey:o};c.path=null;c.state='leap';
  c.ang=Math.atan2(o.y-c.y,o.x-c.x)}
function leapStep(c,dt,table){const L=c.leap;L.t+=dt/L.dur;const u=Math.min(1,L.t);
  c.x=L.x0+(L.x1-L.x0)*u;c.y=L.y0+(L.y1-L.y0)*u-Math.sin(u*Math.PI)*L.h;c.z=c.tz=L.z0+(L.z1-L.z0)*u;c.v=0;
  if(u<1)return;c.leap=null;c.state='idle';const o=L.prey;
  if(o&&!o.dead&&dist3(o,c)<7&&Math.random()<0.8){die(o,c);c.energy+=table[baseOf(o.sp.id)]||18;c.digT=10+16*Math.max(0,(c.sp.vsize||1)-1);c.state='eat';c.t=2;
    wave({x:c.x,y:c.y,max:22,sp:60,col:c.cLine,a:0.7});jlog('🕷',`${nm(c)} bondit sur ${nm(o).toLowerCase()}`)}
  c.k=null}
// chute après un bond dans le vide (la gravité du jeu ignore les araignées, pour l'épeire suspendue à ses fils)
function spiderFall(c,dt){const k=cellOf(c.x,c.y),i=k%COLS,j=(k-i)/COLS;if(walk(i,j))return false;if(T[k]){c.y-=CS;c.k=null;return true}c.y+=80*dt;c.k=null;c.path=null;return true}
function preyNear(c,table,R,maxUp){let best=null,bd=R;const sy=surfY(Math.floor(c.x/CS));
  for(const o of creatures){if(o.dead||o===c||!table[baseOf(o.sp.id)]||(pop[o.sp.id]||0)<=1||o.state==='caught')continue;
    if(maxUp!=null&&o.y<sy-maxUp)continue;const d=dist3(o,c);if(d<bd){bd=d;best=o}}return best}

UPD.sauteuse=function(c,dt){
  c.digT=(c.digT||0)-dt;
  if(c.leap){leapStep(c,dt,PROIES_SAUT);return}
  if(spiderFall(c,dt))return;
  if(c.state==='eat'){c.v=0;c.t-=dt;if(c.t<=0)c.state='idle';return}
  let n=nestOf(c);const sy=surfY(Math.floor(c.x/CS));
  // tente de soie : au pied d'une plante, à la première occasion
  if(!n&&c.age>15&&c.y>=sy-3){const p=plants.find(q=>q.alive&&Math.abs(q.col*CS-c.x)<20);if(p){n={owner:c,world:T,kind:'tente',i:p.col,x:p.col*CS+CS/2+3,ys:surfY(p.col),yb:surfY(p.col),z:p.z||0};nests.push(n);jlog('🕸',`${nm(c)} tisse sa tente de soie`)}}
  const nuit=!isDay(),sac=sacOf(c);
  // chasse : guetter, s'approcher, bondir
  if(c.energy<125&&c.digT<=0&&!(nuit&&n)){const o=preyNear(c,PROIES_SAUT,150,45);
    if(o){const d=dist3(o,c);
      if(d<24){c.v=0;c.path=null;c.state='stalk';c.ang+=angDiff(c.ang,Math.atan2(o.y-c.y,o.x-c.x))*0.3;c.stalk=(c.stalk||0)+dt;if(c.stalk>0.6){c.stalk=0;spiderLeap(c,o,0.32)}return}
      c.stalk=0;c.state='hunt';c.t=(c.t||0)-dt;
      if(c.t<=0||!c.path||!c.path.length){c.t=1;const ti=clamp(Math.floor(o.x/CS),1,COLS-2),tk=findWalk(o.x,Math.min(o.y,surfY(ti)-2));if(tk==null||!goTo(c,k=>Math.abs((k%COLS)-(tk%COLS))<=3&&Math.abs(((k/COLS)|0)-((tk/COLS)|0))<=4,12000))randomWalk(c,15)}
      stepPath(c,dt,1.2);return}}
  // repos à la tente (la nuit, ou pour garder le cocon) ; sinon balade
  if(n&&(nuit||sac||c.energy>=125)){const d=Math.hypot(c.x-n.x,c.y-(n.ys-1));
    if(d>4){c.state='home';c.t=(c.t||0)-dt;if(c.t<=0||!c.path||!c.path.length){c.t=1.5;if(!goTo(c,k=>Math.abs((k%COLS)-n.i)<=1&&Math.abs(((k/COLS)|0)-(n.ys-Y0)/CS)<=2,12000))randomWalk(c,10)}stepPath(c,dt,0.8);return}
    c.v=0;c.path=null;c.state='rest';
    if(!sac&&c.energy>120&&c.age>60&&canRepro('araignee',4)&&Math.random()<dt*0.05){c.energy-=55;spiderLay(c)}return}
  c.state='idle';c.t=(c.t||0)-dt;if(c.t<=0||!c.path||!c.path.length){c.t=2;randomWalk(c,30)}stepPath(c,dt,0.6)};

// mygale et araignée-loup : bond sur une proie toute proche (affût) avant leur chasse habituelle
const uScoloSp=UPD.scolopendre;
UPD.scolopendre=function(c,dt){if(c.sp.id!=='araignee')return uScoloSp(c,dt);
  c.digT=(c.digT||0)-dt;
  if(c.leap){leapStep(c,dt,isMygale(c)?PROIES_MYGALE:PROIES_SAUT);return}
  if(spiderFall(c,dt))return;
  if(c.state==='eat'){c.v=0;c.t-=dt;if(c.t<=0)c.state='idle';return}
  if(c.digT<=0&&c.energy<115){const o=preyNear(c,isMygale(c)?PROIES_MYGALE:PROIES_SAUT,isMygale(c)?20:16,isMygale(c)?6:12);if(o){spiderLeap(c,o,isMygale(c)?0.28:0.3);return}}
  // mygale : à l'affût à l'entrée du terrier tant qu'elle n'a pas très faim
  const n=nestOf(c);if(isMygale(c)&&n&&c.energy>55&&!sacOf(c)){const d=Math.hypot(c.x-n.x,c.y-(n.ys-1));
    if(d<=4){c.v=0;c.path=null;c.state='affut';return}}
  uScoloSp(c,dt)};
// la sauteuse a son propre comportement (avant : celui de la scolopendre)
for(const k in VSP)if(k==='araignee:sauteuse')VSP[k].beh='sauteuse';
// cocon de la sauteuse : dans sa tente
const spiderLay0=spiderLay;spiderLay=function(c){spiderLay0(c);const n=nestOf(c),s=sacOf(c);if(s&&n&&n.kind==='tente'){s.kind='nest';s.x=n.x;s.y=n.ys-1.5;s.z=n.z}};

// ----- mission de la bête sélectionnée (affichée sous le HUD) -----
function mission(c){if(!c||c.dead)return '';const st=c.state,id=c.sp.id,start=ROLES[c.role]?ROLES[c.role].start:100,faim=c.energy<start*0.35;
  if(st==='caught')return '🕸 Prise dans une toile : elle se débat';
  if(c.leap||st==='leap')return '🦘 Bondit sur sa proie';
  if(st==='stalk')return '👀 Guette sa proie, prête à bondir';
  if(st==='affut')return '🕳 À l\'affût à l\'entrée de son terrier';
  if(st==='eat')return '🍽 Mange';
  if(st==='chrysalide')return '🦋 Se transforme en papillon';
  if(id==='reine')return st==='found'?'👑 Creuse sa chambre pour fonder la colonie':'👑 Pond et nourrit la colonie';
  if(st==='dig'||st==='dig2')return '⛏ Creuse une galerie';
  if(st==='haul')return '⛏ Sort la terre de la fourmilière';
  if(st==='return')return '🏠 Rapporte de la nourriture au nid';
  if(st==='guard'||st==='guarding')return '🛡 Garde les pucerons (miellat)';
  if(id==='araignee'&&typeof orbOf==='function'){const o=orbOf(c);if(o&&o.prog<1)return '🕸 Tisse sa toile';if(o)return '🕸 Attend au centre de sa toile'}
  if(typeof sacOf==='function'&&sacOf(c))return '🥚 Garde son cocon d\'œufs';
  if(st==='rest')return '💤 Se repose dans sa tente de soie';
  if(st==='home')return '🏠 Rentre à son abri';
  if(st==='hunt'||st==='go')return faim?'🍽 Affamée : cherche à manger':'🍽 Part chercher à manger';
  if(faim)return '⚠ Affamée : il lui faut à manger';
  if(c.energy>start*1.1)return '💞 Bien nourrie : prête à se reproduire';
  return '🚶 Explore les environs'}
const hudMission0=hud;hud=function(){hudMission0();if(state!=='play'||!selC||selC.dead)return;const m=mission(selC);if(!m)return;
  hudEl.insertAdjacentHTML('beforeend',`<div class="row"><span style="color:#bfeaa8">${FICHES[baseOf(selC.sp.id)]?FICHES[baseOf(selC.sp.id)].ic:''} ${nm(selC)} : ${m}</span></div>`)};
if(window.__sim)window.__sim.mission=()=>selC?mission(selC):'';

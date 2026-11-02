// ---------- araignées : toile ronde (épeire), terrier de soie (mygales), cocons d'œufs ----------
// orbs : toiles rondes tissées au milieu du cadre de fils de l'épeire ; elles attrapent les volants.
// sacs : cocons d'œufs (dans la toile, au fond du terrier, ou portés par l'araignée-loup / sauteuse) ; les petits en sortent.
// nests : terriers des mygales, tapissés de soie.
let orbs=[],sacs=[],nests=[];
const isWebSpider=c=>c.sp.id==='araignee'&&!c.sp.beh;
const isMygale=c=>c.sp.id==='araignee'&&/mygale/.test(c.sp.vid||'');
const orbOf=c=>orbs.find(o=>o.owner===c&&o.world===T);
function sacOf(c){return sacs.find(s=>s.owner===c&&s.world===T&&!s.done)}
function nestOf(c){return nests.find(n=>n.owner===c&&n.world===T)}
// pondre : un cocon de 3 à 5 œufs, là où l'araignée garde ses petits
function spiderLay(c){const o=orbOf(c),n=nestOf(c);
  const s={owner:c,sp:c.sp,world:T,t:0,hatch:rnd(40,55),n:3+Math.floor(Math.random()*3),z:c.z||0,x:c.x,y:c.y,kind:'carry'};
  if(isWebSpider(c)){s.kind='web';if(o){s.x=o.x+o.r*0.35;s.y=o.y-o.r*0.25;s.z=o.z}}
  else if(isMygale(c)&&n){s.kind='nest';s.x=n.x;s.y=n.yb-1.5;s.z=n.z}
  sacs.push(s);jlog('🕷',`${c.sp.vnom||FICHES.araignee.nom} : un cocon d'œufs`);say(`${c.sp.vnom||'L\'araignée'} a tissé un cocon d'œufs`)}
// mygale : creuse un court terrier vertical sous elle et le tapisse de soie
function digNest(c){const i=clamp(Math.floor(c.x/CS),2,COLS-3),j0=SURF[i];let d=0;
  for(;d<4;d++){const k=K(i,j0+d);if(!T[k]||T[k]===5)break;T[k]=0;DUG[k]=1}
  if(d<2)return null;surfCol(i);soilDirty=true;
  const n={owner:c,world:T,i,x:i*CS+CS/2,ys:Y0+j0*CS,yb:Y0+(j0+d)*CS,z:c.z||0};nests.push(n);jlog('🕳',`${c.sp.vnom} creuse son terrier`);return n}

const uAraignee0=UPD.araignee;
UPD.araignee=function(c,dt){
  let prey=false;for(const o of creatures)if(!o.dead&&o.state==='caught'&&o.strand&&o.strand.owner===c){prey=true;break}
  const o=orbOf(c);
  if(!prey&&!o){const mine=strands.filter(s=>s.owner===c&&s.life>0);
    // assez de fils de cadre : la toile ronde se tisse au centre
    if(mine.length>=2){let x=0,y=0,z=0,n=0;for(const s of mine)for(const a of [s.a,s.b]){x+=a.x;y+=a.y;z+=a.z||0;n++}x/=n;y/=n;z/=n;
      let r=1e9;for(const s of mine)for(const a of [s.a,s.b])r=Math.min(r,Math.hypot(a.x-x,a.y-y));r=clamp(r*0.85,8,30);
      if(y<surfY(Math.floor(x/CS))-r-4)orbs.push({owner:c,world:T,x,y,z,r,prog:0,life:rnd(150,220),vib:0})}}
  if(!prey&&o){const d=dist(c.x,c.y,o.x,o.y);
    if(d>3){spiderMove(c,o.x,o.y,dt,1);return}
    c.v=0;if(o.prog<1){o.prog=Math.min(1,o.prog+dt/16);c.ang+=dt*4;return}
    // toile finie : elle attend au centre ; elle pond quand elle est bien nourrie
    if(c.energy>175&&canRepro('araignee',4)&&!sacOf(c)){c.energy-=95;spiderLay(c)}
    return}
  uAraignee0(c,dt)};

// araignées chasseuses : les mygales gardent un terrier ; toutes restent près de leur cocon
const uScolo0=UPD.scolopendre;
UPD.scolopendre=function(c,dt){if(c.sp.id!=='araignee')return uScolo0(c,dt);
  let n=nestOf(c);if(isMygale(c)&&!n&&c.age>45&&c.y>=surfY(Math.floor(c.x/CS))-3){c.path=null;n=digNest(c);if(n){c.x=n.x;c.y=n.ys-1}}
  const s=sacOf(c);
  if(n&&(s||c.energy>110)){// rentrer au terrier (pour pondre ou garder le cocon)
    const d=Math.hypot(c.x-n.x,c.y-(n.ys-1));if(d>4){if(!c.path||!c.path.length){if(!goTo(c,k=>Math.abs((k%COLS)-n.i)<=1&&Math.abs(((k/COLS)|0)-(n.ys-Y0)/CS)<=2,20000))return uScolo0(c,dt)}stepPath(c,dt);return}
    c.v=0;c.path=null;if(!s&&c.energy>118&&canRepro('araignee',3)){c.energy-=60;spiderLay(c)}return}
  uScolo0(c,dt)};

// toiles rondes : capture des volants
const webCheck0=webCheck;
webCheck=function(c){webCheck0(c);if(!c.fly||c.state==='caught'||(c.webCd||0)>0)return;
  for(const o of orbs){if(o.world!==T||o.prog<0.5||o.owner===c)continue;
    if(Math.abs((c.z||0)-o.z)<5&&Math.hypot(c.x-o.x,c.y-o.y)<o.r*o.prog){
      if(Math.random()<0.18){c.state='caught';c.t=rnd(8,12);c.strand={owner:o.owner,life:1,vib:0};o.vib=2.5;o.hx=c.x-o.x;o.hy=c.y-o.y;jlog('🕸',`${nm(c)} pris(e) dans une toile`);ach('toile');wave({x:c.x,y:c.y,max:24,sp:60,col:'#ff7a5c',a:0.6})}
      else c.webCd=1;return}}};

function soieTick(dt){
  orbs=orbs.filter(o=>o.world===T&&(o.life-=dt*(o.owner.dead?4:1))>0);for(const o of orbs)o.vib=Math.max(0,o.vib-dt);
  nests=nests.filter(n=>n.world===T&&!(n.owner.dead&&!sacs.some(s=>s.kind==='nest'&&s.x===n.x&&!s.done)));
  for(const s of sacs){if(s.world!==T||s.done)continue;
    if(s.kind==='carry'){if(s.owner.dead)s.kind='sol';else{const L=realLen(s.owner)*0.45;s.x=s.owner.x-Math.cos(s.owner.ang||0)*L;s.y=s.owner.y-Math.sin(s.owner.ang||0)*L+1;s.z=s.owner.z||0}}
    s.t+=dt;if(s.t>=s.hatch){s.done=true;
      // pas plus de petits que de place (même limite que la reproduction)
      const place=Math.max(1,6-creatures.filter(o=>!o.dead&&o.sp.id==='araignee').length);s.n=Math.min(s.n,place);
      for(let q=0;q<s.n;q++){const b=born(s.sp,s.x+rnd(-3,3),s.y,{energy:55,z:s.z});
        if(isWebSpider(b)){b.home=clamp(s.x+rnd(-140,140),20,WW-20);b.y=Math.min(b.y,surfY(Math.floor(b.x/CS))-8)}
        else{b.k=findWalk(b.x,Math.min(b.y,surfY(Math.floor(b.x/CS))-2));const [x2,y2]=cxy(b.k);b.x=x2;b.y=y2}}
      jlog('🕷',`Éclosion : ${s.n} petites araignées`)}}
  sacs=sacs.filter(s=>s.world===T&&!s.done)}
const update0=update;update=function(dt){update0(dt);soieTick(dt)};

// ----- dessin (coupe et 3/4) : avec les fils -----
function drawSoie(){const lw=Math.max(0.18,0.55/camZ);
  for(const o of orbs){if(o.world!==T)continue;ctx.save();zT(o.z);const a=Math.min(1,o.life/10),X=o.x,Y=o.y;
    // la toile se déforme : onde qui part du point touché, et creux sous le poids d'une proie
    const hx=o.hx||0,hy=o.hy||0,A=Math.min(1.2,o.vib||0)*1.1,sag=o.charge||0;
    const D=(px,py)=>{if(!A&&!sag)return [X+px,Y+py];const dx=px-hx,dy=py-hy,d=Math.hypot(dx,dy)||1,e=Math.exp(-d/(o.r*0.55)),w=A*e*Math.sin(simT*34-d*0.9);
      const g=sag*1.6*Math.exp(-d/(o.r*0.7));return [X+px+dx/d*w,Y+py+dy/d*w+g]};
    ctx.strokeStyle=o.vib>0?'#ffd8c4':'#e8eef6';ctx.lineWidth=lw;ctx.globalAlpha=0.55*a;ctx.beginPath();
    const NR=14,p1=Math.min(1,o.prog*2.2);for(let q=0;q<NR;q++){const t=q/NR*TAU+0.2;for(let s2=0;s2<=4;s2++){const rr=o.r*p1*s2/4,[x,y]=D(Math.cos(t)*rr,Math.sin(t)*rr);s2?ctx.lineTo(x,y):ctx.moveTo(x,y)}}ctx.stroke();
    // spirale de capture, tissée de l'extérieur vers le centre
    const p2=clamp((o.prog-0.35)/0.65,0,1);if(p2>0){ctx.globalAlpha=0.45*a;ctx.beginPath();const turns=7,steps=Math.floor(turns*NR*p2);
      for(let q=0;q<=steps;q++){const f=q/(turns*NR),t=q/NR*TAU+0.2,rr=o.r*(1-f*0.85);const [x,y]=D(Math.cos(t)*rr,Math.sin(t)*rr);q?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
    const [cx0,cy0]=D(0,0);ctx.globalAlpha=0.7*a;ctx.fillStyle='#f4f6fa';ctx.beginPath();ctx.arc(cx0,cy0,Math.max(0.5,o.r*0.06),0,TAU);ctx.fill();ctx.restore()}
  for(const n of nests){if(n.world!==T)continue;
    if(n.kind==='tente'){ctx.save();zT(n.z);ctx.globalAlpha=0.55;ctx.fillStyle='#eef2f6';ctx.strokeStyle='#ffffff';ctx.lineWidth=lw;ctx.beginPath();ctx.ellipse(n.x,n.ys,4.5,3,0,Math.PI,TAU);ctx.closePath();ctx.fill();ctx.globalAlpha=0.7;ctx.beginPath();for(let q=0;q<5;q++){const a=Math.PI+q/4*Math.PI;ctx.moveTo(n.x+Math.cos(a)*4.5,n.ys+Math.sin(a)*3);ctx.lineTo(n.x+Math.cos(a)*7,n.ys+Math.sin(a)*5.5)}ctx.stroke();ctx.restore();continue}
    ctx.save();zT(n.z);ctx.strokeStyle='#e6e9ee';ctx.lineWidth=lw;ctx.globalAlpha=0.6;ctx.beginPath();
    // collerette de soie autour de l'entrée, et soie le long des parois
    for(let q=0;q<9;q++){const a=Math.PI+q/8*Math.PI;ctx.moveTo(n.x,n.ys);ctx.lineTo(n.x+Math.cos(a)*7,n.ys+Math.sin(a)*2.2)}
    for(const sd of [-1,1]){ctx.moveTo(n.x+sd*CS*0.45,n.ys);ctx.lineTo(n.x+sd*CS*0.45,n.yb)}ctx.stroke();ctx.restore()}
  for(const s of sacs){if(s.world!==T||s.done)continue;ctx.save();zT(s.z);const R=s.kind==='carry'?1.6:2.3,w=0.5+0.5*Math.sin(s.t*0.8);
    if(s.kind==='web'){const o=orbOf(s.owner);if(o){ctx.strokeStyle='#e8eef6';ctx.lineWidth=lw;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(o.x,o.y);ctx.stroke()}}
    ctx.globalAlpha=0.95;ctx.fillStyle='#efe6cf';ctx.strokeStyle='#fffaf0';ctx.lineWidth=lw;ctx.beginPath();ctx.ellipse(s.x,s.y,R,R*1.15,0,0,TAU);ctx.fill();ctx.stroke();
    // œufs devinés à travers la soie quand l'éclosion approche
    if(s.t>s.hatch*0.5){ctx.fillStyle=`rgba(190,150,90,${(0.25+0.35*w*(s.t/s.hatch)).toFixed(2)})`;for(let q=0;q<4;q++){ctx.beginPath();ctx.arc(s.x+Math.cos(q*1.7)*R*0.45,s.y+Math.sin(q*1.7)*R*0.45,R*0.28,0,TAU);ctx.fill()}}
    ctx.restore()}
  ctx.globalAlpha=1}
const drawStrands0=drawStrands;drawStrands=function(){drawStrands0();drawSoie()};
if(window.__sim)window.__sim.soie=()=>({toiles:orbs.filter(o=>o.world===T).map(o=>Math.round(o.prog*100)+'%'),cocons:sacs.filter(s=>s.world===T).map(s=>s.kind+':'+Math.round(s.t)+'/'+Math.round(s.hatch)),terriers:nests.filter(n=>n.world===T).length,fils:strands.filter(s=>s.life>0).length});

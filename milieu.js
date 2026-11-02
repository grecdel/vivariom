// ================= PLANTES ET MILIEU (lot 3) =================
// nouvelles plantes (fougère arborescente, dionée carnivore, champignons), fruits, plantes qui fanent,
// moisissures sur un sol détrempé, saisons en campagne, climat réglable par vivarium (bac à sable).

// ---------- nouvelles plantes ----------
Object.assign(PLANTS,{
  arbo:{nom:'Fougère arborescente',ic:'🌴',h:[60,110],flower:false,txt:"Un tronc fibreux et une couronne de grandes frondes : de l'ombre et un perchoir. Aime l'humidité."},
  dionee:{nom:'Dionée attrape-mouche',ic:'🪤',h:[6,12],flower:false,txt:"Plante carnivore : ses pièges se referment sur les mouches et les pucerons qui s'y posent. Sol humide et pauvre."},
  champignon:{nom:'Champignons',ic:'🍄',h:[5,12],flower:false,txt:"Pas besoin de lumière : ils poussent dans le sol humide et riche, se nourrissent de la litière, puis lâchent leurs spores."}});
function updChampignon(p,dt){p.age+=dt;const i=p.col;let w=0,n=0;for(let dj=1;dj<=4;dj++){const k=K(i,Math.min(ROWS-1,p.base+dj));w+=WET[k];n+=NUT[k]}w/=4;p.wet=w;
  p.e+=dt*((w>0.4?0.1:-0.12)+Math.min(0.06,n*0.05));
  for(const it of items)if(it.type==='litiere'&&!it.dead&&Math.abs(it.i-i)<4&&Math.random()<dt*0.05){it.val-=1;p.e+=0.4;if(it.val<=0)it.dead=true}
  if(p.e>1.2&&p.h<p.maxH){const j=p.base-p.h;if(j>4&&!T[K(i,j)]){p.e-=0.3;STEM[K(i,j)]++;p.h++}}
  if(p.h>=p.maxH&&Math.random()<dt*0.01){groundItem('graine',i+Math.round(rnd(4,30))*(Math.random()<0.5?-1:1),{val:3,z:p.z+rnd(-40,40),kind:'champignon'});p.e-=0.3}
  if(p.e<-2||p.age>p.maxAge*0.6){groundItem('litiere',i,{val:2,z:p.z});killPlant(p)}}
{const up=updPlant;updPlant=function(p,dt){if(p.kind==='champignon'){updChampignon(p,dt);return}up(p,dt);
  if(p.snap>0)p.snap-=dt;
  // fruits : une fleur pollinisée (ou une ronce en fleur) donne parfois un fruit qui tombe
  if((p.kind==='fleur'||p.kind==='ronce'||!p.kind)&&p.fl.open&&p.h>=p.maxH&&Math.random()<dt*(p.fl.poll?0.03:0.004)&&items.filter(it=>it.type==='fruit').length<14){
    groundItem('fruit',clamp(p.col+Math.round(rnd(-3,3)),1,COLS-2),{val:2,z:p.z+rnd(-4,4),col:p.kind==='ronce'?'#3a1450':'#d8402a'});p.e-=0.15}}}
// dessin des nouvelles plantes, vue de côté et 3/4
function drawPlantNew(p,x,yb,H,vig,sw){const k=p.kind,dry=p.wet<0.15;ctx.lineWidth=0.6;
  if(k==='arbo'){const th=H*0.72,top=yb-th;ctx.strokeStyle=hsl(25,35,22);ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x,yb);ctx.lineTo(x+sw*0.2,top);ctx.stroke();
    ctx.strokeStyle=hsl(25,30,30);ctx.lineWidth=0.4;for(let q=2;q<th;q+=3){ctx.beginPath();ctx.moveTo(x-1.2,yb-q);ctx.lineTo(x+1.2,yb-q-1);ctx.stroke()}
    const hue=dry?50:118,line=hsl(hue,60,32+vig*22),fill=hsl(hue,50,15+vig*10,0.85),n=7;
    for(let f=0;f<n;f++){const a=-Math.PI/2+(f-(n-1)/2)*0.42,L=H*0.42*(0.75+0.25*((f*5+p.id)%3)/2),tx=x+sw*0.2+Math.cos(a)*L*1.1+sw,ty=top+Math.abs(Math.cos(a))*L*0.55-Math.sin(-a)*L*0.25,cx=x+Math.cos(a)*L*0.5,cy=top-L*0.35;
      ctx.strokeStyle=line;ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+sw*0.2,top);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
      for(let q=1;q<10;q++){const t=q/10,u=1-t,px=u*u*(x+sw*0.2)+2*u*t*cx+t*t*tx,py=u*u*top+2*u*t*cy+t*t*ty,s=(1-t)*3.5+0.8;ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(px,py+s*0.4,s*0.5,s,0.3,0,TAU);ctx.fill()}}return}
  if(k==='dionee'){const n=4,hue=dry?45:105;for(let f=0;f<n;f++){const a=-Math.PI/2+(f-(n-1)/2)*0.7,L=Math.max(4,H)*0.9,tx=x+Math.cos(a)*L+sw*0.2,ty=yb-Math.abs(Math.sin(a))*L;
      ctx.strokeStyle=hsl(hue,55,40);ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,yb);ctx.lineTo(tx,ty);ctx.stroke();
      const shut=(p.snap>0&&f===p.snapF)?0.12:0.75,r=2.4;ctx.save();ctx.translate(tx,ty);ctx.rotate(a+Math.PI/2);
      for(const s of [-1,1]){ctx.save();ctx.rotate(s*shut);ctx.fillStyle=hsl(350,70,38+vig*10);ctx.strokeStyle=hsl(hue,60,45);ctx.beginPath();ctx.ellipse(0,-r,r*0.75,r,0,0,TAU);ctx.fill();ctx.stroke();
        ctx.strokeStyle=hsl(hue,50,60);ctx.lineWidth=0.25;for(let q=0;q<6;q++){const b=-Math.PI/2+(q-2.5)*0.45;ctx.beginPath();ctx.moveTo(Math.cos(b)*r*0.75*s,-r+Math.sin(b)*r);ctx.lineTo(Math.cos(b)*r*1.1*s,-r+Math.sin(b)*r*1.35);ctx.stroke()}ctx.restore()}ctx.restore()}return}
  if(k==='champignon'){const n=1+p.id%3;for(let f=0;f<n;f++){const bx=x+(f-(n-1)/2)*3.5,h=H*(0.6+0.4*((f+p.id)%3)/2),cw=1.6+h*0.35;
      ctx.fillStyle='#e8dcc0';ctx.fillRect(bx-0.6,yb-h,1.2,h);ctx.fillStyle=(p.id%2?hsl(25,55,38+vig*8):hsl(8,65,42+vig*8));ctx.beginPath();ctx.ellipse(bx,yb-h,cw,cw*0.6,0,Math.PI,TAU);ctx.fill();
      if(p.id%2===0){ctx.fillStyle='#fff';for(const d of [-0.5,0.3]){ctx.beginPath();ctx.arc(bx+d*cw,yb-h-cw*0.3,0.35,0,TAU);ctx.fill()}}}}}
{const dk=drawPlantKind;drawPlantKind=function(p){if(PLANTS[p.kind]&&['arbo','dionee','champignon'].includes(p.kind)){const i=p.col;drawPlantNew(p,i*CS+CS/2,Y0+(p.base+1)*CS,p.h*CS,clamp(p.e/3,0.25,1),Math.sin(simT*1.3+i)*2);return}dk(p)}}
// une plante assoiffée s'affaisse
{const dp=drawPlant;drawPlant=function(p){if(p.wet!=null&&p.wet<0.15&&p.kind!=='cactus'){const x=p.col*CS+CS/2,yb=Y0+(p.base+1)*CS,f=0.78+0.22*clamp(p.wet/0.15,0,1);ctx.save();ctx.translate(x,yb);ctx.scale(1,f);ctx.translate(-x,-yb);dp(p);ctx.restore()}else dp(p)}}
{const dt0=drawPlantTop;drawPlantTop=function(g,p){const k=p.kind;if(!['arbo','dionee','champignon'].includes(k)){dt0(g,p);return}const x=p.col*CS+CS/2,y=-zOfPlant(p);
  if(k==='arbo'){g.strokeStyle=hsl(118,55,40);g.fillStyle=hsl(118,45,18,0.8);for(let q=0;q<8;q++){const a=q*0.785+p.id,L=10+p.h*0.18;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a+0.3)*L*0.6,y+Math.sin(a+0.3)*L*0.6,x+Math.cos(a)*L,y+Math.sin(a)*L);g.lineWidth=0.5;g.stroke();
    for(let r=2;r<9;r++){const px=x+Math.cos(a)*L*r/9,py=y+Math.sin(a)*L*r/9;g.beginPath();g.arc(px,py,1.3*(1-r/11),0,TAU);g.fill()}}g.fillStyle=hsl(25,35,25);g.beginPath();g.arc(x,y,1.6,0,TAU);g.fill();return}
  if(k==='dionee'){for(let q=0;q<5;q++){const a=q*1.256+p.id,tx=x+Math.cos(a)*3,ty=y+Math.sin(a)*3;g.strokeStyle=hsl(105,55,40);g.lineWidth=0.4;g.beginPath();g.moveTo(x,y);g.lineTo(tx,ty);g.stroke();g.fillStyle=hsl(350,70,42);g.beginPath();g.ellipse(tx,ty,1.4,0.9,a,0,TAU);g.fill()}return}
  const n=1+p.id%3;for(let f=0;f<n;f++){const cx=x+(f-(n-1)/2)*2.5,r=1.2+p.h*0.12;g.fillStyle=p.id%2?hsl(25,55,40):hsl(8,65,45);g.beginPath();g.arc(cx,y,r,0,TAU);g.fill();g.strokeStyle='#0005';g.lineWidth=0.3;g.stroke()}}}

// ---------- dionée : les pièges se referment ----------
let carnT=0;
function carnivoreTick(dt){carnT-=dt;if(carnT>0)return;carnT=0.25;
  for(const p of plants){if(!p.alive||p.kind!=='dionee'||p.snap>0)continue;const x=p.col*CS+CS/2,y=Y0+(p.base+1-p.h)*CS;
    for(const c of creatures){if(c.dead||!(c.sp.id==='mouche'||c.sp.id==='puceron'||(c.sp.id==='fourmi'&&!c.col)))continue;
      if(Math.hypot(c.x-x,c.y-y)<6&&Math.abs((c.z||0)-p.z)<10&&Math.random()<0.35){die(c,'meta');p.snap=8;p.snapF=Math.floor(Math.random()*4);p.e+=2;
        jlog('🪤',`La dionée a attrapé : ${nm(c)}`);wave({x,y,max:10,sp:40,col:'#ff4d5a',a:0.6});break}}}
  // les mouches sont attirées par l'odeur sucrée des pièges
  if(Math.random()<0.1){const D=plants.filter(p=>p.alive&&p.kind==='dionee');if(D.length)for(const c of creatures)if(!c.dead&&c.sp.id==='mouche'&&!c.goal&&Math.random()<0.05){const p=D[Math.floor(Math.random()*D.length)];c.attire={x:p.col*CS+CS/2,y:Y0+(p.base-p.h)*CS-2,t:6}}}}
{const um=UPD.mouche;UPD.mouche=function(c,dt){if(c.attire&&!c.stade){c.attire.t-=dt;if(c.attire.t>0){flyTo(c,c.attire.x,c.attire.y,dt,0.7);return}c.attire=null}um(c,dt)}}

// ---------- fruits : tombent, se mangent, puis pourrissent en litière ----------
const MANGE_FRUIT=['escargot','cloporte','grillon','mouche','tenebrion','bousier','fourmi','papillon'];
let fruitT=0;
function fruitTick(dt){fruitT-=dt;if(fruitT>0)return;fruitT=1;
  for(const it of items){if(it.type!=='fruit'||it.dead)continue;if(it.age>70){it.dead=true;groundItem('litiere',it.i,{val:2,z:it.z});continue}
    for(const c of creatures){if(c.dead||!MANGE_FRUIT.includes(c.sp.id)||c.energy>95)continue;const d=dist3(c,it);
      if(d<5){it.val-=1;c.energy+=14;if(it.val<=0){it.dead=true;break}}
      else if(d<50&&!c.fly&&!c.path&&!c.stade&&Math.random()<0.1&&typeof goToItem==='function'){goToItem(c,it)}}}}
{const di=drawItems;drawItems=function(){di();
  for(const it of items){if(it.type!=='fruit'||it.dead||it.carried)continue;ctx.save();zT(it.z);const r=1.3+(it.val||1)*0.25,rot=clamp((it.age-45)/25,0,1);
    ctx.fillStyle=rot>0.5?'#5a3a20':(it.col||'#d8402a');ctx.beginPath();ctx.arc(it.x,it.y-r,r,0,TAU);ctx.fill();
    ctx.fillStyle='#fff6';ctx.beginPath();ctx.arc(it.x-r*0.35,it.y-r*1.35,r*0.3,0,TAU);ctx.fill();ctx.restore()}
  dessinMoisissures()}}

// ---------- moisissures : sol détrempé trop longtemps ----------
let MOI=new Float32Array(1),moiT=0,moiDit=false;
{const gw=genWorld;genWorld=function(...a){const r=gw(...a);MOI=new Float32Array(COLS);moiDit=false;return r}}
function moisiTick(dt){moiT-=dt;if(moiT>0)return;moiT=1;if(MOI.length!==COLS)MOI=new Float32Array(COLS);let n=0;
  for(let i=0;i<COLS;i++){if(SURF[i]>=ROWS)continue;const w=WET[K(i,SURF[i])];MOI[i]=clamp(MOI[i]+(w>0.72?0.015:w<0.5?-0.04:-0.004),0,1);if(MOI[i]>0.4)n++}
  if(n>4&&!moiDit){moiDit=true;jlog('🧫','Des moisissures apparaissent sur le sol détrempé');say('🧫 Moisissures : le sol reste détrempé trop longtemps. Brumise moins, ouvre la ventilation.')}
  if(n===0)moiDit=false;
  for(const p of plants)if(p.alive&&MOI[p.col]>0.5&&p.kind!=='champignon')p.e-=0.06;
  for(const it of items)if(it.type==='litiere'&&MOI[it.i]>0.5)it.age+=2}
function dessinMoisissures(){if(MOI.length!==COLS)return;const zs=view==='side'?[0]:[ZD*0.15,ZD*0.45,ZD*0.75];
  for(const z of zs){ctx.save();zT(z);for(let i=0;i<COLS;i++){const m=MOI[i];if(m<0.2)continue;const x=i*CS+CS/2,y=surfY(i);ctx.globalAlpha=(m-0.2)*0.8;ctx.fillStyle='#e8eadc';
    for(let q=0;q<3;q++){const h=((i*13+q*7+(z|0))%10)/10;ctx.beginPath();ctx.arc(x+(h-0.5)*CS,y-0.4-h*0.8*m,0.5+m*0.8*h,0,TAU);ctx.fill()}}ctx.restore()}ctx.globalAlpha=1}

// ---------- saisons en campagne : printemps actif, hiver au ralenti ----------
if(OPT.seasonsC===undefined)OPT.seasonsC=true;
const SEAS_C=75;// une saison = 75 s de jeu en campagne
{const s0=seasonOn;seasonOn=function(){if(lvl&&!lvl.sandbox&&lvlIdx>=3&&state!=='menu')return !!OPT.seasonsC;return s0()}}
{const s0=season;season=function(){if(lvl&&!lvl.sandbox){const s=simT%(SEAS_C*4);return {S:SEASONS[Math.floor(s/SEAS_C)],left:SEAS_C-(s%SEAS_C)}}return s0()}}
// hiver : les bêtes ralentissent et mangent moins ; printemps : tout repart
{const m0=metabF;metabF=function(){const v=m0();if(!seasonOn())return v;const n=season().S.nom;return v*(n==='Hiver'?0.75:n==='Printemps'?1.1:1)}}
{const oo=openOpts;openOpts=function(){oo();const h=[...document.querySelectorAll('#opts h3')].find(e=>e.textContent==='Jeu');if(!h)return;
  const row=document.createElement('div');row.className='orow';row.innerHTML=`<span>🌸 Saisons (campagne, dès le niveau 4)</span><span class="oseg"><button data-sc="1" class="${OPT.seasonsC?'on':''}">Oui</button><button data-sc="0" class="${OPT.seasonsC?'':'on'}">Non</button></span>`;
  h.after(row);row.querySelectorAll('button').forEach(b=>b.onclick=()=>{OPT.seasonsC=b.dataset.sc==='1';saveOpt();openOpts()})}}

// ---------- climat réglable par vivarium (bac à sable) ----------
const CLIMATS={tempere:{ic:'🌳',nom:'Tempéré',t:0,evap:1,humide:0},tropical:{ic:'🌴',nom:'Tropical',t:5,evap:0.6,humide:0.004},desert:{ic:'🏜',nom:'Désert',t:8,evap:1.9,humide:0}};
const climat=()=>lvl&&lvl.sandbox&&curViv&&CLIMATS[curViv.climat]||null;
{const t0=temp;temp=function(){const C=climat();return t0()+(C?C.t:0)}}
{const ev=enterViv;enterViv=function(v){ev(v);const C=CLIMATS[v.climat];if(C&&lvl)lvl.evap=C.evap}}
{const fs=fillSheet;fillSheet=function(){fs();const v=ROOM.list[sheetIdx],ci=document.querySelector('#rsheet .cinfo');if(!v||!ci)return;const cur=v.climat||'tempere';
  ci.insertAdjacentHTML('beforeend',`<div class="clims"><span class="dim">Climat</span>${Object.entries(CLIMATS).map(([k,C])=>`<button class="clim ${k===cur?'on':''}" data-c="${k}">${C.ic} ${C.nom}</button>`).join('')}</div>`);
  ci.querySelectorAll('.clim').forEach(b=>b.onclick=e=>{e.stopPropagation();v.climat=b.dataset.c;saveRoom();fillSheet()})}}
let tropT=0;
function climatTick(dt){const C=climat();if(!C||!C.humide)return;tropT-=dt;if(tropT>0)return;tropT=0.5;for(let q=0;q<6;q++){const i=Math.floor(Math.random()*COLS);if(SURF[i]<ROWS){const k=K(i,SURF[i]);WET[k]=Math.min(0.8,WET[k]+C.humide*60)}}}
{const hd=hud;hud=function(){hd();const C=climat();if(C&&C.nom!=='Tempéré'&&state==='play'){const r=hudEl.firstElementChild;if(r)r.insertAdjacentHTML('beforeend',`<span class="dim">${C.ic} ${C.nom}</span>`)}}}

{const up=update;update=function(dt){up(dt);if(state==='menu')return;carnivoreTick(dt);fruitTick(dt);moisiTick(dt);climatTick(dt)}}
if(window.__sim)window.__sim.milieu=()=>({fruits:items.filter(it=>it.type==='fruit').length,moi:Array.from(MOI).filter(m=>m>0.4).length,kinds:plants.map(p=>p.kind||'fleur').join(','),saison:seasonOn()?season().S.nom:'',temp:temp().toFixed(1)});

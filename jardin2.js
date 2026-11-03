// ================= MALADIES DES PLANTES, FOURMIS CHAMPIGNONNISTES, ESSAIMS (idées 9, 10, 11) =================

// ---------- 9. maladies des plantes ----------
// - virus de la mosaïque : apparaît sur une plante couverte de pucerons ; les pucerons qui la quittent le transportent.
//   Feuilles marbrées de jaune, croissance ralentie, peu de fleurs. Une plante virosée ne guérit pas.
// - taches brunes (champignon des feuilles) : sol détrempé et moisissures ; gagnent les plantes voisines ; guérissent au sec.
let mPlT=0,virusDit=false,tacheDit=false;
function maladiesPlantes(dt){mPlT-=dt;if(mPlT>0)return;mPlT=2;
  for(const c of creatures){if(c.dead||c.sp.id!=='puceron')continue;const p=c.k!=null?plantAtK(c.k):null;
    if(p&&p.virus)c.porteVirus=true;else if(p&&!p.virus&&c.porteVirus&&Math.random()<0.03){p.virus=true;jlog('🦠','Un puceron a transmis le virus de la mosaïque à une autre plante')}}
  for(const p of plants){if(!p.alive||p.kind==='champignon'||p.kind==='cactus')continue;
    if(!p.virus&&p.aph>=6&&Math.random()<0.012){p.virus=true;jlog('🦠','Virus de la mosaïque sur une plante couverte de pucerons');if(!virusDit){virusDit=true;aidePlante('virus')}}
    if(p.virus){p.e-=0.05;if(p.fl&&p.fl.open&&Math.random()<0.08)p.fl.open=false}
    const m=typeof MOI!=='undefined'&&MOI.length===COLS?MOI[p.col]:0;
    if(!p.taches){p.humi=(p.wet>0.78||m>0.3)?(p.humi||0)+2:Math.max(0,(p.humi||0)-3);if(p.humi>50&&Math.random()<0.05){p.taches=true;p.secT=0;jlog('🟤','Des taches brunes apparaissent sur les feuilles (trop d\'humidité)');if(!tacheDit){tacheDit=true;aidePlante('taches')}}}
    else{p.e-=0.03;if(p.wet<0.4){p.secT=(p.secT||0)+2;if(p.secT>40){p.taches=false;p.humi=0;jlog('🌿','Les taches des feuilles ont séché : la plante guérit')}}else p.secT=0;
      if(p.wet>0.7&&Math.random()<0.04){const v=plants.find(q=>q.alive&&!q.taches&&q!==p&&Math.abs(q.col-p.col)<8&&q.kind!=='cactus');if(v){v.taches=true;v.secT=0}}}}}
function aidePlante(type){const msg=type==='virus'?'🦠 Virus de la mosaïque : les pucerons l\'ont apporté. Les feuilles jaunissent et la plante s\'épuise. Pour l\'éviter : des coccinelles ou des perce-oreilles contre les pucerons. Une plante malade ne guérit pas : elle finira par laisser la place.'
  :'🟤 Taches brunes sur les feuilles : un champignon, à cause de l\'humidité. Brumise moins et ouvre la ventilation : au sec, la plante guérit.';
  say(msg);if(typeof aideForte==='function'&&aideForte()){const S=$('soin');S.innerHTML=`<button class="sx" id="soinx">✕</button><b>${type==='virus'?'🦠 Une plante a un virus':'🟤 Une plante a des taches'}</b><p>${msg}</p><div class="sbtn"><button class="btn2" id="soinok">J'ai compris</button></div>`;S.style.display='block';$('soinx').onclick=$('soinok').onclick=()=>{S.style.display='none'}}}
// dessin : feuilles marbrées (virus) et taches brunes
let CURP=null;
{const f0=fleurOrga;fleurOrga=function(p){CURP=p;try{f0(p)}finally{CURP=null}}}
{const a0=autreOrga;autreOrga=function(p){CURP=p;try{a0(p)}finally{CURP=null}}}
{const fe=feuille;feuille=function(x,y,a,L,W,fill,line,nerv){const p=CURP;if(p&&p.virus){const k=Math.sin(x*3.1+y*1.7);if(k>-0.3)fill=k>0.4?hsl(54,70,40,0.9):hsl(80,45,28,0.9)}
  fe(x,y,a,L,W,fill,line,nerv);
  if(p&&p.taches&&L>3){const c=Math.cos(a),s=Math.sin(a);ctx.fillStyle='#5a3a18';ctx.globalAlpha=0.85;for(const u of [0.35,0.62]){const v=W*0.15*(u>0.5?1:-1);ctx.beginPath();ctx.arc(x+c*L*u-s*v,y+s*L*u+c*v,Math.max(0.35,W*0.13),0,TAU);ctx.fill()}ctx.globalAlpha=1}}}

// ---------- 10. fourmis champignonnistes ----------
VARS.fourmi.push({v:'atta',nom:'Fourmi champignonniste',la:'Atta cephalotes',h:18,s:65,l:30,size:1.15,spd:1,trait:"Coupe des morceaux de feuilles, les rapporte au nid et y cultive un champignon qui la nourrit."});
{const b=SPI.fourmi,V=VARS.fourmi[VARS.fourmi.length-1],sp=Object.assign({},b,{vid:'fourmi:atta',vnom:V.nom,vla:V.la,vtrait:V.trait,h:V.h,s:V.s,l:V.l,sf:b.sf*V.size,spd:b.spd*V.spd,vsize:V.size});VSP[sp.vid]=sp;
  const r=SPI.reine;VSP['reine:atta']=Object.assign({},r,{vid:'reine:atta',vnom:'Reine fourmi champignonniste',h:sp.h,s:sp.s,l:sp.l,sf:r.sf*V.size});SHORT['fourmi:atta']='Champignon.'}
const estAtta=c=>c.sp.vid==='fourmi:atta';
{const uf=UPD.fourmi;UPD.fourmi=function(c,dt){const col=c.col;if(!estAtta(c)||!col||col.dead){uf(c,dt);return}
  c.attaT=(c.attaT||0)-dt;if(c.attaT<=0&&!c.feuille&&!c.coupe){c.attaT=rnd(6,12);c.coupe=Math.random()<0.55&&plants.some(p=>p.alive&&p.h>6&&p.kind!=='cactus')}
  if(c.feuille){if(gravity(c,dt))return;const ex=col.i*CS+CS/2,ey=surfY(col.i);if(Math.abs(c.x-ex)<CS*3&&Math.abs(c.y-ey)<CS*5){c.feuille=false;c.coupe=false;c.path=null;col.food=(col.food||0)+1.4;col.jardin=Math.min(40,(col.jardin||0)+1);return}
    if(!c.path||!c.path.length){if(!goTo(c,k=>Math.abs((k%COLS)-col.i)<=2&&Math.abs(((k/COLS)|0)-SURF[col.i])<=4,16000)){c.retour=(c.retour||0)+1;if(c.retour>4){c.feuille=false;c.coupe=false;c.retour=0;col.food=(col.food||0)+1;col.jardin=(col.jardin||0)+1}}}stepPath(c,dt);return}
  if(c.coupe){if(gravity(c,dt))return;const p=c.k!=null?plantAtK(c.k):null;
    if(p&&p.kind!=='cactus'){c.v=0;c.cutT=(c.cutT||0)+dt;if(c.cutT>1.8){c.cutT=0;p.e-=0.35;p.coupee=(p.coupee||0)+1;c.feuille=true;c.path=null;if(Math.random()<0.1)jlog('🍃','Une fourmi champignonniste découpe un morceau de feuille')}return}
    if(!c.path||!c.path.length){const P=plants.filter(q=>q.alive&&q.h>6&&q.kind!=='cactus');if(!P.length){c.coupe=false;uf(c,dt);return}const q=P.reduce((a,b)=>Math.abs(a.col*CS-c.x)<Math.abs(b.col*CS-c.x)?a:b);
      if(!goTo(c,k=>{const pp=plantAtK(k);return pp===q&&((k/COLS)|0)<q.base-3},16000)){c.coupe=false;uf(c,dt);return}}
    stepPath(c,dt);return}
  uf(c,dt)}}
// la colonie se nourrit de son champignon
let attaT=0;
function jardinAtta(dt){attaT-=dt;if(attaT>0)return;attaT=3;for(const col of colonies){if(col.dead||!col.jardin)continue;if(col.wsp&&col.wsp.vid==='fourmi:atta'){col.food=(col.food||0)+Math.min(1,col.jardin*0.04);col.jardin=Math.max(0,col.jardin-0.15)}}}
{const dc=drawColonies;drawColonies=function(){dc();for(const col of colonies){if(col.dead||!col.jardin)continue;const ch=[...col.chamber],n=Math.min(ch.length,Math.ceil(col.jardin/2));
  for(let q=0;q<n;q++){const k=ch[q];if(k==null)continue;const [x,y]=cxy(k);ctx.fillStyle='#ece8dc';ctx.globalAlpha=0.85;for(let r=0;r<3;r++){ctx.beginPath();ctx.arc(x+((q*7+r*3)%5-2)*0.35,y+0.3-r*0.3,0.55+r*0.15,0,TAU);ctx.fill()}}ctx.globalAlpha=1}}}
// le morceau de feuille porté au-dessus de la tête
{const dp=drawProfile;drawProfile=function(c,alpha,gray){dp(c,alpha,gray);if(gray||!c.feuille)return;const d=Math.cos(c.ang)>=0?1:-1,L=realLen(c);ctx.save();ctx.fillStyle='#5aa83a';ctx.strokeStyle='#2e6a1a';ctx.lineWidth=0.2;
  ctx.beginPath();ctx.moveTo(c.x+d*L*0.3,c.y-L*0.35);ctx.lineTo(c.x+d*L*0.1,c.y-L*1.25);ctx.lineTo(c.x+d*L*0.9,c.y-L*1.05);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}
{const m0=mission;mission=function(c){if(c&&!c.dead&&estAtta(c)){if(c.feuille)return '🍃 Rapporte un morceau de feuille au jardin de champignons';if(c.coupe)return '✂ Va découper un morceau de feuille'}return m0(c)}}

// ---------- 11. essaims d'abeilles ----------
// quand les abeilles sont nombreuses, la moitié forme un essaim : il se pose en grappe sur une plante,
// puis s'envole fonder une nouvelle colonie ailleurs (il quitte le vivarium).
let ESSAIM=null,essT=40;
function essaimTick(dt){if(state!=='play')return;
  if(!ESSAIM){essT-=dt;if(essT>0)return;essT=30;const A=creatures.filter(c=>!c.dead&&c.sp.id==='abeille'&&!c.bebe);if(A.length<9||Math.random()<0.5)return;
    const P=plants.filter(p=>p.alive&&p.h>15);if(!P.length)return;const p=P[Math.floor(Math.random()*P.length)],[x,y]=[p.col*CS+CS/2,Y0+(p.base-Math.floor(p.h*0.75))*CS];
    const B=A.slice().sort(()=>Math.random()-0.5).slice(0,Math.floor(A.length/2));for(const b of B)b.essaim=true;
    ESSAIM={phase:'rassemble',t:0,x:x+4,y,z:p.z,B};jlog('🐝','Trop d\'abeilles : un essaim se forme !');say('🐝 Un essaim se forme : la moitié des abeilles se rassemble en grappe.');return}
  const E=ESSAIM;E.t+=dt;E.B=E.B.filter(b=>!b.dead);if(!E.B.length){ESSAIM=null;return}
  if(E.phase==='rassemble'&&E.t>12){E.phase='grappe';E.t=0}
  else if(E.phase==='grappe'&&E.t>20){E.phase='depart';E.t=0;E.dir=E.x<WW/2?-1:1;jlog('🐝','L\'essaim s\'envole fonder une nouvelle colonie');if(typeof decouvre==='function')decouvre('essaim')}
  else if(E.phase==='depart'&&E.t>7){for(const b of E.B)b.dead=true;creatures=creatures.filter(c=>!c.dead);say(`🐝 L'essaim est parti (${E.B.length} abeilles) : la colonie a fait des petits ailleurs !`);ESSAIM=null}}
{const ua=UPD.abeille;UPD.abeille=function(c,dt){const E=ESSAIM;if(!c.essaim||!E){c.essaim=false;ua(c,dt);return}c.fly=true;
  if(E.phase==='depart'){c.x+=E.dir*45*dt+rnd(-6,6)*dt;c.y-=12*dt;c.v=40;c.x=clamp(c.x,-30,WW+30);return}
  const a=(c.phase*13+simT*(E.phase==='grappe'?0.6:2))%TAU,r=E.phase==='grappe'?2+((c.phase*7)%1)*2.5:6;
  flyTo(c,E.x+Math.cos(a)*r,E.y+Math.sin(a)*r*0.8+(E.phase==='grappe'?2:0),dt,E.phase==='grappe'?0.4:1);c.z+=(E.z-(c.z||0))*Math.min(1,dt*2)}}
{const sl=startLevel;startLevel=function(i){ESSAIM=null;essT=40;sl(i)}}
{const ev=enterViv;enterViv=function(v){ESSAIM=null;essT=40;ev(v)}}
{const m0=mission;mission=function(c){if(c&&c.essaim&&ESSAIM)return ESSAIM.phase==='depart'?'🐝 S\'envole avec l\'essaim':'🐝 Fait partie d\'un essaim en grappe';return m0(c)}}

{const up=update;update=function(dt){up(dt);if(state==='menu')return;maladiesPlantes(dt);jardinAtta(dt);essaimTick(dt)}}
if(typeof DECOUV!=='undefined')DECOUV.push({k:'essaim',ic:'🐝',nom:'Un essaim',txt:"Voir un essaim d'abeilles partir fonder une colonie."},{k:'virus',ic:'🦠',nom:'Un virus des plantes',txt:"Voir des pucerons transmettre un virus.",re:/virus/},{k:'atta',ic:'🍃',nom:'Des fourmis jardinières',txt:"Voir une fourmi champignonniste découper une feuille.",re:/découpe un morceau/});
if(window.__sim)window.__sim.jardin2=()=>({virus:plants.filter(p=>p.virus).length,taches:plants.filter(p=>p.taches).length,essaim:ESSAIM?ESSAIM.phase+':'+ESSAIM.B.length:'',feuilles:creatures.filter(c=>c.feuille).length,jardin:colonies.map(c=>(c.jardin||0).toFixed(1)).join(' ')});

// ================= GRANDS BACS, ÉTAGES, FOND D'ÉCRAN VIVANT, TABLETTE (idées 12, 13, 14, 20) =================

// ---------- 12. un très grand bac : le « mur vivant » ----------
FORMATS.mural={nom:'Mur vivant',ic:'▀',w:1200,h:600,d:400,txt:'120 × 60 × 40 cm · immense, plutôt pour ordinateur ou tablette'};

// ---------- 13. un bac à étages : terrasse, souche, mare, plantes grimpantes ----------
PLANTS.lierre={nom:'Lierre grimpant',ic:'🍃',h:[70,130],flower:false,txt:"Grimpe le long de la vitre du fond : un escalier de feuilles pour les bêtes, de l'ombre en bas."};
// dessin du lierre : une tige qui serpente vers le haut et de petites feuilles en cœur
function lierreOrga(p){const i=p.col,x=i*CS+CS/2,yb=Y0+(p.base+1)*CS,H=p.h*CS,vig=clamp(p.e/3,0.25,1),dry=p.wet<0.15,hue=dry?45:118;
  racines(x,yb,p);const n=Math.max(8,Math.round(H/3));ctx.strokeStyle=hsl(30,35,30);ctx.lineWidth=0.7;ctx.beginPath();
  const P=t=>[x+Math.sin(t*9+p.id)*2.4*(0.4+t)+(p.bx||0)*t*t,yb-t*H];for(let q=0;q<=n;q++){const [px,py]=P(q/n);q?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke();
  for(let q=2;q<n;q+=2){const t=q/n,[px,py]=P(t),sd=q%4?1:-1,L=3.4+vig*1.6,a=sd>0?-0.4:Math.PI+0.4,c=Math.cos(a),s=Math.sin(a);
    const fill=hsl(hue+(rh(p,q)-0.5)*16,50,16+vig*12,0.92),line=hsl(hue+8,60,36+vig*18);
    ctx.beginPath();const tx=px+c*L,ty=py+s*L;ctx.moveTo(px,py);ctx.bezierCurveTo(px+c*L*0.2-s*L*0.7,py+s*L*0.2+c*L*0.7,tx-s*L*0.5,ty+c*L*0.5,tx,ty);ctx.bezierCurveTo(tx+s*L*0.5,ty-c*L*0.5,px+c*L*0.2+s*L*0.7,py+s*L*0.2-c*L*0.7,px,py);
    ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=0.3;ctx.stroke()}}
{const dp=drawPlant;drawPlant=function(p){if(p.kind==='lierre'&&VEG!=='actuel'){lierreOrga(p);return}dp(p)}}
{const dk=drawPlantKind;drawPlantKind=function(p){if(p.kind==='lierre'){lierreOrga(p);return}dk(p)}}
{const dt0=drawPlantTop;drawPlantTop=function(g,p){if(p.kind!=='lierre'){dt0(g,p);return}const x=p.col*CS+CS/2,y=-zOfPlant(p);g.fillStyle=hsl(118,45,22,0.9);for(let q=0;q<7;q++){const a=q*0.9+p.id;g.beginPath();g.arc(x+Math.cos(a)*3,y+Math.sin(a)*2,1.6,0,TAU);g.fill()}}}
// le modèle « Paludarium à étages »
MODELES.etages={ic:'🏞',nom:'À étages',soil:'foret',climat:'tropical',plantes:['lierre','fougere','fleur','lierre','dionee','fougere'],decos:['tronc','pierre','mare'],betes:{cloporte:3,lombric:2,grenouille:1,tetard:4,gerris:2,perce:2,gendarme:3,libellule:1},litiere:4,etages:true};
{const rm=remplirModele;remplirModele=function(M){if(M.etages){// deux terrasses à gauche : le sol monte en marches douces
    const marche=(i0,i1,h)=>{for(let i=Math.max(0,i0);i<Math.min(COLS,i1);i++){const f=clamp(Math.min(i-i0,i1-i)/6,0,1),top=SURF[i]-Math.round(h*f);for(let j=Math.max(4,top);j<SURF[i];j++){const k=K(i,j);T[k]=1;NUT[k]=0.5;WET[k]=0.45}surfCol(i)}};
    marche(0,Math.round(COLS*0.32),12);marche(0,Math.round(COLS*0.16),10);soilDirty=true}rm(M)}}

// ---------- 14. fond d'écran vivant (et 12 : plein écran) ----------
// « 🎬 Visite » : plein écran, sans interface ; la caméra va d'une bête à l'autre toute seule.
// Lien direct : …/vivariom/?fond=1 ouvre le premier vivarium de la salle dans ce mode (pratique en fond d'écran).
let VISITE=null;
function visite(on){if(on){VISITE={t:0,cible:null};observer(true);try{if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}toast('🎬 Visite guidée · touche ✕ en haut à droite pour sortir')}
  else{VISITE=null;if(typeof FOLLOW!=='undefined'){FOLLOW=null}camFit()}}
{const ob=observer;observer=function(on){ob(on);if(!on&&VISITE){VISITE=null;FOLLOW=null;camFit();try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}}}}
function visiteTick(dt){const V=VISITE;if(!V||state!=='play'||view!=='side')return;V.t-=dt;
  if(V.t<=0||!FOLLOW||FOLLOW.dead){const L=creatures.filter(c=>!c.dead&&realLen(c)>4);
    if(Math.random()<0.25||!L.length){FOLLOW=null;camFit();V.t=8}else{FOLLOW=L[Math.floor(Math.random()*L.length)];camZ=Math.min(18,fitZ*rnd(2.5,4));V.t=rnd(10,16)}}}
{const up=update;update=function(dt){up(dt);visiteTick(dt)}}
$('vnav').insertAdjacentHTML('beforeend','<button id="vnvis" title="Visite guidée en plein écran">🎬</button>');
$('vnvis').onclick=()=>visite(true);
// ouverture directe en fond d'écran
if(/[?&]fond=1/.test(location.search))document.body.classList.add('fond');
if(/[?&]fond=1/.test(location.search))setTimeout(()=>{try{const v=ROOM.list[0];if(v){enterViv(v)}else{addViv();const w=ROOM.list[ROOM.list.length-1];if(w){w.modele='foret';enterViv(w)}}
  state='play';paused=false;last=performance.now();$('rsheet').classList.remove('open');$('rdim').style.display='none';setTimeout(()=>visite(true),400)}catch(e){}},600);

// ---------- 20. tablette : le bac et la fiche côte à côte ----------
// Sur un grand écran tactile (ou si l'option est choisie), un panneau à droite montre en permanence
// la fiche de la bête choisie (ce qu'elle fait, ce qu'elle mange, qui la mange) ou, sinon, l'état du bac.
if(OPT.cote===undefined)OPT.cote='auto';
const coteOn=()=>OPT.cote==='oui'||(OPT.cote==='auto'&&window.innerWidth>=900&&window.innerHeight>=600&&matchMedia('(pointer:coarse)').matches);
document.body.insertAdjacentHTML('beforeend','<aside id="cote"></aside>');
let coteDer='';
function coteMaj(){const A=$('cote'),on=coteOn()&&state==='play'&&!document.body.classList.contains('obs');if(on!==coteEtat){coteEtat=on;resize()}document.body.classList.toggle('cotew',on);if(!on){A.style.display='none';return}A.style.display='block';
  const c=(typeof FOLLOW!=='undefined'&&FOLLOW&&!FOLLOW.dead)?FOLLOW:(selC&&!selC.dead?selC:null);let h='';
  if(c){const id=c.sp.id==='reine'?'fourmi':c.sp.id,F=FICHES[id]||{},P=(typeof PLUS!=='undefined'&&PLUS[id])||{},R=REL[id];const t=tailleTxt?tailleTxt(id):'';
    h=`<h2>${F.ic||''} ${c.sp.vnom||F.nom||''}</h2><p class="cmis">${mission(c)}</p><span class="badge">${F.role||''}</span>${t?` <span class="badge">📏 ${t}</span>`:''}
     <p><u>Mange</u> ${F.mange||''}</p><p><u>Mangé par</u> ${F.par||''}</p><p><u>Besoins</u> ${F.besoin||''}</p>${P.anec?`<p class="anec">💡 ${P.anec}</p>`:''}
     <p class="dim">Énergie ${Math.round(c.energy)} · âge ${Math.round(c.age)} s${c.bebe?' · jeune':c.vieux?' · âgée':''}${c.malade?' · 🍄 malade':''}</p>`}
  else{const n=counts();h=`<h2>${lvl.sandbox?'🏠 '+lvl.nom:'Niv. '+(lvlIdx+1)+' · '+lvl.nom}</h2><p class="dim">Touche une bête (main ✋) ou garde le doigt dessus pour voir sa fiche ici.</p>
     <div class="cpop">${Object.keys(n).filter(id=>n[id]>0&&FICHES[id]).map(id=>`<span>${FICHES[id].ic} ${n[id]}</span>`).join('')}</div>
     <p>🌡 ${temp().toFixed(1)}° · 💧 sol ${Math.round(surfWet()*100)} %</p>${JOURNAL.slice(-5).reverse().map(e=>`<p class="cj">${e.ic} ${e.txt}</p>`).join('')}`}
  if(h!==coteDer){A.innerHTML=h;coteDer=h}}
setInterval(coteMaj,500);
let CVR_PLUS=0,coteEtat=false;
{const rs=resize;resize=function(){const on=coteOn()&&state==='play'&&!document.body.classList.contains('obs');CVR_PLUS=on?Math.min(340,Math.round(window.innerWidth*0.3)):0;rs();
  document.documentElement.style.setProperty('--cote',CVR_PLUS+'px');
  if(CVR_PLUS){W=window.innerWidth-CVL-CVR-CVR_PLUS;cv.width=W*DPR;cv.style.width=W+'px';soilDirty=true;if(COLS)camFit()}}}
{const oo=openOpts;openOpts=function(){oo();const h=[...document.querySelectorAll('#opts h3')].find(e=>e.textContent==='Affichage');if(!h)return;
  const row=document.createElement('div');row.className='orow';row.innerHTML=`<span>📋 Fiche à côté du bac<br><small class="dim">grand écran, tablette</small></span><span class="oseg">${[['auto','Auto'],['oui','Oui'],['non','Non']].map(([v,l])=>`<button data-cote="${v}" class="${OPT.cote===v?'on':''}">${l}</button>`).join('')}</span>`;
  h.after(row);row.querySelectorAll('button').forEach(b=>b.onclick=()=>{OPT.cote=b.dataset.cote;saveOpt();coteMaj();resize();openOpts()})}}
if(window.__sim){window.__sim.visite=visite;window.__sim.cote=v=>{OPT.cote=v;coteMaj();resize()}}

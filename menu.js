// ================= MENU DE JEU : titre, campagne, bac à sable =================
const $=id=>document.getElementById(id);
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
// progression : niveaux terminés
let STARS=LS.get('biome_stars',{});
let done=new Set(LS.get('biome_done',null)||Array.from({length:Math.max(0,unlocked-1)},(_,i)=>i));
const isOpen=i=>i===0||done.has(i-1);
function markDone(i){done.add(i);LS.set('biome_done',[...done])}
function hideAll(){for(const id of ['title','menu','room','vsheet','opts','brief','end','vnav','vstrip'])$(id).style.display='none'}

// ---------- écran titre ----------
function showTitle(){saveResume();hideAll();state='menu';paused=true;lvl&&lvl.sandbox&&saveCurrent();$('title').style.display='flex';hud()}
$('tcamp').onclick=()=>showMenu();
$('tsand').onclick=()=>showRoom();
$('tfiche').onclick=()=>openFiches();
// ---------- options ----------
function optRow(lab,inner){return `<div class="orow"><span>${lab}</span>${inner}</div>`}
function seg(k,vals){return `<span class="oseg">${vals.map(([v,l])=>`<button data-o="${k}" data-v="${v}" class="${String(OPT[k])===String(v)?'on':''}">${l}</button>`).join('')}</span>`}
let resetArm=false;
function openOpts(){const O=$('opts');
  O.innerHTML=`<div class="box"><div class="mhead"><h1>⚙ Options</h1><button class="back" id="oclose">Fermer</button></div>
   <h3>Son</h3>${optRow('🔊 Son',seg('snd',[[1,'Activé'],[0,'Coupé']]))}${optRow(`🎚 Volume <b>${OPT.vol} %</b>`,`<input type="range" min="0" max="100" step="5" value="${OPT.vol}" id="ovol">`)}
   <h3>Jeu</h3>${optRow('⏩ Vitesse au départ',seg('speed',[[1,'×1'],[3,'×3'],[6,'×6']]))}${optRow('💬 Messages d\'aide',seg('tips',[[true,'Oui'],[false,'Non']]))}${optRow('🏷 Étiquettes des appareils (3/4)',seg('labels',[[true,'Oui'],[false,'Non']]))}
   <h3>Affichage</h3>${optRow('🖥 Qualité graphique',seg('hq',[[true,'Haute'],[false,'Économie']]))}${optRow('⛶ Plein écran',`<button class="back" id="ofull">${document.fullscreenElement?'Quitter':'Activer'}</button>`)}${optRow('🌐 Langue',`<span class="dim">Français</span>`)}
   <h3>Appareil</h3>${optRow('📳 Vibrations',seg('vib',[[true,'Oui'],[false,'Non']]))}
   <h3>Données</h3><button class="btn2" id="olic">📜 Licences et crédits</button><button class="btn2" id="oreset">🗑 Effacer la progression</button>
   <p class="dim" style="margin-top:12px">Vivariom · version de test · progression enregistrée sur cet appareil.</p></div>`;
  O.style.display='flex';
  O.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const k=b.dataset.o,v=b.dataset.v;
    if(k==='snd'){soundOn=v==='1';initAudio();$('snd').firstChild.textContent=soundOn?'🔊':'🔇'}
    else if(k==='speed')OPT.speed=+v;else OPT[k]=v==='true';
    if(k==='hq')resize();saveOpt();openOpts()});
  O.querySelector('[data-o="snd"][data-v="'+(soundOn?1:0)+'"]').classList.add('on');
  $('ovol').oninput=e=>{OPT.vol=+e.target.value;saveOpt();if(master)master.gain.value=0.22*OPT.vol/100;e.target.parentNode.querySelector('b').textContent=OPT.vol+' %'};
  $('ofull').onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}setTimeout(openOpts,300)};
  $('olic').onclick=()=>{$('lic').style.display='flex'};
  $('oreset').onclick=e=>{if(!resetArm){resetArm=true;e.currentTarget.textContent='⚠ Toucher encore pour tout effacer';return}
    done=new Set();LS.set('biome_done',[]);ROOM.list=[];saveRoom();try{for(const k of Object.keys(localStorage))if(k.startsWith('biome_viv_'))localStorage.removeItem(k)}catch(_){}
    VIV.clear();resetArm=false;openOpts()};
  $('oclose').onclick=()=>{O.style.display='none';resetArm=false}}
$('topt').onclick=openOpts;
$('licok').onclick=()=>{$('lic').style.display='none'};

// ---------- campagne ----------
function showMenu(){saveResume();hideAll();state='menu';paused=true;$('menu').style.display='flex';
  const total=LEVELS.length,nd=[...done].filter(i=>i<total).length,ns=Object.values(STARS).reduce((a,b)=>a+b,0);
  let h=`<div class="mhead"><button class="back" id="mback">← Menu</button><h1>Campagne</h1><span class="dim">${nd}/${total} · ⭐ ${ns}/${total*3}</span></div>`;
  const RS=LS.get('biome_resume',null);
  if(RS&&LEVELS[RS.i])h+=`<button class="resume" id="mresume"><span class="rplay">▶</span><span><b>Reprendre : Niveau ${RS.i+1} — ${LEVELS[RS.i].nom} (${fmt(RS.goalT||0)})</b><small>objectif ${fmt(RS.goalT||0)} / ${fmt(LEVELS[RS.i].goal.t)} · partie laissée en cours</small></span></button>`;
  CHAPTERS.forEach((C,ci)=>{
    if(C.soon){h+=`<div class="chap soon"><div class="ch"><span class="ci">${C.ic}</span><div><b>${C.nom}</b><small>En préparation</small></div></div><p>${C.txt}</p></div>`;return}
    const n=C.lv.filter(i=>done.has(i)).length,open=isOpen(C.lv[0]);
    h+=`<div class="chap ${open?'':'lock'}"><div class="ch"><span class="ci">${C.ic}</span><div><b>Chapitre ${ci+1} · ${C.nom}</b><small>${n}/${C.lv.length} terminé${n>1?'s':''}</small></div></div><p>${C.txt}</p><div class="cbar"><i style="width:${n/C.lv.length*100}%"></i></div><div class="lvs">`;
    for(const i of C.lv){const L=LEVELS[i],o=isOpen(i);h+=`<button class="lv ${o?'':'lock'}" data-i="${i}"><b>${i+1}</b><span>${L.nom}</span><small>${L.sp.map(id=>FICHES[id].ic).join('')}<span class="rew ${done.has(i)?'got':''}">🎁 ${REWARDS[i]?REWARDS[i].ic+' '+REWARDS[i].nom:''}</span></small>${done.has(i)?`<em>${'★'.repeat(STARS[i]||1)}${'☆'.repeat(3-(STARS[i]||1))}</em>`:''}</button>`}
    h+='</div></div>'});
  $('menu').innerHTML=`<div class="box wide">${h}</div>`;
  $('mback').onclick=()=>showTitle();
  const mr=$('mresume');if(mr)mr.onclick=resumeLevel;
  $('menu').querySelectorAll('.lv').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(isOpen(i))startLevel(i)});
}
// victoire : enregistre le niveau terminé
const win0=win;win=function(){clearResume();const first=!done.has(lvlIdx);markDone(lvlIdx);unlocked=Math.max(unlocked,lvlIdx+2);win0();
  const left=Object.keys(lvl.stock).reduce((a,k)=>a+(stock[k]||0),0),used=stock0-left,ET=etoiles(used),st=ET.st;STARS[lvlIdx]=Math.max(STARS[lvlIdx]||0,st);LS.set('biome_stars',STARS);
  $('endtxt').innerHTML+=`<div class="stars">${'★'.repeat(st)}<span>${'★'.repeat(3-st)}</span></div><p class="dim" style="text-align:center">${ET.legende}</p>`;
  if(st===3)ach('star3');if(Object.values(STARS).reduce((a,b)=>a+b,0)>=30)ach('stars30');if(LEVELS.every((_,i)=>done.has(i)))ach('camp');jlog('🏆',`Niveau réussi : ${'★'.repeat(st)}`);
  const r=REWARDS[lvlIdx];if(r)$('endtxt').innerHTML+=`<div class="reward"><span>${r.ic}</span><div><b>${first?'Débloqué':'Déjà débloqué'} : ${r.nom}</b><small>${r.txt}${!r.key.startsWith('trophee')?' Disponible dès le niveau suivant.':''}</small></div></div>`}

// ---------- reprendre un niveau de campagne laissé en cours ----------
// un seul emplacement : la dernière partie de campagne quittée en cours de jeu
let TUTO_NOSAVE=false;// vrai pendant « Revoir le tutoriel » : on n'écrase pas la partie en cours
function clearResume(){if(lvl&&lvl.special)return;try{localStorage.removeItem('biome_resume')}catch(e){}}
function saveResume(){if(state!=='play'||!lvl||lvl.sandbox||lvlIdx<0||TUTO_NOSAVE)return;
  try{LS.set('biome_resume',{v:1,i:lvlIdx,S:serialize(),goalT,stock,everSeen,lvlMissed,t:Date.now(),extra:resumeExtra()})}catch(e){}}
function resumeLevel(){const R=LS.get('biome_resume',null);if(!R||!LEVELS[R.i]||!R.S){clearResume();showMenu();return}
  initAudio();startLevel(R.i);$('brief').style.display='none';
  try{restore(R.S)}catch(e){clearResume();say('Sauvegarde illisible : le niveau repart de zéro',true);state='play';paused=false;last=performance.now();return}
  resumeApply(R.extra);goalT=R.goalT||0;stock=Object.assign({},lvl.stock,R.stock||{});everSeen=R.everSeen||{};lvlMissed=!!R.lvlMissed;prevCounts=counts();
  camFit();buildPalette();hud();state='play';paused=false;last=performance.now();
  say(`▶ Partie reprise : ${fmt(goalT)} / ${fmt(lvl.goal.t)}`,true)}
const lose0=lose;lose=function(m){clearResume();lose0(m)};
setInterval(()=>saveResume(),30000);
window.addEventListener('pagehide',()=>saveResume());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveResume()});

// ---------- sauvegarde d'un vivarium ----------
const b64raw=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
// compression par plages (beaucoup d'air, de roche et de zéros) : 'R' + paires (longueur, valeur)
const b64=u8=>{const o=[];for(let i=0;i<u8.length;){const v=u8[i];let n=1;while(n<255&&i+n<u8.length&&u8[i+n]===v)n++;o.push(n,v);i+=n}return 'R'+b64raw(new Uint8Array(o))};
const unb64raw=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const unb64=s=>{if(s[0]!=='R')return unb64raw(s);const p=unb64raw(s.slice(1));let L=0;for(let i=0;i<p.length;i+=2)L+=p[i];const u=new Uint8Array(L);let k=0;for(let i=0;i<p.length;i+=2){u.fill(p[i+1],k,k+p[i]);k+=p[i]}return u};
const q8=f=>{const u=new Uint8Array(f.length);for(let i=0;i<f.length;i++)u[i]=Math.round(clamp(f[i],0,1)*255);return u};
const pick=(o,keys)=>{const r={};for(const k of keys)if(o[k]!==undefined)r[k]=o[k];return r};
function serialize(){
  const ci=c=>c?colonies.indexOf(c):-1;
  return {v:1,fmt:FMT,soil:SOIL0,T:b64(T),DUG:b64(DUG),NUT:b64(q8(NUT)),WET:b64(q8(WET)),simT,dayClock,DEV:JSON.parse(JSON.stringify(DEV)),
    plants:plants.filter(p=>p.alive).map(p=>pick(p,['id','col','z','kind','base','h','maxH','e','age','maxAge','fl','hue','aph','wet','virus','taches'])),
    items:items.filter(it=>!it.dead&&!it.carried).map(it=>Object.assign(pick(it,['type','i','x','y','z','age','val','k','kind','col']),{cs:it.c?(it.c.sp.vid||it.c.sp.id):null,pi:it.p?plants.indexOf(it.p):-1})),
    decos:decos.map(d=>pick(d,['type','i','dz','w','seed','dir','h','moss'])),
    colonies:colonies.map(c=>({wv:c.wsp?c.wsp.vid:null,i:c.i,entr:c.entr,food:c.food,eggs:c.eggs,cells:c.cells,chamber:[...c.chamber],home:c.home,dead:c.dead,jardin:c.jardin||0})),
    journal:JOURNAL.slice(-80),links:null,
    creatures:creatures.filter(c=>!c.dead).map(c=>Object.assign(pick(c,['x','y','z','energy','age','state','fly','home','plan','chamberStart','planIdx','stade','stT','bebe','malade','malT','ailes']),{id:c.sp.vid||c.sp.id,col:ci(c.col)}))}}
function restore(S){
  genWorld(S.fmt||(curViv&&curViv.fmt)||'std',S.soil||(curViv&&curViv.soil));T.set(unb64(S.T));DUG.set(unb64(S.DUG));const n=unb64(S.NUT),w=unb64(S.WET);for(let i=0;i<N;i++){NUT[i]=n[i]/255;WET[i]=w[i]/255}
  for(let i=0;i<COLS;i++)surfCol(i);simT=S.simT||0;dayClock=S.dayClock||0;if(S.DEV)DEV=Object.assign(DEV,S.DEV);
  plants=S.plants.map(p=>Object.assign({alive:true},p));pid=plants.reduce((m,p)=>Math.max(m,p.id+1),0);
  for(const p of plants)for(let r=0;r<p.h;r++){const k=K(p.col,p.base-r);if(k>=0)STEM[k]++}
  for(const d0 of S.decos){const d=Object.assign({},d0);decos.push(d);const half=Math.round(d.w/2);
    if(d.type==='pierre'||d.type==='pot'||d.type==='mousse')for(let q=d.i-half;q<=d.i+half;q++)if(q>=0&&q<COLS)EVF[q]=Math.min(EVF[q],d.type==='mousse'?0.45:0.3)}
  decoSettle();
  colonies=S.colonies.map(c=>Object.assign({},c,{chamber:new Set(c.chamber),queen:null,wsp:c.wv?VSP[c.wv]:null}));
  items=S.items.map(it0=>{const it=Object.assign({},it0);if(it.cs&&spOf(it.cs))it.c=mk(spOf(it.cs),it.x,it.y);if(it.pi>=0)it.p=plants[it.pi];if(it.type==='miellat'&&!it.p)it.dead=true;delete it.cs;delete it.pi;return it}).filter(it=>!it.dead);
  creatures=[];for(const c0 of S.creatures){if(!spOf(c0.id))continue;const c=mk(spOf(c0.id),c0.x,c0.y,{energy:c0.energy,z:c0.z});
    Object.assign(c,pick(c0,['age','fly','home','plan','chamberStart','planIdx','stade','stT','bebe','malade','malT','ailes']));if(c.stade||(baseOf(c0.id)==='puceron'&&c.fly))c.fly=false;c.state=baseOf(c0.id)==='reine'?c0.state:'idle';
    if(c0.col>=0)c.col=colonies[c0.col];if(baseOf(c0.id)==='reine'&&c.col&&c.state!=='found')c.col.queen=c;
    if(!c.fly&&baseOf(c0.id)!=='lombric')c.k=findWalk(c.x,c.y);creatures.push(c)}
  JOURNAL=S.journal||[];soilDirty=true;
}
// crochet de test : format courant et empreinte du monde
if(window.__sim)window.__sim.world=()=>{let h=0;for(let i=0;i<N;i++)h=(h*31+T[i])|0;return {FMT,SOIL0,COLS,ROWS,ZD,WW,WH,hash:h,surf:Array.from(SURF.slice(0,6)),decos:decos.map(d=>d.type+'@'+d.i+'/'+Math.round(d.dz||0)).join(','),plants:plants.filter(p=>p.alive).length,crs:creatures.filter(c=>!c.dead).length,noz:nozzles().length,types:[0,1,2,3,4,5,6].map(t=>{let n=0;for(let i=0;i<N;i++)if(T[i]===t)n++;return n})}};
function thumb(){
  const sv=[view,ensE,ensDir,camZ,camX,camY];view='side';ensE=0;ensDir=0;camFit();draw();
  const [x0,y0]=w2s(0,0),[x1,y1]=w2s(WW,WH),tw=240,th=Math.round(tw*WH/WW),c=document.createElement('canvas');c.width=tw;c.height=th;
  c.getContext('2d').drawImage(cv,x0*DPR,y0*DPR,(x1-x0)*DPR,(y1-y0)*DPR,0,0,tw,th);
  [view,ensE,ensDir,camZ,camX,camY]=sv;let url='';try{url=c.toDataURL('image/jpeg',0.7)}catch(e){}return url}

// ---------- la grande salle ----------
const VIV=new Map();
// racks : nombre d'étagères de la salle (2 au départ, jusqu'à RACK_MAX) ; on en ajoute avec l'emplacement en pointillé
const RACK_MAX=6;
const ROOM={list:LS.get('biome_room',[]),racks:LS.get('biome_racks',2)};
function saveRoom(){LS.set('biome_room',ROOM.list);LS.set('biome_racks',ROOM.racks)}
let curViv=null;
function vivMax(){return G?G.slots.length:13}
function sandboxSpecies(){const s=new Set(['plante']);LEVELS.forEach(L=>L.sp.forEach(id=>s.add(id)));s.add('chenille');if(s.has('tenebrion'))s.add('verfarine');if(s.has('rhinoceros'))s.add('verblanc');return [...s]}
function saveCurrent(){if(!curViv)return;const S=serialize();VIV.set(curViv.id,S);curViv.thumb=thumb();curViv.counts=counts();curViv.wet=surfWet();curViv.temp=temp();curViv.life=simT;
  LS.set('biome_viv_'+curViv.id,S);saveRoom()}
function loadViv(v){if(VIV.has(v.id))return VIV.get(v.id);const S=LS.get('biome_viv_'+v.id,null);if(S)VIV.set(v.id,S);return S}
// emplacements : deux racks d'éleveur et un meuble bas, tous contre le mur
let RW=1180,RH=600,G=null;
function roomGeom(){RH=Math.max(440,window.innerHeight-56);const fy=Math.round(RH*0.72),L=Math.round(Math.min(124,(fy-50)/3.2)),VH=L-26,VW=Math.round(VH*1.3);
  const slots=[],racks=[],nr=clamp(ROOM.racks|0,2,RACK_MAX),rw=VW*2+34;
  for(let ri=1;ri<=nr;ri++){const rx=240+(ri-1)*360;racks.push({x:rx,w:rw,top:fy-3*L-8,bottom:fy+10,levels:[0,1,2].map(k=>fy-6-k*L)});
    for(let k=0;k<3;k++)for(let c=0;c<2;c++)slots.push({id:`r${ri}-${k}-${c}`,x:rx+12+c*(VW+10),y:fy-6-k*L-VH,lab:`Rack ${ri}, étage ${k+1}`})}
  const mx=26,mtop=fy-58;for(let c=0;c<1;c++)slots.push({id:`m-${c}`,x:mx+20+c*(VW+12),y:mtop-VH,lab:'Meuble bas'});
  RW=Math.max(1180,240+nr*360+(nr<RACK_MAX?360:0)+260);
  return {fy,L,VW,VH,slots,racks,meuble:{x:mx,w:VW+40,top:mtop},addRack:nr<RACK_MAX?{x:240+nr*360,w:rw,top:fy-3*L-8,bottom:fy+10}:null}}
const slotOf=(v)=>G.slots.find(s=>s.id===v.slot);
function freeSlot(){const used=new Set(ROOM.list.map(v=>v.slot));return G.slots.find(s=>!used.has(s.id))}
function fixSlots(){G=roomGeom();const used=new Set();for(const v of ROOM.list){if(!v.slot||!G.slots.some(s=>s.id===v.slot)||used.has(v.slot))v.slot=null;if(v.slot)used.add(v.slot)}
  for(const v of ROOM.list)if(!v.slot){const s=G.slots.find(s=>!used.has(s.id));if(s){v.slot=s.id;used.add(s.id)}}saveRoom()}
let roomMode='salle';
function showRoom(){hideAll();state='menu';paused=true;$('room').style.display='block';fixSlots();drawRoom();const sc=$('rscroll');if(!sc.dataset.init){sc.dataset.init=1;sc.scrollLeft=Math.max(0,240+150-W/2)}}
function vivTile(v,cls=''){return `<div class="viv ${cls}" data-id="${v.id}">${v.thumb?`<img src="${v.thumb}">`:'<div class="vempty">vide</div>'}<i class="vlid"></i><span class="vtag">${v.name}</span></div>`}
function alertOf(v){const c=v.counts||{},n=Object.values(c).reduce((a,b)=>a+b,0);if(!v.thumb)return '';if(n===0)return 'vide';if(v.wet!=null&&v.wet<0.18)return '⚠ sol sec';if(v.wet!=null&&v.wet>0.85)return '⚠ trop humide';if(!c.plante)return '⚠ plus de plantes';return ''}
function popTxt(v){return Object.entries(v.counts||{}).filter(([k,n])=>n>0&&FICHES[k]).map(([k,n])=>`${FICHES[k].ic} ${n}`).join(' · ')||'—'}
function drawRoom(){const max=vivMax();
  $('rcount').textContent=`${ROOM.list.length}/${max}`;$('radd').disabled=ROOM.list.length>=max||!freeSlot();$('rmode').textContent=roomMode==='salle'?'☰ Liste':'🏛 Salle';
  $('rscroll').style.display=roomMode==='salle'?'block':'none';$('rlist').style.display=roomMode==='liste'?'block':'none';
  $('rhint').style.display=roomMode==='salle'?'block':'none';
  $('rhint').textContent=ROOM.list.length>=max?(G.addRack?'Toutes les places sont prises : ajoute une étagère (pointillés à droite)':'Toutes les places sont prises : retire un bac pour en créer un autre'):ROOM.list.length?'Touche un bac pour sa fiche · fais-le glisser pour le déplacer (au doigt : maintiens-le d\'abord) · ＋ pour en ajouter un':'Touche un ＋ sur une étagère pour créer ton premier vivarium';
  if(roomMode==='liste'){drawList();return}
  const R=$('roomin');R.style.height=RH+'px';R.style.width=`max(${RW}px,100vw)`;const {fy}=G;
  const SM=STYLE_OPTS.mur[STYLE.mur][1],SS=STYLE_OPTS.sol[STYLE.sol][1],FC=frameCols();document.documentElement.style.setProperty('--frame',FC[1]);
  let h=`<div class="wall" style="height:${fy}px;background:${SM}"></div><div class="floorw" style="top:${fy}px"><div class="floorp" style="background:${SS}"></div></div><div class="plinth" style="top:${fy-4}px"></div>
   <div class="win" style="left:40px;top:${fy*0.08}px;height:${fy*0.34}px"></div><div class="win" style="left:${RW-230}px;top:${fy*0.08}px;height:${fy*0.34}px"></div>
   <div class="meuble" style="left:${G.meuble.x}px;width:${G.meuble.w}px;top:${G.meuble.top}px;height:${fy+8-G.meuble.top}px"></div>`;
  for(const r of G.racks){h+=`<div class="rshadow" style="left:${r.x-6}px;width:${r.w+12}px;top:${r.top}px;height:${r.bottom-r.top}px"></div><div class="rpost" style="left:${r.x}px;top:${r.top}px;height:${r.bottom-r.top}px"></div><div class="rpost" style="left:${r.x+r.w-8}px;top:${r.top}px;height:${r.bottom-r.top}px"></div>`;
    for(const y of r.levels)h+=`<div class="rlvl" style="left:${r.x-4}px;width:${r.w+8}px;top:${y}px"></div>`}
  const used=new Set(ROOM.list.map(v=>v.slot));
  for(const s of G.slots)if(!used.has(s.id))h+=`<button class="slotfree" data-slot="${s.id}" title="Nouveau vivarium ici" style="left:${s.x}px;top:${s.y}px;width:${G.VW}px;height:${G.VH}px">＋</button>`;
  const A=G.addRack;if(A)h+=`<button class="raddr" title="Ajouter une étagère" style="left:${A.x}px;width:${A.w}px;top:${A.top}px;height:${A.bottom-A.top}px">＋<small>Étagère</small></button>`;
  const lr=G.racks[G.racks.length-1],nr=G.racks.length;if(nr>2&&!G.slots.some(s=>s.id.startsWith(`r${nr}-`)&&used.has(s.id)))h+=`<button class="rdel" title="Retirer cette étagère vide" style="left:${lr.x+lr.w-14}px;top:${lr.top-14}px">✕</button>`;
  h+=`<div class="potp" style="left:${RW-140}px;top:${fy-50}px">🪴</div><div class="potp" style="left:${RW-250}px;top:${fy-46}px;font-size:44px">🪴</div>`;
  for(const v of ROOM.list){const s=slotOf(v);if(!s)continue;const B=fmtBox(v);h+=`<div class="rv" data-id="${v.id}" style="left:${s.x+B.dx}px;top:${s.y+B.dy}px;width:${B.w}px;height:${B.h}px">${vivTile(v,sheetIdx>=0&&ROOM.list[sheetIdx]===v?'sel':'')}</div>`}
  R.innerHTML=h;R.querySelectorAll('.rv').forEach(el=>roomDrag(el));
  R.querySelectorAll('.slotfree').forEach(b=>b.onclick=()=>addViv(b.dataset.slot));
  const ra=R.querySelector('.raddr');if(ra)ra.onclick=()=>{ROOM.racks=G.racks.length+1;saveRoom();fixSlots();drawRoom();const sc=$('rscroll');sc.scrollTo({left:Math.max(0,G.racks[G.racks.length-1].x+150-sc.clientWidth/2),behavior:'smooth'})};
  const rd=R.querySelector('.rdel');if(rd)rd.onclick=()=>{ROOM.racks=G.racks.length-1;saveRoom();fixSlots();drawRoom()}}
function drawList(){const max=vivMax();let h='<div class="lgrid">';
  for(const v of ROOM.list){const al=alertOf(v);h+=`<div class="lcard" data-id="${v.id}">${vivTile(v)}<div class="nm">${v.name}</div><div class="st ${al?'warn':''}">${al||popTxt(v)}</div></div>`}
  if(ROOM.list.length<max)h+=`<div class="lcard add" id="ladd"><div class="addb">＋ Nouveau</div></div>`;
  $('rlist').innerHTML=h+'</div>';
  $('rlist').querySelectorAll('.lcard[data-id]').forEach(c=>c.onclick=()=>enterViv(ROOM.list.find(v=>v.id===c.dataset.id)));
  const la=$('ladd');if(la)la.onclick=addViv}
// toucher = fiche ; maintenir = déplacer vers un autre emplacement
function nearSlot(el){const cx=parseFloat(el.style.left)+G.VW/2,cy=parseFloat(el.style.top)+G.VH/2;let best=null,bd=1e9;
  for(const s of G.slots){const d=Math.hypot(s.x+G.VW/2-cx,s.y+G.VH/2-cy);if(d<bd){bd=d;best=s}}return best}
function roomDrag(el){const v=ROOM.list.find(o=>o.id===el.dataset.id);let st=null,tm=null,tgt=null;const sc=$('rscroll');
  const begin=id=>{st.drag=true;el.classList.add('drag');try{el.setPointerCapture(id)}catch(_){}tgt=document.createElement('div');tgt.className='rtgt';tgt.style.width=G.VW+'px';tgt.style.height=G.VH+'px';$('roomin').appendChild(tgt);mark()};
  const mark=()=>{const s=nearSlot(el);if(s&&tgt){tgt.style.left=s.x+'px';tgt.style.top=s.y+'px'}};
  el.addEventListener('pointerdown',e=>{const mouse=e.pointerType==='mouse';if(mouse){if(e.button!==0)return;e.preventDefault()}
    st={x:e.clientX,y:e.clientY,l:parseFloat(el.style.left),t:parseFloat(el.style.top),s0:sc.scrollLeft,drag:false,moved:false,mouse,id:e.pointerId};
    if(!mouse)tm=setTimeout(()=>{if(st&&!st.moved){begin(st.id);if(OPT.vib&&navigator.vibrate)navigator.vibrate(15)}},380)});
  el.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
    if(!st.drag){if(Math.hypot(dx,dy)>8){if(st.mouse)begin(e.pointerId);else{st.moved=true;clearTimeout(tm);return}}else return}
    const r=sc.getBoundingClientRect();if(e.clientX<r.left+50)sc.scrollLeft-=14;else if(e.clientX>r.right-50)sc.scrollLeft+=14;
    el.style.left=(st.l+dx+sc.scrollLeft-st.s0)+'px';el.style.top=(st.t+dy)+'px';mark()});
  const up=e=>{clearTimeout(tm);if(!st)return;const S=st;st=null;el.classList.remove('drag');if(tgt){tgt.remove();tgt=null}
    if(S.drag){const best=nearSlot(el);
      if(best){const other=ROOM.list.find(o=>o.slot===best.id&&o!==v);if(other)other.slot=v.slot;v.slot=best.id;saveRoom()}drawRoom();return}
    if(!S.moved)openSheet(ROOM.list.indexOf(v))};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>{clearTimeout(tm);st=null;el.classList.remove('drag');if(tgt){tgt.remove();tgt=null}drawRoom()})}
// vignette proportionnée au format, posée sur l'étagère (le Standard remplit l'emplacement)
function fmtBox(v){const F=FORMATS[v.fmt]||FORMATS.std;if(F===FORMATS.std)return {w:G.VW,h:G.VH,dx:0,dy:0};
  const s=Math.min(G.VW/F.w,G.VH/F.h),w=Math.round(F.w*s),h=Math.round(F.h*s);return {w,h,dx:Math.round((G.VW-w)/2),dy:G.VH-h}}
function addViv(slot){if(ROOM.list.length>=vivMax())return;fixSlots();const used=new Set(ROOM.list.map(v=>v.slot));const s=(slot&&!used.has(slot)&&G.slots.find(o=>o.id===slot))||freeSlot();if(!s)return;const id='v'+Date.now().toString(36);
  ROOM.list.push({id,name:'Vivarium '+(ROOM.list.length+1),slot:s.id,fmt:'std',soil:'foret',fresh:true});saveRoom();drawRoom();openSheet(ROOM.list.length-1)}
$('rback').onclick=()=>showTitle();
$('radd').onclick=()=>addViv();
$('rstyle').onclick=()=>openStyle();
$('rmode').onclick=()=>{roomMode=roomMode==='salle'?'liste':'salle';closeSheet();drawRoom()};
// ---------- la fiche en carrousel ----------
let sheetIdx=-1,delArm=false;
function openSheet(i){sheetIdx=i;delArm=false;$('rsheet').classList.add('open');$('rdim').style.display='block';fillSheet();drawRoom()}
function closeSheet(){sheetIdx=-1;$('rsheet').classList.remove('open');$('rdim').style.display='none';if($('room').style.display!=='none')drawRoom()}
function fillSheet(){const L=ROOM.list,v=L[sheetIdx];if(!v){closeSheet();return}const s=slotOf(v),nsp=Object.keys(v.counts||{}).filter(k=>v.counts[k]>0).length;
  const prev=L[sheetIdx-1],next=L[sheetIdx+1];
  $('rsheet').innerHTML=`<div class="grab"></div><button class="sclose">✕</button><div class="car">${prev?`<div class="cgh l">${vivTile(prev)}</div>`:''}${next?`<div class="cgh r">${vivTile(next)}</div>`:''}<div class="cbig">${vivTile(v)}</div></div>
   <div class="cdots">${L.map((o,i)=>`<i class="${i===sheetIdx?'on':''}"></i>`).join('')}</div>
   <div class="cinfo"><div class="cname"><input id="sname" value="${v.name.replace(/"/g,'&quot;')}" maxlength="24"><span class="tag">${s?s.lab:''}</span></div>
   <div class="tag">Diversité · ${nsp} espèce${nsp>1?'s':''}</div><div class="bar2"><i style="width:${Math.min(100,nsp*14)}%;background:#8bff6a"></i></div>
   <div class="tag">Humidité du sol · ${v.wet!=null?Math.round(v.wet*100)+' %':'—'}${v.temp!=null?` · 🌡 ${v.temp.toFixed(1)} °C`:''}</div><div class="bar2"><i style="width:${v.wet!=null?v.wet*100:0}%;background:#4ab0ff"></i></div>
   <div class="tag">${popTxt(v)}${alertOf(v)?` · <span class="warnt">${alertOf(v)}</span>`:''}</div>
   ${v.fresh?fmtChooser(v):`<div class="tag">${(FORMATS[v.fmt]||FORMATS.std).ic} ${(FORMATS[v.fmt]||FORMATS.std).nom} · ${(FORMATS[v.fmt]||FORMATS.std).txt.split(' · ')[0]}${v.soil&&v.soil!=='foret'?` · ${SOILS[v.soil].ic} ${SOILS[v.soil].nom}`:''}</div>`}
   <div class="cbtns"><button class="btn cin">Entrer</button><button class="btn2 cdel">🗑</button></div></div>`;
  const sh=$('rsheet');sh.querySelectorAll('[data-fmt]').forEach(b=>b.onclick=()=>{v.fmt=b.dataset.fmt;saveRoom();fillSheet();drawRoom()});
  sh.querySelectorAll('[data-soil]').forEach(b=>b.onclick=()=>{v.soil=b.dataset.soil;saveRoom();fillSheet()});
  sh.querySelector('.sclose').onclick=closeSheet;sh.querySelector('.cin').onclick=()=>{const nv=$('sname').value.replace(/[<>&"'`]/g,'').trim().slice(0,24);if(nv)v.name=nv;saveRoom();closeSheet();enterViv(v)};
  $('sname').onchange=()=>{const nv=$('sname').value.replace(/[<>&"'`]/g,'').trim().slice(0,24);if(nv){v.name=nv;saveRoom();drawRoom()}};
  sh.querySelector('.cdel').onclick=e=>{if(!delArm){delArm=true;e.currentTarget.textContent='⚠ Confirmer';return}
    ROOM.list.splice(sheetIdx,1);VIV.delete(v.id);try{localStorage.removeItem('biome_viv_'+v.id)}catch(_){}saveRoom();closeSheet();drawRoom()};
  const gl=sh.querySelector('.cgh.l'),gr=sh.querySelector('.cgh.r');if(gl)gl.onclick=()=>{sheetIdx--;delArm=false;fillSheet();drawRoom()};if(gr)gr.onclick=()=>{sheetIdx++;delArm=false;fillSheet();drawRoom()};
  carFit(sh.querySelector('.cbig'),v,180,138);carFit(gl,prev,120,92);carFit(gr,next,120,92)}
// carrousel : chaque vignette prend la forme de son format, avec la même règle que dans la salle (fmtBox) :
// le Standard remplit la case, les autres y tiennent en gardant leurs proportions, posés en bas
function carFit(box,v,BW,BH){if(!box||!v)return;const t=box.querySelector('.viv');if(!t)return;const F=FORMATS[v.fmt]||FORMATS.std;let w=BW,h=BH;
  if(F!==FORMATS.std){const s=Math.min(BW/F.w,BH/F.h);w=Math.round(F.w*s);h=Math.round(F.h*s)}
  box.style.width=BW+'px';box.style.height=BH+'px';Object.assign(t.style,{position:'absolute',width:w+'px',height:h+'px',left:Math.round((BW-w)/2)+'px',top:(BH-h)+'px'})}
// choix du format et du sol de départ, tant que le bac n'a jamais été ouvert
function fmtChooser(v){const bt=(k,val,on,ic,nom,txt)=>`<button data-${k}="${val}" style="flex:1 1 ${k==='soil'?'28':'45'}%;min-width:0;text-align:left;padding:6px 8px;border-radius:9px;border:1px solid ${on?'#ffe94d':'#333'};background:${on?'#2a2608':'#111'};color:${on?'#ffe94d':'#bbb'};font:600 12px -apple-system,Roboto,sans-serif"><span style="font-size:15px">${ic}</span> ${nom}<br><small style="font-weight:400;color:#999">${txt}</small></button>`;
  return `<div class="tag" style="margin-top:6px">Format du bac</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin:3px 0 6px">${Object.entries(FORMATS).map(([k,F])=>bt('fmt',k,(v.fmt||'std')===k,F.ic,F.nom,F.txt.split(' · ')[0])).join('')}</div>
   <div class="tag">Sol de départ</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin:3px 0 6px">${Object.entries(SOILS).map(([k,S])=>bt('soil',k,(v.soil||'foret')===k,S.ic,S.nom,S.txt)).join('')}</div>
   <div class="tag dim">${(FORMATS[v.fmt]||FORMATS.std).txt}. Le format ne pourra plus changer ensuite.</div>`}
// glisser la fiche : gauche/droite = bac voisin, vers le bas = fermer
(()=>{const sh=$('rsheet');let s0=null;sh.addEventListener('pointerdown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;s0={x:e.clientX,y:e.clientY}});
  sh.addEventListener('pointerup',e=>{if(!s0)return;const dx=e.clientX-s0.x,dy=e.clientY-s0.y;s0=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){const n=sheetIdx+(dx<0?1:-1);if(n>=0&&n<ROOM.list.length){sheetIdx=n;delArm=false;fillSheet();drawRoom()}}
    else if(dy>60&&sh.scrollTop<=0)closeSheet()})})();
$('rdim').onclick=closeSheet;
// ---------- jouer dans un vivarium du bac à sable ----------
function enterViv(v){
  hideAll();curViv=v;const sp=sandboxSpecies();
  lvl={nom:v.name,sandbox:true,txt:'',sp,stock:{compost:1},start:{},goal:{alive:[],t:1},evap:1,cap:30};lvlIdx=-1;
  view='side';anim=null;prox.clear();ripples=[];selC=null;pendingView=null;topFromEns=false;
  stock={};for(const k of [...allBeasts(sp),'compost',...Object.keys(DECOS),...Object.keys(PLANTS).map(k=>'plante:'+k)])stock[k]=99;goalT=0;everSeen={};
  creatures=[];items=[];plants=[];colonies=[];strands=[];waves=[];phero=[];drops=[];clouds=[];newborns=[];
  resetDev();dayClock=0;
  const S=loadViv(v);
  if(S)restore(S);else{genWorld(v.fmt,v.soil);const np=Math.max(2,Math.round(4*COLS/200));for(let q=0;q<np;q++){const p=newPlant(Math.round((q+0.5)/np*COLS),true);if(p){p.h=Math.max(1,Math.min(Math.floor(rnd(14,p.maxH*0.7)),p.base-4));for(let r=1;r<p.h;r++)STEM[K(p.col,p.base-r)]++}}}
  if(v.fresh){delete v.fresh;saveRoom()}
  camFit();ensE=0;ensDir=0;openDev(null);
  tool=null;buildPalette();syncViewSw();
  $('blv').innerHTML='🏛 Salle<small>vivariums</small>';$('vnav').style.display='flex';$('vstrip').style.display='none';$('brestart').innerHTML='↺ Vider<small>vivarium</small>';
  state='play';paused=false;last=performance.now();say(`${v.name} : bac à sable, réserves illimitées. Rien ne presse.`)}
let clearArm=0;
const blv0=$('blv').onclick,brs0=$('brestart').onclick;
$('blv').onclick=()=>{if(lvl&&lvl.sandbox){goRoom();return}showMenu()};
function goRoom(){saveCurrent();curViv=null;$('vnav').style.display='none';$('vstrip').style.display='none';showRoom()}
$('vnsalle').onclick=goRoom;
$('vnbacs').onclick=()=>{const st=$('vstrip');if(st.style.display==='flex'){st.style.display='none';return}saveCurrent();
  st.innerHTML=ROOM.list.map(v=>`<div class="sv ${v===curViv?'on':''}" data-id="${v.id}">${vivTile(v)}</div>`).join('')+'<span class="tag">glisse →</span>';st.style.display='flex';
  st.querySelectorAll('.sv').forEach(el=>el.onclick=()=>{const v=ROOM.list.find(o=>o.id===el.dataset.id);st.style.display='none';if(v&&v!==curViv){saveCurrent();enterViv(v)}})};
$('brestart').onclick=()=>{if(lvl&&lvl.sandbox){const now=performance.now()/1000;if(now-clearArm>4||!clearArm){clearArm=now;say('Toucher encore « Vider » pour tout effacer dans ce vivarium');return}
    clearArm=0;VIV.delete(curViv.id);try{localStorage.removeItem('biome_viv_'+curViv.id)}catch(_){}enterViv(curViv);return}startLevel(lvlIdx)};
// « Rejouer » (barre du bas et écran de fin) : la sauvegarde en cours est effacée
for(const id of ['brestart','bretry']){const f=$(id).onclick;$(id).onclick=function(e){if(!(lvl&&lvl.sandbox))clearResume();return f.call(this,e)}}
// sauvegarde automatique toutes les 30 s et en quittant la page
setInterval(()=>{if(lvl&&lvl.sandbox&&state==='play'&&curViv)try{saveCurrent()}catch(e){}},30000);
window.addEventListener('pagehide',()=>{if(lvl&&lvl.sandbox&&curViv)try{saveCurrent()}catch(e){}});

// ---------- petites bêtes qui se baladent sur l'écran d'accueil ----------
const tcv=document.createElement('canvas');tcv.id='tcv';$('title').prepend(tcv);
let TB=[],tRun=false,tLast=0;const TK=2.4;
function titleBugs(){TB=[];const Wm=W/TK,Hm=H/TK;
  for(const id of ['fourmi','fourmi','fourmi','fourmi','coccinelle','cloporte','araignee','abeille','puceron','puceron','mouche','lombric']){
    const c=mk(id,rnd(0,Wm),rnd(0,Hm),{ang:rnd(0,TAU)});c.mute=true;c.fly=id==='abeille'||id==='mouche';c.tx=rnd(0,Wm);c.ty=rnd(0,Hm);c.rest=0;TB.push(c)}
  // les fourmis se suivent en file
  const ants=TB.filter(c=>c.sp.id==='fourmi');for(let i=1;i<ants.length;i++){ants[i].lead=ants[i-1];ants[i].x=ants[0].x-i*4;ants[i].y=ants[0].y}}
function titleLoop(t){if($('title').style.display==='none'){tRun=false;return}
  const dt=Math.min(0.05,(t-tLast)/1000||0.016);tLast=t;
  if(tcv.width!==Math.round(W*DPR)||tcv.height!==Math.round(H*DPR)){tcv.width=W*DPR;tcv.height=H*DPR;tcv.style.width=W+'px';tcv.style.height=H+'px'}
  const g=tcv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,tcv.width,tcv.height);
  const Wm=W/TK,Hm=H/TK,keep=ctx;ctx=g;
  for(const c of TB){
    let tx=c.tx,ty=c.ty;if(c.lead){const L=c.lead,b=L.ang+Math.PI;tx=L.x+Math.cos(b)*5;ty=L.y+Math.sin(b)*5}
    const d=Math.hypot(tx-c.x,ty-c.y);
    if(!c.lead&&d<4){if(c.rest<=0&&Math.random()<0.5)c.rest=rnd(0.5,2.5);c.tx=clamp(c.x+rnd(-60,60),5,Wm-5);c.ty=clamp(c.y+rnd(-60,60),5,Hm-5)}
    let sp=(c.fly?(c.sp.fspd||c.sp.spd)*0.5:c.sp.spd*0.6);if(c.rest>0){c.rest-=dt;sp=0}if(c.lead)sp=Math.min(c.sp.spd*0.9,d*2);
    const a=Math.atan2(ty-c.y,tx-c.x);c.ang+=clamp(angDiff(c.ang,a),-4*dt,4*dt);
    c.x+=Math.cos(c.ang)*sp*dt;c.y+=Math.sin(c.ang)*sp*dt;c.v=sp;
    c.phase+=dt*c.sp.hz;c.beatT+=dt;if(c.phase>=1){c.phase-=1;c.beatT=0;c.beats++}c.age+=dt;
    moveBody(c,dt);
    g.save();g.setTransform(DPR*TK*c.sp.sf,0,0,DPR*TK*c.sp.sf,0,0);drawCreature(c,0.85,false);g.restore()}
  ctx=keep;requestAnimationFrame(titleLoop)}
const showTitle0=showTitle;showTitle=function(){showTitle0();if(!TB.length)titleBugs();if(!tRun){tRun=true;tLast=performance.now();requestAnimationFrame(titleLoop)}};
showTitle();

// ---------- aménager la salle : mur, sol, cadres ----------
function openStyle(){const S=$('stylep');const row=(k,lab)=>`<div class="srow"><span>${lab}</span><div class="sw">${Object.entries(STYLE_OPTS[k]).map(([v,o])=>`<button data-k="${k}" data-v="${v}" class="${STYLE[k]===v?'on':''}"><i style="background:${k==='cadre'?`linear-gradient(90deg,${o[1][0]},${o[1][1]},${o[1][2]})`:o[1]}"></i>${o[0]}</button>`).join('')}</div></div>`;
  S.innerHTML=`<div class="box"><h1>🎨 Aménager la salle</h1>${row('mur','Mur')}${row('sol','Sol')}${row('cadre','Cadres des vivariums')}<button class="btn" id="stok">Fermer</button></div>`;S.style.display='flex';
  S.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{STYLE[b.dataset.k]=b.dataset.v;try{localStorage.setItem('biome_style',JSON.stringify(STYLE))}catch(e){}openStyle();drawRoom()});
  $('stok').onclick=()=>{S.style.display='none'}}

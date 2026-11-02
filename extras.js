// ================= JOURNAL, SUCCÈS, COUVEUSE, TUBES =================
const fmtT=t=>{t=Math.max(0,Math.floor(t));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
// ---------- barre d'outils à gauche (journal partout ; salle, bacs, couveuse en bac à sable) ----------
function showVnav(sandbox){$('vnav').style.display='flex';for(const id of ['vnsalle','vnbacs','vncouve'])$(id).style.display=sandbox?'':'none'}
const startLevel0=startLevel;startLevel=function(i){startLevel0(i);showVnav(false)};
const enterViv0=enterViv;enterViv=function(v){enterViv0(v);showVnav(true);arriveTransit(v)};
// ---------- journal ----------
$('vnjournal').onclick=()=>{const J=$('journal');if(J.style.display==='flex'){J.style.display='none';return}
  const rows=JOURNAL.slice().reverse().map(e=>`<div class="jrow"><span class="jt">${fmtT(e.t)}</span><span class="ji">${e.ic}</span><span>${e.txt}${e.n>1?` <b>×${e.n}</b>`:''}</span></div>`).join('')||'<p class="dim">Rien à signaler pour l\'instant.</p>';
  J.innerHTML=`<div class="box"><div class="mhead"><h1>📓 Journal de bord</h1><button class="back" id="jclose">Fermer</button></div><div class="jlist">${rows}</div></div>`;J.style.display='flex';
  $('jclose').onclick=()=>{J.style.display='none'}};
// ---------- succès ----------
$('tach').onclick=()=>{const A=$('achp'),n=Object.keys(ACH).length;
  A.innerHTML=`<div class="box"><div class="mhead"><h1>🏆 Succès</h1><span class="dim">${n}/${ACH_LIST.length}</span><button class="back" id="aclose">Fermer</button></div><div class="agrid">${ACH_LIST.map(a=>`<div class="acard ${ACH[a.k]?'got':''}"><span>${ACH[a.k]?a.ic:'🔒'}</span><b>${a.nom}</b><small>${a.txt}</small></div>`).join('')}</div></div>`;
  A.style.display='flex';$('aclose').onclick=()=>{A.style.display='none'}};

// ---------- couveuse : œufs ramassés à la main, éclosion en temps réel, partagée entre tous les bacs ----------
let COUVE=LS.get('biome_couve',{eggs:[],born:[]});const saveCouve=()=>LS.set('biome_couve',COUVE);
function couveTick(){const now=Date.now();let ch=false;for(const e of COUVE.eggs)if(!e.done&&now-e.t0>=e.hatch*1000/1.5){e.done=true;COUVE.born.push({sp:e.sp,n:e.n||1});ch=true;ach('couve')}
  if(ch){COUVE.eggs=COUVE.eggs.filter(e=>!e.done);saveCouve();toast('🥚 Des œufs ont éclos dans la couveuse !')}}
setInterval(couveTick,2000);
// ramasser un œuf avec la main libre
const handFree0=handFree;handFree=function(sx,sy){if(lvl&&lvl.sandbox){const w=scrToWorld(sx,sy,null);if(w){const egg=items.find(it=>it.type==='oeuf'&&!it.dead&&Math.abs(it.x-w.x)<7&&(view==='side'||Math.abs((it.z||0)-w.z)<14));
    if(egg){egg.dead=true;COUVE.eggs.push({sp:egg.sp,n:egg.n||1,hatch:Math.max(5,egg.hatch-egg.age),t0:Date.now()});saveCouve();say(`🥚 Œuf rangé dans la couveuse (${spName(egg.sp)})`,true);return}}}
  handFree0(sx,sy)};
$('vncouve').onclick=()=>{const C=$('couvep');if(C.style.display==='flex'){C.style.display='none';return}drawCouve()};
function drawCouve(){const C=$('couvep'),now=Date.now();
  const eg=COUVE.eggs.map(e=>{const p=Math.min(1,(now-e.t0)/(e.hatch*1000/1.5));return `<div class="crow"><span>${FICHES[baseOf(e.sp)]?FICHES[baseOf(e.sp)].ic:'🥚'} ${spName(e.sp)} ×${e.n}</span><div class="bar2"><i style="width:${p*100}%;background:#ffe94d"></i></div></div>`}).join('')||'<p class="dim">Aucun œuf. Sans outil, touche un œuf dans un vivarium pour le ranger ici.</p>';
  const bn=COUVE.born.map((b,i)=>`<div class="crow"><span>${FICHES[baseOf(b.sp)]?FICHES[baseOf(b.sp)].ic:'•'} ${spName(b.sp)} ×${b.n}</span><button class="back" data-rel="${i}">Relâcher ici</button></div>`).join('')||'<p class="dim">Personne n\'attend.</p>';
  C.innerHTML=`<div class="box"><div class="mhead"><h1>🥚 Couveuse</h1><button class="back" id="cclose">Fermer</button></div><p class="dim">Tiède et humide : les œufs y éclosent 1,5 fois plus vite, même quand tu joues ailleurs. Elle est partagée par tous tes vivariums.</p><h3>En incubation</h3>${eg}<h3>Nés, prêts à relâcher</h3>${bn}</div>`;
  C.style.display='flex';$('cclose').onclick=()=>{C.style.display='none'};
  C.querySelectorAll('[data-rel]').forEach(b=>b.onclick=()=>{const r=COUVE.born.splice(+b.dataset.rel,1)[0];saveCouve();if(r)release(r.sp,r.n);drawCouve()})}
function release(t,n){const sp=spOf(t);if(!sp)return;for(let q=0;q<n;q++){const i=clamp(Math.floor(rnd(20,COLS-20)),1,COLS-2),x=i*CS+CS/2;let c;
    if(sp.w){c=mk(sp,x,surfY(i)-40,{energy:40,z:rnd(10,ZD-30)});c.fly=true}else{c=mk(sp,x,surfY(i)-2,{energy:40,z:rnd(10,ZD-30)});if(baseOf(t)!=='lombric'){c.k=findWalk(c.x,c.y);const [a,b2]=cxy(c.k);c.x=a;c.y=b2}}
    c.tz=c.z;creatures.push(c)}jlog('🥚',`${n} × ${spName(t)} relâché(s) depuis la couveuse`)}

// ---------- tubes entre vivariums ----------
const linksOf=v=>v&&v.links?v.links.filter(id=>ROOM.list.some(o=>o.id===id)):[];
function toggleLink(a,b){a.links=a.links||[];b.links=b.links||[];if(a.links.includes(b.id)){a.links=a.links.filter(x=>x!==b.id);b.links=b.links.filter(x=>x!==a.id)}else{a.links.push(b.id);b.links.push(a.id);ach('tube')}saveRoom()}
// fiche : choix des bacs reliés
const fillSheet0=fillSheet;fillSheet=function(){fillSheet0();const v=ROOM.list[sheetIdx];if(!v)return;const others=ROOM.list.filter(o=>o!==v);if(!others.length)return;
  const row=document.createElement('div');row.className='tubes';row.innerHTML=`<span class="tag">🔗 Tubes vers :</span>`+others.map(o=>`<button class="back ${linksOf(v).includes(o.id)?'on':''}" data-l="${o.id}">${o.name}</button>`).join('');
  $('rsheet').querySelector('.cinfo').insertBefore(row,$('rsheet').querySelector('.cbtns'));
  row.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{toggleLink(v,ROOM.list.find(o=>o.id===b.dataset.l));fillSheet();drawRoom()})};
// dessin des tubes dans la salle
const drawRoom0=drawRoom;drawRoom=function(){drawRoom0();if(roomMode!=='salle')return;const R=$('roomin');const seen=new Set();let h='';
  for(const v of ROOM.list)for(const id of linksOf(v)){const k=[v.id,id].sort().join('|');if(seen.has(k))continue;seen.add(k);const o=ROOM.list.find(x=>x.id===id),a=slotOf(v),b=slotOf(o);if(!a||!b)continue;
    const x1=a.x+G.VW*0.75,y1=a.y+6,x2=b.x+G.VW*0.25,y2=b.y+6,mx=(x1+x2)/2,my=Math.min(y1,y2)-40;
    h+=`<svg class="tubesvg" style="left:0;top:0" width="${RW}" height="${RH}"><path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" stroke="#bfe6ff66" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" stroke="#ffffff55" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`}
  R.insertAdjacentHTML('beforeend',h)};
// en jeu : l'entrée du tube est sur la vitre de droite, au ras du sol
const PORT=()=>({x:WW-5,y:surfY(COLS-2)-3});
function drawPort(){if(!(lvl&&lvl.sandbox&&curViv&&linksOf(curViv).length))return;const P=PORT();ctx.save();
  ctx.strokeStyle='rgba(190,230,255,0.7)';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(WW-2,P.y);ctx.lineTo(WW+18,P.y);ctx.lineTo(WW+18,P.y-60);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle='#0b1418';ctx.beginPath();ctx.ellipse(WW-2,P.y,1.6,3,0,0,TAU);ctx.fill();
  ctx.fillStyle='#bfe6ff';ctx.font='5px sans-serif';ctx.textAlign='right';ctx.fillText('🔗 '+linksOf(curViv).map(id=>(ROOM.list.find(o=>o.id===id)||{}).name).join(', '),WW-6,P.y-8);ctx.textAlign='left';ctx.restore()}
let migT=0;
function migrateTick(dt){if(!(lvl&&lvl.sandbox&&curViv))return;const L=linksOf(curViv);if(!L.length)return;migT+=dt;if(migT<1)return;migT=0;const P=PORT(),n=counts();
  for(const c of creatures){if(c.dead||c.sp.id==='reine'||(c.sp.id==='fourmi'&&c.col))continue;
    if(c.x>WW-10&&Math.abs(c.y-P.y)<16){const to=L[Math.floor(Math.random()*L.length)];c.dead=true;
      const tr=LS.get('biome_transit_'+to,[]);tr.push({sp:c.sp.vid||c.sp.id,e:c.energy});LS.set('biome_transit_'+to,tr);ach('migr');
      jlog('🔗',`${nm(c)} part par le tube vers « ${(ROOM.list.find(o=>o.id===to)||{}).name} »`);continue}
    // trop nombreux : certains partent explorer
    if(!c.lure&&(n[c.sp.id]||0)>10&&Math.random()<0.004){c.lure={x:WW-6,y:P.y,z:3};c.lureT=40;c.path=null}}}
function arriveTransit(v){const tr=LS.get('biome_transit_'+v.id,[]);if(!tr.length)return;LS.set('biome_transit_'+v.id,[]);
  for(const t of tr){const sp=spOf(t.sp);if(!sp)continue;const i=4,x=i*CS+CS/2;const c=mk(sp,x,surfY(i)-(sp.w?30:2),{energy:t.e||40,z:5});if(sp.w)c.fly=true;else if(baseOf(t.sp)!=='lombric'){c.k=findWalk(c.x,c.y)}creatures.push(c)}
  jlog('🔗',`${tr.length} bête(s) arrivée(s) par le tube`);say(`🔗 ${tr.length} bête(s) sont arrivées par le tube !`,true)}
setInterval(()=>{if(ROOM.list.length>=5)ach('rack')},3000);

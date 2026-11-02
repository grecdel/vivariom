// ================= BAC À SABLE ET SALLE (lot 4) =================
// partager un vivarium par un code, modèles tout prêts, étiquettes de couleur, mode observation,
// le vivarium vit pendant ton absence, carnet daté, album photo, lumière de la salle selon l'heure.

// ---------- outils communs ----------
async function gz(obj,prefix){const raw=new TextEncoder().encode(JSON.stringify(obj));
  if(typeof CompressionStream==='function'){const buf=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();return prefix+'1:'+b64enc(new Uint8Array(buf))}
  return prefix+'0:'+b64enc(raw)}
async function ungz(code,prefix){code=String(code||'').replace(/\s+/g,'');const m=code.match(new RegExp('^'+prefix+'([01]):([A-Za-z0-9+/=]+)$'));if(!m)throw new Error(`Ce n'est pas un code de vivarium (il doit commencer par ${prefix}).`);
  let b;try{b=b64dec(m[2])}catch(e){throw new Error('Le code est abîmé : il manque peut-être un morceau.')}
  if(m[1]==='1'){if(typeof DecompressionStream!=='function')throw new Error('Ce navigateur ne sait pas lire ce code : mets-le à jour.');try{b=new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}catch(e){throw new Error('Le code est abîmé : il manque peut-être un morceau.')}}
  try{return JSON.parse(new TextDecoder().decode(b))}catch(e){throw new Error('Le code est abîmé : il manque peut-être un morceau.')}}
function ovl(id){let O=$(id);if(!O){O=document.createElement('div');O.id=id;O.className='ov';document.body.appendChild(O)}O.style.display='flex';return O}
const esc=s=>String(s).replace(/[<>&"'`]/g,'');

// ---------- 26. partager un vivarium ----------
async function partagerViv(v){const S=v===curViv&&state==='play'?serialize():loadViv(v);if(!S){toast('Ce vivarium est encore vide : entre dedans d\'abord.');return}
  const code=await gz({app:'vivariom-bac',name:v.name,fmt:v.fmt,soil:v.soil,climat:v.climat,etiq:v.etiq,thumb:v.thumb,S},'VIVB');const O=ovl('partp');
  O.innerHTML=`<div class="box"><div class="mhead"><h1>📤 Partager « ${esc(v.name)} »</h1><button class="back" id="pclose">Fermer</button></div>
   <p class="dim">Envoie ce code (ou le fichier) à un ami : dans sa grande salle, il touche 📥 et le colle. Son vivarium sera la copie exacte du tien, avec ses bêtes.</p>
   <textarea id="pcode" readonly rows="5">${code}</textarea><p class="dim">${Math.round(code.length/1024)} Ko</p>
   <button class="btn" id="pcopy">📋 Copier le code</button>${navigator.share?'<button class="btn2" id="pshare">↗ Envoyer…</button>':''}<button class="btn2" id="pfile">⬇ Fichier .vivarium</button><p class="dim" id="pmsg"></p></div>`;
  $('pclose').onclick=()=>{O.style.display='none'};
  $('pcopy').onclick=async()=>{try{await navigator.clipboard.writeText(code);$('pmsg').textContent='✔ Code copié'}catch(e){$('pcode').select();document.execCommand&&document.execCommand('copy');$('pmsg').textContent='✔ Code sélectionné : copie-le'}};
  if($('pshare'))$('pshare').onclick=()=>{const f=new File([code],esc(v.name)+'.vivarium',{type:'text/plain'});const d=navigator.canShare&&navigator.canShare({files:[f]})?{files:[f],title:'Vivariom : '+v.name}:{title:'Vivariom : '+v.name,text:code};navigator.share(d).catch(()=>{})};
  $('pfile').onclick=async()=>{const blob=new Blob([code+'\n'],{type:'text/plain'}),file=esc(v.name).replace(/\s+/g,'-')+'.vivarium';const dl=window.claude&&window.claude.use?await window.claude.use('downloads').catch(()=>null):null;
    if(dl){await dl.save({filename:file,data:blob});$('pmsg').textContent='✔ Fichier enregistré';return}const u=URL.createObjectURL(blob),A=document.createElement('a');A.href=u;A.download=file;document.body.appendChild(A);A.click();A.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);$('pmsg').textContent='✔ Fichier téléchargé'}}
function importerViv(){const O=ovl('partp');
  O.innerHTML=`<div class="box"><div class="mhead"><h1>📥 Recevoir un vivarium</h1><button class="back" id="pclose">Fermer</button></div><p class="dim">Colle le code reçu (il commence par VIVB), ou choisis le fichier .vivarium.</p>
   <textarea id="pcode" rows="5" placeholder="VIVB1:…"></textarea><button class="btn" id="pok">Ajouter à la salle</button><label class="btn2" style="display:block;text-align:center">📂 Choisir un fichier<input type="file" id="pfile" accept=".vivarium,.txt,text/plain" style="display:none"></label><p class="dim" id="pmsg"></p></div>`;
  $('pclose').onclick=()=>{O.style.display='none'};
  const go=async code=>{try{const o=await ungz(code,'VIVB');if(o.app!=='vivariom-bac'||!o.S)throw new Error("Ce n'est pas un vivarium Vivariom.");
      if(ROOM.list.length>=vivMax()||!freeSlot())throw new Error('Plus de place dans la salle : ajoute une étagère ou retire un bac.');
      const own=(O,k)=>typeof k==='string'&&Object.prototype.hasOwnProperty.call(O,k);
      if(!own(FORMATS,o.fmt))o.fmt='std';if(!own(SOILS,o.soil))o.soil='foret';if(!own(CLIMATS,o.climat))o.climat=undefined;if(!ETIQS.includes(o.etiq))o.etiq=undefined;
      const S=o.S;if(!S||typeof S!=='object'||!Array.isArray(S.plants)||!Array.isArray(S.items)||!Array.isArray(S.decos)||!Array.isArray(S.creatures)||!Array.isArray(S.colonies))throw new Error("Ce n'est pas un vivarium Vivariom.");
      S.fmt=o.fmt;S.soil=o.soil;S.plants=S.plants.filter(p=>p&&(p.kind==null||own(PLANTS,p.kind)));S.decos=S.decos.filter(d=>d&&own(DECOS,d.type));
      S.items=S.items.filter(it=>it&&typeof it.type==='string'&&/^[a-z]+$/.test(it.type));S.creatures=S.creatures.filter(c=>c&&typeof c.id==='string'&&spOf(c.id));
      if(S.DEV&&typeof S.DEV==='object'){const D={};for(const k in DEV){if(!S.DEV[k]||typeof S.DEV[k]!=='object')continue;D[k]={};for(const q in DEV[k])if(typeof S.DEV[k][q]===typeof DEV[k][q])D[k][q]=S.DEV[k][q]}S.DEV=D}else S.DEV=undefined;
      fixSlots();const s=freeSlot(),id='v'+Date.now().toString(36),v={id,name:esc(o.name||'Vivarium reçu').slice(0,24),slot:s.id,fmt:o.fmt||'std',soil:o.soil||'foret',climat:o.climat,etiq:o.etiq,thumb:typeof o.thumb==='string'&&/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(o.thumb)?o.thumb:undefined};
      if(Array.isArray(o.S.journal))o.S.journal=o.S.journal.map(e=>({t:+e.t||0,n:+e.n||1,ic:esc(e.ic).slice(0,4),txt:esc(e.txt).slice(0,160)}));
      ROOM.list.push(v);VIV.set(id,o.S);LS.set('biome_viv_'+id,o.S);saveRoom();O.style.display='none';drawRoom();toast(`📥 « ${v.name} » est arrivé dans la salle`)}catch(e){$('pmsg').textContent='⚠ '+e.message}};
  $('pok').onclick=()=>go($('pcode').value);
  $('pfile').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(go)}}
$('radd').insertAdjacentHTML('beforebegin','<button class="back" id="rimp" title="Recevoir un vivarium">📥</button><button class="back" id="ralb" title="Album photo">🖼</button>');
$('rimp').onclick=()=>importerViv();

// ---------- 27. modèles tout prêts ; 28. étiquettes ----------
const MODELES={
  foret:{ic:'🌳',nom:'Forêt',soil:'foret',climat:'tempere',plantes:['fleur','fleur','fougere','arbo','fleur','fougere','fleur'],decos:['pierre','branche','mousse'],betes:{cloporte:4,lombric:3,fourmi:1,puceron:6,coccinelle:2,abeille:2,grillon:2},litiere:4},
  desert:{ic:'🏜',nom:'Désert',soil:'desert',climat:'desert',plantes:['cactus','cactus','cactus','cactus'],decos:['pierre','volcan','pierre'],betes:{tenebrion:5,scorpion:1,grillon:2},litiere:3},
  mare:{ic:'🐸',nom:'Mare',soil:'marais',climat:'tropical',plantes:['fougere','dionee','champignon','fleur','fougere','dionee','champignon'],decos:['mare','mousse','liege'],betes:{escargot:4,luciole:1,mouche:4,cloporte:3,lombric:2},litiere:5}};
const ETIQS=['','#ffe94d','#ff7a5a','#6ad0ff','#8bff6a','#d9a0ff'];
{const fs=fillSheet;fillSheet=function(){fs();const v=ROOM.list[sheetIdx],ci=document.querySelector('#rsheet .cinfo');if(!v||!ci)return;
  let h=`<div class="clims"><span class="dim">Étiquette</span>${ETIQS.map(c=>`<button class="etq ${(v.etiq||'')===c?'on':''}" data-e="${c}" style="background:${c||'#222'}">${c?'':'∅'}</button>`).join('')}</div>`;
  if(v.fresh)h+=`<div class="clims"><span class="dim">Modèle</span><button class="mod ${!v.modele?'on':''}" data-m="">∅ Vide</button>${Object.entries(MODELES).map(([k,M])=>`<button class="mod ${v.modele===k?'on':''}" data-m="${k}">${M.ic} ${M.nom}</button>`).join('')}</div>`;
  else h+=`<div class="clims"><button class="clim" id="spart">📤 Partager ce vivarium</button></div>`;
  ci.insertAdjacentHTML('beforeend',h);
  ci.querySelectorAll('.etq').forEach(b=>b.onclick=e=>{e.stopPropagation();v.etiq=b.dataset.e||undefined;saveRoom();drawRoom();fillSheet()});
  ci.querySelectorAll('.mod').forEach(b=>b.onclick=e=>{e.stopPropagation();const M=MODELES[b.dataset.m];v.modele=b.dataset.m||undefined;if(M){v.soil=M.soil;v.climat=M.climat}saveRoom();fillSheet()});
  const sp=$('spart');if(sp)sp.onclick=e=>{e.stopPropagation();partagerViv(v)}}}
{const vt=vivTile;vivTile=function(v,cls=''){let h=vt(v,cls);if(v.etiq)h=h.replace('<span class="vtag">',`<span class="vtag" style="background:${v.etiq};color:#000">`);return h}}
function remplirModele(M){const keep=tool,sx=WW/(M.plantes.length+1);
  for(const p of plants){p.alive=false;for(let r=0;r<p.h;r++){const k=K(p.col,p.base-r);if(k>=0&&STEM[k]>0)STEM[k]--}}plants=[];
  for(let q=0;q<(M.litiere||3);q++){tool='compost';const x=WW*(0.15+0.7*q/Math.max(1,(M.litiere||3)-1));tapAction(x,surfY(Math.floor(x/CS))-4)}
  M.decos.forEach((d,q)=>{tool=d;const i=Math.round((q+0.6)/(M.decos.length+0.2)*COLS*0.9);tapAction(i*CS,surfY(i)-4)});
  M.plantes.forEach((k,q)=>{tool='plante:'+k;const x=sx*(q+1)+rnd(-6,6);tapAction(x,surfY(Math.floor(x/CS))-4)});
  for(const [id,n] of Object.entries(M.betes))for(let q=0;q<n;q++){tool=id;const x=rnd(WW*0.1,WW*0.9),fly=SPI[id]&&SPI[id].w;tapAction(x,surfY(Math.floor(x/CS))-(fly?30:4))}
  tool=keep;refreshPalette();jlog('📦','Vivarium préparé : modèle '+M.nom)}

// ---------- 30. le vivarium vit pendant ton absence ----------
{const sc=saveCurrent;saveCurrent=function(){if(curViv)curViv.vu=Date.now();sc()}}
function rattrapage(v){const ms=Date.now()-(v.vu||Date.now());if(ms<60000)return;
  const sim=Math.min(300,ms/1000/12),n0=counts(),j0=JOURNAL.length;let fait=0;const O=ovl('absp');
  O.innerHTML=`<div class="box" style="text-align:center"><h1>⏳ Pendant ton absence…</h1><p class="dim" id="abst">Le vivarium a continué de vivre.</p><div class="cbar"><i id="absb" style="width:0%"></i></div></div>`;
  paused=true;const step=()=>{const t0=performance.now();while(fait<sim&&performance.now()-t0<30){update(1/15);fait+=1/15}$('absb').style.width=(fait/sim*100)+'%';
    if(fait<sim){setTimeout(step,0);return}
    const n1=counts(),dif=Object.keys({...n0,...n1}).filter(k=>FICHES[k]&&(n1[k]||0)!==(n0[k]||0)).map(k=>`${FICHES[k].ic} ${(n0[k]||0)}→${n1[k]||0}`).join(' · '),ev=JOURNAL.slice(j0).slice(-6).map(e=>`${e.ic} ${e.txt}`).join('<br>');
    const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60;
    O.innerHTML=`<div class="box"><div class="mhead"><h1>⏳ Pendant ton absence</h1></div><p>Tu es parti ${h?h+' h ':''}${m} min : le vivarium a vécu <b>${fmt(sim)}</b> de plus.</p>${dif?`<p>${dif}</p>`:'<p class="dim">Rien n\'a changé dans les populations.</p>'}${ev?`<p class="dim">${ev}</p>`:''}<button class="btn" id="absok">Voir le vivarium</button></div>`;
    $('absok').onclick=()=>{O.style.display='none';paused=false;last=performance.now()}};
  setTimeout(step,30)}
{const ev=enterViv;enterViv=function(v){const neuf=!!v.fresh;ev(v);
  if(neuf&&v.modele&&MODELES[v.modele]){remplirModele(MODELES[v.modele]);delete v.modele;saveRoom()}
  else if(!neuf&&v.vu)rattrapage(v);v.vu=Date.now()}}

// ---------- 29. mode observation ----------
document.body.insertAdjacentHTML('beforeend','<button id="obsx" title="Quitter le mode observation">✕</button>');
$('vnav').insertAdjacentHTML('beforeend','<button id="vnobs" title="Mode observation : sans interface">👁</button><button id="vnalb" title="Album photo">🖼</button>');
function observer(on){document.body.classList.toggle('obs',on);if(on){selC=null;toast('👁 Mode observation · touche ✕ en haut à droite pour revenir')}resize()}
{const ts=tapScreen;tapScreen=function(x,y){if(document.body.classList.contains('obs'))return;ts(x,y)}}
$('vnobs').onclick=()=>observer(true);$('obsx').onclick=()=>observer(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('obs'))observer(false)});

// ---------- 31. carnet daté ----------
{const jl=jlog;jlog=function(ic,txt){jl(ic,txt);const L=JOURNAL[JOURNAL.length-1];if(L&&!L.d)L.d=Date.now()}}
$('vnjournal').onclick=()=>{const J=$('journal');if(J.style.display==='flex'){J.style.display='none';return}
  const dd=d=>{const x=new Date(d);return x.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})+' '+x.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})};
  const rows=JOURNAL.slice().reverse().map(e=>`<div class="jrow"><span class="jt">${e.d?dd(e.d):fmtT(e.t)}</span><span class="ji">${e.ic}</span><span>${e.txt}${e.n>1?` <b>×${e.n}</b>`:''}</span></div>`).join('')||'<p class="dim">Rien à signaler pour l\'instant.</p>';
  J.innerHTML=`<div class="box"><div class="mhead"><h1>📓 Carnet de bord</h1><button class="back" id="jclose">Fermer</button></div><p class="dim">Naissances, chasses, extinctions… avec la date et l'heure.</p><div class="jlist">${rows}</div></div>`;J.style.display='flex';
  $('jclose').onclick=()=>{J.style.display='none'}};

// ---------- 32. album photo (gardé sur l'appareil) ----------
const ALB={db:null,open(){return this.db||(this.db=new Promise((ok,ko)=>{try{const r=indexedDB.open('vivariom-album',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}catch(e){ko(e)}}))},
  async tx(mode,fn){const db=await this.open();return new Promise((ok,ko)=>{const t=db.transaction('photos',mode),s=t.objectStore('photos'),r=fn(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>ko(t.error)})},
  add(p){return this.tx('readwrite',s=>s.put(p))},all(){return this.tx('readonly',s=>s.getAll())},del(id){return this.tx('readwrite',s=>s.delete(id))}};
{const tp=takePhoto;takePhoto=function(){tp();const img=document.querySelector('#photop img');if(!img)return;const im=new Image();im.onload=()=>{const k=Math.min(1,900/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    ALB.add({id:Date.now(),d:Date.now(),nom:photoName(),url:c.toDataURL('image/jpeg',0.8)}).then(()=>{const m=$('phmsg');if(m)m.insertAdjacentHTML('beforebegin','<p class="dim">🖼 Rangée dans l\'album.</p>')}).catch(()=>{})};im.src=img.src}}
async function ouvrirAlbum(){const O=ovl('albp');let L=[];try{L=(await ALB.all()).sort((a,b)=>b.d-a.d)}catch(e){}
  O.innerHTML=`<div class="box wide"><div class="mhead"><h1>🖼 Album</h1><span class="dim">${L.length} photo${L.length>1?'s':''}</span><button class="back" id="aclose">Fermer</button></div>
   ${L.length?`<div class="agrid">${L.map(p=>`<figure data-id="${p.id}"><img src="${p.url}" loading="lazy"><figcaption>${esc(p.nom)}<br><small>${new Date(p.d).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</small></figcaption></figure>`).join('')}</div>`:'<p class="dim">Pas encore de photo : touche 📷 dans un vivarium.</p>'}</div>`;
  $('aclose').onclick=()=>{O.style.display='none'};
  O.querySelectorAll('figure').forEach(f=>f.onclick=()=>{const p=L.find(x=>String(x.id)===f.dataset.id);if(!p)return;const V=ovl('albv');
    V.innerHTML=`<div class="box"><img src="${p.url}" style="width:100%;border-radius:8px"><p>${esc(p.nom)} · ${new Date(p.d).toLocaleString('fr-FR')}</p>
     ${navigator.share?'<button class="btn" id="avshare">↗ Partager</button>':''}<button class="btn2" id="avdl">⬇ Enregistrer</button><button class="btn2" id="avdel">🗑 Retirer de l'album</button><button class="btn2" id="avx">Fermer</button></div>`;
    $('avx').onclick=()=>{V.style.display='none'};
    $('avdl').onclick=()=>{const A=document.createElement('a');A.href=p.url;A.download='vivariom-'+p.id+'.jpg';document.body.appendChild(A);A.click();A.remove()};
    if($('avshare'))$('avshare').onclick=async()=>{try{const b=await (await fetch(p.url)).blob(),f=new File([b],'vivariom.jpg',{type:'image/jpeg'});await navigator.share({files:[f],title:'Mon vivarium',text:'Mon vivarium dans Vivariom : https://grecdel.github.io/vivariom/'})}catch(e){}};
    $('avdel').onclick=async()=>{await ALB.del(p.id).catch(()=>{});V.style.display='none';ouvrirAlbum()}})}
$('vnalb').onclick=()=>ouvrirAlbum();$('ralb').onclick=()=>ouvrirAlbum();

// ---------- 33. lumière de la salle selon l'heure réelle ----------
function heureSalle(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;
  const nuit=h<6||h>=22?1:h<8?(8-h)/2:h>=19?(h-19)/3:0;// 0 = plein jour, 1 = nuit
  return {nuit,ciel:nuit>0.7?'#0b1530':nuit>0.2?'#c8703a':'#9cc8f0'}}
{const dr=drawRoom;drawRoom=function(){dr();const R=$('roomin');if(!R||roomMode!=='salle')return;const {nuit,ciel}=heureSalle();
  R.querySelectorAll('.win').forEach(w=>{w.style.background=`linear-gradient(${ciel},${nuit>0.7?'#1a2448':'#e8f0ff'})`});
  if(nuit>0.05)R.insertAdjacentHTML('beforeend',`<div class="nuitsalle" style="opacity:${(nuit*0.55).toFixed(2)}"></div>`);
  if(nuit>0.5)R.querySelectorAll('.viv').forEach(v=>v.classList.add('allume'))}}
setInterval(()=>{if($('room').style.display==='block'&&sheetIdx<0)drawRoom()},60000);
if(window.__sim){window.__sim.partageCode=async i=>{const v=ROOM.list[i];const S=loadViv(v);return gz({app:'vivariom-bac',name:v.name,fmt:v.fmt,soil:v.soil,S},'VIVB')};window.__sim.importer=importerViv;window.__sim.observer=observer;window.__sim.album=ouvrirAlbum}

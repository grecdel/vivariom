// ================= NOTIFICATIONS (idée 16) ET MODE ENFANT (idée 17) =================

// ---------- 16. notifications sur le téléphone ----------
// Coupées par défaut. Quand on les active, le navigateur demande la permission.
// Elles n'arrivent que si le jeu est ouvert en arrière-plan (onglet ou appli installée pas fermée) : pas de serveur.
if(OPT.notif===undefined)OPT.notif=false;
const NOTIF_DELAI=90000;let notifDer={};
function notifier(cle,titre,txt){if(!OPT.notif||!('Notification' in window)||Notification.permission!=='granted')return;if(!document.hidden)return;
  const now=Date.now();if(now-(notifDer[cle]||0)<NOTIF_DELAI*4||now-(notifDer._||0)<NOTIF_DELAI)return;notifDer[cle]=now;notifDer._=now;
  const o={body:txt,icon:'icones/icone-192.png',badge:'icones/icone-192.png',tag:'vivariom-'+cle,lang:'fr'};
  try{if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(r=>r.showNotification(titre,o)).catch(()=>{try{new Notification(titre,o)}catch(e){}});else new Notification(titre,o)}catch(e){}}
let notT=0,notPrev={};
function notifTick(dt){if(!OPT.notif||state!=='play')return;notT-=dt;if(notT>0)return;notT=3;const n=counts(),ou=lvl.sandbox?`« ${lvl.nom} »`:`niveau ${lvlIdx+1}`;
  if((n.puceron||0)>40&&(notPrev.puceron||0)<=40)notifier('pucerons','🟢 Invasion de pucerons !',`Tes pucerons ont envahi le vivarium ${ou}. Des coccinelles pourraient aider.`);
  for(const id in notPrev)if(notPrev[id]>0&&!(n[id]>0)&&FICHES[id]&&id!=='plante')notifier('ext-'+id,`${FICHES[id].ic} Plus de ${FICHES[id].nom.toLowerCase()}`,`Il n'y en a plus dans le vivarium ${ou}.`);
  if(creatures.some(c=>!c.dead&&c.malade))notifier('malade','🍄 Une bête est malade','Le sol est trop humide : ouvre Vivariom pour l\'aider.');
  if(typeof ESSAIM!=='undefined'&&ESSAIM)notifier('essaim','🐝 Un essaim se forme !','Viens voir les abeilles se rassembler en grappe.');
  if(DEV.pump.level<=0)notifier('reservoir','💧 Réservoir vide','Le brumisateur ne peut plus brumiser.');
  notPrev=n}
{const w=win;win=function(){w();notifier('win','🏆 Niveau réussi !','Ton vivarium a tenu : viens voir tes étoiles.')}}
{const l=lose;lose=function(m){l(m);notifier('lose','😢 Une espèce a disparu',String(m).replace(/<[^>]*>/g,'').slice(0,120))}}
{const oo=openOpts;openOpts=function(){oo();const h=[...document.querySelectorAll('#opts h3')].find(e=>e.textContent==='Appareil');if(!h)return;const ok='Notification' in window;
  const row=document.createElement('div');row.className='orow';row.innerHTML=`<span>🔔 Notifications<br><small class="dim">${ok?'quand le jeu est ouvert en arrière-plan':'pas disponibles sur ce navigateur'}</small></span><span class="oseg"><button data-nt="1" class="${OPT.notif?'on':''}" ${ok?'':'disabled'}>Oui</button><button data-nt="0" class="${OPT.notif?'':'on'}">Non</button></span>`;
  h.after(row);row.querySelectorAll('button').forEach(b=>b.onclick=async()=>{if(b.dataset.nt==='1'){let p='denied';try{p=await Notification.requestPermission()}catch(e){}OPT.notif=p==='granted';if(!OPT.notif)toast('🔕 Notifications refusées par le navigateur : autorise-les dans ses réglages.')}else OPT.notif=false;saveOpt();openOpts()})}}

// ---------- 17. mode enfant ----------
// Facile partout, aide renforcée, textes plus simples et aucune mort montrée : les bêtes « partent se promener »,
// les restes deviennent des feuilles mortes, et une partie ratée se recommence sans drame.
if(OPT.enfant===undefined)OPT.enfant=false;
const enfant=()=>!!OPT.enfant;
{const sl=startLevel;startLevel=function(i){sl(i);if(enfant()){const L=$('lvltxt');if(L)L.insertAdjacentHTML('beforeend','<p class="dim">🧸 Mode enfant : plus d\'aide, et rien n\'est grave !</p>')}}}
{const sm=showMenu;showMenu=function(){sm();if(!enfant())return;const d=document.querySelector('#menu .diffs');if(d)d.innerHTML='<div class="diff on" style="grid-column:1/-1"><b>🧸 Mode enfant</b><small>Tout est en Facile, avec plus d\'aide. (Options pour le changer)</small></div>'}}
// le carnet ne parle pas de mort
{const jl=jlog;jlog=function(ic,txt){if(enfant()&&ic==='🥀'){txt=String(txt).replace(/ est morte?$/,' a fané et nourrit la terre')}else if(enfant()){txt=String(txt).replace(/ est mort(e)?( de faim| de vieillesse)?$/,' est parti$1 se promener ailleurs').replace(/ a mangé : .*/,' a trouvé son repas').replace(/^Plus aucun (.*) dans le vivarium$/,'Les $1 sont tous partis se promener').replace(/a disparu/,'est parti');if(ic==='💀')ic='🌈'}jl(ic,txt)}}
// les restes sont dessinés comme des feuilles mortes
{const di=drawItems;drawItems=function(){if(!enfant()){di();return}const keep=items;items=items.filter(it=>it.type!=='cadavre');di();items=keep;
  for(const it of keep){if(it.type!=='cadavre'||it.carried)continue;ctx.save();zT(it.z);ctx.globalAlpha=Math.max(0.3,1-it.age/80);ctx.strokeStyle=hsl(28,70,48);ctx.fillStyle=hsl(30,60,20);ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(it.x-3,it.y);ctx.lineTo(it.x,it.y-1.6);ctx.lineTo(it.x+3,it.y);ctx.lineTo(it.x,it.y+0.8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}}
// une partie perdue : un message doux
{const l=lose;lose=function(m){l(m);if(!enfant())return;const t=$('endtxt');if(t){const h=t.querySelector('h1');if(h){h.textContent='🌈 Oups, on recommence ?';h.className='ok'}const p=t.querySelector('p');if(p)p.textContent=String(m).replace(/Extinction : /,'').replace(/a disparu/,'est parti').replace(/et il n'en reste plus en réserve/,'et il n\'y en a plus dans la boîte')+' Ce n\'est pas grave : chaque essai t\'apprend quelque chose !'}}}
// le bilan dit « départs » au lieu de « morts »
{const b0=bilanHTML;bilanHTML=function(){const h=b0();return enfant()?h.replace('✝ Morts','🌈 Départs').replace(/mangées/,'parties manger ailleurs').replace(/de faim/,'pour chercher à manger').replace(/de vieillesse/,'pour se reposer'):h}}
// messages d'aide toujours visibles et un peu plus grands
{const oo=openOpts;openOpts=function(){oo();const h=[...document.querySelectorAll('#opts h3')].find(e=>e.textContent==='Jeu');if(!h)return;
  const row=document.createElement('div');row.className='orow';row.innerHTML=`<span>🧸 Mode enfant<br><small class="dim">Facile, plus d'aide, pas de mort affichée</small></span><span class="oseg"><button data-enf="1" class="${OPT.enfant?'on':''}">Oui</button><button data-enf="0" class="${OPT.enfant?'':'on'}">Non</button></span>`;
  h.after(row);row.querySelectorAll('button').forEach(b=>b.onclick=()=>{OPT.enfant=b.dataset.enf==='1';if(OPT.enfant){OPT.tips=true;if(OPT.texte==='normal'||!OPT.texte)OPT.texte='grand'}saveOpt();if(typeof appliquerAcces==='function')appliquerAcces();openOpts()})}}
{const up=update;update=function(dt){up(dt);notifTick(dt)}}
if(window.__sim){window.__sim.enfant=v=>{OPT.enfant=!!v};window.__sim.notifTest=()=>{const o=document.hidden;return {perm:'Notification' in window?Notification.permission:'absent',opt:OPT.notif}}}

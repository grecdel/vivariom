// ================= CONTACT : SIGNALER UN BUG, UNE IDÉE, UNE DEMANDE =================
// Pas de serveur : le message part dans la page « Issues » du dépôt GitHub (le joueur a besoin d'un compte GitHub),
// ou se copie pour l'envoyer autrement. Si CONTACT_URL est rempli (service de formulaire type Formspree, compte créé
// par l'auteur), le message est envoyé directement, sans compte. Entrées : menu titre, Options, lien ?contact=1.
const CONTACT_URL='';
const CONTACT_GH='https://github.com/grecdel/vivariom/issues/new';
const ERREURS_JS=[];
window.addEventListener('error',e=>{if(ERREURS_JS.length<5)ERREURS_JS.push(String(e.message||'').slice(0,160)+(e.lineno?' (l. '+e.lineno+')':''))});
window.addEventListener('unhandledrejection',e=>{if(ERREURS_JS.length<5)ERREURS_JS.push('promesse : '+String(e.reason&&e.reason.message||e.reason).slice(0,160))});
function contactInfos(){const ua=navigator.userAgent,app=window.matchMedia&&matchMedia('(display-mode: standalone)').matches?'appli installée':'navigateur';
  const sys=/Android [\d.]+/.exec(ua)?.[0]||(/Windows/.test(ua)?'Windows':/Mac OS X/.test(ua)?'macOS':/iPhone|iPad/.test(ua)?'iOS':/Linux/.test(ua)?'Linux':'?');
  const nav=/Edg\/\d+/.exec(ua)?.[0]||/Firefox\/\d+/.exec(ua)?.[0]||/Chrome\/\d+/.exec(ua)?.[0]||/Safari\/\d+/.exec(ua)?.[0]||'?';
  const hud=document.getElementById('hud'),ou=hud&&hud.offsetParent?hud.innerText.split('\n')[0].slice(0,80):'menu';
  return ['Appareil : '+sys+' · '+nav+' · '+app,'Écran : '+innerWidth+'×'+innerHeight+(devicePixelRatio>1?' (×'+devicePixelRatio+')':''),'Langue : '+(typeof LANG!=='undefined'?LANG:navigator.language),
    'Où : '+ou,'Version : '+(document.lastModified||'?')].concat(ERREURS_JS.length?['Erreurs : '+ERREURS_JS.join(' | ')]:[]).join('\n')}
const CONTACT_TYPES={bug:['🐞','Un bug','[Bug] '],idee:['💡','Une idée ou une demande','[Idée] '],autre:['💬','Autre chose','[Message] ']};
function openContact(depuis){const O=$('opts');let type='bug';
  O.innerHTML=`<div class="box"><div class="mhead"><h1>✉ Contact</h1><button class="back" id="ctback">Retour</button></div>
   <p class="dim">Un bug, une idée, une question ? Écris-le ici : ça aide beaucoup à améliorer le jeu.</p>
   <h3>C'est…</h3><div id="cttype" style="display:flex;gap:6px;flex-wrap:wrap">${Object.entries(CONTACT_TYPES).map(([k,v])=>`<button class="btn2" data-t="${k}" style="flex:1;min-width:120px">${v[0]} ${v[1]}</button>`).join('')}</div>
   <h3>Ton message</h3>
   <input id="cttitre" maxlength="90" placeholder="En quelques mots (ex. : la coccinelle traverse le sol)" style="width:100%;box-sizing:border-box;background:#0a0a0a;color:#fff;border:1px solid #333;border-radius:8px;padding:8px;font:14px inherit">
   <textarea id="ctmsg" rows="6" maxlength="4000" placeholder="Raconte ce qui s'est passé, ce que tu faisais juste avant, ou ce que tu aimerais voir dans le jeu." style="width:100%;box-sizing:border-box;margin-top:8px;background:#0a0a0a;color:#fff;border:1px solid #333;border-radius:8px;padding:8px;font:14px inherit"></textarea>
   <input id="ctnom" maxlength="40" placeholder="Ton prénom ou pseudo (facultatif)" style="width:100%;box-sizing:border-box;margin-top:8px;background:#0a0a0a;color:#fff;border:1px solid #333;border-radius:8px;padding:8px;font:14px inherit">
   <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="ctinfo" checked> Joindre les infos sur l'appareil (aide à trouver les bugs)</label>
   <pre id="ctinfos" class="dim" style="white-space:pre-wrap;font:11px ui-monospace,monospace;margin:6px 0 0"></pre>
   <p class="dim" id="ctmsg2"></p>
   ${CONTACT_URL?'<button class="btn" id="ctsend">📨 Envoyer</button>':''}
   <button class="${CONTACT_URL?'btn2':'btn'}" id="ctgh">🐙 Envoyer sur GitHub</button>
   <p class="dim" style="margin-top:4px">${CONTACT_URL?'':"Il faut un compte GitHub (gratuit). Ton message y sera public : n'y mets rien de personnel."}</p>
   <button class="btn2" id="ctcopy">📋 Copier le message</button></div>`;
  O.style.display='flex';
  const inf=$('ctinfos');inf.textContent=contactInfos();$('ctinfo').onchange=e=>{inf.style.display=e.target.checked?'block':'none'};
  const majType=()=>{for(const b of O.querySelectorAll('#cttype button')){const on=b.dataset.t===type;b.style.borderColor=on?'#ffe94d':'';b.style.color=on?'#ffe94d':''}};
  for(const b of O.querySelectorAll('#cttype button'))b.onclick=()=>{type=b.dataset.t;majType()};majType();
  const m=$('ctmsg2'),lire=()=>{const titre=$('cttitre').value.trim(),msg=$('ctmsg').value.trim(),nom=$('ctnom').value.trim();
    if(!titre&&!msg){m.textContent='✏ Écris d\'abord ton message.';return null}m.textContent='';
    const corps=(msg||titre)+(nom?'\n\n— '+nom:'')+($('ctinfo').checked?'\n\n---\n'+contactInfos():'');return{titre:CONTACT_TYPES[type][2]+(titre||msg.split('\n')[0]).slice(0,90),corps,type,nom}};
  $('ctback').onclick=()=>{if(depuis==='options')openOpts();else O.style.display='none'};
  $('ctgh').onclick=()=>{const r=lire();if(!r)return;const url=CONTACT_GH+'?title='+encodeURIComponent(r.titre)+'&body='+encodeURIComponent(r.corps.slice(0,6000));
    window.open(url,'_blank','noopener');m.textContent='✔ La page GitHub s\'est ouverte : vérifie ton message puis touche « Create » (ou « Submit new issue »).'};
  $('ctcopy').onclick=async()=>{const r=lire();if(!r)return;const t=r.titre+'\n\n'+r.corps;try{await navigator.clipboard.writeText(t);m.textContent='✔ Message copié.'}catch(e){m.textContent='Copie impossible ici : sélectionne le texte à la main.'}};
  if(CONTACT_URL)$('ctsend').onclick=async()=>{const r=lire();if(!r)return;m.textContent='Envoi…';
    try{const rep=await fetch(CONTACT_URL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({sujet:r.titre,message:r.corps,type:r.type,nom:r.nom})});
      if(!rep.ok)throw new Error(rep.status);m.textContent='✔ Merci ! Ton message est bien parti.';$('ctmsg').value='';$('cttitre').value=''}
    catch(e){m.textContent='⚠ L\'envoi n\'a pas marché (pas de connexion ?). Essaie GitHub ou copie le message.'}}}
// entrées : menu titre, Options, lien ?contact=1
{const t=$('ttuto');if(t&&!$('tcontact')){t.insertAdjacentHTML('afterend','<button class="tlink" id="tcontact">✉ Un bug, une idée ? Écris-nous</button>');$('tcontact').onclick=()=>openContact('titre')}}
{const oo=openOpts;openOpts=function(){oo();const O=$('opts');if($('ocontact'))return;const box=O.querySelector('.box');if(!box)return;
  const h=[...O.querySelectorAll('h3')].find(e=>e.textContent==='Données');const html='<button class="btn2" id="ocontact">✉ Signaler un bug, proposer une idée</button>';
  if(h)h.insertAdjacentHTML('beforebegin','<h3>Contact</h3>'+html);else box.insertAdjacentHTML('beforeend','<h3>Contact</h3>'+html);$('ocontact').onclick=()=>openContact('options')}}
try{if(/[?&]contact=1/.test(location.search))setTimeout(()=>openContact('titre'),400)}catch(e){}
if(window.__sim)window.__sim.contact=()=>{openContact('titre');return contactInfos()};

// ---------- sauvegarde : exporter / importer toute la progression (clés biome_*) ----------
// Format du code : « VIVA1: » + base64 du JSON compressé en gzip (ou « VIVA0: » + base64 du JSON brut
// si le navigateur ne sait pas compresser). Le fichier .vivariom contient le même code.
const SAVE_PREFIX='biome_';
function saveCollect(){const data={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(SAVE_PREFIX))data[k]=localStorage.getItem(k)}}catch(e){}
  return {app:'vivariom',v:1,date:new Date().toISOString(),data}}
const b64enc=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
const b64dec=s=>{const b=atob(s);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function saveEncode(obj){const raw=new TextEncoder().encode(JSON.stringify(obj));
  if(typeof CompressionStream==='function'){const buf=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();return 'VIVA1:'+b64enc(new Uint8Array(buf))}
  return 'VIVA0:'+b64enc(raw)}
async function saveDecode(code){code=String(code||'').replace(/\s+/g,'');const m=code.match(/^VIVA([01]):([A-Za-z0-9+/=]+)$/);
  if(!m)throw new Error("Ce n'est pas un code de sauvegarde Vivariom (il doit commencer par VIVA).");
  let bytes;try{bytes=b64dec(m[2])}catch(e){throw new Error('Le code est abîmé : il manque peut-être un morceau.')}
  if(m[1]==='1'){if(typeof DecompressionStream!=='function')throw new Error("Ce navigateur ne sait pas lire ce code : mets-le à jour.");
    try{bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}catch(e){throw new Error('Le code est abîmé : il manque peut-être un morceau.')}}
  let obj;try{obj=JSON.parse(new TextDecoder().decode(bytes))}catch(e){throw new Error('Le code est abîmé : il manque peut-être un morceau.')}
  if(!obj||obj.app!=='vivariom'||!obj.data||typeof obj.data!=='object')throw new Error("Ce n'est pas une sauvegarde Vivariom.");
  return obj}
function saveSummary(obj){const d=obj.data,g=k=>{try{return JSON.parse(d[k])}catch(e){return null}};
  const done=g('biome_done'),stars=g('biome_stars'),room=g('biome_room');
  const nDone=Array.isArray(done)?done.length:0,nStars=stars?Object.values(stars).reduce((a,b)=>a+(+b||0),0):0,nViv=Array.isArray(room)?room.length:Object.keys(d).filter(k=>k.startsWith('biome_viv_')).length;
  const dt=obj.date?new Date(obj.date):null;
  return `${nDone} niveau${nDone>1?'x':''} réussi${nDone>1?'s':''} · ${nStars} ★ · ${nViv} vivarium${nViv>1?'s':''} en bac à sable${dt&&!isNaN(dt)?' · enregistrée le '+dt.toLocaleDateString('fr-FR')+' à '+dt.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):''}`}
function saveApply(obj){
  // bloque les enregistrements automatiques (partie en cours, bac à sable) déclenchés par le rechargement
  const set0=Storage.prototype.setItem,rm0=Storage.prototype.removeItem;
  try{const old=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(SAVE_PREFIX))old.push(k)}
    for(const k of old)localStorage.removeItem(k);for(const k in obj.data)if(k.startsWith(SAVE_PREFIX))localStorage.setItem(k,obj.data[k])}
  catch(e){throw new Error("Pas assez de place sur cet appareil pour cette sauvegarde.")}
  Storage.prototype.setItem=function(k,v){if(this===localStorage&&String(k).startsWith(SAVE_PREFIX))return;return set0.call(this,k,v)};
  Storage.prototype.removeItem=function(k){if(this===localStorage&&String(k).startsWith(SAVE_PREFIX))return;return rm0.call(this,k)};
  location.reload()}
async function saveDownload(code){const d=new Date(),p=n=>String(n).padStart(2,'0'),file=`vivariom-${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.vivariom`;
  const blob=new Blob([code+'\n'],{type:'text/plain'});
  const dl=window.claude&&window.claude.use?await window.claude.use('downloads').catch(()=>null):null;
  if(dl){const r=await dl.save({filename:file,data:blob});return r&&r.status==='saved'?'✔ Fichier enregistré : '+file:'✔ Fichier envoyé : '+file}
  const url=URL.createObjectURL(blob),A=document.createElement('a');A.href=url;A.download=file;document.body.appendChild(A);A.click();A.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
  return '✔ Fichier téléchargé : '+file}

function openSave(){const O=$('opts');let pending=null;
  O.innerHTML=`<div class="box"><div class="mhead"><h1>💾 Sauvegarde</h1><button class="back" id="svback">Retour</button></div>
   <p class="dim">Pour retrouver ta partie sur un autre appareil (téléphone, PC…), exporte-la ici puis importe-la là-bas. Tout est compris : campagne, étoiles, succès, vivariums du bac à sable et options.</p>
   <h3>Exporter</h3>
   <p class="dim" id="svsum">…</p>
   <button class="btn" id="svfile">⬇ Enregistrer un fichier de sauvegarde</button>
   <button class="btn2" id="svcopy">📋 Copier le code</button>
   <textarea id="svcode" readonly rows="3" style="display:none;width:100%;box-sizing:border-box;margin-top:8px;background:#0a0a0a;color:#cfe;border:1px solid #333;border-radius:8px;font:11px ui-monospace,monospace"></textarea>
   <p class="dim" id="svmsg1"></p>
   <h3>Importer</h3>
   <p class="dim">Choisis un fichier <b>.vivariom</b> ou colle un code. ⚠ La progression de cet appareil sera remplacée.</p>
   <input type="file" id="svpick" accept=".vivariom,.txt,text/plain" style="display:none">
   <button class="btn2" id="svopen">📂 Choisir un fichier</button>
   <textarea id="svin" rows="3" placeholder="…ou colle le code ici (VIVA1:…)" style="width:100%;box-sizing:border-box;margin-top:8px;background:#0a0a0a;color:#fff;border:1px solid #333;border-radius:8px;font:11px ui-monospace,monospace"></textarea>
   <p class="dim" id="svmsg2"></p>
   <button class="btn" id="svgo" style="display:none">Remplacer ma progression</button></div>`;
  O.style.display='flex';
  const cur=saveCollect();$('svsum').textContent='Sur cet appareil : '+saveSummary(cur);
  let codeP=null;const code=()=>codeP||(codeP=saveEncode(saveCollect()));
  $('svback').onclick=()=>openOpts();
  $('svfile').onclick=async()=>{const m=$('svmsg1');try{m.textContent=await saveDownload(await code())}catch(e){m.textContent=e&&e.code==='declined'?'Enregistrement annulé.':"Le fichier n'a pas pu être enregistré : utilise « Copier le code »."}};
  $('svcopy').onclick=async()=>{const m=$('svmsg1'),c=await code(),t=$('svcode');t.value=c;t.style.display='block';
    try{await navigator.clipboard.writeText(c);m.textContent=`✔ Code copié (${Math.round(c.length/1024)} ko). Colle-le dans un message ou une note pour le retrouver sur l'autre appareil.`}
    catch(e){t.focus();t.select();m.textContent='Le code est sélectionné ci-dessus : copie-le à la main.'}};
  const check=async txt=>{const m=$('svmsg2'),go=$('svgo');pending=null;go.style.display='none';if(!txt.trim()){m.textContent='';return}
    try{pending=await saveDecode(txt);m.textContent='Sauvegarde trouvée : '+saveSummary(pending);go.style.display='block';go.textContent='Remplacer ma progression';go.dataset.arm=''}
    catch(e){m.textContent='⚠ '+e.message}};
  $('svopen').onclick=()=>$('svpick').click();
  $('svpick').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const txt=await f.text();$('svin').value=txt.trim().slice(0,60)+(txt.length>60?'…':'');check(txt)};
  $('svin').oninput=e=>check(e.target.value);
  $('svgo').onclick=e=>{if(!pending)return;const b=e.currentTarget;if(!b.dataset.arm){b.dataset.arm='1';b.textContent='⚠ Toucher encore pour confirmer';return}
    try{saveApply(pending)}catch(err){$('svmsg2').textContent='⚠ '+err.message}}}

const openOpts2=openOpts;openOpts=function(){openOpts2();const h=[...$('opts').querySelectorAll('h3')].find(e=>e.textContent==='Données');
  if(h&&!$('osave')){h.insertAdjacentHTML('afterend','<button class="btn2" id="osave">💾 Sauvegarde : exporter / importer</button>');$('osave').onclick=openSave}};
if(window.__sim)Object.assign(window.__sim,{saveCollect,saveEncode,saveDecode,saveSummary});

// Vivariom — fonctionnement hors ligne. Version 7417301f20 (changée à chaque assemblage).
const CACHE='vivariom-7417301f20';
const FILES=['./','index.html','manifest.webmanifest','icones/icone-192.png','icones/icone-512.png','icones/icone-192-masque.png','icones/icone-512-masque.png','icones/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  // pages : on redemande toujours au serveur s'il y a plus récent (sinon le navigateur peut garder l'ancienne 10 min)
  e.respondWith(fetch(r,r.mode==='navigate'||/\/(index\.html)?$/.test(new URL(r.url).pathname)?{cache:'no-cache'}:{}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});

// Vérifie l'appli installable (dossier web/) : fiche d'installation, mémoire hors ligne, jeu qui démarre sans réseau.
// Lance son propre petit serveur sur le dossier web/.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../web');const types={'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(root,p);
  if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,async()=>{const url=`http://127.0.0.1:${srv.address().port}/`;const errs=[];
  const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url);
  const man=await p.evaluate(async()=>{const l=document.querySelector('link[rel=manifest]');const m=await (await fetch(l.href)).json();
    const icons=await Promise.all(m.icons.map(async i=>{const r=await fetch(new URL(i.src,l.href));const bm=await createImageBitmap(await r.blob());return i.sizes===bm.width+'x'+bm.height}));return {name:m.name,display:m.display,icons}});
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.waitForTimeout(500);
  const ctrl=await p.evaluate(()=>!!navigator.serviceWorker.controller);
  await ctx.setOffline(true);await p.reload();await p.waitForTimeout(800);
  const offline=await p.evaluate(()=>!!(window.__sim&&document.getElementById('c')));
  await p.evaluate(()=>{window.__sim.startLevel(0);window.__sim.go();window.__sim.run(5)});
  const ok=man.name==='Vivariom'&&man.icons.every(Boolean)&&ctrl&&offline&&!errs.length;
  console.log('fiche',JSON.stringify(man),'\nmémoire hors ligne active',ctrl,'\njeu sans réseau',offline,'\n',ok?'OK':'ÉCHEC','errors',errs);
  await b.close();srv.close();process.exit(ok?0:1)});

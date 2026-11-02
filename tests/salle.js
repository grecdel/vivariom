// Grande salle du bac à sable : ajout par ＋, glisser-déposer à la souris, ajout/retrait d'étagère, largeur de la fiche.
const {chromium}=require('playwright');const path=require('path');const SP=process.argv[2]||path.resolve(__dirname);
(async()=>{const errs=[];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'../biome.html'));await p.waitForTimeout(300);
  await p.click('text=Bac à sable');await p.waitForTimeout(400);
  const room=()=>p.evaluate(()=>({list:JSON.parse(localStorage.getItem('biome_room')||'[]').map(v=>v.slot),racks:+localStorage.getItem('biome_racks')||2,count:document.getElementById('rcount').textContent}));
  const out=[];const r0=await room();out.push('départ '+JSON.stringify(r0));
  // ＋ sur l'emplacement r1-0-0 puis fermer la fiche
  await p.click('.slotfree[data-slot="r1-0-0"]');await p.waitForTimeout(400);
  const sheetW=await p.evaluate(()=>Math.round(document.getElementById('rsheet').getBoundingClientRect().width));
  await p.screenshot({path:SP+'/salle_fiche.png'});
  await p.click('#rsheet .sclose');await p.waitForTimeout(400);
  await p.click('.slotfree[data-slot="r2-1-1"]');await p.waitForTimeout(300);await p.click('#rsheet .sclose');await p.waitForTimeout(400);
  const r1=await room();out.push('après 2 ＋ '+JSON.stringify(r1));
  // glisser le 1er vivarium (r1-0-0) vers l'emplacement r1-2-1 à la souris
  const src=await (await p.$('.rv')).boundingBox();const dst=await (await p.$('.slotfree[data-slot="r1-2-1"]')).boundingBox();
  await p.mouse.move(src.x+src.width/2,src.y+src.height/2);await p.mouse.down();
  for(let k=1;k<=12;k++){await p.mouse.move(src.x+src.width/2+(dst.x-src.x)*k/12,src.y+src.height/2+(dst.y-src.y)*k/12);await p.waitForTimeout(16)}
  const tgtShown=await p.evaluate(()=>!!document.querySelector('.rtgt'));await p.screenshot({path:SP+'/salle_glisse.png'});
  await p.mouse.up();await p.waitForTimeout(300);
  const r2=await room();out.push('après glisser '+JSON.stringify(r2)+' cible surlignée '+tgtShown);
  // ajouter une étagère puis la retirer
  await p.click('.raddr');await p.waitForTimeout(700);const r3=await room();
  await p.screenshot({path:SP+'/salle_etagere.png'});
  await p.click('.rdel');await p.waitForTimeout(300);const r4=await room();
  out.push('étagères : ajout '+r3.racks+' ('+r3.count+') puis retrait '+r4.racks+' ('+r4.count+')');
  const ok=r1.list.length===2&&r2.list.includes('r1-2-1')&&!r2.list.includes('r1-0-0')&&tgtShown&&r3.racks===3&&r4.racks===2&&sheetW<=640&&!errs.length;
  console.log(out.join('\n'),'\nlargeur fiche',sheetW,'\n',ok?'OK':'ÉCHEC','errors',errs);await b.close();process.exit(ok?0:1)})();

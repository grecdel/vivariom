// Vérifie l'export / import de la sauvegarde entre deux « appareils » (deux navigateurs séparés).
const {chromium}=require('playwright');const path=require('path');
const url='file://'+path.resolve(__dirname,'../biome.html');
(async()=>{const errs=[];const b=await chromium.launch();
  const A=await (await b.newContext()).newPage();A.on('pageerror',e=>errs.push('A '+e.message));await A.goto(url);
  // appareil A : progression fictive + options
  await A.evaluate(()=>{localStorage.setItem('biome_done','[0,1,2,3]');localStorage.setItem('biome_stars','{"0":3,"1":2,"2":1,"3":3}');localStorage.setItem('biome_unlocked','5');localStorage.setItem('biome_opts','{"vol":40,"left":true}');localStorage.setItem('autre_cle','x')});
  await A.reload();
  const code=await A.evaluate(()=>window.__sim.saveEncode(window.__sim.saveCollect()));
  const sumA=await A.evaluate(c=>window.__sim.saveDecode(c).then(window.__sim.saveSummary),code);
  // appareil B : vierge, importe le code par l'interface
  const B=await (await b.newContext()).newPage();B.on('pageerror',e=>errs.push('B '+e.message));await B.goto(url);
  await B.evaluate(()=>localStorage.setItem('biome_done','[0]'));
  await B.click('#topt');await B.click('#osave');
  await B.fill('#svin',code);await B.waitForTimeout(300);
  const found=await B.textContent('#svmsg2');
  await B.click('#svgo');await B.click('#svgo');await B.waitForLoadState('load');await B.waitForTimeout(800);
  const after=await B.evaluate(()=>({done:localStorage.getItem('biome_done'),stars:localStorage.getItem('biome_stars'),un:localStorage.getItem('biome_unlocked'),opts:localStorage.getItem('biome_opts'),left:document.body.classList.contains('left')}));
  const bad=await B.evaluate(c=>window.__sim.saveDecode('VIVA1:abc').then(()=>'accepté',e=>e.message),code);
  const ok=after.done==='[0,1,2,3]'&&after.un==='5'&&after.left;
  console.log('code',code.length,'car.\nA :',sumA,'\nB trouvé :',found,'\nB après import :',JSON.stringify(after),'\ncode abîmé :',bad,'\n',ok?'OK':'ÉCHEC','errors',errs);
  await b.close();process.exit(ok&&!errs.length?0:1)})();

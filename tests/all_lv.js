const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message+(e.stack||'').split('\n')[1]));
await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));const n=await p.evaluate(()=>window.__sim.levels?window.__sim.levels:22);
for(let i=0;i<22;i++){await p.evaluate(i=>{window.__sim.startLevel(i);window.__sim.go()},i);
  const sp=await p.evaluate(()=>[...document.querySelectorAll('#pal .chip[data-id]')].map(b=>b.dataset.id));
  await p.evaluate(()=>{for(const id of ['fourmi','scorpion','tenebrion','bousier','rhinoceros','phasme','mante','escargot','papillon','puceron','coccinelle','cloporte','abeille','mouche','araignee','lombric','scolopendre']){try{window.__sim.tap(id,100+Math.random()*300,140)}catch(e){}}window.__sim.run(15)});
  if(i===18||i===21){await p.click('#viewsw button[data-v=ens]');await p.waitForTimeout(900);await p.click('#viewsw button[data-v=top]');await p.waitForTimeout(1600);await p.screenshot({path:'tests/final_'+i+'.png'});await p.click('#viewsw button[data-v=side]');await p.waitForTimeout(1600)}
}
console.log('errors',errs.slice(0,5));await b.close();})();

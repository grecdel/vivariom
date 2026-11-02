const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800},acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));await p.evaluate(()=>{window.__sim.startLevel(2);window.__sim.go();document.getElementById('vnav').style.display='flex'});
await p.click('#vnphoto');await p.waitForTimeout(500);
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),p.click('#phdl')]);
console.log('download',dl?dl.suggestedFilename():null,await p.evaluate(()=>document.getElementById('phmsg').textContent));console.log(errs);await b.close();})();

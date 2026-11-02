const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message+(e.stack||'').split('\n')[1]));
await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#tsand');await p.click('#radd');await p.mouse.click(200,90);await p.click('#radd');await p.waitForTimeout(300);
// link from sheet of viv2
await p.locator('#rsheet .tubes [data-l]').first().click();await p.waitForTimeout(200);await p.screenshot({path:'x1.png'});
await p.mouse.click(200,90);await p.waitForTimeout(300);await p.screenshot({path:'x2.png'});
await p.locator('.rv').first().click();await p.waitForTimeout(300);await p.click('#rsheet .cin');await p.waitForTimeout(300);
await p.evaluate(()=>{window.__sim.tap('cloporte',494,140);window.__sim.tap('cloporte',496,140);window.__sim.run(1.2)});
await p.screenshot({path:'x3.png'});console.log('v1',await p.evaluate(()=>window.__sim.crs()),await p.evaluate(()=>localStorage.getItem('biome_room')));
await p.click('#vnjournal');await p.waitForTimeout(200);await p.screenshot({path:'x4.png'});await p.click('#jclose');
await p.click('#vnsalle');await p.waitForTimeout(300);
const bb=await p.locator('.rv').nth(1).boundingBox();await p.mouse.click(bb.x+30,bb.y+20);await p.waitForTimeout(300);await p.click('#rsheet .cin');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>window.__sim.crs()));
await p.click('#vncouve');await p.waitForTimeout(200);await p.screenshot({path:'x5.png'});await p.click('#cclose');
await p.click('#vnsalle');await p.click('#rback');await p.click('#tach');await p.waitForTimeout(200);await p.screenshot({path:'x6.png'});
console.log(errs);await b.close();})();

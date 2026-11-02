const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const out=[];const errs=[];
for(const [w,h] of [[360,740],[960,600],[1280,720],[844,390]]){const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(w+':'+e.message));
 await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(200);
 await p.click('#tsand');await p.click('#radd');await p.waitForTimeout(400);
 const r=await p.evaluate(()=>{const s=document.getElementById('rsheet');const c=s.querySelector('.cin');const bb=c.getBoundingClientRect();return [Math.round(bb.bottom),innerHeight,s.scrollHeight>s.clientHeight]});
 await p.screenshot({path:`tests/fx_sheet_${w}.png`});
 out.push(`${w}x${h} sheet Entrer bottom ${r[0]} / ${r[1]} scrollable ${r[2]}`);
 await p.click('#rsheet .cin');await p.waitForTimeout(300);
 await p.click('#viewsw button[data-v=ens]');await p.waitForTimeout(900);
 const R=await p.evaluate(()=>{return [document.querySelector('#hud').getBoundingClientRect().bottom|0,document.getElementById('viewsw').getBoundingClientRect().top|0]});
 await p.screenshot({path:`tests/fx_ens_${w}.png`});out.push(`  hud bottom ${R[0]} viewsw top ${R[1]}`);
 await p.close()}
// resize during campaign
const p=await b.newPage({viewport:{width:390,height:800}});p.on('pageerror',e=>errs.push('rz:'+e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));await p.evaluate(()=>{window.__sim.startLevel(2);window.__sim.go();window.__sim.tap('abeille',200,60);window.__sim.run(20)});
const c1=await p.evaluate(()=>JSON.stringify(window.__sim.counts()));await p.setViewportSize({width:800,height:390});await p.waitForTimeout(300);await p.setViewportSize({width:390,height:800});await p.waitForTimeout(300);
const c2=await p.evaluate(()=>JSON.stringify(window.__sim.counts()));out.push('resize '+c1+' -> '+c2);
// encyclopedia from title
await p.evaluate(()=>{});await p.reload();await p.waitForTimeout(200);await p.click('#tfiche');await p.waitForTimeout(300);out.push('fiches cards '+await p.evaluate(()=>document.querySelectorAll('#fgrid .card').length));
console.log(out.join('\n'));console.log(errs);await b.close();})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));
for(let run=0;run<2;run++){await p.evaluate(()=>{window.__sim.startLevel(20);window.__sim.go()});
for(const [t,x,y] of [['bousier',100,140],['bousier',200,140],['bousier',300,140],['bousier',400,140],['bousier',250,140],['cloporte',150,140],['cloporte',350,140],['compost',120,100],['compost',280,100],['compost',420,100]])await p.evaluate(([t,x,y])=>window.__sim.tap(t,x,y),[t,x,y]);
const r=[];for(let k=0;k<6;k++){await p.evaluate(()=>window.__sim.run(40));if(k==2)await p.evaluate(()=>{window.__sim.tap('compost',200,100);window.__sim.tap('compost',350,100)});r.push(await p.evaluate(()=>JSON.stringify(window.__sim.counts())+' '+document.getElementById('hud').innerText.split('\n')[0].slice(-14)))}
console.log(r.join('\n'));}
console.log(errs.slice(0,3));await b.close();})();

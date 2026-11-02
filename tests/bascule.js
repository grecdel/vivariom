// Molette : 3/4 -> dessus -> 3/4, et images de la bascule en volume (dans le dossier donné).
const {chromium}=require('playwright');const path=require('path');const SP=process.argv[2]||'';
(async()=>{const errs=[];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'../biome.html'));
  await p.evaluate(()=>{const S=window.__sim;S.startLevel(13);S.go();S.run(40)});
  const v=()=>p.evaluate(()=>window.__sim.view);const out=[];
  await p.click('#viewsw button[data-v=ens]');await p.waitForTimeout(1200);out.push('départ '+await v());
  await p.mouse.move(640,360);await p.mouse.wheel(0,120);
  const shots=[0,180,380,560,760,1000];let t0=0;
  for(const t of shots){await p.waitForTimeout(t-t0);t0=t;if(SP)await p.screenshot({path:`${SP}/bascule_${String(t).padStart(4,'0')}.png`})}
  await p.waitForTimeout(800);out.push('après molette arrière '+await v());
  // élan : des crans toutes les 100 ms pendant 2,5 s ne doivent faire qu'une seule bascule
  await p.waitForTimeout(900);const vus=new Set();for(let k=0;k<25;k++){await p.mouse.wheel(0,120);await p.waitForTimeout(100);vus.add(await v())}
  await p.waitForTimeout(1500);const reste=await v();out.push('élan (crans rapprochés) : vues traversées '+[...vus].join(',')+' → '+reste);
  await p.waitForTimeout(900);await p.mouse.wheel(0,-120);await p.waitForTimeout(1200);out.push('molette avant en 3/4 → '+await v());
  const ok=out[0].endsWith('ens')&&out[1].endsWith('top')&&reste==='ens'&&!vus.has('side')&&out[3].endsWith('side')&&!errs.length;
  console.log(out.join('\n'),'\n',ok?'OK':'ÉCHEC','errors',errs);await b.close();process.exit(ok?0:1)})();

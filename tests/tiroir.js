// Tiroir « Bêtes » du bac à sable : une case par espèce, ordre alphabétique, variante choisie retenue.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(__dirname,'../biome.html'));await p.click('text=Bac à sable');await p.waitForTimeout(300);
  await p.click('.slotfree >> nth=0');await p.waitForTimeout(400);await p.click('#rsheet .cin');await p.waitForTimeout(1200);
  await p.evaluate(()=>{const t=document.getElementById('tuto');if(t)t.style.display='none'});
  await p.click('#pal .cat >> nth=0');await p.waitForTimeout(400);
  const noms=await p.evaluate(()=>[...document.querySelectorAll('#drawer .gcell .nm')].map(e=>e.textContent));
  const trie=[...noms].sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}));
  await p.click('.vbtn[data-grp="papillon"]');await p.waitForTimeout(300);
  const rangs=await p.evaluate(()=>[...document.querySelectorAll('.vmenu .vrow')].map(r=>r.dataset.id));
  await p.click('.vrow[data-id="chenille"]');await p.waitForTimeout(300);
  await p.waitForTimeout(1100);const aide=await p.evaluate(()=>window.__sim.aide());console.log('fiche d\'aide :',aide.slice(0,90));
  await p.click('#pal .cat >> nth=0');await p.waitForTimeout(300);
  const papillon=await p.evaluate(()=>{const c=[...document.querySelectorAll('#drawer .gcell .chip')].find(x=>x.querySelector('.nm').textContent==='Papillon');return c&&c.dataset.id});
  const ok=/Mange/i.test(aide)&&noms.length===17&&JSON.stringify(noms)===JSON.stringify(trie)&&rangs.join()==='papillon,chenille'&&papillon==='chenille'&&!errs.length;
  console.log(noms.join(', '),'\nPapillon :',rangs.join(' → '),'| retenu :',papillon,'\n',ok?'OK':'ÉCHEC','errors',errs);await b.close();process.exit(ok?0:1)})();

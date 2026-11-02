// Mesure le temps de jeu simulé pour gagner chaque niveau, comparé à son chrono.
// « Joueur » simple : pose 2 bêtes de chaque espèce, puis en remet une si une espèce disparaît.
// Usage : node tests/duree.js [niveaux, ex. 12,13] [essais]
const {chromium}=require('playwright');
const want=(process.argv[2]||'').split(',').filter(Boolean).map(Number);
const tries=+(process.argv[3]||3);
const SP=['fourmi','scorpion','tenebrion','bousier','rhinoceros','phasme','mante','escargot','papillon','puceron','coccinelle','cloporte','abeille','mouche','araignee','lombric','scolopendre'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../biome.html'));
const idx=want.length?want:[...Array(22).keys()];let rows=[];
for(const i of idx){const res=[];
  for(let k=0;k<tries;k++){
    res.push(await p.evaluate(([i,SP])=>{const S=window.__sim;S.startLevel(i);S.go();
      const put=id=>{try{S.tap(id,80+Math.random()*230,250)}catch(e){}};
      for(const id of SP){put(id);put(id)}
      let t=0,tok=-1;
      while(t<900&&S.state!=='end'){S.run(5);t+=5;if(tok<0&&S.goalT>0)tok=t-5;
        const n=S.counts();for(const id of SP)if(!(n[id]>0))put(id)}
      const e=document.getElementById('endtxt');const won=S.state==='end'&&/réussi/.test(e.innerHTML);
      const m=e.textContent.match(/pendant (\d+):(\d+)|pendant (\d+) ?s/);
      return {t,tok,won,c:JSON.stringify(S.counts())}},[i,SP]))}
  const w=res.filter(r=>r.won);const avg=w.length?Math.round(w.reduce((a,r)=>a+r.t,0)/w.length):null;
  console.log('niv',String(i).padStart(2),'gagnés',w.length+'/'+res.length,'temps moyen',avg,'|',res.map(r=>(r.won?'G':'-')+r.t+'(ok@'+r.tok+')').join(' '))}
console.log('errors',errs.slice(0,5));await b.close()})();

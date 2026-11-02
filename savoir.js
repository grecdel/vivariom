// ================= ENCYCLOPÉDIE ET DÉCOUVERTE (lot 6) =================
// fiches enrichies (taille réelle, où elle vit, anecdote), quiz qui débloque des décorations,
// découvertes à observer, carte des chapitres en forme de jardin, partage des photos.

// ---------- 42. fiches plus riches ----------
const PLUS={
 plante:{ou:"Partout où il y a de la lumière, de l'eau et un sol.",anec:"Une plante ne « mange » pas la terre : elle fabrique son sucre avec la lumière, l'air et l'eau. Le sol lui donne seulement des sels minéraux."},
 fourmi:{ou:"Lisières de forêts, sous les pierres et dans le bois mort, partout en Europe.",anec:"Une colonie de fourmis rousses peut compter plus de 100 000 ouvrières, toutes filles de la même reine, qui peut vivre plus de 20 ans."},
 puceron:{ou:"Sur les tiges tendres de presque toutes les plantes.",anec:"Au printemps, les femelles font des petits sans mâle, déjà enceintes de la génération suivante : une colonie double en quelques jours."},
 coccinelle:{ou:"Jardins, prairies, haies : partout où il y a des pucerons.",anec:"Une seule coccinelle mange plus de 5 000 pucerons dans sa vie. Ses points ne disent pas son âge : ils dépendent de l'espèce."},
 cloporte:{ou:"Sous les pierres, les écorces et les feuilles mortes humides.",anec:"Ce n'est pas un insecte mais un crustacé, cousin des crabes : il respire avec des sortes de branchies et doit rester au frais."},
 lombric:{ou:"Dans la terre des prairies et des jardins, jusqu'à 2 m de profondeur.",anec:"Charles Darwin a passé 40 ans à les étudier : selon lui, toute la terre arable est passée plusieurs fois dans leur intestin."},
 scolopendre:{ou:"Sous les pierres et dans le sol, surtout dans le Sud.",anec:"Ses premières « pattes » sont des crochets à venin. Malgré son nom de mille-pattes, elle n'en a que 21 à 23 paires."},
 araignee:{ou:"Haies, jardins et hautes herbes, de l'été à l'automne.",anec:"L'épeire mange souvent sa toile le soir pour en recycler la soie, et la retisse en moins d'une heure."},
 abeille:{ou:"Prairies fleuries ; certaines vivent en ruche, beaucoup seules dans un trou du sol.",anec:"Pour faire 1 kg de miel, les abeilles butinent l'équivalent de plusieurs millions de fleurs."},
 mouche:{ou:"Partout, surtout près de ce qui se décompose.",anec:"Ses yeux voient environ 250 images par seconde : pour elle, notre main qui approche semble aller au ralenti."},
 phasme:{ou:"Haies de ronces et buissons des régions chaudes.",anec:"Beaucoup de phasmes n'ont pas besoin de mâle : les femelles pondent des œufs qui donnent d'autres femelles."},
 mante:{ou:"Herbes hautes et friches ensoleillées.",anec:"Elle est le seul insecte capable de tourner la tête pour regarder par-dessus son épaule."},
 escargot:{ou:"Jardins, murets et haies humides.",anec:"Par temps sec, il ferme sa coquille avec un voile de mucus séché et peut dormir ainsi plusieurs mois."},
 chenille:{ou:"Sur les orties surtout, pour la petite tortue.",anec:"Dans la chrysalide, la chenille se dissout presque entièrement avant de se reconstruire en papillon."},
 papillon:{ou:"Jardins fleuris, du printemps à l'automne ; certains passent l'hiver dans les maisons.",anec:"Il goûte avec ses pattes : en se posant, il sait tout de suite si la plante convient à ses chenilles."},
 scorpion:{ou:"Garrigues sèches et pierriers du sud de la France et d'Espagne.",anec:"Sous la lumière ultraviolette, sa carapace brille en bleu-vert, même des millions d'années après, sur les fossiles."},
 tenebrion:{ou:"Greniers, moulins, bois sec et nids d'oiseaux.",anec:"Ses larves, les vers de farine, sont capables de digérer le polystyrène."},
 verfarine:{ou:"Dans la farine, le son et le bois sec.",anec:"Il ne boit presque jamais : il tire son eau de la nourriture sèche qu'il digère."},
 bousier:{ou:"Prairies pâturées et terrains sablonneux chauds.",anec:"Il se guide la nuit grâce à la Voie lactée pour rouler sa boule en ligne droite."},
 rhinoceros:{ou:"Bois mort, tas de compost et sciure.",anec:"Proportionnellement à sa taille, c'est l'un des animaux les plus forts du monde."},
 verblanc:{ou:"Dans le terreau, le compost et le bois pourri.",anec:"Il peut rester larve 2 à 4 ans avant de devenir adulte, qui ne vivra que quelques semaines."},
 grillon:{ou:"Prairies et talus ensoleillés ; il creuse un petit terrier.",anec:"On peut deviner la température en comptant ses chants : plus il fait chaud, plus il chante vite."},
 luciole:{ou:"Lisières humides, jardins et talus, surtout en juin et juillet.",anec:"Sa lumière est froide : presque toute l'énergie devient lumière, sans chaleur, bien mieux qu'une ampoule."}};
const tailleTxt=id=>{const R=REAL[id==='plante'?'':id];if(!R)return '';const mm=R[0];return mm>=10?(Math.round(mm)/10).toString().replace('.',',')+' cm':mm+' mm'};
function ficheIds(){const s=new Set(state==='menu'?LEVELS.flatMap(L=>L.sp):lvl.sp);if(state==='menu'||lvl.sandbox)['grillon','luciole','chenille','verfarine','verblanc'].forEach(id=>FICHES[id]&&s.add(id));return [...s]}
{const of=openFiches;openFiches=function(){of();const ids=ficheIds(),G=$('fgrid');
  // les espèces en plus (bac à sable, nouvelles bêtes) ont aussi leur fiche
  const have=new Set([...G.querySelectorAll('canvas')].map(c=>c.dataset.id));
  for(const id of ids)if(!have.has(id)&&FICHES[id]){const f=FICHES[id];G.insertAdjacentHTML('beforeend',`<div class="card"><canvas data-id="${id}"></canvas><b>${f.ic} ${f.nom}</b><span class="badge">${f.role}</span><p><u>Mange</u> ${f.mange}</p><p><u>Mangé par</u> ${f.par}</p><p><u>Aide</u> ${f.aide}</p><p><u>Besoins</u> ${f.besoin}</p><p><u>Comportement</u> ${f.comp}</p></div>`);
    const cv2=G.querySelector(`canvas[data-id="${id}"]`);if(SPI[id])previewSp(SPI[id],cv2)}
  G.querySelectorAll('.card').forEach(card=>{const id=card.querySelector('canvas').dataset.id,P=PLUS[id],t=tailleTxt(id);if(!P&&!t)return;
    card.querySelector('.badge').insertAdjacentHTML('afterend',`${t?`<span class="badge taille">📏 ${t}</span>`:''}${SPI[id]&&SPI[id].la?`<span class="latin">${SPI[id].la}</span>`:''}`);
    if(P)card.insertAdjacentHTML('beforeend',`<p><u>Où elle vit</u> ${P.ou}</p><p class="anec">💡 ${P.anec}</p>`)});
  const hd=fichesEl.querySelector('header');if(hd&&!$('fquiz'))hd.querySelector('h1').insertAdjacentHTML('afterend','<button id="fquiz">🧠 Quiz</button><button id="fdec">🔎 Découvertes</button>');
  $('fquiz').onclick=()=>quiz();$('fdec').onclick=()=>decouvertes()}}

// ---------- 44. découvertes à observer ----------
const DECOUV=[
 {k:'eclosion',ic:'🥚',nom:'Une éclosion',txt:"Voir des petits sortir de leurs œufs.",re:/Éclosion/},
 {k:'chasse',ic:'🎯',nom:'Une chasse',txt:"Voir un prédateur attraper sa proie.",re:/ a mangé : /},
 {k:'meta',ic:'🦋',nom:'Une métamorphose',txt:"Voir une chrysalide ou une nymphe devenir adulte.",re:/devient adulte|devient ténébrion|devenue papillon|devient un scarabée|se change en/},
 {k:'colonie',ic:'👑',nom:'Une fondation',txt:"Voir une reine fonder sa colonie.",re:/reine|colonie/i},
 {k:'toile',ic:'🕸',nom:'Un piège de soie',txt:"Voir une bête se prendre dans une toile.",re:/toile/},
 {k:'ailes',ic:'🪽',nom:'Des pucerons ailés',txt:"Voir des pucerons s'envoler d'une plante surpeuplée.",re:/pucerons ailés/},
 {k:'dos',ic:'🦂',nom:'Sur le dos de maman',txt:"Voir des petits scorpions portés par leur mère."},
 {k:'lueur',ic:'✨',nom:'La lueur du ver luisant',txt:"Voir un ver luisant briller la nuit."},
 {k:'chant',ic:'🎶',nom:'Le chant du grillon',txt:"Entendre (ou voir) un grillon chanter la nuit."},
 {k:'dionee',ic:'🪤',nom:'Une plante carnivore',txt:"Voir une dionée refermer son piège.",re:/dionée a (attrapé|mangé)/},
 {k:'guerre',ic:'⚔',nom:'Une guerre de fourmis',txt:"Voir deux colonies s'affronter.",re:/Bataille/},
 {k:'malade',ic:'🍄',nom:'Un champignon',txt:"Voir une bête attaquée par un champignon.",re:/champignon attaque/},
 {k:'moisi',ic:'🧫',nom:'Des moisissures',txt:"Voir des moisissures sur un sol détrempé.",re:/moisissures/},
 {k:'germe',ic:'🌱',nom:'Une graine qui germe',txt:"Voir une graine germer toute seule.",re:/graine a germé/},
 {k:'ponte',ic:'🥚',nom:'Une ponte',txt:"Voir une bête pondre ses œufs.",re:/pond/}];
let DEC=LS.get('biome_decouv',{});
ACH_LIST.push({k:'decouv',ic:'🔎',nom:'Naturaliste',txt:"Toutes les découvertes observées."},{k:'quiz',ic:'🧠',nom:'Savant',txt:"Un quiz sans faute."});
function decouvre(k){if(DEC[k])return;const D=DECOUV.find(d=>d.k===k);if(!D)return;DEC[k]=Date.now();LS.set('biome_decouv',DEC);
  toast(`🔎 Découverte : ${D.ic} <b>${D.nom}</b><br><small>${Object.keys(DEC).length}/${DECOUV.length} dans l'encyclopédie</small>`);if(DECOUV.every(d=>DEC[d.k]))ach('decouv')}
{const jl=jlog;jlog=function(ic,txt){jl(ic,txt);if(state!=='play')return;for(const D of DECOUV)if(D.re&&!DEC[D.k]&&D.re.test(txt))decouvre(D.k)}}
let decT=0;
{const up=update;update=function(dt){up(dt);if(state!=='play')return;decT-=dt;if(decT>0)return;decT=2;
  if(!DEC.dos&&creatures.some(c=>c.dos&&!c.dead))decouvre('dos');
  if(!isDay()){if(!DEC.lueur&&creatures.some(c=>!c.dead&&c.sp.id==='luciole'))decouvre('lueur');if(!DEC.chant&&creatures.some(c=>!c.dead&&c.sp.id==='grillon'&&c.chante))decouvre('chant')}}}
function decouvertes(){const O=ovl('decp'),n=Object.keys(DEC).length;
  O.innerHTML=`<div class="box"><div class="mhead"><h1>🔎 Découvertes</h1><span class="dim">${n}/${DECOUV.length}</span><button class="back" id="dclose">Fermer</button></div><p class="dim">Des moments de vie à observer dans tes vivariums. Chaque découverte s'ajoute ici avec sa date.</p>
   <div class="decs">${DECOUV.map(d=>DEC[d.k]?`<div class="dec on"><span>${d.ic}</span><div><b>${d.nom}</b><small>${d.txt} · ${new Date(DEC[d.k]).toLocaleDateString('fr-FR')}</small></div></div>`:`<div class="dec"><span>❔</span><div><b>???</b><small>${d.txt}</small></div></div>`).join('')}</div></div>`;
  $('dclose').onclick=()=>{O.style.display='none'}}

// ---------- 43. quiz ----------
const pick1=a=>a[Math.floor(Math.random()*a.length)],melange=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const ANIM=()=>Object.keys(FICHES).filter(id=>id!=='plante'&&SPI[id]&&PLUS[id]&&REL[id]);
function questions(){const Q=[],ids=ANIM();
  const q1=()=>{const id=pick1(ids.filter(i=>REL[i].par&&REL[i].par.some(p=>FICHES[p.split(':')[0]])));if(!id)return null;const bons=REL[id].par.map(p=>p.split(':')[0]).filter(p=>FICHES[p]);const bon=pick1(bons);
    const mangeBetes=x=>(REL[x].mange||[]).some(m=>FICHES[m.split(':')[0]]&&m!=='plante')||SCORP_PREY[id]&&x==='scorpion'||x==='mante'||x==='araignee'||x==='scolopendre'||x==='luciole';const faux=melange(ids.filter(i=>!bons.includes(i)&&i!==id&&!mangeBetes(i))).slice(0,3);if(faux.length<3)return null;return {q:`Qui mange ${FICHES[id].ic} ${FICHES[id].nom.toLowerCase()} ?`,r:melange([bon,...faux]).map(i=>[FICHES[i].ic+' '+FICHES[i].nom,i===bon])}};
  const q2=()=>{const L=melange(ids.filter(i=>REAL[i])).slice(0,4);if(L.length<4)return null;const g=L.reduce((a,b)=>REAL[a][0]>REAL[b][0]?a:b);return {q:'Laquelle de ces bêtes est la plus grande ?',r:L.map(i=>[FICHES[i].ic+' '+FICHES[i].nom,i===g])}};
  const q3=()=>{const id=pick1(ids),faux=melange(ids.filter(i=>i!==id)).slice(0,3);return {q:`Où vit ${FICHES[id].ic} ${FICHES[id].nom.toLowerCase()} ?`,r:melange([id,...faux]).map(i=>[PLUS[i].ou,i===id])}};
  const q4=()=>{const id=pick1(ids),faux=melange(ids.filter(i=>i!==id)).slice(0,3);return {q:`À qui correspond cette anecdote ? « ${FICHES[id].nom.split(/[ ']/).filter(w=>w.length>3).reduce((t,w)=>t.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'')+'[a-zà-ÿ]*','ig'),'…'),PLUS[id].anec)} »`,r:melange([id,...faux]).map(i=>[FICHES[i].ic+' '+FICHES[i].nom,i===id])}};
  const F=[q1,q2,q3,q4,q1];let g=0;while(Q.length<5&&g++<40){const q=pick1(F)();if(q&&!Q.some(o=>o.q===q.q))Q.push(q)}return Q}
// récompenses : décorations de la salle réservées aux savants
function recompensesQuiz(){if(LS.get('biome_quiz',0)>=1){STYLE_OPTS.cadre.or=['Or',['#4a3510','#f0c860','#a07a28']];STYLE_OPTS.mur.jungle=['Jungle','repeating-linear-gradient(115deg,#13241a 0 30px,#1a3022 30px 60px)']}
  if(LS.get('biome_quiz',0)>=3)STYLE_OPTS.sol.mousse=['Mousse','radial-gradient(circle at 30% 30%,#3a5a2a,#1e3418)']}
recompensesQuiz();
function quiz(){const Q=questions();let i=0,ok=0;const O=ovl('quizp');
  const show=()=>{if(i>=Q.length){const parfait=ok===Q.length;let msg='';if(parfait){const n=LS.get('biome_quiz',0)+1;LS.set('biome_quiz',n);ach('quiz');recompensesQuiz();
        msg=n===1?'🎁 Débloqué : le cadre <b>Or</b> et le mur <b>Jungle</b> pour ta grande salle (🎨).':n===3?'🎁 Débloqué : le sol <b>Mousse</b> pour ta grande salle (🎨).':`Quiz parfaits : ${n}. ${n<3?`Encore ${3-n} pour une nouvelle décoration.`:''}`}
      O.innerHTML=`<div class="box" style="text-align:center"><h1>${parfait?'🏆':'🧠'} ${ok}/${Q.length}</h1><p>${parfait?'Sans faute, bravo !':'Relis les fiches et retente ta chance : un sans-faute débloque des décorations.'}</p>${msg?`<p>${msg}</p>`:''}<button class="btn" id="qagain">Rejouer</button><button class="btn2" id="qclose">Fermer</button></div>`;
      $('qagain').onclick=quiz;$('qclose').onclick=()=>{O.style.display='none'};return}
    const q=Q[i];O.innerHTML=`<div class="box"><div class="mhead"><h1>🧠 Question ${i+1}/${Q.length}</h1><button class="back" id="qclose">Fermer</button></div><p class="qq">${q.q}</p><div class="qr">${q.r.map((r,j)=>`<button class="btn2" data-j="${j}">${r[0]}</button>`).join('')}</div><p id="qmsg" class="dim"></p></div>`;
    $('qclose').onclick=()=>{O.style.display='none'};
    O.querySelectorAll('.qr button').forEach(b=>b.onclick=()=>{const j=+b.dataset.j,bon=q.r[j][1];if(bon)ok++;O.querySelectorAll('.qr button').forEach((x,k)=>{x.disabled=true;if(q.r[k][1])x.classList.add('bon');else if(k===j)x.classList.add('faux')});
      $('qmsg').textContent=bon?'✔ Bonne réponse !':'✗ Raté…';setTimeout(()=>{i++;show()},1100)})};
  show()}

// ---------- 45. la carte des chapitres, en forme de jardin ----------
let CARTE=LS.get('biome_carte',true);
{const sm=showMenu;showMenu=function(){sm();const M=$('menu'),box=M.querySelector('.box');if(!box)return;const head=box.querySelector('.mhead');
  head.insertAdjacentHTML('beforeend',`<button class="back" id="mcarte">${CARTE?'☰ Liste':'🗺 Carte'}</button>`);$('mcarte').onclick=()=>{CARTE=!CARTE;LS.set('biome_carte',CARTE);showMenu()};
  if(!CARTE)return;const chaps=[...box.querySelectorAll('.chap')];chaps.forEach(c=>c.style.display='none');
  const C=CHAPTERS.filter(c=>!c.soon),n=C.length,H=Math.max(560,n*120),pts=C.map((c,k)=>({x:k%2?72:28,y:60+k*(H-120)/Math.max(1,n-1)}));
  // chemin sinueux entre les étapes (coordonnées en % de largeur, px de hauteur)
  let path='';pts.forEach((p,k)=>{if(!k){path+=`M ${p.x} ${p.y}`;return}const q=pts[k-1],my=(p.y+q.y)/2;path+=` C ${q.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`});
  const D=LS.get('biome_defis',{});
  let h=`<div class="carte" style="height:${H}px"><svg viewBox="0 0 100 ${H}" preserveAspectRatio="none"><path d="${path}" fill="none" stroke="#c8a870" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".55"/><path d="${path}" fill="none" stroke="#f0e0b0" stroke-width="1" stroke-dasharray="4 7" vector-effect="non-scaling-stroke" opacity=".6"/></svg>`;
  for(let k=0;k<12;k++){const x=(k*37)%95,y=(k*173)%H;h+=`<span class="deco" style="left:${x}%;top:${y}px">${['🌿','🌼','🍄','🪨','🌾','🌸'][k%6]}</span>`}
  C.forEach((c,k)=>{const ci=CHAPTERS.indexOf(c),nd=c.lv.filter(i=>done.has(i)).length,open=isOpen(c.lv[0]),fini=nd===c.lv.length,p=pts[k];
    h+=`<button class="etape ${open?'':'lock'} ${fini?'fini':''}" data-ch="${ci}" style="left:calc(${p.x}% - 34px);top:${p.y-34}px"><span class="eic">${open?c.ic:'🔒'}</span><b>${ci+1}. ${c.nom}</b><small>${nd}/${c.lv.length}${D[ci]?' · ⚔'+'★'.repeat(D[ci]):''}</small></button>`});
  h+='</div>';box.insertAdjacentHTML('beforeend',h);
  box.querySelectorAll('.etape').forEach(b=>b.onclick=()=>{const ci=+b.dataset.ch,c=CHAPTERS[ci];if(!isOpen(c.lv[0]))return;const O=ovl('chapp'),fini=c.lv.every(i=>done.has(i));
    O.innerHTML=`<div class="box"><div class="mhead"><h1>${c.ic} ${c.nom}</h1><button class="back" id="cclose">Fermer</button></div><p class="dim">${c.txt}</p><div class="lvs">${c.lv.map(i=>`<button class="lv ${isOpen(i)?'':'lock'}" data-i="${i}"><b>${i+1}</b><span>${LEVELS[i].nom}</span><small>${LEVELS[i].sp.map(id=>FICHES[id].ic).join('')}</small>${done.has(i)?`<em>${'★'.repeat(STARS[i]||1)}${'☆'.repeat(3-(STARS[i]||1))}</em>`:''}</button>`).join('')}
      <button class="lv defi ${fini?'':'lock'}" data-defi="1"><b>⚔</b><span>Défi du chapitre</span><small>${fini?'Règles Expert, chrono plus long':'🔒 Termine le chapitre'}</small></button></div></div>`;
    $('cclose').onclick=()=>{O.style.display='none'};
    O.querySelectorAll('.lv').forEach(x=>x.onclick=()=>{if(x.dataset.defi){if(fini){O.style.display='none';startSpecial({type:'defi',ch:ci,i:c.lv[c.lv.length-1]})}return}const i=+x.dataset.i;if(isOpen(i)){O.style.display='none';startLevel(i)}})})}}

// ---------- 50. partager ses photos ----------
{const tp=takePhoto;takePhoto=function(){tp();const m=$('phmsg');if(!m||!navigator.share)return;m.insertAdjacentHTML('beforebegin','<button class="btn2" id="phshare">↗ Partager la photo</button>');
  $('phshare').onclick=async()=>{try{const img=document.querySelector('#photop img'),b=await (await fetch(img.src)).blob(),f=new File([b],'vivariom.png',{type:'image/png'});
    await navigator.share({files:[f],title:'Mon vivarium',text:'Mon vivarium dans Vivariom 🐜 https://grecdel.github.io/vivariom/'})}catch(e){}}}}
if(window.__sim){window.__sim.quiz=()=>questions().map(q=>q.q+' → '+q.r.find(r=>r[1])[0]);window.__sim.decouv=()=>Object.keys(DEC).join(',');window.__sim.decouvre=decouvre}

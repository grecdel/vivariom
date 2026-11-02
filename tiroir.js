// ---------- tiroir « Bêtes » : une case par espèce, en ordre alphabétique, variantes dans une liste déroulante ----------
// Groupes : l'espèce de base, ses variantes (VARS) et ses larves (chenille -> papillon, vers -> adultes).
const LARVE_DE={chenille:'papillon',verfarine:'tenebrion',verblanc:'rhinoceros'};
// nom court de l'espèce (la case regroupe plusieurs variantes : « Fourmi » plutôt que « Fourmi rousse »)
const GROUPE_NOM={araignee:'Araignée',rhinoceros:'Rhinocéros'};
const grpOf=id=>{const b=baseOf(id);return LARVE_DE[b]||b};
const grpNom=g=>GROUPE_NOM[g]||(FICHES[g]?FICHES[g].nom.split(' ')[0]:g);
const VSEL=LS.get('biome_vsel',{});
function beastGroups(ids){const G=new Map();for(const id of ids){const g=grpOf(id);if(!G.has(g))G.set(g,[]);G.get(g).push(id)}
  for(const [g,L] of G){const rang=id=>id===g?0:LARVE_DE[baseOf(id)]?2:1;L.sort((a,b)=>rang(a)-rang(b)||spName(a).localeCompare(spName(b),'fr',{sensitivity:'base'}))}
  return [...G.entries()].sort((a,b)=>grpNom(a[0]).localeCompare(grpNom(b[0]),'fr',{sensitivity:'base'}))}
function grpCur(g,L){const s=VSEL[g];return L.includes(s)?s:L[0]}
function varLabel(id,g){if(id===g)return '';return LARVE_DE[baseOf(id)]?nameOf(id)+' (larve)':nameOf(id)}
function openDrawerBetes(){drawer='betes';const d=document.getElementById('drawer');
  const groups=beastGroups(catItems('betes'));
  d.innerHTML=`<div class="dhead"><b>${CATS.betes.ic} ${CATS.betes.nom}</b><span class="dim">touche pour prendre · ▾ pour les variantes</span><button class="dx">✕</button></div><div class="dgrid">${groups.map(([g,L])=>{const c=grpCur(g,L),vl=varLabel(c,g);
    return `<div class="gcell"><button class="chip ${L.length>1?'grp':''}" data-id="${c}"><canvas></canvas><span class="nm">${grpNom(g)}</span><span class="vn">${vl||'&nbsp;'}</span><span class="st"></span></button>${L.length>1?`<button class="vbtn" data-grp="${g}" title="Choisir une variante">▾ ${vl||L.length+'<span class="vlong"> variantes</span>'}</button>`:''}</div>`}).join('')}</div>`;
  d.style.display='block';wireChips(d);d.querySelector('.dx').onclick=()=>{closeDrawer();renderBar()};
  d.querySelectorAll('.vbtn').forEach(b=>b.onclick=e=>{e.stopPropagation();const g=b.dataset.grp,L=groups.find(x=>x[0]===g)[1];openVarMenu(b.closest('.gcell'),g,L)});
  refreshPalette()}
function openVarMenu(cell,g,L){const d=document.getElementById('drawer');let m=d.querySelector('.vmenu');if(m){const same=m.dataset.grp===g;m.remove();if(same)return}
  const cur=grpCur(g,L);m=document.createElement('div');m.className='vmenu';m.dataset.grp=g;
  m.innerHTML=`<div class="vmh">${grpNom(g)}<button class="vx" title="Fermer">✕</button></div>`+L.map(id=>{const sp=spOf(id);
    return `<button class="vrow ${id===cur?'on':''}" data-id="${id}"><canvas></canvas><span><b>${spName(id)}</b>${LARVE_DE[baseOf(id)]?' <i>larve</i>':''}<small>${sp&&sp.vla?sp.vla:(SPI[baseOf(id)]&&SPI[baseOf(id)].la)||''}</small></span></button>`}).join('');
  d.appendChild(m);
  // sous la case, sans sortir du tiroir
  const dr=d.getBoundingClientRect(),cr=cell.getBoundingClientRect(),mw=Math.min(280,dr.width-16);m.style.width=mw+'px';
  m.style.left=Math.max(8,Math.min(cr.left-dr.left,dr.width-mw-8))+'px';m.style.top=(cr.bottom-dr.top+d.scrollTop+4)+'px';
  m.querySelectorAll('.vrow').forEach(r=>{previewSp(spOf(r.dataset.id),r.querySelector('canvas'));r.onclick=()=>{VSEL[g]=r.dataset.id;LS.set('biome_vsel',VSEL);pickTool(r.dataset.id,false)}});
  m.querySelector('.vx').onclick=()=>m.remove();
  const mb=m.getBoundingClientRect();if(mb.bottom>dr.bottom)d.scrollTop+=mb.bottom-dr.bottom+8}
const openDrawer0=openDrawer;openDrawer=function(c){if(c==='betes')openDrawerBetes();else openDrawer0(c)};
// choisir directement une case garde aussi la variante en mémoire
const pickTool0=pickTool;pickTool=function(id,fromDrawer){if(id&&(SPI[baseOf(id)]||VSP[id])){VSEL[grpOf(id)]=id;LS.set('biome_vsel',VSEL)}return pickTool0(id,fromDrawer)};
if(window.__sim)window.__sim.beastGroups=()=>beastGroups(catItems('betes')).map(([g,L])=>grpNom(g)+':'+L.length);

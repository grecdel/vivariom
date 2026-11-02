// ================= CORRECTIFS DE RECETTE =================
// HUD : le sélecteur de vues et la barre de gauche se placent sous le HUD, quelle que soit sa hauteur
{const hud2=hud;hud=function(){hud2();try{const hb=Math.max(66,hudEl.getBoundingClientRect().bottom+4);$('viewsw').style.top=hb+'px';$('vnav').style.top=(hb+38)+'px';$('vstrip').style.top=(hb+76)+'px'}catch(e){}}}
// bête minuscule à l'écran : dessin simplifié (rapide), avec sa couleur et son orientation
function drawTiny(c){const L=realLen(c),a=Math.cos(c.ang)>=0?0:Math.PI,rot=c.fly?0:(c.sp.chain?Math.atan2(Math.sin(c.ang),Math.cos(c.ang)):a);
  if(!FIN()){ctx.fillStyle=c.cLine||'#cfc';ctx.beginPath();ctx.ellipse(c.x,c.y-L*0.25,L*0.5,Math.max(0.6,L*0.2),rot,0,TAU);ctx.fill();return}
  // mini silhouette : corps fin + pattes en traits (pas de tache)
  const col=NAT()?natLine(c):(c.cLine||'#cfc'),px=1/camZ,h=Math.max(0.35*px*2,L*0.13);ctx.save();ctx.translate(c.x,c.y-Math.max(h,L*0.12));ctx.rotate(rot);
  if(!c.fly&&!c.sp.chain&&L*camZ>=2.5){ctx.strokeStyle=col;ctx.globalAlpha=0.75;ctx.lineWidth=Math.max(0.6*px,L*0.04);ctx.beginPath();for(const q of [-0.3,0,0.3]){ctx.moveTo(q*L,0);ctx.lineTo(q*L+L*0.12,h*2.4)}ctx.stroke()}
  ctx.globalAlpha=1;ctx.fillStyle=NAT()?natFill(c):col;ctx.beginPath();ctx.ellipse(0,0,L*0.48,h,0,0,TAU);ctx.fill();if(NAT()){ctx.strokeStyle=col;ctx.lineWidth=0.6*px;ctx.stroke()}ctx.restore()}
// retour du briefing vers la liste des niveaux
$('bbrief').onclick=()=>{$('brief').style.display='none';showMenu()};
// noms courts lisibles pour les larves
{const nameOf0=nameOf;nameOf=function(id){return {verfarine:'V. farine',verblanc:'V. blanc',tenebrion:'Ténébrion',rhinoceros:'Rhinocéros'}[id]||nameOf0(id)}}
// le cloporte et la pierre plate n'ont plus le même symbole
FICHES.cloporte.ic='🪳';
// noms de bacs : on retire les caractères qui pourraient casser l'affichage
for(const v of ROOM.list)if(v.name)v.name=String(v.name).replace(/[<>&"'`]/g,'').slice(0,24);
// sauvegarde impossible (mémoire du navigateur pleine) : on prévient au lieu de perdre en silence
{const set0=LS.set;let warned=0;LS.set=function(k,v){const ok=set0.call(LS,k,v);if(!ok&&Date.now()-warned>20000){warned=Date.now();toast('⚠ Sauvegarde impossible : la mémoire du navigateur est pleine.<br><small>Retire des vivariums inutilisés dans la grande salle.</small>')}return ok}}
// effacer la progression : tout, sauf les options et la décoration de la salle, puis on recharge
{const oo=openOpts;openOpts=function(){oo();const b=$('oreset');if(!b)return;let arm=false;b.onclick=()=>{if(!arm){arm=true;b.textContent='⚠ Toucher encore pour tout effacer';return}
  try{for(const k of Object.keys(localStorage))if(k.startsWith('biome_')&&k!=='biome_opts'&&k!=='biome_style')localStorage.removeItem(k)}catch(e){}location.reload()}};$('topt').onclick=()=>openOpts()}
// iOS n'applique l'effet d'appui (:active) qu'avec un écouteur de toucher sur la page
document.addEventListener('touchstart',()=>{},{passive:true});

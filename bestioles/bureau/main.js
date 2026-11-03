// Vivariom — Bestioles pour Windows et Linux. © 2026 grecdel — tous droits réservés.
// Une icône près de l'horloge allume ou éteint des bestioles qui vivent sur l'écran, par-dessus les fenêtres.
const {app,BrowserWindow,Tray,Menu,ipcMain,screen,nativeImage,shell}=require('electron');
const path=require('path'),fs=require('fs'),os=require('os');

if(process.platform==='linux'){app.commandLine.appendSwitch('enable-transparent-visuals');app.disableHardwareAcceleration()}
if(!app.requestSingleInstanceLock()){app.quit()}

let fen=null,icone=null,suivi=null,fond=null;

// ----- un vivarium vivant en fond d'écran (le jeu Vivariom en « visite guidée », derrière les fenêtres) -----
function fondOn(){if(fond)return;const d=screen.getPrimaryDisplay(),b=d.bounds;
  fond=new BrowserWindow({x:b.x,y:b.y,width:b.width,height:b.height,frame:false,resizable:false,movable:false,skipTaskbar:true,focusable:false,show:false,
    type:process.platform==='linux'?'desktop':undefined,backgroundColor:'#000000',webPreferences:{contextIsolation:true,nodeIntegration:false}});
  fond.setAlwaysOnTop(false);
  fond.loadFile(path.join(__dirname,'jeu','index.html'),{query:{fond:'1'}});
  fond.once('ready-to-show',()=>{if(!fond)return;fond.showInactive();if(process.platform!=='linux')fond.blur()});
  fond.on('closed',()=>{fond=null;majMenu()});majMenu()}
function fondOff(){if(fond){fond.destroy();fond=null}majMenu()}

function allumer(){
  if(fen)return;
  const d=screen.getPrimaryDisplay(),z=d.workArea; // sans couvrir la barre des tâches
  fen=new BrowserWindow({x:z.x,y:z.y,width:z.width,height:z.height,transparent:true,frame:false,resizable:false,movable:false,
    alwaysOnTop:true,skipTaskbar:true,hasShadow:false,focusable:process.platform!=='linux',show:false,backgroundColor:'#00000000',
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:false,nodeIntegration:false}});
  fen.setAlwaysOnTop(true,'screen-saver');
  fen.setVisibleOnAllWorkspaces(true);
  fen.setIgnoreMouseEvents(true,{forward:true});
  fen.loadFile(path.join(__dirname,'page','index.html'));
  fen.once('ready-to-show',()=>fen&&fen.showInactive());
  fen.on('closed',()=>{fen=null;majMenu()});
  // suivre la souris : la page décide si elle est sur une bête (les clics ne traversent alors plus)
  suivi=setInterval(()=>{if(!fen)return;const p=screen.getCursorScreenPoint(),b=fen.getBounds();fen.webContents.send('curseur',p.x-b.x,p.y-b.y)},60);
  majMenu();
}
function eteindre(){if(suivi){clearInterval(suivi);suivi=null}if(fen){fen.destroy();fen=null}majMenu()}
function basculer(){fen?eteindre():allumer()}
// options (ajouter, nourrir, réglages) : le menu s'ouvre au milieu de l'écran
function options(){const go=()=>{if(!fen)return;fen.setIgnoreMouseEvents(false);fen.webContents.executeJavaScript('Bestioles.options()').catch(()=>{});if(process.platform!=='linux')fen.focus()};
  if(fen)go();else{allumer();fen.webContents.once('did-finish-load',()=>setTimeout(go,300))}}

ipcMain.on('interactif',(_e,v)=>{if(fen)fen.setIgnoreMouseEvents(!v,{forward:true})});
ipcMain.on('eteindre',()=>eteindre());
ipcMain.on('jeu',(_e,u)=>{if(u==='https://grecdel.github.io/vivariom/')shell.openExternal(u)});

// ----- lancement au démarrage de l'ordinateur -----
const autostartLinux=path.join(os.homedir(),'.config','autostart','bestioles.desktop');
function demarrageAuto(){
  if(process.platform==='linux')return fs.existsSync(autostartLinux);
  return app.getLoginItemSettings({path:process.env.PORTABLE_EXECUTABLE_FILE||process.execPath}).openAtLogin}
function reglerDemarrageAuto(oui){
  if(process.platform==='linux'){
    const exe=process.env.APPIMAGE||process.execPath;
    if(oui){fs.mkdirSync(path.dirname(autostartLinux),{recursive:true});fs.writeFileSync(autostartLinux,`[Desktop Entry]\nType=Application\nName=Bestioles\nComment=Petites bêtes de Vivariom sur l'écran\nExec="${exe}"\nX-GNOME-Autostart-enabled=true\n`)}
    else if(fs.existsSync(autostartLinux))fs.unlinkSync(autostartLinux);
  }else app.setLoginItemSettings({openAtLogin:oui,path:process.env.PORTABLE_EXECUTABLE_FILE||process.execPath});
  majMenu()}

function majMenu(){if(!icone)return;
  icone.setToolTip(fen?'Bestioles : allumées (clic pour éteindre)':'Bestioles : éteintes (clic pour allumer)');
  icone.setContextMenu(Menu.buildFromTemplate([
    {label:fen?'Éteindre les bestioles':'Allumer les bestioles',click:basculer},
    {label:'⚙ Options…',click:options},
    {label:'🎮 Jouer à Vivariom',click:()=>shell.openExternal('https://grecdel.github.io/vivariom/')},
    {label:'Vivarium en fond d\'écran',type:'checkbox',checked:!!fond,click:(it)=>it.checked?fondOn():fondOff()},
    {type:'separator'},
    {label:'Lancer au démarrage de l\'ordinateur',type:'checkbox',checked:demarrageAuto(),click:(it)=>reglerDemarrageAuto(it.checked)},
    {type:'separator'},
    {label:'Quitter',click:()=>{eteindre();app.quit()}}]))}

app.whenReady().then(()=>{
  const img=nativeImage.createFromPath(path.join(__dirname,'icone.png')).resize({width:process.platform==='win32'?16:22});
  icone=new Tray(img);
  icone.on('click',basculer); // Windows : un clic sur l'icône allume ou éteint (Linux : par le menu)
  majMenu();
  setTimeout(allumer,process.platform==='linux'?400:0);
});
app.on('second-instance',()=>{if(!fen)allumer()});
app.on('window-all-closed',()=>{/* l'icône près de l'horloge reste : on ne quitte pas */});

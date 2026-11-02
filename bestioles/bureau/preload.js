// Vivariom — Bestioles (Windows, Linux). © 2026 grecdel — tous droits réservés.
// Lien entre la page des bestioles et l'appli : laisser passer les clics sauf sur une bête ou sur son menu.
const {ipcRenderer}=require('electron');
window.bestiolesHote={
  interactif:(v)=>ipcRenderer.send('interactif',!!v),
  eteindre:()=>ipcRenderer.send('eteindre')
};
// position de la souris envoyée par l'appli (nécessaire sur Linux)
ipcRenderer.on('curseur',(_e,x,y)=>{if(window.Bestioles&&window.Bestioles.survol)window.Bestioles.survol(x,y)});

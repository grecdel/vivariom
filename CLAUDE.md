# Vivariom — notes pour Claude

Jeu web « Vivariom » : un vivarium virtuel d'insectes, en un seul fichier HTML/canvas. Le jeu tourne sur mobile (Android) et sur ordinateur.

© 2026 grecdel — tous droits réservés. Le code n'est pas libre.

## L'utilisateur
- Toujours répondre **en français**.
- Il n'a aucune connaissance en programmation : il teste sur son téléphone et donne son avis. Explique en mots simples, sans jargon.
- Avant un gros changement visuel, propose-lui des prototypes à comparer.

## Construire le jeu
```
python3 assemble.py        # produit biome.html (le jeu complet) et le dossier web/ (appli installable)
```
- `web/` : à mettre en ligne tel quel (index.html, manifest.webmanifest, sw.js pour le hors-ligne, icones/). Il est versionné dans git. Les icônes se refont avec `python3 icones.py`.
- Linux, PC et Android = la même appli web installable (« Installer » dans Chrome/Edge). Pas d'appli native pour l'instant.
`vivariom.html` est la dernière version validée par l'utilisateur (copie de biome.html, mise à jour le 2026-11-02, version en ligne à cette date).

`assemble.py` :
- extrait des fonctions de dessin de `vivarium.html` (drawCreature, drawWaves…) ;
- les colle avec les autres JS dans une seule IIFE ;
- contient aussi le HTML et le CSS de l'interface.

Ordre des fichiers :
- **core** : biome_core.js, variants.js, unlocks.js, decor.js, topview.js, profile.js, devices.js, links.js, lure.js, species2.js, species3.js
- **main** : biome_main.js, menu.js, extras.js, tutorial.js, ambiance.js, save.js, bascule.js, tiroir.js, soie.js, instincts.js, decor_top.js, aide.js, ctrl.js, defis.js, langue.js, fixes.js (il remplace certaines fonctions)
- **ajouts** (boucle à part dans assemble.py, après fixes.js) : progres.js, vie.js, milieu.js, salle2.js, confort.js, savoir.js

## Repères
- **Monde** :
  - grille en mm, CS = 2,5 mm ; COLS/ROWS/ZD dépendent du format (FORMATS : std, fourmi, grand, cube) ;
  - profondeur z sur les bêtes, les plantes et les objets.
- **Vues** : coupe (2D), 3/4 (`zT`/`zP`, décors en sprites hors écran) et dessus (topview.js, à l'échelle réelle).
  - Molette / pincement (`zoomAt`, devices.js) : coupe ⇄ 3/4 ⇄ dessus ; en dessus, la molette zoome, et au zoom minimum la molette arrière ramène en 3/4. Pause de 650 ms après chaque bascule (`vsT`) et nouveau geste exigé pour la molette (l'élan est ignoré).
  - Bascule 3/4 ⇄ dessus : bascule.js dessine un pavé en volume (face avant = coupe, dessus = vue de dessus, paroi droite) qui se redresse, avec fondu vers les vraies vues aux deux bouts.
- **Campagne** :
  - difficulté (defis.js, clé `biome_diff`, Normal par défaut) : Facile = comme avant ; Normal/Expert = réserves ×0,75/×0,5, objectif de naissances (1 ou 2 par espèce animale du niveau, sauf pucerons, mouches et espèces lentes) avant que le chrono avance, coups durs annoncés (canicule, nuit froide, panne du programmateur, invasion de pucerons, scolopendre intruse), étoiles ★★★ = deux fois les naissances demandées. `checkGoal` est remplacé dans defis.js. Tests : `DIFF=normal node tests/duree.js`.
  - 22 niveaux en 9 chapitres (CHAPTERS/LEVELS dans biome_core.js) ;
  - récompenses et déblocages dans unlocks.js ;
  - étoiles, reprise de partie (`biome_resume`), tutoriel.
- **Bac à sable** (menu.js) :
  - tout est débloqué ;
  - grande salle avec racks contre le mur (ROOM, roomGeom, fiche `#rsheet`) : 2 étagères au départ, jusqu'à RACK_MAX (clé `biome_racks`) ; « ＋ » sur chaque emplacement libre (`.slotfree`), étagère à ajouter en pointillé (`.raddr`), dernière étagère vide retirable (`.rdel`) ; glisser-déposer immédiat à la souris, après appui maintenu au doigt ;
  - style, couveuse, tubes entre bacs ;
  - fiche d'aide (aide.js, `#aide`) quand on prend une bête : ce qu'elle mange, qui la mange (table `REL`, avec le nombre présent dans le bac) et ses besoins ; masquable (✕), cachée si l'option « Messages d'aide » est coupée.
- **Espèces** :
  - variantes (VARS/VSP dans variants.js) ;
  - tiroir « Bêtes » (tiroir.js) : une case par espèce (variantes + larves regroupées : chenille→papillon, ver de farine→ténébrion, ver blanc→rhinocéros), ordre alphabétique des noms courts, bouton « ▾ n » qui ouvre la liste des variantes ; dernière variante choisie retenue (clé `biome_vsel`) ;
  - fourmis : les ouvrières creusent des galeries en ligne qui se ramifient, avec de petites chambres (`antDigTarget`, têtes `col.heads`), même quand la colonie a faim ; la reine a un halo doré ;
  - araignées (soie.js) : l'épeire tisse une toile ronde (`orbs`) au centre de ses fils de cadre ; les mygales creusent un terrier tapissé de soie (`nests`) ; toutes pondent un cocon (`sacs` : dans la toile, au fond du terrier, ou porté par la loup/sauteuse) d'où sortent les petits. Repère du vivarium courant : la grille `T` (recréée à chaque vivarium) ;
  - instincts.js : araignée sauteuse (comportement `sauteuse` : guette, s'approche, bondit `spiderLeap`/`leapStep`, même sur un insecte qui vole bas ; tente de soie au pied d'une plante pour la nuit et le cocon) ; mygale à l'affût à l'entrée du terrier ; loup qui bondit sur les insectes posés près d'elle. `mission(c)` : ce que fait la bête sélectionnée, affiché sous le HUD ; jour/nuit : abeille posée sur une plante la nuit (`repos`), cloporte à l'abri le jour ;
  - pontes : coccinelle sur une plante à pucerons, abeille dans un nid au sol près des fleurs, mouche sur un cadavre ou de la litière (plus de naissances d'adultes tout faits) ;
  - species2 : phasme, mante, escargot, chenille/papillon ;
  - species3 : scorpion, ténébrion, bousier, rhinocéros.
- **Dessin des bêtes** : style « naturel » choisi par l'utilisateur (`DESSIN='nature'` en tête de profile.js : corps pleins aux couleurs `natFill`/`natLine`, sans halo néon ni points aux articulations). Le même réglage s'applique à la vue de côté (profile.js), aux petites bêtes (`drawTiny`, fixes.js) et au dessin vu de dessus (vignettes, vue du dessus : remplacements dans assemble.py). Les styles 'actuel' et 'fin' restent disponibles.
- **Décors vus de dessus** : decor_top.js remplace `drawDecosTop` ; chaque décor dessiné en volume (lumière en haut à gauche, ombre portée), forme stable tirée de `d.seed` (`decoRng`).
- **Matériel** : barre d'état compacte (ctrl.js, `CTRL='barre'`, choix de l'utilisateur) : une icône par appareil avec son état ; un clic ouvre ses réglages (`openDev`). Colonne à gauche sur grand écran, ligne au-dessus des outils sur téléphone. Le mode 'panneau' (panneau latéral) existe encore mais n'est pas utilisé. Réglages d'un appareil : `devHTML(id)` / `wireDev()` (devices.js).
- **Options** : OPT (volume, vitesse, qualité, vibrations, étiquettes, astuces, ambiance, gaucher, saisons du bac à sable, `seasonsC` saisons de campagne, `texte`/`contraste`/`dalto` accessibilité).
- **Langue** (langue.js) : anglais via Options → Langue (clé `biome_lang`, anglais par défaut si le navigateur n'est pas en français, français sous Playwright). Traduction à l'affichage seulement (MutationObserver + fillText) : tout nouveau texte doit avoir son entrée dans `EN_D` (phrases) ou `EN_T` (modèles avec `{}`).
- **Modes en plus** (progres.js) : défi de chapitre (règles Expert, `biome_defis`), défi du jour (tiré avec la date, `biome_jours`), survie (niveau 12, coups durs rapprochés, record `biome_survie`) ; un mode spécial = copie d'un niveau passée à `startSpecial`. Bilan de fin (courbes, naissances, morts). Succès difficiles.
- **Vie des bêtes** (vie.js) : grillon et ver luisant (nouvelles espèces, BSP4), pucerons ailés (`c.vol`), petits scorpions sur le dos (`c.dos`), frappe de la mante, guerre entre colonies, champignon (`c.malade`), larves/nymphes de coccinelle et mouche (`c.stade`), bébés qui grandissent (`c.bebe`, `ech`), bêtes âgées (`c.vieux`, plus lentes, plus pâles). Tous les UPD passent par un enrobage commun.
- **Milieu** (milieu.js) : plantes `arbo`, `dionee` (carnivore), `champignon` ; fruits (item `fruit`) ; plantes assoiffées affaissées ; moisissures (`MOI` par colonne) ; saisons en campagne (75 s chacune, dès le niveau 4) ; climat du bac (`v.climat` : tempéré, tropical, désert).
- **Salle** (salle2.js) : partage d'un bac par code `VIVB1:` ou fichier `.vivarium` (📥 dans la salle), modèles Forêt/Désert/Mare, étiquette de couleur, mode observation 👁, rattrapage à l'ouverture (jusqu'à 5 min simulées selon l'absence, `v.vu`), carnet daté, album photo (IndexedDB `vivariom-album`), salle éclairée selon l'heure.
- **Confort** (confort.js) : main animée du tutoriel, ↶ Annuler (20 s), appui long sur une bête = la suivre (🔍 loupe), accessibilité, sons (bourdonnements, pas, pluie), vibrations.
- **Savoir** (savoir.js) : fiches enrichies (`PLUS` : où elle vit, anecdote, taille réelle), quiz (un sans-faute débloque des décors de salle), découvertes (`biome_decouv`), carte des chapitres en jardin (`biome_carte`), partage des photos.
- **Sauvegardes** :
  - `LS.get/LS.set`, clés `biome_*` ;
  - grilles compressées en RLE (préfixe `R`).
- **Synchronisation** : save.js, Options → Données → Sauvegarde. Exporte toutes les clés `biome_*` en code `VIVA1:` (JSON gzip en base64) ou en fichier `.vivariom` ; l'import remplace tout et recharge (les enregistrements automatiques sont bloqués pendant ce rechargement).
- **Photo** : `window.claude.use('downloads')` si le jeu tourne dans Claude, sinon un lien `<a download>`.

## Bestioles (bonus à part, sans lien avec le jeu)
Petites bêtes qui vivent sur l'écran du téléphone ou de l'ordinateur, par-dessus les autres applis, sans rien modifier.
- `bestioles/moteur/` : page transparente commune (bestioles.js : espèces, comportements, interactions, menu au clic ; API `window.Bestioles` : demarrer, arreter, action, ajouter, survol, etat, _avancer).
- `bestioles/android/` : appli Kotlin (sans dépendance) : superposition WebView non tactile (alpha 0,8 pour Android 12+) + une zone tactile invisible par bête → MenuActivity ; widget et tuile des réglages rapides passent par BasculeActivity ; service au premier plan (type specialUse) avec notification « Éteindre ».
- `bestioles/bureau/` : appli Electron (Windows .exe portable, Linux .AppImage) : fenêtre transparente toujours au-dessus, clics qui traversent sauf sur une bête/le menu (position de la souris envoyée toutes les 60 ms) ; icône près de l'horloge (allumer/éteindre, lancer au démarrage, quitter).
- Fabrication : `.github/workflows/bestioles.yml` à chaque mise à jour de `bestioles/` ; publiés (accord de l'utilisateur) dans la page Releases, tag `bestioles` (fichiers remplacés à chaque version). APK signé avec une clé de débogage (une mise à jour peut demander de désinstaller l'ancienne version).
- Non testé sur un vrai appareil par Claude : à valider par l'utilisateur.

## Paysage sur téléphone
Quand l'écran fait moins de 520 px de haut en paysage, `resize()` pose la classe `land` sur body : outils et boutons du menu en colonne à gauche, vues et zoom à droite (inversé en mode gaucher). `CVL`/`CVR` = largeur des colonnes ; le canvas est décalé de `CVL` et `W` est la largeur entre les colonnes (les touchers retirent `CVL`). `BOT`/`BAND_T` sont réduits.

## Tests
- `node tests/duree.js [niveaux] [essais]` : temps simulé pour gagner chaque niveau (joueur automatique simple, qui ne brumise pas : les niveaux 1, 19-21 échouent avec lui, c'est normal).
- Champ `repro` d'un niveau : accélère ponte et éclosion (phasme, mante, chenille/papillon) dans ce niveau seulement (`RF()` dans species2.js).

Les tests utilisent Playwright (`npm i playwright` si besoin) et passent par `window.__sim` : startLevel, go, tap, run, counts, win, bench…
```
python3 assemble.py && node tests/fixcheck.js && node tests/all_lv.js && node tests/sauvegarde.js && node tests/appli_web.js && node tests/salle.js && node tests/bascule.js && node tests/tiroir.js
```
`__sim.startLevel` appelle la version non enveloppée : `#vnav` ne s'affiche pas dans les tests. C'est normal.

## Points ouverts (connus)
- Les ajouts de novembre 2026 (modes, nouvelles bêtes et plantes, salle, confort, savoir) n'ont été testés qu'automatiquement : à valider par l'utilisateur.
- Galerie en ligne de photos : impossible sans serveur ; on partage par le bouton « Partager » du téléphone.
- Paysage sur téléphone (hauteur < 520 px) : à valider sur un vrai téléphone (toucher, rotation, mode gaucher).

## Publication
- README.md : présentation complète du jeu et des Bestioles, avec captures dans `docs/captures/` (à refaire si l'interface change beaucoup).
- Dépôt public sur GitHub, **tous droits réservés** (LICENSE) : visible, pas libre.
- Le jeu est en ligne sur https://grecdel.github.io/vivariom/ : `.github/workflows/pages.yml` met en ligne `web/` à chaque mise à jour de `main` touchant `web/`. Donc : modifier, `python3 assemble.py`, tester, enregistrer `web/` avec le reste.
- itch.io abandonné pour le moment. L'historique a été repris à zéro avant de rendre le dépôt public (pour ne pas exposer l'e-mail de l'auteur) : les anciens fichiers itch.io ne sont plus récupérables.
- Travailler directement sur `main` ou sur une branche courte ; le proxy de la session ne permet pas de supprimer une branche distante ni de changer les réglages du dépôt (visibilité, Pages) : c'est à l'utilisateur de le faire sur github.com.

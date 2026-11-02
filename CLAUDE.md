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
`vivariom.html` est la dernière version validée (identique à biome.html au moment de la reprise).

`assemble.py` :
- extrait des fonctions de dessin de `vivarium.html` (drawCreature, drawWaves…) ;
- les colle avec les autres JS dans une seule IIFE ;
- contient aussi le HTML et le CSS de l'interface.

Ordre des fichiers :
- **core** : biome_core.js, variants.js, unlocks.js, decor.js, topview.js, profile.js, devices.js, links.js, lure.js, species2.js, species3.js
- **main** : biome_main.js, menu.js, extras.js, tutorial.js, ambiance.js, save.js, bascule.js, tiroir.js, soie.js, fixes.js (en dernier : il remplace certaines fonctions)

## Repères
- **Monde** :
  - grille en mm, CS = 2,5 mm ; COLS/ROWS/ZD dépendent du format (FORMATS : std, fourmi, grand, cube) ;
  - profondeur z sur les bêtes, les plantes et les objets.
- **Vues** : coupe (2D), 3/4 (`zT`/`zP`, décors en sprites hors écran) et dessus (topview.js, à l'échelle réelle).
  - Molette / pincement (`zoomAt`, devices.js) : coupe ⇄ 3/4 ⇄ dessus ; en dessus, la molette zoome, et au zoom minimum la molette arrière ramène en 3/4. Pause de 650 ms après chaque bascule (`vsT`) et nouveau geste exigé pour la molette (l'élan est ignoré).
  - Bascule 3/4 ⇄ dessus : bascule.js dessine un pavé en volume (face avant = coupe, dessus = vue de dessus, paroi droite) qui se redresse, avec fondu vers les vraies vues aux deux bouts.
- **Campagne** :
  - 22 niveaux en 9 chapitres (CHAPTERS/LEVELS dans biome_core.js) ;
  - récompenses et déblocages dans unlocks.js ;
  - étoiles, reprise de partie (`biome_resume`), tutoriel.
- **Bac à sable** (menu.js) :
  - tout est débloqué ;
  - grande salle avec racks contre le mur (ROOM, roomGeom, fiche `#rsheet`) : 2 étagères au départ, jusqu'à RACK_MAX (clé `biome_racks`) ; « ＋ » sur chaque emplacement libre (`.slotfree`), étagère à ajouter en pointillé (`.raddr`), dernière étagère vide retirable (`.rdel`) ; glisser-déposer immédiat à la souris, après appui maintenu au doigt ;
  - style, couveuse, tubes entre bacs.
- **Espèces** :
  - variantes (VARS/VSP dans variants.js) ;
  - tiroir « Bêtes » (tiroir.js) : une case par espèce (variantes + larves regroupées : chenille→papillon, ver de farine→ténébrion, ver blanc→rhinocéros), ordre alphabétique des noms courts, bouton « ▾ n » qui ouvre la liste des variantes ; dernière variante choisie retenue (clé `biome_vsel`) ;
  - fourmis : les ouvrières creusent des galeries en ligne qui se ramifient, avec de petites chambres (`antDigTarget`, têtes `col.heads`), même quand la colonie a faim ; la reine a un halo doré ;
  - araignées (soie.js) : l'épeire tisse une toile ronde (`orbs`) au centre de ses fils de cadre ; les mygales creusent un terrier tapissé de soie (`nests`) ; toutes pondent un cocon (`sacs` : dans la toile, au fond du terrier, ou porté par la loup/sauteuse) d'où sortent les petits. Repère du vivarium courant : la grille `T` (recréée à chaque vivarium) ;
  - species2 : phasme, mante, escargot, chenille/papillon ;
  - species3 : scorpion, ténébrion, bousier, rhinocéros.
- **Options** : OPT (volume, vitesse, qualité, vibrations, étiquettes, astuces, ambiance, gaucher, saisons).
- **Sauvegardes** :
  - `LS.get/LS.set`, clés `biome_*` ;
  - grilles compressées en RLE (préfixe `R`).
- **Synchronisation** : save.js, Options → Données → Sauvegarde. Exporte toutes les clés `biome_*` en code `VIVA1:` (JSON gzip en base64) ou en fichier `.vivariom` ; l'import remplace tout et recharge (les enregistrements automatiques sont bloqués pendant ce rechargement).
- **Photo** : `window.claude.use('downloads')` si le jeu tourne dans Claude, sinon un lien `<a download>`.

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
- Paysage sur téléphone (hauteur < 520 px) : à valider sur un vrai téléphone (toucher, rotation, mode gaucher).

## Publication
- Dépôt public sur GitHub, **tous droits réservés** (LICENSE) : visible, pas libre.
- Le jeu est en ligne sur https://grecdel.github.io/vivariom/ : `.github/workflows/pages.yml` met en ligne `web/` à chaque mise à jour de `main` touchant `web/`. Donc : modifier, `python3 assemble.py`, tester, enregistrer `web/` avec le reste.
- itch.io abandonné pour le moment. L'historique a été repris à zéro avant de rendre le dépôt public (pour ne pas exposer l'e-mail de l'auteur) : les anciens fichiers itch.io ne sont plus récupérables.
- Travailler directement sur `main` ou sur une branche courte ; le proxy de la session ne permet pas de supprimer une branche distante ni de changer les réglages du dépôt (visibilité, Pages) : c'est à l'utilisateur de le faire sur github.com.

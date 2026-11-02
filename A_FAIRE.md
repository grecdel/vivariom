# Vivariom — liste à cocher

**Comment s'en servir** : sur github.com, ouvre ce fichier, touche le crayon ✏️ (« Edit »), remplace `[ ]` par `[x]` devant ce que tu as vérifié ou ce que tu veux, puis « Commit changes ». Dans une prochaine session, dis simplement à Claude : « reprends A_FAIRE.md ».

Ajoute un commentaire après une ligne si quelque chose ne va pas, par exemple : `- [x] Annuler — ne marche pas après une plante`.

---

## 1. À vérifier sur ton téléphone (ou ton ordinateur)

Coche quand c'est vérifié et que ça marche. Si ça ne marche pas, laisse `[ ]` et écris ce qui ne va pas.

### Campagne
- [ ] Choix de difficulté (Facile / Normal / Expert) en haut de la campagne
- [ ] Carte des chapitres en forme de jardin (bouton « ☰ Liste » pour revenir à la liste)
- [ ] Défi du jour
- [ ] Mode Survie (se débloque après 3 niveaux)
- [ ] Défi de chapitre (⚔, après un chapitre terminé)
- [ ] Coups durs annoncés (canicule, nuit froide, panne, invasion, intrus)
- [ ] Bilan de fin de niveau (courbes, naissances, morts)
- [ ] Saisons en campagne (dès le niveau 4)
- [ ] La difficulté Normal te paraît juste (ni trop facile, ni impossible)

### Bêtes et plantes
- [ ] Grillon qui chante la nuit, ver luisant qui brille la nuit
- [ ] Pucerons ailés qui changent de plante
- [ ] Petits scorpions sur le dos de leur mère
- [ ] Larves et nymphes de coccinelle et de mouche
- [ ] Bébés plus petits qui grandissent, vieilles bêtes plus pâles
- [ ] Champignon blanc sur les bêtes et moisissures quand le sol est trop mouillé
- [ ] Fougère arborescente, dionée (attrape les mouches), champignons, fruits

### Bac à sable et salle
- [ ] Modèles tout prêts (Forêt, Désert, Mare) à la création d'un bac
- [ ] Climat du bac (Tempéré, Tropical, Désert) et étiquette de couleur
- [ ] Partager un bac (📤 dans la fiche) et le recevoir (📥 dans la salle)
- [ ] « Pendant ton absence » : le bac a vécu quand tu reviens
- [ ] Mode observation 👁 (✕ en haut à droite pour revenir)
- [ ] Album photo 🖼 (les photos 📷 s'y rangent)
- [ ] Salle plus sombre le soir et la nuit

### Confort
- [ ] Bouton ↶ Annuler après avoir posé une bête ou une plante
- [ ] Appui long sur une bête pour la suivre, puis 🔍 Loupe
- [ ] Options : taille des textes, contraste fort, couleurs pour daltonisme
- [ ] Vibrations (naissance, victoire, défaite)
- [ ] Sons : bourdonnements, pas, pluie
- [ ] Tutoriel plus court avec la main 👆
- [ ] Fiches des espèces : taille réelle, où elle vit, anecdote
- [ ] Quiz 🧠 et Découvertes 🔎 dans les fiches
- [ ] Version anglaise (Options → Langue → English)
- [ ] Téléphone en paysage (outils en colonne)

### Bestioles (le bonus)
- [ ] Android : s'installe, se lance, widget et bouton des réglages rapides
- [ ] Android : Réglages (quelles bêtes, combien), miette, goutte de miel
- [ ] Windows : se lance, icône près de l'horloge
- [ ] Linux : se lance, icône près de l'horloge
- [ ] Ordinateur : les bêtes fuient la souris, « Tenir une miette » les fait suivre
- [ ] Papillons le jour, vers luisants le soir

---

## 2. Nouvelles idées

Coche celles que tu veux. Claude les fera dans l'ordre de la liste.

### Jeu
- [ ] 1. Mode « histoire » : un petit naturaliste qui commente tes progrès et te donne des missions
- [ ] 2. Visiteurs rares : papillon de nuit, lézard (qui mange tout !), oiseau derrière la vitre
- [ ] 3. Événements du calendrier : neige à Noël, citrouilles en octobre, vers luisants en juin
- [ ] 4. Classement personnel : meilleurs temps par niveau, progrès de la semaine
- [ ] 5. Campagne bonus faite de niveaux partagés par d'autres joueurs
- [ ] 6. Éditeur de niveaux : choisir espèces, réserves et objectif, puis envoyer à un ami

### Bêtes et nature
- [ ] 7. Nouvelles espèces : perce-oreille, gendarme, libellule, têtard qui devient grenouille
- [ ] 8. Vraie mare avec vie aquatique : larves de moustique, gerris sur l'eau
- [ ] 9. Maladies des plantes : virus transmis par les pucerons, feuilles tachées
- [ ] 10. Fourmis champignonnistes qui coupent des feuilles
- [ ] 11. Essaims d'abeilles qui partent fonder une nouvelle ruche

### Bac à sable
- [ ] 12. Bacs plus grands, mode « terrarium mural » plein écran
- [ ] 13. Plusieurs étages dans un même bac : sol, souche, mare, plantes grimpantes
- [ ] 14. Fond d'écran vivant sur ordinateur
- [ ] 15. Concours entre amis : le plus beau bac de la semaine

### Confort
- [ ] 16. Notification sur le téléphone (« Tes pucerons ont envahi le bac ! »), si tu le veux bien
- [ ] 17. Mode « pour les enfants » : textes simplifiés, plus d'aide, pas de mort affichée
- [ ] 18. Voix qui lit les fiches à voix haute
- [ ] 19. Vraie appli Android dans le Play Store (compte développeur payant, une fois)
- [ ] 20. Version tablette : bac et fiche côte à côte

---

## Notes pour Claude (reprise)

- Lire CLAUDE.md d'abord. Partie 1 : chaque `[ ]` accompagné d'un commentaire est un bug à corriger en priorité ; un `[ ]` sans commentaire n'a pas encore été vérifié par l'utilisateur.
- Partie 2 : faire les idées cochées dans l'ordre, chacune testée, enregistrée et en ligne (`python3 assemble.py`, tests de CLAUDE.md, commit avec `web/`, push). Pour un changement visuel important, proposer d'abord des prototypes.
- Repères techniques :
  - un nouveau fichier JS s'ajoute à la boucle « ajouts » d'assemble.py ;
  - tout nouveau texte affiché a besoin de sa traduction dans `EN_D` / `EN_T` (langue.js) ;
  - une nouvelle espèce suit le modèle BSP4 de vie.js (SPI, FICHES, REAL, UPD, REL, PLUS, `sandboxSpecies`) ;
  - attention aux noms `const` en double entre fichiers : vérifier avec `node --check` sur le script extrait de biome.html.
- Idée 16 : une PWA ne peut notifier que si l'utilisateur l'autorise ; prévoir une option coupée par défaut.
- Idée 19 : demande un compte Google Play à créer par l'utilisateur.
- Idée 5, idée 15 et la galerie de photos demandent un serveur : proposer une solution sans serveur (codes partagés) ou demander l'accord de l'utilisateur.
- Après chaque session : cocher ici ce qui est fait (partie 2 → `[x]` avec « fait le JJ/MM »).

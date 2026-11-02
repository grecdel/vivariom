# 🐜 Vivariom

**Un petit monde vivant sous verre, à faire tenir en équilibre.**

Vivariom est un vivarium d'insectes que tu fais vivre : tu poses la terre, les plantes, les bêtes et le matériel, puis tu regardes l'écosystème s'organiser… ou s'effondrer. Fourmis qui creusent leurs galeries, araignées qui tissent, mantes à l'affût, papillons qui pondent sur les feuilles, scorpions qui chassent la nuit : chaque espèce a ses besoins, ses proies et ses prédateurs.

### ▶ [Jouer maintenant](https://grecdel.github.io/vivariom/)

Le jeu fonctionne dans le navigateur, sur **téléphone Android** comme sur **ordinateur (Windows, Linux)**, et s'installe comme une appli pour jouer **sans internet**.

![Écran titre de Vivariom](docs/captures/titre.jpg)

---

## Ce qu'on y fait

### Une campagne de 22 niveaux
Neuf chapitres pour découvrir les espèces une à une : les premières pousses, la fourmilière, les coccinelles contre les pucerons, la toile de l'araignée, le grand équilibre, les phasmes, la mante religieuse, la métamorphose du papillon, le désert du scorpion, le bousier, le scarabée rhinocéros… Chaque niveau a un objectif (garder toutes les espèces en vie pendant un temps donné), des réserves limitées et jusqu'à trois étoiles à gagner.

### Un bac à sable
Tout est débloqué. Une grande salle avec des étagères accueille tes vivariums : touche un **＋** pour en créer un, choisis son format (standard, grand bac, fourmilière étroite, cube) et son sol (forêt, désert, marais), ajoute des étagères, range les bacs par glisser-déposer. Quand tu prends une bête, une **fiche d'aide** t'indique ce qu'elle mange, qui la mange (et combien il y en a déjà dans le bac) et ce dont elle a besoin.

![La grande salle du bac à sable](docs/captures/grande-salle.jpg)

### Trois façons de regarder
- **En coupe** : le vivarium de face, la terre, les racines et les galeries.
- **En 3/4** : le bac en volume avec son matériel (spot, néon, brumisateur, réservoir, tapis chauffant, ventilation).
- **Du dessus** : à l'échelle réelle, avec les décors (pierres, tronc creux, mare, mousse, écorce…).

On passe de l'une à l'autre avec les boutons, la molette ou en pinçant l'écran ; la bascule 3/4 ↔ dessus fait pivoter le bac en volume.

| En coupe | En 3/4 | Du dessus |
|---|---|---|
| ![Vue en coupe](docs/captures/coupe.jpg) | ![Vue en 3/4](docs/captures/vue-3-4.jpg) | ![Vue du dessus](docs/captures/vue-dessus.jpg) |

### Des bêtes qui ont leur vie
Une vingtaine d'espèces et leurs variantes (fourmi noire, mygale bleue, coccinelle asiatique, bourdon…), dessinées dans un style naturel :
- les **fourmis** fondent une colonie autour de leur reine, creusent des galeries ramifiées et élèvent les pucerons pour leur miellat ;
- l'**épeire** tisse une toile ronde, la **mygale** guette à l'entrée de son terrier, l'**araignée sauteuse** bondit sur ses proies ; toutes gardent un cocon d'œufs ;
- la **coccinelle** pond près des pucerons, l'**abeille** butine et se pose la nuit, la **mouche** pond sur ce qui pourrit ;
- le **papillon** pond sur les feuilles, la chenille se change en chrysalide ; le **ténébrion**, le **scarabée rhinocéros** passent par la larve et la nymphe ;
- le **scorpion** se cache le jour et brille sous la lumière UV.

Sélectionne une bête pour savoir ce qu'elle est en train de faire : chasser, creuser, garder ses œufs, se reposer…

| Le tiroir des bêtes | La fiche d'aide |
|---|---|
| ![Tiroir des bêtes, une case par espèce](docs/captures/tiroir-betes.jpg) | ![Fiche d'aide : nourriture, prédateurs, besoins](docs/captures/fiche-aide.jpg) |

### Le matériel du vivarium
Une barre compacte montre l'état de chaque appareil (température, lumière, prochaine brumisation, niveau du réservoir…) ; un clic ouvre ses réglages. La lumière fait pousser les plantes mais chauffe et assèche, le brumisateur humidifie, le tapis chauffant accélère tout le monde.

---

## Installer le jeu comme une appli

1. Ouvre **https://grecdel.github.io/vivariom/** dans Chrome ou Edge.
2. **Ordinateur** : bouton « Installer » dans la barre d'adresse. **Android** : menu ⋮ → « Ajouter à l'écran d'accueil » (ou « Installer l'application »).
3. Le jeu se lance ensuite comme une appli, même sans internet, et se met à jour tout seul.

**Passer sa partie d'un appareil à l'autre** : Options → Données → Sauvegarde → exporter un fichier ou un code, puis l'importer sur l'autre appareil.

---

## 🐞 Bonus : les Bestioles

Des petites bêtes de Vivariom qui se promènent **directement sur ton écran**, par-dessus tes applis, sans rien toucher : des fourmis en file qui rapportent des miettes, des pucerons et la coccinelle qui les mange, des mouches, une araignée sauteuse qui les guette, un papillon, une mante à l'affût. Touche une bête pour la calmer, la faire disparaître ou en ajouter une autre.

![Les bestioles qui se promènent sur l'écran](docs/captures/bestioles.jpg)

**Télécharger** : page [Releases → Bestioles](https://github.com/grecdel/vivariom/releases/tag/bestioles)

| Système | Fichier | Allumer / éteindre |
|---|---|---|
| **Android** | `Bestioles-android.apk` | widget sur l'écran d'accueil, bouton dans les réglages rapides, ou notification |
| **Windows** | `Bestioles-windows.exe` | icône près de l'horloge (clic) ; option « lancer au démarrage » |
| **Linux** | `Bestioles-linux.AppImage` | icône près de l'horloge (menu) ; option « lancer au démarrage » |

À savoir :
- **Android** : autorise l'installation d'applications inconnues, puis, dans l'appli Bestioles, « afficher par-dessus les autres applis ».
- **Windows** : au premier lancement, « Windows a protégé votre ordinateur » → *Informations complémentaires* → *Exécuter quand même* (l'appli n'est pas signée).
- **Linux** : rends le fichier exécutable (clic droit → Propriétés → Autoriser l'exécution). Sur certains bureaux récents (GNOME/Wayland), l'icône demande une extension et les bêtes peuvent passer derrière certaines fenêtres.

---

## Pour les curieux

Le jeu est écrit en JavaScript, dessiné sur un canvas, et assemblé en un seul fichier HTML (`python3 assemble.py`). Les Bestioles réutilisent une même page pour les trois systèmes, emballée dans une appli Android (Kotlin) et une appli de bureau (Electron). Les applis sont fabriquées automatiquement par GitHub Actions.

---

© 2026 grecdel — tous droits réservés. Le code est visible mais **n'est pas libre** : toute copie, modification ou redistribution est interdite sans accord écrit. Voir [LICENSE](LICENSE).

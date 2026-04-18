# BRIEF — Catalogue Univers Caresse
**Créé le : 2026-04-18 — Session 19**

---

## Concept physique
Booklet agrafé au centre. Feuilles 11×17 pliées en 2, insérées les unes dans les autres. À l'écran = simulation d'un vrai livre, feuilleté en doubles pages.

---

## Technique
- 3 fichiers : `catalogue.html`, `catalogue.css`, `catalogue.js`
- 3 appels API en parallèle : `getCatalogue`, `getMediatheque`, `getContenu`
- Rien de codé en dur — tout vient de l'API
- Toujours un multiple de 4 pages
- Impression : `@media print`, format 11×17, `window.print()`

---

## Structure des pages
- Page 1 : Couverture
- Page 2 : Mot de Chantal
- Page 3 : Table des matières
- Pages 4+ : Collections — dynamiques, générées par l'API
- Avant-dernière : Infos techniques
- Dernière : Dos de couverture

> **Pages 1-2-3 fonctionnent. Pages 4+ = à bâtir.**

---

## Direction créative
- Harmonieux mais jamais pareil d'une collection à l'autre
- Espace blanc = respiration — jamais de circulaire d'épicerie
- Typographie : Playfair Display, Birthstone, DM Sans uniquement

---

## Bande blanche — règle critique
- Page gauche : `margin: 36px 0 36px 36px` sur `.page-int`
- Page droite : `margin: 36px 36px 36px 0` sur `.page-int`
- Pied de page : toujours hors du `.page-int`, dans la zone imprimable

---

## Rendu dynamique
- `col_id` = identifiant stable pour dispatcher le rendu — jamais le nom, jamais le rang
- Jamais de nom de collection hardcodé dans le JS
- Collections nouvelles → rendu générique automatique jusqu'à fonction spécifique définie
- Le rang = ordre d'apparition uniquement

---

## Layout pages 4-5 (COL-001 / Saponica) — validé sur wireframe

### Page gauche
- Photo collection haut gauche
- Nom + slogan + description en dessous
- 1 produit à droite de la description, aligné avec la rangée 1 de la page droite
- Citation fond vert (`var(--primary)`) en bas, largeur partielle

### Page droite
- Entête gamme : nom + carré couleur haut droite
- Description gamme
- Rangée 1 : 3 produits — alignée avec le produit de la page gauche
- Rangée 2 : 1 produit gauche + 2 produits droite empilés

---

## Structure API — Données réelles (source : Univers_Caresse.xlsx)

### Collections (`Collections_v2`)
`COL-id` · `rang` · `nom` · `slogan` · `description` · `couleur_hex` · `photo_url` · `photo_noel_url`

### Gammes (`Gammes_v2`)
`GAM-id` · `COL-id` · `rang` · `nom` · `description` · `couleur_hex` · `photo_url` · `photo_noel_url`

### Familles (`Familles_v2`)
`FAM-id` · `COL-id` · `rang` · `nom` · `description` · `couleur_hex` · `photo_url` · `photo_noel_url`

### Produits (`Produits_v2`)
`PRO-id` · `COL-id` · `GAM-id` · `FAM-id` · `nom` · `description` · `desc_emballage` · `couleur_hex` · `surgras` · `nb_unites` · `cure` · `instructions` · `notes` · `image_url` · `image_noel_url` · `statut` · `collections_secondaires` · `avertissement` · `mode_emploi`

### Formats produits (`Produits_Formats_v2`)
`PRO-id` · `poids` · `unite` · `prix_vente` · `EMB-id`

### Contenu (`Contenu_v2`)
`cle` · `valeur`

### Médiathèque (`Mediatheque_V2`)
`URL` · `Nom` · `Catégorie` · `Date ajout`

> ⚠️ `statut` du produit = filtre — seuls les produits `public` apparaissent dans le catalogue.
> ⚠️ `gam_id` dans le JS actuel est invalide — le vrai champ est `GAM-id` dans `Produits_v2`.

---

## Style par collection

### COL-001 — SAPONICA `#e5900a`
- Fond : blanc pur
- Nom collection : Playfair Display, grand, poids léger, noir
- Slogan : Playfair Display italic, couleur `#e5900a`
- Description : DM Sans, petit, poids léger, gris foncé, interlignes généreux
- Accent : `#e5900a` — sobre, utilisé avec parcimonie
- Gamme (`GAM-001`) : cube `#c1882e` + nom Playfair + description DM Sans léger
- Cartes produits : règles générales — `couleur_hex` propre à chaque produit

---

## Règles de pagination des collections

- Chaque collection commence toujours sur une nouvelle page
- Une collection ne partage jamais une page avec une autre collection
- Si une collection déborde sur une page supplémentaire, un rappel visuel en haut de cette page indique à quelle collection appartiennent les produits — forme à définir, pas de recette fixe, variantes possibles
- Le nombre de pages par collection est variable — autant qu'il faut

## Dynamisation des pages

- Les photos de la médiathèque (`Mediatheque_V2`) et les citations (`Contenu_v2`) s'intègrent dans le flux des produits pour dynamiser l'espace
- Pas de position fixe — intercalés naturellement, pas nécessairement à la fin
- Objectif : respiration visuelle, jamais l'effet "produits placés jusqu'à épuisement"
- Jamais de grands trous vides sur une page

---



### Dimensions fixes (peu importe l'orientation)
- Carte verticale : 2" × 4.5"
- Carte horizontale : 4.5" × 2" (mêmes dimensions, pivotée)
- Maximum 3 cartes par rangée
- Gap entre cartes : 0.5"

### Composition
- Photo : jamais coupée — `object-fit: contain`
- Hex : 50% de la carte, photo : 50% de la carte
- Photo + hex = toujours présents ensemble

### Positions du hex — aléatoire au rendu (dynamisme visuel)
**Verticale :**
- Hex en haut
- Hex en bas
- Hex séparé : haut (25%) + bas (25%), photo au centre (50%)

**Horizontale :**
- Hex à gauche
- Hex à droite

### Texte dans le hex
- Français uniquement
- Contenu : nom du produit, emballage, prix/format
- Alignement :
  - Hex à gauche → texte aligné à gauche
  - Hex à droite → texte aligné à droite
  - Hex en haut ou en bas → texte aligné à gauche
  - Jamais centré

---

## État des travaux — Session 19 (2026-04-18)

### Ce qui a été fait
- HTML pages 4-5 restructuré : layout 2 colonnes page 4, conteneur `#sap-pages-suite` ajouté
- CSS pages 4-5 réécrits : `.prod-carte` universel 192×432px (vertical) / 432×192px (horizontal)
- JS Saponica réécrits : `creerProduitCarte()`, `posAleatoire()`, section COL-001 complète

### État au moment de l'abandon
Les pages 4-5 ne correspondent pas au wireframe. Les 3 fichiers livrés sont à retravailler complètement.

> ⚠️ Repartir des fichiers originaux fournis en début de session — ne pas utiliser les fichiers livrés cette session.
> ⚠️ Les noms de champs API réels (`nom_gamme`, `desc_gamme`, `rang_gamme`) doivent être vérifiés une fois branché sur l'API.
> ⚠️ Avant de coder : valider le layout pixel par pixel avec Jean-Claude avant de toucher aux fichiers.

---

## Règles de code
- Aucun style inline dans le HTML ou le JS
- Seul pattern accepté : `style="--variable: valeur"`
- Variables globales JS = `var` (jamais `let` au niveau global — risque TDZ)
- Vérification mentale `node --check` avant toute livraison JS
- Livraison ciblée = trouve/remplace uniquement
- Jamais le fichier complet sans permission explicite

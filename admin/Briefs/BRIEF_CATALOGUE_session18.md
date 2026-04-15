# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**À lire en entier, ligne par ligne, avant de commencer — pas en diagonale**
**Dernière mise à jour : 2026-04-14 — session 17**

---

## PROTOCOLE

1. Lire ce brief en entier — pas en diagonale
2. Faire un résumé en langage humain et attendre confirmation avant de coder
3. Un changement à la fois — attendre le OK avant le suivant
4. Trouve/remplace ciblé — jamais de fichier complet sans permission explicite

---

## C'EST QUOI CE PROJET

Un booklet physique agrafé au centre — feuilles 11×17 pliées en 2, insérées les unes dans les autres. On le tient dans les mains et on le feuillette. À l'écran, il simule un vrai livre.

Tout vient de l'API — rien de codé en dur. Si Chantal change une couleur ou un prix dans sa base, le catalogue suit automatiquement.

Chaque collection a sa propre personnalité visuelle. Le résultat final est un outil de vente beau et professionnel pour Chantal.

---

## RÈGLES DE CODE

- Aucun texte en dur dans HTML ou JS — tout vient de l'API
- Aucun style inline dans HTML ou JS — violation interdite
- Le pattern `--col-hex` est acceptable (ex: `style="--col-hex:#fff"`)
- Classes génériques maximales
- Réutiliser `style.css` au maximum avant d'ajouter dans `catalogue.css`
- Tout en français — commentaires, labels visibles, noms de classes

---

## IMPRESSION

- `@media print` → 11×17, marges normales — jamais à fond perdu
- `window.print()` déclenché par un bouton
- Ce qu'on voit à l'écran = ce qui sort à l'impression

---

## TECHNIQUE ET STRUCTUREL

- Toujours en multiples de 4 pages — pages tampons activables/désactivables
- Pages vues par paires — toujours penser double page
- Le JS regroupe toutes les `.page` en vues au chargement
- `col_id` est l'identifiant stable — dispatch par `col_id`, jamais par nom ou rang de collection
- Pied de page toujours hors du `page-int`, dans la zone imprimable

---

## BANDE BLANCHE — RÈGLE CRITIQUE

Chaque page 8.5×11 a une bande blanche visible sur 3 côtés. Le 4e côté = reliure = 0.

```css
.page-g > .page-int { margin: 36px 0 36px 36px; }
.page-d > .page-int { margin: 36px 36px 36px 0; }
.page-int { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
```

```javascript
pageNo % 2 === 0 ? 'page-g' : 'page-d'
```



---

## STRUCTURE DES FICHIERS

- `UC2/admin/catalogue.html` — HTML uniquement, aucun style inline, aucun JS inline
- `UC2/css/catalogue.css` — styles propres au catalogue
- `UC2/js/catalogue.js` — tout le JavaScript
- `UC2/css/style.css` — CSS du site, utilisé par le catalogue

---

## STRUCTURE DES PAGES

**Feuille 1 — fixe**
- Page 1 : Couverture — photo plein format
- Page 2 : Mot de Chantal — à corriger (citation coupée, pied de page)
- Avant-dernière : Infos techniques
- Dernière : Dos de couverture

**Tout le reste — dynamique, généré par l'API**

---

## API — APPS SCRIPT

URL : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`

### 3 appels en parallèle au chargement
1. `?action=getCatalogue` — collections + produits
2. `?action=getMediatheque` — toutes les photos
3. `?action=getContenu` — textes de contenu

### getCatalogue retourne
Chaque collection via `data.infoCollections` :
- `nom`, `slogan`, `description`, `couleur_hex`, `photo_url`, `rang`, `col_id`

Chaque produit :
- `nom`, `description`, `desc_emballage`, `couleur_hex`, `image_url`
- `nom_gamme`, `rang_gamme`, `desc_gamme`
- `formats` → `prix_vente`, `poids`, `unite`

### getContenu retourne
- `accueil_eyebrow` → eyebrow de la couverture

### getMediatheque retourne
- `url`, `nom`, `categorie`, `date_ajout` — indexer par `nom`

**Photos produits :** toutes les collections auront leurs photos. Quand une photo est manquante → espace réservé carré affiché à la place.

**Photos atelier :** `saponification_j2hwc5`, `surgras_yw29r3`, `essences_vevuvf`, `additif_bcbpgh`, `huiles_lnjxah`, `huiles_yjw9dl`

**Logo :** dans médiathèque — nom `Logofinal`

---

## TYPOGRAPHIE

- Playfair Display · Birthstone · DM Sans — jamais autre chose
- Généreuse — lisible pour tous les âges

---

## COULEURS HEX DES COLLECTIONS

- Surface expressive — vraie zone visible sur chaque carte produit
- Dynamique — suit la base automatiquement

---

## DIRECTION CRÉATIVE

- Harmonieux mais jamais pareil — chaque collection a sa propre personnalité
- Pas de pattern reproduit — le layout découle de ce que la collection EST
- Même surface totale pour chaque produit — variations visuelles, pas de taille
- Les photos racontent — elles n'illustrent pas
- Espace blanc = respiration — jamais de circulaire d'épicerie
- Textes évocateurs exploités — description collection + tagline produit
- Photos d'ambiance/atelier intercalées pour aérer

---

## RENDU DYNAMIQUE

- `col_id` est l'identifiant stable — détermine quelle fonction de rendu s'applique
- Jamais de nom de collection hardcodé dans le JS
- Jamais de détection par rang dans le JS
- Collections nouvelles → rendu générique automatique jusqu'à fonction spécifique définie
- Le rang détermine uniquement l'ordre d'apparition — rien d'autre

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Mis à jour : session 17 (2026-04-14)*

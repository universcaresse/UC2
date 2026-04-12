# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 9 — À lire en entier avant de commencer**

---

## CONTEXTE

Page HTML autonome (`catalogue-apercu.html`) — booklet imprimable agrafé au centre.
Données dynamiques via `getCatalogue` (Apps Script).
Fichier dans `UC2/` — accessible via `universcaresse.github.io/UC2/catalogue-apercu.html`.

---

## FORMAT

- **Booklet agrafé au centre** — pages 8.5×11, imprimées en 11×17 recto-verso
- Pages se voient PAR PAIRES quand le booklet est ouvert — penser double page
- **`@media print`** → 8.5×11, marges normales — **JAMAIS à fond perdu**
- **`window.print()`** déclenché par un bouton
- Fond autour des pages : beige chaud (pas noir)

---

## DONNÉES DISPONIBLES — API `getCatalogue`

Chaque collection retourne :
- `nom`, `slogan`, `description` (2 paragraphes riches et évocateurs), `couleur_hex`, `photo_url`

Chaque produit retourne :
- `nom`, `description` (poétique), `desc_emballage` (tagline courte), `couleur_hex`, `image_url`
- `nom_gamme`, `rang_gamme` — pour regrouper par gamme (ÉMOLIA notamment)
- `formats` → prix et poids

**Photos produits** : disponibles pour SAPONICA, PETIT NUAGE, ÉPURE, KÉRYS (partiel).
Manquantes pour CAPRIN, ÉMOLIA, CASA, LUI, ANIMA — **photos à venir, couleur hex en fallback**.

---

## PRINCIPES VISUELS — DÉCIDÉS

### Ce qui fonctionne (à garder de la v1)
- Photo de couverture avec voile (opacité) — douceur, pas agressif
- Logo en bas à gauche de la couverture — placement inattendu, marque
- Collections avec point de couleur en haut à droite — dynamique, l'œil voyage
- Photo de collection utilisée — bonne idée, à mieux exploiter

### Ce qui ne fonctionne pas (à corriger)
- Fond noir — remplacer par beige chaud
- Marges à fond perdu — à enlever partout
- Grille uniforme mécanique — même recette page après page = liste d'épicerie
- Couleurs individuelles des produits qui ignorent la couleur de la collection
- Produits tronqués en bas
- Infos sous photos illisibles
- Gammes ignorées (ÉMOLIA)
- Page Chantal — côté texte trop chargé, mal disposé
- Deux petites collections sur une page = désert blanc

### Direction créative
- **Harmonieux mais jamais pareil** — chaque collection a sa propre personnalité visuelle
- **Dynamique mais doux** — pas chaotique, pas recette
- **Les photos travaillent fort** — elles racontent, pas juste illustrent
- **Espace blanc = respiration** — ne pas tout tasser
- **Pas de pattern reproduit** — le layout découle de ce que la collection EST
- **Textes évocateurs exploités** — description collection + tagline produit (`desc_emballage`)

---

## PAGE 2 — CHANTAL (décidé)

- Photo pleine gauche avec fondu
- Droite : grand espace blanc, message court et fort, signature Birthstone
- Épuré, élégant — pas de blocs de texte tassés

---

## STRUCTURE DES PAGES — EN COURS

| Pages | Contenu | Statut |
|-------|---------|--------|
| 1 | Couverture | ✅ base bonne |
| 2 | Mot de Chantal | direction claire |
| 3 | ? | **à déterminer** |
| 3-4 | SAPONICA — 16 produits sur 2 pages | direction validée |
| ? | PETIT NUAGE — aéré, doux, espace blanc, fond rose pâle | direction validée |
| ? | CAPRIN — 6 produits | à déterminer |
| ? | ÉMOLIA — 19 produits, 5 gammes | à déterminer |
| ? | ÉPURE — 4 produits | à déterminer |
| ? | KÉRYS — 6 produits | à déterminer |
| ? | CASA — 16 produits | à déterminer |
| ? | LUI — 6 produits | à déterminer |
| ? | ANIMA — 1 produit | à déterminer |
| ? | Philosophie | à déterminer |
| ? | Dos de couverture | à déterminer |

### SAPONICA (pages 3-4) — direction
- Double page — les 2 pages forment un tout
- Page 3 : hero photo collection (40% hauteur) + nom + slogan + phrase intro + 8 premiers produits
- Page 4 : 8 autres produits + fond `#8A7A4A` subtil pour unifier
- **À valider visuellement**

### PETIT NUAGE — direction
- Page aérée, beaucoup d'espace blanc
- Fond rose pâle `#E8D8E0` qui travaille subtilement
- 5 produits avec place pour respirer

### Page mystère avant SAPONICA
- Quelque chose qui introduit sans être une page de texte
- **À déterminer en session 9**

---

## NOTES TECHNIQUES

- Couleurs individuelles des produits (`couleur_hex` dans `Produits_v2`) sont ignorées dans le catalogue — on utilise la couleur de la **collection** pour l'harmonie visuelle
- Gammes (`nom_gamme`) disponibles dans les données — à utiliser pour ÉMOLIA notamment
- `desc_emballage` = tagline courte poétique — plus vivante que juste le nom sur les cartes
- Photos d'atelier disponibles pour intercalation : `saponification_j2hwc5`, `surgras_yw29r3`, `essences_vevuvf`, `additif_bcbpgh`, `huiles_lnjxah`, `huiles_yjw9dl`
- Logo disponible dans la médiathèque : `Logofinal` — `https://res.cloudinary.com/dfasrauyy/image/upload/v1772808486/univers-caresse/collections/n2kejyjsdwhprlw7cztf.png`

---

## FONTES SACRÉES
Playfair Display · Birthstone · DM Sans — jamais autre chose

---

## CE QUI EST FAIT — TECHNIQUE
- Données dynamiques via API ✅
- Structure HTML de base ✅
- CSS classes existantes réutilisables ✅
- Déployé sur GitHub Pages ✅

## CE QUI RESTE À FAIRE
1. Retravailler couverture (logo, fond, marges)
2. Retravailler page Chantal
3. Décider structure complète des pages
4. Construire chaque collection avec sa personnalité visuelle
5. Intégrer les textes évocateurs (description collection, tagline produit)
6. Régler marges impression

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 9 (11 avril 2026)*

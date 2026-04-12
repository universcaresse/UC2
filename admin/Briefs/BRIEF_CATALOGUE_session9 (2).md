# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 9 — À lire en entier avant de commencer**

---

## CONTEXTE

Page HTML autonome (`catalogue-apercu.html`) — booklet imprimable agrafé au centre.
Données dynamiques via `getCatalogue` (Apps Script).
Fichier dans `UC2/` — accessible via `universcaresse.github.io/UC2/catalogue-apercu.html`.

---

## FORMAT

- **Booklet agrafé au centre** — feuilles 11×17 pliées en 2, insérées les unes dans les autres
- **Toujours penser en multiples de 4 pages** — chaque feuille 11×17 = 4 pages
- La feuille extérieure contient couverture + Chantal + infos techniques + dos de couverture
- Chaque feuille ajoutée à l'intérieur = 4 pages de contenu
- Pages se voient PAR PAIRES quand le booklet est ouvert — penser double page
- **Pages tampons** à prévoir — activables/désactivables pour toujours tomber sur un multiple de 4
- **`@media print`** → 8.5×11, marges normales — **JAMAIS à fond perdu**
- **`window.print()`** déclenché par un bouton
- Fond autour des pages : beige chaud (pas noir)

---

## STYLE — RÈGLE CRITIQUE

- Le catalogue **pointe vers le CSS du site** — jamais copié, jamais dupliqué
- Si le site change de police ou de couleur principale, le catalogue suit automatiquement
- **Jamais de style inline dans le HTML ou le JS** — violation interdite
- Typo lisible — taille généreuse, pas de micro-texte. Penser accessibilité (pas tous 20 ans)

---

## DONNÉES DISPONIBLES — API `getCatalogue`

Chaque collection retourne :
- `nom`, `slogan`, `description` (2 paragraphes riches et évocateurs), `couleur_hex`, `photo_url`

Chaque gamme retourne :
- `nom`, `description`, `couleur_hex` — à mettre en évidence dans le catalogue

Chaque produit retourne :
- `nom`, `description` (poétique), `desc_emballage` (tagline courte), `couleur_hex`, `image_url`
- `nom_gamme`, `rang_gamme` — pour regrouper par gamme (ÉMOLIA notamment)
- `formats` → prix et poids

**Photos produits** : disponibles pour SAPONICA, PETIT NUAGE, ÉPURE, KÉRYS (partiel).
Manquantes pour CAPRIN, ÉMOLIA, CASA, LUI, ANIMA — **photos à venir, couleur hex en fallback**.

---

## MÉDIATHÈQUE

- La médiathèque (`Mediatheque_V2`) est le **miroir complet de Cloudinary** — toutes les photos y sont
- Les catégories Cloudinary sont le système de classification
- Photos rattachées à produit/collection/gamme/famille → dans leur propre sheet avec `image_url`
- Photos génériques (atelier, ambiance, inspiration) → dans la médiathèque avec catégorie dédiée
- **Une catégorie spécifique catalogue sera créée** pour les photos d'ambiance du catalogue
- Ces catégories servent à aller chercher les bonnes photos dynamiquement dans le catalogue
- Catégories actuelles : `collections`, `collections-noel`, `produits`, `recettes` — à enrichir

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
- **Pas de pattern reproduit** — le layout découle de ce que la collection EST
- **Dynamique mais doux** — pas chaotique, pas recette
- **Les photos travaillent fort** — elles racontent, pas juste illustrent
- **Espace blanc = respiration** — ne pas tout tasser
- **Textes évocateurs exploités** — description collection + tagline produit (`desc_emballage`)
- **Gammes mises en évidence** — chaque gamme a son hex et sa description, traitement distinct
- **Typo généreuse** — lisible pour tous les âges

---

## PAGE 2 — CHANTAL (décidé)

- Photo pleine gauche avec fondu
- Droite : grand espace blanc, message court et fort, signature Birthstone
- Épuré, élégant — pas de blocs de texte tassés

---

## STRUCTURE DES PAGES — SESSION 9

### Feuille 1 (extérieure) — fixe
| Page | Contenu |
|------|---------|
| 1 | Couverture |
| 2 | Mot de Chantal |
| Avant-dernière | Infos techniques |
| Dernière | Dos de couverture |

### Feuilles intérieures — contenu

**Feuille 2**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 3 | Table des matières — photo atelier en fond, 9 collections avec couleur + slogan | direction validée |
| 4-5 | SAPONICA — double page, 16 produits | direction validée |

**Feuille 3**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 6 | PETIT NUAGE — aéré, doux, fond rose pâle `#E8D8E0`, 4 produits | direction validée |
| 7 | CAPRIN — 6 produits, 1 gamme | à construire |

**Feuille 4**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 8 | KÉRYS — 3 gammes, 6 produits | à construire |
| 9 | ÉPURE — 4 produits, cubique, mains qui travaillent | à construire |

**Feuille 5**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 10-13 | ÉMOLIA — 4 pages, 19 produits, 5 gammes | à construire |

**Feuille 6**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 14-15 | CASA — 2 pages, 5 gammes | à construire |
| 16 | LUI — 1 page, 3 gammes | à construire |
| 17 | ANIMA — 1 page, 1 produit, intentionnel | à construire |

**Pages tampons** : à activer/désactiver selon le compte final pour rester en multiple de 4.

---

### SAPONICA (pages 4-5) — direction
- Double page — les 2 pages forment un tout
- Page gauche : hero photo collection + nom + slogan + phrase intro + produits
- Page droite : reste des produits + fond `#8A7A4A` subtil pour unifier
- Le split des produits entre les deux pages est dicté par le layout visuel, pas forcément 8-8

### PETIT NUAGE — direction
- Page aérée, beaucoup d'espace blanc
- Fond rose pâle `#E8D8E0` qui travaille subtilement
- 4 produits avec place pour respirer

### TABLE DES MATIÈRES (page 3) — direction
- Photo d'atelier en fond
- 9 collections listées avec leur couleur hex et slogan
- Visuellement intentionnel — pas du remplissage

---

## AVANT DE CODER — RÈGLE DE SESSION

- **Documenter chaque page par écrit avant d'écrire du code** — layout, intention, fixe vs variable
- Vision globale obligatoire avant toute implémentation
- Un changement à la fois — attendre confirmation avant le suivant

---

## NOTES TECHNIQUES

- Couleurs individuelles des produits (`couleur_hex`) = identité et signature du produit — à utiliser. La couleur de collection crée l'harmonie globale, la couleur du produit distingue chaque savon individuellement.
- Gammes (`nom_gamme`) disponibles dans les données — à utiliser pour ÉMOLIA et toutes collections avec gammes
- Le nom du produit et `desc_emballage` se complètent — pas obligatoirement affichés ensemble, le contexte visuel dicte. Les noms ont été choisis minutieusement, ils ont leur propre force.
- Photos produits : plus souvent carrées — à respecter dans les grilles et ratios
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
1. Ajouter catégories manquantes à la médiathèque (photos catalogue/atelier)
2. Documenter chaque page par écrit (layout + intention) avant de coder
3. Retravailler couverture (logo, fond, marges)
4. Retravailler page Chantal
5. Construire table des matières (page 3)
6. Construire chaque collection avec sa personnalité visuelle
7. Intégrer gammes comme sous-univers distincts (hex + description)
8. Intégrer les textes évocateurs (description collection, tagline produit)
9. Régler marges impression
10. Vérifier que le catalogue pointe vers le CSS du site (jamais inline, jamais copié)

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 9 (11 avril 2026)*

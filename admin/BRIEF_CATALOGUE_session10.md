# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 10 — À lire en entier avant de commencer**

---

## CONTEXTE

Page HTML autonome (`catalogue.html`) — booklet imprimable agrafé au centre.
Données dynamiques via `getCatalogue` (Apps Script).
Fichier dans `UC2/admin/` — accessible via `universcaresse.github.io/UC2/admin/catalogue.html`.
Fichiers CSS et JS dans `UC2/css/` et `UC2/js/`.

---

## STRUCTURE DES FICHIERS

- `UC2/admin/catalogue.html` — HTML uniquement, aucun style inline, aucun JS inline
- `UC2/css/catalogue.css` — styles propres au catalogue, complément de style.css
- `UC2/js/catalogue.js` — tout le JavaScript du catalogue
- `UC2/css/style.css` — CSS du site, utilisé directement par le catalogue

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

## STYLE — RÈGLES CRITIQUES

- Le catalogue **utilise le CSS du site** via `<link rel="stylesheet" href="../css/style.css">` — jamais copié, jamais dupliqué
- Réutiliser les classes de `style.css` au maximum — n'ajouter dans `catalogue.css` que ce qui est strictement nécessaire
- **Jamais de style inline dans le HTML** — violation interdite
- **Jamais de texte en dur dans le HTML ou le JS** — tout texte visible vient de l'API ou d'une variable. Exception incontournable uniquement (ex: fallback d'erreur technique)
- Typo lisible — taille généreuse, pas de micro-texte. Penser accessibilité
- `body { background: #ffffff !important; }` dans style.css — surcharger avec `!important` dans catalogue.css pour le fond beige

---

## FONTES SACRÉES
Playfair Display · Birthstone · DM Sans — jamais autre chose

---

## API — APPS SCRIPT

URL : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`
Action catalogue : `?action=getCatalogue` (pas getCataloguePublic)

Chaque collection retourne via `data.infoCollections` :
- `nom`, `slogan`, `description` (2 paragraphes — les 2 sont importants), `couleur_hex`, `photo_url`, `rang`

Chaque produit retourne :
- `nom`, `description`, `desc_emballage` (tagline), `couleur_hex`, `image_url`
- `nom_gamme`, `rang_gamme`, `desc_gamme` — pour regrouper par gamme
- `formats` → `prix_vente`, `poids`, `unite`

**Photos produits** : disponibles pour SAPONICA, PETIT NUAGE, ÉPURE, KÉRYS (partiel). Manquantes pour CAPRIN, ÉMOLIA, CASA, LUI, ANIMA — photos à venir.

**Photos atelier disponibles** (Cloudinary) :
- `saponification_j2hwc5`, `surgras_yw29r3`, `essences_vevuvf`, `additif_bcbpgh`, `huiles_lnjxah`, `huiles_yjw9dl`
URL base : `https://res.cloudinary.com/dfasrauyy/image/upload/univers-caresse/[id]`

**Logo** : `https://res.cloudinary.com/dfasrauyy/image/upload/v1772808486/univers-caresse/collections/n2kejyjsdwhprlw7cztf.png`

---

## COULEUR HEX DES PRODUITS

Le hex est une **surface expressive** — pas un détail, pas une couleur de texte. Il occupe une vraie zone visible. Si le produit change de couleur dans la base, le catalogue suit automatiquement (dynamique). Photos à venir pour toutes les collections — quand disponibles, plus de fallback hex nécessaire.

---

## PRINCIPES VISUELS

### Ce qui fonctionne
- Photo de couverture avec voile doux — beige chaud, pas noir
- Logo en bas à gauche de la couverture
- Collections avec carrés de couleur en haut à droite — dynamiques, viennent de l'API
- Pages se voient par paires — toujours penser double page

### Direction créative
- **Harmonieux mais jamais pareil** — chaque collection a sa propre personnalité visuelle
- **Pas de pattern reproduit** — le layout découle de ce que la collection EST
- **Même espace publicitaire pour chaque produit** — les variations sont dans le traitement visuel, pas dans la taille
- **Les photos travaillent fort** — elles racontent, pas juste illustrent
- **Espace blanc = respiration**
- **Textes évocateurs exploités** — description collection + tagline produit
- **Typo généreuse** — lisible pour tous les âges

---

## DONNÉES DISPONIBLES — CONTENU DYNAMIQUE

Le eyebrow de la couverture vient de l'API (`data.eyebrow` ou `data.contenu_accueil_eyebrow`).
Les carrés de couleur (couverture + dos) sont générés dynamiquement depuis les collections.
La table des matières est générée dynamiquement depuis les collections.

---

## STRUCTURE DES PAGES

### Feuille 1 (extérieure) — fixe
| Page | Contenu | Statut |
|------|---------|--------|
| 1 | Couverture | structure OK — à peaufiner |
| 2 | Mot de Chantal | problèmes visuels à régler |
| Avant-dernière | Infos techniques | à construire |
| Dernière | Dos de couverture | structure OK |

### Feuilles intérieures

**Feuille 2**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 3 | Table des matières | structure codée, à valider |
| 4-5 | SAPONICA — double page, 16 produits | codée, à valider |

**Feuille 3**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 6 | PETIT NUAGE — fond #E8D8E0, 4 produits | codée, à valider |
| 7 | CAPRIN — 6 produits | codée, à valider |

**Feuille 4**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 8 | KÉRYS — 3 gammes, 6 produits | à construire |
| 9 | ÉPURE — 4 produits | à construire |

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

**Pages tampons** : à activer/désactiver selon le compte final.

---

## PAGE 2 — CHANTAL — PROBLÈMES À RÉGLER

- Photo trop sombre — opacity trop basse + fondu trop agressif
- Titre trop grand
- Signature trop grande
- Corps de texte compressé
- Citation coupée en bas
- Pied de page mal placé
- Ce doit être une photo de Chantal — pas une photo d'atelier générique

---

## NOTES TECHNIQUES

- `desc_emballage` = tagline courte du produit — à afficher, pas obligatoirement avec le nom
- Gammes (`nom_gamme`) à utiliser pour ÉMOLIA et collections avec gammes
- Photos produits carrées — respecter le ratio dans les grilles
- Prix et poids affichés ensemble : `12,00 $ · 100 g`
- `logo-tagline` de style.css est à 1.3rem — trop grand pour pied de page catalogue, à surcharger
- Action API correcte : `getCatalogue` (pas `getCataloguePublic`)
- Chemins relatifs depuis `/admin/` : `../css/style.css`, `../css/catalogue.css`, `../js/catalogue.js`

---

## RÈGLES DE CODE

- Aucun texte en dur dans HTML ou JS — tout vient de l'API
- Aucun style inline dans HTML
- Classes génériques maximales — préfixes spécifiques seulement si vraiment nécessaire
- Réutiliser style.css au maximum avant d'ajouter dans catalogue.css
- Un changement à la fois — attendre OK avant le suivant
- Documenter chaque page par écrit avant de coder
- Changement ciblé → trouve/remplace uniquement
- Fichier complet → demander permission explicite

---

## CE QUI RESTE À FAIRE

1. ~~Séparer HTML / CSS / JS~~ ✅
2. ~~Corriger chemins relatifs depuis /admin/~~ ✅
3. ~~Corriger action API getCatalogue~~ ✅
4. Régler page Chantal (photo, proportions, pied de page)
5. Valider couverture (carrés dynamiques, eyebrow)
6. Valider table des matières
7. Valider SAPONICA double page
8. Valider PETIT NUAGE + CAPRIN
9. Construire KÉRYS, ÉPURE
10. Construire ÉMOLIA (4 pages, gammes)
11. Construire CASA, LUI, ANIMA
12. Page infos techniques
13. Vérifier multiple de 4 — pages tampons
14. Test impression final

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 10 (12 avril 2026)*

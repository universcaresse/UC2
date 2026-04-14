# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 16 — À lire en entier avant de commencer**
**Dernière mise à jour : 2026-04-13 — session 16**

---

## PROTOCOLE DE DÉBUT DE SESSION

1. Lire le brief en entier, ligne par ligne
2. Demander tous les fichiers en une seule fois :
   - `catalogue.html`, `catalogue.js`, `catalogue.css`, `style.css`
3. Faire un résumé de la demande et attendre confirmation avant de coder
4. Un changement à la fois — attendre le OK avant de livrer le suivant
5. Livrer uniquement avec trouve/remplace ciblé — jamais de fichier complet sans permission explicite

---

## RÈGLES DE CODE

- Aucun texte en dur dans HTML ou JS — tout vient de l'API
- Aucun style inline dans HTML ou JS
- Classes génériques maximales — préfixes spécifiques seulement si vraiment nécessaire
- Réutiliser style.css au maximum avant d'ajouter dans catalogue.css
- Un changement à la fois — attendre OK avant le suivant
- Documenter chaque page par écrit avant de coder
- Changement ciblé → trouve/remplace uniquement
- Fichier complet → demander permission explicite
- Tout en français — commentaires, labels visibles, noms de classes

---

## LIVRAISON DES CHANGEMENTS

- Un changement à la fois avec trouve/remplace
- Attendre le OK avant de livrer le suivant
- Le brief est mis à jour en fin de session seulement — pas après chaque changement

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
- **À l'écran aussi** — le visuel doit correspondre exactement à l'impression (marges normales, pas de fond perdu) — ce que tu vois = ce qui sort
- **`window.print()`** déclenché par un bouton
- Fond autour des pages : blanc — c'est la marge non imprimable du centre de copie

---

## AFFICHAGE ÉCRAN — NAVIGATION LIVRE

- L'affichage écran simule le booklet comme un livre qu'on tourne
- **Vue 1** : couverture seule (8.5×11) — comme tenir le booklet fermé
- **Vues intermédiaires** : doubles pages côte à côte (11×17 ouvert) — navigation Précédent/Suivant
- **Dernière vue** : dos de couverture seul (8.5×11)
- Fond blanc autour des pages — représente la marge non imprimable du centre de copie
- Le JS ramasse toutes les `.page`, les regroupe automatiquement en vues au chargement
- Noms de classes, commentaires et labels tous en français

## MARGES D'IMPRESSION

- Marges normales sur les 4 bords de chaque page 8.5×11
- **Exception** : au centre du 11×17 (pliure/reliure) — les deux pages se touchent sans marge

---

## RÈGLE UNIVERSELLE — MARGES 3 CÔTÉS ← CRITIQUE

Toutes les pages intérieures ont une marge blanche sur 3 côtés. Le 4e côté = reliure (centre du booklet) = 0.

- **Page gauche** (côté droit = reliure) : `margin: 36px 0 36px 36px`
- **Page droite** (côté gauche = reliure) : `margin: 36px 36px 36px 0`

**Implémentation CSS :**
```css
.page-g > .page-int { margin: 36px 0 36px 36px; }
.page-d > .page-int { margin: 36px 36px 36px 0; }
.page-int { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
```

**Implémentation JS — règle dynamique basée sur pageNo :**
```javascript
pageNo % 2 === 0 ? 'page-g' : 'page-d'
```

- Chaque `<div class="page">` reçoit `.page-g` ou `.page-d` selon `pageNo % 2`
- Le contenu de la page est enveloppé dans `<div class="page-int">`
- `cat-pied` est toujours **hors** du `page-int` (après la fermeture de `.page-int`)

**Statut session 15 :** en cours — CSS fait, JS partiellement appliqué

---

## STYLE — RÈGLES CRITIQUES

- Le catalogue **utilise le CSS du site** via `<link rel="stylesheet" href="../css/style.css">` — jamais copié, jamais dupliqué
- Réutiliser les classes de `style.css` au maximum — n'ajouter dans `catalogue.css` que ce qui est strictement nécessaire
- **Jamais de style inline dans le HTML** — violation interdite
- **Jamais de style inline dans le JS** — violation interdite
- **Jamais de texte en dur dans le HTML ou le JS** — tout texte visible vient de l'API ou d'une variable. Exception incontournable uniquement (ex: fallback d'erreur technique)
- Typo lisible — taille généreuse, pas de micro-texte. Penser accessibilité
- `body { background: #ffffff !important; }` dans style.css — déjà blanc, pas besoin de surcharger

---

## FONTES SACRÉES
Playfair Display · Birthstone · DM Sans — jamais autre chose

---

## API — APPS SCRIPT

URL : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`

### 3 APPELS AU CHARGEMENT — EN PARALLÈLE
1. `?action=getCatalogue` — collections + produits
2. `?action=getMediatheque` — toutes les photos (déjà dans Apps Script)
3. `?action=getContenu` — eyebrow couverture et autres textes de contenu

### getCatalogue retourne
Chaque collection via `data.infoCollections` :
- `nom`, `slogan`, `description` (2 paragraphes — les 2 sont importants), `couleur_hex`, `photo_url`, `rang`

Chaque produit :
- `nom`, `description`, `desc_emballage` (tagline), `couleur_hex`, `image_url`
- `nom_gamme`, `rang_gamme`, `desc_gamme` — pour regrouper par gamme
- `formats` → `prix_vente`, `poids`, `unite`

### getContenu retourne
- `accueil_eyebrow` → utilisé comme eyebrow de la couverture

### getMediatheque retourne
- `url`, `nom`, `categorie`, `date_ajout`
- Indexer par `nom` au chargement pour piocher par nom dans le JS

**Photos produits** : disponibles pour SAPONICA, PETIT NUAGE, ÉPURE, KÉRYS (partiel). Manquantes pour CAPRIN, ÉMOLIA, CASA, LUI, ANIMA — photos à venir.

**Photos atelier disponibles** (dans médiathèque) :
- `saponification_j2hwc5`, `surgras_yw29r3`, `essences_vevuvf`, `additif_bcbpgh`, `huiles_lnjxah`, `huiles_yjw9dl`

**Logo** : dans médiathèque — nom `Logofinal`

---

## COULEUR HEX DES PRODUITS

Le hex est une **surface expressive** — pas un détail, pas une couleur de texte. Il occupe une vraie zone visible. Si le produit change de couleur dans la base, le catalogue suit automatiquement (dynamique). Photos à venir pour toutes les collections — quand disponibles, plus de fallback hex nécessaire.

---

## PRINCIPES VISUELS

### Direction créative
- **Harmonieux mais jamais pareil** — chaque collection a sa propre personnalité visuelle
- **Pas de pattern reproduit** — le layout découle de ce que la collection EST
- **Même espace publicitaire pour chaque produit** — chaque produit a exactement la même surface totale, pas de favori. Les variations sont dans le traitement visuel, pas dans la taille
- **Les photos travaillent fort** — elles racontent, pas juste illustrent
- **Espace blanc = respiration** — jamais de circulaire d'épicerie
- **Textes évocateurs exploités** — description collection + tagline produit
- **Typo généreuse** — lisible pour tous les âges
- **Photos d'ambiance/atelier intercalées** entre les produits pour aérer et casser la monotonie

---

## RENDU DYNAMIQUE — RÈGLES CRITIQUES ← NOUVEAU SESSION 16

### Identification des collections
- **Jamais de nom de collection hardcodé dans le JS** — le nom peut changer
- **Jamais de détection par rang dans le JS** — le rang peut changer
- **`col_id` est l'identifiant stable** — c'est lui qui détermine quelle fonction de rendu s'applique à quelle collection
- Chaque collection a sa propre fonction de rendu associée à son `col_id`
- Les collections nouvelles (ajouts futurs) reçoivent automatiquement un rendu générique jusqu'à ce qu'une fonction spécifique soit définie pour leur `col_id`
- Le rang détermine uniquement **l'ordre d'apparition** dans le catalogue — rien d'autre
- Les fonctions hardcodées par nom (`construirePagePetitNuage`, `construirePageCaprin`, `construireDoubleSaponica`) sont **abandonnées** — remplacées par un dispatch par `col_id`

### Toutes les pages collections sont à refaire
- Le rendu actuel de toutes les collections est rejeté — circulaire d'épicerie
- Chaque collection repart de zéro avec sa propre personnalité visuelle
- La personnalité visuelle est définie et documentée dans ce brief pour chaque `col_id` connu

---

## CARTE PRODUIT — RÈGLES CRITIQUES ← NOUVEAU SESSION 15

**Principe de base :**
- Chaque carte = **photo carrée** (ratio 1:1 strict, respecté dans le CSS) + **bloc hex**
- Le bloc hex est une **vraie surface** — pas un bandeau mince
- Même surface totale pour toutes les cartes — pas de carte plus grande qu'une autre

**Les traitements A/B/C/D sont abandonnés** — ils produisaient des cartes illisibles et écrasées.

**Nouveaux traitements visuels — disposition hex/photo variable :**
- Bloc hex à gauche, photo carrée à droite
- Bloc hex à droite, photo carrée à gauche
- Bloc hex en haut, photo carrée en bas
- Bloc hex en bas, photo carrée en haut
- Grand bloc hex, photo carrée centrée dans le bloc
- Grand bloc hex, photo dans un coin (haut-gauche, haut-droite, bas-gauche, bas-droite)
- D'autres combinaisons possibles — l'imagination s'applique

**Infos dans le bloc hex :** nom du produit, tagline (`desc_emballage`), prix·poids

**Photos d'ambiance :** des photos d'atelier (médiathèque) sont intercalées dans la grille pour aérer — elles ont le même espace qu'une carte produit mais sans bloc hex.

**Ratio carré strict :** `aspect-ratio: 1 / 1` sur la photo — jamais de photo étirée ou coupée aléatoirement.

---

## DONNÉES DISPONIBLES — CONTENU DYNAMIQUE

L'eyebrow de la couverture vient de `getContenu` → clé `accueil_eyebrow`.
Les carrés de couleur (couverture + dos) sont générés dynamiquement depuis les collections.
La table des matières est générée dynamiquement depuis les collections.

---

## STRUCTURE DES PAGES

### Feuille 1 (extérieure) — fixe
| Page | Contenu | Statut |
|------|---------|--------|
| 1 | Couverture | corrections en cours |
| 2 | Mot de Chantal | problèmes visuels à régler |
| Avant-dernière | Infos techniques | à construire |
| Dernière | Dos de couverture | structure OK |

### Feuilles intérieures

**Feuille 2**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 3 | Table des matières | structure codée, à valider |
| 4-5 | SAPONICA — double page, 16 produits | à refaire — session 16 |

**Feuille 3**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 6 | PETIT NUAGE — fond #E8D8E0, 4 produits | en cours session 15 |
| 7 | CAPRIN — 6 produits | en cours session 15 |

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

## PAGE 1 — COUVERTURE — CORRECTIONS

| # | Décision | Statut | Horodatage |
|---|----------|--------|------------|
| 1 | Supprimer `.cover-overlay` du HTML | ✅ fait | 2026-04-12 |
| 2 | Eyebrow au-dessus du logo dans le HTML | ✅ fait | 2026-04-12 |
| 3 | Eyebrow couleur blanc | ✅ fait | 2026-04-12 |
| 4 | Logo en blanc via `filter: brightness(0) invert(1)` | ✅ fait | 2026-04-12 |
| 5 | Nom de chaque collection à gauche du carré, texte blanc uppercase | ✅ fait | 2026-04-12 |
| 6 | Bloc collections — descendre, décaler gauche, plus d'espace, typo plus grande | ✅ fait | 2026-04-12 |
| 7 | Photo de couverture → médiathèque via `getMediatheque`, nom `photo_couverture` | ⚠️ code fait, photo à ajouter dans médiathèque | 2026-04-12 |
| 8 | 3 appels API parallèles au chargement : `getCatalogue` + `getMediatheque` + `getContenu` | ✅ fait | 2026-04-12 |
| 9 | Fond de page blanc, photo sur 3 côtés avec marge (haut, bas, droite), gauche = 0 | ✅ fait | 2026-04-12 |
| 10 | Masque dégradé radial sur la photo pour adoucir les bords | ✅ fait | 2026-04-12 |
| 11 | Logo — grosseur à revoir à l'œil | 🔴 à régler | 2026-04-12 |
| 12 | Bloc collections — grosseur encore insuffisante, à revoir à l'œil | 🔴 à régler | 2026-04-12 |
| 13 | Dégradé sombre pour lisibilité du texte — à placer sur `.cover-photo::after` | 🔴 à régler | 2026-04-12 |

---

## PAGE 2 — CHANTAL — PROBLÈMES À RÉGLER

- Citation coupée en bas
- Pied de page mal placé

---

## NOTES TECHNIQUES

- `desc_emballage` = tagline courte du produit — à afficher, pas obligatoirement avec le nom
- Gammes (`nom_gamme`) à utiliser pour ÉMOLIA et collections avec gammes
- Photos produits carrées — `aspect-ratio: 1 / 1` strict dans le CSS — JAMAIS d'étirement ou de coupure aléatoire
- Prix et poids affichés ensemble : `12,00 $ · 100 g`
- `logo-tagline` de style.css est à 1.3rem — trop grand pour pied de page catalogue — surcharger `.cat-pied .logo-tagline` dans catalogue.css
- Chemins relatifs depuis `/admin/` : `../css/style.css`, `../css/catalogue.css`, `../js/catalogue.js`
- `.cover-overlay` — supprimé (était inutile)
- La page Philosophie est dans le HTML mais **absente du brief** — statut à clarifier

---

## VIOLATIONS À CORRIGER (catalogue.js)

- `style="font-size:17px;"` × 5 sur `.logo-tagline` dans les pieds de page → régler via `.cat-pied .logo-tagline` dans catalogue.css
- `style="background:couleur18;"` — fonds de pages dynamiques
- `style="background:couleur;"` — traits, points, dots
- `style="color:couleur;"` — eyebrow et noms mini
- Le pattern `--col-hex` CSS custom property est acceptable

---

## CE QUI RESTE À FAIRE

1. ~~Séparer HTML / CSS / JS~~ ✅
2. ~~Corriger chemins relatifs depuis /admin/~~ ✅
3. ~~Corriger action API getCatalogue~~ ✅
4. ~~Ajouter navigation livre (écran)~~ ✅
5. ~~Fond de page blanc~~ ✅
6. ~~Photo couverture — marge 3 côtés, masque dégradé radial~~ ✅
7. ~~Règle universelle marges 3 côtés — CSS `.page-g` / `.page-d` / `.page-int`~~ ✅
8. **Refaire toutes les pages collections** — dispatch par `col_id`, nouveaux traitements cartes, photos carrées, hex surface expressive, photos ambiance intercalées ← PRIORITÉ SESSION 16
9. Appliquer `.page-g/.page-d` + `.page-int` dans toutes les fonctions JS
10. Couverture — dégradé lisibilité texte sur `.cover-photo::after`
11. Couverture — logo grosseur
12. Couverture — bloc collections grosseur
13. Régler page Chantal (photo, proportions, pied de page, texte → API)
14. Valider table des matières (div #tdm-liste manquante dans HTML)
15. Valider couverture (carrés dynamiques, eyebrow)
16. Valider PETIT NUAGE + CAPRIN
17. Construire KÉRYS, ÉPURE
18. Construire ÉMOLIA (4 pages, gammes)
19. Construire CASA, LUI, ANIMA
20. Page infos techniques
21. Éliminer toutes les violations style inline du JS
22. Vérifier multiple de 4 — pages tampons
23. Test impression final

---

## JOURNAL DES SESSIONS

| # | Session | Date | Travail |
|---|---------|------|---------|
| 1–5 | 1–5 | — | Création initiale |
| 6 | 6 | — | Création du brief |
| 7 | 7–9 | — | Développement pages |
| 8 | 10 | 2026-04-12 | Séparation HTML/CSS/JS, chemins relatifs, action API |
| 9 | 11 | 2026-04-12 | Analyse complète 4 fichiers + code.gs, décisions page 1 couverture, protocole fichiers, changements couverture partiels — session interrompue |
| 10 | 12 | 2026-04-12 | Réécriture brief — numérotation séquentielle + horodatage + protocole début de session |
| 11 | 13 | 2026-04-12 | Navigation livre — fond blanc, couverture seule, doubles pages, dos seul — JS + CSS + HTML |
| 12 | 14 | 2026-04-12 | Couverture — fond blanc, photo 3 côtés, masque dégradé radial |
| 13 | 15 | 2026-04-13 | Règle universelle marges 3 côtés — `.page-g` / `.page-d` / `.page-int` — CSS fait, JS en cours |
| 14 | 15 | 2026-04-13 | Abandon traitements A/B/C/D — nouvelles règles cartes produits — hex surface expressive, photos carrées strict, ambiance intercalées |
| 15 | 16 | 2026-04-13 | Abandon fonctions hardcodées par nom — dispatch par `col_id` — toutes les pages collections à refaire — rang = ordre seulement |

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 15 (2026-04-13)*

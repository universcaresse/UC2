# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 11 — À lire en entier avant de commencer**

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

## FICHIERS À DEMANDER EN DÉBUT DE SESSION
**Les demander un à la fois — lire au complet avant d'en demander un autre**

1. `catalogue.html`
2. `catalogue.js`
3. `catalogue.css`
4. `style.css`
5. `pour_catalogue.xlsx`
6. `code.gs`

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
- Fond autour des pages : beige chaud (pas noir)

---

## STYLE — RÈGLES CRITIQUES

- Le catalogue **utilise le CSS du site** via `<link rel="stylesheet" href="../css/style.css">` — jamais copié, jamais dupliqué
- Réutiliser les classes de `style.css` au maximum — n'ajouter dans `catalogue.css` que ce qui est strictement nécessaire
- **Jamais de style inline dans le HTML** — violation interdite
- **Jamais de style inline dans le JS** — violation interdite
- **Jamais de texte en dur dans le HTML ou le JS** — tout texte visible vient de l'API ou d'une variable. Exception incontournable uniquement (ex: fallback d'erreur technique)
- Typo lisible — taille généreuse, pas de micro-texte. Penser accessibilité
- `body { background: #ffffff !important; }` dans style.css — surcharger avec `!important` dans catalogue.css pour le fond beige

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

## PAGE 1 — COUVERTURE — CORRECTIONS

| # | Décision | Statut | Date |
|---|----------|--------|------|
| 1 | Supprimer `.cover-overlay` du HTML | ✅ fait | 2026-04-12 |
| 2 | Eyebrow au-dessus du logo dans le HTML | ✅ fait | 2026-04-12 |
| 3 | Eyebrow couleur blanc | ✅ fait | 2026-04-12 |
| 4 | Logo en blanc via `filter: brightness(0) invert(1)` | ✅ fait | 2026-04-12 |
| 5 | Nom de chaque collection à gauche du carré, texte blanc uppercase | ✅ fait | 2026-04-12 |
| 6 | Bloc collections — descendre, décaler gauche, plus d'espace, typo plus grande | ✅ fait | 2026-04-12 |
| 7 | Photo de couverture → médiathèque via `getMediatheque`, nom `photo_couverture` | ⚠️ code fait, photo à ajouter dans médiathèque | 2026-04-12 |
| 8 | 3 appels API parallèles au chargement : `getCatalogue` + `getMediatheque` + `getContenu` | ✅ fait | 2026-04-12 |
| 9 | Fond perdu à éliminer — photo doit avoir marges normales (0.5 po) comme impression | 🔴 à régler | 2026-04-12 |
| 10 | Logo — grosseur à revoir à l'œil, actuellement encore trop petit visuellement | 🔴 à régler | 2026-04-12 |
| 11 | Bloc collections — grosseur encore insuffisante, à revoir à l'œil | 🔴 à régler | 2026-04-12 |

**NOTE TECHNIQUE — photo couverture** : la photo est encore codée en dur dans le CSS (`.cover-photo` background). Le JS applique `--cover-photo-url` via `style.setProperty` mais la photo du CSS écrase. À régler : retirer l'URL du CSS, laisser uniquement `background-image: var(--cover-photo-url)`.

---

## PAGE 2 — CHANTAL — PROBLÈMES À RÉGLER

- Photo trop sombre — opacity trop basse + fondu trop agressif
- Titre trop grand
- Signature trop grande
- Corps de texte compressé
- Citation coupée en bas
- Pied de page mal placé
- Ce doit être une photo de Chantal — pas une photo d'atelier générique
- Tout le texte est en dur dans le HTML — doit venir de l'API

---

## NOTES TECHNIQUES

- `desc_emballage` = tagline courte du produit — à afficher, pas obligatoirement avec le nom
- Gammes (`nom_gamme`) à utiliser pour ÉMOLIA et collections avec gammes
- Photos produits carrées — respecter le ratio dans les grilles
- Prix et poids affichés ensemble : `12,00 $ · 100 g`
- `logo-tagline` de style.css est à 1.3rem — trop grand pour pied de page catalogue — surcharger `.cat-pied .logo-tagline` dans catalogue.css
- Chemins relatifs depuis `/admin/` : `../css/style.css`, `../css/catalogue.css`, `../js/catalogue.js`
- `.cover-overlay` — supprimé (était inutile)
- La page Philosophie est dans le HTML mais **absente du brief** — statut à clarifier
- Table des matières : le JS cherche `#tdm-liste` mais la div n'est pas dans le HTML

---

## VIOLATIONS À CORRIGER (catalogue.js)

- `style="font-size:17px;"` × 5 sur `.logo-tagline` dans les pieds de page → régler via `.cat-pied .logo-tagline` dans catalogue.css
- `style="background:couleur18;"` — fonds de pages dynamiques
- `style="background:couleur;"` — traits, points, dots
- `style="color:couleur;"` — eyebrow et noms mini
- Le pattern `--col-hex` CSS custom property est acceptable

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

## LIVRAISON DES CHANGEMENTS

- Un changement à la fois avec trouve/remplace
- Attendre le OK avant de livrer le suivant
- Le brief est mis à jour en fin de session seulement — pas après chaque changement

---

## CE QUI RESTE À FAIRE

1. ~~Séparer HTML / CSS / JS~~ ✅
2. ~~Corriger chemins relatifs depuis /admin/~~ ✅
3. ~~Corriger action API getCatalogue~~ ✅
4. **Corriger page 1 — couverture** (5 corrections listées ci-dessus) ← EN COURS
5. Régler page Chantal (photo, proportions, pied de page, texte → API)
6. Valider table des matières (div #tdm-liste manquante dans HTML)
7. Valider couverture (carrés dynamiques, eyebrow)
8. Valider SAPONICA double page
9. Valider PETIT NUAGE + CAPRIN
10. Construire KÉRYS, ÉPURE
11. Construire ÉMOLIA (4 pages, gammes)
12. Construire CASA, LUI, ANIMA
13. Page infos techniques
14. Éliminer toutes les violations style inline du JS
15. Vérifier multiple de 4 — pages tampons
16. Test impression final

---

## JOURNAL DES SESSIONS

| Session | Date | Travail |
|---------|------|---------|
| 1–5 | — | Création initiale |
| 6 | — | Création du brief |
| 7–9 | — | Développement pages |
| 10 | 2026-04-12 | Séparation HTML/CSS/JS, chemins relatifs, action API |
| 11 | 2026-04-12 | Analyse complète 4 fichiers + code.gs, décisions page 1 couverture, protocole fichiers, changements couverture partiels — session interrompue |

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 11 (12 avril 2026)*

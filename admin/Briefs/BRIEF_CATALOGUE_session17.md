# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 17 — À lire en entier avant de commencer**
**Dernière mise à jour : 2026-04-14 — session 17**

---

## PROTOCOLE DE DÉBUT DE SESSION

1. Lire le brief en entier, ligne par ligne
2. Demander tous les fichiers en une seule fois : `catalogue.html`, `catalogue.js`, `catalogue.css`, `style.css`
3. Faire un résumé de la demande et attendre confirmation avant de coder
4. Un changement à la fois — attendre le OK avant de livrer le suivant
5. Livrer uniquement avec trouve/remplace ciblé — jamais de fichier complet sans permission explicite

---

## RÈGLES DE CODE

- Aucun texte en dur dans HTML ou JS — tout vient de l'API
- Aucun style inline dans HTML ou JS — violation interdite
- Le pattern `--col-hex` CSS custom property est acceptable (ex: `style="--col-hex:#fff"`)
- Classes génériques maximales — préfixes spécifiques seulement si vraiment nécessaire
- Réutiliser `style.css` au maximum avant d'ajouter dans `catalogue.css`
- Un changement à la fois — attendre OK avant le suivant
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
Données dynamiques via Apps Script.
Fichier dans `UC2/admin/` — accessible via `universcaresse.github.io/UC2/admin/catalogue.html`.
Fichiers CSS et JS dans `UC2/css/` et `UC2/js/`.

---

## STRUCTURE DES FICHIERS

- `UC2/admin/catalogue.html` — HTML uniquement, aucun style inline, aucun JS inline
- `UC2/css/catalogue.css` — styles propres au catalogue, complément de style.css
- `UC2/js/catalogue.js` — tout le JavaScript du catalogue
- `UC2/css/style.css` — CSS du site, utilisé directement par le catalogue

---

## FORMAT PHYSIQUE

- **Booklet agrafé au centre** — feuilles 11×17 pliées en 2, insérées les unes dans les autres
- **Toujours en multiples de 4 pages** — chaque feuille 11×17 = 4 pages
- La feuille extérieure contient : couverture + Chantal + infos techniques + dos de couverture
- Chaque feuille ajoutée à l'intérieur = 4 pages de contenu
- Pages vues PAR PAIRES quand le booklet est ouvert — toujours penser double page
- **Pages tampons** à prévoir — activables/désactivables pour toujours tomber sur un multiple de 4

---

## AFFICHAGE ÉCRAN — NAVIGATION LIVRE

- L'affichage écran simule le booklet comme un livre qu'on tourne
- **Vue 1** : couverture seule (8.5×11) — comme tenir le booklet fermé
- **Vues intermédiaires** : doubles pages côte à côte (11×17 ouvert) — navigation Précédent/Suivant
- **Dernière vue** : dos de couverture seul (8.5×11)
- Fond blanc autour des pages
- Le JS regroupe automatiquement toutes les `.page` en vues au chargement

---

## IMPRESSION

- `@media print` → 8.5×11, marges normales — **JAMAIS à fond perdu**
- Ce que tu vois à l'écran = ce qui sort à l'impression (marges normales, pas de fond perdu)
- `window.print()` déclenché par un bouton
- Fond autour des pages : blanc — représente la marge non imprimable du centre de copie

---

## BANDE BLANCHE — RÈGLE UNIVERSELLE ← CRITIQUE

Chaque page 8.5×11 a une **bande blanche visible sur 3 côtés**. Le 4e côté = reliure = 0.

- **Page gauche** (côté droit = reliure) : marge intérieure `36px 0 36px 36px`
- **Page droite** (côté gauche = reliure) : marge intérieure `36px 36px 36px 0`

**Implémentation CSS :**
```css
.page-g > .page-int { margin: 36px 0 36px 36px; }
.page-d > .page-int { margin: 36px 36px 36px 0; }
.page-int { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
```

**Implémentation JS :**
```javascript
pageNo % 2 === 0 ? 'page-g' : 'page-d'
```

**EXCEPTION — pages sans bande blanche (voulu, pas un bug) :**
- **Couverture (P1)** : photo plein format, fond blanc, pas de bande blanche
- **Dos de couverture** : centré, pas de bande blanche

---

## PIED DE PAGE — RÈGLE CRITIQUE

- Le `cat-pied` est **toujours hors du `page-int`** — il se place après la fermeture de `.page-int`
- Il doit être **visible dans la bande blanche du bas** — jamais écrasé dans la reliure
- Il ne doit jamais tomber dans la zone non imprimable du centre de copie
- Structure correcte :
```html
<div class="page page-g">
  <div class="page-int">
    <!-- contenu -->
  </div>
  <div class="cat-pied">...</div>
</div>
```

---

## TYPOGRAPHIE

- **Playfair Display · Birthstone · DM Sans** — jamais autre chose
- Typo généreuse — lisible pour tous les âges, penser accessibilité

---

## COULEURS HEX DES COLLECTIONS

- Le hex est une **surface expressive** — pas un détail, pas une couleur de texte
- Il occupe une vraie zone visible sur chaque carte produit
- Si la couleur change dans la base → catalogue suit automatiquement (dynamique)

---

## DIRECTION CRÉATIVE

- **Harmonieux mais jamais pareil** — chaque collection a sa propre personnalité visuelle
- **Pas de pattern reproduit** — le layout découle de ce que la collection EST
- **Même surface totale pour chaque produit** — variations visuelles, pas de taille
- **Les photos travaillent fort** — elles racontent, elles n'illustrent pas
- **Espace blanc = respiration** — jamais de circulaire d'épicerie
- **Textes évocateurs exploités** — description collection + tagline produit
- **Photos d'ambiance/atelier intercalées** entre les produits pour aérer

---

## CARTES PRODUITS — RÈGLES CRITIQUES

- Chaque carte = **photo carrée** (ratio 1:1 strict) + **bloc hex**
- Le bloc hex est une **vraie surface** — pas un bandeau mince
- Même surface totale pour toutes les cartes — pas de carte plus grande qu'une autre
- `aspect-ratio: 1 / 1` sur la photo — jamais de photo étirée ou coupée aléatoirement

**Dispositions hex/photo variables (selon collection) :**
- Bloc hex à gauche, photo carrée à droite
- Bloc hex à droite, photo carrée à gauche
- Bloc hex en haut, photo carrée en bas
- Bloc hex en bas, photo carrée en haut
- Grand bloc hex, photo carrée centrée dans le bloc
- Grand bloc hex, photo dans un coin
- D'autres combinaisons possibles

**Infos dans le bloc hex :** nom du produit · tagline (`desc_emballage`) · prix·poids

**Les traitements A/B/C/D sont abandonnés** — ils produisaient des cartes illisibles.

---

## RENDU DYNAMIQUE — RÈGLES CRITIQUES

- **Jamais de nom de collection hardcodé dans le JS** — le nom peut changer
- **Jamais de détection par rang dans le JS** — le rang peut changer
- **`col_id` est l'identifiant stable** — c'est lui qui détermine quelle fonction de rendu s'applique
- Chaque collection a sa propre fonction de rendu associée à son `col_id`
- Collections nouvelles → rendu générique automatique jusqu'à fonction spécifique définie
- Le rang détermine uniquement **l'ordre d'apparition** — rien d'autre
- Les fonctions `construirePagePetitNuage`, `construirePageCaprin`, `construireDoubleSaponica` sont **abandonnées** — remplacées par dispatch par `col_id`

---

## API — APPS SCRIPT

URL : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`

### 3 APPELS AU CHARGEMENT — EN PARALLÈLE
1. `?action=getCatalogue` — collections + produits
2. `?action=getMediatheque` — toutes les photos
3. `?action=getContenu` — textes de contenu

### getCatalogue retourne
Chaque collection via `data.infoCollections` :
- `nom`, `slogan`, `description` (2 paragraphes), `couleur_hex`, `photo_url`, `rang`

Chaque produit :
- `nom`, `description`, `desc_emballage` (tagline), `couleur_hex`, `image_url`
- `nom_gamme`, `rang_gamme`, `desc_gamme` — pour regrouper par gamme
- `formats` → `prix_vente`, `poids`, `unite`

### getContenu retourne
- `accueil_eyebrow` → eyebrow de la couverture

### getMediatheque retourne
- `url`, `nom`, `categorie`, `date_ajout`
- Indexer par `nom` au chargement

**Photos produits disponibles :** SAPONICA, PETIT NUAGE, ÉPURE, KÉRYS (partiel)
**Photos à venir :** CAPRIN, ÉMOLIA, CASA, LUI, ANIMA

**Photos atelier disponibles (médiathèque) :**
`saponification_j2hwc5`, `surgras_yw29r3`, `essences_vevuvf`, `additif_bcbpgh`, `huiles_lnjxah`, `huiles_yjw9dl`

**Logo :** dans médiathèque — nom `Logofinal`

---

## STRUCTURE DES PAGES

### Feuille 1 (extérieure) — fixe
| Page | Contenu | Statut |
|------|---------|--------|
| 1 | Couverture — plein format, pas de bande blanche | corrections en cours |
| 2 | Mot de Chantal | citation coupée, pied de page à corriger |
| Avant-dernière | Infos techniques | à construire |
| Dernière | Dos de couverture — pas de bande blanche | structure OK |

### Feuilles intérieures

**Feuille 2**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 3 | Table des matières | à valider |
| 4-5 | SAPONICA — double page, 16 produits | à refaire — dispatch col_id |

**Feuille 3**
| Pages | Contenu | Statut |
|-------|---------|--------|
| 6 | PETIT NUAGE — fond #E8D8E0, 4 produits | à refaire — dispatch col_id |
| 7 | CAPRIN — 6 produits | à refaire — dispatch col_id |

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

## PAGE 1 — COUVERTURE

- Photo plein format — **pas de bande blanche, c'est voulu**
- Photo sur 3 côtés avec marge (haut, bas, droite), gauche = 0
- Masque dégradé radial pour adoucir les bords
- Fond de page blanc

**Corrections en attente :**
| # | Décision | Statut |
|---|----------|--------|
| 1 | Logo — grosseur à revoir à l'œil | 🔴 à régler |
| 2 | Bloc collections — grosseur encore insuffisante | 🔴 à régler |
| 3 | Dégradé sombre pour lisibilité du texte sur `.cover-photo::after` | 🔴 à régler |
| 4 | Photo couverture — ajouter `photo_couverture` dans médiathèque | ⚠️ photo à ajouter |

---

## PAGE 2 — CHANTAL

**Problèmes à régler :**
- Citation coupée en bas
- Pied de page mal placé — tombe dans la zone non imprimable

---

## VIOLATIONS À CORRIGER (catalogue.js)

- `style="font-size:17px;"` × 5 sur `.logo-tagline` dans les pieds de page → régler via `.cat-pied .logo-tagline` dans catalogue.css
- `style="background:couleur;"` — traits, points, dots → utiliser `--col-hex`
- `style="color:couleur;"` — eyebrow et noms → utiliser `--col-hex`
- Fonctions hardcodées par nom (`construirePagePetitNuage`, `construirePageCaprin`, `construireDoubleSaponica`) → à remplacer par dispatch `col_id`

---

## CE QUI RESTE À FAIRE

1. ~~Séparer HTML / CSS / JS~~ ✅
2. ~~Corriger chemins relatifs depuis /admin/~~ ✅
3. ~~Corriger action API getCatalogue~~ ✅
4. ~~Ajouter navigation livre (écran)~~ ✅
5. ~~Fond de page blanc~~ ✅
6. ~~Photo couverture — marge 3 côtés, masque dégradé radial~~ ✅
7. ~~Règle universelle marges 3 côtés — CSS `.page-g` / `.page-d` / `.page-int`~~ ✅ (CSS fait)
8. **Appliquer bande blanche + pied de page correct sur toutes les pages** ← PRIORITÉ SESSION 17
9. Refaire toutes les pages collections — dispatch par `col_id`, nouvelles cartes, hex surface expressive
10. Couverture — dégradé lisibilité texte
11. Couverture — logo grosseur
12. Couverture — bloc collections grosseur
13. Régler page Chantal (citation, pied de page)
14. Valider table des matières
15. Construire KÉRYS, ÉPURE
16. Construire ÉMOLIA (4 pages, gammes)
17. Construire CASA, LUI, ANIMA
18. Page infos techniques
19. Éliminer toutes les violations style inline du JS
20. Vérifier multiple de 4 — pages tampons
21. Test impression final
22. Clarifier statut page Philosophie (dans le HTML mais absente du brief)

---

## JOURNAL DES SESSIONS

| # | Session | Date | Travail |
|---|---------|------|---------|
| 1–5 | 1–5 | — | Création initiale |
| 6 | 6 | — | Création du brief |
| 7 | 7–9 | — | Développement pages |
| 8 | 10 | 2026-04-12 | Séparation HTML/CSS/JS, chemins relatifs, action API |
| 9 | 11 | 2026-04-12 | Analyse complète 4 fichiers + code.gs, décisions couverture |
| 10 | 12 | 2026-04-12 | Réécriture brief |
| 11 | 13 | 2026-04-12 | Navigation livre — fond blanc, couverture seule, doubles pages, dos seul |
| 12 | 14 | 2026-04-12 | Couverture — fond blanc, photo 3 côtés, masque dégradé radial |
| 13 | 15 | 2026-04-13 | Règle universelle marges 3 côtés — CSS `.page-g` / `.page-d` / `.page-int` |
| 14 | 15 | 2026-04-13 | Abandon traitements A/B/C/D — nouvelles règles cartes produits |
| 15 | 16 | 2026-04-13 | Abandon fonctions hardcodées par nom — dispatch par `col_id` |
| 16 | 17 | 2026-04-14 | Réécriture complète du brief — clarification bande blanche, pied de page, exceptions couverture/dos |

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 17 (2026-04-14)*

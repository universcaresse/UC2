# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session 8 — À lire en entier avant de commencer**

---

## CONTEXTE

Page HTML autonome (`catalogue-apercu.html`) qui génère un booklet imprimable.
Données codées en dur pour l'aperçu — migration vers `getCataloguePublic()` à faire plus tard.

---

## FORMAT

- **Booklet agrafé au centre** — pages 8.5×11, imprimées en 11×17 recto-verso
- L'utilisateur imprime lui-même et agrafe — zéro manipulation au centre de copie
- **`@media print`** → 8.5×11, marges d'impression normales (pas à fond perdu)
- **`window.print()`** déclenché par un bouton
- 10 pages produites en session 7 — structure à revoir

---

## DONNÉES — SOURCE

Données tirées de `Univers_Caresse.xlsx` — onglets `Collections_v2`, `Gammes_v2`, `Produits_v2`, `Produits_Formats_v2`, `Mediatheque_V2`.

**Ne jamais coder de données en dur dans la version finale** — tout sera dynamique via `appelAPI`.
Pour l'aperçu HTML : données codées en dur acceptées.

### Collections (ordre par rang)
| Rang | Collection | Couleur | Produits publics |
|------|-----------|---------|-----------------|
| 1 | SAPONICA | #8A7A4A | 16 |
| 2 | PETIT NUAGE | #E8D8E0 | 5 |
| 3 | CAPRIN | #957A6A | 6 |
| 4 | ÉMOLIA | #C4956A | 19 |
| 5 | ÉPURE | #6A6A50 | 4 |
| 6 | KÉRYS | #5A9A7A | 6 |
| 7 | CASA | #9AAF60 | 16 |
| 8 | LUI | #3A5A6A | 6 |
| 9 | ANIMA | #C4845A | 1 |

### État des images produits
- **SAPONICA** — toutes les images disponibles ✓
- **PETIT NUAGE** — images disponibles, prix manquants sur 4/5 produits
- **CAPRIN** — aucune image produit
- **ÉMOLIA** — aucune image produit, prix manquants sur 18/19
- **ÉPURE** — images disponibles ✓
- **KÉRYS** — images partielles (2/6)
- **CASA** — aucune image produit
- **LUI** — aucune image produit
- **ANIMA** — aucune image produit

Là où il manque une image → bloc couleur de la collection.
Là où il manque un prix → champ vide, ne pas afficher.

---

## PHOTOS DISPONIBLES — MÉDIATHÈQUE

### Couverture
`rustic-pine-wood-shelving-units-filled-w_nwviwu8US0-S9GgJSsz-5Q_tHOMx3yvRTKbYUxTQjN3Bw_ykdd4h`
URL : `https://res.cloudinary.com/dfasrauyy/image/upload/v1774629257/rustic-pine-wood-shelving-units-filled-w_nwviwu8US0-S9GgJSsz-5Q_tHOMx3yvRTKbYUxTQjN3Bw_ykdd4h.jpg`

### Page Chantal
`a-warm-inviting-photograph-of-an-artisan`
URL : `https://res.cloudinary.com/dfasrauyy/image/upload/v1774627932/a-warm-inviting-photograph-of-an-artisan_uCbddMjKSkWQWJrd_XQJdg_VTqWCfYYQ_Kna8JgcGw28A_lmm3kj.jpg`

### Photos d'atelier (pour intercaler entre collections)
- `saponification_j2hwc5` → `https://res.cloudinary.com/dfasrauyy/image/upload/v1775150378/saponification_j2hwc5.jpg`
- `surgras_yw29r3` → `https://res.cloudinary.com/dfasrauyy/image/upload/v1773879204/surgras_yw29r3.jpg`
- `essences_vevuvf` → `https://res.cloudinary.com/dfasrauyy/image/upload/v1773878615/essences_vevuvf.jpg`
- `additif_bcbpgh` → `https://res.cloudinary.com/dfasrauyy/image/upload/v1773869994/additif_bcbpgh.jpg`
- `huiles_lnjxah` → `https://res.cloudinary.com/dfasrauyy/image/upload/v1773869994/huiles_lnjxah.jpg`
- `huiles_yjw9dl` → `https://res.cloudinary.com/dfasrauyy/image/upload/v1773863347/huiles_yjw9dl.jpg`

---

## STRUCTURE DES PAGES — SESSION 7 (v1)

| Page | Contenu |
|------|---------|
| 1 | Couverture |
| 2 | Mot de Chantal |
| 3 | SAPONICA — 16 produits grille 4×4 |
| 4 | CAPRIN (6) + PETIT NUAGE (5) — partagée |
| 5 | ÉMOLIA — 19 produits grille 4×5 |
| 6 | ÉPURE (4) + KÉRYS (6) — partagée |
| 7 | CASA — 16 produits grille 4×4 |
| 8 | LUI (6) + ANIMA (1) — partagée |
| 9 | Philosophie |
| 10 | Dos de couverture |

---

## PROBLÈMES IDENTIFIÉS — SESSION 7

- Textes coupés dans les petites cartes
- Marges d'impression à revoir (pas à fond perdu)
- **Manque d'humanité** — ressemble à une liste d'épicerie, trop mécanique
- Aucune respiration entre les collections

---

## DIRECTION CRÉATIVE — SESSION 8

### Problème principal
Trop de tuiles de produits, pas assez d'âme. Le catalogue doit raconter une histoire.

### Solutions à explorer
1. **Hero plus généreux** par collection — plus grand, slogan bien mis en valeur, la grille arrive après une respiration
2. **Photos d'atelier intercalées** — bandes pleine largeur entre certaines collections (mains qui travaillent, savon au moule, ingrédients) — racontent le processus artisanal
3. **Varier le layout selon la collection** — PETIT NUAGE aéré et doux, SAPONICA plus dense, pas traitement uniforme mécanique
4. **Ligne de contexte par gamme** — courte phrase entre hero et grille : ex. *« Savons saponifiés à froid · Surgras 8% · 90 g »*
5. **Simplifier les cartes** — photo + nom + prix seulement, pas de format dans la carte
6. **Fond teinté par collection** — plus marqué, chaque page a vraiment sa couleur

### Décisions en attente
- [ ] Placement exact des photos d'atelier — entre quelles collections ?
- [ ] Quelles collections méritent un layout différent de la grille standard ?

---

## DESIGN — RÈGLES ABSOLUES

**Fontes sacrées :** Playfair Display · Birthstone · DM Sans — jamais autre chose
**Palette :** variables CSS (`--primary`, `--accent`, `--beige`, etc.)
**Zéro style inline** dans le HTML ou le JS (règle générale — aperçu HTML autonome : toléré)
**Zéro valeur hardcodée** si une variable CSS existe
**Marges d'impression** : marges normales, pas à fond perdu

---

## FICHIERS

| Fichier | Statut |
|---------|--------|
| `catalogue-apercu.html` | v1 produite session 7 — à refaire |
| `BRIEF_CATALOGUE_session8.md` | Ce document |

---

## CE QUI EST FAIT

- Format booklet 8.5×11 / impression 11×17 choisi ✓
- 9 collections avec données complètes extraites du Excel ✓
- Photos de couverture et Chantal choisies ✓
- Photos d'atelier identifiées pour intercalation ✓
- Direction créative validée — humanité + photos d'atelier ✓

## CE QUI RESTE À FAIRE

1. Revoir la mise en page — moins grille, plus respirant
2. Intégrer les photos d'atelier entre collections
3. Varier les layouts selon les collections
4. Corriger les marges d'impression
5. Corriger les textes coupés dans les cartes
6. Migration vers `appelAPI` (session future)

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 6 · Mis à jour : session 8 (11 avril 2026)*

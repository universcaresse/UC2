# ARCHIVES — UNIVERS CARESSE
*Sessions précédentes — conservé pour référence*

---

## ✅ RÉGLÉ — SESSION 28 MARS 2026

### Page INCI — refonte visuelle complète
- **`inciRendreLigne()`** — ligne principale : Nom + statut (🔴/✅ sans cadre) — flèche retirée, ligne entière cliquable (`.ligne-cliquable`)
- **`inciRendreLigne()`** — panneau détail : INCI en pleine largeur en premier, Catégorie UC, Catégorie fournisseur, Nom botanique, Note olfactive, Texte brut, puis VOIR FICHE à gauche / VALIDER à droite
- **`inciRendreUC()`** — tableau remplacé par cartes (`.carte-admin`) — ingrédients validés affichés sous chaque catégorie
- **`inciRendreUC()`** — boutons Modifier/Supprimer cachés si catégorie utilisée dans les ingrédients — visibles seulement si vide
- **`inciRendreUC()`** — catégories triées alphabétiquement
- **`inciToggleAccordeon()`** — un seul accordéon ouvert à la fois — flèches `inci-accord-chevron` retirées partout
- **`chargerInci()`** — charge `getDropdownLists` si `listesDropdown.fullData` est vide (fix catégories UC sans ingrédients)
- **`texte-brut`** — `font-size` passé de `0.8rem` à `0.95rem`
- **`.form-groupe`** — `margin-top: 1rem` ajouté
- **`.accordeon-detail .form-actions`** — `justify-content: space-between`
- **`.ligne-cliquable`** — nouvelle classe générique : `cursor: pointer` + hover `--beige-15`
- **`.carte-admin`** / **`.carte-admin-entete`** — nouvelles classes génériques

### Corrections code
- **`saveIngredientInci()`** — structure mise à jour 8 colonnes : `[cat, nom, '', '', 'Manuel', aujourd_hui, '', '🔴 À compléter']`
- **`getSourcesInci()`** — branché sur `Scraping_PA` au lieu de `Scraping_PA_v4`
- **Style inline retiré** dans `index_-_Admin.html` — `form-actions` : `style="padding: 0 28px 28px;"` supprimé

---

## ✅ RÉGLÉ — SESSION 27 MARS 2026

### Scraping Purearome — refonte complète
- **Nouveau fichier `purearome.gs`** — déduplication en mémoire par slug, une seule ligne par produit avec la catégorie la plus spécifique
- **`lancerPurearome()`** — scrape le catalogue par catégorie via API, écrit dans `Scraping_PA`
- **`paro_scraperPages()`** — scrape chaque page produit, auto-relance toutes les 5 min via trigger
- **`paro_extraireFragrance()`** — cas spécial fragrances : INCI = `Fragrance` + allergènes entre parenthèses
- **`paro_supprimerTrigger()`** — nettoie les triggers après complétion
- **Variables prefixées `PARO_`** — évite les conflits avec `code.gs`
- **Sheet `Scraping_PA`** — nouvelle sheet propre, remplace `Scraping_PA_v4` (conservée pour référence)

### Structure `Ingredients_INCI` — refonte
- **Nouvelle structure 8 colonnes** : A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut
- **`getIngredientsInciSheet()`** — entête mise à jour
- **`validerIngredientInci()`** — écrit dans les 8 colonnes correctement
- **`getSourcesInci()`** — lecture corrigée pour nouvelle structure

### Page INCI — déduplication `getSourcesInci()`
- **`getSourcesInci()`** — réécriture complète : fonction `lireSheet()` générique pour 4 sources, déduplication par nom avec score INCI(3)+bot(2)+brut(1), priorité PA>MH>AR>DE
- **`categorMaitre`** (sans `ie`) — propriété unifiée partout, corrige la pré-sélection du select UC
- **`index_-_Admin.html`** lu et assimilé complet

---

## ✅ RÉGLÉ — SESSION 26 MARS 2026

### Page INCI — améliorations visuelles et logique
- **`.tableau-admin`** — `width: 100%; table-layout: fixed; border-collapse: collapse`
- **`.tableau-admin th, td`** — padding, border-bottom, overflow ellipsis
- **`.tableau-admin td:last-child`** — `white-space: normal; width: 15%`
- **Thead INCI** — largeurs fixes : Nom 25%, INCI 35%, Catégorie UC 25%, actions 15%
- **`inciRendreLigne()`** — panneau détail : `form-grille` retiré, champs en pleine largeur
- **`getSourcesInci()`** — déduplication par nom : garde la ligne avec catégorie confirmée dans `Config_INCI`

---

## ✅ RÉGLÉ — SESSION 24 MARS 2026

### Page INCI — liste ingrédients retravaillée
- **Architecture décidée** : ligne compacte + panneau détail, validé = existe dans `Ingredients_INCI` seulement
- **Filtres** — 3 lignes séparées : Statut / Source / Recherche par nom
- **`.accordeon-detail`** — ligne `<tr>` de détail (fond `--beige-15`)
- **`.ligne-validee`** — fond `--primary-06` sur ligne validée
- **`.texte-brut`** — zone texte brut sélectionnable, scrollable
- **`.filtres-ligne`** — ligne de filtres (display flex, width 100%)
- **`inciRendreLigne()`** — ligne principale + panneau détail complet
- **`inciToggleDetail(id)`** — ouvre/ferme le panneau détail
- **`inciValider()`** — sauvegarde INCI + catégorie UC + nom botanique + note olfactive
- **`inciConstruireAccordeons()`** — filtre par recherche + utilise `l.valide`
- **Compteur "X validés"** dans accordéon — basé sur `l.valide`
- **`getSourcesInci()`** — croise scraping avec `Ingredients_INCI` : `l.valide = true/false`
- **`substring(0, 300)`** retiré du texte brut — affiche tout

---

## ✅ RÉGLÉ — SESSION 23 MARS 2026

### Fade in — site public
- **`scrollObserver`** — variable globale déclarée au niveau module dans `main.js`
- **`afficherEduSection`** — retire `visible` et re-observe les `.fade-in`
- **`afficherSection`** — re-observe tous les `.fade-in` de la section cible
- **Sections éducatives `edu-2` à `edu-7`** — ajout de `fade-in` sur les blocs dans `index.html`
- **Catalogue** — `collection-entete` reçoit `fade-in` dans le HTML généré dynamiquement

### Page INCI — architecture décidée
- **Flux** : Scraping → page INCI → validation humaine → `Ingredients_INCI` → partout ailleurs
- **Sheets** : `Scraping_PA`, `Scraping_MH`, `Scraping_Arbressence`, `Scraping_DE`, `Categories_UC`, `Config_INCI`, `Ingredients_INCI`

---

## ✅ RÉGLÉ — SESSION 14 MARS 2026 (soir)

- **Sections éducatives — mise en page** — 7 sections créées dans `sections-educatives-v2.html` (prototype validé)
- **Sections éducatives — intégration index.html** — nouvelle `page-section` id `section-educatif` ajoutée entre Catalogue et Bon à savoir
- **Sections éducatives — navigation** — lien "Le savon artisanal" ajouté dans le menu nav
- **Sections éducatives — affichage une à la fois** — fonction `afficherEduSection()` ajoutée dans `main.js`
- **Sections éducatives — CSS** — classes `edu-*` ajoutées dans `style.css`
- **Sections éducatives — styles inline tableau section 7** — laissés en place volontairement, sera refait quand les sections seront gérées via la Sheet/admin

---

## ✅ RÉGLÉ — SESSION 14 MARS 2026 (après-midi)

- **Collections secondaires — fiche recette consultation** — champ ajouté dans `admin.js`
- **Collections secondaires — ordre par rang** — sélecteur formulaire recette trié par rang via `donneesCollections`
- **Collections secondaires — cases cochées qui persistent** — réglé (reset déjà en place)
- **Collections secondaires — recettes non affichées sur le site public** — `row[19]` corrigé en `row[20]` dans `getCataloguePublic`
- **Modal produit — paysage iPad** — media query `orientation: landscape` ajoutée dans `style.css`
- **Boutons Fermer admin** — remplacés par X dans un cube dans `index_-_Admin.html` (5 boutons)
- **Textarea description collection** — `min-height` passé de 80px à 120px
- **Textarea description ligne** — `rows="4"` ajouté
- **Description emballage** — champ ajouté dans HTML, `admin.js`, Apps Script (col V de la Sheet Recettes)
- **Filtres inventaire** — recherche par nom, type, fournisseur ajoutés dans HTML et `admin.js`
- **Filtres inventaire — visuel** — classes `form-ctrl filtre-select` appliquées

---

## ✅ RÉGLÉ — SESSION 14 MARS 2026 (matin)

- **Tuiles collections — lignes empilées** — `.collection-carte-lignes-haut` : `flex-direction: column; align-items: flex-start`
- **Collections secondaires — contamination entre recettes** — reset des cases à `false` avant de cocher
- **Collections secondaires — casse** — comparaison `.toUpperCase()` pour éviter mismatch

---

## ✅ RÉGLÉ — SESSION 13 MARS 2026 (matin)

- **Cloudinary overlay iPad** — nettoyage de l'overlay après fermeture
- **Fiche collection — boutons** — ordre inversé : Modifier / Supprimer / + Ajouter une ligne / ✕
- **Fiche collection — bouton Fermer** — remplacé par X dans un cube aligné à droite
- **Photo recette après sauvegarde** — `await chargerRecettes()` ajouté
- **Photo recette — colonne Sheet** — `image_url_noel` corrigée en colonne T dans `saveRecette` et `getRecettes`
- **Fiche recette consultation** — `image_url_noel` ajoutée dans le bloc `fiche-visuel`
- **Statut public/test sur les cartes recettes** — badge déplacé en bas à droite
- **Page factures — ligne cliquable** — bouton Voir retiré, `tr.onclick`
- **Page factures — styles inline** — remplacés par classes CSS
- **Page factures — filtres en cascade** — fournisseur → statut → période
- **Page factures — total dynamique** — en bas, recalculé selon les filtres
- **Page factures — bouton Réinitialiser** — remplacé par X dans un cube
- **Page factures — total** — `parseFloat` ajouté pour corriger le calcul
- **Inventaire — colonne Prix/g** — retirée
- **Inventaire — styles inline** — remplacés par classes CSS
- **Inventaire — meilleur prix** — fournisseur le moins cher en vert avec ★
- **Inventaire — colonnes alignées** — un seul tableau global, catégories en rangées `.inv-titre-rangee`
- **Filtre recette par nom** — réinitialisé à la fermeture de la fiche
- **Photo de fond admin** — `fond.png` à 7% d'opacité, côté gauche, portrait seulement

---

## ✅ RÉGLÉ — SESSIONS PRÉCÉDENTES

- **Suppression collection** — `deleteRow` au lieu de `clearContent`, boucle décroissante
- **Fiche collection** — cache `contenu-collections` à l'ouverture
- **Fiche recette** — cache `filtres-bar` et `grille-recettes` à l'ouverture
- **Page Densités** — multiples corrections HTML et CSS
- **Fiches recettes** — s'ouvrent correctement
- **Bouton Supprimer ligne** — vérifie les recettes liées avant suppression
- **Ingrédients de base en mode modification** — vérifie `fr-id` avant de copier
- **Tuiles recettes hauteur inégale** — `min-height` sur `.recette-nom`
- **Menu admin — catégories trop pâles** — `.sidebar-titre` : `color: var(--gris)`
- **Lignes de produits cliquables** — bouton Modifier retiré, cliquable via `onclick`
- **Cloudinary Media Library** — `.show()` natif, `_mediaLibrary` recréé à chaque appel

---

*Univers Caresse — Archives — 28 mars 2026*

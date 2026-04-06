# ARCHIVES — UNIVERS CARESSE
*Sessions précédentes — conservé pour référence*

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

*Univers Caresse — Archives — 15 mars 2026*

# Univers Caresse — Brief technique v2
*Mis à jour — avril 2026*

## Vue d'ensemble

Projet Apps Script complet pour une savonnerie artisanale québécoise. Interface d'administration web connectée à une Google Sheet relationnelle, avec site public, gestion des opérations et éditeur de catalogue imprimable.

---

## Architecture

### Technologie
- **Backend** : Google Apps Script (`code.gs`) — API REST via `doGet` / `doPost`
- **Frontend** : HTML + CSS + JavaScript vanilla
- **Base de données** : Google Sheets (structure relationnelle par IDs)
- **Images** : Cloudinary (CDN externe)

### Fichiers principaux
| Fichier | Rôle |
|---|---|
| `code.gs` | API Apps Script — toutes les fonctions backend |
| `admin/index.html` | Interface d'administration complète |
| `js/admin.js` | Logique de l'interface admin |
| `js/catalogue-builder.js` | Éditeur de catalogue PDF (v3.0) |
| `js/entrer-facture.js` | Module de saisie de factures |
| `js/achats.js` | Module achats |
| `js/parsers.js` | Parseurs PDF |
| `index.html` + `js/main.js` | Site public |
| `css/style.css` | Styles partagés (site public + admin) |

### Structure des données (Google Sheets)

| Feuille | ID principal | Lié à |
|---|---|---|
| `Collections_v2` | `COL-id` | — |
| `Gammes_v2` | `GAM-id` | `COL-id` |
| `Familles_v2` | `FAM-id` | `COL-id` |
| `Produits_v2` | `PRO-id` | `COL-id`, `GAM-id`, `FAM-id` |
| `Produits_Ingredients_v2` | — | `PRO-id`, `ING-id` |
| `Produits_Formats_v2` | — | `PRO-id` |
| `Ingredients_INCI_v2` | `ING-id` | `CAT-id` |
| `Categories_UC_v2` | `CAT-id` | — |
| `Achats_Entete_v2` | `ACH-id` | `FOUR-id` |
| `Achats_Lignes_v2` | — | `ACH-id`, `ING-id` |
| `Stock_Ingredients_v2` | — | `ING-id` |
| `Lots_v2` | `LOT-id` | `PRO-id` |
| `Fournisseurs_v2` | `FOUR-id` | — |
| `Formats_Ingredients_v2` | — | `ING-id` |
| `Contenu_v2` | clé | — |
| `Mediatheque_v2` | rowIndex | — |
| `Images_Locales_v2` | nom | — |
| `Catalogue_Pages_v2` | `page_id` | `COL-id` |

---

## Catalogue Builder v3.0 (`js/catalogue-builder.js`)

Éditeur visuel de pages de catalogue imprimable, intégré à l'interface admin sous **Création → Catalogue PDF**.

### Format de page
- **8.5 × 11 pouces** (816 × 1056 px à 96dpi)
- **Marges non imprimables** : 0.5 po sur 3 côtés, 0 côté reliure
- Guides visuels des marges (trait pointillé)
- Reliure automatique selon parité : pages impaires à droite, pages paires à gauche

### Vue éditeur
- **Vue livre** — 2 pages côte à côte, page active + voisine estompée (cliquable)
- Page 1 seule à droite (couverture)
- **Vue lecture** — page 1 seule, puis toutes les pages en paires scrollables
- Sauvegarde automatique dans `Catalogue_Pages_v2` à chaque action

### Types de blocs
| Type | Description |
|---|---|
| Titre | Texte grand format |
| Texte | Paragraphe |
| Image | Photo depuis une source, avec opacité |
| Couleur | Aplat de couleur libre ou depuis binding, avec opacité |
| Mosaïque verticale | Colonne de carrés 20×20px par couleur hex de collection |
| Mosaïque horizontale | Rangée de carrés 20×20px par couleur hex de collection |

### Sources de données (sélecteurs en cascade)
1. **Onglet** — Collections, Gammes, Familles, Produits, Contenu site, Médiathèque, Images locales
2. **Filtres optionnels** — Collection → Gamme → Famille (selon l'onglet)
3. **Item** — liste filtrée avec noms lisibles
4. **Champ** — le champ à afficher

Cas spécial : `Contenu_v2` — liste directe des clés sans item intermédiaire.

### Panneau de calques
- Liste de tous les blocs de la page en ordre inverse (dernier = dessus)
- Clic pour sélectionner un bloc
- **Shift+clic** pour sélection multiple
- Drag & drop dans la liste pour réordonner
- **Déplacement en groupe** — glisser un bloc sélectionné déplace tous les blocs sélectionnés

### Contrôles typographiques
- Police : DM Sans, Playfair Display, Birthstone
- Taille, gras, italique
- Couleur du texte
- Justification : gauche, centre, droite
- Opacité (blocs image et couleur)
- Couleur libre (blocs couleur)

### Gestion des pages
- Créer, renommer, supprimer une page (avec confirmation)
- Assigner une collection à chaque page
- Avertissement si nombre de pages pas multiple de 4
- Copier / coller un bloc (même page ou entre pages)
- Monter / descendre un bloc dans l'ordre des calques

### Pagination automatique
- Numéro de page en bas à droite
- Trait horizontal sur 60% de la largeur au-dessus
- Commence à la page 4 (pages 1-3 réservées)

### Table des matières (page 3)
- Générée automatiquement via bouton **📋 TDM** (visible seulement sur page 3)
- Pour chaque collection : carré de couleur hex, nom, slogan, numéro de page
- Centrage vertical automatique selon le nombre de collections
- Positionnée à partir de x=240px

### Gabarit fiche produit
Bouton **📦 Fiche produit** dans la palette — génère automatiquement :
- Hex couleur (220×480 vertical ou 480×220 horizontal)
- Photo carrée 220×220
- Nom collection (petit, majuscules)
- Nom produit (gras, Playfair Display)
- Gamme
- Description emballage (italique)
- Ligne séparatrice
- Formats et prix (colonnes, depuis `Produits_Formats_v2`)

Tous les blocs ont leurs bindings configurés — il suffit de les repositionner.

### Impression
- **Page courante** — fenêtre d'impression propre
- **Catalogue complet** — imposition automatique recto-verso pour 11×17 po
- Ordre des pages calculé pour le brochage (signature de 4 pages)
- Polices Google Fonts incluses dans l'impression

---

## Site public (`index.html` + `main.js`)

- Navigation SPA sans rechargement
- Catalogue dynamique depuis l'API
- Filtres par collection et par gamme
- Modal produit avec INCI légal
- Section éducative (7 sous-sections)
- Formulaire de contact
- Mode maintenance et mode saisonnier
- Contenu dynamique depuis `Contenu_v2`

---

## Interface d'administration

### Création
- Collections, Gammes, Familles, Produits — CRUD complet
- **Catalogue PDF** — éditeur visuel (voir ci-dessus)

### Achats
- Saisie de factures avec mapping fournisseur → UC
- Historique, filtres, détail, suppression
- Conversion automatique des unités avec densités configurables
- Calcul du prix réel par gramme

### Production
- Fabrication de lots avec calcul du coût de revient
- Déduction automatique du stock

### Système
- Validation INCI par fournisseur
- Densités de conversion
- Contenu du site (textes dynamiques)
- Médiathèque Cloudinary

---

## Pour reprendre une session

Fournir :
1. Ce brief
2. Le fichier `js/catalogue-builder.js` actuel
3. Le fichier `code.gs` si on touche au backend
4. Description de ce qu'on veut faire

---

*Projet développé en collaboration avec Claude — Anthropic*
*Avril 2026*

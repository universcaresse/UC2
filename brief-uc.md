# Univers Caresse — Brief technique v2

## Vue d'ensemble

Projet Apps Script complet pour une savonnerie artisanale québécoise. Interface d'administration web connectée à une Google Sheet relationnelle, avec site public, gestion des opérations et éditeur de catalogue imprimable.

---

## Architecture

### Technologie
- **Backend** : Google Apps Script (`code.gs`) — API REST via `doGet` / `doPost`
- **Frontend** : HTML + CSS + JavaScript vanilla, hébergé via Apps Script
- **Base de données** : Google Sheets (structure relationnelle par IDs)
- **Images** : Cloudinary (CDN externe)

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

## Site public (`index.html` + `main.js`)

- Navigation SPA (sections sans rechargement)
- Catalogue dynamique chargé depuis l'API
- Filtres par collection et par gamme
- Modal produit avec INCI légal
- Section éducative (7 sous-sections paginées)
- Formulaire de contact
- Mode maintenance et mode saisonnier
- Contenu dynamique depuis `Contenu_v2`
- Statistiques accueil (nb collections, produits)

---

## Interface d'administration (`admin/index.html`)

### Création
- **Collections** — CRUD complet avec photo, couleur hex, slogan
- **Gammes** — liées aux collections, avec ingrédients de base
- **Familles** — regroupement de produits par sous-catégorie
- **Produits** — fiche complète : description, INCI, formats, prix, statut, photos, collections secondaires

### Achats
- **Entrer une facture (V3)** — saisie ligne par ligne avec mapping fournisseur → UC
- **Historique des factures** — filtres, détail, suppression
- **Inventaire** — stock calculé depuis les factures finalisées
- Conversion automatique des unités (g, ml, kg, L, lbs) avec densités configurables
- Calcul du prix réel par gramme avec facteur de majoration (taxes + livraison)

### Production
- **Fabrication de lots** — sélection recette + format + multiplicateur
- Calcul automatique du coût de revient
- Déduction automatique du stock d'ingrédients
- Dates de fabrication et de disponibilité (cure)

### Système
- **INCI** — validation des codes INCI par fournisseur (PA, MH, Arbressence, DE)
- **Densités** — facteurs de conversion par catégorie d'ingrédient
- **Contenu du site** — édition de tous les textes du site public
- **Médiathèque** — gestion des photos Cloudinary avec synchronisation

---

## Catalogue PDF (`js/catalogue-builder.js`)

Éditeur visuel de pages de catalogue imprimable, intégré à l'interface admin.

### Format
- **8.5 × 11 pouces** (816 × 1056 px à 96dpi)
- **Marges non imprimables** : 0.5 po sur 3 côtés, 0 côté reliure
- Guides visuels des marges sur le canvas (trait pointillé)
- Reliure automatique selon parité de la page (gauche/droite)

### Vue
- **Vue livre** — 2 pages côte à côte (page active + voisine estompée)
- Page 1 à droite (comme une vraie brochure)
- **Vue lecture** — toutes les pages en paires scrollables
- Clic sur la page voisine pour l'éditer

### Blocs disponibles
| Type | Description |
|---|---|
| Titre | Texte grand format |
| Texte | Paragraphe |
| Image | Photo depuis une source |
| Couleur | Aplat de couleur avec opacité réglable |

### Sources de données des blocs
Chaque bloc peut être relié à n'importe quelle source :
- Collections, Gammes, Familles, Produits
- Contenu du site
- Médiathèque
- Images locales (`Images_Locales_v2`)

### Contrôles typographiques
- Police (DM Sans, Playfair Display, Birthstone)
- Taille, gras, italique, couleur du texte
- Opacité (pour les blocs couleur)

### Gestion des pages
- Créer / renommer / supprimer une page
- Assigner une collection à chaque page
- Avertissement si le nombre de pages n'est pas un multiple de 4
- Copier / coller un bloc (même page ou entre pages)

### Pagination automatique
- Numéro de page en bas à droite
- Trait horizontal sur 60% de la largeur au-dessus
- Commence à la page 4 (pages 1-3 réservées)

### Table des matières (page 3)
- Générée automatiquement depuis les collections assignées aux pages
- Pour chaque collection : bande de couleur hex, nom, slogan, numéro de page
- Bouton **Générer TDM** visible uniquement sur la page 3

### Sauvegarde
- Sauvegarde automatique dans `Catalogue_Pages_v2` à chaque action
- Chargement au démarrage — survit aux refreshs

### Impression
- **Page courante** — ouvre une fenêtre d'impression propre
- **Catalogue complet** — imposition automatique recto-verso pour impression 11×17 po
- Ordre des pages calculé pour le brochage (signature de 4 pages)

---

## Ce qui reste à faire (pistes)

- Gabarits de pages réutilisables
- Table des matières plus élaborée (photo de collection)
- Vue lecture avec navigation fluide
- Gestion du stock produits finis (lots → ventes)
- Module de ventes
- Statistiques et bilan financier

---

*Projet développé en collaboration avec Claude — Anthropic*
*Avril 2026*

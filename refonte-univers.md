# Refonte des Univers — Notes de discussion

## Contexte

Actuellement, les produits ont une fonction "collections secondaires" qui permet de placer un produit dans une collection autre que sa collection principale.

Usage actuel :
- Collection "LUI" : vitrine pour produits masculins venant de Saponica, Épure, etc.
- Collection "Petit Nuage" : utilisée pour y placer les produits pour enfants

## Problèmes identifiés

Sur le site public, les collections secondaires polluent l'affichage :

1. Le produit garde son nom de gamme d'origine quand il apparaît dans une collection secondaire — création de "gammes fantômes"
2. Même problème pour la famille
3. Le badge sur la carte affiche la collection principale, pas celle dans laquelle on le voit — incohérence visuelle
4. Les filtres de gammes par collection se remplissent avec des gammes d'autres collections

Conceptuellement aussi : une collection devrait rester un univers de produits cohérent et conçu ensemble. "LUI" et "enfants" sont plus des regroupements thématiques que de vraies collections.

## Solution retenue

Faire évoluer les **univers** (regroupements) pour qu'ils acceptent deux modes :

### Mode automatique
- Dans le formulaire d'univers, on choisit un ingrédient vedette (ex: lavande)
- Les produits contenant cet ingrédient s'ajoutent automatiquement
- Fonctionnement actuel conservé

### Mode manuel
- Dans le formulaire d'univers, on donne juste un nom (ex: LUI, enfants)
- Dans la fiche de chaque produit, on coche les univers manuels où le produit doit apparaître
- L'appartenance se définit donc dans la fiche produit, comme pour les familles et collections

### Décision
- Deux modes suffisent pour le moment
- Un éventuel mode mixte (auto + ajustement manuel) pourra être ajouté plus tard si le besoin se fait sentir
- Les collections secondaires seront retirées une fois la migration faite

## Travail à prévoir

### Admin
- `admin-regroupements.js` : ajouter le choix de mode, masquer/afficher les bons champs selon le mode choisi
- `admin-produits.js` : ajouter une section "univers manuels" (cases à cocher) dans la fiche produit
- `admin/index.html` : ajuster le formulaire d'univers et le formulaire produit

### Site public
- `main.js` — `afficherPageRegroupements()` : gérer les deux modes
- `main.js` — `construireCatalogue()` : retirer la logique des collections secondaires
- `index.html` : possiblement rien à toucher

### Backend (Google Apps Script)
- Ajouter une colonne "mode" dans la feuille des regroupements
- Stocker la liste des produits choisis par univers manuel (dans la feuille regroupements ou nouvelle feuille de liaison)
- Adapter `getRegroupements` et `getCatalogue` pour retourner les bonnes infos

### Migration
- Transférer les regroupements actuels "LUI" et "enfants" du système de collections secondaires vers des univers manuels

## Ampleur

Travail moyen. Plusieurs fichiers touchés, mais rien d'énorme. Il faudra tester que rien ne casse ailleurs (catalogue, fiches produits, ventes, etc.).

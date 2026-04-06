⛔ PROTOCOLE OBLIGATOIRE — LIS CECI AVANT TOUT. SANS EXCEPTION.
ÉTAPE 1 — AVANT DE RÉPONDRE

Lis ce brief AU COMPLET.
Lis CHAQUE fichier fourni AU COMPLET.
Confirme à voix haute : "Brief lu. Fichiers lus. Prêt."
Si tu n'as pas tout lu — tu te tais et tu lis.

ÉTAPE 2 — AVANT DE PROPOSER UN CHANGEMENT
Tu dois pouvoir répondre aux 3 questions suivantes. Sinon tu ne proposes rien :

Qu'est-ce que ce changement touche directement ?
Qu'est-ce que ce changement touche ailleurs dans le site ?
Qu'est-ce qui existait avant et qui pourrait briser ?

ÉTAPE 3 — AVANT DE CODER

Tu attends un OUI explicite. Le mot OUI. Rien d'autre.
Un seul changement à la fois. Un. Pas une liste.
Livraison = trouve/remplace ciblé uniquement. Jamais le fichier complet sans permission explicite.
Jamais de style inline dans le HTML ou le JS.
Jamais créer une fonction ou classe CSS si une existante peut servir.

VIOLATION = ARRÊT IMMÉDIAT
Coder sans OUI · Livrer un fichier complet sans permission · Proposer plusieurs changements · Briser une fonctionnalité existante · Lire partiellement un fichier
Un site cassé à cause d'un changement non vérifié est une faute grave. On revient en arrière avant de continuer.


# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v32 — 3 avril 2026

> 📦 **Historique complet des sessions dans** `Brief_Univers_Caresse_ARCHIVES.md`

---

## PROJET — FICHIERS ET URLS
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`, `purearome.gs`, `scraper_url_v2.gs`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbwwiGLwj8QJ6c5dGEtPEHUojzdbdncsTXnmEn-LJJxg7xBeckcbiCX1bvkMb3E3ba1FEA/exec`
- Site public : https://universcaresse.github.io/universcaresse/
- GitHub : https://github.com/universcaresse/univers-caresse

---

## ⚠️ RAPPEL CRITIQUE — Apps Script
Après tout changement dans `Code.gs` → **redéployer obligatoirement** :
Déployer → Gérer les déploiements → Nouvelle version → Déployer

---

## 🔴 RÈGLE LÉGALE — INCI
- **Ne jamais afficher le nom d'un ingrédient à la place de son code INCI** — c'est illégal
- Afficher uniquement les ingrédients qui ont un code INCI valide (`i.inci` non vide)
- La liste INCI doit commencer par le label **"Ingrédients :"**
- Les ingrédients doivent être triés du plus grand au plus petit pourcentage (norme EU)
- Les fragrances sont regroupées sous **"Fragrance"** en fin de liste
- **⚠️ MENTION IMPORTANTE : Une recette ne peut pas passer au statut `public` tant que tous ses ingrédients n'ont pas un code INCI valide**

---

## 🔴 REFACTORING MAJEUR PLANIFIÉ
- `getCataloguePublic()` et `getRecettes()` — fusion prévue
- Approche : reconstruire de côté, tester, puis remplacer

---

## 🔴 PRINCIPE DE CONSOLIDATION CSS — ACTIF
- À chaque changement, évaluer si on peut consolider plutôt qu'ajouter
- **Règle** : un titre c'est un titre partout

---

## 🏗️ ARCHITECTURE — VISION ACHATS (décisions v26)

### Principe fondamental
**Tout passe par les achats** — ingrédients, contenants, emballages, équipement. Une seule porte d'entrée.

### 4 types d'items dans les achats
| Type | Calcul | Destination |
|---|---|---|
| Ingrédient | $/g → recette | `Inventaire_ingredients` |
| Contenant | $/unité → format recette | `Inventaire_contenants` |
| Emballage | $/unité → format recette | `Inventaire_emballages` |
| Équipement | amorti sur X unités/années | Coût fixe par unité produite |

### Coût de revient complet d'un format
**= coût ingrédients + coût contenant + coût emballages + quote-part équipement**

### Import PDF — LIVRÉ v28 (en cours de finalisation)
- PDF lu via **PDF.js** directement dans le navigateur — zéro API externe, autonome
- Extraction automatique : numéro, date, fournisseur, items, taxes
- Mapping automatique via `Mapping_Fournisseurs` (sheet) : nom fournisseur → nom UC
- Aperçu de validation — catégorie UC d'abord → filtre la liste nom UC
- Items non mappés → bouton "+" pour ajouter nom UC + catégorie UC à la volée
- Validation des totaux : somme (prix × qté) doit = sous-total
- **Fournisseurs supportés** : Pure Arôme (parser PA livré), Amazon (à finaliser — un PDF par facture vendeur), MH/Arbressence/DE (parsers à construire)
- **⚠️ À VALIDER avec Chantal** : est-ce que le PDF Amazon contient une ou plusieurs factures?

### Formats dans `Recettes_Formats`
- À venir : lien vers items d'emballage (plusieurs par format — étiquette + boîte + ruban)
- Le contenant (pot, tube) se rattache au format, pas à la recette de base

### Cas particulier emballages imprimés
- Template sauvegardé (ex. Saponica 3/feuille, Petit Nuage 2/feuille) — entrer juste nb feuilles + prix total

---

## 🏗️ ARCHITECTURE — MAPPING FOURNISSEURS ✅ v28

### Sheet `Mapping_Fournisseurs`
- Col A : Fournisseur (PA, MH, Arbressence, DE, Amazon, + autres)
- Col B : Nom fournisseur (tel qu'écrit sur la facture)
- Col C : Nom UC

### Fonctions `code.gs`
- `getMappingFournisseursSheet()` — crée le sheet si absent
- `initialiserMappingFournisseurs()` — à exécuter manuellement UNE FOIS par fournisseur pour peupler depuis les sheets scraping. Peut être relancé sans danger (déduplication incluse)
- `getMappingFournisseurs()` — retourne tout le mapping pour le JS admin
- Branché dans `doGet` : `action === 'getMappingFournisseurs'`

### Pour ajouter un nouveau fournisseur
1. Scraper ou entrer manuellement ses produits dans un sheet `Scraping_XXX`
2. Ajouter l'entrée dans le tableau `sources` de `initialiserMappingFournisseurs()` avec le bon `colNom`
3. Exécuter `initialiserMappingFournisseurs()` manuellement
4. Ajouter l'option dans le `<select id="if-fournisseur">` dans `index_-_Admin.html`
5. Ajouter un parser `parserFactureXXX(texte)` dans `admin.js` si format de facture différent
6. Brancher ce parser dans `importerFacturePDF()` selon le fournisseur sélectionné

### Colonnes scraping par fournisseur
| Fournisseur | Sheet | colNom |
|---|---|---|
| PA | Scraping_PA | 0 (col A = Nom) |
| MH | Scraping_MH | 0 (col A = Nom) |
| Arbressence | Scraping_Arbressence | 0 (col A = Nom) |
| DE | Scraping_DE | 1 (col B = Nom, col A = Marque) |

---

## 🏗️ ARCHITECTURE — IMPORT PDF FACTURES ✅ v28

### Flux complet
1. Admin ouvre section "Import PDF" (sidebar Achats)
2. Choisit fournisseur + uploade PDF
3. Clic "Lire le PDF" → PDF.js extrait le texte → parser détecte le format
4. Mapping automatique via `ifMapping` (chargé depuis `getMappingFournisseurs`)
5. Aperçu : catégorie UC → filtre → nom UC — items non trouvés modifiables
6. Bouton "+" pour ajouter nom UC + catégorie UC à la volée (appelle `ajouterIngredientUC`)
7. Validation totaux : somme items = sous-total affiché
8. Confirmer → `createInvoice` + `addProduct` × items + `finalizeInvoice`

### Variables JS (`admin.js`)
- `ifItems` — tableau des items extraits du PDF
- `ifMapping` — mapping fournisseurs chargé une fois au premier accès à la section

### Fonctions JS (`admin.js`)
- `ifChargerMapping()` — charge `getMappingFournisseurs` si pas encore fait
- `importerFacturePDF()` — orchestre la lecture + parsing + affichage aperçu
- `lirePDF(fichier)` — lit le PDF via PDF.js, retourne le texte brut
- `parserFacturePA(texte)` — parser Pure Arôme
- `trouverMappingItem(description, fournisseur)` — cherche dans `ifMapping`
- `afficherApercuItems(fournisseur)` — affiche le tableau avec dropdowns
- `ifFiltrerNoms(idx)` — filtre les noms UC par catégorie sélectionnée ⚠️ À AJOUTER
- `ifAjouterNomUC(idx)` — ouvre le mini-formulaire d'ajout inline ⚠️ À AJOUTER
- `ifConfirmerNomUC(idx)` — sauvegarde le nouveau nom UC + recharge fullData ⚠️ À AJOUTER
- `validerTotaux(facture)` — compare somme items vs sous-total
- `confirmerImportFacture()` — envoie tout vers Apps Script

### Parser PA — structure facture Pure Arôme
- Numéro : `Détails de la commande` suivi du numéro
- Date : format `DD-MM-YYYY`
- Items : `Nom produit (qté) format prix $ CAD`
- Taxes : `TPS :`, `TVQ :`, `Sous-total :`, `Total de la commande :`

### Parser Amazon — À CONSTRUIRE
- Numéro : `Invoice # / # de facture: CAXXXXXXXX` (alphanumérique)
- Date : `Order date / Date de commande: DD Month YYYY` (anglais)
- Items : tableau structuré avec colonnes Quantity / Unit price / Item subtotal
- Taxes : `Federal tax` = TPS, `Provincial tax` = TVQ
- **⚠️ Un PDF Amazon peut contenir plusieurs factures (une par vendeur)** — à confirmer avec Chantal

---

## 🏗️ ARCHITECTURE — INCI — RESTRUCTURATION ✅ v28

### Principe
`Ingredients_INCI` = **seulement les ingrédients validés**
- ✅ Validé : nom UC + catégorie UC + INCI trouvé
- 🔴 À compléter : nom UC + catégorie UC OK, INCI manquant
- L'achat = seul point d'entrée pour nouveaux ingrédients
- Plus d'ajout d'ingrédient dans le formulaire recette

### Page INCI admin — restructuré v28
- `chargerInci()` charge `getCategoriesUC` + `getDropdownLists` + `getIngredientsUC` (plus de `getSourcesInci`)
- `inciDonnees` = `listesDropdown.fullData` (ingrédients validés seulement)
- Accordéon 1 : Catégories UC
- Accordéon 2+ : Par catégorie UC → ingrédients ✅ ou 🔴, triés alphabétiquement
- Texte brut : chargé à la demande via `getTexteBrut(nom)` — bouton "Charger"

### Fonctions `code.gs` ajoutées v28
- `getTexteBrut(nom)` — cherche dans les 4 sheets scraping, retourne le texte brut
- Branché dans `doGet` : `action === 'getTexteBrut'`

### `fullData` — champs disponibles
- `type` — catégorie UC
- `ingredient` — nom UC
- `ingredientFournisseur` — nom fournisseur (col B)
- `inci` — code INCI
- `nomBotanique` — nom botanique ✅ ajouté v28
- `note_olfactive` — note olfactive

---

## 🏗️ ARCHITECTURE — MÉDIATHÈQUE PHOTOS ✅ v31

### Pourquoi
Présentement les URLs de photos sont éparpillées — codées en dur dans `index.html` pour les photos éditoriales, dans les Sheets pour les recettes et collections. Naviguer dans Cloudinary directement est difficile (interface en anglais, pas de contexte site). Le widget Cloudinary natif dans l'admin ouvre une popup externe non intégrée. Résultat : on ne sait pas quelles photos existent, où elles sont utilisées, et les nommer/retrouver est laborieux.

### Solution décidée
- Une Sheet `Mediatheque` — colonnes : URL, Nom, Catégorie
- Catégories : extraites automatiquement depuis les sous-dossiers Cloudinary
- Un sélecteur interne (modal) qui s'ouvre depuis n'importe quel champ photo — recette, collection, section éditoriale — affiche les photos par catégorie, clic + OK place l'URL dans le bon champ
- Le widget Cloudinary natif reste pour l'upload uniquement
- Les 4 photos éditoriales codées en dur dans `index.html` vont passer par la Sheet `Contenu` comme les textes

### Synchro Cloudinary ✅ v31
- `syncCloudinary()` dans `code.gs` — ramasse toutes les photos via l'API Cloudinary
- Cloud : `dfasrauyy` — toutes les photos sont sous `univers-caresse/` comme préfixe dans le `public_id`
- Catégorie = extraite de `asset.asset_folder` (ex. `univers-caresse/collections` → `collections`)
- Déduplication : une URL déjà dans la Sheet n'est pas ajoutée
- Bouton "↺ Synchroniser Cloudinary" dans la page Médiathèque admin
- **La médiathèque est en lecture seule** — pas de suppression depuis l'admin (gérer dans Cloudinary)
- Branché dans `doGet` : `action === 'syncCloudinary'`

### Structure dossiers Cloudinary
- Toutes les photos ont un `public_id` qui commence par `univers-caresse/`
- Sous-dossiers actuels : `univers-caresse/collections`, `univers-caresse/produits`
- Nouveaux dossiers prévus à la racine : `collections`, `collections-noel`, `ligne`, `ligne-noel`, `recettes`, `recettes-noel`, `Site-général` — ⚠️ ménage Cloudinary en cours

### Page Médiathèque admin ✅ v31
- Filtre par catégorie + compteur de photos
- Bouton Supprimer retiré des cartes (lecture seule)
- Grille utilise `.collections-grille` + `.collection-carte` — zéro nouveau CSS

### Logos — fixes, on ne touche pas
- `Images/plume.png`
- `Images/Logofinal.png`

---

## 🏗️ ARCHITECTURE — MODULE FABRICATION ✅ v32

### Terminologie
| Terme | Définition |
|---|---|
| Stock | Ingrédients (matières premières) |
| Inventaire | Produits finis (savons fabriqués) — par lot |
| Fabrication | L'acte de produire un lot |
| Lot | Une fabrication spécifique — recette × multiplicateur, à une date donnée |
| Productions | Sheet Google Sheets contenant tous les lots |
| En cure | Lot fabriqué mais pas encore prêt à vendre |
| Disponible | Lot prêt à vendre, stock > 0 |
| Épuisé | Plus aucune unité disponible |

### Sheet `Productions` — NOUVELLE ✅ v32
| Colonne | Type | Description |
|---|---|---|
| lot_id | String | LOT-TIMESTAMP |
| recette_id | String | ID recette |
| recette_nom | String | Nom dénormalisé |
| multiplicateur | Integer | 1, 2, 3... |
| nb_unites | Integer | nb_unites_recette × multiplicateur |
| date_fabrication | Date | Peut être dans le passé |
| date_disponibilite | Date | date_fabrication + cure (jours) |
| cout_ingredients | Decimal | Au moment de la fab |
| cout_emballages | Decimal | Au moment de la fab |
| cout_revient_total | Decimal | ingredients + emballages |
| cout_par_unite | Decimal | total ÷ nb_unites |
| collection | String | Dénormalisé depuis recette |
| ligne | String | Dénormalisé depuis recette |

### Statut calculé dynamiquement
- `date_disponibilite > aujourd'hui` → `en_cure`
- `date_disponibilite <= aujourd'hui` et `nb_unites > 0` → `disponible`
- sinon → `epuise`

### Fonctions `code.gs` ajoutées v32
- `getProductionsSheet()` — crée la sheet si absente
- `getProductions()` — retourne tous les lots avec statut calculé
- `saveProduction(data)` — enregistre un nouveau lot
- Branchés dans `doGet` : `action === 'getProductions'`
- Branchés dans `doPost` : `action === 'saveProduction'`

### Fonctions `admin.js` ajoutées v32
- `chargerFabrication()` — charge la section
- `afficherTableauFabrication(lots)` — 3 sections accordéon par collection/ligne
- `fabToggleAccordeon(el)` — toggle accordéon
- `ouvrirFormFabrication(existant)` — ouvre le formulaire (nouveau ou existant)
- `fermerFormFabrication()` — ferme + vide le formulaire
- `fabFiltrerRecettes()` — filtre recettes par collection
- `fabFiltrerFormats()` — peuple les formats selon la recette choisie
- `calculerApercuLot()` — calcul dynamique unités + date dispo + coût
- `sauvegarderLot()` — envoie vers saveProduction

### Menu admin restructuré v32
- "Confection" → "Fabrication" (sidebar + nav)
- "Listes" → "Statistiques" (nav)
- "Ventes" → "Inventaire" sous Production (sidebar)
- Section `section-fabrication` ajoutée dans `index.html`
- Section `section-inventaire-production` ajoutée dans `index.html`

### Formulaire fabrication — 2 modes
- **Nouveau lot** : collection → recette → format → multiplicateur → date (défaut = aujourd'hui)
- **Lot existant** : collection → recette → format → nombre de savons → date (vide)
- Aperçu calculé en temps réel : unités, date dispo, coût estimé
- Fermeture : vide tous les champs

### ⚠️ Dépendances fabrication
1. `Inventaire_ingredients` doit être alimenté — si incomplet, coût = 0 mais ne bloque pas
2. Sheet `Ventes` n'existe pas encore — unités restantes = unités produites
3. Prix récents viennent de `listesDropdown.fullData` (prixParG)

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE ✅

### Public (`main.js`)
- `donneesCatalogue` — variable globale contenant produits, collections, infoCollections
- Navigation entre sections = instantané, zéro appel réseau supplémentaire

### Admin (`admin.js`)
- `donneesCollections`, `donneesRecettes`, `listesDropdown` — chargés une fois
- `listesDropdown.formats` — chargé dans `initialiserNouvelleFacture()`
- `listesDropdown.config` — clés harmonisées avec `Ingredients_INCI` ✅
- `ifMapping` — chargé une fois à l'accès à la section import facture
- `_mediathequeDonnees` — chargé une fois à l'accès à la section médiathèque

---

## 🏗️ ARCHITECTURE — SYNCHRONISATION DES DONNÉES ✅

| Fonction | Déclenchée par | Met à jour |
|---|---|---|
| `mettreAJourInciRecettes()` | `validerIngredientInci()` | `Recettes` col X/L/M + `Recettes_Base` col 3/4 |
| `mettreAJourCollectionRecettes()` | `updateCollectionItem()` | `Recettes` col E/F/G/21 + `Recettes_Base` col 1/2 |
| `mettreAJourCategorieRecettes()` | `modifierCategorieUC()` | `Recettes` col L + `Recettes_Base` col 3 |

### Protections en place
- Suppression collection bloquée si recettes liées
- Suppression ligne bloquée si recettes liées
- Suppression catégorie UC bloquée si utilisée dans `Recettes` ou `Ingredients_INCI`

---

## 🏗️ ARCHITECTURE — FACTURES / ACHATS ✅

### Sheet `Formats_Ingredients` ✅
- Type, Ingrédient, Fournisseur, Quantité, Unité
- Alimenté automatiquement à chaque nouvel achat

### Sheet `Config` ✅ RÉINITIALISÉ v27
- Clés harmonisées avec `Ingredients_INCI` — pluriel, majuscules correctes
- Types : Huiles essentielles, Huiles, Huiles aromatiques, Hydrolats, Fragrances, Beurres, Argiles, Ingrédients Secs, Ingrédients Liquides, Colorants et Pigments, Herbes et Fleurs, Cires, Saveurs naturelles, Emballage

### Formule $/g ✅ CORRIGÉE v27
- **$/g brut** = prix_unitaire ÷ grammes
- **$/g réel** = $/g brut × (1 + marge_perte) × facteur_taxes
- Conversions : kg×1000, L×1000×densité, ml×densité, lbs×453.592

### Listes alphabétiques ✅ CORRIGÉES v27
- Types et ingrédients triés alphabétiquement dans le formulaire facture

---

## 🏗️ ARCHITECTURE — SAUVEGARDE AUTOMATIQUE ✅
- `sauvegarderSheet()` — copie quotidienne, max 28, courriel dimanche
- ✅ `creerDeclencheurSauvegarde()` exécuté manuellement

---

## 🏗️ ARCHITECTURE — Import MD ✅

### Structure MD attendue
```
# NOM PRODUIT — NOM COLLECTION
**Ligne :** NOM | **Cure :** X jours | **Nb unités :** X | **Statut :** public
**HEX :** #XXXXXX
**Rang :** X
**Collections secondaires :** NOM1, NOM2
## RECETTE NOM
- Xg Ingrédient
**Fragrances :**
- Xg HE ou HA
**Additifs :**
- Xg Ingrédient
**Version courte :** texte
**Version longue :** texte
**Notes :** texte
```

### Règles importantes
- Une seule `—` dans le titre
- Quantités sans fourchette ni pourcentage ni notes
- Noms d'ingrédients = exactement le `Nom UC` de `Ingredients_INCI`

---

## 🏗️ ARCHITECTURE — `Recettes_Formats`
- `prix_vente` et `format` dans `Recettes` **ne sont plus utilisés**
- **`Recettes_Formats` fait foi** pour les prix et formats de vente

---

## 🏗️ ARCHITECTURE — Modal produit public
- Tri INCI : plus de 1% décroissant, puis 1% et moins
- Fragrances sous "Fragrance" en fin
- **Jamais de fallback sur `i.nom`** — uniquement `i.inci`
- Préfixe : `"Ingrédients : "`

---

## 🏗️ ARCHITECTURE — FICHIERS

| Fichier | État |
|---|---|
| `index.html` | ✅ lu — sections fabrication + inventaire-production ajoutées v32 |
| `index_-_Admin.html` | ✅ lu — section import PDF ajoutée |
| `main.js` | ✅ lu |
| `admin.js` | ✅ lu — module fabrication complet v32 |
| `style.css` | Source unique public + admin |
| `code.gs` | ✅ + getProductions + saveProduction + getProductionsSheet v32 |

---

## 🏗️ ARCHITECTURE — SHEETS GOOGLE

| Sheet | Contenu |
|---|---|
| `Collections` | A à J |
| `Recettes` | A à X (col X = INCI par ingrédient) |
| `Recettes_Formats` | Formats de vente — **source unique prix/format** |
| `Recettes_Base` | Ingrédients de base par collection/ligne |
| `Ingredients_INCI` | A=Cat, B=Nom fournisseur, C=INCI, D=Bot, E=Source, F=Date, G=Note, H=Statut, I=NomUC |
| `Ingredients_UC` | 146+ ingrédients, 8+ catégories |
| `Factures` | Factures d'achat |
| `Achats` | Détail items |
| `Inventaire_ingredients` | Stock — à refaire lors session achats |
| `Config` | Densités + types harmonisés |
| `Contenu` | Textes site public |
| `Categories_UC` | Catégories UC |
| `Config_INCI` | Correspondance catégories |
| `Formats_Ingredients` | Formats d'achat par ingrédient/fournisseur |
| `Mapping_Fournisseurs` | Nom facture fournisseur → Nom UC ✅ v28 |
| `Mediatheque` | Photos Cloudinary — URL, Nom, Catégorie ✅ v31 — 157 photos synchro |
| `Productions` | Lots de fabrication ✅ v32 — 13 colonnes |
| `Scraping_PA/MH/Arbressence/DE` | Maintenus manuellement |
| `Copie de Recettes` | Backup — ignorer |
| `Listes` | Futur — ignorer |

---

## Nom UC — architecture
**`Ingredients_INCI` :** A=Catégorie UC, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC

---

## VARIABLES TYPOGRAPHIQUES — ROOT

| Variable | Valeur | Usage |
|---|---|---|
| `--texte-micro` | `0.70rem` | Labels très discrets |
| `--texte-xs` | `0.75rem` | Sur-titres, boutons, nav, INCI |
| `--texte-xs-2` | `0.82rem` | Slogans, labels secondaires |
| `--texte-sm` | `0.90rem` | Texte secondaire |
| `--texte-sm-2` | `0.95rem` | Variante secondaire |
| `--texte-corps` | `1.05rem` | Lecture principale |
| `--texte-corps-2` | `1.15rem` | Variante corps |
| `--texte-titre-sm` | `1.30rem` | Titres tuiles |
| `--texte-titre-md` | `1.50rem` | Titres de section |
| `--texte-signature` | `2rem` | Signature cursive |

---

## CLASSES CSS — UN SEUL SYSTÈME

| Classe | Usage |
|---|---|
| `.page-entete` | Conteneur entête |
| `.page-entete-gauche` | Conteneur texte gauche |
| `.page-entete-eyebrow` | Sur-titre |
| `.page-entete-titre` | Grand titre |
| `.fade-in` / `.fade-in-doux` | Animations |
| `.cache` | `display: none !important` |
| `.accordeon-detail` | Ligne détail sous tableau |
| `.ligne-validee` | Fond vert pâle |
| `.texte-brut` | Zone texte brut sélectionnable |
| `.ligne-cliquable` | `<tr>` cliquable |
| `.ligne-rouge` | Ligne item non mappé dans aperçu import ✅ v28 |
| `.carte-admin` | Carte générique |
| `.carte-admin-entete` | Entête de carte |
| `.champ-avec-reset` | Input + bouton X |
| `.btn-reset-champ` | Bouton X |
| `.texte-secondaire` | Texte gris 0.85em |
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm` | Boutons |
| `.form-ctrl`, `.form-groupe`, `.form-label` | Formulaires |
| `.msg-zone` | Zone messages |
| `.separateur` | Ligne séparatrice |
| `.ingredient-rangee` | **à renommer `form-rangee`** |
| `.form-panel` | Panneau formulaire — `display:none` par défaut |
| `.form-panel.visible` | Panneau visible — utiliser `classList.add/remove('visible')` |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → `doPost`
- `appelAPI` → `doGet`
- Ne jamais retirer les branchements existants

---

## ⚠️ RÈGLE — Ajouter une nouvelle section admin
1. `<div class="section-admin" id="section-XXX">` dans `index.html`
2. Bouton sidebar + nav avec `afficherSection('XXX', this)`
3. Branchement `if (id === 'XXX')` dans `afficherSection()` dans `admin.js`
4. Formulaires : utiliser `.form-panel` sans classe `cache` — afficher/masquer avec `classList.add/remove('visible')` uniquement

---

## ⚠️ RÈGLE — Livraison trouve/remplace
- **Toujours indiquer le fichier en premier** (`index.html`, `admin.js`, `code.gs`, etc.)
- Le **Trouve** doit être court et unique — juste assez pour identifier l'endroit
- Le **Trouve** et le **Remplace** dans des blocs séparés — Jean-Claude copie-colle chacun indépendamment
- Ne jamais mettre Trouve et Remplace dans le même bloc de code

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 📍 OÙ ON EST RENDU — 3 avril 2026

### ✅ Fait cette session (v32)
- Module Fabrication complet — menu, sections HTML, fonctions admin.js, code.gs
- "Confection" → "Fabrication" dans sidebar et nav
- "Listes" → "Statistiques" dans la nav
- "Ventes" → "Inventaire" sous Production dans la sidebar
- Sheet `Productions` — 13 colonnes dont collection + ligne
- `getProductions()` + `saveProduction()` dans `code.gs` + branchés doGet/doPost
- Formulaire fabrication — 2 modes (nouveau lot / lot existant)
- Aperçu temps réel (unités, date dispo, coût)
- Tableau 3 sections (en cure / disponible / épuisé) avec accordéons par collection/ligne
- Totaux en nombre de savons (pas en nombre de lots)
- Collections triées par rang dans le dropdown
- Dates formatées correctement (yyyy-MM-dd)
- Reset formulaire à la fermeture

### ✅ Fait (v31)
- Section `Médiathèque` déplacée à l'intérieur du `<main>`
- `syncCloudinary()` + bouton synchronisation + filtre catégorie
- `medFiltrer()` ajoutée dans `admin.js`

### ✅ Fait (historique complet)
- Filtre recettes par nom (#47)
- Navbar Vente désactivé (#49)
- Ménage code.gs (#58)
- Module ajout ingrédient via URL
- purearome.gs fragrances
- Import recettes JSON (#21)
- Sauvegarde auto (#29)
- Modal produit responsive iPhone/iPad
- Page INCI restructurée v28
- Sheet Mapping_Fournisseurs + getMappingFournisseurs v28
- Section Import PDF + parser Pure Arôme v28

### 🔴 Bugs fabrication — à régler en priorité
1. X et Annuler ne ferment pas le formulaire (testé iPad)
2. Confirmer lot existant ne fonctionne plus
3. Pas de choix de ligne dans le formulaire (collection → ligne → recette)

### 🔴 Bugs existants découverts v32
4. Modifier titre recette ne sauvegarde pas
5. Navigation flèches navigateur → ramène au login
6. Après modif recette → repositionner sur la recette modifiée (pas au milieu)
7. Champ "Ligne" se remplit seul avec la 1re valeur à l'ajout recette — devrait afficher "Choisir"
8. Liste des lignes pas en ordre alphabétique dans formulaire recette

### 🔴 En cours — à terminer
- `afficherApercuItems` — version finale avec catégorie avant nom UC + filtrage + bouton "+"
- `ifFiltrerNoms()` — à ajouter dans `admin.js`
- `ifAjouterNomUC()` et `ifConfirmerNomUC()` — à ajouter dans `admin.js`
- Parser Amazon — après confirmation avec Chantal sur structure PDF
- Ménage dossiers Cloudinary en cours

### ⚠️ En suspens
- `--blanc-pur-65` manquant dans le root CSS
- Reste des `font-size` codés dur dans le CSS
- Affichage $/g brut et réel dans tableau items facture
- Affichage adaptatif $/L, $/kg, $/100g

---

## 💡 IDÉES À DÉVELOPPER
- Coût de revient complet (ingrédients + contenant + emballage + équipement amorti)
- Pages huiles et additifs dynamiques
- Bloc éditorial catalogue
- Présentation formats/prix à revoir quand il y en a plusieurs (tableau ou tuiles)
- Spinner sur chaque bouton d'action pendant appel API
- Vider tous les champs de formulaire après chaque sauvegarde/annulation (global)
- Import recettes MD — listes déroulantes pour collection et ligne
- Collections — façon de regrouper les fragrances

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

---

## 🎯 TOUTES LES TÂCHES À FAIRE — NUMÉROTÉES

### ⚠️ LÉGAL / URGENT
1. Bloquer statut `public` si INCI incomplets ⚠️ LÉGAL
2. Synchronisation mémoire JS — `listesDropdown.fullData` après `inciValider()`
3. Bouton INCI — Envoyer au graphiste par courriel + bloqué si incomplets

### 🏭 FABRICATION — BUGS À RÉGLER
83. X et Annuler ne ferment pas le formulaire fabrication
84. Confirmer lot existant ne fonctionne plus
85. Ajouter choix de ligne dans formulaire fabrication (collection → ligne → recette)
86. Modifier titre recette ne sauvegarde pas
87. Navigation flèches navigateur → ramène au login
88. Après modif recette → repositionner sur la recette modifiée
89. Champ Ligne se remplit seul à l'ajout recette — devrait afficher "Choisir"
90. Liste lignes pas en ordre alphabétique dans formulaire recette

### 📄 FACTURES / ACHATS
4. ~~Import PDF factures — Pure Arôme~~ ✅ v28 livré — **finaliser** `afficherApercuItems` + `ifFiltrerNoms` + `ifAjouterNomUC` + `ifConfirmerNomUC`
5. Parser Amazon — après confirmation avec Chantal sur structure PDF
6. Affichage $/g brut et réel dans tableau items facture
7. Affichage adaptatif $/L, $/kg, $/100g
8. Gestion emballages/contenants dans achats
9. Templates emballages imprimés (ex. Saponica 3/feuille, Petit Nuage 2/feuille)

### 🏗️ ARCHITECTURE
10. Fusion `getCataloguePublic()` + `getRecettes()`
11. ~~Restructuration page INCI~~ ✅ v28
12. Lien cliquable fiche fournisseur — page INCI
13. Champ INCI modifiable + Source + Date — page INCI

### 🛍️ CATALOGUE / PUBLIC
14. Ordre collections par rang (#30)
15. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
16. Filtres catalogue par type de peau (#4)
17. Liens page 7 → catalogue filtré (#5)
18. Guide rapide — colonne "Savons recommandés" (#7)
19. Accordéons mobile seulement (#8)
20. Mosaïque hero dynamique (#9)
21. Textes Sheet → Markdown (#10)
22. Comment acheter (#12)
23. Actualités automatiques (#13)
24. FAQ admin (#14)
25. Pages FAQ, conditions, retours (#15)
26. Courriel confirmation commande (#16)
27. Affichage délais (#20)
28. INCI EU CosIng (#24)
29. Commande légère (#25)
30. Photo par ligne (#27)
31. Calculateur SAF (#31)
32. Coût de revient complet (#33)
33. Scan factures (#34)
34. Comptabilité (#35)
35. Masquer contenu ouverture (#36)
36. Inverser Modifier/Supprimer (#37)
37. Photos en double (#38-bis)
38. Tuiles collections (#39)
39. Bouton Modifier modal facture (#40)
40. Factures — filtre produit (#41)
41. Modal facture complète (#42)
42. Filtres inventaire (#43)
43. Inventaire — séparation (#44)
44. Masquer liste édition (#45)
45. Notes importantes (#48)
46. Prix/g réel à la finalisation (#50)
47. Domaine universcaresse.ca (#52)
48. Catalogue PDF (#53)
49. Amortissement équipement (#54)
50. Module Vente (#55)
51. Mode focus
52. Scroll haut auto
53. Uniformiser consultation
54. Boutons en bas
55. Menu Système — réordonner
56. Fade-in contenu sections
57. Retirer flèche "Découvrir"

### 📷 MÉDIATHÈQUE PHOTOS
~~76. Créer Sheet `Mediatheque`~~ ✅
~~77. Ajouter fonctions code.gs~~ ✅
~~78. Créer modal sélecteur~~ ✅
~~79. Boutons Médiathèque ajoutés~~ ✅
80. Ajouter clés photo dans Sheet `Contenu` pour les 4 photos éditoriales
81. Brancher ces clés dans `appliquerContenu()` dans `main.js`
82. Retirer les 4 URLs Cloudinary codées en dur de `index.html`

### ⚠️ EN SUSPENS TECHNIQUE
58. `--blanc-pur-65` manquant dans le root CSS
59. Reste des `font-size` codés dur dans le CSS

### 🎨 VISUEL
60. Refactoring classes CSS — consolider titres redondants / design system unique (#56)
61. Renommer `ingredient-rangee` → `form-rangee`
62. Prix/g modal — refonte (#3)
63. Guide rapide — peaufiner (#6)
64. Taille texte mobile (#17)
65. Menu burger iPhone (#18)
66. Modal tablette (#19)
67. Taille texte mobile 16→20px (#51)
68. Spinner plus joli + partout (#61)
69. Hiérarchie typographique
70. Remplacer `<div>` par `<div class="page-entete-gauche">` dans 8 entêtes admin
71. Éliminer styles admin dupliqués
72. Fusionner doublons `style.css`
73. Grossir textes de lecture site public

### 💡 IDÉES À DÉVELOPPER
74. Pages huiles et additifs dynamiques
75. Bloc éditorial catalogue

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- **Un seul changement à la fois — attendre confirmation**
- **Toujours indiquer le fichier en premier**
- Toujours lire les fichiers AVANT de proposer
- **Analyser le comportement global avant de coder**
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**

---

## RÈGLES CRITIQUES
- Un seul trouve/remplace à la fois
- Jamais de style inline dans JS/HTML
- Fin de tâche → dire COMMIT
- Toujours demander OUI avant de coder
- Ne jamais créer une nouvelle fonction si une existante peut être réutilisée
- Ne jamais créer une nouvelle classe CSS si une existante peut servir
- Toujours voir si un changement fait un changement ailleurs dans tout le site
- Lors du refactoring, procéder une étape à la fois et attendre un OK avant de passer à la suivante
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**
- **Ne jamais effacer ni modifier le contenu existant du brief — ajouts seulement**
- **Ne jamais montrer une fonction au complet si l'objectif est seulement de la modifier — livrer uniquement le trouve/remplace ciblé**
- **Le Trouve doit être court et unique — pas le bloc complet**
- **Trouve et Remplace dans des blocs séparés — jamais dans le même bloc**
- **Ne pas demander l'approbation avant de livrer le code — dire ce qu'on fait en français simple et livrer directement**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷🐷🐷🐷🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

---

*Univers Caresse — Confidentiel — v32 — 3 avril 2026*

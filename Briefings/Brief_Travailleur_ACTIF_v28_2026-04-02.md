# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v28 — 2 avril 2026

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
- PDF lu via **PDF.js** directement dans le navigateur — zéro API externe, autonome pour la fondatrice
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
- `ifFiltrerNoms(idx)` — filtre les noms UC par catégorie sélectionnée
- `ifAjouterNomUC(idx)` — ouvre le mini-formulaire d'ajout inline
- `ifConfirmerNomUC(idx)` — sauvegarde le nouveau nom UC + recharge fullData
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
- Branché dans `doGet` : `action === 'getTexteBrut&nom='`

### `fullData` — champs disponibles
- `type` — catégorie UC
- `ingredient` — nom UC
- `ingredientFournisseur` — nom fournisseur (col B)
- `inci` — code INCI
- `nomBotanique` — nom botanique ✅ ajouté v28
- `note_olfactive` — note olfactive

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE ✅

### Admin (`admin.js`)
- `donneesCollections`, `donneesRecettes`, `listesDropdown` — chargés une fois
- `listesDropdown.formats` — chargé dans `initialiserNouvelleFacture()`
- `listesDropdown.config` — clés harmonisées avec `Ingredients_INCI` ✅
- `ifMapping` — chargé une fois à l'accès à la section import facture

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
- Bug $/g = 0 réglé — clés `Config` harmonisées

### Listes alphabétiques ✅ CORRIGÉES v27
- Types et ingrédients triés alphabétiquement dans le formulaire facture

---

## 🏗️ ARCHITECTURE — SAUVEGARDE AUTOMATIQUE ✅
- `sauvegarderSheet()` — copie quotidienne, max 28, courriel dimanche
- **⚠️ À FAIRE** : exécuter `creerDeclencheurSauvegarde()` une fois manuellement

---

## 📍 OÙ ON EST RENDU — 2 avril 2026

### ✅ Fait cette session (v28)
- Page INCI restructurée — charge seulement les ingrédients validés
- `nomBotanique` ajouté dans `fullData`
- `getTexteBrut(nom)` ajouté dans `code.gs` + branché dans `doGet`
- Sheet `Mapping_Fournisseurs` créé et peuplé depuis les 4 scrapers
- `getMappingFournisseurs()` ajouté dans `code.gs` + branché dans `doGet`
- Section "Import PDF" ajoutée dans l'admin (sidebar Achats)
- Parser Pure Arôme fonctionnel (numéro, date, items, taxes, validation totaux)
- Mapping automatique PA fonctionnel
- Ajout nom UC + catégorie UC à la volée depuis l'aperçu
- Catégorie UC avant nom UC dans l'aperçu — filtrage par catégorie

### 🔴 En cours — à terminer prochaine session
- `afficherApercuItems` — version finale avec catégorie avant nom UC + filtrage + bouton "+" (trouve/remplace pas encore appliqué — Jean-Claude a arrêté la session)
- `ifFiltrerNoms()` — à ajouter dans `admin.js`
- `ifAjouterNomUC()` et `ifConfirmerNomUC()` — à ajouter dans `admin.js`
- Masquer bloc upload après lecture PDF — ✅ livré mais à vérifier
- Parser Amazon — à construire après confirmation avec Chantal sur structure PDF

### ⚠️ En suspens
- `creerDeclencheurSauvegarde()` à exécuter manuellement
- `--blanc-pur-65` manquant dans le root
- Reste des `font-size` codés dur dans le CSS
- Affichage $/g brut et réel dans tableau items facture
- Affichage adaptatif $/L, $/kg, $/100g

---

## 💡 IDÉES À DÉVELOPPER
- Coût de revient complet (ingrédients + contenant + emballage + équipement amorti)
- Pages huiles et additifs dynamiques
- Bloc éditorial catalogue

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
| `.page-entete-eyebrow` | Sur-titre |
| `.page-entete-titre` | Grand titre |
| `.fade-in` / `.fade-in-doux` | Animations |
| `.cache` | `display: none !important` |
| `.ligne-cliquable` | `<tr>` cliquable |
| `.carte-admin` | Carte générique |
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm` | Boutons |
| `.form-ctrl`, `.form-groupe`, `.form-label` | Formulaires |
| `.msg-zone` | Zone messages |
| `.ingredient-rangee` | **à renommer `form-rangee`** |
| `.ligne-rouge` | Ligne item non mappé dans aperçu import |

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- **Un seul changement à la fois — attendre confirmation**
- Toujours lire les fichiers AVANT de proposer
- **Analyser le comportement global avant de coder**
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**

---

## Nom UC — architecture
**`Ingredients_INCI` :** A=Catégorie UC, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 🎯 PRIORITÉS — MÉCANIQUE

1. **Finaliser import PDF PA** — `afficherApercuItems` + `ifFiltrerNoms` + `ifAjouterNomUC` + `ifConfirmerNomUC`
2. **Parser Amazon** — après confirmation avec Chantal sur structure PDF
3. Affichage $/g brut et réel dans tableau items facture
4. Affichage adaptatif $/L, $/kg, $/100g
5. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
6. Gestion emballages/contenants dans achats
7. Templates emballages imprimés
8. **Synchronisation mémoire JS** — `listesDropdown.fullData` après `inciValider()`
9. Fusion `getCataloguePublic()` + `getRecettes()`
10. Ordre collections par rang (#30)
11. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
12. Filtres catalogue par type de peau (#4)
13. Calculateur SAF (#31)
14. Coût de revient complet (#33)

---

## 🎨 PRIORITÉS — VISUEL

1. Refactoring classes CSS — consolider titres redondants
2. Renommer `ingredient-rangee` → `form-rangee`
3. Taille texte mobile (#17)
4. Menu burger iPhone (#18)
5. Spinner plus joli + partout (#61)
6. Éliminer styles admin dupliqués

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

---

## 🏗️ ARCHITECTURE — FICHIERS

| Fichier | État |
|---|---|
| `index.html` | ✅ lu |
| `index_-_Admin.html` | ✅ lu — section import PDF ajoutée |
| `main.js` | ✅ lu |
| `admin.js` | ✅ lu — import PDF, page INCI restructurée |
| `style.css` | Source unique public + admin |
| `code.gs` | ✅ + Mapping_Fournisseurs + getTexteBrut + getMappingFournisseurs |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → `doPost`
- `appelAPI` → `doGet`
- Ne jamais retirer les branchements existants

---

## RÈGLES CRITIQUES
- Un seul trouve/remplace à la fois
- Jamais de style inline dans JS/HTML
- Fin de tâche → dire COMMIT
- Toujours demander OUI avant de coder
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.


---

*Univers Caresse — Confidentiel — v28 — 2 avril 2026*

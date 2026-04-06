# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v26 — 1 avril 2026

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
- `getCataloguePublic()` et `getRecettes()` font essentiellement la même chose — redondant
- **Fusion prévue** : une seule fonction `getRecettes()`, filtrage `statut = public` côté JS
- **Approche** : reconstruire de côté, tester, puis remplacer

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

### Import PDF automatique
- Je lis le PDF directement (Pure Arôme, Amazon, autres)
- Extraction automatique : numéro, date, fournisseur, items, taxes
- Mapping automatique via `Ingredients_INCI` col B (nom fournisseur) → col I (nom UC)
- Aperçu de validation — items inconnus en rouge → tu assigns type + nom UC → sauvegardé pour la prochaine fois
- Validation des totaux (somme items = sous-total)

### Fournisseurs supportés
- **Pure Arôme** — mapping PA complet dans `Ingredients_INCI`
- **Amazon** — mélange ingrédients + matériel + équipement — assignation manuelle du type
- **Mauvaises Herbes, Arbressence, Divine Essence** — à compléter au fur et à mesure
- **Autres** — entrée manuelle

### Cas particulier — emballages imprimés
- Template sauvegardé : ex. "Commande impression" = Saponica 3/feuille, Petit Nuage 2/feuille, Casa 1/feuille
- Tu entres juste : nombre de feuilles + prix total
- Coût/unité calculé automatiquement par collection

### Formats dans `Recettes_Formats`
- Déjà : recette_id, poids, unite, prix_vente, desc_emballage
- À ajouter : lien vers les items d'emballage (plusieurs par format — ex. étiquette + boîte + ruban)
- Le contenant (pot, tube) se rattache aussi au format, pas à la recette de base

---

## 🏗️ ARCHITECTURE — INCI — RESTRUCTURATION PLANIFIÉE (décisions v26)

### Principe
`Ingredients_INCI` = **seulement les ingrédients validés** (nom UC + catégorie UC définis)
- ✅ Validé : nom UC + catégorie UC + INCI trouvé
- 🔴 À compléter : nom UC + catégorie UC OK, INCI manquant

### Ce qui change
- **Retirer** les "à valider" sans nom UC de `Ingredients_INCI` — ils restent dans les sheets de scraping
- **L'achat devient le seul point d'entrée** pour les nouveaux ingrédients
- **Plus d'ajout d'ingrédient dans le formulaire recette** — si pas dans la liste, c'est qu'il n'a pas été acheté et validé

### Page INCI admin — restructuration
- **Accordéon 1** : Catégories UC (déjà fait)
- **Accordéon 2** : Par catégorie → liste des ingrédients validés avec statut ✅ / 🔴
- Plus de liste géante de tout ce qui a été scrapé

### Mapping fournisseurs
- `Config_INCI` a déjà les correspondances catégorie source → catégorie UC (pas juste PA)
- Mapping nom : col B `Ingredients_INCI` = nom fournisseur (surtout PA) → col I = nom UC
- Pour les autres fournisseurs : mapping se complète au fur et à mesure des achats

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE ✅

### Public (`main.js`)
- `donneesCatalogue` — produits, collections, infoCollections

### Admin (`admin.js`)
- `donneesCollections`, `donneesRecettes`, `listesDropdown` — chargés une fois
- `listesDropdown.formats` — chargé dans `initialiserNouvelleFacture()`
- Sections réseau à l'ouverture : `inci`, `densites`, `inventaire`, `factures`, `contenu-site`

---

## 🏗️ ARCHITECTURE — FACTURES / ACHATS

### Sheet `Formats_Ingredients` ✅
- Type, Ingrédient, Fournisseur, Quantité, Unité
- Alimenté automatiquement à chaque nouvel achat

### Formule $/g ✅
- **$/g brut** = prix_unitaire ÷ grammes
- **$/g réel** = $/g brut × (1 + marge_perte) × facteur_taxes
- Conversions : kg×1000, L×1000×densité, ml×densité, lbs×453.592

### 🔴 BUG EN COURS — $/g = 0
- `listesDropdown.config` clés vs types dans la facture ne correspondent pas
- `console.log` ajouté dans `ajouterItem` pour debug — **à retirer après correction**
- **À régler en priorité**

---

## 🏗️ ARCHITECTURE — SAUVEGARDE AUTOMATIQUE ✅
- `sauvegarderSheet()` — copie quotidienne, max 28, courriel dimanche
- **⚠️ À FAIRE** : exécuter `creerDeclencheurSauvegarde()` une fois manuellement

---

## 📍 OÙ ON EST RENDU — 1 avril 2026

### ✅ Fait (v24-v25)
- Collections, Recettes, Densités — bugs corrigés
- Boutons cachés en mode formulaire partout
- Ingrédients triés par poids dans formulaire recette
- `Formats_Ingredients` — sheet + fonctions + interface
- Bouton "Terminer plus tard" facture
- Formule $/g brut et réel

### 🔴 Prochaine étape immédiate
1. **🔴 BUG** — $/g = 0 — debug `listesDropdown.config`
2. Listes alphabétiques dans formulaire facture (types et ingrédients)
3. Harmoniser noms catégories entre `Config` et `Ingredients_INCI`
4. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
5. Restructuration page INCI — accordéons propres
6. Import PDF factures — Pure Arôme en premier
7. Affichage $/g brut et réel dans tableau items facture
8. Affichage adaptatif $/L, $/kg, $/100g
9. Gestion emballages et contenants dans les achats
10. Templates emballages imprimés

### ⚠️ En suspens
- `creerDeclencheurSauvegarde()` à exécuter manuellement
- `--blanc-pur-65` manquant dans le root
- Reste des `font-size` codés dur dans le CSS
- `console.log` de debug dans `ajouterItem` à retirer

---

## 💡 IDÉES À DÉVELOPPER
- Coût de revient complet (ingrédients + contenant + emballage + équipement amorti)
- Pages huiles et additifs dynamiques
- Bloc éditorial catalogue

---

## 🏗️ ARCHITECTURE — `Recettes_Formats`
- `prix_vente` et `format` dans `Recettes` **ne sont plus utilisés**
- **`Recettes_Formats` fait foi** pour les prix et formats de vente
- **À venir** : lien vers items d'emballage (plusieurs par format)

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

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- **Un seul changement à la fois — attendre confirmation**
- Toujours lire les fichiers AVANT de proposer
- **Analyser le comportement global avant de coder**

---

## Nom UC — architecture
**`Ingredients_INCI` :** A=Catégorie UC, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 🎯 PRIORITÉS — MÉCANIQUE

1. **🔴 BUG** — $/g = 0 — debug `listesDropdown.config`
2. Listes alphabétiques formulaire facture
3. Harmoniser catégories `Config` ↔ `Ingredients_INCI`
4. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
5. Restructuration page INCI
6. Import PDF — Pure Arôme
7. Affichage $/g dans tableau items
8. Affichage adaptatif $/L, $/kg, $/100g
9. Gestion emballages/contenants dans achats
10. Templates emballages imprimés
11. **Synchronisation mémoire JS** — `listesDropdown.fullData` après `inciValider()`
12. Fusion `getCataloguePublic()` + `getRecettes()`
13. Ordre collections par rang (#30)
14. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
15. Filtres catalogue par type de peau (#4)
16. Calculateur SAF (#31)
17. Coût de revient complet (#33)

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
| `main.js` | ✅ lu |
| `admin.js` | ✅ lu |
| `style.css` | Source unique public + admin |
| `code.gs` | ✅ + Formats_Ingredients + sauvegarde auto |

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

### 🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

---

*Univers Caresse — Confidentiel — v26 — 1 avril 2026*

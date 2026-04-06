# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v27 — 2 avril 2026

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

### Import PDF automatique — PROCHAINE ÉTAPE
- Claude lit le PDF directement via API Anthropic dans un artifact
- Extraction automatique : numéro, date, fournisseur, items, taxes
- Mapping automatique via `Ingredients_INCI` col B → col I (nom UC)
- Aperçu de validation — items inconnus en rouge → assignation type + nom UC → sauvegardé
- Validation des totaux (somme items = sous-total)
- **Fournisseurs** : Pure Arôme en premier (mapping le plus complet), Amazon (mix ingrédients + matériel), autres au fur et à mesure
- **Cas particulier emballages imprimés** : template sauvegardé (ex. Saponica 3/feuille, Petit Nuage 2/feuille) — entrer juste nb feuilles + prix total

### Formats dans `Recettes_Formats`
- À venir : lien vers items d'emballage (plusieurs par format — étiquette + boîte + ruban)
- Le contenant (pot, tube) se rattache au format, pas à la recette de base

---

## 🏗️ ARCHITECTURE — INCI — RESTRUCTURATION PLANIFIÉE

### Principe
`Ingredients_INCI` = **seulement les ingrédients validés**
- ✅ Validé : nom UC + catégorie UC + INCI trouvé
- 🔴 À compléter : nom UC + catégorie UC OK, INCI manquant
- L'achat = seul point d'entrée pour nouveaux ingrédients
- Plus d'ajout d'ingrédient dans le formulaire recette

### Page INCI admin — restructuration planifiée
- Accordéon 1 : Catégories UC
- Accordéon 2 : Par catégorie → ingrédients validés avec statut ✅ / 🔴

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE ✅

### Admin (`admin.js`)
- `donneesCollections`, `donneesRecettes`, `listesDropdown` — chargés une fois
- `listesDropdown.formats` — chargé dans `initialiserNouvelleFacture()`
- `listesDropdown.config` — clés harmonisées avec `Ingredients_INCI` ✅

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

### ✅ Fait cette session (v27)
- Bug $/g = 0 réglé — `Config` réinitialisé avec bons types
- `DENSITES_DEFAUT` harmonisé avec `Ingredients_INCI`
- Listes types et ingrédients en ordre alphabétique dans formulaire facture
- `console.log` de debug retiré

### 🔴 Prochaine étape immédiate
1. **Import PDF factures** — Pure Arôme en premier (via API Anthropic dans artifact)
2. Affichage $/g brut et réel dans tableau items facture
3. Affichage adaptatif $/L, $/kg, $/100g
4. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
5. Restructuration page INCI
6. Gestion emballages/contenants dans achats
7. Templates emballages imprimés

### ⚠️ En suspens
- `creerDeclencheurSauvegarde()` à exécuter manuellement
- `--blanc-pur-65` manquant dans le root
- Reste des `font-size` codés dur dans le CSS

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

1. **Import PDF factures** — Pure Arôme en premier (API Anthropic dans artifact)
2. Affichage $/g brut et réel dans tableau items facture
3. Affichage adaptatif $/L, $/kg, $/100g
4. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
5. Restructuration page INCI
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
| `main.js` | ✅ lu |
| `admin.js` | ✅ lu |
| `style.css` | Source unique public + admin |
| `code.gs` | ✅ + Formats_Ingredients + Config réinitialisé + sauvegarde auto |

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

### 🐷🐷🐷🐷🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

---

*Univers Caresse — Confidentiel — v27 — 2 avril 2026*

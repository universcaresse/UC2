# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v23 — 1 avril 2026

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
- **⚠️ MENTION IMPORTANTE : Une recette ne peut pas passer au statut `public` tant que tous ses ingrédients n'ont pas un code INCI valide** — à implémenter : bloquer le select statut dans le formulaire de modification si INCI incomplets

---

## 🔴 REFACTORING MAJEUR PLANIFIÉ
- `getCataloguePublic()` et `getRecettes()` font essentiellement la même chose — redondant et plus lourd
- **Fusion prévue** : une seule fonction `getRecettes()` retourne tout, le filtrage `statut = public` se fait côté JS
- **Approche de refactoring** : reconstruire le site complètement de côté, tester, puis remplacer ce qui est en ligne

---

## 🔴 PRINCIPE DE CONSOLIDATION CSS — ACTIF
- À chaque changement, évaluer si on peut consolider plutôt qu'ajouter
- **Refactoring HTML/CSS planifié** : remplacer les classes sémantiques redondantes par des classes génériques
- **Règle** : un titre c'est un titre partout — pas de `.contact-titre`, `.catalogue-titre`, etc.

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE ✅

### Public (`main.js`)
- Ordre de chargement : `initSPA()` d'abord, puis `getContenu` (await), puis `getCatalogue` (en arrière-plan sans bloquer)
- `donneesCatalogue` — variable globale contenant produits, collections, infoCollections
- Navigation entre sections = instantané, zéro appel réseau supplémentaire

### Admin (`admin.js`)
- Au `DOMContentLoaded` : `chargerDonneesInitiales()` — `Promise.all([getCollections, getRecettes, getDropdownLists])`
- `donneesCollections`, `donneesRecettes`, `listesDropdown` — chargés une fois, utilisés partout
- Sections qui font encore un appel réseau à l'ouverture : `inci`, `densites`, `inventaire`, `factures`, `contenu-site`

---

## 🏗️ ARCHITECTURE — SYNCHRONISATION DES DONNÉES ✅

| Fonction | Déclenchée par | Met à jour |
|---|---|---|
| `mettreAJourInciRecettes()` | `validerIngredientInci()` | `Recettes` col X/L/M + `Recettes_Base` col 3/4 |
| `mettreAJourCollectionRecettes()` | `updateCollectionItem()` | `Recettes` col E/F/G/21 + `Recettes_Base` col 1/2 |
| `mettreAJourCategorieRecettes()` | `modifierCategorieUC()` | `Recettes` col L + `Recettes_Base` col 3 |

### ⚠️ Synchronisation mémoire JS — À FAIRE
- Après `inciValider()` → mettre à jour `listesDropdown.fullData` en mémoire avec le nouveau INCI

---

## 🏗️ ARCHITECTURE — SAUVEGARDE AUTOMATIQUE ✅ AJOUTÉ v23

- `sauvegarderSheet()` — copie quotidienne du Spreadsheet complet dans Drive "Univers Caresse — Sauvegardes"
- Max 28 copies — supprime la plus vieille automatiquement
- Courriel hebdomadaire chaque dimanche à `universcaresse@outlook.com`
- **⚠️ À FAIRE** : exécuter `creerDeclencheurSauvegarde()` une seule fois manuellement dans Apps Script

---

## 📍 OÙ ON EST RENDU — 1 avril 2026

### ✅ Fait cette session (v23)

#### Site public
- Variables typographiques root — 39 branchements
- Photo collection catalogue — carré + `object-position: center`
- `.ligne-groupe-nom` — `margin-bottom: 0` + `font-weight: 600`
- `.collection-entete` — `align-items: center` (photo centrée)
- `.collection-entete-slogan` → `--texte-corps`
- `.ligne-groupe-desc` — `margin-top: 8px`
- `.collection-section` — transition `opacity 0.4s ease`
- Dot carte + modal — bordure `2px solid var(--blanc-pur-50)`
- Modal prix — `align-items: flex-end`
- Page "Le Savon Artisanal" — `.page-entete-eyebrow` + `.edu-accroche` branchés
- Page "Bon à savoir" — `.info-card-titre/texte` + `.bonne-section-titre` branchés
- Page Contact — 6 classes branchées + `.formulaire-titre` → `--texte-titre-md`
- Portrait iPad — `hero-left` aligné à gauche, tuiles collections `aspect-ratio: 3/4`
- `--texte-titre-md: 1.50rem` ajouté au root

#### Admin
- ~~Import recettes JSON (#18)~~ ✅
- Sauvegarde automatique (#22) ✅ — `sauvegarderSheet()` + déclencheur quotidien
- Collections — tuiles en ordre alphabétique par ligne
- Collections — flash de tuiles corrigé (ordre cache/visible inversé)
- Collections — bouton "+ Nouvelle collection" caché en mode formulaire
- Collections — bouton "+ Ajouter une ligne" caché en mode modification
- Recettes — bouton "+ Nouvelle recette" caché en mode formulaire
- Recettes — filtre "Complètes/Incomplètes" — logique `complet` complétée
- Recettes — ingrédients triés par poids décroissant dans fiche
- Recettes — dot déplacé `bottom` → `top`
- Densités — formulaire modifier corrigé (classe `cache` retirée du HTML)
- Densités — bouton Modifier retiré, ligne cliquable seulement

### 🔴 Prochaine étape immédiate
1. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
2. **Synchronisation mémoire JS** — `listesDropdown.fullData` après `inciValider()`
3. **Bouton INCI** — "Envoyer au graphiste" par courriel + bloquer si INCI incomplets
4. Refactoring classes CSS — consolider titres redondants

### ⚠️ En suspens
- `creerDeclencheurSauvegarde()` à exécuter manuellement une fois dans Apps Script
- `--blanc-pur-65` manquant dans le root
- Reste des `font-size` codés dur dans le CSS

---

## 💡 IDÉES À DÉVELOPPER

### Bloc éditorial catalogue
- Combler les trous de grille avec un seul bloc couleur+photo+texte adaptatif
- En attente : infrastructure photos d'atelier dans le Sheet

### Pages huiles et additifs dynamiques
- Grille tuiles + filtre par catégorie + modal au clic
- Données depuis `Ingredients_INCI` + `Recettes`
- Remplacerait le contenu statique actuel

### Bouton INCI — Envoyer au graphiste
- Courriel avec liste INCI complète
- Bloqué si INCI incomplets

---

## 🏗️ ARCHITECTURE — `Recettes_Formats`
- `prix_vente` et `format` dans `Recettes` **ne sont plus utilisés**
- **`Recettes_Formats` fait foi** pour les prix et formats de vente

---

## 🏗️ ARCHITECTURE — Modal produit public
- Tri INCI : plus de 1% par quantité décroissante, puis 1% et moins
- Fragrances regroupées sous "Fragrance" en fin
- **Jamais de fallback sur `i.nom`** — uniquement `i.inci`
- Préfixe obligatoire : `"Ingrédients : "`

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
| `.page-entete` | Conteneur entête — même partout |
| `.page-entete-gauche` | Conteneur texte gauche |
| `.page-entete-eyebrow` | Sur-titre — toujours EN HAUT |
| `.page-entete-titre` | Grand titre — toujours SOUS le sur-titre |
| `.fade-in` | Animation glissement |
| `.fade-in-doux` | Animation douce |
| `.cache` | Cacher (`display: none !important`) |
| `.accordeon-detail` | Ligne détail sous tableau |
| `.ligne-validee` | Fond vert pâle |
| `.texte-brut` | Zone texte brut sélectionnable |
| `.ligne-cliquable` | `<tr>` cliquable |
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

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- **Un seul changement à la fois — attendre confirmation avant le suivant**
- Toujours lire les fichiers uploadés AVANT de proposer
- **À chaque changement — évaluer consolidation plutôt qu'ajout**
- **Analyser le comportement global et tous les "si" avant de coder**
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**

---

## Nom UC — architecture
**`Ingredients_INCI` :** A=Catégorie, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC
**Recettes sheet** : col X (24e) = INCI — mis à jour automatiquement via `mettreAJourInciRecettes()`

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 🎯 PRIORITÉS — MÉCANIQUE

1. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
2. **Synchronisation mémoire JS** — `listesDropdown.fullData` après `inciValider()`
3. **Bouton INCI** — envoyer au graphiste + bloquer si incomplets
4. Fusion `getCataloguePublic()` + `getRecettes()`
5. Ordre collections par rang (#30)
6. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
7. Filtres catalogue par type de peau (#4)
8. Liens page 7 → catalogue filtré (#5)
9. Guide rapide — colonne "Savons recommandés" (#7)
10. Accordéons mobile seulement (#8)
11. Mosaïque hero dynamique (#9)
12. Textes Sheet → Markdown (#10)
13. Comment acheter (#12)
14. Actualités automatiques (#13)
15. FAQ admin (#14)
16. Pages FAQ, conditions, retours (#15)
17. Courriel confirmation commande (#16)
18. Affichage délais (#20)
19. INCI EU CosIng (#24)
20. Commande légère (#25)
21. Photo par ligne (#27)
22. Calculateur SAF (#31)
23. Coût de revient (#33)
24. Scan factures (#34)
25. Comptabilité (#35)
26. Pages huiles et additifs dynamiques
27. Bloc éditorial catalogue

---

## 🎨 PRIORITÉS — VISUEL

1. Refactoring classes CSS — consolider titres redondants
2. Refonte design system unique (#56)
3. Renommer `ingredient-rangee` → `form-rangee`
4. Prix/g modal — refonte (#3)
5. Guide rapide — peaufiner (#6)
6. Taille texte mobile (#17)
7. Menu burger iPhone (#18)
8. Modal tablette (#19)
9. Spinner plus joli + partout (#61)
10. Hiérarchie typographique
11. Entêtes admin — `page-entete-gauche`
12. Éliminer styles admin dupliqués
13. Fusionner doublons `style.css`

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

---

## 🏗️ ARCHITECTURE — FICHIERS

| Fichier | État |
|---|---|
| `index.html` | ✅ lu |
| `index_-_Admin.html` | ✅ lu |
| `main.js` | ✅ lu |
| `admin.js` | ✅ lu |
| `style.css` | Source unique public + admin |
| `code.gs` | ✅ nettoyé + synchro + sauvegarde auto |
| `scraper_url_v2.gs` | ✅ lu |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → `doPost`
- `appelAPI` → `doGet`
- Ne jamais retirer les branchements existants

---

## RÈGLES CRITIQUES
- Un seul trouve/remplace à la fois — attendre confirmation
- Jamais de style inline dans JS/HTML
- Fin de tâche → dire COMMIT
- Toujours demander OUI avant de coder
- Ne pas créer une nouvelle classe si une existante peut servir
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

---

*Univers Caresse — Confidentiel — v23 — 1 avril 2026*

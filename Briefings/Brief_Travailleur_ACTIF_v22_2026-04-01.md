# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v22 — 1 avril 2026

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

## 🔴 PRINCIPE DE CONSOLIDATION CSS — NOUVEAU
- À chaque changement, évaluer si on peut consolider plutôt qu'ajouter
- **Refactoring HTML/CSS planifié** : remplacer les classes sémantiques redondantes par des classes génériques :
  - `.contact-info-titre`, `.formulaire-titre`, `.bonne-section-titre` → une seule classe `.titre-md`
  - Même logique pour tous les niveaux de titres
- **Règle** : un titre c'est un titre partout — pas de `.contact-titre`, `.catalogue-titre`, etc.

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE ✅ COMPLÉTÉ 31 mars

### Public (`main.js`)
- Ordre de chargement : `initSPA()` d'abord, puis `getContenu` (await), puis `getCatalogue` (en arrière-plan sans bloquer)
- `donneesCatalogue` — variable globale contenant produits, collections, infoCollections
- Navigation entre sections = instantané, zéro appel réseau supplémentaire
- `afficherCollectionsPublic()`, `afficherNbProduits()` — appelées quand `getCatalogue` revient
- `chargerCatalogue()` dans `index.html` utilise `donneesCatalogue` si déjà en mémoire, sinon fait son propre appel
- `initSPA()` appelé avant le chargement des données — évite le rescroll au chargement

### Admin (`admin.js`)
- Au `DOMContentLoaded` : `chargerDonneesInitiales()` — `Promise.all([getCollections, getRecettes, getDropdownLists])`
- `donneesCollections`, `donneesRecettes`, `listesDropdown` — chargés une fois, utilisés partout
- `afficherSection()` appelle `afficherCollections()`, `afficherRecettes()`, `afficherStatsAccueil()` — depuis la mémoire
- `chargerCollections()` et `chargerRecettes()` conservées pour les rechargements après sauvegarde
- Sections qui font encore un appel réseau à l'ouverture : `inci`, `densites`, `inventaire`, `factures`, `contenu-site` — données trop volatiles pour être mises en cache

---

## 🏗️ ARCHITECTURE — SYNCHRONISATION DES DONNÉES ✅ COMPLÉTÉ 31 mars

### Fonctions de synchronisation dans `code.gs`

| Fonction | Déclenchée par | Met à jour |
|---|---|---|
| `mettreAJourInciRecettes(nom, inci, type, ancienNomUC, nouveauNomUC)` | `validerIngredientInci()` | `Recettes` col X/L/M + `Recettes_Base` col 3/4 |
| `mettreAJourCollectionRecettes(collection, rang, ligne)` | `updateCollectionItem()` | `Recettes` col E/F/G/21 + `Recettes_Base` col 1/2 |
| `mettreAJourCategorieRecettes(ancienne, nouvelle)` | `modifierCategorieUC()` | `Recettes` col L + `Recettes_Base` col 3 |

### Protections en place
- Suppression collection bloquée si recettes liées
- Suppression ligne bloquée si recettes liées
- Suppression catégorie UC bloquée si utilisée dans `Recettes` ou `Ingredients_INCI`

### ⚠️ Synchronisation mémoire JS — À FAIRE
- Après `inciValider()` → mettre à jour `listesDropdown.fullData` en mémoire avec le nouveau INCI
- Sans ça, les avertissements ⚠️ sur les ingrédients sans INCI restent affichés même après validation

---

## 📍 OÙ ON EST RENDU — 1 avril 2026

### ✅ Fait cette session (v22)

#### Typographie — 39 branchements sur variables root
Variables ajoutées au `:root` :
- `--texte-micro: 0.70rem` — labels très discrets
- `--texte-xs: 0.75rem` — sur-titres, boutons, nav, INCI
- `--texte-xs-2: 0.82rem` — slogans, labels secondaires
- `--texte-sm: 0.90rem` — texte secondaire
- `--texte-sm-2: 0.95rem` — variante secondaire
- `--texte-corps: 1.05rem` — lecture principale
- `--texte-corps-2: 1.15rem` — variante corps
- `--texte-titre-sm: 1.30rem` — titres tuiles
- `--texte-titre-md: 1.50rem` — titres de section
- `--texte-signature: 2rem` — signature cursive

#### Autres corrections catalogue
- Photo collection — `aspect-ratio: 4/5` → `1/1` (carré) + `object-position: center`
- `.ligne-groupe-nom` — `margin-bottom: 8px` → `0` (centré entre bordures)
- `.ligne-groupe-desc` — `margin-top: 8px` ajouté (moins collé sur le titre)
- `.collection-entete-slogan` — branché sur `--texte-corps`
- `.carte-couleur-dot` — bordure `2px solid var(--blanc-pur-50)` ajoutée
- `.modal-fermer` — bordure `2px solid var(--blanc-pur-50)` ajoutée
- `.modal-visuel-hex` — `align-items: flex-end` (prix en bas)
- `.collection-section` — transition `opacity 0.4s ease` ajoutée

### 🔴 Prochaine étape immédiate
1. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
2. **Synchronisation mémoire JS** — `listesDropdown.fullData` après `inciValider()`
3. **Refactoring classes CSS** — consolider les classes de titres redondantes
4. Continuer branchements typographie sur sections restantes
5. Vérifier INCI s'affichent correctement côté public

### ⚠️ En suspens
- `--blanc-pur-65` manquant dans le root — `.citation-source` utilise `rgba(255,255,255,0.65)` codé dur
- Reste encore des `font-size` codés dur dans le CSS — à brancher au fur et à mesure
- Classes de titres redondantes à consolider (`contact-info-titre`, `formulaire-titre`, `bonne-section-titre` → `.titre-md`)

---

## 💡 IDÉES À DÉVELOPPER

### Bloc éditorial dans la grille catalogue
- Quand une collection a un nombre de produits qui ne remplit pas la dernière rangée, insérer **un seul bloc** qui prend l'espace restant (1, 2 ou 3 colonnes selon le trou)
- Le bloc utilise la couleur de la collection + une photo d'atelier + un texte court
- Proportion adaptive selon l'appareil
- **En attente** : infrastructure photos d'atelier par collection dans le Sheet — à faire quand les photos codées en dur seront migrées

### Pages Le Savon Artisanal — pages 4 et 5
- **Page huiles** : grille de tuiles par huile avec filtre par catégorie + modal au clic (bienfaits + liste des savons qui la contiennent) — données depuis `Ingredients_INCI` + `Recettes`
- **Page additifs** : même logique
- Remplacerait le contenu statique actuel par du contenu dynamique tiré des données

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
- Si aucun INCI valide → `inciEl.textContent = ''`

---

## 🎨 REFONTE VISUELLE — DESIGN SYSTEM UNIQUE (#56)

### Ce qui reste à faire
- Remplacer `<div>` par `<div class="page-entete-gauche">` dans les 8 entêtes admin
- Consolider les classes de titres redondantes → classes génériques
- Passer en revue `style.css` et fusionner les doublons
- Appliquer `.fade-in` sur le contenu des sections
- **Renommer `ingredient-rangee` → `form-rangee`**

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
- Toujours indiquer le fichier avant de proposer
- Toujours lire les fichiers uploadés AVANT de proposer
- **À chaque changement — évaluer si on peut consolider plutôt qu'ajouter**
- **Analyser le comportement global et tous les "si" avant de coder**
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**

---

## Nom UC — architecture
**`Ingredients_INCI` :** A=Catégorie, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC
**`Ingredients_UC`** — 146+ ingrédients, 8+ catégories
**Recettes sheet** : col X (24e) = INCI — mis à jour automatiquement via `mettreAJourInciRecettes()`

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 🎯 PRIORITÉS — MÉCANIQUE

1. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
2. **Synchronisation mémoire JS** — `listesDropdown.fullData` après `inciValider()`
3. Fusion `getCataloguePublic()` + `getRecettes()` (refactoring majeur)
4. Ordre collections par rang (#30)
5. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
6. Filtres catalogue par type de peau (#4)
7. Liens page 7 → catalogue filtré (#5)
8. Guide rapide — colonne "Savons recommandés" (#7)
9. Accordéons mobile seulement (#8)
10. Mosaïque hero dynamique (#9)
11. Textes Sheet → Markdown (#10)
12. Comment acheter (#12)
13. Actualités automatiques (#13)
14. FAQ admin (#14)
15. Pages FAQ, conditions, retours (#15)
16. Courriel confirmation commande (#16)
17. Affichage délais (#20)
18. Import recettes JSON (#21)
19. INCI EU CosIng (#24)
20. Commande légère (#25)
21. Photo par ligne (#27)
22. Sauvegarde auto (#29)
23. Calculateur SAF (#31)
24. Coût de revient (#33)
25. Scan factures (#34)
26. Comptabilité (#35)
27. Masquer contenu ouverture (#36)
28. Inverser Modifier/Supprimer (#37)
29. Photos en double (#38-bis)
30. Tuiles collections (#39)
31. Bouton Modifier modal facture (#40)
32. Factures — filtre produit (#41)
33. Modal facture complète (#42)
34. Filtres inventaire (#43)
35. Inventaire — séparation (#44)
36. Masquer liste édition (#45)
37. Remplacer alert/confirm/prompt (#46) — partiellement ✅
38. ~~Filtre recettes par nom (#47)~~ ✅
39. Notes importantes (#48)
40. ~~Navbar Vente désactivé (#49)~~ ✅
41. Prix/g réel finalisation (#50)
42. Domaine universcaresse.ca (#52)
43. Catalogue PDF (#53)
44. Amortissement (#54)
45. Module Vente (#55)
46. ~~Ménage code.gs (#58)~~ ✅
47. Select Nom UC filtré par catégorie UC — INCI
48. Lien cliquable fiche fournisseur — INCI
49. Champ INCI modifiable + Source + Date correction — INCI
50. ~~Module ajout ingrédient via URL~~ ✅
51. ~~`purearome.gs` fragrances~~ ✅
52. Mode focus
53. Scroll haut auto
54. Uniformiser consultation
55. Boutons en bas
56. Menu Système réordonner
57. Fade-in contenu sections
58. Retirer flèche "Découvrir"
59. Gestion emballages dans achats — à clarifier
60. **Pages huiles et additifs dynamiques** — grille tuiles + filtre + modal (données depuis Sheets)
61. **Bloc éditorial catalogue** — combler les trous de grille avec bloc couleur+photo+texte adaptatif

---

## 🎨 PRIORITÉS — VISUEL

1. **Refactoring classes CSS** — consolider titres redondants → classes génériques
2. Refonte visuelle — design system unique (#56)
3. Renommer `ingredient-rangee` → `form-rangee`
4. ~~Modal produit responsive iPhone/iPad~~ ✅
5. Prix/g modal — refonte (#3)
6. Guide rapide — peaufiner (#6)
7. Taille texte mobile (#17)
8. Menu burger iPhone (#18)
9. Modal tablette (#19)
10. Spinner plus joli + partout (#61) — partiellement ✅
11. Hiérarchie typographique
12. Remplacer `<div>` par `<div class="page-entete-gauche">` dans 8 entêtes admin
13. Éliminer styles admin qui dupliquent styles publics
14. Fusionner doublons dans `style.css`

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

---

## 🏗️ ARCHITECTURE — FICHIERS

### Les fichiers
- **`index.html`** — boutique publique ✅ lu
- **`index_-_Admin.html`** — panneau Chantal ✅ lu
- **`main.js`** — moteur public ✅ lu — chargement mémoire ✅
- **`admin.js`** — moteur admin ✅ lu — chargement mémoire ✅
- **`style.css`** — UN SEUL fichier pour les deux interfaces
- **`code.gs`** — nettoyé 28 mars ✅ — synchronisation données 31 mars ✅
- **`scraper_url_v2.gs`** — scraping ciblé ✅ lu

### Sheets Google

| Sheet | Contenu |
|---|---|
| `Collections` | A à J |
| `Recettes` | A à X (col X = INCI par ingrédient) |
| `Recettes_Formats` | Formats de vente — **source unique prix/format** |
| `Recettes_Base` | Ingrédients de base par collection/ligne |
| `Ingredients_INCI` | A=Cat, B=Nom, C=INCI, D=Bot, E=Source, F=Date, G=Note, H=Statut, I=NomUC |
| `Ingredients_UC` | 146+ ingrédients, 8+ catégories |
| `Factures` | Factures d'achat |
| `Achats` | Détail items |
| `Inventaire_ingredients` | Stock — à refaire lors session achats |
| `Config` | Densités |
| `Contenu` | Textes site public |
| `Categories_UC` | Catégories UC |
| `Config_INCI` | Correspondance catégories |
| `Scraping_PA/MH/Arbressence/DE` | Maintenus manuellement |
| `Copie de Recettes` | Backup — ignorer |
| `Listes` | Futur — ignorer |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → `doPost`
- `appelAPI` → `doGet`
- Ne jamais retirer les branchements existants

---

## RÈGLES CRITIQUES
- **Pousser back — obligatoire**
- **Un seul trouve/remplace à la fois — attendre confirmation avant le suivant**
- Toujours lire le fichier avant de proposer
- Jamais de style inline dans JS/HTML
- Jamais suggérer pause/repos
- Fin de tâche → dire COMMIT
- Brief en `.md` — toujours en fichier
- Toujours demander OUI avant de coder
- **À chaque changement — évaluer consolidation plutôt qu'ajout**
- **Voir comment c'est fait sur le public avant de coder côté admin**
- **Ne pas créer une nouvelle classe si une existante peut servir**
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**
- **Analyser le comportement global et tous les "si" avant de coder**
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

### Briefs lus
- Brief Organisateur ✅ — Chercheur ✅ — Scripteur ✅ — Brouillon ✅
- `index_-_Admin.html` ✅ — `scraper_url_v2.gs` ✅ — `main.js` ✅ — `index.html` ✅ — `admin.js` ✅

---

*Univers Caresse — Confidentiel — v22 — 1 avril 2026*

# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v15 — 30 mars 2026 (soir)

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
- `getCataloguePublic()` retourne en plus : `slogan`, `desc_collection`, `desc_ligne`, `image_collection` — à intégrer dans `getRecettes()` lors de la fusion
- **Approche de refactoring** : reconstruire le site complètement de côté, tester, puis remplacer ce qui est en ligne — objectif de réduire au maximum la taille du code

---

## 🎨 REFONTE VISUELLE — DESIGN SYSTEM UNIQUE (#56)

### Principe fondamental
**Un seul design system pour les deux interfaces — public et admin.** Pas de styles parallèles, pas de classes doublons. Si un élément existe déjà avec un style, on l'utilise. Si on a besoin d'une variation mineure (ex: padding légèrement différent), on adapte la classe existante — on ne crée pas une nouvelle classe.

### Règle absolue
Avant de créer une nouvelle classe CSS, vérifier si une classe existante peut être utilisée ou légèrement adaptée. Un padding de 10px au lieu de 20px ne justifie pas une nouvelle classe.

### Ce qui doit être identique public ↔ admin
- **Entêtes de page** — même structure HTML : `.page-entete` > `.page-entete-gauche` > `.page-entete-eyebrow` + `.page-entete-titre` — bouton ou plume à droite selon le contexte
- **Animations** — `.fade-in` et `.fade-in-doux` partout, même comportement via `scrollObserver`
- **Typographie** — mêmes familles, mêmes tailles, mêmes espacements
- **Couleurs** — mêmes variables CSS — jamais de couleur codée en dur
- **Boutons** — mêmes classes `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`
- **Séparateurs** — même largeur, même style
- **Cartes** — même structure
- **Formulaires** — mêmes classes `.form-ctrl`, `.form-groupe`, `.form-label`
- **Messages** — même style `.msg-zone`
- **Modals** — même structure

### Structure HTML correcte d'une entête de page
```html
<div class="page-entete fade-in">
  <div class="page-entete-gauche">
    <p class="page-entete-eyebrow">Sous-titre descriptif</p>
    <h1 class="page-entete-titre">Titre de la <em>page</em></h1>
  </div>
  <!-- Optionnel : bouton action à droite -->
  <button class="btn btn-primary">+ Action</button>
</div>
```

### Ce qui est fait ✅
- `.page-entete-eyebrow` avant `.page-entete-titre` dans l'admin ✅
- `.fade-in` sur les `.page-entete` ✅
- `adminScrollObserver` + `reobserverFadeIn()` ✅

### Ce qui reste à faire (#56)
- Remplacer `<div>` par `<div class="page-entete-gauche">` dans les 8 entêtes admin
- Vérifier et éliminer tous les styles admin qui dupliquent des styles publics
- Passer en revue `style.css` et fusionner les doublons
- Appliquer `.fade-in` sur le contenu des sections, pas juste les entêtes
- **Renommer `ingredient-rangee` en nom générique (ex: `form-rangee`)** — utilisé autant pour les ingrédients que les formats, applicable partout où des champs sont alignés horizontalement avec un ✕

---

## CLASSES CSS — UN SEUL SYSTÈME
**Règle : on utilise ce qui existe. On n'invente pas.**

| Classe | Usage |
|---|---|
| `.page-entete` | Conteneur entête — même partout |
| `.page-entete-gauche` | Conteneur texte gauche — toujours utilisé |
| `.page-entete-eyebrow` | Sur-titre — toujours EN HAUT du titre |
| `.page-entete-titre` | Grand titre — toujours SOUS le sur-titre |
| `.fade-in` | Animation glissement — sur `.page-entete` et sections |
| `.fade-in-doux` | Animation douce — éléments secondaires |
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
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm` | Boutons — même partout |
| `.form-ctrl`, `.form-groupe`, `.form-label` | Formulaires — même partout |
| `.msg-zone` | Zone messages |
| `.separateur` | Ligne séparatrice |
| `.ingredient-rangee` | Ligne horizontale champs + ✕ — **à renommer `form-rangee`** lors refont |

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- **Un seul changement à la fois — attendre confirmation avant le suivant**
- Toujours indiquer le fichier avant de proposer
- Voir comment c'est fait sur le public avant de coder côté admin
- Toujours lire les fichiers uploadés AVANT de proposer des changements — ne jamais supposer

---

## 🏗️ ARCHITECTURE — `Recettes_Formats`

### Principe
- `prix_vente` et `format` dans la feuille `Recettes` **ne sont plus utilisés** pour l'affichage public ni admin
- **`Recettes_Formats` fait foi** pour les prix et formats de vente
- La sheet a été vidée manuellement le 30 mars 2026 pour repartir propre

### Structure `Recettes_Formats`
| Colonne | Contenu |
|---|---|
| A | recette_id |
| B | poids |
| C | unite |
| D | prix_vente |
| E | desc_emballage |

### Affichage carte public
- `formats_complets` uniquement — plus de fallback `prix_vente`
- Séparateur entre formats : `·` (`&nbsp;&nbsp;·&nbsp;&nbsp;`)
- Exemple : `7,00 $ / 100 g  ·  5,00 $ / 50 g`
- Si vide → rien affiché
- Classe du prix : `carte-prix` (pas `carte-formats`)

### Affichage carte admin
- Statut déplacé dans le badge collection : `SAPONICA · Public`
- Prix/formats depuis `formats_complets` via `.recette-prix`

### Affichage fiche consultation admin
- Format : affiche les entrées de `Recettes_Formats` avec ⚠️ si vide
- Prix : retiré de la fiche

### Formulaire modification admin
- `fr-format` et `fr-prix` retirés du HTML et du JS
- `fr-cure` ajouté dans le HTML
- `sauvegarderRecette()` : `format: ''` et `prix_vente: 0` (deux endroits)
- Formats affichés sur lignes horizontales avec ✕ via `ingredient-rangee`
- Sauvegarde en batch au bouton Enregistrer (pas immédiate)

### Filtre "Incomplètes"
- Condition : `!rec.formats_complets || rec.formats_complets.length === 0`

---

## 🏗️ ARCHITECTURE — Modal produit public

### Structure HTML
```html
<div class="modal-overlay" id="modal-produit">
  <div class="modal-produit">
    <div class="modal-visuel">
      <div class="modal-visuel-photo" id="modal-visuel-photo"></div>
      <div class="modal-visuel-hex" id="modal-visuel-hex">
        <div class="modal-prix-format" id="modal-prix-format"></div>
      </div>
    </div>
    <div class="modal-contenu">
      <button class="modal-fermer">✕</button>  ← en haut à droite du contenu
      <div class="modal-collection"></div>
      <div class="modal-nom"></div>
      <div class="modal-ligne"></div>
      <p class="modal-desc"></p>
      <div class="modal-inci"></div>  ← en bas, justifié, plus petit
    </div>
  </div>
</div>
```

### Layout CSS
- **Ordi** : 2 colonnes (visuel gauche | contenu droite), hauteur fixe `min(88vh, 900px)`
- **Photo** : carrée `aspect-ratio: 1/1`, `flex-shrink: 0`
- **Bloc couleur** : `flex: 1` — prend le reste sous la photo
- **Prix/format** dans le bloc couleur — même style que carte publique
- **INCI** : `margin-top: auto` — collé en bas du contenu, `text-align: justify`, plus petit, séparé par border-top
- **✕ fermer** : dans `modal-contenu` en haut à droite

### Génération INCI côté JS (main.js)
- Tri : plus de 1% par quantité décroissante, puis 1% et moins
- Fragrances regroupées sous "Fragrance" en fin
- **Jamais de fallback sur `i.nom`** — uniquement `i.inci`
- Préfixe obligatoire : `"Ingrédients : "`
- Si aucun INCI valide → `inciEl.textContent = ''`

---

## 🏗️ ARCHITECTURE — Import MD

### État actuel
- ID calculé en temps réel au chargement de la section (appel API `getRecettes`)
- Ligne normalisée en majuscules via `.toUpperCase()`
- INCI résolu au parsing depuis `listesDropdown`
- Autres bugs non encore investigués

### ⚠️ Bug connu
- Le INCI des ingrédients importés par MD ne se place que lors d'une modification manuelle et sauvegarde — pas au moment de l'import

---

## ⚠️ NOTES À RÉGLER

### Statut public bloqué si INCI incomplets
- **⚠️ MENTION IMPORTANTE — LÉGALE** : bloquer le passage au statut `public` dans le formulaire de modification si des ingrédients n'ont pas de INCI valide — à implémenter

### Bug — Formats dupliqués à la sauvegarde
- Quand on modifie une recette et qu'on sauvegarde, un format est ajouté en double dans `Recettes_Formats` même si on n'a pas touché aux formats — à corriger dans `sauvegarderRecette()`

### Page INCI
- Select Nom UC ne se filtre pas par catégorie UC *(complexe)*
- Lien cliquable vers la page web du produit fournisseur
- Champ INCI modifiable + Source + Date de correction

### Spinner
- Plus joli + partout dans l'admin

### Gestion emballages dans achats
- À clarifier : feuille dédiée ou même approche que les ingrédients ? (session dédiée)

---

## ⚠️ CHANGEMENTS EN ATTENTE

### `purearome.gs` — fragrances non testées
### Module ajout ingrédient via URL — flux non testé

---

## Nom UC — architecture

**`Ingredients_INCI` :** A=Catégorie, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC

**`Ingredients_UC`** — 146 ingrédients, 8 catégories

**Recettes sheet** : col X (24e) = INCI sauvegardé par ingrédient — se remplit lors de `saveRecette()`

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## Import recettes — corrections noms
1. Cèdre d'Atlas → Cèdre Atlas
2. Huile d'olive → Huile d'olive vierge
3. Huile de tournesol → Huile de tournesol oléique
4. Cèdre feuille → Cèdre feuilles
5. Ylang ylang → Ylang-ylang
6. Musk → Musc
7. Hydroxyde de sodium → NaOH
8. Eau distillée → Eau déminéralisée
9. Karité → Beurre de karité

---

## 🎯 PRIORITÉS — MÉCANIQUE

1. **⚠️ LÉGAL** — Bloquer statut `public` si INCI incomplets
2. Import MD — bug INCI non résolu au moment de l'import
3. Import MD — autres bugs à investiguer
4. Fusion `getCataloguePublic()` + `getRecettes()` (refactoring majeur — site parallèle)
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
19. Import recettes JSON (#21)
20. INCI EU CosIng (#24)
21. Commande légère (#25)
22. Photo par ligne (#27)
23. Sauvegarde auto (#29)
24. Calculateur SAF (#31)
25. Coût de revient (#33)
26. Scan factures (#34)
27. Comptabilité (#35)
28. Masquer contenu ouverture (#36)
29. Inverser Modifier/Supprimer (#37)
30. Photos en double (#38-bis)
31. Tuiles collections (#39)
32. Bouton Modifier modal facture (#40)
33. Factures — filtre produit (#41)
34. Modal facture complète (#42)
35. Filtres inventaire (#43)
36. Inventaire — séparation (#44)
37. Masquer liste édition (#45)
38. Remplacer alert/confirm/prompt (#46) — partiellement ✅
39. ~~Filtre recettes par nom (#47)~~ ✅
40. Notes importantes (#48)
41. ~~Navbar Vente désactivé (#49)~~ ✅
42. Prix/g réel finalisation (#50)
43. Domaine universcaresse.ca (#52)
44. Catalogue PDF (#53)
45. Amortissement (#54)
46. Module Vente (#55)
47. ~~Ménage code.gs (#58)~~ ✅
48. Select Nom UC filtré par catégorie UC — INCI
49. Lien cliquable fiche fournisseur — INCI
50. Champ INCI modifiable + Source + Date correction — INCI
51. Module ajout ingrédient via URL — flux non testé
52. `purearome.gs` fragrances — non testé
53. Mode focus
54. Scroll haut auto
55. Uniformiser consultation
56. Boutons en bas
57. Menu Système réordonner
58. Fade-in contenu sections
59. Retirer flèche "Découvrir"
60. Gestion emballages dans achats — à clarifier

---

## 🎨 PRIORITÉS — VISUEL

1. Refonte visuelle — design system unique (#56)
2. Renommer `ingredient-rangee` → `form-rangee` (ou équivalent générique)
3. Modal produit responsive iPhone/iPad — à valider
4. Prix/g modal — refonte (#3)
5. Guide rapide — peaufiner (#6)
6. Taille texte mobile (#17)
7. Menu burger iPhone (#18)
8. Modal tablette (#19)
9. Taille texte mobile 16→20px (#51)
10. Spinner plus joli + partout (#61)
11. Hiérarchie typographique
12. Remplacer `<div>` par `<div class="page-entete-gauche">` dans 8 entêtes admin — #56
13. Éliminer styles admin qui dupliquent styles publics — #56
14. Fusionner doublons dans `style.css` — #56

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

---

## 🏗️ ARCHITECTURE — FICHIERS

### Les fichiers
- **`index.html`** — boutique publique ✅ lu
- **`index_-_Admin.html`** — panneau Chantal ✅ lu
- **`main.js`** — moteur public ✅ lu
- **`admin.js`** — moteur admin — `adminScrollObserver` + `reobserverFadeIn()`
- **`style.css`** — UN SEUL fichier pour les deux interfaces
- **`code.gs`** — nettoyé 28 mars ✅ — lu 30 mars ✅
- **`scraper_url_v2.gs`** — scraping ciblé ✅

### Sheets Google

| Sheet | Contenu |
|---|---|
| `Collections` | A à J |
| `Recettes` | A à X (col X = INCI par ingrédient) |
| `Recettes_Formats` | Formats de vente — **source unique prix/format** |
| `Recettes_base` | Ingrédients de base |
| `Ingredients_INCI` | A=Cat, B=Nom, C=INCI, D=Bot, E=Source, F=Date, G=Note, H=Statut, I=NomUC |
| `Ingredients_UC` | 146 ingrédients, 8 catégories |
| `Factures` | Factures d'achat |
| `Achats` | Détail items |
| `Inventaire_ingredients` | Stock |
| `Config` | Densités |
| `Contenu` | Textes site public |
| `Categories_UC` | Catégories UC |
| `Config_INCI` | Correspondance catégories |
| `Scraping_PA/MH/Arbressence/DE` | Maintenus manuellement |

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
- **Voir comment c'est fait sur le public avant de coder côté admin**
- **Ne pas créer une nouvelle classe si une existante peut servir**
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

### Briefs lus
- Brief Organisateur ✅ — Chercheur ✅ — Scripteur ✅ — Brouillon ✅
- `index_-_Admin.html` ✅ — `scraper_url_v2.gs` ✅ — `main.js` ✅ — `index.html` ✅

---

*Univers Caresse — Confidentiel — v15 — 30 mars 2026*

# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v14 — 30 mars 2026

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
- Un seul changement à la fois
- Toujours indiquer le fichier avant de proposer
- Voir comment c'est fait sur le public avant de coder côté admin

---

## 🏗️ ARCHITECTURE — `Recettes_Formats` (nouveau)

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

### Affichage fiche consultation admin
- Format : affiche les entrées de `Recettes_Formats` avec ⚠️ si vide
- Prix : retiré de la fiche

### Formulaire modification admin
- `fr-format` et `fr-prix` retirés du HTML et du JS
- `fr-cure` ajouté dans le HTML
- `sauvegarderRecette()` : `format: ''` et `prix_vente: 0` (deux endroits : ligne ~998 et ~1257)
- Formats affichés sur lignes horizontales avec ✕ via `ingredient-rangee`
- Sauvegarde en batch au bouton Enregistrer (pas immédiate)

### Filtre "Incomplètes"
- Condition : `!rec.formats_complets || rec.formats_complets.length === 0`

---

## ⚠️ NOTES À RÉGLER

### Import MD
- Bugs non testés — recette_id potentiellement écrasant une recette existante
- Autres problèmes signalés non encore investigués

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

**`Ingredients_INCI` :** A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC

**`Ingredients_UC`** — 146 ingrédients, 8 catégories

**Recettes :** col I (Nom UC) si remplie, sinon col B

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

1. Import MD — bugs à investiguer (recette_id, autres)
2. Modal produit — responsive iPhone/iPad/ordi (session dédiée)
3. Voir recettes incomplètes (#26) ✅ partiellement
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
50. Module ajout ingrédient via URL — flux non testé
51. `purearome.gs` fragrances — non testé
52. Mode focus
53. Scroll haut auto
54. Uniformiser consultation
55. Boutons en bas
56. Menu Système réordonner
57. Fade-in contenu sections
58. Retirer flèche "Découvrir"
59. Gestion emballages dans achats — à clarifier

---

## 🎨 PRIORITÉS — VISUEL

1. Refonte visuelle — design system unique (#56)
2. Renommer `ingredient-rangee` → `form-rangee` (ou équivalent générique)
3. Prix/g modal — refonte (#3)
4. Guide rapide — peaufiner (#6)
5. Taille texte mobile (#17)
6. Menu burger iPhone (#18)
7. Modal tablette (#19)
8. Taille texte mobile 16→20px (#51)
9. Spinner plus joli + partout (#61)
10. Hiérarchie typographique
11. Remplacer `<div>` par `<div class="page-entete-gauche">` dans 8 entêtes admin — #56
12. Éliminer styles admin qui dupliquent styles publics — #56
13. Fusionner doublons dans `style.css` — #56

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

---

## 🏗️ ARCHITECTURE

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
| `Recettes` | A à W (col W = surgras) |
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
- Un seul trouve/remplace à la fois — attendre confirmation
- Toujours lire le fichier avant de proposer
- Jamais de style inline dans JS/HTML
- Jamais suggérer pause/repos
- Fin de tâche → dire COMMIT
- Brief en `.md` — toujours en fichier
- Toujours demander OUI avant de coder
- **Voir comment c'est fait sur le public avant de coder côté admin**
- **Ne pas créer une nouvelle classe si une existante peut servir**

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

*Univers Caresse — Confidentiel — v14 — 30 mars 2026*

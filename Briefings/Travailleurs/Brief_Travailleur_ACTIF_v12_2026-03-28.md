# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v12 — 28 mars 2026 — 19h00

> 📦 **Historique complet des sessions dans** `Brief_Univers_Caresse_ARCHIVES.md`

---

## PROJET — FICHIERS ET URLS
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`, `purearome.gs`, `scraper_url_v2.gs`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbyDbcy6kBKcTWtj2B0kLfAioy9f2ShI0UtMPP1wg2K-xKUUDdIDONH_rbB_RCzu7lyhVw/exec`
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

### Ce qui reste à faire
- Remplacer `<div>` par `<div class="page-entete-gauche">` dans les 8 entêtes admin
- Vérifier et éliminer tous les styles admin qui dupliquent des styles publics
- Passer en revue `style.css` et fusionner les doublons
- Appliquer `.fade-in` sur le contenu des sections, pas juste les entêtes

---

## 🔮 CHANTIERS À VENIR

### Page admin — correction INCI
- Afficher les lignes 🔴 À compléter
- Champ INCI modifiable, Source, Date de correction
- Lien cliquable vers la page web du produit fournisseur

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`

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

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- Un seul changement à la fois
- Toujours indiquer le fichier avant de proposer
- Voir comment c'est fait sur le public avant de coder côté admin

---

## ⚠️ NOTES À RÉGLER

### Page INCI — Nom UC
- Select Nom UC ne se filtre pas par catégorie UC *(complexe)*
- `inciAjouterNomUC()` utilise `prompt()` natif — à remplacer

### Spinner
- Plus joli + partout dans l'admin

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

## 🎯 PRIORITÉS
1. Page INCI — en cours 🔶
2. **Refonte visuelle — design system unique (#56)** 🔶
3. Voir recettes incomplètes (#26)
4. Ordre collections par rang (#30)
5. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
6. Prix/g modal — refonte (#3)
7. Filtres catalogue par type de peau (#4)
8. Liens page 7 → catalogue filtré (#5)
9. Guide rapide — peaufiner (#6)
10. Guide rapide — colonne "Savons recommandés" (#7)
11. Accordéons mobile seulement (#8)
12. Mosaïque hero dynamique (#9)
13. Textes Sheet → Markdown (#10)
14. Comment acheter (#12)
15. Actualités automatiques (#13)
16. FAQ admin (#14)
17. Pages FAQ, conditions, retours (#15)
18. Courriel confirmation commande (#16)
19. Taille texte mobile (#17)
20. Menu burger iPhone (#18)
21. Modal tablette (#19)
22. Affichage délais (#20)
23. Import recettes JSON (#21)
24. INCI EU CosIng (#24)
25. Commande légère (#25)
26. Photo par ligne (#27)
27. Sauvegarde auto (#29)
28. Calculateur SAF (#31)
29. Coût de revient (#33)
30. Scan factures (#34)
31. Comptabilité (#35)
32. Masquer contenu ouverture (#36)
33. Inverser Modifier/Supprimer (#37)
34. Photos en double (#38-bis)
35. Tuiles collections (#39)
36. Bouton Modifier modal facture (#40)
37. Factures — filtre produit (#41)
38. Modal facture complète (#42)
39. Filtres inventaire (#43)
40. Inventaire — séparation (#44)
41. Masquer liste édition (#45)
42. Remplacer alert/confirm/prompt (#46) ✅ partiellement
43. ~~Filtre recettes Par nom (#47)~~ ✅
44. Notes importantes (#48)
45. ~~Navbar Vente désactivé (#49)~~ ✅
46. Prix/g réel finalisation (#50)
47. Taille texte mobile 16→20px (#51)
48. Domaine universcaresse.ca (#52)
49. Catalogue PDF (#53)
50. Amortissement (#54)
51. Module Vente (#55)
52. ~~Ménage code.gs (#58)~~ ✅

### Chantiers Brouillon
53. Mode focus
54. Scroll haut auto
55. Uniformité admin/public → **inclus dans #56**
56. Uniformiser consultation
57. Hiérarchie typographique
58. Boutons en bas
59. Menu Système réordonner
60. Fade-in contenu sections
61. Spinner plus joli + partout
62. Retirer flèche "Découvrir"

---

## 🏗️ ARCHITECTURE

### Les fichiers
- **`index.html`** — boutique publique ✅ lu
- **`index_-_Admin.html`** — panneau Chantal ✅ lu
- **`main.js`** — moteur public ✅ lu
- **`admin.js`** — moteur admin — `adminScrollObserver` + `reobserverFadeIn()`
- **`style.css`** — UN SEUL fichier pour les deux interfaces
- **`code.gs`** — nettoyé 28 mars ✅ — 1472 lignes
- **`scraper_url_v2.gs`** — scraping ciblé ✅

### Sheets Google

| Sheet | Contenu |
|---|---|
| `Collections` | A à J |
| `Recettes` | A à V |
| `Recettes_Formats` | Formats de vente |
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

*Univers Caresse — Confidentiel — v12 — 28 mars 2026 19h00*

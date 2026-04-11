# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v10 — 28 mars 2026 — 16h30

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
Sans ça : erreur CORS sur tout le site.

---

## 🔮 CHANTIERS À VENIR

### Page admin — correction INCI
- Afficher les lignes 🔴 À compléter
- Champ INCI modifiable, Source, Date de correction
- Lien cliquable vers la page web du produit fournisseur

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`
- À mettre à jour avant chaque rencontre avec Chantal

---

## CLASSES CSS GÉNÉRIQUES RÉUTILISABLES
**Règle : avant de créer une classe CSS, vérifier si une classe générique existante peut servir.**
**Nommage — non négociable :** nommé par ce qu'il **est**, pas où il est **utilisé**.

| Classe | Usage |
|---|---|
| `.cache` | Cacher un élément (`display: none !important`) |
| `.accordeon-detail` | Ligne `<tr>` de détail qui s'ouvre sous une ligne de tableau |
| `.ligne-validee` | Fond vert pâle (`--primary-06`) sur une ligne validée |
| `.texte-brut` | Zone texte brut sélectionnable |
| `.ligne-cliquable` | Ligne `<tr>` cliquable — `cursor: pointer` + hover beige |
| `.carte-admin` | Carte admin générique |
| `.carte-admin-entete` | Entête de carte admin |
| `.champ-avec-reset` | Conteneur relatif pour input + bouton X |
| `.btn-reset-champ` | Bouton X pour réinitialiser un champ |
| `.texte-secondaire` | Texte gris, taille réduite (0.85em) |

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- **Toujours indiquer le fichier concerné avant chaque trouve/remplace**
- Changement ciblé → trouve/remplace uniquement, jamais le fichier complet
- Un seul changement à la fois — attendre la confirmation avant le suivant

---

## ⚠️ NOTES À RÉGLER — PROCHAINE SESSION

### Page INCI — Nom UC
- **Select Nom UC** — ne se met pas à jour quand catégorie UC change *(complexe — correspondance Categories_UC vs Ingredients_UC à établir)*
- **`inciAjouterNomUC()`** utilise encore `prompt()` natif — à remplacer (#46)

### Spinner
- Ajouter un spinner à chaque attente serveur partout dans l'admin
- Spinner plus joli que l'actuel

---

## ⚠️ CHANGEMENTS EN ATTENTE / À FAIRE

### `purearome.gs` — fragrances non testées
- **Non testé** — à valider au prochain run

### Module ajout ingrédient via URL — à tester
- Flux complet end-to-end non testé

---

## Nom UC — architecture

**Concept :** Chantal a son propre vocabulaire — le "Nom UC". Les fournisseurs ont leurs noms, Chantal a les siens. Les deux coexistent dans `Ingredients_INCI`.

**Structure `Ingredients_INCI` :**
A=Catégorie, B=Nom fournisseur, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC

**Sheet `Ingredients_UC`** — 146 ingrédients, 8 catégories :
Huiles & beurres | HE & aromatiques | Argiles & poudres | Additifs | Colorants | Décorations | Arômes & saveurs | Lessive

**Dans les recettes :** `getDropdownLists()` utilise col I (Nom UC) si remplie, sinon col B

**Dans le panneau détail INCI :**
- Catégorie fournisseur | Catégorie UC — sur la même ligne
- Select Nom UC trié A→Z + bouton `+`
- Cartes Catégories UC affichent `Nom — INCI` ✅

**Filtres Statut/Source** — masqués par défaut, bouton "Filtres" pour afficher ✅

---

## Module ajout ingrédient via URL

**Flux :**
1. Recettes → liste déroulante → `__nouveau__`
2. Modal : Nom + URL fournisseur
3. Go → sauvegarde silencieuse recette → scraping → sheet fournisseur
4. Redirection page INCI, ingrédient pré-recherché
5. Validation → `Ingredients_INCI`
6. ← Retour à la recette

**Fournisseurs :** `purearome.com` → `Scraping_PA` | `lesmauvaisesherbes.com` → `Scraping_MH` | `arbressence.ca` → `Scraping_Arbressence` | `divineessence.com` → `Scraping_DE`

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs` → `lancerPurearome()` et `paro_scraperPages()` ⛔
- `mauvaisesherbes.gs` → `lancerScrapingMH()` ⛔
- `arbressence.gs` → `scraperArbressence()` ⛔
- `divineessence.gs` → `scraperDE_init()` et `scraperDE_continuer()` ⛔
- `scraper_url_v2.gs` — SEUL scraper actif

---

## Import des recettes — prérequis

**État :** ~60 ✅ prêts | ~25 ⚠️ à valider avec Chantal | ~25 ❌ à ajouter

**❌ prioritaires :** Lait de chèvre en poudre, Eau déminéralisée, Miel, Argile jaune, Flocons d'avoine, Micas, Allantoine, Soie de tussah, Indigo naturel, Marc de café, Cacao en poudre, Saindoux, Café infusé, Musk blanc

**Corrections noms avant import :**
1. Cèdre d'Atlas → Cèdre Atlas
2. Huile d'olive → Huile d'olive vierge
3. Huile de tournesol → Huile de tournesol oléique
4. Cèdre feuille → Cèdre feuilles
5. Ylang ylang → Ylang-ylang
6. Musk → Musc
7. Hydroxyde de sodium / Soude caustique → NaOH
8. Eau distillée / Eau → Eau déminéralisée
9. Karité (seul) → Beurre de karité

---

## 🎯 PRIORITÉS (liste numérotée Jean-Claude)
1. Page INCI — en cours 🔶
   - Tout le visuel ✅
   - Nom UC ✅ (select Nom UC / filtre catégorie à faire)
   - Module ajout ingrédient via URL ✅ (à tester)
   - Validation des ~528 ingrédients — en cours (Jean-Claude)
2. Voir recettes incomplètes (#26)
3. Ordre collections par rang (#30)
4. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
5. Prix/g modal — refonte (#3)
6. Filtres catalogue par type de peau (#4)
7. Liens page 7 → catalogue filtré par ingrédient (#5)
8. Guide rapide — peaufiner le visuel (#6)
9. Guide rapide — colonne "Savons recommandés" (#7)
10. Accordéons huiles/additifs/HE — mobile seulement (#8)
11. Mosaïque hero — alimenter dynamiquement (#9)
12. Textes Sheet → Markdown simplifié (#10)
13. Informer visiteurs comment acheter (#12)
14. Actualités automatiques depuis Sheet (#13)
15. FAQ gérable depuis admin (#14)
16. Pages FAQ, conditions de vente, retours/livraison (#15)
17. Courriel confirmation automatique commande (#16)
18. Taille texte mobile — section par section (#17)
19. Menu burger — valider iPhone (#18)
20. Modal tablette — revalider (#19)
21. Affichage délais — à définir (#20)
22. Import recettes JSON (#21)
23. Recherche INCI via API EU CosIng (#24)
24. Système commande léger sans panier (#25)
25. Photo par ligne de produit (#27)
26. Sauvegarde automatique Sheet + GitHub (#29)
27. Calculateur SAF intégré fiche recette (#31)
28. Coût de revient (#33)
29. Scan factures automatique (QuaggaJS) (#34)
30. Comptabilité — État des résultats, Bilan (#35)
31. Masquer contenu à l'ouverture fiche/formulaire (#36)
32. Inverser ordre Modifier/Supprimer (#37)
33. Photos en double partout (#38-bis)
34. Tuiles collections — revoir affichage lignes (#39)
35. Bouton Modifier dans modal facture (#40)
36. Page factures — filtre "Par produit", icônes, retirer TPS/TVQ (#41)
37. Modal facture — afficher facture complète (#42)
38. Filtres inventaire — revoir le visuel (#43)
39. Inventaire — ligne séparation + resserrer + retirer colonne "Total (g)" (#44)
40. Modification collection/ligne — masquer liste en mode édition (#45)
41. Remplacer `alert()`/`confirm()`/`prompt()` par modals/toasts (#46) ✅ partiellement
42. ~~Filtre recettes "Par nom" — placeholder (#47)~~ ✅
43. Bon à savoir — refaire section Notes importantes (#48)
44. ~~Navbar admin — item Vente désactivé (#49)~~ ✅
45. Prix/g réel — optimiser finalisation facture (#50)
46. Taille texte minimum mobile (16px → 20px) (#51)
47. Nom de domaine `universcaresse.ca` (#52)
48. Catalogue PDF 11×17 (#53)
49. Amortissement équipements (#54)
50. Module Vente complet (#55)
51. Refonte admin + design system (#56)
52. ~~Ménage `code.gs` (#58)~~ ✅

### Chantiers Brouillon — UX Admin
53. Mode focus
54. Scroll en haut automatique
55. Uniformité rendu admin vs public
56. Uniformiser mode consultation
57. Lignes séparatrices + hiérarchie typographique
58. Boutons de fonction — regrouper en bas
59. Menu Système — réordonner
60. Fade in admin
61. Spinner plus joli + partout

### Chantiers Brouillon — UX Public
62. Retirer flèche sur "Découvrir nos collections"

---

## 🏗️ ARCHITECTURE

### Les fichiers
- **`index.html`** — boutique publique
- **`index_-_Admin.html`** — panneau Chantal ✅ lu et assimilé
- **`main.js`** — moteur site public
- **`admin.js`** — moteur administration
- **`style.css`** — apparence des deux interfaces
- **`code.gs`** — pont Google Sheets — nettoyé 28 mars ✅ — 1472 lignes
- **`purearome.gs`** — ⛔ neutralisé
- **`scraper_url_v2.gs`** — scraping ciblé une URL ✅

### Sheets Google

| Sheet | Contenu |
|---|---|
| `Collections` | Collections et lignes de produits (col A à J) |
| `Recettes` | Les recettes (col A à V) |
| `Recettes_Formats` | Formats de vente |
| `Recettes_base` | Ingrédients de base d'une ligne |
| `Ingredients_INCI` | Bible finale — A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut, I=Nom UC |
| `Ingredients_UC` | Vocabulaire Chantal — 146 ingrédients, 8 catégories |
| `Factures` | Les factures d'achat |
| `Achats` | Le détail de chaque item |
| `Inventaire_ingredients` | Le stock actuel |
| `Config` | A=Type, B=Densité, C=Unité source, D=marge_perte_pct |
| `Contenu` | Textes éditables du site public |
| `Categories_UC` | A=Catégorie, B=Date ajout |
| `Config_INCI` | Table de correspondance catégories fournisseurs → UC |
| `Scraping_PA` | Scraping Purearome — maintenu manuellement |
| `Scraping_MH` | Scraping Les Mauvaises Herbes — maintenu manuellement |
| `Scraping_Arbressence` | Scraping Arbressence — maintenu manuellement |
| `Scraping_DE` | Scraping Divine Essence — maintenu manuellement |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → brancher dans `doPost`
- `appelAPI` → brancher dans `doGet`
- Ne jamais retirer les branchements existants

---

## ✅ DÉCISIONS PRISES (cumulatif)
- "Recettes" partout — "Sur-titre" au lieu de "eyebrow"
- Livraison par trouve/remplace — commits par Jean-Claude
- `section-texte` adopté partout
- Modal iPhone sans couleur — iPad portrait 2 colonnes — iPad paysage photo gauche
- Fiche collection — rang dans carré couleur
- Collections secondaires — cases à cocher
- 2e photo recette — col T, `image_url_noel`
- Prix/g — `prixUnitaire ÷ (quantité_en_g × (1 - margePerte/100))`
- Google Sheets format QC — `parseFloat` sans `.toFixed()`
- Sheet Listes — N'EST PLUS UTILISÉE
- Sections éducatives SPA — 178 clés pattern `edu_sX_element`
- Nav sections : Accueil → Catalogue → Le savon artisanal → Bon à savoir → Contact
- Tout contenu éditable par Chantal passe par l'admin
- Boutons X admin — classe `btn-fermer-panneau`
- Formats recettes — Sheet `Recettes_Formats` séparée
- Listes déroulantes recettes/factures — col I (Nom UC) si remplie, sinon col B
- `Ingredients_INCI` col I = Nom UC (vocabulaire Chantal)
- `Ingredients_UC` = 146 noms standardisés, 8 catégories
- Scrapers neutralisés — `scraper_url_v2.gs` seul actif
- `Code.gs` nettoyé — 1472 lignes
- Après tout changement `Code.gs` → redéployer Apps Script
- Filtres Statut/Source INCI — masqués par défaut, bouton Filtres
- Cartes Catégories UC — affichent Nom UC + INCI

---

## RÈGLES CRITIQUES
- **Pousser back — obligatoire**
- Un seul trouve/remplace à la fois
- Toujours indiquer le fichier avant de proposer
- Toujours lire le fichier avant de proposer
- Jamais de style inline dans JS/HTML
- Jamais suggérer pause/repos
- Fin de tâche → dire COMMIT
- Brief en `.md` — toujours en fichier
- Toujours cerner le problème avant de proposer
- Toujours demander OUI avant de coder

---

## 🏗️ NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

### Briefs lus et assimilés
- Brief Organisateur ✅ — Brief Chercheur ✅ — Brief Scripteur ✅ — Brief Brouillon ✅
- `index_-_Admin.html` ✅ — `scraper_url_v2.gs` ✅

---

*Univers Caresse — Confidentiel — v10 — 28 mars 2026 16h30*

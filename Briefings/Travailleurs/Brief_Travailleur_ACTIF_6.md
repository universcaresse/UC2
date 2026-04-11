# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
*Mis à jour : 27 mars 2026*

---

## PROJET — FICHIERS ET URLS
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`, `purearome.gs`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbyDbcy6kBKcTWtj2B0kLfAioy9f2ShI0UtMPP1wg2K-xKUUDdIDONH_rbB_RCzu7lyhVw/exec`
- Site public : https://universcaresse.github.io/universcaresse/
- GitHub : https://github.com/universcaresse/univers-caresse

---

## 🔮 CHANTIERS À VENIR

### Page admin — correction INCI
Créer une page dans l'admin pour que Chantal puisse corriger les INCI manuellement sur les lignes marquées 🔴 À compléter dans `Ingredients_INCI`.

**Requis :**
- Afficher les lignes 🔴 À compléter
- Champ INCI modifiable
- Champ Source (qui a corrigé / d'où vient l'info)
- Champ Date de correction
- **Lien cliquable vers la page web du produit fournisseur** — pour que Chantal puisse ouvrir la page source et aller chercher le INCI directement sur le site

---

## 📋 DOCUMENT DE TRAVAIL — CHANTAL
**Fichier :** `Durant_votre_cafe_jasez_de.docx`
- Document vivant — ce qui est réglé s'enlève, ce qui est nouveau s'ajoute
- Chantal le complète au café et le retourne à Jean-Claude
- Contient : ingrédients manquants ❌, correspondances à valider ⚠️, corrections de noms à confirmer
- À mettre à jour avant chaque rencontre avec Chantal

---

## CLASSES CSS GÉNÉRIQUES RÉUTILISABLES
**Règle : avant de créer une classe CSS, vérifier si une classe générique existante peut servir. 2620 lignes de CSS c'est déjà trop.**

**Règle de nommage — non négociable :** tout nouveau composant CSS est nommé par ce qu'il **est**, pas par où il est **utilisé**. `.accordeon-detail` ✅ — `.inci-detail` ❌. Si le nom contient le nom d'une section, c'est un signal d'alarme — recommencer.

**Approche design system progressive :** on ne refait pas tout d'un coup. Mais chaque nouveau composant est générique dès le départ, et chaque fois qu'on touche quelque chose d'existant, on en profite pour le normaliser. C'est comme ça qu'on sort des 2620 lignes — pas en une journée, mais en arrêtant d'en ajouter des mauvaises.

| Classe | Usage |
|---|---|
| `.cache` | Cacher un élément (`display: none !important`) |
| `.accordeon-detail` | Ligne `<tr>` de détail qui s'ouvre sous une ligne de tableau |
| `.ligne-validee` | Fond vert pâle (`--primary-06`) sur une ligne validée |
| `.texte-brut` | Zone texte lecture seule, sélectionnable, scrollable (max-height 80px) |

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- **Toujours indiquer le fichier concerné avant chaque trouve/remplace**
- Changement ciblé → trouve/remplace uniquement, jamais le fichier complet
- Un seul changement à la fois — attendre la confirmation avant le suivant

---

## ✅ CHANGEMENTS — SESSION 27 MARS 2026

### Scraping Purearome — refonte complète ✅

**Problème :** `Scraping_PA_v4` avait des doublons par design — PA classe un produit dans plusieurs catégories, le scraper créait une ligne par catégorie.

**Solution :** Nouveau fichier `purearome.gs` — déduplication en mémoire pendant le catalogue API, une seule ligne par produit avec la catégorie la plus spécifique. Les catégories fourre-tout ("Ingrédients Secs", "Ingrédients Liquides") perdent toujours contre une catégorie spécifique.

**Fichier `purearome.gs` (nouveau) :**
- `lancerPurearome()` — point d'entrée, scrape le catalogue par catégorie via API, déduplique en mémoire par slug, écrit une seule ligne par produit dans `Scraping_PA`
- `paro_scraperPages()` — scrape chaque page produit, extrait INCI/nom botanique/texte brut, auto-relance toutes les 5 min via trigger
- `paro_extraireFragrance()` — cas spécial fragrances PA : INCI = `Fragrance` + allergènes déclarés entre parenthèses si présents
- `paro_supprimerTrigger()` — nettoie les triggers après complétion
- Variables prefixées `PARO_` pour éviter conflits avec `code.gs`
- Sheet cible : `Scraping_PA` (nouvelle, propre) — `Scraping_PA_v4` conservée pour référence

**Règle catégorie fragrances PA :**
- `INCI : fragrance` + allergènes → `Fragrance (Linalool, Géraniol, ...)`
- `Parfum (Fragrance)` + allergènes → `Fragrance (Linalool, Géraniol, ...)`
- Pas d'allergènes → `Fragrance`

**Qualités possibles dans `Scraping_PA` :**
- `Propre` — INCI extrait directement
- `Base` — INCI vient de la liste d'ingrédients (bases cosmétiques)
- `Bot seul` — nom botanique seulement, pas d'INCI
- `À valider` — rien extrait
- `Sans INCI` — accessoires ou colorants sans INCI attendu
- `Redirection` — URL redirige
- `Erreur` / `Erreur HTTP XXX` — problème réseau

### Structure `Ingredients_INCI` — refonte ✅

**Ancienne structure :** A=Catégorie, B=Nom, C=INCI, D=Source, E=Date, F=Note olfactive, G=Statut

**Nouvelle structure :** A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut

**Fichier `code.gs` :**
- `getIngredientsInciSheet()` — entête mise à jour avec nouvelle structure 8 colonnes
- `validerIngredientInci()` — écrit : C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut
- `getSourcesInci()` — lecture corrigée : `inciData[i][3]` = Nom botanique, `inciData[i][6]` = Note olfactive, `inciData[i][0]` = Catégorie
- `getSourcesInci()` — quand ingrédient validé, `categorMaitre` prend la catégorie UC de `Ingredients_INCI`

⚠️ **`saveIngredientInci()` non mise à jour** — utilise encore l'ancienne structure — à corriger

### Page INCI — déduplication `getSourcesInci()` ✅

**Fichier `code.gs` :**
- `getSourcesInci()` — réécriture complète : fonction `lireSheet()` générique pour lire les 4 sources (PA, MH, Arbressence, DE), déduplication par nom avec score INCI(3)+bot(2)+brut(1), priorité source PA>MH>AR>DE à score égal, texte brut toujours préservé
- Propriété `categorMaitre` (sans `ie`) utilisée partout — corrige la faute qui empêchait la pré-sélection du select UC

### Fonctions de test ajoutées dans `code.gs` — à nettoyer (#58)
- `nettoyerScrapingPA()` — utilisée pour nettoyer `Scraping_PA_v4`, plus nécessaire
- `testerApiSansCategorie()` — test API PA sans categoryId, plus nécessaire

---

## ✅ CHANGEMENTS — SESSION 26 MARS 2026

### Page INCI — améliorations visuelles et logique ✅

**Fichier `style.css` :**
- `.tableau-admin` — `width: 100%; table-layout: fixed; border-collapse: collapse`
- `.tableau-admin th, td` — padding, border-bottom, overflow ellipsis
- `.tableau-admin td:last-child` — `white-space: normal; width: 15%`
- `.texte-brut` — `white-space: normal; word-break: break-word`

**Fichier `admin.js` :**
- Thead INCI — largeurs fixes : Nom 25%, INCI 35%, Catégorie UC 25%, actions 15%
- `inciRendreLigne()` — panneau détail revu : `form-grille` retiré, tous les champs en pleine largeur l'un en dessous de l'autre (catégorie fournisseur, nom botanique, note olfactive, texte brut, lien)

**Fichier `code.gs` :**
- `getSourcesInci()` — déduplication par nom : garde la ligne avec catégorie confirmée dans `Config_INCI` (statut `oui`), sinon la première occurrence
- Retour final utilise `lignesDedupliquees` au lieu de `lignes`

---

## ✅ CHANGEMENTS — SESSION 24 MARS 2026

### Page INCI — liste ingrédients retravaillée ✅

**Décisions :**
- Ligne compacte + panneau détail qui s'ouvre en dessous
- Validé = existe dans `Ingredients_INCI` seulement — pas le scraping
- INCI affiché = celui de `Ingredients_INCI` si validé, sinon celui du scraping
- Filtres en 3 lignes séparées : Statut / Source / Recherche
- Labels "À valider" / "Validé" retirés — icônes seulement (🔴 / ✅)

**Fichier `style.css` :**
- `.accordeon-detail` — ligne `<tr>` de détail (fond `--beige-15`)
- `.ligne-validee` — fond `--primary-06` sur ligne validée
- `.texte-brut` — zone texte brut sélectionnable, scrollable
- `.filtres-ligne` — ligne de filtres (display flex, width 100%)

**Fichier `index_-_Admin.html` :**
- Titre : `Ingrédients <em>INCI</em>`
- Sous-titre : `Validation des sources`
- Filtres réorganisés en 3 lignes avec `.filtres-ligne` — style inline retiré
- Champ recherche par nom (`id="inci-recherche"`) ajouté en 3e ligne

**Fichier `admin.js` :**
- `inciRendreLigne()` — ligne principale : Nom (lecture), INCI (input), Catégorie UC (select), boutons ▼ + Valider. Panneau détail : catégorie fournisseur (lecture), nom botanique (input), note olfactive (input), texte brut (sélectionnable), lien fournisseur
- `inciToggleDetail(id)` — ouvre/ferme le panneau détail
- `inciValider()` — sauvegarde : INCI + catégorie UC + nom botanique + note olfactive
- `inciGetFiltres()` — lit champ recherche en plus de statut/source
- `inciConstruireAccordeons()` — filtre par recherche + utilise `l.valide`
- `inciAppliquerFiltres()` — corrigé pour ne pas planter depuis `oninput`
- Thead mis à jour : Nom, INCI, Catégorie UC, (actions)
- Compteur "X validés" dans accordéon — basé sur `l.valide`

**Fichier `code.gs` :**
- `getSourcesInci()` — croise scraping avec `Ingredients_INCI` : `l.valide = true/false`
- `substring(0, 300)` retiré du texte brut — affiche tout

---

## ✅ CHANGEMENTS — SESSION 23 MARS 2026

### Fade in — site public ✅

**Fichier `main.js` :**
- Variable globale `scrollObserver` déclarée au niveau module
- `initScrollAnimations` — utilise `scrollObserver`
- `afficherEduSection` — retire `visible` et re-observe les `.fade-in`
- `afficherSection` — re-observe tous les `.fade-in` de la section cible

**Fichier `index.html` :**
- Sections éducatives `edu-2` à `edu-7` — ajout de `fade-in` sur les blocs
- Catalogue — `collection-entete` reçoit `fade-in` dans le HTML généré dynamiquement

### Page INCI — architecture décidée ✅

**Flux complet :**
1. Scraping PA/MH → page INCI → validation humaine → `Ingredients_INCI`
2. Ingrédient manquant → modal → URL fournisseur → scraping ciblé → validation → `Ingredients_INCI`
3. Partout ailleurs dans l'admin → lit `Ingredients_INCI` uniquement

**Sheets impliquées :**
- `Scraping_PA` — source PA propre (nouvelle, remplace `Scraping_PA_v4`)
- `Scraping_MH`, `Scraping_Arbressence`, `Scraping_DE` — autres sources (lecture seule)
- `Categories_UC` — catégories maîtres Univers Caresse
- `Config_INCI` — table de correspondance catégories fournisseurs → catégories UC
- `Ingredients_INCI` — bible finale — source unique pour tout l'admin

---

## ⚠️ CHANGEMENTS EN ATTENTE DE CONFIRMATION / À FAIRE

### `getSourcesInci()` — brancher sur `Scraping_PA` au lieu de `Scraping_PA_v4`
- **Non fait** — à faire une fois `lancerPurearome()` confirmé propre et testé

### `purearome.gs` — fragrances
- `paro_extraireFragrance()` ajoutée ✅
- Logique fragrances dans `paro_scraperPages()` ajoutée ✅
- **Non testé** — à valider au prochain run complet de `lancerPurearome()`

### `saveIngredientInci()` — mise à jour structure
- Utilise encore l'ancienne structure — **à corriger** avant que Chantal utilise l'ajout manuel

### Style inline dans `index_-_Admin.html`
- `fiche-recette` a un `style="padding: 0 28px 28px;"` inline — violation de règle — **à corriger**

### Fonctions de test dans `code.gs` — à nettoyer (#58)
- `nettoyerScrapingPA()` — plus nécessaire
- `testerApiSansCategorie()` — plus nécessaire

---

## Import des recettes — prérequis

**Fichier de référence :** `Ingredients_Comparaison.md` — produit le 19 mars 2026
**Fichier de référence 2 :** `Ingredients_Master.md` — 166 ingrédients uniques — 23 mars 2026

**État :**
- ~60 ✅ trouvés dans la base — prêts
- ~25 ⚠️ correspondance à valider avec Chantal
- ~25 ❌ non trouvés — à ajouter dans `Ingredients_INCI`

**❌ prioritaires avant import recettes :**
- Lait de chèvre en poudre, Eau / eau distillée / eau glacée / eau déminéralisée, Miel
- Argile jaune, Flocons d'avoine, Micas (vert, rose-rouge, perlé blanc)
- Allantoine, Soie de tussah, Indigo naturel, Marc de café, Cacao en poudre
- Saindoux, Café infusé, Musk blanc

**⚠️ à valider avec Chantal avant import :**
- Huile de tournesol oléique vs standard
- Beurre de cacao brut ou raffiné
- Cire d'abeille blanche ou jaune
- Alcool à 70% vs isopropylique 99%
- SCI format (granules, mini nouilles ou poudre)
- HE mandarine vs Tangerine
- HE vétiver — HE ou fragrance
- Et autres ⚠️ du document

**Corrections à appliquer dans TOUS les fichiers recettes avant import :**
1. Cèdre d'Atlas → Cèdre Atlas
2. Huile d'olive → Huile d'olive vierge
3. Huile de tournesol → Huile de tournesol oléique
4. Cèdre feuille → Cèdre feuilles
5. Ylang ylang → Ylang-ylang
6. Musk → Musc
7. Hydroxyde de sodium / Soude caustique → NaOH
8. Eau distillée / Eau → Eau déminéralisée
9. Karité (seul) → Beurre de karité

**Ordre :**
1. Finir page INCI → valider ingrédients → `Ingredients_INCI` propre
2. Régler les ❌ et ⚠️ du fichier comparaison
3. Import des recettes

---

## 🎯 PRIORITÉS (liste numérotée Jean-Claude)
1. Page INCI — en cours 🔶
   - Accordéon Catégories UC (ajouter/modifier/supprimer) ✅
   - Table de correspondance fournisseurs → UC
   - Liste ingrédients avec catégorie UC par ligne ✅
   - Filtres statut/source/recherche par nom ✅
   - Module ajout ingrédient manquant via URL fournisseur
2. Voir recettes incomplètes (#26)
3. Mode saisonnier — toggle admin (#28) ✅
4. Ordre collections par rang (#30)
5. Section "Emballage" — reporté au module Achats/Inventaire (#23)
6. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
7. Fade in site public ✅
8. Prix/g modal — refonte (#3)
9. Filtres catalogue par type de peau (#4)
10. Liens page 7 → catalogue filtré par ingrédient (#5)
11. Guide rapide — peaufiner le visuel (#6)
12. Guide rapide — colonne "Savons recommandés" (#7)
13. Accordéons huiles/additifs/HE — mobile seulement (#8)
14. Mosaïque hero — alimenter dynamiquement (#9)
15. Textes Sheet → Markdown simplifié (#10)
16. Liste INCI sur fiche recette (#11) ✅
17. Informer visiteurs comment acheter (#12)
18. Actualités automatiques depuis Sheet (#13)
19. FAQ gérable depuis admin (#14)
20. Pages FAQ, conditions de vente, retours/livraison (#15)
21. Courriel confirmation automatique commande (#16)
22. Taille texte mobile — section par section (#17)
23. Menu burger — valider iPhone (#18)
24. Modal tablette — revalider (#19)
25. Affichage délais — à définir (#20)
26. Import recettes JSON (#21)
27. Ajouter section "Emballage" — reporté (#23)
28. Recherche INCI via API EU CosIng (#24)
29. Système commande léger sans panier (#25)
30. Photo par ligne de produit (#27)
31. Sauvegarde automatique Sheet + GitHub (#29)
32. Calculateur SAF intégré fiche recette (#31)
33. Générateur INCI recette ordre décroissant (#32) ✅
34. Coût de revient (#33)
35. Scan factures automatique (QuaggaJS) (#34)
36. Comptabilité — État des résultats, Bilan (#35)
37. Masquer contenu à l'ouverture fiche/formulaire (#36)
38. Inverser ordre Modifier/Supprimer (#37)
39. Photos en double partout (#38-bis)
40. Tuiles collections — revoir affichage lignes (#39)
41. Bouton Modifier dans modal facture (#40)
42. Page factures — filtre "Par produit", icônes, retirer TPS/TVQ (#41)
43. Modal facture — afficher facture complète (#42)
44. Filtres inventaire — revoir le visuel (#43)
45. Inventaire — ligne séparation + resserrer + retirer colonne "Total (g)" (#44)
46. Modification collection/ligne — masquer liste en mode édition (#45)
47. Remplacer `alert()`/`confirm()` par modals/toasts (#46) — **ajout ingrédient INCI utilise `prompt()` natif à remplacer**
48. Filtre recettes "Par nom" — placeholder (#47)
49. Bon à savoir — refaire section Notes importantes (#48)
50. Navbar admin — item Vente désactivé (#49)
51. Prix/g réel — optimiser finalisation facture (#50)
52. Taille texte minimum mobile (16px → 20px) (#51)
53. Nom de domaine `universcaresse.ca` (#52)
54. Catalogue PDF 11×17 (#53)
55. Amortissement équipements (#54)
56. Module Vente complet (#55)
57. Refonte admin + design system (#56)
58. Faire un ménage dans `code.gs` — retirer les fonctions de test et doublons

### Chantiers Brouillon — UX Admin à faire
59. Mode focus — cacher tout sauf l'élément sélectionné
60. Scroll en haut automatique à chaque changement d'écran
61. Uniformité rendu admin vs public — investiguer
62. Uniformiser mode consultation — appliquer présentation "Recette" aux fiches Collection et Ligne
63. Lignes séparatrices + hiérarchie typographique corrigée
64. Boutons de fonction — regrouper en bas
65. Menu Système — réordonner par fréquence d'utilisation
66. Fade in admin — dupliquer `scrollObserver` dans `admin.js`, ajouter `fade-in` sur blocs dans `index_-_Admin.html`, appeler `scrollObserver.observe()` après injection DOM

### Chantiers Brouillon — UX Public à faire
67. Retirer flèche sur "Découvrir nos collections"

---

## 🏗️ ARCHITECTURE — COMMENT LE SYSTÈME FONCTIONNE

### Vue d'ensemble
Le site Univers Caresse est composé de deux parties : le **site public** (`index.html` + `main.js`) et l'**interface d'administration** (`index_-_Admin.html` + `admin.js`). Les deux communiquent avec Google Sheets via un script Google Apps Script (`code.gs`) déployé comme application web.

### Les fichiers et leur rôle en langage humain

**`index.html`** — la boutique publique. Ce que les clients voient : collections, catalogue, sections éducatives, formulaire de contact.

**`index_-_Admin.html`** — le panneau de contrôle de Chantal. Lu et assimilé complet session 27 mars 2026. Sections : Accueil, Collections, Recettes, Nouvelle facture, Factures, Inventaire, Contenu du site, INCI, Densités. Navigation : nav top + sidebar. Style inline à corriger : `fiche-recette` a `style="padding: 0 28px 28px;"`.

**`main.js`** — le moteur du site public. Charge le contenu depuis les Sheets, gère la navigation, le catalogue, les modals, les sections éducatives, le mode saisonnier.

**`admin.js`** — le moteur de l'administration. Gère toutes les actions de Chantal.

**`style.css`** — l'apparence des deux interfaces. Un seul fichier CSS (admin.css fusionné).

**`code.gs`** — le pont entre le site et Google Sheets. `doGet` = lecture, `doPost` = écriture. ⚠️ Contient des fonctions de test à nettoyer (#58).

**`purearome.gs`** — scraping Purearome. Lance `lancerPurearome()` pour repeupler `Scraping_PA`. Un produit = une ligne = une vraie catégorie. Maintenu par le Travailleur.

### Comment une action admin voyage jusqu'à Google Sheets
1. Chantal clique sur un bouton dans l'admin
2. `admin.js` appelle `appelAPI()` (lecture) ou `appelAPIPost()` (écriture)
3. La demande part vers l'URL Apps Script
4. `code.gs` reçoit dans `doGet` ou `doPost`, exécute la fonction
5. Lit ou écrit dans la bonne Sheet
6. Réponse en JSON vers `admin.js`

**Règle critique :** `appelAPIPost` → `doPost`. `appelAPI` → `doGet`. Ne jamais mettre l'un dans l'autre.

### Les Sheets Google et ce qu'elles contiennent

| Sheet | Contenu |
|---|---|
| `Collections` | Collections et lignes de produits (col A à J) |
| `Recettes` | Les recettes (col A à V) |
| `Recettes_Formats` | Formats de vente d'une recette |
| `Recettes_base` | Ingrédients de base d'une ligne de produits |
| `Ingredients_INCI` | Bible finale — A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut |
| `Factures` | Les factures d'achat |
| `Achats` | Le détail de chaque item dans chaque facture |
| `Inventaire_ingredients` | Le stock actuel |
| `Config` | A=Type, B=Densité, C=Unité source, D=marge_perte_pct |
| `Contenu` | Textes éditables du site public (clé/valeur) |
| `Categories_UC` | A=Catégorie, B=Date ajout |
| `Config_INCI` | Table de correspondance catégories fournisseurs → catégories UC |
| `Scraping_PA` | Scraping Purearome propre — un produit, une ligne |
| `Scraping_PA_v4` | Ancienne version — conservée pour référence |
| `Scraping_MH` | Scraping Les Mauvaises Herbes |
| `Scraping_Arbressence` | Scraping Arbressence |
| `Scraping_DE` | Scraping Divine Essence |

### Le chemin d'un ingrédient — de l'achat à l'étiquette INCI
1. Chantal entre une facture → ingrédient ajouté à l'inventaire
2. L'ingrédient doit exister dans `Ingredients_INCI` pour avoir son INCI
3. Scraping peuple les sheets sources → page INCI → validation Chantal → `Ingredients_INCI`
4. Quand Chantal crée une recette, le champ INCI s'affiche automatiquement
5. Le générateur INCI produit la liste réglementaire triée par concentration décroissante

### Les listes déroulantes
Toutes les listes déroulantes viennent de `Ingredients_INCI` via `code.gs`. Source unique = pas de doublon possible.

### Les ingrédients de base d'une ligne
Sauvegardés dans `Recettes_base`. Copiés automatiquement dans toute nouvelle recette de cette ligne.

### Le mode saisonnier
Toggle dans admin bascule `mode_saisonnier` dans Sheet Contenu. Site public lit cette clé et affiche la photo saisonnière si elle existe.

---

## ✅ DÉCISIONS PRISES (cumulatif)
- "Recettes" partout — "Sur-titre" au lieu de "eyebrow"
- Livraison par trouve/remplace — commits par Jean-Claude
- Brief sans rien effacer
- `section-texte` adopté partout — `page-hero` abandonné mobile
- Modal iPhone sans couleur — iPad portrait 2 colonnes — iPad paysage photo gauche
- Quand le code est écrit = c'est livré
- Fiche collection — rang dans carré couleur
- Formulaire ligne — Ligne, Format, Description, Ingrédients de base seulement
- Couleur HEX et Photo → collection, pas ligne de produits
- Collections secondaires — cases à cocher
- 2e photo recette — col T, `image_url_noel`
- Overlay — classe unifiée `recette-couleur-overlay`
- Prix/g — `prixUnitaire ÷ (quantité_en_g × (1 - margePerte/100))`
- Prix/g réel — facteur = `total / sousTotal` à la finalisation
- inputmode decimal tous les champs prix
- Google Sheets format QC — `parseFloat` sans `.toFixed()`
- Sheet Recettes col V = `desc_emballage`
- Sheet Listes — N'EST PLUS UTILISÉE pour les listes déroulantes
- Sheet Config : A=Type, B=Densité, C=Unité source, D=marge_perte_pct
- Sections éducatives SPA — 178 clés pattern `edu_sX_element`
- Nav sections : Accueil → Catalogue → Le savon artisanal → Bon à savoir → Contact
- Navigateur sections éducatives `← X/7 →` — accroche pas italique
- Boutons Précédent/Suivant du bas retirés — retour section 1 via navigation principale
- Catalogue — scroll corrigé avec hauteur entête
- Cartes collections accueil — `aspect-ratio: 16/9` mobile
- Point couleur carte — haut à droite — bouton ✕ modal — cercle couleur avec ✕ blanc
- Classes CSS inutilisées retirées
- Mosaïque hero — `linear-gradient` semi-transparent
- Menu burger — fermeture au clic extérieur
- Fiche ligne — consultation avec boutons Modifier/Supprimer en bas
- Mode maintenance via `maintenance_active` dans Sheet Contenu
- Import recettes — en attente finalisation avec Chantal
- Trouve/remplace — toujours indiquer mode Notepad++ (Normal ou Étendu)
- Inventaire — tableau global, catégories en rangées de titre
- Guide rapide — tableau 4 colonnes (Type de peau, Surgraissage, Huiles, Argiles/Additifs)
- Accordéons sections éducatives — mobile seulement
- Tout contenu éditable par Chantal passe par l'admin — rien codé en dur
- Nouvelles clés Contenu ajoutées via Apps Script — pas manuellement
- Collection Lumina retirée — fusionnée dans Casa
- Boutons X admin — classe `btn-fermer-panneau`, position absolue coin supérieur droit, sans bordure
- Boutons action admin — en bas des panneaux avec `<hr class="separateur">`
- Formats recettes — Sheet `Recettes_Formats` séparée — un-à-plusieurs
- Emballage — reporté au module Achats/Inventaire
- Listes déroulantes recettes/factures — source finale : `Ingredients_INCI`
- `Purearome_Test` = ancien staging — remplacé par `Scraping_PA`
- `Ingredients_INCI` = source de vérité propre et permanente (toutes sources)
- Structure `Ingredients_INCI` : A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut
- Priorité INCI : Purearome > Les Mauvaises Herbes > Divine Essence > EU CosIng direct
- Pas de saisie manuelle dans `Ingredients_INCI` — sauf via formulaire admin avec vérification doublon
- Fournisseurs connus : Purearome, Les Mauvaises Herbes, Divine Essence, Arbressence + autres à identifier avec Chantal
- Générateur INCI — fragrances regroupées sous `Fragrance (note1, note2...)` via col G
- Règle canadienne INCI : ordre décroissant concentration, ingrédients ≤1% peuvent être dans n'importe quel ordre après les autres
- Ajout ingrédient INCI utilise `prompt()` natif — à remplacer lors du chantier #46
- `.ingredient-rangee` — classes dédiées `.ing-type`, `.ing-nom`, `.ing-inci`, `.ing-qte`
- INCI dans fiche consultation ligne — lu à la volée depuis les données chargées
- Toujours indiquer le fichier concerné avant chaque trouve/remplace
- Mode saisonnier — clé `mode_saisonnier` dans Sheet Contenu
- Photos saisonnières — `photo_url_noel` col J dans Collections, `image_url_noel` col T dans Recettes
- Si pas de 2e photo → utiliser la photo régulière (jamais de trou)
- Scraping PA — déduplication en mémoire par slug, catégories fourre-tout perdent contre catégories spécifiques
- INCI fragrances PA : `Fragrance` + allergènes déclarés entre parenthèses
- Catégorie UC dans `Ingredients_INCI` — appliquée à `categorMaitre` dans `getSourcesInci()` après validation
- Le Travailleur prend la job du Chercheur — `purearome.gs` maintenu par le Travailleur
- `categorMaitre` (sans `ie`) — propriété utilisée partout dans `getSourcesInci()` et `admin.js`

---

## ⚠️ PIÈGE DOCUMENTÉ — doGet vs doPost dans code.gs

**Problème rencontré :** une fonction ajoutée dans `doGet` seulement mais appelée via `appelAPIPost` → inaccessible depuis l'admin.

**Règle à toujours respecter :**
- `appelAPIPost` → appelle `doPost` dans `code.gs`
- Toute fonction appelée depuis `admin.js` via `appelAPIPost` **doit être branchée dans `doPost`**
- Si une fonction doit aussi être accessible en lecture directe, la brancher dans `doGet` EN PLUS

**Réflexe avant tout ajout dans code.gs :**
1. Vérifier comment la fonction est appelée dans `admin.js`
2. `appelAPIPost` → brancher dans `doPost`
3. `appelAPI` → brancher dans `doGet`
4. Ne jamais retirer les branchements existants — ajouter seulement

---

## RÈGLES CRITIQUES (rappel)
- **Pousser back — obligatoire :** si le Travailleur voit quelque chose de mieux, une incohérence, un raccourci qui va coûter cher — il le dit. Même si Jean-Claude vient de proposer l'idée.
- Un seul trouve/remplace à la fois — attendre la confirmation avant le suivant
- Toujours indiquer le fichier avant de proposer un trouve/remplace
- Toujours lire le fichier avant de proposer
- Jamais de style inline dans JS/HTML
- Jamais suggérer pause/repos
- Fin de tâche → dire COMMIT
- Brief produit en entier en `.md` en fin de session sans rien effacer — **JAMAIS en conversation, toujours en fichier `.md`**
- **Avant toute proposition de solution technique : toujours cerner le problème au complet en jasant d'abord — ne jamais proposer la première solution "facile" sans avoir exploré tout autour**
- **Toujours demander l'autorisation avant de coder — attendre le OUI explicite**
- Livraison du code : changement ciblé → trouve/remplace uniquement — jamais le fichier complet sans permission explicite

---

## 🏗️ NOTES IMPORTANTES

### ⏱️ Note importante sur la gestion du temps
Un "petit 15 minutes" sur ce projet = compter la journée. Planifier en conséquence.

### 🐷 Note importante sur le caractère de Jean-Claude
Jean-Claude a la tête dure. Son entourage dirait tête de cochon. Le Travailleur considère ça comme une feature, pas un bug — c'est exactement pour ça que le projet avance.

### Briefs lus et assimilés
- Brief Organisateur ✅ — Brief Chercheur ✅ — Brief Scripteur ✅ — Brief Brouillon ✅
- `index_-_Admin.html` lu et assimilé complet ✅ — session 27 mars 2026

---

*Univers Caresse — Confidentiel — 27 mars 2026*

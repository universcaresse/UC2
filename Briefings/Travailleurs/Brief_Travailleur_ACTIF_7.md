# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
*Mis à jour : 28 mars 2026*

> 📦 **Historique complet des sessions dans** `Brief_Univers_Caresse_ARCHIVES.md`

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
- **Lien cliquable vers la page web du produit fournisseur**

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

**Règle de nommage — non négociable :** tout nouveau composant CSS est nommé par ce qu'il **est**, pas par où il est **utilisé**. `.accordeon-detail` ✅ — `.inci-detail` ❌.

| Classe | Usage |
|---|---|
| `.cache` | Cacher un élément (`display: none !important`) |
| `.accordeon-detail` | Ligne `<tr>` de détail qui s'ouvre sous une ligne de tableau |
| `.ligne-validee` | Fond vert pâle (`--primary-06`) sur une ligne validée |
| `.texte-brut` | Zone texte lecture seule, sélectionnable, scrollable (max-height 80px) |
| `.ligne-cliquable` | Ligne `<tr>` cliquable — `cursor: pointer` + hover beige |
| `.carte-admin` | Carte admin générique — border, border-radius, padding, margin-bottom |
| `.carte-admin-entete` | Entête de carte admin — flex, gap, margin-bottom |

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- **Toujours indiquer le fichier concerné avant chaque trouve/remplace**
- Changement ciblé → trouve/remplace uniquement, jamais le fichier complet
- Un seul changement à la fois — attendre la confirmation avant le suivant

---

## ⚠️ CHANGEMENTS EN ATTENTE / À FAIRE

### `purearome.gs` — fragrances
- `paro_extraireFragrance()` ajoutée ✅
- Logique fragrances dans `paro_scraperPages()` ajoutée ✅
- **Non testé** — à valider au prochain run complet de `lancerPurearome()`

### Fonctions de test dans `code.gs` — à nettoyer (#58)
- `nettoyerScrapingPA()` — plus nécessaire
- `testerApiSansCategorie()` — plus nécessaire

---

## Import des recettes — prérequis

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
   - Accordéon Catégories UC ✅
   - Table de correspondance fournisseurs → UC ✅
   - Liste ingrédients avec catégorie UC ✅
   - Filtres statut/source/recherche ✅
   - Refonte visuelle ✅
   - Module ajout ingrédient manquant via URL fournisseur
   - Validation des ~528 ingrédients dans `Ingredients_INCI` — en cours (Jean-Claude)
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
41. Remplacer `alert()`/`confirm()`/`prompt()` par modals/toasts (#46)
42. Filtre recettes "Par nom" — placeholder (#47)
43. Bon à savoir — refaire section Notes importantes (#48)
44. Navbar admin — item Vente désactivé (#49)
45. Prix/g réel — optimiser finalisation facture (#50)
46. Taille texte minimum mobile (16px → 20px) (#51)
47. Nom de domaine `universcaresse.ca` (#52)
48. Catalogue PDF 11×17 (#53)
49. Amortissement équipements (#54)
50. Module Vente complet (#55)
51. Refonte admin + design system (#56)
52. Faire un ménage dans `code.gs` (#58)

### Chantiers Brouillon — UX Admin
53. Mode focus — cacher tout sauf l'élément sélectionné
54. Scroll en haut automatique à chaque changement d'écran
55. Uniformité rendu admin vs public — investiguer
56. Uniformiser mode consultation — appliquer présentation "Recette" aux fiches Collection et Ligne
57. Lignes séparatrices + hiérarchie typographique corrigée
58. Boutons de fonction — regrouper en bas
59. Menu Système — réordonner par fréquence d'utilisation
60. Fade in admin — dupliquer `scrollObserver` dans `admin.js`

### Chantiers Brouillon — UX Public
61. Retirer flèche sur "Découvrir nos collections"

---

## 🏗️ ARCHITECTURE — COMMENT LE SYSTÈME FONCTIONNE

### Les fichiers et leur rôle
- **`index.html`** — boutique publique
- **`index_-_Admin.html`** — panneau de contrôle Chantal — lu et assimilé complet ✅
- **`main.js`** — moteur site public
- **`admin.js`** — moteur administration
- **`style.css`** — apparence des deux interfaces (un seul fichier)
- **`code.gs`** — pont entre le site et Google Sheets. `doGet` = lecture, `doPost` = écriture
- **`purearome.gs`** — scraping Purearome — maintenu par le Travailleur

### Sheets Google

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

---

## ⚠️ PIÈGE DOCUMENTÉ — doGet vs doPost dans code.gs
- `appelAPIPost` → brancher dans `doPost`
- `appelAPI` → brancher dans `doGet`
- Ne jamais retirer les branchements existants — ajouter seulement

---

## ✅ DÉCISIONS PRISES (cumulatif)
- "Recettes" partout — "Sur-titre" au lieu de "eyebrow"
- Livraison par trouve/remplace — commits par Jean-Claude
- Brief sans rien effacer
- `section-texte` adopté partout — `page-hero` abandonné mobile
- Modal iPhone sans couleur — iPad portrait 2 colonnes — iPad paysage photo gauche
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
- Catalogue — scroll corrigé avec hauteur entête
- Cartes collections accueil — `aspect-ratio: 16/9` mobile
- Point couleur carte — haut à droite — bouton ✕ modal — cercle couleur avec ✕ blanc
- Menu burger — fermeture au clic extérieur
- Fiche ligne — consultation avec boutons Modifier/Supprimer en bas
- Mode maintenance via `maintenance_active` dans Sheet Contenu
- Trouve/remplace — toujours indiquer mode Notepad++ (Normal ou Étendu)
- Inventaire — tableau global, catégories en rangées de titre
- Accordéons sections éducatives — mobile seulement
- Tout contenu éditable par Chantal passe par l'admin — rien codé en dur
- Nouvelles clés Contenu ajoutées via Apps Script — pas manuellement
- Boutons X admin — classe `btn-fermer-panneau`, position absolue coin supérieur droit, sans bordure
- Boutons action admin — en bas des panneaux avec `<hr class="separateur">`
- Formats recettes — Sheet `Recettes_Formats` séparée — un-à-plusieurs
- Emballage — reporté au module Achats/Inventaire
- Listes déroulantes recettes/factures — source finale : `Ingredients_INCI`
- `Ingredients_INCI` = source de vérité propre et permanente (toutes sources)
- Structure `Ingredients_INCI` : A=Catégorie, B=Nom, C=INCI, D=Nom botanique, E=Source, F=Date, G=Note olfactive, H=Statut
- Priorité INCI : Purearome > Les Mauvaises Herbes > Divine Essence > EU CosIng direct
- Pas de saisie manuelle dans `Ingredients_INCI` — sauf via formulaire admin avec vérification doublon
- Générateur INCI — fragrances regroupées sous `Fragrance (note1, note2...)` via col G
- Règle canadienne INCI : ordre décroissant concentration, ingrédients ≤1% peuvent être dans n'importe quel ordre après les autres
- `categorMaitre` (sans `ie`) — propriété utilisée partout dans `getSourcesInci()` et `admin.js`
- Sheets de scraping mises à jour manuellement par Jean-Claude
- Page INCI — ligne cliquable au lieu de flèche — un seul accordéon ouvert à la fois
- Catégories UC — boutons cachés si catégorie utilisée, triées alphabétiquement
- `chargerInci()` — charge `getDropdownLists` si `listesDropdown.fullData` est vide

---

## RÈGLES CRITIQUES (rappel)
- **Pousser back — obligatoire** — si le Travailleur voit quelque chose de mieux, il le dit
- Un seul trouve/remplace à la fois — attendre la confirmation avant le suivant
- Toujours indiquer le fichier avant de proposer un trouve/remplace
- Toujours lire le fichier avant de proposer
- Jamais de style inline dans JS/HTML
- Jamais suggérer pause/repos
- Fin de tâche → dire COMMIT
- Brief produit en entier en `.md` — toujours en fichier, jamais en conversation
- Toujours cerner le problème au complet avant de proposer une solution
- Toujours demander l'autorisation avant de coder — attendre le OUI explicite
- Livraison : changement ciblé → trouve/remplace — jamais le fichier complet sans permission

---

## 🏗️ NOTES IMPORTANTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" sur ce projet = compter la journée. Planifier en conséquence.

### 🐷 Caractère de Jean-Claude
Jean-Claude a la tête dure. Le Travailleur considère ça comme une feature, pas un bug.

### Briefs lus et assimilés
- Brief Organisateur ✅ — Brief Chercheur ✅ — Brief Scripteur ✅ — Brief Brouillon ✅
- `index_-_Admin.html` lu et assimilé complet ✅ — session 27 mars 2026

---

*Univers Caresse — Confidentiel — 28 mars 2026*

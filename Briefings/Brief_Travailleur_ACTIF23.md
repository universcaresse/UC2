# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
*Mis à jour : 23 mars 2026 — 07h00*

---

## PROJET — FICHIERS ET URLS
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`
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

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- **Toujours indiquer le fichier concerné avant chaque trouve/remplace**
- Changement ciblé → trouve/remplace uniquement, jamais le fichier complet
- Un seul changement à la fois — attendre la confirmation avant le suivant

---

## ✅ CHANGEMENTS — SESSION 23 MARS 2026

### Fade in — site public ✅

**Problème :** Les sections du site public (éducatif, catalogue, bon à savoir, contact) affichaient leur contenu en "bang" — apparition instantanée sans transition — contrairement à la page d'accueil qui utilisait un IntersectionObserver pour des animations douces au scroll.

**Fichier `main.js` :**
- Variable globale `scrollObserver` déclarée au niveau module (était locale à `initScrollAnimations`)
- `initScrollAnimations` — utilise maintenant `scrollObserver` au lieu de `observer` local
- `afficherEduSection` — retire `visible` et re-observe les `.fade-in` via `scrollObserver` au changement de panneau
- `afficherSection` — re-observe tous les `.fade-in` de la section cible au changement de section

**Fichier `index.html` :**
- Sections éducatives `edu-2` à `edu-7` — ajout de `fade-in` sur les blocs : `.section-texte`, `.bonne-section`, `.bandeau-citation`, `.note-allergenes`
- Catalogue — `collection-entete` reçoit `fade-in` dans le HTML généré dynamiquement + `scrollObserver.observe()` après `body.appendChild(section)`

### Page INCI — architecture décidée ✅

**Flux complet :**
1. Scraping PA/MH → page INCI → validation humaine → `Ingredients_INCI`
2. Ingrédient manquant → modal → URL fournisseur → scraping ciblé automatique → validation → `Ingredients_INCI`
3. Partout ailleurs dans l'admin → lit `Ingredients_INCI` uniquement

**Sheets impliquées :**
- `Scraping_PA_v4` et `Scraping_MH` — sources (lecture seule)
- `Categories_UC` — catégories maîtres Univers Caresse (A=Catégorie, B=Date ajout)
- `Config_INCI` — table de correspondance catégories fournisseurs → catégories UC
- `Ingredients_INCI` — bible finale — source unique pour tout l'admin

**Page INCI — structure :**
- Accordéon 1 : Catégories Univers Caresse (ajouter/modifier/supprimer)
- Accordéon 2 : Table de correspondance fournisseurs → catégories UC (avec statut confirmé/à confirmer)
- Filtres : Statut (tout/à valider/validé) + Source (tout/PA/MH/...) + Recherche par nom
- Liste ingrédients groupés par catégorie UC — chaque ligne : Catégorie fournisseur (lecture), Catégorie UC (liste déroulante), Nom, Nom botanique, INCI, Note olfactive, Texte brut (lisible/sélectionnable), Lien fournisseur, Bouton Valider

**Sur chaque ligne ingrédient :**
- Catégorie fournisseur — lecture seule
- Catégorie UC — liste déroulante des catégories UC (pré-remplie via table de correspondance, modifiable)
- Bouton Valider → écrit dans `Ingredients_INCI`

**Module ajout produit temps réel (ingrédient manquant) :**
- Modal : choisir fournisseur (PA, MH, Arbres Essence, Divine, Autre) + coller URL
- Scraping ciblé automatique de l'URL → récupère INCI, Nom botanique, Note olfactive
- Validation → écrit dans `Ingredients_INCI`
- Message spinner : "C'est le temps d'un café avec ton ami. Je trouve l'information et je te dis quand c'est prêt"

**Fournisseurs disponibles pour scraping ciblé :** PA, MH, Arbres Essence, Divine

**Note pour le Chercheur — scraping ciblé :**
Les fonctions de scraping existantes (`pa_extraireInci`, `pa_extraireNomBotanique`, `mh_scraperProduit`) doivent être adaptées en version "une seule URL à la demande" — pas le catalogue complet. Le Chercheur doit livrer une fonction par fournisseur : `scraperUrlPA(url)`, `scraperUrlMH(url)`, `scraperUrlArbresEssence(url)`, `scraperUrlDivine(url)` — chacune retourne : `{ nom, inci, nomBotanique, noteOlfactive, categorie, url }`. Ces fonctions seront branchées dans `doPost` de `code.gs` sous l'action `scraperIngredientUrl`.

### Import des recettes — prérequis

**Fichier de référence :** `Ingredients_Comparaison.md` — produit le 19 mars 2026

**État :**
- ~60 ✅ trouvés dans la base — prêts
- ~25 ⚠️ correspondance à valider avec Chantal (format, variété, précision)
- ~25 ❌ non trouvés — à ajouter dans `Ingredients_INCI` (scraping ciblé ou saisie manuelle)

**❌ prioritaires avant import recettes :**
- Lait de chèvre en poudre
- Eau / eau distillée / eau glacée / eau déminéralisée
- Miel
- Argile jaune
- Flocons d'avoine
- Micas (vert, rose-rouge, perlé blanc)
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

**Fichier de référence 2 :** `Ingredients_Master.md` — 166 ingrédients uniques — 23 mars 2026

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


1. Finir page INCI → valider ingrédients → `Ingredients_INCI` propre
2. Régler les ❌ et ⚠️ du fichier comparaison
3. Import des recettes

---


- L'Organisateur est congédié — Jean-Claude gère les briefs
- Le Travailleur assure la coordination entre les Claude
- Quand un autre Claude livre, le Travailleur valide l'impact sur le site et dit à Jean-Claude quoi lui communiquer
- Briefs produits avec `cp` + `str_replace` uniquement — jamais `create_file`

### Briefs lus et assimilés
- Brief Organisateur ✅ — Brief Chercheur ✅ — Brief Scripteur ✅ — Brief Brouillon ✅

---

## ✅ CHANGEMENTS — SESSION 22 MARS 2026

### Ingrédients de base — mise à jour pour INCI

**Problème :** Le formulaire de modification d'une ligne de produits permettait d'ajouter des ingrédients de base, mais sans le champ INCI ni l'option d'ajouter un nouvel ingrédient — contrairement au formulaire recette qui l'avait déjà.

**Fichier `admin.js` :**
- Affichage des ingrédients de base (fonction qui génère les rangées du formulaire ligne) — ajout du champ INCI en lecture seule + option `+ Ajouter un ingrédient` (identique au formulaire recette)
- Fonction d'ajout d'un nouvel ingrédient INCI — ajout du paramètre `liste` ('recette' ou 'base') pour savoir quel tableau mettre à jour après l'ajout
- Fiche consultation d'une ligne — affiche maintenant le INCI de chaque ingrédient de base (lu à la volée depuis `Ingredients_INCI`, pas sauvegardé dans `Recettes_base`)

**Fichier `style.css` :**
- `.ingredient-rangee` — remplacement des règles positionnelles (`:first-child`, `:nth-child`) par des classes dédiées : `.ing-type`, `.ing-nom`, `.ing-inci`, `.ing-qte`
- Appliqué dans les deux fonctions d'affichage : ingrédients recette et ingrédients de base

**À valider :** tests mobile iPad et iPhone

---

### Mode saisonnier (#28) ✅

**Concept :** toggle global dans l'admin qui bascule entre la photo régulière et la photo saisonnière partout sur le site public. Si la 2e photo n'existe pas, la photo régulière est utilisée.

**Sheet `Collections` :**
- Colonne J ajoutée manuellement : `photo_url_noel`

**Sheet `Contenu` :**
- Clé `mode_saisonnier` ajoutée manuellement (valeur `oui` ou `non`)

**Fichier `code.gs` :**
- Lecture des collections — retourne maintenant `photo_url_noel` (col J)
- Ajout d'une collection — sauvegarde `photo_url_noel` (col J)
- Modification d'une collection — sauvegarde `photo_url_noel` (col J), propagée à toutes les lignes de la même collection
- Catalogue public — retourne maintenant `image_url_noel` des recettes (col T, déjà existante)

**Fichier `admin.js` :**
- Chargement du formulaire modification collection — charge `photo_url_noel` et son aperçu
- Sauvegarde collection — inclut `photo_url_noel`
- Réinitialisation formulaire — efface l'aperçu `fc-photo-preview-noel`
- Fonction Cloudinary pour la photo saisonnière collection (`ouvrirCloudinaryCollectionNoel`)
- Toggle ON/OFF — lit le mode actuel, bascule, met à jour le bouton et affiche un message
- Chargement section Contenu — initialise l'état du bouton toggle selon la valeur en Sheet

**Fichier `index_-_Admin.html` :**
- Champ `fc-photo-url-noel` + bouton Cloudinary + aperçu dans le formulaire collection
- Bouton toggle 🌲 Mode saisonnier ON/OFF dans l'entête de la section Contenu du site

**Fichier `main.js` :**
- `window.modeSaisonnier` — variable globale initialisée au chargement du contenu
- Carte produit dans le catalogue — utilise `image_url_noel` si mode ON et photo disponible, sinon `image_url`
- Modal produit — même logique

**Note future :** photos en dur dans le HTML (mosaïque hero, sections éducatives) — prévoir clés `_noel` quand elles migreront vers la Sheet Contenu (chantier déjà prévu)

**Note future :** `photo_url_noel` à ajouter aussi pour les lignes de produits quand le besoin se présentera

---

## ✅ CHANGEMENTS — SESSION 21 MARS 2026

### Module Ingredients_INCI — suite (#24)

**Bogues scraping corrigés :**
- Scraping Purearome — décodage unicode avant extraction regex (le site encode le HTML en `\uXXXX`)
- Regex INCI/CAS — prend le **dernier** match sur la page (le 1er est toujours Rosa rubiginosa du bloc vedette sidebar)
- Transfert vers Ingredients_INCI — exclut les lignes sans INCI

**Migration listes déroulantes vers `Ingredients_INCI` :**
- Source changée de `Purearome_Test` vers `Ingredients_INCI`
- Bug corrigé : variable non définie depuis la sheet listes
- Champ `inci` ajouté dans les données complètes
- Champ `note_olfactive` ajouté (col G de `Ingredients_INCI`)

**Sheet `Ingredients_INCI` :**
- Structure : A=Catégorie, B=Nom, C=INCI, D=CAS, E=Source, F=Date ajout, G=Note olfactive
- Col G ajoutée manuellement par Jean-Claude — sera peuplée par Chercheur

**Affichage INCI dans formulaire recette :**
- Champ INCI en lecture seule apparaît automatiquement à la sélection d'un ingrédient
- Option "+ Ajouter un ingrédient" en bas de chaque liste déroulante d'ingrédients
- Sauvegarde dans `Ingredients_INCI` (Source=Manuel), recharge les listes
- ⚠️ Utilise `prompt()` natif — à remplacer par vrai modal lors du chantier #46

**Sauvegarde nouvel ingrédient INCI — `code.gs` :**
- Sauvegarde dans `Ingredients_INCI` (catégorie pré-remplie, nom saisi)
- Vérifie les doublons avant insertion
- Branché dans `doPost`

**Générateur INCI recette (#32) ✅ :**
- Tri décroissant par quantité, séparation >1% / ≤1% du poids total
- Fragrances regroupées en `Fragrance (note1, note2...)` via col G `Ingredients_INCI`
- Affiché dans fiche recette consultation avec bouton "Copier INCI"
- Bouton désactivé si INCI manquants — liste les ingrédients manquants en avertissement rouge

**⚠️ Solution PA partielle — laissée au Chercheur :**
- Regex dernier match trouvée par Travailleur — mais solution non terminée
- Chercheur prend la relève complète pour `Scraping_PA` — doit regarder ce que Travailleur a fait et améliorer

---

## ✅ CHANGEMENTS — SESSION 20 MARS 2026

### Bogues réglés
- **Bogue #1** ✅ — Panneau admin ne se ferme pas après suppression ligne → fermeture ajoutée dans suppression (admin.js)
- **Bogue #2** ✅ — "Votre guide rapide" s'affichait partout → bloc déplacé à l'intérieur de `#edu-7` (index.html)
- **Bogue #3** ✅ — Références LUMINA retirées de `main.js`
- **Bogue** ✅ — Ouverture formulaire collection ferme maintenant la fiche collection ouverte avant
- **Bogue** ✅ — Navigation vers section éducative repart toujours à la page 1
- **Bogue** ✅ — Modification recette déclarée async (erreur await)
- **Bogue** ✅ — Flash de la grille recettes lors du passage consultation→modification corrigé

### Boutons X admin standardisés
- Nouvelle classe CSS `.btn-fermer-panneau` (sans bordure, position absolue coin supérieur droit)
- `.form-panel` → `position: relative` ajouté
- Fiches traitées : fiche-collection, fiche-ligne, form-collections, fiche-recette, form-recettes, form-densites, modal facture, filtres factures, filtres inventaire
- Boutons action (Modifier/Supprimer/Enregistrer/Annuler) déplacés en bas avec `<hr class="separateur">`
- Filtres factures : compteur avant le ✕, ✕ à l'extrême droite

### Module Formats Recettes (#22) ✅
**Structure :** Sheet `Recettes_Formats` (col A=recette_id, B=poids, C=unite, D=prix_vente, E=desc_emballage)

**code.gs :** fonctions lecture/création/modification/suppression des formats, branchées dans `doGet` et `doPost`

**admin.js :** variable globale formats, ajout/suppression/affichage, chargé à la modification et sauvegardé à l'enregistrement

**index_-_Admin.html :** zone formats avec liste et bouton `+ Ajouter un format`

**Visuel formats :** classes `format-rangee`, `format-champ-court`, `format-champ-long`, `format-champ-action` avec labels

### Migration listes déroulantes
- Listes déroulantes — migré de `Listes` → `Purearome_Test` → `Ingredients_INCI` (final)

---

## ✅ CHANGEMENTS — SESSIONS PRÉCÉDENTES
- Section "Votre guide rapide" intégrée, clés `edu_guide_*` dans Sheet Contenu
- CSS `.edu-tableau`, `.edu-tableau-wrap`, `.edu-accord-*` ajoutés
- Liens éducatifs pages 3 et 7 corrigés
- Mosaïque hero — couleurs → variables CSS
- Admin — ouverture formulaire collection pour une collection existante
- Scroll horizontal iPhone, modal produit, bouton CTA hero, collections secondaires, sections éducatives SPA, filtres inventaire, factures, Cloudinary

---

## 🔴 BOGUES EN ATTENTE
- [ ] Sur-titre hero "COLLECTIONS 2026" — positionnement iPhone — plusieurs tentatives ratées
- [x] Fade in site public ✅ — réglé session 23 mars
- [ ] Prix/g modal — refonte du bloc requise
- [ ] Fiche recette modification — après sauvegarde ou annulation, revenir à la fiche consultation au lieu de fermer complètement
- [ ] Fiche recette consultation — à la fermeture, revenir en haut de la liste des recettes au lieu du milieu

---

## 🔶 EN COURS — MODULE INGREDIENTS_INCI
**État :** Listes déroulantes migrées ✅ — Générateur INCI ✅ — PA laissé au Chercheur

**Reste à faire (Chercheur) :**
1. Reprendre solution PA du Travailleur (regex dernier match) et améliorer
2. MH ✅ déjà fait
3. Poursuivre avec EU CosIng (fallback)
4. Peupler col G `Note olfactive`
5. Livrer `Ingredients_INCI` propre

**Reste à faire (Travailleur — après Chercheur) :**
- Bouton admin — lancer scraping ciblé sur les manquants
- Visuel fiche recette consultation formats — à revoir

---

## 🎯 PRIORITÉS (liste numérotée Jean-Claude)
1. Page INCI — en cours 🔶
   - Accordéon Catégories UC (ajouter/modifier/supprimer) ✅ fonctionnel — ⚠️ visuel à améliorer
   - Table de correspondance fournisseurs → UC
   - Liste ingrédients avec catégorie UC par ligne
   - Filtres statut/source/recherche par nom
   - Module ajout ingrédient manquant via URL fournisseur
2. Voir recettes incomplètes (#26)
3. Mode saisonnier — toggle admin (#28) ✅ fait session 22 mars
4. Ordre collections par rang (#30)
5. Section "Emballage" — reporté au module Achats/Inventaire (#23)
6. Sur-titre hero "COLLECTIONS 2026" — iPhone (#1)
7. Fade in site public ✅ fait session 23 mars
8. Prix/g modal — refonte (#3)
9. Filtres catalogue par type de peau (#4)
10. Liens page 7 → catalogue filtré par ingrédient (#5)
11. Guide rapide — peaufiner le visuel (#6)
12. Guide rapide — colonne "Savons recommandés" (#7)
13. Accordéons huiles/additifs/HE — mobile seulement (#8)
14. Mosaïque hero — alimenter dynamiquement (#9)
15. Textes Sheet → Markdown simplifié (#10)
16. Liste INCI sur fiche recette (#11) ✅ fait session 21 mars
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
28. Recherche INCI via API EU CosIng (#24) — Chercheur
29. Système commande léger sans panier (#25)
30. Photo par ligne de produit (#27)
31. Sauvegarde automatique Sheet + GitHub (#29)
32. Calculateur SAF intégré fiche recette (#31)
33. Générateur INCI recette ordre décroissant (#32) ✅ fait session 21 mars
34. Coût de revient (#33)
35. Scan factures automatique (QuaggaJS) (#34)
36. Comptabilité — État des résultats, Bilan (#35)
37. Masquer contenu à l'ouverture fiche/formulaire (#36)
38. Inverser ordre Modifier/Supprimer (#37)
39. Photos en double partout — prévoir 2e photo pour lignes de produits et photos en dur (#38-bis)
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
60. Scroll en haut automatique à chaque changement d'écran (admin + public)
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

**`index.html`** — la boutique publique
Ce que les clients voient : les collections, le catalogue de produits, les sections éducatives sur le savon, le formulaire de contact. Tout le contenu est chargé depuis Google Sheets au démarrage.

**`index_-_Admin.html`** — le panneau de contrôle de Chantal
Interface protégée par mot de passe. Chantal y gère les collections, les lignes de produits, les recettes, les factures d'achat, l'inventaire et le contenu du site. Rien n'est codé en dur — tout passe par les Sheets.

**`main.js`** — le moteur du site public
Charge le contenu depuis les Sheets et construit les pages dynamiquement. Gère la navigation entre sections, le catalogue, les modals de produits, les sections éducatives. Lit aussi `mode_saisonnier` pour afficher la bonne photo partout.

**`admin.js`** — le moteur de l'administration
Gère toutes les actions de Chantal : créer/modifier/supprimer des collections, lignes, recettes, factures. Communique avec Google Sheets via des appels à `code.gs`.

**`style.css`** — l'apparence des deux interfaces
Un seul fichier CSS pour le site public et l'admin. Contient aussi les styles admin (anciennement `admin.css`, fusionné).

**`code.gs`** — le pont entre le site et Google Sheets
Script déployé sur Google Apps Script. Reçoit les demandes du site, lit et écrit dans les Sheets, renvoie les données. Deux portes d'entrée : `doGet` (lecture) et `doPost` (écriture/modification).
⚠️ Ce fichier contient encore des fonctions de test à nettoyer — prévu au chantier #58.

---

### Comment une action admin voyage jusqu'à Google Sheets

1. Chantal clique sur un bouton dans l'admin (ex : "Enregistrer la recette")
2. `admin.js` appelle soit `appelAPI()` (lecture) soit `appelAPIPost()` (écriture)
3. La demande part vers l'URL Apps Script avec le nom de l'action et les données
4. `code.gs` reçoit la demande dans `doGet` ou `doPost`, identifie l'action, exécute la fonction correspondante
5. La fonction lit ou écrit dans la bonne Sheet Google
6. La réponse revient en JSON vers `admin.js` qui met à jour l'écran

**Règle critique :** toute fonction appelée depuis `admin.js` avec `appelAPIPost` doit être branchée dans `doPost` de `code.gs`. Toute fonction appelée avec `appelAPI` doit être branchée dans `doGet`. Ne jamais mettre une dans l'autre.

---

### Les Sheets Google et ce qu'elles contiennent

| Sheet | Contenu |
|---|---|
| `Collections` | Toutes les collections et leurs lignes de produits (nom, slogan, couleur, photo régulière, photo saisonnière, rang) — col A à J |
| `Recettes` | Les recettes (nom, ingrédients, instructions, prix, statut public/test, photo régulière col R, photo saisonnière col T) |
| `Recettes_Formats` | Les formats de vente d'une recette (poids, unité, prix, emballage) — une recette peut avoir plusieurs formats |
| `Recettes_base` | Les ingrédients de base d'une ligne de produits — copiés automatiquement dans toute nouvelle recette de cette ligne |
| `Ingredients_INCI` | La liste de référence de tous les ingrédients avec leur nom INCI, numéro CAS, source et note olfactive |
| `Factures` | Les factures d'achat de matières premières |
| `Achats` | Le détail de chaque item dans chaque facture |
| `Inventaire_ingredients` | Le stock actuel de chaque ingrédient |
| `Config` | Les densités et marges de perte par type d'ingrédient |
| `Contenu` | Tous les textes éditables du site public (titres, descriptions, sections éducatives, `mode_saisonnier`, `maintenance_active`) |

---

### Le chemin d'un ingrédient — de l'achat à l'étiquette INCI

1. Chantal entre une facture d'achat → l'ingrédient est ajouté à l'inventaire
2. L'ingrédient doit exister dans `Ingredients_INCI` pour avoir son INCI (nom latin normalisé pour les étiquettes)
3. Le Chercheur peuple `Ingredients_INCI` via scraping (Purearome, Les Mauvaises Herbes) ou manuellement
4. Quand Chantal crée une recette et choisit un ingrédient, le champ INCI s'affiche automatiquement en lecture seule
5. Le générateur INCI de la recette lit les INCI de tous les ingrédients et produit la liste réglementaire triée par concentration décroissante

---

### Les listes déroulantes — d'où viennent-elles

Toutes les listes déroulantes d'ingrédients dans l'admin (recettes, factures, ingrédients de base) viennent de `Ingredients_INCI` via `code.gs`. Elles sont chargées au démarrage dans une variable globale et réutilisées partout. Source unique = pas de doublon possible.

---

### Les ingrédients de base d'une ligne — comment ça marche

Quand Chantal crée ou modifie une ligne de produits (ex : SAVON dans la collection SAPONICA), elle peut y attacher des ingrédients de base avec leurs quantités. Ces ingrédients sont sauvegardés dans la Sheet `Recettes_base`. Quand elle crée ensuite une **nouvelle recette** dans cette ligne, ces ingrédients de base sont automatiquement copiés dans la recette comme point de départ. Elle peut ensuite les modifier.

---

### Le mode saisonnier — comment ça marche

Un toggle dans la section "Contenu du site" de l'admin bascule la clé `mode_saisonnier` dans la Sheet Contenu entre `oui` et `non`. Quand le site public charge, il lit cette clé. Si elle vaut `oui`, toutes les photos affichées (cartes produits, modals) utilisent la 2e photo saisonnière si elle existe — sinon la photo régulière. Quand le mode est désactivé, seules les photos régulières sont affichées.

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
- Structure `Ingredients_INCI` : A=Catégorie, B=Nom, C=INCI, D=Source, E=Date ajout, F=Note olfactive, G=Statut
- Priorité INCI : Purearome > Les Mauvaises Herbes > Divine Essence (via EU CosIng) > EU CosIng direct
- Pas de saisie manuelle dans `Ingredients_INCI` — sauf via formulaire admin avec vérification doublon
- Fournisseurs connus : Purearome, Les Mauvaises Herbes, Divine Essence + autres à identifier avec Chantal
- Générateur INCI — fragrances regroupées sous `Fragrance (note1, note2...)` via col G
- Règle canadienne INCI : ordre décroissant concentration, ingrédients ≤1% peuvent être dans n'importe quel ordre après les autres
- Ajout ingrédient INCI utilise `prompt()` natif — à remplacer lors du chantier #46
- Chercheur prend la relève complète pour `Scraping_PA` — doit regarder solution Travailleur (regex dernier match) et améliorer
- `.ingredient-rangee` — classes dédiées `.ing-type`, `.ing-nom`, `.ing-inci`, `.ing-qte` au lieu de ciblage positionnel
- INCI dans fiche consultation ligne — lu à la volée depuis les données chargées, pas sauvegardé dans `Recettes_base`
- Toujours indiquer le fichier concerné avant chaque trouve/remplace
- Mode saisonnier — clé `mode_saisonnier` dans Sheet Contenu, toggle dans section Contenu du site admin
- Photos saisonnières — `photo_url_noel` col J dans Collections, `image_url_noel` col T dans Recettes
- Si pas de 2e photo → utiliser la photo régulière (jamais de trou)
- Photos en double à prévoir partout quand les photos en dur migreront vers Sheet Contenu

---

## ⚠️ PIÈGE DOCUMENTÉ — doGet vs doPost dans code.gs

**Problème rencontré :** une fonction a été ajoutée dans `doGet` seulement, mais appelée depuis l'admin via `appelAPIPost` qui envoie vers `doPost`. Résultat : la fonction était inaccessible depuis l'admin.

**Règle à toujours respecter :**
- `appelAPIPost` → appelle `doPost` dans `code.gs`
- Toute fonction appelée depuis `admin.js` via `appelAPIPost` **doit être branchée dans `doPost`**
- Si une fonction doit aussi être accessible en lecture directe (URL), la brancher dans `doGet` EN PLUS — jamais à la place

**Réflexe avant tout ajout dans code.gs :**
1. Vérifier comment la fonction est appelée dans `admin.js` (`appelAPIPost` ou `appelAPI`)
2. `appelAPIPost` → brancher dans `doPost`
3. `appelAPI` → brancher dans `doGet`
4. Ne jamais retirer les branchements existants — ajouter seulement

---

## RÈGLES CRITIQUES (rappel)
- JAMAIS de code sans OUI explicite
- Un seul trouve/remplace à la fois
- Toujours indiquer le fichier avant de proposer un trouve/remplace
- Toujours lire le fichier avant de proposer
- Jamais de style inline dans JS/HTML
- Jamais suggérer pause/repos
- Fin de tâche → dire COMMIT
- Brief produit en entier en `.md` en fin de session sans rien effacer — **JAMAIS en conversation, toujours en fichier `.md`**
- **Avant toute proposition de solution technique : toujours cerner le problème au complet en jasant d'abord — poser des questions pour comprendre le contexte global, pas juste le symptôme immédiat — ne jamais proposer la première solution "facile" sans avoir exploré tout autour — une solution proposée sans avoir cerné le problème = violation**

---

*Univers Caresse — Confidentiel — 23 mars 2026 — 07h00*

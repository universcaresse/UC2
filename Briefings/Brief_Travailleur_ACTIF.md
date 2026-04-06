# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
*Mis à jour : 22 mars 2026 — 21h30*

---

## PROJET — FICHIERS ET URLS
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbyDbcy6kBKcTWtj2B0kLfAioy9f2ShI0UtMPP1wg2K-xKUUDdIDONH_rbB_RCzu7lyhVw/exec`
- Site public : https://universcaresse.github.io/universcaresse/
- GitHub : https://github.com/universcaresse/univers-caresse

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- **Toujours indiquer le fichier concerné avant chaque trouve/remplace**
- Changement ciblé → trouve/remplace uniquement, jamais le fichier complet
- Un seul changement à la fois — attendre la confirmation avant le suivant

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

## ✅ CHANGEMENTS — SESSION 22 MARS 2026

### Ingrédients de base — mise à jour pour INCI

**Problème :** Le formulaire de modification d'une ligne de produits permettait d'ajouter des ingrédients de base, mais sans le champ INCI ni l'option d'ajouter un nouvel ingrédient — contrairement au formulaire recette qui l'avait déjà.

**Fichier `admin.js` :**
- Affichage des ingrédients de base (fonction qui génère les rangées du formulaire ligne) — ajout du champ INCI en lecture seule + option `+ Ajouter un ingrédient` (identique au formulaire recette)
- Fonction d'ajout d'un nouvel ingrédient INCI — ajout du paramètre `liste` ('recette' ou 'base') pour savoir quel tableau mettre à jour après l'ajout
- Fiche consultation d'une ligne — affiche maintenant le INCI de chaque ingrédient de base (lu à la volée depuis les données chargées, pas sauvegardé dans `Recettes_base`)

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
- Structure : A=Catégorie, B=Nom, C=INCI, D=Source, E=Date ajout, F=Note olfactive, G=Statut
- ⚠️ CAS retiré — Statut ajouté en col G

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

---

## ARCHITECTURE GOOGLE SHEETS

| Sheet | Contenu |
|-------|---------|
| `Collections` | Les collections (nom, couleur hex, photo régulière col I, photo saisonnière col J) |
| `Recettes` | Les recettes (nom, ingrédients, instructions, prix, statut public/test, photo régulière col R, photo saisonnière col T) |
| `Recettes_Formats` | Les formats de vente d'une recette (poids, unité, prix, emballage) — une recette peut avoir plusieurs formats |
| `Recettes_base` | Les ingrédients de base d'une ligne de produits — copiés automatiquement dans toute nouvelle recette de cette ligne |
| `Ingredients_INCI` | La liste de référence de tous les ingrédients avec leur nom INCI, source, date ajout, note olfactive et statut |
| `Factures` | Les factures d'achat de matières premières |
| `Achats` | Le détail de chaque item dans chaque facture |
| `Inventaire_ingredients` | Le stock actuel de chaque ingrédient |
| `Config` | Les densités et marges de perte par type d'ingrédient |
| `Contenu` | Tous les textes éditables du site public (titres, descriptions, sections éducatives, `mode_saisonnier`, `maintenance_active`) |
| `Scraping_PA_v4` | Catalogue Purearome — 577 produits, texte brut, 5 qualités |
| `Scraping_MH` | Catalogue Les Mauvaises Herbes — ~110 produits |
| `CosIng_Cache` | Cache EU CosIng — 24 774 entrées — pour usage futur |

---

### Le chemin d'un ingrédient — de l'achat à l'étiquette INCI

1. Chantal entre une facture d'achat → l'ingrédient est ajouté à l'inventaire
2. L'ingrédient doit exister dans `Ingredients_INCI` pour avoir son INCI
3. Le Chercheur peuple `Ingredients_INCI` via scraping (Purearome, Les Mauvaises Herbes)
4. Les lignes sans INCI sont marquées 🔴 À compléter — Chantal les corrige via la page admin correction INCI
5. Quand Chantal crée une recette et choisit un ingrédient, le champ INCI s'affiche automatiquement en lecture seule
6. Le générateur INCI de la recette produit la liste réglementaire triée par concentration décroissante

---

### Les listes déroulantes — d'où viennent-elles

Toutes les listes déroulantes d'ingrédients dans l'admin (recettes, factures, ingrédients de base) viennent de `Ingredients_INCI` via `code.gs`. Source unique = pas de doublon possible.

---

### Les ingrédients de base d'une ligne — comment ça marche

Quand Chantal crée ou modifie une ligne de produits, elle peut y attacher des ingrédients de base avec leurs quantités. Sauvegardés dans `Recettes_base`. Copiés automatiquement dans toute nouvelle recette de cette ligne.

---

### Le mode saisonnier — comment ça marche

Toggle dans l'admin → bascule `mode_saisonnier` dans Sheet Contenu entre `oui` et `non`. Si `oui`, photos saisonnières utilisées partout (cartes, modals) si elles existent — sinon photo régulière.

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
- `Ingredients_INCI` = source de vérité propre et permanente
- Structure `Ingredients_INCI` : A=Catégorie, B=Nom, C=INCI, D=Source, E=Date ajout, F=Note olfactive, G=Statut
- Priorité INCI : Purearome > Les Mauvaises Herbes
- Saisie manuelle INCI uniquement via page admin correction INCI
- Générateur INCI — fragrances regroupées sous `Fragrance (note1, note2...)` via col F
- Règle canadienne INCI : ordre décroissant concentration, ingrédients ≤1% peuvent être dans n'importe quel ordre après les autres
- Chercheur prend la relève complète pour scraping — PA v4/v5/v6 + construireIngredientsINCI complétés
- `.ingredient-rangee` — classes dédiées `.ing-type`, `.ing-nom`, `.ing-inci`, `.ing-qte`
- INCI dans fiche consultation ligne — lu à la volée depuis les données chargées
- Toujours indiquer le fichier concerné avant chaque trouve/remplace
- Mode saisonnier — `photo_url_noel` col J Collections, `image_url_noel` col T Recettes
- Si pas de 2e photo → photo régulière (jamais de trou)
- Photos en double à prévoir quand les photos en dur migreront vers Sheet Contenu

---

## ⚠️ PIÈGE DOCUMENTÉ — doGet vs doPost dans code.gs

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
- **Brief produit en entier en `.md` via `present_files` — JAMAIS dans la conversation, JAMAIS en aperçu, TOUJOURS fichier téléchargeable. Sans exception.**
- **Avant toute proposition de solution technique : toujours cerner le problème au complet en jasant d'abord — une solution proposée sans avoir cerné le problème = violation**

---

*Univers Caresse — Confidentiel — 22 mars 2026 — 21h30*

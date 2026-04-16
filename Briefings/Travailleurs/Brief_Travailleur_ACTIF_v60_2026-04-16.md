⛔ PROTOCOLE OBLIGATOIRE — LIS CECI AVANT TOUT. SANS EXCEPTION.
ÉTAPE 1 — AVANT DE RÉPONDRE

Lis ce brief AU COMPLET, ligne par ligne IMPORTANT.
Lis CHAQUE fichier fourni AU COMPLET.
Confirme à voix haute : "Brief lu. Fichiers lus. Prêt."
Si tu n'as pas tout lu — tu te tais et tu lis.
Produire le brief en fichier `.md` seulement

ÉTAPE 2 — AVANT DE PROPOSER UN CHANGEMENT
Tu dois pouvoir répondre aux 3 questions suivantes. Sinon tu ne proposes rien :

Qu'est-ce que ce changement touche directement ?
Qu'est-ce que ce changement touche ailleurs dans le site ?
Qu'est-ce qui existait avant et qui pourrait briser ?

ÉTAPE 3 — AVANT DE CODER

Tu attends un OK explicite. Rien d'autre.
**⚠️ Le OUI doit être un GO sans ambiguïté — répondre "oui" à une question de Claude ne compte pas comme GO. Le GO doit venir spontanément de l'utilisateur. Pas d'explication, pas de bla bla — se taire et attendre.**
**Expliquer en langage simple ce qu'on veut faire — pas en code — attendre le OK — puis livrer le trouve/remplace**
Un seul changement à la fois. Un. Pas une liste.
Livraison = trouve/remplace ciblé uniquement. Jamais le fichier complet sans permission explicite.
Jamais de style inline dans le HTML ou le JS.
Jamais créer une fonction ou classe CSS si une existante peut servir.

⚠️ RÈGLE CRITIQUE — IMPACTS JS AVANT TOUT CHANGEMENT HTML
Avant tout changement de structure HTML (ajout/retrait de div, changement de classe), vérifier TOUS les endroits dans admin.js qui référencent cet élément — classList.add, classList.remove, getElementById, querySelector. Un changement HTML sans vérification JS complète = violation.

VIOLATION = ARRÊT IMMÉDIAT
Coder sans OUI · Livrer un fichier complet sans permission · Proposer plusieurs changements · Briser une fonctionnalité existante · Lire partiellement un fichier · Dire "teste" avant d'avoir vérifié tous les impacts JS
Un site cassé à cause d'un changement non vérifié est une faute grave. On revient en arrière avant de continuer.


# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v60 — 16 avril 2026

---

## 🚀 PRIORITÉS — PROCHAINE SESSION

~~1. **Gammes** — Ajouter un filtre par collections~~ ✅ FAIT 13 avril
~~2. **Gammes** — Le hex par défaut (actuellement rouge) doit prendre le hex de la collection~~ ✅ RÉGLÉ par calcul auto GS
~~3. **Gammes** — Afficher une ligne des produits à l'ouverture d'une gamme~~ ✅ FAIT 13 avril
4. **Achats / Import PDF** — Retirer le bouton `+ NOUVEAU` par ligne — dans les listes déroulantes cat UC et nom UC, ajouter `+ Créer` inline — rediscuter avec screenshot au début de session
5. **Import PDF** — Extraire le contenu en TXT directement au lieu de tester manuellement
~~6. **Factures** — Le X de fermeture du modal est en dehors du modal~~ ✅ FAIT 13 avril (position:relative sur .modal-admin)
~~7. **Inventaire** — Affiche le ID au lieu de la catégorie~~ ✅ FAIT 13 avril
8. **Lot existant** — Doit diminuer les ingrédients comme lors de la production d'un nouveau lot
9. **Catalogue** — Brancher le catalogue
10. **Recettes** — Enlever l'import recette
11. **JS** — Séparer le JS
12. **Catalogue** — Permettre la consultation sur iPad
13. **Dropdown** — Ne se ferme pas si on clique ailleurs sans choisir une action
14. **UI** — Revoir les bulles au téléchargement et les boutons réactifs lors d'une action
~~15. **Coût de revient** — Fiche produit~~ ✅ FAIT 15 avril
16. **Coût de revient** — Fabrication (nouveau lot et lot existant) — EN COURS
17. **Coût de revient** — Déplacer `${coutHtml}` dans le bloc infos en haut de la fiche — EN COURS
~~18. **Scraping PA** — Mettre à jour `Scraping_PA_v2`~~ ✅ FAIT 16 avril (autre Claude)
19. **Import PDF** — Style inline `style="width:60px"` dans les lignes manuelles — à déplacer en CSS à l'occasion
20. **Factures** — Modification d'une facture finalisée (lignes) — à faire

---

> 📦 **Historique complet des sessions dans** `Brief_Univers_Caresse_ARCHIVES.md`

---

## 🆕 VIOLATIONS COMMISES PAR LES CLAUDE PRÉCÉDENTS — À NE PAS RÉPÉTER

1. Ne pas lire les fichiers transmis au complet avant de coder ou proposer quoi que ce soit
2. Proposer du CSS inutile sans vérifier d'abord si une classe existante suffisait
3. Produire le brief dans le chat au lieu de le livrer en fichier `.md`
4. **⛔ CRITIQUE :** Modifier `code.gs` du V1 — le V1 a cessé de fonctionner. Jean-Claude a dû tout effacer deux fois.
5. **⛔ CRITIQUE :** Quand le code ne fonctionne pas, accuser le déploiement, le lien, les règles Google, ou toute cause externe. La seule réponse valide : "Mon code est mauvais, voici la correction."
6. **⛔ CRITIQUE :** Proposer des changements d'architecture sans mandat.
7. **⛔ INTERDIT ABSOLU :** Ne jamais faire référence à l'heure ou suggérer une pause.
8. **⛔ INTERDIT ABSOLU :** Ne jamais coder sans OUI explicite de Jean-Claude.
9. **⛔ CRITIQUE :** Ne jamais mettre de style inline dans le HTML — même temporairement.
10. **⛔ CRITIQUE :** Ne jamais inventer ce qu'on voit à l'écran sans lire le fichier.
11. **⛔ CRITIQUE :** Ne jamais passer au sujet suivant sans OUI explicite.
12. **⛔ CRITIQUE :** Livrer un fichier JS complet avec des conflits de déclaration (`const` vs `function` même nom, `const` redéclaré entre fichiers). Toujours vérifier avec `node --check` avant de livrer.
13. **⛔ CRITIQUE :** Faire des aller-retours de corrections une ligne à la fois quand le problème touche tout un fichier — livrer le fichier complet corrigé d'un coup avec permission.
14. **⛔ CRITIQUE :** Déclarer des variables globales avec `let` au milieu du fichier JS — elles doivent être `var` pour éviter les erreurs TDZ (Temporal Dead Zone). Toujours `var` pour les globales dans `admin.js`.
15. **⛔ CRITIQUE :** Livrer un trouve/remplace qui ne couvre pas la ligne complète — toujours livrer la ligne entière pour éviter les ambiguïtés.
16. **⛔ CRITIQUE :** Proposer plusieurs changements dans le même message sans attendre le OK entre chaque.
17. **⛔ CRITIQUE :** Créer une nouvelle classe CSS sans vérifier d'abord si une classe existante peut être réutilisée.
18. **⛔ CRITIQUE :** Utiliser une variable JS non définie dans le scope courant — toujours vérifier les variables disponibles avant de livrer.
19. **⛔ CRITIQUE :** Proposer seulement 2 options quand il faut d'abord jaser pour trouver la meilleure solution ensemble.
20. **⛔ CRITIQUE :** Au Québec, **OK = OUI**. Les deux sont valides comme confirmation explicite avant de coder.
21. **⛔ CRITIQUE :** Livrer du style inline dans le JS (`el.style.opacity = '1'`) — toujours passer par une classe CSS.
22. **⛔ CRITIQUE :** Proposer du code sans attendre le OUI même après avoir bien expliqué — l'explication n'est pas le OUI.
23. **⛔ CRITIQUE :** Quand Jean-Claude dit qu'il a terminé les tests et qu'il veut le brief — produire le brief, pas proposer de régler des bugs.
24. **⛔ CRITIQUE :** Ne jamais poser de question après un COMMIT — Jean-Claude committera quand il sera prêt et testera lui-même.
25. **⛔ CRITIQUE :** Faire un audit partiel au lieu de tout lire — quand on demande un audit complet, lire les deux fichiers JS ET le GS avant de répondre quoi que ce soit.
26. **⛔ CRITIQUE :** Faire des suppositions sur le genre ou le profil des visiteurs du site sans que Jean-Claude l'ait précisé.
27. **⛔ CRITIQUE :** Livrer plusieurs trouve/remplace dans le même message sans attendre le OK entre chaque — même quand le plan a été approuvé globalement, chaque trouve/remplace individuel doit être livré séparément.
28. **⛔ CRITIQUE :** Coder du contenu en dur dans le HTML/JS (ex: `<td>0.00 $</td>`) au lieu de le calculer dynamiquement.
29. **⛔ CRITIQUE :** Déduire les noms de catégories à partir des exemples de produits — toujours obtenir les vrais noms de la source.
30. **⛔ CRITIQUE :** Ne pas vérifier les impacts d'un changement avant de livrer — ex: changer le format des dates sans vérifier tous les endroits qui utilisent ces dates.
31. **⛔ INTERDIT ABSOLU :** Ne jamais dire "Tu as raison" — inutile et condescendant.

---

### V2 = même visuel que V1, nouveau moteur
- **Base visuelle** → V1 intact (index.html, style.css — on ne touche pas)
- **Moteur** → V2 (code_v2.gs, sheets _v2, nouvelles APIs)
- **JS** → main.js et admin.js réécrits pour les nouvelles APIs V2 ✅
- **Brief de référence** → ce document (fusion V1 + décisions V2)
- **Vocabulaire V2** → Gamme (au lieu de Ligne), Produit (au lieu de Recette)

### Ce qu'on NE fait PAS
- On ne touche pas au code.gs V1 — jamais, sous aucun prétexte
- On ne touche pas au style.css V1 ~~(sauf consolidation CSS planifiée)~~ → consolidation CSS en cours au fur et à mesure
- On ne touche pas à l'index.html V1 (sauf adaptations mineures)
- Le V1 reste en production pendant la migration du moteur

---

### Le projet — état actuel
- **Moteur** → `code_v2.gs`, sheets `_v2`, APIs V2
- **JS** → `main.js` et `admin.js` — réécrits V2 ✅
- **Brief de référence** → ce document

---

## PROJET — FICHIERS ET URLS

### V1 — EN PRODUCTION — NE PAS TOUCHER AU MOTEUR
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`
- **Apps Script URL V1 :** `https://script.google.com/macros/s/AKfycbwwiGLwj8QJ6c5dGEtPEHUojzdbdncsTXnmEn-LJJxg7xBeckcbiCX1bvkMb3E3ba1FEA/exec`

### V2 — repo UC2
- Site : `https://universcaresse.github.io/UC2/`
- Admin : `https://universcaresse.github.io/UC2/admin/`
- Fichiers : `index.html`, `admin/index-admin.html`, `css/style.css`, `js/main.js`, `js/admin.js`, `js/parsers.js`, `code_v2.gs`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`
- **Projet Apps Script :** `uc2` — séparé du V1, ne jamais les mélanger
- GitHub : `https://github.com/universcaresse/univers-caresse`

---

## ⚠️ RAPPEL CRITIQUE — Apps Script
Après tout changement dans `code_v2.gs` → **redéployer obligatoirement** :
Déployer → Gérer les déploiements → Nouvelle version → Déployer

**⛔ Ne jamais modifier `code.gs` du V1 — jamais, sous aucun prétexte.**

---

## ⚠️ RÈGLE JS — CONFLITS DE DÉCLARATION
- `CONFIG`, `appelAPI`, `appelAPIPost`, `formaterPrix` sont déclarés dans `main.js` — **ne jamais les redéclarer dans `admin.js`**
- Avant de livrer un fichier JS complet → toujours vérifier `node --check fichier.js`
- Alias de compatibilité → toujours `function nom() { autreNom(); }` — jamais `const nom = autreNom`
- **Toutes les variables globales dans `admin.js` doivent être déclarées avec `var` (pas `let`) pour éviter les erreurs TDZ**

---

## 🔴 RÈGLE LÉGALE — INCI
- **Ne jamais afficher le nom d'un ingrédient à la place de son code INCI** — c'est illégal
- Afficher uniquement les ingrédients qui ont un code INCI valide (`i.inci` non vide)
- La liste INCI doit commencer par le label **"Ingrédients :"**
- Les ingrédients doivent être triés du plus grand au plus petit pourcentage (norme EU)
- Les fragrances sont regroupées sous **"Fragrance"** en fin de liste
- **⚠️ Un produit ne peut pas passer au statut `public` tant que tous ses ingrédients n'ont pas un code INCI valide**

---

## 🔴 PRINCIPE DE CONSOLIDATION CSS — ACTIF
- À chaque changement, évaluer si on peut consolider plutôt qu'ajouter
- **Règle** : un élément c'est un élément partout — titre, bouton, carte, badge, formulaire
- **Règle** : un seul système de boutons — `.bouton` est la base, les variantes ajoutent seulement la couleur ou le padding
- **Règle** : toujours réutiliser une classe existante avant d'en créer une nouvelle
- **Règle** : les variables du `:root` sont génériques (ex: `--texte-85`) — jamais liées à un élément spécifique
- Nettoyage CSS progressif — au fur et à mesure, pas en bloc

---

## 🏗️ ARCHITECTURE V2 — DÉCISIONS PRISES — NE PAS REMETTRE EN QUESTION

### Vocabulaire
- Ligne → **Gamme** | Recette → **Produit**

### Hiérarchie
- **Collection → Gamme → Produit**
- Étiquettes optionnelles : **Famille** et **Collection secondaire**

### Préfixes d'IDs
- COL-001, FAM-001, GAM-001, PRO-001, ING-001, CAT-001, EMB-001
- FOUR-001, ACH-001, VEN-001, LOT-001

### Google Sheets V2 — 25 sheets avec suffixe _v2
**Structure** : Collections_v2, Gammes_v2, Familles_v2
**Produits** : Produits_v2, Produits_Ingredients_v2, Produits_Formats_v2, Emballages_v2
**Médias** : Mediatheque_v2
**Chaîne INCI** : Scraping_PA_v2, Scraping_MH_v2, Scraping_Arbressence_v2, Scraping_DE_v2, Mapping_Fournisseurs_v2, Categories_UC_v2, Ingredients_INCI_v2
**Configuration** : Config_v2
**Fournisseurs & Achats** : Fournisseurs_v2, Formats_Ingredients_v2, Achats_Entete_v2, Achats_Lignes_v2
**Stock** : Stock_Ingredients_v2
**Production** : Lots_v2
**Ventes** : Ventes_Entete_v2, Ventes_Lignes_v2
**Config site** : Contenu_v2

### Colonnes officielles des sheets V2
**Collections_v2** — COL-id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url
**Gammes_v2** — GAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url
**Familles_v2** — FAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url
**Produits_v2** — PRO-id, COL-id, GAM-id, FAM-id, nom, description, desc_emballage, couleur_hex, surgras, nb_unites, cure, instructions, notes, image_url, image_noel_url, statut, collections_secondaires
**Produits_Ingredients_v2** — PRO-id, ING-id, nom_ingredient, quantite_g
**Produits_Formats_v2** — PRO-id, poids, unite, prix_vente, EMB-id
**Emballages_v2** — EMB-id, nom, type
**Mediatheque_v2** — url, nom, categorie, date_ajout
**Mapping_Fournisseurs_v2** — Fournisseur, Categorie_fournisseur, Nom_fournisseur, Categorie_UC, Nom_UC, ING-id
**Categories_UC_v2** — CAT-id, nom, date_ajout
**Ingredients_INCI_v2** — ING-id, CAT-id, nom_fournisseur, nom_UC, INCI, nom_botanique, source, note_olfactive, statut, date_ajout
**Config_v2** — type, densite, unite, marge_perte_pct
**Fournisseurs_v2** — FOUR-id, code, nom, site_web, notes
**Formats_Ingredients_v2** — ING-id, contenant, quantite, unite
**Achats_Entete_v2** — ACH-id, date, FOUR-id, sous_total, tps, tvq, livraison, total, facteur_majoration, statut, numero_facture
**Achats_Lignes_v2** — ACH-id, ING-id, format_qte, format_unite, prix_unitaire, prix_par_g, prix_par_g_reel, quantite, prix_total, notes
**Stock_Ingredients_v2** — ING-id, qte_g, prix_par_g_reel, date_derniere_maj
**Lots_v2** — LOT-id, PRO-id, multiplicateur, nb_unites, date_fabrication, date_disponibilite, cout_ingredients, cout_emballages, cout_revient_total, cout_par_unite, statut
**Ventes_Entete_v2** — VEN-id, date, client, total, statut
**Ventes_Lignes_v2** — VEN-id, PRO-id, LOT-id, quantite, prix_unitaire, prix_total
**Contenu_v2** — cle, valeur

### ⚠️ COLONNE AJOUTÉE — Achats_Entete_v2
- Colonne K = `numero_facture` — ajoutée manuellement dans la sheet (v52)

### Actions API V2 — doGet
| Action | Fonction |
|---|---|
| getCollections | getCollections_v2() |
| getGammes | getGammes_v2() |
| getFamilles | getFamilles_v2() |
| getProduits | getProduits_v2() |
| getProduitsIngredients | getProduitsIngredients_v2(pro_id) |
| getProduitsFormats | getProduitsFormats_v2(pro_id) |
| getIngredientsInci | getIngredientsInci_v2() |
| getCategoriesUC | getCategoriesUC_v2() |
| getMappingFournisseurs | getMappingFournisseurs_v2() |
| getFournisseurs | getFournisseurs_v2() |
| getFormatsIngredients | getFormatsIngredients_v2() |
| getGammesIngredients | getGammesIngredients_v2(gam_id) |
| getAchatsEntete | getAchatsEntete_v2() |
| getAchatsLignes | getAchatsLignes_v2(ach_id) |
| getStock | getStock_v2() |
| getLots | getLots_v2() |
| getVentesEntete | getVentesEntete_v2() |
| getVentesLignes | getVentesLignes_v2(ven_id) |
| getConfig | getConfig_v2() |
| getContenu | getContenu_v2() |
| getMediatheque | getMediatheque_v2() |
| getCatalogue | getCataloguePublic_v2() |

### Actions API V2 — doPost
| Action | Fonction |
|---|---|
| saveCollection | saveCollection_v2(data) |
| deleteCollection | deleteCollection_v2(data) |
| saveGamme | saveGamme_v2(data) |
| deleteGamme | deleteGamme_v2(data) |
| saveFamille | saveFamille_v2(data) |
| deleteFamille | deleteFamille_v2(data) |
| saveProduit | saveProduit_v2(data) |
| deleteProduit | deleteProduit_v2(data) |
| saveIngredientInci | saveIngredientInci_v2(data) |
| saveCategorieUC | saveCategorieUC_v2(data) |
| deleteCategorieUC | deleteCategorieUC_v2(data) |
| createAchatEntete | createAchatEntete_v2(data) |
| addAchatLigne | addAchatLigne_v2(data) |
| finaliserAchat | finaliserAchat_v2(data) |
| deleteAchatLigne | deleteAchatLigne_v2(data) |
| deleteAchat | deleteAchat_v2(data) |
| saveLot | saveLot_v2(data) |
| createVente | createVente_v2(data) |
| addVenteLigne | addVenteLigne_v2(data) |
| finaliserVente | finaliserVente_v2(data) |
| saveConfig | saveConfig_v2(data) |
| updateContenu | updateContenu_v2(data) |
| saveMediatheque | saveMediatheque_v2(data) |
| supprimerMediatheque | supprimerMediatheque_v2(data) |
| envoyerContact | envoyerContact_v2(data) |
| validerMotDePasse | validerMotDePasse_v2(data) |
| saveMappingFournisseur | saveMappingFournisseur_v2(data) |

---

## 🏗️ ARCHITECTURE V2 — VISION ACHATS

### Principe fondamental
**Tout passe par les achats** — ingrédients, contenants, emballages, équipement. Une seule porte d'entrée.

### Formule $/g
- **$/g brut** = prix_unitaire ÷ grammes
- **$/g réel** = $/g brut × facteur_taxes
- Conversions : kg×1000, L×1000, lbs×453.592 — **ml = valeur brute sans densité**

### Import PDF
- PDF lu via **PDF.js** directement dans le navigateur
- Parser Pure Arôme dans `parsers.js` ✅
- Parser Amazon dans `parsers.js` ✅ (v53)
- Mapping automatique via `Mapping_Fournisseurs_v2`

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE

### Public (main.js)
- `donneesCatalogue` — variable globale contenant produits, collections, infoCollections
- `accueilAnime` — booléen global, empêche l'animation accueil de rejouer au retour
- `catalogueCharge` + `catalogueTimestamp` — catalogue rafraîchi toutes les **30 minutes** (CATALOGUE_TTL)
- Navigation entre sections = instantané, zéro appel réseau supplémentaire

### Admin (admin.js)
- `donneesCollections`, `donneesGammes`, `donneesFamilles`, `donneesProduits`, `listesDropdown` — chargés une fois au démarrage
- `donneesProduits` inclut les formats joints (chargés via `getProduitsFormats` au démarrage ET après chaque save produit) ✅ v44
- `ifMapping` — chargé une fois à l'accès à la section import facture
- `_mediathequeDonnees` — chargé une fois à l'accès à la section médiathèque
- **Toutes les variables globales sont déclarées avec `var` en tête de fichier**

### Sécurité — mot de passe
- `CONFIG.MOT_DE_PASSE` retiré de `main.js` ✅ v44 — plus visible dans le source public
- Validation via `validerMotDePasse_v2` dans `code_v2.gs`
- Mot de passe stocké dans **Script Properties** (`MOT_DE_PASSE`) du projet Apps Script uc2

---

## 🏗️ ARCHITECTURE — MODULE FABRICATION V2

### Terminologie
| Terme | Définition |
|---|---|
| Stock | Ingrédients (matières premières) |
| Inventaire | Produits finis (savons fabriqués) — par lot |
| Fabrication | L'acte de produire un lot |
| Lot | Une fabrication spécifique — produit × multiplicateur |
| En cure | Lot fabriqué mais pas encore prêt à vendre |
| Disponible | Lot prêt à vendre, stock > 0 |
| Épuisé | Plus aucune unité disponible |

### Statut calculé dynamiquement
- `date_disponibilite > aujourd'hui` → `en_cure`
- `date_disponibilite <= aujourd'hui` et `nb_unites > 0` → `disponible`
- sinon → `epuise`

---

## 🏗️ ARCHITECTURE — MÉDIATHÈQUE PHOTOS
- Sheet `Mediatheque_v2` — url, nom, categorie, date_ajout
- Synchro via API Cloudinary — cloud : `dfasrauyy`
- Logos fixes — `Images/plume.png`, `Images/Logofinal.png`

---

## 🏗️ ARCHITECTURE — MODAL PRODUIT PUBLIC
- Tri INCI : plus de 1% décroissant, puis 1% et moins
- Fragrances sous "Fragrance" en fin
- **Jamais de fallback sur `i.nom`** — uniquement `i.inci`
- Préfixe : `"Ingrédients : "`
- ✅ INCI jointé dans getCataloguePublic_v2

---

## 🏗️ ARCHITECTURE — CARTES PRODUITS (PUBLIC ET ADMIN)
- Les deux utilisent les mêmes classes CSS : `carte-produit`, `carte-visuel`, `carte-couleur`, `carte-infos`, `carte-collection-badge`, `carte-nom`, `carte-ligne`, `carte-bas`, `carte-formats`, `carte-format-tag`
- Admin ajoute `.carte-statut-badge` (position absolute sur l'image, coin haut-gauche)
- `couleurTexteContraste()` → seuil `> 0.5` dans les deux fichiers
- Les formats sont chargés au démarrage admin via `getProduitsFormats` et joints à `donneesProduits`

---

## 🏗️ ARCHITECTURE — SECTIONS ADMIN V2

### Navigation admin V2
- Accueil (direct)
- Création → Collections & Gammes, Familles, Produits, Import recettes
- Achats → Nouvelle facture, Import PDF, Factures, Inventaire ingrédients
- Production → Fabrication, Inventaire produits
- Système → INCI, Densité, Contenu site, Médiathèque, Site public ↗, Déconnexion

### Règle — Ajouter une nouvelle section admin
1. `<div class="section-admin" id="section-XXX">` dans `index-admin.html`
2. Bouton sidebar + nav avec `afficherSection('XXX', this)`
3. Branchement `if (id === 'XXX')` dans `afficherSection()` dans `admin.js`
4. Formulaires : `.form-panel` — afficher/masquer avec `classList.remove/add('cache')` uniquement (v51+)

---

## 🏗️ ARCHITECTURE — FICHIERS

| Fichier | État |
|---|---|
| `index.html` | ✅ En production |
| `admin/index-admin.html` | ✅ IDs et textes V2 — pattern 3 blocs v51 |
| `css/style.css` | ✅ En consolidation progressive |
| `js/main.js` | ✅ Réécrit V2 |
| `js/admin.js` | ✅ Réécrit V2 |
| `js/parsers.js` | ✅ Nouveau v53 — parsers PA + Amazon |
| `code.gs` V1 | ✅ NE JAMAIS TOUCHER |
| `code_v2.gs` | ✅ Corrigé et redéployé — v52 |

---

## VARIABLES TYPOGRAPHIQUES — ROOT (renommées v36)

| Variable | Valeur | Ancienne variable |
|---|---|---|
| `--texte-70` | `0.70rem` | `--texte-micro` |
| `--texte-75` | `0.75rem` | `--texte-xs` |
| `--texte-82` | `0.82rem` | `--texte-xs-2` |
| `--texte-85` | `0.85rem` | *(nouvelle)* |
| `--texte-90` | `0.90rem` | `--texte-sm` |
| `--texte-95` | `0.95rem` | `--texte-sm-2` |
| `--texte-105` | `1.05rem` | `--texte-corps` |
| `--texte-115` | `1.15rem` | `--texte-corps-2` |
| `--texte-130` | `1.30rem` | `--texte-titre-sm` |
| `--texte-150` | `1.50rem` | `--texte-titre-md` |
| `--texte-200` | `2rem` | `--texte-signature` |

---

## CLASSES CSS — UN SEUL SYSTÈME (style.css)

| Classe | Usage |
|---|---|
| `.page-entete` | Conteneur entête |
| `.page-entete-gauche` | Conteneur texte gauche |
| `.page-entete-eyebrow` | Sur-titre |
| `.page-entete-titre` | Grand titre |
| `.fade-in` / `.fade-in-doux` | Animations standard |
| `.fade-in-lent` | Animation lente 4s — logo et stats hero accueil |
| `.preload` | Préchargement images caché |
| `.cache` | `display: none !important` |
| `.ligne-groupe.masquee` | `display: none` — filtre gammes public |
| `.collection-section.masquee` | `display: none; opacity: 0` — filtre collections |
| `.bouton` | Bouton de base — vert plein, texte blanc, centré |
| `.bouton-rouge` | Variante rouge |
| `.bouton-or` | Variante or |
| `.bouton-vert-pale` | Variante vert pâle |
| `.bouton-contour` | Variante contour |
| `.bouton-petit` | Modificateur padding petit |
| `.bouton-grand` | Modificateur padding grand + `min-height: 52px` |
| `.filtres-bar` | Barre de filtres (public sticky + admin inline) |
| `.collection-filtres-gammes` | Filtres gamme inline sous description collection |
| `.famille-groupe` | Conteneur groupe famille dans le catalogue |
| `.famille-groupe-titre` | Titre de famille — Playfair vert, border-bottom 2px |
| `.famille-groupe-desc` | Description de famille — DM Sans, gris, 1.8 line-height |
| `.ligne-groupe-desc` | Description de gamme — DM Sans, gris, 1.7 line-height |
| `.carte-produit` | Carte produit (public et admin) |
| `.carte-visuel`, `.carte-couleur`, `.carte-infos` | Structure carte produit |
| `.carte-collection-badge`, `.carte-nom`, `.carte-ligne` | Textes carte produit |
| `.carte-bas`, `.carte-formats`, `.carte-format-tag` | Bas de carte avec formats |
| `.carte-statut-badge` | Badge statut admin |
| `#contenu-accueil-cta` | Texte bouton CTA hero — opacity 0 → 1 via `.visible` |
| `.hero-stat-num` | Chiffres stats hero — opacity 0 → 1 via `.visible` |
| `.mosaic-item` | Tuile mosaïque — fondu + scale, 2s d'écart, délai initial 1s |
| `.fiche-bandeau` | Bandeau coloré haut/bas des fiches admin (ex-`.fiche-collection-bandeau`) |
| `.fiche-slogan` | Slogan dans bandeau fiche |
| `.fiche-desc` | Description dans fiche |
| `.fiche-extras-wrap` | Conteneur extras fiche |
| `.fiche-couleur` | Couleur dans fiche |
| `.fiche-photo` | Photo dans fiche |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → `doPost`
- `appelAPI` → `doGet`
- Ne jamais retirer les branchements existants

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 🛒 SCRAPING FOURNISSEURS — MÉTHODOLOGIE (16 avril 2026)

### Approche générale — valable pour tous les fournisseurs
Le scraping se fait en **deux passages** :
1. **Passage 1 — Catalogue API** : récupérer tous les produits via l'API interne du fournisseur (JSON), avec pagination par `offset` de 100
2. **Passage 2 — Scraping page produit** : pour chaque nouveau produit, fetcher la page HTML et extraire INCI, nom botanique, qualité

### Comment trouver l'API d'un fournisseur
1. Ouvrir DevTools (F12 → Network) sur le site du fournisseur
2. Naviguer dans les catégories — repérer les requêtes XHR/Fetch vers une API
3. Copier les headers complets (Authorization, accept-currency, x-locale, etc.)
4. Tester l'API dans un script GAS avec `UrlFetchApp.fetch`

### Pure Arôme — API panierdachat.app (documenté 16 avril 2026)
- **Plateforme** : Panierdachat — `api2.panierdachat.app`
- **Auth** : Bearer token JWT (anonyme, valide ~1 an) — à renouveler si expiration
- **Token** : se récupère dans les headers DevTools sur `purearome.com`
- **Catégories** : `/api/public/categories/{slug}` — retourne `children[]` avec `id` et `slug`
- **Produits** : `/api/public/products?categoryId={id}&offset={n}&limit=100&order%5Btitle%5D=asc`
- **Pagination** : par `offset` (0, 100, 200...) — continuer tant que `items.length === 100`
- **Champs produit** : `slug`, `title`, `regular_price.amount`
- **Catégories connues** (IDs) :
  - 14329 Argiles, 14332 Bases neutres, 14335 Cires, 14337 Colorants et Pigments
  - 14340 Herbes et Fleurs, 14341 Huiles aromatiques naturelle, 14342 Huiles essentielles
  - 14343 Huiles et Beurres, 14344 Hydrolats, 14345 Ingrédients Liquides
  - 14346 Ingrédients Secs, 14347 Fragrances, 14348 Saveurs naturelles
  - 14328, 14333, 14334, 14338, 14339 → Contenants et emballages (5 sous-catégories)
- **Déduplication** : par slug — les sous-catégories "fourre-tout" perdent contre les spécifiques
- **URL produit** : `https://www.purearome.com/fr/produit/{slug}`

### Fonction principale — `paro_mettreAJour()`
- Fichier : `purearome.gs` (autonome, dans le projet UC2)
- Appel : via bouton HTML dans l'admin
- Comportement : **ajout seulement** — ne touche jamais aux lignes existantes
- Identification des existants : par URL (colonne `URL` de `Scraping_PA_v2`)
- Colonnes remplies : toutes les colonnes de `Scraping_PA_v2` (21 colonnes)
- Limite GAS 6 min : relancer le bouton si incomplet — reprend automatiquement là où ça s'est arrêté

### À faire pour les autres fournisseurs (MH, Arbressence, DE)
- Même approche : DevTools → trouver l'API → adapter la fonction
- Créer `mh_mettreAJour()`, `arb_mettreAJour()`, `de_mettreAJour()` sur le même modèle
- Chaque fournisseur a sa propre sheet : `Scraping_MH_v2`, `Scraping_Arbressence_v2`, `Scraping_DE_v2`
- Les colonnes sont identiques entre toutes les sheets Scraping_*_v2

---

## 📍 OÙ ON EST RENDU — fin session 8 avril 2026 (v45)

### ✅ Audit complet v45 — session 8 avril

Audit complet HTML + admin.js + main.js + code_v2.gs — tous les boutons, toutes les fonctions, tous les chemins de données tracés jusqu'à la sheet. 6 bugs identifiés et réglés :

**🔴 Critiques réglés**
1. ~~`saveProduit_v2` — deleteRow avant recalcul ligneExistante — produit toujours appendé, jamais modifié~~ ✅ — suppression du deleteRow redondant
2. ~~Bug #89 — `fr-ligne` se remplit seul à l'ouverture formulaire produit~~ ✅ — `fr-ligne` remis à vide + disabled dans `ouvrirFormProduit()`
3. ~~Sidebar Production → Inventaire — section inexistante, branchement manquant~~ ✅ — redirige vers `section-inventaire`

**🟡 Fonctionnels réglés**
4. ~~Filtre statut factures — "Finalisée" vs "Finalisé" — filtre ne trouvait jamais rien~~ ✅ — HTML corrigé `value="Finalisé"`
5. ~~Filtres Type et Fournisseur inventaire — dropdowns jamais peuplés~~ ✅
6. ~~Filtres Statut et Source INCI — boutons sans effet~~ ✅

**⚠️ Encore ouvert**
- `chargerCatalogue()` — `donneesCatalogue = null` puis vérification immédiate — cache jamais utilisé
- Styles inline dans `admin.js` lignes 1991, 2182, 2185, 2491
- `item-contenant` introuvable dans le HTML (ajouterItem)
- Bug #84 — Confirmer lot existant
- Bug #86 — Modifier titre produit (⚠️ réglé par fix saveProduit_v2 — à confirmer)
- Bug #90 — Liste gammes pas en ordre alphabétique dans formulaire produit

---

## 📍 OÙ ON EST RENDU — fin session 8 avril 2026 (v44)

### ✅ Audit complet v44 — session 8 avril

Audit complet de `admin.js`, `main.js` et `code_v2.gs` — 18 problèmes identifiés et réglés :

**🔴 Critiques réglés**
1. ~~`chargerProduitsData()` — formats perdus après save produit~~ ✅ — recharge `getProduitsFormats` en parallèle
2. ~~`afficherSection('fabrication')` — produits sans formats~~ ✅ — même fix
3. ~~`inciValider()` — ne sauvegardait rien~~ ✅ — branchée sur `saveIngredientInci`
4. ~~`deleteGamme_v2` — ingrédients orphelins dans `Gammes_Ingredients_v2`~~ ✅ — suppression en cascade ajoutée
5. ~~`supprimerFamille()` — pas de vérification produits liés~~ ✅ — vérification ajoutée

**🟡 Fonctionnels réglés**
6. ~~Suppression facture finalisée — stock non corrigé~~ ✅ — `deleteAchat_v2` soustrait le stock
7. ~~`sauvegarderDensite()` — `listesDropdown.config` non mis à jour~~ ✅
8. ~~`voirDetailFacture()` — noms affichés comme `ing_id`~~ ✅ — charge `fullData` si vide
9. ~~Fournisseurs manuels affichés comme `four_id`~~ ✅ — fallback `'—'`
10. ~~`prix_par_g` diverge JS vs GS pour `ml`~~ ✅ — aligné sur GS (pas de densité pour ml)
11. ~~Médiathèque `rowIndex` peut pointer mauvaise ligne~~ ✅ — recharge avant suppression
12. ~~Import PDF — pas de rollback si ligne échoue~~ ✅ — arrêt avec message d'erreur
13. ~~Bug #83 X et Annuler fabrication~~ ✅ — déjà branché dans le HTML
14. ~~`catalogueCharge` jamais remis à `false`~~ ✅ — TTL 30 minutes (`CATALOGUE_TTL`)
15. ~~`filtrerGamme()` sans `col_id`~~ ✅ — retour immédiat si `col_id` absent
16. ~~`appliquerContenu()` valeurs vides non effacées~~ ✅
17. ~~Mot de passe admin visible dans le source public~~ ✅ — déplacé dans Script Properties

### ✅ Bugs publics réglés — session 8 avril (v43)

1. ~~Filtre gammes~~ ✅ — `.ligne-groupe.masquee { display: none }` ajouté + boutons indexés par `gam_id`
2. ~~Bouton "Découvrir les collections"~~ ✅ — `querySelector('a.bouton.invisible')` remplace `.hero-cta`
3. ~~Tuiles collections accueil~~ ✅ — `afficherSection` ne réinitialise plus le filtre si `collectionEnAttente`
4. ~~Liens EDU page 3~~ ✅ — même fix que #3
5. ~~Bouton vert iPad portrait~~ ✅ — `width: 100%; max-width: 480px; margin: auto` dans media query
6. ~~Photo collection iPad portrait~~ ✅ — `aspect-ratio: 1/1; width: 100%; max-height: none`
7. ~~Description famille~~ ✅ — `desc_famille` ajoutée dans `code_v2.gs` et affichée dans `main.js`
8. ~~Animation accueil rejoue au retour~~ ✅ — `accueilAnime` booléen global empêche la répétition

### ✅ Page accueil — RÉGLÉE (session 7 avril soir)
- `.fade-in-lent` créée (4s) — logo et stats hero glissent lentement
- `.preload` créée — `fond.png` préchargé
- `.bouton-grand` — `min-height: 52px`
- `#contenu-accueil-cta` — fondu via `.visible`
- `.hero-stat-num` — fondu via `.visible`
- `.mosaic-item` — apparition fondu + scale, 2s d'écart, délai 1s

### ✅ INCI modal public — RÉGLÉ (session 7 avril soir)
- `code_v2.gs` — INCI jointé dans `getCataloguePublic_v2`
- `main.js` — liste INCI triée par quantité décroissante

---

## 📋 AUDIT CSS — style.css

### Doublons confirmés à corriger
- `.collection-section` défini deux fois — à fusionner
- `.filtres-bar` défini deux fois — intentionnel (public vs admin) mais à documenter
- `.texte-brut` défini deux fois — à fusionner
- `nav.scrolled { box-shadow: none; }` défini deux fois — ligne redondante
- `.connexion-erreur` défini deux fois — à fusionner

### Classes probablement mortes
- `.recettes-grille`, `.recette-statut-badge`, `.recette-bas`, `.recette-format`
- `.burger`, `.btn-connexion`, `.btn-deconnexion`, `.btn-nav-admin`, `.nav-badge`
- `.delay-1` à `.delay-5`, `.section-bientot`
- `.collection-ligne-item`, `.collection-ligne-nom`, `.collection-ligne-format`, `.collection-ligne-actions`
- `.mt-24`, `.text-right`, `.btn-ajouter-ingredient`, `.citation-guillemet`, `.edu-liens`

### Valeurs codées dur à variabiliser
- `0.85rem`, `0.78rem`, `0.68rem`, `0.62rem`, `0.82rem`, `0.88rem`
- `font-family: 'DM Sans', sans-serif` — répété des dizaines de fois
- `1.8rem`, `2rem`, `1.1rem`, `1.3rem`, `1.6rem`, `2.2rem`

### Lignes mortes
- Ligne 1266 : `/* truc */`
- Lignes 905-914 : 10 lignes blanches
- Section `/* ADMIN — EN-TÊTE DE PAGE */` : vide

---

## 🎯 TOUTES LES TÂCHES À FAIRE — NUMÉROTÉES

### ⚠️ MIGRATION V2 — EN COURS
~~M1. Réécrire `main.js` pour APIs V2~~ ✅
~~M2. Réécrire `admin.js` pour APIs V2~~ ✅ Passe 1
~~M3. Tester et corriger `admin.js` section par section~~ ✅ audit v44/v45
~~M4. Adapter `index-admin.html`~~ ✅
~~M5. INCI dans modal public~~ ✅
M6. Passe 2 admin.js — nettoyage

### ⚠️ LÉGAL / URGENT
1. Bloquer statut `public` si INCI incomplets ⚠️ LÉGAL
2. Synchronisation mémoire JS — `listesDropdown.fullData` après `inciValider()`
3. Bouton INCI — Envoyer au graphiste par courriel + bloqué si incomplets

### 🏭 FABRICATION — BUGS À RÉGLER
~~83. X et Annuler ne ferment pas le formulaire fabrication~~ ✅ déjà branché
84. Confirmer lot existant ne fonctionne plus
85. Ajouter choix de gamme dans formulaire fabrication
~~86. Modifier titre produit ne sauvegarde pas~~ ✅ réglé fix saveProduit_v2
~~89. Champ Gamme se remplit seul à l'ajout produit~~ ✅
90. Liste gammes pas en ordre alphabétique dans formulaire produit

### 🏭 FABRICATION — AMÉLIORATIONS
- Modification d'un lot de production existant — À FAIRE

### 📄 FACTURES / ACHATS
4. ~~Finaliser `afficherApercuItems` + `ifFiltrerNoms` + `ifAjouterNomUC` + `ifConfirmerNomUC`~~ ✅ v52
~~5. Parser Amazon~~ ✅ v53
6. Affichage $/g brut et réel dans tableau items facture
7. Affichage adaptatif $/L, $/kg, $/100g
8. Gestion emballages/contenants dans achats
9. Templates emballages imprimés

### 🏗️ ARCHITECTURE
~~10. INCI dans modal public~~ ✅
11. Lien cliquable fiche fournisseur — page INCI
12. Champ INCI modifiable + Source + Date — page INCI

### 🛍️ CATALOGUE / PUBLIC
14. Ordre collections par rang
15. Sur-titre hero "COLLECTIONS 2026" — iPhone
16. Filtres catalogue par type de peau
17. Liens page 7 → catalogue filtré
18. Guide rapide — colonne "Savons recommandés"
19. Accordéons mobile seulement
20. Mosaïque hero dynamique
21. Textes Sheet → Markdown
22. Comment acheter
23. Actualités automatiques
24. FAQ admin
25. Pages FAQ, conditions, retours
26. Courriel confirmation commande
27. Affichage délais
28. INCI EU CosIng
29. Commande légère
30. Photo par gamme
31. Calculateur SAF
32. Coût de revient complet
33. Scan factures
34. Comptabilité
35. Masquer contenu ouverture
36. Inverser Modifier/Supprimer
37. Photos en double
38. Tuiles collections
39. Bouton Modifier modal facture
40. Factures — filtre produit
41. Modal facture complète
42. Filtres inventaire
43. Inventaire — séparation
44. Masquer liste édition
45. Notes importantes
46. Prix/g réel à la finalisation
47. Domaine universcaresse.ca
48. Catalogue PDF
49. Amortissement équipement
50. Module Vente
51. Mode focus
52. Scroll haut auto
53. Uniformiser consultation
54. Boutons en bas
55. Menu Système — réordonner
56. Fade-in contenu sections
57. Retirer flèche "Découvrir"

### 📱 RESPONSIVE — À FAIRE
- iPhone — Filtres collections : présentation à revoir

### 📷 MÉDIATHÈQUE PHOTOS
80. Ajouter clés photo dans Sheet `Contenu_v2` pour les 4 photos éditoriales
81. Brancher ces clés dans `appliquerContenu()` dans `main.js`
82. Retirer les 4 URLs Cloudinary codées en dur de `index.html`

### ⚠️ EN SUSPENS TECHNIQUE
58. `--blanc-pur-65` manquant dans le root CSS
59. Reste des `font-size` codés dur dans le CSS

### 🎨 VISUEL — CSS (consolidation progressive)
- Fusionner `.collection-section` (doublon)
- Fusionner `.texte-brut` (doublon)
- Supprimer `nav.scrolled` redondant
- Fusionner `.connexion-erreur` (doublon)
- Nettoyer classes mortes
- Variabiliser `0.78rem`, `0.68rem`, `0.62rem`, `0.82rem`, `0.88rem`
- Mettre `font-family: 'DM Sans'` dans le `body`
- Consolider `.fp-ing-row` et `.import-ing-row`
- Consolider les 3 `.section-texte-photo-* img`
- Corriger `/* truc */`, nettoyer lignes blanches, supprimer section vide
60. Refactoring classes CSS — consolider titres redondants
61. Renommer `ingredient-rangee` → `form-rangee`
62. Prix/g modal — refonte
63. Guide rapide — peaufiner
64. Taille texte mobile
65. Menu burger iPhone
66. Modal tablette
67. Taille texte mobile 16→20px
68. Spinner plus joli + partout
69. Hiérarchie typographique
70. Remplacer `<div>` par `<div class="page-entete-gauche">` dans 8 entêtes admin
71. Éliminer styles admin dupliqués
72. Fusionner doublons `style.css`
73. Grossir textes de lecture site public

### 💡 IDÉES À DÉVELOPPER
74. Pages huiles et additifs dynamiques
75. Bloc éditorial catalogue

---

## RÈGLE DE LIVRAISON — RAPPEL CRITIQUE
- Changement ciblé → trouve/remplace uniquement
- **Un seul changement à la fois — attendre confirmation**
- **Toujours indiquer le fichier en premier**
- Toujours lire les fichiers AVANT de proposer
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**
- **Toujours `node --check` avant de livrer un fichier JS complet**
- **Toujours livrer la ligne complète — jamais une partie de ligne**
- **Le Trouve doit être court et unique — pas le bloc complet**
- **Trouve et Remplace dans des blocs séparés — jamais dans le même bloc**
- **Toujours vérifier les références JS qui pointent vers un élément HTML retiré**
- **Toujours donner le bloc tel qu'il est dans le fichier — pas une version reconstruite de mémoire**

---

## RÈGLES CRITIQUES
- Un seul trouve/remplace à la fois
- Jamais de style inline dans JS/HTML
- Fin de tâche → dire COMMIT
- Le commit se fait dans GitHub Desktop après modifications dans Notepad+, puis vérification sur le web
- Pas de nouvelles = bonnes nouvelles — on passe à la suite sans confirmation
- Toujours demander OUI avant de coder — le OUI doit être explicite
- Ne jamais proposer de code tant que le OUI explicite n'est pas donné
- Ne jamais créer une nouvelle fonction si une existante peut être réutilisée
- Ne jamais créer une nouvelle classe CSS si une existante peut servir
- Toujours voir si un changement fait un changement ailleurs dans tout le site
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**
- **Ne jamais effacer ni modifier le contenu existant du brief — ajouts seulement**
- **Ne jamais écrire "le vrai problème" — analyser correctement dès le départ, une seule fois**
- **Le brief est mis à jour par Claude en fin de session ou sur demande — ajouts seulement, jamais d'effacement — avec résumé numéroté et horodaté, produit en fichier .md**
- **Expliquer en langage simple ce qu'on veut faire — pas en code — attendre le OUI — puis livrer le trouve/remplace**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷🐷🐷🐷🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

---

## 📝 SESSION DU 10 AVRIL 2026 — RÉSUMÉ (v49-v50)

### ✅ FAIT

1. **Règle GO ajoutée au protocole** — Le OUI doit être spontané, pas en réponse à une question de Claude.

2. **Commentaires titres ajoutés dans `admin/index.html`** — Chaque section et sous-section du `<main>` a maintenant un commentaire titre avec : nom de la section, fonctions JS concernées, classes CSS concernées, rappel d'impact.
   - Sections titrées : Accueil, Collections (liste/fiche/fiche-gamme/formulaire), Familles (liste/fiche/formulaire), Gammes (liste/fiche/formulaire), Produits (liste/fiche/formulaire), Nouvelle facture (étapes 1/2/3), Import facture PDF, Les factures, Inventaire, Fabrication, Inventaire production, Contenu du site, INCI, Import recettes, Densités, Médiathèque.

3. **Renommage CSS générique — classes fiche-collection-* → fiche-*** — dans `style.css` et `index.html`
   - `.fiche-collection-bandeau` → `.fiche-bandeau`
   - `.fiche-collection-slogan` → `.fiche-slogan`
   - `.fiche-collection-desc` → `.fiche-desc`
   - `.fiche-collection-extras-wrap` → `.fiche-extras-wrap`
   - `.fiche-collection-couleur` → `.fiche-couleur`
   - `.fiche-collection-photo` → `.fiche-photo`

4. **Uniformisation `form-collections` — pattern 3 blocs** — bandeau haut + espace + contenu + espace + bandeau bas.
   - **⚠️ MANQUEMENT DE CLAUDE** : changement HTML livré sans vérifier tous les impacts JS.

5. **Réparation création collection** — `fc-bloc-collection` et `fc-bloc-ligne` remis dans le HTML.

6. **Réparation formulaire gammes** — pattern 3 blocs appliqué, mécanisme cache/visible corrigé.
   - **⚠️ MANQUEMENT DE CLAUDE** : multiples fonctions JS référençaient des éléments HTML supprimés.

7. **Sélecteur de position collections** — champ Rang remplacé par un select Position. Fonctionne en création et en modification.

8. **Sélecteur de position gammes** — champ Rang remplacé par un select Position. Se met à jour quand on change la collection.

### 🔄 EN COURS — UNIFORMISATION DES FICHES ADMIN

**Objectif :** Toutes les fiches doivent avoir le même pattern 3 blocs.

**⚠️ LEÇON APPRISE — RÉPÉTÉE DEUX FOIS :**
Avant tout changement de structure HTML, grep TOUS les `classList`, `getElementById`, noms de fonctions liés à cet élément dans `admin.js`. Livrer les changements JS EN MÊME TEMPS que le HTML. Ne jamais dire "teste" avant d'avoir tout vérifié.

---

## 📝 SESSION DU 11 AVRIL 2026 — RÉSUMÉ (matin) — v51

### ✅ FAIT

1. **Pattern 3 blocs appliqué à toutes les sections admin** — bandeau coloré + espace + contenu + espace + boutons. Sections converties :
   - `fiche-ligne` (fiche gamme dans Collections)
   - `fiche-gamme` (section Gammes)
   - `fiche-famille` ✅
   - `fiche-recette` (fiche produit) ✅
   - `form-recettes` (formulaire produit) ✅
   - `form-gammes` ✅
   - `form-familles` ✅
   - `wizard-step-1`, `wizard-step-2`, `wizard-step-3` (Nouvelle facture)
   - `if-bloc-upload`, `if-apercu` (Import facture PDF)
   - `form-fabrication` (Fabrication)
   - Règle CSS consolidée : `#id .form-panel { display: block; }` pour chaque section

2. **Mécanisme visible → cache** — tous les éléments convertis utilisent maintenant `classList.remove('cache')` pour afficher et `classList.add('cache')` pour cacher. Plus de `classList.add/remove('visible')` pour ces éléments.

3. **Sélecteur de position collections** — champ Rang remplacé par select Position dans formulaire collection. Fonctionne en création et modification.

4. **Sélecteur de position gammes** — champ Rang remplacé par select Position dans formulaire gamme. Se met à jour selon collection choisie.

5. **Sélecteur de position familles** — champ Rang remplacé par select Position dans formulaire famille.

6. **Filtres produits alignés** — correction CSS `.admin-contenu .filtres-bar` pour aligner les filtres avec le reste du contenu sans affecter le catalogue public.

7. **Bouton Réinitialiser → ✕** dans les filtres produits.

8. **Caractère parasite `¸`** retiré de la section produits.

### 🔄 EN SUSPENS — NON FAIT CETTE SESSION
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)

### ⚠️ RÈGLE CSS PATTERN 3 BLOCS
La règle CSS qui force `display: block` sur les `form-panel` imbriqués est :
```css
#form-collections .form-panel, #form-gammes .form-panel, ... { display: block; }
```
À chaque nouvelle section convertie, ajouter son ID à cette liste dans `style.css`.

---

## 📝 SESSION DU 11 AVRIL 2026 — RÉSUMÉ (après-midi) — v52

### ✅ FAIT

1. **`saveMappingFournisseur_v2`** — nouvelle fonction ajoutée dans `code_v2.gs` + action `saveMappingFournisseur` dans `doPost`. Sauvegarde une ligne dans `Mapping_Fournisseurs_v2`.

2. **Import facture PDF — sauvegarde mapping automatique** — à la confirmation, chaque ligne assignée manuellement (sans mapping existant) est sauvegardée dans `Mapping_Fournisseurs_v2` avec le bon fournisseur.

3. **Import facture PDF — modale `modal-if-nouvel-ingredient`** — nouvelle modale dédiée à l'import avec 2 cas : catégorie existante + nouveau nom UC, ou nouvelle catégorie + nouveau nom UC. Sauvegarde dans `Ingredients_INCI_v2` ET `Mapping_Fournisseurs_v2`.

4. **Import facture PDF — blocage si lignes incomplètes** — impossible de confirmer si des lignes sans catégorie UC ou nom UC restent.

5. **Import facture PDF — Annuler remet `if-bloc-upload` visible**.

6. **Import facture PDF — "— Choisir —" en premier** dans le select fournisseur.

7. **Numéro de facture sauvegardé** — colonne `numero_facture` ajoutée en colonne K dans `Achats_Entete_v2`, passé à `createAchatEntete`, affiché dans le tableau des factures à la place du `ach_id`.

8. **Les factures — erreur de chargement corrigée** — `localeCompare` sur objet `Date` dans `getAchatsEntete_v2` — ajout `String()`.

9. **Les factures — dates en jj/mm/aaaa** — `dateAff` calculé côté JS, `dateRaw` conservé en ISO pour le tri et les filtres.

10. **Les factures — ordre des colonnes** — Fournisseur, Numéro, Date, Total, Statut.

11. **Les factures — bouton ✕ filtres** — classe `bouton-contour` au lieu de `btn-fermer-panneau`.

12. **`getVentesEntete_v2`** — même correction de date que `getAchatsEntete_v2`.

### 🔄 EN SUSPENS
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)
- Scraping autres fournisseurs (MH, Arbressence, DE) — parsers PDF à faire quand les PDFs seront disponibles

---

## 📝 SESSION DU 12 AVRIL 2026 — RÉSUMÉ — v53

### ✅ FAIT

1. **`js/parsers.js`** — nouveau fichier créé pour tous les parsers de factures PDF. Inclus dans `index.html` après `main.js`. `parserFacturePA` retiré de `admin.js` et déplacé dans `parsers.js`.

2. **`parserFactureAmazon`** — parser Amazon créé dans `parsers.js`. Fonctionne sur 8 factures testées. Extrait numéro, date, items, TPS, TVQ, sous-total.

3. **Amazon ajouté dans le select fournisseur** — `index.html`.

4. **`importerFacturePDF`** — branché sur `parserFactureAmazon` quand fournisseur = Amazon.

### 🔄 EN SUSPENS

- **Parser Amazon — debug à retirer** — ligne debug temporaire encore dans `admin.js` : `if (fournisseur === 'Amazon') { afficherMsg(...) return; }` — à retirer avant le prochain commit.
- **Parser Amazon — `lirePDF`** — pdf.js joint les items avec espace, ce qui produit une longue chaîne sans sauts de ligne. Le parser contourne ce problème en cherchant la zone entre `la pièce` et `Shipping charges`. Si le parsing échoue sur certains PDFs, revoir `lirePDF` pour préserver les sauts de ligne via `hasEOL` de pdf.js.
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)
- Scraping autres fournisseurs (MH, Arbressence, DE) — parsers PDF à faire quand les PDFs seront disponibles

---

## 📝 SESSION DU 12 AVRIL 2026 — RÉSUMÉ — v54

### ✅ FAIT

1. **Brief restauré** — Sections effacées par des Claude précédents réintégrées : Violations (26 items), Architecture complète (Vision Achats, Chargement mémoire, Fabrication, Médiathèque, Modal public, Cartes produits, Sections admin, Fichiers), Variables typographiques, Classes CSS, Piège doGet/doPost, Scrapers neutralisés, OÙ ON EST RENDU v43-v45, Backlog complet numéroté, Audit CSS, Notes.

---

## 📝 SESSION DU 15 AVRIL 2026 — RÉSUMÉ — v58

### ✅ FAIT

1. **Coût de revient — fonction utilitaire `calculerCoutRevient(ingredients)`** — ajoutée dans `admin.js`. Calcule `Σ (quantite_g × prix_par_g_reel × (1 + marge_perte_pct/100))`. Structure ouverte pour emballages et main-d'œuvre plus tard.

2. **Stock chargé à la demande** — `listesDropdown.stock` chargé dans `ouvrirFicheProduit()` seulement si pas encore en mémoire. Pas ajouté au `Promise.all` du démarrage pour ne pas ralentir le site.

3. **Fiche produit — coût de revient estimé et coût par unité** — affichés dans le bloc infos. Coût par unité = coût total ÷ `nb_unites`.

4. **Fiche produit — coût par ingrédient** — colonne ajoutée dans la liste des ingrédients à côté du poids. ⚠ affiché si prix manquant dans le stock.

5. **Bug `prix_par_g` — densité non appliquée** — dans `addAchatLigne_v2`, la conversion litres → grammes utilisait `× 1000` sans tenir compte de la densité. Corrigé : lecture de `Config_v2` et `Ingredients_INCI_v2` pour appliquer la bonne densité par catégorie.

6. **Recalcul des données historiques — `recalculerPrixParG_v2()`** — fonction one-shot créée, exécutée et supprimée. Recalcule `prix_par_g` et `prix_par_g_reel` dans `Achats_Lignes_v2` et met à jour `prix_par_g_reel` dans `Stock_Ingredients_v2` avec le dernier prix par ingrédient.

### 🔄 EN SUSPENS

- **Coût de revient — Fabrication** — nouveau lot et lot existant — à faire
- **Coût de revient — position dans la fiche** — `${coutHtml}` à déplacer dans le bloc infos en haut — à terminer
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)
- Scraping MH, Arbressence, DE — parsers PDF à faire quand les PDFs seront disponibles

---

## 📝 SESSION DU 14 AVRIL 2026 — RÉSUMÉ — v57

### ✅ FAIT

1. **Formulaire produit — Labels formats** — Labels Poids/Unité/Prix $ ajoutés au-dessus des champs de format. Visibles seulement quand il y a des formats (`#labels-formats-recette` avec classe `cache` géré dans `rafraichirListeFormatsRecette()`).

2. **Import facture PDF — fmtQte/fmtUnite** — Variables ajoutées dans `lignes.push` ET dans le destructuring du `.map()` de `confirmerImportFacture`.

3. **Modal nouvel ingrédient (import PDF)** — Bouton ✕ retiré du modal `modal-if-nouvel-ingredient`.

4. **Listes catégories — tri alphabétique** — 3 endroits corrigés : tableau import PDF (`if-type-`), modal `modal-if-cat`, select nom UC dans modal. Nom UC déjà trié, modal nom UC déjà trié.

5. **Nouvelle cat UC + nom UC en même temps** — Après création d'une nouvelle catégorie dans `modalIfConfirmer`, tous les selects `if-type-` sont mis à jour et la nouvelle cat est sélectionnée automatiquement.

6. **N° facture label** — "N° facture" → "N° facture (ou ajout d'inventaire)".

7. **Date préinscrite retirée** — `initialiserNouvelleFacture()` ne préremplit plus la date.

8. **Select type produit — IDs au lieu de noms** — `chargerListesFournisseurs()` recharge `categoriesMap` si vide.

9. **Cartes produits — couleur prix/poids** — Règles CSS ajoutées pour `.carte-infos-clair` et `.carte-infos-fonce` sur `.carte-format-prix` et `.carte-format-poids`.

10. **Filtres produits — bouton ✕ hauteur** — `align-self: stretch` ajouté sur `.admin-contenu .filtres-bar .bouton-petit`.

11. **Saisir depuis le catalogue** — Nouveau bouton dans Import PDF. Flux complet :
    - Appelle `getScrapingFournisseur` (nouvelle API dans `code_v2.gs`)
    - Numéro auto `MAN-XXX` (séquentiel depuis `Achats_Entete_v2`)
    - Date du jour préremplie
    - 2 selects Catégorie + Item pour choisir les lignes une à une
    - Champs FORMAT, QTÉ, PRIX UNIT éditables dans le tableau
    - Sous-total recalculé automatiquement à chaque changement de prix

12. **Bouton "Choisir un fichier"** — Input file caché, remplacé par `<label>` avec classe `bouton bouton-petit bouton-contour`. Nom du fichier affiché dans `#if-fichier-nom`.

13. **Bouton Filtres INCI** — Classes `btn btn-sm btn-outline` → `bouton bouton-petit bouton-contour`.

14. **Espace entre lignes de filtres INCI** — `margin-bottom: 8px` ajouté sur `.filtres-ligne`.

### 🔄 EN SUSPENS
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)
- Scraping MH, Arbressence, DE — parsers PDF à faire quand les PDFs seront disponibles
- **Saisir depuis le catalogue** — champs FORMAT, QTÉ, PRIX UNIT éditables ✅ mais le style inline `style="width:60px"` est à déplacer en CSS à l'occasion

---

## 📝 SESSION DU 13 AVRIL 2026 — RÉSUMÉ — v56

### ✅ FAIT

1. **Gammes — filtre par collections** — select injecté dynamiquement dans `afficherGammes()`, variable `filtreGammesColId` ajoutée.

2. **Gammes — ligne des produits dans la fiche** — `id="fiche-gamme-produits"` ajouté dans `index.html`, JS mis à jour dans `ouvrirFicheGamme2()`.

3. **Hex gammes/collections — calcul auto** — fonctions `averageHexColors`, `recalculerHexGamme_v2`, `recalculerHexCollection_v2`, `recalculerTousLesHex_v2` ajoutées dans `code_v2.gs`. Recalcul branché dans `saveProduit_v2`. Action `recalculerTousLesHex` exposée dans `doPost`. Boost saturation = 0.3 par défaut.

4. **Factures — X de fermeture dans le modal** — `position: relative` ajouté sur `.modal-admin` dans `style.css`.

5. **Inventaire — nom de catégorie au lieu du ID** — `listesDropdown.categoriesMap?.[cat] || cat` dans `chargerInventaire()` et `filtrerInventaire()`.

### 🔄 EN SUSPENS

- **Achats / Import PDF** — Bouton `+ NOUVEAU` par ligne à retirer — créer inline dans les dropdowns cat UC et nom UC — rediscuter avec screenshot
- **Lot existant** — Doit diminuer les ingrédients comme lors de la production d'un nouveau lot

---

## 📝 SESSION DU 16 AVRIL 2026 — RÉSUMÉ — v59

### ✅ FAIT

1. **`purearome.gs` — fonction `paro_mettreAJour()`** — fichier GAS autonome et complet créé. Récupère tous les produits via l'API panierdachat.app, compare avec les slugs existants dans `Scraping_PA_v2`, ajoute seulement les nouveaux avec scraping complet de la page produit (INCI, nom botanique, qualité, texte brut). Ne touche jamais aux lignes existantes.

2. **Méthodologie scraping documentée** — section "SCRAPING FOURNISSEURS — MÉTHODOLOGIE" ajoutée au brief. Couvre : approche générale, comment trouver l'API via DevTools, détails API Pure Arôme (IDs catégories, pagination, auth), et roadmap pour MH/Arbressence/DE.

3. **API Pure Arôme identifiée** — plateforme Panierdachat, 18 catégories connues (13 Produits + 5 Contenants et emballages), pagination par offset, déduplication par slug.

### 🔄 EN SUSPENS

- Scraping MH, Arbressence, DE — même approche, DevTools à faire quand disponibles
- Token Bearer Pure Arôme — valide ~1 an, à renouveler si expiration

---

## 📝 SESSION DU 16 AVRIL 2026 (suite) — RÉSUMÉ — v60

### ✅ FAIT

1. **Import PDF — unité ajoutée dans les selects format** — `unité` ajouté dans les 3 selects `if-fmt-unite-${idx}` de `admin.js` (lignes manuelles et lignes normales). Aucun impact sur le GS — `unité` n'est pas converti en grammes (grammes = formatQte).

2. **Modal facture — déplacé au niveau global** — `modal-facture` retiré de `section-factures` et placé avec les autres modaux globaux dans `index.html`. Corrige le problème où le modal était invisible après `confirmerImportFacture` (section parent cachée).

3. **Modal facture — titre affiche le numéro de facture** — `voirDetailFacture()` utilise maintenant `facture?.numero_facture || ach_id` au lieu de `ach_id`.

4. **Modal facture — bouton ✕ repositionné** — `.btn-fermer-panneau` : `position: absolute; top: 50%; transform: translateY(-50%)` retiré, remplacé par `align-self: flex-start`. Le flex `space-between` du header positionne correctement le X en haut à droite.

5. **Filtre dates factures — corrigé** — `dateRaw` utilisait `a.date.split('T')[0]` qui ne fonctionnait pas sur le format `jj/mm/aaaa` retourné par `getAchatsEntete_v2`. Corrigé : `a.date.split('/').reverse().join('-')` pour convertir en ISO `aaaa-mm-jj` compatible avec les inputs `type=date`.

6. **Import PDF — lignes manuelles — quantité et prix lus depuis le DOM** — `confirmerImportFacture` lisait `item.quantite` et `item.prixUnitaire` depuis `ifItems` qui n'était pas toujours à jour. Corrigé : lecture depuis `if-man-qte-${idx}` et `if-man-prix-${idx}` (IDs ajoutés aux inputs). Idem pour `fmtQte` et `fmtUnite` — lus depuis le DOM.

### 🔄 EN SUSPENS

- **Factures — modification d'une facture finalisée** — à faire (item 20)
- **Coût de revient — Fabrication** — nouveau lot et lot existant — à faire
- **Coût de revient — position dans la fiche** — `${coutHtml}` à déplacer dans le bloc infos en haut — à terminer
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)
- Scraping MH, Arbressence, DE — parsers PDF à faire quand les PDFs seront disponibles

---

*Univers Caresse — Confidentiel — v60 — 16 avril 2026*

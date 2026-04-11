⛔ PROTOCOLE OBLIGATOIRE — LIS CECI AVANT TOUT. SANS EXCEPTION.
ÉTAPE 1 — AVANT DE RÉPONDRE

Lis ce brief AU COMPLET.
Lis CHAQUE fichier fourni AU COMPLET.
Confirme à voix haute : "Brief lu. Fichiers lus. Prêt."
Si tu n'as pas tout lu — tu te tais et tu lis.

ÉTAPE 2 — AVANT DE PROPOSER UN CHANGEMENT
Tu dois pouvoir répondre aux 3 questions suivantes. Sinon tu ne proposes rien :

Qu'est-ce que ce changement touche directement ?
Qu'est-ce que ce changement touche ailleurs dans le site ?
Qu'est-ce qui existait avant et qui pourrait briser ?

ÉTAPE 3 — AVANT DE CODER

Tu attends un OUI explicite. Le mot OUI. Rien d'autre.
Un seul changement à la fois. Un. Pas une liste.
Livraison = trouve/remplace ciblé uniquement. Jamais le fichier complet sans permission explicite.
Jamais de style inline dans le HTML ou le JS.
Jamais créer une fonction ou classe CSS si une existante peut servir.

VIOLATION = ARRÊT IMMÉDIAT
Coder sans OUI · Livrer un fichier complet sans permission · Proposer plusieurs changements · Briser une fonctionnalité existante · Lire partiellement un fichier
Un site cassé à cause d'un changement non vérifié est une faute grave. On revient en arrière avant de continuer.


# BRIEF — CLAUDE TRAVAILLEUR
## Univers Caresse
### v39 — 7 avril 2026

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

---

## VIOLATIONS COMMISES LORS DE LA SESSION DU 7 AVRIL 2026
*(À transmettre à Anthropic via le bouton thumbs down)*

1. Deux changements livrés dans le même message sans attendre le OK entre les deux (`code_v2.gs` : fonctions + branchement doPost)
2. Répétition d'un trouve/remplace déjà livré (correction scroll produit affichée deux fois)
3. Création d'une classe CSS (`.collection-filtres-gammes`) sans vérifier si une classe existante suffisait — `.filtres-bar` existait déjà
4. Deux changements proposés simultanément sans attendre le OK (retrait CSS + modification JS dans le même message)
5. Code proposé sans attendre le OUI explicite après une constatation de violation
6. Variable `gammes` utilisée dans `construireCatalogue()` alors qu'elle n'existe pas dans ce scope — a cassé tout l'affichage public

## VIOLATIONS COMMISES LORS DE LA SESSION DU 7 AVRIL 2026 — SUITE
*(À transmettre à Anthropic via le bouton thumbs down)*

7. Proposer un trouve/remplace avec un texte qui ne correspondait plus au fichier actuel (`.filtres-bar` avec `padding: 20px` alors que le padding avait déjà été retiré)
8. Proposer seulement 2 options au lieu de jaser pour trouver la meilleure solution ensemble
9. Coder sans attendre le OUI/OK — a livré un CSS sans confirmation explicite

---

### V2 = même visuel que V1, nouveau moteur
Le travail visuel de la V2 (style2.css, index.html V2) est mis de côté.
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

## PROJET — FICHIERS ET URLS

### V1 — EN PRODUCTION — NE PAS TOUCHER AU MOTEUR
- Fichiers : `index.html`, `index_-_Admin.html`, `main.js`, `admin.js`, `css/style.css`, `code.gs`
- **Apps Script URL V1 :** `https://script.google.com/macros/s/AKfycbwwiGLwj8QJ6c5dGEtPEHUojzdbdncsTXnmEn-LJJxg7xBeckcbiCX1bvkMb3E3ba1FEA/exec`

### V2 — EN CONSTRUCTION — repo UC2
- Site UC2 : `https://universcaresse.github.io/UC2/`
- Admin UC2 : `https://universcaresse.github.io/UC2/admin/`
- Fichiers : `index.html`, `admin/index-admin.html`, `css/style.css`, `js/main.js`, `js/admin.js`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL V2 :** `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`
- **Projet Apps Script V2 :** `uc2` — séparé du V1, ne jamais les mélanger
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
- **Règle** : un élément c'est un élément partout — titre, bouton, carte, badge, formulaire. Avant tout changement CSS, inventorier toutes les occurrences de cet élément dans le site et uniformiser globalement plutôt que corriger en isolation
- **Règle** : un seul système de boutons — `.bouton` est la base, les variantes ajoutent seulement la couleur ou le padding. Ne jamais créer de classe bouton qui répète les propriétés de base
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
**Achats_Entete_v2** — ACH-id, date, FOUR-id, sous_total, tps, tvq, livraison, total, facteur_majoration, statut
**Achats_Lignes_v2** — ACH-id, ING-id, format_qte, format_unite, prix_unitaire, prix_par_g, prix_par_g_reel, quantite, prix_total, notes
**Stock_Ingredients_v2** — ING-id, qte_g, prix_par_g_reel, date_derniere_maj
**Lots_v2** — LOT-id, PRO-id, multiplicateur, nb_unites, date_fabrication, date_disponibilite, cout_ingredients, cout_emballages, cout_revient_total, cout_par_unite, statut
**Ventes_Entete_v2** — VEN-id, date, client, total, statut
**Ventes_Lignes_v2** — VEN-id, PRO-id, LOT-id, quantite, prix_unitaire, prix_total
**Contenu_v2** — cle, valeur

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

---

## 🏗️ ARCHITECTURE V2 — VISION ACHATS

### Principe fondamental
**Tout passe par les achats** — ingrédients, contenants, emballages, équipement. Une seule porte d'entrée.

### Formule $/g
- **$/g brut** = prix_unitaire ÷ grammes
- **$/g réel** = $/g brut × facteur_taxes
- Conversions : kg×1000, L×1000×densité, ml×densité, lbs×453.592

### Import PDF
- PDF lu via **PDF.js** directement dans le navigateur
- Parser Pure Arôme livré — Amazon à finaliser après confirmation Chantal
- Mapping automatique via `Mapping_Fournisseurs_v2`

---

## 🏗️ ARCHITECTURE — CHARGEMENT EN MÉMOIRE

### Public (main.js)
- `donneesCatalogue` — variable globale contenant produits, collections, infoCollections
- Navigation entre sections = instantané, zéro appel réseau supplémentaire

### Admin (admin.js)
- `donneesCollections`, `donneesGammes`, `donneesFamilles`, `donneesProduits`, `listesDropdown` — chargés une fois au démarrage
- `donneesProduits` inclut maintenant les formats joints (chargés via `getProduitsFormats` au démarrage) ✅ v36
- `ifMapping` — chargé une fois à l'accès à la section import facture
- `_mediathequeDonnees` — chargé une fois à l'accès à la section médiathèque
- **Toutes les variables globales sont déclarées avec `var` en tête de fichier**

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
- ⚠️ En V2 : le champ INCI n'est pas encore joint dans getCataloguePublic_v2 — à compléter

---

## 🏗️ ARCHITECTURE — CARTES PRODUITS (PUBLIC ET ADMIN)
- Les deux utilisent les mêmes classes CSS : `carte-produit`, `carte-visuel`, `carte-couleur`, `carte-infos`, `carte-collection-badge`, `carte-nom`, `carte-ligne`, `carte-bas`, `carte-formats`, `carte-format-tag`
- Admin ajoute `.carte-statut-badge` (position absolute sur l'image, coin haut-gauche)
- `couleurTexteContraste()` → seuil `> 0.5` dans les deux fichiers (aligné en v36)
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
4. Formulaires : `.form-panel` — afficher/masquer avec `classList.add/remove('visible')` uniquement

---

## 🏗️ ARCHITECTURE — FICHIERS V2

| Fichier | État |
|---|---|
| `index.html` | ✅ V1 copié dans UC2 — base visuelle |
| `admin/index-admin.html` | ✅ Adapté V2 — IDs et textes mis à jour |
| `css/style.css` | ✅ En consolidation progressive |
| `js/main.js` | ✅ Réécrit V2 — livré 6 avril — fonctionnel |
| `js/admin.js` | ✅ Réécrit V2 — corrigé 7 avril — en test |
| `code.gs` V1 | ✅ NE JAMAIS TOUCHER |
| `code_v2.gs` | ✅ Corrigé et redéployé 7 avril — projet `uc2` |

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

**Principe** : les variables sont nommées par leur valeur numérique, pas par leur usage. Disponibles pour tout élément du site.

---

## CLASSES CSS — UN SEUL SYSTÈME (V1 — style.css)

| Classe | Usage |
|---|---|
| `.page-entete` | Conteneur entête |
| `.page-entete-gauche` | Conteneur texte gauche |
| `.page-entete-eyebrow` | Sur-titre |
| `.page-entete-titre` | Grand titre |
| `.fade-in` / `.fade-in-doux` | Animations |
| `.cache` | `display: none !important` |
| `.accordeon-detail` | Ligne détail sous tableau |
| `.ligne-validee` | Fond vert pâle |
| `.texte-brut` | Zone texte brut sélectionnable |
| `.ligne-cliquable` | `<tr>` cliquable |
| `.ligne-rouge` | Ligne item non mappé dans aperçu import |
| `.carte-admin` | Carte générique |
| `.carte-admin-entete` | Entête de carte |
| `.champ-avec-reset` | Input + bouton X |
| `.btn-reset-champ` | Bouton X |
| `.texte-secondaire` | Texte gris 0.85em |
| `.bouton` | Bouton de base — vert plein, texte blanc, centré |
| `.bouton-rouge` | Variante rouge — `background: var(--danger)` seulement |
| `.bouton-or` | Variante or — `background: var(--accent)` seulement |
| `.bouton-vert-pale` | Variante vert pâle — `background: var(--primary-10); color: var(--primary)` |
| `.bouton-contour` | Variante contour — transparent + bordure beige |
| `.bouton-petit` | Modificateur padding petit |
| `.bouton-grand` | Modificateur padding grand |
| `.btn-fermer-panneau` | Bouton X fermeture panneau |
| `.btn-edit` | Bouton édition inline (INCI) |
| `.btn-suppr` | Bouton suppression inline (INCI) |
| `.form-ctrl`, `.form-groupe`, `.form-label` | Formulaires |
| `.msg-zone` | Zone messages |
| `.separateur` | Ligne séparatrice |
| `.form-panel` | Panneau formulaire — `display:none` par défaut |
| `.form-panel.visible` | Panneau visible |
| `.carte-produit` | Carte produit (public et admin) |
| `.carte-visuel`, `.carte-couleur`, `.carte-infos` | Structure carte produit |
| `.carte-collection-badge`, `.carte-nom`, `.carte-ligne` | Textes carte produit |
| `.carte-bas`, `.carte-formats`, `.carte-format-tag` | Bas de carte avec formats |
| `.carte-statut-badge` | Badge statut admin (position absolute, coin haut-gauche) |
| `.nav-lien` | *(défini mais pas encore appliqué dans le HTML — v36)* |
| `.filtres-bar` | Barre de filtres (public sticky + admin inline) |
| `.collection-filtres-gammes` | Filtres gamme inline sous description collection |
| `.famille-groupe` | Conteneur groupe famille dans le catalogue |
| `.famille-groupe-titre` | Titre de famille — Playfair vert, border-bottom 2px |
| `.recette-cartes-grille` | Grille de cartes produits admin |
| `.recette-section-collection`, `.recette-section-ligne` | Groupements par collection/gamme admin |
| `.recette-collection-titre`, `.recette-ligne-titre` | Titres de section admin |
| `.recette-couleur-overlay` | Overlay gradient sur les cartes (public et admin) |

---

## ⚠️ PIÈGE — doGet vs doPost
- `appelAPIPost` → `doPost`
- `appelAPI` → `doGet`
- Ne jamais retirer les branchements existants

---

## ⚠️ RÈGLE — Livraison trouve/remplace
- **Toujours indiquer le fichier en premier**
- Le **Trouve** doit être court et unique
- **Trouve** et **Remplace** dans des blocs séparés
- Ne jamais mettre Trouve et Remplace dans le même bloc de code
- **Toujours livrer la ligne complète — jamais une partie de ligne**

---

## Scrapers neutralisés — NE PAS RELANCER
- `purearome.gs`, `mauvaisesherbes.gs`, `arbressence.gs`, `divineessence.gs` ⛔
- `scraper_url_v2.gs` — SEUL actif

---

## 📍 OÙ ON EST RENDU — 7 avril 2026

### ✅ Fait cette session (v36)

**Bugs réglés :**
- **Bug scroll aléatoire après modification produit** — `admin.js` : `scrollTo(0,0)` ajouté après `chargerProduitsData()` dans `sauvegarderRecette()`
- **Bug description gamme absente côté public** — `code_v2.gs` : `desc_gamme` ajouté dans `getCataloguePublic_v2()` / `main.js` : affichage sous le nom de gamme
- **Bug interface catégories UC inaccessible** — `code_v2.gs` : `saveCategorieUC_v2` et `deleteCategorieUC_v2` ajoutées + branchées / `admin.js` : accordéon Catégories UC restauré, fonctions `inciRendreUC`, `inciAjouterUC`, `inciModifierUC`, `inciSupprimerUC` réécrites
- **Bug navigation flèche retour sort de l'admin** — `admin.js` : `history.pushState` à chaque `afficherSection()` + écouteur `popstate`

**Améliorations livrées :**
- **Cartes produits admin = style public** — `admin.js` : classes `recette-*` → `carte-*` / `style.css` : nettoyage classes `recette-*` devenues inutiles + `.carte-statut-badge` ajouté
- **Badge statut sur l'image** (coin haut-gauche, position absolute) — `admin.js` + `style.css`
- **Filtres gamme sous la description de collection** — `index.html` : retrait `filtres-gammes` de la filtres-bar / `main.js` : filtres inline dans chaque section collection + `filtrerGamme()` adaptée
- **Mode saisonnier déplacé sous mode maintenance** — `index-admin.html`
- **Textes "Recette" → "Produit"** dans l'état vide admin — `index-admin.html`
- **Formats chargés au démarrage admin** — `admin.js` : `getProduitsFormats` ajouté au `Promise.all` initial, formats joints à `donneesProduits`
- **Seuil couleurTexteContraste aligné** — `admin.js` : `> 0.6` → `> 0.5` (aligné avec `main.js`)

**CSS consolidé :**
- Variables typographiques renommées (`--texte-micro` → `--texte-70`, etc.) + `--texte-85` ajouté
- Nav publique et admin consolidées : règle partagée `.nav-links a, .nav-admin-btn` pour les propriétés communes
- `.nav-dropdown-item` aligné à `var(--texte-85)`
- Nettoyage classes `recette-*` de la carte (suppression des lignes CSS inutiles)

---

## 📋 AUDIT CSS — style.css (7 avril 2026)

### Doublons confirmés à corriger
- `.collection-section` défini deux fois (lignes 708-709) — à fusionner
- `.filtres-bar` défini deux fois (lignes 702 et 884) — intentionnel (public vs admin) mais à documenter
- `.texte-brut` défini deux fois (lignes 1348 et 1352) — à fusionner
- `nav.scrolled { box-shadow: none; }` défini deux fois (lignes 217-218) — ligne 218 redondante
- `.connexion-erreur` défini deux fois (lignes 1251 et 1262) — à fusionner

### Classes probablement mortes — à vérifier avant de supprimer
- `.recettes-grille` — `display: block` seulement, probablement mort
- `.recette-statut-badge`, `.recette-statut-public`, `.recette-statut-test`, `.recette-statut-droite`
- `.recette-bas`, `.recette-format`
- `.burger` — à vérifier si encore utilisé dans le HTML public
- `.btn-connexion`, `.btn-deconnexion`, `.btn-nav-admin`, `.nav-badge`
- `.delay-1` à `.delay-5`
- `.section-bientot`
- `.collection-ligne-item`, `.collection-ligne-nom`, `.collection-ligne-format`, `.collection-ligne-actions`
- `.mt-24`, `.text-right`, `.btn-ajouter-ingredient`
- `.citation-guillemet`
- `.edu-liens`

### Valeurs codées dur à variabiliser (au fur et à mesure)
- `0.85rem` — plusieurs occurrences sans `var(--texte-85)`
- `0.78rem`, `0.68rem`, `0.62rem`, `0.82rem`, `0.88rem` — sans variable
- `font-family: 'DM Sans', sans-serif` — répété des dizaines de fois (candidat pour le `body`)
- `1.8rem`, `2rem`, `1.1rem`, `1.3rem`, `1.6rem`, `2.2rem` — tailles de titres codées dur sans variable

### Candidats à la consolidation
- `.fp-ing-row` et `.import-ing-row` — presque identiques
- `.section-texte-photo-16-9 img`, `.section-texte-photo-3-4 img`, `.section-texte-photo-auto img` — partagent les mêmes 4 propriétés
- `font-family: 'DM Sans', sans-serif` dans `body` → éliminerait des dizaines de déclarations

### Commentaire à corriger
- Ligne 1266 : `/* truc */` — à renommer ou supprimer

### Lignes mortes / parasites
- Lignes 905-914 : 10 lignes blanches consécutives — à nettoyer
- Section `/* ADMIN — EN-TÊTE DE PAGE */` (lignes 782-785) : vide — à supprimer

---

### ✅ Fait cette session — suite (v39)

**Performance :**
- Chargement parallèle `getContenu` + `getCatalogue` via `Promise.all` — `main.js`

**Système de boutons refait au complet :**
- Toutes les classes `btn-*` remplacées par `.bouton` + variantes dans `style.css`, `index.html`, `index-admin.html`, `admin.js`
- `.bouton` = base unique. Variantes : `.bouton-rouge`, `.bouton-or`, `.bouton-vert-pale`, `.bouton-contour`, `.bouton-petit`, `.bouton-grand`

**Bugs réglés :**
- Modal sans photo — hex prend toute la hauteur, couleur texte prix adaptée via `couleurTexteContraste()`
- `filtrerGamme()` — filtre la bonne collection au lieu de toujours la première
- Formats triés du plus petit au plus grand — `main.js` (carte + modal) + `admin.js`

**Catalogue public — architecture famille :**
- `code_v2.gs` — `getCataloguePublic_v2` retourne maintenant `fam_id`, `nom_famille`, `rang_famille`, `rang_gamme`
- `main.js` — `construireCatalogue()` groupe par famille → gamme
- Tri par rang collection → rang famille → rang gamme
- **Redéploiement `code_v2.gs` requis** ✅

**CSS consolidé :**
- Séparateur entre collections : trait vert 3px, largeur jusqu'à la photo (`calc(100% - 340px - 48px)`), padding-top 48px
- `.carte-nom` — `min-height: 2.52rem` (2 lignes réservées)
- `.collection-filtres-gammes` — doublon supprimé, titre aligné à gauche
- `.famille-groupe` + `.famille-groupe-titre` ajoutés

**HTML :**
- "Nos *collections*" — `<em>` ajouté
- Plumes supprimées des 3 en-têtes (catalogue, bon à savoir, contact)
- Courriel contact corrigé — `universcaresse@outlook.com`
- Liens EDU page 3 → collections avec `filtrerApresChargement` (COL-001, COL-002, COL-005)
Tester section par section dans UC2 et corriger les erreurs :
1. Section Collections — modifier, supprimer ✅ (corrigé)
2. Section Familles — ajouter, modifier, supprimer — à tester
3. Section Produits — chargement ✅, ajout, modification
4. Nouvelle facture — wizard complet
5. Fabrication — lots chargent, nouveau lot, lot existant

### 🔴 À FAIRE APRÈS LES TESTS
- M3. Continuer tests et corrections `admin.js` section par section
- M5. INCI dans modal public — join dans `getCataloguePublic_v2`
- M6. Passe 2 `admin.js` — nettoyage et consolidation
- Implémenter `saveIngredientInci` côté admin (page INCI — édition et sauvegarde)

---

### 🔴 Bugs connus à régler
83. X et Annuler ne ferment pas le formulaire fabrication
84. Confirmer lot existant ne fonctionne plus
85. Choix de gamme dans formulaire fabrication (collection → gamme → produit)
86. Modifier titre produit ne sauvegarde pas
87. Navigation flèches navigateur → ramène au login ✅ réglé v36
88. Après modif produit → repositionner sur le produit modifié ✅ réglé v36 (scroll haut)
89. Champ Gamme se remplit seul à l'ajout produit
90. Liste gammes pas en ordre alphabétique dans formulaire produit

---

### ⚠️ En suspens technique
- INCI dans modal produit public — champ non joint dans getCataloguePublic_v2
- `--blanc-pur-65` manquant dans le root CSS
- Reste des `font-size` codés dur dans le CSS
- Affichage $/g brut et réel dans tableau items facture
- Affichage adaptatif $/L, $/kg, $/100g
- Parser Amazon — après confirmation Chantal sur structure PDF

---

## 💡 IDÉES À DÉVELOPPER
- Coût de revient complet (ingrédients + contenant + emballage + équipement amorti)
- Pages huiles et additifs dynamiques
- Bloc éditorial catalogue
- Présentation formats/prix — tableau ou tuiles
- Spinner sur chaque bouton d'action pendant appel API
- Vider tous les champs après chaque sauvegarde/annulation (global)
- Collections — façon de regrouper les fragrances

---

## 🎯 TOUTES LES TÂCHES À FAIRE — NUMÉROTÉES

### ⚠️ MIGRATION V2 — EN COURS
~~M1. Réécrire `main.js` pour APIs V2~~ ✅
~~M2. Réécrire `admin.js` pour APIs V2~~ ✅ Passe 1
M3. Tester et corriger `admin.js` section par section — EN COURS
~~M4. Adapter `index-admin.html` — textes V1 ("Recettes", "Lignes") → V2 ("Produits", "Gammes")~~ ✅
~~CSS — Barre filtres collections : padding + border-bottom restaurés~~ ✅ (session 7 avril)
~~CSS — Barre filtres gammes : `.collection-filtres-gammes` créée — layout colonne, align-items flex-start, padding, border~~ ✅ (session 7 avril)
~~JS — Label gammes : `filtre-label` → `page-entete-titre` avec `<em>de la collection ${nom}</em>`~~ ✅ (session 7 avril)
~~JS — Boutons gammes enveloppés dans `<div class="filtres-ligne">`~~ ✅ (session 7 avril)
M5. INCI dans modal public — join dans getCataloguePublic_v2
M6. Passe 2 admin.js — nettoyage

### ⚠️ LÉGAL / URGENT
1. Bloquer statut `public` si INCI incomplets ⚠️ LÉGAL
2. Synchronisation mémoire JS — `listesDropdown.fullData` après `inciValider()`
3. Bouton INCI — Envoyer au graphiste par courriel + bloqué si incomplets

### 🏭 FABRICATION — BUGS À RÉGLER
83. X et Annuler ne ferment pas le formulaire fabrication
84. Confirmer lot existant ne fonctionne plus
85. Ajouter choix de gamme dans formulaire fabrication
86. Modifier titre produit ne sauvegarde pas
89. Champ Gamme se remplit seul à l'ajout produit
90. Liste gammes pas en ordre alphabétique dans formulaire produit

### 🏭 FABRICATION — AMÉLIORATIONS
- Modification d'un lot de production existant — À FAIRE

### 📄 FACTURES / ACHATS
4. Finaliser `afficherApercuItems` + `ifFiltrerNoms` + `ifAjouterNomUC` + `ifConfirmerNomUC`
5. Parser Amazon — après confirmation Chantal
6. Affichage $/g brut et réel dans tableau items facture
7. Affichage adaptatif $/L, $/kg, $/100g
8. Gestion emballages/contenants dans achats
9. Templates emballages imprimés

### 🏗️ ARCHITECTURE
10. INCI dans modal public — join dans getCataloguePublic_v2
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
- iPad portrait — Photos collections : format à revoir

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
- Nettoyer classes mortes (liste dans audit CSS)
- Variabiliser `0.78rem`, `0.68rem`, `0.62rem`, `0.82rem`, `0.88rem`
- Mettre `font-family: 'DM Sans'` dans le `body` pour éliminer les répétitions
- Consolider `.fp-ing-row` et `.import-ing-row`
- Consolider les 3 `.section-texte-photo-* img`
- Corriger commentaire `/* truc */`
- Nettoyer 10 lignes blanches (905-914)
- Supprimer section vide `/* ADMIN — EN-TÊTE DE PAGE */`
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
- **Analyser le comportement global avant de coder**
- **Ne jamais proposer un changement sans avoir lu le code concerné au complet**
- **Toujours `node --check` avant de livrer un fichier JS complet**
- **Toujours livrer la ligne complète — jamais une partie de ligne**

---

## RÈGLES CRITIQUES
- Un seul trouve/remplace à la fois
- Jamais de style inline dans JS/HTML
- Fin de tâche → dire COMMIT
- Toujours demander OUI avant de coder — le OUI doit être explicite
- Ne jamais créer une nouvelle fonction si une existante peut être réutilisée
- Ne jamais créer une nouvelle classe CSS si une existante peut servir
- Toujours voir si un changement fait un changement ailleurs dans tout le site
- Lors du refactoring, procéder une étape à la fois et attendre un OK avant de passer à la suivante
- **Ne jamais afficher un nom d'ingrédient à la place d'un code INCI — illégal**
- **Ne jamais passer au statut public sans INCI complets**
- **Ne jamais effacer ni modifier le contenu existant du brief — ajouts seulement**
- **Le Trouve doit être court et unique — pas le bloc complet**
- **Trouve et Remplace dans des blocs séparés — jamais dans le même bloc**
- **Toutes les variables globales dans `admin.js` = `var` obligatoire**
- **Expliquer en langage simple ce qu'on veut faire — pas en code — attendre le OUI — puis livrer le trouve/remplace**

---

## NOTES

### ⏱️ Gestion du temps
Un "petit 15 minutes" = compter la journée.

### 🐷🐷🐷🐷🐷 Caractère de Jean-Claude
Tête dure. Feature, pas bug.

---

*Univers Caresse — Confidentiel — v39 — 7 avril 2026*

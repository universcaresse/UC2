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
### v50 — 10 avril 2026

> 📦 **Historique complet des sessions dans** `Brief_Univers_Caresse_ARCHIVES.md`

---

### Le projet — état actuel
- **Moteur** → `code_v2.gs`, sheets `_v2`, APIs V2
- **JS** → `main.js` et `admin.js` — réécrits V2 ✅
- **Brief de référence** → ce document

---

## PROJET — FICHIERS ET URLS

- Site : `https://universcaresse.github.io/UC2/`
- Admin : `https://universcaresse.github.io/UC2/admin/`
- Fichiers : `index.html`, `admin/index-admin.html`, `css/style.css`, `js/main.js`, `js/admin.js`, `code_v2.gs`
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`
- **Projet Apps Script :** `uc2`
- GitHub : `https://github.com/universcaresse/univers-caresse`

---

## ⚠️ RAPPEL CRITIQUE — Apps Script
Après tout changement dans `code_v2.gs` → **redéployer obligatoirement** :
Déployer → Gérer les déploiements → Nouvelle version → Déployer

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
| saveGammeIngredients | saveGammeIngredients_v2(data) |
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

---

## 📋 BACKLOG

### 🔧 À FAIRE
1. Mosaïque hero dynamique
2. Textes Sheet → Markdown
3. Comment acheter
4. Actualités automatiques
5. FAQ admin
6. Pages FAQ, conditions, retours
7. Courriel confirmation commande
8. Affichage délais
9. INCI EU CosIng
10. Commande légère
11. Photo par gamme
12. Calculateur SAF
13. Coût de revient complet
14. Scan factures
15. Comptabilité
16. Masquer contenu ouverture
17. Inverser Modifier/Supprimer
18. Photos en double
19. Tuiles collections
20. Bouton Modifier modal facture
21. Factures — filtre produit
22. Modal facture complète
23. Filtres inventaire
24. Inventaire — séparation
25. Masquer liste édition
26. Notes importantes
27. Prix/g réel à la finalisation
28. Domaine universcaresse.ca
29. Catalogue PDF
30. Amortissement équipement
31. Module Vente
32. Mode focus
33. Scroll haut auto
34. Uniformiser consultation
35. Boutons en bas
36. Menu Système — réordonner
37. Fade-in contenu sections
38. Retirer flèche "Découvrir"

### 📱 RESPONSIVE — À FAIRE
- iPhone — Filtres collections : présentation à revoir

### 📷 MÉDIATHÈQUE PHOTOS
- Ajouter clés photo dans Sheet `Contenu_v2` pour les 4 photos éditoriales
- Brancher ces clés dans `appliquerContenu()` dans `main.js`
- Retirer les 4 URLs Cloudinary codées en dur de `index.html`

### ⚠️ EN SUSPENS TECHNIQUE
- `--blanc-pur-65` manquant dans le root CSS
- Reste des `font-size` codés dur dans le CSS

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
- Refactoring classes CSS — consolider titres redondants
- Renommer `ingredient-rangee` → `form-rangee`
- Prix/g modal — refonte
- Guide rapide — peaufiner
- Taille texte mobile
- Menu burger iPhone
- Modal tablette
- Taille texte mobile 16→20px
- Spinner plus joli + partout
- Hiérarchie typographique
- Remplacer `<div>` par `<div class="page-entete-gauche">` dans 8 entêtes admin
- Éliminer styles admin dupliqués
- Fusionner doublons `style.css`
- Grossir textes de lecture site public

### 💡 IDÉES À DÉVELOPPER
- Pages huiles et additifs dynamiques
- Bloc éditorial catalogue

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
- **Toujours vérifier les références JS qui pointent vers un élément HTML retiré**

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

## 📝 SESSION DU 10 AVRIL 2026 — RÉSUMÉ

### ✅ FAIT

1. **Règle GO ajoutée au protocole** — Le OUI doit être spontané, pas en réponse à une question de Claude.

2. **Commentaires titres ajoutés dans `admin/index.html`** — Chaque section et sous-section du `<main>` a maintenant un commentaire titre avec : nom de la section, fonctions JS concernées, classes CSS concernées, rappel d'impact.

3. **Renommage CSS générique — classes fiche-collection-* → fiche-*** — dans `style.css` et `index.html`

4. **Uniformisation `form-collections` — pattern 3 blocs** — bandeau haut + espace + contenu + espace + bandeau bas.
   - **⚠️ MANQUEMENT DE CLAUDE** : changement HTML livré sans vérifier tous les impacts JS.

5. **Réparation création collection** — `fc-bloc-collection` et `fc-bloc-ligne` remis dans le HTML. Ces deux divs avaient été retirés par Claude dans une session précédente sans vérifier les impacts JS.

6. **Réparation formulaire gammes** — pattern 3 blocs appliqué, mécanisme cache/visible corrigé, `sauvegarderGamme2`, `modifierGamme`, `supprimerGamme` corrigés pour utiliser les champs `fg-*` du nouveau formulaire.
   - **⚠️ MANQUEMENT DE CLAUDE** : multiples fonctions JS (`modifierGamme`, `supprimerGamme2`, `modifierGamme2`) référençaient des éléments HTML supprimés — auraient dû être vérifiées et corrigées en même temps que le changement HTML.

7. **Sélecteur de position collections** — champ Rang remplacé par un select Position ("En premier" / "Après X") dans le formulaire collection. Fonctionne en création et en modification.

8. **Sélecteur de position gammes** — champ Rang remplacé par un select Position dans le formulaire gamme. Se met à jour quand on change la collection. Fonctionne en création, modification et suppression.

### 🔄 EN COURS — UNIFORMISATION DES FICHES ADMIN

**Objectif :** Toutes les fiches (gamme, famille, produit) doivent avoir le même pattern 3 blocs que la fiche collection.

**Fiches à uniformiser :**
- [x] `form-collections` (formulaire collection) ✅
- [x] `form-gammes` (formulaire gamme) ✅
- [ ] `fiche-ligne` (fiche gamme dans Collections)
- [ ] `fiche-gamme` (section Gammes)
- [ ] `fiche-famille`
- [ ] `fiche-recette` (fiche produit)

**⚠️ LEÇON APPRISE — RÉPÉTÉE DEUX FOIS :**
Avant tout changement de structure HTML, grep TOUS les `classList`, `getElementById`, noms de fonctions liés à cet élément dans `admin.js`. Livrer les changements JS EN MÊME TEMPS que le HTML. Ne jamais dire "teste" avant d'avoir tout vérifié. Cette règle a été violée à répétition cette session — temps perdu considérable.

---

*Univers Caresse — Confidentiel — v50 — 10 avril 2026*

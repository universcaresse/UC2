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
### v51 — 11 avril 2026

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

### Actions API V2 — doGet / doPost
Voir v50 pour la liste complète.

---

## 📋 BACKLOG — voir v50 pour liste complète

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

## 📝 SESSION DU 10 AVRIL 2026 — RÉSUMÉ (v49-v50)
Voir brief v50 pour détails complets.

---

## 📝 SESSION DU 11 AVRIL 2026 — RÉSUMÉ

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

### ⚠️ COLONNE AJOUTÉE — Achats_Entete_v2
- Colonne K = `numero_facture` — ajoutée manuellement dans la sheet

### 🔄 EN SUSPENS
- `form-densites` — pattern 3 blocs + mécanisme cache (reporté)
- Section Contenu du site — `form-panel visible` à convertir (reporté)
- Scraping autres fournisseurs (MH, Arbressence, DE) — parsers PDF à faire quand les PDFs seront disponibles

---

*Univers Caresse — Confidentiel — v52 — 11 avril 2026*

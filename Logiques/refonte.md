# BRIEF — UNIVERS CARESSE
## Document de continuité entre conversations

---

## CONTEXTE DU PROJET

Site web pour **Univers Caresse**, une savonnerie artisanale.

**Architecture :**
- Site public + interface admin sur la même base
- Backend = Google Apps Script + Google Sheets
- Frontend = HTML/CSS/JS pur (pas de framework)
- Cloudinary pour les images
- Square pour les paiements

**Structure des fichiers JS admin :**
Un fichier par section (admin-collections.js, admin-produits.js, etc.) plus :
- `main.js` — site public + utilitaires
- `admin.js` — navigation et init admin
- `style.css` — un seul CSS pour public et admin

---

## RÈGLES DE TRAVAIL — PROFIL JEAN-CLAUDE

### Comportement général
- Réponses et explications brèves
- Proposer une solution directement — pas expliquer le problème
- Toujours résumer la demande avant de commencer pour valider la compréhension
- Ne jamais suggérer pause, repos, sommeil, ou faire référence à l'heure
- Pas d'emoji qui rit quand un problème ne se règle pas

### Avant de coder
- Demander une autorisation explicite — attendre le OUI avant de coder. "OK" = j'ai fait la modification OU oui à une question
- Lire et comprendre le brief fourni en début de session — s'y conformer strictement
- Analyser l'impact global d'un changement sur tout le site AVANT de proposer quoi que ce soit
- Vérifier dans style.css si une classe existante peut être réutilisée avant tout changement CSS

### Pendant le code
- Ne jamais ajouter de style inline dans le JS ou le HTML
- Ne jamais créer une nouvelle fonction ou classe CSS si une existante peut être réutilisée
- Un seul changement à la fois — attendre la confirmation avant le suivant
- Lors du refactoring : une étape à la fois, attendre un OK avant de continuer
- Quand "réécrit" est demandé : retourner le bloc AU COMPLET sans rien enlever ni modifier sauf ce qui est demandé
- Ne pas montrer l'analyse technique — résumer la solution en langage simple

### Livraison du code — CRITIQUE
- Changement ciblé → livraison par trouve/remplace uniquement — jamais le fichier complet
- Changement majeur → demander la permission — attendre le OUI
- Jamais livrer un fichier complet sans permission explicite

### Suivi
- Suivi des changements en attente → garder en mémoire tout changement non confirmé — redemander si c'est réglé
- Commits GitHub → ne jamais en demander, Jean-Claude gère
- Fin de tâche → dire COMMIT puis proposer la prochaine tâche

### Violations interdites
- Coder sans attendre le OUI explicite
- Ajouter du style inline dans le HTML ou le JS
- Livrer un fichier complet sans permission
- Proposer plusieurs changements en même temps
- Expliquer l'analyse technique au lieu de résumer simplement

---

## CHANGEMENTS DÉJÀ EFFECTUÉS (À NE PAS REFAIRE)

### 1. CSS — Formulaires commandes/remboursements ✅ confirmé
Dans `style.css`, la règle `#form-collections .form-panel...` qui force `display: block` a été étendue. Ajouts faits :
- `#form-commande .form-panel`
- `#form-remboursement .form-panel`
- `#fiche-commande .form-panel`

### 2. JS — Liste vide commandes/remboursements ✅
Dans `admin-commandes.js` et `admin-remboursements.js`, la fonction de chargement nettoie maintenant le tableau et masque le formulaire/fiche quand la liste est vide.

### 3. JS — Doublon retiré dans main.js ✅
La 2e définition de `couleurTexteContraste` (juste avant `carteProduit`) a été supprimée. La 1re (au début du fichier) est conservée.

### 4. Apps Script — `syncCloudinary_v2` ❌ RIEN MODIFIÉ
Tentative annulée par Ctrl+Z. Code à l'état d'origine.

---

## TÂCHE URGENTE EN COURS — REFONTE EMBALLAGES

**Jean-Claude est bloqué sur cette tâche.** Le bug actuel : quand on ajoute un emballage à un format d'un produit, l'emballage apparaît sur **tous les formats** au lieu d'un seul. Des données ont déjà été perdues.

### Logique métier à implémenter (confirmée par Jean-Claude)

1. Un produit a plusieurs formats (ex : savon 100g et 200g)
2. Chaque format a SES propres emballages (le 100g a sa boîte, le 200g a une autre boîte différente)
3. Chaque emballage = 1 ingrédient unique. Si 2 étiquettes différentes = 2 ing_id différents = 2 lignes
4. Toujours 1 exemplaire par ligne (pas de quantité, pas de nb_par_unite)
5. Calcul au lot : si la recette donne 20 savons (`nb_unites = 20`) et qu'on fabrique × 2 → 40 boîtes + 40 étiquettes consommées du stock

### Sheets à modifier (manuellement par Jean-Claude)

**Sheet 1 — `Produits_Formats_v2`**
- Actuel : `PRO-id | poids | unite | prix_vente | format_id | nb_unites`
- Voulu : `pro_id | format_id | poids | unite | nb_unites | prix_vente`

**Sheet 2 — `Produits_Formats_Emballages_v2`**
- Actuel : `pro_id | poids | unite | ing_id | quantite | nb_par_unite | format_id`
- Voulu : `pro_id | format_id | ing_id` (3 colonnes seulement)

### Format ID
Passer de `FMT-1730912834567-4821` à séquentiel global : `FMT-0001`, `FMT-0002`, `FMT-0003`...

### Code à modifier

**Apps Script :**
- `getFormatsEmballages_v2` — lire 3 colonnes au lieu de 7
- `saveFormatsEmballages_v2` — écrire 3 colonnes au lieu de 7
- `getProduitsFormats_v2` — adapter à l'ordre des colonnes Sheet 1
- `saveProduit_v2` — adapter à l'ordre des colonnes Sheet 1
- `saveLot_v2` — calculer automatiquement `cout_emballages`
- `deleteProduit_v2` — vérifier nettoyage

**`admin-produits.js` :**
- Régler le bug qui mélange les emballages entre formats
- Générer des `format_id` séquentiels
- Adapter lecture/sauvegarde au nouveau modèle
- Adapter calcul de coût des formats dans la fiche produit
- Adapter formulaire d'édition

**`admin-fabrication.js` :**
- Calculer automatiquement le coût d'emballage du lot
- Formule : (somme prix unitaires emballages du format) × nb_savons_fabriqués

### Impacts déjà vérifiés
- ✅ `main.js` (site public) — n'utilise pas les emballages
- ✅ `admin-ventes.js` — n'utilise pas les emballages directement
- ❓ `catalogue-builder.js` — **PAS ENCORE VÉRIFIÉ** — Jean-Claude doit fournir ce fichier en début de prochaine conversation

### Risque connu à décider
Les lots de fabrication existants ont un `cout_emballages` calculé selon l'ancien modèle. Ce coût ne sera pas recalculé automatiquement.

---

## TODOS NOTÉS POUR PLUS TARD

### `admin-produits.js`
- Beaucoup de style inline dans le JS — à nettoyer
- Bouton "Actualiser" injecté dynamiquement — pourrait être en HTML
- TODO non terminé : pré-remplir l'adresse courriel par défaut dans la modale "Envoyer au graphiste"
- Fonctions `appliquerCureNA` et `appliquerSurgrasNA` quasi identiques — à unifier

### `admin-remboursements.js`
- La fonction `voirDetailRemboursement` utilise `alert()` — à améliorer

### `index.html`
- Beaucoup de style inline (catalogue-builder, modales, etc.)
- Section accueil n'a pas la classe `visible` au chargement — c'est `collections` qui s'affiche en premier

### Médiathèque
- Image fantôme (404) qui apparaît à la synchro Cloudinary — à régler avec une autre approche

---

## FICHIERS DÉJÀ ANALYSÉS DANS LA CONVERSATION PRÉCÉDENTE

- `index.html`
- `style.css`
- `main.js`
- `admin.js`
- `admin-produits.js`
- `admin-fabrication.js`
- `admin-ventes.js`
- `admin-commandes.js`
- `admin-remboursements.js`
- `admin-mediatheque.js`
- Code Apps Script complet

## FICHIERS NON ANALYSÉS

- `admin-collections.js`
- `admin-gammes.js`
- `admin-regroupements.js`
- `admin-inci.js`
- `admin-factures.js`
- `admin-familles.js`
- `admin-inventaire.js`
- `admin-promotions.js`
- `admin-densites.js`
- `admin-contenu-site.js`
- `admin-redaction.js`
- `admin-achats.js`
- `admin-fournisseurs.js`
- `catalogue-builder.js` ← **PRIORITÉ : à fournir en début de prochaine conversation**

---

## PREMIÈRE ACTION POUR LA NOUVELLE CONVERSATION

1. Lire ce brief en entier
2. Demander à Jean-Claude de fournir `catalogue-builder.js`
3. Vérifier que ce fichier n'utilise pas les emballages
4. Si OK → procéder à la refonte étape par étape, en attendant le OUI à chaque étape

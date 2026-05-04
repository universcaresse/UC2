# AUDIT — admin.js × main.js × code_v2.gs
## Univers Caresse V2 — 8 avril 2026

---

## 🔴 CRITIQUES — Peuvent causer une perte de données

### 1. `chargerProduitsData()` — formats perdus en mémoire
**Fichier :** `admin.js`  
**Problème :** Appelé après chaque sauvegarde produit. Ne recharge que `getProduits` — sans rejoindre les formats via `getProduitsFormats`. `donneesProduits` se retrouve sans formats en mémoire.  
**Effet :** Les cartes produits affichent des formats vides jusqu'au rechargement complet de la page.  
**Référence GS :** `getProduits_v2()` ne retourne pas les formats — ils sont dans `getProduitsFormats_v2()` séparément.

---

### 2. `afficherSection('fabrication')` — produits rechargés sans formats
**Fichier :** `admin.js` lignes 152–158  
**Problème :** Si `donneesProduits` est vide au moment d'accéder à la section Fabrication, le code recharge via `appelAPI('getProduits')` directement — sans rejoindre les formats. Contrairement à `chargerDonneesInitiales()` qui joint les formats au démarrage.  
**Effet :** La section fabrication fonctionne mais les données produits en mémoire sont incomplètes.

---

### 3. `inciValider()` — ne sauvegarde rien
**Fichier :** `admin.js`  
**Problème :** La fonction affiche seulement `"⚠ Validation INCI V2 à implémenter"` et ne fait aucun appel API.  
**Effet :** Toutes les modifications INCI faites dans l'interface sont perdues — rien n'est envoyé au sheet.  
**Note :** `saveIngredientInci_v2` **existe et fonctionne** dans `code_v2.gs` et est branchée dans `doPost`. Il manque seulement l'appel côté JS.

---

### 4. `deleteGamme_v2` — ingrédients de base orphelins
**Fichier :** `code_v2.gs`  
**Problème :** `deleteGamme_v2` supprime la ligne dans `Gammes_v2` mais **ne supprime pas** les entrées correspondantes dans `Gammes_Ingredients_v2`.  
**Effet :** Des lignes orphelines s'accumulent dans le sheet `Gammes_Ingredients_v2` avec des `gam_id` qui n'existent plus.

---

### 5. `supprimerFamille()` — pas de vérification des produits liés
**Fichier :** `admin.js`  
**Problème :** La fonction envoie `deleteFamille` sans vérifier si des produits référencent ce `fam_id`.  
**Effet :** Des produits peuvent se retrouver avec un `fam_id` qui n'existe plus dans `Familles_v2`. Le catalogue public affiche alors une famille vide pour ces produits.  
**Comparaison :** `supprimerCollection()` et `supprimerGamme()` vérifient les produits liés avant de supprimer — même logique manquante ici.

---

## 🟡 PROBLÈMES FONCTIONNELS

### 6. `supprimerFacture()` finalisée — stock non remis à jour
**Fichier :** `admin.js` / `code_v2.gs`  
**Problème :** `deleteAchat_v2` supprime l'entête et les lignes mais ne retranche pas les quantités du stock.  
**Effet :** Si une facture finalisée est supprimée, le stock reste gonflé des quantités qui avaient été ajoutées lors de la finalisation.

---

### 7. `sauvegarderDensite()` — `listesDropdown.config` non mis à jour en mémoire
**Fichier :** `admin.js`  
**Problème :** Après une sauvegarde de densité réussie, `listesDropdown.config` en mémoire n'est pas rechargé.  
**Effet :** Les calculs $/g dans la section Nouvelle facture utilisent encore l'ancienne densité jusqu'au rechargement complet de la page.

---

### 8. `voirDetailFacture()` — noms affichés comme `ing_id` brut
**Fichier :** `admin.js`  
**Problème :** La fonction cherche le `nom_UC` dans `listesDropdown.fullData`. Si `fullData` n'est pas chargé (accès direct à la section Factures sans passer par l'accueil ou la section INCI), les noms d'ingrédients s'affichent comme leur `ing_id` brut (ex: `ING-001`).

---

### 9. `chargerFactures()` — fournisseurs manuels affichés comme `four_id`
**Fichier :** `admin.js`  
**Problème :** Le nom du fournisseur est résolu via `fournisseursMap[a.four_id]`. Si un fournisseur a été entré manuellement lors d'une facture (pas dans `Fournisseurs_v2`), son `four_id` brut s'affiche dans la liste au lieu du nom.

---

### 10. `ajouterItem()` — calcul `prix_par_g` diverge entre JS et GS pour les liquides en `ml`
**Fichier :** `admin.js` / `code_v2.gs`  
**Problème :** Le JS applique la densité pour `ml` (`qteEnG = qte * cfg.densite`). Le GS dans `addAchatLigne_v2` ne l'applique pas pour `ml` (`grammes = formatQte` sans densité). Les deux calculs peuvent donner des valeurs différentes — le GS écrase la valeur JS.

---

### 11. `mediathequeSupprimer()` — `rowIndex` peut pointer la mauvaise ligne
**Fichier :** `admin.js` / `code_v2.gs`  
**Problème :** `supprimerMediatheque_v2` supprime par `rowIndex`. Si le sheet `Mediatheque_v2` est modifié entre le chargement de la médiathèque et la suppression (ex: ajout d'une photo dans un autre onglet), le `rowIndex` en mémoire peut pointer sur une ligne différente.

---

### 12. `confirmerImportFacture()` — pas de rollback si une ligne échoue
**Fichier :** `admin.js`  
**Problème :** Les `addAchatLigne` sont envoyés en séquence avec `await` dans un `for`. Si un appel échoue à mi-chemin, les lignes précédentes sont déjà enregistrées dans le sheet mais la facture n'est pas finalisée — état partiellement incohérent, sans rollback possible.

---

### 13. Bug #83 — X et Annuler fabrication non branchés
**Fichier :** `admin.js` / `index-admin.html`  
**Problème :** `fermerFormFabrication()` existe mais les boutons X et Annuler dans le formulaire fabrication ne l'appellent pas dans le HTML.

---

### 14. `catalogueCharge` jamais remis à `false`
**Fichier :** `main.js`  
**Problème :** `catalogueCharge = true` est mis lors du premier chargement et jamais remis à `false`. Si un admin modifie un produit puis revient sur le site public dans le même onglet, le catalogue ne se recharge pas — les changements ne sont pas visibles avant un rechargement de page.

---

### 15. `ordreFamilles` sans déduplication — doubles possibles dans le catalogue
**Fichier :** `main.js`  
**Problème :** Dans `construireCatalogue()`, `ordreFamilles` est construit avec `push` sans vérifier si la famille est déjà présente. Si plusieurs produits ont la même famille, cette famille apparaît plusieurs fois dans `ordreFamilles`.  
**Effet :** Des produits peuvent apparaître en double dans le catalogue public.

---

### 16. `filtrerGamme()` sans `col_id` — mauvais filtre possible
**Fichier :** `main.js`  
**Problème :** Si `col_id` n'est pas passé à `filtrerGamme()`, la fonction prend le premier `.collection-filtres-gammes` trouvé dans le DOM.  
**Effet :** Sur un catalogue multi-collections, le filtre de gamme peut s'activer sur la mauvaise collection.

---

### 17. `appliquerContenu()` — valeurs vides non effacées
**Fichier :** `main.js`  
**Problème :** `set()` utilise `if (el && val)` — si une clé existe dans `Contenu_v2` mais est vide, le texte HTML existant n'est pas effacé.  
**Effet :** Un texte supprimé dans le sheet continue d'apparaître sur le site jusqu'au rechargement.

---

## ⚪ SÉCURITÉ

### 18. Mot de passe admin visible dans le source public
**Fichier :** `main.js`  
**Problème :** `CONFIG.MOT_DE_PASSE = '2026'` est déclaré dans `main.js` — chargé sur le site public. Quiconque inspecte le source de la page peut lire le mot de passe et accéder à l'admin.

---

## RÉSUMÉ

| # | Sévérité | Fichier | Problème |
|---|---|---|---|
| 1 | 🔴 | admin.js | `chargerProduitsData()` — formats perdus après save |
| 2 | 🔴 | admin.js | Section fabrication — produits sans formats |
| 3 | 🔴 | admin.js | `inciValider()` — ne sauvegarde rien |
| 4 | 🔴 | code_v2.gs | `deleteGamme_v2` — ingrédients orphelins |
| 5 | 🔴 | admin.js | `supprimerFamille()` — pas de vérif produits liés |
| 6 | 🟡 | admin.js / gs | Suppression facture — stock non corrigé |
| 7 | 🟡 | admin.js | Densité sauvegardée — config mémoire pas à jour |
| 8 | 🟡 | admin.js | Détail facture — noms affichés comme `ing_id` |
| 9 | 🟡 | admin.js | Fournisseurs manuels affichés comme `four_id` |
| 10 | 🟡 | admin.js / gs | Calcul `prix_par_g` diverge pour `ml` |
| 11 | 🟡 | admin.js / gs | Médiathèque — `rowIndex` peut pointer mauvaise ligne |
| 12 | 🟡 | admin.js | Import PDF — pas de rollback si ligne échoue |
| 13 | 🟡 | html | Bug #83 — X et Annuler fabrication non branchés |
| 14 | 🟡 | main.js | `catalogueCharge` jamais remis à `false` |
| 15 | 🟡 | main.js | Doubles dans catalogue — familles sans déduplication |
| 16 | 🟡 | main.js | `filtrerGamme()` — mauvais filtre possible |
| 17 | 🟡 | main.js | `appliquerContenu()` — valeurs vides non effacées |
| 18 | ⚪ | main.js | Mot de passe admin visible dans le source public |

---

*Univers Caresse — Audit V2 — 8 avril 2026*

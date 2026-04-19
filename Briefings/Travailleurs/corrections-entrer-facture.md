# Corrections — Entrer une facture V3
_19 avril 2026_

---

## 1. Modales cat/nom fournisseur ne s'ouvraient pas
**Fichier :** `entrer-facture.js`  
**Cause :** `efOnChangeSaisieCatFourn` et `efOnChangeSaisieNomFourn` retournaient trop tôt à cause de `if (!sel || !champ)` — l'élément `champ` n'existe pas dans la ligne de saisie générée dynamiquement.  
**Fix :** Retiré `|| !champ` des deux vérifications + ajout de `if (champ)` avant les appels à `classList`.

---

## 2. "+ Nouveau nom…" absent du dropdown Nom fournisseur
**Fichier :** `entrer-facture.js`  
**Cause :** Même bug — `efOnChangeSaisieCatFourn` plantait sur `champ.classList.toggle(...)` quand `champ` est null, bloquant l'appel à `efPopulerNomsFourn`.  
**Fix :** Inclus dans la correction #1.

---

## 3. Carré vert sans texte après ajout d'une ligne
**Fichier :** `admin.js`  
**Cause :** `afficherMsg('ef-items', '')` déclenchait le toast même avec un texte vide.  
**Fix :** Ajout de `if (!texte) return;` dans `afficherMsg` avant la création du toast.

---

## 4. Message de confirmation disparu après finalisation
**Fichier :** `entrer-facture.js`  
**Cause :** Le message `✅ Facture finalisée` s'affichait dans `msg-ef-final`, à l'intérieur de `ef-zone-items` qui se cachait 3 secondes plus tard — emportant le message avec lui.  
**Fix :** Message redirigé vers `msg-ef` qui reste toujours visible.

---

## 5. "+ Nouvelle catégorie UC…" absent du dropdown Cat UC
**Fichier :** `entrer-facture.js`  
**Cause :** `efRendreLigneSaisie` ne générait pas d'option pour créer une nouvelle catégorie UC.  
**Fix :** Ajout de `<option value="__nouvelle_cat__">+ Nouvelle catégorie UC…</option>` et gestion dans `efOnChangeSaisieCatUC`.

---

## 6. Nouveau modal dédié — Créer une catégorie UC
**Fichiers :** `index.html`, `entrer-facture.js`  
**Cause :** Il n'existait pas de modal simple pour créer une catégorie UC — le modal "Nouvel ingrédient" était inadapté.  
**Fix :** Création du modal `modal-ef-nouvelle-cat-uc` avec un seul champ texte + fonctions `efOuvrirModalNouvelleCatUC`, `efFermerModalNouvelleCatUC`, `efConfirmerModalNouvelleCatUC`.

---

## 7. Modal "Nouvel ingrédient" simplifié
**Fichiers :** `index.html`, `entrer-facture.js`  
**Cause :** Le modal demandait inutilement la catégorie UC, déjà sélectionnée dans la ligne de saisie.  
**Fix :** Modal réduit à un seul champ (nom de l'ingrédient). La catégorie est lue directement depuis `ef-saisie-cat-uc`. Fonction `efConfirmerModalIngredient` réécrite en conséquence.

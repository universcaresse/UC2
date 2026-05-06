# BRIEF — UNIVERS CARESSE — SÉCURISATION SAUVEGARDE PRODUITS

## CONTEXTE
Site e-commerce de savonnerie artisanale. Stack : HTML/CSS/JS frontend + Google Apps Script backend + Google Sheets comme base de données.

Jean-Claude a passé une journée complète à corriger des bugs et a perdu des données dans plusieurs sheets en faisant des tests. La sauvegarde actuelle est dangereuse — elle efface et réécrit plusieurs sheets en même temps, même celles qui n'ont pas été modifiées par l'utilisateur.

## ARCHITECTURE
- Frontend : `admin-produits.js`, `admin.js`, `main.js`, `style.css`
- Backend : `code.gs` (Apps Script déployé en web app)
- Base de données : Google Sheet (ID `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`)

## SHEETS PRINCIPALES (PRODUITS)
- `Produits_v2` : infos du produit (pro_id, col_id, gam_id, fam_id, nom, description, couleur_hex, etc.)
- `Produits_Ingredients_v2` : ingrédients par produit (pro_id, ing_id, nom_ingredient, quantite_g)
- `Produits_Formats_v2` : formats par produit (pro_id, format_id, poids, unite, nb_unites, prix_vente)
- `Produits_Formats_Emballages_v2` : emballages par format (pro_id, format_id, ing_id)

## RÈGLE D'OR
**Une fonction de sauvegarde ne doit JAMAIS toucher à une sheet qui n'est pas sa responsabilité directe.**

Si l'utilisateur modifie juste la couleur d'un produit, le code ne doit PAS effacer/réécrire les ingrédients, les formats ou les emballages.

## TRAVAIL DÉJÀ FAIT (NE PAS REFAIRE)

### Étape 1 — Visuel emballages ✅ COMMIT
Réécriture de `rafraichirListeFormatsRecette` dans `admin-produits.js`. Chaque format est maintenant une carte (`form-panel`) distincte avec ses emballages bien séparés sous chaque format. Aucun style inline, classes CSS existantes uniquement.

### Étape 2 — Sauvegarde emballages sécurisée ✅ COMMIT
- `saveFormatsEmballages_v2` dans `code.gs` réécrite : un seul appel API par produit, supprime UNIQUEMENT par pro_id dans Produits_Formats_Emballages_v2, validation stricte (refuse si pro_id manquant ou tableau emballages manquant).
- Bloc dans `sauvegarderRecette` (admin-produits.js) réécrit : un seul appel API qui envoie tous les emballages valides ensemble (au lieu d'un appel par format).
- Touche UNIQUEMENT à Produits_Formats_Emballages_v2.

## PROCHAINE ÉTAPE — SÉCURISER `saveProduit_v2`

**Fichier :** `code.gs`
**Fonction :** `saveProduit_v2`

### Problème actuel
La fonction efface et réécrit en cascade :
- Produits_v2 (les infos du produit)
- Produits_Ingredients_v2 (efface tout par pro_id puis réécrit)
- Produits_Formats_v2 (efface tout par pro_id puis réécrit)

Si l'appel arrive avec un tableau `ingredients` vide par accident, TOUS les ingrédients du produit sont effacés sans être remplacés.

### Règles de sécurisation à appliquer
1. Si `pro_id` est manquant → refuser tout, rien n'est effacé
2. Si `nom` est vide → refuser tout, rien n'est effacé
3. Si `ingredients` est vide ou manquant → NE PAS toucher à Produits_Ingredients_v2 (on garde ce qui est là)
4. Si `formats` est vide ou manquant → NE PAS toucher à Produits_Formats_v2 (on garde ce qui est là)

Le pire qui peut arriver : la sauvegarde échoue avec un message d'erreur, mais les données existantes restent intactes.

## RÈGLES DE TRAVAIL AVEC JEAN-CLAUDE
- Réponses courtes, pas de bla bla
- Demander OUI explicite avant de coder
- Un seul changement à la fois, attendre OK avant le suivant
- Livraison par trouve/remplace UNIQUEMENT — jamais le fichier complet sans permission
- Pas de style inline dans HTML/JS
- Réutiliser les classes CSS existantes
- Dire COMMIT à la fin d'une tâche, puis proposer la suivante
- Jean-Claude est fatigué — pas de questions inutiles, pas d'analyse technique étalée

# SESSION du 16 juillet 2026 (3e) — Réimplantation : lots, conso et solde du stock
### FAIT, DÉPLOYÉ (« fait »). recalculerLots_v2 PAS ENCORE ROULÉE — factures manquantes d'abord.
> Lire `METHODE.md` d'abord. Continue la session « reconstruction-stock » du même jour.

---

## 1. OÙ ON EN EST DANS LE PLAN DE CHANTAL

1. ✅ Reconstruire les stocks à partir des factures (session précédente + celle-ci).
2. ✅ Mécanique des lots prête — code déployé, **fonction de rejeu pas roulée**.
3. ⏭️ PROCHAINE ÉTAPE : les ventes (rien d'entamé).

## 2. EN ATTENTE DE CHANTAL (avant de rouler quoi que ce soit)

1. Entrer les **factures manquantes** (des prix de fabrication manquent). Le stock se met à jour tout seul à chaque finalisation — pas besoin de rerouler `recalculerStock_v2`.
2. Quand TOUT est entré : rouler **`recalculerLots_v2` une fois** (éditeur Apps Script). Elle est reroulable sans doubler (efface les écritures LOT- et remet F à 0 avant).
3. Pousser Code.gs vers GitHub — la copie projet est en retard sur l'Apps Script (les grep sur la copie montrent l'ancien code; ne pas s'y fier pour les fonctions modifiées aujourd'hui).

---

## 3. NOUVELLE STRUCTURE DE Stock_Ingredients_v2 (décidée par Chantal)

| Col | Contenu | Qui l'écrit |
|-----|---------|-------------|
| A | ing_id | achats |
| B | **total acheté (g)** — ne diminue JAMAIS par les lots | mettreAJourStock_v2 (+), deleteAchat_v2 (−) |
| C | **prix moyen pondéré** — lots, fabrication, bilan | achats (pondéré; repart à neuf si B≤0 avant l'achat) |
| D | date dernier achat | achats |
| E | **dernier prix payé au g** — pour fixer les prix de vente | achats (écrasé chaque fois) |
| F | **conso_g** — total consommé par les lots (ingrédients ET emballages en unités) | diminuerStockLot_v2 (+), saveLot_v2 emballages (+), deleteLot_v2 (− via multiplicateur négatif), recalculerLots_v2 (réécrit) |
| G | **solde_g** = B − F — le vrai disponible | ARRAYFORMULA posée par Chantal en G2 : `=ARRAYFORMULA(SI(A2:A=""; ; B2:B - F2:F))`. Le code n'écrit JAMAIS en G. |

But de Chantal : voir d'un coup d'œil ce qui a été acheté sur une période et ce qui a été utilisé.

## 4. MODIFICATIONS Code.gs (validées « ok » une à une, déployées)

1. **`diminuerStockLot_v2`** : additionne dans F (col 6) au lieu de soustraire de B. Multiplicateur négatif (deleteLot) marche encore.
2. **`saveLot_v2` emballages** : additionne nb_unites dans F au lieu de soustraire de B.
3. **`getStock_v2`** : `qte_g` = colonne G (solde) désormais; ajoute `achete_g` (B) et `dernier_prix_g` (E). Les écrans montrent le disponible réel; dernier_prix_g dispo mais **pas encore affiché nulle part**.
4. **`saveLot_v2` appendRow** : écrit maintenant 16 colonnes — ajout de `''` (nb_unites_vendu, col 15) et `data.format_id` (col 16). **Chantal doit avoir l'en-tête format_id en col P de Lots_v2** (demandé, non reconfirmé explicitement).
5. **`recalculerStock_v2`** : vide A-F (conso repart à 0 — ordre imposé : stock d'abord, lots ensuite) et écrit par `setValues` dès la ligne 2 (fini l'appendRow qui désalignait avec les 0 restés dans F).
6. **NOUVELLE `recalculerLots_v2`** (placée après recalculerStock_v2) — voir §5.

## 5. recalculerLots_v2 — ce qu'elle fait

1. Efface les écritures LOT- de Ecritures_v2 (il n'y en avait AUCUNE au moment de coder — confirmé par Chantal) + remet F à 0.
2. Par lot : retrouve `format_id` (col 16; si vide → match pro_id+poids+unité dans Produits_Formats_v2, puis l'INSCRIT — une seule fois, plus jamais deviner).
3. Conso : recette d'aujourd'hui (Produits_Ingredients_v2 [pro_id, ing_id, —, qte_g]) × nbRecettes (nb_unites ÷ nb_unites_format, sinon multiplicateur) + emballages (nb_unites par item du format via Produits_Formats_Emballages_v2) → cumulés puis écrits en F.
4. Coûts **recalculés au pondéré** et réinscrits dans le lot (cols 7-10) — les vieux coûts historiques sont écrasés volontairement : lot, stock et bilan racontent la même histoire.
5. Écriture 1310 débit / 1305 crédit par lot (si coût > 0), à la **date de fabrication**, réf lot_id, nom du produit. Ne repasse PAS par saveLot_v2 → pas de renumérotation, nb_unites_vendu intact.

## 6. FAITS VÉRIFIÉS CETTE SESSION (ne pas redécouvrir)

- `Produits_Formats_v2` : [pro_id, format_id, poids, unite, nb_unites, prix_vente, poste_gr, actif].
- `Lots_v2` (index 0-15) : lot_id, pro_id, multiplicateur, nb_unites, date_fab, date_dispo, cout_ing, cout_emb, cout_total, cout_unite, ?, format_poids, format_unite, nb_unites_format, nb_unites_vendu, format_id (nouveau).
- Recette en grammes **par recette**; conso lot = qte_g × nbRecettes. Emballages : nb_unites par item.
- Leçon répétée par Chantal : recherche inversée (partir du résultat voulu), rester simple, listes 1-2-3, ne pas supposer — lire le vrai code (et le chercher dans le projet : le GitHub y est synchronisé).

## 7. PROCHAINE SESSION — étape 3 : les ventes

À dérouler en arbre. Connus : `finaliserVente_v2` ne fait AUCUNE écriture comptable (touche seulement nb_unites_vendu de Lots_v2). Il faudra brancher les ventes à la comptabilité (revenus + sortie du 1310 vers CMV) et prévoir leur reconstruction. `Ventes_Lignes_v2` pointe sur les lot_id existants — préservés puisque pas de renumérotation.

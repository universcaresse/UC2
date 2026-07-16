# SESSION du 16 juillet 2026 (2e) — Réimplantation comptable : reconstruction du stock
### FAIT ET TESTÉ par Chantal (« ça fonctionne »). Redéploiement Apps Script à faire (Code.gs modifié).
> Lire `METHODE.md` d'abord. Règle rappelée cette session : recherche inversée — partir du résultat voulu, pas du code. Ne pas compliquer.

---

## 1. LE PLAN GLOBAL (donné par Chantal, étape par étape)

1. **Reconstruire les vrais stocks** à partir des factures existantes. ✅ FAIT cette session.
2. **Reconstruire les lots** : le rejeu des lots prélève le stock (pas de soustraction à calculer) et fait entrer la fabrication en comptabilité. ⏭️ PROCHAINE ÉTAPE.
3. Ventes ensuite.
4. Refaire achats et fabrication se fait **avec le code actuel** (les fonctions d'aujourd'hui), pas avec les vieilles logiques.

---

## 2. LA GRANDE DÉCISION — deux prix au stock

Problème vu par Chantal : le lot sortait au « dernier prix payé » → écart entre la feuille de stock et le compte 1305 du bilan (le bilan ne lit QUE Ecritures_v2, jamais la feuille de stock).

**Solution de Chantal (validée)** : `Stock_Ingredients_v2` porte maintenant **deux prix** :
- **Colonne C** = prix **moyen pondéré** → sert aux lots, à la fabrication, au bilan. Feuille et 1305 restent collés.
- **Colonne E (nouvelle, en-tête `dernier_prix_g`, ajoutée par Chantal)** = **dernier prix payé au gramme** → servira à fixer les prix de vente (les ingrédients montent sans cesse, le pondéré traîne dans le passé).

La fiche produit lit encore le pondéré (prix_par_g_reel via getStock). L'affichage « dernier prix » dans la fiche = **ajout séparé, pas fait, à dérouler plus tard**.

---

## 3. CE QUI A ÉTÉ POSÉ DANS Code.gs (validé « ok » un à un, testé)

### 3.1 `recalculerStock_v2` — réécrite au complet (remplace la vieille version périmée au prix moyen)
- Vide `Stock_Ingredients_v2` (colonnes A à E) et rejoue TOUS les achats.
- Ordre : **date d'achat, puis numéro ACH croissant** (le dernier prix doit être vraiment le dernier).
- Chaque ligne : prix **recalculé à neuf** (prix unitaire ÷ grammes du format avec densité, × facteur de l'achat, × marge de la catégorie) — même calcul qu'une finalisation d'aujourd'hui.
- Les prix recalculés sont **réinscrits dans les colonnes 6 et 7 de Achats_Lignes_v2** (feuille propre partout).
- Écrit : qté (B), pondéré = valeur ÷ grammes (C), date (D), dernier prix (E).
- Exécution manuelle depuis l'éditeur Apps Script. Chantal l'a roulée deux fois; résultat vérifié.

### 3.2 `mettreAJourStock_v2` — l'achat quotidien
- Colonne C : **pondéré** = (stock × prix actuel + grammes ajoutés × prix de la ligne) ÷ nouveau stock.
- Si le stock était **à 0 ou négatif** : le prix repart à neuf avec celui de l'achat.
- Colonne E : dernier prix payé, écrasé à chaque achat.
- Ingrédient absent de la feuille : appendRow avec les 5 colonnes.

### 3.3 Rien à changer ailleurs (vérifié dans les vrais fichiers)
- `diminuerStockLot_v2` ne touche que la quantité → intact.
- `saveLot_v2` lit la colonne C → lira le pondéré tout seul; son garde-fou compare écran vs stock, les deux au pondéré → cohérent.
- Fiche produit (`ouvrirFicheProduit` dans js/admin-produits.js) lit prix_par_g_reel du stock → affichera le pondéré.
- `recalculerPrixParG_v2` (ligne ~636) : périmée, devenue inutile — candidate au ménage.
- `getStock_v2` renvoie prix_par_g_reel = colonne C; il ne renvoie **pas encore** la colonne E.

---

## 4. FAITS ÉTABLIS EN COURS DE ROUTE (ne pas redécouvrir)

- Le bilan (getBilanResultats_v2) additionne seulement Ecritures_v2. La reconstruction du stock **n'a rien changé au bilan**.
- Achats : tous « Finalisé », tous complets — il n'y a plus d'achats en cours ni d'achats vides (ACH-0025/26/27 réglés).
- Ventes (finaliserVente_v2) : aucune écriture comptable, touche seulement nb_unites_vendu dans Lots_v2. L'inventaire produit fini = Lots_v2 (nb_unites − nb_vendu).
- saveLot_v2 : numéro donné par le serveur (max Lots_v2 + refs LOT- d'Ecritures_v2) → **rejouer les lots par cette porte les renumérote**, et Ventes_Lignes_v2 pointe sur les anciens lot_id. À traiter dans l'arbre de l'étape 2.
- saveLot_v2 coûte le lot avec la recette **d'aujourd'hui** (Produits_Ingredients_v2) × prix du stock, garde-fou écran/serveur à 0,01 $.

---

## 5. À PUBLIER

- **Nouveau déploiement Apps Script** (Code.gs modifié : recalculerStock_v2 + mettreAJourStock_v2) — sinon le prochain achat réel écrasera encore le pondéré avec l'ancien code.

## 6. AU RETOUR DU CAFÉ — étape 2 : reconstruire les lots

À dérouler en arbre (règle 1.9), branche par branche, liste 1-2-3, une question à la fois. Nœuds déjà connus à mettre dans l'arbre :
1. Les lots existants ont déjà leurs écritures 1310/1305 (celles passées depuis le 14 juillet) — quoi effacer/contre-passer avant de rejouer.
2. La renumérotation par saveLot_v2 vs les lot_id déjà pointés par Ventes_Lignes_v2.
3. Le coût rejoué = recette d'aujourd'hui × pondéré d'aujourd'hui — pas le coût historique du lot.
4. nb_unites_vendu à conserver.

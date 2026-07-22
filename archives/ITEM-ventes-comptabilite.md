# ITEM — Brancher les ventes à la comptabilité
### ✅ ARBRE VALIDÉ ET **TOUT EST CODÉ** (2026-07-21) — items 1 à 5 faits, dans `codegs.txt` + le front-end. **PAS DÉPLOYÉ.**
> Il ne reste que l'étape 6 : Chantal colle `codegs.txt` en entier dans Code.gs **et** pousse le site, les deux ensemble.
> Lire `METHODE.md` d'abord. Aucun code sans le OK de Chantal.
> Ordre du projet : achats → fabrication → **ventes**. Achats et fabrication sont branchés (2026-07-14). Les ventes : décidées, pas construites.
> Le modèle d'écriture de vente est déjà tranché dans `Plan-comptable-Univers-Caresse.md` (section « ÉCRITURES DE VENTE »). Cet item déroule surtout **les pannes** (le 🔴 du plan comptable), avant de coder.

---

## FAITS VÉRIFIÉS (2026-07-20, dans codegs.txt)
- `createVente_v2` (sous verrou) : crée la vente « En cours ». **L'écran peut encore souffler le `ven_id`** (`data.ven_id` utilisé s'il est fourni) ; garde-fou : refus si le numéro existe déjà.
- ~~`finaliserVente_v2` existe mais **n'écrit aucune écriture comptable** (les ventes ne sont pas branchées).~~ **Périmé — corrigé le 2026-07-21 :** `finaliserVente_v2` inscrit maintenant l'écriture, **et** la deuxième porte (`creerVenteDepuisCommande_v2`, les coups de cœur) aussi. Voir « RESTE À BÂTIR » plus bas.
- Modèle à réutiliser (déjà bâti pour les achats) : `inscrireEcriture_v2` (refuse toute écriture non balancée), `contrePasserReference_v2` (inverse le solde net d'une référence).

---

## L'ARBRE — LES PANNES (une branche à la fois)

### ✅ Branche 1 — pas de double écriture (VALIDÉE)
Une vente finalisée = **une seule** écriture équilibrée. Si elle se re-finalise (ou si ça retente après une coupure), le serveur **contre-passe d'abord l'ancienne** avant d'en refaire une — même mécanique que les achats.

### ✅ Branche 2 — vente et écriture, ensemble ou pas du tout (VALIDÉE)
La finalisation écrit l'écriture **et** marque la vente payée dans **la même opération verrouillée** du serveur. Appel coupé avant la fin → la vente reste « en cours » et se re-finalise proprement (branche 1). Jamais une écriture seule sans sa vente.

### ✅ Branche 3 — double-clic sur finaliser (VALIDÉE)
Deux clics coup sur coup : le premier fait le travail, le deuxième voit la vente **déjà payée** et ne fait **rien** (pas de 2e écriture, pas de contre-passation inutile). Seul un vrai geste de re-finalisation refait l'écriture (branche 1).

### ✅ Branche 4 — voir un problème, pas le deviner (VALIDÉE)
Une alarme liste les cas rares : vente payée **sans** écriture, écriture de vente **sans** sa vente. Ça saute aux yeux, comme les catégories orphelines.

### ✅ Branche 5 — réparer : NON construit (VALIDÉE)
Les branches 1 à 3 empêchent le problème; la branche 4 (alarme) le rendrait visible. **On ne bâtit pas de bouton de réparation automatique** — cas qui ne devrait pas exister. S'il se pointe un jour, on le règle ensemble à la main. (Moins de code.)

### ✅ Branche 6 — suppression d'une vente (VALIDÉE)
Effacer une vente finalisée ne gomme rien : le serveur inscrit la **contre-passation** (l'inverse), tout reste au journal. Comme les achats, comme la règle « jamais d'effacement ».

### ⏸️ Branche 7 — remboursement — EN PAUSE, dépend d'un prérequis
**Manque flagrant découvert le 2026-07-20 (question de Chantal) :** aujourd'hui un remboursement (`js/admin-remboursements.js`) est **libre** — on ajoute des lignes de produits/montants, **sans lien avec une vente**. Chantal : « je dois pouvoir partir d'une vente ». Donc l'écriture au prorata ne peut pas être propre tant que le remboursement ne part pas d'une vraie vente.

**Prérequis (nouveau sous-item, à dérouler AVANT la branche 7) : le remboursement part d'une vente.**
- Fait vérifié : **chaque** vente est un enregistrement individuel (numéro `VEN-`, date, articles, mode), y compris les ventes **comptant au marché** — Chantal les entre une par une dans l'app.
- Donc le remboursement partira **toujours** d'une vente, retrouvée par **nom** (ventes identifiées) ou par **date + produit** (comptant anonyme au marché). On voit ses articles, on rend tout ou une partie.
- **Décidé (2026-07-20) : un remboursement prend TOUJOURS une vente. Plus de remboursement libre du tout.**
- **Décidé (2026-07-20) : on ne peut rembourser que ce qui est *disponible à rembourser* = vendu − déjà remboursé sur cette vente.** Le système retient le déjà-remboursé par vente (remboursements en plusieurs fois possibles).
- **✅ Écriture du remboursement (VALIDÉE 2026-07-20)** : inscrit l'**inverse** de la vente pour les articles rendus (revenu **et** coût), au **prorata** (rabais réparti, modèle du plan comptable). L'argent **sort par le mode du remboursement** — qui peut différer du mode de la vente (vendu comptant, remboursé Interac).

---

## 🔴 AVERTISSEMENT DE DÉPLOIEMENT (2026-07-20)
**NE PAS déployer `codegs.txt` seul.** L'étape 3b rend la vente **obligatoire** pour créer un remboursement (`createRemboursement_v2` refuse sans `ven_id`), mais l'écran actuel (`js/admin-remboursements.js`) n'envoie **pas** de `ven_id`. Déployer maintenant **casserait tous les remboursements**. → Déployer Code.gs **et** le nouvel écran (3c) **en même temps**, une fois l'écran fait. Les étapes vente (1 et 2) seraient sûres seules, mais elles sont dans le même fichier — donc on attend l'écran et on déploie tout d'un coup.

## ARBRE COMPLET — VALIDÉ (2026-07-20). Construction en cours (voir « RESTE À BÂTIR »).
Branches 1→6 (pannes) + prérequis remboursement (part toujours d'une vente, plafonné au disponible) + branche 7 (écriture du remboursement) : toutes validées.

**Hors de cet item (séparé, plus tard, per Plan-comptable) :** le rapprochement des dépôts Square (solder « à recevoir » + frais), et la page de saisie manuelle (dépôts, soldes d'ouverture, dépenses directes).

## RESTE À BÂTIR (au GO de Chantal, un trouve-et-remplace à la fois)
1. ✅ **FAIT dans codegs.txt (2026-07-20, pas déployé) : écriture à la finalisation d'une vente.** Dans `finaliserVente_v2`, sous le verrou existant : mode → compte (argent 1205 · square/square-manuel 1210 · plus-tard 1220) au débit du reçu; 4005 au crédit du plein prix; 4015 au débit du rabais; 4010 au crédit de la livraison facturée; coût 5001/1310 (coût par unité du lot × qté). Contre-passe d'abord (branche 1). Rien si « En attente Square » ni si total 0 $. **Livraison/expédition côté coût réel (5210/2110) : encore à faire.**
   - 🔴 **TROU TROUVÉ ET BOUCHÉ le 2026-07-21 — la DEUXIÈME porte des ventes.** `finaliserVente_v2` n'est pas le seul chemin qui crée une vente : `creerVenteDepuisCommande_v2` (vente coup de cœur, née directement au statut « Finalisé ») ajoutait la vente **sans aucune écriture** — donc l'argent des coups de cœur n'entrait jamais dans 1210. Corrigé : la même écriture y est maintenant inscrite (mode → 1205/1210/1220 au débit du reçu, 4005 au crédit du plein prix, 4015 au débit du rabais, 4010 au crédit de la livraison, coût 5001/1310 par lot), **contre-passation d'abord**, et **sans toucher au stock** (déjà sorti par `sortirStockCommande_v2` — ne jamais appeler `finaliserVente_v2` ici, ça double-sortirait le stock). Équilibre vérifié sur 6 cas.
   - 🔒 **Porte fermée le 2026-07-21 :** `updateStatutVente_v2` pouvait changer le **statut** et le **mode de paiement** d'une vente sans rien dire à la compta (aucun appelant ne le faisait, mais la porte était ouverte). Elle **refuse maintenant explicitement** ces deux champs et ne garde que courriel / téléphone / infolettre.
   - **Leçon pour la suite : avant de brancher quoi que ce soit à la comptabilité, chercher TOUTES les portes qui écrivent dans la feuille, pas seulement la principale.** Audit fait : les 11 autres fonctions qui écrivent sans compta sont légitimes (états « en cours », stock, jeton, courriel).
2. ✅ **FAIT dans codegs.txt (2026-07-20, pas déployé) : suppression d'une vente → contre-passation.** `deleteVente_v2` : verrou ajouté + `contrePasserReference_v2(ven_id)` avant d'effacer entête et lignes. (Branche 6.)
3. **Refonte du remboursement — GROS MORCEAU, en cours (2026-07-20).** Part d'une vente (recherche nom ou date+produit), plafonné au disponible (vendu − déjà remboursé), plus de remboursement standalone. **Décidé : un montant libre reste permis (ex. livraison, geste commercial) EN PLUS des articles de la vente.** Découpage :
   - 3a. ✅ **FAIT dans codegs.txt (2026-07-20, pas déployé).** `getVenteRemboursable_v2(ven_id)` écrite + branchée dans `doPost` (action admin) : renvoie la vente (client, date, mode) et chaque article avec quantité vendue, déjà remboursée, et **disponible**. Lit la colonne `ven_id` des remboursements si elle existe (sinon disponible = tout vendu — transition sûre). Ventes_Lignes_v2 colonnes confirmées : 0 ven_id · 1 pro_id · 2 lot_id · 3 quantite · 4 prix_unitaire · 5 prix_total · 6 format_poids · 7 format_unite.
   - 3b. ✅ **FAIT dans codegs.txt (2026-07-20, pas déployé).** `createRemboursement_v2` exige `data.ven_id` et le stocke (colonne `ven_id` créée si absente). `finaliserRemboursement_v2` : refuse si non rattaché à une vente, et refuse toute ligne produit qui dépasse le disponible (vendu − déjà remboursé par les autres remboursements de la vente). Les montants libres ne sont pas plafonnés.
   - 3c. ✅ **FAIT (2026-07-21, pas déployé) — écran refait, front-end seulement.** `js/admin-remboursements.js` réécrit + `admin/index.html` (bloc `#form-remboursement`). Flux : choisir une vente (liste réutilisant `getVentesEntete`, recherche nom/produit/date, clic) → `getVenteRemboursable` affiche chaque article avec vendu/déjà remboursé/**disponible** → bouton **« Rembourser tout »** + quantité modifiable par article (plafonnée au disponible) → **par article, retour-inventaire ou perte** (nouvelle branche validée 2026-07-21) → montant libre optionnel typé **livraison** ou **promotion** → coordonnées reprises de la vente (modifiables) → sortie d'argent **Comptant / Interac / Square**. L'écran **envoie déjà** deux champs neufs à `addRemboursementLigne` : `retour` (`inventaire`|`perte`) sur les lignes produit, `compte` (`livraison`|`promotion`) sur les lignes libres — **le back-end actuel (codegs.txt) les ignore encore**, à brancher à l'étape 4. `type_remb` d'entête n'est plus utilisé (envoyé vide) : le retour en stock devient **par ligne** à l'étape 4. **Prix modifiable par article (2026-07-21)** : chaque ligne produit affiche un « Prix payé » pré-rempli au prix rabais réparti (plein prix × (pleinPrix−rabais)/pleinPrix, pleinPrix vente = total_net+rabais−livraison), **modifiable à la main** (rabais variés). L'écran envoie `prix_unitaire` = prix remboursé + `prix_plein` = plein prix, pour que l'écriture sépare 4005 et 4015.
4. ✅ **FAIT dans codegs.txt (2026-07-21, pas déployé) : écriture du remboursement + champs neufs de l'écran 3c branchés.** (a) `addRemboursementLigne_v2` stocke `retour` (ligne produit), `compte` (ligne libre) et `prix_plein` (ligne produit) — colonnes créées si absentes ; (b) `finaliserRemboursement_v2` : retour en stock **par ligne** (seulement `retour=inventaire`, l'ancien bloc `type_remb==='avec-retour'` global est retiré) ; (c) écriture inscrite (contre-passation d'abord, comme la vente). Équilibre vérifié sur 6 scénarios (retour/perte/rabais/libre/mixte/retour gratuit). **ÉCRITURE VALIDÉE (2026-07-21), tous les comptes fixés :** débit **4005** = Σ(qté × prix_plein) des articles rendus ; crédit du **compte du mode** (comptant **1205** · interac **1215** · square **1210**) = argent rendu = Σ(qté × prix_remboursé) + montants libres ; **4015** absorbe l'écart produits (crédit de Σprix_plein − Σprix_remboursé) et reçoit le montant libre *promotion* (débit) ; montant libre *livraison* → débit **4010** ; coût des articles rendus (coût unitaire du lot × qté) : retour-inventaire → débit **1310** / crédit **5001** ; perte → débit **5010** / crédit **5001**. NB : COGS = **5001 « Ingrédients »** (le 5100 n'existe pas comme compte, c'est une section) ; **5010 = « Retours invendables »**. `Plan-comptable-Univers-Caresse.md` a été **remis à jour le 2026-07-21** avec les comptes réels (le code vente ET remboursement corrigés de 5100 → 5001).

Données actuelles vérifiées : `Remboursements_Entete_v2` (rem_id, date, client, courriel, tel, type_remb, mode_paiement, total, statut — **pas de ven_id**) ; `Remboursements_Lignes_v2` (rem_id, type, pro_id, format_poids, format_unite, quantite, prix_unitaire, description, montant). Anciens remboursements libres : **conservés tels quels**, la nouvelle règle vaut pour la suite.
5. ✅ **FAIT dans codegs.txt + front-end (2026-07-21, pas déployé) : alarme des cas rares (branche 4).** `verifierCoherenceComptable_v2()` (action GET `verifierCoherenceComptable`, routée dans doGet) couvre **les 4 familles** (Chantal : « tout ») : Vente / Remboursement / Achat finalisés + Lot fabriqué (coût>0) **sans** leur écriture, et écriture `VEN-`/`REM-`/`ACH-`/`LOT-` **vivante sans sa pièce**. Références entièrement contre-passées (net 0 = pièce supprimée proprement) ignorées → pas de faux positif. **Aucune réparation auto** (branche 5). Affichée en bandeau ⚠️ en haut de « Gestion comptable » (`admin-comptabilite.js` → `pcRendreAlarme`, conteneur `#alarme-comptable`, chargée avec le reste, styles inline — pas de CSS touché).
6. À publier au bout : **nouveau déploiement Apps Script + republier le site**.

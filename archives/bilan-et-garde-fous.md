# ITEM — Bilan et Résultat + garde-fous anti-écarts
### Session du 15 juillet 2026. Tout est POSÉ, publication à faire par Chantal.
> Lire `METHODE.md` d'abord. CSS : generique.css seulement, rien de neuf.

---

## 1. LA PAGE « BILAN ET RÉSULTAT » (posée)

### L'arbre validé
1. Deux choix à l'écran : **l'exercice** (année, fin au 31 décembre) et **la période** (du… au…).
2. Bilan = photo à la date de fin. État des résultats = la période choisie.
3. Deux lignes calculées dans l'Avoir : **3015 Bénéfices non répartis** (tout avant le 1er janvier de l'exercice) et **3100 Bénéfice net** (du 1er janvier à la date de fin).
4. Tous les comptes affichés, même à 0,00 $.
5. Structure du plan comptable : sections, sous-totaux, total par classe, vérification **Actif = Passif + Avoir** au bas (✅ / ⚠️).
6. Soldes négatifs : juste le signe moins.
7. Section « Comptes inconnus » = alarme, visible seulement si une écriture porte un numéro absent du plan.
8. Date avant la première écriture = bilan à zéro, normal.

### Les morceaux posés
1. `Code.gs` — porte `getBilanResultats` dans doGet (ligne ~54).
2. `Code.gs` — `getBilanResultats_v2()` : comptes + sections + écritures en un seul voyage (juste avant `ajouterSectionComptable_v2`).
3. `admin/index.html` — menu de gauche : les deux « bientôt » remplacés par un bouton « bilan et résultat » → `afficherSection('bilan-resultats', this)`.
4. `admin/index.html` — menu du haut (dropdown comptabilité) : même remplacement.
5. `admin/index.html` — la section `#section-bilan-resultats` (entête, msg-zone, chargement, contenu), après la section plan comptable.
6. `js/admin.js` — `if (id === 'bilan-resultats') chargerBilanResultats();`.
7. `js/admin-comptabilite.js` — fin de fichier : `chargerBilanResultats`, `brRendreChoix` (année + du/au), `brChangerAnnee`.
8. `js/admin-comptabilite.js` — `brSens` (débit/crédit selon la classe), `brCalculer` (soldes, 3015, 3100, période, comptes inconnus).
9. `js/admin-comptabilite.js` — `brRendreClasse` + `brAfficher` : affichage avec `rangeeitem`, `rangeeitem-valeur`, `lignetotal`, `titre`, `separateur-haut`, `formaterPrix`. **Rien de neuf dans le CSS** (une proposition de classes a été refusée — règle generique).

---

## 2. LE RATTRAPAGE DES ANCIENS ACHATS (fait)

- Fonction `rattraperAchatsAnciens_v2` posée dans un **fichier .gs séparé** (à supprimer quand le bilan est vérifié). Une exécution manuelle depuis l'éditeur.
- Chantal a mis « visa » dans mode_paiement des anciens achats.
- Résultat : **22 écritures créées**, et 3 refusées avec raison.

### La découverte : 3 achats sans lignes (ACH-0025, 0026, 0027)
- Entêtes finalisées, totaux présents, **aucune ligne** dans Achats_Lignes_v2. Vrais achats, factures papier conservées.
- L'écart des sous-totaux entre les deux onglets = exactement ces 3 achats.
- Cause probable : dégâts d'une ancienne version du code (« un Claude qui a tout bousillé »); le code actuel ne peut pas produire ça… sauf le bogue ci-dessous.
- **À faire par Chantal :** rouvrir ces 3 achats, entrer les lignes des factures papier, re-finaliser (stock + écriture se refont seuls). Le rattrapage n'est plus nécessaire pour eux.

---

## 3. LE BOGUE TROUVÉ ET CORRIGÉ : le ✏️ qui effaçait tout de suite

- **Avant :** cliquer ✏️ sur une ligne d'achat l'effaçait immédiatement dans la feuille. Annuler, rafraîchir ou planter = ligne perdue. Explique très probablement les lignes disparues (et des doublons possibles).
- **Corrigé (js/admin-achats.js, 2 trouve-et-remplace) :** le ✏️ n'efface plus rien; l'ancienne ligne ne s'efface qu'au ✓, juste avant l'ajout de la nouvelle; si l'effacement échoue, message et rien ne bouge.

---

## 4. LES GARDE-FOUS POSÉS (l'audit complet)

Principe validé par Chantal : **le serveur ne fait jamais confiance à un chiffre venu de l'écran** — il recalcule ou compare avec la feuille, et **refuse avec message clair** en cas d'écart (rien ne gèle : rafraîchir et recommencer).

1. **Achats — `finaliserAchat_v2` (Code.gs)** : relit les lignes de la feuille; somme ≠ sous-total affiché (> 0,01 $) ou aucune ligne → finalisation refusée.
2. **Ventes — `finaliserVente_v2` (Code.gs)** : même garde-fou (sous-total écran = total_net − livraison + rabais, comparé à la somme des lignes de la feuille).
3. **Fabrication — `saveLot_v2` (Code.gs)** : le coût des ingrédients est **recalculé par le serveur** (recette × prix du stock, comme les emballages) et comparé à l'écran; écart → fabrication refusée, ni lot, ni stock, ni écriture.
4. **Commandes — sens unique décidé** : `total_prevu` = **articles seulement**, toujours. Le montant du paiement = articles + livraison − rabais − acompte, calculé des colonnes.
   - `js/admin-commandes.js` : la proposition n'écrit plus articles+livraison−rabais dans total_prevu (ligne retirée de l'appel `updateCommandeComplete`).
   - `Code.gs` — `updateCommandeComplete_v2` : total_prevu envoyé doit égaler la somme des lignes envoyées.
   - `Code.gs` — `createCommande_v2` : reçoit maintenant les **lignes**, calcule lui-même total et solde, écrit entête + lignes en une opération.
   - `js/admin-commandes.js` : la création envoie `lignes: lignesPayload`, plus de total/solde envoyés, boucle `addCommandeLigne` supprimée.
   - **Fait par Chantal :** la seule commande en cours au vieux total pollué corrigée à la main (colonne F = articles seulement).
5. **Remboursements — rien à faire** : `finaliserRemboursement_v2` calcule déjà le total depuis les lignes de la feuille. ✅
6. **Frais de livraison — `facturerFraisLivraison_v2` (Code.gs)** : poids et tarif Poste Canada **recalculés par le serveur**; écart avec l'écran → frais refusés.
7. **Lien Square de proposition — laissé tel quel, décision** : le choix « prêt / à fabriquer » n'existe qu'à l'écran à ce moment; Chantal voit le montant avant l'envoi; l'item 8 (vérification Square automatique) comparera de toute façon les paiements au solde.

---

## 5. À PUBLIER

- **Nouveau déploiement Apps Script** (Code.gs : bilan, 4 garde-fous, createCommande).
- **Republier le site** (index.html, admin.js, admin-comptabilite.js, admin-achats.js, admin-commandes.js).
- Le fichier .gs de rattrapage : **à supprimer** une fois le bilan vérifié.

## 6. À FAIRE AU RETOUR

1. Publier (les deux).
2. Rentrer les lignes des 3 achats (ACH-0025/0026/0027) avec les factures papier, re-finaliser.
3. Ouvrir « bilan et résultat » : achats au 1305 (stock d'ingrédients), fabrications au 1310 (inventaire), Visa au 2205, et Actif = Passif + Avoir ✅.
4. Décision en suspens : vérifier une à une les fonctions « efface-puis-réécrit » (lignes de commande, lignes de vente, références, coups de cœur, recalcul du stock, sync médiathèque) pour leur protection contre une panne au milieu — proposé, pas encore tranché.

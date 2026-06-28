# À FAIRE — Refonte de la fiche détail d'une commande

**Quoi :** réorganiser l'affichage de la fiche (fonction `voirDetailCommande`, fichier `admin-commandes.js`) pour qu'elle soit plus courte et claire, sur deux colonnes.

**Règle d'or :** affichage seulement. Aucun calcul, statut, stock ou total modifié. On réorganise ce qui existe déjà.

## En-tête (une ligne en haut)
Commande nº · Date · Facture liée

## Colonne de gauche
1. Infos du client : nom, courriel, téléphone, code postal, adresse + bouton « Modifier l'adresse »
2. Notes (déplacées ici, avec le client)
3. Articles commandés, avec le « stock prêt » de chaque article (comme maintenant)

## Colonne de droite — calcul de la facture, dans cet ordre
1. Total des articles (recalculé à partir des lignes)
2. Frais de livraison
3. Escomptes
4. Sous-total
5. Acompte versé
6. Paiement reçu
7. Solde à payer

## Correction importante — paiement piloté par la facture liée
- Commande **payée** (une facture est liée) → « Paiement reçu » = le total, « Solde à payer » = 0,00 $
- Commande **pas encore payée** (aucune facture liée) → « Paiement reçu » = l'acompte versé, « Solde à payer » = ce qui reste
- But : une commande payée n'affiche plus jamais de solde à payer.

## Bas de la fiche (sous les deux colonnes)
- Statut

## Sur téléphone
Les deux colonnes repassent l'une sous l'autre.

## Repères techniques (pour ne pas re-chercher)
- « Total » affiché = montant déjà enregistré (total_prevu + livraison − rabais), pour coller au solde.
- `c.total_prevu` = sous-total des articles. Champs dispo : `c.livraison`, `c.rabais`, `c.acompte`, `c.solde`, `c.ven_id_lien` (= facture liée), `c.lignes` (prix_unitaire, quantite).
- Pas de champ « paiement reçu » stocké : il est déduit selon la règle ci-dessus.
- Réutiliser les classes existantes (form-label, texte-secondaire…) + une grille deux colonnes.

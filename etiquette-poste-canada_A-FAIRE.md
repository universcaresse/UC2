# À FAIRE — Étiquette Poste Canada
### Arbre validé avec Chantal — 21 juin 2026

**But :** générer l'étiquette depuis la fiche commande (statut « À expédier »), imprimer le PDF, et capter le numéro de suivi tout seul (au lieu de le taper).

⚠️ **Central : générer = VRAI ACHAT.** Poste Canada facture le compte sur-le-champ, en un seul geste (pas de « créer » puis « payer » séparés). API Non-Contract Shipping.

**Dépend de :** le compte Poste Canada (numéro de client, adresse d'expédition, clés) ET l'adresse complète du client (étape A).

## 1. Avant de générer
1.1 Adresse complète présente → on peut générer.
1.2 Adresse manquante → on bloque.
1.3 Poids pré-rempli avec celui de la proposition; Chantal le confirme/ajuste avant (vrai colis).
1.4 Poids seulement, pas de dimensions (savon = petit et dense).

## 2. Le moment de générer (ça coûte)
2.1 Avertissement + confirmation OBLIGATOIRE avant de générer (ça facture le compte).
2.2 Confirmation → étiquette créée → PDF à imprimer + numéro de suivi capté tout seul.
2.3 Annule la confirmation → rien ne se passe, rien n'est facturé.

## 3. Quand ça marche — TOUT EN MÊME TEMPS
3.1 Le PDF s'ouvre pour l'impression.
3.2 Le numéro de suivi remplit le champ no_tracage tout seul.
3.3 Générer = aussi marquer « expédiée / Terminée » + envoyer le suivi (courriel + texto) tout de suite. Raison : le colis part immédiatement vers Poste Canada. → le client est avisé au moment de la génération.
3.4 Le PDF est gardé sur la commande pour le réimprimer sans repayer.

## 4. Quand ça accroche
4.1 Poste Canada ne répond pas / erreur claire → message, rien n'est facturé → réessayer.
4.2 Réponse incertaine (coupure) → avertir de vérifier le compte Poste Canada avant de regénérer (éviter de payer 2 fois).
4.3 Adresse refusée → message → corriger l'adresse → réessayer.

## 5. Réimpression / doublon
5.1 Réimprimer la même étiquette → rouvrir le PDF déjà payé, sans racheter.
5.2 Garde-fou : si une étiquette existe déjà, avertir avant d'en générer (et payer) une 2e.

## 6. Cas de commande
6.1 Toujours 1 colis = 1 étiquette.
6.2 Produit « à venir » → 2e envoi plus tard → une 2e étiquette à ce moment-là.

## 7. Annuler une étiquette — À PRÉVOIR
7.1 Bouton « annuler l'étiquette » dans la fiche → annulation auprès de Poste Canada + remboursement (étiquette payée mais non utilisée).

**Note technique :** le suivi (courriel + texto) et le champ no_tracage existent déjà via marquerExpediee.

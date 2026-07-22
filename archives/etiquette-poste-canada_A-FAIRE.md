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
3.3 ~~Générer = aussi marquer « expédiée / Terminée » + envoyer le suivi tout de suite.~~
**CHANGÉ le 2026-07-22.** La raison de juin (« le colis part immédiatement ») ne tient pas : Chantal prépare ses commandes **à la maison** et passe au bureau de poste plus tard. La cliente recevait « votre commande est en route! » alors que le colis était encore sur la table, et suivait un numéro que Poste Canada n'avait pas encore scanné.
Le geste est maintenant **coupé en deux** :
- **Générer l'étiquette** → la commande passe au nouveau statut **« Étiquette prête »**. Rien n'est envoyé à la cliente.
- **Au retour de la poste** → bouton **« 📮 J'ai déposé mes colis »** en tête de la page Commandes : tous les **courriels** partent d'un coup, les commandes passent à « Terminée », puis une liste présente les **textos un par un** (l'appareil n'ouvre les messages que sur un clic direct — un clic par cliente, c'est une limite de l'appareil, pas un choix).
3.4 Le PDF est gardé sur la commande pour le réimprimer sans repayer.

## 4. Quand ça accroche
4.1 Poste Canada ne répond pas / erreur claire → message, rien n'est facturé → réessayer.
4.2 ✅ **FAIT le 2026-07-22.** L'avertissement seul arrivait trop tard, alors la fenêtre de risque a été fermée : **dès que Poste Canada confirme l'achat, le numéro de suivi est inscrit dans la commande (colonne `etiquette_achat_pin`) AVANT d'aller chercher le PDF.** Si la suite casse (PDF, Drive, coupure), la trace existe déjà et le garde-fou refuse un deuxième achat. Le message distingue alors clairement « achetée et payée, va l'imprimer depuis ton compte Poste Canada » d'une erreur ordinaire où rien n'a été facturé.
4.3 Adresse refusée → message → corriger l'adresse → réessayer.

## 5. Réimpression / doublon
5.1 Réimprimer la même étiquette → rouvrir le PDF déjà payé, sans racheter.
5.2 Garde-fou : si une étiquette existe déjà, avertir avant d'en générer (et payer) une 2e.

## 6. Cas de commande
6.1 Toujours 1 colis = 1 étiquette.
6.2 Produit « à venir » → 2e envoi plus tard → une 2e étiquette à ce moment-là.

## 7. Annuler une étiquette — ✅ **FAIT le 2026-07-22**
7.1 Bouton « annuler l'étiquette » dans la fiche → annulation auprès de Poste Canada + remboursement (étiquette payée mais non utilisée).

**Ce qui a été bâti :**
- Le **lien de remboursement** (`rel="refund"`) est maintenant capté à l'achat et gardé dans `etiquette_remb_lien`. C'était le prérequis.
- Bouton **« Annuler l'étiquette »** sur la fiche, visible **uniquement** au statut « Étiquette prête ». Le serveur refuse aussi tout autre statut, avec le motif : une fois le colis parti, Poste Canada ne rembourse plus.
- La demande part chez Poste Canada; le **numéro de billet** revient et se garde dans `etiquette_remb_billet`.
- La commande retourne à **« À expédier »**, et le garde-fou anti double-achat est rouvert (`etiquette_url` et `etiquette_achat_pin` vidés) pour pouvoir générer la bonne étiquette.
- **La comptabilité ne bouge pas ici.** Le frais (débit 5210 / crédit 2205) reste inscrit. Il se défait par contre-passation **seulement** quand Chantal clique « Crédit reçu » dans le panneau *« Étiquettes annulées — remboursement reçu ? »* du journal général — parce que le compte 2205 doit coller au vrai relevé Visa.
- Si Poste Canada refuse (colis déjà scanné), son refus est montré tel quel.

### Ce qui a déjà été vérifié et tranché le 2026-07-22 (avant de coder)
- **Ce n'est pas instantané.** On envoie une *demande* de remboursement; Poste Canada répond tout de suite avec un **numéro de billet de service**, puis tranche en quelques jours. L'étiquette portera donc « remboursement demandé », pas « annulée ».
- 🔴 **Prérequis non fait :** le lien de remboursement n'est donné qu'**au moment de l'achat** (le lien `rel="refund"` de la réponse Poste Canada) et on ne le garde pas. **Il faut le capter et le stocker en même temps que le PDF et le prix**, sinon aucune annulation n'est possible. Aucune étiquette réelle n'existe encore (bac à sable), donc rien n'est perdu.
- **Comptabilité — décidé par Chantal :** l'écriture (débit 5210 / crédit 2205) n'est **PAS** défaite au moment de la demande. Elle se contre-passe seulement quand **le crédit paraît vraiment sur la Visa** — même principe que partout ailleurs : le compte 2205 doit coller au relevé. Il faudra donc un geste « remboursement reçu ».
- **Statut — décidé par Chantal :** annuler l'étiquette ramène la commande à **« À expédier »**.
- **Conséquences mécaniques** (pas besoin de la déranger) : annuler **rouvre la porte** pour générer une nouvelle étiquette (sinon le garde-fou anti double-achat bloquerait), et si Poste Canada **refuse** le remboursement (colis déjà scanné), on montre son refus tel quel sans rien inventer.
- **Simplifié par le changement du 3.3 :** comme la cliente n'est plus avertie à la génération, annuler une étiquette avant le passage au bureau de poste ne demande **rien à défaire de son côté**. Elle n'a jamais rien reçu.

### Reste à trancher avant de coder
- **Rien.** L'arbre est complet (2026-07-22).

**Question retirée le 2026-07-22** — « faut-il prévenir la cliente si on annule après le dépôt ? » : ce cas **n'existe pas**. Poste Canada ne rembourse qu'une étiquette **inutilisée**; une fois le colis déposé et scanné, le service est consommé et le remboursement serait refusé. Donc le bouton « Annuler l'étiquette » ne doit s'afficher **que** pour une commande au statut « Étiquette prête » — jamais après. Et à ce moment-là la cliente n'a jamais été avertie : personne à prévenir.

**Référence technique :** [Request a Shipment Refund — Poste Canada](https://www.canadapost-postescanada.ca/info/mc/business/productsservices/developers/services/onestepshipping/shipmentrefund.jsf). Racine XML `non-contract-shipment-refund-request`, espace de noms `http://www.canadapost.ca/ws/ncshipment-v4`. La réponse donne `serviceTicketId` et `serviceTicketDate`.

**Note technique :** le suivi (courriel + texto) et le champ no_tracage existent déjà via marquerExpediee.

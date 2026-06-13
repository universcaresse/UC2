# Bloc 2 — Il manque du stock
### Scénario coups de cœur — validé par Chantal le 13 juin 2026

---

## Point de départ (commun à tous les blocs)
- Le client coche ses coups de cœur, envoie sa liste avec ses coordonnées
- Je reçois une commande « En attente » — aucun stock touché

---

## SCÉNARIO 2 — Il manque des morceaux

**1 — La commande arrive**
- 1.1 Statut : « En attente », point orange = au moins un produit manque, mais au moins un autre a du stock — aucun stock touché, rien d'envoyé au client
- 1.2 Dans le détail de la commande, chaque ligne a sa propre couleur : vert (assez) / orange (pas assez) / rouge (zéro)

**2 — Je clique « Proposition »**
- 2.1 L'écran de complétion s'ouvre — même écran qu'au bloc 1 (récapitulatif, coordonnées, livraison, promo, lien Square, note)
- 2.2 Je vois les lignes avec leur couleur (vert / orange / rouge) — je sais ce qui manque
- 2.3 Pour chaque produit manquant, je le marque :
  - **Lot en cure** → temporaire, date dispo = date du lot le plus proche qui couvre la quantité demandée — affichée automatiquement, modifiable à la main
  - **Pas encore fabriqué** → temporaire, date = date de la proposition + cure du produit + 7 jours — calculée automatiquement, modifiable à la main
  - **Quantité partielle** → traité comme « pas encore fabriqué » — même calcul automatique, modifiable à la main
  - **Définitif** → info seulement pour le client, aucun choix offert
- 2.4 Le lien Square est généré sur les produits prêts seulement, avec livraison et promos — même mécanique qu'au bloc 1
- 2.5 J'envoie → le stock des produits PRÊTS sort immédiatement. Les temporaires : aucun stock gelé (le stock n'existe pas encore)

**3 — Le client reçoit le courriel**
- 3.1 En haut : mot doux et honnête — voici ce qui est prêt, ce qui s'en vient, ce qui ne sera pas disponible. Note claire : cette proposition reflète le stock d'aujourd'hui — plus vite il répond, mieux c'est
- 3.2 Au milieu : trois sections séparées
  - Les produits prêts avec leurs prix
  - Les temporaires avec leur date de disponibilité prévue
  - Les définitifs — info seulement, aucun choix
- 3.3 En bas : un seul lien vers la page unique. Pas de boutons d'action dans le courriel

**4 — La page unique**
- 4.1 Mêmes trois sections qu'au courriel — prêts / temporaires / définitifs
- 4.2 Pour chaque temporaire : boutons **Garder** / **Laisser tomber**
- 4.3 Les deux boutons principaux n'apparaissent que quand chaque temporaire a sa réponse
- 4.4 Deux portes supplémentaires toujours visibles : **Modifier** / **J'ai une question**

**5 — Il clique « Recevoir ce qui est prêt »**
- 5.1 Il paie via le lien Square
- 5.2 Le stock des prêts est déjà sorti (depuis 2.5) — verrou anti double-sortie en place
- 5.3 Commande originale → « À expédier »
- 5.4 Les temporaires gardés → 2e commande créée automatiquement au statut « En attente de réapprovisionnement », liée à la 1re, avec les dates visibles dans l'admin
- 5.5 Les définitifs → retirés
- 5.6 Le lien Square devient caduc dès le paiement confirmé
- 5.7 Il voit sur la page : confirmation que le prêt est en route, et que tu le recontacteras pour le reste

**6 — Il clique « Attendre que tout soit prêt »**
- 6.1 Le lien Square devient caduc immédiatement
- 6.2 Rien ne sort, rien ne part
- 6.3 Les définitifs sont retirés — il le voit sur la page avec un mot doux
- 6.4 Commande → statut « En attente de réapprovisionnement » avec les dates visibles dans l'admin
- 6.5 Il voit sur la page : confirmation que tu le recontacteras quand tout sera prêt
- 6.6 S'il change d'idée → « J'ai une question »
- 6.7 Quand tu repropose : si entre-temps d'autres produits sont devenus indisponibles → retombe dans un nouveau bloc 2 ou 3

**7 — Il clique « Modifier »**
- 7.1 Il retrouve sa liste complète — prêts, temporaires avec leurs dates, définitifs
- 7.2 Ses réponses aux temporaires (garder / laisser tomber) sont conservées — il ne recommence pas à zéro
- 7.3 Il peut ajouter des produits disponibles pour remplacer ce qui manque
- 7.4 Il renvoie → lien Square caduc → commande passe à « À retravailler » → tu repropose

**8 — Il clique « J'ai une question »**
- 8.1 Mène au formulaire Contact, pré-rempli avec son numéro de commande
- 8.2 Même comportement qu'au bloc 1
- 8.3 Aucun changement automatique — commande inchangée, stock inchangé

---

## TEXTES — essence validée, mots exacts plus tard

**Courriel de proposition**
Ton chaleureux et honnête. Trois sections claires. Note douce sur le stock qui varie — agir vite, c'est mieux. Jamais transactionnel, jamais pressant.

**Page unique — confirmation « Recevoir ce qui est prêt »**
Confirmer que le prêt est en route. Mot doux sur les temporaires gardés — tu reviens vers lui quand c'est disponible.

**Page unique — confirmation « Attendre »**
Confirmer que tu as bien noté. Mentionner les définitifs retirés avec douceur. Lui dire que tu le recontactes quand tout est prêt.

**Page unique — définitifs retirés**
Mot doux, sans jugement. Juste une info claire sur ce qui ne sera pas disponible.

---

## NOTES TECHNIQUES — à savoir avant de coder

- Le stock des prêts sort à l'envoi, pas au paiement — même logique que le bloc 1.
- Les temporaires : aucun stock gelé. Risque assumé — si le stock manque à la reproposition, on retombe en bloc 2 ou 3.
- La 2e commande est créée au moment du clic « Recevoir ce qui est prêt », après que le client a répondu à tous les temporaires.
- Le lien Square est généré avant l'envoi, sur les prêts seulement.
- « Modifier » conserve les réponses aux temporaires.
- Statut de la 2e commande : « En attente de réapprovisionnement ».
- Les réponses aux temporaires (garder / laisser tomber) sont sauvegardées dans le localStorage du navigateur, clé par cmd_id. Si le client ferme et revient avec le même lien, il retrouve ses réponses.

**Ce qui n'existe pas encore et devra être créé :**

- `Commandes_Lignes_v2` a 7 colonnes aujourd'hui : cmd_id · pro_id · format_poids · format_unite · quantite · prix_unitaire · lots. Les colonnes bloc 2 s'ajoutent en col 8 (type : prêt/temporaire/définitif) et col 9 (date_dispo).
- `getCommandePublique_v2` devra retourner le type et la date de dispo de chaque ligne en plus des infos actuelles.
- Le temps de cure est dans `Produits_v2` col 11 (`pro.cure`). La date de dispo d'un temporaire = date_fabrication + cure — même calcul que dans `admin-fabrication.js`, déjà éprouvé.
- Pour « lot en cure » : lire `date_disponibilite` directement dans `Lots_v2` (déjà calculée et stockée à la création du lot). Prendre le lot le plus proche qui couvre la quantité demandée.
- Pour « pas encore fabriqué » ou « quantité partielle » : date = aujourd'hui + cure du produit + 7 jours.
- Nouvelle fonction `enregistrerReponsesTemporaires` : sauvegarde les réponses du client (garder / laisser tomber) par cmd_id.
- Nouvelle fonction `recevoirPret` : déclenche le paiement, crée la 2e commande pour les gardés, retire les définitifs, caduce le lien Square.
- Nouvelle fonction `attendreTout` : caduce le lien Square, retire les définitifs, passe la commande à « En attente de réapprovisionnement ».
- Nouvelle fonction `creerCommandeLiee` : crée la 2e commande avec un lien vers la 1re.
- Le statut « En attente de réapprovisionnement » doit être ajouté dans le filtre de l'admin (`admin-commandes.js`).

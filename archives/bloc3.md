# Bloc 3 — Rien n'est prêt
### Scénario coups de cœur — en cours

---

## Point de départ (commun à tous les blocs)
- Le client coche ses coups de cœur, envoie sa liste avec ses coordonnées
- Je reçois une commande « En attente » — aucun stock touché

---

## SCÉNARIO 3 — Rien n'est disponible maintenant

**1 — La commande arrive**
- 1.1 Statut : « En attente », point rouge = zéro stock sur tous les produits demandés
- 1.2 Impacts : aucun stock touché, rien d'envoyé au client

**2 — Je clique « Proposition »**
- 2.1 L'écran de complétion s'ouvre — même écran qu'aux blocs 1 et 2
- 2.2 Toutes les lignes sont rouges — je marque chaque produit :
  - **Lot en cure** → temporaire, date dispo = date du lot le plus proche qui couvre la quantité — affichée automatiquement, modifiable à la main
  - **Pas encore fabriqué** → temporaire, date = aujourd'hui + cure du produit + 7 jours — calculée automatiquement, modifiable à la main
  - **Définitif** → info seulement pour le client, aucun choix offert
- 2.3 Pas de lien Square — rien n'est prêt, rien à payer maintenant
- 2.4 J'envoie → aucun stock ne sort (il n'y en a pas)

**3 — Le client reçoit le courriel**
- 3.1 En haut : mot doux et honnête — rien n'est disponible maintenant, mais voici ce qui s'en vient et quand
- 3.2 Au milieu : deux sections seulement
  - Les temporaires avec leur date de disponibilité prévue
  - Les définitifs — info seulement, aucun choix
- 3.3 Note claire : cette proposition reflète le stock d'aujourd'hui — plus vite il répond, mieux c'est
- 3.4 En bas : un seul lien vers la page unique

**4 — La page unique**
- 4.1 Deux sections — temporaires / définitifs (pas de section prêts)
- 4.2 Pour chaque temporaire : boutons **Garder** / **Laisser tomber**
- 4.3 Les boutons principaux n'apparaissent que quand chaque temporaire a sa réponse
- 4.4 Deux portes supplémentaires toujours visibles : **Modifier** / **J'ai une question**

**5 — Il clique « Attendre que tout soit prêt »**
- 5.1 Aucun paiement — rien à payer maintenant
- 5.2 Les définitifs sont retirés — il le voit sur la page avec un mot doux
- 5.3 Commande → statut « En attente de réapprovisionnement » avec les dates visibles dans l'admin
- 5.4 Il voit sur la page : confirmation que tu le recontacteras quand tout sera prêt
- 5.5 S'il change d'idée → « J'ai une question »
- 5.6 Quand tu repropose : si entre-temps d'autres produits sont devenus indisponibles → retombe dans un nouveau bloc 3

**6 — Il laisse tomber tous les temporaires**
- 6.1 Il ne reste que des définitifs — aucun choix possible
- 6.2 La page lui dit clairement que sa commande ne peut pas être honorée
- 6.3 Il confirme → même chemin que 3.d du bloc 1 (annulation)

**7 — Il clique « Modifier »**
- 7.1 Il retrouve sa liste complète — temporaires avec leurs dates, définitifs
- 7.2 Ses réponses aux temporaires sont conservées — il ne recommence pas à zéro
- 7.3 Il peut ajouter des produits disponibles — si des prêts s'ajoutent, on bascule vers le bloc 2
- 7.4 Il renvoie → commande passe à « À retravailler » → tu repropose

**8 — Il clique « J'ai une question »**
- 8.1 Mène au formulaire Contact, pré-rempli avec son numéro de commande
- 8.2 Même comportement qu'aux blocs 1 et 2
- 8.3 Aucun changement automatique

**9 — Il ne répond pas**
- 9.1 Un compte de 7 jours démarre à l'envoi de la proposition
- 9.2 À 7 jours sans réponse → point orange = il est temps d'aller vérifier
- 9.3 Je clique Relancer → rappel doux au client qu'on attend sa réponse sur les temporaires. Mêmes portes disponibles : Modifier / J'ai une question. Ton qui couvre l'oubli sans accuser
- 9.4 Le compteur ne repart pas à zéro — il suit le début du processus
- 9.5 À 14 jours sans réponse → point rouge = priorité, il faut trancher
- 9.6 Rien ne s'annule tout seul. C'est moi qui clique Annuler — la proposition est annulée, aucun stock à remettre (rien n'est sorti), une note est ajoutée : « proposition annulée — sans réponse »

---

## TEXTES — essence à valider, mots exacts plus tard

**Courriel de proposition**
Ton plus doux qu'au bloc 2 — la situation est plus délicate. Honnête sans être décourageant. Mettre en valeur ce qui s'en vient plutôt que ce qui manque. Note douce sur le stock qui varie.

**Page unique — confirmation « Attendre »**
Confirmer que tu as bien noté. Mentionner les définitifs retirés avec douceur. Lui dire que tu le recontactes quand tout est prêt.

**Page unique — il a tout laissé tomber**
Lui dire clairement que ça devient une annulation. Ton doux, sans jugement. Même chemin que l'annulation du bloc 1.

---

## DÉCISIONS À TRANCHER

- ✅ Si tout est définitif dès le départ (zéro temporaire) : on envoie quand même le courriel vers la page unique — le client peut toujours modifier et ajouter des produits disponibles.
- ✅ Délai orange/rouge : même 7 jours / 14 jours qu'aux blocs 1 et 2. Le point orange dans ce bloc signifie priorité — à traiter avant les autres commandes.

---

## NOTES TECHNIQUES — à savoir avant de coder

- Pas de lien Square à générer dans ce bloc.
- Pas de stock à sortir à l'envoi.
- Si le client ajoute des produits disponibles via « Modifier » → bascule automatique vers le bloc 2.
- Même localStorage pour les réponses aux temporaires que le bloc 2.
- Statut d'attente : « En attente de réapprovisionnement » — même que le bloc 2.

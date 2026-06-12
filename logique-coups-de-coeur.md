# Univers Caresse — Document de reprise

À coller au début d'une nouvelle conversation pour continuer sans tout recommencer.

---
 
## RÈGLES DE TRAVAIL (à respecter absolument)

- **Aucun code sans mon OK explicite.** Quand on construira : par trouve-et-remplace, un changement à la fois, attendre un OK entre chaque.
- **Pas de solution proposée sans analyse complète.**
- **Une question à la fois.** Pas trois questions empilées.
- **Parle en clair, pas en code.** Je ne lis pas le code. Si tu mets du code ou du jargon dans une explication, je saute le paragraphe.
- **Les scénarios se font en puces, jamais en paragraphes.** Les paragraphes n'aident pas ma compréhension.
- **Ne me demande jamais si je veux arrêter, faire une pause, ou continuer plus tard.** Ce n'est pas à toi de décider de mon horaire. Je mène, tu suis.
- **Ne me demande pas la permission d'inclure un morceau qui fait déjà partie du scénario.** Si c'est dans le plan, c'est acquis. On jase du « comment », pas du « si ».
- **On ne construit jamais sur une supposition.**
- **On reste côté client d'abord.** Le côté Chantal (admin) vient après.
- **On parle des chemins voulus, normaux** — pas des bugs ni des pannes.

---

## LE SYSTÈME EN BREF

- Boutique sans panier classique.
- Le client coche ses « coups de cœur », envoie sa liste avec ses coordonnées.
- Ça crée une commande « En attente » côté admin.
- Chantal prépare une proposition (livraison, rabais, lien Square), l'envoie.
- Le client paie → ça devient une vente → expédition.
- Décision de fond : **le client ne calcule jamais rien lui-même** (ni livraison, ni promo, ni total). C'est toujours Chantal qui prépare et renvoie. « Il y a une conversation, pas un panier. »

---

## LES STATUTS D'UNE COMMANDE (existants aujourd'hui)

- **En attente** — la demande vient d'arriver, aucun stock touché
- **En attente de paiement** — proposition envoyée, stock gelé (réservé pour ce client)
- **À expédier** — payée
- **Terminée** — expédiée
- **Annulée**

Nouveau statut décidé pour la branche 1.b (voir plus bas) :
- **À retravailler** — le client a renvoyé une liste modifiée

---

# BRANCHE 1.b — « CHANGER SA COMMANDE » (TRANCHÉE ✅)

Contexte : le client a reçu sa proposition par courriel. Au lieu de payer, il veut modifier sa commande.

## La boucle complète, en puces

- Le client clique sur un lien dans son courriel de proposition
- La page va chercher sa commande chez nous (le lien transporte seulement le numéro CMD-XXXX)
- La page vérifie le statut de la commande :
  - Si elle n'est **pas** « En attente de paiement » → message (à composer plus tard) qui finit par un bouton **Fermer** → retour à l'accueil
  - Si elle **est** « En attente de paiement » → on lui montre sa commande et il peut travailler
- Il revient dans **sa liste de coups de cœur** (la même qu'il connaît déjà sur le site)
- Il peut seulement : **enlever** un produit / **changer une quantité** / **rajouter** un produit
- Il ne touche à **rien d'autre** : pas de livraison, pas de promo, pas de total à payer
- Il renvoie sa liste modifiée
- **Les produits gelés restent gelés** — on ne relâche RIEN automatiquement
- La commande change de statut → **« À retravailler »** → elle se déplace dans le tableau admin pour attirer l'œil de Chantal
- Chantal voit **les deux versions côte à côte** :
  - la commande d'origine
  - ce que le client demande maintenant
- Chantal compare, puis refait sa proposition à partir de la **nouvelle** liste
- La nouvelle proposition **devient** la commande
- L'ancienne version **disparaît** (on la jette — c'est juste des savons)

## Décisions de fond derrière cette boucle

- **Affichage à l'arrivée :** on va chercher la commande chez nous au moment du clic (le lien ne transporte que le numéro). On NE met PAS toute la commande dans le lien (un lien a une limite de longueur → ce serait construire sur une supposition).
- **Le gel des produits :** quand le client modifie, ses produits réservés ne sont PAS relâchés. C'est Chantal qui décide quoi relâcher, plus tard, en retravaillant la commande. But : garder ses produits pour pouvoir terminer sa commande en priorité, et empêcher que quelqu'un d'autre lui prenne ses savons pendant qu'il hésite.
- **Qui recalcule :** jamais le client. Une modification = une demande qui revient à Chantal, comme le tout premier envoi de coups de cœur.
- **Garder les deux versions :** l'ancienne sert UNIQUEMENT à comparer. Une fois la nouvelle proposition refaite, l'ancienne est jetée.

## CE QUI EXISTE DÉJÀ (côté client)

- Le système de coups de cœur complet : liste sauvegardée, ajouter / retirer / changer quantité, la modal (liste → coordonnées → merci)
- La page vitrine avec sa section « Merci » (retour après paiement Square)

## CE QUI MANQUE (à construire pour 1.b)

1. **Une page d'atterrissage** où le client arrive quand il clique sur le lien — dans notre décor (mêmes couleurs, même douceur), avec sa commande devant lui
2. **La récupération de la commande** : la page lit le numéro et va chercher le contenu de la commande chez nous
3. **La vérification du statut** : modifiable seulement si « En attente de paiement », sinon le message + Fermer
4. **Recharger sa liste de coups de cœur** avec ce qu'il avait déjà commandé (au lieu d'une liste vide)
5. **Le retour de la liste modifiée** : ça ne crée PAS une nouvelle commande, ça garde le gel, et ça met la commande en « À retravailler »
6. **L'affichage des deux versions côte à côte** côté admin (origine + nouvelle demande)
7. **Le bouton « Changer ma commande » dans le courriel** — branché **EN DERNIER**, une fois que tout le reste est prêt (sinon le bouton mènerait à du vide)

## PRÉCISIONS (pour ne JAMAIS réinventer de faux problèmes)

- **Sa liste de coups de cœur = sa commande. C'est la même chose.** Il n'y a pas deux objets différents. On a son numéro, on va chercher sa commande, il la modifie. Point. Ne pas réintroduire d'histoire de « navigateur », d'« appareil », ou de liste qui vivrait ailleurs.
- **Garder les deux versions n'est pas un problème.** La feuille (sheet) a autant de colonnes et de lignes qu'on veut. On range l'ancienne version dedans le temps de comparer, puis on la jette. Aucune limite à contourner.

## ORDRE DE CONSTRUCTION (logique, à confirmer au moment de bâtir)

- D'abord : la page d'atterrissage + récupération de la commande + vérification du statut
- Ensuite : recharger la liste + le retour modifié + le nouveau statut + les deux versions
- En tout dernier : le bouton dans le courriel qui pointe vers tout ça

## DÉTAILS LAISSÉS POUR PLUS TARD (décor, pas mécanique)

- Le texte exact du message quand la commande n'est plus modifiable
- Ce qu'on affiche pendant le petit temps de chargement (vide / mot d'attente / spinner)
- Le placement exact du bouton dans le courriel

---

## ÉTAPES DE RÉALISATION (à faire dans cet ordre, un OK entre chaque)

Rappel : aucune ligne de code sans mon OK. Par trouve-et-remplace, un changement à la fois.

### Étape 1 — La page d'atterrissage (le décor où le client arrive)
- Créer un nouvel endroit, dans notre décor habituel (mêmes couleurs, même douceur), où le client atterrit en cliquant sur le lien.
- Au départ, cette page ne fait rien d'autre qu'exister et s'afficher proprement.
- Pas encore de commande dedans, pas encore de logique. Juste la coquille.

### Étape 2 — Lire le numéro de commande
- La page doit savoir reconnaître le numéro de commande (CMD-XXXX) transporté par le lien.
- Tant qu'on n'a pas de numéro valide, la page ne tente rien.

### Étape 3 — Aller chercher la commande
- Avec le numéro, la page demande chez nous : « montre-moi cette commande ».
- Elle reçoit le contenu : les produits, les quantités, les prix.

### Étape 4 — Vérifier si la commande est modifiable
- Si la commande est « En attente de paiement » → on continue, il pourra modifier.
- Sinon (préparée, terminée, annulée, etc.) → on affiche le message (texte à composer plus tard) qui finit par un bouton **Fermer** → retour à l'accueil.

### Étape 5 — Afficher la commande, prête à être modifiée
- On montre sa commande (= sa liste de coups de cœur).
- Il peut : enlever un produit / changer une quantité / rajouter un produit.
- Rien d'autre : pas de livraison, pas de promo, pas de total.

### Étape 6 — Renvoyer la liste modifiée (le retour)
- Quand il a fini, il renvoie sa liste.
- Les produits gelés **restent gelés** (on ne relâche rien).
- On range l'ancienne version à côté de la nouvelle (colonnes/lignes en plus dans la feuille).
- La commande passe au statut **« À retravailler »**.

### Étape 7 — Le bouton dans le courriel (EN DERNIER)
- Une fois que tout ce qui précède fonctionne, on ajoute le bouton « Changer ma commande » dans le courriel de proposition.
- Ce bouton transporte le numéro de commande et pointe vers la page d'atterrissage.
- On le branche en dernier pour qu'il ne mène jamais à du vide.

### Plus tard (côté Chantal — pas maintenant)
- Afficher les deux versions côte à côte dans le tableau admin.
- Faire apparaître le nouveau statut « À retravailler » dans le tableau.
- Quand Chantal refait sa proposition à partir de la nouvelle liste : la nouvelle devient la commande, l'ancienne est jetée.

---

## CE QU'IL FAUT POUR CHAQUE ÉTAPE (les ingrédients, pas le code)

Rappel des fichiers en jeu :
- `index.html` — la page vitrine publique (le décor, les sections)
- `main-demande.js` — le système de coups de cœur (liste, ajouter/retirer/quantité, la modal)
- `Code.gs` (uc2) — le serveur (va chercher et range les données)

### Étape 1 — La page d'atterrissage
- Une **nouvelle section** dans `index.html`, bâtie sur le même modèle que les sections existantes (comme la section « Merci »).
- On réutilise le décor déjà là (mêmes classes de style, mêmes couleurs). Rien de neuf à dessiner.
- Cette section contient juste : un espace pour afficher la commande, et un espace pour le message « pas modifiable » + bouton Fermer.
- Aucun serveur à ce stade.

### Étape 2 — Lire le numéro de commande
- Le numéro voyage dans l'adresse du lien (par exemple `...?modifier=CMD-0042`).
- Un petit bout de logique dans `main-demande.js` qui, au chargement de la page, regarde si ce numéro est présent dans l'adresse.
- Si oui → on déclenche le mode « modifier ». Si non → la page reste normale.
- **À décider au moment de bâtir :** le mot exact utilisé dans l'adresse (`modifier`, `commande`, etc.).

### Étape 3 — Aller chercher la commande
- Le serveur sait déjà répondre à « donne-moi cette commande » (les fonctions existent déjà dans `Code.gs` : entête + lignes). On les réutilise, rien à créer côté serveur.
- On reçoit : produits, quantités, prix, **et le statut**.
- **Point important :** les lignes de commande contiennent les numéros de produits, pas leurs noms ni leurs photos. Pour les afficher joliment dans la liste de coups de cœur, on doit relier chaque numéro de produit au catalogue (déjà chargé sur le site) pour retrouver nom, photo, collection, gamme.

### Étape 4 — Vérifier si la commande est modifiable
- On regarde le statut reçu à l'étape 3.
- Si « En attente de paiement » → on passe à l'affichage (étape 5).
- Sinon → on affiche le message + bouton Fermer (le Fermer ramène à l'accueil, comme les boutons « retour » déjà présents).
- C'est une simple vérification, aucun nouveau morceau de serveur.

### Étape 5 — Afficher la commande, prête à modifier
- On **réutilise la liste de coups de cœur qui marche déjà** (`main-demande.js` : l'affichage de la liste, les boutons − / + / Retirer).
- Le seul ajout : remplir cette liste avec les produits de la commande qu'on vient de chercher, puis l'afficher.
- Les boutons existants font déjà le travail (enlever / changer quantité / rajouter). Quasi rien de neuf.

### Étape 6 — Renvoyer la liste modifiée (LE GROS MORCEAU)
- C'est ici qu'il faut **créer une nouvelle fonction serveur** dans `Code.gs` (il n'en existe pas pour ça).
- Cette fonction doit, en un seul geste :
  - **garder les produits gelés** (donc surtout NE PAS appeler la fonction qui relâche le stock)
  - **ranger l'ancienne version à côté de la nouvelle** dans la feuille. **DÉCIDÉ : des lignes en plus** (pas des colonnes). On garde les lignes d'origine telles quelles, on ajoute les nouvelles lignes en-dessous marquées « nouvelle version ». Ça gère un produit enlevé, ajouté, ou une quantité changée. Une fois la proposition refaite par Chantal, on jette les lignes d'origine.
  - **changer le statut** de la commande pour « À retravailler »
- Côté `main-demande.js` : au moment d'envoyer, on appelle **cette nouvelle fonction** (et non `envoyerDemandeCommande`, qui elle crée une commande neuve).
- Un petit écran de confirmation pour le client (« on a bien reçu vos changements »), bâti sur le modèle de l'écran « Merci » déjà existant.
- **À décider au moment de bâtir :** comment exactement on range l'ancienne version (colonnes en plus vs lignes en plus).

### Étape 7 — Le bouton dans le courriel
- Dans `Code.gs`, la fonction qui construit le courriel de proposition (`envoyerProposition_v2`) contient déjà le bouton « payer ».
- On y ajoute un **deuxième bouton** « Changer ma commande ».
- Ce bouton pointe vers l'adresse de la page d'atterrissage, avec le numéro de commande dedans (le format décidé à l'étape 2).
- Branché en dernier, pour qu'il ne mène jamais à du vide.

---

## OÙ ON EST RENDUS

- **Branche 1.b : réflexion TERMINÉE et PRÊTE À CONSTRUIRE côté client.** Tout est tranché ci-dessus. Les deux « faux problèmes » (navigateur / garder deux versions) ont été écartés — voir la section PRÉCISIONS. Ne pas les rouvrir.
- Prochaines branches client non encore réfléchies en détail : 1.c (question / ajustement), 1.d (annuler), et les chemins #2 et #3 (commande partielle / rien de prêt).
- Côté Chantal (admin) : à faire après le côté client.

---

## POUR REPRENDRE

Phrase suggérée pour démarrer une nouvelle conversation :

> Voici le document de reprise + les fichiers. La branche 1.b (changer sa commande) est tranchée — tout est dans le md. On respecte les règles de travail listées en haut. On continue où on est rendus.

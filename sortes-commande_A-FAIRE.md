# À FAIRE — Les 3 sortes de commande (proposition)
### Chantier unique. **Fusion faite le 2026-07-22** de `sortes-commande`, `bloc2 - il manque du stock` et `bloc3` : c'était le même sujet éparpillé en trois fichiers.

**Le sujet :** la proposition envoyée à la cliente doit gérer trois sortes de produits dans une même commande.
- **Prêt** → on montre le prix
- **À venir** (temporaire) → on montre une date (« disponible vers le… »)
- **Pas disponible** (définitif) → info seulement, ni prix ni date

**Point de départ, commun aux trois :** la cliente coche ses coups de cœur et envoie sa liste. Une commande arrive « En attente » — **aucun stock touché**.

---

# PARTIE A — L'ÉTAT DU CODE (diagnostic du 28 juin 2026)

## A.1 Sorte 1 — tout en stock
Le diagnostic de juin dit : **ne fonctionne pas de bout en bout, à reprendre.**

⚠️ **Contradiction non tranchée (2026-07-22) :** en vérifiant le scénario du bloc 1, j'ai trouvé **toutes ses pièces bâties** — les trois portes du courriel, le lien Square gardé puis fermé, les points orange/rouge, la page Modifier, l'annulation, le formulaire Contact prérempli. Les deux peuvent être vrais : les morceaux existent sans que le chemin complet tienne. **Seul un vrai test tranchera.** Scénario détaillé dans `archives/bloc1-jai-tout.md`.

## A.2 Sorte 2 — il manque du stock — **cassée**
- « Recevoir ce qui est prêt » expédie **sans faire payer** et **ferme le lien de paiement** → une seule et même cause, voir **A.4**.
- Crée une 2e commande **inutilisable** (quantité 1, prix 0 $).
  **Cause exacte, vérifiée le 2026-07-22** dans `creerCommandeLiee` : chaque ligne est écrite avec `parseInt(l.quantite) || 1` — la quantité retombe à **1** si elle n'est pas transmise — et un **`0` écrit en dur** à la place du prix. Ce n'est pas un accident de données : c'est dans le code.

## A.3 Sorte 3 — rien de prêt — **morte**
La proposition ne part même pas : le code tente de sortir un stock qui n'existe pas, ça échoue, la cliente ne reçoit rien.

## A.4 La faille de fond sous les sortes 2 et 3 — **détaillée le 2026-07-22, code en main**

**Le code suppose que cliquer = avoir payé.** Voici ce que `recevoirPret` fait aujourd'hui, **au clic de la cliente, donc avant tout paiement** :
1. passe la commande à **« À expédier »**, comme si elle était réglée;
2. crée la 2e commande pour les temporaires gardés;
3. **ferme le lien Square** (`annulerLienSquare_v2`).

Résultat : la cliente clique, s'en va payer… et trouve un lien mort. Elle **ne peut plus payer**. Et Chantal voit une commande « À expédier » que personne n'a réglée.

Les deux symptômes de A.2 — « expédie sans faire payer » et « ferme le lien de paiement » — ne sont donc **pas deux bogues, mais un seul** : cette supposition.

**La détection automatique de Square (item 8) ne règle PAS ça** : elle sait reconnaître un lien payé, mais ici le lien est détruit avant que le paiement existe. Il n'y a jamais rien à détecter.

**La correction sera d'inverser l'ordre :** le clic n'enregistre que le choix de la cliente. Le passage à « À expédier », la création de la 2e commande et la fermeture du lien attendent la **confirmation du paiement** — que la détection automatique sait maintenant fournir. **La pièce qui manquait en juin existe aujourd'hui; c'est la séquence qui est à refaire.**

## A.5 À NE PAS « corriger » — fausses alertes, c'est correct
- Le stock sort la bonne version (les prêts seulement).
- La page cliente reçoit bien le type de chaque ligne.
- La date de proposition est bien écrite.

## A.6 🔴 Avertissement avant de reprendre
Les sortes 2 et 3 contiennent des **décisions jamais validées par Chantal**, faites par un assistant précédent. **Ne pas traiter le comportement existant comme une intention validée** : tout re-dérouler avec elle, branche par branche (règle 1.9).

---

# PARTIE B — SORTE 2 : IL MANQUE DU STOCK
### Scénario validé par Chantal le 13 juin 2026

**1 — La commande arrive**
- 1.1 « En attente », **point orange** = au moins un produit manque, au moins un autre a du stock. Aucun stock touché, rien d'envoyé.
- 1.2 Dans le détail, chaque ligne a sa couleur : vert (assez) / orange (pas assez) / rouge (zéro).

**2 — Je clique « Proposition »**
- 2.1 Même écran de complétion qu'à la sorte 1.
- 2.2 Je vois les lignes avec leur couleur — je sais ce qui manque.
- 2.3 Pour chaque produit manquant, je le marque :
  - **Lot en cure** → temporaire, date = celle du lot le plus proche qui couvre la quantité, affichée automatiquement, modifiable.
  - **Pas encore fabriqué** → temporaire, date = proposition + cure du produit + 7 jours, calculée automatiquement, modifiable.
  - **Quantité partielle** → traité comme « pas encore fabriqué ».
  - **Définitif** → info seulement, aucun choix offert.
- 2.4 Le lien Square est généré **sur les produits prêts seulement**, avec livraison et promos.
- 2.5 J'envoie → le stock des **prêts sort immédiatement**. Les temporaires : aucun stock gelé (il n'existe pas encore).

**3 — La cliente reçoit le courriel**
- 3.1 Mot doux et honnête : ce qui est prêt, ce qui s'en vient, ce qui ne sera pas disponible. Note claire que la proposition reflète le stock d'aujourd'hui — plus vite elle répond, mieux c'est.
- 3.2 Trois sections : prêts avec prix · temporaires avec date · définitifs (info seulement).
- 3.3 Un seul lien vers la page unique. **Aucun bouton d'action dans le courriel.**

**4 — La page unique**
- 4.1 Mêmes trois sections.
- 4.2 Pour chaque temporaire : **Garder** / **Laisser tomber**.
- 4.3 Les deux boutons principaux n'apparaissent **que quand chaque temporaire a sa réponse**.
- 4.4 Deux portes toujours visibles : **Modifier** / **J'ai une question**.

**5 — « Recevoir ce qui est prêt »**
- 5.1 Elle paie via le lien Square.
- 5.2 Le stock des prêts est déjà sorti (2.5) — verrou anti double-sortie en place.
- 5.3 Commande originale → « À expédier ».
- 5.4 Les temporaires gardés → **2e commande** créée automatiquement, « En attente de réapprovisionnement », liée à la 1re, dates visibles dans l'admin.
- 5.5 Les définitifs → retirés.
- 5.6 Le lien Square devient caduc dès le paiement confirmé.
- 5.7 Elle voit la confirmation : le prêt est en route, tu la recontactes pour le reste.

**6 — « Attendre que tout soit prêt »**
- 6.1 Lien Square caduc immédiatement. 6.2 Rien ne sort, rien ne part.
- 6.3 Définitifs retirés — elle le voit avec un mot doux.
- 6.4 Commande → « En attente de réapprovisionnement », dates visibles dans l'admin.
- 6.5 Confirmation que tu la recontactes quand tout sera prêt. 6.6 Si elle change d'idée → « J'ai une question ».
- 6.7 À la reproposition, si d'autres produits sont devenus indisponibles → on retombe dans une sorte 2 ou 3.

**7 — « Modifier »**
- 7.1 Elle retrouve sa liste complète — prêts, temporaires avec dates, définitifs.
- 7.2 **Ses réponses aux temporaires sont conservées** — elle ne recommence pas à zéro.
- 7.3 Elle peut ajouter des produits disponibles pour remplacer ce qui manque.
- 7.4 Elle renvoie → lien Square caduc → commande à « À retravailler » → tu reproposes.

**8 — « J'ai une question »** → formulaire Contact prérempli avec son numéro de commande. Aucun changement automatique : commande et stock inchangés.

---

# PARTIE C — SORTE 3 : RIEN N'EST PRÊT
### Scénario en cours (bloc 3)

**1 — La commande arrive** : « En attente », **point rouge** = zéro stock sur tous les produits. Rien touché, rien envoyé.

**2 — Je clique « Proposition »**
- 2.1 Même écran qu'aux sortes 1 et 2. 2.2 Toutes les lignes rouges — je marque chaque produit (lot en cure / pas encore fabriqué / définitif), mêmes calculs de date qu'à la sorte 2.
- 2.3 **Pas de lien Square** — rien n'est prêt, rien à payer maintenant.
- 2.4 J'envoie → aucun stock ne sort.

**3 — Le courriel** : mot doux et honnête — rien n'est disponible maintenant, mais voici ce qui s'en vient et quand. Deux sections seulement (temporaires avec dates · définitifs). Note sur le stock qui varie. Un seul lien.

**4 — La page unique** : deux sections, **Garder / Laisser tomber** par temporaire, boutons principaux seulement quand tout a une réponse, plus **Modifier** / **J'ai une question**.

**5 — « Attendre que tout soit prêt »** : aucun paiement. Définitifs retirés avec un mot doux. Commande → « En attente de réapprovisionnement », dates visibles. Confirmation que tu la recontactes. Si elle change d'idée → « J'ai une question ». À la reproposition, si d'autres produits deviennent indisponibles → nouvelle sorte 3.

**6 — Elle laisse tomber tous les temporaires** : il ne reste que des définitifs, aucun choix possible. La page dit clairement que la commande ne peut pas être honorée. Elle confirme → **même chemin que l'annulation de la sorte 1**.

**7 — « Modifier »** : liste complète, réponses conservées, elle peut ajouter des produits disponibles → **bascule vers la sorte 2**. Elle renvoie → « À retravailler ».

**8 — « J'ai une question »** → formulaire Contact prérempli. Aucun changement automatique.

**9 — Elle ne répond pas**
- 9.1 Compte de 7 jours dès l'envoi de la proposition. 9.2 À 7 jours → **point orange**, il est temps d'aller voir.
- 9.3 Je clique Relancer → rappel doux qu'on attend sa réponse sur les temporaires, mêmes portes offertes, ton qui couvre l'oubli sans accuser.
- 9.4 Le compteur **ne repart pas à zéro** — il suit le début du processus.
- 9.5 À 14 jours → **point rouge**, priorité, il faut trancher.
- 9.6 Rien ne s'annule tout seul. C'est moi qui annule — aucun stock à remettre (rien n'est sorti), note ajoutée : « proposition annulée — sans réponse ».

---

# PARTIE D — LES TEXTES (essence validée, mots exacts plus tard)

- **Courriel sorte 2** — chaleureux et honnête, trois sections claires, note douce sur le stock qui varie. Jamais transactionnel, jamais pressant.
- **Courriel sorte 3** — **plus doux encore** : la situation est plus délicate. Honnête sans décourager. Mettre en valeur ce qui s'en vient plutôt que ce qui manque.
- **Confirmation « Recevoir ce qui est prêt »** — le prêt est en route; mot doux sur les temporaires gardés, tu reviens vers elle.
- **Confirmation « Attendre »** — tu as bien noté; définitifs retirés avec douceur; tu la recontactes quand tout est prêt.
- **Définitifs retirés** — mot doux, sans jugement, juste une info claire.
- **Elle a tout laissé tomber** — lui dire clairement que ça devient une annulation, ton doux, sans jugement.

---

# PARTIE E — NOTES TECHNIQUES (avant de coder)

**Communes aux sortes 2 et 3**
- Le stock des prêts sort **à l'envoi**, pas au paiement — même logique que la sorte 1.
- Les temporaires : **aucun stock gelé**. Risque assumé — si le stock manque à la reproposition, on retombe en sorte 2 ou 3.
- Réponses aux temporaires (garder / laisser tomber) gardées dans le **localStorage du navigateur**, par `cmd_id` : si la cliente ferme et revient avec le même lien, elle les retrouve.
- Statut d'attente commun : **« En attente de réapprovisionnement »**.
- Le temps de cure est dans `Produits_v2` col 11 (`pro.cure`).
- « Lot en cure » → lire `date_disponibilite` dans `Lots_v2` (déjà calculée à la création du lot), prendre le lot le plus proche qui couvre la quantité.
- « Pas encore fabriqué » / « quantité partielle » → aujourd'hui + cure + 7 jours.
- La 2e commande est créée **au clic « Recevoir ce qui est prêt »**, après que la cliente a répondu à tous les temporaires.

**Sorte 3 seulement** : pas de lien Square à générer, pas de stock à sortir. Si la cliente ajoute des produits disponibles via « Modifier » → bascule automatique vers la sorte 2.

**Ce qui devait être créé** *(liste du 13 juin — revérifiée le 2026-07-22)*
- ✅ `Commandes_Lignes_v2` col 8 (`type_ligne`) et col 9 (`date_dispo`) — **elles existent**.
- ✅ Statut « En attente de réapprovisionnement » dans le filtre de l'admin — **fait le 2026-07-22**.
- ✅ `recevoirPret`, `attendreTout` et `creerCommandeLiee` **existent déjà** (définies et routées) — vérifié le 2026-07-22. Ce ne sont donc pas des fonctions à créer, mais à **corriger** : voir A.4, la séquence est à inverser.
- ⬜ `enregistrerReponsesTemporaires` — **celle-là n'existe pas.**
- ⬜ `getCommandePublique_v2` doit renvoyer le type et la date de dispo de chaque ligne — à vérifier avant de coder.

---

# PARTIE F — CE QUI RESTE À TRANCHER

Les deux questions ouvertes de l'ancien fichier **trouvent leur réponse dans les scénarios validés** — c'est le gain de la fusion :

- ~~Met-on un vrai bouton « Payer » aux sortes 2 et 3 ?~~ → **Non.** Le paiement passe par **« Recevoir ce qui est prêt »** (partie B, point 5), qui n'apparaît qu'une fois chaque temporaire répondu.
- ~~Commande entièrement « pas disponible » : que voit la cliente ?~~ → **Décidé au bloc 3 :** on envoie quand même le courriel vers la page unique — elle peut toujours modifier et ajouter des produits disponibles.

**Rien d'autre n'est listé comme ouvert.** Mais voir **A.6** : les décisions non validées des sortes 2 et 3 doivent être re-déroulées avec Chantal avant de coder quoi que ce soit.

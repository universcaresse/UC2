# Deuxième courriel (la proposition) — Scénarios client

> **But de ce document.** Garder la vue complète des cas possibles à partir du
> **2ᵉ courriel** (la proposition envoyée par Chantal). Même approche que le
> document du 1ᵉʳ courriel : si la conversation se perd, ce fichier seul suffit
> à reprendre exactement où on était.
>
> **État d'avancement :** Branches **1 à 6 validées** ✅ (3 juillet 2026).
> **L'arbre du 2ᵉ courriel est COMPLET.** Aucune correction codée encore —
> tout est ici en attente. Prochaine étape : coder les corrections (section 8)
> ou couvrir le 3ᵉ courriel (expédition / suivi de colis).
>
> ✅ **`Code.gs` est maintenant dans le dossier du projet** (ajouté le
> 3 juillet 2026). Les vérifications en suspens ont été faites — voir 2.3
> (avis d'annulation) et 6.4 (statut « Question »).

---

## 0. CONTEXTE (à lire en premier si tu arrives à froid)

- **Le 2ᵉ courriel** = la proposition. Envoyé PAR CHANTAL (bouton admin
  « Proposition ») quand elle a complété prix, livraison, lien Square.
  Statut de la commande : **« En attente de paiement »**, stock sorti.
- **Trois portes validées** (12 juin 2026) : **Payer** / **Modifier**
  (l'annulation est à l'intérieur de cette page) / **J'ai une question**.
  Aujourd'hui le courriel n'a qu'un bouton Payer — les trois portes sont
  décidées mais pas toutes bâties.
- **Règle transversale validée :** partout où un client peut être coincé,
  toujours offrir **« Écrivez-nous »** → formulaire Contact pré-rempli
  (« Bonjour, je vous écris au sujet de ma commande X ») — même mécanisme
  que partout ailleurs sur le site.
- **Principe de vente (Chantal) :** un client qui a payé doit voir que sa
  commande est **en traitement** — jamais un message technique ou un
  cul-de-sac. Un client dont la commande est expédiée doit voir qu'elle
  est **en route**, avec le suivi du colis.

---

## 1. L'ARBRE DU 2ᵉ COURRIEL

1. Il clique **Payer** ✅ validée
2. Il clique **Modifier** ✅ validée
3. Il clique **J'ai une question** ✅ validée
4. Il **ne fait rien** ✅ validée
5. **Le désordre** ✅ validée
6. **Liens cassés / statut déjà changé** ✅ validée

---

## 2. BRANCHE 1 — IL CLIQUE « PAYER » ✅

### 1.1 Cas normal : il paie du premier coup
- **Client :** Square s'ouvre → il paie → retour automatique sur « Merci »
  (« Merci! Nous avons bien reçu votre paiement. Nous préparons et expédions
  dans les 3 jours ouvrables. » — page déjà existante).
- **Chantal :** rien ne bouge tout seul. Le courriel de Square (nom du
  paiement = « Commande -0042 ») est le signal → clic « Paiement reçu » →
  vente créée, statut « À expédier », stock déjà sorti (verrou anti
  double-sortie ✅).
- **Vérifié :** la page « Merci » (`index.html`, `#section-merci`) est une
  page fixe — elle n'avertit personne, rien ne s'écrit nulle part.
- **Décidé :** le retour « Merci » est un signal fiable (Square n'y renvoie
  qu'après un paiement réussi) → c'est là qu'on fera **expirer le lien
  Square** (correction déjà décidée au bloc 1, pas bâtie).
- **Décidé :** après paiement (lien Square mort), **les trois boutons du
  courriel deviennent caducs**. Peu importe lequel il reclique :
  → message « Votre paiement est reçu, la commande est en traitement —
  elle ne peut plus être modifiée. » + « Écrivez-nous » pré-rempli.
- **Décidé :** avant d'ouvrir Square, l'app **vérifie si le lien est encore
  valide** : bon → paiement; caduc → message (voir 1.4).

### 1.2 Il ouvre Square mais ne paie pas (ferme la page)
- **Client :** rien ne change — les trois portes fonctionnent encore, il
  revient quand il veut (jusqu'au rouge des 14 jours).
- **Chantal :** rien ne bouge, aucun signal (Square n'avertit que des
  paiements réussis). Filet : point orange à 7 jours → Relancer. ✅

### 1.3 Paiement avorté (carte refusée, abandon en cours)
- **Client :** Square affiche l'erreur; le lien reste bon, il réessaie.
- **Chantal :** rien, aucun signal — même filet que 1.2. Le texte de la
  relance couvrira le pépin de paiement sans accuser (déjà validé bloc 1). ✅

### 1.4 Il clique Payer après les 14 jours (lien caduc au rouge)
- **Client :** l'app vérifie le lien AVANT Square → caduc → message
  détaillé validé (essence, mots exacts plus tard) :
  « Cette proposition a dépassé son délai de validité. Comme les produits
  sont faits à la main et en petites quantités, les disponibilités
  changent — nous préférons revalider avec vous plutôt que de vous
  décevoir. Écrivez-nous et nous préparerons une proposition à jour. »
  + « Écrivez-nous » pré-rempli.
- **Chantal :** rien d'automatique — le rouge avait déjà signalé d'annuler. ✅

### 1.5 Le formulaire d'adresse (entre le clic Payer et Square)
- **Client :** il remplit son adresse; pendant l'envoi, champs et bouton
  désactivés (pas de double clic). Ferme sans finir → rien d'enregistré.
- **Chantal :** l'adresse s'écrit seulement si l'envoi réussit.
- **Décidé :** si l'envoi échoue → message d'erreur + **toujours offrir
  « Écrivez-nous »** pré-rempli.
- **Décidé (5.7) :** le **code postal est verrouillé** dans ce formulaire —
  affiché mais non modifiable (les frais de livraison sont calculés avec
  celui de l'envoi des coups de cœur). Changement d'adresse →
  « Écrivez-nous ». ✅

### 1.6 La commande a changé entre-temps (nouvelle proposition envoyée)
- **Problème identifié :** un client avec un vieux courriel peut payer le
  mauvais montant, modifier une version périmée, ou voir une commande qui
  ne correspond pas à son courriel — très déroutant. Et à la 100ᵉ
  proposition, les possibilités deviennent infinies.
- **DÉCIDÉ — LA règle de 1.6 (couvre tous les vieux courriels d'un coup) :**
  1. Chaque proposition porte un **numéro de version** dans ses liens
     (`&v=1`, `&v=2`, …).
  2. Client arrive avec une version dépassée → **tous les boutons** mènent
     à la même page : « Une nouvelle proposition vous a été envoyée le
     [date] — c'est elle qui remplace celle-ci » + « Recevez à nouveau
     votre proposition » + « Écrivez-nous ».
  3. À chaque nouvelle proposition, **l'ancien lien Square est fermé**
     (appel Square) AVANT d'écrire le nouveau.
- **Vérifié :** les boutons des courriels passent tous par le site
  (`&action=payer`) qui lit la commande ACTUELLE dans la sheet — un vieux
  courriel mène donc déjà à la dernière version des données.
- **Vérifié :** la sheet n'a qu'une case `lien_square` par commande — le
  nouveau écrase l'ancien. Mais **chez Square, l'ancien lien reste vivant
  et payable** → d'où la fermeture obligatoire (point 3 ci-dessus). ✅

### 1.7 Double clic / deux onglets sur Payer
- **Risque :** deux paiements sur le même lien (Square ne bloque pas seul).
- **Chantal :** deux courriels Square pour la même commande = signal de
  rembourser le doublon.
- **Décidé :** le bouton Payer **se désactive au premier clic** (comme le
  formulaire d'adresse). Filet pour les deux onglets : l'expiration au
  retour « Merci » (1.1). ✅

---

## 3. BRANCHE 2 — IL CLIQUE « MODIFIER » ✅

### Constat de départ (vérifié dans le vrai fichier)
Au statut « En attente de paiement », le lien Modifier affiche aujourd'hui
la page « Une proposition vous a été envoyée » — **le client ne peut PAS
modifier**. Le 2ᵉ courriel promettra « Modifier » → il faut bâtir une
**vraie page Modifier** pour ce statut.

### 2.1 La page Modifier et l'envoi
- **Client :** il retrouve sa liste (la même qu'il connaît) et peut
  seulement : enlever un produit / changer une quantité / ajouter. Ni
  livraison, ni rabais, ni total. Le bouton « Je ne veux plus donner
  suite » (annulation) est sur cette page. Lecture seule tant qu'il
  n'envoie pas.
- **À l'envoi, aujourd'hui (vérifié) :** sa liste remplace l'ancienne
  (efface puis réécrit, jamais de doublon), courriel de confirmation au
  client, avis à Chantal, statut → « Modifiée ». **MAIS le lien Square
  reste vivant** — il pourrait payer l'ancien montant.
- **Corrections notées (validées au bloc 1 en 3.c, pas bâties) :**
  1. Lien Square **caduc dès le renvoi**.
  2. Statut → **« À retravailler »** (au lieu de « Modifiée »).
  3. Chantal voit les **deux versions côte à côte** (originale + nouvelle). ✅

### 2.2 Il renvoie sans rien avoir changé
- **Décidé :** le bouton « Renvoyer » **reste inactif** tant que la liste
  est identique à l'originale. Impossible d'envoyer pour rien. ✅

### 2.3 Il annule (« Je ne veux plus donner suite »)
- **Client :** page de confirmation Oui/Non, raison facultative → il
  confirme → « Commande annulée » clair, ton doux.
- **Chantal :** statut « Annulée », stock remis (seulement s'il était
  vraiment sorti), note « annulée par le client ».
- **Vérifié dans `Code.gs` (3 juillet 2026) :** `annulerCommandeClient`
  n'envoie un courriel **qu'au client** — **aucun avis à Chantal dans le
  code**. La correction 10 est **confirmée nécessaire**. ✅

### 2.4 Il retire TOUS les produits
- **Décidé :** liste vide n'est pas une intention, c'est un moment de
  passage. Rien ne bloque, il continue d'ajouter; le bouton « Renvoyer »
  reste inactif avec une note douce « Ajoutez au moins un produit, ou
  écrivez-nous ». (Remplace le cul-de-sac actuel « Fermer » seulement.) ✅

### 2.5 Il ouvre la page et ferme sans envoyer
- Rien n'est perdu, rien ne bouge — lecture seule. Son courriel lui
  redonne l'accès quand il veut. ✅

### 2.6 Double clic sur « Renvoyer » / deux onglets
- **Vérifié :** le renvoi efface puis réécrit — pas de doublon possible.
- **Correction notée :** désactiver le bouton pendant l'envoi. ✅

### 2.7 Le statut a changé entre-temps
- **Client :** message « Cette commande ne peut plus être modifiée » +
  « Écrivez-nous » pré-rempli. Si une nouvelle proposition existe → la
  page version de 1.6.
- **Chantal :** rien ne bouge — protection écran + serveur déjà en place. ✅

---

## 4. BRANCHE 3 — IL CLIQUE « J'AI UNE QUESTION » ✅

- **Client :** formulaire Contact pré-rempli avec son numéro de commande.
- **Chantal :** reçoit nom, courriel, numéro, message. Aucun changement
  automatique — commande et stock inchangés, réponse à la main. ✅

---

## 5. BRANCHE 4 — IL NE FAIT RIEN ✅

- Point **orange à 7 jours** = aller vérifier → bouton **Relancer**
  (courriel doux, mêmes trois portes).
- Point **rouge à 14 jours** = lien Square caduc automatiquement; rien ne
  s'annule tout seul — c'est Chantal qui clique Annuler.
- **Décidé :** le client **doit recevoir quelque chose à 14 jours** — un
  courriel « proposition plus valide » (même essence que le message 1.4)
  + l'avis d'annulation quand Chantal annule.
- **Décidé :** ce courriel part quand Chantal clique Annuler (**manuel**
  pour le moment). **Note : à automatiser plus tard si le volume le
  demande.** ✅

---

## 6. BRANCHE 5 — LE DÉSORDRE ✅

### 5.1 Il paie, PUIS clique Modifier
- Lien Square mort (1.1) → tous les boutons mènent à « paiement reçu, en
  traitement » + « Écrivez-nous ». La vérification du lien (mort = payé)
  couvre la fenêtre entre son paiement et le clic « Paiement reçu ». ✅

### 5.2 Il modifie, PUIS clique Payer
- Square caduc dès le renvoi (2.1) → la vérification avant Square l'arrête :
  « Nous retravaillons votre commande » + « Écrivez-nous ». Rien ne bouge. ✅

### 5.3 Deux onglets croisés (Modifier ouvert + Square ouvert)
- **Risque :** il paie dans Square pendant que sa page Modifier est ouverte,
  puis renvoie sa liste → une commande payée passerait en retravail.
- **Décidé :** au clic « Renvoyer », le site **revérifie le statut au
  serveur AVANT d'écrire** — lien Square mort = payé = message « en
  traitement ». ✅

### 5.4 Vieux lien de relance après avoir payé
- Même filet que 5.1 — la relance a les mêmes trois portes, donc les mêmes
  protections. ✅

### 5.5 Il annule, PUIS clique Payer
- L'annulation ferme le lien Square → la vérification l'arrête : « Cette
  commande a été annulée » + « Écrivez-nous ». Stock déjà remis. ✅

### 5.6 Deux appareils en même temps (téléphone + ordinateur)
- Même situation que 5.3 — les vérifications au serveur protègent, peu
  importe l'appareil. Un seul statut dans la sheet, c'est lui qui tranche. ✅

### 5.7 Il transfère le courriel à un tiers (conjoint, ami)
- Quiconque a le courriel peut agir à sa place. **Risque assumé** (« d'abord
  qu'il paie »). MAIS : le **code postal est verrouillé** dès la proposition
  (voir 1.5) — un tiers ne peut pas détourner la livraison ni fausser les
  frais. Changement d'adresse → « Écrivez-nous ». ✅

### 5.8 Il répond directement au courriel (bouton « Répondre »)
- L'adresse d'envoi est une **vraie boîte que Chantal lit** → rien ne se
  perd, réponse à la main, rien ne bouge dans la commande. ✅

### 5.9 Deux commandes différentes, courriels mélangés
- Chaque lien porte son numéro de commande — impossible de payer la
  mauvaise. Chaque courriel Square nomme sa commande. ✅

### 5.10 Il modifie, puis modifie ENCORE (avant la nouvelle proposition)
- Sa page fonctionne encore (« À retravailler ») → le 2ᵉ renvoi remplace le
  1ᵉʳ. **Décidé : la dernière parole du client gagne.** Deux avis reçus,
  rien ne se duplique. ✅

### 5.11 Il modifie, PUIS annule (avant la nouvelle proposition)
- Sa page offre toujours « Je ne veux plus donner suite » → confirmation →
  « Annulée », stock remis. **Vérifié dans `Code.gs` :** aucun avis à
  Chantal à l'annulation — couvert par la correction 10. La proposition en
  préparation tombe. ✅

### 5.12 Il annule, puis regrette
- Tous ses boutons → « Cette commande a été annulée » + « Écrivez-nous » —
  sa seule porte est d'écrire. Stock déjà remis; Chantal décide (nouvelle
  proposition si le stock est encore là). Rien d'automatique. ✅

---

## 7. BRANCHE 6 — LIENS CASSÉS / STATUT DÉJÀ CHANGÉ ✅

### 6.1 Lien abîmé (numéro ou jeton manquant/faux)
- « Lien invalide » / « Commande introuvable » + message doux
  « Écrivez-nous » avec le numéro s'il l'a. Déjà couvert par la
  correction ② du 1ᵉʳ courriel (dans le fichier, à publier). ✅

### 6.2 Statut « À expédier » (payée, en préparation)
- Tous ses boutons → « Votre commande est en traitement » +
  « Écrivez-nous » (même message que 1.1). ✅

### 6.3 Statut « Terminée » (payée ET expédiée)
- **Décidé (principe de vente) :** message « **Votre commande est en
  route!** » + le **numéro de suivi du colis, cliquable** + « Écrivez-nous ».
  Le numéro de suivi vient du 3ᵉ courriel (pas encore couvert) — il est
  déjà entré quelque part à l'expédition. ✅

### 6.4 Statut « Question » — statut mort CONFIRMÉ
- **Vérifié dans `Code.gs` (3 juillet 2026) :** aucune fonction ne pose
  jamais le statut « Question » — il n'existe que dans le filtre admin.
  Rien ne s'y accroche, le retirer est sans danger.
- **Décidé :** le **retirer du filtre** — une question, ça entre dans les
  courriels, pas dans l'admin (correction 13). ✅

---

## 8. CORRECTIONS À CODER (récapitulatif — RIEN n'est bâti)

1. Lien Square expire au retour « Merci » + filet au clic « Paiement
   reçu » (décidée au bloc 1, confirmée ici).
2. Après paiement : les trois boutons du courriel → « en traitement, plus
   modifiable » + Écrivez-nous (1.1).
3. Vérification de la validité du lien Square avant d'ouvrir Square, avec
   message détaillé si caduc (1.1, 1.4).
4. Échec du formulaire d'adresse → toujours « Écrivez-nous » (1.5).
5. Mécanisme de **version** des propositions + page « nouvelle proposition
   envoyée le [date] » + fermeture de l'ancien lien Square à chaque
   nouvelle proposition (1.6).
6. Bouton Payer désactivé au premier clic (1.7).
7. Vraie page Modifier au statut « En attente de paiement » (2.1).
8. Au renvoi d'une modification : Square caduc + « À retravailler » +
   deux versions côte à côte (2.1).
9. « Renvoyer » inactif si liste identique (2.2) ou vide avec note douce
   (2.4).
10. Avis à Chantal quand un client annule (2.3) — **CONFIRMÉ MANQUANT**
    dans `Code.gs` (vérifié le 3 juillet 2026).
11. Bouton « Renvoyer » désactivé pendant l'envoi (2.6).
12. Courriel au client à l'annulation des 14 jours — manuel, note pour
    automatiser si volume (branche 4).
13. Retirer le statut « Question » du filtre admin (6.4) — **statut mort
    confirmé** dans `Code.gs`.
14. Code postal verrouillé dans le formulaire d'adresse (1.5 / 5.7).
15. Revérification du statut au serveur avant tout renvoi de liste (5.3).
16. Statut « Terminée » : page « en route » + suivi de colis cliquable
    (6.3 — dépend du 3ᵉ courriel).

---

## 9. CE QUI EST DÉJÀ CORRECT (ne pas « réparer »)

- ✅ Page « Merci » existante avec le bon texte.
- ✅ Renvoi de liste : efface puis réécrit, jamais de doublon.
- ✅ Garde-fou d'annulation (confirmation, raison facultative).
- ✅ Protection écran + serveur sur les statuts non modifiables.
- ✅ Formulaire d'adresse : champs désactivés pendant l'envoi.
- ✅ Les boutons des courriels lisent toujours la commande actuelle
  (pas de données figées dans le courriel).
- ✅ « Écrivez-nous » pré-rempli : mécanisme existant, à réutiliser partout.
- ✅ Chaque lien Square nomme sa commande (« Commande -0042 »).
- ✅ L'adresse de réponse des courriels est une vraie boîte lue par Chantal.
- ✅ Courriel d'annulation au client : déjà dans `annulerCommandeClient`.
- ✅ Filet « Paiement reçu » : `annulerLienSquare` déjà appelé dans
  `admin-commandes.js` si `link_id_square` existe.

---

## 10. ANCRAGES TECHNIQUES

- Mêmes fichiers et fonctions que le document du 1ᵉʳ courriel (section 11).
- ✅ `Code.gs` maintenant au dossier. Vérifié dedans : `annulerCommandeClient`
  (courriel au client seulement, pas d'avis à Chantal), statut « Question »
  jamais posé, `renvoyerCopieProposition` (statut vérifié en premier,
  renvoi seulement si « En attente de paiement »).
- `lien_square` : une seule case par commande dans la sheet (le nouveau
  écrase l'ancien). `link_id_square` : col 21 (`updateCommandeComplete_v2`
  l'écrit déjà), filet « Paiement reçu » présent dans `admin-commandes.js`.

---

## 11. OÙ ON EN EST / PROCHAINE ÉTAPE

- **Fait :** l'arbre complet du 2ᵉ courriel — 6 branches validées
  (3 juillet 2026). `Code.gs` ajouté au dossier, vérifications en suspens
  faites (corrections 10 et 13 confirmées).
- **À faire :** au choix de Chantal — coder les 16 corrections (aucun code
  sans OK, trouve-et-remplace un seul à la fois) OU couvrir le 3ᵉ courriel
  (expédition / suivi de colis).
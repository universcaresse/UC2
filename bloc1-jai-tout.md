# Bloc 1 _J'ai tout
### Scénario coups de cœur — validé par Chantal le 12 juin 2026
*(Document vivant : on ajoute les autres possibilités au fur et à mesure.)*

---

## Point de départ (commun à tous les blocs)
- Le client coche ses coups de cœur, envoie sa liste avec ses coordonnées
- Je reçois une commande « En attente » — aucun stock touché

---

## SCÉNARIO 1 — Le chemin simple (le client paie) ✅ validé

**1 — La commande arrive**
- 1.1 Statut : « En attente », point vert = j'ai tout en stock
- 1.2 Impacts : aucun stock touché, rien d'envoyé au client

**2 — Je clique « Proposition »**
- 2.1 L'écran de complétion s'ouvre : coordonnées du client, livraison, rabais
- 2.2 Je génère le lien Square → le numéro de commande est mis dans le nom du paiement (« Vos coups de cœur. Commande -0042 »)
  - 2.2.1 ✏️ Correction décidée : garder aussi l'identifiant du lien, pour pouvoir le fermer plus tard
- 2.3 Je vérifie → aperçu de la proposition → « Modifier » ou « Envoyer au client »
- 2.4 Je clique « Envoyer » → impacts, tous d'un coup :
  - 2.4.1 **Le stock est ENLEVÉ de mon inventaire** (réservé pour ce client — c'est ici que ça sort, une seule fois)
  - 2.4.2 Statut → « En attente de paiement »
  - 2.4.3 Le client reçoit le courriel (un seul bouton aujourd'hui : Payer) + le texto
  - 2.4.4 ⚠️ Bogue connu : le texto part avant le courriel — ✏️ Correction décidée : courriel d'abord, texto seulement s'il a réussi

**3 — Le client reçoit la proposition**
- 3.1 Il clique « Payer » → Square s'ouvre → il paie → il revient automatiquement sur le message « Merci »
- 3.2 Impacts chez nous : **rien ne bouge automatiquement**. Square m'envoie son courriel avec le nom du paiement (mon seul fil pour relier à la commande)

**4 — Je rentre le paiement à la main**
- 4.1 Je clique « Paiement reçu » sur la commande
- 4.2 Impacts :
  - 4.2.1 La vente est créée (avec son numéro de facture, jamais réutilisé)
  - 4.2.2 **Le stock NE bouge PAS une 2e fois** — déjà sorti en 2.4.1, verrou anti double-sortie en place ✅
  - 4.2.3 Statut → « À expédier »
  - 4.2.4 ✏️ Correction décidée : le lien Square expire **dès le retour du client sur « Merci »** (automatique) — et en filet, au clic « Paiement reçu » si le retour n'a jamais eu lieu

**5 — J'expédie**
- 5.1 Statut → « Terminée ». Fin du chemin.

---

## CORRECTIONS DÉCIDÉES (12 juin 2026)
- 1. Courriel d'abord, texto seulement si le courriel a réussi (2.4.4)
- 2. Garder l'identifiant du lien Square à sa création (2.2.1)
- 3. Le lien Square expire au retour « Merci » + filet au clic « Paiement reçu » (4.2.4)

---

## LE COURRIEL DE PROPOSITION (validé le 12 juin 2026 — présentation à définir plus tard)

Aujourd'hui le courriel n'a qu'un bouton « Payer », sans explication. Décidé : trois portes, avec un mot doux pour chacune. Sans le mot « panier », sans possessifs.

**En haut (l'accueil)**
- « Bonjour [prénom], voici la proposition préparée pour vos coups de cœur. »
- « Nous avons réuni ce qui vous a plu et préparé les détails pour vous. »

**Au milieu (le détail)**
- La liste des produits choisis, avec quantités
- La livraison
- Le total

**En bas (les trois portes)**
- **Payer** → « Tout vous convient? Réglez en quelques clics. »
- **Modifier** → « Vous aimeriez changer quelque chose? C'est ici. » (l'annulation se fait à l'intérieur de cette page, pas comme bouton séparé)
- **J'ai une question** → « Un doute, une précision? Écrivez-nous, on vous répond. » (mène au formulaire Contact)

*Présentation visuelle (disposition, ordre des boutons) : à définir plus tard.*

---

## LES POINTS DE COULEUR (validé le 12 juin 2026)
- « En attente » (demande arrivée) → **point vert** = j'ai tout en stock
- « En attente de paiement » (proposition envoyée) → aucun point au début, puis **point orange après 7 jours** = il est temps d'aller vérifier
- Autres couleurs → à définir plus tard

---

## 3.b — Il paie plus tard (validé le 12 juin 2026)
- 3.b.1 Proposition envoyée → « En attente de paiement », stock sorti et réservé
- 3.b.2 Un compte de **7 jours** démarre à l'envoi de la proposition
- 3.b.3 Paiement dans les 7 jours → rejoint le point 4 → « Terminée »
- 3.b.4 7 jours passés sans paiement → un **point orange** apparaît sur la commande = il est temps que j'aille vérifier
- 3.b.5 Impacts : le stock reste sorti pendant tout ce temps; rien ne se relâche tout seul — c'est moi qui décide en voyant le point orange

**La relance et la fin du délai**
- 3.b.6 Au point orange, je clique **Relancer** → le client reçoit un courriel de relance (ton de rappel doux, différent de la première proposition, mais **mêmes trois portes** : Payer / Modifier / J'ai une question). La commande reste « En attente de paiement », stock toujours réservé
- 3.b.7 Le compteur ne repart PAS à zéro — il suit le **début du processus** (l'envoi de la proposition)
- 3.b.8 À **14 jours** du début, toujours sans paiement → le point devient **rouge** = rien ne se passe, je vais annuler
- 3.b.9 ✏️ Décidé : au rouge, le **lien Square n'est plus valide** — même si le client essaie de payer, ça ne fonctionne plus
- 3.b.10 Rien ne s'annule tout seul : le rouge ne fait qu'afficher que c'est le temps. **C'est moi qui pèse sur le bouton Annuler** (= le chemin 3.d : remettre le stock, gérer l'acompte s'il y a lieu)

---

## POSSIBILITÉS — point 3 (le client reçoit la proposition)
- 3.a Il paie tout de suite ✅
- 3.b Il paie plus tard ✅ (délai, relance, orange/rouge)
- 3.c Il clique « Modifier » ✅
- 3.d Il annule (depuis la page Modifier) ✅
- 3.e Il clique « J'ai une question » ✅
- 3.g Paiement avorté ✅

*(3.f « il ne répond jamais » retiré : déjà couvert par le délai de 3.b.)*

**Logique du bloc 1 : complète.** Reste les textes à écrire, et la vérification dans le vrai code (sécurité, fermetures réellement branchées) — non faite.

---

## 3.c — Il clique « Modifier » (validé le 12 juin 2026 — déjà construit en bonne partie)
- 3.c.1 Le lien le mène à une page, dans le décor habituel, avec sa commande devant lui
- 3.c.2 La page vérifie le statut :
  - « En attente de paiement » → il peut modifier
  - sinon → message « cette commande ne peut plus être modifiée » + bouton Fermer
- 3.c.3 Il retrouve sa liste de coups de cœur (la même qu'il connaît) et peut seulement : enlever un produit / changer une quantité / rajouter
- 3.c.4 Il ne touche à rien d'autre : ni livraison, ni rabais, ni total
- 3.c.5 Il renvoie sa liste → le stock **reste gelé** (on ne relâche rien automatiquement) → le **lien Square devient caduc dès le renvoi** (il ne peut plus payer l'ancien montant)
- 3.c.6 La commande passe au statut **« À retravailler »** et se déplace dans le tableau pour attirer mon œil
- 3.c.7 De mon côté, je vois les **deux versions côte à côte** : l'originale et la nouvelle demande
- 3.c.8 Je compare, je refais ma proposition à partir de la **nouvelle** liste → repart en « En attente de paiement » → rejoint le chemin de paiement (point 4)
- 3.c.9 L'ancienne version est jetée une fois la nouvelle proposition faite

**Les vieux boutons du premier courriel (après le renvoi)**
- 3.c.10 S'il reclique **Payer** → ne fonctionne pas (lien caduc depuis 3.c.5)
- 3.c.11 S'il reclique **Modifier** ou **J'ai une question** → il tombe sur la page « cette commande ne peut plus être modifiée »
- 3.c.12 ✏️ À améliorer : cette page de blocage est trop sèche. Ajouter une porte de sortie douce — un **« Écrivez-nous »** (vers le formulaire Contact)
- 3.c.13 ❓ À trancher : le message de blocage — unique partout (payée, annulée, en retravail…) ou adapté selon la situation?

---

## 3.d — Il annule (depuis la page Modifier) (validé le 12 juin 2026)
- 3.d.1 Pas de bouton « Annuler » dans le courriel : l'annulation est une action **sur la page Modifier**
- 3.d.2 Sur la page Modifier, un bouton clair (« Je ne veux plus donner suite »)
- 3.d.3 Le clic mène à une **page de confirmation** (garde-fou contre le clic par erreur)
- 3.d.4 ❓ À trancher : cette page demande-t-elle pourquoi il annule? Si oui, réponse facultative ou obligatoire avant de confirmer?
- 3.d.5 Il confirme → il **voit clairement que sa commande est réellement annulée**
- 3.d.6 De notre côté, automatiquement :
  - le **lien Square s'annule**
  - la commande passe à **« Annulée »**
  - le **stock est remis en circulation**
  - une **note est ajoutée à la commande** : « annulée par le client »
- 3.d.7 Pas d'acompte à gérer : les acomptes n'existent que pour les commandes admin, jamais via les coups de cœur
- 3.d.8 ⚠️ Seul chemin du bloc 1 qui finit à « Annulée » au lieu de « Terminée »

---

## 3.e — Il clique « J'ai une question » (validé le 12 juin 2026)
- 3.e.1 Il clique **« J'ai une question »** dans le courriel
- 3.e.2 Ça le mène au **formulaire Contact**, déjà pré-rempli :
  - **Lui** voit : son numéro de commande, et le sujet du message déjà rempli (« Question — commande CMD-0042 »)
  - **Moi** je reçois tout : son nom, son courriel, son numéro de commande, son message
- 3.e.3 Il m'écrit, je réponds à la main → quand c'est clair, il revient payer ou modifier
- 3.e.4 Impacts : aucun changement automatique — commande toujours « En attente de paiement », stock gelé, rien ne bouge

---

## 3.g — Paiement avorté (validé le 12 juin 2026)
- 3.g.1 Il clique Payer → Square s'ouvre → le paiement ne se complète pas (abandon ou carte refusée)
- 3.g.2 Chez nous, rien ne bouge et **on ne le sait pas** : Square ne nous avertit que des paiements réussis
- 3.g.3 Le lien Square reste valide → il peut réessayer quand il veut (jusqu'au rouge des 14 jours, qui le rend caduc)
- 3.g.4 Le filet, c'est le délai de 3.b : point orange à 7 jours → relance → rouge à 14 jours
- 3.g.5 ✏️ Décidé : le **texte de la relance** sera écrit pour couvrir aussi ce cas (pépin de paiement), sans accuser — pour ne pas laisser le client à lui-même

---

## TEXTES À ÉCRIRE
- Le courriel de proposition (structure validée plus haut, mots à finaliser)
- Le courriel de relance — doit couvrir : oubli, hésitation, ET pépin de paiement, sans accuser
- Le message de la page de blocage + « Écrivez-nous » (3.c.12)
- Le message vu par le client quand sa commande est annulée (3.d.5)

---

## DÉCISIONS TRANCHÉES — suite

- 3.c.13 — Un seul message de blocage pour tous les cas, avec « Écrivez-nous » comme porte de sortie.
- 3.d.4 — La page de confirmation demande poliment pourquoi il annule — champ texte facultatif, pas obligatoire pour confirmer.
- 3.b Relancer — Aperçu d'abord, pour ajouter un mot personnel avant d'envoyer.
- 3.b.9 — Le lien Square devient caduc automatiquement à 14 jours, sans intervention.
- Textes — on écrit l'essence maintenant, les mots exacts plus tard.

---

## TEXTES — essence validée, mots exacts plus tard

**Courriel de proposition**
Ton chaleureux, jamais transactionnel. Lui dire qu'on a préparé quelque chose pour lui avec soin. Présenter les produits, le total, les trois portes. Lui laisser le temps sans le brusquer.

**Courriel de relance**
Ton doux, sans reproche. Couvre trois réalités sans les nommer : l'oubli, l'hésitation, le pépin de paiement. Lui rappeler que la proposition est encore là, que les mêmes trois portes l'attendent, et qu'on est disponible si quelque chose cloche.

**Message de blocage (commande non modifiable)**
Court et sans jugement. Lui dire que cette commande n'est plus modifiable, sans expliquer pourquoi. Lui offrir « Écrivez-nous » comme seule porte de sortie.

**Message de confirmation d'annulation (vu par le client)**
Lui confirmer clairement que c'est annulé — pas de doute possible. Ton doux, sans le faire sentir coupable. Question facultative : « Si vous voulez nous dire ce qui s'est passé, nous lisons tout. » Fermer sur une invitation ouverte à revenir un jour.

---

## NOTES TECHNIQUES — à savoir avant de coder

- L'identifiant Square (`payment_link.id`) est retourné par l'API mais jamais sauvegardé aujourd'hui. Il doit aller en col 21 de `Commandes_Entete_v2` (première colonne libre après `type_promo` en col 20).
- Fermer un lien Square = appel API Square avec cet identifiant. Impossible sans lui.
- L'ordre des opérations à l'envoi doit être : courriel d'abord → texto seulement si courriel réussi (pas l'inverse comme aujourd'hui).
- Le bouton Relancer doit ouvrir un aperçu avant d'envoyer, pas envoyer directement.
- Les points orange/rouge se calculent à partir de `date_proposition` (col 16).

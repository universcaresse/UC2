# ⚠️ FAUSSE ALERTE — le trou décrit ici n'existait pas

### Vérifié le 2026-07-22 : la porte publique était **déjà protégée**.
`envoyerDemandeCommande_v2` — la **seule** action qu'une cliente peut appeler pour envoyer sa liste — **recalcule déjà les prix depuis `Produits_Formats_v2`**, avec ce commentaire dans le code : « prix recalculé côté serveur, jamais celui envoyé par le client ». L'étape 6 du plan de juin était donc faite.

**Mon erreur :** j'avais vu `createCommande_v2` et `addCommandeLigne_v2` faire confiance au prix reçu, et j'en ai conclu à une faille — **sans vérifier si une cliente pouvait les atteindre**. Elle ne peut pas : ces deux actions ne sont pas dans `ACTIONS_PUBLIQUES`, elles exigent la clé admin. C'est exactement la règle 1.0 de METHODE que j'ai enfreinte.

**Ce qui a quand même été fait** (inoffensif, par hygiène) : `createCommande_v2` et `addCommandeLigne_v2` prennent maintenant le prix dans `Produits_Formats_v2` au lieu de celui reçu. Aucun changement visible — dans la fiche « Nouvelle commande », le champ prix est en lecture seule, donc c'est le même prix. L'avertissement « Prix ajustés » que j'avais ajouté a été **retiré** : rien à détecter, donc rien à afficher.

---

## (Diagnostic d'origine — conservé, mais faux sur le point essentiel)

# À FAIRE — Le serveur doit recalculer les prix, jamais croire le navigateur

> Sorti de `decisions-securite.md` le 2026-07-22, au moment d'archiver ce plan.
> C'était l'**étape 6** du plan de sécurité du 12 juin. Les cinq autres étapes sont faites.

## Le trou
Quand une cliente envoie ses coups de cœur, **le prix de chaque ligne vient de son navigateur**, et le serveur le croit sur parole.

Vérifié le 2026-07-22 dans `codegs.txt` :
- `createCommande_v2` additionne `l.prix_unitaire` **reçu de l'écran** pour faire le total.
- `addCommandeLigne_v2` enregistre `data.prix_unitaire` tel quel.
- Ni l'un ni l'autre ne va lire `Produits_v2` pour vérifier.

Donc quelqu'un qui sait lire le code public peut envoyer une demande avec les prix qu'il veut.

## Pourquoi il faut le faire quand même
Le premier plan disait : « pas de perte automatique, Chantal valide tout avant paiement ». **Ce n'est pas une protection acceptable** — décision de Chantal le 2026-07-22 : elle vérifie ses commandes, mais elle ne va pas comparer chaque ligne de chaque commande à sa liste de prix. La protection doit être dans le serveur, pas dans ses yeux.

## Ce qu'il faut faire
Le serveur recalcule le prix de chaque ligne à partir de **ses propres feuilles** (`Produits_v2` / formats), et ignore complètement le prix envoyé par le navigateur. Même principe que celui déjà en place pour les frais de livraison, où le tarif est recalculé côté serveur (« Garde-fou : poids et tarif recalculés ICI, rien n'est pris de l'écran »).

À trancher avant de coder :
1. Si le prix reçu **diffère** de celui du serveur : on corrige en silence, ou on prévient Chantal ?
2. Que faire d'un produit dont le prix a changé **entre** le moment où la cliente a bâti sa liste et l'envoi ?

## Ancrages
- `Code.gs` → `createCommande_v2`, `addCommandeLigne_v2`, `envoyerDemandeCommande_v2`
- Le modèle à copier existe déjà pour la livraison : chercher « Garde-fou : poids et tarif recalculés ICI ».

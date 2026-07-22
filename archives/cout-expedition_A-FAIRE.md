# ✅ CODÉ le 2026-07-21 — Le vrai coût d'expédition (Poste Canada) dans la comptabilité

### Il ne reste qu'un geste, et il est à toi : **passer Poste Canada en production** (`PC_TEST = false`, ligne ~7256 de `codegs.txt`). Tant que c'est `true`, les étiquettes sont des essais gratuits et **rien ne se comptabilise** — voulu.

## Ce qui a été bâti
- **Le prix avant l'achat** : la fenêtre de confirmation affiche maintenant le tarif (« 14,25 $ seront portés à ta Visa »). Avant, tu achetais à l'aveugle.
- **L'écriture à l'achat**, hors bac à sable : débit **5210 Frais d'expédition** / crédit **2205 Visa à rembourser**, référence **`EXP-<cmd_id>`** (distincte de la vente, pour qu'une correction de vente n'efface jamais le frais).
- **Jamais d'estimation.** On n'inscrit que le montant **réellement facturé** par Poste Canada (lien `price` de sa réponse). Décision de Chantal : une estimation ferait décoller le compte 2205 du vrai relevé Visa.
- **Si le prix n'est pas encore fixé** chez Poste Canada : l'étiquette s'achète quand même, et l'envoi apparaît dans « Frais d'expédition à inscrire » (journal général) — un clic redemande le vrai montant et pose l'écriture. Aucune saisie à la main.
- Colonnes créées au besoin dans `Commandes_Entete_v2` : `etiquette_prix_lien`, `etiquette_cout`.

## Ce que ça corrige
Le compte **2110 « Postes Canada à payer »** n'est plus nécessaire : le plan le gardait en attente « jusqu'à ce qu'on sache comment Postes Canada facture ». Réponse obtenue le 2026-07-21 : **ça sort de la Visa tout de suite**.

---

## (Archive du diagnostic d'origine)

# À FAIRE — Le vrai coût d'expédition (Poste Canada) dans la comptabilité

> Sorti de `ITEM-ventes-comptabilite.md` le 2026-07-21, au moment d'archiver cet item.
> Tout le reste de la comptabilité des ventes est codé; ceci est le seul morceau qui ne l'est pas.

## Le trou
Aujourd'hui, la comptabilité inscrit **ce que la cliente paie** pour la livraison — c'est un revenu, au compte **4010 Livraison facturée**. Elle n'inscrit **rien** pour ce que la livraison **coûte** vraiment à Univers Caresse.

Résultat : la livraison paraît toujours gratuite pour l'entreprise. Le bénéfice est donc surévalué du montant réel des envois.

## Ce que le plan comptable a déjà tranché
> « **Livraison** : ce que le client paie = revenu (4010). Le **vrai coût** acheté chez Postes Canada = dépense (**5210**), variable, contrepartie en attente dans **2110** jusqu'à ce qu'on sache comment Postes Canada facture. »

Donc l'écriture visée, au moment de l'envoi :
- débit **5210 Frais d'expédition** (le vrai coût)
- crédit **2110 Postes Canada à payer** (compte d'attente, jusqu'à ce qu'on sache comment Postes Canada facture)

Puis, quand Postes Canada est payé pour de vrai, une écriture solde le 2110.

## Ce qui reste à décider avant de coder
1. **Quand** l'écriture s'inscrit : au moment où l'étiquette est générée (le coût est connu à ce moment-là) ou plus tard ?
2. **Où prendre le montant** : l'étiquette Poste Canada renvoie-t-elle son prix, ou faut-il l'entrer à la main ?
3. **Comment Postes Canada facture** — c'est la question que le plan laissait ouverte, et elle décide du sort du 2110 (par envoi ? par mois ? carte de crédit ?).

## Ancrages
- `Code.gs` → `expedierCommande_v2` (c'est là que l'envoi se conclut).
- `calculerTarifPosteCanada` existe déjà et connaît les tarifs.
- Voir aussi `etiquette-poste-canada_A-FAIRE.md` et `resume-poste-canada.md`.

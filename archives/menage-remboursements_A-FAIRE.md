# À FAIRE — Petit ménage : la colonne « Type » de la liste des remboursements

> Sorti de `ITEM-ventes-comptabilite.md` le 2026-07-21, au moment d'archiver cet item.
> Petit, sans urgence, mais c'est du travail à faire — pas un test.

## Le détail qui cloche
Dans la liste des remboursements (page Remboursements), la colonne **Type** affiche encore
« Avec retour » ou « Sans retour ».

C'était vrai de l'ancien modèle, où le remboursement au complet était de l'une ou l'autre sorte.
Depuis la refonte du 2026-07-21, le choix **retour en inventaire / perte** se fait **article par article**,
et le champ d'entête n'est plus rempli (il part vide).

Conséquence : tous les nouveaux remboursements s'affichent « Sans retour », ce qui est faux et trompeur.

## Ce qu'il faudrait à la place
Une des deux, à trancher avec Chantal :
- retirer la colonne « Type » (l'information vit maintenant dans les lignes, pas dans l'entête) ;
- ou l'alimenter à partir des lignes : « retours », « pertes », ou « les deux ».

## Ancrage
- `js/admin-remboursements.js` → `afficherTableauRemboursements`, la ligne
  `const typeLabel = r.type_remb === 'avec-retour' ? 'Avec retour' : 'Sans retour';`
- Les anciens remboursements gardent leur vrai `type_remb` : ce qu'on choisira doit rester juste pour eux aussi.

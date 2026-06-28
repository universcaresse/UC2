# À FAIRE — page inventaire production
### Plan validé avec Chantal — 26 juin 2026

## 1. Décidé
1.1 Page inventaire = pile « disponible » seulement, affichée comme dans fabrication (regroupée, cliquable). Pas de bouton « entrer un lot ».
1.2 On y arrive par « voir inventaire » (bas de fabrication) ET par « inventaire » du menu Production — même écran.
1.3 Le panneau « À produire » s'affiche sur fabrication ET sur inventaire.
1.4 Regroupement à deux étages : collection en titre une fois, ses gammes en dessous. Fonction partagée → les deux pages changent ensemble.
1.5 Fabrication garde en cure + épuisé, perd la pile disponible, gagne le bouton « voir inventaire ».

## 2. Étapes (trouve-et-remplace, un à la fois)
2.1 Deux étages dans le regroupement partagé — admin-fabrication.js (grouperParCollection + rendreBlocStatut).
2.2 Retirer la pile disponible de fabrication — admin-fabrication.js (afficherTableauFabrication).
2.3 Ajouter le bouton « voir inventaire » — index.html (section fabrication).
2.4 Créer la page inventaire — index.html (nouvelle section) + admin-fabrication.js (affichage).
2.5 Brancher le menu — admin.js (le bouton inventaire renvoie aujourd'hui au stock des ingrédients; le rediriger).
2.6 Panneau « À produire » sur les deux pages — admin-fabrication.js (afficherPanneauAProduire).

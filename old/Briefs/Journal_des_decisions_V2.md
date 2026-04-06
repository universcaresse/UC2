# JOURNAL DES DÉCISIONS — UNIVERS CARESSE V2
### Pourquoi on a fait X. Pourquoi on a abandonné Y.
### Ne jamais effacer — ajouter seulement. Corriger = barrer + noter à côté.

---

## FORMAT D'UNE ENTRÉE

**[SUJET] Titre de la décision** — *date*
> Contexte : pourquoi la question s'est posée
> Décision : ce qu'on a choisi
> Raison : pourquoi ce choix
> Alternative rejetée : ce qu'on n'a pas fait et pourquoi

---

## ARCHITECTURE GÉNÉRALE

**[STRUCTURE] Refaire from scratch en V2 plutôt que patcher le V1** — *3 avril 2026*
> Contexte : le V1 accumule des patches depuis des mois. Chaque correction en crée une nouvelle. Les achats et l'inventaire sont vides car trop fragiles à utiliser. Les ventes ne peuvent pas démarrer.
> Décision : construire le V2 en parallèle. Le V1 reste en production pendant la construction.
> Raison : patcher davantage le V1 ne règle pas les problèmes de fond — données dénormalisées, CSS incohérent, relations par texte au lieu d'IDs.
> Alternative rejetée : continuer à patcher le V1 — rejeté car chaque patch ajoute de la fragilité au lieu d'en retirer.

---

**[STRUCTURE] Même repo GitHub, fichiers avec suffixe 2** — *3 avril 2026*
> Contexte : où héberger le V2 pendant la construction?
> Décision : même repo GitHub, index2.html, style2.css, admin2.js, etc. Bascule = renommer les fichiers quand V2 validé.
> Raison : pas de nouveau repo à gérer, même URL finale, zéro redirect.
> Alternative rejetée : nouveau repo séparé — rejeté car complexité inutile.

---

## DONNÉES

**[DONNÉES] IDs stables au lieu de relations par texte** — *3 avril 2026*
> Contexte : en V1, modifier le nom d'une ligne de produit rend les recettes orphelines — elles perdent leur lien avec la collection/ligne parce que la relation est par texte. Renommer une collection = propager dans 5+ endroits (Recettes, Recettes_Base, collections_secondaires, etc.). Source de bugs constants et de perte de données.
> Décision : IDs lisibles partout — COL-001, LIG-001, REC-001, ING-001, FAC-001, etc.
> Raison : renommer = changer à 1 seul endroit. Lisible dans les sheets Google pour comprendre les relations sans être développeur.
> Alternative rejetée : UUID générés automatiquement — rejeté car illisibles dans les sheets Google.

---

**[DONNÉES] Collections et Lignes dans deux sheets séparées** — *3 avril 2026*
> Contexte : en V1, la sheet Collections mélange collections et lignes — 21 lignes pour 9 collections réelles. Les lignes d'une même collection se répètent avec toutes les infos de la collection.
> Décision : sheet Collections (une ligne par collection) + sheet Lignes (une ligne par ligne, avec collection_id).
> Raison : données normalisées. Ajouter une ligne = ajouter 1 ligne dans Lignes, pas dupliquer toute la collection.
> Alternative rejetée : garder le mélange — rejeté car source de dénormalisation et de propagation de changements.

---

**[DONNÉES] Recettes_Ingredients = sheet séparée** — *3 avril 2026*
> Contexte : en V1, la sheet Recettes répète toutes les infos de la recette pour chaque ingrédient — 576 lignes pour ~75 recettes.
> Décision : sheet Recettes (une ligne par recette) + sheet Recettes_Ingredients (une ligne par ingrédient par recette).
> Raison : données propres, pas de répétition. Modifier une recette = modifier 1 ligne dans Recettes.
> Alternative rejetée : garder la structure actuelle — rejeté car ingérable et source d'erreurs.

---

**[DONNÉES] L'achat = seul point d'entrée pour les ingrédients** — *3 avril 2026*
> Contexte : en V1, on pouvait ajouter des ingrédients directement dans le formulaire recette. Résultat : ingrédients sans prix, sans fournisseur, sans INCI.
> Décision : un ingrédient entre dans le système par un achat ou par la page INCI. Jamais directement dans une recette.
> Raison : garantit que chaque ingrédient a un prix au gramme et une source connue.

---

## CSS

**[CSS] CSS custom plutôt que framework (Tailwind, etc.)** — *3 avril 2026*
> Contexte : faut-il utiliser un framework CSS pour le V2?
> Décision : CSS custom propre avec design system complet dans le root.
> Raison : pas de dépendance externe, contrôle total, cohérence avec l'identité visuelle d'Univers Caresse.
> Alternative rejetée : Tailwind — rejeté car dépendance externe et apprentissage supplémentaire pour rien.

---

**[CSS] Un seul fichier CSS — public et admin partagent les fondations** — *3 avril 2026*
> Contexte : en V1, public et admin utilisent le même fichier style.css mais dérivent l'un de l'autre avec des duplications.
> Décision : un seul style2.css avec sections clairement séparées par commentaires.
> Raison : une modification = un seul endroit. Composants partagés définis une seule fois.

---

## AFFICHAGE

**[AFFICHAGE] Ordre des listes — décision globale** — *3 avril 2026*
> Contexte : à chaque nouvelle conversation, l'ordre des listes devait être redit. Collections pas en ordre de rang, lignes pas en alpha, etc.
> Décision : Collections → rang | Lignes → alpha | Recettes → rang collection + ligne alpha + nom alpha | Ingrédients → alpha | Factures → chronologique inversé.
> Raison : cohérence globale. Une décision prise s'applique partout sauf exception documentée ici.

---

**[AFFICHAGE] Filtres en cascade obligatoires** — *3 avril 2026*
> Contexte : les listes de recettes affichaient tous les produits sans filtrer par ligne, forçant à chercher dans 20+ items.
> Décision : partout où on choisit une recette dans l'admin : Collection → Ligne → Recette. Obligatoire.
> Raison : Chantal a des recettes dans 9 collections et plusieurs lignes par collection. Sans filtre en cascade, l'interface est inutilisable.

---

## APPS SCRIPT

**[GS] getSS() — connexion centrale** — *3 avril 2026*
> Contexte : en V1, SpreadsheetApp.openById() est répété dans chaque fonction — des dizaines de fois le même ID codé en dur.
> Décision : une seule fonction getSS() qui retourne le spreadsheet. Toutes les fonctions l'appellent.
> Raison : changer l'ID = changer à 1 endroit. Moins de risque d'erreur.

---

## HTML

**[HTML] Sections admin dans le main — pas en dehors** — *à documenter quand la raison est confirmée*
> Contexte : une section avait été placée en dehors du main, causant des problèmes de layout.
> Décision : toutes les sections admin sont dans le main.admin-contenu.
> Raison : le layout admin-layout → admin-contenu gère le scroll et l'overflow. Une section en dehors échappe à ce contexte et brise l'affichage.

---

*Univers Caresse — Journal des décisions V2 — Démarré le 3 avril 2026*

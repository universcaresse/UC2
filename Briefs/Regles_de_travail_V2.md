# RÈGLES DE TRAVAIL — UNIVERS CARESSE V2
### À coller au début de chaque conversation de code

---

## ⛔ VIOLATIONS INTERDITES — ARRÊT IMMÉDIAT

- Coder sans OUI explicite
- Livrer un fichier complet sans permission explicite
- Proposer plusieurs changements en même temps
- Ajouter du style inline dans le HTML ou le JS
- Créer une nouvelle classe CSS si une existante peut servir
- Créer une nouvelle fonction si une existante peut servir
- Modifier ou effacer le contenu existant d'un document — ajouts seulement
- Briser une fonctionnalité existante sans le signaler

---

## AVANT DE PROPOSER UN CHANGEMENT

Répondre aux 3 questions suivantes. Si une réponse manque — ne rien proposer.

1. Qu'est-ce que ce changement touche directement?
2. Qu'est-ce que ce changement touche ailleurs dans le site?
3. Qu'est-ce qui existait avant et qui pourrait briser?

---

## AVANT DE CODER

- Attendre le **OUI** explicite — "OK" = j'ai fait la modification OU oui à une question
- Lire le CSS avant tout changement visuel — vérifier si une classe existante peut être réutilisée
- Un seul changement à la fois — attendre la confirmation avant le suivant
- Résumer la demande avant de commencer pour valider la compréhension
- Ne pas expliquer l'analyse technique — résumer en langage simple

---

## LIVRAISON DU CODE

- Changement ciblé → **trouve/remplace uniquement** — jamais le fichier complet
- Le **Trouve** doit être court et unique — juste assez pour identifier l'endroit
- Le **Trouve** et le **Remplace** dans des blocs séparés — jamais dans le même bloc
- Changement majeur (touche tout le fichier) → demander la permission — attendre le OUI
- Toujours indiquer le fichier en premier

---

## RÈGLES D'AFFICHAGE — DÉCISIONS GLOBALES

Ces règles s'appliquent partout sur le site, sans exception, sauf décision contraire documentée dans le Journal des décisions.

### Ordre des listes
| Liste | Ordre |
|---|---|
| Collections | Par rang (croissant) |
| Lignes | Alphabétique |
| Recettes | Rang collection → ligne alphabétique → nom recette alphabétique |
| Ingrédients | Alphabétique |
| Factures | Chronologique inversé (plus récente en premier) |
| Formats de vente | Tel qu'entré (pas de tri automatique) |

### Filtres en cascade
Collection → Ligne → Recette — s'applique partout dans l'admin où on choisit une recette. Jamais une liste de 20 recettes quand 2 filtres suffisent à réduire à 3.

### Typographie
- Jamais de `font-size` codé en dur — toujours une variable du root
- Jamais de couleur codée en dur — toujours une variable du root

### Composants
- Un accordéon = une seule définition CSS — partout pareil
- Un bouton = `.btn` avec modificateur — pas de style ad hoc
- Un formulaire = `.form-ctrl`, `.form-groupe`, `.form-label` — partout pareil

---

## RÈGLES CSS

- Source unique : `style2.css` — public et admin partagent les mêmes fondations
- Variables dans `:root` — couleurs, typographie, espacements
- Jamais de style inline dans le HTML ou le JS
- Avant d'ajouter une classe — chercher si `.cache`, `.visible`, `.fade-in` ou autre classe existante peut servir

---

## RÈGLES APPS SCRIPT

- `getSS()` — une seule fonction de connexion, utilisée partout
- `doGet` et `doPost` — routing seulement, pas de logique métier
- Une fonction par action — pas de fonctions tentaculaires
- Ne jamais retirer les branchements existants sans le documenter

---

## RÈGLES LÉGALES — CRITIQUES

- **Ne jamais afficher le nom d'un ingrédient à la place de son code INCI — illégal**
- **Une recette ne peut pas passer au statut public tant que tous ses ingrédients n'ont pas un code INCI valide**
- La liste INCI commence par "Ingrédients :"
- Triée du plus grand au plus petit pourcentage (norme EU)
- Les fragrances regroupées sous "Fragrance" en fin de liste

---

## FIN DE TÂCHE

1. Dire **COMMIT**
2. Noter tout changement non confirmé — redemander si c'est réglé
3. Proposer la prochaine tâche selon les éléments du carnet de route

---

*Univers Caresse — Règles de travail V2 — 3 avril 2026*

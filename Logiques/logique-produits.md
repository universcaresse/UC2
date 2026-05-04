# UNIVERS CARESSE — LOGIQUE DE LA SECTION PRODUITS

Document de référence — toute modification au code de la section produits doit respecter cette logique.

---

## SHEETS UTILISÉES

| Sheet | Rôle |
|---|---|
| `Produits_v2` | Fiche principale de chaque produit |
| `Produits_Ingredients_v2` | Ingrédients de chaque produit avec quantité en g |
| `Produits_Formats_v2` | Formats vendus de chaque produit (poids, unité, prix, nb unités) |
| `Produits_Formats_Emballages_v2` | Emballages associés à chaque format d'un produit (séparé car un format peut avoir plusieurs emballages) |
| `Collections_v2` | Collections (Saponica, Petit Nuage, etc.) |
| `Gammes_v2` | Gammes à l'intérieur d'une collection |
| `Familles_v2` | Familles (optionnel — sous-regroupement dans une gamme) |
| `Gammes_Ingredients_v2` | Ingrédients de base par gamme (utilisés à la création d'un nouveau produit seulement) |
| `Categories_UC_v2` | Catégories d'ingrédients UC |
| `Ingredients_UC_v2` | Noms internes des ingrédients UC |
| `Ingredients_INCI_v2` | Codes INCI, notes olfactives et statut « validé / à valider » |
| `Stock_Ingredients_v2` | Stock courant et prix par g |
| `Config_v2` | Densité et marge de perte par catégorie UC |
| `Lots_v2` | Lots de fabrication (pour vérifier l'historique avant suppression) |
| `Ventes_Lignes_v2` | Lignes de ventes (pour vérifier l'historique avant suppression) |

---

## RÈGLES DE PERFORMANCE

- À l'arrivée sur la page Produits, **charger toutes les données nécessaires en mémoire** (produits, formats, emballages, ingrédients, stock, config, INCI, catégories, gammes, collections, familles).
- **Aucun appel serveur n'est fait à l'ouverture d'une fiche** ni à la bascule en édition. Tout est déjà en mémoire.
- À l'enregistrement d'un produit : **un seul appel serveur**. La mémoire locale est mise à jour avec le produit modifié — pas de rechargement complet.
- Un bouton **« Actualiser »** permet de forcer un rechargement complet si besoin (par exemple si une autre personne a modifié la sheet directement).

---

## RÈGLES TRANSVERSALES D'AFFICHAGE

- **Une seule vue est visible à la fois** : la grille, OU la fiche d'un produit, OU le formulaire d'édition. Jamais de chevauchement.
- Quand on bascule entre vues, les variables internes du formulaire (`ingredientsRecette`, `formatsRecette`, `emballagesRecette`) sont **vidées avant** d'être remplies. Aucun résidu d'une ouverture précédente.
- Quand on ferme une fiche ou un formulaire, on **revient à la position de scroll** où on était avant de l'ouvrir.
- Les filtres et la recherche **restent en place** quand on ferme une fiche. On ne perd pas sa position dans la grille.

---

## 1. ARRIVÉE SUR LA PAGE PRODUITS

→ Afficher la grille de produits, regroupée visuellement par **collection → gamme → famille** (titres de section visibles pour chaque niveau).

→ Tri par défaut : rang de collection → rang de gamme → rang de famille → nom alphabétique.

→ Chaque carte affiche :
- Photo (ou placeholder si pas de photo)
- Badge statut (Public / Test / Archivé)
- Badge collection
- Nom du produit
- Gamme
- Formats avec prix
- **Quantité en inventaire** (stock disponible, tiré de `Stock_Ingredients_v2`)

→ Barre de filtres en haut :
- Bouton « Tout » + un bouton par collection (filtre principal)
- Si une collection a plusieurs gammes : barre secondaire avec un bouton par gamme
- Filtre statut (Tout / Test / Public / Archivé)
- Recherche par nom
- Bouton ✕ qui **réinitialise vraiment tous les filtres** (collection, gamme, statut, nom)

---

## 2. OUVRIR LA FICHE D'UN PRODUIT

→ Clic sur une carte → spinner sur la carte pendant un instant → ouverture de la fiche.

→ La fiche affiche dans cet ordre :
- Visuel (photo + couleur HEX)
- Champs descriptifs : Collection, Gamme, Statut, Cure, Surgras, Couleur HEX
- Description
- Description pour emballage
- Avertissement
- Mode d'emploi
- Instructions
- Notes
- **Si au moins un ingrédient n'a pas d'INCI : avertissement visible** : « ⚠ Cette recette a X ingrédient(s) sans code INCI »
- Liste des ingrédients triée du plus grand au plus petit en quantité, avec :
  - Nom (avec ⚠ devant si pas d'INCI — **cliquable** pour aller directement à la section INCI le compléter, avec bouton « Retour à la recette »)
  - Code INCI
  - Quantité en g
  - Coût calculé (à partir du stock)
- **Liste INCI pour étiquette** : codes INCI seulement, triés par quantité décroissante.
  - Si plusieurs ingrédients ont le code INCI **« Fragrance »**, on n'affiche qu'un seul **« Fragrance »** dans la liste.
  - Si des notes olfactives sont renseignées pour ces ingrédients, on les regroupe et on les ajoute entre parenthèses à la fin : `Fragrance (boisé, doux, citronné)`
- Tableau des formats avec : format, nb unités, coût ingrédients, coût contenant, coût emballage, coût total, coût/unité, prix vente, marge

→ Boutons en bas : **Fermer** / **Modifier** / **Supprimer** (ou **Archiver** — voir section 6)

---

## 3. CRÉER UN NOUVEAU PRODUIT

→ Bouton « + Nouveau produit » → ouverture du formulaire vide.

→ **Statut par défaut : « Test »**.

→ Champs dans cet ordre (même ordre que la fiche) :
1. Nom *(requis)*
2. Collection *(requis)*
3. Gamme *(requis)*
4. Famille (optionnel)
5. Collections secondaires (cases à cocher)
6. Cure : champ jours **+ bouton « Pas applicable »** (si coché, champ désactivé et cure marquée N/A)
7. Surgras : champ % **+ bouton « Pas applicable »**
8. **Couleur HEX** : un grand carré de la taille d'une photo qui prend la couleur en temps réel. Champ HEX en dessous. Le `#` est automatique — on tape seulement les 6 caractères.
9. Statut
10. Description
11. Description pour emballage
12. Avertissement
13. Mode d'emploi
14. Instructions
15. Notes
16. **Photos côte à côte** : photo principale et photo saisonnière, sélectionnées via la **médiathèque uniquement** (pas de champ URL visible)

→ **Quand on choisit une gamme** :
- Les ingrédients de base de cette gamme se chargent automatiquement dans la liste d'ingrédients.
- **Uniquement à la création d'un nouveau produit.** Jamais en modification.

→ **Liste des ingrédients** — chaque rangée : Type / Nom / INCI (lecture seule) / Quantité.
- Bouton « + Ajouter un ingrédient » crée une rangée vide en bas.
- **Si l'ingrédient cherché n'existe pas**, l'utilisateur peut ouvrir un modal pour créer un nouvel ingrédient UC.
- **Si la catégorie UC n'existe pas**, l'utilisateur peut en créer une nouvelle depuis le même modal.
- Avant l'ouverture de tout modal, **toute la saisie en cours est sauvegardée** et restaurée au retour. Aucune perte de données.

→ **Liste des formats** — chaque rangée : Contenu net / Unité / Nb unités produits / Prix.
- Pour chaque format, possibilité d'ajouter des emballages (contenant + emballages avec quantité et nombre par unité).
- Les emballages d'un format sont attachés par une **référence stable interne** (pas par la clé poids+unité). Changer le poids ou l'unité d'un format **ne perd jamais ses emballages**.

→ Boutons en bas : **Enregistrer** / **Annuler**

---

## 4. MODIFIER UN PRODUIT EXISTANT

→ Depuis la fiche, bouton **Modifier** → bascule au formulaire pré-rempli.

→ Toutes les données viennent de la mémoire (instantané, aucun appel serveur).

→ **Les ingrédients chargés sont uniquement ceux du produit.** Les ingrédients de base de la gamme ne sont jamais ajoutés automatiquement.

→ **Si on change la gamme**, les ingrédients ne sont **pas modifiés**. Seule l'étiquette « gamme » change.

→ Toutes les autres règles du formulaire de création s'appliquent (sauvegarde/restauration avant modal, référence stable des emballages, etc.).

→ **Après enregistrement réussi → bascule automatique vers la fiche du produit** pour vérifier le résultat.

---

## 5. RÈGLES DE VALIDATION À L'ENREGISTREMENT

Refus si :
- Nom vide
- Collection vide
- Gamme vide
- Au moins un ingrédient avec une quantité de 0g → message : « L'ingrédient X a une quantité de 0g — veuillez la saisir ou retirer l'ingrédient. »

**On lit l'état de la mémoire JavaScript** (pas les valeurs HTML des menus déroulants) pour éviter les bugs de timing où une valeur visible à l'écran n'est pas encore disponible dans le DOM.

**Le bouton Enregistrer se déverrouille toujours** — succès, échec de validation, erreur réseau, ou exception imprévue. Il ne reste jamais bloqué. Le spinner s'arrête dans tous les cas.

---

## 6. SUPPRIMER OU ARCHIVER UN PRODUIT

Vérifier l'historique du produit :

**SI** le produit a au moins un lot dans `Lots_v2` OU au moins une ligne dans `Ventes_Lignes_v2` :
- Le bouton s'appelle **« Archiver »**
- Confirmation → statut passé à « Archivé »
- Le produit reste dans la sheet et dans l'admin, mais n'apparaît plus sur le site public

**SINON** :
- Le bouton s'appelle **« Supprimer »**
- Confirmation → effacement réel du produit et de toutes ses données liées (`Produits_Ingredients_v2`, `Produits_Formats_v2`, `Produits_Formats_Emballages_v2`)

---

## 7. STATUTS

| Statut | Visible dans l'admin | Visible sur le site public |
|---|---|---|
| Test | Oui | Non |
| Public | Oui | Oui |
| Archivé | Oui (avec badge distinct) | Non |

**Seuls les produits « Public » s'affichent sur le site public.**

---

## 8. EXPORTS

### Export 1 — Pour le graphiste (Word par courriel)

→ Bouton **« Envoyer au graphiste »** depuis la fiche.
→ Demande l'adresse courriel destinataire (pré-remplie, modifiable).
→ Génère un fichier Word avec toutes les infos du produit.
→ **Si au moins un ingrédient n'a pas de code INCI** : mention en haut du document : « ⚠ Attention : X ingrédient(s) n'ont pas de code INCI. La liste est incomplète. »
→ Envoi automatique par courriel avec le fichier en pièce jointe.

### Export 2 — Fiche recette PDF

→ Bouton **« Exporter fiche recette (PDF) »** depuis la fiche.
→ Génère un PDF mis en page comme une fiche partageable.
→ Le contenu exact (quels champs apparaissent) **sera défini plus tard** : Claude présentera une liste de cases à cocher avec tous les champs disponibles, l'utilisatrice cochera ce qu'elle veut voir dans le PDF.

---

## 9. UNIVERS (REGROUPEMENTS) — IMPACT SUR PRODUITS

La section Univers sera retravaillée séparément. Pour cette refonte :
- **Aucun ingrédient à 0g n'est accepté** à l'enregistrement.
- Le workaround « ingrédient sans odeur à 0g » devient inutile : la logique Univers Naturel sera basée sur l'absence d'huiles essentielles, traitée dans la refonte de la section Univers.

---

## 10. CE QUI EST RETIRÉ

- La section **« Import recettes »** : retirée du HTML et du JS.
- L'ancien bouton **« Copier pour le graphiste »** (presse-papier) : remplacé par les deux exports de la section 8.

---

## 11. CE QUI N'EST PAS TOUCHÉ DANS CETTE REFONTE

- Le **Catalogue Builder (PDF)** — autre section, on n'y touche pas.
- Le **calcul automatique de la couleur HEX** des gammes et collections.
- Le **calcul des coûts et marges** dans le tableau des formats de la fiche.
- Les **regroupements visuels** par collection, gamme et famille dans la grille.

---

*Document créé le 4 mai 2026. À conserver dans le dossier du site comme référence permanente.*

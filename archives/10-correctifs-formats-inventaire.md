# Correctifs Univers Caresse — Formats à la vente & affichage inventaire

> **But de ce document :** brief complet pour un autre Claude qui a accès au code. Tout le diagnostic est déjà fait ci-dessous — inutile de le refaire. Il reste à implémenter les changements en respectant les règles de travail (section finale).

---

## ⚠️ Règles de travail (à respecter en tout temps)

1. **Ne jamais coder sans mon autorisation explicite.** On discute et on valide l'approche *avant* d'écrire du code.
2. **Les corrections se font par « trouve et remplace ».** Un changement à la fois. J'attends que je dise « ok » avant de passer au suivant.
3. **Répondre en français.**

---

## Contexte technique

- **App :** Univers Caresse (savonnerie / cosmétiques).
- **Backend :** Google Apps Script, un seul fichier `code.gs` (~6500 lignes). Point d'entrée `doGet` (lectures) et `doPost` (écritures).
- **Frontend :** fichier(s) HTML séparé(s), **PAS encore fournis** — voir la section « Ce qu'il reste à fournir ».
- **Données :** Google Sheets. Le backend lit/écrit directement dans les feuilles.

---

## Les deux problèmes à régler

1. **Impossible de retirer un format de la vente sans le supprimer.** Pour arrêter de vendre un format, j'ai dû l'effacer du produit — alors que j'ai encore du stock fabriqué dans ce format.
2. **La page « inventaire » n'affiche pas le format des lots.** Je vois mes produits, mais pas dans quel format ils sont.

---

## Diagnostic déjà établi (NE PAS refaire)

### Deux tables gèrent les formats, et elles ne sont PAS liées de la même façon

- **`Produits_Formats_v2`** = les formats offerts **à la vente**. C'est cette table qu'on modifie quand on ajoute/retire un format à un produit.
- **`Lots_v2`** = l'inventaire **fabriqué**. Chaque lot stocke son format **en texte** (poids + unité) directement dans la ligne du lot. Ce n'est **pas** un lien (`format_id`) vers `Produits_Formats_v2`.

**Conséquence importante :** supprimer un format dans `Produits_Formats_v2` **n'efface pas** l'inventaire. Les lots conservent leur `format_poids` / `format_unite`. La donnée d'inventaire est intacte — le problème est ailleurs (pas de statut « inactif », et affichage manquant côté interface).

### Structure exacte des feuilles

**`Produits_Formats_v2`** (indices 0-based, tels que lus/écrits dans `code.gs`)

| Col | Index | Champ | Note |
|-----|-------|-------|------|
| A | 0 | `pro_id` | |
| B | 1 | `format_id` | format `FMT-0000` |
| C | 2 | `poids` | |
| D | 3 | `unite` | ex. `g` |
| E | 4 | `nb_unites` | |
| F | 5 | `prix_vente` | |
| G | 6 | `poste_gr` | |
| **H** | **7** | **`actif`** | **À AJOUTER** (voir solution) |

**`Lots_v2`** (inventaire fabriqué)

| Col | Index | Champ |
|-----|-------|-------|
| A | 0 | `lot_id` |
| B | 1 | `pro_id` |
| C | 2 | `multiplicateur` |
| D | 3 | `nb_unites` |
| E | 4 | `date_fabrication` |
| F | 5 | `date_disponibilite` |
| G | 6 | `cout_ingredients` |
| H | 7 | `cout_emballages` |
| I | 8 | `cout_revient_total` |
| J | 9 | `cout_par_unite` |
| K | 10 | *(réservé / vide)* |
| L | 11 | `format_poids` |
| M | 12 | `format_unite` |
| N | 13 | `nb_unites_format` |
| O | 14 | `nb_unites_vendu` |

### Fonctions clés dans `code.gs` (numéros de ligne approximatifs — à vérifier dans le fichier)

| Fonction | ~Ligne | Rôle |
|----------|--------|------|
| `getCataloguePublic_v2` | 265 | Catalogue **public / à la vente**. Construit `formatsMap` (~ligne 310-318). **C'est ici qu'on filtre les formats inactifs.** |
| `getProduits_v2` | 1315 | Liste des produits (admin). |
| `getProduitsFormats_v2` | 1374 | Formats d'un produit (admin). **Doit renvoyer `actif`.** |
| `saveProduit_v2` | 1399 | Sauvegarde produit. Le bloc formats (~1467-1515) **efface puis réécrit** toutes les lignes de format du produit. **Doit écrire `actif`.** |
| `deleteProduit_v2` | 1527 | Supprime un produit et ses formats. |
| `getStock_v2` | 1968 | ⚠️ Stock des **ingrédients**, pas des produits finis. Ne pas confondre. |
| `getLots_v2` | 4918 | Inventaire des lots. **Renvoie déjà `format_poids`, `format_unite`, `nb_unites_format`.** |
| `getLotsDisponibles_v2` | 4960 | Lots disponibles agrégés par produit + format. |
| `saveLot_v2` | 5009 | Crée un lot. Écrit `format_poids` / `format_unite` en texte. |

### Comment un format est « retiré » aujourd'hui

Dans `saveProduit_v2`, les formats sont **effacés puis réécrits** à partir de `data.formats` (le tableau envoyé par l'interface). Un format disparaît simplement en **n'étant plus dans le tableau soumis**. Donc côté interface, « retirer » un format = le sortir de la liste. C'est ce comportement qu'on veut remplacer par un statut « inactif ».

---

## Solution retenue

### Problème 1 — Ajouter une colonne `actif` aux formats

**Idée :** un format inactif reste dans `Produits_Formats_v2` (donc le lien avec l'inventaire est préservé), mais il n'apparaît plus à la vente. On ne supprime plus jamais un format juste pour arrêter de le vendre.

**Convention de valeur :**
- `actif` vide / `TRUE` / `1` → **actif** (par défaut).
- `FALSE` / `0` → **inactif**.
- **Vide = actif**, pour que les formats existants restent en vente sans migration obligatoire.

**Changements backend (`code.gs`) :**

1. **Feuille `Produits_Formats_v2`** : ajouter l'en-tête `actif` en **colonne H**. Laisser les lignes existantes vides (= actives).

2. **`getProduitsFormats_v2`** (~1374) : ajouter `actif` à l'objet retourné, en lisant l'index 7. Vide → `true`. Ne PAS filtrer ici : l'admin doit voir aussi les formats inactifs pour pouvoir les réactiver.

3. **`saveProduit_v2`** (~1467-1515) : dans la réécriture des formats, écrire `actif` comme **8e colonne** (index 7). Défaut `true` si non fourni.
   - ⚠️ **Bug pré-existant à corriger au passage :** le tableau de restauration `anciennesLignesFmt` (~ligne 1474) ne sauvegarde que les index 0 à 5 — il **oublie `poste_gr` (index 6)**. En ajoutant `actif`, la restauration doit capturer les index **0 à 7**.

4. **`getCataloguePublic_v2`** (~310-318) : lors de la construction de `formatsMap`, **ignorer les formats inactifs** (lire l'index 7 ; si explicitement inactif → `continue`). Résultat : le format disparaît de la vente mais reste dans la table.

5. **Vérifier les autres chemins de vente** : d'après la recherche, `Produits_Formats_v2` n'est lu qu'à deux endroits (`getCataloguePublic_v2` et `getProduitsFormats_v2`). Confirmer que les commandes/ventes (`getCommandePublique_v2`, `createCommande_v2`, ventes) consomment bien le catalogue public ou la liste admin, et non une lecture directe non filtrée. Ajouter le filtre `actif` partout où des formats sont servis **à la vente**.

**Changement interface (HTML — fichier requis) :**

- Dans le formulaire d'édition d'un produit, chaque ligne de format doit avoir une case à cocher **« En vente »** liée à `actif`.
- Décocher « En vente » = sauvegarder le format avec `actif = false` (au lieu de le retirer du tableau `data.formats`).
- Garder un vrai bouton « Supprimer » séparé, pour les cas où on veut réellement effacer un format (à utiliser avec prudence s'il y a du stock).
- Afficher visuellement l'état actif/inactif dans la liste.

---

### Problème 2 — Afficher le format dans l'inventaire

**Backend : rien à changer.** `getLots_v2` renvoie déjà `format_poids`, `format_unite` et `nb_unites_format` pour chaque lot.

**Changement interface (HTML — fichier requis) :**

- Sur la page inventaire, afficher le format de chaque lot, ex. `` `${format_poids} ${format_unite}` `` → « 100 g ».
- **Cas limite :** de vieux lots peuvent avoir `format_poids` / `format_unite` **vides** (fabriqués avant l'ajout de ces colonnes). Afficher alors un repère du genre « — » ou « (format non enregistré) » plutôt que du vide.
- Une correction de données (remplir le format des vieux lots) n'est pas automatisable de façon fiable — à traiter manuellement au besoin, pas dans le code.

---

## Ordre d'implémentation suggéré

1. Ajouter la colonne `actif` à la feuille `Produits_Formats_v2`.
2. Backend : `getProduitsFormats_v2` (lire `actif`).
3. Backend : `saveProduit_v2` (écrire `actif` + corriger la restauration `poste_gr`).
4. Backend : `getCataloguePublic_v2` (filtrer les inactifs) + vérifier les autres chemins de vente.
5. Interface : case « En vente » sur les formats.
6. Interface : affichage du format sur la page inventaire.

> Rappel : **un changement à la fois, en trouve-et-remplace, avec mon « ok » entre chaque.**

---

## Ce qu'il reste à fournir

- **Le ou les fichiers HTML de l'interface** (pages « produits » et « inventaire », ou le fichier interface principal). Les étapes 5 et 6, ainsi que la case à cocher de l'étape 1, ne peuvent pas être faites sans ces fichiers — `code.gs` ne contient que le backend.

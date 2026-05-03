# UNIVERS CARESSE — LOGIQUE DE LA SECTION ACHATS

**Document de référence** — toute modification au code de la section achats doit respecter cette logique.

---

## SHEETS UTILISÉES

| Sheet | Rôle |
|---|---|
| `Fournisseurs_v2` | Liste des fournisseurs |
| `Categories_Fournisseurs_v2` | Catégories propres aux fournisseurs avec scraping |
| `Produits_Fournisseurs_v2` | Noms de produits chez les fournisseurs avec scraping |
| `Categories_UC_v2` | Catégories internes UC |
| `Ingredients_UC_v2` | Noms internes UC |
| `Ingredients_INCI_v2` | INCI et infos détaillées des ingrédients |
| `Formats_Ingredients_v2` | Formats achetés par ingrédient + fournisseur |
| `Mapping_Fournisseurs_v2` | Lien entre nom fournisseur et ingrédient UC |
| `Achats_Entete_v2` | En-tête des factures d'achat |
| `Achats_Lignes_v2` | Lignes des factures d'achat |
| `Stock_Ingredients_v2` | Stock courant par ingrédient |
| `Config_v2` | Densité et marge de perte par catégorie UC |

---

## FOURNISSEURS AVEC SCRAPING

Quatre fournisseurs ont du scraping qui fournit l'INCI et les notes olfactives :
**PA, MH, Arbressence, DE**

Tous les autres fournisseurs (existants ou nouveaux) sont **sans scraping**.

---

## CATÉGORIES UC SANS INCI

Quatre catégories UC n'ont pas besoin d'INCI pour être complètes :

| Code | Nom |
|---|---|
| CAT-014 | Emballages |
| CAT-015 | Divers |
| CAT-016 | Contenants |
| CAT-017 | Étiquettes |

Quand un nouvel ingrédient est créé dans une de ces catégories, son entrée dans `Ingredients_INCI_v2` est marquée **"validé"** d'office.

Pour toutes les autres catégories, l'entrée est marquée **"à valider"**.

---

## 1. OUVERTURE DE LA PAGE

**SI** une facture est "En cours" dans `Achats_Entete_v2`
→ afficher bandeau "Facture #X chez Y du Z" avec deux boutons :
- **[Reprendre]** → charger l'en-tête et les lignes, afficher la zone de saisie
- **[Annuler]** → effacer l'en-tête et les lignes, revenir à l'écran vide

**SINON** → afficher l'écran vide prêt à créer une nouvelle facture

**FIN DE SI**

---

## 2. CRÉATION D'UNE NOUVELLE FACTURE

### Choix du fournisseur

Liste des fournisseurs existants + option **"+ Nouveau fournisseur"**.

**SI** "+ Nouveau fournisseur" est choisi
→ ouvrir un modal pour entrer nom, code, site web, notes
→ le nouveau fournisseur est automatiquement classé **sans scraping**

**FIN DE SI**

### Saisie du numéro de facture et de la date

Trois champs : jour, mois, année. Aucune action automatique.

### Clic sur [Créer]

**SI** ce numéro de facture existe déjà chez ce **même fournisseur**
→ afficher "Facture déjà entrée"
→ ne rien créer

**SINON**
→ créer l'en-tête dans `Achats_Entete_v2` avec statut **"En cours"**
→ afficher la zone de saisie des items

**FIN DE SI**

---

## 3. SAISIE D'UN ITEM — FOURNISSEUR AVEC SCRAPING

Colonnes visibles :
**Catégorie fournisseur · Nom fournisseur · Format · Quantité · Prix unitaire · Total · Catégorie UC · Nom UC**

### Catégorie fournisseur

**SI** existe dans `Categories_Fournisseurs_v2`
→ la choisir

**SINON**
→ la créer (ajouter dans `Categories_Fournisseurs_v2`)

**FIN DE SI**

### Nom fournisseur

Liste filtrée par fournisseur + catégorie fournisseur.

**SI** existe dans `Produits_Fournisseurs_v2`
→ le choisir

**SINON**
→ le créer (ajouter dans `Produits_Fournisseurs_v2`)

**FIN DE SI**

### Format

Liste filtrée par ingrédient + fournisseur dans `Formats_Ingredients_v2`.

**SI** un format existe pour ce produit chez ce fournisseur
→ le choisir

**SINON**
→ entrer quantité + unité (g, kg, ml, L, lbs, unité)
→ **SI** unité = "unité" → indiquer combien d'unités dans le contenant
→ **FIN DE SI**
→ sauvegarder dans `Formats_Ingredients_v2` **seulement si vraiment nouveau** (vérifier que ce format exact n'existe pas déjà)

**FIN DE SI**

### Quantité et prix unitaire

Total ligne calculé en direct = quantité × prix unitaire.

### Catégorie UC + Nom UC

**SI** ce nom fournisseur est déjà mappé à un ingrédient UC dans `Mapping_Fournisseurs_v2`
→ catégorie UC et nom UC s'inscrivent automatiquement

**SINON**
→ choisir cat UC (ou créer dans `Categories_UC_v2`)
→ choisir nom UC (ou créer dans `Ingredients_UC_v2` + entrée dans `Ingredients_INCI_v2`)
→ **SI** la cat UC est CAT-014/015/016/017 → statut "validé" d'office, **SINON** → statut "à valider"
→ enregistrer le lien dans `Mapping_Fournisseurs_v2`

**FIN DE SI**

### Clic sur [Ajouter]

→ Ligne ajoutée dans `Achats_Lignes_v2`
→ Affichée dans le tableau
→ Sous-total recalculé

---

## 4. SAISIE D'UN ITEM — FOURNISSEUR SANS SCRAPING

Colonnes visibles :
**Catégorie UC · Nom UC · Format · Quantité · Prix unitaire · Total**

(Pas de catégorie fournisseur. Pas de nom fournisseur.)

### Catégorie UC

**SI** existe → la choisir
**SINON** → la créer dans `Categories_UC_v2`
**FIN DE SI**

### Nom UC

Liste filtrée par catégorie.

**SI** existe → le choisir

**SINON**
→ le créer dans `Ingredients_UC_v2`
→ ajouter une entrée dans `Ingredients_INCI_v2`
→ **SI** la cat UC est CAT-014/015/016/017 → statut "validé", **SINON** → statut "à valider"

**FIN DE SI**

### Format

Liste filtrée par ingrédient + fournisseur dans `Formats_Ingredients_v2`.

**SI** existe → le choisir

**SINON**
→ entrer quantité + unité
→ sauvegarder dans `Formats_Ingredients_v2` **seulement si vraiment nouveau**

**FIN DE SI**

### Quantité et prix unitaire

Total ligne calculé en direct.

### Clic sur [Ajouter]

→ Ligne ajoutée dans `Achats_Lignes_v2`
→ Ajouter aussi une entrée dans `Mapping_Fournisseurs_v2` :
   - fournisseur = le fournisseur de la facture
   - cat fournisseur = **vide**
   - nom fournisseur = **vide**
   - ingrédient UC = le nom UC choisi
→ Les sheets `Categories_Fournisseurs_v2` et `Produits_Fournisseurs_v2` ne sont **pas touchées**

---

## 5. MODIFIER OU SUPPRIMER UNE LIGNE (AVANT FINALISATION)

### Modifier

Clic sur **[Modifier]** d'une ligne :
→ La ligne disparaît **temporairement** du tableau
→ Ses valeurs remontent dans la zone de saisie
→ Tu corriges, tu confirmes
→ La ligne revient **à sa place** avec les nouvelles valeurs
→ **PAS DE DOUBLON**
→ Sous-total recalculé

### Supprimer

Clic sur **[Supprimer]** d'une ligne :
→ Confirmation demandée
→ **SI** oui → ligne effacée de `Achats_Lignes_v2`, sous-total recalculé

---

## 6. FINALISATION

### Saisie TPS + TVQ + livraison

Total recalculé en direct = sous-total + TPS + TVQ + livraison.

### Clic sur [Finaliser]

1. Calculer le **facteur de majoration** = total ÷ sous-total

2. Mettre à jour `Achats_Entete_v2` :
   - montants finaux (TPS, TVQ, livraison, total)
   - statut → **"Finalisé"**
   - facteur de majoration

3. Pour chaque ligne dans `Achats_Lignes_v2`, calculer le **prix réel** :
   - **SI** format en g/kg/ml/L/lbs → prix par gramme réel = (prix unitaire ÷ grammes du format) × facteur × (1 + marge de perte %). La conversion en grammes utilise la densité de la catégorie UC (`Config_v2`).
   - **SI** format en unité → prix par unité réel = (prix unitaire ÷ nombre d'unités) × facteur × (1 + marge de perte %). Pas de conversion en grammes.

4. Mettre à jour `Stock_Ingredients_v2` :
   - ajouter les grammes ou unités achetés
   - recalculer le prix moyen pondéré

---

## 7. ANNULATION D'UNE FACTURE FINALISÉE

Clic sur [Supprimer] d'une facture finalisée :
→ Confirmation demandée
→ **Enlever** les grammes/unités correspondants du `Stock_Ingredients_v2` (sans condition)
→ Effacer l'en-tête de `Achats_Entete_v2`
→ Effacer toutes les lignes de `Achats_Lignes_v2`

---

## RÈGLES TRANSVERSALES

- Le champ **"contenant"** est supprimé partout (interface et sheets)
- Le format en **"unité"** sert pour les emballages, étiquettes, contenants, etc. — pas de conversion en grammes, mais le facteur de majoration et la marge de perte s'appliquent quand même
- Le mapping fournisseur ↔ ingrédient UC se fait **toujours** dans `Mapping_Fournisseurs_v2`, peu importe le type de fournisseur
- Le modal **"nouveau fournisseur"** est le même partout (page Achats et page Fournisseurs)

---

*Document créé le 3 mai 2026. À conserver dans le dossier du site comme référence permanente.*

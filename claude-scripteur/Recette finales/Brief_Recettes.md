# BRIEF UNIVERS CARESSE — RECETTES
**Date de création :** 28 mars 2026
**Dernière mise à jour :** 28 mars 2026

---

## CONTEXTE

SAPONICA (aussi appelée Univers Caresse) est une boutique de cosmétiques artisanaux. Les recettes sont gérées dans des fichiers Markdown (.md), une collection par fichier, et dans certains cas une fiche par savon. Ces fichiers servent à alimenter un projet final (base de données ou application) dont l'import est **sensible à la casse et au vocabulaire exact**.

---

## RÈGLES ABSOLUES À RESPECTER

### 1. Noms d'ingrédients — référence unique
Le fichier **`ingredients_projet.xlsx`** (colonne **Nom UC**) est **la seule référence valide** pour nommer les ingrédients. Tout nom d'ingrédient dans les recettes doit correspondre **exactement** au Nom UC — casse, accents, espaces inclus.

### 2. Structure d'une fiche recette
Chaque fiche produit suit cette structure dans cet ordre :

```
**HEX :** #XXXXXX
**Image :** [url cloudinary]
**Image Noël :** [url cloudinary]  ← seulement si disponible
**Surgras :** X%  ← seulement si applicable
**Collections secondaires :** NOM  ← seulement si applicable

---

## RECETTE DE BASE [NOM COLLECTION]
[liste ingrédients avec quantités]

---

**Fragrances :**
- Xg NOM_INGRÉDIENT

**Additifs :**
- Xg NOM_INGRÉDIENT

**Instructions :** [si applicable]

**Notes :** [si applicable]

**Version courte :** [texte]

**Version longue :** [texte]
```

### 3. Horodatage obligatoire
Chaque fichier doit avoir en entête :
```
**Date de création :** 19 mars 2026
**Dernière mise à jour :** JJ mois AAAA
```

### 4. Préfixes HE / HA
- `HE` = Huile Essentielle
- `HA` = Huile Aromatique (ou fragrance)
- Ne jamais écrire `huile essentielle` ou `huile aromatique` en toutes lettres dans les ingrédients

---

## STANDARDISATION DES NOMS — HISTORIQUE COMPLET

Toutes ces corrections ont été validées et appliquées. Ne jamais revenir aux anciens noms.

| Ancien nom | Nom UC correct |
|-----------|----------------|
| Hydroxyde de sodium / NaOH | Soude caustique (NaOH) |
| Huile de tournesol | Huile de tournesol oléique |
| Huile amande douce / Huile d'amande douce | Huile végétale amande douce |
| Beurre cacao / Beurre de cacao | Beurre de cacao brut |
| Glycérine | Glycérine végétale |
| Hydrolat de lavande | Hydrolat lavande |
| Poudre shikakaï / Poudre de shikakaï | Shikakaï en poudre |
| Indigo naturel | Indigo |
| HE cèdre feuille | HE cèdre feuilles |
| HE cèdre d'Atlas | HE cèdre atlas |
| Charbon / Charbon activé | Charbon activé végétal |
| HE basilic doux | HE basilic |
| HE lavande vraie | HE lavande |
| HE thé vert | HA thé vert |
| Arôme fraise / Arôme de fraise | Arôme de fraises |
| Arôme fraise (baumes enfant) | Saveur de fraises |
| Poire (sans préfixe) | HA poire |
| Orange douce (sans préfixe) | HE orange douce |
| Eau déminéralisée / Eau distillée | Eau |
| ylang ylang | HE ylang-ylang |
| musk / Musc | musc blanc *(minuscule)* |
| Miel | miel *(minuscule)* |
| Matcha (seul) | Colorant matcha |
| 5 gouttes Pink | 5 gouttes Colorant PINK |
| Avoine moulue | Avoine colloïdale |
| Huile d'olive vierge (ingrédients) | Huile d'olive |
| HE jasmin | HA jasmin |

**Exceptions confirmées :**
- Caprin : `235g eau glacée` (eau glacée conservée — note explicative dans la recette)
- `vierge` conservé dans les **textes descriptifs** seulement, pas dans les ingrédients
- `HE eucalyptus radié` et `HE eucalyptus radiata` : deux produits distincts, conservés tels quels

---

## FICHIERS EXISTANTS

### Collections — fichiers MD globaux
| Fichier | Collection | Cure | Nb unités |
|---------|-----------|------|-----------|
| Recettes_Saponica.md | Savon Saponica | 28 jours | 9 |
| Recettes_Petit_Nuage.md | Petit Nuage | 28 jours | 9 |
| Recettes_Anima.md | Savon animaux | 42 jours | 9 |
| Recettes_Casa.md | Maison | aucune | variable |
| Recettes_Caprin.md | Lait de chèvre | 42 jours | 12 |
| Recettes_Kerys.md | Shampoings solides | aucune | 1 |
| Recettes_Emolia.md | Baumes & bombes | aucune | variable |
| Recettes_Lui.md | Collection LUI | 42 jours | variable |
| Recettes_Epure.md | Savon à main | 42 jours | 10 |

### Fiches individuelles Saponica
16 fichiers MD — un par savon — dans le dossier `/Saponica/` :
BOREAL.md, BOIS_DE_CARACTERE.md, BRISE_DES_LAGUNES.md, CLUB_PRIVE.md, DELICAT.md, DOUCE_PENSEE.md, ECLAT_DE_MER.md, ECLAT_FLORAL.md, ECLAT_TROPICAL.md, ETREINTE_GOURMANDE.md, FEU_DAUTOMNE.md, JARDIN_DAURORE.md, JARDIN_DE_ROSES.md, NUAGE_DE_LAVANDE.md, SOLEIL_DE_PROVENCE.md, VOILE_DE_POIRE.md

Ces fiches incluent déjà : HEX, Image, Image Noël, Surgras (8%), recette de base, fragrances, additifs, notes, versions courte et longue.

---

## TAUX DE SURGRAS PAR COLLECTION

| Collection | Surgras |
|-----------|---------|
| Saponica | 8% |
| Petit Nuage | 10% |
| Anima (Pattes blanches) | 10% |
| Caprin | 8% |
| Nordet (Lui) | 10% |
| Esker (Lui) | 7-8% |
| Lichen (Lui) | 6-8% |
| Épure, Kérys, Émolia, Casa | non spécifié |

---

## CHAMPS DISPONIBLES PAR FICHE PRODUIT

| Champ | Obligatoire | Notes |
|-------|------------|-------|
| HEX | Oui | Code couleur du savon |
| Image | Si disponible | URL Cloudinary |
| Image Noël | Si disponible | URL Cloudinary |
| Surgras | Si applicable | En % |
| Collections secondaires | Si applicable | Ex: LUI |
| Recette de base | Oui | Ingrédients + quantités |
| Fragrances | Si applicable | |
| Additifs | Si applicable | |
| Instructions | Si applicable | |
| Notes | Oui | Peut être vide |
| Version courte | Oui | Texte marketing court |
| Version longue | Oui | Texte marketing long |

---

## PROCHAINES ÉTAPES

### Fiches individuelles à créer (même format que Saponica)
Les collections suivantes n'ont pas encore de fiches individuelles par produit :
- Petit Nuage (5 savons)
- Anima (1 savon)
- Caprin (6 savons)
- Épure (4 savons)
- Kérys (5 shampoings)
- Émolia (baumes, bombes, etc.)
- Lui (4 savons)

### Liens photos à intégrer
Le fichier **`liens_photos.xlsx`** contient les URLs pour les collections non-Saponica encore à traiter. Correspondances déjà documentées dans la session précédente.

### Fichiers à toujours transmettre en début de session
1. Les fichiers MD de la collection à travailler
2. Ce brief
3. Le fichier `liens_photos.xlsx`
4. Le fichier `ingredients_projet.xlsx` (colonne Nom UC = référence des noms)

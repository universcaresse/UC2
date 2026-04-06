# BRIEF UNIVERS CARESSE — RECETTES
**Date de création :** 28 mars 2026
**Dernière mise à jour :** 30 mars 2026

---

## CONTEXTE

SAPONICA (aussi appelée Univers Caresse) est une boutique de cosmétiques artisanaux. Les recettes sont gérées dans des fichiers Markdown (.md) — un fichier global par collection ET une fiche individuelle par produit. Ces fichiers servent à alimenter un projet final (base de données ou application) dont l'import est **sensible à la casse et au vocabulaire exact**.

---

## RÈGLES ABSOLUES À RESPECTER

### 1. Noms d'ingrédients — référence unique
Le fichier **`ingredients_projet.xlsx`** (colonne **Nom UC**) est **la seule référence valide** pour nommer les ingrédients. Tout nom d'ingrédient dans les recettes doit correspondre **exactement** au Nom UC — casse, accents, espaces inclus.

### 2. Format des quantités
- Toujours en grammes : `325g Huile de tournesol oléique`
- Le chiffre colle au `g` : `325g` et non `325 g`
- Utiliser le point comme séparateur décimal : `17.5g` et non `17,5g`

### 3. Structure obligatoire d'une fiche recette
Chaque fiche produit suit cette structure **dans cet ordre** :

```
# NOM DU PRODUIT — NOM COLLECTION

**Date de création :** JJ mois AAAA
**Dernière mise à jour :** JJ mois AAAA
**Ligne :** NOM COLLECTION | **Cure :** X jours | **Nb unités :** X | **Statut :** public

---

**HEX :** #XXXXXX
**Image :** https://...         ← seulement si disponible
**Image Noël :** https://...    ← seulement si disponible
**Rang :** X
**Surgras :** X%                ← seulement si applicable
**Collections secondaires :** NOM  ← seulement si applicable

---

## RECETTE DE BASE [NOM COLLECTION]

- Xg Ingrédient
- Xg Ingrédient

---

**Fragrances :**
- Xg HE ou HA ingrédient

**Additifs :**
- Xg Ingrédient

**Instructions :** [si applicable]

**Notes :** [texte ou vide]

**Version courte :** [texte]

**Version longue :** [texte]
```

### 4. Horodatage obligatoire
```
**Date de création :** 19 mars 2026
**Dernière mise à jour :** JJ mois AAAA
```

### 5. Préfixes HE / HA
- `HE` = Huile Essentielle
- `HA` = Huile Aromatique ou fragrance
- Ne jamais écrire `huile essentielle` ou `huile aromatique` en toutes lettres dans les ingrédients

### 6. Casse des ingrédients
- Première lettre du nom en **majuscule** : `Huile de tournesol oléique`
- Exceptions minuscules : `miel`, `musc blanc`
- Les HE/HA gardent leur format : `HE lavande`, `HA poire`

---

## COLLECTIONS ET RANGS

| Rang | Collection | Cure | Nb unités |
|------|-----------|------|-----------|
| 1 | SAPONICA | 28 jours | 9 |
| 2 | PETIT NUAGE | 28 jours | 9 |
| 3 | CAPRIN | 42 jours | 12 |
| 4 | ÉMOLIA | variable | variable |
| 5 | ÉPURE | 42 jours | 10 |
| 6 | KÉRYS | aucune | 1 |
| 7 | CASA | aucune | variable |
| 8 | LUI | 42 jours | variable |
| 9 | ANIMA | 42 jours | 9 |

---

## TAUX DE SURGRAS PAR COLLECTION

| Collection | Surgras |
|-----------|---------|
| SAPONICA | 8% |
| PETIT NUAGE | 10% |
| ANIMA — Pattes blanches | 10% |
| CAPRIN | 8% |
| NORDET (LUI) | 10% |
| ESKER (LUI) | 7-8% |
| LICHEN (LUI) | 6-8% |
| ÉPURE, KÉRYS, ÉMOLIA, CASA | non spécifié |

---

## STANDARDISATION DES NOMS — HISTORIQUE COMPLET

Toutes ces corrections ont été validées et appliquées. Ne jamais revenir aux anciens noms.

| Ancien nom | Nom UC correct |
|-----------|----------------|
| Hydroxyde de sodium / NaOH / Soude caustique | Soude caustique (NaOH) |
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
| Colorant PINK / 5 gouttes Pink | Colorant pink |
| Avoine moulue | Avoine colloïdale |
| Huile d'olive vierge (ingrédients) | Huile d'olive |
| HE jasmin | HA jasmin |

**Exceptions confirmées :**
- CAPRIN : `235g Eau glacée` — eau glacée conservée avec note explicative
- `vierge` conservé dans les **textes descriptifs** seulement, pas dans les ingrédients
- `HE eucalyptus radié` et `HE eucalyptus radiata` : deux produits distincts, conservés tels quels

---

## INVENTAIRE COMPLET DES FICHES PRODUITES

### Fichiers MD globaux (un par collection)
| Fichier | Statut |
|---------|--------|
| Recettes_Saponica.md | ✅ Complet |
| Recettes_Petit_Nuage.md | ✅ Complet |
| Recettes_Anima.md | ✅ Complet |
| Recettes_Casa.md | ✅ Complet |
| Recettes_Caprin.md | ✅ Complet |
| Recettes_Kerys.md | ✅ Complet |
| Recettes_Emolia.md | ✅ Complet |
| Recettes_Lui.md | ✅ Complet |
| Recettes_Epure.md | ✅ Complet |

### Fiches individuelles — Total : 79 fiches

#### /Saponica/ — Rang 1 — 16 fiches
| Fiche | Photos |
|-------|--------|
| BOREAL.md | ✅ Image + Noël |
| BOIS_DE_CARACTERE.md | ❌ |
| BRISE_DES_LAGUNES.md | ✅ Image + Noël |
| CLUB_PRIVE.md | ✅ Image + Noël |
| DELICAT.md | ✅ Image + Noël |
| DOUCE_PENSEE.md | ✅ Image + Noël |
| ECLAT_DE_MER.md | ✅ Image + Noël |
| ECLAT_FLORAL.md | ✅ Image + Noël |
| ECLAT_TROPICAL.md | ✅ Image + Noël |
| ETREINTE_GOURMANDE.md | ✅ Image + Noël |
| FEU_DAUTOMNE.md | ✅ Image + Noël |
| JARDIN_DAURORE.md | ✅ Image + Noël |
| JARDIN_DE_ROSES.md | ✅ Image + Noël |
| NUAGE_DE_LAVANDE.md | ✅ Image seulement |
| SOLEIL_DE_PROVENCE.md | ✅ Image + Noël |
| VOILE_DE_POIRE.md | ✅ Image + Noël |

#### /Petit_Nuage/ — Rang 2 — 5 fiches
| Fiche | Photos |
|-------|--------|
| PETIT_NUAGE_BONBON.md | ✅ Image + Noël |
| PETIT_NUAGE_CALIN.md | ✅ Image seulement |
| PETIT_NUAGE_DOUCE_BAIE.md | ✅ Image seulement |
| PETIT_NUAGE_FLEURI.md | ✅ Image seulement |
| PETIT_NUAGE_ROSE.md | ✅ Image seulement |

#### /Caprin/ — Rang 3 — 6 fiches
| Fiche | Photos |
|-------|--------|
| CAPRICE_FRAISE.md | ❌ À venir |
| CERISE_DE_VELOURS.md | ❌ À venir |
| ECLOSION_DE_SOIE.md | ❌ À venir |
| FRAICHEUR_DE_MELON.md | ❌ À venir |
| ORANGE_SAUVAGE.md | ❌ À venir |
| POMME_EMERAUDE.md | ❌ À venir |

#### /Emolia/ — Rang 4 — 21 fiches
| Fiche | Photos |
|-------|--------|
| BAISER_FRUITE.md | ❌ À venir |
| BAUME_LEVRES_ENFANT_ETE.md | ❌ À venir |
| BAUME_LEVRES_ENFANT_HIVER.md | ❌ À venir |
| FRAISE_ET_BASILIC.md | ❌ À venir |
| LAVANDE_ROMARIN.md | ❌ À venir |
| MENTHE_POIVREE.md | ❌ À venir |
| SOUFFLE_ETE.md | ❌ À venir |
| SOUFFLE_HIVER.md | ❌ À venir |
| VENT_FRAIS.md | ❌ À venir |
| EFFLUVE_APAISANT.md | ❌ À venir |
| PETIT_BOUCLIER.md | ❌ À venir |
| BOMBE_BAIN_BOREAL.md | ❌ À venir |
| BOMBE_BAIN_BRISE_DES_LAGUNES.md | ❌ À venir |
| BOMBE_BAIN_DELICAT.md | ❌ À venir |
| BOMBE_BAIN_DOUCE_PENSEE.md | ❌ À venir |
| BOMBE_BAIN_NUAGE_DE_LAVANDE.md | ❌ À venir |
| BOMBE_BAIN_VANILLE_CITRON.md | ❌ À venir |
| BOMBES_BAIN_PETIT_NUAGE.md | ❌ À venir |
| BRUME_DE_ROSEE.md | ❌ À venir |
| INSTANT_DU_BARBIER.md | ❌ À venir |
| ELIXIR_DU_MATIN.md | ❌ À venir |

#### /Epure/ — Rang 5 — 4 fiches
| Fiche | Photos |
|-------|--------|
| GRAIN_DACIER.md | ✅ Image seulement |
| HERBE_DOUCE.md | ✅ Image seulement |
| MOUSSE_DESPRESSO.md | ✅ Image seulement |
| MURMURE_DOLIVA.md | ✅ Image seulement |

#### /Kerys/ — Rang 6 — 6 fiches
| Fiche | Photos |
|-------|--------|
| BRISE_MATINALE.md | ✅ Image seulement |
| PURE_HARMONIE.md | ✅ Image seulement |
| BOTANICA.md | ❌ À venir |
| DOUCEUR_DES_ILES.md | ❌ À venir |
| CLARTE_VERTE.md | ❌ À venir |
| RAYON_LUMINEUX.md | ❌ À venir |

#### /Casa/ — Rang 7 — 16 fiches
| Fiche | Photos |
|-------|--------|
| BOUGIE_CLUB_PRIVE.md | ❌ À venir |
| BOUGIE_FEU_DAUTOMNE.md | ❌ À venir |
| BOUGIE_LESSIVE_FRAICHE.md | ❌ À venir |
| BOUGIE_NUAGE_DE_LAVANDE.md | ❌ À venir |
| BOUGIE_PIVOINE_ET_POIRE.md | ❌ À venir |
| BRUINE_AGRUMES_ROMARIN.md | ❌ À venir |
| BRUINE_LESSIVE_FRAICHE.md | ❌ À venir |
| BRUINE_POIRE.md | ❌ À venir |
| BRUINE_LAVANDE.md | ❌ À venir |
| BRUINE_BRISE_DES_LAGUNES.md | ❌ À venir |
| ECLAT_CITRONNE.md | ❌ À venir |
| EAU_LINGE_GRAND_AIR.md | ❌ À venir |
| EAU_LINGE_SERENITE_PURE.md | ❌ À venir |
| EAU_LINGE_LESSIVE_FRAICHE.md | ❌ À venir |
| EAU_LINGE_LAVANDE.md | ❌ À venir |
| SOUFFLE_DE_SAPIN.md | ❌ À venir |

#### /Lui/ — Rang 8 — 4 fiches
| Fiche | Photos |
|-------|--------|
| NORDET.md | ❌ À venir |
| ESKER.md | ❌ À venir |
| LICHEN.md | ❌ À venir |
| AUTOMNE.md | ⚠️ En développement |

#### /Anima/ — Rang 9 — 1 fiche
| Fiche | Photos |
|-------|--------|
| PATTES_BLANCHES.md | ❌ À venir |

---

## À FAIRE EN PROCHAINES SESSIONS

### Photos à intégrer dès disponibles
Quand les photos arrivent, ajouter les champs `**Image :**` et `**Image Noël :**` (si applicable) immédiatement après `**HEX :**` dans chaque fiche concernée.

| Collection | Fiches sans photo |
|-----------|-------------------|
| SAPONICA | BOIS_DE_CARACTERE |
| CAPRIN | 6 fiches |
| ÉMOLIA | 21 fiches |
| CASA | 16 fiches |
| LUI | 3 fiches |
| ANIMA | 1 fiche |
| KÉRYS | 4 fiches |

### Recette à compléter
- **AUTOMNE (LUI)** : nom, recette et textes en développement — à documenter avec Chantal

### Ingrédients à confirmer dans le projet
- `alcool à 70%` et `essence au choix` dans CASA — pas encore de Nom UC défini
- `arôme de vanille` dans bombes de bain Émolia — à valider

### Fichiers à toujours transmettre en début de session
1. Les fiches MD de la collection à travailler
2. Ce brief (`Brief_Univers_Caresse.md`)
3. Le fichier `liens_photos.xlsx`
4. Le fichier `ingredients_projet.xlsx` (colonne **Nom UC** = référence des noms)

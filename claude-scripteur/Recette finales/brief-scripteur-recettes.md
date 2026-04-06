# Brief — Scripteur de recettes SAPONICA

## Format du fichier

Chaque recette est un fichier `.md` séparé.

---

## Structure obligatoire

```
# NOM DE LA RECETTE — SAPONICA

**Date de création :** JJ mois AAAA
**Dernière mise à jour :** JJ mois AAAA
**Ligne :** Savon | **Cure :** 28 jours | **Nb unités :** 9 | **Statut :** public

---

**HEX :** #XXXXXX
**Image :** https://...
**Image Noël :** https://...
**Surgras :** 8%

---

## RECETTE DE BASE SAPONICA

- 325g Huile de tournesol oléique
- 260g Huile de coco
- 65g Beurre de karité
- 184g Eau
- 92g Soude caustique (NaOH)

---

**Fragrances :**
- 10g HE géranium rosat
- 5g HE ylang-ylang

**Additifs :**
- 17.5g Argile rose

**Notes :** texte libre

**Version courte :** Une phrase courte pour l'emballage.

**Version longue :** Description complète de la recette.
```

---

## Règles importantes

### Noms des ingrédients
Les noms doivent être écrits **exactement** comme dans la liste ci-dessous — respect de la casse, des accents et de l'orthographe.

### Format des quantités
- Toujours en grammes : `325g Huile de tournesol oléique`
- Le chiffre colle au `g` : `325g` et non `325 g`
- Utiliser le point comme séparateur décimal : `17.5g` et non `17,5g`

### Statut
- `public` — recette visible sur le site
- `test` — recette en développement

---

## Liste des noms d'ingrédients acceptés

### Huiles & Beurres
- Huile de tournesol oléique
- Huile d'olive
- Huile de coco
- Beurre de karité
- Huile de calendula
- Huile de rose
- Huile végétale amande douce
- Huile de ricin
- Huile d'argan
- Huile végétale jojoba
- Huile végétale de pépins de raisin
- Huile de café
- Beurre de cacao brut
- Beurre de mangue

### Lessive
- Soude caustique (NaOH)

### Eau
- Eau

### Huiles essentielles
- HE petitgrain
- HE cèdre feuilles
- HE cèdre atlas
- HE palmarosa
- HE lavande
- HE géranium rosat
- HE citron
- HE menthe poivrée
- HE orange douce
- HE patchouli
- HE eucalyptus radiata
- HE bergamote
- HE poivre noir
- HE sapin
- HE basilic
- HE romarin
- HE pin blanc
- HE ylang-ylang
- HE pêche
- HE jasmin
- HE mandarine
- HE amande amère

### Huiles aromatiques
- HA pivoine
- HA brise de mer
- HA canneberge
- HA concombre
- HA poire
- HA mangue-coco
- HA cigare
- HA O'masculin
- HA agrumes et romarin
- HA thé vert
- HA fraise
- HA cerise
- HA jasmin
- HA melon d'eau
- HA pomme verte
- HA vanille
- HA amande amère
- HE cèdre bleu
- Musc blanc

### Argiles & Poudres
- Argile jaune
- Argile blanche
- Argile rose
- Argile rouge
- Argile verte
- Argile Multani mutti
- Charbon activé végétal
- Pétales de rose en poudre
- Avoine moulue
- Avoine colloïdale
- Amande moulue
- Spiruline
- Matcha
- Curcuma
- Cannelle moulue
- Poudre écorce orange
- Poudre de guimauve
- Shikakaï en poudre
- Poudre ortie
- Poudre de bardane
- Poudre d'avoine
- Cacao en poudre
- Lait de chèvre en poudre

### Additifs
- Miel
- Sucre
- Sel
- Glycérine végétale
- Vitamine E
- Allantoine
- Acide citrique en poudre
- Bicarbonate de soude
- Sel d'Epsom
- Fécule de maïs
- SCI
- Hydrolat lavande
- Hydrolat de menthe poivrée
- Hydrolat romarin

### Colorants
- Colorant rouge
- Colorant pink
- Colorant vert kiwi
- Colorant sarcelle
- Sunset yellow
- Couleur lavande
- Mica rose-rouge
- Mica perlé blanc
- Mica vert

### Décorations
- Fleurs de lavande
- Pétales de roses
- Flocons d'avoine
- Romarin séché
- Fleurs confettis
- Rose entière

### Fragrances
- Fragrance poudre de bébé
- Fragrance lessive fraîche
- Gomme balloune (fragrance)
- Smoothie aux mûres (fragrance)
- Pois de senteur (fragrance)

---

## Ce qu'il ne faut PAS faire

- ❌ `huile de tournesol oléique` — minuscules
- ❌ `Huile de tournesol` — nom incomplet
- ❌ `Beurre karité` — nom incomplet
- ❌ `soude caustique` — sans la mention (NaOH)
- ❌ `17,5g` — virgule au lieu du point
- ❌ `17.5 g` — espace entre le chiffre et le g

---

## Si un ingrédient n'est pas dans la liste

Contacter Chantal avant d'écrire la recette pour qu'elle ajoute l'ingrédient au système.

---

## Collections disponibles

Le champ `collection` dans le fichier MD doit toujours être `SAPONICA` (valeur fixe gérée par le système).

La **ligne** correspond à la collection de la recette. Voici les collections disponibles avec leur rang :

| Rang | Collection |
|------|------------|
| 1 | SAPONICA |
| 2 | PETIT NUAGE |
| 3 | CAPRIN |
| 4 | ÉMOLIA |
| 5 | ÉPURE |
| 6 | KÉRYS |
| 7 | CASA |
| 8 | LUI |
| 9 | ANIMA |

Le nom de la collection doit être écrit **exactement** comme dans le tableau ci-dessus — majuscules, accents compris.

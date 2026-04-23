# BRIEF — Refonte Config_v2
_2026-04-23_

## Contexte
- Une conversation = un seul changement à la fois via **Trouve / Remplace**
- Jamais 2 changements dans le même message
- Pas de code sauf si demandé explicitement
- Tester après chaque commit, pas après chaque changement
- Jamais de contournements — on règle proprement

## Problème
`Config_v2` dans Google Sheets lie les densités et marges de perte aux catégories d'ingrédients par **nom texte** au lieu de `cat_id`. Ça cause des correspondances ratées entre `Config_v2` et `Categories_UC_v2`.

## Solution
Lier `Config_v2` par `cat_id` au lieu du nom texte.

## Fichiers impactés

### Google Sheets
- `Config_v2` — ajouter colonne `cat_id`

### code.gs
- `getConfig_v2` — retourner `cat_id`
- `saveConfig_v2` — sauvegarder/chercher par `cat_id`
- `addAchatLigne_v2` — utiliser `cat_id` au lieu du nom
- `finaliserAchat_v2` — utiliser `cat_id`
- `mettreAJourStock_v2` — utiliser `cat_id`
- `deleteAchat_v2` — utiliser `cat_id`
- `getStock_v2` — utiliser `cat_id` (retirer contournement `catNomMap`)
- `recalculerPrixParG_v2` — utiliser `cat_id`

### admin.js
- `sauvegarderDensite` — envoyer `cat_id`
- `modifierDensite` — charger par `cat_id`
- `chargerDensites` — afficher nom UC via `cat_id`

### index.html
- Section Densités — remplacer champ texte libre par select des catégories UC

## État actuel
- Contournement temporaire dans `getStock_v2` avec `catNomMap`
- Total inventaire légèrement supérieur aux factures à cause de correspondances manquantes

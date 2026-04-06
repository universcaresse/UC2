# INSTRUCTIONS — EXTRACTION ET IMPORT DES RECETTES
**Pour :** Claude Organisateur / Claude Chercheur  
**Projet :** Univers Caresse  
**Date :** 14 mars 2026

---

## CONTEXTE

Je t'envoie avec ce fichier un export CSV ou copier-coller de la Sheet **Recettes** existante dans Google Sheets.

L'objectif est de produire un fichier JSON propre qui servira à importer toutes les recettes dans la Sheet via un script Apps Script existant.

---

## STRUCTURE DE LA SHEET RECETTES

Colonnes A à V dans cet ordre exact :

| Col | Nom | Notes |
|-----|-----|-------|
| A | recette_id | Identifiant unique — ex: R001 |
| B | nom | Nom du savon |
| C | description | Texte descriptif |
| D | couleur_hex | Ex: #5a8a3a |
| E | collection | Nom en MAJUSCULES — ex: SAPONICA |
| F | rang | Ordre d'affichage (chiffre) |
| G | ligne | Nom de la ligne de produits |
| H | format | Ex: 100g |
| I | nb_unites | Nombre d'unités par batch |
| J | instructions | Instructions de fabrication |
| K | notes | Notes internes |
| L | ingredient_type | Type d'ingrédient — ex: Huile, Argile |
| M | ingredient_nom | Nom de l'ingrédient |
| N | quantite_g | Quantité en grammes |
| O | cout_ingredient | Coût calculé |
| P | cure | Durée de cure en jours |
| Q | prix_vente | Prix de vente |
| R | image_url | URL photo principale (Cloudinary) |
| S | statut | "public" ou "test" |
| T | image_url_noel | URL photo secondaire |
| U | collections_secondaires | Collections séparées par virgule |
| V | desc_emballage | Description de l'emballage |

⚠️ **Important :** Une recette avec plusieurs ingrédients occupe PLUSIEURS LIGNES dans la Sheet — une ligne par ingrédient. Les colonnes A à K et P à V sont répétées identiques sur chaque ligne, seules les colonnes L, M, N, O changent.

---

## CE QUE JE TE DEMANDE

### Étape 1 — Analyser l'existant
Regarde le CSV/données que je t'envoie et identifie :
- Les `recette_id` déjà utilisés
- Les champs qui sont remplis vs manquants
- Les recettes qui existent déjà vs les nouvelles à ajouter

### Étape 2 — Compléter et ajouter
Pour les recettes existantes :
- Garde le même `recette_id` — ne change pas les ids existants
- Complète les champs manquants si tu as l'info

Pour les nouvelles recettes à ajouter :
- Assigne des `recette_id` qui commencent à **R200** minimum pour éviter tout conflit avec l'existant

### Étape 3 — Produire un JSON

Produis un fichier JSON avec cette structure pour chaque recette :

```json
[
  {
    "recette_id": "R001",
    "nom": "Nom du savon",
    "description": "Texte descriptif",
    "couleur_hex": "#5a8a3a",
    "collection": "SAPONICA",
    "ligne": "Nom de la ligne",
    "format": "100g",
    "nb_unites": 12,
    "instructions": "",
    "notes": "",
    "cure": 42,
    "prix_vente": 0,
    "image_url": "",
    "statut": "test",
    "image_url_noel": "",
    "collections_secondaires": [],
    "desc_emballage": "",
    "ingredients": [
      { "type": "Huile", "nom": "Tournesol", "quantite_g": 500 },
      { "type": "Huile", "nom": "Coco", "quantite_g": 200 }
    ]
  }
]
```

---

## CE QU'ON FERA AVEC LE JSON

Le Claude Travailleur écrira un script d'import qui appelle la fonction `saveRecette()` déjà existante dans Apps Script pour chaque recette du JSON. Aucun code nouveau à écrire côté Apps Script.

---

## RÈGLES IMPORTANTES

- Ne jamais réutiliser un `recette_id` existant pour une nouvelle recette
- Le champ `statut` doit être `"test"` par défaut pour toute nouvelle recette — Chantal les passera en `"public"` manuellement
- Le champ `collection` doit être en **MAJUSCULES**
- Les `collections_secondaires` sont un tableau de strings — ex: `["CAPRIN", "ÉPURE"]`
- Si un champ est inconnu, laisser la valeur vide `""` ou `0` — ne pas inventer

---

*Univers Caresse — Confidentiel — 14 mars 2026*

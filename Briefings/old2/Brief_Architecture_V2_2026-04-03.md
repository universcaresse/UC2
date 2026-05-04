# BRIEF — ARCHITECTURE V2
## Univers Caresse
### v1 — 3 avril 2026

> Ce brief documente la décision de refaire le site from scratch avec des fondations propres.
> Le site actuel reste en production pendant la construction du v2.

---

## POURQUOI RECOMMENCER

### Problèmes identifiés v1
1. **Données dénormalisées** — noms de collection, ligne, ingrédients copiés partout. Renommer = propager dans 5+ endroits. Fragile, bug-prone.
2. **CSS mal structuré** — styles dupliqués, admin et public ne partagent pas les mêmes classes, `font-size` codés dur partout, pas de design system cohérent.
3. **code.gs en patches** — fonctions ajoutées les unes par-dessus les autres, pas de structure claire.
4. **Sheets non normalisées** — pas d'IDs stables, relations par texte au lieu de clés.
5. **Admin et public séparés** — deux mondes CSS qui dérivent l'un de l'autre.

### Ce qu'on garde
- **Toutes les données** — recettes, collections, INCI, médiathèque — importées par section
- **La logique business** — tout ce qui a été pensé, décidé, documenté
- **Les fonctionnalités** — ce qui fonctionne bien, on le reporte

---

## ARCHITECTURE DONNÉES — V2

### Principe fondamental
**IDs stables partout** — jamais de relation par texte. Renommer = changer à 1 seul endroit.

### Sheets et relations

#### `Collections`
| Colonne | Type | Description |
|---|---|---|
| collection_id | String | ID stable — ex: COL-001 |
| nom | String | Nom affiché |
| rang | Integer | Ordre d'affichage |
| slogan | String | |
| description | String | |
| couleur_hex | String | |
| photo_url | String | |
| photo_url_noel | String | |

#### `Lignes`
| Colonne | Type | Description |
|---|---|---|
| ligne_id | String | ID stable — ex: LIG-001 |
| collection_id | String | → Collections.collection_id |
| nom | String | Nom affiché |
| description | String | |

#### `Recettes`
| Colonne | Type | Description |
|---|---|---|
| recette_id | String | ID stable |
| nom | String | |
| collection_id | String | → Collections.collection_id |
| ligne_id | String | → Lignes.ligne_id |
| statut | String | test / public / archive |
| nb_unites | Integer | |
| cure | Integer | Jours |
| surgras | String | |
| instructions | String | |
| notes | String | |
| image_url | String | |
| image_url_noel | String | |
| desc_emballage | String | |

#### `Recettes_Ingredients`
Sheet séparée — une ligne par ingrédient par recette
| Colonne | Type | Description |
|---|---|---|
| recette_id | String | → Recettes.recette_id |
| ingredient_id | String | → Ingredients.ingredient_id |
| quantite_g | Decimal | |

#### `Recettes_Formats`
| Colonne | Type | Description |
|---|---|---|
| format_id | String | ID stable |
| recette_id | String | → Recettes.recette_id |
| poids | Decimal | |
| unite | String | |
| prix_vente | Decimal | |
| desc_emballage | String | |

#### `Ingredients`
| Colonne | Type | Description |
|---|---|---|
| ingredient_id | String | ID stable |
| nom_uc | String | Nom Univers Caresse |
| categorie_id | String | → Categories.categorie_id |
| inci | String | Code INCI |
| nom_botanique | String | |
| note_olfactive | String | |
| statut | String | ✅ Validé / 🔴 À compléter |

#### `Categories`
| Colonne | Type | Description |
|---|---|---|
| categorie_id | String | ID stable |
| nom | String | |

#### `Fournisseurs`
| Colonne | Type | Description |
|---|---|---|
| fournisseur_id | String | ID stable |
| nom | String | |
| code | String | PA, MH, Arbressence, DE, Amazon |

#### `Ingredients_Fournisseurs`
Mapping nom fournisseur → ingredient_id
| Colonne | Type | Description |
|---|---|---|
| fournisseur_id | String | |
| nom_facture | String | Tel qu'écrit sur la facture |
| ingredient_id | String | → Ingredients.ingredient_id |

#### `Factures`
| Colonne | Type | Description |
|---|---|---|
| facture_id | String | |
| fournisseur_id | String | |
| date | Date | |
| sous_total | Decimal | |
| tps | Decimal | |
| tvq | Decimal | |
| livraison | Decimal | |
| total | Decimal | |
| facteur_taxes | Decimal | |
| statut | String | En cours / Finalisée |

#### `Achats`
| Colonne | Type | Description |
|---|---|---|
| achat_id | String | |
| facture_id | String | → Factures.facture_id |
| ingredient_id | String | → Ingredients.ingredient_id |
| format_qte | Decimal | |
| format_unite | String | |
| prix_unitaire | Decimal | |
| prix_par_g | Decimal | |
| prix_par_g_reel | Decimal | |
| quantite | Decimal | |

#### `Inventaire_Ingredients`
| Colonne | Type | Description |
|---|---|---|
| ingredient_id | String | → Ingredients.ingredient_id |
| stock_g | Decimal | Grammes en stock |
| prix_par_g | Decimal | Dernier prix connu |
| date_maj | Date | |

#### `Productions`
| Colonne | Type | Description |
|---|---|---|
| lot_id | String | LOT-TIMESTAMP |
| recette_id | String | → Recettes.recette_id |
| multiplicateur | Integer | |
| nb_unites | Integer | |
| date_fabrication | Date | |
| date_disponibilite | Date | |
| cout_ingredients | Decimal | |
| cout_emballages | Decimal | |
| cout_revient_total | Decimal | |
| cout_par_unite | Decimal | |

#### `Contenants`
| Colonne | Type | Description |
|---|---|---|
| contenant_id | String | |
| nom | String | |
| categorie | String | Emballage / Contenant / Étiquette / Ruban |
| unite | String | |
| stock_actuel | Integer | |
| cout_unitaire | Decimal | |
| fournisseur_id | String | |
| seuil_alerte | Integer | |

#### `Mediatheque`
| Colonne | Type | Description |
|---|---|---|
| photo_id | String | |
| url | String | |
| nom | String | |
| categorie | String | |
| date_ajout | Date | |

#### `Contenu`
| Colonne | Type | Description |
|---|---|---|
| cle | String | Identifiant unique |
| valeur | String | Texte ou URL |

---

## ARCHITECTURE CSS — V2

### Principe
**Un seul fichier CSS** — admin et public partagent les mêmes fondations. Sections spécifiques clairement séparées par commentaires.

### Design system
- Variables CSS propres et complètes dans `:root`
- Typographie — échelle définie, jamais de `font-size` codé dur
- Couleurs — toutes dans `:root`, jamais inline
- Composants — `.btn`, `.form-*`, `.carte-*`, `.modal-*` — un seul système
- Layout — grid et flex, pas de hack

### Structure fichier
```
/* === VARIABLES === */
/* === RESET === */
/* === TYPOGRAPHIE === */
/* === LAYOUT === */
/* === COMPOSANTS PARTAGÉS === */
/* === SITE PUBLIC === */
/* === ADMIN === */
/* === RESPONSIVE === */
```

---

## ARCHITECTURE code.gs — V2

### Principe
- Une fonction par action — pas de fonctions tentaculaires
- Toutes les fonctions de lecture retournent des objets propres avec IDs
- `doGet` et `doPost` — routing clair, une ligne par action
- Pas de logique métier dans `doGet`/`doPost` — juste le routing
- Gestion d'erreurs uniforme

### Structure
```
// CONFIG
// UTILITAIRES
// COLLECTIONS
// LIGNES
// RECETTES
// INGREDIENTS
// FACTURES / ACHATS
// INVENTAIRE
// PRODUCTIONS
// CATALOGUE PUBLIC
// CONTENU
// MÉDIATHÈQUE
// SAUVEGARDE
// doGet
// doPost
```

---

## ARCHITECTURE JS — V2

### Principe
- `main.js` — site public uniquement
- `admin.js` — admin uniquement
- Variables globales clairement déclarées en haut
- Fonctions regroupées par section avec commentaires clairs
- Pas de HTML inline dans le JS — templates ou fonctions de rendu séparées

---

## MIGRATION DES DONNÉES

### Ordre de migration
1. `Categories` — créer les IDs
2. `Ingredients` — migrer depuis `Ingredients_INCI`, assigner `categorie_id`
3. `Collections` — créer les IDs
4. `Lignes` — extraire depuis `Collections`, créer les IDs, assigner `collection_id`
5. `Recettes` — migrer, remplacer textes par IDs
6. `Recettes_Ingredients` — extraire depuis `Recettes` actuelle
7. `Recettes_Formats` — migrer tel quel
8. `Ingredients_Fournisseurs` — migrer depuis `Mapping_Fournisseurs`
9. `Factures` + `Achats` — migrer tel quel
10. `Mediatheque` — migrer tel quel

### Règle
- Les sheets v1 restent intactes jusqu'à validation complète
- Migration = nouvelles sheets avec suffixe `_v2`
- Validation = vérifier que toutes les données sont présentes avant de basculer

---

## PLAN DE CONSTRUCTION

### Phase 1 — Fondations (1 session)
- Sheets v2 créées et vides
- code.gs v2 — structure de base, doGet/doPost vides
- CSS v2 — variables et composants de base
- HTML admin v2 — structure sidebar + sections vides
- HTML public v2 — structure de base

### Phase 2 — Migration données (1 session)
- Scripts de migration pour chaque sheet
- Validation des données migrées

### Phase 3 — Fonctionnalités core (2-3 sessions)
- Collections + Lignes + Recettes
- Catalogue public
- INCI

### Phase 4 — Fonctionnalités achats/production (2 sessions)
- Factures + Achats
- Fabrication + Inventaire

### Phase 5 — Finition (1 session)
- Médiathèque
- Contenu site
- Tests complets
- Bascule vers v2

---

## DÉCISIONS À PRENDRE AVANT DE COMMENCER

- [ ] Nommage des IDs — format exact (COL-001 vs UUID vs autre)
- [ ] Hébergement — même GitHub Pages ou nouveau repo ?
- [ ] Transition — redirections ? Même URL ?
- [ ] CSS — framework (Tailwind, autre) ou custom ?
- [ ] Timing — quand Chantal peut-elle se passer du site pour la bascule ?

---

*Univers Caresse — Confidentiel — Brief Architecture V2 — 3 avril 2026*

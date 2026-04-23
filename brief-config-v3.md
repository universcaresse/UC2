# BRIEF — Refonte Config_v2
_Mis à jour : 2026-04-23 — Analyse complète de tous les fichiers_

## Règles de travail
- Un changement à la fois via **Trouve / Remplace**
- Jamais 2 changements dans le même message
- Tester après chaque commit
- Jamais de contournements — on règle proprement
- Demander les fichiers **un à la fois** au besoin

---

## Problème central
`Config_v2` dans Google Sheets lie les densités et marges de perte aux catégories d'ingrédients par **nom texte** (colonne A = `type`) au lieu de `cat_id`.

Partout dans le code, Config est **indexé par nom texte** à la réception, mais **cherché par `cat_id`** à l'utilisation. Ça rate silencieusement à chaque fois — aucun message d'erreur.

---

## Structure actuelle de Config_v2 (Google Sheets)
| A (type) | B (densite) | C (unite) | D (marge_perte_pct) |
|---|---|---|---|
| Huiles essentielles | 0.9 | ml | 1 |
| Beurres | 0.92 | ml | 1 |
| ... | ... | ... | ... |

**Problème** : la colonne A contient des noms texte qui ne correspondent pas aux noms dans `Categories_UC_v2` (ex: Config dit "Huiles essentielles", Categories dit "HE" avec cat_id CAT-009).

## Structure de Categories_UC_v2 (Google Sheets)
| A (CAT-id) | B (nom) | C (date_ajout) |
|---|---|---|
| CAT-001 | Argiles | 2026-04-04 |
| CAT-009 | HE | 2026-04-04 |
| CAT-014 | Emballages | 2026-04-19 |
| ... | ... | ... |

---

## Solution
Ajouter une colonne `cat_id` dans Config_v2 et lier par `cat_id` au lieu du nom texte.

---

## Plan d'attaque dans l'ordre

### Étape 1 — Google Sheets
- Ajouter colonne `cat_id` dans Config_v2 (nouvelle colonne A ou E)
- Remplir manuellement le `cat_id` correspondant pour chaque ligne

### Étape 2 — code.gs : getConfig_v2
**Avant**
```js
items.push({
  type:            data[i][0],
  densite:         parseFloat(data[i][1]) || 1,
  unite:           data[i][2] || 'g',
  marge_perte_pct: parseFloat(data[i][3]) || 0
});
```
**Après** — retourner `cat_id` au lieu de `type` (ajuster les index selon position de la nouvelle colonne)

### Étape 3 — code.gs : saveConfig_v2
Chercher par `cat_id` au lieu de `data.type`

### Étape 4 — code.gs : addAchatLigne_v2
Cherche Config par `cat_id_ing` — **déjà correct dans l'intention**, mais Config est indexé par nom. Corrigé automatiquement après étape 2.

### Étape 5 — code.gs : finaliserAchat_v2
Même correction — `margePctMap` sera correct après étape 2.

### Étape 6 — code.gs : mettreAJourStock_v2
Même pattern — densité lue par `cat_id3`.

### Étape 7 — code.gs : deleteAchat_v2
Même pattern — densité lue par `cat_id4`.

### Étape 8 — code.gs : getStock_v2
Retirer le contournement `catNomMap`. Actuellement :
```js
const nomCat = catNomMap[cat_id] || '';
const margePct = margePctMap[nomCat] || 0;  // ← cherche par NOM
```
Remplacer par lookup direct par `cat_id`.

### Étape 9 — code.gs : recalculerPrixParG_v2
Deux moitiés incohérentes — la 1re cherche par `cat_id` (correct après étape 2), la 2e utilise encore `catNomMap` (à corriger).

### Étape 10 — admin.js, achats.js, entrer-facture.js
Ces trois fichiers font tous :
```js
listesDropdown.config[c.type] = { densite, unite, margePertePct }
```
Remplacer par :
```js
listesDropdown.config[c.cat_id] = { densite, unite, margePertePct }
```
Les fonctions `achatsCalculerGrammes`, `efCalculerGrammes` cherchent déjà par `cat_id` — elles fonctionneront correctement après cette correction.

### Étape 11 — admin.js : chargerDensites / modifierDensite / sauvegarderDensite
Afficher le nom UC via `cat_id` au lieu du nom texte brut.

### Étape 12 — HTML admin (index.html admin) : section Densités
Remplacer le champ texte libre `fd-type` par un `<select>` peuplé des catégories UC.

---

## Fichiers impactés — inventaire complet

### Google Sheets
- `Config_v2` — ajouter colonne `cat_id`, remplir manuellement

### code.gs
| Fonction | Ce qui change |
|---|---|
| `getConfig_v2` | Retourner `cat_id` au lieu de `type` |
| `saveConfig_v2` | Chercher/créer par `cat_id` |
| `addAchatLigne_v2` | Fonctionne déjà par `cat_id` — corrigé auto à étape 2 |
| `finaliserAchat_v2` | Idem |
| `mettreAJourStock_v2` | Idem |
| `deleteAchat_v2` | Idem |
| `getStock_v2` | Retirer contournement `catNomMap` |
| `recalculerPrixParG_v2` | Corriger la 2e moitié qui utilise encore `catNomMap` |

### admin.js
| Endroit | Ce qui change |
|---|---|
| `chargerDonneesInitiales` | Indexer config par `c.cat_id` |
| `chargerDensites` | Afficher nom UC via `cat_id` |
| `modifierDensite` | Charger par `cat_id` |
| `sauvegarderDensite` | Envoyer `cat_id` |
| `ouvrirFicheProduit` | Cherche `config[cat_id]` — fonctionnera après indexation |
| `calculerCoutRevient` | Idem |

### achats.js
| Endroit | Ce qui change |
|---|---|
| `achatsInit` | Indexer config par `c.cat_id` |
| `achatsCalculerGrammes` | Cherche déjà par `cat_id` — fonctionnera après indexation |
| `achatsCalculerPrixParG` | Idem |

### entrer-facture.js
| Endroit | Ce qui change |
|---|---|
| `efInit` | Indexer config par `c.cat_id` |
| `efCalculerGrammes` | Cherche déjà par `cat_id` — fonctionnera après indexation |
| `efCalculerPrixParG` | Idem |

### HTML admin
| Endroit | Ce qui change |
|---|---|
| Section Densités — champ `fd-type` | Remplacer input texte par select catégories UC |

### Fichiers NON impactés
- `main.js` ✅
- `catalogue-builder.js` ✅
- `parsers.js` ✅
- `index.html` (site public) ✅

---

## État actuel des bugs silencieux
- Densités ignorées dans : `addAchatLigne_v2`, `mettreAJourStock_v2`, `deleteAchat_v2`, `recalculerPrixParG_v2` (1re moitié)
- Marges de perte ignorées dans : `finaliserAchat_v2`, `recalculerPrixParG_v2` (1re moitié), `ouvrirFicheProduit`, `calculerCoutRevient`, `achatsCalculerGrammes`, `efCalculerGrammes`
- Seul `getStock_v2` lit les marges partiellement grâce au contournement `catNomMap`
- Résultat : total inventaire légèrement supérieur aux factures, coûts de revient inexacts

---

## Comment démarrer la prochaine conversation
Coller ce brief + demander les fichiers **un à la fois** dans cet ordre :
1. `code.gs` (pour étapes 2 à 9)
2. `admin.js` (pour étapes 10 à 11)
3. `achats.js` (pour étape 10)
4. `entrer-facture.js` (pour étape 10)
5. HTML admin (pour étape 12)

Ne pas envoyer tous les fichiers d'un coup — la fenêtre de contexte se remplit trop vite.

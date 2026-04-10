# BRIEF — CLAUDE TRAVAILLEUR
## Chantier 1 : Scraping PureArome via API
*Rédigé par Claude Chercheur — 18 mars 2026*

---

## OBJECTIF
Récupérer les 742 produits de PureArome via leur API interne et les écrire dans l'onglet `Purearome_Test` du Google Sheet existant.

---

## API CONFIRMÉE
- **URL :** `https://api2.panierdachat.app/api/public/products`
- **Méthode :** GET
- **Paramètres :** `categoryId=14320&offset=0&limit=100&order[title]=asc`
- **Auth :** Bearer token (dans le header `Authorization`)
- **Token :** `eyJ0eXAiOiJKV1QiLC...` *(token complet — voir ci-dessous)*
- **Expiration token :** 2027-03-18

### Token complet
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NzM4MzYzMjcsImV4cCI6MTgwNTM3MjMyNywicm9sZXMiOlsiSVNfQVVUSEVOVElDQVRFRF9BTk9OWU1PVVNMWSJdLCJ1c2VybmFtZSI6ImE3MmRmN2RkLTc5MDItNDFlOC04ZmY4LTQ2MGUyYzk0ZDEzMCIsImlwIjoiMTU5LjIwMy4zNS40OSIsImlkZW50aXR5IjoiYTcyZGY3ZGQtNzkwMi00MWU4LThmZjgtNDYwZTJjOTRkMTMwIiwiY3VzdG9tZXJfc2Vzc2lvbl90b2tlbiI6ImYwMDg4ZjIxLTlhZGMtNDA0MS1hMGU3LTBkOTkzYTc5YjljZSIsInNob3BfaWQiOjEwNzV9.LxTFw_Hn0T4JvXCy23eKiU3T6Q8cuJebiSzySNrZzzCzXs4FxDqv5Yk91bpsRag8y-lDf_9lPop7W1NaJTPSEz8PIAQD-z8CUBGygaYW2MKCP4ijR0bM9loQZPnJROykpgCbg2b_jWpTZfqyiFrPQsLtWbPP42Z6twWMgVllbQY4r_MEPEUJ6CIL2hyYDe5cq_cpG8hLSEb7jg_7VBa1it-b7yTH4DmpwcO7kPoDH7rAg3QbvW4kWuFj79q1HhmV5f-S8AyWx-O4U97SnZTz17OorJ_iCxmtqdhfOEAsP1nG8kox3_DyVv2Tz61a7TWVuUvyyzpNxvFpG6lKUUU2wmirtzQRC5wjbydg4kL_DM64Q1AGyu4MD9QWVTLwAv08P3UYbV8mhnJ0hRjfTqNw04zjh8lIDYW4aR0lSADhba1FkjvhXraMDN4cKXzWOazRzJuA8mZsy_lj0nWX3p6Pxf1U5bc2u_7bHyYpk-qSwPRuHAnq67VeWF2kAmYZ4jdIg0pDHwG-Ggd30iy3o60buKljpwTvMtMBKdwRx0kSGa-YHnjMnSJyPgnAAQ_d_zrP_Y-AmpD3j2kRUTEg75ELFgahjq69SZXgqx7nFM2SuqyV-0gCB5ONQ0t2lm-fNQeIpnt61x4ZJ-4g5ycUd5N7-WAUrQJmHhRCI6Qof1qF1RU
```

---

## PAGINATION
- 742 produits au total
- Récupérer par batch de 100 : offset 0, 100, 200... jusqu'à 700

---

## CHAMPS À EXTRAIRE
| Champ JSON | Colonne Sheet |
|------------|---------------|
| `title` | Nom |
| `regular_range_price.amount_min` | Prix min |
| `regular_range_price.amount_max` | Prix max |
| `slug` | Slug |
| `image.cdn_url` | Image URL |
| `no_stock` | Hors stock |
| `cas_number` | Numéro CAS |

---

## CATÉGORIES DISPONIBLES
| Catégorie | ID |
|-----------|-----|
| Argiles | 14329 |
| Bases neutres | 14332 |
| Cires | 14335 |
| Colorants et Pigments | 14337 |
| Herbes et Fleurs | 14340 |
| Huiles aromatiques naturelle | 14341 |
| Huiles essentielles | 14342 |
| Huiles et Beurres | 14343 |
| Hydrolats | 14344 |
| Ingrédients Liquides | 14345 |
| Ingrédients Secs | 14346 |
| Fragrances | 14347 |
| Saveurs naturelles | 14348 |

---

## POINTS D'ATTENTION
- Le token est anonyme mais lié à une session — à surveiller si ça expire avant 2027
- Apps Script doit passer le header `Authorization: Bearer ...`
- Respecter un délai entre les appels (`Utilities.sleep`) pour éviter le rate limiting
- Le champ `cas_number` n'est peut-être pas dans la réponse API de base — vérifier si un appel séparé par produit est nécessaire pour l'obtenir

---

## PROCHAINE ÉTAPE
Coder la fonction `scrapePurearome()` dans Apps Script avec :
1. Boucle de pagination (offset 0 → 700, par 100)
2. Header Bearer
3. Extraction des champs ci-dessus
4. Écriture dans `Purearome_Test`

---

*Univers Caresse — Confidentiel — Mars 2026*

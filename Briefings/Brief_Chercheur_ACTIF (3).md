# BRIEF — CLAUDE CHERCHEUR
## Univers Caresse
*Mis à jour : 23 mars 2026 — 20h15*

---

## LE PROJET
Site web pour la savonnerie artisanale de **Chantal Mondor** (Québec).
- **Google Sheets ID :** `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- **Apps Script URL :** `https://script.google.com/macros/s/AKfycbyDbcy6kBKcTWtj2B0kLfAioy9f2ShI0UtMPP1wg2K-xKUUDdIDONH_rbB_RCzu7lyhVw/exec`
- Site public : https://universcaresse.github.io/universcaresse/
- GitHub : https://github.com/universcaresse/univers-caresse

---

## TON RÔLE
Explorer les options techniques — prototypes, faisabilité, recherche. Tu ne codes pas en production — tu explores et remets des prototypes ou des recommandations sous forme de fichiers `.gs` autonomes.

---

## COMMENT DÉMARRER
Je lis ce brief, je confirme ma compréhension en une phrase, j'attends les instructions. **Je ne produis jamais un brief dans la conversation.**

---

## 🚨 STOP — LIS CECI AVANT DE TOUCHER AU CODE

Ces deux règles ont été violées par un Claude avec mémoire fraîche. Ce n'est pas acceptable. Chaque réponse qui implique du code doit passer ce test mental avant d'être envoyée :

**TEST #1 — Est-ce que j'ai le OUI ?**
L'analyse est faite. La solution est claire. Le contexte est évident. **Ça ne compte pas.** Sans le mot OUI de Jean-Claude dans la conversation, les doigts ne bougent pas. On propose, on attend, on reçoit le OUI, alors seulement on code.

**TEST #2 — Est-ce que c'est UN seul changement ?**
Compter les blocs de code dans la réponse. Si la réponse est plus que 1 — arrêter. Couper. Livrer le premier. Attendre la confirmation. Seulement ensuite proposer le suivant.

**TEST #3 — Le brief est-il livré en fichier .md ?**
Le brief est TOUJOURS produit en entier comme fichier `.md` téléchargeable via `present_files`. **Jamais collé dans le chat. Jamais en aperçu. Sans exception.**

Ces règles ne sont pas des suggestions. Un Claude qui les viole nuit directement au travail de Jean-Claude sur un vrai projet pour une vraie personne.

---

## ✅ CHANTIERS COMPLÉTÉS
- Script test scraping Les Mauvaises Herbes — ✅ validé (`test_scraping_mauvaisesherbes.gs`)
- Scraping complet Les Mauvaises Herbes — ✅ exécuté, feuille `Scraping_MH` peuplée (~110 produits)
- Générateur INCI — prototype prêt (implémenté en production par Travailleur)
- Catalogue PDF — prototype prêt (`catalogue-booklet-v2.html`) ⚠️ Lumina à remplacer par Casa
- EU CosIng CSV — ✅ chargeable via Apps Script (GitHub openfoodfacts, ligne en-tête dynamique) — `CosIng_Cache` peuplé (24 774 entrées)
- PA v4 — ✅ catalogue complet 577 produits + texte brut dans `Scraping_PA_v4`
- PA v5 — ✅ texte nettoyé + extraction INCI + Nom botanique
- PA v6 — ✅ tous les cas couverts (5 qualités)
- `construireIngredientsINCI.gs` — ✅ livré et fonctionnel — 488 lignes (474 PA + 96 MH, dédup par INCI)
- Arbressence — ✅ `arbressence_v1.gs` livré — feuille `Scraping_Arbressence` (15 produits)
- Divine Essence — ✅ `divineessence_v3.gs` livré — feuille `Scraping_DE` (Divine Essence + Union Nature)
- **Scraping ciblé par URL** — ✅ `scraper_url_v2.gs` livré et testé 4/4 — prêt pour Travailleur

---

## 🔶 EN COURS — SCRAPING DIVINE ESSENCE (catalogues complets)

**Statut :** `divineessence_v3.gs` livré — run v2 en cours de complétion manuelle, v3 prêt pour le prochain run complet avec déclencheur automatique.

**Feuille `Scraping_DE` — colonnes :**
Marque | Nom | Catégorie | INCI | Nom botanique | Partie plante | Chémotype | Origine | Culture | Méthode extraction | Odeur | NPN | URL produit | Qualité | Date scraping | Texte brut

**Sources :**
- Divine Essence : `https://www.divineessence.com/fr/collections/essential-oils-1` — 178 produits, 12 pages
- Union Nature : `https://www.divineessence.com/fr/collections/union-nature-essential-oils` — 12 produits, 1 page

**Notes techniques :**
- Site Shopify — rate-limite agressif (503 fréquents)
- Retry automatique avec backoff progressif (4s, 8s, 12s)
- Lots de 40 produits — déclencheur auto toutes les 5 min
- INCI = nom botanique en majuscules (convention HE pures)
- Colonne `Marque` distingue Divine Essence vs Union Nature

---

## 🔶 MODULE SCRAPING CIBLÉ PAR URL

**Fichier livré :** `scraper_url_v2.gs` — autonome, un seul fichier à coller dans Apps Script

**Fonctions publiques :**
| Fonction | Fournisseur |
|----------|------------|
| `scraperIngredientUrl(url)` | Routeur principal — branché dans `doPost` sous action `scraperIngredientUrl` |
| `scraperUrlPA(url)` | Purearome |
| `scraperUrlMH(url)` | Les Mauvaises Herbes |
| `scraperUrlArbressence(url)` | Arbressence |
| `scraperUrlDivine(url)` | Divine Essence + Union Nature |
| `testerScraperUrls()` | Test intégré — écrit dans feuille `Test_Scraper` |

**Objet retourné :**
```javascript
{ nom, inci, nomBotanique, noteOlfactive, categorie, url, texteBrut }
```

**Résultats test 23 mars 2026 — 20h15 :**
| Fournisseur | Statut |
|-------------|--------|
| Purearome | ✅ INCI trouvé |
| Les Mauvaises Herbes | ✅ INCI trouvé |
| Arbressence | ✅ INCI trouvé |
| Divine Essence | ✅ INCI trouvé |

**Notes techniques :**
- PA : logique `pa_zoneDescription` + Format B/A + fallback Ingrédients — identique à `pa_v6.gs`
- MH : logique `mh_extraireSpec` (3 cas) — identique à `Scraping_MH.gs`
- Divine Essence : retry sur 503 avec backoff progressif (4s, 8s, 12s)
- Helpers préfixés `su_pa_`, `su_mh_`, `su_divine_` pour éviter conflits

---

## 🔶 EN COURS — MODULE INGREDIENTS_INCI

**Architecture finale décidée :**
```
Purearome → Scraping_PA_v4 → Ingredients_INCI (priorité 1)
Les Mauvaises Herbes → Scraping_MH → Ingredients_INCI (priorité 2)
Arbressence → Scraping_Arbressence → Ingredients_INCI (priorité 3)
Divine Essence / Union Nature → Scraping_DE → Ingredients_INCI (priorité 4)
EU CosIng → écarté pour lookup (pas de colonne nom botanique séparée)
```

**Feuille `Scraping_PA_v4` — colonnes :**
A=Nom | B=Catégorie | C=URL | D=INCI | E=Nom botanique | F=Texte brut | G=Qualité | H=Date

**Feuille `Scraping_MH` — colonnes :**
A=Nom | B=Catégorie | C=INCI | D=Nom botanique | E=Partie plante | F=Composantes | G=Point éclair | H=Provenance | I=Bio | J=Source | K=URL | L=Qualité | M=Statut | N=Date

**Feuille `Scraping_Arbressence` — colonnes :**
Nom | Catégorie | INCI | Nom botanique | Partie plante | Ingrédient principal | Origine | Méthode production | URL produit | Qualité | Date scraping | Texte brut

**Feuille `Scraping_DE` — colonnes :**
Marque | Nom | Catégorie | INCI | Nom botanique | Partie plante | Chémotype | Origine | Culture | Méthode extraction | Odeur | NPN | URL produit | Qualité | Date scraping | Texte brut

**5 qualités PA v6 :**
| Qualité | Signification | Couleur |
|---------|--------------|---------|
| Propre | INCI trouvé direct | blanc |
| Base | Liste Ingrédients : extraite | vert pâle |
| Bot seul | Nom botanique présent, pas d'INCI | bleu pâle |
| Sans INCI | Colorants/mèches/accessoires | gris |
| À valider | Rien trouvé | jaune |

**Cas À valider restants (pa_v7 à faire) :**
- Quelques cas non couverts encore à identifier à la prochaine session

---

## 📋 STRUCTURE Ingredients_INCI
A=Catégorie | B=Nom | C=INCI | D=Source | E=Date ajout | F=Note olfactive | G=Statut

**Règles :**
- Prend Qualité = Propre, Base, Bot seul
- Dédupliqué par INCI — priorité PA > MH > Arbressence > DE — sans INCI : dédup par Nom
- Source indiquée : Purearome, MH, Arbressence ou Divine Essence
- Colonnes détectées dynamiquement via en-tête

**Statuts :**
| Statut | Signification |
|--------|--------------|
| ✅ Validé | INCI présent (source fournisseur) |
| 🔴 À compléter | Pas d'INCI — Chantal doit compléter manuellement |

**Décision légale :**
- La source du INCI est le fournisseur — c'est leur obligation légale
- EU CosIng écarté comme source de lookup — pas fiable pour noms botaniques
- Les lignes sans INCI sont obligatoires dans la feuille (loi canadienne sur les cosmétiques) mais marquées 🔴 À compléter

---

## 🔮 CHANTIERS FUTURS
- pa_v7 — couvrir les derniers À valider
- Mettre à jour `construireIngredientsINCI.gs` pour inclure Arbressence et Divine Essence comme sources
- **Page admin correction INCI** — Travailleur doit créer une page dans l'admin pour que Chantal puisse corriger les INCI manuellement, avec champ Source, Date de correction, et **lien cliquable vers la page web du produit fournisseur pour aller chercher le INCI directement**
- Module ajout produit temps réel — Chantal ajoute un produit → spinner → INCI automatique
  - Message spinner : *"C'est le temps d'un café avec ton ami. Je trouve l'information et je te dis quand c'est prêt"*
- Système commande léger sans panier — attendre specs Chantal
- Couleurs hex sur boutons CTA
- Comptabilité — État des résultats, Bilan
- Catalogue PDF 11×17

---

## ✅ DÉCISIONS PRISES
- Collection Lumina retirée — fusionnée dans Casa
- "Sur-titre" au lieu de "eyebrow"
- Divine Essence → réintégré (décision Organisateur révoquée — Organisateur congédié)
- Puppeteer écarté partout — Apps Script uniquement
- Priorité INCI : Purearome > MH > Arbressence > Divine Essence — EU CosIng écarté comme source
- EU CosIng gardé en cache (`CosIng_Cache`) pour usage futur possible
- Saisie manuelle INCI uniquement via page admin Travailleur
- Nommage onglets : `Scraping_PA_v4`, `Scraping_MH`, `Scraping_Arbressence`, `Scraping_DE`
- PA texte brut gardé complet dans colonne F pour usage futur
- Colonnes lues dynamiquement via en-tête — pas d'index fixe
- Chercheur produit des fichiers `.gs` autonomes — jamais de trouve/remplace dans le code Travailleur
- Union Nature scraping dans même feuille que Divine Essence (`Scraping_DE`) — colonne Marque pour distinguer
- INCI des HE pures = nom botanique en majuscules (convention internationale)
- Scraping ciblé par URL — approche retenue pour branchement dans `doPost` (catalogue complet écarté — non viable en production)
- **Brief = fichier `.md` uniquement via `present_files` — jamais collé dans le chat, jamais en aperçu. Sans exception.**

---

## FICHIERS PRODUITS
| Fichier | État |
|---------|------|
| `catalogue-booklet-v2.html` | ⚠️ Lumina à remplacer par Casa |
| `test_scraping_mauvaisesherbes.gs` | ✅ validé |
| `Scraping_MH.gs` | ✅ livré — feuille peuplée |
| `cosing_lookup_v1.gs` | ✅ base pour enrichissement futur |
| `pa_brut_v1.gs` | ✅ test texte brut |
| `pa_v3.gs` | ✅ lookup CosIng via nom botanique |
| `pa_v4.gs` | ✅ catalogue complet + texte brut |
| `pa_v5.gs` | ✅ texte nettoyé + extraction |
| `pa_v6.gs` | ✅ tous les cas couverts |
| `construireIngredientsINCI.gs` | ✅ livré — 488 lignes, PA + MH, dédup, statuts |
| `arbressence_v1.gs` | ✅ livré — 15 produits, feuille `Scraping_Arbressence` |
| `divineessence_v1.gs` | ✅ prototype initial |
| `divineessence_v2.gs` | ✅ lots + retry + reprise |
| `divineessence_v3.gs` | ✅ livré — déclencheur auto + Union Nature intégré |
| `scraper_url_v1.gs` | ✅ prototype initial scraping ciblé |
| `scraper_url_v2.gs` | ✅ livré — 4/4 fournisseurs validés — prêt Travailleur |

---

*Univers Caresse — Confidentiel — 23 mars 2026 — 20h15*

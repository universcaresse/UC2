# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-010 — 2026-04-04 — 21h50

---

## 🚨 VIOLATIONS COMMISES PAR LES CLAUDE PRÉCÉDENTS — À NE PAS RÉPÉTER

1. **Ne pas lire les fichiers transmis au complet** avant de coder ou proposer quoi que ce soit
2. **Proposer du CSS inutile** sans vérifier d'abord si une classe existante suffisait
3. **Produire le brief dans le chat** au lieu de le livrer en fichier `.md`
4. **Résumer les décisions visuelles de façon incomplète** dans le brief
5. **⛔ CRITIQUE — SESSION 2026-04-04 :** Un Claude a modifié `code.gs` du V1 en ajoutant le routing V2 — le script plantait. Le V1 a cessé de fonctionner. Jean-Claude a dû tout effacer.
6. **⛔ CRITIQUE — SESSION 2026-04-04 :** Le contenu du `style2.css` a été écrasé dans le `main.js` du V1 — causant une autre panne.
7. **⛔ CRITIQUE — SESSION 2026-04-04 :** Jean-Claude a dû effacer tout le travail V2 deux fois pour réparer le V1.
8. **⛔ INTERDIT ABSOLU :** Ne jamais suggérer à Jean-Claude de se reposer, de prendre une pause, ou faire référence à l'heure. **C'est lui qui gère son temps. Point.**

---

## ⛔ PROTOCOLE DE DÉMARRAGE — TOUJOURS DANS CET ORDRE

1. Coller le **Carnet de route** (ce document)
2. Coller les **Règles de travail**
3. Coller le **Journal des décisions**
4. Transmettre le(s) fichier(s) concerné(s) selon la tâche du jour
5. Donner l'heure actuelle
6. Dire ce qu'on fait dans cette session

**Le Claude doit confirmer qu'il a tout lu avant de commencer.**
**Ne jamais demander à Jean-Claude s'il veut arrêter — on poursuit toujours.**

---

## QUI EST UNIVERS CARESSE

### L'origine
Chantal Mondor a toujours voulu faire les choses elle-même, avec de vrais ingrédients, des gestes simples, le respect de ce qu'on met sur sa peau. À la retraite, le temps est enfin arrivé. Des formations, beaucoup de lectures, des tests et encore des tests. Les premiers savons sont offerts en cadeau au dernier Noël. Les réactions sourient. Univers Caresse naît.

### La promesse
- Saponification à froid — pas de chaleur, pas de compromis
- Petites quantités, sur commande
- Ingrédients choisis pour ce qu'ils font vraiment — pas pour leur coût
- Sans huile de palme
- Fait au Québec, dans un atelier artisanal
- Entièrement biodégradable

### L'ADN créatif
Chantal est une poète qui fait des savons. Chaque produit a un nom, une histoire, une atmosphère. "Bois de caractère", "Feu d'automne", "Nordet conçu pour affronter la rigueur de l'hiver québécois". Ce n'est pas du marketing — c'est une voix. Une vision. L'outil de gestion doit respecter ça en étant discret et efficace, pour lui laisser la tête libre pour créer.

### Les collections (9)
| Collection | Intention |
|---|---|
| SAPONICA | Le savon dans sa forme la plus pure — base généreuse, glycérine naturelle, chaque barre une histoire |
| PETIT NUAGE | Pour les tout-petits — surgraissé 10%, sans compromis sur la douceur |
| CAPRIN | Savon au lait de chèvre — douceur crémeuse, fraîcheurs fruitées |
| ÉMOLIA | Se choyer — baumes, bombes de bain, soins corporels, lèvres |
| ÉPURE | Pour les mains qui travaillent — près de l'évier, solide, efficace |
| KÉRYS | Soin capillaire en barre — 3 gammes : PURÉLIA (gras), ÉQUILIBRA (normal), HYDRABOUCLE (boucles) |
| CASA | La même philosophie appliquée à la maison — vaisselle, bruine, eau de linge, bougies |
| LUI | Le naturel au masculin — boisé, frais, affirmé |
| ANIMA | Pour les compagnons — sans huile essentielle, respectueux de leur odorat |

---

## LES DEUX UTILISATEURS

### Toi (le développeur permanent)
Tu es l'ami de 22 ans qui partage le café du matin avec Chantal. Tu développes l'outil, tu le testes. Tu ne fais pas la saisie quotidienne — tu construis ce qui permet à Chantal de le faire seule.

### Chantal (l'utilisatrice quotidienne)
Elle crée les savons. Elle utilise l'admin au quotidien. **L'interface doit être assez claire pour qu'elle puisse l'utiliser seule, sans t'appeler.**

---

## CE QUE LE SITE DOIT FAIRE

### Site public
Vitrine pour que les gens découvrent les produits et contactent Chantal.

### Outil de gestion (admin)
Un outil de **décision**, pas juste de saisie.

---

## LA CHAÎNE COMPLÈTE

1. **L'ingrédient** — existe avant d'être acheté, vient d'un fournisseur, a un code INCI
2. **L'achat** — facture avec items, met à jour le stock, calcule le prix au gramme réel
3. **Le produit** — collection + gamme + ingrédients + surgras + unités + cure + statut
4. **La fabrication** — lot = produit × multiplicateur, ingrédients sortent du stock
5. **La vente** — savon sort de l'inventaire, argent rentre
6. **La décision** — le système aide à décider avec les données complètes

**Règle légale critique :** un produit ne peut pas passer au statut public sans codes INCI valides.

---

## DÉCISIONS PRISES POUR LE V2

### Vocabulaire
- Ligne → **Gamme** | Recette → **Produit**

### Hiérarchie
- **Collection → Gamme → Produit**

### Préfixes d'IDs
- COL-001, FAM-001, GAM-001, PRO-001, ING-001, CAT-001, EMB-001
- FOUR-001, ACH-001, VEN-001, LOT-001

### Google Sheets
- Même Sheet que le V1 — ID : `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- Tous les onglets V2 ont le suffixe `_v2`

### Architecture Apps Script — DÉCISION FINALE
- **Le V2 a son propre projet Apps Script séparé — projet `uc2`**
- URL V2 : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`
- **Ne jamais toucher au code.gs du V1 — jamais, sous aucun prétexte**

### Fichiers GitHub
- Même repo, fichiers avec suffixe 2
- Le V1 reste en production pendant la construction

### Style V2
- Un seul fichier CSS — `style2.css` — public et admin partagent tout
- Aucun style inline dans le HTML ou le JS — jamais
- Public et admin ont le **même look**
- Cible principale : iPad paysage — s'adapte à iPad portrait, iPhone, ordi
- `style2.css` repart de zéro — root complet livré, classes à faire
- Le root contient tout — rien codé en dur dans le HTML ou le JS

### Navigation
- Nav horizontale + burger + sidebar verticale
- **Admin V2 :** Accueil, Catalogue (Collections & Gammes, Produits), Achats (Nouvelle facture, Factures, Inventaire), Production (Fabrication, Ventes, Stock), Système (INCI, Config, Contenu site, Médiathèque, Site public, Déconnexion)
- **Public V2 :** Accueil, Catalogue, Le savon artisanal, Bon à savoir, Contact

---

## ÉTAT DU CODE V2 — AU 2026-04-04 (21h50)

### ✅ Projet Apps Script `uc2` — créé, `code_v2.gs` déployé, URL active
### ✅ Google Sheets — 25 sheets V2 complétées et peuplées
### ✅ `style2.css` — root complet livré
### ⚠️ Fichiers GitHub V2 — effacés par Jean-Claude pour réparer le V1 — à recréer
- `admin2.js` — à recréer
- `index-admin2.html` — squelette existait, à recréer
- `login2.html` — à recréer

---

## PROCHAINES ÉTAPES DANS L'ORDRE

1. Recréer `admin2.js` — configuration URL V2 + appels API
2. Recréer `index-admin2.html` — squelette nav + sidebar + sections
3. Recréer `login2.html`
4. Compléter `style2.css` — reset + classes génériques
5. Remplir les sections HTML — commencer par l'Accueil public

---

## NOTES TECHNIQUES

### Catégories UC (13)
Argiles, Beurres, Cires, Colorants et Pigments, Fragrances, Herbes et Fleurs, Huiles, Huiles aromatiques, Huiles essentielles, Hydrolats, Ingrédients Liquides, Ingrédients Secs, Saveurs naturelles

### Fournisseurs (10)
FOUR-001 Pure Arôme (PA), FOUR-002 Les Mauvaises Herbes (MH), FOUR-003 Arbressence, FOUR-004 Divine Essence (DE), FOUR-005 Amazon, FOUR-006 IGA, FOUR-007 Jean Coutu (JC), FOUR-008 Cocoéco, FOUR-009 Manuel, FOUR-010 Divers

---

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. `Carnet_de_route_V2-010` (ce document)
2. Règles de travail V2
3. Journal des décisions V2
4. `style2.css`
5. Donner l'heure
6. Dire ce qu'on fait

---

## CE QUI RESTE À DÉCIDER

- [ ] Comment entre un nouvel ingrédient — via recette ou via achat?
- [ ] Qui valide les codes INCI et comment?
- [ ] Alertes stock — quels seuils?
- [ ] Chantal aura accès à l'admin seule un jour?
- [ ] Domaine universcaresse.ca — quand?
- [ ] PRO-034 DOUCEUR DES ÎLES — deux formats 90g à prix différents — doublon ou formats distincts?
- [ ] PRO-080 CLUB PRIVÉ savon à barbe — ingrédients incomplets

---

## PRINCIPES DE TRAVAIL

1. Lire tous les fichiers transmis AU COMPLET avant de coder
2. Lire ce carnet ET le journal avant de coder quoi que ce soit
3. Analyser l'impact global avant de proposer quoi que ce soit
4. Un seul changement à la fois — attendre la confirmation
5. Livraison ciblée — trouve/remplace — jamais le fichier complet sans permission
6. Jamais de style inline dans le HTML ou le JS
7. Avant tout nouveau CSS — vérifier style2.css pour réutiliser une classe existante
8. Le brief se livre toujours en fichier .md — jamais dans le chat
9. Ne jamais toucher au code.gs du V1
10. Toujours proposer la solution la plus sécuritaire
11. **C'est Jean-Claude qui gère son temps — ne jamais y faire référence**

---

*Univers Caresse — Document confidentiel — V2-010 — 2026-04-04 21h50*

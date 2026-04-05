# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-007 — 2026-04-04 — 17h25

---

## ⛔ PROTOCOLE DE DÉMARRAGE — TOUJOURS DANS CET ORDRE

Chaque conversation commence exactement comme ça — sans exception.

1. Coller le **Carnet de route** (ce document) — **c'est le premier fichier à transmettre**
2. Coller les **Règles de travail**
3. Coller le **Journal des décisions** — **obligatoire avant tout travail**
4. Transmettre le(s) fichier(s) concerné(s) selon la tâche du jour :
   - CSS → `style2.css`
   - HTML → `index2.html`
   - Logique serveur → `code.gs` et/ou `code_v2.gs`
   - Front-end admin → `admin2.js`
   - Sheets → capture ou export de la structure
5. Donner l'heure actuelle — **Claude ne gère pas les fuseaux horaires, l'heure vient toujours de toi**
6. Dire ce qu'on fait dans cette session

**Le Claude doit confirmer qu'il a tout lu avant de commencer.**
**Si le Claude propose quelque chose qui contredit une décision du journal — pointer le journal.**
**Si une nouvelle décision est prise — l'ajouter au journal avant de terminer la session.**
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
Tu es l'ami de 22 ans qui partage le café du matin avec Chantal. Tu développes l'outil, tu le testes. Tu es toujours là pour les améliorations, les nouveaux fournisseurs, les nouvelles fonctionnalités. Tu ne fais pas la saisie quotidienne — tu construis ce qui permet à Chantal de le faire seule.

### Chantal (l'utilisatrice quotidienne)
Elle crée les savons. Elle utilise l'admin au quotidien — enregistrer une vente, voir son stock, consulter ce qu'elle peut fabriquer. Elle a un inventaire, elle commence à vendre aux proches et amis des amis. Elle commence à paniquer car la gestion se complique. **L'interface doit être assez claire pour qu'elle puisse l'utiliser seule, sans t'appeler.**

---

## CE QUE LE SITE DOIT FAIRE

### Site public
Vitrine pour que les gens découvrent les produits et contactent Chantal. Catalogue, collections, informations, formulaire de contact.

### Outil de gestion (admin)
Un outil de **décision**, pas juste de saisie. Il doit pouvoir dire :
- "Il serait temps d'acheter tel ingrédient — tu viens d'utiliser les derniers"
- "Tu n'as pas assez de stock pour faire cette recette"
- "Ce savon utilise une huile dispendieuse avec une durée de vie de 6 mois — tu en as vendu 2 en un an. Est-ce qu'on garde cette recette?"
- "3 savons et une huile à barbe, ça fait 30$"

---

## LA CHAÎNE COMPLÈTE — DU POINT 0 AU POINT 1000

### 1. L'ingrédient
Un ingrédient existe avant d'être acheté — il vient du catalogue d'un fournisseur (Pure Arôme, Les Mauvaises Herbes, Arbressence, Divine Essence, Amazon). Il a un nom fournisseur et un nom UC (Univers Caresse). Il a un code INCI légal obligatoire pour tout produit public.

### 2. L'achat
Une facture entre dans le système. Elle contient des items. Chaque item = un ingrédient acheté, un format, un prix. L'achat met à jour le stock et calcule le prix au gramme réel (avec taxes, livraison).

### 3. La recette (Produit)
Un produit = une collection, une gamme, des ingrédients avec quantités, un surgraissage, un nombre d'unités, une cure. Elle a un statut : test, public, archive.

**Règle légale critique :** un produit ne peut pas passer au statut public tant que tous ses ingrédients n'ont pas un code INCI valide.

### 4. La fabrication
Un lot = un produit × un multiplicateur, à une date donnée. Les ingrédients sortent du stock. Les savons entrent dans l'inventaire produits. Le lot a une date de disponibilité (date fabrication + cure).

### 5. La vente
Un savon sort de l'inventaire. De l'argent rentre.

### 6. La décision
Avec les données complètes — achats, stock, fabrication, ventes — le système peut aider à décider.

---

## POURQUOI LE V1 N'EST PLUS VIABLE

- Relations par texte au lieu d'IDs stables — renommer = propager dans 5 endroits
- CSS par patches — accordéon écrit 3 fois différemment, font-size codés en dur partout
- Sheets mal normalisées — Collections mélange collections et lignes, Recettes répète toutes les infos pour chaque ingrédient (576 lignes pour ~75 recettes)
- Achats et inventaire vides — le module existe mais la structure est trop fragile
- Les ventes ne peuvent pas démarrer car le stock produits ne fonctionne pas

---

## DÉCISIONS PRISES POUR LE V2

### Vocabulaire
- Ligne → **Gamme** (partout, admin et public)
- Recette → **Produit** (partout, admin et public)

### Hiérarchie de base
- Structure maître : **Collection → Gamme → Produit**
- Étiquettes d'affichage optionnelles sur le produit : **Famille** et **Collection secondaire**

### Préfixes d'IDs
- COL-001 Collections, FAM-001 Familles, GAM-001 Gammes, PRO-001 Produits
- ING-001 Ingrédients, CAT-001 Catégories UC, EMB-001 Emballages
- FOUR-001 Fournisseurs, ACH-001 Achats, VEN-001 Ventes, LOT-001 Lots

### Convention de nommage des sheets V2
- Tous les onglets V2 ont le suffixe `_v2` — le V1 reste intact, aucun écrasement

### Google Sheets
- Même Google Sheets que le V1 — suffixe `_v2` sur tous les nouveaux onglets
- ID du spreadsheet : `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- URL Apps Script : `https://script.google.com/macros/s/AKfycbwwiGLwj8QJ6c5dGEtPEHUojzdbdncsTXnmEn-LJJxg7xBeckcbiCX1bvkMb3E3ba1FEA/exec`

### Routing V2
- `admin2.js` passe `v: '2'` dans chaque appel
- `doGet` et `doPost` détectent `v === '2'` et redirigent vers `doGet_v2` / `doPost_v2`
- Le V1 continue de tourner sans modification

### Fichiers GitHub
- Même repo GitHub, fichiers avec suffixe 2 (index2.html, style2.css, admin2.js, etc.)
- Bascule = renommer les fichiers quand V2 est validé
- Le V1 reste en production pendant la construction

### Pattern de données
- Chargement initial au démarrage — toutes les données en mémoire une fois
- Rechargement ciblé après chaque sauvegarde — une fonction par type
- Jamais de rechargement complet

### Style V2
- Un composant = une définition CSS — modificateurs si le contexte change
- Admin V2 = combinaison du style public et de l'admin V1 — à préciser en début de prochaine session avec captures d'écran ou description

### Contenu site
- Éditeur inline prévu — on clique directement sur le texte ou la photo pour modifier en place
- Pas de cases empilées — à construire quand on arrive à cette section

### Règles de travail
- OK après un trouve/remplace = confirmé, on passe à la suite sans redemander

---

## ÉTAT DES SHEETS V2 — AU 2026-04-04

### ✅ TOUTES LES SHEETS COMPLÉTÉES ET PEUPLÉES (25 sheets)
(voir V2-006 pour le détail)

---

## ÉTAT DU CODE V2 — AU 2026-04-04 (17h25)

### ✅ code_v2.gs — complété
### ✅ code.gs — routing V2 ajouté
### ✅ admin2.js — complété (tous les modules)
### ✅ style2.css — complété (root, boutons, formulaires, nav, composants)

### ⏳ index2.html — à démarrer
- Structure : même logique que l'admin V1 (sidebar, nav, sections)
- Style : combinaison public + admin V1 — à discuter en début de session
- Sections V2 : Accueil, Collections/Gammes, Produits, Achats, Stock, Fabrication, Ventes, INCI, Config, Contenu site (éditeur inline), Médiathèque
- Sections supprimées vs V1 : Import recettes, Import PDF
- Sections ajoutées vs V1 : Ventes

---

## NOTES TECHNIQUES IMPORTANTES

### ING-id — lookup automatique
- `Ingredients_INCI_v2` contient `nom_UC` et `ING-id`
- Fonction `remplirIngIdV2()` dans setup_v2.gs fait ce travail
- Si on ajoute des ingrédients dans INCI, relancer `remplirIngIdV2()`

### Catégories UC (13)
Argiles, Beurres, Cires, Colorants et Pigments, Fragrances, Herbes et Fleurs, Huiles, Huiles aromatiques, Huiles essentielles, Hydrolats, Ingrédients Liquides, Ingrédients Secs, Saveurs naturelles

### Fournisseurs (10)
FOUR-001 Pure Arôme (PA), FOUR-002 Les Mauvaises Herbes (MH), FOUR-003 Arbressence, FOUR-004 Divine Essence (DE), FOUR-005 Amazon, FOUR-006 IGA, FOUR-007 Jean Coutu (JC), FOUR-008 Cocoéco, FOUR-009 Manuel, FOUR-010 Divers

---

## PROCHAINE ÉTAPE

Démarrer `index2.html` — discuter du style visuel (combinaison public + admin V1) avant de coder.

---

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. `Carnet_de_route_V2-007` (ce document)
2. Règles de travail V2
3. Journal des décisions V2-001
4. `sheets_v2_structure.md`
5. `style2.css`, `admin2.js`, `code_v2.gs`
6. `index.html` (admin V1) et `index.html` (public V1) — pour référence visuelle
7. Donner l'heure
8. Dire ce qu'on fait

---

## CE QUI RESTE À DÉCIDER

- [ ] Style visuel exact de `index2.html` — combinaison public + admin V1 à préciser
- [ ] Comment entre un nouvel ingrédient dans le système — via recette ou via achat?
- [ ] Qui valide les codes INCI et comment?
- [ ] Alertes stock — quels seuils, qui les définit?
- [ ] Est-ce que Chantal aura accès à l'admin seule un jour, ou toujours avec toi?
- [ ] Domaine universcaresse.ca — quand?
- [ ] PRO-034 DOUCEUR DES ÎLES — deux formats 90g à prix différents (7$ et 10$) — doublon ou formats distincts?
- [ ] PRO-080 CLUB PRIVÉ savon à barbe — ingrédients incomplets dans le V1, à compléter

---

## PRINCIPES DE TRAVAIL — POUR CHAQUE CONVERSATION

1. **Lire ce carnet ET le journal avant de coder quoi que ce soit**
2. **Si une décision semble manquante — chercher dans le journal avant de demander**
3. **Analyser l'impact global d'un changement avant de le proposer**
4. **Un seul changement à la fois — attendre la confirmation**
5. **Livraison ciblée — trouve/remplace — jamais le fichier complet sans permission**
6. **Jamais de style inline dans le HTML ou le JS**
7. **OK après un trouve/remplace = confirmé — on passe à la suite sans redemander**
8. **Ne jamais demander à Jean-Claude s'il veut arrêter — on poursuit toujours**
9. **En fin de session — demander l'heure pour horodater le carnet**
10. **sheets_v2_structure.md doit être transmis à chaque session**

---

*Univers Caresse — Document confidentiel — V2-007 — 2026-04-04 17h25*

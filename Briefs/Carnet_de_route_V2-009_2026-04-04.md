# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-009 — 2026-04-04 — 21h24

---

## 🚨 VIOLATIONS COMMISES PAR LES CLAUDE PRÉCÉDENTS — À NE PAS RÉPÉTER

1. **Ne pas lire les fichiers transmis au complet** avant de coder ou proposer quoi que ce soit
2. **Proposer du CSS inutile** sans vérifier d'abord si une classe existante dans `style2.css` suffisait
3. **Produire le brief dans le chat** au lieu de le livrer en fichier `.md`
4. **Résumer les décisions visuelles de façon incomplète** dans le brief — écrire "à préciser" au lieu de documenter ce qui avait été discuté
5. **⛔ CRITIQUE — SESSION 2026-04-04 :** Un Claude a modifié `code.gs` du V1 en ajoutant le routing V2 (`doGet_v2` / `doPost_v2`) sans analyser l'impact global. Ces fonctions n'existaient pas dans le fichier — le script plantait à chaque appel. Résultat : le V1 a cessé de fonctionner. Jean-Claude a dû effacer tout le travail V2 dans Apps Script pour restaurer le V1. **Ne jamais toucher au `code.gs` du V1.**
6. **⛔ CRITIQUE — SESSION 2026-04-04 :** Le routing V2 dans le même `code.gs` que le V1 est une mauvaise architecture — dangereuse et difficile à gérer. La bonne solution (projet Apps Script séparé pour le V2) n'a pas été proposée dès le départ, causant une journée entière de travail perdu.

---

## ⛔ PROTOCOLE DE DÉMARRAGE — TOUJOURS DANS CET ORDRE

Chaque conversation commence exactement comme ça — sans exception.

1. Coller le **Carnet de route** (ce document) — **c'est le premier fichier à transmettre**
2. Coller les **Règles de travail**
3. Coller le **Journal des décisions** — **obligatoire avant tout travail**
4. Transmettre le(s) fichier(s) concerné(s) selon la tâche du jour :
   - CSS → `style2.css`
   - HTML → `index2.html`
   - Logique serveur → `code_v2.gs` UNIQUEMENT — jamais `code.gs`
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
- URL Apps Script V1 (NE PAS TOUCHER) : conserver l'URL originale du V1 intacte

### Architecture Apps Script — DÉCISION CRITIQUE SESSION 2026-04-04
- ~~Routing V2 dans le même `code.gs` que le V1~~ — **ABANDONNÉ — trop dangereux**
- **NOUVELLE DÉCISION :** Le V2 aura son **propre projet Apps Script séparé** — complètement indépendant du V1
- Le V1 garde son projet Apps Script, son déploiement, son URL — **on n'y touche plus jamais**
- Le V2 aura un nouveau projet Apps Script, son propre `code_v2.gs`, son propre déploiement, sa propre URL
- Les deux projets lisent le même Google Sheet (même ID spreadsheet)
- Cette architecture élimine tout risque de planter le V1

### Fichiers GitHub
- Même repo GitHub, fichiers avec suffixe 2 (index2.html, style2.css, admin2.js, etc.)
- Bascule = renommer les fichiers quand V2 est validé
- Le V1 reste en production pendant la construction

### Pattern de données
- Chargement initial au démarrage — toutes les données en mémoire une fois
- Rechargement ciblé après chaque sauvegarde — une fonction par type
- Jamais de rechargement complet

### Style V2 — DÉCISIONS PRISES
- Un seul fichier CSS — `style2.css` — public et admin partagent tout
- Un composant = une définition CSS — modificateurs si le contexte change
- Aucun style inline dans le HTML ou le JS — jamais
- Avant tout nouveau CSS : vérifier si une classe existante dans `style2.css` peut être réutilisée
- Public et admin ont le **même look** — même style, même comportement, même présentation
- Le contenu de chaque section diffère mais l'apparence est identique
- Chaque section sera décidée visuellement au fur et à mesure
- Cible principale : iPad paysage — s'adapte à iPad portrait, iPhone, ordi
- Breakpoints : ordi 1200px+, iPad paysage ~1024px, iPad portrait ~768px, iPhone ~390px
- `style2.css` repart de zéro — root complet, classes génériques, rien codé en dur dans le HTML ou le JS
- Le root contient : couleurs + toutes opacités, T1-T9 (tailles texte), familles de polices, line-height, letter-spacing, espacements par appareil, gaps, breakpoints, transitions multiples

### Navigation
- Nav horizontale + burger selon l'appareil — même style public et admin
- **Admin V2 — groupement nav :**
  - Accueil (direct)
  - Catalogue → Collections & Gammes, Produits
  - Achats → Nouvelle facture, Factures, Inventaire ingrédients
  - Production → Fabrication, Ventes, Stock produits
  - Système → INCI, Config, Contenu site, Médiathèque, Site public ↗, Déconnexion
- **Public V2 — nav :** Accueil, Catalogue, Le savon artisanal, Bon à savoir, Contact

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

## ÉTAT DU CODE V2 — AU 2026-04-04 (21h24)

### ⚠️ code_v2.gs — effacé du projet Apps Script V1 pour restaurer le V1 — À RECRÉER dans un projet Apps Script séparé
### ✅ code.gs (V1) — restauré, fonctionne, NE PAS TOUCHER
### ✅ admin2.js — complété (tous les modules)
### ✅ style2.css — root complet livré en session 2026-04-04 — reset et classes à faire
### ✅ login2.html — complété
### ✅ index2.html (admin2) — squelette complété (nav, sidebar, 13 sections vides)

### ⏳ PROCHAINES ÉTAPES DANS L'ORDRE
1. Créer le nouveau projet Apps Script V2 séparé et y déposer `code_v2.gs`
2. Déployer le projet V2 — obtenir l'URL V2
3. Brancher `admin2.js` sur l'URL V2
4. Compléter `style2.css` — reset, classes génériques, composants
5. Remplir les sections de `index2.html` — commencer par l'Accueil public

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

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. `Carnet_de_route_V2-009` (ce document)
2. Règles de travail V2
3. Journal des décisions V2-001
4. `sheets_v2_structure.md`
5. `style2.css`, `admin2.js`, `code_v2.gs`
6. `index2.html`, `login2.html`
7. Donner l'heure
8. Dire ce qu'on fait

---

## CE QUI RESTE À DÉCIDER

- [ ] Comment entre un nouvel ingrédient dans le système — via recette ou via achat?
- [ ] Qui valide les codes INCI et comment?
- [ ] Alertes stock — quels seuils, qui les définit?
- [ ] Est-ce que Chantal aura accès à l'admin seule un jour, ou toujours avec toi?
- [ ] Domaine universcaresse.ca — quand?
- [ ] PRO-034 DOUCEUR DES ÎLES — deux formats 90g à prix différents (7$ et 10$) — doublon ou formats distincts?
- [ ] PRO-080 CLUB PRIVÉ savon à barbe — ingrédients incomplets dans le V1, à compléter

---

## PRINCIPES DE TRAVAIL — POUR CHAQUE CONVERSATION

1. **Lire tous les fichiers transmis AU COMPLET avant de coder ou proposer quoi que ce soit**
2. **Lire ce carnet ET le journal avant de coder quoi que ce soit**
3. **Si une décision semble manquante — chercher dans le journal avant de demander**
4. **Analyser l'impact global d'un changement avant de le proposer — sur tout le site, pas juste le fichier concerné**
5. **Un seul changement à la fois — attendre la confirmation**
6. **Livraison ciblée — trouve/remplace — jamais le fichier complet sans permission**
7. **Jamais de style inline dans le HTML ou le JS**
8. **Avant tout nouveau CSS — vérifier style2.css pour réutiliser une classe existante**
9. **OK après un trouve/remplace = confirmé — on passe à la suite sans redemander**
10. **Ne jamais demander à Jean-Claude s'il veut arrêter — on poursuit toujours**
11. **En fin de session — demander l'heure pour horodater le carnet**
12. **Le brief se livre toujours en fichier .md complet — jamais dans le chat**
13. **sheets_v2_structure.md doit être transmis à chaque session**
14. **Ne jamais toucher au code.gs du V1 — jamais, sous aucun prétexte**
15. **Toujours proposer la solution la plus sécuritaire — pas la plus rapide**

---

*Univers Caresse — Document confidentiel — V2-009 — 2026-04-04 21h24*

# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-017 — 2026-04-05

---

## 🚨 VIOLATIONS COMMISES PAR LES CLAUDE PRÉCÉDENTS — À NE PAS RÉPÉTER

1. Ne pas lire les fichiers transmis au complet avant de coder ou proposer quoi que ce soit
2. Proposer du CSS inutile sans vérifier d'abord si une classe existante dans `style2.css` suffisait
3. Produire le brief dans le chat au lieu de le livrer en fichier `.md`
4. Résumer les décisions visuelles de façon incomplète dans le brief
5. **⛔ CRITIQUE :** Modifier `code.gs` du V1 — le V1 a cessé de fonctionner. Jean-Claude a dû tout effacer deux fois.
6. **⛔ CRITIQUE :** Quand le code ne fonctionne pas, accuser le déploiement, le lien, les règles Google, ou toute cause externe. La seule réponse valide : "Mon code est mauvais, voici la correction."
7. **⛔ CRITIQUE :** Proposer des changements d'architecture sans mandat — le brief existe, les décisions sont prises, on les suit.
8. **⛔ INTERDIT ABSOLU :** Ne jamais faire référence à l'heure ou suggérer une pause. C'est Jean-Claude qui gère son temps.
9. **⛔ INTERDIT ABSOLU :** Ne jamais coder sans OUI explicite de Jean-Claude. "OK" = confirmé. Tout le reste = attendre.
10. **⛔ CRITIQUE :** Ne jamais mettre de style inline dans le HTML — même temporairement. Les couleurs sont dans le root, les classes dans le CSS. Toujours.
11. **⛔ CRITIQUE :** Ne jamais proposer de nouvelle classe CSS sans avoir vérifié que les classes existantes ne peuvent pas faire le travail.
12. **⛔ CRITIQUE :** Ne jamais inventer ce qu'on voit à l'écran sans lire le fichier.
13. **⛔ CRITIQUE :** Ne jamais passer au sujet suivant sans OUI explicite.
14. **⛔ CRITIQUE :** Ne jamais créer de classes page-spécifiques. Un composant = un nom = utilisé partout sans exception.
15. **⛔ CRITIQUE :** Ne jamais commencer à coder ou migrer un fichier sans avoir d'abord complété l'inventaire des composants et validé les noms avec Jean-Claude.
16. **⛔ CRITIQUE :** Ne jamais regarder un seul fichier sans regarder l'ensemble du site. Chaque décision impacte public ET admin.
17. **⛔ CRITIQUE :** Ne jamais dire "go ?" ou demander la permission d'exécuter — attendre le OUI de Jean-Claude.
18. **⛔ CRITIQUE :** Ne jamais créer des classes typographiques qui dupliquent `.titre-1` à `.titre-5` et `.texte-1` à `.texte-4` — ces classes existent déjà avec les modificateurs.
19. **⛔ CRITIQUE :** Avant de proposer une correction visuelle, comparer le fichier CSS du V1 ET le rendu visuel — pas seulement le HTML. Le V1 est la référence.
20. **⛔ CRITIQUE :** Livraison par trouve/remplace uniquement — un changement à la fois — attendre le OK avant le suivant.

---

## ⛔ PROTOCOLE DE DÉMARRAGE — TOUJOURS DANS CET ORDRE

1. Coller le **Carnet de route** (ce document)
2. Coller les **Règles de travail**
3. Coller le **Journal des décisions**
4. Transmettre le(s) fichier(s) concerné(s) selon la tâche du jour :
   - CSS → `style2.css`
   - HTML public → `index.html`
   - HTML admin → `index-admin.html`
   - Logique serveur → `code_v2.gs` UNIQUEMENT — **jamais `code.gs`**
   - Front-end → `main.js` et/ou `admin.js`
   - Sheets → `sheets_v2_structure.md` — **obligatoire à chaque session**
5. Dire ce qu'on fait dans cette session

**Le Claude confirme qu'il a tout lu avant de commencer.**
**Le Claude suit les décisions du journal — il ne les remet pas en question.**
**Toute nouvelle décision est ajoutée au journal avant de terminer la session.**

---

## QUI EST UNIVERS CARESSE

### L'origine
Chantal Mondor a toujours voulu faire les choses elle-même, avec de vrais ingrédients, des gestes simples, le respect de ce qu'on met sur sa peau.

### L'ADN créatif
Chantal est une poète qui fait des savons. Chaque produit a un nom, une histoire, une atmosphère.

---

## LES DEUX UTILISATEURS

### Toi (le développeur permanent)
Tu es l'ami de 22 ans qui partage le café du matin avec Chantal. Tu développes l'outil, tu le testes. Tu ne fais pas la saisie quotidienne — tu construis ce qui permet à Chantal de le faire seule.

### Chantal (l'utilisatrice quotidienne)
Elle crée les savons. Elle utilise l'admin au quotidien. **L'interface doit être assez claire pour qu'elle puisse l'utiliser seule, sans t'appeler. Elle est encore entièrement sur papier — l'outil n'est pas fonctionnel.**

---

## CE QUE L'OUTIL DOIT FAIRE — PRIORITÉS

### Priorité 1 — Ce dont Chantal a besoin maintenant
- Un site pour annoncer ses produits
- Enregistrer une production, un achat, une vente
- Voir son stock
- Consulter ses produits

### Priorité 2 — Site public
Vitrine pour que les gens découvrent les produits et contactent Chantal.

### Priorité 3 — Outil de décision
Alertes stock, rentabilité par produit, quoi racheter.

---

## LA CHAÎNE COMPLÈTE

1. **L'ingrédient** — existe avant d'être acheté, vient d'un fournisseur, a un code INCI légal obligatoire pour tout produit public
2. **L'achat** — facture avec items, met à jour le stock, calcule le prix au gramme réel
3. **Le produit** — collection + gamme + ingrédients + surgras + unités + cure + statut
4. **La fabrication** — lot = produit × multiplicateur, ingrédients sortent du stock
5. **La vente** — savon sort de l'inventaire, argent rentre
6. **La décision** — le système aide à décider avec les données complètes

**Règle légale critique :** un produit ne peut pas passer au statut public sans codes INCI valides.

---

## DÉCISIONS PRISES POUR LE V2 — NE PAS REMETTRE EN QUESTION

### Vocabulaire
- Ligne → **Gamme** | Recette → **Produit**

### Hiérarchie
- **Collection → Gamme → Produit**
- Étiquettes optionnelles : **Famille** et **Collection secondaire**

### Préfixes d'IDs
- COL-001, FAM-001, GAM-001, PRO-001, ING-001, CAT-001, EMB-001
- FOUR-001, ACH-001, VEN-001, LOT-001

### Google Sheets
- ID : `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- Tous les onglets V2 ont le suffixe `_v2`

### Architecture Apps Script
- **Le V2 a son propre projet Apps Script séparé — projet `uc2`**
- URL V2 : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`
- **Ne jamais toucher au `code.gs` du V1 — jamais, sous aucun prétexte**

### Fichiers GitHub
- Même repo, pas de suffixe numérique sur les fichiers (plus de "2")
- Le V1 reste intact pendant la construction

### Style V2
- Un seul fichier CSS — `style2.css`
- **Aucun style inline dans le HTML ou le JS — jamais, même temporairement**
- Avant tout nouveau CSS : vérifier si une classe existante peut être réutilisée
- **Public et admin ont exactement le même look — un composant = un nom = utilisé partout**
- **Aucune classe page-spécifique — jamais**
- Cible principale : iPad paysage
- Breakpoints : ordi 1200px+, iPad paysage ~1024px, iPad portrait ~768px, iPhone ~390px
- **Aucun radius — tout est carré**
- **Toutes les valeurs dans le root — couleurs, tailles, paddings, gaps, ombres, transitions**
- **Jamais de classes typographiques custom — utiliser `.titre-1` à `.titre-5`, `.texte-1` à `.texte-4` et les modificateurs**

---

## SYSTÈME DE CLASSES CSS — ÉTAT ACTUEL style2.css

### Fondations (inchangées)
- **Titres** : `.titre-1` à `.titre-5` — Playfair Display
- **Texte** : `.texte-1` à `.texte-4` — DM Sans
- **Modificateurs** : `.em-italic`, `.em-accent`, `.em-primary`, `.em-gris`, `.em-blanc`, `.em-gras`, `.em-cursive`, `.em-upper`
- **Eyebrow** : `.eyebrow` — avec `min-height: 1.2rem` pour réserver l'espace avant chargement JS
- **Signature** : `.signature`
- **Boutons** : `.btn` + `.btn-primary`, `.btn-outline`, `.btn-danger`, `.btn-discret` + `.btn-sm`, `.btn-lg`
- **Formulaire** : `.form-groupe`, `.form-label`, `.form-ctrl`, `.form-actions`, `.form-grille`, `.form-note`, `.form-erreur`
- **Badges** : `.badge-primary`, `.badge-accent`, `.badge-danger`, `.badge-gris`
- **Messages** : `.message-succes`, `.message-erreur`, `.message-info` + `.toast`
- **Cartes** : `.carte` + `.carte-3-4`, `.carte-1-1`, `.carte-4-3`, `.carte-hover`
- **Grilles** : `.grille`, `.grille-2`, `.grille-3`, `.grille-4`, `.grille-auto`, `.grille-auto-sm`, `.grille-serree`
- **Filtres** : `.filtres-bar`, `.filtre-btn`, `.filtre-select`, `.filtre-recherche`
- **Tableau** : `table`, `thead`, `th`, `td`, `.td-actions`, `.tableau-wrap`
- **Modal** : `.modal-fond`, `.modal`, `.modal-entete`, `.modal-corps`, `.modal-fermer`
- **Chargement** : `.chargement`, `.spinner`
- **Séparateurs** : `.sep`, `.separateur-flexible`
- **Bandeau** : `.bandeau`, `.bandeau-primary`, `.bandeau-beige`
- **Panel** : `.panel`, `.panel-entete`, `.panel-corps`
- **États** : `.etat-vide`, `.etat-bientot`
- **Layout** : `nav`, `.admin-layout`, `.admin-contenu`, `.sidebar`, `.sidebar-fond`
- **Utilitaires** : `.cache`, `.invisible`, `.fond-accent`, `.fond-primary`, `.fond-gris`, `.double-ligne`

### Ajoutés cette session
- `.logo` — image logo, taille contrôlée par `--logo-w` dans le root
- `.col-2` — layout 2 colonnes générique avec padding
- `.col-2-serree`, `.col-2-centree` — variantes
- `.col-2-hero` — 2 colonnes pleine hauteur écran, padding 0, gap 0 ⚠️ EN COURS DE CORRECTION
- `.col-contenu` — flex column avec gap et padding interne de la colonne gauche ⚠️ EN COURS DE CORRECTION
- `.pile` — flex column avec `gap: var(--gap-contenu)` pour espacer les éléments empilés
- `.mosaique` — grille 2 colonnes de blocs colorés ⚠️ gap et padding EN COURS DE CORRECTION
- `.mosaique-item`, `.mosaique-bloc`, `.mosaique-bloc-accent`, `.mosaique-bloc-primary`, `.mosaique-bloc-gris`
- `.mosaique-label`, `.mosaique-nom`, `.mosaique-col`
- `.photo` — conteneur image avec ratio
- `.photo-3-4`, `.photo-16-9`, `.photo-1-1`, `.photo-auto`
- `.section-entete` — surtitre + titre + ligne + compteur
- `.section-entete-titre`, `.section-entete-ligne`, `.section-entete-count`, `.section-entete-surtitre`, `.section-entete-plume`
- `.zone-js` — conteneur rempli par le JS
- `.zone-js-strip` — grille auto pour les strips
- `.stats` — rangée de stats avec bordure du dessus
- `.stat-item` — un chiffre + label
- `.valeur` — item numéroté 01/02/03 avec bordures
- Variables root ajoutées : `--logo-w: 325px`, `--gap-contenu: 32px`

---

## CORRECTIONS EN ATTENTE — HERO ACCUEIL

Le hero de l'accueil n'est pas identique au V1. Différences constatées :

**V1 :**
- `.hero` — `display: grid; grid-template-columns: 1fr 1fr` — pas de padding sur le conteneur
- `.hero-left` — `padding: 24px 64px 80px 80px` — padding interne seulement
- `.hero-right` (mosaique) — va bord à bord à droite, `overflow: hidden`
- `.hero-mosaic` — `gap: 16px; padding: 16px`
- Pas de gap entre les deux colonnes

**V2 actuel (à corriger) :**
- `.col-2-hero` doit avoir `padding: 0; gap: 0`
- `.col-contenu` doit avoir `padding: var(--gap-sm) 0 var(--gap-lg) var(--pad-xl)`
- `.mosaique` doit avoir `gap: var(--gap-sm); padding: var(--gap-sm)`
- `.mosaique-bloc` — `overflow: hidden` à vérifier sur `.mosaique` parent

---

## ÉTAT DU PROJET

### Complet ✅
- `code_v2.gs` — toutes les actions GET et POST fonctionnelles, déployé
- `code.gs` V1 — intact, NE PAS TOUCHER
- Google Sheets V2 — 25 sheets en place avec données réelles

### En cours ⚠️
- `style2.css` — fondations livrées, hero accueil à corriger, reste des composants à faire
- `index.html` — section accueil en cours, hero pas encore identique au V1
- `index-admin.html` — à faire
- `main.js` — à migrer vers V2
- `admin.js` — à migrer vers V2
- `login.html` — à faire

---

## PROCHAINES ÉTAPES DANS L'ORDRE

1. **Corriger le hero** — `.col-2-hero`, `.col-contenu`, `.mosaique` (corrections documentées ci-dessus)
2. **Compléter `index.html`** — sections catalogue, éducatif, bon à savoir, contact, footer
3. **Construire `index-admin.html`**
4. **Migrer `main.js` et `admin.js`**
5. **`login.html`**

---

## MÉTHODE DE TRAVAIL CSS — DÉCISIONS DE CETTE SESSION

- Le V1 (`style.css`) est la référence visuelle — lire son CSS avant toute correction
- Comparer côte à côte V1 et V2 avant de proposer un changement
- Un trouve/remplace à la fois — attendre le OK avant le suivant
- Jamais de classes typographiques custom — tout passe par `.titre-X`, `.texte-X` et modificateurs
- Tout ce qui peut être dans le root doit y être — pas de valeurs hardcodées dans les classes
- Nommer par ce qu'est l'élément, pas par où il est

---

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. `Carnet_de_route_V2-017` (ce document)
2. `Regles_de_travail_V2.md`
3. `Journal_des_decisions_V2-004`
4. `style2.css` — version actuelle
5. `index.html` — version actuelle
6. `style.css` — V1 référence visuelle — **obligatoire tant que le hero n'est pas corrigé**
7. Ce qu'on fait

---

*Univers Caresse — Document confidentiel — V2-017 — 2026-04-05*

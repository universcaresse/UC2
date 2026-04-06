# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-013 — 2026-04-05

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
10. **⛔ NOUVEAU — CRITIQUE :** Ne jamais mettre de style inline dans le HTML — même temporairement. Les couleurs sont dans le root, les classes dans le CSS. Toujours.
11. **⛔ NOUVEAU — CRITIQUE :** Ne jamais proposer de nouvelle classe CSS sans avoir vérifié que les classes existantes ne peuvent pas faire le travail. Poser la question avant.
12. **⛔ NOUVEAU — CRITIQUE :** Ne jamais inventer ce qu'on voit à l'écran sans lire le fichier ou regarder la capture d'écran. Le logo dans la nav = violation directe.
13. **⛔ NOUVEAU :** Toujours réfléchir à l'impact global d'une classe AVANT de la proposer — est-ce que `.mosaique-accent` a besoin de `grid-row: span 2` intégré? Oui. Le livrer incomplet = perte de temps.

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
**Ne jamais demander à Jean-Claude s'il veut arrêter — on poursuit toujours.**

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
Un outil simple et fonctionnel pour :
- un site pour annoncer ses produits
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
- Public et admin ont le même look
- Cible principale : iPad paysage
- Breakpoints : ordi 1200px+, iPad paysage ~1024px, iPad portrait ~768px, iPhone ~390px

### Système de classes CSS — DÉCISIONS FINALES
- **Titres** : `.titre-1` à `.titre-5` — Playfair Display
- **Texte** : `.texte-1` à `.texte-4` — DM Sans
- **Modificateurs** : `.em-italic`, `.em-accent`, `.em-primary`, `.em-gris`, `.em-blanc`, `.em-gras`, `.em-cursive`, `.em-upper`
- **Eyebrow** : `.sur-titre` (remplace `.eyebrow` et tous les `.page-entete-eyebrow`, `.hero-eyebrow` etc. du V1)
- **Signature** : `.signature`
- **Boutons** : 4 variantes — `.btn-primary`, `.btn-outline`, `.btn-danger`, `.btn-discret` + `.btn-sm`, `.btn-lg`
- **Formulaire** : `.form-groupe` (un seul nom, en français)
- **Badges** : `.badge-primary`, `.badge-accent`, `.badge-danger`, `.badge-gris`
- **Messages** : `.message-succes`, `.message-erreur`, `.message-info`
- **Cartes** : `.carte` avec ratios `.carte-3-4`, `.carte-1-1`, `.carte-4-3` et modificateur `.carte-hover`
- **Grilles** : `.grille`, `.grille-2`, `.grille-3`, `.grille-4`, `.grille-auto`, `.grille-auto-sm`, `.grille-serree`
- **Aucun radius** — tout est carré
- **Toutes les valeurs dans le root** — couleurs, tailles, paddings, gaps, ombres, transitions

### Navigation admin V2
- Accueil (direct)
- Catalogue → Collections & Gammes, Produits
- Achats → Nouvelle facture, Factures, Inventaire ingrédients
- Production → Fabrication, Ventes, Stock produits
- Système → INCI, Config, Contenu site, Médiathèque, Site public ↗, Déconnexion

### Navigation public V2
- Accueil, Catalogue, Le savon artisanal, Bon à savoir, Contact

### Pattern de données
- Chargement initial au démarrage — toutes les données en mémoire une fois
- Rechargement ciblé après chaque sauvegarde
- Jamais de rechargement complet

---

## ÉTAT DES SHEETS V2 — ✅ COMPLÉTÉES (25 sheets)

**Structure** : Collections_v2 (9), Gammes_v2 (19), Familles_v2 (vide)
**Produits** : Produits_v2 (80), Produits_Ingredients_v2 (~565), Produits_Formats_v2 (58), Emballages_v2 (vide)
**Médias** : Mediatheque_v2
**INCI** : Scraping_PA_v2 (528), Scraping_MH_v2 (114), Scraping_Arbressence_v2 (14), Scraping_DE_v2 (190), Mapping_Fournisseurs_v2 (124), Categories_UC_v2 (13), Ingredients_INCI_v2 (140)
**Config** : Config_v2 (14)
**Fournisseurs & Achats** : Fournisseurs_v2 (10), Formats_Ingredients_v2 (vide), Achats_Entete_v2 (vide), Achats_Lignes_v2 (vide)
**Stock** : Stock_Ingredients_v2 (vide — calculé auto)
**Production** : Lots_v2 (vide)
**Ventes** : Ventes_Entete_v2 (vide), Ventes_Lignes_v2 (vide)
**Config site** : Contenu_v2 (98)

---

## ÉTAT DU CODE V2

- ✅ Projet Apps Script `uc2` — déployé, URL active
- ✅ `code_v2.gs` — complet, toutes les actions GET et POST fonctionnelles
- ✅ `code.gs` V1 — intact, NE PAS TOUCHER
- ✅ `style2.css` — root complet, système de classes génériques livré
- ⚠️ `index.html` — en cours — nav et section accueil partiellement migrées
- ⚠️ `index-admin.html` — à faire
- ⚠️ `main.js` — à migrer vers V2
- ⚠️ `admin.js` — à migrer vers V2
- ⚠️ `login.html` — à faire

---

## CE QUI A ÉTÉ FAIT CETTE SESSION

### style2.css
- Créé from scratch — root complet avec toutes les variables
- Système générique : `.titre-x`, `.texte-x`, `.em-x`, `.carte`, `.grille`, `.btn`, `.form-groupe`, `.badge`, `.message`, `.modal`, `.panel`, `.sidebar`, `.filtres-bar`, `.bandeau`, `.sep`, `.etat-vide`, `.etat-bientot`
- Aucun style spécifique à une page ou une section
- Aucune valeur codée en dur — tout passe par les variables root
- `.sur-titre` ajouté (remplace `.eyebrow` et tous ses équivalents V1)
- `.mosaique-accent`, `.mosaique-primary`, `.mosaique-gris` — à compléter avec `grid-row: span 2` dans `.mosaique-accent`

### index.html — migrations faites
- Nav : classes V1 → classes V2 (`.nav-links` → `.nav-liens`, `.active` → `.actif`)
- Section accueil : `.hero` → `.grille-2`, classes hero → classes génériques

### Changements en attente / non confirmés
- `.mosaique-accent` doit inclure `grid-row: span 2` dans le CSS — pas encore livré
- `index.html` — sections restantes non migrées : qui sommes-nous, catalogue, éducatif, bon à savoir, contact, footer

---

## PROCHAINES ÉTAPES DANS L'ORDRE

1. Corriger `.mosaique-accent` dans `style2.css` — ajouter `grid-row: span 2`
2. Continuer la migration de `index.html` section par section
3. `login.html`
4. `index-admin.html`
5. `main.js` — migrer les appels API vers V2
6. `admin.js` — migrer vers V2

---

## NOTES TECHNIQUES

### API V2 — actions GET disponibles
`getCollections`, `getGammes`, `getFamilles`, `getProduits`, `getProduitsIngredients`, `getProduitsFormats`, `getIngredientsInci`, `getCategoriesUC`, `getMappingFournisseurs`, `getFournisseurs`, `getAchatsEntete`, `getAchatsLignes`, `getStock`, `getLots`, `getVentesEntete`, `getVentesLignes`, `getConfig`, `getContenu`, `getMediatheque`, `getCatalogue`

### API V2 — actions POST disponibles
`saveCollection`, `deleteCollection`, `saveGamme`, `deleteGamme`, `saveProduit`, `deleteProduit`, `createAchatEntete`, `addAchatLigne`, `finaliserAchat`, `deleteAchatLigne`, `deleteAchat`, `saveLot`, `createVente`, `addVenteLigne`, `finaliserVente`, `saveConfig`, `updateContenu`, `saveMediatheque`, `supprimerMediatheque`, `envoyerContact`

### getCatalogue — structure retournée
```
{ success, produits: [{ pro_id, col_id, gam_id, nom, description, couleur_hex, image_url, statut, nom_collection, slogan_collection, nom_gamme, formats: [{poids, unite, prix_vente}], ingredients: [{ing_id, nom_ingredient, quantite_g}] }], infoCollections: { col_id: { rang, nom, slogan, description, couleur_hex, photo_url } } }
```

### Catégories UC (13)
Argiles, Beurres, Cires, Colorants et Pigments, Fragrances, Herbes et Fleurs, Huiles, Huiles aromatiques, Huiles essentielles, Hydrolats, Ingrédients Liquides, Ingrédients Secs, Saveurs naturelles

### Fournisseurs (10)
FOUR-001 Pure Arôme, FOUR-002 Les Mauvaises Herbes, FOUR-003 Arbressence, FOUR-004 Divine Essence, FOUR-005 Amazon, FOUR-006 IGA, FOUR-007 Jean Coutu, FOUR-008 Cocoéco, FOUR-009 Manuel, FOUR-010 Divers

---

## CE QUI RESTE À DÉCIDER

- [ ] Comment entre un nouvel ingrédient — via recette ou via achat?
- [ ] Qui valide les codes INCI?
- [ ] Alertes stock — quels seuils?
- [ ] Chantal aura accès à l'admin seule un jour?
- [ ] Domaine universcaresse.ca — quand?
- [ ] PRO-034 DOUCEUR DES ÎLES — deux formats 90g à prix différents — doublon ou formats distincts?
- [ ] PRO-080 CLUB PRIVÉ savon à barbe — ingrédients incomplets

---

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. `Carnet_de_route_V2-013` (ce document)
2. Règles de travail
3. Journal des décisions V2-002
4. `sheets_v2_structure.md` — obligatoire
5. `style2.css`
6. `index.html`
7. Ce qu'on fait

---

## PRINCIPES DE TRAVAIL

1. Lire tous les fichiers transmis AU COMPLET avant de coder ou proposer quoi que ce soit
2. Suivre les décisions du journal — ne pas les remettre en question
3. Analyser l'impact global avant de proposer quoi que ce soit
4. Un seul changement à la fois — attendre le OUI explicite
5. Livraison ciblée — trouve/remplace — jamais le fichier complet sans permission
6. **Jamais de style inline dans le HTML ou le JS — jamais, même temporairement**
7. Avant tout nouveau CSS — vérifier style2.css pour réutiliser une classe existante
8. Le brief se livre toujours en fichier .md — jamais dans le chat
9. `sheets_v2_structure.md` doit être transmis à chaque session
10. Ne jamais toucher au `code.gs` du V1
11. Quand le code ne fonctionne pas — c'est le code, pas le déploiement
12. C'est Jean-Claude qui gère son temps — ne jamais y faire référence
13. Lire les fichiers avant de parler — ne jamais inventer ce qu'on voit

---

*Univers Caresse — Document confidentiel — V2-013 — 2026-04-05*

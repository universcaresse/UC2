# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-016 — 2026-04-05

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
14. **⛔ CRITIQUE :** Ne jamais créer de classes page-spécifiques — `.accueil-ce`, `.catalogue-ca`, `.contact-ci`. Un composant = un nom = utilisé partout sans exception.
15. **⛔ CRITIQUE :** Ne jamais commencer à coder ou migrer un fichier sans avoir d'abord complété l'inventaire des composants et validé les noms avec Jean-Claude.
16. **⛔ CRITIQUE :** Ne jamais regarder un seul fichier sans regarder l'ensemble du site. Chaque décision impacte public ET admin.

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

---

## FONCTIONNEMENT PAR SECTION — DÉCISIONS FINALES

### Accueil
- Même layout hero + stats + tuiles pour public et admin
- Public : nouveaux produits, collections, CTA catalogue
- Admin : tâches du jour, alertes stock, raccourcis vers sections actives
- Un seul composant — contenu conditionnel géré par le JS

### Catalogue
- Même grille, même carte, même modal — public et admin
- Modal admin : mêmes infos + boutons Modifier/Supprimer
- Pas de deuxième composant — contenu conditionnel dans le JS

### Contenu du site (admin)
- **Éditeur inline** — Chantal voit le site exactement comme ses clients
- Elle clique sur un texte ou une photo → ça devient éditable directement
- Elle sauvegarde → la valeur est mise à jour dans Contenu_v2
- Pas de page de cases, pas de translation mentale

### Achats
- **Une seule page** — entête de facture en haut, ajout d'items en dessous
- Total calculé en temps réel
- Un bouton Finaliser
- Le wizard 3 étapes du V1 est abandonné

### Fabrication
- Garder tel quel — jamais utilisé, on ajustera à l'usage

### Inventaire ingrédients
- Garder tel quel — jamais utilisé, on ajustera à l'usage

### INCI
- Garder tel quel

### Médiathèque
- Garder tel quel

### Ventes
- À développer — placeholder dans le V2

### Login
- Garder tel quel

---

## SYSTÈME DE CLASSES CSS — DÉCISIONS FINALES

### Déjà dans style2.css ✅
- **Titres** : `.titre-1` à `.titre-5` — Playfair Display
- **Texte** : `.texte-1` à `.texte-4` — DM Sans
- **Modificateurs** : `.em-italic`, `.em-accent`, `.em-primary`, `.em-gris`, `.em-blanc`, `.em-gras`, `.em-cursive`, `.em-upper`
- **Eyebrow** : `.eyebrow`
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

### À compléter — composants manquants (à valider avant de coder)
- Entête de section (eyebrow + titre + action optionnelle)
- Hero (accueil)
- Stats (chiffre + label)
- Tuiles de navigation/dashboard
- Section 2 colonnes texte + visuel
- Valeurs numérotées (01, 02, 03...)
- Bandeau citation
- Strip de collections (accueil public)
- Entête de collection dans le catalogue (nom + slogan + photo)
- Carte de collection
- Carte de produit avec infos et formats
- Modal produit (public + admin)
- Panel de fiche/formulaire coulissant
- Section éducative avec pager
- Cards d'information (accent / neutre / primary)
- Notes avec icône
- Contact (grille info + formulaire)
- Médiathèque grille
- Accordéon
- Wizard / étapes
- Aperçu couleur
- Cloudinary zone

---

## ÉTAT DU PROJET

### Complet ✅
- `code_v2.gs` — toutes les actions GET et POST fonctionnelles, déployé
- `code.gs` V1 — intact, NE PAS TOUCHER
- Google Sheets V2 — 25 sheets en place avec données réelles

### En cours ⚠️
- `style2.css` — fondations livrées, composants spécifiques manquants
- `index.html` — accueil + footer partiellement migrés, reste à compléter
- `index-admin.html` — à refaire
- `main.js` — à migrer vers V2
- `admin.js` — à migrer vers V2
- `login.html` — à faire

---

## PROCHAINES ÉTAPES DANS L'ORDRE

1. **Inventaire des composants** — valider les noms avec Jean-Claude avant tout code
2. **Compléter `style2.css`** — ajouter les composants manquants, un à la fois avec OUI explicite
3. **Migrer `index.html`** — section par section
4. **Construire `index-admin.html`** — mêmes composants, contenu différent
5. **Migrer `main.js` et `admin.js`** — appels API V2, logique de rendu avec nouvelles classes
6. **`login.html`**

---

## ÉTAT DES SHEETS V2

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

## NOTES TECHNIQUES

### API V2 — actions GET
`getCollections`, `getGammes`, `getFamilles`, `getProduits`, `getProduitsIngredients`, `getProduitsFormats`, `getIngredientsInci`, `getCategoriesUC`, `getMappingFournisseurs`, `getFournisseurs`, `getAchatsEntete`, `getAchatsLignes`, `getStock`, `getLots`, `getVentesEntete`, `getVentesLignes`, `getConfig`, `getContenu`, `getMediatheque`, `getCatalogue`

### API V2 — actions POST
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

- [ ] Inventaire complet des composants et leurs noms définitifs — **PRIORITÉ ABSOLUE**
- [ ] Comment entre un nouvel ingrédient — via produit ou via achat?
- [ ] Qui valide les codes INCI?
- [ ] Alertes stock — quels seuils?
- [ ] Chantal aura accès à l'admin seule un jour?
- [ ] Domaine universcaresse.ca — quand?
- [ ] PRO-034 DOUCEUR DES ÎLES — deux formats 90g à prix différents — doublon ou formats distincts?
- [ ] PRO-080 CLUB PRIVÉ savon à barbe — ingrédients incomplets

---

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. `Carnet_de_route_V2-016` (ce document)
2. `Regles_de_travail_V2.md`
3. `Journal_des_decisions_V2-004`
4. `sheets_v2_structure.md` — obligatoire
5. `style2.css`
6. `index.html`
7. `index-admin.html`
8. Ce qu'on fait

---

## PRINCIPES DE TRAVAIL

1. Lire tous les fichiers transmis AU COMPLET avant de coder ou proposer quoi que ce soit
2. Suivre les décisions du journal — ne pas les remettre en question
3. Analyser l'impact global avant de proposer quoi que ce soit
4. Un seul changement à la fois — attendre le OUI explicite
5. Livraison ciblée — trouve/remplace — jamais le fichier complet sans permission
6. Jamais de style inline dans le HTML ou le JS — jamais, même temporairement
7. Avant tout nouveau CSS — vérifier style2.css pour réutiliser une classe existante
8. Le brief se livre toujours en fichier .md — jamais dans le chat
9. `sheets_v2_structure.md` doit être transmis à chaque session
10. Ne jamais toucher au `code.gs` du V1
11. Quand le code ne fonctionne pas — c'est le code, pas le déploiement
12. C'est Jean-Claude qui gère son temps — ne jamais y faire référence
13. Lire les fichiers avant de parler — ne jamais inventer ce qu'on voit
14. Ne jamais passer au sujet suivant sans OUI explicite
15. Du texte = classes texte existantes — ne pas créer de nouvelles classes pour du texte
16. Un composant = un nom = partout — jamais de classes page-spécifiques
17. Inventaire des composants obligatoire avant tout code CSS ou HTML

---

*Univers Caresse — Document confidentiel — V2-016 — 2026-04-05*

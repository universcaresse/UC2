# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation
### Version V2-003 — 2026-04-04 — session du matin

---

## ⛔ PROTOCOLE DE DÉMARRAGE — TOUJOURS DANS CET ORDRE

Chaque conversation commence exactement comme ça — sans exception.

1. Coller le **Carnet de route** (ce document) — **c'est le premier fichier à transmettre**
2. Coller les **Règles de travail**
3. Coller le **Journal des décisions** — **obligatoire avant tout travail**
4. Transmettre le(s) fichier(s) concerné(s) selon la tâche du jour :
   - CSS → `style2.css`
   - HTML → `index2.html`
   - Logique serveur → `code.gs`
   - Sheets → capture ou export de la structure
5. Donner l'heure actuelle — **Claude ne gère pas les fuseaux horaires, l'heure vient toujours de toi**
6. Dire ce qu'on fait dans cette session — exemple : *"On continue les sheets V2. Prochaine étape : Scraping_PA_v2."*

**Le Claude doit confirmer qu'il a tout lu avant de commencer.**
**Si le Claude propose quelque chose qui contredit une décision du journal — pointer le journal.**
**Si une nouvelle décision est prise — l'ajouter au journal avant de terminer la session.**

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
- Exemple : `Collections_v2`, `Gammes_v2`, etc.

### Google Sheets
- Même Google Sheets que le V1 — suffixe `_v2` sur tous les nouveaux onglets
- ID du spreadsheet : `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0`
- Tous les scripts Apps Script sont dans `setup_v2.gs` (fichier temporaire, sera effacé quand tout est en place)

### Fichiers GitHub
- Même repo GitHub, fichiers avec suffixe 2 (index2.html, style2.css, etc.)
- Bascule = renommer les fichiers quand V2 est validé
- Le V1 reste en production pendant la construction

---

## ÉTAT DES SHEETS V2 — AU 2026-04-04

### ✅ COMPLÉTÉES ET PEUPLÉES

**1. Collections_v2** — 9 lignes — COL-001 à COL-009
Colonnes : COL-id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url

**2. Gammes_v2** — 19 lignes — GAM-001 à GAM-019
Colonnes : GAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url

**3. Familles_v2** — vide (sheet créée, peuplée quand Chantal définit ses familles)
Colonnes : FAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url

**4. Produits_v2** — 80 lignes — PRO-001 à PRO-080
Colonnes : PRO-id, COL-id, GAM-id, FAM-id, nom, description, desc_emballage, couleur_hex, surgras, nb_unites, cure, instructions, notes, image_url, image_noel_url, statut, collections_secondaires
Note : surgras normalisé en décimal (0.08, 0.10, etc.)
Note : PRO-079 = L'INSTANT DU BARBIER, PRO-080 = CLUB PRIVÉ savon à barbe (même base, parfums différents — PRO-080 incomplet dans le V1, à compléter)

**5. Produits_Ingredients_v2** — ~400 lignes
Colonnes : PRO-id, ING-id (vide pour l'instant), nom_ingredient, quantite_g
Note : ING-id sera assigné quand Ingredients_INCI_v2 sera créée

**6. Produits_Formats_v2** — 58 lignes
Colonnes : PRO-id, poids, unite, prix_vente, EMB-id (vide pour l'instant)
Note : PRO-034 (DOUCEUR DES ÎLES) a deux entrées 90g à prix différents (7$ et 10$) — à valider avec Chantal

**7. Emballages_v2** — vide (sheet créée, peuplée quand Chantal définit ses emballages)
Colonnes : EMB-id, nom, type

**8. Mediatheque_v2** — copiée directement du V1 et renommée

### 🔲 À FAIRE — CHAÎNE INCI

**9. Scraping_PA_v2**
**10. Scraping_MH_v2**
**11. Scraping_Arbressence_v2**
**12. Scraping_DE_v2**

Toutes les 4 ont la même structure (statué au journal) :
`Fournisseur, Nom, Catégorie, INCI, Nom_botanique, Partie_plante, Origine, Methode_production, Chemotype, Culture, Composantes_majoritaires, Point_eclair, Bio, Odeur, NPN, Marque, URL, Qualite, Statut, Date_scraping, Texte_brut`

**13. Mapping_Fournisseurs_v2**
Colonnes : Fournisseur, Categorie_fournisseur, Nom_fournisseur, Categorie_UC, Nom_UC, ING-id

**14. Categories_UC_v2**
Colonnes : CAT-id, nom, date_ajout

**15. Ingredients_INCI_v2**
Colonnes : ING-id, CAT-id, nom_fournisseur, nom_UC, INCI, nom_botanique, source, note_olfactive, statut, date_ajout
Note : quand cette sheet est peuplée, revenir dans Produits_Ingredients_v2 pour remplir les ING-id

### 🔲 À FAIRE — CONFIGURATION

**16. Config_v2**
Colonnes : type, densite, unite, marge_perte_pct

### 🔲 À FAIRE — FOURNISSEURS & ACHATS

**17. Fournisseurs_v2**
Colonnes : FOUR-id, code, nom, site_web, notes

**18. Formats_Ingredients_v2**
Colonnes : ING-id, contenant, quantite, unite

**19. Achats_Entete_v2**
Colonnes : ACH-id, date, FOUR-id, sous_total, tps, tvq, livraison, total, facteur_majoration, statut

**20. Achats_Lignes_v2**
Colonnes : ACH-id, ING-id, format_qte, format_unite, prix_unitaire, prix_par_g, prix_par_g_reel, quantite, prix_total, notes

### 🔲 À FAIRE — STOCK

**21. Stock_Ingredients_v2** (calculé automatiquement)
Colonnes : ING-id, qte_g, prix_par_g_reel, date_derniere_maj

### 🔲 À FAIRE — PRODUCTION

**22. Lots_v2**
Colonnes : LOT-id, PRO-id, multiplicateur, nb_unites, date_fabrication, date_disponibilite, cout_ingredients, cout_emballages, cout_revient_total, cout_par_unite, statut

### 🔲 À FAIRE — VENTES

**23. Ventes_Entete_v2**
Colonnes : VEN-id, date, client, total, statut

**24. Ventes_Lignes_v2**
Colonnes : VEN-id, PRO-id, LOT-id, quantite, prix_unitaire, prix_total

### 🔲 À FAIRE — CONFIG SITE

**25. Contenu_v2**
Colonnes : cle, valeur

---

## PROCHAINE ÉTAPE RECOMMANDÉE

Créer les 4 sheets de scraping INCI (`Scraping_PA_v2`, `Scraping_MH_v2`, `Scraping_Arbressence_v2`, `Scraping_DE_v2`) avec la structure statués, puis `Mapping_Fournisseurs_v2`, `Categories_UC_v2`, et `Ingredients_INCI_v2`.

---

## FICHIERS À TRANSMETTRE EN DÉBUT DE PROCHAINE SESSION

1. Carnet_de_route_V2-003 (ce document)
2. Règles de travail V2 (inchangé)
3. Journal_des_decisions_V2-001 (inchangé cette session)
4. Donner l'heure
5. Dire ce qu'on fait

---

## CE QUI RESTE À DÉCIDER

- [ ] Comment entre un nouvel ingrédient dans le système — via recette ou via achat?
- [ ] Qui valide les codes INCI et comment?
- [ ] Structure exacte du module de ventes
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
7. **Tous les scripts Apps Script vont dans setup_v2.gs**
8. **Créer un nouveau fichier .gs pour chaque nouvelle fonction — ne jamais modifier creerSheetsV2 qui efface et recrée**

---

*Univers Caresse — Document confidentiel — V2-003 — 2026-04-04*

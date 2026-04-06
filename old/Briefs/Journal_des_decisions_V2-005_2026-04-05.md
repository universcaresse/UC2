# JOURNAL DES DÉCISIONS — UNIVERS CARESSE V2
### Pourquoi on a fait X. Pourquoi on a abandonné Y.
### Ne jamais effacer — ajouter seulement. Corriger = barrer + noter à côté.

---

## FORMAT D'UNE ENTRÉE

**[SUJET] Titre de la décision** — *date*
> Contexte : pourquoi la question s'est posée
> Décision : ce qu'on a choisi
> Raison : pourquoi ce choix
> Alternative rejetée : ce qu'on n'a pas fait et pourquoi

---

## ARCHITECTURE GÉNÉRALE

**[STRUCTURE] Refaire from scratch en V2 plutôt que patcher le V1** — *3 avril 2026*
> Contexte : le V1 accumule des patches depuis des mois. Chaque correction en crée une nouvelle. Les achats et l'inventaire sont vides car trop fragiles à utiliser. Les ventes ne peuvent pas démarrer.
> Décision : construire le V2 en parallèle. Le V1 reste en production pendant la construction.
> Raison : patcher davantage le V1 ne règle pas les problèmes de fond — données dénormalisées, CSS incohérent, relations par texte au lieu d'IDs.
> Alternative rejetée : continuer à patcher le V1 — rejeté car chaque patch ajoute de la fragilité au lieu d'en retirer.

---

**[STRUCTURE] Même repo GitHub, fichiers avec suffixe 2** — *3 avril 2026*
> Contexte : où héberger le V2 pendant la construction?
> Décision : même repo GitHub, index-admin2.html, style2.css, admin2.js, login2.html, etc. Bascule = renommer les fichiers quand V2 validé.
> Raison : pas de nouveau repo à gérer, même URL finale, zéro redirect.
> Alternative rejetée : nouveau repo séparé — rejeté car complexité inutile.

---

**[STRUCTURE] Projet Apps Script séparé pour le V2** — *4 avril 2026*
> Contexte : un Claude a tenté de mettre le routing V2 dans le même code.gs que le V1. Les fonctions doGet_v2 / doPost_v2 n'existaient pas — le script plantait à chaque appel. Le V1 a cessé de fonctionner. Jean-Claude a dû tout effacer pour restaurer le V1.
> Décision : le V2 a son propre projet Apps Script séparé — projet nommé `uc2`. URL V2 : `https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec`. Le V1 garde son projet, son déploiement, son URL — on n'y touche plus jamais. Les deux projets lisent le même Google Sheet.
> Raison : architecture qui élimine tout risque de planter le V1. Isolation complète.
> Alternative rejetée : routing V2 dans le même code.gs — rejeté définitivement après la panne du 4 avril 2026.

---

## DONNÉES

**[DONNÉES] IDs stables au lieu de relations par texte** — *3 avril 2026*
> Contexte : en V1, modifier le nom d'une ligne de produit rend les recettes orphelines — elles perdent leur lien avec la collection/ligne parce que la relation est par texte. Renommer une collection = propager dans 5+ endroits.
> Décision : IDs lisibles partout — COL-001, GAM-001, PRO-001, ING-001, ACH-001, etc.
> Raison : renommer = changer à 1 seul endroit. Lisible dans les sheets Google pour comprendre les relations sans être développeur.
> Alternative rejetée : UUID générés automatiquement — rejeté car illisibles dans les sheets Google.

---

**[DONNÉES] Collections et Gammes dans deux sheets séparées** — *3 avril 2026*
> Contexte : en V1, la sheet Collections mélange collections et lignes — 21 lignes pour 9 collections réelles.
> Décision : sheet Collections (une ligne par collection) + sheet Gammes (une ligne par gamme, avec COL-id).
> Raison : données normalisées. Ajouter une gamme = ajouter 1 ligne dans Gammes, pas dupliquer toute la collection.
> Alternative rejetée : garder le mélange — rejeté car source de dénormalisation.

---

**[DONNÉES] Produits_Ingredients = sheet séparée** — *3 avril 2026*
> Contexte : en V1, la sheet Recettes répète toutes les infos de la recette pour chaque ingrédient — 576 lignes pour ~75 recettes.
> Décision : sheet Produits (une ligne par produit) + sheet Produits_Ingredients (une ligne par ingrédient par produit).
> Raison : données propres, pas de répétition. Modifier un produit = modifier 1 ligne dans Produits.
> Alternative rejetée : garder la structure actuelle — rejeté car ingérable.

---

**[DONNÉES] L'achat = seul point d'entrée pour les ingrédients** — *3 avril 2026*
> Contexte : en V1, on pouvait ajouter des ingrédients directement dans le formulaire recette. Résultat : ingrédients sans prix, sans fournisseur, sans INCI.
> Décision : un ingrédient entre dans le système par un achat ou par la page INCI. Jamais directement dans un produit.
> Raison : garantit que chaque ingrédient a un prix au gramme et une source connue.

---

**[DONNÉES] Préfixes d'IDs V2** — *4 avril 2026*
> Contexte : le V1 avait des IDs incohérents — flottants, timestamps, formats mélangés.
> Décision : COL-001 Collections, FAM-001 Familles, GAM-001 Gammes, PRO-001 Produits, ING-001 Ingrédients, CAT-001 Catégories UC, EMB-001 Emballages, FOUR-001 Fournisseurs, ACH-001 Achats, VEN-001 Ventes, LOT-001 Lots.
> Raison : lisible pour un humain dans les sheets, cohérent partout.
> Alternative rejetée : FAC-ACH et FAC-VEN — rejeté car le préfixe FAC est inutile quand le type est déjà dans le préfixe.

---

**[DONNÉES] Liste officielle des sheets V2 — 25 sheets avec suffixe _v2** — *4 avril 2026*
> Contexte : le V1 avait 23 onglets mal ordonnés, sans logique hiérarchique.
> Décision : 25 sheets organisées par groupe fonctionnel dans l'ordre logique de la chaîne. Toutes avec suffixe `_v2`.

**Structure** : Collections_v2, Gammes_v2, Familles_v2
**Produits** : Produits_v2, Produits_Ingredients_v2, Produits_Formats_v2, Emballages_v2
**Médias** : Mediatheque_v2
**Chaîne INCI** : Scraping_PA_v2, Scraping_MH_v2, Scraping_Arbressence_v2, Scraping_DE_v2, Mapping_Fournisseurs_v2, Categories_UC_v2, Ingredients_INCI_v2
**Configuration** : Config_v2
**Fournisseurs & Achats** : Fournisseurs_v2, Formats_Ingredients_v2, Achats_Entete_v2, Achats_Lignes_v2
**Stock** : Stock_Ingredients_v2
**Production** : Lots_v2
**Ventes** : Ventes_Entete_v2, Ventes_Lignes_v2
**Config site** : Contenu_v2

> Note : Gammes_Base_v2 prévue initialement — absorbée dans Produits_Ingredients_v2. Config_INCI_v2 et Ingredients_UC_v2 absorbées dans Mapping_Fournisseurs_v2 et Ingredients_INCI_v2.

---

**[DONNÉES] Colonnes officielles des sheets V2** — *4 avril 2026*

**Collections_v2** — COL-id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url
**Gammes_v2** — GAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url
**Familles_v2** — FAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url
**Produits_v2** — PRO-id, COL-id, GAM-id, FAM-id, nom, description, desc_emballage, couleur_hex, surgras, nb_unites, cure, instructions, notes, image_url, image_noel_url, statut, collections_secondaires
**Produits_Ingredients_v2** — PRO-id, ING-id, nom_ingredient, quantite_g
**Produits_Formats_v2** — PRO-id, poids, unite, prix_vente, EMB-id
**Emballages_v2** — EMB-id, nom, type
**Mediatheque_v2** — url, nom, categorie, date_ajout
**Scraping_XX_v2** — Fournisseur, Nom, Catégorie, INCI, Nom_botanique, Partie_plante, Origine, Methode_production, Chemotype, Culture, Composantes_majoritaires, Point_eclair, Bio, Odeur, NPN, Marque, URL, Qualite, Statut, Date_scraping, Texte_brut
**Mapping_Fournisseurs_v2** — Fournisseur, Categorie_fournisseur, Nom_fournisseur, Categorie_UC, Nom_UC, ING-id
**Categories_UC_v2** — CAT-id, nom, date_ajout
**Ingredients_INCI_v2** — ING-id, CAT-id, nom_fournisseur, nom_UC, INCI, nom_botanique, source, note_olfactive, statut, date_ajout
**Config_v2** — type, densite, unite, marge_perte_pct
**Fournisseurs_v2** — FOUR-id, code, nom, site_web, notes
**Formats_Ingredients_v2** — ING-id, contenant, quantite, unite
**Achats_Entete_v2** — ACH-id, date, FOUR-id, sous_total, tps, tvq, livraison, total, facteur_majoration, statut
**Achats_Lignes_v2** — ACH-id, ING-id, format_qte, format_unite, prix_unitaire, prix_par_g, prix_par_g_reel, quantite, prix_total, notes
**Stock_Ingredients_v2** — ING-id, qte_g, prix_par_g_reel, date_derniere_maj
**Lots_v2** — LOT-id, PRO-id, multiplicateur, nb_unites, date_fabrication, date_disponibilite, cout_ingredients, cout_emballages, cout_revient_total, cout_par_unite, statut
**Ventes_Entete_v2** — VEN-id, date, client, total, statut
**Ventes_Lignes_v2** — VEN-id, PRO-id, LOT-id, quantite, prix_unitaire, prix_total
**Contenu_v2** — cle, valeur

---

## VOCABULAIRE

**[VOCABULAIRE] Ligne → Gamme** — *4 avril 2026*
> Contexte : "Ligne" faisait trop technique et cuisine.
> Décision : partout dans le système, admin et public, on utilise "Gamme".
> Raison : plus clair pour Chantal, plus cohérent avec le vocabulaire du commerce.
> Alternative rejetée : garder "Ligne" — rejeté car ambiguë et peu évocatrice.

---

**[VOCABULAIRE] Recette → Produit** — *4 avril 2026*
> Contexte : "Recette" faisait laboratoire et cuisine. Sur le site public surtout, ça sonnait faux.
> Décision : partout dans le système, admin et public, on utilise "Produit".
> Raison : fait moins cuisine, plus cohérent entre l'admin et le public.
> Alternative rejetée : garder "Recette" dans l'admin et "Produit" sur le public — rejeté car deux mots pour la même chose crée de la confusion.

---

**[STRUCTURE] Hiérarchie de base V2 et étiquettes d'affichage** — *4 avril 2026*
> Contexte : le V1 avait Collection → Ligne → Recette. Pas de couche intermédiaire pour regrouper des gammes visuellement.
> Décision : structure maître = Collection → Gamme → Produit. Par-dessus, des étiquettes d'affichage optionnelles sur le produit : Collection secondaire et Famille.
> Raison : la création reste simple. L'affichage public est flexible sans polluer la structure de gestion.
> Alternative rejetée : forcer Famille à la création — rejeté car Chantal ne pense pas en famille quand elle crée.

---

## CSS

**[CSS] CSS custom plutôt que framework** — *3 avril 2026*
> Contexte : faut-il utiliser un framework CSS pour le V2?
> Décision : CSS custom propre avec design system complet dans le root.
> Raison : pas de dépendance externe, contrôle total, cohérence avec l'identité visuelle d'Univers Caresse.
> Alternative rejetée : Tailwind — rejeté car dépendance externe et apprentissage supplémentaire pour rien.

---

**[CSS] Un seul fichier CSS — public et admin partagent les fondations** — *3 avril 2026*
> Contexte : en V1, public et admin dérivent l'un de l'autre avec des duplications.
> Décision : un seul style2.css avec sections clairement séparées par commentaires.
> Raison : une modification = un seul endroit. Composants partagés définis une seule fois.

---

**[CSS] Public et admin ont le même look** — *4 avril 2026*
> Contexte : faut-il distinguer visuellement l'admin du site public?
> Décision : même style, même comportement, même présentation — seul le contenu des sections diffère.
> Raison : cohérence totale, une seule base CSS à maintenir.

---

**[CSS] Aucune classe page-spécifique — un composant = un nom = utilisé partout** — *5 avril 2026*
> Contexte : les sessions précédentes ont produit `.collection-tile` dans le public et `.collection-carte` dans l'admin pour le même objet visuel.
> Décision : aucune classe page-spécifique. Un composant visuel = un seul nom de classe = utilisé partout dans le site sans exception, public et admin confondus.
> Raison : c'est le problème fondamental du V1 qu'on reproduisait dans le V2.
> Alternative rejetée : classes différentes par contexte — rejeté définitivement.

---

**[CSS] Inventaire des composants obligatoire avant tout code** — *5 avril 2026*
> Contexte : chaque session de code commençait par migrer un fichier sans avoir défini les noms de classes pour l'ensemble du site.
> Décision : avant de toucher au CSS, au HTML ou au JS, dresser l'inventaire complet de tous les composants visuels des deux HTML, proposer un nom unique par composant, valider avec Jean-Claude. Aucun code avant que cette liste soit complète et approuvée.
> Raison : sans cette liste, on recommence le même problème à chaque session.
> Alternative rejetée : nommer les classes au fur et à mesure — rejeté car c'est la source du problème.

---

**[CSS] Cible principale iPad paysage** — *4 avril 2026*
> Contexte : Chantal utilise principalement son iPad pour gérer l'admin.
> Décision : breakpoints — ordi 1200px+, iPad paysage ~1024px, iPad portrait ~768px, iPhone ~390px.
> Raison : optimiser pour l'usage réel de Chantal en premier.

---

## AFFICHAGE

**[AFFICHAGE] Ordre des listes — décision globale** — *3 avril 2026*
> Décision : Collections → rang | Gammes → alpha | Produits → rang collection + gamme alpha + nom alpha | Ingrédients → alpha | Factures → chronologique inversé.
> Raison : cohérence globale. Une décision prise s'applique partout sauf exception documentée ici.

---

**[AFFICHAGE] Filtres en cascade obligatoires** — *3 avril 2026*
> Contexte : les listes de produits affichaient tous les produits sans filtrer par gamme.
> Décision : partout où on choisit un produit dans l'admin : Collection → Gamme → Produit. Obligatoire.
> Raison : Chantal a des produits dans 9 collections et plusieurs gammes par collection. Sans filtre en cascade, l'interface est inutilisable.

---

## NAVIGATION

**[NAV] Groupement de la nav admin V2** — *4 avril 2026*
> Contexte : l'admin V2 a plus de sections que le V1 — besoin de regrouper.
> Décision :
> - Accueil (direct)
> - Catalogue → Collections & Gammes, Produits
> - Achats → Nouvelle facture, Factures, Inventaire ingrédients
> - Production → Fabrication, Ventes, Stock produits
> - Système → INCI, Config, Contenu site, Médiathèque, Site public ↗, Déconnexion
> Raison : regroupement logique par flux de travail.

---

## SECTIONS — FONCTIONNEMENT PAR SECTION

**[SECTION] Accueil — même layout public et admin, contenu différent** — *5 avril 2026*
> Contexte : le V1 avait un accueil admin complètement différent du public — tuiles, classes spécifiques, layout propre.
> Décision : même layout hero + stats + tuiles pour le public et l'admin. Le contenu change : public = nouveaux produits, collections, CTA catalogue. Admin = tâches du jour, alertes stock, raccourcis vers les sections actives.
> Raison : cohérence totale du design system. Un seul composant hero/stats/tuiles, utilisé partout.
> Alternative rejetée : layout admin distinct — rejeté car viole le principe un composant = un nom = partout.

---

**[SECTION] Catalogue — même carte et modal, options supplémentaires pour l'admin** — *5 avril 2026*
> Contexte : public et admin affichaient les produits différemment avec des classes différentes.
> Décision : même grille, même carte, même modal pour public et admin. Dans le modal admin, des boutons Modifier/Supprimer s'ajoutent aux infos produit. Pas de deuxième composant — le même modal avec du contenu conditionnel.
> Raison : un composant = un nom = partout. Le contenu conditionnel est géré par le JS, pas par le CSS.
> Alternative rejetée : modal séparé pour l'admin — rejeté car duplique inutilement.

---

**[SECTION] Contenu du site — éditeur inline** — *5 avril 2026*
> Contexte : le V1 avait une page avec des dizaines de cases à remplir, section par section. Chantal devait faire une translation mentale entre le champ et ce que ça donnait à l'écran.
> Décision : éditeur inline. Chantal voit le site exactement comme ses clients. Elle clique sur un texte ou une photo, ça devient éditable directement là, elle sauvegarde. Pas de cases, pas de page dédiée.
> Raison : naturel, visuel, sans ambiguïté. Ce que Chantal voit = ce que ses clients voient.
> Alternative rejetée : page de cases empilées — rejeté car contre-intuitif et source d'erreurs.

---

**[SECTION] Achats — une seule page au lieu du wizard 3 étapes** — *5 avril 2026*
> Contexte : le V1 avait un wizard en 3 étapes sur 3 panneaux séparés. Trop de clics pour une opération simple.
> Décision : une seule page. Entête de facture en haut, ajout d'items en dessous, total qui se calcule en temps réel, un bouton Finaliser. Tout visible en même temps.
> Raison : plus rapide, moins de clics, tout le contexte visible en même temps.
> Alternative rejetée : wizard 3 étapes — rejeté car exagéré pour une entrée de facture.

---

**[SECTION] Fabrication, inventaire ingrédients, INCI, médiathèque — garder tel quel** — *5 avril 2026*
> Contexte : ces sections n'ont jamais été utilisées en production. Impossible d'évaluer ce qui fonctionne ou non sans usage réel.
> Décision : garder le fonctionnement du V1 pour ces sections. On ajustera à l'usage.
> Raison : pas de données d'usage = pas de décision éclairée possible.

---

**[SECTION] Ventes — à développer** — *5 avril 2026*
> Contexte : la section ventes existe dans le V1 mais n'a jamais été utilisée. Le fonctionnement exact reste à définir.
> Décision : placeholder dans le V2. À développer quand Chantal commence à enregistrer des ventes.
> Raison : construire avant d'avoir des besoins réels = construire la mauvaise chose.

---

**[SECTION] Login — garder tel quel** — *5 avril 2026*
> Contexte : page simple avec mot de passe. Fonctionnel.
> Décision : garder tel quel. Pas une priorité.

---

## APPS SCRIPT

**[GS] getSS() — connexion centrale** — *3 avril 2026*
> Contexte : en V1, SpreadsheetApp.openById() est répété dans chaque fonction.
> Décision : une seule fonction getSS() qui retourne le spreadsheet. Toutes les fonctions l'appellent.
> Raison : changer l'ID = changer à 1 endroit. Moins de risque d'erreur.

---

**[GS] Une fonction par action dans code_v2.gs** — *4 avril 2026*
> Contexte : en V1, la logique métier était mélangée dans doGet et doPost.
> Décision : doGet et doPost = routing seulement. La logique métier est dans des fonctions séparées.
> Raison : lisible, testable, modifiable sans risque.

---

## HTML

**[HTML] Sections admin dans le main — pas en dehors** — *4 avril 2026*
> Contexte : une section avait été placée en dehors du main, causant des problèmes de layout.
> Décision : toutes les sections admin sont dans le main.admin-contenu.
> Raison : le layout admin-layout → admin-contenu gère le scroll et l'overflow.

---

---

## SESSION 2026-04-05 — TRAVAIL SUR style2.css ET index.html

**[CSS] Pas de classes typographiques custom — utiliser le système existant** — *5 avril 2026*
> Contexte : un Claude a créé un bloc `.texte-surtitre`, `.texte-titre`, `.texte-corps`, etc. qui dupliquait exactement `.titre-1` à `.titre-5` et `.texte-1` à `.texte-4` déjà dans style2.css.
> Décision : jamais de classes typographiques custom. Tout passe par `.titre-X`, `.texte-X` et les modificateurs `.em-*`. Si une couleur ou un style manque, ajouter un modificateur.
> Raison : deux systèmes typographiques dans le même fichier = incohérence et maintenance double.
> Alternative rejetée : garder le bloc `.texte-*` — rejeté car violation directe du principe un composant = un nom.

---

**[CSS] Tout ce qui peut être dans le root doit y être** — *5 avril 2026*
> Contexte : des valeurs comme la largeur du logo étaient hardcodées dans les classes.
> Décision : toute valeur susceptible d'être ajustée globalement va dans le root. Exemple : `--logo-w: 325px`, `--gap-contenu: 32px`.
> Raison : changer une valeur = changer à un seul endroit.

---

**[CSS] Nommer par ce qu'est l'élément, pas par où il est** — *5 avril 2026*
> Contexte : tendance à nommer `.hero-logo`, `.hero-stat`, etc. — des noms liés à un emplacement.
> Décision : `.logo` est un logo partout. `.stats` est une rangée de stats partout. `.valeur` est un item numéroté partout.
> Raison : cohérence totale, réutilisabilité maximale.

---

**[CSS] Composants ajoutés à style2.css cette session** — *5 avril 2026*
> `.logo`, `.col-2`, `.col-2-hero`, `.col-contenu`, `.pile`, `.mosaique`, `.photo`, `.section-entete`, `.zone-js`, `.stats`, `.stat-item`, `.valeur`
> Variables root ajoutées : `--logo-w`, `--gap-contenu`
> Note : `.col-2-hero`, `.col-contenu`, `.mosaique` sont en cours de correction — le hero n'est pas encore identique au V1.

---

**[HTML] index.html — section accueil commencée** — *5 avril 2026*
> Structure en place avec les nouvelles classes V2. Les IDs JS sont conservés identiques au V1.
> Correction en attente : le hero (col-2-hero, col-contenu, mosaique) n'est pas visuellement identique au V1.

---

**[MÉTHODE] Livraison par trouve/remplace — un à la fois** — *5 avril 2026*
> Décision : chaque changement CSS ou HTML est livré sous forme de trouve/remplace. Un seul à la fois. Attendre le OK avant le suivant.
> Raison : évite les erreurs de remplacement et permet à Jean-Claude de contrôler chaque changement.

---

*Univers Caresse — Journal des décisions V2-005 — 2026-04-05*

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
> Décision : même repo GitHub, index2.html, style2.css, admin2.js, etc. Bascule = renommer les fichiers quand V2 validé.
> Raison : pas de nouveau repo à gérer, même URL finale, zéro redirect.
> Alternative rejetée : nouveau repo séparé — rejeté car complexité inutile.

---

## DONNÉES

**[DONNÉES] IDs stables au lieu de relations par texte** — *3 avril 2026*
> Contexte : en V1, modifier le nom d'une ligne de produit rend les recettes orphelines — elles perdent leur lien avec la collection/ligne parce que la relation est par texte. Renommer une collection = propager dans 5+ endroits (Recettes, Recettes_Base, collections_secondaires, etc.). Source de bugs constants et de perte de données.
> Décision : IDs lisibles partout — COL-001, LIG-001, REC-001, ING-001, FAC-001, etc.
> Raison : renommer = changer à 1 seul endroit. Lisible dans les sheets Google pour comprendre les relations sans être développeur.
> Alternative rejetée : UUID générés automatiquement — rejeté car illisibles dans les sheets Google.

---

**[DONNÉES] Collections et Lignes dans deux sheets séparées** — *3 avril 2026*
> Contexte : en V1, la sheet Collections mélange collections et lignes — 21 lignes pour 9 collections réelles. Les lignes d'une même collection se répètent avec toutes les infos de la collection.
> Décision : sheet Collections (une ligne par collection) + sheet Lignes (une ligne par ligne, avec collection_id).
> Raison : données normalisées. Ajouter une ligne = ajouter 1 ligne dans Lignes, pas dupliquer toute la collection.
> Alternative rejetée : garder le mélange — rejeté car source de dénormalisation et de propagation de changements.

---

**[DONNÉES] Recettes_Ingredients = sheet séparée** — *3 avril 2026*
> Contexte : en V1, la sheet Recettes répète toutes les infos de la recette pour chaque ingrédient — 576 lignes pour ~75 recettes.
> Décision : sheet Recettes (une ligne par recette) + sheet Recettes_Ingredients (une ligne par ingrédient par recette).
> Raison : données propres, pas de répétition. Modifier une recette = modifier 1 ligne dans Recettes.
> Alternative rejetée : garder la structure actuelle — rejeté car ingérable et source d'erreurs.

---

**[DONNÉES] L'achat = seul point d'entrée pour les ingrédients** — *3 avril 2026*
> Contexte : en V1, on pouvait ajouter des ingrédients directement dans le formulaire recette. Résultat : ingrédients sans prix, sans fournisseur, sans INCI.
> Décision : un ingrédient entre dans le système par un achat ou par la page INCI. Jamais directement dans une recette.
> Raison : garantit que chaque ingrédient a un prix au gramme et une source connue.

---

## CSS

**[CSS] CSS custom plutôt que framework (Tailwind, etc.)** — *3 avril 2026*
> Contexte : faut-il utiliser un framework CSS pour le V2?
> Décision : CSS custom propre avec design system complet dans le root.
> Raison : pas de dépendance externe, contrôle total, cohérence avec l'identité visuelle d'Univers Caresse.
> Alternative rejetée : Tailwind — rejeté car dépendance externe et apprentissage supplémentaire pour rien.

---

**[CSS] Un seul fichier CSS — public et admin partagent les fondations** — *3 avril 2026*
> Contexte : en V1, public et admin utilisent le même fichier style.css mais dérivent l'un de l'autre avec des duplications.
> Décision : un seul style2.css avec sections clairement séparées par commentaires.
> Raison : une modification = un seul endroit. Composants partagés définis une seule fois.

---

## AFFICHAGE

**[AFFICHAGE] Ordre des listes — décision globale** — *3 avril 2026*
> Contexte : à chaque nouvelle conversation, l'ordre des listes devait être redit. Collections pas en ordre de rang, lignes pas en alpha, etc.
> Décision : Collections → rang | Lignes → alpha | Recettes → rang collection + ligne alpha + nom alpha | Ingrédients → alpha | Factures → chronologique inversé.
> Raison : cohérence globale. Une décision prise s'applique partout sauf exception documentée ici.

---

**[AFFICHAGE] Filtres en cascade obligatoires** — *3 avril 2026*
> Contexte : les listes de recettes affichaient tous les produits sans filtrer par ligne, forçant à chercher dans 20+ items.
> Décision : partout où on choisit une recette dans l'admin : Collection → Ligne → Recette. Obligatoire.
> Raison : Chantal a des recettes dans 9 collections et plusieurs lignes par collection. Sans filtre en cascade, l'interface est inutilisable.

---

## APPS SCRIPT

**[GS] getSS() — connexion centrale** — *3 avril 2026*
> Contexte : en V1, SpreadsheetApp.openById() est répété dans chaque fonction — des dizaines de fois le même ID codé en dur.
> Décision : une seule fonction getSS() qui retourne le spreadsheet. Toutes les fonctions l'appellent.
> Raison : changer l'ID = changer à 1 endroit. Moins de risque d'erreur.

---

## HTML

**[HTML] Sections admin dans le main — pas en dehors** — *à documenter quand la raison est confirmée*
> Contexte : une section avait été placée en dehors du main, causant des problèmes de layout.
> Décision : toutes les sections admin sont dans le main.admin-contenu.
> Raison : le layout admin-layout → admin-contenu gère le scroll et l'overflow. Une section en dehors échappe à ce contexte et brise l'affichage.

---

## VOCABULAIRE

**[VOCABULAIRE] Ligne devient Gamme** — *2026-04-04*
> Contexte : "Ligne" faisait trop technique et cuisine. Le mot ne parlait pas naturellement.
> Décision : partout dans le système, admin et public, on utilise "Gamme".
> Raison : plus clair pour Chantal, plus cohérent avec le vocabulaire du commerce.
> Alternative rejetée : garder "Ligne" — rejeté car ambiguë et peu évocatrice.

---

**[VOCABULAIRE] Recette devient Produit** — *2026-04-04*
> Contexte : "Recette" faisait laboratoire et cuisine. Sur le site public surtout, ça sonnait faux.
> Décision : partout dans le système, admin et public, on utilise "Produit".
> Raison : fait moins cuisine, plus cohérent entre l'admin et le public.
> Alternative rejetée : garder "Recette" dans l'admin et "Produit" sur le public — rejeté car deux mots pour la même chose crée de la confusion.

---

**[STRUCTURE] Hiérarchie de base V2 et étiquettes d'affichage** — *2026-04-04*
> Contexte : le V1 avait Collection → Ligne → Recette. Pas de couche intermédiaire pour regrouper des gammes visuellement. Le besoin est apparu concrètement avec LUI → Barbe & Moustache → Savon à barbe / Huile à barbe.
> Décision : structure maître = Collection → Gamme → Produit. Par-dessus, des étiquettes d'affichage optionnelles sur le produit : Collection secondaire et Famille.
> Raison : la création reste simple. L'affichage public est flexible sans polluer la structure de gestion. Famille et collection secondaire sont le même mécanisme — on les applique après la création, pas pendant.
> Alternative rejetée : forcer Famille à la création — rejeté car Chantal ne pense pas en famille quand elle crée, c'est une couche qu'on applique après.

---

**[DONNÉES] Préfixes d'IDs V2** — *2026-04-04*
> Contexte : le V1 avait des IDs incohérents — flottants, timestamps, formats mélangés selon la sheet. Les factures n'étaient pas distinguées par type.
> Décision : COL-001 Collections, FAM-001 Familles, GAM-001 Gammes, PRO-001 Produits, ING-001 Ingrédients, ACH-001 Achats, VEN-001 Ventes, LOT-001 Lots de fabrication.
> Raison : lisible pour un humain dans les sheets, cohérent partout, distingue achats et ventes sans ambiguïté.
> Alternative rejetée : FAC-ACH et FAC-VEN — rejeté car le préfixe FAC est inutile quand le type est déjà dans le préfixe.

---

**[DONNÉES] Liste officielle des sheets V2** — *2026-04-04*
> Contexte : le V1 avait 23 onglets mal ordonnés, sans logique hiérarchique, avec des sheets vides, des doublons et des sheets personnelles mélangées au système.
> Décision : 28 sheets organisées par groupe fonctionnel, dans l'ordre logique de la chaîne.

**Structure de présentation**
1. Collections
2. Gammes
3. Familles

**Produits**
4. Gammes_Base
5. Produits
6. Produits_Ingredients
7. Produits_Formats
8. Emballages

**Médias**
9. Mediatheque

**Chaîne INCI**
10. Scraping_PA
11. Scraping_MH
12. Scraping_Arbressence
13. Scraping_DE
14. Mapping_Fournisseurs
15. Config_INCI
16. Categories_UC
17. Ingredients_UC
18. Ingredients_INCI

**Configuration**
19. Config

**Fournisseurs & Achats**
20. Fournisseurs
21. Formats_Ingredients
22. Achats_Entete
23. Achats_Lignes

**Stock**
24. Stock_Ingredients

**Production**
25. Lots

**Ventes**
26. Ventes_Entete
27. Ventes_Lignes

**Config site**
28. Contenu

> Raison : ordre logique qui suit la chaîne métier — on structure avant de produire, on achète avant de fabriquer, on fabrique avant de vendre.
> Sheets disparues du V1 : Inventaire_ingredients (remplacé par Stock_Ingredients calculé), Copie de Recettes (personnel), Listes (personnel).
> Sheets nouvelles en V2 : Familles, Gammes_Base, Emballages, Fournisseurs, Achats_Entete, Achats_Lignes, Stock_Ingredients, Ventes_Entete, Ventes_Lignes.

---

**[DONNÉES] Colonnes officielles des sheets V2** — *2026-04-04*
> Contexte : le V1 avait des colonnes incohérentes, des relations par texte, des infos dupliquées. En V2 tout est normalisé avec IDs stables.

**Collections** — COL-id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url

**Gammes** — GAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url

**Familles** — FAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url

**Gammes_Base** — GAM-id, ING-id, quantite_g

**Produits** — PRO-id, COL-id, GAM-id, FAM-id, nom, description, desc_emballage, couleur_hex, surgras, nb_unites, cure, instructions, notes, image_url, image_noel_url, statut, collections_secondaires

**Produits_Ingredients** — PRO-id, ING-id, quantite_g

**Produits_Formats** — PRO-id, poids, unite, prix_vente, EMB-id

**Emballages** — EMB-id, nom, type

**Mediatheque** — url, nom, categorie, date_ajout

**Scraping_XX** (même structure pour PA, MH, Arbressence, DE) — Fournisseur, Nom, Catégorie, INCI, Nom_botanique, Partie_plante, Origine, Methode_production, Chemotype, Culture, Composantes_majoritaires, Point_eclair, Bio, Odeur, NPN, Marque, URL, Qualite, Statut, Date_scraping, Texte_brut

**Mapping_Fournisseurs** — Fournisseur, Categorie_fournisseur, Nom_fournisseur, Categorie_UC, Nom_UC, ING-id

**Categories_UC** — CAT-id, nom, date_ajout

**Ingredients_INCI** — ING-id, CAT-id, nom_fournisseur, nom_UC, INCI, nom_botanique, source, note_olfactive, statut, date_ajout

**Config** — type, densite, unite, marge_perte_pct

**Fournisseurs** — FOUR-id, code, nom, site_web, notes

**Formats_Ingredients** — ING-id, contenant, quantite, unite

**Achats_Entete** — ACH-id, date, FOUR-id, sous_total, tps, tvq, livraison, total, facteur_majoration, statut

**Achats_Lignes** — ACH-id, ING-id, format_qte, format_unite, prix_unitaire, prix_par_g, prix_par_g_reel, quantite, prix_total, notes

**Stock_Ingredients** — ING-id, qte_g, prix_par_g_reel, date_derniere_maj

**Lots** — LOT-id, PRO-id, multiplicateur, nb_unites, date_fabrication, date_disponibilite, cout_ingredients, cout_emballages, cout_revient_total, cout_par_unite, statut

**Ventes_Entete** — VEN-id, date, client, total, statut

**Ventes_Lignes** — VEN-id, PRO-id, LOT-id, quantite, prix_unitaire, prix_total

**Contenu** — cle, valeur

> Décisions notables : desc_emballage sur Produits pas sur Produits_Formats. Rang disparu des Produits — tri alphabétique. Config_INCI disparaît — absorbée par Mapping_Fournisseurs. Ingredients_UC absorbée par Ingredients_INCI. Formats_Ingredients sans FOUR-id — format lié à l'ingrédient pas au fournisseur. Stock_Ingredients sans FOUR-id — stock total peu importe la source.

---

*Univers Caresse — Journal des décisions V2 — Démarré le 3 avril 2026*

# ÉTAT DU PROJET — Univers Caresse
Portrait global du site — la vue d'ensemble.
Les règles de travail sont dans METHODE.md. Chaque item en cours a son propre .md.
Refait le 16 juin 2026, allégé le 28 juin 2026, comptabilité ajoutée le 22 juillet 2026.
**Se met à jour à chaque session** (règle 2.9 de METHODE.md).
⚠️ = à confirmer dans les fichiers avant d'agir.

---

## 1. LA CARTE DU PROJET

### 1.1 Les trois étages
- Site public : index.html + js/main.js + js/main-demande.js (coups de cœur)
- Admin : admin/index.html + admin/login.html + js/admin.js (chef d'orchestre) + un js/admin-*.js par section + catalogue-builder.js
- Serveur : Google Sheets + Apps Script (Code.gs). Tout lui parle par appelAPI (lire) et appelAPIPost (écrire, via doPost). Chaque aller-retour = 1 à 3 secondes.

### 1.2 Les tuyaux dans les murs (à vérifier avant TOUT changement)
- CONFIG, appelAPI, appelAPIPost vivent dans main.js → toucher main.js peut briser toute l'admin
- Les JS admin partagent des variables communes (donneesProduits, donneesCollections, listesDropdown, prodCache, squareAppId…) → toucher l'une = impacts ailleurs
- Deux feuilles de style : `style.css` (ancienne) puis `generique.css` (nouvelle, gagne). ⚠️ **Les deux n'ont pas les mêmes noms de couleurs** (`--primary` / `--primaire`, `--beige` / `--sable`…) → règle et tableau complet dans METHODE 1.5b. **Le CSS est gelé** : Chantal le transfère elle-même.
- **Sécurité** : les écritures du serveur exigent une clé admin (`CLE_ADMIN`, vérifiée dans `doPost` contre la liste `ACTIONS_PUBLIQUES`). Le navigateur la garde après la connexion et `appelAPIPost` l'ajoute seul. Les **lectures** restent ouvertes; quelques écritures publiques aussi (demande de coups de cœur, renvoi d'une liste modifiée protégé par le jeton `?cmd=`).
- Code.gs modifié = redéploiement (nouvelle version). HTML/CSS/JS modifié = republier le site
- 🔴 **Le serveur est en DEUX fichiers** : `Code.gs` (≈9 000 lignes, copie locale `codegs.txt`) et un fichier utilitaire (copie locale `utilitairegs.txt` : `getSS`, `toGrammes`, couleurs…). Ils se parlent sans problème — `codegs` appelle `getSS` 187 fois. **Mais deux fonctions du même nom dans deux fichiers = le dernier chargé gagne, en silence.** Un doublon d'`envoyerContact_v2` dormait ainsi (l'ancienne version, texte brut sans `replyTo`) — retiré le 2026-07-22. Avant d'ajouter une fonction, vérifier qu'elle n'existe pas déjà **dans l'autre fichier**.
- Le stock = la zone la plus risquée. Jamais le sortir deux fois. Numéros de facture jamais réutilisés (annuler, pas effacer)
- Lien vente↔commande : la commande connaît sa vente, pas l'inverse
- 🔴 **DEUX PORTES créent une vente** : `finaliserVente_v2` (vente directe) **et** `creerVenteDepuisCommande_v2` (coup de cœur, née « Finalisé »). Avant de brancher quoi que ce soit à la comptabilité ou au stock, **chercher TOUTES les portes**, pas seulement la principale. Ce trou a existé le 2026-07-21 : les coups de cœur n'entraient jamais en comptabilité.
- 🔴 **`.form-panel` est caché par défaut** (`style.css`). Un nouveau panneau ne s'affiche que s'il a la classe `visible`, ou s'il vit dans un des conteneurs listés dans la longue règle de `style.css`. Sinon la page paraît vide.
- 🔴 **`.admin-contenu` a une hauteur fixe qui défile** → une impression normale ne sort que la première page. Pour imprimer, ouvrir une fenêtre propre et imprimer celle-là (voir `imprimerDocumentComptable`).
- Une action de **lecture** peut vivre dans `doPost` quand elle exige la clé admin (ex. `getVenteRemboursable`) → l'appeler avec `appelAPIPost`, pas `appelAPI`.
- Poste Canada est encore en **bac à sable**. 🔴 **Un seul interrupteur** : `const PC_TEST = true;` au premier niveau de `Code.gs` (sorti de `genererEtiquette` le 2026-07-22). L'achat, le prix, l'annulation ET le suivi s'en servent tous — le basculer à `false` fait passer les quatre en production d'un coup. En bac à sable : étiquettes gratuites, suivi bidon, rien de comptabilisé.
- Aucun **déclencheur automatique** dans le projet. Rien ne tourne seul : tout part d'un clic ou de l'ouverture d'une page.

### 1.3 Repères — proposition et coups de cœur
- Page client « modifier » = section-coupdecoeur (jamais le modal), deux zones : #coupdecoeur-commande et #coupdecoeur-bloque (cachée via class="cache")
- Lien client : ?cmd=CMD-XXXX (+ &jeton=… pour la sécurité)

### 1.4 Repères — feuilles Google Sheets
- Commandes_Entete_v2 : cmd_id (1) · date (2) · nom (3) · courriel (4) · téléphone (5) · total (6) · acompte (7) · solde (8) · statut (9) · message (10) · ven_id_lien (11) · code_postal (12) · note_proposition (13) · lien_square (14) · livraison (15) · date_proposition (16) · prénom (17) · rabais (18) · promo_id (19) · type_promo (20) · ⚠️ link_id_square (21, à confirmer) · no_tracage
- Commandes_Lignes_v2 : cmd_id (1) · pro_id (2) · format_poids (3) · format_unite (4) · quantite (5) · prix_unitaire (6) · lots (7) · type_ligne (8) · date_dispo (9)
- Lots_v2 : lot_id · pro_id · date_fabrication · date_disponibilite · nb_unites · … · cout_total (9) · cout_unite (10) · format_poids (12) · format_unite (13) · nb_unites_vendu (15)
- Produits_v2 : pro_id (1) · … · cure (11) · …
- **Ecritures_v2** : id_ligne · date · no_ecriture · compte · libelle · **reference** · debit · credit · notes · beneficiaire
- **Modeles_v2** (modèles récurrents du journal) : modele_id · nom · rythme · prochaine_date · lignes_json
- Colonnes ajoutées en 2026-07 : `Remboursements_Entete_v2` → **ven_id** · `Remboursements_Lignes_v2` → **retour**, **compte**, **prix_plein** · `Commandes_Entete_v2` → **etiquette_prix_lien**, **etiquette_cout**, **etiquette_achat_pin** (trace de l'achat, garde-fou anti double-paiement), **etiquette_remb_lien**, **etiquette_remb_billet**, **livraison_etat**, **livraison_date**, **livraison_maj** (suivi du colis, gardé une fois pour toutes)

### 1.7 La comptabilité (montée les 21-22 juillet 2026)
- **Tout s'inscrit tout seul** : achat, fabrication d'un lot, vente (les deux portes), remboursement, dépôt Square, étiquette Poste Canada.
- **Jamais d'effacement** : toute correction ou suppression inscrit une **contre-passation** (l'inverse). C'est la colonne `reference` qui relie une écriture à sa pièce.
- **Préfixes de référence** : `VEN-` vente · `REM-` remboursement · `ACH-` achat · `LOT-` fabrication · `MAN-` écriture manuelle · `EXP-` étiquette · `po_…` dépôt Square. Chaque préfixe empêche les doublons et permet la contre-passation.
- **Trois pages** : *Gestion comptable* (plan de comptes + alarme de cohérence + rattrapage), *Journal général* (saisie manuelle, modèles récurrents, dépôts Square, frais d'expédition), *Grand livre* (balance de vérification + grand livre, imprimables), plus *Bilan et résultat* (montants cliquables pour voir les transactions).
- **Comptes clés** : 1205 comptant · 1210 Square · 1215 Interac · 1310 inventaire · 2205 Visa · 4005 ventes · 4010 livraison facturée · 4015 rabais · **5001 coût des ventes** (⚠️ pas 5100, qui n'est qu'une section) · 5010 retours invendables · 5205 frais Square · 5210 frais d'expédition.
- **L'alarme** de la page Gestion comptable liste les pièces finalisées sans écriture et les écritures sans pièce. Elle ne répare rien — c'est voulu.

### 1.5 Statuts de commande
*(les 13 statuts réels, dans l'ordre des blocs de la page Commandes — vérifié le 2026-07-22)*
- En attente — demande reçue, aucun stock touché
- **Verrouillée** — posé **automatiquement** quand Chantal ouvre « Créer la proposition », pour que la cliente ne modifie pas sa liste pendant ce temps. Se retire tout seul à la fermeture de l'écran. Une commande qui reste ici = un déverrouillage qui a échoué → bouton « Reprendre la proposition »
- **Modifiée** — la cliente a renvoyé sa liste
- À retravailler — la cliente a modifié sa liste, à reproposer
- En attente de paiement — proposition envoyée, stock sorti
- **Payée — facture à faire** — Square a confirmé le paiement; la facture ne se crée jamais toute seule, Chantal la personnalise
- En attente de réapprovisionnement — la cliente attend que le stock soit prêt
- À expédier — paiement reçu, à envoyer
- **Étiquette prête** — étiquette achetée et imprimée, le colis attend le passage au bureau de poste. **La cliente n'est pas encore avertie** (2026-07-22)
- **À livrer** — livraison en personne, attend la photo de livraison
- **Frais à payer** — frais de livraison refacturés à la cliente, en attente de son paiement
- Terminée — expédiée ou livrée
- Annulée — annulée par la cliente ou par Chantal

### 1.6 Points de couleur (commandes « En attente »)
- Vert — tout est en stock
- Orange — au moins un produit manque mais au moins un est dispo · ou 7 jours sans paiement/réponse
- Rouge — rien n'est dispo · ou 14 jours sans paiement/réponse (priorité)

---

## 2. CE QUI A ÉTÉ DÉCIDÉ

### 2.1 Une seule version
Il y avait deux systèmes d'envoi de proposition emmêlés (un ancien, un neuf). Ils ont été remplacés par UNE seule version (ménage du 16 juin 2026). Il n'en reste qu'une.

### 2.2 L'affichage d'abord
L'écran de proposition doit couvrir toutes les sortes avant de toucher à « ce que le client fait après ».

### 2.3 Trois types par produit
- Prêt → on montre le prix
- À venir → on montre une date (« disponible vers le… »), peu importe la raison
- Pas disponible → info seulement, ni prix ni date

### 2.4 Deux faces, mêmes sections
Le courriel et la page montrent les trois mêmes sections (chacune apparaît seulement si elle contient quelque chose), plus un total et le(s) bouton(s).

### 2.5 Avis d'expédition
Toujours un numéro de suivi. Texto pas automatique (Messages s'ouvre pré-rempli). Numéro gardé dans la feuille. Lien Postes Canada en français.

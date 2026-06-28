# ÉTAT DU PROJET — Univers Caresse
Portrait global du site — la vue d'ensemble.
Les règles de travail sont dans METHODE.md. Chaque item en cours a son propre .md.
Refait le 16 juin 2026, allégé le 28 juin 2026.
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
- Deux feuilles de style : style.css + generique.css, règles parfois en double
- Code.gs modifié = redéploiement (nouvelle version). HTML/CSS/JS modifié = republier le site
- Le stock = la zone la plus risquée. Jamais le sortir deux fois. Numéros de facture jamais réutilisés (annuler, pas effacer)
- Lien vente↔commande : la commande connaît sa vente, pas l'inverse

### 1.3 Repères — proposition et coups de cœur
- Page client « modifier » = section-coupdecoeur (jamais le modal), deux zones : #coupdecoeur-commande et #coupdecoeur-bloque (cachée via class="cache")
- Lien client : ?cmd=CMD-XXXX (+ &jeton=… pour la sécurité)

### 1.4 Repères — feuilles Google Sheets
- Commandes_Entete_v2 : cmd_id (1) · date (2) · nom (3) · courriel (4) · téléphone (5) · total (6) · acompte (7) · solde (8) · statut (9) · message (10) · ven_id_lien (11) · code_postal (12) · note_proposition (13) · lien_square (14) · livraison (15) · date_proposition (16) · prénom (17) · rabais (18) · promo_id (19) · type_promo (20) · ⚠️ link_id_square (21, à confirmer) · no_tracage
- Commandes_Lignes_v2 : cmd_id (1) · pro_id (2) · format_poids (3) · format_unite (4) · quantite (5) · prix_unitaire (6) · lots (7) · type_ligne (8) · date_dispo (9)
- Lots_v2 : lot_id · pro_id · date_fabrication · date_disponibilite · nb_unites · …
- Produits_v2 : pro_id (1) · … · cure (11) · …

### 1.5 Statuts de commande
- En attente — demande reçue, aucun stock touché
- En attente de paiement — proposition envoyée, stock sorti
- À retravailler — le client a modifié sa liste, à reproposer
- En attente de réapprovisionnement — le client attend que le stock soit prêt
- À expédier — paiement reçu, à envoyer
- Terminée — expédiée
- Annulée — annulée par le client ou par Chantal

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

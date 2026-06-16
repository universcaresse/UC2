# ÉTAT DU PROJET — Univers Caresse
Refait le 16 juin 2026, à partir du vrai historique et du vrai code.
Avec METHODE.md, c'est l'un des deux seuls fichiers md du projet.
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
- ⚠️ Deux versions d'envoi de proposition coexistent : envoyerProposition_v2 (ancien, production) et envoyerProposition_V3 (test, là où les blocs ont été bâtis). À fusionner en une seule (voir 3.1)

### 1.4 Repères — feuilles Google Sheets
- Commandes_Entete_v2 : cmd_id (1) · date (2) · nom (3) · courriel (4) · téléphone (5) · total (6) · acompte (7) · solde (8) · statut (9) · message (10) · ven_id_lien (11) · code_postal (12) · note_proposition (13) · lien_square (14) · livraison (15) · date_proposition (16) · prénom (17) · rabais (18) · promo_id (19) · type_promo (20) · ⚠️ link_id_square (21, à confirmer) · no_tracage (ajoutée cette session)
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

## 2. CE QUI EST FAIT (et qui tient)

### 2.1 Sorte 1 — tout en stock : chemin complet fonctionnel
- Demande du site → « En attente » (point vert)
- « Compléter » → lien Square, livraison, rabais, stock des prêts sorti une seule fois → « En attente de paiement »
- Le courriel de proposition part (il plantait avant — réparé)
- Client paie sur Square, revient sur « Merci » (rien ne bouge tout seul)
- « Paiement reçu » → facture créée, stock pas re-sorti → « À expédier »
- « Marquer comme expédiée » → demande le numéro de suivi, l'enregistre, envoie le courriel + ouvre le texto (Messages pré-rempli) avec le lien Postes Canada → « Terminée »

### 2.2 Corrections faites cette session
- Courriel de proposition réparé (des variables déclarées trop bas dans envoyerProposition_V3, remontées au bon endroit)
- Bouton redondant « Voir ma proposition complète » retiré du courriel
- Avis d'expédition bâti au complet : colonne no_tracage, fonction expedierCommande_v2, fonction marquerExpediee, bouton « Marquer comme expédiée » rebranché

### 2.3 Le cœur tient (vérifié dans tout le code)
- Le stock sort la bonne version (prêts seulement), jamais deux fois
- La page client reçoit bien le type de chaque ligne
- La sécurité du lien client (jeton) est solide

---

## 3. CE QUI A ÉTÉ DÉCIDÉ

### 3.1 Une seule version
Deux systèmes d'envoi de proposition sont emmêlés (un ancien, un neuf). On les remplace par UNE seule version, pour de bon. Site mis en pause pour ce chantier.

### 3.2 L'affichage d'abord
L'écran de proposition doit couvrir toutes les sortes avant de toucher à « ce que le client fait après ».

### 3.3 Trois types par produit
- Prêt → on montre le prix
- À venir → on montre une date (« disponible vers le… »), peu importe la raison
- Pas disponible → info seulement, ni prix ni date

### 3.4 Deux faces, mêmes sections
Le courriel et la page montrent les trois mêmes sections (chacune apparaît seulement si elle contient quelque chose), plus un total et le(s) bouton(s).

### 3.5 Avis d'expédition
Toujours un numéro de suivi. Texto pas automatique (Messages s'ouvre pré-rempli). Numéro gardé dans la feuille. Lien Postes Canada en français.

### 3.6 Façon de travailler (rappel)
Une question = une réponse, Chantal décide. Toujours dire où chercher. Un seul collage à la fois. L'arbre des cas avant de bâtir.

---

## 4. CE QUI RESTE À TRANCHER

### 4.1 Bouton « Payer » aux sortes 2 et 3
Met-on un vrai bouton « Payer » pour les produits prêts, pour que le client règle tout de suite ce qui est prêt (total = prêts seulement)? Pas tranché.

### 4.2 Commande entièrement « pas disponible »
Une commande où rien n'est disponible : ce que le client voit. Pas tranché.

---

## 5. CONSTATS D'ÉCHEC

### 5.1 Le plus gros — la mémoire du projet
Chaque session écrivait dans ETAT.md ce qu'elle venait de faire, sans effacer ce qui devenait faux. Le fichier disait deux choses à la fois; le Claude suivant en choisissait une moitié au hasard. C'est ça qui a fait tourner en rond. → D'où ce fichier remis à plat.

### 5.2 Avant ces derniers changements
Impossible d'envoyer une proposition (le courriel plantait), impossible d'en refaire une. Beaucoup de temps passé à définir chaque sorte — et aucune ne fonctionnait de bout en bout.

### 5.3 Deux versions emmêlées
Dans le même fichier, le code appelait tantôt l'ancienne, tantôt la neuve, selon le chemin — imprévisible. (réglé par 3.1)

### 5.4 Faille de fond sous les sortes 2 et 3
Le système ne sait jamais tout seul quand le client a payé (Square envoie un courriel, c'est Chantal qui clique « Paiement reçu »). Les sortes 2 et 3 ont été bâties en supposant le contraire.

### 5.5 Sorte 2 (il manque du stock) — à moitié cassée
« Recevoir ce qui est prêt » expédie sans faire payer, ferme le lien de paiement, et crée une 2e commande inutilisable (quantité 1, prix 0 $).

### 5.6 Sorte 3 (rien de prêt) — morte
La proposition ne part même pas : le code tente de sortir un stock qui n'existe pas, ça échoue, le client ne reçoit rien.

### 5.7 Fausses alertes — à NE PAS « corriger »
Ces points étaient faux : le stock sort la bonne version, la page reçoit bien le type des lignes, la date de proposition est bien écrite. Ne pas les toucher en croyant les réparer.

---

## 6. PLUS TARD (quand les 3 sortes tiennent)
- Ouverture : retirer le drapeau ?test=1, tester une vraie commande de bout en bout, publier
- Confort : vente en un seul voyage, pastille « nouvelles demandes » à l'accueil, paiement Square automatique
- Grand ménage : finir la migration CSS, découper Code.gs par sujet, jeter les vieux fichiers et « Copie »
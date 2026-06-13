# ÉTAT DU PROJET — Univers Caresse
### Mis à jour le 13 juin 2026. Avec METHODE.md, ce sont les deux seuls md du projet.
*(⚠️ = à confirmer dans les fichiers avant d'agir.)*

---

## 1. LA CARTE DU PROJET

### 1.1 Les trois étages
- **Site public** : `index.html` + `js/main.js` + `js/main-demande.js` (coups de cœur)
- **Admin** : `admin/index.html` + `admin/login.html` + `js/admin.js` (chef d'orchestre) + un `js/admin-*.js` par section + `catalogue-builder.js`
- **Serveur** : Google Sheets + Apps Script (`Code.gs`). Tout lui parle par `appelAPI` (lire) et `appelAPIPost` (écrire, traité par `doPost`). Chaque aller-retour = 1 à 3 secondes.

### 1.2 Les tuyaux dans les murs (à vérifier avant TOUT changement)
- `CONFIG`, `appelAPI`, `appelAPIPost` vivent dans `main.js` → toucher `main.js` peut briser toute l'admin
- Les JS admin partagent des variables communes (`donneesProduits`, `donneesCollections`, `listesDropdown`, `prodCache`, `squareAppId`…) → toucher l'une = impacts dans plusieurs fichiers
- Deux feuilles de style : `style.css` + `generique.css`, règles parfois en double
- `Code.gs` modifié = redéploiement (nouvelle version). HTML/CSS/JS modifié = republier le site
- **Le stock = la zone la plus risquée.** Jamais sortir le stock deux fois. Numéros de facture jamais réutilisés (annuler, pas effacer)
- Lien vente↔commande : la commande connaît sa vente, pas l'inverse

### 1.3 Repères techniques — coups de cœur
- Page client « modifier » = `section-coupdecoeur` (jamais le modal), deux zones : `#coupdecoeur-commande` et `#coupdecoeur-bloque` (cachée via `class="cache"`)
- Lien client : `?cmd=CMD-XXXX`
- Harnais de test : `envoyerProposition_v2test` ← dispatcher `envoyerPropositiontest` (petit t) ← bouton « Envoyer au client test ». Envoie à l'adresse de test au lieu du vrai client — tout le reste est identique
- Le courriel de proposition = une seule fonction : `envoyerProposition_v2`

### 1.4 Repères techniques — feuilles Google Sheets
- `Commandes_Entete_v2` : cmd_id (1) · date (2) · nom (3) · courriel (4) · téléphone (5) · total (6) · acompte (7) · solde (8) · statut (9) · message (10) · ven_id_lien (11) · code_postal (12) · note_proposition (13) · lien_square (14) · livraison (15) · date_proposition (16) · prénom (17) · rabais (18) · promo_id (19) · type_promo (20) · **link_id_square (21) — À AJOUTER**
- `Commandes_Lignes_v2` : cmd_id (1) · pro_id (2) · format_poids (3) · format_unite (4) · quantite (5) · prix_unitaire (6) · lots (7) · **type_ligne (8) — À AJOUTER** · **date_dispo (9) — À AJOUTER**
- `Lots_v2` : lot_id · pro_id · date_fabrication · date_disponibilite · nb_unites · …
- `Produits_v2` : pro_id (1) · … · cure (11) · …

### 1.5 Statuts de commande
- **En attente** — demande reçue, aucun stock touché
- **En attente de paiement** — proposition envoyée, stock sorti
- **À retravailler** — le client a modifié sa liste, Chantal doit reproposer
- **En attente de réapprovisionnement** — le client attend que le stock soit prêt
- **À expédier** — paiement reçu, commande à envoyer
- **Terminée** — expédiée
- **Annulée** — annulée par le client ou par Chantal

### 1.6 Points de couleur sur les commandes
- Point **vert** : statut « En attente », j'ai tout en stock
- Point **orange** : statut « En attente », au moins un produit manque mais au moins un est disponible — ou : 7 jours sans paiement/réponse
- Point **rouge** : statut « En attente », rien n'est disponible — ou : 14 jours sans paiement/réponse, priorité

---

## 2. CE QUI EST FAIT ✅

### 2.1 Phase A — Solidifier ce qui sert tous les jours (12 juin 2026)
- Vente aux lignes manquantes : corrigé
- Catalogue bloqué 30 minutes : corrigé
- Erreur ≠ vide dans Ventes et Remboursements : corrigé
- Bouton d'envoi des coups de cœur : vérifié, aucun gel

### 2.2 Coups de cœur — étapes 1 à 6
- Liste, bulle, modal, coordonnées, envoi : fait
- Page « modifier sa commande » : atterrissage, blocage, renvoi → « À retravailler » + courriel à Chantal : fait

### 2.3 CSS
- `generique.css` créé; 4 sections migrées (collections, gammes, familles, univers)

### 2.4 Logique des 3 blocs — rédaction complète (13 juin 2026)
- Bloc 1, Bloc 2, Bloc 3 : documentés en détail dans leurs propres fichiers md
- Toutes les décisions tranchées, essences des textes notées, notes techniques complètes

---

## 3. CORRECTIONS DÉCIDÉES — à appliquer dans le code

1. **Courriel avant texto** : à l'envoi de la proposition, courriel d'abord — texto seulement si le courriel a réussi (`envoyerProposition_v2`)
2. **Garder le link_id Square** : `creerLienPaiementSquare_v2` retourne `payment_link.id` en plus de l'url — à sauvegarder en col 21 de `Commandes_Entete_v2`
3. **Fermer le lien Square** : nouvelle fonction `annulerLienSquare_v2` — appel API Square avec le `link_id`. Déclenché : au retour « Merci » (automatique) + filet au clic « Paiement reçu » + à 14 jours (automatique) + à l'annulation client
4. **Bouton Relancer** : ouvrir un aperçu d'abord, pas envoi direct
5. **Deux nouvelles colonnes** dans `Commandes_Lignes_v2` : col 8 = type_ligne (prêt/temporaire/définitif), col 9 = date_dispo

---

## 4. CE QUI RESTE À CONSTRUIRE — dans l'ordre

### 4.1 Étape 7 — Les boutons du courriel de proposition (bloc 1)
Le harnais de test dort, prêt. C'est la porte d'entrée de toute la boucle client.
- Ajouter les trois portes dans le courriel : Payer / Modifier / J'ai une question
- Chaque bouton mène au bon endroit
- **Textes à écrire** (essence validée, mots exacts à finaliser) :
  - Courriel de proposition
  - Courriel de relance (couvre oubli + hésitation + pépin de paiement, sans accuser)
  - Message de blocage (commande non modifiable) + « Écrivez-nous »
  - Message de confirmation d'annulation vu par le client

### 4.2 Fondation Square
- Sauvegarder le `link_id` à la création du lien (col 21)
- Fonction `annulerLienSquare_v2`
- Sans ça, rien ne peut être fermé automatiquement

### 4.3 Côté admin — nouveaux comportements
- Pastilles orange/rouge calculées à partir de `date_proposition` (col 16)
- Bouton Relancer avec aperçu
- Bouton Annuler au rouge (bloc 1) : remet le stock, passe à « Annulée »
- Écran de complétion étendu (blocs 2 et 3) : marquer chaque ligne temporaire/définitif, dates calculées automatiquement, modifiables à la main

### 4.4 Page unique client (blocs 2 et 3)
- Sections prêts / temporaires / définitifs
- Boutons Garder / Laisser tomber par temporaire
- Boutons principaux visibles seulement quand tous les temporaires ont leur réponse
- Réponses sauvegardées en localStorage par cmd_id
- « Recevoir ce qui est prêt » : paie le prêt, crée la 2e commande pour les gardés, retire les définitifs
- « Attendre » : caduce le lien Square, retire les définitifs, passe à « En attente de réapprovisionnement »
- « Modifier » : conserve les réponses aux temporaires, peut ajouter des produits disponibles
- « J'ai une question » : formulaire Contact pré-rempli

### 4.5 Nouvelles fonctions à créer dans `Code.gs`
- `annulerLienSquare_v2` : ferme un lien Square par son link_id
- `enregistrerReponsesTemporaires` : sauvegarde les réponses garder/laisser tomber par cmd_id
- `recevoirPret` : déclenche le paiement, crée la 2e commande, retire les définitifs, caduce le lien
- `attendreTout` : caduce le lien, retire les définitifs, change le statut
- `creerCommandeLiee` : crée la 2e commande avec lien vers la 1re
- Ajouter « En attente de réapprovisionnement » dans le filtre admin (`admin-commandes.js`)

### 4.6 Textes bloc 2 et 3 (essence validée, mots exacts plus tard)
**Bloc 2**
- Courriel : chaleureux, honnête, trois sections, note sur le stock qui varie
- Confirmation « Recevoir le prêt » : prêt en route, tu recontactes pour le reste
- Confirmation « Attendre » : tu recontactes quand tout est prêt, définitifs retirés avec douceur
- Définitifs retirés : mot doux, sans jugement

**Bloc 3**
- Courriel : plus doux qu'au bloc 2, met en valeur ce qui s'en vient plutôt que ce qui manque
- Confirmation « Attendre » : même ton que bloc 2
- Il a tout laissé tomber : annulation douce, même chemin que bloc 1

---

## 5. PHASE D — L'OUVERTURE 🎉
Quand les blocs 1, 2 et 3 sont construits et testés :
- Retirer le drapeau `?test=1`
- Tester le parcours complet bout en bout (une vraie commande)
- Publier

---

## 6. APRÈS L'OUVERTURE

### 6.1 Le confort (Phase E)
- La vente en un seul voyage (10-15 s → 2-3 s)
- Pastille « nouvelles demandes » à l'accueil admin
- Paiement Square automatique (fini les 4 gestes à la main)
- Vitrine : infos livraison visibles, réseaux sociaux, vitesse des textes d'accueil
- Démarrage admin allégé (charger par section au lieu de 16 d'un coup)

### 6.2 Le grand ménage (Phase F)
- Finir la migration CSS des ~11 sections + rangées d'ingrédients → supprimer les 3 vieilles générations de styles. Fin des « 25 boutons »
- Auditer `admin.js` (styles en dur)
- Découpage de `Code.gs` en fichiers par sujet, si encore souhaité

---

## 7. MÉNAGE DU DOSSIER
**On garde : le code + `METHODE.md` + `ETAT.md` + les 3 blocs md. TOUT autre fichier md ou « Copie » se jette.**
- Jeter `admin/index - Copie.html`
- Jeter tous les anciens md : etat-projet*, logique-coups-de-coeur, md-branche-1b, md-session-coupdecoeur*, handoff-*, brief-*, 1-decoupage-codegs, plan-modifications, uc_coups_de_coeur, INVENTAIRE, ANALYSE, PARCOURS, OUVERTURE

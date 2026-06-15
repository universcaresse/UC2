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
- Harnais de test : `envoyerProposition_v2test` ← dispatcher `envoyerPropositiontest` (petit t) ← bouton « Envoyer au client test ».
- Deux boutons dans l'admin : bouton régulier → `envoyerProposition_v2` (production, ne pas toucher). Bouton test → `envoyerProposition_V3` (c'est là qu'on bâtit les blocs 1-2-3). Envoie à l'adresse de test au lieu du vrai client — tout le reste est identique
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

### 2.5 Bloc 1 — codé (15 juin 2026)
- Trois portes dans le courriel (Payer / Modifier / J'ai une question)
- Prénom du client dans l'accueil du courriel
- Message de blocage avec « Écrivez-nous »
- Bouton « Je ne veux plus donner suite » + page de confirmation + raison facultative
- Fonction `annulerCommandeClient` dans Code.gs
- Pastilles orange/rouge selon le délai (7 / 14 jours)
- Bouton Relancer avec aperçu et mot personnel
- Sauvegarde du `link_id` Square (col 21) + `annulerLienSquare_v2`
- Filet fermeture lien Square au clic « Paiement reçu »
- Avertissement visible si courriel échoue après le texto

### 2.6 Bloc 2 — codé (15 juin 2026)
- Colonnes `type_ligne` (col 8) et `date_dispo` (col 9) dans `Commandes_Lignes_v2`
- Écran de complétion : couleurs vert/orange/rouge par ligne + menu type + date calculée
- `sortirStockCommande_v2` : prêts seulement
- Courriel trois sections (prêts / temporaires / définitifs)
- Page unique client : sections, boutons Garder/Laisser tomber, localStorage
- Fonctions `recevoirPret`, `attendreTout`, `creerCommandeLiee` dans Code.gs
- Statut « En attente de réapprovisionnement » dans le filtre admin

### 2.7 Bloc 3 — couvert (15 juin 2026)
- Aucun code supplémentaire requis — tout est géré par le bloc 2
- Pas de section prêts si vide, pas de bouton « Recevoir ce qui est prêt » si aucun prêt
- Trois portes dans le courriel (Payer / Modifier / J'ai une question)
- Prénom du client dans l'accueil du courriel
- Message de blocage avec « Écrivez-nous »
- Bouton « Je ne veux plus donner suite » + page de confirmation + raison facultative
- Fonction `annulerCommandeClient` dans Code.gs
- Pastilles orange/rouge selon le délai (7 / 14 jours)
- Bouton Relancer avec aperçu et mot personnel
- Sauvegarde du `link_id` Square (col 21) + `annulerLienSquare_v2`
- Filet fermeture lien Square au clic « Paiement reçu »
- Avertissement visible si courriel échoue après le texto

---

## 3. CORRECTIONS DÉCIDÉES — à appliquer dans le code

1. **Courriel avant texto** : à l'envoi de la proposition, courriel d'abord — texto seulement si le courriel a réussi (`envoyerProposition_v2`)
2. **Garder le link_id Square** : `creerLienPaiementSquare_v2` retourne `payment_link.id` en plus de l'url — à sauvegarder en col 21 de `Commandes_Entete_v2`
3. **Fermer le lien Square** : nouvelle fonction `annulerLienSquare_v2` — appel API Square avec le `link_id`. Déclenché : au retour « Merci » (automatique) + filet au clic « Paiement reçu » + à 14 jours (automatique) + à l'annulation client
4. **Bouton Relancer** : ouvrir un aperçu d'abord, pas envoi direct
5. **Deux nouvelles colonnes** dans `Commandes_Lignes_v2` : col 8 = type_ligne (prêt/temporaire/définitif), col 9 = date_dispo

---

## 4. CE QUI RESTE À CONSTRUIRE

### 4.1 — Coder le bloc 1
Selon `bloc1-jai-tout.md` — référence unique.

### 4.2 — Coder le bloc 2
Selon `bloc2-il-manque-du-stock.md` — référence unique.

### 4.3 — Coder le bloc 3
Selon `bloc3.md` — référence unique.

### 4.4 — Après les 3 blocs
- Sauvegarder le `link_id` Square à la création (col 21)
- Fonction `annulerLienSquare_v2`
- Courriel avant texto à l'envoi de la proposition
- Pastilles orange/rouge calculées à partir de `date_proposition`
- Bouton Relancer avec aperçu avant envoi
- Deux nouvelles colonnes dans `Commandes_Lignes_v2` : col 8 = type_ligne, col 9 = date_dispo

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

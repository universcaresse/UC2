# REPRISE — page « coup de cœur »

Coller au début d'une nouvelle conversation, avec : `index.html`, `main-demande.js`, `main.js`, `coge.gs` + `commande.gs` (le backend).

---

## ⚠ COMMENT TRAVAILLER AVEC MOI (lire en premier, respecter à la lettre)
- **Sois bref.** Pas d'analyse déroulée. Le code ne m'intéresse pas — ne me l'explique pas.
- **Un seul changement à la fois**, en format **« Trouve ceci » / « Remplace par ceci »**. Puis tu attends mon **OK**.
- Pour chaque trouve/remplace, **indique le nom du FICHIER** (pas le nom de la fonction).
- **Ne me refais JAMAIS répéter** ce qui est déjà écrit ci-dessous : c'est décidé.
- **Pas de question dont la réponse est déjà ici.** Si tu dois vraiment demander, **une seule** question claire.
- Aucun code sans mon OK. On ne bâtit pas sur une supposition : si tu as besoin d'un fichier, demande-le **en une phrase**.
- Je ne teste pas chaque bloc (publier + attendre le commit est long) — on enchaîne, je publie une fois.

---

## ÉTAT EXACT (ce qui marche / ce qui reste)
- Backend `getCommandePublique_v2` : **fonctionne**, ligne dans `doPost`, déployé. Renvoie `{ success, statut, lignes }` — lignes enrichies (nom, photo, gamme, collection). Aucune donnée personnelle.
- Front (`main-demande.js`, bloc « Étape 3 ») : au chargement avec `?cmd=CMD-XXXX`, lit la commande via `appelAPIPost('getCommandePublique', { cmd_id })`. **Plus de modal** — tout se passe dans la page `section-coupdecoeur`.
  - Statut ≠ « En attente de paiement » → vide la liste locale + message **« Cette commande ne peut plus être modifiée. »** + bouton **Fermer** dans `#coupdecoeur-bloque`.
  - Statut modifiable → affiche la commande dans `#coupdecoeur-commande` : produits, **+/−**, **Retirer**, total recalculé, bouton **Renvoyer ma liste**. Si tout est retiré → message + Fermer.
- Étapes 1 et 2 (coquille `section-coupdecoeur`, lecture du `?cmd=`) : **faites**.

## ÉTAPE 6 — RENVOI DE LA LISTE MODIFIÉE : **codée (à tester en ligne)**
- Front : bouton **« Renvoyer ma liste »** → `appelAPIPost('renvoyerListeCoupdecoeur', { cmd_id, lignes })` → écran de remerciement.
- Backend (dans `coge.gs`) : nouvelle fonction `renvoyerListeCoupdecoeur_v2(data)` + ligne ajoutée dans `doPost`.
  - Remplace les lignes de la commande, recalcule total + solde, passe le statut à **« À retravailler »**.
  - **Garde le gel** du stock (ne touche pas aux lots) et **n'appelle PAS** `envoyerDemandeCommande`.
  - **Avertit Chantal par courriel** (`universcaresse@outlook.com`) avec le détail de la nouvelle liste.
- ⚠ À faire avant de tester : **publier** le site + **redéployer Apps Script (nouvelle version)**.

## CE QU'IL RESTE À CODER
- **Étape 7 (dernier)** — boutons dans le courriel de proposition (« Modifier ou annuler », « J'ai une question »). Harnais test déjà prêt (voir repères).

## DÉCISIONS DÉJÀ PRISES (ne pas re-demander)
- **Une seule page d'atterrissage** = `section-coupdecoeur`. **Jamais le modal** pour ce parcours.
- Message unique pour tout statut non modifiable : **« Cette commande ne peut plus être modifiée. »**
- Modifiable **seulement** si statut = « En attente de paiement ».
- Liste renvoyée → statut **« À retravailler »**, gel conservé, courriel à Chantal.
- Numéro dans le lien : `?cmd=CMD-XXXX`.
- Le courriel de proposition = **une seule fonction** (`envoyerProposition_v2`). La page = **une seule page** qui contient tout. (Boutons du courriel = étape 7.)

## EN SUSPENS (pas maintenant)
- Nom du statut « à refaire » (#2/#3).
- Côté admin (Chantal) : deux versions côte à côte, écran de préparation, statuts au tableau.

## REPÈRES TECHNIQUES
- Front public ↔ serveur via **`appelAPIPost(action, data)`** (POST → traité par `doPost` dans `coge.gs`).
- `section-coupdecoeur` contient deux zones : `#coupdecoeur-commande` (la commande) et `#coupdecoeur-bloque` (message « plus modifiable » + Fermer, cachée par défaut via `class="cache"`).
- Entête commande (`Commandes_Entete_v2`), colonnes utiles : total = col 6, acompte = col 7, solde = col 8, statut = col 9, message = col 10, code_postal = col 12, prénom = col 17.
- Harnais test du courriel (étape 7) : copie `envoyerProposition_v2test`, bouton « Envoyer au client test » → front `envoyerPropositionTest` → dispatcher `envoyerPropositiontest` (**petit t**) → `envoyerProposition_v2test`. Fonctionne, en dormance.
- Tout changement dans le backend ne s'applique en ligne qu'après **redéploiement (nouvelle version)**.

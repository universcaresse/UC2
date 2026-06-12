# ÉTAT DU PROJET — Univers Caresse
### Ce qui est fait, ce qui est en cours, ce qu'il reste à faire
*(Compilé à partir des notes des sessions précédentes — les points marqués « à confirmer » doivent être validés par Chantal avant d'agir.)*

--- 

## 1. CHANTIER — Ménage du CSS (réduire et unifier)

### 1.1 Fait
- Base générique des fiches créée : boutons (`.boutons-vert`, `.boutons-rouge`, etc.), bandeaux, bloc central, champs de formulaire, visuel (photos + carré rang).
- 4 sections migrées vers le générique : **collections, gammes, familles, univers**.
- Audit du style en dur dans les JS : les 4 JS de ces sections sont propres (le layout vient du CSS).

### 1.2 En cours / à confirmer
- Une **deuxième vague de renommage** était planifiée (`.fiches-titre` → `.titre`, `.fiches-central` → `.central`, etc.). **À confirmer : faite ou non?**
- Gammes : les rangées d'ingrédients (`ingredient-rangee`, `ing-*`) pas migrées — classes partagées avec Produits.

### 1.3 Reste à faire
- Migrer les ~11 autres sections vers le générique (Produits, Factures, Ventes, Commandes, Remboursements, Fabrication, Contenu site, Rédaction, Densités, Promotions, INCI / Médiathèque / Catalogue).
- Créer un générique pour les rangées d'ingrédients (partagé Gammes + Produits).
- **Ménage final** : supprimer les anciens blocs CSS orphelins (`.fiche-*`, `.form-panel*`, `.form-groupe`, `.bouton*`, `.photo-preview`, etc.) quand plus rien ne les utilise.
- Auditer `admin.js` pour les styles de mise en page en dur (jamais fait).

---

## 2. CHANTIER — Coups de cœur (site public, derrière le drapeau `?test=1`)

### 2.1 Fait
- Étapes 1 à 6 : fondations (`main-demande.js`), cases dans la fiche produit, cœur sur les cartes, bulle compteur, modal de la liste, formulaire de coordonnées, envoi de la demande. *(D'après la note la plus récente, seule l'étape 7 restait.)*
- Côté client « modifier sa commande » : page d'atterrissage `section-coupdecoeur`, lien `?cmd=CMD-XXXX`, blocage si la commande n'est plus modifiable, renvoi de liste → statut « À retravailler » + courriel à Chantal.

### 2.2 Reste à faire
- **Étape 7 (la dernière)** : boutons dans le courriel de proposition (« Modifier ou annuler », « J'ai une question »). Le harnais de test du courriel est déjà prêt et en dormance.
- Retirer le drapeau `?test=1` quand tout sera validé (mise en ligne réelle).
- Textes à finaliser : message « plus modifiable », courriel de confirmation client, texte explicatif de la liste.

---

## 3. CHANTIER — Commandes côté admin (Chantal)

### 3.1 Fait
- Flux complet : En attente → Compléter (sortie de stock + proposition courriel/texto) → En attente de paiement → Paiement reçu (crée la vente) → À expédier → Terminée.
- Mode de paiement à confirmer (Square / Interac / comptant) — fait et testé.
- Annulation après sortie de stock → retour du stock : `remettreStockCommande_v2`. **À confirmer : terminé?**

### 3.2 Reste à faire (les « si », un à la fois, au rythme de Chantal)
- Modifier les produits d'une commande après l'envoi de la proposition. **À confirmer : terminé ou en cours?**
- Côté admin des nouveaux parcours client : voir les **deux versions côte à côte** (commande d'origine vs liste modifiée), écran de préparation, nouveaux statuts au tableau.
- Choisir le nom du statut « à refaire » (À fabriquer? À refaire?).
- Pastille orange (stock partiel) — quoi faire?
- Pastille rouge (rien en stock) — la commande reste « En attente ».
- Bouton **Rappel** quand la cliente ne répond pas (reco : noter seulement la date du dernier rappel).
- Corriger et renvoyer la proposition après le 1ᵉʳ envoi (coordonnées seulement).

### 3.3 Améliorations futures (notées, pas pour maintenant)
- Pastille de stock directement sur la liste des commandes.
- Pastille de rappel échu sur la commande.
- Paiement Square automatique (au lieu du clic manuel « Payée »).

---

## 4. CHANTIER — Back-end (`Code.gs`)

### 4.1 Plan existant
- Un plan de **découpage de Code.gs en ~17 fichiers** (Routeur, Utilitaires, Commandes, Ventes, Courriels, etc.) est écrit. **À confirmer : commencé ou non?**

### 4.2 Drapeaux techniques (notés, PAS résolus)
- **Square** : le système garde seulement l'URL du lien de paiement, pas son identifiant. Il faut l'identifiant pour pouvoir **fermer** un vieux lien quand le client modifie ou annule.
- **Numéros séquentiels** : effacer une vente pourrait faire réutiliser un numéro (problème fiscal). Règle : annuler sans effacer.
- **Lien vente → commande** : la commande connaît sa vente, mais pas l'inverse. À ajouter si on veut le lien des deux bords.
- **Le stock = la zone la plus risquée.** Ne jamais sortir le stock deux fois. Tout chantier qui touche l'inventaire se fait lentement, un trouve-et-remplace à la fois.

---

## 5. CHANTIER — Analyse approfondie (nouveau, demandé par Chantal)

Objectif : le projet est gros et instable parce que plusieurs sessions s'y sont succédé. Plan convenu :

5.1 **Inventaire** — carte complète des fichiers, leur grosseur, qui parle à qui.
5.2 **Doublons et poids mort** — CSS orphelin, fonctions en double, code jamais appelé.
5.3 **Stabilité** — repérer les fragilités : classes injectées par le JS qui n'existent plus dans le CSS, données manquantes qui font planter l'affichage.
5.4 **Rapport** — constat clair en mots simples, priorités de nettoyage. Aucune correction sans OK.

Statut : **pas commencé** — les deux documents de référence (MÉTHODE et ÉTAT) passent en premier.

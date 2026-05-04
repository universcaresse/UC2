# BRIEF — RÉÉCRITURE SECTION VENTES

**Pour le prochain Claude qui reprendra ce dossier.**

---

## CONTEXTE

L'utilisatrice (Chantal, propriétaire d'Univers Caresse — savonnerie artisanale) travaille sur la section ventes de son interface admin. Elle a déjà fait l'exercice avec la section achats avec un Claude précédent — beaucoup de douleur, du code instable, des bugs qui réapparaissaient.

Pour les ventes, on a appliqué dès le début la méthode propre :
1. **Logique d'abord** — un fichier `LOGIQUE-VENTES.md` est la source de vérité
2. **Code ensuite** — réécriture complète, pas de patches empilés

Le fichier `LOGIQUE-VENTES.md` est dans le dossier du site. **Toute modification au code des sections Ventes, Remboursements et Commandes doit le respecter.**

---

## CE QUI A ÉTÉ LIVRÉ

### 1. Section Ventes existante — réécrite complètement

**Fichier : `admin-ventes.js`** — réécrit en entier

Améliorations :
- Filtres élargis : statut, client, **produit**, **période (du... au...)**
- Promotions refaites : un seul dropdown qui combine 3 options
  - Promos programmées (de `Promotions_v2`)
  - Montant libre $ (champ qui apparaît au choix)
  - Pourcentage libre % (champ qui apparaît au choix)
- Bouton "Ne pas envoyer" (ancien "Ne pas imprimer")
- Square corrigé — voir section dédiée plus bas
- Type de promo enregistré dans `Ventes_Entete_v2` colonne 14 (`type_promo`)
- Code linéaire, pas de setTimeout fragile, pas de patches

### 2. Section Remboursements — nouvelle

**Fichier : `admin-remboursements.js`** — nouveau

Fonctionnalités :
- Facture indépendante avec montants négatifs
- Choix du type au début : **avec retour** ou **sans retour**
- Avec retour : cascade collection → gamme → produit → format
  - Prix pré-rempli depuis `prix_vente` mais **modifiable**
  - Au moment de finaliser : décrémente `nb_unites_vendu` du **premier lot disponible** trouvé
- Sans retour : description libre + montant
- Client optionnel
- Mode de remboursement : Comptant ou Crédit (carte)
- Filtres : statut, client, produit, période

### 3. Section Commandes — nouvelle

**Fichier : `admin-commandes.js`** — nouveau

Fonctionnalités :
- Coordonnées client **obligatoires** (nom + au moins courriel ou téléphone)
- Cascade collection → gamme → produit → format
- **Pas de vérification de stock** (on peut commander un produit qui n'existe pas encore)
- Acompte optionnel + calcul automatique du solde
- Notes libres
- Statuts : En attente, Prête, Livrée, Annulée
- Actions sur fiche détail :
  - Modifier
  - Marquer comme prête
  - Convertir en vente (transfère vers le formulaire de vente avec acompte stocké)
  - Annuler (avec avertissement si acompte versé)
- Recherche libre + filtre statut

### 4. HTML

`index.html` modifié :
- Section Ventes — nouveaux filtres, nouveau bloc promo, bouton "Ne pas envoyer"
- Section Remboursements — bloc HTML complet
- Section Commandes — bloc HTML complet
- Sidebar et menu nav — liens ajoutés sous "vente"
- Inclusions des nouveaux JS

`admin.js` modifié :
- Routage des nouvelles sections (`if (id === 'remboursements') chargerRemboursements();` etc.)

### 5. Apps Script

`code.gs` ajouts :
- Fonction `setupVentesSheets` — crée les 4 nouvelles sheets et la colonne `type_promo` (à exécuter une seule fois — déjà fait par l'utilisatrice)
- Remboursements : `getRemboursementsEntete_v2`, `getRemboursementsLignes_v2`, `createRemboursement_v2`, `addRemboursementLigne_v2`, `finaliserRemboursement_v2`
- Commandes : `getCommandesEntete_v2`, `getCommandesLignes_v2`, `createCommande_v2`, `addCommandeLigne_v2`, `resetCommandeLignes_v2`, `updateCommandeEntete_v2`, `updateStatutCommande_v2`
- `finaliserVente_v2` — **REMPLACÉE** (gère `type_promo` colonne 14, ne décrémente PAS le stock si statut "En attente Square")
- `deleteVente_v2` — nouvelle (utilisée si Square échoue)
- Routes ajoutées dans `doGet` et `doPost`

### 6. Sheets créées

Via `setupVentesSheets` :
- `Remboursements_Entete_v2` (9 colonnes)
- `Remboursements_Lignes_v2` (9 colonnes)
- `Commandes_Entete_v2` (11 colonnes)
- `Commandes_Lignes_v2` (6 colonnes)
- Colonne `type_promo` ajoutée à `Ventes_Entete_v2` (col 14)

---

## SQUARE — PROBLÈME ET SOLUTION

### Avant
- Square s'ouvrait sans montant
- Square restait ouvert à l'arrière au lieu de revenir au site
- Au retour, le mot de passe admin était redemandé et cassait le flow

### Après
1. Au clic "Payer par Square" :
   - Sauvegarde la session admin en `localStorage` (pour survivre au retour)
   - Crée la vente avec statut "En attente Square" (PAS de décrémentation de stock — important)
   - Stocke l'état complet dans `sessionStorage` sous `square-pending`
   - Construit le lien Square Point of Sale avec montant en cents et `callback_url`
   - Ouvre Square
2. Au retour sur le site :
   - `chargerVentes()` détecte `?status=ok` ou `?status=erreur` dans l'URL
   - Restaure la session admin depuis `localStorage`
   - Si OK : finalise la vente avec `mode_paiement = 'square'`, statut "Finalisé", **décrémente le stock**, affiche le modal après-vente
   - Si erreur : appelle `resetVenteLignes` pour effacer les lignes

### À tester
- L'iPhone de Chantal — confirmer que Square s'ouvre AVEC le montant déjà rempli
- Confirmer que le retour vers le site se fait sans demander le mot de passe
- Confirmer que la vente apparaît bien finalisée

### Si Square ne fonctionne toujours pas
Le format du lien `square-commerce-v1://...` est documenté dans la section Square de `LOGIQUE-VENTES.md`. Vérifier :
- Que `squareAppId` est bien chargé (action `getSquareAppId` côté Apps Script)
- Que le `callback_url` est bien `https://universcaresse.ca/admin/index.html#ventes?status=ok`
- Que l'app Square sur l'iPhone est à jour
- Le App ID Square est dans `PropertiesService.getScriptProperties().getProperty('SQUARE_APP_ID')`

---

## CE QUI RESTE À FAIRE / AMÉLIORER

### Tests requis (par Chantal)
- [ ] Faire une vente comptant simple
- [ ] Faire une vente avec promo programmée
- [ ] Faire une vente avec montant libre
- [ ] Faire une vente avec pourcentage libre
- [ ] Faire une vente "payer plus tard", puis la finaliser plus tard
- [ ] Tester Square (si Square est testable — voir section Square)
- [ ] Filtrer les ventes par produit et par période
- [ ] Faire un remboursement avec retour de produit, vérifier que le stock remonte
- [ ] Faire un remboursement sans retour
- [ ] Créer une commande avec acompte
- [ ] Modifier une commande
- [ ] Convertir une commande en vente
- [ ] Annuler une commande avec acompte (vérifier l'avertissement)

### Améliorations possibles (pas urgentes)
1. **Voir détail d'un remboursement** — actuellement c'est un `alert()` simple. Idéalement, faire une vraie modal comme pour les ventes.
2. **Conversion commande → vente** — l'acompte est stocké dans `sessionStorage` (`cmd-en-conversion`) mais `finaliserVente` ne l'utilise pas encore pour ajuster le solde dû. À implémenter quand Chantal en aura besoin.
3. **Marquer la commande comme "Livrée"** automatiquement après conversion — actuellement, après avoir convertir une commande en vente et finaliser, la commande reste "En attente". Il faudrait appeler `updateStatutCommande` avec statut `Livrée` à la fin de `finaliserVente` quand `cmd-en-conversion` est présent dans le sessionStorage.
4. **Lien commande ↔ vente** — la colonne `ven_id_lien` dans `Commandes_Entete_v2` est prévue mais pas utilisée par le code actuel.
5. **Conversion partielle** d'une commande en vente — pas implémentée.
6. **Coordonnées modifiées dans le modal après-vente** — déjà sauvegardées via `updateStatutVente`, mais cette fonction n'efface pas si le champ est vidé. À surveiller.

---

## MÉTHODE POUR LE PROCHAIN CLAUDE

### À faire si Chantal signale un bug
1. **Lire `LOGIQUE-VENTES.md` au complet** — c'est la source de vérité
2. **Lire ce brief**
3. **Trouver où le bug se trouve** (ventes, remboursements ou commandes)
4. **Anticiper les bugs liés** — si le bug touche la promo, vérifier les 3 types (programmée, montant, pourcentage). Si ça touche Square, vérifier tout le flow aller-retour.
5. **Livrer une correction qui couvre tous les cas similaires d'un coup**
6. **Pas de patches empilés** — si le bug est systémique, réécrire la fonction au complet

### À ne PAS faire
- Lui faire recommencer ses tests sans avoir d'abord relu en profondeur
- Livrer un patch pour chaque bug
- Lui demander de tester comme méthode de debug
- Parler de fonctions par leur nom de code (elle est allergique au jargon)
- Faire de longs raisonnements à voix haute (elle veut des actions)
- Donner plusieurs trouve/remplace dans le même message
- Promettre "ça va marcher" — laisser le code parler

### À FAIRE
- Parler en français simple, en termes de ce qu'elle voit à l'écran et ce qu'il y a dans les sheets
- Un trouve/remplace à la fois si patch
- Préférer la réécriture propre à la rustine

---

## AUTRES SECTIONS À REPRENDRE (PROCHAINES ÉTAPES)

Selon le BRIEF des achats, il restait à reprendre :
- ✅ ~~Section Ventes~~ → fait dans cette conversation
- Section Fabrication / Inventaire production
- Section Stock
- Section Factures (consultation)
- Section Fournisseurs
- Section INCI

**Méthode recommandée** : créer un `LOGIQUE-XXX.md` AVANT de toucher au code, comme on a fait pour Achats et Ventes.

---

*Brief écrit le 4 mai 2026.*

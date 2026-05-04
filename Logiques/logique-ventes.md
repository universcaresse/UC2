# UNIVERS CARESSE — LOGIQUE DE LA SECTION VENTES

**Document de référence** — toute modification au code des sections Ventes, Remboursements et Commandes doit respecter cette logique.

---

## SHEETS UTILISÉES

### Existantes (Ventes)
| Sheet | Rôle |
|---|---|
| `Ventes_Entete_v2` | En-tête des ventes (date, client, total, statut, paiement, promo, livraison) |
| `Ventes_Lignes_v2` | Lignes des ventes (produit, lot, quantité, prix) |
| `Lots_v2` | Lots de production (nb_unites, nb_unites_vendu) |
| `Produits_v2` | Produits |
| `Produits_Formats_v2` | Formats des produits avec prix de vente |
| `Promotions_v2` | Promotions disponibles |
| `Collections_v2`, `Gammes_v2`, `Familles_v2` | Pour filtrer les produits |

### Nouvelles (à créer)
| Sheet | Rôle |
|---|---|
| `Remboursements_Entete_v2` | En-tête des remboursements |
| `Remboursements_Lignes_v2` | Lignes des remboursements |
| `Commandes_Entete_v2` | En-tête des commandes (client, statut, acompte, solde) |
| `Commandes_Lignes_v2` | Lignes des commandes (produit, quantité, prix prévu) |

---

## RÈGLES TRANSVERSALES

- Une **vente** diminue `nb_unites_vendu` dans le lot correspondant
- Un **remboursement** *avec retour de produit* augmente le stock du lot (peu importe lequel — n'importe quel lot disponible du même produit/format)
- Un **remboursement** *sans retour* n'affecte pas le stock — seulement la comptabilité
- Une **commande** n'affecte pas le stock tant qu'elle n'est pas convertie en vente
- Les commandes et remboursements sont dans des **sections séparées** des ventes
- Tous les montants se calculent en direct dans l'interface

---

# 1. VENTES

## 1.1 OUVERTURE DE LA PAGE VENTES

→ Afficher la liste des ventes existantes avec filtres :
- Statut
- Recherche par client
- Recherche par produit
- Période (date du... au...)

→ Bouton **[+ Nouvelle vente]**

---

## 1.2 NOUVELLE VENTE

### Saisie d'un item

Cascade : **Collection → Gamme → Produit → Format → Quantité**

- Le prix unitaire vient de `Produits_Formats_v2.prix_vente` (auto-rempli, non modifiable)
- Le format affiche le **nombre disponible** (calculé depuis les lots dispos)
- Bouton **[+ Ajouter]** → ajoute la ligne au panier

**SI** la quantité demandée > stock disponible
→ refuser et afficher "Stock insuffisant — X disponible(s)"

**FIN DE SI**

### Panier

- Affiche chaque ligne avec quantité, prix, total
- Possibilité de **supprimer** une ligne (✕)
- Sous-total recalculé en direct

### Promotion

Liste filtrée selon le contenu du panier (voir section 1.5).

- Promo **applicable** → ✅ rabais appliqué
- Promo **presque** atteinte → 🔜 message d'encouragement (pas de rabais)
- **Aucune** → pas de rabais

### Livraison

Champ libre en $. Total recalculé en direct = sous-total + livraison − rabais.

### Client (optionnel)

- Nom
- Courriel
- Téléphone
- Case à cocher "Autorisation infolettre"

### Bouton [Voir la facture]

→ Ouvre l'aperçu de la facture (modal)

---

## 1.3 APERÇU DE LA FACTURE

Affiche la facture telle qu'elle sera vue/envoyée.

### Boutons de paiement

- **[Payer par Square]** → voir section 1.4
- **[Comptant]** → finalise la vente avec `mode_paiement = 'argent'`
- **[Payer plus tard]** → finalise la vente avec `mode_paiement = 'plus-tard'` et `statut = 'a-payer'`

### Boutons d'impression / envoi

- **[Imprimer / PDF]**
- **[Envoyer par courriel]**
- **[Envoyer par texto]**

---

## 1.4 PAIEMENT PAR SQUARE

### Comportement voulu

1. Au clic sur **[Payer par Square]** :
   - Sauvegarder la vente avec statut **"En attente Square"**
   - Construire le lien Square avec le **montant total** déjà rempli
   - Stocker l'identifiant de la vente dans `sessionStorage` (clé : `square-pending`)
   - Ouvrir le lien Square (l'app Square s'ouvre sur l'iPhone)

2. Le client pose sa carte sur Square → paiement traité

3. Square retourne automatiquement vers le site sur la page ventes avec `?status=ok` (ou `?status=erreur` si paiement refusé)

4. Au retour sur le site :
   - Lire `square-pending` du `sessionStorage`
   - Récupérer la vente "En attente Square"
   - **SI** retour `ok` → finaliser la vente avec `mode_paiement = 'square'` et `statut = 'Finalisé'`, puis afficher la facture pour impression/envoi
   - **SI** retour `erreur` → effacer la vente "En attente Square" et afficher un message d'erreur
   - Effacer `square-pending`

### Format du lien Square (point of sale)

```
square-commerce-v1://payment/create?data=<JSON encodé URL>
```

Le JSON contient :
- `amount_money` : { amount : <total en cents>, currency_code : "CAD" }
- `callback_url` : URL de retour sur le site (page ventes avec `?status=ok`)
- `client_id` : le App ID Square
- `version` : "1.3"
- `notes` : numéro de la vente
- `options` : { supported_tender_types : ["CREDIT_CARD"] }

---

## 1.5 PROMOTIONS / RABAIS

Une seule promo ou rabais possible par vente — l'un OU l'autre, jamais les deux ensemble.

### Interface : un seul dropdown qui combine

1. **Les promotions programmées** (de la sheet `Promotions_v2`) avec leur statut :
   - ✅ **applicable** → rabais sera appliqué
   - 🔜 **presque** (manque X) → si le panier est à `quantite_seuil` items du seuil
2. **Montant libre $** — au choix de cette option, un champ apparaît pour entrer un montant en dollars (ex : 5,00 $)
3. **Pourcentage libre %** — au choix de cette option, un champ apparaît pour entrer un % (ex : 10 %)

Le rabais final s'applique sur le sous-total et est affiché dans la facture comme :
- Promo programmée → "Rabais — [nom de la promo]"
- Montant libre → "Rabais"
- Pourcentage libre → "Rabais (X %)"

### Types de promotions programmées

Quatre types dans `Promotions_v2` :

| Type | Logique |
|---|---|
| `qte_produit` | Si N exemplaires d'un même produit → rabais $X par exemplaire |
| `qte_panier` | Si N items au total → rabais % sur le sous-total |
| `lot_complet` | Si on achète un format en quantité = nb_unites de ce format → rabais % |
| `ensemble_famille` | Si on achète au moins un produit de chaque produit d'une famille → rabais % |

---

## 1.6 APRÈS-VENTE

Modal qui s'ouvre une fois la vente finalisée.

- Pré-rempli avec le courriel et le téléphone du client (si fournis)
- Boutons : **[Imprimer / PDF]**, **[Envoyer par courriel]**, **[Envoyer par texto]**, **[Ne pas imprimer]**
- Si le courriel ou téléphone est modifié dans ce modal → ils sont sauvegardés dans la vente

---

## 1.7 FINALISATION D'UNE VENTE (TECHNIQUE)

1. Créer ou mettre à jour l'entête dans `Ventes_Entete_v2`
2. Pour chaque ligne du panier → ajouter dans `Ventes_Lignes_v2`
3. Pour chaque ligne → incrémenter `nb_unites_vendu` dans `Lots_v2` du lot correspondant
4. Marquer le statut selon le mode de paiement :
   - `Finalisé` pour comptant ou Square
   - `a-payer` pour "payer plus tard"

---

## 1.8 VOIR / MODIFIER UNE VENTE EXISTANTE

Clic sur une vente dans la liste :
- Ouvre l'aperçu de la facture
- **SI** statut = `a-payer` → boutons de paiement disponibles (pour finaliser le paiement)
- **SI** statut = `Finalisé` → seulement les boutons d'impression / envoi

---

# 2. REMBOURSEMENTS

## 2.1 OUVERTURE DE LA SECTION REMBOURSEMENTS

→ Liste des remboursements existants avec filtres
→ Bouton **[+ Nouveau remboursement]**

---

## 2.2 NOUVEAU REMBOURSEMENT

### Type de remboursement

Choix dès le début :
- **Avec retour de produit** → le stock remonte
- **Sans retour** → juste un montant remboursé, pas d'effet sur le stock

### Saisie d'un item (avec retour de produit)

Même cascade qu'une vente : **Collection → Gamme → Produit → Format → Quantité**

- Le prix unitaire vient automatiquement de `Produits_Formats_v2.prix_vente`
- **Le prix est modifiable** (le montant remboursé peut être différent du prix de vente)
- La quantité représente combien d'unités sont retournées

### Saisie d'un item (sans retour)

- Description libre
- Montant à rembourser (libre)
- Pas de produit, pas de format, pas de lot

### Client (optionnel mais recommandé)

- Nom
- Courriel
- Téléphone

### Total

Affichage en **négatif** (ex : -45,00 $) pour indiquer que c'est un remboursement.

### Bouton [Finaliser le remboursement]

---

## 2.3 FINALISATION D'UN REMBOURSEMENT (TECHNIQUE)

1. Créer l'entête dans `Remboursements_Entete_v2` avec total **négatif**
2. Pour chaque ligne → ajouter dans `Remboursements_Lignes_v2` (quantités et prix négatifs)
3. **SI** type = avec retour :
   - Pour chaque ligne, trouver **n'importe quel lot disponible** du même produit/format dans `Lots_v2`
   - Décrémenter `nb_unites_vendu` du lot trouvé (le produit retourne en stock disponible)
4. **SI** type = sans retour :
   - Pas d'action sur le stock
5. Marquer statut = `Finalisé`

### Mode de remboursement

À choisir au moment de finaliser :
- Comptant
- Crédit (carte) — manuel pour l'instant (pas via Square)

---

# 3. COMMANDES

## 3.1 OUVERTURE DE LA SECTION COMMANDES

→ Liste des commandes existantes avec filtres :
- Champ de recherche libre (cherche dans nom, courriel, téléphone, produit, etc.)
- Statut (en attente, prête, livrée, annulée)

→ Bouton **[+ Nouvelle commande]**

---

## 3.2 NOUVELLE COMMANDE

### Client (OBLIGATOIRE)

- Nom — obligatoire
- Courriel — au moins un des deux obligatoire
- Téléphone — au moins un des deux obligatoire

### Saisie d'un ou plusieurs items

Même cascade qu'une vente : **Collection → Gamme → Produit → Format → Quantité**

Une commande peut contenir un seul item ou plusieurs items (chaque item est ajouté un à la fois au panier de la commande).

- Le prix unitaire vient automatiquement de `Produits_Formats_v2.prix_vente`
- **PAS** de vérification de stock (on peut commander un produit même s'il n'y a plus de stock)

### Acompte (optionnel)

Champ pour entrer un montant d'acompte versé au moment de prendre la commande.

### Notes

Champ libre pour ajouter des précisions (date prévue, demande spéciale, etc.).

### Bouton [Enregistrer la commande]

---

## 3.3 ENREGISTREMENT D'UNE COMMANDE (TECHNIQUE)

1. Créer l'entête dans `Commandes_Entete_v2` avec :
   - Client (nom, courriel, téléphone)
   - Total prévu
   - Acompte versé (peut être 0)
   - Solde à payer = Total − Acompte
   - Statut = `En attente`
   - Notes
2. Pour chaque ligne → ajouter dans `Commandes_Lignes_v2`
3. **PAS** d'action sur le stock

---

## 3.4 VOIR UNE COMMANDE

Clic sur une commande dans la liste → ouvre la fiche détail avec :
- Coordonnées du client
- Liste des produits commandés
- Acompte versé, solde restant
- Notes
- Boutons :
  - **[Modifier la commande]**
  - **[Convertir en vente]**
  - **[Annuler la commande]**

---

## 3.5 MODIFIER UNE COMMANDE

Tant qu'elle n'est pas convertie en vente :
- Ajouter / enlever / modifier des lignes
- Changer la quantité ou le prix
- Modifier l'acompte
- Modifier les coordonnées client
- Sauvegarder

---

## 3.6 CONVERTIR UNE COMMANDE EN VENTE

Clic sur **[Convertir en vente]** :

1. Le panier de la commande est repris dans le formulaire de **vente**
2. Possibilité d'ajuster (ajouter/enlever des produits, modifier les prix, modifier les quantités)
3. **VÉRIFICATION DE STOCK** au moment de la conversion (puisque maintenant on a besoin du produit en vrai)
4. Au moment de finaliser la vente :
   - Le solde à payer = Total final − Acompte déjà versé
   - Choix du paiement : Square, comptant, payer plus tard
5. Une fois la vente finalisée :
   - La commande passe au statut `Livrée`
   - La vente est créée normalement (avec décrémentation du stock des lots)
   - Le lien entre la commande et la vente est conservé (pour traçabilité)

### Si la commande ne peut pas être livrée complète

Possibilité de convertir **partiellement** (livrer ce qui est disponible, garder le reste en commande).

---

## 3.7 ANNULER UNE COMMANDE

Confirmation demandée.

**SI** un acompte a été versé → afficher un avertissement : "Un acompte de X $ a été versé. Le rembourser au client avant d'annuler."

→ Effacer l'entête et toutes les lignes
→ Aucune action sur le stock (puisqu'aucune n'avait été faite)

---

## 3.8 STATUTS DES COMMANDES

| Statut | Sens |
|---|---|
| `En attente` | Commande prise, produit pas encore disponible/livré |
| `Prête` | Le produit est disponible, le client doit venir chercher (statut manuel) |
| `Livrée` | Convertie en vente — fin du parcours |
| `Annulée` | Annulée avant conversion |

---

# 4. NAVIGATION (HTML)

Dans le menu et la sidebar, sous **Vente** :

- nouvelle vente
- les ventes
- **remboursements** ← NOUVEAU
- **commandes** ← NOUVEAU
- inventaire (déjà là)

---

*Document créé le 4 mai 2026. À conserver dans le dossier du site comme référence permanente.*

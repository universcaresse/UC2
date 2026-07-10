# ITEM — Livraison (Poste Canada ou en personne) + facture
### Arbre validé par Chantal le 9 juillet 2026. RIEN N'EST CODÉ.
> Lire `METHODE.md` d'abord. Aucun code sans le OK de Chantal.
> Trouve-et-remplace un seul à la fois, preuve Vérifié/Impacts avant chaque
> proposition. Chantal a dit : **pas de code ce soir**.

---

## 0. LA FAILLE URGENTE — FACTURE D'UN AUTRE CLIENT DANS UN TEXTO

**Constaté par Chantal en test réel :** un texto est parti avec un lien vers
la **facture 0009 d'un autre client**. Le lien était valide — le destinataire
pouvait voir les achats de quelqu'un d'autre.

**Vérifié dans `js/admin-ventes.js` → `envoyerFactureTexto()` :**
- Le numéro vient de la variable globale `venNumeroAffiche`.
- Le jeton vient de `getJetonVente({ ven_id: venIdEnCours })`.
- Ces deux variables ne sont vidées que par `fermerModalApresVente()`. Toute
  autre façon de fermer les fenêtres les laisse sur la vente précédente.
- La fonction ne relit **jamais** la vente avant d'envoyer.

**Vérifié aussi :** `confirmerPaiementCommande()` (js/admin-commandes.js)
n'envoie ni courriel ni texto — il appelle `creerVenteDepuisCommande`,
affiche un message, ferme la fiche. Le texto vient donc forcément de la
fenêtre « Vente enregistrée ✅ » (`modal-apres-vente`).

**Correction décidée (en mots) :** `envoyerFactureTexto()` doit **recevoir le
numéro de la vente en paramètre**, comme les boutons des commandes, au lieu
de le lire dans la mémoire du site. Même chose à revoir pour
`envoyerFactureCourriel()` et `imprimerFacture()`, qui lisent la même
mémoire.

**Impacts :** le bouton existe dans `modal-apres-vente` ET dans
`modal-facture-vente` (`admin/index.html`) — les deux appellent la fonction
sans paramètre. Les deux devront passer le numéro.

**Republier après :** site seulement.

---

## 1. LA FACTURE — DÉCISIONS

1.1 **Le PDF joint est retiré.** Le courriel de livraison ne contient plus de
pièce jointe, seulement un **lien vers la page de facture** du site.
- Conséquence : le bogue du logo blanc sur fond blanc dans le PDF disparaît
  (le convertisseur HTML→PDF de Google ignore la couleur de fond).
- Conséquence : `construireFactureCommande()` ne sert plus — donc la
  correction du numéro (CMD-xxxx au lieu de VEN-xxxx) devient inutile.

1.2 **Le client reçoit aussi le lien par texto**, dans les deux cas de
livraison.

1.3 **La page de facture existe déjà** : `getFacturePublique` (Code.gs),
lecture seule, protégée par un jeton (`getJetonVente` le crée au besoin).
Elle lit la vente en direct — donc elle se met à jour toute seule.

1.4 **La photo de livraison s'affiche sur cette page**, s'il y en a une.

---

## 2. L'ARBRE VALIDÉ — 16 BRANCHES

### 1. Envoi par Poste Canada ✅
Bouton « Générer l'étiquette ». Le numéro de suivi est capté tout seul.
Courriel + texto avec le lien de suivi. **Aucun numéro tapé à la main,
jamais.** Ce chemin est bon tel quel.

### 2. Livraison en personne ✅
Bouton distinct. Aucun numéro de suivi. Le courriel dit
**« Votre commande sera livrée aujourd'hui »** — il part quand Chantal
prépare, pas quand elle arrive.

### 3. Cueillette ✅
**N'existe pas** chez Chantal. Rien à bâtir.

### 4. Confirmation obligatoire ✅
Une fenêtre de confirmation avant l'envoi, **dans les deux cas**. Celle de
Poste Canada doit nommer Poste Canada (l'étiquette est achetée et facturée).

### 5. Le courriel ne part pas ✅
L'avertissement actuel suffit. **Ajout décidé :** un bouton
**« Renvoyer le courriel »** sur les commandes terminées — aujourd'hui la
fiche « Terminée » n'affiche plus aucun bouton.

### 6. La photo de livraison ✅
Bouton dans la fiche → ouvre l'appareil photo du téléphone → la photo se
sauve toute seule. **Reprise autant de fois que voulu**, la dernière
remplace l'ancienne. Hébergement : **Cloudinary**, comme les photos de
produits; seule l'adresse de la photo est gardée dans la commande.

### 7. Le client demande la preuve ✅
Il clique le lien de sa facture → il voit la facture **et la photo** s'il y
en a une.

### 8. La fiche « À expédier » ✅
« Marquer comme expédiée » **disparaît**, remplacé par
« Livrée en personne ». La fiche fait d'abord **choisir** entre les deux.

### 9. Le poids ✅
Le poids et l'avertissement orange **n'apparaissent qu'après avoir choisi
Poste Canada**. Inutiles pour une livraison en personne.
> Note : le poids devrait déjà se remplir tout seul (`c.poids_colis`). Il ne
> s'écrit qu'au clic « Calculer le tarif » dans la proposition. **À
> revérifier** — Chantal refait un test.

### 10. Nouveau statut « À livrer » ✅
Deux listes : **« À expédier »** et **« À livrer »**. La commande reste dans
« À livrer » tant que la photo n'est pas prise.

### 11. Pas de photo ✅
La photo prise fait passer à « Terminée ». Bouton
**« Livrée sans photo »** pour fermer la commande quand il n'y a pas de
photo.

### 12. Les vieux courriels du client ✅
- Poste Canada → « Votre commande est en route! » + suivi.
- En personne → « Votre commande vous sera livrée aujourd'hui ».
(Deux messages différents : pour Poste Canada, la date d'arrivée est
inconnue.)

### 13. Le lendemain ✅
Une fois « Terminée » → « Votre commande a été livrée » + sa facture.

### 14. Mauvais bouton ✅
**Pas de retour arrière une fois l'étiquette achetée** — l'argent est
dépensé. La confirmation (branche 4) est la seule protection.
Le retour arrière **n'existe que pour la livraison en personne**, où rien
n'a été acheté : la commande revient à « À expédier ».

### 15. Le client change d'idée après le paiement ✅
(« finalement, postez-la-moi ») — rien n'a été acheté, retour arrière
possible. **Il faut lui facturer les frais de livraison :**
- Le **calculateur de tarif existant** (celui de la proposition) est
  réutilisé tel quel.
- Le poids se recalcule tout seul à partir des produits, comme dans la
  proposition.
- Un lien de paiement Square part au client **par courriel et par texto**.
- Bouton **« Frais payés »** dans la fiche, cliqué par Chantal quand elle
  voit l'argent entré (même geste que « Paiement reçu » — rien ne se
  signale tout seul).
- Quand c'est payé, la commande retourne à « À expédier ».

### 16. Il ne paie jamais les frais ✅
- Les liens Square deviennent caducs à 14 jours tout seuls.
- Passé 14 jours, la commande **revient à « À livrer »**.
- Un **point orange** apparaît sur la commande passé 14 jours, comme celui
  des propositions.

---

## 3. CE QU'IL FAUT BÂTIR (rien n'est commencé)

1. Corriger `envoyerFactureTexto()` (+ courriel + impression) — **la faille,
   section 0. À faire en premier.**
2. Retirer le PDF joint dans `expedierCommande_v2` (Code.gs) et mettre le
   lien de facture à la place.
3. Ajouter le lien de facture au texto d'expédition.
4. Le choix Poste Canada / en personne dans la fiche « À expédier ».
5. Le nouveau statut « À livrer » + sa liste.
6. La photo de livraison (bouton, envoi Cloudinary, colonne dans la
   commande, affichage sur la page de facture).
7. Bouton « Livrée sans photo ».
8. Bouton « Renvoyer le courriel » sur les commandes terminées.
9. Retour arrière (livraison en personne seulement).
10. Frais de livraison à refacturer + bouton « Frais payés » + point orange
    à 14 jours.

---

## 4. ANCRAGES TECHNIQUES

- `Code.gs` → `creerVenteDepuisCommande_v2` : crée VEN-xxxx, recopie les
  lignes, lie la commande, statut « À expédier ». **Ne touche pas au
  stock** (déjà sorti à la proposition par `sortirStockCommande_v2`).
- `Code.gs` → `expedierCommande_v2` : écrit `no_tracage`, statut
  « Terminée » (colonne 9), envoie le courriel + le PDF (à retirer).
- `Code.gs` → `envoyerFacture_v2` : bâtit le HTML de la facture. Mode
  `apercu` = retourne le HTML sans rien envoyer.
- `Code.gs` → `getFacturePublique` / `getJetonVente` : la page publique.
- `js/admin-commandes.js` → `genererEtiquette`, `marquerExpediee`,
  `construireFactureCommande`, `voirDetailCommande` (les boutons par
  statut).
- `js/admin-ventes.js` → `envoyerFactureTexto`, `envoyerFactureCourriel`,
  `imprimerFacture`, `finaliserVente`, `voirDetailVente`.
- Variables en mémoire, source de la faille : `venIdEnCours`,
  `venNumeroAffiche`.
- `Commandes_Entete_v2` : `poids_colis`, `no_tracage`, `ven_id_lien`
  (col 11), `link_id_square` (col 21), statut (col 9).

---

## 5. OÙ ON EN EST

- ✅ Arbre complet, 16 branches validées (9 juillet 2026).
- ✅ Faille du texto diagnostiquée (section 0).
- ⬜ Rien de codé. Chantal refait un test pour le poids (branche 9).
- Prochaine étape : Chantal choisit par quoi on commence.

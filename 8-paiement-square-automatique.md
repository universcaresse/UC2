# ITEM 8 — Le paiement Square appliqué tout seul à la commande
### Arbre validé par Chantal le 10 juillet 2026. RIEN N'EST CODÉ.
> Lire `METHODE.md` d'abord. Aucun code sans le OK de Chantal.
> Trouve-et-remplace un seul à la fois, preuve Vérifié/Impacts avant chaque
> proposition.

---

## 0. LE PROBLÈME

Quand un client paie sur Square, **rien ne bouge chez nous**. Chantal reçoit
un courriel de Square qui dit seulement « Paiement de 65,00 $ » — **le numéro
de la commande n'y apparaît nulle part**. Elle doit deviner, puis cliquer
« Paiement reçu » à la main.

**Constaté le 10 juillet 2026 :** un courriel Square reçu, impossible de
savoir à quelle commande il se rattache.

---

## 1. CE QUI EXISTE DÉJÀ (vérifié dans les fichiers)

- `Code.gs` → `creerLienPaiementSquare_v2` : crée le lien et retourne son
  `link_id`. Le nom du paiement contient le numéro (« Vos coups de cœur.
  Commande -0042 »), mais Square ne le met pas dans son courriel.
- `Commandes_Entete_v2` → `link_id_square` (colonne 21) garde ce `link_id`.
- `Code.gs` → `verifierLienSquareCommande` : demande déjà à Square si un lien
  est encore vivant. **Le même chemin peut demander s'il est payé.**
- `Code.gs` → `fermerLienSquareCommande`, `annulerLienSquare_v2`.
- `js/admin-commandes.js` → `paiementRecu` / `confirmerPaiementCommande` :
  le clic manuel. Il crée la facture (`creerVenteDepuisCommande`), ferme le
  lien Square, met le statut à « À expédier ». **Le stock ne bouge pas** —
  déjà sorti à la proposition.
- Retour du client après paiement : `?paiement=recu&cmd=…&jeton=…`
  (`js/main.js`, `verifierRetourPaiement`).
- Frais de livraison (item 7) : `link_id_frais`, statut « Frais à payer »,
  bouton « Frais payés ».

**Conclusion :** Square sait à quel lien chaque paiement se rattache, et
chaque lien est déjà rattaché à une commande chez nous. Le fil existe — il
n'est simplement jamais suivi.

---

## 2. L'ARBRE VALIDÉ — 12 BRANCHES

### 1. Il paie tout et revient sur le site ✅
Le site demande à Square si le lien est payé. Oui → la facture se crée toute
seule, mode « Square », lien fermé, statut « À expédier ». Chantal ne clique
rien.

### 2. Il paie mais ne revient jamais sur le site ✅
(onglet fermé, connexion coupée) — la même question est posée à Square
**au chargement de la liste des commandes**, pour chaque commande
« En attente de paiement ».
> Coût accepté par Chantal : une question à Square par commande en attente,
> à chaque ouverture de la liste.

### 3. Il paie deux fois ✅
Une seule facture est créée. Quand Square a encaissé **plus** que le solde :
**point rouge** + mention **« payé deux fois — à rembourser »**. Chantal voit
le problème sans chercher et décide.

### 4. Il paie moins que le total ✅
Aucune facture créée. **Point orange** + mention
**« payé en partie : 40 $ sur 65 $ »**.

### 5. Chantal a déjà cliqué « Paiement reçu » ✅
La commande a déjà une facture liée (`ven_id_lien`). La vérification
automatique **la saute complètement**. Le geste de Chantal reste maître.

### 6. Les frais de livraison ✅
Même mécanique sur `link_id_frais` : payé → la commande passe toute seule de
« Frais à payer » à « À expédier », sans cliquer « Frais payés ».

### 7. Square ne répond pas ✅
(panne, jeton expiré, pas d'internet) — rien ne bouge, rien ne casse. Les
boutons manuels « Paiement reçu » et « Frais payés » marchent comme avant.
**Aucun message d'erreur affiché à Chantal.**

### 8. Le lien est fermé ou expiré, mais le client avait payé avant ✅
Square garde la trace du paiement. La vérification le trouve quand même et
l'applique. Rien ne se perd.

### 9. Remboursement demandé à Square après coup ✅
Le site **ne défait rien tout seul**. **Point rouge « remboursé »** sur la
commande. Chantal décide (annuler, remettre en stock, refacturer).

### 10. L'acompte ✅
Le lien Square ne couvre que le reste. La vérification compare le paiement au
**solde**, jamais au total — sinon elle croirait qu'il manque de l'argent.

### 11. Il paie pendant que Chantal regarde la commande ✅
Rien ne saute à l'écran. Le changement paraît à la prochaine ouverture de la
liste. Pas de rafraîchissement automatique, pas de fiche qui se referme.

### 12. La vente au marché ✅
Le bouton « Payer par Square » de la fiche de vente a déjà sa propre fenêtre
de confirmation et ne passe pas par les commandes. **On n'y touche pas.**

---

## 3. CE QU'IL FAUT BÂTIR (rien n'est commencé)

1. `Code.gs` : une fonction qui demande à Square l'état d'un lien de paiement
   — payé ou non, combien, remboursé ou non. (Le lien Square porte une
   commande Square; c'est elle qui contient les paiements.)
2. `Code.gs` : appliquer le résultat à une commande — facture créée, lien
   fermé, statut « À expédier »; ou drapeau de problème.
3. Deux nouvelles colonnes dans `Commandes_Entete_v2` pour le drapeau :
   l'ennui constaté (trop payé, pas assez, remboursé) et son montant.
4. `js/main.js` : au retour `?paiement=recu`, lancer la vérification
   (branche 1).
5. `js/admin-commandes.js` → `chargerCommandes` : vérifier les commandes
   « En attente de paiement » et « Frais à payer » (branches 2 et 6).
6. La pastille : rouge « payé deux fois » / « remboursé », orange
   « payé en partie », dans `calculerPastilleStock`.

---

## 4. ANCRAGES TECHNIQUES

- `Code.gs` → `verifierLienSquareCommande` (l. 3944) : le patron d'appel à
  Square, jeton `SQUARE_ACCESS_TOKEN`, en-tête `Square-Version`.
- `Code.gs` → `creerLienPaiementSquare_v2` (l. 5072) : retourne
  `payment_link.id` et `payment_link.url`.
- `Code.gs` → `creerVenteDepuisCommande_v2` : crée la facture, ne touche pas
  au stock.
- `Code.gs` → `annulerLienSquare_v2` : ferme le lien.
- `js/admin-commandes.js` → `confirmerPaiementCommande` : le geste manuel à
  imiter; `calculerPastilleStock` : les points de couleur.
- `js/main.js` → `verifierRetourPaiement` : le retour `?paiement=recu`.
- `Commandes_Entete_v2` : `ven_id_lien` (col 11), `link_id_square` (col 21),
  statut (col 9), `link_id_frais`, `date_frais`, `acompte`, `solde`.

---

## 5. OÙ ON EN EST

- ✅ Arbre complet, 12 branches validées (10 juillet 2026).
- ⬜ Rien de codé.
- Prochaine étape : Chantal choisit par quoi on commence.

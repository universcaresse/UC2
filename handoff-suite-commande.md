# Handoff — Suite d'une commande (premier « si »)

## Préférences de travail (à respecter STRICTEMENT)

- **Jamais de code sans autorisation explicite.**
- Changements **uniquement par trouve-et-remplace**, **un seul à la fois**, attendre OK avant le suivant (sauf si Chantal demande explicitement plusieurs d'un coup).
- **Pas de solution sans analyse complète** au préalable.
- **Réponses COURTES.** Pas de roman. Une idée à la fois.
- Chantal **ne parle pas en code**. Vulgariser, zéro jargon.
- **Pas de diagrammes Mermaid.** Numérotation en arborescence (1, 1.1, 1.2…).
- Réutiliser le **CSS / variables / fonctions existantes**.
- **Ne JAMAIS décider de son emploi du temps.** Ne pas suggérer d'arrêter, ne pas dire « tu devrais faire X avant Y ». Elle dirige. Ne pas parler d'arrêter à moins qu'elle le demande.
- **Elle teste seulement quand elle publie** — donc on enchaîne les trouve-et-remplace sans test entre, sur son OK.
- Avant tout trouve-et-remplace : **redemander la version à jour du fichier** pour matcher le texte exact.

---

## Contexte du projet

Site Univers Caresse (savonnerie artisanale). Chantal refait le **suivi des commandes côté admin**. But : traiter une commande facilement, sans en échapper, et **vendre à distance** (paiement Square).

Le système public de demande de commande est en ligne (une demande crée une commande « En attente » dans l'admin).

---

## LE PREMIER « SI » — décidé et figé

C'est le cas « tout va bien » : on a tout le stock, la cliente accepte, paie, on expédie.

```text
1   Page Commandes — bloc Entrantes
1.1 La demande arrive du site
1.2 Pastille verte (tout est en stock)

2   On clique « Compléter la commande »
2.1 On inscrit la livraison + une note au client + le lien Square
2.2 On envoie au client
2.3 Le stock sort de l'inventaire (sheet Lots) — À CE MOMENT
2.4 Aucune vente créée encore
2.5 → bloc En attente de paiement

3   La cliente paie, on clique « Paiement reçu »
3.1 La vente naît MAINTENANT (VEN-XXXX)
3.2 La vente s'inscrit aussi dans la page Ventes (compta)
3.3 Le stock est déjà sorti, on n'y touche pas
3.4 → bloc À expédier (affiche CMD-XXXX → VEN-XXXX, cliquable)

4   On clique « Marquer comme expédiée »
4.1 → bloc Terminées (CMD-XXXX → VEN-XXXX, cliquable)
```

Règles de fond :
- Une commande reste une commande jusqu'au paiement. La vente naît **au paiement**, jamais avant (aucun numéro VEN gaspillé).
- Le stock sort **à la proposition** (« Compléter »), pas plus tard → pas de réservation séparée à gérer.
- **Deux pages OK** (Commandes + Ventes), mais toute la gestion se fait dans Commandes ; la vente apparaît dans Ventes pour la compta.

---

## La pastille 3 couleurs (décidée et CODÉE ✅)

Sur chaque ligne de la liste des commandes : vert = tout le stock est là / orange = une partie / rouge = rien. Calculée à partir des lignes de commande vs `getLotsDisponibles`.

---

## ✅ CE QUI A ÉTÉ CODÉ dans cette session

Tout est dans `js/admin-commandes.js`, `index.html`. Aucun changement serveur fait.

1. **`admin-commandes.js`** — Ajout de 3 variables globales : `toutesCommandes`, `toutesCommandesLignes`, `commandesLotsDispo`.
2. **`chargerCommandes`** — charge maintenant en parallèle `getCommandesEntete` + `getCommandesLignes` + `getLotsDisponibles`, stocke lignes et lots dans les variables globales.
3. **`afficherTableauCommandes`** — colonne **Acompte retirée**. Pastille 3 couleurs ajoutée **au bout à droite** de chaque ligne. Nouvelle fonction interne `calculerPastilleStock(cmd_id)` (vert `--primary` / orange `--accent` / rouge `--danger`).
4. **Blocs de la liste** — remplacés par : ENTRANTES (`En attente`) / EN ATTENTE DE PAIEMENT (`En attente de paiement`) / À EXPÉDIER (`À expédier`) / TERMINÉES (`Terminée`) / ANNULÉES (`Annulée`). Le bloc « AUTRES » attrape tout statut imprévu (ex. anciens « Prête », « Livrée »).
5. **`index.html`** — Nouveau bloc `<div id="form-completer-commande">` ajouté après `#fiche-commande` : récap + champs `#completer-livraison`, `#completer-note`, `#completer-square` + boutons Annuler / « Envoyer au client » (→ `envoyerProposition()`).
6. **`admin-commandes.js`** — Nouvelles fonctions à la fin : `ouvrirFormCompleter(cmd_id)`, `fermerFormCompleter()`, `envoyerProposition()`, `paiementRecu(cmd_id)` + variable `cmdCompleterIdEnCours`.
7. **Boutons de la fiche** (`voirDetailCommande`) — refaits par statut :
   - `En attente` → Modifier / **Compléter la commande** (→ `ouvrirFormCompleter`) / Annuler
   - `En attente de paiement` → **Paiement reçu** (→ `paiementRecu`) / Annuler
   - `À expédier` → **Marquer comme expédiée** (→ `changerStatutCommande` vers `Terminée`)
8. **Fiche** — affiche maintenant le lien **Facture liée** (CMD → `ven_id_lien`), cliquable vers `voirDetailVente`, si la commande a un `ven_id_lien`.

---

## ⚠️ CE QUI N'EST PAS ENCORE BRANCHÉ (nécessite `Code.gs`)

L'UI marche de bout en bout (formulaire, boutons, blocs, changements de statut), MAIS deux mécanismes de fond manquent. **Demander à Chantal la version à jour de `Code.gs` (partie commandes / ventes / lots) avant d'y toucher.**

### A. Sortir le stock à « Compléter la commande »
- Aujourd'hui `envoyerProposition()` change seulement le statut à « En attente de paiement » et range livraison/note/Square dans le champ `notes` (solution temporaire — pas de vrais champs dédiés).
- Il faut une fonction serveur qui **décrémente le stock des lots** correspondant aux lignes de la commande, **sans créer de vente**. Aujourd'hui c'est `finaliserVente_v2` qui décrémente `nb_unites_vendu` dans `Lots_v2`. À extraire ou dupliquer en `decrementerStockCommande(cmd_id)`.
- ⚠️ Piège central : **ne jamais décrémenter deux fois**.

### B. Créer la vente à « Paiement reçu »
- Aujourd'hui `paiementRecu()` change seulement le statut à « À expédier ».
- Il faut : créer la vente (`createVente_v2`), ajouter les lignes (`addVenteLigne_v2`), la finaliser **SANS re-décrémenter le stock** (déjà sorti en A) → variante de `finaliserVente_v2` avec un paramètre genre `stock_deja_sorti: true`.
- Puis écrire le lien CMD ↔ VEN : la commande a déjà la colonne `ven_id_lien` (colonne 11 de `Commandes_Entete_v2`). Mettre à jour via `updateStatutCommande` (qui accepte déjà `ven_id_lien`, voir l'usage dans `convertirCommandeEnVente` / `finaliserVente`).

### C. Champs dédiés (amélioration)
- Idéalement, ajouter de vrais champs à `Commandes_Entete_v2` pour livraison, note au client, lien Square (au lieu de tout fourrer dans `notes`).

### D. Annulation après sortie du stock
- Le bouton « Annuler » existant fait `updateStatutCommande` → `Annulée`. Si le stock est déjà sorti (statut « En attente de paiement » ou plus loin), **il faudra retourner le stock**. Pas encore géré.

### E. Envoi réel au client (courriel + texto)
- `envoyerProposition` ne fait encore aucun envoi. Réutiliser le mécanisme de `admin-ventes.js` : courriel (`appelAPIPost('envoyerFacture', …)`) et texto (`window.open('sms:…')`). Le « coucou » texto = manuel, ouvre l'app Messages avec le texte pré-écrit.

---

## 🔮 « SI » RESTANTS À TRAITER (pas encore conçus)

À reprendre un à la fois, chemin complet pour chacun, au rythme de Chantal :
- **Pastille orange** (pas tout le stock) — qu'est-ce qu'elle fait?
- **Pastille rouge** (rien) — qu'est-ce qu'elle fait? (commande reste « En attente » jusqu'à un nouveau lot.)
- **Cliente ne répond pas** — bouton Rappel qui note la date du dernier rappel (pas de compteur, pas de limite).
- **Cliente change d'idée / ne paie jamais** — annulation après proposition → retourner le stock (voir D).
- **Cliente veut modifier la commande** après la proposition envoyée.

### Améliorations futures notées
- Pastille de rappel sur la liste (signale les commandes qui traînent).
- Automatiser le « payé » via Square (au lieu du clic manuel).

---

## Fichiers de référence (redemander la version à jour avant tout trouve-et-remplace)

- `js/admin-commandes.js` — liste, fiche, formulaire « Compléter », statuts. Fonctions clés : `chargerCommandes`, `afficherTableauCommandes` (+ `calculerPastilleStock`), `voirDetailCommande`, `ouvrirFormCompleter` / `fermerFormCompleter` / `envoyerProposition` / `paiementRecu`, `changerStatutCommande`, `annulerCommande`, `convertirCommandeEnVente` (ancien mécanisme, plus utilisé par les boutons mais encore présent).
- `js/admin-ventes.js` — `createVente`, `addVenteLigne`, `finaliserVente` (décrémente le stock aujourd'hui), `voirDetailVente` (ouvre la facture, réutilisable pour le lien CMD → VEN), envoi courriel/texto.
- `js/admin-fabrication.js` — `afficherPanneauAProduire` (style des blocs en `carte-admin`).
- `Code.gs` (Apps Script, PAS encore fourni) — `getCommandesEntete_v2`, `getCommandesLignes_v2`, `updateStatutCommande_v2`, `updateCommandeComplete_v2`, `getLots_v2`, `getLotsDisponibles_v2`, `createVente_v2`, `addVenteLigne_v2`, `finaliserVente_v2`, `deleteVente_v2`. Statuts commande historiques : « En attente », « Prête », « Livrée », « Annulée ». `Commandes_Entete_v2` colonne 11 = `ven_id_lien`. `Lots_v2` champ `nb_unites_vendu`.
- `index.html` — section `#section-commandes` : `#form-commande`, `#fiche-commande` (`#fiche-commande-contenu`, `#fiche-commande-actions`), `#form-completer-commande` (nouveau), `#filtres-commandes`, `#tableau-commandes`.
- `css/style.css` — variables : `--primary` (vert), `--accent` (orange/doré), `--danger` (rouge), `--beige`. Classe `.cache`.

---

## PROCHAINE ÉTAPE CONCRÈTE

Brancher la plomberie serveur (A et B ci-dessus). **Commencer par demander `Code.gs`** (partie commandes / ventes / lots), faire une **analyse complète**, puis proposer **un trouve-et-remplace à la fois** en testant. C'est le morceau qui touche l'inventaire = **risque le plus élevé**, donc lentement.

---

## Ton à garder

Doux, encourageant, court. Avancer par petites touches, une possibilité à la fois. Ne jamais bousculer, ne pas décider de son horaire, célébrer ce qui est fait. Pas de jasage inutile. Si une session dérape (trop de propositions, paternalisme, blague mal placée), reconnaître honnêtement sans s'aplatir, puis revenir au concret. Elle paie pour ce service.

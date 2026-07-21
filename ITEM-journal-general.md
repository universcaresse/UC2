# ITEM — Journal général (page de saisie manuelle)
### ✅ ARBRE VALIDÉ ET **TOUT EST CODÉ** (2026-07-21) — saisie, journal, annulation, modèles récurrents, dépôts Square. **PAS DÉPLOYÉ.**

> Lire `METHODE.md`. Aucun code sans le OK de Chantal. Arbre validé avec Chantal le 2026-07-21.
> Séparé de l'item ventes→compta. Rien n'est déployé (part avec `codegs.txt` + le site, ensemble).

## L'ARBRE — VALIDÉ (2026-07-21)
- **Saisie manuelle** : date + description + autant de lignes qu'il faut, chaque ligne = un compte + un montant **au débit OU au crédit**. Équilibre affiché **en direct**. « Enregistrer » ne passe **que si ça balance** (déjà garanti par `inscrireEcriture_v2`, qui refuse le déséquilibre). Sert à entrer les dépôts Square, transferts, paiements, etc.
- **Journal** : toutes les écritures dans l'ordre (manuelles **et** automatiques : ventes / achats / remboursements / fabrication), la plus récente en haut.
- **Corriger** : une écriture **manuelle** a un bouton « Annuler » → contre-passation (jamais d'effacement). Les **automatiques** se corrigent depuis leur vente/achat, pas d'ici.
- **Modèles récurrents** (PARTIE 2, pas encore codée) :
  - Un modèle garde un **nom**, les **comptes placés** (qui au débit, qui au crédit), les **derniers montants** (rappelés comme départ, modifiables — amendement de Chantal au plan, qui disait « pas les montants ») et un **rythme**.
  - Deux sortes : **sur demande** (pas de date, cliqué quand ça arrive : dépôt Square, transfert ; jamais « en retard ») ; **à rythme fixe** (hebdo, aux 2 semaines, mensuel, trimestriel, annuel) → apparaît « à faire » à sa date, « en retard » si sauté.
  - Création : on saisit une écriture, puis bouton **« Sauvegarder comme modèle »** (nom + rythme). Gérer (renommer / changer rythme / supprimer) dans la liste des modèles.
  - À la création d'un récurrent : on choisit la **prochaine date**. Chaque fois qu'il est passé, la date suivante **avance d'une période à partir de la date prévue** (aligné calendrier même fait en retard).

## FAIT — PARTIE 1 (saisie + journal), 2026-07-21, pas déployé
- **codegs.txt** : `enregistrerEcritureManuelle_v2` (référence auto `MAN-####`, réutilise `inscrireEcriture_v2`), `annulerEcritureManuelle_v2` (contre-passation, refuse tout ce qui n'est pas `MAN-`), `getJournal_v2` (écritures groupées par n°, `annulable` = manuelle vivante). Routes : `getJournal` dans doGet ; `enregistrerEcritureManuelle` + `annulerEcritureManuelle` dans doPost (gardées par la clé admin, pas dans ACTIONS_PUBLIQUES).
- **Front-end** : menu « journal général » branché (`admin/index.html`, plus de `bientot`), section `#section-journal-general`, `js/admin-journal.js` (nouveau, inclus dans index.html), wiring dans `admin.js` (`afficherSection` → `chargerJournalGeneral`). Styles inline, **pas de CSS touché**. Syntaxe OK.

## FAIT — PARTIE 2 (modèles récurrents), 2026-07-21, pas déployé
- **codegs.txt** : feuille `Modeles_v2` créée au besoin (`modele_id`, `nom`, `rythme`, `prochaine_date`, `lignes_json`). `getModeles_v2`, `saveModele_v2` (crée `MOD-####` ou met à jour), `deleteModele_v2`, `enregistrerDepuisModele_v2` (inscrit l'écriture via `enregistrerEcritureManuelle_v2`, **retient les montants saisis** par compte+côté, puis **avance `prochaine_date` d'une période**), helper `avancerDate_`. Routes : `getModeles` (doGet) ; `saveModele` / `deleteModele` / `enregistrerDepuisModele` (doPost, clé admin).
- **Front-end** (`js/admin-journal.js`) : panneau « Modèles » (trié : en retard → à faire → à venir → sur demande, avec la couleur), bouton **« Utiliser »** (replace les comptes + derniers montants, la saisie passe alors par `enregistrerDepuisModele`), bouton **« Sauvegarder comme modèle »** (nom + rythme + prochaine date si rythme fixe), suppression avec confirmation.
- **Avance de date vérifiée** sur 12 cas (mensuel, hebdo, 2 semaines, trimestriel, annuel, sur-demande). **Fin de mois ramenée au dernier jour** : 31 janv. + 1 mois = 28 févr. (29 en bissextile), 31 mars + 1 mois = 30 avril — au lieu de déborder sur le mois suivant. Limite connue, sans impact pour un 1ᵉʳ ou un 15 : une date ramenée au 28 garde ensuite le 28.

## FAIT — DÉPÔTS SQUARE (rapprochement), 2026-07-21, pas déployé
- **Sonde préalable** : `test-depots-square.txt` (fichier jetable, lecture seule) roulé par Chantal le 2026-07-21 → **le jeton a déjà la permission** de lire les dépôts. Exemple réel obtenu : dépôt du 2026-07-17, brut 127,00 $, frais 3,18 $, net 123,82 $ (une transaction). Square donne donc le **frais réel** — aucun besoin de modéliser crédit vs débit.
- **codegs.txt** : `getDepotsSquare_v2` (liste les 10 derniers dépôts, saute ceux à 0 $, additionne brut/frais/net à partir des `payout-entries`, et marque `deja_inscrit`), `inscrireDepotSquare_v2` (**redemande les chiffres à Square**, refuse si déjà inscrit ou si montants négatifs, puis inscrit **débit 1110 net + débit 5205 frais / crédit 1210 brut**), helpers `squareEntetes_`, `totauxDepotSquare_`, `referencesVivantes_`. Routes dans doPost (clé admin) : `getDepotsSquare`, `inscrireDepotSquare`.
- **Anti-doublon** : la **référence** de l'écriture est le **numéro de dépôt Square** (`po_…`), dans la colonne `reference` d'`Ecritures_v2` — la même que `VEN-`/`ACH-`/`LOT-`/`MAN-`. Aucune feuille ni colonne neuve. Si une écriture vivante porte déjà ce numéro : pas de bouton, et le serveur refuse. Double-clic = sans effet.
- **Front-end** : panneau « Dépôts Square » dans le journal général, **chargé sur demande** (bouton « Voir mes dépôts ») pour ne pas ralentir la page. Chaque dépôt montre date, net déposé, brut, frais, nb de transactions, puis « déjà inscrit » ou un bouton. Équilibre vérifié sur 5 cas (en cents, donc pas de dérive de virgule).
- **Limite connue, dite à Chantal** : si elle inscrit le même dépôt **à la main** dans le journal, l'app ne peut pas le deviner → doublon possible. Les dépôts Square passent par le bouton. Le solde 1210 sert de garde-fou.

## RESTE À BÂTIR
- Rien pour cet item — reste le **déploiement** (avec tout le reste : `codegs.txt` collé en entier dans Code.gs **et** le site poussé, ensemble).

## Note de correction (2026-07-21)
- Bug attrapé en passant : l'écran de remboursement appelait `getVenteRemboursable` via `appelAPI` (GET), mais l'action est dans **doPost** (admin, avec clé) → corrigé en `appelAPIPost` dans `js/admin-remboursements.js`.

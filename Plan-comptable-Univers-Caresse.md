# PLAN COMPTABLE — Univers Caresse
### État (2026-07-21) : achats, fabrication, **ventes** (les deux portes : directes et coups de cœur), **remboursements**, **journal général + modèles récurrents** et **dépôts Square** sont tous codés dans `codegs.txt` — **rien n'est encore déployé**. Liste des comptes remise à jour le 2026-07-21 d'après la vraie feuille.
> Voir `ITEM-ventes-comptabilite.md` et `ITEM-journal-general.md` pour le détail et ce qui reste.
> Plan **ouvert** : des comptes restent à ajouter. Ce fichier suffit à reprendre
> sans reposer les questions déjà tranchées.

---

## Convention de numérotation
- Classes : 1000 Actif · 2000 Passif · 3000 Avoir · 4000 Revenus · 5000 Dépenses.
- Sections par centaines (1100, 1200…). Comptes au **pas de 5** (latitude sans gaspiller).
- Le sous-total porte le numéro de sa section. Un total par classe.

---

## LE PLAN

```
1000  ACTIF
  1100  Encaisse
        1001  En suspens
		1105  Fond de caisse
        1110  Compte bancaire Tangerine
        Sous-total 1100
  1200  Ventes à déposer et à recevoir
        1205  Comptant à déposer
        1210  Square à recevoir
        1215  Interac à recevoir
        1220  Payer plus tard
        1225  Crédits chez fournisseurs
        Sous-total 1200
  1300  Stocks
        1305  Stock d'ingrédients
        1310  Inventaire de produits à vendre
        Sous-total 1300
  1400  Équipement
        1405  Équipement
        1410  Amortissement cumulé — Équipement
        Sous-total 1400  (valeur nette)
  TOTAL DE L'ACTIF (1000)

2000  PASSIF
  2100  Fournisseurs
        2105  Comptes fournisseurs
        2110  Postes Canada à payer (compte d'attente)
        Sous-total 2100
  2200  Sommes à rembourser
        2205  Visa à rembourser
        2210  Interac à rembourser
        2215  Comptant à rembourser
        2217  JC à rembourser
        Sous-total 2200
  TOTAL DU PASSIF (2000)

3000  AVOIR
        3005  Mises de fonds
        3010  Retraits
        3015  Bénéfices non répartis
        3100  Bénéfice net
  TOTAL DE L'AVOIR (3000)

4000  REVENUS
        4005  Ventes de produits
        4010  Livraison facturée
        4015  Rabais et promotions
  TOTAL DES REVENUS (4000)

5000  DÉPENSES
  5000  Coût des ventes
        5001  Ingrédients  (coût des marchandises vendues, à la vente)
        5010  Retours invendables
        5020  Ajustements stocks
        Sous-total 5000
  5100  Frais de vente
        5205  Frais Square
        5210  Frais d'expédition
        5215  Promotion
        Sous-total 5100
  5300  Frais d'exploitation
        5305  Licences
        5310  Frais bancaires
        5315  Honoraires
        5320  Entretien
        5325  Fourniture de bureau
        5327  Cellulaire - Internet
        5330  Frais de déplacement
        5332  Divers
        5335  Amortissement
        Sous-total 5300
  TOTAL DES DÉPENSES (5000)
```

---

## RÈGLE GLOBALE — jamais d'effacement
- Légalement, une écriture ne s'efface pas. Toute correction (re-finalisation,
  changement de mode, suppression) inscrit une **contre-passation** (l'inverse)
  puis, s'il y a lieu, la nouvelle écriture. Tout reste visible au journal.
- S'applique partout : achats, ventes, manuel.

---

## ÉCRITURES D'ACHAT (arbre validé le 2026-07-14)

### Mode de paiement (obligatoire dès l'achat)
- Visa → 2205 · Interac → 2210 · Comptant → 2215 · Compte bancaire → 1110.
- **Pas de mode = finalisation bloquée.**
- Mode changé après finalisation → contre-passation + nouvelle écriture, automatique.

### Catégories UC : UN SEUL compte (corrigé le 2026-07-16)
- **compte_achat** (« Compte à l'achat ») : où va l'argent à l'achat.
  1305 pour tout ce qui entre au stock; dépense directe pour le reste
  (Fourniture 5325, Divers 5332).
- **Le compte de vente a été retiré** (2026-07-15) — tout passe par 5001 à la vente.
  La colonne E de Categories_UC_v2 porte maintenant le drapeau **inci** (« oui » = INCI requis).
- Pas de compte sur les noms UC — la catégorie suffit.
- ⚠️ Dans la feuille, corriger compte_achat 1035 → **1305**.
- 🔴 **Une catégorie UC complète = 5 morceaux** : nom + compte à l'achat + INCI requis
  + **densité** + **marge de perte**. Ces deux dernières vivent dans Config_v2 : sans elles,
  la densité vaut 1 et la marge 0 **en silence** → prix au gramme faux.
  Arbre validé et travail à faire : voir ITEM-categories-UC-dans-le-plan-comptable.md

### Écriture à la finalisation d'un achat
- **Chaque ligne** va au débit du compte_achat de sa catégorie,
  montant × facteur (taxes + livraison réparties au prorata, comme déjà fait
  pour le prix des ingrédients).
- **Un seul crédit** au compte du mode de paiement, pour le total payé.
- **Crédit / coupon du fournisseur** : le stock entre au plein montant;
  la part couverte par le crédit se crédite à **1225 Crédits chez fournisseurs**.
  Ex. achat 50 $, crédit 10 $ : débit compte_achat 50 / crédit mode 40 / crédit 1225 10.
  1225 se garnit par la page manuelle quand un crédit est reçu.
- Achat supprimé après finalisation → contre-passation automatique.
- Achat « En cours » → aucune écriture. Total 0 $ → aucune écriture.
- **Pas de retour fournisseur** (non prévu).
- **Achats finalisés avant cette nouveauté** : Chantal les entrera à la main
  (page manuelle) pour qu'ils soient dans la comptabilité.

### Fabrication (arbre validé et CONSTRUIT le 2026-07-14, à tester)
- Lot créé (saveLot_v2) → écriture : débit **1310** / crédit **1305** du coût de
  revient total (ingrédients + emballages du format, déjà calculé par saveLot).
  Référence = lot_id, bénéficiaire = nom du produit, libellé « Fabrication lot X ».
- Lot modifié (updateLot_v2) → contre-passation + nouvelle écriture « (corrigé) ».
- Lot supprimé (deleteLot_v2) → contre-passation.
- Coût 0 → aucune écriture. Anciens lots : Chantal les entrera à la main.

### Bogue trouvé et corrigé (2026-07-14) : numéros de lot en double
- L'écran calculait le prochain numéro à partir de la liste affichée → deux lots
  différents ont reçu LOT-0160 (dont un « fantôme » : écriture sans ligne dans
  Lots_v2, cause exacte jamais élucidée).
- Correction : **le numéro de lot est donné par le serveur** (saveLot_v2, sous
  verrou), en prenant le max de Lots_v2 **et** des références LOT- d'Ecritures_v2
  — un numéro déjà passé en comptabilité ne ressort jamais, même lot supprimé.
  Le frontend (sauvegarderLot) n'envoie plus de lot_id.
- Ménage : suppression de LOT-0160 et LOT-0161 dans l'app → contre-passations
  automatiques (pas d'environnement de test, vraies écritures).

### Ventes (décisions prises, PAS construit)
- Ordre logique retenu : achats → fabrication → ventes.
- Vente finalisée → écriture automatique (modèle du md); modif/suppression →
  contre-passation; remboursement → inverse au prorata.
- **Coût des marchandises vendues → un seul compte 5001** (pas de détail par
  catégorie à la vente). Les 5010-5036 restent au plan, inutilisés.
- Le compte_vente des catégories reste en place (pourrait servir à autre chose).
- Bénéficiaire = client, mode de paiement en notes (même principe que les achats).
- 🔴 **Branche obligatoire de l'arbre des ventes : les pannes** (leçon du lot
  fantôme). À dérouler avant de coder : appel interrompu à moitié, double-clic
  qui crée deux ventes, écriture inscrite sans la vente (ou l'inverse), numéro
  donné par le serveur (jamais par l'écran), et comment détecter puis réparer
  chaque cas.

---

## CONSTRUIT le 2026-07-14 (à tester)

### Catégories UC — 2 comptes
- `Code.gs` : getCategoriesUC_v2 lit compte_achat (col 4) + compte_vente (col 5);
  saveCategorieUC_v2 enregistre les deux; **création refusée sans les 2 comptes**.
- `js/admin-inci.js` : 2 champs par carte + validation.
- Modales rapides (admin/index.html + js/admin-achats.js + js/admin-produits.js) :
  2 champs ajoutés, vidés à l'ouverture, envoyés à la création.

### Achats — mode de paiement et crédit
- Barre de finalisation (admin/index.html) : champs « Crédit ($) » (id ef-credit)
  et « Mode de paiement » (id ef-mode-paiement : visa / interac / comptant / banque).
- Total affiché = sous-total + taxes + livraison − crédit (ce que Chantal paie).
- `finaliserAchat_v2` : **refuse sans mode**; enregistre mode (col 12) et crédit
  (col 13) dans Achats_Entete_v2 (en-têtes mode_paiement / credit ajoutés par Chantal).
- La colonne total de la feuille reste le coût complet (facteur inchangé).

### Écritures automatiques (`Code.gs`)
- Colonne 10 **beneficiaire** ajoutée à Ecritures_v2 (par Chantal) : fournisseur
  pour un achat, client pour une vente (à venir). La contre-passation reprend
  le bénéficiaire d'origine.
- `inscrireEcriture_v2(date, libelle, reference, lignes, beneficiaire)` :
  réutilisable partout; génère no_ecriture et id_ligne; **refuse toute écriture
  non balancée**.
- Écriture d'achat à la finalisation : débit par compte_achat de catégorie
  (prix_total × facteur, le dernier montant absorbe l'arrondi); crédit au compte
  du mode (total − crédit, note « payé <mode> »); crédit 1225 si crédit fournisseur
  (note « crédit fournisseur »). Référence = ach_id, bénéficiaire = nom du fournisseur.
  Erreur claire si une catégorie n'a pas de compte à l'achat.
- `contrePasserReference_v2(reference, libelle)` : inverse le solde net des
  écritures d'une référence; ne fait rien s'il n'y a pas de trace. Appelée :
  au début de chaque finalisation (couvre re-finalisation et changement de mode)
  et à la suppression d'un achat finalisé.

### À tester par Chantal (nouveau déploiement Apps Script + republier le site)
- Créer une cat UC (page INCI + les 2 modales) avec et sans comptes.
- Finaliser un achat (avec et sans crédit) → vérifier Ecritures_v2.
- Supprimer puis re-finaliser un achat → vérifier les contre-passations.
- Fabriquer un lot → vérifier l'écriture 1310/1305; modifier puis supprimer
  le lot → vérifier les contre-passations.
- Corriger dans la feuille : compte_achat 1035 → **1305** (fait?).

---

## Décisions prises
- Modes de paiement des ventes (tirés du code) : comptant, Square, Square manuel, Interac, payer plus tard.
- Square + Square manuel = **un seul** compte « Square à recevoir » (même dépôt, net des frais).
- « Payer plus tard » = client pas encore payé → argent **à recevoir** (1220), pas à déposer.
- Pas de TPS/TVQ présentement → aucun compte de taxe.
- Coût des marchandises vendues (modèle de Chantal) : à la fabrication d'un lot, ingrédients + emballages **sortent du stock** (actif) et entrent dans l'**inventaire de produits à vendre** (actif) ; à la **vente**, ce coût passe en **dépense** (5001 Ingrédients — un seul compte, plus de détail par catégorie UC).
- Amortissement : **dépense** (5335) + contrepartie à l'**actif** (1410, réduit la valeur nette de l'équipement).

---

## À prévoir (pas maintenant)
- **Expédition Postes Canada** : l'app achète directement chez Postes Canada. Savoir **comment Postes Canada facture** (sur quelle carte) avant de rattacher le compte. Compte créé tout récemment.
- **Catégories équipement** : à fournir pour détailler 1405.
- **Valeur des stocks / de l'inventaire** : comment la chiffrer — mis de côté, à faire plus tard.

---

## LOGISTIQUE — où et comment s'inscrivent les données

### Deux nouveaux onglets dans le Google Sheet

**Onglet Comptes** — la liste des comptes (le plan ci-dessus). Colonnes :
- **Numéro** (fait l'ID, unique) · **Nom** · **Classe** (Actif / Passif / Avoir / Revenus / Dépenses) · **Section** (ex. 1100 Encaisse) · **Type** (normal / sous-total / total).

**Onglet Écritures** — tous les mouvements d'argent. Colonnes :
- **ID_ligne** (unique par ligne) · **Date** · **N° d'écriture** (regroupe les lignes d'un même événement) · **Compte** (n° seul; le nom s'affiche à côté, tiré de Comptes) · **Libellé** · **Référence** (n° de vente/achat, vide si aucun) · **Débit** · **Crédit** · **Notes**.
- Le **nom du compte n'est pas réécrit** dans Écritures (une seule source, l'onglet Comptes) — il s'affiche à partir du numéro.

### Comment une écriture s'inscrit
- Chaque événement = plusieurs lignes portant le **même n° d'écriture** : au moins une au débit, une au crédit, qui s'équilibrent.

Exemple — dépôt de 200 $ comptant à la banque :
```
N°  Date        Compte                    Libellé         Réf   Débit  Crédit
12  2026-07-12  1110 Compte bancaire      Dépôt comptant         200
12  2026-07-12  1205 Comptant à déposer   Dépôt comptant                200
```

### Deux portes d'entrée
- **Automatique** : vente, achat, fabrication de lot, dépôt — le système inscrit l'écriture tout seul, aux bons comptes. Ces écritures balancent toujours par construction.
- **Manuelle** : une nouvelle page dans l'admin, comme les autres pages, pour tout le reste.

### Ce qui passe par la porte manuelle
- **Compte bancaire** : dépôt du comptant · argent Square reçu · Interac reçu · client « payer plus tard » qui règle · frais bancaires · paiement d'une carte (Visa / Interac / comptant à rembourser).
- **Argent personnel** : mise de fonds · retrait.
- **Dépenses payées directement** (hors achats fournisseurs) : licences · honoraires · entretien · fourniture de bureau · déplacement · promotion.
- **Fin de période** : amortissement.
- **Au démarrage, une seule fois** : soldes d'ouverture (banque, stocks, équipement, cartes à rembourser…).
- Les **corrections** d'une entrée passent par la même porte.

### Contrôle d'équilibre
- **Par écriture** : total débits = total crédits, sinon **refus à l'enregistrement** (le minimum).
- **Global** : en tout temps, somme des débits = somme des crédits.
- La page manuelle affiche l'équilibre **en direct** pendant la saisie (« débit 200 / crédit 200 · balance ») avant d'enregistrer.

### Modèles de transactions récurrentes
- Sur la page manuelle, une liste de **modèles** : un nom, le compte au débit, le compte au crédit (déjà fixés). Tu n'entres que le montant et la date.
- C'est Chantal qui crée et modifie les modèles, comme ses autres listes.
- Un modèle peut être **récurrent** (hebdomadaire, mensuel…). Le montant n'est **pas** fixe : seuls les comptes et le rythme sont retenus.
- Rien ne s'inscrit tout seul. La liste affiche la **prochaine date** de chaque récurrente et marque celle qui vient comme « **à faire** ». Un clic, on entre le montant, c'est enregistré, la date suivante avance.
- Une récurrente sautée passé sa date reste marquée « **en retard** » jusqu'à ce qu'elle soit faite.

### Livrables imprimables (et export PDF pour le comptable)
- **Bilan** (photo à une date) : classes 1000 / 2000 / 3000. Doit égaler : **Actif = Passif + Avoir**.
- **État des résultats** (sur une période) : classes 4000 / 5000. **Revenus − dépenses = bénéfice/perte**, reporté au bilan dans l'avoir.
- **Journal** : toutes les écritures dans l'ordre — même donnée que la saisie, présentée pour l'impression.
- ✅ **FAIT (2026-07-21)** — Chaque montant du bilan et de l'état des résultats est **cliquable** : une fenêtre montre les transactions derrière (nº J-, date, description, bénéficiaire, débit, crédit, solde qui se construit). Au **bilan** : solde reporté au 31 décembre de l'année précédente, puis les transactions de l'exercice — le détail finit exactement sur le montant cliqué. À l'**état des résultats** : seulement la période, sans report. Les comptes 3015 et 3100 ne sont pas cliquables (calculés, pas tirés d'écritures).
- ✅ **FAIT (2026-07-21) — page « Grand livre »** (menu Comptabilité, bouton qui était « bientôt ») : **balance de vérification** (tous les comptes, débit/crédit, ✅ si les totaux sont égaux) + **grand livre** (chaque compte : report, mouvements, solde final). Même choix d'exercice/période que le bilan, bouton Imprimer, comptes muets sautés. Aucune donnée neuve côté serveur — c'est celle du bilan.
- **Ordre d'affichage (2026-07-21, choix de Chantal)** : l'**état des résultats en premier**, le bilan ensuite. Le choix de l'exercice sur la première ligne, la période sur la deuxième.

---

## ÉCRITURES DE VENTE (modèle déroulé)

### Principe
- Un événement = **une seule écriture**, plusieurs lignes sous le même n°, qui balancent.
- Le **mode de paiement ne change que la ligne du haut** (le compte d'actif). Tout le reste est identique.

### Compte du haut selon le mode
- Comptant → 1205 · Square → 1210 · Interac → 1215 · Payer plus tard → 1220.

### Vente complète (exemple : vente 30 $, rabais 5 $, livraison facturée 8 $, coût 12 $, vrai frais Postes Canada 9 $)
```
N°  Compte                              Débit  Crédit
7   1205 Comptant à déposer              33
7   4015 Rabais et promotions            5
7   4005 Ventes de produits                     30
7   4010 Livraison facturée                     8
7   5001 Ingrédients (coût des ventes)   12
7   1310 Inventaire de produits à vendre         12
7   5210 Frais d'expédition             9
7   2110 Postes Canada à payer                  9
```
- Le **plein prix** reste au revenu (4005); le **rabais** est chiffré à part (4015).
- **Livraison** : ce que le client paie = revenu (4010). Le **vrai coût** acheté chez Postes Canada = dépense (5210), variable, contrepartie en attente dans **2110** jusqu'à ce qu'on sache comment Postes Canada facture.
- Les lignes rabais et livraison n'apparaissent que s'il y en a.

### Remboursement (pas de crédit accumulé — argent rendu direct)
- La vente se défait : débits et crédits inversés; l'argent sort par le compte du mode de remboursement.
- **Partiel** possible : seulement l'article rendu.
- **Rabais global** : réparti au **prorata du prix** de chaque article. Ex. 2 articles à 30 $, rabais 10 $, un article rendu → sa part = 30/60 = 5 $ → on rend 25 $.
```
N°  Compte                              Débit  Crédit
9   4005 Ventes de produits              30
9   4015 Rabais et promotions                    5
9   1205 Comptant à déposer                      25
9   1310 Inventaire de produits à vendre  12
9   5001 Ingrédients (coût des ventes)           12
```
- **Exigence** : le système doit retenir, pour chaque vente, ce que chaque article a payé (pour calculer la part de rabais au remboursement).

### Encaissement Square (frais global, pas par vente)
- L'écriture de vente garde le **plein montant** dans 1210.
- À l'arrivée de l'argent à la banque, une écriture solde le « à recevoir » et sort le **frais total** d'un coup. Ex. 100 $ à recevoir, 3 $ de frais, 97 $ reçus :
```
N°  Compte                          Débit  Crédit
15  1110 Compte bancaire            97
15  5205 Frais Square               3
15  1210 Square à recevoir                 100
```
- Square dépose en **lots** (souvent une journée), pas vente par vente.
- ✅ **CODÉ le 2026-07-21 (pas déployé)** : panneau « Dépôts Square » dans le journal général. L'app demande ses dépôts à Square (le jeton a la permission, vérifié), montre pour chacun brut / frais / net et le nombre de transactions, et pose l'écriture ci-dessus **en un clic**. La **référence** de l'écriture est le numéro de dépôt Square (`po_…`), ce qui empêche tout doublon. Square fournit le **frais réel** — rien à calculer entre crédit et débit.

---

## À prévoir — étape 6 (branchements automatiques, à dérouler avant de coder)
- ✅ **Dépôt Square — FAIT le 2026-07-21 (pas déployé).** Les trois réserves notées ici ont été bordées : le **moment de l'interrogation** → c'est Chantal qui clique « Voir mes dépôts » (aucun automate, aucun déclencheur programmé dans le projet) ; le **dépôt déjà entré** → le numéro `po_…` sert de référence, un dépôt déjà inscrit n'a pas de bouton et le serveur refuse ; les **frais en attente** → on lit les frais réels sur le dépôt lui-même (payout entries), pas sur le paiement, donc ils sont toujours arrivés. Détail dans `ITEM-journal-general.md`.

---

## Encore ouvert
- Tout le plan reste ouvert à l'ajout (5000 en particulier).
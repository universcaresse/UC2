# COMPTABILITÉ — point de départ
### Notes de Chantal, 11 juillet 2026. RIEN N'EST CODÉ.
> Lire `METHODE.md` d'abord. Aucun code sans le OK de Chantal.
> Ce fichier n'est qu'un plan de départ. Les arbres complets seront déroulés
> dans une conversation dédiée, un outil à la fois.

---

## POURQUOI MAINTENANT

Chantal veut bâtir le côté comptabilité **avant que les données deviennent
trop grosses** — plus facile à faire maintenant qu'à greffer sur des mois de
ventes accumulées.

Objectif général, dans ses mots : un **« simple comptable »**. Pas un logiciel
comptable complet — des outils simples et clairs pour suivre l'argent.

**Ordre de priorité fixé par Chantal :** ces deux outils d'abord (gérer
l'argent). Le reste de la comptabilité (revenus, taxes TPS/TVQ, dépenses,
rapports pour la comptable) viendra APRÈS, dans un autre temps.

---

## OUTIL 1 — L'ARGENT COMPTANT

### Le besoin
Savoir ce qui a été vendu **comptant** pour pouvoir déposer cet argent, et
suivre ce qui reste en main.

### Ce qui est décidé
- Le site sait déjà quelles ventes sont payées comptant (mode de paiement sur
  chaque vente).
- L'outil **additionne toutes les ventes comptant** d'un côté.
- Chantal **dépose en lot** — pas le montant exact d'une vente, mais une somme
  d'un coup qui couvre plusieurs ventes.
- Chaque **dépôt est enregistré avec sa date** — obligatoire pour les lois.
- Le **solde d'argent comptant en main** se calcule tout seul :
  total des ventes comptant − total des dépôts.
- Une **trace des dépôts** est gardée (date + montant), comme un petit relevé.

### Encore à dérouler (dans la conversation dédiée)
- Comment on ajoute un dépôt (le geste, l'écran).
- Ce qui s'affiche : solde en main, liste des dépôts passés.
- Cas particuliers : dépôt effacé par erreur, correction d'un montant, etc.

---

## OUTIL 2 — LE SUIVI SQUARE

### Le besoin
Quand un client paie par Square, Chantal **ne reçoit jamais le plein montant**
dans son compte : Square garde des **frais** sur chaque transaction. L'outil
doit montrer, pour les ventes Square, la différence entre ce que le client a
payé et ce qui va réellement se déposer.

### Ce qui est décidé
- Le site sait déjà quelles ventes sont payées par Square.
- L'outil montre, pour ces ventes : le montant payé, les frais Square, et le
  net réellement déposé.

### ⚠️ Questions OUVERTES — à régler avant de bâtir
1. **Le taux exact des frais Square.** Chantal a le coût par transaction (un
   pourcentage + un montant fixe), mais **doit encore vérifier s'il est exact
   à cause des décimales**. Ce chiffre est nécessaire : c'est lui qui permet à
   l'outil de calculer les frais tout seul.
   → **Chantal confirme le taux avant qu'on code cet outil.**
2. **La présentation.** Mise de côté pour l'instant — Chantal veut d'abord se
   faire un plan. Deux pistes évoquées, à trancher plus tard :
   - même logique que le comptant (suivre les dépôts un par un), ou
   - un rapport par période (ce mois-ci : tant vendu, tant de frais, tant net).

---

## OÙ ON EN EST

- ✅ Les deux besoins sont nommés (comptant + suivi Square).
- ✅ Outil 1 (comptant) : logique décidée, prête à être déroulée en arbre.
- ⬜ Outil 2 (Square) : bloqué sur le taux exact à confirmer + présentation à
  choisir.
- ⬜ Rien de codé.
- **Prochaine étape :** ouvrir une conversation dédiée « Comptabilité » et
  dérouler l'arbre de l'Outil 1 en premier.

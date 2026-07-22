# DÉCISIONS — 12 juin 2026
### Complément à METHODE.md et ETAT.md. Décisions prises ce jour + marche à suivre.

---

## 1. CONSTAT (vérifié dans les vrais fichiers le 12 juin 2026)

1.1 **La porte de l'admin est décorative.** Le mot de passe n'allume qu'un drapeau dans le navigateur (`uc_admin`). Le serveur (`Code.gs`) n'exige rien : quiconque lit le code public peut lui envoyer directement des ordres d'écriture (changer produits, statuts, contenu, envoyer des courriels).

1.2 **À vérifier dans Code.gs :** les prix envoyés par le navigateur du client (demande de coups de cœur). Si le serveur les croit sans recalculer, ils peuvent être faussés. Pas de perte automatique (Chantal valide tout avant paiement), mais à blinder.

1.3 **Bon côté :** site non transactionnel = pas de perte d'argent directe possible. Le risque du stock est déjà encadré dans le flux.

---

## 2. DÉCISION PRISE

2.1 **Priorité no 1 : sécuriser les actions d'écriture du serveur.**
Chaque message qui modifie quelque chose devra contenir une clé secrète. Le serveur vérifie la clé avant d'obéir; sinon il refuse. Chantal l'entre une fois à la connexion, le navigateur l'ajoute tout seul ensuite. Rien ne change dans sa façon de travailler.

2.2 Les actions de **lecture** (afficher le site au public) restent ouvertes.

2.3 Certaines **écritures publiques** restent permises sans clé admin, avec leurs propres gardes :
- l'envoi d'une demande de coups de cœur par un client;
- le renvoi d'une liste modifiée (protégé par le jeton du lien `?cmd=`).

---

## 3. MARCHE À SUIVRE (un trouve-et-remplace à la fois, OK de Chantal entre chaque)

3.1 **Étape 1 — Inventaire.** Lister toutes les actions d'écriture dans `doPost` de `Code.gs` et les classer : protégées (admin) / publiques (client). Aucun code à cette étape; Chantal valide la liste.

3.2 **Étape 2 — Le coffre.** Ranger la clé secrète dans les Propriétés du script (un coffre interne d'Apps Script, jamais visible dans le code ni sur GitHub).

3.3 **Étape 3 — Le gardien.** Modifier `doPost` : toute action classée « admin » sans la bonne clé est refusée.

3.4 **Étape 4 — Le navigateur.** À la connexion admin, garder la clé en mémoire de session; `appelAPIPost` (dans `main.js`) l'ajoute automatiquement à chaque envoi. Attention : `main.js` est partagé public + admin — l'ajout ne doit rien briser côté public.

3.5 **Étape 5 — Republier.** `Code.gs` modifié → nouveau déploiement. `main.js` modifié → republier le site. Tester la connexion et une sauvegarde.

3.6 **Étape 6 — Les prix.** Vérifier puis corriger : le serveur recalcule les prix d'une demande à partir de ses propres feuilles, jamais ceux envoyés par le client.

---

## 4. POINTS DE VIGILANCE

4.1 Tant que l'étape 5 n'est pas publiée, **ne pas tester entre les étapes 3 et 4** : le serveur refuserait les envois de l'admin.

4.2 Si la clé est changée un jour : la changer dans le coffre (étape 2) seulement; rien d'autre à toucher.

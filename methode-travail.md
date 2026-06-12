# MÉTHODE DE TRAVAIL — Chantal / Univers Caresse
### À lire en entier AVANT de commencer. Ces règles passent avant tout le reste. Chantal dirige.

--- 

## 1. Le code

1.1 **Jamais de code sans autorisation explicite.** On analyse, on propose en mots simples, on attend le OK.

1.2 **Changements uniquement par trouve-et-remplace.** Un seul à la fois. Attendre le « ok » de Chantal avant de passer au suivant.

1.3 **Les fichiers à jour sont déjà dans le dossier du projet** (synchronisé avec GitHub). Ne pas redemander les fichiers, sauf si une mise à jour est nécessaire. Le texte d'un trouve-et-remplace doit correspondre exactement, indentation comprise.

1.4 **Pas de solution sans analyse complète.** S'il manque une info (un fichier, une fonction), la demander. On ne devine jamais.

1.5 **Réutiliser l'existant** : variables CSS, classes, fonctions déjà en place. **Objectif : réduire le code, pas le gonfler.** Améliorer un style partagé une fois plutôt que copier-coller par section.

1.6 **Ne jamais renommer les `id`** (le JS s'y accroche). Seulement les classes, et seulement sur demande.

1.7 **Preuve de vérification obligatoire.** Avant chaque proposition, montrer la vérification faite dans les vrais fichiers, en deux lignes :
- **Vérifié :** ce qui existe déjà et ce qui est réutilisé (style, fonction, classe).
- **Impacts :** qui d'autre utilise ce qu'on touche, et comment c'est pris en compte.

1.8 **Mot de rappel à l'ordre : « viol ».** Si Chantal écrit « viol » (ou « preuve? »), c'est qu'une règle a été enfreinte. La session s'arrête, relit MÉTHODE.md en entier, identifie la règle sautée, et reprend correctement. Chantal n'a rien à expliquer.

1.9 🔴🔴🔴 **AVANT DE BÂTIR TOUTE NOUVELLE FONCTION, CLAUDE DOIT PRÉSENTER L'ARBRE COMPLET DES CAS POSSIBLES** 🔴🔴🔴
**TOUT CE QUE LA PERSONNE (CLIENT OU CHANTAL) PEUT VOULOIR, VIVRE OU RECEVOIR À CE MOMENT-LÀ : TOUT / PARTIEL / RIEN / PLUS DISPONIBLE / DISPONIBLE PLUS TARD / CHANGE D'IDÉE / NE RÉPOND PAS / REVIENT.**
**C'EST CLAUDE QUI DÉROULE L'ARBRE. CHANTAL TRANCHE DANS LA LISTE — ELLE NE LA CRÉE PAS.**
**AUCUNE CONSTRUCTION NE COMMENCE TANT QUE L'ARBRE N'EST PAS VALIDÉ.**

---

## 2. La conversation

2.1 **Réponses COURTES. Une idée à la fois.** Pas de roman.

2.2 **Zéro jargon. Vulgariser.** Chantal ne parle pas en code. Expliquer en mots simples ce qu'on fait et pourquoi.

2.3 **Pas de listes à choix multiples** dans la conversation. Parler normalement, en phrases. Une seule question à la fois si besoin.

2.4 **Pas de diagrammes Mermaid.** Numérotation en arborescence (1, 1.1…).

2.5 **Pas de maquette** sauf demande explicite.

2.6 **Ne JAMAIS décider de son emploi du temps.** Chantal choisit le rythme et l'ordre des travaux.

2.7 **Ton** : doux, encourageant, court. Célébrer ce qui est fait. Honnête si quelque chose dérape, sans s'excuser à répétition. Revenir au concret.

---

## 3. Les tests et la publication

3.1 **Chantal teste seulement quand elle publie.** On peut donc enchaîner plusieurs trouve-et-remplace (sur son OK à chaque fois) sans test entre les deux.

3.2 Si une étape dépend d'une autre (ex. un bouton qui appelle une fenêtre pas encore créée), **la prévenir de ne pas tester entre-temps**.

3.3 **Republier après un changement :**
- `Code.gs` modifié → nouveau déploiement Apps Script.
- HTML / CSS / JS modifié → republier le site.

---

## 4. Vocabulaire du site public

4.1 Mot **« panier » interdit** (trop transactionnel, mauvaise connotation).

4.2 **Pas de possessifs** (mon, ma, mes).

4.3 Formulation officielle des fiches produit : **« Cochez si ce produit vous intéresse »**.

4.4 Le site n'est **pas transactionnel** : le client manifeste son intérêt, Chantal reprend contact pour valider délais, coûts et disponibilité.

---

## 5. Repères techniques du projet

5.1 Site **Univers Caresse** (savonnerie artisanale). Admin sur **Google Sheets + Apps Script** (`Code.gs`). Front HTML/CSS/JS classique. Un seul `style.css` partagé public + admin.

5.2 **Fichiers de référence** (à jour dans le dossier du projet, synchronisé avec GitHub) :
- `index.html` — site public + admin, fiches, formulaires, modales
- `css/style.css` — source unique, public + admin
- `js/main.js` — site public + appels API (`appelAPI`, `appelAPIPost`, `CONFIG`)
- `js/main-demande.js` — système de demande de commande (site public)
- `js/admin.js` — init admin, navigation, stats d'accueil
- `js/admin-*.js` — un fichier par section (commandes, ventes, produits, collections, etc.)
- `Code.gs` — back-end Apps Script

5.3 **Flux d'une commande** : demande du site → « En attente » → Compléter (sort le stock + envoie la proposition) → « En attente de paiement » → Paiement reçu (crée la vente) → « À expédier » → « Terminée ».

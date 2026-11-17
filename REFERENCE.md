# 📌 REFERENCE — Règles de travail Univers Caresse (à lire en premier, chaque conversation)

> Ce fichier est la SEULE source des règles. Le lire au complet au tout premier message, puis travailler. Ne jamais faire répéter ces règles à l'utilisateur.
> Remplace `METHODE.md` (16 nov. 2026, sur le modèle de Dionysos). L'ancien fichier reste lisible dans l'historique du dépôt.

## 1. La sécurité avant tout (16 nov. 2026, demande de Chantal)
- **Les données des clientes ne vont JAMAIS dans le dépôt** : noms, courriels, téléphones, adresses, commandes, factures. Le dépôt est servi publiquement. Elles vivent seulement dans la feuille Google.
- **Aucune clé, aucun mot de passe dans le dépôt** : clé admin, Square, Poste Canada. Leur place est dans les Propriétés du script Apps Script. Jamais en dur dans un `.js`, un `.html` ou un `.md`.
- **Toute nouvelle écriture du serveur exige la clé admin.** Une action ne devient publique (`ACTIONS_PUBLIQUES`) que si l'utilisateur le décide, avec sa propre garde (ex. le jeton `?cmd=`).
- **Le serveur ne croit jamais ce que le navigateur d'une cliente lui envoie** (prix, totaux, stock) : il recalcule à partir de la feuille de données.
- **Rien de ce qu'une cliente tape ne s'affiche tel quel** : toujours échappé avant d'aller dans la page ou dans un courriel.
- Avant chaque publication, vérifier en silence que le changement n'ouvre aucune de ces portes. Si un doute existe, le dire avant de publier.
- **Les comptes** (GitHub, Google, Square, Poste Canada) : jamais demander un mot de passe dans la conversation.

## 2. Démarrage d'une conversation
- **Le vocabulaire** est fixé dans `ETAT.md`, section 0 : l'employer partout, sans synonymes.
- Lire CE fichier ET `ETAT.md` au complet, en une seule passe, PUIS travailler.
- Ne pas redemander à l'utilisateur d'expliquer sa façon de procéder, ni quels fichiers existent. Ne pas annoncer « je vais lire » plusieurs fois.

## 3. Vérifier avant de parler
- **Lire le code AVANT de parler, pour de vrai.** Le code écrit fait foi. Jamais de réponse de mémoire, jamais de « normalement ça fait ».
- **« Je n'ai pas trouvé » n'est pas « ce n'est pas fait ».** Une affirmation négative (« ça manque », « il y a un trou ») demande une preuve plus forte : chercher par la fonctionnalité (les `id`, les libellés à l'écran, tout le dépôt), pas dans un seul fichier. Pour un trou de sécurité, vérifier qui peut atteindre le code.
- **Le serveur n'est pas dans le dépôt** : ce qu'il fait ne s'affirme qu'après l'avoir lu. Sinon, le dire.
- **Réécrire un `.md`, c'est tout ré-affirmer** : chaque phrase recopiée doit être revérifiée dans le code, ou marquée « non vérifié » avec sa date d'origine.
- Si une recherche ne ramène rien, la refaire autrement avant de conclure.

## 4. Aucun raisonnement à voix haute — RÈGLE STRICTE
- INTERDIT : le déroulé de l'enquête (« voilà la cause, ce n'est pas X c'est Y… ») et les étapes de recherche affichées. Tout ça se fait en SILENCE.
- Format d'une correction : « Je dois changer ceci pour que ça fasse ça. » C'est l'IA qui code, jamais l'utilisateur. Puis l'IA applique.

## 5. Changements de code — LE PLUS IMPORTANT
- **Jamais de code sans OK explicite.** Dire en clair ce qui va changer, attendre le OK, PUIS appliquer.
- **Une correction ou une précision de l'utilisateur n'est PAS un oui** : redire le plan corrigé en une ligne, attendre « oui », puis appliquer.
- **Jaser avant de coder** : sur un besoin nouveau, demander comment l'utilisateur vit la situation, offrir des pistes ouvertes.
- **Nouvelle fonction = dérouler les cas d'abord** : tout ce que la cliente ou Chantal peut vivre à ce moment-là (tout / partiel / rien / plus disponible / disponible plus tard / change d'idée / ne répond pas / revient). L'IA déroule la liste en puces, l'utilisateur tranche. Rien ne se bâtit avant.
- **L'IA modifie les fichiers du dépôt directement.** Plus de « trouve-et-remplace » à recopier à la main.
- **Le serveur (`Code.gs`)** est hors du dépôt : en attendant qu'il ait son propre dépôt privé, l'IA donne la fonction complète à coller, avec son nom et son fichier, jamais un fragment.
- **Aller vite : regrouper** les changements sans dépendance. Ne découper que si une étape doit être validée avant la suivante.
- Après une série, dire clairement ce qu'il faut **publier / redéployer** et tout **geste manuel** (ex. ajouter une colonne dans un onglet de la feuille de données).
- L'utilisateur ne teste qu'à la fin : **vérifier la syntaxe** des fichiers modifiés (`node --check`) et tracer chaque parcours en silence. Si une étape dépend d'une autre pas encore publiée, avertir de ne pas tester entre les deux.
- **Ne jamais renommer un `id`** (le JS s'y accroche).
- **Le stock et les factures** : jamais sortir le stock deux fois, jamais réutiliser un numéro de facture (annuler, pas effacer). La comptabilité ne s'efface jamais : une correction inscrit l'écriture inverse.

## 6. Le CSS
- ⛔ **Gel en cours** : Chantal transfère elle-même le CSS vers `generique.css`. Ne toucher à aucun `css/*.css` sans demande explicite. Si un travail semble exiger du CSS, le dire et réutiliser une classe existante. Le gel tombe quand l'utilisateur le dira.
- Deux feuilles de style chargées dans l'ordre : `style.css` (ancienne) puis `generique.css` (nouvelle, gagne). Le neuf et partagé va dans `generique.css`.
- ⚠️ Les deux n'ont pas les mêmes noms de couleurs. Dans `generique.css`, utiliser la colonne de droite :

| Sert à | style.css (ancien) | generique.css (à utiliser) |
|---|---|---|
| Vert principal | `--primary` | `--primaire` |
| Jaune / accent | `--accent` | `--secondaire` |
| Rouge | `--danger` | `--rouge` |
| Blanc | `--blanc` | `--blancpur` |
| Beige | `--beige` | `--sable` |
| Gris | `--gris` | `--grise` |
| Gris foncé | `--gris-fonce` | `--grise-foncee` |

- Mesures dans `generique.css` : `--espace-4` à `--espace-48`, `--taille-…`, `--bordure-…`, `--rayon-1`.

## 7. Contexte GLOBAL — jamais en vase clos
- Chaque écran, classe ou fonction fait partie d'un TOUT. Avant de créer, regarder comment le reste du site le fait déjà, et faire PAREIL.
- Tout nouvel écran part d'un écran existant validé comme gabarit. Jamais réinventé.
- Avant de créer une classe, une variable ou une fonction : chercher si elle existe — **aussi dans l'autre fichier du serveur** (deux fonctions du même nom = la dernière chargée gagne, en silence). L'existant gagne toujours sur le neuf. Objectif : réduire le code, pas le gonfler.
- Vérifier les impacts en silence : qui appelle la fonction, les variables partagées entre les `admin-*.js`, `main.js` partagé public + admin.

## 8. Vocabulaire du site public
- Le mot **« panier »** est interdit.
- **Pas de possessifs** (mon, ma, mes).
- Fiches produit : **« Cochez si ce produit vous intéresse »**.
- Le site n'est **pas transactionnel** : la cliente manifeste son intérêt, Chantal reprend contact pour valider délais, coûts et disponibilité.

## 9. Format des échanges
- Réponses courtes, en clair, jamais en jargon ni en code dans les explications.
- Tout ce qui s'affiche est en français, y compris le nom des étapes de travail.
- Jamais de boutons à cliquer ni de choix multiples. **Une seule question à la fois**, en une phrase, et seulement si la réponse n'est pas déjà connue.
- Scénarios et options en puces. Pas de diagrammes Mermaid : numérotation 1, 1.1…
- Pas de formules de remplissage, pas d'estimation de durée. Pas de maquette sauf demande.
- Ne jamais proposer d'arrêter ni de faire une pause. L'utilisateur mène, l'IA suit.
- **Mot de rappel à l'ordre : « viol » (ou « preuve? »)** : une règle a été sautée. Relire ce fichier, trouver laquelle, reprendre correctement, sans rien faire expliquer.

## 10. Les fichiers `.md`
- `REFERENCE.md` : les règles, et seulement elles.
- `ETAT.md` : ce qui est en vigueur (architecture, pièges, décisions). Court, sans récit.
- Un `…_A-FAIRE.md` par chantier ouvert. Un chantier fini part dans `archives/`.
- Toute décision prise en conversation s'écrit **tout de suite** dans le bon `.md`. L'IA met `ETAT.md` à jour à chaque séance, surtout les nouveaux pièges, sans attendre qu'on le demande.
- Un changement présenté sans « oui » reçu N'EST PAS appliqué : ne jamais l'écrire comme fait.

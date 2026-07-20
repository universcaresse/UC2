# RELAIS — Coups de cœur (Univers Caresse)
## Pour le prochain Claude. Chantal a TOUT validé ici : NE PAS reposer de questions. Dérouler les trouve-et-remplace un à la fois, attendre son « ok » entre chacun.

---

## 1. Règles de travail (METHODE.md — la lire au complet AVANT de proposer quoi que ce soit)
- Jamais de code sans OK. Un seul trouve-et-remplace à la fois, attendre « ok ».
- **Vérifier dans les vrais fichiers avant CHAQUE proposition.** Preuve en 2 lignes : `Vérifié :` / `Impacts :`.
- **Blocs larges, pas de découpage à la virgule près.** Chantal voit dans la même fenêtre ce qui vient d'être fait.
- **Ancres uniques.** Toujours demander à Chantal combien d'occurrences son éditeur trouve si le moindre doute. Une ancre qui matche 2 ou 3 fois = perte de temps et de confiance.
- **JAMAIS de style inline dans le JS.** Le style va dans le CSS.
- **JAMAIS d'ajout dans style.css.** Tout le nouveau va dans `css/generique.css`, en français, en réutilisant l'existant.
- Ne jamais renommer les `id`. Réutiliser l'existant, réduire le code.
- Réponses courtes (3 lignes), zéro jargon, une seule question par message, pas de listes à choix.
- Ne jamais proposer d'arrêter. Chantal décide du rythme.
- Vocabulaire public : jamais « panier », pas de possessifs.
- Lire un fichier ne demande PAS d'autorisation. Le faire, sans demander.

---

## 2. État actuel — fait et posé (à publier / tester)

### `js/main-demande.js` — 100 % generique
- Syntaxe validée. **Zéro style inline. Zéro `class="bouton …"` de l'ancien vocabulaire** (sauf le bouton « Retirer », voir TRAVAIL 2).
- Vocabulaire : `boutons`, `boutons-vert`, `boutons-contour`, `boutons-rouge`, `boutons-accent`, `boutons-petit`, `boutons-pleine-largeur`, `rangeeitem`, `rangeeitem-photo`, `sur-titre`, `lignetotal`, `textes-discrets`, `champ`, `libelle`, `controle`, `titre`, `actions`.
- Tous les boutons « Fermer » : `boutons boutons-vert boutons-pleine-largeur`.
- Nouvelle fonction partagée `ouvrirContactCommande(res, numero)` (près de « MODAL DE LA LISTE ») : remplit prénom, nom, courriel + option de sujet « Question —  <numéro> ». Branchée sur : pages bloquées, « délai dépassé », `prop-ecrivez`, `prop-ecrivez2`, `adr-ecrivez`, `adr-ecrivez2`, page « Paiement », lien « J'ai une question » (bloc2, variable `cmd_id`).
  - Seule exception : le « lien cassé » (la commande n'a pas pu s'ouvrir, rien à pré-remplir).
- Photos ajoutées dans `coupdecoeurRendre` (`rangeeitem-photo`, `i.image_url`).
- Drapeau `coupdecoeurTouche` : levé au 1er geste (plus / moins / retirer), `coupdecoeurRendre()` rappelé juste après.
  - Bouton = « Conserver la commande » (`data-action="conserver"`) tant que rien n'est touché.
  - Devient « Retourner la commande modifiée » (`data-action="renvoyer"`) dès le 1er geste, et le reste.
  - `conserver` : `demandeVider()` + retire `uc_modif_cmd` (localStorage) et `uc_modif_active` (sessionStorage) + `naviguer('accueil')`. Rien envoyé au serveur.
  - Renvoi réussi : même nettoyage + page « Merci ! ».
- `demandeRenvoyerModif` cible maintenant `#demande-vue-liste [data-action="continuer"]` (avant : `.demande-continuer`, qui attrapait le mauvais bouton).

### `css/generique.css`
- `--noir-50` créé. `.voile` utilise `var(--noir-50)`.
- `.textes-discrets` a maintenant `margin: var(--espace-12) 0 var(--espace-24);`
- Section « Pied de page » remplie : `.pieddepage` (image de fond Cloudinary + `::before` voile `--noir-50` + `> * { position:relative; z-index:1 }`), `.pieddepage .titre` et `.pieddepage .textes-discrets` en `--blancpur`, média mobile (colonne, 20px, gap 6px).

### `css/style.css`
- Retirées : `footer`, `footer::before`, `footer > *`, `.footer-logo`, `.footer-tagline`, la règle mobile `footer`.
- Ajoutées : `#demande-vue-liste > .bouton` dans la règle pleine largeur; `.demande-modal { padding: 32px 16px }` en mobile; `#modal-apercu-proposition-contenu a, … button { pointer-events: none }` (aperçu de proposition non cliquable); `#section-coupdecoeur .titre` / `.textes-discrets` (marges).

### `index.html`
- Pied de page : `<footer class="pieddepage">` avec `.titre`, `.slogan`, deux `.textes-discrets`.

**Republier = site seulement. Aucun changement à Code.gs à ce jour.**

---

## 3. TRAVAIL 1 — Page vide après retrait (bug)
**Le problème :** quand le client retire son dernier produit, `coupdecoeurRendre` affiche la branche « liste vide » — qui n'a **pas** de bouton `renvoyer`. Le message « Votre liste est vide… » est attaché à `data-action="renvoyer"` : il ne s'affiche donc jamais. Le client se retrouve devant une page sans explication.

**À faire :** dans la branche « liste vide » de `coupdecoeurRendre`, faire varier le paragraphe selon `coupdecoeurTouche` :
- `false` (arrivée sur une commande vide) → texte actuel : « Votre liste est vide pour le moment. Ajoutez au moins un produit pour nous l'envoyer. »
- `true` (le client vient de tout retirer) → **texte validé par Chantal** : « Vous avez retiré tous les produits. Ajoutez-en au moins un pour nous envoyer votre liste, ou utilisez le bouton d'annulation si vous ne souhaitez plus donner suite. »

Conforme au point 3 de l'arbre (liste vidée → pas de bouton d'envoi; le bouton « Annuler » reste offert).

---

## 4. TRAVAIL 2 — Bouton « Retirer » + nouvelle classe generique
Le bouton « Retirer » des rangées (`coupdecoeurRendre`) est le **dernier** reste de l'ancien vocabulaire : `class="bouton bouton-contour bouton-petit"`.

**Décision de Chantal :** créer dans generique une classe plus petite que `boutons-petit`, nommée **`.boutons-minuscule`**.
- Repère : `.boutons-petit` = `padding: var(--espace-10) var(--espace-16); font-size: var(--texte-68);`
- Cible proposée : `padding: var(--espace-4) var(--espace-10); font-size: var(--texte-62);`
- ⚠️ `--texte-62` **n'existe pas** dans generique. Le créer dans `:root` (`--texte-62: 0.62rem;`) ou réutiliser `--texte-68`. Vérifier avant de proposer.

Puis passer le bouton à `class="boutons boutons-contour boutons-minuscule"`.

---

## 5. TRAVAIL 3 — Statut « En attente de paiement » : bouton de renvoi
**Le manque :** dans le statut « En attente de paiement », il n'y a aucun bouton pour simplement **retourner la proposition telle qu'envoyée précédemment** (sans payer, sans rien modifier).

**Décision de Chantal :** c'est **exactement le même geste** que le bouton existant « Recevez à nouveau votre proposition » (`prop-renvoyer` / `prop-renvoyer2`). Réutiliser ce mécanisme, pas en créer un nouveau.

À faire : ajouter ce bouton dans la vue « En attente de paiement » (chercher `res.statut === 'En attente de paiement'` dans `main-demande.js`, autour de la ligne 707). Vérifier quel appel API `prop-renvoyer` déclenche et le réutiliser tel quel.

---

## 6. TRAVAIL 4 — Intro : varier le mot « Bienvenue »
Fichiers : `js/intro.js`, `css/intro.css`, `index.html` (`<div class="uc-intro-welcome">Bienvenue</div>`).

Le site lit déjà les paramètres d'adresse (`new URLSearchParams(window.location.search)`) : `cmd`, et `action` = `payer` / `modifier` / `question`.

**Textes validés par Chantal :**
| Porte d'entrée | Texte |
|---|---|
| `?cmd=…` sans `action` (1er courriel, la proposition) | Vos Coups de cœur |
| `action=payer` | Vos Coups de cœur vous attendent |
| `action=modifier` | Revoyez vos Coups de cœur |
| `action=question` | Vos Coups de cœur |
| Visite normale (aucun paramètre) | Bienvenue |

Dans `intro.js`, lire les paramètres au début de la fonction anonyme et écrire le texte dans `.uc-intro-welcome` **avant** `demarrerSequence()`.

---

## 7. TRAVAIL 5 — Intro : le mot part brutalement (NON RÉSOLU)
**Le symptôme :** le mot « Bienvenue » arrive en fondu (2,4 s), mais disparaît d'un coup à 8,2 s. Le logo, lui, part doucement ensuite. Sur tous les appareils.

**Ce qui a été éliminé — ne pas refaire ces vérifications :**
- `.uc-intro-welcome` a bien `transition: opacity 2.4s ease;` sur la **classe de base** (donc l'aller et le retour devraient durer 2,4 s).
- Aucune règle `uc-intro` dans `style.css` ni dans `generique.css`. Aucun conflit de spécificité.
- `prefers-reduced-motion` n'est pas en cause (le problème persiste sur tous les appareils).
- Le minuteur de secours (17 s) n'est pas en cause : la séquence se rend jusqu'au voyage du logo.
- Rien ne retire l'élément du DOM avant 10,8 s.

**Pistes non explorées :**
- `intro.css` est chargé via `../css/intro.css` (deux points), alors que les scripts sont en `js/main.js` (sans les deux points). Vérifier que le fichier se charge bien (onglet Réseau, 404?). Chantal est sur iPad, elle ne peut pas inspecter — le vérifier autrement.
- Le mot finit son apparition à 7,3 s (4,9 + 2,4) et on lui retire `uc-show` à 8,2 s. La marge est de 0,9 s. Vérifier qu'aucun `will-change`, `contain` ou reflow ne bloque la transition inverse sur iOS Safari.

**Ne pas proposer de changement cosmétique (allonger la durée) sans avoir trouvé la cause.** Chantal l'a explicitement refusé.

---

## 8. Points de vigilance
- L'ouverture/fermeture de la fenêtre passe par la classe `ouvert` sur `.voile` — ne pas toucher.
- `demandeVider()` vide la liste **et** son stockage. `uc_modif_cmd` (localStorage) et `uc_modif_active` (sessionStorage) sont séparés : les retirer explicitement.
- Le courriel du client est renvoyé par le serveur (`res.courriel`) et pré-rempli dans le formulaire de contact. Chantal a tranché : c'est voulu, l'information est déjà dans les feuilles.
- Chantal teste **seulement quand elle publie**. Si une étape dépend d'une autre, la prévenir de ne pas tester entre-temps.
- Trois changements récents à surveiller à l'écran : les noms de collection sont passés du doré au gris (`.sur-titre`); le champ « Code postal » a perdu son fond beige; l'espacement des boutons de l'écran d'annulation.

---

## 9. Ordre de travail
1. TRAVAIL 1 (page vide) — un ou deux trouve-et-remplace.
2. TRAVAIL 2 (`.boutons-minuscule` + bouton Retirer) — la classe d'abord, le bouton ensuite.
3. TRAVAIL 3 (bouton de renvoi en attente de paiement).
4. TRAVAIL 4 (textes de l'intro).
5. TRAVAIL 5 (fondu de l'intro) — enquête, pas de rustine.
6. Rappeler à la fin : republier le site (pas de redéploiement Apps Script sauf si Code.gs bouge).

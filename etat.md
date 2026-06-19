


## FAIT — session du 17 juin 2026 (soirée)

Grosse session. Trois chantiers : le verrou de proposition + boutons du premier courriel, le look de la page client, et la collection/gamme affichées PARTOUT.

---

### A — Verrou « Verrouillée » (le client ne peut plus toucher la commande pendant qu'on la traite) → FAIT
Décidé avec Chantal : pas de minuterie (trop risqué), la commande verrouillée reste visible et se reprend à la main.
- **admin-commandes.js, `ouvrirFormCompleter`** : pose le statut **Verrouillée** (via `updateStatutCommande`), seulement si la commande venait de « En attente ».
- **`fermerFormCompleter`** : si on ferme **sans avoir envoyé** (drapeau `window.cmdCompleterEnvoiEnCours`), remet « En attente ». Le drapeau évite d'écraser le « En attente de paiement » après un vrai envoi.
- **`envoyerPropositionV3`** : lève le drapeau au début + **remet « En attente » juste avant `sortirStockCommande`**. ⚠️ Obligatoire : `sortirStockCommande_v2` REFUSE tout statut autre que « En attente ».
- **`afficherTableauCommandes`** : nouveau bloc **VERROUILLÉES** (après ENTRANTES).
- **`voirDetailCommande`** : sur une « Verrouillée », un seul bouton **« Reprendre la proposition »** (rouvre `ouvrirFormCompleter` sans re-verrouiller).
- Edge voulu : abandon brutal (onglet fermé) → reste Verrouillée, visible dans VERROUILLÉES, à reprendre à la main.

### B — Deux boutons dans le PREMIER courriel (à la demande) → FAIT
- **Code.gs, `envoyerDemandeCommande_v2`** : le jeton, avant déclaré dans un `try` (invisible), est maintenant `let jeton` au niveau fonction. Boutons **Modifier la liste** (`?cmd=…&jeton=…`) et **Annuler** (`&action=annuler`).
- **main-demande.js** : la page client accepte maintenant le statut **« En attente »** en plus de « En attente de paiement » (`res.statut !== … && res.statut !== 'En attente'`). Verrouillée/Annulée restent bloqués.
- ⚠️ Limite connue : le bouton **Annuler** mène à la page liste (où le bouton d'annulation est déjà présent en bas), pas direct à l'écran d'annulation. À améliorer plus tard = bifurcation `action === 'annuler'` dans le handler `?cmd=` de main-demande.js.

### C — Déblocage du renvoi pour une commande encore « En attente » → FAIT
Le client qui corrige depuis le premier courriel était bloqué (« cette commande ne peut plus être modifiée »).
- **Code.gs, `renvoyerListeCoupdecoeur_v2`** : la garde accepte maintenant « En attente » en plus de « En attente de paiement ». Si c'était « En attente » → **reste « En attente »** (Entrantes); si « En attente de paiement » → « Modifiée » (comme avant). Coquille `i.nom_gamme` → `l.nom_gamme` corrigée (empêchait ton courriel de modif de partir).

### D — Look de la page client « coups de cœur » → FAIT
Tout en CSS **scopé à `#section-coupdecoeur`** (jamais de classe partagée → l'admin ne bouge pas). Ajout au bas de **style.css** :
- Produits/total/boutons alignés sur la marge du titre (`--padding-page` desktop, 16px mobile).
- Boutons du bas (et zone bloquée) en pleine largeur (`> .bouton { display:flex; width:100% }`).
- Total qui ne se coupe plus (`nowrap` sur la valeur).
- Mobile : titre ramené à 16px (l'id bat la vieille règle qui gagnait par spécificité); rangée produit sur 2 lignes (nom seul, puis − + · Retirer · prix à droite via `flex-wrap` + `flex:1 1 100%` + `margin-left:auto`).
- `.lien-discret` stylé en vert (avant : bleu souligné brut).

### E — Collection + gamme affichées PARTOUT → FAIT
Repères feuilles : **Produits_v2** (COL-id = col 2 / index 1, GAM-id = col 3 / index 2, nom = index 4) · **Collections_v2** (COL-id index 0, nom index 2) · **Gammes_v2** (GAM-id index 0, nom index 3).
- **Courriels de demande** (`envoyerDemandeCommande_v2`) : le serveur redéduit collection+gamme par pro_id (maps `colParPro`/`gamParPro`), affichées dans le courriel client (HTML) et le tien (texte).
- **Page de modification** (main-demande.js, `coupdecoeurRendre`) : ligne collection dorée ajoutée au-dessus du nom.
- **Page « prêt / à venir / non dispo »** (main-demande.js, `afficherPageUniqueBloc2` → `rangee`) : collection + gamme ajoutées.
- **Courriel de proposition** (`envoyerProposition_V3`) : `rangeeHTML` affiche collection·gamme; les infos sont fournies par **admin-commandes.js** (`apercuProposition` ET `envoyerPropositionV3`, via `donneesCollections`/`donneesGammes`).
- **Courriel de renvoi** (`renvoyerListeCoupdecoeur_v2`) : serveur redéduit (mêmes maps).
- Garde partout : si collection/gamme absente, rien ne s'affiche.

---

### À PUBLIER (tout en attente de test de bout en bout)
- **Republier le site** : index.html (aucun), css/style.css, js/main-demande.js, js/admin-commandes.js.
- **Redéployer Apps Script** : Code.gs (A, B, C, E).

### À VÉRIFIER au prochain test
- Verrou complet : ouvrir → VERROUILLÉES; fermer sans envoyer → ENTRANTES; envoyer → En attente de paiement + stock sorti (ne doit PAS planter).
- Premier courriel : Modifier ouvre la liste; le client peut renvoyer (reste En attente); Annuler fonctionne.
- Collection + gamme présentes dans : page modif, page bloc 2/3, courriel de demande (client + toi), courriel de proposition + son aperçu, courriel de renvoi.
- Look client OK sur iPhone ET iPad.

### RESTE OUVERT


Bouton « Annuler » du premier courriel : le rendre direct (voir B).
Relance de proposition (confirmerRelanceV3) : pas encore enrichie de collection/gamme (les deux autres chemins de proposition le sont).
Uniformiser les titres de toutes les pages publiques sur le modèle de la page coups de cœur (bloc page-entete : petit mot doré page-entete-eyebrow + grand titre page-entete-titre Playfair avec <em> en vert). Aujourd'hui chaque page a son propre habillage (page « qui sommes-nous » via page-hero, contact via contact-info-titre, etc.). À faire dans une session fraîche : regarder chaque page une à une dans index.html, puis soit poser le même bloc de titre partout, soit harmoniser via le CSS — ⚠️ prudence avec le CSS partagé (.page-entete est aussi utilisé par l'admin, ne pas le faire bouger).




## FAIT — session du 17 juin 2026 (verrou + premier courriel) 18h09


Deux chantiers : enrichir les courriels de demande, et protéger la commande pendant qu'on prépare la proposition.

### A — Collection + gamme dans les deux courriels de demande → FAIT
Avant : les courriels ne montraient que produit + poids. Maintenant : collection · gamme aussi, comme à l'écran. Utile car des noms de produits se répètent.
- **main-demande.js, `demandeEnvoyer`** : la liste envoyée au serveur emporte maintenant `nom_collection` et `nom_gamme` (le site les avait déjà, il ne les transmettait pas).
- **Code.gs, `envoyerDemandeCommande_v2`** : courriel à Chantal (`lignesTxt`) → préfixe « Collection · Gamme — » devant le nom (garde si absente). Courriel client (`lignesHTML`) → petite ligne dorée collection · gamme au-dessus du nom (garde si absente).

### B — Verrou « Verrouillée » : le client ne peut plus toucher la commande pendant qu'on la traite → FAIT
Principe décidé avec Chantal : dès que Chantal ouvre la proposition, la commande se verrouille; si elle ferme sans envoyer, ça revient en « En attente »; si elle envoie, ça passe en « En attente de paiement ». Pas de minuterie (trop risqué) — la commande verrouillée reste visible et se reprend à la main.

Tout dans **admin-commandes.js** sauf indication :
- `ouvrirFormCompleter` : pose le statut **Verrouillée** (via `updateStatutCommande`), seulement si la commande vient de « En attente ».
- `fermerFormCompleter` : si on ferme **sans avoir envoyé** (drapeau `window.cmdCompleterEnvoiEnCours`), remet « En attente ». Le drapeau évite d'écraser le « En attente de paiement » après un vrai envoi.
- `envoyerPropositionV3` : lève le drapeau au début; **remet « En attente » juste avant `sortirStockCommande`** — obligatoire, car la sortie de stock REFUSE tout statut autre que « En attente » (`sortirStockCommande_v2`).
- `afficherTableauCommandes` : nouveau bloc **VERROUILLÉES** dans la liste (après ENTRANTES).
- `voirDetailCommande` : sur une commande « Verrouillée », un seul bouton **« Reprendre la proposition »** (rouvre `ouvrirFormCompleter` sans re-verrouiller).

### C — Deux boutons dans le PREMIER courriel (à la demande) → FAIT
Le courriel que le client reçoit en envoyant ses coups de cœur a maintenant **Modifier la liste** et **Annuler**, pour corriger une erreur avant qu'on traite.
- **Code.gs, `envoyerDemandeCommande_v2`** : le jeton, avant déclaré dans un `try` (invisible plus bas), est maintenant `let jeton` au niveau de la fonction → utilisable dans le courriel. Lien : `https://universcaresse.ca/?cmd=...&jeton=...`. Bouton Modifier → lien de base; bouton Annuler → `&action=annuler`.
- **main-demande.js** : la page client accepte maintenant le statut **« En attente »** en plus de « En attente de paiement » (`res.statut !== ... && res.statut !== 'En attente'`). Tout autre statut (Verrouillée, Annulée) reste bloqué → le verrou tient.

### À publier
- **Republier le site** (admin-commandes.js + main-demande.js).
- **Redéployer Apps Script** (Code.gs : A et C).

### À VÉRIFIER au test
- Verrou : ouvrir une proposition → la commande apparaît dans VERROUILLÉES; fermer sans envoyer → revient dans ENTRANTES; envoyer → « En attente de paiement », stock sorti (ne doit PAS planter).
- « Reprendre la proposition » sur une verrouillée rouvre bien le formulaire.
- Premier courriel : les deux boutons mènent à la bonne page; « Modifier la liste » ouvre la liste; le client peut renvoyer.
- Courriels : collection + gamme s'affichent (les deux courriels).

### LIMITES CONNUES / À FAIRE PLUS TARD
- Le bouton **« Annuler »** du courriel ne va pas DIRECT à l'écran d'annulation : il mène à la page liste, où le bouton « Je ne veux plus donner suite… » est déjà présent en bas. Rendre l'annulation directe = bifurcation `action === 'annuler'` à ajouter dans le handler `?cmd=` de main-demande.js.
- Dépendance à confirmer : `getCommandePublique` (Code.gs) doit bien renvoyer statut + lignes pour une commande « En attente » (sinon « Modifier la liste » du premier courriel n'ouvrira rien).
- Edge : si Chantal quitte brutalement (onglet fermé, plantage) pendant la proposition, la commande reste « Verrouillée » → visible dans VERROUILLÉES, à reprendre à la main. Comportement voulu.




## FAIT — session du 17 juin 2026

Suite des 3 bugs trouvés au test de Chantal (proposition envoyée, client modifie/paie/pose une question).

### Bug #1 — spinner au renvoi de liste
Fait (session précédente). Spinner sur le bouton quand le client renvoie sa liste modifiée.

### Bug #3 — bouton « J'ai une question » du courriel → FAIT
Avant : le bouton ouvrait un `mailto`. Maintenant il mène au formulaire Contact du site, **pré-rempli**.
- **Code.gs, `envoyerProposition_V3`** : le lien du bouton question = `lienModifier + '&action=question&nom=' + encodeURIComponent(client) + '&courriel=' + encodeURIComponent(courriel)`.
- **main-demande.js, handler `?cmd=…`** : nouvelle bifurcation `action === 'question'` → `naviguer('contact')`, puis pré-remplit prénom (avant le 1er espace du nom), nom (après), courriel, et le sujet (« Question — commande CMD-XXXX », ajouté comme option au menu déroulant `#sujet`).
- Le nom complet voyage dans le lien et est coupé au 1er espace.

### Bug #2 — le lien Square doit mourir quand le client modifie → FAIT
Principe : le bouton **Payer du courriel passe par notre site avant d'aller à Square**. Le site regarde le statut : si « En attente de paiement » → redirige vers Square; sinon → message « cette commande n'est plus disponible pour le paiement ». (Effacer le lien dans la sheet ne suffisait pas : le courriel garde le lien Square vivant.)
- **Code.gs, `getCommandePublique_v2`** : renvoie maintenant aussi `lien_square` (colonne 14 = index 13). Capture `lienSquareRow` dans la boucle + ajout au `return`.
- **main-demande.js** : bifurcation `action === 'payer'` → appelle `getCommandePublique`, redirige vers `r.lien_square` si `statut === 'En attente de paiement'`, sinon message.
- **Code.gs, `envoyerProposition_V3`** : bouton Payer pointe vers `lienModifier + '&action=payer'`. Le bloc jeton/`lienModifier` a été **remonté au-dessus** de `boutonHTML` pour qu'il puisse l'utiliser.

### #3 — afficher la gamme avec le nom → PARTIEL
Fait seulement sur la **page Modifier** (`coupdecoeurRendre` : gamme ajoutée dans `rangeeitem-meta`, avant le format, avec garde si absente). Le « partout » est **abandonné pour l'instant** (le courriel n'a pas encore la gamme dans ses données).

### #2 (texte du bouton annuler)
Fait directement par Chantal : « Je ne veux plus donner suite, annuler cette commande s.v.p. ».

### #1 — ajouter un nouveau produit depuis la page Modifier → FAIT
Tout dans **main-demande.js**. Évite le doublon de commande (la bulle créait sinon une nouvelle commande via `envoyerDemandeCommande`).
- Bouton **« Ajouter d'autres produits »** sur la page Modifier → `naviguer('catalogue')`.
- Au chargement bloc 1 : on retient la commande en modif → `localStorage 'uc_modif_cmd' = {cmd, jeton}`.
- La **bulle** (panier) : quand `uc_modif_cmd` existe, le bouton « Continuer » devient **« Renvoyer à ma commande »** et appelle `demandeRenvoyerModif()` → renvoie via `renvoyerListeCoupdecoeur` à **la même commande**, puis efface la note.
- `uc_modif_cmd` est **effacé au début de chaque chargement** de page; la page `?cmd=` le réécrit. Empêche un prochain visiteur de rester accroché.
- Edge connu : si le client **recharge la page en plein milieu**, il sort du mode modif (il doit re-cliquer le lien du courriel).

### Admin — statut « Modifiée » : actions ajoutées → FAIT
`admin-commandes.js`, fiche de commande (boutons par statut) + `annulerCommande`.
- Bloc ajouté pour `c.statut === 'Modifiée'` : **« Revoir et re-proposer »** (`modifierProduitsCommande` → remet le stock, repasse en « En attente », ouvre la liste corrigée du client) + **« Annuler la commande »** (`annulerCommande`).
- `annulerCommande` : la condition `stockSorti` inclut maintenant « Modifiée » → l'annulation remet bien le stock.
- ⚠️ À VÉRIFIER au test : que les 2 boutons s'affichent sur une commande « Modifiée ». Le bloc `if (c.statut === 'Modifiée')` doit être **juste avant la ligne « Fermer » de la fiche** (celle après « Marquer comme expédiée », suivie de `actions.innerHTML = actionsHTML;`). Il y a 2 lignes « Fermer » dans le fichier — si les boutons n'apparaissent pas, le bloc est sur la mauvaise; le déplacer.
- Republier le site (admin = front-end).

### À publier
- #1, #3-page : republier le site (main-demande.js).
- #2, #3 : aussi **redéployer Apps Script** (Code.gs).
- Statut de test : #1 en cours de test par Chantal; #2 et #3 pas encore confirmés de bout en bout.

---

## ENCORE OUVERT (priorité haute)

### #3 « gamme partout » — reste à faire
- Courriel : ajouter `nom_gamme` dans `lignesCourriel` (admin-commandes.js, via `donneesGammes`) + l'afficher dans `rangeeHTML` (Code.gs).
- Autres affichages : page bloc 2/3, bulle.

---


## FAIT — session du 17 juin 2026

Suite des 3 bugs trouvés au test de Chantal (proposition envoyée, client modifie/paie/pose une question).

### Bug #1 — spinner au renvoi de liste
Fait (session précédente). Spinner sur le bouton quand le client renvoie sa liste modifiée.

### Bug #3 — bouton « J'ai une question » du courriel → FAIT
Avant : le bouton ouvrait un `mailto`. Maintenant il mène au formulaire Contact du site, **pré-rempli**.
- **Code.gs, `envoyerProposition_V3`** : le lien du bouton question = `lienModifier + '&action=question&nom=' + encodeURIComponent(client) + '&courriel=' + encodeURIComponent(courriel)`.
- **main-demande.js, handler `?cmd=…`** : nouvelle bifurcation `action === 'question'` → `naviguer('contact')`, puis pré-remplit prénom (avant le 1er espace du nom), nom (après), courriel, et le sujet (« Question — commande CMD-XXXX », ajouté comme option au menu déroulant `#sujet`).
- Le nom complet voyage dans le lien et est coupé au 1er espace.

### Bug #2 — le lien Square doit mourir quand le client modifie → FAIT
Principe : le bouton **Payer du courriel passe par notre site avant d'aller à Square**. Le site regarde le statut : si « En attente de paiement » → redirige vers Square; sinon → message « cette commande n'est plus disponible pour le paiement ». (Effacer le lien dans la sheet ne suffisait pas : le courriel garde le lien Square vivant.)
- **Code.gs, `getCommandePublique_v2`** : renvoie maintenant aussi `lien_square` (colonne 14 = index 13). Capture `lienSquareRow` dans la boucle + ajout au `return`.
- **main-demande.js** : bifurcation `action === 'payer'` → appelle `getCommandePublique`, redirige vers `r.lien_square` si `statut === 'En attente de paiement'`, sinon message.
- **Code.gs, `envoyerProposition_V3`** : bouton Payer pointe vers `lienModifier + '&action=payer'`. Le bloc jeton/`lienModifier` a été **remonté au-dessus** de `boutonHTML` pour qu'il puisse l'utiliser.

### #3 — afficher la gamme avec le nom → PARTIEL
Fait seulement sur la **page Modifier** (`coupdecoeurRendre` : gamme ajoutée dans `rangeeitem-meta`, avant le format, avec garde si absente). Le « partout » est **abandonné pour l'instant** (le courriel n'a pas encore la gamme dans ses données).

### #2 (texte du bouton annuler)
Fait directement par Chantal : « Je ne veux plus donner suite, annuler cette commande s.v.p. ».

### #1 — ajouter un nouveau produit depuis la page Modifier → FAIT
Tout dans **main-demande.js**. Évite le doublon de commande (la bulle créait sinon une nouvelle commande via `envoyerDemandeCommande`).
- Bouton **« Ajouter d'autres produits »** sur la page Modifier → `naviguer('catalogue')`.
- Au chargement bloc 1 : on retient la commande en modif → `localStorage 'uc_modif_cmd' = {cmd, jeton}`.
- La **bulle** (panier) : quand `uc_modif_cmd` existe, le bouton « Continuer » devient **« Renvoyer à ma commande »** et appelle `demandeRenvoyerModif()` → renvoie via `renvoyerListeCoupdecoeur` à **la même commande**, puis efface la note.
- `uc_modif_cmd` est **effacé au début de chaque chargement** de page; la page `?cmd=` le réécrit. Empêche un prochain visiteur de rester accroché.
- Edge connu : si le client **recharge la page en plein milieu**, il sort du mode modif (il doit re-cliquer le lien du courriel).

### À publier
- #1, #3-page : republier le site (main-demande.js).
- #2, #3 : aussi **redéployer Apps Script** (Code.gs).
- Statut de test : #1 en cours de test par Chantal; #2 et #3 pas encore confirmés de bout en bout.

---

## ENCORE OUVERT (priorité haute)

### 🔴 Admin — le statut « Modifiée » n'a aucun bouton d'action
Quand le client renvoie sa liste, la commande passe à **« Modifiée »**, mais la fiche admin n'offre que « Fermer » → impossible de la re-compléter. À faire : ajouter le bon bouton (probablement **« Compléter » / re-proposer**) pour ce statut. **En attente de la fonction `ouvrirFicheCommande` (admin-commandes.js)** pour voir la logique des boutons par statut.

### #3 « gamme partout » — reste à faire
- Courriel : ajouter `nom_gamme` dans `lignesCourriel` (admin-commandes.js, via `donneesGammes`) + l'afficher dans `rangeeHTML` (Code.gs).
- Autres affichages : page bloc 2/3, bulle.

---






## FAIT — session du 16 juin 2026

Tout passe par la seule version d'envoi : `envoyerProposition_V3` (Code.gs) ← `envoyerPropositionV3` (admin-commandes.js).

### 1. Courriel de proposition — message personnel déplacé
- Le message personnel apparaît maintenant **sous le total**, avant les boutons (avant : tout en haut, après l'intro).
- Toujours caché quand c'est vide (déjà le cas, pas touché).

### 2. Ménage : ancienne version supprimée (décision 3.1 — une seule version)
Le chemin de l'ancien courriel retiré à 4 endroits :
- **index.html** — ancien bouton « Envoyer au client » enlevé; le bouton restant ne dit plus « (v3) ».
- **Code.gs (doPost)** — ligne d'aiguillage `envoyerProposition` retirée.
- **Code.gs** — fonction `envoyerProposition_v2` supprimée au complet.
- **admin-commandes.js** — fonction d'écran `envoyerProposition` supprimée au complet.
- Résultat : un seul chemin d'envoi. La double version emmêlée (cause des sessions qui tournaient en rond) est partie.

### 3. Aperçu = vrai courriel
- **Code.gs** : `envoyerProposition_V3` renvoie le HTML sans l'envoyer quand `data.apercu` est vrai.
- **admin-commandes.js** : `apercuProposition` va chercher ce HTML et l'affiche (son ancien dessin maison est supprimé).
- Résultat : « ce que je vois dans l'aperçu = ce que le client reçoit », pour de bon.

---

## À FAIRE AVANT DE S'Y FIER
- Republier le site **et** redéployer Apps Script, puis tester une vraie proposition.
- Rien n'a été testé de bout en bout cette session.

## ENCORE OUVERT (pas touché)
- Le type des lignes (prêt / à venir / pas dispo) n'est pas transmis au courriel → blocs 2 et 3 ne se séparent pas en sections à l'envoi. L'aperçu et le courriel restent identiques, mais tous deux incomplets pour 2 et 3.
- Corrections décidées du bloc 1 toujours pas faites : courriel avant texto · garder l'identifiant du lien Square · faire expirer le lien Square.
- Arbre du bloc 1 (cas 1 à 7) cartographié; seuls le courriel et l'aperçu sont bâtis. Cas 2 à 7 restent à construire.





# ÉTAT DU PROJET — Univers Caresse
Refait le 16 juin 2026, à partir du vrai historique et du vrai code.
Avec METHODE.md, c'est l'un des deux seuls fichiers md du projet.
⚠️ = à confirmer dans les fichiers avant d'agir.

---
 
## 1. LA CARTE DU PROJET

### 1.1 Les trois étages
- Site public : index.html + js/main.js + js/main-demande.js (coups de cœur)
- Admin : admin/index.html + admin/login.html + js/admin.js (chef d'orchestre) + un js/admin-*.js par section + catalogue-builder.js
- Serveur : Google Sheets + Apps Script (Code.gs). Tout lui parle par appelAPI (lire) et appelAPIPost (écrire, via doPost). Chaque aller-retour = 1 à 3 secondes.

### 1.2 Les tuyaux dans les murs (à vérifier avant TOUT changement)
- CONFIG, appelAPI, appelAPIPost vivent dans main.js → toucher main.js peut briser toute l'admin
- Les JS admin partagent des variables communes (donneesProduits, donneesCollections, listesDropdown, prodCache, squareAppId…) → toucher l'une = impacts ailleurs
- Deux feuilles de style : style.css + generique.css, règles parfois en double
- Code.gs modifié = redéploiement (nouvelle version). HTML/CSS/JS modifié = republier le site
- Le stock = la zone la plus risquée. Jamais le sortir deux fois. Numéros de facture jamais réutilisés (annuler, pas effacer)
- Lien vente↔commande : la commande connaît sa vente, pas l'inverse

### 1.3 Repères — proposition et coups de cœur
- Page client « modifier » = section-coupdecoeur (jamais le modal), deux zones : #coupdecoeur-commande et #coupdecoeur-bloque (cachée via class="cache")
- Lien client : ?cmd=CMD-XXXX (+ &jeton=… pour la sécurité)
- ⚠️ Deux versions d'envoi de proposition coexistent : envoyerProposition_v2 (ancien, production) et envoyerProposition_V3 (test, là où les blocs ont été bâtis). À fusionner en une seule (voir 3.1)

### 1.4 Repères — feuilles Google Sheets
- Commandes_Entete_v2 : cmd_id (1) · date (2) · nom (3) · courriel (4) · téléphone (5) · total (6) · acompte (7) · solde (8) · statut (9) · message (10) · ven_id_lien (11) · code_postal (12) · note_proposition (13) · lien_square (14) · livraison (15) · date_proposition (16) · prénom (17) · rabais (18) · promo_id (19) · type_promo (20) · ⚠️ link_id_square (21, à confirmer) · no_tracage (ajoutée cette session)
- Commandes_Lignes_v2 : cmd_id (1) · pro_id (2) · format_poids (3) · format_unite (4) · quantite (5) · prix_unitaire (6) · lots (7) · type_ligne (8) · date_dispo (9)
- Lots_v2 : lot_id · pro_id · date_fabrication · date_disponibilite · nb_unites · …
- Produits_v2 : pro_id (1) · … · cure (11) · …

### 1.5 Statuts de commande
- En attente — demande reçue, aucun stock touché
- En attente de paiement — proposition envoyée, stock sorti
- À retravailler — le client a modifié sa liste, à reproposer
- En attente de réapprovisionnement — le client attend que le stock soit prêt
- À expédier — paiement reçu, à envoyer
- Terminée — expédiée
- Annulée — annulée par le client ou par Chantal

### 1.6 Points de couleur (commandes « En attente »)
- Vert — tout est en stock
- Orange — au moins un produit manque mais au moins un est dispo · ou 7 jours sans paiement/réponse
- Rouge — rien n'est dispo · ou 14 jours sans paiement/réponse (priorité)

---

## 2. CE QUI EST FAIT (et qui tient)

### 2.1 Sorte 1 — tout en stock : chemin complet fonctionnel
- Demande du site → « En attente » (point vert)
- « Compléter » → lien Square, livraison, rabais, stock des prêts sorti une seule fois → « En attente de paiement »
- Le courriel de proposition part (il plantait avant — réparé)
- Client paie sur Square, revient sur « Merci » (rien ne bouge tout seul)
- « Paiement reçu » → facture créée, stock pas re-sorti → « À expédier »
- « Marquer comme expédiée » → demande le numéro de suivi, l'enregistre, envoie le courriel + ouvre le texto (Messages pré-rempli) avec le lien Postes Canada → « Terminée »

### 2.2 Corrections faites cette session
- Courriel de proposition réparé (des variables déclarées trop bas dans envoyerProposition_V3, remontées au bon endroit)
- Bouton redondant « Voir ma proposition complète » retiré du courriel
- Avis d'expédition bâti au complet : colonne no_tracage, fonction expedierCommande_v2, fonction marquerExpediee, bouton « Marquer comme expédiée » rebranché

### 2.3 Le cœur tient (vérifié dans tout le code)
- Le stock sort la bonne version (prêts seulement), jamais deux fois
- La page client reçoit bien le type de chaque ligne
- La sécurité du lien client (jeton) est solide

---

## 3. CE QUI A ÉTÉ DÉCIDÉ

### 3.1 Une seule version
Deux systèmes d'envoi de proposition sont emmêlés (un ancien, un neuf). On les remplace par UNE seule version, pour de bon. Site mis en pause pour ce chantier.

### 3.2 L'affichage d'abord
L'écran de proposition doit couvrir toutes les sortes avant de toucher à « ce que le client fait après ».

### 3.3 Trois types par produit
- Prêt → on montre le prix
- À venir → on montre une date (« disponible vers le… »), peu importe la raison
- Pas disponible → info seulement, ni prix ni date

### 3.4 Deux faces, mêmes sections
Le courriel et la page montrent les trois mêmes sections (chacune apparaît seulement si elle contient quelque chose), plus un total et le(s) bouton(s).

### 3.5 Avis d'expédition
Toujours un numéro de suivi. Texto pas automatique (Messages s'ouvre pré-rempli). Numéro gardé dans la feuille. Lien Postes Canada en français.

### 3.6 Façon de travailler (rappel)
Une question = une réponse, Chantal décide. Toujours dire où chercher. Un seul collage à la fois. L'arbre des cas avant de bâtir.

---

## 4. CE QUI RESTE À TRANCHER

### 4.1 Bouton « Payer » aux sortes 2 et 3
Met-on un vrai bouton « Payer » pour les produits prêts, pour que le client règle tout de suite ce qui est prêt (total = prêts seulement)? Pas tranché.

### 4.2 Commande entièrement « pas disponible »
Une commande où rien n'est disponible : ce que le client voit. Pas tranché.

---

## 5. CONSTATS D'ÉCHEC

### 5.1 Le plus gros — la mémoire du projet
Chaque session écrivait dans ETAT.md ce qu'elle venait de faire, sans effacer ce qui devenait faux. Le fichier disait deux choses à la fois; le Claude suivant en choisissait une moitié au hasard. C'est ça qui a fait tourner en rond. → D'où ce fichier remis à plat.

### 5.2 Avant ces derniers changements
Impossible d'envoyer une proposition (le courriel plantait), impossible d'en refaire une. Beaucoup de temps passé à définir chaque sorte — et aucune ne fonctionnait de bout en bout.

### 5.3 Deux versions emmêlées
Dans le même fichier, le code appelait tantôt l'ancienne, tantôt la neuve, selon le chemin — imprévisible. (réglé par 3.1)

### 5.4 Faille de fond sous les sortes 2 et 3
Le système ne sait jamais tout seul quand le client a payé (Square envoie un courriel, c'est Chantal qui clique « Paiement reçu »). Les sortes 2 et 3 ont été bâties en supposant le contraire.

### 5.5 Sorte 2 (il manque du stock) — à moitié cassée
« Recevoir ce qui est prêt » expédie sans faire payer, ferme le lien de paiement, et crée une 2e commande inutilisable (quantité 1, prix 0 $).

### 5.6 Sorte 3 (rien de prêt) — morte
La proposition ne part même pas : le code tente de sortir un stock qui n'existe pas, ça échoue, le client ne reçoit rien.

### 5.7 Fausses alertes — à NE PAS « corriger »
Ces points étaient faux : le stock sort la bonne version, la page reçoit bien le type des lignes, la date de proposition est bien écrite. Ne pas les toucher en croyant les réparer.

---

## 6. PLUS TARD (quand les 3 sortes tiennent)
- Ouverture : retirer le drapeau ?test=1, tester une vraie commande de bout en bout, publier
- Confort : vente en un seul voyage, pastille « nouvelles demandes » à l'accueil, paiement Square automatique
- Grand ménage : finir la migration CSS, découper Code.gs par sujet, jeter les vieux fichiers et « Copie »
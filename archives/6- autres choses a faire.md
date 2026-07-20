# ITEM 5 — RESTE À FAIRE (décisions prises le 5-6 juillet 2026)
## Contexte pour le prochain Claude — lire METHODE.md d'abord. Chantal dirige.

## 0. OÙ ON EN EST
- Items 1-2-3 (les 3 courriels du parcours client) : codés ET publiés.
- Item 4 (facture par texto) : terminé dans une autre conversation.
- Ce fichier = 6 correctifs décidés ensemble, analysés, PAS ENCORE POSÉS.
- Méthode : trouve-et-remplace un à la fois, OK de Chantal avant chaque bloc,
  preuve Vérifié/Impacts avant chaque proposition. Jamais de code sans son OK.

## 1. SPINNER + TEXTE « MERCI » — renvoi par la bulle du site
**Problème :** quand le client modifie sa commande par la bulle du site public
(`demandeRenvoyerModif`, js/main-demande.js), pas de spinner et le même
« Merci » que l'envoi initial — mêlant.
**Décidé :** spinner (patron réutilisé du chemin `renvoyer` de la page
commande) + texte adapté choisi par Chantal : « Merci! Votre liste modifiée a
bien été envoyée. Nous vous reviendrons très bientôt avec une proposition
ajustée. » La ligne « Surveillez votre boîte de réception… » reste.
**État :** le trouve-et-remplace du spinner a été DONNÉ et appliqué par
Chantal; celui du texte est prêt : dans `demandeOuvrirModalListe`
(js/main-demande.js), après les lignes `let modif = null; try {...}` et avant
`const contBtn`, poser le texte du premier `<p>` de `#demande-vue-merci`
selon le mode (modif ou envoi initial — texte initial actuel : « Merci! Nous
avons bien reçu vos Coups de coeur. Nous vous reviendrons très bientôt pour
confirmer la disponibilité des produits et les frais de livraison. À
bientôt! »). NE PAS TESTER avant que ce 2ᵉ bloc soit posé.

## 2. CHAMPS JAUNES (DuckDuckGo)
**Problème :** cellulaire et code postal jaunes dans le formulaire
Coordonnées — c'est le surlignage du navigateur (DuckDuckGo), pas nos styles.
**Décidé :** forcer nos couleurs. Bloc prêt pour `css/generique.css`, après
`.controle:focus` / `textarea.controle` : règles `input:-webkit-autofill`
(box-shadow inset `var(--blancpur)`, texte `var(--grise-foncee)`) +
`input:autofill`. Si DuckDuckGo peint par-dessus malgré tout, le test le dira.

## 3. PAGES BLOQUÉES (garde-barrière, js/main-demande.js)
**Problème (photo de Chantal) :** trop serré, 2 lignes collées, gros bouton
vert pleine largeur. Et l'« Écrivez-nous » ne pré-remplit que le message.
**Décidé :** ① de l'air au-dessus et entre les lignes; ② bouton Fermer
discret (largeur normale, pas pleine page); ③ « Écrivez-nous » pré-remplit
prénom + nom (déjà retournés par `getCommandePublique_v2`) et le Sujet
« Question — numéro » (comme la porte `&action=question`); le courriel n'est
JAMAIS donné au navigateur (décision de protection) — le client le tape.
Même retouche pour toutes les pages bloquées (générique, « À expédier »,
« Terminée »).

## 4. FORMULAIRE CONTACT GÉNÉRAL
**Décidé :** retirer l'option « Passer une commande » du Sujet
(`index.html`). Petit trouve-et-remplace simple.

## 5. COULEURS UNIVERS / FAMILLES — manuelles au lieu d'auto
**Problème :** le hex (couleur des cartes) est automatique pour les univers
(regroupements) et les familles — ça n'a pas de sens pour ces deux-là.
**Décidé, 3 morceaux :**
- ① un choix de couleur dans les deux formulaires (`form-regroupements` et
  `form-familles`, admin/index.html + js/admin-regroupements.js,
  js/admin-familles.js);
- ② la sauvegarde garde cette couleur — attention : `sauvegarderFamille`
  envoie aujourd'hui `couleur_hex: ''` à chaque enregistrement (ça écrase),
  et `saveRegroupement` ne l'envoie pas du tout;
- ③ retirer le recalcul automatique côté serveur pour ces deux-là.
**À vérifier avant de coder (règle 1.4) :** l'endroit exact du recalcul dans
`Code.gs` (chercher autour de `recalculerHexGamme_v2` /
`recalculerHexCollection_v2` — l'équivalent familles/regroupements n'a pas
encore été localisé).

## 6. FAMILLES MULTI-COLLECTIONS — arbre validé (4 branches)
**Problème :** une famille appartient à une seule collection — le blaireau
(Accessoires) ne peut pas rejoindre « Barbe et moustache ».
**Analyse faite :** l'affichage public suit le produit (p.fam_id /
p.nom_famille), pas la collection de la famille. Le verrou est ailleurs.
**Arbre validé par Chantal :**
- Branche 1 : la fiche produit offre TOUTES les familles (liste regroupée par
  collection pour s'y retrouver — aujourd'hui filtre `f.col_id === col_id`
  dans js/admin-produits.js); le produit s'affiche sous ce titre de famille
  dans SA collection au public; une famille peut donc vivre dans plusieurs
  collections en même temps.
- Branche 2 : la fiche famille garde sa collection d'attache (rang valable
  là); dans une autre collection, la famille s'affiche APRÈS les familles
  propres à cette collection, en ordre d'arrivée; rien à changer à la fiche
  famille.
- Branche 3 (cas de bord) : suppression déjà bloquée si produits liés (tous,
  peu importe la collection); un produit qui change de collection garde sa
  famille; une famille liée à une gamme d'une autre collection : détail
  ignoré à l'affichage.
- Branche 4 (admin) : les tris admin suivent le produit — rien à changer;
  SEUL le catalogue-builder filtre aussi les familles par collection
  (js/catalogue-builder.js, `Familles_v2` filtré par `binding.col_id`) —
  même élargissement à y faire.
**Construction = 2 élargissements :** fiche produit + catalogue-builder.

## 7. RAPPELS TECHNIQUES POUR LA REPRISE
- Fichiers à jour dans le dossier du projet (GitHub). Toujours vérifier le
  texte exact avant un trouve-et-remplace (règle 1.3).
- `Code.gs` touché → nouveau déploiement Apps Script; HTML/CSS/JS → republier
  le site. Chantal teste seulement quand elle publie.
- Vocabulaire : jamais « panier », pas de possessifs.
- Sur ce site : `getCommandePublique_v2` retourne prénom/nom mais JAMAIS le
  courriel du client au navigateur — à respecter partout.
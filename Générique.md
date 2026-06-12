# Brief — Refonte CSS générique des fiches (Univers Caresse)

## Objectif
Les 4 sections **collections, gammes, familles, univers** doivent avoir des fiches
(consultation + modification) identiques. Au lieu d'un style par section, on crée
une base générique réutilisable, préfixée `.boutons` et `.fiches`.

## Principe
Une fiche = toujours 3 blocs :
1. Bandeau du haut (titre + slogan + bouton ✕)
2. Bloc central (contenu : description, sections, items / champs)
3. Bandeau du bas (boutons d'action)

Les boutons = une famille `.boutons` avec variantes de couleur.
 
---

## CSS générique déjà créé

### Boutons
- `.boutons` — base (forme, sans couleur)
- `.boutons-vert` — plein vert (enregistrer / modifier)
- `.boutons-contour` — annuler / fermer
- `.boutons-rouge` — supprimer
- `.boutons-accent` — or
- `.boutons-gris` — gris
- `.boutons-fermer` — le ✕ (version allégée, positionnement géré par le bandeau)

### Bandeau
- `.bandeau` — cadre commun haut et bas
- `.fiches-bandeau` — colonne titre + slogan
- `.fiches-titre`
- `.fiches-slogan`
- `.fiches-actions` — rangée de boutons (bandeau bas)

### Bloc central
- `.fiches-central` — cadre
- `.fiches-central-corps` — intérieur (padding)

### Contenu du bloc central
- `.fiches-desc`
- `.fiches-section-label`
- `.fiches-item`, `.fiches-item-nom`, `.fiches-item-desc`

### Formulaire (modification)
- `.grille`
- `.fiches-champ` (remplace `form-groupe`)
- `.fiches-champ-plein` (remplace `col-plein`)
- `.fiches-label` (remplace `form-label`)
- `.fiches-ctrl` (remplace `form-ctrl`)

### Visuel (photos + carré rang)
- `.fiches-visuel`
- `.fiches-visuel-photo`
- `.fiches-visuel-hex`
- `.fiches-visuel-rang`

---

## Règles de nomenclature
- Préfixes : `.boutons` et `.fiches`
- Pas d'anglais dans les noms (exception : « hex », reconnu en français)
- Pas de `form-groupe`
- Le positionnement (ex. coller à droite) se gère dans le conteneur, pas dans le bouton

---

## Ce qui reste à faire

1. **Brancher le HTML** sur les classes génériques, une section à la fois.
   Ordre conseillé : fiche **consultation** d'une collection → fiche **modification**
   d'une collection → puis gammes, familles, univers.
2. **Vérifier l'affichage** après chaque branchement.
3. **Adapter le JS** quand une classe injectée change de nom.
   Exemples à surveiller : `fiche-visuel-photo`, `fiche-visuel-hex`,
   `fiche-visuel-rang`, `photo-preview`, `form-ctrl`, `form-groupe`,
   `col-plein` → versions `.fiches-...`.
   Fichiers concernés : `admin-collections.js`, `admin-gammes.js`,
   `admin-familles.js`, `admin-regroupements.js`.
4. **Propager** aux 3 autres sections une fois la collection validée.
5. **Ménage final** : supprimer en entier les anciens blocs CSS devenus inutiles
   (ancien `.bandeau`/`.fiche-bandeau`, les `#form-collections .fiche-visuel...`,
   `.photo-preview`, etc.) une fois que plus aucun HTML ne les utilise.

---

## Méthode de travail (rappel)
- Corrections par **trouve / remplace**, un seul changement à la fois.
- Attendre le **ok** entre chaque changement.
- Pas de réécriture massive d'un coup pour ne pas casser les 4 sections.

---

## Style en dur dans les JS (audit)

Distinction importante :
- **Style en dur de COULEUR calculée** (dégradés selon la donnée) → légitime, reste en JS.
- **Style en dur de MISE EN PAGE** (tailles, paddings, largeurs) → à éviter, doit venir du CSS.

### État des fichiers
- **admin-collections.js** : style en dur = couleurs calculées seulement
  (`rangApercu.style.background`, dégradés des cartes). OK à garder.
- **admin-gammes.js** : style en dur = couleur calculée seulement
  (`majApercuRangGamme` → `apercu.style.background`). OK à garder.
- **admin-familles.js** : rien de notable.
- **admin-regroupements.js** : seulement `style.display` (affichage, pas apparence). Normal.
- **admin.js** : NON VÉRIFIÉ (pas pu être envoyé) → **à inspecter** pour
  repérer d'éventuels styles de mise en page en dur.

### Conclusion
Les 4 JS connus sont propres côté mise en page : le layout vient du CSS, pas du JS.
Seul `admin.js` reste à auditer.

### À surveiller lors du branchement HTML → générique
Les JS injectent des classes qui devront correspondre aux nouveaux noms `.fiches-...` :
`fiche-visuel-photo`, `fiche-visuel-hex`, `fiche-visuel-rang`, `photo-preview`,
`form-ctrl`, `form-groupe`, `col-plein`, `form-actions`, `form-panel`, `form-body`.


## message de claude m'a donné a la fin de la conversation

Petit conseil pour que ça se passe encore mieux la prochaine fois : garde aussi tes fichiers (HTML, CSS, les 5 JS) à portée, et précise dès le départ « on en est à brancher le HTML de la fiche consultation collection ». Comme ça on saute les préliminaires.
Bon courage pour la suite — le plus dur (créer la base générique propre) est déjà fait.


mise a jour du 30 mai 2026 à 10h00

# Suivi — Migration CSS générique (Univers Caresse)

## Correspondances : ancien → générique

| Ancienne classe          | Classe générique        | Type        |
|--------------------------|-------------------------|-------------|
| `.fiche-bandeau`         | `.fiches-bandeau`       | fiche       |
| `.form-panel-titre` (titre fiche) | `.fiches-titre` | fiche       |
| `.fiche-slogan`          | `.fiches-slogan`        | fiche       |
| `.btn-fermer-panneau` (✕)| `.boutons-fermer`       | bouton      |
| `.form-panel` (bloc central) | `.fiches-central`   | fiche       |
| `.form-body`             | `.fiches-central-corps` | fiche       |
| `.fiche-desc`            | `.fiches-desc`          | fiche       |
| `.section-label`         | `.fiches-section-label` | fiche       |
| `.form-actions`          | `.fiches-actions`       | fiche       |
| `.form-valeur`           | `.valeur`        | fiche       |
| `.form-grille`           | `.grille`        | fiche       |
| `.form-groupe`           | `.fiches-champ`         | fiche       |
| `.col-plein`             | `.fiches-champ-plein`   | fiche       |
| `.form-label`            | `.fiches-label`         | fiche       |
| `.form-ctrl`             | `.fiches-ctrl`          | fiche       |
| `.fiche-visuel`          | `.fiches-visuel`        | fiche       |
| `.fiche-visuel-photo`    | `.fiches-visuel-photo`  | fiche       |
| `.fiche-visuel-hex`      | `.fiches-visuel-hex`    | fiche       |
| `.fiche-visuel-rang`     | `.fiches-visuel-rang`   | fiche       |
| `.bouton`                | `.boutons`              | bouton      |
| `.bouton` (vert)         | `.boutons-vert`         | bouton      |
| `.bouton-contour`        | `.boutons-contour`      | bouton      |
| `.bouton-rouge`          | `.boutons-rouge`        | bouton      |
| `.bouton-or`             | `.boutons-accent`       | bouton      |
| `.bouton-vert-pale`      | `.boutons-gris`         | bouton      |
| `.bouton-petit`          | `.boutons-petit`        | bouton      |
| `.texte-secondaire`      | `.textes-discrets`      | utilitaire  |
| `.checkboxes-groupe`     | `.casesacocher`         | utilitaire  |
| `.col-demi`              | `.champ-demi`           | utilitaire  |
| `.col-petit`             | `.champ-petit`          | utilitaire  |
| `.textarea-auto`         | `.zonedetexte`          | utilitaire  |
| `.btn-ajouter-ingredient`| `.bouton-ajout`         | utilitaire  |
| `.photo-preview`         | (supprimée — la div parent gère) | nettoyage |

## État d'avancement par section

| Section            | HTML | JS  | Utilitaires basculés |
|--------------------|------|-----|----------------------|
| Collections        | ✅   | ✅  | ✅                   |
| Gammes             | ✅   | ✅* | ✅                   |
| Familles           | ✅   | ✅  | ✅                   |
| Univers            | ✅   | ✅  | ✅                   |
| Produits           | ❌   | ❌  | ❌                   |
| Factures / achats  | ❌   | ❌  | ❌                   |
| Ventes             | ❌   | ❌  | ❌                   |
| Commandes          | ❌   | ❌  | ❌                   |
| Remboursements     | ❌   | ❌  | ❌                   |
| Fabrication        | ❌   | ❌  | ❌                   |
| Contenu site       | ❌   | ❌  | ❌                   |
| Rédaction          | ❌   | ❌  | ❌                   |
| Densités           | ❌   | ❌  | ❌                   |
| Promotions         | ❌   | ❌  | ❌                   |
| INCI / Médiathèque / Catalogue | ❌ | ❌ | ❌            |

\* Gammes JS : tout migré sauf les rangées d'ingrédients (`ingredient-rangee`, `ing-type`, `ing-nom`, `ing-inci`, `ing-qte`) — classes partagées avec Produits, pas encore migrées.

## Ce qui reste à faire

1. Migrer les sections non faites (Produits, Factures, Ventes, etc.) vers le générique.
2. Créer un générique pour les rangées d'ingrédients (`ingredient-rangee`, `ing-*`), partagé Gammes + Produits.
3. **Ménage final CSS** — supprimer les anciens blocs devenus orphelins UNIQUEMENT quand plus aucune section ne les utilise :
   - `.fiche-bandeau`, `.fiche-slogan`, `.fiche-desc`, `.section-label`
   - `.fiche-visuel*`, `#form-collections .fiche-visuel...`
   - `.photo-preview`, `.form-valeur`
   - doublon `.bandeau` (commenté « à effacer »)
   - `.bouton*`, `.form-panel*`, `.form-groupe`, `.form-label`, `.form-ctrl`, `.form-grille`, `.col-*`, `.texte-secondaire`, `.checkboxes-groupe`, `.textarea-auto`, `.btn-ajouter-ingredient`
4. Auditer `admin.js` (jamais reçu) pour styles de mise en page en dur.


mise a jour 30 mai 2023 12h08

Suivi — Migration CSS générique (Univers Caresse)
Correspondances : ancien → générique
Ancienne classeClasse génériqueType.fiche-bandeau.fiches-bandeaufiche.form-panel-titre (titre fiche).fiches-titrefiche.fiche-slogan.fiches-sloganfiche.btn-fermer-panneau (✕).boutons-fermerbouton.form-panel (bloc central).fiches-centralfiche.form-body.fiches-central-corpsfiche.fiche-desc.fiches-descfiche.section-label.fiches-section-labelfiche.form-actions.fiches-actionsfiche.form-valeur.valeurfiche.form-grille.grillefiche.form-groupe.fiches-champfiche.col-plein.fiches-champ-pleinfiche.form-label.fiches-labelfiche.form-ctrl.fiches-ctrlfiche.fiche-visuel.fiches-visuelfiche.fiche-visuel-photo.fiches-visuel-photofiche.fiche-visuel-hex.fiches-visuel-hexfiche.fiche-visuel-rang.fiches-visuel-rangfiche.bouton.boutonsbouton.bouton (vert).boutons-vertbouton.bouton-contour.boutons-contourbouton.bouton-rouge.boutons-rougebouton.bouton-or.boutons-accentbouton.bouton-vert-pale.boutons-grisbouton.bouton-petit.boutons-petitbouton.texte-secondaire.textes-discretsutilitaire.checkboxes-groupe.casesacocherutilitaire.col-demi.champ-demiutilitaire.col-petit.champ-petitutilitaire.textarea-auto.zonedetexteutilitaire.btn-ajouter-ingredient.bouton-ajoututilitaire.photo-preview(supprimée — la div parent gère)nettoyage
État d'avancement par section
SectionHTMLJSUtilitairesVisuel identiqueCollections✅✅✅✅ (référence)Gammes✅✅*✅✅Familles✅✅✅✅ (photos + aperçu rang ajoutés)Univers (regroupements)⏳⏳✅❌ EN COURSProduits❌❌❌❌Factures / achats❌❌❌❌Ventes❌❌❌❌Commandes❌❌❌❌Remboursements❌❌❌❌Fabrication❌❌❌❌Contenu site❌❌❌❌Rédaction❌❌❌❌Densités❌❌❌❌Promotions❌❌❌❌INCI / Médiathèque / Catalogue❌❌❌❌
* Gammes JS : tout migré sauf les rangées d'ingrédients (ingredient-rangee, ing-type, ing-nom, ing-inci, ing-qte) — classes partagées avec Produits, pas encore migrées.
Univers (regroupements) — travail EN COURS, à reprendre ici
Objectif : même visuel que collections (bloc photos + carré aperçu rang + position en haut, rang dans le hex de la fiche consultation). Les champs propres à univers (mode, cat_id, ing_id, exclusions, slogan) restent.
Colonnes de la table : fra_id, rang, nom, description, cat_id, ing_id, photo_url, photo_noel_url, couleur_hex, slogan, categories_exclues, collections_exclues, gammes_exclues, mode.
Étapes restantes pour univers

HTML #form-regroupements — déplacer le bloc visuel en haut :

Créer un .fiches-visuel en tête du corps avec : 2 photos (freg-photo-preview, freg-photo-noel-preview) + boutons Médiathèque, un carré freg-rang-apercu (.fiches-visuel-hex) et le select#freg-position en dessous.
Retirer l'ancien champ Position d'en haut.
Retirer les 2 anciens blocs photos situés en bas (après Description).
⚠️ Le trouve a échoué la dernière fois (indentation réelle différente). Reprendre en demandant le bloc exact à l'utilisateur, du premier <div class="grille"> jusqu'à la ligne Mode.


JS admin-regroupements.js :

Ajouter une fonction majApercuRangRegroupement() (calquée sur majApercuRangGamme) : lit freg-position, applique un dégradé couleurCollection(...) sur freg-rang-apercu, injecte <span class="fiches-visuel-rang">${position+1}</span>.
Dans peuplerPositionRegroupement : brancher sel.onchange = majApercuRangRegroupement et appeler majApercuRangRegroupement() à la fin.
Vérifier que modifierRegroupement / ouvrirFormRegroupement n'ont plus de class="photo-preview" (déjà nettoyé) et que les previews se rechargent.


Fiche consultation ouvrirFicheRegroupement : afficher le rang dans le hex. Actuellement le wrap n'ajoute que les photos. Pour être pareil, ajouter (si couleur_hex) un <div class="fiches-visuel-hex" style="background:${fra.couleur_hex}"><span class="fiches-visuel-rang">${fra.rang||''}</span></div>.

Reste global à faire

Migrer les sections non faites (Produits, Factures, Ventes, etc.) vers le générique.
Créer un générique pour les rangées d'ingrédients (ingredient-rangee, ing-*), partagé Gammes + Produits.
Ménage final CSS — supprimer les anciens blocs orphelins UNIQUEMENT quand plus aucune section ne les utilise :

.fiche-bandeau, .fiche-slogan, .fiche-desc, .section-label
.fiche-visuel*, #form-collections .fiche-visuel...
.photo-preview, .form-valeur
doublon .bandeau (commenté « à effacer »)
.bouton*, .form-panel*, .form-groupe, .form-label, .form-ctrl, .form-grille, .col-*, .texte-secondaire, .checkboxes-groupe, .textarea-auto, .btn-ajouter-ingredient


Auditer admin.js (jamais reçu) pour styles de mise en page en dur.

Méthode de travail (rappel)

Corrections par trouve / remplace, un seul changement à la fois, attendre le « ok » entre chaque.
Ne jamais coder sans autorisation.
Préfixe .fiches réservé au composant fiche ; utilitaires transversaux sans préfixe fiches (textes-discrets, casesacocher, champ-demi, champ-petit, zonedetexte, bouton-ajout).
Ne pas renommer les id (ancres JS) — uniquement les classes.



section la plus importante
# Migration .fiches-* vers générique

## Correspondances : ancien vers nouveau

| Ancienne classe        | Nouvelle classe      |
|------------------------|----------------------|
| .fiches-bandeau        | .bandeau-entete      |
| .fiches-titre          | .titre               |
| .fiches-slogan         | .slogan              |
| .fiches-actions        | .actions             |
| .fiches-central        | .central             |
| .fiches-central-corps  | .central-corps       |
| .fiches-desc           | .description         |
| .fiches-section-label  | .section-label       |
| .valeur         | .valeur              |
| .fiches-item           | .item                |
| .fiches-item-nom       | .item-nom            |
| .fiches-item-desc      | .item-description    |
| .grille         | .grille              |
| .fiches-champ          | .champ               |
| .fiches-champ-plein    | .champ-plein         |
| .fiches-label          | .libelle (deja fait) |
| .fiches-ctrl           | .controle            |
| .fiches-visuel         | .visuel              |
| .fiches-visuel-photo   | .visuel-photo        |
| .fiches-visuel-hex     | .visuel-hex          |
| .fiches-visuel-rang    | .visuel-rang         |

## Ou chercher

- index.html : sections collections, gammes, familles, univers
- admin-collections.js : ouvrirFicheCollection, modifierCollection
- admin-gammes.js : ouvrirFicheGamme2, ouvrirFicheGamme, majApercuRangGamme
- admin-familles.js : ouvrirFicheFamille, majApercuRangFamille
- admin-regroupements.js : ouvrirFicheRegroupement, majApercuRangRegroupement

## Methode

1. Coller le bloc des nouvelles classes dans la section Generique du CSS.
2. Remplacer chaque .fiches-xxx par son equivalent partout dans le HTML et les 4 JS.
3. ORDRE IMPORTANT (remplacer le plus long en premier) :
   - fiches-visuel-photo, fiches-visuel-hex, fiches-visuel-rang AVANT fiches-visuel
   - fiches-item-nom, fiches-item-desc AVANT fiches-item
   - fiches-central-corps AVANT fiches-central
   - fiches-champ-plein AVANT fiches-champ
4. Quand plus aucun .fiches- n'existe dans le HTML ni les JS, supprimer les anciens blocs .fiches-* du CSS.

## Attention

.section-label existe DEJA dans le CSS ancien (zone fiche collection admin) avec un style identique. En migrant fiches-section-label vers section-label, verifier qu'il n'y a pas de conflit ; n'en garder qu'une seule definition au menage final.
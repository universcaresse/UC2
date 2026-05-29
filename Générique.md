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
- `.fiches-grille`
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
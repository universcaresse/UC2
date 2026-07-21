# ITEM — Page « Gestion comptable » (renommage + réorganisation complète)
### Arbre déroulé et VALIDÉ par Chantal le 17 juillet 2026. **RIEN N'EST CODÉ.**
> Lire `METHODE.md` d'abord. CSS : **generique.css seulement** — une seule exception autorisée (voir §3).
> Exécution : trouve-et-remplace enchaînés **rondement**, sans pause entre les OK.
> Prérequis au GO : projet resynchronisé avec GitHub — les textes exacts se prennent dans les fichiers du jour.

---

## 1. L'ARBRE VALIDÉ (tout est tranché, ne pas re-questionner)

### La page
1. La page s'appelle **« Gestion comptable »** — entête de page + les deux menus (gauche et dropdown
   du haut). Textes visibles seulement : l'identifiant `plan-comptable` et tous les ids restent.
2. **Deux colonnes** (la `grille` du générique — retombe seule en 1 colonne sur petit écran).
   Usage principal : iPad paysage, mais tout doit marcher partout.

### Colonne gauche — la lecture (3 accordéons)
3. Trois accordéons cliquables : **Sections** (par classe) · **Comptes** (le plan complet,
   sections avec leurs comptes) · **Catégories UC**.
4. **Un seul accordéon ouvert à la fois.**
5. Catégorie UC = **une rangée d'une ligne** (`rangeeitem`, même habit que la page bilan) :
   nom (+ INCI requis) à gauche, compte · densité · marge à droite, boutons minuscules au bout.
   **Le nombre d'ingrédients ne s'affiche plus** — il sert seulement en arrière pour cacher
   « Supprimer » quand la catégorie est utilisée.
6. Les alarmes restent visibles dans la rangée : compte orphelin, densité manquante.
7. Accordéon sans contenu : bloc « vide » standard du générique (cas théorique, on ne s'y attarde pas).

### Colonne droite — l'atelier (collant)
8. La colonne droite est **collante** : 3 boutons toujours visibles pendant que la gauche défile —
   « Ajouter une section » · « Ajouter un compte » · « Ajouter une catégorie UC ».
9. Un clic ouvre le formulaire correspondant **juste là**, sous les boutons. **Un seul formulaire
   ouvert à la fois.** Pas de modale (refusée explicitement).
10. Ouvrir un formulaire **ouvre tout seul l'accordéon correspondant à gauche** — les numéros
    existants sont sous les yeux, jamais à deviner.
11. « Modifier » sur une catégorie ouvre le même formulaire à droite, **pré-rempli, entonnoir placé
    sur son compte** (item précédent, point 2.4).
12. Changer de formulaire sans enregistrer : ce qui était tapé **se perd sans question** (geste volontaire).
13. Enregistrement réussi : message de réussite, **le formulaire se vide et reste ouvert**, la liste
    de gauche se rafraîchit tout de suite. Le gros spinner pleine page pendant le travail —
    **déjà automatique** (il vit dans `appelAPIPost`), rien à bâtir.

### Petit écran (téléphone, iPad portrait)
14. Une colonne : les 3 accordéons, puis les 3 boutons dessous. Le « collant » ne s'applique plus;
    un clic sur un bouton **remonte l'écran au formulaire tout seul** (petit geste JS).

---

## 2. LES FAITS VÉRIFIÉS (17 juillet 2026, copies GitHub du projet)

1. **Entête** (`admin/index.html`, `#section-plan-comptable`) : eyebrow « Comptabilité »,
   titre « Plan *comptable* » (comptable en `<em>`). Les deux menus disent « plan comptable »
   et appellent `afficherSection('plan-comptable', …)` — l'appel ne change pas.
2. **Tout le rendu vit dans `js/admin-comptabilite.js`** (`pcRendre`); le HTML n'a que le squelette
   (`#contenu-plan-comptable`). L'essentiel du chantier = réécrire `pcRendre` + petites fonctions
   d'ouverture/fermeture.
3. **Le générique suffit pour tout sauf le collant** :
   - accordéons : `sur-titre` cliquable + bascule de `cache` (mécanique déjà utilisée ailleurs)
   - rangées : `rangeeitem`, `-info`, `-titre`, `-meta`, `-valeur`
   - formulaires : `grille`, `champ`, `libelle`, `controle`, `actions`
   - boutons : `boutons` + `-vert` / `-contour` / `-minuscule`
   - divers : `numero`, `textes-discrets`, `section-label`, `vide`/`-titre`/`-desc`, `cache`
4. **Spinner et messages** : `appelAPIPost` montre/cache le voile pleine page tout seul;
   `afficherMsg('plan-comptable', …)` existe. Rien de neuf.
5. **Ids à ne jamais renommer** : `pc-sec-numero`, `pc-sec-nom`, `pc-cpt-section`, `pc-cpt-numero`,
   `pc-cpt-nom`, `pc-cat-nom`, `pc-cat-classe`, `pc-cat-section`, `pc-cat-compte`, `pc-cat-densite`,
   `pc-cat-marge`, `pc-cat-inci`, `#section-plan-comptable`, `#msg-plan-comptable`,
   `#loading-plan-comptable`, `#contenu-plan-comptable`.
6. **Fonctions réutilisées telles quelles** : `pcAjouterSection`, `pcAjouterCompte`, `pcCatAjouter`,
   `pcCatModifier`, `pcCatSupprimer`, `pcCatChangerClasse`, `pcCatChangerSection`, `pcNomClasse`,
   `chargerPlanComptable`. **Code.gs : zéro changement, aucun déploiement Apps Script.**

## Impacts
- `pcRendre` n'est appelée que par `chargerPlanComptable` — réécrire son HTML ne touche personne.
- `pcCatChangerClasse` / `pcCatChangerSection` s'accrochent aux ids `pc-cat-*` — conservés.
- La page bilan partage le fichier mais aucune fonction `pc*` — intacte.
- La classe « collant » sera réutilisable ailleurs (générique, pas propre à cette page).

---

## 3. PERMISSION ACCORDÉE (17 juillet 2026)

- **Une seule règle nouvelle dans `generique.css`** : la classe **« collant »** (colonne qui reste
  collée en haut de l'écran pendant le défilement). Rien d'autre. Sur petit écran elle ne fait rien.

---

## 4. LA SÉQUENCE D'EXÉCUTION (dans cet ordre, au GO)

**`css/generique.css`** — 1 remplacement
1. La classe `collant` (position sticky + un haut aligné sur la marge de page), désactivée sous 900px.

**`admin/index.html`** — 3 remplacements, indépendants
2. Entête : « Plan *comptable* » → « Gestion *comptable* » (garder l'italique).
3. Menu de gauche : « plan comptable » → « gestion comptable ».
4. Dropdown du haut : même remplacement.

**`js/admin-comptabilite.js`** — le gros morceau, découpé net
5. Petites fonctions d'état : quel accordéon est ouvert (un seul), quel formulaire est ouvert
   (un seul), et le lien entre les deux (le formulaire ouvre son accordéon).
6. `pcRendre` — le squelette 2 colonnes : gauche (3 accordéons `sur-titre` + corps `cache`),
   droite (`collant` : 3 boutons + les 3 volets de formulaires fermés).
7. Corps de l'accordéon Sections : classes + sections en rangées.
8. Corps de l'accordéon Comptes : plan complet en rangées (`rangeeitem`, numéro en `-valeur`).
9. Corps de l'accordéon Catégories UC : rangées 1 ligne (point 5 de l'arbre), alarmes en meta,
   `boutons-minuscule` Modifier / Supprimer (Supprimer caché si utilisée).
10. Les 3 volets de droite : les formulaires existants replacés (mêmes ids), vidés après réussite.
11. `pcCatModifier` : ouvre le volet catégorie pré-rempli, entonnoir placé (alarme si compte orphelin).
12. Petit écran : le remonte-au-formulaire au clic d'un bouton.

**Ne pas tester entre 5 et 12** — les boutons appellent des volets pas encore finis.
**À publier au bout** : le site (HTML + CSS + JS). **Rien côté Apps Script.**

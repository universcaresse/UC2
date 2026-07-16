# ITEM — Les catégories UC déménagent dans le plan comptable
### Arbre VALIDÉ par Chantal le 16 juillet 2026. **RIEN N'EST CODÉ.**
> Lire `METHODE.md` en entier d'abord. Aucun code sans le OK de Chantal.
> Un seul trouve-et-remplace à la fois, preuve `Vérifié :` / `Impacts :` avant chaque proposition.
> **L'arbre ci-dessous est tranché. NE PAS reposer les questions.** Dérouler, c'est tout.

---

## 0. POURQUOI — les 3 irritants (les mots de Chantal)

> « Tantôt je voulais entrer une facture, j'avais pas la cat UC. En voulant la créer, j'avais pas le
> compte pour le placer dedans. Quand j'ai voulu créer une cat UC dans INCI, j'avais pas de liste des
> comptes disponibles. Je trouve fastidieux de créer des choses de base. »
>
> « La création d'une cat UC dépend de trop de choses pour la créer sans toutes les infos. »

Trois irritants réglés d'un coup :
1. **Le compte à l'achat se tape de mémoire** — case vide, placeholder « Ex: 1305 », aux 3 endroits.
2. **La densité s'oublie en silence** — catégorie sans ligne dans `Config_v2` = densité 1, marge 0, sans un mot.
3. **Deux portes se contredisaient** — la catégorie d'un bord (page INCI), sa densité de l'autre (page densité).

**Le principe qui sort de là : une catégorie UC naît complète, ou elle ne naît pas.**

### La catégorie complète = 5 morceaux
`nom` + `compte à l'achat` + `INCI requis` + `densité` + `marge de perte`

> Point de départ refusé : Chantal a d'abord demandé de déplacer la gestion des cat UC de la page INCI
> vers le groupe comptabilité. Analyse faite : aucune incompatibilité, mais **ça n'aurait rien réglé** —
> même case vide, ailleurs. Elle a tranché autrement (voir 1.1).

---

## 1. L'ARBRE VALIDÉ

### Branche 1 — la page
- **1.1** La page **plan comptable** porte les trois créations, dans l'ordre où elles dépendent l'une
  de l'autre : la **section** d'abord, puis le **compte**, puis la **catégorie UC**. Ça se lit de haut
  en bas — rien ne se crée sans ce qui est au-dessus.
- **1.2** Sous les trois créations, la page montre ce qui existe : le plan comme aujourd'hui (sections
  et leurs comptes), puis **la liste des catégories UC** — chacune modifiable et supprimable, comme
  sur la page INCI en ce moment.
- **1.3** La carte **ne déménage pas telle quelle** : elle se refait avec le vocabulaire déjà en place
  sur la page plan comptable. **Zéro style en dur, rien de neuf dans le CSS.**
  - ⚠️ Chantal : « la page du plan comptable n'est pas des plus conviviale, mais c'est un détail ».
    **Le look d'ensemble de la page = item séparé, à faire d'un coup plus tard. Pas à la pièce ici.**

### Branche 2 — l'entonnoir du compte à l'achat
- **2.1** Trois listes qui se suivent : **classe** (Actif, Passif, Avoir, Revenus, Dépenses) →
  **section** (celles de cette classe seulement) → **compte** (ceux de cette section seulement).
  Tant que la classe n'est pas choisie, les deux autres restent fermées.
- **2.2** Chaque liste montre **le numéro ET le nom** ensemble — « 1305 — Stock d'ingrédients »,
  jamais le numéro tout seul.
- **2.3** Le compte n'existe pas : le bouton « ajouter un compte » est **déjà sur la page**, juste
  au-dessus. Créé là, il apparaît dans la liste **tout de suite** — sans recharger la page, sans
  perdre ce qui est tapé dans la catégorie.
- **2.4** Une catégorie qui existe s'ouvre avec **ses trois listes déjà placées** sur son compte.
- **2.5** Catégorie qui porte un compte **absent du plan** (déjà arrivé : 1035 au lieu de 1305) :
  elle s'affiche **en alarme avec son numéro orphelin**, au lieu de s'ouvrir vide comme si de rien n'était.

### Branche 3 — la densité
- **3.1** Densité et marge de perte se demandent **au même moment, dans la même carte**. Une catégorie
  ne se crée pas sans elles.
- **3.2** Elles vivent dans une **autre feuille** (`Config_v2`) que le reste de la catégorie
  (`Categories_UC_v2`). Si un des deux enregistrements rate, la catégorie existe à moitié — donc au
  prix silencieusement faux. → **réglé par 6.2 (une seule porte au serveur).**
- **3.3** ❌ **ANNULÉ.** Il avait été validé un champ « unité » qui commande la densité.
  **Vérifié : le champ `unite` de `Config_v2` est mort** — voir §2.4 des faits. **La carte porte
  2 champs, pas 3 : densité + marge de perte.**
- **3.4** Catégories existantes **sans ligne de densité** : affichées **en alarme** dans la liste,
  comme le compte orphelin de 2.5. On les voit et on les complète, au lieu qu'elles continuent à
  faire des prix faux en silence.

### Branche 4 — les 2 fenêtres rapides
- **4.1** **Achats : la fenêtre rapide reste** (c'est déjà une modale). Elle porte **la carte complète**,
  les 5 morceaux, entonnoir compris.
  **Recettes : « + Nouvelle catégorie… » disparaît** — on choisit parmi ce qui existe.
  (Raison : cette fenêtre **ne fonctionne pas** aujourd'hui — voir §3.3 des faits.)
- **4.2** Dans la modale des achats, l'entonnoir n'offre **que les comptes qui existent**. **Ajouter un
  compte reste sur la page plan comptable** — décision comptable, pas à improviser en pleine facture.
  Cas rare : le 1305 et les 50xx sont déjà là.
- **4.3** Le compte n'existe vraiment pas : la modale **dit ce qui manque et renvoie à la page plan
  comptable**. La facture reste en mémoire — elle se retrouve au retour.
- **4.4** La ligne en train d'être tapée **se garde** : `efSauvegarderSaisie()` / `efRestaurerSaisie()`
  existent déjà et retiennent **quantité, prix, format** (pas les deux listes — on revient justement
  pour les choisir).
- **4.5** La **catégorie à moitié tapée ne se garde pas** pendant le détour. On rouvre, on retape le
  nom, le compte est maintenant dans la liste. Trois secondes.

### Branche 5 — la page densité
- **5.1** Elle montre exactement les champs qui entrent dans la carte. Une fois la carte complète,
  c'est la **2e porte sur la même donnée** — celle qui fait les oublis. **Elle disparaît du menu système.**
- **5.2** Disparaissent avec elle : la section `#section-densites` dans `index.html`, les 2 boutons de
  menu, la ligne dans `afficherSection`, la balise de script, et **tout le fichier `js/admin-densites.js`**
  (5 fonctions). **La route `saveConfig` reste** — c'est elle que la carte utilise.

### Branche 6 — la suppression
- **6.1** Supprimer une catégorie **efface les deux lignes d'un coup** : la catégorie et sa densité.
  Le bouton reste comme aujourd'hui — offert **seulement quand aucun ingrédient n'utilise la catégorie**.
- **6.2** 🔴 **Une seule porte au serveur** : `saveCategorieUC` écrit **lui-même les deux feuilles**,
  `deleteCategorieUC` **efface les deux**. L'écran ne fait **qu'un seul appel** — il ne peut plus en
  réussir un et rater l'autre. **C'est ça qui règle le 3.2.**

### Branche 7 — la page INCI
- **7.1** Elle perd **son premier accordéon** (« Catégories Univers Caresse ») — c'est lui qui déménage.
  Elle garde **tout le reste** : ingrédients par catégorie, badges, filtres, prix au 100 g. Elle lit
  toujours les catégories (noms + drapeau INCI); elle ne les gère plus.
- **7.2** La case « INCI requis » **n'apparaît plus** sur la page INCI — une catégorie mal cochée se
  corrige là où elle est née. **Le filtre « À valider » et les badges 🔴 restent** : c'est la liste
  des INCI manquants, et Chantal y tient.

---

## 2. LES FAITS VÉRIFIÉS (dans les vrais fichiers, le 16 juillet 2026)

### 2.1 Où vit la gestion des catégories aujourd'hui
- **`js/admin-inci.js`** — tout est là, **rien dans le HTML** :
  - var `inciCategoriesUC`, remplie par `chargerInci()` :
    `Promise.all([getIngredientsInci, getCategoriesUC, getStock])` → remplit aussi `inciPrixParIng`,
    `listesDropdown.fullData`, `listesDropdown.types`, `inciDonnees`, puis `memoriserCatsInci(inciCategoriesUC)`.
  - L'accordéon est monté **en tête de `inciConstruireAccordeons()`** : un bloc `form-panel visible`,
    entête « Catégories Univers Caresse » + badge `badge-statut-ok` « X catégories »,
    corps `form-body inci-accord-body cache` **id `inci-uc-body`** contenant `inciRendreUC()`.
  - Les 4 fonctions : `inciRendreUC()`, `inciAjouterUC()`, `inciModifierUC(i, cat_id)`,
    `inciSupprimerUC(cat_id)` (celle-ci passe par `confirmerAction`).
  - `inciRendreUC()` compte les ingrédients par catégorie avec `listesDropdown.fullData`
    (`utilise.length`) et **cache le bouton Supprimer** dès qu'il y en a un.
- **Serveur : rien à déplacer.** `getCategoriesUC` / `saveCategorieUC` / `deleteCategorieUC` sont des
  routes communes (`Code.gs` lignes ~20, ~103, ~104).
- **Deux attaches seulement, les deux communes dans `js/admin.js`** — donc disponibles de n'importe
  quelle page : `listesDropdown.fullData` (déjà chargé au démarrage par `chargerDonneesInitiales`) et
  `memoriserCatsInci` / `catRequiertInci`. **Aucune incompatibilité au déplacement.**

### 2.2 Le laid (pourquoi la carte se refait — 1.3)
- Styles **écrits en dur dans le JS** : `style="max-width:130px"` (champ compte),
  `style="display:flex;align-items:center;gap:6px;white-space:nowrap"` (étiquette INCI),
  `style="cursor:pointer"` (entête).
- **Ancien vocabulaire** : `carte-admin`, `carte-admin-entete`, `form-ctrl`, `form-label`,
  `td-actions`, `btn-edit`, `btn-suppr`, `texte-secondaire`, `bouton bouton-petit bouton-vert-pale`.
- **La page plan comptable roule déjà sur l'autre** : `grille`, `champ`, `libelle`, `controle`,
  `actions`, `boutons boutons-vert`, `section-label`, `bloc`, `accroche`, `valeur`, `numero`,
  `textes-discrets`, `vide` / `vide-titre` / `vide-desc`. **Les deux ne se mélangent pas.**

### 2.3 Les feuilles et les fonctions serveur
- **`Categories_UC_v2`** : A `cat_id` · B `nom` · C `date_ajout` · D `compte_achat` · E `inci` (« oui » = requis).
- **`Config_v2`** : A `cat_id` · **B inutilisée** · C `densite` · D `unite` · E `marge_perte_pct`.
- **`Code.gs`** :
  - `getCategoriesUC_v2()` (~1642) → `{cat_id, nom, date_ajout, compte_achat, inci:true/false}`, trié par nom.
  - `saveCategorieUC_v2(data)` (~1665) → modifie col 2 / 4 / 5; crée avec `CAT-` + `padStart(4,'0')`;
    **refuse la création sans `compte_achat`**.
  - `deleteCategorieUC_v2(data)` (~1693) → **efface la ligne de `Categories_UC_v2` seulement.**
    La ligne de `Config_v2` reste **orpheline** (→ 6.1).
- **`utilitaire.gs`** (2e fichier .gs du projet Apps Script — contient aussi `validerMotDePasse_v2`,
  `exporterTextesSite_v2`, `getScrapingFournisseur_v2`, `recalculerTousLesHex_v2`, `getSS`, `toGrammes`) :
  - `getConfig_v2()` (ligne 166) → `{cat_id, densite, unite, marge_perte_pct}`.
  - `saveConfig_v2(data)` (ligne 187) → modifie col 3 / 4 / 5; **`appendRow` si la catégorie n'a pas de
    ligne** → 🟢 **rien à ajouter au serveur pour la naissance de la densité.**

### 2.4 🔴 Le champ « unité » est MORT (preuve du 3.3 annulé)
- Les **deux seuls endroits qui convertissent ml → g** ne lisent que **la densité** :
  - écran : `efGrammesDuFormat(qte, unite, cat_id)` dans `js/admin-achats.js` → `var d = cfg.densite || 1;`
  - serveur : `toGrammes(formatQte, formatUnite, densite)` — la densité vient de `configRows[r][2]` (col C).
- **La colonne D (`unite`) n'est jamais relue par un calcul.** L'unité qui compte vient **du format de
  la ligne d'achat**. Le champ ne servait qu'à s'afficher sur la page densité — qui disparaît.

### 2.5 La densité oubliée = silence total
- Aucune ligne dans `Config_v2` → `densite = parseFloat(configRows[r][2]) || 1` → **densité 1**,
  marge 0. **Aucun avertissement.** Tout ce qui s'achète en ml entre alors au mauvais prix au gramme.

### 2.6 Les achats (branche 4)
- `efRendreLigneSaisie()` (`js/admin-achats.js`) bâtit `optsCatUC` depuis `listesDropdown.categoriesMap`
  et termine par `<option value="__nouveau__">+ Nouvelle catégorie UC…</option>`.
  `efOnChangeCatUC()` → `efOuvrirModalNouvelleCatUC()`.
- Modale **`#modal-ef-nouvelle-cat-uc`** (dans `admin/index.html`) : `-valeur` (nom),
  **`-compte` (case texte, placeholder « Ex: 1305 » ← l'irritant)**, `-inci` (case à cocher).
  `efConfirmerModalNouvelleCatUC()` envoie `saveCategorieUC {nom, compte_achat, inci}`, met à jour
  `listesDropdown.categoriesMap` + `listesDropdown.catsInci`, insère l'option avant `__nouveau__`,
  la sélectionne, `efRemplirNomsUC(cat_id)`, ferme, `efRestaurerSaisie()`.
- **Rien ne s'écrit dans la feuille avant la finalisation** : `ef.factureActive` et `ef.lignes` vivent
  en mémoire; tout part d'un coup à `finaliserAchatComplet`. **Seuls les référentiels** (catégorie,
  ingrédient, format, liaison fournisseur) s'écrivent tout de suite — ils resservent.
- **Quitter la page ne perd pas la facture** : `efInit()` se relance à chaque visite
  (`initEnCours` remis à `false` dans le `finally`), `efVerifierFactureEnCours()` sort tout de suite si
  `ef.factureActive` existe, et `efAfficherEtatInitial()` la redessine. **Ce qui se perd : la ligne en
  train d'être tapée** (→ 4.4) **et 8 listes rechargées du serveur** au retour.

### 2.7 🔴 La fenêtre des recettes ne marche pas (preuve du 4.1)
- `rafraichirListeIngredientsRecette()` (`js/admin-produits.js`) bâtit `cats` **à partir des ingrédients
  existants** (`listesDropdown.fullData`), pas de la liste des catégories.
- Une catégorie neuve n'a **aucun ingrédient** → elle n'est **pas** dans `cats` → l'option n'existe pas
  → `ing.type === t` ne matche jamais → **le choix se perd aussitôt.**
- À retirer : l'option `<option value="__nouvelle_cat__">+ Nouvelle catégorie...</option>`, la branche
  `if (val === '__nouvelle_cat__')` dans `onChangeIngredientType`, les 4 fonctions
  (`ouvrirModalNouvelleCategorieUC`, `fermerModalNouvelleCategorieUC`, `confirmerModalNouvelleCategorieUC`,
  `creerModalNouvelleCategorieUC`) et la var `_modalNouvelleCatIdx`. **Moins de code.**

### 2.8 La page densité (branche 5)
- `js/admin-densites.js` : var `donneesDensites` + `chargerDensites()`, `ouvrirFormDensite()`,
  `fermerFormDensite()`, `modifierDensite(cat_id)`, `sauvegarderDensite()`.
- `admin/index.html` : `#section-densites` avec `form-densites`, `fd-mode`, `fd-type`, `fd-densite`,
  `fd-unite` (ml/g/L/kg), `fd-marge-perte`, `tableau-densites`, `tbody-densites`, `vide-densites`,
  `loading-densites`, `msg-densites`, `btn-nouvelle-densite`.
- Menus : `afficherSection('densites', this)` (sidebar) et `afficherSection('densites', null)`
  (dropdown), **groupe « système »**, à côté d'INCI.
- `js/admin.js` : `if (id === 'densites') chargerDensites();`
- **Personne d'autre n'appelle `chargerDensites`.** `listesDropdown.config` continue d'être rempli au
  démarrage par `chargerDonneesInitiales` (route `getConfig`) — **ne pas y toucher.**

### 2.9 La page plan comptable (l'accueil du déménagement)
- `js/admin-comptabilite.js` : `chargerPlanComptable()`, `pcNomClasse(numero)` (1=Actif … 5=Dépenses),
  `pcRendre(sections, comptes)`, `pcAjouterSection()`, `pcAjouterCompte()`.
  Puis le bilan : `brDonnees`, `chargerBilanResultats()`, `brRendreChoix()`, `brChangerAnnee()`,
  `brSens()`, `brCalculer()`, `brRendreClasse()`, `brAfficher()`.
- Route `getPlanComptable` → `{ sections:[{numero, nom}], comptes:[{numero, nom, section}] }`
  → **c'est la matière de l'entonnoir (2.1).** La classe = **le 1er chiffre du numéro**
  (`pcNomClasse` fait déjà le travail).
- Ids en place : `pc-sec-numero`, `pc-sec-nom`, `pc-cpt-section`, `pc-cpt-numero`, `pc-cpt-nom`;
  section `#section-plan-comptable` / `#msg-plan-comptable` / `#loading-plan-comptable` /
  `#contenu-plan-comptable`. **Ne jamais renommer un `id`.**
- `js/admin.js` : `if (id === 'plan-comptable') chargerPlanComptable();`
- Menu comptabilité (**les deux menus**, gauche + dropdown du haut) : plan comptable ·
  journal général *(bientôt)* · grand livre *(bientôt)* · bilan et résultat.

### 2.10 Les communes de `js/admin.js` (à réutiliser, ne pas réinventer)
- `listesDropdown = { types, fullData, config, fournisseurs, formats, catsInci }` (+ `categoriesMap`, `stock`).
- `memoriserCatsInci(items)` → remplit `listesDropdown.catsInci`.
  `catRequiertInci(cat_id)` → inconnue ou mémoire vide = **requis, par prudence**.
- `confirmerAction(message, callback)`, `afficherChargement()` / `cacherChargement()`,
  `afficherMsg(zone, texte, 'erreur')`, `formaterPrix()`.
- `chargerDonneesInitiales()` : 16 appels en parallèle, dont `getCategoriesUC`
  (→ `categoriesMap` + `memoriserCatsInci`) et `getConfig` (→ `listesDropdown.config`).

---

## 3. CE QU'IL RESTE À FAIRE (rien n'est commencé)

**Ordre proposé — à faire valider par Chantal avant le 1er trouve-et-remplace :**

1. **`Code.gs`** — `saveCategorieUC_v2` : accepte `densite` et `marge_perte_pct`, écrit **les deux
   feuilles** (`Categories_UC_v2` + `Config_v2`, en réutilisant la logique d'`appendRow` de
   `saveConfig_v2`). `deleteCategorieUC_v2` : efface **les deux lignes**. → 6.2
2. **`js/admin-comptabilite.js`** — la liste des catégories + la carte (vocabulaire de la page,
   entonnoir 2.1→2.5, densité + marge, alarmes 2.5 et 3.4), branchée dans `chargerPlanComptable`.
3. **`admin/index.html`** — la modale des achats : l'entonnoir + densité + marge à la place de la case
   texte `modal-ef-nouvelle-cat-uc-compte`. → 4.1, 4.2, 4.3
4. **`js/admin-achats.js`** — `efConfirmerModalNouvelleCatUC` : envoi ajusté (5 morceaux), mémoire
   `catsInci` + `config` mise à jour, renvoi vers le plan comptable si le compte manque.
5. **`js/admin-inci.js`** — retirer l'accordéon UC et les 4 fonctions. → 7.1, 7.2
6. **`js/admin-produits.js`** — retirer « + Nouvelle catégorie… », les 4 fonctions, `_modalNouvelleCatIdx`. → 4.1
7. **Suppression de la page densité** : `js/admin-densites.js`, `#section-densites`, les 2 boutons,
   la ligne d'`afficherSection`, la balise de script. → 5.2

**À publier au bout** : **nouveau déploiement Apps Script** (`Code.gs` modifié) **+ republier le site**
(`admin/index.html`, `js/admin.js` si touché, `js/admin-comptabilite.js`, `js/admin-achats.js`,
`js/admin-inci.js`, `js/admin-produits.js`, retrait de `js/admin-densites.js`).

---

## 4. LES POINTS OUVERTS (pas tranchés — ne pas décider à sa place)

1. **Le grand regroupement.** Idée de Chantal : « tout ce qui touche à la création de données qui
   servent ailleurs devrait être dans un même groupe » (cat UC, sections, comptes, promotions,
   fournisseurs). **Reste sur la table.** Objections posées et non résolues : « sert ailleurs » ne coupe
   nulle part (collections, gammes, familles, univers, produits entrent dans la même définition — et
   c'est déjà le groupe « Création »); et la vraie création se fait **pendant le travail**, pas au menu.
   Le groupe serait donc « les listes », pas « création ». **Cet item-ci ne touche qu'aux catégories UC,
   au plan comptable et à la densité.**
2. **Le look de la page plan comptable** au complet — item séparé, d'un coup, plus tard (1.3).
3. **`Config_v2`** : la colonne B (inutilisée) et la colonne D (`unite`, morte) — les laisser dans la
   feuille ou les nettoyer? Pas décidé. **Ne rien effacer sans son OK.**
4. **La correction `1035` → `1305`** dans `Categories_UC_v2` (notée dans `Plan-comptable-Univers-Caresse.md`) —
   à vérifier; l'alarme du 2.5 la fera sortir toute seule.

---

## 5. RAPPELS DE MÉTHODE QUI ONT SERVI DANS CETTE SESSION

- **Lire un fichier ne demande pas d'autorisation.** Le faire.
- **Ne jamais deviner** : `getConfig_v2` / `saveConfig_v2` manquaient au `code.gs` du projet → la
  session s'est arrêtée net pour demander `utilitaire.gs`. **Le projet Apps Script a 2 fichiers .gs.**
- **Zéro code dans la conversation.** Chantal : « oh boy, je déteste voir ça comme ça, me donne mal au
  cœur ». Les noms de fonctions et de fichiers vont **dans le .md**, pas à l'écran.
- **Une seule question par message, oui/non si possible. 3 lignes max.**
- **Vérifier avant de proposer** — c'est la vérification qui a tué le 3.3, sauvé la fenêtre des achats
  et condamné celle des recettes.

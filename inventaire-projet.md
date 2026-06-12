# INVENTAIRE — Carte du projet Univers Caresse
### Analyse 5.1 — basée sur la lecture des vrais fichiers du dossier
*(Vérifié : tout ce qui suit vient des fichiers eux-mêmes, pas des souvenirs des md. Les points incertains sont marqués ⚠️.)*

--- 

## 1. Les trois étages de la maison

1.1 **Le site public** — ce que les clients voient (catalogue, fiches produits, coups de cœur).
1.2 **L'admin** — l'outil de travail de Chantal (collections, produits, stock, ventes, commandes...).
1.3 **Le serveur** — Google Sheets + Apps Script (`Code.gs`) : c'est là que vivent les données. Tout le reste lui parle par `appelAPI` (lire) et `appelAPIPost` (écrire).

---

## 2. Les fichiers confirmés

### 2.1 Site public
- `index.html` — la page publique.
- `js/main.js` — le moteur du site public. **Contient aussi `CONFIG` (l'adresse du serveur) et `appelAPI` / `appelAPIPost`** — les deux fonctions par lesquelles TOUT le projet parle au serveur.
- `js/main-demande.js` — le système coups de cœur (liste, bulle, modal, coordonnées).

### 2.2 Admin
- `admin/index.html` — toute l'admin dans une seule page (sections cachées/montrées).
- `admin/login.html` — la page de connexion (l'admin y renvoie si pas connecté).
- ⚠️ `admin/index - Copie.html` — **une vieille copie qui traîne dans le dossier.** Poids mort à supprimer (après vérification que rien ne pointe dessus).

### 2.3 Habillage
- `css/style.css` — la grosse feuille de style, public + admin.
- `css/generique.css` — la nouvelle feuille générique (fiches, boutons). **Elle existe bel et bien** — l'admin charge les deux feuilles. *(Ceci confirme un des « à confirmer » du document ÉTAT : la 2ᵉ vague de renommage a été faite pour les 4 sections migrées.)*

### 2.4 Les JS de l'admin (un par section, à peu près)
- `js/admin.js` — le chef d'orchestre : connexion, navigation (`afficherSection`), chargement initial des données, fonctions partagées (messages, confirmation, chargement).
- `js/admin-collections.js`, `admin-gammes.js`, `admin-familles.js`, `admin-regroupements.js` — les 4 sections migrées au générique.
- `js/admin-produits.js` — produits/recettes (gros fichier, son propre cache).
- `js/admin-commandes.js` — commandes (flux complet, propositions, Square).
- `js/admin-ventes.js` — ventes (réécrit le 4 mai 2026).
- `js/admin-remboursements.js` — remboursements (créé le 4 mai 2026).
- `js/admin-factures.js`, `admin-fournisseurs.js`, `admin-mediatheque.js`, `admin-liste-prix.js`, `catalogue-builder.js`.
- ⚠️ Des fonctions existent pour INCI, densités, contenu du site, rédaction, fabrication, entrée de facture (`chargerInci`, `chargerDensites`, `chargerContenuSite`, `redInit`, `chargerFabrication`, `efInit`) — dans quels fichiers exactement, à confirmer en poursuivant la lecture.

### 2.5 Serveur
- `Code.gs` — pas encore lu (gros, on le regardera en temps et lieu). ⚠️ Une note parle de `coge.gs` — probablement une faute de frappe, à vérifier.

---

## 3. Qui dépend de qui (les tuyaux dans les murs)

3.1 **L'admin dépend du site public.** `admin.js` le dit lui-même : « CONFIG et appelAPI définis dans main.js ». Donc si on touche `main.js`, on peut briser TOUTE l'admin. Tuyau n° 1 à ne jamais oublier.

3.2 **Les JS de l'admin partagent des variables communes** : `donneesCollections`, `donneesGammes`, `donneesProduits`, `listesDropdown`, `prodCache`, `squareAppId`... Elles sont remplies par un fichier et lues par les autres. Toucher l'une d'elles dans un fichier a des impacts dans tous les autres.

3.3 **Au démarrage de l'admin, 16 appels au serveur partent en même temps** pour tout charger d'un coup. C'est lourd, et si un seul échoue, certaines sections affichent du vide. Piste pour l'instabilité ressentie.

3.4 **`main.js` appelle `main-demande.js` en douceur** (il vérifie que la fonction existe avant de l'appeler) — bien fait, ça ne plante pas si le fichier manque.

3.5 **`style.css` ET `generique.css` se partagent l'habillage**, avec des règles parfois en double (ex. `.section-label` existe dans les deux). Quand deux règles se battent, c'est l'ordre de chargement qui gagne — source classique de « ça marchait hier ».

---

## 4. Premières trouvailles — tes 25 boutons confirmés

4.1 **Trois générations de styles cohabitent dans les vrais fichiers, aujourd'hui :**
- Génération 1 (l'ancienne) : `.bouton`, `.form-groupe`, `.form-label`, `.form-ctrl`, `.btn-fermer-panneau`... — encore utilisée par `admin-produits.js` et même par des boutons de `admin/index.html` (« + Nouvelle gamme », « + Nouvel univers »).
- Génération 2 (la transition) : `.boutons`, `.boutons-vert`, `.fiches-*`...
- Génération 3 (la nouvelle) : `.titre`, `.central`, `.champ`, `.libelle`, `.controle`, `.visuel-*`... — utilisée par les 4 sections migrées.

4.2 **Pire : le site public a sa propre 4ᵉ variante.** `main-demande.js` utilise `form-group` (sans « e ») et `form-control`, pendant que l'admin utilise `form-groupe` et `form-ctrl`. Quatre façons d'écrire un champ de formulaire.

4.3 Conséquence directe : on ne peut PAS encore faire le ménage des vieux styles — des sections vivantes s'en servent toujours. L'ordre obligé : finir la migration d'abord, supprimer ensuite.

---

## 5. Prochaines étapes de l'analyse

5.1 ✅ Inventaire (ce document).
5.2 Doublons et poids mort — compter précisément : combien de définitions de boutons, de titres, de champs; quelles règles CSS ne servent plus à rien; quelles fonctions sont en double.
5.3 Stabilité — la liste des « si » dangereux : classes injectées par le JS qui n'existent dans aucune des deux feuilles de style, enchaînements de boutons qui plantent, données manquantes mal encaissées.
5.4 Rapport final avec les priorités.

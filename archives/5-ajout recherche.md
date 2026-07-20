# RECHERCHE (loupe) — site public Univers Caresse
### Arbre de 51 branches validé avec Chantal — 5 juillet 2026. Aucun code écrit encore.

---

## 1. Périmètre

1.1 La loupe cherche dans : produits, collections, gammes, univers, Le savon artisanal (7 sous-pages), Bon à savoir. **Pas Contact. Pas Accueil** (vitrine, pas du contenu).
1.2 On cherche dans : noms/titres, slogans, descriptions, textes des blocs, noms français des ingrédients (`nom_ingredient`, pas seulement l'INCI), et mots-clés invisibles.
1.3 Seulement ce qui est **visible** sur le site (produit épuisé/retiré = pas dans les résultats).
1.4 Tout ajout/modif dans l'admin est trouvé automatiquement au prochain chargement du site.
1.5 Pas de recherche dans les formats/poids (trop pareils, pas utile ici).

## 2. Comportement de la recherche

2.1 Minimum 2 lettres; en dessous, rien ne s'affiche.
2.2 Résultats mis à jour à mesure qu'on tape, sans bouton.
2.3 Plusieurs mots = l'item doit contenir **tous** les mots. À chaque lettre ajoutée, les résultats se recalculent.
2.4 Accents et majuscules ignorés (« epure » trouve « ÉPURE »).
2.5 **Correspondance exacte seulement** : pas de mots proches (« lavandin »), pas de tolérance aux fautes (« lavende » ne donne rien) — choix assumé, moins d'erreurs.
2.6 Caractères spéciaux (%, *, «) ignorés; seuls lettres et chiffres comptent.
2.7 Texte long collé (phrase entière) = on cherche tous les mots quand même, quitte à ne rien trouver.
2.8 Aucun résultat = message « Aucun résultat pour "…" ».
2.9 Données pas encore chargées = « Chargement… », puis résultats dès que prêt.
2.10 Connexion coupée en cours de route = la recherche continue (données déjà chargées); seule une image pas chargée peut manquer.
2.11 Effacer le texte ou fermer = le site redevient comme avant.
2.12 Échap, clic à côté du panneau ou défilement de la page derrière = fermeture.
2.13 Un **X** au bout du champ efface et ferme (essentiel sur iPhone).
2.14 Après un clic sur un résultat, le mot reste dans le champ (retour possible). *À valider au résultat.*
2.15 Rien de mémorisé entre les visites : champ vide au retour.
2.16 Pivoter le téléphone (portrait ↔ paysage) garde la recherche ouverte, juste redimensionnée.

## 3. Présentation des résultats

3.1 Panneau sous le champ, par-dessus la page. *À valider au résultat.*
3.2 Regroupé par section, dans cet ordre : Collections → Univers → Le savon artisanal → Bon à savoir.
3.3 Un produit s'affiche toujours sous sa **collection → gamme** (jamais seul).
3.4 Le double est voulu : un produit peut réapparaître sous son univers (ex. « argile jaune »).
3.5 Une gamme trouvée par son nom s'affiche sous sa collection avec ses produits dessous.
3.6 Une collection trouvée par son nom (ex. « épure ») = un lien seul, sans dérouler ses produits.
3.7 Un univers trouvé par son nom (ex. « Lui ») = un lien seul, sans dérouler ses produits.
3.8 Collections et univers dans le même ordre que sur le site (rang).
3.9 Nombre de résultats affiché à chaque titre, ex. « Collections (4) ». *À valider au résultat.*
3.10 Chaque item trouvé est un lien et affiche **juste son nom**.
3.11 Le savon artisanal et Bon à savoir : l'item affiche le **titre du bloc** trouvé (ex. « Nos engagements »); bloc sans titre = titre de la sous-page (ex. « La cure »).
3.12 Collection ou gamme au-dessus d'un produit déroulé : cliquable seulement si le mot s'y trouve aussi (nom, slogan, description); sinon simple titre.
3.13 Liste longue acceptée (ex. « karité ») : le client affine en ajoutant un mot.
3.14 Texte indicatif du champ vide : « Rechercher… » (pas de possessif, règle 4.2).

## 4. Clic sur un résultat

4.1 Produit → sa fiche (fenêtre existante). Le panneau de résultats reste derrière; fermer la fiche = on retrouve ses résultats.
4.2 Collection ou univers → sa page.
4.3 Le savon artisanal → la bonne sous-page directement (`afficherEduSection(n)`), puis descente jusqu'au **titre du bloc** contenant le résultat — jamais au milieu de nulle part.
4.4 Bon à savoir → la page, descente jusqu'au **titre du bloc** (ex. « Nos engagements »).

## 5. Emplacement de la loupe

5.1 Ordinateur : au bout à droite de la barre de menu. Reste accessible quand une fiche est ouverte.
5.2 Mobile : loupe à l'**extrême gauche** de l'écran, burger à l'extrême droite. Pas dans le menu burger.
5.3 Mobile : la loupe disparaît au défilement vers le bas et réapparaît en remontant (même mécanique `cache-scroll` que le burger).
5.4 La loupe reste visible par-dessus une fiche produit ouverte; un clic ferme la fiche et ramène le champ.
5.5 Clic sur la loupe = un champ de texte s'ouvre.
5.6 Mobile : champ pleine largeur en haut de l'écran, résultats dessous.
5.7 Très petit écran : panneau pleine page pour rester lisible.

## 6. Apparence et accessibilité

6.1 Couleurs du site conservées, pas de version sombre spéciale.
6.2 Étiquettes accessibles pour lecteur d'écran (invisibles, standard, rien de visuel ne change).

## 7. Mots-clés invisibles (nouveau)

7.1 Champ « mots-clés » facultatif, **jamais affiché** sur le site, lu seulement par la loupe.
7.2 Sur : univers, collections, gammes, produits.
7.3 Cas d'origine : univers « Lui » + mot-clé « homme » — sans genrer quoi que ce soit de visible.
7.4 Géré dans l'admin; nouvelle colonne dans les feuilles Google Sheets concernées.

## 8. Plan trouve-et-remplace (un à la fois, OK de Chantal entre chaque)

⚠️ **8.1 et 8.2 EN ATTENTE : `Code.gs` n'est pas à jour dans le dossier du projet** (constaté le 5 juillet 2026). La recherche se bâtira d'abord sans les mots-clés (8.3 à 8.6); les mots-clés s'ajouteront quand `Code.gs` sera déposé.

8.1 **[EN ATTENTE]** Colonne mots-clés dans Google Sheets (univers, collections, gammes, produits) + `Code.gs` la renvoie dans le catalogue public.
8.2 **[EN ATTENTE]** Admin : champ mots-clés dans les 4 formulaires (admin-*.js) + sauvegarde.
8.3 **HTML** : loupe dans la barre de menu (`nav-actions` existante) + champ + panneau de résultats (`index.html`).
8.4 **CSS** : styles du champ, du panneau, du X, du mobile (generique.css, règle css-generique).
8.5 **JS** : moteur de recherche dans `main.js` (normalisation accents/majuscules, tous les mots, sections, liens, mécanique `cache-scroll` réutilisée).
8.6 **Navigation** : clics vers fiche produit, pages, sous-pages éducatives, titres de blocs.
8.7 Republier : site → republier (pas de `Code.gs` touché tant que 8.1-8.2 en attente). Ne pas tester avant la fin (règle 3.2).

## 9. Points à valider au résultat

9.1 Panneau par-dessus la page (3.1).
9.2 Nombre par section (3.9).
9.3 Mot conservé après un clic (2.14).
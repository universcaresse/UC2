# RELAIS — Fenêtre et page Coups de cœur (Univers Caresse)
## Pour le prochain Claude. Chantal a déjà tout validé ici : NE PAS reposer de questions. Dérouler les trouve-et-remplace un à la fois et attendre son « ok » entre chacun.

---

## 1. Règles de travail (résumé de METHODE.md — la respecter au complet)
- Jamais de code sans OK. Un seul trouve-et-remplace à la fois, attendre « ok ».
- Vérifier dans les vrais fichiers du projet avant chaque proposition (preuve en 2 lignes : Vérifié / Impacts).
- Ne jamais renommer les `id`. Réutiliser l'existant, réduire le code.
- Réponses courtes (3 lignes), zéro jargon, une seule question par message, pas de listes à choix.
- Ne jamais proposer d'arrêter. Chantal décide de tout le rythme.
- Vocabulaire public : jamais « panier », pas de possessifs.

## 2. État actuel (fait et testé en partie)
- La fenêtre Coups de cœur (js/main-demande.js) roule maintenant au complet sur generique.css : `voile` + `modale` + `modale-entete` (titre commun `id="demande-titre"` + X `boutons-fermer demande-modal-fermer`) + `modale-corps`.
- Le titre change par JS selon la page interne : « Vos Coups de cœur » / « Coordonnées » / « Merci de votre intérêt ».
- Items : `rangeeitem` + `rangeeitem-photo` + `compteur`. Total : `lignetotal`. Boutons : `boutons boutons-vert|boutons-contour boutons-pleine-largeur` (classes-poignées JS conservées : `demande-continuer`, `demande-form-envoyer`).
- Nouveau dans generique.css : `--taille-64`, `.rangeeitem-photo`, `.boutons-pleine-largeur` (+12px entre deux), nowrap dans `.lignetotal`, repli mobile `.rangeeitem`, padding mobile `.modale-entete/.modale-corps`. `.boutons-ajout` éliminée.
- Ménage fait dans style.css : règles `demande-item…`, `demande-modal…` (cadre, titre, pied, total, vide), `.demande-continuer`, `.demande-form-envoyer`, doublons du bloc coupdecoeur — toutes retirées.
- Republier = site seulement (aucun changement Code.gs jusqu'ici).

## 3. TRAVAIL 1 — Photos manquantes sur la page « Modifier » (page ouverte depuis le courriel, fonction `coupdecoeurRendre` dans js/main-demande.js)
- Vérifié : le serveur (`getCommandePourClient` dans Code.gs) envoie déjà `image_url` pour chaque ligne. La page ne l'affiche pas.
- À faire : ajouter la photo dans les rangées de `coupdecoeurRendre` avec la classe existante `rangeeitem-photo` (img si `image_url`, sinon div vide — même patron que la fenêtre). Vérifier le HTML exact des rangées dans le fichier avant de proposer.

## 4. TRAVAIL 2 — Bouton de retour sur la page « Modifier » : ARBRE VALIDÉ PAR CHANTAL (ne pas rediscuter)
1. Rien touché → le bouton dit **« Conserver la commande »** : cliquer ferme la page ET vide les Coups de cœur gardés dans le navigateur (localStorage).
2. Dès le premier geste (quantité changée ou produit retiré) → le bouton devient **« Retourner la commande modifiée »** et le reste, même si le client remet tout comme avant.
3. Liste vidée au complet → bouton **bloqué** (le bouton « Annuler » séparé existe déjà pour annuler).
4. Fermer la page sans envoyer → rien ne change au dossier, changements perdus.
5. Échec d'envoi → message d'erreur du serveur affiché, bouton redevient cliquable (comportement actuel conservé).
6. Réussite → page « Merci ! » ET les Coups de cœur du navigateur sont **vidés** (changement : aujourd'hui ils sont remplacés par la nouvelle version).

## 5. Points de vigilance vérifiés cette session
- `demandeRenvoyerModif` utilise `document.querySelector('.demande-continuer')` pour désactiver le bouton pendant l'envoi : depuis les changements, ce sélecteur peut attraper le mauvais bouton (le premier trouvé). À vérifier et corriger avec un sélecteur précis pendant TRAVAIL 2.
- L'ouverture/fermeture de la fenêtre passe par la classe `ouvert` sur l'overlay `voile` — compatible generique, ne pas toucher.
- Le « Merci ! » de la page Modifier porte maintenant la classe `titre` (generique).
- Chantal teste seulement quand elle publie ; si une étape dépend d'une autre, la prévenir de ne pas tester entre-temps.

## 6. Ordre de travail
1. TRAVAIL 1 (photos) — quelques trouve-et-remplace.
2. TRAVAIL 2 (bouton) — bâtir selon l'arbre du point 4, un morceau à la fois.
3. Rappeler à la fin : republier le site (pas de redéploiement Apps Script sauf si Code.gs bouge).

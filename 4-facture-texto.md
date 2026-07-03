# Facture jolie par texto — Vente directe au marché
### Arbre validé par Chantal le 3 juillet 2026
> **But de ce document.** Permettre de reprendre ce sujet à froid, sans reposer une seule question. L'arbre est complet et validé — la prochaine session passe directement à la construction (règle 1.9 satisfaite).

---

## 0. CONTEXTE (à lire en premier si tu arrives à froid)

- **Le besoin.** Lors d'une vente directe au marché, Chantal veut remettre au client une facture **jolie** par **texto** (le courriel est trop lent sur place).
- **Le problème.** Un texto ne peut pas être joli en soi (texte brut seulement). Le texto actuel (`envoyerFactureTexto` dans `js/admin-ventes.js`) envoie une facture en texte brut.
- **La solution validée.** Le texto contient un **lien** vers une page du site qui affiche la facture jolie. Modèle : `universcaresse.ca/?facture=0042&jeton=...`
- **Rien de plus à sauvegarder.** Chaque vente est déjà dans la sheet (`Ventes_Entete_v2` + `Ventes_Lignes_v2`) avec son numéro. La page lit la vente en direct.
- **Règle qui gouverne tout (comme le 1ᵉʳ courriel) :** la page est en **lecture seule**. Regarder, recliquer, rouvrir : rien ne s'écrit dans la sheet.

---

## 1. CE QUI EXISTE DÉJÀ — VÉRIFIÉ DANS LES VRAIS FICHIERS (on réutilise, on ne gonfle pas)

- **`envoyerFacture_v2(data)`** (`Code.gs`, ~ligne 4797) : fabrique le HTML de la facture jolie (logo, vert, tableau, totaux). A déjà un **mode aperçu** (`data.apercu`) qui **retourne le HTML sans rien envoyer ni écrire**. Vérifié : aucune écriture sheet dans cette fonction.
- **Bloc client conditionnel** : `${client ? ... : ''}` — sans nom, le bloc « Client » disparaît proprement.
- **`getVentesLignes_v2(ven_id)`** (`Code.gs`, ligne ~30 du routeur GET) : lit les lignes d'une vente par numéro.
- **Lecture de paramètres d'adresse** : `verifierRetourPaiement()` dans `js/main.js` lit déjà `?paiement=recu` — on branche `?facture=` au même endroit.
- **Jeton (modèle des commandes)** : colonne « jeton » dans l'entête, créé par `Utilities.getUuid().replace(/-/g,'').slice(0,16)` (`Code.gs` ~ligne 2848), ajouté au lien, **vérifié avant toute action** (~lignes 2711–2722). Même recette pour les ventes.
- **`envoyerFactureTexto()`** (`js/admin-ventes.js`) : ouvre l'app Messages de Chantal via `window.open('sms:' + telephone + '?body=...')`. Exige un téléphone (champ rouge sinon). C'est **Chantal qui appuie sur envoyer**.
- **`sauvegarderCoordonnees()`** (`js/admin-ventes.js`) : sauvegarde courriel/téléphone dans la sheet — réutilisée pour le champ téléphone de la fiche.
- **Boutons Texto / Courriel / Imprimer** : existent dans `modal-apres-vente` et `modal-facture-vente` (`admin/index.html`) — mais **seulement au moment de la vente**.

---

## 2. L'ARBRE VALIDÉ — LES 6 BRANCHES

### Branche 1 — Le chemin simple ✅
- 1.1 Chantal clique « Envoyer par texto » → l'app Messages s'ouvre : mot doux + lien.
- 1.2 Le lien suit le modèle des commandes : `universcaresse.ca/?facture=0042&jeton=...`. Le site reconnaît le paramètre.
- 1.3 La page appelle l'API avec le numéro + jeton, reçoit le HTML déjà existant (`envoyerFacture_v2` mode aperçu), l'affiche plein écran. **Lecture seule.**

### Branche 2 — Le client reclique ✅
- 2.1 Plus tard, plusieurs fois, autre appareil : la facture s'affiche pareil à chaque fois, rien ne bouge dans la sheet.
- 2.2 **Bouton « Imprimer »** sur la page : le client imprime ou sauvegarde en PDF depuis son appareil.

### Branche 3 — Le texto ne part pas ✅
- 3.1 Pas de téléphone : déjà géré — champ rouge « Téléphone requis », rien ne part.
- 3.2 Mauvais numéro : Chantal envoie depuis son app Messages; si le numéro est invalide, Messages le signale, elle corrige dans la fiche et reclique. **Rien à coder.**

### Branche 4 — Quelqu'un d'autre ouvre le lien ✅
- 4.1 Les numéros se suivent → risque de curieux. **Jeton par vente** (même recette que les commandes) : ajouté au lien, vérifié avant d'afficher. Sans jeton valide, la page ne s'ouvre pas.

### Branche 5 — La vente change après l'envoi du lien ✅
- 5.1 La page lit la sheet en direct : si Chantal corrige la vente, le client qui reclique voit la facture **corrigée**, pas l'ancienne. Comportement voulu.

### Branche 6 — Renvoyer plus tard ✅ (corrigée en cours de route)
- 6.0 **Constat de Chantal (exact, vérifié)** : les boutons Texto/Courriel n'existent qu'au moment de la vente; une fois les fenêtres fermées, **rien dans la liste des ventes ne permet de renvoyer**.
- 6.1 **À bâtir** : ajouter à la fiche d'une vente existante les boutons Texto / Courriel / Imprimer (réutiliser les fonctions en place) + un **champ téléphone** remplissable sur place (sauvegardé via `sauvegarderCoordonnees`).
- 6.2 **Nom du client facultatif.** La majorité des ventes directes n'ont pas de nom. Décidé : afficher **« Vente au marché »** à la place du nom quand la fiche n'a pas de client.

---

## 3. CE QUI N'EXISTE PAS ENCORE — À BÂTIR (aucun code écrit à ce jour)

1. **Colonne « jeton » dans `Ventes_Entete_v2`** + création du jeton à la finalisation de la vente (même recette que les commandes, `Code.gs`).
2. **Point d'entrée API public** : lire une vente par numéro + jeton, vérifier le jeton, retourner le HTML de `envoyerFacture_v2` en mode aperçu. Substituer « Vente au marché » si pas de nom.
3. **`js/main.js`** : reconnaître `?facture=` (à côté de `?paiement=recu` dans `verifierRetourPaiement`), afficher la facture plein écran + bouton « Imprimer ».
4. **`js/admin-ventes.js`** : modifier `envoyerFactureTexto` pour que le texto contienne un **mot doux + le lien** (au lieu de la facture texte brut).
5. **Fiche d'une vente existante** (`admin/index.html` + `js/admin-ventes.js`) : boutons Texto / Courriel / Imprimer + champ téléphone.

> ⚠️ Ordre et découpage exacts des trouve-et-remplace : à établir au début de la construction, **un à la fois, OK de Chantal entre chaque** (règle 1.2). `Code.gs` modifié → nouveau déploiement Apps Script; HTML/CSS/JS → republier le site (règle 3.3).

---

## 4. OÙ ON EN EST

- ✅ Arbre complet, 6 branches validées par Chantal (3 juillet 2026).
- ⬜ Construction pas commencée. Prochaine session : présenter le premier trouve-et-remplace (proposition de commencer par la colonne jeton, mais **Chantal choisit l'ordre**).
- Aucune correction en attente ailleurs liée à cet item.

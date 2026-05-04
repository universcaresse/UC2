# BRIEF — RÉÉCRITURE ADMIN-ACHATS.JS

**Pour le prochain Claude qui reprendra ce dossier.**

---

## CONTEXTE

L'utilisatrice (Chantal, propriétaire d'Univers Caresse — savonnerie artisanale) travaille sur la section achats de son interface admin depuis 3 mois avec différents Claude. Chaque itération a empilé des patchs sur du code déjà fragile, sans jamais clarifier la logique de base. Résultat : code instable, bugs qui réapparaissent, frustration accumulée.

**Elle a un fichier de référence : `LOGIQUE-ACHATS.md`**, écrit ensemble dans cette conversation. C'est la source de vérité. Tout code doit respecter ce document.

---

## CE QUE J'AI FAIT DE TRAVERS

### 1. Première livraison du nouveau `admin-achats.js` — premier jet, pas réfléchi

J'ai pris la logique propre de `LOGIQUE-ACHATS.md` et j'ai écrit le code en mode "premier jet". Pas de relecture critique. Pas de tests mentaux. Pas d'anticipation des cas limites. Résultat : plusieurs bugs qu'elle a dû découvrir un par un en testant.

**Bugs livrés à la première version :**

- Fonction `efAfficherEtatInitial` appelée mais jamais définie → erreur ReferenceError au chargement
- Bloc "Informations de la facture" pas caché quand une facture est en attente (l'utilisateur pouvait essayer d'en créer une nouvelle pendant qu'une autre attendait)
- Disposition des colonnes : tout empilé dans la colonne 1, colonnes UC à droite vides
- Pour les fournisseurs sans scraping, affichage "Sans scraping" inutile en colonne 1, et cat/nom UC à droite (alors qu'on commence à saisir par la gauche)
- **Bug critique** : quand un modal s'ouvrait (nouveau format, nouvel ingrédient, nouvelle cat, nouveau nom fourn), les valeurs déjà saisies (qté, prix, format) se perdaient au retour. C'est un bug de base qu'on apprend en première semaine.
- `efRemplirFormats` vidait la sélection courante au lieu de la préserver
- `efEditerLigne` utilisait des `setTimeout` empilés (30ms × 4) au lieu de procéder dans le bon ordre directement
- Code Apps Script `Math.max(0, ...)` dans `deleteAchat_v2` qui empêchait les crédits (achats négatifs) de remonter le stock à zéro après suppression

### 2. Méthode des patchs au lieu de réécrire

Quand elle signalait un bug, je lui donnais un trouve/remplace. Puis un autre. Puis encore un autre. Elle m'a dit explicitement : *"je ne fais que ça recommencer des calisse de tests, finalement tu n'es pas mieux que les autres"*. Et elle avait raison.

**Pourquoi c'était mauvais :**
- Chaque patch = un nouveau test = une nouvelle chance qu'un autre bug surgisse
- Les patchs ne réglaient pas la cause racine (ex : sauvegarder la saisie avant d'ouvrir un modal — c'est systémique, pas localisé)
- L'utilisatrice ne devrait pas avoir à débugger mon code

### 3. Prendre des raccourcis sur la méthode

Au lieu de faire ce qu'on aurait dû faire dès le départ — relire le fichier complet, anticiper les bugs, tester mentalement chaque scénario — j'ai livré vite pour montrer du progrès. Erreur classique. C'est exactement ce que les autres Claude ont fait avant moi.

---

## CE QUI EST DANS LA VERSION FINALE LIVRÉE

Un seul fichier `admin-achats.js` réécrit en entier, avec :

### Système central de sauvegarde/restauration de saisie
- `efSauvegarderSaisie()` — capture qté, prix, format avant tout modal
- `efRestaurerSaisie()` — restaure après le modal
- `efResetSaisie()` — vide après ajout réussi d'une ligne
- Appelé dans **tous** les `efOuvrirModal...` et `efFermerModal...`

### Plus de setTimeout fragiles
- `efEditerLigne` procède directement, dans le bon ordre

### `efRemplirFormats` mémorise la valeur courante
- Avant de rafraîchir la liste

### Disposition des colonnes corrigée
- **Avec scraping** : cat/nom fournisseur à gauche, cat/nom UC à droite
- **Sans scraping** : cat/nom UC à gauche, colonne UC droite vide

### État machine simple
- `factureActive` = facture créée, en saisie d'items
- `factureEnAttente` = facture "En cours" détectée au chargement, bandeau "Reprendre/Annuler" affiché
- Sinon = écran vide, bloc "Informations de la facture" visible

---

## AJUSTEMENTS APPS SCRIPT LIVRÉS

6 fonctions à remplacer dans le projet Apps Script (artifact séparé) :

- `createIngredientInci_v2` — gère le statut "validé" pour CAT-014/015/016/017, "à valider" sinon
- `createAchatEntete_v2` — vérification doublon par numéro+fournisseur
- `addAchatLigne_v2` — anti-doublon dans `Formats_Ingredients_v2` (clé : ing_id + four_id + qté + unité)
- `saveMappingFournisseur_v2` — anti-doublon plus strict
- `deleteAchat_v2` — soustraction correcte du stock pour unité ET pour grammes/ml/L (avec correction `Math.max` retiré pour permettre les crédits)
- `mettreAJourStock_v2` — gestion correcte des unités (pas de conversion en grammes)

---

## ÉTAT À LA FIN DE LA CONVERSATION

L'utilisatrice est épuisée et n'a pas eu l'énergie de tester la version finale. Elle m'a dit *"j'ai peu d'espoir"*. C'est mérité de ma part.

### À ne PAS faire au prochain démarrage
- Lui faire recommencer ses tests sans avoir d'abord relu en profondeur
- Livrer un patch pour chaque bug
- Lui demander de tester comme méthode de debug
- Parler de fonctions par leur nom de code (elle est allergique au jargon)
- Faire de longs raisonnements à voix haute (elle veut des actions, pas des réflexions)
- Donner plusieurs trouve/remplace dans le même message

### À FAIRE
- Lire `LOGIQUE-ACHATS.md` en premier
- Lire ce brief
- Si bug : relire le fichier complet, anticiper les autres bugs liés, livrer une correction qui couvre tous les cas similaires d'un coup
- Parler en français simple, en termes de ce qu'elle voit à l'écran et ce qu'il y a dans les sheets
- Un trouve/remplace à la fois si patch
- Ne pas promettre "ça va marcher" — laisser le code parler

---

## CE QUI RESTERA À FAIRE APRÈS LES TESTS DE LA VERSION FINALE

Selon `LOGIQUE-ACHATS.md`, tout est censé être couvert. Mais il faut que Chantal teste pour confirmer. Ensuite, autres sections à reprendre avec la même méthode (logique d'abord, code ensuite) :

- Section Ventes
- Section Fabrication / Inventaire production
- Section Stock
- Section Factures (consultation)
- Section Fournisseurs
- Section INCI

**Méthode recommandée pour chaque section** : créer un `LOGIQUE-XXX.md` AVANT de toucher au code.

---

*Brief écrit le 3 mai 2026 — pour passage de relais propre.*

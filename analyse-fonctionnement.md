# ANALYSE DU FONCTIONNEMENT — Univers Caresse
### Les « si » sans réponse, la lenteur, la convivialité
*(Tout vient de la lecture des vrais fichiers. Gravité : 🔴 risqué pour les données, 🟠 trompeur ou frustrant, 🟡 irritant. ⚠️ = à confirmer en lisant le fichier complet.)*

--- 

## 1. LES « SI » SANS RÉPONSE (par ordre de gravité)

### 1.1 🔴 Une vente peut se finaliser avec des lignes manquantes
Quand tu enregistres une vente, chaque produit est envoyé au serveur **un par un**, et le code **ne vérifie pas si chaque envoi a réussi**. Si un seul envoi échoue (petit accroc réseau), la vente se finalise quand même — facture incomplète, stock faux, et **aucun message ne te le dit**. C'est le genre de bug fantôme qui mine la confiance dans les chiffres.
*Où : l'enregistrement d'une vente dans `admin-ventes.js`.*

### 1.2 🟠 Une panne réseau s'affiche comme « Aucune vente »
Si le serveur ne répond pas quand tu ouvres Ventes ou Remboursements, l'écran affiche « Aucune vente » — le même message que s'il n'y en avait vraiment aucune. Tu pourrais croire que tes ventes ont disparu. Le code mélange « erreur » et « vide ». ⚠️ Le même pli existe probablement dans d'autres sections.

### 1.3 🟠 Le texto part avant le courriel
Quand tu complètes une commande, le texto au client (« votre proposition vient de vous être envoyée par courriel ») s'ouvre **immédiatement**, avant que la sauvegarde, la sortie de stock et le courriel soient faits. Raison technique réelle (le texto doit partir du clic direct), mais le « si » n'a pas de réponse : **si le courriel échoue ensuite, le client a reçu un texto qui annonce un courriel qui n'existe pas.** Au moins, toi tu es avertie (voir 4.1).

### 1.4 🟠 Le catalogue public peut rester bloqué en erreur 30 minutes
Le site public garde le catalogue en mémoire 30 minutes pour aller vite. Mais il se marque « chargé » **avant** d'avoir vraiment reçu les données. Si le chargement échoue, le site croit que c'est fait et **ne réessaie pas pendant 30 minutes** — le client voit l'erreur jusqu'à ce qu'il recharge la page. Mauvais moment pour perdre un client.
*Où : `chargerCatalogue` dans `main.js`.*

### 1.5 🟠 Si un des 16 chargements du démarrage échoue, des sections affichent du vide sans avertir
À l'ouverture de l'admin, 16 demandes partent vers le serveur. Aucune vérification d'ensemble : si une seule échoue, la section concernée montre des listes vides ou des « — », sans message. Tu navigues dans un admin qui a l'air normal mais à qui il manque un morceau.

### 1.6 🟡 ⚠️ Le bouton d'envoi des coups de cœur pourrait rester gelé après une erreur
Côté client, quand l'envoi de la liste échoue, un message d'erreur s'affiche — bien. Mais il faut vérifier que le bouton redevient cliquable et que la petite roue disparaît. Sinon, le client est coincé devant un bouton mort. *(À confirmer dans `main-demande.js` complet.)*

### 1.7 ✅ Des « si » bien répondus — à souligner
- Stock sorti mais courriel pas parti → message clair qui te dit exactement quoi faire. Exemplaire.
- Annuler une commande avec un acompte → avertissement de rembourser avant. Bien pensé.
- Le serveur refuse de sortir le stock deux fois (verrou de statut) et de remettre le stock si une facture est liée. Solide.
- Le site public vérifie que `main-demande.js` existe avant de l'appeler. Propre.

---

## 2. LA LENTEUR — d'où elle vient

2.1 **Chaque aller-retour au serveur Google coûte 1 à 3 secondes.** C'est la nature d'Apps Script, pas un bug. La règle d'or : **moins d'allers-retours = plus vite.**

2.2 **Une vente de 5 produits = environ 8 allers-retours à la suite** (créer + 5 lignes une par une + finaliser + recharger). Ça peut faire 10-15 secondes d'attente. Remède connu : envoyer toutes les lignes **en un seul voyage** — c'est déjà fait pour les achats (`addAchatLignes`), pas pour les ventes.

2.3 **Le démarrage de l'admin charge TOUT d'un coup (16 demandes)**, même les données des sections que tu n'ouvriras peut-être pas. Partir vite et charger chaque section à l'ouverture (comme Produits le fait déjà avec son cache) serait plus doux.

2.4 **Certaines sections rechargent tout à chaque visite** (Ventes, Commandes) au lieu de garder en mémoire comme Produits ou le catalogue public. Incohérent : des sections rapides, d'autres lentes, sans raison visible pour toi.

---

## 3. LA CONVIVIALITÉ

3.1 **Erreur et vide confondus** (le point 1.2) — le plus trompeur pour toi au quotidien.

3.2 **Des messages d'erreur qui n'aident pas** : « Erreur lors de la sauvegarde » sans dire quoi faire ensuite. À comparer avec le bon exemple du courriel raté (1.7) qui dit la prochaine étape. Le standard à viser partout : *ce qui s'est passé + ce qui est sauvé + quoi faire.*

3.3 **Les bons coups** : confirmation avant toute action destructrice, roue de chargement pendant les attentes, texto pré-écrit, pastilles de stock 3 couleurs sur les commandes, bloc « AUTRES » qui attrape les statuts imprévus au lieu de les perdre. La base de la convivialité est là.

---

## 4. PRIORITÉS PROPOSÉES (Chantal décide de l'ordre et du rythme)

4.1 **Boucher le 1.1** (vente aux lignes manquantes) — le seul qui peut fausser tes données en silence.
4.2 **Séparer erreur et vide** (1.2) — petit changement, gros gain de confiance.
4.3 **Débloquer le catalogue public** (1.4) — touche directement les clients.
4.4 **Accélérer l'enregistrement des ventes** (2.2) — le gain de vitesse le plus payant.
4.5 Le reste (démarrage, messages, caches) en douceur, après.

*Reste à analyser quand tu fourniras le `Code.gs` : les mêmes lunettes côté serveur (les « si » du stock, des numéros de facture, des courriels).*

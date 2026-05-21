# Système de demande de commande — Notes de discussion

## Contexte et philosophie

Univers Caresse est une savonnerie artisanale avec peu d'inventaire. Le site ne doit **pas** être transactionnel. L'objectif est de garder le contact humain avec le client : discuter des délais, des coûts, de la disponibilité avant tout engagement.

Le formulaire de contact actuel existe mais reste générique. Rien n'invite clairement le client à manifester son intérêt pour un ou plusieurs produits, ni ne lui explique comment procéder.

## Vocabulaire et ton

- Pas de « panier » — trop transactionnel, mauvaise icône, mauvaise connotation
- Pas de possessifs (mon, ma, mes) — Chantal n'aime pas
- Formulation retenue dans la fiche produit : **« Cochez si ce produit vous intéresse »**
- L'ensemble doit avoir un ton doux, invitant, qui amorce une conversation plutôt qu'une transaction

## Fonctionnement général

### Sur la fiche produit
- Bouton ou case « Cochez si ce produit vous intéresse »
- Placé dans l'espace coloré vide en bas à gauche de la fiche, sous le prix
- Pas de bouton sur les cartes du catalogue — le client doit ouvrir la fiche pour lire avant de cocher (plus réfléchi, cohérent avec l'esprit artisanal)

### Indicateur visuel sur les cartes
- Le point de couleur existant dans le coin de la carte **devient l'indicateur**
- Quand le produit est coché, son apparence change (à décider : entouré, plus gros, anneau, plume à l'intérieur, coche, etc.)
- Décision visuelle laissée en réflexion

### Accès à la liste
- Une **bulle compteur en haut** de l'écran
- Discrète quand vide, affiche un petit chiffre dès qu'il y a au moins une sélection
- Position exacte à valider selon les supports (ordi, iPad, iPhone)

### Contenu de la liste
Quand le client clique sur la bulle, il voit :
- Chaque produit avec photo, nom, collection, format, prix
- Quantité ajustable (− 2 +)
- Sous-total approximatif qui se recalcule
- Bouton pour retirer un produit de la liste

### Texte explicatif
Affiché dans la liste avant l'envoi. Exemple :
> Ceci n'est pas une commande ferme. En envoyant votre liste, nous vous confirmerons les délais, la disponibilité et le coût final avant tout engagement.

### Coordonnées du client
- Nom
- Courriel
- Téléphone
- Message libre (optionnel)

### Bouton d'envoi
À la fin de la liste.

## Système de courriels

À l'envoi de la demande :

- **Chantal reçoit** un courriel avec la liste complète et les coordonnées du client
- **Le client reçoit** un courriel automatique de confirmation avec sa liste récapitulée et un message du genre :
  > Merci, nous avons bien reçu votre demande. Nous vous reviendrons sous 2-3 jours ouvrables avec les détails.

Le système d'envoi de courriel est déjà en place dans le site (formulaire de contact existant) — il reste à adapter pour gérer ces deux courriels.

## Lien avec le système de commandes existant

L'admin a déjà un module de commandes complet (`admin-commandes.js`) avec statuts (En attente, Prête, Livrée, Annulée), gestion du client, items, acompte, solde, notes.

**Plutôt que de gérer les demandes uniquement par courriel, la demande du client crée automatiquement une commande dans l'admin avec le statut « En attente ».**

Avantages :
- Pas de retranscription manuelle
- Aucun risque d'erreur sur les quantités, produits ou coordonnées
- Historique complet de toutes les demandes, même celles qui ne se concrétisent pas
- Possibilité d'analyser les tendances et de retrouver un client qui revient
- Tout reste centralisé dans le système

Workflow :
1. Client envoie sa demande depuis le site
2. Une commande est créée automatiquement dans l'admin (statut « En attente »)
3. Chantal reçoit le courriel d'avis
4. Chantal contacte le client par courriel pour valider les détails
5. Chantal met à jour la commande au besoin (quantités, prix, notes)
6. Le statut évolue selon l'avancement

## Paiement à distance via Square

Une fois la demande validée avec le client, Chantal pourra lui envoyer un lien de paiement Square par courriel directement depuis l'admin.

**Confirmé pour le Canada (2026) :**
- Square offre des **liens de paiement** réutilisables, sans frais mensuels
- Frais de transaction : 2,9 % + 0,30 $ par paiement en ligne
- Le lien peut être envoyé par courriel
- Square offre aussi des **factures Square** pour envoyer une vraie facture par courriel
- L'option **Terminal virtuel** (saisie manuelle par téléphone) **n'est pas retenue**

L'intégration Square est déjà présente dans l'admin (utilisée pour les ventes en personne). À voir comment relier la génération du lien à partir d'une commande.

## Avis aux clients — courriels indésirables

Le courriel automatique de confirmation envoyé au client risque de se retrouver dans les pourriels (spam, indésirables).

**À inclure dans le message :**
> Si vous ne voyez pas notre réponse dans les prochains jours, pensez à vérifier votre dossier de courriels indésirables (pourriels/spam).

Cette mention doit apparaître :
- Dans le courriel automatique de confirmation
- Idéalement aussi dans la page de confirmation à l'écran après envoi

## Points à régler plus tard

- Choix visuel précis de l'indicateur sur la carte (plume, coche, anneau, etc.)
- Position exacte de la bulle compteur sur les différents supports
- Mise en page de la fiche produit pour intégrer le bouton de sélection
- Formulation finale du texte explicatif et du courriel de confirmation
- Comment générer le lien Square depuis une commande dans l'admin

## Travail à prévoir

### Site public
- Ajouter le bouton « Cochez si ce produit vous intéresse » dans la fiche produit
- Modifier le point de couleur sur les cartes pour qu'il devienne un indicateur
- Ajouter la bulle compteur dans la barre de navigation
- Créer la page ou le panneau de la liste (avec quantités, sous-total, retrait)
- Ajouter le formulaire de coordonnées et le bouton d'envoi
- Gérer la persistance de la liste (la sélection ne doit pas disparaître si le client navigue entre les pages)
- Ajouter une mention claire sur la vérification des courriels indésirables

### Backend
- Adapter le système d'envoi de courriels pour gérer les deux messages (Chantal + client)
- Préparer les modèles de courriels (HTML et texte) avec mention des pourriels
- **Créer automatiquement une commande dans l'admin à la réception de la demande** (statut « En attente »)

### Admin
- Adapter le module commandes existant pour recevoir et afficher les commandes générées par le site
- Possibilité d'envoyer un lien de paiement Square au client depuis la commande

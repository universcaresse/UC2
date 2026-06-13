# Bloc 2 — Il manque du stock
### Scénario coups de cœur — en cours
*(Document vivant : on ajoute les décisions au fur et à mesure.)*

---

## Point de départ (commun à tous les blocs)
- Le client coche ses coups de cœur, envoie sa liste avec ses coordonnées
- Je reçois une commande « En attente » — aucun stock touché

---

## SCÉNARIO 2 — Il manque des morceaux

**1 — La commande arrive**
- 1.1 Statut : « En attente », **point orange** = au moins un produit manque, mais au moins un autre a du stock — aucun stock touché, rien d'envoyé au client
- 1.2 Dans le détail de la commande, chaque ligne a sa propre couleur : vert (assez) / orange (pas assez) / rouge (zéro)

**2 — Je clique « Proposition »**
- 2.1 L'écran de complétion s'ouvre — même écran qu'au bloc 1 (récapitulatif, coordonnées, livraison, promo, lien Square, note)
- 2.2 Je vois les lignes avec leur couleur (vert / orange / rouge) — je sais ce qui manque
- 2.3 ⚠️ **À construire** : pour chaque produit manquant, je le marque :
  - **Lot en cure** → temporaire, date dispo vient du lot — affichée automatiquement
  - **Pas encore fabriqué** → temporaire, date = date de la proposition + cure du produit + 7 jours — calculée automatiquement
  - **Quantité partielle** → traité comme « pas encore fabriqué » — temporaire, même calcul automatique
  - **Définitif** → je coche définitif — info seulement pour le client, aucun choix offert

**3 — Le client reçoit le courriel**
- 3.1 Le courriel est humain, doux, sans jargon — il nomme les produits, explique ce qui est prêt, ce qui s'en vient et pourquoi, ce qui ne sera pas disponible
- 3.2 Il contient un seul lien vers la page unique — le courriel n'est que la porte d'entrée

**4 — La page unique**
- 4.1 En haut : info
  - Les produits prêts avec leurs prix
  - Les temporaires avec leur date de disponibilité
  - Les définitifs — info seulement, aucun choix
- 4.2 Le client répond pour chaque temporaire : **garder** ou **laisser tomber**
- 4.3 Le bouton Payer s'active seulement quand chaque temporaire a sa réponse
- 4.4 Le total et le lien Square couvrent **seulement les produits prêts**
- 4.5 Choix final :
  - **Envoyer le prêt maintenant** → il paie seulement le prêt → commande « À expédier »; les gardés → 2e commande au statut « à refaire », reproposée le temps venu; les définitifs retirés
  - **Attendre** → rien ne part; la commande attend que tout le refaisable soit prêt; les définitifs retirés et le client en est informé; Chantal repropose la commande complète plus tard

**5 — Après le paiement (il choisit « Envoyer le prêt »)**
- 5.1 Le lien Square devient caduc
- 5.2 La partie prête → commande passe à « À expédier »
- 5.3 Les temporaires gardés → 2e commande créée automatiquement au statut « à refaire », avec la date de disponibilité visible pour le suivi
- 5.4 Les définitifs → retirés de la commande
- 5.5 Dans l'admin : les deux commandes sont liées et visibles — l'originale à expédier, la 2e en attente
- 5.6 Quand la date arrive, Chantal repropose la 2e commande — même flow que le bloc 1, avec son contrôle habituel sur la livraison (absorber, offrir ou charger)

**6 — Il choisit « Attendre »**
- 6.1 Rien ne part, le lien Square reste inactif
- 6.2 Les définitifs sont retirés — le client en est informé automatiquement
- 6.3 La commande reste au statut « à refaire » avec la date de disponibilité visible
- 6.4 Dans l'admin : la commande est visible avec sa date, pour que Chantal sache quand revenir
- 6.5 Quand tout est prêt, Chantal repropose la commande complète — même flow que le bloc 1

- Même page unique que le bloc 2
- Tout est manquant
- S'il ne reste rien à garder → statut « À annuler »
- Sinon la commande attend au statut « à refaire »

---

## CE QUI RESTE À CONSTRUIRE / TRANCHER

- Le détail du point 2 (l'écran de complétion côté admin pour marquer temporaire/définitif)
- Les drapeaux non tranchés (ETAT.md 4.7) : client silencieux · liste vidée · produit disparu · nom du statut « à refaire » · timing de la 2e commande

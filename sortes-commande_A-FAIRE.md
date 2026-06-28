# À FAIRE — Les 3 sortes de commande (proposition)
### Point de départ pour la session « proposition ». Monté le 28 juin 2026 à partir de l'ancien ETAT.md.

**Contexte :** la proposition envoyée au client doit gérer trois sortes de produits dans une même commande. Aucune des trois ne tient aujourd'hui — tout est à reprendre.

## 1. Les trois types (décision de fond, voir ETAT.md 2.3)
- Prêt → on montre le prix
- À venir → on montre une date (« disponible vers le… »)
- Pas disponible → info seulement, ni prix ni date

## 2. Sorte 1 — tout en stock
2.1 État : ne fonctionne pas de bout en bout. À reprendre.

## 3. Sorte 2 — il manque du stock (partiel) — cassée
3.1 « Recevoir ce qui est prêt » expédie sans faire payer.
3.2 Ferme le lien de paiement.
3.3 Crée une 2e commande inutilisable (quantité 1, prix 0 $).

## 4. Sorte 3 — rien de prêt — morte
4.1 La proposition ne part même pas : le code tente de sortir un stock qui n'existe pas, ça échoue, le client ne reçoit rien.

## 5. Faille de fond sous les sortes 2 et 3
5.1 Le système ne sait jamais tout seul quand le client a payé : Square envoie un courriel, c'est Chantal qui clique « Paiement reçu ». Les sortes 2 et 3 ont été bâties en supposant le contraire.

## 6. À NE PAS « corriger » (ce sont de fausses alertes — c'est correct)
6.1 Le stock sort la bonne version (prêts seulement).
6.2 La page client reçoit bien le type de chaque ligne.
6.3 La date de proposition est bien écrite.

## 7. Encore à trancher
7.1 Bouton « Payer » aux sortes 2 et 3 : met-on un vrai bouton « Payer » pour les produits prêts, pour que le client règle tout de suite ce qui est prêt (total = prêts seulement)?
7.2 Commande entièrement « pas disponible » : qu'est-ce que le client voit?

# À FAIRE — Plus tard
### Liste de souhaits. Montée le 28 juin 2026, **nettoyée le 22 juillet 2026** : ne restent que les souhaits encore vrais, chacun vérifié dans le code.

---

## 1. Découper `Code.gs` par sujet
Vérifié le 2026-07-22 : **9 020 lignes dans un seul fichier**. Tout y est — produits, commandes, ventes, remboursements, comptabilité, Poste Canada, Square.

**Souhait :** le séparer par sujet, comme les `js/admin-*.js`.

⚠️ Ce n'est pas urgent et ce n'est pas sans risque : Apps Script partage tout entre les fichiers, donc découper ne casse rien en soi, mais chaque déplacement doit être vérifié. À faire quand le reste est stable, jamais en même temps qu'autre chose.

---

## 2. Finir la migration CSS
En cours, **par Chantal elle-même**. La règle et le tableau des noms de variables sont dans `METHODE.md` (règle 1.5b). Tant que ce n'est pas fini, personne d'autre ne touche aux `css/*.css`.

---

## Retirés de cette liste le 2026-07-22 (vérifiés faits)
- ~~Retirer le drapeau `?test=1`~~ — aucune trace dans le code.
- ~~Paiement Square automatique~~ — c'est l'item 8, codé le 2026-07-20.
- ~~Jeter les vieux fichiers « Copie »~~ — il n'en reste aucun.
- ~~Pastille « nouvelles demandes » à l'accueil~~ — **faite**. `admin.js` compte les commandes « En attente » et « À expédier » et l'écrit dans `#accueil-commandes-entrantes` (« 3 entrantes · 2 à expédier »). Je l'avais ratée en ne regardant que `afficherStatsAccueil` : le compteur vit ailleurs, dans le chargement de l'admin.
- ~~La vente en un seul voyage~~ — **abandonné le 2026-07-22.** Le code fait bien plusieurs appels (créer, un par article, finaliser), mais **Chantal ne trouve pas ça long**. Refaire le chemin qui sort le stock et écrit la comptabilité pour régler une attente qu'elle ne ressent pas, c'est un mauvais échange. Ne pas le ressortir sans qu'elle le demande.
- ~~Tester une vraie commande / publier~~ — ce sont des tests et un déploiement, pas du travail à bâtir. Ils ne vivent plus à la racine.

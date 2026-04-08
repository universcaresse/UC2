# Notes – Côté public, iPad paysage
## Mise à jour — 7 avril 2026

## Performance
~~1. C'est lent~~ ✅ Chargement parallèle `Promise.all`

## Page d'accueil
~~2. Centrer "Découvrir les collections"~~ ✅ `justify-content: center` → `.bouton`
~~3. "Nos collections" devrait être en 2 lettrages~~ ✅ "Nos *collections*" avec `<em>`
4. Présenter les tuiles autrement — 5 sur une ligne et 4 sur une autre → **Reporté en fin de liste**

## Page Collections
~~5. Enlever la plume~~ ✅ Supprimée des 3 en-têtes
~~6. Prévoir toujours 2 lignes pour les titres des produits sur les cartes~~ ✅ `min-height: 2.52rem` sur `.carte-nom`
~~7. Prévoir une ligne entre les collections dans "Toutes les collections"~~ ✅ Trait vert 3px jusqu'à la photo

## Modal
~~8. Quand il n'y a pas de photo, les prix et texte sont blanc sur blanc~~ ✅ Hex prend toute la hauteur + couleur texte adaptée

## Filtres
9. ~~Le filtre "tannés" doit être à gauche avec un espace sous les filtres~~ ✅ Titre aligné gauche + padding-bottom corrigé
~~10. Les filtres ne filtrent pas~~ ✅ Bug `filtrerGamme` corrigé

## Produits
~~11. Prix et poids en ordre numérique du plus petit au plus grand~~ ✅ Tri par poids — cartes + modal + admin
12. Quand il y a une famille, l'utiliser pour regrouper les gammes ✅ Livré — nécessite redéploiement `code_v2.gs`

## Textes
13. Trouver tous les " — " et changer pour " , " si applicable → **À corriger dans Sheet `Contenu_v2` directement**
~~14. Placer de vrais liens sur les textes de la page EDU~~ ✅ Liens EDU page 3 → COL-001, COL-002, COL-005 — style `.edu-lien` sans soulignement — **Liens pages 4-7 à compléter**

## Pages suivantes (à partir de la page 4)
15. Plus d'en-tête → **Contenu manquant dans Sheet `Contenu_v2` — à remplir**
16. Plus de texte → **Contenu manquant dans Sheet `Contenu_v2` — à remplir**

## Page Contact
~~17. Courriel~~ ✅ `universcaresse@outlook.com` corrigé

---

## Reporté — Présentation catalogue
4. Repenser la présentation du catalogue — trop de cartes en même temps, ressemble à une liste d'épicerie. Réfléchir à afficher les collections d'abord, produits au clic.

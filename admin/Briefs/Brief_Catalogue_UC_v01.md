# BRIEF CATALOGUE — UNIVERS CARESSE
## v01 — 14 avril 2026

---

## ⚠️ INSTRUCTION OBLIGATOIRE — DÉBUT DE SESSION
Fournir le brief principal **`Brief_Travailleur_ACTIF_vXX.md`** avant de continuer.
Ce brief catalogue est un complément — il ne remplace pas le brief principal.
Lire les deux briefs AU COMPLET avant de proposer quoi que ce soit.

---

## CONTEXTE
Booklet catalogue imprimé généré dynamiquement depuis l'admin V2.
Données source : Google Sheets V2 via API Apps Script.

---

## TECHNIQUE — BOOKLET
- Agrafé au centre — feuilles 11×17 pliées
- Toujours multiples de 4 pages
- Pages en paires à l'ouverture
- Page gauche (paire) = reliure à droite → marge 0 à droite
- Page droite (impaire) = reliure à gauche → marge 0 à gauche
- `pageNo % 2 === 0` → `.page-g` / impair → `.page-d`
- `cat-pied` toujours hors du `page-int` — colle au bas de la page physique
- Ce qu'on voit à l'écran = ce qui sort à l'impression
- Généré en HTML → impression navigateur (`@media print`) depuis l'admin

## CSS
- `catalogue.css` est un complément de `style.css` — hérite de toutes les variables CSS du root
- On ne recrée pas ce qui existe dans `style.css`
- Pages 1-2-3 ont déjà leur CSS dans `catalogue.css` — on ne touche pas

---

## STRUCTURE DES PAGES
- **Pages 1-2-3** — figées, ne se touchent pas
- **Page 3** — table des matières **dynamique** avec numéros de page réels, générée après toutes les pages collections
- **Pages 4+** — collections, on part d'ici
- **2 dernières pages** — contenu légal et commercial — structure fixe, données de `Contenu_v2`
- Pagination : numéro de page seulement dans le `cat-pied` — discret

---

## DONNÉES ET CONTENU
- Tous les produits au statut **`public`** apparaissent — tous auront photo, hex, texte, poids, prix
- Chaque élément aura obligatoirement : nom, photo, hex, texte
- Collections : **slogan + description longue** (les deux)
- Produits : **`desc_emballage`** (la courte phrase poétique) — pas la `description`
- Prix et poids affichés pour chaque produit (discrets) — tous les produits en auront
- **Version Noël** : bouton dans l'admin au moment de générer — si activé, `photo_noel_url` remplace `photo_url`
- Photos d'ambiance : Médiathèque — catégorie dédiée à créer

---

## RYTHME ET COMPOSITION
- Le catalogue est **adaptatif** — s'adapte si des produits s'ajoutent ou se retirent
- Ouverture de collection : photo + nom + slogan + description — **pas pleine page** — les premiers produits cohabitent sur la même page
- Gammes : titre + description, servent à dynamiser
- Produits d'une même gamme ne se mélangent jamais avec ceux d'une autre gamme
- **Deux collections légères peuvent cohabiter sur une même page**
- **Jamais un titre de collection orphelin en bas de page**
- L'espace n'est pas proportionnel au nombre de produits
- Zones tampons (photos d'atelier, citations) s'intercalent **naturellement dans le flux** — pas à la fin d'une collection — doivent avoir l'air voulues

---

## DONNÉES PAR COLLECTION (produits publics)
- SAPONICA — Savon × 16
- PETIT NUAGE — Savon × 5
- CAPRIN — Savon au lait de chèvre × 6
- ÉMOLIA — Baume ×2 · Baume à lèvres ×9 · Bombes de bain ×7 · Savon exfoliant ×1 → 19 produits
- ÉPURE — Savon à main × 4
- KÉRYS — Hydraboucle ×2 · Purélia ×2 · Équilibra ×2 → 6 produits
- CASA — Cake vaisselle ×1 · Bruine d'ambiance ×5 · Eau de linge ×4 · Bougie ×6 → 16 produits
- LUI — Huile à barbe ×1 · Savon à raser ×2 · Savage Savonnerie ×3 → 6 produits
- ANIMA — Savon × 1
- **TOTAL : 80 produits publics**

---

## VISUEL — GRAMMAIRE
- Ton : **magazine chic** — respiration, élégance, typographie soignée
- Polices : Playfair Display + DM Sans — héritées de `style.css`
- Lisibilité prioritaire — rien en dessous du lisible à l'impression
- Le ton visuel de chaque collection est dicté par son hex
- Nom du produit : en vedette
- Description : `desc_emballage` — courte, poétique
- Photo + hex : aussi importants l'un que l'autre — le **hex est un bloc de couleur**, pas un accent
- Le texte peut vivre dans le hex
- Photo et hex jouent ensemble librement — proportions, positions, relations varient
- C'est une **grammaire visuelle**, pas des templates fixes
- L'algorithme joue le rôle du graphiste — composition, respiration, variation
- Prix et poids : discrets

---

*Univers Caresse — Confidentiel — Brief Catalogue v01 — 14 avril 2026*

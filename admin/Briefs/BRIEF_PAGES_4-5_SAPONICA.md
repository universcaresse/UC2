# BRIEF — PAGES 4-5 SAPONICA

## GÉNÉRAL
- Tout le contenu vient de l'API — rien de codé en dur dans HTML, CSS ou JS
- Seules exceptions acceptables : classes CSS, `var(--primary)`, pattern `style="--var:valeur"`
- Fichiers concernés : `catalogue.html`, `catalogue.css`, `catalogue.js`

---

## PAGE 4 — `page-g` (bande blanche à gauche, reliure à droite)

### Structure de haut en bas
1. **Photo collection** — `col.photo_url` — petit format, en haut à gauche
2. **Texte collection** — en dessous de la photo, pas à côté
   - Nom : `col.nom` — Playfair Display
   - Slogan : `col.slogan` — Birthstone, couleur `var(--accent)`
   - Description : `col.description` — DM Sans, font-weight 300
3. **Citation** — bloc avec marges des deux côtés, fond `var(--primary)` — couleur FIXE
   - Texte : `contenu.citation_texte` — Playfair Display italic, blanc
   - Auteur : `contenu.citation_auteur` — DM Sans small caps, blanc 65%
4. **1 produit** — aligné horizontalement avec la rangée 1 de la page 5

---

## PAGE 5 — `page-d` (bande blanche à droite, reliure à gauche)

### Gamme en haut
- Cube hex : `gam.couleur_hex` — carré visible, pas petit
- Nom gamme : `gam.nom` — Playfair Display
- Trait : couleur `gam.couleur_hex`
- Description : `gam.desc` — DM Sans, font-weight 300

### Produits
- **Rangée 1** : 2 produits — alignés avec le produit de la page 4
- **Rangée 2** : 3 produits

---

## RÈGLES PRODUIT (toutes pages)

### Photo
- Carrée stricte — `aspect-ratio: 1/1`, `object-fit: cover`
- Toutes la même taille — jamais de variation de taille entre produits

### Bloc hex
- Jamais sur la photo — toujours en haut OU en bas de la photo
- Hauteur minimum : 50% de la hauteur de la photo
- Position varie selon le produit (haut ou bas) pour éviter la rigidité
- Contient dans l'ordre :
  - Nom du produit : `p.nom` — Playfair Display
  - Description emballage : `p.desc_emballage` — DM Sans italic
  - Poids + prix : `formaterPrixPoids(p.formats)` — DM Sans

### Couleur du texte dans le hex
- Hex clair (luminosité > 160) → `var(--gris-fonce)`
- Hex foncé → `var(--blanc)`
- Calculé avec `estHexClair(hex)` dans le JS

---

## PIED DE PAGE
- Ligne `var(--beige)` — largeur 30%
- Numéro de page
- Page gauche : ligne puis numéro (gauche → droite)
- Page droite : ligne puis numéro (gauche → droite)

---

## BANDE BLANCHE
- Page gauche : `margin: 36px 0 36px 36px` sur `.page-int`
- Page droite : `margin: 36px 36px 36px 0` sur `.page-int`
- Pied de page respecte aussi la bande blanche

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : session 18 (2026-04-16)*

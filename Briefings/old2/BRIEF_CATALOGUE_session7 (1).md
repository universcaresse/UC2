# BRIEF CATALOGUE PDF — UNIVERS CARESSE
**Session dédiée — À lire en entier avant de commencer**

---

## CONTEXTE

Page HTML dédiée dans l'admin (`/admin/catalogue.html`) qui génère un booklet imprimable.
Toutes les données viennent du site via `getCataloguePublic()` — rien de codé en dur.

---

## FORMAT

- **Booklet agrafé au centre** — feuilles 8.5×11, pliées et agrafées
- **`@media print`** → 8.5×11, marges normales (pas à fond perdu — impression centre de copie standard)
- **`window.print()`** déclenché par un bouton dans l'admin
- Pagination automatique selon le nombre de collections et produits

---

## DONNÉES — SOURCE UNIQUE

Tout vient de `getCataloguePublic()` qui retourne déjà :
- Collections : nom, slogan, description, couleur_hex, photo_url
- Produits par collection : nom, description, couleur, ligne, format, prix, image_url

**Appel API :** `appelAPI` (GET) avec `&t=${Date.now()}` pour cache-busting
**Ne jamais coder de données en dur** — tout est dynamique

---

## STRUCTURE DES PAGES

| Page | Contenu |
|------|---------|
| 1 | Couverture — identité Univers Caresse |
| 2 | Mot de Chantal — photo ambiance + texte |
| 3+ | Collections — une par page ou regroupées selon nb produits |
| Avant-dernière | Philosophie / valeurs |
| Dernière | Dos — coordonnées |

### Règle d'affichage par collection
- **16+ produits** → grille 4×4 compacte, page dédiée
- **6-15 produits** → grille 3×3, page dédiée
- **3-5 produits** → grille 3 colonnes, partage possible avec une autre petite collection
- **1-2 produits** → regroupées ensemble sur une page (max 3 petites collections par page)

---

## DESIGN — RÈGLES ABSOLUES

**Fontes sacrées :** Playfair Display · Birthstone · DM Sans — jamais autre chose
**Palette :** variables CSS du site (`--primary`, `--accent`, `--beige`, etc.)
**Zéro style inline** dans le HTML ou le JS
**Zéro valeur hardcodée** si une variable CSS existe

### Personnalité visuelle
Chaque collection a son ambiance propre basée sur `couleur_hex` — **pas de traitement uniforme mécanique.**
- Hero avec photo ambiance (`photo_url`) + overlay dégradé vers le bas
- Fond de page teinté subtilement avec la couleur de collection
- Couleur de collection utilisée pour les accents, traits, prix

### Aperçu de référence
`catalogue-booklet-v2.html` — produit en session 6, structure et ambiances validées.
C'est la référence visuelle. Ne pas recommencer de zéro.

---

## ARCHITECTURE FICHIERS

```
/admin/
  catalogue.html     ← nouvelle page dédiée
  catalogue.js       ← logique génération + appel API (ou intégrer dans admin.js)
```

Bouton d'accès depuis la page d'accueil admin (tuile ou lien dans nav).

---

## DÉCISIONS EN ATTENTE — À RÉGLER AU DÉBUT DE LA SESSION

- [ ] **Page Chantal** — photo disponible ou on utilise photo ambiance SAPONICA ?
- [ ] **Ordre des collections** — par rang du Sheet (1,2,3...) ou ordre éditorial manuel ?
- [ ] **KÉRYS** — inclure même si 1 seul produit de test, ou exclure pour l'instant ?
- [ ] **Prix** — affichés dans le catalogue ou version sans prix ?

---

## CE QUI EST DÉJÀ FAIT

- Structure visuelle définie et validée (session 6)
- Ambiance de chaque collection décidée
- Format booklet choisi
- `getCataloguePublic()` retourne déjà toutes les données nécessaires

---

## CE QUI RESTE À FAIRE

1. Créer `catalogue.html` dans `/admin/`
2. Appel `getCataloguePublic()` au chargement
3. Génération dynamique des pages selon les données
4. Bouton Imprimer + `@media print`
5. Lien d'accès depuis l'admin

---

*Univers Caresse — Chantal Mondor — Confidentiel*
*Créé : 8 mars 2026 (session 6)*

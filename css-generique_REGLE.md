# RÈGLE CSS — Adoption de generique.css
### Référence à respecter à chaque changement. Montée le 28 juin 2026.

Le site charge deux feuilles de style, dans cet ordre (index.html) :
1. `style.css` — l'ancienne. La dernière chargée gagne, donc generique.css passe par-dessus.
2. `generique.css` — la nouvelle. « Vocabulaire commun, construit au fur et à mesure. »

---

## 1. La règle (4 points)

1.1 **generique.css = la nouvelle maison** de tout ce qui est partagé : couleurs, mesures, boutons, fenêtres, filtres, menu… `style.css` = l'ancien, on ne le fait plus grossir.

1.2 **Avant chaque changement**, chercher d'abord dans generique.css une couleur, une mesure ou une classe déjà là, et la réutiliser.

1.3 **Si un style partagé manque, l'ajouter dans generique.css** (jamais dans style.css), avec SES variables à lui (voir tableau), pas celles de style.css.

1.4 **On touche à style.css seulement pour retirer un doublon** déjà repris dans generique.css. But : style.css rapetisse, generique.css grandit.

---

## 2. Les deux feuilles n'ont pas les mêmes noms de variables

⚠️ Piège principal : ne pas mélanger les deux jeux de noms. Dans generique.css, on écrit avec la colonne de droite.

| Sert à | style.css (ancien) | generique.css (à utiliser) |
|---|---|---|
| Vert principal | `--primary` | `--primaire` |
| Jaune / accent | `--accent` | `--secondaire` |
| Rouge | `--danger` | `--rouge` |
| Blanc | `--blanc` | `--blancpur` |
| Beige | `--beige` | `--sable` |
| Gris | `--gris` | `--grise` |
| Gris foncé | `--gris-fonce` | `--grise-foncee` |

Même couleur, deux noms. Exemple : le vert `#5a8a3a` s'appelle `--primary` dans style.css et `--primaire` dans generique.css.

### Mesures
- generique.css a ses propres mesures : `--espace-4` à `--espace-48`, `--taille-72/48/220`, `--bordure-05/1/2`, `--rayon-1`.
- style.css a plutôt : `--padding-page` (80px), `--padding-mobile` (20px), `--nav-h` (72px).
- Dans generique.css, utiliser les `--espace-…` et `--taille-…`.

---

## 3. En résumé
Tout ce qui est neuf et partagé va dans generique.css, avec ses variables à lui. style.css ne fait que rétrécir.

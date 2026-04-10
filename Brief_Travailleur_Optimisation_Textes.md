# BRIEF — CLAUDE TRAVAILLEUR
## Chantier : Optimisation du chargement des textes depuis Google Sheets
*Rédigé par Claude Chercheur — 19 mars 2026*

---

## PROBLÈME ACTUEL
Chaque changement de page déclenche un appel Apps Script vers Google Sheets.
Résultat : délai visible de 1-3 secondes avant l'injection des textes.

---

## SOLUTION PROPOSÉE
**Charger tous les textes en une seule fois au démarrage**, les stocker en mémoire (objet JS), puis les injecter instantanément à chaque changement de page avec un **fade in**.

---

## ARCHITECTURE

### Étape 1 — Au chargement initial du site
- Un seul appel Apps Script qui retourne **tous les textes de toutes les pages** en une seule réponse JSON
- Stocker le résultat dans une variable globale JS (ex: `window.siteTextes`)

### Étape 2 — À chaque changement de page
- Lire les textes depuis `window.siteTextes` (déjà en mémoire)
- Injecter les textes dans le DOM
- Appliquer un **fade in CSS** pour un rendu élégant
- Zéro appel réseau — instantané

---

## COMPORTEMENT ATTENDU
| Situation | Avant | Après |
|-----------|-------|-------|
| Première page | Délai léger (acceptable) | Délai léger (inchangé) |
| Navigation entre pages | Délai 1-3 sec visible | Instantané + fade in |

---

## POINTS D'ATTENTION
- Apps Script doit retourner **tous les textes en un seul appel** (pas un appel par page)
- Le fade in doit être CSS pur (pas de style inline dans le JS)
- Si l'appel initial échoue, prévoir un fallback gracieux (textes par défaut ou retry)
- Vérifier que la variable globale `window.siteTextes` ne crée pas de conflit avec le code existant

---

## PROCHAINE ÉTAPE
1. Modifier la fonction Apps Script pour retourner tous les textes en une seule réponse
2. Modifier le JS du site pour stocker en mémoire au chargement
3. Modifier l'injection des textes pour lire depuis la mémoire + fade in

---

*Univers Caresse — Confidentiel — Mars 2026*

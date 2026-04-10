# BRIEF — CLAUDE TRAVAILLEUR
## Chantier : Calcul de tarifs Postes Canada dans Google Sheets
*Rédigé par Claude Chercheur — 19 mars 2026*

---

## OBJECTIF
Lors de la saisie d'une commande client dans Google Sheets, calculer automatiquement le coût d'expédition estimé via l'API de Postes Canada.

---

## CONTEXTE
- Expédition depuis : **J0K 1E0**
- Transporteur : **Postes Canada uniquement**
- Poids typique : **~1 kg** (petits colis — savons, crèmes)
- Destination : **Québec**
- Outil : **Apps Script** dans Google Sheets existant

---

## API POSTES CANADA
- API officielle disponible : **Rating API** (calcul de tarifs en temps réel)
- Documentation : https://www.canadapost-postescanada.ca/information/app/drc/home
- Authentification : clé API (compte développeur requis)
- Format : XML (requête et réponse)

---

## PRÉREQUIS
Jean-Claude doit d'abord :
1. Créer un compte sur canadapost-postescanada.ca
2. S'inscrire au programme développeur
3. Obtenir son **numéro de client** et sa **clé API**
4. Fournir ces informations à Claude Travailleur

---

## FONCTIONNALITÉ SOUHAITÉE
Dans la fiche commande client du Sheet :
- Saisir le **code postal de destination** du client
- Saisir le **poids du colis**
- Voir apparaître automatiquement le **tarif estimé** Postes Canada

---

## SERVICES POSTES CANADA PERTINENTS
| Service | Description |
|---------|-------------|
| Colis standard | Économique, délai plus long |
| Colis accélérés | Équilibre prix/délai |
| Xpresspost | Rapide, plus cher |

---

## POINTS D'ATTENTION
- L'API Postes Canada utilise du XML — Apps Script doit parser la réponse XML
- Le numéro de client Postes Canada est requis dans chaque requête
- Prévoir un mode "sans compte" avec tarifs fixes en fallback si l'API échoue

---

## PROCHAINE ÉTAPE
1. Jean-Claude crée son compte Postes Canada et obtient sa clé API
2. Claude Travailleur code la fonction `getTarifPostesCanada(codePostal, poids)` dans Apps Script
3. Intégration dans la fiche commande du Sheet

---

*Univers Caresse — Confidentiel — Mars 2026*

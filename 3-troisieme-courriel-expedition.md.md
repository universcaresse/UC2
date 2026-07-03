# Troisième courriel (l'expédition) — Scénarios client

> **But de ce document.** Garder la vue complète des cas possibles à partir du
> **3ᵉ courriel** (« Votre commande est en route! »). Même approche que les
> documents du 1ᵉʳ et du 2ᵉ courriel : si la conversation se perd, ce fichier
> seul suffit à reprendre exactement où on était — et à coder sans reposer de
> questions.
>
> **État d'avancement :** Arbre **COMPLET — 6 branches validées** ✅
> (3 juillet 2026). **3 corrections à coder** (section 8), dont le bogue de la
> facture jointe, diagnostiqué avec précision (section 8.1). RIEN n'est codé.

---

## 0. CONTEXTE (à lire en premier si tu arrives à froid)

### Ce qu'est le 3ᵉ courriel
- Sujet : **« Votre commande [numéro] est en route »**.
- Envoyé automatiquement par `expedierCommande` (dans `Code.gs`) quand
  Chantal expédie. Deux chemins y mènent, tous deux dans
  `js/admin-commandes.js` :
  1. **`marquerExpediee(cmd_id)`** — chemin actuel : un `prompt()` demande le
     numéro de traçage Postes Canada (tapé à la main), ouvre Messages avec le
     texto pré-rempli si un téléphone existe, puis appelle `expedierCommande`.
  2. **`genererEtiquette(cmd_id)`** — chemin avec l'étiquette Poste Canada :
     le numéro de suivi est capté tout seul (`res.no_tracage`), texto
     pré-rempli, puis appelle `expedierCommande`. (Voir
     `etiquette-poste-canada_A-FAIRE.md`.)
- Contenu du courriel (bâti dans `expedierCommande`, gabarit vert Univers
  Caresse) :
  - « Bonjour [prénom], Bonne nouvelle — votre commande [numéro] est en
    route! »
  - **UN SEUL bouton : « Suivre mon colis »** → lien Postes Canada en
    français :
    `https://www.canadapost-postescanada.ca/track-reperage/fr#/details/[no]`
  - Le numéro de suivi affiché en petit sous le bouton.
  - **Facture PDF censée être jointe** (`Facture-[numéro].pdf`) — NE
    FONCTIONNE PAS, voir le bogue en 8.1.
- Côté sheet, `expedierCommande` fait : `no_tracage` écrit dans sa colonne,
  statut → **« Terminée »** (colonne 9), puis envoie le courriel.
- Un **texto** part aussi (pas automatique : Messages s'ouvre pré-rempli,
  Chantal appuie sur envoyer) avec le même lien de suivi.

### Ce qui vient des autres documents (déjà décidé, s'applique ici)
- **Règle transversale :** partout où un client peut être coincé → bouton
  **« Écrivez-nous »** = formulaire Contact pré-rempli (« Bonjour, je vous
  écris au sujet de ma commande X »). Mécanisme existant dans
  `js/main-demande.js`, à réutiliser tel quel.
- **Statut « Terminée » (6.3 du 2ᵉ courriel) :** tout clic sur un bouton de
  N'IMPORTE QUEL vieux courriel (1ᵉʳ ou 2ᵉ) affiche : « **Votre commande est
  en route!** » + **numéro de suivi cliquable** (même lien Postes Canada) +
  « Écrivez-nous ». Le numéro se lit dans la colonne `no_tracage` de la
  commande.
- **L'adresse d'envoi des courriels est une vraie boîte lue par Chantal**
  (universcaresse@outlook.com) — répondre au courriel fonctionne toujours.

---

## 1. L'ARBRE DU 3ᵉ COURRIEL

1. Il clique **Suivre mon colis** ✅ validée
2. Il **ne fait rien** (chemin normal) ✅ validée
3. **Pépin de livraison** (retard, perdu, endommagé, jamais reçu) ✅ validée
4. Il **reclique les vieux courriels** (1ᵉʳ ou 2ᵉ) après l'expédition ✅ validée
5. Il veut **réagir** (question, retour, insatisfaction, remerciement) ✅ validée
6. **Pépins d'envoi** (facture absente, courriel pas parti, mauvais numéro) ✅ validée

---

## 2. BRANCHE 1 — IL CLIQUE « SUIVRE MON COLIS » ✅

- **Client :** la page Postes Canada s'ouvre en français, son numéro déjà
  dans l'adresse — il voit où est son colis. Le lien reste bon pour
  toujours (c'est Postes Canada qui l'héberge, pas le site).
- **Chantal :** rien ne bouge — aucun appel au système, aucun signal.
- **Rien à coder.** ✅

---

## 3. BRANCHE 2 — IL NE FAIT RIEN (CHEMIN NORMAL) ✅

- **Client :** il reçoit son colis, fin de l'histoire.
- **Chantal :** rien à faire. La commande reste « Terminée », le
  `no_tracage` est gardé dans la sheet si jamais il faut vérifier.
- **Rien à coder.** ✅

---

## 4. BRANCHE 3 — PÉPIN DE LIVRAISON ✅
(retard, colis perdu, endommagé, « jamais reçu »)

- **Client :** aujourd'hui, le courriel n'offre AUCUNE porte pour ça. Ses
  seules voies : répondre au courriel (vraie boîte, ça marche) ou retrouver
  le formulaire Contact sur le site par lui-même.
- **Chantal :** tout se gère à la main avec Postes Canada (réclamation,
  renvoi, remboursement via la section Remboursements de l'admin). Rien
  d'automatique — et c'est correct ainsi.
- **DÉCIDÉ (correction A) :** ajouter un bouton **« Écrivez-nous »** dans le
  3ᵉ courriel, sous le bouton « Suivre mon colis » — formulaire Contact
  pré-rempli avec le numéro de commande, comme partout. ✅

---

## 5. BRANCHE 4 — VIEUX COURRIELS APRÈS EXPÉDITION ✅

- **Client :** statut « Terminée » → tous les boutons du 1ᵉʳ et du 2ᵉ
  courriel mènent à la page déjà décidée (6.3 du 2ᵉ courriel) :
  « Votre commande est en route! » + suivi cliquable + « Écrivez-nous ».
- **Chantal :** rien ne bouge.
- **Rien de nouveau à coder ici** — c'est la correction 16 du document du
  2ᵉ courriel qui couvre ce cas. ✅

---

## 6. BRANCHE 5 — IL VEUT RÉAGIR ✅
(question, demande de retour, insatisfaction, remerciement)

- **Client :** avec le « Écrivez-nous » ajouté (branche 3), toutes ces
  réactions passent par le formulaire pré-rempli OU par sa réponse courriel
  directe — les deux arrivent dans la boîte de Chantal.
- **Chantal :** gestion à la main. Un retour/remboursement passe par la
  section Remboursements de l'admin (existe déjà). Rien d'automatique. ✅

---

## 7. BRANCHE 6 — PÉPINS D'ENVOI ✅

### 6.1 La facture ne suit pas — BOGUE CONFIRMÉ
Voir le diagnostic complet en **8.1**. ✅

### 6.2 Le courriel d'expédition ne part pas
- **Vérifié :** dans `expedierCommande`, l'envoi du courriel est enveloppé
  d'un `try/catch` qui ne fait que `Logger.log('Erreur courriel expédition')`
  — la fonction retourne quand même `{ success: true }`. L'admin affiche
  « ✅ Commande expédiée, courriel envoyé » même si le courriel a échoué.
  Chantal ne le sait pas, le client n'a rien reçu.
- **DÉCIDÉ (correction B) :** avertir Chantal quand le courriel échoue —
  le retour de `expedierCommande` doit distinguer « expédiée ET courriel
  parti » de « expédiée MAIS courriel échoué », et l'admin afficher un
  message différent (l'expédition reste valide : statut et no_tracage sont
  déjà écrits). ✅

### 6.3 Mauvais numéro de suivi (faute de frappe au prompt)
- Aujourd'hui, aucune vérification : le courriel part avec un lien mort.
- **DÉCIDÉ : PAS de vérification de format.** L'étiquette Poste Canada
  (`etiquette-poste-canada_A-FAIRE.md`) captera le numéro tout seul —
  le problème disparaîtra de lui-même. ✅

---

## 8. CORRECTIONS À CODER (3 — rien n'est bâti)

### 8.1 Correction C — LE BOGUE DE LA FACTURE (diagnostic complet)

**Symptôme :** le courriel « en route » arrive sans la facture PDF jointe.

**Chaîne réelle, vérifiée dans les vrais fichiers :**
1. `js/admin-commandes.js` → `marquerExpediee` (ou `genererEtiquette`)
   appelle l'API `expedierCommande` avec
   `facture: construireFactureCommande(cmd_id)`.
2. `construireFactureCommande(cmd_id)` (même fichier) retourne un objet :
   `{ numero, date, client, lignes, sous_total, rabais, promo_nom,
   livraison, total }` — **AUCUN champ `courriel` dedans.**
3. `Code.gs` → `expedierCommande` fait :
   `envoyerFacture_v2(Object.assign({}, data.facture, { apercu: true }))`
   pour obtenir le HTML de la facture.
4. **`envoyerFacture_v2` commence par :**
   `const courriel = data.courriel || '';`
   `if (!courriel) return { success: false, message: 'Aucun courriel fourni.' };`
   → elle abandonne AVANT de bâtir le HTML, car le courriel n'y est pas.
5. Retour sans `html` → la condition `if (apercuFacture && apercuFacture.html)`
   échoue → **aucune pièce jointe**, en silence (le `catch` ne loggue même
   rien ici, il n'y a pas d'erreur levée).

**Correction décidée (en mots — le code attendra le OK) :** dans
`envoyerFacture_v2`, quand `data.apercu` est vrai, ne PAS exiger de
courriel — l'aperçu ne poste rien, il ne fait que bâtir le HTML. Un seul
trouve-et-remplace dans `Code.gs` : déplacer/conditionner la vérification
du courriel pour qu'elle ne s'applique qu'à l'envoi réel.

**Impacts vérifiés :** `envoyerFacture_v2` sert aussi à l'envoi de facture
des ventes (`js/admin-ventes.js` → API `envoyerFacture`, qui fournit
toujours un courriel et n'utilise pas `apercu`) — ce chemin garde sa
vérification, rien ne change pour lui.

**Republier après :** nouveau déploiement Apps Script (`Code.gs` seulement).

### 8.2 Correction A — bouton « Écrivez-nous » dans le 3ᵉ courriel
- **Où :** `Code.gs` → `expedierCommande`, dans le HTML du courriel, sous le
  bouton « Suivre mon colis ».
- **Quoi :** un lien secondaire (style contour, comme « J'ai changé d'idée »
  du 1ᵉʳ courriel) vers le formulaire Contact du site, pré-rempli avec le
  numéro de commande — même mécanisme d'URL que les autres courriels
  (le lien de base avec le numéro + le paramètre qui ouvre Contact).
- **À préciser au moment de coder :** reprendre exactement le format d'URL
  des boutons existants (numéro + jeton) pour que le pré-remplissage
  fonctionne.
- **Republier après :** nouveau déploiement Apps Script.

### 8.3 Correction B — avertir si le courriel d'expédition échoue
- **Où :** `Code.gs` → `expedierCommande` (le `catch` du courriel) +
  `js/admin-commandes.js` → les deux appelants (`marquerExpediee` et
  `genererEtiquette`).
- **Quoi :** `expedierCommande` retourne un indicateur « courriel parti
  oui/non ». Si non, l'admin affiche : « ⚠️ Commande expédiée, mais le
  courriel au client n'est PAS parti — à renvoyer à la main. » L'expédition
  elle-même reste valide (statut « Terminée » et `no_tracage` déjà écrits
  avant l'envoi du courriel).
- **Republier après :** déploiement Apps Script + republier le site.

---

## 9. CE QUI EST DÉJÀ CORRECT (ne pas « réparer »)

- ✅ Le courriel « en route » existe, gabarit complet, bouton « Suivre mon
  colis » avec lien Postes Canada en français.
- ✅ Le numéro de suivi s'écrit dans la sheet (`no_tracage`) et le statut
  passe à « Terminée » — avant l'envoi du courriel (l'expédition ne dépend
  pas du courriel).
- ✅ Le texto pré-rempli (Messages s'ouvre, envoi manuel — décision
  existante, voir `etat.md` 2.5).
- ✅ Le lien de suivi est permanent (hébergé par Postes Canada).
- ✅ Réponse directe au courriel → vraie boîte lue par Chantal.
- ✅ La section Remboursements de l'admin gère les retours.
- ✅ Le chemin étiquette (`genererEtiquette`) capte le numéro tout seul —
  garde-fous déjà décidés dans `etiquette-poste-canada_A-FAIRE.md`.

---

## 10. ANCRAGES TECHNIQUES (pour coder sans questions)

- **`Code.gs` → `expedierCommande(data)`** : reçoit `{ cmd_id, no_tracage,
  facture }`. Écrit `no_tracage` (colonne trouvée par nom), statut
  « Terminée » (colonne 9), lit courriel (col 4), prénom (col 17), numéro
  (col 1), libère le verrou, puis bâtit et envoie le courriel. Facture :
  voir 8.1.
- **`Code.gs` → `envoyerFacture_v2(data)`** : exige `data.courriel` en
  première ligne (LE bogue). Avec `data.apercu` vrai → retourne
  `{ success: true, html }` sans envoyer. Sert aussi à l'API
  `envoyerFacture` des ventes.
- **`js/admin-commandes.js` → `marquerExpediee(cmd_id)`** : prompt du
  numéro, texto pré-rempli, appel `expedierCommande`.
- **`js/admin-commandes.js` → `genererEtiquette(cmd_id)`** : achète
  l'étiquette (`genererEtiquette` côté serveur), capte `res.no_tracage`,
  texto, puis `expedierCommande`.
- **`js/admin-commandes.js` → `construireFactureCommande(cmd_id)`** : bâtit
  l'objet facture depuis `toutesCommandes` + `toutesCommandesLignes` +
  `donneesProduits` + `donneesGammes` (+ `donneesPromotions` si promo).
  Pas de champ courriel.
- **Lien de suivi :**
  `https://www.canadapost-postescanada.ca/track-reperage/fr#/details/` +
  numéro encodé.

---

## 11. OÙ ON EN EST / PROCHAINE ÉTAPE

- **Fait :** arbre complet du 3ᵉ courriel — 6 branches validées
  (3 juillet 2026). Bogue de la facture diagnostiqué au complet (8.1).
- **À faire :** coder les 3 corrections (C = facture, A = Écrivez-nous,
  B = avertir si échec) — aucun code sans OK, trouve-et-remplace un seul à
  la fois. Chantal a dit : pas de code maintenant.
- **Les 3 courriels du parcours client sont maintenant couverts** (1ᵉʳ =
  accusé de réception, 2ᵉ = proposition, 3ᵉ = expédition), chacun avec son
  `.md`.
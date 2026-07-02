# Premier courriel (accusé de réception) — Scénarios client

> **But de ce document.** Garder la vue complète des cas possibles à partir du **premier courriel** envoyé au client (l'accusé de réception de ses coups de cœur). On le détaille « plus que possible » pour ne **jamais avoir à recommencer ce dialogue**. Si la conversation se perd, ce fichier seul doit suffire à reprendre exactement où on était.
>
> **Important — état des corrections (section 9) :** 4 corrections vérifiées et prêtes. **①** annulation (`Code.gs`, à appliquer) · **②** message « lien cassé » (déjà dans le fichier, à publier) · **③** brouillon (`js/main-demande.js`, à appliquer) · **④** blocage du 1er courriel quand la proposition est partie (`js/main-demande.js`, à appliquer). **Une fois ①③④ posées, le 1er courriel est complet — avant ET après la proposition.** La ⑤ (renvoyer la proposition au complet) est optionnelle. Toujours : aucun code sans le OK de Chantal, trouve-et-remplace un seul à la fois.
>
> **Ce document sert aussi de MODÈLE** pour documenter le 2ᵉ courriel (la proposition) : reprendre la même structure — contexte, le courriel, arbre des branches, détail branche par branche, corrections à appliquer, ce qui est déjà correct, ancrages techniques, où on en est.
>
> **État d'avancement :** Branches 1 à 5 ✅ (monde « tu n'as encore rien fait de ton côté »). Cas **1.6** (monde « tu as déjà agi ») : **règle de base posée** ✅ + **page de redirection validée** ✅. Reste à coder les corrections, puis dérouler les autres statuts.

---

## 0. CONTEXTE (à lire en premier si tu arrives à froid)

- **Le site.** Univers Caresse, savonnerie artisanale. Admin sur Google Sheets + Apps Script (`Code.gs`). Front HTML/CSS/JS.
- **« Coups de cœur ».** Le site **n'est pas transactionnel**. Le client coche les produits qui l'intéressent et envoie sa liste. Ce n'est **pas** une commande ferme : Chantal reprend contact pour valider disponibilité, livraison et coût.
- **DEUX courriels — à ne pas confondre :**
  1. **1ᵉʳ courriel = accusé de réception** → *« Nous avons bien reçu vos intérêts »*. Envoyé **automatiquement** quand le client envoie sa liste. **Objet de CE document.** Statut de la commande : **« En attente »**.
  2. **2ᵉ courriel = la proposition** → *« La suite de vos coups de cœur »*. Envoyé **par Chantal** quand elle a préparé la commande. **3 portes** (Payer / Modifier / J'ai une question). Statut : **« En attente de paiement »**. Documenté dans `bloc1-jai-tout.md`.
- **RÈGLE QUI GOUVERNE TOUT.** Tant que le client n'a pas **confirmé une action** (renvoyer ou confirmer une annulation), **rien ne change dans la sheet**. Regarder, recliquer, ouvrir plusieurs onglets : ça ne doit **rien** écrire.
- **LES STATUTS COMMANDENT TOUT (règle de Chantal).** Chaque fonction **regarde le statut en premier**, puis décide si l'action fonctionne :
  - **« En attente »** = 1ᵉʳ courriel → les actions du 1ᵉʳ courriel fonctionnent.
  - **« En attente de paiement »** = proposition envoyée → les actions du 1ᵉʳ courriel **ne fonctionnent plus**, on redirige vers la proposition (voir section 8).
- **Le stock.** **Aucun stock n'est sorti tant que la commande est « En attente ».** Il ne sort qu'à l'envoi de la proposition. Important pour les annulations.
- **Méthode.** C'est Claude qui déroule l'arbre des cas, un point à la fois. **Chantal tranche, elle ne crée pas la liste.** Aucun code sans son OK.

---

## 1. LE COURRIEL CONCERNÉ

**Sujet :** « Nous avons bien reçu vos intérêts » — **Construit dans :** `Code.gs`, `envoyerDemandeCommande_v2` (bloc « ── Courriel au client ── »).
**Message :** « Nous avons bien reçu vos Coups de coeur. » + rappel *« Ceci n'est pas une commande ferme »*.

**2 boutons seulement :**

| Bouton | Lien |
|---|---|
| **« Modifier vos Coups de coeur »** | `https://universcaresse.ca/?cmd=<n°>&jeton=<jeton>` |
| **« J'ai changé d'idée »** | le même lien + `&action=annuler` |

> ⚠️ **Le « Modifier » du 1ᵉʳ courriel et le « Modifier » de la proposition sont LE MÊME lien** (`?cmd&jeton`, sans marqueur). Le site **ne peut pas** savoir de quel courriel vient le clic — il ne connaît que **le statut**. (Vérifié : `lienBase` ligne 3551 = `lienModifier` ligne 3678.)

**Les 3 choix de départ** (validés) : 1. Il modifie — 2. Il annule — 3. Il ne fait rien.

---

## 2. CE QUI SE PASSE QUAND IL ARRIVE SUR LE SITE (mécanique commune)

1. Il arrive avec `?cmd=` et `?jeton=`.
2. Lecture via `getCommandePublique_v2` → **lecture seule, aucune écriture** (vérifié : pas de `setValue`/`appendRow`/`deleteRow`).
3. **Garde-barrière selon le statut** (`js/main-demande.js`) :
   - **« En attente »** ou **« En attente de paiement »** → page modifiable ;
   - **tout autre statut** → liste locale **vidée** (`demandeVider()`) + page bloquée **« Cette commande ne peut plus être modifiée. »** + « Une question? ».
   - ⚠️ **C'est ce test qui mélange aujourd'hui « En attente » et « En attente de paiement ».** Le cas 1.6 veut les SÉPARER.
4. Page modifiable → liste (quantités +/−, Retirer) + 2 boutons : **« Renvoyer mes Coups de coeur »** et **« Je ne veux plus donner suite, annuler… »**.
5. **Liste gardée en mémoire locale** (clé `uc_demande`, **partagée avec le site public**). ← source des bugs de la branche 1.

**La sheet ne change QUE sur acte confirmé :** Renvoyer (`renvoyerListeCoupdecoeur_v2`) ou Annuler confirmé (`annulerCommandeClient`).

---

## 3. ARBRE COMPLET DES BRANCHES

> Légende : ✅ traité — ⚠️ correctif prévu — ⬜ pas encore abordé

### Branche 1 — Il clique « Modifier » ✅ *(section 4)*
- 1.1 modifie + Renvoyer ✅ · 1.2 modifie + ferme sans renvoyer ⚠️ brouillon · 1.3 finit par annuler ⚠️ brouillon · 1.4 reclique Modifier ✅ · 1.5 deux onglets/appareils ✅ · 1.6 **monde « tu as déjà agi »** → section 8 · 1.7 nouvel onglet site public ⚠️ brouillon

### Branche 2 — Il clique « J'ai changé d'idée » ✅ *(section 5)*
- 2.1 « Oui, annuler » ⚠️ **BUG** (refusé à tort sur « En attente ») · 2.2 « Non, revenir » ✅ · 2.3 ouvre + ferme ✅ · 2.4 déjà annulé reclique annuler ✅ · 2.5 déjà annulé clique Modifier ✅

### Branche 3 — Il ne fait rien ✅ *(réglée hors-code : rappels texto + courriel)*

### Branche 4 — Le désordre ✅ *(section 7)*
- 4.1 modifie→renvoie→annule ⚠️ **précise le correctif 2.1 (stock)** · 4.2 annule→modifie ✅ · 4.3 renvoie plusieurs fois ✅

### Branche 5 — Liens cassés ✅ *(section 6)*
- 5.1 jeton manquant/mauvais ✅ **code prêt** · 5.2 commande introuvable ✅ **code prêt** · 5.3 courriel transféré ✅ (gardé tel quel) · 5.4 vieil état navigateur ✅ (réglé par le correctif brouillon)

### Cas 1.6 — Monde « tu as déjà agi » → **règle posée** (section 8), reste à finir + coder

---

## 4. BRANCHE 1 EN DÉTAIL — « Il clique Modifier »

### 1.1 — Modifie + « Renvoyer » ✅
- Au succès : **« Merci ! Votre liste modifiée a bien été envoyée. »** Chantal reçoit l'avis **« Coups de coeur modifiés par le client »**.
- **DÉCISION.** On garde cet avis (filet de sécurité, son choix).

### 1.2 — Modifie mais ferme sans renvoyer ⚠️
- Commande reste identique (rien confirmé). **MAIS** sa liste modifiée vit dans la mémoire partagée avec le site public → un retour normal **ne l'efface pas**. → correctif « brouillon » (section 8 → renvoi à correctif).

### 1.3 — Sur la page Modifier, il finit par annuler ⚠️
- **Nœud (Chantal) :** le brouillon qui traîne **brouille l'annulation**. → même correctif « brouillon ».

### 1.4 — Renvoie puis reclique « Modifier » ✅
- **« Modifier » seul = lecture seule, zéro écriture** → recliquer ne duplique rien.

### 1.5 — Deux onglets / deux appareils ✅
- Tant qu'il ne confirme pas, chaque ouverture ne fait que lire.

### 1.6 — Il agit alors que tu as déjà avancé la commande → **section 8.**

### 1.7 — Nouvel onglet vers le site public ⚠️
- La liste modifiée réapparaît dans la bulle ; « Continuer » peut **repartir une nouvelle commande**. → correctif « brouillon ».

---

## 5. BRANCHE 2 EN DÉTAIL — « Il annule »

**Garde-fou commun.** Page de confirmation *« Vous souhaitez annuler? »* (raison facultative) → **« Oui, annuler ma commande »** / **« Non, revenir à ma liste »**.

### 2.1 — « Oui, annuler » ⚠️ BUG CONFIRMÉ
- `annulerCommandeClient` n'autorise que **« En attente de paiement »**. Or au 1ᵉʳ courriel c'est **« En attente »** → annulation **refusée** (*« Cette commande ne peut plus être annulée. »*). **Une des choses qui plantent.**
- **DÉCISION.** L'annulation doit marcher dès le 1ᵉʳ courriel. → correctif détaillé section 9.

### 2.2 — « Non, revenir » ✅ — ré-affiche la liste, **aucun appel serveur**.
### 2.3 — Ouvre la confirmation puis ferme ✅ — afficher ne déclenche rien.
### 2.4 — Déjà annulé, reclique « J'ai changé d'idée » ✅ — page bloquée + serveur refuse aussi. Pas de double annulation.
### 2.5 — Déjà annulé, clique « Modifier » ✅ — même mécanisme (statut lu avant le bouton).

---

## 6. BRANCHE 5 EN DÉTAIL — « Liens cassés »

### 5.1 (jeton manquant/mauvais) + 5.2 (commande introuvable) ✅ — CODE PRÊT (section 9)
- **Vérifié.** Le serveur répond « Lien invalide. » ou « Commande introuvable », **rien ne s'écrit**. Le jeton est exigé avant tout renvoi/annulation → impossible d'agir sur la commande d'un autre. Sécurité OK.
- **Problème réglé.** Le client voyait un message brut (« Réponse : … »). → remplacé par un texte d'invitation + bouton **« Écrivez-nous »** qui ouvre Contact avec le n° de commande pré-inscrit dans le message. (Pré-remplissage limité au n° de commande : sur un lien cassé, on n'a ni le nom ni le courriel — décision Chantal.)

### 5.3 — Courriel transféré ✅ (gardé tel quel)
- Le lien contient une **clé secrète (jeton)** ; sans mot de passe, **cette clé EST l'accès**. Qui reçoit le courriel transféré peut voir/modifier/annuler la commande.
- **DÉCISION (Chantal).** Acceptable pour le contexte (clientèle de confiance). On garde le système de lien sans connexion. *(« au pire un sentira bon, l'autre va puer »)*

### 5.4 — Vieil état du navigateur ✅
- C'est le même problème que la branche 1 → **réglé par le correctif « brouillon »** (qui nettoie la liste en mémoire).

---

## 7. BRANCHE 4 EN DÉTAIL — « Le désordre »

### 4.1 — Modifie → renvoie → annule ⚠️ (précise le correctif 2.1)
- Après un renvoi depuis le 1ᵉʳ courriel, la commande **reste « En attente »** ; lignes **remplacées proprement** (aucun doublon).
- Puis annuler = même blocage que 2.1.
- **IMPACT sur le correctif 2.1 :** en « En attente », **aucun stock sorti**. Or l'annulation **remet toujours du stock** → le correctif doit **ne PAS remettre de stock** sur « En attente », sinon on gonfle l'inventaire. (L'admin fait déjà cette distinction.)
- **DÉCISION.** Annuler une « En attente » ne touche à aucun stock.

### 4.2 — Annule → puis Modifier ✅ — page bloquée (= 2.5).
### 4.3 — Renvoie plusieurs fois ✅ — efface puis réécrit → jamais de doublon. Chantal reçoit un avis à chaque fois.
- **DÉCISION.** L'avis dit toujours « Statut : Modifiée » même si c'est « En attente » → **gardé volontairement** : signal visuel pour ne pas confondre avec une vraie vente.

---

## 8. CAS 1.6 — MONDE « TU AS DÉJÀ AGI » (proposition envoyée)

### La règle de base (validée par Chantal)
- **Chaque fonction regarde le STATUT en premier.**
  - **« En attente »** → les actions du 1ᵉʳ courriel fonctionnent (tout ce qu'on a réglé branches 1–5).
  - **« En attente de paiement »** (proposition partie) → **les boutons du 1ᵉʳ courriel ne fonctionnent plus** ; on **redirige vers la proposition**.

### Pourquoi c'est « par statut » et pas « par courriel »
- Les deux courriels partagent **le même lien** « Modifier ». Le site ne distingue pas les courriels → il s'appuie sur **le statut**.
- Donc « rien sur le 1ᵉʳ courriel quand une proposition existe » se traduit techniquement par : **au statut « En attente de paiement », la page n'offre plus les actions du 1ᵉʳ courriel — elle affiche : voici votre proposition + bouton « recevez à nouveau votre proposition ».**

### Ce qui cloche aujourd'hui (à corriger)
- Le garde-barrière actuel traite **« En attente » ET « En attente de paiement » pareil** (les deux laissent modifier). Résultat : depuis le vieux lien, le client peut renvoyer et **effacer ta proposition sans le savoir**. → il faut **séparer** les deux statuts.

### « Le seul bout » — ce que voit le client ✅ VALIDÉ
- Au statut « En attente de paiement », depuis le vieux lien, le client voit une **page courte** :
  - un mot qui dit que **sa proposition est prête et l'attend** ;
  - **un seul bouton : « Recevez à nouveau votre proposition »** (renvoie le 2ᵉ courriel).
- **Pas de Modifier, pas d'Annuler ici.** S'il veut changer ou annuler, il le fait **depuis la proposition**.
- *(Texte exact à finaliser plus tard, comme les autres textes.)*

### Reste à dérouler plus tard
- Les autres statuts du monde « tu as déjà agi » : **Payée**, **Annulée**, **À retravailler / Modifiée**, **réappro**… — pas encore faits.
- ⚠️ **Le bouton « recevez à nouveau votre proposition » est une fonction NEUVE** (renvoyer le courriel de proposition au client). Elle aura son propre arbre + analyse avant d'être bâtie (le courriel de proposition est créé par `envoyerPropositionV3`, aujourd'hui déclenché par l'admin).

---

## 9. CORRECTIONS — LISTE À APPLIQUER

> **3 corrections sont prêtes et vérifiées.** Les appliquer dans cet ordre, une à la fois.
> Une 4ᵉ (le 1.6 / redirection vers la proposition) **n'est pas prête** : elle a besoin d'une fonction neuve (renvoyer la proposition) — voir section 8.

### ① `Code.gs` — Annulation débloquée (cas 2.1 + 4.1) — ✅ PRÊT
Dans `annulerCommandeClient`.

**CHERCHER :**
```
    if (enteteData[ligneEntete - 1][8] !== 'En attente de paiement') {
      lock.releaseLock(); return { success: false, message: 'Cette commande ne peut plus être annulée.' };
    }

    lock.releaseLock();

    // Remettre le stock + passer à « En attente » (remettreStockCommande_v2 gère tout ça)
    remettreStockCommande_v2({ cmd_id: data.cmd_id, statut_apres: 'Annulée' });
```
**REMPLACER PAR :**
```
    const statutAvantAnnul = String(enteteData[ligneEntete - 1][8]);
    if (statutAvantAnnul !== 'En attente de paiement' && statutAvantAnnul !== 'En attente' && statutAvantAnnul !== 'Modifiée') {
      lock.releaseLock(); return { success: false, message: 'Cette commande ne peut plus être annulée.' };
    }

    lock.releaseLock();

    // Stock : on ne le remet que s'il a vraiment été sorti (proposition envoyée ou commande modifiée).
    // En « En attente », rien n'est sorti → on passe seulement le statut à « Annulée ».
    if (statutAvantAnnul === 'En attente de paiement' || statutAvantAnnul === 'Modifiée') {
      remettreStockCommande_v2({ cmd_id: data.cmd_id, statut_apres: 'Annulée' });
    } else {
      enteteSheet.getRange(ligneEntete, 9).setValue('Annulée');
    }
```
➡️ `Code.gs` → **refaire un déploiement Apps Script** après.

### ② `js/main-demande.js` — Message « lien cassé » (cas 5.1/5.2) — ✅ DÉJÀ DANS LE FICHIER
Confirmé présent dans le fichier actuel (le bloc « Nous n'avons pas pu ouvrir votre commande… Écrivez-nous »). Rien à chercher — juste **republier le site**.

### ③ `js/main-demande.js` — Correctif « brouillon » (cas 1.2, 1.3, 1.7, 5.4) — ✅ PRÊT
Dans le bloc d'initialisation (`// ─── INITIALISATION ───`).

**CHERCHER :**
```
document.addEventListener('DOMContentLoaded', () => {
  if (!DEMANDE_ACTIVE) return;
  try { localStorage.removeItem('uc_modif_cmd'); } catch (e) {}
  chargerDemandeListe();
```
**REMPLACER PAR :**
```
document.addEventListener('DOMContentLoaded', () => {
  if (!DEMANDE_ACTIVE) return;
  // Nettoyage du brouillon : si on n'arrive PAS par le lien d'une commande (?cmd=)
  // mais qu'une modification de commande traînait encore en mémoire, on efface cette
  // liste pour qu'elle ne réapparaisse pas comme une nouvelle liste sur le site public.
  try {
    const surUneCommande = new URLSearchParams(window.location.search).get('cmd');
    if (!surUneCommande && localStorage.getItem('uc_modif_cmd')) {
      localStorage.removeItem(DEMANDE_STORAGE_KEY);
    }
  } catch (e) {}
  try { localStorage.removeItem('uc_modif_cmd'); } catch (e) {}
  chargerDemandeListe();
```
➡️ HTML/JS → **republier le site** après.

### ④ `js/main-demande.js` — Bloquer le 1er courriel quand la proposition est partie (cas 1.6) — ✅ PRÊT
Empêche le client d'effacer la proposition depuis le vieux lien, et le guide vers le paiement / Contact. **Front-end seulement, aucune fonction serveur neuve.** Dans le bloc `if (!estBloc2ou3) {`.

**CHERCHER :**
```
    if (!estBloc2ou3) {
      // Bloc 1 — comportement existant
      try { localStorage.setItem('uc_modif_cmd', JSON.stringify({ cmd: numero, jeton: jeton })); } catch (e) {}
```
**REMPLACER PAR :**
```
    if (!estBloc2ou3) {
      // Proposition déjà envoyée (statut « En attente de paiement ») : on NE laisse PAS
      // modifier/renvoyer depuis le 1er courriel (ça effacerait la proposition). On guide
      // le client vers le paiement, ou vers Contact.
      if (res.statut === 'En attente de paiement') {
        if (zone) zone.innerHTML = '<h2 class="titre">Votre proposition vous attend</h2>' +
          '<p class="textes-discrets">Nous vous avons envoyé une proposition par courriel, avec les prix et la livraison. Vous pouvez aller au paiement, ou nous écrire si vous ne la retrouvez pas.</p>' +
          '<button type="button" class="bouton bouton-grand" id="prop-payer">Aller au paiement</button>' +
          '<button type="button" class="bouton bouton-contour" style="margin-top:8px" onclick="naviguer(\'contact\');return false;">J\'ai une question</button>';
        var bPayer = document.getElementById('prop-payer');
        if (bPayer) bPayer.addEventListener('click', function () {
          window.location.href = window.location.pathname + '?cmd=' + encodeURIComponent(numero) + '&jeton=' + encodeURIComponent(jeton) + '&action=payer';
        });
        return;
      }
      // Bloc 1 — comportement existant
      try { localStorage.setItem('uc_modif_cmd', JSON.stringify({ cmd: numero, jeton: jeton })); } catch (e) {}
```
➡️ HTML/JS → **republier le site** après. (Se pose en même temps que ③.)

### ⑤ (optionnel, plus tard) Renvoyer le courriel de proposition au complet
La phrase « Recevez à nouveau votre proposition ». **Pas un bogue** — avec ④, le client est déjà guidé. Demande une fonction neuve : `envoyerProposition_V3` a besoin de tout le détail (prix par ligne, rabais, livraison, total, note) qui n'est pas tout stocké tel quel — à analyser avant de bâtir.

---

### ORDRE D'APPLICATION
1. ① dans `Code.gs` → **déploiement Apps Script**.
2. ③ et ④ dans `js/main-demande.js` (② y est déjà) → **republier le site** une fois pour les trois.

**➡️ Avec ①, ③ et ④ posées, le 1er courriel est couvert de bout en bout — avant ET après la proposition. ⑤ est optionnel.**

> **Petit reste connu (à durcir plus tard, pas urgent) :** si le client **retire tous** les produits sur la page de sa commande, l'écran n'offre que « Fermer » (pas d'annuler) — il doit recharger la page pour retrouver sa commande. Rare, et le message le guide déjà.

> **Rappel non négociable.** Aucun code sans le OK de Chantal. Trouve-et-remplace **un seul à la fois**, « ok » entre chaque.

---

## 10. CE QUI EST DÉJÀ CORRECT (ne pas « réparer »)

- ✅ « Modifier » seul n'écrit rien (lecture seule).
- ✅ La sheet ne bouge qu'à un acte confirmé.
- ✅ Renvoyer ne duplique jamais (efface puis réécrit) — même sur renvois répétés.
- ✅ Avis à Chantal au renvoi : gardé (filet + signal visuel « Modifiée »).
- ✅ Garde-fou d'annulation (page de confirmation Oui/Non, raison facultative).
- ✅ « Non, revenir » / ouvrir-fermer la confirmation : aucun effet.
- ✅ Commande déjà annulée : double protection écran + serveur.
- ✅ Il ne fait rien : couvert par les rappels.
- ✅ Liens cassés : « Lien invalide. » / « Commande introuvable » en lecture + message doux « Écrivez-nous » avec le n° de commande (**correction ② déjà dans le fichier**, à publier).

---

## 11. ANCRAGES TECHNIQUES

**Fichiers :** `Code.gs` (back-end) · `js/main-demande.js` (coups de cœur côté client) · `index.html` (`#section-coupdecoeur`, `#coupdecoeur-commande`, `#coupdecoeur-bloque` ; formulaire Contact : `#prenom`/`#nom`/`#courriel`/`#sujet`/`#message`).

**Fonctions (Code.gs) :**
- `envoyerDemandeCommande_v2` — crée la commande (**« En attente »**) + envoie le 1ᵉʳ courriel. Lien Modifier = `lienBase` (ligne 3551).
- `envoyerPropositionV3` — envoie le 2ᵉ courriel (proposition), **déclenché par l'admin**. Lien Modifier = `lienModifier` (ligne 3678) — **identique** à `lienBase`. Portes : `&action=payer`, `&action=question`.
- `getCommandePublique_v2` — **lecture seule** ; retourne statut, lignes, lien_square, et coordonnées (prénom, nom, code postal, rue, ville, province).
- `renvoyerListeCoupdecoeur_v2` — accepte « En attente » **et** « En attente de paiement » ; efface puis réécrit ; statut après : `statutAvant === 'En attente' ? 'En attente' : 'Modifiée'` ; avis à Chantal (corps toujours « Statut : Modifiée »).
- `annulerCommandeClient` — **n'accepte que « En attente de paiement » ET remet toujours le stock** → corrigé par la **correction ①** (section 9).

**Garde-barrière client (`js/main-demande.js`, au chargement) :**
`if (res.statut !== 'En attente de paiement' && res.statut !== 'En attente')` → `demandeVider()` + `#coupdecoeur-bloque`. **Test passé AVANT de distinguer Modifier/Annuler** (d'où 2.4 = 2.5 = 4.2). **C'est ici que les deux statuts sont mélangés (cas 1.6).**

**Écran d'annulation (`js/main-demande.js`) :** `annuler` → confirmation ; `confirmer-annulation` → `annulerCommandeClient` → « Commande annulée » ; `retour-liste` → `coupdecoeurRendre()` (aucun appel serveur).

**Stock :** sort uniquement à l'envoi de la proposition (`sortirStockCommande`). En « En attente », rien n'est sorti. Annulation admin déjà conditionnelle : `stockSorti = statut ∈ {En attente de paiement, Modifiée}`.

**Mémoire locale :** `uc_demande` = la liste (**partagée site public** → fuite du brouillon, cœur du correctif A). `uc_modif_cmd` = repère `{cmd, jeton}` effacé à chaque chargement.

---

## 12. OÙ ON EN EST / PROCHAINE ÉTAPE

- **Fait :** Branches **1 à 5** + **règle de base du cas 1.6** + **« le seul bout »** (page de redirection validée).
- **À appliquer maintenant (section 9) :** ① annulation (`Code.gs`, à appliquer) · ② lien cassé (déjà dans le fichier, à publier) · ③ brouillon (`js/main-demande.js`, à appliquer).
- **Pas encore prête :** ④ redirection 1.6 → a besoin de la **fonction neuve « renvoyer la proposition »** + séparer les deux statuts.
- **Plus tard :** le reste du monde « tu as déjà agi » (Payée, Annulée, retravail, réappro).
- **Prochain gros morceau : le 2ᵉ courriel (la proposition)** — documenter dans son propre `.md`, en reprenant la structure de ce document.
- **Rappel :** aucun code sans OK ; trouve-et-remplace un seul à la fois.

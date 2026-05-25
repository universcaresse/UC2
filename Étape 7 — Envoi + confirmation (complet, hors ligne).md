# Étape 7 — L’envoi réel + l’écran de confirmation (complet)

**Ce que ça fait :** le bouton « Envoyer la demande » envoie vraiment la liste + les coordonnées à Chantal (par courriel via Apps Script), affiche un écran de remerciement (avec la mention des pourriels), puis vide la liste.

**Deux parties :**

- **A. Côté site** (`js/main-demande.js`) — 4 blocs trouve-et-remplace ci-dessous. Suppose que **l’étape 6 est en place**.
- **B. Côté serveur** (Google Apps Script) — une fonction à ajouter + à brancher dans ton `doPost`. **À finaliser ensemble** quand tu m’enverras ton `Code.gs`.

-----

# PARTIE A — Côté site

## Bloc 1 — `js/main-demande.js`

On ajoute l’écran de remerciement (caché au départ) dans la fenêtre, juste après l’écran du formulaire.

**TROUVE :**

```javascript
        '<button type="button" class="bouton bouton-grand demande-form-envoyer" data-action="envoyer">Envoyer la demande</button>' +
      '</div>' +
    '</div>';
```

**REMPLACE par :**

```javascript
        '<button type="button" class="bouton bouton-grand demande-form-envoyer" data-action="envoyer">Envoyer la demande</button>' +
      '</div>' +
      '<div id="demande-vue-merci" class="cache">' +
        '<h2 class="demande-modal-titre">Demande envoyée !</h2>' +
        '<p class="demande-form-intro">Merci ! Nous avons bien reçu votre liste et nous reviendrons vers vous très bientôt pour confirmer les délais, les coûts et la disponibilité.</p>' +
        '<p class="demande-form-intro">Surveillez votre boîte de réception — et pensez à vérifier vos pourriels, au cas où.</p>' +
        '<button type="button" class="bouton bouton-grand demande-continuer" data-action="fermer">Fermer</button>' +
      '</div>' +
    '</div>';
```

-----

## Bloc 2 — `js/main-demande.js`

On apprend au bouton « Fermer » de l’écran de remerciement à fermer la fenêtre.

**TROUVE :**

```javascript
    if (action === 'continuer') { demandeAllerForm(); return; }
    if (action === 'retour')    { demandeRetourListe(); return; }
    if (action === 'envoyer')   { demandeEnvoyer(); return; }
```

**REMPLACE par :**

```javascript
    if (action === 'continuer') { demandeAllerForm(); return; }
    if (action === 'retour')    { demandeRetourListe(); return; }
    if (action === 'envoyer')   { demandeEnvoyer(); return; }
    if (action === 'fermer')    { demandeFermerModalListe(); return; }
```

-----

## Bloc 3 — `js/main-demande.js`

On remplace la validation « pour faire semblant » par le vrai envoi. (La fonction devient `async` et le petit `alert` disparaît.)

**TROUVE :**

```javascript
function demandeEnvoyer() {
  const nom        = (document.getElementById('demande-nom').value || '').trim();
  const courriel   = (document.getElementById('demande-courriel').value || '').trim();
  const telephone  = (document.getElementById('demande-telephone').value || '').trim();
  const codePostal = (document.getElementById('demande-code-postal').value || '').trim();
  const message    = (document.getElementById('demande-message').value || '').trim();
  const erreurEl   = document.getElementById('demande-form-erreur');

  if (!nom || !courriel || !telephone || !codePostal) {
    erreurEl.textContent = 'Veuillez remplir tous les champs obligatoires.';
    erreurEl.classList.remove('cache');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
    erreurEl.textContent = 'Veuillez entrer un courriel valide.';
    erreurEl.classList.remove('cache');
    return;
  }
  erreurEl.classList.add('cache');

  // ── ÉTAPE 7 : l'envoi réel se branchera ici (envoyerDemandeCommande). ──
  // Données prêtes : nom, courriel, telephone, codePostal, message + demandeListe
  alert('Tout est validé. L’envoi sera branché à l’étape 7.');
}
```

**REMPLACE par :**

```javascript
async function demandeEnvoyer() {
  const nom        = (document.getElementById('demande-nom').value || '').trim();
  const courriel   = (document.getElementById('demande-courriel').value || '').trim();
  const telephone  = (document.getElementById('demande-telephone').value || '').trim();
  const codePostal = (document.getElementById('demande-code-postal').value || '').trim();
  const message    = (document.getElementById('demande-message').value || '').trim();
  const erreurEl   = document.getElementById('demande-form-erreur');
  const btn        = document.querySelector('.demande-form-envoyer');

  if (!nom || !courriel || !telephone || !codePostal) {
    erreurEl.textContent = 'Veuillez remplir tous les champs obligatoires.';
    erreurEl.classList.remove('cache');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
    erreurEl.textContent = 'Veuillez entrer un courriel valide.';
    erreurEl.classList.remove('cache');
    return;
  }
  erreurEl.classList.add('cache');

  if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

  const items = demandeListe.map(i => ({
    pro_id: i.pro_id,
    produit: i.nom_produit,
    collection: i.nom_collection,
    format: i.format_poids + ' ' + i.format_unite,
    prix_unitaire: i.prix_unitaire,
    quantite: i.quantite
  }));

  try {
    const res = (typeof appelAPIPost === 'function')
      ? await appelAPIPost('envoyerDemandeCommande', {
          nom, courriel, telephone, code_postal: codePostal, message,
          items, total: demandeSousTotal()
        })
      : null;
    if (!res || !res.success) throw new Error('Echec envoi');

    demandeVider();
    ['demande-nom', 'demande-courriel', 'demande-telephone', 'demande-code-postal', 'demande-message']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const vueForm  = document.getElementById('demande-vue-form');
    const vueMerci = document.getElementById('demande-vue-merci');
    if (vueForm)  vueForm.classList.add('cache');
    if (vueMerci) vueMerci.classList.remove('cache');
  } catch (err) {
    erreurEl.textContent = "Une erreur s'est produite. Veuillez réessayer ou nous écrire directement.";
    erreurEl.classList.remove('cache');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Envoyer la demande'; }
}
```

-----

## Bloc 4 — `js/main-demande.js`

Pour que rouvrir la fenêtre revienne toujours proprement sur la liste (et pas sur l’écran de remerciement), on le cache aussi au retour.

**TROUVE :**

```javascript
function demandeRetourListe() {
  const vueListe = document.getElementById('demande-vue-liste');
  const vueForm  = document.getElementById('demande-vue-form');
  if (!vueListe || !vueForm) return;
  vueForm.classList.add('cache');
  vueListe.classList.remove('cache');
}
```

**REMPLACE par :**

```javascript
function demandeRetourListe() {
  const vueListe = document.getElementById('demande-vue-liste');
  const vueForm  = document.getElementById('demande-vue-form');
  const vueMerci = document.getElementById('demande-vue-merci');
  if (!vueListe || !vueForm) return;
  vueForm.classList.add('cache');
  if (vueMerci) vueMerci.classList.add('cache');
  vueListe.classList.remove('cache');
}
```

-----

# PARTIE B — Côté serveur (Google Apps Script)

> ⚠️ **À finaliser ensemble.** Je n’ai pas ton `Code.gs` sous les yeux. Voici la fonction prête et l’endroit où la brancher. Quand tu reviens en ligne, envoie-moi ton `Code.gs` (la partie `doPost` et le cas `envoyerContact` existant) et je te donne la ligne exacte de branchement, adaptée à tes noms.

## 1) La fonction à ajouter (n’importe où dans `Code.gs`)

```javascript
function envoyerDemandeCommande(data) {
  try {
    var dest = 'universcaresse@outlook.com'; // à confirmer : la même adresse que le formulaire de contact

    var items = data.items || [];
    if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { items = []; } }

    var lignes = items.map(function(i) {
      var pu = Number(i.prix_unitaire || 0).toFixed(2);
      return '• ' + (i.quantite || 1) + ' x ' + (i.produit || '') +
             ' (' + (i.collection || '') + ') — ' + (i.format || '') +
             ' — ' + pu + ' $ /unité';
    }).join('\n');

    var total = Number(data.total || 0).toFixed(2);

    var corps =
      'NOUVELLE DEMANDE DE COMMANDE\n' +
      '(non transactionnelle — à confirmer avec le client)\n\n' +
      'Nom : ' + (data.nom || '') + '\n' +
      'Courriel : ' + (data.courriel || '') + '\n' +
      'Téléphone : ' + (data.telephone || '') + '\n' +
      'Code postal : ' + (data.code_postal || '') + '\n' +
      'Message : ' + (data.message || '(aucun)') + '\n\n' +
      'PRODUITS\n' + (lignes || '(aucun)') + '\n\n' +
      'Total estimé : ' + total + ' $\n';

    MailApp.sendEmail(dest, 'Demande de commande — ' + (data.nom || ''), corps);

    // (Optionnel) accusé de réception au client :
    // MailApp.sendEmail(data.courriel, 'Nous avons reçu votre demande — Univers Caresse',
    //   'Merci ! Nous reviendrons vers vous bientôt pour confirmer les détails. Pensez à vérifier vos pourriels.');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
```

## 2) Le branchement dans `doPost` (à adapter à ton fichier)

Dans ton `doPost`, là où tu aiguilles déjà les actions (tu as un cas pour `'envoyerContact'`), ajoute le même genre de ligne pour `'envoyerDemandeCommande'`. L’idée :

```javascript
// ... à côté de ton cas existant ...
if (action === 'envoyerContact')          return /* ta façon de répondre */ ( envoyerContact(data) );
if (action === 'envoyerDemandeCommande')  return /* la même façon */        ( envoyerDemandeCommande(data) );
```

Le « /* ta façon de répondre */ » = ton helper qui renvoie du JSON (souvent un `ContentService.createTextOutput(JSON.stringify(...))`). **C’est cette partie que je veux voir pour te donner la bonne ligne.**

## 3) Après avoir collé : **redéployer**

Apps Script ne prend le nouveau code en compte qu’après un **nouveau déploiement** (Déployer → Gérer les déploiements → modifier la version). Tant que ce n’est pas redéployé, le site recevra une erreur et affichera le message « Une erreur s’est produite ».

-----

## Pour tester (avec `?test=1`)

1. Choisis des produits → cœur → **Continuer** → remplis les coordonnées → **Envoyer la demande**.
1. **Avant** que le serveur soit prêt : c’est normal de voir « Une erreur s’est produite » (le bouton se réactive). La partie site est correcte ; il manque juste le serveur.
1. **Après** le branchement + redéploiement : le courriel arrive à Chantal, l’écran « Demande envoyée ! » s’affiche, et le cœur compteur disparaît (liste vidée).
1. Rouvre la fenêtre plus tard (après avoir re-choisi des produits) → tu reviens bien sur la liste.

## Notes

- La liste se vide **seulement** après un envoi réussi (`demandeVider`).
- Les textes de l’écran de remerciement sont modifiables à ton goût.
- Quand tout marche : pour mettre en ligne pour de vrai, il faudra **retirer le verrou `?test=1`** (on en reparlera — c’est un petit changement dans `main-demande.js`).
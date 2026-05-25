# Étape 6 — Le formulaire de coordonnées (complet)

**Ce que ça fait :** dans la fenêtre de liste, un bouton **Continuer** ouvre un deuxième écran « Coordonnées » (nom, courriel, téléphone, code postal **obligatoires** + message optionnel). Un bouton **Retour** ramène à la liste. **Envoyer** valide les champs.

**Avant de commencer :**

- Ça suppose que **l’étape 5 est déjà en place** (les « TROUVE » reprennent le code de l’étape 5).
- Applique les **5 blocs dans l’ordre**.
- L’**envoi réel n’est pas encore branché** : pour l’instant, un clic sur Envoyer (une fois les champs valides) affiche un petit message. Le vrai envoi + la page de confirmation, c’est l’étape 7.

-----

## Bloc 1 — `js/main-demande.js`

On ajoute le deuxième écran (le formulaire) et le bouton Continuer dans la fenêtre. Remplace le contenu de la fenêtre par les deux écrans : la liste, puis les coordonnées (caché au départ).

**TROUVE :**

```javascript
  overlay.innerHTML =
    '<div class="demande-modal">' +
      '<button class="demande-modal-fermer" type="button" aria-label="Fermer">✕</button>' +
      '<h2 class="demande-modal-titre">Produits qui vous intéressent</h2>' +
      '<div class="demande-modal-liste" id="demande-modal-liste"></div>' +
      '<div class="demande-modal-pied">' +
        '<span class="demande-modal-total-label">Total estimé</span>' +
        '<span class="demande-modal-total" id="demande-modal-total"></span>' +
      '</div>' +
    '</div>';
```

**REMPLACE par :**

```javascript
  overlay.innerHTML =
    '<div class="demande-modal">' +
      '<button class="demande-modal-fermer" type="button" aria-label="Fermer">✕</button>' +
      '<div id="demande-vue-liste">' +
        '<h2 class="demande-modal-titre">Produits qui vous intéressent</h2>' +
        '<div class="demande-modal-liste" id="demande-modal-liste"></div>' +
        '<div class="demande-modal-pied">' +
          '<span class="demande-modal-total-label">Total estimé</span>' +
          '<span class="demande-modal-total" id="demande-modal-total"></span>' +
        '</div>' +
        '<button type="button" class="bouton bouton-grand demande-continuer" data-action="continuer">Continuer</button>' +
      '</div>' +
      '<div id="demande-vue-form" class="cache">' +
        '<button type="button" class="demande-retour" data-action="retour">← Retour à la liste</button>' +
        '<h2 class="demande-modal-titre">Coordonnées</h2>' +
        '<p class="demande-form-intro">Laissez vos coordonnées et nous reviendrons vers vous pour confirmer les délais, les coûts et la disponibilité avant tout engagement.</p>' +
        '<div class="form-group"><label class="form-label">Nom <span>*</span></label><input type="text" class="form-control" id="demande-nom"></div>' +
        '<div class="form-group"><label class="form-label">Courriel <span>*</span></label><input type="email" class="form-control" id="demande-courriel"></div>' +
        '<div class="form-group"><label class="form-label">Téléphone <span>*</span></label><input type="tel" class="form-control" id="demande-telephone"></div>' +
        '<div class="form-group"><label class="form-label">Code postal <span>*</span></label><input type="text" class="form-control" id="demande-code-postal"></div>' +
        '<div class="form-group"><label class="form-label">Message</label><textarea class="form-control" id="demande-message"></textarea></div>' +
        '<div id="demande-form-erreur" class="demande-form-erreur cache"></div>' +
        '<button type="button" class="bouton bouton-grand demande-form-envoyer" data-action="envoyer">Envoyer la demande</button>' +
      '</div>' +
    '</div>';
```

-----

## Bloc 2 — `js/main-demande.js`

On apprend à la fenêtre à réagir aux nouveaux boutons (Continuer, Retour, Envoyer), en plus des − + et Retirer déjà là.

**TROUVE :**

```javascript
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.demande-modal-fermer')) {
      demandeFermerModalListe();
      return;
    }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const ligne = btn.closest('[data-cle]');
    if (!ligne) return;
    const pro_id = ligne.dataset.proId;
    const poids  = ligne.dataset.poids;
    const unite  = ligne.dataset.unite;
    const action = btn.dataset.action;
    if (action === 'moins')        demandeChangerQuantite(pro_id, poids, unite, -1);
    else if (action === 'plus')    demandeChangerQuantite(pro_id, poids, unite, 1);
    else if (action === 'retirer') demandeRetirer(pro_id, poids, unite);
    if (demandeNombreItems() < 1) demandeFermerModalListe();
    else demandeRendreListe();
  });
```

**REMPLACE par :**

```javascript
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.demande-modal-fermer')) {
      demandeFermerModalListe();
      return;
    }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'continuer') { demandeAllerForm(); return; }
    if (action === 'retour')    { demandeRetourListe(); return; }
    if (action === 'envoyer')   { demandeEnvoyer(); return; }
    const ligne = btn.closest('[data-cle]');
    if (!ligne) return;
    const pro_id = ligne.dataset.proId;
    const poids  = ligne.dataset.poids;
    const unite  = ligne.dataset.unite;
    if (action === 'moins')        demandeChangerQuantite(pro_id, poids, unite, -1);
    else if (action === 'plus')    demandeChangerQuantite(pro_id, poids, unite, 1);
    else if (action === 'retirer') demandeRetirer(pro_id, poids, unite);
    if (demandeNombreItems() < 1) demandeFermerModalListe();
    else demandeRendreListe();
  });
```

-----

## Bloc 3 — `js/main-demande.js`

On ajoute les fonctions : aller au formulaire, revenir à la liste, valider l’envoi. Le bloc se place juste après la fonction qui dessine la liste.

**TROUVE :**

```javascript
  if (totalEl) totalEl.textContent = (typeof formaterPrix === 'function') ? formaterPrix(demandeSousTotal()) : demandeSousTotal().toFixed(2).replace('.', ',') + ' $';
}
```

**REMPLACE par :**

```javascript
  if (totalEl) totalEl.textContent = (typeof formaterPrix === 'function') ? formaterPrix(demandeSousTotal()) : demandeSousTotal().toFixed(2).replace('.', ',') + ' $';
}

// ─── FORMULAIRE DE COORDONNÉES (étape 6) ───
function demandeAllerForm() {
  if (!demandeListe.length) return;
  const vueListe = document.getElementById('demande-vue-liste');
  const vueForm  = document.getElementById('demande-vue-form');
  if (!vueListe || !vueForm) return;
  vueListe.classList.add('cache');
  vueForm.classList.remove('cache');
}

function demandeRetourListe() {
  const vueListe = document.getElementById('demande-vue-liste');
  const vueForm  = document.getElementById('demande-vue-form');
  if (!vueListe || !vueForm) return;
  vueForm.classList.add('cache');
  vueListe.classList.remove('cache');
}

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

-----

## Bloc 4 — `js/main-demande.js`

Quand on rouvre la fenêtre, on revient toujours sur la liste (pas sur le formulaire laissé ouvert la fois d’avant).

**TROUVE :**

```javascript
function demandeOuvrirModalListe() {
  const overlay = document.getElementById('demande-modal');
  if (!overlay) return;
  demandeRendreListe();
  overlay.classList.add('ouvert');
  document.body.style.overflow = 'hidden';
}
```

**REMPLACE par :**

```javascript
function demandeOuvrirModalListe() {
  const overlay = document.getElementById('demande-modal');
  if (!overlay) return;
  demandeRendreListe();
  demandeRetourListe();
  overlay.classList.add('ouvert');
  document.body.style.overflow = 'hidden';
}
```

-----

## Bloc 5 — `css/style.css`

Quelques règles pour le formulaire (les champs réutilisent déjà tes classes `.form-group`, `.form-label`, `.form-control`, et les boutons tes classes `.bouton .bouton-grand`). Je place ça après la dernière règle « demande ».

**TROUVE :**

```css
.demande-modal-total { font-family: 'Playfair Display', serif; font-size: var(--texte-175); color: var(--primary); }
```

**REMPLACE par :**

```css
.demande-modal-total { font-family: 'Playfair Display', serif; font-size: var(--texte-175); color: var(--primary); }
.demande-continuer { width: 100%; margin-top: 20px; }
.demande-retour { background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: var(--texte-82); color: var(--gris); padding: 0 0 16px; }
.demande-retour:hover { color: var(--primary); }
.demande-form-intro { font-family: 'DM Sans', sans-serif; font-size: var(--texte-85); line-height: 1.7; color: var(--gris); margin-bottom: 24px; }
.demande-form-erreur { font-family: 'DM Sans', sans-serif; font-size: var(--texte-82); color: var(--danger); margin-bottom: 16px; }
.demande-form-envoyer { width: 100%; margin-top: 8px; }
```

-----

## Pour tester (avec `?test=1`)

1. Choisis des produits, ouvre la fenêtre par le cœur.
1. Clique **Continuer** → l’écran « Coordonnées » apparaît.
1. **Retour à la liste** ramène en arrière (la liste est intacte).
1. Clique **Envoyer la demande** sans tout remplir → message d’erreur en rouge.
1. Mets un courriel mal formé → message d’erreur.
1. Remplis nom, courriel valide, téléphone, code postal → le petit message « Tout est validé… » confirme que c’est prêt pour l’étape 7.
1. Ferme et rouvre la fenêtre → tu reviens bien sur la liste.

## Notes pour la suite

- Le `alert(...)` dans `demandeEnvoyer` est **temporaire** : à l’étape 7, on le remplace par le vrai envoi vers `envoyerDemandeCommande` + une page de confirmation (avec la mention de vérifier les pourriels), et on videra la liste après un envoi réussi (`demandeVider`).
- Champs obligatoires : nom, courriel, téléphone, code postal. Message optionnel (pas d’astérisque).
- Tu peux changer les textes (titre « Coordonnées », phrase d’intro, libellés) à ton goût — dis-moi si tu veux d’autres formulations.
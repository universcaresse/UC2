# Étape 5 — La modal de la liste (complet)

**Ce que ça fait :** cliquer sur le cœur rouge (la bulle) ouvre une fenêtre qui montre chaque produit choisi — photo, nom, collection, format, quantité ajustable (− nombre +), sous-total, bouton retirer — et un total estimé en bas.

**Avant de commencer :**

- Ça suppose que les **étapes 1 à 4 sont déjà en place** (sinon certains « TROUVE » ne correspondront pas).
- Applique les **5 blocs dans l’ordre**.
- La photo et la collection ne sont gardées **qu’à partir du bloc 1**. Les produits cochés avant ce changement s’afficheront sans photo → décoche/recoche-les (ou vide ta liste de test) une fois tout en place.

-----

## Bloc 1 — `js/main-demande.js`

On garde aussi la **photo** et la **collection** quand on ajoute un produit (pour pouvoir les montrer dans la liste).

**TROUVE :**

```javascript
function demandeAjouter(pro_id, format_poids, format_unite, nom_produit, prix_unitaire) {
  const cle = demandeCle(pro_id, format_poids, format_unite);
  const existant = demandeListe.find(i => demandeCle(i.pro_id, i.format_poids, i.format_unite) === cle);
  if (existant) {
    existant.quantite = (existant.quantite || 1) + 1;
  } else {
    demandeListe.push({
      pro_id,
      format_poids,
      format_unite,
      nom_produit,
      prix_unitaire,
      quantite: 1
    });
  }
  sauvegarderDemandeListe();
  demandeRafraichirAffichage();
}
```

**REMPLACE par :**

```javascript
function demandeAjouter(pro_id, format_poids, format_unite, nom_produit, prix_unitaire, image_url, nom_collection) {
  const cle = demandeCle(pro_id, format_poids, format_unite);
  const existant = demandeListe.find(i => demandeCle(i.pro_id, i.format_poids, i.format_unite) === cle);
  if (existant) {
    existant.quantite = (existant.quantite || 1) + 1;
  } else {
    demandeListe.push({
      pro_id,
      format_poids,
      format_unite,
      nom_produit,
      prix_unitaire,
      image_url,
      nom_collection,
      quantite: 1
    });
  }
  sauvegarderDemandeListe();
  demandeRafraichirAffichage();
}
```

-----

## Bloc 2 — `js/main-demande.js`

On envoie la photo et la collection au moment de cocher (dans la fiche produit).

**TROUVE :**

```javascript
        demandeAjouter(produit.pro_id, poids, unite, produit.nom, prix);
```

**REMPLACE par :**

```javascript
        demandeAjouter(produit.pro_id, poids, unite, produit.nom, prix, produit.image_url, produit.nom_collection);
```

-----

## Bloc 3 — `js/main-demande.js`

On ajoute toute la mécanique de la fenêtre de liste (création, ouverture, fermeture, contenu). Le bloc se place juste après la fonction qui gère les cases de la fiche produit.

**TROUVE :**

```javascript
  hex.insertBefore(bloc, prixFormatEl || null);
}
```

**REMPLACE par :**

```javascript
  hex.insertBefore(bloc, prixFormatEl || null);
}

// ─── MODAL DE LA LISTE (étape 5) ───
function demandeCreerModalListe() {
  if (document.getElementById('demande-modal')) return;
  const overlay = document.createElement('div');
  overlay.id = 'demande-modal';
  overlay.className = 'modal-overlay demande-modal-overlay';
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
  document.body.appendChild(overlay);

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
}

function demandeOuvrirModalListe() {
  const overlay = document.getElementById('demande-modal');
  if (!overlay) return;
  demandeRendreListe();
  overlay.classList.add('ouvert');
  document.body.style.overflow = 'hidden';
}

function demandeFermerModalListe() {
  const overlay = document.getElementById('demande-modal');
  if (!overlay) return;
  overlay.classList.remove('ouvert');
  document.body.style.overflow = '';
}

function demandeRendreListe() {
  const conteneur = document.getElementById('demande-modal-liste');
  const totalEl = document.getElementById('demande-modal-total');
  if (!conteneur) return;
  if (!demandeListe.length) {
    conteneur.innerHTML = '<p class="demande-modal-vide">Aucun produit choisi pour le moment.</p>';
    if (totalEl) totalEl.textContent = '';
    return;
  }
  conteneur.innerHTML = demandeListe.map(i => {
    const cle = demandeCle(i.pro_id, i.format_poids, i.format_unite);
    const sousTotal = (i.prix_unitaire || 0) * (i.quantite || 1);
    const prix = (typeof formaterPrix === 'function') ? formaterPrix(sousTotal) : sousTotal.toFixed(2).replace('.', ',') + ' $';
    const photo = i.image_url
      ? '<img src="' + i.image_url + '" alt="" class="demande-item-photo">'
      : '<div class="demande-item-photo demande-item-photo-vide"></div>';
    return '<div class="demande-item" data-cle="' + cle + '" data-pro-id="' + i.pro_id + '" data-poids="' + i.format_poids + '" data-unite="' + i.format_unite + '">' +
        photo +
        '<div class="demande-item-infos">' +
          (i.nom_collection ? '<span class="demande-item-collection">' + i.nom_collection + '</span>' : '') +
          '<span class="demande-item-nom">' + (i.nom_produit || '') + '</span>' +
          '<span class="demande-item-format">' + i.format_poids + ' ' + i.format_unite + '</span>' +
        '</div>' +
        '<div class="demande-item-droite">' +
          '<div class="demande-item-qte">' +
            '<button type="button" data-action="moins" aria-label="Enlever un">−</button>' +
            '<span class="demande-item-qte-nb">' + (i.quantite || 1) + '</span>' +
            '<button type="button" data-action="plus" aria-label="Ajouter un">+</button>' +
          '</div>' +
          '<span class="demande-item-soustotal">' + prix + '</span>' +
          '<button type="button" class="demande-item-retirer" data-action="retirer">Retirer</button>' +
        '</div>' +
      '</div>';
  }).join('');
  if (totalEl) totalEl.textContent = (typeof formaterPrix === 'function') ? formaterPrix(demandeSousTotal()) : demandeSousTotal().toFixed(2).replace('.', ',') + ' $';
}
```

-----

## Bloc 4 — `js/main-demande.js`

On crée la fenêtre au chargement et on branche le clic du cœur (la bulle) pour l’ouvrir.

**TROUVE :**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (!DEMANDE_ACTIVE) return;
  chargerDemandeListe();
  const bulle = document.createElement('div');
  bulle.id = 'demande-bulle';
  bulle.className = 'demande-bulle cache';
  bulle.innerHTML = '<span class="demande-bulle-nb"></span>';
  document.body.appendChild(bulle);
  demandeRafraichirAffichage();
});
```

**REMPLACE par :**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (!DEMANDE_ACTIVE) return;
  chargerDemandeListe();
  const bulle = document.createElement('div');
  bulle.id = 'demande-bulle';
  bulle.className = 'demande-bulle cache';
  bulle.innerHTML = '<span class="demande-bulle-nb"></span>';
  bulle.addEventListener('click', demandeOuvrirModalListe);
  document.body.appendChild(bulle);
  demandeCreerModalListe();
  demandeRafraichirAffichage();
});
```

-----

## Bloc 5 — `css/style.css`

L’allure de la fenêtre, avec tes variables. La fenêtre réutilise tes classes `.modal-overlay` / `.ouvert` (le fond foncé) et ton animation `modalEntre` — donc juste l’intérieur à habiller. Je place ça après la dernière règle « demande ».

**TROUVE :**

```css
.demande-bulle:hover { transform: scale(1.08); }
```

**REMPLACE par :**

```css
.demande-bulle:hover { transform: scale(1.08); }
.demande-modal { background: var(--blanc); width: 92%; max-width: 540px; max-height: 88vh; overflow-y: auto; padding: 32px 28px; position: relative; animation: modalEntre 0.3s ease; }
.demande-modal-fermer { position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; font-size: 1.4rem; line-height: 1; color: var(--gris); padding: 4px 8px; }
.demande-modal-titre { font-family: 'Playfair Display', serif; font-size: var(--texte-150); font-weight: 400; color: var(--gris-fonce); margin-bottom: 24px; padding-right: 32px; }
.demande-modal-liste { display: flex; flex-direction: column; }
.demande-modal-vide { font-family: 'DM Sans', sans-serif; font-size: var(--texte-90); color: var(--gris); padding: 24px 0; }
.demande-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--beige); }
.demande-item-photo { width: 64px; height: 64px; object-fit: cover; flex-shrink: 0; }
.demande-item-photo-vide { background: var(--beige); }
.demande-item-infos { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.demande-item-collection { font-family: 'DM Sans', sans-serif; font-size: var(--texte-70); letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
.demande-item-nom { font-family: 'DM Sans', sans-serif; font-size: var(--texte-95); font-weight: 500; color: var(--gris-fonce); }
.demande-item-format { font-family: 'DM Sans', sans-serif; font-size: var(--texte-82); color: var(--gris); }
.demande-item-droite { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.demande-item-qte { display: flex; align-items: center; gap: 10px; }
.demande-item-qte button { width: 28px; height: 28px; border: 1px solid var(--beige); background: transparent; color: var(--primary); font-size: 1rem; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.demande-item-qte button:hover { border-color: var(--primary); }
.demande-item-qte-nb { font-family: 'DM Sans', sans-serif; font-size: var(--texte-90); color: var(--gris-fonce); min-width: 18px; text-align: center; }
.demande-item-soustotal { font-family: 'Playfair Display', serif; font-size: var(--texte-105); color: var(--primary); }
.demande-item-retirer { background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: var(--texte-70); letter-spacing: 0.08em; text-transform: uppercase; color: var(--danger); padding: 0; }
.demande-item-retirer:hover { text-decoration: underline; }
.demande-modal-pied { display: flex; align-items: center; justify-content: space-between; padding-top: 20px; margin-top: 8px; }
.demande-modal-total-label { font-family: 'DM Sans', sans-serif; font-size: var(--texte-75); letter-spacing: 0.12em; text-transform: uppercase; color: var(--gris); }
.demande-modal-total { font-family: 'Playfair Display', serif; font-size: var(--texte-175); color: var(--primary); }
```

-----

## Pour tester (avec `?test=1`)

1. Recharge la page, choisis quelques formats (le cœur rouge apparaît en haut à gauche avec le nombre).
1. Clique sur le cœur → la fenêtre s’ouvre avec la liste.
1. Vérifie : photo, nom, collection, format, le − nombre +, le sous-total par ligne, le total estimé en bas.
1. Change une quantité → le sous-total, le total et le nombre dans le cœur suivent.
1. « Retirer » enlève la ligne ; retirer le dernier item ferme la fenêtre.
1. Fermer : le ✕ en haut à droite, ou un clic sur le fond foncé.

## Notes pour la suite

- Le total est appelé « Total estimé » (les prix restent à confirmer par toi — non transactionnel).
- Le nombre dans le cœur = nombre de **formats distincts** choisis (pas la somme des quantités). Facile à changer si tu veux le total des quantités.
- **Étape 6 ensuite :** le formulaire de coordonnées (nom, courriel, téléphone, code postal + message), puis l’étape 7 (envoi + page de confirmation).
/* ═══════════════════════════════════════
   UNIVERS CARESSE — demande.js
   Système de demande de commande (étape 2)
   Activé par le flag ?test=1 dans l'URL
   ═══════════════════════════════════════ */

// ─── DÉTECTION DU FLAG TEST ───
const DEMANDE_ACTIVE = true;

// ─── ÉTAT GLOBAL ───
const DEMANDE_STORAGE_KEY = 'uc_demande';
let demandeListe = [];

// ─── CHARGEMENT INITIAL ───
function chargerDemandeListe() {
  try {
    const raw = localStorage.getItem(DEMANDE_STORAGE_KEY);
    demandeListe = raw ? JSON.parse(raw) : [];
  } catch (e) {
    demandeListe = [];
  }
}

// ─── SAUVEGARDE ───
function sauvegarderDemandeListe() {
  try {
    localStorage.setItem(DEMANDE_STORAGE_KEY, JSON.stringify(demandeListe));
  } catch (e) {
    console.error('Erreur sauvegarde liste de demande :', e);
  }
}

// ─── CLÉ UNIQUE D'UN ITEM (pro_id + format) ───
function demandeCle(pro_id, format_poids, format_unite) {
  return String(pro_id) + '|' + String(format_poids) + '|' + String(format_unite);
}

// ─── AJOUTER UN ITEM ───
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

// ─── RETIRER UN ITEM ───
function demandeRetirer(pro_id, format_poids, format_unite) {
  const cle = demandeCle(pro_id, format_poids, format_unite);
  demandeListe = demandeListe.filter(i => demandeCle(i.pro_id, i.format_poids, i.format_unite) !== cle);
  sauvegarderDemandeListe();
  demandeRafraichirAffichage();
}

// ─── CHANGER LA QUANTITÉ ───
function demandeChangerQuantite(pro_id, format_poids, format_unite, delta) {
  const cle = demandeCle(pro_id, format_poids, format_unite);
  const item = demandeListe.find(i => demandeCle(i.pro_id, i.format_poids, i.format_unite) === cle);
  if (!item) return;
  item.quantite = Math.max(1, (item.quantite || 1) + delta);
  sauvegarderDemandeListe();
  demandeRafraichirAffichage();
}

// ─── VÉRIFIER SI UN ITEM PRÉCIS EST DANS LA LISTE ───
function demandeContient(pro_id, format_poids, format_unite) {
  const cle = demandeCle(pro_id, format_poids, format_unite);
  return demandeListe.some(i => demandeCle(i.pro_id, i.format_poids, i.format_unite) === cle);
}

// ─── VÉRIFIER SI UN PRODUIT (TOUS FORMATS) EST DANS LA LISTE ───
function demandeContientProduit(pro_id) {
  return demandeListe.some(i => String(i.pro_id) === String(pro_id));
}

// ─── NOMBRE TOTAL D'ITEMS COCHÉS ───
function demandeNombreItems() {
  return demandeListe.length;
}

// ─── SOUS-TOTAL ───
function demandeSousTotal() {
  return demandeListe.reduce((s, i) => s + (i.prix_unitaire || 0) * (i.quantite || 1), 0);
}

// ─── VIDER LA LISTE (après envoi réussi) ───
function demandeVider() {
  demandeListe = [];
  sauvegarderDemandeListe();
  demandeRafraichirAffichage();
}

// ─── RAFRAÎCHIR L'AFFICHAGE (étoffé aux étapes suivantes) ───
function demandeRafraichirAffichage() {
  if (!DEMANDE_ACTIVE) return;
  // Marquer les cartes dont au moins un format est choisi (cœur rouge)
  document.querySelectorAll('.carte-produit[data-pro-id]').forEach(carte => {
    const coche = demandeContientProduit(carte.dataset.proId);
    carte.classList.toggle('demande-coche', coche);
  });

  // Mettre à jour la bulle compteur
  const bulle = document.getElementById('demande-bulle');
  if (bulle) {
    const nb = demandeNombreItems();
    const nbEl = bulle.querySelector('.demande-bulle-nb');
    if (nbEl) nbEl.textContent = nb;
    bulle.classList.toggle('cache', nb < 1);
  }
}

// ─── CASES À COCHER DANS LA MODAL PRODUIT (étape 2) ───
// Titre + une ligne par format (prix + format + case). Visible seulement si
// DEMANDE_ACTIVE. La ligne de prix existante est cachée pour ne pas la répéter.


function demandeInjecterCasesModal(produit) {
  if (!DEMANDE_ACTIVE) return;
  const hex = document.getElementById('modal-visuel-hex');
  if (!hex) return;

  const ancien = document.getElementById('demande-cases');
  
  if (ancien) ancien.remove();

  const prixFormatEl = document.getElementById('modal-prix-format');
  if (prixFormatEl) prixFormatEl.style.display = 'none';

  const formats = Array.isArray(produit.formats) && produit.formats.length
    ? [...produit.formats].sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids))
    : [];
  if (!formats.length) return;

  const bloc = document.createElement('div');
  bloc.id = 'demande-cases';
  bloc.className = 'demande-cases';

  const titre = document.createElement('div');
  titre.className = 'demande-cases-titre';
  titre.textContent = 'Cochez si ce produit vous intéresse';
  bloc.appendChild(titre);

  formats.forEach(f => {
    const poids = f.poids;
    const unite = f.unite;
    const prix  = parseFloat(f.prix_vente);

    const ligne = document.createElement('div');
    ligne.className = 'demande-case-ligne';

    const texte = document.createElement('span');
    texte.className = 'demande-case-texte';
    texte.textContent = prix.toFixed(2).replace('.', ',') + ' $ / ' + poids + ' ' + unite;

    const coeur = document.createElement('span');
    coeur.className = 'demande-case-coeur';
    let coche = demandeContient(produit.pro_id, poids, unite);
    coeur.textContent = coche ? '♥' : '♡';
    if (coche) coeur.classList.add('coche');

    ligne.addEventListener('click', () => {
      coche = !coche;
      coeur.textContent = coche ? '♥' : '♡';
      coeur.classList.toggle('coche', coche);
      if (coche) {
        demandeAjouter(produit.pro_id, poids, unite, produit.nom, prix, produit.image_url, produit.nom_collection);
      } else {
        demandeRetirer(produit.pro_id, poids, unite);
      }
    });

    ligne.appendChild(texte);
    ligne.appendChild(coeur);
    bloc.appendChild(ligne);
  });

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
        '<div class="form-group"><label class="form-label">Cellulaire <span>*</span></label><input type="tel" class="form-control" id="demande-telephone"></div>' +
        '<div class="form-group"><label class="form-label">Code postal <span>*</span></label><input type="text" class="form-control" id="demande-code-postal"></div>' +
        '<div class="form-group"><label class="form-label">Message</label><textarea class="form-control" id="demande-message"></textarea></div>' +
        '<div id="demande-form-erreur" class="demande-form-erreur cache"></div>' +
        '<button type="button" class="bouton bouton-grand demande-form-envoyer" data-action="envoyer">Envoyer la demande</button>' +
      '</div>' +
      '<div id="demande-vue-merci" class="cache">' +
        '<h2 class="demande-modal-titre">Demande envoyée !</h2>' +
        '<p class="demande-form-intro">Merci ! Nous avons bien reçu votre liste et nous reviendrons vers vous très bientôt pour confirmer les délais, les coûts et la disponibilité.</p>' +
        '<p class="demande-form-intro">Surveillez votre boîte de réception et pensez à vérifier vos pourriels, au cas où.</p>' +
        '<button type="button" class="bouton bouton-grand demande-continuer" data-action="fermer">Fermer</button>' +
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
    const action = btn.dataset.action;
    if (action === 'continuer') { demandeAllerForm(); return; }
    if (action === 'retour')    { demandeRetourListe(); return; }
    if (action === 'envoyer')   { demandeEnvoyer(); return; }
    if (action === 'fermer')    { demandeFermerModalListe(); return; }
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
}

function demandeOuvrirModalListe() {
  const overlay = document.getElementById('demande-modal');
  if (!overlay) return;
  demandeRendreListe();
  demandeRetourListe();
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
  const vueMerci = document.getElementById('demande-vue-merci');
  if (!vueListe || !vueForm) return;
  vueForm.classList.add('cache');
  if (vueMerci) vueMerci.classList.add('cache');
  vueListe.classList.remove('cache');
}

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

  const lignes = demandeListe.map(i => ({
    pro_id: i.pro_id,
    format_poids: i.format_poids,
    format_unite: i.format_unite,
    quantite: i.quantite,
    prix_unitaire: i.prix_unitaire
  }));

  try {
    const res = (typeof appelAPIPost === 'function')
      ? await appelAPIPost('envoyerDemandeCommande', {
          client: nom, courriel, telephone, code_postal: codePostal, message, lignes
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

// ─── INITIALISATION ───
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
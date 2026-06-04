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
function demandeAjouter(pro_id, format_poids, format_unite, nom_produit, prix_unitaire, image_url, nom_collection, nom_gamme) {
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
      nom_gamme,
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
        demandeAjouter(produit.pro_id, poids, unite, produit.nom, prix, produit.image_url, produit.nom_collection, produit.nom_gamme);
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
function formaterTelephone(input) {
  let d = input.value.replace(/\D/g, '').slice(0, 10);
  let out = d;
  if (d.length > 6) out = d.slice(0, 3) + ' ' + d.slice(3, 6) + '-' + d.slice(6);
  else if (d.length > 3) out = d.slice(0, 3) + ' ' + d.slice(3);
  input.value = out;
}

function demandeCreerModalListe() {
  if (document.getElementById('demande-modal')) return;
  const overlay = document.createElement('div');
  overlay.id = 'demande-modal';
  overlay.className = 'modal-overlay demande-modal-overlay';
  overlay.innerHTML =
    '<div class="demande-modal">' +
      '<button class="demande-modal-fermer" type="button" aria-label="Fermer">✕</button>' +
      '<div id="demande-vue-liste">' +
        '<h2 class="demande-modal-titre">Vos Coups de cœur</h2>' +
        '<div class="demande-modal-liste" id="demande-modal-liste"></div>' +
        '<div class="demande-modal-pied">' +
          '<span class="demande-modal-total-label">Total avant les frais de livraison</span>' +
          '<span class="demande-modal-total" id="demande-modal-total"></span>' +
        '</div>' +
        '<button type="button" class="bouton bouton-grand demande-continuer" data-action="continuer">Continuer</button>' +
      '</div>' +
      '<div id="demande-vue-form" class="cache">' +
        '<button type="button" class="demande-retour" data-action="retour">← Retour à la liste</button>' +
        '<h2 class="demande-modal-titre">Coordonnées</h2>' +
        '<p class="demande-form-intro">Inscrivez vos coordonnées, nous vous reviendrons très bientôt pour confirmer la disponibilité des produits et les frais de livraison avant tout engagement.</p>' +
        '<div class="form-group"><label class="form-label">Prénom <span>*</span></label><input type="text" class="form-control" id="demande-prenom"></div>' +
        '<div class="form-group"><label class="form-label">Nom <span>*</span></label><input type="text" class="form-control" id="demande-nom"></div>' +
        '<div class="form-group"><label class="form-label">Courriel <span>*</span></label><input type="email" class="form-control" id="demande-courriel"></div>' +
        '<div class="form-group"><label class="form-label">Cellulaire <span>*</span></label><input type="tel" class="form-control" id="demande-telephone" oninput="formaterTelephone(this)"></div>' +
        '<div class="form-group"><label class="form-label">Code postal <span>*</span></label><input type="text" class="form-control" id="demande-code-postal"></div>' +
        '<div class="form-group"><label class="form-label">Message</label><textarea class="form-control" id="demande-message"></textarea></div>' +
        '<div id="demande-form-erreur" class="demande-form-erreur cache"></div>' +
        '<button type="button" class="bouton bouton-grand demande-form-envoyer" data-action="envoyer">Envoyer vos Coups de coeur</button>' +
      '</div>' +
      '<div id="demande-vue-merci" class="cache">' +
        '<h2 class="demande-modal-titre">Merci de votre intérêt</h2>' +
        '<p class="demande-form-intro">Merci! Nous avons bien reçu vos Coups de coeur. Nous vous reviendrons très bientôt pour confirmer la disponibilité des produits et les frais de livraison. À bientôt!</p>' +
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
          (i.nom_gamme ? '<span class="demande-item-gamme">' + i.nom_gamme + '</span>' : '') +
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
  const prenom     = (document.getElementById('demande-prenom').value || '').trim();
  const nom        = (document.getElementById('demande-nom').value || '').trim();
  const courriel   = (document.getElementById('demande-courriel').value || '').trim();
  const telephone  = (document.getElementById('demande-telephone').value || '').trim();
  const codePostal = (document.getElementById('demande-code-postal').value || '').trim();
  const message    = (document.getElementById('demande-message').value || '').trim();
  const erreurEl   = document.getElementById('demande-form-erreur');
  const btn        = document.querySelector('.demande-form-envoyer');

  if (!prenom || !nom || !courriel || !telephone || !codePostal) {
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

  if (btn) { btn.disabled = true; btn.style.position = 'relative'; btn.insertAdjacentHTML('beforeend', '<div id="demande-spinner-overlay" style="position:absolute;inset:0;background:var(--primary);display:flex;align-items:center;justify-content:center;"><span class=\'spinner\' style=\'margin-right:0\'><span></span><span></span><span></span><span></span><span></span></span></div>'); }

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
          prenom, nom, courriel, telephone, code_postal: codePostal, message, lignes
        })
      : null;
    if (!res || !res.success) throw new Error('Echec envoi');

    demandeVider();
    ['demande-prenom', 'demande-nom', 'demande-courriel', 'demande-telephone', 'demande-code-postal', 'demande-message']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const vueForm  = document.getElementById('demande-vue-form');
    const vueMerci = document.getElementById('demande-vue-merci');
    if (vueForm)  vueForm.classList.add('cache');
    if (vueMerci) vueMerci.classList.remove('cache');
  } catch (err) {
    erreurEl.textContent = "Une erreur s'est produite. Veuillez réessayer ou nous écrire directement.";
    erreurEl.classList.remove('cache');
  }
  if (btn) { btn.disabled = false; const ov = document.getElementById('demande-spinner-overlay'); if (ov) ov.remove(); }
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


// ── Étape 3 — afficher la commande dans la liste de coups de cœur ──
window.addEventListener('DOMContentLoaded', async function () {
  const params = new URLSearchParams(window.location.search);
  const numero = params.get('cmd');
  const jeton = params.get('jeton');
  if (!numero) return;

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById('section-coupdecoeur');
  if (section) section.classList.add('active');
  const zone = document.getElementById('coupdecoeur-commande');

  try {
    if (typeof appelAPIPost !== 'function') { if (zone) zone.textContent = 'appelAPIPost absent'; return; }
    const res = await appelAPIPost('getCommandePublique', { cmd_id: numero, jeton: jeton });
    if (!res)         { if (zone) zone.textContent = 'Aucune réponse du serveur'; return; }
    if (!res.success) { if (zone) zone.textContent = 'Réponse : ' + (res.message || 'échec'); return; }

    if (res.statut !== 'En attente de paiement') {
      demandeVider();
      if (zone) zone.innerHTML = '';
      const bloque = document.getElementById('coupdecoeur-bloque');
      if (bloque) {
        bloque.classList.remove('cache');
        bloque.innerHTML = '<p>Cette commande ne peut plus être modifiée.</p>' +
          '<button type="button" class="bouton bouton-grand" onclick="naviguer(\'accueil\')">Fermer</button>';
      }
      return;
    }

    demandeListe = res.lignes.map(l => ({
      pro_id: l.pro_id, format_poids: l.format_poids, format_unite: l.format_unite,
      nom_produit: l.nom, prix_unitaire: l.prix_unitaire, image_url: l.image_url,
      nom_collection: l.nom_collection, nom_gamme: l.nom_gamme, quantite: l.quantite
    }));
    sauvegarderDemandeListe();
    demandeRafraichirAffichage();

    function coupdecoeurRendre() {
      if (!zone) return;
      if (!demandeListe.length) {
        zone.innerHTML = '<h2 class="titre">Vos Coups de cœur</h2>' +
          '<p class="textes-discrets">Vous avez retiré tous les produits. Si c\'est une erreur, rechargez la page.</p>' +
          '<button type="button" class="bouton bouton-grand" onclick="naviguer(\'accueil\')">Fermer</button>';
        return;
      }
      let total = 0;
      let html = '';
      demandeListe.forEach(i => {
        const sous = (i.prix_unitaire || 0) * (i.quantite || 1);
        total += sous;
        const cle = i.pro_id + '|' + i.format_poids + '|' + i.format_unite;
        html += '<div class="rangeeitem" data-cle="' + cle + '">' +
            '<div class="rangeeitem-info">' +
              '<div class="rangeeitem-titre">' + (i.nom_produit || i.pro_id) + '</div>' +
              '<div class="rangeeitem-meta">' + i.format_poids + ' ' + i.format_unite + '</div>' +
            '</div>' +
            '<div class="compteur">' +
              '<button type="button" class="compteur-btn" data-action="moins">−</button>' +
              '<span class="compteur-valeur">' + (i.quantite || 1) + '</span>' +
              '<button type="button" class="compteur-btn" data-action="plus">+</button>' +
            '</div>' +
            '<button type="button" class="bouton bouton-contour bouton-petit" data-action="retirer">Retirer</button>' +
            '<div class="rangeeitem-valeur">' + sous.toFixed(2).replace('.', ',') + ' $</div>' +
          '</div>';
      });
      html += '<div class="lignetotal"><span class="lignetotal-libelle">Total avant les frais de livraison</span>' +
        '<span>' + total.toFixed(2).replace('.', ',') + ' $</span></div>' +
        '<button type="button" class="bouton bouton-grand" data-action="renvoyer">Renvoyer ma liste</button>' +
        '<div id="coupdecoeur-msg" class="cache"></div>';
      zone.innerHTML = html;
    }

    if (zone) zone.addEventListener('click', async function (ev) {
      const btn = ev.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'renvoyer') {
        btn.disabled = true;
        const msg = document.getElementById('coupdecoeur-msg');
        try {
          const lignes = demandeListe.map(i => ({
            pro_id: i.pro_id, format_poids: i.format_poids, format_unite: i.format_unite,
            quantite: i.quantite, prix_unitaire: i.prix_unitaire
          }));
          const r = await appelAPIPost('renvoyerListeCoupdecoeur', { cmd_id: numero, lignes, jeton: jeton });
          if (r && r.success) {
            zone.innerHTML = '<h2 class="demande-modal-titre">Merci !</h2>' +
              '<p>Votre liste modifiée a bien été envoyée. Nous vous reviendrons très bientôt.</p>' +
              '<button type="button" class="bouton bouton-grand" onclick="naviguer(\'accueil\')">Fermer</button>';
          } else {
            if (msg) { msg.textContent = 'Erreur : ' + ((r && r.message) || 'envoi échoué'); msg.classList.remove('cache'); }
            btn.disabled = false;
          }
        } catch (e) {
          if (msg) { msg.textContent = 'Erreur : ' + e.message; msg.classList.remove('cache'); }
          btn.disabled = false;
        }
        return;
      }

      const ligne = btn.closest('[data-cle]');
      if (!ligne) return;
      const [pro_id, fp, fu] = ligne.dataset.cle.split('|');
      if (action === 'plus')    demandeChangerQuantite(pro_id, fp, fu, 1);
      if (action === 'moins')   demandeChangerQuantite(pro_id, fp, fu, -1);
      if (action === 'retirer') demandeRetirer(pro_id, fp, fu);
      coupdecoeurRendre();
    });

    coupdecoeurRendre();
  } catch (e) {
    if (zone) zone.textContent = 'Erreur : ' + e.message;
  }
});
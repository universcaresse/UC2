/* ═══════════════════════════════════════
   UNIVERS CARESSE — demande.js
   Système de demande de commande (étape 2)
   ═══════════════════════════════════════ */

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
  if (typeof couleurTexteContraste === 'function' && couleurTexteContraste(produit.couleur_hex) === 'carte-infos-fonce') bloc.classList.add('demande-cases-fonce');

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

// ─── CONTACT PRÉ-REMPLI (commande) ───
function ouvrirContactCommande(res, numero) {
  naviguer('contact');
  const elP = document.getElementById('prenom');
  const elN = document.getElementById('nom');
  const elC = document.getElementById('courriel');
  const elS = document.getElementById('sujet');
  const elM = document.getElementById('message');
  if (elP) elP.value = (res && res.prenom) || '';
  if (elN) elN.value = (res && res.nom) || '';
  if (elC) elC.value = (res && res.courriel) || '';
  if (elS) {
    const opt = document.createElement('option');
    opt.value = 'Question — ' + numero;
    opt.textContent = 'Question — ' + numero;
    opt.selected = true;
    elS.appendChild(opt);
  }
  if (elM) elM.value = '';
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
  overlay.className = 'voile';
  overlay.innerHTML =
    '<div class="modale">' +
      '<div class="modale-entete">' +
        '<span class="titre" id="demande-titre">Vos Coups de cœur</span>' +
        '<button class="boutons-fermer demande-modal-fermer" type="button" aria-label="Fermer">✕</button>' +
      '</div>' +
      '<div class="modale-corps">' +
      '<div id="demande-vue-liste">' +
        '<div class="demande-modal-liste" id="demande-modal-liste"></div>' +
        '<div class="lignetotal">' +
          '<span class="lignetotal-libelle">Total avant les frais de livraison</span>' +
          '<span id="demande-modal-total"></span>' +
        '</div>' +
		
        '<button type="button" class="boutons boutons-contour boutons-pleine-largeur demande-continuer" data-action="ajouter-produits">Ajouter d\'autres produits</button>' +
		
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur demande-continuer" data-action="continuer">Continuer</button>' +
        '<button type="button" class="boutons boutons-contour boutons-pleine-largeur cache" data-action="annuler-modif">Je ne veux plus donner suite, annuler cette demande s.v.p.</button>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur cache" data-action="fermer-modif">Fermer. Vos coups de cœur ne seront pas modifiés</button>' +
      '</div>' +
      '<div id="demande-vue-form" class="cache">' +
        '<button type="button" class="demande-retour" data-action="retour">← Retour à la liste</button>' +
        
        '<p class="demande-form-intro">Inscrivez vos coordonnées, nous vous reviendrons très bientôt pour confirmer la disponibilité des produits et les frais de livraison.</p>' +
        '<div class="form-group"><label class="form-label">Prénom <span>*</span></label><input type="text" class="form-control" id="demande-prenom"></div>' +
        '<div class="form-group"><label class="form-label">Nom <span>*</span></label><input type="text" class="form-control" id="demande-nom"></div>' +
        '<div class="form-group"><label class="form-label">Courriel <span>*</span></label><input type="email" class="form-control" id="demande-courriel"></div>' +
        '<div class="form-group"><label class="form-label">Cellulaire (pour confirmation par texto) <span>*</span></label><input type="tel" class="form-control" id="demande-telephone" oninput="formaterTelephone(this)"></div>' +
        '<div class="form-group"><label class="form-label">Code postal (pour Poste Canada)<span>*</span></label><input type="text" class="form-control" id="demande-code-postal"></div>' +
        '<div class="form-group"><label class="form-label">Message</label><textarea class="form-control" id="demande-message"></textarea></div>' +
        '<div id="demande-form-erreur" class="demande-form-erreur cache"></div>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur demande-form-envoyer" data-action="envoyer">Envoyer vos Coups de coeur</button>' +
      '</div>' +
      '<div id="demande-vue-merci" class="cache">' +
        
        '<p class="demande-form-intro">Merci! Nous avons bien reçu vos Coups de coeur. Nous vous reviendrons très bientôt pour confirmer la disponibilité des produits et les frais de livraison. À bientôt!</p>' +
        '<p class="demande-form-intro">Surveillez votre boîte de réception et pensez à vérifier vos pourriels, au cas où.</p>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur demande-continuer" data-action="fermer">Fermer</button>' +
      '</div>' +
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
    if (action === 'continuer') {
      let modif = null;
      try { modif = JSON.parse(localStorage.getItem('uc_modif_cmd') || 'null'); } catch (e) {}
      if (modif && modif.cmd) { demandeRenvoyerModif(); return; }
      demandeAllerForm();
      return;
    }
    if (action === 'ajouter-produits') { demandeFermerModalListe(); naviguer('catalogue'); return; }
    if (action === 'retour')    { demandeRetourListe(); return; }
    if (action === 'envoyer')   { demandeEnvoyer(); return; }
    if (action === 'fermer')    { demandeFermerModalListe(); return; }
    if (action === 'annuler-modif') {
      let m = null;
      try { m = JSON.parse(localStorage.getItem('uc_modif_cmd') || 'null'); } catch (e) {}
      demandeFermerModalListe();
      if (m && m.cmd) location.href = location.pathname + '?cmd=' + encodeURIComponent(m.cmd) + '&jeton=' + encodeURIComponent(m.jeton);
      return;
    }
    if (action === 'fermer-modif') { demandeFermerModalListe(); naviguer('accueil'); return; }
    const ligne = btn.closest('[data-cle]');
    if (!ligne) return;
    const pro_id = ligne.dataset.proId;
    const poids  = ligne.dataset.poids;
    const unite  = ligne.dataset.unite;
    if (action === 'moins')        demandeChangerQuantite(pro_id, poids, unite, -1);
    else if (action === 'plus')    demandeChangerQuantite(pro_id, poids, unite, 1);
    else if (action === 'retirer') demandeRetirer(pro_id, poids, unite);
    if (demandeNombreItems() < 1) {
      let m = null;
      try { m = JSON.parse(localStorage.getItem('uc_modif_cmd') || 'null'); } catch (e) {}
      if (!(m && m.cmd)) { demandeFermerModalListe(); return; }
      demandeRendreListe();
      const vue = document.getElementById('demande-vue-liste');
      if (vue) {
        vue.querySelector('[data-action="continuer"]').classList.add('cache');
        vue.querySelector('[data-action="annuler-modif"]').classList.remove('cache');
        vue.querySelector('[data-action="fermer-modif"]').classList.remove('cache');
      }
      return;
    }
    demandeRendreListe();
  });
}

function demandeOuvrirModalListe() {
  const overlay = document.getElementById('demande-modal');
  if (!overlay) return;
  demandeRendreListe();
  demandeRetourListe();
  const vueL = document.getElementById('demande-vue-liste');
  if (vueL) {
    vueL.querySelector('[data-action="continuer"]').classList.remove('cache');
    vueL.querySelector('[data-action="annuler-modif"]').classList.add('cache');
    vueL.querySelector('[data-action="fermer-modif"]').classList.add('cache');
  }
  let modif = null;
  try { modif = JSON.parse(localStorage.getItem('uc_modif_cmd') || 'null'); } catch (e) {}
  const merciP = overlay.querySelector('#demande-vue-merci p.demande-form-intro');
  if (merciP) merciP.textContent = (modif && modif.cmd)
    ? 'Merci! Votre liste modifiée a bien été envoyée. Nous vous reviendrons très bientôt avec une proposition ajustée.'
    : 'Merci! Nous avons bien reçu vos Coups de coeur. Nous vous reviendrons très bientôt pour confirmer la disponibilité des produits et les frais de livraison. À bientôt!';
  const contBtn = overlay.querySelector('[data-action="continuer"]');
  if (contBtn) contBtn.textContent = (modif && modif.cmd) ? 'S.V.P mettre à jour la liste' : 'Continuer';
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
    let mCmd = null;
    try { mCmd = JSON.parse(localStorage.getItem('uc_modif_cmd') || 'null'); } catch (e) {}
    conteneur.innerHTML = (mCmd && mCmd.cmd)
      ? '<p class="textes-discrets">Vous avez retiré tous les produits. Ajoutez-en au moins un pour nous envoyer votre liste, ou utilisez le bouton d\'annulation si vous ne souhaitez plus donner suite.</p>'
      : '<p class="textes-discrets">Aucun produit choisi pour le moment.</p>';
    if (totalEl) {
      totalEl.textContent = '';
      totalEl.closest('.lignetotal')?.classList.add('cache');
    }
    return;
  }
  conteneur.innerHTML = demandeListe.map(i => {
    const cle = demandeCle(i.pro_id, i.format_poids, i.format_unite);
    const sousTotal = (i.prix_unitaire || 0) * (i.quantite || 1);
    const prix = (typeof formaterPrix === 'function') ? formaterPrix(sousTotal) : sousTotal.toFixed(2).replace('.', ',') + ' $';
    // 19 nov. 2026 : tout ce qui vient de la liste (gardée dans le navigateur ou renvoyée par le serveur) est échappé.
    const photo = i.image_url
      ? '<img src="' + echapperHtml(i.image_url) + '" alt="" class="rangeeitem-photo">'
      : '<div class="rangeeitem-photo"></div>';
    return '<div class="rangeeitem" data-cle="' + echapperHtml(cle) + '" data-pro-id="' + echapperHtml(i.pro_id) + '" data-poids="' + echapperHtml(i.format_poids) + '" data-unite="' + echapperHtml(i.format_unite) + '">' +
        photo +
        '<div class="rangeeitem-info">' +
          '<div class="rangeeitem-titre">' + echapperHtml(i.nom_produit || '') + '</div>' +
          '<div class="rangeeitem-meta">' + (i.nom_collection ? echapperHtml(i.nom_collection) + ' · ' : '') + (i.nom_gamme ? echapperHtml(i.nom_gamme) + ' · ' : '') + echapperHtml(i.format_poids + ' ' + i.format_unite) + '</div>' +
        '</div>' +
        '<div class="compteur">' +
          '<button type="button" class="compteur-btn" data-action="moins" aria-label="Enlever un">−</button>' +
          '<span class="compteur-valeur">' + (i.quantite || 1) + '</span>' +
          '<button type="button" class="compteur-btn" data-action="plus" aria-label="Ajouter un">+</button>' +
        '</div>' +
        '<button type="button" class="boutons boutons-contour boutons-petit" data-action="retirer">Retirer</button>' +
        '<span class="rangeeitem-valeur">' + prix + '</span>' +
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
  const titre = document.getElementById('demande-titre');
  if (titre) titre.textContent = 'Coordonnées';
}

function demandeRetourListe() {
  const vueListe = document.getElementById('demande-vue-liste');
  const vueForm  = document.getElementById('demande-vue-form');
  const vueMerci = document.getElementById('demande-vue-merci');
  if (!vueListe || !vueForm) return;
  vueForm.classList.add('cache');
  if (vueMerci) vueMerci.classList.add('cache');
  vueListe.classList.remove('cache');
  const titre = document.getElementById('demande-titre');
  if (titre) titre.textContent = 'Vos Coups de cœur';
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
  const cpNettoye = codePostal.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cpNettoye)) {
    erreurEl.textContent = 'Veuillez vérifier votre code postal (exemple : A1A 1A1).';
    erreurEl.classList.remove('cache');
    return;
  }
  const codePostalFormate = cpNettoye.slice(0, 3) + ' ' + cpNettoye.slice(3);
  erreurEl.classList.add('cache');

  if (btn) btn.disabled = true;
  montrerVoile();

  const lignes = demandeListe.map(i => ({
    pro_id: i.pro_id,
    format_poids: i.format_poids,
    format_unite: i.format_unite,
    quantite: i.quantite,
    prix_unitaire: i.prix_unitaire,
    nom_collection: i.nom_collection,
    nom_gamme: i.nom_gamme
  }));

  try {
    const res = (typeof appelAPIPost === 'function')
      ? await appelAPIPost('envoyerDemandeCommande', {
          prenom, nom, courriel, telephone, code_postal: codePostalFormate, message, lignes
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
    const titreM = document.getElementById('demande-titre');
    if (titreM) titreM.textContent = 'Merci de votre intérêt';
  } catch (err) {
    erreurEl.textContent = "Une erreur s'est produite. Veuillez réessayer ou nous écrire à universcaresse@outlook.com.";
    erreurEl.classList.remove('cache');
  }
  cacherVoile();
  if (btn) btn.disabled = false;
}

async function demandeRenvoyerModif() {
  let modif = null;
  try { modif = JSON.parse(localStorage.getItem('uc_modif_cmd') || 'null'); } catch (e) {}
  if (!modif || !modif.cmd) { demandeAllerForm(); return; }
  const vueListe = document.getElementById('demande-vue-liste');
  const vueMerci = document.getElementById('demande-vue-merci');
  const btn = document.querySelector('#demande-vue-liste [data-action="continuer"]');
  if (btn) btn.disabled = true;
  montrerVoile();
  const lignes = demandeListe.map(i => ({
    pro_id: i.pro_id, format_poids: i.format_poids, format_unite: i.format_unite,
    quantite: i.quantite, prix_unitaire: i.prix_unitaire
  }));
  try {
    const r = (typeof appelAPIPost === 'function')
      ? await appelAPIPost('renvoyerListeCoupdecoeur', { cmd_id: modif.cmd, lignes, jeton: modif.jeton })
      : null;
    if (!r || !r.success) throw new Error((r && r.message) || 'échec');
    try { localStorage.removeItem('uc_modif_cmd'); } catch (e) {}
    cacherVoile();
    demandeVider();
    if (vueListe) vueListe.classList.add('cache');
    if (vueMerci) vueMerci.classList.remove('cache');
    const titreR = document.getElementById('demande-titre');
    if (titreR) titreR.textContent = 'Merci de votre intérêt';
  } catch (err) {
    cacherVoile();
    if (btn) { btn.disabled = false; btn.textContent = 'Erreur — réessayer'; }
  }
}

// ─── INITIALISATION ───
document.addEventListener('DOMContentLoaded', () => {
  if (!DEMANDE_ACTIVE) return;
  // Le repère de modification survit à la navigation dans le site (catalogue → bulle)
  // grâce au drapeau de session « uc_modif_active ». Mais si ce drapeau est absent, c'est
  // une visite fraîche (nouvel onglet, jours plus tard) : un vieux repère qui traînerait
  // est alors une commande abandonnée, on l'efface pour repartir sur une demande neuve.
  try {
    const surUneCommande = new URLSearchParams(window.location.search).get('cmd');
    if (!surUneCommande && !sessionStorage.getItem('uc_modif_active') && localStorage.getItem('uc_modif_cmd')) {
      localStorage.removeItem('uc_modif_cmd');
      localStorage.removeItem(DEMANDE_STORAGE_KEY);
    }
  } catch (e) {}
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

  // Retour de Square (page Merci) : on ferme le lien de paiement en arrière-plan
  // et on n'ouvre pas la page commande par-dessus la page Merci.
  if (params.get('paiement') === 'recu') {
    try {
      if (typeof appelAPIPost === 'function') appelAPIPost('fermerLienSquareCommande', { cmd_id: numero, jeton: jeton });
    } catch (e) {}
    return;
  }

  if (params.get('action') === 'question') {
    if (typeof naviguer === 'function') naviguer('contact');
    const nomComplet = params.get('nom') || '';
    const courrielQ  = params.get('courriel') || '';
    const sp = nomComplet.indexOf(' ');
    const elP = document.getElementById('prenom');
    const elN = document.getElementById('nom');
    const elC = document.getElementById('courriel');
    const elS = document.getElementById('sujet');
    if (elP) elP.value = sp > -1 ? nomComplet.slice(0, sp) : nomComplet;
    if (elN) elN.value = sp > -1 ? nomComplet.slice(sp + 1) : nomComplet;
    if (elC) elC.value = courrielQ;
    if (elS) {
      const opt = document.createElement('option');
      opt.value = 'Question — ' + numero;
      opt.textContent = 'Question — ' + numero;
      opt.selected = true;
      elS.appendChild(opt);
    }
    return;
  }

  if (params.get('action') === 'payer') {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('section-coupdecoeur');
    if (sec) sec.classList.add('active');
    const z = document.getElementById('coupdecoeur-commande');
    if (z) z.innerHTML = '<div class="chargement"><div class="chargement-spinner"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>Chargement…</div>';
    try {
      if (typeof appelAPIPost !== 'function') { if (z) z.textContent = 'appelAPIPost absent'; return; }
      const r = await appelAPIPost('getCommandePublique', { cmd_id: numero, jeton: jeton });
      window.ucCommandeVue = r;
      window.ucCommandeNumero = numero;
      // Des produits à venir : la cliente répond d'abord sur sa page (garder / laisser tomber), puis paie (18 nov. 2026)
      if (r && r.success && r.statut === 'En attente de paiement' && r.choix_cliente !== 'recevoir' &&
          (r.lignes || []).some(l => l.type_ligne === 'temporaire')) {
        afficherPageUniqueBloc2(r, numero, jeton);
        return;
      }
      if (r && r.success && r.statut === 'En attente de paiement' && r.lien_square) {
        // Avant d'offrir le paiement : vérifier que le lien Square est encore vivant.
        const verif = await appelAPIPost('verifierLienSquareCommande', { cmd_id: numero, jeton: jeton });
        if (verif && verif.success && verif.valide === false) {
          if (z) z.innerHTML = '<h2 class="titre">Paiement</h2>' +
            '<p class="textes-discrets">Cette proposition a dépassé son délai de validité. Comme les produits sont faits à la main et en petites quantités, les disponibilités changent — nous préférons revalider avec vous plutôt que de vous décevoir. Écrivez-nous et nous préparerons une proposition à jour.</p>' +
            '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" id="dep-ecrivez">Écrivez-nous</button>';
          const bDep = document.getElementById('dep-ecrivez');
          if (bDep) bDep.addEventListener('click', function () { ouvrirContactCommande(r, numero); });
          return;
        }
        const provinces = ['QC','ON','NB','NS','PE','NL','MB','SK','AB','BC','YT','NT','NU'];
        const nomComplet = ((r.prenom || '') + ' ' + (r.nom || '')).trim();
        const optionsProv = provinces.map(function(p){ return '<option value="' + p + '"' + (r.province === p ? ' selected' : '') + '>' + p + '</option>'; }).join('');
        if (z) z.innerHTML = '<h2 class="titre">Adresse de livraison</h2>' +
          '<p class="textes-discrets">Avant le paiement, confirmez votre adresse pour la livraison. Disponible pour le Canada seulement.</p>' +
          '<div class="champ"><label class="libelle">Rue <span>*</span></label><input type="text" class="controle" id="adr-rue" value="' + echapperHtml(r.rue || '') + '"></div>' +
          '<div class="champ"><label class="libelle">Ville <span>*</span></label><input type="text" class="controle" id="adr-ville" value="' + echapperHtml(r.ville || '') + '"></div>' +
          '<div class="champ"><label class="libelle">Province <span>*</span></label><select class="controle" id="adr-province"><option value="">— Choisir —</option>' + optionsProv + '</select></div>' +
          '<div class="champ"><label class="libelle">Code postal</label><input type="text" class="controle" id="adr-code-postal" value="' + echapperHtml(r.code_postal || '') + '" readonly><p class="textes-discrets">Les frais de livraison sont calculés avec ce code postal. Pour le changer, écrivez-nous.</p></div>' +
          '<div class="champ"><label class="libelle"><input type="checkbox" id="adr-infolettre"> Je souhaite recevoir l\'infolettre par courriel</label></div>' +
          '<div id="adr-erreur" class="demande-form-erreur cache"></div>' +
          '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" id="adr-continuer">Continuer vers le paiement</button>';
       const btnAdr = document.getElementById('adr-continuer');
      
if (btnAdr) btnAdr.addEventListener('click', async function () {
  const rue        = (document.getElementById('adr-rue').value || '').trim();
  const ville      = (document.getElementById('adr-ville').value || '').trim();
  const province   = (document.getElementById('adr-province').value || '').trim();
  const cp         = (document.getElementById('adr-code-postal').value || '').trim();
  const infolettre = document.getElementById('adr-infolettre').checked;
  const err        = document.getElementById('adr-erreur');
  if (!rue || !ville || !province || !cp) {
    if (err) { err.textContent = 'Veuillez remplir tous les champs.'; err.classList.remove('cache'); }
    return;
  }
  if (err) err.classList.add('cache');
  const champsAdr = ['adr-rue', 'adr-ville', 'adr-province', 'adr-code-postal', 'adr-infolettre'];
  btnAdr.disabled = true; btnAdr.textContent = 'Un instant…';
  champsAdr.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = true; });
  try {
    const sav = await appelAPIPost('enregistrerAdresseCommande', { cmd_id: numero, jeton: jeton, rue: rue, ville: ville, province: province, code_postal: cp, infolettre: infolettre });
    if (sav && sav.success) {
      window.location.href = r.lien_square;
    } else {
      if (err) { err.innerHTML = 'Erreur : ' + ((sav && sav.message) || 'réessayez') + ' — <a href="#" class="lien-discret" id="adr-ecrivez">Écrivez-nous</a>'; err.classList.remove('cache');
        var aEcr = document.getElementById('adr-ecrivez');
        if (aEcr) aEcr.addEventListener('click', function (ev) { ev.preventDefault(); ouvrirContactCommande(r, numero); }); }
      btnAdr.disabled = false; btnAdr.textContent = 'Continuer vers le paiement';
      champsAdr.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = false; });
    }
  } catch (e2) {
    if (err) { err.innerHTML = 'Erreur : ' + e2.message + ' — <a href="#" class="lien-discret" id="adr-ecrivez2">Écrivez-nous</a>'; err.classList.remove('cache');
      var aEcr2 = document.getElementById('adr-ecrivez2');
      if (aEcr2) aEcr2.addEventListener('click', function (ev) { ev.preventDefault(); ouvrirContactCommande(r, numero); }); }
    btnAdr.disabled = false; btnAdr.textContent = 'Continuer vers le paiement';
    champsAdr.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = false; });
  }
});



        
        return;
      }
      if (z) z.innerHTML = '<h2 class="titre">Paiement</h2>' +
        '<p class="textes-discrets">Cette commande n\'est plus ouverte au paiement. Si vous souhaitez la reprendre, écrivez-nous : nous la préparerons à nouveau avec plaisir.</p>' +
        '<p class="textes-discrets"><a href="#" class="lien-discret" onclick="ouvrirContactCommande(window.ucCommandeVue, window.ucCommandeNumero); return false;">Une question? Écrivez-nous.</a></p>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
    } catch (e) {
      if (z) z.textContent = 'Erreur : ' + e.message;
    }
    return;
  }

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById('section-coupdecoeur');
  if (section) section.classList.add('active');
  const zone = document.getElementById('coupdecoeur-commande');
  if (zone) zone.innerHTML = '<div class="chargement"><div class="chargement-spinner"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>Chargement…</div>';

  try {
    if (typeof appelAPIPost !== 'function') { if (zone) zone.textContent = 'appelAPIPost absent'; return; }
    const res = await appelAPIPost('getCommandePublique', { cmd_id: numero, jeton: jeton });
    if (!res)         { if (zone) zone.textContent = 'Aucune réponse du serveur'; return; }
    if (!res.success) {
      if (zone) zone.innerHTML = '<h2 class="titre">Merci de votre intérêt</h2>' +
        '<p class="textes-discrets">Nous n\'avons pas pu ouvrir votre commande. Écrivez-nous et nous allons vous aider.</p>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="ouvrirContactCommande(null, \'' + numero + '\'); return false;">Écrivez-nous</button>';
      return;
    }

    // Vieux courriel de proposition : une plus récente existe
    const propParam = parseInt(params.get('prop') || '0', 10);
    if (propParam && res.date_prop && (res.date_prop - propParam) > 60000) {
      demandeVider();
      if (zone) zone.innerHTML = '<h2 class="titre">Une nouvelle proposition vous a été envoyée le ' + new Date(res.date_prop).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }) + '.</h2>' +
        '<p class="textes-discrets">Ce courriel n\'est plus à jour. Retrouvez la proposition la plus récente dans vos courriels, ou recevez-la à nouveau.</p>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" id="prop-renvoyer2">Recevez à nouveau votre proposition</button>' +
        '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" id="prop-ecrivez2">Écrivez-nous</button>' +
        '<p class="textes-discrets cache" id="prop-renvoyer2-msg"></p>';
      var bEcr2 = document.getElementById('prop-ecrivez2');
      if (bEcr2) bEcr2.addEventListener('click', function () { ouvrirContactCommande(res, numero); });
      var bR2 = document.getElementById('prop-renvoyer2');
      if (bR2) bR2.addEventListener('click', async function () {
        var msgR2 = document.getElementById('prop-renvoyer2-msg');
        bR2.disabled = true;
        var rR2 = (typeof appelAPIPost === 'function') ? await appelAPIPost('renvoyerCopieProposition', { cmd_id: numero, jeton: jeton }) : null;
        if (rR2 && rR2.success) { if (msgR2) { msgR2.textContent = 'C\'est envoyé, vérifiez vos courriels (pensez aux indésirables).'; msgR2.classList.remove('cache'); } }
        else { if (msgR2) { msgR2.textContent = 'Erreur : ' + ((rR2 && rR2.message) || 'échec'); msgR2.classList.remove('cache'); bR2.disabled = false; } }
      });
      return;
    }

    // « J'ai changé d'idée » (courriels de la demande et de la liste modifiée) : l'écran d'annulation tout de suite
    // (19 nov. 2026 : avant, le lien ouvrait la liste, ou un refus pour une liste « À retravailler »).
    if (params.get('action') === 'annuler' && ['En attente', 'En attente de paiement', 'À retravailler'].indexOf(res.statut) > -1) {
      afficherAnnulationCommande(zone, numero, jeton);
      return;
    }

    if (res.statut !== 'En attente de paiement' && res.statut !== 'En attente') {
      demandeVider();
      if (zone) zone.innerHTML = '';
      const bloque = document.getElementById('coupdecoeur-bloque');
      if (bloque) {
        bloque.classList.remove('cache');
        const ouvrirContactBloque = function (e) {
          if (e) e.preventDefault();
          ouvrirContactCommande(res, numero);
        };
        if (res.statut === 'Terminée') {
          const lienSuiviT = res.no_tracage ? 'https://www.canadapost-postescanada.ca/track-reperage/fr#/details/' + encodeURIComponent(res.no_tracage) : '';
          // Sans numéro de suivi, la commande a été livrée en personne
          bloque.innerHTML = '<p class="titre">' + (res.no_tracage ? 'Votre commande est en route!' : 'Votre commande a été livrée.') + '</p>' +
            (lienSuiviT ? '<p class="textes-discrets"><a href="' + lienSuiviT + '" target="_blank" class="lien-discret">Suivre le colis — ' + echapperHtml(res.no_tracage) + '</a></p>' : '') +
            '<p><a href="#" class="lien-discret" id="bloque-ecrivez">Une question? Écrivez-nous.</a></p>' +
            '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
        } else {
          const messageBloque = (res.statut === 'À expédier')
            ? 'Votre commande est en traitement — elle ne peut plus être modifiée.'
            : (res.statut === 'En attente de réapprovisionnement')
              ? 'C\'est noté : nous vous recontacterons dès que tout sera prêt.'
              : (res.statut === 'À retravailler')
                ? 'Votre liste modifiée est bien reçue : nous vous reviendrons avec une nouvelle proposition.'
                : (res.statut === 'Verrouillée')
                  ? 'Nous préparons votre proposition en ce moment : elle vous arrivera par courriel sous peu.'
                  : (res.statut === 'Annulée')
                    ? 'Cette commande est annulée.'
                    : (res.statut === 'Payée — facture à faire')
                      ? 'Votre paiement est reçu : la commande est en préparation.'
                      : 'Cette commande ne peut plus être modifiée ni annulée.';
          bloque.innerHTML = '<p class="titre">Merci de votre intérêt</p>' +
            '<p class="textes-discrets">' + messageBloque + '</p>' +
            '<p><a href="#" class="lien-discret" id="bloque-ecrivez">Une question? Écrivez-nous.</a></p>' +
            '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
        }
        const lienEcrivez = document.getElementById('bloque-ecrivez');
        if (lienEcrivez) lienEcrivez.addEventListener('click', ouvrirContactBloque);
      }
      return;
    }

    const aDesTemporaires = res.lignes.some(l => l.type_ligne === 'temporaire');
    const aDesDefinitifs  = res.lignes.some(l => l.type_ligne === 'definitif');
    const estBloc2ou3 = aDesTemporaires || aDesDefinitifs;

    // Sorte 2 : la page à trois sections (18 nov. 2026 : avant, elle était aussitôt écrasée par la liste
    // ordinaire). « Modifier la liste » y ramène ici avec action=modifier-liste.
    if (estBloc2ou3 && res.statut === 'En attente de paiement' && params.get('action') !== 'modifier-liste') {
      afficherPageUniqueBloc2(res, numero, jeton);
      return;
    }

    {
      // Proposition déjà envoyée (statut « En attente de paiement ») : on NE laisse PAS
      // modifier/renvoyer depuis le 1er courriel (ça effacerait la proposition). On guide
      // le client vers le paiement, ou vers Contact.
      if (res.statut === 'En attente de paiement' && params.get('action') !== 'modifier' && params.get('action') !== 'modifier-liste') {
        if (zone) zone.innerHTML = '<h2 class="titre">Une proposition vous a été envoyée pour cette commande.</h2>' +
          '<p class="textes-discrets">Nous vous avons envoyé une proposition par courriel, avec les prix et la livraison. Si vous ne la retrouvez pas...</p>' +
          '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" id="prop-renvoyer">Recevez à nouveau votre proposition</button>' +
          '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" id="prop-ecrivez">Écrivez-nous</button>' +
          '<p class="textes-discrets cache" id="prop-renvoyer-msg"></p>';
        var bEcr = document.getElementById('prop-ecrivez');
        if (bEcr) bEcr.addEventListener('click', function () { ouvrirContactCommande(res, numero); });
        var bRenvoyer = document.getElementById('prop-renvoyer');
        if (bRenvoyer) bRenvoyer.addEventListener('click', async function () {
          var msgR = document.getElementById('prop-renvoyer-msg');
          bRenvoyer.disabled = true;
          var resR = (typeof appelAPIPost === 'function')
            ? await appelAPIPost('renvoyerCopieProposition', { cmd_id: numero, jeton: jeton })
            : null;
          if (resR && resR.success) {
            if (msgR) { msgR.textContent = 'C\'est envoyé, vérifiez vos courriels (pensez aux indésirables).'; msgR.classList.remove('cache'); }
          } else {
            bRenvoyer.disabled = false;
            if (msgR) { msgR.textContent = 'Ça n\'a pas fonctionné — réessayez ou cliquez sur « Écrivez-nous ».'; msgR.classList.remove('cache'); }
          }
        });
        return;
      }
      // Bloc 1 — comportement existant
      try { localStorage.setItem('uc_modif_cmd', JSON.stringify({ cmd: numero, jeton: jeton })); sessionStorage.setItem('uc_modif_active', '1'); } catch (e) {}
      demandeListe = res.lignes.map(l => ({
        pro_id: l.pro_id, format_poids: l.format_poids, format_unite: l.format_unite,
        nom_produit: l.nom, prix_unitaire: l.prix_unitaire, image_url: l.image_url,
        nom_collection: l.nom_collection, nom_gamme: l.nom_gamme, quantite: l.quantite
      }));
      sauvegarderDemandeListe();
      demandeRafraichirAffichage();
    }

    let coupdecoeurTouche = false;

    function coupdecoeurRendre() {
      if (!zone) return;
      if (!demandeListe.length) {
        const texteVide = coupdecoeurTouche
          ? 'Vous avez retiré tous les produits. Ajoutez-en au moins un pour nous envoyer votre liste, ou utilisez le bouton d\'annulation si vous ne souhaitez plus donner suite.'
          : 'Votre liste est vide pour le moment. Ajoutez au moins un produit pour nous l\'envoyer.';
        zone.innerHTML = '<h2 class="titre">Vos Coups de cœur</h2>' +
          '<p class="textes-discrets">' + texteVide + '</p>' +
          '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'catalogue\')">Ajouter d\'autres produits</button>' +
          '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" data-action="annuler">Je ne veux plus donner suite, annuler cette demande s.v.p.</button>' +
          '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer. Vos coups de cœur ne seront pas modifiés</button>';
        return;
      }
      let total = 0;
      let html = '';
      demandeListe.forEach(i => {
        const sous = (i.prix_unitaire || 0) * (i.quantite || 1);
        total += sous;
        const cle = i.pro_id + '|' + i.format_poids + '|' + i.format_unite;
        const photo = i.image_url
          ? '<img src="' + echapperHtml(i.image_url) + '" alt="" class="rangeeitem-photo">'
          : '<div class="rangeeitem-photo"></div>';
        html += '<div class="rangeeitem" data-cle="' + echapperHtml(cle) + '">' +
            photo +
            '<div class="rangeeitem-info">' +
              (i.nom_collection ? '<div class="sur-titre">' + echapperHtml(i.nom_collection) + '</div>' : '') +
              '<div class="rangeeitem-titre">' + echapperHtml(i.nom_produit || i.pro_id) + '</div>' +
              '<div class="rangeeitem-meta">' + (i.nom_gamme ? echapperHtml(i.nom_gamme) + ' · ' : '') + echapperHtml(i.format_poids + ' ' + i.format_unite) + '</div>' +
            '</div>' +
            '<div class="compteur">' +
              '<button type="button" class="compteur-btn" data-action="moins">−</button>' +
              '<span class="compteur-valeur">' + (i.quantite || 1) + '</span>' +
              '<button type="button" class="compteur-btn" data-action="plus">+</button>' +
            '</div>' +
            '<button type="button" class="boutons boutons-contour boutons-minuscule" data-action="retirer">Retirer</button>' +
            '<div class="rangeeitem-valeur">' + sous.toFixed(2).replace('.', ',') + ' $</div>' +
          '</div>';
      });
      html += '<div class="lignetotal"><span class="lignetotal-libelle">Total avant les frais de livraison</span>' +
        '<span>' + total.toFixed(2).replace('.', ',') + ' $</span></div>' +
        '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" onclick="naviguer(\'catalogue\')">Ajouter d\'autres produits</button>' +
        (coupdecoeurTouche
          ? '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" data-action="renvoyer">Retourner la commande modifiée</button>'
          : '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" data-action="conserver">Conserver la demande</button>') +
        '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" data-action="annuler">Je ne veux plus donner suite, annuler cette demande s.v.p.</button>' +
        '<div id="coupdecoeur-msg" class="cache"></div>';
      zone.innerHTML = html;
    }

    if (zone) zone.addEventListener('click', async function (ev) {
      const btn = ev.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'annuler') {
        zone.innerHTML = '<h2 class="titre">Vous souhaitez annuler?</h2>' +
          '<p class="textes-discrets">Cette action est définitive. Voulez-vous vraiment annuler cette commande?</p>' +
          '<div class="champ"><label class="libelle">Si vous voulez nous dire ce qui s\'est passé, nous lisons tout (c\'est facultatif)</label>' +
          '<textarea id="coupdecoeur-raison" class="controle" rows="3"></textarea></div>' +
          '<button type="button" class="boutons boutons-rouge boutons-pleine-largeur" data-action="confirmer-annulation">Oui, annuler s.v.p.</button>' +
          '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" data-action="retour-liste">Non, revenir à la liste</button>' +
          '<div id="coupdecoeur-msg" class="cache"></div>';
        return;
      }

      if (action === 'retour-liste') {
        coupdecoeurRendre();
        return;
      }

    if (action === 'confirmer-annulation') {
        const btn2 = ev.target.closest('[data-action]');
        if (btn2) btn2.disabled = true;
        montrerVoile();
        const msg = document.getElementById('coupdecoeur-msg');
        const raison = (document.getElementById('coupdecoeur-raison') || {}).value || '';
        try {
          const r = await appelAPIPost('annulerCommandeClient', { cmd_id: numero, jeton: jeton, raison });
          cacherVoile();
          if (r && r.success) {
            demandeVider();
            zone.innerHTML = '<h2 class="titre">Commande annulée</h2>' +
              '<p class="textes-discrets">Votre commande a bien été annulée. Nous espérons vous revoir bientôt.</p>' +
              '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
          } else {
            let annuleeQuandMeme = false;
            try {
              const verif = await appelAPIPost('getCommandePublique', { cmd_id: numero, jeton: jeton });
              if (verif && verif.success && verif.statut === 'Annulée') annuleeQuandMeme = true;
            } catch (eVerif) {}
            if (annuleeQuandMeme) {
              demandeVider();
              zone.innerHTML = '<h2 class="titre">Commande annulée</h2>' +
                '<p class="textes-discrets">Votre commande a bien été annulée. Nous espérons vous revoir bientôt.</p>' +
                '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
            } else {
              if (msg) { msg.textContent = 'Erreur : ' + ((r && r.message) || 'échec'); msg.classList.remove('cache'); }
              if (btn2) btn2.disabled = false;
            }
          }
        } catch (e) {
          cacherVoile();
          let annuleeQuandMeme2 = false;
          try {
            const verif2 = await appelAPIPost('getCommandePublique', { cmd_id: numero, jeton: jeton });
            if (verif2 && verif2.success && verif2.statut === 'Annulée') annuleeQuandMeme2 = true;
          } catch (eVerif2) {}
          if (annuleeQuandMeme2) {
            demandeVider();
            zone.innerHTML = '<h2 class="titre">Commande annulée</h2>' +
              '<p class="textes-discrets">Votre commande a bien été annulée. Nous espérons vous revoir bientôt.</p>' +
              '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
          } else {
            if (msg) { msg.textContent = 'Erreur : ' + e.message; msg.classList.remove('cache'); }
            if (btn2) btn2.disabled = false;
          }
        }
        return;
      }

      if (action === 'conserver') {
        demandeVider();
        try { localStorage.removeItem('uc_modif_cmd'); sessionStorage.removeItem('uc_modif_active'); } catch (e) {}
        naviguer('accueil');
        return;
      }

      if (action === 'renvoyer') {
        const msg0 = document.getElementById('coupdecoeur-msg');
        if (!demandeListe.length) {
          if (msg0) { msg0.textContent = 'Votre liste est vide. Pour ne plus donner suite, utilisez plutôt le bouton d\'annulation — ou rajoutez des produits.'; msg0.classList.remove('cache'); }
          return;
        }
        const listeActuelle  = demandeListe.map(i => i.pro_id + '|' + i.format_poids + '|' + i.format_unite + '|' + i.quantite).sort().join(';');
        const listeOriginale = res.lignes.map(l => l.pro_id + '|' + l.format_poids + '|' + l.format_unite + '|' + l.quantite).sort().join(';');
        if (listeActuelle === listeOriginale) {
          if (msg0) { msg0.textContent = 'Aucun changement à envoyer — votre liste est identique à celle que nous avons.'; msg0.classList.remove('cache'); }
          return;
        }
        btn.disabled = true;
        montrerVoile();
        const msg = document.getElementById('coupdecoeur-msg');
        try {
          const lignes = demandeListe.map(i => ({
            pro_id: i.pro_id, format_poids: i.format_poids, format_unite: i.format_unite,
            quantite: i.quantite, prix_unitaire: i.prix_unitaire
          }));
          const r = await appelAPIPost('renvoyerListeCoupdecoeur', { cmd_id: numero, lignes, jeton: jeton });
          cacherVoile();
          if (r && r.success) {
            demandeVider();
            try { localStorage.removeItem('uc_modif_cmd'); sessionStorage.removeItem('uc_modif_active'); } catch (e) {}
            zone.innerHTML = '<h2 class="titre">Merci !</h2>' +
              '<p class="textes-discrets">Votre liste modifiée a bien été envoyée. Nous vous reviendrons très bientôt.</p>' +
              '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
          } else {
            if (msg) { msg.textContent = 'Erreur : ' + ((r && r.message) || 'envoi échoué'); msg.classList.remove('cache'); }
            btn.disabled = false;
            
          }
        } catch (e) {
          cacherVoile();
          if (msg) { msg.textContent = 'Erreur : ' + e.message; msg.classList.remove('cache'); }
          btn.disabled = false;
        }
        return;
      }

      const ligne = btn.closest('[data-cle]');
      if (!ligne) return;
      const [pro_id, fp, fu] = ligne.dataset.cle.split('|');
      coupdecoeurTouche = true;
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

// « J'ai changé d'idée » : l'écran d'annulation ouvert directement par le lien d'un courriel (19 nov. 2026).
function afficherAnnulationCommande(zone, numero, jeton) {
  if (!zone) return;
  zone.innerHTML = '<h2 class="titre">Vous souhaitez annuler?</h2>' +
    '<p class="textes-discrets">Cette action est définitive. Voulez-vous vraiment annuler cette commande?</p>' +
    '<div class="champ"><label class="libelle">Si vous voulez nous dire ce qui s\'est passé, nous lisons tout (c\'est facultatif)</label>' +
    '<textarea id="coupdecoeur-raison" class="controle" rows="3"></textarea></div>' +
    '<button type="button" class="boutons boutons-rouge boutons-pleine-largeur" id="annul-confirmer">Oui, annuler s.v.p.</button>' +
    '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" id="annul-retour">Non, revenir à la commande</button>' +
    '<div id="coupdecoeur-msg" class="cache"></div>';
  document.getElementById('annul-retour').addEventListener('click', function () {
    window.location.href = '?cmd=' + encodeURIComponent(numero) + '&jeton=' + encodeURIComponent(jeton || '');
  });
  const btnOui = document.getElementById('annul-confirmer');
  btnOui.addEventListener('click', async function () {
    btnOui.disabled = true;
    montrerVoile();
    const msg = document.getElementById('coupdecoeur-msg');
    const raison = (document.getElementById('coupdecoeur-raison') || {}).value || '';
    let r = null, erreur = '';
    try { r = await appelAPIPost('annulerCommandeClient', { cmd_id: numero, jeton: jeton, raison: raison }); }
    catch (e) { erreur = e.message; }
    let annulee = !!(r && r.success);
    if (!annulee) {
      try {
        const v = await appelAPIPost('getCommandePublique', { cmd_id: numero, jeton: jeton });
        annulee = !!(v && v.success && v.statut === 'Annulée');
      } catch (e2) {}
    }
    cacherVoile();
    if (annulee) {
      demandeVider();
      try { localStorage.removeItem('uc_modif_cmd'); sessionStorage.removeItem('uc_modif_active'); } catch (e3) {}
      zone.innerHTML = '<h2 class="titre">Commande annulée</h2>' +
        '<p class="textes-discrets">Votre commande a bien été annulée. Nous espérons vous revoir bientôt.</p>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
      return;
    }
    if (msg) { msg.textContent = 'Erreur : ' + ((r && r.message) || erreur || 'échec'); msg.classList.remove('cache'); }
    btnOui.disabled = false;
  });
}

// Sorte 2 — la page de la proposition à trois sections (prêts · à venir · non disponibles). Réécrite le 18 nov. 2026 :
// · « Recevoir ce qui est prêt » garde le choix de la cliente sur le serveur, puis l'amène à l'adresse et au paiement
//   (avant : la commande passait « À expédier » sans paiement);
// · « Attendre que tout soit prêt » : les produits prêts restent mis de côté;
// · un seul écouteur de clics (avant, chaque réponse en ajoutait un); textes échappés.
function afficherPageUniqueBloc2(res, cmd_id, jeton) {
  const zone = document.getElementById('coupdecoeur-commande');
  if (!zone) return;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('section-coupdecoeur');
  if (sec) sec.classList.add('active');

  const lignes      = res.lignes || [];
  const cleDe       = l => l.pro_id + '|' + l.format_poids + '|' + l.format_unite;
  const prets       = lignes.filter(l => !l.type_ligne || l.type_ligne === 'pret');
  const temporaires = lignes.filter(l => l.type_ligne === 'temporaire');
  const definitifs  = lignes.filter(l => l.type_ligne === 'definitif');
  const esc   = t => (typeof echapperHtml === 'function') ? echapperHtml(t) : String(t == null ? '' : t);
  const prix  = n => (typeof formaterPrix === 'function') ? formaterPrix(n) : (Number(n) || 0).toFixed(2).replace('.', ',') + ' $';
  const dateLongue = v => {
    const d = new Date(String(v || '').slice(0, 10) + 'T12:00:00');
    return isNaN(d) ? '' : d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Réponses : celles de ce navigateur pour CETTE proposition, sinon celles déjà gardées par le serveur
  const cleReponses = 'uc_reponses_' + cmd_id + '_' + (res.date_prop || 0);
  let reponses = {};
  try { reponses = JSON.parse(localStorage.getItem(cleReponses) || '{}') || {}; } catch (e) { reponses = {}; }
  if (res.choix_cliente && !Object.keys(reponses).length) {
    temporaires.forEach(l => { reponses[cleDe(l)] = (res.temporaires_gardes || []).indexOf(cleDe(l)) > -1 ? 'garder' : 'laisser'; });
  }

  const totalPrets = prets.reduce((s, l) => s + (l.prix_unitaire || 0) * (l.quantite || 0), 0);
  const totalAPayer = Math.max(0, totalPrets + (res.livraison || 0) - (res.rabais || 0));

  function rangee(l, sorte) {
    const cle = cleDe(l);
    const rep = reponses[cle];
    let h = '<div class="rangeeitem">';
    h += '<div class="rangeeitem-info">';
    if (l.nom_collection) h += '<div class="sur-titre">' + esc(l.nom_collection) + '</div>';
    h += '<div class="rangeeitem-titre">' + esc(l.nom || l.pro_id) + '</div>';
    h += '<div class="rangeeitem-meta">' + (l.nom_gamme ? esc(l.nom_gamme) + ' · ' : '') + esc(l.format_poids) + ' ' + esc(l.format_unite) + ' × ' + esc(l.quantite);
    if (sorte === 'temporaire' && dateLongue(l.date_dispo)) h += ' &nbsp;·&nbsp; disponible vers le ' + dateLongue(l.date_dispo);
    h += '</div></div>';
    if (sorte === 'pret') h += '<div class="rangeeitem-valeur">' + prix((l.prix_unitaire || 0) * (l.quantite || 0)) + '</div>';
    if (sorte === 'temporaire') {
      h += '<div class="actions">';
      h += '<button type="button" class="boutons boutons-petit' + (rep === 'garder' ? ' boutons-accent' : ' boutons-contour') + '" data-action="garder" data-cle="' + esc(cle) + '">Garder</button>';
      h += '<button type="button" class="boutons boutons-petit' + (rep === 'laisser' ? ' boutons-rouge' : ' boutons-contour') + '" data-action="laisser" data-cle="' + esc(cle) + '">Laisser tomber</button>';
      h += '</div>';
    }
    return h + '</div>';
  }

  function section(titre, liste, sorte, sousTitre) {
    if (!liste.length) return '';
    let h = titre ? '<div class="sur-titre">' + titre + '</div>' : '';
    if (sousTitre) h += '<p class="textes-discrets">' + sousTitre + '</p>';
    liste.forEach(l => { h += rangee(l, sorte); });
    return h;
  }

  function rendre(message) {
    const tousRepondus = temporaires.every(l => reponses[cleDe(l)] === 'garder' || reponses[cleDe(l)] === 'laisser');
    let html = '<h2 class="titre">Votre proposition</h2>';
    html += section('Prêts à partir', prets, 'pret', '');
    html += '<div class="lignetotal"><span class="lignetotal-libelle">À payer maintenant' + ((res.livraison || 0) > 0 ? ' (livraison incluse)' : '') + '</span><span>' + prix(totalAPayer) + '</span></div>';
    html += section('En attente de fabrication', temporaires, 'temporaire', 'Pour chaque produit, dites-nous si vous souhaitez le garder pour plus tard.');
    html += section('Non disponibles', definitifs, 'definitif', 'Ces produits ne pourront malheureusement pas faire partie de cette commande.');
    if (tousRepondus) {
      html += '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" data-action="recevoir-pret">Recevoir ce qui est prêt et payer</button>';
      if (temporaires.length) html += '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" data-action="attendre-tout">Attendre que tout soit prêt</button>';
    } else {
      html += '<p class="textes-discrets">Répondez pour chaque produit en attente de fabrication pour continuer.</p>';
    }
    html += '<button type="button" class="boutons boutons-contour boutons-pleine-largeur" data-action="modifier-liste">Modifier la liste</button>';
    html += '<p class="textes-discrets"><a href="#" class="lien-discret" data-action="question">J\'ai une question</a></p>';
    html += '<div id="coupdecoeur-msg" class="' + (message ? '' : 'cache') + '">' + (message ? esc(message) : '') + '</div>';
    zone.innerHTML = html;
  }

  const lien = action => window.location.pathname + '?cmd=' + encodeURIComponent(cmd_id) + '&jeton=' + encodeURIComponent(jeton) + '&action=' + action;

  async function surClic(ev) {
    const btn = ev.target.closest('[data-action]');
    if (!btn || !zone.contains(btn)) return;
    const action = btn.dataset.action;
    if (action === 'garder' || action === 'laisser') {
      reponses[btn.dataset.cle] = action;
      try { localStorage.setItem(cleReponses, JSON.stringify(reponses)); } catch (e) {}
      rendre();
      return;
    }
    if (action === 'question') { ev.preventDefault(); ouvrirContactCommande(res, cmd_id); return; }
    if (action === 'modifier-liste') { window.location.href = lien('modifier-liste'); return; }
    if (action !== 'recevoir-pret' && action !== 'attendre-tout') return;

    btn.disabled = true;
    montrerVoile();
    const gardes = temporaires.filter(l => reponses[cleDe(l)] === 'garder').map(cleDe);
    try {
      const r = await appelAPIPost(action === 'recevoir-pret' ? 'recevoirPret' : 'attendreTout', { cmd_id: cmd_id, jeton: jeton, gardes: gardes });
      cacherVoile();
      if (!r || !r.success) { rendre('Erreur : ' + ((r && r.message) || 'échec') + '. Réessayez ou écrivez-nous.'); return; }
      if (action === 'recevoir-pret') { window.location.href = lien('payer'); return; }
      zone.removeEventListener('click', surClic);
      try { localStorage.removeItem(cleReponses); } catch (e) {}
      zone.innerHTML = '<h2 class="titre">C\'est noté!</h2>' +
        '<p class="textes-discrets">Vos produits prêts sont mis de côté. Nous vous recontacterons dès que tout sera prêt.</p>' +
        '<button type="button" class="boutons boutons-vert boutons-pleine-largeur" onclick="naviguer(\'accueil\')">Fermer</button>';
    } catch (e) {
      cacherVoile();
      rendre('Erreur : ' + e.message + '. Réessayez ou écrivez-nous.');
    }
  }

  if (zone._ucSorte2) zone.removeEventListener('click', zone._ucSorte2);
  zone._ucSorte2 = surClic;
  zone.addEventListener('click', surClic);
  rendre();
}

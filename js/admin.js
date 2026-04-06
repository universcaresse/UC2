/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin.js
   ═══════════════════════════════════════ */

// ─── INITIALISATION ───

var adminScrollObserver = null;

function initScrollAnimations() {
  adminScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        adminScrollObserver.unobserve(entry.target);
      }
    });
	
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-in, .fade-in-doux').forEach(el => adminScrollObserver.observe(el));
}

function reobserverFadeIn(conteneur) {
  if (!adminScrollObserver || !conteneur) return;
  conteneur.querySelectorAll('.fade-in, .fade-in-doux').forEach(el => el.classList.remove('visible'));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    conteneur.querySelectorAll('.fade-in, .fade-in-doux').forEach(el => adminScrollObserver.observe(el));
  }));
}

document.addEventListener('DOMContentLoaded', async () => {
  const session = sessionStorage.getItem('uc_admin');
  if (session !== 'true') {
    window.location.href = '/universcaresse/admin/login.html';
    return;
  }
  document.getElementById('ecran-connexion').classList.add('cache');
  const dateField = document.getElementById('nf-date');
  if (dateField) dateField.value = new Date().toISOString().split('T')[0];
  initBurgerAdmin();
  initScrollAnimations();
  await chargerDonneesInitiales();
});

async function chargerDonneesInitiales() {
  const [resCol, resRec, resDrop] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getRecettes'),
    appelAPI('getDropdownLists')
  ]);
  if (resCol && resCol.success) {
    donneesCollections = resCol.items || [];
    afficherCollections();
  }
  if (resRec && resRec.success) {
    donneesRecettes = (resRec.recettes || []).sort((a, b) =>
      (parseInt(a.rang) || 99) - (parseInt(b.rang) || 99) ||
      (a.ligne || '').localeCompare(b.ligne || '') ||
      (a.nom || '').localeCompare(b.nom || '')
    );
  }
  if (resDrop) {
    listesDropdown.types    = resDrop.types    || [];
    listesDropdown.fullData = resDrop.fullData || [];
    listesDropdown.config   = resDrop.config   || {};
    listesDropdown.formats  = [];
  }
  const nbPublics = donneesRecettes.filter(r => r.statut === 'public').length;
  const statCol = document.getElementById('admin-stat-collections');
  const statRec = document.getElementById('admin-stat-produits');
  if (statCol) statCol.textContent = new Set(donneesCollections.map(i => i.collection)).size;
  if (statRec && nbPublics > 0) statRec.textContent = nbPublics + '+';
}

// ─── NAVIGATION SIDEBAR ───
function toggleDropdownAdmin(el) {
  const item = el.closest('.nav-admin-item');
  const estOuvert = item.classList.contains('ouvert');
  document.querySelectorAll('.nav-admin-item.ouvert').forEach(i => i.classList.remove('ouvert'));
  if (!estOuvert) item.classList.add('ouvert');
}

function afficherSection(id, bouton) {
  document.querySelectorAll('.nav-admin-item.ouvert').forEach(i => i.classList.remove('ouvert'));
  document.querySelectorAll('.section-admin').forEach(s => s.classList.remove('visible'));
  document.querySelectorAll('.sidebar-lien').forEach(l => l.classList.remove('actif'));
  fermerFicheCollection();
   const s = document.getElementById('section-' + id);
  if (s) s.classList.add('visible');
  if (bouton) bouton.classList.add('actif');
  fermerSidebarMobile();
  document.querySelectorAll('.nav-admin-btn').forEach(b => b.blur());
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  const contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTop = 0;
if (id === 'accueil')        afficherStatsAccueil();
if (id === 'import-facture') ifChargerMapping();
if (id === 'collections')    afficherCollections();
if (id === 'recettes')       afficherRecettes();
if (id === 'inci')           chargerInci();
if (id === 'densites')       chargerDensites();
if (id === 'inventaire')     chargerInventaire();
if (id === 'factures')       chargerFactures();
const cible = document.getElementById('section-' + id);
if (cible) reobserverFadeIn(cible);
 if (id === 'nouvelle-facture' && !factureActive) initialiserNouvelleFacture();
if (id === 'contenu-site')    chargerContenuSite();
if (id === 'mediatheque')     chargerMediatheque();
if (id === 'fabrication') {
  if (!donneesRecettes || donneesRecettes.length === 0) {
    appelAPI('getRecettes').then(res => {
      if (res && res.recettes) donneesRecettes = res.recettes;
      chargerFabrication();
    });
  } else {
    chargerFabrication();
  }
}
if (id === 'import-recettes') {
  appelAPI('getRecettes').then(resRec => {
    if (resRec && resRec.recettes) donneesRecettes = resRec.recettes;
    const maxId = donneesRecettes.reduce((max, r) => Math.max(max, parseInt(r.recette_id) || 0), 0);
    document.getElementById('import-recette-id').value = maxId + 1;
  });
}
}

// ─── STATS ACCUEIL ───
function afficherStatsAccueil() {
  const nbCollections = new Set(donneesCollections.map(i => i.collection)).size;
  const nbPublics = donneesRecettes.filter(r => r.statut === 'public').length;
  const statCol = document.getElementById('admin-stat-collections');
  const statRec = document.getElementById('admin-stat-produits');
  if (statCol) statCol.textContent = nbCollections;
  if (statRec && nbPublics > 0) statRec.textContent = nbPublics + '+';
}

// ─── BURGER MOBILE ───
function initBurgerAdmin() {
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.addEventListener('click', fermerSidebarMobile);
  const burger = document.getElementById('burger-admin');
  if (burger) burger.addEventListener('click', function(e) { e.stopPropagation(); });
  let dernierScroll = 0;
  window.addEventListener('scroll', () => {
    if (!burger || window.innerWidth > 900) return;
    const scrollActuel = window.scrollY;
    if (scrollActuel > dernierScroll && scrollActuel > 60) {
      burger.classList.add('cache-scroll');
    } else {
      burger.classList.remove('cache-scroll');
    }
    dernierScroll = scrollActuel;
  });
}

function toggleSidebarAdmin() {
 
  document.getElementById('sidebar-admin').classList.toggle('ouvert');
  document.getElementById('sidebar-overlay').classList.toggle('visible');
}

function fermerSidebarMobile() {
  const sidebar = document.getElementById('sidebar-admin');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('ouvert');
  if (overlay) overlay.classList.remove('visible');
}

// ─── MESSAGES ───
function afficherMsg(zone, texte, type = 'succes') {
  const el = document.getElementById('msg-' + zone);
  if (el) {
    el.innerHTML = `<div class="msg msg-${type}">${texte}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 4000);
  }
  let toast = document.getElementById('toast-global');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-global';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = texte;
  toast.className = `toast toast-${type}`;
  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ─── COULEUR PAR NOM ───
function couleurTexteContraste(hex) {
  if (!hex || !hex.startsWith('#')) return 'carte-infos-clair';
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'carte-infos-fonce' : 'carte-infos-clair';
}

function stringToColor(str) {
  const palette = ['#5a8a3a','#4a7c9e','#9b6b9b','#c4773a','#3a8a7a','#8a5a3a','#6b7a3a','#9b3a5a','#3a5a8a'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

/* ════════════════════════════════
   COLLECTIONS
════════════════════════════════ */
let donneesCollections = [];
 
async function chargerCollections() {
  const res = await appelAPI('getCollections');
  if (!res || !res.success) { afficherMsg('collections', 'Erreur lors du chargement.', 'erreur'); return; }
  donneesCollections = res.items || [];
  afficherCollections();
}

function afficherCollections() {
  const loading = document.getElementById('loading-collections');
  const contenu = document.getElementById('contenu-collections');
  const vide    = document.getElementById('vide-collections');
  if (loading) loading.classList.add('cache');
  contenu.innerHTML = '';
  vide.classList.add('cache');
  if (!donneesCollections.length) { vide.classList.remove('cache'); return; }

  const groupes = {};
  donneesCollections.forEach(item => {
    if (!groupes[item.collection]) {
      groupes[item.collection] = { slogan: item.slogan, couleur_hex: item.couleur_hex, lignes: [] };
    }
  if (item.ligne) groupes[item.collection].lignes.push(item);
  });
  Object.values(groupes).forEach(g => g.lignes.sort((a, b) => (a.ligne || '').localeCompare(b.ligne || '')));

  let html = '<div class="collections-grille">';
  Object.entries(groupes).forEach(([col, data]) => {
    const couleurs = couleurCollection(col, data.couleur_hex);
    const lignesHtml = data.lignes.map(item =>
 `<span class="collection-carte-ligne-tag">${String(item.ligne || '').toUpperCase()}</span>`
    ).join('');
    html += `
      <div class="collection-carte" onclick="ouvrirFicheCollection('${col.replace(/'/g, "\\'")}')">
        <div class="collection-carte-bg" style="background:linear-gradient(145deg,${couleurs[0]},${couleurs[1]});"></div>
        <div class="collection-carte-overlay"></div>
   <div class="collection-carte-lignes-haut">${lignesHtml}</div>
        <div class="collection-carte-contenu">
          <span class="collection-carte-nom">${col.toUpperCase()}</span>
          <span class="collection-carte-slogan">${data.slogan || ''}</span>
        </div>
      </div>`;
  });
  html += '</div>';
  contenu.innerHTML = html;
}

function ouvrirFicheCollection(col) {
  const groupe = {};
  donneesCollections.forEach(item => {
    if (item.collection === col) {
      if (!groupe.info) {
        groupe.info = item;
      }
      if (item.ligne) {
        if (!groupe.lignes) groupe.lignes = [];
        groupe.lignes.push(item);
      }
    }
  });
  if (!groupe.info) return;

  const couleurs = couleurCollection(col, groupe.info.couleur_hex);
  const lignesHtml = (groupe.lignes || []).map(item => `
  
 <div class="fiche-ligne-item" onclick="ouvrirFicheLigne(${item.rowIndex})">
      <div class="fiche-ligne-info">
        <span class="fiche-ligne-nom">${item.ligne.toUpperCase()}</span>
        ${item.format ? `<span class="fiche-ligne-format">${item.format}</span>` : ''}
        ${item.description_ligne ? `<p class="fiche-ligne-desc">${item.description_ligne}</p>` : ''}
      </div>
    </div>`).join('');

  const fiche = document.getElementById('fiche-collection');
  document.getElementById('fiche-collection-titre').textContent = col.toUpperCase();
document.getElementById('fiche-collection-bandeau').style.background = '';
  document.getElementById('fiche-collection-slogan').textContent = groupe.info.slogan || '';
 document.getElementById('fiche-collection-desc').textContent = groupe.info.description_collection || '';
  const couleur = groupe.info.couleur_hex || '';
  const photo   = groupe.info.photo_url   || '';
  const rang    = groupe.info.rang || '';
  let ficheExtrasHtml = '';
  let wrapHtml = '';
  if (couleur) wrapHtml += `<div class="fiche-collection-couleur" style="background:${couleur}">${rang}</div>`;
  if (photo)   wrapHtml += `<div class="fiche-collection-photo"><img src="${photo}" alt="Photo collection"></div>`;
  if (wrapHtml) ficheExtrasHtml += `<div class="fiche-collection-extras-wrap">${wrapHtml}</div>`;
  const ficheExtras = document.getElementById('fiche-collection-extras');
  if (ficheExtras) ficheExtras.innerHTML = ficheExtrasHtml;
  document.getElementById('fiche-collection-lignes').innerHTML = lignesHtml || '<p class="vide-desc">Aucune ligne</p>';
document.getElementById('fiche-collection-modifier').onclick = () => {
    document.getElementById('fiche-collection').classList.remove('visible');
    modifierCollection(groupe.info.rowIndex);
  };
document.getElementById('fiche-collection-ajouter-ligne').onclick = () => {
    fermerFicheCollection();
    ouvrirFormCollectionPour(col);
    basculerModeFormCollection();
    document.getElementById('fc-collection-ligne').value = col || '';
  };
 document.getElementById('btn-supprimer-collection').onclick = () => supprimerCollection(col, groupe);
  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  fiche.classList.add('visible');
  window.scrollTo(0, 0);
}

function fermerFicheCollection() {
  document.getElementById('fiche-collection').classList.remove('visible');
  document.getElementById('contenu-collections').classList.remove('cache');
}





function ouvrirFormCollectionPour(col) {
  ouvrirFormCollection();
  document.getElementById('fc-collection-ligne').value = col || '';
}

function ouvrirFormCollection() {
  fermerFicheCollection();
  document.getElementById('form-collections-titre').textContent = 'Nouvelle collection';
  document.getElementById('fc-rowIndex').value = '';
  document.getElementById('fc-mode').value = 'collection';
  document.getElementById('fc-bloc-collection').classList.remove('cache');
  document.getElementById('fc-bloc-ligne').classList.add('cache');
  document.getElementById('fc-toggle-mode').textContent = '+ Ajouter une ligne';
  ['fc-rang','fc-collection','fc-slogan','fc-desc-col','fc-couleur-hex','fc-photo-url',
   'fc-ligne','fc-desc-ligne','fc-couleur-hex-ligne','fc-photo-url-ligne','fc-collection-ligne']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  ['fc-photo-preview','fc-photo-preview-ligne','fc-photo-preview-noel'].forEach(id => {
    const e = document.getElementById(id); if (e) e.innerHTML = '';
  });
  ['fc-couleur-apercu','fc-couleur-apercu-ligne'].forEach(id => {
    const e = document.getElementById(id); if (e) e.style.background = '';
  });
  ingredientsBase = [];
  rafraichirListeIngredientsBase();
  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  document.getElementById('form-collections').classList.add('visible');
  const btnSupprLigneNouv = document.getElementById('btn-supprimer-ligne');
  if (btnSupprLigneNouv) btnSupprLigneNouv.classList.add('cache');
  window.scrollTo(0, 0);
}
function confirmerAction(message, callback) {
  document.getElementById('modal-confirm-message').textContent = message;
  document.getElementById('modal-confirm-btn').onclick = () => { fermerModalConfirm(); callback(); };
  document.getElementById('modal-confirm').classList.add('ouvert');
}

function fermerModalConfirm() {
  document.getElementById('modal-confirm').classList.remove('ouvert');
}


function fermerFormCollection() {
  document.getElementById('contenu-collections').classList.remove('cache');
  document.getElementById('btn-nouvelle-collection').classList.remove('cache');
  document.getElementById('fc-toggle-mode').classList.remove('cache');
  document.getElementById('form-collections').classList.remove('visible');
}

async function ouvrirFicheLigne(rowIndex) {
  const item = donneesCollections.find(i => i.rowIndex === rowIndex);
  if (!item) return;
  document.getElementById('fiche-ligne-titre').textContent = item.ligne.toUpperCase();
  
  document.getElementById('fiche-ligne-collection').textContent = item.collection || '';
  
  document.getElementById('fiche-ligne-desc').textContent = item.description_ligne || '—';
  document.getElementById('fiche-ligne-modifier').onclick = () => {
    fermerFicheLigne();
    modifierLigneProduit(rowIndex);
  };
  document.getElementById('btn-supprimer-ligne-fiche').onclick = () => supprimerLigne(rowIndex, item.collection, item.ligne);
  const resBase = await appelAPI('getRecettesBase');
  const ings = (resBase && resBase.items ? resBase.items : [])
    .filter(i => i.collection === item.collection && i.ligne === item.ligne);
  const listeEl = document.getElementById('fiche-ligne-ingredients');
  if (ings.length === 0) {
    listeEl.innerHTML = '<span class="form-valeur">—</span>';
  } else {
    listeEl.innerHTML = ings.map(i => {
      const inci = (listesDropdown.fullData||[]).find(d => d.type===i.ingredient_type && d.ingredient===i.ingredient_nom)?.inci || '';
      return `<div class="fp-ing-row"><span>${i.ingredient_type}</span><span>${i.ingredient_nom}</span><span class="fp-ing-inci">${inci}</span><span>${i.quantite_g} g</span></div>`;
    }).join('');
  }
  document.getElementById('fiche-collection').classList.remove('visible');
  document.getElementById('fiche-ligne').classList.add('visible');
  document.getElementById('contenu-collections').classList.add('cache');
  window.scrollTo(0, 0);
}

function fermerFicheLigne() {
  document.getElementById('fiche-ligne').classList.remove('visible');
  document.getElementById('fiche-collection').classList.add('visible');
}

async function modifierLigneProduit(rowIndex) {
  const item = donneesCollections.find(i => i.rowIndex === rowIndex);
 if (!item) return;
  document.getElementById('fiche-collection').classList.remove('visible');
  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('form-collections-titre').textContentt = 'Modifier la ligne — ' + (item.collection || '');
  document.getElementById('fc-rowIndex').value = rowIndex;
  document.getElementById('fc-mode').value = 'ligne';
  document.getElementById('fc-bloc-collection').classList.add('cache');
  document.getElementById('fc-bloc-ligne').classList.remove('cache');
  document.getElementById('fc-toggle-mode').textContent = '← Retour collection';
  document.getElementById('fc-collection-ligne').value = item.collection || '';
  document.getElementById('fc-ligne').value = item.ligne || '';
  document.getElementById('fc-ligne').dataset.ancienne = item.ligne || '';
  
  document.getElementById('fc-desc-ligne').value = item.description_ligne || '';
  document.getElementById('fc-couleur-hex-ligne').value = item.couleur_hex || '';
  document.getElementById('fc-photo-url-ligne').value = item.photo_url || '';
 apercuCouleurCollection(document.getElementById('fc-couleur-hex-ligne'));
  const resBase = await appelAPI('getRecettesBase');
  ingredientsBase = (resBase && resBase.items ? resBase.items : [])
    .filter(i => i.collection === item.collection && i.ligne === item.ligne)
    .map(i => ({ type: i.ingredient_type, nom: i.ingredient_nom, quantite: i.quantite_g }));
  rafraichirListeIngredientsBase();
   document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('form-collections').classList.add('visible');
  const btnSupprLigne = document.getElementById('btn-supprimer-ligne');
  if (btnSupprLigne) {
    btnSupprLigne.classList.remove('cache');
    btnSupprLigne.onclick = () => supprimerLigne(rowIndex, item.collection, item.ligne);
  }
  window.scrollTo(0, 0);
}

async function modifierCollection(rowIndex) {
  const item = donneesCollections.find(i => i.rowIndex === rowIndex);
  if (!item) return;
  document.getElementById('fc-bloc-collection').classList.remove('cache');
  document.getElementById('fc-bloc-ligne').classList.add('cache');
  document.getElementById('fc-toggle-mode').textContent = '+ Ajouter une ligne';
  document.getElementById('fc-mode').value = 'collection';
  document.getElementById('form-collections-titre').textContent = 'Modifier l\'entrée';
  document.getElementById('fc-rowIndex').value          = rowIndex;
  document.getElementById('fc-rang').value              = item.rang || '';
  document.getElementById('fc-collection').value        = item.collection || '';
  document.getElementById('fc-slogan').value            = item.slogan || '';
 const descCol = document.getElementById('fc-desc-col');
descCol.value = item.description_collection || '';
ajusterHauteurTextarea(descCol);
  document.getElementById('fc-ligne').value             = item.ligne || '';
  
  document.getElementById('fc-desc-ligne').value        = item.description_ligne || '';
document.getElementById('fc-couleur-hex').value       = item.couleur_hex || 'var(--gris)';
  apercuCouleurCollection(document.getElementById('fc-couleur-hex'));
  document.getElementById('fc-photo-url').value         = item.photo_url || '';
  const preview = document.getElementById('fc-photo-preview');
  if (preview) preview.innerHTML = item.photo_url ? `<img src="${item.photo_url}" class="photo-preview">` : '';
  document.getElementById('fc-photo-url-noel').value    = item.photo_url_noel || '';
  const previewNoel = document.getElementById('fc-photo-preview-noel');
  if (previewNoel) previewNoel.innerHTML = item.photo_url_noel ? `<img src="${item.photo_url_noel}" class="photo-preview">` : '';
  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  document.getElementById('fc-toggle-mode').classList.add('cache');
  document.getElementById('form-collections').classList.add('visible');
  window.scrollTo(0, 0);
  ingredientsBase = [];
  rafraichirListeIngredientsBase();
  const res = await appelAPI('getRecettesBase');
  if (res && res.items) {
    ingredientsBase = res.items
      .filter(i => i.collection === item.collection && i.ligne === item.ligne)
      .map(i => ({ type: i.ingredient_type, nom: i.ingredient_nom, quantite: i.quantite_g }));
    rafraichirListeIngredientsBase();
  }
}


async function sauvegarderCollection() {
  const btnSauvegarder = document.querySelector('#form-collections .btn-primary');
  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = '<span class="spinner"></span> Sauvegarde…'; }
  const rowIndex = document.getElementById('fc-rowIndex').value;
  const mode     = document.getElementById('fc-mode').value;

  if (mode === 'ligne') {
    const col   = document.getElementById('fc-collection-ligne').value;
    const ligne = document.getElementById('fc-ligne').value.toUpperCase();
    if (!col || !ligne) {
      if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
      afficherMsg('collections', 'Le nom de la ligne est requis.', 'erreur');
      return;
    }
    await appelAPIPost('saveRecetteBase', {
      collection: col,
      ligne,
      ingredients: ingredientsBase.map(i => ({ type: i.type, nom: i.nom, quantite_g: i.quantite }))
    });
 const infoCol = donneesCollections.find(i => i.collection === col);
    const d = {
      mode:              'ligne',
      collection:        col,
      ligne,
      ancienneLigne:     document.getElementById('fc-ligne').dataset.ancienne || '',
      description_ligne: document.getElementById('fc-desc-ligne').value,
    };
  const res = rowIndex
      ? await appelAPIPost('updateCollectionItem', { ...d, rowIndex: parseInt(rowIndex) })
      : await appelAPIPost('addCollectionItem', d);
    if (res && res.success) {
      if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
      fermerFormCollection();
      afficherMsg('collections', rowIndex ? 'Ligne mise à jour.' : 'Ligne ajoutée.');
      await chargerCollections();
    } else {
      afficherMsg('collections', 'Erreur lors de la sauvegarde.', 'erreur');
      if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    }
    return;
  }

  const d = {
    rang:                   document.getElementById('fc-rang').value,
    collection:             document.getElementById('fc-collection').value.toUpperCase(),
    slogan:                 document.getElementById('fc-slogan').value,
    description_collection: document.getElementById('fc-desc-col').value,
    couleur_hex:            document.getElementById('fc-couleur-hex').value,
    photo_url:              document.getElementById('fc-photo-url').value,
    photo_url_noel:         document.getElementById('fc-photo-url-noel').value,
  };
  if (!d.collection) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    afficherMsg('collections', 'Le nom de la collection est requis.', 'erreur');
    return;
  }
  const res = rowIndex
    ? await appelAPIPost('updateCollectionItem', { ...d, rowIndex: parseInt(rowIndex) })
    : await appelAPIPost('addCollectionItem', d);
  if (res && res.success) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    fermerFormCollection();
    afficherMsg('collections', rowIndex ? 'Entrée mise à jour.' : 'Entrée ajoutée.');
    chargerCollections();
  } else {
    afficherMsg('collections', 'Erreur lors de la sauvegarde.', 'erreur');
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  }
}
async function supprimerCollection(col, groupe) {
  if (!donneesRecettes.length) {
    const res = await appelAPI('getRecettes');
    donneesRecettes = (res && res.recettes) ? res.recettes : [];
  }
  const recettesLiees = donneesRecettes.filter(r => r.collection === col);
  if (recettesLiees.length > 0) {
    afficherMsg('collections', `Impossible — ${recettesLiees.length} recette(s) référencent cette collection. Modifiez-les d'abord.`, 'erreur');
    return;
  }
  const lignes = groupe.lignes ? groupe.lignes.length : 0;
  const msg = lignes > 0
    ? `Cette collection contient ${lignes} ligne(s). Supprimer quand même ?`
    : 'Supprimer cette collection ?';
  confirmerAction(msg, async () => {
  const rowIndexes = donneesCollections.filter(i => i.collection === col).map(i => i.rowIndex).sort((a, b) => b - a);
    for (const rowIndex of rowIndexes) {
      const res = await appelAPIPost('deleteCollectionItem', { rowIndex });
      if (!res || !res.success) {
        afficherMsg('collections', 'Erreur lors de la suppression.', 'erreur');
        return;
      }
    }
    fermerFicheCollection();
    afficherMsg('collections', 'Collection supprimée.');
    await chargerCollections();
  });
}

async function supprimerLigne(rowIndex, collection, ligne) {
  if (!donneesRecettes.length) {
    const res = await appelAPI('getRecettes');
    donneesRecettes = (res && res.recettes) ? res.recettes : [];
  }
  const recettesLiees = donneesRecettes.filter(r => r.collection === collection && r.ligne === ligne);
  if (recettesLiees.length > 0) {
    afficherMsg('collections', `Impossible — ${recettesLiees.length} recette(s) référencent cette ligne. Modifiez-les d'abord.`, 'erreur');
    return;
  }
  confirmerAction('Supprimer cette ligne ?', async () => {
    const res = await appelAPIPost('deleteCollectionItem', { rowIndex });
    if (res && res.success) {
      fermerFicheLigne();
      fermerFicheCollection();
      afficherMsg('collections', 'Ligne supprimée.');
      await chargerCollections();
    } else {
      afficherMsg('collections', 'Erreur.', 'erreur');
    }
  });
}

/* ════════════════════════════════
   RECETTES
════════════════════════════════ */
let donneesRecettes = [];
let recetteActive = null;
let collectionsDisponibles = {};
let donneesDensites = [];

async function chargerRecettes() {
  const res = await appelAPI('getRecettes');
  if (!res || !res.success) { afficherMsg('recettes', 'Erreur.', 'erreur'); return; }
  donneesRecettes = (res.recettes || []).sort((a, b) =>
    (parseInt(a.rang) || 99) - (parseInt(b.rang) || 99) ||
    (a.ligne || '').localeCompare(b.ligne || '') ||
    (a.nom || '').localeCompare(b.nom || '')
  );
  afficherRecettes();
}

async function afficherRecettes() {
  const loading = document.getElementById('loading-recettes');
  const grille  = document.getElementById('grille-recettes');
  const vide    = document.getElementById('vide-recettes');
  if (loading) loading.classList.add('cache');
  grille.classList.add('cache');
  vide.classList.add('cache');
  document.getElementById('filtre-recette-collection').value = '';
  document.getElementById('filtre-recette-ligne').innerHTML  = '<option value="">Toutes les lignes</option>';
  document.getElementById('filtre-recette-ligne').disabled   = true;
  await chargerCollectionsPourSelecteur();

  if (!donneesRecettes.length) { loading.classList.add('cache'); vide.classList.remove('cache'); return; }

grille.innerHTML = '';
  grille.classList.remove('cache');
  loading.classList.add('cache');

  const parCollection = {};
  const ordreCollections = [];
  donneesRecettes.forEach(rec => {
    const col = rec.collection || '—';
    if (!parCollection[col]) { parCollection[col] = {}; ordreCollections.push(col); }
    const ligne = rec.ligne || '';
    if (!parCollection[col][ligne]) parCollection[col][ligne] = [];
    parCollection[col][ligne].push(rec);
  });

  ordreCollections.forEach(col => {
    const secCol = document.createElement('div');
    secCol.className = 'recette-section-collection';
    secCol.dataset.collection = col;
    secCol.innerHTML = `<div class="recette-collection-titre">${col.toUpperCase()}</div>`;

    const lignes = parCollection[col];
    Object.keys(lignes).forEach(ligne => {
      const secLigne = document.createElement('div');
      secLigne.className = 'recette-section-ligne';
      secLigne.dataset.ligne = ligne;
      if (ligne) {
        secLigne.innerHTML = `<div class="recette-ligne-titre">${ligne.toUpperCase()}</div>`;
      }
      const grilleInner = document.createElement('div');
      grilleInner.className = 'recette-cartes-grille';

      lignes[ligne].forEach(rec => {
        const couleur = rec.couleur_hex || 'var(--gris)';
        const div = document.createElement('div');
        div.className = 'recette-carte';
        div.onclick = () => ouvrirFicheRecette(rec.recette_id);
        div.style.setProperty('--col-hex', couleur);
        div.innerHTML = `
          <div class="recette-visuel">
            <div class="recette-couleur">
              ${rec.image_url
                ? `<img src="${rec.image_url}" alt="${rec.nom}" onerror="this.style.display='none'">`
                : `<div class="recette-photo-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Photo à venir
                  </div>`}
              <div class="recette-couleur-overlay"></div>
              <div class="recette-dot"></div>
            </div>
          </div>
		  <div class="recette-infos ${couleurTexteContraste(couleur)}">
          

		<span class="recette-badge">${rec.collection || '—'} · ${rec.statut === 'public' ? 'Public' : 'Test'}</span>
            <div class="recette-nom">${rec.nom || '—'}</div>
            <div class="recette-ligne">${rec.ligne || ''}</div>
            <div class="recette-bas">
              <span class="recette-prix">${Array.isArray(rec.formats_complets) && rec.formats_complets.length ? rec.formats_complets.map(f => `${parseFloat(f.prix_vente).toFixed(2).replace('.', ',')} $ / ${f.poids} ${f.unite}`).join(' · ') : ''}</span>
            </div>
			
			
          </div>`;
        grilleInner.appendChild(div);
      });

      secLigne.appendChild(grilleInner);
      secCol.appendChild(secLigne);
    });

    grille.appendChild(secCol);
  });
  peuplerFiltresRecettes();
}

function peuplerFiltresRecettes() {
  const sel = document.getElementById('filtre-recette-collection');
  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">Toutes les collections</option>';
const collections = [...new Set(donneesRecettes.map(r => r.collection).filter(Boolean))]
    .sort((a, b) => {
      const rangA = (donneesCollections.find(i => i.collection === a) || {}).rang || 99;
      const rangB = (donneesCollections.find(i => i.collection === b) || {}).rang || 99;
      return rangA - rangB || a.localeCompare(b);
    });
  collections.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col; opt.textContent = col;
    sel.appendChild(opt);
  });
  sel.value = valActuelle;
}

function onFiltreCollection() {
  const col = document.getElementById('filtre-recette-collection').value;
  const selLigne = document.getElementById('filtre-recette-ligne');
  selLigne.innerHTML = '<option value="">Toutes les lignes</option>';
  if (col) {
    const lignes = [...new Set(donneesRecettes.filter(r => r.collection === col).map(r => r.ligne).filter(Boolean))].sort();
    lignes.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l; opt.textContent = l;
      selLigne.appendChild(opt);
    });
    selLigne.disabled = false;
  } else {
    selLigne.disabled = true;
  }
  filtrerRecettes();
}

function filtrerRecettes() {
  const col    = document.getElementById('filtre-recette-collection').value;
  const ligne  = document.getElementById('filtre-recette-ligne').value;
  const statut = document.getElementById('filtre-recette-statut').value;
  const nom      = (document.getElementById('filtre-recette-nom').value || '').toLowerCase().trim();
  const complet  = document.getElementById('filtre-recette-complet').value;
  const cartes = document.querySelectorAll('#grille-recettes .recette-carte');
  const vide   = document.getElementById('vide-recettes');
  let visible  = 0;
  cartes.forEach(carte => {
    const rec = donneesRecettes.find(r => r.nom === carte.querySelector('.recette-nom').textContent);
    if (!rec) return;
    const estIncomplet = !rec.nom || !rec.description || !rec.couleur_hex || !rec.collection
      || !rec.ligne || !rec.formats_complets || rec.formats_complets.length === 0 || !rec.image_url || !rec.statut || !rec.surgras
      || (rec.ingredients || []).some(i => !i.inci);
    const ok = (!col || rec.collection === col)
            && (!ligne || rec.ligne === ligne)
            && (!statut || (rec.statut || 'test') === statut)
            && (!nom || rec.nom.toLowerCase().includes(nom))
            && (!complet || (complet === 'incomplet' && estIncomplet) || (complet === 'complet' && !estIncomplet));
    carte.classList.toggle('cache', !ok);
    if (ok) visible++;
  });
  vide.classList.toggle('cache', visible !== 0);

document.querySelectorAll('#grille-recettes .recette-section-ligne').forEach(sec => {
    const secCol = sec.closest('.recette-section-collection');
    const okCol = !col || secCol?.dataset.collection === col;
    const okLigne = !ligne || sec.dataset.ligne === ligne;
    const aDesCartesVisibles = [...sec.querySelectorAll('.recette-carte')].some(c => !c.classList.contains('cache'));
    sec.classList.toggle('cache', !(okCol && okLigne) || !aDesCartesVisibles);
  });

  document.querySelectorAll('#grille-recettes .recette-section-collection').forEach(sec => {
    const okCol = !col || sec.dataset.collection === col;
    const aDesLignesVisibles = [...sec.querySelectorAll('.recette-section-ligne')].some(l => !l.classList.contains('cache'));
    sec.classList.toggle('cache', !okCol || !aDesLignesVisibles);
  });
}

function reinitialiserFiltresRecettes() {
  document.getElementById('filtre-recette-collection').value = '';
  document.getElementById('filtre-recette-ligne').value = '';
  document.getElementById('filtre-recette-statut').value = '';
  document.getElementById('filtre-recette-nom').value = '';
  document.getElementById('filtre-recette-complet').value = '';
  document.getElementById('filtre-recette-ligne').disabled = true;
  filtrerRecettes();
}



   
async function chargerCollectionsPourSelecteur() {
  const sel = document.getElementById('fr-collection');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  collectionsDisponibles = {};
  (donneesCollections || []).forEach(item => {
    if (!collectionsDisponibles[item.collection]) collectionsDisponibles[item.collection] = [];
    if (item.ligne && !collectionsDisponibles[item.collection].includes(item.ligne))
      collectionsDisponibles[item.collection].push(item.ligne);
  });
 const colsParRang = Object.keys(collectionsDisponibles).sort((a, b) => {
    const rangA = (donneesCollections.find(i => i.collection === a) || {}).rang || 99;
    const rangB = (donneesCollections.find(i => i.collection === b) || {}).rang || 99;
    return rangA - rangB;
  });
  colsParRang.forEach(col => {
    const o = document.createElement('option');
    o.value = col; o.textContent = col; sel.appendChild(o);
  });
  const selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    selSec.innerHTML = '';
    colsParRang.forEach(col => {
		
		
		
      const label = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = col; cb.id = 'sec-' + col;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(col));
      selSec.appendChild(label);
    });
  }
}

async function mettreAJourLignes() {
  const col = document.getElementById('fr-collection').value;
  const sel = document.getElementById('fr-ligne');
  sel.innerHTML = '';
  const lignes = collectionsDisponibles[col] || [];
  if (!lignes.length) { sel.innerHTML = '<option value="">— Aucune ligne —</option>'; return; }
  lignes.forEach(l => {
    const o = document.createElement('option'); o.value = l; o.textContent = l; sel.appendChild(o);
  });
  await chargerIngredientsBaseRecette();
}

async function chargerIngredientsBaseRecette() {
  const col   = document.getElementById('fr-collection').value;
  const ligne = document.getElementById('fr-ligne').value;
  if (!col || !ligne) return;
  const res = await appelAPI('getRecettesBase');
  if (!res || !res.items) return;
  ingredientsBase = res.items
    .filter(i => i.collection === col && i.ligne === ligne)
    .map(i => ({ type: i.ingredient_type, nom: i.ingredient_nom, quantite: i.quantite_g }));
  if (!document.getElementById('fr-id').value) {
    ingredientsRecette = [...ingredientsBase];
    rafraichirListeIngredientsRecette();
  }
  rafraichirListeIngredientsBase();
}



async function ouvrirFicheRecette(id) {
  const rec = donneesRecettes.find(r => r.recette_id === id);
  if (!rec) return;
  recetteActive = rec;
  const resFormats = await appelAPIPost('getRecettesFormats', { recette_id: id });
  const formats = (resFormats && resFormats.formats) ? resFormats.formats : [];
  const estSavon = (rec.ligne || '').trim().toLowerCase().startsWith('savon');
  const formatsHtml = formats.length
    ? formats.map(f => {
        const incomplet = !f.poids || !f.unite || !f.prix_vente;
        return `<div class="fiche-ingredient${incomplet ? ' fiche-label-manquant' : ''}"><span class="fiche-ing-nom">${f.poids || '⚠ poids'} ${f.unite || '⚠ unité'}</span><span class="fiche-ing-qte">${f.prix_vente ? formaterPrix(f.prix_vente) : '⚠ prix'}</span>${f.desc_emballage ? `<span class="fiche-label">${f.desc_emballage}</span>` : ''}</div>`;
      }).join('')
    : '<div class="fiche-vide fiche-label-manquant">⚠ Aucun format</div>';
  document.getElementById('fiche-recette-titre').textContent = rec.nom || '—';
  const ings = rec.ingredients && rec.ingredients.length
    ? [...rec.ingredients].sort((a, b) => b.quantite_g - a.quantite_g).map(i => {
        const sansCinci = i.type !== 'Fragrances' && !i.inci;
        return `<div class="fiche-ingredient"><span class="fiche-ing-nom${sansCinci ? ' fiche-label-manquant' : ''}">${sansCinci ? '⚠ ' : ''}${i.nom}</span><span class="fiche-ing-inci">${i.inci || ''}</span><span class="fiche-ing-qte">${i.quantite_g} g</span></div>`;
      }).join('')
    : '<div class="fiche-vide">Aucun ingrédient</div>';
  const m = (champ) => !rec[champ] ? ' fiche-label-manquant' : '';
  document.getElementById('fiche-recette-contenu').innerHTML = `
  <div class="fiche-visuel">
      ${rec.image_url ? `<img src="${rec.image_url}" class="fiche-visuel-photo">` : ''}
      ${rec.image_url_noel ? `<img src="${rec.image_url_noel}" class="fiche-visuel-photo">` : ''}
      <div class="fiche-visuel-hex" style="background:${rec.couleur_hex || 'var(--beige)'}"></div>
    </div>
    <div class="fiche-grille">
      <div class="fiche-champ"><span class="fiche-label${m('collection')}">Collection</span><span class="fiche-valeur">${rec.collection || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Collections secondaires</span><span class="fiche-valeur">${Array.isArray(rec.collections_secondaires) && rec.collections_secondaires.length ? rec.collections_secondaires.join(', ') : '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label${m('ligne')}">Ligne</span><span class="fiche-valeur">${rec.ligne || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label${(!rec.formats_complets || rec.formats_complets.length === 0) ? ' fiche-label-manquant' : ''}">Format</span><span class="fiche-valeur">${rec.formats_complets && rec.formats_complets.length ? rec.formats_complets.map(f => `${f.poids} ${f.unite} — ${formaterPrix(f.prix_vente)}`).join(', ') : '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Statut</span><span class="fiche-valeur">${rec.statut || 'test'}</span></div>
      
      <div class="fiche-champ"><span class="fiche-label">Cure</span><span class="fiche-valeur">${rec.cure || '—'} jours</span></div>
      <div class="fiche-champ"><span class="fiche-label">Nb unités</span><span class="fiche-valeur">${rec.nb_unites || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label${estSavon && !rec.surgras ? ' fiche-label-manquant' : ''}">Surgras</span><span class="fiche-valeur">${rec.surgras || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Rang</span><span class="fiche-valeur">${rec.rang || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label${m('couleur_hex')}">Couleur HEX</span><span class="fiche-valeur">${rec.couleur_hex || '—'}</span></div>
    </div>
    <div class="fiche-section-titre${!rec.description ? ' fiche-label-manquant' : ''}">Description</div>
    <div class="fiche-texte">${rec.description || '—'}</div>
    <div class="fiche-section-titre">Description emballage</div>
    <div class="fiche-texte">${rec.desc_emballage || '—'}</div>
    <div class="fiche-section-titre">Instructions</div>
    <div class="fiche-texte">${rec.instructions || '—'}</div>
    <div class="fiche-section-titre">Notes</div>
    <div class="fiche-texte">${rec.notes || '—'}</div>
    <div class="fiche-section-titre">Ingrédients</div>
    <div class="fiche-ingredients">${ings}</div>
    <div class="fiche-section-titre">Formats disponibles</div>
    <div class="fiche-ingredients">${formatsHtml}</div>
    <div class="fiche-section-titre">Liste INCI</div>
    ${(() => {
      const manquants = (rec.ingredients || []).filter(i => i.type !== 'Fragrances' && !(listesDropdown.fullData||[]).find(d => d.type===i.type && d.ingredient.toLowerCase()===i.nom.toLowerCase() && d.inci));
      const avertissement = manquants.length > 0
        ? `<div class="msg-erreur">INCI manquants : ${manquants.map(i=>i.nom).join(', ')}</div>`
        : '';
      const inci = genererInci(rec.ingredients);
      const btnDisabled = manquants.length > 0 ? 'disabled' : '';
      return `${avertissement}<div class="fiche-texte" id="fiche-inci-texte">${inci}</div><button class="btn btn-secondary" ${btnDisabled} onclick="navigator.clipboard.writeText(document.getElementById('fiche-inci-texte').textContent)">Copier INCI</button>`;
    })()}
  `;
 fermerFormRecette();
  document.getElementById('fiche-recette').classList.add('visible');
  document.querySelector('#section-recettes .filtres-bar').classList.add('cache');
  document.getElementById('grille-recettes').classList.add('cache');
  document.getElementById('btn-nouvelle-recette').classList.add('cache');
  document.querySelector('.admin-contenu').scrollTop = 0;
}


function fermerFicheRecette() {
  document.getElementById('fiche-recette').classList.remove('visible');
  document.querySelector('#section-recettes .filtres-bar').classList.remove('cache');
  document.getElementById('grille-recettes').classList.remove('cache');
  document.getElementById('filtre-recette-nom').value = '';
  filtrerRecettes();
  recetteActive = null;
}

async function basculerModeEditionRecette() {
  if (!recetteActive) return;
  const id = recetteActive.recette_id;
  const rec = recetteActive;
  document.getElementById('fiche-recette').classList.remove('visible');
  await modifierRecette(id);
}

function supprimerRecetteActive() {
  if (!recetteActive) return;
  supprimerRecette(recetteActive.recette_id);
}


function ouvrirFormRecette() {
  formatsRecette = [];
  document.getElementById('form-recettes-titre').textContent = 'Nouvelle recette';
  document.getElementById('fr-id').value = '';
 ['fr-nom','fr-couleur','fr-format','fr-unites','fr-cure','fr-prix','fr-description','fr-instructions','fr-notes','fr-surgras']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('fr-statut').value = 'test';
  document.getElementById('fr-collection').value = '';
  document.getElementById('fr-ligne').innerHTML = '<option value="">— Choisir collection —</option>';
  document.getElementById('fr-couleur-visible').value = '';
  document.getElementById('fr-image-url').value = '';
  document.getElementById('fr-image-url-noel').value = '';
  const prevRecette = document.getElementById('fr-image-preview');
  if (prevRecette) { prevRecette.src = ''; prevRecette.classList.add('cache'); }
  const prevNoel = document.getElementById('fr-image-preview-noel');
  if (prevNoel) prevNoel.innerHTML = '';
  const apercuRecette = document.getElementById('fr-couleur-apercu');
  if (apercuRecette) apercuRecette.style.background = '';
 document.querySelector('#section-recettes .filtres-bar').classList.add('cache');
  document.getElementById('grille-recettes').classList.add('cache');
  document.getElementById('btn-nouvelle-recette').classList.add('cache');
  document.getElementById('form-recettes').classList.add('visible');
  window.scrollTo(0, 0);
}


function fermerFormRecette() {
  document.getElementById('form-recettes').classList.remove('visible');
  const filtresBar = document.querySelector('#section-recettes .filtres-bar');
  if (filtresBar) filtresBar.classList.remove('cache');
  document.getElementById('grille-recettes').classList.remove('cache');
  document.getElementById('btn-nouvelle-recette').classList.remove('cache');
}

async function modifierRecette(id) {
  const rec = donneesRecettes.find(r => r.recette_id === id);
  if (!rec) return;
  document.getElementById('form-recettes-titre').textContent = 'Modifier la recette';
  document.getElementById('fr-id').value           = rec.recette_id;
  document.getElementById('fr-nom').value          = rec.nom || '';
  document.getElementById('fr-couleur').value      = rec.couleur_hex || '';
  document.getElementById('fr-couleur-visible').value = rec.couleur_hex || '';
  const apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercuCouleurRecette(document.getElementById('fr-couleur-visible'));
document.getElementById('fr-unites').value       = rec.nb_unites || '';
  document.getElementById('fr-cure').value         = rec.cure || '';
  document.getElementById('fr-description').value  = rec.description || '';
   document.getElementById('fr-desc-emballage').value = rec.desc_emballage || '';
  document.getElementById('fr-instructions').value = rec.instructions || '';
  document.getElementById('fr-notes').value        = rec.notes || '';
  document.getElementById('fr-surgras').value      = rec.surgras || '';
  document.getElementById('fr-statut').value       = rec.statut || 'test';
document.getElementById('fr-collection').value   = rec.collection || '';
  mettreAJourLignes();
  
  document.getElementById('fr-ligne').value        = rec.ligne || '';
  document.getElementById('fr-image-url').value = rec.image_url || '';
  const preview = document.getElementById('fr-image-preview');
  if (preview) preview.innerHTML = rec.image_url ? `<img src="${rec.image_url}" class="photo-preview">` : '';
  document.getElementById('fr-image-url-noel').value = rec.image_url_noel || '';
  const previewNoel = document.getElementById('fr-image-preview-noel');
  if (previewNoel) previewNoel.innerHTML = rec.image_url_noel ? `<img src="${rec.image_url_noel}" class="photo-preview">` : '';
  const selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    Array.from(selSec.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
      cb.checked = false;
    });
    Array.from(selSec.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
      cb.checked = Array.isArray(rec.collections_secondaires) && rec.collections_secondaires.map(s => s.trim().toUpperCase()).includes(cb.value.trim().toUpperCase());
    });
  }
ingredientsRecette = (rec.ingredients || []).map(i => {
  const found = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === i.nom.toLowerCase());
  return { type: i.type, nom: found ? found.ingredient : i.nom, quantite: i.quantite_g };
}).sort((a, b) => b.quantite - a.quantite);
  const resFormats = await appelAPIPost('getRecettesFormats', { recette_id: rec.recette_id });
  formatsRecette = (resFormats && resFormats.formats) ? resFormats.formats.map(f => ({ poids: f.poids, unite: f.unite, prix: f.prix_vente, desc: f.desc_emballage })) : [];
  document.querySelector('#section-recettes .filtres-bar').classList.add('cache');
  document.getElementById('grille-recettes').classList.add('cache');
  document.getElementById('form-recettes').classList.add('visible');
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  window.scrollTo(0, 0);
}
async function sauvegarderRecette() {
  const btnSauvegarder = document.querySelector('#form-recettes .btn-primary');
  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = '<span class="spinner"></span> Sauvegarde…'; }
  const id = document.getElementById('fr-id').value;
  const d = {
    recette_id:   id || ('REC-' + Date.now()),
    nom:          document.getElementById('fr-nom').value.toUpperCase(),
    couleur_hex:  document.getElementById('fr-couleur').value,
    collection:   document.getElementById('fr-collection').value,
    ligne:        document.getElementById('fr-ligne').value,
  format:       '',
    nb_unites:    parseInt(document.getElementById('fr-unites').value) || 1,
    cure:         parseInt(document.getElementById('fr-cure').value) || 0,
    prix_vente:   0,
    description:  document.getElementById('fr-description').value,
    desc_emballage: document.getElementById('fr-desc-emballage').value,
    instructions: document.getElementById('fr-instructions').value,
    notes:        document.getElementById('fr-notes').value,
    surgras:      document.getElementById('fr-surgras').value,
    statut:       document.getElementById('fr-statut').value || 'test',
    image_url:         document.getElementById('fr-image-url').value,
    image_url_noel:    document.getElementById('fr-image-url-noel').value,
    collections_secondaires: Array.from(document.getElementById('fr-collections-secondaires')?.querySelectorAll('input[type="checkbox"]:checked') || []).map(cb => cb.value),
     ingredients:  ingredientsRecette.map(i => {
        const found = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === i.nom.toLowerCase());
        return { type: i.type, nom: i.nom, quantite_g: i.quantite, cout: 0, inci: found ? (found.inci || '') : '' };
      })
  };
  if (!d.nom) { afficherMsg('recettes', 'Le nom est requis.', 'erreur'); return; }
 const res = await appelAPIPost('saveRecette', d);
if (res && res.success) {
    await appelAPIPost('deleteAllRecetteFormats', { recette_id: d.recette_id });
    for (const f of formatsRecette) {
      await appelAPIPost('saveRecetteFormat', { recette_id: d.recette_id, poids: f.poids, unite: f.unite, prix_vente: f.prix, desc_emballage: f.desc || '' });
    }
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
   fermerFormRecette();
    afficherMsg('recettes', id ? 'Recette mise à jour.' : 'Recette créée.');
    await chargerRecettes();
  } else {
    afficherMsg('recettes', 'Erreur.', 'erreur');
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  }
}

// ─── CLOUDINARY ───
let _mediaLibrary = null;
let _mediaLibraryChampId = null;
let _mediaLibraryPreviewId = null;

function ajusterHauteurTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function ouvrirMediaLibrary(champId, previewId) {
  if (typeof cloudinary === 'undefined') {
    afficherMsg('recettes', 'La librairie photo n\'est pas disponible. Rechargez la page.', 'erreur');
    return;
  }
  _mediaLibraryChampId = champId;
  _mediaLibraryPreviewId = previewId;
  _mediaLibrary = cloudinary.createMediaLibrary(
    { cloud_name: 'dfasrauyy', api_key: '' },
    {
      insertHandler: function(data) {
        if (data && data.assets && data.assets.length > 0) {
          const url = data.assets[0].secure_url;
          document.getElementById(_mediaLibraryChampId).value = url;
          const preview = document.getElementById(_mediaLibraryPreviewId);
          if (preview) preview.innerHTML = `<img src="${url}" class="photo-preview">`;
        }
      }
    }
  );
_mediaLibrary.show();
  setTimeout(function nettoyerOverlayCloudinary() {
    const overlays = document.querySelectorAll('body > div[style*="z-index: 99999"]');
    overlays.forEach(el => {
      if (el.style.visibility === 'hidden' || el.style.display === 'none') el.remove();
    });
    if (document.querySelector('body > div[style*="z-index: 99999"]')) {
      setTimeout(nettoyerOverlayCloudinary, 1000);
    }
  }, 2000);
}

function fermerMediaLibrary() {
  document.getElementById('modal-cloudinary').classList.add('cache');
}

function ouvrirCloudinary()           { ouvrirMediaLibrary('fr-image-url',     'fr-image-preview');       }
function ouvrirCloudinaryCollection()      { ouvrirMediaLibrary('fc-photo-url',      'fc-photo-preview');      }
function ouvrirCloudinaryCollectionNoel()  { ouvrirMediaLibrary('fc-photo-url-noel', 'fc-photo-preview-noel'); }
function ouvrirCloudinaryLigne()      { ouvrirMediaLibrary('fc-photo-url-ligne','fc-photo-preview-ligne'); }

// ─── MÉDIATHÈQUE — GESTION ───

async function chargerMediatheque() {
  document.getElementById('med-chargement').classList.remove('cache');
  const res = await appelAPI('getMediatheque');
  document.getElementById('med-chargement').classList.add('cache');
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de chargement.', 'erreur'); return; }
  _mediathequeDonnees = res.items;
  const cats = [...new Set(res.items.map(i => i.categorie).filter(Boolean))].sort();
  const sel = document.getElementById('med-filtre-cat');
  sel.innerHTML = '<option value="">Toutes les catégories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  medFiltrer();
}

function medFiltrer() {
  const cat = document.getElementById('med-filtre-cat').value;
  const items = (_mediathequeDonnees || []).filter(i => !cat || i.categorie === cat);
  const grille = document.getElementById('med-grille');
  document.getElementById('med-compteur').textContent = items.length + ' photo(s)';
  if (!items.length) { grille.innerHTML = '<p class="vide-desc">Aucune photo.</p>'; return; }
  grille.innerHTML = items.map(i => `
    <div class="collection-carte">
      <div class="carte-visuel"><img src="${i.url}" alt="${i.nom}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;"></div>
      <div class="fiche-label">${i.nom}</div>
      <div class="texte-secondaire">${i.categorie}</div>
     <div class="collection-carte-actions">
      </div>
    </div>`).join('');
}


async function mediathequeSyncCloudinary() {
  const msg = document.getElementById('msg-mediatheque');
  afficherMsg('mediatheque', 'Synchronisation en cours…');
  const res = await appelAPI('syncCloudinary');
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de synchronisation.', 'erreur'); return; }
  _mediathequeDonnees = null;
  afficherMsg('mediatheque', `✅ ${res.ajouts} photo(s) ajoutée(s).`);
  chargerMediatheque();
}

function mediathequeOuvrirAjout() {
  document.getElementById('med-form-ajout').classList.remove('cache');
  document.getElementById('med-url').value = '';
  document.getElementById('med-nom').value = '';
  document.getElementById('med-categorie').value = '';
  document.getElementById('med-url').focus();
}

function mediathequeFermerAjout() {
  document.getElementById('med-form-ajout').classList.add('cache');
}

async function mediathequeSauvegarder() {
  const url = document.getElementById('med-url').value.trim();
  const nom = document.getElementById('med-nom').value.trim();
  const cat = document.getElementById('med-categorie').value;
  if (!url || !nom || !cat) { afficherMsg('mediatheque', 'URL, nom et catégorie requis.', 'erreur'); return; }
  const res = await appelAPIPost('saveMediatheque', { url, nom, categorie: cat });
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de sauvegarde.', 'erreur'); return; }
  _mediathequeDonnees = null;
  mediathequeFermerAjout();
  afficherMsg('mediatheque', `✅ "${nom}" ajoutée.`);
  chargerMediatheque();
}

async function mediathequeSupprimer(rowIndex, nom) {
  if (!confirm(`Supprimer "${nom}" de la médiathèque?`)) return;
  const res = await appelAPIPost('supprimerMediatheque', { rowIndex });
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de suppression.', 'erreur'); return; }
  _mediathequeDonnees = null;
  afficherMsg('mediatheque', `✅ "${nom}" supprimée.`);
  chargerMediatheque();
}

// ─── MÉDIATHÈQUE — SÉLECTEUR ───
let _mediathequeChampId = null;
let _mediathequePreviewId = null;
let _mediathequeDonnees = null;

async function ouvrirMediatheque(champId, previewId, categorie) {
  _mediathequeChampId = champId;
  _mediathequePreviewId = previewId;
  const overlay = document.getElementById('modal-mediatheque');
  overlay.classList.add('ouvert');
  if (!_mediathequeDonnees) {
    document.getElementById('mediatheque-chargement').classList.remove('cache');
    const res = await appelAPI('getMediatheque');
    document.getElementById('mediatheque-chargement').classList.add('cache');
    if (res && res.success) _mediathequeDonnees = res.items;
  }
  peuplerFiltresCategoriesMediatheque();
  const sel = document.getElementById('mediatheque-filtre-cat');
  sel.value = categorie || '';
  filtrerMediatheque();
}

function peuplerFiltresCategoriesMediatheque() {
  const sel = document.getElementById('mediatheque-filtre-cat');
  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">Toutes les catégories</option>';
  const cats = [...new Set((_mediathequeDonnees || []).map(i => i.categorie).filter(Boolean))].sort();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
  sel.value = valActuelle;
}

function filtrerMediatheque() {
  const cat = document.getElementById('mediatheque-filtre-cat').value;
  const nom = (document.getElementById('mediatheque-filtre-nom').value || '').toLowerCase();
  const items = (_mediathequeDonnees || []).filter(i =>
    (!cat || i.categorie === cat) && (!nom || i.nom.toLowerCase().includes(nom))
  );
const grille = document.getElementById('mediatheque-grille');
  grille.className = 'collections-grille';
  if (!items.length) { grille.innerHTML = '<p class="vide-desc">Aucune photo</p>'; return; }
grille.innerHTML = items.map(i => `
    <div class="collection-carte" onclick="selectionnerPhotoMediatheque('${i.url}', '${i.nom}')">
      <div class="carte-visuel"><img src="${i.url}" alt="${i.nom}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;"></div>
      <div class="fiche-label">${i.nom}</div>
      <div class="texte-secondaire">${i.categorie}</div>
    </div>`).join('');
}

function selectionnerPhotoMediatheque(url, nom) {
  const champ = document.getElementById(_mediathequeChampId);
  if (champ) champ.value = url;
  const preview = document.getElementById(_mediathequePreviewId);
  if (preview) preview.innerHTML = `<img src="${url}" class="photo-preview">`;
  fermerModalMediatheque();
}


function fermerModalMediatheque() {
  document.getElementById('modal-mediatheque').classList.remove('ouvert');
}

function basculerModeFormCollection() {
  const mode    = document.getElementById('fc-mode');
  const blocCol = document.getElementById('fc-bloc-collection');
  const blocLig = document.getElementById('fc-bloc-ligne');
  const titre   = document.getElementById('form-collections-titre');
  const toggle  = document.getElementById('fc-toggle-mode');
  const col     = document.getElementById('fc-collection').value;

  if (mode.value === 'collection') {
    mode.value = 'ligne';
    blocCol.classList.add('cache');
    blocLig.classList.remove('cache');
    titre.textContent = 'Nouvelle ligne — ' + (col || '');
    toggle.textContent = '← Retour collection';
    document.getElementById('fc-collection-ligne').value = col;
  } else {
    mode.value = 'collection';
    blocCol.classList.remove('cache');
    blocLig.classList.add('cache');
    titre.textContent = document.getElementById('fc-rowIndex').value ? 'Modifier la collection' : 'Nouvelle collection';
    toggle.textContent = '+ Ajouter une ligne';
  }
}






function apercuCouleurCollection(input) {
  const val = input.value.trim();
  const apercuId = input.id === 'fc-couleur-hex' ? 'fc-couleur-apercu' : 'fc-couleur-apercu-ligne';
  const apercu = document.getElementById(apercuId);
  if (!apercu) return;
  apercu.style.background = /^#[0-9a-fA-F]{6}$/.test(val) ? val : 'var(--beige)';
}
function apercuCouleurRecette(input) {
  const apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercu.style.background = /^#[0-9a-fA-F]{6}$/.test(input.value.trim()) ? input.value.trim() : 'var(--beige)';
  document.getElementById('fr-couleur').value = input.value;
}

// ─── INGRÉDIENTS RECETTE ───
let ingredientsRecette = [];

function ajouterIngredientRecette(type='', nom='', quantite=0) {
  ingredientsRecette.push({ type, nom, quantite });
  rafraichirListeIngredientsRecette();
}

function supprimerIngredientRecette(index) {
  ingredientsRecette.splice(index, 1);
  rafraichirListeIngredientsRecette();
}

function rafraichirListeIngredientsRecette() {
  const liste = document.getElementById('liste-ingredients-recette');
  if (!liste) return;
  if (ingredientsRecette.length === 0) { liste.innerHTML = ''; return; }
  liste.innerHTML = ingredientsRecette.map((ing, i) => `
    <div class="ingredient-rangee">
      <select class="form-ctrl ing-type" onchange="ingredientsRecette[${i}].type=this.value; ingredientsRecette[${i}].nom=''; rafraichirListeIngredientsRecette()">
        <option value="">— Type —</option>
        ${(listesDropdown.types || []).map(t => `<option value="${t}" ${ing.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
      <select class="form-ctrl ing-nom" onchange="if(this.value==='__nouveau__'){ajouterIngredientInci('${ing.type}',${i})}else{ingredientsRecette[${i}].nom=this.value; rafraichirListeIngredientsRecette()}">
        <option value="">— Ingrédient —</option>
        ${(listesDropdown.fullData || []).filter(d => d.type===ing.type).map(d => `<option value="${d.ingredient}" ${ing.nom===d.ingredient?'selected':''}>${d.ingredient}</option>`).join('')}
        <option value="__nouveau__">+ Ajouter un ingrédient</option>
      </select>
      <input type="text" class="form-ctrl ing-inci" readonly placeholder="INCI" value="${(listesDropdown.fullData||[]).find(d=>d.type===ing.type&&d.ingredient===ing.nom)?.inci||''}">
      <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${ing.quantite||''}" placeholder="g" onchange="ingredientsRecette[${i}].quantite=parseFloat(this.value)||0">
      <button class="btn btn-sm btn-danger" onclick="supprimerIngredientRecette(${i})">✕</button>
    </div>
  `).join('');
}

let _modalInciCtx = { categorie: '', index: 0, liste: 'recette' };

function ajouterIngredientInci(categorie, index, liste = 'recette') {
  _modalInciCtx = { categorie, index, liste };
  document.getElementById('modal-ajouter-inci-titre').textContent = `Nouvel ingrédient — ${categorie}`;
  document.getElementById('modal-inci-nom').value = '';
  document.getElementById('modal-inci-url').value = '';
  document.getElementById('modal-inci-statut').textContent = '';
  document.getElementById('modal-inci-statut').classList.add('cache');
  document.getElementById('modal-inci-btn-go').disabled = false;
  document.getElementById('modal-ajouter-inci').classList.add('ouvert');
}

function fermerModalAjouterInci() {
  document.getElementById('modal-ajouter-inci').classList.remove('ouvert');
  document.getElementById('modal-inci-nom').value   = '';
  document.getElementById('modal-inci-url').value   = '';
  document.getElementById('modal-inci-fourn').value = '';
  document.getElementById('modal-inci-inci').value  = '';
  document.getElementById('modal-inci-bot').value   = '';
  document.getElementById('modal-inci-note').value  = '';
  document.getElementById('modal-inci-champs-manuels').classList.add('cache');
  document.getElementById('modal-inci-groupe-url').classList.remove('cache');
  document.getElementById('modal-inci-groupe-fourn').classList.remove('cache');
  document.getElementById('modal-inci-btn-go').textContent = 'Go';
  document.getElementById('modal-inci-statut').classList.add('cache');
}

function modalInciSyncNomUC() {
  const nom = document.getElementById('modal-inci-nom').value;
  const fourn = document.getElementById('modal-inci-fourn').value.trim();
  if (fourn) {
    document.getElementById('modal-inci-inci').value;
  }
}

function modalInciToggleChamps() {
  const url   = document.getElementById('modal-inci-url').value.trim();
  const fourn = document.getElementById('modal-inci-fourn').value.trim();
  const groupeUrl   = document.getElementById('modal-inci-groupe-url');
  const groupeFourn = document.getElementById('modal-inci-groupe-fourn');
  const champsMan   = document.getElementById('modal-inci-champs-manuels');
  const btnGo       = document.getElementById('modal-inci-btn-go');

  if (url) {
    groupeFourn.classList.add('cache');
    champsMan.classList.add('cache');
    btnGo.textContent = 'Go';
  } else if (fourn) {
    groupeUrl.classList.add('cache');
    champsMan.classList.remove('cache');
    btnGo.textContent = 'Valider';
  } else {
    groupeUrl.classList.remove('cache');
    groupeFourn.classList.remove('cache');
    champsMan.classList.add('cache');
    btnGo.textContent = 'Go';
  }
}

async function modalInciGo() {
  const nom   = document.getElementById('modal-inci-nom').value.trim();
  const url   = document.getElementById('modal-inci-url').value.trim();
  const fourn = document.getElementById('modal-inci-fourn').value.trim();
  const { categorie, index, liste } = _modalInciCtx;

  if (!nom) { afficherStatutModalInci('Le nom est requis.'); return; }
  if (!url && !fourn) { afficherStatutModalInci('URL ou nom de fournisseur requis.'); return; }
  if (fourn && !url) {
    await appelAPIPost('saveIngredientInci', {
      nom, categorie, source: fourn,
      inci:          document.getElementById('modal-inci-inci').value.trim(),
      nomBotanique:  document.getElementById('modal-inci-bot').value.trim(),
      noteOlfactive: document.getElementById('modal-inci-note').value.trim(),
      nomUC:         nom
    });
    await chargerListesFournisseurs();
    fermerModalAjouterInci();
    if (liste === 'base') { ingredientsBase[index].nom = nom; rafraichirListeIngredientsBase(); }
    else { ingredientsRecette[index].nom = nom; rafraichirListeIngredientsRecette(); }
    return;
  }

  const btn = document.getElementById('modal-inci-btn-go');
  btn.disabled = true;
  afficherStatutModalInci('Sauvegarde de la recette…');

  // 1. Sauvegarder la recette au point actuel (silencieux)
  const id = document.getElementById('fr-id')?.value;
  if (id) {
    const d = {
      recette_id:   id,
      nom:          document.getElementById('fr-nom').value.toUpperCase(),
      couleur_hex:  document.getElementById('fr-couleur').value,
      collection:   document.getElementById('fr-collection').value,
      ligne:        document.getElementById('fr-ligne').value,
      format:       '',
      nb_unites:    parseInt(document.getElementById('fr-unites').value) || 1,
      cure:         parseInt(document.getElementById('fr-cure').value) || 0,
      prix_vente:   0,
      description:  document.getElementById('fr-description').value,
      desc_emballage: document.getElementById('fr-desc-emballage').value,
      instructions: document.getElementById('fr-instructions').value,
      notes:        document.getElementById('fr-notes').value,
      surgras:      document.getElementById('fr-surgras').value,
      statut:       document.getElementById('fr-statut').value || 'test',
      image_url:         document.getElementById('fr-image-url').value,
      image_url_noel:    document.getElementById('fr-image-url-noel').value,
      collections_secondaires: Array.from(document.getElementById('fr-collections-secondaires')?.querySelectorAll('input[type="checkbox"]:checked') || []).map(cb => cb.value),
      ingredients:  ingredientsRecette.map(i => ({ type: i.type, nom: i.nom, quantite_g: i.quantite }))
    };
    await appelAPIPost('saveRecette', d);
  }

  // 2. Scraper si URL fournie
  if (url) {
    afficherStatutModalInci('Scraping en cours…');
    const resScraper = await appelAPIPost('scraperIngredientUrl', { url });
    if (resScraper) {
      afficherStatutModalInci('Écriture dans le scraping…');
      await appelAPIPost('saveIngredientInci', { nom, categorie, url, scraped: resScraper });
    } else {
      afficherStatutModalInci('Fournisseur non reconnu — ingrédient ajouté sans scraping.');
      await appelAPIPost('saveIngredientInci', { nom, categorie });
    }
  } else {
    await appelAPIPost('saveIngredientInci', { nom, categorie });
  }

  // 3. Recharger les listes déroulantes
  await chargerListesFournisseurs();

  // 4. Fermer le modal
  fermerModalAjouterInci();

  // 5. Mettre à jour la ligne dans la recette
  if (liste === 'base') {
    ingredientsBase[index].nom = nom;
    rafraichirListeIngredientsBase();
  } else {
    ingredientsRecette[index].nom = nom;
    rafraichirListeIngredientsRecette();
  }

  // 6. Si URL → rediriger vers page INCI avec ingrédient pré-ouvert
  if (url) {
    afficherStatutModalInci('Redirection vers la page INCI…');
    setTimeout(() => {
      afficherSection('inci');
      inciRechercher(nom);
    }, 800);
  }
}

function afficherStatutModalInci(msg) {
  const el = document.getElementById('modal-inci-statut');
  el.textContent = msg;
  el.classList.remove('cache');
}

function inciRechercher(nom) {
  const champ = document.getElementById('inci-recherche');
  if (champ) {
    champ.value = nom;
    inciAppliquerFiltres();
  }
  // Afficher le bouton retour
  document.getElementById('btn-retour-recette')?.classList.remove('cache');
}

function retourRecetteDepuisInci() {
  document.getElementById('btn-retour-recette')?.classList.add('cache');
  afficherSection('recettes');
}

function genererInci(ingredients) {
  if (!ingredients || ingredients.length === 0) return '';
  const total = ingredients.reduce((s, i) => s + (parseFloat(i.quantite_g) || 0), 0);
  if (total === 0) return '';

  // Séparer fragrances et autres
  const fragrances = ingredients.filter(i => i.type === 'Fragrances');
  const autres = ingredients.filter(i => i.type !== 'Fragrances');

  // Trier autres par quantité décroissante
  const plusDeUnPct = autres.filter(i => (i.quantite_g / total) > 0.01).sort((a, b) => b.quantite_g - a.quantite_g);
  const unPctOuMoins = autres.filter(i => (i.quantite_g / total) <= 0.01);

  const getInci = (ing) => {
    if (ing.inci) return ing.inci;
    const found = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === ing.nom.toLowerCase());
    return found ? (found.inci || '') : '';
  };

  const lignes = [
    ...plusDeUnPct.map(i => getInci(i)),
    ...unPctOuMoins.map(i => getInci(i))
  ];

  // Ajouter fragrances regroupées
  if (fragrances.length > 0) {
    const notes = fragrances.map(i => {
      const found = (listesDropdown.fullData || []).find(d => d.type === i.type && d.ingredient === i.nom);
      return found ? (found.note_olfactive || i.nom) : i.nom;
    }).filter(Boolean);
    lignes.push('Fragrance' + (notes.length > 0 ? ' (' + notes.join(', ') + ')' : ''));
  }

  return lignes.join(', ');
}

// ─── INGRÉDIENTS DE BASE ───
let ingredientsBase = [];

function ajouterIngredientBase(type='', nom='', quantite=0) {
  ingredientsBase.push({ type, nom, quantite });
  rafraichirListeIngredientsBase();
}

function supprimerIngredientBase(index) {
  ingredientsBase.splice(index, 1);
  rafraichirListeIngredientsBase();
}

function rafraichirListeIngredientsBase() {
  const liste = document.getElementById('liste-ingredients-base');
  if (!liste) return;
  if (ingredientsBase.length === 0) { liste.innerHTML = ''; return; }
  liste.innerHTML = ingredientsBase.map((ing, i) => `
    <div class="ingredient-rangee">
      <select class="form-ctrl ing-type" onchange="ingredientsBase[${i}].type=this.value; ingredientsBase[${i}].nom=''; rafraichirListeIngredientsBase()">
        <option value="">— Type —</option>
        ${(listesDropdown.types || []).map(t => `<option value="${t}" ${ing.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
      <select class="form-ctrl ing-nom" onchange="if(this.value==='__nouveau__'){ajouterIngredientInci('${ing.type}',${i},'base')}else{ingredientsBase[${i}].nom=this.value; rafraichirListeIngredientsBase()}">
        <option value="">— Ingrédient —</option>
        ${(listesDropdown.fullData || []).filter(d => d.type===ing.type).map(d => `<option value="${d.ingredient}" ${ing.nom.toLowerCase()===d.ingredient.toLowerCase()?'selected':''}>${d.ingredient}</option>`).join('')}
        <option value="__nouveau__">+ Ajouter un ingrédient</option>
      </select>
      <input type="text" class="form-ctrl ing-inci" readonly placeholder="INCI" value="${(listesDropdown.fullData||[]).find(d=>d.type===ing.type&&d.ingredient.toLowerCase()===ing.nom.toLowerCase())?.inci||ing.inci||''}">
      <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${ing.quantite||''}" placeholder="g" onchange="ingredientsBase[${i}].quantite=parseFloat(this.value)||0">
      <button class="btn btn-sm btn-danger" onclick="supprimerIngredientBase(${i})">✕</button>
    </div>
  `).join('');
}

// ─── FORMATS RECETTE ───
let formatsRecette = [];

function ajouterFormatRecette(poids='', unite='g', prix='', desc='') {
  formatsRecette.push({ poids, unite, prix, desc });
  rafraichirListeFormatsRecette();
}

function supprimerFormatRecette(index) {
  formatsRecette.splice(index, 1);
  rafraichirListeFormatsRecette();
}

function rafraichirListeFormatsRecette() {
  const liste = document.getElementById('liste-formats-recette');
  if (!liste) return;
  if (formatsRecette.length === 0) { liste.innerHTML = ''; return; }
  liste.innerHTML = formatsRecette.map((f, i) => `
    <div class="ingredient-rangee">
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.poids||''}" placeholder="Poids" onchange="formatsRecette[${i}].poids=this.value">
      <select class="form-ctrl" onchange="formatsRecette[${i}].unite=this.value">
        <option value="g" ${f.unite==='g'?'selected':''}>g</option>
        <option value="ml" ${f.unite==='ml'?'selected':''}>ml</option>
      </select>
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.prix||''}" placeholder="Prix $" onchange="formatsRecette[${i}].prix=parseFloat(this.value)||0">
      <input type="text" class="form-ctrl" value="${f.desc||''}" placeholder="Emballage" onchange="formatsRecette[${i}].desc=this.value">
      <button class="btn btn-sm btn-danger" onclick="supprimerFormatRecette(${i})">✕</button>
    </div>
  `).join('');
}

function supprimerRecette(id) {
  confirmerAction('Supprimer cette recette ?', async () => {
    const res = await appelAPIPost('deleteRecette', { recette_id: id });
    if (res && res.success) {
      fermerFicheRecette();
      afficherMsg('recettes', 'Recette supprimée.');
      await chargerRecettes();
    } else {
      afficherMsg('recettes', 'Erreur.', 'erreur');
    }
  });
}

/* ════════════════════════════════
   NOUVELLE FACTURE
════════════════════════════════ */
let factureActive = null;
let produitsFacture = [];

function calculerPrixParG() {
  const prix  = parseFloat(document.getElementById('fp-prix-unitaire').value) || 0;
  const qte   = parseFloat(document.getElementById('fp-contenu-qte').value) || 0;
  const unite = document.getElementById('fp-contenu-unite').value;
  let g = qte;
  if (unite === 'L')  g = qte * 1000;
  if (unite === 'kg') g = qte * 1000;
  document.getElementById('fp-prix-par-g').value = g > 0 ? (prix / g).toFixed(4) + ' $/g' : '';
}

async function creerFacture() {
  const numero      = document.getElementById('nf-numero').value.trim();
  const date        = document.getElementById('nf-date').value;
  const fournisseur = document.getElementById('nf-fournisseur').value.trim();
  if (!numero || !date || !fournisseur) {
    afficherMsg('nouvelle-facture', 'Tous les champs sont requis.', 'erreur');
    return;
  }
  const res = await appelAPIPost('createInvoice', { numeroFacture: numero, date, fournisseur });
  if (res && res.success) {
    factureActive = { numero, date, fournisseur };
    produitsFacture = [];
    document.getElementById('etape1-facture').classList.add('cache');
    document.getElementById('etape2-facture').classList.remove('cache');
    document.getElementById('nf-entete-titre').textContent = 'Facture ' + numero;
    document.getElementById('nf-entete-info').textContent  = date + ' — ' + fournisseur;
    mettreAJourTotaux(0);
    afficherMsg('nouvelle-facture', 'Facture créée. Ajoutez les produits.');
  } else {
    afficherMsg('nouvelle-facture', res?.message || 'Erreur.', 'erreur');
  }
}

async function ajouterProduit() {
  if (!factureActive) return;
  const rowIndex     = document.getElementById('fp-row-index').value;
  const nom          = document.getElementById('fp-nom').value.trim();
  const quantite     = parseFloat(document.getElementById('fp-quantite').value) || 0;
  const unite        = document.getElementById('fp-unite').value.trim();
  const contenuQte   = parseFloat(document.getElementById('fp-contenu-qte').value) || 0;
  const contenuUnite = document.getElementById('fp-contenu-unite').value;
  const prixUnitaire = parseFloat(document.getElementById('fp-prix-unitaire').value) || 0;
  const type         = document.getElementById('fp-type').value;
  const ingredient   = document.getElementById('fp-ingredient').value.trim();
  if (!nom || quantite <= 0 || prixUnitaire <= 0) {
    afficherMsg('nouvelle-facture', 'Nom, quantité et prix sont requis.', 'erreur');
    return;
  }
  let g = contenuQte;
  if (contenuUnite === 'L')  g = contenuQte * 1000;
  if (contenuUnite === 'kg') g = contenuQte * 1000;
  const prixParG = g > 0 ? (prixUnitaire / g) : 0;
  const d = {
    numeroFacture: factureActive.numero,
    fournisseur:   factureActive.fournisseur,
    nomProduit:    nom, quantite, unite,
    contenuQte, contenuUnite,
    prixUnitaire,
    prixParUnite:  prixParG.toFixed(4),
    type, ingredient
  };
  const res = rowIndex
    ? await appelAPIPost('updateProduct', { ...d, rowIndex: parseInt(rowIndex) })
    : await appelAPIPost('addProduct', d);
  if (res && res.success) {
    reinitialiserFormProduit();
    await rechargerProduits();
    afficherMsg('nouvelle-facture', rowIndex ? 'Produit mis à jour.' : 'Produit ajouté.');
  } else {
    afficherMsg('nouvelle-facture', 'Erreur.', 'erreur');
  }
}

async function rechargerProduits() {
  const res = await appelAPIPost('getInvoiceProducts', { numeroFacture: factureActive.numero });
  if (!res || !res.success) return;
  produitsFacture = res.products || [];
  afficherProduits();
  mettreAJourTotaux(res.total || 0);
}

function afficherProduits() {
  const tableau = document.getElementById('tableau-produits');
  const vide    = document.getElementById('vide-produits');
  const tbody   = document.getElementById('tbody-produits');
  if (!produitsFacture.length) { tableau.classList.add('cache'); vide.classList.remove('cache'); return; }
  tbody.innerHTML = '';
  produitsFacture.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:500">${p.nomProduit}</td>
      <td>${p.quantite}</td>
      <td style="color:var(--gris);font-size:0.78rem">${p.contenuQte ? p.contenuQte + ' ' + p.contenuUnite : '—'}</td>
      <td>${formaterPrix(p.prixUnitaire)}</td>
      <td style="color:var(--gris);font-size:0.75rem">${p.prixParUnite ? parseFloat(p.prixParUnite).toFixed(4) + ' $/g' : '—'}</td>
      <td style="color:var(--primary);font-weight:500">${formaterPrix(p.prixTotal)}</td>
      <td style="color:var(--gris);font-size:0.75rem">${p.type || '—'}</td>
      <td>
        <div class="td-actions">
          <button class="btn-edit" onclick="modifierProduit(${p.rowIndex})">Modifier</button>
          <button class="btn-suppr" onclick="supprimerProduit(${p.rowIndex})">Supprimer</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
  vide.classList.add('cache');
  tableau.classList.remove('cache');
}

function mettreAJourTotaux(sousTotal) {
  const st  = sousTotal || 0;
  const tps = parseFloat(document.getElementById('nf-tps').value) || 0;
  const tvq = parseFloat(document.getElementById('nf-tvq').value) || 0;
  document.getElementById('nf-sous-total').textContent  = formaterPrix(st);
  document.getElementById('nf-total-final').textContent = formaterPrix(st + tps + tvq);
}

function recalculerTotal() {
  const st = produitsFacture.reduce((acc, p) => acc + (p.prixTotal || 0), 0);
  mettreAJourTotaux(st);
}

function modifierProduit(rowIndex) {
  const p = produitsFacture.find(x => x.rowIndex === rowIndex);
  if (!p) return;
  document.getElementById('fp-row-index').value     = rowIndex;
  document.getElementById('fp-nom').value           = p.nomProduit;
  document.getElementById('fp-quantite').value      = p.quantite;
  document.getElementById('fp-unite').value         = p.unite || '';
  document.getElementById('fp-contenu-qte').value   = p.contenuQte || '';
  document.getElementById('fp-contenu-unite').value = p.contenuUnite || 'g';
  document.getElementById('fp-prix-unitaire').value = p.prixUnitaire;
  document.getElementById('fp-type').value          = p.type || '';
  document.getElementById('fp-ingredient').value    = p.ingredient || '';
  calculerPrixParG();
 
}

function annulerEditionProduit() { reinitialiserFormProduit(); }

function reinitialiserFormProduit() {
  ['fp-row-index','fp-nom','fp-quantite','fp-unite','fp-contenu-qte','fp-prix-unitaire','fp-ingredient','fp-prix-par-g']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('fp-contenu-unite').value = 'g';
  document.getElementById('fp-type').value = '';
  document.getElementById('btn-annuler-produit').classList.add('cache');
}

function supprimerProduit(rowIndex) {
  confirmerAction('Supprimer ce produit ?', async () => {
    const res = await appelAPIPost('deleteProduct', { numeroFacture: factureActive.numero, rowIndex });
    if (res && res.success) {
      await rechargerProduits();
      afficherMsg('nouvelle-facture', 'Produit supprimé.');
    } else {
      afficherMsg('nouvelle-facture', 'Erreur.', 'erreur');
    }
  });
}



function reinitialiserNouvelleFacture() {
  factureActive = null;
  produitsFacture = [];
  document.getElementById('etape2-facture').classList.add('cache');
  document.getElementById('etape1-facture').classList.remove('cache');
  ['facture-numero','facture-fournisseur','facture-fournisseur-nouveau','final-tps','final-tvq','final-livraison'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const champNouv = document.getElementById('facture-fournisseur-nouveau');
  if (champNouv) champNouv.classList.add('cache');
  document.getElementById('nf-date').value = new Date().toISOString().split('T')[0];
}

/* ════════════════════════════════
   FACTURES
════════════════════════════════ */
let toutesFactures = [];

async function chargerFactures() {
  const loading = document.getElementById('loading-factures');
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  loading.classList.remove('cache');
  tableau.classList.add('cache');
  vide.classList.add('cache');

  const res = await appelAPI('getInvoicesListWithFilters');

loading.classList.add('cache');
  if (!res || !res.invoices) { afficherMsg('factures', 'Erreur lors du chargement.', 'erreur'); return; }
  toutesFactures = res.invoices || [];

  const selFourn    = document.getElementById('filtre-fournisseur');
  const valActuelle = selFourn.value;
  selFourn.innerHTML = '<option value="">Tous les fournisseurs</option>';
  (res.fournisseurs || []).forEach(f => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f; selFourn.appendChild(o);
  });
  selFourn.value = valActuelle;

  afficherFactures(toutesFactures);
}

function filtrerFactures() {
  const fourn  = document.getElementById('filtre-fournisseur').value;
  const statut = document.getElementById('filtre-statut').value;
  const debut  = document.getElementById('filtre-date-debut').value;
  const fin    = document.getElementById('filtre-date-fin').value;

  const filtrees = toutesFactures.filter(f => {
    if (fourn  && f.fournisseur !== fourn)  return false;
    if (statut && f.statut !== statut)      return false;
    if (debut  && f.dateRaw < debut)        return false;
    if (fin    && f.dateRaw > fin)          return false;
    return true;
  });

  const selStatut = document.getElementById('filtre-statut');
  const valStatut = selStatut.value;
  const statutsDispo = [...new Set(
    toutesFactures.filter(f => !fourn || f.fournisseur === fourn).map(f => f.statut)
  )];
  selStatut.innerHTML = '<option value="">Tous les statuts</option>';
  ['En cours', 'Finalisée'].filter(s => statutsDispo.includes(s)).forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = s; selStatut.appendChild(o);
  });
  selStatut.value = valStatut;

  afficherFactures(filtrees);
}

function reinitialiserFiltres() {
  document.getElementById('filtre-fournisseur').value = '';
  document.getElementById('filtre-statut').value = '';
  document.getElementById('filtre-date-debut').value = '';
  document.getElementById('filtre-date-fin').value = '';
  afficherFactures(toutesFactures);
}

function afficherFactures(liste) {
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  const tbody   = document.getElementById('tbody-factures');
  const compte  = document.getElementById('factures-compte');
  const totalEl = document.getElementById('factures-total');

  compte.textContent = liste.length + ' facture' + (liste.length > 1 ? 's' : '');

  if (!liste.length) { tableau.classList.add('cache'); vide.classList.remove('cache'); if (totalEl) totalEl.classList.add('cache'); return; }

  tbody.innerHTML = '';
  const triees = [...liste].sort((a, b) => b.dateRaw.localeCompare(a.dateRaw));

  triees.forEach(f => {
    const badge = f.statut === 'Finalisée'
      ? `<span class="badge-statut-ok">✓</span>`
      : `<span class="badge-statut-cours">●</span>`;
    const tr = document.createElement('tr');
    tr.className = 'cliquable';
    tr.onclick = () => voirDetailFacture(String(f.numero));
    tr.innerHTML = `
      <td class="td-numero">${f.numero}</td>
      <td class="td-date">${f.date}</td>
      <td>${f.fournisseur}</td>
      <td class="td-prix">${f.total ? formaterPrix(f.total) : '—'}</td>
      <td>${badge}</td>`;
    tbody.appendChild(tr);
  });

 const total = triees.reduce((acc, f) => acc + (parseFloat(f.total) || 0), 0);
  if (totalEl) { totalEl.textContent = formaterPrix(total); totalEl.classList.remove('cache'); }

  vide.classList.add('cache');
  tableau.classList.remove('cache');
}

async function voirDetailFacture(numero) {
  const facture = toutesFactures.find(f => String(f.numero) === String(numero));
  const modal = document.getElementById('modal-facture');
  modal.classList.add('ouvert');
  document.getElementById('modal-facture-titre').textContent = 'Facture ' + numero;
  document.getElementById('modal-facture-info').textContent  = (facture ? facture.date + ' — ' + facture.fournisseur : '');
  document.getElementById('contenu-detail-facture').innerHTML = '';
  document.getElementById('loading-detail-facture').classList.remove('cache');

  const res = await appelAPIPost('getInvoiceProducts', { numeroFacture: numero });
  document.getElementById('loading-detail-facture').classList.add('cache');

  if (!res || !res.success || !res.products.length) {
    document.getElementById('contenu-detail-facture').innerHTML = '<div class="vide"><div class="vide-titre">Aucun produit</div></div>';
    return;
  }

  let html = `
    <div class="tableau-wrap">
      <table>
        <thead>
          <tr><th>Produit</th><th>Qté</th><th>Contenu</th><th>Prix unit.</th><th>Prix/g</th><th>Total</th></tr>
        </thead>
        <tbody>`;
  res.products.forEach(p => {
    html += `
      <tr>
     <td style="font-weight:500">${p.ingredient || '—'}</td>
        <td>${p.quantite}</td>
        <td style="color:var(--gris);font-size:0.78rem">${p.formatQte ? p.formatQte + ' ' + p.formatUnite : '—'}</td>
        <td>${formaterPrix(p.prixUnitaire)}</td>
        <td style="color:var(--gris);font-size:0.75rem">${p.prixParUnite ? parseFloat(p.prixParUnite).toFixed(4) + ' $/g' : '—'}</td>
        <td style="color:var(--primary);font-weight:500">${formaterPrix(p.prixTotal)}</td>
      
      </tr>`;
  });
  html += `</tbody></table></div>`;
 
const tps      = facture ? parseFloat(facture.tps) || 0 : 0;
  const tvq      = facture ? parseFloat(facture.tvq) || 0 : 0;
  const livraison = facture ? parseFloat(facture.livraison) || 0 : 0;
  const total    = facture ? parseFloat(facture.total) || 0 : res.total;
  html += `
    <div class="facture-totaux">
      <div class="facture-total-ligne">Sous-total <span>${formaterPrix(res.total)}</span></div>
      ${tps ? `<div class="facture-total-ligne">TPS <span>${formaterPrix(tps)}</span></div>` : ''}
      ${tvq ? `<div class="facture-total-ligne">TVQ <span>${formaterPrix(tvq)}</span></div>` : ''}
      ${livraison ? `<div class="facture-total-ligne">Livraison <span>${formaterPrix(livraison)}</span></div>` : ''}
      <div class="facture-total-ligne facture-total-final">Total <span>${formaterPrix(total)}</span></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-danger" onclick="fermerModalFacture(); supprimerFacture('${numero}')">Supprimer</button>
    </div>`;
  document.getElementById('contenu-detail-facture').innerHTML = html;
}

function fermerModalFacture() {
  document.getElementById('modal-facture').classList.remove('ouvert');
}

function supprimerFacture(numero) {
  confirmerAction('Supprimer la facture ' + numero + ' et tous ses produits ?', async () => {
    const res = await appelAPIPost('deleteInvoice', { numeroFacture: numero });
    if (res && res.success) {
      afficherMsg('factures', 'Facture supprimée.');
      chargerFactures();
    } else {
      afficherMsg('factures', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

/* ════════════════════════════════
   INVENTAIRE
════════════════════════════════ */
let donneesInventaire = {};
async function chargerInventaire() {
  const loading = document.getElementById('loading-inventaire');
  const contenu = document.getElementById('contenu-inventaire');
  const vide    = document.getElementById('vide-inventaire');
  loading.classList.remove('cache');
  contenu.innerHTML = '';
  vide.classList.add('cache');

  const res = await appelAPI('getInventory');


 loading.classList.add('cache');
  if (!res || !res.success) { afficherMsg('inventaire', 'Erreur.', 'erreur'); return; }

donneesInventaire = res.inventory || {};
  const inv   = donneesInventaire;
  const types = Object.keys(inv).sort();
  if (!types.length) { vide.classList.remove('cache'); return; }

  const selType = document.getElementById('inv-filtre-type');
  const selFourn = document.getElementById('inv-filtre-fourn');
  selType.innerHTML = '<option value="">Tous les types</option>';
  selFourn.innerHTML = '<option value="">Tous les fournisseurs</option>';
  const fournsSet = new Set();
  types.forEach(type => {
    selType.innerHTML += `<option value="${type}">${type}</option>`;
    Object.keys(inv[type]).forEach(nom => Object.keys(inv[type][nom]).forEach(f => fournsSet.add(f)));
  });
  Array.from(fournsSet).sort().forEach(f => { selFourn.innerHTML += `<option value="${f}">${f}</option>`; });

  let html = '';
  let total = 0;

 html += `
    <div class="tableau-wrap">
      <table>
        <thead>
          <tr><th>Ingrédient</th><th>Fournisseur</th><th>Unités</th><th>Format</th><th>Valeur</th></tr>
        </thead>
        <tbody>`;

  types.forEach(type => {
    const ings = inv[type];
    html += `<tr><td colspan="5" class="inv-titre-rangee">${type}</td></tr>`;
    Object.keys(ings).sort().forEach(nom => {
      const fournisseurs = Object.keys(ings[nom]);
      const prixMin = Math.min(...fournisseurs.map(f => ings[nom][f].prixParG || Infinity));
      fournisseurs.forEach((fourn, idx) => {
        const d = ings[nom][fourn];
        total += d.valeur || 0;
        const meilleur = d.prixParG && d.prixParG === prixMin && fournisseurs.length > 1;
        html += `
          <tr>
            <td class="${idx === 0 ? 'td-ing-nom' : 'td-ing-nom-suite'}">${idx === 0 ? nom : ''}</td>
            <td class="${meilleur ? 'td-ing-fourn-meilleur' : 'td-ing-fourn'}">${fourn}${meilleur ? ' ★' : ''}</td>
            <td>${d.unites}</td>
            <td class="td-ing-format">${d.format || '—'}</td>
            <td class="td-ing-valeur">${formaterPrix(d.valeur)}</td>
          </tr>`;
      });
    });
  });

  html += `</tbody></table></div>`;

  html += `
    <div class="inv-total">
      <div class="inv-total-label">Valeur totale de l'inventaire</div>
      <div class="inv-total-montant">${formaterPrix(total)}</div>
    </div>`;

contenu.innerHTML = html;
}

function filtrerInventaire() {
  const recherche = (document.getElementById('inv-recherche')?.value || '').toLowerCase();
  const typeFiltre = document.getElementById('inv-filtre-type')?.value || '';
  const fournFiltre = document.getElementById('inv-filtre-fourn')?.value || '';
  const inv = donneesInventaire;
  const types = Object.keys(inv).sort();
  const contenu = document.getElementById('contenu-inventaire');
  let html = '<div class="tableau-wrap"><table><thead><tr><th>Ingrédient</th><th>Fournisseur</th><th>Unités</th><th>Format</th><th>Valeur</th></tr></thead><tbody>';
  let total = 0;
  types.forEach(type => {
    if (typeFiltre && type !== typeFiltre) return;
    const ings = inv[type];
    let rangeeType = false;
    Object.keys(ings).sort().forEach(nom => {
      if (recherche && !nom.toLowerCase().includes(recherche)) return;
      const fournisseurs = Object.keys(ings[nom]).filter(f => !fournFiltre || f === fournFiltre);
      if (!fournisseurs.length) return;
      if (!rangeeType) { html += `<tr><td colspan="5" class="inv-titre-rangee">${type}</td></tr>`; rangeeType = true; }
      const prixMin = Math.min(...fournisseurs.map(f => ings[nom][f].prixParG || Infinity));
      fournisseurs.forEach((fourn, idx) => {
        const d = ings[nom][fourn];
        total += d.valeur || 0;
        const meilleur = d.prixParG && d.prixParG === prixMin && fournisseurs.length > 1;
        html += `<tr><td class="${idx === 0 ? 'td-ing-nom' : 'td-ing-nom-suite'}">${idx === 0 ? nom : ''}</td><td class="${meilleur ? 'td-ing-fourn-meilleur' : 'td-ing-fourn'}">${fourn}${meilleur ? ' ★' : ''}</td><td>${d.unites}</td><td class="td-ing-format">${d.format || '—'}</td><td class="td-ing-valeur">${formaterPrix(d.valeur)}</td></tr>`;
      });
    });
  });
  html += `</tbody></table></div><div class="inv-total"><div class="inv-total-label">Valeur totale de l'inventaire</div><div class="inv-total-montant">${formaterPrix(total)}</div></div>`;
  contenu.innerHTML = html;
}

function reinitialiserFiltresInventaire() {
  document.getElementById('inv-recherche').value = '';
  document.getElementById('inv-filtre-type').value = '';
  document.getElementById('inv-filtre-fourn').value = '';
  filtrerInventaire();
}

/* ════════════════════════════════
   PAGE INCI
════════════════════════════════ */

let inciDonnees = [];
let inciCorrespondance = [];
let inciCategoriesUC = [];
let inciIngredientsUC = [];

async function chargerInci() {
  document.getElementById('loading-inci').classList.remove('cache');
  document.getElementById('inci-accordeons').innerHTML = '';

  const [resUC, resDrop] = await Promise.all([
    appelAPI('getCategoriesUC'),
    appelAPI('getDropdownLists')
  ]);
  if (resDrop) {
    listesDropdown.types    = resDrop.types    || [];
    listesDropdown.fullData = resDrop.fullData || [];
    listesDropdown.config   = resDrop.config   || {};
  }
  document.getElementById('loading-inci').classList.add('cache');

  inciDonnees = listesDropdown.fullData;
  inciCategoriesUC = (resUC && resUC.success) ? resUC.categories : [];
  const resIngrUC = await appelAPI('getIngredientsUC');
  inciIngredientsUC = (resIngrUC && resIngrUC.success) ? resIngrUC.items : [];

  inciConstruireAccordeons();

}

function inciAppliquerFiltres() {
  const btn = event && event.currentTarget;
  if (btn && btn.dataset.filtreStatut !== undefined) {
    document.querySelectorAll('[data-filtre-statut]').forEach(b => b.classList.remove('actif'));
    btn.classList.add('actif');
  } else if (btn && btn.dataset.filtreSource !== undefined) {
    document.querySelectorAll('[data-filtre-source]').forEach(b => b.classList.remove('actif'));
    btn.classList.add('actif');
  }
  inciConstruireAccordeons();
}

function inciGetFiltres() {
  const btnStatut = document.querySelector('[data-filtre-statut].actif');
  const btnSource = document.querySelector('[data-filtre-source].actif');
  const recherche = document.getElementById('inci-recherche');
  return {
    statut: btnStatut ? btnStatut.dataset.filtreStatut : 'tout',
    source: btnSource ? btnSource.dataset.filtreSource : 'tout',
    recherche: recherche ? recherche.value.trim().toLowerCase() : ''
  };
}

function inciConstruireAccordeons() {
  const recherche = document.getElementById('inci-recherche')?.value.trim().toLowerCase() || '';
  const container = document.getElementById('inci-accordeons');
  container.innerHTML = '';

  // Accordéon 1 — Catégories UC
  const blocUC = document.createElement('div');
  blocUC.className = 'form-panel visible';
  blocUC.innerHTML = `
    <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
      <div class="form-panel-titre">Catégories Univers Caresse</div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge-statut-ok">${inciCategoriesUC.length} catégories</span>
      </div>
    </div>
    <div class="form-body inci-accord-body cache" id="inci-uc-body">
      ${inciRendreUC()}
    </div>`;
  container.appendChild(blocUC);

  // Accordéon 2+ — Par catégorie UC
  const parCat = {};
  inciDonnees.forEach(l => {
    if (recherche && !l.ingredient.toLowerCase().includes(recherche)) return;
    const cat = l.type || 'Sans catégorie';
    if (!parCat[cat]) parCat[cat] = [];
    parCat[cat].push(l);
  });

  const cats = Object.keys(parCat).sort();
  if (cats.length === 0) {
    const vide = document.createElement('div');
    vide.className = 'vide';
    vide.innerHTML = '<div class="vide-titre">Aucun ingrédient à afficher</div>';
    container.appendChild(vide);
    return;
  }

  cats.forEach((cat, idx) => {
    const lignes    = parCat[cat];
    const nbInci    = lignes.filter(l => l.inci).length;
    const nbSansInci = lignes.length - nbInci;

    const bloc = document.createElement('div');
    bloc.className = 'form-panel visible';
    bloc.dataset.cat = cat;
    bloc.innerHTML = `
      <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
        <div class="form-panel-titre">${cat}</div>
        <div style="display:flex;gap:8px;align-items:center">
          ${nbSansInci > 0 ? `<span class="badge-statut-cours">${nbSansInci} 🔴</span>` : ''}
          <span class="badge-statut-ok">${nbInci} ✅</span>
        </div>
      </div>
      <div class="form-body inci-accord-body cache">
        <div class="tableau-wrap">
          <table class="tableau-admin">
            <tbody>
              ${lignes.sort((a,b) => a.ingredient.localeCompare(b.ingredient,'fr')).map((l, i) => inciRendreLigne(l, cat, `${idx}-${i}`)).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    container.appendChild(bloc);
  });
}


function inciRendreLigne(l, cat, uid) {
  const aInci = !!l.inci;
  const statutLabel = aInci ? '✅' : '🔴';
  const id = `inci-${uid}`;
  const nomSafe = l.ingredient.replace(/'/g, "\\'");
  const catSafe = cat.replace(/'/g, "\\'");
  return `
    <tr class="ligne-cliquable" onclick="inciToggleDetail('${id}')">
      <td>${l.ingredient}</td>
      <td></td>
      <td></td>
      <td><span>${statutLabel}</span></td>
    </tr>
    <tr class="accordeon-detail cache" id="${id}-detail">
      <td colspan="4">
        <div class="form-groupe">
          <label class="form-label">INCI</label>
          <textarea class="form-ctrl" id="${id}-inci" rows="3">${(l.inci || '').replace(/</g, '&lt;')}</textarea>
        </div>
        <div class="form-groupe form-grille-2">
          <div>
            <label class="form-label">Catégorie UC</label>
            <select class="form-ctrl" id="${id}-cat">
              <option value="">— Choisir —</option>
              ${inciCategoriesUC.map(c => `<option value="${c.categorie}" ${cat === c.categorie ? 'selected' : ''}>${c.categorie}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Nom fournisseur</label>
            <div class="form-valeur">${l.ingredientFournisseur || '—'}</div>
          </div>
        </div>
        <div class="form-groupe">
          <label class="form-label">Nom UC <button class="btn btn-sm btn-outline" onclick="inciAjouterNomUC('${id}')">+</button></label>
          <select class="form-ctrl" id="${id}-nomuc">
            <option value="">— Choisir —</option>
            ${[...inciIngredientsUC].sort((a, b) => a.ingredient.localeCompare(b.ingredient, 'fr')).map(i => `<option value="${i.ingredient}" ${l.ingredient === i.ingredient ? 'selected' : ''}>${i.ingredient}</option>`).join('')}
          </select>
        </div>
        <div class="form-groupe">
          <label class="form-label">Nom botanique</label>
          <input type="text" class="form-ctrl" id="${id}-bot" value="${(l.nomBotanique || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-groupe">
          <label class="form-label">Note olfactive</label>
          <input type="text" class="form-ctrl" id="${id}-note" value="${(l.note_olfactive || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-groupe">
          <label class="form-label">Texte brut</label>
          <div class="texte-brut" id="${id}-textebrut">
            <button class="btn btn-sm btn-outline" onclick="inciChargerTexteBrut('${id}','${nomSafe}')">Charger</button>
          </div>
        </div>
        <hr class="separateur">
        <div class="form-actions">
          <span></span>
          <button class="btn btn-sm btn-primary" onclick="inciValider('${id}','${nomSafe}','${catSafe}','')">Sauvegarder</button>
        </div>
      </td>
    </tr>`;
}

async function inciChargerTexteBrut(id, nom) {
  const zone = document.getElementById(`${id}-textebrut`);
  if (!zone) return;
  zone.textContent = 'Chargement…';
  const res = await appelAPI('getTexteBrut&nom=' + encodeURIComponent(nom));
  zone.textContent = (res && res.texteBrut) ? res.texteBrut : '—';
}


function inciRendreUC() {
  if (inciCategoriesUC.length === 0) {
    return `<p class="form-valeur">Aucune catégorie définie.</p>
      <button class="btn btn-sm btn-secondary" onclick="inciAjouterUC()">+ Ajouter une catégorie</button>`;
  }
  const cartes = [...inciCategoriesUC].sort((a, b) => a.categorie.localeCompare(b.categorie, 'fr')).map((c, i) => {
    const ingredientsValides = (listesDropdown.fullData || []).filter(d => d.type === c.categorie);
    const utilise = ingredientsValides.length > 0;
    const listeHtml = utilise
      ? ingredientsValides.map(d => `<div class="form-valeur">${d.ingredient}${d.inci ? ` — <span class="texte-secondaire">${d.inci}</span>` : ''}</div>`).join('')
      : '';
    return `
      <div class="carte-admin">
        <div class="carte-admin-entete">
          <input type="text" class="form-ctrl" id="uc-cat-${i}" value="${c.categorie.replace(/"/g,'&quot;')}">
          ${!utilise ? `<div class="td-actions">
            <button class="btn-edit" onclick="inciModifierUC(${i}, ${c.rowIndex})">Modifier</button>
            <button class="btn-suppr" onclick="inciSupprimerUC(${c.rowIndex})">Supprimer</button>
          </div>` : ''}
        </div>
        ${listeHtml}
      </div>`;
  }).join('');
  return `
    ${cartes}
    <hr class="separateur">
    <div class="form-actions">
      <button class="btn btn-sm btn-secondary" onclick="inciAjouterUC()">+ Ajouter une catégorie</button>
    </div>`;
}

function inciAjouterUC() {
  inciCategoriesUC.push({ rowIndex: null, categorie: '', dateAjout: '' });
  document.getElementById('inci-uc-body').innerHTML = inciRendreUC();
  const dernierIndex = inciCategoriesUC.length - 1;
  const input = document.getElementById(`uc-cat-${dernierIndex}`);
  if (input) input.focus();
}

async function inciModifierUC(i, rowIndex) {
  const input = document.getElementById(`uc-cat-${i}`);
  const val   = (input?.value || '').trim();
  if (!val) { afficherMsg('inci', 'Le nom est requis.', 'erreur'); return; }

  if (!rowIndex) {
    const res = await appelAPIPost('ajouterCategorieUC', { categorie: val });
    if (res && res.success) {
      afficherMsg('inci', `✅ Catégorie "${val}" ajoutée.`);
      await chargerInci();
    } else {
      afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
    }
  } else {
    const res = await appelAPIPost('modifierCategorieUC', { rowIndex, categorie: val });
    if (res && res.success) {
      afficherMsg('inci', `✅ Catégorie mise à jour.`);
      await chargerInci();
    } else {
      afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
    }
  }
}

async function inciSupprimerUC(rowIndex) {
  if (!rowIndex) { await chargerInci(); return; }
  const res = await appelAPIPost('supprimerCategorieUC', { rowIndex });
  if (res && res.success) {
    afficherMsg('inci', 'Catégorie supprimée.');
    await chargerInci();
  } else {
    afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
  }
}

function inciRendreCorrespondance() {
  const categoriesPA = inciCategoriesUC.map(c => c.categorie).sort((a, b) => a.localeCompare(b, 'fr'));

  if (inciCorrespondance.length === 0) {
    return `<p class="form-valeur">Aucune correspondance définie.</p>
      <button class="btn btn-sm btn-secondary" onclick="inciAjouterCorrespondance()">+ Ajouter une correspondance</button>`;
  }

  return `
    <table class="tableau-admin">
      <thead>
        <tr>
          <th>Catégorie source</th>
          <th>Provenance</th>
          <th>Catégorie maître</th>
          <th>Statut</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${inciCorrespondance.map((r, i) => {
          const statutClass = r.confirme ? 'badge-statut-ok' : 'badge-statut-cours';
          const statutLabel = r.confirme ? '✅ Confirmé' : '🔴 À confirmer';
          return `
            <tr>
              <td><strong>${r.categorieSource}</strong></td>
              <td><span class="badge-collection">${r.sourceProvenance || '—'}</span></td>
              <td>
                <select class="form-ctrl" id="corresp-mai-${i}" onchange="inciToggleNouvelleCategorie(${i})">
                  <option value="">— Choisir —</option>
                  ${categoriesPA.map(c => `<option value="${c}" ${r.categorieMaitre === c ? 'selected' : ''}>${c}</option>`).join('')}
                  <option value="__nouveau__">+ Nouvelle catégorie…</option>
                </select>
                <input type="text" class="form-ctrl cache" id="corresp-mai-new-${i}" placeholder="Nom de la nouvelle catégorie">
              </td>
              <td><span class="${statutClass}">${statutLabel}</span></td>
              <td><button class="btn btn-sm btn-primary" onclick="inciConfirmerCorrespondance(${i})">Confirmer</button></td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>
    <hr class="separateur">
    <div class="form-actions">
      <button class="btn btn-sm btn-primary" onclick="inciSauvegarderToutesCorrespondances()">Enregistrer toutes</button>
    </div>`;
}

function inciToggleDetail(id) {
  const detail = document.getElementById(`${id}-detail`);
  if (!detail) return;
  const estOuvert = !detail.classList.contains('cache');

  // Fermer tous les autres panneaux détail
  document.querySelectorAll('.accordeon-detail').forEach(d => {
    if (d !== detail) d.classList.add('cache');
  });

  detail.classList.toggle('cache', estOuvert);

  if (!estOuvert === false) {
    setTimeout(() => detail.previousElementSibling.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
}

function inciToggleAccordeon(header) {
  const body = header.nextElementSibling;
  const estOuvert = !body.classList.contains('cache');

  // Fermer tous les autres accordéons
  document.querySelectorAll('.inci-accord-body').forEach(b => {
    if (b !== body) b.classList.add('cache');
  });

  body.classList.toggle('cache', estOuvert);

  // Scroll vers l'accordéon ouvert
  if (estOuvert === false) {
    setTimeout(() => header.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
}

async function inciValider(id, nom, cat, source) {
  const inci          = document.getElementById(`${id}-inci`)?.value  || '';
  const nomBotanique  = document.getElementById(`${id}-bot`)?.value   || '';
  const noteOlfactive = document.getElementById(`${id}-note`)?.value  || '';
  const categorieUC   = document.getElementById(`${id}-cat`)?.value   || cat;
  const nomUC         = document.getElementById(`${id}-nomuc`)?.value || '';

  const ancienNomUC = (inciDonnees.find(l => l.ingredient.toLowerCase() === nom.toLowerCase()) || {}).ingredient || '';
  const res = await appelAPIPost('validerIngredientInci', {
    nom, categorie: categorieUC, inci, source, nomBotanique, noteOlfactive, nomUC, ancienNomUC
  });

  if (res && res.success) {
    afficherMsg('inci', `✅ ${nom} validé.`);
    await chargerInci();
  } else {
    afficherMsg('inci', 'Erreur lors de la validation.', 'erreur');
  }
}

let _nomUCCtxId = null;

function inciAjouterNomUC(id) {
  _nomUCCtxId = id;
  document.getElementById('modal-nom-uc-valeur').value = '';
  document.getElementById('modal-nom-uc').classList.add('ouvert');
  setTimeout(() => document.getElementById('modal-nom-uc-valeur').focus(), 100);
}

function fermerModalNomUC() {
  document.getElementById('modal-nom-uc').classList.remove('ouvert');
  _nomUCCtxId = null;
}

async function confirmerModalNomUC() {
  const nom = document.getElementById('modal-nom-uc-valeur').value.trim();
  if (!nom) return;
  const id  = _nomUCCtxId;
  const cat = document.getElementById(`${id}-cat`)?.value || '';
  const res = await appelAPIPost('ajouterIngredientUC', { ingredient: nom, categorie: cat });
  if (res && res.success) {
    const resIngrUC = await appelAPI('getIngredientsUC');
    inciIngredientsUC = (resIngrUC && resIngrUC.success) ? resIngrUC.items : [];
    const select = document.getElementById(`${id}-nomuc`);
    if (select) {
      const option = document.createElement('option');
      option.value = nom; option.textContent = nom; option.selected = true;
      select.appendChild(option);
    }
    afficherMsg('inci', `✅ "${nom}" ajouté.`);
    fermerModalNomUC();
  } else {
    afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
  }
}

function inciAjouterCorrespondance() {
  inciCorrespondance.push({ categorieSource: '', categorieMaitre: '' });
  document.getElementById('inci-corresp-body').innerHTML = inciRendreCorrespondance();
}

function inciToggleNouvelleCategorie(i) {
  const select   = document.getElementById(`corresp-mai-${i}`);
  const inputNew = document.getElementById(`corresp-mai-new-${i}`);
  if (!inputNew) return;
  inputNew.classList.toggle('cache', select.value !== '__nouveau__');
  if (select.value === '__nouveau__') inputNew.focus();
}

async function inciConfirmerCorrespondance(i) {
  const select = document.getElementById(`corresp-mai-${i}`);
  const inputNew = document.getElementById(`corresp-mai-new-${i}`);
  let valeur = select.value;

  if (valeur === '__nouveau__') {
    valeur = (inputNew?.value || '').trim();
    if (!valeur) {
      afficherMsg('inci', 'Entre un nom de catégorie.', 'erreur');
      return;
    }
  }

  if (!valeur) {
    afficherMsg('inci', 'Choisis une catégorie maître.', 'erreur');
    return;
  }

  inciCorrespondance[i].categorieMaitre = valeur;
  inciCorrespondance[i].confirme = true;

  const res = await appelAPIPost('sauvegarderCorrespondanceInci', {
    correspondance: inciCorrespondance.map(r => ({
      categorieSource:  r.categorieSource,
      categorieMaitre:  r.categorieMaitre,
      sourceProvenance: r.sourceProvenance || '',
      confirme:         r.confirme || false
    }))
  });

  if (res && res.success) {
    afficherMsg('inci', `✅ Correspondance confirmée.`);
    await chargerInci();
  } else {
    afficherMsg('inci', 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

async function inciSauvegarderCorrespondance() {
  const inputs = document.querySelectorAll('[id^="corresp-src-"]');
  const correspondance = [];
  inputs.forEach((el, i) => {
    const src = el.value.trim();
    const mai = document.getElementById(`corresp-mai-${i}`)?.value.trim() || '';
    if (src) correspondance.push({ categorieSource: src, categorieMaitre: mai });
  });

  const res = await appelAPIPost('sauvegarderCorrespondanceInci', { correspondance });
  if (res && res.success) {
    afficherMsg('inci', 'Correspondances sauvegardées.');
    await chargerInci();
  } else {
    afficherMsg('inci', 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

/* ════════════════════════════════
   DENSITÉS
════════════════════════════════ */


async function chargerDensites() {
  const loading = document.getElementById('loading-densites');
  const tableau = document.getElementById('tableau-densites');
  const vide    = document.getElementById('vide-densites');
  loading.classList.remove('cache');
  tableau.classList.add('cache');
  vide.classList.add('cache');

  const res = await appelAPI('getDensities');


loading.classList.add('cache');
  if (!res || !Array.isArray(res.densities)) { afficherMsg('densites', 'Erreur.', 'erreur'); return; }
  donneesDensites = res.densities;

  if (!donneesDensites.length) { vide.classList.remove('cache'); return; }

  const tbody = document.getElementById('tbody-densites');
  tbody.innerHTML = '';
  donneesDensites.forEach(d => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => modifierDensite(d.type);
    tr.innerHTML = `
      <td>${d.type}</td>
      <td>${parseFloat(d.densite).toFixed(3)}</td>
      <td>${d.unite}</td>
      <td>${d.marge_perte_pct ? parseFloat(d.marge_perte_pct).toFixed(1) + ' %' : '—'}</td>
     `;
    tbody.appendChild(tr);
  });
  tableau.classList.remove('cache');
}

function ouvrirFormDensite() {
  document.getElementById('form-densites-titre').textContent = 'Nouveau type';
  document.getElementById('fd-mode').value         = 'ajout';
  document.getElementById('fd-type').value         = '';
  document.getElementById('fd-densite').value      = '';
  document.getElementById('fd-unite').value        = 'ml';
  document.getElementById('fd-marge-perte').value  = '';
  document.getElementById('fd-type').readOnly      = false;
  document.getElementById('form-densites').classList.add('visible');
  document.getElementById('fd-type').focus();
}

function fermerFormDensite() {
  document.getElementById('form-densites').classList.remove('visible');
  document.getElementById('btn-nouvelle-densite').classList.remove('cache');
}

function modifierDensite(type) {
  const d = donneesDensites.find(x => x.type === type);
  if (!d) return;
  document.getElementById('form-densites-titre').textContent = 'Modifier la densité';
  document.getElementById('fd-mode').value         = 'modif';
  document.getElementById('fd-type').value         = d.type;
  document.getElementById('fd-densite').value      = d.densite;
  document.getElementById('fd-unite').value        = d.unite;
  document.getElementById('fd-marge-perte').value  = d.marge_perte_pct || '';
  document.getElementById('fd-type').readOnly      = true;
  document.getElementById('form-densites').classList.add('visible');
  document.getElementById('btn-nouvelle-densite').classList.add('cache');
  document.getElementById('fd-densite').focus();
}

async function sauvegarderDensite() {
  const mode    = document.getElementById('fd-mode').value;
  const type    = document.getElementById('fd-type').value.trim();
  const densite = parseFloat(document.getElementById('fd-densite').value);
  const unite   = document.getElementById('fd-unite').value;
  if (!type) { afficherMsg('densites', 'Le type est requis.', 'erreur'); return; }
  if (isNaN(densite) || densite <= 0) { afficherMsg('densites', 'Densité invalide.', 'erreur'); return; }
  const marge_perte_pct = parseFloat(document.getElementById('fd-marge-perte').value) || 0;
  const action = mode === 'modif' ? 'saveDensity' : 'addDensityType';
  const res = await appelAPIPost(action, { type, densite, unite, marge_perte_pct });
  if (res && res.success) {
    fermerFormDensite();
    afficherMsg('densites', mode === 'modif' ? 'Densité mise à jour.' : 'Type ajouté.');
    donneesDensites = [];
    chargerDensites();
  } else {
    afficherMsg('densites', res?.message || 'Erreur.', 'erreur');
  }
}

/* ════════════════════════════════
   NOUVELLE FACTURE — WIZARD
════════════════════════════════ */

let listesDropdown = { types: [], fullData: [], fournisseurs: [] };

function terminerPlusTard() {
  factureActive   = null;
  produitsFacture = [];
  afficherSection('factures', null);
  afficherMsg('factures', 'Facture sauvegardée — vous pouvez la compléter plus tard.', 'succes');
}

async function initialiserNouvelleFacture() {
  if (factureActive) return;
  factureActive   = null;
  produitsFacture = [];
  const dateField = document.getElementById('facture-date');
  if (dateField && !dateField.value) dateField.value = new Date().toISOString().split('T')[0];
  await chargerListesFournisseurs();
  const resFormats = await appelAPI('getFormatsIngredients');
  listesDropdown.formats = (resFormats && resFormats.items) ? resFormats.items : [];
  wizardEtape1();
}

async function chargerListesFournisseurs() {
  const res = await appelAPI('getDropdownLists');
  if (res) {
    listesDropdown.types    = res.types    || [];
 listesDropdown.fullData = res.fullData || [];
    listesDropdown.config   = res.config   || {};
  }
  const resFactures = await appelAPI('getInvoicesListWithFilters');
  if (resFactures) {
    listesDropdown.fournisseurs = resFactures.fournisseurs || [];
  }
  peuplerSelectFournisseur();
  peuplerSelectType();
}

function peuplerSelectFournisseur() {
  const sel = document.getElementById('facture-fournisseur');
  if (!sel) return;
  sel.innerHTML = '<option value=""></option>';
  listesDropdown.fournisseurs.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f; opt.textContent = f;
    sel.appendChild(opt);
  });
  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouveau fournisseur…';
  sel.appendChild(optNew);
}

function peuplerSelectType() {
  const sel = document.getElementById('item-type');
  if (!sel) return;
  sel.innerHTML = '<option value=""></option>';
  [...listesDropdown.types].sort((a, b) => a.localeCompare(b, 'fr')).forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    sel.appendChild(opt);
  });
}

function onChangeFournisseur() {
  const sel   = document.getElementById('facture-fournisseur');
  const champ = document.getElementById('facture-fournisseur-nouveau');
  if (!sel || !champ) return;
  champ.classList.toggle('cache', sel.value !== '__nouveau__');
  if (sel.value === '__nouveau__' && window.innerWidth > 900) champ.focus();
}

function onChangeType() {
  const type = document.getElementById('item-type')?.value;
  const sel  = document.getElementById('item-ingredient');
  if (!sel) return;
  sel.innerHTML = '<option value=""></option>';
  listesDropdown.fullData.filter(d => d.type === type).sort((a, b) => a.ingredient.localeCompare(b.ingredient, 'fr')).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.ingredient; opt.textContent = d.ingredient;
    sel.appendChild(opt);
  });
  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouvel ingrédient…';
  sel.appendChild(optNew);
}

function onChangeIngredient() {
  const sel   = document.getElementById('item-ingredient');
  const champ = document.getElementById('item-ingredient-nouveau');
  if (!sel || !champ) return;
  champ.classList.toggle('cache', sel.value !== '__nouveau__');

  const selFormat = document.getElementById('item-format');
  if (!selFormat) return;
  selFormat.innerHTML = '<option value="">— Choisir un format —</option>';
  const type = document.getElementById('item-type')?.value;
  const ing  = sel.value;
  if (!ing || ing === '__nouveau__') return;

  const formats = (listesDropdown.formats || []).filter(f =>
    f.type === type && f.ingredient === ing && f.fournisseur === (factureActive?.fournisseur || '')
  );
  formats.forEach(f => {
    const opt = document.createElement('option');
    opt.value = JSON.stringify({ quantite: f.quantite, unite: f.unite });
    opt.dataset.contenant = f.contenant;
    opt.textContent = (f.contenant ? f.contenant + ' — ' : '') + f.quantite + ' ' + f.unite;
    selFormat.appendChild(opt);
  });

  const optNouveau = document.createElement('option');
  optNouveau.value = '__nouveau__';
  optNouveau.textContent = '+ Nouveau format';
  selFormat.appendChild(optNouveau);
}

function onChangeFormat() {
  const selFormat = document.getElementById('item-format');
  if (!selFormat) return;
  const nouveau = selFormat.value === '__nouveau__';
  document.getElementById('item-nouveau-qte-bloc').classList.toggle('cache', !nouveau);
  document.getElementById('item-nouveau-unite-bloc').classList.toggle('cache', !nouveau);
  if (nouveau) {
    document.getElementById('item-format-qte').value   = '';
    document.getElementById('item-format-unite').value = '';
    return;
  }
  if (!selFormat.value) return;
  const f = JSON.parse(selFormat.value);
  document.getElementById('item-format-qte').value   = f.quantite;
  document.getElementById('item-format-unite').value = f.unite;
}

function wizardEtape1() {
  document.getElementById('wizard-step-1').classList.remove('cache');
  document.getElementById('wizard-step-2').classList.add('cache');
  document.getElementById('wizard-step-3').classList.add('cache');
  document.getElementById('wizard-etape-1').classList.add('active');
  document.getElementById('wizard-etape-1').classList.remove('complete');
  document.getElementById('wizard-etape-2').classList.remove('active', 'complete');
  document.getElementById('wizard-etape-3').classList.remove('active', 'complete');
}

async function wizardEtape2() {
  const numeroFacture = document.getElementById('facture-numero')?.value?.trim();
  const date          = document.getElementById('facture-date')?.value;
  let fournisseur     = document.getElementById('facture-fournisseur')?.value;
  if (fournisseur === '__nouveau__') {
    fournisseur = document.getElementById('facture-fournisseur-nouveau')?.value?.trim();
  }
  if (!numeroFacture || !date || !fournisseur) {
    afficherMsg('facture-msg', 'Numéro, date et fournisseur sont requis.', 'erreur');
    return;
  }

  if (!factureActive) {
    const res = await appelAPIPost('createInvoice', { numeroFacture, date, fournisseur });
    if (!res || !res.success) {
      afficherMsg('facture-msg', res?.message || 'Erreur lors de la création.', 'erreur');
      return;
    }
    factureActive = { numeroFacture, date, fournisseur };
    if (!listesDropdown.fournisseurs.includes(fournisseur)) {
      listesDropdown.fournisseurs.push(fournisseur);
      listesDropdown.fournisseurs.sort();
    }
  }

  document.getElementById('wizard-step-1').classList.add('cache');
  document.getElementById('wizard-step-2').classList.remove('cache');
  document.getElementById('wizard-step-3').classList.add('cache');
  document.getElementById('wizard-etape-1').classList.remove('active');
  document.getElementById('wizard-etape-1').classList.add('complete');
  document.getElementById('wizard-etape-2').classList.add('active');
  document.getElementById('wizard-etape-3').classList.remove('active', 'complete');
  afficherBanniereFacture();
  afficherItemsFacture();
}

function wizardEtape3() {
  if (produitsFacture.length === 0) {
    afficherMsg('item-msg', 'Ajoutez au moins un item avant de continuer.', 'erreur');
    return;
  }
  document.getElementById('wizard-step-1').classList.add('cache');
  document.getElementById('wizard-step-2').classList.add('cache');
  document.getElementById('wizard-step-3').classList.remove('cache');
  document.getElementById('wizard-etape-2').classList.remove('active');
  document.getElementById('wizard-etape-2').classList.add('complete');
  document.getElementById('wizard-etape-3').classList.add('active');
  const sousTotal = produitsFacture.reduce((s, i) => s + i.prixTotal, 0);
  document.getElementById('final-sous-total').value = sousTotal.toFixed(2);
  calculerTotalFinal();
}

function afficherBanniereFacture() {
  const banniere = document.getElementById('facture-banniere');
  if (!banniere || !factureActive) return;
  banniere.classList.remove('cache');
  const sousTotal = produitsFacture.reduce((s, i) => s + i.prixTotal, 0);
  document.getElementById('banniere-numero').textContent     = factureActive.numeroFacture;
  document.getElementById('banniere-fournisseur').textContent = factureActive.fournisseur;
  document.getElementById('banniere-sous-total').textContent  = formaterPrix(sousTotal);
}

async function ajouterItem() {
  if (!factureActive) {
    afficherMsg('item-msg', 'Aucune facture active.', 'erreur');
    return;
  }
  let ingredient = document.getElementById('item-ingredient')?.value;
  if (ingredient === '__nouveau__') {
    ingredient = document.getElementById('item-ingredient-nouveau')?.value?.trim();
  }
  const type        = document.getElementById('item-type')?.value;
  const selFormat   = document.getElementById('item-format');
  const isNouveau   = selFormat?.value === '__nouveau__';
  const formatQte   = isNouveau ? document.getElementById('item-nouveau-qte')?.value?.trim() : document.getElementById('item-format-qte')?.value?.trim();
  const formatUnite = isNouveau ? document.getElementById('item-nouveau-unite')?.value : document.getElementById('item-format-unite')?.value;
  const contenant   = isNouveau ? document.getElementById('item-contenant')?.value?.trim() : (selFormat?.options[selFormat.selectedIndex]?.dataset?.contenant || '');
  const prixUnit    = document.getElementById('item-prix-unitaire')?.value?.trim();
  const quantite    = document.getElementById('item-quantite')?.value?.trim();
  const notes       = document.getElementById('item-notes')?.value?.trim();

  if (!type || !ingredient || !formatQte || !prixUnit || !quantite) {
    afficherMsg('item-msg', 'Tous les champs obligatoires doivent être remplis.', 'erreur');
    return;
  }

const prixTotal = parseFloat(quantite) * parseFloat(prixUnit);

  // Calcul prix/g
  let prixParG = null;
  const cfg = listesDropdown.config?.[type];
 
  if (cfg && formatQte) {
    const qte      = parseFloat(formatQte);
    const densite  = cfg.densite || 1;
    const perte    = cfg.margePertePct || 0;
    let qteEnG = qte;
    if (formatUnite === 'g')   qteEnG = qte;
    if (formatUnite === 'kg')  qteEnG = qte * 1000;
    if (formatUnite === 'L')   qteEnG = qte * 1000 * (cfg.densite || 1);
    if (formatUnite === 'ml')  qteEnG = qte * (cfg.densite || 1);
    if (formatUnite === 'lbs') qteEnG = qte * 453.592;
    const prixParGBrut = qteEnG > 0 ? parseFloat(prixUnit) / qteEnG : null;
    prixParG = prixParGBrut !== null ? prixParGBrut * (1 + (perte / 100)) : null;
  }

  const res = await appelAPIPost('addProduct', {
    numFacture:   factureActive.numeroFacture,
    date:         factureActive.date,
    fournisseur:  factureActive.fournisseur,
    type,
    ingredient,
    formatQte:    parseFloat(formatQte),
    formatUnite,
    prixUnitaire: parseFloat(prixUnit),
    prixParG:     prixParG,
    quantite:     parseFloat(quantite),
    notes:        notes || '',
    codeBarres:   ''
  });

  if (!res || !res.success) {
    afficherMsg('item-msg', res?.message || 'Erreur lors de l\'ajout.', 'erreur');
    return;
  }

  appelAPIPost('saveFormatIngredient', {
    type, ingredient, fournisseur: factureActive.fournisseur,
    contenant, quantite: parseFloat(formatQte), unite: formatUnite
  });
  if (isNouveau) {
    listesDropdown.formats.push({
      type, ingredient, fournisseur: factureActive.fournisseur,
      contenant, quantite: parseFloat(formatQte), unite: formatUnite
    });
  }

  produitsFacture.push({ type, ingredient, formatQte, formatUnite, prixUnitaire: parseFloat(prixUnit), quantite: parseFloat(quantite), prixTotal });
  afficherMsg('item-msg', 'Item ajouté.', 'succes');
  reinitialiserFormulaireItem();
  afficherItemsFacture();
  afficherBanniereFacture();
}

function reinitialiserFormulaireItem() {
  ['item-type','item-ingredient','item-format-qte','item-format-unite','item-prix-unitaire','item-quantite','item-notes','item-nouveau-qte']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const champNouv = document.getElementById('item-ingredient-nouveau');
  if (champNouv) { champNouv.classList.add('cache'); champNouv.value = ''; }
  document.getElementById('item-ingredient').innerHTML = '<option value=""></option>';
  const selFormat = document.getElementById('item-format');
  if (selFormat) selFormat.innerHTML = '<option value="">— Choisir un format —</option>';
  ['item-nouveau-format-bloc','item-nouveau-qte-bloc','item-nouveau-unite-bloc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.add('cache');
  });
}

function afficherItemsFacture() {
  const zone = document.getElementById('items-tableau-zone');
  if (!zone) return;
  if (produitsFacture.length === 0) {
    zone.innerHTML = '<p class="vide-desc" style="padding:24px 0;">Aucun item pour l\'instant.</p>';
    return;
  }
  const sousTotal = produitsFacture.reduce((s, i) => s + i.prixTotal, 0);
  let html = `
    <div class="tableau-wrap">
      <table>
        <thead>
          <tr><th>Type</th><th>Ingrédient</th><th>Format</th><th>Prix unit.</th><th>Qté</th><th>Total</th></tr>
        </thead>
        <tbody>`;
  produitsFacture.forEach(item => {
    html += `
      <tr>
        <td>${item.type}</td>
        <td>${item.ingredient}</td>
        <td>${item.formatQte} ${item.formatUnite}</td>
        <td>${formaterPrix(item.prixUnitaire)}</td>
        <td>${item.quantite}</td>
        <td>${formaterPrix(item.prixTotal)}</td>
      </tr>`;
  });
  html += `</tbody></table></div>
    <div class="inv-total" style="margin-top:16px;">
      <div class="inv-total-label">Sous-total</div>
      <div class="inv-total-montant">${formaterPrix(sousTotal)}</div>
    </div>`;
  zone.innerHTML = html;
}

function calculerTotalFinal() {
  const sousTotal = parseFloat(document.getElementById('final-sous-total')?.value) || 0;
  const tps       = parseFloat(document.getElementById('final-tps')?.value)        || 0;
  const tvq       = parseFloat(document.getElementById('final-tvq')?.value)        || 0;
  const livraison = parseFloat(document.getElementById('final-livraison')?.value)  || 0;
  const affichage = document.getElementById('final-total-affichage');
  if (affichage) affichage.textContent = formaterPrix(sousTotal + tps + tvq + livraison);
}

async function finaliserFacture() {
  if (!factureActive) {
    afficherMsg('final-msg', 'Aucune facture active.', 'erreur');
    return;
  }
  if (produitsFacture.length === 0) {
    afficherMsg('final-msg', 'Aucun item à finaliser.', 'erreur');
    return;
  }
  const btnFinaliser = document.querySelector('.btn-finaliser');
  if (btnFinaliser) { btnFinaliser.disabled = true; btnFinaliser.innerHTML = '<span class="spinner"></span> Finalisation…'; }
  const sousTotal = parseFloat(document.getElementById('final-sous-total')?.value) || 0;
  const tps       = parseFloat(document.getElementById('final-tps')?.value)        || 0;
  const tvq       = parseFloat(document.getElementById('final-tvq')?.value)        || 0;
  const livraison = parseFloat(document.getElementById('final-livraison')?.value)  || 0;
  const res = await appelAPIPost('finalizeInvoice', {
    numeroFacture: factureActive.numeroFacture,
    sousTotal, tps, tvq, livraison
  });
 
if (!res || !res.success) {
    if (btnFinaliser) { btnFinaliser.disabled = false; btnFinaliser.innerHTML = 'Finaliser'; }
    afficherMsg('final-msg', res?.message || 'Erreur lors de la finalisation.', 'erreur');
    return;
  }
  afficherMsg('final-msg', `✓ Facture ${factureActive.numeroFacture} finalisée — Total : ${formaterPrix(res.total)}`, 'succes');
  setTimeout(() => {

     
     factureActive   = null;
    produitsFacture = [];
    wizardEtape1();
    document.getElementById('facture-numero').value = '';
    document.getElementById('facture-date').value   = new Date().toISOString().split('T')[0];
    document.getElementById('facture-fournisseur').value = '';
    document.getElementById('facture-banniere').classList.add('cache');
    document.getElementById('items-tableau-zone').innerHTML = '';
    document.getElementById('final-total-affichage').textContent = '0,00 $';
  }, 5000);
}
async function validerConnexionAdmin() {
  const mdp = document.getElementById('input-mdp-admin').value;
  if (mdp === CONFIG.MOT_DE_PASSE) {
    sessionStorage.setItem('uc_admin', 'true');
    document.getElementById('ecran-connexion').classList.add('cache');
    await chargerDonneesInitiales();
    afficherSection('accueil', null);
  } else {
    document.getElementById('erreur-mdp-admin').textContent = 'Mot de passe incorrect.';
    document.getElementById('input-mdp-admin').value = '';
    document.getElementById('input-mdp-admin').focus();
  }
}

// ─── CONTENU DU SITE ───
async function chargerContenuSite() {
  const loading = document.getElementById('loading-contenu-site');
  const corps = document.getElementById('corps-contenu-site');
  if (loading) loading.classList.remove('cache');
  if (corps) corps.classList.add('cache');
  const data = await appelAPI('getContenu');
  if (loading) loading.classList.add('cache');
  if (!data || !data.success || !data.contenu) { afficherMsg('msg-contenu-site', 'Erreur de chargement.', 'erreur'); return; }
  const c = data.contenu;
  Object.keys(c).forEach(cle => {
    const el = document.getElementById('cs-' + cle);
    if (el) el.value = c[cle];
  });
  const btnSaisonnier = document.getElementById('btn-mode-saisonnier');
  if (btnSaisonnier) {
    const actif = c.mode_saisonnier === 'oui';
    btnSaisonnier.textContent = actif ? '🌲 Mode saisonnier ON' : '🌲 Mode saisonnier OFF';
    btnSaisonnier.classList.toggle('btn-primary', actif);
    btnSaisonnier.classList.toggle('btn-secondary', !actif);
  }
  if (corps) corps.classList.remove('cache');
}

async function toggleModeSaisonnier() {
  const res = await appelAPI('getContenu');
  if (!res || !res.success) return;
  const actuel = res.contenu.mode_saisonnier || 'non';
  const nouveau = actuel === 'oui' ? 'non' : 'oui';
  const data = await appelAPIPost('updateContenu', { contenu: { mode_saisonnier: nouveau } });
  if (data && data.success) {
    document.getElementById('btn-mode-saisonnier').textContent = nouveau === 'oui' ? '🌲 Mode saisonnier ON' : '🌲 Mode saisonnier OFF';
    document.getElementById('btn-mode-saisonnier').classList.toggle('btn-primary', nouveau === 'oui');
    document.getElementById('btn-mode-saisonnier').classList.toggle('btn-secondary', nouveau !== 'oui');
    afficherMsg('contenu-site', nouveau === 'oui' ? 'Mode saisonnier activé.' : 'Mode saisonnier désactivé.');
  }
}

async function sauvegarderContenuSite() {
  const corps = document.getElementById('corps-contenu-site');
  if (!corps) return;
  const contenu = {};
  corps.querySelectorAll('[id^="cs-"]').forEach(el => {
    const cle = el.id.replace('cs-', '');
    contenu[cle] = el.value;
  });
const data = await appelAPIPost('updateContenu', { contenu });
if (data && data.success) {
    afficherMsg('msg-contenu-site', 'Contenu sauvegardé.', 'succes');
  } else {
    afficherMsg('msg-contenu-site', 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

// ─── IMPORT RECETTES ───

const IMPORT_TYPES_MAP = {
  'huile de tournesol': 'Huiles', 'huile de coco': 'Huiles', 'huile d\'olive': 'Huiles',
  'huile de calendula': 'Huiles', 'huile de rose': 'Huiles', 'huile végétale': 'Huiles',
  'huile de ricin': 'Huiles', 'huile d\'argan': 'Huiles', 'huile de café': 'Huiles',
  'huile de pépins': 'Huiles', 'huile': 'Huiles',
  'beurre de karité': 'Beurres', 'beurre de cacao': 'Beurres', 'beurre de mangue': 'Beurres', 'beurre': 'Beurres',
  'eau': 'Ingrédients Liquides', 'hydrolat': 'Hydrolats',
  'soude caustique': 'Ingrédients Secs', 'naoh': 'Ingrédients Secs', 'bicarbonate': 'Ingrédients Secs',
  'acide citrique': 'Ingrédients Secs', 'fécule': 'Ingrédients Secs', 'sel': 'Ingrédients Secs',
  'sucre': 'Ingrédients Secs', 'avoine': 'Ingrédients Secs', 'amande moulue': 'Ingrédients Secs',
  'argile': 'Argiles', 'charbon': 'Argiles',
  'he ': 'Huiles essentielles', 'huile essentielle': 'Huiles essentielles',
  'ha ': 'Huiles aromatiques', 'fragrance': 'Fragrances', 'musc': 'Fragrances',
  'mica': 'Colorants et Pigments', 'colorant': 'Colorants et Pigments', 'pigment': 'Colorants et Pigments',
  'petales': 'Herbes et Fleurs', 'fleurs': 'Herbes et Fleurs', 'lavande': 'Herbes et Fleurs',
  'romarin': 'Herbes et Fleurs', 'spiruline': 'Herbes et Fleurs', 'matcha': 'Herbes et Fleurs',
  'curcuma': 'Herbes et Fleurs', 'cire': 'Cires',
  'miel': 'Ingrédients Liquides', 'glycerine': 'Ingrédients Liquides',
  'vitamine': 'Bases neutres', 'allantoine': 'Bases neutres', 'sci': 'Bases neutres'
};

function importDevinerType(nom) {
  const n = nom.toLowerCase();
  for (const [cle, type] of Object.entries(IMPORT_TYPES_MAP)) {
    if (n.includes(cle)) return type;
  }
  return 'Ingredients Secs';
}

function importParserMD() {
  const texte = document.getElementById('import-md-texte').value.trim();
  if (!texte) { afficherMsg('import-recettes', 'Coller un fichier MD d\'abord.', 'erreur'); return; }

  const lignes = texte.split('\n');
  const get = (regex) => { const m = texte.match(regex); return m ? m[1].trim() : ''; };

  const nom            = get(/^#\s+(.+?)(?:\s+—|$)/m);
  const ligne          = get(/\*\*Ligne\s*:\*\*\s*(.+?)(?:\s*\||\n)/);
  const cure           = get(/\*\*Cure\s*:\*\*\s*(\d+)/) || '';
  const nb_unites      = get(/\*\*Nb unités\s*:\*\*\s*(\d+)/) || '';
  const statut         = get(/\*\*Statut\s*:\*\*\s*(\w+)/) || 'test';
  const couleur_hex    = get(/\*\*HEX\s*:\*\*\s*(#[0-9a-fA-F]{3,6})/);
  const image_url      = get(/\*\*Image\s*:\*\*\s*(https?:\/\/\S+)(?!\s*Noël)/);
  const image_url_noel = get(/\*\*Image Noël\s*:\*\*\s*(https?:\/\/\S+)/);
  const surgras        = get(/\*\*Surgras\s*:\*\*\s*(\d+%?)/);
  const rang           = get(/\*\*Rang\s*:\*\*\s*(\d+)/);
  const desc_courte    = get(/\*\*Version courte\s*:\*\*\s*(.+)/);
  const desc_longue    = get(/\*\*Version longue\s*:\*\*\s*(.+)/);
  const notes          = get(/\*\*Notes\s*:\*\*\s*(.+)/);

  const ingredients = [];
  let dansIngredients = false;
  for (const ligne_raw of lignes) {
    const l = ligne_raw.trim();
    if (l.match(/^##\s+RECETTE/i) || l.match(/^\*\*Fragrances\s*:|^\*\*Additifs\s*:/i)) {
      dansIngredients = true; continue;
    }
    if (dansIngredients && l === '---') { continue; }
    if (dansIngredients && l.match(/^\*\*(?!Fragrances|Additifs)/i)) { dansIngredients = false; continue; }
    if (dansIngredients && l.startsWith('- ')) {
      const m = l.match(/^-\s+([\d.,]+)\s*g\s+(.+)/);
     if (m) {
        const qte = parseFloat(m[1].replace(',', '.')) || 0;
        const nomIng = m[2].trim();
        const foundIng = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === nomIng.toLowerCase());
        const nomFinal = foundIng ? foundIng.ingredient : nomIng;
        const inciFinal = foundIng ? (foundIng.inci || '') : '';
        const typeFinal = foundIng ? foundIng.type : importDevinerType(nomIng);
        ingredients.push({ type: typeFinal, nom: nomFinal, quantite_g: qte, cout: 0, inci: inciFinal });
      } else {
        const nomIng = l.replace(/^-\s+/, '').trim();
        if (nomIng && !nomIng.match(/mélanger|melanger|^¼|^½|^¾|sur le dessus|gouttes|flocons|restes/i)) {
          const foundIng = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === nomIng.toLowerCase());
          const nomFinal = foundIng ? foundIng.ingredient : nomIng;
          const inciFinal = foundIng ? (foundIng.inci || '') : '';
          const typeFinal = foundIng ? foundIng.type : importDevinerType(nomIng);
          ingredients.push({ type: typeFinal, nom: nomFinal, quantite_g: 0, cout: 0, inci: inciFinal });
        }
      }
    }
  }

  document.getElementById('imp-nom').value            = nom;
  document.getElementById('imp-rang').value           = rang;
  document.getElementById('imp-collection').value     = 'SAPONICA';
  document.getElementById('imp-ligne').value          = ligne;
  document.getElementById('imp-statut').value         = statut;
  document.getElementById('imp-unites').value         = nb_unites;
  document.getElementById('imp-cure').value           = cure;
  document.getElementById('imp-surgras').value        = surgras;
  document.getElementById('imp-couleur-hex').value    = couleur_hex;
  document.getElementById('imp-image-url').value      = image_url;
  document.getElementById('imp-image-url-noel').value = image_url_noel;
  document.getElementById('imp-desc-courte').value    = desc_courte;
  document.getElementById('imp-desc-longue').value    = desc_longue;
  document.getElementById('imp-notes').value          = notes;

  importApercuCouleur(document.getElementById('imp-couleur-hex'));

  const zone = document.getElementById('imp-ingredients');
  zone.innerHTML = '';
  ingredients.forEach((ing, i) => {
    const row = document.createElement('div');
    row.className = 'import-ing-row';
    row.innerHTML = `
      <input type="text" class="form-ctrl" placeholder="Type" value="${ing.type}" data-ing="${i}" data-champ="type">
      <input type="text" class="form-ctrl" placeholder="Nom" value="${ing.nom}" data-ing="${i}" data-champ="nom">
      <input type="text" inputmode="decimal" class="form-ctrl" placeholder="g" value="${ing.quantite_g}" data-ing="${i}" data-champ="quantite_g">
      <button class="btn btn-sm btn-danger" onclick="this.closest('.import-ing-row').remove()">✕</button>
    `;
    zone.appendChild(row);
  });

  document.getElementById('import-apercu-zone').classList.remove('cache');
}

async function importEnvoyer() {
  const id = parseInt(document.getElementById('import-recette-id').value) || 1;

  const ingredients = [];
  document.querySelectorAll('#imp-ingredients .import-ing-row').forEach(row => {
    const champs = row.querySelectorAll('input');
    const type       = champs[0].value.trim();
    const nom        = champs[1].value.trim();
    const quantite_g = parseFloat(champs[2].value) || 0;
    const found      = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === nom.toLowerCase());
    const inci       = found ? (found.inci || '') : '';
    if (nom) ingredients.push({ type, nom, quantite_g, cout: 0, inci });
  });

  const json = {
    action: 'saveRecette',
    recette_id: String(id),
    nom:                   document.getElementById('imp-nom').value.trim(),
    rang:                  document.getElementById('imp-rang').value.trim(),
    collection:     document.getElementById('imp-collection').value.trim(),
    ligne:          document.getElementById('imp-ligne').value.trim().toUpperCase(),
    statut:         document.getElementById('imp-statut').value,
    nb_unites:      parseInt(document.getElementById('imp-unites').value) || 1,
    cure:           parseInt(document.getElementById('imp-cure').value) || 0,
    surgras:        document.getElementById('imp-surgras').value.trim(),
    couleur_hex:    document.getElementById('imp-couleur-hex').value.trim(),
    image_url:      document.getElementById('imp-image-url').value.trim(),
    image_url_noel: document.getElementById('imp-image-url-noel').value.trim(),
    desc_emballage: document.getElementById('imp-desc-courte').value.trim(),
    description:    document.getElementById('imp-desc-longue').value.trim(),
    notes:          document.getElementById('imp-notes').value.trim(),
    format: '', prix_vente: 0, instructions: '', collections_secondaires: [],
    ingredients
  };

  const res = await appelAPIPost('saveRecette', json);
  if (!res || !res.success) {
    afficherMsg('import-recettes', res?.message || 'Erreur import.', 'erreur');
    return;
  }
  afficherMsg('import-recettes', 'Recette ' + json.nom + ' importée (ID ' + json.recette_id + ').', 'succes');
  const nextId = parseInt(json.recette_id) + 1;
  document.getElementById('import-recette-id').value = nextId;
  document.getElementById('import-md-texte').value = '';
  document.getElementById('import-md-fichier').value = '';
  document.getElementById('import-apercu-zone').classList.add('cache');
}

function importApercuCouleur(input) {
  const apercu = document.getElementById('imp-couleur-apercu');
  if (!apercu) return;
  const val = input.value.trim();
  apercu.style.background = val.match(/^#[0-9a-fA-F]{3,6}$/) ? val : 'transparent';
}

function importLireFichier(input) {
  const fichier = input.files[0];
  if (!fichier) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('import-md-texte').value = e.target.result;
    importParserMD();
  };
  reader.readAsText(fichier, 'UTF-8');
}

async function importEnLot(input) {
  const fichiers = Array.from(input.files);
  if (!fichiers.length) return;
  const msg = document.getElementById('msg-import-recettes');
  msg.textContent = `Import en cours — 0 / ${fichiers.length}`;
  msg.className = 'msg-zone';

  let nextId = parseInt(document.getElementById('import-recette-id').value) || 1;
  let succes = 0;
  let erreurs = [];

  for (let i = 0; i < fichiers.length; i++) {
    const texte = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.onerror = () => rej();
      r.readAsText(fichiers[i], 'UTF-8');
    });

    try {
      const parsed = importParserTexte(texte, nextId);
      const res = await appelAPIPost('saveRecette', parsed);
      if (res && res.success) {
        succes++;
        nextId++;
        msg.textContent = `Import en cours — ${i + 1} / ${fichiers.length} — ${fichiers[i].name}`;
      } else {
        erreurs.push(fichiers[i].name);
      }
    } catch(e) {
      erreurs.push(fichiers[i].name);
    }
  }

  document.getElementById('import-recette-id').value = nextId;
  input.value = '';

  if (erreurs.length === 0) {
    afficherMsg('import-recettes', `✅ ${succes} recettes importées avec succès.`, 'succes');
  } else {
    afficherMsg('import-recettes', `${succes} importées — Erreurs : ${erreurs.join(', ')}`, 'erreur');
  }
  await chargerRecettes();
}

function importParserTexte(texte, id) {
  const get = (regex) => { const m = texte.match(regex); return m ? m[1].trim() : ''; };
  const lignes = texte.split('\n');

  const nom            = get(/^#\s+(.+?)(?:\s+—|$)/m);
  const ligne          = get(/\*\*Ligne\s*:\*\*\s*(.+?)(?:\s*\||\n)/);
  const cure           = get(/\*\*Cure\s*:\*\*\s*(\d+)/) || '';
  const nb_unites      = get(/\*\*Nb unités\s*:\*\*\s*(\d+)/) || '';
  const statut         = get(/\*\*Statut\s*:\*\*\s*(\w+)/) || 'test';
  const couleur_hex    = get(/\*\*HEX\s*:\*\*\s*(#[0-9a-fA-F]{3,6})/);
  const image_url      = get(/\*\*Image\s*:\*\*\s*(https?:\/\/\S+)(?!\s*Noël)/);
  const image_url_noel = get(/\*\*Image Noël\s*:\*\*\s*(https?:\/\/\S+)/);
  const surgras        = get(/\*\*Surgras\s*:\*\*\s*(\d+%?)/);
  const rang           = get(/\*\*Rang\s*:\*\*\s*(\d+)/);
  const desc_courte    = get(/\*\*Version courte\s*:\*\*\s*(.+)/);
  const desc_longue    = get(/\*\*Version longue\s*:\*\*\s*(.+)/);
  const notes               = get(/\*\*Notes\s*:\*\*\s*(.+)/);
  const collection          = get(/^#\s+.+—\s+([^—\n]+)$/m) || 'SAPONICA';
  const colsSecondairesRaw  = get(/\*\*Collections secondaires\s*:\*\*\s*(.+)/);
  const collections_secondaires = colsSecondairesRaw ? colsSecondairesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const ingredients = [];
  let dansIngredients = false;
  for (const ligne_raw of lignes) {
    const l = ligne_raw.trim();
    if (l.match(/^##\s+RECETTE/i) || l.match(/^\*\*Fragrances\s*:|\*\*Additifs\s*:/i)) { dansIngredients = true; continue; }
    if (dansIngredients && l === '---') { continue; }
    if (dansIngredients && l.match(/^\*\*(?!Fragrances|Additifs)/i)) { dansIngredients = false; continue; }
    if (dansIngredients && l.startsWith('- ')) {
      const m = l.match(/^-\s+([\d.,]+)\s*g\s+(.+)/);
      if (m) {
        const qte = parseFloat(m[1].replace(',', '.')) || 0;
        const nomIng = m[2].trim();
        const foundIng = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === nomIng.toLowerCase());
        const nomFinal = foundIng ? foundIng.ingredient : nomIng;
        const inciFinal = foundIng ? (foundIng.inci || '') : '';
        const typeFinal = foundIng ? foundIng.type : importDevinerType(nomIng);
        ingredients.push({ type: typeFinal, nom: nomFinal, quantite_g: qte, cout: 0, inci: inciFinal });
      } else {
        const nomIng = l.replace(/^-\s+/, '').trim();
        if (nomIng && !nomIng.match(/mélanger|melanger|^¼|^½|^¾|sur le dessus|gouttes|flocons|restes/i)) {
          const foundIng = (listesDropdown.fullData || []).find(d => d.ingredient.toLowerCase() === nomIng.toLowerCase());
          const nomFinal = foundIng ? foundIng.ingredient : nomIng;
          const inciFinal = foundIng ? (foundIng.inci || '') : '';
          const typeFinal = foundIng ? foundIng.type : importDevinerType(nomIng);
          ingredients.push({ type: typeFinal, nom: nomFinal, quantite_g: 0, cout: 0, inci: inciFinal });
        }
      }
    }
  }

  return {
    action: 'saveRecette',
    recette_id: String(id),
    nom, collection, ligne: ligne.toUpperCase(), statut,
    nb_unites: parseInt(nb_unites) || 1,
    cure: parseInt(cure) || 0,
    surgras, couleur_hex, image_url, image_url_noel,
    desc_emballage: desc_courte,
    description: desc_longue,
    notes, rang,
    format: '', prix_vente: 0, instructions: '', collections_secondaires,
    ingredients
  };
}

function importAnnuler() {
  document.getElementById('import-apercu-zone').classList.add('cache');
  document.getElementById('imp-ingredients').innerHTML = '';
}


/* ════════════════════════════════
   IMPORT FACTURE PDF
════════════════════════════════ */

let ifItems = [];
let ifMapping = [];

async function ifChargerMapping() {
  if (ifMapping.length) return;
  const res = await appelAPI('getMappingFournisseurs');
  ifMapping = (res && res.mapping) ? res.mapping : [];
}

async function importerFacturePDF() {
  const fichier = document.getElementById('if-fichier').files[0];
  const fournisseur = document.getElementById('if-fournisseur').value;
  if (!fichier) { afficherMsg('import-facture', 'Choisis un fichier PDF.', 'erreur'); return; }

  afficherMsg('import-facture', 'Lecture du PDF…');

  const texte = await lirePDF(fichier);
  if (!texte) { afficherMsg('import-facture', 'Impossible de lire le PDF.', 'erreur'); return; }

  const facture = parserFacturePA(texte);
  if (!facture.items.length) { afficherMsg('import-facture', 'Aucun item trouvé dans le PDF.', 'erreur'); return; }

  if (!ifMapping.length) {
    const res = await appelAPI('getMappingFournisseurs');
    ifMapping = (res && res.mapping) ? res.mapping : [];
  }

  ifItems = facture.items;
  document.getElementById('if-numero').value   = facture.numeroFacture;
  document.getElementById('if-date').value     = facture.date;
  document.getElementById('if-tps').value      = facture.tps;
  document.getElementById('if-tvq').value      = facture.tvq;
  document.getElementById('if-livraison').value = facture.livraison;
  document.getElementById('if-soustotal').value = facture.sousTotal;
  document.getElementById('if-total').value     = facture.total || (facture.sousTotal + facture.tps + facture.tvq + facture.livraison).toFixed(2);

  afficherApercuItems(fournisseur);
  validerTotaux(facture);

  document.getElementById('if-apercu').classList.remove('cache');
  document.getElementById('if-bloc-upload').classList.add('cache');
  afficherMsg('import-facture', '');
}

async function lirePDF(fichier) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = async () => {
      try {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buffer = await fichier.arrayBuffer();
        const pdf    = await pdfjsLib.getDocument({ data: buffer }).promise;
        let texte    = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          texte += content.items.map(s => s.str).join(' ') + '\n';
        }
        resolve(texte);
      } catch(e) { resolve(null); }
    };
    script.onerror = () => resolve(null);
    if (!document.querySelector('script[src*="pdf.min.js"]')) {
      document.head.appendChild(script);
    } else {
      script.onload();
    }
  });
}
function parserFacturePA(texte) {
  const facture = { numeroFacture: '', date: '', items: [], tps: 0, tvq: 0, livraison: 0, sousTotal: 0, total: 0 };

  const mNum = texte.match(/Détails de la commande[\s\S]{0,20}?(\d{4,6})/i);
  if (mNum) facture.numeroFacture = mNum[1].trim();

  const mDate = texte.match(/(\d{2}-\d{2}-\d{4})/);
  if (mDate) {
    const p = mDate[1].split('-');
    facture.date = `${p[2]}-${p[1]}-${p[0]}`;
  }

  const mTps = texte.match(/TPS\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mTps) facture.tps = parseFloat(mTps[1].replace(/\s/g,'').replace(',','.'));

  const mTvq = texte.match(/TVQ\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mTvq) facture.tvq = parseFloat(mTvq[1].replace(/\s/g,'').replace(',','.'));

  const mSous = texte.match(/Sous-total\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mSous) facture.sousTotal = parseFloat(mSous[1].replace(/\s/g,'').replace(',','.'));

  const mTotal = texte.match(/Total de la commande\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mTotal) facture.total = parseFloat(mTotal[1].replace(/\s/g,'').replace(',','.'));

  const mLiv = texte.match(/Livraison\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mLiv && !/gratuite/i.test(mLiv[0])) facture.livraison = parseFloat(mLiv[1].replace(/\s/g,'').replace(',','.'));

  const ligneItem = /([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\/&\(\)\-\']+)\s*\((\d+)\)\s*([\d]+(?:ml|g|L|kg|oz)[^\n]*?)?\s*([\d,\.\s]+)\s*\$\s*CAD/gi;
  let m;
  while ((m = ligneItem.exec(texte)) !== null) {
    const desc = m[1].trim();
    const qte  = parseInt(m[2]);
    const fmt  = (m[3] || '').trim();
    const prix = parseFloat(m[4].replace(/\s/g,'').replace(',', '.'));
    if (!desc || isNaN(prix) || prix <= 0) continue;

    const fmtMatch = fmt.match(/^([\d\.]+)\s*(ml|g|L|kg)/i)
                  || desc.match(/([\d\.]+)\s*(ml|g|L|kg)/i);
    facture.items.push({
      description:  desc,
      formatQte:    fmtMatch ? parseFloat(fmtMatch[1]) : 0,
      formatUnite:  fmtMatch ? fmtMatch[2].toLowerCase() : 'unité',
      prixUnitaire: prix,
      quantite:     qte
    });
  }

  return facture;
}

function normaliserPourMapping(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function trouverMappingItem(description, fournisseur) {
  const desc = normaliserPourMapping(description);
  for (const m of ifMapping) {
    if (m.fournisseur !== fournisseur) continue;
    if (normaliserPourMapping(m.nomFournisseur) === desc) return m;
  }
  for (const m of ifMapping) {
    if (m.fournisseur !== fournisseur) continue;
    const mf = normaliserPourMapping(m.nomFournisseur);
    if (desc.includes(mf) || mf.includes(desc)) return m;
  }
  return null;
}

function afficherApercuItems(fournisseur) {
  const tbody = document.getElementById('if-tbody');
  tbody.innerHTML = '';

  ifItems.forEach((item, idx) => {
    const mapping = trouverMappingItem(item.description, fournisseur);
    const nomUC   = mapping ? mapping.nomUC : '';
    const typeUC  = nomUC ? ((listesDropdown.fullData || []).find(d => d.ingredient === nomUC)?.type || '') : '';
    const total   = (item.prixUnitaire * item.quantite).toFixed(2);
    const rouge   = !nomUC;

    const ingredientsFiltres = typeUC
      ? (listesDropdown.fullData || []).filter(d => d.type === typeUC).sort((a,b) => a.ingredient.localeCompare(b.ingredient,'fr'))
      : [];

    const tr = document.createElement('tr');
    tr.className = rouge ? 'ligne-rouge' : '';
    tr.innerHTML = `
      <td>${item.description}</td>
      <td>${item.formatQte} ${item.formatUnite}</td>
      <td>${item.quantite}</td>
      <td>${item.prixUnitaire.toFixed(2)} $</td>
      <td>${total} $</td>
      <td>
        <select class="form-ctrl" id="if-type-${idx}" onchange="ifFiltrerNoms(${idx})">
          <option value="">— Catégorie —</option>
          ${(listesDropdown.types || []).map(t => `<option value="${t}" ${t === typeUC ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </td>
      <td>
        <div style="display:flex;gap:4px;align-items:center;">
          <select class="form-ctrl" id="if-nomuc-${idx}">
            <option value="">— Choisir —</option>
            ${ingredientsFiltres.map(d => `<option value="${d.ingredient}" ${d.ingredient === nomUC ? 'selected' : ''}>${d.ingredient}</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-outline" onclick="ifAjouterNomUC(${idx})" title="Ajouter un nouveau nom UC">+</button>
        </div>
        <div id="if-nouveau-uc-${idx}" class="cache" style="margin-top:6px;display:flex;flex-direction:column;gap:6px;">
          <input type="text" class="form-ctrl" id="if-nouveau-nom-${idx}" placeholder="Nom UC">
          <select class="form-ctrl" id="if-nouveau-cat-${idx}">
            <option value="">— Catégorie —</option>
            ${(listesDropdown.types || []).map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-sm btn-primary" onclick="ifConfirmerNomUC(${idx})">Ajouter</button>
            <button class="btn btn-sm btn-outline" onclick="document.getElementById('if-nouveau-uc-${idx}').classList.add('cache')">Annuler</button>
          </div>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}



function ifFiltrerNoms(idx) {
  const type   = document.getElementById(`if-type-${idx}`)?.value || '';
  const select = document.getElementById(`if-nomuc-${idx}`);
  if (!select) return;
  const filtres = type
    ? (listesDropdown.fullData || []).filter(d => d.type === type).sort((a,b) => a.ingredient.localeCompare(b.ingredient,'fr'))
    : [];
  select.innerHTML = '<option value="">— Choisir —</option>' +
    filtres.map(d => `<option value="${d.ingredient}">${d.ingredient}</option>`).join('');
}

function ifAjouterNomUC(idx) {
  document.getElementById(`if-nouveau-uc-${idx}`).classList.remove('cache');
  document.getElementById(`if-nouveau-nom-${idx}`).focus();
}

async function ifConfirmerNomUC(idx) {
  const nom = document.getElementById(`if-nouveau-nom-${idx}`)?.value.trim();
  const cat = document.getElementById(`if-nouveau-cat-${idx}`)?.value;
  if (!nom || !cat) { afficherMsg('import-facture', 'Nom et catégorie requis.', 'erreur'); return; }

  const res = await appelAPIPost('ajouterIngredientUC', { ingredient: nom, categorie: cat });
  if (!res || !res.success) { afficherMsg('import-facture', res?.message || 'Erreur.', 'erreur'); return; }

  const resDrop = await appelAPI('getDropdownLists');
  if (resDrop) {
    listesDropdown.types    = resDrop.types    || [];
    listesDropdown.fullData = resDrop.fullData || [];
    listesDropdown.config   = resDrop.config   || {};
  }

  const select = document.getElementById(`if-nomuc-${idx}`);
  if (select) {
    const opt = document.createElement('option');
    opt.value = nom; opt.textContent = nom; opt.selected = true;
    select.appendChild(opt);
  }
  const selType = document.getElementById(`if-type-${idx}`);
  if (selType) selType.value = cat;

  document.getElementById(`if-nouveau-uc-${idx}`).classList.add('cache');
  afficherMsg('import-facture', `✅ "${nom}" ajouté.`);
}

function ifMajType(idx) {
  const nomUC = document.getElementById(`if-nomuc-${idx}`)?.value;
  const found = (listesDropdown.fullData || []).find(d => d.ingredient === nomUC);
  if (found) {
    const sel = document.getElementById(`if-type-${idx}`);
    if (sel) sel.value = found.type;
  }
}

function validerTotaux(facture) {
  const sommItems = ifItems.reduce((acc, i) => acc + i.prixUnitaire * i.quantite, 0);
  const diff = Math.abs(sommItems - facture.sousTotal);
  const zone = document.getElementById('if-validation');
  if (diff < 0.02) {
    zone.innerHTML = '<div class="msg msg-succes">✅ Totaux validés — somme des items = sous-total</div>';
  } else {
    zone.innerHTML = `<div class="msg msg-erreur">⚠ Écart de ${diff.toFixed(2)} $ entre les items (${sommItems.toFixed(2)} $) et le sous-total (${facture.sousTotal.toFixed(2)} $)</div>`;
  }
}

async function confirmerImportFacture() {
  const numero     = document.getElementById('if-numero').value.trim();
  const date       = document.getElementById('if-date').value.trim();
  const fournisseur = document.getElementById('if-fournisseur').value;
  const tps        = parseFloat(document.getElementById('if-tps').value) || 0;
  const tvq        = parseFloat(document.getElementById('if-tvq').value) || 0;
  const livraison  = parseFloat(document.getElementById('if-livraison').value) || 0;
  const sousTotal  = parseFloat(document.getElementById('if-soustotal').value) || 0;

  if (!numero) { afficherMsg('import-facture', 'Numéro de facture requis.', 'erreur'); return; }

  const btn = document.getElementById('if-btn-confirmer');
  btn.disabled = true;

  const resFacture = await appelAPIPost('createInvoice', { numeroFacture: numero, date, fournisseur });
  if (!resFacture || !resFacture.success) {
    afficherMsg('import-facture', resFacture?.message || 'Erreur création facture.', 'erreur');
    btn.disabled = false;
    return;
  }

  const nomFournisseurLabel = { PA: 'Pure Arôme', MH: 'Les Mauvaises Herbes', Arbressence: 'Arbressence', DE: 'Divine Essence' }[fournisseur] || fournisseur;

  for (let idx = 0; idx < ifItems.length; idx++) {
    const item   = ifItems[idx];
    const nomUC  = document.getElementById(`if-nomuc-${idx}`)?.value || '';
    const typeUC = document.getElementById(`if-type-${idx}`)?.value  || '';
    if (!nomUC || !typeUC) continue;

    const config    = listesDropdown.config[typeUC] || {};
    const densite   = config.densite || 1;
    let grammes     = item.formatQte;
    if (item.formatUnite === 'l')  grammes = item.formatQte * 1000;
    if (item.formatUnite === 'kg') grammes = item.formatQte * 1000;
    if (item.formatUnite === 'ml') grammes = item.formatQte * densite;
    const prixParG  = grammes > 0 ? (item.prixUnitaire / grammes) : 0;

    await appelAPIPost('addProduct', {
      numFacture:  numero,
      date,
      fournisseur: nomFournisseurLabel,
      type:        typeUC,
      ingredient:  nomUC,
      formatQte:   item.formatQte,
      formatUnite: item.formatUnite,
      prixUnitaire: item.prixUnitaire,
      prixParG:    prixParG.toFixed(6),
      quantite:    item.quantite
    });
  }

  await appelAPIPost('finalizeInvoice', { numeroFacture: numero, tps, tvq, livraison, sousTotal });

afficherMsg('import-facture', `✅ Facture ${numero} importée avec succès.`);
  document.getElementById('if-apercu').classList.add('cache');
  btn.disabled = false;
}

// ========================================
// FABRICATION
// ========================================

async function chargerFabrication() {
  document.getElementById('loading-fabrication').classList.remove('cache');
  document.getElementById('contenu-fabrication').innerHTML = '';
  const res = await appelAPI('getProductions');
  document.getElementById('loading-fabrication').classList.add('cache');
  if (!res || !res.success) {
    afficherMsg('fabrication', '❌ Erreur de chargement.');
    return;
  }
  afficherTableauFabrication(res.lots || []);
}

function fabToggleAccordeon(el) {
  const body = el.nextElementSibling;
  body.classList.toggle('cache');
}

function afficherTableauFabrication(lots) {
 const enCure      = lots.filter(l => l.statut === 'en_cure');
  const disponibles = lots.filter(l => l.statut === 'disponible');
  const epuises     = lots.filter(l => l.statut === 'epuise');

  const totalEnCure      = enCure.reduce((s, l) => s + l.nb_unites, 0);
  const totalDisponibles = disponibles.reduce((s, l) => s + (l.unites_restantes ?? l.nb_unites), 0);
  const totalEpuises     = epuises.reduce((s, l) => s + l.nb_unites, 0);

  function grouperParCollectionLigne(liste) {
    const groupes = {};
    liste.forEach(l => {
      const col   = l.collection || 'Sans collection';
      const ligne = l.ligne      || 'Sans ligne';
      const cle   = col + '||' + ligne;
      if (!groupes[cle]) groupes[cle] = { collection: col, ligne, lots: [] };
      groupes[cle].lots.push(l);
    });
    return Object.values(groupes).sort((a, b) => a.collection.localeCompare(b.collection) || a.ligne.localeCompare(b.ligne));
  }

  function rendreBlocStatut(titre, total, liste, colonnes, rendreLigne) {
    let h = `<div class="carte-admin">
      <div class="carte-admin-entete">${titre} <span class="texte-secondaire">${total} savon${total !== 1 ? 's' : ''}</span></div>`;
    if (liste.length === 0) {
      h += `<div class="texte-secondaire" style="padding:12px 0">Aucun lot</div>`;
    } else {
      const groupes = grouperParCollectionLigne(liste);
      groupes.forEach(g => {
        const totalGroupe = g.lots.reduce((s, l) => s + (l.unites_restantes ?? l.nb_unites), 0);
        h += `<div class="form-panel visible" style="margin:8px 0">
          <div class="form-panel-header" onclick="fabToggleAccordeon(this)" style="cursor:pointer">
            <div class="form-panel-titre">${g.collection} — ${g.ligne}</div>
            <span class="texte-secondaire">${totalGroupe} savon${totalGroupe !== 1 ? 's' : ''}</span>
          </div>
          <div class="form-body">
            <table class="table-admin"><thead><tr>${colonnes.map(c => `<th>${c}</th>`).join('')}</tr></thead>
            <tbody>${g.lots.map(rendreLigne).join('')}</tbody></table>
          </div>
        </div>`;
      });
    }
    h += `</div>`;
    return h;
  }

  let html = '';

  html += rendreBlocStatut('EN CURE', totalEnCure, enCure,
    ['Recette', 'Fabriqué le', 'Disponible le', 'Unités'],
    l => `<tr>
      <td>${l.recette_nom}</td>
      <td>${l.date_fabrication}</td>
      <td>${l.date_disponibilite}</td>
      <td>${l.nb_unites}</td>
    </tr>`
  );

  html += rendreBlocStatut('DISPONIBLE', totalDisponibles, disponibles,
    ['Recette', 'Disponible le', 'Unités produites', 'Unités restantes', 'Coût/unité'],
    l => `<tr>
      <td>${l.recette_nom}</td>
      <td>${l.date_disponibilite}</td>
      <td>${l.nb_unites}</td>
      <td>${l.unites_restantes ?? l.nb_unites}</td>
      <td>${l.cout_par_unite ? parseFloat(l.cout_par_unite).toFixed(2) + ' $' : '—'}</td>
    </tr>`
  );

  html += rendreBlocStatut('ÉPUISÉ', totalEpuises, epuises,
    ['Recette', 'Fabriqué le', 'Unités', 'Coût/unité'],
    l => `<tr>
      <td>${l.recette_nom}</td>
      <td>${l.date_fabrication}</td>
      <td>${l.nb_unites}</td>
      <td>${l.cout_par_unite ? parseFloat(l.cout_par_unite).toFixed(2) + ' $' : '—'}</td>
    </tr>`
  );

  document.getElementById('contenu-fabrication').innerHTML = html;
}



function ouvrirFormFabrication(existant) {
  const selectCol = document.getElementById('fab-collection');
  selectCol.innerHTML = '<option value="">— Choisir une collection —</option>';
  const colMap = {};
  (donneesRecettes || []).forEach(r => {
    if (r.collection && !colMap[r.collection]) colMap[r.collection] = r.rang || 999;
  });
  const collections = Object.keys(colMap).sort((a, b) => colMap[a] - colMap[b]);
  collections.forEach(c => {
	  
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    selectCol.appendChild(opt);
  });
  document.getElementById('fab-recette').innerHTML = '<option value="">— Choisir une recette —</option>';
  const recettes = (donneesRecettes || []).filter(r => r.statut !== 'archive');
  recettes.sort((a, b) => a.nom.localeCompare(b.nom));
  const selectRec = document.getElementById('fab-recette');
  recettes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.recette_id;
    opt.textContent = r.nom;
    opt.dataset.nbUnites = r.nb_unites || 1;
    opt.dataset.cure     = r.cure || 0;
    opt.dataset.ingredients = JSON.stringify(r.ingredients || []);
    selectRec.appendChild(opt);
  });
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fab-date').value = existant ? '' : today;
  document.querySelector('#form-fabrication .form-panel-titre').textContent = existant ? 'Entrer un lot existant' : 'Nouveau lot';
  document.getElementById('fab-groupe-multiplicateur').classList.toggle('cache', !!existant);
  document.getElementById('fab-groupe-nb-unites').classList.toggle('cache', !existant);
  document.getElementById('form-fabrication').dataset.mode = existant ? 'existant' : 'nouveau';
  document.getElementById('fab-apercu').classList.add('cache');
document.getElementById('contenu-fabrication').classList.add('cache');
document.getElementById('form-fabrication').classList.add('visible');
}

function fabFiltrerFormats() {
  const select   = document.getElementById('fab-recette');
  const opt      = select.options[select.selectedIndex];
  const formatSel = document.getElementById('fab-format');
  formatSel.innerHTML = '<option value="">— Choisir un format —</option>';
  document.getElementById('fab-apercu').classList.add('cache');
  if (!opt || !opt.value) return;
  const recette = (donneesRecettes || []).find(r => r.recette_id === opt.value);
  if (!recette || !recette.formats_complets || recette.formats_complets.length === 0) return;
  recette.formats_complets.forEach(f => {
    const o = document.createElement('option');
    o.value = JSON.stringify(f);
    o.textContent = `${f.poids} ${f.unite} — ${f.prix_vente ? f.prix_vente.toFixed(2) + ' $' : 'sans prix'}`;
    formatSel.appendChild(o);
  });
  calculerApercuLot();
}

function fabFiltrerRecettes() { 
  const col    = document.getElementById('fab-collection').value;
  const select = document.getElementById('fab-recette');
  select.innerHTML = '<option value="">— Choisir une recette —</option>';
  const recettes = (donneesRecettes || [])
    .filter(r => r.statut !== 'archive' && (!col || r.collection === col))
    .sort((a, b) => a.nom.localeCompare(b.nom));
  recettes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.recette_id;
    opt.textContent = r.nom;
    opt.dataset.nbUnites    = r.nb_unites || 1;
    opt.dataset.cure        = r.cure || 0;
    opt.dataset.ingredients = JSON.stringify(r.ingredients || []);
    select.appendChild(opt);
  });
  document.getElementById('fab-apercu').classList.add('cache');
}

function fermerFormFabrication() {
  document.getElementById('form-fabrication').classList.remove('visible');
  document.getElementById('contenu-fabrication').classList.remove('cache');
  document.getElementById('fab-collection').value = '';
  document.getElementById('fab-recette').innerHTML = '<option value="">— Choisir une recette —</option>';
  document.getElementById('fab-multiplicateur').value = '1';
  document.getElementById('fab-nb-unites').value = '';
  document.getElementById('fab-apercu').classList.add('cache');
  afficherMsg('fabrication', '');
}

function calculerApercuLot() {
  const select = document.getElementById('fab-recette');
  const opt    = select.options[select.selectedIndex];
  if (!opt || !opt.value) {
    document.getElementById('fab-apercu').classList.add('cache');
    return;
  }
  const mode     = document.getElementById('form-fabrication').dataset.mode;
  const multi    = parseInt(document.getElementById('fab-multiplicateur').value) || 1;
  const nbUnites = mode === 'existant'
    ? parseInt(document.getElementById('fab-nb-unites').value) || 0
    : (parseInt(opt.dataset.nbUnites) || 1) * multi;
  const cure     = parseInt(opt.dataset.cure) || 0;
  const dateFab  = document.getElementById('fab-date').value;

  let dateDispo = '—';
  if (dateFab) {
    const d = new Date(dateFab);
    d.setDate(d.getDate() + cure);
    dateDispo = d.toISOString().split('T')[0];
  }

  const ingredients = JSON.parse(opt.dataset.ingredients || '[]');
  let coutTotal = 0;
  if (listesDropdown && listesDropdown.fullData) {
    ingredients.forEach(ing => {
      const found = listesDropdown.fullData.find(f => f.ingredient === ing.nom);
      const prixParG = found ? (found.prixParG || 0) : 0;
      coutTotal += (ing.quantite_g || 0) * multi * prixParG;
    });
  }

  document.getElementById('fab-apercu-unites').textContent = nbUnites + ' unité(s)';
  document.getElementById('fab-apercu-dispo').textContent  = dateDispo;
  document.getElementById('fab-apercu-cout').textContent   = coutTotal > 0 ? coutTotal.toFixed(2) + ' $' : '—';
  document.getElementById('fab-apercu').classList.remove('cache');
}

async function sauvegarderLot() {
  const select = document.getElementById('fab-recette');
  const opt    = select.options[select.selectedIndex];
  if (!opt || !opt.value) { afficherMsg('fabrication', '❌ Choisir une recette.'); return; }

  const mode     = document.getElementById('form-fabrication').dataset.mode;
  const multi    = parseInt(document.getElementById('fab-multiplicateur').value) || 1;
  const nbUnites = mode === 'existant'
    ? parseInt(document.getElementById('fab-nb-unites').value) || 0
    : (parseInt(opt.dataset.nbUnites) || 1) * multi;
  const cure     = parseInt(opt.dataset.cure) || 0;
  const dateFab  = document.getElementById('fab-date').value;
  if (!dateFab) { afficherMsg('fabrication', '❌ Date de fabrication requise.'); return; }

  const d = new Date(dateFab);
  d.setDate(d.getDate() + cure);
  const dateDispo = d.toISOString().split('T')[0];

  const ingredients = JSON.parse(opt.dataset.ingredients || '[]');
  let coutIngredients = 0;
  if (listesDropdown && listesDropdown.fullData) {
    ingredients.forEach(ing => {
      const found = listesDropdown.fullData.find(f => f.ingredient === ing.nom);
      const prixParG = found ? (found.prixParG || 0) : 0;
      coutIngredients += (ing.quantite_g || 0) * multi * prixParG;
    });
  }

  const lotId = 'LOT-' + Date.now();
  const recette = (donneesRecettes || []).find(r => r.recette_id === opt.value);
  const res = await appelAPIPost('saveProduction', {
    lot_id:             lotId,
    recette_id:         opt.value,
    recette_nom:        opt.textContent,
    multiplicateur:     multi,
    nb_unites:          nbUnites,
    date_fabrication:   dateFab,
    date_disponibilite: dateDispo,
    cout_ingredients:   coutIngredients.toFixed(2),
    cout_emballages:    0,
    cout_revient_total: coutIngredients.toFixed(2),
    cout_par_unite:     nbUnites > 0 ? (coutIngredients / nbUnites).toFixed(2) : 0,
    collection:         recette ? recette.collection : '',
    ligne:              recette ? recette.ligne : ''
  });

  if (res && res.success) {
    fermerFormFabrication();
    chargerFabrication();
  } else {
    afficherMsg('fabrication', '❌ ' + (res?.message || 'Erreur.'));
  }
}

function fabFiltrerFormats() {
  const select    = document.getElementById('fab-recette');
  const opt       = select.options[select.selectedIndex];
  const formatSel = document.getElementById('fab-format');
  formatSel.innerHTML = '<option value="">— Choisir un format —</option>';
  document.getElementById('fab-apercu').classList.add('cache');
  if (!opt || !opt.value) return;
  const recette = (donneesRecettes || []).find(r => r.recette_id === opt.value);
  if (!recette || !recette.formats_complets || recette.formats_complets.length === 0) return;
  recette.formats_complets.forEach(f => {
    const o = document.createElement('option');
    o.value = JSON.stringify(f);
    o.textContent = `${f.poids} ${f.unite} — ${f.prix_vente ? f.prix_vente.toFixed(2) + ' $' : 'sans prix'}`;
    formatSel.appendChild(o);
  });
  calculerApercuLot();
}
/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin.js
   V2 — Passe 1 — 6 avril 2026
   ═══════════════════════════════════════ */

// ─── INITIALISATION ───

var adminScrollObserver = null;

function initScrollAnimationsAdmin() {
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

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.section) {
    afficherSection(e.state.section, null);
  } else {
    history.pushState({ section: 'accueil' }, '', '#accueil');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const session = sessionStorage.getItem('uc_admin');
  if (session !== 'true') {
    window.location.href = '/UC2/admin/login.html';
    return;
  }
  document.getElementById('ecran-connexion')?.classList.add('cache');
 
  initBurgerAdmin();
  initScrollAnimationsAdmin();
  await chargerDonneesInitiales();
});

// V2 : getCollections + getGammes + getProduits + getIngredientsInci + getConfig
async function chargerDonneesInitiales() {
const [resCol, resGam, resFam, resPro, resInci, resCfg, resCats, resFmt] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getGammes'),
    appelAPI('getFamilles'),
    appelAPI('getProduits'),
    appelAPI('getIngredientsInci'),
    appelAPI('getConfig'),
    appelAPI('getCategoriesUC'),
    appelAPI('getProduitsFormats')
  ]);

  if (resCol && resCol.success) {
    donneesCollections = resCol.items || [];
  }
if (resGam && resGam.success) {
    donneesGammes = resGam.items || [];
  }
  if (resFam && resFam.success) {
    donneesFamilles = resFam.items || [];
  }
 const formatsMap = {};
  if (resFmt && resFmt.success) {
    (resFmt.items || []).forEach(f => {
      if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
      formatsMap[f.pro_id].push({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente });
    });
  }
  if (resPro && resPro.success) {
    donneesProduits = (resPro.items || []).sort((a, b) => {
      const colA = donneesCollections.find(c => c.col_id === a.col_id);
      const colB = donneesCollections.find(c => c.col_id === b.col_id);
         const gamA = donneesGammes.find(g => g.gam_id === a.gam_id);
    const gamB = donneesGammes.find(g => g.gam_id === b.gam_id);
    return ((colA?.rang || 99) - (colB?.rang || 99)) ||
           ((gamA?.rang || 99) - (gamB?.rang || 99)) ||
           (a.nom || '').localeCompare(b.nom || '');
   });
    donneesProduits = donneesProduits.map(p => ({ ...p, formats: formatsMap[p.pro_id] || [] }));
  }
  if (resInci && resInci.success && resInci.items && resInci.items.length > 0) {
    listesDropdown.fullData = resInci.items || [];
    listesDropdown.types    = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean);
  }
  if (resCats && resCats.success) {
    listesDropdown.categoriesMap = {};
    (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
  }
  if (resCfg && resCfg.success) {
    listesDropdown.config = {};
    (resCfg.items || []).forEach(c => {
      listesDropdown.config[c.cat_id] = { densite: c.densite, unite: c.unite, margePertePct: c.marge_perte_pct };
    });
  }

  const nbPublics = donneesProduits.filter(p => p.statut === 'public').length;
  const statCol   = document.getElementById('admin-stat-collections');
  const statProd  = document.getElementById('admin-stat-produits');
	if (statCol)  statCol.textContent  = donneesCollections.length;
	if (statProd && nbPublics > 0) statProd.textContent = nbPublics + '+';
}

// ─── NAVIGATION SIDEBAR ───
function toggleDropdownAdmin(el) {
  const item = el.closest('.nav-admin-item');
  const estOuvert = item.classList.contains('ouvert');
  document.querySelectorAll('.nav-admin-item.ouvert').forEach(i => i.classList.remove('ouvert'));
  if (!estOuvert) item.classList.add('ouvert');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-admin-item')) {
    document.querySelectorAll('.nav-admin-item.ouvert').forEach(i => i.classList.remove('ouvert'));
  }
});

function appliquerCouleursHex() {
  document.querySelectorAll('input.form-ctrl').forEach(input => {
    const val = (input.value || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      input.style.background = val;
      const r = parseInt(val.slice(1,3),16), g = parseInt(val.slice(3,5),16), b = parseInt(val.slice(5,7),16);
      const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
      input.style.color = luminance > 0.5 ? '#333' : '#fff';
    } else {
      input.style.background = '';
      input.style.color = '';
    }
  });
}

function afficherSection(id, bouton) {
  setTimeout(appliquerCouleursHex, 300);
  history.pushState({ section: id }, '', '#' + id);
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
  if (id === 'catalogue-builder') cbOnAfficher();
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  const contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTop = 0;

  if (id === 'accueil')        afficherStatsAccueil();
  
  if (id === 'collections')    afficherCollections();
  if (id === 'gammes')         afficherGammes();
if (id === 'familles')       afficherFamilles();
  if (id === 'produits')       { reinitialiserFiltresRecettes(); afficherProduits(); }
  if (id === 'inci')           { const r = document.getElementById('inci-recherche'); if (r) r.value = ''; chargerInci(); }
  if (id === 'densites')       chargerDensites();
  if (id === 'inventaire')     { const r = document.getElementById('inv-recherche'); if (r) r.value = ''; chargerInventaire(); }
  if (id === 'factures')       { reinitialiserFiltres(); chargerFactures(); }
  if (id === 'contenu-site')   chargerContenuSite();
  if (id === 'mediatheque')    chargerMediatheque();
  if (id === 'inventaire-production') { afficherSection('inventaire', null); return; }
  if (id === 'fabrication') {
    if (!donneesProduits || donneesProduits.length === 0) {
      Promise.all([appelAPI('getProduits'), appelAPI('getProduitsFormats')]).then(([resPro, resFmt]) => {
        const formatsMap = {};
        if (resFmt && resFmt.success) {
          (resFmt.items || []).forEach(f => {
            if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
            formatsMap[f.pro_id].push({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente });
          });
        }
        if (resPro && resPro.items) donneesProduits = resPro.items.map(p => ({ ...p, formats: formatsMap[p.pro_id] || [] }));
        chargerFabrication();
      });
    } else {
      chargerFabrication();
    }
  }

  const cible = document.getElementById('section-' + id);
  if (cible) reobserverFadeIn(cible);
  
  if (id === 'entrer-facture') efInit();
}

// ─── STATS ACCUEIL ───
async function validerConnexionAdmin() {
  const mdp = document.getElementById('input-mdp-admin')?.value;
  const res = await appelAPIPost('validerMotDePasse', { mdp });
  if (res && res.success) {
    sessionStorage.setItem('uc_admin', 'true');
    window.location.reload();
  } else {
    const err = document.getElementById('erreur-mdp-admin');
    if (err) err.textContent = 'Mot de passe incorrect.';
  }
}

function afficherStatsAccueil() {
  const nbPublics = donneesProduits.filter(p => p.statut === 'public').length;
  const statCol   = document.getElementById('admin-stat-collections');
  const statProd  = document.getElementById('admin-stat-produits');
  if (statCol)  statCol.textContent  = donneesCollections.length;
  if (statProd && nbPublics > 0) statProd.textContent = nbPublics + '+';
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
  if (!texte) return;
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
  return luminance > 0.5 ? 'carte-infos-fonce' : 'carte-infos-clair';
}

function stringToColor(str) {
  const palette = ['#5a8a3a','#4a7c9e','#9b6b9b','#c4773a','#3a8a7a','#8a5a3a','#6b7a3a','#9b3a5a','#3a5a8a'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

/* ════════════════════════════════
   COLLECTIONS V2
════════════════════════════════ */
var donneesCollections = []; // [{col_id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url}]
var donneesGammes      = []; // [{gam_id, col_id, rang, nom, description, couleur_hex, photo_url, photo_noel_url}]
var filtreGammesColId  = '';

/* ════════════════════════════════
   FAMILLES V2
════════════════════════════════ */
var donneesFamilles = [];


async function chargerFamilles() {
  const [resCol, resFam] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getFamilles')
  ]);
  if (!resCol || !resCol.success) { afficherMsg('familles', 'Erreur lors du chargement.', 'erreur'); return; }
  donneesCollections = resCol.items || [];
  donneesFamilles    = (resFam && resFam.success) ? resFam.items || [] : [];
  afficherFamilles();
}

function afficherFamilles() {
  const loading = document.getElementById('loading-familles');
  const contenu = document.getElementById('contenu-familles');
  const vide    = document.getElementById('vide-familles');
  const btnNew  = document.getElementById('btn-nouvelle-famille');
  if (loading) loading.classList.add('cache');
  if (btnNew)  btnNew.classList.remove('cache');
  if (!contenu) return;
  contenu.innerHTML = '';
  if (vide) vide.classList.add('cache');
  if (!donneesFamilles.length) { if (vide) vide.classList.remove('cache'); return; }

  let html = '<div class="collections-grille">';
  donneesFamilles.forEach(fam => {
    const col     = donneesCollections.find(c => c.col_id === fam.col_id);
    const couleurs = couleurCollection(fam.nom, fam.couleur_hex);
    html += `
      <div class="collection-carte" onclick="ouvrirFicheFamille('${fam.fam_id}')">
        <div class="collection-carte-bg" style="background:linear-gradient(145deg,${couleurs[0]},${couleurs[1]});"></div>
        <div class="collection-carte-overlay"></div>
        <div class="collection-carte-lignes-haut"><span class="collection-carte-ligne-tag">${(col?.nom || '—').toUpperCase()}</span></div>
        <div class="collection-carte-contenu">
          <span class="collection-carte-nom">${(fam.nom || '').toUpperCase()}</span>
          <span class="collection-carte-slogan">${fam.description || ''}</span>
        </div>
      </div>`;
  });
  html += '</div>';
  contenu.innerHTML = html;
}

function ouvrirFicheFamille(fam_id) {
  const fam = donneesFamilles.find(f => f.fam_id === fam_id);
  if (!fam) return;
  const col = donneesCollections.find(c => c.col_id === fam.col_id);
  document.getElementById('fiche-famille-titre').textContent      = (fam.nom || '').toUpperCase();
  document.getElementById('fiche-famille-slogan').textContent     = fam.slogan || '';
  document.getElementById('fiche-famille-collection').textContent = col?.nom || '—';
  document.getElementById('fiche-famille-desc').textContent       = fam.description || '—';

  let wrapHtml = '';
  if (fam.photo_url)      wrapHtml += `<img src="${fam.photo_url}" class="fiche-visuel-photo">`;
  if (fam.photo_noel_url) wrapHtml += `<img src="${fam.photo_noel_url}" class="fiche-visuel-photo">`;
  if (fam.couleur_hex)    wrapHtml += `<div class="fiche-visuel-hex" style="background:${fam.couleur_hex}"></div>`;
  const ficheExtras = document.getElementById('fiche-famille-extras');
  if (ficheExtras) ficheExtras.innerHTML = wrapHtml ? `<div class="fiche-visuel">${wrapHtml}</div>` : '';

  document.getElementById('fiche-famille-modifier').onclick = () => {
    fermerFicheFamille();
    modifierFamille(fam_id);
  };
  document.getElementById('btn-supprimer-famille').onclick = () => supprimerFamille(fam_id);
  document.getElementById('contenu-familles').classList.add('cache');
  document.getElementById('btn-nouvelle-famille').classList.add('cache');
  document.getElementById('fiche-famille').classList.remove('cache');
  setTimeout(appliquerCouleursHex, 300);
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFicheFamille() {
  document.getElementById('fiche-famille').classList.add('cache');
  document.getElementById('contenu-familles').classList.remove('cache');
  const btnNew = document.getElementById('btn-nouvelle-famille');
  if (btnNew) btnNew.classList.remove('cache');
}

function peuplerPositionFamille(col_id, rangActuel) {
  const selPos = document.getElementById('ff-position');
  if (!selPos) return;
  selPos.innerHTML = '<option value="0">En premier</option>';
  if (!col_id) return;
  donneesFamilles.filter(f => f.col_id === col_id)
    .sort((a, b) => (a.rang || 99) - (b.rang || 99))
    .forEach(f => {
      const o = document.createElement('option');
      o.value = f.rang;
      o.textContent = 'Après ' + f.nom;
      if (rangActuel && f.rang === rangActuel - 1) o.selected = true;
      selPos.appendChild(o);
    });
}

function ouvrirFormFamille() {
  fermerFicheFamille();
  document.getElementById('form-familles-titre').textContent = 'Nouvelle famille';
  document.getElementById('ff-id').value          = '';
  document.getElementById('ff-rang').value        = '';
  document.getElementById('ff-nom').value         = '';
  document.getElementById('ff-desc').value        = '';
  (document.getElementById('ff-couleur-hex') || {}).value = '';
  const sel = document.getElementById('ff-collection');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    const o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
  sel.value = '';
  peuplerPositionFamille('', null);
  document.getElementById('contenu-familles').classList.add('cache');
  document.getElementById('btn-nouvelle-famille').classList.add('cache');
  document.getElementById('form-familles').classList.remove('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormFamille() {
  document.getElementById('form-familles').classList.add('cache');
  document.getElementById('contenu-familles').classList.remove('cache');
  const btnNew = document.getElementById('btn-nouvelle-famille');
  if (btnNew) btnNew.classList.remove('cache');
}

function modifierFamille(fam_id) {
  const fam = donneesFamilles.find(f => f.fam_id === fam_id);
  if (!fam) return;
  document.getElementById('form-familles-titre').textContent = 'Modifier la famille';
  document.getElementById('ff-nom').value         = fam.nom || '';
  document.getElementById('ff-id').value          = fam.fam_id;
  document.getElementById('ff-rang').value        = fam.rang || '';
    document.getElementById('ff-desc').value        = fam.description || '';
  if (document.getElementById('ff-couleur-hex')) (document.getElementById('ff-couleur-hex') || {}).value = fam.couleur_hex || '';
  const sel = document.getElementById('ff-collection');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    const o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
  sel.value = fam.col_id || '';
  peuplerPositionFamille(fam.col_id, fam.rang);
  document.getElementById('contenu-familles').classList.add('cache');
  document.getElementById('btn-nouvelle-famille').classList.add('cache');
  document.getElementById('form-familles').classList.remove('cache');
  window.scrollTo(0, 0);
}

async function sauvegarderFamille() {
  afficherChargement();
  const id     = document.getElementById('ff-id').value;
  const col_id = document.getElementById('ff-collection').value;
  const nom    = document.getElementById('ff-nom').value.trim().toUpperCase();
  if (!nom || !col_id) { afficherMsg('familles', 'Nom et collection requis.', 'erreur'); return; }
  const positionChoisie = parseInt(document.getElementById('ff-position')?.value) || 0;
  const d = {
    fam_id:      id || ('FAM-' + Date.now()),
    col_id,
    rang:        positionChoisie + 1,
    nom,
    description: document.getElementById('ff-desc').value,
    couleur_hex: '',
  };
  const res = await appelAPIPost('saveFamille', d);
  if (res && res.success) {
    cacherChargement();
    fermerFormFamille();
    afficherMsg('familles', id ? 'Famille mise à jour.' : 'Famille ajoutée.');
    await chargerFamilles();
  } else {
    cacherChargement();
    afficherMsg('familles', 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

async function supprimerFamille(fam_id) {
  const resPro = await appelAPI('getProduits');
  const tousLesProduits = (resPro && resPro.success) ? resPro.items : donneesProduits;
  const produitsLies = tousLesProduits.filter(p => p.fam_id === fam_id);
  if (produitsLies.length > 0) {
    afficherMsg('familles', `Impossible — ${produitsLies.length} produit(s) sont liés à cette famille.`, 'erreur');
    return;
  }
  confirmerAction('Supprimer cette famille ?', async () => {
    const res = await appelAPIPost('deleteFamille', { fam_id });
    if (res && res.success) {
      fermerFicheFamille();
      afficherMsg('familles', 'Famille supprimée.');
      await chargerFamilles();
    } else {
      afficherMsg('familles', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

async function chargerCollections() {
  const [resCol, resGam] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getGammes')
  ]);
  if (!resCol || !resCol.success) { afficherMsg('collections', 'Erreur lors du chargement.', 'erreur'); return; }
  donneesCollections = resCol.items || [];
  donneesGammes      = (resGam && resGam.success) ? resGam.items || [] : [];
  afficherCollections();
}

function afficherCollections() {
  const loading = document.getElementById('loading-collections');
  const contenu = document.getElementById('contenu-collections');
  const vide    = document.getElementById('vide-collections');
  const btnNew  = document.getElementById('btn-nouvelle-collection');
  if (!contenu) return;
  contenu.innerHTML = '';
  if (vide) vide.classList.add('cache');
  if (!donneesCollections.length) {
    if (loading) loading.classList.add('cache');
    if (btnNew)  btnNew.classList.remove('cache');
    if (vide) vide.classList.remove('cache');
    return;
  }
  if (loading) loading.classList.add('cache');
  if (btnNew)  btnNew.classList.remove('cache');

  let html = '<div class="collections-grille">';
  donneesCollections.forEach(col => {
    const couleurs = couleurCollection(col.nom, col.couleur_hex);
    // Gammes de cette collection
    html += `
      <div class="collection-carte" onclick="ouvrirFicheCollection('${col.col_id}')">
        <div class="collection-carte-bg" style="background:linear-gradient(145deg,${couleurs[0]},${couleurs[1]});"></div>
        <div class="collection-carte-overlay"></div>
        <div class="collection-carte-lignes-haut"></div>
        <div class="collection-carte-contenu">
          <span class="collection-carte-nom">${(col.nom || '').toUpperCase()}</span>
          <span class="collection-carte-slogan">${col.slogan || ''}</span>
        </div>
      </div>`;
  });
  html += '</div>';
  contenu.innerHTML = html;
}

function ouvrirFicheCollection(col_id) {
  const col = donneesCollections.find(c => c.col_id === col_id);
  if (!col) return;

  const couleurs   = couleurCollection(col.nom, col.couleur_hex);
  const gammes     = donneesGammes.filter(g => g.col_id === col_id);
const gammesHtml = gammes.map(gam => `
    <div class="fiche-ligne-item" onclick="fermerFicheCollection(); afficherSection('gammes', null); ouvrirFicheGamme2('${gam.gam_id}')">
      <div class="fiche-ligne-info">
        <span class="fiche-ligne-nom">${(gam.nom || '').toUpperCase()}</span>
        ${gam.description ? `<p class="fiche-ligne-desc">${gam.description}</p>` : ''}
      </div>
    </div>`).join('');

  const fiche = document.getElementById('fiche-collection');
  document.getElementById('fiche-collection-titre').textContent  = (col.nom || '').toUpperCase();
  document.getElementById('fiche-collection-bandeau').style.background = '';
  document.getElementById('fiche-collection-slogan').textContent = col.slogan || '';
  document.getElementById('fiche-collection-desc').textContent   = col.description || '';

  let wrapHtml = '';
  if (col.photo_url)       wrapHtml += `<img src="${col.photo_url}" class="fiche-visuel-photo">`;
  if (col.photo_noel_url)  wrapHtml += `<img src="${col.photo_noel_url}" class="fiche-visuel-photo">`;
  if (col.couleur_hex)     wrapHtml += `<div class="fiche-visuel-hex" style="background:${col.couleur_hex}"></div>`;
  const ficheExtras = document.getElementById('fiche-collection-extras');
  if (ficheExtras) ficheExtras.innerHTML = wrapHtml ? `<div class="fiche-visuel">${wrapHtml}</div>` : '';

  document.getElementById('fiche-collection-lignes').innerHTML = gammesHtml || '<p class="vide-desc">Aucune gamme</p>';

  document.getElementById('fiche-collection-modifier').onclick = () => {
    document.getElementById('fiche-collection').classList.remove('visible');
    modifierCollection(col_id);
  };
 
  document.getElementById('btn-supprimer-collection').onclick = () => supprimerCollection(col_id);

  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  fiche.classList.add('visible');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFicheCollection() {
  const fiche   = document.getElementById('fiche-collection');
  const contenu = document.getElementById('contenu-collections');
  const btnNew  = document.getElementById('btn-nouvelle-collection');
  if (fiche)   fiche.classList.remove('visible');
  if (contenu) contenu.classList.remove('cache');
  if (btnNew)  btnNew.classList.remove('cache');
}

function ouvrirFormCollection() {
  fermerFicheCollection();
  document.getElementById('form-collections-titre').textContent = 'Nouvelle collection';
  document.getElementById('fc-rowIndex').value = '';
  document.getElementById('fc-mode').value     = 'collection';
  document.getElementById('fc-bloc-collection').classList.remove('cache');
  document.getElementById('fc-bloc-ligne').classList.add('cache');
  const selPos = document.getElementById('fc-position');
  if (selPos) {
    selPos.innerHTML = '<option value="0">En premier</option>';
    donneesCollections.slice().sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
      const o = document.createElement('option');
      o.value = col.rang;
      o.textContent = 'Après ' + col.nom;
      selPos.appendChild(o);
    });
  }
  ['fc-rang','fc-collection','fc-slogan','fc-desc-col','fc-couleur-hex','fc-photo-url']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  ['fc-photo-preview','fc-photo-preview-noel'].forEach(id => {
    const e = document.getElementById(id); if (e) e.innerHTML = '';
  });
  ['fc-couleur-apercu'].forEach(id => {
    const e = document.getElementById(id); if (e) e.style.background = '';
  });
  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  document.getElementById('form-collections').classList.remove('cache');
  document.getElementById('form-collections').classList.add('visible');
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
  document.getElementById('form-collections').classList.remove('visible');
  document.getElementById('form-collections').classList.add('cache');
}

// ─── GAMMES (ex-Lignes) ───
async function ouvrirFicheGamme(gam_id) {
  const gam = donneesGammes.find(g => g.gam_id === gam_id);
  if (!gam) return;
  document.getElementById('fiche-ligne-titre').textContent      = (gam.nom || '').toUpperCase();
  document.getElementById('fiche-ligne-collection').textContent = donneesCollections.find(c => c.col_id === gam.col_id)?.nom || '';
  document.getElementById('fiche-ligne-desc').textContent       = gam.description || '—';
  document.getElementById('fiche-ligne-modifier').onclick = () => {
    fermerFicheGamme();
    modifierGamme(gam_id);
  };
  document.getElementById('btn-supprimer-ligne-fiche').onclick = () => supprimerGamme(gam_id);
  document.getElementById('fiche-ligne-ingredients').innerHTML  = '<span class="form-valeur">—</span>';
  document.getElementById('fiche-collection').classList.remove('visible');
  document.getElementById('fiche-ligne').classList.remove('cache');
  document.getElementById('contenu-collections').classList.add('cache');
  window.scrollTo(0, 0);
}

function fermerFicheLigne() { fermerFicheGamme(); }

function fermerFicheGamme() {
  document.getElementById('fiche-ligne').classList.add('cache');
  document.getElementById('fiche-collection').classList.add('visible');
  const btnNew = document.getElementById('btn-nouvelle-collection');
  if (btnNew) btnNew.classList.remove('cache');
}

function ouvrirFormGamme(col_id) {
  document.getElementById('form-collections-titre').textContent = 'Nouvelle gamme';
  document.getElementById('fc-rowIndex').value  = '';
  document.getElementById('fc-mode').value      = 'ligne';
  document.getElementById('fc-bloc-collection').classList.add('cache');
  document.getElementById('fc-bloc-ligne').classList.remove('cache');
  document.getElementById('fc-collection-ligne').value = col_id || '';
 ['fc-rang-ligne','fc-ligne','fc-desc-ligne','fc-couleur-hex-ligne','fc-photo-url-ligne'].forEach(id => {
    const e = document.getElementById(id); if (e) e.value = '';
  });
  document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  document.getElementById('form-collections').classList.remove('cache');
  document.getElementById('form-collections').classList.add('visible');
  window.scrollTo(0, 0);
}

async function modifierGamme(gam_id) {
  const gam = donneesGammes.find(g => g.gam_id === gam_id);
  if (!gam) return;
  document.getElementById('form-gammes-titre').textContent = 'Modifier la gamme';
   document.getElementById('fg-nom').value         = gam.nom || '';
   document.getElementById('fg-id').value          = gam.gam_id;
 
  document.getElementById('fg-desc').value        = gam.description || '';
  if (document.getElementById('fg-couleur-hex')) (document.getElementById('fg-couleur-hex') || {}).value = gam.couleur_hex || '';
  const sel = document.getElementById('fg-collection');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    const o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
  sel.value = gam.col_id || '';
  peuplerPositionGamme(gam.col_id, gam.rang);
  document.getElementById('contenu-gammes').classList.add('cache');
  document.getElementById('btn-nouvelle-gamme').classList.add('cache');
  document.getElementById('form-gammes').classList.remove('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

async function modifierCollection(col_id) {
  const col = donneesCollections.find(c => c.col_id === col_id);
  if (!col) return;
  document.getElementById('fc-mode').value             = 'collection';
  document.getElementById('form-collections-titre').textContent = 'Modifier la collection';
  document.getElementById('fc-rowIndex').value         = col.col_id;
  document.getElementById('fc-rang').value             = col.rang || '';
  const selPos = document.getElementById('fc-position');
  if (selPos) {
    selPos.innerHTML = '<option value="0">En premier</option>';
    donneesCollections.slice().sort((a, b) => (a.rang || 99) - (b.rang || 99))
      .filter(c => c.col_id !== col.col_id)
      .forEach(c => {
        const o = document.createElement('option');
        o.value = c.rang;
        o.textContent = 'Après ' + c.nom;
        if (c.rang === (col.rang || 99) - 1) o.selected = true;
        selPos.appendChild(o);
      });
  }
  document.getElementById('fc-collection').value       = col.nom || '';
  document.getElementById('fc-slogan').value           = col.slogan || '';
  const descCol = document.getElementById('fc-desc-col');
  if (descCol) { descCol.value = col.description || ''; ajusterHauteurTextarea(descCol); }
  if (document.getElementById('fc-couleur-hex')) (document.getElementById('fc-couleur-hex') || {}).value = col.couleur_hex || '';
  if (document.getElementById('fc-couleur-hex')) apercuCouleurCollection(document.getElementById('fc-couleur-hex'));
  document.getElementById('fc-photo-url').value        = col.photo_url || '';
  const preview = document.getElementById('fc-photo-preview');
  if (preview) preview.innerHTML = col.photo_url ? `<img src="${col.photo_url}" class="photo-preview">` : '';
  const previewNoel = document.getElementById('fc-photo-preview-noel');
  if (previewNoel) previewNoel.innerHTML = col.photo_noel_url ? `<img src="${col.photo_noel_url}" class="photo-preview">` : '';
   document.getElementById('contenu-collections').classList.add('cache');
  document.getElementById('btn-nouvelle-collection').classList.add('cache');
  document.getElementById('form-collections').classList.remove('cache');
  document.getElementById('form-collections').classList.add('visible');
  window.scrollTo(0, 0);
}

async function sauvegarderCollection() {
  afficherChargement();
  const btnSauvegarder = document.querySelector('#form-collections .form-body-actions .bouton');
  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = 'Sauvegarde…'; }
  const rowIndex = document.getElementById('fc-rowIndex').value;
  const mode     = document.getElementById('fc-mode').value;

  if (mode === 'ligne') {
    // Gamme V2
    const col_id = document.getElementById('fc-collection-ligne').value;
    const nom    = document.getElementById('fc-ligne').value.toUpperCase();
    if (!col_id || !nom) {
      if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
      afficherMsg('collections', 'Le nom de la gamme est requis.', 'erreur');
      return;
    }
    const d = {
      gam_id:      rowIndex || ('GAM-' + Date.now()),
      col_id,
      rang:        parseInt(document.getElementById('fc-rang-ligne')?.value) || 99,
      nom,
      description: document.getElementById('fc-desc-ligne').value,
      couleur_hex: document.getElementById('fc-couleur-hex-ligne')?.value || '',
      photo_url:   document.getElementById('fc-photo-url-ligne')?.value  || '',
      rowIndex:    rowIndex || null
    };
   const res = rowIndex
      ? await appelAPIPost('saveGamme', { ...d, rowIndex })
      : await appelAPIPost('saveGamme', d);
    if (res && res.success) {
      await appelAPIPost('saveGammeIngredients', {
        gam_id: d.gam_id,
        ingredients: ingredientsBase.map(i => ({ ing_id: i.ing_id || '', nom_ingredient: i.nom, quantite_g: i.quantite }))
      });
      if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
      fermerFormCollection();
      afficherMsg('collections', rowIndex ? 'Gamme mise à jour.' : 'Gamme ajoutée.');
      await chargerCollections();
    } else {
      afficherMsg('collections', 'Erreur lors de la sauvegarde.', 'erreur');
      if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    }
    return;
  }

  // Collection V2
  const positionChoisie = parseInt(document.getElementById('fc-position')?.value) || 0;
  const rangCalcule = positionChoisie + 1;
  const d = {
    col_id:      rowIndex || ('COL-' + Date.now()),
    rang:        rangCalcule,
    nom:         document.getElementById('fc-collection').value.toUpperCase(),
    slogan:      document.getElementById('fc-slogan').value,
    description: document.getElementById('fc-desc-col').value,
    couleur_hex: '',
    photo_url:   document.getElementById('fc-photo-url').value,
    photo_noel_url: document.getElementById('fc-photo-url-noel')?.value || '',
    rowIndex:    rowIndex || null
  };
  if (!d.nom) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    afficherMsg('collections', 'Le nom de la collection est requis.', 'erreur');
    return;
  }
  const res = await appelAPIPost('saveCollection', d);
  if (res && res.success) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    cacherChargement();
    fermerFormCollection();
    afficherMsg('collections', rowIndex ? 'Collection mise à jour.' : 'Collection ajoutée.');
  chargerCollections();
  } else {
    cacherChargement();
    afficherMsg('collections', 'Erreur lors de la sauvegarde.', 'erreur');
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  }
}

async function supprimerCollection(col_id) {
  const resPro = await appelAPI('getProduits');
  const tousLesProduits = (resPro && resPro.success) ? resPro.items : donneesProduits;
 const produitsLies = tousLesProduits.filter(p => 
    p.col_id === col_id || 
    (Array.isArray(p.collections_secondaires) && p.collections_secondaires.includes(col_id))
  );
  if (produitsLies.length > 0) {
    afficherMsg('collections', `Impossible — ${produitsLies.length} produit(s) sont liés à cette collection.`, 'erreur');
    return;
  }
  const gammes = donneesGammes.filter(g => g.col_id === col_id);
  if (gammes.length > 0) {
    afficherMsg('collections', `Impossible — ${gammes.length} gamme(s) sont liées à cette collection.`, 'erreur');
    return;
  }
  confirmerAction('Supprimer cette collection ?', async () => {
    const res = await appelAPIPost('deleteCollection', { col_id });
    if (res && res.success) {
      fermerFicheCollection();
      afficherMsg('collections', 'Collection supprimée.');
      await chargerCollections();
    } else {
      afficherMsg('collections', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

async function supprimerGamme(gam_id) {
  const gam = donneesGammes.find(g => g.gam_id === gam_id);
  if (!gam) return;
  const resPro = await appelAPI('getProduits');
  const tousLesProduits = (resPro && resPro.success) ? resPro.items : donneesProduits;
  const produitsLies = tousLesProduits.filter(p => p.gam_id === gam_id);
  if (produitsLies.length > 0) {
    afficherMsg('collections', `Impossible — ${produitsLies.length} produit(s) sont liés à cette gamme.`, 'erreur');
    return;
  }
 confirmerAction('Supprimer cette gamme ?', async () => {
    const res = await appelAPIPost('deleteGamme', { gam_id, col_id: gam.col_id });
    if (res && res.success) {
      fermerFicheGamme2();
      afficherMsg('gammes', 'Gamme supprimée.');
      const resGam = await appelAPI('getGammes');
      if (resGam && resGam.success) donneesGammes = resGam.items || [];
      afficherGammes();
    } else {
      afficherMsg('gammes', 'Erreur.', 'erreur');
    }
  });
}

/* ════════════════════════════════
   GAMMES V2
════════════════════════════════ */
function afficherGammes() {
  const loading = document.getElementById('loading-gammes');
  const contenu = document.getElementById('contenu-gammes');
  const vide    = document.getElementById('vide-gammes');
  const btnNew  = document.getElementById('btn-nouvelle-gamme');
  if (!contenu) return;
  contenu.innerHTML = '';
  if (vide) vide.classList.add('cache');
  if (!donneesGammes.length) {
    if (loading) loading.classList.add('cache');
    if (btnNew)  btnNew.classList.remove('cache');
    if (vide) vide.classList.remove('cache');
    return;
  }
  if (loading) loading.classList.add('cache');
  if (btnNew)  btnNew.classList.remove('cache');

  let optionsCol = '<option value="">Toutes les collections</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    const sel = filtreGammesColId === col.col_id ? 'selected' : '';
    optionsCol += `<option value="${col.col_id}" ${sel}>${col.nom}</option>`;
  });
  let html = `<div class="filtres-bar" style="margin-bottom:1.2rem;">
    <select class="form-ctrl" style="max-width:260px;" onchange="filtreGammesColId=this.value;afficherGammes();">${optionsCol}</select>
  </div>`;

  const colsFiltrees = filtreGammesColId
    ? donneesCollections.filter(c => c.col_id === filtreGammesColId)
    : donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99));

  colsFiltrees.forEach(col => {
    const gammesDeLaCol = donneesGammes.filter(g => g.col_id === col.col_id).sort((a, b) => (a.rang || 99) - (b.rang || 99));
    if (!gammesDeLaCol.length) return;
    html += `<div class="recette-collection-titre">${col.nom.toUpperCase()}</div>`;
    html += '<div class="collections-grille">';
    gammesDeLaCol.forEach(gam => {
      const couleurs = couleurCollection(gam.nom, gam.couleur_hex);
      html += `
        <div class="collection-carte" onclick="ouvrirFicheGamme2('${gam.gam_id}')">
          <div class="collection-carte-bg" style="background:linear-gradient(145deg,${couleurs[0]},${couleurs[1]});"></div>
          <div class="collection-carte-overlay"></div>
          <div class="collection-carte-lignes-haut"></div>
          <div class="collection-carte-contenu">
            <span class="collection-carte-nom">${(gam.nom || '').toUpperCase()}</span>
            <span class="collection-carte-slogan"></span>
          </div>
        </div>`;
    });
    html += '</div>';
  });
  contenu.innerHTML = html;
}

function ouvrirFicheGamme2(gam_id) {
  const gam = donneesGammes.find(g => g.gam_id === gam_id);
  if (!gam) return;
  const col = donneesCollections.find(c => c.col_id === gam.col_id);
  document.getElementById('fiche-gamme-titre').textContent      = (gam.nom || '').toUpperCase();
  document.getElementById('fiche-gamme-slogan').textContent     = gam.slogan || '';
  document.getElementById('fiche-gamme-collection').textContent = col?.nom || '—';
  document.getElementById('fiche-gamme-desc').textContent       = gam.description || '—';

  let wrapHtml = '';
  if (gam.photo_url)      wrapHtml += `<img src="${gam.photo_url}" class="fiche-visuel-photo">`;
  if (gam.photo_noel_url) wrapHtml += `<img src="${gam.photo_noel_url}" class="fiche-visuel-photo">`;
  if (gam.couleur_hex)    wrapHtml += `<div class="fiche-visuel-hex" style="background:${gam.couleur_hex}"></div>`;
  const ficheExtras = document.getElementById('fiche-gamme-extras');
  if (ficheExtras) ficheExtras.innerHTML = wrapHtml ? `<div class="fiche-visuel">${wrapHtml}</div>` : '';

  const produitsGamme = donneesProduits.filter(p => p.gam_id === gam_id);
  const elProduits = document.getElementById('fiche-gamme-produits');
  if (elProduits) elProduits.textContent = produitsGamme.length ? produitsGamme.map(p => p.nom).join(' — ') : 'Aucun produit';

  document.getElementById('fiche-gamme-modifier').onclick = () => { fermerFicheGamme2(); modifierGamme(gam_id); };
  document.getElementById('btn-supprimer-gamme').onclick  = () => supprimerGamme(gam_id);
  document.getElementById('contenu-gammes').classList.add('cache');
  document.getElementById('btn-nouvelle-gamme').classList.add('cache');
  document.getElementById('fiche-gamme').classList.remove('cache');
  setTimeout(appliquerCouleursHex, 300);
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFicheGamme2() {
  document.getElementById('fiche-gamme').classList.add('cache');
  document.getElementById('contenu-gammes').classList.remove('cache');
  const btnNew = document.getElementById('btn-nouvelle-gamme');
  if (btnNew) btnNew.classList.remove('cache');
}

function ouvrirFormGamme(col_id) {
  fermerFicheGamme2();
  document.getElementById('form-gammes-titre').textContent = 'Nouvelle gamme';
  document.getElementById('fg-id').value          = '';
  document.getElementById('fg-nom').value         = '';
  document.getElementById('fg-rang').value        = '';
  document.getElementById('fg-desc').value        = '';
  (document.getElementById('fg-couleur-hex') || {}).value = '';
  const sel = document.getElementById('fg-collection');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    const o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
  if (col_id) sel.value = col_id;
  peuplerPositionGamme(col_id, null);
  document.getElementById('contenu-gammes').classList.add('cache');
  document.getElementById('btn-nouvelle-gamme').classList.add('cache');
   document.getElementById('form-gammes').classList.remove('cache');
  window.scrollTo(0, 0);
}

async function sauvegarderGamme2() {
  afficherChargement();
  const btnSauvegarder = document.querySelector('#form-gammes .form-body-actions .bouton');
  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = '<span class="spinner"></span> Sauvegarde…'; }
  const rowIndex = document.getElementById('fg-id').value;
  const col_id   = document.getElementById('fg-collection').value;
  const nom      = document.getElementById('fg-nom').value.toUpperCase();
  if (!col_id || !nom) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    afficherMsg('gammes', 'Le nom et la collection sont requis.', 'erreur');
    return;
  }
  const positionChoisie = parseInt(document.getElementById('fg-position')?.value) || 0;
  const rangCalcule = positionChoisie + 1;
  const d = {
    gam_id:      rowIndex || ('GAM-' + Date.now()),
    col_id,
    rang:        rangCalcule,
    nom,
    description: document.getElementById('fg-desc').value,
    couleur_hex: '',
    rowIndex:    rowIndex || null
  };
  const res = await appelAPIPost('saveGamme', d);
  if (res && res.success) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    cacherChargement();
    fermerFormGamme2();
    afficherMsg('gammes', rowIndex ? 'Gamme mise à jour.' : 'Gamme ajoutée.');
    const resGam = await appelAPI('getGammes');
    if (resGam && resGam.success) donneesGammes = resGam.items || [];
    afficherGammes();
  } else {
    cacherChargement();
    afficherMsg('gammes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  }
}

function peuplerPositionGamme(col_id, rangActuel) {
  const selPos = document.getElementById('fg-position');
  if (!selPos) return;
  selPos.innerHTML = '<option value="0">En premier</option>';
  if (!col_id) return;
  donneesGammes.filter(g => g.col_id === col_id)
    .sort((a, b) => (a.rang || 99) - (b.rang || 99))
    .forEach(g => {
      const o = document.createElement('option');
      o.value = g.rang;
      o.textContent = 'Après ' + g.nom;
      if (rangActuel && g.rang === rangActuel - 1) o.selected = true;
      selPos.appendChild(o);
    });
}

function fermerFormGamme2() {
  document.getElementById('form-gammes').classList.add('cache');
  document.getElementById('contenu-gammes').classList.remove('cache');
  const btnNew = document.getElementById('btn-nouvelle-gamme');
  if (btnNew) btnNew.classList.remove('cache');
}

var donneesProduits   = []; // [{pro_id, col_id, gam_id, nom, statut, ...}]
var produitActif      = null;
var scrollAvantProduit = 0;
var collectionsDisponibles = {};

async function chargerProduitsData() {
  const [resPro, resFmt] = await Promise.all([
    appelAPI('getProduits'),
    appelAPI('getProduitsFormats')
  ]);
  if (!resPro || !resPro.success) { afficherMsg('produits', 'Erreur.', 'erreur'); return; }
  const formatsMap = {};
  if (resFmt && resFmt.success) {
    (resFmt.items || []).forEach(f => {
      if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
      formatsMap[f.pro_id].push({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente });
    });
  }
donneesProduits = (resPro.items || []).sort((a, b) => {
    const colA = donneesCollections.find(c => c.col_id === a.col_id);
    const colB = donneesCollections.find(c => c.col_id === b.col_id);
    const gamA = donneesGammes.find(g => g.gam_id === a.gam_id);
    const gamB = donneesGammes.find(g => g.gam_id === b.gam_id);
    return ((colA?.rang || 99) - (colB?.rang || 99)) ||
           ((gamA?.rang || 99) - (gamB?.rang || 99)) ||
           (a.nom || '').localeCompare(b.nom || '');
  }).map(p => ({ ...p, formats: formatsMap[p.pro_id] || [] }));
  afficherProduits();
}

async function afficherProduits() {
  const loading = document.getElementById('loading-produits');
  const grille  = document.getElementById('grille-produits');
  const vide    = document.getElementById('vide-produits');
  if (loading) loading.classList.add('cache');
  if (grille)  grille.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  // Réinitialiser filtres
  const filtreCol = document.getElementById('filtre-recette-collection');
  const filtreLig = document.getElementById('filtre-recette-ligne');
  if (filtreCol) filtreCol.value = '';
  if (filtreLig) { filtreLig.innerHTML = '<option value="">Toutes les gammes</option>'; filtreLig.disabled = true; }

  await chargerCollectionsPourSelecteur();

  if (!donneesProduits.length) { if (vide) vide.classList.remove('cache'); return; }

  if (grille) { grille.innerHTML = ''; grille.classList.remove('cache'); }

  // Regrouper par collection puis gamme
  const parCollection = {};
  const ordreCollections = [];
  donneesProduits.forEach(pro => {
    const col = donneesCollections.find(c => c.col_id === pro.col_id);
    const colId = pro.col_id || '—';
    if (!parCollection[colId]) { parCollection[colId] = { nom: col?.nom || colId, gammes: {} }; ordreCollections.push(colId); }
    const gam = donneesGammes.find(g => g.gam_id === pro.gam_id);
    const gamId = pro.gam_id || '';
    const gamNom = gam?.nom || '';
    if (!parCollection[colId].gammes[gamId]) parCollection[colId].gammes[gamId] = { nom: gamNom, rang: gam?.rang || 99, produits: [] };
    parCollection[colId].gammes[gamId].produits.push(pro);
  });

  ordreCollections.forEach(colId => {
    const colData = parCollection[colId];
    const secCol = document.createElement('div');
    secCol.className = 'recette-section-collection';
    secCol.dataset.collection = colData.nom;
    secCol.innerHTML = `<div class="recette-collection-titre">${colData.nom.toUpperCase()}</div>`;

    const gammesTriees = Object.values(colData.gammes).sort((a, b) => (a.rang || 99) - (b.rang || 99));
    gammesTriees.forEach(gamData => {
      const secGam = document.createElement('div');
      secGam.className = 'recette-section-ligne';
      secGam.dataset.ligne = gamData.nom;
      if (gamData.nom) {
        secGam.innerHTML = `<div class="recette-ligne-titre">${gamData.nom.toUpperCase()}</div>`;
      }
      const grilleInner = document.createElement('div');
      grilleInner.className = 'recette-cartes-grille';

      gamData.produits.forEach(pro => {
        const couleur = pro.couleur_hex || 'var(--gris)';
		
		
    const div = document.createElement('div');
        div.className = 'carte-produit';
        div.dataset.proId = pro.pro_id;
        div.onclick = () => {
          scrollAvantProduit = document.querySelector('.admin-contenu')?.scrollTop || window.scrollY;
          div.classList.add('carte-produit-chargement');
          div.insertAdjacentHTML('beforeend', '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>');
          ouvrirFicheProduit(pro.pro_id).finally(() => {
            div.classList.remove('carte-produit-chargement');
            const sp = div.querySelector('.spinner');
            if (sp) sp.remove();
          });
        };
        div.style.setProperty('--col-hex', couleur);
        const col = donneesCollections.find(c => c.col_id === pro.col_id);
        div.innerHTML = `
          <div class="carte-visuel">
            <span class="carte-statut-badge${pro.statut !== 'public' ? ' test' : ''}">${pro.statut === 'public' ? 'Public' : 'Test'}</span>
            <div class="carte-couleur">
              ${pro.image_url
                ? `<img src="${pro.image_url}" alt="${pro.nom}" onerror="this.style.display='none'">`
                : `<div class="carte-photo-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Photo à venir
                  </div>`}
              <div class="recette-couleur-overlay"></div>
              <div class="carte-couleur-dot"></div>
            </div>
          </div>
          <div class="carte-infos ${couleurTexteContraste(couleur)}">
            <span class="carte-collection-badge">${col?.nom || '—'}</span>
            <div class="carte-nom">${pro.nom || '—'}</div>
            <div class="carte-ligne">${gamData.nom}</div>
          <div class="carte-bas">
              ${(pro.formats && pro.formats.length) ? `<div class="carte-formats">${[...pro.formats].sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids)).map(f => `<div class="carte-format-tag"><span class="carte-format-prix">${parseFloat(f.prix_vente).toFixed(2).replace('.', ',')} $</span><span class="carte-format-sep"></span><span class="carte-format-poids">${f.poids} ${f.unite}</span></div>`).join('')}</div>` : ''}
            </div>
          </div>`;
		  
		  
		  
        grilleInner.appendChild(div);
      });

      secGam.appendChild(grilleInner);
      secCol.appendChild(secGam);
    });

    if (grille) grille.appendChild(secCol);
  });

  peuplerFiltresRecettes();
}

function peuplerFiltresRecettes() {
  const sel = document.getElementById('filtre-recette-collection');
  if (!sel) return;
  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">Toutes les collections</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.nom; opt.textContent = col.nom;
    sel.appendChild(opt);
  });
  sel.value = valActuelle;
}

function onFiltreCollection() {
  const colNom   = document.getElementById('filtre-recette-collection').value;
  const selGamme = document.getElementById('filtre-recette-ligne');
  selGamme.innerHTML = '<option value="">Toutes les gammes</option>';
  if (colNom) {
    const col    = donneesCollections.find(c => c.nom === colNom);
    const gammes = col ? donneesGammes.filter(g => g.col_id === col.col_id) : [];
    gammes.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.nom; opt.textContent = g.nom;
      selGamme.appendChild(opt);
    });
    selGamme.disabled = false;
  } else {
    selGamme.disabled = true;
  }
  filtrerRecettes();
}

function filtrerRecettes() {
  const col    = document.getElementById('filtre-recette-collection')?.value;
  const gamme  = document.getElementById('filtre-recette-ligne')?.value;
  const statut = document.getElementById('filtre-recette-statut')?.value;
  const nom    = (document.getElementById('filtre-recette-nom')?.value || '').toLowerCase().trim();
  const cartes = document.querySelectorAll('#grille-produits .carte-produit');
  const vide   = document.getElementById('vide-produits');
  let visible  = 0;
  cartes.forEach(carte => {
    const pro = donneesProduits.find(p => p.pro_id === carte.dataset.proId);
    if (!pro) return;
    const colObj = donneesCollections.find(c => c.col_id === pro.col_id);
    const gamObj = donneesGammes.find(g => g.gam_id === pro.gam_id);
    const ok = (!col    || colObj?.nom === col)
            && (!gamme  || gamObj?.nom === gamme)
            && (!statut || (pro.statut || 'test') === statut)
            && (!nom    || pro.nom.toLowerCase().includes(nom));
    carte.classList.toggle('cache', !ok);
    if (ok) visible++;
  });
  if (vide) vide.classList.toggle('cache', visible !== 0);

  document.querySelectorAll('#grille-produits .recette-section-ligne').forEach(sec => {
    const aDesCartesVisibles = [...sec.querySelectorAll('.carte-produit')].some(c => !c.classList.contains('cache'));
    sec.classList.toggle('cache', !aDesCartesVisibles);
  });
  document.querySelectorAll('#grille-produits .recette-section-collection').forEach(sec => {
    const aDesLignesVisibles = [...sec.querySelectorAll('.recette-section-ligne')].some(l => !l.classList.contains('cache'));
    sec.classList.toggle('cache', !aDesLignesVisibles);
  });
}

function reinitialiserFiltresRecettes() {
  const f = ['filtre-recette-collection','filtre-recette-ligne','filtre-recette-statut','filtre-recette-nom'];
  f.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const filtreLig = document.getElementById('filtre-recette-ligne');
  if (filtreLig) filtreLig.disabled = true;
  filtrerRecettes();
}

async function chargerCollectionsPourSelecteur() {
  const sel = document.getElementById('fr-collection');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  collectionsDisponibles = {};
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    collectionsDisponibles[col.col_id] = donneesGammes.filter(g => g.col_id === col.col_id);
    const o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
 // Famille
  const selFam = document.getElementById('fr-famille');
  if (selFam) {
    selFam.innerHTML = '<option value="">— Aucune —</option>';
    donneesFamilles.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).forEach(fam => {
      const o = document.createElement('option');
      o.value = fam.fam_id; o.textContent = fam.nom; selFam.appendChild(o);
    });
  }

  // Collections secondaires
  const selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    selSec.innerHTML = '';
    donneesCollections.forEach(col => {
      const label = document.createElement('label');
      const cb    = document.createElement('input');
      cb.type = 'checkbox'; cb.value = col.col_id; cb.id = 'sec-' + col.col_id;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(col.nom));
      selSec.appendChild(label);
    });
  }
}

// Filtre Collection → Gamme dans formulaire produit
async function mettreAJourLignes() {
  const col_id = document.getElementById('fr-collection').value;
  const sel    = document.getElementById('fr-ligne');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  const gammes = (collectionsDisponibles[col_id] || []).sort((a, b) => (a.rang || 99) - (b.rang || 99));
  if (!gammes.length) { sel.innerHTML = '<option value="">— Aucune gamme —</option>'; return; }
  gammes.forEach(g => {
    const o = document.createElement('option'); o.value = g.gam_id; o.textContent = g.nom; sel.appendChild(o);
  });
}

async function ouvrirFicheProduit(pro_id) {
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  if (!pro) return;
  produitActif = pro;

  // Charger les formats
  const resFormats = await appelAPI('getProduitsFormats', { pro_id });
  const formats    = (resFormats && resFormats.success) ? resFormats.items : [];

  const col = donneesCollections.find(c => c.col_id === pro.col_id);
  const gam = donneesGammes.find(g => g.gam_id === pro.gam_id);

  const resEmb = await appelAPI('getFormatsEmballages', { pro_id });
  const embItems = (resEmb && resEmb.success) ? resEmb.items : [];

  const formatsHtml = formats.length
    ? formats.map(f => {
        const nbUnites = f.nb_unites || 0;
        const coutIngParUnite = nbUnites > 0 ? coutTotal / nbUnites : 0;
        const embsDuFormat = embItems.filter(e => String(e.poids) === String(f.poids) && e.unite === f.unite);
        const coutEmb = embsDuFormat.reduce((s, e) => {
          const stockItem = stock.find(st => st.ing_id === e.ing_id);
          const prixParG  = stockItem?.prix_par_g_reel || 0;
          return s + ((e.nb_par_unite || 1) * prixParG);
        }, 0);
        const coutTotal_f = coutIngParUnite + coutEmb;
        const marge = f.prix_vente && coutTotal_f > 0 ? ((f.prix_vente - coutTotal_f) / f.prix_vente * 100).toFixed(1) : '—';
        return `<div class="fiche-ingredient">
          <span class="fiche-ing-nom">${f.poids} ${f.unite}</span>
          <span class="fiche-ing-qte">${f.prix_vente ? formaterPrix(f.prix_vente) : '—'}</span>
          <span class="fiche-ing-qte">${nbUnites ? nbUnites + ' unités' : '—'}</span>
          <span class="fiche-ing-qte">${coutTotal_f > 0 ? formaterPrix(coutTotal_f) + '/unité' : '—'}</span>
          <span class="fiche-ing-qte">${marge !== '—' ? marge + '% marge' : '—'}</span>
        </div>`;
      }).join('')
    : '<div class="fiche-vide fiche-label-manquant">⚠ Aucun format</div>';

  // Charger les ingrédients
  const resIng = await appelAPI('getProduitsIngredients', { pro_id });
  const ings   = (resIng && resIng.success) ? resIng.items : [];

  // Charger le stock si pas encore en mémoire
  if (!listesDropdown.stock) {
    const resSto = await appelAPI('getStock');
    listesDropdown.stock = (resSto && resSto.success) ? resSto.items : [];
  }
  const stock  = listesDropdown.stock  || [];
  const config = listesDropdown.config || {};
  let coutDetail = '';
  let coutTotal  = 0;
  ings.forEach(ing => {
    const stockItem = stock.find(s => s.ing_id === ing.ing_id);
    const prixParG  = stockItem ? (stockItem.prix_par_g_reel || 0) : 0;
    const cat_id    = stockItem ? (stockItem.cat_id || '') : '';
    const cfg       = config[cat_id] || {};
    const perte     = cfg.margePertePct || 0;
    const facteur   = 1 + (perte / 100);
    const sousTotal = (ing.quantite_g || 0) * prixParG * facteur;
    coutTotal += sousTotal;
    
  });
  const cout        = coutTotal;
  const nbUnites    = pro.nb_unites || 1;
  const coutParUnit = cout > 0 ? (cout / nbUnites).toFixed(2) + ' $' : '—';
  const coutHtml = `<div class="fiche-champ"><span class="fiche-label">Coût de revient estimé</span><span class="fiche-valeur">${cout > 0 ? cout.toFixed(2) + ' $' : '—'}</span></div><div class="fiche-champ"><span class="fiche-label">Coût par unité (${nbUnites} unités)</span><span class="fiche-valeur">${coutParUnit}</span></div>`;
  const ingsHtml = ings.length
    ? ings.sort((a, b) => b.quantite_g - a.quantite_g).map(i => {
        const inciObj  = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient);
        const inciCode = inciObj?.inci || '';
        const sansInci = !inciCode;
        const stockItem2 = (listesDropdown.stock || []).find(s => s.ing_id === i.ing_id);
        const prixParG2  = stockItem2 ? (stockItem2.prix_par_g_reel || 0) : 0;
        const coutIng    = prixParG2 > 0 ? (i.quantite_g * prixParG2).toFixed(2) + ' $' : '⚠';
        return `<div class="fiche-ingredient"><span class="fiche-ing-nom${sansInci ? ' fiche-label-manquant' : ''}">${sansInci ? '⚠ ' : ''}${i.nom_ingredient}</span><span class="fiche-ing-inci">${inciCode}</span><span class="fiche-ing-qte">${i.quantite_g} g</span><span class="fiche-ing-qte">${coutIng}</span></div>`;
      }).join('')
   : '<div class="fiche-vide">Aucun ingrédient</div>';

  const inciLabel = ings
    .filter(i => {
      const obj = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient);
      return obj?.inci;
    })
    .sort((a, b) => b.quantite_g - a.quantite_g)
    .map(i => {
      const obj = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient);
      return obj.inci.trim();
    })
    .join(', ');
  const inciLabelHtml = inciLabel
    ? `<div class="inci-label-texte">${inciLabel}</div>`
    : '<div class="fiche-vide">Aucun code INCI disponible</div>';

  document.getElementById('fiche-recette-titre').textContent = pro.nom || '—';
  document.getElementById('fiche-recette-contenu').innerHTML = `
    <div class="fiche-visuel">
      ${pro.image_url ? `<img src="${pro.image_url}" class="fiche-visuel-photo">` : ''}
      <div class="fiche-visuel-hex" style="background:${pro.couleur_hex || 'var(--beige)'}"></div>
    </div>
    <div class="fiche-grille">
      <div class="fiche-champ"><span class="fiche-label">Collection</span><span class="fiche-valeur">${col?.nom || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Gamme</span><span class="fiche-valeur">${gam?.nom || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Statut</span><span class="fiche-valeur">${pro.statut || 'test'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Cure</span><span class="fiche-valeur">${pro.cure || '—'} jours</span></div>
      <div class="fiche-champ"><span class="fiche-label">Nb unités</span><span class="fiche-valeur">${pro.nb_unites || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Surgras</span><span class="fiche-valeur">${pro.surgras || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Couleur HEX</span><span class="fiche-valeur">${pro.couleur_hex || '—'}</span></div>
      ${coutHtml}
    </div>
    <div class="fiche-section-titre">Description</div>
    <div class="fiche-texte">${pro.description || '—'}</div>
    <div class="fiche-section-titre">Instructions</div>
    <div class="fiche-texte">${pro.instructions || '—'}</div>
    <div class="fiche-section-titre">Description pour emballage</div>
    <div class="fiche-texte">${pro.desc_emballage || '—'}</div>
    <div class="fiche-section-titre">Notes</div>
    <div class="fiche-texte">${pro.notes || '—'}</div>
    <div class="fiche-section-titre">Avertissement</div>
    <div class="fiche-texte">${pro.avertissement || '—'}</div>
    <div class="fiche-section-titre">Mode d'emploi</div>
    <div class="fiche-texte">${pro.mode_emploi || '—'}</div>
    <div class="fiche-section-titre">Ingrédients</div>
    <div class="fiche-ingredient fiche-ingredient-labels">
      <span class="fiche-ing-nom">Nom</span>
      <span class="fiche-ing-inci">INCI</span>
      <span class="fiche-ing-qte">Qté</span>
      <span class="fiche-ing-qte">Prix</span>
    </div>
    <div class="fiche-ingredients">${ingsHtml}</div>
    <div class="fiche-section-titre">Liste INCI pour étiquette</div>
    <div class="fiche-inci-etiquette">${inciLabelHtml}</div>
    <div class="fiche-section-titre">Formats disponibles</div>
    <div class="fiche-ingredient fiche-ingredient-labels">
      <span class="fiche-ing-nom">Format</span>
      <span class="fiche-ing-qte">Prix vente</span>
      <span class="fiche-ing-qte">Nb unités</span>
      <span class="fiche-ing-qte">Coût/unité</span>
      <span class="fiche-ing-qte">Marge</span>
    </div>
    <div class="fiche-ingredients">${formatsHtml}</div>
    <div class="fiche-section-titre">Export</div>
    <button class="bouton" onclick="exporterFicheProduit()">Copier pour le graphiste</button>
  `;

  fermerFormProduit();
  document.getElementById('fiche-recette').classList.remove('cache');
  document.querySelector('#section-produits .filtres-bar')?.classList.add('cache');
  document.getElementById('grille-produits').classList.add('cache');
  document.getElementById('btn-nouvelle-recette').classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function exporterFicheProduit() {
  if (!produitActif) return;
  const pro = produitActif;
  const col = donneesCollections.find(c => c.col_id === pro.col_id);
  const gam = donneesGammes.find(g => g.gam_id === pro.gam_id);
  const fam = donneesFamilles?.find(f => f.fam_id === pro.fam_id);
  const ings = pro.ingredients || [];
  const formats = pro.formats || [];

  const inciLabel = ings
    .filter(i => { const o = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient); return o?.inci; })
    .sort((a, b) => b.quantite_g - a.quantite_g)
    .map(i => { const o = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient); return o.inci.trim(); })
    .join(', ');

  const ingsTexte = ings.sort((a,b) => b.quantite_g - a.quantite_g)
    .map(i => { const o = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient); return `  - ${i.nom_ingredient} | ${o?.inci || '⚠ INCI manquant'} | ${i.quantite_g} g`; })
    .join('\n');

  const formatsTexte = formats.map(f => `  - ${f.nom || f.format || ''} : ${f.prix || '—'} $`).join('\n');

  const texte = [
    `NOM : ${pro.nom || '—'}`,
    `COLLECTION : ${col?.nom || '—'}`,
    `GAMME : ${gam?.nom || '—'}`,
    `FAMILLE : ${fam?.nom || '—'}`,
    `STATUT : ${pro.statut || '—'}`,
    `COULEUR HEX : ${pro.couleur_hex || '—'}`,
    `IMAGE : ${pro.image_url || '—'}`,
    `IMAGE NOËL : ${pro.image_noel_url || '—'}`,
    `\nDESCRIPTION :\n${pro.description || '—'}`,
    `\nDESCRIPTION EMBALLAGE :\n${pro.desc_emballage || '—'}`,
    `\nINSTRUCTIONS :\n${pro.instructions || '—'}`,
    `\nNOTES :\n${pro.notes || '—'}`,
    `\nAVERTISSEMENT :\n${pro.avertissement || '—'}`,
    `\nMODE D'EMPLOI :\n${pro.mode_emploi || '—'}`,
    `\nLISTE INCI :\n${inciLabel || '—'}`,
    `\nINGRÉDIENTS :\n${ingsTexte || '—'}`,
    `\nFORMATS :\n${formatsTexte || '—'}`,
  ].join('\n');

  navigator.clipboard.writeText(texte).then(() => afficherMsg('produits', '✅ Copié dans le presse-papier.'));
}

function fermerFicheProduit() {
  document.getElementById('fiche-recette').classList.add('cache');
  document.querySelector('#section-produits .filtres-bar')?.classList.remove('cache');
  document.getElementById('grille-produits').classList.remove('cache');
  document.getElementById('btn-nouvelle-recette').classList.remove('cache');
  document.getElementById('filtre-recette-nom').value = '';
  filtrerRecettes();
  produitActif = null;
  const contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTop = scrollAvantProduit;
  else window.scrollTo(0, scrollAvantProduit);
}

// Compatibilité noms V1 dans le HTML — fermerFicheRecette défini comme function ci-dessous

async function basculerModeEditionRecette() {
  if (!produitActif) return;
  document.getElementById('fiche-recette').classList.add('cache');
  await modifierProduit(produitActif.pro_id);
}

function supprimerRecetteActive() {
  if (!produitActif) return;
  supprimerProduit(produitActif.pro_id);
}
function fermerFicheRecette() { fermerFicheProduit(); }

function ouvrirFormRecette() { ouvrirFormProduit(); }

async function ouvrirFormProduit() {
  formatsRecette = [];
  ingredientsRecette = [];
  emballagesRecette = {};
  document.getElementById('form-recettes-titre').textContent = 'Nouveau produit';
  document.getElementById('fr-id').value = '';
['fr-nom','fr-couleur','fr-unites','fr-cure','fr-description','fr-instructions','fr-notes','fr-surgras','fr-avertissement','fr-mode-emploi']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('fr-statut').value     = 'test';
 document.getElementById('fr-collection').value = '';
  document.getElementById('fr-ligne').innerHTML  = '<option value="">— Choisir collection —</option>';
  document.getElementById('fr-ligne').disabled = true;
  document.getElementById('fr-couleur-visible').value = '';
  document.getElementById('fr-image-url').value       = '';
  document.getElementById('fr-image-url-noel').value  = '';
  const prevRecette = document.getElementById('fr-image-preview');
  if (prevRecette) { prevRecette.src = ''; prevRecette.classList.add('cache'); }
  const prevNoel = document.getElementById('fr-image-preview-noel');
  if (prevNoel) prevNoel.innerHTML = '';
  const apercuRecette = document.getElementById('fr-couleur-apercu');
  if (apercuRecette) apercuRecette.style.background = '';
  document.querySelector('#section-produits .filtres-bar')?.classList.add('cache');
  document.getElementById('grille-produits').classList.add('cache');
  document.getElementById('btn-nouvelle-recette').classList.add('cache');
  await chargerCollectionsPourSelecteur();
 document.getElementById('form-recettes').classList.remove('cache');
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormProduit() {
  document.getElementById('form-recettes').classList.add('cache');
  const filtresBar = document.querySelector('#section-produits .filtres-bar');
  if (filtresBar) filtresBar.classList.remove('cache');
  document.getElementById('grille-produits').classList.remove('cache');
  document.getElementById('btn-nouvelle-recette').classList.remove('cache');
}

function fermerFormRecette() { fermerFormProduit(); }

async function modifierProduit(pro_id) {
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  if (!pro) return;

  // Charger les formats et ingrédients
  const [resFormats, resIngs] = await Promise.all([
    appelAPI('getProduitsFormats', { pro_id }),
    appelAPI('getProduitsIngredients', { pro_id })
  ]);

  document.getElementById('form-recettes-titre').textContent   = 'Modifier le produit';
  document.getElementById('fr-id').value                       = pro.pro_id;
  document.getElementById('fr-nom').value                      = pro.nom || '';
  document.getElementById('fr-couleur').value                  = pro.couleur_hex || '';
  document.getElementById('fr-couleur-visible').value          = pro.couleur_hex || '';
  const apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercuCouleurRecette(document.getElementById('fr-couleur-visible'));
  document.getElementById('fr-unites').value                   = pro.nb_unites || '';
  document.getElementById('fr-cure').value                     = pro.cure || '';
  document.getElementById('fr-description').value              = pro.description || '';
  const descEmb = document.getElementById('fr-desc-emballage');
  if (descEmb) descEmb.value = pro.desc_emballage || '';
  document.getElementById('fr-instructions').value             = pro.instructions || '';
  document.getElementById('fr-notes').value                    = pro.notes || '';
  const elAvert = document.getElementById('fr-avertissement');
  if (elAvert) elAvert.value = pro.avertissement || '';
  const elMode = document.getElementById('fr-mode-emploi');
  if (elMode) elMode.value = pro.mode_emploi || '';
  document.getElementById('fr-surgras').value                  = pro.surgras || '';
  document.getElementById('fr-statut').value                   = pro.statut || 'test';
await chargerCollectionsPourSelecteur();
  document.getElementById('fr-collection').value               = pro.col_id || '';
  await mettreAJourLignes();
  document.getElementById('fr-ligne').value                    = pro.gam_id || '';
  const selFamProd = document.getElementById('fr-famille');
  if (selFamProd) selFamProd.value = pro.fam_id || '';
  document.getElementById('fr-image-url').value                = pro.image_url || '';
  const preview = document.getElementById('fr-image-preview');
  if (preview) preview.innerHTML = pro.image_url ? `<img src="${pro.image_url}" class="photo-preview">` : '';
  document.getElementById('fr-image-url-noel').value           = pro.image_noel_url || '';
  const previewNoel = document.getElementById('fr-image-preview-noel');
  if (previewNoel) previewNoel.innerHTML = pro.image_noel_url ? `<img src="${pro.image_noel_url}" class="photo-preview">` : '';

  // Collections secondaires
  const selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    Array.from(selSec.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
      cb.checked = Array.isArray(pro.collections_secondaires) &&
        pro.collections_secondaires.includes(cb.value);
    });
  }

  // Ingrédients
  ingredientsRecette = (resIngs && resIngs.success ? resIngs.items : []).map(i => ({
    ing_id:   i.ing_id,
    type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
    nom:      i.nom_ingredient,
    quantite: i.quantite_g
  })).sort((a, b) => b.quantite - a.quantite);

  // Formats
   formatsRecette = (resFormats && resFormats.success ? resFormats.items : []).map(f => ({
    poids: f.poids, unite: f.unite, prix: f.prix_vente, desc: '', nb_unites: f.nb_unites || 0
  }));

  // Emballages par format
  emballagesRecette = {};
  const resEmb = await appelAPI('getFormatsEmballages', { pro_id });
  if (resEmb && resEmb.success) {
    (resEmb.items || []).forEach(e => {
      const cle = `${e.poids}_${e.unite}`;
      if (!emballagesRecette[cle]) emballagesRecette[cle] = [];
      const ing = (listesDropdown.fullData || []).find(d => d.ing_id === e.ing_id);
      emballagesRecette[cle].push({ ing_id: e.ing_id, cat_id: ing?.cat_id || '', nom: ing?.nom_UC || '', quantite: e.quantite, nb_par_unite: e.nb_par_unite || 1 });
    });
  }

 document.querySelector('#section-produits .filtres-bar')?.classList.add('cache');
  document.getElementById('grille-produits').classList.add('cache');
  document.getElementById('form-recettes').classList.remove('cache');
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  window.scrollTo(0, 0);
}

// Compatibilité nom V1
function modifierRecette(id) { return modifierProduit(id); }


async function sauvegarderRecette() {
  afficherChargement();
  const btnSauvegarder = document.querySelector('#form-recettes .form-body-actions .bouton');
  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = '<span class="spinner"></span> Sauvegarde…'; }

  const id     = document.getElementById('fr-id').value;
  const col_id = document.getElementById('fr-collection').value;
  const gam_id = document.getElementById('fr-ligne').value;

  const d = {
    pro_id:      id || ('PRO-' + Date.now()),
    col_id,
  gam_id,
    fam_id:      document.getElementById('fr-famille')?.value || '',
   nom: (document.getElementById('fr-nom')?.value || '').toUpperCase(),
    couleur_hex: document.getElementById('fr-couleur').value || document.getElementById('fr-couleur-visible').value || '',
    nb_unites:   parseInt(document.getElementById('fr-unites').value) || 1,
    cure:        parseInt(document.getElementById('fr-cure').value) || 0,
    description: document.getElementById('fr-description').value,
    desc_emballage: document.getElementById('fr-desc-emballage')?.value || '',
    instructions:  document.getElementById('fr-instructions').value,
    notes:         document.getElementById('fr-notes').value,
    avertissement: document.getElementById('fr-avertissement')?.value || '',
    mode_emploi:   document.getElementById('fr-mode-emploi')?.value || '',
    surgras:      document.getElementById('fr-surgras').value,
    statut:       document.getElementById('fr-statut').value || 'test',
    image_url:       document.getElementById('fr-image-url').value,
    image_noel_url:  document.getElementById('fr-image-url-noel').value,
    collections_secondaires: Array.from(
      document.getElementById('fr-collections-secondaires')?.querySelectorAll('input[type="checkbox"]:checked') || []
    ).map(cb => cb.value),
    ingredients: ingredientsRecette.map(i => ({
      ing_id:         i.ing_id || '',
      nom_ingredient: i.nom,
      quantite_g:     i.quantite
    })),
    formats: formatsRecette.map(f => ({
      poids: f.poids, unite: f.unite, prix_vente: f.prix, emb_id: '', nb_unites: f.nb_unites || 0
    }))
  };

  if (!d.nom) { afficherMsg('recettes', 'Le nom est requis.', 'erreur'); if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; } return; }
  if (!d.col_id) { afficherMsg('recettes', 'La collection est requise.', 'erreur'); if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; } return; }
  if (!d.gam_id) { afficherMsg('recettes', 'La gamme est requise.', 'erreur'); if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; } return; }

  if (id && ingredientsRecette.length === 0) {
    const resIngs = await appelAPI('getProduitsIngredients', { pro_id: id });
    if (resIngs && resIngs.success && resIngs.items.length > 0) {
      ingredientsRecette = resIngs.items.map(i => ({
        ing_id:   i.ing_id,
        type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
        nom:      i.nom_ingredient,
        quantite: i.quantite_g
      }));
      d.ingredients = ingredientsRecette.map(i => ({
        ing_id:         i.ing_id || '',
        nom_ingredient: i.nom,
        quantite_g:     i.quantite
      }));
    }
  }
  if (id && formatsRecette.length === 0) {
    const resFmts = await appelAPI('getProduitsFormats', { pro_id: id });
    if (resFmts && resFmts.success && resFmts.items.length > 0) {
      formatsRecette = resFmts.items.map(f => ({ poids: f.poids, unite: f.unite, prix: f.prix_vente, desc: '' }));
      d.formats = formatsRecette.map(f => ({ poids: f.poids, unite: f.unite, prix_vente: f.prix, emb_id: '' }));
    }
  }
  
  const res = await appelAPIPost('saveProduit', d);
  if (res && res.success) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  // Sauvegarder les emballages par format
    for (const f of formatsRecette) {
      const cle = `${f.poids}_${f.unite}`;
      const embs = emballagesRecette[cle] || [];
      await appelAPIPost('saveFormatsEmballages', {
        pro_id: d.pro_id,
        poids:  f.poids,
        unite:  f.unite,
        emballages: embs.filter(e => e.ing_id).map(e => ({ ing_id: e.ing_id, quantite: e.quantite || 0, nb_par_unite: e.nb_par_unite || 1 }))
      });
    }
    cacherChargement();
    fermerFormProduit();
    afficherMsg('recettes', id ? 'Produit mis à jour.' : 'Produit créé.');
    await chargerProduitsData();
    const contenu = document.querySelector('.admin-contenu');
    if (contenu) contenu.scrollTop = scrollAvantProduit;
 } else {
    cacherChargement();
    afficherMsg('recettes', 'Erreur.', 'erreur');
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  }
}

async function supprimerProduit(pro_id) {
 const resLots = await appelAPI('getLots');
  const lotsLies = (resLots && resLots.success ? resLots.items : []).filter(l => l.pro_id === pro_id);
  if (lotsLies.length > 0) {
    afficherMsg('recettes', `Impossible — ${lotsLies.length} lot(s) de fabrication sont liés à ce produit.`, 'erreur');
    return;
  }
  const resVentes = await appelAPI('getVentesLignes');
  const ventesLiees = (resVentes && resVentes.success ? resVentes.items : []).filter(v => v.pro_id === pro_id);
  if (ventesLiees.length > 0) {
    afficherMsg('recettes', `Impossible — ${ventesLiees.length} vente(s) sont liées à ce produit.`, 'erreur');
    return;
  }
  confirmerAction('Supprimer ce produit ?', async () => {
    const res = await appelAPIPost('deleteProduit', { pro_id });
    if (res && res.success) {
      fermerFicheProduit();
      afficherMsg('recettes', 'Produit supprimé.');
      await chargerProduitsData();
    } else {
      afficherMsg('recettes', 'Erreur.', 'erreur');
    }
  });
}

// supprimerRecetteActive — défini plus haut

// ─── CLOUDINARY ───
var _mediaLibrary        = null;
var _mediaLibraryChampId = null;
var _mediaLibraryPreviewId = null;

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
  _mediaLibraryChampId   = champId;
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
  document.getElementById('modal-cloudinary')?.classList.add('cache');
}

function ouvrirCloudinary()              { ouvrirMediaLibrary('fr-image-url',      'fr-image-preview');       }
function ouvrirCloudinaryCollection()    { ouvrirMediaLibrary('fc-photo-url',       'fc-photo-preview');      }
function ouvrirCloudinaryCollectionNoel(){ ouvrirMediaLibrary('fc-photo-url-noel',  'fc-photo-preview-noel'); }
function ouvrirCloudinaryLigne()         { ouvrirMediaLibrary('fc-photo-url-ligne', 'fc-photo-preview-ligne'); }

// ─── MÉDIATHÈQUE — GESTION ───
var _mediathequeDonnees = null;

async function chargerMediatheque() {
  document.getElementById('med-chargement').classList.remove('cache');
  const res = await appelAPI('getMediatheque');
  document.getElementById('med-chargement').classList.add('cache');
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de chargement.', 'erreur'); return; }
  _mediathequeDonnees = res.items;
  const cats = [...new Set(res.items.map(i => i.categorie).filter(Boolean))].sort();
  const sel  = document.getElementById('med-filtre-cat');
  sel.innerHTML = '<option value="">Toutes les catégories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  medFiltrer();
}

function medFiltrer() {
  const cat   = document.getElementById('med-filtre-cat').value;
  const items = (_mediathequeDonnees || []).filter(i => !cat || i.categorie === cat);
  const grille = document.getElementById('med-grille');
  document.getElementById('med-compteur').textContent = items.length + ' photo(s)';
  if (!items.length) { grille.innerHTML = '<p class="vide-desc">Aucune photo.</p>'; return; }
  grille.innerHTML = items.map(i => `
    <div class="collection-carte">
      <div class="carte-visuel"><img src="${i.url}" alt="${i.nom}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;"></div>
      <div class="fiche-label">${i.nom}</div>
      <div class="texte-secondaire">${i.categorie}</div>
    </div>`).join('');
}

async function mediathequeSyncCloudinary() {
  afficherMsg('mediatheque', 'Synchronisation en cours…');
  const res = await appelAPI('syncCloudinary');
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de synchronisation.', 'erreur'); return; }
  _mediathequeDonnees = null;
  afficherMsg('mediatheque', `✅ ${res.ajouts} photo(s) ajoutée(s).`);
  chargerMediatheque();
}

function mediathequeOuvrirAjout() {
  document.getElementById('med-form-ajout').classList.remove('cache');
  document.getElementById('med-url').value      = '';
  document.getElementById('med-nom').value      = '';
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
  const resActuel = await appelAPI('getMediatheque');
  if (resActuel && resActuel.success) {
    const item = (resActuel.items || []).find(i => i.nom === nom);
    if (item) rowIndex = item.rowIndex;
  }
  const res = await appelAPIPost('supprimerMediatheque', { rowIndex });
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de suppression.', 'erreur'); return; }
  _mediathequeDonnees = null;
  afficherMsg('mediatheque', `✅ "${nom}" supprimée.`);
  chargerMediatheque();
}

// ─── MÉDIATHÈQUE — SÉLECTEUR ───
var _mediathequeChampId   = null;
var _mediathequePreviewId = null;

async function ouvrirMediatheque(champId, previewId, categorie) {
  _mediathequeChampId   = champId;
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
  const cat  = document.getElementById('mediatheque-filtre-cat').value;
  const nom  = (document.getElementById('mediatheque-filtre-nom').value || '').toLowerCase();
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
    titre.textContent   = 'Nouvelle gamme — ' + (col || '');
    toggle.textContent  = '← Retour collection';
    document.getElementById('fc-collection-ligne').value = col;
  } else {
    mode.value = 'collection';
    blocCol.classList.remove('cache');
    blocLig.classList.add('cache');
    titre.textContent  = document.getElementById('fc-rowIndex').value ? 'Modifier la collection' : 'Nouvelle collection';
    toggle.textContent = '+ Ajouter une gamme';
  }
}

function apercuCouleurCollection(input) {
  const val     = input?.value?.trim() || '';
  const apercuId = input?.id === 'fc-couleur-hex' ? 'fc-couleur-apercu' : 'fc-couleur-apercu-ligne';
  const apercu  = document.getElementById(apercuId);
  if (!apercu) return;
  apercu.style.background = /^#[0-9a-fA-F]{6}$/.test(val) ? val : 'var(--beige)';
}

function apercuCouleurRecette(input) {
  const apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercu.style.background = /^#[0-9a-fA-F]{6}$/.test(input.value.trim()) ? input.value.trim() : 'var(--beige)';
  document.getElementById('fr-couleur').value = input.value;
}

// ─── INGRÉDIENTS PRODUIT ───
var ingredientsRecette = [];

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
  // V2 : listesDropdown.fullData est [{ing_id, cat_id, nom_UC, inci, ...}]
  const cats  = [...new Set(listesDropdown.fullData.map(d => d.cat_id))].filter(Boolean).sort();
  liste.innerHTML = ingredientsRecette.map((ing, i) => {
    const ingsDeType = listesDropdown.fullData.filter(d => d.cat_id === ing.type);
    const inciObj    = listesDropdown.fullData.find(d => d.ing_id === ing.ing_id) || listesDropdown.fullData.find(d => d.nom_UC === ing.nom) || {};
    const inciVal    = (inciObj.inci || '').trim();
    return `
    <div class="ingredient-rangee">
      <select class="form-ctrl ing-type" onchange="ingredientsRecette[${i}].type=this.value; ingredientsRecette[${i}].nom=''; rafraichirListeIngredientsRecette()">
        <option value="">— Type —</option>
     ${cats.map(t => `<option value="${t}" ${ing.type===t?'selected':''}>${listesDropdown.categoriesMap?.[t]||t}</option>`).join('')}
      </select>
      <select class="form-ctrl ing-nom" onchange="ingredientsRecette[${i}].nom=this.value; ingredientsRecette[${i}].ing_id=(listesDropdown.fullData.find(d=>d.nom_UC===this.value)||{}).ing_id||''; rafraichirListeIngredientsRecette()">
        <option value="">— Ingrédient —</option>
        ${ingsDeType.map(d => `<option value="${d.nom_UC}" ${ing.nom===d.nom_UC?'selected':''}>${d.nom_UC}</option>`).join('')}
      </select>
      <input type="text" class="form-ctrl ing-inci${inciVal ? '' : ' ing-inci-manquant'}" readonly placeholder="INCI manquant" value="${inciVal}">
      <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${ing.quantite||''}" placeholder="g" onchange="ingredientsRecette[${i}].quantite=parseFloat(this.value)||0">
      <button class="bouton bouton-petit bouton-rouge" onclick="supprimerIngredientRecette(${i})">✕</button>
    </div>`;
  }).join('');
}

// ─── INGRÉDIENTS DE BASE GAMME ───
var ingredientsBase = [];

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
  const cats = [...new Set(listesDropdown.fullData.map(d => d.cat_id))].filter(Boolean).sort();
  liste.innerHTML = ingredientsBase.map((ing, i) => {
    const ingsDeType = listesDropdown.fullData.filter(d => d.cat_id === ing.type);
    const inciVal    = (listesDropdown.fullData.find(d => d.nom_UC === ing.nom) || {}).inci || '';
    return `
    <div class="ingredient-rangee">
      <select class="form-ctrl ing-type" onchange="ingredientsBase[${i}].type=this.value; ingredientsBase[${i}].nom=''; rafraichirListeIngredientsBase()">
        <option value="">— Type —</option>
        ${cats.map(t => `<option value="${t}" ${ing.type===t?'selected':''}>${listesDropdown.categoriesMap?.[t]||t}</option>`).join('')}
      </select>
      <select class="form-ctrl ing-nom" onchange="ingredientsBase[${i}].nom=this.value; ingredientsBase[${i}].ing_id=(listesDropdown.fullData.find(d=>d.nom_UC===this.value)||{}).ing_id||''; rafraichirListeIngredientsBase()">
        <option value="">— Ingrédient —</option>
        ${ingsDeType.map(d => `<option value="${d.nom_UC}" ${ing.nom===d.nom_UC?'selected':''}>${d.nom_UC}</option>`).join('')}
      </select>
      <input type="text" class="form-ctrl ing-inci" readonly placeholder="INCI" value="${inciVal}">
      <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${ing.quantite||''}" placeholder="g" onchange="ingredientsBase[${i}].quantite=parseFloat(this.value)||0">
      <button class="bouton bouton-petit bouton-rouge" onclick="supprimerIngredientBase(${i})">✕</button>
    </div>`;
  }).join('');
}

async function chargerIngredientsBaseRecette() {
  const gam_id = document.getElementById('fr-ligne').value;
  if (!gam_id) { ingredientsBase = []; rafraichirListeIngredientsBase(); return; }
  const res = await appelAPI('getGammesIngredients', { gam_id });
  ingredientsBase = (res && res.success ? res.items : []).map(i => ({
    ing_id:   i.ing_id,
    type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
    nom:      i.nom_ingredient,
    quantite: i.quantite_g
  }));
  if (!document.getElementById('fr-id').value) {
    ingredientsRecette = [...ingredientsBase];
    rafraichirListeIngredientsRecette();
  }
  rafraichirListeIngredientsBase();
}

// ─── FORMATS PRODUIT ───
var formatsRecette = [];
var emballagesRecette = {}; // { "poids_unite": [{ing_id, nom, quantite}] }

function ajouterFormatRecette(poids='', unite='g', prix='', desc='') {
  formatsRecette.push({ poids, unite, prix, desc });
  rafraichirListeFormatsRecette();
}

function supprimerFormatRecette(index) {
  const f = formatsRecette[index];
  if (f) delete emballagesRecette[`${f.poids}_${f.unite}`];
  formatsRecette.splice(index, 1);
  rafraichirListeFormatsRecette();
}

function ajouterEmballageFormat(cle) {
  if (!emballagesRecette[cle]) emballagesRecette[cle] = [];
  emballagesRecette[cle].push({ ing_id: '', cat_id: '', nom: '', quantite: 0, nb_par_unite: 1 });
  rafraichirListeFormatsRecette();
}

function supprimerEmballageFormat(cle, idx) {
  if (emballagesRecette[cle]) emballagesRecette[cle].splice(idx, 1);
  rafraichirListeFormatsRecette();
}
function rafraichirListeFormatsRecette() {
  const liste = document.getElementById('liste-formats-recette');
  if (!liste) return;
  const labels = document.getElementById('labels-formats-recette');
  if (formatsRecette.length === 0) { liste.innerHTML = ''; if (labels) labels.classList.add('cache'); return; }
  if (labels) labels.classList.remove('cache');

  const catsEmb = ['CAT-1776180859522', 'CAT-1776369774938', 'CAT-014'];
  const ingsEmb = (listesDropdown.fullData || []).filter(d => catsEmb.includes(d.cat_id));

  liste.innerHTML = formatsRecette.map((f, i) => {
    const cle = `${f.poids}_${f.unite}`;
    const embs = emballagesRecette[cle] || [];
    const lignesEmb = embs.map((e, j) => {
        const catEmb = e.cat_id || catsEmb.find(c => (listesDropdown.fullData || []).find(d => d.ing_id === e.ing_id && d.cat_id === c)) || '';
        const ingsDecat = catEmb ? (listesDropdown.fullData || []).filter(d => d.cat_id === catEmb) : [];
        return `
        <div class="ingredient-rangee">
          <select class="form-ctrl" onchange="emballagesRecette['${cle}'][${j}].cat_id=this.value; rafraichirListeFormatsRecette()">
            <option value="">— Catégorie —</option>
            ${catsEmb.map(c => `<option value="${c}" ${catEmb===c?'selected':''}>${listesDropdown.categoriesMap?.[c]||c}</option>`).join('')}
          </select>
          <select class="form-ctrl" onchange="emballagesRecette['${cle}'][${j}].ing_id=this.value; emballagesRecette['${cle}'][${j}].nom=(listesDropdown.fullData.find(d=>d.ing_id===this.value)||{}).nom_UC||'';">
            <option value="">— Nom UC —</option>
            ${ingsDecat.map(d => `<option value="${d.ing_id}" ${d.ing_id===e.ing_id?'selected':''}>${d.nom_UC}</option>`).join('')}
          </select>
          <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${e.nb_par_unite||1}" placeholder="Nb/unité" onchange="emballagesRecette['${cle}'][${j}].nb_par_unite=parseFloat(this.value)||1">
          <button class="bouton bouton-petit bouton-rouge" onclick="supprimerEmballageFormat('${cle}',${j})">✕</button>
        </div>`;
      }).join('');

    return `
    <div class="ingredient-rangee">
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.poids||''}" placeholder="Poids" onchange="formatsRecette[${i}].poids=this.value">
      <select class="form-ctrl" onchange="formatsRecette[${i}].unite=this.value">
        <option value="g" ${f.unite==='g'?'selected':''}>g</option>
        <option value="ml" ${f.unite==='ml'?'selected':''}>ml</option>
      </select>
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.prix||''}" placeholder="Prix $" onchange="formatsRecette[${i}].prix=parseFloat(this.value)||0">
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.nb_unites||''}" placeholder="Nb unités" onchange="formatsRecette[${i}].nb_unites=parseInt(this.value)||0">
      <button class="bouton bouton-petit bouton-rouge" onclick="supprimerFormatRecette(${i})">✕</button>
    </div>
    <div class="ingredient-rangee" style="font-size:0.75rem;color:var(--gris);text-transform:uppercase;">
        <span style="flex:2">Catégorie</span>
        <span style="flex:2">Nom UC</span>
        <span style="width:90px;flex:none">Nb/unité</span>
      </div>
      ${lignesEmb}
      <button type="button" class="bouton bouton-petit bouton-vert-pale" onclick="ajouterEmballageFormat('${cle}')">+ Ajouter</button>
    </div>`;
  }).join('');
}
// CONFIG et appelAPI/appelAPIPost définis dans main.js

// ─── LISTES DROPDOWN V2 ───
var listesDropdown = { types: [], fullData: [], config: {}, fournisseurs: [], formats: [] };

function afficherChargement() {
  document.getElementById('overlay-chargement')?.classList.remove('cache');
}
function cacherChargement() {
  document.getElementById('overlay-chargement')?.classList.add('cache');
}

var toutesFactures = [];

async function chargerFactures() {
  const loading = document.getElementById('loading-factures');
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  if (loading) loading.classList.remove('cache');
  if (tableau) tableau.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  // V2 : getAchatsEntete
  const [resAch, resFour] = await Promise.all([
    appelAPI('getAchatsEntete'),
    appelAPI('getFournisseurs')
  ]);
  if (loading) loading.classList.add('cache');
  if (!resAch || !resAch.success) { afficherMsg('factures', 'Erreur lors du chargement.', 'erreur'); return; }

  const fournisseursMap = {};
  (resFour?.items || []).forEach(f => { fournisseursMap[f.four_id] = f.nom; });

  toutesFactures = (resAch.items || []).map(a => ({
    ...a,
    numero:      a.ach_id,
    fournisseur: fournisseursMap[a.four_id] || a.four_id || '—',
    dateRaw:     a.date ? a.date.split('/').reverse().join('-') : '',
    dateAff:     a.date || '—',
    total:       a.total,
    statut:      a.statut
  }));

  const selFourn    = document.getElementById('filtre-fournisseur');
  const fournisseurs = [...new Set(toutesFactures.map(f => f.fournisseur).filter(Boolean))].sort();
  selFourn.innerHTML = '<option value="">Tous les fournisseurs</option>';
  fournisseurs.forEach(f => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f; selFourn.appendChild(o);
  });

  afficherFactures(toutesFactures);
}

function filtrerFactures() {
  const fourn  = document.getElementById('filtre-fournisseur').value;
  const statut = document.getElementById('filtre-statut').value;
  const debut  = document.getElementById('filtre-date-debut').value;
  const fin    = document.getElementById('filtre-date-fin').value;
  const filtrees = toutesFactures.filter(f => {
    if (fourn  && f.fournisseur !== fourn) return false;
    if (statut && f.statut !== statut)     return false;
    if (debut  && f.dateRaw < debut)       return false;
    if (fin    && f.dateRaw > fin)         return false;
    return true;
  });
  afficherFactures(filtrees);
}

function reinitialiserFiltres() {
  document.getElementById('filtre-fournisseur').value  = '';
  document.getElementById('filtre-statut').value       = '';
  document.getElementById('filtre-date-debut').value   = '';
  document.getElementById('filtre-date-fin').value     = '';
  afficherFactures(toutesFactures);
}

function afficherFactures(liste) {
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  const tbody   = document.getElementById('tbody-factures');
  const compte  = document.getElementById('factures-compte');
  const totalEl = document.getElementById('factures-total');

  if (compte) compte.textContent = liste.length + ' facture' + (liste.length > 1 ? 's' : '');

  if (!liste.length) {
    if (tableau) tableau.classList.add('cache');
    if (vide)    vide.classList.remove('cache');
    if (totalEl) totalEl.classList.add('cache');
    return;
  }

  tbody.innerHTML = '';
  const triees = [...liste].sort((a, b) => (b.dateRaw || '').localeCompare(a.dateRaw || ''));
  triees.forEach(f => {
    const badge = f.statut === 'Finalisé'
      ? `<span class="badge-statut-ok">✓</span>`
      : `<span class="badge-statut-cours">●</span>`;
    const tr = document.createElement('tr');
    tr.className = 'cliquable';
    tr.onclick = () => voirDetailFacture(f.ach_id);
    tr.innerHTML = `
      <td>${f.fournisseur}</td>
      <td class="td-numero">${f.numero_facture || f.ach_id}</td>
      <td class="td-date">${f.dateAff}</td>
      <td class="td-prix">${f.total ? formaterPrix(f.total) : '—'}</td>
      <td>${badge}</td>`;
    tbody.appendChild(tr);
  });

  const total = triees.reduce((acc, f) => acc + (parseFloat(f.total) || 0), 0);
  if (totalEl) { totalEl.textContent = formaterPrix(total); totalEl.classList.remove('cache'); }

  if (vide)    vide.classList.add('cache');
  if (tableau) tableau.classList.remove('cache');
}

async function voirDetailFacture(ach_id) {
  if (!listesDropdown.fullData || !listesDropdown.fullData.length) {
    const resInci = await appelAPI('getIngredientsInci');
    if (resInci && resInci.success) listesDropdown.fullData = resInci.items || [];
  }
  const facture = toutesFactures.find(f => f.ach_id === ach_id);
  const modal   = document.getElementById('modal-facture');
  modal.classList.add('ouvert');
  document.getElementById('modal-facture-titre').textContent = 'Facture ' + (facture?.numero_facture || ach_id);
  document.getElementById('modal-facture-info').textContent  = facture ? facture.date + ' — ' + facture.fournisseur : '';
  document.getElementById('contenu-detail-facture').innerHTML = '';
  document.getElementById('loading-detail-facture').classList.remove('cache');

  // V2 : getAchatsLignes
  const res = await appelAPI('getAchatsLignes', { ach_id });
  document.getElementById('loading-detail-facture').classList.add('cache');

  if (!res || !res.success || !res.items.length) {
    document.getElementById('contenu-detail-facture').innerHTML = '<div class="vide"><div class="vide-titre">Aucun produit</div></div>';
    return;
  }

  let html = `
    <div class="tableau-wrap">
      <table>
        <thead>
          <tr><th>Ingrédient</th><th>Format</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr>
        </thead>
        <tbody>`;
  res.items.forEach(l => {
    const ing = listesDropdown.fullData.find(d => d.ing_id === l.ing_id);
    html += `
      <tr>
        <td style="font-weight:500">${ing?.nom_UC || l.ing_id}</td>
        <td style="color:var(--gris);font-size:0.78rem">${l.format_qte} ${l.format_unite}</td>
        <td>${l.quantite}</td>
        <td>${formaterPrix(l.prix_unitaire)}</td>
        <td style="color:var(--primary);font-weight:500">${formaterPrix(l.prix_total)}</td>
      </tr>`;
  });
  html += `</tbody></table></div>`;

  const sousTotal = res.items.reduce((s, l) => s + (l.prix_total || 0), 0);
  const tps       = facture ? parseFloat(facture.tps)       || 0 : 0;
  const tvq       = facture ? parseFloat(facture.tvq)       || 0 : 0;
  const livraison = facture ? parseFloat(facture.livraison) || 0 : 0;
  const total     = facture ? parseFloat(facture.total)     || 0 : sousTotal;

  html += `
    <div class="facture-totaux">
      <div class="facture-total-ligne">Sous-total <span>${formaterPrix(sousTotal)}</span></div>
      ${tps       ? `<div class="facture-total-ligne">TPS <span>${formaterPrix(tps)}</span></div>` : ''}
      ${tvq       ? `<div class="facture-total-ligne">TVQ <span>${formaterPrix(tvq)}</span></div>` : ''}
      ${livraison ? `<div class="facture-total-ligne">Livraison <span>${formaterPrix(livraison)}</span></div>` : ''}
      <div class="facture-total-ligne facture-total-final">Total <span>${formaterPrix(total)}</span></div>
    </div>
    <div class="form-actions">
      <button class="bouton bouton-rouge" onclick="fermerModalFacture(); supprimerFacture('${ach_id}')">Supprimer</button>
    </div>`;
  document.getElementById('contenu-detail-facture').innerHTML = html;
}

function fermerModalFacture() {
  document.getElementById('modal-facture').classList.remove('ouvert');
}

function supprimerFacture(ach_id) {
  confirmerAction('Supprimer cette facture et tous ses items ?', async () => {
    const res = await appelAPIPost('deleteAchat', { ach_id });
    if (res && res.success) {
      afficherMsg('factures', 'Facture supprimée.');
      chargerFactures();
    } else {
      afficherMsg('factures', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

/* ════════════════════════════════
   INVENTAIRE V2 (Stock)
════════════════════════════════ */
var donneesInventaire = [];

async function chargerInventaire() {
  const loading = document.getElementById('loading-inventaire');
  const contenu = document.getElementById('contenu-inventaire');
  const vide    = document.getElementById('vide-inventaire');
  if (loading) loading.classList.remove('cache');
  if (contenu) contenu.innerHTML = '';
  if (vide)    vide.classList.add('cache');

  // V2 : getStock
  if (!listesDropdown.categoriesMap || Object.keys(listesDropdown.categoriesMap).length === 0) {
    const resCats = await appelAPI('getCategoriesUC');
    if (resCats && resCats.success) {
      listesDropdown.categoriesMap = {};
      (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
    }
  }
 const res = await appelAPI('getStock');
  console.log('getStock result:', res);
  if (loading) loading.classList.add('cache');
  if (!res || !res.success) { afficherMsg('inventaire', 'Erreur.', 'erreur'); return; }

  const items = res.items || [];
  if (!items.length) { if (vide) vide.classList.remove('cache'); return; }

  // Regrouper par cat_id
  const parCat = {};
  items.forEach(item => {
    const cat = item.cat_id || 'Sans catégorie';
    if (!parCat[cat]) parCat[cat] = [];
    parCat[cat].push(item);
  });

 let html  = '';
  let total = 0;

  Object.keys(parCat).sort().forEach(cat => {
    const nomCat = listesDropdown.categoriesMap?.[cat] || cat;
    let lignes = '';
    parCat[cat].forEach(item => {
      total += (item.qte_g || 0) * (item.prix_par_g_reel || 0);
      lignes += `
        <tr>
          <td>${item.nom_UC || item.ing_id}</td>
          <td>${parseFloat(item.qte_g || 0).toFixed(0)} g</td>
          <td>${item.prix_par_g_reel ? parseFloat(item.prix_par_g_reel).toFixed(4) + ' $/g' : '—'}</td>
          <td>${item.date_derniere_maj || '—'}</td>
        </tr>`;
    });
    html += `
      <div class="form-panel visible">
        <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
          <div class="form-panel-titre">${nomCat}</div>
          <span class="badge-statut-ok">${parCat[cat].length} ingrédient(s)</span>
        </div>
        <div class="form-body inci-accord-body cache">
          <div class="tableau-wrap">
            <table class="tableau-admin">
              <thead><tr><th>Ingrédient</th><th>Stock (g)</th><th>Prix/g réel</th><th>Dernière màj</th></tr></thead>
              <tbody>${lignes}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  });

  html += `<div class="inv-total">
      <div class="inv-total-label">Valeur totale de l'inventaire</div>
      <div class="inv-total-montant">${formaterPrix(total)}</div>
    </div>`;
 donneesInventaire = items;
  if (contenu) contenu.innerHTML = html;

  const types = [...new Set(items.map(i => i.cat_id).filter(Boolean))].sort();
  const selType = document.getElementById('inv-filtre-type');
  if (selType) {
    const valType = selType.value;
    selType.innerHTML = '<option value="">Tous les types</option>' +
      types.map(t => `<option value="${t}">${listesDropdown.categoriesMap?.[t] || t}</option>`).join('');
    selType.value = valType;
  }
}

function filtrerInventaire() {
  const recherche  = (document.getElementById('inv-recherche')?.value || '').toLowerCase();
  const typeFiltre = document.getElementById('inv-filtre-type')?.value || '';
  const contenu    = document.getElementById('contenu-inventaire');
  if (!contenu || !donneesInventaire.length) return;
  const filtres = donneesInventaire.filter(i =>
    (!recherche  || (i.nom_UC || '').toLowerCase().includes(recherche)) &&
    (!typeFiltre || i.cat_id === typeFiltre)
  );
  const parCat = {};
  filtres.forEach(item => {
    const cat = item.cat_id || 'Sans catégorie';
    if (!parCat[cat]) parCat[cat] = [];
    parCat[cat].push(item);
  });
 
let html  = '';
  let total = 0;
  Object.keys(parCat).sort().forEach(cat => {
    const nomCat = listesDropdown.categoriesMap?.[cat] || cat;
    let lignes = '';
    parCat[cat].forEach(item => {
      total += (item.qte_g || 0) * (item.prix_par_g_reel || 0);
      lignes += `<tr><td>${item.nom_UC || item.ing_id}</td><td>${parseFloat(item.qte_g || 0).toFixed(0)} g</td><td>${item.prix_par_g_reel ? parseFloat(item.prix_par_g_reel).toFixed(4) + ' $/g' : '—'}</td><td>${item.date_derniere_maj || '—'}</td></tr>`;
    });
    html += `
      <div class="form-panel visible">
        <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
          <div class="form-panel-titre">${nomCat}</div>
          <span class="badge-statut-ok">${parCat[cat].length} ingrédient(s)</span>
        </div>
        <div class="form-body inci-accord-body cache">
          <div class="tableau-wrap">
            <table class="tableau-admin">
              <thead><tr><th>Ingrédient</th><th>Stock (g)</th><th>Prix/g réel</th><th>Dernière màj</th></tr></thead>
              <tbody>${lignes}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  });
  html += `<div class="inv-total"><div class="inv-total-label">Valeur totale de l'inventaire</div><div class="inv-total-montant">${formaterPrix(total)}</div></div>`;
 contenu.innerHTML = html;
}

function reinitialiserFiltresInventaire() {
  const el = document.getElementById('inv-recherche');
  if (el) el.value = '';
  filtrerInventaire();
}

/* ════════════════════════════════
   PAGE INCI V2
════════════════════════════════ */
var inciDonnees      = [];
var inciCategoriesUC = [];

async function chargerInci() {
  document.getElementById('loading-inci').classList.remove('cache');
  document.getElementById('inci-accordeons').innerHTML = '';

  // V2 : getIngredientsInci + getCategoriesUC
  const [resInci, resUC] = await Promise.all([
    appelAPI('getIngredientsInci'),
    appelAPI('getCategoriesUC')
  ]);

  if (resInci && resInci.success) {
    listesDropdown.fullData = resInci.items || [];
    listesDropdown.types    = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean);
    inciDonnees = resInci.items;
  }
  inciCategoriesUC = (resUC && resUC.success) ? resUC.items : [];

  document.getElementById('loading-inci').classList.add('cache');
  inciConstruireAccordeons();
}

function inciAppliquerFiltres(btn, groupe) {
  if (btn && groupe) {
    document.querySelectorAll(`[data-filtre-${groupe}]`).forEach(b => b.classList.remove('actif'));
    btn.classList.add('actif');
  }
  inciConstruireAccordeons();
}

function inciGetFiltres() {
  const recherche = document.getElementById('inci-recherche');
  return { recherche: recherche ? recherche.value.trim().toLowerCase() : '' };
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

  // Regrouper par cat_id
  const parCat = {};
const filtreStatut = document.querySelector('[data-filtre-statut].actif')?.dataset?.filtreStatut || 'tout';
  const filtreSource = document.querySelector('[data-filtre-source].actif')?.dataset?.filtreSource || 'tout';

  inciDonnees.forEach(l => {
    if (recherche && !(l.nom_UC || '').toLowerCase().includes(recherche)) return;
    const catsSansInci = ['CAT-1776369774938', 'CAT-1776641557249', 'CAT-014'];
    const exempteSansInci = catsSansInci.includes(l.cat_id);
    if (filtreStatut === 'a-valider' && (l.inci || exempteSansInci)) return;
    if (filtreStatut === 'valide'    && !l.inci && !exempteSansInci) return;
    if (filtreSource !== 'tout'      && l.source !== filtreSource) return;
    const catObj = inciCategoriesUC.find(c => c.cat_id === l.cat_id);
    const cat = catObj?.nom || l.cat_id || 'Sans catégorie';
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
    const lignes     = parCat[cat];
    const nbInci     = lignes.filter(l => l.inci).length;
    const nbSansInci = lignes.length - nbInci;

    const bloc = document.createElement('div');
    bloc.className = 'form-panel visible';
    bloc.dataset.cat = cat;
    bloc.innerHTML = `
      <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
        <div class="form-panel-titre">${cat}</div>
        <div style="display:flex;gap:8px;align-items:center">
          ${nbSansInci > 0 && !['CAT-1776369774938', 'CAT-1776641557249', 'CAT-014'].includes(lignes[0]?.cat_id) ? `<span class="badge-statut-cours">${nbSansInci} 🔴</span>` : ''}
          <span class="badge-statut-ok">${nbInci} ✅</span>
        </div>
      </div>
      <div class="form-body inci-accord-body cache">
        <div class="tableau-wrap">
          <table class="tableau-admin tableau-inci">
            <tbody>
              ${lignes.sort((a,b) => (a.nom_UC||'').localeCompare(b.nom_UC||'','fr')).map((l, i) => inciRendreLigne(l, cat, `${idx}-${i}`)).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    container.appendChild(bloc);
  });
}

function inciRendreLigne(l, cat, uid) {
  const catsSansInci2 = ['CAT-1776369774938', 'CAT-1776641557249', 'CAT-014'];
  const aInci      = !!l.inci || catsSansInci2.includes(l.cat_id);
  const statutLabel = aInci ? '✅' : '🔴';
  const id         = `inci-${uid}`;
  const nomSafe    = (l.nom_UC || '').replace(/'/g, "\\'");
  const catSafe    = cat.replace(/'/g, "\\'");
  return `
    <tr class="ligne-cliquable" onclick="inciToggleDetail('${id}')">
      <td>${l.nom_UC || l.ing_id}</td>
      <td>${l.nom_fournisseur || ''}</td>
      <td>${l.inci || ''}</td>
      <td><span>${statutLabel}</span></td>
    </tr>
    <tr class="accordeon-detail cache" id="${id}-detail" data-ing-id="${l.ing_id || ''}">
      <td colspan="4">
        <div class="form-groupe">
          <label class="form-label">INCI</label>
          <textarea class="form-ctrl" id="${id}-inci" rows="3">${(l.inci || '').replace(/</g, '&lt;')}</textarea>
        </div>
        <div class="form-groupe">
          <label class="form-label">Nom botanique</label>
          <input type="text" class="form-ctrl" id="${id}-bot" value="${(l.nom_botanique || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-groupe">
          <label class="form-label">Note olfactive</label>
          <input type="text" class="form-ctrl" id="${id}-note" value="${(l.note_olfactive || '').replace(/"/g, '&quot;')}">
        </div>
        ${l.source ? `<div class="form-groupe">
          <label class="form-label">Données fournisseur</label>
          <textarea class="form-ctrl" id="${id}-scraping" rows="4" readonly placeholder="Chargement…"></textarea>
        </div>` : ''}
        <hr class="separateur">
        <div class="form-actions">
          <span></span>
          <button class="bouton bouton-petit" onclick="inciValider('${id}','${nomSafe}','${catSafe}','${l.ing_id||''}')">Sauvegarder</button>
        </div>
      </td>
    </tr>`;
}

async function inciToggleDetail(id) {
  const detail = document.getElementById(`${id}-detail`);
  if (!detail) return;
  const estOuvert = !detail.classList.contains('cache');
  document.querySelectorAll('.accordeon-detail').forEach(d => { if (d !== detail) d.classList.add('cache'); });
  detail.classList.toggle('cache', estOuvert);
  if (estOuvert) return;
  const ing = listesDropdown.fullData.find(d => d.ing_id === detail.dataset.ingId);
  if (!ing || !ing.source) return;
  const zoneScraping = document.getElementById(`${id}-scraping`);
  if (!zoneScraping || zoneScraping.dataset.charge === 'true') return;
  zoneScraping.textContent = 'Recherche en cours…';
  const res = await appelAPI('rechercherScraping', { source: ing.source, nom_UC: ing.nom_fournisseur || ing.nom_UC });
  if (!res || !res.success || !res.found) { zoneScraping.textContent = 'Aucune donnée de scraping trouvée.'; return; }
  zoneScraping.dataset.charge = 'true';
  if (res.inci && !document.getElementById(`${id}-inci`).value) document.getElementById(`${id}-inci`).value = res.inci;
  if (res.nom_botanique && !document.getElementById(`${id}-bot`).value) document.getElementById(`${id}-bot`).value = res.nom_botanique;
  zoneScraping.textContent = res.texte_brut || 'Aucun texte brut disponible.';
}

function inciToggleAccordeon(header) {
  const body = header.nextElementSibling;
  const estOuvert = !body.classList.contains('cache');
  document.querySelectorAll('.inci-accord-body').forEach(b => { if (b !== body) b.classList.add('cache'); });
  body.classList.toggle('cache', estOuvert);
  if (!estOuvert) setTimeout(() => header.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

async function inciValider(id, nom_UC, cat_id, ing_id) {
  const inci          = document.getElementById(`${id}-inci`)?.value  || '';
  const nomBotanique  = document.getElementById(`${id}-bot`)?.value   || '';
  const noteOlfactive = document.getElementById(`${id}-note`)?.value  || '';
  if (!ing_id) { afficherMsg('inci', 'Ingrédient introuvable.', 'erreur'); return; }
  const res = await appelAPIPost('saveIngredientInci', { ing_id, inci, nom_botanique: nomBotanique, note_olfactive: noteOlfactive, statut: '✅ Validé' });
  if (res && res.success) {
    afficherMsg('inci', '✅ INCI sauvegardé.');
    listesDropdown.fullData = listesDropdown.fullData.map(d => d.ing_id === ing_id ? { ...d, inci, nom_botanique: nomBotanique, note_olfactive: noteOlfactive, statut: '✅ Validé' } : d);
    document.getElementById(`${id}-detail`)?.classList.add('cache');
    await chargerInci();
  } else {
    afficherMsg('inci', res?.message || 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

/* ════════════════════════════════
   DENSITÉS V2
════════════════════════════════ */
var donneesDensites = [];

async function chargerDensites() {
  const loading = document.getElementById('loading-densites');
  const tableau = document.getElementById('tableau-densites');
  const vide    = document.getElementById('vide-densites');
  if (loading) loading.classList.remove('cache');
  if (tableau) tableau.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  // V2 : getConfig
  if (!listesDropdown.categoriesMap || Object.keys(listesDropdown.categoriesMap).length === 0) {
  const resCats = await appelAPI('getCategoriesUC');
  if (resCats && resCats.success) {
    listesDropdown.categoriesMap = {};
    (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
  }
}
const res = await appelAPI('getConfig');
  if (loading) loading.classList.add('cache');
  if (!res || !res.success) { afficherMsg('densites', 'Erreur.', 'erreur'); return; }
  donneesDensites = res.items || [];

  if (!donneesDensites.length) { if (vide) vide.classList.remove('cache'); return; }

  const tbody = document.getElementById('tbody-densites');
  tbody.innerHTML = '';
  donneesDensites.forEach(d => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
  tr.onclick = () => modifierDensite(d.cat_id);
tr.innerHTML = `
      <td>${listesDropdown.categoriesMap?.[d.cat_id] || d.cat_id}</td>
      <td>${parseFloat(d.densite).toFixed(3)}</td>
      <td>${d.unite}</td>
      <td>${d.marge_perte_pct ? parseFloat(d.marge_perte_pct).toFixed(1) + ' %' : '—'}</td>`;
    tbody.appendChild(tr);
  });
  if (tableau) tableau.classList.remove('cache');
}

function ouvrirFormDensite() {
  document.getElementById('form-densites-titre').textContent = 'Nouveau type';
  document.getElementById('fd-mode').value        = 'ajout';
  document.getElementById('fd-type').value        = '';
  document.getElementById('fd-densite').value     = '';
  document.getElementById('fd-unite').value       = 'ml';
  document.getElementById('fd-marge-perte').value = '';
  const selType = document.getElementById('fd-type');
selType.innerHTML = '<option value="">— Choisir —</option>';
Object.keys(listesDropdown.categoriesMap || {}).sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr')).forEach(k => {
  const opt = document.createElement('option');
  opt.value = k; opt.textContent = listesDropdown.categoriesMap[k];
  selType.appendChild(opt);
});
  document.getElementById('form-densites').classList.add('visible');
  document.getElementById('fd-type').focus();
}

function fermerFormDensite() {
  document.getElementById('form-densites').classList.remove('visible');
  document.getElementById('btn-nouvelle-densite').classList.remove('cache');
}

function modifierDensite(cat_id) {
  const d = donneesDensites.find(x => x.cat_id === cat_id);
  if (!d) return;
  document.getElementById('form-densites-titre').textContent = 'Modifier la densité';
  document.getElementById('fd-mode').value        = 'modif';
  
  const selType2 = document.getElementById('fd-type');
selType2.innerHTML = '<option value="">— Choisir —</option>';
Object.keys(listesDropdown.categoriesMap || {}).sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr')).forEach(k => {
  const opt = document.createElement('option');
  opt.value = k; opt.textContent = listesDropdown.categoriesMap[k];
  selType2.appendChild(opt);
});
selType2.value = d.cat_id;
document.getElementById('fd-densite').value     = d.densite;
document.getElementById('fd-unite').value       = d.unite;
document.getElementById('fd-marge-perte').value = d.marge_perte_pct || '';
  
  
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
  // V2 : saveConfig
  const res = await appelAPIPost('saveConfig', { cat_id: type, densite, unite, marge_perte_pct });
  if (res && res.success) {
    fermerFormDensite();
    afficherMsg('densites', mode === 'modif' ? 'Densité mise à jour.' : 'Type ajouté.');
    listesDropdown.config[type] = { densite, unite, margePertePct: marge_perte_pct };
    donneesDensites = [];
    chargerDensites();
  } else {
    afficherMsg('densites', res?.message || 'Erreur.', 'erreur');
  }
}

/* ════════════════════════════════
   CONTENU DU SITE V2
════════════════════════════════ */
async function chargerContenuSite() {
  const loading = document.getElementById('loading-contenu-site');
  const corps   = document.getElementById('corps-contenu-site');
  if (loading) loading.classList.remove('cache');
  if (corps)   corps.classList.add('cache');
  // V2 : getContenu
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
    btnSaisonnier.classList.toggle('bouton', actif);
    btnSaisonnier.classList.toggle('bouton-vert-pale', !actif);
  }
  if (corps) corps.classList.remove('cache');
}

async function toggleModeSaisonnier() {
  const res    = await appelAPI('getContenu');
  if (!res || !res.success) return;
  const actuel = res.contenu.mode_saisonnier || 'non';
  const nouveau = actuel === 'oui' ? 'non' : 'oui';
  const data   = await appelAPIPost('updateContenu', { contenu: { mode_saisonnier: nouveau } });
  if (data && data.success) {
    document.getElementById('btn-mode-saisonnier').textContent = nouveau === 'oui' ? '🌲 Mode saisonnier ON' : '🌲 Mode saisonnier OFF';
    document.getElementById('btn-mode-saisonnier').classList.toggle('btn-primary', nouveau === 'oui');
    document.getElementById('btn-mode-saisonnier').classList.toggle('bouton-vert-pale', nouveau !== 'oui');
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

/* ════════════════════════════════
   FABRICATION V2
════════════════════════════════ */
async function chargerFabrication() {
  document.getElementById('loading-fabrication').classList.remove('cache');
  document.getElementById('contenu-fabrication').innerHTML = '';
  // V2 : getLots
  const res = await appelAPI('getLots');
  document.getElementById('loading-fabrication').classList.add('cache');
  if (!res || !res.success) { afficherMsg('fabrication', '❌ Erreur de chargement.'); return; }
  afficherTableauFabrication(res.items || []);
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
  const totalDisponibles = disponibles.reduce((s, l) => s + l.nb_unites, 0);
  const totalEpuises     = epuises.reduce((s, l) => s + l.nb_unites, 0);

  function grouperParCollection(liste) {
    const groupes = {};
    liste.forEach(l => {
      const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
      const col = pro ? (donneesCollections.find(c => c.col_id === pro.col_id)?.nom || '—') : '—';
      const gam = pro ? (donneesGammes.find(g => g.gam_id === pro.gam_id)?.nom || '—') : '—';
      const cle = col + '||' + gam;
      if (!groupes[cle]) groupes[cle] = { collection: col, gamme: gam, lots: [] };
      groupes[cle].lots.push(l);
    });
    return Object.values(groupes).sort((a, b) => a.collection.localeCompare(b.collection) || a.gamme.localeCompare(b.gamme));
  }

  function rendreBlocStatut(titre, total, liste, colonnes, rendreLigne) {
    let h = `<div class="carte-admin">
      <div class="carte-admin-entete">${titre} <span class="texte-secondaire">${total} savon${total !== 1 ? 's' : ''}</span></div>`;
    if (liste.length === 0) {
      h += `<div class="texte-secondaire" style="padding:12px 0">Aucun lot</div>`;
    } else {
      const groupes = grouperParCollection(liste);
      groupes.forEach(g => {
        const totalGroupe = g.lots.reduce((s, l) => s + l.nb_unites, 0);
        h += `<div class="form-panel visible" style="margin:8px 0">
          <div class="form-panel-header" onclick="fabToggleAccordeon(this)" style="cursor:pointer">
            <div class="form-panel-titre">${g.collection} — ${g.gamme}</div>
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
    ['Produit', 'Fabriqué le', 'Disponible le', 'Unités'],
    l => {
      const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
      return `<tr><td>${pro?.nom || l.pro_id}</td><td>${l.date_fabrication}</td><td>${l.date_disponibilite}</td><td>${l.nb_unites}</td></tr>`;
    }
  );
  html += rendreBlocStatut('DISPONIBLE', totalDisponibles, disponibles,
    ['Produit', 'Disponible le', 'Unités', 'Coût/unité'],
    l => {
      const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
      return `<tr><td>${pro?.nom || l.pro_id}</td><td>${l.date_disponibilite}</td><td>${l.nb_unites}</td><td>${l.cout_par_unite ? parseFloat(l.cout_par_unite).toFixed(2) + ' $' : '—'}</td></tr>`;
    }
  );
  html += rendreBlocStatut('ÉPUISÉ', totalEpuises, epuises,
    ['Produit', 'Fabriqué le', 'Unités', 'Coût/unité'],
    l => {
      const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
      return `<tr><td>${pro?.nom || l.pro_id}</td><td>${l.date_fabrication}</td><td>${l.nb_unites}</td><td>${l.cout_par_unite ? parseFloat(l.cout_par_unite).toFixed(2) + ' $' : '—'}</td></tr>`;
    }
  );
  document.getElementById('contenu-fabrication').innerHTML = html;
}

function ouvrirFormFabrication(existant) {
  const selectCol = document.getElementById('fab-collection');
  selectCol.innerHTML = '<option value="">— Choisir une collection —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.col_id; opt.textContent = c.nom;
    selectCol.appendChild(opt);
  });
  document.getElementById('fab-recette').innerHTML = '<option value="">— Choisir un produit —</option>';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fab-date').value = existant ? '' : today;
  document.querySelector('#form-fabrication .form-panel-titre').textContent = existant ? 'Entrer un lot existant' : 'Nouveau lot';
  document.getElementById('fab-groupe-multiplicateur').classList.toggle('cache', !!existant);
  document.getElementById('fab-groupe-nb-unites').classList.toggle('cache', !existant);
  document.getElementById('form-fabrication').dataset.mode = existant ? 'existant' : 'nouveau';
  document.getElementById('fab-apercu').classList.add('cache');
  document.getElementById('contenu-fabrication').classList.add('cache');
  document.getElementById('form-fabrication').classList.remove('cache');
}

function fabFiltrerRecettes() {
  const col_id = document.getElementById('fab-collection').value;
  const select = document.getElementById('fab-recette');
  select.innerHTML = '<option value="">— Choisir un produit —</option>';
  const produits = donneesProduits
    .filter(p => p.statut !== 'archive' && (!col_id || p.col_id === col_id))
    .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
  produits.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.pro_id;
    opt.textContent = p.nom;
    opt.dataset.nbUnites = p.nb_unites || 1;
    opt.dataset.cure     = p.cure || 0;
    select.appendChild(opt);
  });
  document.getElementById('fab-apercu').classList.add('cache');
}

function fabFiltrerFormats() {
  const pro_id = document.getElementById('fab-recette').value;
  const select = document.getElementById('fab-format');
  select.innerHTML = '<option value="">— Choisir un format —</option>';
  if (!pro_id) return;
  appelAPI('getProduitsFormats', { pro_id }).then(res => {
    if (!res || !res.success) return;
    (res.items || []).forEach(f => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ poids: f.poids, unite: f.unite, prix: f.prix_vente });
      opt.textContent = f.poids + ' ' + f.unite + (f.prix_vente ? ' — ' + parseFloat(f.prix_vente).toFixed(2) + ' $' : '');
      select.appendChild(opt);
    });
  });
  calculerApercuLot();
}

function fermerFormFabrication() {
  document.getElementById('form-fabrication').classList.add('cache');
  document.getElementById('contenu-fabrication').classList.remove('cache');
  document.getElementById('fab-collection').value = '';
  document.getElementById('fab-recette').innerHTML = '<option value="">— Choisir un produit —</option>';
  document.getElementById('fab-multiplicateur').value = '1';
  document.getElementById('fab-nb-unites').value = '';
  document.getElementById('fab-apercu').classList.add('cache');
  afficherMsg('fabrication', '');
}

function calculerApercuLot() {
  const select = document.getElementById('fab-recette');
  const opt    = select.options[select.selectedIndex];
  if (!opt || !opt.value) { document.getElementById('fab-apercu').classList.add('cache'); return; }
  const mode     = document.getElementById('form-fabrication').dataset.mode;
  const multi    = parseInt(document.getElementById('fab-multiplicateur').value) || 1;
  const nbUnites = mode === 'existant'
    ? parseInt(document.getElementById('fab-nb-unites').value) || 0
    : (parseInt(opt.dataset.nbUnites) || 1) * multi;
  const cure    = parseInt(opt.dataset.cure) || 0;
  const dateFab = document.getElementById('fab-date').value;
  let dateDispo = '—';
  if (dateFab) { const d = new Date(dateFab); d.setDate(d.getDate() + cure); dateDispo = d.toISOString().split('T')[0]; }
  document.getElementById('fab-apercu-unites').textContent = nbUnites + ' unité(s)';
  document.getElementById('fab-apercu-dispo').textContent  = dateDispo;
  document.getElementById('fab-apercu-cout').textContent   = '—';
  document.getElementById('fab-apercu').classList.remove('cache');
}

async function sauvegarderLot() {
  const select = document.getElementById('fab-recette');
  const opt    = select.options[select.selectedIndex];
  if (!opt || !opt.value) { afficherMsg('fabrication', '❌ Choisir un produit.'); return; }

  const mode     = document.getElementById('form-fabrication').dataset.mode;
  const multi    = parseInt(document.getElementById('fab-multiplicateur').value) || 1;
  const nbUnites = mode === 'existant'
    ? parseInt(document.getElementById('fab-nb-unites').value) || 0
    : (parseInt(opt.dataset.nbUnites) || 1) * multi;
  const cure    = parseInt(opt.dataset.cure) || 0;
  const dateFab = document.getElementById('fab-date').value;
  if (!dateFab) { afficherMsg('fabrication', '❌ Date de fabrication requise.'); return; }

  const d = new Date(dateFab);
  d.setDate(d.getDate() + cure);
  const dateDispo = d.toISOString().split('T')[0];

  const selFormat = document.getElementById('fab-format');
  const formatVal = selFormat?.value ? JSON.parse(selFormat.value) : {};
  const lot_id = 'LOT-' + Date.now();
  const res = await appelAPIPost('saveLot', {
    lot_id,
    pro_id:             opt.value,
    multiplicateur:     multi,
    nb_unites:          nbUnites,
    date_fabrication:   dateFab,
    date_disponibilite: dateDispo,
    format_poids:       formatVal.poids || '',
    format_unite:       formatVal.unite || '',
    cout_ingredients:   0,
    cout_emballages:    0,
    cout_revient_total: 0,
    cout_par_unite:     0
  });

  if (res && res.success) {
    fermerFormFabrication();
    chargerFabrication();
  } else {
    afficherMsg('fabrication', '❌ ' + (res?.message || 'Erreur.'));
  }
}

// ─── COÛT DE REVIENT ───

function calculerCoutRevient(ingredients) {
  const stock  = listesDropdown.stock  || [];
  const config = listesDropdown.config || {};

  let total = 0;
  ingredients.forEach(ing => {
    const stockItem = stock.find(s => s.ing_id === ing.ing_id);
    if (!stockItem) return;

    const prixParG = stockItem.prix_par_g_reel || 0;
    const cat_id   = stockItem.cat_id || '';
    const cfg      = config[cat_id] || {};
    const perte    = cfg.margePertePct || 0;
    const facteur  = 1 + (perte / 100);

    total += (ing.quantite_g || 0) * prixParG * facteur;
  });

  // Structure ouverte pour bonifier plus tard :
  // total += coutEmballages;
  // total += coutMainOeuvre;

  return total;
}

// ─── FONCTIONS INCI RESTANTES (compatibilité HTML) ───
function inciRendreUC() {
  if (inciCategoriesUC.length === 0) {
    return `<p class="form-valeur">Aucune catégorie définie.</p>
      <button class="bouton bouton-petit bouton-vert-pale" onclick="inciAjouterUC()">+ Ajouter une catégorie</button>`;
  }
  const cartes = [...inciCategoriesUC].sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).map((c, i) => {
    const utilise = (listesDropdown.fullData || []).filter(d => d.cat_id === c.cat_id);
    return `
      <div class="carte-admin">
        <div class="carte-admin-entete">
          <input type="text" class="form-ctrl" id="uc-cat-${i}" value="${(c.nom || '').replace(/"/g, '&quot;')}">
          <div class="td-actions">
            <button class="btn-edit" onclick="inciModifierUC(${i}, '${c.cat_id}')">Modifier</button>
            ${utilise.length === 0 ? `<button class="btn-suppr" onclick="inciSupprimerUC('${c.cat_id}')">Supprimer</button>` : ''}
          </div>
        </div>
        <div class="texte-secondaire">${utilise.length} ingrédient(s)</div>
      </div>`;
  }).join('');
  return `
    ${cartes}
    <hr class="separateur">
    <div class="form-actions">
      <button class="bouton bouton-petit bouton-vert-pale" onclick="inciAjouterUC()">+ Ajouter une catégorie</button>
    </div>`;
}

function inciAjouterUC() {
  inciCategoriesUC.push({ cat_id: null, nom: '' });
  document.getElementById('inci-uc-body').innerHTML = inciRendreUC();
  const input = document.getElementById(`uc-cat-${inciCategoriesUC.length - 1}`);
  if (input) input.focus();
}

async function inciModifierUC(i, cat_id) {
  const input = document.getElementById(`uc-cat-${i}`);
  const nom   = (input?.value || '').trim();
  if (!nom) { afficherMsg('inci', 'Le nom est requis.', 'erreur'); return; }
  const res = await appelAPIPost('saveCategorieUC', { cat_id, nom });
  if (res && res.success) {
    afficherMsg('inci', cat_id ? 'Catégorie mise à jour.' : 'Catégorie ajoutée.');
    await chargerInci();
  } else {
    afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
  }
}

async function inciSupprimerUC(cat_id) {
  confirmerAction('Supprimer cette catégorie ?', async () => {
    const res = await appelAPIPost('deleteCategorieUC', { cat_id });
    if (res && res.success) {
      afficherMsg('inci', 'Catégorie supprimée.');
      await chargerInci();
    } else {
      afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
    }
  });
}
function inciRendreCorrespondance()    { return ''; }
function inciAjouterCorrespondance()   {}
function inciToggleNouvelleCategorie() {}
async function inciConfirmerCorrespondance() {}
async function inciSauvegarderCorrespondance() {}
function inciAjouterNomUC()            {}
function fermerModalNomUC()            {}
async function confirmerModalNomUC()   {}
function inciRechercher()              {}
function retourRecetteDepuisInci()     { afficherSection('produits', null); }
function ajouterIngredientInci()       {}
function fermerModalAjouterInci()      { document.getElementById('modal-ajouter-inci')?.classList.remove('ouvert'); }
async function modalInciGo() {
  const modal      = document.getElementById('modal-ajouter-inci');
  const idx        = modal?.dataset.idx;
  const fournisseur = modal?.dataset.fournisseur;
  const nom        = document.getElementById('modal-inci-nom')?.value.trim();
  const inci       = document.getElementById('modal-inci-inci')?.value.trim();
  const cat        = document.getElementById('if-type-' + idx)?.value;
  if (!nom) { afficherMsg('import-facture', 'Le nom est requis.', 'erreur'); return; }
  if (!cat) { afficherMsg('import-facture', 'Choisir une catégorie dans le tableau.', 'erreur'); return; }
  const ing_id = 'ING-' + Date.now();
  const res = await appelAPIPost('createIngredientInci', { ing_id, cat_id: cat, nom_UC: nom, nom_fournisseur: nom, inci: inci || '', statut: 'actif' });
  if (!res || !res.success) { afficherMsg('import-facture', res?.message || 'Erreur création ingrédient.', 'erreur'); return; }
  listesDropdown.fullData.push({ ing_id, cat_id: cat, nom_UC: nom, inci: inci || '' });
  const item = ifItems[idx];
  if (fournisseur && item) {
    await appelAPIPost('saveMappingFournisseur', {
      fournisseur,
      categorie_fournisseur: listesDropdown.categoriesMap?.[cat] || cat,
      nom_fournisseur:       item.description,
      categorie_UC:          listesDropdown.categoriesMap?.[cat] || cat,
      nom_UC:                nom,
      ing_id
    });
    ifMapping.push({ fournisseur, categorie_fournisseur: listesDropdown.categoriesMap?.[cat] || cat, nom_fournisseur: item.description, categorie_UC: listesDropdown.categoriesMap?.[cat] || cat, nom_UC: nom, ing_id });
  }
  const select = document.getElementById(`if-nomuc-${idx}`);
  if (select) {
    const opt = document.createElement('option');
    opt.value = nom; opt.textContent = nom; opt.selected = true;
    select.appendChild(opt);
  }
  const tr = document.getElementById(`if-nomuc-${idx}`)?.closest('tr');
  if (tr) tr.classList.remove('ligne-rouge');
  fermerModalAjouterInci();
  afficherMsg('import-facture', `✅ "${nom}" créé et mappé.`);
}
function modalInciToggleChamps()       {}
function modalInciSyncNomUC()         {}
function afficherStatutModalInci()     {}

// ─── FONCTIONS IMPORT MD (conservées mais désactivées en V2) ───
function importParserMD()    { afficherMsg('import-recettes', 'Import MD non disponible en V2.', 'erreur'); }
async function importEnvoyer() {}
function importApercuCouleur() {}
function importLireFichier()   {}
async function importEnLot()   {}
function importAnnuler()       { document.getElementById('import-apercu-zone')?.classList.add('cache'); }
function importDevinerType()   { return ''; }
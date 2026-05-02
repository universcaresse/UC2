/* UNIVERS CARESSE — admin.js */

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
async function chargerDonneesInitiales() {
const [resCol, resGam, resFam, resPro, resInci, resCfg, resCats, resFmt, resPromo, resRegro] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getGammes'),
    appelAPI('getFamilles'),
    appelAPI('getProduits'),
    appelAPI('getIngredientsInci'),
    appelAPI('getConfig'),
    appelAPI('getCategoriesUC'),
    appelAPI('getProduitsFormats'),
    appelAPI('getPromotions'),
    appelAPI('getRegroupements')
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
           ((donneesFamilles.find(f => f.fam_id === a.fam_id)?.rang || 99) - (donneesFamilles.find(f => f.fam_id === b.fam_id)?.rang || 99)) ||
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

  if (resPromo && resPromo.success) {
    donneesPromotions = resPromo.items || [];
  }
  if (resRegro && resRegro.success) {
    donneesRegroupements = resRegro.items || [];
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
  if (id === 'promotions')     chargerPromotions();
  if (id === 'regroupements')  afficherRegroupements();
  if (id === 'inventaire')     { const r = document.getElementById('inv-recherche'); if (r) r.value = ''; chargerInventaire(); }
  if (id === 'factures')       { reinitialiserFiltres(); chargerFactures(); }
if (id === 'fournisseurs')   afficherFournisseurs();
  if (id === 'contenu-site')   chargerContenuSite();
if (id === 'redaction')      redInit();
  if (id === 'mediatheque')    chargerMediatheque();
  if (id === 'inventaire-production') { afficherSection('inventaire', null); return; }
  if (id === 'ventes')        { chargerVentes(); }
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

function confirmerAction(message, callback) {
  document.getElementById('modal-confirm-message').textContent = message;
  document.getElementById('modal-confirm-btn').onclick = () => { fermerModalConfirm(); callback(); };
  document.getElementById('modal-confirm').classList.add('ouvert');
}

function fermerModalConfirm() {
  document.getElementById('modal-confirm').classList.remove('ouvert');
}

// CONFIG et appelAPI/appelAPIPost définis dans main.js

// ─── LISTES DROPDOWN V2 ───

var squareAppId = '';

var listesDropdown = { types: [], fullData: [], config: {}, fournisseurs: [], formats: [] };
const CATS_SANS_INCI = ['CAT-1776369774938', 'CAT-1776641557249', 'CAT-014'];

function afficherChargement() {
  document.getElementById('overlay-chargement')?.classList.remove('cache');
}
function cacherChargement() {
  document.getElementById('overlay-chargement')?.classList.add('cache');
}

async function exporterTextes() {
  afficherChargement();
  const res = await appelAPI('exporterTextesSite');
  cacherChargement();
if (res && res.success) {
  window.open(res.url, '_blank');
  afficherMsg('gammes', '✅ Fichier exporté — vérifiez votre Google Drive : ' + res.nom);
} else {
  afficherMsg('gammes', '❌ Erreur : ' + (res?.message || 'inconnue'), 'erreur');
}
}
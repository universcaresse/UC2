/* ═══════════════════════════════════════
   UNIVERS CARESSE — main.js
   V2 — 6 avril 2026
   ═══════════════════════════════════════ */

// ─── CONFIGURATION ───
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec',
  MOT_DE_PASSE: '2026'
};


// ─── COULEURS COLLECTIONS (fallback si pas de couleur_hex dans la sheet) ───
const COULEURS_COLLECTIONS = {
  'SAPONICA':    ['#4a9b6f', '#2d7a50'],
  'PETIT NUAGE': ['#a8c8e0', '#6a9ab8'],
  'CAPRIN':      ['#e8d5a8', '#c4a96e'],
  'ÉMOLIA':      ['#d4a445', '#a87c28'],
  'ÉPURE':       ['#7a8c5a', '#4a5c32'],
  'KÉRYS':       ['#9b8ea0', '#6b5d72'],
  'CASA':        ['#d4a84b', '#a67c2a'],
  'ANIMA':       ['#c4845a', '#8a5230'],
  'LUI':         ['#8a6040', '#5a3820']
};

function couleurCollection(nom, hex) {
  if (hex && hex.trim()) return [hex.trim(), assombrirCouleur(hex.trim())];
  const cle = nom ? nom.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  const found = Object.keys(COULEURS_COLLECTIONS).find(k => k.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === cle);
  return found ? COULEURS_COLLECTIONS[found] : ['#c44536', '#a02d20'];
}
 
function assombrirCouleur(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = Math.max(0, parseInt(hex.substring(0,2), 16) - 40);
  const g = Math.max(0, parseInt(hex.substring(2,4), 16) - 40);
  const b = Math.max(0, parseInt(hex.substring(4,6), 16) - 40);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}


// ─── ÉTAT ───
let adminConnecte = false;
let scrollObserver = null;
let donneesCatalogue = null;
let collectionEnAttente = null;

// ─── INITIALISATION ───
document.addEventListener('DOMContentLoaded', async () => {
  verifierSession();
  initNav();
  initScrollAnimations();
  initSPA(); // une seule fois — bug V1 corrigé
  const [resContenu, resCat] = await Promise.all([appelAPI('getContenu'), appelAPI('getCatalogue')]);
  if (resContenu && resContenu.success) appliquerContenu(resContenu.contenu);
  if (resCat && resCat.success) {
    donneesCatalogue = resCat;
    afficherCollectionsPublic();
    afficherNbProduits();
  }
});

window.addEventListener('resize', () => {
  const liens = document.getElementById('nav-links');
  if (liens && window.innerWidth > 900) liens.classList.remove('ouvert');
  const filtres = document.getElementById('filtres-bar');
  if (filtres) filtres.classList.remove('cache-scroll');
});

function initScrollAnimations() {
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .fade-in-doux, .fade-in-lent').forEach(el => scrollObserver.observe(el));

  const mosaicObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.mosaic-item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 200);
        });
        mosaicObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const mosaic = document.querySelector('.hero-mosaic');
  if (mosaic) mosaicObserver.observe(mosaic);
}

// ─── SPA — NAVIGATION PAR SECTIONS ───
function initSPA() {
  const hash = window.location.hash.replace('#', '') || 'accueil';
  afficherSection(hash);
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '') || 'accueil';
    afficherSection(h);
  });
}

function afficherSection(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const cible = document.getElementById('section-' + id);
  if (cible) {
    cible.classList.add('active');
  } else {
    const accueil = document.getElementById('section-accueil');
    if (accueil) accueil.classList.add('active');
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + id) a.classList.add('active');
  });
  const liens = document.getElementById('nav-links');
  if (liens) liens.classList.remove('ouvert');
  window.scrollTo(0, 0);
  if (cible && scrollObserver) {
    cible.querySelectorAll('.fade-in, .fade-in-doux, .fade-in-lent').forEach(el => {
      el.classList.remove('visible');
      scrollObserver.observe(el);
    });
  }
  if (id === 'accueil') {
    afficherCollectionsPublic();
    afficherNbProduits();
  }
  if (id === 'catalogue') {
    
    document.querySelectorAll('.filtre-btn').forEach(b => b.classList.remove('actif'));
    const btnTout = document.querySelector('[data-filtre="tout"]');
    if (btnTout) btnTout.classList.add('actif');
    document.querySelectorAll('.collection-section').forEach(s => s.classList.remove('masquee'));
    document.querySelectorAll('.ligne-groupe').forEach(g => g.classList.remove('masquee'));
    chargerCatalogue();
  }
  if (id === 'educatif')  afficherEduSection(1);
}

function naviguer(id) {
  if (id === 'educatif') afficherEduSection(1);
  window.location.hash = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function afficherEduSection(num) {
  document.querySelectorAll('.edu-sous-section-panel').forEach(p => p.classList.remove('active'));
  const cible = document.getElementById('edu-' + num);
  if (cible) {
    cible.classList.add('active');
    setTimeout(() => {
      cible.querySelectorAll('.fade-in, .fade-in-doux').forEach(el => el.classList.add('visible'));
    }, 50);
  }
  window.scrollTo(0, 0);
}

// ─── SESSION ADMIN ───
function verifierSession() {
  const session = sessionStorage.getItem('uc_admin');
  if (session === 'true') {
    adminConnecte = true;
    afficherModeAdmin();
  }
}

function afficherConnexion() {
  document.getElementById('modal-connexion').classList.add('ouvert');
  setTimeout(() => { if (window.innerWidth > 900) document.getElementById('input-mdp').focus(); }, 100);
}

function fermerConnexion() {
  document.getElementById('modal-connexion').classList.remove('ouvert');
  document.getElementById('input-mdp').value = '';
  document.getElementById('erreur-connexion').classList.add('cache');
}

function fermerModalConnexion(e) {
  if (e.target === document.getElementById('modal-connexion')) fermerConnexion();
}

function validerConnexion() {
  const mdp = document.getElementById('input-mdp').value;
  if (mdp === CONFIG.MOT_DE_PASSE) {
    sessionStorage.setItem('uc_admin', 'true');
    window.location.href = '/UC2/admin/';
  } else {
    document.getElementById('erreur-connexion').classList.remove('cache');
    document.getElementById('input-mdp').value = '';
    document.getElementById('input-mdp').focus();
  }
}

function seDeconnecter() {
  adminConnecte = false;
  sessionStorage.removeItem('uc_admin');
  window.location.href = '/UC2/admin/';
}

function afficherModeAdmin() {
  const btnConnexion   = document.getElementById('btn-connexion');
  const btnDeconnexion = document.getElementById('btn-deconnexion');
  const lienAdmin      = document.getElementById('nav-admin-link');
  if (btnConnexion)   btnConnexion.classList.add('cache');
  if (btnDeconnexion) btnDeconnexion.classList.remove('cache');
  if (lienAdmin)      lienAdmin.classList.remove('cache');
}

function afficherMaintenance() {
  document.getElementById('page-maintenance').classList.remove('cache');
  document.getElementById('nav').classList.add('cache');
  const burger = document.getElementById('burger');
  if (burger) burger.classList.add('cache');
}

function afficherModePublic() {
  const btnConnexion   = document.getElementById('btn-connexion');
  const btnDeconnexion = document.getElementById('btn-deconnexion');
  const lienAdmin      = document.getElementById('nav-admin-link');
  if (btnConnexion)   btnConnexion.classList.remove('cache');
  if (btnDeconnexion) btnDeconnexion.classList.add('cache');
  if (lienAdmin)      lienAdmin.classList.add('cache');
}

// ─── NAVIGATION MOBILE ───
function initNav() {
  let dernierScroll = 0;
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    const burger = document.getElementById('burger');
    if (burger && window.innerWidth <= 900) {
      const scrollActuel = window.scrollY;
      const filtres = document.getElementById('filtres-bar');
      if (scrollActuel > dernierScroll && scrollActuel > 60) {
        burger.classList.add('cache-scroll');
        if (filtres) filtres.classList.add('cache-scroll');
      } else {
        burger.classList.remove('cache-scroll');
        if (filtres) filtres.classList.remove('cache-scroll');
      }
      dernierScroll = scrollActuel;
    }
  });
}

function toggleMenu() {
  const liens = document.getElementById('nav-links');
  if (liens) liens.classList.toggle('ouvert');
}

document.addEventListener('click', function(e) {
  const liens = document.getElementById('nav-links');
  const burger = document.getElementById('burger');
  if (liens && liens.classList.contains('ouvert')) {
    if (!liens.contains(e.target) && !burger.contains(e.target)) {
      liens.classList.remove('ouvert');
    }
  }
});

// ─── APPEL APPS SCRIPT ───
async function appelAPI(action, params = {}) {
  try {
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set('t', Date.now());
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Erreur réseau');
    return await response.json();
  } catch (err) {
    console.error('Erreur API:', err);
    return null;
  }
}

async function appelAPIPost(action, data = {}) {
  try {
    const payload = JSON.stringify({ action, ...data });
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
      redirect: 'follow'
    });
    if (!response.ok) throw new Error('Erreur réseau');
    return await response.json();
  } catch (err) {
    console.error('Erreur API POST:', err);
    return null;
  }
}

// ─── UTILITAIRES ───
function formaterPrix(montant) {
  return parseFloat(montant).toFixed(2).replace('.', ',') + ' $';
}

function majuscules(texte) {
  return texte ? texte.toUpperCase() : '';
}

// ─── ACCUEIL — COLLECTIONS ───
// V2 : infoCollections est un objet indexé par col_id
// getCataloguePublic_v2 retourne : produits, infoCollections { col_id: { rang, nom, slogan, couleur_hex, ... } }
function afficherCollectionsPublic() {
  if (!donneesCatalogue) { afficherCollectionsFallback(); return; }

  // Construire la liste des collections triées par rang depuis infoCollections
  const infoCollections = donneesCatalogue.infoCollections || {};
  const collections = Object.values(infoCollections).sort((a, b) => (a.rang || 99) - (b.rang || 99));

  const strip    = document.getElementById('collections-strip');
  const count    = document.getElementById('collections-count');
  const statCol  = document.getElementById('hero-stat-collections');

  if (count)   count.textContent = collections.length + ' collections';
  if (statCol) statCol.textContent = collections.length;
  if (!strip)  return;

  strip.innerHTML = '';
  collections.forEach(info => {
    const nom     = info.nom || '';
    const col_id  = Object.keys(infoCollections).find(k => infoCollections[k] === info) || '';
    const couleurs = couleurCollection(nom, info.couleur_hex);
    strip.innerHTML += `
      <a href="#catalogue" onclick="naviguer('catalogue'); filtrerApresChargement('${col_id}');" class="collection-tile" style="--col-hex-1: ${couleurs[0]}; --col-hex-2: ${couleurs[1]};">
        <div class="collection-tile-bg"></div>
        <div class="collection-tile-overlay"></div>
        <div class="collection-tile-content">
          <span class="collection-tile-name">${nom.toUpperCase()}</span>
          <span class="collection-tile-slogan">${info.slogan || ''}</span>
        </div>
      </a>`;
  });
}

function afficherNbProduits() {
  if (!donneesCatalogue) return;
  const nb = (donneesCatalogue.produits || []).length;
  const statProd = document.getElementById('hero-stat-produits');
  if (nb > 0 && statProd) statProd.textContent = nb + '+';
}

function afficherCollectionsFallback() {
  const collections = [
    { nom: 'Saponica',    slogan: 'Simplement la nature qui prend soin de vous' },
    { nom: 'Petit Nuage', slogan: 'Simplement la nature qui dorlote vos tout-petits' },
    { nom: 'Caprin',      slogan: 'Simplement la nature et la douceur de la chèvre' },
    { nom: 'Émolia',      slogan: 'Simplement la nature dédiée à votre bien-être' },
    { nom: 'Épure',       slogan: 'Simplement la nature qui prend soin de vos mains' },
    { nom: 'Kérys',       slogan: 'Simplement la nature qui dorlotte vos cheveux' },
    { nom: 'Casa',        slogan: 'Simplement la nature qui prend soin de votre maison' },
    { nom: 'Anima',       slogan: 'Simplement la nature pour pattes et museaux' }
  ];
  const strip = document.getElementById('collections-strip');
  const count = document.getElementById('collections-count');
  if (count) count.textContent = collections.length + ' collections';
  if (!strip) return;
  strip.innerHTML = '';
  collections.forEach(col => {
    const couleurs = couleurCollection(col.nom);
    strip.innerHTML += `
      <a href="#catalogue" onclick="naviguer('catalogue')" class="collection-tile" style="--col-hex-1: ${couleurs[0]}; --col-hex-2: ${couleurs[1]};">
        <div class="collection-tile-bg"></div>
        <div class="collection-tile-overlay"></div>
        <div class="collection-tile-content">
          <span class="collection-tile-name">${col.nom.toUpperCase()}</span>
          <span class="collection-tile-slogan">${col.slogan}</span>
        </div>
      </a>`;
  });
}

// ─── CATALOGUE ───
let catalogueCharge = false;

function chargerCatalogue() {
  if (catalogueCharge) return;
  catalogueCharge = true;
  try {
    if (donneesCatalogue && donneesCatalogue.produits) {
      construireCatalogue();
    } else {
      appelAPI('getCatalogue').then(resCat => {
        if (!resCat || !resCat.success || !resCat.produits) {
          afficherErreurCatalogue('Impossible de charger le catalogue.');
          return;
        }
        donneesCatalogue = resCat;
        construireCatalogue();
      });
    }
  } catch (err) {
    afficherErreurCatalogue('Erreur de connexion.');
  }
}

function afficherErreurCatalogue(msg) {
  const el = document.getElementById('chargement');
  if (el) el.innerHTML = `<p class="chargement-erreur">${msg}</p>`;
}

function construireCatalogue() {
  const chargement = document.getElementById('chargement');
  const body       = document.getElementById('catalogue-body');
  if (chargement) chargement.classList.add('cache');
  if (body)       body.classList.remove('cache');

  const produits        = donneesCatalogue.produits || [];
  const infoCollections = donneesCatalogue.infoCollections || {};

  // Regrouper par col_id
  const parCollection = {};
  produits.forEach(p => {
    const col_id = p.col_id || '';
    if (!parCollection[col_id]) parCollection[col_id] = [];
    parCollection[col_id].push(p);
    // Collections secondaires
    if (Array.isArray(p.collections_secondaires)) {
      p.collections_secondaires.forEach(colSec => {
        if (!parCollection[colSec]) parCollection[colSec] = [];
        if (!parCollection[colSec].find(x => x.pro_id === p.pro_id)) {
          parCollection[colSec].push(p);
        }
      });
    }
  });

  // Ordre par rang
  const ordre = Object.keys(infoCollections).sort((a, b) => {
    return (infoCollections[a].rang || 99) - (infoCollections[b].rang || 99);
  });

  const filtresBar = document.getElementById('filtres-bar');

  ordre.forEach(col_id => {
    if (!parCollection[col_id]) return;
    const info = infoCollections[col_id] || {};
    const nom  = info.nom || col_id;
    const btn  = document.createElement('button');
    btn.className        = 'filtre-btn';
    btn.dataset.filtre   = col_id;
    btn.textContent      = nom;
    btn.onclick          = () => filtrer(col_id);
    filtresBar.appendChild(btn);
  });

  body.innerHTML = '';
  ordre.forEach(col_id => {
    if (!parCollection[col_id]) return;
    const produitsColl = parCollection[col_id];
    const info         = infoCollections[col_id] || {};
    const nom          = info.nom || col_id;

    // Regrouper par famille puis par gamme
    const parFamille = {};
    const ordreFamilles = [];
    produitsColl.forEach(p => {
      const fam = p.nom_famille || '';
      if (!parFamille[fam]) { parFamille[fam] = {}; ordreFamilles.push(fam); }
      const gamme = p.nom_gamme || '';
      if (!parFamille[fam][gamme]) parFamille[fam][gamme] = [];
      parFamille[fam][gamme].push(p);
    });

    const gammesHTML = ordreFamilles.map(fam => {
      const parGamme = parFamille[fam];
      const ordreGammes = Object.keys(parGamme);
      const gammesInterne = ordreGammes.map(gamme => {
        const prods = parGamme[gamme];
        const gam_id = prods[0]?.gam_id || '';
        return `
          <div class="ligne-groupe" data-gamme="${gam_id}">
            ${gamme ? `<div class="ligne-groupe-entete">
              <div class="ligne-groupe-nom">${gamme.toUpperCase()}</div>
              ${prods[0]?.desc_gamme ? `<p class="ligne-groupe-desc">${prods[0].desc_gamme}</p>` : ''}
            </div>` : ''}
            <div class="produits-grille">${prods.map(p => carteProduit(p)).join('')}</div>
          </div>`;
      }).join('');
      return fam
        ? `<div class="famille-groupe"><div class="famille-groupe-titre">${fam.toUpperCase()}</div>${gammesInterne}</div>`
        : gammesInterne;
    }).join('');

    const couleurs = couleurCollection(nom, info.couleur_hex);
    const section  = document.createElement('div');
    section.className          = 'collection-section';
    section.dataset.collection = col_id;
    section.innerHTML = `
      <div class="collection-entete fade-in">
        <div>
          <h2 class="collection-entete-nom">${nom.toUpperCase()}</h2>
          <p class="collection-entete-slogan">${info.slogan || ''}</p>
          <p class="collection-entete-desc">${info.description || ''}</p>
        </div>
        <div class="collection-entete-visuel">
          <div class="collection-entete-bg" style="--col-hex: ${info.couleur_hex || couleurs[0]};">
            ${info.photo_url
              ? `<img src="${info.photo_url}" alt="${nom}" onerror="this.style.display='none'">`
              : `<span class="entete-visuel-placeholder">Photo ambiance<br>à venir</span>`}
          </div>
        </div>
      </div>
   ${(() => { const toutesGammes = ordreFamilles.flatMap(f => Object.keys(parFamille[f]).filter(g => g)); return toutesGammes.length > 1 ? `<div class="filtres-bar collection-filtres-gammes" data-collection-filtres="${col_id}"><h2 class="page-entete-titre">Gammes de la <em>collection ${nom}</em></h2><div class="filtres-ligne"><button class="filtre-btn actif" data-filtre-gamme="tout" onclick="filtrerGamme('tout', '${col_id}')">Toutes</button>${toutesGammes.map(g => { const prods = ordreFamilles.flatMap(f => parFamille[f][g] || []); const gam_id = prods[0]?.gam_id || ''; return `<button class="filtre-btn" data-filtre-gamme="${gam_id}" onclick="filtrerGamme('${gam_id}', '${col_id}')">${g}</button>`; }).join('')}</div></div>` : ''; })()}
      ${gammesHTML}`;
    body.appendChild(section);
    if (scrollObserver) {
      section.querySelectorAll('.fade-in, .fade-in-doux').forEach(el => scrollObserver.observe(el));
    }
  });

  if (collectionEnAttente) {
    filtrer(collectionEnAttente);
    collectionEnAttente = null;
  }
}

// ─── CARTE PRODUIT ───
// V2 : p.col_id, p.gam_id, p.nom_gamme, p.nom_collection, p.pro_id
// Les formats sont dans p.formats (tableau {poids, unite, prix_vente})
function couleurTexteContraste(hex) {
  if (!hex || hex.length < 4) return 'carte-infos-clair';
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'carte-infos-fonce' : 'carte-infos-clair';
}

function carteProduit(p) {
  const formats = Array.isArray(p.formats) && p.formats.length ? [...p.formats].sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids)) : [];
  const prix = formats.length
    ? `<div class="carte-formats">${formats.map(f => `<div class="carte-format-tag"><span class="carte-format-prix">${parseFloat(f.prix_vente).toFixed(2).replace('.', ',')} $</span><span class="carte-format-sep"></span><span class="carte-format-poids">${f.poids} ${f.unite}</span></div>`).join('')}</div>`
    : '';
  const photoUrl = (window.modeSaisonnier && p.image_noel_url) ? p.image_noel_url : p.image_url;
  const image    = photoUrl ? `<img src="${photoUrl}" alt="${p.nom}" onerror="this.style.display='none'">` : '';
  const couleur  = p.couleur_hex || '#c44536';
  return `
    <div class="carte-produit" data-produit="${btoa(unescape(encodeURIComponent(JSON.stringify(p))))}" onclick="ouvrirModalFromCard(this)" style="--col-hex: ${couleur};">
      <div class="carte-visuel">
        <div class="carte-couleur">
          ${image}
          ${photoUrl ? `<div class="recette-couleur-overlay"></div>` : ''}
          ${!photoUrl ? `<div class="carte-photo-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Photo à venir</div>` : ''}
          <div class="carte-couleur-dot"></div>
        </div>
      </div>
      <div class="carte-infos ${couleurTexteContraste(couleur)}">
        <span class="carte-collection-badge">${(p.nom_collection || '').toUpperCase()}</span>
        <div class="carte-nom">${(p.nom || '').toUpperCase()}</div>
        <div class="carte-ligne">${(p.nom_gamme || '').toUpperCase()}</div>
        <div class="carte-bas">
          ${prix ? `<div class="carte-prix">${prix}</div>` : ''}
        </div>
      </div>
    </div>`;
}

function ouvrirModalFromCard(el) {
  const produit = JSON.parse(decodeURIComponent(escape(atob(el.dataset.produit))));
  ouvrirModal(produit);
}

function filtrerApresChargement(col_id) {
  const sections = document.querySelectorAll('.collection-section');
  if (sections.length > 0) {
    filtrer(col_id);
  } else {
    collectionEnAttente = col_id;
  }
}

function filtrer(col_id, gam_id) {
  document.querySelectorAll('.filtre-btn').forEach(b => b.classList.remove('actif'));
  const btn = document.querySelector(`[data-filtre="${col_id}"]`);
  if (btn) btn.classList.add('actif');

  // Afficher/masquer les collections
  document.querySelectorAll('.collection-section').forEach(s => {
    s.classList.toggle('masquee', col_id !== 'tout' && s.dataset.collection !== col_id);
  });

  

  // Filtre gamme actif
  if (gam_id) filtrerGamme(gam_id);

  const cible = col_id === 'tout'
    ? document.getElementById('catalogue-body')
    : document.querySelector(`.collection-section[data-collection="${col_id}"]`);
  if (cible) {
    const filtresH = document.getElementById('filtres-bar').offsetHeight;
    const navH     = document.getElementById('nav').offsetHeight;
    const enteteH  = document.querySelector('#section-catalogue .page-entete')?.offsetHeight || 0;
    const offset   = cible.getBoundingClientRect().top + window.scrollY - navH - filtresH - enteteH - 16;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

function filtrerGamme(gam_id, col_id) {
  const conteneur = col_id
    ? document.querySelector(`.collection-filtres-gammes[data-collection-filtres="${col_id}"]`)
    : document.querySelector('.collection-filtres-gammes');
  if (conteneur) {
    conteneur.querySelectorAll('[data-filtre-gamme]').forEach(b => b.classList.remove('actif'));
    const btn = conteneur.querySelector(`[data-filtre-gamme="${gam_id}"]`);
    if (btn) btn.classList.add('actif');
  }
  const section = document.querySelector(`.collection-section[data-collection="${col_id}"]`);
  if (section) {
    section.querySelectorAll('.ligne-groupe').forEach(g => {
      g.classList.toggle('masquee', gam_id !== 'tout' && g.dataset.gamme !== gam_id);
    });
  }
}

// ─── MODAL PRODUIT ───
// V2 : produit.nom_collection, produit.nom_gamme, produit.formats, produit.ingredients
function ouvrirModal(produit) {
  const couleur = produit.couleur_hex || '#c44536';
  document.getElementById('modal-produit').style.setProperty('--col-hex', couleur);
  document.getElementById('modal-nom').textContent        = produit.nom || '';
  document.getElementById('modal-collection').textContent = produit.nom_collection || '';
  document.getElementById('modal-ligne').textContent      = produit.nom_gamme || '';
  document.getElementById('modal-desc').textContent       = produit.description || '';

  const hex   = document.getElementById('modal-visuel-hex');
  const photo = document.getElementById('modal-visuel-photo');
  const imgExistante = photo.querySelector('img');
  if (imgExistante) imgExistante.remove();

  const photoModal = (window.modeSaisonnier && produit.image_noel_url) ? produit.image_noel_url : produit.image_url;
  if (photoModal) {
    hex.style.background = `linear-gradient(145deg, ${couleur}dd, ${couleur}88)`;
    hex.classList.remove('cache');
    photo.style.background = '';
    const img = document.createElement('img');
    img.src = photoModal;
    img.onerror = () => img.remove();
    photo.appendChild(img);
  } else {
    photo.classList.add('cache');
    hex.classList.remove('cache');
    hex.style.background = `linear-gradient(145deg, ${couleur}dd, ${couleur}88)`;
    hex.style.flex = '1';
  }

  // Formats V2 — tableau p.formats {poids, unite, prix_vente}
  const formats    = Array.isArray(produit.formats) && produit.formats.length ? [...produit.formats].sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids)) : [];
  const prixFormat = formats.length
    ? formats.map(f => `${parseFloat(f.prix_vente).toFixed(2).replace('.', ',')} $ / ${f.poids} ${f.unite}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;')
    : '';
  const prixFormatEl = document.getElementById('modal-prix-format');
  if (prixFormatEl) {
    prixFormatEl.innerHTML = prixFormat;
    prixFormatEl.style.color = couleurTexteContraste(couleur) === 'carte-infos-fonce' ? 'rgba(0,0,0,0.85)' : 'white';
  }

  // INCI — V2 : ingredients = [{ing_id, nom_ingredient, quantite_g}]
  // La liste INCI vient de nom_ingredient — mais on affiche UNIQUEMENT le code INCI
  // ⚠️ RÈGLE LÉGALE : jamais de nom_ingredient à la place de INCI
  // En V2 les ingrédients publics n'ont pas de champ inci direct dans le catalogue
  // On affiche uniquement si l'ingrédient a un INCI valide
  const inciEl = document.getElementById('modal-inci');
  if (inciEl) {
    const ingredients = produit.ingredients || [];
    const total = ingredients.reduce((s, i) => s + (parseFloat(i.quantite_g) || 0), 0);
    if (total > 0) {
      // En V2, le champ INCI n'est pas encore dans getCataloguePublic_v2
      // À compléter quand Ingredients_INCI_v2 sera jointé dans le catalogue
      inciEl.textContent = '';
    } else {
      inciEl.textContent = '';
    }
  }

  document.getElementById('modal-produit').classList.add('ouvert');
  document.body.style.overflow = 'hidden';
}

function fermerModal() {
  document.getElementById('modal-produit').classList.remove('ouvert');
  document.body.style.overflow = '';
}

function fermerModalProduit(e) {
  if (e.target === document.getElementById('modal-produit')) fermerModal();
}

// ─── CONTENU DYNAMIQUE ───
// inchangé — mêmes IDs HTML, même structure Contenu_v2
function appliquerContenu(c) {
  try {
    if (!c) return;
    if (String(c.maintenance_active) === '1') { afficherMaintenance(); return; }
    window.modeSaisonnier = String(c.mode_saisonnier) === 'oui';
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };

    set('contenu-accueil-eyebrow', c.accueil_eyebrow);
    set('contenu-accueil-cta', c.accueil_cta);
    const cta = document.querySelector('.hero-cta');
    if (cta) { cta.classList.remove('invisible'); cta.classList.add('fade-in-doux'); }
    set('contenu-accueil-stat-label', c.accueil_stat_label);
    set('contenu-accueil-stat-valeur', c.accueil_stat_valeur);
    set('contenu-qui-eyebrow', c.qui_eyebrow);
    set('contenu-qui-titre', c.qui_titre);
    set('contenu-qui-titre-em', c.qui_titre_em);
    set('contenu-qui-texte', c.qui_texte);
    set('contenu-qui-signature-nom', c.qui_signature_nom);
    set('contenu-qui-signature-titre', c.qui_signature_titre);
    set('contenu-section-texte-p1', c.section_texte_p1);
    set('contenu-section-texte-p2', c.section_texte_p2);
    set('contenu-section-texte-p3', c.section_texte_p3);
    set('contenu-valeur-01-titre', c.valeur_01_titre);
    set('contenu-valeur-01-desc', c.valeur_01_desc);
    set('contenu-valeur-02-titre', c.valeur_02_titre);
    set('contenu-valeur-02-desc', c.valeur_02_desc);
    set('contenu-valeur-03-titre', c.valeur_03_titre);
    set('contenu-valeur-03-desc', c.valeur_03_desc);
    set('contenu-valeur-04-titre', c.valeur_04_titre);
    set('contenu-valeur-04-desc', c.valeur_04_desc);
    set('contenu-citation-texte', c.citation_texte);
    set('contenu-citation-source', c.citation_source);
    [1,2,3,4,5].forEach(n => {
      const nn = String(n).padStart(2,'0');
      set(`contenu-bas-engagement-${nn}-titre`, c[`bas_engagement_${nn}_titre`]);
      set(`contenu-bas-engagement-${nn}-texte`, c[`bas_engagement_${nn}_texte`]);
      if (c[`bas_engagement_${nn}_titre`]) document.getElementById(`card-bas-engagement-${nn}`)?.classList.remove('cache');
    });
    [1,2,3,4,5].forEach(n => {
      const nn = String(n).padStart(2,'0');
      set(`contenu-bas-note-${nn}-titre`, c[`bas_note_${nn}_titre`]);
      set(`contenu-bas-note-${nn}-texte`, c[`bas_note_${nn}_texte`]);
      if (c[`bas_note_${nn}_titre`]) document.getElementById(`card-bas-note-${nn}`)?.classList.remove('cache');
    });
    [1,2,3,4,5].forEach(n => {
      const nn = String(n).padStart(2,'0');
      set(`contenu-bas-conservation-${nn}-titre`, c[`bas_conservation_${nn}_titre`]);
      set(`contenu-bas-conservation-${nn}-texte`, c[`bas_conservation_${nn}_texte`]);
      if (c[`bas_conservation_${nn}_titre`]) document.getElementById(`card-bas-conservation-${nn}`)?.classList.remove('cache');
    });
    [1,2,3,4,5].forEach(n => {
      const nn = String(n).padStart(2,'0');
      set(`contenu-bas-commande-${nn}-titre`, c[`bas_commande_${nn}_titre`]);
      set(`contenu-bas-commande-${nn}-texte`, c[`bas_commande_${nn}_texte`]);
      if (c[`bas_commande_${nn}_titre`]) document.getElementById(`card-bas-commande-${nn}`)?.classList.remove('cache');
    });

    // ─── SECTIONS ÉDUCATIVES ─── inchangées
    const setEdu = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.textContent = val; };
    const setTitreEdu = (id, titre, titreEm) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = titre + (titreEm ? ' <em>' + titreEm + '</em>' : '');
    };
    // S1
    setEdu('edu-s1-surtitre', c.edu_s1_surtitre); setTitreEdu('edu-s1-titre-bloc', c.edu_s1_titre || '', c.edu_s1_titre_em);
    setEdu('edu-s1-accroche', c.edu_s1_accroche); setEdu('edu-s1-p1', c.edu_s1_p1); setEdu('edu-s1-p2', c.edu_s1_p2); setEdu('edu-s1-p3', c.edu_s1_p3);
    setEdu('edu-s1-section-titre', c.edu_s1_section_titre);
    [1,2,3,4,5].forEach(n => { setEdu(`edu-s1-card${n}-titre`, c[`edu_s1_card${n}_titre`]); setEdu(`edu-s1-card${n}-texte`, c[`edu_s1_card${n}_texte`]); });
    // S2
    setEdu('edu-s2-surtitre', c.edu_s2_surtitre); setTitreEdu('edu-s2-titre-bloc', c.edu_s2_titre || '', c.edu_s2_titre_em);
    setEdu('edu-s2-accroche', c.edu_s2_accroche); setEdu('edu-s2-p1', c.edu_s2_p1); setEdu('edu-s2-p2', c.edu_s2_p2); setEdu('edu-s2-p3', c.edu_s2_p3);
    setEdu('edu-s2-section-titre', c.edu_s2_section_titre); setEdu('edu-s2-citation', c.edu_s2_citation); setEdu('edu-s2-citation-source', c.edu_s2_citation_source);
    [1,2,3,4].forEach(n => { setEdu(`edu-s2-val${n}-titre`, c[`edu_s2_val${n}_titre`]); setEdu(`edu-s2-val${n}-texte`, c[`edu_s2_val${n}_texte`]); });
    // S3
    setEdu('edu-s3-surtitre', c.edu_s3_surtitre); setTitreEdu('edu-s3-titre-bloc', c.edu_s3_titre || '', c.edu_s3_titre_em);
    setEdu('edu-s3-accroche', c.edu_s3_accroche); setEdu('edu-s3-p1', c.edu_s3_p1); setEdu('edu-s3-p2', c.edu_s3_p2); setEdu('edu-s3-p3', c.edu_s3_p3);
    setEdu('edu-s3-section-titre', c.edu_s3_section_titre); setEdu('edu-s3-astuce', c.edu_s3_astuce);
    [1,2,3].forEach(n => { const pct = c[`edu_s3_niv${n}_pct`]; const el = document.getElementById(`edu-s3-niv${n}-pct`); if (el && pct !== undefined) el.textContent = Math.round(parseFloat(pct) * 100) + '%'; setEdu(`edu-s3-niv${n}-label`, c[`edu_s3_niv${n}_label`]); setEdu(`edu-s3-niv${n}-texte`, c[`edu_s3_niv${n}_texte`]); });
    // S4
    setEdu('edu-s4-surtitre', c.edu_s4_surtitre); setTitreEdu('edu-s4-titre-bloc', c.edu_s4_titre || '', c.edu_s4_titre_em);
    setEdu('edu-s4-accroche', c.edu_s4_accroche); setEdu('edu-s4-p1', c.edu_s4_p1); setEdu('edu-s4-p2', c.edu_s4_p2);
    setEdu('edu-s4-section-titre', c.edu_s4_section_titre); setEdu('edu-s4-citation', c.edu_s4_citation); setEdu('edu-s4-citation-source', c.edu_s4_citation_source);
    [1,2,3,4,5,6].forEach(n => { setEdu(`edu-s4-h${n}-titre`, c[`edu_s4_h${n}_titre`]); setEdu(`edu-s4-h${n}-texte`, c[`edu_s4_h${n}_texte`]); });
    // S5
    setEdu('edu-s5-surtitre', c.edu_s5_surtitre); setTitreEdu('edu-s5-titre-bloc', c.edu_s5_titre || '', c.edu_s5_titre_em);
    setEdu('edu-s5-accroche', c.edu_s5_accroche); setEdu('edu-s5-p1', c.edu_s5_p1); setEdu('edu-s5-p2', c.edu_s5_p2);
    setEdu('edu-s5-section1-titre', c.edu_s5_section1_titre); setEdu('edu-s5-section2-titre', c.edu_s5_section2_titre);
    [1,2,3,4,5].forEach(n => { setEdu(`edu-s5-a${n}-titre`, c[`edu_s5_a${n}_titre`]); setEdu(`edu-s5-a${n}-texte`, c[`edu_s5_a${n}_texte`]); });
    [1,2,3].forEach(n => { setEdu(`edu-s5-ad${n}-titre`, c[`edu_s5_ad${n}_titre`]); setEdu(`edu-s5-ad${n}-texte`, c[`edu_s5_ad${n}_texte`]); });
    // S6
    setEdu('edu-s6-surtitre', c.edu_s6_surtitre); setTitreEdu('edu-s6-titre-bloc', c.edu_s6_titre || '', c.edu_s6_titre_em);
    setEdu('edu-s6-accroche', c.edu_s6_accroche); setEdu('edu-s6-p1', c.edu_s6_p1); setEdu('edu-s6-p2', c.edu_s6_p2);
    setEdu('edu-s6-section-titre', c.edu_s6_section_titre); setEdu('edu-s6-precautions', c.edu_s6_precautions);
    [1,2,3,4,5,6,7,8,9,10,11].forEach(n => { setEdu(`edu-s6-he${n}-titre`, c[`edu_s6_he${n}_titre`]); setEdu(`edu-s6-he${n}-texte`, c[`edu_s6_he${n}_texte`]); });
    // S7
    setEdu('edu-s7-surtitre', c.edu_s7_surtitre); setTitreEdu('edu-s7-titre-bloc', c.edu_s7_titre || '', c.edu_s7_titre_em);
    setEdu('edu-s7-accroche', c.edu_s7_accroche); setEdu('edu-s7-section1-titre', c.edu_s7_section1_titre);
    setEdu('edu-s7-astuce', c.edu_s7_astuce); setEdu('edu-s7-section2-titre', c.edu_s7_section2_titre); setEdu('edu-s7-section3-titre', c.edu_s7_section3_titre);
    [1,2,3,4,5].forEach(n => { setEdu(`edu-s7-peau${n}-titre`, c[`edu_s7_peau${n}_titre`]); setEdu(`edu-s7-peau${n}-signes`, c[`edu_s7_peau${n}_signes`]); setEdu(`edu-s7-peau${n}-aime`, c[`edu_s7_peau${n}_aime`]); });
    [1,2,3,4,5].forEach(n => { setEdu(`edu-s7-usage${n}-titre`, c[`edu_s7_usage${n}_titre`]); setEdu(`edu-s7-usage${n}-texte`, c[`edu_s7_usage${n}_texte`]); });
    [1,2,3,4].forEach(n => { setEdu(`edu-s7-ok${n}`, c[`edu_s7_ok${n}`]); setEdu(`edu-s7-non${n}`, c[`edu_s7_non${n}`]); });

    // ─── GUIDE RAPIDE ───
    setEdu('edu-guide-titre', c.edu_guide_titre);
    [1,2,3,4,5].forEach(n => {
      setEdu(`edu-guide-ligne${n}-peau`, c[`edu_guide_ligne${n}_peau`]);
      setEdu(`edu-guide-ligne${n}-surgraissage`, c[`edu_guide_ligne${n}_surgraissage`]);
      setEdu(`edu-guide-ligne${n}-huiles`, c[`edu_guide_ligne${n}_huiles`]);
      setEdu(`edu-guide-ligne${n}-argiles`, c[`edu_guide_ligne${n}_argiles`]);
    });
    const accordeon = document.getElementById('edu-guide-accordeon');
    if (accordeon) {
      accordeon.innerHTML = [1,2,3,4,5].map(n => {
        const peau = c[`edu_guide_ligne${n}_peau`] || '';
        const surg = c[`edu_guide_ligne${n}_surgraissage`] || '';
        const huil = c[`edu_guide_ligne${n}_huiles`] || '';
        const argi = c[`edu_guide_ligne${n}_argiles`] || '';
        return `<div class="edu-accord-item"><button class="edu-accord-btn" onclick="toggleAccord(this)">${peau}</button><div class="edu-accord-panel"><p><strong>Surgraissage :</strong> ${surg}</p><p><strong>Huiles :</strong> ${huil}</p><p><strong>Argiles / Additifs :</strong> ${argi}</p></div></div>`;
      }).join('');
    }

    document.querySelectorAll('.edu-sous-section-panel .fade-in, .edu-sous-section-panel .fade-in-doux').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 100);
    });

  } catch (err) {
    console.error('Erreur appliquerContenu:', err);
  }
}

function toggleAccord(btn) {
  const item   = btn.parentElement;
  const isOpen = item.classList.contains('ouvert');
  document.querySelectorAll('.edu-accord-item.ouvert').forEach(el => el.classList.remove('ouvert'));
  if (!isOpen) item.classList.add('ouvert');
}

// ─── CONTACT ───
async function envoyerFormulaire() {
  const prenom   = document.getElementById('prenom')?.value.trim();
  const nom      = document.getElementById('nom')?.value.trim();
  const courriel = document.getElementById('courriel')?.value.trim();
  const sujet    = document.getElementById('sujet')?.value;
  const message  = document.getElementById('message')?.value.trim();
  const msgSucces = document.getElementById('msg-succes');
  const msgErreur = document.getElementById('msg-erreur');

  if (!prenom || !nom || !courriel || !message) {
    msgErreur.textContent = 'Veuillez remplir tous les champs obligatoires.';
    msgErreur.classList.remove('cache');
    msgSucces.classList.add('cache');
    return;
  }

  const btn = document.getElementById('btn-envoyer');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';

  try {
    const result = await appelAPIPost('envoyerContact', {
      prenom, nom, courriel,
      sujet: sujet || 'Non précisé',
      message
    });
    if (result && result.success) {
      msgSucces.classList.remove('cache');
      msgErreur.classList.add('cache');
      document.getElementById('formulaire-contact').classList.add('cache');
    } else {
      throw new Error('Échec envoi');
    }
  } catch (err) {
    msgErreur.textContent = "Une erreur s'est produite. Veuillez réessayer ou nous écrire directement.";
    msgErreur.classList.remove('cache');
    btn.disabled = false;
    btn.textContent = 'Envoyer le message';
  }
}
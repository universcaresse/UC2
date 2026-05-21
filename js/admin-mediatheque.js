// ─── MÉDIATHÈQUE — GESTION ───
var _mediathequeDonnees = null;


var _medNiveau2 = '';
var _medNiveau3 = '';

function medFiltrerN2(n2) {
  _medNiveau2 = n2;
  _medNiveau3 = '';
  medFiltrer();
}

function medFiltrerN3(n3) {
  _medNiveau3 = n3;
  medFiltrer();
}

async function chargerMediatheque() {
  document.getElementById('med-chargement').classList.remove('cache');
  const res = await appelAPI('getMediatheque');
  document.getElementById('med-chargement').classList.add('cache');
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de chargement.', 'erreur'); return; }
  _mediathequeDonnees = res.items.filter(i => (i.categorie || '').toLowerCase().startsWith('images/'));
  const niveaux2 = [...new Set(_mediathequeDonnees.map(i => i.categorie.split('/')[1]).filter(Boolean))].sort();
  const div = document.getElementById('med-filtres-boutons');
  div.innerHTML = `<button class="bouton bouton-petit actif" onclick="medFiltrerN2('')">Toutes</button>` +
    niveaux2.map(n2 => `<button class="bouton bouton-vert-pale" onclick="medFiltrerN2('${n2}')">${n2}</button>`).join('');
  medFiltrer();
}

function medFiltrer() {
  // Mise à jour boutons niveau 2 actifs
  document.querySelectorAll('#med-filtres-boutons .bouton').forEach(b => {
    const onclick = b.getAttribute('onclick') || '';
    const match = onclick.match(/medFiltrerN2\('([^']*)'\)/);
    const val = match ? match[1] : null;
    if (val === _medNiveau2) {
      b.classList.add('actif');
      b.classList.remove('bouton-vert-pale');
    } else {
      b.classList.remove('actif');
      if (!b.classList.contains('bouton-vert-pale')) b.classList.add('bouton-vert-pale');
    }
  });

  // Construire la rangée niveau 3 si un niveau 2 est sélectionné
  let zoneN3 = document.getElementById('med-filtres-n3');
  if (!zoneN3) {
    zoneN3 = document.createElement('div');
    zoneN3.id = 'med-filtres-n3';
    zoneN3.style.marginTop = '8px';
    document.getElementById('med-filtres-boutons').after(zoneN3);
  }
  if (_medNiveau2) {
    const sousCats = [...new Set((_mediathequeDonnees || [])
      .filter(i => i.categorie.split('/')[1] === _medNiveau2)
      .map(i => i.categorie.split('/')[2])
      .filter(Boolean))].sort();
    if (sousCats.length) {
      zoneN3.innerHTML = `<button class="bouton bouton-petit${!_medNiveau3 ? ' actif' : ' bouton-vert-pale'}" onclick="medFiltrerN3('')">Tout ${_medNiveau2}</button>` +
        sousCats.map(n3 => `<button class="bouton${_medNiveau3 === n3 ? ' actif' : ' bouton-vert-pale'}" onclick="medFiltrerN3('${n3}')">${n3}</button>`).join('');
    } else {
      zoneN3.innerHTML = '';
    }
  } else {
    zoneN3.innerHTML = '';
  }

  // Filtrage des items (logique B : inclut sous-dossiers)
  const items = (_mediathequeDonnees || []).filter(i => {
    const parts = i.categorie.split('/');
    if (_medNiveau2 && parts[1] !== _medNiveau2) return false;
    if (_medNiveau3 && parts[2] !== _medNiveau3) return false;
    return true;
  });

  const grille = document.getElementById('med-grille');
  document.getElementById('med-compteur').textContent = items.length + ' photo(s)';
  if (!items.length) { grille.innerHTML = '<p class="vide-desc">Aucune photo.</p>'; return; }
  grille.innerHTML = items.map(i => {
    const catAffichee = i.categorie.replace(/^images\//i, '');
    return `
    <div class="collection-carte" onclick="medOuvrirPhoto('${i.url}', '${i.nom}')">
      <div class="collection-carte-bg" style="background:#888"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:45%;background:linear-gradient(to top, rgba(0,0,0,0.75), transparent);"></div>
      <img src="${i.url}" alt="${i.nom}" onerror="this.style.display='none'" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
      <div class="collection-carte-contenu" style="background:rgba(0,0,0,0.5);width:100%;padding:8px 12px;border-radius:0 0 8px 8px;">
        <span class="collection-carte-nom">${catAffichee}</span>
        <span class="collection-carte-slogan">${i.nom}</span>
      </div>
    </div>`;
  }).join('');
}

async function envoyerDriveVersCloudinary() {
  afficherChargement();
  afficherMsg('mediatheque', 'Envoi vers Cloudinary en cours… (peut prendre quelques minutes)');
  const res = await appelAPI('envoyerDriveVersCloudinary');
  cacherChargement();
  if (!res || !res.success) {
    afficherMsg('mediatheque', '❌ Erreur : ' + (res?.message || 'inconnue'), 'erreur');
    return;
  }
  afficherMsg('mediatheque', '✅ ' + res.message);
}

async function mediathequeSyncCloudinary() {
  afficherChargement();
  afficherMsg('mediatheque', 'Synchronisation en cours…');
  const res = await appelAPI('syncCloudinary');
  if (!res || !res.success) { cacherChargement(); afficherMsg('mediatheque', 'Erreur de synchronisation.', 'erreur'); return; }
  _mediathequeDonnees = null;
  cacherChargement();
  afficherMsg('mediatheque', `✅ ${res.ajouts} photo(s) ajoutée(s).`);
  chargerMediatheque();
}

// ─── MÉDIATHÈQUE — SÉLECTEUR ───
var _mediathequeChampId   = null;
var _mediathequePreviewId = null;

async function ouvrirMediatheque(champId, previewId, categorie) {
  _mediathequeChampId   = champId;
  _mediathequePreviewId = previewId;
  const overlay = document.getElementById('modal-mediatheque');
  if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
  overlay.classList.add('ouvert');
  if (!_mediathequeDonnees) {
    document.getElementById('mediatheque-chargement').classList.remove('cache');
    const res = await appelAPI('getMediatheque');
    document.getElementById('mediatheque-chargement').classList.add('cache');
    if (res && res.success) _mediathequeDonnees = res.items;
  }
  _medModalNiveau2 = '';
  _medModalNiveau3 = '';
  document.getElementById('mediatheque-filtre-nom').value = '';
  peuplerFiltresCategoriesMediatheque();
  filtrerMediatheque();
}

var _medModalNiveau2 = '';
var _medModalNiveau3 = '';

function peuplerFiltresCategoriesMediatheque() {
  const items = (_mediathequeDonnees || []).filter(i => (i.categorie || '').toLowerCase().startsWith('images/'));
  const niveaux2 = [...new Set(items.map(i => i.categorie.split('/')[1]).filter(Boolean))].sort();
  const divN2 = document.getElementById('med-modal-filtres-n2');
  divN2.innerHTML = `<button class="bouton-filtre${!_medModalNiveau2 ? ' actif' : ''}" onclick="medModalFiltrerN2('')">Toutes</button>` +
    niveaux2.map(n2 => `<button class="bouton-filtre${_medModalNiveau2 === n2 ? ' actif' : ''}" onclick="medModalFiltrerN2('${n2}')">${n2}</button>`).join('');
}

function medModalFiltrerN2(n2) {
  _medModalNiveau2 = n2;
  _medModalNiveau3 = '';
  filtrerMediatheque();
}

function medModalFiltrerN3(n3) {
  _medModalNiveau3 = n3;
  filtrerMediatheque();
}

function filtrerMediatheque() {
  // Mise à jour boutons niveau 2 actifs
  document.querySelectorAll('#med-modal-filtres-n2 .bouton-filtre').forEach(b => {
    const onclick = b.getAttribute('onclick') || '';
    const match = onclick.match(/medModalFiltrerN2\('([^']*)'\)/);
    const val = match ? match[1] : null;
    if (val === _medModalNiveau2) {
      b.classList.add('actif');
      b.classList.remove('bouton-vert-pale');
    } else {
      b.classList.remove('actif');
      if (!b.classList.contains('bouton-vert-pale')) b.classList.add('bouton-vert-pale');
    }
  });

  // Construire la rangée niveau 3
  const zoneN3 = document.getElementById('med-modal-filtres-n3');
  const baseItems = (_mediathequeDonnees || []).filter(i => (i.categorie || '').toLowerCase().startsWith('images/'));
  if (_medModalNiveau2) {
    const sousCats = [...new Set(baseItems
      .filter(i => i.categorie.split('/')[1] === _medModalNiveau2)
      .map(i => i.categorie.split('/')[2])
      .filter(Boolean))].sort();
    if (sousCats.length) {
      zoneN3.innerHTML = `<button class="bouton-filtre${!_medModalNiveau3 ? ' actif' : ''}" onclick="medModalFiltrerN3('')">Tout ${_medModalNiveau2}</button>` +
        sousCats.map(n3 => `<button class="bouton-filtre${_medModalNiveau3 === n3 ? ' actif' : ''}" onclick="medModalFiltrerN3('${n3}')">${n3}</button>`).join('');
    } else {
      zoneN3.innerHTML = '';
    }
  } else {
    zoneN3.innerHTML = '';
  }

  // Filtrage des items
  const nom = (document.getElementById('mediatheque-filtre-nom').value || '').toLowerCase();
  const items = baseItems.filter(i => {
    const parts = i.categorie.split('/');
    if (_medModalNiveau2 && parts[1] !== _medModalNiveau2) return false;
    if (_medModalNiveau3 && parts[2] !== _medModalNiveau3) return false;
    if (nom && !i.nom.toLowerCase().includes(nom)) return false;
    return true;
  }).sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr'));

  const grille = document.getElementById('mediatheque-grille');
  grille.className = 'collections-grille';
  if (!items.length) { grille.innerHTML = '<p class="vide-desc">Aucune photo</p>'; return; }
  grille.innerHTML = items.map(i => {
    const catAffichee = i.categorie.replace(/^images\//i, '');
    return `
    <div class="collection-carte" onclick="selectionnerPhotoMediatheque('${i.url}', '${i.nom}')">
      <div class="collection-carte-bg" style="background:#888"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:45%;background:linear-gradient(to top, rgba(0,0,0,0.75), transparent);"></div>
      <img src="${i.url}" alt="${i.nom}" onerror="this.style.display='none'" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
      <div class="collection-carte-contenu" style="background:rgba(0,0,0,0.5);width:100%;padding:8px 12px;border-radius:0 0 8px 8px;">
        <span class="collection-carte-nom">${catAffichee}</span>
        <span class="collection-carte-slogan">${i.nom}</span>
      </div>
    </div>`;
  }).join('');
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



function medOuvrirPhoto(url, nom) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  overlay.innerHTML = `<img src="${url}" alt="${nom}" style="max-width:90%;max-height:90%;object-fit:contain;">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}
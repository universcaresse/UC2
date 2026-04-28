// ─── MÉDIATHÈQUE — GESTION ───
var _mediathequeDonnees = null;


var _medCatActive = '';

function medFiltrerCat(cat, btn) {
  _medCatActive = cat;
  document.querySelectorAll('#med-filtres-boutons .bouton').forEach(b => {
    b.classList.remove('actif');
    b.classList.add('bouton-contour');
  });
  btn.classList.add('actif');
  btn.classList.remove('bouton-contour');
  medFiltrer();
}

async function chargerMediatheque() {
  document.getElementById('med-chargement').classList.remove('cache');
  const res = await appelAPI('getMediatheque');
  document.getElementById('med-chargement').classList.add('cache');
  if (!res || !res.success) { afficherMsg('mediatheque', 'Erreur de chargement.', 'erreur'); return; }
  _mediathequeDonnees = res.items;
  const cats = [...new Set(res.items.map(i => i.categorie).filter(Boolean))].sort();
  const div  = document.getElementById('med-filtres-boutons');
  div.innerHTML = `<button class="bouton bouton-petit actif" onclick="medFiltrerCat('', this)">Toutes</button>` +
    cats.map(c => `<button class="bouton bouton-petit bouton-contour" onclick="medFiltrerCat('${c}', this)">${c}</button>`).join('');
  medFiltrer();
}

function medFiltrer() {
  const items = (_mediathequeDonnees || []).filter(i => !_medCatActive || i.categorie === _medCatActive);
  const grille = document.getElementById('med-grille');
  document.getElementById('med-compteur').textContent = items.length + ' photo(s)';
  if (!items.length) { grille.innerHTML = '<p class="vide-desc">Aucune photo.</p>'; return; }
  grille.innerHTML = items.map(i => `
    <div class="collection-carte" onclick="medOuvrirPhoto('${i.url}', '${i.nom}')">
      <div class="carte-visuel"><img src="${i.url}" alt="${i.nom}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;"></div>
      <div class="fiche-label">${i.nom}</div>
      <div class="texte-secondaire">${i.categorie}</div>
    </div>`).join('');
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



function medOuvrirPhoto(url, nom) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  overlay.innerHTML = `<img src="${url}" alt="${nom}" style="max-width:90%;max-height:90%;object-fit:contain;border-radius:8px;">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}
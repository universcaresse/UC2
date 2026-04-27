
function afficherRegroupements() {
  const contenu = document.getElementById('contenu-regroupements');
  const vide    = document.getElementById('vide-regroupements');
  const btnNew  = document.getElementById('btn-nouveau-regroupement');
  if (btnNew) btnNew.classList.remove('cache');
  if (!contenu) return;
  contenu.innerHTML = '';
  if (vide) vide.classList.add('cache');
  if (!donneesRegroupements.length) { if (vide) vide.classList.remove('cache'); return; }
  let html = '<div class="collections-grille">';
  donneesRegroupements.forEach(fra => {
    const couleurs = couleurCollection(fra.nom, fra.couleur_hex);
    html += `<div class="collection-carte" onclick="ouvrirFicheRegroupement('${fra.fra_id}')">
      <div class="collection-carte-bg" style="background:linear-gradient(145deg,${couleurs[0]},${couleurs[1]});"></div>
      <div class="collection-carte-overlay"></div>
      <div class="collection-carte-lignes-haut"></div>
      <div class="collection-carte-contenu">
        <span class="collection-carte-nom">${(fra.nom || '').toUpperCase()}</span>
        <span class="collection-carte-slogan">${fra.description || ''}</span>
      </div>
    </div>`;
  });
  html += '</div>';
  contenu.innerHTML = html;
}

function ouvrirFicheRegroupement(fra_id) {
  const fra = donneesRegroupements.find(f => f.fra_id === fra_id);
  if (!fra) { console.log('Regroupement introuvable:', fra_id, donneesRegroupements); return; }
  document.getElementById('fiche-regroupement-titre').textContent      = (fra.nom || '').toUpperCase();
  document.getElementById('fiche-regroupement-desc').textContent       = fra.description || '—';
  const ing = (listesDropdown.fullData || []).find(d => d.ing_id === fra.ing_id);
  document.getElementById('fiche-regroupement-ingredient').textContent = ing ? ing.nom_UC : fra.ing_id;
  const produitsDuRegroupement = donneesProduits.filter(p =>
    (p.ingredients || []).some(i => i.ing_id === fra.ing_id)
  );
  const elProduits = document.getElementById('fiche-regroupement-produits');
  if (elProduits) elProduits.textContent = produitsDuRegroupement.length
    ? produitsDuRegroupement.map(p => p.nom).join(' — ')
    : 'Aucun produit';
  let wrapHtml = '';
  if (fra.photo_url)      wrapHtml += `<img src="${fra.photo_url}" class="fiche-visuel-photo">`;
  if (fra.photo_noel_url) wrapHtml += `<img src="${fra.photo_noel_url}" class="fiche-visuel-photo">`;
  const ficheExtras = document.getElementById('fiche-regroupement-extras');
  if (ficheExtras) ficheExtras.innerHTML = wrapHtml ? `<div class="fiche-visuel">${wrapHtml}</div>` : '';
  document.getElementById('fiche-regroupement-modifier').onclick = () => { console.log('modifier cliqué', fra_id); fermerFicheRegroupement(); modifierRegroupement(fra_id); };
  document.getElementById('btn-supprimer-regroupement').onclick  = () => supprimerRegroupement(fra_id);
  document.getElementById('contenu-regroupements').classList.add('cache');
  document.getElementById('btn-nouveau-regroupement').classList.add('cache');
  document.getElementById('fiche-regroupement').classList.remove('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFicheRegroupement() {
  document.getElementById('fiche-regroupement').classList.add('cache');
  document.getElementById('contenu-regroupements').classList.remove('cache');
  document.getElementById('btn-nouveau-regroupement').classList.remove('cache');
}

function ouvrirFormRegroupement() {
  fermerFicheRegroupement();
  document.getElementById('form-regroupements-titre').textContent      = 'Nouveau regroupement';
  document.getElementById('freg-id').value                             = '';
  document.getElementById('freg-nom').value                            = '';
  document.getElementById('freg-slogan').value                         = '';
  document.getElementById('freg-desc').value                           = '';
  document.getElementById('freg-photo-url').value                      = '';
  document.getElementById('freg-photo-noel-url').value                 = '';
  const selCat = document.getElementById('freg-cat');
  selCat.innerHTML = '<option value="">— Choisir —</option>';
  Object.keys(listesDropdown.categoriesMap || {}).sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr')).forEach(k => {
    const o = document.createElement('option');
    o.value = k; o.textContent = listesDropdown.categoriesMap[k]; selCat.appendChild(o);
  });
  document.getElementById('freg-ing').innerHTML = '<option value="">— Choisir catégorie d\'abord —</option>';
  document.getElementById('freg-ing').disabled  = true;
  peuplerPositionRegroupement(null);
  document.getElementById('contenu-regroupements').classList.add('cache');
  document.getElementById('btn-nouveau-regroupement').classList.add('cache');
  document.getElementById('form-regroupements').classList.remove('cache');
  document.getElementById('form-regroupements').classList.add('visible');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
  document.getElementById('form-regroupements').scrollIntoView({ behavior: 'smooth' });
}

function fermerFormRegroupement() {
  document.getElementById('form-regroupements').classList.add('cache');
  document.getElementById('form-regroupements').classList.remove('visible');
  document.getElementById('contenu-regroupements').classList.remove('cache');
  document.getElementById('btn-nouveau-regroupement').classList.remove('cache');
}

function onCatRegroupementChange() {
  const cat_id = document.getElementById('freg-cat').value;
  peuplerIngredientsRegroupement(cat_id, '');
}

function peuplerIngredientsRegroupement(cat_id, ing_id_actuel) {
  const sel = document.getElementById('freg-ing');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  if (!cat_id) { sel.disabled = true; return; }
  const ings = (listesDropdown.fullData || []).filter(d => d.cat_id === cat_id);
  ings.sort((a, b) => (a.nom_UC || '').localeCompare(b.nom_UC || '', 'fr')).forEach(d => {
    const o = document.createElement('option');
    o.value = d.ing_id; o.textContent = d.nom_UC;
    if (d.ing_id === ing_id_actuel) o.selected = true;
    sel.appendChild(o);
  });
  sel.disabled = false;
}

function peuplerPositionRegroupement(rangActuel) {
  const sel = document.getElementById('freg-position');
  if (!sel) return;
  sel.innerHTML = '<option value="0">En premier</option>';
  donneesRegroupements.slice().sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(fra => {
    const o = document.createElement('option');
    o.value = fra.rang;
    o.textContent = 'Après ' + fra.nom;
    if (rangActuel && fra.rang === rangActuel - 1) o.selected = true;
    sel.appendChild(o);
  });
}

function modifierRegroupement(fra_id) {
  const fra = donneesRegroupements.find(f => f.fra_id === fra_id);
  if (!fra) return;
  document.getElementById('form-regroupements-titre').textContent      = 'Modifier le regroupement';
  document.getElementById('freg-id').value                             = fra.fra_id;
  document.getElementById('freg-nom').value                            = fra.nom || '';
  document.getElementById('freg-slogan').value                         = fra.slogan || '';
  document.getElementById('freg-desc').value                           = fra.description || '';
  document.getElementById('freg-photo-url').value                      = fra.photo_url || '';
  document.getElementById('freg-photo-noel-url').value                 = fra.photo_noel_url || '';
  const selCat = document.getElementById('freg-cat');
  selCat.innerHTML = '<option value="">— Choisir —</option>';
  Object.keys(listesDropdown.categoriesMap || {}).sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr')).forEach(k => {
    const o = document.createElement('option');
    o.value = k; o.textContent = listesDropdown.categoriesMap[k]; selCat.appendChild(o);
  });
  selCat.value = fra.cat_id || '';
  peuplerIngredientsRegroupement(fra.cat_id, fra.ing_id);
  peuplerPositionRegroupement(fra.rang);
  document.getElementById('contenu-regroupements').classList.add('cache');
  document.getElementById('btn-nouveau-regroupement').classList.add('cache');
  document.getElementById('form-regroupements').classList.remove('cache');
  document.getElementById('form-regroupements').classList.add('visible');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
  document.getElementById('form-regroupements').scrollIntoView({ behavior: 'smooth' });
}

async function sauvegarderRegroupement() {
  afficherChargement();
  const id     = document.getElementById('freg-id').value;
  const nom    = document.getElementById('freg-nom').value.trim().toUpperCase();
  const ing_id = document.getElementById('freg-ing').value;
  if (!nom)    { cacherChargement(); afficherMsg('regroupements', 'Le nom est requis.', 'erreur'); return; }
  if (!ing_id) { cacherChargement(); afficherMsg('regroupements', 'L\'ingrédient est requis.', 'erreur'); return; }
  const positionChoisie = parseInt(document.getElementById('freg-position')?.value) || 0;
  const d = {
    fra_id:         id || ('FRA-' + Date.now()),
    rang:           positionChoisie + 1,
    nom,
    slogan:         document.getElementById('freg-slogan').value,
    description:    document.getElementById('freg-desc').value,
    cat_id:         document.getElementById('freg-cat').value,
    ing_id,
    photo_url:      document.getElementById('freg-photo-url').value,
    photo_noel_url: document.getElementById('freg-photo-noel-url').value
  };
  const res = await appelAPIPost('saveRegroupement', d);
  if (res && res.success) {
    cacherChargement();
    fermerFormRegroupement();
    afficherMsg('regroupements', id ? 'Regroupement mis à jour.' : 'Regroupement ajouté.');
    const resRegro = await appelAPI('getRegroupements');
    if (resRegro && resRegro.success) donneesRegroupements = resRegro.items || [];
    afficherRegroupements();
  } else {
    cacherChargement();
    afficherMsg('regroupements', res?.message || 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

async function supprimerRegroupement(fra_id) {
  confirmerAction('Supprimer ce regroupement ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('deleteRegroupement', { fra_id });
    if (res && res.success) {
      cacherChargement();
      fermerFicheRegroupement();
      afficherMsg('regroupements', 'Regroupement supprimé.');
      const resRegro = await appelAPI('getRegroupements');
      if (resRegro && resRegro.success) donneesRegroupements = resRegro.items || [];
      afficherRegroupements();
    } else {
      cacherChargement();
      afficherMsg('regroupements', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

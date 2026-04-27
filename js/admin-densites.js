
var donneesDensites = [];

async function chargerDensites() {
  afficherChargement();
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
  if (!res || !res.success) { cacherChargement(); afficherMsg('densites', 'Erreur.', 'erreur'); return; }
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
  cacherChargement();
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
  afficherChargement();
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
    cacherChargement();
    fermerFormDensite();
    afficherMsg('densites', mode === 'modif' ? 'Densité mise à jour.' : 'Type ajouté.');
    listesDropdown.config[type] = { densite, unite, margePertePct: marge_perte_pct };
    donneesDensites = [];
    chargerDensites();
  } else {
    cacherChargement();
    afficherMsg('densites', res?.message || 'Erreur.', 'erreur');
  }
}



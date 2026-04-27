
var donneesCollections = []; // [{col_id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url}]
var donneesGammes      = []; // [{gam_id, col_id, rang, nom, description, couleur_hex, photo_url, photo_noel_url}]
var filtreGammesColId  = '';

async function chargerCollections() {
  afficherChargement();
  const [resCol, resGam] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getGammes')
  ]);
 if (!resCol || !resCol.success) { cacherChargement(); afficherMsg('collections', 'Erreur lors du chargement.', 'erreur'); return; }
  donneesCollections = resCol.items || [];
  donneesGammes      = (resGam && resGam.success) ? resGam.items || [] : [];
  cacherChargement();
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

function fermerFormCollection() {
	
  document.getElementById('contenu-collections').classList.remove('cache');
  document.getElementById('btn-nouvelle-collection').classList.remove('cache');
  document.getElementById('form-collections').classList.remove('visible');
  document.getElementById('form-collections').classList.add('cache');
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
    afficherChargement();
    const res = await appelAPIPost('deleteCollection', { col_id });
    if (res && res.success) {
      cacherChargement();
      fermerFicheCollection();
      afficherMsg('collections', 'Collection supprimée.');
      await chargerCollections();
    } else {
      cacherChargement();
      afficherMsg('collections', 'Erreur lors de la suppression.', 'erreur');
    }
  });
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


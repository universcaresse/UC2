/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-collections.js
   ═══════════════════════════════════════ */
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
  afficherChargement();
  const [resCol, resFam] = await Promise.all([
    appelAPI('getCollections'),
    appelAPI('getFamilles')
  ]);
  if (!resCol || !resCol.success) { cacherChargement(); afficherMsg('familles', 'Erreur lors du chargement.', 'erreur'); return; }
  donneesCollections = resCol.items || [];
  donneesFamilles    = (resFam && resFam.success) ? resFam.items || [] : [];
  cacherChargement();
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
  const selGam = document.getElementById('ff-gamme');
  if (selGam) {
    selGam.innerHTML = '<option value="">— Aucune —</option>';
    if (col_id) {
      donneesGammes.filter(g => g.col_id === col_id).sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(g => {
        const o = document.createElement('option');
        o.value = g.gam_id; o.textContent = g.nom; selGam.appendChild(o);
      });
    }
  }
  const selPos = document.getElementById('ff-position');
  if (!selPos) return;
  selPos.innerHTML = '<option value="0">En premier</option>';
  if (!col_id) return;
  const gam_id = document.getElementById('ff-gamme')?.value || '';
  donneesFamilles.filter(f => f.col_id === col_id && (!gam_id || f.gam_id === gam_id))
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
  const selGamFam = document.getElementById('ff-gamme');
  if (selGamFam) selGamFam.value = fam.gam_id || '';
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
    gam_id:      document.getElementById('ff-gamme')?.value || '',
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
    afficherChargement();
    const res = await appelAPIPost('deleteFamille', { fam_id });
    if (res && res.success) {
      cacherChargement();
      fermerFicheFamille();
      afficherMsg('familles', 'Famille supprimée.');
      await chargerFamilles();
    } else {
      cacherChargement();
      afficherMsg('familles', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}
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

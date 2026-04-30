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
    const dernierNumFam = donneesFamilles.length ? Math.max(...donneesFamilles.map(f => parseInt((f.fam_id || '').replace('FAM-', '')) || 0)) : 0;
fam_id: id || ('FAM-' + String(dernierNumFam + 1).padStart(4, '0')),
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


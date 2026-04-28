var gammesIngs = [];


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
  gammesIngs = [];
  rafraichirListeGammesIngs();
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
  await new Promise(r => setTimeout(r, 800));
  if (res && res.success) {
console.log('ingrédients:', gammesIngs, 'gam_id:', res.gam_id || d.gam_id);
    await appelAPIPost('saveGammeIngredients', {
      gam_id: res.gam_id || d.gam_id,
      ingredients: gammesIngs.map(i => ({
        ing_id:         i.ing_id || '',
        nom_ingredient: i.nom,
        quantite_g:     i.quantite
      }))
    });
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
    afficherChargement();
    await appelAPIPost('saveGammeIngredients', { gam_id, ingredients: [] });
    const res = await appelAPIPost('deleteGamme', { gam_id, col_id: gam.col_id });
    if (res && res.success) {
      cacherChargement();
      fermerFicheGamme2();
      afficherMsg('gammes', 'Gamme supprimée.');
      const resGam = await appelAPI('getGammes');
      if (resGam && resGam.success) donneesGammes = resGam.items || [];
      afficherGammes();
    } else {
      cacherChargement();
      afficherMsg('gammes', 'Erreur.', 'erreur');
    }
  });
}

async function modifierGamme(gam_id) {
  const gam = donneesGammes.find(g => g.gam_id === gam_id);
  if (!gam) return;
  document.getElementById('contenu-gammes').classList.add('cache');
document.getElementById('btn-nouvelle-gamme').classList.add('cache');
  const resIng = await appelAPI('getGammesIngredients', { gam_id });
  gammesIngs = (resIng && resIng.success ? resIng.items : []).map(i => ({
    ing_id:   i.ing_id,
    type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
    nom:      i.nom_ingredient,
    quantite: i.quantite_g
  }));
  rafraichirListeGammesIngs();
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

function rafraichirListeGammesIngs() {
  const liste = document.getElementById('liste-ingredients-base');
  if (!liste) return;
  if (gammesIngs.length === 0) { liste.innerHTML = ''; return; }
  const cats = [...new Set(listesDropdown.fullData.map(d => d.cat_id))].filter(Boolean).sort();
  liste.innerHTML = gammesIngs.map((ing, i) => {
    const ingsDeType = listesDropdown.fullData.filter(d => d.cat_id === ing.type);
    const inciVal    = (listesDropdown.fullData.find(d => d.nom_UC === ing.nom) || {}).inci || '';
    return `
    <div class="ingredient-rangee">
      <select class="form-ctrl ing-type" onchange="gammesIngs[${i}].type=this.value; gammesIngs[${i}].nom=''; rafraichirListeGammesIngs()">
        <option value="">— Type —</option>
        ${cats.map(t => `<option value="${t}" ${ing.type===t?'selected':''}>${listesDropdown.categoriesMap?.[t]||t}</option>`).join('')}
      </select>
      <select class="form-ctrl ing-nom" onchange="gammesIngs[${i}].nom=this.value; gammesIngs[${i}].ing_id=(listesDropdown.fullData.find(d=>d.nom_UC===this.value)||{}).ing_id||''; rafraichirListeGammesIngs()">
        <option value="">— Ingrédient —</option>
        ${ingsDeType.map(d => `<option value="${d.nom_UC}" ${ing.nom===d.nom_UC?'selected':''}>${d.nom_UC}</option>`).join('')}
      </select>
      <input type="text" class="form-ctrl ing-inci" readonly placeholder="INCI" value="${inciVal}">
      <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${ing.quantite||''}" placeholder="g" onchange="gammesIngs[${i}].quantite=parseFloat(this.value)||0">
      <button class="bouton bouton-petit bouton-rouge" onclick="supprimerGammeIng(${i})">✕</button>
    </div>`;
  }).join('');
}
function ajouterGammeIng() {
  gammesIngs.push({ type: '', nom: '', quantite: 0 });
  rafraichirListeGammesIngs();
}

function supprimerGammeIng(index) {
  gammesIngs.splice(index, 1);
  rafraichirListeGammesIngs();
}
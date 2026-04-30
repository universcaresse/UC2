/* ════════════════════════════════
   FABRICATION V2
════════════════════════════════ */
var _lotsData = [];

async function chargerFabrication() {
  afficherChargement();
  document.getElementById('loading-fabrication').classList.remove('cache');
  document.getElementById('contenu-fabrication').innerHTML = '';
  const res = await appelAPI('getLots');
  document.getElementById('loading-fabrication').classList.add('cache');
  if (!res || !res.success) { cacherChargement(); afficherMsg('fabrication', '❌ Erreur de chargement.'); return; }
  _lotsData = res.items || [];
  cacherChargement();
  afficherTableauFabrication(_lotsData);
}

function fabToggleAccordeon(el) {
  const body = el.nextElementSibling;
  body.classList.toggle('cache');
}

function fabToggleLot(lot_id) {
  const detail = document.getElementById(`fab-detail-${lot_id}`);
  if (!detail) return;
  const estOuvert = !detail.classList.contains('cache');
  document.querySelectorAll('.fab-lot-detail').forEach(d => d.classList.add('cache'));
  if (!estOuvert) detail.classList.remove('cache');
}

function afficherTableauFabrication(lots) {
  const enCure      = lots.filter(l => l.statut === 'en_cure');
  const disponibles = lots.filter(l => l.statut === 'disponible');
  const epuises     = lots.filter(l => l.statut === 'epuise');

  const totalEnCure      = enCure.reduce((s, l) => s + l.nb_unites, 0);
  const totalDisponibles = disponibles.reduce((s, l) => s + l.nb_unites, 0);
  const totalEpuises     = epuises.reduce((s, l) => s + l.nb_unites, 0);

  function grouperParCollection(liste) {
    const groupes = {};
    liste.forEach(l => {
      const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
      const col = pro ? (donneesCollections.find(c => c.col_id === pro.col_id)?.nom || '—') : '—';
      const gam = pro ? (donneesGammes.find(g => g.gam_id === pro.gam_id)?.nom || '—') : '—';
      const cle = col + '||' + gam;
      if (!groupes[cle]) groupes[cle] = { collection: col, gamme: gam, lots: [] };
      groupes[cle].lots.push(l);
    });
    return Object.values(groupes).sort((a, b) => a.collection.localeCompare(b.collection) || a.gamme.localeCompare(b.gamme));
  }

  function rendreLot(l) {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    return `
      <tr class="ligne-cliquable" onclick="fabToggleLot('${l.lot_id}')">
        <td>${pro?.nom || l.pro_id}</td>
        <td>${l.date_fabrication}</td>
        <td>${l.date_disponibilite}</td>
        <td>${l.nb_unites}</td>
        <td>${l.nb_vendus || 0}</td>
        <td>${l.cout_par_unite ? parseFloat(l.cout_par_unite).toFixed(2) + ' $' : '—'}</td>
      </tr>
      <tr class="fab-lot-detail cache" id="fab-detail-${l.lot_id}">
        <td colspan="5">
          <div class="form-grille">
            <div class="form-groupe">
              <label class="form-label">Nb unités</label>
              <input type="number" class="form-ctrl" id="fab-edit-unites-${l.lot_id}" value="${l.nb_unites}" min="0">
            </div>
            <div class="form-groupe">
              <label class="form-label">Jour</label>
              <select class="form-ctrl" id="fab-edit-jour-${l.lot_id}" onchange="fabEditSyncDate('${l.lot_id}')">
                <option value="">— Jour —</option>
                ${Array.from({length:31},(_,i)=>{const v=String(i+1).padStart(2,'0');return `<option value="${v}" ${l.date_fabrication.split('-')[2]===v?'selected':''}>${i+1}</option>`;}).join('')}
              </select>
            </div>
            <div class="form-groupe">
              <label class="form-label">Mois</label>
              <select class="form-ctrl" id="fab-edit-mois-${l.lot_id}" onchange="fabEditSyncDate('${l.lot_id}')">
                <option value="">— Mois —</option>
                ${[['01','Janvier'],['02','Février'],['03','Mars'],['04','Avril'],['05','Mai'],['06','Juin'],['07','Juillet'],['08','Août'],['09','Septembre'],['10','Octobre'],['11','Novembre'],['12','Décembre']].map(([v,n])=>`<option value="${v}" ${l.date_fabrication.split('-')[1]===v?'selected':''}>${n}</option>`).join('')}
              </select>
            </div>
            <div class="form-groupe">
              <label class="form-label">Année</label>
              <select class="form-ctrl" id="fab-edit-annee-${l.lot_id}" onchange="fabEditSyncDate('${l.lot_id}')">
                <option value="">— Année —</option>
                ${Array.from({length:6},(_,i)=>{const a=new Date().getFullYear()-i;return `<option value="${a}" ${l.date_fabrication.split('-')[0]===String(a)?'selected':''}>${a}</option>`;}).join('')}
              </select>
            </div>
            <input type="hidden" id="fab-edit-date-${l.lot_id}" value="${l.date_fabrication}">
          </div>
          <div class="form-actions">
            <button class="bouton bouton-petit" onclick="modifierLot('${l.lot_id}')">Sauvegarder</button>
            <button class="bouton bouton-petit bouton-rouge" onclick="supprimerLot('${l.lot_id}')">Supprimer</button>
          </div>
        </td>
      </tr>`;
  }

  function rendreBlocStatut(titre, total, liste) {
    let h = `<div class="carte-admin">
      <div class="carte-admin-entete">${titre} <span class="texte-secondaire">${total} produit${total !== 1 ? 's' : ''}</span></div>`;
    if (liste.length === 0) {
      h += `<div class="texte-secondaire" style="padding:12px 0">Aucun lot</div>`;
    } else {
      const groupes = grouperParCollection(liste);
      groupes.forEach(g => {
        const totalGroupe = g.lots.reduce((s, l) => s + l.nb_unites, 0);
        h += `<div class="form-panel visible" style="margin:8px 0">
          <div class="form-panel-header" onclick="fabToggleAccordeon(this)" style="cursor:pointer">
            <div class="form-panel-titre">${g.collection} — ${g.gamme}</div>
            <span class="texte-secondaire">${totalGroupe} savon${totalGroupe !== 1 ? 's' : ''}</span>
          </div>
          <div class="form-body">
            <table class="tableau-admin">
              <thead><tr><th>Produit</th><th>Fabriqué le</th><th>Disponible le</th><th>Unités</th><th>Vendus</th><th>Coût/unité</th></tr></thead>
              <tbody>${g.lots.map(rendreLot).join('')}</tbody>
            </table>
          </div>
        </div>`;
      });
    }
    h += `</div>`;
    return h;
  }

  if (!lots.length) {
    document.getElementById('contenu-fabrication').innerHTML = '<div class="vide"><div class="vide-titre">Aucun lot enregistré</div><div class="vide-desc">Créez votre premier lot de fabrication</div></div>';
    return;
  }
  let html = '';
  html += rendreBlocStatut('EN CURE', totalEnCure, enCure);
  html += rendreBlocStatut('DISPONIBLE', totalDisponibles, disponibles);
  html += rendreBlocStatut('ÉPUISÉ', totalEpuises, epuises);
  document.getElementById('contenu-fabrication').innerHTML = html;
}

function fabEditSyncDate(lot_id) {
  const j = document.getElementById(`fab-edit-jour-${lot_id}`).value;
  const m = document.getElementById(`fab-edit-mois-${lot_id}`).value;
  const a = document.getElementById(`fab-edit-annee-${lot_id}`).value;
  if (j && m && a) {
    const date = new Date(`${a}-${m}-${j}`);
    if (!isNaN(date.getTime())) {
      document.getElementById(`fab-edit-date-${lot_id}`).value = `${a}-${m}-${j}`;
    } else {
      document.getElementById(`fab-edit-date-${lot_id}`).value = '';
    }
  } else {
    document.getElementById(`fab-edit-date-${lot_id}`).value = '';
  }
}

function fabSyncDate() {
  const j = document.getElementById('fab-date-jour').value;
  const m = document.getElementById('fab-date-mois').value;
  const a = document.getElementById('fab-date-annee').value;
  if (j && m && a) {
    const date = new Date(`${a}-${m}-${j}`);
    if (!isNaN(date.getTime())) {
      document.getElementById('fab-date').value = `${a}-${m}-${j}`;
    } else {
      document.getElementById('fab-date').value = '';
    }
  } else {
    document.getElementById('fab-date').value = '';
  }
  calculerApercuLot();
}

function ouvrirFormFabrication(existant) {
  const selectCol = document.getElementById('fab-collection');
  selectCol.innerHTML = '<option value="">— Choisir une collection —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.col_id; opt.textContent = c.nom;
    selectCol.appendChild(opt);
  });
  document.getElementById('fab-gamme').innerHTML = '<option value="">— Toutes les gammes —</option>';
  document.getElementById('fab-recette').innerHTML = '<option value="">— Choisir un produit —</option>';

  // Peupler jours
  const selJour = document.getElementById('fab-date-jour');
  selJour.innerHTML = '<option value="">— Jour —</option>';
  for (let i = 1; i <= 31; i++) {
    const o = document.createElement('option');
    o.value = String(i).padStart(2, '0');
    o.textContent = i;
    selJour.appendChild(o);
  }

  // Peupler années
  const selAnnee = document.getElementById('fab-date-annee');
  selAnnee.innerHTML = '<option value="">— Année —</option>';
  const anneeActuelle = new Date().getFullYear();
  for (let a = anneeActuelle; a >= anneeActuelle - 1; a--) {
    const o = document.createElement('option');
    o.value = a; o.textContent = a;
    selAnnee.appendChild(o);
  }

  // Pré-remplir avec aujourd'hui si nouveau lot
  if (!existant) {
    const today = new Date();
    selJour.value = String(today.getDate()).padStart(2, '0');
    document.getElementById('fab-date-mois').value = String(today.getMonth() + 1).padStart(2, '0');
    selAnnee.value = today.getFullYear();
    fabSyncDate();
  } else {
    document.getElementById('fab-date-mois').value = '';
    document.getElementById('fab-date').value = '';
  }

  document.querySelector('#form-fabrication .form-panel-titre').textContent = existant ? 'Entrer un lot existant' : 'Nouveau lot';
  document.getElementById('fab-groupe-multiplicateur').classList.toggle('cache', !!existant);
  document.getElementById('fab-groupe-nb-unites').classList.toggle('cache', !existant);
  document.getElementById('form-fabrication').dataset.mode = existant ? 'existant' : 'nouveau';
  document.getElementById('fab-apercu').classList.add('cache');
  document.getElementById('contenu-fabrication').classList.add('cache');
  document.getElementById('form-fabrication').classList.remove('cache');
}

function fabFiltrerGammes() {
  const col_id = document.getElementById('fab-collection').value;
  const select = document.getElementById('fab-gamme');
  select.innerHTML = '<option value="">— Toutes les gammes —</option>';
  const gammes = donneesGammes.filter(g => !col_id || g.col_id === col_id).sort((a, b) => (a.rang || 99) - (b.rang || 99));
  gammes.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.gam_id; opt.textContent = g.nom; select.appendChild(opt);
  });
  fabFiltrerRecettes();
}

function fabFiltrerRecettes() {
  const col_id = document.getElementById('fab-collection').value;
  const gam_id = document.getElementById('fab-gamme').value;
  const select = document.getElementById('fab-recette');
  select.innerHTML = '<option value="">— Choisir un produit —</option>';
  const produits = donneesProduits
    .filter(p => p.statut !== 'archive' && (!col_id || p.col_id === col_id) && (!gam_id || p.gam_id === gam_id))
    .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
  produits.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.pro_id;
    opt.textContent = p.nom;
    opt.dataset.nbUnites = p.nb_unites || 1;
    opt.dataset.cure     = p.cure || 0;
    select.appendChild(opt);
  });
  document.getElementById('fab-apercu').classList.add('cache');
}

function fabFiltrerFormats() {
  const pro_id = document.getElementById('fab-recette').value;
  const select = document.getElementById('fab-format');
  select.innerHTML = '<option value="">— Choisir un format —</option>';
  if (!pro_id) return;
  appelAPI('getProduitsFormats', { pro_id }).then(res => {
    if (!res || !res.success) return;
    (res.items || []).forEach(f => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ poids: f.poids, unite: f.unite, prix: f.prix_vente, nb_unites: f.nb_unites || 0 });
      opt.textContent = f.poids + ' ' + f.unite + (f.nb_unites ? ' — ' + f.nb_unites + ' unités' : '');
      select.appendChild(opt);
    });
  });
  calculerApercuLot();
}

function fermerFormFabrication() {
  document.getElementById('form-fabrication').classList.add('cache');
  document.getElementById('contenu-fabrication').classList.remove('cache');
  document.getElementById('fab-collection').value = '';
  document.getElementById('fab-gamme').innerHTML = '<option value="">— Toutes les gammes —</option>';
  document.getElementById('fab-recette').innerHTML = '<option value="">— Choisir un produit —</option>';
  document.getElementById('fab-format').innerHTML = '<option value="">— Choisir un format —</option>'; // ← ajouté
  document.getElementById('fab-multiplicateur').value = '1';
  document.getElementById('fab-nb-unites').value = '';
  document.getElementById('fab-date-jour').value = '';
  document.getElementById('fab-date-mois').value = '';
  document.getElementById('fab-date-annee').value = '';
  document.getElementById('fab-date').value = '';
  document.getElementById('fab-apercu').classList.add('cache');
  afficherMsg('fabrication', '');
}

async function calculerApercuLot() {
  const select = document.getElementById('fab-recette');
  const opt    = select.options[select.selectedIndex];
  if (!opt || !opt.value) { document.getElementById('fab-apercu').classList.add('cache'); return; }
  const mode     = document.getElementById('form-fabrication').dataset.mode;
  const multi    = parseInt(document.getElementById('fab-multiplicateur').value) || 1;

  // Récupérer nb_unites du format choisi
  const selFormat = document.getElementById('fab-format');
  const formatVal = selFormat?.value ? JSON.parse(selFormat.value) : {};
  const nbUnitesFormat = formatVal.nb_unites || 0;

  const nbUnites = mode === 'existant'
    ? parseInt(document.getElementById('fab-nb-unites').value) || 0
    : nbUnitesFormat * multi;

  const cure    = parseInt(opt.dataset.cure) || 0;
  const dateFab = document.getElementById('fab-date').value;
  let dateDispo = '—';
  if (dateFab) { const d = new Date(dateFab); d.setDate(d.getDate() + cure); dateDispo = d.toISOString().split('T')[0]; }
  document.getElementById('fab-apercu-unites').textContent = nbUnites + ' unité(s)';
  document.getElementById('fab-apercu-dispo').textContent  = dateDispo;
  document.getElementById('fab-apercu').classList.remove('cache');

  // Charger le stock si nécessaire
  if (!listesDropdown.stock || !listesDropdown.stock.length) {
    const resSto = await appelAPI('getStock');
    listesDropdown.stock = (resSto && resSto.success) ? resSto.items : [];
  }
  const pro_id = opt.value;
  const resIng = await appelAPI('getProduitsIngredients', { pro_id });
  const ings   = (resIng && resIng.success) ? resIng.items : [];
  const cout = calculerCoutRevient(ings);
  if (!nbUnitesFormat) {
    document.getElementById('fab-apercu-cout').textContent = 'Choisir un format';
    return;
  }
  const coutParUnite = nbUnitesFormat > 0 && cout > 0 ? cout / nbUnitesFormat : 0;
  const coutTotal    = mode === 'existant' 
    ? coutParUnite * nbUnites 
    : cout * multi;
  document.getElementById('fab-apercu-cout').textContent = coutParUnite > 0 
    ? coutTotal.toFixed(2) + ' $ total — ' + coutParUnite.toFixed(2) + ' $/unité' 
    : '—';
}

async function modifierLot(lot_id) {
  const lot = _lotsData.find(l => l.lot_id === lot_id);
  if (!lot) return;
  const pro = donneesProduits.find(p => p.pro_id === lot.pro_id);
  const cure = pro ? (pro.cure || 0) : 0;
  const d = new Date(lot.date_fabrication);
  d.setDate(d.getDate() + cure);
  const dateDispo = d.toISOString().split('T')[0];
  const nbUnites = parseInt(document.getElementById(`fab-edit-unites-${lot_id}`).value) || 0;
  const dateFab  = document.getElementById(`fab-edit-date-${lot_id}`).value;
  if (!dateFab) { afficherMsg('fabrication', 'Date de fabrication requise.', 'erreur'); return; }
  if (nbUnites < 0) { afficherMsg('fabrication', 'Nombre d\'unités invalide.', 'erreur'); return; }
  afficherChargement();
  const d2 = new Date(dateFab);
  d2.setDate(d2.getDate() + cure);
  const dateDispo2 = d2.toISOString().split('T')[0];
  const res = await appelAPIPost('updateLot', { lot_id, nb_unites: nbUnites, date_fabrication: dateFab, date_disponibilite: dateDispo2 });
  if (res && res.success) {
    cacherChargement();
    afficherMsg('fabrication', 'Lot mis à jour.');
    chargerFabrication();
  } else {
    cacherChargement();
    afficherMsg('fabrication', 'Erreur.', 'erreur');
  }
}

async function supprimerLot(lot_id) {
  confirmerAction('Supprimer ce lot ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('deleteLot', { lot_id });
    if (res && res.success) {
      cacherChargement();
      afficherMsg('fabrication', 'Lot supprimé.');
      chargerFabrication();
    } else {
      cacherChargement();
      afficherMsg('fabrication', 'Erreur.', 'erreur');
    }
  });
}

async function sauvegarderLot() {
  afficherChargement();
  const select = document.getElementById('fab-recette');
  const opt    = select.options[select.selectedIndex];
  if (!opt || !opt.value) { afficherMsg('fabrication', '❌ Choisir un produit.'); return; }

  const mode     = document.getElementById('form-fabrication').dataset.mode;
  const multi    = parseInt(document.getElementById('fab-multiplicateur').value) || 1;
  const selFormat = document.getElementById('fab-format');
  const formatVal = selFormat?.value ? JSON.parse(selFormat.value) : {};
  const nbUnitesFormat = formatVal.nb_unites || 0;
  const nbUnites = mode === 'existant'
    ? parseInt(document.getElementById('fab-nb-unites').value) || 0
    : nbUnitesFormat * multi;
  const cure    = parseInt(opt.dataset.cure) || 0;
  const dateFab = document.getElementById('fab-date').value;
  if (!dateFab) { cacherChargement(); afficherMsg('fabrication', '❌ Date de fabrication requise.'); return; }

  const d = new Date(dateFab);
  d.setDate(d.getDate() + cure);
  const dateDispo = d.toISOString().split('T')[0];
  if (!listesDropdown.stock || !listesDropdown.stock.length) {
    const resSto = await appelAPI('getStock');
    listesDropdown.stock = (resSto && resSto.success) ? resSto.items : [];
  }
  const resIng2 = await appelAPI('getProduitsIngredients', { pro_id: opt.value });
  const ings2   = (resIng2 && resIng2.success) ? resIng2.items : [];
  const cout    = calculerCoutRevient(ings2);
  const coutParUnite = nbUnitesFormat > 0 ? cout / nbUnitesFormat : 0;
  const lot_id = 'LOT-' + Date.now();
  const res = await appelAPIPost('saveLot', {
    lot_id,
    pro_id:             opt.value,
    multiplicateur:     multi,
    nb_unites:          nbUnites,
    date_fabrication:   dateFab,
    date_disponibilite: dateDispo,
    format_poids:       formatVal.poids || '',
    format_unite:       formatVal.unite || '',
    nb_unites_format:   nbUnitesFormat,
    cout_ingredients:   coutParUnite * nbUnites,
    cout_emballages:    0,
    cout_revient_total: coutParUnite * nbUnites,
    cout_par_unite:     coutParUnite
  });

  if (res && res.success) {
    cacherChargement();
    fermerFormFabrication();
    await chargerFabrication();
  } else {
    cacherChargement();
    afficherMsg('fabrication', '❌ ' + (res?.message || 'Erreur.'));
  }
}

// ─── COÛT DE REVIENT ───

function calculerCoutRevient(ingredients) {
  const stock  = listesDropdown.stock  || [];
  const config = listesDropdown.config || {};

  let total = 0;
  ingredients.forEach(ing => {
    const stockItem = stock.find(s => s.ing_id === ing.ing_id);
    if (!stockItem) return;

    const prixParG = stockItem.prix_par_g_reel || 0;
    const cat_id   = stockItem.cat_id || '';
    const cfg      = config[cat_id] || {};
    const perte    = cfg.margePertePct || 0;
    const facteur  = 1 + (perte / 100);

    total += (ing.quantite_g || 0) * prixParG * facteur;
  });

  // Structure ouverte pour bonifier plus tard :
  // total += coutEmballages;
  // total += coutMainOeuvre;

  return total;
}

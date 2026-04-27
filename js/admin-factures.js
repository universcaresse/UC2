var toutesFactures = [];

async function chargerFactures() {
  afficherChargement();
  const loading = document.getElementById('loading-factures');
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  if (loading) loading.classList.remove('cache');
  if (tableau) tableau.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  // V2 : getAchatsEntete
  const [resAch, resFour] = await Promise.all([
    appelAPI('getAchatsEntete'),
    appelAPI('getFournisseurs')
  ]);
  if (loading) loading.classList.add('cache');
  if (!resAch || !resAch.success) { cacherChargement(); afficherMsg('factures', 'Erreur lors du chargement.', 'erreur'); return; }

  const fournisseursMap = {};
  (resFour?.items || []).forEach(f => { fournisseursMap[f.four_id] = f.nom; });

  toutesFactures = (resAch.items || []).map(a => ({
    ...a,
    numero:      a.ach_id,
    fournisseur: fournisseursMap[a.four_id] || a.four_id || '—',
    dateRaw:     a.date ? a.date.split('/').reverse().join('-') : '',
    dateAff:     a.date || '—',
    total:       a.total,
    statut:      a.statut
  }));

  const selFourn    = document.getElementById('filtre-fournisseur');
  const fournisseurs = [...new Set(toutesFactures.map(f => f.fournisseur).filter(Boolean))].sort();
  selFourn.innerHTML = '<option value="">Tous les fournisseurs</option>';
  fournisseurs.forEach(f => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f; selFourn.appendChild(o);
  });

  cacherChargement();
  afficherFactures(toutesFactures);
}

function filtrerFactures() {
  const fourn  = document.getElementById('filtre-fournisseur').value;
  const statut = document.getElementById('filtre-statut').value;
  const debut  = document.getElementById('filtre-date-debut').value;
  const fin    = document.getElementById('filtre-date-fin').value;
  const filtrees = toutesFactures.filter(f => {
    if (fourn  && f.fournisseur !== fourn) return false;
    if (statut && f.statut !== statut)     return false;
    if (debut  && f.dateRaw < debut)       return false;
    if (fin    && f.dateRaw > fin)         return false;
    return true;
  });
  afficherFactures(filtrees);
}

function reinitialiserFiltres() {
  document.getElementById('filtre-fournisseur').value  = '';
  document.getElementById('filtre-statut').value       = '';
  document.getElementById('filtre-date-debut').value   = '';
  document.getElementById('filtre-date-fin').value     = '';
  afficherFactures(toutesFactures);
}

function afficherFactures(liste) {
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  const tbody   = document.getElementById('tbody-factures');
  const compte  = document.getElementById('factures-compte');
  const totalEl = document.getElementById('factures-total');

  if (compte) compte.textContent = liste.length + ' facture' + (liste.length > 1 ? 's' : '');

  if (!liste.length) {
    if (tableau) tableau.classList.add('cache');
    if (vide)    vide.classList.remove('cache');
    if (totalEl) totalEl.classList.add('cache');
    return;
  }

  tbody.innerHTML = '';
  const triees = [...liste].sort((a, b) => (b.dateRaw || '').localeCompare(a.dateRaw || ''));
  triees.forEach(f => {
    const badge = f.statut === 'Finalisé'
      ? `<span class="badge-statut-ok">✓</span>`
      : `<span class="badge-statut-cours">●</span>`;
    const tr = document.createElement('tr');
    tr.className = 'cliquable';
    tr.onclick = () => voirDetailFacture(f.ach_id);
    tr.innerHTML = `
      <td>${f.fournisseur}</td>
      <td class="td-numero">${f.numero_facture || '—'}</td>
      <td class="td-date">${f.dateAff}</td>
      <td class="td-prix">${f.total ? formaterPrix(f.total) : '—'}</td>
      <td>${badge}</td>`;
    tbody.appendChild(tr);
  });

  const total = triees.reduce((acc, f) => acc + (parseFloat(f.total) || 0), 0);
  if (totalEl) { totalEl.textContent = formaterPrix(total); totalEl.classList.remove('cache'); }

  if (vide)    vide.classList.add('cache');
  if (tableau) tableau.classList.remove('cache');
}

async function voirDetailFacture(ach_id) {
  afficherChargement();
  if (!listesDropdown.fullData || !listesDropdown.fullData.length) {
    const resInci = await appelAPI('getIngredientsInci');
    if (resInci && resInci.success) listesDropdown.fullData = resInci.items || [];
  }
  const facture = toutesFactures.find(f => f.ach_id === ach_id);
  const modal   = document.getElementById('modal-facture');
  modal.classList.add('ouvert');
  document.getElementById('modal-facture-titre').textContent = 'Facture ' + (facture?.numero_facture || ach_id);
  document.getElementById('modal-facture-info').textContent  = facture ? facture.date + ' — ' + facture.fournisseur : '';
  document.getElementById('contenu-detail-facture').innerHTML = '';
  document.getElementById('loading-detail-facture').classList.remove('cache');
  cacherChargement();;

  // V2 : getAchatsLignes
  const res = await appelAPI('getAchatsLignes', { ach_id });
  document.getElementById('loading-detail-facture').classList.add('cache');

  if (!res || !res.success || !res.items.length) {
    document.getElementById('contenu-detail-facture').innerHTML = '<div class="vide"><div class="vide-titre">Aucun produit</div></div>';
    return;
  }

  let html = `
    <div class="tableau-wrap">
      <table>
        <thead>
          <tr><th>Ingrédient</th><th>Format</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr>
        </thead>
        <tbody>`;
  res.items.forEach(l => {
    const ing = listesDropdown.fullData.find(d => d.ing_id === l.ing_id);
    html += `
      <tr>
        <td style="font-weight:500">${ing?.nom_UC || l.ing_id}</td>
        <td style="color:var(--gris);font-size:0.78rem">${l.format_qte} ${l.format_unite}</td>
        <td>${l.quantite}</td>
        <td>${formaterPrix(l.prix_unitaire)}</td>
        <td style="color:var(--primary);font-weight:500">${formaterPrix(l.prix_total)}</td>
      </tr>`;
  });
  html += `</tbody></table></div>`;

  const sousTotal = res.items.reduce((s, l) => s + (l.prix_total || 0), 0);
  const tps       = facture ? parseFloat(facture.tps)       || 0 : 0;
  const tvq       = facture ? parseFloat(facture.tvq)       || 0 : 0;
  const livraison = facture ? parseFloat(facture.livraison) || 0 : 0;
  const total     = facture ? parseFloat(facture.total)     || 0 : sousTotal;

  html += `
    <div class="facture-totaux">
      <div class="facture-total-ligne">Sous-total <span>${formaterPrix(sousTotal)}</span></div>
      ${tps       ? `<div class="facture-total-ligne">TPS <span>${formaterPrix(tps)}</span></div>` : ''}
      ${tvq       ? `<div class="facture-total-ligne">TVQ <span>${formaterPrix(tvq)}</span></div>` : ''}
      ${livraison ? `<div class="facture-total-ligne">Livraison <span>${formaterPrix(livraison)}</span></div>` : ''}
      <div class="facture-total-ligne facture-total-final">Total <span>${formaterPrix(total)}</span></div>
    </div>
    <div class="form-actions">
      <button class="bouton bouton-rouge" onclick="fermerModalFacture(); supprimerFacture('${ach_id}')">Supprimer</button>
    </div>`;
  document.getElementById('contenu-detail-facture').innerHTML = html;
}

function fermerModalFacture() {
  document.getElementById('modal-facture').classList.remove('ouvert');
}

function supprimerFacture(ach_id) {
  confirmerAction('Supprimer cette facture et tous ses items ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('deleteAchat', { ach_id });
    if (res && res.success) {
      cacherChargement();
      afficherMsg('factures', 'Facture supprimée.');
      chargerFactures();
    } else {
      cacherChargement();
      afficherMsg('factures', 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

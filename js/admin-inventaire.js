/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-inventaire.js
   ═══════════════════════════════════════ */
var donneesInventaire = [];
async function chargerInventaire() {
  afficherChargement();
  const loading = document.getElementById('loading-inventaire');
  const contenu = document.getElementById('contenu-inventaire');
  const vide    = document.getElementById('vide-inventaire');
  if (loading) loading.classList.remove('cache');
  if (contenu) contenu.innerHTML = '';
  if (vide)    vide.classList.add('cache');

  // V2 : getStock
  if (!listesDropdown.categoriesMap || Object.keys(listesDropdown.categoriesMap).length === 0) {
    const resCats = await appelAPI('getCategoriesUC');
    if (resCats && resCats.success) {
      listesDropdown.categoriesMap = {};
      (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
    }
  }
 const res = await appelAPI('getStock');
  
  
  if (loading) loading.classList.add('cache');
  if (!res || !res.success) { cacherChargement(); afficherMsg('inventaire', 'Erreur.', 'erreur'); return; }

  const items = res.items || [];
  if (!items.length) { if (vide) vide.classList.remove('cache'); return; }

  // Regrouper par cat_id
  const parCat = {};
  items.forEach(item => {
    const cat = item.cat_id || 'Sans catégorie';
    if (!parCat[cat]) parCat[cat] = [];
    parCat[cat].push(item);
  });

 let html  = '';
  let total = 0;

  Object.keys(parCat).sort().forEach(cat => {
    const nomCat = listesDropdown.categoriesMap?.[cat] || cat;
    let lignes = '';
    parCat[cat].forEach(item => {
      total += (item.qte_g || 0) * (item.prix_par_g_reel || 0);
      lignes += `
        <tr>
          <td>${item.nom_UC || item.ing_id}</td>
          <td>${parseFloat(item.qte_g || 0).toFixed(0)} g</td>
          <td>${item.prix_par_g_reel ? parseFloat(item.prix_par_g_reel).toFixed(4) + ' $/g' : '—'}</td>
          <td>${item.date_derniere_maj || '—'}</td>
        </tr>`;
    });
    html += `
      <div class="form-panel visible">
        <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
          <div class="form-panel-titre">${nomCat}</div>
          <span class="badge-statut-ok">${parCat[cat].length} ingrédient(s)</span>
        </div>
        <div class="form-body inci-accord-body cache">
          <div class="tableau-wrap">
            <table class="tableau-admin">
              <thead><tr><th>Ingrédient</th><th>Stock (g)</th><th>Prix/g réel</th><th>Dernière màj</th></tr></thead>
              <tbody>${lignes}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  });

  html += `<div class="inv-total">
      <div class="inv-total-label">Valeur totale de l'inventaire</div>
      <div class="inv-total-montant">${formaterPrix(total)}</div>
    </div>`;
 donneesInventaire = items;
  cacherChargement();
  if (contenu) contenu.innerHTML = html;

  const types = [...new Set(items.map(i => i.cat_id).filter(Boolean))].sort();
  const selType = document.getElementById('inv-filtre-type');
  if (selType) {
    const valType = selType.value;
    selType.innerHTML = '<option value="">Tous les types</option>' +
      types.map(t => `<option value="${t}">${listesDropdown.categoriesMap?.[t] || t}</option>`).join('');
    selType.value = valType;
  }
}
function filtrerInventaire() {
  const recherche  = (document.getElementById('inv-recherche')?.value || '').toLowerCase();
  const typeFiltre = document.getElementById('inv-filtre-type')?.value || '';
  const contenu    = document.getElementById('contenu-inventaire');
  if (!contenu || !donneesInventaire.length) return;
  const filtres = donneesInventaire.filter(i =>
    (!recherche  || (i.nom_UC || '').toLowerCase().includes(recherche)) &&
    (!typeFiltre || i.cat_id === typeFiltre)
  );
  const parCat = {};
  filtres.forEach(item => {
    const cat = item.cat_id || 'Sans catégorie';
    if (!parCat[cat]) parCat[cat] = [];
    parCat[cat].push(item);
  });
 
let html  = '';
  let total = 0;
  Object.keys(parCat).sort().forEach(cat => {
    const nomCat = listesDropdown.categoriesMap?.[cat] || cat;
    let lignes = '';
    parCat[cat].forEach(item => {
      total += (item.qte_g || 0) * (item.prix_par_g_reel || 0);
      lignes += `<tr><td>${item.nom_UC || item.ing_id}</td><td>${parseFloat(item.qte_g || 0).toFixed(0)} g</td><td>${item.prix_par_g_reel ? parseFloat(item.prix_par_g_reel).toFixed(4) + ' $/g' : '—'}</td><td>${item.date_derniere_maj || '—'}</td></tr>`;
    });
    html += `
      <div class="form-panel visible">
        <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
          <div class="form-panel-titre">${nomCat}</div>
          <span class="badge-statut-ok">${parCat[cat].length} ingrédient(s)</span>
        </div>
        <div class="form-body inci-accord-body cache">
          <div class="tableau-wrap">
            <table class="tableau-admin">
              <thead><tr><th>Ingrédient</th><th>Stock (g)</th><th>Prix/g réel</th><th>Dernière màj</th></tr></thead>
              <tbody>${lignes}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  });
  html += `<div class="inv-total"><div class="inv-total-label">Valeur totale de l'inventaire</div><div class="inv-total-montant">${formaterPrix(total)}</div></div>`;
 contenu.innerHTML = html;
}
function reinitialiserFiltresInventaire() {
  const el = document.getElementById('inv-recherche');
  if (el) el.value = '';
  filtrerInventaire();
}




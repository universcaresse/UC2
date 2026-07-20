var inciDonnees      = [];
var inciCategoriesUC = [];
var inciPrixParIng   = {};

async function chargerInci() {
  afficherChargement();
  document.getElementById('loading-inci').classList.remove('cache');
  document.getElementById('inci-accordeons').innerHTML = '';

  // V2 : getIngredientsInci + getCategoriesUC + getStock (prix au g)
  const [resInci, resUC, resStock] = await Promise.all([
    appelAPI('getIngredientsInci'),
    appelAPI('getCategoriesUC'),
    appelAPI('getStock')
  ]);
  inciPrixParIng = {};
  if (resStock && resStock.success) {
    (resStock.items || []).forEach(s => { inciPrixParIng[s.ing_id] = s.prix_par_g_reel; });
  }

  if (resInci && resInci.success) {
    listesDropdown.fullData = resInci.items || [];
    listesDropdown.types    = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean);
    inciDonnees = resInci.items;
  }
  inciCategoriesUC = (resUC && resUC.success) ? resUC.items : [];
  memoriserCatsInci(inciCategoriesUC);

  document.getElementById('loading-inci').classList.add('cache');
  cacherChargement();
  inciConstruireAccordeons();;
}

function inciAppliquerFiltres(btn, groupe) {
  if (btn && groupe) {
    document.querySelectorAll(`[data-filtre-${groupe}]`).forEach(b => b.classList.remove('actif'));
    btn.classList.add('actif');
  }
  inciConstruireAccordeons();
}

function inciCatRequiert(cat_id) {
  return catRequiertInci(cat_id);
}

function inciGetFiltres() {
  const recherche = document.getElementById('inci-recherche');
  return { recherche: recherche ? recherche.value.trim().toLowerCase() : '' };
}

function inciConstruireAccordeons() {
  const recherche = document.getElementById('inci-recherche')?.value.trim().toLowerCase() || '';
  const container = document.getElementById('inci-accordeons');
  container.innerHTML = '';

  // Regrouper par cat_id
  const parCat = {};
const filtreStatut = document.querySelector('[data-filtre-statut].actif')?.dataset?.filtreStatut || 'tout';
  const filtreSource = document.querySelector('[data-filtre-source].actif')?.dataset?.filtreSource || 'tout';

  inciDonnees.forEach(l => {
    if (recherche && !(l.nom_UC || '').toLowerCase().includes(recherche)) return;
    if (filtreStatut === 'a-valider' && (l.inci || !inciCatRequiert(l.cat_id))) return;
    if (filtreStatut === 'valide'    && !l.inci) return;
    if (filtreStatut === 'sans-prix' && inciPrixParIng[l.ing_id] > 0) return;
    if (filtreSource !== 'tout'      && l.source !== filtreSource) return;
    const catObj = inciCategoriesUC.find(c => c.cat_id === l.cat_id);
    const cat = catObj?.nom || l.cat_id || 'Sans catégorie';
    if (!parCat[cat]) parCat[cat] = [];
    parCat[cat].push(l);
  });

  const cats = Object.keys(parCat).sort();
  if (cats.length === 0) {
    const vide = document.createElement('div');
    vide.className = 'vide';
    vide.innerHTML = '<div class="vide-titre">Aucun ingrédient à afficher</div>';
    container.appendChild(vide);
    return;
  }

  cats.forEach((cat, idx) => {
    const lignes     = parCat[cat];
    const nbInci     = lignes.filter(l => l.inci).length;
    const nbSansInci = inciCatRequiert(lignes[0].cat_id) ? lignes.length - nbInci : 0;
    const nbSansPrix = lignes.filter(l => !(inciPrixParIng[l.ing_id] > 0)).length;

    const bloc = document.createElement('div');
    bloc.className = 'form-panel visible';
    bloc.dataset.cat = cat;
    bloc.innerHTML = `
      <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
        <div class="form-panel-titre">${cat}</div>
        <div style="display:flex;gap:8px;align-items:center">
          ${nbSansInci > 0 ? `<span class="badge-statut-cours">${nbSansInci} 🔴</span>` : ''}
          ${nbSansPrix > 0 ? `<span class="badge-statut-cours">${nbSansPrix} 💲</span>` : ''}
          <span class="badge-statut-ok">${nbInci} ✅</span>
        </div>
      </div>
      <div class="form-body inci-accord-body cache">
        <div class="tableau-wrap">
          <table class="tableau-admin tableau-inci">
            <tbody>
              ${lignes.sort((a,b) => (a.nom_UC||'').localeCompare(b.nom_UC||'','fr')).map((l, i) => inciRendreLigne(l, cat, `${idx}-${i}`)).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    container.appendChild(bloc);
  });
}

function inciRendreLigne(l, cat, uid) {
  const aInci      = !!l.inci;
  const statutLabel = aInci ? '✅' : '🔴';
  const id         = `inci-${uid}`;
  const nomSafe    = (l.nom_UC || '').replace(/'/g, "\\'");
  const catSafe    = cat.replace(/'/g, "\\'");
  return `
    <tr class="ligne-cliquable" onclick="inciToggleDetail('${id}')">
      <td>${l.nom_UC || l.ing_id}</td>
     <td>${l.source || ''}</td>
      <td>${l.inci || ''}</td>
      <td>${inciPrixParIng[l.ing_id] > 0 ? formaterPrix(inciPrixParIng[l.ing_id] * 100) + '/100 g' : '💲'}</td>
      <td><span>${inciCatRequiert(l.cat_id) ? statutLabel : ''}</span></td>
    </tr>
    <tr class="accordeon-detail cache" id="${id}-detail" data-ing-id="${l.ing_id || ''}">
      <td colspan="5">
        <div class="form-groupe">
          <label class="form-label">INCI</label>
          <textarea class="form-ctrl" id="${id}-inci" rows="3">${(l.inci || '').replace(/</g, '&lt;')}</textarea>
        </div>
        <div class="form-groupe">
          <label class="form-label">Nom botanique</label>
          <input type="text" class="form-ctrl" id="${id}-bot" value="${(l.nom_botanique || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-groupe">
          <label class="form-label">Note olfactive</label>
          <input type="text" class="form-ctrl" id="${id}-note" value="${(l.note_olfactive || '').replace(/"/g, '&quot;')}">
        </div>
        ${l.source ? `<div class="form-groupe">
          <label class="form-label">Données fournisseur</label>
          <textarea class="form-ctrl" id="${id}-scraping" rows="4" readonly placeholder="Chargement…"></textarea>
        </div>` : ''}
        <hr class="separateur">
        <div class="form-actions">
          <span></span>
          <button class="bouton bouton-petit" onclick="inciValider('${id}','${nomSafe}','${catSafe}','${l.ing_id||''}')">Sauvegarder</button>
        </div>
      </td>
    </tr>`;
}

async function inciToggleDetail(id) {
  const detail = document.getElementById(`${id}-detail`);
  if (!detail) return;
  const estOuvert = !detail.classList.contains('cache');
  document.querySelectorAll('.accordeon-detail').forEach(d => { if (d !== detail) d.classList.add('cache'); });
  detail.classList.toggle('cache', estOuvert);
  if (estOuvert) return;
  const ing = listesDropdown.fullData.find(d => d.ing_id === detail.dataset.ingId);
  if (!ing || !ing.source) return;
  const zoneScraping = document.getElementById(`${id}-scraping`);
  if (!zoneScraping) return;
  zoneScraping.textContent = ing.texte_brut || 'Aucune donnée fournisseur.';
}

function inciToggleAccordeon(header) {
  const body = header.nextElementSibling;
  const estOuvert = !body.classList.contains('cache');
  document.querySelectorAll('.inci-accord-body').forEach(b => { if (b !== body) b.classList.add('cache'); });
  body.classList.toggle('cache', estOuvert);
  if (!estOuvert) setTimeout(() => header.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

async function inciValider(id, nom_UC, cat_id, ing_id) {
  afficherChargement();
  const inci          = document.getElementById(`${id}-inci`)?.value  || '';
  const nomBotanique  = document.getElementById(`${id}-bot`)?.value   || '';
  const noteOlfactive = document.getElementById(`${id}-note`)?.value  || '';
  if (!ing_id) { afficherMsg('inci', 'Ingrédient introuvable.', 'erreur'); return; }
  const res = await appelAPIPost('saveIngredientInci', { ing_id, inci, nom_botanique: nomBotanique, note_olfactive: noteOlfactive, statut: '✅ Validé' });
  if (res && res.success) {
    cacherChargement();
    afficherMsg('inci', '✅ INCI sauvegardé.');
    listesDropdown.fullData = listesDropdown.fullData.map(d => d.ing_id === ing_id ? { ...d, inci, nom_botanique: nomBotanique, note_olfactive: noteOlfactive, statut: '✅ Validé' } : d);
    document.getElementById(`${id}-detail`)?.classList.add('cache');
    await chargerInci();
  } else {
    cacherChargement();
    afficherMsg('inci', res?.message || 'Erreur lors de la sauvegarde.', 'erreur');
  }
}



function inciRendreCorrespondance()    { return ''; }
function inciAjouterCorrespondance()   {}
function inciToggleNouvelleCategorie() {}
async function inciConfirmerCorrespondance() {}
async function inciSauvegarderCorrespondance() {}
function inciAjouterNomUC()            {}
function fermerModalNomUC()            {}
async function confirmerModalNomUC()   {}
function inciRechercher()              {}
function fermerModalAjouterInci()      { document.getElementById('modal-ajouter-inci')?.classList.remove('ouvert'); }
async function modalInciGo() {
  const modal      = document.getElementById('modal-ajouter-inci');
  const idx        = modal?.dataset.idx;
  const fournisseur = modal?.dataset.fournisseur;
  const nom        = document.getElementById('modal-inci-nom')?.value.trim();
  const inci       = document.getElementById('modal-inci-inci')?.value.trim();
  const cat        = document.getElementById('if-type-' + idx)?.value;
  if (!nom) { afficherMsg('import-facture', 'Le nom est requis.', 'erreur'); return; }
  if (!cat) { afficherMsg('import-facture', 'Choisir une catégorie dans le tableau.', 'erreur'); return; }
  const ing_id = 'ING-' + Date.now();
  const res = await appelAPIPost('createIngredientInci', { ing_id, cat_id: cat, nom_UC: nom, nom_fournisseur: nom, inci: inci || '', statut: 'actif' });
  if (!res || !res.success) { afficherMsg('import-facture', res?.message || 'Erreur création ingrédient.', 'erreur'); return; }
  listesDropdown.fullData.push({ ing_id, cat_id: cat, nom_UC: nom, inci: inci || '' });
  const item = ifItems[idx];
  // import désactivé
  const select = document.getElementById(`if-nomuc-${idx}`);
  if (select) {
    const opt = document.createElement('option');
    opt.value = nom; opt.textContent = nom; opt.selected = true;
    select.appendChild(opt);
  }
  const tr = document.getElementById(`if-nomuc-${idx}`)?.closest('tr');
  if (tr) tr.classList.remove('ligne-rouge');
  fermerModalAjouterInci();
  afficherMsg('import-facture', `✅ "${nom}" créé et mappé.`);
}
function modalInciToggleChamps()       {}
function modalInciSyncNomUC()         {}
function afficherStatutModalInci()     {}



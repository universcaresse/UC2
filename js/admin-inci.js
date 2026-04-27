var inciDonnees      = [];
var inciCategoriesUC = [];

async function chargerInci() {
  afficherChargement();
  document.getElementById('loading-inci').classList.remove('cache');
  document.getElementById('inci-accordeons').innerHTML = '';

  // V2 : getIngredientsInci + getCategoriesUC
  const [resInci, resUC] = await Promise.all([
    appelAPI('getIngredientsInci'),
    appelAPI('getCategoriesUC')
  ]);

  if (resInci && resInci.success) {
    listesDropdown.fullData = resInci.items || [];
    listesDropdown.types    = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean);
    inciDonnees = resInci.items;
  }
  inciCategoriesUC = (resUC && resUC.success) ? resUC.items : [];

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

function inciGetFiltres() {
  const recherche = document.getElementById('inci-recherche');
  return { recherche: recherche ? recherche.value.trim().toLowerCase() : '' };
}

function inciConstruireAccordeons() {
  const recherche = document.getElementById('inci-recherche')?.value.trim().toLowerCase() || '';
  const container = document.getElementById('inci-accordeons');
  container.innerHTML = '';

  // Accordéon 1 — Catégories UC
  const blocUC = document.createElement('div');
  blocUC.className = 'form-panel visible';
  blocUC.innerHTML = `
    <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
      <div class="form-panel-titre">Catégories Univers Caresse</div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge-statut-ok">${inciCategoriesUC.length} catégories</span>
      </div>
    </div>
    <div class="form-body inci-accord-body cache" id="inci-uc-body">
      ${inciRendreUC()}
    </div>`;
  container.appendChild(blocUC);

  // Regrouper par cat_id
  const parCat = {};
const filtreStatut = document.querySelector('[data-filtre-statut].actif')?.dataset?.filtreStatut || 'tout';
  const filtreSource = document.querySelector('[data-filtre-source].actif')?.dataset?.filtreSource || 'tout';

  inciDonnees.forEach(l => {
    if (recherche && !(l.nom_UC || '').toLowerCase().includes(recherche)) return;
    const catsSansInci = CATS_SANS_INCI;
    const exempteSansInci = catsSansInci.includes(l.cat_id);
    if (filtreStatut === 'a-valider' && (l.inci || exempteSansInci)) return;
    if (filtreStatut === 'valide'    && !l.inci && !exempteSansInci) return;
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
    const nbSansInci = lignes.length - nbInci;

    const bloc = document.createElement('div');
    bloc.className = 'form-panel visible';
    bloc.dataset.cat = cat;
    bloc.innerHTML = `
      <div class="form-panel-header" onclick="inciToggleAccordeon(this)" style="cursor:pointer">
        <div class="form-panel-titre">${cat}</div>
        <div style="display:flex;gap:8px;align-items:center">
          ${nbSansInci > 0 && !['CAT-1776369774938', 'CAT-1776641557249', 'CAT-014'].includes(lignes[0]?.cat_id) ? `<span class="badge-statut-cours">${nbSansInci} 🔴</span>` : ''}
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
  const catsSansInci2 = CATS_SANS_INCI;
  const aInci      = !!l.inci || catsSansInci2.includes(l.cat_id);
  const statutLabel = aInci ? '✅' : '🔴';
  const id         = `inci-${uid}`;
  const nomSafe    = (l.nom_UC || '').replace(/'/g, "\\'");
  const catSafe    = cat.replace(/'/g, "\\'");
  return `
    <tr class="ligne-cliquable" onclick="inciToggleDetail('${id}')">
      <td>${l.nom_UC || l.ing_id}</td>
      <td>${l.nom_fournisseur || ''}</td>
      <td>${l.inci || ''}</td>
      <td><span>${statutLabel}</span></td>
    </tr>
    <tr class="accordeon-detail cache" id="${id}-detail" data-ing-id="${l.ing_id || ''}">
      <td colspan="4">
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
  if (!zoneScraping || zoneScraping.dataset.charge === 'true') return;
  zoneScraping.textContent = 'Recherche en cours…';
  const res = await appelAPI('rechercherScraping', { source: ing.source, nom_UC: ing.nom_fournisseur || ing.nom_UC });
  if (!res || !res.success || !res.found) { zoneScraping.textContent = 'Aucune donnée de scraping trouvée.'; return; }
  zoneScraping.dataset.charge = 'true';
  if (res.inci && !document.getElementById(`${id}-inci`).value) document.getElementById(`${id}-inci`).value = res.inci;
  if (res.nom_botanique && !document.getElementById(`${id}-bot`).value) document.getElementById(`${id}-bot`).value = res.nom_botanique;
  zoneScraping.textContent = res.texte_brut || 'Aucun texte brut disponible.';
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

function inciRendreUC() {
  if (inciCategoriesUC.length === 0) {
    return `<p class="form-valeur">Aucune catégorie définie.</p>
      <button class="bouton bouton-petit bouton-vert-pale" onclick="inciAjouterUC()">+ Ajouter une catégorie</button>`;
  }
  const cartes = [...inciCategoriesUC].sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).map((c, i) => {
    const utilise = (listesDropdown.fullData || []).filter(d => d.cat_id === c.cat_id);
    return `
      <div class="carte-admin">
        <div class="carte-admin-entete">
          <input type="text" class="form-ctrl" id="uc-cat-${i}" value="${(c.nom || '').replace(/"/g, '&quot;')}">
          <div class="td-actions">
            <button class="btn-edit" onclick="inciModifierUC(${i}, '${c.cat_id}')">Modifier</button>
            ${utilise.length === 0 ? `<button class="btn-suppr" onclick="inciSupprimerUC('${c.cat_id}')">Supprimer</button>` : ''}
          </div>
        </div>
        <div class="texte-secondaire">${utilise.length} ingrédient(s)</div>
      </div>`;
  }).join('');
  return `
    ${cartes}
    <hr class="separateur">
    <div class="form-actions">
      <button class="bouton bouton-petit bouton-vert-pale" onclick="inciAjouterUC()">+ Ajouter une catégorie</button>
    </div>`;
}

function inciAjouterUC() {
  inciCategoriesUC.push({ cat_id: null, nom: '' });
  document.getElementById('inci-uc-body').innerHTML = inciRendreUC();
  const input = document.getElementById(`uc-cat-${inciCategoriesUC.length - 1}`);
  if (input) input.focus();
}

async function inciModifierUC(i, cat_id) {
  const input = document.getElementById(`uc-cat-${i}`);
  const nom   = (input?.value || '').trim();
  if (!nom) { afficherMsg('inci', 'Le nom est requis.', 'erreur'); return; }
  const res = await appelAPIPost('saveCategorieUC', { cat_id, nom });
  if (res && res.success) {
    afficherMsg('inci', cat_id ? 'Catégorie mise à jour.' : 'Catégorie ajoutée.');
    await chargerInci();
  } else {
    afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
  }
}

async function inciSupprimerUC(cat_id) {
	confirmerAction('Supprimer cette catégorie ?', async () => {
    const res = await appelAPIPost('deleteCategorieUC', { cat_id });
    if (res && res.success) {
      afficherMsg('inci', 'Catégorie supprimée.');
      await chargerInci();
    } else {
      afficherMsg('inci', res?.message || 'Erreur.', 'erreur');
    }
  });
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
function retourRecetteDepuisInci()     { afficherSection('produits', null); }
function ajouterIngredientInci()       {}
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
  if (fournisseur && item) {
    await appelAPIPost('saveMappingFournisseur', {
      fournisseur,
      categorie_fournisseur: listesDropdown.categoriesMap?.[cat] || cat,
      nom_fournisseur:       item.description,
      categorie_UC:          listesDropdown.categoriesMap?.[cat] || cat,
      nom_UC:                nom,
      ing_id
    });
    ifMapping.push({ fournisseur, categorie_fournisseur: listesDropdown.categoriesMap?.[cat] || cat, nom_fournisseur: item.description, categorie_UC: listesDropdown.categoriesMap?.[cat] || cat, nom_UC: nom, ing_id });
  }
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



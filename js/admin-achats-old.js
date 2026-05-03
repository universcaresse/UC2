/* ═══════════════════════════════════════
   UNIVERS CARESSE — entrer-facture.js
   Module saisie facture V4 — IDs partout
   ═══════════════════════════════════════ */

// ─── ÉTAT ───
var ef = {
  factureActive:      null, // { ach_id, numero, date, fournisseur, four_id, four_code }
  lignes:             [],   // lignes sauvegardées
  mapping:            [],   // [{four_id, cat_fourn_id, prod_fourn_id, ing_id}]
  formats:            [],   // [{ing_id, four_id, contenant, quantite, unite}]
  fournisseurs:       [],   // [{four_id, code, nom}]
  scrapingItems:      [],   // [{nom, categorie, cat_fourn_id, prod_fourn_id}]
  catsFourn:          [],   // [{cat_fourn_id, nom}]
  prodsFourn:         [],   // [{prod_fourn_id, cat_fourn_id, four_id, nom}]
  _saisieIngId:       null,
  _saisieProdFournId: null,
  _saisieCatFournId:  null,
  _initEnCours:       false,
  _editIdx:           null,
};

var EF_SCRAPING_CODES = ['PA', 'MH', 'Arbressence', 'DE'];

function efParseFlt(val) {
  if (val === null || val === undefined || val === '') return 0;
  return parseFloat(String(val).replace(/\s/g, '').replace(',', '.')) || 0;
}

// ─── INIT ───
async function efInit() {
  if (ef._initEnCours) return;
  ef._initEnCours = true;
  try {
    const [resFour, resInci, resCats, resMap, resFmt, resCfg, resCatsFourn, resProdsFourn] = await Promise.all([
      appelAPI('getFournisseurs'),
      appelAPI('getIngredientsInci'),
      appelAPI('getCategoriesUC'),
      appelAPI('getMappingFournisseurs'),
      appelAPI('getFormatsIngredients'),
      appelAPI('getConfig'),
      appelAPI('getCategoriesFournisseurs'),
      appelAPI('getProduitsFournisseurs')
    ]);

    if (resFour && resFour.success) {
      ef.fournisseurs = resFour.items || [];
      listesDropdown.fournisseurs = ef.fournisseurs.map(f => f.nom);
    }
    if (resInci && resInci.success && resInci.items && resInci.items.length > 0) {
      listesDropdown.fullData = resInci.items || [];
      listesDropdown.types = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean).sort();
    }
    if (resCats && resCats.success) {
      listesDropdown.categoriesMap = {};
      (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
    }
    if (resMap && resMap.success)       ef.mapping    = resMap.items    || [];
    if (resFmt && resFmt.success)       ef.formats    = resFmt.items    || [];
    if (resCatsFourn && resCatsFourn.success) ef.catsFourn  = resCatsFourn.items || [];
    if (resProdsFourn && resProdsFourn.success) ef.prodsFourn = resProdsFourn.items || [];
    if (resCfg && resCfg.success) {
      listesDropdown.config = {};
      (resCfg.items || []).forEach(c => {
        listesDropdown.config[c.cat_id] = {
          densite:       parseFloat(c.densite)         || 1,
          unite:         c.unite                       || 'g',
          margePertePct: parseFloat(c.marge_perte_pct) || 0
        };
      });
    }

    efPopulerFournisseurs();
    efInitDate();
    await efVerifierFactureEnCours();

    if (ef.factureActive) {
      efAfficherZoneItems();
      efRendreLigneSaisie();
      efMajBanniere();
    } else {
      document.getElementById('ef-zone-items')?.classList.add('cache');
      document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
    }
  } finally {
    ef._initEnCours = false;
  }
}

// ─── VÉRIFIER FACTURE EN COURS ───
async function efVerifierFactureEnCours() {
  if (ef.factureActive) return;
  const resAch = await appelAPI('getAchatsEntete');
  if (!resAch || !resAch.success) return;
  const enCours = (resAch.items || []).find(a => a.statut === 'En cours');
  if (!enCours) return;

  const four     = ef.fournisseurs.find(f => f.four_id === enCours.four_id);
  const fourNom  = four?.nom  || enCours.four_id;
  const fourCode = four?.code || '';

  const bandeau = document.getElementById('ef-bandeau-reprise');
  const texte   = document.getElementById('ef-bandeau-reprise-texte');
  if (bandeau && texte) {
    texte.textContent = `Facture ${enCours.numero_facture || enCours.ach_id} — ${fourNom} — ${enCours.date || ''}`;
    bandeau.classList.remove('cache');
  }

  ef._factureEnAttente = {
    ach_id:      enCours.ach_id,
    numero:      enCours.numero_facture || enCours.ach_id,
    date:        enCours.date || '',
    fournisseur: fourNom,
    four_id:     enCours.four_id,
    four_code:   fourCode
  };
}

async function efReprendreFacture() {
  if (!ef._factureEnAttente) return;
  const f = ef._factureEnAttente;
  ef.factureActive = f;

  const resLignes = await appelAPI('getAchatsLignes', { ach_id: f.ach_id });
  ef.lignes = [];
  if (resLignes && resLignes.success) {
    (resLignes.items || []).forEach(l => {
      const ing     = (listesDropdown.fullData || []).find(d => d.ing_id === l.ing_id);
      const nomUC   = ing?.nom_UC  || '';
      const cat_id  = ing?.cat_id  || '';
      const catUC   = listesDropdown.categoriesMap?.[cat_id] || '';

      const mappingEntry   = ef.mapping.find(m => m.ing_id === l.ing_id && m.four_id === f.four_id);
      const cat_fourn_id   = mappingEntry?.cat_fourn_id  || '';
      const prod_fourn_id  = mappingEntry?.prod_fourn_id || '';
      const catFournNom    = ef.catsFourn.find(c => c.cat_fourn_id  === cat_fourn_id)?.nom  || '';
      const prodFournNom   = ef.prodsFourn.find(p => p.prod_fourn_id === prod_fourn_id)?.nom || '';

      ef.lignes.push({
        rowIndex:      l.rowIndex,
        ing_id:        l.ing_id,
        nomUC,
        cat_fourn_id,
        prod_fourn_id,
        catFournNom,
        prodFournNom,
        catUC,
        formatQte:     l.format_qte,
        formatUnite:   l.format_unite,
        contenant:     l.notes || '',
        prixUnitaire:  l.prix_unitaire,
        quantite:      l.quantite,
        prixTotal:     l.prix_total,
        prixParG:      l.prix_par_g
      });
    });
  }

  document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
  efAfficherZoneItems();
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
  efMajBanniere();
  ef._factureEnAttente = null;
}

async function efAnnulerFactureEnCours() {
  if (!ef._factureEnAttente) return;
  const ach_id = ef._factureEnAttente.ach_id;
  const res = await appelAPIPost('deleteAchat', { ach_id });
  if (res && res.success) {
    ef._factureEnAttente = null;
    document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
    afficherMsg('ef', 'Facture annulée.', 'succes');
  } else {
    afficherMsg('ef', res?.message || 'Erreur lors de l\'annulation.', 'erreur');
  }
}

// ─── CALCULS ───
function efCalculerGrammes(formatQte, formatUnite, cat_id) {
  const qte     = efParseFlt(formatQte);
  const cfg     = listesDropdown.config?.[cat_id] || {};
  const densite = cfg.densite || 1;
  if (formatUnite === 'g')     return qte;
  if (formatUnite === 'kg')    return qte * 1000;
  if (formatUnite === 'lbs')   return qte * 453.592;
  if (formatUnite === 'ml')    return qte * densite;
  if (formatUnite === 'L')     return qte * 1000 * densite;
  if (formatUnite === 'l')     return qte * 1000 * densite;
  if (formatUnite === 'unité') return qte;
  return qte;
}

function efCalculerPrixParG(prixUnitaire, formatQte, formatUnite, cat_id) {
  const grammes = efCalculerGrammes(formatQte, formatUnite, cat_id);
  if (grammes <= 0) return 0;
  return efParseFlt(prixUnitaire) / grammes;
}

// ─── DATE ───
function efInitDate() {
  const selJour  = document.getElementById('ef-date-jour');
  const selAnnee = document.getElementById('ef-date-annee');
  if (!selJour || !selAnnee) return;

  selJour.innerHTML = '<option value="">—</option>' + Array.from({length:31}, (_,i) => {
    const j = String(i+1).padStart(2,'0');
    return `<option value="${j}">${j}</option>`;
  }).join('');

  const anneeActuelle = new Date().getFullYear();
  selAnnee.innerHTML = '<option value="">—</option>' +
    [anneeActuelle-1, anneeActuelle, anneeActuelle+1].map(a => `<option value="${a}">${a}</option>`).join('');

  const selMois = document.getElementById('ef-date-mois');
  if (selMois) {
    selMois.innerHTML = '<option value="">— Mois —</option>' +
      [['01','Janvier'],['02','Février'],['03','Mars'],['04','Avril'],
       ['05','Mai'],['06','Juin'],['07','Juillet'],['08','Août'],
       ['09','Septembre'],['10','Octobre'],['11','Novembre'],['12','Décembre']]
      .map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
    selMois.value = '';
  }
  document.getElementById('ef-date').value = '';
}

function efSyncDate() {
  const j = document.getElementById('ef-date-jour')?.value;
  const m = document.getElementById('ef-date-mois')?.value;
  const a = document.getElementById('ef-date-annee')?.value;
  if (j && m && a) document.getElementById('ef-date').value = `${a}-${m}-${j}`;
}

// ─── FOURNISSEURS ───
function efPopulerFournisseurs() {
  const sel = document.getElementById('ef-fournisseur');
  if (!sel) return;
  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  ef.fournisseurs
    .sort((a, b) => (a.nom||'').localeCompare(b.nom||'','fr'))
    .forEach(f => {
      const opt = document.createElement('option');
      opt.value        = f.four_id;
      opt.dataset.nom  = f.nom;
      opt.dataset.code = f.code || '';
      opt.textContent  = f.nom;
      sel.appendChild(opt);
    });
  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouveau fournisseur…';
  sel.appendChild(optNew);
  if (valActuelle) sel.value = valActuelle;
}

function efOnChangeFournisseur() {
  const sel = document.getElementById('ef-fournisseur');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    ouvrirModalNouveauFournisseur();
  }
}

// ─── CRÉER LA FACTURE ───
async function efCreerFacture() {
  if (ef.factureActive) { efAfficherZoneItems(); return; }

  const selFour  = document.getElementById('ef-fournisseur');
  const numero   = document.getElementById('ef-numero')?.value?.trim();
  const date     = document.getElementById('ef-date')?.value;
  let   four_id  = selFour?.value;
  let   fourNom  = selFour?.options[selFour.selectedIndex]?.dataset?.nom
                 || selFour?.options[selFour.selectedIndex]?.textContent || '';
  let   fourCode = selFour?.options[selFour.selectedIndex]?.dataset?.code || '';

  if (four_id === '__nouveau__') {
    const champNouv = document.getElementById('ef-fournisseur-nouveau')?.value?.trim();
    if (!champNouv) { afficherMsg('ef', 'Entrez le nom du nouveau fournisseur.', 'erreur'); return; }
    fourNom = champNouv;
    const saved = await efSauvegarderNouveauFournisseur(champNouv);
    four_id  = saved.four_id;
    fourCode = saved.code;
  }

  if (!four_id || !date || !numero) {
    afficherMsg('ef', 'Fournisseur, date et numéro sont requis.', 'erreur');
    return;
  }

  const btn = document.getElementById('ef-btn-creer');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>'; }

  const resAch = await appelAPI('getAchatsEntete');
  const dernierNum = (resAch?.items || []).reduce((max, a) => {
    const num = parseInt((a.ach_id || '').replace('ACH-', '')) || 0;
    return num > max ? num : max;
  }, 0);
  const ach_id = 'ACH-' + String(dernierNum + 1).padStart(4, '0');
  const res = await appelAPIPost('createAchatEntete', { ach_id, date, four_id, numero_facture: numero });

  if (btn) { btn.disabled = false; btn.innerHTML = 'Créer'; }

  if (!res || !res.success) {
    afficherMsg('ef', res?.message || 'Erreur création facture.', 'erreur');
    return;
  }

  ef.factureActive = { ach_id, numero, date, fournisseur: fourNom, four_id, four_code: fourCode };
  document.getElementById('ef-btn-creer')?.classList.add('cache');
  efAfficherZoneItems();
  efRendreLigneSaisie();
  efMajBanniere();
  afficherMsg('ef', '');
}

// ─── ZONE ITEMS ───
function efAfficherZoneItems() {
  document.getElementById('ef-zone-items')?.classList.remove('cache');
}

function efMajBanniere() {
  if (!ef.factureActive) return;
  const sousTotal = ef.lignes.reduce((s, l) => s + (l.prixTotal || 0), 0);
  const elNum  = document.getElementById('ef-banniere-numero');
  const elFour = document.getElementById('ef-banniere-fournisseur');
  const elSous = document.getElementById('ef-banniere-soustotal');
  if (elNum)  elNum.textContent  = ef.factureActive.numero;
  if (elFour) elFour.textContent = ef.factureActive.fournisseur;
  if (elSous) elSous.textContent = formaterPrix(sousTotal);
  efMajSousTotal();
}

function efMajSousTotal() {
  const sousTotal = ef.lignes.reduce((s, l) => s + (l.prixTotal || 0), 0);
  const elSous = document.getElementById('ef-soustotal');
  if (elSous) elSous.value = formaterPrix(sousTotal);
  efCalculerTotal();
}

function efCalculerTotal() {
  const sousTotal = ef.lignes.reduce((s, l) => s + (l.prixTotal || 0), 0);
  const tps       = efParseFlt(document.getElementById('ef-tps')?.value);
  const tvq       = efParseFlt(document.getElementById('ef-tvq')?.value);
  const livraison = efParseFlt(document.getElementById('ef-livraison')?.value);
  const elTotal   = document.getElementById('ef-total');
  if (elTotal) elTotal.value = formaterPrix(sousTotal + tps + tvq + livraison);
}

// ─── LIGNE SAISIE ───
function efRendreLigneSaisie() {
  const tbody = document.getElementById('ef-tbody');
  if (!tbody) return;

  const ancienne = document.getElementById('ef-ligne-saisie');
  if (ancienne) ancienne.remove();

  const fourCode  = ef.factureActive?.four_code || '';
  const aScraping = EF_SCRAPING_CODES.includes(fourCode);
  const four_id   = ef.factureActive ? (ef.fournisseurs.find(f => f.nom === ef.factureActive.fournisseur)?.four_id || '') : '';

  const optsCatUC = Object.keys(listesDropdown.categoriesMap || {})
    .sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr'))
    .map(k => `<option value="${k}">${listesDropdown.categoriesMap[k]}</option>`).join('') +
    '<option value="__nouvelle_cat__">+ Nouvelle catégorie UC…</option>';

  let col1Html = '';

  if (aScraping) {
    // Fournisseur avec scraping — Cat Fournisseur + Nom Fournisseur + Cat UC + Nom UC (cachés, auto-remplis)
    const catsFournActives = ef.catsFourn.filter(c =>
      ef.prodsFourn.some(p => p.cat_fourn_id === c.cat_fourn_id && p.four_id === four_id)
    ).sort((a,b) => a.nom.localeCompare(b.nom,'fr'));

    const optsCatFourn = catsFournActives.map(c =>
      `<option value="${c.cat_fourn_id}">${c.nom}</option>`
    ).join('');

    col1Html = `
      <select class="form-ctrl" id="ef-saisie-cat-fourn" onchange="efOnChangeSaisieCatFourn()">
        <option value="">— Catégorie fourn. —</option>
        ${optsCatFourn}
        <option value="__nouveau__">+ Nouvelle catégorie…</option>
      </select>
      <select class="form-ctrl" id="ef-saisie-nom-fourn" onchange="efOnChangeSaisieNomFourn()" style="margin-top:4px">
        <option value="">— Nom fourn. —</option>
      </select>
      <select class="form-ctrl cache" id="ef-saisie-cat-uc" onchange="efOnChangeSaisieCatUC()" style="margin-top:4px">
        <option value="">— Cat. UC —</option>
        ${optsCatUC}
      </select>
      <select class="form-ctrl cache" id="ef-saisie-nom-uc" onchange="efOnChangeSaisieNomUC()" style="margin-top:4px">
        <option value="">— Nom UC —</option>
      </select>
      <input type="text" class="form-ctrl cache" id="ef-saisie-nom-uc-nouveau" placeholder="Nouveau nom UC" autocomplete="off">`;
  } else {
    // Fournisseur sans scraping — Cat UC + Nom UC directement
    // Cat fournisseur et nom fournisseur sont cachés (champs hidden)
    col1Html = `
      <input type="hidden" id="ef-saisie-cat-fourn" value="">
      <input type="hidden" id="ef-saisie-nom-fourn" value="">
      <select class="form-ctrl" id="ef-saisie-cat-uc" onchange="efOnChangeSaisieCatUC()">
        <option value="">— Catégorie —</option>
        ${optsCatUC}
      </select>
      <select class="form-ctrl" id="ef-saisie-nom-uc" onchange="efOnChangeSaisieNomUC()" style="margin-top:4px">
        <option value="">— Nom —</option>
      </select>
      <input type="text" class="form-ctrl cache" id="ef-saisie-nom-uc-nouveau" placeholder="Nouveau nom UC" autocomplete="off">`;
  }

  const tr = document.createElement('tr');
  tr.id = 'ef-ligne-saisie';
  tr.innerHTML = `
    <td>${col1Html}</td>
    <td>
      <select class="form-ctrl" id="ef-saisie-format" onchange="efOnChangeSaisieFormat()">
        <option value="">— Format —</option>
        <option value="__nouveau__">+ Nouveau format…</option>
      </select>
    </td>
    <td>
      <input type="text" inputmode="decimal" class="form-ctrl" id="ef-saisie-qte" placeholder="Qté" autocomplete="off" oninput="efMajLigneTotal()">
    </td>
    <td>
      <input type="text" inputmode="decimal" class="form-ctrl" id="ef-saisie-prix" placeholder="Prix $" autocomplete="off" oninput="efMajLigneTotal()">
    </td>
    <td id="ef-saisie-total">—</td>
    <td>
      <button class="bouton bouton-petit" id="ef-btn-ajouter" onclick="efAjouterLigne()" title="Ajouter">+</button>
      <button class="bouton bouton-petit bouton-secondaire cache" id="ef-btn-annuler-edit" onclick="efAnnulerEdit()" title="Annuler">✕</button>
    </td>`;
  tbody.appendChild(tr);
}


// ─── CASCADES ───
function efOnChangeSaisieCatFourn() {
  const sel = document.getElementById('ef-saisie-cat-fourn');
  if (!sel) return;
  if (sel.value === '__nouveau__') { efOuvrirModalCatFourn(); return; }
  ef._saisieCatFournId = sel.value || null;
  efPopulerNomsFourn(sel.value);
}

function efPopulerNomsFourn(cat_fourn_id) {
  const sel = document.getElementById('ef-saisie-nom-fourn');
  if (!sel) return;
  const four_id = ef.factureActive ? (ef.fournisseurs.find(f => f.nom === ef.factureActive.fournisseur)?.four_id || '') : '';

  const prods = ef.prodsFourn.filter(p =>
    p.four_id === four_id && (!cat_fourn_id || p.cat_fourn_id === cat_fourn_id)
  ).sort((a,b) => a.nom.localeCompare(b.nom,'fr'));

  sel.innerHTML = '<option value="">— Nom —</option>' +
    prods.map(p => `<option value="${p.prod_fourn_id}">${p.nom}</option>`).join('') +
    '<option value="__nouveau__">+ Nouveau nom…</option>';

  efResetFormat();
}

function efOnChangeSaisieNomFourn() {
  const sel = document.getElementById('ef-saisie-nom-fourn');
  if (!sel) return;

  if (sel.value === '__nouveau__') {
    efOuvrirModalNomFourn();
    efResetFormat();
    return;
  }

  ef._saisieProdFournId = sel.value || null;

  if (sel.value) {
    const four_id = ef.factureActive ? (ef.fournisseurs.find(f => f.nom === ef.factureActive.fournisseur)?.four_id || '') : '';
    const mapping = ef.mapping.find(m => m.four_id === four_id && m.prod_fourn_id === sel.value);
    if (mapping && mapping.ing_id) {
      const ing      = (listesDropdown.fullData || []).find(d => d.ing_id === mapping.ing_id);
      const selCatUC = document.getElementById('ef-saisie-cat-uc');
      if (selCatUC && ing) {
        selCatUC.value = ing.cat_id || '';
        efOnChangeSaisieCatUC();
      }
      setTimeout(() => {
        const selNomUC = document.getElementById('ef-saisie-nom-uc');
        if (selNomUC) { selNomUC.value = mapping.ing_id; ef._saisieIngId = mapping.ing_id; }
        efPopulerFormats(mapping.ing_id);
      }, 50);
    } else {
      efResetFormat();
    }
  } else {
    efResetFormat();
  }
}

function efResetFormat() {
  const selFmt = document.getElementById('ef-saisie-format');
  if (selFmt) selFmt.innerHTML = '<option value="">— Format —</option><option value="__nouveau__">+ Nouveau format…</option>';
  ef._saisieIngId = null;
}

function efPopulerFormats(ing_id) {
  const selFmt = document.getElementById('ef-saisie-format');
  if (!selFmt) return;
  const four_id = ef.factureActive ? (ef.fournisseurs.find(f => f.nom === ef.factureActive.fournisseur)?.four_id || '') : '';

  const formatsConnus = ef.formats.filter(f =>
    f.ing_id === ing_id && (!f.four_id || f.four_id === four_id)
  );

  selFmt.innerHTML = '<option value="">— Format —</option>';
  formatsConnus.forEach(f => {
    const opt = document.createElement('option');
    opt.value = JSON.stringify({ quantite: f.quantite, unite: f.unite, contenant: f.contenant || '' });
    opt.textContent = (f.contenant ? f.contenant + ' — ' : '') + f.quantite + ' ' + f.unite;
    selFmt.appendChild(opt);
  });
  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouveau format…';
  selFmt.appendChild(optNew);
}

function efOnChangeSaisieFormat() {
  const sel = document.getElementById('ef-saisie-format');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    efOuvrirModalFormat();
    sel.value = '';
  }
}

function efOnChangeSaisieCatUC() {
  const selCatUC  = document.getElementById('ef-saisie-cat-uc');
  const selNomUC  = document.getElementById('ef-saisie-nom-uc');
  const champNouv = document.getElementById('ef-saisie-nom-uc-nouveau');
  if (!selCatUC || !selNomUC) return;
  const cat_id = selCatUC.value;

  if (cat_id === '__nouvelle_cat__') {
    selCatUC.value = '';
    efOuvrirModalNouvelleCatUC();
    return;
  }

  selNomUC.innerHTML = '<option value="">— Nom UC —</option>';
  if (cat_id) {
    (listesDropdown.fullData || [])
      .filter(d => d.cat_id === cat_id)
      .sort((a,b) => (a.nom_UC||'').localeCompare(b.nom_UC||'','fr'))
      .forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.ing_id; opt.textContent = d.nom_UC;
        selNomUC.appendChild(opt);
      });
  }
  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouvel ingrédient…';
  selNomUC.appendChild(optNew);

  if (champNouv) champNouv.classList.add('cache');
  ef._saisieIngId = null;
}

function efOnChangeSaisieNomUC() {
  const sel   = document.getElementById('ef-saisie-nom-uc');
  const champ = document.getElementById('ef-saisie-nom-uc-nouveau');
  if (!sel || !champ) return;

  if (sel.value === '__nouveau__') {
    efOuvrirModalIngredient();
    sel.value = '';
    return;
  }

  champ.classList.add('cache');
  ef._saisieIngId = sel.value || null;
  const fourCode = ef.factureActive?.four_code || '';
  if (!EF_SCRAPING_CODES.includes(fourCode)) {
    ef._saisieProdFournId = sel.value || null;
    ef._saisieCatFournId  = document.getElementById('ef-saisie-cat-uc')?.value || null;
    efPopulerFormats(sel.value);
  }
}

function efMajLigneTotal() {
  const prix = efParseFlt(document.getElementById('ef-saisie-prix')?.value);
  const qte  = efParseFlt(document.getElementById('ef-saisie-qte')?.value);
  const el   = document.getElementById('ef-saisie-total');
  if (el) el.textContent = prix && qte ? formaterPrix(prix * qte) : '—';
}

// ─── AJOUTER LIGNE ───
async function efAjouterLigne() {
  if (!ef.factureActive) { afficherMsg('ef-items', 'Aucune facture active.', 'erreur'); return; }

  const btn = document.getElementById('ef-btn-ajouter');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>'; }

  const fourCode  = ef.factureActive?.four_code || '';
  const aScraping = EF_SCRAPING_CODES.includes(fourCode);

  const selCatF      = document.getElementById('ef-saisie-cat-fourn');
  const selNomF      = document.getElementById('ef-saisie-nom-fourn');
  const cat_fourn_id = aScraping
    ? (selCatF?.value === '__nouveau__' ? '' : selCatF?.value || '')
    : (document.getElementById('ef-saisie-cat-uc')?.value || '');
  const prod_fourn_id = aScraping
    ? (selNomF?.value === '__nouveau__' ? '' : selNomF?.value || '')
    : (document.getElementById('ef-saisie-nom-uc')?.value || '');

  const selFmt = document.getElementById('ef-saisie-format');
  let formatQte = '', formatUnite = 'g', contenant = '';
  if (selFmt?.value && selFmt.value !== '__nouveau__') {
    const fObj  = JSON.parse(selFmt.value);
    formatQte   = String(fObj.quantite);
    formatUnite = fObj.unite;
    contenant   = fObj.contenant || '';
  }

  const prixUnit = document.getElementById('ef-saisie-prix')?.value?.trim();
  const quantite = document.getElementById('ef-saisie-qte')?.value?.trim();
  const cat_id   = document.getElementById('ef-saisie-cat-uc')?.value || '';
  let   ing_id   = ef._saisieIngId || document.getElementById('ef-saisie-nom-uc')?.value || '';
  let   nomUC    = (listesDropdown.fullData || []).find(d => d.ing_id === ing_id)?.nom_UC || '';

  const erreur = (msg) => {
    if (btn) { btn.disabled = false; btn.innerHTML = '+'; }
    afficherMsg('ef-items', msg, 'erreur');
  };

  if (!cat_fourn_id) return erreur('Catégorie fournisseur requise.');
  if (!prod_fourn_id) return erreur('Nom fournisseur requis.');
  if (!formatQte)    return erreur('Format requis.');
  if (!prixUnit)     return erreur('Prix unitaire requis.');
  if (!quantite)     return erreur('Quantité requise.');
  if (!ing_id)       return erreur('Ingrédient UC requis.');

  const four_id      = ef.factureActive.four_id || '';
  const prixUnitNum  = efParseFlt(prixUnit);
  const quantiteNum  = efParseFlt(quantite);
  const prixTotal    = quantiteNum * prixUnitNum;
  const prixParG     = efCalculerPrixParG(prixUnitNum, formatQte, formatUnite, cat_id);

  const res = await appelAPIPost('addAchatLigne', {
    ach_id:        ef.factureActive.ach_id,
    ing_id,
    format_qte:    efParseFlt(formatQte),
    format_unite:  formatUnite,
    prix_unitaire: prixUnitNum,
    prix_par_g:    prixParG,
    quantite:      quantiteNum,
    four_id,
    notes:         contenant
  });

  if (!res || !res.success) {
    if (btn) { btn.disabled = false; btn.innerHTML = '+'; }
    afficherMsg('ef-items', res?.message || 'Erreur ajout ligne.', 'erreur');
    return;
  }

  // Sauvegarder mapping si nouveau lien
  const mappingExiste = ef.mapping.find(m => m.four_id === four_id && m.prod_fourn_id === prod_fourn_id);
  if (!mappingExiste) {
    await appelAPIPost('saveMappingFournisseur', { four_id, cat_fourn_id, prod_fourn_id, ing_id });
    ef.mapping.push({ four_id, cat_fourn_id, prod_fourn_id, ing_id });
  }

  // Mémoriser format si nouveau
  const fmtExiste = ef.formats.find(f =>
    f.ing_id === ing_id &&
    efParseFlt(f.quantite) === efParseFlt(formatQte) &&
    f.unite === formatUnite &&
    f.four_id === four_id
  );
  if (!fmtExiste) {
    ef.formats.push({ ing_id, four_id, contenant, quantite: efParseFlt(formatQte), unite: formatUnite });
  }

  const catUCNom     = listesDropdown.categoriesMap?.[cat_id] || cat_id;
  const catFournNom  = ef.catsFourn.find(c => c.cat_fourn_id  === cat_fourn_id)?.nom  || '';
  const prodFournNom = ef.prodsFourn.find(p => p.prod_fourn_id === prod_fourn_id)?.nom || '';

  const nouvelleLigne = {
    rowIndex: res.rowIndex || 0,
    ing_id, nomUC,
    cat_fourn_id, prod_fourn_id,
    catFournNom, prodFournNom,
    catUC: catUCNom,
    formatQte: efParseFlt(formatQte), formatUnite, contenant,
    prixUnitaire: prixUnitNum, quantite: quantiteNum,
    prixTotal, prixParG
  };

  if (ef._editIdx !== null) {
    const ligneAncienne = ef.lignes[ef._editIdx];
    if (ligneAncienne.rowIndex) {
      await appelAPIPost('deleteAchatLigne', { rowIndex: ligneAncienne.rowIndex });
      ef.lignes.forEach(l => { if (l.rowIndex > ligneAncienne.rowIndex) l.rowIndex--; });
    }
    ef.lignes[ef._editIdx] = nouvelleLigne;
    ef._editIdx = null;
  } else {
    ef.lignes.push(nouvelleLigne);
  }

  if (btn) { btn.disabled = false; btn.innerHTML = '+'; }
  afficherMsg('ef-items', '');
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
  efMajBanniere();
}

// ─── LIGNES SAUVEGARDÉES ───
function efRendreLignesSauvegardees() {
  const tbody = document.getElementById('ef-tbody');
  if (!tbody) return;

  Array.from(tbody.querySelectorAll('tr:not(#ef-ligne-saisie)')).forEach(tr => tr.remove());
  const ligneSaisie = document.getElementById('ef-ligne-saisie');

  ef.lignes.forEach((l, idx) => {
    const fmt = (l.contenant ? l.contenant + ' — ' : '') + l.formatQte + ' ' + l.formatUnite;
    const tr  = document.createElement('tr');
    if (idx === ef._editIdx) tr.classList.add('cache');
    tr.innerHTML = `
      <td>${l.catFournNom}<br><small>${l.prodFournNom}</small></td>
      <td>${fmt}</td>
      <td>${l.quantite}</td>
      <td>${formaterPrix(l.prixUnitaire)}</td>
      <td>${formaterPrix(l.prixTotal)}</td>
      <td>${l.catUC}<br><small>${l.nomUC}</small></td>
      <td>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:center">
          <button class="bouton bouton-petit bouton-secondaire" onclick="efEditerLigne(${idx})" title="Modifier" style="width:100%">✏️</button>
          <button class="bouton bouton-petit bouton-rouge" onclick="efSupprimerLigne(${idx})" style="width:100%">✕</button>
        </div>
      </td>`;
    if (ligneSaisie) tbody.insertBefore(tr, ligneSaisie);
    else tbody.appendChild(tr);
  });
}

function efEditerLigne(idx) {
  const l = ef.lignes[idx];
  if (!l) return;
  ef._editIdx = idx;

  const selCatF = document.getElementById('ef-saisie-cat-fourn');
  if (selCatF) { selCatF.value = l.cat_fourn_id; efPopulerNomsFourn(l.cat_fourn_id); }

  setTimeout(() => {
    const selNomF = document.getElementById('ef-saisie-nom-fourn');
    if (selNomF) selNomF.value = l.prod_fourn_id;
    ef._saisieProdFournId = l.prod_fourn_id;

    const selCatUC = document.getElementById('ef-saisie-cat-uc');
    const cat_id   = l.ing_id ? ((listesDropdown.fullData || []).find(d => d.ing_id === l.ing_id)?.cat_id || '') : '';
    if (selCatUC) { selCatUC.value = cat_id; efOnChangeSaisieCatUC(); }

    setTimeout(() => {
      const selNomUC = document.getElementById('ef-saisie-nom-uc');
      if (selNomUC) { selNomUC.value = l.ing_id; ef._saisieIngId = l.ing_id; }

      efPopulerFormats(l.ing_id);
      setTimeout(() => {
        const selFmt = document.getElementById('ef-saisie-format');
        if (selFmt) {
          const val = JSON.stringify({ quantite: l.formatQte, unite: l.formatUnite, contenant: l.contenant || '' });
          selFmt.value = val;
          if (!selFmt.value) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = (l.contenant ? l.contenant + ' — ' : '') + l.formatQte + ' ' + l.formatUnite;
            opt.selected = true;
            selFmt.insertBefore(opt, selFmt.options[0]);
          }
        }
        const elPrix = document.getElementById('ef-saisie-prix');
        const elQte  = document.getElementById('ef-saisie-qte');
        if (elPrix) elPrix.value = l.prixUnitaire;
        if (elQte)  elQte.value  = l.quantite;
        efMajLigneTotal();

        const btnAjouter = document.getElementById('ef-btn-ajouter');
        const btnAnnuler = document.getElementById('ef-btn-annuler-edit');
        if (btnAjouter) btnAjouter.innerHTML = '✓';
        if (btnAnnuler) btnAnnuler.classList.remove('cache');
      }, 50);
    }, 50);
  }, 50);
}

function efAnnulerEdit() {
  ef._editIdx = null;
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
}

async function efSupprimerLigne(idx) {
  const ligne = ef.lignes[idx];
  if (!ligne) return;

  if (ligne.ing_id) {
    const res = await appelAPIPost('deleteAchatLigne', {
      ach_id:       ef.factureActive.ach_id,
      ing_id:       ligne.ing_id,
      format_qte:   ligne.formatQte,
      format_unite: ligne.formatUnite
    });
    if (!res || !res.success) {
      afficherMsg('ef-items', res?.message || 'Erreur suppression ligne.', 'erreur');
      return;
    }
  }

  ef.lignes.splice(idx, 1);
  efRendreLignesSauvegardees();
  efMajBanniere();
}

// ─── FINALISATION ───
async function efFinaliser() {
  if (!ef.factureActive) { afficherMsg('ef-final', 'Aucune facture active.', 'erreur'); return; }
  if (!ef.lignes.length) { afficherMsg('ef-final', 'Aucun item à finaliser.', 'erreur'); return; }

  const btn = document.getElementById('ef-btn-finaliser');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span> Finalisation…'; }

  const sousTotal = ef.lignes.reduce((s, l) => s + (l.prixTotal || 0), 0);
  const tps       = efParseFlt(document.getElementById('ef-tps')?.value);
  const tvq       = efParseFlt(document.getElementById('ef-tvq')?.value);
  const livraison = efParseFlt(document.getElementById('ef-livraison')?.value);

  const res = await appelAPIPost('finaliserAchat', {
    ach_id: ef.factureActive.ach_id,
    sous_total: sousTotal, tps, tvq, livraison
  });

  if (!res || !res.success) {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }
    afficherMsg('ef-final', res?.message || 'Erreur lors de la finalisation.', 'erreur');
    return;
  }

  afficherMsg('ef', `✅ Facture finalisée — Total : ${formaterPrix(res.total)}`);

  setTimeout(() => {
    ef.factureActive    = null;
    ef.lignes           = [];
    ef._saisieIngId     = null;
    ef._saisieProdFournId = null;
    ef._saisieCatFournId  = null;
    ef._editIdx         = null;
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }
    document.getElementById('ef-fournisseur').value = '';
    document.getElementById('ef-fournisseur-nouveau')?.classList.add('cache');
    document.getElementById('ef-numero').value    = '';
    document.getElementById('ef-tps').value       = '';
    document.getElementById('ef-tvq').value       = '';
    document.getElementById('ef-livraison').value = '';
    document.getElementById('ef-soustotal').value = '';
    document.getElementById('ef-total').value     = '';
    document.getElementById('ef-btn-creer')?.classList.remove('cache');
    document.getElementById('ef-zone-items')?.classList.add('cache');
    document.getElementById('ef-tbody').innerHTML = '';
    efInitDate();
    afficherMsg('ef-final', '');
  }, 3000);
}

// ─── MODAL NOUVEAU FORMAT ───
function efOuvrirModalFormat() {
  const modal = document.getElementById('modal-ef-format');
  if (!modal) return;
  document.getElementById('modal-ef-fmt-qte').value       = '';
  document.getElementById('modal-ef-fmt-qte').placeholder = 'Ex: 500';
  document.getElementById('modal-ef-fmt-unite').value     = '';
  document.getElementById('modal-ef-fmt-qte-bloc')?.classList.remove('cache');
  modal.classList.add('ouvert');
  document.getElementById('modal-ef-fmt-qte').focus();
}

function efFermerModalFormat() {
  document.getElementById('modal-ef-format')?.classList.remove('ouvert');
}

function efOnChangeModalFmtUnite() {
  const unite = document.getElementById('modal-ef-fmt-unite')?.value;
  const bloc  = document.getElementById('modal-ef-fmt-qte-bloc');
  const input = document.getElementById('modal-ef-fmt-qte');
  if (!bloc) return;
  bloc.classList.remove('cache');
  if (input) input.placeholder = unite === 'unité' ? 'Nb d\'unités dans le contenant (ex: 25)' : 'Ex: 500';
}

function efConfirmerModalFormat() {
  const unite = document.getElementById('modal-ef-fmt-unite')?.value;
  const qte   = document.getElementById('modal-ef-fmt-qte')?.value?.trim();
  if (!unite) return;
  if (!qte || efParseFlt(qte) <= 0) { document.getElementById('modal-ef-fmt-qte').focus(); return; }

  const selFmt = document.getElementById('ef-saisie-format');
  if (selFmt) {
    const opt = document.createElement('option');
    opt.value = JSON.stringify({ quantite: efParseFlt(qte), unite, contenant: '' });
    opt.textContent = unite === 'unité' ? qte + ' unités' : qte + ' ' + unite;
    opt.selected = true;
    const optNew = [...selFmt.options].find(o => o.value === '__nouveau__');
    if (optNew) selFmt.insertBefore(opt, optNew);
    else selFmt.appendChild(opt);
    selFmt.value = opt.value;
  }
  efFermerModalFormat();
}

// ─── MODAL NOUVEL INGRÉDIENT UC ───
function efOuvrirModalIngredient() {
  const modal = document.getElementById('modal-ef-ingredient');
  if (!modal) return;
  document.getElementById('modal-ef-ing-nouveau-nom').value = '';
  modal.classList.add('ouvert');
  setTimeout(() => document.getElementById('modal-ef-ing-nouveau-nom').focus(), 100);
}

function efFermerModalIngredient() {
  document.getElementById('modal-ef-ingredient')?.classList.remove('ouvert');
}

function efOnChangeModalIngCat() {
  const selCat = document.getElementById('modal-ef-ing-cat');
  const selNom = document.getElementById('modal-ef-ing-nomuc');
  if (!selCat || !selNom) return;

  if (selCat.value === '__nouvelle_cat__') {
    document.getElementById('modal-ef-ing-nouvelle-cat-groupe')?.classList.remove('cache');
    document.getElementById('modal-ef-ing-nouveau-nom-groupe')?.classList.remove('cache');
    document.getElementById('modal-ef-ing-nouvelle-cat').focus();
    selNom.classList.add('cache');
    return;
  }

  document.getElementById('modal-ef-ing-nouvelle-cat-groupe')?.classList.add('cache');
  document.getElementById('modal-ef-ing-nouvelle-cat').value = '';
  document.getElementById('modal-ef-ing-nouveau-nom-groupe')?.classList.remove('cache');
  document.getElementById('modal-ef-ing-nouveau-nom').value  = '';
  document.getElementById('modal-ef-ing-nouveau-nom').focus();

  const cat_id = selCat.value;
  const ings   = (listesDropdown.fullData || []).filter(d => d.cat_id === cat_id)
    .sort((a,b) => (a.nom_UC||'').localeCompare(b.nom_UC||'','fr'));
  selNom.innerHTML = '<option value="">— Choisir ou créer —</option>' +
    ings.map(d => `<option value="${d.ing_id}">${d.nom_UC}</option>`).join('') +
    '<option value="__nouveau__">+ Créer un nouveau nom UC</option>';
  selNom.classList.remove('cache');
}

function efOnChangeModalIngNom() {
  const selNom = document.getElementById('modal-ef-ing-nomuc');
  if (!selNom) return;
  if (selNom.value === '__nouveau__') {
    document.getElementById('modal-ef-ing-nouveau-nom-groupe')?.classList.remove('cache');
    document.getElementById('modal-ef-ing-nouveau-nom').focus();
  } else {
    document.getElementById('modal-ef-ing-nouveau-nom-groupe')?.classList.add('cache');
    document.getElementById('modal-ef-ing-nouveau-nom').value = '';
  }
}

async function efConfirmerModalIngredient() {
  const nouveauNom = document.getElementById('modal-ef-ing-nouveau-nom')?.value?.trim();
  if (!nouveauNom) { document.getElementById('modal-ef-ing-nouveau-nom').focus(); return; }

  const cat_id = document.getElementById('ef-saisie-cat-uc')?.value || '';
  if (!cat_id) { afficherMsg('ef', 'Choisir une catégorie UC avant d\'ajouter un ingrédient.', 'erreur'); efFermerModalIngredient(); return; }

  const btn = document.getElementById('btn-ef-confirmer-ingredient');
  if (btn) { if (btn.disabled) return; btn.disabled = true; }

  let ing_id, nomUC;
  const ingExistant = (listesDropdown.fullData || []).find(d => d.nom_UC === nouveauNom && d.cat_id === cat_id);
  if (ingExistant) {
    ing_id = ingExistant.ing_id;
    nomUC  = ingExistant.nom_UC;
  } else {
    const dernierIngNum = (listesDropdown.fullData || []).reduce((max, d) => {
  const num = parseInt((d.ing_id || '').replace('ING-', '')) || 0;
  return num > max ? num : max;
}, 0);
ing_id = 'ING-' + String(dernierIngNum + 1).padStart(3, '0');
    const res = await appelAPIPost('createIngredientInci', {
      ing_id, cat_id, nom_UC: nouveauNom,
      inci: '', statut: 'actif', source: ef.factureActive?.four_code || ''
    });
    if (!res || !res.success) {
      afficherMsg('ef', res?.message || 'Erreur création ingrédient.', 'erreur');
      if (btn) btn.disabled = false;
      return;
    }
    listesDropdown.fullData.push({ ing_id, cat_id, nom_UC: nouveauNom, inci: '', source: ef.factureActive?.four_code || '' });
    nomUC = nouveauNom;
  }

  const selFmtAvant = document.getElementById('ef-saisie-format');
  const valFmtAvant = selFmtAvant?.value;
  const optsAvant   = selFmtAvant ? [...selFmtAvant.options].map(o => ({ value: o.value, text: o.textContent })) : [];

  ef._saisieIngId = ing_id;
  const selNomUC = document.getElementById('ef-saisie-nom-uc');
  if (selNomUC) {
    let opt = [...selNomUC.options].find(o => o.value === ing_id);
    if (!opt) {
      opt = document.createElement('option');
      opt.value = ing_id; opt.textContent = nomUC;
      const optNew = [...selNomUC.options].find(o => o.value === '__nouveau__');
      if (optNew) selNomUC.insertBefore(opt, optNew);
      else selNomUC.appendChild(opt);
    }
    selNomUC.value = ing_id;
  }
  if (btn) btn.disabled = false;
  efFermerModalIngredient();

  const selFmtApres = document.getElementById('ef-saisie-format');
  if (selFmtApres && optsAvant.length > 0) {
    selFmtApres.innerHTML = '';
    optsAvant.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value; opt.textContent = o.text;
      selFmtApres.appendChild(opt);
    });
    if (valFmtAvant) selFmtApres.value = valFmtAvant;
  }
}

// ─── MODAL NOUVELLE CATÉGORIE UC ───
function efOuvrirModalNouvelleCatUC() {
  const modal = document.getElementById('modal-ef-nouvelle-cat-uc');
  if (!modal) return;
  document.getElementById('modal-ef-nouvelle-cat-uc-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(() => document.getElementById('modal-ef-nouvelle-cat-uc-valeur').focus(), 100);
}

function efFermerModalNouvelleCatUC() {
  document.getElementById('modal-ef-nouvelle-cat-uc')?.classList.remove('ouvert');
}

async function efConfirmerModalNouvelleCatUC() {
  const val = document.getElementById('modal-ef-nouvelle-cat-uc-valeur')?.value?.trim();
  if (!val) { document.getElementById('modal-ef-nouvelle-cat-uc-valeur').focus(); return; }
  const res = await appelAPIPost('saveCategorieUC', { nom: val });
  if (!res || !res.success) { afficherMsg('ef', 'Erreur création catégorie.', 'erreur'); return; }
  const cat_id = res.cat_id || ('CAT-' + Date.now());
  listesDropdown.categoriesMap[cat_id] = val;
  const selCatUC = document.getElementById('ef-saisie-cat-uc');
  if (selCatUC) {
    const opt = document.createElement('option');
    opt.value = cat_id; opt.textContent = val;
    const optNew = [...selCatUC.options].find(o => o.value === '__nouvelle_cat__');
    if (optNew) selCatUC.insertBefore(opt, optNew);
    else selCatUC.appendChild(opt);
    selCatUC.value = cat_id;
    efOnChangeSaisieCatUC();
  }
  efFermerModalNouvelleCatUC();
  afficherMsg('ef', `✅ Catégorie "${val}" créée.`);
}

// ─── MODAL NOUVELLE CATÉGORIE FOURNISSEUR ───
function efOuvrirModalCatFourn() {
  const modal = document.getElementById('modal-ef-cat-fourn');
  if (!modal) return;
  document.getElementById('modal-ef-cat-fourn-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(() => document.getElementById('modal-ef-cat-fourn-valeur').focus(), 100);
}

function efFermerModalCatFourn() {
  const sel = document.getElementById('ef-saisie-cat-fourn');
  if (sel) sel.value = '';
  document.getElementById('modal-ef-cat-fourn')?.classList.remove('ouvert');
}

async function efConfirmerModalCatFourn() {
  const val = document.getElementById('modal-ef-cat-fourn-valeur')?.value?.trim();
  if (!val) { document.getElementById('modal-ef-cat-fourn-valeur').focus(); return; }

  const res = await appelAPIPost('saveCategoriesFournisseur', { nom: val });
  if (!res || !res.success) { afficherMsg('ef', 'Erreur création catégorie fournisseur.', 'erreur'); return; }

  const cat_fourn_id = res.cat_fourn_id;
  ef.catsFourn.push({ cat_fourn_id, nom: val });

  const sel = document.getElementById('ef-saisie-cat-fourn');
  if (sel) {
    const opt = document.createElement('option');
    opt.value = cat_fourn_id; opt.textContent = val;
    const optNew = [...sel.options].find(o => o.value === '__nouveau__');
    if (optNew) sel.insertBefore(opt, optNew);
    else sel.appendChild(opt);
    sel.value = cat_fourn_id;
  }
  document.getElementById('modal-ef-cat-fourn')?.classList.remove('ouvert');
  ef._saisieCatFournId = cat_fourn_id;
  efPopulerNomsFourn(cat_fourn_id);
}

// ─── MODAL NOUVEAU NOM FOURNISSEUR ───
function efOuvrirModalNomFourn() {
  const modal = document.getElementById('modal-ef-nom-fourn');
  if (!modal) return;
  document.getElementById('modal-ef-nom-fourn-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(() => document.getElementById('modal-ef-nom-fourn-valeur').focus(), 100);
}

function efFermerModalNomFourn() {
  const sel = document.getElementById('ef-saisie-nom-fourn');
  if (sel) sel.value = '';
  document.getElementById('modal-ef-nom-fourn')?.classList.remove('ouvert');
}

async function efConfirmerModalNomFourn() {
  const val = document.getElementById('modal-ef-nom-fourn-valeur')?.value?.trim();
  if (!val) { document.getElementById('modal-ef-nom-fourn-valeur').focus(); return; }

  const cat_fourn_id = document.getElementById('ef-saisie-cat-fourn')?.value || '';
  const four_id      = ef.fournisseurs.find(f => f.nom === ef.factureActive?.fournisseur)?.four_id || '';

  const res = await appelAPIPost('saveProduitFournisseur', { nom: val, cat_fourn_id, four_id });
  if (!res || !res.success) { afficherMsg('ef', 'Erreur création produit fournisseur.', 'erreur'); return; }

  const prod_fourn_id = res.prod_fourn_id;
  ef.prodsFourn.push({ prod_fourn_id, cat_fourn_id, four_id, nom: val });

  const sel = document.getElementById('ef-saisie-nom-fourn');
  if (sel) {
    const opt = document.createElement('option');
    opt.value = prod_fourn_id; opt.textContent = val;
    const optNew = [...sel.options].find(o => o.value === '__nouveau__');
    if (optNew) sel.insertBefore(opt, optNew);
    else sel.appendChild(opt);
    sel.value = prod_fourn_id;
  }
  document.getElementById('modal-ef-nom-fourn')?.classList.remove('ouvert');
  ef._saisieProdFournId = prod_fourn_id;
  efResetFormat();
  const selCatUC = document.getElementById('ef-saisie-cat-uc');
  const selNomUC = document.getElementById('ef-saisie-nom-uc');
  if (selCatUC) selCatUC.value = '';
  if (selNomUC) selNomUC.innerHTML = '<option value="">— Nom UC —</option>';
  ef._saisieIngId = null;
}

// ─── ANNULER FACTURE ACTIVE ───
async function efAnnulerFactureActive() {
  if (!ef.factureActive) return;
  confirmerAction('Annuler cette facture et supprimer toutes les lignes ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('deleteAchat', { ach_id: ef.factureActive.ach_id });
    if (res && res.success) {
      ef.factureActive      = null;
      ef.lignes             = [];
      ef._saisieIngId       = null;
      ef._saisieProdFournId = null;
      ef._saisieCatFournId  = null;
      ef._editIdx           = null;
      document.getElementById('ef-fournisseur').value = '';
      document.getElementById('ef-fournisseur-nouveau')?.classList.add('cache');
      document.getElementById('ef-numero').value    = '';
      document.getElementById('ef-tps').value       = '';
      document.getElementById('ef-tvq').value       = '';
      document.getElementById('ef-livraison').value = '';
      document.getElementById('ef-soustotal').value = '';
      document.getElementById('ef-total').value     = '';
      document.getElementById('ef-btn-creer')?.classList.remove('cache');
      document.getElementById('ef-zone-items')?.classList.add('cache');
      document.getElementById('ef-tbody').innerHTML = '';
      efInitDate();
      cacherChargement();
      afficherMsg('ef', '✅ Facture annulée.');
    } else {
      cacherChargement();
      afficherMsg('ef', res?.message || 'Erreur annulation.', 'erreur');
    }
  });
}
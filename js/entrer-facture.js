/* ═══════════════════════════════════════
   UNIVERS CARESSE — entrer-facture.js
   Module saisie facture V3
   Tous les IDs sont préfixés ef-
   ═══════════════════════════════════════ */

// ─── ÉTAT ───
var ef = {
  factureActive: null,  // { ach_id, numero, date, fournisseur, four_id, four_code }
  lignes:        [],    // lignes sauvegardées
  mapping:       [],    // [{fournisseur, categorie_fournisseur, nom_fournisseur, categorie_UC, nom_UC, ing_id}]
  formats:       [],    // [{ing_id, contenant, quantite, unite, fournisseur}]
  fournisseurs:  [],    // [{four_id, code, nom}]
  scrapingItems: [],    // [{nom, categorie}]
  _saisieIngId:  null,
  _initEnCours:  false,
};

// Codes fournisseurs avec scraping (colonne B de Fournisseurs_v2)
var EF_SCRAPING_CODES = ['PA', 'MH', 'Arbressence', 'DE'];

// ─── parseFloat robuste — gère virgule et point ───
function efParseFlt(val) {
  if (val === null || val === undefined || val === '') return 0;
  return parseFloat(String(val).replace(/\s/g, '').replace(',', '.')) || 0;
}

// ─── INIT (appelé par admin.js via afficherSection) ───
async function efInit() {
  if (ef._initEnCours) return;
  ef._initEnCours = true;
  try {
    const [resFour, resInci, resCats, resMap, resFmt, resCfg] = await Promise.all([
      appelAPI('getFournisseurs'),
      appelAPI('getIngredientsInci'),
      appelAPI('getCategoriesUC'),
      appelAPI('getMappingFournisseurs'),
      appelAPI('getFormatsIngredients'),
      appelAPI('getConfig')
    ]);

    if (resFour && resFour.success) {
      ef.fournisseurs = resFour.items || [];
      listesDropdown.fournisseurs = ef.fournisseurs.map(f => f.nom);
    }
    if (resInci && resInci.success) {
      listesDropdown.fullData = resInci.items || [];
      listesDropdown.types = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean).sort();
    }
    if (resCats && resCats.success) {
      listesDropdown.categoriesMap = {};
      (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
    }
    if (resMap && resMap.success) ef.mapping = resMap.items || [];
    if (resFmt && resFmt.success) ef.formats = resFmt.items || [];
    if (resCfg && resCfg.success) {
      listesDropdown.config = {};
      (resCfg.items || []).forEach(c => {
        listesDropdown.config[c.type] = {
          densite:       parseFloat(c.densite)         || 1,
          unite:         c.unite                       || 'g',
          margePertePct: parseFloat(c.marge_perte_pct) || 0
        };
      });
    }

    efPopulerFournisseurs();
    efInitDate();

    // Vérifier s'il y a une facture En cours à reprendre
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
  if (ef.factureActive) return; // déjà active en mémoire
  const resAch = await appelAPI('getAchatsEntete');
  if (!resAch || !resAch.success) return;
  const enCours = (resAch.items || []).find(a => a.statut === 'En cours');
  if (!enCours) return;

  // Trouver le nom du fournisseur
  const four = ef.fournisseurs.find(f => f.four_id === enCours.four_id);
  const fourNom  = four?.nom  || enCours.four_id;
  const fourCode = four?.code || '';

  // Afficher le bandeau de reprise
  const bandeau = document.getElementById('ef-bandeau-reprise');
  const texte   = document.getElementById('ef-bandeau-reprise-texte');
  if (bandeau && texte) {
    texte.textContent = `Facture ${enCours.numero_facture || enCours.ach_id} — ${fourNom} — ${enCours.date || ''}`;
    bandeau.classList.remove('cache');
  }

  // Stocker temporairement pour reprise
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

  // Charger scraping si applicable
  ef.scrapingItems = [];
  if (f.four_code && EF_SCRAPING_CODES.includes(f.four_code)) {
    const resScraping = await appelAPI('getScrapingFournisseur', { source: f.four_code });
    if (resScraping && resScraping.success) ef.scrapingItems = resScraping.items || [];
  }

  // Charger les lignes existantes
  const resLignes = await appelAPI('getAchatsLignes', { ach_id: f.ach_id });
  ef.lignes = [];
  if (resLignes && resLignes.success) {
    (resLignes.items || []).forEach(l => {
      const ing   = (listesDropdown.fullData || []).find(d => d.ing_id === l.ing_id);
      const nomUC = ing?.nom_UC || '';
      const cat_id = ing?.cat_id || '';
      const catUC  = listesDropdown.categoriesMap?.[cat_id] || '';
      ef.lignes.push({
        ing_id:       l.ing_id,
        nomUC,
        catFourn:     '',
        nomFourn:     '',
        catUC,
        formatQte:    l.format_qte,
        formatUnite:  l.format_unite,
        contenant:    l.notes || '',
        prixUnitaire: l.prix_unitaire,
        quantite:     l.quantite,
        prixTotal:    l.prix_total,
        prixParG:     l.prix_par_g
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

// ─── CALCUL PRIX/G ───
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
  if (formatUnite === 'unité') return 0;
  return qte;
}

function efCalculerPrixParG(prixUnitaire, formatQte, formatUnite, cat_id) {
  if (formatUnite === 'unité') return 0;
  const grammes = efCalculerGrammes(formatQte, formatUnite, cat_id);
  if (grammes <= 0) return 0;
  return efParseFlt(prixUnitaire) / grammes;
}

// ─── DATE (sans valeur prédéfinie) ───
function efInitDate() {
  const selJour  = document.getElementById('ef-date-jour');
  const selAnnee = document.getElementById('ef-date-annee');
  if (!selJour || !selAnnee) return;

  if (!selJour.options.length) {
    selJour.innerHTML = Array.from({length:31}, (_,i) => {
      const j = String(i+1).padStart(2,'0');
      return `<option value="${j}">${j}</option>`;
    }).join('');
  }

  const anneeActuelle = new Date().getFullYear();
  if (!selAnnee.options.length) {
    selAnnee.innerHTML = [anneeActuelle-1, anneeActuelle, anneeActuelle+1]
      .map(a => `<option value="${a}">${a}</option>`).join('');
  }
  // Pas de valeur prédéfinie — l'utilisateur choisit
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
  const sel   = document.getElementById('ef-fournisseur');
  const champ = document.getElementById('ef-fournisseur-nouveau');
  if (!sel || !champ) return;
  champ.classList.toggle('cache', sel.value !== '__nouveau__');
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
    four_id  = champNouv;
    fourNom  = champNouv;
    fourCode = '';
  }

  if (!four_id || !date || !numero) {
    afficherMsg('ef', 'Fournisseur, date et numéro sont requis.', 'erreur');
    return;
  }

  const btn = document.getElementById('ef-btn-creer');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>'; }

  // Charger le scraping via le CODE du fournisseur
  ef.scrapingItems = [];
  if (fourCode && EF_SCRAPING_CODES.includes(fourCode)) {
    const resScraping = await appelAPI('getScrapingFournisseur', { source: fourCode });
    if (resScraping && resScraping.success) ef.scrapingItems = resScraping.items || [];
  }

  const ach_id = 'ACH-' + Date.now();
  const res = await appelAPIPost('createAchatEntete', { ach_id, date, four_id, numero_facture: numero });

  if (btn) { btn.disabled = false; btn.innerHTML = 'Créer'; }

  if (!res || !res.success) {
    afficherMsg('ef', res?.message || 'Erreur création facture.', 'erreur');
    return;
  }

  ef.factureActive = { ach_id, numero, date, fournisseur: fourNom, four_id, four_code: fourCode };
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

  // Catégories fournisseur : scraping > mapping > catégories UC
  const catsScrap = [...new Set(
    ef.scrapingItems.map(i => i.categorie).filter(Boolean)
  )].sort((a,b) => a.localeCompare(b,'fr'));

  const fourNom = ef.factureActive?.fournisseur || '';
  const catsMapping = [...new Set(
    ef.mapping.filter(m => m.fournisseur === fourNom).map(m => m.categorie_fournisseur).filter(Boolean)
  )].sort((a,b) => a.localeCompare(b,'fr'));

  const cats = catsScrap.length > 0 ? catsScrap
    : catsMapping.length > 0 ? catsMapping
    : Object.keys(listesDropdown.categoriesMap || {})
        .sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr'))
        .map(k => listesDropdown.categoriesMap[k]);

  const optsCatFourn = cats.map(c => `<option value="${c}">${c}</option>`).join('');

  const optsCatUC = Object.keys(listesDropdown.categoriesMap || {})
    .sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr'))
    .map(k => `<option value="${k}">${listesDropdown.categoriesMap[k]}</option>`).join('');

  const tr = document.createElement('tr');
  tr.id = 'ef-ligne-saisie';
  tr.innerHTML = `
    <td style="min-width:130px">
      <select class="form-ctrl" id="ef-saisie-cat-fourn" onchange="efOnChangeSaisieCatFourn()" style="width:100%">
        <option value="">— Catégorie —</option>
        ${optsCatFourn}
        <option value="__nouveau__">+ Autre…</option>
      </select>
      <input type="text" class="form-ctrl cache" id="ef-saisie-cat-fourn-nouveau" placeholder="Nouvelle catégorie" autocomplete="off">
    </td>
    <td style="min-width:150px">
      <select class="form-ctrl" id="ef-saisie-nom-fourn" onchange="efOnChangeSaisieNomFourn()" style="width:100%">
        <option value="">— Nom —</option>
      </select>
      <input type="text" class="form-ctrl cache" id="ef-saisie-nom-fourn-nouveau" placeholder="Nom sur la facture" autocomplete="off" oninput="efOnSaisieNomFournTexte()">
    </td>
    <td style="min-width:130px">
      <select class="form-ctrl" id="ef-saisie-format" onchange="efOnChangeSaisieFormat()" style="width:100%">
        <option value="">— Format —</option>
        <option value="__nouveau__">+ Nouveau format…</option>
      </select>
    </td>
    <td style="width:70px">
      <input type="text" inputmode="decimal" class="form-ctrl" id="ef-saisie-qte" placeholder="Qté" autocomplete="off" oninput="efMajLigneTotal()" style="width:70px">
    </td>
    <td style="width:90px">
      <input type="text" inputmode="decimal" class="form-ctrl" id="ef-saisie-prix" placeholder="Prix $" autocomplete="off" oninput="efMajLigneTotal()" style="width:90px">
    </td>
    <td id="ef-saisie-total" style="color:var(--primary);font-weight:500;white-space:nowrap">—</td>
    <td style="min-width:130px">
      <select class="form-ctrl" id="ef-saisie-cat-uc" onchange="efOnChangeSaisieCatUC()" style="width:100%">
        <option value="">— Cat. UC —</option>
        ${optsCatUC}
      </select>
    </td>
    <td style="min-width:150px">
      <select class="form-ctrl" id="ef-saisie-nom-uc" onchange="efOnChangeSaisieNomUC()" style="width:100%">
        <option value="">— Nom UC —</option>
      </select>
      <input type="text" class="form-ctrl cache" id="ef-saisie-nom-uc-nouveau" placeholder="Nouveau nom UC" autocomplete="off">
    </td>
    <td>
      <button class="bouton bouton-petit" onclick="efAjouterLigne()" title="Ajouter">+</button>
    </td>`;
  tbody.appendChild(tr);
}

// ─── CASCADES ───
function efOnChangeSaisieCatFourn() {
  const sel   = document.getElementById('ef-saisie-cat-fourn');
  const champ = document.getElementById('ef-saisie-cat-fourn-nouveau');
  if (!sel || !champ) return;
  const isNew = sel.value === '__nouveau__';
  champ.classList.toggle('cache', !isNew);
  if (isNew) { champ.focus(); return; }
  efPopulerNomsFourn(sel.value);
}

function efPopulerNomsFourn(catFourn) {
  const sel   = document.getElementById('ef-saisie-nom-fourn');
  const champ = document.getElementById('ef-saisie-nom-fourn-nouveau');
  if (!sel) return;
  const fourNom = ef.factureActive?.fournisseur || '';

  // Noms depuis scraping si disponible, sinon mapping
  const nomsScrap = ef.scrapingItems
    .filter(i => !catFourn || i.categorie === catFourn)
    .map(i => i.nom).filter(Boolean)
    .sort((a,b) => a.localeCompare(b,'fr'));

  const nomsMapping = [...new Set(
    ef.mapping
      .filter(m => m.fournisseur === fourNom && (!catFourn || m.categorie_fournisseur === catFourn))
      .map(m => m.nom_fournisseur).filter(Boolean)
  )].sort((a,b) => a.localeCompare(b,'fr'));

  const noms = nomsScrap.length > 0 ? nomsScrap : nomsMapping;

  sel.innerHTML = '<option value="">— Nom —</option>' +
    noms.map(n => `<option value="${n}">${n}</option>`).join('') +
    '<option value="__nouveau__">+ Nouveau nom…</option>';

  if (champ) champ.classList.add('cache');
  efReinitDepuisNom();
}

function efOnChangeSaisieNomFourn() {
  const sel   = document.getElementById('ef-saisie-nom-fourn');
  const champ = document.getElementById('ef-saisie-nom-fourn-nouveau');
  if (!sel || !champ) return;
  const isNew = sel.value === '__nouveau__';
  champ.classList.toggle('cache', !isNew);
  if (isNew) { champ.focus(); efReinitDepuisNom(); return; }

  if (sel.value) {
    const fourNom = ef.factureActive?.fournisseur || '';
    const mapping = ef.mapping.find(m => m.fournisseur === fourNom && m.nom_fournisseur === sel.value);
    if (mapping) {
      const selCatUC = document.getElementById('ef-saisie-cat-uc');
      if (selCatUC) {
        const cat_id = Object.keys(listesDropdown.categoriesMap || {})
          .find(k => listesDropdown.categoriesMap[k] === mapping.categorie_UC) || '';
        selCatUC.value = cat_id;
        efOnChangeSaisieCatUC();
        setTimeout(() => {
          const selNomUC = document.getElementById('ef-saisie-nom-uc');
          if (selNomUC && mapping.ing_id) {
            selNomUC.value = mapping.ing_id;
            ef._saisieIngId = mapping.ing_id;
            efPopulerFormats(mapping.ing_id);
          }
        }, 50);
      }
    } else {
      efReinitDepuisNom();
    }
  }
}

function efOnSaisieNomFournTexte() {
  efReinitDepuisNom();
}

function efReinitDepuisNom() {
  const selFmt = document.getElementById('ef-saisie-format');
  if (selFmt) selFmt.innerHTML = '<option value="">— Format —</option><option value="__nouveau__">+ Nouveau format…</option>';
  ef._saisieIngId = null;
}

function efPopulerFormats(ing_id) {
  const selFmt  = document.getElementById('ef-saisie-format');
  if (!selFmt) return;
  const fourNom = ef.factureActive?.fournisseur || '';

  const formatsConnus = ef.formats.filter(f =>
    f.ing_id === ing_id && (!f.fournisseur || f.fournisseur === fourNom)
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
  if (ef._saisieIngId) efPopulerFormats(ef._saisieIngId);
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

  const selCatF = document.getElementById('ef-saisie-cat-fourn');
  let catFourn = selCatF?.value === '__nouveau__'
    ? document.getElementById('ef-saisie-cat-fourn-nouveau')?.value?.trim()
    : selCatF?.value;

  const selNomF = document.getElementById('ef-saisie-nom-fourn');
  let nomFourn = selNomF?.value === '__nouveau__' || !selNomF?.value
    ? document.getElementById('ef-saisie-nom-fourn-nouveau')?.value?.trim()
    : selNomF?.value;

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

  if (!catFourn)  { afficherMsg('ef-items', 'Catégorie fournisseur requise.', 'erreur'); return; }
  if (!nomFourn)  { afficherMsg('ef-items', 'Nom fournisseur requis.', 'erreur'); return; }
  if (!formatQte) { afficherMsg('ef-items', 'Format requis.', 'erreur'); return; }
  if (!prixUnit)  { afficherMsg('ef-items', 'Prix unitaire requis.', 'erreur'); return; }
  if (!quantite)  { afficherMsg('ef-items', 'Quantité requise.', 'erreur'); return; }
  if (!ing_id)    { afficherMsg('ef-items', 'Ingrédient UC requis.', 'erreur'); return; }

  const prixUnitNum = efParseFlt(prixUnit);
  const quantiteNum = efParseFlt(quantite);
  const prixTotal   = quantiteNum * prixUnitNum;
  const prixParG    = efCalculerPrixParG(prixUnitNum, formatQte, formatUnite, cat_id);
  const fourNom     = ef.factureActive.fournisseur;

  const res = await appelAPIPost('addAchatLigne', {
    ach_id:        ef.factureActive.ach_id,
    ing_id,
    format_qte:    efParseFlt(formatQte),
    format_unite:  formatUnite,
    prix_unitaire: prixUnitNum,
    prix_par_g:    prixParG,
    quantite:      quantiteNum,
    fournisseur:   fourNom,
    notes:         contenant
  });

  if (!res || !res.success) {
    afficherMsg('ef-items', res?.message || 'Erreur ajout ligne.', 'erreur');
    return;
  }

  // Sauvegarder mapping si nouveau
  const mappingExiste = ef.mapping.find(m => m.fournisseur === fourNom && m.nom_fournisseur === nomFourn);
  if (!mappingExiste) {
    const catUCNom = listesDropdown.categoriesMap?.[cat_id] || cat_id;
    await appelAPIPost('saveMappingFournisseur', {
      fournisseur: fourNom, categorie_fournisseur: catFourn,
      nom_fournisseur: nomFourn, categorie_UC: catUCNom, nom_UC: nomUC, ing_id
    });
    ef.mapping.push({ fournisseur: fourNom, categorie_fournisseur: catFourn, nom_fournisseur: nomFourn, categorie_UC: catUCNom, nom_UC: nomUC, ing_id });
  }

  // Mémoriser format si nouveau
  const fmtExiste = ef.formats.find(f =>
    f.ing_id === ing_id && efParseFlt(f.quantite) === efParseFlt(formatQte) &&
    f.unite === formatUnite && f.fournisseur === fourNom
  );
  if (!fmtExiste) {
    ef.formats.push({ ing_id, contenant, quantite: efParseFlt(formatQte), unite: formatUnite, fournisseur: fourNom });
  }

  const catUCNom = listesDropdown.categoriesMap?.[cat_id] || cat_id;
  ef.lignes.push({
    ing_id, nomUC, catFourn, nomFourn, catUC: catUCNom,
    formatQte: efParseFlt(formatQte), formatUnite, contenant,
    prixUnitaire: prixUnitNum, quantite: quantiteNum,
    prixTotal, prixParG
  });

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
    const prixGAff = l.formatUnite === 'unité'
      ? formaterPrix(l.prixUnitaire) + '/u'
      : (l.prixParG > 0 ? l.prixParG.toFixed(4) + ' $/g' : '—');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:0.82rem;color:var(--gris)">${l.catFourn}</td>
      <td style="font-weight:500">${l.nomFourn}</td>
      <td style="font-size:0.82rem;color:var(--gris)">${fmt}<br><span style="font-size:0.72rem">${prixGAff}</span></td>
      <td>${l.quantite}</td>
      <td>${formaterPrix(l.prixUnitaire)}</td>
      <td style="color:var(--primary);font-weight:500">${formaterPrix(l.prixTotal)}</td>
      <td style="font-size:0.82rem;color:var(--gris)">${l.catUC}</td>
      <td style="font-weight:500">${l.nomUC}</td>
      <td><button class="bouton bouton-petit bouton-rouge" onclick="efSupprimerLigne(${idx})">✕</button></td>`;
    if (ligneSaisie) tbody.insertBefore(tr, ligneSaisie);
    else tbody.appendChild(tr);
  });
}

async function efSupprimerLigne(idx) {
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

  afficherMsg('ef-final', `✅ Facture finalisée — Total : ${formaterPrix(res.total)}`);

  setTimeout(() => {
    ef.factureActive  = null;
    ef.lignes         = [];
    ef._saisieIngId   = null;
    ef.scrapingItems  = [];
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }
    document.getElementById('ef-fournisseur').value = '';
    document.getElementById('ef-fournisseur-nouveau')?.classList.add('cache');
    document.getElementById('ef-numero').value    = '';
    document.getElementById('ef-tps').value       = '';
    document.getElementById('ef-tvq').value       = '';
    document.getElementById('ef-livraison').value = '';
    document.getElementById('ef-soustotal').value = '';
    document.getElementById('ef-total').value     = '';
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
  document.getElementById('modal-ef-fmt-unite').value = 'g';
  document.getElementById('modal-ef-fmt-qte').value   = '';
  document.getElementById('modal-ef-fmt-qte-bloc')?.classList.remove('cache');
  modal.classList.add('ouvert');
  document.getElementById('modal-ef-fmt-unite').focus();
}

function efFermerModalFormat() {
  document.getElementById('modal-ef-format')?.classList.remove('ouvert');
}

function efOnChangeModalFmtUnite() {
  const unite = document.getElementById('modal-ef-fmt-unite')?.value;
  const bloc  = document.getElementById('modal-ef-fmt-qte-bloc');
  if (bloc) bloc.classList.toggle('cache', unite === 'unité');
}

function efConfirmerModalFormat() {
  const unite = document.getElementById('modal-ef-fmt-unite')?.value;
  const qte   = unite === 'unité' ? '1' : document.getElementById('modal-ef-fmt-qte')?.value?.trim();
  if (!unite) return;
  if (unite !== 'unité' && !qte) { document.getElementById('modal-ef-fmt-qte').focus(); return; }

  const selFmt = document.getElementById('ef-saisie-format');
  if (selFmt) {
    const opt = document.createElement('option');
    opt.value = JSON.stringify({ quantite: efParseFlt(qte)||1, unite, contenant: '' });
    opt.textContent = unite === 'unité' ? 'unité' : qte + ' ' + unite;
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
  const modal  = document.getElementById('modal-ef-ingredient');
  const selCat = document.getElementById('modal-ef-ing-cat');
  const selNom = document.getElementById('modal-ef-ing-nomuc');
  if (!modal || !selCat || !selNom) return;

  selCat.innerHTML = '<option value="">— Catégorie UC —</option>' +
    Object.keys(listesDropdown.categoriesMap || {})
      .sort((a,b) => (listesDropdown.categoriesMap[a]||'').localeCompare(listesDropdown.categoriesMap[b]||'','fr'))
      .map(k => `<option value="${k}">${listesDropdown.categoriesMap[k]}</option>`).join('') +
    '<option value="__nouvelle_cat__">+ Créer une nouvelle catégorie</option>';

  document.getElementById('modal-ef-ing-nouvelle-cat-groupe')?.classList.add('cache');
  document.getElementById('modal-ef-ing-nouvelle-cat').value  = '';
  document.getElementById('modal-ef-ing-nouveau-nom-groupe')?.classList.add('cache');
  document.getElementById('modal-ef-ing-nouveau-nom').value   = '';
  selNom.innerHTML = '<option value="">— Choisir ou créer —</option>';
  selNom.classList.add('cache');
  modal.classList.add('ouvert');
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
  let cat_id = document.getElementById('modal-ef-ing-cat')?.value;
  const nouvelleCat = document.getElementById('modal-ef-ing-nouvelle-cat')?.value?.trim();

  if (cat_id === '__nouvelle_cat__') {
    if (!nouvelleCat) { document.getElementById('modal-ef-ing-nouvelle-cat').focus(); return; }
    const resCat = await appelAPIPost('saveCategorieUC', { nom: nouvelleCat });
    if (!resCat || !resCat.success) { afficherMsg('ef-items', 'Erreur création catégorie.', 'erreur'); return; }
    cat_id = resCat.cat_id || ('CAT-' + Date.now());
    listesDropdown.categoriesMap[cat_id] = nouvelleCat;
    listesDropdown.types.push(cat_id);
  }

  if (!cat_id) { document.getElementById('modal-ef-ing-cat').focus(); return; }

  const selNom     = document.getElementById('modal-ef-ing-nomuc');
  let   ing_id     = selNom?.value && selNom.value !== '__nouveau__' ? selNom.value : '';
  let   nomUC      = '';
  const nouveauNom = document.getElementById('modal-ef-ing-nouveau-nom')?.value?.trim();

  if (!ing_id || ing_id === '__nouveau__') {
    if (!nouveauNom) { document.getElementById('modal-ef-ing-nouveau-nom').focus(); return; }
    const ingExistant = (listesDropdown.fullData || []).find(d => d.nom_UC === nouveauNom && d.cat_id === cat_id);
    if (ingExistant) {
      ing_id = ingExistant.ing_id;
      nomUC  = ingExistant.nom_UC;
    } else {
      ing_id = 'ING-' + Date.now();
      const nomFournSaisie = document.getElementById('ef-saisie-nom-fourn-nouveau')?.value?.trim()
                          || document.getElementById('ef-saisie-nom-fourn')?.value || '';
      const res = await appelAPIPost('createIngredientInci', {
        ing_id, cat_id, nom_UC: nouveauNom,
        nom_fournisseur: nomFournSaisie || nouveauNom,
        inci: '', statut: 'actif'
      });
      if (!res || !res.success) { afficherMsg('ef-items', res?.message || 'Erreur création ingrédient.', 'erreur'); return; }
      listesDropdown.fullData.push({ ing_id, cat_id, nom_UC: nouveauNom, inci: '' });
      nomUC = nouveauNom;
    }
  } else {
    nomUC = (listesDropdown.fullData || []).find(d => d.ing_id === ing_id)?.nom_UC || '';
  }

  ef._saisieIngId = ing_id;
  const selCatUC = document.getElementById('ef-saisie-cat-uc');
  const selNomUC = document.getElementById('ef-saisie-nom-uc');
  if (selCatUC) { selCatUC.value = cat_id; efOnChangeSaisieCatUC(); }
  setTimeout(() => {
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
    efPopulerFormats(ing_id);
    efFermerModalIngredient();
  }, 50);
}
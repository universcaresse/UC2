/* ═══════════════════════════════════════
   UNIVERS CARESSE — achats.js
   Module achats complet et autonome
   ═══════════════════════════════════════ */

// ─── ÉTAT DU MODULE ───
var achats = {
  factureActive:   null,   // { ach_id, numero, date, fournisseur, four_id }
  lignes:          [],     // items saisis dans la facture en cours
  toutesFactures:  [],     // liste complète pour l'affichage
  mapping:         [],     // [{fournisseur, categorie_fournisseur, nom_fournisseur, categorie_UC, nom_UC, ing_id}]
  formats:         [],     // [{ing_id, contenant, quantite, unite, fournisseur}]
  fournisseurs:    [],     // [{four_id, nom}]
};

// ─── INITIALISATION ───

async function achatsInit() {
  achats.factureActive = null;
  achats.lignes        = [];

  const [resFour, resInci, resCats, resMap, resFmt, resCfg] = await Promise.all([
    appelAPI('getFournisseurs'),
    appelAPI('getIngredientsInci'),
    appelAPI('getCategoriesUC'),
    appelAPI('getMappingFournisseurs'),
    appelAPI('getFormatsIngredients'),
    appelAPI('getConfig')
  ]);

  if (resFour && resFour.success) {
    achats.fournisseurs          = resFour.items || [];
    listesDropdown.fournisseurs  = achats.fournisseurs.map(f => f.nom);
  }
  if (resInci && resInci.success) {
    listesDropdown.fullData = resInci.items || [];
    listesDropdown.types    = [...new Set(resInci.items.map(i => i.cat_id))].filter(Boolean).sort();
  }
  if (resCats && resCats.success) {
    listesDropdown.categoriesMap = {};
    (resCats.items || []).forEach(c => { listesDropdown.categoriesMap[c.cat_id] = c.nom; });
  }
  if (resMap && resMap.success) {
    achats.mapping = resMap.items || [];
  }
  if (resFmt && resFmt.success) {
    achats.formats = resFmt.items || [];
  }
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

  achatsPopulerFournisseurs();
  document.getElementById('facture-date').value = new Date().toISOString().split('T')[0];
  afficherMsg('nouvelle-facture', '');
}

// ─── CALCUL PRIX/G — FONCTION CENTRALE ───
// Utilisée partout de façon identique
// Retourne le prix_par_g_brut SANS marge perte
// La marge perte est appliquée à la finalisation avec le facteur_majoration

function achatsCalculerGrammes(formatQte, formatUnite, cat_id) {
  const qte     = parseFloat(formatQte) || 0;
  const cfg     = listesDropdown.config?.[cat_id] || {};
  const densite = cfg.densite || 1;

  if (formatUnite === 'g')    return qte;
  if (formatUnite === 'kg')   return qte * 1000;
  if (formatUnite === 'lbs')  return qte * 453.592;
  if (formatUnite === 'ml')   return qte * densite;
  if (formatUnite === 'L')    return qte * 1000 * densite;
  if (formatUnite === 'l')    return qte * 1000 * densite;
  if (formatUnite === 'unité') return 0; // prix par unité, pas par gramme
  return qte;
}

function achatsCalculerPrixParG(prixUnitaire, formatQte, formatUnite, cat_id) {
  if (formatUnite === 'unité') return 0;
  const grammes = achatsCalculerGrammes(formatQte, formatUnite, cat_id);
  if (grammes <= 0) return 0;
  return parseFloat(prixUnitaire) / grammes;
}

// ─── ENTÊTE FACTURE ───

function achatsPopulerFournisseurs() {
  const sel = document.getElementById('facture-fournisseur');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  achats.fournisseurs.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.four_id; opt.textContent = f.nom;
    sel.appendChild(opt);
  });
  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouveau fournisseur…';
  sel.appendChild(optNew);
}

function achatsOnChangeFournisseur() {
  const sel   = document.getElementById('facture-fournisseur');
  const champ = document.getElementById('facture-fournisseur-nouveau');
  if (!sel || !champ) return;
  champ.classList.toggle('cache', sel.value !== '__nouveau__');
  // Réinitialiser le formulaire item quand on change de fournisseur
  achatsReinitItem();
}

async function achatsEtape2() {
  const selFour   = document.getElementById('facture-fournisseur');
  const date      = document.getElementById('facture-date')?.value;
  const numero    = document.getElementById('facture-numero')?.value?.trim();
  let   four_id   = selFour?.value;
  let   fourNom   = selFour?.options[selFour.selectedIndex]?.textContent || '';

  if (four_id === '__nouveau__') {
    const champNouv = document.getElementById('facture-fournisseur-nouveau')?.value?.trim();
    if (!champNouv) { afficherMsg('nouvelle-facture', 'Entrez le nom du nouveau fournisseur.', 'erreur'); return; }
    four_id = champNouv;
    fourNom = champNouv;
  }

  if (!four_id || !date || !numero) {
    afficherMsg('nouvelle-facture', 'Fournisseur, date et numéro sont requis.', 'erreur');
    return;
  }

  if (achats.factureActive) {
    achatsAfficherEtape(2);
    return;
  }

  const ach_id = 'ACH-' + Date.now();
  const res = await appelAPIPost('createAchatEntete', { ach_id, date, four_id, numero_facture: numero });
  if (!res || !res.success) {
    afficherMsg('nouvelle-facture', res?.message || 'Erreur création facture.', 'erreur');
    return;
  }

  achats.factureActive = { ach_id, numero, date, fournisseur: fourNom, four_id };
  achatsAfficherEtape(2);
  achatsMAJBanniere();
}

// ─── NAVIGATION ÉTAPES ───

function achatsAfficherEtape(n) {
  [1, 2, 3].forEach(i => {
    const step = document.getElementById('achat-step-' + i);
    if (step) step.classList.toggle('cache', i !== n);
    const ind  = document.getElementById('achat-etape-' + i);
    if (ind) {
      ind.classList.toggle('active',   i === n);
      ind.classList.toggle('complete', i < n);
      if (i > n) { ind.classList.remove('active'); ind.classList.remove('complete'); }
    }
  });
  window.scrollTo(0, 0);
}

function achatsRetourEtape1() {
  achatsAfficherEtape(1);
}

function achatsPasserEtape3() {
  if (!achats.lignes.length) {
    afficherMsg('achat-items', 'Ajoutez au moins un item.', 'erreur');
    return;
  }
  const sousTotal = achats.lignes.reduce((s, l) => s + l.prixTotal, 0);
  const el = document.getElementById('final-sous-total');
  if (el) el.value = sousTotal.toFixed(2);
  achatsCalculerTotalFinal();
  achatsAfficherEtape(3);
}

// ─── SAISIE ITEM ───

function achatsOnChangeCatFournisseur() {
  const selCat  = document.getElementById('item-cat-fournisseur');
  const selNom  = document.getElementById('item-nom-fournisseur');
  if (!selCat || !selNom) return;
  const cat      = selCat.value;
  const fourNom  = achats.factureActive?.fournisseur || '';

  selNom.innerHTML = '<option value="">— Choisir —</option>';

  // Chercher dans le mapping les noms connus pour ce fournisseur + catégorie
  const nomsFournisseur = achats.mapping
    .filter(m => m.fournisseur === fourNom && (!cat || m.categorie_fournisseur === cat))
    .map(m => m.nom_fournisseur)
    .filter(Boolean);
  const nomsUniques = [...new Set(nomsFournisseur)].sort((a, b) => a.localeCompare(b, 'fr'));

  nomsUniques.forEach(nom => {
    const opt = document.createElement('option');
    opt.value = nom; opt.textContent = nom;
    selNom.appendChild(opt);
  });

  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouveau nom…';
  selNom.appendChild(optNew);

  // Réinitialiser les champs suivants
  achatsReinitDepuisNomFournisseur();
}

function achatsOnChangeNomFournisseur() {
  const selNom  = document.getElementById('item-nom-fournisseur');
  const champ   = document.getElementById('item-nom-fournisseur-nouveau');
  if (!selNom || !champ) return;
  champ.classList.toggle('cache', selNom.value !== '__nouveau__');

  if (selNom.value && selNom.value !== '__nouveau__') {
    // Trouver le mapping correspondant
    const fourNom = achats.factureActive?.fournisseur || '';
    const mapping = achats.mapping.find(m =>
      m.fournisseur === fourNom && m.nom_fournisseur === selNom.value
    );
    if (mapping) {
      // Pré-remplir Cat UC + Nom UC
      const selCatUC = document.getElementById('item-cat-uc');
      const selNomUC = document.getElementById('item-nom-uc');
      if (selCatUC) {
        // Trouver le cat_id correspondant au nom de catégorie UC
        const cat_id = Object.keys(listesDropdown.categoriesMap || {})
          .find(k => listesDropdown.categoriesMap[k] === mapping.categorie_UC) || '';
        selCatUC.value = cat_id;
        achatsOnChangeCatUC();
        if (selNomUC) selNomUC.value = mapping.nom_UC;
      }
      // Pré-remplir formats connus
      achatsPopulerFormats(mapping.ing_id);
    }
  } else {
    achatsReinitDepuisNomFournisseur();
  }
}

function achatsReinitDepuisNomFournisseur() {
  const selCatUC = document.getElementById('item-cat-uc');
  const selNomUC = document.getElementById('item-nom-uc');
  const selFmt   = document.getElementById('item-format');
  if (selCatUC) selCatUC.value = '';
  if (selNomUC) { selNomUC.innerHTML = '<option value="">— Choisir —</option>'; }
  if (selFmt)   { selFmt.innerHTML   = '<option value="">— Choisir un format —</option>'; }
  achatsAfficherBlocsFormat(false);
}

function achatsOnChangeCatUC() {
  const selCatUC = document.getElementById('item-cat-uc');
  const selNomUC = document.getElementById('item-nom-uc');
  if (!selCatUC || !selNomUC) return;
  const cat_id = selCatUC.value;

  selNomUC.innerHTML = '<option value="">— Choisir —</option>';
  (listesDropdown.fullData || [])
    .filter(d => d.cat_id === cat_id)
    .sort((a, b) => (a.nom_UC || '').localeCompare(b.nom_UC || '', 'fr'))
    .forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.ing_id; opt.dataset.nom = d.nom_UC; opt.textContent = d.nom_UC;
      selNomUC.appendChild(opt);
    });

  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouvel ingrédient…';
  selNomUC.appendChild(optNew);
}

function achatsOnChangeNomUC() {
  const selNomUC = document.getElementById('item-nom-uc');
  const champ    = document.getElementById('item-nom-uc-nouveau');
  if (!selNomUC || !champ) return;
  champ.classList.toggle('cache', selNomUC.value !== '__nouveau__');

  if (selNomUC.value && selNomUC.value !== '__nouveau__') {
    achatsPopulerFormats(selNomUC.value);
  }
}

function achatsPopulerFormats(ing_id) {
  const selFmt  = document.getElementById('item-format');
  if (!selFmt) return;
  const fourNom = achats.factureActive?.fournisseur || '';

  const formatsConnus = achats.formats.filter(f =>
    f.ing_id === ing_id && (!f.fournisseur || f.fournisseur === fourNom)
  );

  selFmt.innerHTML = '<option value="">— Choisir un format —</option>';
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

function achatsOnChangeFormat() {
  const selFmt = document.getElementById('item-format');
  if (!selFmt) return;
  const nouveau = selFmt.value === '__nouveau__';
  achatsAfficherBlocsFormat(nouveau);

  if (!nouveau && selFmt.value) {
    const f = JSON.parse(selFmt.value);
    const elQte   = document.getElementById('item-format-qte');
    const elUnite = document.getElementById('item-format-unite');
    if (elQte)   elQte.value   = f.quantite;
    if (elUnite) elUnite.value = f.unite;
    achatsMAJApercuPrix();
  } else if (nouveau) {
    const elQte   = document.getElementById('item-format-qte');
    const elUnite = document.getElementById('item-format-unite');
    if (elQte)   elQte.value   = '';
    if (elUnite) elUnite.value = 'g';
  }
}

function achatsAfficherBlocsFormat(afficher) {
  ['item-nouveau-format-bloc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('cache', !afficher);
  });
}

// ─── APERÇU PRIX/G EN TEMPS RÉEL ───

function achatsMAJApercuPrix() {
  const elPrix   = document.getElementById('item-prix-unitaire');
  const elQte    = document.getElementById('item-format-qte');
  const elUnite  = document.getElementById('item-format-unite');
  const elApercu = document.getElementById('item-apercu-prix-g');
  if (!elPrix || !elQte || !elUnite || !elApercu) return;

  const prixUnit  = parseFloat(elPrix.value)  || 0;
  const formatQte = parseFloat(elQte.value)   || 0;
  const unite     = elUnite.value;

  if (!prixUnit || !formatQte || !unite) { elApercu.textContent = ''; return; }
  if (unite === 'unité') { elApercu.textContent = formaterPrix(prixUnit) + ' / unité'; return; }

  // Trouver cat_id de l'ingrédient sélectionné
  const selNomUC = document.getElementById('item-nom-uc');
  const ing_id   = selNomUC?.value && selNomUC.value !== '__nouveau__' ? selNomUC.value : '';
  const ingObj   = (listesDropdown.fullData || []).find(d => d.ing_id === ing_id);
  const cat_id   = ingObj?.cat_id || document.getElementById('item-cat-uc')?.value || '';

  const prixParG = achatsCalculerPrixParG(prixUnit, formatQte, unite, cat_id);
  elApercu.textContent = prixParG > 0 ? prixParG.toFixed(4) + ' $/g (estimé, avant taxes/livraison)' : '';
}

// ─── PEUPLER CATÉGORIES FOURNISSEUR ───

function achatsPopulerCatsFournisseur() {
  const selCat  = document.getElementById('item-cat-fournisseur');
  if (!selCat) return;
  const fourNom = achats.factureActive?.fournisseur || '';

  // Fournisseurs avec mapping : catégories du mapping
  const catsMapping = [...new Set(
    achats.mapping
      .filter(m => m.fournisseur === fourNom)
      .map(m => m.categorie_fournisseur)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'fr'));

  selCat.innerHTML = '<option value="">— Choisir —</option>';

  if (catsMapping.length > 0) {
    // Fournisseur connu — catégories du mapping
    catsMapping.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      selCat.appendChild(opt);
    });
  } else {
    // Fournisseur sans mapping — catégories UC
    Object.keys(listesDropdown.categoriesMap || {})
      .sort((a, b) => (listesDropdown.categoriesMap[a] || '').localeCompare(listesDropdown.categoriesMap[b] || '', 'fr'))
      .forEach(cat_id => {
        const opt = document.createElement('option');
        opt.value = listesDropdown.categoriesMap[cat_id];
        opt.textContent = listesDropdown.categoriesMap[cat_id];
        selCat.appendChild(opt);
      });
  }

  const optNew = document.createElement('option');
  optNew.value = '__nouveau__'; optNew.textContent = '+ Nouvelle catégorie…';
  selCat.appendChild(optNew);
}

function achatsOnChangeCatFournisseurNouveau() {
  const sel   = document.getElementById('item-cat-fournisseur');
  const champ = document.getElementById('item-cat-fournisseur-nouveau');
  if (!sel || !champ) return;
  champ.classList.toggle('cache', sel.value !== '__nouveau__');
  if (sel.value !== '__nouveau__') achatsOnChangeCatFournisseur();
}

// ─── PEUPLER CAT UC (sélect) ───

function achatsPopulerCatsUC() {
  const sel = document.getElementById('item-cat-uc');
  if (!sel) return;
  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  Object.keys(listesDropdown.categoriesMap || {})
    .sort((a, b) => (listesDropdown.categoriesMap[a] || '').localeCompare(listesDropdown.categoriesMap[b] || '', 'fr'))
    .forEach(cat_id => {
      const opt = document.createElement('option');
      opt.value = cat_id; opt.textContent = listesDropdown.categoriesMap[cat_id];
      sel.appendChild(opt);
    });
  if (valActuelle) sel.value = valActuelle;
}

// ─── AJOUTER ITEM À LA FACTURE ───

async function achatsAjouterItem() {
  if (!achats.factureActive) { afficherMsg('achat-items', 'Aucune facture active.', 'erreur'); return; }

  // Lire catégorie fournisseur
  const selCatF   = document.getElementById('item-cat-fournisseur');
  let   catFourn  = selCatF?.value;
  if (catFourn === '__nouveau__') {
    catFourn = document.getElementById('item-cat-fournisseur-nouveau')?.value?.trim();
  }

  // Lire nom fournisseur
  const selNomF   = document.getElementById('item-nom-fournisseur');
  let   nomFourn  = selNomF?.value;
  if (nomFourn === '__nouveau__') {
    nomFourn = document.getElementById('item-nom-fournisseur-nouveau')?.value?.trim();
  }

  // Lire cat UC
  const selCatUC  = document.getElementById('item-cat-uc');
  const cat_id    = selCatUC?.value;

  // Lire nom UC
  const selNomUC  = document.getElementById('item-nom-uc');
  let   ing_id    = selNomUC?.value;
  let   nomUC     = selNomUC?.options[selNomUC.selectedIndex]?.dataset?.nom || '';
  if (ing_id === '__nouveau__') {
    const champNouv = document.getElementById('item-nom-uc-nouveau')?.value?.trim();
    if (!champNouv || !cat_id) {
      afficherMsg('achat-items', 'Nom UC et catégorie UC requis pour créer un nouvel ingrédient.', 'erreur');
      return;
    }
    // Créer le nouvel ingrédient
    const newIngId = 'ING-' + Date.now();
    const resIng = await appelAPIPost('createIngredientInci', {
      ing_id: newIngId, cat_id, nom_UC: champNouv,
      nom_fournisseur: nomFourn || champNouv, inci: '', statut: 'actif'
    });
    if (!resIng || !resIng.success) {
      afficherMsg('achat-items', resIng?.message || 'Erreur création ingrédient.', 'erreur');
      return;
    }
    ing_id = newIngId;
    nomUC  = champNouv;
    listesDropdown.fullData.push({ ing_id: newIngId, cat_id, nom_UC: champNouv, nom_fournisseur: nomFourn || champNouv, inci: '' });
  }

  // Lire format
  const selFmt    = document.getElementById('item-format');
  const isNew     = selFmt?.value === '__nouveau__';
  const formatQte = isNew
    ? document.getElementById('item-nouveau-qte')?.value?.trim()
    : document.getElementById('item-format-qte')?.value?.trim();
  const formatUnite = isNew
    ? document.getElementById('item-nouveau-unite')?.value
    : document.getElementById('item-format-unite')?.value;
  const contenant = isNew
    ? document.getElementById('item-contenant')?.value?.trim() || ''
    : (selFmt?.value ? JSON.parse(selFmt.value).contenant : '');

  // Lire prix + quantité
  const prixUnit  = document.getElementById('item-prix-unitaire')?.value?.trim();
  const quantite  = document.getElementById('item-quantite')?.value?.trim();
  const notes     = document.getElementById('item-notes')?.value?.trim() || '';

  // Validation
  if (!catFourn || !nomFourn || !formatQte || !formatUnite || !prixUnit || !quantite || !cat_id || !ing_id) {
    afficherMsg('achat-items', 'Tous les champs sont requis.', 'erreur');
    return;
  }

  const prixTotal  = parseFloat(quantite) * parseFloat(prixUnit);
  const prixParG   = achatsCalculerPrixParG(prixUnit, formatQte, formatUnite, cat_id);
  const fourNom    = achats.factureActive.fournisseur;

  // Sauvegarder la ligne
  const res = await appelAPIPost('addAchatLigne', {
    ach_id:       achats.factureActive.ach_id,
    ing_id,
    format_qte:   parseFloat(formatQte),
    format_unite: formatUnite,
    prix_unitaire: parseFloat(prixUnit),
    prix_par_g:   prixParG,
    quantite:     parseFloat(quantite),
    fournisseur:  fourNom,
    notes
  });

  if (!res || !res.success) {
    afficherMsg('achat-items', res?.message || 'Erreur ajout item.', 'erreur');
    return;
  }

  // Sauvegarder le mapping si nouveau lien fournisseur↔UC
  const mappingExiste = achats.mapping.find(m =>
    m.fournisseur === fourNom && m.nom_fournisseur === nomFourn
  );
  if (!mappingExiste) {
    const catUCNom = listesDropdown.categoriesMap?.[cat_id] || cat_id;
    await appelAPIPost('saveMappingFournisseur', {
      fournisseur:           fourNom,
      categorie_fournisseur: catFourn,
      nom_fournisseur:       nomFourn,
      categorie_UC:          catUCNom,
      nom_UC:                nomUC,
      ing_id
    });
    achats.mapping.push({
      fournisseur:           fourNom,
      categorie_fournisseur: catFourn,
      nom_fournisseur:       nomFourn,
      categorie_UC:          catUCNom,
      nom_UC:                nomUC,
      ing_id
    });
  }

  // Mémoriser le format s'il est nouveau
  const formatExiste = achats.formats.find(f =>
    f.ing_id === ing_id &&
    parseFloat(f.quantite) === parseFloat(formatQte) &&
    f.unite === formatUnite &&
    f.fournisseur === fourNom
  );
  if (!formatExiste) {
    achats.formats.push({ ing_id, contenant, quantite: parseFloat(formatQte), unite: formatUnite, fournisseur: fourNom });
  }

  // Ajouter à la liste locale
  achats.lignes.push({
    ing_id, nomUC, catFourn, nomFourn,
    catUC:        listesDropdown.categoriesMap?.[cat_id] || cat_id,
    formatQte:    parseFloat(formatQte),
    formatUnite,
    contenant,
    prixUnitaire: parseFloat(prixUnit),
    quantite:     parseFloat(quantite),
    prixTotal,
    prixParG,
    notes
  });

  afficherMsg('achat-items', '✅ Item ajouté.', 'succes');
  achatsReinitItem();
  achatsAfficherLignes();
  achatsMAJBanniere();
}

// ─── RÉINITIALISER FORMULAIRE ITEM ───

function achatsReinitItem() {
  ['item-cat-fournisseur','item-nom-fournisseur','item-cat-uc','item-nom-uc',
   'item-format','item-format-qte','item-format-unite','item-prix-unitaire',
   'item-quantite','item-notes','item-apercu-prix-g',
   'item-cat-fournisseur-nouveau','item-nom-fournisseur-nouveau','item-nom-uc-nouveau',
   'item-nouveau-qte','item-contenant'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  ['item-cat-fournisseur-nouveau','item-nom-fournisseur-nouveau',
   'item-nom-uc-nouveau','item-nouveau-format-bloc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('cache');
  });
  document.getElementById('item-nom-fournisseur').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('item-nom-uc').innerHTML           = '<option value="">— Choisir —</option>';
  document.getElementById('item-format').innerHTML           = '<option value="">— Choisir un format —</option>';

  // Repeupler catégories fournisseur selon le fournisseur actif
  if (achats.factureActive) {
    achatsPopulerCatsFournisseur();
    achatsPopulerCatsUC();
  }
}

// ─── AFFICHER LES LIGNES SAISIES ───

function achatsAfficherLignes() {
  const zone = document.getElementById('achat-lignes-zone');
  if (!zone) return;
  if (!achats.lignes.length) {
    zone.innerHTML = '<p class="vide-desc" style="padding:24px 0;">Aucun item pour l\'instant.</p>';
    return;
  }

  const sousTotal = achats.lignes.reduce((s, l) => s + l.prixTotal, 0);
  let html = `
    <div class="tableau-wrap">
      <table class="tableau-admin">
        <thead>
          <tr>
            <th>Nom fournisseur</th>
            <th>Nom UC</th>
            <th>Format</th>
            <th>Qté</th>
            <th>Prix unit.</th>
            <th>$/g estimé</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>`;

  achats.lignes.forEach((l, idx) => {
    const fmt = (l.contenant ? l.contenant + ' — ' : '') + l.formatQte + ' ' + l.formatUnite;
    const prixGAff = l.formatUnite === 'unité'
      ? formaterPrix(l.prixUnitaire) + '/u'
      : (l.prixParG > 0 ? l.prixParG.toFixed(4) + ' $/g' : '—');
    html += `
      <tr>
        <td>${l.nomFourn}</td>
        <td style="font-weight:500">${l.nomUC}</td>
        <td style="color:var(--gris);font-size:0.85rem">${fmt}</td>
        <td>${l.quantite}</td>
        <td>${formaterPrix(l.prixUnitaire)}</td>
        <td style="font-size:0.82rem;color:var(--gris)">${prixGAff}</td>
        <td style="color:var(--primary);font-weight:500">${formaterPrix(l.prixTotal)}</td>
        <td><button class="bouton bouton-petit bouton-rouge" onclick="achtsSupprimerLigne(${idx})">✕</button></td>
      </tr>`;
  });

  html += `</tbody></table></div>
    <div class="inv-total" style="margin-top:16px;">
      <div class="inv-total-label">Sous-total</div>
      <div class="inv-total-montant">${formaterPrix(sousTotal)}</div>
    </div>`;
  zone.innerHTML = html;
}

async function achtsSupprimerLigne(idx) {
  // Note: la ligne est déjà en BD — on ne peut pas la supprimer facilement sans rowIndex
  // On retire juste de la liste locale pour l'instant
  achats.lignes.splice(idx, 1);
  achatsAfficherLignes();
  achatsMAJBanniere();
}

// ─── BANNIÈRE RÉSUMÉ ───

function achatsMAJBanniere() {
  const banniere = document.getElementById('achat-banniere');
  if (!banniere || !achats.factureActive) return;
  banniere.classList.remove('cache');
  const sousTotal = achats.lignes.reduce((s, l) => s + l.prixTotal, 0);
  const elNum  = document.getElementById('banniere-numero');
  const elFour = document.getElementById('banniere-fournisseur');
  const elSous = document.getElementById('banniere-sous-total');
  if (elNum)  elNum.textContent  = achats.factureActive.numero;
  if (elFour) elFour.textContent = achats.factureActive.fournisseur;
  if (elSous) elSous.textContent = formaterPrix(sousTotal);
}

// ─── FINALISATION ───

function achatsCalculerTotalFinal() {
  const sousTotal = parseFloat(document.getElementById('final-sous-total')?.value) || 0;
  const tps       = parseFloat(document.getElementById('final-tps')?.value)        || 0;
  const tvq       = parseFloat(document.getElementById('final-tvq')?.value)        || 0;
  const livraison = parseFloat(document.getElementById('final-livraison')?.value)  || 0;
  const el = document.getElementById('final-total-affichage');
  if (el) el.textContent = formaterPrix(sousTotal + tps + tvq + livraison);
}

async function achatsFinaliscer() {
  if (!achats.factureActive) { afficherMsg('achat-final', 'Aucune facture active.', 'erreur'); return; }
  if (!achats.lignes.length) { afficherMsg('achat-final', 'Aucun item à finaliser.', 'erreur'); return; }

  const btn = document.getElementById('btn-finaliser-achat');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Finalisation…'; }

  const sousTotal = parseFloat(document.getElementById('final-sous-total')?.value) || 0;
  const tps       = parseFloat(document.getElementById('final-tps')?.value)        || 0;
  const tvq       = parseFloat(document.getElementById('final-tvq')?.value)        || 0;
  const livraison = parseFloat(document.getElementById('final-livraison')?.value)  || 0;

  const res = await appelAPIPost('finaliserAchat', {
    ach_id:     achats.factureActive.ach_id,
    sous_total: sousTotal,
    tps, tvq, livraison
  });

  if (!res || !res.success) {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }
    afficherMsg('achat-final', res?.message || 'Erreur lors de la finalisation.', 'erreur');
    return;
  }

  afficherMsg('achat-final', `✅ Facture finalisée — Total : ${formaterPrix(res.total)}`, 'succes');

  setTimeout(() => {
    achats.factureActive = null;
    achats.lignes        = [];
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }
    document.getElementById('facture-numero').value          = '';
    document.getElementById('facture-date').value            = new Date().toISOString().split('T')[0];
    document.getElementById('facture-fournisseur').value     = '';
    document.getElementById('achat-banniere')?.classList.add('cache');
    document.getElementById('achat-lignes-zone').innerHTML   = '';
    document.getElementById('final-total-affichage').textContent = '0,00 $';
    achatsAfficherEtape(1);
  }, 3000);
}

function achatsPlusTard() {
  achats.factureActive = null;
  achats.lignes        = [];
  afficherSection('factures', null);
  afficherMsg('factures', 'Facture sauvegardée — vous pouvez la compléter plus tard.', 'succes');
}

// ═══════════════════════════════════════
// LISTE DES FACTURES
// ═══════════════════════════════════════

var toutesFactures = [];

async function chargerFactures() {
  const loading = document.getElementById('loading-factures');
  const tableau = document.getElementById('tableau-factures');
  const vide    = document.getElementById('vide-factures');
  if (loading) loading.classList.remove('cache');
  if (tableau) tableau.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  const [resAch, resFour] = await Promise.all([
    appelAPI('getAchatsEntete'),
    appelAPI('getFournisseurs')
  ]);
  if (loading) loading.classList.add('cache');
  if (!resAch || !resAch.success) { afficherMsg('factures', 'Erreur lors du chargement.', 'erreur'); return; }

  const fournisseursMap = {};
  (resFour?.items || []).forEach(f => { fournisseursMap[f.four_id] = f.nom; });

  toutesFactures = (resAch.items || []).map(a => ({
    ...a,
    fournisseur: fournisseursMap[a.four_id] || a.four_id || '—',
    dateRaw:     a.date ? a.date.split('/').reverse().join('-') : '',
    dateAff:     a.date || '—'
  }));

  // Peupler filtre fournisseur
  const selFourn    = document.getElementById('filtre-fournisseur');
  const fournisseurs = [...new Set(toutesFactures.map(f => f.fournisseur).filter(Boolean))].sort();
  if (selFourn) {
    selFourn.innerHTML = '<option value="">Tous les fournisseurs</option>';
    fournisseurs.forEach(f => {
      const o = document.createElement('option');
      o.value = f; o.textContent = f; selFourn.appendChild(o);
    });
  }

  afficherFactures(toutesFactures);
}

function filtrerFactures() {
  const fourn  = document.getElementById('filtre-fournisseur')?.value  || '';
  const statut = document.getElementById('filtre-statut')?.value       || '';
  const debut  = document.getElementById('filtre-date-debut')?.value   || '';
  const fin    = document.getElementById('filtre-date-fin')?.value     || '';

  const filtrees = toutesFactures.filter(f => {
    if (fourn  && f.fournisseur !== fourn)   return false;
    if (statut && f.statut !== statut)       return false;
    if (debut  && f.dateRaw < debut)         return false;
    if (fin    && f.dateRaw > fin)           return false;
    return true;
  });
  afficherFactures(filtrees);
}

function reinitialiserFiltres() {
  ['filtre-fournisseur','filtre-statut','filtre-date-debut','filtre-date-fin'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
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

  if (!tbody) return;
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
      <td class="td-numero">${f.numero_facture || f.ach_id}</td>
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

// ─── DÉTAIL FACTURE ───

async function voirDetailFacture(ach_id) {
  // S'assurer que fullData est chargé
  if (!listesDropdown.fullData || !listesDropdown.fullData.length) {
    const resInci = await appelAPI('getIngredientsInci');
    if (resInci && resInci.success) listesDropdown.fullData = resInci.items || [];
  }

  const facture = toutesFactures.find(f => f.ach_id === ach_id);
  const modal   = document.getElementById('modal-facture');
  if (!modal) return;
  modal.classList.add('ouvert');

  document.getElementById('modal-facture-titre').textContent = 'Facture ' + (facture?.numero_facture || ach_id);
  document.getElementById('modal-facture-info').textContent  = facture
    ? facture.dateAff + ' — ' + facture.fournisseur
    : '';
  document.getElementById('contenu-detail-facture').innerHTML = '';
  document.getElementById('loading-detail-facture').classList.remove('cache');

  const res = await appelAPI('getAchatsLignes', { ach_id });
  document.getElementById('loading-detail-facture').classList.add('cache');

  if (!res || !res.success || !res.items.length) {
    document.getElementById('contenu-detail-facture').innerHTML =
      '<div class="vide"><div class="vide-titre">Aucun item</div></div>';
    return;
  }

  let html = `
    <div class="tableau-wrap">
      <table class="tableau-admin">
        <thead>
          <tr>
            <th>Ingrédient</th>
            <th>Format</th>
            <th>Qté</th>
            <th>Prix unit.</th>
            <th>$/g réel</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>`;

  res.items.forEach(l => {
    const ing       = (listesDropdown.fullData || []).find(d => d.ing_id === l.ing_id);
    const nomUC     = ing?.nom_UC || l.ing_id || '—';
    const prixGAff  = l.format_unite === 'unité'
      ? formaterPrix(l.prix_unitaire) + '/u'
      : (l.prix_par_g_reel > 0 ? l.prix_par_g_reel.toFixed(4) + ' $/g' : '—');
    html += `
      <tr>
        <td style="font-weight:500">${nomUC}</td>
        <td style="color:var(--gris);font-size:0.85rem">${l.format_qte} ${l.format_unite}</td>
        <td>${l.quantite}</td>
        <td>${formaterPrix(l.prix_unitaire)}</td>
        <td style="font-size:0.82rem;color:var(--gris)">${prixGAff}</td>
        <td style="color:var(--primary);font-weight:500">${formaterPrix(l.prix_total)}</td>
      </tr>`;
  });

  html += `</tbody></table></div>`;

  const sousTotal = res.items.reduce((s, l) => s + (parseFloat(l.prix_total) || 0), 0);
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
      <button class="bouton bouton-rouge" onclick="fermerModalFacture(); supprimerFacture('${ach_id}')">
        Supprimer cette facture
      </button>
    </div>`;

  document.getElementById('contenu-detail-facture').innerHTML = html;
}

function fermerModalFacture() {
  document.getElementById('modal-facture')?.classList.remove('ouvert');
}

function supprimerFacture(ach_id) {
  confirmerAction('Supprimer cette facture et tous ses items ?', async () => {
    const res = await appelAPIPost('deleteAchat', { ach_id });
    if (res && res.success) {
      afficherMsg('factures', 'Facture supprimée.');
      chargerFactures();
    } else {
      afficherMsg('factures', res?.message || 'Erreur lors de la suppression.', 'erreur');
    }
  });
}

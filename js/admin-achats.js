/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-achats.js
   Réécrit selon LOGIQUE-ACHATS.md — v3
   ═══════════════════════════════════════ */

// ─── ÉTAT ───
var ef = {
  factureActive:    null,
  factureEnAttente: null,
  lignes:           [],
  fournisseurs:     [],
  catsFourn:        [],
  prodsFourn:       [],
  formats:          [],
  mapping:          [],
  editIdx:          null,
  initEnCours:      false,
  saisieEnCours:    { qte: '', prix: '', formatVal: '', formatText: '' }
};

var EF_SCRAPING_CODES = ['PA', 'MH', 'Arbressence', 'DE'];
var EF_CATS_SANS_INCI = ['CAT-014', 'CAT-015', 'CAT-016', 'CAT-017'];

// ─── HELPERS ───
function efParseFlt(val) {
  if (val === null || val === undefined || val === '') return 0;
  return parseFloat(String(val).replace(/\s/g, '').replace(',', '.')) || 0;
}

function efAScraping(four_code) {
  return EF_SCRAPING_CODES.indexOf(four_code) >= 0;
}

function efGrammesDuFormat(qte, unite, cat_id) {
  var q = efParseFlt(qte);
  var cfg = (listesDropdown.config && listesDropdown.config[cat_id]) || {};
  var d = cfg.densite || 1;
  if (unite === 'g')     return q;
  if (unite === 'kg')    return q * 1000;
  if (unite === 'lbs')   return q * 453.592;
  if (unite === 'ml')    return q * d;
  if (unite === 'L')     return q * 1000 * d;
  if (unite === 'l')     return q * 1000 * d;
  if (unite === 'unité') return q;
  return q;
}

function efSauvegarderSaisie() {
  var elQte   = document.getElementById('ef-qte');
  var elPrix  = document.getElementById('ef-prix');
  var selFmt  = document.getElementById('ef-format');
  ef.saisieEnCours.qte  = elQte  ? elQte.value  : '';
  ef.saisieEnCours.prix = elPrix ? elPrix.value : '';
  if (selFmt && selFmt.value && selFmt.value !== '__nouveau__') {
    ef.saisieEnCours.formatVal  = selFmt.value;
    ef.saisieEnCours.formatText = selFmt.options[selFmt.selectedIndex].textContent;
  } else {
    ef.saisieEnCours.formatVal  = '';
    ef.saisieEnCours.formatText = '';
  }
}

function efRestaurerSaisie() {
  var elQte  = document.getElementById('ef-qte');
  var elPrix = document.getElementById('ef-prix');
  if (elQte  && ef.saisieEnCours.qte)  elQte.value  = ef.saisieEnCours.qte;
  if (elPrix && ef.saisieEnCours.prix) elPrix.value = ef.saisieEnCours.prix;
  if (ef.saisieEnCours.formatVal) {
    var selFmt = document.getElementById('ef-format');
    if (selFmt) {
      var existe = Array.from(selFmt.options).find(function(o) { return o.value === ef.saisieEnCours.formatVal; });
      if (!existe) {
        var opt = document.createElement('option');
        opt.value = ef.saisieEnCours.formatVal;
        opt.textContent = ef.saisieEnCours.formatText;
        var optNew = Array.from(selFmt.options).find(function(o) { return o.value === '__nouveau__'; });
        if (optNew) selFmt.insertBefore(opt, optNew);
        else selFmt.appendChild(opt);
      }
      selFmt.value = ef.saisieEnCours.formatVal;
    }
  }
  efMajLigneTotal();
}

function efResetSaisie() {
  ef.saisieEnCours = { qte: '', prix: '', formatVal: '', formatText: '' };
}

// Activer/désactiver la ligne de saisie (pendant les sauvegardes)
function efBloquerLigneSaisie(bloquer) {
  var ligne = document.getElementById('ef-ligne-saisie');
  if (!ligne) return;
  var champs = ligne.querySelectorAll('select, input, button');
  champs.forEach(function(el) {
    el.disabled = bloquer;
  });
  if (bloquer) ligne.classList.add('ligne-bloquee');
  else ligne.classList.remove('ligne-bloquee');
}

// ─── INITIALISATION ───
async function efInit() {
  if (ef.initEnCours) return;
  ef.initEnCours = true;

  // Afficher le spinner et tout cacher avant la vérification
  document.getElementById('ef-panel-entete')?.classList.add('cache');
  document.getElementById('ef-zone-items')?.classList.add('cache');
  document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
  afficherChargement();

  try {
    var res = await Promise.all([
      appelAPI('getFournisseurs'),
      appelAPI('getIngredientsInci'),
      appelAPI('getCategoriesUC'),
      appelAPI('getCategoriesFournisseurs'),
      appelAPI('getProduitsFournisseurs'),
      appelAPI('getFormatsIngredients'),
      appelAPI('getMappingFournisseurs'),
      appelAPI('getConfig')
    ]);

    if (res[0] && res[0].success) ef.fournisseurs = res[0].items || [];
    if (res[1] && res[1].success) listesDropdown.fullData = res[1].items || [];
    if (res[2] && res[2].success) {
      listesDropdown.categoriesMap = {};
      (res[2].items || []).forEach(function(c) {
        listesDropdown.categoriesMap[c.cat_id] = c.nom;
      });
    }
    if (res[3] && res[3].success) ef.catsFourn  = res[3].items || [];
    if (res[4] && res[4].success) ef.prodsFourn = res[4].items || [];
    if (res[5] && res[5].success) ef.formats    = res[5].items || [];
    if (res[6] && res[6].success) ef.mapping    = res[6].items || [];
    if (res[7] && res[7].success) {
      listesDropdown.config = {};
      (res[7].items || []).forEach(function(c) {
        listesDropdown.config[c.cat_id] = {
          densite:       parseFloat(c.densite) || 1,
          unite:         c.unite || 'g',
          margePertePct: parseFloat(c.marge_perte_pct) || 0
        };
      });
    }

    efPopulerFournisseurs();
    efInitDate();
    await efVerifierFactureEnCours();
    cacherChargement();
    efAfficherEtatInitial();
  } catch(e) {
    cacherChargement();
    afficherMsg('ef', 'Erreur de chargement.', 'erreur');
  } finally {
    ef.initEnCours = false;
  }
}

function efAfficherEtatInitial() {
  if (ef.factureActive) {
    document.getElementById('ef-panel-entete')?.classList.add('cache');
    document.getElementById('ef-zone-items')?.classList.remove('cache');
    document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
    efRendreLignesSauvegardees();
    efRendreLigneSaisie();
    efMajBanniere();
  } else if (ef.factureEnAttente) {
    document.getElementById('ef-panel-entete')?.classList.add('cache');
    document.getElementById('ef-zone-items')?.classList.add('cache');
    document.getElementById('ef-bandeau-reprise')?.classList.remove('cache');
  } else {
    document.getElementById('ef-panel-entete')?.classList.remove('cache');
    document.getElementById('ef-zone-items')?.classList.add('cache');
  }
}

// ─── DATE ───
function efInitDate() {
  var selJour = document.getElementById('ef-date-jour');
  var selAnnee = document.getElementById('ef-date-annee');
  if (!selJour || !selAnnee) return;

  selJour.innerHTML = '<option value="">—</option>' + Array.from({length: 31}, function(_, i) {
    var j = String(i + 1).padStart(2, '0');
    return '<option value="' + j + '">' + j + '</option>';
  }).join('');

  var anneeAct = new Date().getFullYear();
  selAnnee.innerHTML = '<option value="">—</option>' +
    [anneeAct - 1, anneeAct, anneeAct + 1].map(function(a) {
      return '<option value="' + a + '">' + a + '</option>';
    }).join('');

  var selMois = document.getElementById('ef-date-mois');
  if (selMois) selMois.value = '';
  document.getElementById('ef-date').value = '';
}

function efSyncDate() {
  var j = document.getElementById('ef-date-jour')?.value;
  var m = document.getElementById('ef-date-mois')?.value;
  var a = document.getElementById('ef-date-annee')?.value;
  if (j && m && a) document.getElementById('ef-date').value = a + '-' + m + '-' + j;
}

// ─── FOURNISSEURS ───
function efPopulerFournisseurs() {
  var sel = document.getElementById('ef-fournisseur');
  if (!sel) return;
  var actuel = sel.value;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  ef.fournisseurs
    .slice()
    .sort(function(a, b) { return (a.nom || '').localeCompare(b.nom || '', 'fr'); })
    .forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f.four_id;
      opt.dataset.nom  = f.nom;
      opt.dataset.code = f.code || '';
      opt.textContent  = f.nom;
      sel.appendChild(opt);
    });
  var optNew = document.createElement('option');
  optNew.value = '__nouveau__';
  optNew.textContent = '+ Nouveau fournisseur…';
  sel.appendChild(optNew);
  if (actuel) sel.value = actuel;
}

function efOnChangeFournisseur() {
  var sel = document.getElementById('ef-fournisseur');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    if (typeof ouvrirModalNouveauFournisseur === 'function') {
      ouvrirModalNouveauFournisseur();
    }
  }
}

// ─── REPRENDRE / ANNULER FACTURE EN COURS ───
async function efVerifierFactureEnCours() {
  if (ef.factureActive) return;
  var resAch = await appelAPI('getAchatsEntete');
  if (!resAch || !resAch.success) return;
  var enCours = (resAch.items || []).find(function(a) { return a.statut === 'En cours'; });
  if (!enCours) return;

  var four = ef.fournisseurs.find(function(f) { return f.four_id === enCours.four_id; });
  var fourNom  = four ? four.nom  : enCours.four_id;
  var fourCode = four ? four.code : '';

  var bandeau = document.getElementById('ef-bandeau-reprise');
  var texte   = document.getElementById('ef-bandeau-reprise-texte');
  if (bandeau && texte) {
    texte.textContent = 'Facture ' + (enCours.numero_facture || enCours.ach_id) +
                       ' — ' + fourNom + ' — ' + (enCours.date || '');
  }

  ef.factureEnAttente = {
    ach_id:      enCours.ach_id,
    numero:      enCours.numero_facture || enCours.ach_id,
    date:        enCours.date || '',
    fournisseur: fourNom,
    four_id:     enCours.four_id,
    four_code:   fourCode,
    a_scraping:  efAScraping(fourCode)
  };
}

async function efReprendreFacture() {
  if (!ef.factureEnAttente) return;
  ef.factureActive = ef.factureEnAttente;
  ef.factureEnAttente = null;

  var resLignes = await appelAPI('getAchatsLignes', { ach_id: ef.factureActive.ach_id });
  ef.lignes = [];
  if (resLignes && resLignes.success) {
    (resLignes.items || []).forEach(function(l) {
      ef.lignes.push(efConstruireLigneDepuisAPI(l));
    });
  }

  document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
  document.getElementById('ef-panel-entete')?.classList.add('cache');
  document.getElementById('ef-zone-items')?.classList.remove('cache');
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
  efMajBanniere();
}

async function efAnnulerFactureEnCours() {
  if (!ef.factureEnAttente) return;
  var ach_id = ef.factureEnAttente.ach_id;
  var res = await appelAPIPost('deleteAchat', { ach_id: ach_id });
  if (res && res.success) {
    ef.factureEnAttente = null;
    document.getElementById('ef-bandeau-reprise')?.classList.add('cache');
    document.getElementById('ef-panel-entete')?.classList.remove('cache');
    afficherMsg('ef', '✅ Facture annulée.');
  } else {
    afficherMsg('ef', (res && res.message) || 'Erreur.', 'erreur');
  }
}

function efConstruireLigneDepuisAPI(l) {
  var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === l.ing_id; });
  var nomUC  = ing ? ing.nom_UC  : '';
  var cat_id = ing ? ing.cat_id  : '';
  var catUC  = (listesDropdown.categoriesMap || {})[cat_id] || '';

  var mappingEntry = ef.mapping.find(function(m) {
    return m.ing_id === l.ing_id && m.four_id === ef.factureActive.four_id;
  });
  var cat_fourn_id  = mappingEntry ? mappingEntry.cat_fourn_id  : '';
  var prod_fourn_id = mappingEntry ? mappingEntry.prod_fourn_id : '';
  var catFournNom = '';
  var prodFournNom = '';
  if (cat_fourn_id) {
    var cf = ef.catsFourn.find(function(c) { return c.cat_fourn_id === cat_fourn_id; });
    catFournNom = cf ? cf.nom : '';
  }
  if (prod_fourn_id) {
    var pf = ef.prodsFourn.find(function(p) { return p.prod_fourn_id === prod_fourn_id; });
    prodFournNom = pf ? pf.nom : '';
  }

  return {
    rowIndex:      l.rowIndex,
    ing_id:        l.ing_id,
    nomUC:         nomUC,
    cat_id:        cat_id,
    catUC:         catUC,
    cat_fourn_id:  cat_fourn_id,
    prod_fourn_id: prod_fourn_id,
    catFournNom:   catFournNom,
    prodFournNom:  prodFournNom,
    formatQte:     l.format_qte,
    formatUnite:   l.format_unite,
    quantite:      l.quantite,
    prixUnitaire:  l.prix_unitaire,
    prixTotal:     l.prix_total
  };
}

// ─── CRÉER LA FACTURE ───
async function efCreerFacture() {
  if (ef.factureActive) {
    document.getElementById('ef-zone-items')?.classList.remove('cache');
    return;
  }

  var selFour = document.getElementById('ef-fournisseur');
  var numero  = document.getElementById('ef-numero')?.value?.trim();
  var date    = document.getElementById('ef-date')?.value;

  if (!selFour || !selFour.value || selFour.value === '__nouveau__') {
    afficherMsg('ef', 'Choisir un fournisseur.', 'erreur');
    return;
  }
  if (!numero) { afficherMsg('ef', 'Entrer le numéro de facture.', 'erreur'); return; }
  if (!date)   { afficherMsg('ef', 'Entrer la date complète.', 'erreur'); return; }

  var four_id  = selFour.value;
  var fourNom  = selFour.options[selFour.selectedIndex].dataset.nom  || '';
  var fourCode = selFour.options[selFour.selectedIndex].dataset.code || '';

  var resAch = await appelAPI('getAchatsEntete');
  if (resAch && resAch.success) {
    var doublon = (resAch.items || []).find(function(a) {
      return String(a.numero_facture) === String(numero) && String(a.four_id) === String(four_id);
    });
    if (doublon) {
      afficherMsg('ef', '⚠️ Facture déjà entrée chez ce fournisseur.', 'erreur');
      return;
    }
  }

  var btn = document.getElementById('ef-btn-creer');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  var dernierNum = (resAch?.items || []).reduce(function(max, a) {
    var n = parseInt((a.ach_id || '').replace('ACH-', '')) || 0;
    return n > max ? n : max;
  }, 0);
  var ach_id = 'ACH-' + String(dernierNum + 1).padStart(4, '0');

  var res = await appelAPIPost('createAchatEntete', {
    ach_id: ach_id, date: date, four_id: four_id, numero_facture: numero
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Créer'; }

  if (!res || !res.success) {
    afficherMsg('ef', (res && res.message) || 'Erreur création facture.', 'erreur');
    return;
  }

  ef.factureActive = {
    ach_id: ach_id, numero: numero, date: date,
    fournisseur: fourNom, four_id: four_id, four_code: fourCode,
    a_scraping: efAScraping(fourCode)
  };
  ef.lignes = [];
  ef.editIdx = null;
  efResetSaisie();

  // Recharger le mapping depuis le serveur (pour avoir tous les mappings de ce fournisseur)
  var resMap = await appelAPI('getMappingFournisseurs');
  if (resMap && resMap.success) ef.mapping = resMap.items || [];

  document.getElementById('ef-panel-entete')?.classList.add('cache');
  document.getElementById('ef-zone-items')?.classList.remove('cache');
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
  efMajBanniere();
  afficherMsg('ef', '');
}

// ─── BANNIÈRE ET TOTAUX ───
function efMajBanniere() {
  if (!ef.factureActive) return;
  var sousTotal = ef.lignes.reduce(function(s, l) { return s + (l.prixTotal || 0); }, 0);
  var elNum = document.getElementById('ef-banniere-numero');
  var elFour = document.getElementById('ef-banniere-fournisseur');
  var elSous = document.getElementById('ef-banniere-soustotal');
  if (elNum)  elNum.textContent  = ef.factureActive.numero;
  if (elFour) elFour.textContent = ef.factureActive.fournisseur;
  if (elSous) elSous.textContent = formaterPrix(sousTotal);
  efMajSousTotal();
}

function efMajSousTotal() {
  var sousTotal = ef.lignes.reduce(function(s, l) { return s + (l.prixTotal || 0); }, 0);
  var el = document.getElementById('ef-soustotal');
  if (el) el.value = formaterPrix(sousTotal);
  efCalculerTotal();
}

function efCalculerTotal() {
  var sousTotal = ef.lignes.reduce(function(s, l) { return s + (l.prixTotal || 0); }, 0);
  var tps = efParseFlt(document.getElementById('ef-tps')?.value);
  var tvq = efParseFlt(document.getElementById('ef-tvq')?.value);
  var liv = efParseFlt(document.getElementById('ef-livraison')?.value);
  var el = document.getElementById('ef-total');
  if (el) el.value = formaterPrix(sousTotal + tps + tvq + liv);
}

// ─── LIGNE DE SAISIE ───
// Ordre des colonnes : fourn → UC → format → qté → prix → total → bouton
function efRendreLigneSaisie() {
  var tbody = document.getElementById('ef-tbody');
  if (!tbody) return;
  var ancienne = document.getElementById('ef-ligne-saisie');
  if (ancienne) ancienne.remove();

  var aScraping = ef.factureActive && ef.factureActive.a_scraping;

  var optsCatUC = Object.keys(listesDropdown.categoriesMap || {})
    .sort(function(a, b) {
      return (listesDropdown.categoriesMap[a] || '').localeCompare(listesDropdown.categoriesMap[b] || '', 'fr');
    })
    .map(function(k) { return '<option value="' + k + '">' + listesDropdown.categoriesMap[k] + '</option>'; })
    .join('') + '<option value="__nouveau__">+ Nouvelle catégorie UC…</option>';

  var colFournHtml = '';
  if (aScraping) {
    var optsCatFourn = ef.catsFourn
      .filter(function(c) {
        return ef.prodsFourn.some(function(p) {
          return p.cat_fourn_id === c.cat_fourn_id && p.four_id === ef.factureActive.four_id;
        });
      })
      .slice()
      .sort(function(a, b) { return a.nom.localeCompare(b.nom, 'fr'); })
      .map(function(c) { return '<option value="' + c.cat_fourn_id + '">' + c.nom + '</option>'; })
      .join('');

    colFournHtml =
      '<select class="form-ctrl" id="ef-cat-fourn" onchange="efOnChangeCatFourn()">' +
        '<option value="">— Catégorie fourn. —</option>' + optsCatFourn +
        '<option value="__nouveau__">+ Nouvelle catégorie…</option>' +
      '</select>' +
      '<select class="form-ctrl" id="ef-nom-fourn" onchange="efOnChangeNomFourn()" style="margin-top:4px">' +
        '<option value="">— Nom fourn. —</option>' +
      '</select>';
  } else {
    colFournHtml = '<span class="texte-secondaire" style="font-size:0.8rem;color:#999;display:block;text-align:center">—</span>';
  }

  var colUCHtml =
    '<select class="form-ctrl" id="ef-cat-uc" onchange="efOnChangeCatUC()">' +
      '<option value="">— Cat. UC —</option>' + optsCatUC +
    '</select>' +
    '<select class="form-ctrl" id="ef-nom-uc" onchange="efOnChangeNomUC()" style="margin-top:4px">' +
      '<option value="">— Nom UC —</option>' +
    '</select>';

  var tr = document.createElement('tr');
  tr.id = 'ef-ligne-saisie';
  tr.innerHTML =
    '<td>' + colFournHtml + '</td>' +
    '<td>' + colUCHtml + '</td>' +
    '<td>' +
      '<select class="form-ctrl" id="ef-format" onchange="efOnChangeFormat()">' +
        '<option value="">— Format —</option>' +
        '<option value="__nouveau__">+ Nouveau format…</option>' +
      '</select>' +
    '</td>' +
    '<td><input type="text" inputmode="decimal" class="form-ctrl" id="ef-qte" placeholder="Qté" oninput="efMajLigneTotal()"></td>' +
    '<td><input type="text" inputmode="decimal" class="form-ctrl" id="ef-prix" placeholder="Prix $" oninput="efMajLigneTotal()"></td>' +
    '<td id="ef-total-ligne">—</td>' +
    '<td>' +
      '<button class="bouton bouton-petit" id="ef-btn-ajouter" onclick="efAjouterLigne()" title="Ajouter">+</button>' +
      '<button class="bouton bouton-petit bouton-secondaire cache" id="ef-btn-annuler-edit" onclick="efAnnulerEdit()" title="Annuler">✕</button>' +
    '</td>';
  tbody.appendChild(tr);
}

// ─── CASCADES (avec scraping) ───
function efOnChangeCatFourn() {
  var sel = document.getElementById('ef-cat-fourn');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    efSauvegarderSaisie();
    efOuvrirModalCatFourn();
    return;
  }
  efRemplirNomsFourn(sel.value);
  // Vider les champs UC qui pourraient être pré-remplis d'une autre ligne
  efViderChampsUC();
}

function efRemplirNomsFourn(cat_fourn_id) {
  var sel = document.getElementById('ef-nom-fourn');
  if (!sel) return;
  var prods = ef.prodsFourn
    .filter(function(p) {
      return p.four_id === ef.factureActive.four_id &&
             (!cat_fourn_id || p.cat_fourn_id === cat_fourn_id);
    })
    .sort(function(a, b) { return a.nom.localeCompare(b.nom, 'fr'); });

  sel.innerHTML = '<option value="">— Nom fourn. —</option>' +
    prods.map(function(p) { return '<option value="' + p.prod_fourn_id + '">' + p.nom + '</option>'; }).join('') +
    '<option value="__nouveau__">+ Nouveau nom…</option>';
}

function efViderChampsUC() {
  var selCatUC = document.getElementById('ef-cat-uc');
  var selNomUC = document.getElementById('ef-nom-uc');
  var selFmt   = document.getElementById('ef-format');
  if (selCatUC) selCatUC.value = '';
  if (selNomUC) selNomUC.innerHTML = '<option value="">— Nom UC —</option><option value="__nouveau__">+ Nouvel ingrédient…</option>';
  if (selFmt) {
    selFmt.innerHTML = '<option value="">— Format —</option><option value="__nouveau__">+ Nouveau format…</option>';
  }
}

async function efOnChangeNomFourn() {
  var sel = document.getElementById('ef-nom-fourn');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    efSauvegarderSaisie();
    efOuvrirModalNomFourn();
    return;
  }

  // Toujours vider les champs UC d'abord (pas de pré-remplissage erroné)
  efViderChampsUC();

  if (!sel.value) return;

  // Recharger le mapping depuis le serveur pour être sûr d'avoir les derniers
  var resMap = await appelAPI('getMappingFournisseurs');
  if (resMap && resMap.success) ef.mapping = resMap.items || [];

  var mapping = ef.mapping.find(function(m) {
    return String(m.four_id) === String(ef.factureActive.four_id) &&
           String(m.prod_fourn_id) === String(sel.value);
  });
  if (mapping && mapping.ing_id) {
    var ing = (listesDropdown.fullData || []).find(function(d) {
      return String(d.ing_id) === String(mapping.ing_id);
    });
    if (ing) {
      var selCatUC = document.getElementById('ef-cat-uc');
      if (selCatUC) selCatUC.value = ing.cat_id;
      efRemplirNomsUC(ing.cat_id);
      var selNomUC = document.getElementById('ef-nom-uc');
      if (selNomUC) selNomUC.value = ing.ing_id;
      efRemplirFormats(ing.ing_id);
    }
  }
}

// ─── CASCADES (cat UC / nom UC) ───
function efOnChangeCatUC() {
  var sel = document.getElementById('ef-cat-uc');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    efSauvegarderSaisie();
    efOuvrirModalNouvelleCatUC();
    return;
  }
  efRemplirNomsUC(sel.value);
}

function efRemplirNomsUC(cat_id) {
  var sel = document.getElementById('ef-nom-uc');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Nom UC —</option>';
  if (cat_id) {
    (listesDropdown.fullData || [])
      .filter(function(d) { return d.cat_id === cat_id; })
      .sort(function(a, b) { return (a.nom_UC || '').localeCompare(b.nom_UC || '', 'fr'); })
      .forEach(function(d) {
        var opt = document.createElement('option');
        opt.value = d.ing_id;
        opt.textContent = d.nom_UC;
        sel.appendChild(opt);
      });
  }
  var optNew = document.createElement('option');
  optNew.value = '__nouveau__';
  optNew.textContent = '+ Nouvel ingrédient…';
  sel.appendChild(optNew);
}

function efOnChangeNomUC() {
  var sel = document.getElementById('ef-nom-uc');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    efSauvegarderSaisie();
    efOuvrirModalIngredient();
    return;
  }
  if (sel.value) efRemplirFormats(sel.value);
}

// ─── FORMATS ───
function efRemplirFormats(ing_id) {
  var sel = document.getElementById('ef-format');
  if (!sel) return;
  var ancienVal = sel.value;
  var ancienText = (sel.selectedIndex >= 0) ? sel.options[sel.selectedIndex].textContent : '';

  sel.innerHTML = '<option value="">— Format —</option>';
  var formatsConnus = ef.formats.filter(function(f) {
    return f.ing_id === ing_id && (!f.four_id || f.four_id === ef.factureActive.four_id);
  });
  formatsConnus.forEach(function(f) {
    var opt = document.createElement('option');
    opt.value = JSON.stringify({ quantite: f.quantite, unite: f.unite });
    opt.textContent = f.quantite + ' ' + f.unite;
    sel.appendChild(opt);
  });
  var optNew = document.createElement('option');
  optNew.value = '__nouveau__';
  optNew.textContent = '+ Nouveau format…';
  sel.appendChild(optNew);

  if (ancienVal && ancienVal !== '__nouveau__' && ancienVal !== '') {
    var existe = Array.from(sel.options).find(function(o) { return o.value === ancienVal; });
    if (existe) {
      sel.value = ancienVal;
    } else {
      var opt = document.createElement('option');
      opt.value = ancienVal;
      opt.textContent = ancienText;
      sel.insertBefore(opt, optNew);
      sel.value = ancienVal;
    }
  }
}

function efOnChangeFormat() {
  var sel = document.getElementById('ef-format');
  if (!sel) return;
  if (sel.value === '__nouveau__') {
    sel.value = '';
    efSauvegarderSaisie();
    efOuvrirModalFormat();
  }
}

function efMajLigneTotal() {
  var prix = efParseFlt(document.getElementById('ef-prix')?.value);
  var qte  = efParseFlt(document.getElementById('ef-qte')?.value);
  var el   = document.getElementById('ef-total-ligne');
  if (el) el.textContent = (prix && qte) ? formaterPrix(prix * qte) : '—';
}

// ─── AJOUTER UNE LIGNE ───
async function efAjouterLigne() {
  if (!ef.factureActive) {
    afficherMsg('ef-items', 'Aucune facture active.', 'erreur');
    return;
  }

  var aScraping = ef.factureActive.a_scraping;

  var cat_id        = document.getElementById('ef-cat-uc')?.value || '';
  var ing_id        = document.getElementById('ef-nom-uc')?.value || '';
  var cat_fourn_id  = aScraping ? (document.getElementById('ef-cat-fourn')?.value || '') : '';
  var prod_fourn_id = aScraping ? (document.getElementById('ef-nom-fourn')?.value || '') : '';

  var selFmt = document.getElementById('ef-format');
  var formatQte = '', formatUnite = 'g';
  if (selFmt && selFmt.value && selFmt.value !== '__nouveau__') {
    var fObj = JSON.parse(selFmt.value);
    formatQte = String(fObj.quantite);
    formatUnite = fObj.unite;
  }

  var prixUnit = document.getElementById('ef-prix')?.value?.trim();
  var quantite = document.getElementById('ef-qte')?.value?.trim();

  function erreur(msg) {
    afficherMsg('ef-items', msg, 'erreur');
  }
  if (aScraping && !cat_fourn_id)  return erreur('Catégorie fournisseur requise.');
  if (aScraping && !prod_fourn_id) return erreur('Nom fournisseur requis.');
  if (!cat_id)    return erreur('Catégorie UC requise.');
  if (!ing_id)    return erreur('Nom UC requis.');
  if (!formatQte) return erreur('Format requis.');
  if (!prixUnit)  return erreur('Prix unitaire requis.');
  if (!quantite)  return erreur('Quantité requise.');

  // Bloquer la ligne pendant la sauvegarde
  efBloquerLigneSaisie(true);
  var btn = document.getElementById('ef-btn-ajouter');
  if (btn) btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>';

  var prixUnitNum = efParseFlt(prixUnit);
  var quantiteNum = efParseFlt(quantite);
  var prixTotal   = quantiteNum * prixUnitNum;
  var four_id     = ef.factureActive.four_id;

  var prixParG = 0;
  if (formatUnite === 'unité') {
    prixParG = efParseFlt(formatQte) > 0 ? prixUnitNum / efParseFlt(formatQte) : 0;
  } else {
    var grammes = efGrammesDuFormat(formatQte, formatUnite, cat_id);
    prixParG = grammes > 0 ? prixUnitNum / grammes : 0;
  }

  var res = await appelAPIPost('addAchatLigne', {
    ach_id:        ef.factureActive.ach_id,
    ing_id:        ing_id,
    format_qte:    efParseFlt(formatQte),
    format_unite:  formatUnite,
    prix_unitaire: prixUnitNum,
    prix_par_g:    prixParG,
    quantite:      quantiteNum,
    four_id:       four_id
  });

  if (!res || !res.success) {
    efBloquerLigneSaisie(false);
    if (btn) btn.innerHTML = '+';
    afficherMsg('ef-items', (res && res.message) || 'Erreur ajout ligne.', 'erreur');
    return;
  }

  await efAssurerMapping(four_id, cat_fourn_id, prod_fourn_id, ing_id);
  efAssurerFormatLocal(ing_id, four_id, formatQte, formatUnite);

  var nomUC = (listesDropdown.fullData.find(function(d) { return d.ing_id === ing_id; }) || {}).nom_UC || '';
  var catUC = (listesDropdown.categoriesMap || {})[cat_id] || '';
  var catFournNom = '', prodFournNom = '';
  if (cat_fourn_id) {
    var cf = ef.catsFourn.find(function(c) { return c.cat_fourn_id === cat_fourn_id; });
    catFournNom = cf ? cf.nom : '';
  }
  if (prod_fourn_id) {
    var pf = ef.prodsFourn.find(function(p) { return p.prod_fourn_id === prod_fourn_id; });
    prodFournNom = pf ? pf.nom : '';
  }

  var ligne = {
    rowIndex: res.rowIndex || 0,
    ing_id: ing_id, nomUC: nomUC, cat_id: cat_id, catUC: catUC,
    cat_fourn_id: cat_fourn_id, prod_fourn_id: prod_fourn_id,
    catFournNom: catFournNom, prodFournNom: prodFournNom,
    formatQte: efParseFlt(formatQte), formatUnite: formatUnite,
    quantite: quantiteNum, prixUnitaire: prixUnitNum, prixTotal: prixTotal
  };

  if (ef.editIdx !== null) {
    ef.lignes[ef.editIdx] = ligne;
    ef.editIdx = null;
  } else {
    ef.lignes.push(ligne);
  }

  efResetSaisie();
  afficherMsg('ef-items', '');
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
  efMajBanniere();
}

async function efAssurerMapping(four_id, cat_fourn_id, prod_fourn_id, ing_id) {
  var existe = ef.mapping.find(function(m) {
    return String(m.four_id) === String(four_id) &&
           String(m.prod_fourn_id || '') === String(prod_fourn_id || '') &&
           String(m.ing_id) === String(ing_id);
  });
  if (existe) return;

  await appelAPIPost('saveMappingFournisseur', {
    four_id: four_id,
    cat_fourn_id: cat_fourn_id || '',
    prod_fourn_id: prod_fourn_id || '',
    ing_id: ing_id
  });
  ef.mapping.push({
    four_id: four_id,
    cat_fourn_id: cat_fourn_id || '',
    prod_fourn_id: prod_fourn_id || '',
    ing_id: ing_id
  });
}

function efAssurerFormatLocal(ing_id, four_id, formatQte, formatUnite) {
  var existe = ef.formats.find(function(f) {
    return f.ing_id === ing_id &&
           f.four_id === four_id &&
           efParseFlt(f.quantite) === efParseFlt(formatQte) &&
           f.unite === formatUnite;
  });
  if (!existe) {
    ef.formats.push({
      ing_id: ing_id, four_id: four_id,
      quantite: efParseFlt(formatQte), unite: formatUnite
    });
  }
}

// ─── AFFICHAGE LIGNES SAUVEGARDÉES ───
// Ordre : fourn → UC → format → qté → prix → total → actions
function efRendreLignesSauvegardees() {
  var tbody = document.getElementById('ef-tbody');
  if (!tbody) return;
  Array.from(tbody.querySelectorAll('tr:not(#ef-ligne-saisie)')).forEach(function(tr) { tr.remove(); });
  var ligneSaisie = document.getElementById('ef-ligne-saisie');

  ef.lignes.forEach(function(l, idx) {
    var fmt = l.formatQte + ' ' + l.formatUnite;
    var colFourn = ef.factureActive.a_scraping
      ? l.catFournNom + '<br><small>' + l.prodFournNom + '</small>'
      : '—';
    var colUC = l.catUC + '<br><small>' + l.nomUC + '</small>';

    var tr = document.createElement('tr');
    if (idx === ef.editIdx) tr.classList.add('cache');
    tr.innerHTML =
      '<td>' + colFourn + '</td>' +
      '<td>' + colUC + '</td>' +
      '<td>' + fmt + '</td>' +
      '<td>' + l.quantite + '</td>' +
      '<td>' + formaterPrix(l.prixUnitaire) + '</td>' +
      '<td>' + formaterPrix(l.prixTotal) + '</td>' +
      '<td>' +
        '<div style="display:flex;flex-direction:column;gap:4px;align-items:center">' +
          '<button class="bouton bouton-petit bouton-secondaire" onclick="efEditerLigne(' + idx + ')" style="width:100%">✏️</button>' +
          '<button class="bouton bouton-petit bouton-rouge" onclick="efSupprimerLigne(' + idx + ')" style="width:100%">✕</button>' +
        '</div>' +
      '</td>';
    if (ligneSaisie) tbody.insertBefore(tr, ligneSaisie);
    else tbody.appendChild(tr);
  });
}

// ─── ÉDITER UNE LIGNE ───
async function efEditerLigne(idx) {
  var l = ef.lignes[idx];
  if (!l) return;

  if (l.rowIndex) {
    await appelAPIPost('deleteAchatLigne', {
      ach_id: ef.factureActive.ach_id,
      ing_id: l.ing_id,
      format_qte: l.formatQte,
      format_unite: l.formatUnite
    });
  }

  ef.editIdx = idx;
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();

  if (ef.factureActive.a_scraping) {
    var selCatF = document.getElementById('ef-cat-fourn');
    if (selCatF) {
      selCatF.value = l.cat_fourn_id;
      efRemplirNomsFourn(l.cat_fourn_id);
      var selNomF = document.getElementById('ef-nom-fourn');
      if (selNomF) selNomF.value = l.prod_fourn_id;
    }
  }
  var selCatUC = document.getElementById('ef-cat-uc');
  if (selCatUC) {
    selCatUC.value = l.cat_id;
    efRemplirNomsUC(l.cat_id);
    var selNomUC = document.getElementById('ef-nom-uc');
    if (selNomUC) selNomUC.value = l.ing_id;
  }
  efRemplirFormats(l.ing_id);
  var selFmt = document.getElementById('ef-format');
  if (selFmt) {
    var val = JSON.stringify({ quantite: l.formatQte, unite: l.formatUnite });
    var optExiste = Array.from(selFmt.options).find(function(o) { return o.value === val; });
    if (!optExiste) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = l.formatQte + ' ' + l.formatUnite;
      var optNew = Array.from(selFmt.options).find(function(o) { return o.value === '__nouveau__'; });
      if (optNew) selFmt.insertBefore(opt, optNew);
      else selFmt.appendChild(opt);
    }
    selFmt.value = val;
  }
  var elPrix = document.getElementById('ef-prix');
  var elQte  = document.getElementById('ef-qte');
  if (elPrix) elPrix.value = l.prixUnitaire;
  if (elQte)  elQte.value  = l.quantite;
  efMajLigneTotal();
  var btnAjouter = document.getElementById('ef-btn-ajouter');
  var btnAnnuler = document.getElementById('ef-btn-annuler-edit');
  if (btnAjouter) btnAjouter.innerHTML = '✓';
  if (btnAnnuler) btnAnnuler.classList.remove('cache');
}

function efAnnulerEdit() {
  ef.editIdx = null;
  efRechargerLignes();
}

async function efRechargerLignes() {
  if (!ef.factureActive) return;
  var resLignes = await appelAPI('getAchatsLignes', { ach_id: ef.factureActive.ach_id });
  ef.lignes = [];
  if (resLignes && resLignes.success) {
    (resLignes.items || []).forEach(function(l) {
      ef.lignes.push(efConstruireLigneDepuisAPI(l));
    });
  }
  efRendreLignesSauvegardees();
  efRendreLigneSaisie();
  efMajBanniere();
}

// ─── SUPPRIMER UNE LIGNE ───
function efSupprimerLigne(idx) {
  var ligne = ef.lignes[idx];
  if (!ligne) return;
  confirmerAction('Supprimer cette ligne ?', async function() {
    var res = await appelAPIPost('deleteAchatLigne', {
      ach_id: ef.factureActive.ach_id,
      ing_id: ligne.ing_id,
      format_qte: ligne.formatQte,
      format_unite: ligne.formatUnite
    });
    if (!res || !res.success) {
      afficherMsg('ef-items', (res && res.message) || 'Erreur suppression.', 'erreur');
      return;
    }
    ef.lignes.splice(idx, 1);
    efRendreLignesSauvegardees();
    efMajBanniere();
  });
}

// ─── FINALISATION ───
async function efFinaliser() {
  if (!ef.factureActive) {
    afficherMsg('ef-final', 'Aucune facture active.', 'erreur');
    return;
  }
  if (!ef.lignes.length) {
    afficherMsg('ef-final', 'Aucune ligne à finaliser.', 'erreur');
    return;
  }

  var btn = document.getElementById('ef-btn-finaliser');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>'; }

  var sousTotal = ef.lignes.reduce(function(s, l) { return s + (l.prixTotal || 0); }, 0);
  var tps = efParseFlt(document.getElementById('ef-tps')?.value);
  var tvq = efParseFlt(document.getElementById('ef-tvq')?.value);
  var liv = efParseFlt(document.getElementById('ef-livraison')?.value);

  var res = await appelAPIPost('finaliserAchat', {
    ach_id: ef.factureActive.ach_id,
    sous_total: sousTotal, tps: tps, tvq: tvq, livraison: liv
  });

  if (!res || !res.success) {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }
    afficherMsg('ef-final', (res && res.message) || 'Erreur finalisation.', 'erreur');
    return;
  }

  afficherMsg('ef', '✅ Facture finalisée — Total : ' + formaterPrix(res.total));
  setTimeout(efReinitialiserApresFinalisation, 2000);
}

function efReinitialiserApresFinalisation() {
  ef.factureActive = null;
  ef.lignes = [];
  ef.editIdx = null;
  efResetSaisie();

  var champs = ['ef-fournisseur', 'ef-numero', 'ef-tps', 'ef-tvq', 'ef-livraison', 'ef-soustotal', 'ef-total'];
  champs.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('ef-panel-entete')?.classList.remove('cache');
  document.getElementById('ef-zone-items')?.classList.add('cache');
  var tbody = document.getElementById('ef-tbody');
  if (tbody) tbody.innerHTML = '';

  var btn = document.getElementById('ef-btn-finaliser');
  if (btn) { btn.disabled = false; btn.innerHTML = 'Finaliser'; }

  efInitDate();
  afficherMsg('ef-final', '');
}

// ─── ANNULER LA FACTURE ACTIVE ───
function efAnnulerFactureActive() {
  if (!ef.factureActive) return;
  confirmerAction('Annuler cette facture et supprimer toutes les lignes ?', async function() {
    afficherChargement();
    var res = await appelAPIPost('deleteAchat', { ach_id: ef.factureActive.ach_id });
    cacherChargement();
    if (res && res.success) {
      efReinitialiserApresFinalisation();
      afficherMsg('ef', '✅ Facture annulée.');
    } else {
      afficherMsg('ef', (res && res.message) || 'Erreur annulation.', 'erreur');
    }
  });
}

// ─── MODALES — NOUVEAU FORMAT ───
function efOuvrirModalFormat() {
  var modal = document.getElementById('modal-ef-format');
  if (!modal) return;
  document.getElementById('modal-ef-fmt-qte').value = '';
  document.getElementById('modal-ef-fmt-unite').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-ef-fmt-qte').focus(); }, 100);
}

function efFermerModalFormat() {
  document.getElementById('modal-ef-format')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

function efOnChangeModalFmtUnite() {
  var unite = document.getElementById('modal-ef-fmt-unite')?.value;
  var input = document.getElementById('modal-ef-fmt-qte');
  if (input) {
    input.placeholder = unite === 'unité' ? 'Nb d\'unités dans le contenant (ex: 25)' : 'Ex: 500';
  }
}

function efConfirmerModalFormat() {
  var unite = document.getElementById('modal-ef-fmt-unite')?.value;
  var qte   = document.getElementById('modal-ef-fmt-qte')?.value?.trim();
  if (!unite) return;
  if (!qte || efParseFlt(qte) <= 0) {
    document.getElementById('modal-ef-fmt-qte').focus();
    return;
  }
  var sel = document.getElementById('ef-format');
  if (sel) {
    var opt = document.createElement('option');
    opt.value = JSON.stringify({ quantite: efParseFlt(qte), unite: unite });
    opt.textContent = qte + ' ' + unite;
    var optNew = Array.from(sel.options).find(function(o) { return o.value === '__nouveau__'; });
    if (optNew) sel.insertBefore(opt, optNew);
    else sel.appendChild(opt);
    sel.value = opt.value;
    ef.saisieEnCours.formatVal = opt.value;
    ef.saisieEnCours.formatText = opt.textContent;
  }
  document.getElementById('modal-ef-format')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

// ─── MODALES — NOUVEL INGRÉDIENT UC ───
function efOuvrirModalIngredient() {
  var modal = document.getElementById('modal-ef-ingredient');
  if (!modal) return;
  document.getElementById('modal-ef-ing-nouveau-nom').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-ef-ing-nouveau-nom').focus(); }, 100);
}

function efFermerModalIngredient() {
  document.getElementById('modal-ef-ingredient')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

async function efConfirmerModalIngredient() {
  var nouveauNom = document.getElementById('modal-ef-ing-nouveau-nom')?.value?.trim();
  if (!nouveauNom) {
    document.getElementById('modal-ef-ing-nouveau-nom').focus();
    return;
  }
  var cat_id = document.getElementById('ef-cat-uc')?.value || '';
  if (!cat_id) {
    afficherMsg('ef', 'Choisir une catégorie UC d\'abord.', 'erreur');
    document.getElementById('modal-ef-ingredient')?.classList.remove('ouvert');
    efRestaurerSaisie();
    return;
  }

  var existant = (listesDropdown.fullData || []).find(function(d) {
    return d.nom_UC === nouveauNom && d.cat_id === cat_id;
  });

  var ing_id;
  if (existant) {
    ing_id = existant.ing_id;
  } else {
    var dernierNum = (listesDropdown.fullData || []).reduce(function(max, d) {
      var n = parseInt((d.ing_id || '').replace('ING-', '')) || 0;
      return n > max ? n : max;
    }, 0);
    ing_id = 'ING-' + String(dernierNum + 1).padStart(3, '0');

    var statut = EF_CATS_SANS_INCI.indexOf(cat_id) >= 0 ? 'valide' : 'a-valider';

    var res = await appelAPIPost('createIngredientInci', {
      ing_id: ing_id, cat_id: cat_id, nom_UC: nouveauNom,
      statut: statut, inci: '',
      source: ef.factureActive ? ef.factureActive.four_code : ''
    });
    if (!res || !res.success) {
      afficherMsg('ef', (res && res.message) || 'Erreur création ingrédient.', 'erreur');
      return;
    }
    listesDropdown.fullData.push({
      ing_id: ing_id, cat_id: cat_id, nom_UC: nouveauNom, inci: '', statut: statut
    });
  }

  var sel = document.getElementById('ef-nom-uc');
  if (sel) {
    var opt = Array.from(sel.options).find(function(o) { return o.value === ing_id; });
    if (!opt) {
      opt = document.createElement('option');
      opt.value = ing_id;
      opt.textContent = nouveauNom;
      var optNew = Array.from(sel.options).find(function(o) { return o.value === '__nouveau__'; });
      if (optNew) sel.insertBefore(opt, optNew);
      else sel.appendChild(opt);
    }
    sel.value = ing_id;
  }
  document.getElementById('modal-ef-ingredient')?.classList.remove('ouvert');
  efRemplirFormats(ing_id);
  efRestaurerSaisie();
}

// ─── MODALES — NOUVELLE CAT UC ───
function efOuvrirModalNouvelleCatUC() {
  var modal = document.getElementById('modal-ef-nouvelle-cat-uc');
  if (!modal) return;
  document.getElementById('modal-ef-nouvelle-cat-uc-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-ef-nouvelle-cat-uc-valeur').focus(); }, 100);
}

function efFermerModalNouvelleCatUC() {
  document.getElementById('modal-ef-nouvelle-cat-uc')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

async function efConfirmerModalNouvelleCatUC() {
  var val = document.getElementById('modal-ef-nouvelle-cat-uc-valeur')?.value?.trim();
  if (!val) { document.getElementById('modal-ef-nouvelle-cat-uc-valeur').focus(); return; }
  var res = await appelAPIPost('saveCategorieUC', { nom: val });
  if (!res || !res.success) {
    afficherMsg('ef', 'Erreur création catégorie.', 'erreur');
    return;
  }
  var cat_id = res.cat_id;
  listesDropdown.categoriesMap[cat_id] = val;
  var sel = document.getElementById('ef-cat-uc');
  if (sel) {
    var opt = document.createElement('option');
    opt.value = cat_id;
    opt.textContent = val;
    var optNew = Array.from(sel.options).find(function(o) { return o.value === '__nouveau__'; });
    if (optNew) sel.insertBefore(opt, optNew);
    else sel.appendChild(opt);
    sel.value = cat_id;
    efRemplirNomsUC(cat_id);
  }
  document.getElementById('modal-ef-nouvelle-cat-uc')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

// ─── MODALES — NOUVELLE CAT FOURNISSEUR ───
function efOuvrirModalCatFourn() {
  var modal = document.getElementById('modal-ef-cat-fourn');
  if (!modal) return;
  document.getElementById('modal-ef-cat-fourn-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-ef-cat-fourn-valeur').focus(); }, 100);
}

function efFermerModalCatFourn() {
  document.getElementById('modal-ef-cat-fourn')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

async function efConfirmerModalCatFourn() {
  var val = document.getElementById('modal-ef-cat-fourn-valeur')?.value?.trim();
  if (!val) { document.getElementById('modal-ef-cat-fourn-valeur').focus(); return; }
  var res = await appelAPIPost('saveCategoriesFournisseur', { nom: val });
  if (!res || !res.success) {
    afficherMsg('ef', 'Erreur création catégorie.', 'erreur');
    return;
  }
  var cat_fourn_id = res.cat_fourn_id;
  ef.catsFourn.push({ cat_fourn_id: cat_fourn_id, nom: val });
  var sel = document.getElementById('ef-cat-fourn');
  if (sel) {
    var opt = document.createElement('option');
    opt.value = cat_fourn_id;
    opt.textContent = val;
    var optNew = Array.from(sel.options).find(function(o) { return o.value === '__nouveau__'; });
    if (optNew) sel.insertBefore(opt, optNew);
    else sel.appendChild(opt);
    sel.value = cat_fourn_id;
    efRemplirNomsFourn(cat_fourn_id);
  }
  document.getElementById('modal-ef-cat-fourn')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

// ─── MODALES — NOUVEAU NOM FOURNISSEUR ───
function efOuvrirModalNomFourn() {
  var modal = document.getElementById('modal-ef-nom-fourn');
  if (!modal) return;
  document.getElementById('modal-ef-nom-fourn-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-ef-nom-fourn-valeur').focus(); }, 100);
}

function efFermerModalNomFourn() {
  document.getElementById('modal-ef-nom-fourn')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

async function efConfirmerModalNomFourn() {
  var val = document.getElementById('modal-ef-nom-fourn-valeur')?.value?.trim();
  if (!val) { document.getElementById('modal-ef-nom-fourn-valeur').focus(); return; }
  var cat_fourn_id = document.getElementById('ef-cat-fourn')?.value || '';
  if (!cat_fourn_id) {
    afficherMsg('ef', 'Choisir une catégorie fournisseur d\'abord.', 'erreur');
    document.getElementById('modal-ef-nom-fourn')?.classList.remove('ouvert');
    efRestaurerSaisie();
    return;
  }
  var four_id = ef.factureActive.four_id;
  var res = await appelAPIPost('saveProduitFournisseur', {
    nom: val, cat_fourn_id: cat_fourn_id, four_id: four_id
  });
  if (!res || !res.success) {
    afficherMsg('ef', 'Erreur création produit fournisseur.', 'erreur');
    return;
  }
  var prod_fourn_id = res.prod_fourn_id;
  ef.prodsFourn.push({
    prod_fourn_id: prod_fourn_id, cat_fourn_id: cat_fourn_id,
    four_id: four_id, nom: val
  });
  var sel = document.getElementById('ef-nom-fourn');
  if (sel) {
    var opt = document.createElement('option');
    opt.value = prod_fourn_id;
    opt.textContent = val;
    var optNew = Array.from(sel.options).find(function(o) { return o.value === '__nouveau__'; });
    if (optNew) sel.insertBefore(opt, optNew);
    else sel.appendChild(opt);
    sel.value = prod_fourn_id;
  }
  document.getElementById('modal-ef-nom-fourn')?.classList.remove('ouvert');
  efRestaurerSaisie();
}

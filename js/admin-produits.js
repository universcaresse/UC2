/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-produits.js
   Étapes 1 + 2 — propreté + performance (cache mémoire)
   ═══════════════════════════════════════ */

// ─── ÉTAT ───
var donneesProduits     = [];
var produitActif        = null;
var scrollAvantProduit  = 0;
var collectionsDisponibles = {};

var formatsRecette      = [];
var ingredientsRecette  = [];
var emballagesRecette   = {};
var gammesIngs          = [];

var saisieProduitEnCours = null;

// Cache mémoire — toutes les données de la section produits, chargées une seule fois
var prodCache = {
  charge:         false,
  ingredients:    {}, // { pro_id: [ {ing_id, nom_ingredient, quantite_g}, ... ] }
  formats:        {}, // { pro_id: [ {poids, unite, prix_vente, nb_unites}, ... ] }
  emballages:     {}, // { pro_id: [ {poids, unite, ing_id, quantite, nb_par_unite}, ... ] }
  stock:          [], // [ {ing_id, nom_UC, cat_id, qte_g, prix_par_g_reel, ...} ]
  lots:           [], // [ {pro_id, ...} ]
  ventesLignes:   []  // [ {pro_id, ...} ]
};

// ─── VUES (grille / fiche / formulaire) ───
function produitsAfficherVue(vue) {
  var grille      = document.getElementById('grille-produits');
  var vide        = document.getElementById('vide-produits');
  var filtresBar  = document.querySelector('#section-produits .filtres-bar');
  var btnNouveau  = document.getElementById('btn-nouvelle-recette');
  var btnActu     = document.getElementById('btn-actualiser-produits');
  var fiche       = document.getElementById('fiche-recette');
  var form        = document.getElementById('form-recettes');

  if (filtresBar) filtresBar.classList.toggle('cache', vue !== 'grille');
  if (btnNouveau) btnNouveau.classList.toggle('cache', vue !== 'grille');
  if (btnActu)    btnActu.classList.toggle('cache',    vue !== 'grille');
  if (grille)     grille.classList.toggle('cache',     vue !== 'grille');
  if (fiche)      fiche.classList.toggle('cache',      vue !== 'fiche');
  if (form)       form.classList.toggle('cache',       vue !== 'formulaire');

  if (vue !== 'grille' && vide) vide.classList.add('cache');
}

function produitsViderEtatFormulaire() {
  formatsRecette     = [];
  ingredientsRecette = [];
  emballagesRecette  = {};
  gammesIngs         = [];
  saisieProduitEnCours = null;
}

// ─── CHARGEMENT DU CACHE ───
async function chargerCacheProduits() {
  afficherChargement();
  var res = await Promise.all([
    appelAPI('getProduits'),
    appelAPI('getProduitsFormats'),
    appelAPI('getProduitsIngredients'),
    appelAPI('getFormatsEmballages'),
    appelAPI('getStock'),
    appelAPI('getLots'),
    appelAPI('getVentesLignes')
  ]);

  // 1. Produits + formats fusionnés (comme avant pour l'affichage de la grille)
  var formatsMap = {};
  if (res[1] && res[1].success) {
    (res[1].items || []).forEach(function(f) {
      if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
      formatsMap[f.pro_id].push({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente, nb_unites: f.nb_unites || 0 });
    });
  }
  prodCache.formats = formatsMap;

  if (res[0] && res[0].success) {
    donneesProduits = (res[0].items || []).sort(function(a, b) {
      var colA = donneesCollections.find(function(c) { return c.col_id === a.col_id; });
      var colB = donneesCollections.find(function(c) { return c.col_id === b.col_id; });
      var gamA = donneesGammes.find(function(g) { return g.gam_id === a.gam_id; });
      var gamB = donneesGammes.find(function(g) { return g.gam_id === b.gam_id; });
      return ((colA && colA.rang || 99) - (colB && colB.rang || 99)) ||
             ((gamA && gamA.rang || 99) - (gamB && gamB.rang || 99)) ||
             (((donneesFamilles.find(function(f) { return f.fam_id === a.fam_id; }) || {}).rang || 99) -
              ((donneesFamilles.find(function(f) { return f.fam_id === b.fam_id; }) || {}).rang || 99)) ||
             ((a.nom || '').localeCompare(b.nom || ''));
    }).map(function(p) {
      return Object.assign({}, p, { formats: formatsMap[p.pro_id] || [] });
    });
  }

  // 2. Ingrédients par produit
  var ingsMap = {};
  if (res[2] && res[2].success) {
    (res[2].items || []).forEach(function(i) {
      if (!ingsMap[i.pro_id]) ingsMap[i.pro_id] = [];
      ingsMap[i.pro_id].push(i);
    });
  }
  prodCache.ingredients = ingsMap;

  // 3. Emballages par produit
  var embMap = {};
  if (res[3] && res[3].success) {
    (res[3].items || []).forEach(function(e) {
      if (!embMap[e.pro_id]) embMap[e.pro_id] = [];
      embMap[e.pro_id].push(e);
    });
  }
  prodCache.emballages = embMap;

  // 4. Stock
  prodCache.stock = (res[4] && res[4].success) ? res[4].items : [];
  listesDropdown.stock = prodCache.stock;

  // 5. Lots et ventes (pour la suppression / archivage)
  prodCache.lots         = (res[5] && res[5].success) ? res[5].items : [];
  prodCache.ventesLignes = (res[6] && res[6].success) ? res[6].items : [];

  prodCache.charge = true;
  cacherChargement();
}

async function chargerProduitsData() {
  await chargerCacheProduits();
  afficherProduits();
}

// Bouton Actualiser — force un rechargement complet
async function actualiserProduits() {
  prodCache.charge = false;
  await chargerCacheProduits();
  afficherProduits();
  afficherMsg('produits', '✅ Données actualisées.');
}

// ─── AFFICHAGE DE LA GRILLE ───
async function afficherProduits() {
  produitsAfficherVue('grille');
  produitActif = null;
  produitsViderEtatFormulaire();

  var loading = document.getElementById('loading-produits');
  var grille  = document.getElementById('grille-produits');
  var vide    = document.getElementById('vide-produits');
  if (loading) loading.classList.add('cache');
  if (grille)  grille.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  var filtreCol = document.getElementById('filtre-recette-collection');
  var filtreLig = document.getElementById('filtre-recette-ligne');
  if (filtreCol) filtreCol.value = '';
  if (filtreLig) { filtreLig.innerHTML = '<option value="">Toutes les gammes</option>'; filtreLig.disabled = true; }

  await chargerCollectionsPourSelecteur();
  injecterBoutonActualiser();

  if (!donneesProduits.length) { if (vide) vide.classList.remove('cache'); return; }

  if (grille) { grille.innerHTML = ''; grille.classList.remove('cache'); }

  var parCollection = {};
  var ordreCollections = [];
  donneesProduits.forEach(function(pro) {
    var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
    var colId = pro.col_id || '—';
    if (!parCollection[colId]) {
      parCollection[colId] = { nom: (col && col.nom) || colId, gammes: {} };
      ordreCollections.push(colId);
    }
    var gam = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });
    var gamId  = pro.gam_id || '';
    var gamNom = (gam && gam.nom) || '';
    if (!parCollection[colId].gammes[gamId]) {
      parCollection[colId].gammes[gamId] = { nom: gamNom, rang: (gam && gam.rang) || 99, produits: [] };
    }
    parCollection[colId].gammes[gamId].produits.push(pro);
  });

  ordreCollections.forEach(function(colId) {
    var colData = parCollection[colId];
    var secCol = document.createElement('div');
    secCol.className = 'recette-section-collection';
    secCol.dataset.collection = colData.nom;
    secCol.innerHTML = '<div class="recette-collection-titre">' + colData.nom.toUpperCase() + '</div>';

    var gammesTriees = Object.values(colData.gammes).sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); });
    gammesTriees.forEach(function(gamData) {
      var secGam = document.createElement('div');
      secGam.className = 'recette-section-ligne';
      secGam.dataset.ligne = gamData.nom;
      if (gamData.nom) {
        secGam.innerHTML = '<div class="recette-ligne-titre">' + gamData.nom.toUpperCase() + '</div>';
      }
      var grilleInner = document.createElement('div');
      grilleInner.className = 'recette-cartes-grille';

      gamData.produits.forEach(function(pro) {
        var couleur = (typeof pro.couleur_hex === 'string' && pro.couleur_hex) ? pro.couleur_hex : '#ffffff';
        var div = document.createElement('div');
        div.className = 'carte-produit';
        div.dataset.proId = pro.pro_id;
        div.onclick = (function(d, id) {
          return function() {
            scrollAvantProduit = (document.querySelector('.admin-contenu') || {}).scrollTop || window.scrollY;
            ouvrirFicheProduit(id);
          };
        })(div, pro.pro_id);
        div.style.setProperty('--col-hex', couleur);
        var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
        var formatsHTML = (pro.formats && pro.formats.length)
          ? '<div class="carte-formats">' + [].concat(pro.formats).sort(function(a, b) { return parseFloat(a.poids) - parseFloat(b.poids); }).map(function(f) {
              return '<div class="carte-format-tag"><span class="carte-format-prix">' + parseFloat(f.prix_vente).toFixed(2).replace('.', ',') + ' $</span><span class="carte-format-sep"></span><span class="carte-format-poids">' + f.poids + ' ' + f.unite + '</span></div>';
            }).join('') + '</div>'
          : '';
        div.innerHTML =
          '<div class="carte-visuel">' +
            '<span class="carte-statut-badge' + (pro.statut !== 'public' ? ' test' : '') + '">' + (pro.statut === 'public' ? 'Public' : 'Test') + '</span>' +
            '<div class="carte-couleur">' +
              (pro.image_url
                ? '<img src="' + pro.image_url + '" alt="' + pro.nom + '" onerror="this.style.display=\'none\'">'
                : '<div class="carte-photo-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Photo à venir</div>') +
              '<div class="recette-couleur-overlay"></div>' +
              '<div class="carte-couleur-dot"></div>' +
            '</div>' +
          '</div>' +
          '<div class="carte-infos ' + couleurTexteContraste(couleur) + '">' +
            '<span class="carte-collection-badge">' + ((col && col.nom) || '—') + '</span>' +
            '<div class="carte-nom">' + (pro.nom || '—') + '</div>' +
            '<div class="carte-ligne">' + gamData.nom + '</div>' +
            '<div class="carte-bas">' + formatsHTML + '</div>' +
          '</div>';
        grilleInner.appendChild(div);
      });

      secGam.appendChild(grilleInner);
      secCol.appendChild(secGam);
    });

    if (grille) grille.appendChild(secCol);
  });

  peuplerFiltresRecettes();
}

// ─── BOUTON ACTUALISER ───
// Injecte le bouton Actualiser à côté du bouton "+ Nouveau produit" s'il n'existe pas déjà
function injecterBoutonActualiser() {
  if (document.getElementById('btn-actualiser-produits')) return;
  var btnNouveau = document.getElementById('btn-nouvelle-recette');
  if (!btnNouveau || !btnNouveau.parentNode) return;
  var btn = document.createElement('button');
  btn.id = 'btn-actualiser-produits';
  btn.className = 'bouton bouton-contour';
  btn.style.marginRight = '8px';
  btn.textContent = '↺ Actualiser';
  btn.onclick = actualiserProduits;
  btnNouveau.parentNode.insertBefore(btn, btnNouveau);
}

// ─── FILTRES ───
function peuplerFiltresRecettes() {
  var bar = document.getElementById('filtre-recette-collection-bar');
  if (!bar) return;
  bar.innerHTML = '<button class="filtre-btn actif" data-col="" onclick="onFiltreCollectionBtn(this, \'\')">Tout</button>';
  donneesCollections.sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); }).forEach(function(col) {
    bar.innerHTML += '<button class="filtre-btn" data-col="' + col.nom + '" onclick="onFiltreCollectionBtn(this, \'' + col.nom + '\')">' + col.nom + '</button>';
  });
  var filStat = document.getElementById('filtre-recette-statut');
  var filNom  = document.getElementById('filtre-recette-nom');
  if (filStat) filStat.classList.remove('cache');
  if (filNom)  filNom.classList.remove('cache');
}

function onFiltreCollectionBtn(btn, colNom) {
  document.querySelectorAll('#filtre-recette-collection-bar .filtre-btn').forEach(function(b) { b.classList.remove('actif'); });
  btn.classList.add('actif');
  var bar = document.getElementById('filtre-recette-ligne-bar');
  bar.innerHTML = '';
  if (colNom) {
    var col = donneesCollections.find(function(c) { return c.nom === colNom; });
    var gammes = col ? donneesGammes.filter(function(g) { return g.col_id === col.col_id; }) : [];
    if (gammes.length > 1) {
      bar.classList.remove('cache');
      bar.innerHTML = '<button class="filtre-btn actif" onclick="onFiltreGammeBtn(this, \'\')">Toutes</button>';
      gammes.sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); }).forEach(function(g) {
        bar.innerHTML += '<button class="filtre-btn" onclick="onFiltreGammeBtn(this, \'' + g.nom + '\')">' + g.nom + '</button>';
      });
    } else {
      bar.classList.add('cache');
    }
  } else {
    bar.classList.add('cache');
  }
  filtrerRecettes();
}

function onFiltreGammeBtn(btn, gamNom) {
  document.querySelectorAll('#filtre-recette-ligne-bar .filtre-btn').forEach(function(b) { b.classList.remove('actif'); });
  btn.classList.add('actif');
  var fil = document.getElementById('filtre-recette-ligne');
  if (fil) fil.value = gamNom;
  filtrerRecettes();
}

function onFiltreCollection() {
  var colNom = document.getElementById('filtre-recette-collection').value;
  var selGamme = document.getElementById('filtre-recette-ligne');
  selGamme.innerHTML = '<option value="">Toutes les gammes</option>';
  if (colNom) {
    var col = donneesCollections.find(function(c) { return c.nom === colNom; });
    var gammes = col ? donneesGammes.filter(function(g) { return g.col_id === col.col_id; }) : [];
    gammes.sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); }).forEach(function(g) {
      var opt = document.createElement('option');
      opt.value = g.nom; opt.textContent = g.nom;
      selGamme.appendChild(opt);
    });
    selGamme.disabled = false;
  } else {
    selGamme.disabled = true;
  }
  filtrerRecettes();
}

function filtrerRecettes() {
  var colBtn = document.querySelector('#filtre-recette-collection-bar .filtre-btn.actif');
  var col    = colBtn ? colBtn.dataset.col : '';
  var gamBtn = document.querySelector('#filtre-recette-ligne-bar .filtre-btn.actif');
  var gamme  = (gamBtn && gamBtn.textContent.trim() !== 'Toutes') ? gamBtn.textContent.trim() : '';
  var elStat = document.getElementById('filtre-recette-statut');
  var elNom  = document.getElementById('filtre-recette-nom');
  var statut = elStat ? elStat.value : '';
  var nom    = elNom ? (elNom.value || '').toLowerCase().trim() : '';
  var cartes = document.querySelectorAll('#grille-produits .carte-produit');
  var vide   = document.getElementById('vide-produits');
  var visible = 0;
  cartes.forEach(function(carte) {
    var pro = donneesProduits.find(function(p) { return p.pro_id === carte.dataset.proId; });
    if (!pro) return;
    var colObj = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
    var gamObj = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });
    var ok = (!col    || (colObj && colObj.nom) === col)
          && (!gamme  || (gamObj && gamObj.nom) === gamme)
          && (!statut || (pro.statut || 'test') === statut)
          && (!nom    || pro.nom.toLowerCase().includes(nom));
    carte.classList.toggle('cache', !ok);
    if (ok) visible++;
  });
  if (vide) vide.classList.toggle('cache', visible !== 0);

  document.querySelectorAll('#grille-produits .recette-section-ligne').forEach(function(sec) {
    var aDesCartesVisibles = [].slice.call(sec.querySelectorAll('.carte-produit')).some(function(c) { return !c.classList.contains('cache'); });
    sec.classList.toggle('cache', !aDesCartesVisibles);
  });
  document.querySelectorAll('#grille-produits .recette-section-collection').forEach(function(sec) {
    var aDesLignesVisibles = [].slice.call(sec.querySelectorAll('.recette-section-ligne')).some(function(l) { return !l.classList.contains('cache'); });
    sec.classList.toggle('cache', !aDesLignesVisibles);
  });
}

function reinitialiserFiltresRecettes() {
  document.querySelectorAll('#filtre-recette-collection-bar .filtre-btn').forEach(function(b) { b.classList.remove('actif'); });
  var btnTout = document.querySelector('#filtre-recette-collection-bar .filtre-btn');
  if (btnTout) btnTout.classList.add('actif');
  var bar = document.getElementById('filtre-recette-ligne-bar');
  if (bar) { bar.innerHTML = ''; bar.classList.add('cache'); }
  var elStat = document.getElementById('filtre-recette-statut');
  var elNom  = document.getElementById('filtre-recette-nom');
  if (elStat) elStat.value = '';
  if (elNom)  elNom.value  = '';
  filtrerRecettes();
}

// ─── COLLECTIONS / GAMMES / FAMILLES POUR LE FORMULAIRE ───
async function chargerCollectionsPourSelecteur() {
  var sel = document.getElementById('fr-collection');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  collectionsDisponibles = {};
  donneesCollections.sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); }).forEach(function(col) {
    collectionsDisponibles[col.col_id] = donneesGammes.filter(function(g) { return g.col_id === col.col_id; });
    var o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
  var selFam = document.getElementById('fr-famille');
  if (selFam) {
    selFam.innerHTML = '<option value="">— Aucune —</option>';
    donneesFamilles.sort(function(a, b) { return (a.nom || '').localeCompare(b.nom || '', 'fr'); }).forEach(function(fam) {
      var o = document.createElement('option');
      o.value = fam.fam_id; o.textContent = fam.nom; selFam.appendChild(o);
    });
  }
  var selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    selSec.innerHTML = '';
    donneesCollections.forEach(function(col) {
      var label = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = col.col_id; cb.id = 'sec-' + col.col_id;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(col.nom));
      selSec.appendChild(label);
    });
  }
}

async function mettreAJourLignes() {
  var col_id = document.getElementById('fr-collection').value;
  var sel = document.getElementById('fr-ligne');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  var gammes = (collectionsDisponibles[col_id] || []).sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); });
  if (!gammes.length) { sel.innerHTML = '<option value="">— Aucune gamme —</option>'; sel.disabled = true; return; }
  sel.disabled = false;
  gammes.forEach(function(g) {
    var o = document.createElement('option'); o.value = g.gam_id; o.textContent = g.nom; sel.appendChild(o);
  });
  var selFam = document.getElementById('fr-famille');
  if (selFam) {
    var valFam = selFam.value;
    selFam.innerHTML = '<option value="">— Aucune —</option>';
    donneesFamilles.filter(function(f) { return f.col_id === col_id; }).sort(function(a, b) { return (a.nom || '').localeCompare(b.nom || '', 'fr'); }).forEach(function(fam) {
      var o = document.createElement('option'); o.value = fam.fam_id; o.textContent = fam.nom; selFam.appendChild(o);
    });
    selFam.value = valFam;
  }
}

// ─── OUVRIR LA FICHE D'UN PRODUIT (instantané — depuis le cache) ───
function ouvrirFicheProduit(pro_id) {
  var pro = donneesProduits.find(function(p) { return p.pro_id === pro_id; });
  if (!pro) return Promise.resolve();
  produitActif = pro;

  var formats  = prodCache.formats[pro_id] || [];
  var embItems = prodCache.emballages[pro_id] || [];
  var ings     = prodCache.ingredients[pro_id] || [];
  var stock    = prodCache.stock || [];
  var config   = listesDropdown.config || {};

  var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
  var gam = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });

  var coutIngsTotal = 0;
  ings.forEach(function(ing) {
    var s = stock.find(function(st) { return st.ing_id === ing.ing_id; });
    if (!s) return;
    var cfg = config[s.cat_id || ''] || {};
    var facteur = 1 + ((cfg.margePertePct || 0) / 100);
    coutIngsTotal += (ing.quantite_g || 0) * (s.prix_par_g_reel || 0) * facteur;
  });

  var CAT_CONTENANT  = 'CAT-016';
  var CATS_EMBALLAGE = ['CAT-014', 'CAT-015', 'CAT-017'];

  var formatsHtml = formats.length
    ? construireTableauFormats(formats, embItems, stock, coutIngsTotal, CAT_CONTENANT, CATS_EMBALLAGE)
    : '<div class="fiche-vide fiche-label-manquant">⚠ Aucun format</div>';

  var ingsHtml = ings.length
    ? ings.slice().sort(function(a, b) { return b.quantite_g - a.quantite_g; }).map(function(i) {
        var inciObj  = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; });
        var inciCode = (inciObj && inciObj.inci) || '';
        var sansInci = !inciCode;
        var s2 = stock.find(function(st) { return st.ing_id === i.ing_id; });
        var prixParG = (s2 && s2.prix_par_g_reel) || 0;
        var coutIng = prixParG > 0 ? (i.quantite_g * prixParG).toFixed(2) + ' $' : '⚠';
        return '<div class="fiche-ingredient">' +
          '<span class="fiche-ing-nom' + (sansInci ? ' fiche-label-manquant' : '') + '">' + (sansInci ? '⚠ ' : '') + i.nom_ingredient + '</span>' +
          '<span class="fiche-ing-inci">' + inciCode + '</span>' +
          '<span class="fiche-ing-qte">' + i.quantite_g + ' g</span>' +
          '<span class="fiche-ing-qte">' + coutIng + '</span>' +
          '</div>';
      }).join('')
    : '<div class="fiche-vide">Aucun ingrédient</div>';

  var inciLabel = ings
    .filter(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o && o.inci; })
    .slice()
    .sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o.inci.trim(); })
    .join(', ');
  var inciLabelHtml = inciLabel ? '<div class="inci-label-texte">' + inciLabel + '</div>' : '<div class="fiche-vide">Aucun code INCI disponible</div>';

  document.getElementById('fiche-recette-titre').textContent = pro.nom || '—';
  document.getElementById('fiche-recette-contenu').innerHTML =
    '<div class="fiche-visuel">' +
      (pro.image_url ? '<img src="' + pro.image_url + '" class="fiche-visuel-photo">' : '') +
      '<div class="fiche-visuel-hex" style="background:' + (pro.couleur_hex || 'var(--beige)') + '"></div>' +
    '</div>' +
    '<div class="fiche-grille">' +
      '<div class="fiche-champ"><span class="fiche-label">Collection</span><span class="fiche-valeur">' + ((col && col.nom) || '—') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Gamme</span><span class="fiche-valeur">' + ((gam && gam.nom) || '—') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Statut</span><span class="fiche-valeur">' + (pro.statut || 'test') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Cure</span><span class="fiche-valeur">' + (pro.cure || '—') + ' jours</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Surgras</span><span class="fiche-valeur">' + (pro.surgras || '—') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Couleur HEX</span><span class="fiche-valeur">' + (pro.couleur_hex || '—') + '</span></div>' +
    '</div>' +
    '<div class="fiche-section-titre">Description</div>' +
    '<div class="fiche-texte">' + (pro.description || '—') + '</div>' +
    '<div class="fiche-section-titre">Description pour emballage</div>' +
    '<div class="fiche-texte">' + (pro.desc_emballage || '—') + '</div>' +
    '<div class="fiche-section-titre">Avertissement</div>' +
    '<div class="fiche-texte">' + (pro.avertissement || '—') + '</div>' +
    '<div class="fiche-section-titre">Mode d\'emploi</div>' +
    '<div class="fiche-texte">' + (pro.mode_emploi || '—') + '</div>' +
    '<div class="fiche-section-titre">Instructions</div>' +
    '<div class="fiche-texte">' + (pro.instructions || '—') + '</div>' +
    '<div class="fiche-section-titre">Notes</div>' +
    '<div class="fiche-texte">' + (pro.notes || '—') + '</div>' +
    '<div class="fiche-section-titre">Ingrédients</div>' +
    '<div class="fiche-ingredient fiche-ingredient-labels">' +
      '<span class="fiche-ing-nom">Nom</span>' +
      '<span class="fiche-ing-inci">INCI</span>' +
      '<span class="fiche-ing-qte">Qté</span>' +
      '<span class="fiche-ing-qte">Prix</span>' +
    '</div>' +
    '<div class="fiche-ingredients">' + ingsHtml + '</div>' +
    '<div class="fiche-section-titre">Liste INCI pour étiquette</div>' +
    '<div class="fiche-inci-etiquette">' + inciLabelHtml + '</div>' +
    '<div class="fiche-section-titre">Formats disponibles</div>' +
    formatsHtml +
    '<div class="fiche-section-titre" style="margin-top:24px">Export</div>' +
    '<button class="bouton" onclick="exporterFicheProduit()">Copier pour le graphiste</button>';

  produitsAfficherVue('fiche');
  window.scrollTo(0, 0);
  var contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTo(0, 0);
  return Promise.resolve();
}

function construireTableauFormats(formats, embItems, stock, coutIngsTotal, CAT_CONTENANT, CATS_EMBALLAGE) {
  var rows = formats.map(function(f) {
    var nbUnites = f.nb_unites || 0;
    var coutIngParUnite = nbUnites > 0 ? coutIngsTotal / nbUnites : 0;
    var embsDuFormat = embItems.filter(function(e) { return String(e.poids) === String(f.poids) && e.unite === f.unite; });
    var coutContenant = 0, coutEmballage = 0;
    embsDuFormat.forEach(function(e) {
      var s = stock.find(function(st) { return st.ing_id === e.ing_id; });
      var prix = (s && s.prix_par_g_reel) || 0;
      var montant = (e.nb_par_unite || 1) * prix;
      var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === e.ing_id; });
      if (ing && ing.cat_id === CAT_CONTENANT) coutContenant += montant;
      else if (ing && CATS_EMBALLAGE.indexOf(ing.cat_id) >= 0) coutEmballage += montant;
    });
    var coutTotal = coutIngParUnite + coutContenant + coutEmballage;
    var marge = (f.prix_vente && coutTotal > 0)
      ? ((f.prix_vente - coutTotal) / f.prix_vente * 100).toFixed(1) + ' %' : '—';
    var margeNum = (f.prix_vente && coutTotal > 0) ? (f.prix_vente - coutTotal) / f.prix_vente * 100 : null;
    var margeCouleur = margeNum === null ? '' : margeNum >= 50 ? 'color:var(--vert)' : margeNum >= 30 ? 'color:var(--or)' : 'color:var(--rouge)';
    return '<tr style="border-bottom:1px solid var(--beige)">' +
      '<td style="padding:14px 8px;font-weight:500">' + f.poids + ' ' + f.unite + '</td>' +
      '<td style="padding:14px 8px;text-align:right;color:var(--gris)">' + (nbUnites || '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right">' + (coutIngParUnite > 0 ? formaterPrix(coutIngParUnite) : '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right">' + (coutContenant > 0 ? formaterPrix(coutContenant) : '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right">' + (coutEmballage > 0 ? formaterPrix(coutEmballage) : '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right;font-weight:500">' + (coutTotal > 0 ? formaterPrix(coutTotal) : '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right">' + (coutTotal > 0 ? formaterPrix(coutTotal) : '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right;color:var(--primary);font-weight:500">' + (f.prix_vente ? formaterPrix(f.prix_vente) : '—') + '</td>' +
      '<td style="padding:14px 8px;text-align:right;font-weight:500;' + margeCouleur + '">' + marge + '</td>' +
    '</tr>';
  }).join('');
  return '<table style="width:100%;border-collapse:collapse;margin-top:8px"><thead>' +
    '<tr style="border-bottom:2px solid var(--beige-fonce)">' +
    '<th style="text-align:left;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">FORMAT</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">NB UNITÉS</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">COÛT ING.</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">CONTENANT</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">EMBALLAGE</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">COÛT TOTAL</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">COÛT/UNITÉ</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">PRIX VENTE</th>' +
    '<th style="text-align:right;padding:12px 8px;font-size:0.7rem;letter-spacing:0.1em;color:var(--gris);font-weight:500">MARGE</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
}

// ─── EXPORT FICHE ───
function exporterFicheProduit() {
  if (!produitActif) return;
  var pro = produitActif;
  var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
  var gam = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });
  var fam = donneesFamilles && donneesFamilles.find(function(f) { return f.fam_id === pro.fam_id; });
  var ings = prodCache.ingredients[pro.pro_id] || [];
  var formats = pro.formats || [];
  var inciLabel = ings
    .filter(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o && o.inci; })
    .slice()
    .sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o.inci.trim(); })
    .join(', ');
  var ingsTexte = ings.slice().sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return '  - ' + i.nom_ingredient + ' | ' + ((o && o.inci) || '⚠ INCI manquant') + ' | ' + i.quantite_g + ' g'; })
    .join('\n');
  var formatsTexte = formats.map(function(f) { return '  - ' + f.poids + ' ' + f.unite + ' : ' + (f.prix_vente || '—') + ' $'; }).join('\n');

  var texte = [
    'NOM : ' + (pro.nom || '—'),
    'COLLECTION : ' + ((col && col.nom) || '—'),
    'GAMME : ' + ((gam && gam.nom) || '—'),
    'FAMILLE : ' + ((fam && fam.nom) || '—'),
    'STATUT : ' + (pro.statut || '—'),
    'COULEUR HEX : ' + (pro.couleur_hex || '—'),
    'IMAGE : ' + (pro.image_url || '—'),
    'IMAGE NOËL : ' + (pro.image_noel_url || '—'),
    '\nDESCRIPTION :\n' + (pro.description || '—'),
    '\nDESCRIPTION EMBALLAGE :\n' + (pro.desc_emballage || '—'),
    '\nINSTRUCTIONS :\n' + (pro.instructions || '—'),
    '\nNOTES :\n' + (pro.notes || '—'),
    '\nAVERTISSEMENT :\n' + (pro.avertissement || '—'),
    '\nMODE D\'EMPLOI :\n' + (pro.mode_emploi || '—'),
    '\nLISTE INCI :\n' + (inciLabel || '—'),
    '\nINGRÉDIENTS :\n' + (ingsTexte || '—'),
    '\nFORMATS :\n' + (formatsTexte || '—')
  ].join('\n');

  navigator.clipboard.writeText(texte).then(function() { afficherMsg('produits', '✅ Copié dans le presse-papier.'); });
}

// ─── FERMETURE / EDITION / SUPPRESSION ───
function fermerFicheProduit() {
  produitActif = null;
  produitsAfficherVue('grille');
  filtrerRecettes();
  var contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTop = scrollAvantProduit;
  else window.scrollTo(0, scrollAvantProduit);
}
function fermerFicheRecette() { fermerFicheProduit(); }

async function basculerModeEditionRecette() {
  if (!produitActif) return;
  await modifierProduit(produitActif.pro_id);
}

function supprimerRecetteActive() {
  if (!produitActif) return;
  supprimerProduit(produitActif.pro_id);
}

// ─── OUVERTURE FORMULAIRE — NOUVEAU PRODUIT ───
async function ouvrirFormProduit() {
  produitsViderEtatFormulaire();

  document.getElementById('form-recettes-titre').textContent = 'Nouveau produit';
  document.getElementById('fr-id').value = '';
  ['fr-nom', 'fr-couleur', 'fr-cure', 'fr-description', 'fr-instructions', 'fr-notes', 'fr-surgras', 'fr-avertissement', 'fr-mode-emploi'].forEach(function(id) {
    var e = document.getElementById(id); if (e) e.value = '';
  });
  var elDescEmb = document.getElementById('fr-desc-emballage');
  if (elDescEmb) elDescEmb.value = '';
  document.getElementById('fr-statut').value = 'test';
  document.getElementById('fr-collection').value = '';
  document.getElementById('fr-ligne').innerHTML = '<option value="">— Choisir collection —</option>';
  document.getElementById('fr-ligne').disabled = true;
  document.getElementById('fr-couleur-visible').value = '';
  document.getElementById('fr-image-url').value = '';
  document.getElementById('fr-image-url-noel').value = '';
  var prevR = document.getElementById('fr-image-preview');
  if (prevR) prevR.innerHTML = '';
  var prevN = document.getElementById('fr-image-preview-noel');
  if (prevN) prevN.innerHTML = '';
  var apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercu.style.background = '';

  await chargerCollectionsPourSelecteur();
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();

  produitsAfficherVue('formulaire');
  window.scrollTo(0, 0);
  var contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTo(0, 0);
}
function ouvrirFormRecette() { ouvrirFormProduit(); }

function fermerFormProduit() {
  produitsViderEtatFormulaire();
  produitsAfficherVue('grille');
}
function fermerFormRecette() { fermerFormProduit(); }

// ─── OUVERTURE FORMULAIRE — MODIFICATION (instantané — depuis le cache) ───
async function modifierProduit(pro_id) {
  var pro = donneesProduits.find(function(p) { return p.pro_id === pro_id; });
  if (!pro) return;

  produitsViderEtatFormulaire();

  var formats  = prodCache.formats[pro_id]     || [];
  var ings     = prodCache.ingredients[pro_id] || [];
  var embItems = prodCache.emballages[pro_id]  || [];

  document.getElementById('form-recettes-titre').textContent = 'Modifier le produit';
  document.getElementById('fr-id').value = pro.pro_id;
  document.getElementById('fr-nom').value = pro.nom || '';
  document.getElementById('fr-couleur').value = pro.couleur_hex || '';
  document.getElementById('fr-couleur-visible').value = pro.couleur_hex || '';
  apercuCouleurRecette(document.getElementById('fr-couleur-visible'));
  document.getElementById('fr-cure').value = pro.cure || '';
  document.getElementById('fr-description').value = pro.description || '';
  var descEmb = document.getElementById('fr-desc-emballage');
  if (descEmb) descEmb.value = pro.desc_emballage || '';
  document.getElementById('fr-instructions').value = pro.instructions || '';
  document.getElementById('fr-notes').value = pro.notes || '';
  var elAvert = document.getElementById('fr-avertissement');
  if (elAvert) elAvert.value = pro.avertissement || '';
  var elMode = document.getElementById('fr-mode-emploi');
  if (elMode) elMode.value = pro.mode_emploi || '';
  document.getElementById('fr-surgras').value = pro.surgras || '';
  document.getElementById('fr-statut').value = pro.statut || 'test';

  await chargerCollectionsPourSelecteur();
  document.getElementById('fr-collection').value = pro.col_id || '';
  await mettreAJourLignes();
  document.getElementById('fr-ligne').value = pro.gam_id || '';
  var selFamProd = document.getElementById('fr-famille');
  if (selFamProd) selFamProd.value = pro.fam_id || '';
  document.getElementById('fr-image-url').value = pro.image_url || '';
  var preview = document.getElementById('fr-image-preview');
  if (preview) preview.innerHTML = pro.image_url ? '<img src="' + pro.image_url + '" class="photo-preview">' : '';
  document.getElementById('fr-image-url-noel').value = pro.image_noel_url || '';
  var previewNoel = document.getElementById('fr-image-preview-noel');
  if (previewNoel) previewNoel.innerHTML = pro.image_noel_url ? '<img src="' + pro.image_noel_url + '" class="photo-preview">' : '';

  var selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    Array.from(selSec.querySelectorAll('input[type="checkbox"]')).forEach(function(cb) {
      cb.checked = Array.isArray(pro.collections_secondaires) && pro.collections_secondaires.indexOf(cb.value) >= 0;
    });
  }

  ingredientsRecette = ings.map(function(i) {
    return {
      ing_id: i.ing_id,
      type: ((listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id; }) || {}).cat_id) || '',
      nom: i.nom_ingredient,
      quantite: i.quantite_g
    };
  }).sort(function(a, b) { return b.quantite - a.quantite; });

  formatsRecette = formats.map(function(f) {
    return { poids: f.poids, unite: f.unite, prix: f.prix_vente, desc: '', nb_unites: f.nb_unites || 0 };
  });

  emballagesRecette = {};
  embItems.forEach(function(e) {
    var cle = e.poids + '_' + e.unite;
    if (!emballagesRecette[cle]) emballagesRecette[cle] = [];
    var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === e.ing_id; });
    emballagesRecette[cle].push({
      ing_id: e.ing_id,
      cat_id: (ing && ing.cat_id) || '',
      nom: (ing && ing.nom_UC) || '',
      quantite: e.quantite,
      nb_par_unite: e.nb_par_unite || 1
    });
  });

  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  produitsAfficherVue('formulaire');
  window.scrollTo(0, 0);
}
function modifierRecette(id) { return modifierProduit(id); }

// ─── ENREGISTRER (mise à jour ciblée du cache, plus de rechargement complet) ───
async function sauvegarderRecette() {
  var btnSauvegarder = document.querySelector('#form-recettes .form-body-actions .bouton');

  function reactiverBouton() {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
    cacherChargement();
  }
  function erreur(msg) {
    afficherMsg('recettes', msg, 'erreur');
    reactiverBouton();
  }

  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = '<span class="spinner"></span> Sauvegarde…'; }
  afficherChargement();

  try {
    var id = document.getElementById('fr-id').value;
    var col_id = document.getElementById('fr-collection').value;
    var gam_id = document.getElementById('fr-ligne').value;

    var dernierNumPro = donneesProduits.length ? Math.max.apply(null, donneesProduits.map(function(p) { return parseInt((p.pro_id || '').replace('PRO-', '')) || 0; })) : 0;
    var d = {
      pro_id: id || ('PRO-' + String(dernierNumPro + 1).padStart(4, '0')),
      col_id: col_id,
      gam_id: gam_id,
      fam_id: (document.getElementById('fr-famille') || {}).value || '',
      nom: ((document.getElementById('fr-nom') || {}).value || '').toUpperCase(),
      couleur_hex: document.getElementById('fr-couleur').value || document.getElementById('fr-couleur-visible').value || '',
      nb_unites: 1,
      cure: parseInt(document.getElementById('fr-cure').value) || 0,
      description: document.getElementById('fr-description').value,
      desc_emballage: (document.getElementById('fr-desc-emballage') || {}).value || '',
      instructions: document.getElementById('fr-instructions').value,
      notes: document.getElementById('fr-notes').value,
      avertissement: (document.getElementById('fr-avertissement') || {}).value || '',
      mode_emploi: (document.getElementById('fr-mode-emploi') || {}).value || '',
      surgras: document.getElementById('fr-surgras').value,
      statut: document.getElementById('fr-statut').value || 'test',
      image_url: document.getElementById('fr-image-url').value,
      image_noel_url: document.getElementById('fr-image-url-noel').value,
      collections_secondaires: Array.from(
        (document.getElementById('fr-collections-secondaires') || { querySelectorAll: function() { return []; } }).querySelectorAll('input[type="checkbox"]:checked')
      ).map(function(cb) { return cb.value; }),
      ingredients: ingredientsRecette.map(function(i) {
        return { ing_id: i.ing_id || '', nom_ingredient: i.nom, quantite_g: i.quantite };
      }),
      formats: formatsRecette.map(function(f) {
        return { poids: f.poids, unite: f.unite, prix_vente: f.prix, emb_id: '', nb_unites: f.nb_unites || 0 };
      })
    };

    if (!d.nom)    return erreur('Le nom est requis.');
    if (!d.col_id) return erreur('La collection est requise.');
    if (!d.gam_id) return erreur('La gamme est requise.');

    var res = await appelAPIPost('saveProduit', d);
    if (!res || !res.success) return erreur('Erreur à l\'enregistrement.');

    // Sauvegarder les emballages pour chaque format
    for (var i = 0; i < formatsRecette.length; i++) {
      var f = formatsRecette[i];
      var cle = f.poids + '_' + f.unite;
      var embs = emballagesRecette[cle] || [];
      await appelAPIPost('saveFormatsEmballages', {
        pro_id: d.pro_id,
        poids:  f.poids,
        unite:  f.unite,
        emballages: embs.filter(function(e) { return e.ing_id; }).map(function(e) {
          return { ing_id: e.ing_id, quantite: e.quantite || 0, nb_par_unite: e.nb_par_unite || 1 };
        })
      });
    }

    // Mise à jour ciblée du cache mémoire (plus de rechargement complet)
    majCacheApresSauvegarde(d);

    fermerFormProduit();
    afficherProduits();
    afficherMsg('recettes', id ? 'Produit mis à jour.' : 'Produit créé.');
    var contenu = document.querySelector('.admin-contenu');
    if (contenu) contenu.scrollTop = scrollAvantProduit;
    reactiverBouton();
  } catch (err) {
    erreur('Erreur inattendue.');
  }
}

// Met à jour le cache mémoire avec les nouvelles données du produit qu'on vient de sauvegarder
function majCacheApresSauvegarde(d) {
  var pro_id = d.pro_id;

  // 1. Mettre à jour ou ajouter le produit dans donneesProduits
  var idxProduit = donneesProduits.findIndex(function(p) { return p.pro_id === pro_id; });
  var nouveauProduit = {
    pro_id: pro_id,
    col_id: d.col_id,
    gam_id: d.gam_id,
    fam_id: d.fam_id,
    nom: d.nom,
    description: d.description,
    desc_emballage: d.desc_emballage,
    couleur_hex: d.couleur_hex,
    surgras: d.surgras,
    nb_unites: d.nb_unites,
    cure: d.cure,
    instructions: d.instructions,
    notes: d.notes,
    avertissement: d.avertissement,
    mode_emploi: d.mode_emploi,
    image_url: d.image_url,
    image_noel_url: d.image_noel_url,
    statut: d.statut,
    collections_secondaires: d.collections_secondaires,
    formats: formatsRecette.map(function(f) {
      return { poids: f.poids, unite: f.unite, prix_vente: f.prix, nb_unites: f.nb_unites || 0 };
    })
  };
  if (idxProduit >= 0) {
    donneesProduits[idxProduit] = nouveauProduit;
  } else {
    donneesProduits.push(nouveauProduit);
  }

  // 2. Mettre à jour le cache des formats
  prodCache.formats[pro_id] = formatsRecette.map(function(f) {
    return { poids: f.poids, unite: f.unite, prix_vente: f.prix, nb_unites: f.nb_unites || 0 };
  });

  // 3. Mettre à jour le cache des ingrédients
  prodCache.ingredients[pro_id] = ingredientsRecette.map(function(i) {
    return { ing_id: i.ing_id, pro_id: pro_id, nom_ingredient: i.nom, quantite_g: i.quantite };
  });

  // 4. Mettre à jour le cache des emballages
  var emballagesPlat = [];
  Object.keys(emballagesRecette).forEach(function(cle) {
    var parts = cle.split('_');
    var poids = parts[0];
    var unite = parts[1];
    (emballagesRecette[cle] || []).forEach(function(e) {
      if (e.ing_id) {
        emballagesPlat.push({
          pro_id: pro_id, poids: poids, unite: unite,
          ing_id: e.ing_id, quantite: e.quantite || 0,
          nb_par_unite: e.nb_par_unite || 1
        });
      }
    });
  });
  prodCache.emballages[pro_id] = emballagesPlat;

  // 5. Re-trier la liste des produits selon l'ordre habituel
  donneesProduits.sort(function(a, b) {
    var colA = donneesCollections.find(function(c) { return c.col_id === a.col_id; });
    var colB = donneesCollections.find(function(c) { return c.col_id === b.col_id; });
    var gamA = donneesGammes.find(function(g) { return g.gam_id === a.gam_id; });
    var gamB = donneesGammes.find(function(g) { return g.gam_id === b.gam_id; });
    return ((colA && colA.rang || 99) - (colB && colB.rang || 99)) ||
           ((gamA && gamA.rang || 99) - (gamB && gamB.rang || 99)) ||
           (((donneesFamilles.find(function(f) { return f.fam_id === a.fam_id; }) || {}).rang || 99) -
            ((donneesFamilles.find(function(f) { return f.fam_id === b.fam_id; }) || {}).rang || 99)) ||
           ((a.nom || '').localeCompare(b.nom || ''));
  });
}

// ─── SUPPRESSION ───
async function supprimerProduit(pro_id) {
  // Vérification depuis le cache plutôt que des appels serveur
  var lotsLies = (prodCache.lots || []).filter(function(l) { return l.pro_id === pro_id; });
  if (lotsLies.length > 0) {
    afficherMsg('recettes', 'Impossible — ' + lotsLies.length + ' lot(s) de fabrication sont liés à ce produit.', 'erreur');
    return;
  }
  var ventesLiees = (prodCache.ventesLignes || []).filter(function(v) { return v.pro_id === pro_id; });
  if (ventesLiees.length > 0) {
    afficherMsg('recettes', 'Impossible — ' + ventesLiees.length + ' vente(s) sont liées à ce produit.', 'erreur');
    return;
  }
  confirmerAction('Supprimer ce produit ?', async function() {
    afficherChargement();
    var res = await appelAPIPost('deleteProduit', { pro_id: pro_id });
    if (res && res.success) {
      // Retirer du cache
      donneesProduits = donneesProduits.filter(function(p) { return p.pro_id !== pro_id; });
      delete prodCache.formats[pro_id];
      delete prodCache.ingredients[pro_id];
      delete prodCache.emballages[pro_id];
      cacherChargement();
      fermerFicheProduit();
      afficherProduits();
      afficherMsg('recettes', 'Produit supprimé.');
    } else {
      cacherChargement();
      afficherMsg('recettes', 'Erreur.', 'erreur');
    }
  });
}

// ─── CLOUDINARY / MÉDIATHÈQUE ───
var _mediaLibrary = null;
var _mediaLibraryChampId = null;
var _mediaLibraryPreviewId = null;

function ajusterHauteurTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function ouvrirMediaLibrary(champId, previewId) {
  if (typeof cloudinary === 'undefined') {
    afficherMsg('recettes', 'La librairie photo n\'est pas disponible. Rechargez la page.', 'erreur');
    return;
  }
  _mediaLibraryChampId = champId;
  _mediaLibraryPreviewId = previewId;
  _mediaLibrary = cloudinary.createMediaLibrary(
    { cloud_name: 'dfasrauyy', api_key: '' },
    {
      insertHandler: function(data) {
        if (data && data.assets && data.assets.length > 0) {
          var url = data.assets[0].secure_url;
          document.getElementById(_mediaLibraryChampId).value = url;
          var preview = document.getElementById(_mediaLibraryPreviewId);
          if (preview) preview.innerHTML = '<img src="' + url + '" class="photo-preview">';
        }
      }
    }
  );
  _mediaLibrary.show();
}

function fermerMediaLibrary() {
  var m = document.getElementById('modal-cloudinary');
  if (m) m.classList.add('cache');
}

function ouvrirCloudinary()              { ouvrirMediaLibrary('fr-image-url',      'fr-image-preview'); }
function ouvrirCloudinaryCollection()    { ouvrirMediaLibrary('fc-photo-url',       'fc-photo-preview'); }
function ouvrirCloudinaryCollectionNoel(){ ouvrirMediaLibrary('fc-photo-url-noel',  'fc-photo-preview-noel'); }
function ouvrirCloudinaryLigne()         { ouvrirMediaLibrary('fc-photo-url-ligne', 'fc-photo-preview-ligne'); }

// ─── INGRÉDIENTS DU FORMULAIRE ───
function ajouterIngredientRecette(type, nom, quantite) {
  ingredientsRecette.push({ type: type || '', nom: nom || '', quantite: quantite || 0 });
  rafraichirListeIngredientsRecette();
}

function supprimerIngredientRecette(index) {
  ingredientsRecette.splice(index, 1);
  rafraichirListeIngredientsRecette();
}

function rafraichirListeIngredientsRecette() {
  var liste = document.getElementById('liste-ingredients-recette');
  if (!liste) return;
  if (ingredientsRecette.length === 0) { liste.innerHTML = ''; return; }
  var cats = [];
  (listesDropdown.fullData || []).forEach(function(d) { if (d.cat_id && cats.indexOf(d.cat_id) === -1) cats.push(d.cat_id); });
  cats.sort();
  liste.innerHTML = ingredientsRecette.map(function(ing, i) {
    var ingsDeType = (listesDropdown.fullData || []).filter(function(d) { return d.cat_id === ing.type; });
    var inciObj = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === ing.ing_id; }) ||
                  (listesDropdown.fullData || []).find(function(d) { return d.nom_UC === ing.nom; }) || {};
    var inciVal = (inciObj.inci || '').trim();
    return '<div class="ingredient-rangee">' +
      '<select class="form-ctrl ing-type" onchange="ingredientsRecette[' + i + '].type=this.value; ingredientsRecette[' + i + '].nom=\'\'; rafraichirListeIngredientsRecette()">' +
        '<option value="">— Type —</option>' +
        cats.map(function(t) {
          return '<option value="' + t + '" ' + (ing.type === t ? 'selected' : '') + '>' + ((listesDropdown.categoriesMap || {})[t] || t) + '</option>';
        }).join('') +
      '</select>' +
      '<select class="form-ctrl ing-nom" onchange="ingredientsRecette[' + i + '].nom=this.value; ingredientsRecette[' + i + '].ing_id=(listesDropdown.fullData.find(function(d){return d.nom_UC===this.value;})||{}).ing_id||\'\'; rafraichirListeIngredientsRecette()">' +
        '<option value="">— Ingrédient —</option>' +
        ingsDeType.map(function(d) {
          return '<option value="' + d.nom_UC + '" ' + (ing.nom === d.nom_UC ? 'selected' : '') + '>' + d.nom_UC + '</option>';
        }).join('') +
      '</select>' +
      '<input type="text" class="form-ctrl ing-inci' + (inciVal ? '' : ' ing-inci-manquant') + '" readonly placeholder="INCI manquant" value="' + inciVal + '">' +
      '<input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="' + (ing.quantite || '') + '" placeholder="g" onchange="ingredientsRecette[' + i + '].quantite=parseFloat(this.value)||0">' +
      '<button class="bouton bouton-petit bouton-rouge" onclick="supprimerIngredientRecette(' + i + ')">✕</button>' +
    '</div>';
  }).join('');
}

async function chargerIngredientsBaseRecette() {
  // Cette fonction n'ajoute des ingrédients de gamme QUE pour un nouveau produit.
  // En modification, on ne touche jamais aux ingrédients du produit.
  var idActuel = document.getElementById('fr-id').value;
  if (idActuel) {
    return;
  }
  var gam_id = document.getElementById('fr-ligne').value;
  if (!gam_id) { gammesIngs = []; return; }
  var res = await appelAPI('getGammesIngredients', { gam_id: gam_id });
  gammesIngs = (res && res.success ? res.items : []).map(function(i) {
    return {
      ing_id: i.ing_id,
      type: ((listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id; }) || {}).cat_id) || '',
      nom: i.nom_ingredient,
      quantite: i.quantite_g
    };
  });
  ingredientsRecette = gammesIngs.slice();
  rafraichirListeIngredientsRecette();
}

// ─── FORMATS DU FORMULAIRE ───
function ajouterFormatRecette(poids, unite, prix, desc) {
  formatsRecette.push({ poids: poids || '', unite: unite || 'g', prix: prix || '', desc: desc || '' });
  rafraichirListeFormatsRecette();
}

function supprimerFormatRecette(index) {
  var f = formatsRecette[index];
  if (f) delete emballagesRecette[f.poids + '_' + f.unite];
  formatsRecette.splice(index, 1);
  rafraichirListeFormatsRecette();
}

function ajouterEmballageFormat(cle) {
  if (!emballagesRecette[cle]) emballagesRecette[cle] = [];
  emballagesRecette[cle].push({ ing_id: '', cat_id: '', nom: '', quantite: 0, nb_par_unite: 1 });
  rafraichirListeFormatsRecette();
}

function supprimerEmballageFormat(cle, idx) {
  if (emballagesRecette[cle]) emballagesRecette[cle].splice(idx, 1);
  rafraichirListeFormatsRecette();
}

function rafraichirListeFormatsRecette() {
  var liste = document.getElementById('liste-formats-recette');
  if (!liste) return;
  var labels = document.getElementById('labels-formats-recette');
  if (formatsRecette.length === 0) {
    liste.innerHTML = '';
    if (labels) labels.classList.add('cache');
    return;
  }
  if (labels) labels.classList.remove('cache');
  var catsEmb = ['CAT-015', 'CAT-016', 'CAT-017', 'CAT-014'];
  liste.innerHTML = formatsRecette.map(function(f, i) {
    var cle = f.poids + '_' + f.unite;
    var embs = emballagesRecette[cle] || [];
    var lignesEmb = embs.map(function(e, j) {
      var catEmb = e.cat_id || catsEmb.find(function(c) {
        return (listesDropdown.fullData || []).find(function(d) { return d.ing_id === e.ing_id && d.cat_id === c; });
      }) || '';
      var ingsDecat = catEmb ? (listesDropdown.fullData || []).filter(function(d) { return d.cat_id === catEmb; }) : [];
      return '<div class="ingredient-rangee">' +
        '<select class="form-ctrl" onchange="emballagesRecette[\'' + cle + '\'][' + j + '].cat_id=this.value; rafraichirListeFormatsRecette()">' +
          '<option value="">— Catégorie —</option>' +
          catsEmb.map(function(c) { return '<option value="' + c + '" ' + (catEmb === c ? 'selected' : '') + '>' + ((listesDropdown.categoriesMap || {})[c] || c) + '</option>'; }).join('') +
        '</select>' +
        '<select class="form-ctrl" onchange="emballagesRecette[\'' + cle + '\'][' + j + '].ing_id=this.value; emballagesRecette[\'' + cle + '\'][' + j + '].nom=(listesDropdown.fullData.find(function(d){return d.ing_id===this.value;})||{}).nom_UC||\'\'; emballagesRecette[\'' + cle + '\'][' + j + '].nb_par_unite=1;">' +
          '<option value="">— Nom UC —</option>' +
          ingsDecat.map(function(d) { return '<option value="' + d.ing_id + '" ' + (d.ing_id === e.ing_id ? 'selected' : '') + '>' + d.nom_UC + '</option>'; }).join('') +
        '</select>' +
        '<button class="bouton bouton-petit bouton-rouge" onclick="supprimerEmballageFormat(\'' + cle + '\',' + j + ')">✕</button>' +
      '</div>';
    }).join('');
    return '<div class="ingredient-rangee">' +
      '<input type="text" inputmode="decimal" class="form-ctrl" value="' + (f.poids || '') + '" placeholder="Contenu net" onchange="formatsRecette[' + i + '].poids=this.value">' +
      '<select class="form-ctrl" onchange="formatsRecette[' + i + '].unite=this.value">' +
        '<option value="g" ' + (f.unite === 'g' ? 'selected' : '') + '>g</option>' +
        '<option value="ml" ' + (f.unite === 'ml' ? 'selected' : '') + '>ml</option>' +
      '</select>' +
      '<input type="text" inputmode="decimal" class="form-ctrl" value="' + (f.nb_unites || '') + '" placeholder="Nb unités produits" onchange="formatsRecette[' + i + '].nb_unites=parseInt(this.value)||0">' +
      '<input type="text" inputmode="decimal" class="form-ctrl" value="' + (f.prix || '') + '" placeholder="Prix $" onchange="formatsRecette[' + i + '].prix=parseFloat(this.value)||0">' +
      '<button class="bouton bouton-petit bouton-rouge" onclick="supprimerFormatRecette(' + i + ')">✕</button>' +
    '</div>' +
    '<div style="margin-top:12px;margin-bottom:4px;padding:6px 8px;background:var(--beige-fonce);border-left:3px solid var(--primary);font-size:0.75rem;color:var(--gris);text-transform:uppercase;letter-spacing:0.08em;font-weight:600">' +
      'Contenant et emballage par unité' +
    '</div>' +
    lignesEmb +
    '<button type="button" class="bouton bouton-petit bouton-vert-pale" onclick="ajouterEmballageFormat(\'' + cle + '\')">+ Ajouter</button>';
  }).join('');
}

// ─── COULEUR HEX ───
function apercuCouleurRecette(input) {
  var val = input.value.trim();
  if (/^[0-9a-fA-F]{6}$/.test(val)) { val = '#' + val; input.value = val; }
  var apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercu.style.background = /^#[0-9a-fA-F]{6}$/.test(val) ? val : 'var(--beige)';
  document.getElementById('fr-couleur').value = val;
}

/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-produits.js
   Version finale — étapes 1 à 6
   ═══════════════════════════════════════ */

// ─── ÉTAT ───
var donneesProduits     = [];
var produitActif        = null;
var scrollAvantProduit  = 0;
var collectionsDisponibles = {};

var formatsRecette      = [];   // [ {format_id, poids, unite, prix, nb_unites} ]
var ingredientsRecette  = [];   // [ {ing_id, type, nom, quantite} ]
var emballagesRecette   = {};   // { format_id: [ {ing_id, cat_id, nom, quantite, nb_par_unite} ] }
var gammesIngs          = [];

// Sauvegarde temporaire de l'état complet du formulaire pour ne rien perdre lors d'un modal
var saisieProduitEnCours = null;

// Cache mémoire
var prodCache = {
  charge:         false,
  ingredients:    {},
  formats:        {},
  emballages:     {},
  stock:          [],
  lots:           [],
  ventesLignes:   []
};

// ─── HELPERS ───
function genererFormatId() {
  return 'FMT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

// ─── VUES ───
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

  var formatsMap = {};
  if (res[1] && res[1].success) {
    (res[1].items || []).forEach(function(f) {
      if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
      formatsMap[f.pro_id].push({
        format_id: f.format_id,
        poids: f.poids,
        unite: f.unite,
        prix_vente: f.prix_vente,
        nb_unites: f.nb_unites
      });
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

  var ingsMap = {};
  if (res[2] && res[2].success) {
    (res[2].items || []).forEach(function(i) {
      if (!ingsMap[i.pro_id]) ingsMap[i.pro_id] = [];
      ingsMap[i.pro_id].push(i);
    });
  }
  prodCache.ingredients = ingsMap;

  var embMap = {};
  if (res[3] && res[3].success) {
    (res[3].items || []).forEach(function(e) {
      if (!embMap[e.pro_id]) embMap[e.pro_id] = [];
      embMap[e.pro_id].push(e);
    });
  }
  prodCache.emballages = embMap;

  prodCache.stock = (res[4] && res[4].success) ? res[4].items : [];
  listesDropdown.stock = prodCache.stock;
  prodCache.lots         = (res[5] && res[5].success) ? res[5].items : [];
  prodCache.ventesLignes = (res[6] && res[6].success) ? res[6].items : [];

  prodCache.charge = true;
  cacherChargement();
}
function calculerInventaireProduit(pro_id) {
  var inv = {};
  (prodCache.lots || []).forEach(function(l) {
    if (String(l.pro_id) !== String(pro_id)) return;
    var dispo = (parseInt(l.nb_unites) || 0) - (parseInt(l.nb_unites_vendu) || 0);
    if (dispo <= 0) return;
    if (!l.format_poids || !l.format_unite) return;
    var cle = l.format_poids + '_' + l.format_unite;
    inv[cle] = (inv[cle] || 0) + dispo;
  });
  return inv;
}

async function chargerProduitsData() {
  await chargerCacheProduits();
  afficherProduits();
}

async function actualiserProduits() {
  prodCache.charge = false;
  await chargerCacheProduits();
  afficherProduits();
  afficherMsg('produits', '✅ Données actualisées.');
}

// ─── AFFICHAGE GRILLE ───
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
    var gamId = pro.gam_id || '';
    var gamNom = (gam && gam.nom) || '';
    if (!parCollection[colId].gammes[gamId]) {
      parCollection[colId].gammes[gamId] = { nom: gamNom, rang: (gam && gam.rang) || 99, familles: {} };
    }
    var fam = donneesFamilles.find(function(f) { return f.fam_id === pro.fam_id; });
    var famId = pro.fam_id || '__sans-famille__';
    var famNom = (fam && fam.nom) || '';
    if (!parCollection[colId].gammes[gamId].familles[famId]) {
      parCollection[colId].gammes[gamId].familles[famId] = { nom: famNom, rang: (fam && fam.rang) || 99, produits: [] };
    }
    parCollection[colId].gammes[gamId].familles[famId].produits.push(pro);
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

      var famillesTriees = Object.values(gamData.familles).sort(function(a, b) { return (a.rang || 99) - (b.rang || 99); });
      famillesTriees.forEach(function(famData) {
        if (famData.nom) {
          var titreFam = document.createElement('div');
          titreFam.className = 'recette-famille-titre';
          titreFam.style.cssText = 'font-size:0.85rem;letter-spacing:0.08em;color:var(--gris);margin:14px 0 6px;text-transform:uppercase;font-weight:500';
          titreFam.textContent = famData.nom;
          secGam.appendChild(titreFam);
        }
        var grilleInner = document.createElement('div');
        grilleInner.className = 'recette-cartes-grille';

        famData.produits.forEach(function(pro) {
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

          var inv = calculerInventaireProduit(pro.pro_id);

          var formatsHTML = (pro.formats && pro.formats.length)
            ? '<div class="carte-formats">' + [].concat(pro.formats).sort(function(a, b) { return parseFloat(a.poids) - parseFloat(b.poids); }).map(function(f) {
                var qteInv = inv[f.poids + '_' + f.unite] || 0;
                var invHTML = '<span class="carte-format-prix">(' + qteInv + ' dispo)</span>';
                return '<div class="carte-format-tag"><span class="carte-format-prix">' + parseFloat(f.prix_vente).toFixed(2).replace('.', ',') + ' $</span><span class="carte-format-sep"></span><span class="carte-format-prix">' + f.poids + ' ' + f.unite + '</span>' + invHTML + '</div>';
              }).join('') + '</div>'
            : '';

          // Badge de statut
          var badgeStatut = 'Test';
          var badgeClass = 'test';
          if (pro.statut === 'public') { badgeStatut = 'Public'; badgeClass = ''; }
          else if (pro.statut === 'archive') { badgeStatut = 'Archivé'; badgeClass = 'archive'; }

          div.innerHTML =
            '<div class="carte-visuel">' +
              '<span class="carte-statut-badge' + (badgeClass ? ' ' + badgeClass : '') + '">' + badgeStatut + '</span>' +
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
      });

      secCol.appendChild(secGam);
    });

    if (grille) grille.appendChild(secCol);
  });

  peuplerFiltresRecettes();
}

function injecterBoutonActualiser() {
  if (document.getElementById('btn-actualiser-produits')) return;
  var btnNouveau = document.getElementById('btn-nouvelle-recette');
  if (!btnNouveau || !btnNouveau.parentNode) return;
  var btn = document.createElement('button');
  btn.id = 'btn-actualiser-produits';
  btn.className = 'bouton2';
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
    bar.innerHTML += '<button class="filtre-btn" data-col="' + col.nom + '" onclick="onFiltreCollectionBtn(this, \'' + col.nom.replace(/'/g, "\\'") + '\')">' + col.nom + '</button>';
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
        bar.innerHTML += '<button class="filtre-btn" onclick="onFiltreGammeBtn(this, \'' + g.nom.replace(/'/g, "\\'") + '\')">' + g.nom + '</button>';
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

// ─── COLLECTIONS / GAMMES / FAMILLES ───
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

// ─── OUVRIR LA FICHE D'UN PRODUIT ───
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

  var nbSansInci = 0;
  ings.forEach(function(i) {
    var inciObj = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; });
    if (!inciObj || !inciObj.inci) nbSansInci++;
  });
  var avertissementInciHtml = nbSansInci > 0
    ? '<div class="avertissement-inci" style="background:#fff4e6;border-left:4px solid var(--or);padding:14px 18px;margin:0 0 20px;border-radius:4px;color:var(--gris-fonce);font-size:0.9rem">' +
      '⚠ Cette recette a <strong>' + nbSansInci + ' ingrédient' + (nbSansInci > 1 ? 's' : '') + ' sans code INCI</strong>. Cliquez sur l\'ingrédient concerné pour le compléter.' +
      '</div>'
    : '';

  var ingsHtml = ings.length
    ? ings.slice().sort(function(a, b) { return b.quantite_g - a.quantite_g; }).map(function(i) {
        var inciObj  = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; });
        var inciCode = (inciObj && inciObj.inci) || '';
        var sansInci = !inciCode;
        var s2 = stock.find(function(st) { return st.ing_id === i.ing_id; });
        var prixParG = (s2 && s2.prix_par_g_reel) || 0;
        var coutIng = prixParG > 0 ? (i.quantite_g * prixParG).toFixed(2) + ' $' : '⚠';
        var clickAttr = sansInci ? ' onclick="allerVersInciDepuisProduit(\'' + (i.ing_id || '') + '\')" style="cursor:pointer"' : '';
        var inciFormate = inciCode ? inciCode.toLowerCase().replace(/^([a-zà-ÿ])/, function(c) { return c.toUpperCase(); }) : '';
        return '<div class="fiche-ingredient"' + clickAttr + '>' +
          '<span class="fiche-ing-nom' + (sansInci ? ' fiche-label-manquant' : '') + '">' + (sansInci ? '⚠ ' : '') + i.nom_ingredient + '</span>' +
          '<span class="fiche-ing-inci">' + inciFormate + '</span>' +
          '<span class="fiche-ing-qte">' + i.quantite_g + ' g</span>' +
          '<span class="fiche-ing-qte">' + coutIng + '</span>' +
          '</div>';
      }).join('')
    : '<div class="fiche-vide">Aucun ingrédient</div>';

  var inciLabelHtml = construireListeInciEtiquette(ings);

  // Affichage cure et surgras (gérer N/A)
  var cureAffichage = (pro.cure === 'N/A' || pro.cure === 'na') ? 'Sans cure' : ((pro.cure || '—') + ' jours');
  var surgrasAffichage = (pro.surgras === 'N/A' || pro.surgras === 'na') ? 'Sans surgras' : (pro.surgras || '—');

  // Détecter bouton Supprimer ou Archiver
  var aHistorique = produitAHistorique(pro_id);
  var labelBtnSupp = aHistorique ? 'Archiver' : 'Supprimer';

  document.getElementById('fiche-recette-titre').textContent = pro.nom || '—';
  document.getElementById('fiche-recette-contenu').innerHTML =
    avertissementInciHtml +
    '<div class="fiche-visuel">' +
      (pro.image_url ? '<img src="' + pro.image_url + '" class="fiche-visuel-photo">' : '') +
      (pro.image_noel_url ? '<img src="' + pro.image_noel_url + '" class="fiche-visuel-photo">' : '') +
      '<div class="fiche-visuel-hex" style="background:' + (pro.couleur_hex || 'var(--beige)') + '"></div>' +
    '</div>' +
    '<div class="fiche-grille">' +
      '<div class="fiche-champ"><span class="fiche-label">Collection</span><span class="fiche-valeur">' + ((col && col.nom) || '—') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Gamme</span><span class="fiche-valeur">' + ((gam && gam.nom) || '—') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Statut</span><span class="fiche-valeur">' + (pro.statut || 'test') + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Cure</span><span class="fiche-valeur">' + cureAffichage + '</span></div>' +
      '<div class="fiche-champ"><span class="fiche-label">Surgras</span><span class="fiche-valeur">' + surgrasAffichage + '</span></div>' +
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
    '';

  // Mettre à jour le bouton Supprimer/Archiver dans la barre d'actions du bas
  var btnSupp = document.querySelector('#fiche-recette .form-body-actions .bouton-rouge');
  if (btnSupp) {
    btnSupp.textContent = labelBtnSupp;
    var conteneurActions = btnSupp.parentElement;
    if (conteneurActions && !conteneurActions.querySelector('[data-bouton-export]')) {
      var btnGraphiste = document.createElement('button');
      btnGraphiste.className = 'bouton bouton-vert-pale';
      btnGraphiste.dataset.boutonExport = 'graphiste';
      btnGraphiste.textContent = 'Pour graphiste';
      btnGraphiste.onclick = ouvrirModalExportGraphiste;
      conteneurActions.appendChild(btnGraphiste);

      var btnPdf = document.createElement('button');
      btnPdf.className = 'bouton bouton-vert-pale';
      btnPdf.dataset.boutonExport = 'pdf';
      btnPdf.textContent = 'Fiche recette (PDF)';
      btnPdf.onclick = ouvrirModalExportPdf;
      conteneurActions.appendChild(btnPdf);
    }
  }

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
    // Préférer format_id si dispo, sinon fallback sur poids+unite
    var embsDuFormat = embItems.filter(function(e) { return e.format_id === f.format_id; });
    var coutContenant = 0, coutEmballage = 0;
    embsDuFormat.forEach(function(e) {
      var s = stock.find(function(st) { return st.ing_id === e.ing_id; });
      var prix = (s && s.prix_par_g_reel) || 0;
      var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === e.ing_id; });
      if (ing && ing.cat_id === CAT_CONTENANT) coutContenant += prix;
      else if (ing && CATS_EMBALLAGE.indexOf(ing.cat_id) >= 0) coutEmballage += prix;
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

function construireListeInciEtiquette(ings) {
  var avecInci = ings
    .map(function(i) {
      var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; });
      return { i: i, o: o };
    })
    .filter(function(x) { return x.o && x.o.inci; })
    .slice()
    .sort(function(a, b) { return b.i.quantite_g - a.i.quantite_g; });

  if (!avecInci.length) return '<div class="fiche-vide">Aucun code INCI disponible</div>';

  var notesOlfactives = [];
  var fragranceVue = false;
  var morceaux = [];

  avecInci.forEach(function(x) {
    var inci = x.o.inci.trim();
    var estFragrance = inci.toLowerCase() === 'fragrance';
    if (estFragrance) {
      if (!fragranceVue) {
        morceaux.push({ position: morceaux.length, type: 'fragrance' });
        fragranceVue = true;
      }
      if (x.o.note_olfactive && x.o.note_olfactive.trim()) {
        notesOlfactives.push(x.o.note_olfactive.trim());
      }
    } else {
      morceaux.push({ position: morceaux.length, type: 'inci', valeur: inci });
    }
  });

  var liste = morceaux.map(function(m) {
    if (m.type === 'inci') return m.valeur.toLowerCase().replace(/^([a-zà-ÿ])/, function(c) { return c.toUpperCase(); });
    if (notesOlfactives.length) return 'Fragrance (' + notesOlfactives.join(', ').toLowerCase() + ')';
    return 'Fragrance';
  }).join(', ');

  return '<div class="inci-label-texte">' + liste + '</div>';
}

function allerVersInciDepuisProduit(ing_id) {
  if (!produitActif) return;
  window._produitRetourInci = produitActif.pro_id;
  afficherSection('inci', null);
  setTimeout(function() {
    var elRecherche = document.getElementById('inci-recherche');
    if (elRecherche && ing_id) {
      var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === ing_id; });
      if (ing && ing.nom_UC) {
        elRecherche.value = ing.nom_UC;
        if (typeof inciAppliquerFiltres === 'function') inciAppliquerFiltres();
      }
    }
    var btnRetour = document.getElementById('btn-retour-recette');
    if (btnRetour) btnRetour.classList.remove('cache');
  }, 200);
}

function retourRecetteDepuisInci() {
  var pro_id = window._produitRetourInci;
  if (!pro_id) return;
  var btnRetour = document.getElementById('btn-retour-recette');
  if (btnRetour) btnRetour.classList.add('cache');
  afficherSection('produits', null);
  setTimeout(function() {
    ouvrirFicheProduit(pro_id);
    window._produitRetourInci = null;
  }, 200);
}

// ─── HISTORIQUE D'UN PRODUIT ───
function produitAHistorique(pro_id) {
  var aLot = (prodCache.lots || []).some(function(l) { return l.pro_id === pro_id; });
  if (aLot) return true;
  var aVente = (prodCache.ventesLignes || []).some(function(v) { return v.pro_id === pro_id; });
  return aVente;
}

// ─── FERMETURE / ÉDITION / SUPPRESSION ───
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
  supprimerOuArchiverProduit(produitActif.pro_id);
}

// ─── FORMULAIRE — NOUVEAU PRODUIT ───
async function ouvrirFormProduit() {
  produitsViderEtatFormulaire();

  document.getElementById('form-recettes-titre').textContent = 'Nouveau produit';
  document.getElementById('fr-id').value = '';
  ['fr-nom', 'fr-couleur', 'fr-cure', 'fr-description', 'fr-instructions', 'fr-notes', 'fr-surgras', 'fr-avertissement', 'fr-mode-emploi'].forEach(function(id) {
    var e = document.getElementById(id); if (e) e.value = '';
  });
  var elDescEmb = document.getElementById('fr-desc-emballage');
  if (elDescEmb) elDescEmb.value = '';

  // Réinitialiser les boutons "Pas applicable"
  var cbCure = document.getElementById('fr-cure-na');
  var cbSurgras = document.getElementById('fr-surgras-na');
  if (cbCure) { cbCure.checked = false; appliquerCureNA(); }
  if (cbSurgras) { cbSurgras.checked = false; appliquerSurgrasNA(); }

  document.getElementById('fr-statut').value = 'test';
  // S'assurer que l'option "Archivé" est dans le menu
  injecterOptionArchive();

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
  apercuCouleurRecette(document.getElementById('fr-couleur-visible'));

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

// Injecte l'option "Archivé" dans le sélecteur de statut si elle n'y est pas
function injecterOptionArchive() {
  var sel = document.getElementById('fr-statut');
  if (!sel) return;
  var existe = Array.from(sel.options).some(function(o) { return o.value === 'archive'; });
  if (!existe) {
    var opt = document.createElement('option');
    opt.value = 'archive';
    opt.textContent = 'Archivé';
    sel.appendChild(opt);
  }
}

// ─── FORMULAIRE — MODIFICATION ───
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
  document.getElementById('fr-couleur-visible').value = (pro.couleur_hex || '').replace('#', '');
  apercuCouleurRecette(document.getElementById('fr-couleur-visible'));

  // Cure
  var cureValue = pro.cure;
  var cbCure = document.getElementById('fr-cure-na');
  var inputCure = document.getElementById('fr-cure');
  if (cureValue === 'N/A' || cureValue === 'na') {
    if (cbCure) cbCure.checked = true;
    if (inputCure) inputCure.value = '';
  } else {
    if (cbCure) cbCure.checked = false;
    if (inputCure) inputCure.value = cureValue || '';
  }
  appliquerCureNA();

  // Surgras
  var surgrasValue = pro.surgras;
  var cbSurgras = document.getElementById('fr-surgras-na');
  var inputSurgras = document.getElementById('fr-surgras');
  if (surgrasValue === 'N/A' || surgrasValue === 'na') {
    if (cbSurgras) cbSurgras.checked = true;
    if (inputSurgras) inputSurgras.value = '';
  } else {
    if (cbSurgras) cbSurgras.checked = false;
    if (inputSurgras) inputSurgras.value = surgrasValue || '';
  }
  appliquerSurgrasNA();

  document.getElementById('fr-description').value = pro.description || '';
  var descEmb = document.getElementById('fr-desc-emballage');
  if (descEmb) descEmb.value = pro.desc_emballage || '';
  document.getElementById('fr-instructions').value = pro.instructions || '';
  document.getElementById('fr-notes').value = pro.notes || '';
  var elAvert = document.getElementById('fr-avertissement');
  if (elAvert) elAvert.value = pro.avertissement || '';
  var elMode = document.getElementById('fr-mode-emploi');
  if (elMode) elMode.value = pro.mode_emploi || '';

  injecterOptionArchive();
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

  // Charger les formats avec format_id (générer un id si manquant)
  formatsRecette = formats.map(function(f) {
    return {
      format_id: f.format_id || genererFormatId(),
      poids: f.poids,
      unite: f.unite,
      prix: f.prix_vente,
      desc: '',
      nb_unites: f.nb_unites || 0
    };
  });

  // Charger les emballages indexés par format_id
  emballagesRecette = {};
  formatsRecette.forEach(function(f) {
    var embsCeFormat = embItems.filter(function(e) { return e.format_id === f.format_id; });
    emballagesRecette[f.format_id] = embsCeFormat.map(function(e) {
      var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === e.ing_id; });
      return {
        ing_id: e.ing_id,
        cat_id: (ing && ing.cat_id) || '',
        nom: (ing && ing.nom_UC) || ''
      };
    });
  });

  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  produitsAfficherVue('formulaire');
  window.scrollTo(0, 0);
  var contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTo(0, 0);
}
function modifierRecette(id) { return modifierProduit(id); }

// ─── BOUTONS PAS APPLICABLE (CURE / SURGRAS) ───
function appliquerCureNA() {
  var cb = document.getElementById('fr-cure-na');
  var input = document.getElementById('fr-cure');
  if (!cb || !input) return;
  if (cb.checked) {
    input.disabled = true;
    input.value = '';
    input.placeholder = 'Sans cure';
  } else {
    input.disabled = false;
    input.placeholder = '';
  }
}

function appliquerSurgrasNA() {
  var cb = document.getElementById('fr-surgras-na');
  var input = document.getElementById('fr-surgras');
  if (!cb || !input) return;
  if (cb.checked) {
    input.disabled = true;
    input.value = '';
    input.placeholder = 'Sans surgras';
  } else {
    input.disabled = false;
    input.placeholder = '';
  }
}

// ─── ENREGISTREMENT ───
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

    // Cure et surgras avec gestion N/A
    var cbCure = document.getElementById('fr-cure-na');
    var cureFinal = (cbCure && cbCure.checked) ? 'N/A' : (parseInt(document.getElementById('fr-cure').value) || 0);
    var cbSurgras = document.getElementById('fr-surgras-na');
    var surgrasFinal = (cbSurgras && cbSurgras.checked) ? 'N/A' : (document.getElementById('fr-surgras').value || '');

    var dernierNumPro = donneesProduits.length ? Math.max.apply(null, donneesProduits.map(function(p) { return parseInt((p.pro_id || '').replace('PRO-', '')) || 0; })) : 0;
    var d = {
      pro_id: id || ('PRO-' + String(dernierNumPro + 1).padStart(3, '0')),
      col_id: col_id,
      gam_id: gam_id,
      fam_id: (document.getElementById('fr-famille') || {}).value || '',
      nom: ((document.getElementById('fr-nom') || {}).value || '').toUpperCase(),
      couleur_hex: document.getElementById('fr-couleur').value || '',
      nb_unites: 1,
      cure: cureFinal,
      description: document.getElementById('fr-description').value,
      desc_emballage: (document.getElementById('fr-desc-emballage') || {}).value || '',
      instructions: document.getElementById('fr-instructions').value,
      notes: document.getElementById('fr-notes').value,
      avertissement: (document.getElementById('fr-avertissement') || {}).value || '',
      mode_emploi: (document.getElementById('fr-mode-emploi') || {}).value || '',
      surgras: surgrasFinal,
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
        return {
          format_id: f.format_id || genererFormatId(),
          poids: f.poids,
          unite: f.unite,
          prix_vente: f.prix,
          nb_unites: f.nb_unites || 0
        };
      })
    };

    if (!d.nom)    return erreur('Le nom est requis.');
    if (!d.col_id) return erreur('La collection est requise.');
    if (!d.gam_id) return erreur('La gamme est requise.');

    // Refus des ingrédients à 0g
    var ingredientZero = ingredientsRecette.find(function(i) {
      return !i.quantite || parseFloat(i.quantite) <= 0;
    });
    if (ingredientZero) {
      return erreur('L\'ingrédient « ' + (ingredientZero.nom || '?') + ' » a une quantité de 0g — veuillez la saisir ou retirer l\'ingrédient.');
    }

    var res = await appelAPIPost('saveProduit', d);
    if (!res || !res.success) return erreur('Erreur à l\'enregistrement.');

    // Mettre à jour les format_id locaux avec les vrais IDs séquentiels retournés par le backend
    var mapping = res.formatIdMap || {};
    formatsRecette.forEach(function(f) {
      if (mapping[f.format_id] && mapping[f.format_id] !== f.format_id) {
        var ancienId = f.format_id;
        var nouveauId = mapping[ancienId];
        f.format_id = nouveauId;
        if (emballagesRecette[ancienId]) {
          emballagesRecette[nouveauId] = emballagesRecette[ancienId];
          delete emballagesRecette[ancienId];
        }
      }
    });

    // Sauvegarder TOUS les emballages d'un coup (un seul appel) — touche uniquement Produits_Formats_Emballages_v2
    var tousLesEmballages = [];
    formatsRecette.forEach(function(f) {
      var embs = emballagesRecette[f.format_id] || [];
      embs.forEach(function(e) {
        if (e && e.ing_id && f.format_id) {
          tousLesEmballages.push({ format_id: f.format_id, ing_id: e.ing_id });
        }
      });
    });
    await appelAPIPost('saveFormatsEmballages', {
      pro_id: d.pro_id,
      emballages: tousLesEmballages
    });

    majCacheApresSauvegarde(d);
    fermerFormProduit();

    // Après sauvegarde → ouvrir la fiche pour vérifier le résultat (selon LOGIQUE-PRODUITS.md)
    afficherProduits();
    setTimeout(function() {
      ouvrirFicheProduit(d.pro_id);
    }, 100);

    afficherMsg('recettes', id ? 'Produit mis à jour.' : 'Produit créé.');
    reactiverBouton();
  } catch (err) {
    erreur('Erreur inattendue.');
  }
}

function majCacheApresSauvegarde(d) {
  var pro_id = d.pro_id;

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
      return { format_id: f.format_id, poids: f.poids, unite: f.unite, prix_vente: f.prix, nb_unites: f.nb_unites || 0 };
    })
  };
  if (idxProduit >= 0) {
    donneesProduits[idxProduit] = nouveauProduit;
  } else {
    donneesProduits.push(nouveauProduit);
  }

  prodCache.formats[pro_id] = formatsRecette.map(function(f) {
    return { format_id: f.format_id, poids: f.poids, unite: f.unite, prix_vente: f.prix, nb_unites: f.nb_unites || 0 };
  });
  prodCache.ingredients[pro_id] = ingredientsRecette.map(function(i) {
    return { ing_id: i.ing_id, pro_id: pro_id, nom_ingredient: i.nom, quantite_g: i.quantite };
  });

  var emballagesPlat = [];
  Object.keys(emballagesRecette).forEach(function(format_id) {
    var f = formatsRecette.find(function(x) { return x.format_id === format_id; });
    if (!f) return;
    (emballagesRecette[format_id] || []).forEach(function(e) {
      if (e.ing_id) {
        emballagesPlat.push({
          pro_id: pro_id,
          format_id: format_id,
          ing_id: e.ing_id
        });
      }
    });
  });
  prodCache.emballages[pro_id] = emballagesPlat;

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

// ─── SUPPRESSION OU ARCHIVAGE ───
function supprimerProduit(pro_id) { supprimerOuArchiverProduit(pro_id); }

function supprimerOuArchiverProduit(pro_id) {
  if (produitAHistorique(pro_id)) {
    // Archiver
    var nbLots = (prodCache.lots || []).filter(function(l) { return l.pro_id === pro_id; }).length;
    var nbVentes = (prodCache.ventesLignes || []).filter(function(v) { return v.pro_id === pro_id; }).length;
    var raisons = [];
    if (nbLots > 0)   raisons.push(nbLots + ' lot(s) de fabrication');
    if (nbVentes > 0) raisons.push(nbVentes + ' vente(s)');
    confirmerAction(
      'Ce produit a un historique (' + raisons.join(', ') + '). Il ne peut pas être supprimé. Voulez-vous l\'archiver ? Il restera dans l\'admin mais ne sera plus visible sur le site public.',
      async function() {
        afficherChargement();
        var pro = donneesProduits.find(function(p) { return p.pro_id === pro_id; });
        if (!pro) { cacherChargement(); return; }
        var d = Object.assign({}, pro, { statut: 'archive' });
        // Re-formater les ingrédients/formats pour saveProduit
        d.ingredients = (prodCache.ingredients[pro_id] || []).map(function(i) {
          return { ing_id: i.ing_id, nom_ingredient: i.nom_ingredient, quantite_g: i.quantite_g };
        });
        d.formats = (prodCache.formats[pro_id] || []).map(function(f) {
          return { format_id: f.format_id, poids: f.poids, unite: f.unite, prix_vente: f.prix_vente, nb_unites: f.nb_unites };
        });
        var res = await appelAPIPost('saveProduit', d);
        if (res && res.success) {
          // Mettre à jour le cache
          var idx = donneesProduits.findIndex(function(p) { return p.pro_id === pro_id; });
          if (idx >= 0) donneesProduits[idx].statut = 'archive';
          cacherChargement();
          fermerFicheProduit();
          afficherProduits();
          afficherMsg('recettes', 'Produit archivé.');
        } else {
          cacherChargement();
          afficherMsg('recettes', 'Erreur.', 'erreur');
        }
      }
    );
  } else {
    // Supprimer pour de vrai
    confirmerAction('Supprimer ce produit ?', async function() {
      afficherChargement();
      var res = await appelAPIPost('deleteProduit', { pro_id: pro_id });
      if (res && res.success) {
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
}

// ─── MÉDIATHÈQUE ───
function ajusterHauteurTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

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
  cats.sort(function(a, b) {
    var na = (listesDropdown.categoriesMap || {})[a] || a;
    var nb = (listesDropdown.categoriesMap || {})[b] || b;
    return na.localeCompare(nb, 'fr');
  });
  liste.innerHTML = ingredientsRecette.map(function(ing, i) {
    var ingsDeType = (listesDropdown.fullData || []).filter(function(d) { return d.cat_id === ing.type; });
    var inciObj = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === ing.ing_id; }) ||
                  (listesDropdown.fullData || []).find(function(d) { return d.nom_UC === ing.nom; }) || {};
    var inciVal = (inciObj.inci || '').trim();
    return '<div class="ingredient-rangee">' +
      '<select class="form-ctrl ing-type" onchange="onChangeIngredientType(' + i + ', this.value)">' +
        '<option value="">— Type —</option>' +
        cats.map(function(t) {
          return '<option value="' + t + '" ' + (ing.type === t ? 'selected' : '') + '>' + ((listesDropdown.categoriesMap || {})[t] || t) + '</option>';
        }).join('') +
        '<option value="__nouvelle_cat__">+ Nouvelle catégorie...</option>' +
      '</select>' +
      '<select class="form-ctrl ing-nom" onchange="onChangeIngredientNom(' + i + ', this.value)">' +
        '<option value="">— Ingrédient —</option>' +
        ingsDeType.map(function(d) {
          return '<option value="' + d.nom_UC + '" ' + (ing.nom === d.nom_UC ? 'selected' : '') + '>' + d.nom_UC + '</option>';
        }).join('') +
        '<option value="__nouvel_ing__">+ Nouvel ingrédient...</option>' +
      '</select>' +
      '<input type="text" class="form-ctrl ing-inci' + (inciVal ? '' : ' ing-inci-manquant') + '" readonly placeholder="INCI manquant" value="' + inciVal + '">' +
      '<input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="' + (ing.quantite || '') + '" placeholder="g" onchange="ingredientsRecette[' + i + '].quantite=parseFloat(this.value)||0">' +
      '<button class="bouton bouton-petit bouton-rouge" onclick="supprimerIngredientRecette(' + i + ')">✕</button>' +
    '</div>';
  }).join('');
}

function onChangeIngredientType(i, val) {
  if (val === '__nouvelle_cat__') {
    sauvegarderEtatFormulaire();
    ouvrirModalNouvelleCategorieUC(i);
    return;
  }
  ingredientsRecette[i].type = val;
  ingredientsRecette[i].nom = '';
  ingredientsRecette[i].ing_id = '';
  rafraichirListeIngredientsRecette();
}

function onChangeIngredientNom(i, val) {
  if (val === '__nouvel_ing__') {
    sauvegarderEtatFormulaire();
    ouvrirModalNouvelIngredient(i);
    return;
  }
  ingredientsRecette[i].nom = val;
  ingredientsRecette[i].ing_id = ((listesDropdown.fullData || []).find(function(d) { return d.nom_UC === val; }) || {}).ing_id || '';
  rafraichirListeIngredientsRecette();
}

// ─── SAUVEGARDE / RESTAURATION DE L'ÉTAT DU FORMULAIRE ───
function sauvegarderEtatFormulaire() {
  saisieProduitEnCours = {
    nom: (document.getElementById('fr-nom') || {}).value || '',
    col_id: (document.getElementById('fr-collection') || {}).value || '',
    gam_id: (document.getElementById('fr-ligne') || {}).value || '',
    fam_id: (document.getElementById('fr-famille') || {}).value || '',
    description: (document.getElementById('fr-description') || {}).value || '',
    desc_emballage: (document.getElementById('fr-desc-emballage') || {}).value || '',
    instructions: (document.getElementById('fr-instructions') || {}).value || '',
    notes: (document.getElementById('fr-notes') || {}).value || '',
    avertissement: (document.getElementById('fr-avertissement') || {}).value || '',
    mode_emploi: (document.getElementById('fr-mode-emploi') || {}).value || '',
    cure: (document.getElementById('fr-cure') || {}).value || '',
    cure_na: !!(document.getElementById('fr-cure-na') || {}).checked,
    surgras: (document.getElementById('fr-surgras') || {}).value || '',
    surgras_na: !!(document.getElementById('fr-surgras-na') || {}).checked,
    couleur_visible: (document.getElementById('fr-couleur-visible') || {}).value || '',
    couleur: (document.getElementById('fr-couleur') || {}).value || '',
    statut: (document.getElementById('fr-statut') || {}).value || 'test',
    image_url: (document.getElementById('fr-image-url') || {}).value || '',
    image_noel_url: (document.getElementById('fr-image-url-noel') || {}).value || '',
    ingredients: JSON.parse(JSON.stringify(ingredientsRecette)),
    formats: JSON.parse(JSON.stringify(formatsRecette)),
    emballages: JSON.parse(JSON.stringify(emballagesRecette))
  };
}

function restaurerEtatFormulaire() {
  if (!saisieProduitEnCours) return;
  var s = saisieProduitEnCours;
  if (document.getElementById('fr-nom')) document.getElementById('fr-nom').value = s.nom;
  if (document.getElementById('fr-collection')) document.getElementById('fr-collection').value = s.col_id;
  if (document.getElementById('fr-description')) document.getElementById('fr-description').value = s.description;
  if (document.getElementById('fr-desc-emballage')) document.getElementById('fr-desc-emballage').value = s.desc_emballage;
  if (document.getElementById('fr-instructions')) document.getElementById('fr-instructions').value = s.instructions;
  if (document.getElementById('fr-notes')) document.getElementById('fr-notes').value = s.notes;
  if (document.getElementById('fr-avertissement')) document.getElementById('fr-avertissement').value = s.avertissement;
  if (document.getElementById('fr-mode-emploi')) document.getElementById('fr-mode-emploi').value = s.mode_emploi;
  if (document.getElementById('fr-cure')) document.getElementById('fr-cure').value = s.cure;
  if (document.getElementById('fr-cure-na')) document.getElementById('fr-cure-na').checked = s.cure_na;
  if (document.getElementById('fr-surgras')) document.getElementById('fr-surgras').value = s.surgras;
  if (document.getElementById('fr-surgras-na')) document.getElementById('fr-surgras-na').checked = s.surgras_na;
  appliquerCureNA();
  appliquerSurgrasNA();
  if (document.getElementById('fr-couleur-visible')) document.getElementById('fr-couleur-visible').value = s.couleur_visible;
  if (document.getElementById('fr-couleur')) document.getElementById('fr-couleur').value = s.couleur;
  if (document.getElementById('fr-statut')) document.getElementById('fr-statut').value = s.statut;
  if (document.getElementById('fr-image-url')) document.getElementById('fr-image-url').value = s.image_url;
  if (document.getElementById('fr-image-url-noel')) document.getElementById('fr-image-url-noel').value = s.image_noel_url;
  apercuCouleurRecette(document.getElementById('fr-couleur-visible'));

  // Redonner les sélecteurs collection/gamme/famille
  mettreAJourLignes().then(function() {
    if (document.getElementById('fr-ligne')) document.getElementById('fr-ligne').value = s.gam_id;
    if (document.getElementById('fr-famille')) document.getElementById('fr-famille').value = s.fam_id;
  });

  ingredientsRecette = s.ingredients || [];
  formatsRecette = s.formats || [];
  emballagesRecette = s.emballages || {};
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  saisieProduitEnCours = null;
}

// ─── MODALES NOUVELLE CATÉGORIE / NOUVEL INGRÉDIENT ───
var _modalNouveauIngIdx = null;
var _modalNouvelleCatIdx = null;
var _modalNouveauIngEmballage = null;  // { format_id, idx } pour emballages

function ouvrirModalNouvelleCategorieUC(rangeeIdx) {
  _modalNouvelleCatIdx = rangeeIdx;
  var modal = document.getElementById('modal-nouvelle-cat-produit');
  if (!modal) {
    creerModalNouvelleCategorieUC();
    modal = document.getElementById('modal-nouvelle-cat-produit');
  }
  document.getElementById('modal-nouvelle-cat-produit-valeur').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-nouvelle-cat-produit-valeur').focus(); }, 100);
}

function fermerModalNouvelleCategorieUC() {
  var modal = document.getElementById('modal-nouvelle-cat-produit');
  if (modal) modal.classList.remove('ouvert');
  restaurerEtatFormulaire();
}

async function confirmerModalNouvelleCategorieUC() {
  var val = (document.getElementById('modal-nouvelle-cat-produit-valeur').value || '').trim();
  if (!val) { document.getElementById('modal-nouvelle-cat-produit-valeur').focus(); return; }
  var res = await appelAPIPost('saveCategorieUC', { nom: val });
  if (!res || !res.success) {
    afficherMsg('recettes', 'Erreur création catégorie.', 'erreur');
    return;
  }
  var cat_id = res.cat_id;
  if (!listesDropdown.categoriesMap) listesDropdown.categoriesMap = {};
  listesDropdown.categoriesMap[cat_id] = val;

  var modal = document.getElementById('modal-nouvelle-cat-produit');
  if (modal) modal.classList.remove('ouvert');
  restaurerEtatFormulaire();
  // Pré-sélectionner la nouvelle catégorie pour la rangée concernée
  if (_modalNouvelleCatIdx !== null && ingredientsRecette[_modalNouvelleCatIdx]) {
    ingredientsRecette[_modalNouvelleCatIdx].type = cat_id;
    ingredientsRecette[_modalNouvelleCatIdx].nom = '';
    ingredientsRecette[_modalNouvelleCatIdx].ing_id = '';
    rafraichirListeIngredientsRecette();
  }
  _modalNouvelleCatIdx = null;
}

function creerModalNouvelleCategorieUC() {
  var modal = document.createElement('div');
  modal.className = 'modal-admin-overlay';
  modal.id = 'modal-nouvelle-cat-produit';
  modal.innerHTML =
    '<div class="modal-admin">' +
      '<div class="modal-admin-header">' +
        '<div class="modal-admin-titre">Nouvelle catégorie UC</div>' +
        '<button class="btn-fermer-panneau" onclick="fermerModalNouvelleCategorieUC()" title="Fermer">✕</button>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<div class="form-groupe">' +
          '<label class="form-label">Nom de la catégorie</label>' +
          '<input type="text" class="form-ctrl" id="modal-nouvelle-cat-produit-valeur" placeholder="Ex: Huiles essentielles">' +
        '</div>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<div class="form-actions">' +
          '<button class="bouton bouton-petit bouton-contour" onclick="fermerModalNouvelleCategorieUC()">Annuler</button>' +
          '<button class="bouton bouton-petit" onclick="confirmerModalNouvelleCategorieUC()">Confirmer</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function ouvrirModalNouvelIngredient(rangeeIdx) {
  _modalNouveauIngIdx = rangeeIdx;
  var modal = document.getElementById('modal-nouvel-ing-produit');
  if (!modal) {
    creerModalNouvelIngredient();
    modal = document.getElementById('modal-nouvel-ing-produit');
  }
  // Pré-remplir la catégorie depuis la rangée
  var sel = document.getElementById('modal-nouvel-ing-cat');
  sel.innerHTML = '';
  Object.keys(listesDropdown.categoriesMap || {}).sort(function(a, b) {
    var na = listesDropdown.categoriesMap[a]; var nb = listesDropdown.categoriesMap[b];
    return na.localeCompare(nb, 'fr');
  }).forEach(function(k) {
    var opt = document.createElement('option');
    opt.value = k; opt.textContent = listesDropdown.categoriesMap[k]; sel.appendChild(opt);
  });
  if (rangeeIdx !== null && ingredientsRecette[rangeeIdx] && ingredientsRecette[rangeeIdx].type) {
    sel.value = ingredientsRecette[rangeeIdx].type;
  }
  document.getElementById('modal-nouvel-ing-nom').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-nouvel-ing-nom').focus(); }, 100);
}

function fermerModalNouvelIngredient() {
  var modal = document.getElementById('modal-nouvel-ing-produit');
  if (modal) modal.classList.remove('ouvert');
  restaurerEtatFormulaire();
}

async function confirmerModalNouvelIngredient() {
  var nom = (document.getElementById('modal-nouvel-ing-nom').value || '').trim();
  var cat_id = document.getElementById('modal-nouvel-ing-cat').value;
  if (!nom) { document.getElementById('modal-nouvel-ing-nom').focus(); return; }
  if (!cat_id) { afficherMsg('recettes', 'Choisir une catégorie.', 'erreur'); return; }

  var dernierNum = (listesDropdown.fullData || []).reduce(function(max, d) {
    var n = parseInt((d.ing_id || '').replace('ING-', '')) || 0;
    return n > max ? n : max;
  }, 0);
  var ing_id = 'ING-' + String(dernierNum + 1).padStart(3, '0');

  var CATS_SANS_INCI_LOCAL = ['CAT-014', 'CAT-015', 'CAT-016', 'CAT-017'];
  var statut = CATS_SANS_INCI_LOCAL.indexOf(cat_id) >= 0 ? 'valide' : 'a-valider';

  var res = await appelAPIPost('createIngredientInci', {
    ing_id: ing_id, cat_id: cat_id, nom_UC: nom, statut: statut, inci: '', source: ''
  });
  if (!res || !res.success) {
    afficherMsg('recettes', 'Erreur création ingrédient.', 'erreur');
    return;
  }
  if (!listesDropdown.fullData) listesDropdown.fullData = [];
  listesDropdown.fullData.push({ ing_id: ing_id, cat_id: cat_id, nom_UC: nom, inci: '', statut: statut });

  var modal = document.getElementById('modal-nouvel-ing-produit');
  if (modal) modal.classList.remove('ouvert');
  restaurerEtatFormulaire();

  if (_modalNouveauIngIdx !== null && ingredientsRecette[_modalNouveauIngIdx]) {
    ingredientsRecette[_modalNouveauIngIdx].type = cat_id;
    ingredientsRecette[_modalNouveauIngIdx].nom = nom;
    ingredientsRecette[_modalNouveauIngIdx].ing_id = ing_id;
    rafraichirListeIngredientsRecette();
  }
  if (_modalNouveauIngEmballage && emballagesRecette[_modalNouveauIngEmballage.format_id]) {
    var emb = emballagesRecette[_modalNouveauIngEmballage.format_id][_modalNouveauIngEmballage.idx];
    if (emb) {
      emb.cat_id = cat_id;
      emb.ing_id = ing_id;
      emb.nom = nom;
      rafraichirListeFormatsRecette();
    }
    _modalNouveauIngEmballage = null;
  }
  _modalNouveauIngIdx = null;
}

function creerModalNouvelIngredient() {
  var modal = document.createElement('div');
  modal.className = 'modal-admin-overlay';
  modal.id = 'modal-nouvel-ing-produit';
  modal.innerHTML =
    '<div class="modal-admin">' +
      '<div class="modal-admin-header">' +
        '<div class="modal-admin-titre">Nouvel ingrédient</div>' +
        '<button class="btn-fermer-panneau" onclick="fermerModalNouvelIngredient()" title="Fermer">✕</button>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<div class="form-groupe">' +
          '<label class="form-label">Catégorie</label>' +
          '<select class="form-ctrl" id="modal-nouvel-ing-cat"></select>' +
        '</div>' +
        '<div class="form-groupe">' +
          '<label class="form-label">Nom de l\'ingrédient</label>' +
          '<input type="text" class="form-ctrl" id="modal-nouvel-ing-nom" placeholder="Ex: Cire émulsifiante">' +
        '</div>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<div class="form-actions">' +
          '<button class="bouton bouton-petit bouton-contour" onclick="fermerModalNouvelIngredient()">Annuler</button>' +
          '<button class="bouton bouton-petit" onclick="confirmerModalNouvelIngredient()">Confirmer</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

async function chargerIngredientsBaseRecette() {
  var idActuel = document.getElementById('fr-id').value;
  if (idActuel) return; // Ne pas toucher en modification
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
function ajouterFormatRecette(poids, unite, prix) {
  formatsRecette.push({
    format_id: genererFormatId(),
    poids: poids || '',
    unite: unite || 'g',
    prix: prix || '',
    nb_unites: 0
  });
  rafraichirListeFormatsRecette();
}

function supprimerFormatRecette(index) {
  var f = formatsRecette[index];
  if (f && f.format_id) delete emballagesRecette[f.format_id];
  formatsRecette.splice(index, 1);
  rafraichirListeFormatsRecette();
}

function ajouterEmballageFormat(format_id) {
  if (!emballagesRecette[format_id]) emballagesRecette[format_id] = [];
  emballagesRecette[format_id].push({ ing_id: '', cat_id: '', nom: '', quantite: 0, nb_par_unite: 1 });
  rafraichirListeFormatsRecette();
}

function onChangeEmballageNom(format_id, idx, val) {
  if (val === '__nouvel_ing__') {
    var emb = emballagesRecette[format_id] && emballagesRecette[format_id][idx];
    if (!emb || !emb.cat_id) {
      afficherMsg('recettes', 'Choisir une catégorie d\'abord.', 'erreur');
      rafraichirListeFormatsRecette();
      return;
    }
    sauvegarderEtatFormulaire();
    _modalNouveauIngEmballage = { format_id: format_id, idx: idx, cat_id: emb.cat_id };
    ouvrirModalNouvelIngredientEmballage(emb.cat_id);
    return;
  }
  emballagesRecette[format_id][idx].ing_id = val;
  emballagesRecette[format_id][idx].nom = ((listesDropdown.fullData || []).find(function(d) { return d.ing_id === val; }) || {}).nom_UC || '';
  rafraichirListeFormatsRecette();
}

function ouvrirModalNouvelIngredientEmballage(cat_id) {
  var modal = document.getElementById('modal-nouvel-ing-produit');
  if (!modal) {
    creerModalNouvelIngredient();
    modal = document.getElementById('modal-nouvel-ing-produit');
  }
  var sel = document.getElementById('modal-nouvel-ing-cat');
  sel.innerHTML = '';
  Object.keys(listesDropdown.categoriesMap || {}).sort(function(a, b) {
    var na = listesDropdown.categoriesMap[a]; var nb = listesDropdown.categoriesMap[b];
    return na.localeCompare(nb, 'fr');
  }).forEach(function(k) {
    var opt = document.createElement('option');
    opt.value = k; opt.textContent = listesDropdown.categoriesMap[k]; sel.appendChild(opt);
  });
  sel.value = cat_id;
  document.getElementById('modal-nouvel-ing-nom').value = '';
  modal.classList.add('ouvert');
  setTimeout(function() { document.getElementById('modal-nouvel-ing-nom').focus(); }, 100);
}

function supprimerEmballageFormat(format_id, idx) {
  if (emballagesRecette[format_id]) emballagesRecette[format_id].splice(idx, 1);
  rafraichirListeFormatsRecette();
}
function rafraichirListeFormatsRecette() {
  var liste = document.getElementById('liste-formats-recette');
  if (!liste) return;
  var labels = document.getElementById('labels-formats-recette');
  if (labels) labels.classList.add('cache');

  if (formatsRecette.length === 0) {
    liste.innerHTML = '';
    return;
  }

  var catsEmb = ['CAT-014', 'CAT-015', 'CAT-016', 'CAT-017'];

  liste.innerHTML = formatsRecette.map(function(f, i) {
    if (!f.format_id) f.format_id = genererFormatId();
    var fid = f.format_id;
    var embs = emballagesRecette[fid] || [];

    var lignesEmb = embs.map(function(e, j) {
      var catEmb = e.cat_id || '';
      var ingsDecat = catEmb ? (listesDropdown.fullData || []).filter(function(d) { return d.cat_id === catEmb; }) : [];
      return '<div class="ingredient-rangee">' +
        '<select class="form-ctrl" onchange="emballagesRecette[\'' + fid + '\'][' + j + '].cat_id=this.value; emballagesRecette[\'' + fid + '\'][' + j + '].ing_id=\'\'; emballagesRecette[\'' + fid + '\'][' + j + '].nom=\'\'; rafraichirListeFormatsRecette()">' +
          '<option value="">— Catégorie —</option>' +
          catsEmb.map(function(c) { return '<option value="' + c + '" ' + (catEmb === c ? 'selected' : '') + '>' + ((listesDropdown.categoriesMap || {})[c] || c) + '</option>'; }).join('') +
        '</select>' +
        '<select class="form-ctrl" onchange="onChangeEmballageNom(\'' + fid + '\',' + j + ', this.value)">' +
          '<option value="">— Nom UC —</option>' +
          ingsDecat.map(function(d) { return '<option value="' + d.ing_id + '" ' + (d.ing_id === e.ing_id ? 'selected' : '') + '>' + d.nom_UC + '</option>'; }).join('') +
          '<option value="__nouvel_ing__">+ Nouvel ingrédient...</option>' +
        '</select>' +
        '<button class="bouton bouton-petit bouton-rouge" onclick="supprimerEmballageFormat(\'' + fid + '\',' + j + ')">✕</button>' +
      '</div>';
    }).join('');

    return '<div class="form-panel visible">' +
      '<div class="form-panel-header">' +
        '<span class="form-panel-titre">Format ' + (i + 1) + '</span>' +
        '<button class="bouton bouton-petit bouton-rouge" onclick="supprimerFormatRecette(' + i + ')">✕</button>' +
      '</div>' +
      '<div class="form-body">' +
        '<div class="ingredient-rangee">' +
          '<input type="text" inputmode="decimal" class="form-ctrl" value="' + (f.poids || '') + '" placeholder="Contenu net" onchange="formatsRecette[' + i + '].poids=this.value">' +
          '<select class="form-ctrl" onchange="formatsRecette[' + i + '].unite=this.value">' +
            '<option value="g" ' + (f.unite === 'g' ? 'selected' : '') + '>g</option>' +
            '<option value="ml" ' + (f.unite === 'ml' ? 'selected' : '') + '>ml</option>' +
          '</select>' +
          '<input type="text" inputmode="decimal" class="form-ctrl" value="' + (f.nb_unites || '') + '" placeholder="Nb unités produits" onchange="formatsRecette[' + i + '].nb_unites=parseInt(this.value)||0">' +
          '<input type="text" inputmode="decimal" class="form-ctrl" value="' + (f.prix || '') + '" placeholder="Prix $" onchange="formatsRecette[' + i + '].prix=parseFloat(this.value)||0">' +
        '</div>' +
        '<div class="section-label">Contenant et emballage par unité</div>' +
        lignesEmb +
        '<button type="button" class="bouton bouton-petit bouton-vert-pale" onclick="ajouterEmballageFormat(\'' + fid + '\')">+ Ajouter un emballage</button>' +
      '</div>' +
    '</div>';
  }).join('');
}
// ─── COULEUR HEX (grand carré + champ 6 caractères) ───
function apercuCouleurRecette(input) {
  if (!input) return;
  var val = (input.value || '').trim().replace('#', '');
  // Limiter à 6 caractères hex
  val = val.replace(/[^0-9a-fA-F]/g, '').substring(0, 6);
  input.value = val;
  var hexComplet = /^[0-9a-fA-F]{6}$/.test(val) ? '#' + val : '';
  var apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercu.style.background = hexComplet || 'var(--beige)';
  var elHex = document.getElementById('fr-couleur');
  if (elHex) elHex.value = hexComplet;
}

// ─── EXPORTS ───
function ouvrirModalExportGraphiste() {
  if (!produitActif) return;
  var modal = document.getElementById('modal-export-graphiste');
  if (!modal) {
    creerModalExportGraphiste();
    modal = document.getElementById('modal-export-graphiste');
  }
  // Adresse pré-remplie
  var champEmail = document.getElementById('modal-export-graphiste-email');
  if (champEmail && !champEmail.value) {
    champEmail.value = ''; // À pré-remplir avec votre adresse habituelle si vous me la donnez
  }
  modal.classList.add('ouvert');
}

function fermerModalExportGraphiste() {
  var modal = document.getElementById('modal-export-graphiste');
  if (modal) modal.classList.remove('ouvert');
  var commentaire = document.getElementById('modal-export-graphiste-commentaire');
  if (commentaire) commentaire.value = '';
}

async function envoyerExportGraphiste() {
  var email = (document.getElementById('modal-export-graphiste-email').value || '').trim();
  if (!email) { afficherMsg('recettes', 'Adresse courriel requise.', 'erreur'); return; }
  if (!produitActif) return;

  var btn = document.getElementById('btn-envoyer-graphiste');
  if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }

  var pro = produitActif;
  var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
  var gam = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });
  var fam = donneesFamilles && donneesFamilles.find(function(f) { return f.fam_id === pro.fam_id; });
  var ings = prodCache.ingredients[pro.pro_id] || [];
  var formats = pro.formats || [];

  var nbSansInci = 0;
  ings.forEach(function(i) {
    var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; });
    if (!o || !o.inci) nbSansInci++;
  });

  var inciLabel = ings
    .filter(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o && o.inci; })
    .slice()
    .sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o.inci.trim(); })
    .join(', ');
    .filter(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o && o.inci; })
    .slice()
    .sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return o.inci.trim(); })
    .join(', ');

  var ingsTexte = ings.slice().sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) { var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; }); return '- ' + i.nom_ingredient + ' | ' + ((o && o.inci) || '⚠ INCI manquant') + ' | ' + i.quantite_g + ' g'; })
    .join('\n'); 

  var formatsTexte = formats.map(function(f) { return '- ' + f.poids + ' ' + f.unite + ' : ' + (f.prix_vente || '—') + ' $'; }).join('\n');

  // Construire le texte des emballages par format
  var embItems = prodCache.emballages[pro.pro_id] || [];
  var emballagesTexte = formats.map(function(f) {
    var embs = embItems.filter(function(e) { return e.format_id === f.format_id; });
    if (!embs.length) return '';
    var lignes = embs.map(function(e) {
      var ing = (listesDropdown.fullData || []).find(function(d) { return d.ing_id === e.ing_id; });
      var catNom = ing ? ((listesDropdown.categoriesMap || {})[ing.cat_id] || '') : '';
      return '  • ' + (catNom ? catNom + ' — ' : '') + (ing ? ing.nom_UC : e.ing_id);
    }).join('\n');
    return 'Format ' + f.poids + ' ' + f.unite + ' :\n' + lignes;
  }).filter(function(t) { return t; }).join('\n\n');

  var commentaire = (document.getElementById('modal-export-graphiste-commentaire').value || '').trim();
  var data = {
    email: email,
    commentaire: commentaire,
    nom: pro.nom || '',
    collection: (col && col.nom) || '',
    gamme: (gam && gam.nom) || '',
    famille: (fam && fam.nom) || '',
    statut: pro.statut || '',
    couleur_hex: pro.couleur_hex || '',
    image_url: pro.image_url || '',
    image_noel_url: pro.image_noel_url || '',
    description: pro.description || '',
    desc_emballage: pro.desc_emballage || '',
    instructions: pro.instructions || '',
    notes: pro.notes || '',
    avertissement: pro.avertissement || '',
    mode_emploi: pro.mode_emploi || '',
    inci_label: inciLabel,
    ingredients_texte: ingsTexte,
    formats_texte: formatsTexte,
    emballages_texte: emballagesTexte,
    nb_sans_inci: nbSansInci
  };

  var res = await appelAPIPost('envoyerProduitGraphiste', data);
  if (btn) { btn.disabled = false; btn.textContent = 'Envoyer'; }
  if (res && res.success) {
    afficherMsg('recettes', '✅ Envoyé à ' + email + '.');
    fermerModalExportGraphiste();
  } else {
    afficherMsg('recettes', 'Erreur d\'envoi.', 'erreur');
  }
}

function creerModalExportGraphiste() {
  var modal = document.createElement('div');
  modal.className = 'modal-admin-overlay';
  modal.id = 'modal-export-graphiste';
  modal.innerHTML =
    '<div class="modal-admin">' +
      '<div class="modal-admin-header">' +
        '<div class="modal-admin-titre">Envoyer au graphiste</div>' +
        '<button class="btn-fermer-panneau" onclick="fermerModalExportGraphiste()" title="Fermer">✕</button>' +
      '</div>' +
     '<div class="modal-admin-body">' +
        '<div class="form-groupe">' +
          '<label class="form-label">Adresse courriel destinataire</label>' +
          '<input type="text" class="form-ctrl" id="modal-export-graphiste-email" placeholder="exemple@domaine.com">' +
        '</div>' +
        '<div class="form-groupe">' +
          '<label class="form-label">Commentaire / instructions</label>' +
          '<textarea class="form-ctrl" id="modal-export-graphiste-commentaire" rows="3" placeholder="Ex: Modifier la photo, ajouter le slogan..."></textarea>' +
        '</div>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<div class="form-actions">' +
          '<button class="bouton bouton-petit bouton-contour" onclick="fermerModalExportGraphiste()">Annuler</button>' +
          '<button class="bouton bouton-petit" id="btn-envoyer-graphiste" onclick="envoyerExportGraphiste()">Envoyer</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

// ─── EXPORT PDF — choix des champs avec cases à cocher ───
var CHAMPS_PDF_DISPONIBLES = [
  { id: 'image',          label: 'Photo principale' },
  { id: 'image_noel',     label: 'Photo saisonnière' },
  { id: 'collection',     label: 'Collection' },
  { id: 'gamme',          label: 'Gamme' },
  { id: 'famille',        label: 'Famille' },
  { id: 'statut',         label: 'Statut' },
  { id: 'cure',           label: 'Cure' },
  { id: 'surgras',        label: 'Surgras' },
  { id: 'couleur_hex',    label: 'Couleur HEX' },
  { id: 'description',    label: 'Description' },
  { id: 'desc_emballage', label: 'Description pour emballage' },
  { id: 'avertissement',  label: 'Avertissement' },
  { id: 'mode_emploi',    label: 'Mode d\'emploi' },
  { id: 'instructions',   label: 'Instructions' },
  { id: 'notes',          label: 'Notes' },
  { id: 'ingredients',    label: 'Liste détaillée des ingrédients' },
  { id: 'inci_label',     label: 'Liste INCI pour étiquette' },
  { id: 'formats',        label: 'Formats et prix' }
];

function ouvrirModalExportPdf() {
  if (!produitActif) return;
  var modal = document.getElementById('modal-export-pdf');
  if (!modal) {
    creerModalExportPdf();
    modal = document.getElementById('modal-export-pdf');
  }
  modal.classList.add('ouvert');
}

function fermerModalExportPdf() {
  var modal = document.getElementById('modal-export-pdf');
  if (modal) modal.classList.remove('ouvert');
}

async function genererExportPdf() {
  if (!produitActif) return;
  var champsChoisis = [];
  CHAMPS_PDF_DISPONIBLES.forEach(function(c) {
    var cb = document.getElementById('pdf-champ-' + c.id);
    if (cb && cb.checked) champsChoisis.push(c.id);
  });
  if (!champsChoisis.length) {
    afficherMsg('recettes', 'Cochez au moins un champ.', 'erreur');
    return;
  }

  var btn = document.getElementById('btn-generer-pdf');
  if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }

  var pro = produitActif;
  var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
  var gam = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });
  var fam = donneesFamilles && donneesFamilles.find(function(f) { return f.fam_id === pro.fam_id; });
  var ings = prodCache.ingredients[pro.pro_id] || [];
  var formats = pro.formats || [];

  var inciLabel = ings

  var ingsListe = ings.slice().sort(function(a, b) { return b.quantite_g - a.quantite_g; })
    .map(function(i) {
      var o = listesDropdown.fullData.find(function(d) { return d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient; });
      return { nom: i.nom_ingredient, inci: (o && o.inci) || '', quantite: i.quantite_g };
    });

  var formatsListe = formats.map(function(f) {
    return { poids: f.poids, unite: f.unite, prix: f.prix_vente, nb_unites: f.nb_unites };
  });

  var data = {
    pro_id: pro.pro_id,
    nom: pro.nom || '',
    champs: champsChoisis,
    collection: (col && col.nom) || '',
    gamme: (gam && gam.nom) || '',
    famille: (fam && fam.nom) || '',
    statut: pro.statut || '',
    cure: pro.cure,
    surgras: pro.surgras,
    couleur_hex: pro.couleur_hex || '',
    image_url: pro.image_url || '',
    image_noel_url: pro.image_noel_url || '',
    description: pro.description || '',
    desc_emballage: pro.desc_emballage || '',
    instructions: pro.instructions || '',
    notes: pro.notes || '',
    avertissement: pro.avertissement || '',
    mode_emploi: pro.mode_emploi || '',
    inci_label: inciLabel,
    ingredients: ingsListe,
    formats: formatsListe
  };

  var res = await appelAPIPost('genererProduitPdf', data);
  if (btn) { btn.disabled = false; btn.textContent = 'Générer le PDF'; }
  if (res && res.success && res.url) {
    window.open(res.url, '_blank');
    afficherMsg('recettes', '✅ PDF généré.');
    fermerModalExportPdf();
  } else {
    afficherMsg('recettes', 'Erreur de génération.', 'erreur');
  }
}

function creerModalExportPdf() {
  var modal = document.createElement('div');
  modal.className = 'modal-admin-overlay';
  modal.id = 'modal-export-pdf';
  var champsHtml = CHAMPS_PDF_DISPONIBLES.map(function(c) {
    return '<label style="display:block;padding:6px 0;cursor:pointer">' +
      '<input type="checkbox" id="pdf-champ-' + c.id + '" checked style="margin-right:8px"> ' + c.label +
    '</label>';
  }).join('');
  modal.innerHTML =
    '<div class="modal-admin" style="max-width:500px">' +
      '<div class="modal-admin-header">' +
        '<div class="modal-admin-titre">Exporter fiche recette (PDF)</div>' +
        '<button class="btn-fermer-panneau" onclick="fermerModalExportPdf()" title="Fermer">✕</button>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<p style="font-size:0.85rem;color:var(--gris);margin-bottom:12px">Cochez les champs à inclure dans le PDF :</p>' +
        '<div style="max-height:400px;overflow-y:auto;border:1px solid var(--beige);padding:12px;border-radius:4px">' + champsHtml + '</div>' +
      '</div>' +
      '<div class="modal-admin-body">' +
        '<div class="form-actions">' +
          '<button class="bouton bouton-petit bouton-contour" onclick="fermerModalExportPdf()">Annuler</button>' +
          '<button class="bouton bouton-petit" id="btn-generer-pdf" onclick="genererExportPdf()">Générer le PDF</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

// Pour compatibilité avec ancien onclick — l'ancien bouton "Copier pour le graphiste" appelait exporterFicheProduit
function exporterFicheProduit() { ouvrirModalExportGraphiste(); }

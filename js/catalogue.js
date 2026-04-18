/* ═══════════════════════════════════════
   CATALOGUE — catalogue.js
   ═══════════════════════════════════════ */

const API_URL = 'https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec';

/* ── UTILITAIRES PRODUIT ── */
function estHexClair(hex) {
  if (!hex) return false;
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0,2),16);
  const g = parseInt(h.substr(2,2),16);
  const b = parseInt(h.substr(4,2),16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

var _pos_v = ['haut', 'bas', 'separe'];
var _pos_h = ['gauche', 'droite'];

function posAleatoire(type) {
  var opts = type === 'h' ? _pos_h : _pos_v;
  return opts[Math.floor(Math.random() * opts.length)];
}

function creerProduitCarte(p, orientation, posHex) {
  var hex = p.couleur_hex || '#888888';
  var texte = estHexClair(hex) ? 'var(--gris-fonce)' : 'var(--blanc)';
  var prixPoids = formaterPrixPoids(p.formats);

  var photo = '<div class="prod-photo-wrap">'
    + '<img class="prod-photo" src="' + (p.image_url || '') + '" alt="' + (p.nom || '') + '">'
    + '</div>';

  var hexBloc = '<div class="prod-hex" style="--prod-hex:' + hex + '; --prod-texte:' + texte + ';">'
    + '<div class="prod-hex-nom">' + (p.nom || '') + '</div>'
    + (p.desc_emballage ? '<div class="prod-hex-emb">' + p.desc_emballage + '</div>' : '')
    + (prixPoids ? '<div class="prod-hex-prix">' + prixPoids + '</div>' : '')
    + '</div>';

  var classes = 'prod-carte';
  if (orientation === 'h') classes += ' prod-h';
  if (posHex === 'separe') classes += ' prod-separe';

  var contenu = '';
  if (posHex === 'haut' || posHex === 'gauche') {
    contenu = hexBloc + photo;
  } else if (posHex === 'bas' || posHex === 'droite') {
    contenu = photo + hexBloc;
  } else if (posHex === 'separe') {
    contenu = hexBloc + photo + hexBloc;
  }

  return '<div class="' + classes + '">' + contenu + '</div>';
}


function formaterPrix(formats) {
  if (!formats || formats.length === 0) return '';
  const f = formats[0];
  if (!f.prix_vente || f.prix_vente === 0) return '';
  return f.prix_vente.toFixed(2).replace('.', ',') + ' $';
}

function formaterPoids(formats) {
  if (!formats || formats.length === 0) return '';
  const f = formats[0];
  return f.poids ? f.poids + (f.unite ? ' ' + f.unite : '') : '';
}

function formaterPrixPoids(formats) {
  return [formaterPrix(formats), formaterPoids(formats)].filter(Boolean).join(' · ');
}

/* ── DESCRIPTION COLLECTION ── */
function construireDescription(description) {
  if (!description) return '';
  return description.split('\n').filter(Boolean)
    .map(function(p) { return '<p>' + p + '</p>'; }).join('');
}

/* ══════════════════════════════════════
   CHARGEMENT PRINCIPAL
══════════════════════════════════════ */
async function chargerCatalogue() {
  const conteneur = document.getElementById('pages-collections');

  try {
    const [repCatalogue, repMediatheque, repContenu] = await Promise.all([
      fetch(API_URL + '?action=getCatalogue'),
      fetch(API_URL + '?action=getMediatheque'),
      fetch(API_URL + '?action=getContenu')
    ]);
    const [data, dataMediatheque, dataContenu] = await Promise.all([
      repCatalogue.json(),
      repMediatheque.json(),
      repContenu.json()
    ]);

    if (!data.success) {
      conteneur.innerHTML = '<div class="chargement">Erreur : ' + (data.message || 'réponse invalide') + '</div>';
      return;
    }

    // Médiathèque — indexée par nom
    const mediatheque = {};
    if (dataMediatheque.success && dataMediatheque.items) {
      dataMediatheque.items.forEach(function(item) {
        if (item.nom) mediatheque[item.nom] = item.url;
      });
    }

    // Photo couverture depuis médiathèque
    const elCoverPhoto = document.querySelector('.cover-photo');
    if (elCoverPhoto && mediatheque['photo_couverture']) {
      elCoverPhoto.style.setProperty('--cover-photo-url', 'url(' + mediatheque['photo_couverture'] + ')');
    }

    // Eyebrow couverture depuis contenu
    const eyebrow = (dataContenu.success && dataContenu.contenu) ? (dataContenu.contenu.accueil_eyebrow || '') : '';
    const elEyebrow = document.getElementById('cover-eyebrow-texte');
    if (elEyebrow && eyebrow) elEyebrow.textContent = eyebrow;

    // Page Chantal depuis contenu
    const contenu = (dataContenu.success && dataContenu.contenu) ? dataContenu.contenu : {};
    const elTitre = document.getElementById('chantal-titre');
    if (elTitre) {
      const titre = (contenu.qui_titre || '') + (contenu.qui_titre_em ? ' <em>' + contenu.qui_titre_em + '</em>' : '');
      elTitre.innerHTML = titre;
    }
    const elSig = document.getElementById('chantal-signature');
    if (elSig) elSig.textContent = contenu.qui_signature_nom || '';
    const elSigTitre = document.getElementById('chantal-signature-titre');
    if (elSigTitre) elSigTitre.textContent = contenu.qui_signature_titre || '';
    const elCorps = document.getElementById('chantal-corps');
    if (elCorps) elCorps.textContent = contenu.qui_texte || '';
    const elCitation = document.getElementById('chantal-citation');
    if (elCitation) elCitation.textContent = contenu.citation_texte || '';

    // Regrouper les produits par collection
    const parCollection = {};
    data.produits.forEach(function(p) {
      if (!parCollection[p.col_id]) {
        const info = data.infoCollections[p.col_id] || {};
        parCollection[p.col_id] = {
          collection: {
            id: p.col_id,
            nom: p.nom_collection,
            slogan: p.slogan_collection,
            couleur_hex: info.couleur_hex || p.couleur_hex,
            photo_url: info.photo_url || '',
            description: info.description || '',
            rang: info.rang || 99
          },
          produits: []
        };
      }
      parCollection[p.col_id].produits.push(p);
    });

    // Trier par rang
    const collections = Object.values(parCollection).sort(function(a, b) {
      return a.collection.rang - b.collection.rang;
    });

    // Carrés couverture + dots dos + table des matières — dynamiques
    const coverCols = document.getElementById('cover-cols-collections');
    const dosDots = document.getElementById('dos-dots-collections');
    const tdmListe = document.getElementById('tdm-liste');

    collections.forEach(function(item) {
      const couleur = item.collection.couleur_hex || '#888';

      if (coverCols) {
        const ligne = document.createElement('div');
        ligne.className = 'cover-col-ligne';
        const nomEl = document.createElement('span');
        nomEl.className = 'cover-col-nom';
        nomEl.textContent = item.collection.nom;
        const carre = document.createElement('div');
        carre.className = 'cover-col-carre';
        carre.style.setProperty('--col-hex', couleur);
        ligne.appendChild(nomEl);
        ligne.appendChild(carre);
        coverCols.appendChild(ligne);
      }

      if (dosDots) {
        const el = document.createElement('div');
        el.className = 'dos-dot';
        el.style.setProperty('--col-hex', couleur);
        dosDots.appendChild(el);
      }

      if (tdmListe) {
        tdmListe.innerHTML += '<div class="tdm-ligne">'
          + '<div class="tdm-carre" style="--col-hex:' + couleur + '; background:' + couleur + ';"></div>'
          + '<div class="tdm-nom">' + item.collection.nom + '</div>'
          + '<div class="tdm-slogan">' + (item.collection.slogan || '') + '</div>'
          + '<div class="tdm-page"></div>'
          + '</div>';
      }
    });

    // ── PAGES 4-5 SAPONICA (COL-001) ──
    var saponica = parCollection['COL-001'];
    if (saponica) {
      var col = saponica.collection;
      var produits = saponica.produits.filter(function(p) { return p.statut === 'public'; });

      // Photo collection
      var elSap4Photo = document.getElementById('sap4-photo');
      if (elSap4Photo && col.photo_url) {
        elSap4Photo.src = col.photo_url;
        elSap4Photo.alt = col.nom;
      }

      // Texte collection
      var elNom = document.getElementById('sap4-nom');
      if (elNom) elNom.textContent = col.nom;
      var elSlogan = document.getElementById('sap4-slogan');
      if (elSlogan) elSlogan.textContent = col.slogan;
      var elDesc = document.getElementById('sap4-description');
      if (elDesc) elDesc.textContent = col.description;

      // Citation
      var elCitTexte = document.getElementById('sap4-citation-texte');
      if (elCitTexte) elCitTexte.textContent = contenu.citation_texte || '';
      var elCitAuteur = document.getElementById('sap4-citation-auteur');
      if (elCitAuteur) elCitAuteur.textContent = contenu.citation_auteur || '';

      // 1 produit page 4
      var elProd1 = document.getElementById('sap4-produit-1');
      if (elProd1 && produits.length > 0) {
        elProd1.innerHTML = creerProduitCarte(produits[0], 'v', posAleatoire('v'));
      }

      // Grouper par gamme
      var gammes = {};
      produits.forEach(function(p) {
        var gamId = p['GAM-id'] || p.gam_id || 'sans-gamme';
        if (!gammes[gamId]) {
          gammes[gamId] = {
            nom: p.nom_gamme || '',
            desc: p.desc_gamme || '',
            couleur_hex: p.couleur_hex || '#c1882e',
            rang: p.rang_gamme || 99,
            produits: []
          };
        }
        gammes[gamId].produits.push(p);
      });

      var gam = Object.values(gammes).sort(function(a, b) { return a.rang - b.rang; })[0];
      if (gam) {

        // Entête gamme page 5
        var elGNom = document.getElementById('sap5-gamme-nom');
        if (elGNom) elGNom.textContent = gam.nom;
        var elGCube = document.getElementById('sap5-gamme-cube');
        if (elGCube) elGCube.style.setProperty('--gam-hex', gam.couleur_hex);
        var elGDesc = document.getElementById('sap5-gamme-desc');
        if (elGDesc) elGDesc.textContent = gam.desc;

        // Produits page 5 — à partir du 2e (le 1er est page 4)
        var produitsP5 = gam.produits.slice(1);

        // Rangée 1 : 3 produits
        var r1 = document.getElementById('sap5-rangee-1');
        if (r1) {
          produitsP5.slice(0, 3).forEach(function(p) {
            r1.innerHTML += creerProduitCarte(p, 'v', posAleatoire('v'));
          });
        }

        // Rangée 2 : 3 produits
        var r2 = document.getElementById('sap5-rangee-2');
        if (r2) {
          produitsP5.slice(3, 6).forEach(function(p) {
            r2.innerHTML += creerProduitCarte(p, 'v', posAleatoire('v'));
          });
        }

        // Overflow — produits restants dans #sap-pages-suite
        var produitsReste = produitsP5.slice(6);
        var elSuite = document.getElementById('sap-pages-suite');
        if (elSuite && produitsReste.length > 0) {
          var htmlSuite = '';
          for (var i = 0; i < produitsReste.length; i += 3) {
            var lot = produitsReste.slice(i, i + 3);
            var cote = (Math.floor(i / 3) % 2 === 0) ? 'page-g' : 'page-d';
            htmlSuite += '<div class="page ' + cote + ' p-sap-suite" style="--col-hex:#e5900a">'
              + '<div class="page-int">'
              + '<div class="sap5-rangee">';
            lot.forEach(function(p) {
              htmlSuite += creerProduitCarte(p, 'v', posAleatoire('v'));
            });
            htmlSuite += '</div></div>'
              + '<div class="cat-pied"><div class="cat-pied-ligne"></div><span></span></div>'
              + '</div>';
          }
          elSuite.innerHTML = htmlSuite;
        }
      }
    }

    // Pages collections — à construire
    conteneur.innerHTML = '';

  } catch (e) {
    conteneur.innerHTML = '<div class="chargement">Erreur de connexion : ' + e.message + '</div>';
  }
}

chargerCatalogue();

/* ══════════════════════════════════════
   NAVIGATION LIVRE
══════════════════════════════════════ */
function initialiserLivre() {
  const contenu = document.getElementById('livre-contenu');
  const btnPrev = document.getElementById('livre-precedent');
  const btnSuiv = document.getElementById('livre-suivant');
  const infoVue = document.getElementById('livre-info');

  const pages = Array.from(contenu.querySelectorAll('.page'));
  if (pages.length === 0) return;

  // Masquer les page-label
  contenu.querySelectorAll('.page-label').forEach(function(el) {
    el.style.display = 'none';
  });

  // Construire les vues
  const vues = [];

  // Couverture seule
  vues.push({ type: 'seule', pages: [pages[0]] });

  // Doubles pages intermédiaires
  const pagesInterieures = pages.slice(1, pages.length - 1);
  for (let i = 0; i < pagesInterieures.length; i += 2) {
    if (i + 1 < pagesInterieures.length) {
      vues.push({ type: 'double', pages: [pagesInterieures[i], pagesInterieures[i + 1]] });
    } else {
      vues.push({ type: 'seule', pages: [pagesInterieures[i]] });
    }
  }

  // Dos seul
  if (pages.length > 1) {
    vues.push({ type: 'seule', pages: [pages[pages.length - 1]] });
  }

  // Créer les conteneurs de vues
  const enveloppes = vues.map(function(vue, idx) {
    const div = document.createElement('div');
    div.className = vue.type === 'double' ? 'livre-double' : 'livre-seule';
    div.id = 'livre-vue-' + (idx + 1);
    vue.pages.forEach(function(p) { div.appendChild(p); });
    contenu.appendChild(div);
    return div;
  });

  let vueActive = 0;

  function afficherVue(idx) {
    enveloppes.forEach(function(e) { e.classList.remove('actif'); });
    enveloppes[idx].classList.add('actif');
    infoVue.textContent = (idx + 1) + ' / ' + vues.length;
    btnPrev.disabled = idx === 0;
    btnSuiv.disabled = idx === vues.length - 1;
    vueActive = idx;
  }

  btnPrev.addEventListener('click', function() {
    if (vueActive > 0) afficherVue(vueActive - 1);
  });

  btnSuiv.addEventListener('click', function() {
    if (vueActive < vues.length - 1) afficherVue(vueActive + 1);
  });

  afficherVue(0);
}

// Attendre que les pages dynamiques soient générées
const _observateur = new MutationObserver(function(mutations, obs) {
  const pages = document.querySelectorAll('#livre-contenu .page');
  if (pages.length >= 3) {
    obs.disconnect();
    initialiserLivre();
  }
});
_observateur.observe(document.getElementById('livre-contenu'), { childList: true, subtree: true });

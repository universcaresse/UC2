/* ═══════════════════════════════════════
   CATALOGUE — catalogue.js
   ═══════════════════════════════════════ */

const API_URL = 'https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec';
const SEUIL_PAGE_PLEINE = 8;
const ATELIER_ESSENCES = 'https://res.cloudinary.com/dfasrauyy/image/upload/univers-caresse/essences_vevuvf';

/* ── FORMATAGE ── */
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

/* ── CARTE GÉNÉRIQUE ──
   Utilisée par : collections génériques, mini-sections, PETIT NUAGE, CAPRIN
   Classes : cat-carte, cat-carte-visuel, cat-carte-hex, cat-carte-nom, cat-carte-desc, cat-carte-prix
*/
function construireCarte(produit, avecDesc) {
  const couleur = produit.couleur_hex || '#888';
  const prixPoids = formaterPrixPoids(produit.formats);
  const desc = avecDesc ? (produit.desc_emballage || '') : '';

  return '<div class="cat-carte">'
    + '<div class="cat-carte-visuel"><img src="' + (produit.image_url || '') + '" alt="' + produit.nom + '"></div>'
    + '<div class="cat-carte-hex" style="--col-hex:' + couleur + ';">'
    + '<div class="cat-carte-nom">' + produit.nom + '</div>'
    + (desc ? '<div class="cat-carte-desc">' + desc + '</div>' : '')
    + (prixPoids ? '<div class="cat-carte-prix">' + prixPoids + '</div>' : '')
    + '</div>'
    + '</div>';
}

/* ── DESCRIPTION COLLECTION ── */
function construireDescription(description) {
  if (!description) return '';
  return description.split('\n').filter(Boolean)
    .map(function(p) { return '<p>' + p + '</p>'; }).join('');
}

/* ══════════════════════════════════════
   PAGE PLEINE — COLLECTION GÉNÉRIQUE
══════════════════════════════════════ */
function construirePagePleine(collection, produits, pageNo) {
  const couleur = collection.couleur_hex || '#888';
  const cols = produits.length > 12 ? 'cat-grille-4' : 'cat-grille-3';
  const cartes = produits.map(function(p) { return construireCarte(p, false); }).join('');

  return '<div class="page-label">Page ' + pageNo + ' — ' + collection.nom.toUpperCase() + '</div>'
    + '<div class="page col-page" style="background:' + couleur + '18;">'
    + '<div class="col-hero">'
    + (collection.photo_url ? '<div class="col-hero-photo" style="background-image:url(\'' + collection.photo_url + '\');"></div>' : '')
    + '<div class="fondu-bas"></div>'
    + '<div class="col-hero-contenu">'
    + '<div class="col-hero-trait" style="background:' + couleur + ';"></div>'
    + '<div class="col-hero-nom">' + collection.nom + '</div>'
    + '<div class="col-hero-slogan">' + (collection.slogan || '') + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="col-corps">'
    + '<div class="cat-grille ' + cols + '">' + cartes + '</div>'
    + '</div>'
    + '<div class="cat-pied">'
    + '<span class="logo-tagline" style="font-size:17px;">Univers Caresse</span>'
    + '<span>universcaresse.ca</span>'
    + '<span>' + pageNo + '</span>'
    + '</div>'
    + '</div>';
}

/* ══════════════════════════════════════
   PAGE PARTAGÉE — PETITES COLLECTIONS
══════════════════════════════════════ */
function construireMiniSection(collection, produits) {
  const couleur = collection.couleur_hex || '#888';
  const nb = produits.length;
  const classeG = nb <= 3 ? 'g3' : nb <= 4 ? 'g4' : nb <= 5 ? 'g5' : '';
  const colonnes = nb <= 6 ? nb : 6;
  const cartes = produits.map(function(p) { return construireCarte(p, false); }).join('');

  return '<div class="col-mini">'
    + '<div class="col-mini-entete">'
    + '<div class="col-mini-trait" style="background:' + couleur + ';"></div>'
    + '<div class="col-mini-nom" style="color:' + couleur + ';">' + collection.nom + '</div>'
    + '<div class="col-mini-slogan">' + (collection.slogan || '') + '</div>'
    + '</div>'
    + '<div class="col-mini-grille ' + classeG + '" style="grid-template-columns:repeat(' + colonnes + ',1fr);">'
    + cartes
    + '</div>'
    + '</div>';
}

function construirePagePartagee(groupes, pageNo) {
  const sections = groupes.map(function(g) { return construireMiniSection(g.collection, g.produits); }).join('');
  const label = groupes.map(function(g) { return g.collection.nom.toUpperCase(); }).join(' + ');

  return '<div class="page-label">Page ' + pageNo + ' — ' + label + '</div>'
    + '<div class="page p-partage">'
    + sections
    + '<div class="cat-pied">'
    + '<span class="logo-tagline" style="font-size:17px;">Univers Caresse</span>'
    + '<span>universcaresse.ca</span>'
    + '<span>' + pageNo + '</span>'
    + '</div>'
    + '</div>';
}

/* ══════════════════════════════════════
   SAPONICA — DOUBLE PAGE
══════════════════════════════════════ */
const SAP_TRAITEMENTS = ['A','B','C','D','C','D','A','B','D','A','B','C','B','C','D','A'];

function construireCarteSaponica(produit, index) {
  const couleur = produit.couleur_hex || '#888';
  const prixPoids = formaterPrixPoids(produit.formats);
  const desc = produit.desc_emballage || '';
  const photo = produit.image_url || '';
  const traitement = SAP_TRAITEMENTS[index % SAP_TRAITEMENTS.length];

  if (traitement === 'A') {
    return '<div class="sap-carte">'
      + '<div class="sap-photo sap-photo-60"><img src="' + photo + '" alt="' + produit.nom + '"></div>'
      + '<div class="sap-hex sap-hex-40" style="--col-hex:' + couleur + ';">'
      + '<div class="sap-carte-nom">' + produit.nom + '</div>'
      + (desc ? '<div class="sap-carte-desc">' + desc + '</div>' : '')
      + (prixPoids ? '<div class="sap-carte-prix">' + prixPoids + '</div>' : '')
      + '</div>'
      + '</div>';
  }
  if (traitement === 'B') {
    return '<div class="sap-carte">'
      + '<div class="sap-hex sap-hex-25" style="--col-hex:' + couleur + ';"></div>'
      + '<div class="sap-photo sap-photo-75 sap-photo-relative">'
      + '<img src="' + photo + '" alt="' + produit.nom + '">'
      + '<div class="sap-photo-bas">'
      + '<div class="sap-carte-nom">' + produit.nom + '</div>'
      + (prixPoids ? '<div class="sap-carte-prix">' + prixPoids + '</div>' : '')
      + '</div>'
      + '</div>'
      + '</div>';
  }
  if (traitement === 'C') {
    return '<div class="sap-carte">'
      + '<div class="sap-photo sap-photo-full"><img src="' + photo + '" alt="' + produit.nom + '"></div>'
      + '<div class="sap-bande-v" style="--col-hex:' + couleur + ';">'
      + '<div class="sap-bande-v-texte">'
      + '<div class="sap-carte-nom sap-carte-nom-v">' + produit.nom + '</div>'
      + (prixPoids ? '<div class="sap-carte-prix">' + prixPoids + '</div>' : '')
      + '</div>'
      + '</div>'
      + '</div>';
  }
  // D
  return '<div class="sap-carte">'
    + '<div class="sap-photo sap-photo-70"><img src="' + photo + '" alt="' + produit.nom + '"></div>'
    + '<div class="sap-bas-blanc">'
    + '<div class="sap-trait-hex" style="background:' + couleur + ';"></div>'
    + '<div class="sap-carte-nom" style="color:var(--gris-fonce);">' + produit.nom + '</div>'
    + (desc ? '<div class="sap-carte-desc" style="color:var(--gris);">' + desc + '</div>' : '')
    + (prixPoids ? '<div class="sap-carte-prix sap-prix-fonce">' + prixPoids + '</div>' : '')
    + '</div>'
    + '</div>';
}

function construireDoubleSaponica(collection, produits, pageNo) {
  const couleur = collection.couleur_hex || '#8A7A4A';
  const moitie = Math.ceil(produits.length / 2);
  const cartesG = produits.slice(0, moitie).map(function(p, i) { return construireCarteSaponica(p, i); }).join('');
  const cartesD = produits.slice(moitie).map(function(p, i) { return construireCarteSaponica(p, i + moitie); }).join('');

  const pageGauche = '<div class="page-label">Page ' + pageNo + ' — SAPONICA</div>'
    + '<div class="page sap-page-gauche">'
    + '<div class="sap-photo-collection">'
    + (collection.photo_url ? '<img src="' + collection.photo_url + '" alt="SAPONICA" class="photo-pleine">' : '')
    + '<div class="sap-photo-fondu"></div>'
    + '</div>'
    + '<div class="sap-contenu-gauche">'
    + '<div class="page-entete-eyebrow" style="color:' + couleur + ';">Collection</div>'
    + '<div class="sap-nom">' + collection.nom + '</div>'
    + '<div class="sap-slogan">' + (collection.slogan || '') + '</div>'
    + '<div class="sap-description">' + construireDescription(collection.description) + '</div>'
    + '<div class="sap-grille">' + cartesG + '</div>'
    + '</div>'
    + '</div>';

  const pageDroite = '<div class="page-label">Page ' + (pageNo + 1) + ' — SAPONICA (suite)</div>'
    + '<div class="page sap-page-droite" style="background:' + couleur + '18;">'
    + '<div class="sap-point-ancrage" style="background:' + couleur + ';"></div>'
    + '<div class="sap-grille sap-grille-droite">' + cartesD + '</div>'
    + '<div class="cat-pied">'
    + '<span class="logo-tagline" style="font-size:17px;">Univers Caresse</span>'
    + '<span>universcaresse.ca</span>'
    + '<span>' + (pageNo + 1) + '</span>'
    + '</div>'
    + '</div>';

  return pageGauche + pageDroite;
}

/* ══════════════════════════════════════
   PETIT NUAGE — PAGE 6
══════════════════════════════════════ */
function construirePagePetitNuage(collection, produits, pageNo) {
  const cartes = produits.map(function(p) { return construireCarte(p, true); }).join('');

  return '<div class="page-label">Page ' + pageNo + ' — PETIT NUAGE</div>'
    + '<div class="page pn-page">'
    + '<div class="pn-photos-haut">'
    + '<div class="pn-photo-grande overflow-cache">'
    + (collection.photo_url ? '<img src="' + collection.photo_url + '" alt="Petit Nuage" class="photo-pleine">' : '')
    + '</div>'
    + '<div class="pn-photo-petite overflow-cache">'
    + '<img src="' + ATELIER_ESSENCES + '" alt="Atelier" class="photo-pleine">'
    + '</div>'
    + '</div>'
    + '<div class="pn-texte">'
    + '<div class="pn-nom">' + collection.nom + '</div>'
    + '<div class="pn-slogan">' + (collection.slogan || '') + '</div>'
    + '<div class="pn-description">' + construireDescription(collection.description) + '</div>'
    + '</div>'
    + '<div class="pn-grille">' + cartes + '</div>'
    + '<div class="cat-pied">'
    + '<span class="logo-tagline" style="font-size:17px;">Univers Caresse</span>'
    + '<span>universcaresse.ca</span>'
    + '<span>' + pageNo + '</span>'
    + '</div>'
    + '</div>';
}

/* ══════════════════════════════════════
   CAPRIN — PAGE 7
══════════════════════════════════════ */
function construirePageCaprin(collection, produits, pageNo) {
  const cartes = produits.map(function(p) { return construireCarte(p, false); }).join('');

  return '<div class="page-label">Page ' + pageNo + ' — CAPRIN</div>'
    + '<div class="page cap-page">'
    + '<div class="cap-haut">'
    + '<div class="cap-haut-texte">'
    + '<div class="page-entete-eyebrow">Collection</div>'
    + '<div class="cap-nom">' + collection.nom + '</div>'
    + '<div class="cap-slogan">' + (collection.slogan || '') + '</div>'
    + '<div class="cap-description">' + construireDescription(collection.description) + '</div>'
    + '</div>'
    + '<div class="cap-haut-photo overflow-cache">'
    + (collection.photo_url ? '<img src="' + collection.photo_url + '" alt="Caprin" class="photo-pleine">' : '')
    + '</div>'
    + '</div>'
    + '<div class="cap-grille">' + cartes + '</div>'
    + '<div class="cat-pied">'
    + '<span class="logo-tagline" style="font-size:17px;">Univers Caresse</span>'
    + '<span>universcaresse.ca</span>'
    + '<span>' + pageNo + '</span>'
    + '</div>'
    + '</div>';
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

    // Photo couverture depuis médiathèque — ajouter 'photo_couverture' dans la médiathèque
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

    // Carrés couverture + dots dos — dynamiques
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
        el.style.background = couleur;
        dosDots.appendChild(el);
      }
      if (tdmListe) {
        tdmListe.innerHTML += '<div class="tdm-ligne">'
          + '<div class="tdm-carre" style="background:' + couleur + ';"></div>'
          + '<div class="tdm-nom">' + item.collection.nom + '</div>'
          + '<div class="tdm-slogan">' + (item.collection.slogan || '') + '</div>'
          + '</div>';
      }
    });

    // Construire les pages
    let html = '';
    let pageNo = 4; // Page 3 = TDM (statique), collections commencent à 4
    let groupePartage = [];

    function viderGroupePartage() {
      if (groupePartage.length > 0) {
        html += construirePagePartagee(groupePartage, pageNo);
        pageNo++;
        groupePartage = [];
      }
    }

    collections.forEach(function(item) {
      const nom = item.collection.nom.toUpperCase();
      const nb = item.produits.length;

      if (nom === 'SAPONICA') {
        viderGroupePartage();
        html += construireDoubleSaponica(item.collection, item.produits, pageNo);
        pageNo += 2;
      } else if (nom === 'PETIT NUAGE') {
        viderGroupePartage();
        html += construirePagePetitNuage(item.collection, item.produits, pageNo);
        pageNo++;
      } else if (nom === 'CAPRIN') {
        viderGroupePartage();
        html += construirePageCaprin(item.collection, item.produits, pageNo);
        pageNo++;
      } else if (nb >= SEUIL_PAGE_PLEINE) {
        viderGroupePartage();
        html += construirePagePleine(item.collection, item.produits, pageNo);
        pageNo++;
      } else {
        groupePartage.push(item);
        if (groupePartage.length >= 3) viderGroupePartage();
      }
    });

    viderGroupePartage();
    conteneur.innerHTML = html;

  } catch (e) {
    conteneur.innerHTML = '<div class="chargement">Erreur de connexion : ' + e.message + '</div>';
  }
}

chargerCatalogue();

/* ══════════════════════════════════════
   NAVIGATION LIVRE
══════════════════════════════════════ */
function initialiserLivre() {
  const contenu    = document.getElementById('livre-contenu');
  const btnPrev    = document.getElementById('livre-precedent');
  const btnSuiv    = document.getElementById('livre-suivant');
  const infoVue    = document.getElementById('livre-info');

  const pages = Array.from(contenu.querySelectorAll('.page'));
  if (pages.length === 0) return;

  // Masquer les page-label
  contenu.querySelectorAll('.page-label').forEach(function(el) {
    el.style.display = 'none';
  });

  // Construire les vues
  // Vue 1 : couverture seule (page 0)
  // Vues intermédiaires : doubles pages (pages 1 à N-2, par paires)
  // Dernière vue : dos seul (dernière page)
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
  if (pages.length > 3) {
    obs.disconnect();
    initialiserLivre();
  }
});
_observateur.observe(document.getElementById('livre-contenu'), { childList: true, subtree: true });

var donneesProduits   = []; // [{pro_id, col_id, gam_id, nom, statut, ...}]
var produitActif      = null;
var scrollAvantProduit = 0;
var collectionsDisponibles = {};

async function chargerProduitsData() {
  afficherChargement();
  const [resPro, resFmt] = await Promise.all([
    appelAPI('getProduits'),
    appelAPI('getProduitsFormats')
  ]);
  if (!resPro || !resPro.success) { cacherChargement(); afficherMsg('produits', 'Erreur.', 'erreur'); return; }
  const formatsMap = {};
  if (resFmt && resFmt.success) {
    (resFmt.items || []).forEach(f => {
      if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
      formatsMap[f.pro_id].push({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente });
    });
  }
donneesProduits = (resPro.items || []).sort((a, b) => {
    const colA = donneesCollections.find(c => c.col_id === a.col_id);
    const colB = donneesCollections.find(c => c.col_id === b.col_id);
    const gamA = donneesGammes.find(g => g.gam_id === a.gam_id);
    const gamB = donneesGammes.find(g => g.gam_id === b.gam_id);
    return ((colA?.rang || 99) - (colB?.rang || 99)) ||
           ((gamA?.rang || 99) - (gamB?.rang || 99)) ||
           ((donneesFamilles.find(f => f.fam_id === a.fam_id)?.rang || 99) - (donneesFamilles.find(f => f.fam_id === b.fam_id)?.rang || 99)) ||
           (a.nom || '').localeCompare(b.nom || '');
  }).map(p => ({ ...p, formats: formatsMap[p.pro_id] || [] }));
  cacherChargement();
  afficherProduits();
}

async function afficherProduits() {
  const loading = document.getElementById('loading-produits');
  const grille  = document.getElementById('grille-produits');
  const vide    = document.getElementById('vide-produits');
  if (loading) loading.classList.add('cache');
  if (grille)  grille.classList.add('cache');
  if (vide)    vide.classList.add('cache');

  // Réinitialiser filtres
  const filtreCol = document.getElementById('filtre-recette-collection');
  const filtreLig = document.getElementById('filtre-recette-ligne');
  if (filtreCol) filtreCol.value = '';
  if (filtreLig) { filtreLig.innerHTML = '<option value="">Toutes les gammes</option>'; filtreLig.disabled = true; }

  await chargerCollectionsPourSelecteur();

  if (!donneesProduits.length) { if (vide) vide.classList.remove('cache'); return; }

  if (grille) { grille.innerHTML = ''; grille.classList.remove('cache'); }

  // Regrouper par collection puis gamme
  const parCollection = {};
  const ordreCollections = [];
  donneesProduits.forEach(pro => {
    const col = donneesCollections.find(c => c.col_id === pro.col_id);
    const colId = pro.col_id || '—';
    if (!parCollection[colId]) { parCollection[colId] = { nom: col?.nom || colId, gammes: {} }; ordreCollections.push(colId); }
    const gam = donneesGammes.find(g => g.gam_id === pro.gam_id);
    const gamId = pro.gam_id || '';
    const gamNom = gam?.nom || '';
    if (!parCollection[colId].gammes[gamId]) parCollection[colId].gammes[gamId] = { nom: gamNom, rang: gam?.rang || 99, produits: [] };
    parCollection[colId].gammes[gamId].produits.push(pro);
  });

  ordreCollections.forEach(colId => {
    const colData = parCollection[colId];
    const secCol = document.createElement('div');
    secCol.className = 'recette-section-collection';
    secCol.dataset.collection = colData.nom;
    secCol.innerHTML = `<div class="recette-collection-titre">${colData.nom.toUpperCase()}</div>`;

    const gammesTriees = Object.values(colData.gammes).sort((a, b) => (a.rang || 99) - (b.rang || 99));
    gammesTriees.forEach(gamData => {
      const secGam = document.createElement('div');
      secGam.className = 'recette-section-ligne';
      secGam.dataset.ligne = gamData.nom;
      if (gamData.nom) {
        secGam.innerHTML = `<div class="recette-ligne-titre">${gamData.nom.toUpperCase()}</div>`;
      }
      const grilleInner = document.createElement('div');
      grilleInner.className = 'recette-cartes-grille';

      gamData.produits.forEach(pro => {
        const couleur = pro.couleur_hex || 'var(--gris)';
		
		
    const div = document.createElement('div');
        div.className = 'carte-produit';
        div.dataset.proId = pro.pro_id;
        div.onclick = () => {
          scrollAvantProduit = document.querySelector('.admin-contenu')?.scrollTop || window.scrollY;
          div.classList.add('carte-produit-chargement');
          div.insertAdjacentHTML('beforeend', '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>');
          ouvrirFicheProduit(pro.pro_id).finally(() => {
            div.classList.remove('carte-produit-chargement');
            const sp = div.querySelector('.spinner');
            if (sp) sp.remove();
          });
        };
        div.style.setProperty('--col-hex', couleur);
        const col = donneesCollections.find(c => c.col_id === pro.col_id);
        div.innerHTML = `
          <div class="carte-visuel">
            <span class="carte-statut-badge${pro.statut !== 'public' ? ' test' : ''}">${pro.statut === 'public' ? 'Public' : 'Test'}</span>
            <div class="carte-couleur">
              ${pro.image_url
                ? `<img src="${pro.image_url}" alt="${pro.nom}" onerror="this.style.display='none'">`
                : `<div class="carte-photo-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Photo à venir
                  </div>`}
              <div class="recette-couleur-overlay"></div>
              <div class="carte-couleur-dot"></div>
            </div>
          </div>
          <div class="carte-infos ${couleurTexteContraste(couleur)}">
            <span class="carte-collection-badge">${col?.nom || '—'}</span>
            <div class="carte-nom">${pro.nom || '—'}</div>
            <div class="carte-ligne">${gamData.nom}</div>
          <div class="carte-bas">
              ${(pro.formats && pro.formats.length) ? `<div class="carte-formats">${[...pro.formats].sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids)).map(f => `<div class="carte-format-tag"><span class="carte-format-prix">${parseFloat(f.prix_vente).toFixed(2).replace('.', ',')} $</span><span class="carte-format-sep"></span><span class="carte-format-poids">${f.poids} ${f.unite}</span></div>`).join('')}</div>` : ''}
            </div>
          </div>`;
		  
		  
		  
        grilleInner.appendChild(div);
      });

      secGam.appendChild(grilleInner);
      secCol.appendChild(secGam);
    });

    if (grille) grille.appendChild(secCol);
  });

  peuplerFiltresRecettes();
}

function peuplerFiltresRecettes() {
  const bar = document.getElementById('filtre-recette-collection-bar');
  if (!bar) return;
  bar.innerHTML = '<button class="filtre-btn actif" data-col="" onclick="onFiltreCollectionBtn(this, \'\')">Tout</button>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    bar.innerHTML += `<button class="filtre-btn" data-col="${col.nom}" onclick="onFiltreCollectionBtn(this, '${col.nom}')">${col.nom}</button>`;
  });
}

function onFiltreCollectionBtn(btn, colNom) {
  document.querySelectorAll('#filtre-recette-collection-bar .filtre-btn').forEach(b => b.classList.remove('actif'));
  btn.classList.add('actif');
  const bar = document.getElementById('filtre-recette-ligne-bar');
  bar.innerHTML = '';
  if (colNom) {
    const col = donneesCollections.find(c => c.nom === colNom);
    const gammes = col ? donneesGammes.filter(g => g.col_id === col.col_id) : [];
    if (gammes.length > 1) {
      bar.classList.remove('cache');
      bar.innerHTML = '<button class="filtre-btn actif" onclick="onFiltreGammeBtn(this, \'\')">Toutes</button>';
      gammes.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(g => {
        bar.innerHTML += `<button class="filtre-btn" onclick="onFiltreGammeBtn(this, '${g.nom}')">${g.nom}</button>`;
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
  document.querySelectorAll('#filtre-recette-ligne-bar .filtre-btn').forEach(b => b.classList.remove('actif'));
  btn.classList.add('actif');
  document.getElementById('filtre-recette-ligne').value = gamNom;
  filtrerRecettes();
}

function onFiltreCollection() {
  const colNom   = document.getElementById('filtre-recette-collection').value;
  const selGamme = document.getElementById('filtre-recette-ligne');
  selGamme.innerHTML = '<option value="">Toutes les gammes</option>';
  if (colNom) {
    const col    = donneesCollections.find(c => c.nom === colNom);
    const gammes = col ? donneesGammes.filter(g => g.col_id === col.col_id) : [];
    gammes.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(g => {
      const opt = document.createElement('option');
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
  const colBtn = document.querySelector('#filtre-recette-collection-bar .filtre-btn.actif');
  const col    = colBtn ? colBtn.dataset.col : '';
  const gamBtn = document.querySelector('#filtre-recette-ligne-bar .filtre-btn.actif');
  const gamme  = (gamBtn && gamBtn.textContent.trim() !== 'Toutes') ? gamBtn.textContent.trim() : '';
  const statut = document.getElementById('filtre-recette-statut')?.value;
  const nom    = (document.getElementById('filtre-recette-nom')?.value || '').toLowerCase().trim();
  const cartes = document.querySelectorAll('#grille-produits .carte-produit');
  const vide   = document.getElementById('vide-produits');
  let visible  = 0;
  cartes.forEach(carte => {
    const pro = donneesProduits.find(p => p.pro_id === carte.dataset.proId);
    if (!pro) return;
    const colObj = donneesCollections.find(c => c.col_id === pro.col_id);
    const gamObj = donneesGammes.find(g => g.gam_id === pro.gam_id);
    const ok = (!col    || colObj?.nom === col)
            && (!gamme  || gamObj?.nom === gamme)
            && (!statut || (pro.statut || 'test') === statut)
            && (!nom    || pro.nom.toLowerCase().includes(nom));
    carte.classList.toggle('cache', !ok);
    if (ok) visible++;
  });
  if (vide) vide.classList.toggle('cache', visible !== 0);

  document.querySelectorAll('#grille-produits .recette-section-ligne').forEach(sec => {
    const aDesCartesVisibles = [...sec.querySelectorAll('.carte-produit')].some(c => !c.classList.contains('cache'));
    sec.classList.toggle('cache', !aDesCartesVisibles);
  });
  document.querySelectorAll('#grille-produits .recette-section-collection').forEach(sec => {
    const aDesLignesVisibles = [...sec.querySelectorAll('.recette-section-ligne')].some(l => !l.classList.contains('cache'));
    sec.classList.toggle('cache', !aDesLignesVisibles);
  });
}

function reinitialiserFiltresRecettes() {
  document.querySelectorAll('#filtre-recette-collection-bar .filtre-btn').forEach(b => b.classList.remove('actif'));
  const btnTout = document.querySelector('#filtre-recette-collection-bar .filtre-btn');
  if (btnTout) btnTout.classList.add('actif');
  const bar = document.getElementById('filtre-recette-ligne-bar');
  if (bar) { bar.innerHTML = ''; bar.classList.add('cache'); }
  filtrerRecettes();
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

async function chargerCollectionsPourSelecteur() {
  const sel = document.getElementById('fr-collection');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  collectionsDisponibles = {};
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(col => {
    collectionsDisponibles[col.col_id] = donneesGammes.filter(g => g.col_id === col.col_id);
    const o = document.createElement('option');
    o.value = col.col_id; o.textContent = col.nom; sel.appendChild(o);
  });
 // Famille
  const selFam = document.getElementById('fr-famille');
  if (selFam) {
    selFam.innerHTML = '<option value="">— Aucune —</option>';
    donneesFamilles.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).forEach(fam => {
      const o = document.createElement('option');
      o.value = fam.fam_id; o.textContent = fam.nom; selFam.appendChild(o);
    });
  }

  // Collections secondaires
  const selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    selSec.innerHTML = '';
    donneesCollections.forEach(col => {
      const label = document.createElement('label');
      const cb    = document.createElement('input');
      cb.type = 'checkbox'; cb.value = col.col_id; cb.id = 'sec-' + col.col_id;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(col.nom));
      selSec.appendChild(label);
    });
  }
}

// Filtre Collection → Gamme dans formulaire produit
async function mettreAJourLignes() {
  const col_id = document.getElementById('fr-collection').value;
  const sel    = document.getElementById('fr-ligne');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  const gammes = (collectionsDisponibles[col_id] || []).sort((a, b) => (a.rang || 99) - (b.rang || 99));
if (!gammes.length) { sel.innerHTML = '<option value="">— Aucune gamme —</option>'; sel.disabled = true; return; }
  sel.disabled = false;
  
  gammes.forEach(g => {
    const o = document.createElement('option'); o.value = g.gam_id; o.textContent = g.nom; sel.appendChild(o);
  });
  sel.disabled = false;
  const selFam = document.getElementById('fr-famille');
  if (selFam) {
    const valFam = selFam.value;
    selFam.innerHTML = '<option value="">— Aucune —</option>';
    donneesFamilles.filter(f => f.col_id === col_id).sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).forEach(fam => {
      const o = document.createElement('option'); o.value = fam.fam_id; o.textContent = fam.nom; selFam.appendChild(o);
    });
    selFam.value = valFam;
  }
}

async function ouvrirFicheProduit(pro_id) {
  afficherChargement();
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  if (!pro) return;
  produitActif = pro;

  // Charger les formats
  const resFormats = await appelAPI('getProduitsFormats', { pro_id });
  const formats    = (resFormats && resFormats.success) ? resFormats.items : [];

  const col = donneesCollections.find(c => c.col_id === pro.col_id);
  const gam = donneesGammes.find(g => g.gam_id === pro.gam_id);

  const resEmb = await appelAPI('getFormatsEmballages', { pro_id });
  const embItems = (resEmb && resEmb.success) ? resEmb.items : [];

  // Charger les ingrédients
  const resIng = await appelAPI('getProduitsIngredients', { pro_id });
  const ings   = (resIng && resIng.success) ? resIng.items : [];

  // Charger le stock si pas encore en mémoire
 if (!listesDropdown.stock || !listesDropdown.stock.length) {
    const resSto = await appelAPI('getStock');
    listesDropdown.stock = (resSto && resSto.success) ? resSto.items : [];
  }
  const stock  = listesDropdown.stock  || [];
  const config = listesDropdown.config || {};
  let coutTotal  = 0;
  ings.forEach(ing => {
    const stockItem = stock.find(s => s.ing_id === ing.ing_id);
    const prixParG  = stockItem ? (stockItem.prix_par_g_reel || 0) : 0;
    const cat_id    = stockItem ? (stockItem.cat_id || '') : '';
    const cfg       = config[cat_id] || {};
    const perte     = cfg.margePertePct || 0;
    const facteur   = 1 + (perte / 100);
    const sousTotal = (ing.quantite_g || 0) * prixParG * facteur;
    coutTotal += sousTotal;
  });
  const cout = coutTotal;

  const formatsHtml = formats.length
    ? formats.map(f => {
        const nbUnites = f.nb_unites || 0;
        const coutIngParUnite = nbUnites > 0 ? cout / nbUnites : 0;
        const embsDuFormat = embItems.filter(e => String(e.poids) === String(f.poids) && e.unite === f.unite);
        const coutEmb = embsDuFormat.reduce((s, e) => {
          const stockItem = (listesDropdown.stock || []).find(st => st.ing_id === e.ing_id);
          const prixParG  = stockItem?.prix_par_g_reel || 0;
          return s + ((e.nb_par_unite || 1) * prixParG);
        }, 0);
        const coutTotal_f = coutIngParUnite + coutEmb;
        const marge = f.prix_vente && coutTotal_f > 0 ? ((f.prix_vente - coutTotal_f) / f.prix_vente * 100).toFixed(1) : '—';
        return `<div class="fiche-ingredient">
          <span class="fiche-ing-nom">${f.poids} ${f.unite}</span>
          <span class="fiche-ing-qte">${f.prix_vente ? formaterPrix(f.prix_vente) : '—'}</span>
          <span class="fiche-ing-qte">${nbUnites ? nbUnites + ' unités' : '—'}</span>
          <span class="fiche-ing-qte">${coutTotal_f > 0 ? formaterPrix(coutTotal_f) + '/unité' : '—'}</span>
          <span class="fiche-ing-qte">${marge !== '—' ? marge + '% marge' : '—'}</span>
        </div>`;
      }).join('')
    : '<div class="fiche-vide fiche-label-manquant">⚠ Aucun format</div>';

  
  const nbUnites    = pro.nb_unites || 1;
  const coutParUnit = cout > 0 ? (cout / nbUnites).toFixed(2) + ' $' : '—';
  const coutHtml = `<div class="fiche-champ"><span class="fiche-label">Coût de revient estimé</span><span class="fiche-valeur">${cout > 0 ? cout.toFixed(2) + ' $' : '—'}</span></div><div class="fiche-champ"><span class="fiche-label">Coût par unité (${nbUnites} unités)</span><span class="fiche-valeur">${coutParUnit}</span></div>`;
  const ingsHtml = ings.length
    ? ings.sort((a, b) => b.quantite_g - a.quantite_g).map(i => {
        const inciObj  = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient);
        const inciCode = inciObj?.inci || '';
        const sansInci = !inciCode;
        const stockItem2 = (listesDropdown.stock || []).find(s => s.ing_id === i.ing_id);
        const prixParG2  = stockItem2 ? (stockItem2.prix_par_g_reel || 0) : 0;
        const coutIng    = prixParG2 > 0 ? (i.quantite_g * prixParG2).toFixed(2) + ' $' : '⚠';
        return `<div class="fiche-ingredient"><span class="fiche-ing-nom${sansInci ? ' fiche-label-manquant' : ''}">${sansInci ? '⚠ ' : ''}${i.nom_ingredient}</span><span class="fiche-ing-inci">${inciCode}</span><span class="fiche-ing-qte">${i.quantite_g} g</span><span class="fiche-ing-qte">${coutIng}</span></div>`;
      }).join('')
   : '<div class="fiche-vide">Aucun ingrédient</div>';

  const inciLabel = ings
    .filter(i => {
      const obj = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient);
      return obj?.inci;
    })
    .sort((a, b) => b.quantite_g - a.quantite_g)
    .map(i => {
      const obj = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient);
      return obj.inci.trim();
    })
    .join(', ');
  const inciLabelHtml = inciLabel
    ? `<div class="inci-label-texte">${inciLabel}</div>`
    : '<div class="fiche-vide">Aucun code INCI disponible</div>';

  cacherChargement();
  document.getElementById('fiche-recette-titre').textContent = pro.nom || '—';
  document.getElementById('fiche-recette-contenu').innerHTML = `
    <div class="fiche-visuel">
      ${pro.image_url ? `<img src="${pro.image_url}" class="fiche-visuel-photo">` : ''}
      <div class="fiche-visuel-hex" style="background:${pro.couleur_hex || 'var(--beige)'}"></div>
    </div>
    <div class="fiche-grille">
      <div class="fiche-champ"><span class="fiche-label">Collection</span><span class="fiche-valeur">${col?.nom || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Gamme</span><span class="fiche-valeur">${gam?.nom || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Statut</span><span class="fiche-valeur">${pro.statut || 'test'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Cure</span><span class="fiche-valeur">${pro.cure || '—'} jours</span></div>
      <div class="fiche-champ"><span class="fiche-label">Nb unités</span><span class="fiche-valeur">${pro.nb_unites || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Surgras</span><span class="fiche-valeur">${pro.surgras || '—'}</span></div>
      <div class="fiche-champ"><span class="fiche-label">Couleur HEX</span><span class="fiche-valeur">${pro.couleur_hex || '—'}</span></div>
      ${coutHtml}
    </div>
    <div class="fiche-section-titre">Description</div>
    <div class="fiche-texte">${pro.description || '—'}</div>
    <div class="fiche-section-titre">Instructions</div>
    <div class="fiche-texte">${pro.instructions || '—'}</div>
    <div class="fiche-section-titre">Description pour emballage</div>
    <div class="fiche-texte">${pro.desc_emballage || '—'}</div>
    <div class="fiche-section-titre">Notes</div>
    <div class="fiche-texte">${pro.notes || '—'}</div>
    <div class="fiche-section-titre">Avertissement</div>
    <div class="fiche-texte">${pro.avertissement || '—'}</div>
    <div class="fiche-section-titre">Mode d'emploi</div>
    <div class="fiche-texte">${pro.mode_emploi || '—'}</div>
    <div class="fiche-section-titre">Ingrédients</div>
    <div class="fiche-ingredient fiche-ingredient-labels">
      <span class="fiche-ing-nom">Nom</span>
      <span class="fiche-ing-inci">INCI</span>
      <span class="fiche-ing-qte">Qté</span>
      <span class="fiche-ing-qte">Prix</span>
    </div>
    <div class="fiche-ingredients">${ingsHtml}</div>
    <div class="fiche-section-titre">Liste INCI pour étiquette</div>
    <div class="fiche-inci-etiquette">${inciLabelHtml}</div>
    <div class="fiche-section-titre">Formats disponibles</div>
    <div class="fiche-ingredient fiche-ingredient-labels">
      <span class="fiche-ing-nom">Format</span>
      <span class="fiche-ing-qte">Prix vente</span>
      <span class="fiche-ing-qte">Nb unités</span>
      <span class="fiche-ing-qte">Coût/unité</span>
      <span class="fiche-ing-qte">Marge</span>
    </div>
    <div class="fiche-ingredients">${formatsHtml}</div>
    <div class="fiche-section-titre">Export</div>
    <button class="bouton" onclick="exporterFicheProduit()">Copier pour le graphiste</button>
  `;

  fermerFormProduit();
  document.getElementById('fiche-recette').classList.remove('cache');
  document.querySelector('#section-produits .filtres-bar')?.classList.add('cache');
  document.getElementById('grille-produits').classList.add('cache');
  document.getElementById('btn-nouvelle-recette').classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function exporterFicheProduit() {
  if (!produitActif) return;
  const pro = produitActif;
  const col = donneesCollections.find(c => c.col_id === pro.col_id);
  const gam = donneesGammes.find(g => g.gam_id === pro.gam_id);
  const fam = donneesFamilles?.find(f => f.fam_id === pro.fam_id);
  const ings = pro.ingredients || [];
  const formats = pro.formats || [];

  const inciLabel = ings
    .filter(i => { const o = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient); return o?.inci; })
    .sort((a, b) => b.quantite_g - a.quantite_g)
    .map(i => { const o = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient); return o.inci.trim(); })
    .join(', ');

  const ingsTexte = ings.sort((a,b) => b.quantite_g - a.quantite_g)
    .map(i => { const o = listesDropdown.fullData.find(d => d.ing_id === i.ing_id || d.nom_UC === i.nom_ingredient); return `  - ${i.nom_ingredient} | ${o?.inci || '⚠ INCI manquant'} | ${i.quantite_g} g`; })
    .join('\n');

  const formatsTexte = formats.map(f => `  - ${f.nom || f.format || ''} : ${f.prix || '—'} $`).join('\n');

  const texte = [
    `NOM : ${pro.nom || '—'}`,
    `COLLECTION : ${col?.nom || '—'}`,
    `GAMME : ${gam?.nom || '—'}`,
    `FAMILLE : ${fam?.nom || '—'}`,
    `STATUT : ${pro.statut || '—'}`,
    `COULEUR HEX : ${pro.couleur_hex || '—'}`,
    `IMAGE : ${pro.image_url || '—'}`,
    `IMAGE NOËL : ${pro.image_noel_url || '—'}`,
    `\nDESCRIPTION :\n${pro.description || '—'}`,
    `\nDESCRIPTION EMBALLAGE :\n${pro.desc_emballage || '—'}`,
    `\nINSTRUCTIONS :\n${pro.instructions || '—'}`,
    `\nNOTES :\n${pro.notes || '—'}`,
    `\nAVERTISSEMENT :\n${pro.avertissement || '—'}`,
    `\nMODE D'EMPLOI :\n${pro.mode_emploi || '—'}`,
    `\nLISTE INCI :\n${inciLabel || '—'}`,
    `\nINGRÉDIENTS :\n${ingsTexte || '—'}`,
    `\nFORMATS :\n${formatsTexte || '—'}`,
  ].join('\n');

  navigator.clipboard.writeText(texte).then(() => afficherMsg('produits', '✅ Copié dans le presse-papier.'));
}

function fermerFicheProduit() {
  document.getElementById('fiche-recette').classList.add('cache');
  document.querySelector('#section-produits .filtres-bar')?.classList.remove('cache');
  document.getElementById('grille-produits').classList.remove('cache');
  document.getElementById('btn-nouvelle-recette').classList.remove('cache');
  document.getElementById('filtre-recette-nom').value = '';
  filtrerRecettes();
  produitActif = null;
  const contenu = document.querySelector('.admin-contenu');
  if (contenu) contenu.scrollTop = scrollAvantProduit;
  else window.scrollTo(0, scrollAvantProduit);
}

// Compatibilité noms V1 dans le HTML — fermerFicheRecette défini comme function ci-dessous

async function basculerModeEditionRecette() {
  if (!produitActif) return;
  document.getElementById('fiche-recette').classList.add('cache');
  await modifierProduit(produitActif.pro_id);
}

function supprimerRecetteActive() {
  if (!produitActif) return;
  supprimerProduit(produitActif.pro_id);
}
function fermerFicheRecette() { fermerFicheProduit(); }

function ouvrirFormRecette() { ouvrirFormProduit(); }

async function ouvrirFormProduit() {
  formatsRecette = [];
  ingredientsRecette = [];
  emballagesRecette = {};
  document.getElementById('form-recettes-titre').textContent = 'Nouveau produit';
  document.getElementById('fr-id').value = '';
['fr-nom','fr-couleur','fr-unites','fr-cure','fr-description','fr-instructions','fr-notes','fr-surgras','fr-avertissement','fr-mode-emploi']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('fr-statut').value     = 'test';
 document.getElementById('fr-collection').value = '';
  document.getElementById('fr-ligne').innerHTML  = '<option value="">— Choisir collection —</option>';
  document.getElementById('fr-ligne').disabled = true;
  document.getElementById('fr-couleur-visible').value = '';
  document.getElementById('fr-image-url').value       = '';
  document.getElementById('fr-image-url-noel').value  = '';
  const prevRecette = document.getElementById('fr-image-preview');
  if (prevRecette) { prevRecette.src = ''; prevRecette.classList.add('cache'); }
  const prevNoel = document.getElementById('fr-image-preview-noel');
  if (prevNoel) prevNoel.innerHTML = '';
  const apercuRecette = document.getElementById('fr-couleur-apercu');
  if (apercuRecette) apercuRecette.style.background = '';
  document.querySelector('#section-produits .filtres-bar')?.classList.add('cache');
  document.getElementById('grille-produits').classList.add('cache');
  document.getElementById('btn-nouvelle-recette').classList.add('cache');
  await chargerCollectionsPourSelecteur();
 document.getElementById('form-recettes').classList.remove('cache');
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormProduit() {
  document.getElementById('form-recettes').classList.add('cache');
  const filtresBar = document.querySelector('#section-produits .filtres-bar');
  if (filtresBar) filtresBar.classList.remove('cache');
  document.getElementById('grille-produits').classList.remove('cache');
  document.getElementById('btn-nouvelle-recette').classList.remove('cache');
}

function fermerFormRecette() { fermerFormProduit(); }

async function modifierProduit(pro_id) {
  afficherChargement();
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  if (!pro) return;

  // Charger les formats et ingrédients
  const [resFormats, resIngs] = await Promise.all([
    appelAPI('getProduitsFormats', { pro_id }),
    appelAPI('getProduitsIngredients', { pro_id })
  ]);

  document.getElementById('form-recettes-titre').textContent   = 'Modifier le produit';
  document.getElementById('fr-id').value                       = pro.pro_id;
  document.getElementById('fr-nom').value                      = pro.nom || '';
  document.getElementById('fr-couleur').value                  = pro.couleur_hex || '';
  document.getElementById('fr-couleur-visible').value          = pro.couleur_hex || '';
  const apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercuCouleurRecette(document.getElementById('fr-couleur-visible'));
  document.getElementById('fr-unites').value                   = pro.nb_unites || '';
  document.getElementById('fr-cure').value                     = pro.cure || '';
  document.getElementById('fr-description').value              = pro.description || '';
  const descEmb = document.getElementById('fr-desc-emballage');
  if (descEmb) descEmb.value = pro.desc_emballage || '';
  document.getElementById('fr-instructions').value             = pro.instructions || '';
  document.getElementById('fr-notes').value                    = pro.notes || '';
  const elAvert = document.getElementById('fr-avertissement');
  if (elAvert) elAvert.value = pro.avertissement || '';
  const elMode = document.getElementById('fr-mode-emploi');
  if (elMode) elMode.value = pro.mode_emploi || '';
  document.getElementById('fr-surgras').value                  = pro.surgras || '';
  document.getElementById('fr-statut').value                   = pro.statut || 'test';
await chargerCollectionsPourSelecteur();
  document.getElementById('fr-collection').value               = pro.col_id || '';
  await mettreAJourLignes();
  document.getElementById('fr-ligne').value                    = pro.gam_id || '';
  const selFamProd = document.getElementById('fr-famille');
  if (selFamProd) selFamProd.value = pro.fam_id || '';
  document.getElementById('fr-image-url').value                = pro.image_url || '';
  const preview = document.getElementById('fr-image-preview');
  if (preview) preview.innerHTML = pro.image_url ? `<img src="${pro.image_url}" class="photo-preview">` : '';
  document.getElementById('fr-image-url-noel').value           = pro.image_noel_url || '';
  const previewNoel = document.getElementById('fr-image-preview-noel');
  if (previewNoel) previewNoel.innerHTML = pro.image_noel_url ? `<img src="${pro.image_noel_url}" class="photo-preview">` : '';

  // Collections secondaires
  const selSec = document.getElementById('fr-collections-secondaires');
  if (selSec) {
    Array.from(selSec.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
      cb.checked = Array.isArray(pro.collections_secondaires) &&
        pro.collections_secondaires.includes(cb.value);
    });
  }

  // Ingrédients
  ingredientsRecette = (resIngs && resIngs.success ? resIngs.items : []).map(i => ({
    ing_id:   i.ing_id,
    type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
    nom:      i.nom_ingredient,
    quantite: i.quantite_g
  })).sort((a, b) => b.quantite - a.quantite);

  // Formats
   formatsRecette = (resFormats && resFormats.success ? resFormats.items : []).map(f => ({
    poids: f.poids, unite: f.unite, prix: f.prix_vente, desc: '', nb_unites: f.nb_unites || 0
  }));

  // Emballages par format
  emballagesRecette = {};
  const resEmb = await appelAPI('getFormatsEmballages', { pro_id });
  if (resEmb && resEmb.success) {
    (resEmb.items || []).forEach(e => {
      const cle = `${e.poids}_${e.unite}`;
      if (!emballagesRecette[cle]) emballagesRecette[cle] = [];
      const ing = (listesDropdown.fullData || []).find(d => d.ing_id === e.ing_id);
      emballagesRecette[cle].push({ ing_id: e.ing_id, cat_id: ing?.cat_id || '', nom: ing?.nom_UC || '', quantite: e.quantite, nb_par_unite: e.nb_par_unite || 1 });
    });
  }

 cacherChargement();
  document.querySelector('#section-produits .filtres-bar')?.classList.add('cache');
  document.getElementById('grille-produits').classList.add('cache');
  document.getElementById('form-recettes').classList.remove('cache');
  rafraichirListeIngredientsRecette();
  rafraichirListeFormatsRecette();
  window.scrollTo(0, 0);;
}

// Compatibilité nom V1
function modifierRecette(id) { return modifierProduit(id); }


async function sauvegarderRecette() {
  afficherChargement();
  const btnSauvegarder = document.querySelector('#form-recettes .form-body-actions .bouton');
  if (btnSauvegarder) { btnSauvegarder.disabled = true; btnSauvegarder.innerHTML = '<span class="spinner"></span> Sauvegarde…'; }

  const id     = document.getElementById('fr-id').value;
  const col_id = document.getElementById('fr-collection').value;
  const gam_id = document.getElementById('fr-ligne').value;

  const d = {
    const dernierNumPro = donneesProduits.length ? Math.max(...donneesProduits.map(p => parseInt((p.pro_id || '').replace('PRO-', '')) || 0)) : 0;
pro_id: id || ('PRO-' + String(dernierNumPro + 1).padStart(4, '0')),
    col_id,
  gam_id,
    fam_id:      document.getElementById('fr-famille')?.value || '',
   nom: (document.getElementById('fr-nom')?.value || '').toUpperCase(),
    couleur_hex: document.getElementById('fr-couleur').value || document.getElementById('fr-couleur-visible').value || '',
    nb_unites:   parseInt(document.getElementById('fr-unites').value) || 1,
    cure:        parseInt(document.getElementById('fr-cure').value) || 0,
    description: document.getElementById('fr-description').value,
    desc_emballage: document.getElementById('fr-desc-emballage')?.value || '',
    instructions:  document.getElementById('fr-instructions').value,
    notes:         document.getElementById('fr-notes').value,
    avertissement: document.getElementById('fr-avertissement')?.value || '',
    mode_emploi:   document.getElementById('fr-mode-emploi')?.value || '',
    surgras:      document.getElementById('fr-surgras').value,
    statut:       document.getElementById('fr-statut').value || 'test',
    image_url:       document.getElementById('fr-image-url').value,
    image_noel_url:  document.getElementById('fr-image-url-noel').value,
    collections_secondaires: Array.from(
      document.getElementById('fr-collections-secondaires')?.querySelectorAll('input[type="checkbox"]:checked') || []
    ).map(cb => cb.value),
    ingredients: ingredientsRecette.map(i => ({
      ing_id:         i.ing_id || '',
      nom_ingredient: i.nom,
      quantite_g:     i.quantite
    })),
    formats: formatsRecette.map(f => ({
      poids: f.poids, unite: f.unite, prix_vente: f.prix, emb_id: '', nb_unites: f.nb_unites || 0
    }))
  };

  if (!d.nom) { afficherMsg('recettes', 'Le nom est requis.', 'erreur'); if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; } return; }
  if (!d.col_id) { afficherMsg('recettes', 'La collection est requise.', 'erreur'); if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; } return; }
  if (!d.gam_id) { afficherMsg('recettes', 'La gamme est requise.', 'erreur'); if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; } return; }

  if (id && ingredientsRecette.length === 0) {
    const resIngs = await appelAPI('getProduitsIngredients', { pro_id: id });
    if (resIngs && resIngs.success && resIngs.items.length > 0) {
      ingredientsRecette = resIngs.items.map(i => ({
        ing_id:   i.ing_id,
        type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
        nom:      i.nom_ingredient,
        quantite: i.quantite_g
      }));
      d.ingredients = ingredientsRecette.map(i => ({
        ing_id:         i.ing_id || '',
        nom_ingredient: i.nom,
        quantite_g:     i.quantite
      }));
    }
  }
  if (id && formatsRecette.length === 0) {
    const resFmts = await appelAPI('getProduitsFormats', { pro_id: id });
    if (resFmts && resFmts.success && resFmts.items.length > 0) {
      formatsRecette = resFmts.items.map(f => ({ poids: f.poids, unite: f.unite, prix: f.prix_vente, desc: '' }));
      d.formats = formatsRecette.map(f => ({ poids: f.poids, unite: f.unite, prix_vente: f.prix, emb_id: '' }));
    }
  }
  
  const res = await appelAPIPost('saveProduit', d);
  if (res && res.success) {
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  // Sauvegarder les emballages par format
    for (const f of formatsRecette) {
      const cle = `${f.poids}_${f.unite}`;
      const embs = emballagesRecette[cle] || [];
      await appelAPIPost('saveFormatsEmballages', {
        pro_id: d.pro_id,
        poids:  f.poids,
        unite:  f.unite,
        emballages: embs.filter(e => e.ing_id).map(e => ({ ing_id: e.ing_id, quantite: e.quantite || 0, nb_par_unite: e.nb_par_unite || 1 }))
      });
    }
    cacherChargement();
    fermerFormProduit();
    afficherMsg('recettes', id ? 'Produit mis à jour.' : 'Produit créé.');
    await chargerProduitsData();
    const contenu = document.querySelector('.admin-contenu');
    if (contenu) contenu.scrollTop = scrollAvantProduit;
 } else {
    cacherChargement();
    afficherMsg('recettes', 'Erreur.', 'erreur');
    if (btnSauvegarder) { btnSauvegarder.disabled = false; btnSauvegarder.innerHTML = 'Enregistrer'; }
  }
}

async function supprimerProduit(pro_id) {
 const resLots = await appelAPI('getLots');
  const lotsLies = (resLots && resLots.success ? resLots.items : []).filter(l => l.pro_id === pro_id);
  if (lotsLies.length > 0) {
    afficherMsg('recettes', `Impossible — ${lotsLies.length} lot(s) de fabrication sont liés à ce produit.`, 'erreur');
    return;
  }
  const resVentes = await appelAPI('getVentesLignes');
  const ventesLiees = (resVentes && resVentes.success ? resVentes.items : []).filter(v => v.pro_id === pro_id);
  if (ventesLiees.length > 0) {
    afficherMsg('recettes', `Impossible — ${ventesLiees.length} vente(s) sont liées à ce produit.`, 'erreur');
    return;
  }
  confirmerAction('Supprimer ce produit ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('deleteProduit', { pro_id });
    if (res && res.success) {
      cacherChargement();
      fermerFicheProduit();
      afficherMsg('recettes', 'Produit supprimé.');
      await chargerProduitsData();
    } else {
      cacherChargement();
      afficherMsg('recettes', 'Erreur.', 'erreur');
    }
  });
}

// supprimerRecetteActive — défini plus haut

// ─── CLOUDINARY ───
var _mediaLibrary        = null;
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
  _mediaLibraryChampId   = champId;
  _mediaLibraryPreviewId = previewId;
  _mediaLibrary = cloudinary.createMediaLibrary(
    { cloud_name: 'dfasrauyy', api_key: '' },
    {
      insertHandler: function(data) {
        if (data && data.assets && data.assets.length > 0) {
          const url = data.assets[0].secure_url;
          document.getElementById(_mediaLibraryChampId).value = url;
          const preview = document.getElementById(_mediaLibraryPreviewId);
          if (preview) preview.innerHTML = `<img src="${url}" class="photo-preview">`;
        }
      }
    }
  );
  _mediaLibrary.show();
  setTimeout(function nettoyerOverlayCloudinary() {
    const overlays = document.querySelectorAll('body > div[style*="z-index: 99999"]');
    overlays.forEach(el => {
      if (el.style.visibility === 'hidden' || el.style.display === 'none') el.remove();
    });
    if (document.querySelector('body > div[style*="z-index: 99999"]')) {
      setTimeout(nettoyerOverlayCloudinary, 1000);
    }
  }, 2000);
}

function fermerMediaLibrary() {
  document.getElementById('modal-cloudinary')?.classList.add('cache');
}

function ouvrirCloudinary()              { ouvrirMediaLibrary('fr-image-url',      'fr-image-preview');       }
function ouvrirCloudinaryCollection()    { ouvrirMediaLibrary('fc-photo-url',       'fc-photo-preview');      }
function ouvrirCloudinaryCollectionNoel(){ ouvrirMediaLibrary('fc-photo-url-noel',  'fc-photo-preview-noel'); }
function ouvrirCloudinaryLigne()         { ouvrirMediaLibrary('fc-photo-url-ligne', 'fc-photo-preview-ligne'); }



// ─── INGRÉDIENTS PRODUIT ───
var ingredientsRecette = [];

function ajouterIngredientRecette(type='', nom='', quantite=0) {
  ingredientsRecette.push({ type, nom, quantite });
  rafraichirListeIngredientsRecette();
}

function supprimerIngredientRecette(index) {
  ingredientsRecette.splice(index, 1);
  rafraichirListeIngredientsRecette();
}

function rafraichirListeIngredientsRecette() {
  const liste = document.getElementById('liste-ingredients-recette');
  if (!liste) return;
  if (ingredientsRecette.length === 0) { liste.innerHTML = ''; return; }
  // V2 : listesDropdown.fullData est [{ing_id, cat_id, nom_UC, inci, ...}]
  const cats  = [...new Set(listesDropdown.fullData.map(d => d.cat_id))].filter(Boolean).sort();
  liste.innerHTML = ingredientsRecette.map((ing, i) => {
    const ingsDeType = listesDropdown.fullData.filter(d => d.cat_id === ing.type);
    const inciObj    = listesDropdown.fullData.find(d => d.ing_id === ing.ing_id) || listesDropdown.fullData.find(d => d.nom_UC === ing.nom) || {};
    const inciVal    = (inciObj.inci || '').trim();
    return `
    <div class="ingredient-rangee">
      <select class="form-ctrl ing-type" onchange="ingredientsRecette[${i}].type=this.value; ingredientsRecette[${i}].nom=''; rafraichirListeIngredientsRecette()">
        <option value="">— Type —</option>
     ${cats.map(t => `<option value="${t}" ${ing.type===t?'selected':''}>${listesDropdown.categoriesMap?.[t]||t}</option>`).join('')}
      </select>
      <select class="form-ctrl ing-nom" onchange="ingredientsRecette[${i}].nom=this.value; ingredientsRecette[${i}].ing_id=(listesDropdown.fullData.find(d=>d.nom_UC===this.value)||{}).ing_id||''; rafraichirListeIngredientsRecette()">
        <option value="">— Ingrédient —</option>
        ${ingsDeType.map(d => `<option value="${d.nom_UC}" ${ing.nom===d.nom_UC?'selected':''}>${d.nom_UC}</option>`).join('')}
      </select>
      <input type="text" class="form-ctrl ing-inci${inciVal ? '' : ' ing-inci-manquant'}" readonly placeholder="INCI manquant" value="${inciVal}">
      <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${ing.quantite||''}" placeholder="g" onchange="ingredientsRecette[${i}].quantite=parseFloat(this.value)||0">
      <button class="bouton bouton-petit bouton-rouge" onclick="supprimerIngredientRecette(${i})">✕</button>
    </div>`;
  }).join('');
}


async function chargerIngredientsBaseRecette() {
  const gam_id = document.getElementById('fr-ligne').value;
  if (!gam_id) { gammesIngs = []; rafraichirListeGammesIngs(); return; }
  const res = await appelAPI('getGammesIngredients', { gam_id });
  gammesIngs = (res && res.success ? res.items : []).map(i => ({
    ing_id:   i.ing_id,
    type:     (listesDropdown.fullData.find(d => d.ing_id === i.ing_id) || {}).cat_id || '',
    nom:      i.nom_ingredient,
    quantite: i.quantite_g
  }));
  if (!document.getElementById('fr-id').value) {
    ingredientsRecette = [...gammesIngs];
    rafraichirListeIngredientsRecette();
  }
  rafraichirListeGammesIngs();
}

// ─── FORMATS PRODUIT ───
var formatsRecette = [];
var emballagesRecette = {}; // { "poids_unite": [{ing_id, nom, quantite}] }

function ajouterFormatRecette(poids='', unite='g', prix='', desc='') {
  formatsRecette.push({ poids, unite, prix, desc });
  rafraichirListeFormatsRecette();
}

function supprimerFormatRecette(index) {
  const f = formatsRecette[index];
  if (f) delete emballagesRecette[`${f.poids}_${f.unite}`];
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
  const liste = document.getElementById('liste-formats-recette');
  if (!liste) return;
  const labels = document.getElementById('labels-formats-recette');
  if (formatsRecette.length === 0) { liste.innerHTML = ''; if (labels) labels.classList.add('cache'); return; }
  if (labels) labels.classList.remove('cache');

  const catsEmb = ['CAT-1776180859522', 'CAT-1776369774938', 'CAT-014'];
  const ingsEmb = (listesDropdown.fullData || []).filter(d => catsEmb.includes(d.cat_id));

  liste.innerHTML = formatsRecette.map((f, i) => {
    const cle = `${f.poids}_${f.unite}`;
    const embs = emballagesRecette[cle] || [];
    const lignesEmb = embs.map((e, j) => {
        const catEmb = e.cat_id || catsEmb.find(c => (listesDropdown.fullData || []).find(d => d.ing_id === e.ing_id && d.cat_id === c)) || '';
        const ingsDecat = catEmb ? (listesDropdown.fullData || []).filter(d => d.cat_id === catEmb) : [];
        return `
        <div class="ingredient-rangee">
          <select class="form-ctrl" onchange="emballagesRecette['${cle}'][${j}].cat_id=this.value; rafraichirListeFormatsRecette()">
            <option value="">— Catégorie —</option>
            ${catsEmb.map(c => `<option value="${c}" ${catEmb===c?'selected':''}>${listesDropdown.categoriesMap?.[c]||c}</option>`).join('')}
          </select>
          <select class="form-ctrl" onchange="emballagesRecette['${cle}'][${j}].ing_id=this.value; emballagesRecette['${cle}'][${j}].nom=(listesDropdown.fullData.find(d=>d.ing_id===this.value)||{}).nom_UC||'';">
            <option value="">— Nom UC —</option>
            ${ingsDecat.map(d => `<option value="${d.ing_id}" ${d.ing_id===e.ing_id?'selected':''}>${d.nom_UC}</option>`).join('')}
          </select>
          <input type="text" inputmode="decimal" class="form-ctrl ing-qte" value="${e.nb_par_unite||1}" placeholder="Nb/unité" onchange="emballagesRecette['${cle}'][${j}].nb_par_unite=parseFloat(this.value)||1">
          <button class="bouton bouton-petit bouton-rouge" onclick="supprimerEmballageFormat('${cle}',${j})">✕</button>
        </div>`;
      }).join('');

    return `
    <div class="ingredient-rangee">
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.poids||''}" placeholder="Poids" onchange="formatsRecette[${i}].poids=this.value">
      <select class="form-ctrl" onchange="formatsRecette[${i}].unite=this.value">
        <option value="g" ${f.unite==='g'?'selected':''}>g</option>
        <option value="ml" ${f.unite==='ml'?'selected':''}>ml</option>
      </select>
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.prix||''}" placeholder="Prix $" onchange="formatsRecette[${i}].prix=parseFloat(this.value)||0">
      <input type="text" inputmode="decimal" class="form-ctrl" value="${f.nb_unites||''}" placeholder="Nb unités" onchange="formatsRecette[${i}].nb_unites=parseInt(this.value)||0">
      <button class="bouton bouton-petit bouton-rouge" onclick="supprimerFormatRecette(${i})">✕</button>
    </div>
    <div class="ingredient-rangee" style="font-size:0.75rem;color:var(--gris);text-transform:uppercase;">
        <span style="flex:2">Contenant et emballage</span>
        <span style="flex:2">Nom UC</span>
        <span style="width:90px;flex:none">Nb/unité</span>
      </div>
      ${lignesEmb}
      <button type="button" class="bouton bouton-petit bouton-vert-pale" onclick="ajouterEmballageFormat('${cle}')">+ Ajouter</button>`;
  }).join('');
}

function apercuCouleurRecette(input) {
  const apercu = document.getElementById('fr-couleur-apercu');
  if (apercu) apercu.style.background = /^#[0-9a-fA-F]{6}$/.test(input.value.trim()) ? input.value.trim() : 'var(--beige)';
  document.getElementById('fr-couleur').value = input.value;
}
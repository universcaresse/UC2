/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-remboursements.js
   Créé le 4 mai 2026 selon LOGIQUE-VENTES.md
   ═══════════════════════════════════════ */

// ─── ÉTAT GLOBAL ───
var remLignes              = [];
var remIdEnCours           = null;
var remNumeroAffiche       = '';
var remType                = ''; // 'avec-retour' ou 'sans-retour'
var toutesRemboursements   = [];

// ═══════════════════════════════════════
// CHARGEMENT DE LA PAGE
// ═══════════════════════════════════════
async function chargerRemboursements() {
  const loading = document.getElementById('loading-remboursements');
  const vide    = document.getElementById('vide-remboursements');
  if (loading) loading.classList.remove('cache');

  const res = await appelAPI('getRemboursementsEntete');

  if (loading) loading.classList.add('cache');

  if (!res || !res.success || !res.items.length) {
    toutesRemboursements = [];
    if (vide) vide.classList.remove('cache');
    return;
  }

  toutesRemboursements = res.items;
  if (vide) vide.classList.add('cache');
  afficherTableauRemboursements(toutesRemboursements);
}

// ═══════════════════════════════════════
// NOUVEAU REMBOURSEMENT — OUVERTURE
// ═══════════════════════════════════════
function ouvrirFormRemboursement() {
  remLignes = [];
  remType   = '';

  // Générer un nouveau numéro
  const dernierNum = toutesRemboursements.length
    ? Math.max(...toutesRemboursements.map(r => parseInt((r.rem_id || '').replace('REM-', '')) || 0))
    : 0;
  remIdEnCours     = 'REM-' + String(dernierNum + 1).padStart(4, '0');
  remNumeroAffiche = String(dernierNum + 1).padStart(4, '0');

  // Réinitialiser tous les champs
  document.getElementById('rem-type').value          = '';
  document.getElementById('rem-saisie-produit').classList.add('cache');
  document.getElementById('rem-saisie-libre').classList.add('cache');
  document.getElementById('rem-liste-panel').classList.add('cache');
  document.getElementById('rem-client-panel').classList.add('cache');
  document.getElementById('rem-paiement-panel').classList.add('cache');

  // Vider les champs produit
  const selCol = document.getElementById('rem-collection');
  selCol.innerHTML = '<option value="">— Collection —</option>';
  donneesCollections
    .slice()
    .sort((a, b) => (a.rang || 99) - (b.rang || 99))
    .forEach(c => {
      const o = document.createElement('option');
      o.value = c.col_id;
      o.textContent = c.nom;
      selCol.appendChild(o);
    });

  document.getElementById('rem-gamme').innerHTML       = '<option value="">— Gamme —</option>';
  document.getElementById('rem-produit').innerHTML     = '<option value="">— Produit —</option>';
  document.getElementById('rem-format').innerHTML      = '<option value="">— Format —</option>';
  document.getElementById('rem-quantite').value        = '1';
  document.getElementById('rem-prix').value            = '';
  document.getElementById('rem-total-ligne').value     = '';

  // Vider les champs libres
  document.getElementById('rem-libre-description').value = '';
  document.getElementById('rem-libre-montant').value     = '';

  // Vider client
  document.getElementById('rem-client').value    = '';
  document.getElementById('rem-courriel').value  = '';
  document.getElementById('rem-telephone').value = '';

  // Vider total
  document.getElementById('rem-total').value = '';
  document.getElementById('rem-liste').innerHTML = '';

  // Afficher le formulaire
  document.getElementById('contenu-remboursements').classList.add('cache');
  document.getElementById('filtres-remboursements').classList.add('cache');
  document.getElementById('form-remboursement').classList.remove('cache');
  document.querySelector('#section-remboursements .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormRemboursement() {
  document.getElementById('form-remboursement').classList.add('cache');
  document.getElementById('filtres-remboursements').classList.remove('cache');
  document.getElementById('contenu-remboursements').classList.remove('cache');
  document.querySelector('#section-remboursements .page-entete .bouton')?.classList.remove('cache');
  remLignes = [];
  remIdEnCours = null;
  remType = '';
}

// ═══════════════════════════════════════
// CHANGER LE TYPE DE REMBOURSEMENT
// ═══════════════════════════════════════
function remChangerType() {
  const type = document.getElementById('rem-type').value;
  remType = type;

  // Cacher les deux modes
  document.getElementById('rem-saisie-produit').classList.add('cache');
  document.getElementById('rem-saisie-libre').classList.add('cache');

  // Afficher le bon mode
  if (type === 'avec-retour') {
    document.getElementById('rem-saisie-produit').classList.remove('cache');
  } else if (type === 'sans-retour') {
    document.getElementById('rem-saisie-libre').classList.remove('cache');
  }

  // Réinitialiser les lignes (changer de type efface les lignes précédentes)
  remLignes = [];
  remRafraichirListe();
}

// ═══════════════════════════════════════
// CASCADE COLLECTION → GAMME → PRODUIT → FORMAT (avec-retour)
// ═══════════════════════════════════════
function remFiltrerGammes() {
  const col_id = document.getElementById('rem-collection').value;
  const sel    = document.getElementById('rem-gamme');
  sel.innerHTML = '<option value="">— Toutes —</option>';
  donneesGammes
    .filter(g => !col_id || g.col_id === col_id)
    .sort((a, b) => (a.rang || 99) - (b.rang || 99))
    .forEach(g => {
      const o = document.createElement('option');
      o.value = g.gam_id;
      o.textContent = g.nom;
      sel.appendChild(o);
    });
  remFiltrerProduits();
}

function remFiltrerProduits() {
  const col_id = document.getElementById('rem-collection').value;
  const gam_id = document.getElementById('rem-gamme').value;
  const sel    = document.getElementById('rem-produit');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  donneesProduits
    .filter(p => p.statut !== 'archive' && (!col_id || p.col_id === col_id) && (!gam_id || p.gam_id === gam_id))
    .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))
    .forEach(p => {
      const o = document.createElement('option');
      o.value = p.pro_id;
      o.textContent = p.nom;
      sel.appendChild(o);
    });
  document.getElementById('rem-format').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('rem-prix').value        = '';
  document.getElementById('rem-total-ligne').value = '';
}

function remFiltrerFormats() {
  const pro_id = document.getElementById('rem-produit').value;
  const sel    = document.getElementById('rem-format');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  if (!pro_id) return;
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  (pro?.formats || [])
    .slice()
    .sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids))
    .forEach(f => {
      const o = document.createElement('option');
      o.value = JSON.stringify({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente });
      o.textContent = `${f.poids} ${f.unite}`;
      sel.appendChild(o);
    });
  remMettreAJourPrix();
}

function remMettreAJourPrix() {
  const pro_id    = document.getElementById('rem-produit').value;
  const formatVal = document.getElementById('rem-format').value;
  if (!pro_id || !formatVal) {
    document.getElementById('rem-prix').value        = '';
    document.getElementById('rem-total-ligne').value = '';
    return;
  }
  const format = JSON.parse(formatVal);
  const prix = parseFloat(String(format.prix_vente || 0).replace(',', '.')) || 0;
  // Le prix est modifiable — on le pré-remplit mais on n'écrase pas s'il a déjà été touché
  const champPrix = document.getElementById('rem-prix');
  if (!champPrix.dataset.touche) {
    champPrix.value = prix.toFixed(2).replace('.', ',');
  }
  remRecalculerLigne();
}

function remRecalculerLigne() {
  const prix = parseFloat(String(document.getElementById('rem-prix').value).replace(',', '.')) || 0;
  const qte  = parseInt(document.getElementById('rem-quantite').value) || 1;
  document.getElementById('rem-total-ligne').value = prix > 0 ? formaterPrix(prix * qte) : '';

  // Marquer le prix comme touché si l'utilisateur l'a modifié manuellement
  const champPrix = document.getElementById('rem-prix');
  if (champPrix.value) champPrix.dataset.touche = '1';
}

function remChangerQte(delta) {
  const input = document.getElementById('rem-quantite');
  const val   = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
  remRecalculerLigne();
}

// ═══════════════════════════════════════
// AJOUTER UNE LIGNE (avec-retour)
// ═══════════════════════════════════════
function remAjouterLigne() {
  const pro_id    = document.getElementById('rem-produit').value;
  const formatVal = document.getElementById('rem-format').value;
  const qte       = parseInt(document.getElementById('rem-quantite').value) || 1;
  const prix      = parseFloat(String(document.getElementById('rem-prix').value).replace(',', '.')) || 0;

  if (!pro_id || !formatVal) {
    afficherMsg('remboursements', 'Choisir un produit et un format.', 'erreur');
    return;
  }
  if (prix <= 0) {
    afficherMsg('remboursements', 'Entrer un prix unitaire.', 'erreur');
    return;
  }

  const format = JSON.parse(formatVal);
  const pro    = donneesProduits.find(p => p.pro_id === pro_id);

  remLignes.push({
    type: 'produit',
    pro_id,
    nom: pro?.nom || '',
    poids: format.poids,
    unite: format.unite,
    quantite: qte,
    prix_unitaire: prix
  });

  remRafraichirListe();
  remResetSaisieProduit();
}

function remResetSaisieProduit() {
  document.getElementById('rem-collection').value      = '';
  document.getElementById('rem-gamme').innerHTML       = '<option value="">— Toutes —</option>';
  document.getElementById('rem-produit').innerHTML     = '<option value="">— Choisir —</option>';
  document.getElementById('rem-format').innerHTML      = '<option value="">— Choisir —</option>';
  document.getElementById('rem-quantite').value        = '1';
  const champPrix = document.getElementById('rem-prix');
  champPrix.value = '';
  delete champPrix.dataset.touche;
  document.getElementById('rem-total-ligne').value     = '';
}

// ═══════════════════════════════════════
// AJOUTER UNE LIGNE LIBRE (sans-retour)
// ═══════════════════════════════════════
function remAjouterLigneLibre() {
  const description = document.getElementById('rem-libre-description').value.trim();
  const montant     = parseFloat(String(document.getElementById('rem-libre-montant').value).replace(',', '.')) || 0;

  if (!description) {
    afficherMsg('remboursements', 'Entrer une description.', 'erreur');
    return;
  }
  if (montant <= 0) {
    afficherMsg('remboursements', 'Entrer un montant valide.', 'erreur');
    return;
  }

  remLignes.push({
    type: 'libre',
    description,
    montant
  });

  remRafraichirListe();
  document.getElementById('rem-libre-description').value = '';
  document.getElementById('rem-libre-montant').value     = '';
}

// ═══════════════════════════════════════
// RAFRAÎCHIR LA LISTE DES LIGNES
// ═══════════════════════════════════════
function remRafraichirListe() {
  const liste = document.getElementById('rem-liste');
  if (!remLignes.length) {
    liste.innerHTML = '<div class="texte-secondaire">Aucune ligne</div>';
    document.getElementById('rem-liste-panel').classList.add('cache');
    document.getElementById('rem-client-panel').classList.add('cache');
    document.getElementById('rem-paiement-panel').classList.add('cache');
    return;
  }

  document.getElementById('rem-liste-panel').classList.remove('cache');
  document.getElementById('rem-client-panel').classList.remove('cache');
  document.getElementById('rem-paiement-panel').classList.remove('cache');

  let total = 0;
  liste.innerHTML = remLignes.map((l, i) => {
    if (l.type === 'produit') {
      const sousTotal = l.prix_unitaire * l.quantite;
      total += sousTotal;
      return `
        <div class="ingredient-rangee ven-panier-item">
          <div class="ven-panier-nom">${l.nom} — ${l.poids} ${l.unite}</div>
          <div class="ven-panier-details">
            <span>Qté : ${l.quantite}</span>
            <span>${formaterPrix(sousTotal)}</span>
            <button class="bouton bouton-petit bouton-rouge" onclick="remSupprimerLigne(${i})">✕</button>
          </div>
        </div>`;
    } else {
      total += l.montant;
      return `
        <div class="ingredient-rangee ven-panier-item">
          <div class="ven-panier-nom">${l.description}</div>
          <div class="ven-panier-details">
            <span>${formaterPrix(l.montant)}</span>
            <button class="bouton bouton-petit bouton-rouge" onclick="remSupprimerLigne(${i})">✕</button>
          </div>
        </div>`;
    }
  }).join('');

  // Total négatif (c'est un remboursement)
  document.getElementById('rem-total').value = '-' + formaterPrix(total);
}

function remSupprimerLigne(i) {
  remLignes.splice(i, 1);
  remRafraichirListe();
}

// ═══════════════════════════════════════
// FINALISATION DU REMBOURSEMENT
// ═══════════════════════════════════════
async function finaliserRemboursement(modePaiement) {
  if (!remLignes.length) {
    afficherMsg('remboursements', 'Aucune ligne dans le remboursement.', 'erreur');
    return;
  }

  afficherChargement();

  const rem_id    = remIdEnCours;
  const client    = document.getElementById('rem-client').value;
  const courriel  = document.getElementById('rem-courriel').value;
  const telephone = document.getElementById('rem-telephone').value;

  // Calcul du total négatif
  let total = 0;
  remLignes.forEach(l => {
    if (l.type === 'produit') total += l.prix_unitaire * l.quantite;
    else                       total += l.montant;
  });
  const total_negatif = -Math.abs(total);

  // Créer l'entête
  const resCreate = await appelAPIPost('createRemboursement', {
    rem_id,
    client,
    courriel,
    telephone,
    type_remb: remType,
    mode_paiement: modePaiement,
    total: total_negatif
  });

  if (!resCreate || !resCreate.success) {
    cacherChargement();
    afficherMsg('remboursements', 'Erreur lors de la création.', 'erreur');
    return;
  }

  // Ajouter chaque ligne
  for (const l of remLignes) {
    if (l.type === 'produit') {
      await appelAPIPost('addRemboursementLigne', {
        rem_id,
        type: 'produit',
        pro_id: l.pro_id,
        format_poids: l.poids,
        format_unite: l.unite,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire
      });
    } else {
      await appelAPIPost('addRemboursementLigne', {
        rem_id,
        type: 'libre',
        description: l.description,
        montant: l.montant
      });
    }
  }

  // Finaliser
  const resFin = await appelAPIPost('finaliserRemboursement', {
    rem_id,
    type_remb: remType,
    mode_paiement: modePaiement
  });

  cacherChargement();

  if (!resFin || !resFin.success) {
    afficherMsg('remboursements', 'Erreur lors de la finalisation.', 'erreur');
    return;
  }

  afficherMsg('remboursements', '✅ Remboursement enregistré.');
  fermerFormRemboursement();
  chargerRemboursements();
}

// ═══════════════════════════════════════
// LISTE / FILTRES DES REMBOURSEMENTS
// ═══════════════════════════════════════
function filtrerRemboursements() {
  const statut    = document.getElementById('filtre-rem-statut').value;
  const client    = (document.getElementById('filtre-rem-client').value || '').toLowerCase();
  const produit   = (document.getElementById('filtre-rem-produit').value || '').toLowerCase();
  const dateDebut = document.getElementById('filtre-rem-date-debut').value || '';
  const dateFin   = document.getElementById('filtre-rem-date-fin').value || '';

  const filtrees = toutesRemboursements.filter(r => {
    const okStatut = !statut || r.statut === statut;
    const okClient = !client || (r.client || '').toLowerCase().includes(client);

    let okProduit = true;
    if (produit) {
      okProduit = (r.lignes || []).some(l => (l.nom || '').toLowerCase().includes(produit) || (l.description || '').toLowerCase().includes(produit));
      if (!r.lignes) okProduit = true;
    }

    let okDate = true;
    if (dateDebut || dateFin) {
      const parts = (r.date || '').split('/');
      if (parts.length === 3) {
        const dateRem = parts[2] + '-' + parts[1] + '-' + parts[0];
        if (dateDebut && dateRem < dateDebut) okDate = false;
        if (dateFin   && dateRem > dateFin)   okDate = false;
      }
    }

    return okStatut && okClient && okProduit && okDate;
  });

  afficherTableauRemboursements(filtrees);
}

function reinitialiserFiltresRemboursements() {
  document.getElementById('filtre-rem-statut').value     = '';
  document.getElementById('filtre-rem-client').value     = '';
  document.getElementById('filtre-rem-produit').value    = '';
  document.getElementById('filtre-rem-date-debut').value = '';
  document.getElementById('filtre-rem-date-fin').value   = '';
  afficherTableauRemboursements(toutesRemboursements);
}

function afficherTableauRemboursements(items) {
  const tableau = document.getElementById('tableau-remboursements');
  const vide    = document.getElementById('vide-remboursements');

  if (!items.length) {
    if (tableau) tableau.innerHTML = '';
    if (vide) vide.classList.remove('cache');
    return;
  }
  if (vide) vide.classList.add('cache');

  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Date</th><th>Client</th><th>Type</th><th>Paiement</th><th>Total</th><th>Statut</th></tr></thead><tbody>';
  items.forEach(r => {
    const typeLabel = r.type_remb === 'avec-retour' ? 'Avec retour' : 'Sans retour';
    html += `<tr class="cliquable" onclick="voirDetailRemboursement('${r.rem_id}')">
      <td>${r.date}</td>
      <td>${r.client || '—'}</td>
      <td>${typeLabel}</td>
      <td>${r.mode_paiement || '—'}</td>
      <td style="color:var(--rouge)">${formaterPrix(r.total)}</td>
      <td>${r.statut}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  if (tableau) tableau.innerHTML = html;
}

// ═══════════════════════════════════════
// VOIR DÉTAIL D'UN REMBOURSEMENT
// ═══════════════════════════════════════
async function voirDetailRemboursement(rem_id) {
  const res = await appelAPI('getRemboursementsLignes', { rem_id });
  if (!res || !res.success) {
    afficherMsg('remboursements', 'Erreur de chargement.', 'erreur');
    return;
  }

  const r = toutesRemboursements.find(x => x.rem_id === rem_id);
  if (!r) {
    afficherMsg('remboursements', 'Remboursement introuvable.', 'erreur');
    return;
  }

  // Afficher dans une modal simple — on réutilise modal-facture-vente avec adaptation
  // Pour l'instant on affiche dans une alerte/info, à améliorer plus tard
  let detail = `Remboursement ${r.rem_id}\nDate : ${r.date}\nClient : ${r.client || '—'}\n\nLignes :\n`;
  (res.items || []).forEach(l => {
    if (l.type === 'produit') {
      const nom = donneesProduits.find(p => p.pro_id === l.pro_id)?.nom || l.pro_id;
      detail += `  - ${nom} (${l.format_poids} ${l.format_unite}) × ${l.quantite} = ${formaterPrix(l.prix_unitaire * l.quantite)}\n`;
    } else {
      detail += `  - ${l.description} = ${formaterPrix(l.montant)}\n`;
    }
  });
  detail += `\nTotal : ${formaterPrix(r.total)}\nMode : ${r.mode_paiement || '—'}\nStatut : ${r.statut}`;
  alert(detail);
}

/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-remboursements.js
   Refonte 2026-07-21 : un remboursement part TOUJOURS d'une vente.
   Choisir une vente → ses articles (rembourser tout / quantité / retour-inventaire
   ou perte) → montant libre (livraison ou promotion) → coordonnées → sortie d'argent.
   ═══════════════════════════════════════ */

// ─── ÉTAT GLOBAL ───
var remIdEnCours         = null;
var remVentesDispo       = [];    // ventes chargées pour le choix
var remVenteChoisie      = null;  // { ven_id, client, courriel, telephone, date, mode_paiement }
var remArticles          = [];    // articles de la vente choisie (avec qté à rendre + destination)
var remLibres            = [];    // montants libres [{ type, description, montant }]
var toutesRemboursements = [];

// ═══════════════════════════════════════
// CHARGEMENT DE LA LISTE
// ═══════════════════════════════════════
async function chargerRemboursements() {
  const loading = document.getElementById('loading-remboursements');
  const vide    = document.getElementById('vide-remboursements');
  if (loading) loading.classList.remove('cache');

  const res = await appelAPI('getRemboursementsEntete');

  if (loading) loading.classList.add('cache');

  if (!res || !res.success) {
    toutesRemboursements = [];
    afficherMsg('remboursements', '❌ Erreur de connexion. Rouvre la section pour réessayer.', 'erreur');
    return;
  }
  if (!res.items.length) {
    toutesRemboursements = [];
    const tableau = document.getElementById('tableau-remboursements');
    if (tableau) tableau.innerHTML = '';
    if (vide) vide.classList.remove('cache');
    document.getElementById('contenu-remboursements').classList.remove('cache');
    document.getElementById('filtres-remboursements').classList.remove('cache');
    document.getElementById('form-remboursement').classList.add('cache');
    document.querySelector('#section-remboursements .page-entete .bouton')?.classList.remove('cache');
    return;
  }

  toutesRemboursements = res.items;
  if (vide) vide.classList.add('cache');
  afficherTableauRemboursements(toutesRemboursements);
}

// ═══════════════════════════════════════
// NOUVEAU REMBOURSEMENT — OUVERTURE / FERMETURE
// ═══════════════════════════════════════
async function ouvrirFormRemboursement() {
  remVenteChoisie = null;
  remArticles     = [];
  remLibres       = [];

  // Générer un nouveau numéro
  const dernierNum = toutesRemboursements.length
    ? Math.max(...toutesRemboursements.map(r => parseInt((r.rem_id || '').replace('REM-', '')) || 0))
    : 0;
  remIdEnCours = 'REM-' + String(dernierNum + 1).padStart(4, '0');

  // Réinitialiser les panneaux : seul le choix de la vente est visible
  document.getElementById('rem-articles-panel').classList.add('cache');
  document.getElementById('rem-libre-panel').classList.add('cache');
  document.getElementById('rem-total-panel').classList.add('cache');
  document.getElementById('rem-client-panel').classList.add('cache');
  document.getElementById('rem-paiement-panel').classList.add('cache');
  document.getElementById('rem-vente-panel').classList.remove('cache');

  // Vider les champs
  document.getElementById('rem-vente-rech-client').value  = '';
  document.getElementById('rem-vente-rech-produit').value = '';
  document.getElementById('rem-vente-date-debut').value   = '';
  document.getElementById('rem-vente-date-fin').value     = '';
  document.getElementById('rem-client').value    = '';
  document.getElementById('rem-courriel').value  = '';
  document.getElementById('rem-telephone').value = '';
  document.getElementById('rem-total').value     = '';
  document.getElementById('rem-articles-liste').innerHTML = '';
  document.getElementById('rem-libre-liste').innerHTML    = '';
  document.getElementById('rem-vente-info').innerHTML     = '';

  // Afficher le formulaire
  document.getElementById('contenu-remboursements').classList.add('cache');
  document.getElementById('filtres-remboursements').classList.add('cache');
  document.getElementById('form-remboursement').classList.remove('cache');
  document.querySelector('#section-remboursements .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);

  // Charger les ventes pour le choix
  await remLoadVentes();
}

function fermerFormRemboursement() {
  document.getElementById('form-remboursement').classList.add('cache');
  document.getElementById('filtres-remboursements').classList.remove('cache');
  document.getElementById('contenu-remboursements').classList.remove('cache');
  document.querySelector('#section-remboursements .page-entete .bouton')?.classList.remove('cache');
  remVenteChoisie = null;
  remArticles     = [];
  remLibres       = [];
  remIdEnCours    = null;
}

// ═══════════════════════════════════════
// ÉTAPE 1 — CHOISIR LA VENTE
// ═══════════════════════════════════════
async function remLoadVentes() {
  const c = document.getElementById('rem-vente-liste');
  if (c) c.innerHTML = '<div class="texte-secondaire">Chargement des ventes…</div>';

  const res = await appelAPI('getVentesEntete');
  if (!res || !res.success) {
    remVentesDispo = [];
    if (c) c.innerHTML = '<div class="texte-secondaire">Erreur de chargement des ventes.</div>';
    return;
  }
  remVentesDispo = res.items || [];
  remFiltrerVentes();
}

function remFiltrerVentes() {
  const client    = (document.getElementById('rem-vente-rech-client').value  || '').toLowerCase();
  const produit   = (document.getElementById('rem-vente-rech-produit').value || '').toLowerCase();
  const dateDebut = document.getElementById('rem-vente-date-debut').value || '';
  const dateFin   = document.getElementById('rem-vente-date-fin').value   || '';

  const filtrees = remVentesDispo.filter(v => {
    const okClient  = !client  || (v.client || '').toLowerCase().includes(client);
    const okProduit = !produit || (v.produits_resume || '').toLowerCase().includes(produit);

    let okDate = true;
    if (dateDebut || dateFin) {
      const parts = (v.date || '').split('/'); // dd/MM/yyyy
      if (parts.length === 3) {
        const d = parts[2] + '-' + parts[1] + '-' + parts[0];
        if (dateDebut && d < dateDebut) okDate = false;
        if (dateFin   && d > dateFin)   okDate = false;
      }
    }
    return okClient && okProduit && okDate;
  });

  remAfficherListeVentes(filtrees);
}

function remAfficherListeVentes(items) {
  const c = document.getElementById('rem-vente-liste');
  if (!c) return;
  if (!items.length) {
    c.innerHTML = '<div class="texte-secondaire">Aucune vente trouvée.</div>';
    return;
  }
  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Date</th><th>Client</th><th>Produits</th><th>Total</th><th>Statut</th></tr></thead><tbody>';
  items.forEach(v => {
    html += '<tr class="cliquable" onclick="remChoisirVente(\'' + v.ven_id + '\')">'
      +  '<td>' + echapperHtml(v.date || '—') + '</td>'
      +  '<td>' + echapperHtml(v.client || 'comptant') + '</td>'
      +  '<td>' + echapperHtml(v.produits_resume || '—') + '</td>'
      +  '<td>' + formaterPrix(v.total || 0) + '</td>'
      +  '<td>' + echapperHtml(v.statut || '—') + '</td>'
      +  '</tr>';
  });
  html += '</tbody></table></div>';
  c.innerHTML = html;
}

// ═══════════════════════════════════════
// ÉTAPE 2 — VENTE CHOISIE : SES ARTICLES
// ═══════════════════════════════════════
async function remChoisirVente(ven_id) {
  afficherChargement();
  const res = await appelAPIPost('getVenteRemboursable', { ven_id });
  cacherChargement();

  if (!res || !res.success) {
    afficherMsg('remboursements', res && res.message ? res.message : 'Erreur de chargement de la vente.', 'erreur');
    return;
  }

  const venteListe = remVentesDispo.find(v => String(v.ven_id) === String(ven_id)) || {};
  const rabais    = parseFloat(venteListe.rabais)    || 0;
  const totalNet  = parseFloat(venteListe.total_net) || 0;
  const livraison = parseFloat(venteListe.livraison) || 0;
  remVenteChoisie = {
    ven_id:        res.ven_id,
    client:        res.client || venteListe.client || '',
    courriel:      venteListe.courriel || '',
    telephone:     venteListe.telephone || '',
    date:          res.date || venteListe.date || '',
    mode_paiement: res.mode_paiement || venteListe.mode_paiement || '',
    rabais:        rabais,
    total_net:     totalNet,
    livraison:     livraison
  };

  // Prix payé par défaut = plein prix réparti du rabais.
  // Plein prix des produits de la vente = total_net + rabais − livraison.
  const pleinPrixVente = Math.round((totalNet + rabais - livraison) * 100) / 100;
  const facteur = (pleinPrixVente > 0 && rabais > 0) ? (pleinPrixVente - rabais) / pleinPrixVente : 1;

  // Chaque article : à rendre au complet, retour en inventaire, prix payé par défaut (modifiable)
  remArticles = (res.lignes || []).map(l => ({
    pro_id:              l.pro_id,
    nom:                 l.nom,
    format_poids:        l.format_poids,
    format_unite:        l.format_unite,
    prix_plein:          l.prix_unitaire,
    prix_rembourse:      Math.round((l.prix_unitaire || 0) * facteur * 100) / 100,
    quantite_vendue:     l.quantite_vendue,
    quantite_remboursee: l.quantite_remboursee,
    disponible:          l.disponible,
    qte_rendue:          l.disponible,
    destination:         'inventaire'
  }));
  remLibres = [];

  // Coordonnées reprises de la vente (modifiables)
  document.getElementById('rem-client').value    = remVenteChoisie.client;
  document.getElementById('rem-courriel').value  = remVenteChoisie.courriel;
  document.getElementById('rem-telephone').value = remVenteChoisie.telephone;

  document.getElementById('rem-vente-info').innerHTML =
    'Vente ' + echapperHtml(String(res.ven_id)) + ' · ' + echapperHtml(remVenteChoisie.date || '—') +
    ' · ' + echapperHtml(remVenteChoisie.client || 'comptant') +
    ' · payée ' + echapperHtml(remVenteChoisie.mode_paiement || '—');

  // Basculer l'affichage
  document.getElementById('rem-vente-panel').classList.add('cache');
  document.getElementById('rem-articles-panel').classList.remove('cache');
  document.getElementById('rem-libre-panel').classList.remove('cache');
  document.getElementById('rem-client-panel').classList.remove('cache');
  document.getElementById('rem-paiement-panel').classList.remove('cache');

  remAfficherArticles();
  remAfficherLibres();
  remRecalculer();
}

function remChangerVente() {
  remVenteChoisie = null;
  remArticles     = [];
  remLibres       = [];
  document.getElementById('rem-articles-panel').classList.add('cache');
  document.getElementById('rem-libre-panel').classList.add('cache');
  document.getElementById('rem-total-panel').classList.add('cache');
  document.getElementById('rem-client-panel').classList.add('cache');
  document.getElementById('rem-paiement-panel').classList.add('cache');
  document.getElementById('rem-vente-panel').classList.remove('cache');
  document.getElementById('rem-articles-liste').innerHTML = '';
  document.getElementById('rem-libre-liste').innerHTML    = '';
}

function remAfficherArticles() {
  const c = document.getElementById('rem-articles-liste');
  if (!c) return;
  if (!remArticles.length) {
    c.innerHTML = '<div class="texte-secondaire">Cette vente n\'a aucun article.</div>';
    return;
  }
  c.innerHTML = remArticles.map((a, i) => {
    const epuise    = a.disponible <= 0;
    const sousTotal = (parseInt(a.qte_rendue) || 0) * (a.prix_rembourse || 0);
    return ''
      + '<div class="ven-panier-item" style="display:block;padding:10px 0;border-bottom:1px solid var(--beige)">'
      +   '<div class="ven-panier-nom">' + echapperHtml(a.nom) + ' — ' + echapperHtml(a.format_poids) + ' ' + echapperHtml(a.format_unite) + '</div>'
      +   '<div class="texte-secondaire" style="margin:4px 0">Vendu ' + a.quantite_vendue + ' · déjà remboursé ' + a.quantite_remboursee + ' · disponible ' + a.disponible + '</div>'
      +   (epuise
          ? '<div class="texte-secondaire">Rien à rembourser sur cet article.</div>'
          : '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
            +   '<div class="ven-qte-ligne">'
            +     '<button class="bouton bouton-petit" onclick="remQteArticle(' + i + ',-1)">−</button>'
            +     '<input type="number" class="form-ctrl" style="max-width:70px;text-align:center" id="rem-art-qte-' + i + '" min="0" max="' + a.disponible + '" value="' + a.qte_rendue + '" inputmode="numeric" oninput="remSetQteArticle(' + i + ',this.value)">'
            +     '<button class="bouton bouton-petit" onclick="remQteArticle(' + i + ',1)">+</button>'
            +   '</div>'
            +   '<label class="texte-secondaire" for="rem-art-prix-' + i + '">Prix payé</label>'
            +   '<input type="text" inputmode="decimal" class="form-ctrl" style="max-width:90px" id="rem-art-prix-' + i + '" value="' + a.prix_rembourse.toFixed(2).replace('.', ',') + '" oninput="remSetPrixArticle(' + i + ',this.value)">'
            +   '<select class="form-ctrl" style="max-width:200px" id="rem-art-dest-' + i + '" onchange="remSetDestArticle(' + i + ',this.value)">'
            +     '<option value="inventaire"' + (a.destination === 'inventaire' ? ' selected' : '') + '>Retour en inventaire</option>'
            +     '<option value="perte"' + (a.destination === 'perte' ? ' selected' : '') + '>Perte</option>'
            +   '</select>'
            +   '<span style="margin-left:auto;font-weight:600" id="rem-art-st-' + i + '">' + formaterPrix(sousTotal) + '</span>'
            + '</div>')
      + '</div>';
  }).join('');
}

function remRembourserTout() {
  remArticles.forEach(a => { a.qte_rendue = a.disponible; });
  remAfficherArticles();
  remRecalculer();
}

function remQteArticle(i, delta) {
  const a = remArticles[i];
  if (!a) return;
  a.qte_rendue = Math.max(0, Math.min(a.disponible, (parseInt(a.qte_rendue) || 0) + delta));
  const inp = document.getElementById('rem-art-qte-' + i);
  if (inp) inp.value = a.qte_rendue;
  remMajSousTotal(i);
  remRecalculer();
}

function remSetQteArticle(i, val) {
  const a = remArticles[i];
  if (!a) return;
  let q = parseInt(val);
  if (isNaN(q) || q < 0) q = 0;
  if (q > a.disponible)  q = a.disponible;
  a.qte_rendue = q;
  const inp = document.getElementById('rem-art-qte-' + i);
  if (inp && String(inp.value) !== String(q)) inp.value = q;
  remMajSousTotal(i);
  remRecalculer();
}

function remSetDestArticle(i, val) {
  if (remArticles[i]) remArticles[i].destination = val;
}

function remSetPrixArticle(i, val) {
  const a = remArticles[i];
  if (!a) return;
  let p = parseFloat(String(val).replace(',', '.'));
  if (isNaN(p) || p < 0) p = 0;
  a.prix_rembourse = p;
  remMajSousTotal(i);
  remRecalculer();
}

function remMajSousTotal(i) {
  const a = remArticles[i];
  if (!a) return;
  const el = document.getElementById('rem-art-st-' + i);
  if (el) el.textContent = formaterPrix((parseInt(a.qte_rendue) || 0) * (a.prix_rembourse || 0));
}

// ═══════════════════════════════════════
// ÉTAPE 3 — MONTANT LIBRE (livraison / promotion)
// ═══════════════════════════════════════
function remAjouterLibre() {
  const type        = document.getElementById('rem-libre-type').value || 'livraison';
  const description = document.getElementById('rem-libre-description').value.trim();
  const montant     = parseFloat(String(document.getElementById('rem-libre-montant').value).replace(',', '.')) || 0;

  if (montant <= 0) {
    afficherMsg('remboursements', 'Entrer un montant valide.', 'erreur');
    return;
  }

  remLibres.push({ type, description, montant });
  document.getElementById('rem-libre-description').value = '';
  document.getElementById('rem-libre-montant').value     = '';
  remAfficherLibres();
  remRecalculer();
}

function remSupprimerLibre(i) {
  remLibres.splice(i, 1);
  remAfficherLibres();
  remRecalculer();
}

function remAfficherLibres() {
  const c = document.getElementById('rem-libre-liste');
  if (!c) return;
  if (!remLibres.length) { c.innerHTML = ''; return; }
  c.innerHTML = remLibres.map((l, i) => {
    const label = l.type === 'promotion' ? 'Geste commercial / promotion' : 'Livraison';
    const desc  = l.description ? ' — ' + echapperHtml(l.description) : '';
    return '<div class="ven-panier-item"><div class="ven-panier-nom">' + label + desc + '</div>'
      + '<div class="ven-panier-details"><span>' + formaterPrix(l.montant) + '</span>'
      + '<button class="bouton bouton-petit bouton-rouge" onclick="remSupprimerLibre(' + i + ')">✕</button></div></div>';
  }).join('');
}

// ═══════════════════════════════════════
// TOTAL
// ═══════════════════════════════════════
function remRecalculer() {
  let total = 0;
  remArticles.forEach(a => { total += (parseInt(a.qte_rendue) || 0) * (a.prix_rembourse || 0); });
  remLibres.forEach(l => { total += l.montant; });

  const champ = document.getElementById('rem-total');
  if (champ) champ.value = total > 0 ? '-' + formaterPrix(total) : formaterPrix(0);

  document.getElementById('rem-total-panel').classList.toggle('cache', total <= 0);
}

// ═══════════════════════════════════════
// FINALISATION DU REMBOURSEMENT
// ═══════════════════════════════════════
async function finaliserRemboursement(modePaiement) {
  if (!remVenteChoisie) {
    afficherMsg('remboursements', 'Choisir d\'abord une vente.', 'erreur');
    return;
  }
  const articlesARendre = remArticles.filter(a => (parseInt(a.qte_rendue) || 0) > 0);
  if (!articlesARendre.length && !remLibres.length) {
    afficherMsg('remboursements', 'Rien à rembourser : mettre une quantité ou un montant libre.', 'erreur');
    return;
  }

  afficherChargement();

  const rem_id    = remIdEnCours;
  const client    = document.getElementById('rem-client').value;
  const courriel  = document.getElementById('rem-courriel').value;
  const telephone = document.getElementById('rem-telephone').value;

  // Créer l'entête (rattachée à la vente)
  const resCreate = await appelAPIPost('createRemboursement', {
    rem_id,
    ven_id: remVenteChoisie.ven_id,
    client,
    courriel,
    telephone,
    type_remb: '',
    mode_paiement: modePaiement
  });

  if (!resCreate || !resCreate.success) {
    cacherChargement();
    afficherMsg('remboursements', resCreate && resCreate.message ? resCreate.message : 'Erreur lors de la création.', 'erreur');
    return;
  }

  // Lignes produit (avec destination retour/perte — stockée à l'étape 4)
  for (const a of articlesARendre) {
    await appelAPIPost('addRemboursementLigne', {
      rem_id,
      type: 'produit',
      pro_id: a.pro_id,
      format_poids: a.format_poids,
      format_unite: a.format_unite,
      quantite: a.qte_rendue,
      prix_unitaire: a.prix_rembourse,
      retour: a.destination,
      prix_plein: a.prix_plein
    });
  }

  // Lignes libres (avec compte livraison/promotion — stocké à l'étape 4)
  for (const l of remLibres) {
    await appelAPIPost('addRemboursementLigne', {
      rem_id,
      type: 'libre',
      description: l.description,
      montant: l.montant,
      compte: l.type
    });
  }

  // Finaliser
  const resFin = await appelAPIPost('finaliserRemboursement', {
    rem_id,
    type_remb: '',
    mode_paiement: modePaiement
  });

  cacherChargement();

  if (!resFin || !resFin.success) {
    afficherMsg('remboursements', resFin && resFin.message ? resFin.message : 'Erreur lors de la finalisation.', 'erreur');
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

  // Plus de colonne « Type » : elle venait de l'ancien modèle où un remboursement entier
  // était « avec » ou « sans » retour. Le choix se fait maintenant article par article,
  // et l'information exacte est dans le détail du remboursement.
  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Date</th><th>Client</th><th>Paiement</th><th>Total</th><th>Statut</th></tr></thead><tbody>';
  items.forEach(r => {
    html += `<tr class="cliquable" onclick="voirDetailRemboursement('${r.rem_id}')">
      <td>${r.date}</td>
      <td>${r.client || '—'}</td>
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

  // Fenêtre de détail dans le style du site (réutilise le modèle .voile/.modale)
  let lignesHtml = '';
  (res.items || []).forEach(l => {
    if (l.type === 'produit') {
      const nom = donneesProduits.find(p => p.pro_id === l.pro_id)?.nom || l.pro_id;
      lignesHtml += `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--beige)"><span>${echapperHtml(nom)} (${echapperHtml(l.format_poids)} ${echapperHtml(l.format_unite)}) × ${l.quantite}</span><span>${formaterPrix(l.prix_unitaire * l.quantite)}</span></div>`;
    } else {
      lignesHtml += `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--beige)"><span>${echapperHtml(l.description)}</span><span>${formaterPrix(l.montant)}</span></div>`;
    }
  });

  const ancien = document.getElementById('detail-remb-overlay');
  if (ancien) ancien.remove();
  const overlay = document.createElement('div');
  overlay.id = 'detail-remb-overlay';
  overlay.className = 'voile ouvert';
  overlay.innerHTML =
    '<div class="modale">' +
      '<div class="modale-entete">' +
        '<span class="titre">Remboursement ' + echapperHtml(r.rem_id) + '</span>' +
        '<button type="button" class="boutons-fermer" id="detail-remb-fermer">✕</button>' +
      '</div>' +
      '<div class="modale-corps">' +
        '<div style="margin-bottom:12px;font-size:0.9rem;color:var(--gris)">Date : ' + echapperHtml(r.date) + '<br>Client : ' + echapperHtml(r.client || '—') + '</div>' +
        '<div class="form-label">Lignes</div>' +
        lignesHtml +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:6px;border-top:2px solid var(--primary);font-weight:600"><span>Total</span><span>' + formaterPrix(r.total) + '</span></div>' +
        '<div style="margin-top:8px;font-size:0.9rem;color:var(--gris)">Mode : ' + echapperHtml(r.mode_paiement || '—') + '<br>Statut : ' + echapperHtml(r.statut) + '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.getElementById('detail-remb-fermer').onclick = () => overlay.remove();
}

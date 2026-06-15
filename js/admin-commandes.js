/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-commandes.js
   Créé le 4 mai 2026 selon LOGIQUE-VENTES.md
   ═══════════════════════════════════════ */

// ─── ÉTAT GLOBAL ───
var cmdLignes          = [];
var cmdIdEnCours       = null;
var cmdNumeroAffiche   = '';
var cmdModeEdition     = false;
var toutesCommandes        = [];
var toutesCommandesLignes  = [];
var commandesLotsDispo     = [];

// ═══════════════════════════════════════
// CHARGEMENT DE LA PAGE
// ═══════════════════════════════════════
async function chargerCommandes() {
  const loading = document.getElementById('loading-commandes');
  const vide    = document.getElementById('vide-commandes');
  if (loading) loading.classList.remove('cache');

  const [res, resLignes, resLots] = await Promise.all([
    appelAPI('getCommandesEntete'),
    appelAPI('getCommandesLignes'),
    appelAPI('getLotsDisponibles')
  ]);

  toutesCommandesLignes = (resLignes && resLignes.success) ? resLignes.items : [];
  commandesLotsDispo    = (resLots && resLots.success) ? resLots.items : [];

  if (loading) loading.classList.add('cache');

 if (!res || !res.success || !res.items.length) {
    toutesCommandes = [];
    const tableau = document.getElementById('tableau-commandes');
    if (tableau) tableau.innerHTML = '';
    if (vide) vide.classList.remove('cache');
    document.getElementById('contenu-commandes').classList.remove('cache');
    document.getElementById('filtres-commandes').classList.remove('cache');
    document.getElementById('form-commande').classList.add('cache');
    document.getElementById('fiche-commande').classList.add('cache');
    document.querySelector('#section-commandes .page-entete .bouton')?.classList.remove('cache');
    return;
}

  toutesCommandes = res.items;
  if (vide) vide.classList.add('cache');
  afficherTableauCommandes(toutesCommandes);
}

// ═══════════════════════════════════════
// NOUVELLE COMMANDE — OUVERTURE
// ═══════════════════════════════════════
function ouvrirFormCommande() {
  // Reset complet de l'état
  cmdLignes = [];
  cmdModeEdition = false;
  cmdIdEnCours = null;
  cmdNumeroAffiche = '';

  // Générer un nouveau numéro
  const dernierNum = toutesCommandes.length
    ? Math.max(...toutesCommandes.map(c => parseInt((c.cmd_id || '').replace('CMD-', '')) || 0))
    : 0;
  cmdIdEnCours     = 'CMD-' + String(dernierNum + 1).padStart(4, '0');
  cmdNumeroAffiche = String(dernierNum + 1).padStart(4, '0');

  document.getElementById('form-commande-titre').textContent = 'Nouvelle commande ' + cmdNumeroAffiche;

  // Vider tous les champs du formulaire
  document.getElementById('cmd-prenom').value      = '';
  document.getElementById('cmd-client').value      = '';
  document.getElementById('cmd-courriel').value    = '';
  document.getElementById('cmd-telephone').value   = '';
  document.getElementById('cmd-code-postal').value = '';

  // Remplir les collections
  const selCol = document.getElementById('cmd-collection');
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

  document.getElementById('cmd-gamme').innerHTML       = '<option value="">— Gamme —</option>';
  document.getElementById('cmd-produit').innerHTML     = '<option value="">— Produit —</option>';
  document.getElementById('cmd-format').innerHTML      = '<option value="">— Format —</option>';
  document.getElementById('cmd-quantite').value        = '1';
  document.getElementById('cmd-prix').value            = '';
  document.getElementById('cmd-total-ligne').value     = '';
  document.getElementById('cmd-acompte').value         = '0';
  document.getElementById('cmd-total-prevu').value     = '';
  document.getElementById('cmd-solde').value           = '';
  document.getElementById('cmd-notes').value           = '';

  cmdRafraichirPanier();

  // Afficher le formulaire
  document.getElementById('contenu-commandes').classList.add('cache');
  document.getElementById('filtres-commandes').classList.add('cache');
  document.getElementById('fiche-commande').classList.add('cache');
  document.getElementById('form-commande').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormCommande() {
  document.getElementById('form-commande').classList.add('cache');
  document.getElementById('filtres-commandes').classList.remove('cache');
  document.getElementById('contenu-commandes').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.remove('cache');
  cmdLignes = [];
  cmdIdEnCours = null;
  cmdModeEdition = false;
}

// ═══════════════════════════════════════
// CASCADE COLLECTION → GAMME → PRODUIT → FORMAT
// ═══════════════════════════════════════
function cmdFiltrerGammes() {
  const col_id = document.getElementById('cmd-collection').value;
  const sel    = document.getElementById('cmd-gamme');
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
  cmdFiltrerProduits();
}

function cmdFiltrerProduits() {
  const col_id = document.getElementById('cmd-collection').value;
  const gam_id = document.getElementById('cmd-gamme').value;
  const sel    = document.getElementById('cmd-produit');
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
  document.getElementById('cmd-format').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('cmd-prix').value        = '';
  document.getElementById('cmd-total-ligne').value = '';
}

function cmdFiltrerFormats() {
  const pro_id = document.getElementById('cmd-produit').value;
  const sel    = document.getElementById('cmd-format');
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
  cmdMettreAJourPrix();
}

function cmdMettreAJourPrix() {
  const pro_id    = document.getElementById('cmd-produit').value;
  const formatVal = document.getElementById('cmd-format').value;
  if (!pro_id || !formatVal) {
    document.getElementById('cmd-prix').value        = '';
    document.getElementById('cmd-total-ligne').value = '';
    return;
  }
  const format = JSON.parse(formatVal);
  const prix   = parseFloat(String(format.prix_vente || 0).replace(',', '.')) || 0;
  const qte    = parseInt(document.getElementById('cmd-quantite').value) || 1;
  document.getElementById('cmd-prix').value        = prix ? formaterPrix(prix) : '—';
  document.getElementById('cmd-total-ligne').value = prix ? formaterPrix(prix * qte) : '—';
}

function cmdChangerQte(delta) {
  const input = document.getElementById('cmd-quantite');
  const val   = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
  cmdMettreAJourPrix();
}

// ═══════════════════════════════════════
// AJOUTER UNE LIGNE
// ═══════════════════════════════════════
function cmdAjouterLigne() {
  const pro_id    = document.getElementById('cmd-produit').value;
  const formatVal = document.getElementById('cmd-format').value;
  const qte       = parseInt(document.getElementById('cmd-quantite').value) || 1;

  if (!pro_id || !formatVal) {
    afficherMsg('commandes', 'Choisir un produit et un format.', 'erreur');
    return;
  }

  const format = JSON.parse(formatVal);
  const pro    = donneesProduits.find(p => p.pro_id === pro_id);
  const prix   = parseFloat(String(format.prix_vente || 0).replace(',', '.')) || 0;

  cmdLignes.push({
    pro_id,
    nom: pro?.nom || '',
    poids: format.poids,
    unite: format.unite,
    quantite: qte,
    prix_unitaire: prix
  });

  cmdRafraichirPanier();
  cmdResetSaisie();
}

function cmdResetSaisie() {
  document.getElementById('cmd-collection').value      = '';
  document.getElementById('cmd-gamme').innerHTML       = '<option value="">— Toutes —</option>';
  document.getElementById('cmd-produit').innerHTML     = '<option value="">— Choisir —</option>';
  document.getElementById('cmd-format').innerHTML      = '<option value="">— Choisir —</option>';
  document.getElementById('cmd-quantite').value        = '1';
  document.getElementById('cmd-prix').value            = '';
  document.getElementById('cmd-total-ligne').value     = '';
}

function cmdSupprimerLigne(i) {
  cmdLignes.splice(i, 1);
  cmdRafraichirPanier();
}

function cmdRafraichirPanier() {
  const liste = document.getElementById('cmd-panier-liste');
  if (!cmdLignes.length) {
    liste.innerHTML = '<div class="texte-secondaire">Aucun item</div>';
    cmdCalculerSolde();
    return;
  }
  liste.innerHTML = cmdLignes.map((l, i) => `
    <div class="ingredient-rangee ven-panier-item">
      <div class="ven-panier-nom">${l.nom} — ${l.poids} ${l.unite}</div>
      <div class="ven-panier-details">
        <span>Qté : ${l.quantite}</span>
        <span>${formaterPrix(l.prix_unitaire * l.quantite)}</span>
        <button class="bouton bouton-petit bouton-rouge" onclick="cmdSupprimerLigne(${i})">✕</button>
      </div>
    </div>`).join('');
  cmdCalculerSolde();
}

function cmdCalculerSolde() {
  const totalPrevu  = cmdLignes.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const acompteRaw  = String(document.getElementById('cmd-acompte').value).replace(',', '.');
  const acompteNum  = parseFloat(acompteRaw);
  const acompte     = (isNaN(acompteNum) || acompteNum < 0) ? 0 : acompteNum;
  const solde       = Math.max(0, totalPrevu - acompte);
  document.getElementById('cmd-total-prevu').value = formaterPrix(totalPrevu);
  document.getElementById('cmd-solde').value       = formaterPrix(solde);
}

// ═══════════════════════════════════════
// ENREGISTRER LA COMMANDE
// ═══════════════════════════════════════
async function enregistrerCommande() {
  const prenom      = document.getElementById('cmd-prenom').value.trim();
  const nom         = document.getElementById('cmd-client').value.trim();
  const client      = (prenom + ' ' + nom).trim();
  const courriel    = document.getElementById('cmd-courriel').value.trim();
  const telephone   = document.getElementById('cmd-telephone').value.trim();
  const code_postal = document.getElementById('cmd-code-postal').value.trim();

  if (!nom)         { afficherMsg('commandes', 'Le nom du client est obligatoire.', 'erreur'); return; }
  if (!courriel)    { afficherMsg('commandes', 'Le courriel est obligatoire.', 'erreur'); return; }
  if (!telephone)   { afficherMsg('commandes', 'Le téléphone est obligatoire.', 'erreur'); return; }
  if (!code_postal) { afficherMsg('commandes', 'Le code postal est obligatoire.', 'erreur'); return; }
  if (!cmdLignes.length) {
    afficherMsg('commandes', 'Aucun item dans la commande.', 'erreur');
    return;
  }

  afficherChargement();

  const cmd_id    = cmdIdEnCours;
  const acompte   = parseFloat(String(document.getElementById('cmd-acompte').value).replace(',', '.')) || 0;
  const totalPrevu = cmdLignes.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const solde     = Math.max(0, totalPrevu - acompte);
  const notes     = document.getElementById('cmd-notes').value;

  // Préparer les lignes au format backend
  const lignesPayload = cmdLignes.map(l => ({
    pro_id: l.pro_id,
    format_poids: l.poids,
    format_unite: l.unite,
    quantite: l.quantite,
    prix_unitaire: l.prix_unitaire
  }));

  if (cmdModeEdition) {
    // Mode édition : tout en une seule opération avec rollback automatique
    const resUpdate = await appelAPIPost('updateCommandeComplete', {
      cmd_id,
      client,
      prenom,
      nom,
      courriel,
      telephone,
      code_postal,
      total_prevu: totalPrevu,
      acompte,
      solde,
      notes,
      lignes: lignesPayload
    });
    if (!resUpdate || !resUpdate.success) {
      cacherChargement();
      afficherMsg('commandes', 'Erreur lors de la modification : ' + (resUpdate?.message || ''), 'erreur');
      return;
    }
  } else {
    // Création : entête puis lignes
    const resCreate = await appelAPIPost('createCommande', {
      cmd_id,
      client,
      prenom,
      nom,
      courriel,
      telephone,
      code_postal,
      total_prevu: totalPrevu,
      acompte,
      solde,
      notes
    });
    if (!resCreate || !resCreate.success) {
      cacherChargement();
      afficherMsg('commandes', 'Erreur lors de la création.', 'erreur');
      return;
    }
    for (const l of cmdLignes) {
      await appelAPIPost('addCommandeLigne', {
        cmd_id,
        pro_id: l.pro_id,
        format_poids: l.poids,
        format_unite: l.unite,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire
      });
    }
  }

  cacherChargement();
  afficherMsg('commandes', '✅ Commande enregistrée.');
  fermerFormCommande();
  chargerCommandes();
}

// ═══════════════════════════════════════
// LISTE / FILTRES DES COMMANDES
// ═══════════════════════════════════════
function filtrerCommandes() {
  const statut    = document.getElementById('filtre-cmd-statut').value;
  const recherche = (document.getElementById('filtre-cmd-recherche').value || '').toLowerCase();

  const filtrees = toutesCommandes.filter(c => {
    const okStatut = !statut || c.statut === statut;

    let okRecherche = true;
    if (recherche) {
      const champs = [
        c.client || '',
        c.courriel || '',
        c.telephone || '',
        c.notes || '',
        c.produits_resume || ''
      ];
      okRecherche = champs.some(champ => champ.toLowerCase().includes(recherche));
    }

    return okStatut && okRecherche;
  });

  afficherTableauCommandes(filtrees);
}

function reinitialiserFiltresCommandes() {
  document.getElementById('filtre-cmd-statut').value    = '';
  document.getElementById('filtre-cmd-recherche').value = '';
  afficherTableauCommandes(toutesCommandes);
}

function afficherTableauCommandes(items) {
  const tableau = document.getElementById('tableau-commandes');
  const vide    = document.getElementById('vide-commandes');

  if (!items.length) {
    if (tableau) tableau.innerHTML = '';
    if (vide) vide.classList.remove('cache');
    return;
  }
  if (vide) vide.classList.add('cache');

  // Blocs dans l'ordre d'affichage (statuts d'aujourd'hui)
  const blocs = [
    { titre: 'ENTRANTES',                       statuts: ['En attente'] },
    { titre: 'MODIFIÉES',                       statuts: ['Modifiée'] },
    { titre: 'QUESTIONS',                       statuts: ['Question'] },
    { titre: 'EN ATTENTE DE PAIEMENT',          statuts: ['En attente de paiement'] },
    { titre: 'EN ATTENTE DE RÉAPPROVISIONNEMENT', statuts: ['En attente de réapprovisionnement'] },
    { titre: 'À RETRAVAILLER',                  statuts: ['À retravailler'] },
    { titre: 'À EXPÉDIER',                      statuts: ['À expédier'] },
    { titre: 'TERMINÉES',                       statuts: ['Terminée'] },
    { titre: 'ANNULÉES',                        statuts: ['Annulée'] }
  ];
  const connus = blocs.reduce((s, b) => s.concat(b.statuts), []);
  const autres = items.filter(c => !connus.includes(c.statut));

  function calculerPastilleStock(cmd_id) {
    const c = toutesCommandes.find(x => x.cmd_id === cmd_id);

    // Pastille délai pour « En attente de paiement »
    if (c && c.statut === 'En attente de paiement' && c.date_proposition) {
      const parts = c.date_proposition.split('/');
      const dateP = new Date(parts[2], parts[1] - 1, parts[0]);
      const jours = Math.floor((new Date() - dateP) / 86400000);
      if (jours >= 14) return 'var(--danger)';
      if (jours >= 7)  return 'var(--accent)';
      return '';
    }

    // Pastille stock pour « En attente »
    const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmd_id);
    if (!lignes.length) return '';
    let toutPlein = true;
    let toutVide  = true;
    for (const l of lignes) {
      const lot = commandesLotsDispo.find(x =>
        String(x.pro_id) === String(l.pro_id) &&
        String(x.format_poids) === String(l.format_poids) &&
        String(x.format_unite) === String(l.format_unite)
      );
      const dispo = lot ? lot.nb_disponible : 0;
      if (dispo < l.quantite) toutPlein = false;
      if (dispo > 0) toutVide  = false;
    }
    if (toutPlein) return 'var(--primary)';
    if (toutVide)  return 'var(--danger)';
    return 'var(--accent)';
  }

  function rendreBloc(titre, liste) {
    if (!liste.length) return '';
    const lignes = liste.map(c => {
      const couleur = calculerPastilleStock(c.cmd_id);
      const pastille = couleur
        ? `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${couleur}"></span>`
        : '';
      return `<tr class="cliquable" onclick="voirDetailCommande('${c.cmd_id}')">
        <td>${c.date}</td>
        <td>${c.client || '—'}</td>
        <td>${formaterPrix(c.total_prevu)}</td>
        <td>${formaterPrix(c.solde)}</td>
        <td>${c.statut}</td>
        <td style="text-align:center">${pastille}</td>
      </tr>`;
    }).join('');
    return `<div class="carte-admin" style="margin-bottom:16px">
      <div class="carte-admin-entete">${titre} <span class="texte-secondaire">${liste.length} commande${liste.length > 1 ? 's' : ''}</span></div>
      <div class="tableau-wrap">
        <table class="tableau-admin">
          <thead><tr><th>Date</th><th>Client</th><th>Total prévu</th><th>Solde</th><th>Statut</th><th></th></tr></thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>
    </div>`;
  }

  let html = '';
  blocs.forEach(b => {
    html += rendreBloc(b.titre, items.filter(c => b.statuts.includes(c.statut)));
  });
  if (autres.length) html += rendreBloc('AUTRES', autres);

  if (tableau) tableau.innerHTML = html;
}

// ═══════════════════════════════════════
// VOIR DÉTAIL D'UNE COMMANDE
// ═══════════════════════════════════════
async function voirDetailCommande(cmd_id) {
  afficherChargement();
  const [resEntete, resLignes, resLots] = await Promise.all([
    appelAPI('getCommandesEntete'),
    appelAPI('getCommandesLignes', { cmd_id }),
    appelAPI('getLotsDisponibles')
  ]);
  cacherChargement();

  if (!resEntete || !resEntete.success || !resLignes || !resLignes.success) {
    afficherMsg('commandes', 'Erreur de chargement.', 'erreur');
    return;
  }

  const c = resEntete.items.find(x => x.cmd_id === cmd_id);
  if (!c) {
    afficherMsg('commandes', 'Commande introuvable.', 'erreur');
    return;
  }

  const lotsDispo = (resLots && resLots.success) ? resLots.items : [];

  c.lignes = (resLignes.items || []).map(l => {
    const lot = lotsDispo.find(x =>
      String(x.pro_id) === String(l.pro_id) &&
      String(x.format_poids) === String(l.format_poids) &&
      String(x.format_unite) === String(l.format_unite)
    );
    return {
      ...l,
      nom: donneesProduits.find(p => p.pro_id === l.pro_id)?.nom || l.pro_id,
      stock_dispo: lot ? lot.nb_disponible : 0
    };
  });

  // Afficher la fiche
  document.getElementById('fiche-commande-titre').textContent = 'Commande ' + c.cmd_id.replace('CMD-', '-');

  let html = `
    <div style="margin-bottom:16px">
      <div class="form-label">Client</div>
      <div>${c.client || '—'}</div>
      ${c.courriel ? `<div class="texte-secondaire">${c.courriel}</div>` : ''}
      ${c.telephone ? `<div class="texte-secondaire">${c.telephone}</div>` : ''}
      ${c.code_postal ? `<div class="texte-secondaire">${c.code_postal}</div>` : ''}
    </div>
    <div style="margin-bottom:16px">
      <div class="form-label">Date de la commande</div>
      <div>${c.date}</div>
    </div>
    <div style="margin-bottom:16px">
      <div class="form-label">Items commandés</div>`;

  c.lignes.forEach(l => {
    const dispo = l.stock_dispo || 0;
    let stockCouleur, stockTexte;
    if (dispo >= l.quantite) {
      stockCouleur = 'var(--primary)';
      stockTexte = 'Stock prêt : ' + dispo;
    } else if (dispo > 0) {
      stockCouleur = 'var(--accent)';
      stockTexte = 'Stock prêt : ' + dispo + ' (pas assez)';
    } else {
      stockCouleur = 'var(--danger)';
      stockTexte = 'Aucun stock prêt';
    }
    html += `<div style="padding:8px 0;border-bottom:1px solid var(--beige)">
      <div>${l.nom} — ${l.format_poids} ${l.format_unite}</div>
      <div class="texte-secondaire">Qté : ${l.quantite} × ${formaterPrix(l.prix_unitaire)} = ${formaterPrix(l.prix_unitaire * l.quantite)}</div>
      <div style="color:${stockCouleur};font-size:0.78rem;font-weight:500;margin-top:2px">${stockTexte}</div>
    </div>`;
  });

  html += `</div>
    <div style="margin-bottom:16px">
      <div class="form-label">Total prévu</div>
      <div>${formaterPrix(c.total_prevu)}</div>
      <div class="form-label" style="margin-top:8px">Acompte versé</div>
      <div>${formaterPrix(c.acompte)}</div>
      <div class="form-label" style="margin-top:8px">Solde à payer</div>
      <div style="color:var(--primary);font-weight:500">${formaterPrix(c.solde)}</div>
    </div>
    ${c.notes ? `<div style="margin-bottom:16px">
      <div class="form-label">Notes</div>
      <div>${c.notes}</div>
    </div>` : ''}
    <div style="margin-bottom:16px">
      <div class="form-label">Statut</div>
      <div>${c.statut}</div>
    </div>
    ${c.ven_id_lien ? `<div style="margin-bottom:16px">
      <div class="form-label">Facture liée</div>
      <div><a href="#" onclick="event.preventDefault();voirDetailVente('${c.ven_id_lien}')" style="color:var(--primary);text-decoration:underline">${c.ven_id_lien}</a></div>
    </div>` : ''}`;

  document.getElementById('fiche-commande-contenu').innerHTML = html;

  // Boutons selon le statut
  const actions = document.getElementById('fiche-commande-actions');
  let actionsHTML = '';

 if (c.statut === 'En attente') {
    actionsHTML += `<button class="bouton" onclick="modifierCommande('${c.cmd_id}')">Modifier</button>`;
    actionsHTML += `<button class="bouton bouton-or" onclick="ouvrirFormCompleter('${c.cmd_id}')">Compléter la commande</button>`;
    actionsHTML += `<button class="bouton bouton-rouge" onclick="annulerCommande('${c.cmd_id}')">Annuler la commande</button>`;
  }
  if (c.statut === 'En attente de paiement') {
    actionsHTML += `<button class="bouton bouton-or" onclick="paiementRecu('${c.cmd_id}')">Paiement reçu</button>`;
    actionsHTML += `<button class="bouton bouton-contour" onclick="renvoyerPropositionV3('${c.cmd_id}')">Renvoyer la proposition</button>`;
    actionsHTML += `<button class="bouton bouton-contour" onclick="textoProposition('${c.cmd_id}')">Texto au client</button>`;
    actionsHTML += `<button class="bouton" onclick="modifierProduitsCommande('${c.cmd_id}')">Modifier les produits</button>`;
    actionsHTML += `<button class="bouton bouton-rouge" onclick="annulerCommande('${c.cmd_id}')">Annuler la commande</button>`;
  }
  if (c.statut === 'À expédier') {
    actionsHTML += `<button class="bouton bouton-or" onclick="changerStatutCommande('${c.cmd_id}', 'Terminée')">Marquer comme expédiée</button>`;
  }
  actionsHTML += `<button class="bouton bouton-contour" onclick="fermerFicheCommande()">Fermer</button>`;

  actions.innerHTML = actionsHTML;

  // Afficher la fiche
  document.getElementById('contenu-commandes').classList.add('cache');
  document.getElementById('filtres-commandes').classList.add('cache');
  document.getElementById('form-commande').classList.add('cache');
  document.getElementById('fiche-commande').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFicheCommande() {
  document.getElementById('fiche-commande').classList.add('cache');
  document.getElementById('contenu-commandes').classList.remove('cache');
  document.getElementById('filtres-commandes').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.remove('cache');
}

// ═══════════════════════════════════════
// MODIFIER UNE COMMANDE
// ═══════════════════════════════════════
async function modifierCommande(cmd_id) {
  afficherChargement();
  const [resEntete, resLignes] = await Promise.all([
    appelAPI('getCommandesEntete'),
    appelAPI('getCommandesLignes', { cmd_id })
  ]);
  cacherChargement();

  if (!resEntete || !resEntete.success || !resLignes || !resLignes.success) {
    afficherMsg('commandes', 'Erreur de chargement.', 'erreur');
    return;
  }

  const c = resEntete.items.find(x => x.cmd_id === cmd_id);
  if (!c) return;

  // Préparer le formulaire en mode édition
  ouvrirFormCommande();
  cmdModeEdition   = true;
  cmdIdEnCours     = cmd_id;
  cmdNumeroAffiche = cmd_id.replace('CMD-', '');
  document.getElementById('form-commande-titre').textContent = 'Modifier commande ' + cmdNumeroAffiche;

  // Remplir les champs
  document.getElementById('cmd-prenom').value      = c.prenom || '';
  document.getElementById('cmd-client').value      = c.nom || '';
  document.getElementById('cmd-courriel').value    = c.courriel || '';
  document.getElementById('cmd-telephone').value   = c.telephone || '';
  document.getElementById('cmd-code-postal').value = c.code_postal || '';
  document.getElementById('cmd-acompte').value     = c.acompte || 0;
  document.getElementById('cmd-notes').value       = c.notes || '';

  // Remplir le panier
  cmdLignes = (resLignes.items || []).map(l => ({
    pro_id: l.pro_id,
    nom: donneesProduits.find(p => p.pro_id === l.pro_id)?.nom || l.pro_id,
    poids: l.format_poids,
    unite: l.format_unite,
    quantite: l.quantite,
    prix_unitaire: l.prix_unitaire
  }));
  cmdRafraichirPanier();
}

// ═══════════════════════════════════════
// CHANGER LE STATUT D'UNE COMMANDE
// ═══════════════════════════════════════
async function changerStatutCommande(cmd_id, nouveauStatut) {
  afficherChargement();
  const res = await appelAPIPost('updateStatutCommande', { cmd_id, statut: nouveauStatut });
  cacherChargement();
  if (res && res.success) {
    afficherMsg('commandes', '✅ Statut mis à jour.');
    fermerFicheCommande();
    chargerCommandes();
  } else {
    afficherMsg('commandes', 'Erreur lors de la mise à jour.', 'erreur');
  }
}

// ═══════════════════════════════════════
// ANNULER UNE COMMANDE
// ═══════════════════════════════════════
function modifierProduitsCommande(cmd_id) {
  confirmerAction('Modifier les produits ? Le stock de cette commande sera remis en inventaire et tu devras renvoyer une proposition corrigée. Continuer ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('remettreStockCommande', { cmd_id, statut_apres: 'En attente' });
    cacherChargement();
    if (res && res.success) {
      await modifierCommande(cmd_id);
    } else {
      afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur lors de la remise en stock.'), 'erreur');
    }
  });
}

function annulerCommande(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  const stockSorti = c && c.statut === 'En attente de paiement';
  let message = stockSorti
    ? 'Annuler cette commande ? Le stock réservé sera remis en inventaire.'
    : 'Annuler cette commande ?';
  if (c && c.acompte > 0) {
    message = `⚠️ Un acompte de ${formaterPrix(c.acompte)} a été versé. Pensez à le rembourser au client avant d'annuler.`
      + (stockSorti ? ' Le stock sera remis en inventaire.' : '') + ' Continuer ?';
  }
  confirmerAction(message, async () => {
    afficherChargement();
    const res = stockSorti
      ? await appelAPIPost('remettreStockCommande', { cmd_id, statut_apres: 'Annulée' })
      : await appelAPIPost('updateStatutCommande', { cmd_id, statut: 'Annulée' });
    cacherChargement();
    if (res && res.success) {
      afficherMsg('commandes', '✅ Commande annulée.');
      fermerFicheCommande();
      chargerCommandes();
    } else {
      afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
    }
  });
}

// ═══════════════════════════════════════
// CONVERTIR UNE COMMANDE EN VENTE
// ═══════════════════════════════════════
async function convertirCommandeEnVente(cmd_id) {
  afficherChargement();
  const [resEntete, resLignes, resLots] = await Promise.all([
    appelAPI('getCommandesEntete'),
    appelAPI('getCommandesLignes', { cmd_id }),
    appelAPI('getLotsDisponibles')
  ]);
  cacherChargement();

  if (!resEntete || !resEntete.success || !resLignes || !resLignes.success) {
    afficherMsg('commandes', 'Erreur de chargement.', 'erreur');
    return;
  }

  const c = resEntete.items.find(x => x.cmd_id === cmd_id);
  if (!c) return;

  // Fermer la fiche commande avant de changer de section
  fermerFicheCommande();

  // Préparer la conversion : aller dans la section Ventes et pré-remplir le panier
  venLotsDisponibles = (resLots && resLots.success) ? resLots.items : [];

  // Aller dans la section Ventes
  afficherSection('ventes', null);
  document.getElementById('contenu-ventes').classList.add('cache');
  document.getElementById('filtres-ventes').classList.add('cache');
  document.querySelector('#section-ventes .page-entete .bouton')?.classList.add('cache');

  // Ouvrir le formulaire de vente
  ouvrirFormVente();

  // Remplir le client
  document.getElementById('ven-client').value    = c.client || '';
  document.getElementById('ven-courriel').value  = c.courriel || '';
  document.getElementById('ven-telephone').value = c.telephone || '';

  // Remplir le panier avec les lignes de la commande, en associant un lot disponible
  venPanier = [];
  (resLignes.items || []).forEach(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    const lot = venLotsDisponibles.find(x =>
      String(x.pro_id) === String(l.pro_id) &&
      String(x.format_poids) === String(l.format_poids) &&
      String(x.format_unite) === String(l.format_unite)
    );
    venPanier.push({
      pro_id: l.pro_id,
      lot_id: lot?.lot_id || '',
      nom: pro?.nom || l.pro_id,
      poids: l.format_poids,
      unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire
    });
  });

  venRafraichirPanier();

  // Stocker le cmd_id pour l'utiliser après finalisation
  sessionStorage.setItem('cmd-en-conversion', JSON.stringify({
    cmd_id,
    acompte: c.acompte || 0
  }));

  afficherMsg('ventes', `Commande ${c.cmd_id} prête à être convertie. Ajustez si besoin et finalisez la vente. Acompte versé : ${formaterPrix(c.acompte)}`);
}

// ═══════════════════════════════════════
// COMPLÉTER LA COMMANDE (nouveau flow)
// ═══════════════════════════════════════
var cmdCompleterIdEnCours = null;

function ouvrirFormCompleter(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;
  cmdCompleterIdEnCours = cmd_id;

  document.getElementById('form-completer-titre').textContent = 'Compléter la commande ' + cmd_id.replace('CMD-', '');

  const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmd_id);
  cmdCompleterPanier = lignes.map(l => ({
    pro_id: l.pro_id,
    poids: l.format_poids,
    unite: l.format_unite,
    quantite: parseInt(l.quantite) || 0,
    prix_unitaire: parseFloat(l.prix_unitaire) || 0
  }));
  let recap = '<div style="margin-bottom:12px"><strong>' + (c.client || '—') + '</strong>';
  if (c.courriel)  recap += '<br><span class="texte-secondaire">' + c.courriel + '</span>';
  if (c.telephone) recap += '<br><span class="texte-secondaire">' + c.telephone + '</span>';
  recap += '</div><div class="form-label">Items</div>';

  lignes.forEach(l => {
    const pro  = donneesProduits.find(p => p.pro_id === l.pro_id);
    const nom  = pro ? pro.nom : l.pro_id;
    const lot  = commandesLotsDispo.find(x =>
      String(x.pro_id) === String(l.pro_id) &&
      String(x.format_poids) === String(l.format_poids) &&
      String(x.format_unite) === String(l.format_unite)
    );
    const dispo = lot ? lot.nb_disponible : 0;
    let couleur, statut;
    if (dispo >= l.quantite) { couleur = 'var(--primary)'; statut = 'pret'; }
    else if (dispo > 0)      { couleur = 'var(--accent)';  statut = 'partiel'; }
    else                     { couleur = 'var(--danger)';  statut = 'zero'; }

    const cureJours = pro && pro.cure && !isNaN(pro.cure) ? parseInt(pro.cure) : 28;
    const dateAuto  = new Date();
    dateAuto.setDate(dateAuto.getDate() + cureJours + 7);
    const dateAutoStr = dateAuto.toISOString().split('T')[0];

    const cle = l.pro_id + '|' + l.format_poids + '|' + l.format_unite;

    recap += '<div style="padding:8px 0;border-bottom:1px solid #f2e4cf" data-cle="' + cle + '">';
    recap += '<div style="display:flex;align-items:center;gap:8px">';
    recap += '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + couleur + ';flex-shrink:0"></span>';
    recap += '<span>' + nom + ' — ' + l.format_poids + ' ' + l.format_unite + ' × ' + l.quantite + ' = ' + formaterPrix(l.prix_unitaire * l.quantite) + '</span>';
    recap += '</div>';

    if (statut !== 'pret') {
      recap += '<div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
      recap += '<select class="form-ctrl" style="width:auto;font-size:0.85rem" data-cle="' + cle + '" onchange="cmdCompleterChangerType(this)">';
      recap += '<option value="temporaire-cure">Lot en cure</option>';
      recap += '<option value="temporaire-fab" selected>Pas encore fabriqué</option>';
      recap += '<option value="temporaire-partiel">Quantité partielle</option>';
      recap += '<option value="definitif">Définitif</option>';
      recap += '</select>';
      recap += '<input type="date" class="form-ctrl" style="width:auto;font-size:0.85rem" data-cle-date="' + cle + '" value="' + dateAutoStr + '">';
      recap += '</div>';
    }
    recap += '</div>';
  });

  recap += '<div style="margin-top:8px;font-weight:500">Total prévu : ' + formaterPrix(c.total_prevu) + '</div>';
  document.getElementById('form-completer-recap').innerHTML = recap;

  document.getElementById('completer-prenom').value    = c.prenom || '';
  document.getElementById('completer-client').value    = c.nom || '';
  document.getElementById('completer-courriel').value  = c.courriel || '';
  document.getElementById('completer-telephone').value = c.telephone || '';
  document.getElementById('completer-livraison').value = (c.livraison && c.livraison > 0) ? c.livraison : '';
  document.getElementById('completer-note').value     = c.note_proposition || '';
  document.getElementById('completer-square').value   = c.lien_square || '';
  const selPromoCmd = document.getElementById('completer-promotion');
  if (selPromoCmd) selPromoCmd.value = '';
  const champRabaisCmd = document.getElementById('completer-rabais-libre');
  if (champRabaisCmd) champRabaisCmd.value = '';
  const clientBody = document.getElementById('completer-client-body');
  if (clientBody) clientBody.style.display = 'none';
  const clientChevron = document.getElementById('completer-client-chevron');
  if (clientChevron) clientChevron.textContent = '▸';
  cmdCompleterMajPromos();
  if (!document.getElementById('btn-generer-square')) {
    const btnSq = document.createElement('button');
    btnSq.id = 'btn-generer-square';
    btnSq.type = 'button';
    btnSq.className = 'bouton bouton-contour';
    btnSq.textContent = 'Générer le lien Square';
    btnSq.style.marginTop = '8px';
    btnSq.onclick = genererLienSquare;
    document.getElementById('completer-square').insertAdjacentElement('afterend', btnSq);
  }

  document.getElementById('fiche-commande').classList.add('cache');
  document.getElementById('contenu-commandes').classList.add('cache');
  document.getElementById('filtres-commandes').classList.add('cache');
  document.getElementById('form-completer-commande').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormCompleter() {
  document.getElementById('form-completer-commande').classList.add('cache');
  document.getElementById('contenu-commandes').classList.remove('cache');
  document.getElementById('filtres-commandes').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.remove('cache');
  cmdCompleterIdEnCours = null;
}

async function genererLienSquare() {
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;
  const livraison = parseFloat(String(document.getElementById('completer-livraison').value).replace(',', '.')) || 0;
  const rabais = cmdCompleterCalculerRabais();
  const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours);
  const totalPrets = lignes.reduce((s, l) => {
    const cle = l.pro_id + '|' + l.format_poids + '|' + l.format_unite;
    const sel = document.querySelector('[data-cle="' + cle + '"]');
    const type = (sel && sel.value) ? sel.value : 'pret';
    if (type === 'definitif' || type.startsWith('temporaire')) return s;
    return s + (l.prix_unitaire * l.quantite);
  }, 0);
  const montant = Math.max(0, totalPrets + livraison - rabais);
  if (montant <= 0) { afficherMsg('commandes', 'Montant invalide — aucun produit prêt à payer.', 'erreur'); return; }
  afficherChargement();
  const courriel = document.getElementById('completer-courriel').value.trim();
  const telephone = document.getElementById('completer-telephone').value.trim();
  const prenom = document.getElementById('completer-prenom').value.trim();
  const nomClient = document.getElementById('completer-client').value.trim();
  const res = await appelAPIPost('creerLienPaiement', { montant: montant, nom: 'Vos coups de cœur. Commande ' + c.cmd_id.replace('CMD-', '-'), courriel: courriel, telephone: telephone, prenom: prenom, nom_client: nomClient });
  cacherChargement();
  if (res && res.success && res.url) {
    document.getElementById('completer-square').value = res.url;
    if (res.link_id) {
      const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
      if (c) c.link_id_square = res.link_id;
      await appelAPIPost('updateCommandeEntete', { cmd_id: cmdCompleterIdEnCours, link_id_square: res.link_id });
    }
    afficherMsg('commandes', '✅ Lien de paiement généré.');
  } else {
    afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur Square.'), 'erreur');
  }
}

var cmdCompleterPanier = [];

function cmdCompleterChangerType(sel) {
  const cle = sel.dataset.cle;
  const dateInput = document.querySelector('[data-cle-date="' + cle + '"]');
  if (!dateInput) return;

  const [pro_id, fp, fu] = cle.split('|');
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  const cureJours = pro && pro.cure && !isNaN(pro.cure) ? parseInt(pro.cure) : 28;

  if (sel.value === 'temporaire-cure') {
    // Chercher le lot en cure le plus proche pour ce produit/format
    const lotEnCure = (commandesLotsDispo || []).find(x =>
      String(x.pro_id) === pro_id &&
      String(x.format_poids) === fp &&
      String(x.format_unite) === fu
    );
    if (lotEnCure && lotEnCure.date_disponibilite) {
      dateInput.value = lotEnCure.date_disponibilite;
    }
  } else if (sel.value === 'definitif') {
    dateInput.value = '';
    dateInput.disabled = true;
    return;
  } else {
    // temporaire-fab ou temporaire-partiel
    const d = new Date();
    d.setDate(d.getDate() + cureJours + 7);
    dateInput.value = d.toISOString().split('T')[0];
  }
  dateInput.disabled = false;
}

function cmdCompleterToggleClient() {
  const body = document.getElementById('completer-client-body');
  const chevron = document.getElementById('completer-client-chevron');
  if (!body) return;
  const ouvert = body.style.display !== 'none';
  body.style.display = ouvert ? 'none' : 'block';
  if (chevron) chevron.textContent = ouvert ? '▸' : '▾';
}

function cmdCompleterMajPromos() {
  const sel = document.getElementById('completer-promotion');
  if (!sel) return;
  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">— Aucune —</option>';
  const totalPanier = cmdCompleterPanier.reduce((s, l) => s + l.quantite, 0);
  (donneesPromotions || []).forEach(p => {
    let statut = '';
    let manque = 0;
    if (p.type === 'qte_produit') {
      const maxQte = Math.max(...Object.values(
        cmdCompleterPanier.reduce((acc, l) => { acc[l.pro_id] = (acc[l.pro_id] || 0) + l.quantite; return acc; }, {})
      ).concat([0]));
      if (maxQte >= p.quantite_min) statut = 'applicable';
      else { manque = p.quantite_min - maxQte; if (manque <= p.quantite_seuil) statut = 'presque'; }
    } else if (p.type === 'qte_panier') {
      if (totalPanier >= p.quantite_min) statut = 'applicable';
      else { manque = p.quantite_min - totalPanier; if (manque <= p.quantite_seuil) statut = 'presque'; }
    } else if (p.type === 'lot_complet') {
      const ok = cmdCompleterPanier.some(l => {
        const pro = donneesProduits.find(x => x.pro_id === l.pro_id);
        const fmt = (pro?.formats || []).find(f => String(f.poids) === String(l.poids) && f.unite === l.unite);
        return fmt && l.quantite >= (fmt.nb_unites || 0) && fmt.nb_unites > 0;
      });
      if (ok) statut = 'applicable';
    } else if (p.type === 'ensemble_famille') {
      if (!p.fam_id) return;
      const produitsFamille = donneesProduits.filter(x => x.fam_id === p.fam_id);
      const proIds = new Set(cmdCompleterPanier.map(l => l.pro_id));
      const manquants = produitsFamille.filter(x => !proIds.has(x.pro_id));
      if (!manquants.length) statut = 'applicable';
      else { manque = manquants.length; if (manque <= p.quantite_seuil) statut = 'presque'; }
    }
    if (!statut) return;
    const o = document.createElement('option');
    o.value = JSON.stringify({ kind: 'programmee', promo_id: p.promo_id, statut });
    o.textContent = (statut === 'applicable' ? '✅ ' : `🔜 (manque ${manque}) `) + p.nom;
    sel.appendChild(o);
  });
  const optM = document.createElement('option');
  optM.value = JSON.stringify({ kind: 'montant' });
  optM.textContent = 'Montant libre ($)';
  sel.appendChild(optM);
  const optP = document.createElement('option');
  optP.value = JSON.stringify({ kind: 'pourcentage' });
  optP.textContent = '% libre';
  sel.appendChild(optP);
  if (valActuelle) {
    const match = [...sel.options].find(o => o.value === valActuelle);
    if (match) sel.value = valActuelle;
  }
  cmdCompleterAppliquerPromo();
}

function cmdCompleterAppliquerPromo() {
  const sel = document.getElementById('completer-promotion');
  const zone = document.getElementById('completer-rabais-libre-zone');
  const champ = document.getElementById('completer-rabais-libre');
  const label = document.getElementById('completer-rabais-libre-label');
  if (!sel.value) { if (zone) zone.style.display = 'none'; return; }
  const data = JSON.parse(sel.value);
  if (data.kind === 'montant') {
    if (zone) zone.style.display = 'block';
    if (label) label.textContent = 'Rabais ($)';
    if (champ) champ.placeholder = 'Ex: 5,00';
  } else if (data.kind === 'pourcentage') {
    if (zone) zone.style.display = 'block';
    if (label) label.textContent = 'Rabais (%)';
    if (champ) champ.placeholder = 'Ex: 10';
  } else {
    if (zone) zone.style.display = 'none';
  }
}

function cmdCompleterCalculerRabais() {
  const sel = document.getElementById('completer-promotion');
  if (!sel || !sel.value) return 0;
  const data = JSON.parse(sel.value);
  const sousTotal = cmdCompleterPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  if (data.kind === 'programmee') {
    if (data.statut !== 'applicable') return 0;
    const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
    if (!p) return 0;
    if (p.type === 'qte_produit') {
      let rabais = 0;
      cmdCompleterPanier.forEach(l => {
        const qteTotale = cmdCompleterPanier.filter(x => x.pro_id === l.pro_id).reduce((s, x) => s + x.quantite, 0);
        if (qteTotale >= p.quantite_min) rabais += p.valeur * l.quantite;
      });
      return rabais;
    }
    return sousTotal * (p.valeur / 100);
  }
  if (data.kind === 'montant') {
    const v = parseFloat(String(document.getElementById('completer-rabais-libre').value).replace(',', '.')) || 0;
    return Math.max(0, v);
  }
  if (data.kind === 'pourcentage') {
    const v = parseFloat(String(document.getElementById('completer-rabais-libre').value).replace(',', '.')) || 0;
    return sousTotal * (Math.max(0, Math.min(100, v)) / 100);
  }
  return 0;
}

function cmdCompleterNomPromo() {
  const sel = document.getElementById('completer-promotion');
  if (!sel || !sel.value) return '';
  const data = JSON.parse(sel.value);
  if (data.kind === 'programmee') {
    const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
    return p ? p.nom : '';
  }
  if (data.kind === 'montant') return 'Rabais';
  if (data.kind === 'pourcentage') {
    const v = parseFloat(String(document.getElementById('completer-rabais-libre').value).replace(',', '.')) || 0;
    return `Rabais (${v} %)`;
  }
  return '';
}

function cmdCompleterTypePromo() {
  const sel = document.getElementById('completer-promotion');
  if (!sel || !sel.value) return { type: '', promo_id: '' };
  const data = JSON.parse(sel.value);
  if (data.kind === 'programmee')  return { type: 'programmée', promo_id: data.promo_id };
  if (data.kind === 'montant')     return { type: 'montant', promo_id: '' };
  if (data.kind === 'pourcentage') return { type: 'pourcentage', promo_id: '' };
  return { type: '', promo_id: '' };
}

function apercuProposition() {
  if (!cmdCompleterIdEnCours) return;
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;

  const note         = document.getElementById('completer-note').value;
  const square       = document.getElementById('completer-square').value.trim();
  const livraisonNum = parseFloat(String(document.getElementById('completer-livraison').value).replace(',', '.')) || 0;
  const rabais       = cmdCompleterCalculerRabais();
  const promoNom     = cmdCompleterNomPromo();
  const sousTotalNum = c.total_prevu || 0;
  const totalAvec    = Math.max(0, sousTotalNum + livraisonNum - rabais);

  const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours).map(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    return {
      nom: pro ? pro.nom : l.pro_id,
      poids: l.format_poids,
      unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: formaterPrix(l.prix_unitaire),
      prix_total: formaterPrix(l.prix_unitaire * l.quantite)
    };
  });

  const lignesHTML = lignes.map(l => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f2e4cf">
        <div style="color:#3d3b39">${l.nom}</div>
        <div style="font-size:0.78rem;color:#8b8680;margin-top:2px">${l.poids} ${l.unite} &nbsp;·&nbsp; ${l.prix_unitaire} / unité</div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f2e4cf;text-align:center;color:#8b8680">${l.quantite}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f2e4cf;text-align:right;color:#5a8a3a">${l.prix_total}</td>
    </tr>`).join('');

  const noteHTML = note ? `<div style="margin:0 0 24px;padding:14px 18px;background:#e8f4e8;border-left:4px solid #5a8a3a;border-radius:4px;color:#3d3b39;line-height:1.6;white-space:pre-line">${note}</div>` : '';

  const squareHTML = square
    ? `<div style="text-align:center;margin:28px 0 8px"><span style="display:inline-block;background:#5a8a3a;color:#fff;font-size:1rem;padding:14px 36px;border-radius:6px;letter-spacing:0.04em">Payer maintenant</span></div>
       <div style="text-align:center;font-size:0.72rem;color:#8b8680;margin-bottom:8px">Paiement sécurisé par Square</div>`
    : `<div style="text-align:center;margin:20px 0;padding:12px;background:#fff4e6;border-left:4px solid #d4a445;border-radius:4px;color:#3d3b39;font-size:0.85rem">⚠️ Aucun lien Square — le bouton « Payer maintenant » n'apparaîtra pas dans le courriel.</div>`;

  const html = `
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:#5a8a3a;padding:28px;text-align:center">
    <img src="https://res.cloudinary.com/dfasrauyy/image/upload/v1780105142/Logoblanc_ojpqc4.png" alt="Univers Caresse" style="width:160px;display:block;margin:0 auto">
  </div>
  <div style="padding:28px;color:#3d3b39;line-height:1.6;font-family:'DM Sans',sans-serif">
    <p>Bonjour,</p>
    ${noteHTML}
    <div style="margin:24px 0 16px;font-size:0.7rem;letter-spacing:0.2em;color:#8b8680;text-transform:uppercase">Votre commande — ${c.cmd_id.replace('CMD-', '-')}</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead>
        <tr style="border-bottom:2px solid #f2e4cf">
          <th style="text-align:left;padding:8px 0;font-size:0.65rem;letter-spacing:0.15em;color:#8b8680;text-transform:uppercase;font-weight:500">Produit</th>
          <th style="text-align:center;padding:8px 0;font-size:0.65rem;letter-spacing:0.15em;color:#8b8680;text-transform:uppercase;font-weight:500">Qté</th>
          <th style="text-align:right;padding:8px 0;font-size:0.65rem;letter-spacing:0.15em;color:#8b8680;text-transform:uppercase;font-weight:500">Total</th>
        </tr>
      </thead>
      <tbody>${lignesHTML}</tbody>
    </table>
    <div style="margin-left:auto;width:220px">
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem;color:#8b8680"><span>Sous-total</span><span>${formaterPrix(sousTotalNum)}</span></div>
      ${rabais > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem;color:#5a8a3a"><span>Rabais${promoNom ? ' — ' + promoNom : ''}</span><span>-${formaterPrix(rabais)}</span></div>` : ''}
      ${livraisonNum > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem;color:#8b8680"><span>Livraison</span><span>${formaterPrix(livraisonNum)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:10px 0 4px;font-family:'Playfair Display',serif;font-size:1.3rem;color:#5a8a3a;border-top:2px solid #5a8a3a;margin-top:6px"><span>Total</span><span>${formaterPrix(totalAvec)}</span></div>
    </div>
    ${squareHTML}
    <p style="margin-top:24px">Au plaisir,</p>
    <p style="font-family:'Playfair Display',serif;font-style:italic;color:#5a8a3a">L'équipe univers caresse savonnerie artisanale</p>
  </div>
</div>`;

  document.getElementById('modal-apercu-proposition-contenu').innerHTML = html;
  document.getElementById('modal-apercu-proposition').classList.add('ouvert');
}

function fermerApercuProposition() {
  document.getElementById('modal-apercu-proposition').classList.remove('ouvert');
}

async function envoyerProposition() {
  if (!cmdCompleterIdEnCours) return;
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;
  fermerApercuProposition();

  const prenom    = document.getElementById('completer-prenom').value.trim();
  const nom       = document.getElementById('completer-client').value.trim();
  const client    = (prenom + ' ' + nom).trim();
  const courriel  = document.getElementById('completer-courriel').value.trim();
  const telephone = document.getElementById('completer-telephone').value.trim();
  const livraison = document.getElementById('completer-livraison').value;
  const note      = document.getElementById('completer-note').value;
  const square    = document.getElementById('completer-square').value;
  const livraisonNum = parseFloat(String(livraison).replace(',', '.')) || 0;

  // Ouvrir le texto tout de suite — doit partir du clic direct, avant les envois
  if (telephone) {
    let texteSms = 'Bonjour ' + (client || '') + ',\n\n';
    texteSms += 'Votre proposition de commande Univers Caresse vient de vous être envoyée par courriel.\n';
    texteSms += 'Pensez à vérifier vos courriels indésirables (pourriels) si vous ne la voyez pas.\n\n';
    texteSms += 'Merci !\nUnivers Caresse';
    window.open('sms:' + telephone + '?body=' + encodeURIComponent(texteSms));
  }

  afficherChargement();

  const dateProposition = new Date().toLocaleDateString('fr-CA');

  const lignesPayload = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours).map(l => ({
    pro_id: l.pro_id,
    format_poids: l.format_poids,
    format_unite: l.format_unite,
    quantite: l.quantite,
    prix_unitaire: l.prix_unitaire
  }));

  const rabais = cmdCompleterCalculerRabais();
  const promoInfo = cmdCompleterTypePromo();
  const totalAvec = Math.max(0, (c.total_prevu || 0) + livraisonNum - rabais);

  const resUpdate = await appelAPIPost('updateCommandeComplete', {
    cmd_id: cmdCompleterIdEnCours,
    client: client,
    prenom: prenom,
    nom: nom,
    courriel: courriel,
    telephone: telephone,
    code_postal: c.code_postal,
    total_prevu: totalAvec,
    acompte: c.acompte || 0,
    solde: totalAvec - (c.acompte || 0),
    note_proposition: note,
    lien_square: square,
    livraison: livraisonNum,
    rabais: rabais,
    promo_id: promoInfo.promo_id,
    type_promo: promoInfo.type,
    date_proposition: dateProposition,
    lignes: lignesPayload
  });

  if (!resUpdate || !resUpdate.success) {
    cacherChargement();
    afficherMsg('commandes', 'Erreur lors de la sauvegarde.', 'erreur');
    return;
  }

  const resStock = await appelAPIPost('sortirStockCommande', {
    cmd_id: cmdCompleterIdEnCours
  });

  if (!resStock || !resStock.success) {
    cacherChargement();
    afficherMsg('commandes', '❌ ' + (resStock?.message || 'Erreur lors de la sortie du stock.'), 'erreur');
    return;
  }

  // Envoi du courriel de proposition au client
  const lignesCourriel = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours).map(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    const cle = l.pro_id + '|' + l.format_poids + '|' + l.format_unite;
    const selType = document.querySelector('[data-cle="' + cle + '"]');
    const inpDate = document.querySelector('[data-cle-date="' + cle + '"]');
    const typeVal = selType ? selType.value : 'pret';
    const type_ligne = typeVal.startsWith('temporaire') ? 'temporaire' : typeVal === 'definitif' ? 'definitif' : 'pret';
    return {
      nom: pro ? pro.nom : l.pro_id,
      poids: l.format_poids,
      unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: formaterPrix(l.prix_unitaire),
      prix_total: formaterPrix(l.prix_unitaire * l.quantite),
      type_ligne: type_ligne,
      date_dispo: inpDate ? inpDate.value : ''
    };
  });

  const resCourriel = await appelAPIPost('envoyerProposition', {
    courriel: courriel,
    client: client,
    numero: c.cmd_id,
    note: note,
    lien_square: square,
    lignes: lignesCourriel,
    sous_total: formaterPrix(c.total_prevu || 0),
    rabais: rabais > 0 ? formaterPrix(rabais) : 0,
    promo_nom: cmdCompleterNomPromo(),
    livraison: livraisonNum > 0 ? formaterPrix(livraisonNum) : 0,
    total: formaterPrix(totalAvec)
  });

  cacherChargement();

  if (resCourriel && resCourriel.success) {
    afficherMsg('commandes', '✅ Proposition envoyée au client, stock sorti.');
  } else {
    afficherMsg('commandes', '⚠️ ATTENTION — Le texto est parti mais le courriel n\'a PAS été envoyé : ' + (resCourriel?.message || 'erreur') + '. Renvoie le courriel manuellement avant de fermer.', 'erreur');
    cacherChargement();
    return;
  }
  fermerFormCompleter();
  chargerCommandes();
}
async function envoyerPropositionV3() { 
  if (!cmdCompleterIdEnCours) return;
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;
  fermerApercuProposition();

  const prenom    = document.getElementById('completer-prenom').value.trim();
  const nom       = document.getElementById('completer-client').value.trim();
  const client    = (prenom + ' ' + nom).trim();
  const courriel  = document.getElementById('completer-courriel').value.trim();
  const telephone = document.getElementById('completer-telephone').value.trim();
  const livraison = document.getElementById('completer-livraison').value;
  const note      = document.getElementById('completer-note').value;
  const square    = document.getElementById('completer-square').value;
  const livraisonNum = parseFloat(String(livraison).replace(',', '.')) || 0;

  // Ouvrir le texto tout de suite — doit partir du clic direct, avant les envois
  if (telephone) {
    let texteSms = 'Bonjour ' + (client || '') + ',\n\n';
    texteSms += 'Votre proposition de commande Univers Caresse vient de vous être envoyée par courriel.\n';
    texteSms += 'Pensez à vérifier vos courriels indésirables (pourriels) si vous ne la voyez pas.\n\n';
    texteSms += 'Merci !\nUnivers Caresse';
    window.open('sms:' + telephone + '?body=' + encodeURIComponent(texteSms));
  }

  afficherChargement();

  const dateProposition = new Date().toLocaleDateString('fr-CA');

  const lignesPayload = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours).map(l => {
    const cle = l.pro_id + '|' + l.format_poids + '|' + l.format_unite;
    const selType  = document.querySelector('[data-cle="' + cle + '"]');
    const inpDate  = document.querySelector('[data-cle-date="' + cle + '"]');
    const typeLigne = selType ? selType.value : 'pret';
    const dateDispo = inpDate ? inpDate.value : '';
    const typeNormalise = !typeLigne || typeLigne === 'pret' ? 'pret' : typeLigne.startsWith('temporaire') ? 'temporaire' : 'definitif';
    return {
      pro_id: l.pro_id,
      format_poids: l.format_poids,
      format_unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire,
      type_ligne: typeNormalise,
      date_dispo: dateDispo
    };
  });

  const rabais = cmdCompleterCalculerRabais();
  const promoInfo = cmdCompleterTypePromo();
  const totalAvec = Math.max(0, (c.total_prevu || 0) + livraisonNum - rabais);

  const resUpdate = await appelAPIPost('updateCommandeComplete', {
    cmd_id: cmdCompleterIdEnCours,
    client: client,
    prenom: prenom,
    nom: nom,
    courriel: courriel,
    telephone: telephone,
    code_postal: c.code_postal,
    total_prevu: totalAvec,
    acompte: c.acompte || 0,
    solde: totalAvec - (c.acompte || 0),
    note_proposition: note,
    lien_square: square,
    livraison: livraisonNum,
    rabais: rabais,
    promo_id: promoInfo.promo_id,
    type_promo: promoInfo.type,
    date_proposition: dateProposition,
    lignes: lignesPayload
  });

  if (!resUpdate || !resUpdate.success) {
    cacherChargement();
    afficherMsg('commandes', 'Erreur lors de la sauvegarde.', 'erreur');
    return;
  }

  const resStock = await appelAPIPost('sortirStockCommande', {
    cmd_id: cmdCompleterIdEnCours
  });

  if (!resStock || !resStock.success) {
    cacherChargement();
    afficherMsg('commandes', '❌ ' + (resStock?.message || 'Erreur lors de la sortie du stock.'), 'erreur');
    return;
  }

  // Envoi du courriel de proposition au client
  const lignesCourriel = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours).map(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    return {
      nom: pro ? pro.nom : l.pro_id,
      poids: l.format_poids,
      unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: formaterPrix(l.prix_unitaire),
      prix_total: formaterPrix(l.prix_unitaire * l.quantite)
    };
  });

  const resCourriel = await appelAPIPost('envoyerPropositionV3', {
    courriel: courriel,
    client: client,
    numero: c.cmd_id,
    note: note,
    lien_square: square,
    lignes: lignesCourriel,
    sous_total: formaterPrix(c.total_prevu || 0),
    rabais: rabais > 0 ? formaterPrix(rabais) : 0,
    promo_nom: cmdCompleterNomPromo(),
    livraison: livraisonNum > 0 ? formaterPrix(livraisonNum) : 0,
    total: formaterPrix(totalAvec)
  });

  cacherChargement();

  if (resCourriel && resCourriel.success) {
    afficherMsg('commandes', '✅ Proposition envoyée au client, stock sorti.');
  } else {
    afficherMsg('commandes', '⚠️ Stock sorti, mais le courriel n\'est pas parti : ' + (resCourriel?.message || 'erreur') + '. Corrige le courriel et renvoie.', 'erreur');
  }
  fermerFormCompleter();
  chargerCommandes();
}

var cmdPaiementIdEnCours = null;

function paiementRecu(cmd_id) {
  cmdPaiementIdEnCours = cmd_id;
  document.getElementById('modal-mode-paiement-cmd').classList.add('ouvert');
}

function fermerModalModePaiementCmd() {
  document.getElementById('modal-mode-paiement-cmd').classList.remove('ouvert');
}

async function confirmerPaiementCommande(mode_paiement) {
  fermerModalModePaiementCmd();
  const cmd_id = cmdPaiementIdEnCours;
  if (!cmd_id) return;
  afficherChargement();
  const res = await appelAPIPost('creerVenteDepuisCommande', { cmd_id, mode_paiement });
  if (res && res.success) {
    // Filet : fermer le lien Square si on a le link_id
    const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
    if (c && c.link_id_square) {
      await appelAPIPost('annulerLienSquare', { link_id: c.link_id_square });
    }
    cacherChargement();
    afficherMsg('commandes', '✅ Paiement confirmé. Facture ' + res.ven_id + ' créée.');
    fermerFicheCommande();
    chargerCommandes();
  } else {
    cacherChargement();
    afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

// ═══════════════════════════════════════
// COUCOU TEXTO — propose au client de vérifier ses courriels
// Ouvre l'app Messages, pré-remplie (envoi manuel)
// ═══════════════════════════════════════
function textoProposition(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;

  const telephone = c.telephone || '';
  if (!telephone) {
    afficherMsg('commandes', 'Aucun téléphone pour cette commande.', 'erreur');
    return;
  }

  let texte = 'Bonjour ' + (c.client || '') + ',\n\n';
  texte += 'Votre proposition de commande Univers Caresse vient de vous être envoyée par courriel.\n';
  texte += 'Pensez à vérifier vos courriels indésirables (pourriels) si vous ne la voyez pas.\n\n';
  texte += 'Merci !\nUnivers Caresse';

  window.open('sms:' + telephone + '?body=' + encodeURIComponent(texte));
}

// ═══════════════════════════════════════
// RENVOYER LA MÊME PROPOSITION (v3) — sans toucher stock ni statut
// ═══════════════════════════════════════
function renvoyerPropositionV3(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;
  const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmd_id);
  if (!lignes.length) { afficherMsg('commandes', 'Aucune ligne pour cette commande.', 'erreur'); return; }

  // Aperçu avant envoi
  const sousTotal = lignes.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = c.rabais || 0;
  const livraison = c.livraison || 0;
  const total     = Math.max(0, sousTotal - rabais + livraison);

  const lignesHTML = lignes.map(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f2e4cf;font-size:0.9rem">
      <span>${pro ? pro.nom : l.pro_id} — ${l.format_poids} ${l.format_unite} × ${l.quantite}</span>
      <span>${formaterPrix(l.prix_unitaire * l.quantite)}</span>
    </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-admin-overlay';
  modal.id = 'modal-relancer';
  modal.innerHTML = `
    <div class="modal-admin" style="max-width:480px">
      <div class="modal-admin-header">
        <div class="modal-admin-titre">Relancer — ${c.client}</div>
        <button class="btn-fermer-panneau" onclick="document.getElementById('modal-relancer').remove()">✕</button>
      </div>
      <div class="modal-admin-body">
        <div style="margin-bottom:16px">${lignesHTML}</div>
        <div style="text-align:right;font-family:Georgia,serif;font-size:1.1rem;color:var(--primary);margin-bottom:20px">Total : ${formaterPrix(total)}</div>
        <div class="form-groupe">
          <label class="form-label">Mot personnel (facultatif)</label>
          <textarea class="form-ctrl" id="relancer-note" rows="3" placeholder="Un mot doux pour accompagner la relance…">${c.note_proposition || ''}</textarea>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="bouton bouton-or" onclick="confirmerRelanceV3('${cmd_id}')">Envoyer la relance</button>
          <button class="bouton bouton-contour" onclick="document.getElementById('modal-relancer').remove()">Annuler</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.classList.add('ouvert');
}

async function confirmerRelanceV3(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;
  const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmd_id);
  const note = (document.getElementById('relancer-note') || {}).value || '';

  const sousTotal = lignes.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = c.rabais || 0;
  const livraison = c.livraison || 0;
  const total     = Math.max(0, sousTotal - rabais + livraison);

  const lignesCourriel = lignes.map(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    return {
      nom: pro ? pro.nom : l.pro_id,
      poids: l.format_poids,
      unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: formaterPrix(l.prix_unitaire),
      prix_total: formaterPrix(l.prix_unitaire * l.quantite)
    };
  });

  document.getElementById('modal-relancer').remove();
  afficherChargement();
  const res = await appelAPIPost('envoyerPropositionV3', {
    courriel:    c.courriel,
    client:      c.client,
    numero:      c.cmd_id,
    note:        note,
    lien_square: c.lien_square || '',
    lignes:      lignesCourriel,
    sous_total:  formaterPrix(sousTotal),
    rabais:      rabais > 0 ? formaterPrix(rabais) : 0,
    promo_nom:   '',
    livraison:   livraison > 0 ? formaterPrix(livraison) : 0,
    total:       formaterPrix(total)
  });
  cacherChargement();

  if (res && res.success) {
    afficherMsg('commandes', '✅ Relance envoyée.');
  } else {
    afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}
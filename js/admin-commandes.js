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
        c.cmd_id || '',
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

function cmdToggleAccordeon(el) {
  const body = el.nextElementSibling;
  const estFerme = body.classList.contains('cache');
  document.querySelectorAll('#tableau-commandes .tableau-wrap').forEach(b => b.classList.add('cache'));
  if (estFerme) body.classList.remove('cache');
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
    { titre: 'VERROUILLÉES',                    statuts: ['Verrouillée'] },
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
        <td>${(c.cmd_id || '').replace('CMD-', '')}</td>
        <td>${c.date}</td>
        <td>${c.client || '—'}</td>
        <td>${formaterPrix(c.total_prevu)}</td>
        <td>${formaterPrix(c.solde)}</td>
        <td>${c.statut}</td>
        <td style="text-align:center">${pastille}</td>
      </tr>`;
    }).join('');
    return `<div class="carte-admin" style="margin-bottom:16px">
      <div class="carte-admin-entete" onclick="cmdToggleAccordeon(this)" style="cursor:pointer">${titre} <span class="texte-secondaire">${liste.length} commande${liste.length > 1 ? 's' : ''}</span></div>
      <div class="tableau-wrap cache">
        <table class="tableau-admin">
          <thead><tr><th>Nº</th><th>Date</th><th>Client</th><th>Total prévu</th><th>Solde</th><th>Statut</th><th></th></tr></thead>
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
  document.getElementById('fiche-commande-titre').textContent = 'Commande' + c.cmd_id.replace('CMD-', '-');

  let html = `
    <div style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--beige);font-size:0.92rem">
      Date : <strong>${c.date}</strong>${c.ven_id_lien ? ` &nbsp;—&nbsp; Facture : <a href="#" onclick="event.preventDefault();voirDetailVente('${c.ven_id_lien}')" style="color:var(--primary);text-decoration:underline">${c.ven_id_lien}</a>` : ''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">
      <div style="flex:1 1 260px;min-width:260px">
    <div style="margin-bottom:16px">
      <div class="form-label">Client</div>
      <div>${c.client || '—'}</div>
      ${c.courriel ? `<div class="texte-secondaire">${c.courriel}</div>` : ''}
      ${c.telephone ? `<div class="texte-secondaire">${c.telephone}</div>` : ''}
      ${c.code_postal ? `<div class="texte-secondaire">${c.code_postal}</div>` : ''}
      ${(c.rue || c.ville || c.province) ? `<div class="texte-secondaire">${[c.rue, c.ville, c.province].filter(Boolean).join(', ')}</div>` : ''}
      <button class="bouton bouton-contour bouton-petit" style="margin-top:6px" onclick="modifierAdresseCommande('${c.cmd_id}')">Modifier l'adresse</button>
    </div>
    ${c.notes ? `<div style="margin-bottom:16px">
      <div class="form-label">Notes</div>
      <div>${c.notes}</div>
    </div>` : ''}
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

  const totalArticles = (c.lignes || []).reduce((s, l) => s + (parseFloat(l.prix_unitaire) || 0) * (parseInt(l.quantite) || 0), 0);
  const livraisonNum = parseFloat(c.livraison) || 0;
  const rabaisNum = parseFloat(c.rabais) || 0;
  const estPayee = !!c.ven_id_lien;

  html += `</div>
      </div>
      <div style="flex:1 1 260px;min-width:260px">
        <div class="form-label" style="margin-bottom:6px">Facturation</div>
        <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Total des articles</span><span>${formaterPrix(totalArticles)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Frais de livraison</span><span>${formaterPrix(livraisonNum)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Escomptes</span><span>${rabaisNum > 0 ? '-' + formaterPrix(rabaisNum) : formaterPrix(0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;margin-top:2px;border-top:1px solid var(--beige);font-weight:600"><span>Sous-total</span><span>${formaterPrix(c.total_prevu)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;margin-top:6px"><span>Acompte versé</span><span>${formaterPrix(c.acompte)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Paiement reçu</span><span>${formaterPrix(estPayee ? c.total_prevu : c.acompte)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--beige);color:var(--primary);font-weight:600"><span>Solde à payer</span><span>${formaterPrix(estPayee ? 0 : c.solde)}</span></div>
      </div>
    </div>
    <div style="margin-top:16px">
      <div class="form-label">Statut</div>
      <div>${c.statut}</div>
    </div>`;

  document.getElementById('fiche-commande-contenu').innerHTML = html;

  // Boutons selon le statut
  const actions = document.getElementById('fiche-commande-actions');
  let actionsHTML = '';

 if (c.statut === 'En attente') {
    actionsHTML += `<button class="bouton" onclick="modifierCommande('${c.cmd_id}')">Modifier</button>`;
    actionsHTML += `<button class="bouton bouton-or" onclick="ouvrirFormCompleter('${c.cmd_id}')">Créer la proposition</button>`;
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
    actionsHTML += `<div style="background:#fff4e6;border:1px solid #f0c98b;border-radius:6px;padding:10px 12px;margin-bottom:10px;font-size:0.85rem;color:#7a5a2a">⚠️ Attention, générer l'étiquette achète l'envoi chez Poste Canada et facture votre compte.</div>`;
    actionsHTML += `<div class="form-label">Poids du colis (g, boîte incluse)</div>`;
    actionsHTML += `<input id="etiq-poids-${c.cmd_id}" type="number" min="1" value="${c.poids_colis || ''}" placeholder="ex. 250" style="width:100%;padding:10px;border:1px solid var(--primary);border-radius:6px;margin-bottom:10px">`;
    actionsHTML += `<button class="bouton bouton-or" onclick="genererEtiquette('${c.cmd_id}')">Générer l'étiquette</button>`;
    actionsHTML += `<button class="bouton bouton-contour" onclick="marquerExpediee('${c.cmd_id}')">Marquer comme expédiée</button>`;
  }
 
  if (c.statut === 'Modifiée') {
    actionsHTML += `<button class="bouton bouton-or" onclick="modifierProduitsCommande('${c.cmd_id}')">Revoir et re-proposer</button>`;
    actionsHTML += `<button class="bouton bouton-rouge" onclick="annulerCommande('${c.cmd_id}')">Annuler la commande</button>`;
  }
  if (c.statut === 'Verrouillée') {
    actionsHTML += `<button class="bouton bouton-or" onclick="ouvrirFormCompleter('${c.cmd_id}')">Reprendre la proposition</button>`;
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
async function modifierAdresseCommande(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;

  const ancien = document.getElementById('modif-adresse-overlay');
  if (ancien) ancien.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modif-adresse-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px';
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:10px;padding:24px;max-width:420px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,0.2)">' +
      '<h3 style="font-family:Georgia,serif;color:#5a8a3a;margin:0 0 16px">Adresse de livraison</h3>' +
      '<div class="form-group"><label class="form-label">Rue</label><input type="text" class="form-control" id="modif-adr-rue"></div>' +
      '<div class="form-group"><label class="form-label">Ville</label><input type="text" class="form-control" id="modif-adr-ville"></div>' +
      '<div class="form-group"><label class="form-label">Province (ex. QC)</label><input type="text" class="form-control" id="modif-adr-province"></div>' +
      '<div class="form-group"><label class="form-label">Code postal</label><input type="text" class="form-control" id="modif-adr-cp"></div>' +
      '<div style="display:flex;gap:8px;margin-top:16px">' +
        '<button type="button" class="bouton bouton-or" id="modif-adr-ok" style="flex:1">Enregistrer</button>' +
        '<button type="button" class="bouton bouton-contour" id="modif-adr-annuler" style="flex:1">Annuler</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  document.getElementById('modif-adr-rue').value      = c.rue || '';
  document.getElementById('modif-adr-ville').value    = c.ville || '';
  document.getElementById('modif-adr-province').value = c.province || '';
  document.getElementById('modif-adr-cp').value       = c.code_postal || '';

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.getElementById('modif-adr-annuler').onclick = () => overlay.remove();

  document.getElementById('modif-adr-ok').onclick = async () => {
    const rue      = (document.getElementById('modif-adr-rue').value || '').trim();
    const ville    = (document.getElementById('modif-adr-ville').value || '').trim();
    const province = (document.getElementById('modif-adr-province').value || '').trim();
    const cp       = (document.getElementById('modif-adr-cp').value || '').trim();
    overlay.remove();
    afficherChargement();
    const res = await appelAPIPost('updateCommandeEntete', { cmd_id, rue, ville, province, code_postal: cp });
    cacherChargement();
    if (res && res.success) {
      afficherMsg('commandes', '✅ Adresse mise à jour.');
      voirDetailCommande(cmd_id);
    } else {
      afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
    }
  };
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

async function marquerExpediee(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;

  const noTracage = (prompt('Numéro de traçage Postes Canada :') || '').trim();
  if (!noTracage) return;

  const telephone = c.telephone || '';
  if (telephone) {
    const lienSuivi = 'https://www.canadapost-postescanada.ca/track-reperage/fr#/details/' + encodeURIComponent(noTracage);
    let texteSms = 'Bonjour ' + (c.client || '') + ',\n\n';
    texteSms += 'Bonne nouvelle, votre commande ' + cmd_id + ' est en route!\n';
    texteSms += 'Suivez votre colis ici : ' + lienSuivi + '\n\n';
    texteSms += 'Merci !\nUnivers Caresse';
    window.open('sms:' + telephone + '?body=' + encodeURIComponent(texteSms));
  }

  afficherChargement();
  const res = await appelAPIPost('expedierCommande', { cmd_id, no_tracage: noTracage, facture: construireFactureCommande(cmd_id) });
  cacherChargement();
  if (res && res.success) {
    afficherMsg('commandes', '✅ Commande expédiée, courriel envoyé.');
    fermerFicheCommande();
    chargerCommandes();
  } else {
    afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}


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
  const stockSorti = c && (c.statut === 'En attente de paiement' || c.statut === 'Modifiée');
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
      if (c && c.link_id_square) {
        await appelAPIPost('annulerLienSquare', { link_id: c.link_id_square });
      }
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

  // Verrou : le client ne peut plus toucher la commande pendant qu'on prépare la proposition
  if (c.statut === 'En attente') {
    appelAPIPost('updateStatutCommande', { cmd_id: cmd_id, statut: 'Verrouillée' });
    c.statut = 'Verrouillée';
  }

  document.getElementById('form-completer-titre').textContent = 'Créer la proposition - ' + cmd_id.replace('CMD-', '');

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
      recap += '<select class="form-ctrl" style="width:auto;font-size:0.85rem" data-cle="' + cle + '" onchange="cmdCompleterChangerType(this);cmdCompleterMajPoids()">';
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
  if (!document.getElementById('completer-poids')) {
    const panneauPoids = document.createElement('div');
    panneauPoids.className = 'form-panel visible';
    panneauPoids.innerHTML =
      '<div class="form-panel-header"><span class="form-panel-titre">Poids du colis (g)</span></div>' +
      '<div class="form-body">' +
        '<input type="text" inputmode="decimal" class="form-ctrl" id="completer-poids" placeholder="Calculé tout seul — ajustez et ajoutez la boîte">' +
        '<button type="button" id="btn-calculer-tarif" class="bouton bouton-contour" style="margin-top:8px" onclick="cmdCompleterCalculerTarif()">Calculer le tarif</button>' +
      '</div>';
    const panneauLivraison = document.getElementById('completer-livraison').closest('.form-panel');
    if (panneauLivraison) panneauLivraison.insertAdjacentElement('beforebegin', panneauPoids);
  }
  cmdCompleterChargerPoids();

  document.getElementById('fiche-commande').classList.add('cache');
  document.getElementById('contenu-commandes').classList.add('cache');
  document.getElementById('filtres-commandes').classList.add('cache');
  document.getElementById('form-completer-commande').classList.remove('cache');
  document.querySelector('#section-commandes .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormCompleter() {
  // Fermé sans envoyer → on relâche le verrou, la commande retourne dans Entrantes
  if (!window.cmdCompleterEnvoiEnCours && cmdCompleterIdEnCours) {
    const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
    if (c && c.statut === 'Verrouillée') {
      appelAPIPost('updateStatutCommande', { cmd_id: cmdCompleterIdEnCours, statut: 'En attente' });
      c.statut = 'En attente';
    }
  }
  window.cmdCompleterEnvoiEnCours = false;
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

// ─── POSTE CANADA : poids du colis + tarif ───
var cmdCompleterPoidsParFormat = {};

async function cmdCompleterChargerPoids() {
  const res = await appelAPI('getProduitsFormats');
  cmdCompleterPoidsParFormat = {};
  if (res && res.success) {
    (res.items || []).forEach(f => {
      const cle = String(f.pro_id) + '|' + String(f.poids) + '|' + String(f.unite);
      cmdCompleterPoidsParFormat[cle] = parseFloat(f.poste_gr) || 0;
    });
  }
  cmdCompleterMajPoids();
}

function cmdCompleterMajPoids() {
  const box = document.getElementById('completer-poids');
  if (!box) return;
  const lignes = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours);
  let total = 0;
  lignes.forEach(l => {
    const cleDom = l.pro_id + '|' + l.format_poids + '|' + l.format_unite;
    const sel = document.querySelector('select[data-cle="' + cleDom + '"]');
    const type = sel ? sel.value : 'pret';
    if (type === 'definitif' || type.indexOf('temporaire') === 0) return;
    const cleMap = String(l.pro_id) + '|' + String(l.format_poids) + '|' + String(l.format_unite);
    total += (cmdCompleterPoidsParFormat[cleMap] || 0) * (parseInt(l.quantite) || 0);
  });
  box.value = total ? Math.round(total) : '';
}

async function cmdCompleterCalculerTarif() {
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;
  const poids = parseFloat(String(document.getElementById('completer-poids').value).replace(',', '.')) || 0;
  if (poids <= 0) { afficherMsg('commandes', 'Indique d\'abord un poids.', 'erreur'); return; }
  if (!c.code_postal) { afficherMsg('commandes', 'Aucun code postal pour cette commande.', 'erreur'); return; }
  const cpNettoye = String(c.code_postal).replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cpNettoye)) {
    afficherMsg('commandes', 'Le code postal de cette commande semble invalide (' + c.code_postal + '). Corrige-le avec « Modifier l\'adresse ».', 'erreur');
    return;
  }
  afficherChargement();
  const res = await appelAPI('calculerTarifPosteCanada', { code_postal: c.code_postal, poids: poids });
  cacherChargement();
  if (res && res.success) {
    document.getElementById('completer-livraison').value = res.montant.toFixed(2).replace('.', ',');
    let detail = document.getElementById('completer-tarif-detail');
    if (!detail) {
      detail = document.createElement('div');
      detail.id = 'completer-tarif-detail';
      detail.style.cssText = 'margin-top:8px;font-size:0.85rem;line-height:1.5';
      const btnT = document.getElementById('btn-calculer-tarif');
      if (btnT) btnT.insertAdjacentElement('afterend', detail);
    }
    let lignesDetail = '';
    if (res.base) lignesDetail += 'Prix de base : ' + formaterPrix(res.base) + '<br>';
    (res.rabais || []).forEach(function(r) {
      lignesDetail += r.nom + ' : ' + (r.cout < 0 ? '-' : '+') + formaterPrix(Math.abs(r.cout)) + '<br>';
    });
    lignesDetail += '<strong>Total (taxes incluses) : ' + formaterPrix(res.montant) + '</strong>';
    const aUneRemise = (res.rabais || []).some(function(r) { return r.cout < 0; });
    lignesDetail += aUneRemise
      ? '<br><span style="color:var(--primary)">✓ Une remise s\'applique.</span>'
      : '<br><span style="color:var(--accent)">Aucune remise dans le détail — ce serait le tarif régulier.</span>';
    detail.innerHTML = lignesDetail;
    appelAPIPost('updateCommandeEntete', { cmd_id: cmdCompleterIdEnCours, poids_colis: poids });
    afficherMsg('commandes', '✅ Tarif calculé : ' + formaterPrix(res.montant));
  } else {
    afficherMsg('commandes', '❌ ' + (res?.message || 'Poste Canada n\'a pas répondu. Réessaie.'), 'erreur');
  }
}

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

async function apercuProposition() {
  if (!cmdCompleterIdEnCours) return;
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;

  const prenom    = document.getElementById('completer-prenom').value.trim();
  const nom       = document.getElementById('completer-client').value.trim();
  const client    = (prenom + ' ' + nom).trim();
  const courriel  = document.getElementById('completer-courriel').value.trim();
  const note      = document.getElementById('completer-note').value;
  const square    = document.getElementById('completer-square').value.trim();
  const livraisonNum = parseFloat(String(document.getElementById('completer-livraison').value).replace(',', '.')) || 0;
  const rabais    = cmdCompleterCalculerRabais();
  const totalAvec = Math.max(0, (c.total_prevu || 0) + livraisonNum - rabais);

  const lignesCourriel = toutesCommandesLignes.filter(l => l.cmd_id === cmdCompleterIdEnCours).map(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
    const col = donneesCollections.find(cc => cc.col_id === (pro && pro.col_id));
    const gam = donneesGammes.find(gg => gg.gam_id === (pro && pro.gam_id));
    return {
      nom: pro ? pro.nom : l.pro_id,
      nom_collection: col ? col.nom : '',
      nom_gamme: gam ? gam.nom : '',
      poids: l.format_poids,
      unite: l.format_unite,
      quantite: l.quantite,
      prix_unitaire: formaterPrix(l.prix_unitaire),
      prix_total: formaterPrix(l.prix_unitaire * l.quantite)
    };
  });

  afficherChargement();
  const res = await appelAPIPost('envoyerPropositionV3', {
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
    total: formaterPrix(totalAvec),
    apercu: true
  });
  cacherChargement();

  if (!res || !res.success || !res.html) {
    afficherMsg('commandes', '❌ ' + (res?.message || 'Aperçu impossible.'), 'erreur');
    return;
  }

  document.getElementById('modal-apercu-proposition-contenu').innerHTML = res.html;
  document.getElementById('modal-apercu-proposition').classList.add('ouvert');
}

function fermerApercuProposition() {
  document.getElementById('modal-apercu-proposition').classList.remove('ouvert');
}


async function envoyerPropositionV3() { 
  if (!cmdCompleterIdEnCours) return;
  const c = toutesCommandes.find(x => x.cmd_id === cmdCompleterIdEnCours);
  if (!c) return;
  window.cmdCompleterEnvoiEnCours = true;
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
    let texteSms = 'Bonjour ' + ',\n\n';
    texteSms += 'Votre proposition de commande Univers Caresse Savonnerie artisanale vient de vous être envoyée par courriel.\n';
    texteSms += 'Pensez à vérifier vos courriels indésirables (pourriels) si vous ne la voyez pas.\n\n';
    texteSms += 'Merci !\nUnivers Caresse - Savonnerie artisanale';
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

  // Lever le verrou juste avant la sortie de stock (elle exige « En attente »)
  await appelAPIPost('updateStatutCommande', { cmd_id: cmdCompleterIdEnCours, statut: 'En attente' });

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
    const col = donneesCollections.find(cc => cc.col_id === (pro && pro.col_id));
    const gam = donneesGammes.find(gg => gg.gam_id === (pro && pro.gam_id));
    return {
      nom: pro ? pro.nom : l.pro_id,
      nom_collection: col ? col.nom : '',
      nom_gamme: gam ? gam.nom : '',
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


async function genererEtiquette(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return;

  const champPoids = document.getElementById('etiq-poids-' + cmd_id);
  const poids = parseFloat(champPoids ? champPoids.value : '');
  if (!poids || poids <= 0) {
    afficherMsg('commandes', 'Entre le poids du colis en grammes avant de générer.', 'erreur');
    return;
  }

  const fenetrePdf = window.open('', '_blank');

  afficherChargement();
  const res = await appelAPIPost('genererEtiquette', { cmd_id, poids });
  cacherChargement();

  if (res && res.deja) {
    const dejaPdf = await appelAPIPost('getEtiquettePdf', { cmd_id });
    if (dejaPdf && dejaPdf.success && fenetrePdf) {
      fenetrePdf.location = await rognerEtiquetteEnUrl(dejaPdf.pdf_base64);
    } else if (fenetrePdf) { fenetrePdf.close(); }
    afficherMsg('commandes', 'Une étiquette existait déjà — rouverte, aucun nouvel achat.');
    return;
  }
  if (!(res && res.success)) {
    if (fenetrePdf) fenetrePdf.close();
    afficherMsg('commandes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
    return;
  }

  if (fenetrePdf) fenetrePdf.location = await rognerEtiquetteEnUrl(res.pdf_base64);

  const telephone = c.telephone || '';
  if (telephone) {
    const lienSuivi = 'https://www.canadapost-postescanada.ca/track-reperage/fr#/details/' + encodeURIComponent(res.no_tracage);
    let sms = 'Bonjour ' + (c.client || '') + ',\n\n';
    sms += 'Bonne nouvelle, votre commande ' + cmd_id + ' est en route!\n';
    sms += 'Suivez votre colis ici : ' + lienSuivi + '\n\nMerci !\nUnivers Caresse';
    window.open('sms:' + telephone + '?body=' + encodeURIComponent(sms));
  }

  const res2 = await appelAPIPost('expedierCommande', { cmd_id, no_tracage: res.no_tracage, facture: construireFactureCommande(cmd_id) });
  if (res2 && res2.success) {
    afficherMsg('commandes', '✅ Étiquette générée, commande expédiée, courriel envoyé.');
    fermerFicheCommande();
    chargerCommandes();
  } else {
    afficherMsg('commandes', '⚠️ Étiquette créée, mais expédition non finalisée : ' + (res2?.message || ''), 'erreur');
  }
}

function construireFactureCommande(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  if (!c) return null;

  let sousTotal = 0;
  const lignes = toutesCommandesLignes
    .filter(l => l.cmd_id === cmd_id && (!l.type_ligne || l.type_ligne === 'pret'))
    .map(l => {
      const pro = donneesProduits.find(p => p.pro_id === l.pro_id);
      const gam = donneesGammes.find(g => g.gam_id === (pro && pro.gam_id));
      const pu  = parseFloat(l.prix_unitaire) || 0;
      const qte = parseInt(l.quantite) || 0;
      sousTotal += pu * qte;
      return {
        nom: pro ? pro.nom : l.pro_id,
        gamme: gam ? gam.nom : '',
        poids: l.format_poids,
        unite: l.format_unite,
        quantite: qte,
        prix_unitaire: formaterPrix(pu),
        prix_total: formaterPrix(pu * qte)
      };
    });

  const livraison = parseFloat(c.livraison) || 0;
  const rabais    = parseFloat(c.rabais) || 0;
  const total     = Math.max(0, sousTotal - rabais + livraison);

  let promoNom = '';
  if (c.promo_id && typeof donneesPromotions !== 'undefined') {
    const p = donneesPromotions.find(x => x.promo_id === c.promo_id);
    if (p) promoNom = p.nom || '';
  }

  return {
    numero: cmd_id,
    date: new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
    client: c.client || '',
    lignes: lignes,
    sous_total: formaterPrix(sousTotal),
    rabais: rabais > 0 ? formaterPrix(rabais) : 0,
    promo_nom: promoNom,
    livraison: livraison > 0 ? formaterPrix(livraison) : 0,
    total: formaterPrix(total)
  };
}


async function rognerEtiquetteEnUrl(base64) {
  const octets = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
  const pdfDoc = await PDFLib.PDFDocument.load(octets);
  const page = pdfDoc.getPage(0);
  const { x, y, width, height } = page.getMediaBox();
  const moitie = width / 2;
  // garder la moitié DROITE (l'étiquette); le reste (instructions + reçu) est jeté
  page.setMediaBox(x + moitie, y, moitie, height);
  page.setCropBox(x + moitie, y, moitie, height);
  const bytes = await pdfDoc.save();
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}
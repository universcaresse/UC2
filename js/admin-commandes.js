/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-commandes.js
   Créé le 4 mai 2026 selon LOGIQUE-VENTES.md
   ═══════════════════════════════════════ */

// ─── ÉTAT GLOBAL ───
var cmdLignes          = [];
var cmdIdEnCours       = null;
var cmdNumeroAffiche   = '';
var cmdModeEdition     = false;
var toutesCommandes    = [];

// ═══════════════════════════════════════
// CHARGEMENT DE LA PAGE
// ═══════════════════════════════════════
async function chargerCommandes() {
  const loading = document.getElementById('loading-commandes');
  const vide    = document.getElementById('vide-commandes');
  if (loading) loading.classList.remove('cache');

  const res = await appelAPI('getCommandesEntete');

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
  document.getElementById('cmd-client').value    = '';
  document.getElementById('cmd-courriel').value  = '';
  document.getElementById('cmd-telephone').value = '';

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
  const totalPrevu = cmdLignes.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const acompte    = parseFloat(String(document.getElementById('cmd-acompte').value).replace(',', '.')) || 0;
  const solde      = Math.max(0, totalPrevu - acompte);
  document.getElementById('cmd-total-prevu').value = formaterPrix(totalPrevu);
  document.getElementById('cmd-solde').value       = formaterPrix(solde);
}

// ═══════════════════════════════════════
// ENREGISTRER LA COMMANDE
// ═══════════════════════════════════════
async function enregistrerCommande() {
  const client    = document.getElementById('cmd-client').value.trim();
  const courriel  = document.getElementById('cmd-courriel').value.trim();
  const telephone = document.getElementById('cmd-telephone').value.trim();

  if (!client) {
    afficherMsg('commandes', 'Le nom du client est obligatoire.', 'erreur');
    return;
  }
  if (!courriel && !telephone) {
    afficherMsg('commandes', 'Au moins un courriel ou un téléphone est requis.', 'erreur');
    return;
  }
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

  // Si on est en mode édition d'une commande existante, supprimer d'abord les anciennes lignes
  if (cmdModeEdition) {
    await appelAPIPost('resetCommandeLignes', { cmd_id });
  } else {
    const resCreate = await appelAPIPost('createCommande', {
      cmd_id,
      client,
      courriel,
      telephone,
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
  }

  // Ajouter les lignes
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

  // En mode édition, mettre à jour l'entête (totaux, acompte, notes, client)
  if (cmdModeEdition) {
    await appelAPIPost('updateCommandeEntete', {
      cmd_id,
      client,
      courriel,
      telephone,
      total_prevu: totalPrevu,
      acompte,
      solde,
      notes
    });
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
        c.notes || ''
      ];
      // Ajouter les noms de produits si lignes chargées
      if (c.lignes) {
        c.lignes.forEach(l => champs.push(l.nom || ''));
      }
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

  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Date</th><th>Client</th><th>Total prévu</th><th>Acompte</th><th>Solde</th><th>Statut</th></tr></thead><tbody>';
  items.forEach(c => {
    html += `<tr class="cliquable" onclick="voirDetailCommande('${c.cmd_id}')">
      <td>${c.date}</td>
      <td>${c.client || '—'}</td>
      <td>${formaterPrix(c.total_prevu)}</td>
      <td>${formaterPrix(c.acompte)}</td>
      <td>${formaterPrix(c.solde)}</td>
      <td>${c.statut}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  if (tableau) tableau.innerHTML = html;
}

// ═══════════════════════════════════════
// VOIR DÉTAIL D'UNE COMMANDE
// ═══════════════════════════════════════
async function voirDetailCommande(cmd_id) {
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
  if (!c) {
    afficherMsg('commandes', 'Commande introuvable.', 'erreur');
    return;
  }

  c.lignes = (resLignes.items || []).map(l => ({
    ...l,
    nom: donneesProduits.find(p => p.pro_id === l.pro_id)?.nom || l.pro_id
  }));

  // Afficher la fiche
  document.getElementById('fiche-commande-titre').textContent = 'Commande ' + c.cmd_id.replace('CMD-', '');

  let html = `
    <div style="margin-bottom:16px">
      <div class="form-label">Client</div>
      <div>${c.client || '—'}</div>
      ${c.courriel ? `<div class="texte-secondaire">${c.courriel}</div>` : ''}
      ${c.telephone ? `<div class="texte-secondaire">${c.telephone}</div>` : ''}
    </div>
    <div style="margin-bottom:16px">
      <div class="form-label">Date de la commande</div>
      <div>${c.date}</div>
    </div>
    <div style="margin-bottom:16px">
      <div class="form-label">Items commandés</div>`;

  c.lignes.forEach(l => {
    html += `<div style="padding:8px 0;border-bottom:1px solid var(--beige)">
      <div>${l.nom} — ${l.format_poids} ${l.format_unite}</div>
      <div class="texte-secondaire">Qté : ${l.quantite} × ${formaterPrix(l.prix_unitaire)} = ${formaterPrix(l.prix_unitaire * l.quantite)}</div>
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
    </div>`;

  document.getElementById('fiche-commande-contenu').innerHTML = html;

  // Boutons selon le statut
  const actions = document.getElementById('fiche-commande-actions');
  let actionsHTML = '';

  if (c.statut === 'En attente' || c.statut === 'Prête') {
    actionsHTML += `<button class="bouton" onclick="modifierCommande('${c.cmd_id}')">Modifier</button>`;
    if (c.statut === 'En attente') {
      actionsHTML += `<button class="bouton" onclick="changerStatutCommande('${c.cmd_id}', 'Prête')">Marquer comme prête</button>`;
    }
    actionsHTML += `<button class="bouton bouton-or" onclick="convertirCommandeEnVente('${c.cmd_id}')">Convertir en vente</button>`;
    actionsHTML += `<button class="bouton bouton-rouge" onclick="annulerCommande('${c.cmd_id}')">Annuler la commande</button>`;
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
  document.getElementById('cmd-client').value    = c.client || '';
  document.getElementById('cmd-courriel').value  = c.courriel || '';
  document.getElementById('cmd-telephone').value = c.telephone || '';
  document.getElementById('cmd-acompte').value   = c.acompte || 0;
  document.getElementById('cmd-notes').value     = c.notes || '';

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
function annulerCommande(cmd_id) {
  const c = toutesCommandes.find(x => x.cmd_id === cmd_id);
  let message = 'Annuler cette commande ?';
  if (c && c.acompte > 0) {
    message = `⚠️ Un acompte de ${formaterPrix(c.acompte)} a été versé. Pensez à le rembourser au client avant d'annuler. Continuer ?`;
  }
  confirmerAction(message, async () => {
    afficherChargement();
    const res = await appelAPIPost('updateStatutCommande', { cmd_id, statut: 'Annulée' });
    cacherChargement();
    if (res && res.success) {
      afficherMsg('commandes', '✅ Commande annulée.');
      fermerFicheCommande();
      chargerCommandes();
    } else {
      afficherMsg('commandes', 'Erreur.', 'erreur');
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

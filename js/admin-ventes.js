/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-ventes.js
   Réécrit le 4 mai 2026 selon LOGIQUE-VENTES.md
   ═══════════════════════════════════════ */

// ─── ÉTAT GLOBAL ───
var venPanier             = [];
var venIdEnCours          = null;
var venNumeroAffiche      = '';
var venLotsDisponibles    = [];
var venModeReprise        = false;
var venClientSauvegarde   = '';
var venLivraisonSauvegarde = 0;
var toutesVentes          = [];

// ─── PERSISTANCE SESSION ADMIN POUR SQUARE ───
// Square ouvre une autre app. Au retour, sessionStorage est perdu sur certains
// navigateurs iOS. On bascule sur localStorage avant d'ouvrir Square.
function venProtegerSessionAdmin() {
  if (sessionStorage.getItem('uc_admin') === 'true') {
    localStorage.setItem('uc_admin_persist', 'true');
  }
}
function venRestaurerSessionAdmin() {
  if (localStorage.getItem('uc_admin_persist') === 'true') {
    sessionStorage.setItem('uc_admin', 'true');
    localStorage.removeItem('uc_admin_persist');
  }
}

// ═══════════════════════════════════════
// CHARGEMENT DE LA PAGE VENTES
// ═══════════════════════════════════════
async function chargerVentes() {
  // Restaurer la session admin si on revient de Square
  venRestaurerSessionAdmin();

  // Vérifier le retour de Square
  const params = new URLSearchParams(window.location.search);
  const squareVenId = params.get('square_ven_id');
  if (squareVenId) window.history.replaceState({}, '', window.location.pathname);

  // Fermer toute modal résiduelle
  document.getElementById('modal-apres-vente')?.classList.remove('ouvert');
  document.getElementById('modal-facture-vente')?.classList.remove('ouvert');

  // Charger l'App ID Square si pas encore fait
  if (!squareAppId) {
    const resSquare = await appelAPI('getSquareAppId');
    if (resSquare && resSquare.app_id) squareAppId = resSquare.app_id;
  }

  // Charger les ventes
  const loading = document.getElementById('loading-ventes');
  const vide    = document.getElementById('vide-ventes');
  if (loading) loading.classList.remove('cache');
  const res = await appelAPI('getVentesEntete');
  if (loading) loading.classList.add('cache');
  if (!res || !res.success || !res.items.length) {
    toutesVentes = [];
    if (vide) vide.classList.remove('cache');
    return;
  }
  toutesVentes = res.items;
  afficherTableauVentes(toutesVentes);
  if (squareVenId) await voirDetailVente(squareVenId);
}

// ═══════════════════════════════════════
// NOUVELLE VENTE — OUVERTURE
// ═══════════════════════════════════════
function ouvrirFormVente() {
  venPanier      = [];
  venModeReprise = false;

  // Le numéro sera attribué par le serveur lors de la création
  venIdEnCours     = null;
  venNumeroAffiche = '—';

  // Charger les lots disponibles
  appelAPI('getLotsDisponibles').then(resLots => {
    venLotsDisponibles = (resLots && resLots.success) ? resLots.items : [];
  });

  // Remplir les collections
  const selCol = document.getElementById('ven-collection');
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

  // Vider les autres champs
  document.getElementById('ven-gamme').innerHTML       = '<option value="">— Gamme —</option>';
  document.getElementById('ven-produit').innerHTML     = '<option value="">— Produit —</option>';
  document.getElementById('ven-format').innerHTML      = '<option value="">— Format —</option>';
  document.getElementById('ven-quantite').value        = '1';
  document.getElementById('ven-prix').value            = '';
  document.getElementById('ven-total-ligne').value     = '';
  document.getElementById('ven-client').value          = '';
  document.getElementById('ven-courriel').value        = '';
  document.getElementById('ven-telephone').value       = '';
  document.getElementById('ven-livraison').value       = '0';
  document.getElementById('ven-sous-total').value      = '';
  document.getElementById('ven-total').value           = '';
  const infolettre = document.getElementById('ven-infolettre');
  if (infolettre) infolettre.checked = false;

  // Réinitialiser la promo
  venReinitialiserPromo();

  // Téléphone formaté
  const telInput = document.getElementById('ven-telephone');
  if (telInput && !telInput.dataset.formatBound) {
    telInput.addEventListener('input', function() {
      let v = this.value.replace(/\D/g, '').slice(0, 10);
      if (v.length >= 7)      this.value = v.slice(0,3) + ' ' + v.slice(3,6) + '-' + v.slice(6);
      else if (v.length >= 4) this.value = v.slice(0,3) + ' ' + v.slice(3);
      else                    this.value = v;
    });
    telInput.dataset.formatBound = '1';
  }

  venRafraichirPanier();

  // Afficher le formulaire
  document.getElementById('contenu-ventes').classList.add('cache');
  document.getElementById('filtres-ventes').classList.add('cache');
  document.getElementById('form-vente').classList.remove('cache');
  document.getElementById('form-vente').style.display = 'block';
  document.querySelector('#section-ventes .page-entete .bouton')?.classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormVente() {
  document.getElementById('form-vente').classList.add('cache');
  document.getElementById('filtres-ventes').classList.remove('cache');
  document.getElementById('contenu-ventes').classList.remove('cache');
  document.querySelector('#section-ventes .page-entete .bouton')?.classList.remove('cache');
  venPanier      = [];
  venIdEnCours   = null;
  venModeReprise = false;
}

// ═══════════════════════════════════════
// CASCADE COLLECTION → GAMME → PRODUIT → FORMAT
// ═══════════════════════════════════════
function venFiltrerGammes() {
  const col_id = document.getElementById('ven-collection').value;
  const sel    = document.getElementById('ven-gamme');
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
  venFiltrerProduits();
}

function venFiltrerProduits() {
  const col_id = document.getElementById('ven-collection').value;
  const gam_id = document.getElementById('ven-gamme').value;
  const sel    = document.getElementById('ven-produit');
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
  document.getElementById('ven-format').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('ven-prix').value        = '';
  document.getElementById('ven-total-ligne').value = '';
}

function venFiltrerFormats() {
  const pro_id = document.getElementById('ven-produit').value;
  const sel    = document.getElementById('ven-format');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  if (!pro_id) return;
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  (pro?.formats || [])
    .slice()
    .sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids))
    .forEach(f => {
      const lot = venLotsDisponibles.find(l =>
        String(l.pro_id) === String(pro_id) &&
        String(l.format_poids) === String(f.poids) &&
        String(l.format_unite) === String(f.unite)
      );
      const nbDispo = lot ? lot.nb_disponible : 0;
      const o = document.createElement('option');
      o.value = JSON.stringify({
        lot_id: lot?.lot_id || '',
        poids: f.poids,
        unite: f.unite,
        nb_disponible: nbDispo
      });
      o.textContent = `${f.poids} ${f.unite} — ${nbDispo} dispo`;
      sel.appendChild(o);
    });
  venMettreAJourPrix();
}

function venMettreAJourPrix() {
  const pro_id    = document.getElementById('ven-produit').value;
  const formatVal = document.getElementById('ven-format').value;
  if (!pro_id || !formatVal) {
    document.getElementById('ven-prix').value        = '';
    document.getElementById('ven-total-ligne').value = '';
    return;
  }
  const format        = JSON.parse(formatVal);
  const pro           = donneesProduits.find(p => p.pro_id === pro_id);
  const formatProduit = (pro?.formats || []).find(f =>
    String(f.poids) === String(format.poids) && f.unite === format.unite
  );
  const prix = parseFloat(String(formatProduit?.prix_vente || 0).replace(',', '.')) || 0;
  const qte  = parseInt(document.getElementById('ven-quantite').value) || 1;
  document.getElementById('ven-prix').value        = prix ? formaterPrix(prix) : '—';
  document.getElementById('ven-total-ligne').value = prix ? formaterPrix(prix * qte) : '—';
}

function venChangerQte(delta) {
  const input = document.getElementById('ven-quantite');
  const val   = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
  venMettreAJourPrix();
}

// ═══════════════════════════════════════
// AJOUTER UNE LIGNE AU PANIER
// ═══════════════════════════════════════
function venAjouterLigne() {
  const pro_id    = document.getElementById('ven-produit').value;
  const formatVal = document.getElementById('ven-format').value;
  const qte       = parseInt(document.getElementById('ven-quantite').value) || 1;

  if (!pro_id || !formatVal) {
    afficherMsg('ventes', 'Choisir un produit et un format.', 'erreur');
    return;
  }

  const format = JSON.parse(formatVal);
  if (qte > format.nb_disponible) {
    afficherMsg('ventes', `Stock insuffisant — ${format.nb_disponible} disponible(s).`, 'erreur');
    return;
  }

  const pro           = donneesProduits.find(p => p.pro_id === pro_id);
  const formatProduit = (pro?.formats || []).find(f =>
    String(f.poids) === String(format.poids) && f.unite === format.unite
  );
  const prix = parseFloat(String(formatProduit?.prix_vente || 0).replace(',', '.')) || 0;

  venPanier.push({
    pro_id,
    lot_id: format.lot_id,
    nom: pro?.nom || '',
    poids: format.poids,
    unite: format.unite,
    quantite: qte,
    prix_unitaire: prix
  });

  venRafraichirPanier();
  venResetSaisie();
}

function venResetSaisie() {
  document.getElementById('ven-collection').value      = '';
  document.getElementById('ven-gamme').innerHTML       = '<option value="">— Toutes —</option>';
  document.getElementById('ven-produit').innerHTML     = '<option value="">— Choisir —</option>';
  document.getElementById('ven-format').innerHTML      = '<option value="">— Choisir —</option>';
  document.getElementById('ven-quantite').value        = '1';
  document.getElementById('ven-prix').value            = '';
  document.getElementById('ven-total-ligne').value     = '';
}

function venSupprimerLigne(i) {
  venPanier.splice(i, 1);
  venRafraichirPanier();
}

function venRafraichirPanier() {
  const liste = document.getElementById('ven-panier-liste');
  if (!venPanier.length) {
    liste.innerHTML = '<div class="texte-secondaire">Aucun article</div>';
    venMettreAJourPromos();
    venCalculerTotal();
    return;
  }
  liste.innerHTML = venPanier.map((l, i) => `
    <div class="ingredient-rangee ven-panier-item">
      <div class="ven-panier-nom">${l.nom} — ${l.poids} ${l.unite}</div>
      <div class="ven-panier-details">
        <span>Qté : ${l.quantite}</span>
        <span>${formaterPrix(l.prix_unitaire * l.quantite)}</span>
        <button class="bouton bouton-petit bouton-rouge" onclick="venSupprimerLigne(${i})">✕</button>
      </div>
    </div>`).join('');
  venMettreAJourPromos();
}

// ═══════════════════════════════════════
// PROMOTIONS / RABAIS — système unifié
// Trois types : programmée | montant | pourcentage
// ═══════════════════════════════════════
function venReinitialiserPromo() {
  const sel = document.getElementById('ven-promotion');
  if (sel) sel.value = '';
  const champ = document.getElementById('ven-rabais-libre');
  if (champ) champ.value = '';
  const zone = document.getElementById('ven-rabais-libre-zone');
  if (zone) zone.style.display = 'none';
  const info = document.getElementById('ven-promo-info');
  if (info) info.style.display = 'none';
  venCalculerTotal();
}

function venMettreAJourPromos() {
  const sel = document.getElementById('ven-promotion');
  if (!sel) return;

  const valActuelle = sel.value;
  sel.innerHTML = '<option value="">— Aucune —</option>';

  // Ajouter les promos programmées
  const totalPanier = venPanier.reduce((s, l) => s + l.quantite, 0);
  donneesPromotions.forEach(p => {
    let statut = '';
    let manque = 0;

    if (p.type === 'qte_produit') {
      const maxQteMemeProduit = Math.max(...Object.values(
        venPanier.reduce((acc, l) => { acc[l.pro_id] = (acc[l.pro_id] || 0) + l.quantite; return acc; }, {})
      ).concat([0]));
      if (maxQteMemeProduit >= p.quantite_min) statut = 'applicable';
      else { manque = p.quantite_min - maxQteMemeProduit; if (manque <= p.quantite_seuil) statut = 'presque'; }
    }
    else if (p.type === 'qte_panier') {
      if (totalPanier >= p.quantite_min) statut = 'applicable';
      else { manque = p.quantite_min - totalPanier; if (manque <= p.quantite_seuil) statut = 'presque'; }
    }
    else if (p.type === 'lot_complet') {
      const applicable = venPanier.some(l => {
        const pro = donneesProduits.find(x => x.pro_id === l.pro_id);
        const fmt = (pro?.formats || []).find(f => String(f.poids) === String(l.poids) && f.unite === l.unite);
        return fmt && l.quantite >= (fmt.nb_unites || 0) && fmt.nb_unites > 0;
      });
      if (applicable) statut = 'applicable';
    }
    else if (p.type === 'ensemble_famille') {
      if (!p.fam_id) return;
      const produitsFamille = donneesProduits.filter(x => x.fam_id === p.fam_id);
      const proIdsVendus    = new Set(venPanier.map(l => l.pro_id));
      const manquants       = produitsFamille.filter(x => !proIdsVendus.has(x.pro_id));
      if (!manquants.length) statut = 'applicable';
      else { manque = manquants.length; if (manque <= p.quantite_seuil) statut = 'presque'; }
    }

    if (!statut) return;

    const o = document.createElement('option');
    o.value = JSON.stringify({ kind: 'programmee', promo_id: p.promo_id, statut });
    const prefix = statut === 'applicable' ? '✅ ' : `🔜 (manque ${manque}) `;
    o.textContent = prefix + p.nom;
    if (statut === 'presque') o.style.color = 'var(--accent)';
    sel.appendChild(o);
  });

  // Ajouter les options libres (toujours présentes)
  const optMontant = document.createElement('option');
  optMontant.value = JSON.stringify({ kind: 'montant' });
  optMontant.textContent = 'Montant libre ($)';
  sel.appendChild(optMontant);

  const optPct = document.createElement('option');
  optPct.value = JSON.stringify({ kind: 'pourcentage' });
  optPct.textContent = '% libre';
  sel.appendChild(optPct);

  // Restaurer la sélection si encore valide
  if (valActuelle) {
    const opts = [...sel.options];
    const match = opts.find(o => o.value === valActuelle);
    if (match) sel.value = valActuelle;
  }

  venAppliquerPromotion();
}

function venAppliquerPromotion() {
  const sel    = document.getElementById('ven-promotion');
  const info   = document.getElementById('ven-promo-info');
  const zone   = document.getElementById('ven-rabais-libre-zone');
  const champ  = document.getElementById('ven-rabais-libre');
  const label  = document.getElementById('ven-rabais-libre-label');

  if (!sel.value) {
    if (info) info.style.display = 'none';
    if (zone) zone.style.display = 'none';
    venCalculerTotal();
    return;
  }

  const data = JSON.parse(sel.value);

  // Promo programmée
  if (data.kind === 'programmee') {
    if (zone) zone.style.display = 'none';
    const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
    if (!p) { if (info) info.style.display = 'none'; venCalculerTotal(); return; }
    if (data.statut === 'presque') {
      if (info) {
        info.style.display = 'block';
        info.style.borderLeftColor = 'var(--accent)';
        info.style.background = 'var(--accent-08)';
        info.textContent = '🔜 Pas encore applicable — encouragez le client à compléter sa commande !';
      }
    } else {
      const rabais = venCalculerRabais();
      if (info) {
        info.style.display = 'block';
        info.style.borderLeftColor = 'var(--primary)';
        info.style.background = 'var(--primary-06)';
        info.textContent = `✅ Rabais appliqué : -${formaterPrix(rabais)}`;
      }
    }
    venCalculerTotal();
    return;
  }

  // Montant libre
  if (data.kind === 'montant') {
    if (zone) zone.style.display = 'block';
    if (label) label.textContent = 'Rabais ($)';
    if (champ) champ.placeholder = 'Ex: 5,00';
    if (info) info.style.display = 'none';
    venCalculerTotal();
    return;
  }

  // Pourcentage libre
  if (data.kind === 'pourcentage') {
    if (zone) zone.style.display = 'block';
    if (label) label.textContent = 'Rabais (%)';
    if (champ) champ.placeholder = 'Ex: 10';
    if (info) info.style.display = 'none';
    venCalculerTotal();
    return;
  }
}

function venCalculerRabais() {
  const sel = document.getElementById('ven-promotion');
  if (!sel || !sel.value) return 0;

  const data = JSON.parse(sel.value);
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);

  // Promo programmée
  if (data.kind === 'programmee') {
    if (data.statut !== 'applicable') return 0;
    const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
    if (!p) return 0;
    if (p.type === 'qte_produit') {
      let rabais = 0;
      venPanier.forEach(l => {
        const qteTotale = venPanier.filter(x => x.pro_id === l.pro_id).reduce((s, x) => s + x.quantite, 0);
        if (qteTotale >= p.quantite_min) rabais += p.valeur * l.quantite;
      });
      return rabais;
    }
    if (p.type === 'qte_panier' || p.type === 'lot_complet' || p.type === 'ensemble_famille') {
      return sousTotal * (p.valeur / 100);
    }
    return 0;
  }

  // Montant libre
  if (data.kind === 'montant') {
    const v = parseFloat(String(document.getElementById('ven-rabais-libre').value).replace(',', '.')) || 0;
    return Math.max(0, v);
  }

  // Pourcentage libre
  if (data.kind === 'pourcentage') {
    const v = parseFloat(String(document.getElementById('ven-rabais-libre').value).replace(',', '.')) || 0;
    return sousTotal * (Math.max(0, Math.min(100, v)) / 100);
  }

  return 0;
}

function venGetTypePromo() {
  const sel = document.getElementById('ven-promotion');
  if (!sel || !sel.value) return { type: '', promo_id: '' };
  const data = JSON.parse(sel.value);
  if (data.kind === 'programmee')   return { type: 'programmée',   promo_id: data.promo_id };
  if (data.kind === 'montant')      return { type: 'montant',      promo_id: '' };
  if (data.kind === 'pourcentage')  return { type: 'pourcentage',  promo_id: '' };
  return { type: '', promo_id: '' };
}

function venGetNomPromo() {
  const sel = document.getElementById('ven-promotion');
  if (!sel || !sel.value) return '';
  const data = JSON.parse(sel.value);
  if (data.kind === 'programmee') {
    const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
    return p ? p.nom : '';
  }
  if (data.kind === 'montant')     return 'Rabais';
  if (data.kind === 'pourcentage') {
    const v = parseFloat(String(document.getElementById('ven-rabais-libre').value).replace(',', '.')) || 0;
    return `Rabais (${v} %)`;
  }
  return '';
}

// ═══════════════════════════════════════
// CALCUL DU TOTAL
// ═══════════════════════════════════════
function venCalculerTotal() {
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const livraison = parseFloat(String(document.getElementById('ven-livraison').value).replace(',', '.')) || 0;
  const rabais    = venCalculerRabais();
  const total     = sousTotal + livraison - rabais;
  document.getElementById('ven-sous-total').value = formaterPrix(sousTotal);
  document.getElementById('ven-total').value      = formaterPrix(Math.max(0, total));
}

// ═══════════════════════════════════════
// APERÇU FACTURE
// ═══════════════════════════════════════
function ouvrirApercuFacture() {
  if (!venPanier.length) {
    afficherMsg('ventes', 'Aucun article dans le panier.', 'erreur');
    return;
  }

  afficherChargement();

  const client    = document.getElementById('ven-client').value;
  const courriel  = document.getElementById('ven-courriel').value;
  const telephone = document.getElementById('ven-telephone').value;
  const livraison = parseFloat(String(document.getElementById('ven-livraison').value).replace(',', '.')) || 0;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = venCalculerRabais();
  const total     = Math.max(0, sousTotal + livraison - rabais);
  const date      = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const nomPromo  = venGetNomPromo();

  let html = `
    <div style="font-family:'DM Sans',sans-serif;color:var(--gris-fonce)">
      <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--beige)">
        <div style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--primary)">Univers Caresse</div>
        <div style="font-size:0.75rem;color:var(--gris);letter-spacing:0.1em;margin-top:4px">${date}</div>
      </div>`;

  if (client || courriel || telephone) {
    html += `<div style="margin-bottom:16px;font-size:0.85rem;color:var(--gris)">`;
    if (client)    html += `<div>${client}</div>`;
    if (courriel)  html += `<div>${courriel}</div>`;
    if (telephone) html += `<div>${telephone}</div>`;
    html += `</div>`;
  }

  html += `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem">
    <thead>
      <tr style="border-bottom:2px solid var(--beige)">
        <th style="text-align:left;padding:8px 0;color:var(--gris);font-weight:500;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase">Produit</th>
        <th style="text-align:right;padding:8px 0;color:var(--gris);font-weight:500;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase">Total</th>
      </tr>
    </thead>
    <tbody>`;

  venPanier.forEach(l => {
    html += `<tr style="border-bottom:1px solid var(--beige)">
      <td style="padding:10px 0">
        <div>${l.nom} — ${l.poids} ${l.unite}</div>
        <div style="display:flex;gap:16px;margin-top:4px;color:var(--gris);font-size:0.8rem">
          <span>Qté : ${l.quantite}</span>
          <span>${formaterPrix(l.prix_unitaire)} / unité</span>
        </div>
      </td>
      <td style="padding:10px 0;text-align:right">${formaterPrix(l.prix_unitaire * l.quantite)}</td>
    </tr>`;
  });

  html += `</tbody></table>
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;font-size:0.85rem;padding-left:30%">
      <div style="display:flex;justify-content:space-between;width:280px"><span style="color:var(--gris)">Sous-total</span><span>${formaterPrix(sousTotal)}</span></div>`;

  if (rabais > 0) {
    html += `<div style="display:flex;justify-content:space-between;width:280px;color:var(--primary)"><span>${nomPromo || 'Rabais'}</span><span>-${formaterPrix(rabais)}</span></div>`;
  }
  if (livraison > 0) {
    html += `<div style="display:flex;justify-content:space-between;width:280px"><span style="color:var(--gris)">Livraison</span><span>${formaterPrix(livraison)}</span></div>`;
  }

  html += `<div style="display:flex;justify-content:space-between;width:280px;font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--primary);border-top:1px solid var(--beige);padding-top:8px;margin-top:4px"><span>Total</span><span>${formaterPrix(total)}</span></div>
    </div>
    <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--beige);font-family:'Playfair Display',serif;font-style:italic;color:var(--gris);font-size:0.9rem">Merci pour votre achat !</div>
  </div>`;

  document.getElementById('modal-fv-contenu').innerHTML = html;
  document.getElementById('modal-fv-numero').textContent = venNumeroAffiche;

  // Boutons selon le contexte
  const btnSquare = document.getElementById('btn-payer-square');
  if (btnSquare) btnSquare.style.display = '';

  if (!venModeReprise) {
    document.getElementById('fv-boutons-paiement').style.display   = '';
    document.getElementById('fv-boutons-impression').style.display = '';
  }

  cacherChargement();
  document.getElementById('modal-facture-vente').classList.add('ouvert');
}

function fermerApercuFacture() {
  document.getElementById('modal-facture-vente').classList.remove('ouvert');
  venCacherSpinnerSquare();
  // Réinitialiser le mode reprise pour éviter les comportements bizarres
  venModeReprise = false;
  venIdEnCours   = null;
  venPanier      = [];
}

function fermerModalApresVente() {
  document.getElementById('modal-apres-vente').classList.remove('ouvert');
  document.getElementById('modal-facture-vente').classList.remove('ouvert');
  fermerFormVente();
  chargerVentes();
}

// ═══════════════════════════════════════
// PAIEMENT PAR SQUARE
// ═══════════════════════════════════════

async function payerParSquare() {
  if (!venPanier.length) { afficherMsg('ventes', 'Aucun article dans le panier.', 'erreur'); return; }
  if (!squareAppId) { afficherMsg('ventes', 'Square non configuré.', 'erreur'); return; }

  document.getElementById('fv-spinner')?.classList.remove('cache');
  document.getElementById('fv-boutons-paiement').style.display = 'none';
  document.getElementById('fv-boutons-impression').style.display = 'none';
  afficherChargement();

  const client     = document.getElementById('ven-client').value;
  const courriel   = document.getElementById('ven-courriel').value;
  const telephone  = document.getElementById('ven-telephone').value;
  const infolettre = document.getElementById('ven-infolettre')?.checked ? '1' : '0';
  const livraison  = parseFloat(String(document.getElementById('ven-livraison').value).replace(',', '.')) || 0;
  const sousTotal  = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais     = venCalculerRabais();
  const total      = Math.max(0, sousTotal + livraison - rabais);
  const totalCents = Math.round(total * 100);

  if (totalCents <= 0) { cacherChargement(); afficherMsg('ventes', 'Total invalide.', 'erreur'); return; }

  let ven_id = venIdEnCours;

  if (venModeReprise) {
    const resReset = await appelAPIPost('resetVenteLignes', { ven_id });
    if (!resReset || !resReset.success) { cacherChargement(); afficherMsg('ventes', 'Erreur.', 'erreur'); return; }
  } else {
    const resCreate = await appelAPIPost('createVente', { client, courriel, telephone, mode_paiement: 'square', infolettre });
    if (!resCreate || !resCreate.success) { cacherChargement(); afficherMsg('ventes', resCreate?.message || 'Erreur.', 'erreur'); return; }
    ven_id = resCreate.ven_id;
    venIdEnCours = ven_id;
    venNumeroAffiche = ven_id.replace('VEN-', '');
  }

  for (const l of venPanier) {
    await appelAPIPost('addVenteLigne', { ven_id, pro_id: l.pro_id, lot_id: l.lot_id, quantite: l.quantite, prix_unitaire: l.prix_unitaire, format_poids: l.poids, format_unite: l.unite });
  }

  const promoInfo = venGetTypePromo();
  await appelAPIPost('updateStatutVente', { ven_id, statut: 'En attente Square', courriel, telephone, infolettre, mode_paiement: 'square' });

  localStorage.setItem('square-pending', JSON.stringify({
    ven_id, livraison, promo_id: promoInfo.promo_id, type_promo: promoInfo.type,
    rabais, total_net: total, nom_promo: venGetNomPromo(),
    panier: venPanier, client, courriel, telephone, numeroAffiche: venNumeroAffiche
  }));

  venProtegerSessionAdmin();

  const callbackUrl = window.location.origin + window.location.pathname + '?square_ven_id=' + ven_id + '#ventes';
  const sdkData = {
    amount_money: { amount: totalCents, currency_code: 'CAD' },
    callback_url: callbackUrl,
    client_id: squareAppId,
    version: '1.3',
    notes: 'Vente ' + venNumeroAffiche,
    options: { supported_tender_types: ['CREDIT_CARD'] }
  };

  cacherChargement();
  window.location.href = 'square-commerce-v1://payment/create?data=' + encodeURIComponent(JSON.stringify(sdkData));
}

// Désactiver le spinner Square (au retour ou si on annule)






// Désactiver le spinner Square (au retour ou si on annule)
function venCacherSpinnerSquare() {
  document.getElementById('fv-spinner')?.classList.add('cache');
  document.getElementById('fv-boutons-paiement').style.display   = '';
  document.getElementById('fv-boutons-impression').style.display = '';
}

async function venTraiterRetourSquare(status) {
  venCacherSpinnerSquare();
  const pendingRaw = localStorage.getItem('square-pending');
  if (!pendingRaw) return;

  let pending;
  try { pending = JSON.parse(pendingRaw); }
  catch (e) { localStorage.removeItem('square-pending'); return; }

  localStorage.removeItem('square-pending');

  if (status === 'ok') {
    // Finaliser la vente
    const resFin = await appelAPIPost('finaliserVente', {
      ven_id: pending.ven_id,
      livraison: pending.livraison,
      promo_id: pending.promo_id || '',
      type_promo: pending.type_promo || '',
      rabais: pending.rabais,
      total_net: pending.total_net,
      mode_paiement: 'square',
      statut: 'Finalisé'
    });

    if (resFin && resFin.success) {
      // Si cette vente provient d'une conversion de commande, mettre à jour la commande
      const conversionRaw = sessionStorage.getItem('cmd-en-conversion');
      if (conversionRaw) {
        try {
          const conversion = JSON.parse(conversionRaw);
          if (conversion && conversion.cmd_id) {
            await appelAPIPost('updateStatutCommande', {
              cmd_id: conversion.cmd_id,
              statut: 'Livrée',
              ven_id_lien: pending.ven_id
            });
          }
        } catch (e) { /* ignore */ }
        sessionStorage.removeItem('cmd-en-conversion');
      }

      // Restaurer l'état pour afficher la facture
      venPanier             = pending.panier || [];
      venIdEnCours          = pending.ven_id;
      venNumeroAffiche      = pending.numeroAffiche;
      venClientSauvegarde   = pending.client || '';
      venLivraisonSauvegarde = pending.livraison || 0;

      // Afficher modal après-vente
      document.getElementById('apv-courriel').value     = pending.courriel || '';
      document.getElementById('apv-telephone').value    = pending.telephone || '';
      document.getElementById('apv-infolettre').checked = false;
      document.getElementById('modal-apres-vente').classList.add('ouvert');

      afficherMsg('ventes', '✅ Paiement Square reçu. Vente finalisée.');
    } else {
      afficherMsg('ventes', '❌ Erreur lors de la finalisation.', 'erreur');
    }
  } else {
    // Paiement Square annulé ou refusé : on garde la vente, on la remet "En cours"
    // pour pouvoir proposer un autre mode de paiement
    await appelAPIPost('updateStatutVente', {
      ven_id: pending.ven_id,
      statut: 'En cours'
    });

    // Restaurer l'état pour pouvoir réessayer
    venPanier              = pending.panier || [];
    venIdEnCours           = pending.ven_id;
    venNumeroAffiche       = pending.numeroAffiche;
    venClientSauvegarde    = pending.client || '';
    venLivraisonSauvegarde = pending.livraison || 0;
    venModeReprise         = true;

    // Rouvrir le formulaire de vente avec les données
    document.getElementById('contenu-ventes').classList.add('cache');
    document.getElementById('filtres-ventes').classList.add('cache');
    document.getElementById('form-vente').classList.remove('cache');
    document.getElementById('form-vente').style.display = 'block';
    document.querySelector('#section-ventes .page-entete .bouton')?.classList.add('cache');

    document.getElementById('ven-client').value    = pending.client || '';
    document.getElementById('ven-courriel').value  = pending.courriel || '';
    document.getElementById('ven-telephone').value = pending.telephone || '';
    document.getElementById('ven-livraison').value = pending.livraison || 0;

    venRafraichirPanier();

    afficherMsg('ventes', '❌ Paiement Square annulé. Choisissez un autre mode de paiement.', 'erreur');

    // Rouvrir la modal d'aperçu avec les 3 options
    setTimeout(() => ouvrirApercuFacture(), 500);
  }
}

// ═══════════════════════════════════════
// FINALISATION (Comptant / Payer plus tard)
// ═══════════════════════════════════════
async function finaliserVente(modePaiement) {
  if (!venPanier.length) {
    afficherMsg('ventes', 'Aucun article dans le panier.', 'erreur');
    return;
  }

  afficherChargement();

  let ven_id      = venIdEnCours;
  const client     = document.getElementById('ven-client').value;
  const courriel   = document.getElementById('ven-courriel').value;
  const telephone  = document.getElementById('ven-telephone').value;
  const livraison  = parseFloat(String(document.getElementById('ven-livraison').value).replace(',', '.')) || 0;
  const infolettre = document.getElementById('ven-infolettre')?.checked ? '1' : '0';

  // Détecter si on encaisse une vente "à payer" déjà existante
  const venteExistante = ven_id ? toutesVentes.find(v => v.ven_id === ven_id) : null;
  const encaissementAPayer = venteExistante && venteExistante.statut === 'a-payer';

  if (encaissementAPayer) {
    // On change juste le mode de paiement, on ne touche pas aux lignes ni au stock
    // (le stock a déjà été décrémenté lors de la finalisation initiale)
  } else if (venModeReprise) {
    const resReset = await appelAPIPost('resetVenteLignes', { ven_id });
    if (!resReset || !resReset.success) {
      cacherChargement();
      afficherMsg('ventes', 'Erreur lors de la réinitialisation.', 'erreur');
      return;
    }
  } else {
    const resCreate = await appelAPIPost('createVente', { client, courriel, telephone, mode_paiement: modePaiement, infolettre });
    if (!resCreate || !resCreate.success) {
      cacherChargement();
      afficherMsg('ventes', resCreate?.message || 'Erreur lors de la création.', 'erreur');
      return;
    }
    ven_id = resCreate.ven_id;
    venIdEnCours = ven_id;
    venNumeroAffiche = ven_id.replace('VEN-', '');
  }

  // Lignes (sauf pour un encaissement de vente "à payer")
  if (!encaissementAPayer) {
    for (const l of venPanier) {
      await appelAPIPost('addVenteLigne', {
        ven_id,
        pro_id: l.pro_id,
        lot_id: l.lot_id,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
        format_poids: l.poids,
        format_unite: l.unite
      });
    }
  }

  // Finalisation
  const promoInfo = venGetTypePromo();
  const rabais    = venCalculerRabais();
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const total_net = Math.max(0, sousTotal + livraison - rabais);

  const resFin = await appelAPIPost('finaliserVente', {
    ven_id,
    livraison,
    promo_id: promoInfo.promo_id,
    type_promo: promoInfo.type,
    rabais,
    total_net,
    mode_paiement: modePaiement,
    statut: modePaiement === 'plus-tard' ? 'a-payer' : 'Finalisé'
  });

  if (!resFin || !resFin.success) {
    cacherChargement();
    afficherMsg('ventes', 'Erreur lors de la finalisation.', 'erreur');
    return;
  }

  // Si cette vente provient d'une conversion de commande, mettre à jour la commande
  const conversionRaw = sessionStorage.getItem('cmd-en-conversion');
  if (conversionRaw) {
    try {
      const conversion = JSON.parse(conversionRaw);
      if (conversion && conversion.cmd_id) {
        await appelAPIPost('updateStatutCommande', {
          cmd_id: conversion.cmd_id,
          statut: 'Livrée',
          ven_id_lien: ven_id
        });
      }
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem('cmd-en-conversion');
  }

  cacherChargement();

  // Sauvegarder l'état pour la modal après-vente
  const panierSauvegarde  = [...venPanier];
  const idSauvegarde      = venIdEnCours;
  const numeroSauvegarde  = venNumeroAffiche;
  venClientSauvegarde     = client;
  venLivraisonSauvegarde  = livraison;

  fermerApercuFacture();
  fermerFormVente();

  // Restaurer après fermeture
  venPanier        = panierSauvegarde;
  venIdEnCours     = idSauvegarde;
  venNumeroAffiche = numeroSauvegarde;

  chargerVentes();

  // Modal après-vente
  document.getElementById('apv-courriel').value     = courriel;
  document.getElementById('apv-telephone').value    = telephone;
  document.getElementById('apv-infolettre').checked = infolettre === '1';
  document.getElementById('modal-apres-vente').classList.add('ouvert');
}

// ═══════════════════════════════════════
// APRÈS-VENTE — IMPRESSION / ENVOI
// ═══════════════════════════════════════
async function sauvegarderCoordonnees() {
  const courriel   = document.getElementById('apv-courriel').value;
  const telephone  = document.getElementById('apv-telephone').value;
  const infolettre = document.getElementById('apv-infolettre').checked ? '1' : '0';
  if (venIdEnCours) {
    await appelAPIPost('updateStatutVente', { ven_id: venIdEnCours, courriel, telephone, infolettre });
  }
}

async function imprimerFacture() {
  afficherChargement();
  await sauvegarderCoordonnees();
  document.getElementById('modal-apres-vente').classList.remove('ouvert');

  const numero    = venNumeroAffiche;
  const date      = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const client    = venClientSauvegarde || document.getElementById('ven-client').value;
  const courriel  = document.getElementById('apv-courriel').value || document.getElementById('ven-courriel').value;
  const telephone = document.getElementById('apv-telephone').value || document.getElementById('ven-telephone').value;
  const livraison = venLivraisonSauvegarde;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = venCalculerRabais();
  const total     = Math.max(0, sousTotal + livraison - rabais);
  const nomPromo  = venGetNomPromo();

  let lignesHTML = venPanier.map(l => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f2e4cf">
        <div style="font-weight:400;color:#3d3b39">${l.nom}</div>
        <div style="font-size:0.78rem;color:#8b8680;margin-top:2px">${l.poids} ${l.unite} &nbsp;·&nbsp; ${formaterPrix(l.prix_unitaire)} / unité</div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f2e4cf;text-align:center;color:#8b8680;font-size:0.85rem">${l.quantite}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f2e4cf;text-align:right;font-family:'Playfair Display',serif;color:#5a8a3a">${formaterPrix(l.prix_unitaire * l.quantite)}</td>
    </tr>`).join('');

  const fenetre = window.open('', '_blank');
  fenetre.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${numero}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&family=Birthstone&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'DM Sans',sans-serif; font-weight:300; background:#fff; color:#3d3b39; }
    .page { width:21.59cm; min-height:27.94cm; margin:0 auto; padding:48px 40px; }
    @page { size:letter; margin:0; }
    .entete { display:flex; flex-direction:column; align-items:center; margin-bottom:40px; padding-bottom:24px; border-bottom:2px solid #5a8a3a; }
    .entete-bas { display:flex; justify-content:space-between; width:100%; margin-top:16px; }
    .facture-ref { text-align:right; align-self:flex-end; }
    .facture-numero { font-family:'Playfair Display',serif; font-size:0.95rem; color:#5a8a3a; }
    .facture-date { font-size:0.78rem; color:#8b8680; margin-top:4px; }
    .client-bloc { margin-bottom:32px; padding:16px 20px; background:#f9f7f4; border-left:3px solid #d4a445; }
    .client-label { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:#8b8680; font-weight:500; margin-bottom:8px; }
    .client-nom { font-family:'Playfair Display',serif; font-size:1rem; color:#3d3b39; }
    .client-info { font-size:0.82rem; color:#8b8680; margin-top:2px; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    thead tr { border-bottom:2px solid #f2e4cf; }
    th { font-size:0.62rem; letter-spacing:0.15em; text-transform:uppercase; color:#8b8680; font-weight:500; padding:8px 0; }
    th:last-child { text-align:right; }
    th:nth-child(2) { text-align:center; }
    .totaux { margin-left:auto; width:240px; }
    .total-ligne { display:flex; justify-content:space-between; font-size:0.85rem; color:#8b8680; padding:4px 0; }
    .total-final { display:flex; justify-content:space-between; font-family:'Playfair Display',serif; font-size:1.4rem; color:#5a8a3a; border-top:2px solid #5a8a3a; padding-top:10px; margin-top:8px; }
    .merci { text-align:center; margin-top:48px; padding-top:24px; border-top:1px solid #f2e4cf; }
    .merci-texte { font-family:'Playfair Display',serif; font-style:italic; font-size:1.1rem; color:#8b8680; }
    .boutique { text-align:center; margin-top:12px; font-size:0.72rem; color:#8b8680; letter-spacing:0.06em; line-height:1.8; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head>
<body>
<div class="page">
  <div class="entete">
    <img src="../Images/Divers/Logofinal.png" alt="Univers Caresse" style="width:200px;">
    <div class="entete-bas">
      <div class="facture-date">${date}</div>
      <div class="facture-ref">
        <div class="facture-numero">Facture : ${numero}</div>
      </div>
    </div>
  </div>
  ${client || courriel || telephone ? `
  <div class="client-bloc">
    <div class="client-label">Client</div>
    ${client ? `<div class="client-nom">${client}</div>` : ''}
    ${courriel ? `<div class="client-info">${courriel}</div>` : ''}
    ${telephone ? `<div class="client-info">${telephone.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{4})/,'$1 $2-$3')}</div>` : ''}
  </div>` : ''}
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Produit</th>
        <th>Qté</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${lignesHTML}</tbody>
  </table>
  <div class="totaux">
    <div class="total-ligne"><span>Sous-total</span><span>${formaterPrix(sousTotal)}</span></div>
    ${rabais > 0 ? `<div class="total-ligne" style="color:#5a8a3a"><span>${nomPromo || 'Rabais'}</span><span>-${formaterPrix(rabais)}</span></div>` : ''}
    ${livraison > 0 ? `<div class="total-ligne"><span>Livraison</span><span>${formaterPrix(livraison)}</span></div>` : ''}
    <div class="total-final"><span>Total</span><span>${formaterPrix(total)}</span></div>
  </div>
  <div class="merci">
    <div class="merci-texte">Merci pour votre achat !</div>
    <div class="boutique">universcaresse.ca &nbsp;·&nbsp; universcaresse@gmail.com</div>
  </div>
</div>
</body></html>`);
  fenetre.document.close();
  fenetre.focus();
  cacherChargement();
  setTimeout(() => fenetre.print(), 800);
}

async function envoyerFactureCourriel() {
  afficherChargement();
  await sauvegarderCoordonnees();
  document.getElementById('modal-apres-vente').classList.remove('ouvert');

  const courriel = document.getElementById('apv-courriel').value || document.getElementById('ven-courriel').value;
  if (!courriel) {
    cacherChargement();
    afficherMsg('ventes', 'Aucun courriel indiqué pour ce client.', 'erreur');
    return;
  }

  const client    = venClientSauvegarde || document.getElementById('ven-client').value;
  const livraison = venLivraisonSauvegarde;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = venCalculerRabais();
  const total     = Math.max(0, sousTotal + livraison - rabais);
  const date      = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const nomPromo  = venGetNomPromo();
  const lignes    = venPanier.map(l => ({
    nom: l.nom,
    poids: l.poids,
    unite: l.unite,
    quantite: l.quantite,
    prix_unitaire: formaterPrix(l.prix_unitaire),
    prix_total: formaterPrix(l.prix_unitaire * l.quantite)
  }));

  const res = await appelAPIPost('envoyerFacture', {
    courriel,
    client,
    numero: venNumeroAffiche,
    date,
    lignes,
    sous_total: formaterPrix(sousTotal),
    rabais: rabais > 0 ? formaterPrix(rabais) : 0,
    promo_nom: nomPromo,
    livraison: livraison > 0 ? formaterPrix(livraison) : 0,
    total: formaterPrix(total)
  });

  cacherChargement();

  if (res && res.success) {
    afficherMsg('ventes', '✅ Facture envoyée par courriel.');
  } else {
    afficherMsg('ventes', '❌ Erreur : ' + (res?.message || 'inconnue'), 'erreur');
  }
}

async function envoyerFactureTexto() {
  afficherChargement();
  await sauvegarderCoordonnees();
  document.getElementById('modal-apres-vente').classList.remove('ouvert');

  const telephone = document.getElementById('apv-telephone').value || document.getElementById('ven-telephone').value;
  if (!telephone) {
    cacherChargement();
    afficherMsg('ventes', 'Aucun téléphone indiqué pour ce client.', 'erreur');
    return;
  }

  const livraison = venLivraisonSauvegarde;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = venCalculerRabais();
  const total     = Math.max(0, sousTotal + livraison - rabais);
  const date      = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const nomPromo  = venGetNomPromo();
  const sep = '--------------------';

  // Regrouper les mêmes produits/formats
  const panierGroupé = [];
  venPanier.forEach(l => {
    const clé = l.pro_id + '_' + l.poids + '_' + l.unite;
    const exist = panierGroupé.find(x => x.clé === clé);
    if (exist) { exist.quantite += l.quantite; }
    else panierGroupé.push({ ...l, clé, quantite: l.quantite });
  });

  let texte = `FACTURE - ${venNumeroAffiche.replace('VEN-','').replace('ven-','')}\n`;
  texte += `${date}\n\n`;
  texte += `UNIVERS CARESSE\nsavonnerie artisanale\n\n`;
  texte += `${sep}\n`;
  panierGroupé.forEach(l => {
    texte += `${l.nom}\n`;
    texte += `${l.quantite} x ${formaterPrix(l.prix_unitaire)} = ${formaterPrix(l.prix_unitaire * l.quantite)}\n`;
  });
  texte += `${sep}\n`;
  texte += `sous-total : ${formaterPrix(sousTotal)}\n`;
  if (livraison > 0) texte += `livraison : ${formaterPrix(livraison)}\n`;
  if (rabais > 0)    texte += `${nomPromo || 'rabais'} : -${formaterPrix(rabais)}\n`;
  texte += `${sep}\n`;
  texte += `total : ${formaterPrix(total)}\n\n`;
  texte += `Merci pour votre achat !\n`;
  texte += `universcaresse.ca\nuniverscaresse@gmail.com\n`;

  cacherChargement();
  window.open(`sms:${telephone}?body=${encodeURIComponent(texte)}`);
}

// ═══════════════════════════════════════
// LISTE / FILTRES DES VENTES
// ═══════════════════════════════════════
function filtrerVentes() {
  const statut    = document.getElementById('filtre-ventes-statut').value;
  const client    = (document.getElementById('filtre-ventes-client').value || '').toLowerCase();
  const produit   = (document.getElementById('filtre-ventes-produit')?.value || '').toLowerCase();
  const dateDebut = document.getElementById('filtre-ventes-date-debut')?.value || '';
  const dateFin   = document.getElementById('filtre-ventes-date-fin')?.value || '';

  const filtrees = toutesVentes.filter(v => {
    const okStatut = !statut || v.statut === statut;
    const okClient = !client || (v.client || '').toLowerCase().includes(client);

    // Filtre par produit (utilise le résumé fourni par le backend)
    let okProduit = true;
    if (produit) {
      okProduit = (v.produits_resume || '').toLowerCase().includes(produit);
    }

    // Filtre par période — la date est en format dd/MM/yyyy
    let okDate = true;
    if (dateDebut || dateFin) {
      const parts = (v.date || '').split('/');
      if (parts.length === 3) {
        const dateVente = parts[2] + '-' + parts[1] + '-' + parts[0]; // yyyy-MM-dd
        if (dateDebut && dateVente < dateDebut) okDate = false;
        if (dateFin   && dateVente > dateFin)   okDate = false;
      }
    }

    return okStatut && okClient && okProduit && okDate;
  });

  afficherTableauVentes(filtrees);
}

function reinitialiserFiltresVentes() {
  document.getElementById('filtre-ventes-statut').value     = '';
  document.getElementById('filtre-ventes-client').value     = '';
  const produit   = document.getElementById('filtre-ventes-produit');
  const dateDebut = document.getElementById('filtre-ventes-date-debut');
  const dateFin   = document.getElementById('filtre-ventes-date-fin');
  if (produit)   produit.value = '';
  if (dateDebut) dateDebut.value = '';
  if (dateFin)   dateFin.value = '';
  afficherTableauVentes(toutesVentes);
}

function afficherTableauVentes(items) {
  const tableau = document.getElementById('tableau-ventes');
  const vide    = document.getElementById('vide-ventes');

  if (!items.length) {
    if (tableau) tableau.innerHTML = '';
    if (vide) vide.classList.remove('cache');
    return;
  }
  if (vide) vide.classList.add('cache');

  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Date</th><th>Client</th><th>Paiement</th><th>Total</th><th>Statut</th></tr></thead><tbody>';
  items.forEach(v => {
    const estAPayer = v.statut === 'a-payer';
    const estAttenteSquare = v.statut === 'En attente Square';
    let statutAffiche = v.statut;
    if (estAPayer)        statutAffiche = '<span class="badge-statut-cours">À payer</span>';
    if (estAttenteSquare) statutAffiche = '<span class="badge-statut-cours">En attente Square</span>';
    html += `<tr class="cliquable" onclick="voirDetailVente('${v.ven_id}')">
      <td>${v.date}</td>
      <td>${v.client || '—'}</td>
      <td>${v.mode_paiement || '—'}</td>
      <td>${formaterPrix(v.total_net || v.total)}</td>
      <td>${statutAffiche}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  if (tableau) tableau.innerHTML = html;
}

// ═══════════════════════════════════════
// VOIR / REPRENDRE UNE VENTE EXISTANTE
// ═══════════════════════════════════════
async function voirDetailVente(ven_id) {
  venModeReprise = false;

  const [resEntete, resLignes] = await Promise.all([
    appelAPI('getVentesEntete'),
    appelAPI('getVentesLignes', { ven_id })
  ]);

  if (!resEntete || !resEntete.success || !resLignes || !resLignes.success) {
    afficherMsg('ventes', 'Erreur de chargement.', 'erreur');
    return;
  }

  const v = resEntete.items.find(x => x.ven_id === ven_id);
  if (!v) {
    afficherMsg('ventes', 'Vente introuvable.', 'erreur');
    return;
  }

  v.lignes = resLignes.items.map(l => ({
    ...l,
    nom: donneesProduits.find(p => p.pro_id === l.pro_id)?.nom || l.pro_id
  }));

  venModeReprise   = true;
  venIdEnCours     = ven_id;
  venNumeroAffiche = ven_id.replace('VEN-', '');
  venPanier = (v.lignes || []).map(l => ({
    pro_id: l.pro_id,
    lot_id: l.lot_id,
    nom: l.nom,
    poids: l.format_poids,
    unite: l.format_unite,
    quantite: l.quantite,
    prix_unitaire: l.prix_unitaire
  }));
  venClientSauvegarde    = v.client || '';
  venLivraisonSauvegarde = v.livraison || 0;

  document.getElementById('ven-livraison').value = v.livraison || 0;
  document.getElementById('ven-client').value    = v.client || '';
  document.getElementById('ven-courriel').value  = v.courriel || '';
  document.getElementById('ven-telephone').value = v.telephone || '';
  document.getElementById('apv-courriel').value  = v.courriel || '';
  document.getElementById('apv-telephone').value = v.telephone || '';
  document.getElementById('apv-infolettre').checked = false;

  // Restaurer la promo
  venRafraichirPanier();
  const selPromo = document.getElementById('ven-promotion');
  if (selPromo) {
    if (v.promo_id) {
      const opts = [...selPromo.options];
      const match = opts.find(o => {
        if (!o.value) return false;
        try { const d = JSON.parse(o.value); return d.kind === 'programmee' && d.promo_id === v.promo_id; }
        catch (e) { return false; }
      });
      if (match) selPromo.value = match.value;
    } else if (v.type_promo === 'montant' && v.rabais > 0) {
      const opts = [...selPromo.options];
      const match = opts.find(o => { try { return JSON.parse(o.value).kind === 'montant'; } catch(e) { return false; } });
      if (match) { selPromo.value = match.value; venAppliquerPromotion(); document.getElementById('ven-rabais-libre').value = String(v.rabais).replace('.', ','); }
    } else if (v.type_promo === 'pourcentage' && v.rabais > 0) {
      const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
      const pct = sousTotal > 0 ? Math.round((v.rabais / sousTotal) * 100 * 100) / 100 : 0;
      const opts = [...selPromo.options];
      const match = opts.find(o => { try { return JSON.parse(o.value).kind === 'pourcentage'; } catch(e) { return false; } });
      if (match) { selPromo.value = match.value; venAppliquerPromotion(); document.getElementById('ven-rabais-libre').value = String(pct).replace('.', ','); }
    }
    venAppliquerPromotion();
  }

  const estFinalisee     = v.statut === 'Finalisé' || v.statut === 'Finalisée';
  const estAPayer        = v.statut === 'a-payer';
  const estAttenteSquare = v.statut === 'En attente Square';
  ouvrirApercuFacture();

  document.getElementById('btn-confirmer-square')?.remove();
  if (estAttenteSquare) {
    const btnDiv = document.getElementById('fv-boutons-paiement');
    const btn = document.createElement('button');
    btn.id = 'btn-confirmer-square';
    btn.className = 'bouton bouton-primaire';
    btn.textContent = '✅ Confirmer paiement Square';
    btn.onclick = () => confirmerPaiementSquare(ven_id);
    btnDiv.innerHTML = '';
    btnDiv.appendChild(btn);
    btnDiv.style.display = '';
    document.getElementById('fv-boutons-impression').style.display = 'none';
  } else {
    document.getElementById('fv-boutons-paiement').style.display   = (estFinalisee && !estAPayer) ? 'none' : '';
    document.getElementById('fv-boutons-impression').style.display = '';
  }
}

// ═══════════════════════════════════════
// CONFIRMATION PAIEMENT SQUARE
// ═══════════════════════════════════════
async function confirmerPaiementSquare(ven_id) {
  afficherChargement();
  const pendingRaw = localStorage.getItem('square-pending');
  let pending = null;
  if (pendingRaw) { try { pending = JSON.parse(pendingRaw); } catch(e) {} }
  if (!pending || pending.ven_id !== ven_id) {
    const v = toutesVentes.find(x => x.ven_id === ven_id);
    pending = {
      ven_id,
      livraison: v?.livraison || 0,
      promo_id: v?.promo_id || '',
      type_promo: v?.type_promo || '',
      rabais: v?.rabais || 0,
      total_net: v?.total_net || v?.total || 0,
      panier: venPanier,
      client: v?.client || '',
      courriel: v?.courriel || '',
      telephone: v?.telephone || '',
      numeroAffiche: ven_id.replace('VEN-', '')
    };
  }
  const resFin = await appelAPIPost('finaliserVente', {
    ven_id: pending.ven_id,
    livraison: pending.livraison,
    promo_id: pending.promo_id || '',
    type_promo: pending.type_promo || '',
    rabais: pending.rabais,
    total_net: pending.total_net,
    mode_paiement: 'square',
    statut: 'Finalisé'
  });
  localStorage.removeItem('square-pending');
  cacherChargement();
  if (resFin && resFin.success) {
    venIdEnCours           = pending.ven_id;
    venNumeroAffiche       = pending.numeroAffiche;
    venPanier              = pending.panier || [];
    venClientSauvegarde    = pending.client || '';
    venLivraisonSauvegarde = pending.livraison || 0;
    document.getElementById('modal-facture-vente').classList.remove('ouvert');
    document.getElementById('apv-courriel').value     = pending.courriel || '';
    document.getElementById('apv-telephone').value    = pending.telephone || '';
    document.getElementById('apv-infolettre').checked = false;
    document.getElementById('modal-apres-vente').classList.add('ouvert');
    afficherMsg('ventes', '✅ Paiement Square confirmé. Vente finalisée.');
    chargerVentes();
  } else {
    afficherMsg('ventes', '❌ Erreur lors de la finalisation.', 'erreur');
  }
}

// ═══════════════════════════════════════
// LIEN DEPUIS LA NAVIGATION (« nouvelle vente »)
// ═══════════════════════════════════════
async function allerVersNouvelleVente() {
  afficherSection('ventes', null);
  document.getElementById('contenu-ventes').classList.add('cache');
  document.getElementById('filtres-ventes').classList.add('cache');
  document.querySelector('#section-ventes .page-entete .bouton')?.classList.add('cache');

  const [resPro, resFmt, resLots] = await Promise.all([
    appelAPI('getProduits'),
    appelAPI('getProduitsFormats'),
    appelAPI('getLotsDisponibles')
  ]);

  if (resPro && resPro.success) {
    const formatsMap = {};
    if (resFmt && resFmt.success) {
      (resFmt.items || []).forEach(f => {
        if (!formatsMap[f.pro_id]) formatsMap[f.pro_id] = [];
        formatsMap[f.pro_id].push({ poids: f.poids, unite: f.unite, prix_vente: f.prix_vente });
      });
    }
    donneesProduits = (resPro.items || []).map(p => ({ ...p, formats: formatsMap[p.pro_id] || [] }));
  }
  venLotsDisponibles = (resLots && resLots.success) ? resLots.items : [];

  ouvrirFormVente();
}


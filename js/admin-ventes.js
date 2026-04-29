/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-ventes.js
   ═══════════════════════════════════════ */

var venPanier = [];
var venIdEnCours = null;
var venNumeroAffiche = '';
var venLotsDisponibles = [];
var squareAppId = '';

async function chargerVentes() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('status') === 'ok') {
    const pending = sessionStorage.getItem('square-pending');
    if (pending) {
      const { ven_id, numeroAffiche } = JSON.parse(pending);
      sessionStorage.removeItem('square-pending');
      venIdEnCours     = ven_id;
      venNumeroAffiche = numeroAffiche;
      ouvrirApercuFacture();
    }
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Charger l'App ID Square une fois pour toutes
  if (!squareAppId) {
    const resSquare = await appelAPI('getSquareAppId');
    if (resSquare && resSquare.app_id) squareAppId = resSquare.app_id;
  }

  const loading = document.getElementById('loading-ventes');
  const tableau = document.getElementById('tableau-ventes');
  const vide    = document.getElementById('vide-ventes');
  if (loading) loading.classList.remove('cache');
  const res = await appelAPI('getVentesEntete');
  if (loading) loading.classList.add('cache');
  if (!res || !res.success || !res.items.length) {
    if (vide) vide.classList.remove('cache');
    return;
  }
  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Date</th><th>Client</th><th>Paiement</th><th>Total</th><th>Statut</th></tr></thead><tbody>';
  res.items.forEach(v => {
    html += `<tr class="cliquable" onclick="voirDetailVente('${v.ven_id}')">
      <td>${v.date}</td>
      <td>${v.client || '—'}</td>
      <td>${v.mode_paiement || '—'}</td>
      <td>${formaterPrix(v.total)}</td>
      <td>${v.statut}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  if (tableau) tableau.innerHTML = html;
}

function ouvrirFormVente() {
  venPanier = [];
  venIdEnCours = 'VEN-' + Date.now();
  appelAPI('getLotsDisponibles').then(resLots => {
    venLotsDisponibles = (resLots && resLots.success) ? resLots.items : [];
  });
  const derniereVente = [...(toutesFactures || [])].sort((a, b) => (b.ven_id || '').localeCompare(a.ven_id || '')).find(v => v.ven_id);
  const dernierNum = derniereVente ? parseInt(derniereVente.numero_affiche || '0') || 0 : 0;
  venNumeroAffiche = String(dernierNum + 1).padStart(4, '0');
  const selCol = document.getElementById('ven-collection');
  selCol.innerHTML = '<option value="">— Collection —</option>';
  donneesCollections.sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(c => {
    const o = document.createElement('option');
    o.value = c.col_id; o.textContent = c.nom; selCol.appendChild(o);
  });
  document.getElementById('ven-gamme').innerHTML = '<option value="">— Gamme —</option>';
  document.getElementById('ven-produit').innerHTML = '<option value="">— Produit —</option>';
  document.getElementById('ven-format').innerHTML = '<option value="">— Format —</option>';
  document.getElementById('ven-quantite').value = '1';
  document.getElementById('ven-prix').value = '';
  document.getElementById('ven-total-ligne').value = '';
  document.getElementById('ven-client').value = '';
  document.getElementById('ven-courriel').value = '';
  document.getElementById('ven-telephone').value = '';
  const elPaiement = document.getElementById('modal-fv-paiement');
  if (elPaiement) elPaiement.value = '';
  document.getElementById('ven-livraison').value = '0';
  document.getElementById('ven-sous-total').value = '';
  document.getElementById('ven-total').value = '';
  venRafraichirPanier();
  document.getElementById('contenu-ventes').classList.add('cache');
  document.getElementById('form-vente').classList.remove('cache');
  document.getElementById('form-vente').style.display = 'block';
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormVente() {
  document.getElementById('form-vente').classList.add('cache');
  document.getElementById('contenu-ventes').classList.remove('cache');
  venPanier = [];
  venIdEnCours = null;
}

function venFiltrerGammes() {
  const col_id = document.getElementById('ven-collection').value;
  const sel = document.getElementById('ven-gamme');
  sel.innerHTML = '<option value="">— Toutes —</option>';
  donneesGammes.filter(g => !col_id || g.col_id === col_id).sort((a, b) => (a.rang || 99) - (b.rang || 99)).forEach(g => {
    const o = document.createElement('option');
    o.value = g.gam_id; o.textContent = g.nom; sel.appendChild(o);
  });
  venFiltrerProduits();
}

function venFiltrerProduits() {
  const col_id = document.getElementById('ven-collection').value;
  const gam_id = document.getElementById('ven-gamme').value;
  const sel = document.getElementById('ven-produit');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  donneesProduits.filter(p => p.statut !== 'archive' && (!col_id || p.col_id === col_id) && (!gam_id || p.gam_id === gam_id))
    .sort((a, b) => (a.nom || '').localeCompare(b.nom || '')).forEach(p => {
      const o = document.createElement('option');
      o.value = p.pro_id; o.textContent = p.nom; sel.appendChild(o);
    });
  document.getElementById('ven-format').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('ven-prix').value = '';
  document.getElementById('ven-total-ligne').value = '';
}

function venFiltrerFormats() {
  const pro_id = document.getElementById('ven-produit').value;
  const sel = document.getElementById('ven-format');
  sel.innerHTML = '<option value="">— Choisir —</option>';
  if (!pro_id) return;
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  (pro?.formats || []).sort((a, b) => parseFloat(a.poids) - parseFloat(b.poids)).forEach(f => {
    const lot = venLotsDisponibles.find(l => l.pro_id === pro_id && String(l.format_poids) === String(f.poids) && l.format_unite === f.unite);
    const nbDispo = lot ? lot.nb_disponible : 0;
    const o = document.createElement('option');
    o.value = JSON.stringify({ lot_id: lot?.lot_id || '', poids: f.poids, unite: f.unite, nb_disponible: nbDispo });
    o.textContent = `${f.poids} ${f.unite} — ${nbDispo} dispo`;
    sel.appendChild(o);
  });
  venMettreAJourPrix();
}

function venMettreAJourPrix() {
  const pro_id = document.getElementById('ven-produit').value;
  const formatVal = document.getElementById('ven-format').value;
  if (!pro_id || !formatVal) {
    document.getElementById('ven-prix').value = '';
    document.getElementById('ven-total-ligne').value = '';
    return;
  }
  const format = JSON.parse(formatVal);
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  const formatProduit = (pro?.formats || []).find(f => String(f.poids) === String(format.poids) && f.unite === format.unite);
  const prix = parseFloat(String(formatProduit?.prix_vente || 0).replace(',', '.')) || 0;
  const qte  = parseInt(document.getElementById('ven-quantite').value) || 1;
  document.getElementById('ven-prix').value = prix ? formaterPrix(prix) : '—';
  document.getElementById('ven-total-ligne').value = prix ? formaterPrix(prix * qte) : '—';
}

function venChangerQte(delta) {
  const input = document.getElementById('ven-quantite');
  const val = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
  venMettreAJourPrix();
}

function venAjouterLigne() {
  const pro_id    = document.getElementById('ven-produit').value;
  const formatVal = document.getElementById('ven-format').value;
  const qte       = parseInt(document.getElementById('ven-quantite').value) || 1;
  if (!pro_id || !formatVal) { afficherMsg('ventes', 'Choisir un produit et un format.', 'erreur'); return; }
  const format = JSON.parse(formatVal);
  if (qte > format.nb_disponible) { afficherMsg('ventes', `Stock insuffisant — ${format.nb_disponible} disponible(s).`, 'erreur'); return; }
  const pro = donneesProduits.find(p => p.pro_id === pro_id);
  const formatProduit = (pro?.formats || []).find(f => String(f.poids) === String(format.poids) && f.unite === format.unite);
  const prix = parseFloat(String(formatProduit?.prix_vente || 0).replace(',', '.')) || 0;
  venPanier.push({ pro_id, lot_id: format.lot_id, nom: pro?.nom || '', poids: format.poids, unite: format.unite, quantite: qte, prix_unitaire: prix });
  venRafraichirPanier();
  document.getElementById('ven-collection').value = '';
  document.getElementById('ven-gamme').innerHTML = '<option value="">— Toutes —</option>';
  document.getElementById('ven-produit').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('ven-format').innerHTML = '<option value="">— Choisir —</option>';
  document.getElementById('ven-quantite').value = '1';
  document.getElementById('ven-prix').value = '';
  document.getElementById('ven-total-ligne').value = '';
}

function venRafraichirPanier() {
  const liste = document.getElementById('ven-panier-liste');
  if (!venPanier.length) { liste.innerHTML = '<div class="texte-secondaire">Aucun article</div>'; venCalculerTotal(); return; }
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

function venSupprimerLigne(i) {
  venPanier.splice(i, 1);
  venRafraichirPanier();
}

function venCalculerTotal() {
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const livraison = parseFloat(document.getElementById('ven-livraison').value) || 0;
  const rabais    = venCalculerRabais();
  const total     = sousTotal + livraison - rabais;
  document.getElementById('ven-sous-total').value = formaterPrix(sousTotal);
  document.getElementById('ven-total').value      = formaterPrix(Math.max(0, total));
}

function venCalculerRabais() {
  const sel = document.getElementById('ven-promotion');
  if (!sel || !sel.value) return 0;
  const data = JSON.parse(sel.value);
  if (!data || data.statut !== 'applicable') return 0;
  const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
  if (!p) return 0;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
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

function venMettreAJourPromos() {
  const sel = document.getElementById('ven-promotion');
  if (!sel) return;
  const valActuelle = sel.value ? JSON.parse(sel.value)?.promo_id : '';
  sel.innerHTML = '<option value="">— Aucune —</option>';
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
      const proIdsVendus = new Set(venPanier.map(l => l.pro_id));
      const manquants = produitsFamille.filter(x => !proIdsVendus.has(x.pro_id));
      if (!manquants.length) statut = 'applicable';
      else { manque = manquants.length; if (manque <= p.quantite_seuil) statut = 'presque'; }
    }
    if (!statut) return;
    const o = document.createElement('option');
    o.value = JSON.stringify({ promo_id: p.promo_id, statut });
    const prefix = statut === 'applicable' ? '✅ ' : `🔜 (manque ${manque}) `;
    o.textContent = prefix + p.nom;
    if (statut === 'presque') o.style.color = 'var(--accent)';
    sel.appendChild(o);
    if (p.promo_id === valActuelle) o.selected = true;
  });
  venAppliquerPromotion();
}

function venAppliquerPromotion() {
  const sel = document.getElementById('ven-promotion');
  const info = document.getElementById('ven-promo-info');
  if (!sel.value) { info.style.display = 'none'; venCalculerTotal(); return; }
  const data = JSON.parse(sel.value);
  const p = donneesPromotions.find(x => x.promo_id === data.promo_id);
  if (!p) { info.style.display = 'none'; venCalculerTotal(); return; }
  if (data.statut === 'presque') {
    info.style.display = 'block';
    info.style.borderLeftColor = 'var(--accent)';
    info.style.background = 'var(--accent-08)';
    info.textContent = '🔜 Pas encore applicable — encouragez le client à compléter sa commande !';
    venCalculerTotal();
    return;
  }
  const rabais = venCalculerRabais();
  info.style.display = 'block';
  info.style.borderLeftColor = 'var(--primary)';
  info.style.background = 'var(--primary-06)';
  info.textContent = `✅ Rabais appliqué : -${formaterPrix(rabais)}`;
  venCalculerTotal();
}

function ouvrirApercuFacture() {
  if (!venPanier.length) { afficherMsg('ventes', 'Aucun article dans le panier.', 'erreur'); return; }
  const paiement  = document.getElementById('modal-fv-paiement')?.value || '';
  const client    = document.getElementById('ven-client').value;
  const courriel  = document.getElementById('ven-courriel').value;
  const telephone = document.getElementById('ven-telephone').value;
  const livraison = parseFloat(document.getElementById('ven-livraison').value) || 0;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = venCalculerRabais();
  const total     = Math.max(0, sousTotal + livraison - rabais);
  const date      = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const promoSel  = document.getElementById('ven-promotion').value;
  const promoData = promoSel ? JSON.parse(promoSel) : null;
  const promo     = promoData ? donneesPromotions.find(p => p.promo_id === promoData.promo_id) : null;
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
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;font-size:0.85rem">
      <div style="display:flex;justify-content:space-between;width:220px"><span style="color:var(--gris)">Sous-total</span><span>${formaterPrix(sousTotal)}</span></div>`;
  if (rabais > 0 && promo) {
    html += `<div style="display:flex;justify-content:space-between;width:220px;color:var(--primary)"><span>Rabais — ${promo.nom}</span><span>-${formaterPrix(rabais)}</span></div>`;
  }
  if (livraison > 0) {
    html += `<div style="display:flex;justify-content:space-between;width:220px"><span style="color:var(--gris)">Livraison</span><span>${formaterPrix(livraison)}</span></div>`;
  }
  html += `<div style="display:flex;justify-content:space-between;width:220px;font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--primary);border-top:1px solid var(--beige);padding-top:8px;margin-top:4px"><span>Total</span><span>${formaterPrix(total)}</span></div>
    </div>
    <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--beige);font-family:'Playfair Display',serif;font-style:italic;color:var(--gris);font-size:0.9rem">Merci pour votre achat !</div>
  </div>`;
  document.getElementById('modal-fv-contenu').innerHTML = html;
  document.getElementById('modal-fv-numero').textContent = venNumeroAffiche;
  document.getElementById('modal-facture-vente').classList.add('ouvert');
}

function fermerApercuFacture() {
  document.getElementById('modal-facture-vente').classList.remove('ouvert');
}


function payerParSquare() {
  if (!squareAppId) { alert('Erreur: App ID manquant'); return; }

  const livraison = parseFloat(document.getElementById('ven-livraison').value) || 0;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = (typeof venCalculerRabais === 'function') ? venCalculerRabais() : 0;
  const total     = Math.max(0, sousTotal + livraison - rabais);
  const montantCents = Math.round(total * 100);

  // Verification visuelle sur ton iPhone
  alert("Envoi à Square : " + (montantCents / 100).toFixed(2) + "$ (" + montantCents + " cents)");

  if (montantCents <= 0) { alert("Le montant est à 0$, transaction impossible."); return; }

   const squareData = encodeURIComponent(JSON.stringify({
    amount_money: {
      amount: montantCents,
      currency_code: 'CAD'
    },
    callback_url: 'https://universcaresse.github.io/UC2/admin/',
    client_id: squareAppId,
    version: '1.2', // Changé de 1.3 à 1.2
    notes: 'Facture ' + (venNumeroAffiche || 'Client'),
    options: {
      supported_tender_types: ["CREDIT_CARD", "DEBIT_CARD", "CASH"]
    }
  }));

  window.location.href = 'square-commerce-v1://payment/create?data=' + squareData;
}




function payerPar() {
  if (!squareAppId) { afficherMsg('ventes', 'App ID Square introuvable.', 'erreur'); return; }

  const boutons = document.getElementById('fv-boutons');
  const spinner = document.getElementById('fv-spinner');
  boutons.querySelectorAll('button').forEach(b => b.disabled = true);
  spinner.classList.remove('cache');

  const livraison    = parseFloat(document.getElementById('ven-livraison').value) || 0;
  const sousTotal    = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais       = venCalculerRabais();
  const total        = Math.max(0, sousTotal + livraison - rabais);
  const montantCents = Math.round(total * 100);

  sessionStorage.setItem('square-pending', JSON.stringify({
    ven_id:        venIdEnCours,
    numeroAffiche: venNumeroAffiche
  }));

  const squareData = encodeURIComponent(JSON.stringify({
    amount_money: { amount: montantCents, currency_code: 'CAD' },
    callback_url: 'https://universcaresse.github.io/UC2/admin/',
    client_id:    squareAppId,
    version:      '1.3',
    notes:        'Facture ' + venNumeroAffiche
  }));

  setTimeout(() => {
    spinner.classList.add('cache');
    boutons.querySelectorAll('button').forEach(b => b.disabled = false);
  }, 3000);

  window.location.href = 'square-commerce-v1://payment/create?data=' + squareData;
}

function envoyerFactureCourriel() {
  const courriel = document.getElementById('ven-courriel').value;
  if (!courriel) { afficherMsg('ventes', 'Aucun courriel indiqué pour ce client.', 'erreur'); return; }
  afficherMsg('ventes', 'Fonctionnalité courriel à venir.', 'erreur');
}

function envoyerFactureTexto() {
  const telephone = document.getElementById('ven-telephone').value;
  if (!telephone) { afficherMsg('ventes', 'Aucun téléphone indiqué pour ce client.', 'erreur'); return; }
  const livraison = parseFloat(document.getElementById('ven-livraison').value) || 0;
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const rabais    = venCalculerRabais();
  const total     = Math.max(0, sousTotal + livraison - rabais);
  let texte = `Univers Caresse\n\n`;
  venPanier.forEach(l => { texte += `${l.nom} ${l.poids}${l.unite} x${l.quantite} = ${formaterPrix(l.prix_unitaire * l.quantite)}\n`; });
  texte += `\nSous-total: ${formaterPrix(sousTotal)}`;
  if (rabais > 0) texte += `\nRabais: -${formaterPrix(rabais)}`;
  if (livraison > 0) texte += `\nLivraison: ${formaterPrix(livraison)}`;
  texte += `\nTOTAL: ${formaterPrix(total)}\n\nMerci!`;
  window.open(`sms:${telephone}?body=${encodeURIComponent(texte)}`);
}

async function finaliserVente(modePaiement) {
  if (!venPanier.length) { afficherMsg('ventes', 'Aucun article dans le panier.', 'erreur'); return; }
  const paiement = modePaiement || document.getElementById('modal-fv-paiement')?.value || '';
  afficherChargement();
  const client    = document.getElementById('ven-client').value;
  const courriel  = document.getElementById('ven-courriel').value;
  const telephone = document.getElementById('ven-telephone').value;
  const livraison = parseFloat(document.getElementById('ven-livraison').value) || 0;
  const ven_id    = venIdEnCours;
  const resCreate = await appelAPIPost('createVente', { ven_id, client, courriel, telephone, mode_paiement: paiement });
  if (!resCreate || !resCreate.success) { cacherChargement(); afficherMsg('ventes', 'Erreur lors de la création.', 'erreur'); return; }
  for (const l of venPanier) {
    await appelAPIPost('addVenteLigne', { ven_id, pro_id: l.pro_id, lot_id: l.lot_id, quantite: l.quantite, prix_unitaire: l.prix_unitaire, format_poids: l.poids, format_unite: l.unite });
  }
  const promoSel  = document.getElementById('ven-promotion').value;
  const promoData = promoSel ? JSON.parse(promoSel) : null;
  const rabais    = venCalculerRabais();
  const sousTotal = venPanier.reduce((s, l) => s + (l.prix_unitaire * l.quantite), 0);
  const total_net = Math.max(0, sousTotal + livraison - rabais);
  const resFin = await appelAPIPost('finaliserVente', {
    ven_id,
    livraison,
    promo_id: promoData?.promo_id || '',
    rabais,
    total_net
  });
  if (!resFin || !resFin.success) { cacherChargement(); afficherMsg('ventes', 'Erreur lors de la finalisation.', 'erreur'); return; }
  cacherChargement();
  fermerApercuFacture();
  fermerFormVente();
  afficherMsg('ventes', '✅ Vente enregistrée.');
  chargerVentes();
}

async function voirDetailVente(ven_id) {
  afficherMsg('ventes', 'Fonctionnalité à venir.');
}
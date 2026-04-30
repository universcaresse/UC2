var donneesPromotions    = [];
var donneesRegroupements = [];

async function chargerPromotions() {
  const loading = document.getElementById('loading-promotions');
  const tableau = document.getElementById('tableau-promotions');
  const vide    = document.getElementById('vide-promotions');
  if (loading) loading.classList.remove('cache');
  const res = await appelAPI('getPromotions');
  if (loading) loading.classList.add('cache');
  if (!res || !res.success) { afficherMsg('promotions', 'Erreur de chargement.', 'erreur'); return; }
  donneesPromotions = res.items || [];
  if (!donneesPromotions.length) { if (vide) vide.classList.remove('cache'); if (tableau) tableau.innerHTML = ''; return; }
  if (vide) vide.classList.add('cache');
  const typesLabels = { qte_produit: 'Qté même produit', qte_panier: 'Qté panier', lot_complet: 'Lot complet', ensemble_famille: 'Ensemble famille' };
  let html = '<div class="tableau-wrap"><table class="tableau-admin"><thead><tr><th>Nom</th><th>Type</th><th>Valeur</th><th>Qté min</th><th></th></tr></thead><tbody>';
  donneesPromotions.forEach(p => {
    html += `<tr class="ligne-cliquable" onclick="modifierPromotion('${p.promo_id}')">
      <td>${p.nom}</td>
      <td>${typesLabels[p.type] || p.type}</td>
      <td>${p.valeur}</td>
      <td>${p.quantite_min || '—'}</td>
      <td></td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  if (tableau) tableau.innerHTML = html;
}

function ouvrirFormPromotion() {
  document.getElementById('form-promotion-titre').textContent = 'Nouvelle promotion';
  document.getElementById('fp-id').value = '';
  document.getElementById('fp-type').value = '';
  document.getElementById('fp-nom').value = '';
  document.getElementById('fp-valeur').value = '';
  document.getElementById('fp-quantite-min').value   = '';
  document.getElementById('fp-quantite-seuil').value = '';
  const selFam = document.getElementById('fp-famille');
  selFam.innerHTML = '<option value="">— Aucune —</option>';
  donneesFamilles.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).forEach(f => {
    const o = document.createElement('option');
    o.value = f.fam_id; o.textContent = f.nom; selFam.appendChild(o);
  });
  fpMettreAJourChamps();
  document.getElementById('fp-btn-supprimer').classList.remove('cache');
  document.getElementById('form-promotion').classList.remove('cache');
  document.getElementById('contenu-promotions').classList.add('cache');
  window.scrollTo(0, 0);
  document.querySelector('.admin-contenu')?.scrollTo(0, 0);
}

function fermerFormPromotion() {
  document.getElementById('form-promotion').classList.add('cache');
  document.getElementById('contenu-promotions').classList.remove('cache');
}

function fpMettreAJourChamps() {
  const type = document.getElementById('fp-type').value;
  document.getElementById('fp-groupe-famille').style.display = type === 'ensemble_famille' ? '' : 'none';
  document.getElementById('fp-groupe-qte').style.display = (type === 'qte_produit' || type === 'qte_panier') ? '' : 'none';
}

function modifierPromotion(promo_id) {
  const p = donneesPromotions.find(x => x.promo_id === promo_id);
  if (!p) return;
  document.getElementById('form-promotion-titre').textContent = 'Modifier la promotion';
  document.getElementById('fp-id').value = p.promo_id;
  document.getElementById('fp-type').value = p.type;
  document.getElementById('fp-nom').value = p.nom;
  document.getElementById('fp-valeur').value = p.valeur;
  document.getElementById('fp-quantite-min').value   = p.quantite_min   || '';
  document.getElementById('fp-quantite-seuil').value = p.quantite_seuil || '';
  const selFam = document.getElementById('fp-famille');
  selFam.innerHTML = '<option value="">— Aucune —</option>';
  donneesFamilles.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')).forEach(f => {
    const o = document.createElement('option');
    o.value = f.fam_id; o.textContent = f.nom; selFam.appendChild(o);
  });
  selFam.value = p.fam_id || '';
  fpMettreAJourChamps();
  document.getElementById('fp-btn-supprimer').classList.remove('cache');
  document.getElementById('form-promotion').classList.remove('cache');
  document.getElementById('contenu-promotions').classList.add('cache');
  window.scrollTo(0, 0);
}

async function sauvegarderPromotion() {
  afficherChargement();
  const id   = document.getElementById('fp-id').value;
  const type = document.getElementById('fp-type').value;
  const nom  = document.getElementById('fp-nom').value.trim();
  if (!type || !nom) { cacherChargement(); afficherMsg('promotions', 'Type et nom requis.', 'erreur'); return; }
  const d = {
    const dernierNumPromo = donneesPromotions.length ? Math.max(...donneesPromotions.map(p => parseInt((p.promo_id || '').replace('PROMO-', '')) || 0)) : 0;
  const d = {
    promo_id: id || ('PROMO-' + String(dernierNumPromo + 1).padStart(4, '0')),
    fam_id:       document.getElementById('fp-famille').value || '',
    type,
    nom,
    valeur:       parseFloat(document.getElementById('fp-valeur').value) || 0,
    quantite_min:   parseInt(document.getElementById('fp-quantite-min').value)   || 0,
    quantite_seuil: parseInt(document.getElementById('fp-quantite-seuil').value) || 1
  };
  const res = await appelAPIPost('savePromotion', d);
  if (res && res.success) {
    cacherChargement();
    fermerFormPromotion();
    afficherMsg('promotions', id ? 'Promotion mise à jour.' : 'Promotion ajoutée.');
    chargerPromotions();
  } else {
    cacherChargement();
    afficherMsg('promotions', 'Erreur.', 'erreur');
  }
}

function supprimerPromotionActive() {
  const id = document.getElementById('fp-id').value;
  if (!id) return;
  supprimerPromotion(id);
}

async function supprimerPromotion(promo_id) {
  confirmerAction('Supprimer cette promotion ?', async () => {
    afficherChargement();
    const res = await appelAPIPost('deletePromotion', { promo_id });
    if (res && res.success) {
      cacherChargement();
      afficherMsg('promotions', 'Promotion supprimée.');
      chargerPromotions();
    } else {
      cacherChargement();
      afficherMsg('promotions', 'Erreur.', 'erreur');
    }
  });
}
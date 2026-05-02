/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-fournisseurs.js
   ═══════════════════════════════════════ */

var fournisseursDonnees = [];

// ─── AFFICHER LA LISTE ───
async function afficherFournisseurs() {
  const res = await appelAPI('getFournisseurs');
  if (res && res.success) {
    fournisseursDonnees = res.items || [];
    ef.fournisseurs = fournisseursDonnees;
    listesDropdown.fournisseurs = fournisseursDonnees.map(f => f.nom);
  }
  const tbody = document.getElementById('fournisseurs-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (fournisseursDonnees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="vide-titre">Aucun fournisseur.</td></tr>`;
    return;
  }

  [...fournisseursDonnees]
    .sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr'))
    .forEach(f => {
      const tr = document.createElement('tr');
      tr.classList.add('ligne-cliquable');
      tr.onclick = () => ouvrirModalFournisseur(f.four_id);
      tr.innerHTML = `
        <td>${f.code || ''}</td>
        <td>${f.nom || ''}</td>
        <td>${f.site_web ? `<a href="${f.site_web}" target="_blank" onclick="event.stopPropagation()">${f.site_web}</a>` : ''}</td>
        <td>${f.notes || ''}</td>`;
      tbody.appendChild(tr);
    });
}

// ─── OUVRIR MODAL ───
function ouvrirModalFournisseur(four_id) {
  const f = fournisseursDonnees.find(f => f.four_id === four_id) || {};
  document.getElementById('modal-four-id').value       = f.four_id || '';
  document.getElementById('modal-four-nom').value      = f.nom     || '';
  document.getElementById('modal-four-code').value     = f.code    || '';
  document.getElementById('modal-four-site').value     = f.site_web || '';
  document.getElementById('modal-four-notes').value    = f.notes   || '';
  document.getElementById('modal-four-titre').textContent = f.four_id ? 'Modifier le fournisseur' : 'Nouveau fournisseur';
  const btnSupp = document.getElementById('btn-four-supprimer');
  if (btnSupp) { f.four_id ? btnSupp.classList.remove('cache') : btnSupp.classList.add('cache'); }
  document.getElementById('modal-fournisseur').classList.add('ouvert');
  document.getElementById('modal-four-nom').focus();
}

function ouvrirModalNouveauFournisseur() {
  document.getElementById('modal-four-id').value    = '';
  document.getElementById('modal-four-nom').value   = '';
  document.getElementById('modal-four-code').value  = '';
  document.getElementById('modal-four-site').value  = '';
  document.getElementById('modal-four-notes').value = '';
  document.getElementById('modal-four-titre').textContent = 'Nouveau fournisseur';
  const btnSupp = document.getElementById('btn-four-supprimer');
  if (btnSupp) btnSupp.classList.add('cache');
  document.getElementById('modal-fournisseur').classList.add('ouvert');
  document.getElementById('modal-four-nom').focus();
}

function fermerModalFournisseur() {
  document.getElementById('modal-fournisseur')?.classList.remove('ouvert');
}

// ─── AUTO-CODE depuis le nom ───
function fourAutoCode() {
  const nom  = document.getElementById('modal-four-nom')?.value || '';
  const code = document.getElementById('modal-four-code');
  if (code && !code.dataset.modifie) {
    code.value = nom.trim().slice(0, 4).toUpperCase();
  }
}

function fourCodeManuel() {
  const code = document.getElementById('modal-four-code');
  if (code) code.dataset.modifie = code.value ? 'true' : '';
}

// ─── SAUVEGARDER ───
async function sauvegarderFournisseur() {
  const four_id  = document.getElementById('modal-four-id')?.value?.trim();
  const nom      = document.getElementById('modal-four-nom')?.value?.trim();
  const code     = document.getElementById('modal-four-code')?.value?.trim();
  const site_web = document.getElementById('modal-four-site')?.value?.trim();
  const notes    = document.getElementById('modal-four-notes')?.value?.trim();

  if (!nom) { document.getElementById('modal-four-nom').focus(); return; }

  const payload = {
    four_id:  four_id || ('FOUR-' + Date.now()),
    nom,
    code,
    site_web,
    notes
  };

  const btn = document.getElementById('btn-four-sauvegarder');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"><span></span><span></span><span></span><span></span><span></span></span>'; }

  const res = await appelAPIPost('saveFournisseur', payload);

  if (btn) { btn.disabled = false; btn.innerHTML = 'Sauvegarder'; }

  if (!res || !res.success) {
    afficherMsg('fournisseurs', res?.message || 'Erreur sauvegarde.', 'erreur');
    return;
  }

  fermerModalFournisseur();
  afficherMsg('fournisseurs', `✅ Fournisseur "${nom}" sauvegardé.`);
  await afficherFournisseurs();
}

// ─── SUPPRIMER DEPUIS MODAL ───
function supprimerFournisseurDepuisModal() {
  const four_id = document.getElementById('modal-four-id')?.value?.trim();
  if (!four_id) return;
  fermerModalFournisseur();
  supprimerFournisseur(four_id);
}

// ─── SUPPRIMER ───
async function supprimerFournisseur(four_id) {
  const f = fournisseursDonnees.find(f => f.four_id === four_id);
  confirmerAction(`Supprimer le fournisseur "${f?.nom || four_id}" ?`, async () => {
    const res = await appelAPIPost('deleteFournisseur', { four_id });
    if (res && res.success) {
      afficherMsg('fournisseurs', '✅ Fournisseur supprimé.');
      await afficherFournisseurs();
    } else {
      afficherMsg('fournisseurs', res?.message || 'Erreur suppression.', 'erreur');
    }
  });
}

// ─── CRÉER DEPUIS FACTURE ───
// Appelé par efCreerFacture() quand four_id === '__nouveau__'
async function efSauvegarderNouveauFournisseur(nom) {
  const four_id = 'FOUR-' + Date.now();
  const code    = nom.trim().slice(0, 4).toUpperCase();
  const res     = await appelAPIPost('saveFournisseur', { four_id, nom, code, site_web: '', notes: '' });
  if (res && res.success) {
    const nouveau = { four_id, nom, code, site_web: '', notes: '' };
    ef.fournisseurs.push(nouveau);
    fournisseursDonnees.push(nouveau);
    return { four_id, code };
  }
  return { four_id, code: '' };
}

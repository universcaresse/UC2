/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-comptabilite.js
   Plan comptable : voir les comptes groupés par section, ajouter une section ou un compte.
   ═══════════════════════════════════════ */

// Lancé au clic sur « plan comptable » (voir admin.js → afficherSection)
async function chargerPlanComptable() {
  const loading = document.getElementById('loading-plan-comptable');
  const contenu = document.getElementById('contenu-plan-comptable');
  if (loading) loading.style.display = '';
  if (contenu) contenu.innerHTML = '';

  const res = await appelAPI('getPlanComptable');
  if (loading) loading.style.display = 'none';

  if (!res || !res.success) {
    afficherMsg('plan-comptable', 'Erreur : ' + ((res && res.message) || 'chargement impossible'), 'erreur');
    return;
  }

  const sections = (res.sections || []).slice().sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
  const comptes  = (res.comptes || []);
  pcRendre(sections, comptes);
}

// Nom de la classe selon le premier chiffre du numéro
function pcNomClasse(numero) {
  const c = String(numero || '').charAt(0);
  if (c === '1') return 'Actif';
  if (c === '2') return 'Passif';
  if (c === '3') return 'Avoir';
  if (c === '4') return 'Revenus';
  if (c === '5') return 'Dépenses';
  return 'Autre';
}

function pcRendre(sections, comptes) {
  const contenu = document.getElementById('contenu-plan-comptable');
  if (!contenu) return;

  const optionsSections = sections.map(s =>
    `<option value="${s.numero}">${s.numero} — ${s.nom}</option>`
  ).join('');

  let html = `
    <div class="form-actions" style="gap:32px;align-items:flex-start;flex-wrap:wrap;margin-bottom:32px">
      <div style="min-width:260px">
        <div class="page-entete-eyebrow" style="margin-bottom:8px">Ajouter une section</div>
        <div class="form-groupe">
          <label class="form-label">Numéro</label>
          <input type="text" class="form-ctrl" id="pc-sec-numero" placeholder="ex. 1100">
        </div>
        <div class="form-groupe">
          <label class="form-label">Nom</label>
          <input type="text" class="form-ctrl" id="pc-sec-nom" placeholder="ex. Encaisse">
        </div>
        <button class="bouton" onclick="pcAjouterSection()">Ajouter la section</button>
      </div>
      <div style="min-width:260px">
        <div class="page-entete-eyebrow" style="margin-bottom:8px">Ajouter un compte</div>
        <div class="form-groupe">
          <label class="form-label">Section</label>
          <select class="form-ctrl" id="pc-cpt-section">${optionsSections}</select>
        </div>
        <div class="form-groupe">
          <label class="form-label">Numéro</label>
          <input type="text" class="form-ctrl" id="pc-cpt-numero" placeholder="ex. 1105">
        </div>
        <div class="form-groupe">
          <label class="form-label">Nom</label>
          <input type="text" class="form-ctrl" id="pc-cpt-nom" placeholder="ex. Fond de caisse">
        </div>
        <button class="bouton" onclick="pcAjouterCompte()">Ajouter le compte</button>
      </div>
    </div>
  `;

  if (!sections.length) {
    html += `<div class="vide"><div class="vide-titre">Aucune section</div><div class="vide-desc">Ajoutez une section pour commencer.</div></div>`;
  } else {
    let classeActuelle = '';
    sections.forEach(s => {
      const classe = pcNomClasse(s.numero);
      if (classe !== classeActuelle) {
        classeActuelle = classe;
        html += `<h2 style="font-family:Georgia,serif;color:var(--primary);border-bottom:2px solid var(--primary);padding-bottom:6px;margin:28px 0 12px">${String(s.numero).charAt(0)}000 — ${classe}</h2>`;
      }
      html += `<div style="margin:0 0 18px">
        <div style="font-family:'DM Sans',sans-serif;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--accent);margin-bottom:6px">${s.numero} · ${s.nom}</div>`;
      const dedans = comptes
        .filter(c => String(c.section) === String(s.numero))
        .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
      if (!dedans.length) {
        html += `<div style="color:var(--beige-fonce);font-style:italic;padding:2px 0 2px 16px">aucun compte</div>`;
      } else {
        dedans.forEach(c => {
          html += `<div style="padding:3px 0 3px 16px;color:var(--primary)"><span style="color:var(--accent);font-variant-numeric:tabular-nums">${c.numero}</span> &nbsp; ${c.nom}</div>`;
        });
      }
      html += `</div>`;
    });
  }

  contenu.innerHTML = html;
}

// ─── Ajouter une section ───
async function pcAjouterSection() {
  const numero = (document.getElementById('pc-sec-numero').value || '').trim();
  const nom    = (document.getElementById('pc-sec-nom').value || '').trim();
  if (!numero || !nom) {
    afficherMsg('plan-comptable', 'Numéro et nom obligatoires.', 'erreur');
    return;
  }
  const res = await appelAPIPost('ajouterSectionComptable', { numero, nom });
  if (res && res.success) {
    afficherMsg('plan-comptable', 'Section ajoutée.', 'succes');
    chargerPlanComptable();
  } else {
    afficherMsg('plan-comptable', (res && res.message) || 'Erreur.', 'erreur');
  }
}

// ─── Ajouter un compte ───
async function pcAjouterCompte() {
  const section = (document.getElementById('pc-cpt-section').value || '').trim();
  const numero  = (document.getElementById('pc-cpt-numero').value || '').trim();
  const nom     = (document.getElementById('pc-cpt-nom').value || '').trim();
  if (!section || !numero || !nom) {
    afficherMsg('plan-comptable', 'Section, numéro et nom obligatoires.', 'erreur');
    return;
  }
  const res = await appelAPIPost('ajouterCompteComptable', { numero, nom, section });
  if (res && res.success) {
    afficherMsg('plan-comptable', 'Compte ajouté.', 'succes');
    chargerPlanComptable();
  } else {
    afficherMsg('plan-comptable', (res && res.message) || 'Erreur.', 'erreur');
  }
}
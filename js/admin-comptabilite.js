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
    <div class="grille">
      <div>
        <div class="section-label">Ajouter une section</div>
        <div class="champ">
          <label class="libelle">Numéro</label>
          <input type="text" class="controle" id="pc-sec-numero" placeholder="ex. 1100">
        </div>
        <div class="champ">
          <label class="libelle">Nom</label>
          <input type="text" class="controle" id="pc-sec-nom" placeholder="ex. Encaisse">
        </div>
        <div class="champ">
          <button class="boutons boutons-vert" onclick="pcAjouterSection()">Ajouter la section</button>
        </div>
      </div>
      <div>
        <div class="section-label">Ajouter un compte</div>
        <div class="champ">
          <label class="libelle">Section</label>
          <select class="controle" id="pc-cpt-section">${optionsSections}</select>
        </div>
        <div class="champ">
          <label class="libelle">Numéro</label>
          <input type="text" class="controle" id="pc-cpt-numero" placeholder="ex. 1105">
        </div>
        <div class="champ">
          <label class="libelle">Nom</label>
          <input type="text" class="controle" id="pc-cpt-nom" placeholder="ex. Fond de caisse">
        </div>
        <div class="champ">
          <button class="boutons boutons-vert" onclick="pcAjouterCompte()">Ajouter le compte</button>
        </div>
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
        html += `<div class="section-label">${String(s.numero).charAt(0)}000 — ${classe}</div>`;
      }
      html += `<div>
        <div class="accroche">${s.numero} · ${s.nom}</div>`;
      const dedans = comptes
        .filter(c => String(c.section) === String(s.numero))
        .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
      if (!dedans.length) {
        html += `<div class="textes-discrets">aucun compte</div>`;
      } else {
        dedans.forEach(c => {
          html += `<div class="valeur"><span class="numero">${c.numero}</span>${c.nom}</div>`;
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
/* UNIVERS CARESSE — admin-redaction.js */

let redContenu  = {};
let redCleActive = null;

// ─── INIT ───
async function redInit() {
  const loading = document.getElementById('red-chargement');
  const layout  = document.getElementById('red-layout');
  if (loading) loading.classList.remove('cache');
  if (layout)  layout.classList.add('cache');

  const res = await appelAPI('getContenu');

  if (loading) loading.classList.add('cache');
  if (!res || !res.success) {
    afficherMsg('redaction', 'Erreur de chargement du contenu.', 'erreur');
    return;
  }
  redContenu = { ...res.contenu };
  redPeupler();
  if (layout) layout.classList.remove('cache');
  redAfficherSections('accueil');
}

// ─── PEUPLER ───
function redPeupler() {
  document.querySelectorAll('#red-apercu [data-key]').forEach(el => {
    const key = el.dataset.key;
    if (el.dataset.type === 'photo') {
      const url = redContenu[key] || '';
      const img = el.querySelector('img.red-photo-img');
      if (img) img.src = url || img.src; // garde l'url hardcodée si vide
    } else if (el.dataset.pct === '1') {
      const n = parseFloat(redContenu[key]);
      el.textContent = isNaN(n) ? '' : Math.round(n * 100) + '%';
    } else {
      el.textContent = redContenu[key] || '';
    }
  });
}

// ─── FILTRES ───
function redAfficherSections(id) {
  document.querySelectorAll('.red-filtre-btn').forEach(b => b.classList.remove('actif'));
  const btn = document.querySelector(`.red-filtre-btn[data-red-section="${id}"]`);
  if (btn) btn.classList.add('actif');

  document.querySelectorAll('.red-section').forEach(s => s.classList.add('cache'));
  const section = document.getElementById('red-s-' + id);
  if (section) section.classList.remove('cache');

  const eduNav = document.getElementById('red-edu-nav');
  if (eduNav) eduNav.style.display = (id === 'educatif') ? 'flex' : 'none';
  if (id === 'educatif') redAfficherEduSection(1);

  document.getElementById('red-apercu').scrollTop = 0;
  redFermerPanneau();
}

function redAfficherEduSection(n) {
  document.querySelectorAll('.red-edu-panel').forEach(p => p.classList.add('cache'));
  const panel = document.getElementById('red-edu-' + n);
  if (panel) panel.classList.remove('cache');

  document.querySelectorAll('.red-edu-btn').forEach(b => b.classList.remove('actif'));
  const btn = document.querySelector(`.red-edu-btn[data-edu="${n}"]`);
  if (btn) btn.classList.add('actif');

  document.getElementById('red-apercu').scrollTop = 0;
  redFermerPanneau();
}

// ─── CLIC SUR ÉLÉMENT ───
function redCliquer(el) {
  document.querySelectorAll('.red-editable, .red-editable-photo').forEach(e => e.classList.remove('red-actif'));
  el.classList.add('red-actif');
  redCleActive = el.dataset.key;

  const label   = el.dataset.label  || el.dataset.key;
  const type    = el.dataset.type === 'photo' ? 'photo' : (el.dataset.fieldtype || 'text');
  const isPct   = el.dataset.pct === '1';
  const val     = isPct
    ? (redContenu[redCleActive] !== undefined ? Math.round(parseFloat(redContenu[redCleActive]) * 100) : '')
    : (redContenu[redCleActive] || '');

  let body = '';
  if (type === 'photo') {
    const url = redContenu[redCleActive] || '';
    body = `
      <div id="red-photo-apercu" style="min-height:80px;background:var(--beige);display:flex;align-items:center;justify-content:center;margin-bottom:10px;overflow:hidden;">
        ${url ? `<img src="${url}" style="max-width:100%;max-height:180px;object-fit:cover;">` : '<span style="color:var(--gris);font-size:0.8rem">Aucune photo</span>'}
      </div>
      <input type="text" class="form-ctrl" id="red-champ" value="${url}" oninput="redMettreAJour()" placeholder="URL de la photo" style="margin-bottom:8px">
      <button class="bouton bouton-vert-pale" style="width:100%;margin-top:4px" onclick="redOuvrirMediatheque()">Choisir dans la médiathèque</button>`;
  } else if (type === 'textarea') {
    body = `<textarea class="form-ctrl" id="red-champ" rows="7" oninput="redMettreAJour()" style="width:100%">${val}</textarea>`;
  } else {
    const safeVal = String(val).replace(/"/g, '&quot;');
    body = `
      ${isPct ? '<div class="form-label" style="margin-bottom:6px">Valeur en % — ex: 5 pour 5%</div>' : ''}
      <input type="text" class="form-ctrl" id="red-champ" value="${safeVal}" oninput="redMettreAJour()" style="width:100%">`;
  }

  const panneau = document.getElementById('red-panneau');
  panneau.innerHTML = `
    <div class="red-panneau-header">
      <div class="red-panneau-label">${label}</div>
      <button style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--gris);line-height:1" onclick="redFermerPanneau()">✕</button>
    </div>
    <div class="red-panneau-body">${body}</div>`;
  panneau.classList.add('ouvert');

  const champ = document.getElementById('red-champ');
  if (champ && type !== 'photo') champ.focus();
}

// ─── MISE À JOUR EN DIRECT ───
function redMettreAJour() {
  if (!redCleActive) return;
  const champ = document.getElementById('red-champ');
  if (!champ) return;
  const val   = champ.value;
  const el    = document.querySelector('#red-apercu .red-actif');
  const isPct = el && el.dataset.pct === '1';
  const isPhoto = el && el.dataset.type === 'photo';

  if (isPct) {
    const n = parseFloat(val);
    redContenu[redCleActive] = isNaN(n) ? 0 : n / 100;
    if (el) el.textContent = isNaN(n) ? '' : Math.round(n) + '%';
  } else if (isPhoto) {
    redContenu[redCleActive] = val;
    const img = el && el.querySelector('img.red-photo-img');
    if (img) img.src = val;
    const apercu = document.getElementById('red-photo-apercu');
    if (apercu) apercu.innerHTML = val
      ? `<img src="${val}" style="max-width:100%;max-height:180px;object-fit:cover;">`
      : '<span style="color:var(--gris);font-size:0.8rem">Aucune photo</span>';
  } else {
    redContenu[redCleActive] = val;
    document.querySelectorAll(`#red-apercu [data-key="${redCleActive}"]`).forEach(e => {
      e.textContent = val;
    });
  }
}

// ─── FERMER PANNEAU ───
function redFermerPanneau() {
  const panneau = document.getElementById('red-panneau');
  if (panneau) {
    panneau.classList.remove('ouvert');
    panneau.innerHTML = `<div class="red-panneau-vide"><div style="font-size:2rem;margin-bottom:12px">←</div>Cliquez sur un élément<br>dans l'aperçu pour le modifier</div>`;
  }
  document.querySelectorAll('.red-editable, .red-editable-photo').forEach(e => e.classList.remove('red-actif'));
  redCleActive = null;
}

// ─── MÉDIATHÈQUE ───
function redOuvrirMediatheque() {
  const champCle = redCleActive;
  const champHidden = document.getElementById('red-med-url');
  if (!champHidden) return;
  champHidden.value = redContenu[champCle] || '';
  ouvrirMediatheque('red-med-url', 'red-med-preview', 'Photo');

  // Polling : détecte la fermeture du modal
  const timer = setInterval(() => {
    const modal = document.getElementById('modal-mediatheque');
    if (!modal || !modal.classList.contains('ouvert')) {
      clearInterval(timer);
      const url = document.getElementById('red-med-url')?.value || '';
      if (url !== (redContenu[champCle] || '')) {
        redContenu[champCle] = url;
        // Mise à jour panneau
        const champInput = document.getElementById('red-champ');
        if (champInput) champInput.value = url;
        const apercuPanel = document.getElementById('red-photo-apercu');
        if (apercuPanel) apercuPanel.innerHTML = url
          ? `<img src="${url}" style="max-width:100%;max-height:180px;object-fit:cover;">`
          : '<span style="color:var(--gris);font-size:0.8rem">Aucune photo</span>';
        // Mise à jour aperçu preview
        const elActif = document.querySelector('#red-apercu .red-actif');
        if (elActif) {
          const img = elActif.querySelector('img.red-photo-img');
          if (img) img.src = url;
        }
      }
    }
  }, 250);
}

// ─── SAUVEGARDER ───
async function redSauvegarder() {
  afficherChargement();
  const res = await appelAPIPost('updateContenu', { contenu: redContenu });
  cacherChargement();
  afficherMsg(
    'redaction',
    res && res.success ? 'Contenu sauvegardé.' : 'Erreur lors de la sauvegarde.',
    res && res.success ? 'succes' : 'erreur'
  );
}

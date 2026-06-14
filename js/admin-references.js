// ========================================
// ADMIN — RÉFÉRENCES
// ========================================

var refDonnees = [];
var refActifId = null;
var _refModalCallback = null;

// ─── MODALE SAISIE ───

function refOuvrirModalSaisie(titre, label, valeurDefaut, callback) {
  document.getElementById('modal-ref-saisie-titre').textContent = titre;
  document.getElementById('modal-ref-saisie-label').textContent = label;
  const input = document.getElementById('modal-ref-saisie-valeur');
  input.value = valeurDefaut || '';
  _refModalCallback = callback;
  document.getElementById('modal-ref-saisie').classList.add('ouvert');
  setTimeout(() => input.focus(), 50);
}

function refFermerModalSaisie() {
  document.getElementById('modal-ref-saisie').classList.remove('ouvert');
  _refModalCallback = null;
}

function refConfirmerModalSaisie() {
  const val = document.getElementById('modal-ref-saisie-valeur').value.trim();
  if (!val) return;
  const cb = _refModalCallback;
  refFermerModalSaisie();
  if (cb) cb(val);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('modal-ref-saisie')?.classList.contains('ouvert')) {
    refConfirmerModalSaisie();
  }
});

// ─── CHARGER ───

async function chargerReferences() {
  const loading = document.getElementById('loading-references');
  const contenu = document.getElementById('contenu-references');
  if (loading) loading.classList.remove('cache');
  if (contenu) contenu.classList.add('cache');

  const res = await appelAPI('getReferences');

  if (loading) loading.classList.add('cache');
  if (!res || !res.success) {
    afficherMsg('references', 'Erreur de chargement.', 'erreur');
    return;
  }

  refDonnees = res.items || [];
  if (contenu) contenu.classList.remove('cache');
  refRendreListe();

  if (refDonnees.length > 0) {
    refSelectionner(refDonnees[0].ref_id);
  } else {
    refRendreDetail(null);
  }
}

// ─── LISTE GAUCHE ───

function refRendreListe() {
  const liste = document.getElementById('ref-liste');
  if (!liste) return;

  if (!refDonnees.length) {
    liste.innerHTML = '<div class="vide-desc" style="padding:16px">Aucune référence</div>';
    return;
  }

  liste.innerHTML = refDonnees.map(r =>
    '<div class="item' + (r.ref_id === refActifId ? ' item-actif' : '') + '" onclick="refSelectionner(\'' + r.ref_id + '\')" style="cursor:pointer;margin-bottom:4px">' +
      '<div><span class="item-nom">' + (r.nom || '—') + '</span>' +
      (r.lien ? '<div class="item-description">' + r.lien + '</div>' : '') +
      '</div>' +
    '</div>'
  ).join('');
}

function refSelectionner(ref_id) {
  refActifId = ref_id;
  refRendreListe();
  const ref = refDonnees.find(r => r.ref_id === ref_id);
  refRendreDetail(ref);
}

// ─── DÉTAIL DROITE ───

function refRendreDetail(ref) {
  const zone = document.getElementById('ref-detail');
  if (!zone) return;

  if (!ref) {
    zone.innerHTML = '<div class="vide-desc" style="padding:24px">Sélectionnez une référence ou ajoutez-en une.</div>';
    return;
  }

  const etapesHtml = (ref.etapes || []).map((e, i) => {
    const ei = i;
    return '<div class="rangeeitem" data-index="' + ei + '">' +
      '<span class="rangeeitem-meta" style="min-width:24px">' + (ei + 1) + '</span>' +
      '<div class="rangeeitem-info"><div class="rangeeitem-titre">' + e + '</div></div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="boutons boutons-contour boutons-petit" onclick="refMonterEtape(' + ei + ')" ' + (ei === 0 ? 'disabled' : '') + '>↑</button>' +
        '<button class="boutons boutons-contour boutons-petit" onclick="refDescendreEtape(' + ei + ')" ' + (ei === (ref.etapes.length - 1) ? 'disabled' : '') + '>↓</button>' +
        '<button class="boutons boutons-contour boutons-petit" onclick="refModifierEtape(' + ei + ')">Modifier</button>' +
        '<button class="boutons boutons-rouge boutons-petit" onclick="refSupprimerEtape(' + ei + ')">✕</button>' +
      '</div>' +
    '</div>';
  }).join('');

  zone.innerHTML =
    '<div class="bandeau" style="margin-bottom:12px">' +
      '<div class="entete">' +
        '<span class="titre" id="ref-detail-nom">' + (ref.nom || '—') + '</span>' +
        (ref.lien ? '<a href="' + ref.lien + '" target="_blank" class="slogan">' + ref.lien + '</a>' : '<span class="slogan">Aucun lien</span>') +
      '</div>' +
      '<div class="actions">' +
        '<button class="boutons boutons-contour boutons-petit" onclick="refModifierNom()">Renommer</button>' +
        '<button class="boutons boutons-contour boutons-petit" onclick="refModifierLien()">Modifier le lien</button>' +
        '<button class="boutons boutons-rouge boutons-petit" onclick="refSupprimerOutil()">Supprimer</button>' +
      '</div>' +
    '</div>' +
    '<div class="section-label">Étapes</div>' +
    '<div id="ref-etapes-liste">' + (etapesHtml || '<div class="vide-desc">Aucune étape</div>') + '</div>' +
    '<div style="margin-top:12px">' +
      '<button class="boutons boutons-contour" onclick="refAjouterEtape()">+ Ajouter une étape</button>' +
    '</div>';
}

// ─── MODIFIER NOM / LIEN ───

function refModifierNom() {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  refOuvrirModalSaisie('Renommer', 'Nom de l\'outil', ref.nom, val => {
    ref.nom = val;
    refRendreListe();
    refRendreDetail(ref);
  });
}

function refModifierLien() {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  refOuvrirModalSaisie('Modifier le lien', 'URL', ref.lien, val => {
    ref.lien = val;
    refRendreDetail(ref);
  });
}

// ─── ÉTAPES ───

function refAjouterEtape() {
  refOuvrirModalSaisie('Nouvelle étape', 'Texte de l\'étape', '', val => {
    const ref = refDonnees.find(r => r.ref_id === refActifId);
    if (!ref) return;
    ref.etapes = ref.etapes || [];
    ref.etapes.push(val);
    refRendreDetail(ref);
    refSauvegarder();
  });
}

function refModifierEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  refOuvrirModalSaisie('Modifier l\'étape', 'Texte', ref.etapes[index], val => {
    ref.etapes[index] = val;
    refRendreDetail(ref);
    refSauvegarder();
  });
}

function refSupprimerEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  ref.etapes.splice(index, 1);
  refRendreDetail(ref);
  refSauvegarder();
}

function refMonterEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref || index === 0) return;
  [ref.etapes[index - 1], ref.etapes[index]] = [ref.etapes[index], ref.etapes[index - 1]];
  refRendreDetail(ref);
  refSauvegarder();
}

function refDescendreEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref || index >= ref.etapes.length - 1) return;
  [ref.etapes[index + 1], ref.etapes[index]] = [ref.etapes[index], ref.etapes[index + 1]];
  refRendreDetail(ref);
  refSauvegarder();
}

// ─── AJOUTER UN OUTIL ───

function refAjouterOutil() {
  document.getElementById('modal-ref-saisie-lien-groupe').style.display = '';
  refOuvrirModalSaisie('Nouvel outil', 'Nom de l\'outil', '', val => {
    const lien = document.getElementById('modal-ref-saisie-lien').value.trim();
    document.getElementById('modal-ref-saisie-lien').value = '';
    document.getElementById('modal-ref-saisie-lien-groupe').style.display = 'none';
    const ref_id = 'REF-' + Date.now();
    const nouvel = { ref_id, nom: val, lien, etapes: [] };
    refDonnees.push(nouvel);
    refRendreListe();
    refSelectionner(ref_id);
    refSauvegarder();
  });
}

// ─── SUPPRIMER UN OUTIL ───

function refSupprimerOutil() {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  confirmerAction('Supprimer « ' + ref.nom + ' » ?', async () => {
    refDonnees = refDonnees.filter(r => r.ref_id !== refActifId);
    refActifId = refDonnees.length ? refDonnees[0].ref_id : null;
    refRendreListe();
    refRendreDetail(refDonnees.find(r => r.ref_id === refActifId) || null);
    await refSauvegarder();
  });
}

// ─── SAUVEGARDER ───

async function refSauvegarder() {
  afficherChargement();
  const payload = { action: 'saveReferences', items: refDonnees };
  const res = await appelAPIPost('saveReferences', { items: refDonnees });
  cacherChargement();
  if (res && res.success) {
    afficherMsg('references', 'Références sauvegardées.', 'succes');
  } else {
    afficherMsg('references', 'Erreur : ' + (res?.message || 'inconnue'), 'erreur');
  }
}

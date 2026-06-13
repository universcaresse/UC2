// ========================================
// ADMIN — RÉFÉRENCES
// ========================================

var refDonnees = [];
var refActifId = null;

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
    '<button class="ref-liste-item' + (r.ref_id === refActifId ? ' actif' : '') + '" onclick="refSelectionner(\'' + r.ref_id + '\')">' +
      '<span class="ref-liste-nom">' + (r.nom || '—') + '</span>' +
    '</button>'
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

  const etapesHtml = (ref.etapes || []).map((e, i) =>
    '<div class="ref-etape" data-index="' + i + '">' +
      '<span class="ref-etape-num">' + (i + 1) + '</span>' +
      '<span class="ref-etape-texte">' + e + '</span>' +
      '<div class="ref-etape-actions">' +
        '<button class="bouton bouton-petit bouton-contour" onclick="refMonterEtape(' + i + ')" ' + (i === 0 ? 'disabled' : '') + '>↑</button>' +
        '<button class="bouton bouton-petit bouton-contour" onclick="refDescendreEtape(' + i + ')" ' + (i === (ref.etapes.length - 1) ? 'disabled' : '') + '>↓</button>' +
        '<button class="bouton bouton-petit bouton-contour" onclick="refModifierEtape(' + i + ')">Modifier</button>' +
        '<button class="bouton bouton-petit bouton-rouge" onclick="refSupprimerEtape(' + i + ')">✕</button>' +
      '</div>' +
    '</div>'
  ).join('');

  zone.innerHTML =
    '<div class="ref-detail-entete">' +
      '<div class="form-groupe">' +
        '<label class="form-label">Nom</label>' +
        '<input class="form-ctrl" id="ref-nom" value="' + (ref.nom || '') + '" oninput="refMettreAJour()">' +
      '</div>' +
      '<div class="form-groupe">' +
        '<label class="form-label">Lien</label>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input class="form-ctrl" id="ref-lien" value="' + (ref.lien || '') + '" oninput="refMettreAJour()">' +
          '<a href="' + (ref.lien || '#') + '" target="_blank" class="bouton bouton-contour bouton-petit">Ouvrir</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="ref-etapes-titre">Étapes</div>' +
    '<div id="ref-etapes-liste">' + (etapesHtml || '<div class="vide-desc" style="padding:8px">Aucune étape</div>') + '</div>' +
    '<div style="margin-top:12px;display:flex;gap:8px">' +
      '<button class="bouton bouton-contour" onclick="refAjouterEtape()">+ Ajouter une étape</button>' +
      '<button class="bouton bouton-rouge" onclick="refSupprimerOutil()">Supprimer cet outil</button>' +
    '</div>';
}

// ─── MODIFICATIONS EN DIRECT ───

function refMettreAJour() {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  ref.nom  = document.getElementById('ref-nom')?.value  || '';
  ref.lien = document.getElementById('ref-lien')?.value || '';
  refRendreListe();
}

// ─── ÉTAPES ───

function refAjouterEtape() {
  const texte = prompt('Texte de la nouvelle étape :');
  if (!texte) return;
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  ref.etapes = ref.etapes || [];
  ref.etapes.push(texte.trim());
  refRendreDetail(ref);
}

function refModifierEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  const texte = prompt('Modifier l\'étape :', ref.etapes[index]);
  if (texte === null) return;
  ref.etapes[index] = texte.trim();
  refRendreDetail(ref);
}

function refSupprimerEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref) return;
  ref.etapes.splice(index, 1);
  refRendreDetail(ref);
}

function refMonterEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref || index === 0) return;
  [ref.etapes[index - 1], ref.etapes[index]] = [ref.etapes[index], ref.etapes[index - 1]];
  refRendreDetail(ref);
}

function refDescendreEtape(index) {
  const ref = refDonnees.find(r => r.ref_id === refActifId);
  if (!ref || index >= ref.etapes.length - 1) return;
  [ref.etapes[index + 1], ref.etapes[index]] = [ref.etapes[index], ref.etapes[index + 1]];
  refRendreDetail(ref);
}

// ─── AJOUTER UN OUTIL ───

function refAjouterOutil() {
  const nom = prompt('Nom du nouvel outil :');
  if (!nom) return;
  const ref_id = 'REF-' + Date.now();
  refDonnees.push({ ref_id, nom: nom.trim(), lien: '', etapes: [] });
  refSelectionner(ref_id);
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
  const res = await appelAPIPost('saveReferences', { items: refDonnees });
  cacherChargement();
  if (res && res.success) {
    afficherMsg('references', 'Références sauvegardées.', 'succes');
  } else {
    afficherMsg('references', 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-journal.js
   Journal général : saisie manuelle d'écritures (plusieurs lignes débit/crédit,
   équilibre en direct) + affichage du journal, annulation d'une écriture manuelle.
   Modèles récurrents : partie 2 (à venir).
   ═══════════════════════════════════════ */

var jgComptes       = []; // [{ numero, nom }]
var jgModeles       = []; // [{ modele_id, nom, rythme, prochaine_date, lignes }]
var jgModeleEnCours = null; // modele_id quand la saisie vient d'un modèle

// ═══════════════════════════════════════
// CHARGEMENT DE LA PAGE
// ═══════════════════════════════════════
async function chargerJournalGeneral() {
  const loading = document.getElementById('loading-journal-general');
  if (loading) loading.style.display = '';

  const [resPlan, resJournal, resModeles] = await Promise.all([
    appelAPI('getPlanComptable'),
    appelAPI('getJournal'),
    appelAPI('getModeles')
  ]);

  jgComptes = (resPlan && resPlan.success) ? (resPlan.comptes || []) : [];

  // Réinitialiser la saisie
  jgModeleEnCours = null;
  jgFermerSaveModele();
  const champDate = document.getElementById('jg-date');
  if (champDate && !champDate.value) champDate.value = jgAujourdhui();
  document.getElementById('jg-libelle').value = '';
  jgReinitialiserLignes();

  if (loading) loading.style.display = 'none';

  jgAfficherModeles((resModeles && resModeles.success) ? (resModeles.items || []) : []);

  if (!resJournal || !resJournal.success) {
    afficherMsg('journal-general', 'Erreur de chargement du journal.', 'erreur');
    document.getElementById('jg-journal').innerHTML = '';
    return;
  }
  jgAfficherJournal(resJournal.ecritures || []);
}

// Recharge le journal et les modèles après un enregistrement
async function jgRechargerListes() {
  const [resJournal, resModeles] = await Promise.all([
    appelAPI('getJournal'),
    appelAPI('getModeles')
  ]);
  if (resJournal && resJournal.success) jgAfficherJournal(resJournal.ecritures || []);
  jgAfficherModeles((resModeles && resModeles.success) ? (resModeles.items || []) : []);
}

function jgAujourdhui() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + j;
}

// ═══════════════════════════════════════
// SAISIE — LIGNES DÉBIT / CRÉDIT
// ═══════════════════════════════════════
function jgOptionsComptes(selected) {
  let html = '<option value="">— Compte —</option>';
  jgComptes
    .slice()
    .sort((a, b) => String(a.numero).localeCompare(String(b.numero)))
    .forEach(c => {
      const sel = String(c.numero) === String(selected) ? ' selected' : '';
      html += '<option value="' + echapperHtml(String(c.numero)) + '"' + sel + '>' + echapperHtml(String(c.numero) + ' — ' + (c.nom || '')) + '</option>';
    });
  return html;
}

// compte / cote / montant : optionnels, servent à pré-remplir depuis un modèle
function jgLigneHtml(compte, cote, montant) {
  const m = (montant && parseFloat(montant) > 0) ? parseFloat(montant).toFixed(2).replace('.', ',') : '';
  const vDebit  = (cote === 'debit')  ? m : '';
  const vCredit = (cote === 'credit') ? m : '';
  return ''
    + '<div class="jg-ligne" style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">'
    +   '<select class="form-ctrl jg-compte" style="flex:1;min-width:170px" onchange="jgRecalculerBalance()">' + jgOptionsComptes(compte || '') + '</select>'
    +   '<input type="text" inputmode="decimal" class="form-ctrl jg-debit" style="max-width:120px" placeholder="Débit" value="' + vDebit + '" oninput="jgSaisieMontant(this, \'debit\')">'
    +   '<input type="text" inputmode="decimal" class="form-ctrl jg-credit" style="max-width:120px" placeholder="Crédit" value="' + vCredit + '" oninput="jgSaisieMontant(this, \'credit\')">'
    +   '<button class="bouton bouton-petit bouton-rouge" onclick="jgSupprimerLigne(this)" title="Retirer la ligne">✕</button>'
    + '</div>';
}

function jgReinitialiserLignes() {
  // Deux lignes vides au départ (un débit, un crédit)
  document.getElementById('jg-lignes').innerHTML = jgLigneHtml() + jgLigneHtml();
  jgRecalculerBalance();
}

function jgAjouterLigne() {
  document.getElementById('jg-lignes').insertAdjacentHTML('beforeend', jgLigneHtml());
}

function jgSupprimerLigne(btn) {
  const ligne = btn.closest('.jg-ligne');
  const lignes = document.querySelectorAll('#jg-lignes .jg-ligne');
  if (lignes.length <= 2) {
    // Ne pas descendre sous 2 lignes : on vide plutôt
    if (ligne) {
      ligne.querySelector('.jg-compte').value = '';
      ligne.querySelector('.jg-debit').value  = '';
      ligne.querySelector('.jg-credit').value = '';
    }
  } else if (ligne) {
    ligne.remove();
  }
  jgRecalculerBalance();
}

// Une ligne = un seul côté : saisir au débit vide le crédit, et l'inverse.
function jgSaisieMontant(input, cote) {
  const ligne = input.closest('.jg-ligne');
  if (input.value) {
    const autre = ligne.querySelector(cote === 'debit' ? '.jg-credit' : '.jg-debit');
    if (autre) autre.value = '';
  }
  jgRecalculerBalance();
}

function jgMontant(v) {
  return parseFloat(String(v || '').replace(',', '.')) || 0;
}

function jgRecalculerBalance() {
  let totalDebit = 0, totalCredit = 0;
  document.querySelectorAll('#jg-lignes .jg-ligne').forEach(l => {
    totalDebit  += jgMontant(l.querySelector('.jg-debit').value);
    totalCredit += jgMontant(l.querySelector('.jg-credit').value);
  });
  totalDebit  = Math.round(totalDebit * 100) / 100;
  totalCredit = Math.round(totalCredit * 100) / 100;
  const ecart = Math.round((totalDebit - totalCredit) * 100) / 100;

  const zone = document.getElementById('jg-balance');
  const balance = ecart === 0 && totalDebit > 0;
  if (zone) {
    let txt = 'Débits ' + formaterPrix(totalDebit) + ' · Crédits ' + formaterPrix(totalCredit);
    if (balance)            txt += '  ·  ✅ balancé';
    else if (totalDebit || totalCredit) txt += '  ·  écart ' + formaterPrix(Math.abs(ecart));
    zone.textContent = txt;
    zone.style.color = balance ? 'var(--vert, #4a7)' : 'var(--rouge)';
  }

  const btn = document.getElementById('jg-enregistrer');
  if (btn) btn.disabled = !balance;
}

// ═══════════════════════════════════════
// ENREGISTRER L'ÉCRITURE
// ═══════════════════════════════════════
async function jgEnregistrer() {
  const date    = document.getElementById('jg-date').value;
  const libelle = document.getElementById('jg-libelle').value.trim();

  const lignes = [];
  document.querySelectorAll('#jg-lignes .jg-ligne').forEach(l => {
    const compte = l.querySelector('.jg-compte').value;
    const debit  = jgMontant(l.querySelector('.jg-debit').value);
    const credit = jgMontant(l.querySelector('.jg-credit').value);
    if (compte && (debit > 0 || credit > 0)) lignes.push({ compte, debit, credit });
  });

  if (lignes.length < 2) {
    afficherMsg('journal-general', 'Il faut au moins deux lignes avec un compte et un montant.', 'erreur');
    return;
  }
  if (lignes.some(l => !l.compte)) {
    afficherMsg('journal-general', 'Chaque ligne avec un montant doit avoir un compte.', 'erreur');
    return;
  }
  if (!date) {
    afficherMsg('journal-general', 'Choisir une date.', 'erreur');
    return;
  }

  // Si la saisie vient d'un modèle : on passe par la porte qui retient les montants et avance la date
  const res = jgModeleEnCours
    ? await appelAPIPost('enregistrerDepuisModele', { modele_id: jgModeleEnCours, date, libelle, lignes })
    : await appelAPIPost('enregistrerEcritureManuelle', { date, libelle, lignes });

  if (!res || !res.success) {
    afficherMsg('journal-general', (res && res.message) ? res.message : 'Enregistrement refusé.', 'erreur');
    return;
  }

  afficherMsg('journal-general', '✅ Écriture ' + res.reference + ' enregistrée.');
  jgModeleEnCours = null;
  document.getElementById('jg-libelle').value = '';
  jgReinitialiserLignes();
  jgFermerSaveModele();

  await jgRechargerListes();
}

// ═══════════════════════════════════════
// AFFICHAGE DU JOURNAL
// ═══════════════════════════════════════
function jgNomCompte(numero) {
  const c = jgComptes.find(x => String(x.numero) === String(numero));
  return c ? (String(numero) + ' — ' + (c.nom || '')) : String(numero);
}

function jgAfficherJournal(ecritures) {
  const zone = document.getElementById('jg-journal');
  if (!zone) return;
  if (!ecritures.length) {
    zone.innerHTML = '<div class="texte-secondaire">Aucune écriture pour l\'instant.</div>';
    return;
  }

  zone.innerHTML = ecritures.map(e => {
    const lignesHtml = (e.lignes || []).map(l => {
      const montant = l.debit > 0
        ? '<span>Débit ' + formaterPrix(l.debit) + '</span>'
        : '<span>Crédit ' + formaterPrix(l.credit) + '</span>';
      return '<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;font-size:0.9rem">'
        + '<span>' + echapperHtml(jgNomCompte(l.compte)) + '</span>' + montant + '</div>';
    }).join('');

    const bouton = e.annulable
      ? '<button class="bouton bouton-petit bouton-contour" onclick="jgAnnuler(\'' + echapperHtml(e.reference) + '\')">Annuler</button>'
      : '';

    return ''
      + '<div style="border-bottom:1px solid var(--beige);padding:12px 0">'
      +   '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:6px">'
      +     '<div><strong>#' + echapperHtml(e.no_ecriture) + '</strong> · ' + echapperHtml(e.date) + ' · ' + echapperHtml(e.libelle)
      +       (e.reference ? ' <span class="texte-secondaire">(' + echapperHtml(e.reference) + ')</span>' : '') + '</div>'
      +     bouton
      +   '</div>'
      +   lignesHtml
      + '</div>';
  }).join('');
}

// ═══════════════════════════════════════
// MODÈLES RÉCURRENTS
// ═══════════════════════════════════════
function jgRythmeLabel(rythme) {
  if (rythme === 'hebdo')       return 'chaque semaine';
  if (rythme === '2-semaines')  return 'aux 2 semaines';
  if (rythme === 'mensuel')     return 'chaque mois';
  if (rythme === 'trimestriel') return 'chaque trimestre';
  if (rythme === 'annuel')      return 'chaque année';
  return 'sur demande';
}

function jgDateCourte(d) {
  const p = String(d || '').split('-');
  return (p.length === 3) ? (p[2] + '/' + p[1] + '/' + p[0]) : String(d || '');
}

// rang : sert à remonter ce qui presse en haut de la liste
function jgStatutModele(m) {
  if (m.rythme === 'sur-demande' || !m.prochaine_date) {
    return { texte: 'sur demande', couleur: 'var(--gris)', rang: 3 };
  }
  const auj = jgAujourdhui();
  if (m.prochaine_date <  auj) return { texte: 'en retard depuis le ' + jgDateCourte(m.prochaine_date), couleur: 'var(--rouge)', rang: 0 };
  if (m.prochaine_date === auj) return { texte: 'à faire aujourd\'hui', couleur: 'var(--rouge)', rang: 1 };
  return { texte: 'à venir le ' + jgDateCourte(m.prochaine_date), couleur: 'var(--gris)', rang: 2 };
}

function jgAfficherModeles(items) {
  jgModeles = items || [];
  const zone = document.getElementById('jg-modeles');
  if (!zone) return;
  if (!jgModeles.length) {
    zone.innerHTML = '<div class="texte-secondaire">Aucun modèle. Saisis une écriture, puis « Sauvegarder comme modèle ».</div>';
    return;
  }

  const tries = jgModeles.slice().sort((a, b) => {
    const ra = jgStatutModele(a).rang, rb = jgStatutModele(b).rang;
    if (ra !== rb) return ra - rb;
    return (a.nom || '').localeCompare(b.nom || '');
  });

  zone.innerHTML = tries.map(m => {
    const s = jgStatutModele(m);
    return ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--beige);flex-wrap:wrap">'
      +   '<div>'
      +     '<div><strong>' + echapperHtml(m.nom) + '</strong> <span class="texte-secondaire">· ' + jgRythmeLabel(m.rythme) + '</span></div>'
      +     '<div style="font-size:0.85rem;color:' + s.couleur + '">' + s.texte + '</div>'
      +   '</div>'
      +   '<div style="display:flex;gap:6px">'
      +     '<button class="bouton bouton-petit" onclick="jgUtiliserModele(\'' + echapperHtml(m.modele_id) + '\')">Utiliser</button>'
      +     '<button class="bouton bouton-petit bouton-rouge" onclick="jgSupprimerModele(\'' + echapperHtml(m.modele_id) + '\')" title="Supprimer le modèle">✕</button>'
      +   '</div>'
      + '</div>';
  }).join('');
}

// Un clic sur « Utiliser » : les comptes se placent, les derniers montants reviennent, tu ajustes.
function jgUtiliserModele(modele_id) {
  const m = jgModeles.find(x => String(x.modele_id) === String(modele_id));
  if (!m) return;

  jgModeleEnCours = m.modele_id;
  document.getElementById('jg-date').value    = m.prochaine_date || jgAujourdhui();
  document.getElementById('jg-libelle').value = m.nom;
  document.getElementById('jg-lignes').innerHTML =
    (m.lignes || []).map(l => jgLigneHtml(l.compte, l.cote, l.montant)).join('') || (jgLigneHtml() + jgLigneHtml());

  jgRecalculerBalance();
  jgFermerSaveModele();
  afficherMsg('journal-general', 'Modèle « ' + m.nom + ' » chargé — ajuste les montants, puis enregistre.');
  document.getElementById('jg-date').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Lignes de la saisie, vues comme un modèle (compte + côté + montant)
function jgCollecterLignesModele() {
  const lignes = [];
  document.querySelectorAll('#jg-lignes .jg-ligne').forEach(l => {
    const compte = l.querySelector('.jg-compte').value;
    const debit  = jgMontant(l.querySelector('.jg-debit').value);
    const credit = jgMontant(l.querySelector('.jg-credit').value);
    if (!compte) return;
    if (debit > 0)       lignes.push({ compte, cote: 'debit',  montant: debit });
    else if (credit > 0) lignes.push({ compte, cote: 'credit', montant: credit });
  });
  return lignes;
}

function jgOuvrirSaveModele() {
  const lignes = jgCollecterLignesModele();
  if (lignes.length < 2) {
    afficherMsg('journal-general', 'Remplis d\'abord au moins deux lignes (compte + montant) avant d\'en faire un modèle.', 'erreur');
    return;
  }
  const zone = document.getElementById('jg-modele-save');
  if (!zone) return;
  const nomPropose = document.getElementById('jg-libelle').value.trim();

  zone.innerHTML = ''
    + '<div class="form-grille">'
    +   '<div class="form-groupe col-demi"><label class="form-label">Nom du modèle</label>'
    +     '<input type="text" class="form-ctrl" id="jg-modele-nom" value="' + echapperHtml(nomPropose) + '" placeholder="Ex. Dépôt Square"></div>'
    +   '<div class="form-groupe col-demi"><label class="form-label">Rythme</label>'
    +     '<select class="form-ctrl" id="jg-modele-rythme" onchange="jgChangerRythmeSave()">'
    +       '<option value="sur-demande">Sur demande (pas de date)</option>'
    +       '<option value="hebdo">Chaque semaine</option>'
    +       '<option value="2-semaines">Aux 2 semaines</option>'
    +       '<option value="mensuel">Chaque mois</option>'
    +       '<option value="trimestriel">Chaque trimestre</option>'
    +       '<option value="annuel">Chaque année</option>'
    +     '</select></div>'
    +   '<div class="form-groupe col-demi cache" id="jg-modele-date-groupe"><label class="form-label">Prochaine date</label>'
    +     '<input type="date" class="form-ctrl" id="jg-modele-date" value="' + jgAujourdhui() + '"></div>'
    + '</div>'
    + '<div class="form-actions">'
    +   '<button class="bouton" onclick="jgConfirmerSaveModele()">Créer le modèle</button>'
    +   '<button class="bouton bouton-contour" onclick="jgFermerSaveModele()">Annuler</button>'
    + '</div>';
  zone.classList.remove('cache');
}

function jgFermerSaveModele() {
  const zone = document.getElementById('jg-modele-save');
  if (zone) { zone.classList.add('cache'); zone.innerHTML = ''; }
}

function jgChangerRythmeSave() {
  const rythme = document.getElementById('jg-modele-rythme').value;
  const groupe = document.getElementById('jg-modele-date-groupe');
  if (groupe) groupe.classList.toggle('cache', rythme === 'sur-demande');
}

async function jgConfirmerSaveModele() {
  const nom    = document.getElementById('jg-modele-nom').value.trim();
  const rythme = document.getElementById('jg-modele-rythme').value;
  const champD = document.getElementById('jg-modele-date');
  const prochaine_date = (rythme === 'sur-demande') ? '' : (champD ? champD.value : '');
  const lignes = jgCollecterLignesModele();

  if (!nom) {
    afficherMsg('journal-general', 'Donner un nom au modèle.', 'erreur');
    return;
  }
  if (rythme !== 'sur-demande' && !prochaine_date) {
    afficherMsg('journal-general', 'Choisir la prochaine date.', 'erreur');
    return;
  }

  const res = await appelAPIPost('saveModele', { nom, rythme, prochaine_date, lignes });
  if (!res || !res.success) {
    afficherMsg('journal-general', (res && res.message) ? res.message : 'Modèle refusé.', 'erreur');
    return;
  }
  afficherMsg('journal-general', '✅ Modèle « ' + nom + ' » créé.');
  jgFermerSaveModele();
  await jgRechargerListes();
}

async function jgSupprimerModele(modele_id) {
  const m = jgModeles.find(x => String(x.modele_id) === String(modele_id));
  if (!confirm('Supprimer le modèle « ' + (m ? m.nom : modele_id) + ' » ? Les écritures déjà passées ne bougent pas.')) return;

  const res = await appelAPIPost('deleteModele', { modele_id });
  if (!res || !res.success) {
    afficherMsg('journal-general', (res && res.message) ? res.message : 'Suppression refusée.', 'erreur');
    return;
  }
  if (jgModeleEnCours === modele_id) jgModeleEnCours = null;
  afficherMsg('journal-general', '✅ Modèle supprimé.');
  await jgRechargerListes();
}

// ═══════════════════════════════════════
// DÉPÔTS SQUARE
// Chargé sur demande (le bouton), pour ne pas ralentir la page à chaque ouverture.
// Rien ne s'inscrit sans un clic : le numéro de dépôt sert de référence, donc pas de doublon.
// ═══════════════════════════════════════
async function jgChargerDepots() {
  const zone = document.getElementById('jg-depots');
  if (!zone) return;
  zone.innerHTML = '<div class="texte-secondaire">Square répond… (quelques secondes)</div>';

  const res = await appelAPIPost('getDepotsSquare');
  if (!res || !res.success) {
    zone.innerHTML = '<div class="texte-secondaire">' +
      echapperHtml((res && res.message) ? res.message : 'Square ne répond pas.') + '</div>';
    return;
  }
  jgAfficherDepots(res.items || []);
}

function jgAfficherDepots(items) {
  const zone = document.getElementById('jg-depots');
  if (!zone) return;
  if (!items.length) {
    zone.innerHTML = '<div class="texte-secondaire">Aucun dépôt à inscrire.</div>';
    return;
  }

  zone.innerHTML = items.map(d => {
    const action = d.deja_inscrit
      ? '<span class="texte-secondaire">déjà inscrit</span>'
      : '<button class="bouton bouton-petit" onclick="jgInscrireDepot(\'' + echapperHtml(d.payout_id) + '\',\'' + echapperHtml(d.date) + '\')">Inscrire l\'écriture</button>';
    return ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--beige);flex-wrap:wrap">'
      +   '<div>'
      +     '<div><strong>' + echapperHtml(jgDateCourte(d.date)) + '</strong> — net déposé ' + formaterPrix(d.net) + '</div>'
      +     '<div class="texte-secondaire" style="font-size:0.85rem">brut ' + formaterPrix(d.brut) + ' · frais ' + formaterPrix(d.frais)
      +       ' · ' + d.nb + ' transaction' + (d.nb > 1 ? 's' : '') + '</div>'
      +   '</div>'
      +   action
      + '</div>';
  }).join('');
}

async function jgInscrireDepot(payout_id, date) {
  const res = await appelAPIPost('inscrireDepotSquare', { payout_id, date });
  if (!res || !res.success) {
    afficherMsg('journal-general', (res && res.message) ? res.message : 'Inscription refusée.', 'erreur');
    return;
  }
  afficherMsg('journal-general', '✅ Dépôt inscrit — banque ' + formaterPrix(res.net) +
    ', frais ' + formaterPrix(res.frais) + ', « à recevoir » vidé de ' + formaterPrix(res.brut) + '.');
  await jgChargerDepots();
  await jgRechargerListes();
}

async function jgAnnuler(reference) {
  if (!confirm('Annuler l\'écriture ' + reference + ' ? Une contre-passation (l\'inverse) sera inscrite — rien n\'est effacé.')) return;

  const res = await appelAPIPost('annulerEcritureManuelle', { reference });
  if (!res || !res.success) {
    afficherMsg('journal-general', (res && res.message) ? res.message : 'Annulation refusée.', 'erreur');
    return;
  }
  afficherMsg('journal-general', '✅ Écriture ' + reference + ' annulée (contre-passée).');

  const resJournal = await appelAPI('getJournal');
  if (resJournal && resJournal.success) jgAfficherJournal(resJournal.ecritures || []);
}

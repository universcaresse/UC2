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
        <div class="actions">
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
        <div class="actions">
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
      html += `<div class="bloc">
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

// ═══════════════════════════════════════
// BILAN ET RÉSULTAT
// ═══════════════════════════════════════
var brDonnees = null;

async function chargerBilanResultats() {
  const loading = document.getElementById('loading-bilan-resultats');
  const contenu = document.getElementById('contenu-bilan-resultats');
  if (loading) loading.style.display = '';
  if (contenu) contenu.innerHTML = '';

  const res = await appelAPI('getBilanResultats');
  if (loading) loading.style.display = 'none';

  if (!res || !res.success) {
    afficherMsg('bilan-resultats', 'Erreur : ' + ((res && res.message) || 'chargement impossible'), 'erreur');
    return;
  }
  brDonnees = res;
  brRendreChoix();
}

// Barre de choix : exercice (année) + période
function brRendreChoix() {
  const contenu = document.getElementById('contenu-bilan-resultats');
  if (!contenu) return;

  const anneeCourante = new Date().getFullYear();
  const annees = new Set([anneeCourante]);
  (brDonnees.ecritures || []).forEach(e => {
    const a = parseInt(String(e.date).slice(0, 4));
    if (a) annees.add(a);
  });
  const options = [...annees].sort().reverse().map(a =>
    `<option value="${a}">${a}</option>`
  ).join('');

  contenu.innerHTML = `
    <div class="grille">
      <div class="champ">
        <label class="libelle">Exercice (fin au 31 décembre)</label>
        <select class="controle" id="br-annee" onchange="brChangerAnnee()">${options}</select>
      </div>
      <div class="champ">
        <label class="libelle">Période — du</label>
        <input type="date" class="controle" id="br-debut" onchange="brAfficher()">
      </div>
      <div class="champ">
        <label class="libelle">au</label>
        <input type="date" class="controle" id="br-fin" onchange="brAfficher()">
      </div>
    </div>
    <div id="br-etats"></div>
  `;
  brChangerAnnee();
}

// Solde d'une ligne selon la classe du compte
// Actif et Dépenses grossissent au débit; Passif, Avoir et Revenus au crédit
function brSens(compte) {
  const c = String(compte).charAt(0);
  return (c === '1' || c === '5') ? 1 : -1;
}

// Calcule tous les chiffres pour l'année et la période choisies
function brCalculer(annee, debut, fin) {
  const debutExercice = annee + '-01-01';
  const soldes = {};      // solde par compte au bilan (à la date de fin)
  const periode = {};     // solde par compte pour l'état des résultats
  let benefAvant = 0;     // revenus - dépenses avant l'exercice → 3015
  let benefExercice = 0;  // revenus - dépenses du 1er janvier à la fin → 3100
  const inconnus = new Set();
  const existants = new Set((brDonnees.comptes || []).map(c => String(c.numero)));

  (brDonnees.ecritures || []).forEach(e => {
    if (!e.date || e.date > fin) return;
    const classe = String(e.compte).charAt(0);
    const mouvement = (e.debit - e.credit) * brSens(e.compte);
    if (!existants.has(String(e.compte))) inconnus.add(String(e.compte));

    if (classe === '4' || classe === '5') {
      const resultat = (classe === '4' ? 1 : -1) * mouvement;
      if (e.date < debutExercice) benefAvant += resultat;
      else benefExercice += resultat;
      if (e.date >= debut) periode[e.compte] = (periode[e.compte] || 0) + mouvement;
    } else {
      soldes[e.compte] = (soldes[e.compte] || 0) + mouvement;
    }
  });

  soldes['3015'] = (soldes['3015'] || 0) + benefAvant;
  soldes['3100'] = (soldes['3100'] || 0) + benefExercice;
  return { soldes, periode, inconnus: [...inconnus] };
}

// Changer l'année remet la période au complet de l'exercice
function brChangerAnnee() {
  const annee = document.getElementById('br-annee').value;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const finExercice = annee + '-12-31';
  document.getElementById('br-debut').value = annee + '-01-01';
  document.getElementById('br-fin').value =
    (String(aujourdhui).slice(0, 4) === String(annee)) ? aujourdhui : finExercice;
  brAfficher();
}

// Dessine une classe (Actif, Passif…) : sections, comptes, sous-totaux, total
function brRendreClasse(chiffre, titre, montants) {
  const sections = (brDonnees.sections || []).slice().sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
  const comptes  = (brDonnees.comptes || []).slice().sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
  const dansClasse = comptes.filter(c => String(c.numero).charAt(0) === chiffre);
  const vus = new Set();
  let totalClasse = 0;

  const ligneCompte = (c, m) =>
    `<div class="rangeeitem"><div class="rangeeitem-info"><div class="rangeeitem-titre"><span class="numero">${c.numero}</span>${c.nom}</div></div><span class="rangeeitem-valeur">${formaterPrix(m)}</span></div>`;

  let html = `<div class="section-label">${titre}</div>`;

  const sectionsPleines = sections.filter(s => String(s.numero).charAt(0) === chiffre && dansClasse.some(c => String(c.section) === String(s.numero)));

  sectionsPleines.forEach(s => {
    const dedans = dansClasse.filter(c => String(c.section) === String(s.numero));
    let sousTotal = 0, lignes = '';
    dedans.forEach(c => {
      vus.add(c.numero);
      const m = montants[c.numero] || 0;
      sousTotal += m;
      lignes += ligneCompte(c, m);
    });
    totalClasse += sousTotal;
    const ligneSousTotal = sectionsPleines.length < 2 ? '' :
      `<div class="lignetotal"><span class="lignetotal-libelle moyen">Sous-total ${s.nom}</span><span>${formaterPrix(sousTotal)}</span></div>`;
    html += `<div class="bloc"><div class="accroche">${s.nom}</div>${lignes}${ligneSousTotal}</div>`;
  });

  const restants = dansClasse.filter(c => !vus.has(c.numero));
  if (restants.length) {
    let lignes = '';
    restants.forEach(c => {
      const m = montants[c.numero] || 0;
      totalClasse += m;
      lignes += ligneCompte(c, m);
    });
    html += `<div class="bloc">${lignes}</div>`;
  }

  html += `<div class="lignetotal"><span class="lignetotal-libelle grand">Total ${titre}</span><span>${formaterPrix(totalClasse)}</span></div>`;
  return { html, total: totalClasse };
}

// Affiche le bilan et l'état des résultats selon les choix
function brAfficher() {
  const zone = document.getElementById('br-etats');
  if (!zone || !brDonnees) return;
  const annee = document.getElementById('br-annee').value;
  const debut = document.getElementById('br-debut').value;
  const fin   = document.getElementById('br-fin').value;
  if (!annee || !debut || !fin) return;

  const r = brCalculer(annee, debut, fin);
  const actif    = brRendreClasse('1', 'Actif', r.soldes);
  const passif   = brRendreClasse('2', 'Passif', r.soldes);
  const avoir    = brRendreClasse('3', 'Avoir', r.soldes);
  const revenus  = brRendreClasse('4', 'Revenus', r.periode);
  const depenses = brRendreClasse('5', 'Dépenses', r.periode);
  const balance  = Math.abs(actif.total - (passif.total + avoir.total)) < 0.005;

  let html = `<div class="titre separateur-haut">Bilan au ${fin}</div>` +
    actif.html + passif.html + avoir.html +
    `<div class="lignetotal"><span class="lignetotal-libelle grand">Actif = Passif + Avoir</span>
     <span>${formaterPrix(actif.total)} / ${formaterPrix(passif.total + avoir.total)} ${balance ? '✅' : '⚠️'}</span></div>`;

  if (r.inconnus.length) {
    html += `<div class="section-label">Comptes inconnus</div>
      <div class="textes-discrets">Des écritures portent un numéro absent du plan : ${r.inconnus.join(', ')}</div>`;
  }

  html += `<div class="titre separateur-haut">État des résultats du ${debut} au ${fin}</div>` +
    revenus.html + depenses.html +
    `<div class="lignetotal"><span class="lignetotal-libelle grand">Bénéfice net de la période</span><span>${formaterPrix(revenus.total - depenses.total)}</span></div>`;

  zone.innerHTML = html;
}
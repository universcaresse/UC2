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

  const [res, resCats, resConfig, resCoh] = await Promise.all([
    appelAPI('getPlanComptable'),
    appelAPI('getCategoriesUC'),
    appelAPI('getConfig'),
    appelAPI('verifierCoherenceComptable')
  ]);
  if (loading) loading.style.display = 'none';

  if (!res || !res.success) {
    afficherMsg('plan-comptable', 'Erreur : ' + ((res && res.message) || 'chargement impossible'), 'erreur');
    return;
  }

  pcRendreAlarme((resCoh && resCoh.success) ? (resCoh.anomalies || []) : null);

  const sections = (res.sections || []).slice().sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
  const comptes  = (res.comptes || []);
  const cats     = (resCats && resCats.success) ? (resCats.items || []) : [];
  const config   = (resConfig && resConfig.success) ? (resConfig.items || []) : [];
  pcRendre(sections, comptes, cats, config);
}

// ─── Alarme de cohérence comptable (branche 4) : montre, ne répare rien ───
function pcRendreAlarme(anomalies) {
  const zone = document.getElementById('alarme-comptable');
  if (!zone) return;
  if (!anomalies || !anomalies.length) { zone.innerHTML = ''; return; }

  let html = '<div style="border:1px solid var(--rouge);border-radius:6px;padding:12px 14px;margin:10px 0;background:rgba(200,60,60,0.06)">'
    + '<div style="font-weight:600;color:var(--rouge);margin-bottom:8px">⚠️ ' + anomalies.length + ' anomalie' + (anomalies.length > 1 ? 's' : '') + ' de cohérence à vérifier</div>'
    + '<ul style="margin:0;padding-left:20px;font-size:0.9rem;line-height:1.6">';
  anomalies.forEach(a => {
    if (a.type === 'sans-ecriture') {
      html += '<li>' + echapperHtml(a.famille) + ' <strong>' + echapperHtml(a.id) + '</strong> — finalisé <strong>sans écriture</strong></li>';
    } else {
      html += '<li>Écriture <strong>' + echapperHtml(a.id) + '</strong> (' + echapperHtml(a.famille) + ') — <strong>sans sa pièce</strong></li>';
    }
  });
  html += '</ul><div style="margin-top:8px;font-size:0.82rem;color:var(--gris)">Rien ne se répare tout seul — à corriger à la main.</div></div>';
  zone.innerHTML = html;
}

// Nom de la classe selon le premier chiffre du numéro
// ═══════════════════════════════════════
// RATTRAPAGE — inscrire les écritures du passé qui manquent
// Deux temps : on REGARDE d'abord, on inscrit seulement après ton accord.
// ═══════════════════════════════════════
async function pcVoirRattrapage() {
  const zone = document.getElementById('rattrapage-resultat');
  if (!zone) return;
  zone.innerHTML = '<div class="texte-secondaire">Je regarde…</div>';

  const res = await appelAPIPost('getRattrapageComptable');
  if (!res || !res.success) {
    zone.innerHTML = '<div class="texte-secondaire">' +
      echapperHtml((res && res.message) ? res.message : 'Impossible de regarder.') + '</div>';
    return;
  }

  const total = res.nb_ventes + res.nb_remboursements;
  if (!total) {
    zone.innerHTML = '<div class="texte-secondaire">✅ Rien ne manque — tout a son écriture.</div>';
    return;
  }

  let html = '<div style="border:1px solid var(--beige);border-radius:6px;padding:12px 14px">'
    + '<div style="font-weight:600;margin-bottom:8px">Ce qui manque au journal</div>'
    + '<ul style="margin:0 0 10px 0;padding-left:20px;line-height:1.7">'
    + '<li><strong>' + res.nb_ventes + '</strong> vente' + (res.nb_ventes > 1 ? 's' : '') + ' — ' + formaterPrix(res.total_ventes) + '</li>'
    + '<li><strong>' + res.nb_remboursements + '</strong> remboursement' + (res.nb_remboursements > 1 ? 's' : '') + ' — ' + formaterPrix(res.total_remboursements) + '</li>'
    + '</ul>';

  if (res.sans_cout) {
    html += '<div style="color:var(--rouge);font-size:0.9rem;margin-bottom:8px">⚠️ ' + res.sans_cout +
      ' vente' + (res.sans_cout > 1 ? 's' : '') + ' sans coût connu (le lot n\'a pas de coût). Le revenu serait inscrit, mais pas le coût — finis tes achats et tes lots avant.</div>';
  }

  if (res.problemes && res.problemes.length) {
    html += '<div style="font-size:0.9rem;margin-bottom:8px"><strong>' + res.problemes.length +
      '</strong> que je refuse de deviner, à régler à la main :<ul style="margin:4px 0 0 0;padding-left:20px">';
    res.problemes.slice(0, 10).forEach(p => {
      html += '<li>' + echapperHtml(p.reference) + ' — ' + echapperHtml(p.raison) + '</li>';
    });
    html += '</ul></div>';
  }

  html += '<div class="texte-secondaire" style="font-size:0.85rem;margin-bottom:10px">'
    + 'Chaque écriture sera inscrite à <strong>sa date d\'origine</strong>. Celles qui existent déjà sont sautées — aucun doublon possible.</div>'
    + '<button class="bouton bouton-petit" onclick="pcLancerRattrapage()">Inscrire ces ' + total + ' écritures</button>'
    + '</div>';

  zone.innerHTML = html;
}

async function pcLancerRattrapage() {
  if (!confirm('Inscrire les écritures manquantes au journal ?\n\nChacune portera sa date d\'origine. Rien ne sera effacé, et ce qui a déjà son écriture est sauté.')) return;

  const zone = document.getElementById('rattrapage-resultat');
  if (zone) zone.innerHTML = '<div class="texte-secondaire">J\'inscris…</div>';

  const res = await appelAPIPost('lancerRattrapageComptable');
  if (!res || !res.success) {
    afficherMsg('plan-comptable', (res && res.message) ? res.message : 'Rattrapage refusé.', 'erreur');
    if (zone) zone.innerHTML = '';
    return;
  }

  afficherMsg('plan-comptable', '✅ ' + res.inscrites + ' écriture' + (res.inscrites > 1 ? 's' : '') + ' inscrite' + (res.inscrites > 1 ? 's' : '') + ' au journal.');
  if (zone) zone.innerHTML = '';
  chargerPlanComptable(); // recharge l'alarme, qui devrait s'être vidée
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

var pcSections = [];
var pcComptes  = [];
var pcCats     = [];
var pcConfig   = [];
var pcCatEditId = null;

// ─── Un seul accordéon ouvert à gauche ───
function pcOuvrirAccordeon(nom) {
  ['sections', 'comptes', 'cats'].forEach(n => {
    const corps = document.getElementById('pc-acc-' + n);
    if (corps) corps.classList.toggle('cache', n !== nom);
  });
}

// ─── Un seul volet (formulaire) ouvert à droite; ouvre son accordéon ───
function pcOuvrirVolet(nom) {
  ['section', 'compte', 'categorie'].forEach(n => {
    const volet = document.getElementById('pc-volet-' + n);
    if (volet) volet.classList.toggle('cache', n !== nom);
  });
  pcOuvrirAccordeon(nom === 'section' ? 'sections' : nom === 'compte' ? 'comptes' : 'cats');
  if (window.innerWidth <= 900) {
    const volet = document.getElementById('pc-volet-' + nom);
    if (volet) volet.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── Boutons de l'entête : ouvre un volet vierge en mode ajout ───
function pcNouveau(nom) {
  if (!document.getElementById('pc-volet-' + nom)) return;
  if (nom === 'section') {
    document.getElementById('pc-sec-titre').textContent = 'Ajouter une section';
    const num = document.getElementById('pc-sec-numero');
    const nomC = document.getElementById('pc-sec-nom');
    num.value = ''; num.disabled = false;
    nomC.value = ''; nomC.disabled = false;
    document.getElementById('pc-sec-actions').innerHTML =
      '<button class="boutons boutons-vert" onclick="pcAjouterSection()">Ajouter la section</button>';
  } else if (nom === 'compte') {
    document.getElementById('pc-cpt-titre').textContent = 'Ajouter un compte';
    const sec = document.getElementById('pc-cpt-section');
    const num = document.getElementById('pc-cpt-numero');
    const nomC = document.getElementById('pc-cpt-nom');
    sec.disabled = false;
    num.value = ''; num.disabled = false;
    nomC.value = ''; nomC.disabled = false;
    document.getElementById('pc-cpt-actions').innerHTML =
      '<button class="boutons boutons-vert" onclick="pcAjouterCompte()">Ajouter le compte</button>';
  } else {
    pcCatEditId = null;
    document.getElementById('pc-cat-titre').textContent = 'Ajouter une catégorie UC';
    ['pc-cat-nom', 'pc-cat-densite', 'pc-cat-marge'].forEach(id => {
      const c = document.getElementById(id); c.value = ''; c.disabled = false;
    });
    document.getElementById('pc-cat-classe').disabled = false;
    document.getElementById('pc-cat-classe').value = '';
    pcCatChangerClasse();
    document.getElementById('pc-cat-actions').innerHTML =
      '<button class="boutons boutons-vert" onclick="pcCatAjouter()">Ajouter la catégorie</button>';
  }
  pcOuvrirVolet(nom);
}

// ─── Consultation d'une section (numéro verrouillé pour toujours) ───
function pcVoirSection(numero) {
  const s = pcSections.find(x => String(x.numero) === String(numero));
  if (!s) return;
  document.getElementById('pc-sec-titre').textContent = 'Section ' + s.numero;
  const num = document.getElementById('pc-sec-numero');
  const nom = document.getElementById('pc-sec-nom');
  num.value = s.numero; num.disabled = true;
  nom.value = s.nom;    nom.disabled = true;
  document.getElementById('pc-sec-actions').innerHTML =
    '<button class="boutons boutons-contour" onclick="pcSecActiverModif()">Modifier</button>';
  pcOuvrirVolet('section');
}
function pcSecActiverModif() {
  document.getElementById('pc-sec-nom').disabled = false;
  document.getElementById('pc-sec-actions').innerHTML =
    '<button class="boutons boutons-vert" onclick="pcModifierSection()">Enregistrer</button>';
}
async function pcModifierSection() {
  const numero = (document.getElementById('pc-sec-numero').value || '').trim();
  const nom    = (document.getElementById('pc-sec-nom').value || '').trim();
  if (!nom) { afficherMsg('plan-comptable', 'Le nom est obligatoire.', 'erreur'); return; }
  const res = await appelAPIPost('modifierSectionComptable', { numero, nom });
  if (res && res.success) {
    afficherMsg('plan-comptable', 'Section corrigée.', 'succes');
    await chargerPlanComptable();
    pcVoirSection(numero);
  } else {
    afficherMsg('plan-comptable', (res && res.message) || 'Erreur.', 'erreur');
  }
}

// ─── Consultation d'un compte (numéro verrouillé pour toujours) ───
function pcVoirCompte(numero) {
  const c = pcComptes.find(x => String(x.numero) === String(numero));
  if (!c) return;
  document.getElementById('pc-cpt-titre').textContent = 'Compte ' + c.numero;
  const sec = document.getElementById('pc-cpt-section');
  const num = document.getElementById('pc-cpt-numero');
  const nom = document.getElementById('pc-cpt-nom');
  sec.value = String(c.section); sec.disabled = true;
  num.value = c.numero; num.disabled = true;
  nom.value = c.nom;    nom.disabled = true;
  document.getElementById('pc-cpt-actions').innerHTML =
    '<button class="boutons boutons-contour" onclick="pcCptActiverModif()">Modifier</button>';
  pcOuvrirVolet('compte');
}
function pcCptActiverModif() {
  document.getElementById('pc-cpt-nom').disabled = false;
  document.getElementById('pc-cpt-actions').innerHTML =
    '<button class="boutons boutons-vert" onclick="pcModifierCompte()">Enregistrer</button>';
}
async function pcModifierCompte() {
  const numero = (document.getElementById('pc-cpt-numero').value || '').trim();
  const nom    = (document.getElementById('pc-cpt-nom').value || '').trim();
  if (!nom) { afficherMsg('plan-comptable', 'Le nom est obligatoire.', 'erreur'); return; }
  const res = await appelAPIPost('modifierCompteComptable', { numero, nom });
  if (res && res.success) {
    afficherMsg('plan-comptable', 'Compte corrigé.', 'succes');
    await chargerPlanComptable();
    pcVoirCompte(numero);
  } else {
    afficherMsg('plan-comptable', (res && res.message) || 'Erreur.', 'erreur');
  }
}

function pcRendre(sections, comptes, cats, config) {
  const contenu = document.getElementById('contenu-plan-comptable');
  if (!contenu) return;
  pcSections = sections;
  pcComptes  = comptes;
  pcCats     = cats || [];
  pcConfig   = config || [];
  pcCatEditId = null;

  const optionsSections = sections.map(s =>
    `<option value="${s.numero}">${s.numero} — ${s.nom}</option>`
  ).join('');

  const droite = `
    <div class="collant">
      <div id="pc-volet-section" class="cache">
        <div class="section-label" id="pc-sec-titre">Ajouter une section</div>
        <div class="champ">
          <label class="libelle">Numéro</label>
          <input type="text" class="controle" id="pc-sec-numero" placeholder="ex. 1100">
        </div>
        <div class="champ">
          <label class="libelle">Nom</label>
          <input type="text" class="controle" id="pc-sec-nom" placeholder="ex. Encaisse">
        </div>
        <div class="actions" id="pc-sec-actions">
          <button class="boutons boutons-vert" onclick="pcAjouterSection()">Ajouter la section</button>
        </div>
      </div>
      <div id="pc-volet-compte" class="cache">
        <div class="section-label" id="pc-cpt-titre">Ajouter un compte</div>
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
        <div class="actions" id="pc-cpt-actions">
          <button class="boutons boutons-vert" onclick="pcAjouterCompte()">Ajouter le compte</button>
        </div>
      </div>
      <div id="pc-volet-categorie" class="cache">
        <div class="section-label" id="pc-cat-titre">Ajouter une catégorie UC</div>
        <div class="champ">
          <label class="libelle">Nom</label>
          <input type="text" class="controle" id="pc-cat-nom" placeholder="ex. Huiles">
        </div>
        <div class="champ">
          <label class="libelle">Classe</label>
          <select class="controle" id="pc-cat-classe" onchange="pcCatChangerClasse()">
            <option value="">— choisir —</option>
            <option value="1">1000 — Actif</option>
            <option value="2">2000 — Passif</option>
            <option value="3">3000 — Avoir</option>
            <option value="4">4000 — Revenus</option>
            <option value="5">5000 — Dépenses</option>
          </select>
        </div>
        <div class="champ">
          <label class="libelle">Section</label>
          <select class="controle" id="pc-cat-section" onchange="pcCatChangerSection()" disabled></select>
        </div>
        <div class="champ">
          <label class="libelle">Compte à l'achat</label>
          <select class="controle" id="pc-cat-compte" disabled></select>
        </div>
        <div class="grille">
          <div class="champ">
            <label class="libelle">Densité (g/ml)</label>
            <input type="number" step="0.01" class="controle" id="pc-cat-densite" placeholder="ex. 0.92">
          </div>
          <div class="champ">
            <label class="libelle">Marge de perte (%)</label>
            <input type="number" step="0.1" class="controle" id="pc-cat-marge" placeholder="ex. 2">
          </div>
        </div>
        <div class="actions" id="pc-cat-actions">
          <button class="boutons boutons-vert" onclick="pcCatAjouter()">Ajouter la catégorie</button>
        </div>
      </div>
    </div>
  `;

  let html = '';

  html += `<div class="titre separateur-haut" onclick="pcOuvrirAccordeon('sections')">Sections</div><div id="pc-acc-sections" class="cache">`;
  if (!sections.length) {
    html += `<div class="vide"><div class="vide-titre">Aucune section</div><div class="vide-desc">Ajoutez-en une à droite.</div></div>`;
  } else {
    let classeActuelle = '';
    sections.forEach(s => {
      const classe = pcNomClasse(s.numero);
      if (classe !== classeActuelle) {
        classeActuelle = classe;
        html += `<div class="section-label">${String(s.numero).charAt(0)}000 — ${classe}</div>`;
      }
      html += `<div class="rangeeitem" onclick="pcVoirSection('${s.numero}')"><div class="rangeeitem-info"><div class="rangeeitem-titre"><span class="numero">${s.numero}</span>${s.nom}</div></div></div>`;
    });
  }
  html += `</div>`;

  html += `<div class="titre separateur-haut" onclick="pcOuvrirAccordeon('comptes')">Comptes</div><div id="pc-acc-comptes" class="cache">`;
  if (!sections.length) {
    html += `<div class="vide"><div class="vide-titre">Aucune section</div><div class="vide-desc">Ajoutez-en une à droite.</div></div>`;
  } else {
    let classeActuelle2 = '';
    sections.forEach(s => {
      const classe = pcNomClasse(s.numero);
      if (classe !== classeActuelle2) {
        classeActuelle2 = classe;
        html += `<div class="section-label">${String(s.numero).charAt(0)}000 — ${classe}</div>`;
      }
      html += `<div class="bloc"><div class="accroche">${s.numero} · ${s.nom}</div>`;
      const dedans = comptes
        .filter(c => String(c.section) === String(s.numero))
        .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
      if (!dedans.length) {
        html += `<div class="textes-discrets">aucun compte</div>`;
      } else {
        dedans.forEach(c => {
          html += `<div class="rangeeitem" onclick="pcVoirCompte('${c.numero}')"><div class="rangeeitem-info"><div class="rangeeitem-titre"><span class="numero">${c.numero}</span>${c.nom}</div></div></div>`;
        });
      }
      html += `</div>`;
    });
  }
  html += `</div>`;

  html += `<div class="titre separateur-haut" onclick="pcOuvrirAccordeon('cats')">Catégories Univers Caresse</div><div id="pc-acc-cats" class="cache">`;
  if (!cats.length) {
    html += `<div class="vide"><div class="vide-titre">Aucune catégorie</div><div class="vide-desc">Ajoutez-en une à droite.</div></div>`;
  } else {
    const configParCat = {};
    (config || []).forEach(c => { configParCat[c.cat_id] = c; });
    cats.forEach(cat => {
      const compte = comptes.find(c => String(c.numero) === String(cat.compte_achat));
      const cfg = configParCat[cat.cat_id];
      let meta = '';
      if (compte) {
        meta = `${compte.numero} — ${compte.nom}`;
      } else if (cat.compte_achat) {
        meta = `⚠️ compte ${cat.compte_achat} absent du plan`;
      } else {
        meta = `⚠️ aucun compte à l'achat`;
      }
      meta += cfg
        ? ` · densité ${cfg.densite} · marge ${cfg.marge_perte_pct} %`
        : ` · ⚠️ densité manquante — prix au gramme faussé`;
      html += `<div class="rangeeitem" onclick="pcCatModifier('${cat.cat_id}')">
        <div class="rangeeitem-info">
          <span class="rangeeitem-titre">${cat.nom}${cat.inci ? ' · INCI requis' : ''}</span>
          <span class="rangeeitem-meta">${meta}</span>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  contenu.innerHTML = `<div class="grille"><div>${html}</div>${droite}</div>`;
}

// ─── Entonnoir de la carte catégorie : classe → section → compte ───
function pcCatChangerClasse() {
  const classe = document.getElementById('pc-cat-classe').value;
  const selSection = document.getElementById('pc-cat-section');
  const selCompte  = document.getElementById('pc-cat-compte');
  selCompte.innerHTML = '';
  selCompte.disabled = true;
  if (!classe) {
    selSection.innerHTML = '';
    selSection.disabled = true;
    return;
  }
  const dedans = pcSections.filter(s => String(s.numero).charAt(0) === classe);
  selSection.innerHTML = '<option value="">— choisir —</option>' +
    dedans.map(s => `<option value="${s.numero}">${s.numero} — ${s.nom}</option>`).join('');
  selSection.disabled = false;
}

function pcCatChangerSection() {
  const section = document.getElementById('pc-cat-section').value;
  const selCompte = document.getElementById('pc-cat-compte');
  if (!section) {
    selCompte.innerHTML = '';
    selCompte.disabled = true;
    return;
  }
  const dedans = pcComptes
    .filter(c => String(c.section) === String(section))
    .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
  selCompte.innerHTML = '<option value="">— choisir —</option>' +
    dedans.map(c => `<option value="${c.numero}">${c.numero} — ${c.nom}</option>`).join('');
  selCompte.disabled = false;
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
    await chargerPlanComptable();
    pcOuvrirVolet('section');
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
    await chargerPlanComptable();
    pcOuvrirVolet('compte');
  } else {
    afficherMsg('plan-comptable', (res && res.message) || 'Erreur.', 'erreur');
  }
}

// ─── Modifier / supprimer une catégorie UC ───
function pcCatModifier(cat_id) {
  const cat = pcCats.find(c => String(c.cat_id) === String(cat_id));
  if (!cat) return;
  const cfg = pcConfig.find(c => String(c.cat_id) === String(cat_id));
  pcCatEditId = cat_id;
  pcOuvrirVolet('categorie');
  document.getElementById('pc-cat-titre').textContent = 'Catégorie ' + (cat.nom || '');
  ['pc-cat-nom', 'pc-cat-classe', 'pc-cat-densite', 'pc-cat-marge'].forEach(id => {
    document.getElementById(id).disabled = true;
  });
  const utilise = (listesDropdown.fullData || []).filter(d => d.cat_id === cat_id);
  document.getElementById('pc-cat-actions').innerHTML =
    '<button class="boutons boutons-contour" onclick="pcCatActiverModif()">Modifier</button>' +
    (utilise.length === 0 ? ' <button class="boutons boutons-rouge" onclick="pcCatSupprimer(\'' + cat_id + '\')">Supprimer</button>' : '');
  document.getElementById('pc-cat-nom').value = cat.nom || '';
  document.getElementById('pc-cat-densite').value = cfg ? cfg.densite : '';
  document.getElementById('pc-cat-marge').value = cfg ? cfg.marge_perte_pct : '';
  const compte = pcComptes.find(c => String(c.numero) === String(cat.compte_achat));
  if (compte) {
    document.getElementById('pc-cat-classe').value = String(compte.section).charAt(0);
    pcCatChangerClasse();
    document.getElementById('pc-cat-section').value = String(compte.section);
    pcCatChangerSection();
    document.getElementById('pc-cat-compte').value = String(compte.numero);
  } else {
    document.getElementById('pc-cat-classe').value = '';
    pcCatChangerClasse();
    afficherMsg('plan-comptable', cat.compte_achat
      ? '⚠️ Compte ' + cat.compte_achat + ' absent du plan — choisissez un compte.'
      : '⚠️ Aucun compte à l\'achat — choisissez un compte.', 'erreur');
  }
  document.getElementById('pc-cat-section').disabled = true;
  document.getElementById('pc-cat-compte').disabled = true;
}

function pcCatActiverModif() {
  ['pc-cat-nom', 'pc-cat-classe', 'pc-cat-section', 'pc-cat-compte', 'pc-cat-densite', 'pc-cat-marge'].forEach(id => {
    document.getElementById(id).disabled = false;
  });
  document.getElementById('pc-cat-actions').innerHTML =
    '<button class="boutons boutons-vert" onclick="pcCatAjouter()">Enregistrer</button>';
}

function pcCatSupprimer(cat_id) {
  confirmerAction('Supprimer cette catégorie ?', async () => {
    const res = await appelAPIPost('deleteCategorieUC', { cat_id });
    if (res && res.success) {
      if (listesDropdown.categoriesMap) delete listesDropdown.categoriesMap[cat_id];
      if (listesDropdown.catsInci) delete listesDropdown.catsInci[cat_id];
      if (listesDropdown.config) delete listesDropdown.config[cat_id];
      afficherMsg('plan-comptable', 'Catégorie supprimée.', 'succes');
      chargerPlanComptable();
    } else {
      afficherMsg('plan-comptable', (res && res.message) || 'Erreur.', 'erreur');
    }
  });
}

// ─── Ajouter une catégorie UC (5 morceaux, un seul appel) ───
async function pcCatAjouter() {
  const nom     = (document.getElementById('pc-cat-nom').value || '').trim();
  const compte  = document.getElementById('pc-cat-compte').value;
  const densite = parseFloat(document.getElementById('pc-cat-densite').value);
  const marge   = parseFloat(document.getElementById('pc-cat-marge').value) || 0;
  const inci    = String(compte) === '1305';
  if (!nom || !compte || !(densite > 0)) {
    afficherMsg('plan-comptable', 'Nom, compte et densité obligatoires.', 'erreur');
    return;
  }
  const res = await appelAPIPost('saveCategorieUC', {
    cat_id: pcCatEditId || undefined,
    nom, compte_achat: compte, densite, marge_perte_pct: marge, inci
  });
  if (res && res.success) {
    const id = pcCatEditId || res.cat_id;
    if (listesDropdown.categoriesMap) listesDropdown.categoriesMap[id] = nom;
    if (listesDropdown.catsInci) listesDropdown.catsInci[id] = !!inci;
    if (listesDropdown.config) {
      listesDropdown.config[id] = { densite, unite: 'g', margePertePct: marge };
    }
    const etaitModif = !!pcCatEditId;
    afficherMsg('plan-comptable', etaitModif ? 'Catégorie mise à jour.' : 'Catégorie ajoutée.', 'succes');
    await chargerPlanComptable();
    if (etaitModif) pcCatModifier(id); else pcNouveau('categorie');
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
      <div class="champ champ-plein">
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

  // Le bilan cumule depuis toujours; l'état ne montre que la période choisie
  const modeClic = (chiffre === '4' || chiffre === '5') ? 'periode' : 'bilan';

  const ligneCompte = (c, m) => {
    // 3015 et 3100 sont calculés (bénéfices), pas tirés d'écritures : pas de détail à montrer
    const calcule = (String(c.numero) === '3015' || String(c.numero) === '3100');
    const cls  = 'rangeeitem' + (calcule ? '' : ' cliquable');
    const clic = calcule ? '' : ` onclick="brVoirCompte('${c.numero}','${modeClic}')"`;
    return `<div class="${cls}"${clic}><div class="rangeeitem-info"><div class="rangeeitem-titre"><span class="numero">${c.numero}</span>${c.nom}</div></div><span class="rangeeitem-valeur">${formaterPrix(m)}</span></div>`;
  };

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
    // Quand la section porte le même nom que la classe (« Revenus » sous « Revenus »),
    // on n'écrit pas le titre deux fois.
    const memeNom = String(s.nom || '').trim().toLowerCase() === String(titre || '').trim().toLowerCase();
    const accroche = memeNom ? '' : `<div class="accroche">${s.nom}</div>`;
    html += `<div class="bloc">${accroche}${lignes}${ligneSousTotal}</div>`;
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

// ══════════════════════════════════════════════════════════════
// GRAND LIVRE — les documents du comptable
// Deux pièces : la balance de vérification (le test que tout se tient)
// et le grand livre (tous les comptes, chacun avec son report et ses mouvements).
// Aucune donnée neuve : c'est la même que le bilan.
// ══════════════════════════════════════════════════════════════
var glDonnees = null;

async function chargerGrandLivre() {
  const loading = document.getElementById('loading-grand-livre');
  const contenu = document.getElementById('contenu-grand-livre');
  if (loading) loading.style.display = '';
  if (contenu) contenu.innerHTML = '';

  const res = await appelAPI('getBilanResultats');
  if (loading) loading.style.display = 'none';

  if (!res || !res.success) {
    afficherMsg('grand-livre', 'Erreur : ' + ((res && res.message) || 'chargement impossible'), 'erreur');
    return;
  }
  glDonnees = res;
  glRendreChoix();
}

function glRendreChoix() {
  const contenu = document.getElementById('contenu-grand-livre');
  if (!contenu) return;

  const anneeCourante = new Date().getFullYear();
  const annees = new Set([anneeCourante]);
  (glDonnees.ecritures || []).forEach(e => {
    const a = parseInt(String(e.date).slice(0, 4));
    if (a) annees.add(a);
  });
  const options = [...annees].sort().reverse().map(a => `<option value="${a}">${a}</option>`).join('');

  contenu.innerHTML = `
    <div class="grille">
      <div class="champ champ-plein">
        <label class="libelle">Exercice (fin au 31 décembre)</label>
        <select class="controle" id="gl-annee" onchange="glChangerAnnee()">${options}</select>
      </div>
      <div class="champ">
        <label class="libelle">Période — du</label>
        <input type="date" class="controle" id="gl-debut" onchange="glAfficher()">
      </div>
      <div class="champ">
        <label class="libelle">au</label>
        <input type="date" class="controle" id="gl-fin" onchange="glAfficher()">
      </div>
    </div>
    <div id="gl-etats"></div>
  `;
  glChangerAnnee();
}

function glChangerAnnee() {
  const annee = document.getElementById('gl-annee').value;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  document.getElementById('gl-debut').value = annee + '-01-01';
  document.getElementById('gl-fin').value =
    (String(aujourdhui).slice(0, 4) === String(annee)) ? aujourdhui : (annee + '-12-31');
  glAfficher();
}

function glAfficher() {
  const zone = document.getElementById('gl-etats');
  if (!zone || !glDonnees) return;
  const annee = document.getElementById('gl-annee').value;
  const fin   = document.getElementById('gl-fin').value;
  if (!annee || !fin) return;

  const finPrec = (parseInt(annee, 10) - 1) + '-12-31';
  const comptes = (glDonnees.comptes || []).slice()
    .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));

  // Toutes les écritures jusqu'à la date de fin, rangées par compte
  const parCompte = {};
  (glDonnees.ecritures || []).forEach(e => {
    if (!e.date || e.date > fin) return;
    const k = String(e.compte);
    if (!parCompte[k]) parCompte[k] = [];
    parCompte[k].push(e);
  });

  // ── 1. Balance de vérification ──
  let totDebit = 0, totCredit = 0, lignesBal = '';
  comptes.forEach(c => {
    const lignes = parCompte[String(c.numero)] || [];
    if (!lignes.length) return;
    let d = 0, cr = 0;
    lignes.forEach(e => { d += e.debit; cr += e.credit; });
    const net = Math.round((d - cr) * 100) / 100;
    if (net === 0) return;
    const auDebit  = net > 0 ?  net : 0;
    const auCredit = net < 0 ? -net : 0;
    totDebit += auDebit; totCredit += auCredit;
    lignesBal +=
      '<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--beige);font-size:0.9rem">' +
        '<span style="width:60px;flex:none" class="texte-secondaire">' + echapperHtml(String(c.numero)) + '</span>' +
        '<span style="flex:1;min-width:120px">' + echapperHtml(c.nom || '') + '</span>' +
        '<span style="width:100px;text-align:right;flex:none">' + (auDebit  ? formaterPrix(auDebit)  : '') + '</span>' +
        '<span style="width:100px;text-align:right;flex:none">' + (auCredit ? formaterPrix(auCredit) : '') + '</span>' +
      '</div>';
  });

  const equilibre = Math.abs(totDebit - totCredit) < 0.005;
  let html = `<div class="titre separateur-haut">Balance de vérification au ${fin}</div>` +
    '<div style="display:flex;gap:10px;padding:5px 0;border-bottom:2px solid var(--primary);font-weight:600;font-size:0.85rem">' +
      '<span style="width:60px;flex:none">Nº</span>' +
      '<span style="flex:1;min-width:120px">Compte</span>' +
      '<span style="width:100px;text-align:right;flex:none">Débit</span>' +
      '<span style="width:100px;text-align:right;flex:none">Crédit</span>' +
    '</div>' + lignesBal +
    '<div class="lignetotal"><span class="lignetotal-libelle grand">Total</span><span>' +
      formaterPrix(totDebit) + ' / ' + formaterPrix(totCredit) + ' ' + (equilibre ? '✅' : '⚠️') +
    '</span></div>';

  // ── 2. Grand livre : chaque compte, son report, ses mouvements ──
  html += `<div class="titre separateur-haut">Grand livre — exercice ${annee}</div>`;
  let nbComptes = 0;

  comptes.forEach(c => {
    const toutes = parCompte[String(c.numero)] || [];
    const sens = brSens(c.numero);

    let ouverture = 0;
    toutes.filter(e => e.date <= finPrec).forEach(e => { ouverture += (e.debit - e.credit) * sens; });
    const mouvements = toutes.filter(e => e.date > finPrec)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (!mouvements.length && Math.abs(ouverture) < 0.005) return; // compte muet : on le saute
    nbComptes++;

    let solde = ouverture, corps = '';
    corps +=
      '<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--beige);font-size:0.88rem;font-style:italic">' +
        '<span style="width:52px;flex:none"></span>' +
        '<span style="width:86px;flex:none">' + echapperHtml(finPrec) + '</span>' +
        '<span style="flex:1;min-width:110px">Solde reporté</span>' +
        '<span style="width:80px;flex:none"></span><span style="width:80px;flex:none"></span>' +
        '<span style="width:92px;text-align:right;flex:none;font-weight:600">' + formaterPrix(ouverture) + '</span>' +
      '</div>';

    mouvements.forEach(e => {
      solde += (e.debit - e.credit) * sens;
      const desc = echapperHtml(e.libelle || '') +
        (e.beneficiaire ? ' <span class="texte-secondaire">— ' + echapperHtml(e.beneficiaire) + '</span>' : '');
      corps +=
        '<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--beige);font-size:0.88rem">' +
          '<span style="width:52px;flex:none" class="texte-secondaire">J-' + echapperHtml(e.no_ecriture || '') + '</span>' +
          '<span style="width:86px;flex:none">' + echapperHtml(e.date) + '</span>' +
          '<span style="flex:1;min-width:110px">' + desc + '</span>' +
          '<span style="width:80px;text-align:right;flex:none">' + (e.debit  ? formaterPrix(e.debit)  : '') + '</span>' +
          '<span style="width:80px;text-align:right;flex:none">' + (e.credit ? formaterPrix(e.credit) : '') + '</span>' +
          '<span style="width:92px;text-align:right;flex:none;font-weight:600">' + formaterPrix(solde) + '</span>' +
        '</div>';
    });

    html += '<div class="bloc" style="margin-bottom:18px">' +
      '<div class="accroche">' + echapperHtml(String(c.numero) + ' — ' + (c.nom || '')) + '</div>' +
      corps +
      '<div class="lignetotal"><span class="lignetotal-libelle moyen">Solde au ' + echapperHtml(fin) + '</span><span>' + formaterPrix(solde) + '</span></div>' +
      '</div>';
  });

  if (!nbComptes) html += '<div class="texte-secondaire">Aucun compte n\'a de mouvement pour cet exercice.</div>';

  zone.innerHTML = html;
}

// Impression : la zone de l'admin a une hauteur fixe qui défile, donc l'imprimante
// ne verrait que la première page. On ouvre plutôt une page propre et on imprime celle-là.
// Une seule mécanique pour les deux documents (bilan et grand livre).
function imprimerDocumentComptable(zoneId, titre, sousTitre, cleMessage) {
  const zone = document.getElementById(zoneId);
  if (!zone || !zone.innerHTML.trim()) {
    afficherMsg(cleMessage, 'Il n\'y a rien à imprimer pour l\'instant.', 'erreur');
    return;
  }

  const styles =
    ':root{--beige:#d8d2c8;--primary:#8b8680;--gris:#8b8680;--rouge:#c44536}' +
    'body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;color:#000;margin:16mm 12mm}' +
    'h1{font-size:15pt;margin:0 0 2mm}' +
    '.sous{font-size:10pt;color:#555;margin:0 0 8mm}' +
    '.titre{font-size:12.5pt;font-weight:700;margin:7mm 0 2mm;border-bottom:1px solid #000;padding-bottom:1mm}' +
    '.accroche{font-weight:700;margin:3mm 0 1mm}' +
    '.bloc{margin-bottom:5mm}' +
    '.lignetotal{display:flex;justify-content:space-between;font-weight:700;border-top:1px solid #000;padding-top:1mm;margin-top:1mm}' +
    '.section-label{font-weight:700;margin-top:4mm}' +
    '.texte-secondaire{color:#666}' +
    // Les lignes du bilan tiennent leur mise en page de ton CSS, absent ici : on la redonne
    '.rangeeitem{display:flex;align-items:baseline;justify-content:space-between;gap:6mm;' +
      'padding:0.8mm 0;border-bottom:1px solid var(--beige)}' +
    '.rangeeitem-info{flex:1;min-width:0}' +
    '.rangeeitem-titre{display:flex;gap:3mm}' +
    '.numero{color:#666;min-width:13mm;display:inline-block}' +
    '.rangeeitem-valeur{white-space:nowrap;text-align:right}';

  const fenetre = window.open('', '_blank');
  if (!fenetre) {
    afficherMsg(cleMessage, 'Ton navigateur a bloqué la fenêtre d\'impression — autorise les fenêtres surgissantes pour ce site.', 'erreur');
    return;
  }
  fenetre.document.write(
    '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
    '<title>' + titre + '</title><style>' + styles + '</style></head><body>' +
    '<h1>Univers Caresse — ' + titre + '</h1>' +
    '<div class="sous">' + sousTitre + '</div>' +
    zone.innerHTML +
    '</body></html>'
  );
  fenetre.document.close();
  fenetre.focus();
  fenetre.print();
}

function glImprimer() {
  const annee = (document.getElementById('gl-annee') || {}).value || '';
  const fin   = (document.getElementById('gl-fin')   || {}).value || '';
  imprimerDocumentComptable('gl-etats', 'Grand livre', 'Exercice ' + annee + ' · au ' + fin, 'grand-livre');
}

function brImprimer() {
  const annee = (document.getElementById('br-annee') || {}).value || '';
  const debut = (document.getElementById('br-debut') || {}).value || '';
  const fin   = (document.getElementById('br-fin')   || {}).value || '';
  imprimerDocumentComptable('br-etats', 'Bilan et résultats',
    'Exercice ' + annee + ' · du ' + debut + ' au ' + fin, 'bilan-resultats');
}

// ─── Toutes les transactions d'un compte, derrière le montant cliqué ───
// mode « bilan » : tout depuis le début jusqu'à la date de fin (c'est un solde).
// mode « periode » : seulement du début à la fin choisis (c'est un mouvement).
function brVoirCompte(numero, mode) {
  if (!brDonnees) return;
  const debut = document.getElementById('br-debut').value;
  const fin   = document.getElementById('br-fin').value;

  const compte = (brDonnees.comptes || []).find(c => String(c.numero) === String(numero));
  const nomCompte = numero + (compte && compte.nom ? ' — ' + compte.nom : '');

  const annee         = document.getElementById('br-annee').value;
  const finPrecedente = (parseInt(annee, 10) - 1) + '-12-31';
  const sens          = brSens(numero);
  const toutes        = (brDonnees.ecritures || []).filter(e => String(e.compte) === String(numero) && e.date);

  // Bilan : on fige le solde au 31 décembre de l'année précédente (le report),
  // puis on ne montre que les transactions de l'exercice choisi.
  // État des résultats : pas de report — c'est un mouvement de la période.
  let ouverture = 0;
  if (mode === 'bilan') {
    toutes.filter(e => e.date <= finPrecedente).forEach(e => { ouverture += (e.debit - e.credit) * sens; });
  }

  const lignes = toutes
    .filter(e => e.date <= fin && (mode === 'bilan' ? e.date > finPrecedente : e.date >= debut))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  let solde = ouverture, corps = '';

  if (mode === 'bilan') {
    corps +=
      '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--beige);font-size:0.9rem;font-style:italic">' +
        '<span style="width:52px;flex:none"></span>' +
        '<span style="width:86px;flex:none">' + echapperHtml(finPrecedente) + '</span>' +
        '<span style="flex:1;min-width:120px">Solde reporté</span>' +
        '<span style="width:84px;flex:none"></span>' +
        '<span style="width:84px;flex:none"></span>' +
        '<span style="width:92px;text-align:right;flex:none;font-weight:600">' + formaterPrix(ouverture) + '</span>' +
      '</div>';
  }

  lignes.forEach(e => {
    solde += (e.debit - e.credit) * sens;
    const desc = echapperHtml(e.libelle || '') +
      (e.beneficiaire ? ' <span class="texte-secondaire">— ' + echapperHtml(e.beneficiaire) + '</span>' : '') +
      (e.notes ? ' <span class="texte-secondaire">(' + echapperHtml(e.notes) + ')</span>' : '');
    corps +=
      '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--beige);font-size:0.9rem">' +
        '<span style="width:52px;flex:none" class="texte-secondaire">J-' + echapperHtml(e.no_ecriture || '') + '</span>' +
        '<span style="width:86px;flex:none">' + echapperHtml(e.date) + '</span>' +
        '<span style="flex:1;min-width:120px">' + desc + '</span>' +
        '<span style="width:84px;text-align:right;flex:none">' + (e.debit  ? formaterPrix(e.debit)  : '') + '</span>' +
        '<span style="width:84px;text-align:right;flex:none">' + (e.credit ? formaterPrix(e.credit) : '') + '</span>' +
        '<span style="width:92px;text-align:right;flex:none;font-weight:600">' + formaterPrix(solde) + '</span>' +
      '</div>';
  });

  if (!lignes.length) {
    corps += '<div class="texte-secondaire" style="padding-top:8px">Aucune transaction dans cette période.</div>';
  }

  const entete = (lignes.length || mode === 'bilan')
    ? '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:2px solid var(--primary);font-weight:600;font-size:0.85rem">' +
        '<span style="width:52px;flex:none">Nº</span>' +
        '<span style="width:86px;flex:none">Date</span>' +
        '<span style="flex:1;min-width:120px">Description</span>' +
        '<span style="width:84px;text-align:right;flex:none">Débit</span>' +
        '<span style="width:84px;text-align:right;flex:none">Crédit</span>' +
        '<span style="width:92px;text-align:right;flex:none">Solde</span>' +
      '</div>'
    : '';

  const periodeTexte = (mode === 'bilan')
    ? 'Exercice ' + annee + ' — solde reporté au ' + finPrecedente + ', puis les transactions jusqu\'au ' + fin
    : 'Du ' + debut + ' au ' + fin;

  const ancien = document.getElementById('detail-compte-overlay');
  if (ancien) ancien.remove();
  const overlay = document.createElement('div');
  overlay.id = 'detail-compte-overlay';
  overlay.className = 'voile ouvert';
  overlay.innerHTML =
    '<div class="modale">' +
      '<div class="modale-entete">' +
        '<span class="titre">' + echapperHtml(nomCompte) + '</span>' +
        '<button type="button" class="boutons-fermer" id="detail-compte-fermer">✕</button>' +
      '</div>' +
      '<div class="modale-corps">' +
        '<div class="texte-secondaire" style="margin-bottom:10px">' + echapperHtml(periodeTexte) +
          ' · ' + lignes.length + ' transaction' + (lignes.length > 1 ? 's' : '') + '</div>' +
        entete + corps +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.getElementById('detail-compte-fermer').onclick = () => overlay.remove();
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

  // L'état des résultats d'abord, le bilan ensuite
  let html = `<div class="titre separateur-haut">État des résultats du ${debut} au ${fin}</div>` +
    revenus.html + depenses.html +
    `<div class="lignetotal"><span class="lignetotal-libelle grand">Bénéfice net de la période</span><span>${formaterPrix(revenus.total - depenses.total)}</span></div>`;

  html += `<div class="titre separateur-haut">Bilan au ${fin}</div>` +
    actif.html + passif.html + avoir.html +
    `<div class="lignetotal"><span class="lignetotal-libelle grand">Actif = Passif + Avoir</span>
     <span>${formaterPrix(actif.total)} / ${formaterPrix(passif.total + avoir.total)} ${balance ? '✅' : '⚠️'}</span></div>`;

  if (r.inconnus.length) {
    html += `<div class="section-label">Comptes inconnus</div>
      <div class="textes-discrets">Des écritures portent un numéro absent du plan : ${r.inconnus.join(', ')}</div>`;
  }

  zone.innerHTML = html;
}
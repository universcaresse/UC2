/* ════════════════════════════════════════
   CATALOGUE BUILDER — catalogue-builder.js
   ════════════════════════════════════════ */

const CB_W = 816;
const CB_H = 1056;

const CB_SHEETS = {
  Collections_v2: { idField:'col_id', fields:['nom','slogan','description','couleur_hex','photo_url'] },
  Gammes_v2:      { idField:'gam_id', fields:['nom','description','couleur_hex','photo_url'] },
  Familles_v2:    { idField:'fam_id', fields:['nom','description','couleur_hex'] },
  Produits_v2:    { idField:'pro_id', fields:['nom','description','couleur_hex','image_url','desc_emballage'] },
};

const CB_DEFAULTS = {
  titre:   { w:400, h:60  },
  texte:   { w:400, h:140 },
  image:   { w:220, h:180 },
  couleur: { w:120, h:40  },
};

let cbData      = null;
let cbPages     = [];
let cbPageIndex = 0;
let cbSelId     = null;
let cbDragging  = null;
let cbResizing  = null;
let cbInited    = false;
let cbIdCnt     = 0;
const cbGenId   = () => 'cb' + (++cbIdCnt);

// ── Point d'entrée ───────────────────────────────────────────────────────────
async function cbOnAfficher() {
  if (cbInited) return;
  cbInited = true;
  cbInjectStyles();

  try {
    const [rCat, rGam, rFam] = await Promise.all([
      appelAPI('getCatalogue'),
      appelAPI('getGammes'),
      appelAPI('getFamilles'),
    ]);
    const cols = rCat && rCat.success
      ? Object.entries(rCat.infoCollections || {}).map(([id,v]) => ({ col_id:id, ...v }))
      : [];
    cbData = {
      Collections_v2: cols,
      Gammes_v2:  rGam && rGam.success ? rGam.items    : [],
      Familles_v2:rFam && rFam.success ? rFam.items    : [],
      Produits_v2:rCat && rCat.success ? rCat.produits : [],
    };
  } catch(e) {
    cbData = { Collections_v2:[], Gammes_v2:[], Familles_v2:[], Produits_v2:[] };
  }

  document.getElementById('cb-chargement').style.display = 'none';
  document.getElementById('cb-layout').style.display     = 'flex';

  window.addEventListener('mousemove', cbGlobalMouseMove);
  window.addEventListener('mouseup',   cbGlobalMouseUp);

  cbNouvellePageCatalogue();
}

// ── Pages ────────────────────────────────────────────────────────────────────
function cbNouvellePageCatalogue() {
  cbPages.push({ id:cbGenId(), name:'Page '+(cbPages.length+1), blocs:[] });
  cbPageIndex = cbPages.length - 1;
  cbRendreInterface();
}

function cbRenommerPage(nom) {
  if (cbPages[cbPageIndex]) cbPages[cbPageIndex].name = nom;
  cbRendrePagesListe();
}

function cbAllerPage(idx) {
  cbPageIndex = idx;
  cbSelId = null;
  cbRendreInterface();
}

// ── Blocs ────────────────────────────────────────────────────────────────────
function cbAjouterBloc(type) {
  const page = cbPages[cbPageIndex];
  if (!page) return;
  const b = {
    id:cbGenId(), type,
    x:60, y:60,
    w:CB_DEFAULTS[type].w, h:CB_DEFAULTS[type].h,
    binding:{ sheet:'', id:'', field:'' },
    fs: type==='titre' ? 26 : 13,
    bold: type==='titre',
  };
  page.blocs.push(b);
  cbSelId = b.id;
  cbRendreCanvas();
  cbRendreProps();
  document.getElementById('cb-canvas-vide').style.display = 'none';
}

function cbSupprimerBlocSelectionne() {
  if (!cbSelId) return;
  const page = cbPages[cbPageIndex];
  if (!page) return;
  page.blocs = page.blocs.filter(b => b.id !== cbSelId);
  cbSelId = null;
  cbRendreCanvas();
  cbRendreProps();
}

function cbRendreVueLivre() {
  const wrap = document.getElementById('cb-canvas-wrap');
  if (!wrap) return;
  let voisin = document.getElementById('cb-canvas-voisin');

  // Page voisine (gauche si page paire, droite si page impaire)
  const indexVoisin = cbPageIndex % 2 === 0 ? cbPageIndex - 1 : cbPageIndex + 1;
  const pageVoisine = cbPages[indexVoisin];

  if (!pageVoisine) {
    // Pas de voisin — affichage simple
    if (voisin) voisin.style.display = 'none';
    return;
  }

  // Créer ou réutiliser le canvas voisin
  if (!voisin) {
    voisin = document.createElement('div');
    voisin.id = 'cb-canvas-voisin';
    voisin.className = 'cb-canvas cb-canvas-voisin';
    voisin.style.cssText = `width:${CB_W}px;height:${CB_H}px;cursor:pointer`;
    voisin.onclick = () => cbAllerPage(indexVoisin);
    // Placer avant ou après selon parité
    if (cbPageIndex % 2 === 0) wrap.insertBefore(voisin, document.getElementById('cb-canvas'));
    else wrap.appendChild(voisin);
  }

  voisin.style.display = '';
  voisin.onclick = () => cbAllerPage(indexVoisin);

  // Remplir le canvas voisin avec les blocs de la page voisine
  voisin.querySelectorAll('.cb-bloc').forEach(el => el.remove());
  const vide = voisin.querySelector('.cb-canvas-vide');
  if (vide) vide.remove();

  if (!pageVoisine.blocs || pageVoisine.blocs.length === 0) {
    const ph = document.createElement('div');
    ph.className = 'cb-canvas-vide';
    ph.style.display = 'flex';
    ph.textContent = pageVoisine.name || ('Page ' + (indexVoisin + 1));
    voisin.appendChild(ph);
    return;
  }

  pageVoisine.blocs.forEach(b => {
    const el = document.createElement('div');
    el.className = 'cb-bloc';
    el.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;cursor:pointer`;
    const val = cbResoudreBinding(b.binding);
    if (b.type === 'image') {
      el.innerHTML = val
        ? `<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">`
        : `<div class="cb-placeholder">⬜ Image</div>`;
    } else if (b.type === 'couleur') {
      el.style.background = val || '#e5900a';
    } else {
      el.innerHTML = `<div class="cb-bloc-texte" style="font-size:${b.fs}px;font-weight:${b.bold?'bold':'normal'}">${val || ''}</div>`;
    }
    voisin.appendChild(el);
  });
}

function cbGetPage() { return cbPages[cbPageIndex] || null; }
function cbGetBloc() { return cbGetPage()?.blocs.find(b => b.id === cbSelId) || null; }

// ── Rendu ────────────────────────────────────────────────────────────────────
function cbRendreInterface() {
  cbRendrePagesListe();
  cbRendreCanvas();
  cbRendreProps();
}

function cbRendrePagesListe() {
  const cont = document.getElementById('cb-liste-pages');
  if (!cont) return;
  cont.innerHTML = '';
  cbPages.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'cb-palette-btn' + (i === cbPageIndex ? ' cb-palette-btn-actif' : '');
    btn.textContent = p.name || ('Page '+(i+1));
    btn.onclick = () => cbAllerPage(i);
    cont.appendChild(btn);
  });
  const inp = document.getElementById('cb-page-nom');
  if (inp && cbPages[cbPageIndex]) inp.value = cbPages[cbPageIndex].name || '';
}

function cbRendreCanvas() {
  const canvas = document.getElementById('cb-canvas');
  const vide   = document.getElementById('cb-canvas-vide');
  if (!canvas) return;
  canvas.querySelectorAll('.cb-bloc').forEach(el => el.remove());
  cbRendreVueLivre();

  const page = cbGetPage();
  if (!page || page.blocs.length === 0) {
    if (vide) vide.style.display = 'flex';
    document.getElementById('cb-btn-supprimer-bloc').style.display = 'none';
    return;
  }
  if (vide) vide.style.display = 'none';

  page.blocs.forEach(b => {
    const el = document.createElement('div');
    el.className  = 'cb-bloc' + (b.id === cbSelId ? ' cb-bloc-sel' : '');
    el.dataset.id = b.id;
    el.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;

    const val = cbResoudreBinding(b.binding);

    if (b.type === 'image') {
      el.innerHTML = val
        ? `<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">`
        : `<div class="cb-placeholder">⬜ Image</div>`;
    } else if (b.type === 'couleur') {
      el.style.background = val || '#e5900a';
    } else {
      el.innerHTML = `<div class="cb-bloc-texte" style="font-size:${b.fs}px;font-weight:${b.bold?'bold':'normal'}">${
        val || `<span class="cb-placeholder-txt">${b.type==='titre'?'Titre…':'Texte…'}</span>`
      }</div>`;
    }

    if (b.id === cbSelId) {
      const rz = document.createElement('div');
      rz.className = 'cb-resize-handle';
      rz.dataset.resize = b.id;
      el.appendChild(rz);
    }

    canvas.appendChild(el);
  });

  document.getElementById('cb-btn-supprimer-bloc').style.display = cbSelId ? '' : 'none';
}

function cbRendreProps() {
  const bloc = cbGetBloc();
  const vide = document.getElementById('cb-props-vide');
  const cont = document.getElementById('cb-props-contenu');
  if (!bloc) {
    if (vide) vide.style.display = '';
    if (cont) cont.style.display = 'none';
    return;
  }
  if (vide) vide.style.display = 'none';
  if (cont) cont.style.display = '';

  document.getElementById('cb-props-type-label').textContent = 'Bloc · ' + bloc.type;
  document.getElementById('cb-src-sheet').value = bloc.binding.sheet || '';
  cbRendreIdSelect(bloc.binding.sheet, bloc.binding.id);
  cbRendreFieldSelect(bloc.binding.sheet, bloc.binding.field);
  cbRendreApercu(bloc.binding);

  document.getElementById('cb-dim-w').value = Math.round(bloc.w);
  document.getElementById('cb-dim-h').value = Math.round(bloc.h);
  document.getElementById('cb-dim-x').value = Math.round(bloc.x);
  document.getElementById('cb-dim-y').value = Math.round(bloc.y);

  const typo = document.getElementById('cb-typo-zone');
  if (typo) typo.style.display = (bloc.type==='titre'||bloc.type==='texte') ? '' : 'none';
  if (bloc.type==='titre'||bloc.type==='texte') {
    document.getElementById('cb-typo-size').value = bloc.fs || 13;
    const btn = document.getElementById('cb-typo-bold-btn');
    if (btn) { btn.style.background = bloc.bold ? '#2d7a50' : ''; btn.style.color = bloc.bold ? '#fff' : ''; }
  }
}

function cbRendreIdSelect(sheet, selId) {
  const grp = document.getElementById('cb-src-id-groupe');
  const sel = document.getElementById('cb-src-id');
  if (!grp||!sel) return;
  if (!sheet) { grp.style.display='none'; return; }
  grp.style.display = '';
  const items   = cbData ? (cbData[sheet]||[]) : [];
  const idField = CB_SHEETS[sheet]?.idField;
  sel.innerHTML = '<option value="">— Choisir —</option>';
  items.forEach(it => {
    const opt = document.createElement('option');
    opt.value = it[idField];
    opt.textContent = (it.nom||it[idField]) + ' · ' + it[idField];
    if (it[idField] === selId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function cbRendreFieldSelect(sheet, selField) {
  const grp = document.getElementById('cb-src-field-groupe');
  const sel = document.getElementById('cb-src-field');
  if (!grp||!sel) return;
  const idVal = document.getElementById('cb-src-id')?.value;
  if (!sheet||!idVal) { grp.style.display='none'; return; }
  grp.style.display = '';
  sel.innerHTML = '<option value="">— Choisir —</option>';
  (CB_SHEETS[sheet]?.fields||[]).forEach(f => {
    const opt = document.createElement('option');
    opt.value = f; opt.textContent = f;
    if (f === selField) opt.selected = true;
    sel.appendChild(opt);
  });
}

function cbRendreApercu(binding) {
  const zone = document.getElementById('cb-apercu-zone');
  const val  = document.getElementById('cb-apercu-val');
  if (!zone||!val) return;
  const v = cbResoudreBinding(binding);
  if (!v) { zone.style.display='none'; return; }
  zone.style.display = '';
  const bloc = cbGetBloc();
  if (bloc?.type==='image')   val.innerHTML = `<img src="${v}" style="width:100%;border-radius:4px;max-height:70px;object-fit:cover">`;
  else if (bloc?.type==='couleur') val.innerHTML = `<div style="height:24px;border-radius:4px;background:${v}">&nbsp;</div>`;
  else val.textContent = v;
}

// ── Événements propriétés ────────────────────────────────────────────────────
function cbOnChangeSheet() {
  const sheet = document.getElementById('cb-src-sheet').value;
  const bloc  = cbGetBloc();
  if (bloc) bloc.binding = { sheet, id:'', field:'' };
  cbRendreIdSelect(sheet, '');
  cbRendreFieldSelect(sheet, '');
  document.getElementById('cb-apercu-zone').style.display = 'none';
  cbRendreCanvas();
}

function cbOnChangeId() {
  const id   = document.getElementById('cb-src-id').value;
  const sheet= document.getElementById('cb-src-sheet').value;
  const bloc = cbGetBloc();
  if (bloc) { bloc.binding.id=id; bloc.binding.field=''; }
  cbRendreFieldSelect(sheet, '');
  document.getElementById('cb-apercu-zone').style.display = 'none';
  cbRendreCanvas();
}

function cbOnChangeField() {
  const field = document.getElementById('cb-src-field').value;
  const bloc  = cbGetBloc();
  if (bloc) bloc.binding.field = field;
  cbRendreApercu(bloc?.binding);
  cbRendreCanvas();
}

function cbUpdateDim() {
  const b = cbGetBloc();
  if (!b) return;
  b.w = parseInt(document.getElementById('cb-dim-w').value)||b.w;
  b.h = parseInt(document.getElementById('cb-dim-h').value)||b.h;
  b.x = parseInt(document.getElementById('cb-dim-x').value)||0;
  b.y = parseInt(document.getElementById('cb-dim-y').value)||0;
  cbRendreCanvas();
}

function cbUpdateTypo() {
  const b = cbGetBloc();
  if (!b) return;
  b.fs = parseInt(document.getElementById('cb-typo-size').value)||b.fs;
  cbRendreCanvas();
}

function cbToggleBold() {
  const b = cbGetBloc();
  if (!b) return;
  b.bold = !b.bold;
  cbRendreCanvas();
  cbRendreProps();
}

// ── Drag & Resize ────────────────────────────────────────────────────────────
function cbCanvasClick(e) {
  const canvas = document.getElementById('cb-canvas');
  const rect   = canvas.getBoundingClientRect();
  const sc     = CB_W / rect.width;

  if (e.target.dataset.resize) {
    const b = cbGetPage()?.blocs.find(b => b.id===e.target.dataset.resize);
    if (b) cbResizing = { id:b.id, startX:(e.clientX-rect.left)*sc, startY:(e.clientY-rect.top)*sc, startW:b.w, startH:b.h };
    return;
  }
  const blocEl = e.target.closest('.cb-bloc');
  if (blocEl) {
    const b = cbGetPage()?.blocs.find(b => b.id===blocEl.dataset.id);
    if (b) {
      cbSelId = b.id;
      cbDragging = { id:b.id, ox:(e.clientX-rect.left)*sc-b.x, oy:(e.clientY-rect.top)*sc-b.y };
      cbRendreCanvas();
      cbRendreProps();
    }
    return;
  }
  cbDeselectionner();
}

function cbGlobalMouseMove(e) {
  const canvas = document.getElementById('cb-canvas');
  if (!canvas||(!cbDragging&&!cbResizing)) return;
  const rect = canvas.getBoundingClientRect();
  const sc   = CB_W / rect.width;
  const mx   = (e.clientX-rect.left)*sc;
  const my   = (e.clientY-rect.top)*sc;

  if (cbDragging) {
    const b = cbGetPage()?.blocs.find(b=>b.id===cbDragging.id);
    if (b) {
      b.x = Math.max(0, Math.min(CB_W-20, mx-cbDragging.ox));
      b.y = Math.max(0, Math.min(CB_H-20, my-cbDragging.oy));
      cbRendreCanvas();
      document.getElementById('cb-dim-x').value = Math.round(b.x);
      document.getElementById('cb-dim-y').value = Math.round(b.y);
    }
  }
  if (cbResizing) {
    const b = cbGetPage()?.blocs.find(b=>b.id===cbResizing.id);
    if (b) {
      b.w = Math.max(40, cbResizing.startW+mx-cbResizing.startX);
      b.h = Math.max(20, cbResizing.startH+my-cbResizing.startY);
      cbRendreCanvas();
      document.getElementById('cb-dim-w').value = Math.round(b.w);
      document.getElementById('cb-dim-h').value = Math.round(b.h);
    }
  }
}

function cbGlobalMouseUp() { cbDragging=null; cbResizing=null; }

function cbDeselectionner() {
  cbSelId = null;
  cbRendreCanvas();
  cbRendreProps();
}

// ── Résoudre binding ─────────────────────────────────────────────────────────
function cbResoudreBinding(binding) {
  if (!binding?.sheet||!binding?.id||!binding?.field) return null;
  const items   = cbData ? (cbData[binding.sheet]||[]) : [];
  const idField = CB_SHEETS[binding.sheet]?.idField;
  const item    = items.find(i => i[idField]===binding.id);
  return item ? (item[binding.field]||null) : null;
}

// ── Impression ───────────────────────────────────────────────────────────────
function cbImprimerPage() {
  const canvas = document.getElementById('cb-canvas');
  if (!canvas) return;
  const clone = canvas.cloneNode(true);
  clone.querySelectorAll('.cb-resize-handle').forEach(el=>el.remove());
  clone.querySelectorAll('.cb-bloc').forEach(el=>{ el.classList.remove('cb-bloc-sel'); el.style.outline='none'; });

  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>${cbGetPage()?.name||'Catalogue'}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      @page{size:A4;margin:0}
      body{width:595px}
      .cb-canvas{position:relative;width:595px;height:842px;background:#fff}
      .cb-bloc{position:absolute;overflow:hidden}
      .cb-bloc-texte{padding:6px 8px;line-height:1.5;overflow:hidden;height:100%}
      img{display:block}
    </style>
  </head><body>${clone.outerHTML}</body></html>`);
  win.document.close();
  setTimeout(()=>win.print(), 400);
}

// ── Styles CSS ───────────────────────────────────────────────────────────────
function cbInjectStyles() {
  if (document.getElementById('cb-styles')) return;
  const s = document.createElement('style');
  s.id = 'cb-styles';
  s.textContent = `
    #cb-layout { display:flex; gap:0; height:calc(100vh - 200px); min-height:550px; border:1px solid #e8e8e8; border-radius:10px; overflow:hidden; background:#f5f5f5; margin-top:16px; }
    .cb-palette { width:148px; background:#1e1e2e; padding:12px 10px; display:flex; flex-direction:column; gap:5px; flex-shrink:0; overflow-y:auto; }
    .cb-section-titre { color:#ffffff55; font-size:10px; font-weight:700; letter-spacing:1px; margin:6px 0 3px; }
    .cb-palette-sep { border-top:1px solid #333; margin:8px 0; }
    .cb-palette-btn { background:#2d2d44; border:none; border-radius:7px; padding:8px 10px; cursor:pointer; color:#fff; font-size:12px; text-align:left; transition:background .15s; }
    .cb-palette-btn:hover { background:#3d3d60; }
    .cb-palette-btn-actif { background:#2d7a50 !important; }
    .cb-palette-btn-new { border:1px dashed #555; background:transparent; color:#888; margin-top:4px; }
    .cb-palette-btn-new:hover { background:#2d2d44; color:#fff; }
    .cb-canvas-zone { flex:1; display:flex; flex-direction:column; overflow:hidden; }
    .cb-canvas-toolbar { background:#fff; border-bottom:1px solid #e5e5e5; padding:10px 14px; display:flex; align-items:center; gap:10px; flex-shrink:0; }
    .cb-canvas-wrap { flex:1; overflow:auto; display:flex; justify-content:center; align-items:flex-start; padding:24px; background:#e0e0e0; gap:4px; }
.cb-canvas-voisin { opacity:0.6; transition:opacity .2s; }
.cb-canvas-voisin:hover { opacity:0.85; }
    .cb-canvas { width:595px; height:842px; background:#fff; position:relative; box-shadow:0 4px 28px rgba(0,0,0,.2); flex-shrink:0; user-select:none; }
    .cb-canvas-vide { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:13px; pointer-events:none; }
    .cb-bloc { position:absolute; cursor:grab; box-sizing:border-box; outline:1px dashed rgba(0,0,0,.12); overflow:hidden; }
    .cb-bloc:active { cursor:grabbing; }
    .cb-bloc-sel { outline:2px solid #2d7a50 !important; }
    .cb-bloc-texte { padding:6px 8px; line-height:1.5; overflow:hidden; height:100%; color:#1a1a1a; }
    .cb-placeholder { width:100%; height:100%; background:#f0ede8; display:flex; align-items:center; justify-content:center; color:#bbb; font-size:12px; gap:6px; }
    .cb-placeholder-txt { color:#ccc; font-style:italic; }
    .cb-resize-handle { position:absolute; bottom:-4px; right:-4px; width:10px; height:10px; background:#2d7a50; border-radius:2px; cursor:se-resize; z-index:10; }
    .cb-props { width:248px; background:#fff; border-left:1px solid #e8e8e8; padding:14px; overflow-y:auto; flex-shrink:0; }
  `;
  document.head.appendChild(s);
}

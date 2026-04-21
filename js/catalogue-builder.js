/* ════════════════════════════════════════
   CATALOGUE BUILDER — catalogue-builder.js
   Version 3.0
   ════════════════════════════════════════ */

const CB_W     = 816;
const CB_H     = 1056;
const CB_MARGE = 48;

const CB_FIELDS = {
  Collections_v2: ['nom','slogan','description','couleur_hex','photo_url'],
  Gammes_v2:      ['nom','description','couleur_hex','photo_url'],
  Familles_v2:    ['nom','description','couleur_hex'],
  Produits_v2:    ['nom','description','couleur_hex','image_url','desc_emballage','slogan_collection'],
  Contenu_v2:     ['valeur'],
  Mediatheque_v2: ['url','nom','categorie'],
  Images_Locales_v2: ['chemin','description'],
};

const CB_DEFAULTS = {
  titre:   { w:500, h:70  },
  texte:   { w:500, h:160 },
  image:   { w:300, h:220 },
  couleur: { w:200, h:60  },
};

// ─── ÉTAT ────────────────────────────────────────────────────────────────────
let cbData      = null;
let cbPages     = [];
let cbPageIndex = 0;
let cbSelId     = null;
let cbDragging  = null;
let cbResizing  = null;
let cbInited    = false;
let cbBlocCopie = null;
let cbIdCnt     = 0;
const cbGenId   = () => 'cb' + Date.now() + '_' + (++cbIdCnt);

// ─── POINT D'ENTRÉE ──────────────────────────────────────────────────────────
async function cbOnAfficher() {
  if (cbInited) { cbRendreInterface(); return; }
  cbInited = true;
  cbInjectStyles();

  try {
    const [rCat, rGam, rFam, rCont, rMed, rImg] = await Promise.all([
      appelAPI('getCatalogue'),
      appelAPI('getGammes'),
      appelAPI('getFamilles'),
      appelAPI('getContenu'),
      appelAPI('getMediatheque'),
      appelAPI('getImagesLocales'),
    ]);
    const cols = rCat && rCat.success
      ? Object.entries(rCat.infoCollections||{}).map(([id,v])=>({col_id:id,...v}))
      : [];
    const contenu = rCont && rCont.success
      ? Object.entries(rCont.contenu||{}).map(([cle,valeur])=>({cle,valeur}))
      : [];
    cbData = {
      Collections_v2:    cols,
      Gammes_v2:         rGam && rGam.success  ? rGam.items    : [],
      Familles_v2:       rFam && rFam.success  ? rFam.items    : [],
      Produits_v2:       rCat && rCat.success  ? rCat.produits : [],
      Contenu_v2:        contenu,
      Mediatheque_v2:    rMed && rMed.success  ? rMed.items    : [],
      Images_Locales_v2: rImg && rImg.success  ? rImg.items    : [],
    };
  } catch(e) {
    console.error('CB init:', e);
    cbData = {Collections_v2:[],Gammes_v2:[],Familles_v2:[],Produits_v2:[],Contenu_v2:[],Mediatheque_v2:[],Images_Locales_v2:[]};
  }

  window.addEventListener('mousemove', cbGlobalMouseMove);
  window.addEventListener('mouseup',   cbGlobalMouseUp);

  document.getElementById('cb-chargement').style.display = 'none';
  document.getElementById('cb-layout').style.display     = 'flex';

  await cbChargerPages();
  if (!cbPages.length) cbNouvellePageCatalogue();
  else cbRendreInterface();
}

// ─── SAUVEGARDE / CHARGEMENT ─────────────────────────────────────────────────
async function cbChargerPages() {
  try {
    const res = await appelAPI('getCataloguePages');
    if (!res||!res.success||!res.items||!res.items.length) return;
    cbPages = res.items.map(p=>({
      id:      p.page_id,
      name:    p.nom,
      col_id:  p.col_id||'',
      est_toc: p.est_toc==='1'||p.est_toc===true,
      blocs:   JSON.parse(p.blocs_json||'[]'),
    }));
    cbPageIndex = 0;
  } catch(e) { console.error('cbChargerPages:', e); }
}

async function cbSauvegarderPage(idx) {
  const i    = idx !== undefined ? idx : cbPageIndex;
  const page = cbPages[i];
  if (!page) return;
  try {
    await appelAPIPost('saveCataloguePage', {
      page_id:    page.id,
      nom:        page.name,
      ordre:      i + 1,
      col_id:     page.col_id||'',
      est_toc:    page.est_toc ? '1':'0',
      blocs_json: JSON.stringify(page.blocs),
    });
  } catch(e) { console.error('cbSauvegarderPage:', e); }
}

async function cbSupprimerPageAPI(page_id) {
  try { await appelAPIPost('deleteCataloguePage', {page_id}); }
  catch(e) { console.error('cbSupprimerPageAPI:', e); }
}

// ─── PAGES ───────────────────────────────────────────────────────────────────
function cbNouvellePageCatalogue() {
  const p = {id:cbGenId(), name:'Page '+(cbPages.length+1), col_id:'', blocs:[], est_toc:false};
  cbPages.push(p);
  cbPageIndex = cbPages.length - 1;
  cbVerifierMultiple4();
  cbRendreInterface();
  cbSauvegarderPage();
}

function cbSupprimerPage() {
  const page = cbPages[cbPageIndex];
  if (!page) return;
  if (!confirm('Supprimer "' + (page.name||'cette page') + '" ?')) return;
  cbSupprimerPageAPI(page.id);
  cbPages.splice(cbPageIndex, 1);
  cbPageIndex = Math.max(0, Math.min(cbPageIndex, cbPages.length-1));
  cbSelId = null;
  cbVerifierMultiple4();
  if (!cbPages.length) cbNouvellePageCatalogue();
  else cbRendreInterface();
}

function cbAllerPage(idx) {
  if (idx < 0 || idx >= cbPages.length) return;
  cbPageIndex = idx;
  cbSelId = null;
  cbRendreInterface();
}

function cbRenommerPage(nom) {
  if (!cbPages[cbPageIndex]) return;
  cbPages[cbPageIndex].name = nom;
  cbRendrePagesListe();
  cbSauvegarderPage();
}

function cbAssignerCollection(col_id) {
  if (!cbPages[cbPageIndex]) return;
  cbPages[cbPageIndex].col_id = col_id;
  cbSauvegarderPage();
  cbRendrePagesListe();
}

function cbVerifierMultiple4() {
  const n   = cbPages.length;
  const msg = document.getElementById('msg-catalogue-builder');
  if (!msg) return;
  if (n > 0 && n % 4 !== 0) {
    const manquantes = 4 - (n % 4);
    msg.innerHTML = `⚠ <strong>${n} pages</strong> — il manque <strong>${manquantes} page(s)</strong> pour un multiple de 4 (impression recto-verso).`;
    msg.className = 'msg-zone msg-avertissement';
    msg.style.display = '';
  } else {
    msg.style.display = 'none';
  }
}

function cbNomCollection(col_id) {
  return (cbData?.Collections_v2||[]).find(c=>c.col_id===col_id)?.nom||'';
}

// ─── BLOCS ───────────────────────────────────────────────────────────────────
function cbAjouterBloc(type) {
  const page = cbPages[cbPageIndex];
  if (!page) return;
  const b = {
    id:cbGenId(), type,
    x: CB_MARGE + 20, y: CB_MARGE + 20,
    w: CB_DEFAULTS[type].w, h: CB_DEFAULTS[type].h,
    binding: {sheet:'', col_id:'', gam_id:'', fam_id:'', id:'', field:''},
    fs:     type==='titre' ? 28 : 13,
    bold:   type==='titre',
    italic: false,
    police: type==='titre' ? 'Playfair Display' : 'DM Sans',
    couleur_texte: '#1a1a1a',
    couleur_libre: '#e5900a',
    opacite: 1,
  };
  page.blocs.push(b);
  cbSelId = b.id;
  document.getElementById('cb-canvas-vide').style.display = 'none';
  cbRendreCanvas();
  cbRendreProps();
  cbSauvegarderPage();
}

function cbSupprimerBlocSelectionne() {
  if (!cbSelId) return;
  const page = cbPages[cbPageIndex];
  if (!page) return;
  page.blocs = page.blocs.filter(b=>b.id!==cbSelId);
  cbSelId = null;
  cbRendreCanvas();
  cbRendreProps();
  cbRendreCalques();
  cbSauvegarderPage();
}

function cbMonterBloc() {
  const page = cbGetPage();
  if (!page||!cbSelId) return;
  const idx = page.blocs.findIndex(b=>b.id===cbSelId);
  if (idx <= 0) return;
  [page.blocs[idx], page.blocs[idx-1]] = [page.blocs[idx-1], page.blocs[idx]];
  cbRendreCanvas();
  cbSauvegarderPage();
}

function cbDescendreBloc() {
  const page = cbGetPage();
  if (!page||!cbSelId) return;
  const idx = page.blocs.findIndex(b=>b.id===cbSelId);
  if (idx < 0 || idx >= page.blocs.length-1) return;
  [page.blocs[idx], page.blocs[idx+1]] = [page.blocs[idx+1], page.blocs[idx]];
  cbRendreCanvas();
  cbSauvegarderPage();
}

function cbCopierBloc() {
  const b = cbGetBloc();
  if (!b) return;
  cbBlocCopie = JSON.parse(JSON.stringify(b));
  document.getElementById('cb-btn-coller').style.display = '';
}

function cbCollerBloc() {
  if (!cbBlocCopie) return;
  const page = cbGetPage();
  if (!page) return;
  const nouveau = JSON.parse(JSON.stringify(cbBlocCopie));
  nouveau.id = cbGenId();
  nouveau.x  = Math.min(nouveau.x + 20, CB_W - 40);
  nouveau.y  = Math.min(nouveau.y + 20, CB_H - 40);
  page.blocs.push(nouveau);
  cbSelId = nouveau.id;
  cbRendreCanvas();
  cbRendreProps();
  cbSauvegarderPage();
}

function cbGetPage() { return cbPages[cbPageIndex]||null; }
function cbGetBloc() { return cbGetPage()?.blocs.find(b=>b.id===cbSelId)||null; }

// ─── RENDU INTERFACE ─────────────────────────────────────────────────────────
function cbRendreInterface() {
  cbRendrePagesListe();
  cbRendreCanvas();
  cbRendreProps();
  cbRendreCalques();
  cbVerifierMultiple4();
}

function cbRendrePagesListe() {
  const cont = document.getElementById('cb-liste-pages');
  if (!cont) return;
  cont.innerHTML = '';
  cbPages.forEach((p,i)=>{
    const btn = document.createElement('button');
    btn.className   = 'cb-palette-btn'+(i===cbPageIndex?' cb-palette-btn-actif':'');
    btn.textContent = (i+1)+'. '+(p.name||'Page '+(i+1));
    btn.title       = p.col_id ? cbNomCollection(p.col_id) : '';
    btn.onclick     = ()=>cbAllerPage(i);
    cont.appendChild(btn);
  });

  const inp = document.getElementById('cb-page-nom');
  if (inp && cbPages[cbPageIndex]) inp.value = cbPages[cbPageIndex].name||'';

  const btnTDM = document.getElementById('cb-btn-tdm');
  if (btnTDM) btnTDM.style.display = cbPageIndex === 2 ? '' : 'none';

  const sel = document.getElementById('cb-page-collection');
  if (sel) {
    sel.innerHTML = '<option value="">— Aucune collection —</option>';
    (cbData?.Collections_v2||[]).forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c.col_id;
      opt.textContent = c.nom||c.col_id;
      if (c.col_id===cbPages[cbPageIndex]?.col_id) opt.selected=true;
      sel.appendChild(opt);
    });
  }
}

// ─── RENDU CANVAS ────────────────────────────────────────────────────────────
function cbRendreCanvas() {
  const canvas = document.getElementById('cb-canvas');
  if (!canvas) return;
  canvas.querySelectorAll('.cb-bloc,.cb-pagination,.cb-guide').forEach(el=>el.remove());
  const page = cbGetPage();

  cbRendreGuides(canvas, cbPageIndex);
  cbRendrePaginationSur(canvas, cbPageIndex+1);

  const vide = document.getElementById('cb-canvas-vide');
  if (!page||page.blocs.length===0) {
    if (vide) vide.style.display='flex';
  } else {
    if (vide) vide.style.display='none';
    page.blocs.forEach(b=>canvas.appendChild(cbCreerBlocEl(b,true)));
  }

  cbRendreVoisin();

  const btnS = document.getElementById('cb-btn-supprimer-bloc');
  const btnC = document.getElementById('cb-btn-copier');
  const btnH = document.getElementById('cb-btn-monter');
  const btnB = document.getElementById('cb-btn-descendre');
  if (btnS) btnS.style.display = cbSelId?'':'none';
  if (btnC) btnC.style.display = cbSelId?'':'none';
  if (btnH) btnH.style.display = cbSelId?'':'none';
  if (btnB) btnB.style.display = cbSelId?'':'none';
}

function cbRendreGuides(canvas, idx) {
  const estPaire = idx%2===0;
  const margeG   = estPaire ? 0 : CB_MARGE;
  const margeD   = estPaire ? CB_MARGE : 0;
  const guide    = document.createElement('div');
  guide.className = 'cb-guide';
  guide.style.cssText = `position:absolute;left:${margeG}px;top:${CB_MARGE}px;width:${CB_W-margeG-margeD}px;height:${CB_H-CB_MARGE*2}px;border:1px dashed rgba(99,102,241,0.25);pointer-events:none;box-sizing:border-box;z-index:1`;
  canvas.appendChild(guide);
}

function cbRendrePaginationSur(el, num) {
  if (num < 4) return;
  const traitW = CB_W * 0.6;
  const pg = document.createElement('div');
  pg.className = 'cb-pagination';
  pg.style.cssText = `position:absolute;bottom:18px;right:${CB_MARGE}px;width:${traitW}px;pointer-events:none;z-index:2`;
  pg.innerHTML = `<div style="border-top:1px solid #aaa;width:100%;margin-bottom:4px"></div><div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#888;text-align:left">${num}</div>`;
  el.appendChild(pg);
}

function cbCreerBlocEl(b, actif) {
  const el = document.createElement('div');
  el.className  = 'cb-bloc'+(actif&&b.id===cbSelId?' cb-bloc-sel':'');
  el.dataset.id = b.id;
  el.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;

  const val = b._texte_fixe || b._couleur_fixe || cbResoudreBinding(b.binding);

  if (b.type==='image') {
    el.style.opacity = b.opacite !== undefined ? b.opacite : 1;
    el.innerHTML = val
      ? `<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">`
      : `<div class="cb-placeholder">⬜ Image</div>`;
  } else if (b.type==='couleur') {
    // Couleur libre si pas de binding, sinon valeur du binding
    const couleur = (b.binding?.field && val) ? val : (b.couleur_libre||'#e5900a');
    el.style.background = couleur;
    el.style.opacity    = b.opacite !== undefined ? b.opacite : 1;
  } else {
    const style = `font-size:${b.fs||13}px;font-weight:${b.bold?'bold':'normal'};font-style:${b.italic?'italic':'normal'};font-family:'${b.police||'DM Sans'}',sans-serif;color:${b.couleur_texte||'#1a1a1a'};text-align:${b.align||'left'}`;
    el.innerHTML = `<div class="cb-bloc-texte" style="${style}">${val||`<span class="cb-placeholder-txt">${b.type==='titre'?'Titre…':'Texte…'}</span>`}</div>`;
  }

  if (actif&&b.id===cbSelId) {
    const rz = document.createElement('div');
    rz.className='cb-resize-handle'; rz.dataset.resize=b.id;
    el.appendChild(rz);
  }
  return el;
}

// ─── VUE LIVRE — PAGE VOISINE ────────────────────────────────────────────────
function cbRendreVoisin() {
  document.getElementById('cb-canvas-voisin')?.remove();
  const estPaire    = cbPageIndex%2!==0;
  const indexVoisin = estPaire ? cbPageIndex+1 : cbPageIndex-1;
  const pageVoisine = cbPages[indexVoisin];
  if (!pageVoisine) return;

  const voisin = document.createElement('div');
  voisin.id        = 'cb-canvas-voisin';
  voisin.className = 'cb-canvas cb-canvas-voisin';
  voisin.title     = 'Cliquer pour éditer : '+(pageVoisine.name||'page voisine');
  voisin.onclick   = ()=>cbAllerPage(indexVoisin);

  cbRendreGuides(voisin, indexVoisin);
  cbRendrePaginationSur(voisin, indexVoisin+1);

  if (!pageVoisine.blocs||pageVoisine.blocs.length===0) {
    const ph=document.createElement('div');
    ph.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:13px;pointer-events:none';
    ph.textContent=pageVoisine.name||'Page '+(indexVoisin+1);
    voisin.appendChild(ph);
  } else {
    pageVoisine.blocs.forEach(b=>voisin.appendChild(cbCreerBlocEl(b,false)));
  }

  const canvasActif = document.getElementById('cb-canvas');
  if (estPaire) canvasActif.after(voisin);
  else canvasActif.before(voisin);
}

// ─── PROPRIÉTÉS ──────────────────────────────────────────────────────────────
function cbRendreProps() {
  const bloc = cbGetBloc();
  document.getElementById('cb-props-vide').style.display    = bloc?'none':'';
  document.getElementById('cb-props-contenu').style.display = bloc?'':'none';
  if (!bloc) return;

  document.getElementById('cb-props-type-label').textContent = 'Bloc · '+bloc.type;


  // Onglet
  document.getElementById('cb-src-sheet').value = bloc.binding?.sheet||'';
  const sheet = bloc.binding?.sheet||'';

  // Filtres optionnels
  const colGrp = document.getElementById('cb-src-col-groupe');
  const gamGrp = document.getElementById('cb-src-gam-groupe');
  const famGrp = document.getElementById('cb-src-fam-groupe');
  const montrerCol = ['Gammes_v2','Familles_v2','Produits_v2'].includes(sheet);
  const montrerGam = sheet==='Produits_v2';
  const montrerFam = sheet==='Produits_v2';
  if (colGrp) colGrp.style.display = montrerCol ? '' : 'none';
  if (gamGrp) gamGrp.style.display = montrerGam ? '' : 'none';
  if (famGrp) famGrp.style.display = montrerFam ? '' : 'none';
  if (montrerCol) cbRendreSelCollection(bloc.binding?.col_id||'');
  if (montrerGam) cbRendreSelGamme(bloc.binding?.col_id||'', bloc.binding?.gam_id||'');
  if (montrerFam) cbRendreSelFamille(bloc.binding?.col_id||'', bloc.binding?.fam_id||'');

  // Item + Champ
  if (sheet==='Contenu_v2') {
    document.getElementById('cb-src-id-groupe').style.display = 'none';
    cbRendreSelField(sheet, bloc.binding?.field||'');
  } else {
    cbRendreSelId(bloc.binding);
    cbRendreSelField(sheet, bloc.binding?.field||'');
  }
  cbRendreApercu(bloc.binding);

  document.getElementById('cb-dim-w').value = Math.round(bloc.w);
  document.getElementById('cb-dim-h').value = Math.round(bloc.h);
  document.getElementById('cb-dim-x').value = Math.round(bloc.x);
  document.getElementById('cb-dim-y').value = Math.round(bloc.y);

  const typoZone   = document.getElementById('cb-typo-zone');
  const opacZone   = document.getElementById('cb-opacite-zone');
  const coulZone   = document.getElementById('cb-couleur-libre-zone');
  const imgOpZone  = document.getElementById('cb-image-opacite-zone');

  if (typoZone)  typoZone.style.display  = (bloc.type==='titre'||bloc.type==='texte') ? '' : 'none';
  if (opacZone)  opacZone.style.display  = (bloc.type==='couleur') ? '' : 'none';
  if (coulZone)  coulZone.style.display  = (bloc.type==='couleur') ? '' : 'none';
  if (imgOpZone) imgOpZone.style.display = (bloc.type==='image') ? '' : 'none';

  if (bloc.type==='titre'||bloc.type==='texte') {
    document.getElementById('cb-typo-size').value    = bloc.fs||13;
    document.getElementById('cb-typo-couleur').value = bloc.couleur_texte||'#1a1a1a';
    document.getElementById('cb-typo-police').value  = bloc.police||'DM Sans';
    const bb=document.getElementById('cb-typo-bold-btn');
    const ib=document.getElementById('cb-typo-italic-btn');
    if (bb){ bb.style.background=bloc.bold?'#2d7a50':''; bb.style.color=bloc.bold?'#fff':''; }
    if (ib){ ib.style.background=bloc.italic?'#2d7a50':''; ib.style.color=bloc.italic?'#fff':''; }
    const al=bloc.align||'left';
    ['left','center','right'].forEach(a=>{
      const btn=document.getElementById(`cb-typo-${a==='left'?'left':a==='center'?'center':'right'}-btn`);
      if(btn){btn.style.background=al===a?'#2d7a50':'';btn.style.color=al===a?'#fff':'';}
    });
  }
  if (bloc.type==='couleur') {
    const sl=document.getElementById('cb-opacite-slider');
    const lb=document.getElementById('cb-opacite-label');
    const cl=document.getElementById('cb-couleur-libre-picker');
    if (sl) sl.value=Math.round((bloc.opacite!==undefined?bloc.opacite:1)*100);
    if (lb) lb.textContent=Math.round((bloc.opacite!==undefined?bloc.opacite:1)*100)+'%';
    if (cl) cl.value=bloc.couleur_libre||'#e5900a';
  }
  if (bloc.type==='image') {
    const sl=document.getElementById('cb-image-opacite-slider');
    const lb=document.getElementById('cb-image-opacite-label');
    if (sl) sl.value=Math.round((bloc.opacite!==undefined?bloc.opacite:1)*100);
    if (lb) lb.textContent=Math.round((bloc.opacite!==undefined?bloc.opacite:1)*100)+'%';
  }
}

// ─── SÉLECTEURS EN CASCADE ───────────────────────────────────────────────────
function cbRendreSelCollection(selColId) {
  const sel = document.getElementById('cb-src-col');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Collection (optionnel) —</option>';
  (cbData?.Collections_v2||[]).forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c.col_id; opt.textContent=c.nom||c.col_id;
    if (c.col_id===selColId) opt.selected=true;
    sel.appendChild(opt);
  });
}

function cbRendreSelGamme(col_id, selGamId) {
  const grp=document.getElementById('cb-src-gam-groupe');
  const sel=document.getElementById('cb-src-gam');
  if (!grp||!sel) return;
  const gammes=(cbData?.Gammes_v2||[]).filter(g=>!col_id||g.col_id===col_id);
  grp.style.display = gammes.length ? '' : 'none';
  sel.innerHTML='<option value="">— Gamme (optionnel) —</option>';
  gammes.forEach(g=>{
    const opt=document.createElement('option');
    opt.value=g.gam_id; opt.textContent=g.nom||g.gam_id;
    if (g.gam_id===selGamId) opt.selected=true;
    sel.appendChild(opt);
  });
}

function cbRendreSelFamille(col_id, selFamId) {
  const grp=document.getElementById('cb-src-fam-groupe');
  const sel=document.getElementById('cb-src-fam');
  if (!grp||!sel) return;
  const fams=(cbData?.Familles_v2||[]).filter(f=>!col_id||f.col_id===col_id);
  grp.style.display = fams.length ? '' : 'none';
  sel.innerHTML='<option value="">— Famille (optionnel) —</option>';
  fams.forEach(f=>{
    const opt=document.createElement('option');
    opt.value=f.fam_id; opt.textContent=f.nom||f.fam_id;
    if (f.fam_id===selFamId) opt.selected=true;
    sel.appendChild(opt);
  });
}

function cbRendreSelId(binding) {
  const grp=document.getElementById('cb-src-id-groupe');
  const sel=document.getElementById('cb-src-id');
  const sheetSel=document.getElementById('cb-src-sheet');
  if (!grp||!sel||!sheetSel) return;

  const sheet = sheetSel.value;
  if (!sheet) { grp.style.display='none'; return; }

  let items = cbData?(cbData[sheet]||[]):[];

  // Filtrer selon la cascade
  if (sheet==='Gammes_v2' && binding?.col_id)
    items = items.filter(g=>g.col_id===binding.col_id);
  if (sheet==='Familles_v2' && binding?.col_id)
    items = items.filter(f=>f.col_id===binding.col_id);
  if (sheet==='Produits_v2') {
    if (binding?.col_id) items = items.filter(p=>p.col_id===binding.col_id);
    if (binding?.gam_id) items = items.filter(p=>p.gam_id===binding.gam_id);
    if (binding?.fam_id) items = items.filter(p=>p.fam_id===binding.fam_id);
  }

  grp.style.display = '';
  const idFields = {
    Collections_v2:'col_id', Gammes_v2:'gam_id', Familles_v2:'fam_id',
    Produits_v2:'pro_id', Contenu_v2:'cle', Mediatheque_v2:'rowIndex', Images_Locales_v2:'nom'
  };
  const idField = idFields[sheet]||'id';

  sel.innerHTML='<option value="">— Choisir —</option>';
  items.forEach(it=>{
    const id=String(it[idField]||'');
    // Afficher nom lisible selon le type
    let label = it.nom || it.cle || it.url || id;
    // Pour les produits, ajouter la collection
    if (sheet==='Produits_v2' && it.nom_collection) label = it.nom_collection+' — '+it.nom;
    if (sheet==='Gammes_v2') {
      const col=(cbData?.Collections_v2||[]).find(c=>c.col_id===it.col_id);
      if (col) label = col.nom+' — '+it.nom;
    }
    const opt=document.createElement('option');
    opt.value=id; opt.textContent=label.length>50?label.slice(0,50)+'…':label;
    if (id===binding?.id) opt.selected=true;
    sel.appendChild(opt);
  });
}

function cbRendreSelField(sheet, selField) {
  const grp=document.getElementById('cb-src-field-groupe');
  const sel=document.getElementById('cb-src-field');
  if (!grp||!sel) return;
  const idVal=document.getElementById('cb-src-id')?.value;
  if (!sheet||!idVal){grp.style.display='none';return;}
  grp.style.display='';
  sel.innerHTML='<option value="">— Choisir un champ —</option>';
  (CB_FIELDS[sheet]||[]).forEach(f=>{
    const opt=document.createElement('option');
    opt.value=f; opt.textContent=f;
    if (f===selField) opt.selected=true;
    sel.appendChild(opt);
  });
}

function cbRendreApercu(binding) {
  const zone=document.getElementById('cb-apercu-zone');
  const val=document.getElementById('cb-apercu-val');
  if (!zone||!val) return;
  const v=cbResoudreBinding(binding);
  if (!v){zone.style.display='none';return;}
  zone.style.display='';
  const bloc=cbGetBloc();
  if (bloc?.type==='image'||(typeof v==='string'&&/\.(jpg|jpeg|png|gif|webp)/i.test(v)))
    val.innerHTML=`<img src="${v}" style="width:100%;border-radius:4px;max-height:80px;object-fit:cover">`;
  else if (bloc?.type==='couleur')
    val.innerHTML=`<div style="height:26px;border-radius:4px;background:${v}">&nbsp;</div>`;
  else
    val.textContent=String(v).slice(0,200);
}

// ─── ÉVÉNEMENTS PROPRIÉTÉS ───────────────────────────────────────────────────
function cbOnChangeCollection() {
  const col_id=document.getElementById('cb-src-col').value;
  const bloc=cbGetBloc();
  if (bloc) { bloc.binding.col_id=col_id; bloc.binding.gam_id=''; bloc.binding.fam_id=''; bloc.binding.id=''; bloc.binding.field=''; }
  cbRendreSelGamme(col_id,'');
  cbRendreSelFamille(col_id,'');
  cbRendreSelId(bloc?.binding||{});
  cbRendreSelField('','');
  document.getElementById('cb-apercu-zone').style.display='none';
  cbRendreCanvas();
}

function cbOnChangeGamme() {
  const gam_id=document.getElementById('cb-src-gam').value;
  const bloc=cbGetBloc();
  if (bloc) { bloc.binding.gam_id=gam_id; bloc.binding.id=''; bloc.binding.field=''; }
  cbRendreSelId(bloc?.binding||{});
  cbRendreSelField('','');
  document.getElementById('cb-apercu-zone').style.display='none';
  cbRendreCanvas();
}

function cbOnChangeFamille() {
  const fam_id=document.getElementById('cb-src-fam').value;
  const bloc=cbGetBloc();
  if (bloc) { bloc.binding.fam_id=fam_id; bloc.binding.id=''; bloc.binding.field=''; }
  cbRendreSelId(bloc?.binding||{});
  cbRendreSelField('','');
  document.getElementById('cb-apercu-zone').style.display='none';
  cbRendreCanvas();
}

function cbOnChangeSheet() {
  const sheet = document.getElementById('cb-src-sheet').value;
  const bloc  = cbGetBloc();
  if (bloc) bloc.binding = {...bloc.binding, sheet, id:'', field:''};

  // Filtres optionnels selon l'onglet
  const colGrp = document.getElementById('cb-src-col-groupe');
  const gamGrp = document.getElementById('cb-src-gam-groupe');
  const famGrp = document.getElementById('cb-src-fam-groupe');
  const montrerCol = ['Gammes_v2','Familles_v2','Produits_v2'].includes(sheet);
  const montrerGam = sheet === 'Produits_v2';
  const montrerFam = sheet === 'Produits_v2';
  if (colGrp) colGrp.style.display = montrerCol ? '' : 'none';
  if (gamGrp) gamGrp.style.display = montrerGam ? '' : 'none';
  if (famGrp) famGrp.style.display = montrerFam ? '' : 'none';

  if (montrerCol) cbRendreSelCollection(bloc?.binding?.col_id||'');

  // Contenu_v2 — pas d'item, champ direct
  if (sheet === 'Contenu_v2') {
    document.getElementById('cb-src-id-groupe').style.display = 'none';
    cbRendreSelField(sheet, bloc?.binding?.field||'');
  } else {
    cbRendreSelId(bloc?.binding||{sheet});
    cbRendreSelField('', '');
  }

  document.getElementById('cb-apercu-zone').style.display = 'none';
  cbRendreCanvas();
}

function cbOnChangeId() {
  const id=document.getElementById('cb-src-id').value;
  const sheet=document.getElementById('cb-src-sheet').value;
  const bloc=cbGetBloc();
  if (bloc){bloc.binding.id=id;bloc.binding.field='';}
  cbRendreSelField(sheet,'');
  document.getElementById('cb-apercu-zone').style.display='none';
  cbRendreCanvas();
}

function cbOnChangeField() {
  const field=document.getElementById('cb-src-field').value;
  const bloc=cbGetBloc();
  if (bloc) bloc.binding.field=field;
  cbRendreApercu(bloc?.binding);
  cbRendreCanvas();
  cbSauvegarderPage();
}

function cbUpdateDim() {
  const b=cbGetBloc(); if (!b) return;
  b.w=parseInt(document.getElementById('cb-dim-w').value)||b.w;
  b.h=parseInt(document.getElementById('cb-dim-h').value)||b.h;
  b.x=parseInt(document.getElementById('cb-dim-x').value)||0;
  b.y=parseInt(document.getElementById('cb-dim-y').value)||0;
  cbRendreCanvas(); cbSauvegarderPage();
}

function cbUpdateTypo() {
  const b=cbGetBloc(); if (!b) return;
  b.fs            = parseInt(document.getElementById('cb-typo-size').value)||b.fs;
  b.couleur_texte = document.getElementById('cb-typo-couleur').value||b.couleur_texte;
  b.police        = document.getElementById('cb-typo-police').value||b.police;
  cbRendreCanvas(); cbSauvegarderPage();
}

function cbToggleBold()   { const b=cbGetBloc();if(!b)return;b.bold=!b.bold;cbRendreCanvas();cbRendreProps();cbSauvegarderPage(); }
function cbToggleItalic() { const b=cbGetBloc();if(!b)return;b.italic=!b.italic;cbRendreCanvas();cbRendreProps();cbSauvegarderPage(); }

function cbSetAlign(align) {
  const b=cbGetBloc(); if(!b) return;
  b.align=align;
  cbRendreCanvas();
  cbRendreProps();
  cbSauvegarderPage();
}

function cbUpdateOpacite(val) {
  const b=cbGetBloc(); if (!b) return;
  b.opacite=parseFloat(val)/100;
  document.getElementById('cb-opacite-label').textContent=val+'%';
  cbRendreCanvas(); cbSauvegarderPage();
}

function cbUpdateImageOpacite(val) {
  const b=cbGetBloc(); if (!b) return;
  b.opacite=parseFloat(val)/100;
  document.getElementById('cb-image-opacite-label').textContent=val+'%';
  cbRendreCanvas(); cbSauvegarderPage();
}

function cbUpdateCouleurLibre(val) {
  const b=cbGetBloc(); if (!b) return;
  b.couleur_libre=val;
  cbRendreCanvas(); cbSauvegarderPage();
}

function cbDeselectionner() { cbSelId=null; cbRendreCanvas(); cbRendreProps(); cbRendreCalques(); }

// ─── CALQUES ─────────────────────────────────────────────────────────────────
function cbRendreCalques() {
  const cont = document.getElementById('cb-calques-liste');
  if (!cont) return;
  const page = cbGetPage();
  cont.innerHTML = '';
  if (!page||!page.blocs.length) {
    cont.innerHTML = '<div style="color:#ccc;font-size:11px;text-align:center;padding:8px">Aucun bloc</div>';
    return;
  }

  // Afficher en ordre inverse (dernier = au-dessus)
  [...page.blocs].reverse().forEach((b, iRev) => {
    const iReel = page.blocs.length - 1 - iRev;
    const el = document.createElement('div');
    el.dataset.idx = iReel;
    el.draggable = true;
    el.style.cssText = `display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;margin-bottom:3px;font-size:12px;transition:background .1s;${b.id===cbSelId?'background:#e8f5ee;border:1px solid #2d7a50;':'background:#f8f8f8;border:1px solid transparent;'}`;

    // Icône type
    const icones = {titre:'T', texte:'¶', image:'⬜', couleur:'■'};
    const ic = document.createElement('span');
    ic.style.cssText = 'font-family:monospace;font-size:13px;width:16px;text-align:center;flex-shrink:0';
    ic.textContent = icones[b.type]||'?';
    el.appendChild(ic);

    // Label
    const lb = document.createElement('span');
    lb.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333';
    const val = b._texte_fixe || cbResoudreBinding(b.binding);
    lb.textContent = val ? String(val).slice(0,30) : (b.type==='couleur' ? (b.couleur_libre||'couleur') : b.type);
    el.appendChild(lb);

    // Clic pour sélectionner
    el.onclick = () => { cbSelId=b.id; cbRendreCanvas(); cbRendreProps(); cbRendreCalques(); };

    // Drag & drop
    el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', iReel); el.style.opacity='0.4'; });
    el.addEventListener('dragend',   e => { el.style.opacity='1'; });
    el.addEventListener('dragover',  e => { e.preventDefault(); el.style.background='#ddeedd'; });
    el.addEventListener('dragleave', e => { el.style.background=b.id===cbSelId?'#e8f5ee':'#f8f8f8'; });
    el.addEventListener('drop', e => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
      const toIdx   = iReel;
      if (fromIdx===toIdx) return;
      const blocs = page.blocs;
      const [moved] = blocs.splice(fromIdx, 1);
      blocs.splice(toIdx, 0, moved);
      cbRendreCanvas();
      cbRendreCalques();
      cbSauvegarderPage();
    });

    cont.appendChild(el);
  });
}

// ─── DRAG & RESIZE ───────────────────────────────────────────────────────────
function cbCanvasClick(e) {
  const canvas=document.getElementById('cb-canvas');
  const rect=canvas.getBoundingClientRect();
  const sc=CB_W/rect.width;
  if (e.target.dataset.resize) {
    const b=cbGetPage()?.blocs.find(b=>b.id===e.target.dataset.resize);
    if (b) cbResizing={id:b.id,startX:(e.clientX-rect.left)*sc,startY:(e.clientY-rect.top)*sc,startW:b.w,startH:b.h};
    return;
  }
  const blocEl=e.target.closest('.cb-bloc');
  if (blocEl&&blocEl.dataset.id) {
    const b=cbGetPage()?.blocs.find(b=>b.id===blocEl.dataset.id);
    if (b){cbSelId=b.id;cbDragging={id:b.id,ox:(e.clientX-rect.left)*sc-b.x,oy:(e.clientY-rect.top)*sc-b.y};cbRendreCanvas();cbRendreProps();}
    return;
  }
  cbDeselectionner();
}

function cbGlobalMouseMove(e) {
  if (!cbDragging&&!cbResizing) return;
  const canvas=document.getElementById('cb-canvas'); if (!canvas) return;
  const rect=canvas.getBoundingClientRect();
  const sc=CB_W/rect.width;
  const mx=(e.clientX-rect.left)*sc, my=(e.clientY-rect.top)*sc;
  if (cbDragging) {
    const b=cbGetPage()?.blocs.find(b=>b.id===cbDragging.id);
    if (b){
      b.x=Math.max(0,Math.min(CB_W-20,mx-cbDragging.ox));
      b.y=Math.max(0,Math.min(CB_H-20,my-cbDragging.oy));
      cbRendreCanvas();
      document.getElementById('cb-dim-x').value=Math.round(b.x);
      document.getElementById('cb-dim-y').value=Math.round(b.y);
    }
  }
  if (cbResizing) {
    const b=cbGetPage()?.blocs.find(b=>b.id===cbResizing.id);
    if (b){
      b.w=Math.max(40,cbResizing.startW+mx-cbResizing.startX);
      b.h=Math.max(20,cbResizing.startH+my-cbResizing.startY);
      cbRendreCanvas();
      document.getElementById('cb-dim-w').value=Math.round(b.w);
      document.getElementById('cb-dim-h').value=Math.round(b.h);
    }
  }
}

function cbGlobalMouseUp() {
  if (cbDragging||cbResizing) cbSauvegarderPage();
  cbDragging=null; cbResizing=null;
}

// ─── RÉSOUDRE BINDING ────────────────────────────────────────────────────────
function cbResoudreBinding(binding) {
  if (!binding?.sheet||!binding?.id||!binding?.field) return null;
  const idFields = {
    Collections_v2:'col_id', Gammes_v2:'gam_id', Familles_v2:'fam_id',
    Produits_v2:'pro_id', Contenu_v2:'cle', Mediatheque_v2:'rowIndex', Images_Locales_v2:'nom'
  };
  const items=cbData?(cbData[binding.sheet]||[]):[];
  const idField=idFields[binding.sheet]||'id';
  const item=items.find(i=>String(i[idField]||'')===String(binding.id));
  return item?(item[binding.field]||null):null;
}

// ─── TABLE DES MATIÈRES ──────────────────────────────────────────────────────

function cbGenererTDMPage() {
  const page = cbPages[2];
  if (!page) return;
  const tdm = cbGenererTDM();
  if (!tdm.length) { alert('Aucune collection assignée aux pages. Assigne une collection à chaque page d\'abord.'); return; }

  page.blocs = [];

  const ligneH = 80;
  const carreW = 48;
  const carreH = 48;
  const startX = 240;
  const texteX = startX + carreW + 16;
  const texteW = Math.round((CB_W - startX - CB_MARGE) * 0.75);
  const numX   = CB_W - CB_MARGE - 36;
  const numW   = 36;

  // Centrage vertical
  const totalH = tdm.length * ligneH;
  let y = Math.round((CB_H - totalH) / 2);

  tdm.forEach(item => {
    // Carré couleur
    page.blocs.push({
      id:cbGenId(), type:'couleur',
      x:CB_MARGE, y:y+4,
      w:carreW, h:carreH,
      binding:{sheet:'',col_id:'',gam_id:'',fam_id:'',id:'',field:''},
      fs:13, bold:false, italic:false, police:'DM Sans',
      couleur_texte:'#1a1a1a', couleur_libre:item.hex, opacite:1,
      _couleur_fixe:item.hex
    });
    // Nom collection
    page.blocs.push({
      id:cbGenId(), type:'titre',
      x:texteX, y:y+4,
      w:texteW, h:26,
      binding:{sheet:'',col_id:'',gam_id:'',fam_id:'',id:'',field:''},
      fs:15, bold:true, italic:false, police:'Playfair Display',
      couleur_texte:'#1a1a1a', couleur_libre:'#e5900a', opacite:1,
      align:'left', _texte_fixe:item.nom
    });
    // Slogan
    page.blocs.push({
      id:cbGenId(), type:'texte',
      x:texteX, y:y+32,
      w:texteW, h:22,
      binding:{sheet:'',col_id:'',gam_id:'',fam_id:'',id:'',field:''},
      fs:11, bold:false, italic:true, police:'DM Sans',
      couleur_texte:'#888888', couleur_libre:'#e5900a', opacite:1,
      align:'left', _texte_fixe:item.slogan
    });
    // Numéro de page
    page.blocs.push({
      id:cbGenId(), type:'texte',
      x:numX, y:y+14,
      w:numW, h:26,
      binding:{sheet:'',col_id:'',gam_id:'',fam_id:'',id:'',field:''},
      fs:15, bold:true, italic:false, police:'DM Sans',
      couleur_texte:item.hex, couleur_libre:'#e5900a', opacite:1,
      align:'right', _texte_fixe:String(item.page)
    });

    y += ligneH;
  });

  cbSauvegarderPage(2);
  cbRendreInterface();
}

function cbGenererTDM() {
  const tdm=[], vues=new Set();
  cbPages.forEach((p,i)=>{
    if (p.col_id&&!vues.has(p.col_id)){
      vues.add(p.col_id);
      const col=(cbData?.Collections_v2||[]).find(c=>c.col_id===p.col_id);
      if (col) tdm.push({col_id:p.col_id,nom:col.nom||'',slogan:col.slogan||'',hex:col.couleur_hex||'#ccc',page:i+1});
    }
  });
  return tdm;
}

// ─── VUE LECTURE ─────────────────────────────────────────────────────────────
function cbOuvrirVueLecture() {
  const overlay=document.getElementById('cb-vue-lecture');
  const cont=document.getElementById('cb-vue-lecture-contenu');
  if (!overlay||!cont) return;
  cont.innerHTML='';
  const sc=0.45;

  const creerPageMini=(idx)=>{
    const p=cbPages[idx];
    const wrap=document.createElement('div');
    wrap.style.cssText=`width:${CB_W*sc}px;height:${CB_H*sc}px;background:#fff;position:relative;box-shadow:0 2px 12px rgba(0,0,0,.2);flex-shrink:0;overflow:hidden`;
    if (!p){wrap.style.background='#eee';return wrap;}
    if (idx+1>=4) {
      const pg=document.createElement('div');
      pg.style.cssText=`position:absolute;bottom:${18*sc}px;right:${CB_MARGE*sc}px;width:${CB_W*0.6*sc}px;pointer-events:none`;
      pg.innerHTML=`<div style="border-top:1px solid #bbb;width:100%;margin-bottom:${2*sc}px"></div><div style="font-size:${11*sc}px;color:#888">${idx+1}</div>`;
      wrap.appendChild(pg);
    }
    (p.blocs||[]).forEach(b=>{
      const el=document.createElement('div');
      el.style.cssText=`position:absolute;left:${b.x*sc}px;top:${b.y*sc}px;width:${b.w*sc}px;height:${b.h*sc}px;overflow:hidden`;
      const val=b._texte_fixe||b._couleur_fixe||cbResoudreBinding(b.binding);
      if (b.type==='image'){
        el.style.opacity=b.opacite!==undefined?b.opacite:1;
        if(val)el.innerHTML=`<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block">`;
      } else if (b.type==='couleur'){
        const couleur=(b.binding?.field&&val)?val:(b.couleur_libre||'#e5900a');
        el.style.background=couleur;
        el.style.opacity=b.opacite!==undefined?b.opacite:1;
      } else {
        el.innerHTML=`<div style="padding:${3*sc}px ${5*sc}px;font-size:${(b.fs||13)*sc}px;font-weight:${b.bold?'bold':'normal'};font-style:${b.italic?'italic':'normal'};font-family:'${b.police||'DM Sans'}',sans-serif;color:${b.couleur_texte||'#1a1a1a'};line-height:1.4;overflow:hidden;height:100%">${val||''}</div>`;
      }
      wrap.appendChild(el);
    });
    return wrap;
  };

  // Page 1 seule
  const row0=document.createElement('div');
  row0.style.cssText='display:flex;gap:6px;justify-content:center;';
  row0.appendChild(creerPageMini(0));
  cont.appendChild(row0);

  // Pages 2+ par paires
  for (let i=1;i<cbPages.length;i+=2) {
    const paire=document.createElement('div');
    paire.style.cssText='display:flex;gap:0;justify-content:center;';
    paire.appendChild(creerPageMini(i));
    if (i+1<cbPages.length) paire.appendChild(creerPageMini(i+1));
    cont.appendChild(paire);
  }

  overlay.style.display='flex';
}

function cbFermerVueLecture() { document.getElementById('cb-vue-lecture').style.display='none'; }

// ─── IMPRESSION ──────────────────────────────────────────────────────────────
function cbImprimerPage() {
  const canvas=document.getElementById('cb-canvas'); if (!canvas) return;
  const clone=canvas.cloneNode(true);
  clone.querySelectorAll('.cb-resize-handle,.cb-guide').forEach(el=>el.remove());
  clone.querySelectorAll('.cb-bloc').forEach(el=>{el.classList.remove('cb-bloc-sel');el.style.outline='none';});
  const win=window.open('','_blank');
  win.document.write(cbHTMLImpression([clone.outerHTML],false));
  win.document.close();
  setTimeout(()=>win.print(),500);
}

function cbImprimerCatalogue() {
  const N=cbPages.length;
  if (N%4!==0){alert('Le catalogue doit avoir un multiple de 4 pages.\n\nActuel : '+N+'\nManquantes : '+(4-N%4));return;}
  const htmlPages=cbPages.map((p,idx)=>cbRendrePageHTML(p,idx));
  const imposition=[];
  for (let k=0;k<N/4;k++) {
    const rG=N-2*k-1, rD=2*k;
    imposition.push(`<div class="feuille"><div class="demi">${htmlPages[rG]}</div><div class="demi">${htmlPages[rD]}</div></div>`);
    const vG=2*k+1, vD=N-2*k-2;
    imposition.push(`<div class="feuille"><div class="demi">${htmlPages[vG]||''}</div><div class="demi">${htmlPages[vD]||''}</div></div>`);
  }
  const win=window.open('','_blank');
  win.document.write(cbHTMLImpression(imposition,true));
  win.document.close();
  setTimeout(()=>win.print(),600);
}

function cbRendrePageHTML(page,idx) {
  if (!page) return `<div style="width:${CB_W}px;height:${CB_H}px;background:#fff"></div>`;
  const traitW=CB_W*0.6;
  let html=`<div style="position:relative;width:${CB_W}px;height:${CB_H}px;background:#fff;overflow:hidden">`;
  (page.blocs||[]).forEach(b=>{
    const val=b._texte_fixe||b._couleur_fixe||cbResoudreBinding(b.binding);
    let c='';
    if (b.type==='image') {
      c=val?`<div style="opacity:${b.opacite!==undefined?b.opacite:1};width:100%;height:100%"><img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`:'';
    } else if (b.type==='couleur') {
      const couleur=(b.binding?.field&&val)?val:(b.couleur_libre||'#e5900a');
      c=`<div style="width:100%;height:100%;background:${couleur};opacity:${b.opacite!==undefined?b.opacite:1}"></div>`;
    } else {
      c=`<div style="padding:6px 8px;font-size:${b.fs||13}px;font-weight:${b.bold?'bold':'normal'};font-style:${b.italic?'italic':'normal'};font-family:'${b.police||'DM Sans'}',sans-serif;color:${b.couleur_texte||'#1a1a1a'};line-height:1.5;overflow:hidden;height:100%">${val||''}</div>`;
    }
    html+=`<div style="position:absolute;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;overflow:hidden">${c}</div>`;
  });
  if (idx+1>=4) {
    html+=`<div style="position:absolute;bottom:18px;right:${CB_MARGE}px;width:${traitW}px"><div style="border-top:1px solid #aaa;width:100%;margin-bottom:4px"></div><div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#888">${idx+1}</div></div>`;
  }
  html+='</div>';
  return html;
}

function cbHTMLImpression(contenu,imposition) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Birthstone&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  ${imposition?'@page{size:11in 17in landscape;margin:0}':'@page{size:letter portrait;margin:0}'}
  body{background:#fff}
  ${imposition?`.feuille{display:flex;width:${CB_W*2}px;height:${CB_H}px;page-break-after:always}.demi{width:${CB_W}px;height:${CB_H}px;overflow:hidden}`:''}
</style></head><body>${contenu.join('')}</body></html>`;
}

// ─── STYLES CSS ──────────────────────────────────────────────────────────────
function cbInjectStyles() {
  if (document.getElementById('cb-styles')) return;
  const s=document.createElement('style');
  s.id='cb-styles';
  s.textContent=`
    #cb-layout{display:flex;height:calc(100vh - 195px);min-height:580px;border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;background:#f0f0f0;margin-top:12px}
    .cb-palette{width:158px;background:#1e1e2e;padding:12px 10px;display:flex;flex-direction:column;gap:5px;flex-shrink:0;overflow-y:auto}
    .cb-section-titre{color:#ffffff55;font-size:10px;font-weight:700;letter-spacing:1px;margin:8px 0 4px}
    .cb-palette-sep{border-top:1px solid #2d2d44;margin:8px 0}
    .cb-palette-btn{background:#2d2d44;border:none;border-radius:7px;padding:8px 10px;cursor:pointer;color:#fff;font-size:12px;text-align:left;transition:background .15s;width:100%}
    .cb-palette-btn:hover{background:#3d3d60}
    .cb-palette-btn-actif{background:#2d7a50!important}
    .cb-palette-btn-new{border:1px dashed #444;background:transparent!important;color:#888;margin-top:4px}
    .cb-palette-btn-new:hover{background:#2d2d44!important;color:#fff}
    .cb-canvas-zone{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
    .cb-canvas-toolbar{background:#fff;border-bottom:1px solid #e5e5e5;padding:8px 12px;display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap}
    .cb-canvas-wrap{flex:1;overflow:auto;display:flex;flex-direction:row;justify-content:center;align-items:flex-start;padding:24px;background:#d0d0d0;gap:0px}
    .cb-canvas{width:${CB_W}px;height:${CB_H}px;background:#fff;position:relative;box-shadow:0 4px 24px rgba(0,0,0,.22);flex-shrink:0;user-select:none;overflow:hidden}
    .cb-canvas-voisin{opacity:0.55;transition:opacity .2s;cursor:pointer!important;flex-shrink:0}
    .cb-canvas-voisin:hover{opacity:0.82}
    .cb-canvas-vide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:13px;pointer-events:none;text-align:center;padding:40px}
    .cb-bloc{position:absolute;cursor:grab;box-sizing:border-box;outline:1px dashed rgba(0,0,0,.1);overflow:hidden}
    .cb-bloc:active{cursor:grabbing}
    .cb-bloc-sel{outline:2px solid #2d7a50!important;z-index:100}
    .cb-bloc-texte{padding:6px 8px;line-height:1.5;overflow:hidden;height:100%}
    .cb-placeholder{width:100%;height:100%;background:#f0ede8;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px;gap:6px}
    .cb-placeholder-txt{color:#ccc;font-style:italic}
    .cb-resize-handle{position:absolute;bottom:-4px;right:-4px;width:10px;height:10px;background:#2d7a50;border-radius:2px;cursor:se-resize;z-index:200}
    .cb-props{width:258px;background:#fff;border-left:1px solid #e8e8e8;padding:14px;overflow-y:auto;flex-shrink:0;font-size:13px}
    #cb-vue-lecture{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:none;flex-direction:column;align-items:center;overflow-y:auto;padding:50px 20px 40px;gap:12px}
    #cb-vue-lecture-fermer{position:fixed;top:14px;right:18px;background:#fff;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:14px;font-weight:700;z-index:10000}
    #cb-vue-lecture-contenu{display:flex;flex-direction:column;align-items:center;gap:10px}
  `;
  document.head.appendChild(s);
}

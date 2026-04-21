/* ════════════════════════════════════════
   CATALOGUE BUILDER — catalogue-builder.js
   Version 2.0
   ════════════════════════════════════════ */

const CB_W     = 816;   // 8.5 po à 96dpi
const CB_H     = 1056;  // 11 po à 96dpi
const CB_MARGE = 48;    // 0.5 po à 96dpi

const CB_SHEETS = {
  Collections_v2:    { idField:'col_id',   label:'Collections',   fields:['nom','slogan','description','couleur_hex','photo_url'] },
  Gammes_v2:         { idField:'gam_id',   label:'Gammes',        fields:['nom','description','couleur_hex','photo_url'] },
  Familles_v2:       { idField:'fam_id',   label:'Familles',      fields:['nom','description','couleur_hex'] },
  Produits_v2:       { idField:'pro_id',   label:'Produits',      fields:['nom','description','couleur_hex','image_url','desc_emballage','slogan_collection'] },
  Contenu_v2:        { idField:'cle',      label:'Contenu site',  fields:['valeur'] },
  Mediatheque_v2:    { idField:'rowIndex', label:'Médiathèque',   fields:['url','nom','categorie'] },
  Images_Locales_v2: { idField:'nom',      label:'Images locales',fields:['chemin','description'] },
};

const CB_DEFAULTS = {
  titre:   { w:500, h:70  },
  texte:   { w:500, h:160 },
  image:   { w:300, h:220 },
  couleur: { w:200, h:60  },
};

const CB_POLICES = ['DM Sans','Playfair Display','Birthstone'];

// ─── ÉTAT ────────────────────────────────────────────────────────────────────
let cbData      = null;
let cbPages     = [];
let cbPageIndex = 0;
let cbSelId     = null;
let cbDragging  = null;
let cbResizing  = null;
let cbInited    = false;
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

// ─── BLOCS ───────────────────────────────────────────────────────────────────
function cbAjouterBloc(type) {
  const page = cbPages[cbPageIndex];
  if (!page) return;
  const b = {
    id:cbGenId(), type,
    x: CB_MARGE + 20, y: CB_MARGE + 20,
    w: CB_DEFAULTS[type].w, h: CB_DEFAULTS[type].h,
    binding: {sheet:'', id:'', field:''},
    fs:     type==='titre' ? 28 : 13,
    bold:   type==='titre',
    italic: false,
    police: type==='titre' ? 'Playfair Display' : 'DM Sans',
    couleur_texte: '#1a1a1a',
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
  cbSauvegarderPage();
}

function cbGetPage() { return cbPages[cbPageIndex]||null; }
function cbGetBloc() { return cbGetPage()?.blocs.find(b=>b.id===cbSelId)||null; }

// ─── RENDU INTERFACE ─────────────────────────────────────────────────────────
function cbRendreInterface() {
  cbRendrePagesListe();
  cbRendreCanvas();
  cbRendreProps();
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

  // Bouton TDM — visible seulement sur page 3
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

function cbNomCollection(col_id) {
  return (cbData?.Collections_v2||[]).find(c=>c.col_id===col_id)?.nom||'';
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
  if (btnS) btnS.style.display = cbSelId?'':'none';
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
    el.innerHTML = val
      ? `<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">`
      : `<div class="cb-placeholder">⬜ Image</div>`;
  } else if (b.type==='couleur') {
    el.style.background = val||'#e5900a';
    el.style.opacity    = b.opacite!==undefined ? b.opacite : 1;
  } else {
    const style = `font-size:${b.fs||13}px;font-weight:${b.bold?'bold':'normal'};font-style:${b.italic?'italic':'normal'};font-family:'${b.police||'DM Sans'}',sans-serif;color:${b.couleur_texte||'#1a1a1a'}`;
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
  const estPaire = cbPageIndex%2!==0;
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
  const btnS = document.getElementById('cb-btn-supprimer-bloc');
  if (btnS) btnS.style.display = bloc?'':'none';
  if (!bloc) return;

  document.getElementById('cb-props-type-label').textContent = 'Bloc · '+bloc.type;
  document.getElementById('cb-src-sheet').value = bloc.binding?.sheet||'';
  cbRendreIdSelect(bloc.binding?.sheet, bloc.binding?.id);
  cbRendreFieldSelect(bloc.binding?.sheet, bloc.binding?.field);
  cbRendreApercu(bloc.binding);

  document.getElementById('cb-dim-w').value = Math.round(bloc.w);
  document.getElementById('cb-dim-h').value = Math.round(bloc.h);
  document.getElementById('cb-dim-x').value = Math.round(bloc.x);
  document.getElementById('cb-dim-y').value = Math.round(bloc.y);

  document.getElementById('cb-typo-zone').style.display    = (bloc.type==='titre'||bloc.type==='texte')?'':'none';
  document.getElementById('cb-opacite-zone').style.display = bloc.type==='couleur'?'':'none';

  if (bloc.type==='titre'||bloc.type==='texte') {
    document.getElementById('cb-typo-size').value    = bloc.fs||13;
    document.getElementById('cb-typo-couleur').value = bloc.couleur_texte||'#1a1a1a';
    document.getElementById('cb-typo-police').value  = bloc.police||'DM Sans';
    const bb=document.getElementById('cb-typo-bold-btn');
    const ib=document.getElementById('cb-typo-italic-btn');
    if (bb){ bb.style.background=bloc.bold?'#2d7a50':''; bb.style.color=bloc.bold?'#fff':''; }
    if (ib){ ib.style.background=bloc.italic?'#2d7a50':''; ib.style.color=bloc.italic?'#fff':''; }
  }
  if (bloc.type==='couleur') {
    const sl=document.getElementById('cb-opacite-slider');
    const lb=document.getElementById('cb-opacite-label');
    if (sl) sl.value=Math.round((bloc.opacite!==undefined?bloc.opacite:1)*100);
    if (lb) lb.textContent=Math.round((bloc.opacite!==undefined?bloc.opacite:1)*100)+'%';
  }
}

function cbRendreIdSelect(sheet, selId) {
  const grp=document.getElementById('cb-src-id-groupe');
  const sel=document.getElementById('cb-src-id');
  if (!grp||!sel) return;
  if (!sheet){grp.style.display='none';return;}
  grp.style.display='';
  const items=cbData?(cbData[sheet]||[]):[];
  const idField=CB_SHEETS[sheet]?.idField;
  sel.innerHTML='<option value="">— Choisir —</option>';
  items.forEach(it=>{
    const id=String(it[idField]||'');
    const nom=it.nom||it.cle||it.url||id;
    const opt=document.createElement('option');
    opt.value=id; opt.textContent=(nom.length>42?nom.slice(0,42)+'…':nom)+' · '+id;
    if (id===selId) opt.selected=true;
    sel.appendChild(opt);
  });
}

function cbRendreFieldSelect(sheet, selField) {
  const grp=document.getElementById('cb-src-field-groupe');
  const sel=document.getElementById('cb-src-field');
  if (!grp||!sel) return;
  const idVal=document.getElementById('cb-src-id')?.value;
  if (!sheet||!idVal){grp.style.display='none';return;}
  grp.style.display='';
  sel.innerHTML='<option value="">— Choisir —</option>';
  (CB_SHEETS[sheet]?.fields||[]).forEach(f=>{
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
function cbOnChangeSheet() {
  const sheet=document.getElementById('cb-src-sheet').value;
  const bloc=cbGetBloc();
  if (bloc) bloc.binding={sheet,id:'',field:''};
  cbRendreIdSelect(sheet,'');
  cbRendreFieldSelect(sheet,'');
  document.getElementById('cb-apercu-zone').style.display='none';
  cbRendreCanvas();
}
function cbOnChangeId() {
  const id=document.getElementById('cb-src-id').value;
  const sheet=document.getElementById('cb-src-sheet').value;
  const bloc=cbGetBloc();
  if (bloc){bloc.binding.id=id;bloc.binding.field='';}
  cbRendreFieldSelect(sheet,'');
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
  b.fs           = parseInt(document.getElementById('cb-typo-size').value)||b.fs;
  b.couleur_texte = document.getElementById('cb-typo-couleur').value||b.couleur_texte;
  b.police       = document.getElementById('cb-typo-police').value||b.police;
  cbRendreCanvas(); cbSauvegarderPage();
}
function cbToggleBold()   { const b=cbGetBloc();if(!b)return;b.bold=!b.bold;cbRendreCanvas();cbRendreProps();cbSauvegarderPage(); }
function cbToggleItalic() { const b=cbGetBloc();if(!b)return;b.italic=!b.italic;cbRendreCanvas();cbRendreProps();cbSauvegarderPage(); }
function cbUpdateOpacite(val) {
  const b=cbGetBloc(); if (!b) return;
  b.opacite=parseFloat(val)/100;
  document.getElementById('cb-opacite-label').textContent=val+'%';
  cbRendreCanvas(); cbSauvegarderPage();
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
    if (b){b.x=Math.max(0,Math.min(CB_W-20,mx-cbDragging.ox));b.y=Math.max(0,Math.min(CB_H-20,my-cbDragging.oy));cbRendreCanvas();document.getElementById('cb-dim-x').value=Math.round(b.x);document.getElementById('cb-dim-y').value=Math.round(b.y);}
  }
  if (cbResizing) {
    const b=cbGetPage()?.blocs.find(b=>b.id===cbResizing.id);
    if (b){b.w=Math.max(40,cbResizing.startW+mx-cbResizing.startX);b.h=Math.max(20,cbResizing.startH+my-cbResizing.startY);cbRendreCanvas();document.getElementById('cb-dim-w').value=Math.round(b.w);document.getElementById('cb-dim-h').value=Math.round(b.h);}
  }
}
function cbGlobalMouseUp() { if (cbDragging||cbResizing) cbSauvegarderPage(); cbDragging=null; cbResizing=null; }
function cbDeselectionner() { cbSelId=null; cbRendreCanvas(); cbRendreProps(); }

// ─── RÉSOUDRE BINDING ────────────────────────────────────────────────────────
function cbResoudreBinding(binding) {
  if (!binding?.sheet||!binding?.id||!binding?.field) return null;
  const items=cbData?(cbData[binding.sheet]||[]):[];
  const idField=CB_SHEETS[binding.sheet]?.idField;
  const item=items.find(i=>String(i[idField]||'')===String(binding.id));
  return item?(item[binding.field]||null):null;
}

// ─── TABLE DES MATIÈRES ──────────────────────────────────────────────────────
function cbGenererTDMPage() {
  const page = cbPages[2]; // page 3
  if (!page) return;

  const tdm = cbGenererTDM();
  if (!tdm.length) { alert('Aucune collection assignée aux pages. Assigne une collection à chaque page d\'abord.'); return; }

  // Effacer les blocs existants
  page.blocs = [];

  // Titre
  page.blocs.push({
    id: cbGenId(), type: 'titre',
    x: CB_MARGE + 20, y: CB_MARGE + 20,
    w: CB_W - CB_MARGE*2 - 40, h: 60,
    binding: { sheet:'', id:'', field:'' },
    fs: 32, bold: true, italic: false,
    police: 'Playfair Display',
    couleur_texte: '#1a1a1a', opacite: 1,
    _texte_fixe: 'Table des matières'
  });

  // Une ligne par collection
  let y = CB_MARGE + 100;
  const ligneH = 70;

  tdm.forEach(item => {
    // Bande de couleur
    page.blocs.push({
      id: cbGenId(), type: 'couleur',
      x: CB_MARGE, y,
      w: 8, h: ligneH - 8,
      binding: { sheet:'', id:'', field:'' },
      fs: 13, bold: false, italic: false,
      police: 'DM Sans', couleur_texte: '#1a1a1a',
      opacite: 1, _couleur_fixe: item.hex
    });
    // Nom collection
    page.blocs.push({
      id: cbGenId(), type: 'titre',
      x: CB_MARGE + 20, y: y + 4,
      w: CB_W - CB_MARGE*2 - 80, h: 30,
      binding: { sheet:'', id:'', field:'' },
      fs: 16, bold: true, italic: false,
      police: 'Playfair Display',
      couleur_texte: '#1a1a1a', opacite: 1,
      _texte_fixe: item.nom
    });
    // Slogan
    page.blocs.push({
      id: cbGenId(), type: 'texte',
      x: CB_MARGE + 20, y: y + 36,
      w: CB_W - CB_MARGE*2 - 80, h: 24,
      binding: { sheet:'', id:'', field:'' },
      fs: 11, bold: false, italic: true,
      police: 'DM Sans',
      couleur_texte: '#666666', opacite: 1,
      _texte_fixe: item.slogan
    });
    // Numéro de page
    page.blocs.push({
      id: cbGenId(), type: 'texte',
      x: CB_W - CB_MARGE - 50, y: y + 20,
      w: 40, h: 30,
      binding: { sheet:'', id:'', field:'' },
      fs: 14, bold: true, italic: false,
      police: 'DM Sans',
      couleur_texte: item.hex, opacite: 1,
      _texte_fixe: String(item.page)
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
  for (let i=0;i<cbPages.length;i+=2) {
    const paire=document.createElement('div');
    paire.style.cssText='display:flex;gap:6px;justify-content:center;';
    [i,i+1].forEach(idx=>{
      const p=cbPages[idx];
      const wrap=document.createElement('div');
      wrap.style.cssText=`width:${CB_W*sc}px;height:${CB_H*sc}px;background:#fff;position:relative;box-shadow:0 2px 12px rgba(0,0,0,.2);flex-shrink:0;overflow:hidden`;
      if (!p){wrap.style.background='#eee';paire.appendChild(wrap);return;}
      // Pagination
      const pg=document.createElement('div');
      pg.style.cssText=`position:absolute;bottom:${18*sc}px;right:${CB_MARGE*sc}px;width:${CB_W*0.6*sc}px;pointer-events:none`;
      pg.innerHTML=`<div style="border-top:1px solid #bbb;width:100%;margin-bottom:${2*sc}px"></div><div style="font-size:${11*sc}px;color:#888">${idx+1}</div>`;
      wrap.appendChild(pg);
      (p.blocs||[]).forEach(b=>{
        const el=document.createElement('div');
        el.style.cssText=`position:absolute;left:${b.x*sc}px;top:${b.y*sc}px;width:${b.w*sc}px;height:${b.h*sc}px;overflow:hidden`;
        const val=cbResoudreBinding(b.binding);
        if (b.type==='image'){if(val)el.innerHTML=`<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block">`;}
        else if (b.type==='couleur'){el.style.background=val||'#e5900a';el.style.opacity=b.opacite!==undefined?b.opacite:1;}
        else el.innerHTML=`<div style="padding:${3*sc}px ${5*sc}px;font-size:${(b.fs||13)*sc}px;font-weight:${b.bold?'bold':'normal'};font-style:${b.italic?'italic':'normal'};font-family:'${b.police||'DM Sans'}',sans-serif;color:${b.couleur_texte||'#1a1a1a'};line-height:1.4;overflow:hidden;height:100%">${val||''}</div>`;
        wrap.appendChild(el);
      });
      paire.appendChild(wrap);
    });
    cont.appendChild(paire);
  }
  overlay.style.display='flex';
}
function cbFermerVueLecture() { document.getElementById('cb-vue-lecture').style.display='none'; }

// ─── IMPRESSION PAGE COURANTE ────────────────────────────────────────────────
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

// ─── IMPOSITION RECTO-VERSO 11x17 ────────────────────────────────────────────
function cbImprimerCatalogue() {
  const N=cbPages.length;
  if (N%4!==0){alert('Le catalogue doit avoir un multiple de 4 pages pour l\'impression recto-verso.\n\nPages actuelles : '+N+'\nManquantes : '+(4-N%4));return;}
  const htmlPages=cbPages.map((p,idx)=>cbRendrePageHTML(p,idx));
  const imposition=[];
  for (let k=0;k<N/4;k++) {
    // Recto : page N-2k (gauche) | page 2k+1 (droite)
    const rG=N-2*k-1, rD=2*k;
    imposition.push(`<div class="feuille"><div class="demi">${htmlPages[rG]}</div><div class="demi">${htmlPages[rD]}</div></div>`);
    // Verso : page 2k+2 (gauche) | page N-2k-1 (droite)
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
    const val=cbResoudreBinding(b.binding);
    let c='';
    if (b.type==='image') c=val?`<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block">`:'';
    else if (b.type==='couleur') c=`<div style="width:100%;height:100%;background:${val||'#e5900a'};opacity:${b.opacite!==undefined?b.opacite:1}"></div>`;
    else c=`<div style="padding:6px 8px;font-size:${b.fs||13}px;font-weight:${b.bold?'bold':'normal'};font-style:${b.italic?'italic':'normal'};font-family:'${b.police||'DM Sans'}',sans-serif;color:${b.couleur_texte||'#1a1a1a'};line-height:1.5;overflow:hidden;height:100%">${val||''}</div>`;
    html+=`<div style="position:absolute;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;overflow:hidden">${c}</div>`;
  });
  html+=`<div style="position:absolute;bottom:18px;right:${CB_MARGE}px;width:${traitW}px"><div style="border-top:1px solid #aaa;width:100%;margin-bottom:4px"></div><div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#888">${idx+1}</div></div>`;
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
    .cb-canvas-toolbar{background:#fff;border-bottom:1px solid #e5e5e5;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap}
    .cb-canvas-wrap{flex:1;overflow:auto;display:flex;flex-direction:row;justify-content:center;align-items:flex-start;padding:24px;background:#d0d0d0;gap:8px}
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
    #cb-vue-lecture{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:none;flex-direction:column;align-items:center;overflow-y:auto;padding:50px 20px 40px}
    #cb-vue-lecture-fermer{position:fixed;top:14px;right:18px;background:#fff;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:14px;font-weight:700;z-index:10000}
    #cb-vue-lecture-contenu{display:flex;flex-direction:column;align-items:center;gap:10px}
  `;
  document.head.appendChild(s);
}

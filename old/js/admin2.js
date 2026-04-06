/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin2.js
   ═══════════════════════════════════════ */

// ─── CONFIGURATION ───
const GAS_URL_V2 = 'https://script.google.com/macros/s/AKfycbyZYLb_LWaaJ0kQRTdvJHuOamYI4OrO0fdaJjDAFk-UTOXIRF6OK67QiA6DjKUcBSU9/exec';

// ─── APPELS API V2 ───
async function appelAPI_v2(action, params = {}) {
  try {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${GAS_URL_V2}?${qs}`);
    return await res.json();
  } catch(e) {
    console.error('appelAPI_v2 erreur:', e);
    return null;
  }
}

async function appelAPIPost_v2(action, data = {}) {
  try {
    const res = await fetch(GAS_URL_V2, {
      method: 'POST',
      body: JSON.stringify({ action, ...data })
    });
    return await res.json();
  } catch(e) {
    console.error('appelAPIPost_v2 erreur:', e);
    return null;
  } 
}

// ─── FIN DU FICHIER ───
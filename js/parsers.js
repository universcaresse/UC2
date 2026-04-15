/* ═══════════════════════════════════════
   UNIVERS CARESSE — parsers.js
   Parsers de factures PDF par fournisseur
   ═══════════════════════════════════════ */

// ─── PURE ARÔME ───
function parserFacturePA(texte) {
  const facture = { numeroFacture: '', date: '', items: [], tps: 0, tvq: 0, livraison: 0, sousTotal: 0, total: 0 };
texte = texte.replace(/https?:\/\/\S+/g, '').replace(/Page\s+\d+\s+sur\s+\d+/gi, '').replace(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/g, '');
  const mNum  = texte.match(/Détails de la commande[\s\S]{0,20}?(\d{4,6})/i);
  if (mNum) facture.numeroFacture = mNum[1].trim();
  const mDate = texte.match(/(\d{2}-\d{2}-\d{4})/);
  if (mDate) { const p = mDate[1].split('-'); facture.date = `${p[2]}-${p[1]}-${p[0]}`; }
  const mTps   = texte.match(/TPS\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mTps) facture.tps = parseFloat(mTps[1].replace(/\s/g,'').replace(',','.'));
  const mTvq   = texte.match(/TVQ\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mTvq) facture.tvq = parseFloat(mTvq[1].replace(/\s/g,'').replace(',','.'));
  const mSous  = texte.match(/Sous-total\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mSous) facture.sousTotal = parseFloat(mSous[1].replace(/\s/g,'').replace(',','.'));
  const mTotal = texte.match(/Total de la commande\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mTotal) facture.total = parseFloat(mTotal[1].replace(/\s/g,'').replace(',','.'));
  const mLiv   = texte.match(/Livraison\s*[:\s]+([\d\s,\.]+)\s*\$/i);
  if (mLiv && !/gratuite/i.test(mLiv[0])) facture.livraison = parseFloat(mLiv[1].replace(/\s/g,'').replace(',','.'));
  const ligneItem = /([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\/&\(\)\-\']+)\s*\((\d+)\)\s*([\d]+(?:ml|g|L|kg|oz)[^\n]*?)?\s*([\d,\.\s]+)\s*\$\s*CAD/gi;
  let m;
  while ((m = ligneItem.exec(texte)) !== null) {
    const desc = m[1].trim();
    const qte  = parseInt(m[2]);
    const fmt  = (m[3] || '').trim();
    const prix = parseFloat(m[4].replace(/\s/g,'').replace(',', '.'));
    if (!desc || isNaN(prix) || prix <= 0) continue;
    const fmtMatch = fmt.match(/^([\d\.]+)\s*(ml|g|L|kg)/i) || desc.match(/([\d\.]+)\s*(ml|g|L|kg)/i);
    facture.items.push({
      description:  desc,
      formatQte:    fmtMatch ? parseFloat(fmtMatch[1]) : 0,
      formatUnite:  fmtMatch ? fmtMatch[2].toLowerCase() : 'unité',
      prixUnitaire: prix,
      quantite:     qte
    });
  }
  return facture;
}

// ─── AMAZON ───
function parserFactureAmazon(texte) {
  const facture = { numeroFacture: '', date: '', items: [], tps: 0, tvq: 0, livraison: 0, sousTotal: 0, total: 0 };
  const lignes = texte.split('\n').map(l => l.trim()).filter(Boolean);

  // Numéro de facture
  const mNum = texte.match(/Invoice\s*#\s*[\/\|][^:\n]*:\s*([A-Z0-9]{6,})/i);
  if (mNum) facture.numeroFacture = mNum[1].trim();
  if (!facture.numeroFacture) {
    for (let i = 0; i < lignes.length; i++) {
      if (/Invoice\s*#/i.test(lignes[i])) {
        const mInline = lignes[i].match(/:\s*([A-Z0-9]{6,})$/);
        if (mInline) { facture.numeroFacture = mInline[1]; break; }
        if (i + 1 < lignes.length && /^[A-Z0-9]{6,}$/.test(lignes[i + 1])) { facture.numeroFacture = lignes[i + 1]; break; }
      }
    }
  }

  // Date
  const moisMap = { january:'01', february:'02', march:'03', april:'04', may:'05', june:'06', july:'07', august:'08', september:'09', october:'10', november:'11', december:'12' };
  const mDate = texte.match(/Invoice date[^:]*:\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (mDate) {
    const jour = mDate[1].padStart(2, '0');
    const mois = moisMap[mDate[2].toLowerCase()] || '01';
    facture.date = `${mDate[3]}-${mois}-${jour}`;
  }

  // Sous-total
  const mSous = texte.match(/Invoice subtotal[\s\S]{0,60}\$([\d\.]+)/i);
  if (mSous) facture.sousTotal = parseFloat(mSous[1]) || 0;

  // Items — ancre sur ASIN
  for (let i = 0; i < lignes.length; i++) {
    if (!/^ASIN:\s*[A-Z0-9]+$/i.test(lignes[i])) continue;

    // Description — remonter jusqu'à une ligne connue
    const descLignes = [];
    let j = i - 1;
    while (j >= 0) {
      const l = lignes[j];
      if (/^(Description|Quantity|Unit\s*price|Discount|Federal|Provincial|Item\s*subtotal|Sous-total|Quantit|\[GST|ASIN:|Shipping|Invoice|Order|Shipment|Billing|Delivery|Sold\s*by|Page\s*\d)/i.test(l)) break;
      if (/^\$[\d\.]+$/.test(l) || /^\d+$/.test(l)) break;
      descLignes.unshift(l);
      j--;
    }
   const descBrut = descLignes.join(' ');
    const partieFr = descBrut.split(' / ')[1];
    let desc = (partieFr || descBrut.split(' / ')[0]).trim();
    if (!desc || desc.length < 3) continue;

    // Après l'ASIN — qté puis $values dans l'ordre : prix, remise, TPS, TVQ, sous-total
    let qte = 0;
    const dollarValues = [];
    for (let k = i + 1; k < Math.min(i + 15, lignes.length); k++) {
      const l = lignes[k];
      if (/^Shipping/i.test(l)) break;
      if (!qte) { const mQ = l.match(/^(\d+)$/); if (mQ) { qte = parseInt(mQ[1]); continue; } }
      const mP = l.match(/^\$([\d\.]+)$/);
      if (mP) { dollarValues.push(parseFloat(mP[1])); }
      if (dollarValues.length >= 5) break;
    }

    const prixUnit = dollarValues[0] || 0;
    const tpsItem  = dollarValues[2] || 0;
    const tvqItem  = dollarValues[3] || 0;
    if (prixUnit <= 0) continue;

    facture.tps += tpsItem;
    facture.tvq += tvqItem;

    const fmtMatch = desc.match(/([\d]+[,\.][\d]+|[\d]+)\s*(ml|g|L|kg|oz|lb|lbs)/i);
    facture.items.push({
      description:  desc,
      formatQte:    fmtMatch ? parseFloat(fmtMatch[1].replace(',', '.')) : 0,
      formatUnite:  fmtMatch ? fmtMatch[2].toLowerCase() : 'unité',
      prixUnitaire: prixUnit,
      quantite:     qte || 1
    });
  }

  facture.tps   = Math.round(facture.tps * 100) / 100;
  facture.tvq   = Math.round(facture.tvq * 100) / 100;
  facture.total = facture.sousTotal + facture.tps + facture.tvq + facture.livraison;
  return facture;
}
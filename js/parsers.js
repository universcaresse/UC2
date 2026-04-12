/* ═══════════════════════════════════════
   UNIVERS CARESSE — parsers.js
   Parsers de factures PDF par fournisseur
   ═══════════════════════════════════════ */

// ─── PURE ARÔME ───
function parserFacturePA(texte) {
  const facture = { numeroFacture: '', date: '', items: [], tps: 0, tvq: 0, livraison: 0, sousTotal: 0, total: 0 };
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

  // Numéro de facture — premier trouvé
  const mNum = texte.match(/Invoice\s*#\s*\/[^:]+:\s*([A-Z0-9]+)/i);
  if (mNum) facture.numeroFacture = mNum[1].trim();

  // Date — "Invoice date / Date de facturation: DD Month YYYY"
  const moisMap = { january:'01', february:'02', march:'03', april:'04', may:'05', june:'06', july:'07', august:'08', september:'09', october:'10', november:'11', december:'12' };
  const mDate = texte.match(/Invoice date[^:]*:\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (mDate) {
    const jour = mDate[1].padStart(2, '0');
    const mois = moisMap[mDate[2].toLowerCase()] || '01';
    facture.date = `${mDate[3]}-${mois}-${jour}`;
  }

  // Sous-total
  const mSous = texte.match(/Invoice subtotal[^\n$]*\$([\d\.]+)/i);
  if (mSous) facture.sousTotal = parseFloat(mSous[1]) || 0;

  // Items — chaque item précède son ASIN
  const blocsASIN = [];
  const reASIN = /(.+?)\nASIN:\s*\S+/gs;
  let m;
  while ((m = reASIN.exec(texte)) !== null) {
    blocsASIN.push(m[1]);
  }

  for (const bloc of blocsASIN) {
    // Ligne : N $XX.XX $0.00 $X.XX $X.XX $XX.XX
    const mLigne = bloc.match(/(\d+)\s+\$([\d\.]+)\s+\$[\d\.]+\s+\$([\d\.]+)\s+\$([\d\.]+)\s+\$([\d\.]+)\s*$/);
    if (!mLigne) continue;
    const qte      = parseInt(mLigne[1]) || 1;
    const prixUnit = parseFloat(mLigne[2]) || 0;
    const tpsItem  = parseFloat(mLigne[3]) || 0;
    const tvqItem  = parseFloat(mLigne[4]) || 0;
    if (prixUnit <= 0) continue;

    // Description — retirer la ligne de prix, garder la partie anglaise
    const descBrut = bloc.replace(/\d+\s+\$[\d\.]+\s+\$[\d\.]+\s+\$[\d\.]+\s+\$[\d\.]+\s+\$[\d\.]+\s*$/, '').trim();
    const descParts = descBrut.split(/\s*\/\s+/);
    const desc = (descParts[0] || descBrut).trim().replace(/\s+/g, ' ');
    if (!desc || desc.length < 3) continue;

    // Format dans la description
    const fmtMatch = desc.match(/([\d\.]+)\s*(ml|g|L|kg|oz|lb|lbs)/i);

    facture.items.push({
      description:  desc,
      formatQte:    fmtMatch ? parseFloat(fmtMatch[1]) : 0,
      formatUnite:  fmtMatch ? fmtMatch[2].toLowerCase() : 'unité',
      prixUnitaire: prixUnit,
      quantite:     qte
    });

    facture.tps += tpsItem;
    facture.tvq += tvqItem;
  }

  facture.tps   = Math.round(facture.tps * 100) / 100;
  facture.tvq   = Math.round(facture.tvq * 100) / 100;
  facture.total = facture.sousTotal + facture.tps + facture.tvq + facture.livraison;
  return facture;
}
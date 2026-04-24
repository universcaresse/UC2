// ========================================
// UNIVERS CARESSE — CODE V2
// ========================================

const SS_ID = '16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0';

function getSS() {
  return SpreadsheetApp.openById(SS_ID);
}

// ========================================
// COLLECTIONS / GAMMES / FAMILLES
// ========================================

function getCollections_v2() {
  try {
    const sheet = getSS().getSheetByName('Collections_v2');
    if (!sheet) return { success: false, message: 'Collections_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        col_id:        data[i][0],
        rang:          data[i][1],
        nom:           data[i][2],
        slogan:        data[i][3],
        description:   data[i][4],
        couleur_hex:   data[i][5],
        photo_url:     data[i][6],
        photo_noel_url: data[i][7]
      });
    }
    items.sort((a, b) => a.rang - b.rang);
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getGammes_v2() {
  try {
    const sheet = getSS().getSheetByName('Gammes_v2');
    if (!sheet) return { success: false, message: 'Gammes_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        gam_id:        data[i][0],
        col_id:        data[i][1],
        rang:          data[i][2],
        nom:           data[i][3],
        description:   data[i][4],
        couleur_hex:   data[i][5],
        photo_url:     data[i][6],
        photo_noel_url: data[i][7]
      });
    }
    items.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getFamilles_v2() {
  try {
    const sheet = getSS().getSheetByName('Familles_v2');
    if (!sheet) return { success: false, message: 'Familles_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        fam_id:        data[i][0],
        col_id:        data[i][1],
        rang:          data[i][2],
        nom:           data[i][3],
        description:   data[i][4],
        couleur_hex:   data[i][5],
        photo_url:     data[i][6],
        photo_noel_url: data[i][7]
      });
    }
    items.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// PRODUITS
// ========================================

function getProduits_v2() {
  try {
    const sheet = getSS().getSheetByName('Produits_v2');
    if (!sheet) return { success: false, message: 'Produits_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        pro_id:                 data[i][0],
        col_id:                 data[i][1],
        gam_id:                 data[i][2],
        fam_id:                 data[i][3],
        nom:                    data[i][4],
        description:            data[i][5],
        desc_emballage:         data[i][6],
        couleur_hex:            data[i][7],
        surgras:                data[i][8],
        nb_unites:              parseInt(data[i][9]) || 1,
        cure:                   parseInt(data[i][10]) || 0,
        instructions:           data[i][11],
        notes:                  data[i][12],
        image_url:              data[i][13],
        image_noel_url:         data[i][14],
        statut:                 data[i][15] || 'test',
        collections_secondaires: data[i][16] ? String(data[i][16]).split(',').map(s => s.trim()).filter(Boolean) : []
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getProduitsIngredients_v2(pro_id) {
  try {
    const sheet = getSS().getSheetByName('Produits_Ingredients_v2');
    if (!sheet) return { success: false, message: 'Produits_Ingredients_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      if (pro_id && String(data[i][0]) !== String(pro_id)) continue;
      items.push({
        pro_id:         data[i][0],
        ing_id:         data[i][1],
        nom_ingredient: data[i][2],
        quantite_g:     parseFloat(data[i][3]) || 0
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getProduitsFormats_v2(pro_id) {
  try {
    const sheet = getSS().getSheetByName('Produits_Formats_v2');
    if (!sheet) return { success: false, message: 'Produits_Formats_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      if (pro_id && String(data[i][0]) !== String(pro_id)) continue;
      items.push({
        pro_id:     data[i][0],
        poids:      parseFloat(data[i][1]) || 0,
        unite:      data[i][2] || 'g',
        prix_vente: parseFloat(data[i][3]) || 0,
        emb_id:     data[i][4] || ''
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// INGRÉDIENTS / INCI
// ========================================

function getIngredientsInci_v2() {
  try {
    const sheet = getSS().getSheetByName('Ingredients_INCI_v2');
    if (!sheet) return { success: false, message: 'Ingredients_INCI_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        ing_id:        data[i][0],
        cat_id:        data[i][1],
        nom_fournisseur: data[i][2],
        nom_UC:        data[i][3],
        inci:          data[i][4],
        nom_botanique: data[i][5],
        source:        data[i][6],
        note_olfactive: data[i][7],
        statut:        data[i][8],
        date_ajout:    data[i][9]
      });
    }
    items.sort((a, b) => (a.nom_UC || '').localeCompare(b.nom_UC || '', 'fr'));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getCategoriesUC_v2() {
  try {
    const sheet = getSS().getSheetByName('Categories_UC_v2');
    if (!sheet) return { success: false, message: 'Categories_UC_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        cat_id:    data[i][0],
        nom:       data[i][1],
        date_ajout: data[i][2]
      });
    }
    items.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getMappingFournisseurs_v2() {
  try {
    const sheet = getSS().getSheetByName('Mapping_Fournisseurs_v2');
    if (!sheet) return { success: false, message: 'Mapping_Fournisseurs_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        fournisseur:          data[i][0],
        categorie_fournisseur: data[i][1],
        nom_fournisseur:      data[i][2],
        categorie_UC:         data[i][3],
        nom_UC:               data[i][4],
        ing_id:               data[i][5]
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// FOURNISSEURS
// ========================================

function getFournisseurs_v2() {
  try {
    const sheet = getSS().getSheetByName('Fournisseurs_v2');
    if (!sheet) return { success: false, message: 'Fournisseurs_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        four_id:  data[i][0],
        code:     data[i][1],
        nom:      data[i][2],
        site_web: data[i][3],
        notes:    data[i][4]
      });
    }
    items.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// ACHATS
// ========================================

function getAchatsEntete_v2() {
  try {
    const sheet = getSS().getSheetByName('Achats_Entete_v2');
    if (!sheet) return { success: false, message: 'Achats_Entete_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      let date = data[i][1];
      if (date instanceof Date) date = Utilities.formatDate(date, 'America/Toronto', 'yyyy-MM-dd');
      items.push({
        ach_id:           data[i][0],
        date:             date,
        four_id:          data[i][2],
        sous_total:       parseFloat(data[i][3]) || 0,
        tps:              parseFloat(data[i][4]) || 0,
        tvq:              parseFloat(data[i][5]) || 0,
        livraison:        parseFloat(data[i][6]) || 0,
        total:            parseFloat(data[i][7]) || 0,
        facteur_majoration: parseFloat(data[i][8]) || 1,
        statut:           data[i][9] || 'En cours'
      });
    }
    items.sort((a, b) => b.date.localeCompare(a.date));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getAchatsLignes_v2(ach_id) {
  try {
    const sheet = getSS().getSheetByName('Achats_Lignes_v2');
    if (!sheet) return { success: false, message: 'Achats_Lignes_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      if (ach_id && String(data[i][0]) !== String(ach_id)) continue;
      items.push({
        ach_id:       data[i][0],
        ing_id:       data[i][1],
        format_qte:   parseFloat(data[i][2]) || 0,
        format_unite: data[i][3] || 'g',
        prix_unitaire: parseFloat(data[i][4]) || 0,
        prix_par_g:   parseFloat(data[i][5]) || 0,
        prix_par_g_reel: parseFloat(data[i][6]) || 0,
        quantite:     parseFloat(data[i][7]) || 0,
        prix_total:   parseFloat(data[i][8]) || 0,
        notes:        data[i][9] || ''
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function createAchatEntete_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Achats_Entete_v2');
    if (!sheet) return { success: false, message: 'Achats_Entete_v2 introuvable' };
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(data.ach_id)) {
        return { success: false, message: 'Cet achat existe déjà' };
      }
    }
    sheet.appendRow([
      data.ach_id, data.date, data.four_id,
      0, 0, 0, 0, 0, 1, 'En cours'
    ]);
    return { success: true, ach_id: data.ach_id };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function addAchatLigne_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Achats_Lignes_v2');
    if (!sheet) return { success: false, message: 'Achats_Lignes_v2 introuvable' };
    const formatQte   = parseFloat(data.format_qte) || 0;
    const formatUnite = data.format_unite || 'g';
    const prixUnitaire = parseFloat(data.prix_unitaire) || 0;
    let grammes = formatQte;
    if (formatUnite === 'L')  grammes = formatQte * 1000;
    if (formatUnite === 'kg') grammes = formatQte * 1000;
    const prixParG  = grammes > 0 ? prixUnitaire / grammes : 0;
    const prixTotal = (parseFloat(data.quantite) || 0) * prixUnitaire;
    sheet.appendRow([
      data.ach_id, data.ing_id, formatQte, formatUnite,
      prixUnitaire, prixParG.toFixed(6), 0,
      parseFloat(data.quantite) || 0, prixTotal.toFixed(2), data.notes || ''
    ]);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function finaliserAchat_v2(data) {
  try {
    const enteteSheet = getSS().getSheetByName('Achats_Entete_v2');
    const lignesSheet = getSS().getSheetByName('Achats_Lignes_v2');
    if (!enteteSheet) return { success: false, message: 'Achats_Entete_v2 introuvable' };

    const sousTotal  = parseFloat(data.sous_total) || 0;
    const tps        = parseFloat(data.tps) || 0;
    const tvq        = parseFloat(data.tvq) || 0;
    const livraison  = parseFloat(data.livraison) || 0;
    const total      = sousTotal + tps + tvq + livraison;
    const facteur    = sousTotal > 0 ? total / sousTotal : 1;

    const enteteData = enteteSheet.getDataRange().getValues();
    for (let i = 1; i < enteteData.length; i++) {
      if (String(enteteData[i][0]) === String(data.ach_id)) {
        enteteSheet.getRange(i + 1, 4).setValue(sousTotal.toFixed(2));
        enteteSheet.getRange(i + 1, 5).setValue(tps.toFixed(2));
        enteteSheet.getRange(i + 1, 6).setValue(tvq.toFixed(2));
        enteteSheet.getRange(i + 1, 7).setValue(livraison.toFixed(2));
        enteteSheet.getRange(i + 1, 8).setValue(total.toFixed(2));
        enteteSheet.getRange(i + 1, 9).setValue(facteur.toFixed(6));
        enteteSheet.getRange(i + 1, 10).setValue('Finalisé');
        break;
      }
    }

    if (lignesSheet) {
      const lignesData = lignesSheet.getDataRange().getValues();
      for (let i = 1; i < lignesData.length; i++) {
        if (String(lignesData[i][0]) === String(data.ach_id)) {
          const prixParG = parseFloat(lignesData[i][5]) || 0;
          lignesSheet.getRange(i + 1, 7).setValue((prixParG * facteur).toFixed(6));
        }
      }
    }

    mettreAJourStock_v2(data.ach_id, facteur);
    return { success: true, total: total.toFixed(2), facteur: facteur.toFixed(4) };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function deleteAchatLigne_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Achats_Lignes_v2');
    if (!sheet) return { success: false, message: 'Achats_Lignes_v2 introuvable' };
    sheet.deleteRow(data.rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function deleteAchat_v2(data) {
  try {
    const enteteSheet = getSS().getSheetByName('Achats_Entete_v2');
    const lignesSheet = getSS().getSheetByName('Achats_Lignes_v2');
    if (!enteteSheet) return { success: false, message: 'Achats_Entete_v2 introuvable' };

    const enteteData = enteteSheet.getDataRange().getValues();
    for (let i = enteteData.length - 1; i >= 1; i--) {
      if (String(enteteData[i][0]) === String(data.ach_id)) { enteteSheet.deleteRow(i + 1); break; }
    }
    if (lignesSheet) {
      const lignesData = lignesSheet.getDataRange().getValues();
      for (let i = lignesData.length - 1; i >= 1; i--) {
        if (String(lignesData[i][0]) === String(data.ach_id)) lignesSheet.deleteRow(i + 1);
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// STOCK
// ========================================

function mettreAJourStock_v2(ach_id, facteur) {
  try {
    const lignesSheet = getSS().getSheetByName('Achats_Lignes_v2');
    const stockSheet  = getSS().getSheetByName('Stock_Ingredients_v2');
    if (!lignesSheet || !stockSheet) return;

    const lignesData = lignesSheet.getDataRange().getValues();
    const stockData  = stockSheet.getDataRange().getValues();

    for (let i = 1; i < lignesData.length; i++) {
      const row = lignesData[i];
      if (String(row[0]) !== String(ach_id)) continue;

      const ing_id      = row[1];
      const formatQte   = parseFloat(row[2]) || 0;
      const formatUnite = row[3] || 'g';
      const quantite    = parseFloat(row[7]) || 0;
      const prixParGReel = parseFloat(row[6]) || 0;

      let grammes = formatQte;
      if (formatUnite === 'L')  grammes = formatQte * 1000;
      if (formatUnite === 'kg') grammes = formatQte * 1000;
      const grammesAjoutes = quantite * grammes;

      let trouve = false;
      for (let j = 1; j < stockData.length; j++) {
        if (String(stockData[j][0]) === String(ing_id)) {
          const stockActuel = parseFloat(stockData[j][1]) || 0;
          const aujourd_hui = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd');
          stockSheet.getRange(j + 1, 2).setValue(stockActuel + grammesAjoutes);
          stockSheet.getRange(j + 1, 3).setValue(prixParGReel);
          stockSheet.getRange(j + 1, 4).setValue(aujourd_hui);
          stockData[j][1] = stockActuel + grammesAjoutes;
          trouve = true;
          break;
        }
      }
      if (!trouve) {
        const aujourd_hui = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd');
        stockSheet.appendRow([ing_id, grammesAjoutes, prixParGReel, aujourd_hui]);
        stockData.push([ing_id, grammesAjoutes, prixParGReel, aujourd_hui]);
      }
    }
  } catch(e) {
    Logger.log('mettreAJourStock_v2 erreur : ' + e.message);
  }
}

function getStock_v2() {
  try {
    const stockSheet = getSS().getSheetByName('Stock_Ingredients_v2');
    const inciSheet  = getSS().getSheetByName('Ingredients_INCI_v2');
    if (!stockSheet) return { success: false, message: 'Stock_Ingredients_v2 introuvable' };

    const stockData = stockSheet.getDataRange().getValues();
    const inciData  = inciSheet ? inciSheet.getDataRange().getValues() : [];

    const inciMap = {};
    for (let i = 1; i < inciData.length; i++) {
      if (inciData[i][0]) inciMap[inciData[i][0]] = { nom_UC: inciData[i][3], cat_id: inciData[i][1] };
    }

    const items = [];
    for (let i = 1; i < stockData.length; i++) {
      if (!stockData[i][0]) continue;
      const ing_id = stockData[i][0];
      const info   = inciMap[ing_id] || {};
      let date = stockData[i][3];
      if (date instanceof Date) date = Utilities.formatDate(date, 'America/Toronto', 'yyyy-MM-dd');
      items.push({
        ing_id:          ing_id,
        nom_UC:          info.nom_UC || '',
        cat_id:          info.cat_id || '',
        qte_g:           parseFloat(stockData[i][1]) || 0,
        prix_par_g_reel: parseFloat(stockData[i][2]) || 0,
        date_derniere_maj: date
      });
    }
    items.sort((a, b) => (a.nom_UC || '').localeCompare(b.nom_UC || '', 'fr'));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function diminuerStockLot_v2(data) {
  try {
    const stockSheet   = getSS().getSheetByName('Stock_Ingredients_v2');
    const produitsIngSheet = getSS().getSheetByName('Produits_Ingredients_v2');
    if (!stockSheet || !produitsIngSheet) return { success: false, message: 'Sheet introuvable' };

    const prodData  = produitsIngSheet.getDataRange().getValues();
    const stockData = stockSheet.getDataRange().getValues();
    const multiplicateur = parseFloat(data.multiplicateur) || 1;

    for (let i = 1; i < prodData.length; i++) {
      if (String(prodData[i][0]) !== String(data.pro_id)) continue;
      const ing_id    = prodData[i][1];
      const quantite  = (parseFloat(prodData[i][3]) || 0) * multiplicateur;

      for (let j = 1; j < stockData.length; j++) {
        if (String(stockData[j][0]) === String(ing_id)) {
          const stockActuel  = parseFloat(stockData[j][1]) || 0;
          const nouveauStock = Math.max(0, stockActuel - quantite);
          stockSheet.getRange(j + 1, 2).setValue(nouveauStock);
          stockData[j][1] = nouveauStock;
          break;
        }
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// LOTS (FABRICATION)
// ========================================

function getLots_v2() {
  try {
    const sheet = getSS().getSheetByName('Lots_v2');
    if (!sheet) return { success: false, message: 'Lots_v2 introuvable' };
    const data        = sheet.getDataRange().getValues();
    const aujourd_hui = new Date();
    const items       = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      let dateFab  = data[i][4];
      let dateDispo = data[i][5];
      if (dateFab  instanceof Date) dateFab  = Utilities.formatDate(dateFab,  'America/Toronto', 'yyyy-MM-dd');
      if (dateDispo instanceof Date) dateDispo = Utilities.formatDate(dateDispo, 'America/Toronto', 'yyyy-MM-dd');
      const nbUnites = parseInt(data[i][3]) || 0;
      const statut   = data[i][10] || (new Date(dateDispo) > aujourd_hui ? 'en_cure' : nbUnites > 0 ? 'disponible' : 'epuise');
      items.push({
        lot_id:             data[i][0],
        pro_id:             data[i][1],
        multiplicateur:     parseFloat(data[i][2]) || 1,
        nb_unites:          nbUnites,
        date_fabrication:   dateFab,
        date_disponibilite: dateDispo,
        cout_ingredients:   parseFloat(data[i][6]) || 0,
        cout_emballages:    parseFloat(data[i][7]) || 0,
        cout_revient_total: parseFloat(data[i][8]) || 0,
        cout_par_unite:     parseFloat(data[i][9]) || 0,
        statut
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveLot_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Lots_v2');
    if (!sheet) return { success: false, message: 'Lots_v2 introuvable' };
    sheet.appendRow([
      data.lot_id, data.pro_id, data.multiplicateur, data.nb_unites,
      data.date_fabrication, data.date_disponibilite,
      data.cout_ingredients, data.cout_emballages,
      data.cout_revient_total, data.cout_par_unite,
      'en_cure'
    ]);
    diminuerStockLot_v2({ pro_id: data.pro_id, multiplicateur: data.multiplicateur });
    return { success: true, lot_id: data.lot_id };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// VENTES
// ========================================

function getVentesEntete_v2() {
  try {
    const sheet = getSS().getSheetByName('Ventes_Entete_v2');
    if (!sheet) return { success: false, message: 'Ventes_Entete_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      let date = data[i][1];
      if (date instanceof Date) date = Utilities.formatDate(date, 'America/Toronto', 'yyyy-MM-dd');
      items.push({
        ven_id:  data[i][0],
        date,
        client:  data[i][2],
        total:   parseFloat(data[i][3]) || 0,
        statut:  data[i][4] || 'En cours'
      });
    }
    items.sort((a, b) => b.date.localeCompare(a.date));
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getVentesLignes_v2(ven_id) {
  try {
    const sheet = getSS().getSheetByName('Ventes_Lignes_v2');
    if (!sheet) return { success: false, message: 'Ventes_Lignes_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      if (ven_id && String(data[i][0]) !== String(ven_id)) continue;
      items.push({
        ven_id:       data[i][0],
        pro_id:       data[i][1],
        lot_id:       data[i][2],
        quantite:     parseInt(data[i][3]) || 0,
        prix_unitaire: parseFloat(data[i][4]) || 0,
        prix_total:   parseFloat(data[i][5]) || 0
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function createVente_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Ventes_Entete_v2');
    if (!sheet) return { success: false, message: 'Ventes_Entete_v2 introuvable' };
    sheet.appendRow([data.ven_id, data.date, data.client || '', 0, 'En cours']);
    return { success: true, ven_id: data.ven_id };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function addVenteLigne_v2(data) {
  try {
    const lignesSheet = getSS().getSheetByName('Ventes_Lignes_v2');
    const enteteSheet = getSS().getSheetByName('Ventes_Entete_v2');
    if (!lignesSheet) return { success: false, message: 'Ventes_Lignes_v2 introuvable' };

    const prixTotal = (parseFloat(data.quantite) || 0) * (parseFloat(data.prix_unitaire) || 0);
    lignesSheet.appendRow([
      data.ven_id, data.pro_id, data.lot_id || '',
      parseInt(data.quantite) || 0,
      parseFloat(data.prix_unitaire) || 0,
      prixTotal.toFixed(2)
    ]);

    // Mettre à jour le total de l'entête
    if (enteteSheet) {
      const enteteData = enteteSheet.getDataRange().getValues();
      for (let i = 1; i < enteteData.length; i++) {
        if (String(enteteData[i][0]) === String(data.ven_id)) {
          const totalActuel = parseFloat(enteteData[i][3]) || 0;
          enteteSheet.getRange(i + 1, 4).setValue((totalActuel + prixTotal).toFixed(2));
          break;
        }
      }
    }

    // Diminuer le stock du lot
    if (data.lot_id) diminuerStockLot_v2({ lot_id: data.lot_id, quantite: data.quantite });

    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function finaliserVente_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Ventes_Entete_v2');
    if (!sheet) return { success: false, message: 'Ventes_Entete_v2 introuvable' };
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(data.ven_id)) {
        sheet.getRange(i + 1, 5).setValue('Finalisée');
        break;
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// CONFIG / DENSITÉS
// ========================================

function getConfig_v2() {
  try {
    const sheet = getSS().getSheetByName('Config_v2');
    if (!sheet) return { success: false, message: 'Config_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        type:           data[i][0],
        densite:        parseFloat(data[i][1]) || 1,
        unite:          data[i][2] || 'g',
        marge_perte_pct: parseFloat(data[i][3]) || 0
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveConfig_v2(data) {
  try {
    const sheet     = getSS().getSheetByName('Config_v2');
    if (!sheet) return { success: false, message: 'Config_v2 introuvable' };
    const sheetData = sheet.getDataRange().getValues();
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.type) {
        sheet.getRange(i + 1, 2).setValue(data.densite);
        sheet.getRange(i + 1, 3).setValue(data.unite);
        sheet.getRange(i + 1, 4).setValue(data.marge_perte_pct || 0);
        return { success: true };
      }
    }
    return { success: false, message: 'Type introuvable' };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// CONTENU SITE
// ========================================

function getContenu_v2() {
  try {
    const sheet = getSS().getSheetByName('Contenu_v2');
    if (!sheet) return { success: false, message: 'Contenu_v2 introuvable' };
    const rows    = sheet.getDataRange().getValues();
    const contenu = {};
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) contenu[rows[i][0]] = rows[i][1];
    }
    return { success: true, contenu };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function updateContenu_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Contenu_v2');
    if (!sheet) return { success: false, message: 'Contenu_v2 introuvable' };
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (data.contenu[rows[i][0]] !== undefined) {
        sheet.getRange(i + 1, 2).setValue(data.contenu[rows[i][0]]);
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// MÉDIATHÈQUE
// ========================================

function getMediatheque_v2() {
  try {
    const sheet = getSS().getSheetByName('Mediatheque_v2');
    if (!sheet) return { success: false, message: 'Mediatheque_v2 introuvable' };
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        rowIndex:  i + 1,
        url:       data[i][0],
        nom:       data[i][1],
        categorie: data[i][2],
        date_ajout: data[i][3]
      });
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveMediatheque_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Mediatheque_v2');
    if (!sheet) return { success: false, message: 'Mediatheque_v2 introuvable' };
    const today = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd');
    if (data.rowIndex) {
      sheet.getRange(data.rowIndex, 1, 1, 4).setValues([[
        data.url || '', data.nom || '', data.categorie || '', today
      ]]);
    } else {
      sheet.appendRow([data.url || '', data.nom || '', data.categorie || '', today]);
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function supprimerMediatheque_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Mediatheque_v2');
    if (!sheet) return { success: false, message: 'Mediatheque_v2 introuvable' };
    if (!data.rowIndex) return { success: false, message: 'rowIndex manquant' };
    sheet.deleteRow(data.rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// CATALOGUE PUBLIC V2
// ========================================

function getCataloguePublic_v2() {
  try {
    const ss = getSS();
    const produitsSheet     = ss.getSheetByName('Produits_v2');
    const collectionsSheet  = ss.getSheetByName('Collections_v2');
    const gammesSheet       = ss.getSheetByName('Gammes_v2');
    const formatsSheet      = ss.getSheetByName('Produits_Formats_v2');
    const ingredientsSheet  = ss.getSheetByName('Produits_Ingredients_v2');
    if (!produitsSheet) return { success: false, message: 'Produits_v2 introuvable' };

    // Collections
    const infoCollections = {};
    if (collectionsSheet) {
      const colData = collectionsSheet.getDataRange().getValues();
      for (let i = 1; i < colData.length; i++) {
        if (colData[i][0]) {
          infoCollections[colData[i][0]] = {
            rang: colData[i][1], nom: colData[i][2], slogan: colData[i][3],
            description: colData[i][4], couleur_hex: colData[i][5], photo_url: colData[i][6]
          };
        }
      }
    }

    // Gammes
    const infoGammes = {};
    if (gammesSheet) {
      const gamData = gammesSheet.getDataRange().getValues();
      for (let i = 1; i < gamData.length; i++) {
        if (gamData[i][0]) {
          infoGammes[gamData[i][0]] = { col_id: gamData[i][1], nom: gamData[i][3], description: gamData[i][4] };
        }
      }
    }

    // Formats
    const formatsMap = {};
    if (formatsSheet) {
      const fData = formatsSheet.getDataRange().getValues();
      for (let i = 1; i < fData.length; i++) {
        const pid = String(fData[i][0]);
        if (!formatsMap[pid]) formatsMap[pid] = [];
        formatsMap[pid].push({ poids: fData[i][1], unite: fData[i][2], prix_vente: parseFloat(fData[i][3]) || 0 });
      }
    }

    // Ingrédients
    const ingredientsMap = {};
    if (ingredientsSheet) {
      const iData = ingredientsSheet.getDataRange().getValues();
      for (let i = 1; i < iData.length; i++) {
        const pid = String(iData[i][0]);
        if (!ingredientsMap[pid]) ingredientsMap[pid] = [];
        ingredientsMap[pid].push({ ing_id: iData[i][1], nom_ingredient: iData[i][2], quantite_g: parseFloat(iData[i][3]) || 0 });
      }
    }

    // Produits publics
    const produitsData = produitsSheet.getDataRange().getValues();
    const produits     = [];
    for (let i = 1; i < produitsData.length; i++) {
      const row = produitsData[i];
      if (!row[0] || row[15] === 'test' || row[15] === 'archive') continue;
      const pro_id  = String(row[0]);
      const col_id  = row[1];
      const gam_id  = row[2];
      const infoCol = infoCollections[col_id] || {};
      const infoGam = infoGammes[gam_id] || {};
      produits.push({
        pro_id, col_id, gam_id,
        rang:        infoCol.rang || 99,
        nom:         row[4],
        description: row[5],
        couleur_hex: row[7] || infoCol.couleur_hex || '#c44536',
        image_url:   row[13],
        image_noel_url: row[14],
        statut:      row[15],
        collections_secondaires: row[16] ? String(row[16]).split(',').map(s => s.trim()).filter(Boolean) : [],
        nom_collection: infoCol.nom || '',
        slogan_collection: infoCol.slogan || '',
        nom_gamme:   infoGam.nom || '',
        formats:     formatsMap[pro_id] || [],
        ingredients: ingredientsMap[pro_id] || []
      });
    }

    produits.sort((a, b) => {
      if (a.rang !== b.rang) return a.rang - b.rang;
      if (a.nom_gamme !== b.nom_gamme) return a.nom_gamme.localeCompare(b.nom_gamme, 'fr');
      return a.nom.localeCompare(b.nom, 'fr');
    });

    return { success: true, produits, infoCollections };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// CONTACT
// ========================================

function envoyerContact_v2(data) {
  try {
    const prenom   = data.prenom   || '';
    const nom      = data.nom      || '';
    const courriel = data.courriel || '';
    const sujet    = data.sujet    || 'Message du site';
    const message  = data.message  || '';
    if (!prenom || !nom || !courriel || !message) return { success: false, message: 'Champs obligatoires manquants.' };
    MailApp.sendEmail({
      to:      'universcaresse@outlook.com',
      subject: `[Univers Caresse] ${sujet} — ${prenom} ${nom}`,
      body:    `Prénom : ${prenom}\nNom : ${nom}\nCourriel : ${courriel}\nSujet : ${sujet}\n\n${message}`
    });
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// SAUVEGARDE PRODUIT
// ========================================

function saveProduit_v2(data) {
  try {
    const ss             = getSS();
    const produitsSheet  = ss.getSheetByName('Produits_v2');
    const ingredSheet    = ss.getSheetByName('Produits_Ingredients_v2');
    const formatsSheet   = ss.getSheetByName('Produits_Formats_v2');
    if (!produitsSheet) return { success: false, message: 'Produits_v2 introuvable' };

    const pro_id = data.pro_id;

    // Supprimer l'existant
    const existing = produitsSheet.getDataRange().getValues();
    for (let i = existing.length - 1; i >= 1; i--) {
      if (String(existing[i][0]) === String(pro_id)) produitsSheet.deleteRow(i + 1);
    }

    const colsSecondaires = Array.isArray(data.collections_secondaires)
      ? data.collections_secondaires.join(',')
      : (data.collections_secondaires || '');

    produitsSheet.appendRow([
      pro_id, data.col_id, data.gam_id, data.fam_id || '',
      data.nom, data.description, data.desc_emballage || '',
      data.couleur_hex || '', data.surgras || '', data.nb_unites || 1,
      data.cure || 0, data.instructions || '', data.notes || '',
      data.image_url || '', data.image_noel_url || '',
      data.statut || 'test', colsSecondaires
    ]);

    // Ingrédients
    if (ingredSheet) {
      const ingredData = ingredSheet.getDataRange().getValues();
      for (let i = ingredData.length - 1; i >= 1; i--) {
        if (String(ingredData[i][0]) === String(pro_id)) ingredSheet.deleteRow(i + 1);
      }
      if (data.ingredients && data.ingredients.length > 0) {
        data.ingredients.forEach(ing => {
          ingredSheet.appendRow([pro_id, ing.ing_id || '', ing.nom_ingredient || '', ing.quantite_g || 0]);
        });
      }
    }

    // Formats
    if (formatsSheet) {
      const formatsData = formatsSheet.getDataRange().getValues();
      for (let i = formatsData.length - 1; i >= 1; i--) {
        if (String(formatsData[i][0]) === String(pro_id)) formatsSheet.deleteRow(i + 1);
      }
      if (data.formats && data.formats.length > 0) {
        data.formats.forEach(f => {
          formatsSheet.appendRow([pro_id, f.poids, f.unite, f.prix_vente, f.emb_id || '']);
        });
      }
    }

    return { success: true, pro_id };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function deleteProduit_v2(data) {
  try {
    const ss           = getSS();
    const produitsSheet = ss.getSheetByName('Produits_v2');
    const ingredSheet   = ss.getSheetByName('Produits_Ingredients_v2');
    const formatsSheet  = ss.getSheetByName('Produits_Formats_v2');
    if (!produitsSheet) return { success: false, message: 'Produits_v2 introuvable' };

    const pro_id = data.pro_id;
    [produitsSheet, ingredSheet, formatsSheet].forEach(sheet => {
      if (!sheet) return;
      const rows = sheet.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === String(pro_id)) sheet.deleteRow(i + 1);
      }
    });
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// GESTION COLLECTIONS / GAMMES / FAMILLES
// ========================================

function saveCollection_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Collections_v2');
    if (!sheet) return { success: false, message: 'Collections_v2 introuvable' };
    if (data.rowIndex) {
      sheet.getRange(data.rowIndex, 1, 1, 8).setValues([[
        data.col_id, data.rang, data.nom, data.slogan,
        data.description, data.couleur_hex, data.photo_url, data.photo_noel_url || ''
      ]]);
    } else {
      sheet.appendRow([
        data.col_id, data.rang, data.nom, data.slogan,
        data.description, data.couleur_hex, data.photo_url, data.photo_noel_url || ''
      ]);
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveGamme_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Gammes_v2');
    if (!sheet) return { success: false, message: 'Gammes_v2 introuvable' };
    if (data.rowIndex) {
      sheet.getRange(data.rowIndex, 1, 1, 8).setValues([[
        data.gam_id, data.col_id, data.rang, data.nom,
        data.description, data.couleur_hex || '', data.photo_url || '', data.photo_noel_url || ''
      ]]);
    } else {
      sheet.appendRow([
        data.gam_id, data.col_id, data.rang, data.nom,
        data.description, data.couleur_hex || '', data.photo_url || '', data.photo_noel_url || ''
      ]);
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function deleteCollection_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Collections_v2');
    if (!sheet) return { success: false, message: 'Collections_v2 introuvable' };
    if (!data.rowIndex) return { success: false, message: 'rowIndex manquant' };
    sheet.deleteRow(data.rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function deleteGamme_v2(data) {
  try {
    const sheet = getSS().getSheetByName('Gammes_v2');
    if (!sheet) return { success: false, message: 'Gammes_v2 introuvable' };
    if (!data.rowIndex) return { success: false, message: 'rowIndex manquant' };
    sheet.deleteRow(data.rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// doGet V2
// ========================================

function doGet_v2(e) {
  const action = e.parameter.action;
  let result   = {};

  if      (action === 'getCollections')        result = getCollections_v2();
  else if (action === 'getGammes')             result = getGammes_v2();
  else if (action === 'getFamilles')           result = getFamilles_v2();
  else if (action === 'getProduits')           result = getProduits_v2();
  else if (action === 'getProduitsIngredients') result = getProduitsIngredients_v2(e.parameter.pro_id);
  else if (action === 'getProduitsFormats')    result = getProduitsFormats_v2(e.parameter.pro_id);
  else if (action === 'getIngredientsInci')    result = getIngredientsInci_v2();
  else if (action === 'getCategoriesUC')       result = getCategoriesUC_v2();
  else if (action === 'getMappingFournisseurs') result = getMappingFournisseurs_v2();
  else if (action === 'getFournisseurs')       result = getFournisseurs_v2();
  else if (action === 'getAchatsEntete')       result = getAchatsEntete_v2();
  else if (action === 'getAchatsLignes')       result = getAchatsLignes_v2(e.parameter.ach_id);
  else if (action === 'getStock')              result = getStock_v2();
  else if (action === 'getLots')               result = getLots_v2();
  else if (action === 'getVentesEntete')       result = getVentesEntete_v2();
  else if (action === 'getVentesLignes')       result = getVentesLignes_v2(e.parameter.ven_id);
  else if (action === 'getConfig')             result = getConfig_v2();
  else if (action === 'getContenu')            result = getContenu_v2();
  else if (action === 'getMediatheque')        result = getMediatheque_v2();
  else if (action === 'getCatalogue')          result = getCataloguePublic_v2();

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// doPost V2
// ========================================

function doPost_v2(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;
    let result   = { success: false, message: 'Action inconnue' };

    if      (action === 'saveCollection')         result = saveCollection_v2(data);
    else if (action === 'deleteCollection')        result = deleteCollection_v2(data);
    else if (action === 'saveGamme')               result = saveGamme_v2(data);
    else if (action === 'deleteGamme')             result = deleteGamme_v2(data);
    else if (action === 'saveProduit')             result = saveProduit_v2(data);
    else if (action === 'deleteProduit')           result = deleteProduit_v2(data);
    else if (action === 'createAchatEntete')       result = createAchatEntete_v2(data);
    else if (action === 'addAchatLigne')           result = addAchatLigne_v2(data);
    else if (action === 'finaliserAchat')          result = finaliserAchat_v2(data);
    else if (action === 'deleteAchatLigne')        result = deleteAchatLigne_v2(data);
    else if (action === 'deleteAchat')             result = deleteAchat_v2(data);
    else if (action === 'saveLot')                 result = saveLot_v2(data);
    else if (action === 'createVente')             result = createVente_v2(data);
    else if (action === 'addVenteLigne')           result = addVenteLigne_v2(data);
    else if (action === 'finaliserVente')          result = finaliserVente_v2(data);
    else if (action === 'saveConfig')              result = saveConfig_v2(data);
    else if (action === 'updateContenu')           result = updateContenu_v2(data);
    else if (action === 'saveMediatheque')         result = saveMediatheque_v2(data);
    else if (action === 'supprimerMediatheque')    result = supprimerMediatheque_v2(data);
    else if (action === 'envoyerContact')          result = envoyerContact_v2(data);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Erreur: ' + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── ÉTAT GLOBAL ───

let donneesCollections  = [];
let donneesGammes       = [];
let donneesFamilles     = [];
let donneesProduits     = [];
let donneesIngredients  = [];
let donneesCategories   = [];
let donneesFournisseurs = [];
let donneesConfig       = [];
let donneesStock        = [];
let donneesLots         = [];
let donneesVentes       = [];

// ─── CHARGEMENT CIBLÉ ───

async function rechargerCollections()  { const r = await appelAPI_v2('getCollections');  if (r?.success) donneesCollections  = r.items  || []; }
async function rechargerGammes()       { const r = await appelAPI_v2('getGammes');       if (r?.success) donneesGammes       = r.items  || []; }
async function rechargerFamilles()     { const r = await appelAPI_v2('getFamilles');     if (r?.success) donneesFamilles     = r.items  || []; }
async function rechargerProduits()     { const r = await appelAPI_v2('getProduits');     if (r?.success) donneesProduits     = r.items  || []; }
async function rechargerIngredients()  { const r = await appelAPI_v2('getIngredientsInci'); if (r?.success) donneesIngredients = r.items || []; }
async function rechargerCategories()   { const r = await appelAPI_v2('getCategoriesUC'); if (r?.success) donneesCategories   = r.items  || []; }
async function rechargerFournisseurs() { const r = await appelAPI_v2('getFournisseurs'); if (r?.success) donneesFournisseurs = r.items  || []; }
async function rechargerConfig()       { const r = await appelAPI_v2('getConfig');       if (r?.success) donneesConfig       = r.items  || []; }
async function rechargerStock()        { const r = await appelAPI_v2('getStock');        if (r?.success) donneesStock        = r.items  || []; }
async function rechargerLots()         { const r = await appelAPI_v2('getLots');         if (r?.success) donneesLots         = r.items  || []; }
async function rechargerVentes()       { const r = await appelAPI_v2('getVentesEntete'); if (r?.success) donneesVentes       = r.items  || []; }

// ─── INITIALISATION ───

document.addEventListener('DOMContentLoaded', async () => {
  const session = sessionStorage.getItem('uc_admin');
  if (session !== 'true') {
    window.location.href = '/universcaresse/admin/login.html';
    return;
  }
  await chargerDonneesInitiales_v2();
});

async function chargerDonneesInitiales_v2() {
  await Promise.all([
    rechargerCollections(),
    rechargerGammes(),
    rechargerFamilles(),
    rechargerProduits(),
    rechargerIngredients(),
    rechargerCategories(),
    rechargerFournisseurs(),
    rechargerConfig()
  ]);
}

// ─── HELPERS ───

function getCollectionParId(col_id) {
  return donneesCollections.find(c => c.col_id === col_id) || {};
}

function getGammeParId(gam_id) {
  return donneesGammes.find(g => g.gam_id === gam_id) || {};
}

function getGammesDeCollection(col_id) {
  return donneesGammes.filter(g => g.col_id === col_id).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

function getProduitsDeGamme(gam_id) {
  return donneesProduits.filter(p => p.gam_id === gam_id).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

function getIngredientParId(ing_id) {
  return donneesIngredients.find(i => i.ing_id === ing_id) || {};
}

function getFournisseurParId(four_id) {
  return donneesFournisseurs.find(f => f.four_id === four_id) || {};
}

// ─── COLLECTIONS ───

function afficherCollections_v2() {
  const liste = document.getElementById('liste-collections');
  if (!liste) return;
  liste.innerHTML = '';

  const collections = [...donneesCollections].sort((a, b) => a.rang - b.rang);

  collections.forEach(col => {
    const gammes = getGammesDeCollection(col.col_id);
    const nbProduits = donneesProduits.filter(p => p.col_id === col.col_id).length;

    const el = document.createElement('div');
    el.className = 'carte-collection fade-in';
    el.dataset.colId = col.col_id;
    el.innerHTML = `
      <div class="carte-collection-entete" style="border-left: 4px solid ${col.couleur_hex || '#c44536'}">
        <div class="carte-collection-info">
          <span class="carte-collection-id">${col.col_id}</span>
          <strong>${col.nom}</strong>
          <span class="carte-collection-slogan">${col.slogan || ''}</span>
        </div>
        <div class="carte-collection-meta">
          <span>${gammes.length} gamme(s) · ${nbProduits} produit(s)</span>
          <button class="btn btn-secondaire btn-sm" onclick="ouvrirFormulaireCollection('${col.col_id}')">Modifier</button>
        </div>
      </div>
      <div class="carte-gammes">
        ${gammes.map(g => `
          <div class="carte-gamme" data-gam-id="${g.gam_id}">
            <span class="carte-gamme-nom">${g.nom}</span>
            <span class="carte-gamme-desc">${g.description || ''}</span>
            <button class="btn btn-secondaire btn-sm" onclick="ouvrirFormulaireGamme('${g.gam_id}')">Modifier</button>
          </div>
        `).join('')}
        <button class="btn btn-texte btn-sm" onclick="ouvrirFormulaireGamme(null, '${col.col_id}')">+ Ajouter une gamme</button>
      </div>
    `;
    liste.appendChild(el);
  });
}

async function sauvegarderCollection_v2(data) {
  const res = await appelAPIPost_v2('saveCollection', data);
  if (res?.success) {
    await rechargerCollections();
    afficherCollections_v2();
    afficherMsg('collections', '✅ Collection sauvegardée.');
  } else {
    afficherMsg('collections', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function sauvegarderGamme_v2(data) {
  const res = await appelAPIPost_v2('saveGamme', data);
  if (res?.success) {
    await rechargerGammes();
    afficherCollections_v2();
    afficherMsg('collections', '✅ Gamme sauvegardée.');
  } else {
    afficherMsg('collections', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function supprimerCollection_v2(data) {
  if (!confirm('Supprimer cette collection?')) return;
  const res = await appelAPIPost_v2('deleteCollection', data);
  if (res?.success) {
    await rechargerCollections();
    afficherCollections_v2();
    afficherMsg('collections', '✅ Collection supprimée.');
  } else {
    afficherMsg('collections', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function supprimerGamme_v2(data) {
  if (!confirm('Supprimer cette gamme?')) return;
  const res = await appelAPIPost_v2('deleteGamme', data);
  if (res?.success) {
    await rechargerGammes();
    afficherCollections_v2();
    afficherMsg('collections', '✅ Gamme supprimée.');
  } else {
    afficherMsg('collections', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

// ─── PRODUITS ───

let filtreProCol = '';
let filtreProGam = '';

function afficherProduits_v2() {
  const liste = document.getElementById('liste-produits');
  if (!liste) return;

  let produits = [...donneesProduits];
  if (filtreProCol) produits = produits.filter(p => p.col_id === filtreProCol);
  if (filtreProGam) produits = produits.filter(p => p.gam_id === filtreProGam);

  produits.sort((a, b) => {
    const colA = getCollectionParId(a.col_id);
    const colB = getCollectionParId(b.col_id);
    if ((colA.rang || 99) !== (colB.rang || 99)) return (colA.rang || 99) - (colB.rang || 99);
    const gamA = getGammeParId(a.gam_id);
    const gamB = getGammeParId(b.gam_id);
    if ((gamA.nom || '') !== (gamB.nom || '')) return (gamA.nom || '').localeCompare(gamB.nom || '', 'fr');
    return (a.nom || '').localeCompare(b.nom || '', 'fr');
  });

  liste.innerHTML = '';
  produits.forEach(p => {
    const col = getCollectionParId(p.col_id);
    const gam = getGammeParId(p.gam_id);
    const el = document.createElement('div');
    el.className = 'carte-produit fade-in';
    el.dataset.proId = p.pro_id;
    el.innerHTML = `
      <div class="carte-produit-entete" style="border-left: 4px solid ${p.couleur_hex || col.couleur_hex || '#c44536'}">
        <div class="carte-produit-info">
          <span class="carte-produit-id">${p.pro_id}</span>
          <strong>${p.nom}</strong>
          <span class="carte-produit-meta">${col.nom || '—'} · ${gam.nom || '—'}</span>
          <span class="badge badge-${p.statut}">${p.statut}</span>
        </div>
        <div class="carte-produit-actions">
          <button class="btn btn-secondaire btn-sm" onclick="ouvrirFormulaireProduit('${p.pro_id}')">Modifier</button>
          <button class="btn btn-danger btn-sm" onclick="supprimerProduit_v2('${p.pro_id}')">Supprimer</button>
        </div>
      </div>
    `;
    liste.appendChild(el);
  });
}

function filtrerProduitsParCollection(col_id) {
  filtreProCol = col_id;
  filtreProGam = '';
  // Repeupler le filtre gammes
  const selGam = document.getElementById('filtre-pro-gamme');
  if (selGam) {
    selGam.innerHTML = '<option value="">— Toutes les gammes —</option>';
    getGammesDeCollection(col_id).forEach(g => {
      const o = document.createElement('option');
      o.value = g.gam_id;
      o.textContent = g.nom;
      selGam.appendChild(o);
    });
  }
  afficherProduits_v2();
}

function filtrerProduitsParGamme(gam_id) {
  filtreProGam = gam_id;
  afficherProduits_v2();
}

async function sauvegarderProduit_v2(data) {
  const res = await appelAPIPost_v2('saveProduit', data);
  if (res?.success) {
    await rechargerProduits();
    afficherProduits_v2();
    afficherMsg('produits', '✅ Produit sauvegardé.');
  } else {
    afficherMsg('produits', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function supprimerProduit_v2(pro_id) {
  if (!confirm('Supprimer ce produit?')) return;
  const res = await appelAPIPost_v2('deleteProduit', { pro_id });
  if (res?.success) {
    await rechargerProduits();
    afficherProduits_v2();
    afficherMsg('produits', '✅ Produit supprimé.');
  } else {
    afficherMsg('produits', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

// ─── ACHATS ───

let achatActif = null;

function afficherAchats_v2() {
  const liste = document.getElementById('liste-achats');
  if (!liste) return;
  liste.innerHTML = '';

  const achats = [...(donneesAchats || [])].sort((a, b) => b.date.localeCompare(a.date));
  achats.forEach(a => {
    const four = getFournisseurParId(a.four_id);
    const el = document.createElement('div');
    el.className = 'carte-achat fade-in';
    el.innerHTML = `
      <div class="carte-achat-entete">
        <div class="carte-achat-info">
          <span class="carte-achat-id">${a.ach_id}</span>
          <strong>${four.nom || a.four_id}</strong>
          <span>${a.date}</span>
          <span class="badge badge-${a.statut === 'Finalisé' ? 'public' : 'test'}">${a.statut}</span>
        </div>
        <div class="carte-achat-meta">
          <span>${a.total ? a.total.toFixed(2) + ' $' : '—'}</span>
          <button class="btn btn-secondaire btn-sm" onclick="ouvrirAchat('${a.ach_id}')">Ouvrir</button>
          ${a.statut !== 'Finalisé' ? `<button class="btn btn-primaire btn-sm" onclick="finaliserAchat_v2('${a.ach_id}')">Finaliser</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="supprimerAchat_v2('${a.ach_id}')">Supprimer</button>
        </div>
      </div>
    `;
    liste.appendChild(el);
  });
}

async function chargerAchats_v2() {
  const res = await appelAPI_v2('getAchatsEntete');
  if (res?.success) donneesAchats = res.items || [];
  afficherAchats_v2();
}

async function creerAchat_v2() {
  const four_id = document.getElementById('achat-fournisseur')?.value;
  const date    = document.getElementById('achat-date')?.value;
  if (!four_id || !date) { afficherMsg('achats', '❌ Fournisseur et date requis.', 'erreur'); return; }

  const ach_id = 'ACH-' + Date.now();
  const res = await appelAPIPost_v2('createAchatEntete', { ach_id, date, four_id });
  if (res?.success) {
    achatActif = ach_id;
    await chargerAchats_v2();
    ouvrirAchat(ach_id);
    afficherMsg('achats', '✅ Achat créé.');
  } else {
    afficherMsg('achats', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function ajouterLigneAchat_v2() {
  if (!achatActif) { afficherMsg('achats', '❌ Aucun achat actif.', 'erreur'); return; }

  const ing_id      = document.getElementById('achat-ingredient')?.value;
  const format_qte  = document.getElementById('achat-format-qte')?.value;
  const format_unite = document.getElementById('achat-format-unite')?.value;
  const prix_unitaire = document.getElementById('achat-prix')?.value;
  const quantite    = document.getElementById('achat-quantite')?.value;
  const notes       = document.getElementById('achat-notes')?.value;

  if (!ing_id || !quantite || !prix_unitaire) {
    afficherMsg('achats', '❌ Ingrédient, quantité et prix requis.', 'erreur');
    return;
  }

  const res = await appelAPIPost_v2('addAchatLigne', {
    ach_id: achatActif, ing_id,
    format_qte, format_unite, prix_unitaire, quantite, notes
  });
  if (res?.success) {
    await afficherLignesAchat_v2(achatActif);
    afficherMsg('achats', '✅ Ligne ajoutée.');
  } else {
    afficherMsg('achats', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function afficherLignesAchat_v2(ach_id) {
  const res = await appelAPI_v2('getAchatsLignes', { ach_id });
  const liste = document.getElementById('liste-lignes-achat');
  if (!liste || !res?.success) return;
  liste.innerHTML = '';
  let sousTotal = 0;
  res.items.forEach((l, idx) => {
    const ing = getIngredientParId(l.ing_id);
    sousTotal += l.prix_total || 0;
    const el = document.createElement('div');
    el.className = 'ligne-achat';
    el.innerHTML = `
      <span>${ing.nom_UC || l.ing_id}</span>
      <span>${l.quantite} × ${l.format_qte} ${l.format_unite}</span>
      <span>${l.prix_unitaire.toFixed(2)} $</span>
      <span>${(l.prix_total || 0).toFixed(2)} $</span>
      <button class="btn btn-danger btn-sm" onclick="supprimerLigneAchat_v2(${idx + 2})">✕</button>
    `;
    liste.appendChild(el);
  });
  const elTotal = document.getElementById('achat-sous-total');
  if (elTotal) elTotal.textContent = sousTotal.toFixed(2) + ' $';
}

async function finaliserAchat_v2(ach_id) {
  const tps      = parseFloat(document.getElementById('achat-tps')?.value) || 0;
  const tvq      = parseFloat(document.getElementById('achat-tvq')?.value) || 0;
  const livraison = parseFloat(document.getElementById('achat-livraison')?.value) || 0;
  const lignesRes = await appelAPI_v2('getAchatsLignes', { ach_id });
  const sous_total = (lignesRes?.items || []).reduce((s, l) => s + (l.prix_total || 0), 0);

  const res = await appelAPIPost_v2('finaliserAchat', { ach_id, sous_total, tps, tvq, livraison });
  if (res?.success) {
    await chargerAchats_v2();
    await rechargerStock();
    afficherMsg('achats', '✅ Achat finalisé. Stock mis à jour.');
  } else {
    afficherMsg('achats', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function supprimerLigneAchat_v2(rowIndex) {
  if (!confirm('Supprimer cette ligne?')) return;
  const res = await appelAPIPost_v2('deleteAchatLigne', { rowIndex });
  if (res?.success) {
    await afficherLignesAchat_v2(achatActif);
    afficherMsg('achats', '✅ Ligne supprimée.');
  } else {
    afficherMsg('achats', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function supprimerAchat_v2(ach_id) {
  if (!confirm('Supprimer cet achat et toutes ses lignes?')) return;
  const res = await appelAPIPost_v2('deleteAchat', { ach_id });
  if (res?.success) {
    await chargerAchats_v2();
    afficherMsg('achats', '✅ Achat supprimé.');
  } else {
    afficherMsg('achats', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

function ouvrirAchat(ach_id) {
  achatActif = ach_id;
  afficherLignesAchat_v2(ach_id);
  const panel = document.getElementById('panel-lignes-achat');
  if (panel) panel.classList.remove('cache');
}
// ─── STOCK ───

async function chargerStock_v2() {
  await rechargerStock();
  afficherStock_v2();
}

function afficherStock_v2() {
  const liste = document.getElementById('liste-stock');
  if (!liste) return;
  liste.innerHTML = '';

  const stock = [...donneesStock].sort((a, b) => (a.nom_UC || '').localeCompare(b.nom_UC || '', 'fr'));

  stock.forEach(s => {
    const cat = donneesCategories.find(c => c.cat_id === s.cat_id);
    const alerte = s.qte_g < 100;
    const el = document.createElement('div');
    el.className = 'carte-stock fade-in' + (alerte ? ' carte-stock-alerte' : '');
    el.innerHTML = `
      <div class="carte-stock-info">
        <span class="carte-stock-id">${s.ing_id}</span>
        <strong>${s.nom_UC || '—'}</strong>
        <span class="carte-stock-cat">${cat?.nom || '—'}</span>
      </div>
      <div class="carte-stock-chiffres">
        <span class="${alerte ? 'texte-alerte' : ''}">${s.qte_g.toFixed(0)} g</span>
        <span>${s.prix_par_g_reel ? s.prix_par_g_reel.toFixed(4) + ' $/g' : '—'}</span>
        <span class="carte-stock-date">${s.date_derniere_maj || '—'}</span>
      </div>
    `;
    liste.appendChild(el);
  });

  // Résumé
  const total = donneesStock.reduce((s, i) => s + (i.qte_g || 0) * (i.prix_par_g_reel || 0), 0);
  const elTotal = document.getElementById('stock-valeur-totale');
  if (elTotal) elTotal.textContent = total.toFixed(2) + ' $';
}

// ─── FABRICATION ───

async function chargerFabrication_v2() {
  await rechargerLots();
  afficherLots_v2();
}

function afficherLots_v2() {
  const liste = document.getElementById('liste-lots');
  if (!liste) return;
  liste.innerHTML = '';

  const lots = [...donneesLots].sort((a, b) => b.date_fabrication.localeCompare(a.date_fabrication));
  lots.forEach(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id) || {};
    const col = getCollectionParId(pro.col_id);
    const gam = getGammeParId(pro.gam_id);
    const el = document.createElement('div');
    el.className = 'carte-lot fade-in';
    el.innerHTML = `
      <div class="carte-lot-entete">
        <div class="carte-lot-info">
          <span class="carte-lot-id">${l.lot_id}</span>
          <strong>${pro.nom || l.pro_id}</strong>
          <span>${col.nom || '—'} · ${gam.nom || '—'}</span>
          <span class="badge badge-${l.statut}">${l.statut}</span>
        </div>
        <div class="carte-lot-chiffres">
          <span>${l.nb_unites} unité(s)</span>
          <span>Fab : ${l.date_fabrication}</span>
          <span>Dispo : ${l.date_disponibilite}</span>
          <span>${l.cout_par_unite ? l.cout_par_unite.toFixed(2) + ' $/u' : '—'}</span>
        </div>
      </div>
    `;
    liste.appendChild(el);
  });
}

function calculerApercuLot_v2() {
  const selPro = document.getElementById('fab-produit');
  if (!selPro?.value) return;

  const pro   = donneesProduits.find(p => p.pro_id === selPro.value);
  if (!pro) return;

  const multi    = parseInt(document.getElementById('fab-multiplicateur')?.value) || 1;
  const nbUnites = (pro.nb_unites || 1) * multi;
  const cure     = pro.cure || 0;
  const dateFab  = document.getElementById('fab-date')?.value;

  let dateDispo = '—';
  if (dateFab) {
    const d = new Date(dateFab);
    d.setDate(d.getDate() + cure);
    dateDispo = d.toISOString().split('T')[0];
  }

  // Calcul coût via stock
  const resIngredients = appelAPI_v2('getProduitsIngredients', { pro_id: pro.pro_id });
  resIngredients.then(res => {
    let coutTotal = 0;
    (res?.items || []).forEach(ing => {
      const stockIng = donneesStock.find(s => s.ing_id === ing.ing_id);
      const prixParG = stockIng?.prix_par_g_reel || 0;
      coutTotal += (ing.quantite_g || 0) * multi * prixParG;
    });

    const elUnites = document.getElementById('fab-apercu-unites');
    const elDispo  = document.getElementById('fab-apercu-dispo');
    const elCout   = document.getElementById('fab-apercu-cout');
    if (elUnites) elUnites.textContent = nbUnites + ' unité(s)';
    if (elDispo)  elDispo.textContent  = dateDispo;
    if (elCout)   elCout.textContent   = coutTotal > 0 ? coutTotal.toFixed(2) + ' $' : '—';

    const apercu = document.getElementById('fab-apercu');
    if (apercu) apercu.classList.remove('cache');
  });
}

async function sauvegarderLot_v2() {
  const selPro = document.getElementById('fab-produit');
  if (!selPro?.value) { afficherMsg('fabrication', '❌ Choisir un produit.', 'erreur'); return; }

  const pro      = donneesProduits.find(p => p.pro_id === selPro.value);
  const multi    = parseInt(document.getElementById('fab-multiplicateur')?.value) || 1;
  const nbUnites = (pro?.nb_unites || 1) * multi;
  const cure     = pro?.cure || 0;
  const dateFab  = document.getElementById('fab-date')?.value;
  if (!dateFab) { afficherMsg('fabrication', '❌ Date de fabrication requise.', 'erreur'); return; }

  const d = new Date(dateFab);
  d.setDate(d.getDate() + cure);
  const dateDispo = d.toISOString().split('T')[0];

  // Calcul coût
  const resIng = await appelAPI_v2('getProduitsIngredients', { pro_id: pro.pro_id });
  let coutIngredients = 0;
  (resIng?.items || []).forEach(ing => {
    const stockIng = donneesStock.find(s => s.ing_id === ing.ing_id);
    coutIngredients += (ing.quantite_g || 0) * multi * (stockIng?.prix_par_g_reel || 0);
  });

  const lot_id = 'LOT-' + Date.now();
  const res = await appelAPIPost_v2('saveLot', {
    lot_id,
    pro_id:             pro.pro_id,
    multiplicateur:     multi,
    nb_unites:          nbUnites,
    date_fabrication:   dateFab,
    date_disponibilite: dateDispo,
    cout_ingredients:   coutIngredients.toFixed(2),
    cout_emballages:    0,
    cout_revient_total: coutIngredients.toFixed(2),
    cout_par_unite:     nbUnites > 0 ? (coutIngredients / nbUnites).toFixed(2) : 0
  });

  if (res?.success) {
    await rechargerLots();
    await rechargerStock();
    afficherLots_v2();
    afficherStock_v2();
    afficherMsg('fabrication', '✅ Lot enregistré. Stock mis à jour.');
  } else {
    afficherMsg('fabrication', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

function peuplerSelectProduits_v2(selectId, colId, gamId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choisir un produit —</option>';
  let produits = [...donneesProduits].filter(p => p.statut !== 'archive');
  if (colId) produits = produits.filter(p => p.col_id === colId);
  if (gamId) produits = produits.filter(p => p.gam_id === gamId);
  produits.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  produits.forEach(p => {
    const o = document.createElement('option');
    o.value = p.pro_id;
    o.textContent = p.nom;
    sel.appendChild(o);
  });
}

// ─── VENTES ───

let venteActive = null;
let donneesAchats = [];

async function chargerVentes_v2() {
  await rechargerVentes();
  afficherVentes_v2();
}

function afficherVentes_v2() {
  const liste = document.getElementById('liste-ventes');
  if (!liste) return;
  liste.innerHTML = '';

  const ventes = [...donneesVentes].sort((a, b) => b.date.localeCompare(a.date));
  ventes.forEach(v => {
    const el = document.createElement('div');
    el.className = 'carte-vente fade-in';
    el.innerHTML = `
      <div class="carte-vente-entete">
        <div class="carte-vente-info">
          <span class="carte-vente-id">${v.ven_id}</span>
          <strong>${v.client || 'Client non spécifié'}</strong>
          <span>${v.date}</span>
          <span class="badge badge-${v.statut === 'Finalisée' ? 'public' : 'test'}">${v.statut}</span>
        </div>
        <div class="carte-vente-meta">
          <span>${v.total ? v.total.toFixed(2) + ' $' : '—'}</span>
          <button class="btn btn-secondaire btn-sm" onclick="ouvrirVente('${v.ven_id}')">Ouvrir</button>
          ${v.statut !== 'Finalisée' ? `<button class="btn btn-primaire btn-sm" onclick="finaliserVente_v2('${v.ven_id}')">Finaliser</button>` : ''}
        </div>
      </div>
    `;
    liste.appendChild(el);
  });
}

async function creerVente_v2() {
  const date   = document.getElementById('vente-date')?.value;
  const client = document.getElementById('vente-client')?.value;
  if (!date) { afficherMsg('ventes', '❌ Date requise.', 'erreur'); return; }

  const ven_id = 'VEN-' + Date.now();
  const res = await appelAPIPost_v2('createVente', { ven_id, date, client });
  if (res?.success) {
    venteActive = ven_id;
    await chargerVentes_v2();
    ouvrirVente(ven_id);
    afficherMsg('ventes', '✅ Vente créée.');
  } else {
    afficherMsg('ventes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function ajouterLigneVente_v2() {
  if (!venteActive) { afficherMsg('ventes', '❌ Aucune vente active.', 'erreur'); return; }

  const pro_id       = document.getElementById('vente-produit')?.value;
  const lot_id       = document.getElementById('vente-lot')?.value;
  const quantite     = document.getElementById('vente-quantite')?.value;
  const prix_unitaire = document.getElementById('vente-prix')?.value;

  if (!pro_id || !quantite || !prix_unitaire) {
    afficherMsg('ventes', '❌ Produit, quantité et prix requis.', 'erreur');
    return;
  }

  const res = await appelAPIPost_v2('addVenteLigne', {
    ven_id: venteActive, pro_id, lot_id, quantite, prix_unitaire
  });
  if (res?.success) {
    await afficherLignesVente_v2(venteActive);
    afficherMsg('ventes', '✅ Ligne ajoutée.');
  } else {
    afficherMsg('ventes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function afficherLignesVente_v2(ven_id) {
  const res = await appelAPI_v2('getVentesLignes', { ven_id });
  const liste = document.getElementById('liste-lignes-vente');
  if (!liste || !res?.success) return;
  liste.innerHTML = '';
  let total = 0;
  res.items.forEach(l => {
    const pro = donneesProduits.find(p => p.pro_id === l.pro_id) || {};
    total += l.prix_total || 0;
    const el = document.createElement('div');
    el.className = 'ligne-vente';
    el.innerHTML = `
      <span>${pro.nom || l.pro_id}</span>
      <span>${l.quantite} unité(s)</span>
      <span>${l.prix_unitaire.toFixed(2)} $</span>
      <span>${(l.prix_total || 0).toFixed(2)} $</span>
    `;
    liste.appendChild(el);
  });
  const elTotal = document.getElementById('vente-total');
  if (elTotal) elTotal.textContent = total.toFixed(2) + ' $';
}

async function finaliserVente_v2(ven_id) {
  const res = await appelAPIPost_v2('finaliserVente', { ven_id });
  if (res?.success) {
    await chargerVentes_v2();
    afficherMsg('ventes', '✅ Vente finalisée.');
  } else {
    afficherMsg('ventes', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

function ouvrirVente(ven_id) {
  venteActive = ven_id;
  afficherLignesVente_v2(ven_id);
  const panel = document.getElementById('panel-lignes-vente');
  if (panel) panel.classList.remove('cache');
}

function peuplerLotsDisponibles_v2(pro_id) {
  const sel = document.getElementById('vente-lot');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Sans lot spécifique —</option>';
  const lots = donneesLots.filter(l => l.pro_id === pro_id && l.statut === 'disponible');
  lots.forEach(l => {
    const o = document.createElement('option');
    o.value = l.lot_id;
    o.textContent = `${l.lot_id} — ${l.nb_unites} u. dispo — fab. ${l.date_fabrication}`;
    sel.appendChild(o);
  });
}

// ─── CONTENU SITE ───

async function chargerContenuSite_v2() {
  const res = await appelAPI_v2('getContenu');
  if (!res?.success) return;
  const contenu = res.contenu || {};
  Object.entries(contenu).forEach(([cle, valeur]) => {
    const el = document.getElementById('contenu-' + cle);
    if (el) el.value = valeur;
  });
}

async function sauvegarderContenuSite_v2() {
  const champs = document.querySelectorAll('[id^="contenu-"]');
  const contenu = {};
  champs.forEach(el => {
    const cle = el.id.replace('contenu-', '');
    contenu[cle] = el.value;
  });
  const res = await appelAPIPost_v2('updateContenu', { contenu });
  if (res?.success) {
    afficherMsg('contenu', '✅ Contenu sauvegardé.');
  } else {
    afficherMsg('contenu', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

// ─── MÉDIATHÈQUE ───

let donneesMediatheque = [];

async function chargerMediatheque_v2() {
  const res = await appelAPI_v2('getMediatheque');
  if (res?.success) donneesMediatheque = res.items || [];
  afficherMediatheque_v2();
}

function afficherMediatheque_v2() {
  const liste = document.getElementById('liste-mediatheque');
  if (!liste) return;
  liste.innerHTML = '';

  donneesMediatheque.forEach(item => {
    const el = document.createElement('div');
    el.className = 'carte-media fade-in';
    el.innerHTML = `
      <img src="${item.url}" alt="${item.nom}" class="carte-media-img" loading="lazy">
      <div class="carte-media-info">
        <span>${item.nom}</span>
        <span class="carte-media-cat">${item.categorie || '—'}</span>
      </div>
      <div class="carte-media-actions">
        <button class="btn btn-danger btn-sm" onclick="supprimerMedia_v2(${item.rowIndex})">Supprimer</button>
      </div>
    `;
    liste.appendChild(el);
  });
}

async function ajouterMedia_v2() {
  const url      = document.getElementById('media-url')?.value;
  const nom      = document.getElementById('media-nom')?.value;
  const categorie = document.getElementById('media-categorie')?.value;
  if (!url) { afficherMsg('mediatheque', '❌ URL requise.', 'erreur'); return; }

  const res = await appelAPIPost_v2('saveMediatheque', { url, nom, categorie });
  if (res?.success) {
    await chargerMediatheque_v2();
    afficherMsg('mediatheque', '✅ Photo ajoutée.');
  } else {
    afficherMsg('mediatheque', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

async function supprimerMedia_v2(rowIndex) {
  if (!confirm('Supprimer cette photo?')) return;
  const res = await appelAPIPost_v2('supprimerMediatheque', { rowIndex });
  if (res?.success) {
    await chargerMediatheque_v2();
    afficherMsg('mediatheque', '✅ Photo supprimée.');
  } else {
    afficherMsg('mediatheque', '❌ ' + (res?.message || 'Erreur.'), 'erreur');
  }
}

// ─── NAVIGATION ───

function afficherSection_v2(id) {
  document.querySelectorAll('.section-admin').forEach(s => s.classList.remove('visible'));
  document.querySelectorAll('.sidebar-lien').forEach(l => l.classList.remove('actif'));
  const s = document.getElementById('section-' + id);
  if (s) s.classList.add('visible');
  window.scrollTo(0, 0);

  if (id === 'collections')   afficherCollections_v2();
  if (id === 'produits')      afficherProduits_v2();
  if (id === 'achats')        chargerAchats_v2();
  if (id === 'stock')         chargerStock_v2();
  if (id === 'fabrication')   chargerFabrication_v2();
  if (id === 'ventes')        chargerVentes_v2();
  if (id === 'contenu-site')  chargerContenuSite_v2();
  if (id === 'mediatheque')   chargerMediatheque_v2();
}

// ─── MESSAGES ───

function afficherMsg(zone, texte, type = 'succes') {
  const el = document.getElementById('msg-' + zone);
  if (el) {
    el.innerHTML = texte ? `<div class="msg msg-${type}">${texte}</div>` : '';
    if (texte) setTimeout(() => { el.innerHTML = ''; }, 4000);
  }
}

// ─── FIN DU FICHIER ───
/**
 * UNIVERS CARESSE
 * Code.gs — nettoyé le 28 mars 2026
 */

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
  SHEETS: {
    FACTURES: 'Factures',
    ACHATS: 'Achats',
    INVENTAIRE: 'Inventaire_ingredients',
    FOURNISSEURS: 'Fournisseurs'
  },
  HE_DENSITY: 0.9
};

// ========================================
// GESTION DES FACTURES
// ========================================

function createInvoice(numeroFacture, date, fournisseur) {
  try {
    const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    let factures = ss.getSheetByName(CONFIG.SHEETS.FACTURES);
    if (!factures) return { success: false, message: 'Feuille Factures introuvable' };
    const data = factures.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(numeroFacture)) {
        return { success: false, message: 'Cette facture existe déjà' };
      }
    }
    factures.appendRow([numeroFacture, date, fournisseur, 0, 0, 0, 0, 0, 1, 'En cours']);
    return { success: true, message: 'Facture créée avec succès', numeroFacture };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function finalizeInvoice(data) {
  try {
    const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const facturesSheet = ss.getSheetByName(CONFIG.SHEETS.FACTURES);
    const achatsSheet   = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!facturesSheet) return { success: false, message: 'Feuille Factures introuvable' };

    const numeroFacture = data.numeroFacture;
    const tps           = parseFloat(data.tps) || 0;
    const tvq           = parseFloat(data.tvq) || 0;
    const livraison     = parseFloat(data.livraison) || 0;
    const sousTotal     = parseFloat(data.sousTotal) || 0;
    const total         = sousTotal + tps + tvq + livraison;
    const facteur       = sousTotal > 0 ? total / sousTotal : 1;

    const facturesData = facturesSheet.getDataRange().getValues();
    for (let i = 1; i < facturesData.length; i++) {
      if (String(facturesData[i][0]) === String(numeroFacture)) {
        facturesSheet.getRange(i + 1, 4).setValue(sousTotal.toFixed(2));
        facturesSheet.getRange(i + 1, 5).setValue(tps.toFixed(2));
        facturesSheet.getRange(i + 1, 6).setValue(tvq.toFixed(2));
        facturesSheet.getRange(i + 1, 7).setValue(livraison.toFixed(2));
        facturesSheet.getRange(i + 1, 8).setValue(total.toFixed(2));
        facturesSheet.getRange(i + 1, 9).setValue(facteur.toFixed(6));
        facturesSheet.getRange(i + 1, 10).setValue('Finalisée');
        break;
      }
    }

    if (achatsSheet) {
      const achatsData = achatsSheet.getDataRange().getValues();
      for (let i = 1; i < achatsData.length; i++) {
        if (String(achatsData[i][1]) === String(numeroFacture)) {
          const prixParG = parseFloat(achatsData[i][9]) || 0;
          achatsSheet.getRange(i + 1, 11).setValue((prixParG * facteur).toFixed(6));
        }
      }
    }

    mettreAJourInventaire(numeroFacture, facteur);
    return { success: true, message: 'Facture finalisée', total: total.toFixed(2), facteur: facteur.toFixed(4) };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function diminuerStockRecette(recette_id) {
  try {
    const ss              = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const recettesSheet   = ss.getSheetByName('Recettes');
    const inventaireSheet = ss.getSheetByName(CONFIG.SHEETS.INVENTAIRE);
    const configSheet     = getConfigSheet();
    if (!recettesSheet || !inventaireSheet) return { success: false, message: 'Feuille introuvable' };

    const configData = configSheet.getDataRange().getValues();
    const marges = {};
    for (let i = 1; i < configData.length; i++) {
      if (configData[i][0]) marges[configData[i][0]] = parseFloat(configData[i][3]) || 0;
    }

    const recettesData = recettesSheet.getDataRange().getValues();
    const ingredients  = [];
    for (let i = 1; i < recettesData.length; i++) {
      if (String(recettesData[i][0]) === String(recette_id) && recettesData[i][11]) {
        ingredients.push({
          type:       recettesData[i][11] || '',
          nom:        recettesData[i][12] || '',
          quantite_g: parseFloat(recettesData[i][13]) || 0
        });
      }
    }
    if (ingredients.length === 0) return { success: false, message: 'Recette introuvable ou sans ingrédients' };

    const inventaireData = inventaireSheet.getDataRange().getValues();
    for (const ing of ingredients) {
      const marge      = marges[ing.type] || 0;
      const qteRetirer = ing.quantite_g * (1 + marge);
      for (let j = 1; j < inventaireData.length; j++) {
        if (String(inventaireData[j][1]) === String(ing.nom) && String(inventaireData[j][2]) === String(ing.type)) {
          const stockActuel  = parseFloat(inventaireData[j][3]) || 0;
          const nouveauStock = Math.max(0, stockActuel - qteRetirer);
          inventaireSheet.getRange(j + 1, 4).setValue(nouveauStock);
          inventaireData[j][3] = nouveauStock;
          break;
        }
      }
    }
    return { success: true, message: 'Stock mis à jour' };
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

function mettreAJourInventaire(numeroFacture, facteur) {
  const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  const achatsSheet     = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
  const inventaireSheet = ss.getSheetByName(CONFIG.SHEETS.INVENTAIRE);
  if (!achatsSheet || !inventaireSheet) return;

  const achatsData     = achatsSheet.getDataRange().getValues();
  const inventaireData = inventaireSheet.getDataRange().getValues();

  for (let i = 1; i < achatsData.length; i++) {
    const row = achatsData[i];
    if (String(row[1]) !== String(numeroFacture)) continue;

    const ingredient   = row[5]  || '';
    const type         = row[4]  || '';
    const fournisseur  = row[3]  || '';
    const quantite     = parseFloat(row[11]) || 0;
    const formatQte    = parseFloat(row[6])  || 0;
    const formatUnite  = row[7]  || 'g';
    const prixParG     = parseFloat(row[9])  || 0;
    const prixParGReel = parseFloat(row[10]) || 0;
    const date         = row[2]  || '';

    let grammesParUnite = formatQte;
    if (formatUnite === 'L')  grammesParUnite = formatQte * 1000;
    if (formatUnite === 'kg') grammesParUnite = formatQte * 1000;
    const grammesAjoutes = quantite * grammesParUnite;

    let trouve = false;
    for (let j = 1; j < inventaireData.length; j++) {
      if (String(inventaireData[j][1]) === String(ingredient) && String(inventaireData[j][2]) === String(type)) {
        const stockActuel = parseFloat(inventaireData[j][3]) || 0;
        inventaireSheet.getRange(j + 1, 4).setValue(stockActuel + grammesAjoutes);
        inventaireSheet.getRange(j + 1, 5).setValue(prixParG);
        inventaireSheet.getRange(j + 1, 6).setValue(prixParGReel);
        inventaireSheet.getRange(j + 1, 7).setValue(fournisseur);
        inventaireSheet.getRange(j + 1, 8).setValue(date);
        inventaireData[j][3] = stockActuel + grammesAjoutes;
        trouve = true;
        break;
      }
    }
    if (!trouve) {
      inventaireSheet.appendRow(['', ingredient, type, grammesAjoutes, prixParG, prixParGReel, fournisseur, date]);
      inventaireData.push(['', ingredient, type, grammesAjoutes, prixParG, prixParGReel, fournisseur, date]);
    }
  }
}

function getInvoicesListWithFilters() {
  try {
    const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const facturesSheet = ss.getSheetByName(CONFIG.SHEETS.FACTURES);
    const achatsSheet   = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!facturesSheet || !achatsSheet) return { invoices: [], fournisseurs: [], types: [], ingredients: [] };

    const facturesData    = facturesSheet.getDataRange().getValues();
    const achatsData      = achatsSheet.getDataRange().getValues();
    const invoices        = [];
    const fournisseursSet = new Set();
    const typesSet        = new Set();
    const ingredientsSet  = new Set();

    for (let i = 1; i < facturesData.length; i++) {
      if (facturesData[i][0]) {
        const numero = facturesData[i][0];
        let dateStr  = facturesData[i][1];
        if (dateStr instanceof Date) {
          dateStr = Utilities.formatDate(dateStr, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        const fournisseur        = facturesData[i][2];
        const factureTypes       = [];
        const factureIngredients = [];
        fournisseursSet.add(fournisseur);

        for (let j = 1; j < achatsData.length; j++) {
          if (String(achatsData[j][1]) === String(numero)) {
            const type       = achatsData[j][4];
            const ingredient = achatsData[j][5];
            if (type && !factureTypes.includes(type))             { factureTypes.push(type); typesSet.add(type); }
            if (ingredient && !factureIngredients.includes(ingredient)) { factureIngredients.push(ingredient); ingredientsSet.add(ingredient); }
          }
        }
        invoices.push({
          numero, date: dateStr, dateRaw: dateStr, fournisseur,
          tps:       facturesData[i][4] || 0,
          tvq:       facturesData[i][5] || 0,
          livraison: facturesData[i][6] || 0,
          total:     facturesData[i][7] || 0,
          facteur:   facturesData[i][8] || 1,
          statut:    facturesData[i][9],
          types: factureTypes, ingredients: factureIngredients
        });
      }
    }
    return {
      invoices,
      fournisseurs: Array.from(fournisseursSet).sort(),
      types:        Array.from(typesSet).sort(),
      ingredients:  Array.from(ingredientsSet).sort()
    };
  } catch (error) {
    return { invoices: [], fournisseurs: [], types: [], ingredients: [] };
  }
}

// ========================================
// GESTION DES PRODUITS
// ========================================

function addProduct(productData) {
  try {
    const ss     = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const achats = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!achats) return { success: false, message: 'Feuille Achats introuvable' };

    const quantite     = parseFloat(productData.quantite) || 0;
    const prixUnitaire = parseFloat(productData.prixUnitaire) || 0;
    const formatQte    = parseFloat(productData.formatQte) || 0;
    const formatUnite  = productData.formatUnite || 'g';
    const prixTotal    = (quantite * prixUnitaire).toFixed(2);
    const prixParG     = productData.prixParG ? parseFloat(productData.prixParG) : 0;

    achats.appendRow([
      productData.codeBarres || '', productData.numFacture,
      productData.date || '', productData.fournisseur || '',
      productData.type || '', productData.ingredient || '',
      formatQte, formatUnite, prixUnitaire, prixParG,
      0, quantite, prixTotal, productData.notes || ''
    ]);
    return { success: true, message: 'Produit ajouté', prixTotal };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function getInvoiceProducts(numeroFacture) {
  try {
    const ss          = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const achatsSheet = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!achatsSheet) return { success: false, message: 'Feuille Achats introuvable' };

    const data     = achatsSheet.getDataRange().getValues();
    const products = [];
    let total      = 0;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]) === String(numeroFacture)) {
        const quantite     = parseFloat(data[i][11]) || 0;
        const prixUnitaire = parseFloat(data[i][8])  || 0;
        const prixTotal    = parseFloat(data[i][12]) || (quantite * prixUnitaire);
        products.push({
          rowIndex: i + 1, codeBarres: data[i][0] || '',
          type: data[i][4] || '', ingredient: data[i][5] || '',
          formatQte: data[i][6] || '', formatUnite: data[i][7] || '',
          prixUnitaire,
          prixParG:     parseFloat(data[i][9])  || 0,
          prixParGReel: parseFloat(data[i][10]) || 0,
          quantite, prixTotal, notes: data[i][13] || ''
        });
        total += prixTotal;
      }
    }
    return { success: true, products, total };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function updateProduct(productData) {
  try {
    const ss          = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const achatsSheet = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!achatsSheet) return { success: false, message: 'Feuille Achats introuvable' };

    const quantite     = parseFloat(productData.quantite) || 0;
    const prixUnitaire = parseFloat(productData.prixUnitaire) || 0;
    const formatQte    = parseFloat(productData.formatQte) || 0;
    const formatUnite  = productData.formatUnite || 'g';
    const prixTotal    = (quantite * prixUnitaire).toFixed(2);

    let grammes = formatQte;
    if (formatUnite === 'L')  grammes = formatQte * 1000;
    if (formatUnite === 'kg') grammes = formatQte * 1000;
    const prixParG = grammes > 0 ? (prixUnitaire / grammes).toFixed(6) : 0;

    achatsSheet.getRange(productData.rowIndex, 1, 1, 14).setValues([[
      productData.codeBarres || '', productData.numFacture,
      productData.date || '', productData.fournisseur || '',
      productData.type || '', productData.ingredient || '',
      formatQte, formatUnite, prixUnitaire, prixParG,
      0, quantite, prixTotal, productData.notes || ''
    ]]);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function deleteProduct(numeroFacture, rowIndex) {
  try {
    const ss          = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const achatsSheet = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!achatsSheet) return { success: false, message: 'Feuille Achats introuvable' };
    achatsSheet.deleteRow(rowIndex);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function deleteInvoice(numeroFacture) {
  try {
    const ss            = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const facturesSheet = ss.getSheetByName(CONFIG.SHEETS.FACTURES);
    const achatsSheet   = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    if (!facturesSheet) return { success: false, message: 'Feuille Factures introuvable' };

    const facturesData = facturesSheet.getDataRange().getValues();
    for (let i = facturesData.length - 1; i >= 1; i--) {
      if (String(facturesData[i][0]) === String(numeroFacture)) { facturesSheet.deleteRow(i + 1); break; }
    }
    if (achatsSheet) {
      const achatsData = achatsSheet.getDataRange().getValues();
      for (let i = achatsData.length - 1; i >= 1; i--) {
        if (String(achatsData[i][1]) === String(numeroFacture)) achatsSheet.deleteRow(i + 1);
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

// ========================================
// INVENTAIRE
// ========================================

function getInventory() {
  try {
    const ss            = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const achatsSheet   = ss.getSheetByName(CONFIG.SHEETS.ACHATS);
    const facturesSheet = ss.getSheetByName(CONFIG.SHEETS.FACTURES);
    if (!achatsSheet) return { success: false, message: 'Feuille Achats introuvable' };

    const achatsData   = achatsSheet.getDataRange().getValues();
    const facturesData = facturesSheet ? facturesSheet.getDataRange().getValues() : [];

    const facturesFinalisees = new Set();
    for (let i = 1; i < facturesData.length; i++) {
      if (facturesData[i][9] === 'Finalisée') facturesFinalisees.add(String(facturesData[i][0]));
    }

    const inventory = {};
    for (let i = 1; i < achatsData.length; i++) {
      const row = achatsData[i];
      if (!row[1] || !facturesFinalisees.has(String(row[1]))) continue;

      const type         = row[4]  || 'Non classé';
      const ingredient   = row[5]  || 'Non classé';
      const fournisseur  = row[3]  || 'Inconnu';
      const quantite     = parseFloat(row[11]) || 0;
      const formatQte    = parseFloat(row[6])  || 0;
      const formatUnite  = row[7]  || 'g';
      const prixUnitaire = parseFloat(row[8])  || 0;
      const prixParG     = parseFloat(row[9])  || 0;
      const prixParGReel = parseFloat(row[10]) || 0;

      let grammesParUnite = formatQte;
      if (formatUnite === 'L')  grammesParUnite = formatQte * 1000;
      if (formatUnite === 'kg') grammesParUnite = formatQte * 1000;
      const grammesTotal = quantite * grammesParUnite;
      const valeur       = quantite * prixUnitaire;

      if (!inventory[type]) inventory[type] = {};
      if (!inventory[type][ingredient]) inventory[type][ingredient] = {};
      if (!inventory[type][ingredient][fournisseur]) {
        inventory[type][ingredient][fournisseur] = { unites: 0, grammes: 0, prixParG, prixParGReel, format: formatQte + ' ' + formatUnite, valeur: 0 };
      }
      inventory[type][ingredient][fournisseur].unites  += quantite;
      inventory[type][ingredient][fournisseur].grammes += grammesTotal;
      inventory[type][ingredient][fournisseur].valeur  += valeur;
      if (prixParG > 0)     inventory[type][ingredient][fournisseur].prixParG     = prixParG;
      if (prixParGReel > 0) inventory[type][ingredient][fournisseur].prixParGReel = prixParGReel;
    }
    return { success: true, inventory };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

// ========================================
// COLLECTIONS
// ========================================

function getCollections() {
  try {
    const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const sheet = ss.getSheetByName('Collections');
    if (!sheet) return { success: false, message: 'Onglet Collections introuvable' };

    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1]) {
        items.push({
          rowIndex: i + 1, rang: data[i][0] || '', collection: data[i][1] || '',
          slogan: data[i][2] || '', description_collection: data[i][3] || '',
          ligne: data[i][4] || '', description_ligne: data[i][5] || '',
          format: data[i][6] || '', couleur_hex: data[i][7] || '',
          photo_url: data[i][8] || '', photo_url_noel: data[i][9] || ''
        });
      }
    }
    return { success: true, items };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function addCollectionItem(data) {
  try {
    const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const sheet = ss.getSheetByName('Collections');
    if (!sheet) return { success: false, message: 'Onglet Collections introuvable' };

    const rangCible = parseInt(data.rang) || 0;
    if (rangCible > 0) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        const r = parseInt(rows[i][0]) || 0;
        const c = String(rows[i][1] || '').toUpperCase();
        if (r >= rangCible && c !== String(data.collection || '').toUpperCase()) {
          sheet.getRange(i + 1, 1).setValue(r + 1);
        }
      }
    }
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1).setValue(data.rang || '');
    sheet.getRange(newRow, 2).setValue(data.collection || '');
    sheet.getRange(newRow, 3).setValue(data.slogan || '');
    sheet.getRange(newRow, 4).setValue(data.description_collection || '');
    sheet.getRange(newRow, 5).setValue(data.ligne || '');
    sheet.getRange(newRow, 6).setValue(data.description_ligne || '');
    sheet.getRange(newRow, 7).setValue(data.format || '');
    sheet.getRange(newRow, 8).setValue(data.couleur_hex || '');
    sheet.getRange(newRow, 9).setValue(data.photo_url || '');
    sheet.getRange(newRow, 10).setValue(data.photo_url_noel || '');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function updateCollectionItem(data) {
  try {
    const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const sheet = ss.getSheetByName('Collections');
    if (!sheet) return { success: false, message: 'Onglet Collections introuvable' };

    const rangCible  = parseInt(data.rang) || 0;
    const rangActuel = parseInt(sheet.getRange(data.rowIndex, 1).getValue()) || 0;
    if (rangCible > 0 && rangCible !== rangActuel) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (i + 1 === data.rowIndex) continue;
        const r = parseInt(rows[i][0]) || 0;
        const c = String(rows[i][1] || '').toUpperCase();
        if (r >= rangCible && c !== String(data.collection || '').toUpperCase()) {
          sheet.getRange(i + 1, 1).setValue(r + 1);
        }
      }
    }

    const nomCollection = String(data.collection || '').toUpperCase();
    const allRows = sheet.getDataRange().getValues();

    sheet.getRange(data.rowIndex, 1).setValue(data.rang || '');
    sheet.getRange(data.rowIndex, 2).setValue(data.collection || '');
    sheet.getRange(data.rowIndex, 3).setValue(data.slogan || '');
    sheet.getRange(data.rowIndex, 4).setValue(data.description_collection || '');
    if (data.ligne !== undefined)             sheet.getRange(data.rowIndex, 5).setValue(data.ligne);
    if (data.description_ligne !== undefined) sheet.getRange(data.rowIndex, 6).setValue(data.description_ligne);
    if (data.format !== undefined)            sheet.getRange(data.rowIndex, 7).setValue(data.format);
    sheet.getRange(data.rowIndex, 8).setValue(data.couleur_hex || '');
    sheet.getRange(data.rowIndex, 9).setValue(data.photo_url || '');
    sheet.getRange(data.rowIndex, 10).setValue(data.photo_url_noel || '');

    for (let i = 1; i < allRows.length; i++) {
      if (i + 1 === data.rowIndex) continue;
      if (String(allRows[i][1] || '').toUpperCase() === nomCollection) {
        sheet.getRange(i + 1, 8).setValue(data.couleur_hex || '');
        sheet.getRange(i + 1, 9).setValue(data.photo_url || '');
        sheet.getRange(i + 1, 10).setValue(data.photo_url_noel || '');
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function deleteCollectionItem(rowIndex) {
  try {
    const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const sheet = ss.getSheetByName('Collections');
    if (!sheet) return { success: false, message: 'Onglet Collections introuvable' };
    sheet.deleteRow(rowIndex);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

// ========================================
// LISTES DÉROULANTES
// ========================================

function getDropdownLists() {
  try {
    const ss         = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const listesSheet = ss.getSheetByName('Ingredients_INCI');
    const typesUniques = [];
    if (!listesSheet) return { types: [], fullData: [], config: {} };
    const data = listesSheet.getDataRange().getValues();

    const ingMap = {};
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        if (!typesUniques.includes(data[i][0])) typesUniques.push(data[i][0]);
        const key = data[i][0] + '||' + data[i][1];
        if (!ingMap[key]) {
          ingMap[key] = {
            type:           data[i][0],
            ingredient:     data[i][1],
            inci:           data[i][2] || '',
            note_olfactive: data[i][6] || ''
          };
        }
      }
    }

    const configSheet = ss.getSheetByName('Config');
    const config = {};
    if (configSheet) {
      const configData = configSheet.getDataRange().getValues();
      for (let i = 1; i < configData.length; i++) {
        if (configData[i][0]) {
          config[configData[i][0]] = {
            densite:       parseFloat(configData[i][1]) || 1,
            unite:         configData[i][2] || 'g',
            margePertePct: parseFloat(configData[i][3]) || 0
          };
        }
      }
    }
    return { types: typesUniques, fullData: Object.values(ingMap), config };
  } catch (error) {
    return { types: [], fullData: [], config: {} };
  }
}

// ========================================
// CONFIGURATION — DENSITÉS
// ========================================

var DENSITES_DEFAUT = [
  { type: 'Huile essentielle',     densite: 0.900, unite: 'ml' },
  { type: 'Huile',                 densite: 0.920, unite: 'ml' },
  { type: 'Hydrolat',              densite: 1.000, unite: 'ml' },
  { type: 'Fragrance',             densite: 0.900, unite: 'ml' },
  { type: 'Beurre',                densite: 1.000, unite: 'g'  },
  { type: 'Argile',                densite: 1.000, unite: 'g'  },
  { type: 'Additif',               densite: 1.000, unite: 'g'  },
  { type: 'Colorants et pigments', densite: 1.000, unite: 'g'  },
  { type: 'Herbes et fleurs',      densite: 1.000, unite: 'g'  },
  { type: 'Cire',                  densite: 0.950, unite: 'g'  },
  { type: 'Saveur naturelles',     densite: 0.900, unite: 'ml' },
  { type: 'Emballage',             densite: 1.000, unite: 'g'  }
];

function getConfigSheet() {
  const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.appendRow(['Type', 'Densité (g/ml)', 'Unité source', 'marge_perte_pct']);
    configSheet.getRange('A1:D1').setFontWeight('bold').setBackground('#f3e5f5');
    DENSITES_DEFAUT.forEach(function(d) {
      configSheet.appendRow([d.type, d.densite, d.unite, d.marge_perte || 0]);
    });
  }
  return configSheet;
}

function getDensities() {
  try {
    const configSheet = getConfigSheet();
    const data        = configSheet.getDataRange().getValues();
    const densities   = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        densities.push({ type: data[i][0], densite: parseFloat(data[i][1]) || 1.0, unite: data[i][2] || 'g', marge_perte_pct: parseFloat(data[i][3]) || 0 });
      }
    }
    return densities;
  } catch (error) {
    return [];
  }
}

function saveDensity(data) {
  try {
    const configSheet = getConfigSheet();
    const sheetData   = configSheet.getDataRange().getValues();
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.type) {
        configSheet.getRange(i + 1, 2).setValue(data.densite);
        configSheet.getRange(i + 1, 3).setValue(data.unite);
        configSheet.getRange(i + 1, 4).setValue(data.marge_perte_pct || 0);
        return { success: true };
      }
    }
    return { success: false, message: 'Type introuvable' };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

function addDensityType(data) {
  try {
    const configSheet = getConfigSheet();
    const sheetData   = configSheet.getDataRange().getValues();
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0].toLowerCase() === data.type.toLowerCase()) {
        return { success: false, message: 'Ce type existe déjà' };
      }
    }
    configSheet.appendRow([data.type, data.densite, data.unite, data.marge_perte_pct || 0]);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erreur: ' + error.message };
  }
}

// ========================================
// RECETTES
// ========================================

function getRecettesFormatsSheet() {
  const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  let sheet = ss.getSheetByName('Recettes_Formats');
  if (!sheet) {
    sheet = ss.insertSheet('Recettes_Formats');
    sheet.appendRow(['recette_id','poids','unite','prix_vente','desc_emballage']);
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#e8f5e9');
  }
  return sheet;
}

function getRecettesSheet() {
  const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  let sheet = ss.getSheetByName('Recettes');
  if (!sheet) {
    sheet = ss.insertSheet('Recettes');
    sheet.appendRow([
      'recette_id','nom','description','couleur_hex',
      'collection','rang','ligne','format','nb_unites',
      'instructions','notes',
      'ingredient_type','ingredient_nom','quantite_g','cout_ingredient','cure',
      'prix_vente','image_url','statut','image_url_noel','collections_secondaires','desc_emballage'
    ]);
    sheet.getRange('A1:V1').setFontWeight('bold').setBackground('#e8f5e9');
  }
  return sheet;
}

function getRecettes() {
  try {
    const sheet    = getRecettesSheet();
    const data     = sheet.getDataRange().getValues();
    const recettes = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      const id = String(row[0]);
      if (!recettes[id]) {
        recettes[id] = {
          recette_id: id, nom: row[1] || '', description: row[2] || '',
          couleur_hex: row[3] || '', collection: row[4] || '', rang: row[5] || '',
          ligne: row[6] || '', format: row[7] || '', nb_unites: row[8] || 1,
          instructions: row[9] || '', notes: row[10] || '', cure: row[15] || 0,
          prix_vente: parseFloat(row[16]) || 0, image_url: row[17] || '',
          statut: row[18] || 'test', image_url_noel: row[19] || '',
          collections_secondaires: row[20] ? String(row[20]).split(',').map(s => s.trim()).filter(Boolean) : [],
          desc_emballage: row[21] || '', ingredients: []
        };
      }
      if (row[11]) {
        recettes[id].ingredients.push({
          type: row[11] || '', nom: row[12] || '',
          quantite_g: parseFloat(row[13]) || 0, cout: parseFloat(row[14]) || 0
        });
      }
    }
    return { success: true, recettes: Object.values(recettes) };
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

function saveRecette(data) {
  try {
    const sheet = getRecettesSheet();
    const id    = data.recette_id;
    let rang    = '';

    if (data.collection && data.ligne) {
      const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
      const collectionsSheet = ss.getSheetByName('Collections');
      if (collectionsSheet) {
        const collectionsData = collectionsSheet.getDataRange().getValues();
        for (let i = 1; i < collectionsData.length; i++) {
          if (collectionsData[i][1] === data.collection && collectionsData[i][4] === data.ligne) {
            rang = collectionsData[i][0] || '';
            break;
          }
        }
      }
    }

    const existing = sheet.getDataRange().getValues();
    for (let i = existing.length - 1; i >= 1; i--) {
      if (String(existing[i][0]) === String(id)) sheet.deleteRow(i + 1);
    }

    const ingredients = data.ingredients && data.ingredients.length > 0
      ? data.ingredients
      : [{ type: '', nom: '', quantite_g: 0, cout: 0 }];

    const colsSecondaires = Array.isArray(data.collections_secondaires)
      ? data.collections_secondaires.join(',')
      : (data.collections_secondaires || '');

    ingredients.forEach(function(ing) {
      sheet.appendRow([
        id, data.nom, data.description, data.couleur_hex,
        data.collection, rang, data.ligne, data.format, data.nb_unites,
        data.instructions, data.notes,
        ing.type, ing.nom, ing.quantite_g, ing.cout, data.cure || 0,
        data.prix_vente || 0, data.image_url || '', data.statut || 'test',
        data.image_url_noel || '', colsSecondaires, data.desc_emballage || ''
      ]);
    });
    return { success: true, recette_id: id };
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

function deleteRecette(recette_id) {
  try {
    const sheet = getRecettesSheet();
    const data  = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]) === String(recette_id)) sheet.deleteRow(i + 1);
    }
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

// ========================================
// RECETTES DE BASE
// ========================================

function getRecettesBaseSheet() {
  const ss = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  let sheet = ss.getSheetByName('Recettes_Base');
  if (!sheet) {
    sheet = ss.insertSheet('Recettes_Base');
    sheet.appendRow(['collection','ligne','ingredient_type','ingredient_nom','quantite_g']);
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#e8f5e9');
  }
  return sheet;
}

function getRecettesFormats(recette_id) {
  try {
    const sheet   = getRecettesFormatsSheet();
    const data    = sheet.getDataRange().getValues();
    const formats = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(recette_id)) {
        formats.push({
          rowIndex: i + 1, recette_id: data[i][0],
          poids: parseFloat(data[i][1]) || 0, unite: data[i][2] || 'g',
          prix_vente: parseFloat(data[i][3]) || 0, desc_emballage: data[i][4] || ''
        });
      }
    }
    return { success: true, formats };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveRecetteFormat(data) {
  try {
    const sheet = getRecettesFormatsSheet();
    if (data.rowIndex) {
      sheet.getRange(data.rowIndex, 1, 1, 5).setValues([[
        data.recette_id, data.poids, data.unite, data.prix_vente, data.desc_emballage || ''
      ]]);
    } else {
      sheet.appendRow([data.recette_id, data.poids, data.unite, data.prix_vente, data.desc_emballage || '']);
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function deleteRecetteFormat(rowIndex) {
  try {
    const sheet = getRecettesFormatsSheet();
    sheet.deleteRow(rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function getRecettesBase() {
  try {
    const sheet = getRecettesBaseSheet();
    const data  = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        items.push({
          rowIndex: i + 1, collection: data[i][0], ligne: data[i][1],
          ingredient_type: data[i][2] || '', ingredient_nom: data[i][3] || '',
          quantite_g: parseFloat(data[i][4]) || 0
        });
      }
    }
    return { success: true, items };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveRecetteBase(data) {
  try {
    const sheet = getRecettesBaseSheet();
    const all   = sheet.getDataRange().getValues();
    for (let i = all.length - 1; i >= 1; i--) {
      if (all[i][0] === data.collection && all[i][1] === data.ligne) sheet.deleteRow(i + 1);
    }
    if (data.ingredients && data.ingredients.length > 0) {
      data.ingredients.forEach(function(ing) {
        sheet.appendRow([data.collection, data.ligne, ing.type, ing.nom, ing.quantite_g]);
      });
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// CATALOGUE PUBLIC
// ========================================

function getCataloguePublic() {
  try {
    const ss               = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const recettesSheet    = ss.getSheetByName('Recettes');
    const collectionsSheet = ss.getSheetByName('Collections');
    if (!recettesSheet) return { success: false, message: 'Onglet Recettes introuvable' };

    const recettesData    = recettesSheet.getDataRange().getValues();
    const infoCollections = {};
    const infoLignes      = {};

    if (collectionsSheet) {
      const colData = collectionsSheet.getDataRange().getValues();
      for (let i = 1; i < colData.length; i++) {
        const col = colData[i][1] || '';
        if (col && !infoCollections[col]) {
          infoCollections[col] = {
            rang: colData[i][0] || 99, slogan: colData[i][2] || '',
            desc: colData[i][3] || '', couleur_hex: colData[i][7] || '',
            photo_url: colData[i][8] || ''
          };
        }
        const ligne = colData[i][4] || '';
        if (col && ligne) infoLignes[col + '||' + ligne] = colData[i][5] || '';
      }
    }

    const recettesMap = {};
    for (let i = 1; i < recettesData.length; i++) {
      const row = recettesData[i];
      if (!row[0] || row[18] === 'test') continue;
      const id      = String(row[0]);
      const col     = row[4] || '';
      const infoCol = infoCollections[col] || {};
      if (!recettesMap[id]) {
        recettesMap[id] = {
          recette_id: id, nom: row[1] || '', description: row[2] || '',
          couleur_hex: row[3] || infoCol.couleur_hex || '#c44536',
          collection: col, rang: row[5] || infoCol.rang || 99,
          ligne: row[6] || '', format: row[7] || '', nb_unites: row[8] || 1,
          cure: row[15] || 0, prix_vente: parseFloat(row[16]) || 0,
          image_url: row[17] || '', image_url_noel: row[19] || '',
          image_collection: infoCol.photo_url || '', slogan: infoCol.slogan || '',
          desc_collection: infoCol.desc || '',
          desc_ligne: infoLignes[(row[4] || '') + '||' + (row[6] || '')] || '',
          formats: row[7] ? [row[7]] : [],
          collections_secondaires: row[20] ? String(row[20]).split(',').map(s => s.trim()).filter(Boolean) : []
        };
      }
    }

    const produits = Object.values(recettesMap);
    produits.sort((a, b) => {
      if (a.rang !== b.rang) return a.rang - b.rang;
      if (a.ligne !== b.ligne) return a.ligne.localeCompare(b.ligne);
      return a.nom.localeCompare(b.nom);
    });

    const collectionsVues = [];
    produits.forEach(p => {
      if (p.collection && !collectionsVues.includes(p.collection)) collectionsVues.push(p.collection);
    });

    return { success: true, produits, collections: collectionsVues, infoCollections };
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

function getCollectionsPublic() {
  try {
    const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
    const sheet = ss.getSheetByName('Collections');
    if (!sheet) return { success: false, message: 'Onglet Collections introuvable' };

    const data           = sheet.getDataRange().getValues();
    const collectionsMap = {};
    for (let i = 1; i < data.length; i++) {
      const col = data[i][1] || '';
      if (col && !collectionsMap[col]) {
        collectionsMap[col] = {
          rang: data[i][0] || 99, nom: col, slogan: data[i][2] || '',
          desc: data[i][3] || '', couleur_hex: data[i][7] || '', photo_url: data[i][8] || ''
        };
      }
    }
    const collections = Object.values(collectionsMap);
    collections.sort((a, b) => a.rang - b.rang || a.nom.localeCompare(b.nom));
    return { success: true, collections };
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

// ========================================
// CONTENU
// ========================================

function getContenu() {
  const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  const sheet = ss.getSheetByName('Contenu');
  if (!sheet) return { success: false, message: 'Onglet Contenu introuvable.' };
  const rows    = sheet.getDataRange().getValues();
  const contenu = {};
  rows.slice(1).forEach(row => { if (row[0]) contenu[row[0]] = row[1]; });
  return { success: true, contenu };
}

function updateContenu(data) {
  const ss    = SpreadsheetApp.openById("16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0");
  const sheet = ss.getSheetByName('Contenu');
  if (!sheet) return { success: false, message: 'Onglet Contenu introuvable.' };
  const rows = sheet.getDataRange().getValues();
  rows.slice(1).forEach((row, i) => {
    if (data.contenu[row[0]] !== undefined) sheet.getRange(i + 2, 2).setValue(data.contenu[row[0]]);
  });
  return { success: true };
}

// ========================================
// CONTACT
// ========================================

function envoyerContact(data) {
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
  } catch (e) {
    return { success: false, message: 'Erreur: ' + e.message };
  }
}

// ========================================
// UTILITAIRE
// ========================================

function nettoyerTexte(str) {
  if (!str) return '';
  str = str.replace(/\\u([0-9a-fA-F]{4})/g, function(m, code) { return String.fromCharCode(parseInt(code, 16)); });
  str = str.replace(/<[^>]+>/g, ' ');
  str = str.replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&agrave;/g, 'à')
           .replace(/&acirc;/g, 'â').replace(/&ecirc;/g, 'ê').replace(/&ocirc;/g, 'ô')
           .replace(/&ucirc;/g, 'û').replace(/&icirc;/g, 'î').replace(/&ccedil;/g, 'ç')
           .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'")
           .replace(/&rsquo;/g, "'").replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
           .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—');
  str = str.replace(/\s+/g, ' ').trim();
  return str;
}

// ========================================
// PAGE INCI — CATÉGORIES UC
// ========================================

function getCategoriesUCSheet() {
  const ss = SpreadsheetApp.openById('16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0');
  let sheet = ss.getSheetByName('Categories_UC');
  if (!sheet) {
    sheet = ss.insertSheet('Categories_UC');
    sheet.appendRow(['Catégorie', 'Date ajout']);
    sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#e8f5e9');
    const categoriesBase = [
      'Argiles', 'Bases neutres', 'Cires', 'Colorants et Pigments',
      'Herbes et Fleurs', 'Huiles aromatiques naturelle', 'Huiles essentielles',
      'Huiles et Beurres', 'Hydrolats', 'Ingrédients Liquides',
      'Ingrédients Secs', 'Fragrances', 'Saveurs naturelles'
    ];
    const today = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd');
    sheet.getRange(2, 1, categoriesBase.length, 2).setValues(categoriesBase.map(c => [c, today]));
  }
  return sheet;
}

function getCategoriesUC() {
  try {
    const sheet = getCategoriesUCSheet();
    const data  = sheet.getDataRange().getValues();
    const cats  = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) cats.push({ rowIndex: i + 1, categorie: data[i][0], dateAjout: data[i][1] || '' });
    }
    return { success: true, categories: cats };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function ajouterCategorieUC(data) {
  try {
    const sheet = getCategoriesUCSheet();
    const rows  = sheet.getDataRange().getValues();
    const nom   = (data.categorie || '').trim();
    if (!nom) return { success: false, message: 'Nom requis.' };
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toLowerCase() === nom.toLowerCase()) return { success: false, message: 'Catégorie déjà existante.' };
    }
    const today = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd');
    sheet.appendRow([nom, today]);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function modifierCategorieUC(data) {
  try {
    const sheet = getCategoriesUCSheet();
    if (!data.rowIndex || !data.categorie) return { success: false, message: 'Données manquantes.' };
    sheet.getRange(data.rowIndex, 1).setValue(data.categorie.trim());
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function supprimerCategorieUC(data) {
  try {
    const sheet = getCategoriesUCSheet();
    if (!data.rowIndex) return { success: false, message: 'rowIndex manquant.' };
    sheet.deleteRow(data.rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// PAGE INCI — CONFIG CORRESPONDANCE
// ========================================

function getConfigInciSheet() {
  const ss = SpreadsheetApp.openById('16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0');
  let sheet = ss.getSheetByName('Config_INCI');
  if (!sheet) {
    sheet = ss.insertSheet('Config_INCI');
    sheet.appendRow(['Catégorie source', 'Catégorie maître', 'Source', 'Confirmé']);
    sheet.getRange('A1:D1').setFontWeight('bold').setBackground('#e8f5e9');
    const categoriesPA = [
      'Argiles', 'Bases neutres', 'Cires', 'Colorants et Pigments',
      'Herbes et Fleurs', 'Huiles aromatiques naturelle', 'Huiles essentielles',
      'Huiles et Beurres', 'Hydrolats', 'Ingrédients Liquides',
      'Ingrédients Secs', 'Fragrances', 'Saveurs naturelles'
    ];
    const categoriesMH = ['Huiles essentielles', 'Huiles et Beurres', 'Hydrolats', 'À classer'];
    const vues = new Set(categoriesPA.map(c => c.toLowerCase()));
    const rows = categoriesPA.map(c => [c, c, 'PA', 'non']);
    categoriesMH.forEach(c => {
      if (!vues.has(c.toLowerCase())) { rows.push([c, '', 'MH', 'non']); vues.add(c.toLowerCase()); }
    });
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
  return sheet;
}

// ========================================
// PAGE INCI — SOURCES
// ========================================

function getSourcesInci() {
  try {
    const ss = SpreadsheetApp.openById('16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0');

    const configSheet    = getConfigInciSheet();
    const configData     = configSheet.getDataRange().getValues();
    const correspondance = {};
    for (let i = 1; i < configData.length; i++) {
      if (configData[i][0]) {
        const catSource = configData[i][0].trim();
        correspondance[catSource] = (configData[i][1] || '').trim() || catSource;
      }
    }

    const sheetInci   = ss.getSheetByName('Ingredients_INCI');
    const inciValides = {};
    if (sheetInci) {
      const inciData = sheetInci.getDataRange().getValues();
      for (let i = 1; i < inciData.length; i++) {
        const nom = (inciData[i][1] || '').toString().trim().toLowerCase();
        if (nom) inciValides[nom] = {
          inci: inciData[i][2] || '', nomBotanique: inciData[i][3] || '',
          noteOlfactive: inciData[i][6] || '', categorie: inciData[i][0] || ''
        };
      }
    }

    function scorer(l) {
      return (l.inci ? 3 : 0) + (l.nomBotanique ? 2 : 0) + (l.texteBrut ? 1 : 0);
    }
    const prioriteSource = { 'PA': 0, 'MH': 1, 'Arbressence': 2, 'DE': 3 };
    const toutes = [];

    function lireSheet(nomSheet, source, colMap) {
      const sheet = ss.getSheetByName(nomSheet);
      if (!sheet) return;
      const data    = sheet.getDataRange().getValues();
      const headers = data[0];
      const idx     = {};
      for (const [cle, label] of Object.entries(colMap)) idx[cle] = headers.indexOf(label);
      for (let i = 1; i < data.length; i++) {
        const qual = idx.qualite >= 0 ? (data[i][idx.qualite] || '').toString().trim() : '';
        if (qual === 'Erreur' || qual === 'Redirection') continue;
        const nom = idx.nom >= 0 ? (data[i][idx.nom] || '').toString().trim() : '';
        const cat = idx.cat >= 0 ? (data[i][idx.cat] || '').toString().trim() : '';
        if (!nom) continue;
        toutes.push({
          source, categorie: cat, categorMaitre: correspondance[cat] || cat, nom,
          url:          idx.url  >= 0 ? (data[i][idx.url]  || '').toString().trim() : '',
          inci:         idx.inci >= 0 ? (data[i][idx.inci] || '').toString().trim() : '',
          nomBotanique: idx.bot  >= 0 ? (data[i][idx.bot]  || '').toString().trim() : '',
          texteBrut:    idx.brut >= 0 ? (data[i][idx.brut] || '').toString().trim() : '',
          noteOlfactive: '', qualite: qual
        });
      }
    }

    lireSheet('Scraping_PA', 'PA', { nom: 'Nom', cat: 'Catégorie', url: 'URL', inci: 'INCI', bot: 'Nom botanique', brut: 'Texte brut', qualite: 'Qualité' });
    lireSheet('Scraping_MH', 'MH', { nom: 'Nom', cat: 'Catégorie', url: 'URL produit', inci: 'INCI', bot: 'Nom botanique', brut: 'Composantes majoritaires', qualite: 'Qualité' });
    lireSheet('Scraping_Arbressence', 'Arbressence', { nom: 'Nom', cat: 'Catégorie', url: 'URL produit', inci: 'INCI', bot: 'Nom botanique', brut: 'Texte brut', qualite: 'Qualité' });
    lireSheet('Scraping_DE', 'DE', { nom: 'Nom', cat: 'Catégorie', url: 'URL produit', inci: 'INCI', bot: 'Nom botanique', brut: 'Texte brut', qualite: 'Qualité' });

    const dedupMap = {};
    for (const l of toutes) {
      const key   = l.nom.toLowerCase();
      const score = scorer(l);
      const prio  = prioriteSource[l.source] ?? 99;
      if (!dedupMap[key]) {
        dedupMap[key] = { ...l, _score: score, _prio: prio };
      } else {
        const ex = dedupMap[key];
        if (score > ex._score || (score === ex._score && prio < ex._prio)) {
          const texteBrut = l.texteBrut || ex.texteBrut;
          dedupMap[key] = { ...l, texteBrut, _score: score, _prio: prio };
        } else if (!ex.texteBrut && l.texteBrut) {
          ex.texteBrut = l.texteBrut;
        }
      }
    }

    const lignesDedupliquees = Object.values(dedupMap).map(l => {
      const key = l.nom.toLowerCase();
      if (inciValides[key]) {
        return {
          ...l,
          inci:          inciValides[key].inci,
          nomBotanique:  inciValides[key].nomBotanique || l.nomBotanique,
          noteOlfactive: inciValides[key].noteOlfactive,
          categorMaitre: inciValides[key].categorie || l.categorMaitre,
          valide:        true
        };
      }
      return { ...l, valide: false };
    });

    const configRows = configData.slice(1).map((r, i) => ({
      rowIndex: i + 2, categorieSource: r[0] || '', categorieMaitre: r[1] || '',
      sourceProvenance: r[2] || '', confirme: r[3] === 'oui'
    }));

    return { success: true, lignes: lignesDedupliquees, correspondance: configRows };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// PAGE INCI — VALIDATION ET SAUVEGARDE
// ========================================

function getIngredientsInciSheet() {
  const ss = SpreadsheetApp.openById('16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0');
  let sheet = ss.getSheetByName('Ingredients_INCI');
  if (!sheet) {
    sheet = ss.insertSheet('Ingredients_INCI');
    sheet.appendRow(['Catégorie', 'Nom', 'INCI', 'Nom botanique', 'Source', 'Date', 'Note olfactive', 'Statut']);
    sheet.getRange('A1:H1').setFontWeight('bold').setBackground('#e8f5e9');
  }
  return sheet;
}

function validerIngredientInci(data) {
  try {
    const ss    = SpreadsheetApp.openById('16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0');
    const sheet = ss.getSheetByName('Ingredients_INCI');
    if (!sheet) return { success: false, message: 'Feuille Ingredients_INCI introuvable' };

    const rows   = sheet.getDataRange().getValues();
    const today  = Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd');
    const nom    = (data.nom           || '').trim();
    const cat    = (data.categorie     || '').trim();
    const inci   = (data.inci          || '').trim();
    const bot    = (data.nomBotanique  || '').trim();
    const source = (data.source        || '').trim();
    const note   = (data.noteOlfactive || '').trim();
    const statut = inci ? '✅ Validé' : '🔴 À compléter';

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === cat && rows[i][1].toString().trim().toLowerCase() === nom.toLowerCase()) {
        sheet.getRange(i + 1, 3).setValue(inci);
        sheet.getRange(i + 1, 4).setValue(bot);
        sheet.getRange(i + 1, 5).setValue(source);
        sheet.getRange(i + 1, 6).setValue(today);
        sheet.getRange(i + 1, 7).setValue(note);
        sheet.getRange(i + 1, 8).setValue(statut);
        return { success: true, action: 'mis_a_jour' };
      }
    }
    sheet.appendRow([cat, nom, inci, bot, source, today, note, statut]);
    return { success: true, action: 'ajoute' };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function saveIngredientInci(data) {
  try {
    const ss    = SpreadsheetApp.openById('16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0');
    const sheet = getIngredientsInciSheet();
    const rows  = sheet.getDataRange().getValues();
    const nom   = (data.nom      || '').trim();
    const cat   = (data.categorie || '').trim();
    const url   = (data.url      || '').trim();
    const s     = data.scraped   || null;

    if (!nom || !cat) return { success: false, message: 'Nom et catégorie requis.' };
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toLowerCase() === cat.toLowerCase() && rows[i][1].toLowerCase() === nom.toLowerCase()) {
        return { success: false, message: 'Ingrédient déjà existant.' };
      }
    }

    const aujourd_hui = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sheet.appendRow([cat, nom, '', '', 'Manuel', aujourd_hui, '', '🔴 À compléter']);

    if (s && url) {
      let nomSheet = null;
      if (url.indexOf('purearome.com')          !== -1) nomSheet = 'Scraping_PA';
      else if (url.indexOf('lesmauvaisesherbes') !== -1) nomSheet = 'Scraping_MH';
      else if (url.indexOf('arbressence.ca')     !== -1) nomSheet = 'Scraping_Arbressence';
      else if (url.indexOf('divineessence.com')  !== -1) nomSheet = 'Scraping_DE';

      if (nomSheet) {
        const sheetScraping = ss.getSheetByName(nomSheet);
        if (sheetScraping) {
          sheetScraping.appendRow([
            s.categorie || cat, s.nom || nom, s.inci || '', s.nomBotanique || '',
            s.texteBrut || '', url, 'Manuel', aujourd_hui,
            s.inci ? 'Propre' : (s.nomBotanique ? 'Bot seul' : 'À valider')
          ]);
        }
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

function sauvegarderCorrespondanceInci(data) {
  try {
    const sheet = getConfigInciSheet();
    sheet.clearContents();
    sheet.appendRow(['Catégorie source', 'Catégorie maître', 'Source', 'Confirmé']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#e8f5e9');
    if (data.correspondance && data.correspondance.length > 0) {
      const rows = data.correspondance.map(r => [
        r.categorieSource, r.categorieMaitre, r.sourceProvenance || '', r.confirme ? 'oui' : 'non'
      ]);
      sheet.getRange(2, 1, rows.length, 4).setValues(rows);
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

// ========================================
// API GET — GITHUB PAGES
// ========================================

function doGet(e) {
  const action = e.parameter.action;
  let result   = {};

  if      (action === 'getCatalogue')              result = getCataloguePublic();
  else if (action === 'getCollectionsPublic')      result = getCollectionsPublic();
  else if (action === 'getCollections')            result = getCollections();
  else if (action === 'getRecettes')               result = getRecettes();
  else if (action === 'getDensities')              result = { densities: getDensities() };
  else if (action === 'getInventory')              result = getInventory();
  else if (action === 'getInvoicesListWithFilters') result = getInvoicesListWithFilters();
  else if (action === 'getDropdownLists')          result = getDropdownLists();
  else if (action === 'getRecettesFormats')        result = getRecettesFormats(e.parameter.recette_id);
  else if (action === 'getRecettesBase')           result = getRecettesBase();
  else if (action === 'getContenu')               result = getContenu();
  else if (action === 'getSourcesInci')           result = getSourcesInci();
  else if (action === 'getCategoriesUC')          result = getCategoriesUC();

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// API POST — GITHUB PAGES
// ========================================

function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;
    let result   = { success: false, message: 'Action inconnue' };

    if      (action === 'addCollectionItem')              result = addCollectionItem(data);
    else if (action === 'updateCollectionItem')           result = updateCollectionItem(data);
    else if (action === 'deleteCollectionItem')           result = deleteCollectionItem(data.rowIndex);
    else if (action === 'saveRecette')                    result = saveRecette(data);
    else if (action === 'deleteRecette')                  result = deleteRecette(data.recette_id);
    else if (action === 'createInvoice')                  result = createInvoice(data.numeroFacture, data.date, data.fournisseur);
    else if (action === 'addProduct')                     result = addProduct(data);
    else if (action === 'updateProduct')                  result = updateProduct(data);
    else if (action === 'deleteProduct')                  result = deleteProduct(data.numeroFacture, data.rowIndex);
    else if (action === 'getInvoiceProducts')             result = getInvoiceProducts(data.numeroFacture);
    else if (action === 'finalizeInvoice')                result = finalizeInvoice(data);
    else if (action === 'saveDensity')                    result = saveDensity(data);
    else if (action === 'addDensityType')                 result = addDensityType(data);
    else if (action === 'deleteInvoice')                  result = deleteInvoice(data.numeroFacture);
    else if (action === 'diminuerStockRecette')           result = diminuerStockRecette(data.recette_id);
    else if (action === 'saveRecetteBase')                result = saveRecetteBase(data);
    else if (action === 'getRecettesFormats')             result = getRecettesFormats(data.recette_id);
    else if (action === 'saveRecetteFormat')              result = saveRecetteFormat(data);
    else if (action === 'deleteRecetteFormat')            result = deleteRecetteFormat(data.rowIndex);
    else if (action === 'envoyerContact')                 result = envoyerContact(data);
    else if (action === 'updateContenu')                  result = updateContenu(data);
    else if (action === 'saveIngredientInci')             result = saveIngredientInci(data);
    else if (action === 'validerIngredientInci')          result = validerIngredientInci(data);
    else if (action === 'sauvegarderCorrespondanceInci')  result = sauvegarderCorrespondanceInci(data);
    else if (action === 'scraperIngredientUrl')           result = scraperIngredientUrl(data.url);
    else if (action === 'ajouterCategorieUC')             result = ajouterCategorieUC(data);
    else if (action === 'modifierCategorieUC')            result = modifierCategorieUC(data);
    else if (action === 'supprimerCategorieUC')           result = supprimerCategorieUC(data);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Erreur: ' + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

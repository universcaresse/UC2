// ============================================================
// pa_v7.gs — Chercheur Univers Caresse
// Scraping complet Purearome — catalogue API + extraction
// Combine pa_v4.gs (catalogue) + pa_v6.gs (extraction complète)
// 26 mars 2026
// ============================================================
//
// UTILISATION :
//   1. Coller dans un projet Apps Script lié au Google Sheet
//   2. Lancer lancerPA_v7()
//   3. Résultats dans onglet "Scraping_PA_v4"
//
// COLONNES :
//   A=Nom | B=Catégorie | C=URL | D=INCI | E=Nom botanique | F=Texte brut | G=Qualité | H=Date
//
// CAS COUVERTS :
//   INCI direct      → "INCI :" ou "Inci :" ou "INC:" suivi de valeur
//   Ingrédients base → "Ingrédients :" → liste complète
//   Fragrances       → "INCI : fragrance" ou "Parfum (Fragrance)"
//   Nom botanique    → "Nom botanique :" ou "Nom Botanique :"
//   Accessoires      → mèche/contenant/éponge/moule/sac/sachet → Sans INCI
//   Colorants        → catégorie "Colorants et Pigments" sans INCI → Sans INCI
// ============================================================

var V7_SS_ID  = '16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0';
var V7_SHEET  = 'Scraping_PA_v4';
var V7_TOKEN  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NzQ1NzE2NzQsImV4cCI6MTgwNjEwNzY3NCwicm9sZXMiOlsiSVNfQVVUSEVOVElDQVRFRF9BTk9OWU1PVVNMWSJdLCJ1c2VybmFtZSI6IjMxOGNhNzZlLWJmN2EtNDYxYi05NWM0LTBlY2ViMzVkZjYxYiIsImlwIjoiMTU5LjIwMy4zNS40OSIsImlkZW50aXR5IjoiMzE4Y2E3NmUtYmY3YS00NjFiLTk1YzQtMGVjZWIzNWRmNjFiIiwiY3VzdG9tZXJfc2Vzc2lvbl90b2tlbiI6IjU4MDFhZTFlLWI2OTctNDM5OS05NjZhLWVjZjViMzJlZTE2MyIsInNob3BfaWQiOjEwNzV9.DzyI5PkTW5b_HeFM1F_pUhhPJ3jt6nEoA0ulvfYXYOvkrSar7LlNCMGWktIuA58SAhlgo7yOwjXXvIqN_qNTzfgwMS9BSeDogrUDVaw_pZXE3jDKMK3fuxBWS2CG9I9zQGIkf3VSxgG_nqmfn9OiAqBhdYt3ZH-Y73rGGKIBY1OXhIj_2VW3MukCYvk0xJ63pxxJkXDAx-e-1CUVNwtgm_NByGpQ_db8COQju6SpN_sXaaZ7Tn28Rvm9hLWBWC83OGlRu8dnKZKrHjIO9FpSWLknxlbeMF8HtYoF6OHGkVs2_ofTy3w4Azw9Vp1PIh2CfgYjBP-gRk2oVYXn3cz9jBoL28acu_s07A9ZV7HygBTthOPlRAd5r46Ec2yF0rV5U9tqArbBdJ3-5v5PxmuBw9p0bATVkTdBrWXXD-UWNq8MDBaH9Fh80G2DnXMBiBTMb_sikX7yMC33VX4P7HQNLuc1O_Uv8a-K97mgLUJYoi_8lCc9C82WTT0UAnKRqBGI64L5D9ggB5FCdxiqwb9LvmI0IjJzrY3JRC6Xg2rszrniR6sxmwqhVtmTTIY0uAQbxbQgAEpOqGIUbgDjcpSt7aQsyuTbkEB-v0MmJmx4zgsjEa3P5N5E6xSr020YBV2AQi3v-EV9UJYl9Leau3BcG0EvPt-vBuGT-vGpWAvI9aU';

var V7_CATEGORIES = [
  { id: 14329, nom: 'Argiles' },
  { id: 14332, nom: 'Bases neutres' },
  { id: 14335, nom: 'Cires' },
  { id: 14337, nom: 'Colorants et Pigments' },
  { id: 14340, nom: 'Herbes et Fleurs' },
  { id: 14341, nom: 'Huiles aromatiques naturelle' },
  { id: 14342, nom: 'Huiles essentielles' },
  { id: 14343, nom: 'Huiles et Beurres' },
  { id: 14344, nom: 'Hydrolats' },
  { id: 14345, nom: 'Ingrédients Liquides' },
  { id: 14346, nom: 'Ingrédients Secs' },
  { id: 14347, nom: 'Fragrances' },
  { id: 14348, nom: 'Saveurs naturelles' }
];

var V7_HEADERS     = ['Nom', 'Catégorie', 'URL', 'INCI', 'Nom botanique', 'Texte brut', 'Qualité', 'Date'];
var V7_ACCESSOIRES = /mèche|contenant|éponge|moule|sac|sachet/i;
var V7_DELIM       = '(?=\\s+(?:Numéro|Autres\\s+noms?|Nom\\s+commercial|Grade|Cette|Notre|Laboratoire|Procédé|Forme\\s*:|Méthode|Parties|Origine|Provenance|CAS|Point\\s+éclair|Compos|Principaux|Chémotype|Document|Garder|Boutique|Produits\\s+recommandés|Usage|Mise\\s+en|Conformité|Fabriqué|Si\\s+vous|Qualité\\s*:)|$)';


// ============================================================
// POINT D'ENTRÉE
// ============================================================
function lancerPA_v7() {
  var ss    = SpreadsheetApp.openById(V7_SS_ID);
  var sheet = ss.getSheetByName(V7_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(V7_SHEET);
  } else {
    sheet.clearContents();
    sheet.clearFormats();
  }

  sheet.appendRow(V7_HEADERS);
  sheet.getRange(1, 1, 1, V7_HEADERS.length).setFontWeight('bold').setBackground('#d9ead3');
  sheet.setFrozenRows(1);

  var today = new Date().toISOString().split('T')[0];
  var total = 0;

  // ── Passage 1 — Catalogue via API ─────────────────────────
  for (var c = 0; c < V7_CATEGORIES.length; c++) {
    var cat       = V7_CATEGORIES[c];
    var offset    = 0;
    var continuer = true;
    Logger.log('=== ' + cat.nom + ' ===');

    while (continuer) {
      try {
        var apiUrl = 'https://api2.panierdachat.app/api/public/products?categoryId=' + cat.id
                   + '&offset=' + offset + '&limit=100&order%5Btitle%5D=asc';
        var resp   = UrlFetchApp.fetch(apiUrl, {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + V7_TOKEN },
          muteHttpExceptions: true
        });

        if (resp.getResponseCode() !== 200) { continuer = false; continue; }

        var json     = JSON.parse(resp.getContentText());
        var produits = json.products || json.items || json.data || [];
        if (!Array.isArray(produits) || produits.length === 0) { continuer = false; continue; }

        var rows = produits.map(function(p) {
          return [
            p.title || p.name || '',
            cat.nom,
            p.slug ? 'https://www.purearome.com/fr/produit/' + p.slug : '',
            '', '', '', '', today
          ];
        });

        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, V7_HEADERS.length).setValues(rows);
        total += rows.length;
        Logger.log('  offset ' + offset + ' — ' + produits.length + ' produits');

        continuer = produits.length === 100;
        offset   += 100;
        Utilities.sleep(300);

      } catch (e) {
        Logger.log('  Erreur API : ' + e.message);
        continuer = false;
      }
    }
    Utilities.sleep(500);
  }

  Logger.log('✅ Catalogue — ' + total + ' produits');

  // ── Lancer Passage 2 avec déclencheur auto ────────────────
  var props = PropertiesService.getScriptProperties();
  props.setProperty('v7_reprise',  '2');
  props.setProperty('v7_en_cours', 'true');
  v7_supprimerTrigger();
  ScriptApp.newTrigger('v7_scraperPages').timeBased().everyMinutes(5).create();
  v7_scraperPages();
}


// ============================================================
// PASSAGE 2 — Scraper chaque page
// ============================================================
function v7_scraperPages() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('v7_en_cours') !== 'true') return;

  var ss    = SpreadsheetApp.openById(V7_SS_ID);
  var sheet = ss.getSheetByName(V7_SHEET);
  if (!sheet) return;

  var LIMITE_MS = 4.5 * 60 * 1000;
  var debut     = Date.now();
  var data      = sheet.getDataRange().getValues();
  var headers   = data[0];

  var colNom  = headers.indexOf('Nom') + 1;
  var colCat  = headers.indexOf('Catégorie') + 1;
  var colUrl  = headers.indexOf('URL') + 1;
  var colInci = headers.indexOf('INCI') + 1;
  var colBot  = headers.indexOf('Nom botanique') + 1;
  var colBrut = headers.indexOf('Texte brut') + 1;
  var colQual = headers.indexOf('Qualité') + 1;

  var depart = parseInt(props.getProperty('v7_reprise') || '2');

  for (var i = depart; i < data.length; i++) {
    if (Date.now() - debut > LIMITE_MS) {
      props.setProperty('v7_reprise', String(i));
      Logger.log('⏸ Pause — reprise ligne ' + i);
      return;
    }

    var url = (data[i][colUrl - 1] || '').toString().trim();
    if (!url) continue;

    var nom = (data[i][colNom - 1] || '').toString().trim();
    var cat = (data[i][colCat - 1] || '').toString().trim();

    // Accessoires sans INCI attendu
    if (V7_ACCESSOIRES.test(nom)) {
      sheet.getRange(i + 1, colInci).setValue('');
      sheet.getRange(i + 1, colBot).setValue('');
      sheet.getRange(i + 1, colQual).setValue('Sans INCI');
      sheet.getRange(i + 1, 1, 1, V7_HEADERS.length).setBackground('#efefef');
      continue;
    }

    try {
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: false });
      var code = resp.getResponseCode();

      if (code === 301 || code === 302) {
        sheet.getRange(i + 1, colQual).setValue('Redirection');
        sheet.getRange(i + 1, colBrut).setValue('→ ' + (resp.getHeaders()['Location'] || '?'));
        sheet.getRange(i + 1, colInci).setValue('');
        sheet.getRange(i + 1, colBot).setValue('');
        sheet.getRange(i + 1, 1, 1, V7_HEADERS.length).setBackground('#fce8e6');
        Utilities.sleep(400);
        continue;
      }

      if (code !== 200) {
        sheet.getRange(i + 1, colQual).setValue('Erreur HTTP ' + code);
        sheet.getRange(i + 1, 1, 1, V7_HEADERS.length).setBackground('#fce8e6');
        Utilities.sleep(400);
        continue;
      }

      var brut   = v7_nettoyerTexte(resp.getContentText());
      var inci   = v7_extraireInci(brut);
      var bot    = v7_extraireNomBotanique(brut);
      var ingred = '';

      if (!inci) {
        ingred = v7_extraireIngredients(brut);
        if (ingred) inci = ingred;
      }

      var qual = v7_qualite(inci, bot, cat, nom, ingred);

      sheet.getRange(i + 1, colInci).setValue(inci || '');
      sheet.getRange(i + 1, colBot).setValue(bot || '');
      sheet.getRange(i + 1, colBrut).setValue(brut.substring(0, 8000));
      sheet.getRange(i + 1, colQual).setValue(qual);

      var bg = qual === 'Propre'    ? null
             : qual === 'Base'      ? '#d9ead3'
             : qual === 'Bot seul'  ? '#cfe2f3'
             : qual === 'Sans INCI' ? '#efefef'
             : '#fff2cc';

      sheet.getRange(i + 1, 1, 1, V7_HEADERS.length).setBackground(bg);

      Logger.log(qual + ' — ' + nom);
      Utilities.sleep(700);

    } catch (e) {
      Logger.log('❌ ligne ' + i + ' — ' + e.message);
      sheet.getRange(i + 1, colQual).setValue('Erreur');
      sheet.getRange(i + 1, 1, 1, V7_HEADERS.length).setBackground('#fce8e6');
    }
  }

  props.setProperty('v7_en_cours', 'false');
  v7_supprimerTrigger();
  Logger.log('✅ PA v7 terminé');
}


// ============================================================
// NETTOYER LE TEXTE
// ============================================================
function v7_nettoyerTexte(html) {
  return html
    .replace(/&agrave;/gi, 'à').replace(/&eacute;/gi, 'é').replace(/&egrave;/gi, 'è')
    .replace(/&ecirc;/gi, 'ê').replace(/&euml;/gi, 'ë').replace(/&icirc;/gi, 'î')
    .replace(/&ocirc;/gi, 'ô').replace(/&ugrave;/gi, 'ù').replace(/&ucirc;/gi, 'û')
    .replace(/&ccedil;/gi, 'ç').replace(/&oelig;/gi, 'œ').replace(/&aelig;/gi, 'æ')
    .replace(/&Agrave;/g, 'À').replace(/&Eacute;/g, 'É').replace(/&Egrave;/g, 'È')
    .replace(/&Ecirc;/g, 'Ê').replace(/&Ocirc;/g, 'Ô').replace(/&Ccedil;/g, 'Ç')
    .replace(/&Ucirc;/g, 'Û').replace(/&Ugrave;/g, 'Ù').replace(/&Iuml;/g, 'Ï')
    .replace(/&iuml;/gi, 'ï').replace(/&auml;/gi, 'ä').replace(/&ouml;/gi, 'ö')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'").replace(/&#39;/gi, "'").replace(/&#160;/gi, ' ')
    .replace(/&ldquo;/gi, '"').replace(/&rdquo;/gi, '"').replace(/&mdash;/gi, '—')
    .replace(/&hellip;/gi, '...').replace(/&laquo;/gi, '«').replace(/&raquo;/gi, '»')
    .replace(/&deg;/gi, '°').replace(/&times;/gi, '×').replace(/&sup2;/gi, '²')
    .replace(/&sup3;/gi, '³').replace(/&frac12;/gi, '½').replace(/&acirc;/gi, 'â')
    .replace(/&Acirc;/g, 'Â').replace(/&#\d+;/g, ' ')
    .replace(/\\u([0-9a-fA-F]{4})/g, function(m, c) { return String.fromCharCode(parseInt(c, 16)); })
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


// ============================================================
// EXTRAIRE INCI
// ============================================================
function v7_extraireInci(texte) {
  var re = new RegExp('\\b(?:INCI|Inci|INC)\\s*:\\s*(.+?)' + V7_DELIM, 'i');
  var m  = texte.match(re);
  if (m && m[1].trim()) return v7_nettoyerInci(m[1].trim());
  return '';
}

function v7_nettoyerInci(inci) {
  inci = inci
    .replace(/\s+Numéro.*$/i, '')
    .replace(/\s+Autres\s+noms?.*$/i, '')
    .replace(/\s+Nom\s+commercial.*$/i, '')
    .replace(/\s+Grade\s*:.*$/i, '')
    .replace(/\s+Cette\s+(?:cire|base|huile|gomme|argile|poudre|fragrance).*$/i, '')
    .replace(/\s+Notre\s+colorant.*$/i, '')
    .replace(/\s+Laboratoire.*$/i, '')
    .replace(/\s+Procédé.*$/i, '')
    .replace(/\s+Fabriqué.*$/i, '')
    .replace(/\s+Le\s+(?:charbon|polysorbate|benzoate|xylitol).*$/i, '')
    .replace(/\)+\s*$/, '')
    .replace(/\)[,\s]*(est |aussi |un |une |le |la |les ).*/i, ')')
    .replace(/\s+$/, '');

  inci = inci.trim();
  if (inci.length < 2 || inci.length > 500) return '';
  if (/<|>|\d{5,}|charset/.test(inci)) return '';
  return inci;
}


// ============================================================
// EXTRAIRE INGRÉDIENTS (bases)
// ============================================================
function v7_extraireIngredients(texte) {
  var re = new RegExp('Ingrédients?\\s*(?:\\([^)]*\\))?\\s*:\\s*(.+?)' + V7_DELIM, 'i');
  var m  = texte.match(re);
  if (m && m[1].trim().length > 5) {
    var val = m[1].trim()
      .replace(/\s+Fabriqué.*$/i, '')
      .replace(/\s+Si\s+vous.*$/i, '')
      .replace(/\s+Mise\s+en.*$/i, '')
      .replace(/\s+\*\*Usage.*$/i, '')
      .trim();
    if (val.length > 5) return val;
  }
  return '';
}


// ============================================================
// EXTRAIRE NOM BOTANIQUE
// ============================================================
function v7_extraireNomBotanique(texte) {
  var re = /Nom\s+[Bb]otanique\s*:\s*(.+?)(?=\s+(?:Numéro|Autres\s+noms?|Nom\s+commercial|Grade|Cette\s+(?:huile|cire|base|plante)|Notre\s+sauge|Mélange|Nos\s+huiles|Savon|Usage|Document|Garder|Boutique|Produits\s+recommandés|Forme\s*:|Méthode|Parties|Origine|Procédé)|$)/i;
  var m  = texte.match(re);
  if (m && m[1].trim().length > 3) return m[1].trim().replace(/\s+/g, ' ');
  return '';
}


// ============================================================
// QUALITÉ
// ============================================================
function v7_qualite(inci, bot, cat, nom, ingred) {
  if (V7_ACCESSOIRES.test(nom))                  return 'Sans INCI';
  if (cat === 'Colorants et Pigments' && !inci)  return 'Sans INCI';
  if (ingred && ingred === inci)                 return 'Base';
  if (inci)                                      return 'Propre';
  if (bot)                                       return 'Bot seul';
  return 'À valider';
}


// ============================================================
// UTILITAIRES
// ============================================================
function v7_supprimerTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'v7_scraperPages') ScriptApp.deleteTrigger(t);
  });
}

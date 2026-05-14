/* ═══════════════════════════════════════
   UNIVERS CARESSE — admin-liste-prix.js
   Liste de prix imprimable 8.5 × 11
   ═══════════════════════════════════════ */

async function ouvrirListePrix() {
  if (!prodCache.charge) await chargerCacheProduits();

  // ── Produits publics seulement ──
  var produits = donneesProduits.filter(function(p) { return p.statut === 'public'; });
  if (!produits.length) { afficherMsg('produits', 'Aucun produit public.', 'erreur'); return; }

  // ── Organiser par collection → gamme → famille ──
  var parCollection = {};
  var ordreCollections = [];

  produits.forEach(function(pro) {
    var col = donneesCollections.find(function(c) { return c.col_id === pro.col_id; });
    var gam = donneesGammes.find(function(g) { return g.gam_id === pro.gam_id; });
    var fam = donneesFamilles.find(function(f) { return f.fam_id === pro.fam_id; });

    var colId = pro.col_id || '__sans-col__';
    var gamId = pro.gam_id || '__sans-gam__';
    var famId = pro.fam_id || '__sans-fam__';

    if (!parCollection[colId]) {
      parCollection[colId] = {
        nom:   (col && col.nom)  || '—',
        rang:  (col && col.rang) || 99,
        hex:   (col && col.couleur_hex) ? col.couleur_hex : (pro.couleur_hex || '#5a8a3a'),
        gammes: {}
      };
      ordreCollections.push(colId);
    }

    var colData = parCollection[colId];
    if (!colData.gammes[gamId]) {
      colData.gammes[gamId] = {
        nom:      (gam && gam.nom) || '',
        hex:      (gam && gam.couleur_hex) || colData.hex,
        familles: {}
      };
    }
    var gamData = colData.gammes[gamId];
    if (!gamData.familles[famId]) {
      gamData.familles[famId] = {
        nom:      (fam && fam.nom) || '',
        produits: []
      };
    }
    gamData.familles[famId].produits.push(pro);
  });

  // ── Trier collections par rang ──
  ordreCollections.sort(function(a, b) {
    return (parCollection[a].rang || 99) - (parCollection[b].rang || 99);
  });

  // ── Construire le contenu HTML ──
  var today = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  var contenuHTML = '';

  ordreCollections.forEach(function(colId) {
    var col = parCollection[colId];

    // Construire la liste à plat de tous les blocs produit de cette collection
    var blocsHTML = '';

    var gammesTriees = Object.values(col.gammes).sort(function(a, b) {
      return (a.nom || '').localeCompare(b.nom || '', 'fr');
    });

    gammesTriees.forEach(function(gam) {
      var famillesTriees = Object.values(gam.familles).sort(function(a, b) {
        return (a.nom || '').localeCompare(b.nom || '', 'fr');
      });

      famillesTriees.forEach(function(fam) {
        // Titre gamme (affiché une fois par famille)
        var enteteHTML = '';
        if (gam.nom) {
          enteteHTML += '<div class="gamme-titre" style="color:' + gam.hex + ';border-left-color:' + gam.hex + '">' + gam.nom + '</div>';
        }
        if (fam.nom) {
          enteteHTML += '<div class="famille-titre">' + fam.nom + '</div>';
        }

        fam.produits.forEach(function(pro, idx) {
          var formats = (prodCache.formats[pro.pro_id] || pro.formats || [])
            .slice()
            .sort(function(a, b) { return parseFloat(a.poids) - parseFloat(b.poids); });

          var couleurBordure = pro.couleur_hex || col.hex;

          var blocProduit = '<div class="bloc-produit">';
          // N'afficher l'en-tête gamme/famille qu'avant le premier produit de chaque famille
          if (idx === 0) blocProduit = '<div class="bloc-produit avec-entete">' + enteteHTML;

          blocProduit += '<div class="produit-nom" style="border-left-color:' + couleurBordure + '">' + (pro.nom || '—') + '</div>';

          formats.forEach(function(f) {
            var prix = parseFloat(f.prix_vente).toFixed(2).replace('.', ',') + ' $';
            blocProduit += '<div class="produit-format">';
            blocProduit += '<span class="format-poids">' + f.poids + '&nbsp;' + f.unite + '</span>';
            blocProduit += '<span class="format-tirets"></span>';
            blocProduit += '<span class="format-prix">' + prix + '</span>';
            blocProduit += '</div>';
          });

          blocProduit += '</div>';
          blocsHTML += blocProduit;
        });
      });
    });

    // Diviser les blocs en 3 colonnes égales
    // On utilise une grille CSS 3 colonnes à l'intérieur du bloc collection
    contenuHTML += '<div class="bloc-collection">';
    contenuHTML += '<div class="collection-bandeau" style="background:' + col.hex + '">' + col.nom.toUpperCase() + '</div>';
    var gammesPleineLargeur = '';
    gammesTriees.forEach(function(gam) {
      var famillesTriees2 = Object.values(gam.familles).sort(function(a, b) {
        return (a.nom || '').localeCompare(b.nom || '', 'fr');
      });
      var blocsGamme = '';
      famillesTriees2.forEach(function(fam) {
        fam.produits.forEach(function(pro) {
          var formats = (prodCache.formats[pro.pro_id] || pro.formats || [])
            .slice()
            .sort(function(a, b) { return parseFloat(a.poids) - parseFloat(b.poids); });
          var couleurBordure = pro.couleur_hex || col.hex;
          var blocProduit = '<div class="bloc-produit">';
          blocProduit += '<div class="produit-nom" style="border-left-color:' + couleurBordure + '">' + (pro.nom || '—') + '</div>';
          formats.forEach(function(f) {
            var prix = parseFloat(f.prix_vente).toFixed(2).replace('.', ',') + ' $';
            blocProduit += '<div class="produit-format"><span class="format-poids">' + f.poids + '&nbsp;' + f.unite + '</span><span class="format-tirets"></span><span class="format-prix">' + prix + '</span></div>';
          });
          blocProduit += '</div>';
          blocsGamme += blocProduit;
        });
      });
      if (gam.nom) {
        gammesPleineLargeur += '<div class="gamme-bloc">';
        gammesPleineLargeur += '<div class="gamme-titre" style="background:' + gam.hex + '">' + gam.nom + '</div>';
        gammesPleineLargeur += '<div class="collection-colonnes">' + blocsGamme + '</div>';
        gammesPleineLargeur += '</div>';
      } else {
        gammesPleineLargeur += '<div class="collection-colonnes">' + blocsGamme + '</div>';
      }
    });
    contenuHTML += gammesPleineLargeur;
    contenuHTML += '</div>';
  });

  // ── Document complet ──
  var html = '<!DOCTYPE html>\n<html lang="fr">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>Liste de prix — Univers Caresse</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">\n' +
    '<style>\n' +

    '@page {\n' +
    '  size: 8.5in 11in portrait;\n' +
    '  margin: 0.55in 0.5in 0.5in;\n' +
    '}\n' +

    '* { margin:0; padding:0; box-sizing:border-box; }\n' +

    'body {\n' +
    '  font-family: "DM Sans", sans-serif;\n' +
    '  font-weight: 300;\n' +
    '  color: #3d3b39;\n' +
    '  background: white;\n' +
    '  font-size: 9pt;\n' +
    '  line-height: 1.4;\n' +
    '}\n' +

    '.btn-imprimer {\n' +
    '  display: block; margin: 0 auto 20pt;\n' +
    '  padding: 9pt 26pt;\n' +
    '  background: #5a8a3a; color: white; border: none;\n' +
    '  font-family: "DM Sans", sans-serif; font-size: 9pt;\n' +
    '  letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;\n' +
    '}\n' +

    '.entete {\n' +
    '  text-align: center;\n' +
    '  padding-bottom: 14pt;\n' +
    '  margin-bottom: 14pt;\n' +
    '  border-bottom: 1.5pt solid #f2e4cf;\n' +
    '  break-inside: avoid;\n' +
    '}\n' +
    '.entete-logo { height: 150pt; margin-bottom: 6pt; }\n' +
    '.entete-titre {\n' +
    '  font-family: "Playfair Display", serif;\n' +
    '  font-size: 16pt; font-weight: 400;\n' +
    '  letter-spacing: 0.06em; color: #3d3b39;\n' +
    '  margin-bottom: 3pt;\n' +
    '}\n' +
    '.entete-date {\n' +
    '  font-size: 7pt; letter-spacing: 0.18em;\n' +
    '  text-transform: uppercase; color: #8b8680;\n' +
    '}\n' +

    /* Collection — pleine largeur, éviter coupure */
    '.bloc-collection {\n' +
    '  break-inside: avoid;\n' +
    '  margin-bottom: 16pt;\n' +
    '}\n' +
    '.collection-bandeau {\n' +
    '  color: white;\n' +
    '  font-size: 8pt; font-weight: 500;\n' +
    '  letter-spacing: 0.22em; text-transform: uppercase;\n' +
    '  padding: 5pt 8pt;\n' +
    '  margin-bottom: 6pt;\n' +
    '  width: 100%;\n' +
    '}\n' +

    /* 3 colonnes à l'intérieur de chaque collection */
    '.collection-colonnes {\n' +
    '  columns: 3;\n' +
    '  column-gap: 14pt;\n' +
    '}\n' +

    /* Gamme */
    '.gamme-bloc {\n' +
    '  margin-bottom: 8pt;\n' +
    '  break-inside: avoid;\n' +
    '}\n' +
 '.gamme-titre {\n' +
    '  font-family: "Playfair Display", serif;\n' +
    '  font-size: 7.5pt; font-weight: 500;\n' +
    '  letter-spacing: 0.14em;\n' +
    '  color: white;\n' +
    '  padding: 3pt 7pt;\n' +
    '  margin-bottom: 4pt;\n' +
    '  width: 100%;\n' +
    '  break-inside: avoid; break-after: avoid;\n' +
    '}\n' +

    /* Famille */
    '.famille-titre {\n' +
    '  font-size: 6pt; font-weight: 500;\n' +
    '  letter-spacing: 0.16em; text-transform: uppercase;\n' +
    '  color: #8b8680;\n' +
    '  padding-bottom: 2pt;\n' +
    '  border-bottom: 0.5pt solid #f2e4cf;\n' +
    '  margin-bottom: 2.5pt; margin-left: 5pt;\n' +
    '  break-inside: avoid; break-after: avoid;\n' +
    '}\n' +

    /* Produit */
    '.bloc-produit {\n' +
    '  break-inside: avoid;\n' +
    '  padding: 1.5pt 0 1.5pt 0;\n' +
    '  margin-bottom: 2pt;\n' +
    '}\n' +
    '.bloc-produit.avec-entete {\n' +
    '  margin-top: 4pt;\n' +
    '}\n' +
    '.produit-nom {\n' +
    '  font-size: 7.5pt; font-weight: 500;\n' +
    '  color: #3d3b39;\n' +
    '  border-left: 2pt solid;\n' +
    '  padding-left: 4pt;\n' +
    '  margin-bottom: 1pt;\n' +
    '}\n' +
    '.produit-format {\n' +
    '  display: flex;\n' +
    '  align-items: baseline;\n' +
    '  padding-left: 6pt;\n' +
    '  font-size: 7pt;\n' +
    '  color: #8b8680;\n' +
    '  gap: 2pt;\n' +
    '}\n' +
    '.format-tirets {\n' +
    '  flex: 1;\n' +
    '  border-bottom: 0.5pt dotted #c8c4c0;\n' +
    '  margin-bottom: 2pt;\n' +
    '}\n' +
    '.format-prix { font-weight: 400; color: #3d3b39; white-space: nowrap; }\n' +

    '.pied-de-page {\n' +
    '  text-align: center;\n' +
    '  font-size: 6.5pt; letter-spacing: 0.1em;\n' +
    '  color: #8b8680;\n' +
    '  border-top: 0.5pt solid #f2e4cf;\n' +
    '  padding-top: 4pt;\n' +
    '  margin-top: 16pt;\n' +
    '}\n' +

    '@media print {\n' +
    '  .btn-imprimer { display: none; }\n' +
    '}\n' +

    '</style>\n</head>\n<body>\n\n' +

    '<button class="btn-imprimer" onclick="window.print()">Imprimer</button>\n\n' +

    '<div class="entete">\n' +
    '  <img src="../Images/Divers/Logofinal.png" class="entete-logo" alt="Univers Caresse">\n' +
    '  <div class="entete-titre">Liste de prix</div>\n' +
    '  <div class="entete-date">En vigueur au ' + today + '</div>\n' +
    '</div>\n\n' +

    contenuHTML +

    '<div class="pied-de-page">Univers Caresse &nbsp;&middot;&nbsp; Prix en vigueur au ' + today + '</div>\n\n' +

    '</body>\n</html>';

  var fenetre = window.open('', '_blank');
  fenetre.document.write(html);
  fenetre.document.close();
}

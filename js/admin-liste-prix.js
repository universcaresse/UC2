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
        nom:    (col && col.nom)    || '—',
        rang:   (col && col.rang)   || 99,
        hex:    (col && col.couleur_hex) || pro.couleur_hex || '#5a8a3a',
        gammes: {}
      };
      ordreCollections.push(colId);
    }

    // Utiliser le hex du premier produit si la collection n'en a pas
    var colData = parCollection[colId];
    if (!colData.hexConfirme && pro.couleur_hex) {
      colData.hex = pro.couleur_hex;
      colData.hexConfirme = true;
    }

    if (!colData.gammes[gamId]) {
      colData.gammes[gamId] = {
        nom:     (gam && gam.nom) || '',
        familles: {}
      };
    }
    var gamData = colData.gammes[gamId];
    if (!gamData.familles[famId]) {
      gamData.familles[famId] = {
        nom:     (fam && fam.nom) || '',
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

    contenuHTML += '<div class="bloc-collection">';
    contenuHTML += '<div class="collection-bandeau" style="background:' + col.hex + '">' + col.nom.toUpperCase() + '</div>';

    // Gammes triées alphabétiquement
    var gammesTriees = Object.values(col.gammes).sort(function(a, b) {
      return (a.nom || '').localeCompare(b.nom || '', 'fr');
    });

    gammesTriees.forEach(function(gam) {
      contenuHTML += '<div class="bloc-gamme">';
      if (gam.nom) {
        contenuHTML += '<div class="gamme-titre">' + gam.nom + '</div>';
      }

      // Familles triées alphabétiquement
      var famillesTriees = Object.values(gam.familles).sort(function(a, b) {
        return (a.nom || '').localeCompare(b.nom || '', 'fr');
      });

      famillesTriees.forEach(function(fam) {
        contenuHTML += '<div class="bloc-famille">';
        if (fam.nom) {
          contenuHTML += '<div class="famille-titre">' + fam.nom + '</div>';
        }

        fam.produits.forEach(function(pro) {
          var formats = (prodCache.formats[pro.pro_id] || pro.formats || [])
            .slice()
            .sort(function(a, b) { return parseFloat(a.poids) - parseFloat(b.poids); });

          var couleurBordure = pro.couleur_hex || col.hex;

          contenuHTML += '<div class="bloc-produit">';
          contenuHTML += '<div class="produit-nom" style="border-left-color:' + couleurBordure + '">' + (pro.nom || '—') + '</div>';

          formats.forEach(function(f) {
            var prix = parseFloat(f.prix_vente).toFixed(2).replace('.', ',') + ' $';
            contenuHTML += '<div class="produit-format">';
            contenuHTML += '<span class="format-poids">' + f.poids + '&nbsp;' + f.unite + '</span>';
            contenuHTML += '<span class="format-prix">' + prix + '</span>';
            contenuHTML += '</div>';
          });

          contenuHTML += '</div>'; // .bloc-produit
        });

        contenuHTML += '</div>'; // .bloc-famille
      });

      contenuHTML += '</div>'; // .bloc-gamme
    });

    contenuHTML += '</div>'; // .bloc-collection
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
    '  font-size: 8pt;\n' +
    '  line-height: 1.4;\n' +
    '}\n' +

    /* Bouton impression */
    '.btn-imprimer {\n' +
    '  display: block; margin: 0 auto 20pt;\n' +
    '  padding: 9pt 26pt;\n' +
    '  background: #5a8a3a; color: white; border: none;\n' +
    '  font-family: "DM Sans", sans-serif; font-size: 8pt;\n' +
    '  letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;\n' +
    '}\n' +

    /* En-tête */
    '.entete {\n' +
    '  text-align: center;\n' +
    '  padding-bottom: 14pt;\n' +
    '  margin-bottom: 14pt;\n' +
    '  border-bottom: 1.5pt solid #f2e4cf;\n' +
    '  break-inside: avoid;\n' +
    '}\n' +
    '.entete-logo { height: 48pt; margin-bottom: 6pt; }\n' +
    '.entete-titre {\n' +
    '  font-family: "Playfair Display", serif;\n' +
    '  font-size: 16pt; font-weight: 400;\n' +
    '  letter-spacing: 0.06em; color: #3d3b39;\n' +
    '  margin-bottom: 3pt;\n' +
    '}\n' +
    '.entete-date {\n' +
    '  font-size: 6.5pt; letter-spacing: 0.18em;\n' +
    '  text-transform: uppercase; color: #8b8680;\n' +
    '}\n' +

    /* 2 colonnes */
    '.colonnes {\n' +
    '  columns: 2;\n' +
    '  column-gap: 18pt;\n' +
    '}\n' +

    /* Collection */
    '.bloc-collection {\n' +
    '  break-inside: avoid-column;\n' +
    '  margin-bottom: 10pt;\n' +
    '}\n' +
    '.collection-bandeau {\n' +
    '  color: white;\n' +
    '  font-size: 7pt; font-weight: 500;\n' +
    '  letter-spacing: 0.22em; text-transform: uppercase;\n' +
    '  padding: 4.5pt 7pt;\n' +
    '  margin-bottom: 5pt;\n' +
    '  break-inside: avoid; break-after: avoid;\n' +
    '}\n' +

    /* Gamme */
    '.bloc-gamme {\n' +
    '  break-inside: avoid;\n' +
    '  margin-bottom: 5pt;\n' +
    '}\n' +
    '.gamme-titre {\n' +
    '  font-family: "Playfair Display", serif;\n' +
    '  font-size: 8.5pt; font-weight: 600;\n' +
    '  color: #5a8a3a;\n' +
    '  padding-left: 5pt;\n' +
    '  border-left: 2pt solid #d4a445;\n' +
    '  margin-bottom: 3pt;\n' +
    '  break-inside: avoid; break-after: avoid;\n' +
    '}\n' +

    /* Famille */
    '.bloc-famille {\n' +
    '  break-inside: avoid;\n' +
    '  margin-bottom: 3pt;\n' +
    '}\n' +
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
    '  padding: 1.5pt 0 1.5pt 9pt;\n' +
    '  margin-bottom: 1pt;\n' +
    '}\n' +
    '.produit-nom {\n' +
    '  font-size: 7.5pt; font-weight: 500;\n' +
    '  color: #3d3b39;\n' +
    '  border-left: 2pt solid #5a8a3a;\n' +
    '  padding-left: 4pt;\n' +
    '  margin-bottom: 1pt;\n' +
    '}\n' +
    '.produit-format {\n' +
    '  display: flex;\n' +
    '  justify-content: space-between;\n' +
    '  padding-left: 6pt;\n' +
    '  font-size: 7pt;\n' +
    '  color: #8b8680;\n' +
    '}\n' +
    '.format-prix { font-weight: 400; color: #3d3b39; }\n' +

    /* Pied de page */
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
    '  <img src="../Images/logo.png" class="entete-logo" alt="Univers Caresse">\n' +
    '  <div class="entete-titre">Liste de prix</div>\n' +
    '  <div class="entete-date">En vigueur au ' + today + '</div>\n' +
    '</div>\n\n' +

    '<div class="colonnes">\n' + contenuHTML + '</div>\n\n' +

    '<div class="pied-de-page">Univers Caresse &nbsp;&middot;&nbsp; Prix en vigueur au ' + today + '</div>\n\n' +

    '</body>\n</html>';

  var fenetre = window.open('', '_blank');
  fenetre.document.write(html);
  fenetre.document.close();
}

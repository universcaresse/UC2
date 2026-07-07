// ═══════════════════════════════════════
// APERÇU CLIENT — outil admin
// Montre chaque écran du parcours Coups de cœur avec des données factices.
// Aucun appel serveur : tout est débranché.
// ═══════════════════════════════════════

// Données factices
const apercuLignes = [
  { pro_id: 'PRO-0001', nom: 'Savon Lavande', nom_collection: 'SAPONICA', nom_gamme: 'Fleurie',
    format_poids: '110', format_unite: 'g', quantite: 2, prix_unitaire: 8.5, type_ligne: 'pret' },
  { pro_id: 'PRO-0002', nom: 'Savon Karité', nom_collection: 'SAPONICA', nom_gamme: 'Douceur',
    format_poids: '110', format_unite: 'g', quantite: 1, prix_unitaire: 9, type_ligne: 'temporaire', date_dispo: '2026-08-01' },
  { pro_id: 'PRO-0003', nom: 'Shampoing Ortie', nom_collection: 'KÉRYS', nom_gamme: 'Cheveux',
    format_poids: '95', format_unite: 'g', quantite: 1, prix_unitaire: 12, type_ligne: 'definitif' }
];
const apercuNumero = 'CMD-0000';

// Les écrans : nom au menu + fonction qui retourne le HTML (textes recopiés du vrai code)
// Petit rendu d'une ligne (réutilisé par plusieurs écrans)
function apercuRangee(l, avecBoutons) {
  let html = '<div class="rangeeitem" style="margin-bottom:8px"><div class="rangeeitem-info">';
  if (l.nom_collection) html += '<div style="font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);margin-bottom:2px">' + l.nom_collection + '</div>';
  html += '<div class="rangeeitem-titre">' + l.nom + '</div>';
  html += '<div class="rangeeitem-meta">' + (l.nom_gamme ? l.nom_gamme + ' · ' : '') + l.format_poids + ' ' + l.format_unite;
  if (l.date_dispo) html += ' &nbsp;·&nbsp; disponible vers ' + l.date_dispo;
  html += '</div></div>';
  if (avecBoutons) {
    html += '<div style="display:flex;gap:8px;margin-top:6px">' +
      '<button type="button" class="boutons boutons-accent boutons-petit">Garder</button>' +
      '<button type="button" class="boutons boutons-rouge boutons-petit">Laisser tomber</button></div>';
  }
  html += '</div>';
  return html;
}

const apercuEcrans = [
  { nom: '1. Fiche produit', html: function () {
    return '<div style="text-align:center"><div class="visuel-hex" style="width:100%;height:180px;background:#9caf88;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--police-titre)">Photo produit</div></div>' +
      '<span class="accroche">SAPONICA · Fleurie</span>' +
      '<h2 class="titre">Savon Lavande</h2>' +
      '<p class="description">Un savon doux à la lavande, fait à la main. Mousse onctueuse, parfum délicat.</p>' +
      '<div style="border:1px solid var(--sable);padding:12px;margin:12px 0"><label class="casesacocher" style="display:flex;align-items:center;gap:8px"><input type="checkbox"> Cochez si ce produit vous intéresse</label></div>' +
      '<div class="rangeeitem-meta">110 g · 8,50 $</div>';
  } },
  { nom: '2. Fenêtre « Vos Coups de cœur »', html: function () {
    let html = '';
    apercuLignes.forEach(i => {
      const sous = i.prix_unitaire * i.quantite;
      html += '<div class="rangeeitem">' +
          '<div class="rangeeitem-info">' +
            '<div style="font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);margin-bottom:2px">' + i.nom_collection + '</div>' +
            '<div class="rangeeitem-titre">' + i.nom + '</div>' +
            '<div class="rangeeitem-meta">' + i.nom_gamme + ' · ' + i.format_poids + ' ' + i.format_unite + '</div>' +
          '</div>' +
          '<div class="compteur"><button type="button" class="compteur-btn">−</button>' +
          '<span class="compteur-valeur">' + i.quantite + '</span>' +
          '<button type="button" class="compteur-btn">+</button></div>' +
          '<button type="button" class="boutons boutons-contour boutons-petit">Retirer</button>' +
          '<div class="rangeeitem-valeur">' + sous.toFixed(2).replace('.', ',') + ' $</div>' +
        '</div>';
    });
    html += '<div class="lignetotal"><span class="lignetotal-libelle">Total avant les frais de livraison</span><span>' +
      apercuLignes.reduce((s, i) => s + i.prix_unitaire * i.quantite, 0).toFixed(2).replace('.', ',') + ' $</span></div>' +
      '<button type="button" class="boutons boutons-vert" style="width:100%;margin-top:12px">Continuer</button>';
    return '<h2 class="titre">Vos Coups de cœur</h2>' + html;
  } },
  { nom: '3. Merci ! (liste envoyée)', html: function () {
    return '<h2 class="demande-modal-titre">Merci !</h2>' +
      '<p>Votre liste modifiée a bien été envoyée. Nous vous reviendrons très bientôt.</p>' +
      '<button type="button" class="bouton bouton-grand">Fermer</button>';
  } },
  { nom: '4. Vos Coups de cœur (lien courriel)', html: function () {
    let total = 0, html = '';
    apercuLignes.forEach(i => {
      const sous = i.prix_unitaire * i.quantite;
      total += sous;
      html += '<div class="rangeeitem">' +
          '<div class="rangeeitem-info">' +
            '<div style="font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);margin-bottom:2px">' + i.nom_collection + '</div>' +
            '<div class="rangeeitem-titre">' + i.nom + '</div>' +
            '<div class="rangeeitem-meta">' + i.nom_gamme + ' · ' + i.format_poids + ' ' + i.format_unite + '</div>' +
          '</div>' +
          '<div class="compteur">' +
            '<button type="button" class="compteur-btn">−</button>' +
            '<span class="compteur-valeur">' + i.quantite + '</span>' +
            '<button type="button" class="compteur-btn">+</button>' +
          '</div>' +
          '<button type="button" class="bouton bouton-contour bouton-petit">Retirer</button>' +
          '<div class="rangeeitem-valeur">' + sous.toFixed(2).replace('.', ',') + ' $</div>' +
        '</div>';
    });
    html += '<div class="lignetotal"><span class="lignetotal-libelle">Total avant les frais de livraison</span>' +
      '<span>' + total.toFixed(2).replace('.', ',') + ' $</span></div>' +
      '<button type="button" class="bouton bouton-contour" style="margin-bottom:8px">Ajouter d\'autres produits</button>' +
      '<button type="button" class="bouton bouton-grand">Renvoyer mes Coups de coeur</button>' +
      '<button type="button" class="bouton bouton-contour" style="margin-top:12px">Je ne veux plus donner suite, annuler cette commande s.v.p.</button>';
    return '<h2 class="titre">Vos Coups de cœur</h2>' + html;
  } },
  { nom: '5. Vous souhaitez annuler?', html: function () {
    return '<h2 class="titre">Vous souhaitez annuler?</h2>' +
      '<p>Cette action est définitive. Voulez-vous vraiment annuler cette commande?</p>' +
      '<div class="form-group" style="margin:16px 0"><label class="form-label">Si vous voulez nous dire ce qui s\'est passé, nous lisons tout (c\'est facultatif)</label>' +
      '<textarea class="form-control" rows="3"></textarea></div>' +
      '<button type="button" class="bouton bouton-rouge">Oui, annuler ma commande</button>' +
      '<button type="button" class="bouton bouton-contour" style="margin-top:8px">Non, revenir à ma liste</button>';
  } },
  { nom: '6. Commande annulée', html: function () {
    return '<h2 class="titre">Commande annulée</h2>' +
      '<p>Votre commande a bien été annulée. Nous espérons vous revoir bientôt.</p>' +
      '<button type="button" class="bouton bouton-grand">Fermer</button>';
  } },
  { nom: '7. Proposition reçue (3 sections)', html: function () {
    const prets = apercuLignes.filter(l => l.type_ligne === 'pret');
    const temporaires = apercuLignes.filter(l => l.type_ligne === 'temporaire');
    const definitifs = apercuLignes.filter(l => l.type_ligne === 'definitif');
    function section(titre, liste, avecBoutons, sousTitre) {
      if (!liste.length) return '';
      let h = '<div style="margin:20px 0 8px;font-size:0.7rem;letter-spacing:0.2em;color:#8b8680;text-transform:uppercase">' + titre + '</div>';
      if (sousTitre) h += '<p class="textes-discrets" style="margin-bottom:8px">' + sousTitre + '</p>';
      liste.forEach(l => { h += apercuRangee(l, avecBoutons); });
      return h;
    }
    let html = section('Prêts à partir', prets, false, '');
    html += section('En attente de fabrication', temporaires, true, 'Indiquez ce que vous souhaitez faire pour chaque produit.');
    html += section('Non disponibles', definitifs, false, 'Ces produits ne peuvent pas faire partie de cette commande.');
    html += '<button type="button" class="boutons boutons-vert" style="width:100%;margin-top:16px">Recevoir ce qui est prêt</button>';
    html += '<button type="button" class="boutons boutons-contour" style="width:100%;margin-top:8px">Attendre que tout soit prêt</button>';
    html += '<button type="button" class="boutons boutons-contour" style="width:100%;margin-top:8px">Modifier</button>';
    return html;
  } },
  { nom: '8. Merci! (recevoir ce qui est prêt)', html: function () {
    return '<h2 class="titre">Merci!</h2><p>Ce qui est prêt est en route. Nous vous recontacterons pour le reste.</p><button type="button" class="bouton bouton-grand">Fermer</button>';
  } },
  { nom: '9. Noté! (attendre que tout soit prêt)', html: function () {
    return '<h2 class="titre">Noté!</h2><p>Nous vous recontacterons quand tout sera prêt.</p><button type="button" class="bouton bouton-grand">Fermer</button>';
  } },
  { nom: '10. Proposition déjà envoyée (vieux lien)', html: function () {
    return '<h2 class="titre">Une proposition vous a été envoyée pour cette commande.</h2>' +
      '<p class="textes-discrets">Nous vous avons envoyé une proposition par courriel, avec les prix et la livraison. Si vous ne la retrouvez pas...</p>' +
      '<button type="button" class="bouton bouton-grand">Recevez à nouveau votre proposition</button>' +
      '<button type="button" class="bouton bouton-contour" style="margin-top:8px">Écrivez-nous</button>';
  } },
  { nom: '11. Nouvelle proposition envoyée le …', html: function () {
    const dateF = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    return '<h2 class="titre">Une nouvelle proposition vous a été envoyée le ' + dateF + '.</h2>' +
      '<p class="textes-discrets">Ce courriel n\'est plus à jour. Retrouvez la proposition la plus récente dans vos courriels, ou recevez-la à nouveau.</p>' +
      '<button type="button" class="bouton bouton-grand">Recevez à nouveau votre proposition</button>' +
      '<button type="button" class="bouton bouton-contour" style="margin-top:8px">Écrivez-nous</button>';
  } },
  { nom: '12. Adresse de livraison', html: function () {
    const provinces = ['QC','ON','NB','NS','PE','NL','MB','SK','AB','BC','YT','NT','NU'];
    const optionsProv = provinces.map(p => '<option value="' + p + '"' + (p === 'QC' ? ' selected' : '') + '>' + p + '</option>').join('');
    return '<h2 class="titre">Adresse de livraison</h2>' +
      '<p class="textes-discrets">Avant le paiement, confirmez votre adresse pour la livraison. Disponible pour le Canada seulement.</p>' +
      '<div class="form-group"><label class="form-label">Rue <span>*</span></label><input type="text" class="form-control" value="123 rue des Lilas"></div>' +
      '<div class="form-group"><label class="form-label">Ville <span>*</span></label><input type="text" class="form-control" value="Québec"></div>' +
      '<div class="form-group"><label class="form-label">Province <span>*</span></label><select class="form-control"><option value="">— Choisir —</option>' + optionsProv + '</select></div>' +
      '<div class="form-group"><label class="form-label">Code postal</label><input type="text" class="form-control" value="G1A 1A1" readonly style="background:#f5f1ea;cursor:not-allowed"><p class="textes-discrets" style="margin-top:4px">Les frais de livraison sont calculés avec ce code postal. Pour le changer, écrivez-nous.</p></div>' +
      '<div class="form-group"><label class="form-label"><input type="checkbox"> Je souhaite recevoir l\'infolettre par courriel</label></div>' +
      '<button type="button" class="bouton bouton-grand">Continuer vers le paiement</button>';
  } },
  { nom: '13. Paiement (proposition expirée)', html: function () {
    return '<h2 class="titre">Paiement</h2>' +
      '<p>Cette proposition a dépassé son délai de validité. Comme les produits sont faits à la main et en petites quantités, les disponibilités changent — nous préférons revalider avec vous plutôt que de vous décevoir. Écrivez-nous et nous préparerons une proposition à jour.</p>' +
      '<button type="button" class="bouton bouton-grand">Écrivez-nous</button>';
  } },
  { nom: '14. Commande bloquée (Terminée / À expédier)', html: function () {
    return '<p style="margin-top:32px;margin-bottom:16px"><strong>Votre commande est en route!</strong></p>' +
      '<p style="margin-bottom:16px"><a href="#" class="lien-discret">Suivre le colis — 1234567890123456</a></p>' +
      '<p><a href="#" class="lien-discret">Une question? Écrivez-nous.</a></p>' +
      '<button type="button" class="bouton bouton-contour" style="display:inline-flex;width:auto">Fermer</button>' +
      '<hr style="margin:24px 0;border:none;border-top:1px solid var(--sable)">' +
      '<p style="margin-bottom:16px">Votre commande est en traitement — elle ne peut plus être modifiée.</p>' +
      '<p><a href="#" class="lien-discret">Une question? Écrivez-nous.</a></p>' +
      '<button type="button" class="bouton bouton-contour" style="display:inline-flex;width:auto">Fermer</button>';
  } },
  { nom: '15. Lien cassé', html: function () {
    return '<p>Nous n\'avons pas pu ouvrir votre commande. Écrivez-nous et nous allons vous aider.</p>' +
      '<button type="button" class="bouton bouton-grand">Écrivez-nous</button>';
  } }
];

function apercuClientOuvrir() {
  if (document.getElementById('apercu-client')) return;
  const fen = document.createElement('div');
  fen.id = 'apercu-client';
  fen.className = 'fenetre';
  fen.style.zIndex = '500';
  let menu = '';
  apercuEcrans.forEach((e, idx) => {
    menu += '<button type="button" class="boutons boutons-contour" data-apercu="' + idx + '" style="margin:4px">' + e.nom + '</button>';
  });
  fen.innerHTML =
    '<div class="modale-entete"><div class="entete"><span class="titre">Aperçu client — Coups de cœur</span>' +
    '<span class="textes-discrets">Données factices. Tous les boutons des écrans sont désactivés.</span></div>' +
    '<button type="button" class="boutons boutons-vert" data-apercu="fermer">Fermer l\'aperçu</button></div>' +
    '<div class="modale-corps"><div id="apercu-menu">' + menu + '</div>' +
    '<div id="apercu-ecran" style="max-width:560px;margin:24px auto;border:1px solid var(--sable);padding:24px"></div></div>';
  document.body.appendChild(fen);

  fen.addEventListener('click', function (ev) {
    const btnMenu = ev.target.closest('[data-apercu]');
    if (btnMenu) {
      const val = btnMenu.dataset.apercu;
      if (val === 'fermer') { apercuClientFermer(); return; }
      apercuClientMontrer(parseInt(val, 10));
      return;
    }
    // Tout le reste est débranché
    if (ev.target.closest('#apercu-ecran')) {
      ev.preventDefault();
      ev.stopPropagation();
      apercuToast();
    }
  }, true);
}

function apercuClientFermer() {
  const fen = document.getElementById('apercu-client');
  if (fen) fen.remove();
}

function apercuToast() {
  let t = document.getElementById('apercu-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'apercu-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--grise-foncee);color:var(--blancpur);padding:8px 16px;z-index:600;font-size:0.85rem';
    document.body.appendChild(t);
  }
  t.textContent = 'Aperçu — action désactivée';
  clearTimeout(t._minuteur);
  t._minuteur = setTimeout(() => t.remove(), 1500);
}

function apercuClientMontrer(idx) {
  const e = apercuEcrans[idx];
  const zone = document.getElementById('apercu-ecran');
  if (!e || !zone) return;
  zone.innerHTML = e.html();
}
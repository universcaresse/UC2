async function chargerContenuSite() {
  const loading = document.getElementById('loading-contenu-site');
  const corps   = document.getElementById('corps-contenu-site');
  if (loading) loading.classList.remove('cache');
  if (corps)   corps.classList.add('cache');
  // V2 : getContenu
  const data = await appelAPI('getContenu');
  if (loading) loading.classList.add('cache');
  if (!data || !data.success || !data.contenu) { afficherMsg('msg-contenu-site', 'Erreur de chargement.', 'erreur'); return; }
  const c = data.contenu;
  Object.keys(c).forEach(cle => {
    const el = document.getElementById('cs-' + cle);
    if (el) el.value = c[cle];
  });
  
  if (corps) corps.classList.remove('cache');
}

async function sauvegarderContenuSite() {
  afficherChargement();
  const corps = document.getElementById('corps-contenu-site');
  if (!corps) return;
  const contenu = {};
  corps.querySelectorAll('[id^="cs-"]').forEach(el => {
    const cle = el.id.replace('cs-', '');
    contenu[cle] = el.value;
  });
  const data = await appelAPIPost('updateContenu', { contenu });
  if (data && data.success) {
    cacherChargement();
    afficherMsg('msg-contenu-site', 'Contenu sauvegardé.', 'succes');
  } else {
    cacherChargement();
    afficherMsg('msg-contenu-site', 'Erreur lors de la sauvegarde.', 'erreur');
  }
}

"(function () {
  if (sessionStorage.getItem('ucIntroVu')) return;

  var overlay = document.getElementById('uc-intro-overlay');
  if (!overlay) return;
  var logo = overlay.querySelector('.uc-intro-logo');
  var texte = overlay.querySelector('.uc-intro-welcome');

  setTimeout(function () { logo.classList.add('uc-grow'); }, 100);
  setTimeout(function () { texte.classList.add('uc-show'); }, 900);

  function fermerIntro() {
    overlay.classList.add('uc-fade-out');
    sessionStorage.setItem('ucIntroVu', 'true');
    setTimeout(function () { overlay.remove(); }, 650);
  }

  // Se ferme quand tes données sont prêtes (voir plus bas)
  window.addEventListener('uc:donneesChargees', fermerIntro);

  // Filet de sécurité si l'événement n'arrive jamais
  setTimeout(fermerIntro, 4500);
})();
"
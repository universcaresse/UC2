(function() {
  var overlay = document.getElementById("uc-intro-overlay");
  if (!overlay) return;

  // Déjà vue cette session → on retire direct, pas d'animation
  if (sessionStorage.getItem("ucIntroVu")) {
    overlay.remove();
    return;
  }

  var logo = overlay.querySelector(".uc-intro-logo");
  var texte = overlay.querySelector(".uc-intro-welcome");
  var ferme = false;

  setTimeout(function() { logo.classList.add("uc-show"); }, 300);
  setTimeout(function() { texte.classList.add("uc-show"); }, 900);

  function fermerIntro() {
    if (ferme) return;
    ferme = true;
    overlay.classList.add("uc-fade-out");
    sessionStorage.setItem("ucIntroVu", "true");
    setTimeout(function() { overlay.remove(); }, 1000);
  }

  // Durée fixe et prévisible, plus d'attente du chargement des images
  setTimeout(fermerIntro, 2200);
})();

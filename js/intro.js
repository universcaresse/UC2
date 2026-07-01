(function() {
  if (sessionStorage.getItem("ucIntroVu")) return;

  var overlay = document.getElementById("uc-intro-overlay");
  if (!overlay) return;
  var logo = overlay.querySelector(".uc-intro-logo");
  var texte = overlay.querySelector(".uc-intro-welcome");
  var ferme = false;

  setTimeout(function() { logo.classList.add("uc-show"); }, 400);
  setTimeout(function() { texte.classList.add("uc-show"); }, 2400);

  function fermerIntro() {
    if (ferme) return;
    ferme = true;
    overlay.classList.add("uc-fade-out");
    sessionStorage.setItem("ucIntroVu", "true");
    setTimeout(function() { overlay.remove(); }, 2000);
  }

  // Attend que TOUTE la page (images incluses) soit chargée
  if (document.readyState === "complete") {
    setTimeout(fermerIntro, 2200);
  } else {
    window.addEventListener("load", function() {
      setTimeout(fermerIntro, 2200);
    });
  }

  // Filet de sécurité absolu si jamais 'load' ne se déclenche pas
  setTimeout(fermerIntro, 7000);
})();
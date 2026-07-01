(function() {
  var overlay = document.getElementById("uc-intro-overlay");
  if (!overlay) return;

  // Déjà vue cette session → on retire direct, sans animation
  if (sessionStorage.getItem("ucIntroVu")) {
    overlay.remove();
    return;
  }

  var logo = overlay.querySelector(".uc-intro-logo");
  var texte = overlay.querySelector(".uc-intro-welcome");
  var ferme = false;

  function demarrerSequence() {
    setTimeout(function() { logo.classList.add("uc-show"); }, 300);           // 1. logo arrive doucement
    setTimeout(function() { texte.classList.add("uc-show"); }, 2400);          // 2. Bienvenue apparaît
    setTimeout(function() { texte.classList.remove("uc-show"); }, 4800);       // 3. Bienvenue disparaît lentement
    setTimeout(voyagerVersLogoReel, 6300);                                     // 4. le logo part vers son emplacement
  }

  function voyagerVersLogoReel() {
    var cible = document.querySelector("#section-accueil .hero-logo-img");

    if (!cible) { fermerIntro(); return; }

    var depart = logo.getBoundingClientRect();
    var arrivee = cible.getBoundingClientRect();

    var echelle = arrivee.width / depart.width;
    var deltaX = (arrivee.left + arrivee.width / 2) - (depart.left + depart.width / 2);
    var deltaY = (arrivee.top + arrivee.height / 2) - (depart.top + depart.height / 2);

    // Le vrai logo doit être visible dès que l'overlay se retire
    cible.style.opacity = "1";
    cible.style.transform = "none";

    logo.classList.add("uc-voyage");
    logo.style.transform = "translate(" + deltaX + "px, " + deltaY + "px) scale(" + echelle + ")";

    setTimeout(fermerIntro, 1400);
  }

  function fermerIntro() {
    if (ferme) return;
    ferme = true;
    overlay.classList.add("uc-fade-out");
    sessionStorage.setItem("ucIntroVu", "true");
    setTimeout(function() { overlay.remove(); }, 1000);
  }

  if (document.readyState === "complete") {
    demarrerSequence();
  } else {
    window.addEventListener("load", demarrerSequence);
  }

  // Filet de sécurité si "load" ne se déclenche jamais
  setTimeout(fermerIntro, 12000);
})();

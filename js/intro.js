(function() {
  if (sessionStorage.getItem("ucIntroVu")) return;

  var overlay = document.getElementById("uc-intro-overlay");
  if (!overlay) return;
  var logo = overlay.querySelector(".uc-intro-logo");
  var texte = overlay.querySelector(".uc-intro-welcome");

  setTimeout(function() { logo.classList.add("uc-grow"); }, 150);
  setTimeout(function() { texte.classList.add("uc-show"); }, 1200);

  function voyagerEtFermer() {
    var cible = document.getElementById("hero-logo-cible");

    texte.style.transition = "opacity 0.4s ease";
    texte.style.opacity = "0";

    if (!cible) {
      terminer();
      return;
    }

    var rectSource = logo.getBoundingClientRect();
    var rectCible = cible.getBoundingClientRect();

    var dx = (rectCible.left + rectCible.width / 2) - (rectSource.left + rectSource.width / 2);
    var dy = (rectCible.top + rectCible.height / 2) - (rectSource.top + rectSource.height / 2);
    var echelle = rectCible.width / 280;

    logo.classList.add("uc-voyage");
    logo.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + echelle + ")";

    setTimeout(terminer, 1350);
  }

  function terminer() {
    overlay.classList.add("uc-fade-out");
    sessionStorage.setItem("ucIntroVu", "true");
    setTimeout(function() { overlay.remove(); }, 900);
  }

  window.addEventListener("uc:donneesChargees", voyagerEtFermer, { once: true });
  setTimeout(voyagerEtFermer, 4000);
})();
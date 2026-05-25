# Plan de modifications
## Section « Comment se procurer nos produits »

Trois fichiers à modifier, dans l'ordre. Un changement à la fois.

---

## Étape 1 — `index.html`

**Trouver :**
```
    </div>

    <section class="section-collections">
      <div class="section-header">
        <h2 class="section-title">Nos <em>collections</em></h2>
```

**Remplacer par :**
```
    </div>

    <section class="bonne-section fade-in">
      <h2 class="bonne-section-titre">Comment se procurer nos <em>produits</em></h2>
      <p>Nos produits sont fabriqués en petites quantités, avec soin et patience. Il n'y a pas de panier ici, il y a une conversation.</p>
      <p>Quand quelque chose vous plaît, cochez-le. Vous constituez votre liste de Coups de cœur et nous revenons vers vous dans 2 à 3 jours ouvrables pour confirmer les détails, la disponibilité et le prix final. Rien n'est engagé avant qu'on se soit parlé.</p>
      <p class="cache" id="procurer-marche"></p>
    </section>

    <section class="section-collections">
      <div class="section-header">
        <h2 class="section-title">Nos <em>collections</em></h2>
```

---

## Étape 2 — `js/main.js`

Dans la fonction `appliquerContenu(c)`, après la ligne :
```
set('contenu-citation-source', c.citation_source);
```

**Ajouter :**
```javascript
set('procurer-marche', c.procurer_marche_texte);
const elMarche = document.getElementById('procurer-marche');
if (elMarche) {
  if (String(c.procurer_marche_actif) === '1' && c.procurer_marche_texte) {
    elMarche.classList.remove('cache');
  } else {
    elMarche.classList.add('cache');
  }
}
```

---

## Étape 3 — `UC2/admin/index.html`

Dans `#section-contenu-site`, après le `form-panel` « Mode maintenance », **trouver :**
```
          <div class="form-panel visible">
            <div class="form-panel-header"><div class="form-panel-titre">Accueil — Hero</div></div>
```

**Remplacer par :**
```
          <div class="form-panel visible">
            <div class="form-panel-header"><div class="form-panel-titre">Présence au marché</div></div>
            <div class="form-body">
              <div class="form-groupe">
                <label class="form-label">Afficher la ligne de présence</label>
                <select class="form-ctrl" id="cs-procurer_marche_actif">
                  <option value="0">Non — ligne masquée</option>
                  <option value="1">Oui — ligne visible</option>
                </select>
              </div>
              <div class="form-groupe">
                <label class="form-label">Texte à afficher</label>
                <textarea class="form-ctrl" id="cs-procurer_marche_texte" rows="2" placeholder="Ex: Vous préférez nous rencontrer en personne ? Nous sommes au marché local du 5 au 6 juillet 2026."></textarea>
              </div>
            </div>
          </div>

          <div class="form-panel visible">
            <div class="form-panel-header"><div class="form-panel-titre">Accueil — Hero</div></div>
```

---

## Notes

- `admin-contenu-site.js` : **aucune modification requise** — les champs `cs-` sont lus et sauvegardés automatiquement.
- La ligne marché apparaît sur le site public seulement si le toggle est sur **Oui** ET que le champ texte n'est pas vide.
- Les deux paragraphes principaux sont codés en dur dans le HTML — ils ne passent pas par Google Sheets.

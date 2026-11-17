# Univers Caresse — à lire AVANT de répondre ou de coder

**1. Lis d'abord, en entier, maintenant :** `REFERENCE.md` (les règles de travail) puis `ETAT.md` (comment le site marche, décisions prises, pièges connus). Ne fais **jamais** re-expliquer le fonctionnement à l'utilisateur : c'est écrit, lis-le.

**2. Cherche avant de demander.** L'information est presque toujours **déjà dans le code** — un `grep` la trouve. Ne demande jamais un nom de fichier, de fonction, d'`id` ou de colonne qu'une recherche donnerait.

**3. Pas de discours.** Pas d'étapes de recherche affichées, pas de « je vais lire… », pas de remplissage. Réponses courtes. Décris le plan en clair, attends le OK, puis applique.

**4. La sécurité passe avant tout** (voir `REFERENCE.md`, section 1) : celle de l'entreprise et celle des clientes.

## Qui mène
- **Jean-Claude** mène le site au complet depuis le 16 nov. 2026, avec l'accord de Chantal (propriétaire de l'entreprise).
- Le seul dépôt actif : **`universcaresse/UC2`**. Les copies `ngjcpvino/UC2`, `ngjcpvino/UC2-1` et `ngjcpvino/uc2-site` sont **archivées** (16 nov. 2026) : ne jamais travailler dedans.

## Repères techniques (pour ne pas les redemander)
- **Site public** : `index.html` + `js/main.js` + `js/main-demande.js`, servi par GitHub Pages à **universcaresse.ca** (`CNAME`).
- **Admin** : `admin/index.html` + `admin/login.html` + `js/admin.js` (chef d'orchestre) + un `js/admin-*.js` par section.
- **Adresse du serveur** : `js/config.js` (`CONFIG.APPS_SCRIPT_URL`), chargé avant `main.js`. Les appels passent par `appelAPI` (lire) et `appelAPIPost` (écrire), dans `main.js`.
- **Serveur** : projet Apps Script **« UC2 »** (compte universcaresse, 7 fichiers depuis le ménage du 17 nov. 2026 : `Code.gs`, `Utilitaires.gs`, quatre `Fournisseur-….gs`, `appsscript.json`). Sa copie vit dans le dépôt **PRIVÉ `universcaresse/UC2-serveur`** (17 nov. 2026) : le lire là avant d'affirmer quoi que ce soit. ⚠️ La copie peut être en retard sur ce qui roule dans Google : en cas de doute, la reprendre par le connecteur Drive (projet partagé en lecture avec ngjcpvino).
- **Feuille de données** : identifiant `16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0` (`SS_ID` dans `Code.gs`). Le vieux projet Drive « univers caresse » (mars 2026, achats d'ingrédients) n'est PAS le serveur.
- **Publier le site = commit + push sur `main`**, après le OK. Le serveur, lui, se redéploie à la main (Apps Script → Gérer les déploiements → Nouvelle version).

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
- **Serveur** : Google Sheets + Apps Script (`Code.gs` + un fichier utilitaire). ⚠️ **Le code du serveur n'est PAS dans ce dépôt** : ne jamais affirmer ce qu'il fait sans l'avoir lu — le demander à l'utilisateur, ou le dire.
- **Publier le site = commit + push sur `main`**, après le OK. Le serveur, lui, se redéploie à la main (Apps Script → Gérer les déploiements → Nouvelle version).

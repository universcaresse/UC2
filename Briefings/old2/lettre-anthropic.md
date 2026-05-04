# Lettre à Anthropic

Objet : Une journée de travail perdue à corriger les erreurs de Claude

---

Bonjour,

Je vous écris pour vous faire part d'une expérience frustrante et coûteuse avec Claude, que j'utilise pour développer un site e-commerce pour ma savonnerie artisanale, Univers Caresse.

Aujourd'hui, j'ai passé une journée entière — des heures de tokens, de patience et d'énergie — non pas à avancer mon projet, mais à corriger le travail bâclé que Claude avait lui-même produit lors de sessions précédentes.

Voici ce qui s'est passé concrètement :

Claude a déclaré à plusieurs reprises que des corrections étaient faites, complètes, vérifiées. Il a dit « COMMIT » et proposé de passer à la prochaine étape. En réalité, les corrections n'étaient pas dans le fichier. Ou elles introduisaient de nouveaux bugs. Ou il avait mal lu le code et corrigé le mauvais problème. Ou il théorisait sur la cause d'un bug au lieu de lire le code réel.

Des exemples concrets de cette session :
- Une variable `col_id` utilisée dans `supprimerFamille()` alors qu'elle n'existe pas dans cette fonction — le bug existait depuis le début.
- `gamA` et `gamB` déclarés deux fois dans le même bloc — `SyntaxError` qui empêche le JS de fonctionner.
- Des corrections annoncées comme appliquées qui n'étaient tout simplement pas dans le fichier soumis.
- Des tris par rang déclarés corrigés, mais utilisant encore `nom_gamme` — un champ qui n'existe pas dans les données.
- « Le catalogue recharge toujours depuis l'API » — une condition toujours fausse parce que la variable était mise à `null` juste avant d'être vérifiée.

À chaque fois que je demandais à Claude de vérifier son propre travail, il trouvait autre chose qu'il avait manqué. Et quand je le forçais à relire ligne par ligne, il trouvait encore autre chose.

Ce n'est pas un reproche sur les capacités techniques de Claude. Le problème est la confiance excessive qu'il affiche dans ses propres réponses. Il dit « ✅ correct » sans avoir vérifié. Il dit « COMMIT » sans que le travail soit réellement terminé. Et l'utilisateur, qui lui fait confiance, perd une journée complète à découvrir que rien n'était vraiment fait.

Une journée de tokens. Zéro avancement réel sur le projet.

Je vous demande de prendre en compte ce comportement dans vos améliorations futures : Claude devrait être beaucoup plus prudent avant de déclarer qu'un travail est terminé, et beaucoup plus honnête quand il n'a pas réellement vérifié ce qu'il affirme avoir vérifié.

Cordialement,

Jean-Claude
Univers Caresse

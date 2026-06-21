# Résumé du projet — Calculateur de tarifs + Étiquettes Poste Canada

## Contexte
- Objectif : intégrer l'API de Poste Canada pour
  1. **Calculer le coût d'un envoi** (Rating API)
  2. **Générer une étiquette d'expédition** (Non-Contract Shipping API)

## Qui fait quoi
- **C'est moi (la propriétaire) qui calcule le tarif et génère l'étiquette** — pas le client final
- Le client ne voit jamais ce calculateur ; il s'agit d'un **outil admin/privé**, pas d'une fonctionnalité publique sur le site
- → Il faut donc associer cet item aux commandes pour faire la proposition correctement et quand je termine la commande, que je puisse imprimer l'étiquette.

## Déjà fait (étapes complétées)
- ✅ Création du compte Poste Canada — **Solutions pour petites entreprises** (gratuit)
- ✅ Inscription au **Programme pour développeurs**
- ✅ Obtention des **clés API** (développement + production)
- Les clés seront placées directement dans **PropertiesService** de GAS par moi-même (jamais dans le code, jamais sur GitHub, jamais collées dans le chat)

## Contraintes techniques connues
- L'API de Poste Canada fonctionne en **XML** (REST ou SOAP), pas en JSON — il faudra parser/construire du XML dans GAS via `UrlFetchApp`
- Deux clés distinctes : une pour l'environnement **Bac à sable** (développement/tests), une pour la **production**
- Toujours tester en Bac à sable avant la production
- Le service de génération d'étiquette (Non-Contract Shipping) **paie et autorise automatiquement** en une seule requête — pas de séparation entre "créer" et "payer"
- Le retour de l'étiquette est un **PDF en binaire**, à gérer pour affichage/téléchargement dans GAS

## Reste à déterminer avant de coder
- [ ] Numéro de compte Poste Canada (Customer Number) à utiliser dans les appels API
- [ ] Adresse d'expédition complète (adresse d'origine pour tous les calculs)
- [ ] Poids/dimensions typiques des produits expédiés
- [ ] Structure actuelle du projet GAS (fichiers .gs et .html existants — non communiquée encore)
- [ ] Où insérer la nouvelle page admin dans la structure du site existant

## Préférences de travail de la propriétaire du site

- **Aucune proposition de solution sans analyse complète au préalable**
- Les clés API ne doivent **jamais** apparaître dans le code source, sur GitHub, ni être collées dans une conversation — elles vont uniquement dans PropertiesService de GAS

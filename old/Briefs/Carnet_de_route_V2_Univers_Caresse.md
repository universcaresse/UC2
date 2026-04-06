# CARNET DE ROUTE — UNIVERS CARESSE V2
### Document vivant — à lire au début de chaque conversation

---

## ⛔ PROTOCOLE DE DÉMARRAGE — TOUJOURS DANS CET ORDRE

Chaque conversation commence exactement comme ça — sans exception.

1. Coller le **Carnet de route** (ce document)
2. Coller les **Règles de travail**
3. Coller le **Journal des décisions**
4. Dire ce qu'on fait dans cette session — exemple : *"On commence les sheets V2. Collections et Lignes en premier."*

**Le Claude doit confirmer qu'il a tout lu avant de commencer.**
**Si le Claude propose quelque chose qui contredit une décision du journal — pointer le journal.**
**Si une nouvelle décision est prise — l'ajouter au journal avant de terminer la session.**

---

## QUI EST UNIVERS CARESSE

### L'origine
Chantal Mondor a toujours voulu faire les choses elle-même, avec de vrais ingrédients, des gestes simples, le respect de ce qu'on met sur sa peau. À la retraite, le temps est enfin arrivé. Des formations, beaucoup de lectures, des tests et encore des tests. Les premiers savons sont offerts en cadeau au dernier Noël. Les réactions sourient. Univers Caresse naît.

### La promesse
- Saponification à froid — pas de chaleur, pas de compromis
- Petites quantités, sur commande
- Ingrédients choisis pour ce qu'ils font vraiment — pas pour leur coût
- Sans huile de palme
- Fait au Québec, dans un atelier artisanal
- Entièrement biodégradable

### L'ADN créatif
Chantal est une poète qui fait des savons. Chaque produit a un nom, une histoire, une atmosphère. "Bois de caractère", "Feu d'automne", "Nordet conçu pour affronter la rigueur de l'hiver québécois". Ce n'est pas du marketing — c'est une voix. Une vision. L'outil de gestion doit respecter ça en étant discret et efficace, pour lui laisser la tête libre pour créer.

### Les collections (9)
| Collection | Intention |
|---|---|
| SAPONICA | Le savon dans sa forme la plus pure — base généreuse, glycérine naturelle, chaque barre une histoire |
| PETIT NUAGE | Pour les tout-petits — surgraissé 10%, sans compromis sur la douceur |
| CAPRIN | Savon au lait de chèvre — douceur crémeuse, fraîcheurs fruitées |
| ÉMOLIA | Se choyer — baumes, bombes de bain, soins corporels, lèvres |
| ÉPURE | Pour les mains qui travaillent — près de l'évier, solide, efficace |
| KÉRYS | Soin capillaire en barre — 3 lignes : PURÉLIA (gras), ÉQUILIBRA (normal), HYDRABOUCLE (boucles) |
| CASA | La même philosophie appliquée à la maison — vaisselle, bruine, eau de linge, bougies |
| LUI | Le naturel au masculin — boisé, frais, affirmé |
| ANIMA | Pour les compagnons — sans huile essentielle, respectueux de leur odorat |

---

## LES DEUX UTILISATEURS

### Toi (le développeur permanent)
Tu es l'ami de 22 ans qui partage le café du matin avec Chantal. Tu développes l'outil, tu le testes. Tu es toujours là pour les améliorations, les nouveaux fournisseurs, les nouvelles fonctionnalités. Tu ne fais pas la saisie quotidienne — tu construis ce qui permet à Chantal de le faire seule.

### Chantal (l'utilisatrice quotidienne)
Elle crée les savons. Elle utilise l'admin au quotidien — enregistrer une vente, voir son stock, consulter ce qu'elle peut fabriquer. Elle a un inventaire, elle commence à vendre aux proches et amis des amis. Elle commence à paniquer car la gestion se complique. **L'interface doit être assez claire pour qu'elle puisse l'utiliser seule, sans t'appeler.**

---

## CE QUE LE SITE DOIT FAIRE

### Site public
Vitrine pour que les gens découvrent les produits et contactent Chantal. Catalogue, collections, informations, formulaire de contact.

### Outil de gestion (admin)
Un outil de **décision**, pas juste de saisie. Il doit pouvoir dire :
- "Il serait temps d'acheter tel ingrédient — tu viens d'utiliser les derniers"
- "Tu n'as pas assez de stock pour faire cette recette"
- "Ce savon utilise une huile dispendieuse avec une durée de vie de 6 mois — tu en as vendu 2 en un an. Est-ce qu'on garde cette recette?"
- "3 savons et une huile à barbe, ça fait 30$"

---

## LA CHAÎNE COMPLÈTE — DU POINT 0 AU POINT 1000

### 1. L'ingrédient
Un ingrédient existe avant d'être acheté — il vient du catalogue d'un fournisseur (Pure Arôme, Les Mauvaises Herbes, Arbressence, Divine Essence, Amazon). Il a un nom fournisseur et un nom UC (Univers Caresse). Il a un code INCI légal obligatoire pour tout produit public.

**Questions ouvertes :**
- Comment décide-t-on qu'un nouvel ingrédient entre dans le système? Via une recette que Chantal veut développer? Via un achat?
- Qui valide le code INCI? Toi, avec les données des scrapers?

### 2. L'achat
Une facture entre dans le système. Elle contient des items. Chaque item = un ingrédient acheté, un format, un prix. L'achat met à jour le stock et calcule le prix au gramme réel (avec taxes, livraison).

**Ce qui doit fonctionner :**
- Saisie facture rapide
- Import PDF pour Pure Arôme (livré en V1, à reprendre proprement)
- Calcul automatique $/g brut et réel
- Mise à jour automatique de l'inventaire

### 3. La recette
Une recette = une collection, une ligne, des ingrédients avec quantités, un surgraissage, un nombre d'unités, une cure. Elle a un statut : test, public, archive.

**Règle légale critique :** une recette ne peut pas passer au statut public tant que tous ses ingrédients n'ont pas un code INCI valide.

**Ce que le système doit calculer :**
- Coût en ingrédients par recette
- Est-ce que j'ai assez de stock pour la fabriquer?
- Si l'ingrédient X est dispendieux et que la recette se vend peu — alerte

### 4. La fabrication
Un lot = une recette × un multiplicateur, à une date donnée. Les ingrédients sortent du stock. Les savons entrent dans l'inventaire produits. Le lot a une date de disponibilité (date fabrication + cure).

**Statuts d'un lot :**
- En cure — fabriqué mais pas encore prêt
- Disponible — prêt à vendre, stock > 0
- Épuisé — plus aucune unité

### 5. La vente
Un savon sort de l'inventaire. De l'argent rentre. C'est là qu'on peut mesurer ce qui se vend vraiment — et donc décider si une recette vaut la peine d'être gardée.

**À construire en V2 — pas encore fait.**

### 6. La décision
Avec les données complètes — achats, stock, fabrication, ventes — le système peut aider à décider :
- Rentabilité par recette
- Rotation des ingrédients (durée de vie vs utilisation)
- Quoi racheter et quand
- Quoi archiver

---

## POURQUOI LE V1 N'EST PLUS VIABLE

Le V1 n'est pas à bout — c'est celui qui le développe qui est à bout de se battre pour des choses qui devraient être évidentes. Chaque modification qui devrait prendre 5 minutes devient une bataille.

- **Modifier une ligne de produit rend les recettes orphelines** — les recettes perdent leur lien avec la collection/ligne parce que la relation est par texte, pas par ID
- Relations par texte au lieu d'IDs stables — renommer = propager dans 5 endroits
- CSS par patches — accordéon écrit 3 fois différemment, font-size codés en dur partout
- Sheets mal normalisées — Collections mélange collections et lignes dans la même sheet, Recettes répète toutes les infos de la recette pour chaque ingrédient (576 lignes pour ~75 recettes)
- Achats et inventaire vides — le module existe mais la structure est trop fragile pour être utilisée
- Chaque conversation Claude repart de zéro — pas de contexte, patches par-dessus patches
- Les ventes ne peuvent pas démarrer car le stock produits ne fonctionne pas

---

## DÉCISIONS PRISES POUR LE V2

### Données
- IDs stables partout — COL-001, REC-001, ING-001, etc. — jamais de relation par texte
- Collections et Lignes dans deux sheets séparées
- Recettes_Ingredients = une sheet séparée (une ligne par ingrédient par recette)
- Un seul point d'entrée pour les ingrédients — l'achat
- Migration en parallèle — sheets V2 avec suffixe jusqu'à validation

### Fichiers
- Même repo GitHub, fichiers avec suffixe 2 (index2.html, style2.css, etc.)
- Bascule = renommer les fichiers quand V2 est validé
- Le V1 reste en production pendant la construction

### CSS
- Un seul système — un accordéon, une définition, partout pareil
- Toutes les valeurs dans le root — jamais de font-size codé en dur
- Public et admin partagent les mêmes composants de base

### Code
- Une fonction par action dans code.gs
- Une connexion centrale getSS() — pas de SpreadsheetApp.openById() répété partout
- doGet et doPost = routing seulement, pas de logique métier dedans

---

## PRINCIPES DE TRAVAIL — POUR CHAQUE CONVERSATION

1. **Lire ce carnet avant de coder quoi que ce soit**
2. **Analyser l'impact global d'un changement avant de le proposer**
3. **Un seul changement à la fois — attendre la confirmation**
4. **Ne pas dire ce qu'on veut entendre — poser les vraies questions**
5. **Proposer des alternatives quand une solution semble fragile**
6. **Livraison ciblée — trouve/remplace — jamais le fichier complet sans permission**
7. **Jamais de style inline dans le HTML ou le JS**
8. **Jamais créer une classe CSS ou une fonction si une existante peut servir**

---

## CE QUI RESTE À DÉCIDER

- [ ] Comment entre un nouvel ingrédient dans le système — via recette ou via achat?
- [ ] Qui valide les codes INCI et comment?
- [ ] Structure exacte du module de ventes
- [ ] Alertes stock — quels seuils, qui les définit?
- [ ] Est-ce que Chantal aura accès à l'admin seule un jour, ou toujours avec toi?
- [ ] Domaine universcaresse.ca — quand?

---

## QUESTIONS OUVERTES À BONIFIER

Ce carnet est vivant. Chaque session l'enrichit. On n'efface jamais — on ajoute et on corrige à côté.

---

*Univers Caresse — Document confidentiel — V2 — Démarré le 3 avril 2026*

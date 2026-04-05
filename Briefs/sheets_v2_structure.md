# SHEETS V2 — STRUCTURE COMPLÈTE
### Spreadsheet ID : 16Syw5XypiHauOMpuAu-bWfIMMnMObn9avqoSEYjaNu0

---

## Structure de présentation

**Collections_v2**
COL-id, rang, nom, slogan, description, couleur_hex, photo_url, photo_noel_url

**Gammes_v2**
GAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url

**Familles_v2**
FAM-id, COL-id, rang, nom, description, couleur_hex, photo_url, photo_noel_url

---

## Produits

**Produits_v2**
PRO-id, COL-id, GAM-id, FAM-id, nom, description, desc_emballage, couleur_hex, surgras, nb_unites, cure, instructions, notes, image_url, image_noel_url, statut, collections_secondaires

**Produits_Ingredients_v2**
PRO-id, ING-id, nom_ingredient, quantite_g

**Produits_Formats_v2**
PRO-id, poids, unite, prix_vente, EMB-id

**Emballages_v2**
EMB-id, nom, type

---

## Médias

**Mediatheque_v2**
url, nom, categorie, date_ajout

---

## Chaîne INCI

**Scraping_PA_v2**
**Scraping_MH_v2**
**Scraping_Arbressence_v2**
**Scraping_DE_v2**
Fournisseur, Nom, Catégorie, INCI, Nom_botanique, Partie_plante, Origine, Methode_production, Chemotype, Culture, Composantes_majoritaires, Point_eclair, Bio, Odeur, NPN, Marque, URL, Qualite, Statut, Date_scraping, Texte_brut

**Mapping_Fournisseurs_v2**
Fournisseur, Categorie_fournisseur, Nom_fournisseur, Categorie_UC, Nom_UC, ING-id

**Categories_UC_v2**
CAT-id, nom, date_ajout

**Ingredients_INCI_v2**
ING-id, CAT-id, nom_fournisseur, nom_UC, INCI, nom_botanique, source, note_olfactive, statut, date_ajout

---

## Configuration

**Config_v2**
type, densite, unite, marge_perte_pct

---

## Fournisseurs & Achats

**Fournisseurs_v2**
FOUR-id, code, nom, site_web, notes

**Formats_Ingredients_v2**
ING-id, contenant, quantite, unite

**Achats_Entete_v2**
ACH-id, date, FOUR-id, sous_total, tps, tvq, livraison, total, facteur_majoration, statut

**Achats_Lignes_v2**
ACH-id, ING-id, format_qte, format_unite, prix_unitaire, prix_par_g, prix_par_g_reel, quantite, prix_total, notes

---

## Stock

**Stock_Ingredients_v2**
ING-id, qte_g, prix_par_g_reel, date_derniere_maj

---

## Production

**Lots_v2**
LOT-id, PRO-id, multiplicateur, nb_unites, date_fabrication, date_disponibilite, cout_ingredients, cout_emballages, cout_revient_total, cout_par_unite, statut

---

## Ventes

**Ventes_Entete_v2**
VEN-id, date, client, total, statut

**Ventes_Lignes_v2**
VEN-id, PRO-id, LOT-id, quantite, prix_unitaire, prix_total

---

## Config site

**Contenu_v2**
cle, valeur

---

*Univers Caresse — Structure sheets V2 — 2026-04-04 15h45*

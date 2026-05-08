# BRIEF — RETIRER LES LOCKSERVICE

## Contexte

Des verrous `LockService` ont été ajoutés partout dans Apps Script (`code.gs`) pour empêcher les conflits quand deux personnes utilisaient l'admin en même temps. Quand seule la fondatrice utilisera l'app, ces verrous ne sont plus nécessaires et ralentissent inutilement le système.

## Objectif

Retirer le `LockService` de toutes les fonctions backend pour retrouver la vitesse maximale, **sans toucher** à la logique de protection (sauvegarde des anciennes lignes, restauration en cas d'erreur).

---

## Fonctions à modifier dans `code.gs`

1. `saveProduit_v2`
2. `saveFormatsEmballages_v2`
3. `addAchatLigne_v2`
4. `finaliserAchat_v2`
5. `deleteAchat_v2`
6. `createVente_v2`
7. `addVenteLigne_v2`
8. `finaliserVente_v2`
9. `saveLot_v2`

---

## Pour chaque fonction, retirer 3 choses

### 1. Au début de la fonction

**Retirer ce bloc :**

```js
const lock = LockService.getScriptLock();
try {
  lock.waitLock(10000);
} catch (errLock) {
  return { success: false, message: 'Système occupé, réessayez dans quelques secondes.' };
}
try {
```

**Garder seulement `try {`** à la place.

---

### 2. Dans les retours d'erreur précoces

**Retirer `lock.releaseLock();` :**

```js
if (!produitsSheet) { lock.releaseLock(); return { success: false, message: 'Produits_v2 introuvable' }; }
```

**Devient :**

```js
if (!produitsSheet) return { success: false, message: 'Produits_v2 introuvable' };
```

---

### 3. À la fin de la fonction

**Avant les `return` finaux et dans les `catch`, retirer `lock.releaseLock();` :**

Avant :

```js
lock.releaseLock();
return { success: true };
```

Devient :

```js
return { success: true };
```

Avant :

```js
} catch(e) {
  lock.releaseLock();
  return { success: false, message: e.message };
}
```

Devient :

```js
} catch(e) {
  return { success: false, message: e.message };
}
```

---

## Important

- Garder **toute** la logique de protection en cas d'erreur (sauvegarde des anciennes lignes, restauration).
- Seuls les verrous `LockService` sont à retirer.
- Procéder fonction par fonction, une à la fois.
- Tester après chaque modification.

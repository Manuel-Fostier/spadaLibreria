# Guide de recherche avec expressions régulières (Regex)

Ce guide explique comment utiliser les expressions régulières (regex) dans la fonction de recherche de Spada Libreria pour effectuer des recherches avancées dans les traités d'escrime.

## Activation du mode regex

Pour activer la recherche par expressions régulières, cochez l'option **"Regex"** dans la barre de recherche.

## Exemples pratiques

### 1. Recherche de variantes orthographiques

#### Problème
Vous souhaitez trouver à la fois "coda lunga" et "coda longa" (variantes orthographiques historiques).

#### Solutions

**a) Utiliser une classe de caractères `[ou]`**
```
coda l[ou]nga
```
- `[ou]` correspond à **un seul** caractère parmi "o" ou "u"
- Trouvera : "coda **lo**nga" et "coda **lu**nga"

**b) Utiliser l'alternation avec `|`**
```
coda (lunga|longa)
```
- `|` signifie "OU" logique
- `()` groupe les alternatives
- Trouvera : "coda lunga" et "coda longa"

Ou plus simplement :
```
l(u|o)nga
```
- Trouvera : "**lu**nga" et "**lo**nga"

### 2. Recherche avec caractères variables

#### Trouver n'importe quel caractère entre deux mots
```
coda.*lunga
```
- `.` correspond à n'importe quel caractère
- `*` signifie "zéro ou plusieurs fois"
- Trouvera : "coda lunga", "coda  lunga" (avec espace double), "coda e lunga", etc.

#### Trouver exactement un espace
```
coda\slunga
```
- `\s` correspond à un espace blanc (espace, tabulation, etc.)
- Trouvera uniquement : "coda lunga" (avec un seul espace)

### 3. Recherche de pluriels et singuliers

#### Trouver "mandritto" et "mandritti"
```
mandritt[oi]
```
- `[oi]` correspond à un caractère parmi "o" ou "i"
- Trouvera : "mandritt**o**" et "mandritt**i**"

#### Trouver "spada", "spade", "spadone"
```
spad(a|e|one)
```
Ou avec une classe de caractères pour les deux premières :
```
spad[ae]|spadone
```

### 4. Recherche insensible à la casse

Par défaut, la recherche regex respecte la casse si l'option **"Match Case"** est activée.

**Sans "Match Case"** :
```
CODA
```
Trouvera : "coda", "Coda", "CODA"

**Avec "Match Case"** :
```
CODA
```
Trouvera uniquement : "CODA"

### 5. Recherche de mots entiers

#### Utiliser les limites de mots `\b`
```
\bcoda\b
```
- `\b` marque une limite de mot (début ou fin)
- Trouvera : "la **coda** lunga"
- Ne trouvera PAS : "la **coda**lunga" (mot collé)

Ou utilisez simplement l'option **"Match Whole Word"** de l'interface.

### 6. Recherches complexes

#### Trouver "guardia" suivi d'un mot quelconque puis "alta" ou "bassa"
```
guardia\s+\w+\s+(alta|bassa)
```
- `\s+` : un ou plusieurs espaces
- `\w+` : un ou plusieurs caractères de mot
- Trouvera : "guardia di **alta**", "guardia porta **bassa**"

#### Trouver tous les coups se terminant par "ente"
```
\w+ente\b
```
- Trouvera : "fend**ente**", "rev**ente**", etc.

## Caractères spéciaux à connaître

| Symbole | Signification | Exemple | Trouve |
|---------|---------------|---------|--------|
| `.` | N'importe quel caractère | `c.da` | "coda", "cada", "c9da" |
| `*` | 0 ou plusieurs fois | `co*da` | "cda", "coda", "cooda" |
| `+` | 1 ou plusieurs fois | `co+da` | "coda", "cooda" (pas "cda") |
| `?` | 0 ou 1 fois | `colou?r` | "color", "colour" |
| `[abc]` | Un caractère parmi a, b, ou c | `[aeiou]` | n'importe quelle voyelle |
| `[a-z]` | Un caractère dans la plage | `[a-z]` | n'importe quelle lettre minuscule |
| `[^abc]` | Tout sauf a, b, ou c | `[^aeiou]` | n'importe quelle consonne |
| `|` | OU logique | `chat|chien` | "chat" ou "chien" |
| `()` | Groupe | `(ab)+` | "ab", "abab", "ababab" |
| `\b` | Limite de mot | `\bword\b` | "word" (mot entier) |
| `\s` | Espace blanc | `\s+` | un ou plusieurs espaces |
| `\w` | Caractère de mot | `\w+` | une séquence de lettres/chiffres |
| `\d` | Chiffre | `\d+` | un ou plusieurs chiffres |
| `^` | Début de ligne | `^Capitolo` | "Capitolo" en début de ligne |
| `$` | Fin de ligne | `fine$` | "fine" en fin de ligne |

## Échappement des caractères spéciaux

Si vous voulez rechercher un caractère spécial littéralement, utilisez `\` devant :

| Recherche | Regex | Trouve |
|-----------|-------|--------|
| Point littéral | `\.` | "." |
| Parenthèse | `\(` ou `\)` | "(" ou ")" |
| Astérisque | `\*` | "*" |
| Plus | `\+` | "+" |
| Question | `\?` | "?" |
| Barre verticale | `\|` | "|" |
| Backslash | `\\` | "\" |

Exemple : pour trouver "3.5" littéralement :
```
3\.5
```

## Cas d'usage réels pour l'escrime bolonaise

### Rechercher toutes les gardes "Coda"
```
\bcoda\s+(lunga|longa|alta|bassa)\b
```
Trouvera : "coda lunga", "coda longa", "coda alta", "coda bassa"

### Rechercher toutes les variations de "mandritto"
```
mandritt[oi]
```
- Trouvera : "mandritto" et "mandritti"

Ou avec alternation :
```
mandritto|mandritti
```

### Rechercher les frappes à la tête
```
(colpisce|colpire|colpo).*test[ae]
```
Trouvera des phrases comme : "colpisce la testa", "colpo alla testa"

### Rechercher les techniques avec "stringere"
```
\bstring(ere|i|e|ono)\b
```
Trouvera : "stringere", "stringi", "stringe", "stringono" (différentes conjugaisons)

## Conseils et bonnes pratiques

1. **Commencez simple** : Testez d'abord avec une recherche simple avant d'ajouter des patterns complexes.

2. **Utilisez les options de recherche** : Combinez le regex avec les options "Match Case" et "Match Whole Word" pour affiner vos résultats.

3. **Testez progressivement** : Ajoutez des éléments regex un par un pour comprendre ce qui fonctionne.

4. **Attention aux performances** : Les regex très complexes (surtout avec `.*`) peuvent être lentes sur de gros textes.

5. **Échappez les caractères spéciaux** : N'oubliez pas d'échapper les caractères spéciaux si vous voulez les rechercher littéralement.

## Exemples de recherches avancées

### Trouver tous les chapitres mentionnant deux gardes spécifiques
```
(coda lunga|porta di ferro)
```

### Trouver les instructions de distance (largo, stretto, mezzo)
```
\b(largo|stretto|mezzo)\b
```

### Trouver toutes les mentions de coups avec leur direction
```
(mandritto|riverso|fendente|sgualembrato)\s+\w+
```

## Débogage d'expressions régulières

Si votre regex ne fonctionne pas comme prévu :

1. **Vérifiez les erreurs de syntaxe** : Les regex mal formées retournent 0 résultat (ex: `[invalid(regex`)

2. **Simplifiez** : Enlevez des parties de votre regex pour identifier ce qui ne fonctionne pas

3. **Testez avec des exemples simples** : Commencez par un mot simple puis ajoutez de la complexité

4. **Vérifiez les options** : Assurez-vous que "Regex" est bien activé et que "Match Case" est configuré correctement

## Ressources supplémentaires

Pour en savoir plus sur les expressions régulières :
- [MDN Web Docs - Regular Expressions](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Regex101](https://regex101.com/) - Testeur de regex en ligne (choisir "JavaScript" comme langage)
- [RegExr](https://regexr.com/) - Autre excellent testeur avec explications visuelles

## Note importante

Les expressions régulières utilisées dans Spada Libreria suivent la syntaxe JavaScript standard (ECMAScript). Certaines fonctionnalités avancées de regex (comme les lookbehind) peuvent ne pas être disponibles dans tous les navigateurs.

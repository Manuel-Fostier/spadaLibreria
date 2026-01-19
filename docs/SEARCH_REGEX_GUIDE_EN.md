# Regular Expression (Regex) Search Guide

This guide explains how to use regular expressions (regex) in Spada Libreria's search function to perform advanced searches in fencing treatises.

## Enabling Regex Mode

To enable regular expression search, check the **"Regex"** option in the search bar.

## Practical Examples

### 1. Searching for Spelling Variants

#### Problem
You want to find both "coda lunga" and "coda longa" (historical spelling variants).

#### Solutions

**a) Using a character class `[ou]`**
```
coda l[ou]nga
```
- `[ou]` matches **one** character, either "o" or "u"
- Will find: "coda **lo**nga" and "coda **lu**nga"

**b) Using alternation with `|`**
```
coda (lunga|longa)
```
- `|` means logical "OR"
- `()` groups the alternatives
- Will find: "coda lunga" and "coda longa"

Or more simply:
```
l(u|o)nga
```
- Will find: "**lu**nga" and "**lo**nga"

### 2. Searching with Variable Characters

#### Find any character between two words
```
coda.*lunga
```
- `.` matches any character
- `*` means "zero or more times"
- Will find: "coda lunga", "coda  lunga" (with double space), "coda e lunga", etc.

#### Find exactly one space
```
coda\slunga
```
- `\s` matches whitespace (space, tab, etc.)
- Will only find: "coda lunga" (with a single space)

### 3. Searching for Plurals and Singulars

#### Find "mandritto" and "mandritti"
```
mandritt[oi]
```
- `[oi]` matches one character, either "o" or "i"
- Will find: "mandritt**o**" and "mandritt**i**"

#### Find "spada", "spade", "spadone"
```
spad(a|e|one)
```
Or with a character class for the first two:
```
spad[ae]|spadone
```

### 4. Case-Insensitive Search

By default, regex search respects case if the **"Match Case"** option is enabled.

**Without "Match Case"**:
```
CODA
```
Will find: "coda", "Coda", "CODA"

**With "Match Case"**:
```
CODA
```
Will only find: "CODA"

### 5. Whole Word Search

#### Using word boundaries `\b`
```
\bcoda\b
```
- `\b` marks a word boundary (start or end)
- Will find: "la **coda** lunga"
- Will NOT find: "la **coda**lunga" (merged word)

Or simply use the **"Match Whole Word"** option in the interface.

### 6. Complex Searches

#### Find "guardia" followed by any word then "alta" or "bassa"
```
guardia\s+\w+\s+(alta|bassa)
```
- `\s+`: one or more spaces
- `\w+`: one or more word characters
- Will find: "guardia di **alta**", "guardia porta **bassa**"

#### Find all cuts ending with "ente"
```
\w+ente\b
```
- Will find: "fend**ente**", "rev**ente**", etc.

## Special Characters Reference

| Symbol | Meaning | Example | Matches |
|--------|---------|---------|---------|
| `.` | Any character | `c.da` | "coda", "cada", "c9da" |
| `*` | 0 or more times | `co*da` | "cda", "coda", "cooda" |
| `+` | 1 or more times | `co+da` | "coda", "cooda" (not "cda") |
| `?` | 0 or 1 time | `colou?r` | "color", "colour" |
| `[abc]` | One character among a, b, or c | `[aeiou]` | any vowel |
| `[a-z]` | One character in range | `[a-z]` | any lowercase letter |
| `[^abc]` | Anything except a, b, or c | `[^aeiou]` | any consonant |
| `|` | Logical OR | `cat|dog` | "cat" or "dog" |
| `()` | Group | `(ab)+` | "ab", "abab", "ababab" |
| `\b` | Word boundary | `\bword\b` | "word" (whole word) |
| `\s` | Whitespace | `\s+` | one or more spaces |
| `\w` | Word character | `\w+` | sequence of letters/digits |
| `\d` | Digit | `\d+` | one or more digits |
| `^` | Start of line | `^Chapter` | "Chapter" at line start |
| `$` | End of line | `end$` | "end" at line end |

## Escaping Special Characters

To search for a special character literally, use `\` before it:

| Search | Regex | Matches |
|--------|-------|---------|
| Literal period | `\.` | "." |
| Parenthesis | `\(` or `\)` | "(" or ")" |
| Asterisk | `\*` | "*" |
| Plus | `\+` | "+" |
| Question mark | `\?` | "?" |
| Pipe | `\|` | "|" |
| Backslash | `\\` | "\" |

Example: to find "3.5" literally:
```
3\.5
```

## Real Use Cases for Bolognese Fencing

### Search for all "Coda" guards
```
\bcoda\s+(lunga|longa|alta|bassa)\b
```
Will find: "coda lunga", "coda longa", "coda alta", "coda bassa"

### Search for all variations of "mandritto"
```
mandritt[oi]
```
- Will find: "mandritto" and "mandritti"

Or with alternation:
```
mandritto|mandritti
```

### Search for strikes to the head
```
(colpisce|colpire|colpo).*test[ae]
```
Will find phrases like: "colpisce la testa", "colpo alla testa"

### Search for techniques with "stringere"
```
\bstring(ere|i|e|ono)\b
```
Will find: "stringere", "stringi", "stringe", "stringono" (different conjugations)

## Tips and Best Practices

1. **Start simple**: Test with a simple search before adding complex patterns.

2. **Use search options**: Combine regex with "Match Case" and "Match Whole Word" options to refine results.

3. **Test incrementally**: Add regex elements one at a time to understand what works.

4. **Performance awareness**: Very complex regex (especially with `.*`) can be slow on large texts.

5. **Escape special characters**: Don't forget to escape special characters if you want to search for them literally.

## Advanced Search Examples

### Find all chapters mentioning two specific guards
```
(coda lunga|porta di ferro)
```

### Find distance instructions (largo, stretto, mezzo)
```
\b(largo|stretto|mezzo)\b
```

### Find all mentions of cuts with their direction
```
(mandritto|riverso|fendente|sgualembrato)\s+\w+
```

## Debugging Regular Expressions

If your regex doesn't work as expected:

1. **Check syntax errors**: Malformed regex return 0 results (e.g., `[invalid(regex`)

2. **Simplify**: Remove parts of your regex to identify what's not working

3. **Test with simple examples**: Start with a simple word then add complexity

4. **Check options**: Ensure "Regex" is enabled and "Match Case" is configured correctly

## Additional Resources

To learn more about regular expressions:
- [MDN Web Docs - Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Regex101](https://regex101.com/) - Online regex tester (choose "JavaScript" as language)
- [RegExr](https://regexr.com/) - Another excellent tester with visual explanations

## Important Note

Regular expressions used in Spada Libreria follow standard JavaScript syntax (ECMAScript). Some advanced regex features (like lookbehind) may not be available in all browsers.

# Plan: Expandable Search Bar

## Objectif

Faire en sorte que la barre de recherche s'étende vers le bas lorsqu'il y a trop de caractères à afficher, avec un comportement similaire à la barre de recherche de VS Code.

## Comportement souhaité

- **Multiline**: Le champ de recherche doit pouvoir contenir plusieurs lignes
- **Expansion automatique**: Le champ grandit vers le bas au fur et à mesure de la saisie
- **Max-height**: Limité à 7 lignes, puis scrolling
- **Icône loupe cachée au focus**: Quand le champ est sélectionné/actif, l'icône de loupe disparaît pour maximiser l'espace visible
- **Contrôles en haut à droite (Option A)**: Les boutons (clear, match case, whole word, regex) restent ancrés en haut à droite même quand le champ grandit
- **Recherche en temps réel**: La recherche se déclenche automatiquement à chaque ajout ou suppression de caractère (comme VS Code)

## État actuel

D'après l'analyse:

- Le champ de recherche est un `<input>` single-line dans [spadalibreria/src/components/SearchBar.tsx](../../spadalibreria/src/components/SearchBar.tsx)
- L'icône de loupe (Search) est positionnée en absolu à gauche (`left-3`, `pointer-events-none`)
- Les contrôles (clear + 3 toggles) sont positionnés en absolu à droite (`right-2`)
- Le champ utilise `pl-10` (padding-left) et `pr-36` (padding-right) pour réserver l'espace pour les icônes/boutons
- Pas de gestion de focus pour cacher/montrer l'icône actuellement
- Pas de comportement multiline

## Étapes d'implémentation (TDD)

### 1. Écrire les tests

Dans [spadalibreria/src/components/__tests__/SearchBar.test.tsx](../../spadalibreria/src/components/__tests__/SearchBar.test.tsx) (à créer):

Écrire les tests suivants AVANT l'implémentation:

1. **Expansion automatique**: Le textarea grandit automatiquement quand on tape du texte sur plusieurs lignes
2. **Max-height respecté**: Après 7 lignes, le textarea arrête de grandir et affiche une scrollbar verticale
3. **Icône loupe cachée au focus**: Quand le champ est sélectionné (focus), l'icône de loupe disparaît
4. **Icône loupe visible hors focus**: Quand le champ perd le focus (blur), l'icône de loupe réapparaît
5. **Contrôles en haut à droite**: Les boutons (clear, match case, whole word, regex) restent ancrés en haut à droite même quand le textarea grandit
6. **Recherche automatique**: La recherche se déclenche automatiquement à chaque modification du texte (ajout/suppression de caractère)
7. **Comportement Enter**: Presser Enter déclenche la recherche (pas de saut de ligne)
8. **Comportement Shift+Enter**: Pressert Shift+Enter ajoute un saut de ligne dans le textarea
9. **Comportement Escape**: Presser Escape efface le contenu du champ
10. **TagFilter visible**: Le composant TagFilter en dessous de la barre de recherche reste visible et fonctionnel
11. **Pas de chevauchement**: Le texte du textarea ne chevauche pas les boutons à droite
12. **Responsive**: Le comportement est correct même quand la sidebar est redimensionnée

### 2. Remplacer l'input par un textarea auto-grow

Dans [spadalibreria/src/components/SearchBar.tsx](../../spadalibreria/src/components/SearchBar.tsx):

- Remplacer l'`<input>` par un `<textarea>` avec resize automatique
- Ajouter les styles Tailwind pour:
  - `resize-none` (pas de resize manuel)
  - `overflow-y-auto` (scroll si dépassement)
  - `min-h-[2.5rem]` (hauteur minimale d'1 ligne, équivalent au py-2 actuel)
  - `max-h-[10.5rem]` (hauteur max pour 7 lignes, à ajuster selon line-height)
- Conserver `font-mono`, `pl-10`, `pr-36` pour les espacements
- Implémenter l'auto-grow via JavaScript (ajuster height basé sur scrollHeight)

### 3. Gérer le focus pour cacher la loupe

Dans [spadalibreria/src/components/SearchBar.tsx](../../spadalibreria/src/components/SearchBar.tsx):

- Ajouter un état local `isFocused` avec `useState`
- Ajouter les handlers `onFocus` et `onBlur` sur le textarea
- Conditionner l'affichage de l'icône Search: `{!isFocused && <Search ... />}`
- Ajuster éventuellement le `pl-*` du textarea quand la loupe est cachée (passer de `pl-10` à `pl-3`) pour récupérer de l'espace

### 4. Ajuster l'alignement des contrôles

Dans [spadalibreria/src/components/SearchBar.tsx](../../spadalibreria/src/components/SearchBar.tsx):

- S'assurer que le conteneur parent a `items-start` au lieu de `items-center` pour que les contrôles restent en haut
- Garder le conteneur de contrôles en `absolute right-2` mais ajouter `top-2` pour l'ancrer en haut
- Vérifier que le padding-right du textarea (`pr-36`) est suffisant pour éviter le chevauchement du texte avec les boutons

### 5. Implémenter la recherche en temps réel

Dans [spadalibreria/src/components/SearchBar.tsx](../../spadalibreria/src/components/SearchBar.tsx):

- Ajouter un handler `onChange` sur le textarea qui déclenche la recherche à chaque modification
- Considérer l'ajout d'un debounce (délai court, ~150-300ms) pour éviter de déclencher trop de recherches lors de la saisie rapide
- Modifier le handler `onKeyDown`:
  - Pour `Enter`: déclencher la recherche (comportement actuel)
  - Pour `Escape`: effacer le champ (comportement actuel)  

## Contraintes techniques

- Framework: Next.js 15 avec App Router
- Styling: Tailwind CSS uniquement
- État de recherche géré par [spadalibreria/src/contexts/SearchContext.tsx](../../spadalibreria/src/contexts/SearchContext.tsx)
- Le SearchBar est utilisé dans [spadalibreria/src/components/BolognesePlatform.tsx](../../spadalibreria/src/components/BolognesePlatform.tsx) dans la sidebar
- Pas de contrainte de hauteur depuis le parent, le contenu de la sidebar scroll indépendamment

## Considérations

1. **Line-height**: Calculer le max-height pour 7 lignes en tenant compte du line-height effectif du `font-mono`
2. **Smooth transition**: Possibilité d'ajouter une transition CSS sur la hauteur pour un effet plus fluide
3. **Accessibilité**: S'assurer que le textarea reste accessible (labels, aria-attributes si nécessaire)
4. **Performance**: L'auto-grow via scrollHeight est performant, pas de problème attendu

## Fichiers à modifier

- [spadalibreria/src/components/SearchBar.tsx](../../spadalibreria/src/components/SearchBar.tsx) - Composant principal

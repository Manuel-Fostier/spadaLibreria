# SearchResults Component Mockup

**Spec Reference**: FR-004, FR-005, FR-017 (Results, highlighting, language badges)  
**User Story**: US1 - Cross-Treatise Search with Variants  
**Task**: T022 [US1]  
**File**: `src/components/SearchResults.tsx`

## Overview

The SearchResults component displays search results grouped by treatise and chapter, with highlighted search terms, language badges, and annotation indicators. Results support pagination and filtering.

## Wireframe ASCII

```
╔════════════════════════════════════════════════════════════════════════╗
║                         SEARCH RESULTS                                ║
║                                                                        ║
║  📊 Found 23 results for: mandritto, mandritti, coup droit (en: 6)   ║
║  [Filter by tags ▼]  [Show annotated only] [List] [Grid]             ║
║                                                                        ║
║  ┌──────────────────────────────────────────────────────────────────┐ ║
║  │ 1. Marozzo Opera Nova (1536), Book 1, Chapter 3                 │ ║
║  │    Weapon: Spada Brocchiero  |  [IT] [FR] [EN]  |  🏷 beginner  │ ║
║  │                                                                  │ ║
║  │    "...la guardia di coda longa et l'attacca con un **mandritto│ ║
║  │    (forehand cut) in testa**, e se l'inimico parassa con una..." │ ║
║  │                                                                  │ ║
║  │    🔸 Weapons: spada, brocchiero  |  🔸 3 annotations          │ ║
║  └──────────────────────────────────────────────────────────────────┘ ║
║                                                                        ║
║  ┌──────────────────────────────────────────────────────────────────┐ ║
║  │ 2. Marozzo Opera Nova (1536), Book 2, Chapter 5                 │ ║
║  │    Weapon: Spada Sola  |  [IT] [FR] [EN]  |  🏷 advanced        │ ║
║  │                                                                  │ ║
║  │    "...dopo il **mandritti** (multiple strokes) cala il corpo..." │ ║
║  │                                                                  │ ║
║  │    🔹 Techniques: attacco, cambio  |  🔹 1 annotation           │ ║
║  └──────────────────────────────────────────────────────────────────┘ ║
║                                                                        ║
║  ┌──────────────────────────────────────────────────────────────────┐ ║
║  │ 3. Manciolino Opera Nova, Chapter 7                             │ ║
║  │    Weapon: Spada Destra  |  [IT] [FR]  |  🏷 solo practice      │ ║
║  │                                                                  │ ║
║  │    "...dans la tradition lombarde, le **coup droit** (mandritto)│ ║
║  │    execute la frappe directe vers la tête..." │ [More]          │ ║
║  │                                                                  │ ║
║  │    🟢 Guards: coda_longa, posta_di_donna  |  🟢 0 annotations  │ ║
║  └──────────────────────────────────────────────────────────────────┘ ║
║                                                                        ║
║  [Previous] Page 1 of 3  [Next]                                      ║
║  📄 Showing 3 of 23 results (3 per page)                             ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```

## Result Item Details

### Anatomy of Single Result

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. [Treatise Name], [Book], [Chapter]                               │
│    Language: [Weapon] | [IT] [FR] [EN] | Tags: 🏷 Tag1 🏷 Tag2    │
│                                                                     │
│    "...context before...  **highlighted search term**  ...context  │
│     after..." [Read more ►]                                         │
│                                                                     │
│    🔸 Weapons: weapon1, weapon2  |  🔸 3 annotations  [View]      │
└─────────────────────────────────────────────────────────────────────┘
```

### Components

1. **Header**
   - Result number and chapter reference
   - Treatise name, book, chapter number
   - Link to open full chapter

2. **Metadata Row**
   - Primary weapon for this chapter
   - Language badges: [IT] [FR] [EN] (shows which versions have match)
   - User tags (beginner, advanced, solo practice, etc.)

3. **Preview Text**
   - Context-aware excerpt (100-200 characters)
   - **Highlighted search terms** (bold, yellow background)
   - Multiple matches shown if several terms present
   - [Read more ►] link to open full chapter

4. **Annotation Indicators**
   - Colored circles for annotation type:
     - 🔸 Weapons (blue)
     - 🔹 Techniques (orange)
     - 🟢 Guards (green)
   - Annotation count
   - [View] link to see annotations

---

## Result States

### 1. Empty Results

```
╔════════════════════════════════════════════════════════════╗
║                   NO RESULTS FOUND                         ║
║                                                             ║
║  🔍 Your search for "xyz123" didn't match any chapters    ║
║                                                             ║
║  Did you mean:                                             ║
║  • "mandritto" (26 results)                                ║
║  • "mandritti" (18 results)                                ║
║  • "attaco" → "attacco" (15 results)                       ║
║                                                             ║
║  Or try:                                                   ║
║  [Browse by weapon] [Browse by technique] [View glossary]  ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**Behavior**:
- Show helpful suggestions from glossary
- Offer similar terms
- Link to alternative browsing methods

---

### 2. Single Result

```
┌────────────────────────────────────────────────────────┐
│ 1. Marozzo Opera Nova (1536), Book 1, Chapter 3        │
│    [Spada Brocchiero] | [IT] [FR] [EN] | 🏷 beginner   │
│                                                        │
│    "...guardia di coda longa et l'attacca con un       │
│    **mandritto** in testa, e se l'inimico parassa..." │
│                                                        │
│    🔸 Weapons: spada, brocchiero  |  🔸 3 annotations  │
└────────────────────────────────────────────────────────┘

Found 1 result
```

---

### 3. Paginated Results

```
Header: Found 23 results
[First page]     [Second page]     [Third page]
(3 results)      (3 results)       (2 results)

[◄ Previous] Page 1 of 3  [Next ►]
Showing results 1-3 of 23 (10 per page)

Pagination with dropdown:
[◄ Previous] [1 ▼] [Next ►]
              ├─ Page 1
              ├─ Page 2
              └─ Page 3
```

---

### 4. Filtered Results

```
Found 23 results for: mandritto

Filters:
[✓ Weapons: Spada]  [✓ Tag: beginner]  [× Clear filters]

Results showing: 8 of 23
(Filtered from 23 to 8 using selected filters)

Results:
1. Marozzo Book 1, Ch 3 - Spada Brocchiero - 🏷 beginner
2. Manciolino Ch 7 - Spada Sola - 🏷 beginner
...
```

---

## Highlighting Details (FR-005)

### Multiple Highlighting Styles

```
Text with single term highlighted:
"...attacca con un **mandritto** in testa..."

Text with multiple terms highlighted:
"...il **mandritti** in **spada** davanti al **corpo**..."

Text with cross-language terms:
"...c'est un **coup droit** (mandritto)..."
(Both shown highlighted in different colors)
```

### Highlight Colors

```css
.highlight-primary {
  background-color: #fbbf24;  /* Amber - primary search term */
  color: black;
  font-weight: 600;
}

.highlight-variant {
  background-color: #fdba74;  /* Orange - variant form */
  color: black;
  font-weight: 500;
}

.highlight-crosslang {
  background-color: #a78bfa;  /* Purple - cross-language equivalent */
  color: white;
  font-weight: 500;
}
```

---

## Language Badge Meanings (FR-017)

```
[IT] = Italian version available AND contains match
[FR] = French version available AND contains match
[EN] = English version available AND contains match

Complete row means:
"This chapter exists in all 3 languages and all contain your search term"

Partial badges mean:
"Only these languages contain the search term"

Example:
[IT] [FR] = Term found in Italian and French, but NOT in English
```

---

## Sorting & Filtering UI

```
╔────────────────────────────────────────────────╗
║  Sort: [Relevance ▼] | [Date ▼] | [A-Z ▼]    ║
║                                                ║
║  Filter:                                       ║
║  Weapons: [All ▼]    [x] Spada    [x] Pugnale ║
║  Tags: [All ▼]       [x] Beginner  [x] Dueling║
║                                                ║
║  [Show all chapters] [Show annotated only]     ║
║  [Clear all filters]                           ║
║                                                ║
╚────────────────────────────────────────────────╝
```

**Default Sort**: Relevance (chapters with more matches appear first)

---

## Annotation Indicators Details

### Color Legend for Annotation Metadata

```
🔸 Blue circle = Weapons
   "spada, brocchiero" (from annotation.weapons field)
   [3 annotations] [View] link

🔹 Orange circle = Techniques  
   "attacco, cambio" (from annotation.techniques field)
   [1 annotation] [View] link

🟢 Green circle = Guards mentioned
   "coda longa, posta di donna" (from annotation.guards_mentioned field)
   [2 annotations] [View] link

🟡 Yellow circle = Measures/distance
   "passata, balestra" (from annotation.measures field)
   [1 annotation] [View] link

⚫ Gray circle = Notes/Strategy
   User notes (from annotation.note field)
   [View] to read full note
```

---

## Interaction Flows

### User Flow 1: View Result Details

```
1. User sees search result
2. Clicks result → Opens BolognesePlatform with chapter loaded
3. Chapter text appears with search terms highlighted
4. Annotation panel opens (default per FR-012)
5. User can scroll, read, and manage annotations
```

### User Flow 2: Filter Results

```
1. SearchResults shows 23 results for "mandritto"
2. User clicks "Filter by tags" button
3. Opens dropdown with annotation filters:
   - Weapons: [Spada] [Brocchiero] [Pugnale]
   - Techniques: [Attacco] [Parry] [Counter]
4. User selects [Spada] and [Beginner]
5. Results filter to 8 matching items
6. User can clear filters with [×]
```

### User Flow 3: Show Annotated Only

```
1. User has added annotations to some chapters
2. Clicks [Show annotated only] toggle
3. Results filter to only chapters with any annotations
4. Useful for reviewing annotated techniques
```

---

## Technical Notes for Implementation

### Props

```typescript
interface SearchResultsProps {
  searchTerms: SearchQuery[];
  results: SearchResult[];
  isLoading?: boolean;
  onResultClick?: (chapter: ChapterReference) => void;
  onViewAnnotations?: (chapter: ChapterReference) => void;
  showAnnotatedOnly?: boolean;
  filters?: TagFilter[];
  sortBy?: 'relevance' | 'date' | 'alphabetical';
  itemsPerPage?: number;  // Default: 3
}
```

### Highlighting Implementation

```typescript
// Use highlighter utility from T017
import { highlightMatches } from '@/lib/highlighter';

const highlightedText = highlightMatches(
  chapterText,
  searchTerms,
  variantTerms,  // Include variant forms in highlighting
  crossLanguageTerms  // Include translated forms
);
```

### Pagination

```typescript
// Use SearchResult pagination from Phase 2
const { items, pageCount, currentPage, setCurrentPage } = usePagination(
  results,
  itemsPerPage
);
```

---

## Performance Considerations

- **Lazy load** result previews (don't render all 100+ items at once)
- **Virtualization** for long result lists (render only visible items)
- **Cache** highlight calculations
- **Debounce** filter changes
- Target: Filter 50+ results in <3 seconds (SC-005)

---

## Accessibility

- Semantic HTML: `<article>`, `<section>` for result structure
- ARIA labels for icon badges
- Keyboard navigation: Tab through results, Enter to open
- Screen reader: Announce "Found 23 results" on load
- Color contrast: All highlight colors meet WCAG AA standards

---

## Related Mockups

- SearchBar.md (T021) - Where user enters search terms
- AnnotationPanel.md (T003) - Opens when result clicked
- TagFilter.md - Filtering UI for annotation metadata

---

## Success Criteria (from spec.md)

✅ **FR-004**: Display search results grouped by treatise and chapter with preview text
✅ **FR-005**: Highlight search terms in displayed text
✅ **FR-017**: Indicate language versions with badges [IT] [FR] [EN]
✅ **SC-001**: Search across 3 treatises in <5 seconds
✅ **SC-005**: Filter 50+ results by tags in <3 seconds

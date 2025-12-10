# SearchBar Component Mockup

**Spec Reference**: FR-002a, SC-011 (Similar words suggestion)  
**User Story**: US1 - Cross-Treatise Search with Variants  
**Task**: T021 [US1]  
**File**: `src/components/SearchBar.tsx`

## Overview

The SearchBar component is the primary interface for searching treatises. It includes:
1. Text input field with placeholder
2. Similar words suggestion dropdown (500ms response time)
3. Selected search term chips with remove buttons

## Wireframe ASCII

```
╔═════════════════════════════════════════════════════════════╗
║  [Type search term...]                     [Enter] [×] ║
║                                                             ║
║  Similar words suggestions (auto-show, 500ms):              ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │ ✓ mandritto        mandritti        coup droit      │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                             ║
║  Selected terms (chips):                                    ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐                     ║
║  │ mandritto│ │ mandritti│ │ coup dr  │                     ║
║  │    [×]   │ │    [×]   │ │    [×]   │                     ║
║  └──────────┘ └──────────┘ └──────────┘                     ║
║                                                             ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

## Component States

### 1. Empty Search (Initial State)

```
╔════════════════════════════════════════════════════════════╗
║  [Type a word: e.g., "mandritto"]          [Clear (×)] ║
╚════════════════════════════════════════════════════════════╝
```

**Behavior**:
- Placeholder text shows example search term
- Input field focused (cursor blinking)
- No dropdown shown yet
- Clear button visible if any previous search

---

### 2. User Typing (Before 500ms - No Suggestions Yet)

```
╔════════════════════════════════════════════════════════════╗
║  [mandri...                                  [Loading ⟳ ] ║
╚════════════════════════════════════════════════════════════╝
```

**Behavior**:
- User types "mandritto"
- Small loading spinner appears
- Waiting for glossary variant lookup

---

### 3. Suggestions Dropdown (After ~500ms - FR-002a, SC-011)

```
╔════════════════════════════════════════════════════════════╗
║  [mandritto]                                      [×]  ║
║                                                            ║
║  Similar words from glossary:                           ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │  mandritto                                          │   ║
║  │  mandritti                                          │   ║
║  │  coup droit                                         │   ║
║  │  forehand cut                                       │   ║
║  │  mandrittone                                        │   ║
║  │  frappe directe                                     │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                            ║
║  Or press [Enter] to search only "mandritto"               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

**Performance**:
- ✅ Suggestions appear within **500ms** (SC-011 target)
- ✅ Clickable chips for easy selection

---

### 4. Multiple Selections (After Clicking Suggestions)

```
╔════════════════════════════════════════════════════════════╗
║  🔍  [mandritto]                               Clear all   ║
║                                                            ║
║  Selected terms (6 results found):                         ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        ║
║  │ mandritto    │ │ mandritti    │ │ coup droit   │ ✓     ║
║  │ [IT] [×]     │ │ [IT] [×]     │ │ [FR] [×]     │        ║
║  └──────────────┘ └──────────────┘ └──────────────┘        ║
║  ┌──────────────┐ ┌──────────────┐                         ║
║  │ forehand cut │ │ mandrittone  │                         ║
║  │ [EN] [×]     │ │ [IT] [×]     │                         ║
║  └──────────────┘ └──────────────┘                         ║
║                                                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

**Behavior**:
- Each selected term shown as a chip
- [×] button removes individual term
- Result count updates dynamically
- "Clear All" option removes all selections

---

### 5. Duplicate Detection

```
When user tries to add "mandritto" again:

┌─────────────────────────────────────────┐
│ ⚠️ "mandritto" already in selection    │
│                                         │
└─────────────────────────────────────────┘
```

---


## Interaction Flow

### User Flow 1: Single Search

```
1. User sees empty SearchBar with placeholder
   ↓
2. Clicks input field (focus)
   ↓
3. Types "mandritto"
   ↓
4. Sees loading spinner (500ms max)
   ↓
5. Dropdown appears with similar words:
   - mandritto 
   - mandritti 
   - coup droit
   - forehand cut
   ↓
6. User presses Enter to search with "mandritto" only
   OR
7. User clicks suggestion to add more terms before searching
   ↓
8. SearchResults component displays results (T022)
```

### User Flow 2: Multi-term Search with Similar Words

```
1. Type "mandritto" → See suggestions (500ms)
2. Click "mandritti" → Added to chips
3. Click "coup droit" → Added to chips
4. Click "forehand cut" → Added to chips
5. Sees loading spinner 
6. SearchResults component displays results (T022)
```

### User Flow 3: Keyboard Navigation

```
- Ctrl+F: Focus search bar
- ↓/↑: Navigate suggestion dropdown
- Enter: Select highlighted suggestion or execute search
- Escape: Close dropdown / Clear search
- Backspace: Remove selected chip
```

---

## Technical Notes for Implementation

### Props

```typescript
interface SearchBarProps {
  onSearch: (terms: SearchResult[]) => void;  // Called on Enter
  placeholder?: string;                        // Default: "Search treatises..."
  maxSelections?: number;                      // Default: 10
  debounceMs?: number;                         // Default: 500 for suggestions
}
```

### Dropdown Behavior

```typescript
// Similar words suggestion performance requirements (SC-011)
- User types → Start timer
- Query glossary for variants (buildGlossaryIndex from T013)
- Generate language variants (generateVariants from T014)
- Show dropdown ≤ 500ms after typing stops

// Glossary lookup
const suggestions = mapCrossLanguage(inputTerm, 'it')
  .concat(generateVariants(inputTerm, 'it'))
  .concat(generateVariants(inputTerm, 'fr'))
  .concat(generateVariants(inputTerm, 'en'))
  .slice(0, 10)  // Limit dropdown to 10 suggestions
```

### State Management

- Current input value (controlled component)
- Selected term chips (array of SearchQuery items)
- Dropdown visibility state
- Loading state during variant lookup
- Focused suggestion index (for keyboard nav)

---

## Design Specifications

### Colors & Styling

```css
/* Input field */
border: 2px solid #d1d5db;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Selected chips */
background: #e0e7ff;  /* Light indigo */
color: #3730a3;       /* Dark indigo */
border-radius: 20px;
padding: 6px 12px;
margin: 4px;

/* Language badges [IT] [FR] [EN] */
background: #f3f4f6;
color: #6b7280;
font-size: 12px;
border-radius: 4px;
padding: 2px 6px;

/* Dropdown */
background: white;
border: 1px solid #e5e7eb;
border-radius: 8px;
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
max-height: 300px;
overflow-y: auto;

/* Suggestion items (hover) */
background-color: #f9fafb;
cursor: pointer;
padding: 12px 16px;
```

### Keyboard Accessibility

- Tab: Move to next control (Clear button)
- Arrow Up/Down: Navigate dropdown suggestions
- Enter: Select suggestion or execute search
- Escape: Close dropdown
- Shift+Tab: Move to previous control

---

## Success Criteria (from spec.md)

✅ **SC-011**: Similar word suggestions appear in dropdown within 500ms
- Verified: Dropdown shows within 500ms of user stopping typing
- Performance: Glossary index built once on app load (T013)

✅ **FR-002a**: System MUST propose a chips list of similar words from the glossary when user enters a search term
- Verified: Suggestions shown for all three languages (IT/FR/EN)
- Variant generation includes: plurals, conjugations, related forms

✅ **FR-001**: System MUST search across all treatise YAML files
- SearchBar collects terms, passes to BolognesePlatform context (T024)
- SearchEngine executes search (T016)

✅ **FR-004a**: When user enters search term(s) and/or selects chip(s), SearchBar triggers an update to BolognesePlatform showing matching chapters

---

## Related Mockups

- SearchResults.md (T022) - Integrated into BolognesePlatform display (not separate page)
- AnnotationPanel.md (T003) - Panel opens when user views result chapters
- BolognesePlatform enhancements for smooth chapter pagination (T029)

---

## Notes

- Suggest **debouncing** input to avoid excessive glossary lookups
- Consider **caching** variant lookups for frequently searched terms
- Show **loading state** during glossary lookup (animate spinner)
- Ensure **keyboard-only navigation** works for accessibility
- Mobile: Stack chips vertically if needed (responsive design)
- Direct integration with BolognesePlatform (no separate search results page)

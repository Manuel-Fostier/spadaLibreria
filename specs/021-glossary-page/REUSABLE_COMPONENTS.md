# Reusable Components Analysis for Glossary Page

## Components That CAN Be Reused

### ✅ **SearchBar Component** (HIGH PRIORITY)
**File**: `src/components/SearchBar.tsx`

**Current Features**:
- Real-time search input with auto-grow textarea
- Keyboard shortcuts (Enter to search, Escape to clear)
- Search options toggle buttons:
  - Match Case (Aa)
  - Whole Word (ab with underline)
  - Regex (.*)
- Integrated with SearchContext
- Auto-search on input change
- Clear button functionality

**Glossary Adaptation Needed**:
- ✅ Can use **as-is** with GlossaryContext instead of SearchContext
- Need to adapt context integration:
  - Replace `useSearch()` with `useGlossary()`
  - Map `performSearch` → `setSearchQuery`
  - Map `clearSearch` → `setSearchQuery('')`
- Search options (Match Case, Whole Word, Regex) may be **optional** for glossary (simpler search)

**Recommendation**: 
- **Option 1**: Create `GlossarySearchBar.tsx` that adapts SearchBar pattern to GlossaryContext
- **Option 2**: Make SearchBar generic with context props
- **BEST**: Option 1 - Keep separation, reuse UI pattern but adapt to glossary needs

---

### ✅ **Language Switching Pattern** (MEDIUM PRIORITY)
**File**: `src/components/BolognesePlatform.tsx` (lines 78-131, 503-520)

**Current Implementation**:
```tsx
// State management
const [showItalian, setShowItalian] = useState(false);
const [showEnglish, setShowEnglish] = useState(false);
// French is always shown (default)

// Toggle buttons
<button onClick={() => setShowItalian(!showItalian)}>
  Italien {showItalian ? '✓' : ''}
</button>
<button onClick={() => setShowEnglish(!showEnglish)}>
  English {showEnglish ? '✓' : ''}
</button>
```

**Glossary Needs**:
- **Different model**: Single language selection (not multi-column toggles)
- Need **radio button pattern**: Select one of IT/FR/EN
- GlossaryContext already has `selectedLanguage` and `setSelectedLanguage()`

**Recommendation**: 
- **Extract pattern** (button styling, checkmarks) but rebuild as radio group
- Create new `LanguageSelector.tsx` component specifically for glossary
- Reference BolognesePlatform for consistent styling

---

### ✅ **highlighter.ts Utility** (CRITICAL - Already Planned)
**File**: `src/lib/highlighter.ts`

**Features**:
- Text highlighting for search matches
- Already integrated with SearchContext
- Handles regex patterns, case sensitivity, whole word matching

**Usage in Glossary**:
- Apply to term names, definitions, translations when search is active
- Reuse existing highlighting logic
- ✅ **Can be used directly** with glossary search query

---

### ✅ **Term Component Pattern** (REFERENCE ONLY)
**File**: `src/components/Term.tsx`

**Current Use**: Glossary term tooltips in treatise text

**Features**:
- Displays glossary entry details in tooltip
- Term name, type, definition, translation
- Language-aware display
- Tailwind styling

**Glossary Reuse**:
- **Cannot reuse directly** (tooltip vs. full display)
- **Can reference** for:
  - Display patterns for term data
  - Styling consistency
  - Layout structure for term name + definition + translation

---

## Components That CANNOT Be Reused

### ❌ **AnnotationPanel** 
**Why Not**: Specific to treatise annotations, completely different data structure

### ❌ **AnnotationBadge/AnnotationDisplaySettings**
**Why Not**: Annotation-specific, not relevant to glossary

### ❌ **TextParser/MarkdownRenderer**
**Why Not**: For parsing treatise text with glossary links, not for displaying glossary itself

### ❌ **TagFilter**
**Why Not**: Filter by annotation tags, glossary uses search not tag filtering

### ❌ **MeasureProgressBar/StatisticsModal**
**Why Not**: Treatise-specific features

---

## Recommended Component Architecture for Glossary

### New Components to Create (Phase 1.2-1.4)

1. **GlossarySearchBar.tsx** (T052)
   - **Reuse pattern from**: SearchBar.tsx
   - **Changes**: Simpler (no Match Case/Whole Word/Regex buttons), integrate with GlossaryContext

2. **LanguageSelector.tsx** (T045)
   - **Reuse pattern from**: BolognesePlatform language toggles
   - **Changes**: Radio button group instead of checkboxes, integrate with GlossaryContext

3. **TermDisplay.tsx** (T042)
   - **Reuse pattern from**: Term.tsx
   - **Changes**: Full display (not tooltip), hierarchical layout, highlight support

4. **CategorySection.tsx** (T043)
   - **New component**: No existing equivalent
   - **Purpose**: Display category header + types + terms in hierarchy

5. **GlossaryContent.tsx** (T047)
   - **New component**: No existing equivalent  
   - **Purpose**: Render all CategorySection components from grouped terms

6. **GlossaryPage.tsx** (T072)
   - **New component**: Main page assembly
   - **Purpose**: Combine SearchBar + LanguageSelector + GlossaryContent

---

## Implementation Strategy

### Phase 1.2: Browse (US1)
1. Create **TermDisplay** - Reference Term.tsx for patterns ✅
2. Create **CategorySection** - New component ✅
3. Create **LanguageSelector** - Adapt BolognesePlatform pattern ✅
4. Create **GlossaryContent** - New component ✅

### Phase 1.3: Search (US2)
1. Create **GlossarySearchBar** - Adapt SearchBar.tsx pattern ✅
2. Update TermDisplay to use **highlighter.ts** ✅

### Phase 1.5: Integration
1. Create **GlossaryPage** - Assemble all components ✅
2. Create **GlossaryPageWrapper** - Provide GlossaryContext ✅

---

## Code Reuse Summary

| Component | Reuse Level | Action |
|-----------|-------------|--------|
| SearchBar.tsx | **Pattern** | Adapt to GlossarySearchBar (simpler) |
| Language toggles | **Pattern** | Extract to LanguageSelector (radio group) |
| highlighter.ts | **Direct** | Use as-is for search highlighting |
| Term.tsx | **Reference** | Reference for display patterns only |
| LocalStorage | **Direct** | Use for preferences persistence |
| Tailwind patterns | **Direct** | Maintain consistent styling |

**Total New Components**: 6  
**Total Reused Utilities**: 2 (highlighter.ts, localStorage.ts)  
**Total Reused Patterns**: 3 (SearchBar, Language toggles, Term display)

---

## Next Steps

1. ✅ Phase 1.0: Foundation (COMPLETE)
2. ✅ Phase 1.1: GlossaryContext (COMPLETE)
3. **NOW**: Phase 1.2 - Create browsing components
   - Start with TermDisplay (references Term.tsx)
   - Then CategorySection (new)
   - Then LanguageSelector (adapts BolognesePlatform)
   - Finally GlossaryContent (assembles all)


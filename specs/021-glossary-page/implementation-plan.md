# Implementation Plan: Glossary Page

**Framework**: Next.js 15 (App Router) + TypeScript + React + Tailwind CSS  
**Testing**: Jest + React Testing Library (TDD - write tests first)  
**Data Format**: YAML (`data/glossary.yaml`)  
**Patterns**: Reuse existing SearchContext, dataLoader, SearchEngine, AnnotationPanel pattern

---

## Phase 0: Pre-Implementation (BLOCKING)

### Task 0.1: Refactor `data/glossary.yaml` - Add Category Field
- **Status**: ASSIGNED
- **Blocker**: Phase 1 cannot start until complete
- **Details**: 
  - Extract 8 category sections from YAML comments
  - Add explicit `category` field to each term
  - No changes to `type`, `definition`, `translation` fields
  - All ~80 terms must receive `category` field

**Acceptance Criteria**:
- ✅ All terms have `category` field matching current section headers
- ✅ Data validates (no parsing errors)
- ✅ Git commit to main branch

---

## Phase 1: MVP - Standalone Glossary Page

### Phase 1.1: Data Loading & Utilities

#### 1.1.1 Test: Glossary Data Type Validation
- **File**: `src/lib/__tests__/glossaryLoader.test.ts`
- **TDD Steps**:
  1. Write test for `loadGlossaryTerms()` function
  2. Test should verify:
     - Returns array of GlossaryTerm objects
     - Each term has required fields: `term`, `category`, `type`, `definition`, `translation`
     - Handles missing translations gracefully
     - Supports all three languages (it, fr, en)
  3. Implement `loadGlossaryTerms()` to pass tests

#### 1.1.2 Implement: Glossary Type Definitions
- **File**: `src/types/glossary.ts`
- **Types to define**:
  ```typescript
  interface GlossaryTerm {
    id: string;
    term: string;
    category: string;
    type: string;
    definition: { it: string; fr: string; en: string };
    translation: { it: string; fr: string; en: string };
  }
  
  interface GlossaryCategory {
    name: string;
    terms: GlossaryTerm[];
  }
  
  interface GroupedGlossary {
    [category: string]: {
      [type: string]: GlossaryTerm[];
    };
  }
  ```

#### 1.1.3 Implement: Glossary Loader Utility
- **File**: `src/lib/glossaryLoader.ts`
- **Functions**:
  - `loadGlossaryTerms(): Promise<GlossaryTerm[]>` - Load all terms from YAML
  - `groupGlossaryByCategory(terms: GlossaryTerm[]): GroupedGlossary` - Hierarchical grouping
  - `searchGlossaryTerms(terms: GlossaryTerm[], query: string, language: string): GlossaryTerm[]` - Search across term names, categories, and definitions

#### 1.1.4 Test: Search Functionality
- **File**: `src/lib/__tests__/glossarySearch.test.ts`
- **TDD Steps**:
  1. Write tests for search across:
     - Term names (case-insensitive partial match)
     - Category names (case-insensitive)
     - Definition content (case-insensitive)
  2. Test multilingual search (IT, FR, EN)
  3. Test edge cases: empty query, no results, special characters
  4. Implement `searchGlossaryTerms()` to pass tests

---

### Phase 1.2: State Management

#### 1.2.1 Implement: Glossary Context
- **File**: `src/contexts/GlossaryContext.tsx`
- **State**:
  - `terms: GlossaryTerm[]` - All glossary terms
  - `searchQuery: string` - Current search query
  - `selectedLanguage: 'it' | 'fr' | 'en'` - Display language
  - `isLoading: boolean` - Data loading state
  - `error: string | null` - Loading errors
- **Actions**:
  - `setSearchQuery(query: string): void`
  - `setSelectedLanguage(lang: string): void`
  - `loadTerms(): void`
- **Computed**:
  - `filteredTerms` - Terms matching current search
  - `groupedTerms` - Hierarchical grouping (Category → Type → Terms)

#### 1.2.2 Test: Glossary Context Behavior
- **File**: `src/contexts/__tests__/GlossaryContext.test.tsx`
- **Tests**:
  - Initial state loads all terms
  - Search query filters terms correctly
  - Language switching updates display without losing search state
  - Error handling for failed data load

---

### Phase 1.3: Components - Browse & Search (User Stories 1 & 2)

#### 1.3.1 Test: GlossaryPage Component
- **File**: `src/components/__tests__/GlossaryPage.test.tsx`
- **TDD Steps**:
  1. Write test that GlossaryPage renders:
     - Language selector (IT, FR, EN)
     - Search input field
     - All glossary content organized by Category → Type → Term
     - Loading state spinner
     - Error message on failure
  2. Test search highlighting:
     - Matching terms are highlighted
     - Non-matching terms remain visible
     - Highlight clears when search clears

#### 1.3.2 Implement: GlossaryPage Component
- **File**: `src/components/GlossaryPage.tsx`
- **Structure**:
  ```
  GlossaryPage
  ├── LanguageSelector (reuse existing or adapt)
  ├── GlossarySearch
  ├── GlossaryContent
  │   ├── CategorySection (for each category)
  │   │   ├── TypeSubsection (for each type)
  │   │   │   ├── TermDisplay (for each term)
  │   │   │   │   ├── Term name
  │   │   │   │   ├── Definition (highlighted if matches search)
  │   │   │   │   └── Translation
  ```
- **Responsibilities**:
  - Load terms via GlossaryContext
  - Display all content always visible
  - Apply search highlighting (reuse `highlighter.ts`)
  - No collapsing/filtering UI

#### 1.3.3 Test: Search Bar Component (Glossary-specific)
- **File**: `src/components/__tests__/GlossarySearchBar.test.tsx`
- **Tests**:
  - Input updates search query in context
  - Search results highlight inline
  - Clear button removes all highlights
  - "No results" message shows when nothing matches
  - Partial matches work (e.g., "man" finds "Mandritto")

#### 1.3.4 Implement: GlossarySearchBar Component
- **File**: `src/components/GlossarySearchBar.tsx`
- **Features**:
  - Real-time search input (debounced for performance)
  - Match highlighting using existing `highlighter.ts` utility
  - "No results" indicator
  - Clear search button
  - Browser-like Find behavior (all matches highlighted inline)

#### 1.3.5 Test: Term Display Component
- **File**: `src/components/__tests__/TermDisplay.test.tsx`
- **Tests**:
  - Displays term name, category, type, definition, translation
  - Language-specific content displays correctly
  - Search highlighting applied to matching text
  - Handles missing translations gracefully

#### 1.3.6 Implement: TermDisplay Component
- **File**: `src/components/TermDisplay.tsx`
- **Props**:
  - `term: GlossaryTerm`
  - `language: 'it' | 'fr' | 'en'`
  - `searchQuery: string` (for highlighting)
  - `highlightMatches: boolean`
- **Output**: Rendered term with definition and translation, with search highlights

#### 1.3.7 Test: Glossary Category Section Component
- **File**: `src/components/__tests__/CategorySection.test.tsx`
- **Tests**:
  - Displays category header
  - Lists all types and terms within category
  - All content visible (no collapsing)
  - Proper hierarchical nesting

#### 1.3.8 Implement: CategorySection Component
- **File**: `src/components/CategorySection.tsx`
- **Props**:
  - `categoryName: string`
  - `groupedTerms: { [type: string]: GlossaryTerm[] }`
  - `language: 'it' | 'fr' | 'en'`
  - `searchQuery: string`
- **Output**: Category header with all nested types and terms

---

### Phase 1.4: Page & Route

#### 1.4.1 Test: Glossary Page Route
- **File**: `src/app/glossary/__tests__/page.test.tsx`
- **Tests**:
  - Page renders successfully at `/glossary` route
  - All P1 components mount without errors
  - Initial data load completes

#### 1.4.2 Implement: Glossary Page Route
- **File**: `src/app/glossary/page.tsx`
- **Structure**:
  - Server component that wraps GlossaryContext provider
  - Client component (GlossaryPage) that handles all UI
  - Layout integration

#### 1.4.3 Implement: Layout Wrapper
- **File**: `src/components/GlossaryPageWrapper.tsx`
- **Provides**: GlossaryContext to all nested components

---

### Phase 1.5: Integration Tests & E2E Scenarios

#### 1.5.1 Test: Complete Browse & Search Workflow
- **File**: `src/__tests__/glossary-integration.test.tsx`
- **Scenario 1**: User loads glossary → all terms visible
- **Scenario 2**: User types search term → matching terms highlighted
- **Scenario 3**: User clears search → all content visible again
- **Scenario 4**: User switches language → content updates with translations
- **Scenario 5**: User searches term name, category, definition → all match types work

#### 1.5.2 Test: Performance
- **File**: `src/__tests__/glossary-performance.test.tsx`
- **Tests**:
  - Page loads in <2 seconds with ~80 terms
  - Search executes in <100ms
  - Language switching is instant

---

### Phase 1.6: Responsive Design & UI Polish

#### 1.6.1 Test: Responsive Layout
- **File**: `src/components/__tests__/GlossaryPage.responsive.test.tsx`
- **Tests**:
  - Desktop (1920px): Full layout visible
  - Tablet (768px): Adjusted spacing, readable
  - Mobile (375px): Single column, scrollable, usable

#### 1.6.2 Implement: Tailwind Responsive Classes
- Update components with responsive breakpoints
- Mobile-first approach: `sm:`, `md:`, `lg:` classes
- Ensure readability at all viewport sizes

---

## Phase 2: Treatise Integration

### 2.1 Link Terms in Treatises to Glossary Page
- Add clickable term links in treatise display
- Navigate to `/glossary` when clicked
- No URL hash fragments yet (Phase 3)

### 2.2 Test & Implement
- Tests for link generation
- Navigation integration tests
- User Story 4 acceptance scenarios

---

## Phase 3: Advanced Integration

### 3.1 URL Hash Fragment Support
- Support `/glossary#mandritto` to auto-scroll to specific term
- Scroll target term into view on page load
- Update browser history when term selected

### 3.2 Test & Implement
- Hash parsing tests
- Auto-scroll functionality tests
- Browser history management tests

---

## Phase 4: Content Editing Interface

### 4.1 Edit Button & Panel
- Add "Edit" button next to each term
- Reuse AnnotationPanel pattern from BolognesePlatform
- Edit form for: definitions, translations, term type

### 4.2 Data Persistence
- Save edits back to `data/glossary.yaml`
- API endpoint to persist changes
- Validation before save

### 4.3 Test & Implement
- Edit form component tests
- API integration tests
- Data persistence tests
- Undo/error handling

---

## Testing Strategy (TDD - Tests First)

1. **Unit Tests**: Each utility, context, component has isolated tests
2. **Integration Tests**: Component trees, context flows
3. **E2E Scenarios**: Complete user workflows
4. **Accessibility**: ARIA roles, keyboard navigation (Phase 2+)
5. **Performance**: Load times, search speed

**Test Coverage Target**: 80%+ for Phase 1

---

## Technology Choices (Reuse Existing)

| Feature | Technology | Notes |
|---------|-----------|-------|
| Data Loading | `fs`, `js-yaml` | Existing pattern in dataLoader.ts |
| Search | `searchEngine.ts`, `searchIndex.ts` | Existing utilities, adapt for glossary |
| Highlighting | `highlighter.ts` | Existing utility, reuse for term matching |
| State | React Context (`GlossaryContext`) | Similar to SearchContext, AnnotationContext |
| Edit UI | AnnotationPanel pattern | Established UI pattern in BolognesePlatform |
| Styling | Tailwind CSS | Existing project standard |
| Testing | Jest + React Testing Library | Project standard |
| Type Safety | TypeScript | Full type coverage required |

---

## Acceptance Criteria - Phase 1 MVP

- ✅ All P1 user stories (Browse, Search) fully implemented
- ✅ 80%+ test coverage for Phase 1 code
- ✅ All tests passing
- ✅ Responsive design verified on 3 viewport sizes
- ✅ Performance: <2s page load, <100ms search
- ✅ Glossary.yaml refactoring complete (Phase 0)
- ✅ All clarifications resolved and documented
- ✅ Ready for Phase 2 (treatise integration)

---

## Glossary.yaml Refactoring (Pre-Req)

**Before Implementation Starts**:

```yaml
# CURRENT (with category as comment only)
###########################################################################################
# Les Coups et Techniques
###########################################################################################
mandritto:
  term: Mandritto
  type: Attaque / Frappe de taille
  definition: { ... }
  translation: { ... }

# AFTER (with explicit category field)
mandritto:
  term: Mandritto
  category: "Coups et Techniques"
  type: Attaque / Frappe de taille
  definition: { ... }
  translation: { ... }
```

**8 Category Sections to Process**:
1. Coups et Techniques
2. Les Guardes
3. Coups et Techniques Additionnels
4. Concepts Tactiques
5. Actions et Mouvements Additionnels
6. Armes et Équipement
7. Termes Techniques Additionnels
8. Les Cibles

---

## Dependency Graph

```
Phase 0: glossary.yaml refactoring (BLOCKER)
    ↓
Phase 1.1: Type definitions + Data loading utilities
    ↓
Phase 1.2: GlossaryContext state management
    ↓
Phase 1.3: Components (GlossaryPage, Search, TermDisplay, etc.)
    ↓
Phase 1.4: Page route + integration tests
    ↓
Phase 1.5: Performance & e2e tests
    ↓
Phase 1.6: Responsive design polish
    ↓ (PHASE 1 COMPLETE)
    ↓
Phase 2: Treatise integration
    ↓
Phase 3: URL hash fragments
    ↓
Phase 4: Content editing interface
```

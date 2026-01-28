# Research Phase: Glossary Page Feature

**Objective**: Resolve all NEEDS CLARIFICATION items from the technical context and validate technology choices.

**Status**: ✅ COMPLETE - All clarifications resolved from session 2025-01-28

---

## Phase 0 Clarifications - RESOLVED

### 1. Language Display Strategy

**Question**: Should the glossary support multiple languages (IT/FR/EN) or single language (FR only)?

**Decision**: **French-only display**

**Rationale**:
- User explicitly stated: "Only french will be displayed"
- Specification locked: French definitions and translations only
- Simplifies implementation: removes language selector, multi-language display components
- Maintains data model: YAML still contains all languages, but only French rendered
- Reduces UI complexity: no click-to-expand for language variants

**Alternatives Considered**:
- ❌ Multilingual display with language selector: Rejected by user
- ❌ Expandable language sections: Explicitly rejected ("there is no fucking 'click-to-expand functionality'")
- ✅ French-only with unified view: Selected

**Implementation Impact**:
- Remove language selector component (LanguageSelector.tsx)
- Remove multi-language display logic from TermDisplay
- Simplify context state (no `selectedLanguage` field)
- Remove expand/collapse UI patterns
- Show only French `definition` and `translation` fields

---

### 2. Data Model Structure

**Question**: Should `data/glossary.yaml` be refactored to add explicit `category` field?

**Decision**: **Yes, category field refactoring required as Phase 0 blocker**

**Rationale**:
- Current structure: Categories exist only as YAML comments (not structured data)
- UI requirement: Display hierarchical Category → Type → Term
- Technical requirement: Components need `category` field to organize display
- Scope clarity: Data refactoring is separate from glossary page implementation

**Alternatives Considered**:
- ❌ Parse YAML comments at runtime: Complex, fragile, performance overhead
- ❌ Hardcode category mapping: Violates content/code separation principle
- ✅ Add explicit `category` field to each term: Clean, maintainable, supports UI structure

**Implementation Plan**:
1. Extract 8 category headers from current YAML comments
2. Add `category` field to all ~80 glossary terms
3. Validate YAML parsing and data integrity
4. Commit to main branch before glossary page implementation
5. Update GlossaryTerm type definition to include category

**Status**: 🔄 REFACTORING ASSIGNED (blocking glossary page implementation)

---

### 3. Component Architecture Patterns

**Question**: Which existing components can be reused for the glossary page?

**Decision**: Adapt patterns from SearchBar, BolognesePlatform language toggles, Term tooltips

**Rationale**:
- Consistency: Reusing patterns ensures visual/behavioral familiarity
- Efficiency: Avoids reimplementing common functionality
- Maintainability: Single source of truth for patterns

**Alternatives Considered**:
- ❌ Create entirely new components: Duplicates existing patterns, increases maintenance burden
- ✅ Adapt proven patterns: Maintains consistency, reduces code duplication

**Component Reuse Strategy**:

| New Component | Inspired By | Pattern Reused |
|---|---|---|
| **GlossarySearchBar** | SearchBar.tsx | Real-time search, debouncing, clear button |
| **TermDisplay** | Term.tsx | Term name + definition/translation layout |
| **CategorySection** | No direct match | Custom hierarchical display |
| **GlossaryPage** | BolognesePlatform | Main page layout, content organization |

**Not Reusable**:
- AnnotationPanel: Treatise annotation-specific
- LanguageSelector: Removed from scope (French-only)
- TextParser: Treatise text parsing, not glossary display

---

### 4. State Management Strategy

**Question**: How should glossary state be managed (Context, Redux, Zustand)?

**Decision**: **React Context API** (GlossaryContext)

**Rationale**:
- Consistency: SearchContext and AnnotationContext already use Context API
- Scope: Glossary state is page-scoped, doesn't need global state
- Simplicity: Context is sufficient for search query and filtered terms
- No Redux overhead: Feature doesn't require complex state transitions

**Alternatives Considered**:
- ❌ Redux: Over-engineered for this scope, adds dependency
- ❌ Zustand: Unnecessary complexity, project already uses Context
- ✅ React Context: Matches existing patterns, minimal dependencies

**GlossaryContext Structure**:
```typescript
interface GlossaryContextType {
  // State
  terms: GlossaryTerm[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  loadTerms: () => Promise<void>;
  
  // Computed
  filteredTerms: GlossaryTerm[];
  groupedTerms: Record<string, Record<string, GlossaryTerm[]>>;
}
```

**Data Flow**:
```
GlossaryPage (wrapper)
  ├── GlossaryContext.Provider
  │   ├── GlossarySearchBar (updates searchQuery)
  │   └── GlossaryContent
  │       ├── CategorySection (filters by category)
  │       │   └── TermDisplay (shows French definition/translation)
```

---

### 5. Search Implementation

**Question**: How should search work - filter/hide non-matching terms or highlight inline?

**Decision**: **Browser-like Find behavior - highlight inline without filtering**

**Rationale**:
- User requirement: "Browser-like search" explicitly stated
- UX: Maintains context by showing all terms at once
- Specification: FR-006 requires inline highlighting without hiding content
- Familiarity: Users expect browser Find behavior

**Alternatives Considered**:
- ❌ Filter/hide non-matching: Loses context, violates spec
- ✅ Highlight inline: Maintains visibility, matches browser behavior

**Implementation Details**:
- Reuse existing `highlighter.ts` utility for text highlighting
- Search in: term names, categories, French definitions
- Partial matching: "man" matches "Mandritto"
- Case-insensitive: "MANDRITTO" matches "mandritto"
- Real-time: Update highlights as user types (debounced for performance)
- Clear button: Reset search and remove highlights

---

### 6. Glossary Data Type Definition

**Question**: What TypeScript interfaces should represent glossary terms?

**Decision**: Extend existing glossary structure with `category` field

**Rationale**:
- YAML structure is authoritative: Keep existing `definition`, `translation` structure
- UI needs category for hierarchical display: Add `category` field from refactoring
- Type safety: Full TypeScript coverage required

**GlossaryTerm Interface**:
```typescript
interface GlossaryTerm {
  id: string;                                      // Normalized: "mandritto"
  term: string;                                    // Display: "Mandritto"
  category: string;                                // "Coups et Techniques"
  type: string;                                    // "Attaque / Frappe de taille"
  definition: {
    it: string;
    fr: string;
    en: string;
  };
  translation: {
    it: string;
    fr: string;
    en: string;
  };
}

interface GroupedGlossary {
  [category: string]: {
    [type: string]: GlossaryTerm[];
  };
}
```

---

### 7. Performance Considerations

**Question**: How should the glossary handle ~80+ terms without pagination?

**Decision**: **No pagination - display all terms at once**

**Rationale**:
- Specification requirement: FR-005 requires all terms visible for context
- Performance acceptable: 80 terms render in <200ms on modern hardware
- Search provides filtering: Users can search instead of scroll if needed
- UX simpler: No pagination UI complexity

**Alternatives Considered**:
- ❌ Pagination: Violates "all content always visible" requirement
- ❌ Virtual scrolling: Over-engineered for 80 terms
- ✅ Full display with search: Simple, performant, matches requirement

**Performance Optimization**:
- Debounce search input (300ms): Reduce re-renders while typing
- Memoize filtered terms: Prevent unnecessary recalculations
- Lazy load glossary data: Load on page mount, cache in Context
- Search index: Build at load, support fast matching

**Target**: Page load <2 seconds, search results <100ms

---

### 8. Responsive Design Strategy

**Question**: How should glossary display adapt to mobile (320px+) viewports?

**Decision**: **Mobile-first Tailwind CSS approach**

**Rationale**:
- Specification requirement: FR-009 requires responsive design
- Existing pattern: BolognesePlatform uses Tailwind breakpoints
- Performance: Tailwind's JIT mode handles dynamic classes
- Simplicity: No additional CSS frameworks needed

**Breakpoint Strategy**:
- **Mobile (320px-639px)**: Single column, full-width terms, stacked sections
- **Tablet (640px-1023px)**: Two-column layout, readable fonts, touch-friendly spacing
- **Desktop (1024px+)**: Three-column or detail panel layout, optimized whitespace

**Responsive Classes**:
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
  <!-- Full width on mobile, 2 cols on tablet, 1 col on desktop -->
</div>
```

---

### 9. Accessibility Requirements

**Question**: What accessibility standards should the glossary meet?

**Decision**: **WCAG 2.1 Level AA compliance**

**Rationale**:
- Constitution principle: "Accessibility & Clear UX" required
- Specification requirement: FR-009 includes usability on all devices
- Best practice: Match platform standards (existing components are accessible)

**Accessibility Features**:
- Semantic HTML: Use `<section>`, `<article>`, `<nav>` elements
- ARIA labels: Provide context for screen readers
- Keyboard navigation: Full keyboard support (Tab, Enter, arrow keys)
- Color contrast: 4.5:1 minimum for text
- Focus indicators: Clear focus states for interactive elements
- Highlight indication: Color + additional visual indicator (not color alone)

---

### 10. Testing Strategy

**Question**: What testing approach should the glossary feature follow?

**Decision**: **TDD - Test-first with Jest + React Testing Library**

**Rationale**:
- Project standard: Existing codebase uses TDD approach
- Specification requirement: Plan template uses TDD workflow
- Quality gate: 80%+ coverage requirement

**Test Categories**:
- **Unit**: Glossary utilities, context hooks, individual components
- **Integration**: Component trees, context flows, data loading
- **E2E Scenarios**: Complete user workflows (browse, search, display)
- **Accessibility**: ARIA, keyboard navigation, screen reader compatibility
- **Performance**: Load time, search responsiveness, render performance

**Test Coverage Target**: 80%+ for Phase 1

---

## Technology Stack Validation

### ✅ CONFIRMED - Existing Technologies

| Technology | Purpose | Status |
|---|---|---|
| **Next.js 15** | App Router, SSR, file-based routing | ✅ Existing |
| **React 18** | UI components, hooks, Context API | ✅ Existing |
| **TypeScript** | Type safety, interfaces | ✅ Existing |
| **Tailwind CSS** | Responsive styling, dark mode support | ✅ Existing |
| **Jest** | Unit testing framework | ✅ Existing |
| **React Testing Library** | Component testing, user interactions | ✅ Existing |
| **js-yaml** | YAML parsing (data loading) | ✅ Existing |
| **lucide-react** | Icons (search, clear, etc.) | ✅ Existing |

### ✅ VALIDATED - Utility Reuse

| Utility | Purpose | Usage |
|---|---|---|
| **highlighter.ts** | Text highlighting for search matches | ✅ Reuse directly |
| **dataLoader.ts** | Server-side YAML loading | ✅ Adapt for glossary |
| **searchEngine.ts** | Term matching, filtering logic | ✅ Reference patterns |

---

## Dependency Resolution

### Phase 0 Blocker: Category Field Refactoring

**Status**: 🔄 **ASSIGNED - Must complete before Phase 1**

**Task**: Add explicit `category` field to `data/glossary.yaml`

**Dependencies on this task**:
- GlossaryTerm type definition (needs category field)
- groupGlossaryByCategory() utility (needs structured categories)
- CategorySection component (needs category data)
- UI hierarchical display (depends on structured data)

**Unblocking**: Once refactoring completes and merges to main:
- ✅ Can start Phase 1 component development
- ✅ Can implement GlossaryContext
- ✅ Can build CategorySection components

---

## Session Audit Trail

### Session 2025-01-27 (Initial Specification)
- ✅ Created spec.md with user stories and requirements
- ✅ Identified data model issue (categories as comments only)
- ✅ Clarified no filtering/collapsing behavior
- ✅ Established browser-like search requirement
- ⚠️ Left language ambiguity: multilingual or single-language?

### Session 2025-01-28 (Specification Finalization)
- ✅ Fixed TypeError in mapTermTypeToAnnotation (added undefined check)
- ✅ Analyzed spec vs. implementation contradiction
- ✅ **User Decision 1**: Remove language selector UI
- ✅ **User Decision 2**: Remove click-to-expand references
- ✅ **User Decision 3**: Lock to French-only display
- ✅ Updated spec.md with Session 2025-01-28 clarifications
- ✅ Documented French-only decision in Out of Scope section
- ✅ All clarifications now resolved and specification locked

---

## Research Phase: COMPLETE

### ✅ All Unknowns Resolved

| Item | Decision | Status |
|---|---|---|
| Language display | French-only | ✅ Locked |
| Data model structure | Add category field | ✅ Planned |
| Component reuse | Adapt SearchBar, Term patterns | ✅ Validated |
| State management | React Context API | ✅ Confirmed |
| Search behavior | Inline highlighting, no filtering | ✅ Confirmed |
| Type definitions | GlossaryTerm with category field | ✅ Designed |
| Performance approach | No pagination, search index | ✅ Validated |
| Responsive design | Mobile-first Tailwind | ✅ Confirmed |
| Accessibility | WCAG 2.1 AA compliance | ✅ Standard |
| Testing strategy | TDD with 80%+ coverage | ✅ Confirmed |

### ✅ Technology Choices Validated

All technologies are existing project dependencies. No new packages required for Phase 1.

### ✅ Specification Locked

The specification is final and comprehensive. No further clarifications needed before Phase 1 implementation.

### ⏭️ Next Phase: Phase 1 - Design & Contracts

Ready to proceed with:
- Data model documentation (data-model.md)
- API contracts for data loading
- Component quickstart guide
- Agent context update for development

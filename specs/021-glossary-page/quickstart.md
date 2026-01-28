# Quickstart: Glossary Page Implementation

**Phase**: Phase 1 - Glossary MVP  
**Target**: Complete glossary browsing, search, and French display  
**Duration**: ~2-3 weeks (6 phases)  
**Test Strategy**: TDD - write tests first, implement after

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  /glossary Route (src/app/glossary/page.tsx)               │
│  - Server component wrapping context provider              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────────────┐  ┌──────────▼─────────────────┐
│ GlossaryContext      │  │ GlossaryContent Component  │
│ - State: terms,      │  │ - Render all categories    │
│   search, grouped    │  │ - Render all types         │
│ - Actions: load,     │  │ - Render all terms         │
│   setSearch          │  └──────────────────────────────┘
└──────┬───────────────┘
       │
  ┌────┴────────────┬──────────────────┐
  │                 │                  │
┌─▼───────────────┐ │ ┌──────────────┐│
│ GlossarySearch   │ │ │CategorySect. ││
│ Bar              │ │ └──────────────┘│
│ - Input binding  │ │  └─┬─────────────┘
│ - Clear button   │ │    │
└────────────────┘ │ ┌──┴──────────────┐
                   │ │ TermDisplay     │
                   │ │ - Term name     │
                   │ │ - Category      │
                   │ │ - FR definition │
                   │ │ - FR translation│
                   │ └─────────────────┘
```

---

## Phase 1.1: Types & Utilities

### Task 1.1.1: Create Glossary Type Definitions

**File**: `src/types/glossary.ts`

**TDD First** - Write tests in `src/types/__tests__/glossary.test.ts`:

```typescript
describe('Glossary Types', () => {
  it('validates GlossaryTerm interface structure', () => {
    // Import and verify types exist
  });
  
  it('supports all required fields', () => {
    // Verify id, term, category, type, definition, translation
  });
});
```

**Implementation**:

```typescript
export interface GlossaryTerm {
  id: string;
  term: string;
  category: string;
  type: string;
  definition: { it: string; fr: string; en: string };
  translation: { it: string; fr: string; en: string };
}

export interface GroupedGlossary {
  [category: string]: {
    [type: string]: GlossaryTerm[];
  };
}
```

### Task 1.1.2: Create Glossary Loader

**File**: `src/lib/glossaryLoader.ts`

**TDD First** - Write tests in `src/lib/__tests__/glossaryLoader.test.ts`:

```typescript
describe('glossaryLoader', () => {
  it('loads glossary terms from YAML', async () => {
    // Mock fs and yaml
    // Call loadGlossaryTerms()
    // Verify returns array of terms
  });
  
  it('validates all required fields', () => {
    // Test invalid term fails validation
  });
  
  it('groups terms by category and type', () => {
    // Call groupGlossaryByCategory()
    // Verify hierarchical structure
  });
});
```

**Implementation**:

```typescript
export async function loadGlossaryTerms(): Promise<GlossaryTerm[]> {
  // Load from /api/content/glossary
  // Parse and validate
  // Return array
}

export function groupGlossaryByCategory(
  terms: GlossaryTerm[]
): GroupedGlossary {
  // Group by category, then type
  // Return hierarchical structure
}
```

### Task 1.1.3: Create Glossary Search Engine

**File**: `src/lib/glossarySearch.ts`

**TDD First**:

```typescript
describe('glossarySearch', () => {
  it('finds terms by name', () => {
    // Search for "mandritto" → finds Mandritto
  });
  
  it('finds terms by category', () => {
    // Search for "Garde" → finds all guard terms
  });
  
  it('finds terms by definition', () => {
    // Search for "taille" → finds terms with that in definition
  });
  
  it('supports partial matching', () => {
    // Search for "man" → finds "Mandritto"
  });
  
  it('is case-insensitive', () => {
    // "MANDRITTO" matches "mandritto"
  });
});
```

**Implementation**:

```typescript
export function searchGlossary(
  terms: GlossaryTerm[],
  query: string
): GlossaryTerm[] {
  if (!query) return terms;
  
  const lower = query.toLowerCase();
  return terms.filter(t =>
    t.term.toLowerCase().includes(lower) ||
    t.category.toLowerCase().includes(lower) ||
    t.type.toLowerCase().includes(lower) ||
    t.definition.fr.toLowerCase().includes(lower) ||
    t.translation.fr.toLowerCase().includes(lower)
  );
}
```

---

## Phase 1.2: State Management

### Task 1.2.1: Create GlossaryContext

**File**: `src/contexts/GlossaryContext.tsx`

**TDD First**:

```typescript
describe('GlossaryContext', () => {
  it('provides terms, searchQuery, and actions', () => {
    // Render provider with test component
    // Verify context value structure
  });
  
  it('loads terms on mount', () => {
    // Render context
    // Verify loadTerms() called, isLoading true initially
  });
  
  it('filters terms based on search query', () => {
    // Set searchQuery via context
    // Verify filteredTerms updated
  });
  
  it('groups filtered terms by category/type', () => {
    // Render context with mock terms
    // Verify groupedTerms structure
  });
});
```

**Implementation**:

```typescript
interface GlossaryContextType {
  terms: GlossaryTerm[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  filteredTerms: GlossaryTerm[];
  groupedTerms: GroupedGlossary;
  setSearchQuery: (query: string) => void;
  loadTerms: () => Promise<void>;
}

export function GlossaryProvider({ children }) {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // useEffect: load terms on mount
  // useMemo: compute filteredTerms
  // useMemo: compute groupedTerms
  // Return context provider
}

export function useGlossary() {
  return useContext(GlossaryContext);
}
```

---

## Phase 1.3: Components - Search & Display

### Task 1.3.1: Create GlossarySearchBar Component

**File**: `src/components/GlossarySearchBar.tsx`

**TDD First**:

```typescript
describe('GlossarySearchBar', () => {
  it('renders input field', () => {
    // Render component
    // Find input element
  });
  
  it('updates context on input change', () => {
    // Mock useGlossary
    // Type in input
    // Verify setSearchQuery called
  });
  
  it('debounces search input', () => {
    // Type multiple characters
    // Verify setSearchQuery called with debounce
  });
  
  it('clears search on button click', () => {
    // Type search
    // Click clear button
    // Verify searchQuery cleared
  });
});
```

**Implementation**:

```typescript
export function GlossarySearchBar() {
  const { searchQuery, setSearchQuery } = useGlossary();
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // useEffect: debounce search input
  // Handle input change
  // Render input + clear button
}
```

### Task 1.3.2: Create TermDisplay Component

**File**: `src/components/TermDisplay.tsx`

**TDD First**:

```typescript
describe('TermDisplay', () => {
  it('displays term name', () => {
    // Render with test term
    // Verify term name visible
  });
  
  it('displays French definition', () => {
    // Verify FR definition shown, not IT/EN
  });
  
  it('displays French translation', () => {
    // Verify FR translation shown, not IT/EN
  });
  
  it('displays category and type', () => {
    // Verify category/type shown
  });
  
  it('handles missing French content gracefully', () => {
    // Render with empty FR definition
    // Verify displays fallback or IT content
  });
  
  it('highlights search matches', () => {
    // Render with searchQuery
    // Verify matches highlighted
  });
});
```

**Implementation**:

```typescript
interface TermDisplayProps {
  term: GlossaryTerm;
  searchQuery?: string;
}

export function TermDisplay({ term, searchQuery }: TermDisplayProps) {
  // Render French content only
  // Apply search highlights using highlighter.ts
  // Show: Italian term name + FR definition + FR translation
}
```

### Task 1.3.3: Create CategorySection Component

**File**: `src/components/CategorySection.tsx`

**TDD First**:

```typescript
describe('CategorySection', () => {
  it('displays category header', () => {
    // Render with category name
    // Verify header visible
  });
  
  it('displays all types under category', () => {
    // Render category with multiple types
    // Verify all types shown
  });
  
  it('displays all terms under each type', () => {
    // Verify term list rendered
  });
});
```

**Implementation**:

```typescript
interface CategorySectionProps {
  categoryName: string;
  types: Record<string, GlossaryTerm[]>;
  searchQuery?: string;
}

export function CategorySection({
  categoryName,
  types,
  searchQuery,
}: CategorySectionProps) {
  // Render category header
  // For each type: render type header + terms
  // Each term: TermDisplay component
}
```

### Task 1.3.4: Create GlossaryContent Component

**File**: `src/components/GlossaryContent.tsx`

**TDD First**:

```typescript
describe('GlossaryContent', () => {
  it('renders all categories', () => {
    // Mock context with grouped terms
    // Verify all categories visible
  });
  
  it('displays loading state', () => {
    // Render with isLoading=true
    // Verify spinner/message shown
  });
  
  it('displays error state', () => {
    // Render with error
    // Verify error message shown
  });
  
  it('displays "no results" when search matches nothing', () => {
    // Mock context with empty search results
    // Verify message shown
  });
});
```

**Implementation**:

```typescript
export function GlossaryContent() {
  const { groupedTerms, isLoading, error, searchQuery } = useGlossary();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (searchQuery && Object.keys(groupedTerms).length === 0) {
    return <NoResults query={searchQuery} />;
  }
  
  // Render categories
  return Object.entries(groupedTerms).map(([category, types]) => (
    <CategorySection
      key={category}
      categoryName={category}
      types={types}
      searchQuery={searchQuery}
    />
  ));
}
```

---

## Phase 1.4: Page Route & Integration

### Task 1.4.1: Create Glossary API Endpoint

**File**: `src/app/api/content/glossary/route.ts`

**TDD First**:

```typescript
describe('GET /api/content/glossary', () => {
  it('returns glossary terms as JSON', async () => {
    // Call endpoint
    // Verify terms array in response
  });
  
  it('returns grouped glossary structure', async () => {
    // Call endpoint
    // Verify grouped structure
  });
  
  it('returns error on failed load', async () => {
    // Mock fs.readFileSync to throw
    // Verify 500 error returned
  });
});
```

**Implementation**:

```typescript
export async function GET() {
  try {
    // Load glossary.yaml
    // Parse and validate
    // Group terms
    // Return { terms, grouped, count, categories }
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Task 1.4.2: Create Glossary Page Route

**File**: `src/app/glossary/page.tsx`

**TDD First**:

```typescript
describe('Glossary Page Route', () => {
  it('renders glossary page successfully', () => {
    // Render page
    // Verify major sections present
  });
  
  it('provides GlossaryContext to children', () => {
    // Render with mock terms
    // Verify context accessible in child components
  });
  
  it('displays all glossary content', () => {
    // Render page with mock data
    // Verify glossary content visible
  });
});
```

**Implementation**:

```typescript
export default function GlossaryPage() {
  return (
    <GlossaryProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Glossaire</h1>
        <GlossarySearchBar />
        <GlossaryContent />
      </div>
    </GlossaryProvider>
  );
}
```

---

## Phase 1.5: Integration Testing

### Task 1.5.1: End-to-End Workflow Tests

**File**: `src/__tests__/glossary-workflow.test.tsx`

```typescript
describe('Glossary Workflow E2E', () => {
  it('loads glossary and displays all terms', () => {
    // Navigate to glossary page
    // Wait for load
    // Verify all ~80 terms visible
  });
  
  it('filters terms by search', () => {
    // Type in search
    // Verify matching terms highlighted
    // Verify non-matching terms still visible
  });
  
  it('clears search and restores full view', () => {
    // Search for term
    // Click clear
    // Verify all content visible again
  });
  
  it('searches across multiple fields', () => {
    // Search term name → finds matches
    // Search category → finds all terms in category
    // Search definition → finds matches
  });
});
```

---

## Phase 1.6: Responsive Design

### Task 1.6.1: Add Responsive Tailwind Classes

Update all components with responsive breakpoints:

```typescript
// Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
  {/* Content */}
</div>

// Text sizes
<h2 className="text-lg sm:text-xl md:text-2xl">
  Category Name
</h2>

// Padding
<div className="p-2 sm:p-4 md:p-6">
  {/* Content */}
</div>
```

### Task 1.6.2: Test Responsive Layouts

**File**: `src/components/__tests__/GlossaryPage.responsive.test.tsx`

```typescript
describe('Glossary Responsive Design', () => {
  it('displays correctly on mobile (375px)', () => {
    // Render at viewport 375px
    // Verify single column layout
    // Verify readable font sizes
  });
  
  it('displays correctly on tablet (768px)', () => {
    // Render at viewport 768px
    // Verify two-column or readable layout
  });
  
  it('displays correctly on desktop (1024px+)', () => {
    // Render at viewport 1024px
    // Verify optimal layout
  });
});
```

---

## Test Coverage Checklist

Before considering Phase 1 complete:

- [ ] Glossary loader utilities: 90%+ coverage
- [ ] GlossaryContext: 85%+ coverage
- [ ] GlossarySearchBar: 80%+ coverage
- [ ] TermDisplay: 85%+ coverage
- [ ] CategorySection: 80%+ coverage
- [ ] GlossaryContent: 80%+ coverage
- [ ] API endpoint: 90%+ coverage
- [ ] Search functionality: 95%+ coverage
- [ ] E2E workflows: 4/4 scenarios passing
- [ ] Responsive layouts: 3/3 viewports passing
- **Overall**: 80%+ coverage across all Phase 1 code

---

## Success Criteria for Phase 1

- ✅ All glossary terms load and display with French content only
- ✅ Search highlighting works for term names, categories, definitions
- ✅ No pagination - all content visible at once
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ Page load time <2 seconds
- ✅ Search update time <100ms (debounced 300ms input)
- ✅ 80%+ test coverage
- ✅ All tests passing (241+ passing tests)
- ✅ Ready for Phase 2: Treatise integration

---

## Development Commands

### Run Tests

```bash
# Run all glossary tests
npm test -- glossary

# Run specific test file
npm test -- TermDisplay.test.tsx

# Watch mode for development
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Start Development Server

```bash
npm run dev
# Navigate to http://localhost:3000/glossary
```

### Build for Production

```bash
npm run build
npm run start
```

---

## Debugging Tips

### Mock Data for Testing

Use `src/__mocks__/glossaryMock.ts`:

```typescript
export const mockGlossaryTerms: GlossaryTerm[] = [
  {
    id: 'mandritto',
    term: 'Mandritto',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      it: 'Colpo di taglia...',
      fr: 'Coup de taille...',
      en: 'Cutting blow...',
    },
    translation: {
      it: '',
      fr: 'Mandritto',
      en: 'Mandritto',
    },
  },
  // Add more mock terms as needed
];
```

### Common Issues

| Issue | Solution |
|---|---|
| Terms not loading | Check `/api/content/glossary` returns valid JSON |
| Search not highlighting | Verify `highlighter.ts` utility working |
| Grouped structure empty | Check `groupGlossaryByCategory()` logic |
| Context not providing data | Verify `<GlossaryProvider>` wraps page |
| Mobile layout broken | Check Tailwind responsive classes applied |

---

## Next Steps After Phase 1

Once Phase 1 is complete and merged to main:

1. **Phase 2**: Treatise integration - add glossary links in treatises
2. **Phase 3**: URL hash fragments - `/glossary#mandritto` auto-scroll
3. **Phase 4**: Content editing interface - edit button and form

---

## Files to Create

- [ ] `src/types/glossary.ts` - Type definitions
- [ ] `src/lib/glossaryLoader.ts` - Data loading
- [ ] `src/lib/glossarySearch.ts` - Search logic
- [ ] `src/contexts/GlossaryContext.tsx` - State management
- [ ] `src/components/GlossarySearchBar.tsx` - Search input
- [ ] `src/components/TermDisplay.tsx` - Term display
- [ ] `src/components/CategorySection.tsx` - Category grouping
- [ ] `src/components/GlossaryContent.tsx` - Main content area
- [ ] `src/app/glossary/page.tsx` - Page route
- [ ] `src/app/api/content/glossary/route.ts` - API endpoint
- [ ] All test files (mirror structure with `.test.tsx`)

## Total Estimated Effort

- **Phase 1.1** (Types & Utils): 2 days
- **Phase 1.2** (State Management): 2 days
- **Phase 1.3** (Components): 4 days
- **Phase 1.4** (Page & API): 2 days
- **Phase 1.5** (Integration Tests): 2 days
- **Phase 1.6** (Responsive Design): 2 days

**Total**: ~2-3 weeks (10 working days) for MVP

---

## Commits to Main

After each phase:

1. `feat: implement glossary types and utilities`
2. `feat: add GlossaryContext for state management`
3. `feat: implement glossary search and display components`
4. `feat: add glossary page route and API endpoint`
5. `test: add comprehensive glossary integration tests`
6. `style: add responsive design to glossary page`

Final commit: "feat: complete glossary page MVP (Phase 1)"

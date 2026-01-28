# Data Model: Glossary Page Feature

**Phase**: Phase 1 - Design & Contracts  
**Status**: In Progress  
**Last Updated**: 2026-01-28

---

## Overview

The glossary feature operates on a single data entity: **GlossaryTerm**. The data model extends the existing `data/glossary.yaml` structure by adding an explicit `category` field for hierarchical organization.

---

## Entity Definitions

### Entity: GlossaryTerm

**Purpose**: Represents a single fencing terminology entry with multilingual definitions and translations.

**Source**: `data/glossary.yaml`

**YAML Structure** (After Phase 0 refactoring):

```yaml
mandritto:                           # ID (normalized: lowercase, underscores)
  term: Mandritto                    # Display term name (Italian)
  category: Coups et Techniques      # Parent category (NEW FIELD)
  type: Attaque / Frappe de taille   # Sub-category/type
  definition:                        # Definitions in multiple languages
    it: Colpo di taglia eseguito da destra a sinistra
    fr: Coup de taille exécuté de droite à gauche
    en: A cutting blow executed from right to left
  translation:                       # Translations in multiple languages
    it: ''                           # Italian translation (empty for Italian term)
    fr: Mandritto
    en: Mandritto
```

### TypeScript Interface

```typescript
// src/types/glossary.ts

interface GlossaryTerm {
  // Identity
  id: string;                           // Normalized ID from YAML key (e.g., "mandritto")
  term: string;                         // Display term name (Italian original)
  
  // Organization
  category: string;                     // Parent category (e.g., "Coups et Techniques")
  type: string;                         // Sub-category/classification
  
  // Content (Multilingual)
  definition: {
    it: string;                         // Italian definition
    fr: string;                         // French definition
    en: string;                         // English definition
  };
  translation: {
    it: string;                         // Italian translation (usually empty for IT terms)
    fr: string;                         // French translation
    en: string;                         // English translation (may have variants)
  };
}

interface GlossaryCategory {
  name: string;                         // Category name (e.g., "Coups et Techniques")
  types: GlossaryType[];                // Sub-types in this category
}

interface GlossaryType {
  name: string;                         // Type/classification name
  terms: GlossaryTerm[];                // Terms with this type
}

interface GroupedGlossary {
  [category: string]: {                 // Categories as keys
    [type: string]: GlossaryTerm[];    // Types as keys, terms as values
  };
}
```

---

## Data Relationships

### Hierarchy Structure

```
Glossary
├── Category 1: "Coups et Techniques"
│   ├── Type 1: "Attaque / Frappe de taille"
│   │   ├── Term: Mandritto
│   │   ├── Term: Riverso
│   │   └── Term: Fendente
│   ├── Type 2: "Attaque / Coup de pointe"
│   │   ├── Term: Imbroccata
│   │   └── Term: Punta Riversa
│   └── ...
├── Category 2: "Les Guardes"
│   ├── Type 1: "Guard Position"
│   │   ├── Term: Guardia Alta
│   │   ├── Term: Guardia Terza
│   │   └── ...
│   └── ...
└── ...
```

**No Direct Relationships**: Terms are standalone; they don't reference each other or external entities.

---

## Data Constraints & Validation

### Field Validation Rules

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | ✅ Yes | Normalized: lowercase letters, numbers, underscores only |
| `term` | string | ✅ Yes | Non-empty, 1-100 characters |
| `category` | string | ✅ Yes | Must match one of 8 category values |
| `type` | string | ✅ Yes | Non-empty, 1-100 characters |
| `definition.it` | string | ✅ Yes | Non-empty Italian definition |
| `definition.fr` | string | ✅ Yes | Non-empty French definition |
| `definition.en` | string | ⚠️ Optional | English definition (may be empty) |
| `translation.it` | string | ✅ Yes | Usually empty for Italian terms (can be non-empty) |
| `translation.fr` | string | ✅ Yes | Non-empty French translation |
| `translation.en` | string | ⚠️ Optional | English translation (may be empty) |

### Valid Category Values

1. "Coups et Techniques"
2. "Les Guardes"
3. "Coups et Techniques Additionnels"
4. "Concepts Tactiques"
5. "Actions et Mouvements Additionnels"
6. "Armes et Équipement"
7. "Termes Techniques Additionnels"
8. "Les Cibles"

### Validation Logic

```typescript
// src/lib/glossaryLoader.ts

function validateGlossaryTerm(term: any, id: string): term is GlossaryTerm {
  // ID validation
  if (!id || !/^[a-z0-9_]+$/.test(id)) {
    throw new Error(`Invalid term ID: ${id}`);
  }
  
  // Required fields
  if (!term.term || typeof term.term !== 'string') {
    throw new Error(`Missing or invalid 'term' field for ${id}`);
  }
  
  if (!term.category || !validCategories.includes(term.category)) {
    throw new Error(`Invalid or missing category for ${id}: ${term.category}`);
  }
  
  if (!term.type || typeof term.type !== 'string') {
    throw new Error(`Missing or invalid 'type' field for ${id}`);
  }
  
  // Definition validation
  if (!term.definition || !term.definition.it || !term.definition.fr) {
    throw new Error(`Missing required definitions for ${id}`);
  }
  
  // Translation validation
  if (!term.translation || !term.translation.fr) {
    throw new Error(`Missing required French translation for ${id}`);
  }
  
  return true;
}
```

---

## Data Transformation Pipeline

### Step 1: Load Raw YAML

```typescript
// Load from file
const rawYaml = fs.readFileSync('data/glossary.yaml', 'utf-8');
const rawData = yaml.load(rawYaml) as Record<string, any>;
```

### Step 2: Normalize & Validate

```typescript
// Transform and validate each term
const terms: GlossaryTerm[] = Object.entries(rawData).map(([id, term]) => {
  validateGlossaryTerm(term, id);
  
  return {
    id,
    term: term.term,
    category: term.category,
    type: term.type,
    definition: {
      it: term.definition?.it || '',
      fr: term.definition?.fr || '',
      en: term.definition?.en || '',
    },
    translation: {
      it: term.translation?.it || '',
      fr: term.translation?.fr || '',
      en: term.translation?.en || '',
    },
  };
});
```

### Step 3: Group Hierarchically

```typescript
// Group by category, then by type
function groupGlossaryByCategory(terms: GlossaryTerm[]): GroupedGlossary {
  return terms.reduce((grouped, term) => {
    if (!grouped[term.category]) {
      grouped[term.category] = {};
    }
    
    if (!grouped[term.category][term.type]) {
      grouped[term.category][term.type] = [];
    }
    
    grouped[term.category][term.type].push(term);
    return grouped;
  }, {} as GroupedGlossary);
}
```

### Step 4: Render (French-Only)

```typescript
// Display only French content
function renderTermDisplay(term: GlossaryTerm) {
  return {
    id: term.id,
    term: term.term,                    // Display Italian term name
    category: term.category,             // Display category
    type: term.type,                     // Display type
    definition: term.definition.fr,      // FRENCH ONLY
    translation: term.translation.fr,    // FRENCH ONLY
  };
}
```

---

## Search Index Structure

### Search Indexed Fields

For efficient search, the following fields are indexed:

```typescript
interface SearchableGlossaryTerm {
  id: string;                           // Indexed for ID search
  term: string;                         // Indexed for name search
  category: string;                     // Indexed for category search
  type: string;                         // Indexed for type search
  definition_fr: string;                // Indexed for French definition search
  translation_fr: string;               // Indexed for French translation search
  
  // Combined field for full-text search
  fullText: string;                     // term + category + type + definition_fr + translation_fr
}
```

### Search Index Construction

```typescript
// src/lib/glossarySearchIndex.ts

function buildGlossarySearchIndex(terms: GlossaryTerm[]): SearchableGlossaryTerm[] {
  return terms.map(term => ({
    id: term.id,
    term: term.term,
    category: term.category,
    type: term.type,
    definition_fr: term.definition.fr,
    translation_fr: term.translation.fr,
    fullText: [
      term.term,
      term.category,
      term.type,
      term.definition.fr,
      term.translation.fr,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  }));
}
```

### Search Query Matching

```typescript
// Partial, case-insensitive match
function searchGlossary(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  
  return terms.filter(term => {
    const searchable = {
      term: term.term.toLowerCase(),
      category: term.category.toLowerCase(),
      type: term.type.toLowerCase(),
      definition_fr: term.definition.fr.toLowerCase(),
      translation_fr: term.translation.fr.toLowerCase(),
    };
    
    // Match in any field
    return (
      searchable.term.includes(lowerQuery) ||
      searchable.category.includes(lowerQuery) ||
      searchable.type.includes(lowerQuery) ||
      searchable.definition_fr.includes(lowerQuery) ||
      searchable.translation_fr.includes(lowerQuery)
    );
  });
}
```

---

## Display Context (Stateless)

### GlossaryContext Structure

```typescript
// src/contexts/GlossaryContext.tsx

interface GlossaryContextType {
  // State
  terms: GlossaryTerm[];                // All loaded terms
  searchQuery: string;                  // Current search query
  isLoading: boolean;                   // Data loading state
  error: string | null;                 // Loading error message
  
  // Actions
  setSearchQuery: (query: string) => void;
  loadTerms: () => Promise<void>;
  
  // Computed (derived from state)
  filteredTerms: GlossaryTerm[];        // Terms matching current search
  groupedTerms: GroupedGlossary;        // Terms grouped by category/type
}
```

### State Transitions

```
Initial: { terms: [], searchQuery: '', isLoading: false, error: null }
  ↓
Loading: { terms: [], searchQuery: '', isLoading: true, error: null }
  ↓
Success: { terms: [...], searchQuery: '', isLoading: false, error: null }
  ↓
Search: { terms: [...], searchQuery: 'query', isLoading: false, error: null }
  ↓
Filtered: filteredTerms = terms.filter(...) 
  ↓
Grouped: groupedTerms = groupByCategory(filteredTerms)
```

---

## Data Loading Flow

### Server-Side Loading (Next.js App Router)

```typescript
// src/app/api/content/glossary/route.ts

export async function GET() {
  try {
    // Load YAML
    const glossaryPath = path.join(process.cwd(), 'data', 'glossary.yaml');
    const fileContent = fs.readFileSync(glossaryPath, 'utf-8');
    const rawData = yaml.load(fileContent) as Record<string, any>;
    
    // Validate and transform
    const terms: GlossaryTerm[] = loadAndValidateTerms(rawData);
    
    // Group hierarchically
    const grouped = groupGlossaryByCategory(terms);
    
    // Return both formats for different use cases
    return Response.json({
      terms,           // For searching
      grouped,         // For display
      count: terms.length,
      categories: Object.keys(grouped),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to load glossary' },
      { status: 500 }
    );
  }
}
```

### Client-Side Loading (GlossaryContext)

```typescript
// src/contexts/GlossaryContext.tsx

async function loadTerms() {
  setIsLoading(true);
  try {
    const response = await fetch('/api/content/glossary');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    setTerms(data.terms);
    setGroupedTerms(data.grouped);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to load glossary');
  } finally {
    setIsLoading(false);
  }
}
```

---

## Edge Cases & Error Handling

### Missing Data Scenarios

| Scenario | Handling | User Impact |
|---|---|---|
| Missing French definition | Show Italian definition as fallback | ⚠️ Non-French content (acceptable per spec) |
| Missing French translation | Show empty string + "No translation available" | ⚠️ User sees label without content |
| Missing category field | Error during load, display error message | ❌ Glossary page unavailable (blocker) |
| Missing type field | Error during load, display error message | ❌ Glossary page unavailable (blocker) |
| Entire YAML file missing | API returns 500 error | ❌ Glossary page shows error message |

### Validation Error Handling

```typescript
// Load fails with error list
class GlossaryValidationError extends Error {
  constructor(public errors: { id: string; message: string }[]) {
    super(`Glossary validation failed: ${errors.length} errors`);
  }
}

// Display errors to user
if (error instanceof GlossaryValidationError) {
  return (
    <div className="bg-red-50 border border-red-200 p-4">
      <h2 className="font-bold text-red-900">Glossary Load Error</h2>
      <p>Failed to load glossary. Please check the data file.</p>
      <details className="text-sm text-red-700">
        <summary>Details</summary>
        <ul>{error.errors.map(e => <li key={e.id}>{e.id}: {e.message}</li>)}</ul>
      </details>
    </div>
  );
}
```

---

## Performance Characteristics

### Data Size Estimates

| Metric | Value |
|---|---|
| Number of terms | ~80-100 |
| Avg. definition length | 100-200 chars |
| Avg. translation length | 50-100 chars |
| Total file size (YAML) | ~200KB |
| JSON response size | ~150KB (compressed: ~30KB) |

### Rendering Performance

| Operation | Target | Notes |
|---|---|---|
| Page load (cold) | <2s | Includes YAML parse, validation, grouping |
| Page render | <200ms | React render of 80 terms + categories |
| Search update | <100ms | Filter + highlight (debounced 300ms input) |
| Category expand | N/A | No expand/collapse (always visible) |

---

## Data Integrity Safeguards

### Phase 0: Refactoring Validation

Before Phase 1 implementation:
1. ✅ Add `category` field to all 80+ terms in `data/glossary.yaml`
2. ✅ Run validation script to check all terms pass validation
3. ✅ Verify no duplicate IDs
4. ✅ Verify all category values match whitelist
5. ✅ Commit to main branch with clear message

### Phase 1+: Runtime Validation

During loading:
1. Parse YAML → validate each term → report errors
2. Catch missing languages gracefully (fallback to Italian if needed)
3. Log validation errors for debugging
4. Display error message if load fails completely

### Unit Tests

```typescript
// src/lib/__tests__/glossaryLoader.test.ts

describe('glossaryLoader', () => {
  it('loads all terms from glossary.yaml', () => { /* ... */ });
  it('validates required fields', () => { /* ... */ });
  it('rejects invalid category values', () => { /* ... */ });
  it('handles missing translations gracefully', () => { /* ... */ });
  it('groups terms by category and type', () => { /* ... */ });
  it('normalizes IDs to lowercase', () => { /* ... */ });
  it('throws error on corrupted YAML', () => { /* ... */ });
});
```

---

## Summary

The glossary data model is simple and focused:

- **Single Entity**: GlossaryTerm (extends existing YAML structure)
- **Flat Structure**: No complex relationships
- **Hierarchical Organization**: Category → Type → Term (for display)
- **Multilingual Content**: All languages stored, French-only displayed
- **Search-Friendly**: All fields indexed and searchable
- **Validation-First**: Strict type checking and error handling
- **Performance-Optimized**: No pagination, indexed search

The data model is **locked and ready** for Phase 1 implementation.

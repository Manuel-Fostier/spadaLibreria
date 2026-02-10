# Phase 4 Implementation Plan: Glossary Term Management

**Status**: Ready for Implementation  
**Updated**: 2026-02-01  
**Branch**: `021-glossary-page-phase-2` (will be Phase 4)

---

## Overview

Phase 4 adds term management interfaces to the glossary page:

- **Phase 4a**: Edit existing glossary terms - Single "Edit" button on the left of each term opens a form to modify `category`, `type`, `term`, `definition_fr`
- **Phase 4b**: Create new glossary terms (Issue #55) - Add new terms via form, persisted to YAML
 - **Phase 4c**: Add new treatise sections in BolognesePlatform (Issue #54) - Create a new section and append it to the correct treatise YAML file based on `master`, `work`, `book`

Both phases reuse the `TextEditor` component pattern from `BolognesePlatform` and follow the same API save flow.

---

## Phased Implementation Approach

### Phase 4a: Edit Existing Terms
**Objective**: Allow users to edit term fields from a single per-term edit button (no field-level buttons)

### Phase 4b: Create New Terms (Issue #55)
**Objective**: Allow users to add new glossary entries via form

### Phase 4c: Add New Treatise Sections (Issue #54)
**Objective**: Allow users to add a new treatise section and save it to the correct YAML file based on `master`, `work`, `book`

### Implementation Sequence
1. **First**: Implement Phase 4a (edit existing terms)
2. **Then**: Implement Phase 4b (create new terms)
3. **Then**: Implement Phase 4c (create new treatise section in BolognesePlatform)
4. Phases 4a and 4b share backend infrastructure (YAML handling) and frontend patterns (TextEditor)

**Tasks**:
1. Create `/api/glossary/term` endpoint (POST)
2. Implement YAML parsing and update logic
3. Add request validation
4. Add error handling
5. Test with various inputs

**Deliverable**: Working API endpoint that updates `data/glossary.yaml`

---

### Phase 4.2: Frontend UI Components
**Objective**: Create reusable editing components and integrate with glossary display

**Tasks**:
1. Create `GlossaryTermEditor` component wrapper
2. Update `TermDisplay` component to include a single edit button per term (left of term)
3. Add edit state management in `GlossaryPage` or `GlossaryContent`
4. Implement edit/view toggle for the whole term (single form)
5. Connect to TextEditor component

**Deliverable**: Functional editing UI integrated into glossary page

---

### Phase 4.3: Integration & Testing
**Objective**: Ensure all editing flows work end-to-end

**Tasks**:
1. Test editing each field (category, type, term, definition)
2. Test TextEditor undo/redo functionality
3. Test save/cancel flows
4. Test page reload after save
5. Test error cases
6. Manual QA on different devices

**Deliverable**: Fully working Phase 4 feature

---

## Detailed Task Breakdown

### Phase 4a Tasks

#### Task Group A: Backend API (`/api/glossary/term`)

#### A1: Create API Route Handler
**File**: `src/app/api/glossary/term/route.ts`

**Pseudocode**:
```typescript
export async function POST(request: Request) {
  // 1. Parse request body
  const { termKey, field, value } = await request.json();
  
  // 2. Validate inputs
  if (!termKey || !field || !value) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  if (!['category', 'type', 'term', 'definition_fr'].includes(field)) {
    return Response.json({ error: 'Invalid field' }, { status: 400 });
  }
  
  // 3. Load glossary YAML
  const glossaryPath = path.join(process.cwd(), 'data', 'glossary.yaml');
  const fileContent = fs.readFileSync(glossaryPath, 'utf-8');
  const glossaryData = yaml.parse(fileContent);
  
  // 4. Update term
  if (!glossaryData[termKey]) {
    return Response.json({ error: 'Term not found' }, { status: 404 });
  }
  
  // Map field names to YAML structure
  if (field === 'definition_fr') {
    glossaryData[termKey].definition.fr = value;
  } else {
    glossaryData[termKey][field] = value;
  }
  
  // 5. Write back to YAML
  const updatedContent = yaml.stringify(glossaryData);
  fs.writeFileSync(glossaryPath, updatedContent);
  
  // 6. Return success
  return Response.json({ success: true });
}
```

**Implementation Notes**:
- Import `yaml` from `js-yaml`
- Import `fs` and `path` from Node.js
- Handle encoding issues (UTF-8)
- Validate all inputs before writing

---

#### A2: Add Data Type for Glossary Term Update
**File**: `src/types/glossary.ts` (modify existing)

**Add**:
```typescript
export interface GlossaryTermUpdateRequest {
  termKey: string;
  field: 'category' | 'type' | 'term' | 'definition_fr';
  value: string;
}

export interface GlossaryTermUpdateResponse {
  success: boolean;
  error?: string;
}
```

---

### Task Group B: Frontend Components

#### B1: Create GlossaryTermEditor Component
**File**: `src/components/GlossaryTermEditor.tsx` (NEW)

**Purpose**: Manages editing state and UI for a single glossary term

**Props**:
```typescript
interface GlossaryTermEditorProps {
  termKey: string;
  term: GlossaryTerm;
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
}
```

**Pseudocode Structure**:
```tsx
export default function GlossaryTermEditor({
  termKey,
  term,
  isEditing,
  onEditStart,
  onEditCancel,
}: GlossaryTermEditorProps) {
  const [formData, setFormData] = useState({
    category: term.category,
    type: term.type,
    term: term.term,
    definition_fr: term.definition.fr,
  });

  const handleSave = async () => {
    const fields: Array<{ field: 'category' | 'type' | 'term' | 'definition_fr'; value: string }> = [
      { field: 'category', value: formData.category },
      { field: 'type', value: formData.type },
      { field: 'term', value: formData.term },
      { field: 'definition_fr', value: formData.definition_fr },
    ];

    try {
      for (const item of fields) {
        const response = await fetch('/api/glossary/term', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ termKey, field: item.field, value: item.value }),
        });
        if (!response.ok) throw new Error('Save failed');
      }
      window.location.reload();
    } catch (error) {
      console.error('Error saving term:', error);
    }
  };

  return (
    <div>
      {!isEditing ? (
        <button
          onClick={onEditStart}
          className="mr-2 text-sm text-gray-500 hover:text-gray-700"
          title="Éditer le terme"
        >
          Edit
        </button>
      ) : null}

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Category"
          />
          <input
            type="text"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="Type"
          />
          <input
            type="text"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
            placeholder="Term"
          />
          <TextEditor
            initialValue={formData.definition_fr}
            onSave={async (value) => setFormData({ ...formData, definition_fr: value })}
            onCancel={onEditCancel}
            placeholder="Definition (French)"
          />
          <div className="flex gap-2">
            <button onClick={handleSave}>Save</button>
            <button onClick={onEditCancel}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

---

#### B2: Update TermDisplay Component
**File**: `src/components/TermDisplay.tsx` (modify existing)

**Changes**:
- Import `GlossaryTermEditor`
- Add `isEditable` prop
- Replace current display with `GlossaryTermEditor` when editing is enabled
- Add state for whether the term is being edited

**Pseudocode**:
```tsx
interface TermDisplayProps {
  term: GlossaryTerm;
  termKey: string;
  searchQuery: string;
  highlightMatches: boolean;
  isEditable?: boolean; // New prop
}

export default function TermDisplay({
  term,
  termKey,
  searchQuery,
  highlightMatches,
  isEditable = false,
}: TermDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditable) {
    return (
      <GlossaryTermEditor
        termKey={termKey}
        term={term}
        isEditing={isEditing}
        onEditStart={() => setIsEditing(true)}
        onEditCancel={() => setIsEditing(false)}
      />
    );
  }
  
  // Existing read-only display code
  return (
    <div>
      {/* ... existing display ... */}
    </div>
  );
}
```

---

#### B4: Update GlossaryContent Component
**File**: `src/components/GlossaryContent.tsx` (modify existing)

**Changes**:
- Add `isEditable` prop
- Pass through to TermDisplay components

---

#### B5: Update GlossaryPage Component
**File**: `src/components/GlossaryPage.tsx` (modify existing)

**Changes**:
- Add `isEditMode` state
- Add toggle button to enable/disable edit mode
- Pass `isEditable` prop to GlossaryContent

**Pseudocode**:
```tsx
export default function GlossaryPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  
  // ... existing code ...
  
  return (
    <div>
      <header>
        {/* Existing header content */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-4 py-2 rounded ${
            isEditMode ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>
      </header>
      
      <GlossaryContent
        isEditable={isEditMode}
        // ... other props ...
      />
    </div>
  );
}
```

---

#### Task Group C: Integration Testing

#### C1: Unit Tests
- Test API endpoint with valid/invalid inputs
- Test TextEditor undo/redo
- Test component state transitions

#### C2: Integration Tests
- Edit each field and verify save
- Edit multiple fields in sequence
- Cancel edit and verify no save
- Verify page reload shows updated values

#### C3: Manual QA
- Desktop browser testing
- Mobile browser testing
- Error case testing (API failure)
- Concurrent usage (if applicable)

---

## Phase 4b Tasks: Create New Glossary Terms

**Related Issue**: #55 - "Bouton nouvel élément au glossaire"

### Task Group D: Backend API (`/api/glossary/terms`)

#### D1: Create API Route Handler
**File**: `src/app/api/glossary/terms/route.ts`

**Pseudocode**:
```typescript
export async function POST(request: Request) {
  // 1. Parse request body
  const { category, type, term, definition, translation } = await request.json();
  
  // 2. Validate required fields
  if (!category || !type || !term || !definition?.fr) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  // 3. Generate term key (slugify)
  const termKey = generateTermKey(term);
  
  // 4. Load glossary YAML
  const glossaryData = yaml.parse(fileContent);
  
  // 5. Check for duplicates
  if (glossaryData[termKey]) {
    return Response.json({ error: 'Term already exists' }, { status: 409 });
  }
  
  // 6. Create new entry
  glossaryData[termKey] = {
    term,
    category,
    type,
    definition: {
      it: definition.it || '',
      fr: definition.fr,
      en: definition.en || ''
    },
    translation: translation || {}
  };
  
  // 7. Write to YAML
  fs.writeFileSync(glossaryPath, yaml.stringify(glossaryData));
  
  // 8. Return success
  return Response.json({ success: true, termKey });
}

function generateTermKey(termName: string): string {
  return termName
    .toLowerCase()
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    // ... more replacements
    .replace(/^_+|_+$/g, '');
}
```

### Task Group E: Frontend Components

#### E1: Create NewTermForm Component
**File**: `src/components/NewTermForm.tsx` (NEW)

**Purpose**: Multi-field form for creating new glossary terms

**Props**:
```typescript
interface NewTermFormProps {
  onSave: (term: NewGlossaryTermRequest) => Promise<void>;
  onCancel: () => void;
  categories?: string[]; // Suggested categories from existing terms
}
```

**Features**:
- Text inputs for category, type, term
- Textarea for definition (French)
- Optional expandable section for other languages
- Form validation
- Loading state
- Error display

**Pseudocode**:
```tsx
export default function NewTermForm({ onSave, onCancel, categories = [] }: NewTermFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    type: '',
    term: '',
    definition: { fr: '' },
    translation: {}
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.category) errors.push('Category is required');
    if (!formData.type) errors.push('Type is required');
    if (!formData.term) errors.push('Term is required');
    if (!formData.definition.fr) errors.push('French definition is required');
    return errors;
  };
  
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      setErrors([error.message || 'Failed to create term']);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="text-lg font-bold mb-4">Add New Glossary Term</h3>
      
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}
      
      <input
        type="text"
        placeholder="Category"
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        list="categories"
      />
      <datalist id="categories">
        {categories.map(cat => <option key={cat} value={cat} />)}
      </datalist>
      
      <input
        type="text"
        placeholder="Type"
        value={formData.type}
        onChange={(e) => setFormData({...formData, type: e.target.value})}
      />
      
      <input
        type="text"
        placeholder="Term (Italian)"
        value={formData.term}
        onChange={(e) => setFormData({...formData, term: e.target.value})}
      />
      
      <textarea
        placeholder="Definition (French)"
        value={formData.definition.fr}
        onChange={(e) => setFormData({
          ...formData,
          definition: {...formData.definition, fr: e.target.value}
        })}
      />
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

#### E2: Update GlossaryPage Component
**File**: `src/components/GlossaryPage.tsx` (modify)

**Changes**:
- Add "Ajouter Element" button to header
- Add state for showing/hiding form
- Import and render `NewTermForm`
- Handle form submission

**Pseudocode**:
```tsx
export default function GlossaryPage() {
  const [showNewTermForm, setShowNewTermForm] = useState(false);
  const { groupedTerms } = useGlossary();
  
  const categories = Array.from(
    new Set(Object.values(groupedTerms).flatMap(types => 
      Object.values(types).map(terms => terms[0]?.category)
    ))
  );
  
  const handleCreateTerm = async (termData: NewGlossaryTermRequest) => {
    const response = await fetch('/api/glossary/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(termData)
    });
    
    if (!response.ok) throw new Error('Failed to create term');
    
    window.location.reload();
  };
  
  return (
    <div>
      <header>
        <h1>Glossaire</h1>
        <button
          onClick={() => setShowNewTermForm(!showNewTermForm)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {showNewTermForm ? 'Annuler' : '+ Ajouter Element'}
        </button>
      </header>
      
      {showNewTermForm && (
        <NewTermForm
          onSave={handleCreateTerm}
          onCancel={() => setShowNewTermForm(false)}
          categories={categories}
        />
      )}
      
      <GlossaryContent />
    </div>
  );
}
```

### Task Group F: Phase 4b Integration Testing

#### F1: Unit Tests
- Test term key generation (slug sanitization)
- Test duplicate detection
- Test form validation

#### F2: Integration Tests
- Create term and verify in glossary
- Test category autocomplete
- Test error cases

---

## Phase 4c Tasks: New Treatise Section (Issue #54)

### Task Group G: Backend API (`/api/content/section`)

#### G1: Create API Route Handler
**File**: `src/app/api/content/section/route.ts`

**Responsibilities**:
- Validate required fields (`master`, `work`, `book`, `year`, `title`, `content.fr`)
- Select target YAML file based on `master`, `work`, `book`
- Append new section with generated `id`
- Write back to YAML

### Task Group H: Frontend UI (BolognesePlatform)

#### H1: Add "Nouvelle section" Button
- Add button in BolognesePlatform header or toolbar
- Toggle new section form display

#### H2: New Section Form
- Fields: master, work, book, year, title, content.fr (required)
- Optional: content.it, content.en_versions, content.notes
- Save + Cancel actions

### Task Group I: Phase 4c Testing
- Create new section and verify it appears
- Verify correct YAML file selection by metadata
- Validate error handling when no file matches

---

## Combined Phase 4 File Structure

### New Files
- `src/app/api/glossary/term/route.ts` - API endpoint (Phase 4a)
- `src/app/api/glossary/terms/route.ts` - API endpoint (Phase 4b)
- `src/app/api/content/section/route.ts` - API endpoint (Phase 4c)
- `src/components/GlossaryTermEditor.tsx` - Editor component (Phase 4a)
- `src/components/NewTermForm.tsx` - Form component (Phase 4b)
- `src/components/NewSectionForm.tsx` - Form component (Phase 4c)

### Modified Files
- `src/components/TermDisplay.tsx` - Add edit mode (Phase 4a)
- `src/components/GlossaryContent.tsx` - Pass through edit prop (Phase 4a)
- `src/components/GlossaryPage.tsx` - Add edit toggle & new term button (4a + 4b)
- `src/components/BolognesePlatform.tsx` - Add new section button and form (Phase 4c)
- `src/types/glossary.ts` - Add type definitions (optional)

### Unchanged
- `src/components/TextEditor.tsx` - Reused as-is
- `src/lib/dataLoader.ts` - Reused for YAML loading

---

## Dependencies & Prerequisites

✅ **Ready**:
- TextEditor component exists
- LocalStorage utility exists
- API pattern established
- YAML library available

⏳ **Need to Create**:
- `/api/glossary/term` endpoint
- `GlossaryTermEditor` component

---

## Estimated Effort

| Phase | Task | Effort | Duration |
|-------|------|--------|----------|
| 4a | Backend API | High | 2-3 hours |
| 4a | Frontend Components | Medium | 3-4 hours |
| 4a | Testing & QA | Medium | 2-3 hours |
| 4b | Backend API | Medium | 1-2 hours |
| 4b | Frontend Form | Medium | 2-3 hours |
| 4b | Testing & QA | Medium | 1-2 hours |
| **Total** | **Phase 4 (4a + 4b)** | **High** | **11-17 hours** |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| YAML parsing errors | Use established js-yaml library, add validation |
| State management complexity | Use simple boolean flags per field, not complex objects |
| API endpoint failures | Add try/catch, show user error messages |
| Data corruption | Make backups before writing, validate structure |

---

## Success Criteria

- ✅ Users can click the Edit button on the left of each term (Phase 4a)
- ✅ TextEditor opens for inline editing (Phase 4a)
- ✅ All 4 fields (category, type, term, definition_fr) are editable (Phase 4a)
- ✅ Save persists changes to `data/glossary.yaml` (Phase 4a)
- ✅ Page reload shows updated values (Phase 4a)
- ✅ Undo/Redo works in TextEditor (Phase 4a)
- ✅ Cancel discards changes without saving (Phase 4a)
- ✅ Users can click "Ajouter Element" button (Phase 4b)
- ✅ Form opens and collects all required fields (Phase 4b)
- ✅ New terms persisted to `data/glossary.yaml` (Phase 4b)
- ✅ Duplicate terms prevented (Phase 4b)
- ✅ Page reloads and shows new term (Phase 4b)
- ✅ Users can click "Nouvelle section" button in BolognesePlatform (Phase 4c)
- ✅ New treatise section saved to the correct YAML file based on `master`, `work`, `book` (Phase 4c)
- ✅ Page reloads and shows new section (Phase 4c)
- ✅ No breaking changes to existing phases

---

## Notes

1. **Edit Mode Toggle**: Consider whether edit mode should be:
   - Global toggle for entire glossary (current plan)
   - Per-term edit button (more granular)
   - Recommend starting with global toggle for simplicity

2. **User Experience**:
   - After save, page reloads - consider adding a toast notification
   - Could show a "Loading..." state during save
   - Could add confirmation dialog before save

3. **YAML Structure**: Verify `definition.fr` nesting in actual YAML file before implementation

4. **Permissions**: Currently no user authentication - assumes single user environment (as stated in project docs)


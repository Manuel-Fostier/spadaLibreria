# Phase 4 Analysis: Glossary Content Editing Interface

**Last Updated**: 2026-02-01  
**Status**: Planning  
**Focus**: Identifying reusable patterns from BolognesePlatform for glossary term editing

## Reusable Components & Patterns from BolognesePlatform

### 1. **TextEditor Component** ✅ DIRECTLY REUSABLE
**Path**: `src/components/TextEditor.tsx`

**Purpose**: Provides a modal text editing interface with undo/redo, save/cancel, and optional field metadata.

**Reusable Features**:
- Textarea with auto-focus
- Undo/Redo history (Ctrl+Z, Ctrl+Y)
- Save/Cancel buttons with loading state
- Optional metadata field (translator name in BolognesePlatform, can be repurposed)
- Keyboard shortcuts (Enter for save when Shift+Enter to break lines)
- Auto-sizing textarea

**Adaptation for Phase 4**:
- Create `GlossaryTermEditor` component extending TextEditor pattern
- Support 4 fields: `category`, `type`, `term`, `definition_fr`
- Single edit entry point per term (button on the left of each term)
- Form shows all fields together (no per-field edit buttons)
- Same save flow: API call → page reload

**Code Snippets to Reuse**:
```tsx
// State management pattern (from BolognesePlatform)
const [editingTerm, setEditingTerm] = useState<{
  termKey: string;
  field: 'category' | 'type' | 'term' | 'definition_fr';
} | null>(null);

// Save handler pattern
const handleSaveTermEdit = async (
  termKey: string,
  field: string,
  value: string
) => {
  const response = await fetch('/api/glossary/term', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ termKey, field, value })
  });
  if (!response.ok) throw new Error('Failed to save');
  window.location.reload(); // Refresh to get updated data
};
```

---

### 2. **Edit Button + Conditional UI Pattern** ✅ REUSABLE PATTERN
**From**: BolognesePlatform (line ~615-719)

**Pattern**:
```tsx
{editingSection?.sectionId !== section.id || editingSection?.field !== 'fr' ? (
  <button onClick={() => handleStartEdit(section.id, 'fr')}>
    <Edit2 size={14} className="text-gray-400 hover:text-gray-600" />
  </button>
) : null}

{editingSection?.sectionId === section.id && editingSection?.field === 'fr' ? (
  <TextEditor {...props} />
) : (
  <div>{displayContent}</div>
)}
```

**Reusable Logic**:
- Edit button only shows when NOT editing
- TextEditor appears when editing, replaces content display
- Single edit state tracks which field is being edited
- Cancel/Save transitions state

**Adaptation for Phase 4**:
- Apply a single edit button per term (left of the term heading)
- One `editingTerm` state tracks the active term
- Editing form replaces the term display area (category/type/definition inside the form)

---

### 3. **LocalStorage Utility Usage** ✅ REUSABLE PATTERN
**From**: BolognesePlatform, imported from `@/lib/localStorage`

**Pattern**:
```tsx
// Reading
const value = LocalStorage.getItem<boolean>('key') ?? defaultValue;

// Writing
LocalStorage.setItem('key', value);
```

**Reusable for Phase 4**:
- Store editing state temporarily if needed
- Store user's last edited term (optional UX enhancement)
- Follow same error handling pattern

---

### 4. **API Content Endpoint Pattern** ✅ REUSABLE PATTERN
**From**: BolognesePlatform `handleSaveEdit()` method

**Endpoint Pattern**:
```tsx
const response = await fetch('/api/content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sectionId,
    field,
    value,
    translator // Optional metadata
  }),
});
```

**For Phase 4, Create New Endpoint**:
- `/api/glossary/term` (POST)
- Body: `{ termKey, field, value }`
- Modifies `data/glossary.yaml` directly
- Returns 200 on success

---

### 5. **Keyboard Shortcuts & Undo/Redo** ✅ ALREADY IMPLEMENTED
**From**: TextEditor component

**Included Shortcuts**:
- Ctrl+Z: Undo
- Ctrl+Y or Ctrl+Shift+Z: Redo
- (Optional) Ctrl+Enter or Shift+Enter for quick save

**No additional implementation needed** - reuse TextEditor's history system.

---

### 6. **Modal/Overlay Pattern** ⚠️ PARTIAL REUSE
**From**: BolognesePlatform has AnnotationPanel (right sidebar)

**Note**: 
- BolognesePlatform uses right sidebar panel for AnnotationPanel
- Phase 4 glossary editing should use **inline editing** (like English text editing at line 683-699)
- Single edit button appears on the left of each term
- Inline form replaces the term display during editing
- **No separate modal/panel** needed

---

### 7. **Error Handling & User Feedback** ✅ REUSABLE PATTERN
**From**: BolognesePlatform `handleSaveEdit()`

**Pattern**:
```tsx
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error('Failed to save content');
  }
  // Success: reload page
  window.location.reload();
} catch (error) {
  console.error('Error saving content:', error);
  throw error; // Re-throw for handling
}
```

**Reusable for Phase 4**:
- Same try/catch pattern
- Same reload strategy on success
- Add user notification (toast/alert) for better UX

---

## Markdown Support for Term Definitions

### Overview
Term definitions in glossary entries support **Markdown syntax** to allow rich formatting of complex fencing concepts (bold, italic, lists, links, etc.).

### Implementation Approach

**Reuse `MarkdownRenderer` Component**: 
- **Path**: `src/components/MarkdownRenderer.tsx`
- **Already Used In**: BolognesePlatform for rendering treatise content and notes
- **Example Usage** (from BolognesePlatform line ~580-590):
  ```tsx
  <MarkdownRenderer 
    text={section.content.it} 
    glossaryData={glossaryData} 
    highlightQuery={lastQuery}
  />
  ```

### MarkdownRenderer Capabilities
1. **Markdown Parsing**: Supports standard Markdown (headings, bold, italic, lists, links)
2. **Glossary Term Linking**: Processes `{term_key}` syntax and creates interactive glossary links
3. **Search Highlighting**: Integrates with search system to highlight matches inline
4. **Image Support**: Handles image embedding with proper sizing
5. **GFM Extensions**: Uses `remark-gfm` for GitHub Flavored Markdown support

### Editor Pattern

**Use `TextEditor` Component** (existing from BolognesePlatform):
- **Path**: `src/components/TextEditor.tsx`
- **Features**: 
  - Multiline textarea for Markdown input
  - Undo/Redo support (Ctrl+Z, Ctrl+Y)
  - Save/Cancel buttons
  - Auto-sizing
  - Keyboard shortcuts
- **Reference**: Similar to notes editing in BolognesePlatform (lines 716-727)

### Example Workflow

**Editing a Term Definition**:
```tsx
// 1. User clicks Edit button on term
// 2. TextEditor opens with current definition markdown

// 3. User edits markdown:
// Before: "A strike executed to the right side of the body"
// After: "A **strike** executed to the *right side* of the body:\n- Fast\n- Powerful"

// 4. User clicks Save
// 5. MarkdownRenderer displays the formatted result:
//    "A strike executed to the right side of the body:
//     • Fast
//     • Powerful"

// 6. On glossary page, term definition renders with Markdown formatting applied
```

### Benefits
- **Consistency**: Same rendering engine across glossary and treatise content
- **Reusability**: Leverages existing, tested components
- **Features**: Inherits all MarkdownRenderer features (search highlighting, glossary linking, etc.)
- **Maintainability**: Changes to MarkdownRenderer automatically benefit glossary definitions

---

### 1. **GlossaryTermEditor Component** (NEW)
- **Purpose**: Wraps multiple TextEditor instances or creates form for single term
- **Props**: termKey, term data, onSave, onCancel
- **Features**: 
  - 4 editable fields (category, type, term, definition_fr)
  - Single edit button per term (left of term heading)
  - Save/Cancel handlers
  - Persists to YAML via API

### 2. **API Endpoint: `/api/glossary/term`** (NEW)
- **Method**: POST
- **Body**: `{ termKey: string, field: string, value: string }`
- **Action**: Updates `data/glossary.yaml` with new value for specified term field
- **Returns**: 200 on success, error on failure

### 3. **GlossaryTermDisplay Component** (MODIFICATION)
- **Current**: Displays term info read-only
- **Updated**: Add a single edit button on the left of each term
- **New Pattern**: Switch between display and edit modes for the whole term

---

## UI/UX Design for Phase 4

### Term Display Card (Current State)
```
═══════════════════════════════════════════════════════════════
[Edit] Mandritto
  ├─ Category: Coups et Techniques
  ├─ Type: Attaque / Frappe de taille
  └─ Definition (FR): ...text...
═══════════════════════════════════════════════════════════════
```

### Edit Mode (TextEditor Active)
```
═══════════════════════════════════════════════════════════════
Mandritto

Definition (FR):
┌────────────────────────────────────────┐
│ Coup de taille exécuté à droite du      │
│ corps, frappant le flanc ou l'épaule... │
│ (TextEditor with undo/redo)             │
│ [Save] [Cancel]                         │
└────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════
```

---

## Implementation Checklist

### Backend (API)
- [ ] Create `/api/glossary/term` endpoint (POST)
- [ ] Load `data/glossary.yaml`
- [ ] Validate termKey exists
- [ ] Validate field is in ['category', 'type', 'term', 'definition_fr']
- [ ] Update field value
- [ ] Write updated YAML back to file
- [ ] Handle errors gracefully

### Frontend (React Components)
- [ ] Create `GlossaryTermEditor` component
  - [ ] Import TextEditor
  - [ ] Support 4 fields
  - [ ] Handle edit/view state
  - [ ] Call save API
- [ ] Update `TermDisplay` component
  - [ ] Add single edit button per term (left of term)
  - [ ] Toggle between display/editor
  - [ ] Pass edited state down
- [ ] Update `GlossaryPage` component
  - [ ] Import updated TermDisplay
  - [ ] May need state for which term is editing

### Testing
- [ ] Edit category field
- [ ] Edit type field
- [ ] Edit term field
- [ ] Edit definition (multi-line text)
- [ ] Undo/Redo in TextEditor
- [ ] Save and verify YAML changes
- [ ] Page reload shows updated values
- [ ] Error cases (invalid termKey, API failure)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| YAML parsing/writing errors | High | Use existing yaml library, add validation |
| Concurrent edits | Medium | Single user app - low priority |
| Large definition text | Low | TextEditor already handles large content |
| Missing fields in term data | Medium | Add default values during save |
| API endpoint breakage | High | Test with various inputs before merge |

---

## Dependencies

- ✅ TextEditor component (already exists)
- ✅ LocalStorage utility (already exists)
- ✅ API pattern (already established)
- ✅ YAML loading/writing (exists in `dataLoader.ts`)
- ⏳ API endpoint needs creation
- ⏳ GlossaryTermEditor component needs creation

---

## Success Criteria for Phase 4

1. ✅ User can click "Edit" button next to any glossary term field
2. ✅ TextEditor opens inline for that field
3. ✅ User can edit category, type, term, or definition (FR)
4. ✅ Undo/Redo work in TextEditor
5. ✅ Save button persists changes to `data/glossary.yaml`
6. ✅ Page reloads and displays updated values
7. ✅ All 4 fields support this pattern
8. ✅ No breaking changes to other phases


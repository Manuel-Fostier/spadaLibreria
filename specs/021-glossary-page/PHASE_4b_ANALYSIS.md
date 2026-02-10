# Phase 4b Analysis: Add New Glossary Term Feature

**Status**: Planning  
**Issue**: #55 - "Bouton nouvel élément au glossaire"  
**Updated**: 2026-02-01  
**Related Phase**: 4a (Glossary term editing)

---

## Overview

Phase 4b adds functionality to create new glossary terms directly from the glossary page. Users can click a "New Term" button to open a form that collects all required fields for a new glossary entry, then persists the entry to `data/glossary.yaml`.

---

## Issue Description

**Issue #55**: "Ajouter un bouton permettant d'ajouter un élément au glossary.yaml"  
(Add a button to add a new element to glossary.yaml)

**Requirement**: Provide a UI button that allows users to create new glossary terms and add them to the glossary database.

---

## User Story

**As a** glossary administrator or contributor  
**I want to** add new fencing terminology entries to the glossary  
**So that** the glossary stays current and comprehensive without manual YAML file editing

### Acceptance Criteria

1. **Given** a user is on the glossary page, **When** they click an "Ajouter Element" button, **Then** a form opens to create a new glossary entry
2. **Given** a new term form is open, **When** the user fills in required fields (category, type, term, definition_fr), **Then** a Save button becomes enabled
3. **Given** a user submits the form, **When** the API successfully creates the entry, **Then** the page reloads and the new term appears in the glossary
4. **Given** a user creates a new term, **When** the entry is saved, **Then** the term is persisted to `data/glossary.yaml`
5. **Given** a new term form is open, **When** the user clicks Cancel, **Then** the form closes without saving

---

## Data Model

### New Term Request Structure

```typescript
interface NewGlossaryTermRequest {
  category: string;        // Required: e.g., "Coups et Techniques"
  type: string;           // Required: e.g., "Attaque / Frappe de taille"
  term: string;           // Required: e.g., "Mandritto"
  definition: {
    fr: string;           // Required: French definition
    it?: string;          // Optional: Italian definition
    en?: string;          // Optional: English definition
  };
  translation?: {
    fr?: string;          // Optional: French translation
    it?: string;          // Optional: Italian translation
    en?: string;          // Optional: English translation
  };
}
```

### YAML Output

New term added to `data/glossary.yaml`:

```yaml
new_term_key:
  term: "Display Term"
  category: "Category Name"
  type: "Type Name"
  definition:
    it: "Italian definition"
    fr: "French definition"
    en: "English definition"
  translation:
    it: "Italian translation"
    fr: "French translation"
    en: "English translation"
```

---

## Components Needed

### 1. NewTermForm Component (NEW)
**Path**: `src/components/NewTermForm.tsx`

**Purpose**: Multi-field form for creating a new glossary term

**Props**:
- `onSave`: (term: NewGlossaryTermRequest) => Promise<void>
- `onCancel`: () => void

**Features**:
- Text input fields for: category, type, term
- Textarea for: definition (French)
- Optional expandable section for other languages
- Save/Cancel buttons
- Form validation (required fields)
- Loading state during API call

**Structure**:
```
┌─────────────────────────────────────┐
│ New Glossary Term                   │
├─────────────────────────────────────┤
│ Category: [________________]         │
│ Type: [__________________]           │
│ Term: [___________________]          │
│ Definition (French):                │
│ ┌──────────────────────────┐        │
│ │                          │        │
│ └──────────────────────────┘        │
│                                     │
│ [+ Advanced Options]                │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

### 2. API Endpoint: `/api/glossary/terms` (NEW)
**Method**: POST  
**Body**: `NewGlossaryTermRequest`  
**Response**: `{ success: true, termKey: string }`

**Implementation**:
1. Validate required fields
2. Generate termKey from term name (slugify)
3. Check if termKey already exists
4. Load `data/glossary.yaml`
5. Add new entry
6. Write back to YAML file
7. Return success with termKey

### 3. Modal/Dialog Component (OPTIONAL)
Could use:
- Simple overlay modal (new component)
- Inline form on page (reuse existing pattern)
- Side panel (reuse AnnotationPanel pattern)

**Recommendation**: Inline modal for simplicity, reusing React patterns from BolognesePlatform

---

## Reusable Elements from Phase 4a

### From Phase 4a (Editing)
- **TextEditor component**: Can be reused for multi-line definition input
- **FieldDisplay pattern**: Can be adapted for form field display
- **API save pattern**: Similar fetch/save flow
- **Error handling**: Try/catch pattern

### New Patterns Needed
- Form validation logic
- Unique key generation (slug from term name)
- Modal/dialog UI
- Field focus management
- Success/error notifications

---

## Implementation Approach

### Option A: Simple Inline Form
**Pros**: 
- Reuses existing patterns
- Simple to implement
- Consistent with glossary page design

**Cons**: 
- Takes up page space
- Less modal-like experience

**Recommendation**: ✅ Start with this approach

### Option B: Modal Dialog
**Pros**: 
- Clear separation from glossary content
- Dedicated focus for form

**Cons**: 
- Requires new modal component
- More implementation effort

**Recommendation**: Consider for Phase 5+

---

## Functional Requirements

- **FR-4b-001**: System MUST provide an "Ajouter Element" button on the glossary page
- **FR-4b-002**: System MUST display a form that collects required fields: category, type, term, definition (French)
- **FR-4b-003**: System MUST allow optional input for definition/translation in other languages
- **FR-4b-004**: System MUST validate that all required fields are filled before enabling Save
- **FR-4b-005**: System MUST generate a unique YAML key from the term name (e.g., "Mandritto" → "mandritto")
- **FR-4b-006**: System MUST check for duplicate term keys and prevent duplicates
- **FR-4b-007**: System MUST persist new terms to `data/glossary.yaml` via POST to `/api/glossary/terms`
- **FR-4b-008**: System MUST reload the glossary page after successful creation to display the new term
- **FR-4b-009**: System MUST display clear error messages if creation fails
- **FR-4b-010**: System MUST allow users to cancel term creation without saving

---

## API Endpoint Design

### POST `/api/glossary/terms`

**Request**:
```json
{
  "category": "Coups et Techniques",
  "type": "Attaque / Frappe de taille",
  "term": "Mandritto",
  "definition": {
    "fr": "Coup de taille exécuté..."
  },
  "translation": {
    "fr": "Mandritto (translation)"
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "termKey": "mandritto"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Term already exists"
}
```

**Status Codes**:
- `200 OK`: Term created successfully
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Term key already exists
- `500 Internal Server Error`: Server error

---

## Form Validation Rules

| Field | Required | Type | Validation |
|-------|----------|------|-----------|
| category | Yes | Text | Non-empty, 1-100 chars |
| type | Yes | Text | Non-empty, 1-100 chars |
| term | Yes | Text | Non-empty, 1-100 chars |
| definition.fr | Yes | Text | Non-empty, 1-1000 chars |
| definition.it | No | Text | 0-1000 chars |
| definition.en | No | Text | 0-1000 chars |
| translation.fr | No | Text | 0-500 chars |
| translation.it | No | Text | 0-500 chars |
| translation.en | No | Text | 0-500 chars |

---

## Term Key Generation

**Algorithm**: Generate unique YAML key from term name

```typescript
function generateTermKey(termName: string): string {
  return termName
    .toLowerCase()
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Examples:
generateTermKey("Mandritto") → "mandritto"
generateTermKey("Attaque / Frappe de taille") → "attaque_frappe_de_taille"
generateTermKey("Falso Dritto") → "falso_dritto"
```

---

## Duplicate Prevention

1. User enters term name
2. On form submit, generate key
3. Load existing glossary YAML
4. Check if key already exists
5. If exists:
   - Show error: "A term with this name already exists"
   - Don't save
6. If not exists:
   - Create entry
   - Save to YAML

---

## UX Flow

### Success Path
1. User clicks "Ajouter Element" button
2. Form appears (inline or modal)
3. User fills required fields
4. User clicks Save
5. API creates entry in YAML
6. Page reloads
7. New term appears in glossary
8. Success notification shown

### Cancel Path
1. User clicks "Ajouter Element" button
2. Form appears
3. User fills some fields
4. User clicks Cancel
5. Form closes
6. No changes saved

### Error Path
1. User clicks "Ajouter Element" button
2. Form appears
3. User fills fields
4. User clicks Save
5. API returns error (e.g., duplicate term)
6. Error message displayed in form
7. Form remains open for retry

---

## Integration with Phase 4a

Phase 4b builds on Phase 4a infrastructure:

| Component | Phase 4a | Phase 4b |
|-----------|----------|---------|
| TextEditor | ✅ For editing | ✅ For form input |
| API endpoint | ✅ /api/glossary/term (update) | ✅ /api/glossary/terms (create) |
| YAML loading | ✅ For display | ✅ For validation |
| Error handling | ✅ Try/catch | ✅ Try/catch |
| Page reload | ✅ After edit | ✅ After create |

---

## Implementation Timeline

### Phase 4b.1: Backend API
- Create `/api/glossary/terms` endpoint
- Implement YAML update logic
- Add duplicate checking
- Add validation

### Phase 4b.2: Frontend Form
- Create `NewTermForm` component
- Implement form validation
- Add field focus management
- Create modal/inline wrapper

### Phase 4b.3: Integration
- Add "New Term" button to glossary page
- Wire up form to API
- Test end-to-end
- Handle errors

---

## Success Criteria

- ✅ "New Term" button appears on glossary page
- ✅ Form opens when button clicked
- ✅ All required fields can be filled
- ✅ Save button disabled until required fields filled
- ✅ New term persisted to `data/glossary.yaml`
- ✅ Duplicate terms prevented
- ✅ Page reloads and shows new term
- ✅ Cancel button closes form without saving
- ✅ Errors display clearly
- ✅ No breaking changes to Phase 4a

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Duplicate terms | Check key existence before saving |
| YAML corruption | Validate structure before writing |
| Invalid keys | Sanitize term names → valid keys |
| Large form complexity | Keep simple: only French required, others optional |
| State management | Use simple boolean flag for form visibility |


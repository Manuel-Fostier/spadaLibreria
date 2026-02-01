# Phase 4 Clarification Summary

**Updated**: 2026-02-01  
**Status**: Clarifications Incorporated

---

## Changes Made to Specs

### 1. Phase 4 Split into Three Subphases

**Before**:
```
Phase 4: Glossary content editing interface
```

**After**:
```
Phase 4a: Edit existing glossary terms (inline editing)
Phase 4b: Create new glossary terms (Issue #55)
Phase 4c: Add new treatise sections in BolognesePlatform (Issue #54)
```

**Rationale**: 
- Issue #55 is independent of editing existing terms
- Issue #54 targets treatise content (BolognesePlatform), not glossary data
- Phases 4a and 4b share infrastructure (YAML handling, TextEditor reuse)
- Allows phased delivery

---

## Phase 4a: Edit Existing Terms

### Scope
- Single Edit button on the left of each term
- TextEditor opens inline
- 4 editable fields: `category`, `type`, `term`, `definition_fr`
- Save to `data/glossary.yaml` via API `/api/glossary/term` (POST)

### Implementation Pattern
- Reuses `TextEditor` component from BolognesePlatform
- Reuses API save flow pattern
- Inline editing (not modal)

### Deliverables
- `GlossaryTermEditor` component
- `/api/glossary/term` endpoint
- Updated `TermDisplay` with a single edit button per term
- Updated `GlossaryPage` with edit mode toggle

---

## Phase 4b: Create New Terms (Issue #55)

### Issue Description
**#55**: "Ajouter un bouton permettant d'ajouter un élément au glossary.yaml"
(Add a button to add a new element to glossary.yaml)

### Scope
- "Ajouter Element" button on glossary page
- Form collects: category, type, term, definition_fr (required)
  - Optional: other language definitions/translations
- API creates new entry: `/api/glossary/terms` (POST)
- Duplicate prevention by term key
- Page reloads to show new term

### Implementation Pattern
- New form component `NewTermForm`
- API endpoint `/api/glossary/terms` (POST)
- Term key generation (slug from term name)
- Duplicate detection

### Deliverables
- `NewTermForm` component
- `/api/glossary/terms` endpoint
- Updated `GlossaryPage` with "Ajouter Element" button
- Term key generation utility

---

## Phase 4c: Add New Treatise Sections (Issue #54)

### Issue Description
**#54**: "Ajouter un bouton à la page bolognePlateforme pour ajouter une nouvelle section"

### Scope
- "Nouvelle section" button in BolognesePlatform
- Form collects required metadata and content
- API appends a new section to the correct treatise YAML file based on `master`, `work`, `book`

### Implementation Pattern
- Reuse inline editing patterns where practical
- New API endpoint for section creation
- Validate target YAML file selection

### Deliverables
- New section creation form
- `/api/content/section` endpoint
- Updated BolognesePlatform header/actions

---

## Analysis Documents Created

1. **PHASE_4_ANALYSIS.md**
   - Identifies 7 reusable elements from BolognesePlatform
   - Details component architecture
   - Risk assessment

2. **PHASE_4b_ANALYSIS.md**
   - Issue #55 detailed analysis
   - User stories and acceptance criteria
   - Form design and validation rules
   - Term key generation algorithm

3. **PHASE_4_PLAN.md** (Updated)
   - Combined implementation plan for 4a + 4b
   - Backend and frontend task breakdown
   - Estimated effort: 11-17 hours
   - File structure and dependencies

---

## Key Decisions

### 1. Edit Mode Toggle
- Global toggle for entire glossary
- Simple boolean state
- All terms editable/readable via toggle

### 2. Form UI Pattern for Phase 4b
- Inline form on glossary page (not modal)
- Consistent with glossary page design
- Can be upgraded to modal in future if needed- Button label: "Ajouter Element" (French)
### 3. Term Key Generation
- Lowercase normalization
- Accent removal (à→a, é→e, etc.)
- Slug format (spaces → underscores)
- Example: "Falso Dritto" → "falso_dritto"

### 4. Duplicate Prevention
- Check term key existence before saving
- Return error if duplicate found
- User gets clear error message

### 5. Required vs Optional Fields

**Phase 4a Edit**:
- All fields potentially editable
- No new required fields

**Phase 4b Create**:
- Required: `category`, `type`, `term`, `definition_fr`
- Optional: definitions/translations in other languages

---

## Questions Resolved

| Question | Answer | Phase |
|----------|--------|-------|
| How to edit terms? | Inline TextEditor with a single edit button per term | 4a |
| Can users add new terms? | Yes, via form (Issue #55) | 4b |
| Should edit be modal or inline? | Inline for consistency | 4a |
| What about term keys? | Auto-generate via slug from term name | 4b |
| How prevent duplicates? | Check key existence in API | 4b |
| Required fields for new term? | category, type, term, definition_fr | 4b |

---

## Risk Mitigations

| Risk | Mitigation | Phase |
|------|-----------|-------|
| YAML corruption | Validate structure before writing | 4a, 4b |
| Duplicate terms | Check key existence | 4b |
| Invalid keys | Sanitize term names | 4b |
| State complexity | Simple boolean flags | 4a, 4b |
| API failures | Try/catch with user errors | 4a, 4b |

---

## Next Steps

1. **Review** PHASE_4_ANALYSIS.md for reusable patterns
2. **Review** PHASE_4b_ANALYSIS.md for Issue #55 requirements
3. **Review** Updated PHASE_4_PLAN.md for implementation tasks
4. **Prioritize**: Start with Phase 4a (easier), then Phase 4b
5. **Implement** following task breakdown in PHASE_4_PLAN.md

---

## Integration with Existing Phases

- ✅ **Phase 1**: No impact (standalone glossary browsing)
- ✅ **Phase 2**: No impact (navigation from treatises)
- ✅ **Phase 3**: No impact (URL hash navigation)
- ✅ **Phase 4a**: Editing infrastructure
- ✅ **Phase 4b**: Build on Phase 4a infrastructure

---

## File Locations

| Document | Path |
|----------|------|
| Spec | `specs/021-glossary-page/spec.md` |
| Phase 4a Analysis | `specs/021-glossary-page/PHASE_4_ANALYSIS.md` |
| Phase 4b Analysis | `specs/021-glossary-page/PHASE_4b_ANALYSIS.md` |
| Phase 4 Plan | `specs/021-glossary-page/PHASE_4_PLAN.md` |
| This Summary | `specs/021-glossary-page/PHASE_4_CLARIFICATION.md` |


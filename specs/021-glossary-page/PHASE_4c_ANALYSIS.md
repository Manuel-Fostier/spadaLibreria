# Phase 4c Analysis: New Treatise Section Button (Issue #54)

**Status**: Planning  
**Issue**: #54 - "Bouton nouvelle section"  
**Updated**: 2026-02-01  
**Related Area**: BolognesePlatform (treatise content)

---

## Issue Summary

**Issue #54** requests a button on BolognesePlatform to add a new treatise section. The new section must be appended to the correct YAML file based on:
- `master`
- `work`
- `book`

---

## User Story

**As a** content editor  
**I want** to add a new treatise section directly from the platform  
**So that** I can extend treatise content without manually editing YAML files

---

## Functional Scope (Phase 4c)

1. Provide a "Nouvelle section" button in BolognesePlatform
2. Display a form to create a new section
3. Required metadata fields: `master`, `work`, `book`, `year`, `title`, and `content.fr`
4. Optional fields: `content.it`, `content.en_versions`, `content.notes`
5. Persist the new section into the correct YAML file based on `master`, `work`, `book`
6. Append the new section at the end of the file
7. Reload the page to display the new section

---

## Data Routing Rule

**Determine the target YAML file** using the new section metadata:
- Identify treatise file by matching existing `metadata.master`, `metadata.work`, `metadata.book`
- If no file exists, return an error (no automatic file creation in Phase 4c)

---

## API Requirements

### Endpoint
- **POST** `/api/content/section`

### Request Body (Example)
```json
{
  "metadata": {
    "master": "Achille Marozzo",
    "work": "Opera Nova",
    "book": 2,
    "year": 1536
  },
  "title": "Nouvelle Section",
  "content": {
    "fr": "Texte français",
    "it": "Testo italiano",
    "notes": "Notes...",
    "en_versions": [
      { "translator": "John Doe", "text": "English text" }
    ]
  }
}
```

### Response
- **200 OK**: `{ "success": true, "sectionId": "generated_id" }`
- **404**: `{ "error": "Treatise file not found" }`
- **400**: `{ "error": "Missing required fields" }`

---

## UI/UX Notes

- Button label: **"Nouvelle section"**
- Form should follow existing inline editing style (similar to text editing in BolognesePlatform)
- Show validation errors near fields
- Provide Cancel action to discard

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Wrong file selection | Match strictly on `master`, `work`, `book` |
| YAML corruption | Validate structure before write |
| Missing fields | Frontend validation + backend validation |
| Duplicate section IDs | Generate unique `id` on server |

---

## Success Criteria

- ✅ "Nouvelle section" button appears in BolognesePlatform
- ✅ Form collects required metadata and content
- ✅ New section saved to correct YAML file
- ✅ Page reload shows the new section
- ✅ Errors shown when file match fails

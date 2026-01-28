# API Contracts: Glossary Feature

**Status**: Phase 1 Design  
**Last Updated**: 2026-01-28

---

## Overview

This document defines the API contracts for the glossary page feature. All endpoints are server-side API routes in Next.js App Router.

---

## Endpoint: GET /api/content/glossary

### Purpose

Load all glossary terms from YAML and return in JSON format (both flat and grouped structures).

### Request

```
GET /api/content/glossary
```

**Parameters**: None (GET request with no query params)

**Headers**:
```
Accept: application/json
```

**Body**: Empty

### Response - Success (200 OK)

```json
{
  "terms": [
    {
      "id": "mandritto",
      "term": "Mandritto",
      "category": "Coups et Techniques",
      "type": "Attaque / Frappe de taille",
      "definition": {
        "it": "Colpo di taglia eseguito da destra a sinistra",
        "fr": "Coup de taille exécuté de droite à gauche",
        "en": "A cutting blow executed from right to left"
      },
      "translation": {
        "it": "",
        "fr": "Mandritto",
        "en": "Mandritto"
      }
    },
    {
      "id": "riverso",
      "term": "Riverso",
      "category": "Coups et Techniques",
      "type": "Attaque / Frappe de taglia",
      "definition": {
        "it": "Colpo di taglia eseguito da sinistra a destra",
        "fr": "Coup de taille exécuté de gauche à droite",
        "en": "A cutting blow executed from left to right"
      },
      "translation": {
        "it": "",
        "fr": "Riverso",
        "en": "Riverso"
      }
    }
    // ... more terms (~80 total)
  ],
  "grouped": {
    "Coups et Techniques": {
      "Attaque / Frappe de taille": [
        {
          "id": "mandritto",
          "term": "Mandritto",
          // ... full term object
        },
        {
          "id": "riverso",
          "term": "Riverso",
          // ... full term object
        }
        // ... more terms in this type
      ],
      "Attaque / Coup de pointe": [
        {
          "id": "imbroccata",
          "term": "Imbroccata",
          // ... full term object
        }
        // ... more terms
      ]
      // ... more types in this category
    },
    "Les Guardes": {
      "Guard Position": [
        // ... guard terms
      ]
      // ... more types
    }
    // ... more categories (8 total)
  },
  "count": 82,
  "categories": [
    "Coups et Techniques",
    "Les Guardes",
    "Coups et Techniques Additionnels",
    "Concepts Tactiques",
    "Actions et Mouvements Additionnels",
    "Armes et Équipement",
    "Termes Techniques Additionnels",
    "Les Cibles"
  ]
}
```

### Response - Error (500 Internal Server Error)

```json
{
  "error": "Failed to load glossary: [specific error message]"
}
```

**Common Errors**:
- `"File not found: data/glossary.yaml"` - YAML file missing
- `"YAML parse error: ..."`  - Invalid YAML syntax
- `"Validation error for term 'mandritto': missing category field"` - Invalid data
- `"Failed to read file"` - Permission error

### Response Headers

```
Content-Type: application/json
Cache-Control: public, max-age=3600
```

### Performance Targets

- **Response Time**: <200ms (cold), <50ms (cached)
- **Payload Size**: ~150KB JSON (gzipped: ~30KB)
- **Load Time**: Page should load within 2 seconds total

### Example Client Call

```typescript
// src/contexts/GlossaryContext.tsx

async function loadTerms() {
  setIsLoading(true);
  try {
    const response = await fetch('/api/content/glossary');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Use both formats
    setTerms(data.terms);              // For searching
    setGroupedTerms(data.grouped);     // For hierarchical display
    setCategories(data.categories);    // For organization
    
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
}
```

### Implementation Notes

- **Caching**: API response can be cached in browser (Cache-Control: public, max-age=3600)
- **No Authentication**: Endpoint is public, no auth required
- **No Parameters**: Endpoint returns complete glossary (no filtering via API)
- **Server-Side Only**: Uses `fs` and `js-yaml` (Node.js only, no client-side execution)

---

## Data Flow Diagram

```
┌────────────────────────────────────┐
│  src/app/api/content/glossary/     │
│  route.ts (Server Component)       │
├────────────────────────────────────┤
│  1. fs.readFileSync()              │
│     ↓                              │
│  2. yaml.load() parse YAML         │
│     ↓                              │
│  3. validateGlossaryTerms()        │
│     ↓                              │
│  4. groupGlossaryByCategory()      │
│     ↓                              │
│  5. Response.json({ ... })        │
└────────────────────────────────────┘
           ↓ HTTP GET
    ┌──────────────────────┐
    │  Client (Browser)    │
    │                      │
    │  fetch('/api/...')   │
    │    ↓                 │
    │  parseJSON()         │
    │    ↓                 │
    │  setTerms()          │
    │  setGroupedTerms()   │
    └──────────────────────┘
           ↓
    ┌──────────────────────┐
    │  GlossaryContext     │
    │  (State Management)  │
    │                      │
    │  - terms[]           │
    │  - grouped{}         │
    │  - filteredTerms[]   │
    │  - searchQuery       │
    └──────────────────────┘
           ↓
    ┌──────────────────────┐
    │  GlossaryContent     │
    │  (Display)           │
    │                      │
    │  - CategorySection   │
    │    - TermDisplay     │
    └──────────────────────┘
```

---

## Error Handling & Validation

### Validation Rules (Server-Side)

1. **ID Field**:
   - Must be present as YAML key
   - Must match pattern: `[a-z0-9_]+` (lowercase, alphanumeric, underscores)
   - Error: `"Invalid term ID: {id}"`

2. **Required String Fields**:
   - `term` (display name)
   - `category` (must be one of 8 valid categories)
   - `type` (classification)
   - Error: `"Missing or invalid field '{field}' for term '{id}'"`

3. **Definition Field**:
   - Must have `it` and `fr` keys
   - Must be non-empty strings
   - Error: `"Missing required definitions for term '{id}'"`

4. **Translation Field**:
   - Must have `fr` key
   - Must be non-empty string
   - Error: `"Missing French translation for term '{id}'"`

### Error Response Format

```json
{
  "error": "Validation failed for term 'mandritto': missing 'category' field",
  "status": 500,
  "timestamp": "2026-01-28T10:30:00Z"
}
```

---

## Testing Contracts

### Unit Test Example

```typescript
// src/app/api/content/glossary/__tests__/route.test.ts

describe('GET /api/content/glossary', () => {
  it('returns glossary terms in correct format', async () => {
    // Mock fs and yaml
    // Call GET handler
    // Assert response structure
    // Assert term count ~80
    // Assert all required fields present
  });
  
  it('returns grouped structure with categories', async () => {
    // Assert grouped has 8 categories
    // Assert each category has types
    // Assert each type has terms array
  });
  
  it('returns error on invalid YAML', async () => {
    // Mock yaml.load() to throw
    // Assert 500 response
    // Assert error message in JSON
  });
  
  it('returns error on missing category field', async () => {
    // Mock term without category field
    // Assert 500 response
    // Assert validation error in message
  });
});
```

### Integration Test Example

```typescript
// src/__tests__/glossary-api-integration.test.ts

describe('Glossary API Integration', () => {
  it('loads and displays glossary data', async () => {
    // Navigate to /glossary page
    // Wait for API call
    // Verify ~80 terms displayed
    // Verify all categories visible
    // Verify French content shown
  });
  
  it('handles API errors gracefully', async () => {
    // Mock fetch() to fail
    // Render GlossaryContent
    // Verify error message displayed
    // Verify page doesn't crash
  });
});
```

---

## Versioning

### Current Version: 1.0

- Initial release: Glossary MVP
- No versioning prefix in URL (future: `/api/v2/...`)

### Future Considerations

- **v2.0**: Support language parameter (e.g., `?language=fr&language=en`)
- **v3.0**: Support term filtering (e.g., `?category=Coups et Techniques`)
- **v4.0**: Support search endpoint (e.g., `/api/search?q=mandritto`)

---

## Security & Privacy

### Authentication

- **Not Required**: Glossary is public data
- **Future**: May require user authentication for editing (Phase 4)

### Data Access

- **Read-Only**: GET endpoint only, no POST/PUT/DELETE for Phase 1
- **No Personal Data**: Glossary terms contain no PII
- **Local-Only**: Data stays on user's machine

---

## Summary

The glossary API is simple and focused:

- **Single Endpoint**: `/api/content/glossary` (GET)
- **Single Response Format**: JSON with terms array + grouped structure
- **Error Handling**: Validation on server-side, errors returned in JSON
- **Performance**: Cacheable, <200ms response time
- **Security**: Public read-only endpoint, local-only data

Ready for Phase 1 implementation.

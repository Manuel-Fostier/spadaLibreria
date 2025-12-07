# Research: Treatise Search and Annotation System

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Phase**: 0 (Research & Decision Making)  
**Date**: 2025-12-07

## Overview

This document captures research findings and technical decisions for implementing cross-treatise search with variant matching, annotations, and local LLM integration. Focus on beginner-friendly, simple technologies per constitution.

## 1. Search Algorithm & Performance

### Research Question
How to implement client-side full-text search across ~100 chapters (~500KB text) with <5 second performance requirement?

### Options Evaluated

**Option A: Lunr.js (Full-Text Search Library)**
- Pros: Mature library, built-in stemming, relevance ranking
- Cons: 30KB+ bundle size; adds complexity for beginners; stemming may not work well for Italian/French fencing terms
- Performance: Very fast (<100ms for typical queries)

**Option B: Custom Regex-Based Search**
- Pros: No dependencies; full control; easy to understand for beginners
- Cons: Slower for very large text; requires manual variant matching
- Performance: Acceptable for ~500KB text (~1-2 seconds with variants)

**Option C: IndexedDB with Pre-Built Index**
- Pros: Persistence across sessions; very fast queries
- Cons: Complex API; violates beginner-friendly principle; overkill for scale
- Performance: Fastest (<50ms) but setup complexity high

### Decision: **Option B with In-Memory Index**

**Rationale**:
- Beginner-friendly: No external libraries; plain TypeScript/JavaScript
- Performance acceptable: Build index once on app load (~1-2 sec); subsequent searches <1 sec
- Full control: Can customize variant matching for fencing terminology
- Constitution compliance: Simplicity over complexity

**Implementation Approach**:
```typescript
// Build index on app load
const index = {
  chapters: Map<ChapterRef, { it: string, fr: string, en: string }>,
  termIndex: Map<string, ChapterRef[]> // Pre-index normalized terms
};

// Search with variants
function search(query: string): SearchResult[] {
  const variants = generateVariants(query); // mandritto → [mandritto, mandritti, ...]
  const crossLang = mapCrossLanguage(query); // mandritto → { fr: [coup droit], en: [forehand cut] }
  
  // Search in index (regex for flexibility)
  return chapters.filter(chapter => 
    variants.some(v => chapter.text.match(new RegExp(v, 'gi')))
  );
}
```

**Alternatives Rejected**: Lunr.js (too complex), IndexedDB (overkill)

---

## 2. Language Variant Generation

### Research Question
How to generate word variants (plurals, conjugations) for French and Italian without complex NLP libraries?

### French Verb Conjugation Patterns

**Common Regular Patterns**:
- `-er` verbs: provoque → provoquer, provoques, provoqué, provoquant
- `-ir` verbs: finir → finis, finit, finissant
- Common irregulars: être (être, suis, est), avoir (avoir, ai, as, a)

**Fencing-Specific Terms**:
- Nouns: coup → coups, garde → gardes
- Adjectives: droit → droite, droits, droites

### Italian Plural Rules

**Common Patterns**:
- `-o` → `-i`: mandritto → mandritti
- `-a` → `-e`: stoccata → stoccate  
- `-e` → `-i`: fendente → fendenti

**Exceptions**: Some terms don't follow rules (e.g., guardia → guardie)

### Decision: **Rule-Based + Glossary Lookup**

**Rationale**:
- Focus on common fencing terms (not general language)
- Use glossary.yaml as authoritative source for cross-language equivalents
- Supplement with simple rule-based patterns for common conjugations/plurals
- Avoid NLP libraries (Spacy, etc.) per beginner-friendly principle

**Implementation Approach**:
```typescript
function generateVariants(term: string): string[] {
  const variants = [term];
  
  // Italian plurals
  if (term.endsWith('o')) variants.push(term.slice(0, -1) + 'i');
  if (term.endsWith('a')) variants.push(term.slice(0, -1) + 'e');
  if (term.endsWith('e')) variants.push(term.slice(0, -1) + 'i');
  
  // French verb conjugations (common patterns)
  if (term.endsWith('er')) {
    variants.push(term.slice(0, -2) + 'e');   // provoquer → provoque
    variants.push(term.slice(0, -2) + 'é');   // provoquer → provoqué
    variants.push(term.slice(0, -2) + 'ant'); // provoquer → provoquant
  }
  
  // Glossary lookup for authoritative cross-language terms
  const glossaryTerms = glossary[term];
  if (glossaryTerms) {
    variants.push(...glossaryTerms.translation.fr, ...glossaryTerms.translation.en);
  }
  
  return [...new Set(variants)]; // Deduplicate
}
```

**Limitations Accepted**: Won't catch all edge cases; focus on 80% coverage of common fencing terms

**Alternatives Rejected**: NLP libraries (too complex), manual lookup tables (not maintainable)

---

## 3. Cross-Language Mapping

### Research Question
How to leverage existing glossary.yaml for cross-language term equivalents?

### Glossary Structure (Existing)
```yaml
mandritto:
  term: Mandritto
  type: Attaque / Frappe de taille
  definition:
    fr: Coup porté de la droite vers la gauche
    en: A cut delivered from right to left
  translation:
    fr: Coup droit
    en: Forehand cut
```

### Decision: **Build Glossary Index on App Load**

**Rationale**:
- Glossary is single source of truth (per constitution)
- Loading glossary.yaml already happens; extend to build search index
- In-memory index for fast lookups (no repeated YAML parsing)
- Bi-directional mapping: IT→FR/EN and FR→IT, EN→IT

**Implementation Approach**:
```typescript
interface GlossaryIndex {
  termToEquivalents: Map<string, { fr: string[], en: string[] }>;
  reverseIndex: Map<string, string[]>; // FR/EN term → IT equivalents
}

function buildGlossaryIndex(glossary: Glossary): GlossaryIndex {
  const index = {
    termToEquivalents: new Map(),
    reverseIndex: new Map()
  };
  
  for (const [itTerm, entry] of Object.entries(glossary)) {
    // Forward: IT → FR/EN
    index.termToEquivalents.set(itTerm.toLowerCase(), {
      fr: [entry.translation.fr.toLowerCase()],
      en: [entry.translation.en.toLowerCase()]
    });
    
    // Reverse: FR/EN → IT
    index.reverseIndex.set(entry.translation.fr.toLowerCase(), [itTerm]);
    index.reverseIndex.set(entry.translation.en.toLowerCase(), [itTerm]);
  }
  
  return index;
}

function mapCrossLanguage(term: string): Record<Language, string[]> {
  const normalized = term.toLowerCase();
  
  // Check if term is Italian (in glossary directly)
  if (glossaryIndex.termToEquivalents.has(normalized)) {
    return glossaryIndex.termToEquivalents.get(normalized);
  }
  
  // Check if term is FR/EN (reverse lookup)
  if (glossaryIndex.reverseIndex.has(normalized)) {
    const itTerms = glossaryIndex.reverseIndex.get(normalized);
    // Map back to get all equivalents
    return itTerms.flatMap(it => glossaryIndex.termToEquivalents.get(it));
  }
  
  return { fr: [], en: [] }; // No mapping found
}
```

**Performance**: O(1) lookups after initial O(n) index build (~1000 terms in glossary)

**Alternatives Rejected**: Pre-process glossary to JSON (adds build step), runtime YAML parsing (slow)

---

## 4. LocalStorage Limits & Strategy

### Research Question
Can browser localStorage handle 500 annotations + 100 saved searches?

### Browser Limits
- **Typical Limit**: 5-10 MB per origin (varies by browser)
- **Chrome/Edge**: ~10 MB
- **Firefox**: ~10 MB
- **Safari**: ~5 MB

### Storage Estimates

**Saved Searches** (100 items):
```typescript
interface SavedSearch {
  id: string;        // 36 bytes (UUID)
  searchTerm: string; // ~20 bytes avg
  createdAt: Date;   // 24 bytes (ISO string)
  lastUsedAt: Date;  // 24 bytes
  usageCount: number; // 8 bytes
}
// Total per item: ~112 bytes
// 100 items: ~11 KB
```

**Annotations** (500 items):
```typescript
interface Annotation {
  id: string;              // 36 bytes
  chapterReference: {      // ~60 bytes
    treatiseFile: string;
    chapterId: string;
  };
  text: string;            // ~200 bytes avg (user note)
  tags: Tag[];            // ~50 bytes avg (3 tags)
  createdAt: Date;        // 24 bytes
  modifiedAt: Date;       // 24 bytes
}
// Total per item: ~394 bytes
// 500 items: ~197 KB
```

**Total Estimated**: ~208 KB (~0.2 MB)

### Decision: **Use LocalStorage with Size Monitoring**

**Rationale**:
- Well within limits (0.2 MB vs. 5+ MB available)
- No IndexedDB complexity needed
- Simple JSON serialization (JSON.stringify/parse)
- Add size monitoring to warn if approaching limits

**Implementation Approach**:
```typescript
const STORAGE_KEYS = {
  SAVED_SEARCHES: 'spada:savedSearches',
  ANNOTATIONS: 'spada:annotations',
  SETTINGS: 'spada:settings'
};

const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4 MB warning threshold

function saveToLocalStorage<T>(key: string, data: T): void {
  const json = JSON.stringify(data);
  
  // Check size before saving
  const currentSize = calculateStorageSize();
  if (currentSize + json.length > MAX_STORAGE_SIZE) {
    console.warn('Approaching localStorage limit. Consider exporting data.');
    // Show user warning
  }
  
  localStorage.setItem(key, json);
}

function calculateStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (key.startsWith('spada:')) {
      total += localStorage[key].length;
    }
  }
  return total;
}
```

**Migration Strategy**: If limits become an issue, provide export to JSON file and re-import

**Alternatives Rejected**: IndexedDB (too complex), SessionStorage (not persistent), Cookie (size limits too small)

---

## 5. Local LLM Integration

### Research Question
How to integrate LM Studio or Ollama for local LLM assistant?

### LM Studio API
- **Endpoint**: http://localhost:1234/v1 (OpenAI-compatible API)
- **Authentication**: None (local server)
- **Models**: User downloads (e.g., Llama 3.2, Mistral)
- **Response Time**: ~5-10 sec for 7B models on typical hardware

**Example Request**:
```typescript
POST http://localhost:1234/v1/chat/completions
{
  "model": "llama-3.2-7b", // User configures
  "messages": [
    { "role": "system", "content": "You are a fencing historian assistant." },
    { "role": "user", "content": "Summarize this chapter: ..." }
  ],
  "max_tokens": 500,
  "stream": true // Optional: streaming for better UX
}
```

### Ollama API
- **Endpoint**: http://localhost:11434/api (Ollama-specific API)
- **Authentication**: None
- **Models**: User downloads via CLI (`ollama pull llama3.2`)
- **Response Time**: Similar to LM Studio

**Example Request**:
```typescript
POST http://localhost:11434/api/generate
{
  "model": "llama3.2",
  "prompt": "Summarize this chapter: ...",
  "stream": true
}
```

### Decision: **Support Both via Configurable Base URL**

**Rationale**:
- Users may prefer either tool (LM Studio has GUI, Ollama is CLI-friendly)
- Both provide REST APIs (simple fetch() calls)
- No authentication needed (local servers)
- Streaming responses for better UX (show progress)

**Implementation Approach**:
```typescript
interface LLMConfig {
  provider: 'lmstudio' | 'ollama';
  baseURL: string;
  model: string;
}

class LLMClient {
  private config: LLMConfig;
  
  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    const endpoint = this.config.provider === 'lmstudio'
      ? `${this.config.baseURL}/chat/completions`
      : `${this.config.baseURL}/api/generate`;
    
    const body = this.config.provider === 'lmstudio'
      ? this.buildLMStudioRequest(request)
      : this.buildOllamaRequest(request);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return this.parseResponse(response);
  }
  
  async *streamMessage(request: LLMRequest): AsyncIterator<string> {
    // Streaming implementation for progressive UI updates
    const response = await fetch(..., { stream: true });
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield this.parseChunk(value);
    }
  }
}
```

**Default Settings**:
- LM Studio: http://localhost:1234/v1
- Ollama: http://localhost:11434

**Error Handling**: Graceful fallback if LLM server not running; show connection status in UI

**Alternatives Rejected**: WebAssembly LLM (too slow), external API (violates privacy), single provider (reduces user choice)

---

## 6. Search Result Highlighting

### Research Question
How to highlight multiple search term variants in chapter text?

### Options Evaluated

**Option A: react-highlight-words**
- Pros: Mature library, handles multiple terms
- Cons: Doesn't support dynamic variant lists well; adds dependency

**Option B: Custom Highlighter Component**
- Pros: Full control; can highlight all variants simultaneously; no deps
- Cons: More code to maintain

### Decision: **Custom Highlighter Component**

**Rationale**:
- Need to highlight original term + all generated variants
- Need to show which variant matched (tooltip on hover)
- Keep beginner-friendly (simple React component)

**Implementation Approach**:
```typescript
interface HighlightProps {
  text: string;
  searchTerms: string[]; // Original + variants
  className?: string;
}

function Highlighter({ text, searchTerms, className }: HighlightProps) {
  // Build regex from all variants
  const pattern = searchTerms.map(t => escapeRegex(t)).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  
  // Split text by matches
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200" title={`Variant of search term`}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
```

**Performance**: Regex matching is fast for ~1000-word chapters; acceptable latency

**Alternatives Rejected**: react-highlight-words (less control), CSS-only (can't track variants)

---

## Summary of Decisions

| Research Area | Decision | Rationale |
|---------------|----------|-----------|
| **Search Algorithm** | In-memory index with regex | Beginner-friendly, acceptable performance |
| **Variant Generation** | Rule-based + glossary | Focus on fencing terms, no NLP complexity |
| **Cross-Language Mapping** | Glossary index on app load | Single source of truth, fast lookups |
| **Storage** | LocalStorage with monitoring | Sufficient capacity, simple API |
| **LLM Integration** | Both LM Studio & Ollama via REST | User choice, simple fetch() calls |
| **Highlighting** | Custom React component | Full control, show variant matches |

## Next Steps

Proceed to **Phase 1**: Generate data-model.md, contracts/, and quickstart.md based on these research findings.

# Implementation Plan: Treatise Search and Annotation System

**Branch**: `001-treatise-search-annotations` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-treatise-search-annotations/spec.md`

## Summary

Build a cross-treatise search tool with variant matching and cross-language support, saved searches, chapter annotations with tag filtering, and optional local LLM assistant. Core value: enable researchers to find technique terms (e.g., "mandritto") across all treatises in IT/FR/EN with automatic variant detection (mandritti, coup droit, forehand cut) and annotate chapters with personal notes and tags for focused study.

**Technical Approach**: Extend existing Next.js 15 application with new search infrastructure using browser-side indexing (no backend required). Leverage existing YAML data structure and glossary for cross-language mapping. Store annotations and saved searches in browser localStorage. Integrate local LLM via API calls to LM Studio or Ollama for P4 enhancement.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+, Python 3.13+ (for future data processing if needed)  
**Primary Dependencies**: Next.js 15 (App Router), React 18, js-yaml 4.1, Tailwind CSS 3.4  
**Storage**: Browser localStorage for annotations/saved searches; YAML files for treatise content (no database)  
**Testing**: Jest + React Testing Library (when tests added per constitution)  
**Target Platform**: Local web application (desktop browser, no mobile)  
**Project Type**: Web application (existing Next.js structure)  
**Performance Goals**: Search across ~100 chapters in <5 sec; filter 50+ results by tag in <3 sec; LLM response <10 sec  
**Constraints**: Local-only (no external services); runs on user's machine; no deployment; LLM via LM Studio/Ollama API  
**Scale/Scope**: Single user; ~3-5 treatises (~100 chapters total); up to 100 saved searches and 500 annotations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Content lives in `data/` YAML**: New search/annotation features do not modify treatise YAML files; annotations stored separately in localStorage  
✅ **Local-only**: No external services; LLM via local API (LM Studio/Ollama); no telemetry  
✅ **Tooling**: Continue using `npm` for JS/TS deps; `uv` for Python if data scripts needed  
✅ **Quality/format**: Preserve existing glossary `{term}` links; respect server/client boundaries (search runs client-side)  
✅ **Accessibility/UX**: Maintain readable typography; ensure search UI is keyboard-friendly; preserve existing glossary tooltips

**PASS**: All gates satisfied. Feature aligns with constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-treatise-search-annotations/
├── plan.md              # This file
├── research.md          # Phase 0: Research on search algorithms, localStorage limits, LLM integration
├── data-model.md        # Phase 1: Entities for SearchQuery, SavedSearch, Annotation, Tag
├── quickstart.md        # Phase 1: How to use search, annotations, LLM features
├── contracts/           # Phase 1: TypeScript interfaces for search/annotation data structures
│   ├── search.ts       # SearchQuery, SearchResult, SearchIndex interfaces
│   ├── annotations.ts  # Annotation, Tag, ChapterReference interfaces
│   └── llm.ts          # LLMConversation, LLMRequest, LLMResponse interfaces
└── tasks.md            # Phase 2: Implementation tasks (NOT created by /speckit.plan)
```

### Source Code (repository root)

Extending existing Next.js structure:

```text
src/
├── app/
│   ├── page.tsx                    # [MODIFY] Add search UI integration
│   ├── layout.tsx                  # [EXISTING] No changes
│   ├── globals.css                 # [EXISTING] No changes
│   └── search/                     # [NEW] Search page/route
│       └── page.tsx                # Search interface with results
├── components/
│   ├── Term.tsx                    # [EXISTING] Glossary tooltips
│   ├── TextParser.tsx              # [EXISTING] Parse {term} syntax
│   ├── BolognesePlatform.tsx       # [EXISTING] Main treatise viewer
│   ├── SearchBar.tsx               # [NEW] Search input with autocomplete
│   ├── SearchResults.tsx           # [NEW] Display search results with highlighting
│   ├── SavedSearchList.tsx         # [NEW] Manage saved searches
│   ├── AnnotationPanel.tsx         # [EXISTING - may need modification]
│   ├── AnnotationEditor.tsx        # [NEW] Add/edit annotations with tags
│   ├── TagFilter.tsx               # [NEW] Filter by annotation tags
│   └── LLMAssistant.tsx            # [NEW] Chat interface for local LLM
├── contexts/
│   ├── AnnotationContext.tsx       # [EXISTING - may need expansion]
│   ├── SearchContext.tsx           # [NEW] Manage search state
│   └── LLMContext.tsx              # [NEW] Manage LLM connection and conversation
├── lib/
│   ├── dataLoader.ts               # [EXISTING] Load YAML files
│   ├── annotation.ts               # [EXISTING] Annotation utilities
│   ├── searchEngine.ts             # [NEW] Core search logic with variant matching
│   ├── searchIndex.ts              # [NEW] Build and query search index
│   ├── languageVariants.ts         # [NEW] Generate word variants (FR/IT conjugations, plurals)
│   ├── glossaryMapper.ts           # [NEW] Map terms across languages using glossary
│   ├── localStorage.ts             # [NEW] Persist annotations and saved searches
│   ├── highlighter.ts              # [NEW] Highlight search terms in text
│   └── llmClient.ts                # [NEW] Connect to LM Studio/Ollama API
└── types/
    ├── search.ts                   # [NEW] TypeScript interfaces for search
    ├── annotation.ts               # [MODIFY] Expand annotation types
    └── llm.ts                      # [NEW] LLM request/response types

data/
├── glossary.yaml                   # [EXISTING] Used for cross-language mapping
└── treatises/                      # [EXISTING] Treatise YAML files
    ├── achille_marozzo_opera_nova_livre2.yaml
    └── ...

tests/                              # [NEW] Test structure (when tests added)
├── unit/
│   ├── searchEngine.test.ts
│   ├── languageVariants.test.ts
│   └── glossaryMapper.test.ts
└── integration/
    ├── search.test.tsx
    └── annotations.test.tsx
```

**Structure Decision**: Extending existing Next.js App Router structure with new components, contexts, and lib modules for search/annotation features. No backend required; all processing client-side or server-rendered. Follows existing `@/` absolute import pattern.

## Complexity Tracking

> **No constitution violations to justify.**

All complexity is inherent to feature requirements (search variants, cross-language matching, tag filtering). No additional architectural complexity introduced beyond what's necessary.

## Phase 0: Outline & Research

### Research Tasks

1. **Search Algorithm & Performance**
   - Research: Client-side full-text search approaches for ~100 chapters (~500KB total text)
   - Decision: Use in-memory search index built on app load vs. browser IndexedDB for persistence
   - Alternatives: Lunr.js (full-text search library) vs. custom regex-based search
   - Rationale: Balance simplicity (constitution principle) vs. performance (<5 sec requirement)

2. **Language Variant Generation**
   - Research: French verb conjugation patterns (common regular/irregular verbs)
   - Research: Italian plural rules and common technique term variations
   - Decision: Rule-based patterns vs. lookup tables for most common terms
   - Rationale: Full NLP libraries (like Spacy) too complex for beginner-friendly requirement; focus on common fencing terms

3. **Cross-Language Mapping**
   - Research: How to leverage existing glossary.yaml for term equivalents
   - Decision: Build glossary lookup index on app load; cache in memory
   - Alternatives: Pre-process glossary into search-optimized format vs. runtime lookup
   - Rationale: Keep data in single source (glossary.yaml) per constitution

4. **LocalStorage Limits & Strategy**
   - Research: Browser localStorage size limits (typically 5-10 MB)
   - Research: Estimate storage for 500 annotations + 100 saved searches (~1-2 MB)
   - Decision: Use JSON serialization; implement size monitoring and warnings
   - Rationale: localStorage sufficient for stated scale; avoid complexity of IndexedDB

5. **Local LLM Integration**
   - Research: LM Studio API vs. Ollama API endpoints and authentication
   - Research: Typical response times for local models (7B parameter models)
   - Decision: Support both via configurable base URL; use streaming responses if available
   - Alternatives: WebAssembly LLM (too slow) vs. external API (violates privacy)
   - Rationale: LM Studio/Ollama provide standard REST APIs; keep integration simple

6. **Search Result Highlighting**
   - Research: React libraries for text highlighting (react-highlight-words)
   - Decision: Custom highlighter to handle multiple language variants simultaneously
   - Rationale: Need to highlight all detected variants, not just exact matches

**Output**: research.md documenting all decisions with rationale

### Phase 0 Deliverable

`specs/001-treatise-search-annotations/research.md` containing:
- Search approach: in-memory index with regex-based variant matching
- Variant generation: rule-based for common French/Italian patterns + glossary lookup
- LocalStorage strategy: JSON serialization with size monitoring
- LLM integration: REST API calls to LM Studio/Ollama with configurable endpoint
- Highlighting: custom implementation supporting multiple variants

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

**Entities**:

1. **SearchQuery**
   - Fields: queryText (string), timestamp (Date), variants (string[]), languageMappings (Record<string, string[]>)
   - Validation: Non-empty queryText; auto-generate variants on creation
   - State: Created → Executing → Completed/Failed

2. **SearchResult**
   - Fields: chapterReference (ChapterReference), matchCount (number), languages (Language[]), preview (string), highlightPositions (number[])
   - Relationships: References Chapter via treatise filename + chapter ID
   - Validation: Valid chapter reference; matchCount > 0

3. **SavedSearch**
   - Fields: id (UUID), searchTerm (string), createdAt (Date), lastUsedAt (Date), usageCount (number)
   - Validation: Unique searchTerm; valid dates
   - Persistence: localStorage under key "spada:savedSearches"

4. **Annotation**
   - Fields: id (UUID), chapterReference (ChapterReference), text (string), tags (Tag[]), createdAt (Date), modifiedAt (Date)
   - Relationships: N annotations : 1 chapter (via reference)
   - Validation: Valid chapter reference; tags array can be empty; text can be empty if tags exist
   - Persistence: localStorage under key "spada:annotations"

5. **Tag**
   - Fields: name (string), color (string optional), usageCount (number)
   - Validation: Unique name (case-insensitive); color hex code if provided
   - Relationships: Many tags : many annotations

6. **ChapterReference**
   - Fields: treatiseFile (string), chapterId (string)
   - Validation: treatiseFile exists in data/treatises/; chapterId matches a section in that file
   - Purpose: Stable reference to chapter content (survives YAML updates if IDs unchanged)

7. **SearchIndex**
   - Fields: chapters (Map<ChapterReference, ChapterContent>), termIndex (Map<string, ChapterReference[]>), glossaryIndex (Map<string, CrossLanguageTerms>)
   - Purpose: In-memory structure for fast searches
   - Lifecycle: Built on app load; refreshed on data changes

### API Contracts (`contracts/`)

**TypeScript Interfaces**:

```typescript
// contracts/search.ts
export interface SearchQuery {
  queryText: string;
  timestamp: Date;
  variants: string[];
  languageMappings: Record<Language, string[]>;
}

export interface SearchResult {
  chapterReference: ChapterReference;
  treatiseTitle: string;
  chapterTitle: string;
  matchCount: number;
  languages: Language[];
  preview: string;
  highlightPositions: { start: number; end: number; variant: string }[];
}

export interface SearchIndex {
  buildIndex(treatises: Treatise[]): void;
  search(query: SearchQuery): SearchResult[];
  addVariants(term: string): string[];
  mapCrossLanguage(term: string, fromLang: Language): Record<Language, string[]>;
}

// contracts/annotations.ts
export interface Annotation {
  id: string;
  chapterReference: ChapterReference;
  text: string;
  tags: Tag[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface Tag {
  name: string;
  color?: string;
}

export interface AnnotationStorage {
  getAnnotations(chapterRef?: ChapterReference): Annotation[];
  saveAnnotation(annotation: Annotation): void;
  deleteAnnotation(id: string): void;
  filterByTags(tags: string[]): Annotation[];
  getAllTags(): Tag[];
}

// contracts/llm.ts
export interface LLMRequest {
  prompt: string;
  context: {
    currentChapter?: ChapterReference;
    searchResults?: SearchResult[];
    annotations?: Annotation[];
  };
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  tokensUsed?: number;
}

export interface LLMClient {
  connect(baseURL: string): Promise<boolean>;
  sendMessage(request: LLMRequest): Promise<LLMResponse>;
  streamMessage(request: LLMRequest): AsyncIterator<string>;
  disconnect(): void;
}
```

### Quickstart Guide (`quickstart.md`)

**User Flows**:

1. **Search for a technique**:
   ```
   1. Navigate to search page (/search)
   2. Type "mandritto" in search bar
   3. Press Enter or click Search button
   4. See results grouped by treatise with language badges (IT/FR/EN)
   5. Click a result to view full chapter with highlighted terms
   ```

2. **Save a search**:
   ```
   1. After performing a search
   2. Click "Save this search" button below search bar
   3. Search term appears in "Saved Searches" sidebar
   4. Click saved term to re-run search instantly
   ```

3. **Annotate a chapter**:
   ```
   1. View a chapter from search results or treatise browser
   2. Click "Add Annotation" button
   3. Enter note text (optional)
   4. Add tags (e.g., "beginner", "solo practice")
   5. Save annotation
   6. Annotation appears in sidebar and on chapter
   ```

4. **Filter search by tags**:
   ```
   1. Perform a search (e.g., "mandritto")
   2. In search results, click tag filter dropdown
   3. Select tags (e.g., "beginner")
   4. Results filtered to show only annotated chapters with those tags
   ```

5. **Ask LLM assistant** (P4):
   ```
   1. Configure LM Studio or Ollama URL in settings
   2. View a chapter
   3. Click "Ask Assistant" button
   4. Type question (e.g., "Summarize this chapter")
   5. Receive response with context from chapter and annotations
   ```

**Developer Setup**:
```bash
# Existing setup (no changes)
npm install
npm run dev

# For LLM assistant (P4)
# Install LM Studio or Ollama separately
# Configure base URL in app settings (default: http://localhost:1234/v1 for LM Studio)
```

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh copilot` after Phase 1 completion to update `.github/copilot-instructions.md` with:
- New search/annotation architecture
- LocalStorage schema and limits
- LLM integration patterns (LM Studio/Ollama APIs)
- Search variant generation rules

### Re-evaluate Constitution Check Post-Design

After completing Phase 1 design:

✅ **Content separation**: Annotations stored in localStorage, not in YAML files  
✅ **Local-only**: LLM via local API (LM Studio/Ollama); no external calls  
✅ **Beginner-friendly**: Using standard React patterns; no complex libraries (no Lunr.js, etc.)  
✅ **Quality**: Search does not break existing glossary links; client-side processing respects server/client boundaries  
✅ **Accessibility**: Search UI will use semantic HTML; keyboard shortcuts for common actions

**PASS**: Design maintains constitution compliance.

## Phase 2 Planning: Implementation Tasks

**Note**: Phase 2 (`tasks.md`) is generated by the `/speckit.tasks` command, NOT by `/speckit.plan`.

After completing Phase 0 (research) and Phase 1 (design), run `/speckit.tasks` to generate detailed implementation tasks organized by user story priority (P1 → P2 → P3 → P4).

Expected task breakdown:
- **Setup Phase**: Project structure scaffolding, TypeScript types
- **Foundational Phase**: SearchIndex, localStorage utilities, glossary mapping
- **P1 Phase (MVP)**: Search UI, variant generation, cross-language matching, result display
- **P2 Phase**: Saved searches UI and persistence
- **P3 Phase**: Annotation editor, tag filtering, annotation list view
- **P4 Phase**: LLM client, assistant UI, context integration

## Notes

- **Incremental Delivery**: Implement P1 first for immediate value (search); P2-P4 can be added later
- **No Backend**: All features run client-side or via Next.js server rendering; no API server needed
- **localStorage Limits**: Monitor usage; warn user if approaching 5 MB limit
- **LLM Optional**: P4 is a future enhancement; app fully functional without it
- **Testing Strategy**: Add tests for core search logic (variant generation, cross-language mapping) when constitution requires it
- **Performance**: Build search index on first load; cache in React context for subsequent searches
- **Glossary Dependency**: Search quality depends on completeness of glossary.yaml term equivalents

# Implementation Plan: Treatise Search and Annotation System

**Branch**: `001-treatise-search-annotations` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-treatise-search-annotations/spec.md`

## Summary

Build a cross-treatise search tool with classic search options (Match Case, Match Whole Word, Regex), chapter annotations with tag filtering, and optional local LLM assistant. Core value: enable researchers to find technique terms (e.g., "mandritto") across all treatises in IT/FR/EN using precise search controls and annotate chapters with personal notes and tags for focused study.

**Technical Approach**: Extend existing Next.js 15 application with new search infrastructure using browser-side indexing (no backend required). Leverage existing YAML data structure. Store annotations in YAML files via API and saved searches in browser localStorage. Integrate local LLM via API calls to LM Studio or Ollama for P3 enhancement.

## 🔍 Key Findings from Codebase Analysis

**CRITICAL DISCOVERIES**:

1. **Mature Annotation System Already Exists**
   - ✅ AnnotationContext, AnnotationPanel, AnnotationBadge components fully implemented
   - ✅ API routes `/api/annotations` handle YAML persistence (POST/GET)
   - ✅ Annotation model includes: `weapons`, `guards_mentioned`, `techniques`, `measures`, `strategy`, `note`
   - ⚠️ Original plan proposed "new annotation system with tags" - **CONFLICT RESOLVED**: Use existing annotations as tags

2. **Storage Architecture Clarification**
   - ✅ Annotations persist to YAML files (per constitution: data lives in `data/`)
   - ✅ localStorage used for temporary/preference data only (merged with YAML on load)
   - ⚠️ Original plan said "annotations in localStorage" - **CORRECTED**: Follow existing YAML pattern
   - ✅ Saved searches will use localStorage (user preference, not content)

3. **GitHub Issues Directly Addressed**
   - Issue #1 (OPEN): Refonte panneau filtres - P1 implements search bar with cumulative filtering
   - Issue #21 (OPEN): Surbrillance mots recherchés - P1 implements highlighting in search results
   - **Impact**: P1 completion will close 2 open issues

4. **Existing Components to Leverage**
   - ✅ TextParser: Already handles `{term}` syntax and glossary links
   - ✅ MeasureProgressBar: Visual measure progression (recent addition)
   - ✅ ComparisonModal: Translation comparison UI exists
   - ✅ BolognesePlatform: Main viewer with weapon filtering already working

5. **Architecture Alignment**
   - ✅ Server-side data loading via `dataLoader.ts` (fs + js-yaml)
   - ✅ Client components with `'use client'` directive correctly used
   - ✅ Absolute imports with `@/` prefix established
   - ✅ Constitution compliance: Content separation, local-only, beginner-friendly tools

**PLAN ADJUSTMENTS**:
- Use existing annotation fields (weapons/guards/techniques) as filterable "tags" instead of creating new tag system
- SearchBar directly updates BolognesePlatform with matching chapters (no separate SearchResults component)
- BolognesePlatform displays multiple matching chapters with smooth PDF-like pagination/virtualization
- Extend AnnotationContext with search-specific filter methods
- Follow existing YAML persistence pattern for any annotation extensions
- **REMOVED**: Saved Searches feature (User Story 2) - SearchBar executes searches directly without save/recall capability

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

✅ **Content lives in `data/` YAML**: ⚠️ **PARTIAL CONFLICT** - Current annotation system saves to YAML files via API route (`/api/annotations`), NOT localStorage as initially planned. This violates the original plan but ALIGNS with constitution (YAML = authoritative). Need to clarify: saved searches in localStorage (user preference), but annotations follow existing pattern (YAML persistence).  
✅ **Local-only**: No external services; LLM via local API (LM Studio/Ollama); no telemetry  
✅ **Tooling**: Continue using `npm` for JS/TS deps; `uv` for Python (extraction scripts exist)  
✅ **Quality/format**: Preserve existing glossary `{term}` links; respect server/client boundaries (search runs client-side)  
✅ **Accessibility/UX**: Maintain readable typography; ensure search UI is keyboard-friendly; preserve existing glossary tooltips

**FINDINGS FROM CODEBASE ANALYSIS**:
- ✅ Annotation system ALREADY EXISTS and is MATURE (AnnotationContext, AnnotationPanel, API routes)
- ✅ Annotations persist to YAML via POST /api/annotations (writes to `data/treatises/*.yaml`)
- ✅ Annotations loaded on app start (GET /api/annotations) and merged with localStorage
- ✅ Current annotation model supports: `note`, `weapons`, `guards_mentioned`, `techniques`, `measures[]`, `strategy[]`
- ⚠️ Plan's "new annotation system with tags" CONFLICTS with existing annotation system
- ⚠️ Need to EXTEND existing system, not replace it

**PASS WITH CLARIFICATIONS**: Feature aligns with constitution but must integrate with existing annotation infrastructure.

**GITHUB ISSUES CONTEXT**:
- Issue #1 (OPEN): Refonte panneau filtres - DIRECTLY addressed by P1 search implementation
- Issue #21 (OPEN): Surbrillance mots recherchés - DIRECTLY addressed by P1 highlighting
- Issues closed: #5, #15, #19 confirm annotation system maturity and Python script infrastructure
- P1 completion will close Issues #1 and #21

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

**IMPORTANT**: Codebase already has mature annotation system. This feature adds SEARCH + extends annotations.

Extending existing Next.js structure:

```text
src/
├── app/
│   ├── page.tsx                    # [EXISTING] Loads BolognesePlatform with AnnotationProvider
│   ├── layout.tsx                  # [EXISTING] No changes
│   ├── globals.css                 # [EXISTING] No changes
│   ├── api/
│   │   ├── annotations/route.ts    # [EXISTING] POST (save to YAML) / GET (load from YAML)
│   │   ├── glossary/route.ts       # [EXISTING] GET glossary data
│   │   └── treatises/[filename]/route.ts # [EXISTING] GET treatise by filename
│   └── search/                     # [NEW] Search page/route (optional - may integrate in main page)
│       └── page.tsx                # Search interface with results
├── components/
│   ├── Term.tsx                    # [EXISTING] Glossary tooltips
│   ├── TextParser.tsx              # [EXISTING] Parse {term} syntax
│   ├── BolognesePlatform.tsx       # [EXISTING-MODIFY] Main treatise viewer - add search bar and chapter pagination for results
│   ├── AnnotationPanel.tsx         # [EXISTING - MATURE] Full annotation UI with tabs (armes/gardes/techniques)
│   ├── AnnotationBadge.tsx         # [EXISTING] Annotation badge/button for each section
│   ├── MeasureProgressBar.tsx      # [EXISTING] Visual measure progression (Gioco Largo → Presa)
│   ├── ComparisonModal.tsx         # [EXISTING] Compare translations modal
│   ├── SearchBar.tsx               # [NEW] Search input with variant suggestions - triggers BolognesePlatform update
│   ├── TagFilter.tsx               # [NEW] Filter search results by annotation metadata and treatise metadata (weapons/guards/techniques/master/work/book/year)
│   └── LLMAssistant.tsx            # [NEW-P4] Chat interface for local LLM
├── contexts/
│   ├── AnnotationContext.tsx       # [EXISTING - ROBUST] Manages annotations, localStorage merge, server sync
│   └── LLMContext.tsx              # [NEW-P4] Manage LLM connection and conversation
├── lib/
│   ├── dataLoader.ts               # [EXISTING] Load YAML files
│   ├── annotation.ts               # [EXISTING] Annotation utilities
│   ├── searchEngine.ts             # [NEW] Core search logic with variant matching
│   ├── searchIndex.ts              # [NEW] Build and query search index
│   ├── languageVariants.ts         # [NEW] Generate word variants (FR/IT conjugations, plurals)
│   ├── glossaryMapper.ts           # [NEW] Map terms across languages using glossary
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
   - Decision: Use in-memory search index built on app load
   - Implementation: Support "Match Case", "Match Whole Word", and "Regular Expression" modes
   - Rationale: Balance simplicity (constitution principle) vs. performance (<5 sec requirement)

2. **LocalStorage Limits & Strategy**
   - Research: Browser localStorage size limits (typically 5-10 MB)
   - Research: Estimate storage for 500 annotations + 100 saved searches (~1-2 MB)
   - Decision: Use JSON serialization; implement size monitoring and warnings
   - Rationale: localStorage sufficient for stated scale; avoid complexity of IndexedDB

3. **Local LLM Integration**
   - Research: LM Studio API vs. Ollama API endpoints and authentication
   - Research: Typical response times for local models (7B parameter models)
   - Decision: Support both via configurable base URL; use streaming responses if available
   - Alternatives: WebAssembly LLM (too slow) vs. external API (violates privacy)
   - Rationale: LM Studio/Ollama provide standard REST APIs; keep integration simple

4. **Search Result Highlighting**
   - Research: React libraries for text highlighting (react-highlight-words)
   - Decision: Custom highlighter to handle regex matches and case sensitivity
   - Rationale: Need to highlight matches based on active search options (e.g., regex patterns)

**Output**: research.md documenting all decisions with rationale

### Phase 0 Deliverable

`specs/001-treatise-search-annotations/research.md` containing:
- Search approach: in-memory index with classic search options
- LocalStorage strategy: JSON serialization with size monitoring
- LLM integration: REST API calls to LM Studio/Ollama with configurable endpoint
- Highlighting: custom implementation supporting regex and case sensitivity

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

**Entities**:

1. **SearchQuery**
   - Fields: queryText (string), timestamp (Date), options (SearchOptions)
   - Validation: Non-empty queryText
   - State: Created → Executing → Completed/Failed

2. **SearchOptions**
   - Fields: matchCase (boolean), matchWholeWord (boolean), useRegex (boolean)
   - Default: All false

3. **SearchResult**
   - Fields: chapterReference (ChapterReference), matchCount (number), languages (Language[]), preview (string), highlightPositions (number[])
   - Relationships: References Chapter via treatise filename + chapter ID
   - Validation: Valid chapter reference; matchCount > 0

4. **Annotation** (EXISTING - extends current implementation)
   - Current fields: id, note, weapons[], guards_mentioned[], techniques[], measures[], strategy[]
   - Already persists to YAML via `/api/annotations` POST
   - Already loaded on app start via `/api/annotations` GET
   - AnnotationContext manages state with localStorage fallback
   - **For search feature**: Use existing fields as "tags" (weapons/guards/techniques are tag equivalents)
   - **NO NEW TAG SYSTEM NEEDED** - existing metadata serves this purpose

5. **ChapterReference**
   - Fields: treatiseFile (string), chapterId (string)
   - Validation: treatiseFile exists in data/treatises/; chapterId matches a section in that file
   - Purpose: Stable reference to chapter content (survives YAML updates if IDs unchanged)

6. **SearchIndex**
   - Fields: chapters (Map<ChapterReference, ChapterContent>)
   - Purpose: In-memory structure for fast searches
   - Lifecycle: Built on app load; refreshed on data changes

### API Contracts (`contracts/`)

**TypeScript Interfaces**:

```typescript
// contracts/search.ts
export interface SearchOptions {
  matchCase: boolean;
  matchWholeWord: boolean;
  useRegex: boolean;
}

export interface SearchQuery {
  queryText: string;
  timestamp: Date;
  options: SearchOptions;
}

export interface SearchResult {
  chapterReference: ChapterReference;
  treatiseTitle: string;
  chapterTitle: string;
  matchCount: number;
  languages: Language[];
  preview: string;
  highlightPositions: { start: number; end: number }[];
}

export interface SearchIndex {
  buildIndex(treatises: Treatise[]): void;
  search(query: SearchQuery): SearchResult[];
}

// contracts/annotations.ts
// NOTE: Annotation interface ALREADY EXISTS in src/lib/annotation.ts
// This contract documents EXISTING system + search integration extensions

export interface Annotation {
  id: string;
  note: string | null;
  weapons: Weapon[] | null;        // Used as searchable tags
  guards_mentioned: Guard[] | null; // Used as searchable tags
  techniques: string[] | null;      // Used as searchable tags
  measures: Measure[] | null;
  strategy: Strategy[] | null;
}

// Annotation enums already defined in src/lib/annotation.ts:
// WEAPONS, GUARDS, MEASURES, STRATEGIES

export interface AnnotationFilterOptions {
  weapons?: Weapon[];
  guards?: Guard[];
  techniques?: string[];
}

export interface AnnotationSearchExtensions {
  // Extend existing useAnnotations hook with search-specific methods
  filterAnnotationsByMetadata(filter: AnnotationFilterOptions): Map<string, Annotation>;
  getUniqueWeapons(): Weapon[];
  getUniqueGuards(): Guard[];
  getUniqueTechniques(): string[];
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
   1. Open the application (BolognesePlatform loads)
   2. Type "mandritto" in SearchBar at top left
   3. Optionally toggle "Match Case", "Match Whole Word", or "Use Regex"
   4. Press Enter or click Search button
   5. BolognesePlatform updates to display all matching chapters
   6. Multiple chapters display with smooth PDF-like scrolling/pagination
   7. Matched terms are highlighted in chapter text
   ```

2. **Navigate through search results**:
   ```
   1. View a chapter from treatise browser
   2. Click "Annotation" badge/button on section
   3. AnnotationPanel opens on right side
   4. Add/edit: note, weapons, guards_mentioned, techniques, measures, strategy
   5. Auto-saves on close (persists to YAML via API)
   6. AnnotationBadge shows on annotated sections
   ```

4. **Filter search by annotation metadata** (NEW - extends existing annotations):
   ```
   1. Perform a search (e.g., "mandritto")
   2. In search results sidebar, use TagFilter dropdowns for annotation metadata
   3. Select weapons (e.g., "spada_brocchiero"), guards, or techniques
   4. Results filtered to show only chapters with matching annotation metadata
   5. Leverages existing annotation.weapons/guards_mentioned/techniques fields
   ```

5. **Filter search by treatise metadata** (NEW - extends filtering):
   ```
   1. Perform a search (e.g., "mandritto")
   2. In search results sidebar, use MetadataFilter dropdowns
   3. Select master (e.g., "Marozzo"), work, book, or year
   4. Results filtered to show only chapters from specified treatise/book/year
   5. Can combine annotation and metadata filters (cumulative AND logic)
   ```

6. **Ask LLM assistant** (P3):
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
- Search options and regex support

### Re-evaluate Constitution Check Post-Design

After completing Phase 1 design:

✅ **Content separation**: Annotations stored in YAML files via API (follows existing pattern), not in localStorage  
✅ **Local-only**: LLM via local API (LM Studio/Ollama); no external calls; no saved searches persistence required  
✅ **Beginner-friendly**: Using standard React patterns; no complex libraries (no Lunr.js, etc.)  
✅ **Quality**: Search does not break existing glossary links; client-side processing respects server/client boundaries  
✅ **Accessibility**: Search UI will use semantic HTML; keyboard shortcuts for common actions

**PASS**: Design maintains constitution compliance. Removed saved searches feature (User Story 2) eliminates need for localStorage persistence strategy.

## Phase 2 Planning: Implementation Tasks

**Note**: Phase 2 (`tasks.md`) is generated by the `/speckit.tasks` command, NOT by `/speckit.plan`.

After completing Phase 0 (research) and Phase 1 (design), run `/speckit.tasks` to generate detailed implementation tasks organized by user story priority (P1 → P2 → P3 → P4).

Expected task breakdown:
- **Setup Phase**: Project structure scaffolding, TypeScript types
- **Foundational Phase**: SearchIndex, search options logic
- **P1 Phase (MVP)**: Search UI with options, result display in BolognesePlatform
- **P2 Phase (was P3)**: Annotation editor extensions, tag filtering, annotation list view
- **P3 Phase (was P4)**: LLM client, assistant UI, context integration

## Alignment with Existing GitHub Issues

**Related Open Issues**:

1. **Issue #21: Surbrillance des mots recherchés dans le filtre**
   - **Status**: OPEN (created 2025-12-04)
   - **Relation**: DIRECTLY ADDRESSED by P1 (search with highlighting)
   - **Implementation**: SearchResults component will highlight matched terms in text
   - **Note**: Issue mentions using TextParser component - confirmed this is correct approach

2. **Issue #1: Refonte du Panneau de Filtres (Gauche)**
   - **Status**: OPEN (created 2025-11-29)
   - **Relation**: ALIGNED with P1 search bar implementation
   - **Requirements**: Search field with tag accumulation, weapons dropdown, authors dropdown
   - **Implementation**: SearchBar integrates into BolognesePlatform with TagFilter component for result filtering
   - **Note**: Issue proposes cumulative AND filtering - matches spec FR-003; no separate saved searches feature needed

3. **Issue #17: Améliorer la visibilité du bouton d'annotation actif**
   - **Status**: OPEN (created 2025-11-29)
   - **Relation**: ORTHOGONAL to search feature but affects UX
   - **Note**: Should be implemented alongside search to maintain consistent UX
   - **Scope**: Visual highlight for active annotation button; remove collapse button

4. **Issue #7: Implémentation d'un Module Statistiques**
   - **Status**: OPEN (created 2025-11-29)
   - **Relation**: COMPLEMENTARY to search/annotations
   - **Note**: Statistics module could leverage search index for performance
   - **Scope**: Out of scope for this feature (P1-P4); can be separate feature

**Related Closed Issues (informational)**:

5. **Issue #19: Mettre à jour extracteur_string.py** (CLOSED)
   - Confirms Python script for YAML generation exists
   - Scripts in `scripts/` directory already established

6. **Issue #15: Remplacer l'affichage de la mesure par une barre de progression** (CLOSED)
   - MeasureProgressBar component now exists
   - Confirms annotation system maturity

7. **Issue #5: Refonte du Panneau d'Annotations** (CLOSED)
   - AnnotationPanel with tabs (armes/gardes/techniques) implemented
   - Auto-save on close implemented
   - Confirms current annotation architecture

**Key Insights**:
- Issue #21 expects highlighting AFTER Issue #1 filter refonte
- This feature COMBINES both: search (Issue #21) + filter refonte (Issue #1)
- Should close Issues #1 and #21 upon P1 completion
- Issue #17 is independent but recommended for consistency

## Notes

- **Incremental Delivery**: Implement P1 first for immediate value (search); P2-P3 can be added later
- **Issue Resolution**: P1 completion closes Issues #1 and #21; consider Issue #17 for UX consistency
- **No Backend**: All features run client-side or via Next.js server rendering; no API server needed
- **No Saved Searches**: User Story 2 (saved searches) removed per user directive; SearchBar executes searches directly without save/recall
- **Smooth Chapter Display**: BolognesePlatform must handle multiple matching chapters with PDF-like fluidity (virtualization/lazy-loading recommended for smooth scrolling)
- **LLM Optional**: P3 is a future enhancement; app fully functional without it
- **Testing Strategy**: Add tests for core search logic (regex, case sensitivity) when constitution requires it
- **Performance**: Build search index on first load; cache in React context for subsequent searches
- **Glossary Dependency**: Glossary remains the source of truth for term definitions, but search no longer depends on it for variant matching
- **Annotation Integration**: Use existing annotation metadata (weapons/guards/techniques) as search filters - no new tag system needed

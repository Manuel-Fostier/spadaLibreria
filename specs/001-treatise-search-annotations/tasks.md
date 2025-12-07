# Tasks: Treatise Search and Annotation System

**Input**: Design documents from `/specs/001-treatise-search-annotations/`
**Prerequisites**: plan.md, spec.md, research.md, CODEBASE_ANALYSIS.md

**Tests**: Tests are NOT explicitly requested in the spec. Following constitution: "Add tests when needed" - focusing on implementation first, tests can be added later if constitution requires.

**Organization**: Tasks are grouped by user story (P1 → P2 → P3 → P4) to enable independent implementation and testing.

**Context**: This feature extends an existing mature Next.js application with annotation system already implemented. Focus on adding SEARCH capabilities and leveraging existing annotation infrastructure.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4) - omitted for Setup/Foundational/Polish phases
- All paths are absolute from repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create new type definitions, contexts, and component scaffolding

- [ ] T001 Create TypeScript interfaces for search in `src/types/search.ts` (SearchQuery, SearchResult, SearchIndex, ChapterReference)
- [ ] T002 [P] Create TypeScript interfaces for saved searches in `src/types/savedSearch.ts` (SavedSearch, SavedSearchStorage)
- [ ] T003 [P] Create LLM types in `src/types/llm.ts` (LLMRequest, LLMResponse, LLMConfig) for P4 foundation

**Checkpoint**: Type system extended with search-specific interfaces

---

## Phase 2: Foundational (Blocking Prerequisites for Search)

**Purpose**: Core search infrastructure that MUST be complete before any user story can work

**⚠️ CRITICAL**: No search functionality can work until this phase is complete

- [ ] T004 Implement glossary index builder in `src/lib/glossaryMapper.ts` (buildGlossaryIndex, mapCrossLanguage functions per research.md)
- [ ] T005 [P] Implement language variant generator in `src/lib/languageVariants.ts` (generateVariants for IT/FR patterns per research.md)
- [ ] T006 [P] Implement search index builder in `src/lib/searchIndex.ts` (buildSearchIndex from treatise data, chapter indexing)
- [ ] T007 Implement core search engine in `src/lib/searchEngine.ts` (search function with variant + cross-language matching per research.md)
- [ ] T008 [P] Implement text highlighter utility in `src/lib/highlighter.ts` (highlightMatches function for search results)
- [ ] T009 [P] Implement localStorage manager in `src/lib/localStorage.ts` (generic save/load/clear with size monitoring per research.md)
- [ ] T010 Create SearchContext in `src/contexts/SearchContext.tsx` (manages search state, index, saved searches, loads glossary/treatises on mount)

**Checkpoint**: Foundation ready - search can now be implemented in components

---

## Phase 3: User Story 1 - Cross-Treatise Search with Variants (Priority: P1) 🎯 MVP

**Goal**: Enable researchers to search for technique terms across all treatises with automatic variant and cross-language matching

**Independent Test**: Type "mandritto" in search bar → Press Enter → See all chapters containing "mandritto", "mandritti", "coup droit", "forehand cut" from all treatises with highlights

**GitHub Issues**: This phase CLOSES [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1) (Refonte panneau filtres) and [Issue #21](https://github.com/Manuel-Fostier/spadaLibreria/issues/21) (Surbrillance mots recherchés)

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create SearchBar component in `src/components/SearchBar.tsx` (input field, Enter to search, displays active search terms with [x] to remove) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T012 [P] [US1] Create SearchResults component in `src/components/SearchResults.tsx` (displays chapters with preview, highlight matches, language badges IT/FR/EN) - [Issue #21](https://github.com/Manuel-Fostier/spadaLibreria/issues/21)
- [ ] T013 [US1] Modify BolognesePlatform in `src/components/BolognesePlatform.tsx` to integrate SearchBar into left sidebar (replace/extend existing weapon filter) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T014 [US1] Add SearchContext provider to app root in `src/app/page.tsx` (wrap AnnotationProvider with SearchProvider)
- [ ] T015 [US1] Implement search result click navigation in BolognesePlatform (clicking result scrolls to chapter and opens it) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T016 [US1] Extend TextParser in `src/components/TextParser.tsx` to support highlighting search terms (add optional highlightTerms prop) - [Issue #21](https://github.com/Manuel-Fostier/spadaLibreria/issues/21)
- [ ] T017 [US1] Add keyboard shortcuts for search (Ctrl+F to focus search bar, Escape to clear search) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T018 [US1] Implement "No results found" state in SearchResults with suggestions for related terms from glossary - [Issue #21](https://github.com/Manuel-Fostier/spadaLibreria/issues/21)

**Checkpoint**: User Story 1 complete - cross-treatise search with highlighting fully functional, Issues #1 and #21 can be closed

---

## Phase 4: User Story 2 - Saved Searches (Priority: P2)

**Goal**: Allow researchers to save frequently searched terms for instant re-use across sessions

**Independent Test**: Search for "mandritto" → Click "Save this search" → Close and reopen app → Click "mandritto" in saved list → Same results appear instantly

### Implementation for User Story 2

- [ ] T019 [P] [US2] Create SavedSearchList component in `src/components/SavedSearchList.tsx` (displays saved terms, click to execute, remove button)
- [ ] T020 [US2] Add "Save this search" button to SearchBar component in `src/components/SearchBar.tsx` (checks for duplicates)
- [ ] T021 [US2] Implement saved search persistence in SearchContext (save/load from localStorage on mount/unmount per research.md storage strategy)
- [ ] T022 [US2] Integrate SavedSearchList into BolognesePlatform sidebar below SearchBar in `src/components/BolognesePlatform.tsx`
- [ ] T023 [US2] Add usage tracking for saved searches (update lastUsedAt and usageCount on click, display in UI)
- [ ] T024 [US2] Implement search history management (limit to 100 saved searches, show warning if approaching limit per research.md)

**Checkpoint**: User Story 2 complete - saved searches persist and can be re-executed with single click

---

## Phase 5: User Story 3 - Annotation Filtering (Priority: P3)

**Goal**: Enable filtering search results by existing annotation metadata (weapons, guards, techniques) to focus on specific aspects

**Independent Test**: Search for "mandritto" → Apply filter "weapons: spada_brocchiero" → See only chapters with that weapon annotation

**Note**: This extends EXISTING annotation system (AnnotationContext, AnnotationPanel already implemented) - no new annotation UI needed

**GitHub Issues**: Related to [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1) (part of left panel refonte)

### Implementation for User Story 3

- [ ] T025 [P] [US3] Create TagFilter component in `src/components/TagFilter.tsx` (dropdowns for weapons, guards, techniques from annotation enums) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T026 [US3] Add filter methods to AnnotationContext in `src/contexts/AnnotationContext.tsx` (filterByWeapons, filterByGuards, filterByTechniques, getUniqueTags) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T027 [US3] Integrate TagFilter into SearchResults component (filters applied to search results, cumulative AND logic) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T028 [US3] Implement annotation badge indicators in SearchResults (show which chapters have annotations, display tag counts) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T029 [US3] Add "Show only annotated chapters" toggle in search UI (quick filter for chapters with any annotation) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)
- [ ] T030 [US3] Implement multi-tag filtering (select multiple weapons/guards/techniques, use OR within category, AND across categories) - [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1)

**Checkpoint**: User Story 3 complete - search results can be filtered by annotation metadata, researchers can focus on specific contexts

---

## Phase 6: User Story 4 - Local LLM Assistant (Priority: P4)

**Goal**: Provide contextual research assistance via local LLM without sending data to external services

**Independent Test**: View a chapter → Open LLM assistant → Ask "Summarize this chapter" → Receive summary based on chapter content (no external API calls)

**Note**: This is a FUTURE ENHANCEMENT - optional for MVP

### Implementation for User Story 4

- [ ] T031 [P] [US4] Create LLMClient class in `src/lib/llmClient.ts` (connect to LM Studio/Ollama, sendMessage, streamMessage methods per research.md)
- [ ] T032 [P] [US4] Create LLMContext in `src/contexts/LLMContext.tsx` (manages connection state, conversation history, config for base URL)
- [ ] T033 [US4] Create LLMAssistant component in `src/components/LLMAssistant.tsx` (chat UI, message history, streaming response display)
- [ ] T034 [US4] Add LLM configuration UI (settings panel to choose LM Studio vs Ollama, set base URL, test connection)
- [ ] T035 [US4] Implement context injection for LLM (current chapter content, search results, user annotations sent as context per research.md)
- [ ] T036 [US4] Add LLMAssistant toggle button to BolognesePlatform (opens assistant panel on right side, collapses AnnotationPanel if open)
- [ ] T037 [US4] Implement error handling for LLM unavailability (graceful degradation, clear error messages if model not running)
- [ ] T038 [US4] Add streaming progress indicator for LLM responses (loading state, token-by-token display)

**Checkpoint**: User Story 4 complete - local LLM assistant functional with full context awareness

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories and final validation

**GitHub Issues**: Related to [Issue #17](https://github.com/Manuel-Fostier/spadaLibreria/issues/17) (annotation UX consistency)

- [ ] T039 [P] Update README.md with search feature documentation (how to use search, saved searches, annotation filtering, LLM setup)
- [ ] T040 [P] Update `.github/copilot-instructions.md` with search architecture (SearchContext, variant generation rules, localStorage patterns)
- [ ] T041 Add performance monitoring for search operations (log search time, index build time, warn if >5 sec per success criteria)
- [ ] T042 [P] Implement localStorage size warnings (monitor storage usage, warn at 4MB threshold per research.md)
- [ ] T043 Add keyboard shortcuts documentation (in-app help tooltip showing Ctrl+F, Escape, etc.)
- [ ] T044 [P] Add loading states for all async operations (search index building, LLM responses, annotation saves)
- [ ] T045 Optimize search index build performance (lazy loading, chunked processing if needed for scale)
- [ ] T046 [P] Add accessibility improvements (ARIA labels for search components, keyboard navigation for results, screen reader support)
- [ ] T047 Code review and refactoring (extract common patterns, remove duplication, ensure TypeScript strict mode compliance)
- [ ] T048 Run validation against quickstart.md user flows (once quickstart.md is created in Phase 1 design)

**Checkpoint**: Feature complete, polished, and documented

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
Phase 3: US1 (P1) - MVP Search ← Start here for immediate value
    ↓ (optional: can skip to Phase 7)
Phase 4: US2 (P2) - Saved Searches
    ↓ (optional)
Phase 5: US3 (P3) - Annotation Filtering
    ↓ (optional)
Phase 6: US4 (P4) - LLM Assistant
    ↓
Phase 7: Polish
```

### User Story Dependencies

- **US1 (P1)**: Depends ONLY on Phase 2 (Foundational) - **MVP = Phase 1 + 2 + 3**
- **US2 (P2)**: Depends on US1 (uses SearchContext and SearchBar)
- **US3 (P3)**: Depends on US1 (filters SearchResults) - can be done before or after US2
- **US4 (P4)**: Independent of US2/US3 but benefits from their context

### Within Each User Story

**US1 (Search)**:
1. T011, T012 (components) in parallel
2. T013 (integration) after T011
3. T014 (context wiring) after T013
4. T015-T018 (enhancements) can be done in any order after T014

**US2 (Saved Searches)**:
1. T019 (component) and T020 (button) in parallel
2. T021 (persistence) can overlap with T019/T020
3. T022-T024 (integration & enhancements) sequential

**US3 (Annotation Filtering)**:
1. T025 (TagFilter) and T026 (context methods) in parallel
2. T027-T030 (integration & features) sequential after T025/T026

**US4 (LLM Assistant)**:
1. T031, T032, T033 (client, context, component) all in parallel
2. T034-T038 (integration & features) sequential

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002 and T003 can run in parallel with T001

**Foundational Phase (Phase 2)**:
- T005, T006, T008, T009 can all run in parallel after T004 completes
- T007 depends on T004, T005, T006
- T010 depends on T007

**US1 Implementation**:
- T011 and T012 in parallel (different components)
- Once US1 is complete, US2 and US3 can be implemented in parallel by different developers

**Polish Phase**:
- T039, T040, T042, T044, T046 can all run in parallel (different files)

---

## Parallel Example: Foundational Phase (2 developers)

### Developer A (Search Infrastructure)
```bash
# T004 - Glossary mapper
git checkout -b feat/glossary-mapper
# implement buildGlossaryIndex, mapCrossLanguage
# test with sample glossary terms
git commit -m "feat: implement glossary cross-language mapping"

# T006 - Search index (parallel with Dev B)
git checkout -b feat/search-index
# implement buildSearchIndex for treatises
git commit -m "feat: implement search index builder"
```

### Developer B (Utilities)
```bash
# T005 - Variant generator (parallel with Dev A's T004)
git checkout -b feat/variant-generator
# implement generateVariants for IT/FR patterns
git commit -m "feat: implement language variant generator"

# T008 - Highlighter (parallel with Dev A's T006)
git checkout -b feat/highlighter
# implement highlightMatches utility
git commit -m "feat: implement text highlighter"
```

### Both developers then:
```bash
# T007 - Search engine (requires T004, T005, T006)
# One developer implements while other does T009, T010
```

---

## Implementation Strategy

### MVP Approach (Fastest Path to Value)

**Minimal Viable Product** = Phase 1 + Phase 2 + Phase 3 (User Story 1)

This delivers:
- ✅ Cross-treatise search with variants
- ✅ Cross-language matching via glossary
- ✅ Result highlighting
- ✅ Closes GitHub Issues #1 and #21

**Estimated effort**: 
- Phase 1 Setup: 2-3 hours
- Phase 2 Foundational: 8-10 hours (complex search logic)
- Phase 3 US1: 6-8 hours (UI integration)
- **Total MVP**: ~16-21 hours for single developer

### Incremental Delivery

After MVP (Phase 3), deliver in priority order:

1. **Phase 4 (US2 - Saved Searches)**: 3-4 hours
   - Quick win, high value for regular users

2. **Phase 5 (US3 - Annotation Filtering)**: 4-5 hours
   - Leverages existing annotation infrastructure
   - High value for focused research

3. **Phase 6 (US4 - LLM Assistant)**: 8-12 hours
   - Most complex, optional enhancement
   - Requires local LLM setup by user

4. **Phase 7 (Polish)**: 2-4 hours
   - Documentation and refinement

### Testing Strategy

**Per constitution**: "Add tests when needed" - tests not mandatory for initial implementation

**Recommended test additions** (if constitution later requires):
- Unit tests for `languageVariants.ts` (variant generation patterns)
- Unit tests for `glossaryMapper.ts` (cross-language mapping)
- Integration tests for `searchEngine.ts` (search with real treatise data)
- E2E tests for search user flows (Playwright or similar)

**Testing location**: Follow existing pattern (Jest + React Testing Library)
- Unit tests: `tests/unit/` or co-located with source files
- Integration tests: `tests/integration/`

---

## Success Validation Checklist

After implementation, verify against spec.md success criteria:

- [ ] **SC-001**: Search across 3 treatises completes in <5 seconds
- [ ] **SC-002**: Variants and cross-language terms found automatically (test "mandritto" → finds "mandritti", "coup droit", "forehand cut")
- [ ] **SC-003**: Saved searches executable in <2 clicks
- [ ] **SC-004**: Saved searches persist across sessions (100% reliability)
- [ ] **SC-005**: Tag filtering of 50+ results in <3 seconds
- [ ] **SC-006**: LLM responses in <10 seconds (P4 only)
- [ ] **SC-007**: 100 saved searches + 500 annotations without performance degradation
- [ ] **SC-008**: 90%+ recall for technique terms (manual validation with known terms)
- [ ] **SC-009**: Annotate chapter with 3 tags in <30 seconds (existing feature - validate not broken)
- [ ] **SC-010**: Search term highlighting visible immediately (no scrolling for first match)

---

## Notes

- **Existing Infrastructure**: Leverage mature AnnotationContext, AnnotationPanel, TextParser - do not recreate
- **Constitution Compliance**: All data operations follow existing patterns (YAML for content, localStorage for preferences)
- **GitHub Issues**: P1 completion closes Issues #1 and #21 - update issues when deployed
- **Beginner-Friendly**: All implementations use standard React patterns, no complex libraries (no Lunr.js, no NLP)
- **Performance**: Build search index once on app load, cache in React context (per research.md decisions)
- **Storage**: Saved searches in localStorage only (~11KB for 100 items), annotations continue using existing YAML persistence
- **LLM Setup**: P4 requires user to install LM Studio or Ollama separately - document in README
- **File Paths**: All paths assume repository root; adjust if project structure differs from plan.md
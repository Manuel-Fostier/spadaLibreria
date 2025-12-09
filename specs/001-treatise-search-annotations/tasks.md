# Tasks: Treatise Search and Annotation System (v2.0)

**Input**: Design documents from `/specs/001-treatise-search-annotations/`
**Prerequisites**: plan.md, spec.md (v2.0), research.md, CODEBASE_ANALYSIS.md

**Updated**: 2025-12-09 - Integration of 7 new features from spec.md v2.0 update
- FR-002a: Similar words suggestion dropdown
- FR-012a & FR-012b: Default annotation panel + button highlighting + smart scrolling
- FR-009: Sword condition enum (sharp/blunt)
- FR-021: Annotation display configuration menu
- FR-022: Import file conflict handling

**Tests**: Tests are NOT explicitly requested in the spec. Following constitution: "Add tests when needed" - focusing on implementation first, tests can be added later if constitution requires.

**Organization**: Phase 0 (Design & Mockups) → Phase 1-7 (Implementation by user story P1 → P4)

**Context**: This feature extends an existing mature Next.js application with annotation system already implemented. Focus on adding SEARCH capabilities and leveraging existing annotation infrastructure.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4) - omitted for Setup/Foundational/Polish phases
- All paths are absolute from repository root

---

## Phase 0: Design & Mockups (BEFORE Implementation)

**Purpose**: Create UI/UX mockups for all features before writing code (user requirement: "maquettes avant l'implémentation")

**Status**: Deliverables ready in `specs/001-treatise-search-annotations/mockups/`

- [ ] T000 [P] Create mockups directory structure in `specs/001-treatise-search-annotations/mockups/`
- [ ] T001 [P] [US1] Create SearchBar.md mockup in `specs/001-treatise-search-annotations/mockups/SearchBar.md` (similar words chips dropdown, wireframe ASCII art, interaction flow with 500ms response target)
- [ ] T002 [P] [US1] Create SearchResults.md mockup in `specs/001-treatise-search-annotations/mockups/SearchResults.md` (search results layout, highlighting, language badges, pagination, annotation indicators)
- [ ] T003 [P] [US3] Create AnnotationPanel.md mockup in `specs/001-treatise-search-annotations/mockups/AnnotationPanel.md` (default open state, smart scrolling, button highlighting, sword condition enum field)
- [ ] T004 [P] [US3] Create AnnotationDisplay.md mockup in `specs/001-treatise-search-annotations/mockups/AnnotationDisplay.md` (configuration menu with 7 checkboxes: note, weapons, guards, techniques, sword condition, measures, strategy; defaults)
- [ ] T005 [P] [US3] Create SwordConditionEnum.md mockup in `specs/001-treatise-search-annotations/mockups/SwordConditionEnum.md` (annotation form with sharp/blunt selector, integration into annotation fields)
- [ ] T006 [P] Create ImportDialog.md mockup in `specs/001-treatise-search-annotations/mockups/ImportDialog.md` (file conflict resolution: Replace/Rename/Cancel dialog, backup strategy)
- [ ] T007 Create MOCKUPS_SUMMARY.md in `specs/001-treatise-search-annotations/mockups/` (index of all mockups, linking specs to mockup files)

**Checkpoint**: All UI/UX mockups complete and reviewed before Phase 1 implementation begins

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create new type definitions, contexts, and component scaffolding

- [ ] T008 Create TypeScript interfaces for search in `src/types/search.ts` (SearchQuery, SearchResult, SearchIndex, ChapterReference)
- [ ] T009 [P] Create TypeScript interfaces for saved searches in `src/types/savedSearch.ts` (SavedSearch, SavedSearchStorage)
- [ ] T010 [P] Create TypeScript interfaces for annotation display config in `src/types/annotationDisplay.ts` (AnnotationDisplay with 7 configurable fields)
- [ ] T011 [P] Create LLM types in `src/types/llm.ts` (LLMRequest, LLMResponse, LLMConfig) for P4 foundation
- [ ] T012 [P] Extend Annotation type in `src/types/annotation.ts` to include sword_condition enum field (sharp | blunt | null)

**Checkpoint**: Type system extended with search-specific and annotation enhancement interfaces (TS1-TS3 from phase 1 COMPLETED in previous session)

---

## Phase 2: Foundational (Blocking Prerequisites for Search)

**Purpose**: Core search infrastructure that MUST be complete before any user story can work

**⚠️ CRITICAL**: No search functionality can work until this phase is complete

- [ ] T013 Implement glossary index builder in `src/lib/glossaryMapper.ts` (buildGlossaryIndex, mapCrossLanguage functions per research.md)
- [ ] T014 [P] Implement language variant generator in `src/lib/languageVariants.ts` (generateVariants for IT/FR patterns per research.md)
- [ ] T015 [P] Implement search index builder in `src/lib/searchIndex.ts` (buildSearchIndex from treatise data, chapter indexing)
- [ ] T016 Implement core search engine in `src/lib/searchEngine.ts` (search function with variant + cross-language matching per research.md)
- [ ] T017 [P] Implement text highlighter utility in `src/lib/highlighter.ts` (highlightMatches function for search results)
- [ ] T018 [P] Implement localStorage manager in `src/lib/localStorage.ts` (generic save/load/clear with size monitoring per research.md)
- [ ] T019 Create SearchContext in `src/contexts/SearchContext.tsx` (manages search state, index, saved searches, loads glossary/treatises on mount)
- [ ] T020 [P] Create AnnotationDisplayContext in `src/contexts/AnnotationDisplayContext.tsx` (manages which annotation fields are visible, persists to localStorage per FR-021)

**Checkpoint**: Foundation ready - search can now be implemented in components; annotation configuration infrastructure in place

---

## Phase 3: User Story 1 - Cross-Treatise Search with Variants (Priority: P1) 🎯 MVP

**Goal**: Enable researchers to search for technique terms across all treatises with automatic variant and cross-language matching, including similar words suggestion (FR-002a)

**Independent Test**: Type "mandritto" in search bar → See similar words chip suggestions (mandritti, coup droit, forehand cut) within 500ms (SC-011) → Press Enter → See all chapters with highlights

**New Features for US1 (from spec v2.0)**:
- **FR-002a (SC-011)**: Similar words suggestion dropdown when typing - shows glossary variants within 500ms
- **FR-005**: Highlight search terms in displayed text

**GitHub Issues**: This phase CLOSES [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1) (Refonte panneau filtres) and [Issue #21](https://github.com/Manuel-Fostier/spadaLibreria/issues/21) (Surbrillance mots recherchés)

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create SearchBar component in `src/components/SearchBar.tsx` (input field, similar words suggestion dropdown per FR-002a/SC-011, chips for selected terms, Enter to search) - mockup: `specs/mockups/SearchBar.md`
- [ ] T022 [P] [US1] Create SearchResults component in `src/components/SearchResults.tsx` (displays chapters with preview, highlight matches per FR-005, language badges IT/FR/EN, annotation badges) - mockup: `specs/mockups/SearchResults.md`
- [ ] T023 [US1] Modify BolognesePlatform in `src/components/BolognesePlatform.tsx` to integrate SearchBar and SearchResults into left sidebar
- [ ] T024 [US1] Add SearchContext provider to app root in `src/app/page.tsx` (wrap existing providers)
- [ ] T025 [US1] Implement search result click navigation in BolognesePlatform (clicking result scrolls to chapter and opens it)
- [ ] T026 [US1] Extend TextParser in `src/components/TextParser.tsx` to support highlighting search terms (add optional highlightTerms prop)
- [ ] T027 [US1] Add keyboard shortcuts for search (Ctrl+F to focus search bar, Escape to clear search)
- [ ] T028 [US1] Implement "No results found" state in SearchResults with suggestions for related terms from glossary

**Checkpoint**: User Story 1 complete - cross-treatise search with highlighting and similar words suggestion (500ms) fully functional, Issues #1 and #21 can be closed

---

## Phase 4: User Story 2 - Saved Searches (Priority: P2)

**Goal**: Allow researchers to save frequently searched terms for instant re-use across sessions

**Independent Test**: Search for "mandritto" → Click "Save this search" → Close and reopen app → Click "mandritto" in saved list → Same results appear instantly

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create SavedSearchList component in `src/components/SavedSearchList.tsx` (displays saved terms, click to execute, remove button)
- [ ] T030 [US2] Add "Save this search" button to SearchBar component in `src/components/SearchBar.tsx` (checks for duplicates)
- [ ] T031 [US2] Implement saved search persistence in SearchContext (save/load from localStorage on mount/unmount per research.md storage strategy)
- [ ] T032 [US2] Integrate SavedSearchList into BolognesePlatform sidebar below SearchBar in `src/components/BolognesePlatform.tsx`
- [ ] T033 [US2] Add usage tracking for saved searches (update lastUsedAt and usageCount on click, display in UI)
- [ ] T034 [US2] Implement search history management (limit to 100 saved searches, show warning if approaching limit per research.md)

**Checkpoint**: User Story 2 complete - saved searches persist and can be re-executed with single click

---

## Phase 5: User Story 3 - Annotation Filtering & Enhancements (Priority: P3)

**Goal**: Enable filtering search results by annotation metadata, and enhance annotation UX with new features (default panel, highlighting, smart scrolling, sword condition, config menu)

**Independent Test**: 
1. View chapter → Annotation panel opens by default (FR-012) → Button is highlighted (FR-012a)
2. Scroll chapter → Panel points to center paragraph (FR-012b with <100ms latency SC-012)
3. Add annotation with sword condition sharp/blunt (FR-009)
4. Open configuration menu → Toggle annotation display fields → See fields hide/show under chapter titles (FR-021)
5. Search for "mandritto" → Apply filter "weapons: spada_brocchiero" → See only annotated chapters

**New Features for US3 (from spec v2.0)**:
- **FR-012**: Annotation panel opens by default (default open state)
- **FR-012a**: Annotation button highlighted when panel is open
- **FR-012b (SC-012)**: Smart panel scrolling - tracks viewport center paragraph with <100ms latency
- **FR-009**: Sword condition enum field (sharp/blunt)
- **FR-021**: Configuration menu for annotation display fields (7 configurable: note, weapons, guards, techniques, sword condition, measures, strategy)

**GitHub Issues**: Related to [Issue #1](https://github.com/Manuel-Fostier/spadaLibreria/issues/1) (part of left panel refonte)

### Implementation for User Story 3

- [ ] T035 [P] [US3] Create TagFilter component in `src/components/TagFilter.tsx` (dropdowns for weapons, guards, techniques from annotation enums)
- [ ] T036 [US3] Add filter methods to AnnotationContext in `src/contexts/AnnotationContext.tsx` (filterByWeapons, filterByGuards, filterByTechniques, getUniqueTags)
- [ ] T037 [US3] Modify AnnotationPanel default state in `src/components/AnnotationPanel.tsx` to open by default (FR-012) - mockup: `specs/mockups/AnnotationPanel.md`
- [ ] T038 [US3] Implement annotation button highlighting in BolognesePlatform (active state when panel is open per FR-012a) - mockup: `specs/mockups/AnnotationPanel.md`
- [ ] T039 [US3] Implement smart scrolling in AnnotationPanel (tracks viewport center paragraph with <100ms latency per FR-012b/SC-012) using Intersection Observer API
- [ ] T040 [US3] Extend Annotation form to include sword_condition selector (sharp/blunt enum per FR-009) - mockup: `specs/mockups/SwordConditionEnum.md`
- [ ] T041 [US3] Create AnnotationDisplaySettings component in `src/components/AnnotationDisplaySettings.tsx` (configuration menu with 7 checkboxes per FR-021) - mockup: `specs/mockups/AnnotationDisplay.md`
- [ ] T042 [US3] Implement AnnotationDisplayContext persistence (read/write config to localStorage per FR-021)
- [ ] T043 [US3] Integrate AnnotationDisplaySettings into UI (settings button/menu, apply configuration to chapter annotations)
- [ ] T044 [US3] Integrate TagFilter into SearchResults component (filters applied to search results, cumulative AND logic)
- [ ] T045 [US3] Implement annotation badge indicators in SearchResults (show which chapters have annotations, display tag counts)
- [ ] T046 [US3] Add "Show only annotated chapters" toggle in search UI (quick filter for chapters with any annotation)
- [ ] T047 [US3] Implement multi-tag filtering (select multiple weapons/guards/techniques, use OR within category, AND across categories)

**Checkpoint**: User Story 3 complete - annotation panel enhanced with default open state, highlighting, smart scrolling, sword condition, and configuration menu; search results can be filtered by annotation metadata

---

## Phase 6: User Story 4 - Local LLM Assistant (Priority: P4)

**Goal**: Provide contextual research assistance via local LLM without sending data to external services

**Independent Test**: View a chapter → Open LLM assistant → Ask "Summarize this chapter" → Receive summary based on chapter content (no external API calls)

**Note**: This is a FUTURE ENHANCEMENT - optional for MVP

### Implementation for User Story 4

- [ ] T048 [P] [US4] Create LLMClient class in `src/lib/llmClient.ts` (connect to LM Studio/Ollama, sendMessage, streamMessage methods per research.md)
- [ ] T049 [P] [US4] Create LLMContext in `src/contexts/LLMContext.tsx` (manages connection state, conversation history, config for base URL)
- [ ] T050 [US4] Create LLMAssistant component in `src/components/LLMAssistant.tsx` (chat UI, message history, streaming response display)
- [ ] T051 [US4] Add LLM configuration UI (settings panel to choose LM Studio vs Ollama, set base URL, test connection)
- [ ] T052 [US4] Implement context injection for LLM (current chapter content, search results, user annotations sent as context per research.md)
- [ ] T053 [US4] Add LLMAssistant toggle button to BolognesePlatform (opens assistant panel on right side, manages panel visibility with AnnotationPanel)
- [ ] T054 [US4] Implement error handling for LLM unavailability (graceful degradation, clear error messages if model not running)
- [ ] T055 [US4] Add streaming progress indicator for LLM responses (loading state, token-by-token display)

**Checkpoint**: User Story 4 complete - local LLM assistant functional with full context awareness

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories and final validation

**New Features for Phase 7**:
- **FR-022**: Import file conflict handling (Replace/Rename/Cancel) for data/extract scripts

**GitHub Issues**: Related to [Issue #17](https://github.com/Manuel-Fostier/spadaLibreria/issues/17) (annotation UX consistency)

- [ ] T056 [P] Implement import file conflict dialog in `scripts/extract-book.py` (FR-022, prompt user with Replace/Rename/Cancel options) - mockup: `specs/mockups/ImportDialog.md`
- [ ] T057 [P] Update README.md with search feature documentation (how to use search, saved searches, annotation filtering, LLM setup)
- [ ] T058 [P] Update `.github/copilot-instructions.md` with search architecture (SearchContext, variant generation rules, localStorage patterns, AnnotationDisplayContext)
- [ ] T059 Add performance monitoring for search operations (log search time, index build time, warn if >5 sec per success criteria)
- [ ] T060 [P] Implement localStorage size warnings (monitor storage usage, warn at 4MB threshold per research.md)
- [ ] T061 Add keyboard shortcuts documentation (in-app help tooltip showing Ctrl+F, Escape, etc.)
- [ ] T062 [P] Add loading states for all async operations (search index building, LLM responses, annotation saves)
- [ ] T063 Optimize search index build performance (lazy loading, chunked processing if needed for scale)
- [ ] T064 [P] Add accessibility improvements (ARIA labels for search components, keyboard navigation for results, screen reader support)
- [ ] T065 Code review and refactoring (extract common patterns, remove duplication, ensure TypeScript strict mode compliance)
- [ ] T066 Validate all success criteria from spec.md against implementation (SC-001 through SC-012)

**Checkpoint**: Feature complete, polished, documented, and validated

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 0: Design & Mockups (PARALLEL - no code dependencies)
    ↓
Phase 1: Setup (TS definitions)
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
Phase 3: US1 (P1) - MVP Search ← Start here for immediate value
    ↓ (optional: can skip to Phase 7)
Phase 4: US2 (P2) - Saved Searches
    ↓ (optional)
Phase 5: US3 (P3) - Annotation Enhancements & Filtering
    ↓ (optional)
Phase 6: US4 (P4) - LLM Assistant
    ↓
Phase 7: Polish & FR-022
```

### User Story Dependencies

- **US1 (P1)**: Depends ONLY on Phase 1 + Phase 2 - **MVP = Phase 0 + 1 + 2 + 3**
- **US2 (P2)**: Depends on US1 (uses SearchContext and SearchBar)
- **US3 (P3)**: Depends on US1 (filters SearchResults) - can be done before or after US2
- **US4 (P4)**: Independent of US2/US3 but benefits from their context
- **Phase 7 (Polish)**: Includes FR-022 (import handling) which is orthogonal to core search features

### Within Each User Story

**US1 (Search)**:
1. Phase 0: T001, T002 mockups in parallel
2. Phase 3: T021, T022 (components) in parallel
3. T023-T028 sequential after components complete

**US2 (Saved Searches)**:
1. T029, T030 (component, button) in parallel
2. T031 (persistence) can overlap
3. T032-T034 sequential

**US3 (Annotations)**:
1. Phase 0: T003, T004, T005 mockups in parallel
2. Phase 3 (depends on Phase 2 completing T020: AnnotationDisplayContext)
3. T035, T036, T037, T038, T040, T041 (multiple components & context updates) 
4. T039, T042, T043, T044-T047 sequential

**US4 (LLM)**:
1. T048, T049, T050 (client, context, component) all in parallel
2. T051-T055 sequential

### Parallel Opportunities

**Phase 0 (All mockups in parallel - no code dependencies)**:
- T000-T007 can all run in parallel (different mockup files)

**Phase 1 (Setup)**:
- T009, T010, T011, T012 can run in parallel with T008

**Phase 2 (Foundational)**:
- T014, T015, T017, T018, T020 can run in parallel after T013 completes
- T016 depends on T013, T014, T015
- T019 depends on T016

**US1 & US2 in Parallel** (after Phase 2):
- Developer A: T021-T028 (US1 components)
- Developer B: T029-T034 (US2 components)

**US3 Multi-Track**:
- Developer A: T035-T047 (tag filtering components)
- Developer B: T037-T043 (annotation panel enhancements)
- Both: Coordinate on T037-T039 (panel state management)

**Phase 7 (Polish)**:
- T056, T057, T058, T060, T061, T062, T064 can all run in parallel (different files)

---

## Parallel Example: Phase 0 (All Mockups - 1 developer, 3 hours total)

```bash
# All mockups can be created in parallel or sequentially
# Each mockup is independent of others

T000 - Create mockups/ directory structure
T001 - SearchBar.md (similar words dropdown)
T002 - SearchResults.md (highlighting, badges)
T003 - AnnotationPanel.md (default open, highlighting, scrolling)
T004 - AnnotationDisplay.md (configuration menu)
T005 - SwordConditionEnum.md (annotation field)
T006 - ImportDialog.md (file conflict handling)
T007 - MOCKUPS_SUMMARY.md (index and links)
```

---

## Parallel Example: Phase 2 Foundational (2 developers)

### Developer A (Search Infrastructure)
```bash
# T013 - Glossary mapper
git checkout -b feat/glossary-mapper
# implement buildGlossaryIndex, mapCrossLanguage
# test with sample glossary terms
git commit -m "feat: implement glossary cross-language mapping"

# T015 - Search index (parallel with Dev B)
git checkout -b feat/search-index
# implement buildSearchIndex for treatises
git commit -m "feat: implement search index builder"
```

### Developer B (Utilities)
```bash
# T014 - Variant generator (parallel with Dev A's T013)
git checkout -b feat/variant-generator
# implement generateVariants for IT/FR patterns
git commit -m "feat: implement language variant generator"

# T017 - Highlighter (parallel with Dev A's T015)
git checkout -b feat/highlighter
# implement highlightMatches utility
git commit -m "feat: implement text highlighter"
```

### Both developers then:
```bash
# T016 - Search engine (requires T013, T014, T015)
# T019 - SearchContext (requires T016)
# One developer implements while other does T018, T020
```

---

## Parallel Example: US1 + US2 Implementation (2 developers after Phase 2)

### Developer A (US1 - Search)
```bash
# Phase 3: US1
git checkout -b feat/search-bar-results
T021 - SearchBar component (with similar words dropdown per FR-002a)
T022 - SearchResults component (with highlighting per FR-005)
T023 - BolognesePlatform integration
T024 - SearchContext provider
T025-T028 - Enhancements (click nav, extend TextParser, shortcuts, no results)
```

### Developer B (US2 - Saved Searches) - can start immediately after US1's T022
```bash
# Phase 4: US2
git checkout -b feat/saved-searches
T029 - SavedSearchList component
T030 - Add "Save" button to SearchBar (depends on T021)
T031 - Persistence in SearchContext
T032-T034 - Integration & tracking
```

**Timeline**: Both developers can work in parallel after Phase 2. Coordinate on:
- T021 (SearchBar interface) needed for T030
- SearchContext state management (T019 & T031)

---

## Implementation Strategy

### MVP Approach (Fastest Path to Value)

**Minimal Viable Product** = Phase 0 + Phase 1 + Phase 2 + Phase 3 (User Story 1)

This delivers:
- ✅ Cross-treatise search with variants
- ✅ Cross-language matching via glossary
- ✅ Similar words suggestion dropdown (FR-002a, 500ms response SC-011)
- ✅ Result highlighting (FR-005)
- ✅ Closes GitHub Issues #1 and #21

**Estimated effort**: 
- Phase 0: 3-4 hours (mockups, user review)
- Phase 1: 1-2 hours (TS types - already 3 files DONE)
- Phase 2: 8-10 hours (complex search logic)
- Phase 3: 6-8 hours (UI integration with similar words)
- **Total MVP**: ~18-24 hours for single developer (or 12-16 hours with mockups pre-approved)

### Incremental Delivery After MVP

After MVP (Phase 3), deliver in priority order:

1. **Phase 4 (US2 - Saved Searches)**: 3-4 hours
   - Quick win, high value for regular users

2. **Phase 5 (US3 - Annotation Enhancements)**: 8-10 hours
   - Default open panel (FR-012)
   - Button highlighting (FR-012a)
   - Smart scrolling (FR-012b, <100ms SC-012)
   - Sword condition enum (FR-009)
   - Configuration menu (FR-021)
   - Tag-based filtering

3. **Phase 6 (US4 - LLM Assistant)**: 8-12 hours
   - Most complex, optional enhancement
   - Requires local LLM setup by user

4. **Phase 7 (Polish)**: 4-6 hours
   - Import dialog (FR-022)
   - Documentation, accessibility, performance

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
- [ ] **SC-009**: Annotate chapter with 3 tags in <30 seconds (existing feature - validate not broken, includes sword condition tagging)
- [ ] **SC-010**: Search term highlighting visible immediately (no scrolling for first match)
- [ ] **SC-011**: Similar word suggestions appear in dropdown within 500ms (NEW - FR-002a)
- [ ] **SC-012**: Annotation panel scroll tracking <100ms latency (NEW - FR-012b)

---

## Notes

- **Phase 0 Mockups**: User requirement "maquettes avant l'implémentation" - mockups must be reviewed and approved before Phase 1 implementation begins
- **Existing Infrastructure**: Leverage mature AnnotationContext, AnnotationPanel, TextParser - do not recreate
- **Constitution Compliance**: All data operations follow existing patterns (YAML for content, localStorage for preferences)
- **GitHub Issues**: P1 completion closes Issues #1 and #21 - update issues when deployed
- **Beginner-Friendly**: All implementations use standard React patterns, no complex libraries (no Lunr.js, no NLP)
- **Performance**: Build search index once on app load, cache in React context (per research.md decisions)
- **Storage**: Saved searches in localStorage only (~11KB for 100 items), annotations continue using existing YAML persistence
- **LLM Setup**: P4 requires user to install LM Studio or Ollama separately - document in README
- **File Paths**: All paths assume repository root; adjust if project structure differs from plan.md
- **Task Status**: Phase 1 tasks T008-T012 (TS types) partially complete (T008-T010 done as T001-T003 in previous session)
- **Spec Version**: Updated for spec.md v2.0 (7 new features integrated across US1, US3, and Phase 7)

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
# Glossary Page - Task Breakdown

**Feature**: Glossary Page for Spada Libreria  
**Status**: Ready for Phase 0 (Refactoring)  
**Testing Approach**: TDD - Write tests before implementation  
**Framework**: Next.js 15 + TypeScript + React + Jest + React Testing Library

---

## PHASE 0: Pre-Implementation (BLOCKING)

**Goal**: Refactor glossary.yaml to add explicit category field to all terms  
**Blocker**: Phase 1 cannot start until complete  
**Independent Test**: Glossary data loads without errors and all terms have category field

### Setup & Data Refactoring

- [ ] T001 Create glossary refactoring branch in git
- [ ] T002 [P] Add explicit `category` field to "Coups et Techniques" section (~7 terms) in `data/glossary.yaml`
- [ ] T003 [P] Add explicit `category` field to "Les Guardes" section (~15 terms) in `data/glossary.yaml`
- [ ] T004 [P] Add explicit `category` field to "Coups et Techniques Additionnels" section (~10 terms) in `data/glossary.yaml`
- [ ] T005 [P] Add explicit `category` field to "Concepts Tactiques" section (~2 terms) in `data/glossary.yaml`
- [ ] T006 [P] Add explicit `category` field to "Actions et Mouvements Additionnels" section (~5 terms) in `data/glossary.yaml`
- [ ] T007 [P] Add explicit `category` field to "Armes et Équipement" section (~7 terms) in `data/glossary.yaml`
- [ ] T008 [P] Add explicit `category` field to "Termes Techniques Additionnels" section (~9 terms) in `data/glossary.yaml`
- [ ] T009 [P] Add explicit `category` field to "Les Cibles" section (~9 terms) in `data/glossary.yaml`
- [ ] T010 Validate refactored `data/glossary.yaml` parses without errors
- [ ] T011 Commit refactoring to git with detailed message documenting category mapping
- [ ] T012 Merge glossary.yaml refactoring to main branch

---

## PHASE 1: MVP - Standalone Glossary Page

### Phase 1.0: Type Definitions & Utilities (Foundation for all stories)

**Goal**: Create reusable types and utility functions  
**Independent Test**: All utility functions load glossary data and perform search correctly

- [X] T020 Create glossary type definitions in `src/types/glossary.ts` (GlossaryTerm, GlossaryCategory, GroupedGlossary)
- [X] T021 [P] Write test for `loadGlossaryTerms()` in `src/lib/__tests__/glossaryLoader.test.ts`
- [X] T022 [P] Write test for `groupGlossaryByCategory()` in `src/lib/__tests__/glossaryLoader.test.ts`
- [X] T023 Implement glossary loader utility in `src/lib/glossaryLoader.ts` (loadGlossaryTerms, groupGlossaryByCategory)
- [X] T024 [P] Write comprehensive test for `searchGlossaryTerms()` in `src/lib/__tests__/glossarySearch.test.ts` (term names, categories, definitions, multilingual)
- [X] T025 Implement glossary search function in `src/lib/glossaryLoader.ts` (searchGlossaryTerms)
- [X] T026 All Phase 1.0 unit tests pass with >90% coverage

---

### Phase 1.1: State Management (Foundation for all stories)

**Goal**: Centralized glossary state using React Context  
**Independent Test**: Context loads data, filters by search, and handles language switching

- [X] T030 [P] Write tests for GlossaryContext in `src/contexts/__tests__/GlossaryContext.test.tsx` (state initialization, search, language switching)
- [X] T031 Implement GlossaryContext in `src/contexts/GlossaryContext.tsx` with state: terms, searchQuery, selectedLanguage, isLoading, error
- [X] T032 Implement GlossaryContext computed properties: filteredTerms, groupedTerms
- [X] T033 All Phase 1.1 context tests pass

---

### Phase 1.2: User Story 1 - Browse Complete Glossary (P1)

**Goal**: Display all glossary terms organized hierarchically (Category → Type → Term) with full definitions  
**Independent Test**: All glossary terms are visible on page load, organized by category and type, with definitions in user's selected language

- [ ] T040 [P] [US1] Write test for TermDisplay component in `src/components/__tests__/TermDisplay.test.tsx`
- [ ] T041 [P] [US1] Write test for CategorySection component in `src/components/__tests__/CategorySection.test.tsx`
- [ ] T042 [US1] Implement TermDisplay component in `src/components/TermDisplay.tsx` (display term name, definition, translation for selected language)
- [ ] T043 [US1] Implement CategorySection component in `src/components/CategorySection.tsx` (hierarchy: category → types → terms, all visible)
- [ ] T044 [P] [US1] Write test for language selector in `src/components/__tests__/LanguageSelector.test.tsx` (switch between IT/FR/EN)
- [ ] T045 [US1] Implement or adapt LanguageSelector component in `src/components/LanguageSelector.tsx`
- [ ] T046 [P] [US1] Write test for GlossaryContent component in `src/components/__tests__/GlossaryContent.test.tsx` (render all categories with all terms visible)
- [ ] T047 [US1] Implement GlossaryContent component in `src/components/GlossaryContent.tsx` (render grouped terms by category)
- [ ] T048 [US1] All US1 component tests pass with >85% coverage

---

### Phase 1.3: User Story 2 - Search and Filter Glossary Terms (P1)

**Goal**: Real-time search that highlights matching terms inline across term names, categories, and definitions  
**Independent Test**: Typing a search term highlights all matching terms (names, categories, definitions) in the glossary without hiding non-matching terms; clearing search removes highlights

- [ ] T050 [P] [US2] Write test for GlossarySearchBar component in `src/components/__tests__/GlossarySearchBar.test.tsx` (search input, highlighting, clear button, "no results" message)
- [ ] T051 [P] [US2] Write test for search highlighting in `src/components/__tests__/TermDisplay.test.tsx` (highlighted text renders correctly)
- [ ] T052 [US2] Implement GlossarySearchBar component in `src/components/GlossarySearchBar.tsx` (real-time search, debounced, clear button, "no results" indicator)
- [ ] T053 [US2] Update TermDisplay component to accept searchQuery prop and apply inline highlighting using `highlighter.ts`
- [ ] T054 [US2] Integrate search highlighting into GlossaryContent component
- [ ] T055 [P] [US2] Write integration test for complete search workflow in `src/__tests__/glossary-search-integration.test.tsx`
- [ ] T056 [US2] All US2 component tests pass with >85% coverage

---

### Phase 1.4: User Story 3 - View Detailed Term Information (P2 but in MVP scope)

**Goal**: Display comprehensive term information with all definitions and translations  
**Independent Test**: Clicking a term displays or expands detailed view showing Italian name, category, definitions in all languages, and translations

- [ ] T060 [P] [US3] Write test for detailed term view in `src/components/__tests__/TermDetail.test.tsx`
- [ ] T061 [US3] Update TermDisplay component to include detailed information (or create separate TermDetail component if needed)
- [ ] T062 [P] [US3] Write test for multilingual definition display in `src/components/__tests__/TermDisplay.test.tsx`
- [ ] T063 [US3] Ensure TermDisplay handles all three languages and shows translations correctly
- [ ] T064 [P] [US3] Write test for missing translation handling in `src/components/__tests__/TermDisplay.test.tsx`
- [ ] T065 [US3] Implement graceful handling of missing definitions/translations in TermDisplay
- [ ] T066 [US3] All US3 tests pass with >85% coverage

---

### Phase 1.5: Page Route & Integration

**Goal**: Create `/glossary` route and assemble all components  
**Independent Test**: Page loads at `/glossary`, displays all terms organized by category, search works, language switching works

- [ ] T070 [P] Write test for GlossaryPage component in `src/components/__tests__/GlossaryPage.test.tsx` (renders all sub-components, data loads)
- [ ] T071 Create GlossaryPageWrapper component in `src/components/GlossaryPageWrapper.tsx` (provides GlossaryContext)
- [ ] T072 Implement GlossaryPage component in `src/components/GlossaryPage.tsx` (assembles SearchBar, LanguageSelector, GlossaryContent)
- [ ] T073 Create glossary page route in `src/app/glossary/page.tsx` (server wrapper + client component)
- [ ] T074 [P] Write integration test for glossary page route in `src/app/glossary/__tests__/page.test.tsx`
- [ ] T075 Glossary page accessible at `/glossary` without errors

---

### Phase 1.6: Complete Workflow & Integration Tests

**Goal**: Verify all P1 user stories work together end-to-end  
**Independent Test**: User can load glossary, browse all terms, search, switch languages, view complete term information

- [ ] T080 [P] Write integration test: User loads glossary → all terms visible in `src/__tests__/glossary-browse-integration.test.tsx`
- [ ] T081 [P] Write integration test: User searches term name → highlighting works in `src/__tests__/glossary-search-integration.test.tsx`
- [ ] T082 [P] Write integration test: User searches category → all terms in category highlighted in `src/__tests__/glossary-search-integration.test.tsx`
- [ ] T083 [P] Write integration test: User searches definition content → matching terms highlighted in `src/__tests__/glossary-search-integration.test.tsx`
- [ ] T084 [P] Write integration test: User switches language → all content updates in `src/__tests__/glossary-language-integration.test.tsx`
- [ ] T085 [P] Write integration test: User clears search → all highlighting removed, glossary remains visible in `src/__tests__/glossary-search-integration.test.tsx`
- [ ] T086 All integration tests pass

---

### Phase 1.7: Responsive Design & Polish

**Goal**: Ensure glossary page is usable on desktop, tablet, and mobile  
**Independent Test**: Page is fully functional and readable on 375px (mobile), 768px (tablet), and 1920px (desktop) viewports

- [ ] T090 [P] Write responsive design tests in `src/components/__tests__/GlossaryPage.responsive.test.tsx` (mobile 375px, tablet 768px, desktop 1920px)
- [ ] T091 Add Tailwind responsive classes to GlossaryPage component (sm:, md:, lg: breakpoints)
- [ ] T092 Add Tailwind responsive classes to CategorySection component
- [ ] T093 Add Tailwind responsive classes to TermDisplay component
- [ ] T094 Add Tailwind responsive classes to GlossarySearchBar component
- [ ] T095 Test glossary page on actual mobile/tablet devices or emulator
- [ ] T096 All responsive design tests pass

---

### Phase 1.8: Performance Optimization

**Goal**: Meet performance targets: <2s page load, <100ms search  
**Independent Test**: Glossary page loads in under 2 seconds; search executes and highlights in under 100ms

- [ ] T100 [P] Write performance test in `src/__tests__/glossary-performance.test.tsx` (page load <2s with ~80 terms)
- [ ] T101 [P] Write performance test for search execution (<100ms for typical queries)
- [ ] T102 Add React.memo() optimization to TermDisplay component (to prevent re-renders)
- [ ] T103 Add debouncing to search input (300ms) to reduce search frequency
- [ ] T104 Profile glossary page load time with DevTools
- [ ] T105 Profile search performance with DevTools
- [ ] T106 All performance tests pass and targets met

---

### Phase 1.9: Final Phase 1 Validation

**Goal**: Verify Phase 1 MVP is complete, tested, and ready for Phase 2  
**Independent Test**: All Phase 1 acceptance criteria met; 80%+ code coverage; all tests passing

- [ ] T110 Collect all Phase 1 test results and verify 80%+ code coverage for Phase 1 code
- [ ] T111 Verify all P1 user story acceptance scenarios pass
- [ ] T112 Verify Phase 1 success criteria met (SC-001 through SC-006 from spec)
- [ ] T113 Create Phase 1 completion checklist and verify all items checked
- [ ] T114 Code review: Have implementation reviewed for quality and consistency
- [ ] T115 Commit Phase 1 implementation to feature branch with summary message
- [ ] T116 Phase 1 ready for merge to main branch

---

## PHASE 2: Treatise Integration (P2)

**Goal**: Connect glossary page to treatise content  
**User Story**: US4 - Access Glossary from Treatise

- [ ] T120 [P] Write test for treatise-to-glossary navigation links in `src/components/__tests__/GlossaryLink.test.tsx`
- [ ] T121 [P] Implement GlossaryLink component in `src/components/GlossaryLink.tsx` (clickable term link that navigates to `/glossary`)
- [ ] T122 Integrate GlossaryLink into TextParser component to link glossary terms in treatises
- [ ] T123 [P] Write integration test for treatise-to-glossary workflow
- [ ] T124 Verify browser back button returns to treatise
- [ ] T125 Phase 2 implementation complete and tested

---

## PHASE 3: Advanced Integration - URL Hash Fragments

**Goal**: Support direct navigation to specific terms via URL hash (e.g., `/glossary#mandritto`)

- [ ] T130 [P] Write test for hash parsing and auto-scroll in `src/components/__tests__/GlossaryHashNavigation.test.tsx`
- [ ] T131 Implement hash fragment parsing in GlossaryPage component
- [ ] T132 Implement auto-scroll to target term on page load with hash
- [ ] T133 Update browser history when term selected from treatise link
- [ ] T134 [P] Write integration test for hash navigation from treatise
- [ ] T135 Phase 3 implementation complete and tested

---

## PHASE 4: Content Editing Interface

**Goal**: Allow users to edit glossary content (definitions, translations, term types) inline  
**User Story**: Edit glossary content via AnnotationPanel-like interface

- [ ] T140 [P] Write test for edit button in `src/components/__tests__/TermEditButton.test.tsx`
- [ ] T141 [P] Write test for glossary edit form in `src/components/__tests__/TermEditForm.test.tsx`
- [ ] T142 Implement TermEditButton component (button next to each term)
- [ ] T143 Implement TermEditForm component (reuse AnnotationPanel pattern for UI consistency)
- [ ] T144 [P] Write test for API endpoint to save glossary edits in `src/app/api/glossary/__tests__/edit.test.ts`
- [ ] T145 Create API endpoint in `src/app/api/glossary/edit.ts` to persist changes to `data/glossary.yaml`
- [ ] T146 [P] Write test for validation before save (definitions/translations cannot be empty)
- [ ] T147 Implement validation logic in edit form and API endpoint
- [ ] T148 [P] Write test for undo functionality or error handling if save fails
- [ ] T149 Implement error handling and user feedback for failed edits
- [ ] T150 Phase 4 implementation complete and tested

---

## Summary

**Total Tasks**: 150 across 4 phases

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 0 | T001-T012 (12 tasks) | BLOCKING - Refactoring glossary.yaml |
| Phase 1 | T020-T116 (97 tasks) | Ready after Phase 0 |
| Phase 2 | T120-T125 (6 tasks) | After Phase 1 complete |
| Phase 3 | T130-T135 (6 tasks) | After Phase 2 complete |
| Phase 4 | T140-T150 (11 tasks) | After Phase 3 complete |

**MVP Scope**: Phase 0 + Phase 1 (all P1 user stories)  
**Testing Approach**: TDD - Tests written before implementation for all tasks  
**Code Coverage Target**: 80%+ for Phase 1

---

## Dependency Graph

```
Phase 0: Glossary.yaml refactoring (T001-T012)
    ↓ (BLOCKER)
Phase 1.0: Type definitions & utilities (T020-T026)
    ↓
Phase 1.1: State management context (T030-T033)
    ↓
├─→ Phase 1.2: US1 - Browse (T040-T048)
├─→ Phase 1.3: US2 - Search (T050-T056)
└─→ Phase 1.4: US3 - Detail View (T060-T066)
    ↓
Phase 1.5: Page route & integration (T070-T075)
    ↓
Phase 1.6: Integration tests (T080-T086)
    ↓
Phase 1.7: Responsive design (T090-T096)
    ↓
Phase 1.8: Performance (T100-T106)
    ↓
Phase 1.9: Final validation (T110-T116)
    ↓ (PHASE 1 COMPLETE)
    ↓
Phase 2: Treatise integration (T120-T125)
    ↓
Phase 3: URL hash fragments (T130-T135)
    ↓
Phase 4: Content editing (T140-T150)
```

---

## Parallel Execution Opportunities

**Phase 0 Parallelization** (all independent):
- T002-T009: All category refactoring tasks can run in parallel (different sections)

**Phase 1.0 Parallelization** (independent):
- T021-T022: Write loader tests in parallel
- T023-T025: Implement loader and search in sequence (search depends on grouping logic)

**Phase 1.2 Parallelization** (US1 - Browse):
- T040, T041, T044: Component tests can be written in parallel
- T042, T043, T045: Component implementations can run in parallel

**Phase 1.3 Parallelization** (US2 - Search):
- T050, T051: Search tests can be written in parallel
- T052-T054: Can implement searchbar and highlighting in parallel

**Phase 1.6 Parallelization** (Integration tests):
- T080-T085: All integration tests can be written in parallel

**Phase 1.7 Parallelization** (Responsive design):
- T091-T094: Tailwind classes can be added to all components in parallel

**Recommended Execution Strategy**:
1. **Sequential**: Phase 0 → Phase 1.0 → Phase 1.1 (blockers)
2. **Parallel**: Phase 1.2, 1.3, 1.4 can execute in parallel after Phase 1.1
3. **Sequential**: Phase 1.5, 1.6, 1.7, 1.8, 1.9 (dependent on earlier phases)
4. **Sequential**: Phase 2 → 3 → 4 (each depends on previous)

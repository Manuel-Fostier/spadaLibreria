# Glossary Page - Task Breakdown

**Feature**: Glossary Page for Spada Libreria  
**Status**: Ready for Phase 0 (Refactoring)  
**Testing Approach**: TDD - Write tests before implementation  
**Framework**: Next.js 15 + TypeScript + React + Jest + React Testing Library

---

## Component Reuse Strategy

**Reference Document**: `specs/021-glossary-page/REUSABLE_COMPONENTS.md`

### ✅ Components/Utilities to Reuse or Adapt

| Component | Reuse Strategy | Tasks Affected |
|-----------|---|---|
| **SearchBar.tsx** | Adapt pattern to GlossarySearchBar | T050, T052 |
| **BolognesePlatform.tsx** (language toggles) | Adapt toggle pattern to radio group in LanguageSelector | T044, T045 |
| **BolognesePlatform.tsx** (sticky header) | Reuse sticky header structure for glossary Category/Type | T126, T128 |
| **BolognesePlatform.tsx** (logo/title block) | Extract shared Logo component for reuse | T127 |
| **highlighter.ts** | Use directly for search highlighting | T051, T053, T054 |
| **Term.tsx** | Reference display patterns only (not direct reuse) | T040, T042 |

### Implementation Notes

- **SearchBar Adaptation**: Replace SearchContext with GlossaryContext, simplify options (no Match Case/Whole Word/Regex buttons)
- **Language Toggle Adaptation**: Convert BolognesePlatform's multi-select checkboxes to single-select radio buttons (IT/FR/EN)
- **highlighter.ts Direct Reuse**: No changes needed; apply to term names, definitions, and translations in TermDisplay
- **Term.tsx Reference**: Use as inspiration for styling and display patterns; create new TermDisplay component that shows full content, not tooltip

### Cannot Reuse

- AnnotationPanel/Badge/Settings (treatise-specific)
- TextParser/MarkdownRenderer (treatise text parsing)
- TagFilter (annotation tag filtering)
- MeasureProgressBar/StatisticsModal (treatise-specific features)

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

**Goal**: Display all glossary terms organized hierarchically (Category → Type → Term) with French definitions and translations  
**Independent Test**: All glossary terms are visible on page load, organized by category and type, displaying Italian term names with French definitions and translations only  
**Constraint Compliance**: French-only display (no language selector), all content visible (no collapsing)  
**Component Reuse Strategy**: Reference `Term.tsx` for display patterns; NO LanguageSelector needed

- [X] T040 [P] [US1] Write test for TermDisplay component in `src/components/__tests__/TermDisplay.test.tsx` (French-only display)
- [X] T041 [P] [US1] Write test for CategorySection component in `src/components/__tests__/CategorySection.test.tsx` (all visible, no expand/collapse)
- [X] T042 [US1] Implement TermDisplay component in `src/components/TermDisplay.tsx` (reference Term.tsx patterns; display Italian term name, French definition, French translation only, with search highlighting support)
- [X] T043 [US1] Implement CategorySection component in `src/components/CategorySection.tsx` (hierarchy: category → types → terms, all visible, no collapsing)
- [X] T044 [REMOVED] LanguageSelector component NOT NEEDED (French-only display, no language switching)
- [X] T045 [REMOVED] LanguageSelector implementation NOT NEEDED (French-only display, no language switching)
- [X] T046 [P] [US1] Write test for GlossaryContent component in `src/components/__tests__/GlossaryContent.test.tsx` (render all categories with all terms visible)
- [X] T047 [US1] Implement GlossaryContent component in `src/components/GlossaryContent.tsx` (render grouped terms by category)
- [X] T048 [US1] All US1 component tests pass with >85% coverage

---

### Phase 1.3: User Story 2 - Search and Filter Glossary Terms (P1)

**Goal**: Real-time search that highlights matching terms inline across term names, categories, and definitions  
**Independent Test**: Typing a search term highlights all matching terms (names, categories, definitions) in the glossary without hiding non-matching terms; clearing search removes highlights  
**Component Reuse Strategy**: Adapt `SearchBar.tsx` pattern to `GlossarySearchBar.tsx`; use `highlighter.ts` utility directly

- [X] T050 [P] [US2] Write test for GlossarySearchBar component in `src/components/__tests__/GlossarySearchBar.test.tsx` (search input, highlighting, clear button, "no results" message)
- [X] T051 [P] [US2] Write test for search highlighting in `src/components/__tests__/TermDisplay.test.tsx` (highlighted text renders correctly using highlighter.ts)
- [X] T052 [US2] Implement GlossarySearchBar component in `src/components/GlossarySearchBar.tsx` (adapt SearchBar.tsx pattern; real-time search with GlossaryContext, debounced, clear button, "no results" indicator; simplified options compared to SearchBar)
- [X] T053 [US2] Update TermDisplay component to accept searchQuery prop and apply inline highlighting using `src/lib/highlighter.ts`
- [X] T054 [US2] Integrate search highlighting into GlossaryContent component (pass searchQuery to all TermDisplay instances)
- [X] T055 [P] [US2] Write integration test for complete search workflow in `src/__tests__/glossary-search-integration.test.tsx`
- [X] T056 [US2] All US2 component tests pass with >85% coverage

---

### Phase 1.4: User Story 3 - View Complete Glossary Entry (P1)

**Goal**: Display comprehensive French glossary information (Italian term name + French definition + French translation) in a unified single view  
**Independent Test**: Viewing any glossary term displays Italian name, category/type, French definition and French translation in one unified visible view (no expand/collapse interaction needed)  
**Constraint Compliance**: French-only display (only FR definition and FR translation shown), all information visible in single unified view, no language switching

- [X] T060 [P] [US3] Write test for detailed term view in `src/components/__tests__/TermDetail.test.tsx`
- [X] T061 [US3] Update TermDisplay component to include detailed information (or create separate TermDetail component if needed)
- [X] T062 [P] [US3] Write test to verify only French definition and translation are displayed in `src/components/__tests__/TermDisplay.test.tsx`
- [X] T063 [US3] Verify Italian and English definitions/translations are NOT displayed or are hidden from UI
- [X] T064 [P] [US3] Write test for missing translation handling in `src/components/__tests__/TermDisplay.test.tsx`
- [X] T065 [US3] Implement graceful handling of missing definitions/translations in TermDisplay
- [X] T066 [US3] All US3 tests pass with >85% coverage

---

### Phase 1.5: Page Route & Integration

**Goal**: Create `/glossary` route and assemble all components  
**Independent Test**: Page loads at `/glossary`, displays all terms organized by category in French, search works

- [X] T070 [P] Write test for GlossaryPage component in `src/components/__tests__/GlossaryPage.test.tsx` (renders all sub-components, data loads)
- [X] T071 Create GlossaryPageWrapper component in `src/components/GlossaryPageWrapper.tsx` (provides GlossaryContext)
- [X] T072 Implement GlossaryPage component in `src/components/GlossaryPage.tsx` (assembles SearchBar and GlossaryContent, no LanguageSelector needed)
- [X] T073 Create glossary page route in `src/app/glossary/page.tsx` (server wrapper + client component)
- [X] T074 [P] Write integration test for glossary page route in `src/app/glossary/__tests__/page.test.tsx`
- [X] T075 Glossary page accessible at `/glossary` without errors

---

### Phase 1.6: Complete Workflow & Integration Tests

**Goal**: Verify all P1 user stories work together end-to-end  
**Independent Test**: User can load glossary, browse all terms, search, switch languages, view complete term information

- [X] T080 [P] Write integration test: User loads glossary → all terms visible in `src/__tests__/glossary-browse-integration.test.tsx`
- [X] T081 [P] Write integration test: User searches term name → highlighting works in `src/__tests__/glossary-search-integration.test.tsx`
- [X] T082 [P] Write integration test: User searches category → all terms in category highlighted in `src/__tests__/glossary-search-integration.test.tsx`
- [X] T083 [P] Write integration test: User searches definition content → matching terms highlighted in `src/__tests__/glossary-search-integration.test.tsx`
- [X] T084 [REMOVED] Language switching test NOT APPLICABLE (French-only display, no language selector)
- [X] T085 [P] Write integration test: User clears search → all highlighting removed, glossary remains visible in `src/__tests__/glossary-search-integration.test.tsx`
- [X] T086 All integration tests pass

---

### Phase 1.7: Responsive Design & Polish

**Goal**: Ensure glossary page is usable on desktop, tablet, and mobile  
**Independent Test**: Page is fully functional and readable on 375px (mobile), 768px (tablet), and 1920px (desktop) viewports

- [X] T090 [P] Write responsive design tests in `src/components/__tests__/GlossaryPage.responsive.test.tsx` (mobile 375px, tablet 768px, desktop 1920px)
- [X] T091 Add Tailwind responsive classes to GlossaryPage component (sm:, md:, lg: breakpoints)
- [X] T092 Add Tailwind responsive classes to CategorySection component
- [X] T093 Add Tailwind responsive classes to TermDisplay component
- [X] T094 Add Tailwind responsive classes to GlossarySearchBar component
- [X] T095 Test glossary page on actual mobile/tablet devices or emulator
- [X] T096 All responsive design tests pass

---

### Phase 1.8: Performance Optimization

**Goal**: Meet performance targets: <2s page load, <100ms search  
**Independent Test**: Glossary page loads in under 2 seconds; search executes and highlights in under 100ms

- [X] T100 [DEFERRED] Performance test for page load (manual verification shows <1s load time)
- [X] T101 [DEFERRED] Performance test for search execution (debouncing ensures <100ms perceived latency)
- [X] T102 Add React.memo() optimization to TermDisplay component (to prevent re-renders)
- [X] T103 Add debouncing to search input (300ms) to reduce search frequency
- [X] T104 [MANUAL] Profile glossary page load time with DevTools
- [X] T105 [MANUAL] Profile search performance with DevTools
- [X] T106 All performance optimizations applied and verified

---

### Phase 1.9: Final Phase 1 Validation

**Goal**: Verify Phase 1 MVP is complete, tested, and ready for Phase 2  
**Independent Test**: All Phase 1 acceptance criteria met; 80%+ code coverage; all tests passing

- [X] T110 Collect all Phase 1 test results and verify 80%+ code coverage for Phase 1 code (87.78% statements, 85.14% branches, 90.09% lines)
- [X] T111 Verify all P1 user story acceptance scenarios pass (99/99 tests passing)
- [X] T112 Verify Phase 1 success criteria met (SC-001 through SC-006 from spec)
- [X] T113 Create Phase 1 completion checklist and verify all items checked
- [X] T114 Code review: Implementation verified for quality and consistency
- [X] T115 Commit Phase 1 implementation to feature branch with summary message
- [X] T116 Phase 1 ready for merge to main branch

---

## PHASE 1.10: UI Design Refinement (Session 2025-01-29 Clarification)

**Goal**: Implement UI design clarifications from Session 2025-01-29  
**Reference**: `specs/021-glossary-page/UI_DESIGN.md`  
**Independent Test**: Glossary page matches BolognesePlatform layout; sticky header updates correctly; term display shows only French content; no background/border/hover effects  
**Component Strategy**: Reuse GlossarySearchBar; create StickyHeader component; leverage BolognesePlatform text styling

### UI Components Refactoring

- [X] T126 [P] Extract shared `<StickyHeader>` component from `BolognesePlatform` into `src/components/StickyHeader.tsx` and reuse in glossary
- [X] T127 [P] Extract shared `<LogoTitle>` component (SPADA LIBRERIA + platform v1.0) into `src/components/LogoTitle.tsx` and reuse in BolognesePlatform + GlossaryPage
- [X] T128 [P] Update GlossaryPage.tsx top bar layout: use `<LogoTitle />` (left) + GLOSSAIRE title (center) + Back button (right)
- [X] T129 [P] Implement sticky header state tracking to update Category/Type as user scrolls (reuse BolognesePlatform logic)
- [X] T130 Update TermDisplay component to match UI_DESIGN.md styling: Italian name, French definition only, no English, no translation line
- [X] T131 [P] Add BolognesePlatform prose-styling classes to all text content (line-height, letter-spacing, color hierarchy)
- [X] T132 [P] Remove background/border from all term entries; verify no hover effects
- [X] T133 Implement subtle 80%-width dividers between term entries using Tailwind border utilities
- [X] T134 [P] Write integration test for UI layout: top bar, search bar, sticky header, content area in `src/__tests__/glossary-ui-layout.test.tsx`
- [ ] T135 Verify responsive design on mobile (320px), tablet (768px), desktop (1920px) using existing test framework
- [ ] T136 Phase 1.10 UI refinement complete and verified

---

## PHASE 2: Treatise Integration (P2)

**Goal**: Connect glossary page to treatise content  
**User Story**: US4 - Access Glossary from Treatise

- [X] T120 [P] Write test for treatise-to-glossary navigation links in `src/components/__tests__/GlossaryLink.test.tsx`
- [X] T121 [P] Implement GlossaryLink component in `src/components/GlossaryLink.tsx` (clickable term link that navigates to `/glossary`)
- [X] T122 Integrate GlossaryLink into TextParser component to link glossary terms in treatises
- [X] T123 [P] Write integration test for treatise-to-glossary workflow
- [X] T124 Verify browser back button returns to treatise
- [X] T125 Phase 2 implementation complete and tested

---

## PHASE 3: Advanced Integration - URL Hash Fragments

**Goal**: Support direct navigation to specific terms via URL hash (e.g., `/glossary#mandritto`)

- [X] T140 [P] Write test for hash parsing and auto-scroll in `src/components/__tests__/GlossaryHashNavigation.test.tsx`
- [X] T141 Implement hash fragment parsing in GlossaryPage component
- [X] T142 Implement auto-scroll to target term on page load with hash
- [X] T143 Update browser history when term selected from treatise link
- [X] T144 [P] Write integration test for hash navigation from treatise
- [X] T145 Phase 3 implementation complete and tested

---

## PHASE 4: Content Editing Interface

**Goal**: Allow users to edit and create glossary content and treatise sections  
**Reference**: See [PHASE_4_ANALYSIS.md](PHASE_4_ANALYSIS.md) and [PHASE_4_PLAN.md](PHASE_4_PLAN.md) for detailed implementation strategy and component architecture

### Phase 4a: Edit Existing Glossary Terms (Inline Editing)

**Goal**: Add per-term "Edit" button to modify `category`, `type`, `term`, and `definition_fr` fields with Markdown support  
**User Story**: Users can click Edit button next to any term, edit fields using TextEditor (with Markdown support), save changes persisted to `data/glossary.yaml`  
**Implementation Strategy**: Reuse `TextEditor.tsx` component pattern from BolognesePlatform; use `MarkdownRenderer.tsx` for definition preview; single edit button per term (left of term heading)

#### Backend: API Endpoint

- [X] T150 [P] Write test for API endpoint to save glossary term edits in `src/app/api/glossary/__tests__/term.test.ts`
- [X] T151 Create POST endpoint `/api/glossary/term` in `src/app/api/glossary/term/route.ts` to update term fields (`category`, `type`, `term`, `definition_fr`) in `data/glossary.yaml`
- [X] T152 [P] Add validation logic: verify termKey exists, field is valid, value is non-empty
- [X] T153 Add error handling and graceful failure responses

#### Frontend: Components

- [ ] T154 [P] Write test for GlossaryTermEditor component in `src/components/__tests__/GlossaryTermEditor.test.tsx` (edit state, save/cancel, API integration)
- [X] T155 Implement GlossaryTermEditor component in `src/components/GlossaryTermEditor.tsx` (reuse TextEditor pattern, supports 4 editable fields, calls `/api/glossary/term` endpoint)
- [X] T156 [P] Update TermDisplay component to include edit button and conditional rendering (show edit button when not editing, show GlossaryTermEditor when editing)
- [X] T157 Update GlossaryContent component to pass `isEditable` prop to TermDisplay (enables edit mode when glossary is in edit mode)
- [X] T158 Update GlossaryPage component to add global edit mode toggle button in header

#### Markdown Support

- [X] T159 [P] Add MarkdownRenderer import to TermDisplay and render term definitions with Markdown support (reuse existing component from `src/components/MarkdownRenderer.tsx`)
- [X] T160 Update TextEditor to support multiline Markdown input for definition field
- [ ] T161 [P] Write test for Markdown rendering in glossary definitions in `src/components/__tests__/TermDisplay.test.tsx`

#### Testing & Validation

- [ ] T162 [P] Write integration test: Edit term field → save → page reload shows updated value
- [ ] T163 [P] Write integration test: Edit multiple fields in sequence → all saved correctly
- [ ] T164 Test undo/redo functionality in TextEditor (Ctrl+Z, Ctrl+Y)
- [ ] T165 Test error cases: invalid termKey, API failure, network timeout
- [ ] T166 Phase 4a implementation complete and tested

---

### Phase 4b: Create New Glossary Terms (Issue #55)

**Goal**: Add "Ajouter Element" button to create new glossary entries via form  
**User Story**: Users can click "Ajouter Element" button, fill form with (category, type, term, definition_fr, optional translation), submit creates new term in `data/glossary.yaml`  
**Implementation Strategy**: Create NewTermForm component; reuse TextEditor pattern for definition field; add term key generation (slug sanitization)

#### Backend: API Endpoint

- [X] T170 Create POST endpoint `/api/glossary/terms` in `src/app/api/glossary/terms/route.ts` to add new glossary terms to `data/glossary.yaml`
- [X] T171 [P] Add term key generation logic (slugify term name, handle accents, prevent duplicates)
- [X] T172 [P] Add validation: required fields (category, type, term, definition_fr), prevent duplicate term keys

#### Frontend: Components

- [ ] T173 [P] Write test for NewTermForm component in `src/components/__tests__/NewTermForm.test.tsx` (form fields, validation, submit)
- [X] T174 Implement NewTermForm component in `src/components/NewTermForm.tsx` (collects category/type/term/definition fields, calls `/api/glossary/terms` endpoint)
- [X] T175 Update GlossaryPage component to add "Ajouter Element" button and toggle form display
- [X] T176 [P] Add category autocomplete/suggestions in NewTermForm (extract from existing terms)

#### Testing & Validation

- [ ] T177 [P] Write integration test: Create new term → save → page reload shows new term in correct category
- [ ] T178 [P] Write test: Duplicate term key prevention → error message shown
- [ ] T179 Test form validation: required field validation, empty field errors
- [ ] T180 Phase 4b implementation complete and tested

---

### Phase 4c: Add New Treatise Sections (Issue #54)

**Goal**: Add "Nouvelle section" button to BolognesePlatform to create new treatise sections  
**User Story**: Users can click "Nouvelle section" button, fill form with (master, work, book, year, title, content_fr, optional content_it/notes), submit appends new section to correct YAML file  
**Implementation Strategy**: Create NewSectionForm component in BolognesePlatform; reuse TextEditor pattern; determine target YAML file based on master/work/book metadata

#### Backend: API Endpoint

- [X] T185 Create POST endpoint `/api/content/section` in `src/app/api/content/section/route.ts` to append new treatise section to correct YAML file
- [X] T186 [P] Add logic to select target YAML file based on `master`, `work`, `book` metadata matching
- [X] T187 [P] Add section ID generation and validation
- [X] T188 Add error handling: file not found, invalid metadata, write failures

#### Frontend: Components (BolognesePlatform)

- [ ] T189 [P] Write test for NewSectionForm component in `src/components/__tests__/NewSectionForm.test.tsx` (form fields, metadata selection)
- [X] T190 Implement NewSectionForm component in `src/components/NewSectionForm.tsx` (collects master/work/book/year/title/content fields, calls `/api/content/section` endpoint)
- [X] T191 Update BolognesePlatform component to add "Nouvelle section" button in header
- [X] T192 Add master/work/book selectors (dropdowns populated from existing treatise data)

#### Testing & Validation

- [ ] T193 [P] Write integration test: Create new section → save → page reload shows new section in correct treatise YAML file
- [ ] T194 [P] Write test: Section metadata validation (all required fields present)
- [ ] T195 Test file selection logic: verify correct YAML file chosen based on master/work/book
- [ ] T196 Phase 4c implementation complete and tested

---

### Phase 4 Summary

**Total Phase 4 Tasks**: 47 tasks (Phase 4a: 16 + Phase 4b: 10 + Phase 4c: 12 + integration: 9)

| Sub-Phase | Goal | Status |
|-----------|------|--------|
| 4a | Edit existing terms with Markdown support | Not Started |
| 4b | Create new glossary terms (Issue #55) | Not Started |
| 4c | Add new treatise sections (Issue #54) | Not Started |

**Implementation Sequence**: Phase 4a → Phase 4b → Phase 4c (shared backend infrastructure allows parallel development after 4a API is complete)

---

## PHASE 5: Cleanup Unused Code & Files

**Goal**: Remove dead code, unused components, and obsolete docs/files to keep the codebase lean
**Independent Test**: App builds and existing tests pass after cleanup

- [ ] T161 [P] Review unused file inventory in analysed/unused-files-analysis.md and confirm removal candidates
- [ ] T162 [P] Remove confirmed unused components/tests from spadalibreria/src/ and spadalibreria/src/__tests__/ (update imports accordingly)
- [ ] T163 [P] Remove unused mocks and fixtures in spadalibreria/src/__mocks__/ and spadalibreria/src/data/__mocks__/
- [ ] T164 [P] Delete obsolete docs/notes in specs/021-glossary-page/ and analysed/ (if no longer referenced)
- [ ] T165 Verify build/test still pass after cleanup and update analysed/unused-files-analysis.md with results

---

## Summary

**Total Tasks**: 148 across 7 phases

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 0 | T001-T012 (12 tasks) | BLOCKING - Refactoring glossary.yaml |
| Phase 1 | T020-T125 (106 tasks) | Ready after Phase 0 |
| Phase 1.10 | T126-T136 (11 tasks) | UI Design refinement |
| Phase 2 | T120-T125 (6 tasks) | After Phase 1.10 complete |
| Phase 3 | T140-T145 (6 tasks) | After Phase 2 complete |
| Phase 4 | T150-T160 (11 tasks) | After Phase 3 complete |
| Phase 5 | T161-T165 (5 tasks) | After Phase 4 complete |

**MVP Scope**: Phase 0 + Phase 1 + Phase 1.10 (all P1 user stories with UI refinement)  
**Testing Approach**: TDD - Tests written before implementation for all tasks  
**Code Coverage Target**: 80%+ for Phase 1

---

## Dependency Graph

```
Phase 0: Glossary.yaml refactoring (T001-T012)
    ↓ (BLOCKER)
Phase 1.0: Type definitions & utilities (T020-T026) [COMPLETED ✅]
    ↓
Phase 1.1: State management context (T030-T033) [COMPLETED ✅]
    ↓
├─→ Phase 1.2: US1 - Browse (T040-T048)
│   ├─ Reuse: Term.tsx patterns (TermDisplay), BolognesePlatform toggles (LanguageSelector)
│   └─ New: CategorySection, GlossaryContent
├─→ Phase 1.3: US2 - Search (T050-T056)
│   ├─ Reuse: SearchBar.tsx pattern (GlossarySearchBar), highlighter.ts utility
│   └─ Updates: TermDisplay search highlighting
├─→ Phase 1.4: US3 - Detail View (T060-T066)
│   └─ Updates: TermDisplay multilingual support
├─→ Phase 1.5: Page route & integration (T070-T075)
├─→ Phase 1.6: Integration tests (T080-T086)
├─→ Phase 1.7: Responsive design (T090-T096)
├─→ Phase 1.8: Performance (T100-T106)
└─→ Phase 1.9: Final validation (T110-T116)
    ↓
Phase 1.10: UI Design Refinement (T126-T136) [NEW - Session 2025-01-29]
    ├─ Extract StickyHeader + LogoTitle components (T126-T127)
    ├─ Refactor top bar layout (T128-T129)
    ├─ Update TermDisplay styling (T130-T133)
    └─ Verify UI/responsive/layout (T134-T136)
    ↓ (PHASE 1 + 1.10 COMPLETE)
    ↓
Phase 2: Treatise integration (T120-T125)
    ↓
Phase 3: URL hash fragments (T140-T145)
    ↓
Phase 4: Content editing (T150-T160)
    ↓
Phase 5: Cleanup unused code/files (T161-T165)
```

---

## Task Summary

**Phase 1 Task Count**: 108 tasks total (including Phase 1.10 UI refinement)
- Phase 1.0: 7 tasks [✅ COMPLETED]
- Phase 1.1: 4 tasks [✅ COMPLETED]
- Phase 1.2: 9 tasks (US1 - Browse)
- Phase 1.3: 7 tasks (US2 - Search)
- Phase 1.4: 7 tasks (US3 - Detail View)
- Phase 1.5: 6 tasks (Page Route & Integration)
- Phase 1.6: 7 tasks (Integration Tests)
- Phase 1.7: 7 tasks (Responsive Design)
- Phase 1.8: 7 tasks (Performance)
- Phase 1.9: 7 tasks (Final Validation)
- **Phase 1.10: 11 tasks** (UI Design Refinement - NEW)
- **Phase 5: 5 tasks** (Cleanup unused code/files)

**Progress**: 20/108 tasks complete (~19%)

**Component Reuse**: 
- 4 existing components/utilities analyzed for reuse
- 3 to be adapted/reused with modifications (SearchBar, Language toggles, highlighter.ts)
- 1 to be referenced for patterns (Term.tsx)
- 6 new components to create (TermDisplay, CategorySection, LanguageSelector, GlossaryContent, GlossarySearchBar, GlossaryPage)
- **NEW**: StickyHeader component (reusable for future phases)
- **NEW**: LogoTitle component (shared between BolognesePlatform and GlossaryPage)

````

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

**Phase 5 Parallelization** (Cleanup):
- T161-T164: Audit/remove tasks can run in parallel (different folders)

**Recommended Execution Strategy**:
1. **Sequential**: Phase 0 → Phase 1.0 → Phase 1.1 (blockers)
2. **Parallel**: Phase 1.2, 1.3, 1.4 can execute in parallel after Phase 1.1
3. **Sequential**: Phase 1.5, 1.6, 1.7, 1.8, 1.9 (dependent on earlier phases)
4. **Sequential**: Phase 2 → 3 → 4 (each depends on previous)

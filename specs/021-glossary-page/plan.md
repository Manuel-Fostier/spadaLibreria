# Implementation Plan: Glossary Page

**Branch**: `021-glossary-page-phase-1-3` | **Date**: 2026-01-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/021-glossary-page/spec.md`

**Status**: Phase 0 & Phase 1 design complete; ready for Phase 2 implementation (when category field refactoring complete)

## Summary

Add a dedicated glossary page that allows users to browse, search, and explore the complete fencing terminology glossary (strikes, guards, techniques, weapons) independently from treatise content. Phase 1 MVP focuses on standalone glossary with hierarchical browsing, browser-like search with inline highlighting, and French-only display of definitions and translations. All glossary terms are organized by Category → Type → Term and displayed simultaneously without pagination or filtering UI.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18, Next.js 15 (App Router)  
**Primary Dependencies**: Next.js, React, Tailwind CSS, js-yaml, lucide-react  
**Storage**: YAML files (`data/glossary.yaml`), browser localStorage for user preferences  
**Testing**: Jest + React Testing Library (TDD approach)  
**Target Platform**: Web (browser), local-only application  
**Project Type**: Web application (Next.js frontend with server-side data loading)  
**Performance Goals**: Page load <2s, search execution <100ms, no pagination (all ~80 terms displayed)  
**Constraints**: Local-only (no external services), French-only display (no multilingual UI), always-visible content (no expand/collapse)  
**Scale/Scope**: ~80 glossary terms, 8 categories, 3 languages (IT/FR/EN) in data, French-only in UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Content lives in `data/` YAML (no hardcoded treatise/glossary text in TS/React); IDs normalized; literal blocks and bullets preserved.
- Local-only: no external services/telemetry/PII; assets remain local.
- Tooling: use `npm` for JS/TS; `uv` for Python; add Python deps via `uv add`, Node deps via `npm install`.
- Quality/format: no failing build/lint; keep glossary `{term}` links and paragraph/bullet integrity; respect server/client boundaries (no `fs` in client components).
- Accessibility/UX: maintain readable typography, contrast, keyboard usability; glossary tooltips remain usable and non-intrusive.

## Project Structure

### Documentation (this feature)

```text
specs/021-glossary-page/
├── spec.md                      # Feature specification (LOCKED - French-only display)
├── plan.md                      # This file (implementation plan)
├── research.md                  # Phase 0: Research & clarifications (10 items resolved)
├── data-model.md                # Phase 1: Entity design & validation rules
├── quickstart.md                # Phase 1: Implementation roadmap with TDD approach
├── PHASE_1_COMPLETE.md          # Design completion report & constitution check
├── contracts/
│   └── glossary-api.md          # API contracts (GET /api/content/glossary)
└── tasks.md                     # Phase 2 output: Task breakdown (T001-T121+)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── glossary.ts              # GlossaryTerm, GroupedGlossary interfaces
├── lib/
│   ├── glossaryLoader.ts        # loadGlossaryTerms(), groupGlossaryByCategory()
│   ├── glossarySearch.ts        # searchGlossary() utility
│   └── __tests__/               # Unit tests for utilities
├── contexts/
│   ├── GlossaryContext.tsx       # State management (terms, search, language)
│   └── __tests__/               # Context tests
├── components/
│   ├── GlossaryPage.tsx          # Main page component
│   ├── GlossaryPageWrapper.tsx   # Context provider wrapper
│   ├── GlossaryContent.tsx       # Content area with all categories
│   ├── GlossarySearchBar.tsx     # Search input (adapted from SearchBar.tsx)
│   ├── CategorySection.tsx       # Category display component
│   ├── TermDisplay.tsx           # Individual term display (French-only)
│   ├── LanguageSelector.tsx      # Language toggle (adapted from BolognesePlatform)
│   └── __tests__/               # Component tests
├── app/
│   ├── glossary/
│   │   ├── page.tsx             # Route: /glossary
│   │   └── __tests__/
│   └── api/
│       └── content/
│           └── glossary/
│               └── route.ts     # Endpoint: GET /api/content/glossary
└── __tests__/
    ├── glossary-workflow.test.tsx
    ├── glossary-search-integration.test.tsx
    ├── glossary-language-integration.test.tsx
    └── glossary-performance.test.tsx

data/
└── glossary.yaml                # YAML data (refactored with category field in Phase 0)
```

**Structure Decision**: Web application (Next.js) with server-side YAML loading and client-side React UI. TDD approach: tests written before implementation. Component reuse strategy detailed in tasks.md and REUSABLE_COMPONENTS.md.

## Key Design Decisions

### 1. French-Only Display (Locked User Requirement)
- **Decision**: Display only French definitions and translations
- **Rationale**: User explicitly required: "Only french will be displayed"
- **Impact**: Simplifies UI (no language selector), reduces component complexity
- **Data**: YAML contains IT/FR/EN, but only FR rendered on page

### 2. No Expand/Collapse Functionality (Locked Requirement)
- **Decision**: All content always visible, no click-to-expand
- **Rationale**: User explicitly rejected: "there is no fucking 'click-to-expand functionality'"
- **Impact**: Simpler component structure, better UX for quick scanning
- **Display**: Hierarchical but always-visible: Category → Type → Term

### 3. Browser-Like Search (Specification Requirement)
- **Decision**: Inline highlighting without filtering/hiding non-matches
- **Rationale**: Users expect browser Find behavior (Ctrl+F)
- **Impact**: Maintains context, all content visible even during search
- **Performance**: Reuse existing `highlighter.ts` utility

### 4. No Pagination (Specification Requirement)
- **Decision**: Display all ~80 terms at once
- **Rationale**: Specification requires "all content always visible"
- **Performance**: 80 terms render <200ms, acceptable for modern hardware
- **Alternative rejected**: Virtual scrolling adds complexity without benefit at this scale

### 5. React Context for State Management (Architecture Choice)
- **Decision**: Use GlossaryContext instead of Redux/Zustand
- **Rationale**: Matches existing SearchContext pattern, scope doesn't require global state
- **Impact**: Simpler, fewer dependencies, maintainable

## Component Reuse Strategy

**See tasks.md for detailed reuse instructions per component.**

| Existing Component | New Component | Reuse Pattern |
|---|---|---|
| **SearchBar.tsx** | **GlossarySearchBar.tsx** | Adapt UI pattern; replace SearchContext with GlossaryContext |
| **BolognesePlatform.tsx** (toggles) | **LanguageSelector.tsx** | Adapt button styling; convert checkboxes to radio group |
| **highlighter.ts** | Direct reuse | Apply to term names, definitions, translations |
| **Term.tsx** | **TermDisplay.tsx** | Reference display patterns; create new full-display component |

## Blockers & Dependencies

### Phase 0 Blocker: Category Field Refactoring

**Status**: 🔄 **ASSIGNED** - Must complete before Phase 1 implementation  
**Task**: Add explicit `category` field to all ~80 terms in `data/glossary.yaml`

**Unblocks**:
- Phase 1.0: Type definitions (need category field)
- Phase 1.1: GlossaryContext (uses category for grouping)
- Phase 1.2+: All components (depend on structured categories)

### Phase 1 → Phase 2 Dependency

**Phase 1 Completion Required Before Phase 2**:
- All types and utilities implemented
- All components tested
- API endpoint working
- Glossary page accessible at `/glossary`
- 80%+ test coverage achieved

## Phase Breakdown

| Phase | Tasks | Goal | Status |
|---|---|---|---|
| **Phase 0** | T001-T012 | Refactor glossary.yaml with category field | 🔄 Assigned |
| **Phase 1.0** | T020-T026 | Types & utilities foundation | ✅ Complete |
| **Phase 1.1** | T030-T033 | GlossaryContext state management | ✅ Complete |
| **Phase 1.2** | T040-T048 | User Story 1: Browse glossary | ✅ Complete |
| **Phase 1.3** | T050-T056 | User Story 2: Search & highlight | ✅ Complete |
| **Phase 1.4** | T060-T066 | User Story 3: Detailed view | ✅ Complete |
| **Phase 1.5** | T070-T075 | Page route & integration | ✅ Complete |
| **Phase 1.6** | T080-T086 | Complete workflows & integration tests | ⏳ Ready |
| **Phase 1.7** | T090-T096 | Responsive design | ⏳ Ready |
| **Phase 1.8** | T100-T106 | Performance optimization | ⏳ Ready |
| **Phase 1.9** | T110-T116 | Final Phase 1 validation | ⏳ Ready |
| **Phase 2** | T120+ | Treatise integration (P2) | ⏳ After Phase 1 |

## Success Criteria

### Phase 1 MVP Acceptance

- ✅ All P1 user stories (Browse, Search, Detailed View) fully implemented
- ✅ 80%+ test coverage for Phase 1 code
- ✅ All tests passing (241+ tests in suite)
- ✅ Responsive design verified on 3 viewport sizes (mobile/tablet/desktop)
- ✅ Performance: <2s page load, <100ms search
- ✅ Glossary page accessible at `/glossary`
- ✅ French-only display working correctly
- ✅ Browser-like search highlighting functional
- ✅ No expand/collapse UI (all content visible)
- ✅ Ready for Phase 2 (treatise integration)

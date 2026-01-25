# Tasks: LocalStorage Utility Refactoring

**Feature**: 001-localstorage-utility  
**Input**: Design documents from `/specs/001-localstorage-utility/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testing Approach**: TDD (Test-Driven Development) - Tests are written FIRST before implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and testing infrastructure

- [x] T001 Install jest-localstorage-mock dependency: `npm install --save-dev jest-localstorage-mock`
- [x] T002 Configure localStorage mock in spadalibreria/setupTests.js (add import and beforeEach clear)
- [x] T003 Verify existing test configuration runs successfully: `npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core localStorage utility enhancement with backward compatibility - MUST be complete before ANY component migration

**⚠️ CRITICAL**: No component migration can begin until this phase is complete

### Tests for Foundational Utility (TDD - Write First)

- [x] T004 [P] Create test file spadalibreria/src/lib/__tests__/localStorage.test.ts with basic setItem/getItem tests
- [x] T005 [P] Add backward compatibility tests in spadalibreria/src/lib/__tests__/localStorage.test.ts for legacy format detection
- [x] T006 [P] Add error handling tests in spadalibreria/src/lib/__tests__/localStorage.test.ts (parse errors, quota exceeded, storage unavailable)
- [x] T007 [P] Add getSize() and removeItem() tests in spadalibreria/src/lib/__tests__/localStorage.test.ts

### Implementation for Foundational Utility

- [x] T008 Enhance LocalStorage.setItem() in spadalibreria/src/lib/localStorage.ts to wrap values in StorageItem with timestamp
- [x] T009 Enhance LocalStorage.getItem() in spadalibreria/src/lib/localStorage.ts with backward compatibility (detect wrapped vs legacy format)
- [x] T010 Update error handling in spadalibreria/src/lib/localStorage.ts (console.error, throw QuotaExceededError)
- [x] T011 Verify all foundational tests pass: `npm test -- --testPathPattern=localStorage`

**Checkpoint**: Foundation ready - localStorage utility fully tested and backward compatible. Component migration can now begin in parallel.

---

## Phase 3: User Story 1 - Data Persistence Reliability (Priority: P1) 🎯 MVP

**Goal**: Migrate all components to use centralized localStorage utility, ensuring reliable data persistence with graceful error handling

**Independent Test**: Save preferences and annotations, simulate storage errors (quota exceeded, corrupted data), verify application continues functioning with default values

### Component 1: BolognesePlatform (Simplest Migration)

#### Tests for BolognesePlatform (TDD - Write First)

- [x] T012 [P] [US1] Create test file spadalibreria/src/components/__tests__/BolognesePlatform.storage.test.tsx
- [x] T013 [P] [US1] Add test for loading showItalian preference from storage in spadalibreria/src/components/__tests__/BolognesePlatform.storage.test.tsx
- [x] T014 [P] [US1] Add test for saving showItalian to storage on toggle in spadalibreria/src/components/__tests__/BolognesePlatform.storage.test.tsx
- [x] T015 [P] [US1] Add test for default value when storage returns null in spadalibreria/src/components/__tests__/BolognesePlatform.storage.test.tsx
- [x] T016 [P] [US1] Add test for legacy format compatibility in spadalibreria/src/components/__tests__/BolognesePlatform.storage.test.tsx

#### Implementation for BolognesePlatform

- [x] T017 [US1] Replace direct localStorage.getItem('showItalian') with LocalStorage.getItem<boolean>() in spadalibreria/src/components/BolognesePlatform.tsx
- [x] T018 [US1] Replace direct localStorage.setItem('showItalian') with LocalStorage.setItem() in spadalibreria/src/components/BolognesePlatform.tsx
- [x] T019 [US1] Repeat T017-T018 for showEnglish flag in spadalibreria/src/components/BolognesePlatform.tsx
- [x] T020 [US1] Repeat T017-T018 for showNotes flag in spadalibreria/src/components/BolognesePlatform.tsx
- [x] T021 [US1] Remove manual JSON.parse/stringify calls in spadalibreria/src/components/BolognesePlatform.tsx
- [x] T022 [US1] Add null coalescing operators (??) for default values in spadalibreria/src/components/BolognesePlatform.tsx
- [x] T023 [US1] Verify BolognesePlatform tests pass: `npm test -- --testPathPattern=BolognesePlatform`

### Component 2: AnnotationDisplayContext (Medium Complexity)

#### Tests for AnnotationDisplayContext (TDD - Write First)

- [x] T024 [P] [US1] Create test file spadalibreria/src/contexts/__tests__/AnnotationDisplayContext.test.tsx
- [x] T025 [P] [US1] Add test for loading config from storage in spadalibreria/src/contexts/__tests__/AnnotationDisplayContext.test.tsx
- [x] T026 [P] [US1] Add test for saving config to storage on update in spadalibreria/src/contexts/__tests__/AnnotationDisplayContext.test.tsx
- [x] T027 [P] [US1] Add test for error handling when storage fails in spadalibreria/src/contexts/__tests__/AnnotationDisplayContext.test.tsx

#### Implementation for AnnotationDisplayContext

- [x] T028 [US1] Replace window.localStorage.getItem() with LocalStorage.getItem<AnnotationDisplayConfig>() in spadalibreria/src/contexts/AnnotationDisplayContext.tsx
- [x] T029 [US1] Replace window.localStorage.setItem() with LocalStorage.setItem() in spadalibreria/src/contexts/AnnotationDisplayContext.tsx
- [x] T030 [US1] Remove manual JSON.parse/stringify in spadalibreria/src/contexts/AnnotationDisplayContext.tsx
- [x] T031 [US1] Add error handling for null storage returns in spadalibreria/src/contexts/AnnotationDisplayContext.tsx
- [x] T032 [US1] Verify AnnotationDisplayContext tests pass: `npm test -- --testPathPattern=AnnotationDisplayContext`

### Component 3: AnnotationContext (Most Complex - Map Serialization)

#### Tests for AnnotationContext (TDD - Write First)

- [x] T033 [P] [US1] Create test file spadalibreria/src/contexts/__tests__/AnnotationContext.test.tsx
- [x] T034 [P] [US1] Add test for loading annotations Map from storage in spadalibreria/src/contexts/__tests__/AnnotationContext.test.tsx
- [x] T035 [P] [US1] Add test for saving annotations Map to storage in spadalibreria/src/contexts/__tests__/AnnotationContext.test.tsx
- [x] T036 [P] [US1] Add test for merging localStorage with YAML annotations in spadalibreria/src/contexts/__tests__/AnnotationContext.test.tsx
- [x] T037 [P] [US1] Add test for corrupted data handling in spadalibreria/src/contexts/__tests__/AnnotationContext.test.tsx

#### Implementation for AnnotationContext

- [x] T038 [US1] Replace localStorage.getItem() with LocalStorage.getItem<Record<string, Annotation>>() in spadalibreria/src/contexts/AnnotationContext.tsx
- [x] T039 [US1] Replace localStorage.setItem() with LocalStorage.setItem() in spadalibreria/src/contexts/AnnotationContext.tsx
- [x] T040 [US1] Update Map serialization to work with utility (Object.fromEntries/Object.entries) in spadalibreria/src/contexts/AnnotationContext.tsx
- [x] T041 [US1] Add try-catch around storage operations with console.error logging in spadalibreria/src/contexts/AnnotationContext.tsx
- [x] T042 [US1] Verify AnnotationContext tests pass: `npm test -- --testPathPattern=AnnotationContext`

### Integration & Verification

- [x] T043 [US1] Run all tests to verify no regressions: `npm test`
- [x] T044 [US1] Manual test: Toggle columns, verify persistence after refresh
- [x] T045 [US1] Manual test: Create annotation, verify persistence after refresh
- [x] T046 [US1] Manual test: Clear localStorage in DevTools, verify app loads with defaults without crashing

**Checkpoint**: User Story 1 complete - All components use centralized utility, graceful error handling implemented, backward compatibility verified

---

## Phase 4: User Story 2 - Storage Usage Monitoring (Priority: P2)

**Goal**: Add proactive storage monitoring to warn users before hitting limits

**Independent Test**: Fill storage to 80%+ capacity, verify warning appears when saving data

### Tests for Storage Monitoring (TDD - Write First)

- [x] T047 [P] [US2] Add test for isFull() method in spadalibreria/src/lib/__tests__/localStorage.test.ts
- [x] T048 [P] [US2] Add test for getSize() calculation accuracy in spadalibreria/src/lib/__tests__/localStorage.test.ts
- [x] T049 [P] [US2] Add test for warning threshold detection (80% capacity) in spadalibreria/src/lib/__tests__/localStorage.test.ts

### Implementation for Storage Monitoring

- [x] T050 [US2] Enhance LocalStorage.setItem() to return warning status in spadalibreria/src/lib/localStorage.ts
- [x] T051 [US2] Add size check before write operation in spadalibreria/src/lib/localStorage.ts
- [x] T052 [US2] Calculate projected size after write in spadalibreria/src/lib/localStorage.ts
- [x] T053 [US2] Return warning object { success: true, warning?: string } from setItem() in spadalibreria/src/lib/localStorage.ts

### UI Integration for Warnings (Optional - If Requested)

- [ ] T054 [US2] Update AnnotationContext to check for storage warnings in spadalibreria/src/contexts/AnnotationContext.tsx
- [ ] T055 [US2] Add toast/notification when storage warning received in spadalibreria/src/contexts/AnnotationContext.tsx
- [ ] T056 [US2] Display storage usage statistics in settings or status bar (if UI spec provided)

### Verification

- [x] T057 [US2] Run storage monitoring tests: `npm test -- --testPathPattern=localStorage`
- [ ] T058 [US2] Manual test: Fill storage near capacity, verify warning appears
- [ ] T059 [US2] Manual test: Check getSize() reports accurate storage usage

**Checkpoint**: User Story 2 complete - Storage monitoring active, proactive warnings implemented

---

## Phase 5: User Story 3 - Consistent Data Format (Priority: P3) — **Cancelled per user request**

**Goal**: Ensure all storage operations use consistent wrapper with metadata for debugging

**Status**: Skipped (T060-T069 not in scope unless reinstated)

### Tests for Data Format Consistency (TDD - Write First)

- [ ] T060 [P] [US3] Add test verifying StorageItem wrapper structure in spadalibreria/src/lib/__tests__/localStorage.test.ts
- [ ] T061 [P] [US3] Add test verifying timestamp is included in all writes in spadalibreria/src/lib/__tests__/localStorage.test.ts
- [ ] T062 [P] [US3] Add test verifying version field support in spadalibreria/src/lib/__tests__/localStorage.test.ts

### Implementation for Data Format Consistency

- [ ] T063 [US3] Verify all setItem() calls properly wrap values in StorageItem in spadalibreria/src/lib/localStorage.ts
- [ ] T064 [US3] Add optional version parameter to StorageItem interface in spadalibreria/src/lib/localStorage.ts
- [ ] T065 [US3] Document StorageItem structure in JSDoc comments in spadalibreria/src/lib/localStorage.ts

### Verification & Documentation

- [ ] T066 [US3] Run all unit tests: `npm test -- --testPathPattern=localStorage`
- [ ] T067 [US3] Manual inspection: Check localStorage in DevTools, verify wrapper format
- [ ] T068 [US3] Code review: Verify no direct localStorage calls remain (search codebase for "localStorage.")
- [ ] T069 [US3] Update JSDoc comments for all LocalStorage methods in spadalibreria/src/lib/localStorage.ts

**Checkpoint**: User Story 3 complete - All storage operations use consistent format with metadata

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T070 [P] Run full test suite: `npm test`
- [x] T071 [P] Run linting: `npm run lint`
- [x] T072 [P] Build verification: `npm run build`
- [x] T073 Update README.md with localStorage utility usage guidelines
- [x] T074 Update .github/copilot-instructions.md with localStorage utility best practices
- [x] T075 [P] Add TypeScript strict null checks verification for storage calls
- [x] T076 Code cleanup: Remove commented-out old localStorage code
- [x] T077 Run quickstart.md validation scenarios
- [x] T078 Verify backward compatibility: Test with browser containing old format data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all component migrations
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Phase 4)**: Can start after Foundational (Phase 2) or after US1 - Enhances existing utility
- **User Story 3 (Phase 5)**: Can start after Foundational (Phase 2) or after US1 - Verification focused
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: REQUIRED - Core migration, all components must use utility
  - BolognesePlatform → AnnotationDisplayContext → AnnotationContext (sequential by complexity)
- **User Story 2 (P2)**: OPTIONAL - Enhances US1, adds monitoring
- **User Story 3 (P3)**: OPTIONAL - Verification and consistency checks

### Parallel Opportunities Within Phases

**Phase 2 (Foundational):**
- T004-T007: All test file creation can happen in parallel
- After tests written: T008-T010 implementation tasks must be sequential

**Phase 3 (User Story 1):**
- T012-T016: BolognesePlatform tests can be written in parallel
- T024-T027: AnnotationDisplayContext tests can be written in parallel  
- T033-T037: AnnotationContext tests can be written in parallel
- Implementation: Complete one component before starting next (reduces merge conflicts)

**Phase 4 (User Story 2):**
- T047-T049: All monitoring tests can be written in parallel

**Phase 6 (Polish):**
- T070-T072, T075: Testing and verification tasks can run in parallel

### Recommended Execution Strategy

**MVP First (Minimum Viable Product):**
```bash
# Sprint 1: Foundation + Core Migration
Phase 1 → Phase 2 → Phase 3 (User Story 1 - P1)
# Delivers: Reliable storage with error handling, backward compatible

# Sprint 2: Enhancements (Optional)
Phase 4 (User Story 2 - P2) + Phase 5 (User Story 3 - P3)
# Delivers: Storage monitoring + data format consistency

# Sprint 3: Polish
Phase 6
# Delivers: Production-ready, fully documented
```

**TDD Workflow Per Phase:**
1. Write all tests for the phase (marked with [P] can be parallel)
2. Run tests - verify they FAIL (red)
3. Implement code to make tests pass (green)
4. Refactor and optimize (refactor)
5. Move to next phase

---

## Parallel Example: User Story 1 Component Tests

```bash
# Developer 1: BolognesePlatform tests
npm test -- --watch --testPathPattern=BolognesePlatform

# Developer 2: AnnotationDisplayContext tests (in parallel)
npm test -- --watch --testPathPattern=AnnotationDisplayContext

# Developer 3: AnnotationContext tests (in parallel)
npm test -- --watch --testPathPattern=AnnotationContext
```

Once tests are written and failing, implement components sequentially to avoid merge conflicts on localStorage.ts.

---

## Implementation Strategy

### MVP Scope (Must-Have)

**Phase 1 + Phase 2 + Phase 3 (User Story 1)** = Core functionality
- Estimated time: 2-3 hours
- Delivers: All components using centralized utility, graceful error handling, backward compatibility
- This is the minimum for a successful refactoring

### Enhanced Scope (Should-Have)

**+ Phase 4 (User Story 2)** = Storage monitoring
- Estimated additional time: +30 minutes
- Delivers: Proactive warnings when storage fills up

### Complete Scope (Nice-to-Have)

**+ Phase 5 (User Story 3) + Phase 6** = Full polish
- Estimated additional time: +30 minutes
- Delivers: Consistent data format, full documentation, production-ready

---

## Success Criteria

### User Story 1 Success (P1 - REQUIRED)
✅ All 10 direct localStorage calls replaced with utility  
✅ All tests pass (100% test coverage for storage operations)  
✅ Application handles storage errors gracefully (no crashes)  
✅ Backward compatibility verified (existing data still loads)  
✅ Manual testing confirms data persists across refreshes  

### User Story 2 Success (P2 - OPTIONAL)
✅ Storage monitoring implemented with 80% warning threshold  
✅ getSize() returns accurate storage usage  
✅ Warnings displayed to users when approaching capacity  

### User Story 3 Success (P3 - OPTIONAL)
✅ All stored values include timestamp metadata  
✅ StorageItem wrapper consistently applied  
✅ No direct localStorage calls remain in codebase  
✅ Documentation updated with usage guidelines  

### Overall Success
✅ `npm test` passes 100%  
✅ `npm run lint` passes with no errors  
✅ `npm run build` completes successfully  
✅ quickstart.md scenarios validated  
✅ Code review approval  

---

## Task Count Summary

- **Total Tasks**: 78
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 8 tasks (includes 4 test tasks)
- **Phase 3 (User Story 1 - P1)**: 35 tasks (includes 17 test tasks)
- **Phase 4 (User Story 2 - P2)**: 13 tasks (includes 3 test tasks)
- **Phase 5 (User Story 3 - P3)**: 10 tasks (includes 3 test tasks)
- **Phase 6 (Polish)**: 9 tasks

**Test Tasks**: 27 (35% of total - TDD approach)  
**Parallelizable Tasks**: 23 (marked with [P])  
**Independent User Stories**: 3 (US1, US2, US3)

**Estimated Timeline**: 
- MVP (P1): 2-3 hours
- With P2: +30 minutes
- Complete: +1 hour
- **Total**: 3-4.5 hours for experienced developers using TDD

---

## References

- [Feature Spec](./spec.md) - User stories and requirements
- [Implementation Plan](./plan.md) - Technical approach and structure
- [Data Model](./data-model.md) - StorageItem structure and patterns
- [API Contract](./contracts/localStorage-api.md) - Complete API specification
- [Quick Start Guide](./quickstart.md) - Step-by-step TDD workflow
- [Research](./research.md) - Technical decisions and best practices

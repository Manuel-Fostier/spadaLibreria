# Feature Specification: Glossary Page

**Feature Branch**: `021-glossary-page`  
**Created**: January 27, 2026  
**Status**: Draft  
**Input**: User description: "Ajout d'une page glossaire"

## Overview

The Spada Libreria platform contains a comprehensive glossary of fencing terminology (strikes, guards, techniques, weapons) in Italian, French, and English. Currently, glossary terms are only accessible as tooltips when viewing treatises. This feature adds a dedicated glossary page that allows users to browse, search, and explore the complete glossary independently from any treatise content.

## User Scenarios & Testing

### User Story 1 - Browse Complete Glossary (Priority: P1)

A user wants to explore all fencing terminology available in the system to understand the vocabulary before or during their study of treatises. They visit the glossary page and all terms are immediately visible, organized hierarchically by category and type.

**Why this priority**: Essential for introducing new users to the terminology and supporting independent learning. The glossary is a core asset of the platform.

**Independent Test**: Can be fully tested by navigating to the glossary page and verifying that all glossary terms are displayed with their definitions in the user's selected language, organized by Category → Type → Term, delivering complete vocabulary reference capability.

**Acceptance Scenarios**:

1. **Given** a user is on the glossary page, **When** they load the page, **Then** all glossary terms are displayed immediately in hierarchical organization (Category → Type → Term) with their full definitions visible in the selected language
2. **Given** a user views the glossary, **When** they switch between Italian, French, and English, **Then** the definitions and translations update to the selected language
3. **Given** a user views a term in the glossary, **When** the term has multiple translations (e.g., English has multiple translator versions), **Then** all available translations are shown

---

### User Story 2 - Search and Filter Glossary Terms (Priority: P1)

A user wants to quickly find specific terminology by using a search function that works like a browser's Find-in-Page feature. They type a search term and matching terms are highlighted and visible on the page.

**Why this priority**: Critical for usability - users need efficient access to specific terms when studying. Browser-like search is familiar and intuitive.

**Independent Test**: Can be fully tested by typing a search term in the search field and verifying that matching terms are highlighted inline throughout the glossary, delivering efficient term lookup capability.

**Acceptance Scenarios**:

1. **Given** a search field in the glossary, **When** a user types a term name, **Then** all matching terms are highlighted in the displayed glossary and scroll focus moves to the first match
2. **Given** a user searches, **When** they type a category name (e.g., "Garde"), **Then** all matching categories and terms are highlighted throughout the glossary
3. **Given** a user searches, **When** they type a word from a definition (e.g., "thrust"), **Then** terms containing that word in their definition are highlighted
4. **Given** a user searches for a term, **When** no matches exist, **Then** a clear "no results" message is displayed above the glossary
5. **Given** a user has active search highlighting, **When** they clear the search field, **Then** all highlighting is removed and the full glossary remains visible

---

### User Story 3 - View Detailed Term Information (Priority: P2)

A user wants to understand a term deeply, seeing its Italian name, category, complete definitions, translations, and how it relates to fencing practice.

**Why this priority**: Enhances learning experience but secondary to basic browsing and search. Supports deeper engagement once users find a term of interest.

**Independent Test**: Can be fully tested by clicking on any glossary term and verifying that a detail view displays all available information about that term, delivering comprehensive term reference capability.

**Acceptance Scenarios**:

1. **Given** a user clicks on a glossary term, **When** a detail view opens, **Then** it displays the Italian term, category, definitions in all languages, and translations
2. **Given** a term has etymological or contextual notes, **When** viewing the term details, **Then** these notes are displayed if available

---

### User Story 4 - Access Glossary from Treatise (Priority: P2 - Phase 2)

A user is reading a treatise and encounters glossary-linked terms. They want to navigate to the full glossary page to explore the term and related content in context.

**Why this priority**: Enhances workflow continuity by enabling cross-content navigation. Deferred to Phase 2 to allow MVP completion of standalone glossary first.

**Independent Test**: Can be fully tested by clicking a glossary term link within a treatise and being navigated to the glossary page, delivering basic cross-content navigation capability.

**Acceptance Scenarios**:

1. **Given** a user is reading a treatise with glossary links, **When** they click a term link, **Then** they are navigated to the glossary page with that term's category and type pre-selected or displayed
2. **Given** a user navigates from a treatise to the glossary, **When** they use browser back, **Then** they return to their previous position in the treatise

**Phase 3 Enhancement**: Support URL hash fragments (e.g., `/glossary#falso_dritto`) to auto-scroll directly to a specific term when navigating from treatises.

---

### Edge Cases

- What happens when glossary data fails to load?
- How does the system handle missing translations or definitions for certain languages?
- What if a term has no category assigned?
- How does the glossary page perform when displaying hundreds of terms without pagination?
- How should search highlighting work on mobile devices with limited screen space?
- What happens when search returns no results - is the glossary still fully visible?
- How should the glossary handle very long definitions that might affect readability?

## Requirements

### Functional Requirements

- **FR-001**: System MUST load and display all glossary terms from `data/glossary.yaml` on the glossary page
- **FR-002**: System MUST support language selection (Italian, French, English) and display definitions in the selected language
- **FR-003**: System MUST provide a search function that filters glossary terms by term name, category/type, and definition content in real-time across all supported languages
- **FR-004**: System MUST NOT include category filtering controls - all terms are always displayed at once
- **FR-005**: System MUST display glossary terms organized hierarchically: Category (e.g., "Coups et Techniques") → Type (e.g., "Attaque / Frappe de taille") → Term with full definitions and translations in all supported languages, always visible (no collapsing)
- **FR-006**: System MUST implement a browser-like search function that highlights all matching terms inline without filtering/hiding non-matching terms
- **FR-007**: System MUST provide a dedicated route/URL for the glossary page (e.g., `/glossary`)
- **FR-008**: System MUST handle missing or incomplete glossary data gracefully without crashing
- **FR-009**: System MUST maintain responsive design that works on desktop, tablet, and mobile devices
- **FR-010**: System MUST integrate with the existing search highlighting system to highlight search terms inline in glossary results
- **FR-011**: System MUST provide clear visual indication (e.g., color highlight, bold text) of which terms match the current search query

### Key Entities

- **Glossary Term**: Represents a single fencing term with Italian name, category, French definition, English definition, French translation, and English translation(s)
  - Key attributes: `term`, `category` (parent grouping), `type` (subcategory), `definition` (multilingual), `translation` (multilingual)
  - Relationships: None (standalone data)
  - **Data Model Note**: Current `data/glossary.yaml` uses YAML comments (e.g., `# Les Coups et Techniques`) to mark categories, not structured fields. See Technical Dependencies section.

## Technical Dependencies & Blockers

### Data Model Enhancement Required

**Current State**: Categories exist only as YAML comments in `data/glossary.yaml`, not as structured data fields within term records.

**Impact**: The hierarchical display requirement (Category → Type → Term) cannot be implemented without explicit category data in the YAML structure.

**Resolution Required (Pre-Implementation)**:

Choose one approach:
1. **Add `category` field to glossary.yaml**: Add a `category` key to each term (e.g., `category: "Coups et Techniques"`). Requires data file modification but provides clean, explicit structure.
2. **Parse YAML comments programmatically**: Extract categories from YAML comments at load time. Fragile and maintainability risk, but no data changes needed.
3. **Infer categories from type patterns**: Analyze `type` field values to extract category prefixes. May not work well for all terms.

**Recommendation**: Option 1 (add explicit `category` field) - provides maintainability and clarity for future glossary extensions.

**Acceptance Criteria**: 
- All terms in `data/glossary.yaml` have a `category` field
- Categories map to current YAML section headers (e.g., "Les Coups et Techniques" → "Coups et Techniques")
- Data model supports both category and type hierarchies for UI organization

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can locate any glossary term within 5 seconds using search highlighting
- **SC-002**: 100% of glossary entries from `data/glossary.yaml` are accessible and displayable on the glossary page with category and type information
- **SC-003**: Glossary page loads and displays content in under 2 seconds on standard broadband connections
- **SC-004**: Users can switch between languages (Italian, French, English) and see immediate updates to definitions
- **SC-005**: All three supported languages have complete definitions for 95%+ of glossary terms
- **SC-006**: Glossary page achieves responsive design with usable interface on mobile devices (320px+ width)
- **SC-007**: Search functionality returns results for partial term matches (e.g., typing "man" finds "Mandritto")
- **SC-008**: Users rate the glossary page as intuitive and useful (if user feedback is collected)

## Clarifications

### Session 2025-01-27

- Q: How should category filtering work? → A: No filtering/collapsing - all terms always displayed. Category structure is for organization only.
- Q: How should search work? → A: Browser-like Find behavior - highlights matches inline without hiding content
- Q: Should categories be expandable? → A: No - all content always visible, hierarchical structure is visual only
- Q: What about initial expansion state? → A: Not applicable - all content always expanded and visible
- Q: How should category display work in the UI? → A: As visual section headers/dividers, not interactive controls
- **Data Model Issue Identified**: Categories currently exist only as YAML comments in `data/glossary.yaml`, not as structured fields. Resolution required before implementation - recommend adding explicit `category` field to all terms.

## Assumptions

1. **Glossary Data Structure**: The glossary YAML structure will remain consistent with its current format (term, type, definition, translation)
2. **Language Support**: English glossary may have multiple translator versions; the display will show all available versions
3. **Content Ownership**: All glossary content is already created and maintained in `data/glossary.yaml`
4. **Search Scope**: Glossary search operates only on the glossary page; it does not need to search treatise content
5. **Accessibility**: The glossary page should follow the same accessibility standards as the rest of the platform
6. **No Backend Changes**: The feature uses existing data files and doesn't require new API endpoints or database modifications
7. **Reuse Existing Components**: The page can leverage existing React components like `TextParser`, `SearchBar`, and language switching infrastructure

## Phased Delivery Plan

This feature follows a three-phase rollout approach:

- **Phase 1 (MVP - This Release)**: Standalone glossary page with browsing, search, filtering, and categorization. User Stories 1-3. This delivers complete independent glossary functionality.
- **Phase 2 (Release +1)**: Integration with treatise pages. Add clickable glossary term links in treatises that navigate to the glossary page (User Story 4, simplified). No auto-scroll or URL parameters yet.
- **Phase 3 (Release +2)**: Advanced integration. Support URL hash fragments (e.g., `/glossary#falso_dritto`) to auto-scroll to specific terms when navigating from treatises.

## Out of Scope

- Modifying the glossary data structure or adding new data fields
- Creating an admin interface to edit glossary terms
- Implementing term usage statistics or popularity metrics
- Exporting glossary to other formats (PDF, spreadsheet, etc.)
- Adding term relationships or cross-references between terms
- Implementing favorites/bookmarking for individual terms

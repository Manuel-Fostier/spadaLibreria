# Feature Specification: Glossary Page

**Feature Branch**: `021-glossary-page`  
**Created**: January 27, 2026  
**Status**: Draft  
**Input**: User description: "Ajout d'une page glossaire"

## Overview

The Spada Libreria platform contains a comprehensive glossary of fencing terminology (strikes, guards, techniques, weapons) in Italian, French, and English. Currently, glossary terms are only accessible as tooltips when viewing treatises. This feature adds a dedicated glossary page that allows users to browse, search, and explore the complete glossary independently from any treatise content.

## User Scenarios & Testing

### User Story 1 - Browse Complete Glossary (Priority: P1)

A user wants to explore all fencing terminology available in the system to understand the vocabulary before or during their study of treatises. They visit the glossary page and can see all terms organized in a structured way.

**Why this priority**: Essential for introducing new users to the terminology and supporting independent learning. The glossary is a core asset of the platform.

**Independent Test**: Can be fully tested by navigating to the glossary page and verifying that all glossary terms are displayed with their definitions in the user's selected language, delivering complete vocabulary reference capability.

**Acceptance Scenarios**:

1. **Given** a user is on the glossary page, **When** they load the page, **Then** all glossary terms are displayed with their definitions visible in the default or previously selected language
2. **Given** a user views the glossary, **When** they switch between Italian, French, and English, **Then** the definitions and translations update to the selected language
3. **Given** a user views a term in the glossary, **When** the term has multiple translations (e.g., English has multiple translator versions), **Then** all available translations are shown

---

### User Story 2 - Search and Filter Glossary Terms (Priority: P1)

A user wants to quickly find specific terminology without scrolling through the entire glossary. They use search functionality to locate terms by name or filter by category.

**Why this priority**: Critical for usability - users need efficient access to specific terms when studying or reference. Especially important given the glossary can be large.

**Independent Test**: Can be fully tested by typing a search term and verifying that filtered results appear instantly, delivering efficient term lookup capability.

**Acceptance Scenarios**:

1. **Given** a search field in the glossary, **When** a user types a term name, **Then** results filter in real-time to show matching terms
2. **Given** a user searches for a term, **When** no matches exist, **Then** a clear "no results" message is displayed
3. **Given** a user views the glossary, **When** they filter by category (Attaque, Mouvement, etc.), **Then** only terms in that category are shown
4. **Given** a user performs a search, **When** they clear the search field, **Then** the full glossary is restored

---

### User Story 3 - Access Glossary from Treatise (Priority: P2)

A user is reading a treatise and encounters glossary-linked terms. They want to optionally access the full glossary page while reading to see more context about a term.

**Why this priority**: Enhances workflow continuity but can work without it initially. Useful for deep-dive exploration during study sessions.

**Independent Test**: Can be fully tested by clicking a glossary term link within a treatise and being navigated to the glossary page with that term highlighted, delivering seamless cross-content navigation.

**Acceptance Scenarios**:

1. **Given** a user is reading a treatise with glossary links, **When** they click a term link, **Then** they are navigated to the glossary page with that term highlighted or auto-scrolled into view
2. **Given** a user navigates from a treatise to the glossary, **When** they use browser back, **Then** they return to their previous position in the treatise

---

### User Story 4 - View Detailed Term Information (Priority: P2)

A user wants to understand a term deeply, seeing its Italian name, category, complete definitions, translations, and how it relates to fencing practice.

**Why this priority**: Enhances learning experience but secondary to basic browsing and search. Supports deeper engagement once users find a term of interest.

**Independent Test**: Can be fully tested by clicking on any glossary term and verifying that a detail view displays all available information about that term, delivering comprehensive term reference capability.

**Acceptance Scenarios**:

1. **Given** a user clicks on a glossary term, **When** a detail view opens, **Then** it displays the Italian term, category, definitions in all languages, and translations
2. **Given** a term has etymological or contextual notes, **When** viewing the term details, **Then** these notes are displayed if available

---

### Edge Cases

- What happens when glossary data fails to load?
- How does the system handle missing translations or definitions for certain languages?
- What if a term has no category assigned?
- How does the glossary perform when displaying several hundred terms?
- How should the glossary page behave on mobile devices with limited screen space?

## Requirements

### Functional Requirements

- **FR-001**: System MUST load and display all glossary terms from `data/glossary.yaml` on the glossary page
- **FR-002**: System MUST support language selection (Italian, French, English) and display definitions in the selected language
- **FR-003**: System MUST provide a search function that filters glossary terms by name in real-time
- **FR-004**: System MUST provide filtering by term category (e.g., "Attaque", "Mouvement", "Tactique")
- **FR-005**: System MUST display glossary terms with their definitions, translations, and type/category
- **FR-006**: System MUST implement category grouping to organize terms by type for better navigation
- **FR-007**: System MUST provide a dedicated route/URL for the glossary page (e.g., `/glossary`)
- **FR-008**: System MUST handle missing or incomplete glossary data gracefully without crashing
- **FR-009**: System MUST maintain responsive design that works on desktop, tablet, and mobile devices
- **FR-010**: System MUST integrate with the existing search highlighting system to highlight search terms in glossary results
- **FR-011**: System MUST provide clear UI indication of which terms match the current search/filter criteria

### Key Entities

- **Glossary Term**: Represents a single fencing term with Italian name, category, French definition, English definition, French translation, and English translation(s)
  - Key attributes: `term`, `type` (category), `definition` (multilingual), `translation` (multilingual)
  - Relationships: None (standalone data)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can locate any glossary term within 5 seconds using search or category filters
- **SC-002**: 100% of glossary entries from `data/glossary.yaml` are accessible and displayable on the glossary page
- **SC-003**: Glossary page loads and displays content in under 2 seconds on standard broadband connections
- **SC-004**: Users can switch between languages (Italian, French, English) and see immediate updates to definitions
- **SC-005**: All three supported languages have complete definitions for 95%+ of glossary terms
- **SC-006**: Glossary page achieves responsive design with usable interface on mobile devices (320px+ width)
- **SC-007**: Search functionality returns results for partial term matches (e.g., typing "man" finds "Mandritto")
- **SC-008**: Users rate the glossary page as intuitive and useful (if user feedback is collected)

## Assumptions

1. **Glossary Data Structure**: The glossary YAML structure will remain consistent with its current format (term, type, definition, translation)
2. **Language Support**: English glossary may have multiple translator versions; the display will show all available versions
3. **Content Ownership**: All glossary content is already created and maintained in `data/glossary.yaml`
4. **Search Scope**: Glossary search operates only on the glossary page; it does not need to search treatise content
5. **Accessibility**: The glossary page should follow the same accessibility standards as the rest of the platform
6. **No Backend Changes**: The feature uses existing data files and doesn't require new API endpoints or database modifications
7. **Reuse Existing Components**: The page can leverage existing React components like `TextParser`, `SearchBar`, and language switching infrastructure

## Out of Scope

- Modifying the glossary data structure or adding new data fields
- Creating an admin interface to edit glossary terms
- Implementing term usage statistics or popularity metrics
- Exporting glossary to other formats (PDF, spreadsheet, etc.)
- Adding term relationships or cross-references between terms
- Implementing favorites/bookmarking for individual terms

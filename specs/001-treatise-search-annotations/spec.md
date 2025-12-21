# Feature Specification: Treatise Search and Annotation System

**Feature Branch**: `001-treatise-search-annotations`  
**Created**: 2025-12-07  
**Status**: Draft  
**Input**: User description: "Build an application that can help me organize and study my Bolognese treatises. The application allow me to search across multiple treatise for a word or group of word to display only relevant chapters. I can annotate chapters and use those annotation as filter. Word researched may be added to a list to easily used it again. When searching a word similar word should be search to example: mandritto, mandriti or provocation, provoque, provoquer. Treatises are in french italian and english, but I'm french so the application doesn't need to be multilingual. But when I search in one language I want it to also search in other languages. In a second time a local LLM assistant could be interesting."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cross-Treatise Text Search with Classic Options (Priority: P1)

A researcher searches for "mandritto" across all treatises. The system provides classic search options: "Match Case", "Match Whole Word", and "Use Regular Expression". The researcher can toggle these options to refine their search. Based on the input and selected options, the system displays all matching chapters from Italian, French, and English versions. The researcher can immediately see where this technique appears across all available sources.

**Why this priority**: This is the core value proposition - enabling comprehensive cross-treatise research that would be impossible to do manually. Without this, the tool provides no advantage over manual reading.

**Independent Test**: Enter "mandritto" in search field → Toggle "Match Case" on → System displays only chapters containing "mandritto" with exact casing. Toggle "Match Whole Word" on → System displays only chapters where "mandritto" appears as a whole word. Enter "mandr.*" and toggle "Use Regular Expression" → System displays chapters matching the regex pattern.

**Acceptance Scenarios**:

1. **Given** the search field is empty, **When** I type "mandritto" and press Enter, **Then** I see a list of all chapters containing "mandritto" across all treatises in IT/FR/EN
2. **Given** I search for "Mandritto" with "Match Case" enabled, **When** results are displayed, **Then** only chapters containing "Mandritto" (and not "mandritto") are included
3. **Given** I search for "colpo" with "Match Whole Word" enabled, **When** results appear, **Then** chapters containing "colpo" are shown, but "colposo" are excluded
4. **Given** I search for "mandr.*" with "Use Regular Expression" enabled, **When** results appear, **Then** chapters containing "mandritto", "mandritti", etc., are shown
5. **Given** search results are displayed, **When** I click on a chapter, **Then** the full chapter text is displayed with the search term highlighted
6. **Given** no matches are found, **When** the search completes, **Then** I see "No results found"
7. **Given** I have entered a search term and selected options, **When** I press Enter or click Search, **Then** the BolognesePlatform updates to display all matching chapters from all treatises seamlessly

---

### User Story 2 - Chapter Annotations with Tag-Based Filtering (Priority: P2)

A researcher wants to annotate chapters with personal notes and tags (e.g., "Spada sola", "Épée aiguisée", "falso impuntato"). After annotating multiple chapters, they can filter search results to show only chapters with specific tags, enabling focused study of particular aspects (e.g., "show me all spada sola chapters involving falso impuntato").

**Why this priority**: This enables personalized organization and deeper research workflows that complement the search functionality. The smooth PDF-like reading experience in BolognesePlatform makes annotation during research natural and efficient.

**Independent Test**: Search for "mandritto" → BolognesePlatform displays first matching chapter → Annotation panel opens by default → Add annotation with metadata → User can scroll through matching chapters fluently like reading a PDF → Filter next search by annotation tags to see only related chapters.

**Acceptance Scenarios**:

1. **Given** I'm viewing a chapter in BolognesePlatform, **When** the page loads, **Then** the annotation panel opens by default on the right side
2. **Given** I'm viewing a chapter with the annotation panel open, **When** I scroll, **Then** the annotation panel automatically highlights the paragraph at the center of the viewport
3. **Given** I have an annotation panel open, **When** I look at the button, **Then** it is highlighted/active to show the panel is open
4. **Given** I'm viewing a chapter, **When** I click "Add annotation", **Then** I can enter text and assign tags including sword condition (sharp/blunt) and other metadata
5. **Given** a chapter has annotations, **When** I view that chapter, **Then** my annotations are displayed alongside the treatise text
6. **Given** I've performed a search and viewing matching chapters, **When** I select annotation tag filters, **Then** only matching chapters with that tag are shown
7. **Given** I've performed a search and viewing matching chapters, **When** I filter by metadata (e.g., master="Marozzo", book=2), **Then** only chapters from that treatise/book are shown
8. **Given** multiple annotation tags and metadata filters are selected, **When** viewing filtered results, **Then** chapters matching the filters are shown with cumulative AND logic across categories
9. **Given** I've annotated a chapter, **When** I delete the annotation, **Then** it no longer appears and that chapter is excluded from tag-filtered searches
10. **Given** I'm reading through search results in BolognesePlatform, **When** I navigate between chapters (Page Down, scrolling, or chapter buttons), **Then** the transition is smooth and the reading experience matches PDF scrolling fluidity

---

### User Story 3 - Local LLM Assistant for Contextual Research (Priority: P3)

A researcher studying a complex technique wants contextual help. After selecting a chapter, they can ask a local LLM assistant questions like "What are the key differences between this and the previous chapter?" or "Explain the tactical context of this technique." The assistant has access to all treatise content and can provide insights without sending data to external services.

**Why this priority**: This is a future enhancement that requires all previous features (search to find content, annotations as context markers) and introduces significant technical complexity (local LLM integration). Valuable but not essential for core research workflow.

**Independent Test**: View a chapter → Open LLM assistant panel → Ask "Summarize this chapter" → Receive relevant summary based on chapter content. Can work independently but has much more value when combined with search context and user annotations.

**Acceptance Scenarios**:

1. **Given** I'm viewing a chapter, **When** I open the LLM assistant and ask "Summarize this", **Then** I receive a summary based on the chapter content
2. **Given** I have search results displayed, **When** I ask the assistant "Compare these techniques", **Then** the assistant analyzes the visible chapters
3. **Given** chapters have my annotations, **When** I ask the assistant about them, **Then** the assistant incorporates my notes into its responses
4. **Given** I ask a question, **When** the assistant responds, **Then** no data is sent to external services (fully local processing)
5. **Given** the LLM is processing, **When** it takes time to respond, **Then** I see a loading indicator with progress information

---

### Edge Cases

- What happens when a search term appears hundreds of times across treatises? (Pagination, performance, result limiting)
- How does the system handle searching for very short terms (2 letters) or special characters?
- What if a user annotates the same chapter multiple times with different tags?
- What happens if saved searches accumulate to dozens or hundreds of terms? (Organization, search within searches)
- How does the system handle treatises with identical chapter titles but different content?
- What if the local LLM model is not installed or fails to load?
- How are annotations preserved if the treatise YAML files are updated?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST search across all treatise YAML files (Italian, French, English content) simultaneously
- **FR-002**: System MUST provide a "Match Case" option to toggle case-sensitive search
- **FR-003**: System MUST provide a "Match Whole Word" option to search for whole words only
- **FR-003a**: System MUST provide a "Use Regular Expression" option to allow regex-based search queries
- **FR-004**: System MUST update BolognesePlatform to display search results grouped by treatise and chapter with smooth PDF-like navigation
- **FR-004a**: When user enters search term(s) and executes search, SearchBar triggers an update to BolognesePlatform showing matching chapters
- **FR-004b**: BolognesePlatform MUST display multiple matching chapters with smooth scrolling/pagination experience equivalent to reading a PDF
- **FR-005**: System MUST highlight search terms in displayed chapter text
- **FR-009**: Users MUST be able to add annotations (text notes + tags) to any chapter, including sword condition enum (sharp/blunt)
- **FR-010**: System MUST persist annotations across sessions in local storage
- **FR-011**: Users MUST be able to filter search results by annotation tags (weapons, guards, techniques, sword condition)
- **FR-011a**: Users MUST be able to filter search results by treatise metadata (master, work, book, year)
- **FR-012**: System MUST display all annotations for a chapter when viewing that chapter, with annotation panel open by default
- **FR-012a**: Annotation button MUST be highlighted when its panel is open
- **FR-012b**: Annotation panel MUST automatically track and highlight the paragraph at the center of the viewport as user scrolls
- **FR-013**: Users MUST be able to edit or delete existing annotations
- **FR-014**: System MUST integrate a local LLM (model runs on user's machine)
- **FR-015**: LLM assistant MUST have access to treatise content and user annotations for context-aware responses
- **FR-016**: System MUST NOT send any data to external services (privacy constraint)
- **FR-017**: Search results MUST indicate which language version(s) contain matches (IT/FR/EN badges)
- **FR-018**: System MUST support multi-word phrase searches (e.g., "coda longa e alta")
- **FR-019**: Users MUST be able to view a list of all their annotations across all chapters
- **FR-020**: System MUST maintain referential integrity between annotations and treatise chapters by chapter ID
- **FR-021**: System MUST provide a configuration menu allowing users to define which annotation fields to display under chapter titles
- **FR-022**: System MUST handle import script file conflicts by prompting user to replace, rename, or cancel when output file already exists
- **FR-023**: User interface messaging and controls MUST be provided in French

### Key Entities *(include if feature involves data)*

- **SearchQuery**: The text entered by user, timestamp, search options (match case, whole word, regex)
- **SearchResult**: Reference to chapter (treatise file + chapter ID), match count, language(s) with matches, preview snippet
- **Annotation**: Chapter reference (treatise + chapter ID), annotation text, list of tags, sword condition (sharp/blunt enum), creation date, last modified date
- **Tag**: Tag name, usage count (how many annotations use it), color/category
- **AnnotationDisplay**: Configuration for which annotation fields are visible under chapter titles (note, weapons, guards, techniques, sword condition, etc.)
- **ChapterMetadata**: Treatise metadata fields extracted from YAML (master, work, book, year) used for metadata-based filtering
- **MetadataFilter**: User-selected metadata filters (e.g., master="Marozzo", book=2, year=1536) applied to search results
- **ChapterReference**: Treatise filename, chapter ID within treatise, combined with metadata to link annotations and filter results
- **LLMConversation**: Session history for LLM interactions, context (current chapter, search results, annotations visible)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find all instances of a technique term across 3 treatises (multiple chapters each) in under 5 seconds
- **SC-002**: Search respects "Match Case", "Match Whole Word", and "Regular Expression" settings correctly
- **SC-003**: BolognesePlatform displays first matching chapter within 1 second of search execution
- **SC-004**: Annotations persist across sessions without data loss (100% reliability for local storage)
- **SC-005**: Users can filter 50+ search results by annotation tags in under 3 seconds
- **SC-005a**: Smooth chapter-to-chapter navigation in BolognesePlatform between search results matches PDF reading fluidity (no stuttering/lag)
- **SC-006**: LLM assistant responds to contextual questions within 10 seconds on typical hardware (local execution)
- **SC-007**: System supports at least 500 annotations without performance degradation
- **SC-009**: Users can annotate a chapter and apply 3 tags (including sword condition) in under 30 seconds
- **SC-012**: Annotation panel tracks viewport center with <100ms latency as user scrolls

## Assumptions

- Treatise YAML files continue to follow existing schema (id, title, metadata, content.it/fr/en_versions)
- Glossary YAML provides term equivalents across languages for reference
- Application remains local-only; no backend server required
- Users have sufficient disk space for local LLM model (typically 3-7 GB)
- Browser local storage is sufficient for annotations and saved searches (reasonable limits: <1000 entries)
- Performance is acceptable with current treatise corpus size (<100 chapters across all treatises)
- Interface and tooltips default to French, matching the researcher's native language preference

## Configuration & Settings

### Annotation Display Configuration

Users can configure which annotation fields appear as metadata under chapter titles. Available fields include:
- Weapons (comma-separated list)
- Guards mentioned
- Techniques
- Sword condition (sharp/blunt)
- Measures
- Strategy

**Default display**: Weapons + Sword condition (if set)

Configuration menu accessible from settings panel. Changes apply immediately across all chapters.

### Import Script File Conflict Handling

When running the import/extraction script and output file already exists, the system MUST prompt user with three options:

1. **Replace** - Overwrite existing file with new content (original file is backed up as `.bak`)
2. **Rename** - Save with incremented filename (e.g., `filename_1.yaml`, `filename_2.yaml`)
3. **Cancel** - Abort import without saving

This applies to all import operations including `extract-book.py` and similar data import scripts.

## Out of Scope

- User authentication or multi-user support (single-user local application)
- Cloud synchronization of annotations or saved searches
- Export of annotations to external formats (PDF, Word, etc.)
- Advanced NLP or linguistic analysis
- Real-time collaborative annotation with other researchers
- Mobile app version (desktop web application only)
- Integration with external reference management tools (Zotero, Mendeley)
- Automatic translation of treatise content
- Speech-to-text for search queries or annotations
- Advanced LLM fine-tuning on treatise corpus (use pre-trained models)

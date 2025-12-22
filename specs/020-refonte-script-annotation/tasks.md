# Tasks: YAML Annotation Script

## Phase 1: Script Implementation
- [x] Create `scripts/yaml-annotate.py` skeleton with `argparse` and `ruamel.yaml` setup <!-- id: 0 -->
- [x] Implement YAML loading with round-trip preservation configuration (matching `extract_book.py`) <!-- id: 1 -->
- [x] Implement glossary loading logic (read `data/glossary.yaml` and build term mapping) <!-- id: 8 -->
- [x] Implement text enrichment logic (replace terms with `{key}`, handling longest match and avoiding double-linking) <!-- id: 9 -->
- [x] Implement logic to iterate sections, inject missing `annotation` fields, and apply text enrichment <!-- id: 2 -->
- [x] Implement ID generation strategy (`{section_id}_ann`) <!-- id: 3 -->
- [x] Implement file saving with formatting preservation <!-- id: 4 -->

## Phase 2: Cleanup & Documentation
- [x] Delete obsolete `scripts/extract-first-line.js` <!-- id: 5 -->
- [x] Verify script on a test YAML file <!-- id: 6 -->
- [x] Update project documentation (README or similar) to reference the new tool <!-- id: 7 -->

# Feature Specification: YAML Annotation Script

## Summary
Create a Python script `yaml-annotate.py` to automate the addition of `annotation` fields to treatise YAML files. This script replaces the existing `extract-first-line.js` (which appears to be obsolete or repurposed) and focuses on scaffolding annotation data structures in the content files to facilitate manual enrichment.

## Context
The project stores treatise content in YAML files. We are introducing a structured `annotation` field for each section to track martial techniques, guards, measures, etc. Currently, adding these fields manually is tedious and error-prone. We need a tool to iterate over existing YAML files and inject the correct `annotation` schema where missing.

## Requirements

### Functional
1.  **Input**: The script must accept a path to a YAML file (e.g., `data/treatises/marozzo.yaml`).
2.  **Processing**:
    *   **Load Glossary**: Read `data/glossary.yaml` to build a mapping of terms to keys.
    *   **Parse Treatise**: Iterate through each treatise section.
    *   **Inject Annotations**: Check if the `annotation` field exists. If missing, add it with default values.
    *   **Enrich Content**: Scan the text content (`it`, `fr`, `en_versions`) and replace occurrences of glossary terms (e.g., "coda longa e stretta") with their linked format (e.g., `{coda_longa_stretta}`).
        *   *Constraint*: This must be dynamic based on the glossary file.
        *   *Constraint*: Handle multi-word terms correctly (longest match first).
3.  **Output**: Save the modified YAML file, preserving existing content and formatting.
4.  **Schema**: The `annotation` field must match the structure defined in `src/lib/annotation.ts`.
5.  **CLI**: The script should be a CLI tool runnable via `uv`.

### Technical
*   Language: Python 3.13+
*   Dependencies: `ruamel.yaml`
*   Location: `scripts/yaml-annotate.py`
*   Removal: Delete `scripts/extract-first-line.js`.

## Data Model
The `Annotation` structure to be injected:
```yaml
annotation:
  id: "section_id_annotation"
  note: null
  weapons: []
  weapon_type: null
  guards_mentioned: []
  techniques: []
  measures: []
  strategy: []
```

## Open Questions
1.  **Term Overlap**: How to handle terms that are substrings of others (e.g., "coda longa" vs "coda longa e stretta")? -> *Decision: Sort glossary terms by length (descending) before replacement.*
2.  **Already Linked**: How to avoid double-linking (e.g., `{coda_longa}`) -> *Decision: Use regex that ignores already bracketed terms.*


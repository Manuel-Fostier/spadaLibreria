# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a Python script `scripts/yaml_annotate.py` to automate the addition of structured `annotation` fields to treatise YAML files and enrich text content by automatically linking glossary terms. This script replaces the obsolete `scripts/extract-first-line.js`. It ensures that all sections in a treatise have the necessary schema for manual enrichment and that known martial terms are consistently linked to the glossary.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: `ruamel.yaml` (consistent with `extract_book.py`).
**Storage**: YAML files in `data/treatises/` and `data/glossary.yaml`.
**Testing**: `pytest`.
**Target Platform**: Local CLI.
**Project Type**: Tooling / Script.
**Performance Goals**: N/A (offline script).
**Constraints**: Must preserve existing YAML formatting (literal blocks `|`, comments, key order) to comply with Constitution. Must handle multi-word glossary terms correctly (longest match first).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Content Fidelity**: The script modifies `data/` files. It MUST preserve the literal block format (`|`) for text content. Standard `pyyaml` often fails this. We must use `ruamel.yaml`.
- [x] **Tooling**: Will use `uv` for dependency management (`uv add ruamel.yaml`).
- [x] **Local-Only**: Script runs locally.
- [x] **Quality**: Will include error handling and validation.

## Project Structure

### Documentation (this feature)

```text
specs/020-refonte-script-annotation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for script, but maybe schema definition)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
scripts/
└── yaml_annotate.py     # The new script

# To be deleted:
scripts/extract-first-line.js
```

**Structure Decision**: Single script file in `scripts/` directory, replacing an existing one.


## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

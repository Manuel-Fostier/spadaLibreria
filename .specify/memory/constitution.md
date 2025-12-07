# Spada Libreria Constitution

<!--
Sync Impact Report
- Version change: template → 1.0.0
- Modified principles: all defined from template
- Added sections: Core Principles, Additional Constraints, Workflow & Contributions, Governance
- Removed sections: none
- Templates requiring updates: plan-template.md ✅; spec-template.md ⚠ pending review; tasks-template.md ⚠ pending review
- Follow-up TODOs: TODO(RATIFICATION_DATE)
-->

## Core Principles

### I. Content Fidelity & Separation
All treatise and glossary content lives in YAML under `data/`; no hardcoded text in TS/React. Preserve multilingual content (IT/FR/EN), IDs normalized (lowercase, underscores), literal blocks and bullet formatting maintained; no schema drift beyond defined fields.

### II. Local-Only & Privacy
The app runs locally only; no external services, trackers, or PII handling. All assets and PDFs are local; network calls are limited to local filesystem access.

### III. Beginner-Friendly, Reproducible Tooling
Favor clarity over cleverness. Use `npm` for JS/TS and `uv` for Python. Add Python deps with `uv add` only; add Node deps with `npm install`. Provide runnable commands in docs; avoid hidden steps.

### IV. Quality & Data Integrity
No failing builds or lints. Preserve paragraph and bullet integrity, glossary `{term}` links, and literal YAML formatting. Respect server/client boundaries (no `fs` in client components); keep interactive glossary/tooltips functional.

### V. Accessibility & Clear UX
Maintain readable typography, sufficient contrast, and keyboard-friendly interactions. Glossary tooltips must remain usable and non-intrusive; avoid surprising UX changes.

## Additional Constraints

- Architecture: Next.js App Router; server-side data loading with `fs` and `js-yaml`; client components must not import server-only modules. Use absolute imports via `@/`.
- Data formats: Glossary and treatise YAML schemas are authoritative; use literal block scalars for multiline content. Avoid adding fields outside the schema and keep IDs normalized.
- Safety: Local-only usage; no deployment targets; avoid external API calls or telemetry.
- Tooling: `npm run dev/build/lint`; `uv sync` and `uv run extract-book …` for Python scripts; keep `uv.lock` updated via `uv` commands.

## Development Workflow & Contributions

- Work on feature branches; keep PRs small with clear descriptions and note tests run.
- Update README and `.github/copilot-instructions.md` when commands or behavior change.
- Follow existing naming (e.g., `extract-book`) and keep `data/` as the single content source.
- When adding tests, prefer Jest + RTL for JS/TS and pytest for Python.
- Do not break glossary linking (`{term}`) or multiline formatting when editing treatise content.

## Governance

- This constitution supersedes other practices for scope, data handling, and tooling rules. Reviews must check compliance with Core Principles, Additional Constraints, and Workflow guidance.
- Amendments: document rationale and impacts; update dependent templates; bump constitution version using semantic versioning (MAJOR for incompatible principle changes, MINOR for new/expanded guidance, PATCH for clarifications).
- Compliance: Plans/specs/tasks must include a Constitution Check reflecting these principles; PRs should state any deviations and mitigations.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-07

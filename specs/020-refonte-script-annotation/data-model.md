# Data Model: Annotation

## Overview
The `annotation` field is an optional object attached to each `TreatiseSection` in the YAML files. It captures martial analysis data.

## Schema

```yaml
annotation:
  id: string              # Unique ID, derived as `{section_id}_ann`
  note: string | null     # Free text note (Markdown allowed)
  weapons:                # List of weapons used
    - string              # Enum: spada_sola, spada_brocchiero, etc.
  weapon_type:            # Type of weapon
    string | null         # Enum: Epée aiguisée, Epée émoussée
  guards_mentioned:       # List of guards mentioned
    - string              # Enum: coda_longa, porta_di_ferro, etc.
  techniques:             # List of techniques
    - string              # Free text or glossary keys
  measures:               # List of measures
    - string              # Enum: Gioco Largo, Gioco Stretto, etc.
  strategy:               # List of strategic concepts
    - string              # Enum: patient attentiste, provocation, etc.
```

## Validation Rules
*   `id` is mandatory.
*   Enums must match values defined in `src/lib/annotation.ts`.
*   `null` is used for missing/unknown values, not empty strings.
*   Lists should be empty `[]` if no values apply.

## Source of Truth
*   `src/lib/annotation.ts` defines the TypeScript interface and Enum constants.
*   `data/treatises/*.yaml` stores the instances.

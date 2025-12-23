# Research: YAML Annotation Script

## Decision: Use `ruamel.yaml`
We will use `ruamel.yaml` for reading and writing YAML files.

### Rationale
*   **Preservation**: It is the only Python library that reliably preserves comments, literal block scalars (`|`), and key order during round-trip editing. This is a strict requirement of the Constitution ("literal blocks and bullet formatting maintained").
*   **Ecosystem**: It is a standard tool in the Python ecosystem for this purpose.

### Alternatives Considered
*   **`pyyaml`**: Standard library, but does not preserve comments or block styles by default. Requires complex custom constructors/representers to achieve partial preservation.
*   **Manual parsing**: Too error-prone and complex to maintain.

## Decision: Annotation ID Strategy
We will derive the annotation ID from the section ID by appending `_ann`.

### Rationale
*   **Uniqueness**: Guaranteed if section IDs are unique.
*   **Simplicity**: Deterministic and easy to generate.
*   **Traceability**: Easy to link back to the section.

## Code Example (Prototype)

```python
from ruamel.yaml import YAML
from ruamel.yaml.scalarstring import PreservedScalarString

def add_annotation(file_path):
    yaml = YAML()
    yaml.preserve_quotes = True
    yaml.indent(mapping=2, sequence=2, offset=2)
    yaml.width = 4096

    with open(file_path, 'r', encoding='utf-8') as f:
        data = yaml.load(f)

    for section in data:
        if 'annotation' not in section:
            section_id = section.get('id', 'unknown')
            section['annotation'] = {
                'id': f"{section_id}_ann",
                'note': None,
                'weapons': [],
                'weapon_type': None,
                'guards_mentioned': [],
                'techniques': [],
                'measures': [],
                'strategy': []
            }

    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f)
```

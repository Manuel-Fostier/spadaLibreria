# Quickstart: YAML Annotation Script

## Prerequisites
*   Python 3.13+
*   `uv` package manager

## Installation
1.  Sync dependencies:
    ```bash
    uv sync
    ```

## Usage
Run the script on a treatise YAML file:

```bash
uv run scripts/yaml_annotate.py data/treatises/marozzo_book2.yaml
```

## Behavior
*   The script reads the specified YAML file.
*   It iterates through all sections.
*   If a section lacks an `annotation` field, it adds one with default empty values and a generated ID (`{section_id}_ann`).
*   It saves the file in-place, preserving formatting.
*   It prints a summary of changes (e.g., "Added annotations to 5 sections").

## Troubleshooting
*   **Encoding Errors**: Ensure the YAML file is UTF-8.
*   **Formatting Issues**: If the output looks wrong, check if `ruamel.yaml` is installed correctly.

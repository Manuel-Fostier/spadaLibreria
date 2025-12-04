# Copilot Instructions for Spada Libreria

## Project Overview

Spada Libreria is a platform for studying Bolognese fencing treatises. The application displays historical fencing texts in Italian, French, and English with interactive glossary tooltips.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Format**: YAML files for content (glossary and treatises)
- **Package Manager**: npm (for Node.js), uv (for Python)
- **Python**: 3.13+ (for data extraction scripts)

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components (Term, TextParser, BolognesePlatform, etc.)
├── contexts/      # React contexts for state management
└── lib/           # Utilities and data loading functions
data/
├── glossary.yaml  # Glossary terms with FR/EN definitions
└── treatises/     # YAML files containing treatise sections
scripts/
└── extract_marozzo.py  # Python script for extracting text from PDFs
```

## Key Architecture Principles

1. **Content/Code Separation**: All content (treatises, glossary) is stored in YAML files in the `data/` directory. Never hardcode content in TypeScript/React files.

2. **Glossary Terms**: Terms in treatise text are marked with `{term_name}` syntax and are automatically linked to glossary entries.

3. **Multi-language Support**: The application supports Italian (original), French, and English translations. English supports multiple translator versions.

## Commands

### Node.js / Next.js
```bash
npm install    # Install dependencies
npm run dev    # Start development server at http://localhost:3000
npm run build  # Build for production
npm run lint   # Run ESLint
```

### Python Scripts
```bash
uv sync                    # Synchronize Python dependencies
uv add <package>           # Add a new Python dependency
uv run extract-marozzo     # Run the extraction script
```

## Code Style Guidelines

### TypeScript / React
- Use TypeScript with proper type definitions
- Use `'use client'` directive for client-side components
- Use Tailwind CSS for styling (no CSS modules)
- Follow React functional component patterns with hooks
- Use absolute imports with `@/` prefix (e.g., `@/lib/dataLoader`)

### Python
- Use Python 3.13+ features
- Follow PEP 8 style guide
- Use type hints where appropriate
- Use `argparse` for command-line scripts (not `input()`)

## Dependency Management

### **CRITICAL RULE**: When adding a Python dependency:

1. **NEVER** manually edit `pyproject.toml` dependencies
2. **ALWAYS** use: `uv add <package-name>`
3. This ensures proper dependency resolution and lockfile updates

Example:
```bash
# ✅ Correct
uv add pyyaml

# ❌ Wrong
# Manually editing pyproject.toml
```

### Node.js Dependencies
Use standard npm commands:
```bash
npm install <package>
```

## Data File Formats

### Glossary Entry (`data/glossary.yaml`)

```yaml
term_key:
  term: Display Term
  type: Category
  definition:
    fr: French definition
    en: English definition
  translation:
    fr: French translation
    en: English translation
```

### Treatise Section (`data/treatises/*.yaml`)

```yaml
- id: unique_section_id
  title: Section Title
  metadata:
    master: master_name
    work: Work Name
    book: 1
    chapter: 1
    year: 1536
  content:
    it: Italian original text with {glossary_terms}
    fr: French translation with {glossary_terms}
    en_versions:
      - translator: "Translator Name"
        text: English translation with {glossary_terms}
```

**Note**: The `annotation` field should NOT be included in generated YAML files from extraction scripts.

## Python Scripts Guidelines

### Extract Marozzo Script

The `extract_marozzo.py` script extracts text from PDF treatises and should:

1. Use `argparse` for command-line arguments
2. Accept `--pdf` and `--pages` arguments
3. Generate YAML files in the format described above
4. Save to `data/treatises/{author}_{book}.yaml`
5. NOT include `annotation` fields in output

Example usage:
```bash
uv run extract-marozzo --pdf "Achille Marozzo - opéra nova.pdf" --pages "34-102"
```

## Testing

No test framework is currently set up. When adding tests, prefer using Jest with React Testing Library for JavaScript/TypeScript, and pytest for Python.

## Important Notes

- The project is primarily in French (documentation, comments)
- API routes are in `src/app/api/` and use Next.js App Router conventions
- Data loading uses server-side functions with `fs` and `js-yaml`
- Client components must not import server-side modules like `fs`
- Python environment is managed by `uv`, not pip or conda directly

- **Audience**: This is a learning project for beginners in web technologies (transitioning from C/systems programming)
- **Deployment**: This is a local-only application. It will never be deployed online. All development and usage is on the developer's machine

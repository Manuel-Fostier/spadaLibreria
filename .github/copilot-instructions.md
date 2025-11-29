# Copilot Instructions for Spada Libreria

## Project Overview

Spada Libreria is a platform for studying Bolognese fencing treatises. The application displays historical fencing texts in Italian, French, and English with interactive glossary tooltips.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Format**: YAML files for content (glossary and treatises)
- **Package Manager**: npm

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
```

## Key Architecture Principles

1. **Content/Code Separation**: All content (treatises, glossary) is stored in YAML files in the `data/` directory. Never hardcode content in TypeScript/React files.

2. **Glossary Terms**: Terms in treatise text are marked with `{term_name}` syntax and are automatically linked to glossary entries.

3. **Multi-language Support**: The application supports Italian (original), French, and English translations. English supports multiple translator versions.

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server at http://localhost:3000
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Code Style Guidelines

- Use TypeScript with proper type definitions
- Use `'use client'` directive for client-side components
- Use Tailwind CSS for styling (no CSS modules)
- Follow React functional component patterns with hooks
- Use absolute imports with `@/` prefix (e.g., `@/lib/dataLoader`)

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

## Testing

No test framework is currently set up. When adding tests, prefer using Jest with React Testing Library.

## Important Notes

- The project is primarily in French (documentation, comments)
- API routes are in `src/app/api/` and use Next.js App Router conventions
- Data loading uses server-side functions with `fs` and `js-yaml`
- Client components must not import server-side modules like `fs`

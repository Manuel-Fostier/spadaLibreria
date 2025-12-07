# Codebase Analysis: Existing Infrastructure

**Date**: 2025-12-07  
**Feature**: Treatise Search and Annotation System  
**Status**: Phase 0 - Research complete, Plan updated with findings

## Analysis Summary

Performed comprehensive analysis of existing codebase to ensure plan coherence with implemented features.

## Key Findings

### 1. Annotation System (MATURE - Already Implemented)

**Components**:
- `AnnotationContext.tsx` - State management with localStorage merge + server sync
- `AnnotationPanel.tsx` - Full UI with tabs (armes, gardes, techniques)
- `AnnotationBadge.tsx` - Section annotation buttons
- `MeasureProgressBar.tsx` - Visual measure progression

**API Routes**:
- `POST /api/annotations` - Saves to YAML files in `data/treatises/`
- `GET /api/annotations` - Loads annotations from YAML files

**Data Model** (from `src/lib/annotation.ts`):
```typescript
export interface Annotation {
  id: string;
  note: string | null;
  weapons: Weapon[] | null;           // spada_sola, spada_brocchiero, etc.
  guards_mentioned: Guard[] | null;   // coda_longa, porta_di_ferro, etc.
  techniques: string[] | null;        // Free-form technique names
  measures: Measure[] | null;         // Gioco Largo → Presa
  strategy: Strategy[] | null;        // patient attentiste, provocation, etc.
}
```

**Key Insight**: The existing `weapons`, `guards_mentioned`, and `techniques` fields serve the exact purpose the spec called "tags" for filtering. No need for new tag system.

### 2. Storage Architecture

**Current Pattern**:
- Content (treatises, glossary) → YAML files in `data/`
- Annotations → YAML files (embedded in treatise sections)
- User preferences → localStorage (temporary, merged with YAML on load)

**Plan Adjustment**: 
- Saved searches → localStorage (user preference, not content) ✅
- Annotation filtering → Use existing YAML-persisted metadata ✅

### 3. Existing UI Components

**BolognesePlatform.tsx**:
- Main viewer with 3-column layout (IT/FR/EN)
- Weapon filtering already implemented (dropdown)
- Sidebar navigation with collapsible sections
- Already integrates AnnotationPanel

**TextParser.tsx**:
- Parses `{term}` syntax
- Creates Term components with glossary tooltips
- Can be extended for search highlighting

**Existing Contexts**:
- AnnotationContext (robust, handles server sync)
- No SearchContext yet (new addition)
- No LLMContext yet (new addition for P4)

### 4. GitHub Issues Alignment

**Open Issues Directly Addressed**:
- **Issue #1**: Refonte du Panneau de Filtres (Gauche)
  - Requires: Search field with tag accumulation, weapons dropdown, authors dropdown
  - Plan P1: SearchBar + SavedSearchList components in left sidebar
  - Status: Will be CLOSED by P1 implementation

- **Issue #21**: Surbrillance des mots recherchés dans le filtre
  - Requires: Highlight search terms in displayed text
  - Plan P1: SearchResults component with highlighting via custom highlighter
  - Status: Will be CLOSED by P1 implementation

**Related Open Issues**:
- **Issue #17**: Améliorer visibilité bouton annotation actif
  - Orthogonal but affects UX consistency
  - Recommendation: Address alongside P1 for consistent experience

- **Issue #7**: Module Statistiques
  - Complementary feature (top 5 guards/techniques)
  - Can leverage search index for performance
  - Out of scope for this feature (separate implementation)

**Closed Issues (Context)**:
- Issue #5: AnnotationPanel refonte (confirms tabs, auto-save)
- Issue #15: MeasureProgressBar (confirms component exists)
- Issue #19: Python YAML extraction script (confirms script infrastructure)

### 5. Constitution Compliance Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Content in `data/` YAML | ✅ PASS | Annotations persist to YAML via API |
| Local-only | ✅ PASS | LLM via LM Studio/Ollama local APIs |
| Beginner-friendly tools | ✅ PASS | npm (JS), uv (Python) |
| Quality/format | ✅ PASS | Preserves `{term}` glossary links |
| Accessibility | ✅ PASS | Keyboard-friendly UI, semantic HTML |

**Clarification**: Original plan said "annotations in localStorage" but existing system uses YAML persistence. This ALIGNS with constitution (YAML = authoritative source). Plan updated.

## Plan Adjustments Made

1. **Annotation "Tags"**: Use existing `weapons`, `guards_mentioned`, `techniques` fields instead of creating new tag system
2. **Storage**: Clarified that annotations follow existing YAML pattern; only saved searches in localStorage
3. **Components**: Updated to reflect existing AnnotationPanel, AnnotationBadge, MeasureProgressBar
4. **Integration**: Search integrates into existing BolognesePlatform sidebar, not separate page
5. **API Routes**: Documented existing `/api/annotations` and `/api/glossary` routes
6. **Contracts**: Updated to extend existing Annotation interface, not replace it

## Architecture Validation

**Existing Pattern** (validated as correct):
```
YAML Files (data/)
    ↓ (server-side load)
dataLoader.ts (fs + js-yaml)
    ↓
AnnotationProvider (context)
    ↓
BolognesePlatform + AnnotationPanel (client components)
    ↓
User interactions → POST /api/annotations → Save to YAML
```

**New Search Pattern** (will integrate):
```
YAML Files (data/)
    ↓
SearchContext builds index on load
    ↓
SearchBar (user input) → SearchEngine (variants + cross-lang)
    ↓
SearchResults (highlighting) + TagFilter (annotation metadata)
    ↓
SavedSearches → localStorage (preferences only)
```

## Conclusion

✅ **Plan is coherent with existing project**  
✅ **No architectural conflicts**  
✅ **Leverages existing annotation infrastructure**  
✅ **Addresses open GitHub issues #1 and #21**  
✅ **Follows constitution principles**

**Next Steps**:
- Phase 1: Generate data-model.md, contracts/, quickstart.md
- Phase 2: Generate tasks.md via `/speckit.tasks`
- Implementation: Start with P1 (search MVP)

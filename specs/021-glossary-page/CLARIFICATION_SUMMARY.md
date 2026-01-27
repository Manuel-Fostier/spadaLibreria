# Clarification Session Summary - Glossary Page Feature (021)

**Date**: January 27, 2026  
**Status**: ✅ Complete - All clarifications resolved  
**Specification**: [spec.md](spec.md)

## Clarifications Completed

### 1. ✅ Category Filtering Model
- **Initial Question**: How should category filtering work?
- **Answer**: No filtering/collapsing - all terms always displayed
- **Impact**: Simplified UI - categories are visual organization only

### 2. ✅ Term Display Format
- **Initial Question**: Should definitions show inline or in detail view?
- **Custom Answer**: Hierarchical flat display (Category → Type → Term with all content visible)
- **Impact**: Clean, always-visible structure respecting data hierarchy

### 3. ✅ Search Scope
- **Initial Question**: Search by name only or include definitions?
- **Answer**: Search term names, categories, AND definitions
- **Impact**: Comprehensive search across all glossary content

### 4. ✅ Treatise Integration Timeline
- **Initial Question**: Should treatise-glossary linking be in Phase 1?
- **Answer**: Three-phase rollout:
  - **Phase 1 (This)**: Standalone glossary page (MVP)
  - **Phase 2**: Simple links from treatises to glossary
  - **Phase 3**: URL hash navigation (#term_id)
- **Impact**: Smaller MVP scope, faster initial delivery

### 5. ✅ Search Behavior Model
- **Initial Question**: Expand/collapse categories or always visible?
- **Custom Answer**: Browser-like Find behavior - highlights inline without hiding
- **Impact**: Familiar user interaction, no collapsing UI complexity

## Data Model Blocker - ASSIGNED

**Issue**: Categories exist only as YAML comments, not structured data fields

**Status**: 🔄 **TOP PRIORITY REFACTORING ASSIGNED**

**Resolution**: Add explicit `category` field to all terms in `data/glossary.yaml`

**Refactoring Scope**:
- Extract from 8 category sections:
  1. Coups et Techniques
  2. Les Guardes
  3. Coups et Techniques Additionnels
  4. Concepts Tactiques
  5. Actions et Mouvements Additionnels
  6. Armes et Équipement
  7. Termes Techniques Additionnels
  8. Les Cibles

**Blocker Status**: ⏳ Implementation waits for refactoring to merge

## Specification Status

| Section | Status | Notes |
|---------|--------|-------|
| User Stories | ✅ Complete | 4 stories (2 P1, 2 P2) |
| Functional Requirements | ✅ Complete | 11 requirements |
| Success Criteria | ✅ Complete | 8 measurable outcomes |
| Edge Cases | ✅ Complete | 7 identified scenarios |
| Technical Dependencies | ✅ Documented | Glossary refactoring blocking |
| Clarifications | ✅ Recorded | All 5 clarifications documented |

## Design Decisions Summary

✅ **Always-visible content** - No collapsing/expanding  
✅ **Browser-like search** - Highlights inline, no hiding  
✅ **Flat visual hierarchy** - Category → Type → Term sections  
✅ **Comprehensive search** - Names, categories, definitions  
✅ **Phased delivery** - MVP first, integration later  

## Next Steps

1. ⏳ **Glossary refactoring** (Top Priority) - Add category field to all terms
2. ✓ Once refactoring merged → Run `/speckit.plan` to generate implementation plan
3. ✓ Then → Development of glossary page feature begins

## Ready for Planning?

**Not yet** - Data model refactoring must complete and merge first  
**Then** - Specification is fully ready for implementation planning

---

*Branch: `021-glossary-page` | Created: 2026-01-27*

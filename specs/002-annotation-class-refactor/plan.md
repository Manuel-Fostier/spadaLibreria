# Implementation Plan: Annotation Class Refactoring

**Feature**: Annotation Class Refactoring  
**Branch**: `001-annotation-class-refactor`  
**Created**: January 4, 2026  
**Based on**: [spec.md](./spec.md)

## Architecture Overview

### Class Hierarchy

```
Annotation (abstract)
├── Weapons
├── WeaponType
├── Guards
├── Techniques
├── Measures
├── Strategy
├── Strikes
├── Targets
└── Note
```

### Key Design Decisions

1. **Style Objects**: Use `chipStyle` and `textStyle` (CSSProperties objects) instead of individual color fields
2. **Color Consistency**: `setStyle(colorValue)` method updates both text and chip colors atomically
3. **Registry Pattern**: Centralized AnnotationRegistry for accessing annotation instances
4. **Backward Compatibility**: Maintain existing localStorage format via AnnotationDisplayContext

## Tech Stack

- **Language**: TypeScript (strict mode)
- **React**: 18+ (hooks, Context API)
- **Styling**: Inline React.CSSProperties (no CSS classes)
- **State Management**: React Context (AnnotationDisplayContext)

## File Structure

```
src/
├── lib/
│   ├── annotation/
│   │   ├── Annotation.ts           (abstract base class)
│   │   ├── Weapons.ts
│   │   ├── WeaponType.ts
│   │   ├── Guards.ts
│   │   ├── Techniques.ts
│   │   ├── Measures.ts
│   │   ├── Strategy.ts
│   │   ├── Strikes.ts
│   │   ├── Targets.ts
│   │   ├── Note.ts
│   │   ├── AnnotationRegistry.ts    (factory/registry)
│   │   └── index.ts                 (exports)
│   └── (existing files remain)
├── contexts/
│   └── AnnotationDisplayContext.tsx (refactored to use classes)
├── components/
│   ├── ColorPicker.tsx              (updated to use setStyle)
│   ├── AnnotationDisplaySettings.tsx (refactored)
│   ├── AnnotationPanel.tsx          (refactored)
│   ├── Term.tsx                     (refactored)
│   └── (other components unchanged)
└── types/
    └── (existing types)
```

## Implementation Phases

### Phase 1: Core Classes (Setup & Tests)
- [x] Create abstract Annotation base class
- [x] Create concrete annotation classes (9 types)
- [x] Create AnnotationRegistry
- [x] Unit tests for each annotation class

### Phase 2: Integration (Core)
- [ ] Refactor AnnotationDisplayContext to use registry
- [ ] Update ColorPicker to call setStyle()
- [ ] Update AnnotationDisplaySettings to use classes
- [ ] Integration tests for context + components

### Phase 3: Component Updates (Polish)
- [ ] Update AnnotationPanel to use class methods
- [ ] Update Term component to use class methods
- [ ] Update termTypeMapping if needed
- [ ] Verify all color synchronization

### Phase 4: Validation
- [ ] Run all tests
- [ ] Manual testing in app
- [ ] Verify backward compatibility
- [ ] Performance check

## Dependencies

### Internal
- Existing `AnnotationDisplayContext`
- Existing color system and utilities
- React Context API

### External
- TypeScript 5.x
- React 18.x

## Success Metrics

- [x] All annotation classes created with proper TypeScript typing
- [ ] All tests passing (unit + integration)
- [ ] Color changes synchronized across all components
- [ ] No TypeScript errors or warnings
- [ ] App functions identically to current implementation
- [ ] Code coverage > 80% for annotation classes

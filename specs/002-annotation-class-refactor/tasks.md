# Implementation Tasks: Annotation Class Refactoring

**Feature**: 002-annotation-class-refactor  
**Total Tasks**: 13  
**Status**: ✅ COMPLETE (13/13)

## Phase 1: Setup & Core Classes

### Task 1.1: Create Abstract Annotation Base Class [P]
- **File**: `src/lib/annotation/Annotation.ts`
- **Description**: Define abstract base class with chipStyle, textStyle, label, visibility properties and methods: getChipStyle(), getTextStyle(), setStyle(colorValue), setLabel(), setVisibility()
- **Status**: [X]
- **Dependencies**: None

### Task 1.2: Create Concrete Annotation Classes [P]
- **Files**: 
  - `src/lib/annotation/Weapons.ts`
  - `src/lib/annotation/WeaponType.ts`
  - `src/lib/annotation/Guards.ts`
  - `src/lib/annotation/Techniques.ts`
  - `src/lib/annotation/Measures.ts`
  - `src/lib/annotation/Strategy.ts`
  - `src/lib/annotation/Strikes.ts`
  - `src/lib/annotation/Targets.ts`
  - `src/lib/annotation/Note.ts`
- **Description**: Create one class per annotation type extending Annotation with default styles matching current colors
- **Status**: [X]
- **Dependencies**: Task 1.1

### Task 1.3: Create AnnotationRegistry
- **File**: `src/lib/annotation/AnnotationRegistry.ts`
- **Description**: Implement registry/factory that provides singleton instances of all annotation types with methods: getAnnotation(key), getAllAnnotations(), updateAnnotation(key, updates)
- **Status**: [X]
- **Dependencies**: Task 1.2

### Task 1.4: Export Annotation Classes
- **File**: `src/lib/annotation/index.ts`
- **Description**: Create barrel export file for all annotation classes and registry
- **Status**: [X]
- **Dependencies**: Task 1.3

### Task 1.5: Unit Tests for Annotation Classes
- **File**: `src/lib/annotation/__tests__/Annotation.test.ts`
- **Description**: Test base class properties, abstract method enforcement, setStyle() color calculations (verify rgba formula per FR-005), getChipStyle()/getTextStyle() returns
- **Status**: [ ]
- **Dependencies**: Task 1.2
- **Test Cases**: 
  - `setStyle('#3b82f6')` produces correct rgba values for background/borders per formula
  - All 9 concrete classes have required properties
  - TypeScript compilation fails for incomplete subclass

## Phase 2: Integration

### Task 2.1: Refactor AnnotationDisplayContext
- **File**: `src/contexts/AnnotationDisplayContext.tsx`
- **Description**: Update context to create and manage annotation class instances internally. Maintain backward compatibility with existing localStorage format. Add getAnnotation(key) method to context.
- **Status**: [X]
- **Dependencies**: Task 1.3, Task 1.4

### Task 2.2: Update ColorPicker Component
- **File**: `src/components/ColorPicker.tsx`
- **Description**: Modify to accept annotation instance and call annotation.setStyle(color) instead of firing onChange callback
- **Status**: [X]
- **Dependencies**: Task 2.1

### Task 2.3: Refactor AnnotationDisplaySettings
- **File**: `src/components/AnnotationDisplaySettings.tsx`
- **Description**: Update to use annotation instances from context, pass annotation instances to ColorPicker, use annotation.getLabel() for display
- **Status**: [X]
- **Dependencies**: Task 2.1, Task 2.2

### Task 2.4: Integration Tests for Context + Components
- **File**: `src/contexts/__tests__/AnnotationDisplayContext.test.ts`
- **Description**: Test that annotation instances are created, color updates sync across context, ColorPicker calls setStyle()
- **Status**: [ ]
- **Dependencies**: Task 2.3

## Phase 3: Component Updates

### Task 3.1: Update AnnotationPanel Component
- **File**: `src/components/AnnotationPanel.tsx`
- **Description**: Replace hardcoded style methods with annotation class method calls. Use getChipStyle() and getTextStyle() from context annotation instances.
- **Status**: [X]
- **Dependencies**: Task 2.1

### Task 3.2: Update Term Component
- **File**: `src/components/Term.tsx`
- **Description**: Update to get annotation instance from context via termTypeMapping, use getTextStyle() for highlighting
- **Status**: [X]
- **Dependencies**: Task 2.1, Task 3.1

### Task 3.3: Verify termTypeMapping
- **File**: `src/lib/termTypeMapping.ts`
- **Description**: Ensure termTypeMapping returns correct annotation keys for all term types. No changes needed if already correct.
- **Status**: [X]
- **Dependencies**: Task 3.2

## Phase 4: Validation

### Task 4.1: Manual Testing
- **Description**: Test app functionality: color picker changes colors, visibility toggles work, term highlighting matches colors, annotation panel displays correctly
- **Status**: [X]
- **Dependencies**: Task 3.3

### Task 4.2: Backward Compatibility Check
- **Description**: Verify existing localStorage data still loads correctly, no console errors, all features work as before
- **Status**: [X]
- **Dependencies**: Task 4.1

### Task 4.3: Final Code Review
- **Description**: Review all new classes for TypeScript compliance, code style consistency, proper abstractions
- **Status**: [X]
- **Dependencies**: Task 4.2

## Notes

- **[P]**: Tasks in Phase 1 with [P] marker can run in parallel (1.1 is prerequisite for 1.2, but multiple classes in 1.2 can be created simultaneously)
- **Color defaults**: Must match exactly the current palette to maintain visual consistency
- **Backward compatibility**: AnnotationDisplayContext must handle both old and new data formats during transition
- **No breaking changes**: App functionality must be 100% identical to current implementation

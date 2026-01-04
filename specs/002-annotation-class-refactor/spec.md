# Feature Specification: Annotation Class Refactoring

**Feature Branch**: `001-annotation-class-refactor`  
**Created**: January 4, 2026  
**Status**: Draft  
**Input**: User description: "refactoring the code to use class where it's revelent like annotations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Annotation Styling Across Components (Priority: P1)

As a developer maintaining the Spada Libreria codebase, I want annotation styling (colors, borders, labels) to be defined in a single place so that when I update an annotation's appearance, all components (ColorPicker, AnnotationPanel, Term highlighting, BolognesePlatform) automatically reflect the change without requiring modifications in multiple files.

**Why this priority**: This is the core architectural improvement that enables all other benefits. Without centralized annotation definitions, the codebase remains fragmented and difficult to maintain.

**Independent Test**: Can be fully tested by changing a single annotation's color in the class definition and verifying that all components (settings menu, annotation panel chips, glossary term highlighting) display the new color without any other code changes.

**Acceptance Scenarios**:

1. **Given** an annotation class (e.g., GuardsMentioned) with defined colors, **When** a developer changes the primary color in the class constructor, **Then** the color updates in the settings menu, annotation panel chips, and highlighted terms in the text
2. **Given** multiple components using the same annotation class, **When** visibility is toggled for that annotation type, **Then** all components respect the visibility setting
3. **Given** a new annotation type is needed, **When** a developer creates a new class extending Annotation, **Then** the annotation automatically works in all existing components without modifying component code

---

### User Story 2 - Type-Safe Annotation Configuration (Priority: P2)

As a developer, I want TypeScript to enforce that all annotation types have the required style properties (backgroundColor, color, borderColor, label, visibility) so that I cannot accidentally create incomplete annotations that would cause runtime errors.

**Why this priority**: Type safety prevents bugs during development but is secondary to the architectural benefits of centralization.

**Independent Test**: Can be tested by attempting to create an annotation class that omits a required property and verifying that TypeScript compilation fails with a clear error message.

**Acceptance Scenarios**:

1. **Given** the abstract Annotation class defines required properties, **When** a developer creates a subclass that omits a property, **Then** TypeScript shows a compilation error
2. **Given** components using annotation classes, **When** a developer tries to access a non-existent style property, **Then** TypeScript shows a compilation error at development time

---

### User Story 3 - Easy Addition of New Annotation Types for Testing (Priority: P3)

As a developer, I want to add a test annotation type (e.g., "TestAnnotation") by creating a single class to verify the architecture works correctly, without having to hunt through multiple files to add configuration, type definitions, and styling logic.

**Why this priority**: Extensibility testing validates the architecture but is not for production use. New annotation types will only be created for testing purposes, not as real features.

**Independent Test**: Can be tested by creating a test annotation type class and verifying it appears in the configuration menu and works in all components without modifying any existing files, then removing it after validation.

**Acceptance Scenarios**:

1. **Given** the class-based architecture is in place, **When** a developer creates a test annotation class, **Then** the annotation automatically appears in the configuration menu
2. **Given** the test annotation type has been added, **When** test terms of that type appear in the text, **Then** they are styled according to the class definition
3. **Given** the test annotation type exists, **When** viewing the annotation panel, **Then** test chips display with the correct styling

---

### Edge Cases

- **Long labels**: System must handle labels up to 25 characters (current max is "Stratégie / Contexte" at 20 chars). Labels exceeding 25 characters should be truncated with ellipsis.
- **Visibility behavior**: When an annotation is marked as visible=false, it only affects the annotation list display under chapter titles in BolognesePlatform. Terms in text content and annotation panel chips are not affected by visibility.
- **Duplicate colors**: Two different annotation types can have identical colors. The system must handle this gracefully without errors or confusion.

**Note**: Invalid color values are not possible as colors are only set through default values (validated at compile time) or the ColorPicker component (which only provides valid hex colors).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define an abstract `Annotation` base class with properties: chipStyle (CSSProperties object), textStyle (CSSProperties object), label, and visibility. Individual color fields (backgroundColor, color, borderColor, borderBottomColor) are replaced by these two style objects for better encapsulation.
- **FR-002**: System MUST provide concrete annotation classes for all current types: weapons, weapon_type, guards, techniques, measures, strategy, strikes, targets, note (9 types total)
- **FR-003**: Each annotation class MUST provide a `getChipStyle()` method that returns React CSS properties for chip display in the annotation panel
- **FR-004**: Each annotation class MUST provide a `getTextStyle()` method that returns React CSS properties for highlighted terms in text content
- **FR-005**: System MUST provide a `setStyle(colorValue: string)` method that updates both chipStyle and textStyle consistently when called from the configuration menu. This method MUST ensure that textStyle.color and chipStyle.color are identical, and automatically calculate chipStyle.backgroundColor, chipStyle.borderColor, and chipStyle.borderBottomColor using opacity variations of the provided color (e.g., rgba with 0.1 opacity for background, 0.2 for borders)
- **FR-006**: All components (ColorPicker, AnnotationPanel, Term, AnnotationDisplaySettings) MUST use annotation class instances instead of reading from the displayConfig object directly
- **FR-007**: System MUST maintain backward compatibility with existing localStorage data format during the transition
- **FR-008**: Annotation classes MUST use default colors matching the current palette (sky-600, amber-600, emerald-600, purple-600, indigo-600, red-600, pink-600, blue-600)
- **FR-009**: System MUST export a registry or factory function that provides instances of all annotation types for easy access across components
- **FR-010**: Changes to annotation class instances MUST be synchronized across all components that use them

### Key Entities

- **Annotation (Abstract Class)**: Base class representing an annotation type with styling properties and behavior. Key attributes: chipStyle (React.CSSProperties), textStyle (React.CSSProperties), label (string, max 25 chars), visibility (boolean). Methods: getChipStyle(), getTextStyle(), setStyle(colorValue), setLabel(), setVisibility(). The chipStyle object contains backgroundColor, color, borderColor, borderBottomColor. The textStyle object contains color and fontWeight. The setStyle() method is called by the configuration menu's color picker to update all color-related properties atomically, guaranteeing consistency between text and chip colors.
- **Concrete Annotation Classes**: Specific implementations (Weapons, WeaponType, Guards, Techniques, Measures, Strategy, Strikes, Targets, Note) that extend Annotation with default style objects and can customize styling logic in getChipStyle() and getTextStyle() methods.
- **AnnotationRegistry**: A centralized registry that manages instances of all annotation types and provides access to them by key (e.g., 'guards', 'strikes'). Exposes methods like getAnnotation(key), getAllAnnotations(), updateAnnotation(key, updates).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Changing an annotation color requires modification in only 1 location (the class definition) instead of 4+ locations (current implementation)
- **SC-002**: Adding a new annotation type requires creating 1 new class file instead of modifying 5+ existing files
- **SC-003**: TypeScript compilation fails when attempting to create an annotation without required properties
- **SC-004**: All existing functionality (color configuration, visibility toggling, term highlighting, chip display) continues to work identically to current implementation
- **SC-005**: Code duplication for annotation styling is reduced by at least 70% (measured by lines of code containing color/style definitions)
- **SC-006**: Time to add a new annotation type is reduced from ~30 minutes (current) to ~5 minutes (estimated)

## Scope & Boundaries

### In Scope

- Create abstract Annotation base class
- Implement concrete classes for all 9 current annotation types
- Create AnnotationRegistry for centralized access
- Refactor AnnotationDisplayContext to use annotation classes internally
- Update ColorPicker to work with annotation class instances
- Update AnnotationPanel to use annotation class methods for styling
- Update Term component to use annotation classes for term highlighting
- Update AnnotationDisplaySettings to work with annotation classes
- Maintain backward compatibility with existing localStorage format

### Out of Scope

- Changing the UI/UX of any components
- Adding new production annotation types (this refactor enables easy testing but does not add real annotation types beyond the current 9)
- Modifying the YAML data format for treatises or glossary
- Performance optimization (unless regressions are detected)
- Changes to how annotations are created/edited in the annotation panel
- Color validation logic (colors are guaranteed valid through defaults and ColorPicker)

## Assumptions

- The current color palette (9 distinct colors for annotation types) will remain unchanged
- All components currently using `displayConfig.colors` object can be refactored to use class instances without breaking functionality
- React components can efficiently re-render when annotation class instances are modified (via context updates)
- TypeScript's abstract class feature is sufficient for enforcing the required interface
- Default color values will match the current implementation exactly to maintain visual consistency
- Using chipStyle and textStyle objects (instead of individual color fields) provides better encapsulation and allows getChipStyle() and getTextStyle() to return these objects directly or with modifications
- Label length limit of 25 characters is sufficient for all current and future annotation types

## Dependencies

- Existing TypeScript setup (no new dependencies required)
- Current React Context API usage (AnnotationDisplayContext)
- Existing color system (hex colors, RGB conversion utilities)

## Implementation Notes

### Migration Strategy

1. Create annotation classes alongside existing implementation (no breaking changes)
2. Update AnnotationDisplayContext to internally create and manage annotation class instances
3. Gradually refactor components one at a time to use the new classes
4. Remove old implementation once all components are migrated
5. Add integration tests to verify color synchronization across components

### Class Design Pattern

The implementation follows the Template Method pattern where the abstract `Annotation` class defines the interface, and concrete subclasses provide specific implementations for `getChipStyle()` and `getTextStyle()` methods. This allows for future customization (e.g., Strikes might use bold font weight while Guards use italic) while maintaining a consistent interface.

### Simplified Architecture: Style Objects vs Individual Fields

**Decision**: Use `chipStyle` and `textStyle` as complete CSSProperties objects instead of individual color fields.

**Rationale**:

1. **Better encapsulation**: All chip styling (backgroundColor, color, borderColor, borderBottomColor) is contained in one object
2. **Simpler methods**: `getChipStyle()` can return the chipStyle object directly or with minimal modifications
3. **Flexibility**: Easy to add new style properties (fontWeight, fontSize, padding) without changing the class interface
4. **Less redundancy**: Eliminates the need to convert individual fields into style objects every time they're used

**Example Implementation**:

```typescript
abstract class Annotation {
  protected chipStyle: React.CSSProperties;
  protected textStyle: React.CSSProperties;
  protected label: string;
  protected visibility: boolean;
  
  // Methods can return styles directly or with modifications
  public getChipStyle(): React.CSSProperties {
    return this.chipStyle;
  }
  
  public getTextStyle(): React.CSSProperties {
    return this.textStyle;
  }
  
  // Called by color picker in configuration menu
  // Guarantees consistency between text.color and chip.color
  public setStyle(colorValue: string): void {
    const rgb = this.hexToRgb(colorValue);
    
    // Update text style (primary color only)
    this.textStyle = {
      ...this.textStyle,
      color: colorValue,
    };
    
    // Update chip style (color + calculated background/borders)
    this.chipStyle = {
      ...this.chipStyle,
      color: colorValue,
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
      borderBottomColor: colorValue,
    };
  }
  
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 99, g: 102, b: 241 }; // fallback to indigo
  }
}

class Guards extends Annotation {
  constructor() {
    super();
    this.chipStyle = {
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      color: '#059669',
      borderColor: '#a7f3d0',
      borderBottomColor: '#059669',
    };
    this.textStyle = {
      color: '#059669',
      fontWeight: '600',
    };
    this.label = 'Gardes mentionnées';
    this.visibility = true;
  }
  
  // Can override to add custom styling
  public getChipStyle(): React.CSSProperties {
    return { ...this.chipStyle, fontWeight: '500' };
  }
}
```

This architecture makes `getChipStyle()` and `getTextStyle()` effectively unique per annotation type while maintaining a consistent interface.

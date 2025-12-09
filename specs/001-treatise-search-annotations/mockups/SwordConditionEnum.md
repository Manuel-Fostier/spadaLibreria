# SwordConditionEnum Mockup

**Spec Reference**: FR-009 (Sword condition enum)  
**User Story**: US3 - Annotation Filtering & Enhancements  
**Task**: T005 [US3], T040 (implementation)  
**File**: Added to `src/components/AnnotationForm.tsx`

## Overview

The sword condition enum allows users to specify whether annotations apply to sharp or blunt weapons. This is a new field added to the Annotation entity in spec v2.0.

## Annotation Form with Sword Condition Field

```
╔════════════════════════════════════════════════════╗
║ ✏️ Edit Annotation                                ║
╟────────────────────────────────────────────────────╢
║                                                    ║
║ 📝 Note:                                           ║
║ ┌────────────────────────────────────────────────┐║
║ │ Classic forehand stroke executed at head level │║
║ │ Works well for tempo attacks and responses.   │║
║ └────────────────────────────────────────────────┘║
║                                                    ║
║ 🏷 Tags:                                           ║
║ [Forehand] [Tempo] [Offensive] [Add...]           ║
║                                                    ║
║ ⚔️ Sword Condition:  ← NEW FIELD (FR-009)         ║
║ ┌────────────────────────────────────────────────┐║
║ │ ◉ Sharp                                        │║
║ │ ◯ Blunt                                        │║
║ │ ◯ Unknown/Not Specified                        │║
║ └────────────────────────────────────────────────┘║
║                                                    ║
║ 🛡️ Weapons:                                       ║
║ [Spada] [Brocchiero] [Add...]                     ║
║                                                    ║
║ 🛡️ Guards Mentioned:                              ║
║ [Coda Longa] [Posta di Donna] [Add...]            ║
║                                                    ║
║ [Save] [Cancel]                                   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

## Field Positions

The sword condition field appears in the annotation form between "Tags" and "Weapons" sections:

```
Form Layout:
1. Note (text area)
2. Tags (chips)
3. ⚔️ Sword Condition (RADIO BUTTONS) ← NEW
4. Weapons (dropdowns)
5. Guards Mentioned (dropdowns)
6. Measures/Distance (dropdowns)
7. Strategy/Context (chips)
8. [Save] [Cancel] buttons
```

---

## Sword Condition Options

### Option 1: Sharp

```
◉ Sharp (Selected)
  └─ Used for combat techniques, real strikes
  └─ Example: Techniques with live blades
  └─ Applies to: spada vera, rapier, dagger
```

### Option 2: Blunt

```
◯ Blunt
  └─ Used for training, practice, safety
  └─ Example: Training drills with blunted tools
  └─ Applies to: spada smussata, practice swords
```

### Option 3: Unknown / Not Specified

```
◯ Unknown
  └─ Source doesn't specify, or unclear
  └─ Default if user doesn't select
  └─ Can be left unspecified if irrelevant
```

---

## Display in Chapter View

### Annotation Card with Condition

```
┌─────────────────────────────────┐
│ 💬 "Classic forehand stroke..." │
│                                 │
│ Tags: Forehand, Tempo, Offensive│
│ ⚔️  Condition: Sharp            │
│ Weapons: Spada, Brocchiero     │
│ Guards: Coda Longa              │
│                                 │
│ [Edit] [Delete]                 │
└─────────────────────────────────┘
```

### In Search Results

If annotation display is configured to show "Sword Condition" (FR-021 default):

```
Search result:
"...attacca con un mandritto in testa..."

Annotation badge:
⚔️ Condition: Sharp  |  🏷 Forehand, Tempo

(If multiple annotations on same chapter:
 ⚔️ Sharp (3 techniques)  |  ⚔️ Blunt (2 techniques))
```

---

## Technical Implementation

### Type Definition

```typescript
// In src/types/annotation.ts (updated from spec v2.0)

type SwordCondition = 'sharp' | 'blunt' | 'unknown' | null;

interface Annotation {
  id: string;
  chapterRef: ChapterReference;
  note?: string;
  tags: string[];
  weapons?: string[];
  guards_mentioned?: string[];
  techniques?: string[];
  measures?: string[];
  strategy?: string[];
  sword_condition: SwordCondition;  // ← NEW field (FR-009)
  created_at: string;
  updated_at: string;
}
```

### Form Component

```typescript
interface AnnotationFormProps {
  annotation?: Annotation;
  onSave: (annotation: Annotation) => void;
  onCancel: () => void;
}

function AnnotationForm({ annotation, onSave, onCancel }: AnnotationFormProps) {
  const [formData, setFormData] = useState({
    ...annotation,
    sword_condition: annotation?.sword_condition || 'unknown',
  });

  const handleConditionChange = (condition: SwordCondition) => {
    setFormData({ ...formData, sword_condition: condition });
  };

  return (
    <form>
      {/* ... other fields ... */}

      <fieldset>
        <legend>⚔️ Sword Condition</legend>
        <label>
          <input
            type="radio"
            value="sharp"
            checked={formData.sword_condition === 'sharp'}
            onChange={() => handleConditionChange('sharp')}
          />
          Sharp (combat techniques)
        </label>
        <label>
          <input
            type="radio"
            value="blunt"
            checked={formData.sword_condition === 'blunt'}
            onChange={() => handleConditionChange('blunt')}
          />
          Blunt (training/practice)
        </label>
        <label>
          <input
            type="radio"
            value="unknown"
            checked={formData.sword_condition === 'unknown'}
            onChange={() => handleConditionChange('unknown')}
          />
          Unknown / Not Specified
        </label>
      </fieldset>

      {/* ... save/cancel buttons ... */}
    </form>
  );
}
```

---

## Usage Examples

### Example 1: Sharp Condition

User annotates a technique from Marozzo's treatise:

```
Annotation:
- Note: "Executed with full force in combat"
- Sword Condition: ⚔️ Sharp
- Weapons: Spada vera
- Techniques: Attacco, Stoccata
```

This indicates the technique applies to **real combat** with **sharp blades**.

---

### Example 2: Blunt Condition

User annotates a training variant:

```
Annotation:
- Note: "Safe version for practice with beginners"
- Sword Condition: ⚔️ Blunt
- Weapons: Spada smussata (blunted practice sword)
- Techniques: Mandritto (in practice context)
- Strategy: Training, Solo practice
```

This indicates the technique is for **training** with **blunted tools**.

---

### Example 3: Unknown

```
Annotation:
- Note: "Text doesn't specify blade condition"
- Sword Condition: ◯ Unknown
- Weapons: Spada (generic)
```

Useful when the source material doesn't make it clear.

---

## Display Configuration (FR-021)

The sword condition field can be hidden/shown via the configuration menu:

```
Configuration Menu:
☑ Weapons: ON
☑ Sword Condition: ON (default)  ← Can toggle this
☐ Guards: OFF
...

If user unchecks "Sword Condition":
- Annotation form still has the field (for editing)
- But it won't display under chapter titles
- Still stored in the annotation data
```

---

## Performance Considerations

- Store as simple enum in annotation data
- No additional lookups needed
- Filtering by condition (future feature):
  ```typescript
  // Could add to TagFilter (T025)
  const sharpAnnotations = annotations.filter(a => a.sword_condition === 'sharp');
  ```

---

## Accessibility

- Radio buttons with clear labels
- Tooltip explaining each option
- Keyboard accessible: Tab to group, Arrow keys to select

---

## Related Mockups

- AnnotationPanel.md - Where annotation form appears
- AnnotationDisplay.md - Configuration menu (can toggle visibility)
- SearchResults.md - Shows condition in annotation badges

---

## Success Criteria (from spec v2.0)

✅ **FR-009**: Users can add annotations with sword condition enum (sharp/blunt)
✅ **SC-009**: Annotate chapter with 3 tags (including sword condition) in <30 seconds
✅ Data persisted in annotation entity with sword_condition field
✅ Integrated into form and chapter display

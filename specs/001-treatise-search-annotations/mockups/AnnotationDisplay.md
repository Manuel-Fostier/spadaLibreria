# AnnotationDisplay Configuration Menu Mockup

**Spec Reference**: FR-021 (Configuration menu)  
**User Story**: US3 - Annotation Filtering & Enhancements  
**Task**: T004 [US3], T041-T043 (implementation)  
**File**: `src/components/AnnotationDisplaySettings.tsx`

## Overview

The AnnotationDisplay configuration menu allows users to customize which annotation fields appear under chapter titles. This is separate from viewing individual annotations—it controls what's shown in the "summary" under each chapter heading.

## Full Configuration Menu

```
╔════════════════════════════════════════════════════╗
║ ⚙️ Annotation Display Configuration               ║
╟────────────────────────────────────────────────────╢
║                                                    ║
║ Show as chapter summary (below chapter title):    ║
║                                                    ║
║ ☑ 🔸 Weapons                                      ║
║   Example display: "spada, brocchiero"           ║
║                                                    ║
║ ☑ ⚔️ Sword Condition (sharp/blunt)               ║
║   Example display: "Sharp"                        ║
║                                                    ║
║ ☐ 🛡️ Guards Mentioned                            ║
║   Example display: "coda longa, posta donna"     ║
║                                                    ║
║ ☐ 🎯 Techniques                                   ║
║   Example display: "attacco, cambio"             ║
║                                                    ║
║ ☐ 📏 Measures/Distance                           ║
║   Example display: "passata, balestra"           ║
║                                                    ║
║ ☐ 📝 Note Preview (first 50 chars)               ║
║   Example display: "Classic forehand stroke at..." ║
║                                                    ║
║ ☐ 📚 Strategy/Context                            ║
║   Example display: "Counter attack, solo practice" ║
║                                                    ║
╟────────────────────────────────────────────────────╢
║ Show annotations:                                 ║
║ ◉ Show all annotations  ◯ Hide summaries          ║
║                                                    ║
║ [Reset to Default] [Apply Changes] [Close]       ║
║                                                    ║
╚════════════════════════════════════════════════════╝

Default Configuration (Factory Reset):
✓ Weapons: ON
✓ Sword Condition: ON
✗ All others: OFF

This is stored in AnnotationDisplayContext and persisted to localStorage.
```

## How It Appears in Chapter View

### Before Configuration (Default)

```
┌─────────────────────────────────────────┐
│ Marozzo Opera Nova, Book 1, Chapter 3  │
│                                         │
│ Weapons: spada, brocchiero              │
│ Condition: Sharp                        │
│                                         │
│ [Chapter text starts here...]           │
│ "...guardia di coda..."                │
└─────────────────────────────────────────┘
```

### After User Customizes (Example)

User selects:
- ✓ Weapons
- ☐ Sword Condition (unchecked)
- ☐ Guards Mentioned
- ✓ Techniques
- ☐ Measures
- ✓ Note Preview

Result:
```
┌─────────────────────────────────────────┐
│ Marozzo Opera Nova, Book 1, Chapter 3  │
│                                         │
│ Weapons: spada, brocchiero              │
│ Techniques: attacco, cambio, parry      │
│ Note: "Classic forehand stroke in..."  │
│                                         │
│ [Chapter text starts here...]           │
│ "...guardia di coda..."                │
└─────────────────────────────────────────┘
```

---

## Interactive Behavior

### Opening the Menu

```
User clicks [⚙️ Config] button in annotation panel
  ↓
Menu modal/sidebar appears (overlay or side panel)
  ↓
Current settings displayed with checkboxes
  ↓
Examples shown for each field
  ↓
User can check/uncheck any field
```

### Saving Changes

```
User clicks [Apply Changes]
  ↓
Configuration saved to AnnotationDisplayContext
  ↓
localStorage updated
  ↓
ALL chapters refresh with new display settings
  ↓
Modal closes
  ↓
User sees chapter view with updated fields
```

### Reset to Default

```
User clicks [Reset to Default]
  ↓
Confirmation: "Reset to default configuration?"
  ↓
Checkboxes reset to:
  ✓ Weapons: ON
  ✓ Sword Condition: ON
  ✗ Others: OFF
  ↓
User clicks [Apply] to confirm
```

---

## Field Descriptions

Each field has an example of what it shows:

| Field | Default | Example Display |
|-------|---------|-----------------|
| **Weapons** | ✓ ON | `spada, brocchiero, pugnale` |
| **Sword Condition** | ✓ ON | `Sharp` or `Blunt` or `Unknown` |
| **Guards** | ✗ OFF | `coda longa, posta di donna` |
| **Techniques** | ✗ OFF | `attacco, cambio, parry, counter` |
| **Measures** | ✗ OFF | `passata, balestra, stoccata` |
| **Note Preview** | ✗ OFF | `"Classic forehand stroke at head level..."` (first 50 chars) |
| **Strategy** | ✗ OFF | `Counter attack, Solo practice, Dueling` |

---

## Technical Notes

### Props

```typescript
interface AnnotationDisplaySettingsProps {
  onClose?: () => void;
  onSave?: (config: AnnotationDisplayConfig) => void;
}
```

### Configuration Type

```typescript
interface AnnotationDisplayConfig {
  showWeapons: boolean;           // Default: true
  showSwordCondition: boolean;    // Default: true (NEW FR-021)
  showGuards: boolean;            // Default: false
  showTechniques: boolean;        // Default: false
  showMeasures: boolean;          // Default: false
  showNotePreview: boolean;       // Default: false
  showStrategy: boolean;          // Default: false
}
```

### localStorage Structure

```typescript
// Key: 'annotationDisplay' (in localStorage)
{
  "version": "1.0",
  "config": {
    "showWeapons": true,
    "showSwordCondition": true,
    "showGuards": false,
    "showTechniques": false,
    "showMeasures": false,
    "showNotePreview": false,
    "showStrategy": false
  },
  "savedAt": "2025-12-09T15:30:00Z"
}
```

### Global Context Usage

```typescript
// AnnotationDisplayContext (T020 in Phase 2)
const { displayConfig, updateDisplayConfig } = useAnnotationDisplay();

// In any chapter component
const shouldShowWeapons = displayConfig.showWeapons;  // true
const shouldShowCondition = displayConfig.showSwordCondition;  // true
const shouldShowGuards = displayConfig.showGuards;  // false

// Render conditionally
{shouldShowWeapons && <div>Weapons: {weapons}</div>}
{shouldShowCondition && <div>Condition: {swordCondition}</div>}
```

---

## Styling

```css
.annotation-config-modal {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.config-section {
  margin-bottom: 20px;
}

.config-checkbox {
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.config-checkbox:hover {
  background-color: #f9fafb;
}

.config-checkbox input[type="checkbox"] {
  margin-top: 4px;
  cursor: pointer;
}

.config-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.config-example {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin-top: 4px;
}

.config-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
```

---

## Accessibility

- All checkboxes have associated labels
- Keyboard navigation: Tab through options, Space to toggle
- Screen reader: "Weapons configuration option, unchecked"
- Color contrast meets WCAG AA standards

---

## Related Mockups

- AnnotationPanel.md (T003) - Where config button appears
- SearchResults.md (T002) - Shows configured fields in summaries

---

## Success Criteria

✅ **FR-021**: Configuration menu for 7 annotation display fields
✅ **FR-009**: Sword condition included in configuration (default ON)
✅ Configuration persists across sessions (localStorage)
✅ Changes apply immediately to all chapters

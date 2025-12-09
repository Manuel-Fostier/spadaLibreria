# AnnotationPanel Component Mockup

**Spec Reference**: FR-012 (Default open), FR-012a (Button highlighting), FR-012b (Smart scrolling)  
**User Story**: US3 - Annotation Filtering & Enhancements  
**Task**: T003 [US3], T037-T039 (implementation)  
**File**: `src/components/AnnotationPanel.tsx` (modified)

## Overview

The AnnotationPanel component displays annotations for the current chapter. New features in spec v2.0:
1. **Opens by default** when viewing a chapter (FR-012)
2. **Button is highlighted** when panel is open (FR-012a)
3. **Smart scrolling** - panel points to viewport center paragraph (FR-012b, <100ms latency SC-012)

## Wireframe ASCII

```
Main View (Left: Chapter, Right: Annotation Panel):

┌─────────────────────────────┬──────────────────────────────────┐
│  🔙 Marozzo Book 1, Ch 3   │ 📌 Annotations (3)               │
│                             │                                  │
│  Chapter text...            │ 🟢 Current paragraph:            │
│  "...guardia di coda..."    │ ┌──────────────────────────────┐│
│  ►HIGHLIGHTED◄ (reads here) │ │ "...attacca con un mandritto│ │
│  "...in testa..."           │ │  in testa..."                │ │
│  "...spada davanti..."      │ │                              │ │
│  ┌────────────────────┐     │ │ 🏷 Tags: beginner, solo      │ │
│  │ [← Prev] [Next →]  │     │ │ 💭 Note: Classic forehand... │ │
│  │ Page 2 of 5        │     │ │ ⚔️ Weapon: spada             │ │
│  └────────────────────┘     │ │ ⚔️ Condition: sharp          │ │
│                             │ │ [Edit] [Delete]              │ │
│                             │ └──────────────────────────────┘│
│                             │                                  │
│                             │ 📖 Other annotations in chapter: │
│                             │ ┌──────────────────────────────┐│
│                             │ │ ► "...parassa..."            │ │
│                             │ │   🏷 Tag: guardia_change      │ │
│                             │ │ ► "...spada lato sinistro..." │ │
│                             │ │   🏷 Tag: footwork            │ │
│                             │ └──────────────────────────────┘│
│                             │                                  │
│                             │ [➕ Add annotation]             │
│                             │ [⚙️ Config] [💾 Save] [×]      │
│                             │                                  │
└─────────────────────────────┴──────────────────────────────────┘

Button State:
[📌 Annotations] ← Highlighted in blue when panel is OPEN
 ^
 └─ Active button indicator (color change + icon emphasis)
```

## Component States

### 1. Default Open State (FR-012)

When user loads a chapter, annotation panel is **open by default**:

```
┌──────────────────────────────────┐
│ 📌 Annotations (Panel Open)      │◄── Button is HIGHLIGHTED
│                                  │    (different color/style)
│ 🟢 Current Paragraph:            │
│ ┌────────────────────────────┐  │
│ │ "...attacca con un        │  │
│ │  mandritto in testa..."   │  │
│ │                            │  │
│ │ 🏷 Tags: beginner, solo    │  │
│ │ 💭 Note: Classic forehand  │  │
│ │ ⚔️ Weapon: spada           │  │
│ │ ⚔️ Condition: sharp        │  │
│ │ [Edit] [Delete]            │  │
│ └────────────────────────────┘  │
│                                  │
│ [➕ Add] [⚙️ Config] [×Close]   │
└──────────────────────────────────┘
```

**Behavior**:
- Panel appears automatically on chapter load
- Does NOT require user to click button
- Button is visually highlighted to show panel is active
- User can click [×Close] to collapse if preferred

---

### 2. Button Highlighting State (FR-012a)

```
When panel is OPEN (Default state):
╔════════════════════╗
║ [📌 ANNOTATIONS] ◄─╫─── Button highlighted
║                   █║   Color: blue background, white icon
║  [Panel showing]  █║   Style: Solid background
║                   █║   Indicates: "Panel is active"
╚════════════════════╝

When panel is CLOSED:
╔════════════════════╗
║ [📌 Annotations] ◄─┼─── Button not highlighted
║                   │    Color: gray background, darker icon
║  (Panel hidden)   │    Style: Transparent/outline only
║                   │    Indicates: "Panel is inactive, click to open"
╚════════════════════╝

Visual Comparison:
ACTIVE:   [📌 ANNOTATIONS] ← Bright blue bg, white text
INACTIVE: [📌 Annotations] ← Gray/transparent, dark text
```

---

### 3. Smart Scrolling State (FR-012b, SC-012)

As user **scrolls the chapter text**, the panel **automatically highlights the paragraph at the viewport center**:

```
User scrolls chapter:

┌────────────────────────┬──────────────────────────┐
│ Page 2:                │ 📌 Annotations           │
│                        │                          │
│ "...guardia di coda..." │ 🟢 Currently centered:  │
│                        │ ┌────────────────────┐  │
│ ►HIGHLIGHTED◄          │ │ "...attacca con un │  │
│ "...attacca con..."    │ │  mandritto in testa│  │
│ "...in testa..."       │ │ ..." (Para 1)      │  │
│                        │ │                    │  │
│ Scroll down...         │ │ 📖 Other:          │  │
│                        │ │ ► Para 2           │  │
│ "...spada davanti..."  │ │ ► Para 3           │  │
│ "...corpo sinistro..." │ │ ► Para 4 (scrolled)│  │
│ ►NEXT SECTION◄         │ │                    │  │
│                        │ └────────────────────┘  │
│                        │                          │
└────────────────────────┴──────────────────────────┘

After more scrolling:

┌────────────────────────┬──────────────────────────┐
│ Page 3:                │ 📌 Annotations           │
│ "...corpo sinistro..." │                          │
│                        │ 🟢 Currently centered:  │
│ ►HIGHLIGHTED◄          │ ┌────────────────────┐  │
│ "...spada davanti..." │ │ "...corpo sinistro"│  │
│ "...la postura..."    │ │ ...la postura..."  │  │
│                        │ │ (Para 4)           │  │
│                        │ │                    │  │
│ "...guarda il dito..." │ │ 📖 Other:          │  │
│ ►FURTHER SCROLL◄       │ │ ► Para 3           │  │
│                        │ │ ► Para 5           │  │
│                        │ │ ► Para 6           │  │
│                        │ │                    │  │
│                        │ └────────────────────┘  │
│                        │                          │
└────────────────────────┴──────────────────────────┘

Performance: <100ms latency (SC-012)
- User scrolls chapter
- Intersection Observer detects viewport center
- Panel updates within 100ms
- No jank, smooth animation
```

**Technical Implementation**:
- Use Intersection Observer API to detect paragraphs in viewport
- Calculate which paragraph is at viewport center (50% visible)
- Update panel display <100ms after scroll stops
- Smooth transition (CSS: `transition: all 200ms ease-in-out`)

---

### 4. Add Annotation Form (with Sword Condition)

```
┌──────────────────────────────────┐
│ ➕ Add New Annotation            │
├──────────────────────────────────┤
│                                  │
│ 📝 Note (optional):              │
│ ┌────────────────────────────┐  │
│ │ Classic forehand stroke at│  │
│ │ the head. Guard changes   │  │
│ │ when opponent parries.    │  │
│ └────────────────────────────┘  │
│                                  │
│ 🏷 Tags:                         │
│ [Beginner] [Solo] [Footwork] [×]│
│ [Add tag...] ↵                   │
│                                  │
│ ⚔️ Weapons:                      │
│ [Spada] [Brocchiero]             │
│ [Add...] ▼                       │
│                                  │
│ ⚔️ Sword Condition:              │
│ ◯ Sharp  ◉ Blunt  ◯ Unknown     │ ◄─ NEW FR-009
│                                  │
│ 🛡️ Guards Mentioned:             │
│ [Coda Longa] [Posta Donna]       │
│ [Add...] ▼                       │
│                                  │
│ 📏 Measures/Distance:            │
│ [Passata] [Balestra]             │
│ [Add...] ▼                       │
│                                  │
│ 📚 Strategy Notes (optional):    │
│ [Counter] [Provocation] [Tempo]  │
│ [Add...] ▼                       │
│                                  │
│ [Save Annotation] [Cancel]       │
│                                  │
└──────────────────────────────────┘
```

**Sword Condition Field (FR-009)**:
- New enum field: `sharp | blunt | unknown`
- Three radio button options
- Used to distinguish training vs. combat scenarios
- Stored in annotation.sword_condition field
- Displayed in annotation display (default shown)

---

### 5. Panel Configuration State

When user clicks **[⚙️ Config]**:

```
┌──────────────────────────────────┐
│ ⚙️ Annotation Display Config     │
├──────────────────────────────────┤
│                                  │
│ Show under chapter title:        │
│ ☑ Weapons                         │
│ ☑ Sword Condition                │ ◄─ NEW FR-021
│ ☐ Guards Mentioned               │
│ ☐ Techniques                      │
│ ☐ Measures/Distance              │
│ ☐ Note Preview (50 chars)        │
│ ☐ Strategy Tags                  │
│                                  │
│ Display options:                 │
│ ◉ Show annotations    ◯ Hide all │
│                                  │
│ [Apply] [Reset to Default]       │
│                                  │
└──────────────────────────────────┘

Default configuration (FR-021):
✓ Weapons: ENABLED
✓ Sword Condition: ENABLED
✗ All others: DISABLED by default
```

**Behavior**:
- Opens as modal or side panel
- Configuration persists to localStorage (AnnotationDisplayContext)
- Applies to ALL chapters immediately
- User can customize which fields appear under chapter titles
- Separate from individual annotation viewing

---

## Layout Variations

### Full-width Chapter View (Mobile/Tablet)

```
┌─────────────────────────────────┐
│ 🔙 Marozzo Book 1, Ch 3        │
│ [📌 Annotations ▼] [⚙️] [×]    │
├─────────────────────────────────┤
│ Chapter text...                 │
│ "...guardia di coda..."        │
│ "...attacca con un..."         │
│ (readable full width)          │
├─────────────────────────────────┤
│ 📌 Annotations Panel (collapsed)│
│ [Tap to expand] [×]             │
└─────────────────────────────────┘

Or expanded:
┌─────────────────────────────────┐
│ 📌 Annotations                  │
│                                 │
│ 🟢 Current:                     │
│ "...attacca con..."            │
│ 🏷 beginner, solo               │
│ ⚔️ Sharp spada                  │
│ 💭 Classic forehand stroke      │
│ [Edit] [Delete]                 │
│                                 │
│ 📖 Others:                      │
│ ► Para 2                        │
│ ► Para 3                        │
│                                 │
│ [➕ Add] [⚙️] [Close]           │
└─────────────────────────────────┘
```

---

## Interaction Flows

### User Flow 1: Default Open

```
1. User clicks chapter to view
2. Chapter loads, AnnotationPanel opens automatically (FR-012)
3. Panel button is highlighted in blue (FR-012a)
4. Panel shows annotations for current paragraph
5. User can:
   - Scroll chapter → Panel updates to show centered paragraph (FR-012b)
   - Click [Edit] → Edit existing annotation
   - Click [➕ Add] → Add new annotation with sword condition (FR-009)
   - Click [⚙️ Config] → Customize display fields (FR-021)
   - Click [×] → Close panel
```

### User Flow 2: Smart Scrolling

```
1. Panel is open showing paragraph 1
2. User scrolls chapter down slowly
3. Intersection Observer detects scroll
4. When paragraph 3 is at viewport center:
   - Panel updates to show paragraph 3 annotations
   - Smooth transition (<100ms, SC-012)
   - User sees panel content change as they read
5. User clicks [Edit] to annotate current paragraph
6. Form pre-fills with empty fields for this paragraph
```

### User Flow 3: Configure Display Fields

```
1. User clicks [⚙️ Config] button
2. Configuration menu opens
3. Current settings shown: ☑ Weapons, ☑ Sword Condition, ☐ Guards, etc.
4. User unchecks "Sword Condition"
5. Checks "Note Preview (50 chars)"
6. Clicks [Apply]
7. All chapters now show: Weapons + Note Preview (not Sword Condition)
8. Configuration saved to localStorage
9. Persists across sessions
```

---

## Technical Implementation

### Props

```typescript
interface AnnotationPanelProps {
  chapter: ChapterReference;
  isOpen?: boolean;  // Default: true (FR-012 - opens by default)
  onToggle?: (open: boolean) => void;
  onAnnotationChange?: () => void;  // Refresh when annotation added/edited
}
```

### Smart Scrolling Implementation (FR-012b)

```typescript
import { useEffect, useState, useRef } from 'react';

// In AnnotationPanel component
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Create Intersection Observer to track viewport center
  const options = {
    root: containerRef.current,  // Chapter container
    threshold: [0, 0.25, 0.5, 0.75, 1.0],  // Fire at these visibility %
  };

  const observer = new IntersectionObserver((entries) => {
    // Find paragraph closest to viewport center (50%)
    let centerParagraph = entries.find(e => {
      const rect = e.boundingClientRect;
      const viewportCenter = window.innerHeight / 2;
      return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
    });

    if (centerParagraph) {
      const paragraphId = centerParagraph.target.id;
      // Update panel to show annotations for this paragraph
      // Must complete within 100ms (SC-012)
      updatePanelForParagraph(paragraphId);
    }
  }, options);

  // Observe all paragraphs in chapter
  document.querySelectorAll('p[data-paragraph-id]').forEach(p => {
    observer.observe(p);
  });

  return () => observer.disconnect();
}, [chapter]);
```

### Button Highlighting (FR-012a)

```typescript
// SearchContext or AnnotationPanel state
const [isAnnotationPanelOpen, setIsAnnotationPanelOpen] = useState(true);

// In button rendering
<button
  className={isAnnotationPanelOpen
    ? 'bg-blue-600 text-white'  // Highlighted (open)
    : 'bg-gray-200 text-gray-700'  // Not highlighted (closed)
  }
  onClick={() => setIsAnnotationPanelOpen(!isAnnotationPanelOpen)}
>
  📌 Annotations
</button>
```

### Configuration Persistence (FR-021)

```typescript
// AnnotationDisplayContext manages which fields are visible
const { displayConfig, updateDisplayConfig } = useAnnotationDisplay();

// Save to localStorage
useEffect(() => {
  localStorage.setItem(
    'annotationDisplay',
    JSON.stringify(displayConfig)
  );
}, [displayConfig]);

// displayConfig structure:
{
  showNote: true,
  showWeapons: true,
  showGuards: false,
  showTechniques: false,
  showSwordCondition: true,  // NEW default: true (FR-021)
  showMeasures: false,
  showStrategy: false,
}
```

---

## Styling

```css
.annotation-panel {
  background: white;
  border-left: 1px solid #e5e7eb;
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}

.annotation-button.active {
  background-color: #2563eb;  /* Blue */
  color: white;
  font-weight: 600;
}

.annotation-button.inactive {
  background-color: #f3f4f6;  /* Gray */
  color: #374151;
}

.current-paragraph {
  background: #ecfdf5;  /* Light green */
  border: 2px solid #10b981;  /* Green */
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.sword-condition {
  display: flex;
  gap: 16px;
  margin: 8px 0;
}

.sword-condition input[type="radio"] {
  margin-right: 4px;
}
```

---

## Accessibility

- ARIA labels: `aria-label="Annotation panel"`, `aria-expanded="true/false"`
- Keyboard: Tab to panel controls, Enter to edit, Escape to close
- Screen reader: Announce current paragraph when it changes
- Color contrast: All backgrounds/text meet WCAG AA standard

---

## Related Mockups

- SearchResults.md (T022) - Results panel that triggers annotation opening
- AnnotationDisplay.md (T004) - Configuration menu interface
- SwordConditionEnum.md (T005) - Sword condition field details

---

## Success Criteria (from spec.md v2.0)

✅ **FR-012**: Annotation panel opens by default on chapter load
✅ **FR-012a**: Button highlighted when panel is open
✅ **FR-012b (SC-012)**: Smart scrolling tracks viewport center with <100ms latency
✅ **FR-009**: Sword condition enum (sharp/blunt) in annotation form
✅ **FR-021**: Configuration menu for annotation display fields
✅ **SC-009**: Annotate chapter with 3 tags (including sword condition) in <30 seconds
